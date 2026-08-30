"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";

const TABS = [
  { href: "/", icon: "home", label: "หน้าแรก" },
  { href: "/search", icon: "search", label: "ค้นหา" },
  { href: "/cart", icon: "shopping_cart", label: "ตะกร้า" },
  { href: "/account/downloads", icon: "inventory_2", label: "คลังสื่อ" },
  { href: "/account", icon: "person", label: "บัญชี" },
];

/**
 * Mobile bottom tab bar — 5 ช่องตาม DESIGN.md ของ Stitch
 * (PRD §84: mobile-first, ปุ่มใหญ่พอสำหรับนิ้ว)
 */
export function MobileTabBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center px-3 py-1 min-w-[56px] ${
                active ? "text-primary" : "text-text-muted hover:text-primary"
              }`}
            >
              <MaterialIcon name={tab.icon} filled={active} />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
