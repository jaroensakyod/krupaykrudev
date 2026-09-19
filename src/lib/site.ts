/**
 * ข้อมูลผู้ประกอบธุรกิจ — แสดงที่ footer ตาม พ.ร.บ.คุ้มครองผู้บริโภค
 * (เว็บไซต์พาณิชย์อิเล็กทรอนิกส์ต้องแสดงชื่อ/เลขที่จดแจ้งบนหน้าเว็บ)
 * TODO: ใส่เลขทะเบียนจริงเมื่อ DBD ออกใบรับรอง (คำขอ 69091004543 อยู่ระหว่างส่งเอกสาร)
 */
export const siteConfig = {
  name: "ครูเปย์ครู KruPayKru",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://krupaykru.com",
  ownerName: "Jaroensak Y.",
  ecomRegistrationNumber: "", // เลขที่จดแจ้งพาณิชย์อิเล็กทรอนิกส์ — รอใบรับรองจาก DBD
  ecomRegisteredDate: "", // วันที่จดแจ้ง (dd/mm/yyyy)
  supportEmail: "support@krupaykru.com",
  copyrightEmail: "copyright@krupaykru.com",
  privacyEmail: "privacy@krupaykru.com",
  businessEmail: "business@krupaykru.com",
} as const;
