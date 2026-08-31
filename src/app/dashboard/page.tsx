import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { getCreatorAnalytics } from "@/lib/analytics";
import { getCreatorBalance } from "@/lib/finance";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "แดชบอร์ดผู้ขาย" };

export default async function DashboardPage() {
  const session = await requirePermission("product:create");
  const profile = await getCreatorByUserId(session.user.id);
  const [analytics, balance, published] = await Promise.all([
    profile ? getCreatorAnalytics(profile.id) : null,
    getCreatorBalance(session.user.id),
    profile ? prisma.product.count({ where: { creatorId: profile.id, status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null } }) : 0,
  ]);
  const stats = [
    { label: "เข้าดูสินค้า (30 วัน)", value: (analytics?.views ?? 0).toLocaleString(), icon: "pageview" },
    { label: "รายการขาย (30 วัน)", value: (analytics?.purchases ?? 0).toLocaleString(), icon: "receipt_long" },
    { label: "ยอดพร้อมถอน", value: `฿${balance.available.toLocaleString()}`, icon: "account_balance_wallet" },
    { label: "สื่อที่เผยแพร่", value: published.toLocaleString(), icon: "inventory_2" },
  ];

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">
        สวัสดี {profile?.displayName ?? "ครู"} 👋
      </h1>
      <p className="text-sm text-text-muted mb-8">ภาพรวมร้านค้าของคุณวันนี้</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">{stat.label}</span>
              <MaterialIcon name={stat.icon} className="text-primary text-lg" />
            </div>
            <p className="font-headline text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-10">
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-6">
          <p className="text-sm text-text-muted">Conversion ร้านของคุณ</p>
          <p className="font-headline text-3xl font-bold text-primary mt-1">{analytics?.conversion ?? 0}%</p>
          <p className="text-xs text-text-muted mt-2">ซื้อสำเร็จต่อจำนวนผู้เข้าดูสินค้าใน 30 วัน</p>
          <Link href="/dashboard/analytics" className="inline-block mt-4 text-sm text-primary font-medium hover:underline">ดูสถิติและโอกาสสินค้า →</Link>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6"><p className="text-sm font-medium">แชร์สื่อเพื่อเพิ่มยอดเข้าดู</p><p className="text-xs text-text-muted mt-2">ใช้ลิงก์ referral ของคุณเพื่อวัดการแนะนำและรับรางวัลเมื่อเกิดยอดซื้อ</p><Link href="/dashboard/referrals" className="inline-block mt-4 text-sm text-primary font-medium hover:underline">เปิดลิงก์แนะนำของฉัน →</Link></div>
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
