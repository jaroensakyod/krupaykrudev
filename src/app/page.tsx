import Link from "next/link";

// Placeholder home — final design will be produced via Stitch and converted
// into components per the approved plan (Phase 6: TASK-060).
export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <section className="flex flex-col items-center gap-6 py-16 text-center">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
          Marketplace สื่อการเรียนการสอน
          <span className="text-brand-600">สำหรับครูไทย</span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-600">
          ใบงาน ข้อสอบ แบบฝึกหัด Lesson Plan Presentation Template
          และสื่อการสอนอีกมากมาย จากครูและผู้สร้างสื่อชาวไทย
        </p>
        <div className="flex gap-4">
          <Link
            href="/search"
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            ค้นหาสื่อการสอน
          </Link>
          <Link
            href="/sell"
            className="rounded-lg border border-brand-600 px-6 py-3 font-medium text-brand-600 hover:bg-brand-50"
          >
            เริ่มขายสื่อของคุณ
          </Link>
        </div>
      </section>

      <section className="grid gap-6 py-8 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold">หลากหลายประเภท</h2>
          <p className="mt-2 text-sm text-gray-600">
            ไม่จำกัดเฉพาะใบงาน — ขายได้ทุกสื่อการสอนที่คุณสร้าง
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold">AI ช่วยลงสินค้า</h2>
          <p className="mt-2 text-sm text-gray-600">
            อัปโหลดไฟล์แล้วให้ AI ช่วยกรอกรายละเอียด แก้ไขเองได้ทุกจุด
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold">ขายง่าย รับเงินชัดเจน</h2>
          <p className="mt-2 text-sm text-gray-600">
            ส่งไฟล์อัตโนมัติหลังชำระเงิน ดูยอดขายและยอดเงินได้ตลอดเวลา
          </p>
        </div>
      </section>
    </div>
  );
}
