import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { getCreatorAnalytics } from "@/lib/analytics";
import Link from "next/link";

export const metadata = { title: "สถิติร้าน" };

// TASK-108: creator analytics — Views/Sales/Conversion/Top products (PRD §56)
export default async function CreatorAnalyticsPage() {
  const session = await requirePermission("sales:view:own");
  const profile = await getCreatorByUserId(session.user.id);
  const stats = profile ? await getCreatorAnalytics(profile.id) : null;

  const cards = stats
    ? [
        { label: "การเห็นสินค้า (30 วัน)", value: stats.impressions, icon: "visibility" },
        { label: "เข้าดูสินค้า", value: stats.views, icon: "pageview" },
        { label: "ใส่ตะกร้า", value: stats.addToCarts, icon: "shopping_cart" },
        { label: "ขายได้", value: stats.purchases, icon: "paid" },
      ]
    : [];

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">สถิติร้านค้า</h1>
      <p className="text-sm text-text-muted mb-8">ข้อมูล 30 วันล่าสุด (เรียลไทม์จาก event funnel)</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-text-muted">{c.label}</span>
              <MaterialIcon name={c.icon} className="text-primary text-lg" />
            </div>
            <p className="font-headline text-2xl font-bold">{c.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {stats && stats.views > 0 && (
        <p className="text-sm text-text-muted mb-8">
          Conversion: <span className="font-bold text-primary">{stats.conversion}%</span>{" "}
          (ซื้อ / เข้าดูสินค้า)
        </p>
      )}

      <h2 className="font-headline font-bold text-lg mb-3">สื่อที่คนดูมากสุด</h2>
      {!stats || stats.topProducts.length === 0 ? (
        <p className="text-sm text-text-muted bg-white rounded-xl border border-gray-100 p-6 text-center">
          ยังไม่มีข้อมูลการเข้าชม — แชร์ลิงก์สินค้าเพื่อเริ่มเก็บสถิติ
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {stats.topProducts.map((t, i) => (
            <div key={t.productId} className="p-4 flex items-center gap-4 text-sm">
              <span className="font-headline font-bold text-text-muted w-6">{i + 1}.</span>
              <Link href={`/products/${t.productId}`} className="flex-1 min-w-0 truncate hover:text-primary">
                {t.title}
              </Link>
              <span className="text-text-muted whitespace-nowrap">{t.views} views</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
