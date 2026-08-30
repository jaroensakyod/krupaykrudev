"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/material-icon";

type Option = { code: string; nameTh: string };

/** TASK-065: filters — sidebar บน desktop, collapsible panel บนมือถือ (PRD §84) */
export function SearchFilters({
  q,
  subjects,
  grades,
  types,
  subjectCode,
  gradeCode,
  typeCode,
}: {
  q: string;
  subjects: Option[];
  grades: Option[];
  types: Option[];
  subjectCode?: string;
  gradeCode?: string;
  typeCode?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* ปุ่มเปิดตัวกรอง — มือถือเท่านั้น */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm font-medium shadow-sm"
      >
        <MaterialIcon name="tune" className="text-lg" />
        ตัวกรอง{subjectCode || gradeCode || typeCode ? " (เปิดใช้อยู่)" : ""}
        <MaterialIcon name={open ? "expand_less" : "expand_more"} className="text-lg" />
      </button>

      <aside className={`space-y-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${open ? "block" : "hidden"} lg:block`}>
        <form action="/search" className="space-y-5">
          <input defaultValue={q} name="q" type="hidden" />
          <div>
            <p className="text-sm font-bold mb-2">กลุ่มสาระ</p>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              defaultValue={subjectCode ?? ""}
              name="subject"
            >
              <option value="">ทั้งหมด</option>
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.nameTh}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">ระดับชั้น</p>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              defaultValue={gradeCode ?? ""}
              name="grade"
            >
              <option value="">ทั้งหมด</option>
              {grades.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.nameTh}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">ประเภทสื่อ</p>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"
              defaultValue={typeCode ?? ""}
              name="type"
            >
              <option value="">ทั้งหมด</option>
              {types.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.nameTh}
                </option>
              ))}
            </select>
          </div>
          <button
            className="w-full bg-primary text-white text-sm font-medium py-3 rounded-lg hover:bg-primary-dark"
            type="submit"
          >
            ใช้ตัวกรอง
          </button>
        </form>
      </aside>
    </div>
  );
}
