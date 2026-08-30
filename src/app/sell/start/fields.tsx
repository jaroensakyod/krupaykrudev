"use client";

import { useActionState } from "react";
import { becomeCreatorAction, type BecomeCreatorState } from "./actions";

const initialState: BecomeCreatorState = {};

const SUBJECT_OPTIONS = [
  "คณิตศาสตร์",
  "วิทยาศาสตร์",
  "ภาษาไทย",
  "ภาษาอังกฤษ",
  "สังคมศึกษา",
  "คอมพิวเตอร์",
  "ศิลปะ",
  "สุขศึกษา/พลศึกษา",
  "กิจกรรมพัฒนาผู้เรียน",
];

export function BecomeCreatorFields({ defaultDisplayName }: { defaultDisplayName: string }) {
  const [state, formAction, pending] = useActionState(becomeCreatorAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="displayName">
          ชื่อร้านค้า *
        </label>
        <input
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          defaultValue={defaultDisplayName}
          id="displayName"
          name="displayName"
          placeholder="เช่น ครูใจดี สื่อประถม"
          required
          type="text"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="slug">
          URL ร้านค้า (ภาษาอังกฤษเท่านั้น) *
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-colors">
          <span className="px-3 py-2.5 bg-gray-50 text-sm text-text-muted whitespace-nowrap">
            krupaykru.com/creator/
          </span>
          <input
            className="flex-1 px-2 py-2.5 text-sm focus:outline-none"
            id="slug"
            name="slug"
            pattern="[a-z0-9][a-z0-9-]{2,39}"
            placeholder="krujaidee"
            required
            type="text"
          />
        </div>
        <p className="mt-1 text-xs text-text-muted">
          ใช้ตัวอังกฤษเล็ก ตัวเลข และขีด (-) เท่านั้น — จะไม่สามารถเปลี่ยนได้ในภายหลัง
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="bio">
          แนะนำร้านค้า
        </label>
        <textarea
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          id="bio"
          maxLength={500}
          name="bio"
          placeholder="เล่าเกี่ยวกับตัวคุณ ประสบการณ์สอน และสื่อที่คุณสร้าง"
          rows={3}
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-text-main mb-2">วิชาที่คุณสร้างสื่อ (เลือกได้หลายวิชา)</p>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_OPTIONS.map((subject) => (
            <label
              key={subject}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-sm cursor-pointer hover:border-primary has-checked:border-primary has-checked:bg-primary-50 transition-colors"
            >
              <input className="h-3.5 w-3.5 text-primary" name="subjects" type="checkbox" value={subject} />
              {subject}
            </label>
          ))}
        </div>
      </div>

      {/* Creator Terms */}
      <div className="flex items-start pt-2 border-t border-gray-100">
        <div className="flex items-center h-5 pt-1">
          <input
            className="w-4 h-4 text-primary bg-white border-gray-300 rounded"
            id="terms"
            name="terms"
            required
            type="checkbox"
          />
        </div>
        <div className="ml-3 text-xs text-text-muted leading-tight pt-1">
          <label htmlFor="terms">
            ฉันยอมรับ{" "}
            <a className="text-primary hover:underline font-medium" href="/terms">
              ข้อกำหนดสำหรับผู้ขาย
            </a>{" "}
            รับรองว่าเป็นเจ้าของลิขสิทธิ์สื่อที่จะขาย และยอมรับนโยบายการตรวจสอบเนื้อหาของ KruPayKru
          </label>
        </div>
      </div>

      <button
        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "กำลังเปิดร้าน..." : "เปิดร้านค้า"}
      </button>
    </form>
  );
}
