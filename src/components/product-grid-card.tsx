import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";

/** Product card สำหรับ search/home — ข้อมูลจริงจาก DB (ต่างจาก ProductCard ที่ใช้ mock shape) */
export function ProductGridCard({
  id,
  title,
  coverUrl,
  storeName,
  rating,
  reviewCount,
  price,
  badge,
  downloads,
}: {
  id: string;
  title: string;
  coverUrl: string | null;
  storeName: string;
  rating: number | null;
  reviewCount: number;
  price: number;
  badge?: string;
  downloads?: number;
}) {
  return (
    <Link
      href={`/products/${id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group cursor-pointer flex flex-col h-full"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {badge && (
          <span className="absolute top-2 left-2 z-10 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            {badge}
          </span>
        )}
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={title}
            src={coverUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MaterialIcon name="image" className="text-4xl text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-headline font-medium text-text-main text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-text-muted truncate">{storeName}</span>
            <span className="flex items-center text-[10px] text-badge-gold border border-badge-gold px-1 rounded bg-amber-50 ml-auto whitespace-nowrap">
              🏅 ครูตัวจริง
            </span>
          </div>
          <div className="flex items-end justify-between">
            {rating != null ? (
              <div className="flex items-center text-accent">
                <MaterialIcon name="star" className="text-[14px]" filled />
                <span className="text-xs font-medium ml-1 text-text-main">{rating.toFixed(1)}</span>
                <span className="text-[10px] text-text-muted ml-1">({reviewCount})</span>
              </div>
            ) : downloads != null && downloads > 0 ? (
              <span className="text-[10px] text-text-muted">ดาวน์โหลด {downloads.toLocaleString()} ครั้ง</span>
            ) : (
              <span className="text-[10px] text-text-muted">ร้านใหม่</span>
            )}
            <span
              className={`font-headline font-bold text-lg ${price === 0 ? "text-success" : "text-primary"}`}
            >
              {price === 0 ? "ฟรี" : `฿${price.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
