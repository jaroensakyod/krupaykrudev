# 🔐 Security Audit Report — krupay (ครูเปย์ครู)

> รันตามวิธีทำงานของ [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) (focused single-auditor pass)
> Scope: โค้ดทั้ง repo · Source ref: หลัง commit `887af81` · วันที่: กันยายน 2569

## 1. Trust Boundaries (Phase 1 — Reconnaissance)

| Boundary | ความเชื่อใจ | ควบคุมโดย |
|---|---|---|
| Guest → Member | ไม่เชื่อใจ | Auth.js session + RBAC server-side |
| Buyer → Creator content | ไม่เชื่อใจ | entitlement check ทุกดาวน์โหลด |
| Creator → Product files | **UNTRUSTED INPUT** | MIME allowlist + size cap + HMAC ticket + sha256 |
| Creator → AI (เนื้อหา PDF) | **UNTRUSTED INPUT** (PRD §70) | AI ไม่มี DB access, output ผ่าน zod + creator confirm |
| Payment provider → ระบบ | เชื่อใจเฉพาะลายเซ็น | HMAC signature + idempotent fulfillment |
| Client → ราคา | **ไม่เชื่อใจเลย** | คิดใหม่จาก DB ตอน checkout |

## 2. ผลการ Hunt (Phase 2-3)

**12 findings** → ตรวจสอบอิสระแล้ว: **5 confirmed และแก้แล้ว · 2 needs_validation · 1 confirmed ต่ำ (ยอมรับได้) · 4 rejected**

ดูรายละเอียดเต็มแบบ machine-readable ที่ [findings.json](./findings.json)

### 🔴 ที่พบและแก้แล้วใน commit นี้

| # | ระดับ | ช่องโหว่ | ผลกระทบ | สิ่งที่แก้ |
|---|---|---|---|---|
| 1 | **CRITICAL** | `AUTH_SECRET ?? "dev"` — ลืมตั้ง env แล้วลายเซ็นชำระเงิน/อัปโหลดใช้กุญแจ "dev" ที่ใครก็คำนวณได้ | ปลอม payment confirmation ซื้อฟรี | ลบ fallback — ขาด env = crash ทันที (`commerce.ts`, `storage.ts`) |
| 2 | **HIGH** | Stored XSS ผ่าน JSON-LD — ชื่อสินค้ามี `</script><script>...` ปิดแท็กแล้วรันโค้ดในเครื่องผู้เข้าชม | โจมตีผู้เชี่ยวชมทุกคนที่เปิดหน้าสินค้า | `safeJsonLd()` escape `< > & U+2028/9` ใช้ทุกจุด JSON-LD |
| 3 | **HIGH** | Race ใน processRefund — อนุมัติคืนเงินพร้อมกัน 2 ครั้งได้ | หักยอดผู้ขายซ้ำ, ledger เพี้ยน | conditional `updateMany(status=PAID)` ใน tx — ชนะได้คนเดียว |
| 4 | **MEDIUM** | PUT อัปโหลดไม่ตรวจ Content-Length | ยัดไฟล์ 10GB เข้า R2 (ต้นทุนบวม) | ตรวจ header + body จริง ≤ 100MB ทั้ง 2 route |
| 5 | **MEDIUM** | เดาโค้ดคูปอง / สแปมรายงาน ไม่มี rate limit | enumerate ส่วนลด, food คิวแอดมิน | 10/10นาที (coupon) + 5/ชม./IP (report) |

### 🟡 Needs validation (รอข้อมูล/ทรัพยากรจาก founder)

- **Reset password ผ่าน in-app notification** — ผู้ใช้ที่ล็อกอินไม่ได้จะอ่านลิงก์ไม่ได้ → ต้องรอ Resend (email) จึงปิดวงจร
- **Orphaned objects ใน R2** — upload แล้วไม่ confirm ทิ้ง object ไว้ → ตั้ง R2 lifecycle rule (7 วัน) ตอน deploy

### 🟢 ยอมรับไว้ (low, self-healing)

- Webhook พร้อมกันชน unique index → ตอบ 500 หนึ่งครั้งแต่ provider retry แล้วเข้า alreadyPaid — ไม่มี double spend

### ✅ Rejected (สืบสวนแล้วไม่เป็นจริง — บันทึกไว้กันเขียนซ้ำ)

ปลอมราคาผ่าน client · SQL injection · IDOR สินค้าข้ามร้าน · stale JWT role

## 3. ตรวจกับ Go-live Blockers (PRD §113)

| Blocker | สถานะหลัง audit |
|---|---|
| Payment duplicate ได้ | ✅ idempotent + race guard เพิ่มจาก audit นี้ |
| Download original เป็น public | ✅ private + entitlement + signed |
| Creator เข้าถึงสินค้าคนอื่น | ✅ ownership check + E2E ยืนยัน |
| Ledger reconcile ไม่ได้ | ✅ reconcile ผ่านทุกออเดอร์ (รวมหลัง refund race fix) |
| Webhook ไม่มี verification | ✅ HMAC (และตอนนี้ไม่มี fallback key อีกแล้ว) |
| Upload ไม่ validate | ✅ + size cap ปิดช่องที่ audit เจอ |
| Admin action ไม่มี audit | ✅ audit log ครบ |
| Refund ทำเงินเพี้ยน | ✅ + race guard เพิ่มจาก audit นี้ |
| Backup ไม่ทำงาน | ⬜ Neon backup — ต้อง enable ที่ dashboard (ฝั่ง founder) |
| Terms/Copyright policy ไม่มี | ✅ มีฉบับเต็ม |

## 4. สิ่งที่ยังแนะนำให้ทำต่อ (นอก scope โค้ด)

1. เปิด **R2 Object Lifecycle Rule** — ลบไฟล์กำพร้าอัตโนมัติ
2. เปิด **Neon backup/restore drill** ก่อนเปิดจริง
3. เปลี่ยน rate limiter เป็น **Upstash Redis** เมื่อมีหลาย instance
4. **Sentry** ตาม PRD §81 (error tracking)
5. รหัสผ่านต้อง leak-password check (haveibeenpwned) — เพิ่มได้ภายหลัง
