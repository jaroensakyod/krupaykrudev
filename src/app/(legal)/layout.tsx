export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {children}
      <p className="mt-12 pt-6 border-t border-gray-100 text-xs text-gray-400">
        เอกสารฉบับนี้จัดทำเพื่อประกอบการเปิดให้บริการ และควรได้รับการตรวจทานโดยที่ปรึกษากฎหมายก่อนใช้บังคับเชิงพาณิชย์ · ล่าสุด: กันยายน 2569
      </p>
    </div>
  );
}
