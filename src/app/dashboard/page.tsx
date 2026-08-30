import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";

export const metadata = { title: "แดชบอร์ดผู้ขาย" };

const STATS = [
  { label: "ยอดขายเดือนนี้", value: "฿0", icon: "payments" },
  { label: "รายการขาย", value: "0", icon: "receipt_long" },
  { label: "ยอดเงินคงเหลือ", value: "฿0", icon: "account_balance_wallet" },
  { label: "สื่อที่เผยแพร่", value: "0", icon: "inventory_2" },
];

export default async function DashboardPage() {
  const session = await requirePermission("product:create");
  const profile = await getCreatorByUserId(session.user.id);

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">
        สวัสดี {profile?.displayName ?? "ครู"} 👋
      </h1>
      <p className="text-sm text-text-muted mb-8">ภาพรวมร้านค้าของคุณวันนี้</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">{stat.label}</span>
              <MaterialIcon name={stat.icon} className="text-primary text-lg" />
            </div>
            <p className="font-headline text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Getting started */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-headline font-bold text-lg mb-4">เริ่มต้นใช้งาน</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <MaterialIcon name="check_circle" className="text-success" filled />
            เปิดร้านค้าเรียบร้อย
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MaterialIcon name="radio_button_unchecked" className="text-gray-300" />
            <span>
              อัปโหลดสื่อชิ้นแรกของคุณ —{" "}
              <Link href="/dashboard/products/new" className="text-primary font-medium hover:underline">
                เพิ่มสื่อใหม่
              </Link>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <MaterialIcon name="radio_button_unchecked" className="text-gray-300" />
            ยืนยันตัวตนเพื่อเพิ่มความน่าเชื่อถือ (เปิดใช้งานเร็ว ๆ นี้)
          </div>
        </div>
      </div>
    </div>
  );
}
