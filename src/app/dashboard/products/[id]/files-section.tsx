"use client";

import { useRef, useState } from "react";
import { MaterialIcon } from "@/components/material-icon";

type FileRow = {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  fileRole: string;
  hasPreview: boolean;
};

const ROLES: Array<{ value: string; label: string; hint: string }> = [
  { value: "ORIGINAL", label: "ไฟล์สื่อหลัก", hint: "ไฟล์ที่ผู้ซื้อจะได้รับ" },
  { value: "BONUS", label: "ของแถม", hint: "ไฟล์เสริมให้ผู้ซื้อ" },
  { value: "ANSWER", label: "เฉลย", hint: "ไฟล์เฉลยแยกจากไฟล์หลัก" },
  { value: "SUPPORTING", label: "สื่อประกอบ", hint: "คู่มือ/ไฟล์ประกอบอื่น ๆ" },
  { value: "COVER", label: "ปกสินค้า", hint: "รูปปกแสดงบนหน้าร้าน" },
];

const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FilesSection({
  productId,
  initialFiles,
  disabled,
}: {
  productId: string;
  initialFiles: FileRow[];
  disabled: boolean;
}) {
  const [files, setFiles] = useState<FileRow[]>(initialFiles);
  const [role, setRole] = useState("ORIGINAL");
  const [uploading, setUploading] = useState<{ name: string; percent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSelect(file: File) {
    setError(null);
    setUploading({ name: file.name, percent: 0 });
    try {
      // 1) ขอ ticket อัปโหลด
      const res = await fetch("/api/files/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          role,
        }),
      });
      const ticket = await res.json();
      if (!res.ok) throw new Error(ticket.error ?? "UPLOAD_FAILED");

      // 2) PUT ตรงเข้า storage พร้อม progress
      const uploadUrl =
        ticket.driver === "local"
          ? `${ticket.uploadUrl}?key=${encodeURIComponent(ticket.key)}&contentType=${encodeURIComponent(file.type)}&token=${encodeURIComponent(ticket.token)}`
          : ticket.uploadUrl;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploading({ name: file.name, percent: Math.round((e.loaded / e.total) * 100) });
          }
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("PUT_FAILED")));
        xhr.onerror = () => reject(new Error("PUT_FAILED"));
        xhr.send(file);
      });

      // 3) confirm → server ตรวจไฟล์ + hash + สร้าง preview
      const confirmRes = await fetch("/api/files/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          key: ticket.key,
          filename: ticket.filename ?? file.name,
          mimeType: file.type,
          role,
        }),
      });
      const confirmed = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmed.error ?? "CONFIRM_FAILED");

      setFiles((prev) => [
        ...prev,
        {
          id: confirmed.fileId,
          originalFilename: ticket.filename ?? file.name,
          mimeType: file.type,
          fileSize: file.size,
          fileRole: role,
          hasPreview: Boolean(confirmed.preview),
        },
      ]);
    } catch (e) {
      setError(mapError(String(e)));
    } finally {
      setUploading(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(fileId: string) {
    if (!confirm("ลบไฟล์นี้?")) return;
    const res = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
      <h2 className="font-headline font-bold text-lg mb-1">ไฟล์สื่อและปก</h2>
      <p className="text-xs text-text-muted mb-4">
        ไฟล์ต้นฉบับเก็บแบบ private — ผู้ซื้อโหลดผ่านลิงก์ที่ปลอดภัยเท่านั้น · รองรับ PDF, PNG, JPG, WEBP, ZIP, PPTX, DOCX (≤ 100MB)
      </p>

      {!disabled && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label} — {r.hint}
              </option>
            ))}
          </select>
          <label className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer transition-colors">
            <MaterialIcon name="upload_file" className="text-base align-middle mr-1" />
            เลือกไฟล์
            <input
              ref={inputRef}
              className="hidden"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.zip,.pptx,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleSelect(f);
              }}
            />
          </label>
          {uploading && (
            <div className="flex-1 min-w-40">
              <p className="text-xs text-text-muted mb-1 truncate">
                กำลังอัปโหลด {uploading.name} — {uploading.percent}%
              </p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${uploading.percent}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {files.length === 0 ? (
        <p className="text-sm text-text-muted bg-gray-50 rounded-lg p-6 text-center">
          ยังไม่มีไฟล์ — เลือกประเภทไฟล์แล้วกด &quot;เลือกไฟล์&quot;
        </p>
      ) : (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              {f.hasPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/files/${f.id}/preview`}
                  alt={f.originalFilename}
                  className="w-12 h-12 object-cover rounded border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 rounded border border-gray-200 bg-white flex items-center justify-center">
                  <MaterialIcon name="description" className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.originalFilename}</p>
                <p className="text-xs text-text-muted">
                  {ROLE_LABEL[f.fileRole] ?? f.fileRole} · {formatSize(f.fileSize)}
                </p>
              </div>
              <a
                href={`/api/files/${f.id}/download`}
                className="text-primary text-sm hover:underline whitespace-nowrap"
              >
                โหลด
              </a>
              {!disabled && (
                <button
                  type="button"
                  className="text-danger text-sm hover:underline"
                  onClick={() => void handleDelete(f.id)}
                >
                  ลบ
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function mapError(code: string): string {
  switch (code) {
    case "BAD_MIME":
      return "ประเภทไฟล์ไม่รองรับ (PDF, PNG, JPG, WEBP, ZIP, PPTX, DOCX เท่านั้น)";
    case "TOO_LARGE":
      return "ไฟล์ใหญ่เกิน 100MB";
    case "UPLOAD_INCOMPLETE":
      return "อัปโหลดไม่สมบูรณ์ กรุณาลองใหม่";
    case "PUT_FAILED":
      return "อัปโหลดล้มเหลว กรุณาลองใหม่";
    default:
      return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  }
}
