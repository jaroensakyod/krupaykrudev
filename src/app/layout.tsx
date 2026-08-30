import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "krupay — Marketplace สื่อการสอนสำหรับครูไทย",
    template: "%s | krupay",
  },
  description:
    "ซื้อขายสื่อการเรียนการสอน: ใบงาน ข้อสอบ แบบฝึกหัด Lesson Plan Presentation และอื่น ๆ อีกมากมาย จากครูและผู้สร้างสื่อชาวไทย",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
