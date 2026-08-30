# Design Reference (จาก Stitch)

ออกแบบผ่าน stitch.withgoogle.com — โปรเจกต์ "KruPayKru — Thai Teacher Marketplace"
Export ด้วยรูปแบบ .zip (code.html + DESIGN.md + screen.png ต่อหน้า)

## Design System
ดูรายละเอียดเต็มที่ `DESIGN.md` ตัวอย่างใดก็ได้ (เหมือนกันทุกหน้า):
- Primary Deep Teal `#0F766E` · Accent Marigold `#F59E0B`
- Background `#FAFAF8` · Text `#1F2937` · Muted `#6B7280`
- หัวข้อ: Kanit · เนื้อความ: Sarabun · ราคาขึ้นต้นด้วย ฿
- Buyer: top navbar + big search · Seller/Admin: sidebar dark teal `#0B4F4A`
- Product grid 4 คอลัมน์ desktop / 2 คอลัมน์ mobile · ปุ่ม/chips ทรง pill

## หน้าจอ (29 หน้า)

### Buyer (ครูเปย์ครู)
| โฟลเดอร์ | หน้า |
|---|---|
| `home` | หน้าแรก |
| `search` | ผลการค้นหา |
| `product-detail` | รายละเอียดสินค้า |
| `cart` | ตะกร้าสินค้า |
| `checkout` | ชำระเงิน |
| `order-success` | ทำรายการสำเร็จ |
| `login-register` | เข้าสู่ระบบ & สมัครสมาชิก |
| `seller-landing` | หน้าชวนขาย (CTA) |
| `wishlist` | รายการโปรด |
| `categories` | หมวดหมู่สื่อการสอน |
| `library` | คลังสื่อของฉัน (downloads) |
| `krupass-tiers` / `krupass-packages` | KruPass สมาชิกพรีเมียม |

### Seller Center
`seller-dashboard` · `upload-step1` · `upload-step4` · `seller-store` · `store-setup` · `seller-orders` · `seller-analytics` · `seller-wallet` · `seller-onboarding`

### Admin Center
`admin-dashboard` · `admin-moderation` · `admin-kyc` · `admin-disputes` · `admin-finance`

### Assets
`asset-logo` (โลโก้ 1024²) · `asset-illustration-hero` (ภาพ hero 1376×768) · `asset-illustration-2`

## ขั้นตอนการแปลงเป็นโค้ด
1. เปิด `code.html` ของหน้านั้น
2. แปลงเป็น React component (class → className, Material Symbols → icon component)
3. ตัดข้อมูล mock ออก ต่อ data จริงจาก API
4. เทียบกับ `screen.png` เพื่อคุมความถูกต้องของ layout
