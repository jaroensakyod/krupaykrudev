import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { getSession } from "@/lib/session";
import { cartPriced } from "@/lib/commerce";
import { removeFromCartAction, checkoutAction } from "./actions";

export const metadata = { title: "ตะกร้าสินค้า" };

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; error?: string }>;
}) {
  const { added, error } = await searchParams;
  const session = await getSession();
  if (!session?.user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <MaterialIcon name="shopping_cart" className="text-5xl text-gray-200 mb-4" />
        <h1 className="font-headline text-xl font-bold mb-2">เข้าสู่ระบบเพื่อใช้ตะกร้า</h1>
        <Link href="/login" className="text-primary font-medium hover:underline">
          เข้าสู่ระบบ / สมัครสมาชิก
        </Link>
      </div>
    );
  }

  const { items, subtotal } = await cartPriced(session.user.id);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-headline text-2xl font-bold mb-8">ตะกร้าสินค้า</h1>

      {added && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">เพิ่มลงตะกร้าแล้ว</p>
      )}
      {error === "own" && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">ไม่สามารถซื้อสื่อของร้านตัวเองได้</p>
      )}
      {error === "owned" && (
        <p className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          คุณมีสื่อนี้อยู่แล้ว —{" "}
          <Link href="/account/downloads" className="font-medium underline">
            ไปที่คลังสื่อของฉัน
          </Link>
        </p>
      )}
      {error === "unavailable" && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">มีสินค้าบางรายการไม่พร้อมขาย — ตะกร้าถูกอัปเดตแล้ว</p>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MaterialIcon name="shopping_cart" className="text-5xl text-gray-200 mb-4" />
          <p className="font-headline font-medium text-lg mb-1">ตะกร้าว่างเปล่า</p>
          <Link href="/search" className="text-primary text-sm font-medium hover:underline">
            เลือกซื้อสื่อการสอน
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.cartItemId} className="p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-medium truncate">{item.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">โดย {item.creatorName}</p>
                </div>
                <p className="font-headline font-bold text-primary whitespace-nowrap">
                  {item.price === 0 ? "ฟรี" : `฿${item.price.toLocaleString()}`}
                </p>
                <form action={removeFromCartAction}>
                  <input name="productId" type="hidden" value={item.productId} />
                  <button className="text-danger text-sm hover:underline" type="submit">
                    ลบ
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-text-muted">รวม ({items.length} รายการ)</span>
              <span className="font-headline font-bold text-lg text-primary">
                {subtotal === 0 ? "ฟรี" : `฿${subtotal.toLocaleString()}`}
              </span>
            </div>
            <p className="text-xs text-text-muted mb-4">
              ราคาจะถูกตรวจสอบใหม่ตอนชำระเงิน · ไฟล์พร้อมดาวน์โหลดทันทีหลังชำระเงิน
            </p>
            <form action={checkoutAction}>
              <button
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
                type="submit"
              >
                ไปหน้าชำระเงิน
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
