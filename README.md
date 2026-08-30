# ครูเปย์ครู KruPayKru 🎓

> **Thai Teaching Media Marketplace** — Marketplace สำหรับเศรษฐกิจผู้สร้างสื่อการเรียนการสอนของไทย
> ซื้อ-ขายใบงาน ข้อสอบ แผนการสอน งานนำเสนอ และสื่อการสอนทุกประเภท · โดยครู สำหรับครู

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)]() [![Next.js](https://img.shields.io/badge/Next.js-16-black)]() [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]() [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)]() [![PRD](https://img.shields.io/badge/PRD-V1_~98%25-success)](docs/PRD.md)

---

## ✨ นี่คืออะไร

แพลตฟอร์มตลาดกลางที่ให้ **ครูผู้สร้างสื่อ** เปลี่ยนผลงานเป็นรายได้ และให้ **ครูผู้ซื้อ** ลดเวลาเตรียมสอน:

- 🤖 **AI ช่วยลงสินค้า** — อัปโหลดไฟล์ ให้ AI (Gemini) วิเคราะห์เนื้อหาแล้วเสนอ ชื่อ/คำอธิบาย/หมวดหมู่/แท็ก พร้อม confidence · แก้ไขเองได้ทุกจุด · AI พังก็ขายได้
- 🔎 **ค้นหาที่เข้าใจการศึกษาไทย** — `ม.3` = `ม3` = `มัธยมศึกษาปีที่ 3` (Thai normalization) + ตัวกรองวิชา/ระดับชั้น/ประเภท/ราคา/รีวิว
- 🔒 **Trust ตั้งแต่ต้น** — ประกาศลิขสิทธิ์ก่อนเผยแพร่, ตรวจสอบโดยแอดมิน, ตรวจไฟล์ซ้ำด้วย SHA-256, audit log ทุกการตัดสินใจ
- 💰 **การเงินโปร่งใส** — immutable ledger, รายได้แยก pending/available, ถอนเงิน, คืนเงินพร้อม reversal, reconcile ทุกออเดอร์
- 📊 **Data ตั้งแต่วันแรก** — event funnel (search → impression → view → cart → checkout → purchase) + จับ **คำค้นที่ไม่มีสินค้า** เป็น demand signal

**สถานะ: Sellable MVP Complete** — Critical Path ผ่าน E2E ครบ:
`Creator สมัคร → อัปโหลด(R2) → AI ช่วย → ส่งตรวจ → Admin อนุมัติ → Buyer ค้นหา → ซื้อ → จ่าย → Entitlement → Download → Ledger → Balance`

## 🧱 Tech Stack

| Layer | เทคโนโลยี |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript — Modular Monolith |
| Database | PostgreSQL บน Neon + Prisma 6 (34 models) |
| Auth | Auth.js v5 — email/password (+ Google เมื่อตั้งค่า) |
| Storage | Cloudflare R2 (S3-compatible, 3 drivers: r2 / r2api / local-dev) |
| AI | Google Gemini ผ่าน AI Gateway (provider abstraction + cost guard + cache) |
| Styling | Tailwind CSS 4 + design system จาก Stitch (teal `#0F766E` · Kanit/Sarabun) |
| Deploy | Vercel (CI: lint → typecheck → build) |

## 🚀 เริ่มต้นใช้งาน

```bash
git clone <repo-url> krupay && cd krupay
npm install
cp .env.example .env        # กรอกค่าตามด้านล่าง
npx prisma migrate dev      # สร้าง schema
npx prisma db seed          # taxonomy ไทย + บัญชีแอดมิน
npm run dev
```

### Environment Variables

| ตัวแปร | จำเป็น | ใช้ทำอะไร |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | ✅ | Neon PostgreSQL (pooled / direct) |
| `AUTH_SECRET` | ✅ | session + HMAC signing |
| `R2_ENDPOINT` `R2_BUCKET` `R2_ACCOUNT_ID` `R2_API_TOKEN` | ⬜ | Cloudflare R2 (ไม่ใส่ = local dev storage) |
| `GEMINI_API_KEY` `GEMINI_MODEL` | ⬜ | AI ผู้ช่วย (ไม่ใส่ = AI ปิด, ระบบยังขายได้) |
| `FINANCE_HOLD_DAYS` | ⬜ | ระยะถือเงินก่อนถอนได้ (default 7, dev = 0) |

### บัญชีทดสอบ (หลัง seed)

| บัญชี | สิทธิ์ |
|---|---|
| `admin@krupay.dev` / `Admin12345!` | Admin (moderation/การเงิน/taxonomy/audit) |

สมาชิกทั่วไปสมัครใหม่ผ่านหน้าเว็บได้เลย (เลือกได้ว่าเป็นผู้ซื้อหรือผู้ขาย)

## 📁 โครงสร้างโปรเจกต์

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # login+register รวมหน้าเดียว, forgot/reset password, verify-email
│   ├── account/            # บัญชี, downloads, wishlist, notifications
│   ├── admin/              # 12 หน้า: dashboard/moderation/users/creators/orders/
│   │                       #   payments/finance/reports/taxonomy/AI/audit/analytics
│   ├── api/                # files (upload/confirm/preview/download), ai, auth
│   ├── cart|checkout|orders|products|search|categories|creator|subjects|grades
│   ├── dashboard/          # ศูนย์ผู้ขาย: products/earnings/analytics
│   └── (legal)/            # terms/privacy/copyright/help/about/contact
├── components/             # header/footer/product cards/mobile tab bar/icons
├── lib/                    # โมดูลธุรกิจ (modular monolith)
│   ├── ai/                 # gateway + provider + tasks (metadata/SEO/quality)
│   ├── auth-flows.ts       # password reset + email verification (token)
│   ├── catalog.ts          # search + related + product queries
│   ├── commerce.ts         # cart/checkout/fulfillment (idempotent)
│   ├── finance.ts          # ledger/balances/payout/refund/reconcile
│   ├── files.ts            # upload validation/sha256/preview/download auth
│   ├── reviews.ts          # verified-purchase reviews + wishlist
│   ├── storage.ts          # R2/r2api/local storage abstraction
│   └── trust.ts            # moderation/audit/copyright declarations
└── prisma/                 # schema (34 models) + migrations + seed
```

## ✅ PRD Compliance

ตรวจครบทั้ง 127 sections ของ [docs/PRD.md](docs/PRD.md) — สรุป:

- ✅ **Phase 0-13 ครบตาม task list** (ยกเว้นของฝั่ง business ด้านล่าง)
- ✅ **Acceptance Criteria §108-112 ผ่าน E2E จริง** — Creator/Buyer journey โดยไม่แก้ DB มือ, Ledger created exactly once, funnel reconstruct ได้
- ✅ **Go-live Blockers §113 ปิดครบ** — idempotent payment, private originals, RBAC server-side, reconcile ผ่าน, HMAC webhook, upload validation, audit, refund reversal
- ✅ Mobile-first responsive + bottom tab bar (ตรวจด้วย viewport 390/768px)

## ⚠️ ที่ต้องทำก่อนเปิดใช้จริง (Production Checklist)

| รายการ | ผู้รับผิดชอบ |
|---|---|
| Deploy Vercel + โดเมน + env production | Founder (repo พร้อม push) |
| Payment provider จริง + KYC (§77 gate) | Founder — ปัจจุบันเป็น Mock/Sandbox ตาม PRD |
| เนื้อหา Legal ตรวจโดยที่ปรึกษากฎหมาย | Founder (ฉบับร่างพร้อมแล้วที่หน้า terms/privacy) |
| Email provider (Resend) — แจ้งเตือนทางอีเมล + verify/reset ผ่านอีเมลจริง | Founder (in-app แชนเนลทำงานแล้ว) |
| Monitoring (Sentry) + ทดสอบ Neon restore | Founder + dev |
| Seed สินค้าจริง: creators 30-50 คน, สื่อ 300+ ชิ้น (§115) | Founder (งาน marketing) |
| Rate limiting ขึ้น Upstash Redis (เมื่อ multi-instance) | dev — interface รองรับแล้ว |

## 📜 Scripts

```bash
npm run dev          # dev server
npm run build        # production build (typecheck รวม)
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run db:migrate   # prisma migrate dev
npm run db:seed      # npx prisma db seed (taxonomy + admin)
npm run db:studio    # prisma studio
```

## 📄 License / Legal

- [ข้อกำหนดการใช้งาน](src/app/(legal)/terms/page.tsx) · [นโยบาย PDPA](src/app/(legal)/privacy/page.tsx) · [นโยบายลิขสิทธิ์](src/app/(legal)/copyright/page.tsx)
- เนื้อหากฎหมายเป็นฉบับร่างที่จัดทำเพื่อโปรเจกต์ — **ต้องตรวจโดยที่ปรึกษากฎหมายก่อนเปิดใช้เชิงพาณิชย์**

---

<p align="center"><i>Build the transaction engine first · Capture useful data from day one · Use AI to remove work, not add complexity</i></p>
