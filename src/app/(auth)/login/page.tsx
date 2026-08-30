import Link from "next/link";
import { LoginFields } from "./login-fields";
import { GoogleButton } from "@/components/google-button";
import { isGoogleOAuthEnabled } from "@/lib/env";

export const metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  const googleEnabled = isGoogleOAuthEnabled();
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
      {googleEnabled && (
        <>
          <GoogleButton label="เข้าสู่ระบบด้วย Google" />
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            หรือ
            <span className="h-px flex-1 bg-gray-200" />
          </div>
        </>
      )}
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        หรือ
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <LoginFields />
      <p className="text-sm text-gray-600">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="text-brand-600 hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
