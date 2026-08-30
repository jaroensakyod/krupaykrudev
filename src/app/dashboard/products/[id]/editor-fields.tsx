"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/components/material-icon";
import { saveDraftAction } from "../actions";

type Option = { id: number; name: string; code?: string };
type TopicOption = { id: number; name: string; subjectId: number };

type AiMetadataResult = {
  suggestedTitle: string;
  description: string;
  shortDescription: string;
  subjectCode: string;
  gradeCode: string;
  productTypeCode: string;
  tags: string[];
  learningObjectives?: string[];
  confidence: number;
  cached?: boolean;
};

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
    topicId: number | null;
    examId: number | null;
  };
  options: {
    productTypes: Option[];
    subjects: Option[];
    grades: Array<Option & { group: string | null }>;
    curricula: Option[];
    topics: TopicOption[];
    exams: Option[];
  };
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveDraftAction, {} as { error?: string; saved?: boolean });
  const [subjectId, setSubjectId] = useState(product.subjectId);

  // TASK-049: AI assistance — เติมฟอร์มแล้วให้ Creator ตรวจสอบ/แก้ไขเอง (PRD §19)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiMetadataResult | null>(null);
  const [seoResult, setSeoResult] = useState<{
    seoTitle: string;
    metaDescription: string;
    keywords: string[];
    confidence: number;
  } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const dirtyRef = useRef(false);
  // §87: auto-save draft ทุก 60 วินาทีเมื่อมีการแก้ไข
  useEffect(() => {
    if (disabled) return;
    const timer = setInterval(() => {
      if (dirtyRef.current && formRef.current) {
        dirtyRef.current = false;
        formRef.current.requestSubmit();
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [disabled]);

  const titleRef = useRef<HTMLInputElement>(null);
  const shortRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const subjectRef = useRef<HTMLSelectElement>(null);
  const gradeRef = useRef<HTMLSelectElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);

  async function runAi(task: "METADATA" | "SEO") {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setSeoResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, task }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(aiErrorText(String(data.error)));
        return;
      }
      if (task === "METADATA") {
        setAiResult(data as AiMetadataResult);
        // เติมฟอร์ม — Creator แก้ไขต่อได้ทุกช่อง
        if (titleRef.current) titleRef.current.value = data.suggestedTitle ?? titleRef.current.value;
        if (shortRef.current) shortRef.current.value = data.shortDescription ?? "";
        if (descRef.current) descRef.current.value = data.description ?? "";
        const subjectId = options.subjects.find((s) => s.code === data.subjectCode)?.id;
        if (subjectId && subjectRef.current) subjectRef.current.value = String(subjectId);
        const gradeId = options.grades.find((g) => g.code === data.gradeCode)?.id;
        if (gradeId && gradeRef.current) gradeRef.current.value = String(gradeId);
        const typeId = options.productTypes.find((t) => t.code === data.productTypeCode)?.id;
        if (typeId && typeRef.current) typeRef.current.value = String(typeId);
        if (tagsRef.current && Array.isArray(data.tags) && data.tags.length) {
          tagsRef.current.value = data.tags.join(", ");
        }
      } else {
        setSeoResult(data);
      }
    } catch {
      setAiError("เรียก AI ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setAiLoading(false);
    }
  }

  const gradeGroups = [...new Set(options.grades.map((g) => g.group ?? "อื่น ๆ"))];

  return (
    <div className="space-y-6">
      {/* AI Assistance */}
      {!disabled && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <MaterialIcon name="auto_awesome" className="text-primary" filled />
              <span className="font-headline font-bold text-sm">AI ช่วยกรอกข้อมูล</span>
              <span className="text-xs text-text-muted">(AI แนะนำได้ คุณตัดสินใจ)</span>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-primary-dark disabled:opacity-60"
                disabled={aiLoading}
                onClick={() => void runAi("METADATA")}
                type="button"
              >
                {aiLoading ? "กำลังวิเคราะห์..." : "ให้ AI กรอกจากไฟล์"}
              </button>
              <button
                className="border border-primary text-primary text-xs font-medium px-4 py-2 rounded-full hover:bg-primary-50 disabled:opacity-60"
                disabled={aiLoading}
                onClick={() => void runAi("SEO")}
                type="button"
              >
                คำแนะนำ SEO
              </button>
            </div>
          </div>
          {aiError && <p className="mt-3 text-xs text-red-700 bg-red-50 rounded px-3 py-2">{aiError}</p>}
          {aiResult && (
            <div className="mt-3 text-xs bg-white rounded-lg p-3 border border-primary-100">
              <span className="text-green-700">
                ✓ AI กรอกให้แล้ว — ตรวจสอบทุกช่องก่อนบันทึก (ความมั่นใจ {Math.round(aiResult.confidence * 100)}%
                {aiResult.cached ? " · จากแคช" : ""})
              </span>
              {aiResult.learningObjectives?.length ? (
                <p className="mt-1 text-text-muted">จุดประสงค์การเรียนรู้ที่ AI เห็น: {aiResult.learningObjectives.join(" · ")}</p>
              ) : null}
            </div>
          )}
          {seoResult && (
            <div className="mt-3 text-xs bg-white rounded-lg p-3 border border-primary-100 space-y-1">
              <p className="text-green-700">คำแนะนำ SEO (ความมั่นใจ {Math.round(seoResult.confidence * 100)}%)</p>
              <p><b>Title:</b> {seoResult.seoTitle}</p>
              <p><b>Meta:</b> {seoResult.metaDescription}</p>
              <p><b>Keywords:</b> {seoResult.keywords.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      <form
        action={formAction}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6"
        onChange={() => {
          dirtyRef.current = true;
        }}
        ref={formRef}
      >
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
            ref={titleRef}
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
            ref={shortRef}
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
            ref={descRef}
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
              ref={typeRef}
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
              disabled={disabled}
              id="subjectId"
              name="subjectId"
              onChange={(e) => setSubjectId(Number(e.target.value))}
              ref={subjectRef}
              value={subjectId}
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
              ref={gradeRef}
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
            ref={tagsRef}
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
    </div>
  );
}

function aiErrorText(code: string): string {
  switch (code) {
    case "QUOTA_EXCEEDED":
      return "คุณใช้โควตา AI รายวันครบแล้ว (30 ครั้ง/วัน) — ลองใหม่พรุ่งนี้";
    case "BUDGET_EXCEEDED":
      return "ระบบถึงงบ AI รายวัน — ลองใหม่ภายหลัง";
    case "AI_DISABLED":
      return "ระบบ AI ยังไม่เปิดใช้งาน";
    case "VALIDATION_FAILED":
      return "AI ตอบไม่อยู่ในรูปแบบที่ระบบรองรับ กรุณาลองใหม่";
    default:
      return "เรียก AI ไม่สำเร็จ กรุณาลองใหม่";
  }
}
