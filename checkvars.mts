// ตรวจจาก API ฝั่ง server เราเองไม่ได้ (env เป็นของ Vercel) — ใช้ browser ตรวจแทนผ่านผลลัพธ์:
// ถ้า save สำเร็จ list จะรีเฟรช และหน้าจะไม่มี dialog
console.log("check via browser snapshot in next step");
process.exit(0);
