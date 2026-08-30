import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";

const NAV = [
  { href: "/dashboard", icon: "dashboard", label: "แดชบอร์ด" },
  { href: "/dashboard/products", icon: "folder_open", label: "สื่อการสอนของฉัน" },
  { href: "/dashboard/products/new", icon: "add_circle", label: "เพิ่มสื่อใหม่" },
  { href: "/dashboard/earnings", icon: "payments", label: "รายได้" },
  { href: "/dashboard/analytics", icon: "query_stats", label: "สถิติ" },
  { href: "/dashboard/settings", icon: "storefront", label: "ตั้งค่าร้านค้า" },
];

// TASK-016: Creator dashboard shell — sidebar จาก designs/seller-dashboard (Stitch)
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePermission("product:create");
  const profile = await getCreatorByUserId(session.user.id);

  return (
    <div className="flex min-h-[80vh]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-primary-sidebar text-white">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MaterialIcon name="school" className="text-2xl" filled />
            <div>
              <h1 className="font-headline font-bold leading-tight">{profile?.displayName ?? "ร้านของฉัน"}</h1>
              <p className="text-xs text-white/70">ศูนย์ผู้ขาย</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 text-sm text-white/85 hover:bg-white/10 transition-colors"
            >
              <MaterialIcon name={item.icon} className="text-xl" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10">
          <span className="flex items-center gap-2 text-xs text-white/60">
            <MaterialIcon name="workspace_premium" className="text-sm" />
            สถานะ: {profile?.verificationStatus === "UNVERIFIED" ? "ยังไม่ยืนยันตัวตน" : profile?.verificationStatus}
          </span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 bg-background">
        {/* Mobile nav */}
        <div className="md:hidden bg-primary-sidebar text-white px-4 py-3 overflow-x-auto">
          <div className="flex gap-4 text-sm whitespace-nowrap">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-1.5 text-white/85">
                <MaterialIcon name={item.icon} className="text-lg" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="p-6 md:p-10 max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
