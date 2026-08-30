/**
 * Seed taxonomy — ข้อมูลหมวดหมู่ไทย (แก้ไข/เพิ่มเติมได้ผ่าน Admin ภายหลัง)
 * Run: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** บัญชีแอดมินเริ่มต้นสำหรับ dev — เปลี่ยนรหัสผ่านก่อน production */
const ADMIN_EMAIL = "admin@krupay.dev";
const ADMIN_PASSWORD = "Admin12345!";

const PRODUCT_TYPES: Array<[string, string]> = [
  ["WORKSHEET", "ใบงาน/แบบฝึกหัด"],
  ["EXAM", "ข้อสอบ"],
  ["ANSWER_KEY", "เฉลย"],
  ["LESSON_PLAN", "แผนการสอน"],
  ["PRESENTATION", "สไลด์/PowerPoint"],
  ["FLASHCARD", "บัตรคำ/Flashcard"],
  ["ACTIVITY", "กิจกรรม"],
  ["GAME", "เกมการสอน"],
  ["POSTER", "โปสเตอร์"],
  ["INFOGRAPHIC", "อินโฟกราฟิก"],
  ["TEMPLATE", "เทมเพลต"],
  ["PRINTABLE", "สื่อพิมพ์"],
  ["TEACHING_KIT", "ชุดการสอน"],
  ["DIGITAL_RESOURCE", "สื่อดิจิทัล"],
  ["OTHER", "อื่น ๆ"],
];

const SUBJECTS: Array<[string, string]> = [
  ["MATH", "คณิตศาสตร์"],
  ["SCIENCE", "วิทยาศาสตร์"],
  ["THAI", "ภาษาไทย"],
  ["ENGLISH", "ภาษาอังกฤษ"],
  ["SOCIAL", "สังคมศึกษา ศาสนา และวัฒนธรรม"],
  ["HEALTH_PE", "สุขศึกษาและพลศึกษา"],
  ["ART", "ศิลปะ"],
  ["CAREER", "การงานอาชีพ"],
  ["COMPUTER", "วิทยาการคำนวณ/คอมพิวเตอร์"],
  ["ACTIVITY", "กิจกรรมพัฒนาผู้เรียน"],
];

const GRADES: Array<[string, string, string]> = [
  ["PRE_K", "เตรียมอนุบาล", "ปฐมวัย"],
  ["K", "อนุบาล", "ปฐมวัย"],
  ["P1", "ป.1", "ประถม"],
  ["P2", "ป.2", "ประถม"],
  ["P3", "ป.3", "ประถม"],
  ["P4", "ป.4", "ประถม"],
  ["P5", "ป.5", "ประถม"],
  ["P6", "ป.6", "ประถม"],
  ["M1", "ม.1", "มัธยมต้น"],
  ["M2", "ม.2", "มัธยมต้น"],
  ["M3", "ม.3", "มัธยมต้น"],
  ["M4", "ม.4", "มัธยมปลาย"],
  ["M5", "ม.5", "มัธยมปลาย"],
  ["M6", "ม.6", "มัธยมปลาย"],
  ["VOC", "ปวช./ปวส.", "อาชีวะ"],
  ["UNI", "มหาวิทยาลัย", "อุดมศึกษา"],
  ["NFE", "กศน.", "การศึกษานอกระบบ"],
  ["PD_TEACHER", "PD ครู", "พัฒนาครู"],
];

const CURRICULA: Array<[string, string]> = [
  ["CORE_2560", "หลักสูตรแกนกลาง 2551 (ฉบับปรับปรุง 2560)"],
  ["BASIC_2551", "หลักสูตรแกนกลาง 2551"],
  ["ECE_2560", "หลักสูตรการศึกษาปฐมวัย 2560"],
  ["OTHER", "อื่น ๆ"],
];

async function main() {
  // Admin account (idempotent)
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      displayName: "Admin KruPayKru",
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("Admin ready:", admin.email);

  for (let i = 0; i < PRODUCT_TYPES.length; i++) {
    const [code, nameTh] = PRODUCT_TYPES[i];
    await prisma.productType.upsert({
      where: { code },
      update: { nameTh, sortOrder: i },
      create: { code, nameTh, sortOrder: i },
    });
  }

  for (let i = 0; i < SUBJECTS.length; i++) {
    const [code, nameTh] = SUBJECTS[i];
    await prisma.subject.upsert({
      where: { code },
      update: { nameTh, sortOrder: i },
      create: { code, nameTh, sortOrder: i },
    });
  }

  for (let i = 0; i < GRADES.length; i++) {
    const [code, nameTh, group] = GRADES[i];
    await prisma.grade.upsert({
      where: { code },
      update: { nameTh, group, sortOrder: i },
      create: { code, nameTh, group, sortOrder: i },
    });
  }

  for (const [code, nameTh] of CURRICULA) {
    await prisma.curriculum.upsert({
      where: { code },
      update: { nameTh },
      create: { code, nameTh },
    });
  }

  console.log("Seed complete:", {
    productTypes: PRODUCT_TYPES.length,
    subjects: SUBJECTS.length,
    grades: GRADES.length,
    curricula: CURRICULA.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
