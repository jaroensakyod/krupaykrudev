import Link from "next/link";
import { verifyEmailToken } from "@/lib/auth-flows";

export const metadata = { title: "ยืนยันอีเมล" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const ok = token ? await verifyEmailToken(token) : false;

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="font-headline text-2xl font-bold mb-4">
        {ok ? "ยืนยันอีเมลสำเร็จ ✓" : "ยืนยันไม่สำเร็จ"}
      </h1>
      <p className="text-sm text-text-muted mb-6">
        {ok ? "อีเมลของคุณได้รับการยืนยันแล้ว" : "ลิงก์ไม่ถูกต้องหรือหมดอายุ"}
      </p>
      <Link href="/account" className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark">
        ไปที่บัญชีของฉัน
      </Link>
    </div>
  );
}
