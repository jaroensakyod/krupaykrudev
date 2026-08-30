import Link from "next/link";
import { ResetFields } from "./fields";

export const metadata = { title: "ตั้งรหัสผ่านใหม่" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-headline text-2xl font-bold mb-6">ตั้งรหัสผ่านใหม่</h1>
      {!token ? (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg p-4">
          ลิงก์ไม่ถูกต้อง —{" "}
          <Link href="/forgot-password" className="underline">
            ขอลิงก์ใหม่
          </Link>
        </p>
      ) : (
        <ResetFields token={token} />
      )}
    </div>
  );
}
