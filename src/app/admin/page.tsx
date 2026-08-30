import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getAdminOverview } from "@/lib/trust";

export const metadata = { title: "Admin Dashboard" };

const REPORTS = [
  { label: "สมาชิกทั้งหมด", icon: "group" },
  { label: "ผู้ขาย", icon: "storefront" },
  { label: "สื่อทั้งหมด", icon: "inventory_2" },
  { label: "สื่อที่เผยแพร่", icon: "public" },
];

export default async function AdminHomePage() {
  await requirePermission("moderation:review");
  const overview = await getAdminOverview();

  const stats: Array<{ label: string; value: number; icon: string; highlight?: boolean }> = [
    { label: "สมาชิกทั้งหมด", value: overview.totalUsers, icon: "group" },
    { label: "ผู้ขาย", value: overview.totalCreators, icon: "storefront" },
    { label: "สื่อทั้งหมด", value: overview.totalProducts, icon: "inventory_2" },
    { label: "สื่อที่เผยแพร่", value: overview.publishedProducts, icon: "public" },
    { label: "รอตรวจสอบ", value: overview.pendingModeration, icon: "fact_check", highlight: true },
    { label: "รายงานเปิดอยู่", value: overview.openReports, icon: "report", highlight: true },
  ];

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">ภาพรวมระบบ</h1>
      <p className="text-sm text-text-muted mb-8">สถิติการใช้งานแพลตฟอร์มแบบเรียลไทม์</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border shadow-sm p-5 ${stat.highlight && stat.value > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">{stat.label}</span>
              <MaterialIcon name={stat.icon} className="text-primary text-lg" />
            </div>
            <p className="font-headline text-3xl font-bold">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
