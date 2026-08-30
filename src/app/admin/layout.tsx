import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { logoutAction } from "@/app/(auth)/actions";

const NAV = [
  { href: "/admin", icon: "dashboard", label: "หน้าแรกแดชบอร์ด" },
  { href: "/admin/moderation", icon: "fact_check", label: "คิวตรวจสอบสื่อ" },
  { href: "/admin/reports", icon: "report", label: "รายงานปัญหา" },
];

// TASK-053: Admin dashboard shell — sidebar จาก designs/admin-dashboard (Stitch)
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePermission("moderation:review");
  return (
    <div className="flex min-h-[80vh]">
      <aside className="hidden md:flex w-60 flex-col bg-primary-sidebar text-white">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MaterialIcon name="admin_panel_settings" className="text-2xl" filled />
            <div>
              <h1 className="font-headline font-bold leading-tight">KruPayKru Admin</h1>
              <p className="text-xs text-white/70">{session.user.email}</p>
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
          <form action={logoutAction}>
            <button className="flex items-center gap-2 text-xs text-white/60 hover:text-white" type="submit">
              <MaterialIcon name="logout" className="text-sm" />
              ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 bg-background">
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
