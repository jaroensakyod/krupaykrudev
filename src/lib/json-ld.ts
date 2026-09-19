/**
 * SECURITY: JSON.stringify ไม่ escape `<` — ข้อความที่มี `</script>` จะปิดแท็กแล้ว inject script ได้
 * (stored XSS ผ่านชื่อ/คำอธิบายสินค้า) — escape อักขระอันตรายก่อนฝังใน <script> เสมอ
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\u003c")
    .replace(/>/g, "\u003e")
    .replace(/&/g, "\u0026")
    .replace(/\u2028/g, "\u2028")
    .replace(/\u2029/g, "\u2029");
}
