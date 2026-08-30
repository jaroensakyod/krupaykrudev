import Link from "next/link";
import { RegisterFields } from "./register-fields";
import { GoogleButton } from "@/components/google-button";
import { isGoogleOAuthEnabled } from "@/lib/env";

export const metadata = { title: "สมัครสมาชิก" };

export default function RegisterPage() {
  const googleEnabled = isGoogleOAuthEnabled();
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold">สมัครสมาชิก</h1>
      {googleEnabled && (
        <>
          <GoogleButton label="สมัครด้วย Google" />
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
      <RegisterFields />
      <p className="text-sm text-gray-600">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
