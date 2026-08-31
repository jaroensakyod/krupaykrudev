import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { getSession } from "@/lib/session";

export const metadata = { title: "เริ่มขายสื่อ" };

const STEPS = [
  { icon: "cloud_upload", title: "อัปโหลดสื่อ", description: "ใบงาน แผนการสอน ข้อสอบ ไฟล์ PDF, PPT, รูปภาพ" },
  { icon: "auto_awesome", title: "AI ช่วยกรอกข้อมูล", description: "ให้ AI ช่วยเขียนรายละเอียดและจัดหมวดหมู่ แก้ไขเองได้ทุกจุด" },
  { icon: "fact_check", title: "ตรวจสอบและเผยแพร่", description: "ทีมงานตรวจคุณภาพเพื่อความมั่นใจของผู้ซื้อ แล้วร้านคุณก็เปิด" },
  { icon: "payments", title: "รับรายได้", description: "ขายอัตโนมัติ 24 ชม. ถอนเงินเข้าบัญชีได้เมื่อยอดพร้อม" },
];

const BENEFITS = [
  { icon: "monetization_on", text: "ไม่มีค่าสมัคร ไม่มีค่ารายเดือน หักเฉพาะเมื่อขายได้" },
  { icon: "auto_awesome", text: "AI ช่วยลงสินค้า ประหยัดเวลาเตรียมไฟล์" },
  { icon: "verified", text: "ตรวจสอบลิขสิทธิ์ชัดเจน ปกป้องผลงานของคุณ" },
  { icon: "insights", text: "เห็นสถิติการขายและยอดเงินแบบเรียลไทม์" },
];

// หน้าชวนขาย — โครงจาก designs/seller-landing (Stitch)
export default async function SellLandingPage() {
  const session = await getSession();
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="font-headline text-4xl md:text-5xl font-bold leading-tight text-text-main">
          เปลี่ยนสื่อที่คุณทำเอง <span className="text-primary">ให้เป็นรายได้</span>
        </h1>
        <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
          ไม่ว่าคุณจะเป็นครู ติวเตอร์ หรือนักสร้างสื่อการศึกษา เปลี่ยนผลงานที่คุณมีให้เข้าถึงผู้สอนได้มากขึ้น
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {session?.user ? (
            <Link
              href="/sell/start"
              className="bg-primary text-white px-8 py-4 rounded-full font-headline font-semibold text-lg hover:bg-primary-dark shadow-md"
            >
              เปิดร้านค้าของคุณ
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-white px-8 py-4 rounded-full font-headline font-semibold text-lg hover:bg-primary-dark shadow-md"
            >
              สมัครเป็นผู้ขาย
            </Link>
          )}
        </div>
      </section>

      {/* 4 Steps */}
      <section className="mb-16">
        <h2 className="font-headline text-2xl font-bold text-center mb-10">เริ่มขายใน 4 ขั้นตอน</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-50 flex items-center justify-center">
                <MaterialIcon name={step.icon} className="text-3xl text-primary" />
              </div>
              <p className="text-xs font-bold text-accent mb-1">ขั้นตอนที่ {i + 1}</p>
              <h3 className="font-headline font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-primary-50 rounded-[20px] p-8 md:p-10 mb-16">
        <h2 className="font-headline text-2xl font-bold mb-6">ทำไมต้องขายบนครูเปย์ครู</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENEFITS.map((b) => (
            <li key={b.text} className="flex items-start gap-3">
              <MaterialIcon name={b.icon} className="text-primary text-xl mt-0.5" filled />
              <span className="text-sm">{b.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Final CTA */}
      <section className="text-center">
        <Link
          href={session?.user ? "/sell/start" : "/login"}
          className="bg-accent text-white px-10 py-4 rounded-full font-headline font-bold text-lg hover:bg-accent/90 shadow-md inline-block"
        >
          เริ่มขายสื่อของคุณวันนี้
        </Link>
        <p className="mt-3 text-sm text-text-muted">ฟรีตลอดชีพสำหรับผู้ขาย · หักค่าบริการเฉพาะเมื่อขายได้</p>
      </section>
    </div>
  );
}
