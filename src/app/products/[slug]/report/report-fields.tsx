"use client";

import { useActionState } from "react";
import { reportProductAction } from "./actions";

const REASONS = [
  ["COPYRIGHT", "ละเมิดลิขสิทธิ์"],
  ["MISLEADING", "ข้อมูลหลอกลวง"],
  ["BROKEN_FILE", "ไฟล์เสีย"],
  ["INAPPROPRIATE", "เนื้อหาไม่เหมาะสม"],
  ["SPAM", "สแแปม"],
  ["DUPLICATE", "สินค้าซ้ำ"],
  ["OTHER", "อื่น ๆ"],
] as const;

export function ReportFields({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(reportProductAction, {});

  if (state.sent) {
    return (
      <p className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
        ได้รับรายงานแล้ว — ทีมงานจะตรวจสอบภายใน 1-2 วันทำการ ขอบคุณที่ช่วยดูแลชุมชน
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <input name="productId" type="hidden" value={productId} />
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        name="reason"
        required
      >
        {REASONS.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        name="description"
        placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
        rows={2}
        maxLength={1000}
      />
      <button
        className="border border-danger text-danger text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-50"
        disabled={pending}
        type="submit"
      >
        ส่งรายงาน
      </button>
    </form>
  );
}
