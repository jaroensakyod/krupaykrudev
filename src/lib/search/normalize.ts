/**
 * TASK-064: Thai search normalization (PRD §28)
 * ม.3 / ม3 / มัธยม 3 / มัธยมศึกษาปีที่ 3 → canonical grade M3
 * Synonym dictionary แยกจาก UI — เพิ่มได้ที่นี่ (และผ่าน Admin ภายหลัง)
 */

const GRADE_PATTERNS: Array<[RegExp, string]> = [
  [/เตรียม(?:อนุบาล|อนุ์)/, "PRE_K"],
  [/อนุบาล/, "K"],
  [/ม\.?\s*([1-6])|มัธยม(?:ศึกษาปีที่)?\s*([1-6])/, "M$"],
  [/ป\.?\s*([1-6])|ประถม(?:ศึกษาปีที่)?\s*([1-6])/, "P$"],
  [/ปวช\.?|ปวส\.?|อาชีวะ/, "VOC"],
  [/มหาวิทยาลัย|มหา'ลัย|ปริญญา/, "UNI"],
  [/กศน\.?/, "NFE"],
  [/pd[\s-]?ครู|พัฒนาครู/, "PD_TEACHER"],
];

const SUBJECT_PATTERNS: Array<[RegExp, string]> = [
  [/คณิต(?:ศาสตร์)?|เลข/, "MATH"],
  [/วิทย์|วิทยา(?:ศาสตร์)?/, "SCIENCE"],
  [/ภาษาไทย|ไทย/, "THAI"],
  [/อังกฤษ|english/i, "ENGLISH"],
  [/สังคม/, "SOCIAL"],
  [/คอมพิวเตอร์|คอม|โค้ด|coding/i, "COMPUTER"],
  [/ศิลปะ|วาดเขียน/, "ART"],
  [/สุขศึกษา|พลศึกษา|กีฬา/, "HEALTH_PE"],
  [/การงานอาชีพ|อาชีพ/, "CAREER"],
];

export type NormalizedQuery = {
  /** query ดิบสำหรับ full-text match (PRD §28: ต้องเก็บ raw ไว้ด้วย) */
  text: string;
  /** คำค้นหลังตัด token ที่ถูกแปลงเป็น filter ออก — ใช้สำหรับ text search */
  cleanedText: string;
  gradeCode?: string;
  subjectCode?: string;
};

export function normalizeQuery(raw: string): NormalizedQuery {
  const q = raw.trim();
  if (!q) return { text: "", cleanedText: "" };

  let gradeCode: string | undefined;
  for (const [pattern, code] of GRADE_PATTERNS) {
    const m = q.match(pattern);
    if (m) {
      if (code === "M$" || code === "P$") {
        const digit = m[1] ?? m[2];
        if (digit) gradeCode = code.replace("$", digit);
      } else {
        gradeCode = code;
      }
      break;
    }
  }

  let subjectCode: string | undefined;
  for (const [pattern, code] of SUBJECT_PATTERNS) {
    if (pattern.test(q)) {
      subjectCode = code;
      break;
    }
  }

  // ตัด token ที่ถูกแปลงเป็น filter ออกจากคำค้น เพื่อไม่ให้ text match พลาด
  let cleaned = q;
  if (gradeCode) {
    for (const [pattern, code] of GRADE_PATTERNS) {
      if (code === gradeCode || (code === "M$" && gradeCode.startsWith("M")) || (code === "P$" && gradeCode.startsWith("P"))) {
        cleaned = cleaned.replace(new RegExp(pattern.source, "gu"), " ");
        break;
      }
    }
  }
  if (subjectCode) {
    const [pattern] = SUBJECT_PATTERNS.find(([, code]) => code === subjectCode)!;
    cleaned = cleaned.replace(new RegExp(pattern.source, "gu"), " ");
  }
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();

  return { text: q, cleanedText: cleaned, gradeCode, subjectCode };
}
