import Link from "next/link";
import { MaterialIcon } from "./material-icon";

export type ProductCardData = {
  id: string;
  title: string;
  coverUrl: string;
  storeName: string;
  storeAvatarUrl?: string;
  storeInitial?: string;
  realTeacherBadge?: boolean;
  rating: number;
  reviewCount: number;
  price: number | null; // null = ฟรี
  originalPrice?: number;
  badge?: { label: string; variant: "ai" | "free" | "krupass" };
};

const BADGE_STYLES = {
  ai: "bg-gray-800/80 backdrop-blur-sm text-white border border-gray-400",
  free: "bg-accent text-white shadow-sm",
  krupass: "bg-gradient-to-r from-primary to-emerald-400 text-white shadow-sm",
} as const;

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group cursor-pointer flex flex-col h-full"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={product.title}
          src={product.coverUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          type="button"
          aria-label="เพิ่มในรายการโปรด"
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500 transition-colors"
        >
          <MaterialIcon name="favorite" className="text-sm" />
        </button>
        {product.badge ? (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center ${BADGE_STYLES[product.badge.variant]}`}
            >
              {product.badge.variant === "krupass" && (
                <MaterialIcon name="diamond" className="text-[10px] mr-0.5" />
              )}
              {product.badge.label}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-headline font-medium text-text-main text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <div className="mt-auto">
          {/* Store Info */}
          <div className="flex items-center gap-2 mb-3">
            {product.storeAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={product.storeName}
                src={product.storeAvatarUrl}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                {product.storeInitial ?? product.storeName.charAt(0)}
              </div>
            )}
            <span className="text-xs text-text-muted truncate">{product.storeName}</span>
            {product.realTeacherBadge && (
              <span className="flex items-center text-[10px] text-badge-gold border border-badge-gold px-1 rounded bg-amber-50 ml-auto whitespace-nowrap">
                🏅 ครูตัวจริง
              </span>
            )}
          </div>

          {/* Rating & Price */}
          <div className="flex items-end justify-between">
            <div className="flex items-center text-accent">
              <MaterialIcon name="star" className="text-[14px]" filled />
              <span className="text-xs font-medium ml-1 text-text-main">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-text-muted ml-1">({product.reviewCount})</span>
            </div>
            <div className="text-right">
              {product.originalPrice ? (
                <span className="text-[10px] text-text-muted line-through mr-1">
                  ฿{product.originalPrice.toLocaleString()}
                </span>
              ) : null}
              <span
                className={`font-headline font-bold text-lg ${product.price == null ? "text-success" : "text-primary"}`}
              >
                {product.price == null ? "ฟรี" : `฿${product.price.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
