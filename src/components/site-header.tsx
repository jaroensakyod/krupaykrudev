import Link from "next/link";
import { MaterialIcon } from "./material-icon";

const NAV_LINKS = [
  { href: "/", label: "หน้าแรก", active: true },
  { href: "/search", label: "สื่อการสอน" },
  { href: "/categories", label: "หมวดหมู่" },
];

export function SiteHeader() {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200/60 shadow-sm">
      <div className="flex justify-between items-center w-full px-6 py-3 max-w-7xl mx-auto">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-headline font-black text-primary">
            ครูเปย์ครู
          </Link>
        </div>

        {/* Search Bar (Center) */}
        <form action="/search" className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
          <input
            name="q"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="ค้นหาใบงาน สื่อการสอน แผนการสอน..."
            type="text"
          />
          <MaterialIcon name="search" className="absolute left-3 top-2.5 text-gray-400 text-xl" />
        </form>

        {/* Navigation Links & Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.active
                    ? "text-primary font-bold border-b-2 border-primary pb-1"
                    : "text-text-muted hover:text-primary transition-colors"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Icon Actions */}
          <div className="hidden sm:flex items-center gap-4 text-text-muted">
            <Link href="/wishlist" aria-label="รายการโปรด" className="hover:text-primary transition-colors">
              <MaterialIcon name="favorite" />
            </Link>
            <Link href="/cart" aria-label="ตะกร้า" className="hover:text-primary transition-colors">
              <MaterialIcon name="shopping_cart" />
            </Link>
          </div>

          {/* Profile & Auth Actions */}
          <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
            <Link
              href="/login"
              className="text-text-muted hover:text-primary transition-colors text-sm font-medium whitespace-nowrap"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/sell"
              className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm whitespace-nowrap"
            >
              เริ่มขายสื่อ
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Below Nav) */}
      <div className="md:hidden px-6 pb-3">
        <form action="/search" className="relative w-full">
          <input
            name="q"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="ค้นหาใบงาน สื่อการสอน แผนการสอน..."
            type="text"
          />
          <MaterialIcon name="search" className="absolute left-3 top-2.5 text-gray-400 text-xl" />
        </form>
      </div>
    </nav>
  );
}
