import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getFunnelOverview } from "@/lib/analytics";

export const metadata = { title: "สถิติและ Funnel" };

// TASK-109: founder dashboard — conversion funnel + demand gaps + GMV (PRD §72-73)
export default async function FounderAnalyticsPage() {
  await requirePermission("admin:dashboard");
  const f = await getFunnelOverview();

  const funnel = [
    { label: "ค้นหา", value: f.searches, icon: "search" },
    { label: "เห็นสินค้า", value: f.impressions, icon: "visibility" },
    { label: "เข้าดูสินค้า", value: f.views, icon: "pageview" },
    { label: "ใส่ตะกร้า", value: f.addToCarts, icon: "shopping_cart" },
    { label: "เริ่มชำระเงิน", value: f.checkoutStarts, icon: "credit_card" },
    { label: "ซื้อสำเร็จ", value: f.purchases, icon: "paid" },
  ];

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">สถิติและ Funnel (30 วัน)</h1>
      <p className="text-sm text-text-muted mb-8">
        North Star: Successful Paid Orders = {f.purchases} · GMV = ฿{f.gmv.toLocaleString()} ({f.paidOrders} ออเดอร์)
      </p>

      {/* Funnel */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-10">
        {funnel.map((step, i) => {
          const prev = i > 0 ? funnel[i - 1].value : null;
          const rate = prev && prev > 0 ? Math.round((step.value / prev) * 100) : null;
          return (
            <div key={step.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <MaterialIcon name={step.icon} className="text-primary text-xl mx-auto mb-2" />
              <p className="font-headline text-xl font-bold">{step.value.toLocaleString()}</p>
              <p className="text-[11px] text-text-muted">{step.label}</p>
              {rate != null && <p className="text-[10px] text-text-muted mt-1">{rate}% ของขั้นก่อน</p>}
            </div>
          );
        })}
      </div>

      {/* Demand gaps */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <MaterialIcon name="travel_explore" className="text-amber-600" />
          <h2 className="font-headline font-bold">Demand Gap — คำค้นที่ไม่มีสินค้า ({f.zeroResults})</h2>
        </div>
        <p className="text-xs text-text-muted mb-4">
          คำค้นเหล่านี้คือโอกาส — ถ้ามีสินค้าตรงพวกนี้จะขายได้ทันที (เก็บเป็น supply strategy, PRD §74)
        </p>
        {f.topZeroResults.length === 0 ? (
          <p className="text-sm text-text-muted">ยังไม่มีคำค้นที่ไม่พบผลลัพธ์</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {f.topZeroResults.map((z) => (
              <span key={z.query} className="bg-white border border-amber-300 rounded-full px-3 py-1.5 text-sm">
                &quot;{z.query}&quot; <span className="text-amber-700 font-bold">×{z.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
