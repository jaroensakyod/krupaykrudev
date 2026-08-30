import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { getSession } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";

export const metadata = { title: "บัญชีของฉัน" };

// TASK-093: account hub
export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const creator = await getCreatorByUserId(session.user.id);

  const links = [
    { href: "/orders", icon: "receipt_long", label: "คำสั่งซื้อของฉัน" },
    { href: "/account/downloads", icon: "inventory_2", label: "คลังสื่อของฉัน" },
    { href: "/account/wishlist", icon: "favorite", label: "รายการโปรด" },
    { href: "/account/notifications", icon: "notifications", label: "การแจ้งเตือน" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-headline text-2xl font-bold mb-8">บัญชีของฉัน</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center font-headline font-bold text-xl text-primary">
          {(session.user.name ?? "?").charAt(0)}
        </div>
        <div>
          <p className="font-headline font-bold">{session.user.name}</p>
          <p className="text-sm text-text-muted">{session.user.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 p-4 text-sm hover:bg-gray-50">
            <MaterialIcon name={l.icon} className="text-primary" />
            {l.label}
            <MaterialIcon name="chevron_right" className="ml-auto text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Creator section */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-headline font-bold mb-3">การเป็นผู้ขาย</h2>
        {creator ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{creator.displayName}</p>
              <p className="text-xs text-text-muted">/creator/{creator.slug}</p>
            </div>
            <Link href="/dashboard" className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark">
              เข้าศูนย์ผู้ขาย
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">ยังไม่ได้เปิดร้าน — เปลี่ยนสื่อของคุณเป็นรายได้</p>
            <Link href="/sell/start" className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark whitespace-nowrap">
              เปิดร้านค้า
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
