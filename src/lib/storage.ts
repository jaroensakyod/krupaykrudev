import { createHmac, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "./logger";

/**
 * Storage abstraction (PRD §79: S3-compatible object storage).
 * - R2 driver เมื่อตั้งค่า R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY
 * - Local driver สำหรับ dev เท่านั้น (เก็บใน .storage/ — ห้ามใช้ production)
 */

const ROOT = path.join(process.cwd(), ".storage");
const DRIVER = process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY ? "r2" : "local";

export const STORAGE_DRIVER = DRIVER;

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

function tokenFor(key: string, contentType: string, exp: number): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "dev")
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
  | { driver: "local"; key: string; uploadUrl: string; token: string };

export const storage = {
  driver: DRIVER,

  /** Presigned direct upload (client → storage, ไม่ผ่าน app server) */
  async presignUpload(key: string, contentType: string): Promise<UploadTicket> {
    if (DRIVER === "r2") {
      const cmd = new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, ContentType: contentType });
      const uploadUrl = await getSignedUrl(s3(), cmd, { expiresIn: 600 });
      return { driver: "r2", key, uploadUrl };
    }
    const exp = Math.floor(Date.now() / 1000) + 600;
    return {
      driver: "local",
      key,
      uploadUrl: `/api/files/local-upload`,
      token: `${exp}:${tokenFor(key, contentType, exp)}`,
    };
  },

  async putBuffer(key: string, buffer: Buffer, contentType: string): Promise<void> {
    if (DRIVER === "r2") {
      await s3().send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Body: buffer, ContentType: contentType }));
      return;
    }
    const full = path.join(ROOT, key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, buffer);
  },

  async getBuffer(key: string): Promise<Buffer | null> {
    if (DRIVER === "r2") {
      try {
        const res = await s3().send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
        return Buffer.from(await res.Body!.transformToByteArray());
      } catch (e) {
        logger.warn("storage_get_failed", { key, error: String(e).slice(0, 120) });
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
    if (DRIVER === "r2") {
      try {
        const res = await s3().send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
        return { size: res.ContentLength ?? 0, contentType: res.ContentType };
      } catch {
        return null;
      }
    }
    try {
      const buf = await readFile(path.join(ROOT, key));
      return { size: buf.length };
    } catch {
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    if (DRIVER === "r2") {
      await s3().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
      return;
    }
    await rm(path.join(ROOT, key), { force: true });
  },

  /** Signed download URL (r2) — local ใช้ stream ผ่าน route แทน */
  async presignDownload(key: string): Promise<string | null> {
    if (DRIVER === "r2") {
      return getSignedUrl(
        s3(),
        new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }),
        { expiresIn: 300 },
      );
    }
    return null;
  },
};
