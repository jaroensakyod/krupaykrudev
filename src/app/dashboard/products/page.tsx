import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { listCreatorProducts } from "@/lib/products";

export const metadata = { title: "สื่อการสอนของฉัน" };

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "ฉบับร่าง", className: "bg-gray-100 text-gray-600" },
  PROCESSING: { label: "กำลังประมวลผล", className: "bg-blue-50 text-blue-600" },
  READY_FOR_REVIEW: { label: "รอตรวจสอบ", className: "bg-amber-50 text-amber-700" },
  UNDER_REVIEW: { label: "อยู่ระหว่างตรวจสอบ", className: "bg-amber-50 text-amber-700" },
  PUBLISHED: { label: "เผยแพร่แล้ว", className: "bg-green-50 text-green-700" },
  REJECTED: { label: "ไม่ผ่านการตรวจ", className: "bg-red-50 text-red-700" },
  NEEDS_CHANGES: { label: "ต้องแก้ไข", className: "bg-orange-50 text-orange-700" },
  SUSPENDED: { label: "ถูกระงับ", className: "bg-red-50 text-red-700" },
  ARCHIVED: { label: "เก็บถาวร", className: "bg-gray-100 text-gray-400" },
};

export default async function MyProductsPage() {
  const session = await requirePermission("product:create");
  const profile = await getCreatorByUserId(session.user.id);
  const products = profile ? await listCreatorProducts(profile.id) : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-headline text-2xl font-bold">สื่อการสอนของฉัน</h1>
          <p className="text-sm text-text-muted">จัดการสื่อทั้งหมดของร้านคุณ ({products.length} รายการ)</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark shadow-sm flex items-center gap-1.5"
        >
          <MaterialIcon name="add" className="text-lg" />
          เพิ่มสื่อใหม่
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MaterialIcon name="inventory_2" className="text-5xl text-gray-200 mb-4" />
          <p className="font-headline font-medium text-lg mb-1">ยังไม่มีสื่อการสอน</p>
          <p className="text-sm text-text-muted mb-6">เริ่มจากอัปโหลดสื่อชิ้นแรกของคุณ</p>
          <Link
            href="/dashboard/products/new"
            className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-dark inline-block"
          >
            สร้างสื่อใหม่
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => {
            const status = STATUS_LABEL[p.status] ?? STATUS_LABEL.DRAFT;
            return (
              <Link
                key={p.id}
                href={`/dashboard/products/${p.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <MaterialIcon name="description" className="text-2xl text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-medium truncate">{p.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {p.productType.nameTh} · {p.subject.nameTh} · {p.grade.nameTh}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${status.className}`}>
                    {status.label}
                  </span>
                  <p className="text-sm font-bold text-primary mt-1">
                    {p.price.toNumber() === 0 ? "ฟรี" : `฿${p.price.toNumber().toLocaleString()}`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
