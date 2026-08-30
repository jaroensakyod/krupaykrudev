"use client";

import { useActionState } from "react";
import { MaterialIcon } from "@/components/material-icon";
import { saveDraftAction } from "../actions";

type Option = { id: number; name: string };

export function EditorFields({
  product,
  options,
  disabled,
}: {
  product: {
    id: string;
    title: string;
    shortDescription: string;
    description: string;
    productTypeId: number;
    subjectId: number;
    primaryGradeId: number;
    curriculumId: number | null;
    price: number;
    tags: string;
  };
  options: {
    productTypes: Option[];
    subjects: Option[];
    grades: Array<Option & { group: string | null }>;
    curricula: Option[];
  };
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveDraftAction, {} as { error?: string; saved?: boolean });

  const gradeGroups = [...new Set(options.grades.map((g) => g.group ?? "อื่น ๆ"))];

  return (
    <form action={formAction} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
      <input name="productId" type="hidden" value={product.id} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.saved && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-1.5">
          <MaterialIcon name="check_circle" className="text-base" /> บันทึกแล้ว
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="title">
          ชื่อสื่อ *
        </label>
        <input
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          defaultValue={product.title}
          disabled={disabled}
          id="title"
          maxLength={200}
          name="title"
          required
          type="text"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="shortDescription">
          คำโปรยสั้น
        </label>
        <input
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          defaultValue={product.shortDescription}
          disabled={disabled}
          id="shortDescription"
          maxLength={200}
          name="shortDescription"
          placeholder="สรุปสั้น ๆ ว่าสื่อนี้รวมอะไรบ้าง (แสดงบนการ์ดสินค้า)"
          type="text"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="description">
          รายละเอียดสินค้า
        </label>
        <textarea
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          defaultValue={product.description}
          disabled={disabled}
          id="description"
          name="description"
          placeholder="อธิบายเนื้อหา จำนวนหน้า สิ่งที่รวมอยู่ และวิธีใช้งาน"
          rows={6}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1" htmlFor="productTypeId">
            ประเภทสื่อ *
          </label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            defaultValue={product.productTypeId}
            disabled={disabled}
            id="productTypeId"
            name="productTypeId"
          >
            {options.productTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1" htmlFor="subjectId">
            กลุ่มสาระ *
          </label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            defaultValue={product.subjectId}
            disabled={disabled}
            id="subjectId"
            name="subjectId"
          >
            {options.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1" htmlFor="primaryGradeId">
            ระดับชั้น *
          </label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            defaultValue={product.primaryGradeId}
            disabled={disabled}
            id="primaryGradeId"
            name="primaryGradeId"
          >
            {gradeGroups.map((group) => (
              <optgroup key={group} label={group}>
                {options.grades
                  .filter((g) => (g.group ?? "อื่น ๆ") === group)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1" htmlFor="curriculumId">
            หลักสูตร
          </label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            defaultValue={product.curriculumId ?? ""}
            disabled={disabled}
            id="curriculumId"
            name="curriculumId"
          >
            <option value="">— ไม่ระบุ —</option>
            {options.curricula.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1" htmlFor="price">
            ราคา (บาท) * — ใส่ 0 หากต้องการแจกฟรี
          </label>
          <input
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
            defaultValue={product.price}
            disabled={disabled}
            id="price"
            min={0}
            name="price"
            required
            step="0.01"
            type="number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1" htmlFor="tagsInput">
          แท็ก (คั่นด้วยเครื่องหมาย ,)
        </label>
        <input
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          defaultValue={product.tags}
          disabled={disabled}
          id="tagsInput"
          name="tagsInput"
          placeholder="เช่น ฟิสิกส์, แรง, ม.3, พร้อมเฉลย"
          type="text"
        />
      </div>

      {!disabled && (
        <button
          className="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "กำลังบันทึก..." : "บันทึกฉบับร่าง"}
        </button>
      )}
    </form>
  );
}
