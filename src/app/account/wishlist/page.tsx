import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { getSession } from "@/lib/session";
import { listWishlist } from "@/lib/reviews";
import { coverUrlOf } from "@/lib/catalog";

export const metadata = { title: "รายการโปรด" };

// TASK-092
export default async function WishlistPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const items = await listWishlist(session.user.id);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-headline text-2xl font-bold mb-8">รายการโปรดของฉัน</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MaterialIcon name="favorite" className="text-5xl text-gray-200 mb-4" />
          <p className="font-headline font-medium text-lg mb-1">ยังไม่มีรายการโปรด</p>
          <Link href="/search" className="text-primary text-sm font-medium hover:underline">
            เลือกดูสื่อการสอน
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.product.slug}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {item.product.files.find((f) => f.preview)?.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={item.product.title}
                  src={`/api/files/${item.product.files.find((f) => f.preview)!.id}/preview`}
                  className="w-14 h-14 object-cover rounded-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                  <MaterialIcon name="image" className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-headline font-medium truncate">{item.product.title}</p>
                <p className="text-xs text-text-muted">โดย {item.product.creator.displayName}</p>
              </div>
              <p className="font-headline font-bold text-primary">
                {item.product.price.toNumber() === 0 ? "ฟรี" : `฿${item.product.price.toNumber().toLocaleString()}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
