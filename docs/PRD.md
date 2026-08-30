# MASTER PRODUCT REQUIREMENTS DOCUMENT

## Thai Teaching Media Marketplace

**Version:** 1.0
**Status:** Development Ready
**Product Type:** Multi-vendor Digital Education Marketplace
**Primary Market:** Thailand
**Primary Language:** Thai
**Currency:** THB
**Architecture Goal:** Sellable V1 + extensible data foundation

---

# 0. EXECUTIVE SUMMARY

## 0.1 Product Vision

สร้าง Marketplace สำหรับซื้อขาย **สื่อการเรียนการสอนสำหรับตลาดไทย** โดยไม่ได้จำกัดเฉพาะใบงานหรือชีทเรียน

Creator สามารถขาย:

* ใบงาน
* แบบฝึกหัด
* ข้อสอบ
* เฉลย
* สรุปบทเรียน
* Lesson Plan
* Presentation
* PowerPoint
* Template
* Flashcards
* Classroom Games
* Activities
* Posters
* Infographics
* Interactive Resources
* Printable Resources
* Teaching Kits
* Digital Files
* และสื่อการสอนประเภทอื่นในอนาคต

กลุ่ม Creator ไม่จำกัดเฉพาะครู:

* ครู
* ติวเตอร์
* นักศึกษา
* นักออกแบบสื่อ
* ผู้เชี่ยวชาญรายวิชา
* เจ้าของเพจ
* สถาบันกวดวิชา
* Content Creator ด้านการศึกษา

Buyer หลัก:

* ครู
* ติวเตอร์
* ผู้ปกครอง
* นักเรียน/นักศึกษา
* โรงเรียน
* สถาบันการศึกษา

---

# 1. PRODUCT POSITIONING

ผลิตภัณฑ์ไม่ควรเป็นเพียง:

> เว็บฝาก PDF แล้วขาย

แต่เป็น:

> **Thai Teaching Media Marketplace + Creator Commerce Platform**

ความได้เปรียบหลัก:

1. Marketplace สำหรับตลาดไทย
2. Search ที่เข้าใจโครงสร้างการศึกษาไทย
3. AI ช่วย Creator ลงสินค้า
4. AI ช่วย SEO
5. ระบบขายและส่งไฟล์อัตโนมัติ
6. ระบบ Trust/Quality
7. Analytics สำหรับ Creator
8. เก็บ Demand Data ตั้งแต่วันแรก
9. รองรับสื่อหลายประเภท
10. พัฒนาต่อเป็น Education Market Intelligence ได้

---

# 2. BUSINESS OBJECTIVE

## Phase 1

พิสูจน์ว่า:

> Creator ยอมลงสินค้า และ Buyer ยอมจ่ายเงินจริง

## Phase 2

สร้าง Marketplace Flywheel:

Creator → Products → Buyers → Transactions → Creator Revenue → More Creators

## Phase 3

เพิ่ม:

* Creator Pro
* Advertising
* AI tools
* Analytics
* Recommendation
* Bundles

## Phase 4

เพิ่ม:

* School/B2B
* Licensing
* API
* Market Intelligence

## Long-Term

สร้าง Asset ประกอบด้วย:

* Creator Network
* Buyer Network
* Content Catalog
* Transaction Data
* Search Data
* Demand Data
* Trust Data
* SEO Traffic
* AI Infrastructure
* Brand

เพื่อรองรับทั้ง:

* การเติบโตระยะยาว
* Strategic acquisition
* Exit

---

# 3. V1 DEFINITION

V1 ต้องเป็น:

## SELLABLE MARKETPLACE

Creator ต้องทำได้:

Register
→ Creator Onboarding
→ Upload
→ AI Assist
→ Edit Metadata
→ Preview
→ Price
→ Submit
→ Moderation
→ Publish
→ Sell
→ Track Sales
→ Balance
→ Payout

Buyer ต้องทำได้:

Visit
→ Search/Browse
→ Product Detail
→ Preview
→ Cart
→ Checkout
→ Payment
→ Download
→ Purchase History
→ Review

Admin ต้องทำได้:

Moderate
→ Manage Products
→ Manage Users
→ Inspect Orders
→ Process Reports
→ Manage Payouts
→ Inspect Basic Analytics

---

# 4. V1 NON-GOALS

ห้าม Scope Creep

V1 ยังไม่สร้าง:

* Mobile App
* Full AI Tutor
* AI Teacher
* AI Course Generator
* AI Video Generator
* Enterprise School Platform
* Advanced ML Recommendation
* Advanced Ad Auction
* CPC bidding
* Full Creator SaaS
* Data Marketplace
* Public API
* Advanced B2B
* Multi-language
* International marketplace
* Advanced plagiarism ML
* Complex subscription system

Schema อาจเตรียมรองรับ แต่ห้ามทำ UI/Business Logic ก่อน Core Commerce เสร็จ

---

# 5. USER ROLES

## Guest

ทำได้:

* Browse
* Search
* Product Detail
* Preview
* Creator Profile

ทำไม่ได้:

* Purchase
* Download paid files
* Review
* Sell

---

## Buyer

* Purchase
* Download
* Review
* Wishlist
* Order History
* Profile

---

## Creator

มีสิทธิ์ Buyer ทั้งหมด +

* Creator Profile
* Upload
* Product Management
* AI Assistance
* Sales Analytics
* Balance
* Payout

---

## Moderator

* Review products
* Handle reports
* Moderate reviews
* Issue warnings/strikes

---

## Admin

Full operational access

แต่ Financial actions ต้องมี audit log

---

# 6. AUTHENTICATION

รองรับอย่างน้อย:

* Email/password
* Google

อนาคต:

* LINE

ต้องมี:

* Email verification
* Password reset
* Session management
* Login audit
* Rate limiting

Core:

`users`

fields:

* id
* email
* password_hash
* display_name
* avatar_url
* role
* email_verified_at
* status
* created_at
* updated_at
* last_login_at

User status:

* ACTIVE
* SUSPENDED
* BANNED
* DELETED

---

# 7. CREATOR ONBOARDING

Flow:

Register
→ Become Creator
→ Accept Creator Terms
→ Creator Profile
→ Identity/Payout information when required
→ Creator Dashboard

Creator Profile:

* creator_id
* user_id
* display_name
* bio
* profile_image
* banner
* subjects
* grade_levels
* specialties
* social_links
* verification_status
* trust_level
* created_at

Verification:

* UNVERIFIED
* BASIC
* VERIFIED
* RESTRICTED

---

# 8. CREATOR STORE

Public URL:

`/creator/{slug}`

แสดง:

* Creator profile
* Rating
* Product count
* Products
* Subjects
* Followers ในอนาคต
* Verification badge ถ้ามี

V1 ไม่ต้องมี Store Builder

---

# 9. PRODUCT MODEL

Product เป็น Logical Entity

ห้ามผูกสินค้าเข้ากับไฟล์เดียว

หนึ่ง Product สามารถมี:

* หลายไฟล์
* หลาย Version
* หลาย Preview
* หลาย Tag
* หลาย Category

Core:

`products`

* id
* creator_id
* title
* slug
* short_description
* description
* product_type_id
* subject_id
* primary_grade_id
* curriculum_id nullable
* difficulty nullable
* language
* price
* currency
* status
* moderation_status
* visibility
* published_at
* created_at
* updated_at

---

# 10. PRODUCT TYPES

Taxonomy ต้อง Configurable

ตัวอย่าง:

* WORKSHEET
* EXAM
* ANSWER_KEY
* LESSON_PLAN
* PRESENTATION
* FLASHCARD
* ACTIVITY
* GAME
* POSTER
* INFOGRAPHIC
* TEMPLATE
* PRINTABLE
* TEACHING_KIT
* DIGITAL_RESOURCE
* OTHER

ห้าม hard-code ใน UI

ใช้ Database taxonomy

---

# 11. EDUCATION TAXONOMY

แยก:

## Subject

เช่น:

* Mathematics
* Science
* Chemistry
* Physics
* Biology
* Thai
* English
* Social Studies
* Computer
* Art
* etc.

## Grade

รองรับ:

* อนุบาล
* ป.1–ป.6
* ม.1–ม.6
* อาชีวะ
* มหาวิทยาลัย
* อื่น ๆ

## Topic

Topic ต้อง hierarchical

ตัวอย่าง:

Science
→ Chemistry
→ Chemical Equilibrium

## Exam

รองรับ:

* A-Level
* TGAT
* TPAT
* สอวน.
* Entrance
* School Exam
* Other

Taxonomy ต้องแก้ไขได้ผ่าน Admin

---

# 12. PRODUCT VERSIONING

สร้าง:

`product_versions`

* id
* product_id
* version_number
* change_summary
* created_at
* created_by

ห้าม overwrite history ที่จำเป็นต่อ dispute/audit

---

# 13. PRODUCT FILES

`product_files`

* id
* product_id
* version_id
* storage_key
* original_filename
* mime_type
* file_size
* sha256_hash
* file_role
* scan_status
* created_at

file_role:

* ORIGINAL
* BONUS
* ANSWER
* SUPPORTING

---

# 14. FILE STORAGE

ห้ามเก็บ Binary ใน Application Server หรือ DB

ใช้:

Object Storage

โครงสร้าง logical:

`products/{productId}/{versionId}/original/`

`products/{productId}/{versionId}/preview/`

Original file:

PRIVATE

Preview:

PUBLIC/CDN-safe หรือ controlled

Download:

Signed URL

---

# 15. FILE SECURITY

Upload Flow:

Client
→ Request Upload
→ Signed Upload
→ Object Storage
→ Validate
→ Hash
→ Scan
→ Process
→ Ready

ตรวจ:

* MIME
* extension
* file size
* malformed file
* executable
* dangerous archive
* malware scanning capability

ห้ามเชื่อ Content-Type จาก browser อย่างเดียว

---

# 16. PREVIEW SYSTEM

Buyer ต้องดูตัวอย่างก่อนซื้อ

Preview อาจเป็น:

* PDF preview pages
* Images
* Watermarked preview
* Thumbnail

Original ห้ามเปิด Public

---

# 17. PRODUCT STATUS

Lifecycle:

DRAFT
→ PROCESSING
→ READY_FOR_REVIEW
→ UNDER_REVIEW
→ PUBLISHED

Additional:

* REJECTED
* NEEDS_CHANGES
* SUSPENDED
* ARCHIVED

Status transition ต้องควบคุมโดย Service ไม่ใช่ Client

---

# 18. PRODUCT UPLOAD FLOW

Creator:

Create Product
→ Upload Files
→ Processing
→ AI Metadata
→ Creator Review
→ Pricing
→ Preview
→ Copyright Declaration
→ Submit
→ Moderation
→ Publish

ถ้า AI fail:

Creator ต้องกรอกเองได้

AI ห้ามเป็น dependency ที่ทำให้ Publish ไม่ได้

---

# 19. AI PRODUCT ASSISTANT

V1 AI Feature #1

Input:

* extracted content
* filename
* existing metadata

Output structured:

* suggested_title
* description
* subject
* grade
* topic
* product_type
* tags
* keywords
* learning_objectives
* confidence

Creator ต้อง Confirm/Edit

---

# 20. AI SEO ASSISTANT

สร้าง:

* SEO title
* Meta description
* Search keywords
* Tags
* Suggested slug

AI output ต้อง Validate

ไม่ publish claims ที่ไม่มีหลักฐานจาก Product

---

# 21. AI QUALITY ASSISTANT

ตรวจเบื้องต้น:

* metadata completeness
* file readability
* title/content mismatch
* missing preview
* suspicious duplication
* obvious quality issues

Output:

* score
* warnings
* recommendations
* confidence

AI Score ไม่ใช่ final moderation decision

---

# 22. AI ARCHITECTURE

ทุก AI call ผ่าน:

`AI Gateway`

Architecture:

Application
→ AI Gateway
→ Task Router
→ Cost Guard
→ Provider
→ Structured Output Validator
→ Result Store

ห้ามเรียก Provider กระจายทั่ว application

---

# 23. AI PROVIDER ABSTRACTION

Interface:

`generate()`

`generateStructured()`

Business logic ต้องไม่ผูกกับ provider เดียว

รองรับอนาคต:

* Gemini
* OpenAI
* Anthropic
* Other providers

---

# 24. AI TASK TYPES

* PRODUCT_METADATA
* PRODUCT_SEO
* PRODUCT_CLASSIFICATION
* PRODUCT_QUALITY
* SUPPORT
* MODERATION_ASSIST
* SEARCH_ASSIST
* DEMAND_ANALYSIS
* CREATOR_ASSIST

V1 เปิดเพียงที่จำเป็น

---

# 25. AI JOBS

`ai_jobs`

* id
* task_type
* entity_type
* entity_id
* provider
* model
* prompt_version
* input_hash
* status
* confidence
* output_json
* input_tokens
* output_tokens
* estimated_cost
* latency_ms
* created_at
* completed_at

Statuses:

* QUEUED
* PROCESSING
* COMPLETED
* FAILED
* CANCELLED

---

# 26. AI COST CONTROL

ต้องมี:

* per-user quota
* per-task limit
* global daily budget
* global monthly budget
* caching
* retry limit

Cache key:

content_hash + task + prompt_version + model

ห้าม regenerate สิ่งเดิมโดยไม่จำเป็น

---

# 27. SEARCH

V1 Search ต้องค้น:

* title
* description
* subject
* grade
* topic
* product type
* tags
* creator

Filters:

* Subject
* Grade
* Product Type
* Price
* Rating
* File Type
* Exam/Curriculum where applicable

Sort:

* Relevance
* Popular
* New
* Price low-high
* Price high-low
* Rating

---

# 28. THAI SEARCH NORMALIZATION

ต้องมี normalization layer

ตัวอย่าง:

`ม3`

`ม.3`

`มัธยม 3`

`มัธยมศึกษาปีที่ 3`

→ canonical grade

รองรับ synonym dictionary

Admin สามารถเพิ่ม synonym ได้

Search Query เดิมต้องถูกเก็บไว้ด้วย ไม่ใช่เก็บเฉพาะ normalized query

---

# 29. SEARCH EVENT DATA

ทุก Search เก็บ:

`search_events`

* id
* session_id
* user_id nullable
* raw_query
* normalized_query
* filters_json
* result_count
* created_at

และ interaction:

* impression
* click
* purchase attribution

โดยเฉพาะ:

`result_count = 0`

ต้องเก็บเสมอ

เพราะเป็น Demand Gap Signal

---

# 30. PRODUCT EVENT TRACKING

Event Taxonomy V1:

* PRODUCT_IMPRESSION
* PRODUCT_VIEW
* PREVIEW_OPEN
* ADD_TO_CART
* REMOVE_FROM_CART
* CHECKOUT_START
* PURCHASE
* DOWNLOAD
* REVIEW_SUBMIT
* WISHLIST_ADD

ต้องมี:

* event_id
* event_type
* session_id
* user_id nullable
* product_id nullable
* creator_id nullable
* properties_json
* timestamp

---

# 31. EVENT DESIGN PRINCIPLE

เป้าหมายไม่ใช่เก็บ Data เยอะที่สุด

แต่เก็บ Funnel:

Search
→ Impression
→ Click
→ View
→ Preview
→ Cart
→ Checkout
→ Purchase
→ Download
→ Review
→ Repeat Purchase

เพื่อสร้าง:

* Conversion analytics
* Search ranking
* Recommendation
* Demand intelligence
* Creator analytics
* Pricing intelligence

ในอนาคต

---

# 32. PRODUCT DETAIL PAGE

ต้องมี:

* Title
* Creator
* Rating
* Price
* Preview
* Description
* Subject
* Grade
* Topic
* Product type
* File formats
* Number of files
* License/use rights
* Last updated
* Buy/Add cart
* Related products
* Reviews
* Report

ห้าม expose original storage URL

---

# 33. CART

`carts`

`cart_items`

รองรับ:

* Multiple products
* Multiple creators

ต้อง revalidate price ตอน Checkout

Client price ห้ามเป็น source of truth

---

# 34. ORDER

`orders`

* id
* buyer_id
* status
* subtotal
* discount_total
* total
* currency
* payment_status
* created_at
* paid_at

`order_items`

ต้อง snapshot:

* product_id
* creator_id
* title
* unit_price
* platform_fee
* creator_amount
* product_version_id
* license_type

เพื่อไม่ให้ Order History เปลี่ยนเมื่อ Product ถูกแก้

---

# 35. PAYMENT

Payment Provider ต้องเป็น abstraction

`payments`

* id
* order_id
* provider
* provider_payment_id
* amount
* currency
* status
* paid_at
* raw_reference

Backend verify payment

ห้ามเชื่อ redirect จาก Client

ใช้ webhook/verification

---

# 36. FINANCIAL LEDGER

ห้ามคำนวณ Creator Wallet จาก Order โดยตรง

สร้าง immutable ledger

`ledger_entries`

* id
* transaction_group_id
* account_type
* account_id
* entry_type
* amount
* currency
* direction
* order_id nullable
* payout_id nullable
* refund_id nullable
* created_at

Types:

* SALE
* PLATFORM_FEE
* PAYMENT_FEE
* CREATOR_EARNING
* REFUND
* PAYOUT
* ADJUSTMENT

---

# 37. REVENUE LOGIC

V1:

Platform Commission

ค่าเริ่มต้น configurable เช่น:

15%

ห้าม hard-code

สร้าง:

`platform_fee_rules`

รองรับอนาคต:

* Creator tier
* Product type
* Campaign
* Subscription
* Custom rate

---

# 38. CREATOR BALANCE

แยก:

* pending_balance
* available_balance

Flow:

Purchase
→ Creator Pending
→ Refund/Hold Period
→ Available
→ Payout

Balance UI ต้อง derive จาก ledger/materialized balance ที่ reconcile ได้

---

# 39. PAYOUT

`payouts`

* id
* creator_id
* amount
* method
* status
* requested_at
* processed_at
* provider_reference

Statuses:

* REQUESTED
* REVIEWING
* PROCESSING
* PAID
* FAILED
* CANCELLED

V1 อาจทำ Manual Admin payout ได้ หาก payment/legal design กำหนดไว้ชัดเจน

---

# 40. REFUND

`refunds`

* id
* order_id
* amount
* reason
* status
* requested_by
* reviewed_by
* created_at
* completed_at

Refund ต้อง Reverse Ledger

ห้าม delete transaction

---

# 41. PURCHASE ENTITLEMENT

สร้าง:

`entitlements`

เพื่อระบุว่า Buyer มีสิทธิ์เข้าถึงอะไร

* id
* buyer_id
* order_item_id
* product_id
* product_version_id
* license_type
* granted_at
* revoked_at nullable

Download authorization ตรวจ entitlement

ไม่ตรวจแค่ order status

---

# 42. DOWNLOAD

Flow:

Buyer
→ Request Download
→ Authenticate
→ Check Entitlement
→ Check Product/File
→ Generate short-lived signed URL
→ Log Download

`download_events`

เก็บ:

* buyer
* product
* file
* order
* timestamp

---

# 43. REVIEWS

เฉพาะ Verified Purchase

`reviews`

* id
* product_id
* buyer_id
* order_item_id
* rating
* title
* body
* status
* created_at

V1 rating 1–5

ป้องกัน Review ซ้ำต่อ Order Item

---

# 44. WISHLIST

V1 ถ้าเวลาเพียงพอ

`wishlists`

`wishlist_items`

ใช้เป็น signal สำหรับ Recommendation ในอนาคต

---

# 45. TRUST SYSTEM

V1 Trust Layer:

Creator Verification

* Product Moderation
* Copyright Declaration
* File Hash
* Report System
* Strike System
* Audit Log

---

# 46. COPYRIGHT DECLARATION

ก่อน Submit Creator ต้องยืนยันว่า:

* มีสิทธิ์ขาย
* ไม่ละเมิดงานผู้อื่น
* มีสิทธิ์ใช้ asset ที่อยู่ในงาน
* ยอมรับนโยบาย takedown

เก็บ:

* declaration_version
* accepted_at
* creator_id
* product_id

---

# 47. DUPLICATE DETECTION

V1:

SHA-256

ตรวจ:

Exact duplicate

ผล:

* duplicate own product
* duplicate other creator
* no match

ห้าม auto-ban

ส่ง moderation เมื่อผิดปกติ

อนาคต:

* text similarity
* embeddings
* image similarity

---

# 48. REPORT SYSTEM

Buyer/User report:

* Copyright
* Misleading
* Broken File
* Inappropriate
* Spam
* Duplicate
* Other

`reports`

* id
* reporter_id
* entity_type
* entity_id
* reason
* description
* status
* created_at

---

# 49. MODERATION CASE

`moderation_cases`

รองรับ:

* Product review
* Copyright
* Fraud
* User report
* Payment dispute

Fields:

* id
* case_type
* entity_type
* entity_id
* risk_level
* status
* assigned_to
* resolution
* created_at
* resolved_at

---

# 50. STRIKE SYSTEM

`strikes`

* id
* user_id
* reason
* severity
* related_case_id
* expires_at nullable
* created_at

ห้าม ban จาก AI อย่างเดียว

Enforcement ผ่าน policy/service

---

# 51. TRUST SCORE

เตรียม schema

แต่ V1 ไม่ต้องสร้าง ML

Signals ในอนาคต:

* account age
* verification
* completed sales
* refund rate
* report rate
* product quality
* duplicate rate
* review quality

Trust Score เป็น signal

ไม่ใช่ sole decision maker

---

# 52. ADMIN DASHBOARD

ต้องมี:

Overview:

* Users
* Creators
* Products
* Published Products
* Orders
* GMV
* Platform Revenue
* Pending Moderation
* Pending Payout
* Reports

---

# 53. ADMIN PRODUCT MODERATION

Admin เห็น:

* Product
* Creator
* Files
* Preview
* Metadata
* AI suggestions
* Quality warnings
* Duplicate hash matches
* Copyright declaration
* Creator history

Actions:

* Approve
* Reject
* Needs Changes
* Suspend

ทุก action → Audit Log

---

# 54. AUDIT LOG

`audit_logs`

* id
* actor_id
* action
* entity_type
* entity_id
* before_json optional
* after_json optional
* metadata_json
* created_at

ต้องใช้กับ:

* Moderation
* Financial adjustment
* Payout
* User suspension
* Product suspension
* Trust action

---

# 55. CREATOR DASHBOARD

V1:

Overview:

* Revenue
* Sales
* Products
* Views
* Conversion
* Pending balance
* Available balance

Products:

* Draft
* Review
* Published
* Needs changes
* Suspended

Sales:

* Orders
* Product
* Amount
* Creator earning

AI:

* Product assistance

---

# 56. CREATOR ANALYTICS

V1 เก็บข้อมูลครบก่อน

UI แสดงอย่างน้อย:

* Views
* Sales
* Conversion
* Revenue
* Top products

อนาคต:

* Search keywords
* Demand score
* Opportunity
* Pricing
* competitor intelligence

---

# 57. BUYER ACCOUNT

Pages:

* Profile
* Orders
* Downloads
* Reviews
* Wishlist

Buyer สามารถ download ของที่ซื้อได้โดยไม่ต้องหา email เก่า

---

# 58. SEO ARCHITECTURE

Indexable pages:

* Product
* Category
* Subject
* Grade
* Topic
* Creator

สร้าง:

* canonical
* metadata
* sitemap
* structured data where appropriate
* breadcrumbs
* internal links

---

# 59. PROGRAMMATIC SEO GUARD

ห้ามสร้างหน้า:

subject × grade × topic × type

ทุก combination โดยอัตโนมัติ

สร้างหน้า indexable เมื่อ:

* มี inventory จริง
* มี content/value
* ไม่เป็น thin page

Empty search pages:

NOINDEX

---

# 60. URL DESIGN

ตัวอย่าง:

`/products/{slug}`

`/creators/{slug}`

`/subjects/{slug}`

`/grades/{slug}`

`/topics/{slug}`

Slug เปลี่ยนได้แต่ต้องมี redirect history หาก public แล้ว

---

# 61. RELATED PRODUCTS

V1 rule-based

Score จาก:

* same topic
* same subject
* same grade
* same type
* popularity

ไม่ต้อง ML

---

# 62. RECOMMENDATION FUTURE READINESS

Event data ต้องทำให้อนาคตสร้าง:

* Frequently viewed together
* Frequently bought together
* Personalized recommendations
* Creator affinity
* Topic affinity

ได้โดยไม่เปลี่ยน tracking ใหม่

---

# 63. DATA ARCHITECTURE PRINCIPLE

แยก:

## Operational Data

Users
Products
Orders
Payments

## Event Data

Search
View
Click
Cart
Purchase

## AI Data

Jobs
Results
Usage

## Trust Data

Reports
Moderation
Strikes

## Financial Data

Ledger
Payout
Refund

ห้ามยัดทั้งหมดลงตาราง Product/User

---

# 64. CORE DATABASE ENTITIES

ขั้นต่ำ:

users
creator_profiles
products
product_versions
product_files
product_previews
product_types
subjects
grades
topics
curricula
tags
product_tags
orders
order_items
payments
refunds
ledger_entries
payouts
entitlements
reviews
wishlists
wishlist_items
carts
cart_items
ai_jobs
ai_usage
search_events
analytics_events
download_events
reports
moderation_cases
strikes
copyright_declarations
audit_logs
notifications
platform_fee_rules

---

# 65. DATABASE RULES

ทุกตารางสำคัญ:

* UUID/appropriate unique ID
* created_at
* updated_at where relevant

ใช้ Foreign Keys

ใช้ Index ตาม query pattern

Financial records:

ห้าม hard delete

Orders:

ห้าม mutate historical monetary snapshot

Files:

ใช้ storage key ไม่ใช้ public URL เป็น canonical reference

---

# 66. SOFT DELETE

Entities เช่น:

Product
User
Creator

ใช้:

`deleted_at`

เมื่อเหมาะสม

Financial/Audit:

ไม่ delete

---

# 67. PRIVACY

เก็บ PII เท่าที่จำเป็น

ห้ามใส่:

* email
* phone
* payment info

ใน analytics event metadata โดยไม่จำเป็น

Analytics ใช้:

* user_id
* pseudonymous session_id

---

# 68. SECURITY

Baseline:

* HTTPS
* secure cookies
* CSRF protection where applicable
* XSS prevention
* SQL injection protection
* authorization server-side
* rate limiting
* upload validation
* webhook verification
* signed downloads
* secrets management

---

# 69. AUTHORIZATION

ทุก protected action:

User
→ Session
→ Authorization
→ Service
→ Database

ห้ามพึ่ง UI hide button

ตัวอย่าง:

Creator A ห้ามแก้ Product Creator B

Buyer ห้าม download สินค้าที่ไม่มี entitlement

Moderator ห้ามทำ Financial Admin action ถ้าไม่มี permission

---

# 70. AI SECURITY

Product content = UNTRUSTED INPUT

ป้องกัน:

Prompt injection

AI ไม่มี DB access โดยตรง

Architecture:

AI
→ Tool
→ Authorization
→ Service
→ DB

---

# 71. NOTIFICATION

V1:

* Product approved
* Product rejected
* Product needs changes
* New sale
* Payment success
* Payout update
* Report update

Channels:

* In-app
* Email

อนาคต:

LINE

---

# 72. ANALYTICS KPIs

Founder Dashboard ต้องรองรับ:

## Marketplace

* GMV
* Orders
* AOV
* Buyers
* Creators
* Active creators
* Published products

## Funnel

* Search
* Product view
* Add cart
* Checkout
* Purchase

## Creator

* Signup → Upload
* Upload → Publish
* Publish → First Sale

## Buyer

* Signup → First Purchase
* Repeat purchase

## Quality

* Refund
* Reports
* Review rating

## Cost

* AI usage
* Storage
* Bandwidth

---

# 73. NORTH STAR

V1:

Successful Paid Orders

Secondary:

* GMV
* Repeat Buyer Rate
* Creator First Sale Rate

ห้ามใช้ Registered Users เป็น metric หลัก

---

# 74. DEMAND DATA

เก็บ:

* Search volume
* Zero-result searches
* Low-result searches
* Search click
* Search purchase
* Product view
* Cart
* Purchase

อนาคตคำนวณ:

Demand Score
Supply Score
Competition Score
Opportunity Score

---

# 75. REVENUE MODEL

V1:

## Marketplace Commission

ตัวอย่าง default:

15%

Configurable

หลัง traction:

* Featured
* Creator Pro
* Bundle
* Promotion

อนาคต:

* AI Credits
* Premium Analytics
* B2B
* School License
* API
* Market Intelligence

---

# 76. UNIT ECONOMICS

ต้องติดตาม:

GMV

Platform Revenue

Payment Cost

AI Cost

Storage Cost

Bandwidth Cost

Refund Cost

Contribution Margin

สูตร:

Contribution = Platform Revenue − Variable Costs

ห้ามตีความ Commission = Profit

---

# 77. PAYMENT/LEGAL ASSUMPTION GATE

ก่อน Production Payment ต้องยืนยัน:

* Payment provider
* Marketplace payment capability
* payout capability
* KYC requirement
* refund process
* settlement timing
* tax treatment
* invoice/receipt requirements
* platform terms
* creator terms

ห้าม Codex invent payment/legal assumptions

ถ้ายังไม่ยืนยัน:

ใช้ Payment Adapter + Mock/Sandbox

---

# 78. ARCHITECTURE

แนะนำ Logical Architecture:

Frontend
→ Application/API
→ Services
→ Database

External:

Object Storage
CDN
Payment
Email
AI Providers
Analytics/Monitoring

Async:

Queue/Worker สำหรับ:

* File processing
* Preview
* AI
* Notifications
* heavy moderation tasks

---

# 79. TECH STACK PRINCIPLE

ต้องเลือก:

* mainstream
* low operational overhead
* managed where possible
* scalable without premature complexity

Frontend/Full-stack:

Next.js + TypeScript

Database:

PostgreSQL

ORM:

เลือกหนึ่งตัวและล็อกก่อน Development

Storage:

S3-compatible object storage

Deployment:

Managed platform

ห้ามเริ่ม Microservices

ใช้ Modular Monolith

---

# 80. MODULAR MONOLITH MODULES

`auth`

`users`

`creators`

`catalog`

`products`

`files`

`search`

`cart`

`checkout`

`orders`

`payments`

`ledger`

`payouts`

`reviews`

`trust`

`moderation`

`ai`

`analytics`

`notifications`

`admin`

แต่ละ Module มี clear boundary

---

# 81. OBSERVABILITY

Production ต้องมี:

* Error tracking
* Request logs
* Job failures
* Payment webhook logs
* AI failures
* Storage failures
* Security events

Financial operations ต้อง trace ได้

---

# 82. BACKUP

Database:

Automated backup

Object Storage:

durability/versioning policy ตาม provider

ก่อน Launch ต้องทดสอบ restore procedure

---

# 83. PERFORMANCE

V1 targets:

Product page ต้องรู้สึกเร็ว

Images/preview ใช้ CDN

Search ไม่ควร scan DB แบบไร้ index

Pagination ทุก listing

Admin large tables ต้อง pagination

---

# 84. ACCESSIBILITY / MOBILE

ตลาดไทยใช้มือถือสูง

V1 ต้อง:

Mobile-first responsive

Creator upload อาจเหมาะ desktop มากกว่า แต่ต้องใช้งาน mobile ได้ในระดับพื้นฐาน

Buyer purchase flow ต้องดีบนมือถือ

---

# 85. UI PAGES

Public:

* Home
* Search
* Category
* Subject
* Grade
* Topic
* Product
* Creator
* Login/Register
* Terms
* Privacy
* Copyright
* Help

Buyer:

* Account
* Orders
* Downloads
* Wishlist
* Reviews

Creator:

* Dashboard
* Products
* New Product
* Edit Product
* Sales
* Analytics
* Balance
* Payout
* Settings

Admin:

* Dashboard
* Products
* Moderation
* Users
* Creators
* Orders
* Payments
* Payouts
* Reports
* Taxonomy
* AI usage
* Audit

---

# 86. HOMEPAGE V1

Sections:

Search hero

Categories

Popular subjects

Popular grades

New products

Popular products

Featured creators

CTA:

“เริ่มขายสื่อของคุณ”

ไม่ทำ homepage ซับซ้อนเกินไป

---

# 87. CREATOR UPLOAD UX

เป้าหมาย:

ลด friction

Wizard:

1 Upload
2 AI Processing
3 Product Information
4 Classification
5 Preview
6 Pricing
7 Rights Declaration
8 Review
9 Submit

Auto-save Draft

---

# 88. ERROR RECOVERY

Upload fail:

Retry

AI fail:

Manual continue

Preview fail:

Retry processing

Payment fail:

Order remains unpaid

Webhook delay:

Reconciliation

Download fail:

Regenerate signed URL

ห้ามให้ User ต้องสร้างทุกอย่างใหม่เพราะขั้นตอนเดียว fail

---

# 89. IDEMPOTENCY

Payment webhook:

ต้อง idempotent

Payout:

ต้อง idempotent

AI job:

ควร deduplicate

File processing:

ควร safe retry

เพื่อป้องกัน:

Double charge
Double commission
Double payout

---

# 90. MARKETING READINESS

ก่อนเริ่ม Creator Acquisition หนัก เว็บต้องผ่าน:

Creator Signup ✓
Upload ✓
AI Assist ✓
Moderation ✓
Publish ✓
Product Page ✓
Search ✓
Checkout ✓
Payment ✓
Download ✓
Creator Sale ✓
Balance ✓
Admin ✓

นี่คือ Definition:

**Sellable MVP**

---

# 91. PRE-LAUNCH MARKETING

ระหว่าง Development ทำได้:

* Brand
* Domain
* Social accounts
* Facebook Page
* TikTok
* Landing page
* Creator waitlist
* Content backlog
* Demo videos
* Creator outreach list

ยังไม่เชิญ Creator จำนวนมากจน Upload/Sell flow พร้อม

---

# 92. V1 FREEZE

เมื่อเริ่ม Development:

ห้ามเพิ่ม Feature นอก V1 จน Critical Path ผ่าน

Critical Path:

Creator
→ Product
→ Publish
→ Buyer
→ Payment
→ Entitlement
→ Download
→ Ledger
→ Creator Balance

ทุก feature ใหม่ไป:

`BACKLOG`

---

# 93. MVP DEVELOPMENT PHASE 0 — FOUNDATION

TASK-001 Initialize repository

TASK-002 Configure Next.js/TypeScript

TASK-003 Configure environment validation

TASK-004 Configure PostgreSQL

TASK-005 Configure ORM/migrations

TASK-006 Configure authentication

TASK-007 Create RBAC

TASK-008 Create application layout/design system

TASK-009 Configure logging/error monitoring

TASK-010 CI baseline

Definition of Done:

Application deployable + auth + DB + CI

---

# 94. PHASE 1 — USER & CREATOR

TASK-011 Users schema

TASK-012 Profile

TASK-013 Creator schema

TASK-014 Become Creator flow

TASK-015 Creator public page

TASK-016 Creator dashboard shell

TASK-017 Creator terms acceptance

TASK-018 Creator verification state

Acceptance:

User สมัครและเปลี่ยนเป็น Creator ได้

---

# 95. PHASE 2 — CATALOG

TASK-020 Product schema

TASK-021 Product version schema

TASK-022 Product type taxonomy

TASK-023 Subject taxonomy

TASK-024 Grade taxonomy

TASK-025 Topic taxonomy

TASK-026 Tag system

TASK-027 Product draft

TASK-028 Product editor

TASK-029 Product lifecycle

Acceptance:

Creator สร้าง Draft Product ได้ครบ

---

# 96. PHASE 3 — FILES

TASK-030 Object storage integration

TASK-031 Signed upload

TASK-032 File validation

TASK-033 File hash

TASK-034 Product files

TASK-035 Preview processing

TASK-036 Thumbnail

TASK-037 Signed download

TASK-038 Download log

Acceptance:

Upload → Preview → Secure Download ทำงาน

---

# 97. PHASE 4 — AI

TASK-040 AI Provider Interface

TASK-041 AI Gateway

TASK-042 AI Job schema

TASK-043 Cost logging

TASK-044 Metadata task

TASK-045 Classification task

TASK-046 SEO task

TASK-047 Quality task

TASK-048 Structured validation

TASK-049 Creator confirmation UI

Acceptance:

Upload แล้ว AI ช่วยกรอกสินค้าได้ แต่ Creator แก้เองได้

---

# 98. PHASE 5 — TRUST

TASK-050 Copyright declaration

TASK-051 Duplicate hash check

TASK-052 Moderation case

TASK-053 Admin moderation queue

TASK-054 Approve/reject/changes

TASK-055 Report product

TASK-056 Strike schema

TASK-057 Audit log

Acceptance:

ไม่มีสินค้า publish โดยข้าม moderation policy

---

# 99. PHASE 6 — MARKETPLACE

TASK-060 Homepage

TASK-061 Product page

TASK-062 Creator page

TASK-063 Search

TASK-064 Thai normalization

TASK-065 Filters

TASK-066 Sorting

TASK-067 Related products

TASK-068 SEO metadata

TASK-069 Sitemap

Acceptance:

Buyer หาและดูสินค้าได้ดีทั้ง desktop/mobile

---

# 100. PHASE 7 — COMMERCE

TASK-070 Cart

TASK-071 Checkout

TASK-072 Order schema

TASK-073 Order item snapshot

TASK-074 Payment adapter

TASK-075 Payment session

TASK-076 Payment webhook

TASK-077 Payment verification

TASK-078 Entitlement

TASK-079 Purchase history

Acceptance:

เงินจริงหรือ Sandbox production-equivalent flow:

Cart → Pay → Order Paid → Entitlement

---

# 101. PHASE 8 — FINANCE

TASK-080 Ledger

TASK-081 Commission engine

TASK-082 Pending balance

TASK-083 Available balance

TASK-084 Refund

TASK-085 Ledger reversal

TASK-086 Payout request

TASK-087 Admin payout

TASK-088 Reconciliation

Acceptance:

ทุกบาท Trace ได้

---

# 102. PHASE 9 — BUYER

TASK-090 Downloads page

TASK-091 Review

TASK-092 Wishlist

TASK-093 Account

TASK-094 Notifications

Acceptance:

Buyer กลับมาหาของที่ซื้อได้ตลอดตาม entitlement

---

# 103. PHASE 10 — ANALYTICS

TASK-100 Analytics event service

TASK-101 Session ID

TASK-102 Search event

TASK-103 Product impression

TASK-104 Product view

TASK-105 Cart event

TASK-106 Checkout event

TASK-107 Purchase attribution

TASK-108 Creator analytics

TASK-109 Founder dashboard

Acceptance:

สามารถ reconstruct conversion funnel ได้

---

# 104. PHASE 11 — ADMIN

TASK-110 Admin dashboard

TASK-111 User management

TASK-112 Creator management

TASK-113 Product management

TASK-114 Order inspection

TASK-115 Payment inspection

TASK-116 Payout queue

TASK-117 Report queue

TASK-118 Taxonomy manager

TASK-119 AI usage dashboard

Acceptance:

Founder ดูแล operation หลักจาก Admin เดียวได้

---

# 105. PHASE 12 — HARDENING

TASK-120 Authorization audit

TASK-121 Rate limiting

TASK-122 Upload abuse tests

TASK-123 Payment idempotency tests

TASK-124 Ledger tests

TASK-125 Download security tests

TASK-126 AI failure tests

TASK-127 Mobile QA

TASK-128 SEO QA

TASK-129 Performance QA

TASK-130 Backup/restore test

---

# 106. PHASE 13 — LAUNCH

TASK-131 Production environment

TASK-132 Domain

TASK-133 Email

TASK-134 Production storage

TASK-135 Payment production configuration

TASK-136 Monitoring

TASK-137 Legal pages

TASK-138 Creator onboarding content

TASK-139 Help center basics

TASK-140 Seed marketplace

TASK-141 Launch checklist

---

# 107. TASK TEMPLATE FOR CODEX

ทุก Task ที่ส่งให้ Coding Agent ต้องมี:

ID

Title

Goal

Context

Dependencies

Files/modules affected

Database change

API change

UI change

Security consideration

Analytics events

Acceptance Criteria

Tests

Definition of Done

ห้ามสั่ง:

“ทำ marketplace ต่อ”

ต้องสั่งเป็น bounded task

---

# 108. ACCEPTANCE CRITERIA — CREATOR

Creator ใหม่ต้องสามารถ:

1 สมัคร
2 Verify
3 Become Creator
4 Upload
5 AI Analyze
6 Edit
7 Price
8 Preview
9 Declare rights
10 Submit
11 Admin approve
12 Product live

โดยไม่ต้องให้ Developer แก้ DB มือ

---

# 109. ACCEPTANCE CRITERIA — BUYER

Buyer ใหม่ต้อง:

1 Search
2 View
3 Preview
4 Add cart
5 Checkout
6 Pay
7 Receive entitlement
8 Download
9 See order history
10 Review

---

# 110. ACCEPTANCE CRITERIA — FINANCE

หลัง Payment:

Order = PAID

Payment = VERIFIED

Ledger created exactly once

Creator earning created exactly once

Platform fee created exactly once

Entitlement created exactly once

Webhook retry ไม่สร้าง duplicate

---

# 111. ACCEPTANCE CRITERIA — DATA

ต้องตอบได้:

* คนค้นหาอะไร
* Search ไหนไม่มีผลลัพธ์
* สินค้าไหนถูกเห็น
* สินค้าไหนถูกคลิก
* สินค้าไหนดู Preview
* สินค้าไหนใส่ Cart
* สินค้าไหนซื้อ
* Creator ไหนขาย
* Buyer กลับมาซื้อหรือไม่

โดยไม่ต้องเพิ่ม tracking หลัง Launch

---

# 112. ACCEPTANCE CRITERIA — AI

AI unavailable:

Marketplace ยังขายได้

AI wrong:

Creator แก้ได้

AI output:

Structured + validated

AI usage:

มี cost/usage log

AI provider:

เปลี่ยนได้ผ่าน abstraction

---

# 113. GO-LIVE BLOCKERS

ห้าม Launch ถ้า:

* Payment duplicate ได้
* Download original เป็น public
* Creator เข้าถึงสินค้าคนอื่นได้
* Ledger reconcile ไม่ได้
* Webhook ไม่มี verification
* Upload ไม่ validate
* Admin action ไม่มี audit ใน critical actions
* Refund ทำเงินเพี้ยน
* Backup ไม่ทำงาน
* Terms/Copyright policy ไม่มี

---

# 114. GO-LIVE CHECKLIST

## Commerce

☐ Product
☐ Search
☐ Cart
☐ Checkout
☐ Payment
☐ Download

## Creator

☐ Upload
☐ AI
☐ Moderation
☐ Sales
☐ Balance
☐ Payout

## Trust

☐ Copyright
☐ Report
☐ Audit
☐ Duplicate hash

## Data

☐ Search events
☐ Product events
☐ Purchase attribution
☐ Download events

## Operations

☐ Monitoring
☐ Backup
☐ Admin
☐ Support

---

# 115. FIRST LAUNCH TARGET

ไม่ใช่เป้าหมายรับประกัน

ใช้เป็น Validation Target:

* 30–50 initial creators
* 300+ useful products
* หมวดหลักมี inventory จริง
* First external paid transaction
* Creator first sale
* Repeat buyer signal

อย่าเปิด 100 หมวดที่แต่ละหมวดมีสินค้า 2 ชิ้น

---

# 116. SUPPLY STRATEGY

เปิด Marketplace แบบ Concentrated Supply

เลือก initial verticals ตาม:

* Existing creator supply
* Search demand
* Buying intent
* Seasonality

แล้วเติมสินค้าให้แน่น

ค่อยขยาย taxonomy

---

# 117. MARKETING SYSTEM AFTER SELLABLE MVP

Creator Acquisition:

Creator discovery
→ Outreach
→ Landing page
→ Register
→ First upload
→ First publish
→ First sale
→ Repeat upload

Buyer:

SEO

* Social Content
* Creator Audience
* Community
* Referral
  → Product
  → Purchase
  → Repeat

---

# 118. FUTURE MONETIZATION

หลัง Marketplace มี liquidity:

## Creator Pro

* lower commission
* more AI
* analytics
* demand intelligence

## Promotion

* Sponsored product
* Featured category
* Campaign

## AI

* AI credits

## B2B

* School licenses

## Intelligence

* aggregated market insights

ห้ามขาย personal user data

---

# 119. FUTURE DATA PRODUCTS

Data Layer อาจพัฒนาเป็น:

Demand Intelligence

Creator Opportunity Engine

Pricing Intelligence

Trend Detection

Education Search Trends

Supply Gap Analysis

B2B Market Reports

ทั้งหมดใช้ aggregated/anonymized data

---

# 120. FUTURE AI

เมื่อ Data เพียงพอ:

Creator Copilot

Buyer Shopping Assistant

Semantic Search

Recommendation

Demand Prediction

Pricing Suggestions

Bundle Suggestions

Advanced Quality

Advanced Duplicate Detection

Admin Copilot

---

# 121. FUTURE MARKETPLACE EVOLUTION

V1:

Marketplace

↓

V2:

AI-powered Marketplace

↓

V3:

Creator Commerce Platform

↓

V4:

Education Market Intelligence

↓

V5:

Education Content Infrastructure/API

---

# 122. EXIT READINESS

ตั้งแต่วันแรกต้องเก็บ Metrics ที่ผู้ซื้อกิจการสนใจ:

* GMV
* Net revenue
* Growth
* Take rate
* Gross margin
* Active creators
* Creator retention
* Buyer retention
* Repeat purchase
* AOV
* CAC
* LTV
* Organic traffic
* Catalog size
* Conversion
* Content quality
* Search demand
* Network concentration

Asset สำคัญ:

Creator Network

* Buyer Network
* Content Catalog
* SEO
* Transactions
* Data
* AI
* Brand

---

# 123. ARCHITECTURAL RULES

1. Modular Monolith ก่อน Microservices
2. PostgreSQL เป็น Source of Truth
3. Files อยู่ Object Storage
4. Original files private
5. Financial ledger immutable
6. AI ผ่าน Gateway
7. AI ไม่เป็น Source of Truth
8. Analytics เป็น Event-based
9. Taxonomy configurable
10. Payment provider abstracted
11. Search normalization แยกจาก UI
12. Authorization server-side
13. Critical actions audited
14. Jobs retry ได้
15. Payment operations idempotent
16. Schema migration ผ่าน migration system เท่านั้น
17. Production secrets ไม่อยู่ repository
18. V1 scope frozen จน Commerce Critical Path ผ่าน

---

# 124. DEVELOPMENT PRIORITY

ถ้าเวลาจำกัด ให้เรียง:

P0

Auth
Creator
Product
File
Moderation
Marketplace
Search
Checkout
Payment
Entitlement
Download
Ledger
Balance
Admin

P1

AI Metadata
AI SEO
Basic Quality
Analytics
Review
Wishlist

P2

Related Products
Creator Analytics improvements
Notifications improvements

ทุกอย่างนอกนี้ Backlog

---

# 125. SINGLE-FOUNDER PRINCIPLE

ทุกระบบถามคำถามว่า:

> Founder ต้องเข้าไปทำเองหรือไม่?

ถ้าทำ Automation ได้โดยปลอดภัย ให้ทำ

ระบบควรส่ง Founder เฉพาะ:

* Exception
* High risk
* Dispute
* Failed payout
* Suspicious product
* Copyright report
* Failed processing

ไม่ใช่ทุก transaction

---

# 126. DEFINITION OF MVP COMPLETE

MVP ไม่ถือว่าเสร็จเพราะหน้าเว็บครบ

ถือว่าเสร็จเมื่อสามารถทำ End-to-End Test:

Creator A
→ สมัคร
→ Upload Product
→ AI ช่วยกรอก
→ Submit
→ Admin approve
→ Product indexed/searchable

Buyer B
→ Search
→ Preview
→ Add Cart
→ Pay
→ Order verified
→ Entitlement granted
→ Download

System
→ Commission recorded
→ Creator earning recorded
→ Analytics recorded
→ Creator sees sale
→ Admin sees transaction

โดยไม่มี Developer เข้าไปแก้ Database

นี่คือ:

**SELLABLE MVP COMPLETE**

---

# 127. FINAL PRODUCT PRINCIPLE

เราไม่ได้พยายามสร้าง TPT ภาษาไทยแบบ Copy Feature ต่อ Feature

เรากำลังสร้าง:

**Marketplace สำหรับเศรษฐกิจผู้สร้างสื่อการเรียนการสอนของไทย**

ความได้เปรียบในระยะแรก:

Thai-first

* Creator-friendly
* AI-assisted selling
* Search
* Automated commerce

ความได้เปรียบระยะยาว:

Transactions

* Search behavior
* Demand data
* Creator data
* Trust graph
* Content catalog
* AI intelligence

ดังนั้นหลักสำคัญที่สุดของ Development คือ:

**Build the transaction engine first.**

**Capture useful data from day one.**

**Use AI to remove work, not add complexity.**

**Design for extension, but do not build the future prematurely.**

**Get Creator → Product → Buyer → Money working before everything else.**
