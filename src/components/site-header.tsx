import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-xl font-bold text-brand-600">
          krupay
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
          <Link href="/search" className="hover:text-brand-600">
            ค้นหาสื่อการสอน
          </Link>
          <Link href="/sell" className="hover:text-brand-600">
            เริ่มขายสื่อของคุณ
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
          >
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </header>
  );
}
