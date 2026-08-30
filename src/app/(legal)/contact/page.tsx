export const metadata = { title: "ติดต่อเรา" };

const CHANNELS = [
  {
    icon: "support_agent",
    title: "ช่วยเหลือการใช้งาน / ปัญหาการสั่งซื้อ",
    description: "ปัญหาไฟล์ การชำระเงิน การโหลด — แจ้งพร้อมหมายเลขคำสั่งซื้อจะช่วยให้ตรวจสอบเร็วขึ้น",
    email: "support@krupaykru.com",
  },
  {
    icon: "copyright",
    title: "ลิขสิทธิ์ / Takedown",
    description: "แจ้งการละเมิดลิขสิทธิ์ — โปรดระบุข้อมูลตามที่ระบุในหน้านโยบายลิขสิทธิ์ เพื่อให้ตรวจสอบได้รวดเร็ว",
    email: "copyright@krupaykru.com",
  },
  {
    icon: "privacy_tip",
    title: "ข้อมูลส่วนบุคคล (PDPA)",
    description: "ใช้สิทธิ์เข้าถึง/แก้ไข/ลบข้อมูล หรือข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว",
    email: "privacy@krupaykru.com",
  },
  {
    icon: "handshake",
    title: "ธุรกิจ / สถาบันการศึกษา / ร่วมงานกับเรา",
    description: "ข้อเสนอความร่วมมือ สถาบันที่สนใจซื้อสื่อจำนวนมาก หรือสื่อมวลชน",
    email: "business@krupaykru.com",
  },
];

export default function Page() {
  return (
    <article className="space-y-8">
      <section>
        <h2 className="font-headline text-xl font-bold text-gray-900 mb-3">ช่องทางติดต่อ</h2>
        <p className="mb-6">
          เลือกหัวข้อที่ตรงกับเรื่องของท่าน เพื่อให้ทีมที่รับผิดชอบตอบกลับได้เร็วที่สุด
          <span className="block text-xs text-text-muted mt-1">
            * อีเมลจะเปิดใช้งานพร้อมโดเมนจริง — ระหว่างรอ กรุณาส่งข้อความผ่านช่องทาง social ของเรา
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHANNELS.map((c) => (
            <div key={c.email} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">{c.icon}</span>
                <h3 className="font-headline font-bold text-sm">{c.title}</h3>
              </div>
              <p className="text-sm text-text-muted mb-3">{c.description}</p>
              <p className="text-sm font-medium text-primary">{c.email}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-headline text-xl font-bold text-gray-900 mb-3">เวลาตอบกลับ</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>การใช้งาน/คำสั่งซื้อ: ภายใน 1-2 วันทำการ</li>
          <li>เรื่องลิขสิทธิ์: ยืนยันรับแจ้งภายใน 2 วันทำการ และแจ้งผลตรวจสอบภายใน 7-14 วันทำการ</li>
          <li>PDPA: ภายใน 30 วันตามกฎหมาย</li>
        </ul>
      </section>
    </article>
  );
}
