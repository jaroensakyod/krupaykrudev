import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { BecomeCreatorFields } from "./fields";

export const metadata = { title: "เปิดร้านค้า" };

// TASK-014: Become Creator — โครง 3 ขั้นจาก designs/store-setup (Stitch)
export default async function SellStartPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  const existing = await getCreatorByUserId(session.user.id);
  if (existing) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      {/* Progress */}
      <div className="text-center mb-10">
        <h1 className="font-headline text-3xl font-bold">เปิดร้านค้ากับเรา</h1>
        <div className="flex justify-center gap-8 mt-6 text-sm">
          <span className="flex items-center gap-2 text-primary font-bold">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
            ข้อมูลร้านค้า
          </span>
          <span className="flex items-center gap-2 text-text-muted">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs">2</span>
            ยืนยันตัวตน
          </span>
          <span className="flex items-center gap-2 text-text-muted">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs">3</span>
            บัญชีรับเงิน
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <h2 className="font-headline text-xl font-bold mb-1">ตั้งชื่อร้านค้าของคุณ</h2>
        <p className="text-sm text-text-muted mb-6">
          ชื่อร้านควรจดจำง่ายและเกี่ยวข้องกับสื่อการสอนของคุณ
        </p>
        <BecomeCreatorFields defaultDisplayName={session.user.name ?? ""} />
      </div>

      <p className="mt-6 text-xs text-text-muted text-center">
        ขั้นตอนถัดไป (ยืนยันตัวตน และบัญชีรับเงิน) จะเปิดใช้งานตามนโยบายการจ่ายเงิน
      </p>
    </div>
  );
}
