import { z } from "zod";

/**
 * TASK-044/045/046: V1 AI tasks (PRD §24 — เปิดเฉพาะที่จำเป็น)
 * TASK-048: ทุก output ผ่าน zod validation — ไม่เชื่อ output ดิบจาก AI
 * AI ไม่ใช่ source of truth — Creator ต้อง confirm/edit เสมอ (PRD §19)
 */

export const PROMPT_VERSION = "1.0";

const TAXONOMY_HINT = `ระบบ taxonomy ของเว็บ (ใช้ code ตรงตามนี้เท่านั้น):
- productType codes: WORKSHEET(ใบงาน/แบบฝึกหัด), EXAM(ข้อสอบ), ANSWER_KEY(เฉลย), LESSON_PLAN(แผนการสอน), PRESENTATION(สไลด์/PPT), FLASHCARD(บัตรคำ), ACTIVITY(กิจกรรม), GAME(เกมการสอน), POSTER(โปสเตอร์), INFOGRAPHIC, TEMPLATE, PRINTABLE, TEACHING_KIT(ชุดการสอน), DIGITAL_RESOURCE, OTHER
- subject codes: MATH, SCIENCE, THAI, ENGLISH, SOCIAL, HEALTH_PE, ART, CAREER, COMPUTER, ACTIVITY
- grade codes: PRE_K, K, P1-P6, M1-M6, VOC, UNI, NFE, PD_TEACHER`;

export const METADATA_TASK = {
  taskType: "PRODUCT_METADATA" as const,
  schema: z.object({
    suggestedTitle: z.string().max(200),
    description: z.string().max(5000),
    shortDescription: z.string().max(200),
    subjectCode: z.string(),
    gradeCode: z.string(),
    productTypeCode: z.string(),
    tags: z.array(z.string()).max(12),
    learningObjectives: z.array(z.string()).max(6),
    confidence: z.number().min(0).max(1),
  }),
  responseSchema: {
    type: "object",
    properties: {
      suggestedTitle: { type: "string" },
      description: { type: "string" },
      shortDescription: { type: "string" },
      subjectCode: { type: "string", enum: ["MATH", "SCIENCE", "THAI", "ENGLISH", "SOCIAL", "HEALTH_PE", "ART", "CAREER", "COMPUTER", "ACTIVITY", "OTHER"] },
      gradeCode: { type: "string", enum: ["PRE_K", "K", "P1", "P2", "P3", "P4", "P5", "P6", "M1", "M2", "M3", "M4", "M5", "M6", "VOC", "UNI", "NFE", "PD_TEACHER", "OTHER"] },
      productTypeCode: { type: "string", enum: ["WORKSHEET", "EXAM", "ANSWER_KEY", "LESSON_PLAN", "PRESENTATION", "FLASHCARD", "ACTIVITY", "GAME", "POSTER", "INFOGRAPHIC", "TEMPLATE", "PRINTABLE", "TEACHING_KIT", "DIGITAL_RESOURCE", "OTHER"] },
      tags: { type: "array", items: { type: "string" } },
      learningObjectives: { type: "array", items: { type: "string" } },
      confidence: { type: "number" },
    },
    required: ["suggestedTitle", "description", "shortDescription", "subjectCode", "gradeCode", "productTypeCode", "tags", "confidence"],
  },
  systemPrompt: `คุณเป็นผู้ช่วยจัดข้อมูลสื่อการสอนสำหรับ marketplace ครูไทย "ครูเปย์ครู KruPayKru"
วิเคราะห์ไฟล์/ชื่อไฟล์/ข้อมูลที่ให้มา แล้วตอบเป็น JSON ตาม schema เท่านั้น
- ชื่อ-คำอธิบายใช้ภาษาไทยธรรมชาติ ใส่คำค้นหาไว้ต้นชื่อ (เช่น "ใบงาน เรื่อง X ม.3")
- ห้ามเดาหรือแต่งข้อมูลที่ไม่มีในไฟล์ — ถ้าไม่แน่ใจให้ confidence ต่ำและใช้ค่าที่ปลอดภัย
- ราคาไม่ใช่หน้าที่คุณ ห้ามเสนอราคา
${TAXONOMY_HINT}`,
  userPrompt: (ctx: { filename: string; existingTitle: string; existingDescription: string }) =>
    `ไฟล์: ${ctx.filename}\nชื่อสินค้าปัจจุบัน: ${ctx.existingTitle || "(ไม่มี)"}\nคำอธิบายปัจจุบัน: ${ctx.existingDescription || "(ไม่มี)"}\n\nวิเคราะห์และเสนอข้อมูลสินค้า (แนบไฟล์ให้ถ้ามี)`,
};

export const SEO_TASK = {
  taskType: "PRODUCT_SEO" as const,
  schema: z.object({
    seoTitle: z.string().max(70),
    metaDescription: z.string().max(160),
    keywords: z.array(z.string()).max(10),
    suggestedSlug: z.string().max(80),
    confidence: z.number().min(0).max(1),
  }),
  responseSchema: {
    type: "object",
    properties: {
      seoTitle: { type: "string" },
      metaDescription: { type: "string" },
      keywords: { type: "array", items: { type: "string" } },
      suggestedSlug: { type: "string" },
      confidence: { type: "number" },
    },
    required: ["seoTitle", "metaDescription", "keywords", "suggestedSlug", "confidence"],
  },
  systemPrompt: `คุณเป็นผู้ช่วย SEO สำหรับ marketplace สื่อการสอนไทย
สร้าง SEO title (≤70 ตัวอักษร), meta description (≤160 ตัวอักษร), keywords ภาษาไทย, และ slug จากข้อมูลสินค้า
- ห้ามอ้างสิทธิ์/คำโฆษณาเกินจริงที่ไม่มีในข้อมูลสินค้า (PRD §20)
- slug: ภาษาอังกฤษเล็ก/ตัวเลข/ขีด หรือทับศัพท์
ตอบเป็น JSON ตาม schema เท่านั้น`,
  userPrompt: (ctx: { title: string; description: string; subject: string; grade: string }) =>
    `สินค้า: ${ctx.title}\nคำอธิบาย: ${ctx.description.slice(0, 800)}\nวิชา: ${ctx.subject} | ระดับชั้น: ${ctx.grade}`,
};

export const QUALITY_TASK = {
  taskType: "PRODUCT_QUALITY" as const,
  schema: z.object({
    score: z.number().min(0).max(100),
    warnings: z.array(z.string()).max(8),
    recommendations: z.array(z.string()).max(6),
    confidence: z.number().min(0).max(1),
  }),
  responseSchema: {
    type: "object",
    properties: {
      score: { type: "number" },
      warnings: { type: "array", items: { type: "string" } },
      recommendations: { type: "array", items: { type: "string" } },
      confidence: { type: "number" },
    },
    required: ["score", "warnings", "recommendations", "confidence"],
  },
  systemPrompt: `คุณเป็นผู้ช่วยตรวจคุณภาพสื่อการสอนเบื้องต้น
ตรวจ: metadata ครบไหม, ชื่อ/เนื้อหาตรงกันไหม, ขาด preview ไหม, ปัญหาคุณภาพชัดเจน
- score 0-100 เป็น "สัญญาณ" ไม่ใช่คำตัดสิน moderation (PRD §21)
- ห้ามแต่งปัญหาที่ไม่มีหลักฐาน
ตอบเป็น JSON ตาม schema เท่านั้น`,
  userPrompt: (ctx: { title: string; description: string; hasFiles: boolean; fileNames: string; price: string }) =>
    `ชื่อ: ${ctx.title}\nคำอธิบาย: ${ctx.description.slice(0, 600) || "(ไม่มี)"}\nมีไฟล์: ${ctx.hasFiles} (${ctx.fileNames})\nราคา: ${ctx.price}`,
};

export type AiTaskDef<T = z.ZodTypeAny> = {
  taskType: "PRODUCT_METADATA" | "PRODUCT_SEO" | "PRODUCT_QUALITY";
  schema: T;
  responseSchema: object;
  systemPrompt: string;
  userPrompt: (ctx: never) => string;
};

export const AI_TASKS = { METADATA: METADATA_TASK, SEO: SEO_TASK, QUALITY: QUALITY_TASK };
