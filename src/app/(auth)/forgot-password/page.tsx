import Link from "next/link";
import { ForgotFields } from "./fields";

export const metadata = { title: "ลืมรหัสผ่าน" };

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-headline text-2xl font-bold mb-2">ตั้งรหัสผ่านใหม่</h1>
      <p className="text-sm text-text-muted mb-6">
        กรอกอีเมลที่ใช้สมัคร ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ (หมดอายุใน 1 ชั่วโมง)
      </p>
      <ForgotFields />
      <p className="mt-6 text-sm text-center">
        <Link href="/login" className="text-primary hover:underline">กลับไปหน้าเข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}
