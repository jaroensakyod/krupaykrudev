import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-gray-600">
        <p className="font-semibold text-gray-900">krupay</p>
        <p>Marketplace สื่อการเรียนการสอนสำหรับตลาดไทย</p>
        <nav className="mt-2 flex flex-wrap gap-4">
          <Link href="/terms" className="hover:text-brand-600">
            ข้อกำหนดการใช้งาน
          </Link>
          <Link href="/privacy" className="hover:text-brand-600">
            นโยบายความเป็นส่วนตัว
          </Link>
          <Link href="/copyright" className="hover:text-brand-600">
            นโยบายลิขสิทธิ์
          </Link>
          <Link href="/help" className="hover:text-brand-600">
            ศูนย์ช่วยเหลือ
          </Link>
        </nav>
      </div>
    </footer>
  );
}
