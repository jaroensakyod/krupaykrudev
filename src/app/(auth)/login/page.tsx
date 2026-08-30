import { RegisterFields } from "./register-fields";
import { LoginFields } from "./login-fields";
import { MaterialIcon } from "@/components/material-icon";
import { GoogleButton } from "@/components/google-button";
import { isGoogleOAuthEnabled } from "@/lib/env";

export const metadata = { title: "เข้าสู่ระบบ & สมัครสมาชิก" };

// แปลงจาก designs/login-register (Stitch) — LINE login เป็น feature อนาคตตาม PRD
export default function AuthPage() {
  const googleEnabled = isGoogleOAuthEnabled();
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(#0F766E 0.5px, transparent 0.5px), radial-gradient(#0F766E 0.5px, #FAFAF8 0.5px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
            opacity: 0.05,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      </div>

      <div className="max-w-6xl w-full z-10 relative">
        {/* Header/Logo area */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
            <MaterialIcon name="school" className="text-4xl" filled />
            ครูเปย์ครู KruPayKru
          </h1>
          <p className="mt-3 text-text-muted text-lg">
            แพลตฟอร์มเพื่อครูไทย ซื้อ-ขายสื่อการสอนคุณภาพ
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-white rounded-xl shadow-soft flex flex-col md:flex-row overflow-hidden border border-gray-100">
          {/* Left Side: Register */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/30">
            <div className="max-w-sm mx-auto">
              <h2 className="text-2xl font-headline font-bold text-text-main mb-6">สร้างบัญชีใหม่</h2>
              {googleEnabled && (
                <>
                  <GoogleButton label="สมัครสมาชิกด้วย Google" />
                  <div className="relative flex py-4 items-center mb-6">
                    <div className="flex-grow border-t border-gray-200" />
                    <span className="flex-shrink-0 mx-4 text-text-muted text-sm">หรือ</span>
                    <div className="flex-grow border-t border-gray-200" />
                  </div>
                </>
              )}
              <RegisterFields />
            </div>
          </div>

          {/* Right Side: Login */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 bg-white">
            <div className="max-w-sm mx-auto flex flex-col h-full justify-center">
              <h2 className="text-2xl font-headline font-bold text-text-main mb-2">ยินดีต้อนรับกลับมา!</h2>
              <p className="text-text-muted text-sm mb-8">
                เข้าสู่ระบบเพื่อจัดการสื่อการสอนและห้องเรียนของคุณ
              </p>
              {googleEnabled && (
                <>
                  <GoogleButton label="เข้าสู่ระบบด้วย Google" />
                  <div className="relative flex py-6 items-center">
                    <div className="flex-grow border-t border-gray-200" />
                    <span className="flex-shrink-0 mx-4 text-text-muted text-sm">หรือ</span>
                    <div className="flex-grow border-t border-gray-200" />
                  </div>
                </>
              )}
              <LoginFields />
              <div className="mt-8 text-center text-xs text-text-muted flex justify-center gap-4">
                <span className="flex items-center gap-1">
                  <MaterialIcon name="verified" className="text-[14px]" /> ปลอดภัย 100%
                </span>
                <span className="flex items-center gap-1">
                  <MaterialIcon name="support_agent" className="text-[14px]" /> มีแอดมินดูแล
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
