import Link from "next/link";
import { MaterialIcon } from "@/components/material-icon";
import { ProductCard } from "@/components/product-card";
import {
  CATEGORIES,
  GRADE_LEVELS,
  NEW_PRODUCTS,
  POPULAR_SEARCHES,
  POPULAR_SELLERS,
} from "@/lib/mock/home-data";

// หน้าแรก — แปลงจาก designs/home (Stitch) — Phase 6 (TASK-060) จะต่อข้อมูลจริง
export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-text-main">
              ครูซื้อจากครู — <br />
              <span className="text-primary">สื่อการสอนคุณภาพ</span>จากครูตัวจริง
            </h1>
            <p className="text-lg text-text-muted max-w-xl leading-relaxed">
              ซื้อขายใบงาน แผนการสอน โครงงาน และสื่อการสอนกว่า 9 หมวด
              ตั้งแต่เตรียมอนุบาลถึงมหาวิทยาลัย แพลตฟอร์มที่เข้าใจครูไทยมากที่สุด
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="bg-primary text-white px-8 py-3.5 rounded-full font-headline font-semibold text-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
              >
                เริ่มเลย ฟรี
              </Link>
              <Link
                href="/search"
                className="border-2 border-primary text-primary px-8 py-3.5 rounded-full font-headline font-semibold text-lg hover:bg-primary/5 transition-colors"
              >
                ดาวน์โหลดฟรี
              </Link>
            </div>

            {/* Popular Search Chips */}
            <div className="pt-6">
              <p className="text-sm text-text-muted mb-3">คำค้นหายอดนิยม:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-text-muted hover:border-primary hover:text-primary cursor-pointer transition-colors shadow-sm"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="ครูไทยกับสื่อการสอน"
              className="absolute inset-0 w-full h-full object-cover"
              src="/images/hero-illustration.png"
            />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent/20 rounded-full blur-xl" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-xl" />
          </div>
        </div>
      </section>

      {/* Filter Levels */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="font-headline text-2xl font-bold mb-6 text-text-main">เลือกตามระดับชั้น</h2>
        <div className="flex overflow-x-auto pb-4 gap-3">
          {GRADE_LEVELS.map((grade) => (
            <Link
              key={grade}
              href={`/search?grade=${encodeURIComponent(grade)}`}
              className="flex-shrink-0 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-primary hover:text-primary shadow-sm whitespace-nowrap"
            >
              {grade}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-headline text-3xl font-bold text-text-main">9 หมวดสื่อการสอน</h2>
          <Link
            href="/categories"
            className="text-primary font-medium hover:underline text-sm flex items-center"
          >
            ดูทั้งหมด <MaterialIcon name="arrow_forward" className="text-sm ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/categories#${encodeURIComponent(cat.name)}`}
              className={`bg-gradient-to-br ${cat.gradient} rounded-[20px] p-6 relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer h-full min-h-[140px]`}
            >
              <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300">
                <MaterialIcon name={cat.icon} style={{ fontSize: "80px" }} />
              </div>
              <h3
                className={`font-headline font-bold ${"text-lg " + cat.text + " mb-1"}`}
              >
                {cat.name}
              </h3>
              <p className="text-sm text-text-muted">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline text-3xl font-bold text-text-main mb-2">ผลงานมาใหม่จากครู</h2>
            <p className="text-text-muted text-sm">
              อัปเดตสื่อการสอนสดใหม่ทุกวัน สนับสนุนครูผู้สร้างสรรค์
            </p>
          </div>
          <Link href="/search" className="text-primary font-medium hover:underline text-sm flex items-center">
            ดูเพิ่มเติม <MaterialIcon name="arrow_forward" className="text-sm ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {NEW_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Banner Strip (KruPass) */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-40 -bottom-20 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
          <div className="relative z-10 text-white max-w-2xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <MaterialIcon name="diamond" className="text-3xl" filled />
              <h2 className="font-headline text-3xl md:text-4xl font-black tracking-tight">KruPass</h2>
            </div>
            <h3 className="font-headline text-xl md:text-2xl font-bold mb-2">
              โหลดสื่อไม่อั้น เริ่มต้น ฿99/เดือน
            </h3>
            <p className="text-white/90 text-sm md:text-base">
              เข้าถึงสื่อการสอนระดับพรีเมียมหลายหมื่นรายการโดยไม่มีค่าใช้จ่ายเพิ่มเติม
              ประหยัดเวลาเตรียมสอน ให้คุณโฟกัสกับการสอนได้อย่างเต็มที่
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <Link
              href="/krupass"
              className="bg-white text-primary px-8 py-4 rounded-full font-headline font-bold text-lg shadow-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 inline-block"
            >
              สมัคร KruPass
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Sellers */}
      <section className="max-w-7xl mx-auto px-6 py-12 mb-12">
        <h2 className="font-headline text-2xl font-bold mb-8 text-text-main text-center">ร้านครูยอดนิยม</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_SELLERS.map((seller) => (
            <div
              key={seller.name}
              className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="relative mb-4">
                {seller.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={seller.name}
                    src={seller.avatarUrl}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-headline font-bold text-3xl border-4 border-white shadow-sm">
                    {seller.initial}
                  </div>
                )}
                {seller.badge && (
                  <div className="absolute -bottom-2 right-0 bg-white rounded-full p-0.5 shadow-sm">
                    <MaterialIcon
                      name={seller.badge === "institution" ? "account_balance" : "verified"}
                      className={
                        seller.badge === "gold"
                          ? "text-badge-gold text-lg"
                          : seller.badge === "blue"
                            ? "text-badge-blue text-lg"
                            : "text-gray-400 text-lg"
                      }
                      filled
                    />
                  </div>
                )}
              </div>
              <h3 className="font-headline font-bold text-lg text-text-main mb-1">{seller.name}</h3>
              <p className="text-xs text-text-muted mb-3">{seller.description}</p>
              <div className="flex items-center gap-4 text-xs font-medium text-text-main bg-gray-50 px-4 py-2 rounded-full w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold">{seller.followers}</span>
                  <span className="text-[10px] text-text-muted font-normal">ผู้ติดตาม</span>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-accent flex items-center">
                    <MaterialIcon name="star" className="text-[12px] mr-0.5" filled />
                    {seller.rating}
                  </span>
                  <span className="text-[10px] text-text-muted font-normal">คะแนนร้าน</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
