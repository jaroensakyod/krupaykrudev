# krupay

Marketplace สื่อการเรียนการสอนสำหรับตลาดไทย (Thai Teaching Media Marketplace)

## Tech Stack
- Next.js 16 (App Router) + TypeScript — Modular Monolith
- PostgreSQL (Neon) + Prisma 6
- Auth.js v5 (email/password + Google)
- Tailwind CSS 4
- Cloudflare R2 (S3-compatible) — เฟสไฟล์ (Phase 3)
- Google Gemini ผ่าน AI Gateway — เฟส AI (Phase 4)

## เริ่มต้น
```bash
npm install
cp .env.example .env   # แล้วกรอกค่าจริง (DATABASE_URL, AUTH_SECRET, ...)
npx prisma migrate dev
npm run dev
```

## Scripts
- `npm run dev` — dev server
- `npm run build` / `npm start` — production
- `npm run lint` / `npm run typecheck`
- `npm run db:migrate` / `db:deploy` / `db:studio`

## แผนงาน
ดู Master PRD (V1 = Sellable MVP) — ทำงานเป็น Phase 0–13 ตามลำดับ
Critical Path: Creator → Product → Publish → Buyer → Payment → Entitlement → Download → Ledger → Balance

## Operations (Phase 12-13)

### Backup / Restore (TASK-130)
- **Database:** Neon — automated daily backups + PITR (dashboard → Backup & Restore) ตรวจ restore drill ก่อน launch จริง
- **Object Storage:** Cloudflare R2 — เปิด versioning ที่ bucket settings ก่อน launch
- Restore procedure: สร้าง Neon branch จาก backup → ทดสอบ `npm run build && npm start` ต่อ branch → DNS switch

### Rate Limiting
- ปัจจุบัน in-memory ต่อ instance — production จริงจังเปลี่ยนเป็น Upstash Redis (@upstash/ratelimit) โดยคง interface `rateLimit()`

### เงื่อนไขก่อนเปิดเงินจริง (PRD §77)
- ยืนยัน payment provider + KYC + อัตราภาษี + ใบกำกับ — ก่อนหน้านั้นใช้ mock sandbox เท่านั้น
