import { MaterialIcon } from "@/components/material-icon";
import { LaunchFields } from "./launch-fields";

export const metadata = { title: "Launch" };

// หน้าพิธีเปิดเว็บ — เข้าถึงได้เฉพาะคนที่รู้ URL และรหัส
export default function LaunchPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-sidebar via-primary-dark to-primary text-white px-6 text-center">
      <MaterialIcon name="rocket_launch" className="text-6xl text-accent-light mb-6" filled />
      <h1 className="font-headline text-3xl md:text-4xl font-black mb-2">
        พร้อมเปิด krupaykru.com?
      </h1>
      <p className="text-white/75 mb-10">
        ใส่รหัสลับแล้วกดปุ่มเดียว — เว็บจะเปิดให้ทุกคนทั่วโลกทันที
      </p>
      <LaunchFields />
      <p className="mt-10 text-xs text-white/40">
        หน้านี้สำหรับเจ้าของเว็บเท่านั้น
      </p>
    </div>
  );
}
