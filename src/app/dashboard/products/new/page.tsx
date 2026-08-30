import { createDraftAction } from "../actions";

export const metadata = { title: "เพิ่มสื่อใหม่" };

// Step 1 ของ wizard (designs/upload-step1): ตั้งชื่อก่อน → สร้าง draft → editor
export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline text-2xl font-bold mb-1">เพิ่มสื่อการสอนใหม่</h1>
      <p className="text-sm text-text-muted mb-8">
        ตั้งชื่อสื่อของคุณก่อน แล้วระบบจะสร้างฉบับร่างให้กรอกรายละเอียดต่อ
      </p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          ชื่อสื่อต้องมีอย่างน้อย 3 ตัวอักษร
        </p>
      )}

      <form action={createDraftAction} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1" htmlFor="title">
            ชื่อสื่อ *
          </label>
          <input
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
            id="title"
            name="title"
            placeholder="เช่น ใบงาน เรื่อง แรงและการเคลื่อนที่ ม.3 (พร้อมเฉลย)"
            required
            type="text"
          />
          <p className="mt-1 text-xs text-text-muted">
            💡 ใส่คำค้นหาไว้ต้นชื่อ เช่น &apos;ใบงาน เรื่อง X ม.3&apos;
          </p>
        </div>
        <button
          className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg text-sm transition-colors shadow-sm"
          type="submit"
        >
          สร้างฉบับร่าง →
        </button>
      </form>
    </div>
  );
}
