import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-300/30 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 py-12 max-w-7xl mx-auto text-sm text-text-muted">
        {/* Brand Column */}
        <div className="col-span-1">
          <div className="text-xl font-headline font-bold text-primary mb-4">ครูเปย์ครู</div>
          <p className="mb-4">© 2026 KruPayKru. แพลตฟอร์มเพื่อครูไทยโดยครูไทย</p>
          {siteConfig.ecomRegistrationNumber ? (
            <p className="text-xs">
              จดแจ้งพาณิชย์อิเล็กทรอนิกส์ เลขที่ {siteConfig.ecomRegistrationNumber}
              {siteConfig.ecomRegisteredDate ? ` · วันที่ ${siteConfig.ecomRegisteredDate}` : ""}
            </p>
          ) : null}
        </div>

        {/* Links Columns */}
        <div className="col-span-1">
          <h4 className="font-headline font-bold text-text-main mb-4">รู้จักเรา</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-gray-400 hover:text-primary transition-colors">
                เกี่ยวกับเรา
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-400 hover:text-primary transition-colors">
                ติดต่อเรา
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="font-headline font-bold text-text-main mb-4">ช่วยเหลือ</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/help" className="text-gray-400 hover:text-primary transition-colors">
                ศูนย์ช่วยเหลือ
              </Link>
            </li>
            <li>
              <Link href="/sell" className="text-gray-400 hover:text-primary transition-colors">
                การขายสื่อบน KruPayKru
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="font-headline font-bold text-text-main mb-4">ข้อกำหนด</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
                ข้อกำหนดเงื่อนไข
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                นโยบายความเป็นส่วนตัว (PDPA)
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
