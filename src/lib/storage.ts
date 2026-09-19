import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "./logger";

/**
 * Storage abstraction (PRD §79: S3-compatible object storage).
 * 3 drivers เลือกอัตโนมัติ:
 * - "r2"    : S3 API (Access Key ID/Secret) — presigned direct upload/download (แนะนำ production)
 * - "r2api" : Cloudflare Account API token (cfat_) — upload ผ่าน signed app route, object เก็บบน R2 จริง
 * - "local" : dev fallback เก็บใน .storage/ (ห้ามใช้ production)
 */

const ROOT = path.join(process.cwd(), ".storage");

export type Driver = "r2" | "r2api" | "local";

export const STORAGE_DRIVER: Driver =
  process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
    ? "r2"
    : process.env.R2_API_TOKEN && process.env.R2_ACCOUNT_ID
      ? "r2api"
      : "local";

function s3() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_BUCKET) {
    throw new Error("R2_ENDPOINT/R2_BUCKET missing");
  }
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function cfApiBase() {
  return `https://api.cloudflare.com/client/v4/accounts/${process.env.R2_ACCOUNT_ID}/r2/buckets/${process.env.R2_BUCKET}/objects`;
}

function cfHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${process.env.R2_API_TOKEN}` };
}

function tokenFor(key: string, contentType: string, exp: number): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET missing/too short");
  return createHmac("sha256", secret)
    .update(`${key}:${contentType}:${exp}`)
    .digest("hex");
}

export function verifyLocalToken(key: string, contentType: string, exp: number, token: string): boolean {
  const expected = Buffer.from(tokenFor(key, contentType, exp));
  const given = Buffer.from(token);
  return exp > Math.floor(Date.now() / 1000) && expected.length === given.length && timingSafeEqual(expected, given);
}

export type UploadTicket =
  | { driver: "r2"; key: string; uploadUrl: string }
  | { driver: "r2api" | "local"; key: string; uploadUrl: string; token: string };

export const storage = {
  driver: STORAGE_DRIVER,

  /** Presigned direct upload (client → storage ตรง ๆ สำหรับ r2; ผ่าน signed app route สำหรับ r2api/local) */
  async presignUpload(key: string, contentType: string): Promise<UploadTicket> {
    if (STORAGE_DRIVER === "r2") {
      const cmd = new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: contentType });
      const uploadUrl = await getSignedUrl(s3(), cmd, { expiresIn: 600 });
      return { driver: "r2", key, uploadUrl };
    }
    const exp = Math.floor(Date.now() / 1000) + 600;
    return {
      driver: STORAGE_DRIVER,
      key,
      uploadUrl: STORAGE_DRIVER === "r2api" ? "/api/files/r2api-upload" : "/api/files/local-upload",
      token: `${exp}:${tokenFor(key, contentType, exp)}`,
    };
  },

  async putBuffer(key: string, buffer: Buffer, contentType: string): Promise<void> {
    if (STORAGE_DRIVER === "r2") {
      await s3().send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Body: buffer, ContentType: contentType }));
      return;
    }
    if (STORAGE_DRIVER === "r2api") {
      const res = await fetch(`${cfApiBase()}/${key}`, {
        method: "PUT",
        headers: { ...cfHeaders(), "Content-Type": contentType },
        body: new Uint8Array(buffer),
      });
      if (!res.ok) {
        logger.error("r2api_put_failed", { key, status: res.status, body: (await res.text()).slice(0, 200) });
        throw new Error("R2API_PUT_FAILED");
      }
      return;
    }
    const full = path.join(ROOT, key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, buffer);
  },

  async getBuffer(key: string): Promise<Buffer | null> {
    if (STORAGE_DRIVER === "r2") {
      try {
        const res = await s3().send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
        return Buffer.from(await res.Body!.transformToByteArray());
      } catch (e) {
        logger.warn("storage_get_failed", { key, error: String(e).slice(0, 120) });
        return null;
      }
    }
    if (STORAGE_DRIVER === "r2api") {
      try {
        const res = await fetch(`${cfApiBase()}/${key}`, { headers: cfHeaders() });
        if (!res.ok) return null;
        return Buffer.from(await res.arrayBuffer());
      } catch {
        return null;
      }
    }
    try {
      return await readFile(path.join(ROOT, key));
    } catch {
      return null;
    }
  },

  async head(key: string): Promise<{ size: number; contentType?: string } | null> {
    if (STORAGE_DRIVER === "r2") {
      try {
        const res = await s3().send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
        return { size: res.ContentLength ?? 0, contentType: res.ContentType };
      } catch {
        return null;
      }
    }
    const buf = await this.getBuffer(key);
    return buf ? { size: buf.length } : null;
  },

  async delete(key: string): Promise<void> {
    if (STORAGE_DRIVER === "r2") {
      await s3().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
      return;
    }
    if (STORAGE_DRIVER === "r2api") {
      await fetch(`${cfApiBase()}/${key}`, { method: "DELETE", headers: cfHeaders() });
      return;
    }
    await rm(path.join(ROOT, key), { force: true });
  },

  /** Signed download URL (r2 เท่านั้น) — driver อื่นใช้ stream ผ่าน route */
  async presignDownload(key: string): Promise<string | null> {
    if (STORAGE_DRIVER === "r2") {
      return getSignedUrl(
        s3(),
        new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }),
        { expiresIn: 300 },
      );
    }
    return null;
  },
};
