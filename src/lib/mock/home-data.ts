/**
 * Mock data สำหรับหน้าแรก — ใช้ก่อน Phase 6/7 ที่จะต่อข้อมูลจริงจาก DB
 * (URL รูปมาจาก design ของ Stitch จะถูกแทนด้วยรูปจริงจาก storage)
 */

import type { ProductCardData } from "@/components/product-card";

export const GRADE_LEVELS = [
  "เตรียมอนุบาล",
  "อนุบาล",
  "ป.1-3",
  "ป.4-6",
  "ม.1-3",
  "ม.4-6",
  "ปวช./ปวส.",
  "มหาวิทยาลัย",
  "กศน.",
  "PD ครู",
] as const;

export const POPULAR_SEARCHES = [
  "ใบงาน ป.4 คณิตศาสตร์",
  "แผนการสอน หลักสูตรใหม่",
  "ข้อสอบพร้อมเฉลย",
  "โครงงานวิทยาศาสตร์",
  "สื่อฟรี",
] as const;

export const CATEGORIES = [
  {
    name: "สื่อการเรียนการสอน",
    description: "ใบงาน, แบบฝึกหัด, โปสเตอร์, บัตรคำ",
    icon: "school",
    gradient: "from-teal-50 to-primary/10",
    text: "text-primary",
  },
  {
    name: "หนังสือและการอ่าน",
    description: "นิทาน, หนังสืออ่านนอกเวลา",
    icon: "book",
    gradient: "from-amber-50 to-amber-100/50",
    text: "text-amber-700",
  },
  {
    name: "คอร์สและวิดีโอ",
    description: "คลิปสอน, คอร์สออนไลน์",
    icon: "play_circle",
    gradient: "from-blue-50 to-blue-100/50",
    text: "text-blue-700",
  },
  {
    name: "แผนการสอน",
    description: "แผนรายชั่วโมง, แผนบูรณาการ",
    icon: "assignment",
    gradient: "from-purple-50 to-purple-100/50",
    text: "text-purple-700",
  },
  {
    name: "ข้อสอบ/แบบทดสอบ",
    description: "คลังข้อสอบ, เฉลยละเอียด",
    icon: "quiz",
    gradient: "from-rose-50 to-rose-100/50",
    text: "text-rose-700",
  },
  {
    name: "โครงงาน/ผลงาน",
    description: "รายงาน, โครงงานวิทยาศาสตร์",
    icon: "emoji_objects",
    gradient: "from-emerald-50 to-emerald-100/50",
    text: "text-emerald-700",
  },
  {
    name: "สื่อตกแต่งห้องเรียน",
    description: "ป้ายนิเทศ, สติ๊กเกอร์, ป้ายชื่อ",
    icon: "palette",
    gradient: "from-pink-50 to-pink-100/50",
    text: "text-pink-700",
  },
  {
    name: "แบบประเมิน/รูบริก",
    description: "แบบสังเกตพฤติกรรม, รูบริกให้คะแนน",
    icon: "grading",
    gradient: "from-indigo-50 to-indigo-100/50",
    text: "text-indigo-700",
  },
  {
    name: "อื่นๆ",
    description: "สื่ออื่นๆ ที่ไม่จัดอยู่ในหมวดหมู่",
    icon: "category",
    gradient: "from-gray-50 to-gray-200/50",
    text: "text-gray-700",
  },
] as const;

export const NEW_PRODUCTS: ProductCardData[] = [
  {
    id: "mock-1",
    title: "ใบงาน เรื่อง แรงและการเคลื่อนที่ ม.3 พร้อมเฉลยละเอียด (PDF)",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAB1goOSBcQvkJqXI54pRgK3sYtPpG3geTnnJuzgCwAD7BrotDIhpm7yVpqFRVEpolxP8EBSWO72xNkHwTLO2oorJT3Flj-yq8JfQtAyvwSiQVVKFitG1OfCzHPgik-t0rFj1Gvjb9XK1BZsZWjlXwSJB5KizGEQl6ueHzLG4WT_KSyKmRkq99TFqN0iA7a4Lx1ViP3VbM1_gDlL3G4-oxogBWkSugTGtlvK9i5THRgu5ZGFq7IYxNEm_lH45avyXusJ0fFwB6udQ",
    storeName: "Kru Ploy Science",
    storeAvatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZOtNWGRkc2WyrSVH5vb5Vx8IJH_sSvfofgkrxZ2m6VjzWedfnMe9KmRi6irDJZwBfzK3-jHrUkFVjvBxIFxOmSh_qJJhHHDqGd43lorX2o8Rnaj3mz2aZh3o6YrPf7sgnrqbYXyvz_YImkK_qNaShhGHnL4ByItmVhYO1w8ESx8kb2OB71Nff9JTF29L9v9KHlNLQBlIeO15gcyJQoBVb_RdPiJxfgzXU6ZjCaqjiZXjhakQ5Pt3Z6blkU8KRF841ZuzJzouhlQ",
    realTeacherBadge: true,
    rating: 4.9,
    reviewCount: 24,
    price: 89,
    originalPrice: 120,
    badge: { label: "มีส่วนผสม AI", variant: "ai" },
  },
  {
    id: "mock-2",
    title: "บัตรคำศัพท์คณิตศาสตร์ ป.1 - ป.3 สีสันสดใส โหลดฟรี",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_53sqi7XsTztWV2KVQYsYnV_K8wNgjzIglacS_q_lwEW15iDhAw7q20dhy6EHLufIkNnbswROVxnXq-eGttou5cOL_L6cKsjMXlAW_r71AxOUZxABArh9cV-eeMz1KrAk6CqIvQMlGk4g9MQx5O4lHEejn_eBFphy2MB_E3anBE-4o3jcR_K-jgl9W3CvKzV-_k1wJ-Zx2IZ9BnfoJHMZxNm-a8irjdgZLxQ0mTqFHSgDINiHUSz1YVDP-6r_Sfm3k32UyULSWA",
    storeName: "Teacher Tools",
    storeInitial: "T",
    realTeacherBadge: true,
    rating: 5.0,
    reviewCount: 128,
    price: null,
    badge: { label: "ฟรี", variant: "free" },
  },
  {
    id: "mock-3",
    title: "แผนการจัดการเรียนรู้ ภาษาไทย ป.5 (หลักสูตร 2551 ปรับปรุง 60)",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDdpL7RtRXcifmx1D8uu_4OqQHl511FL2LXwQuipJcBYJHHA2sh8Wlooj9A_pTj5ZwG4pGnseDlq_67EzZDO0lRrr8-uoVqhO_LSSR5RrGHaAigW34gMFa9MJy1ppwc5uuFfq0NXohxAg35yA2jgr1KIPq78Z6664gKXFPvmnhaHKbsciWOjaVfooavuREXU2LxNukgAmMLb_8n6b7SQpoOmVpGEv7W9DfdlgG9hDoUV1Tzs-Ke6IopWXhdpA-RDyno8vOhCqGLxw",
    storeName: "Kru Somchai",
    storeInitial: "S",
    realTeacherBadge: true,
    rating: 4.8,
    reviewCount: 45,
    price: 250,
  },
  {
    id: "mock-4",
    title: "PowerPoint เกมทายคำศัพท์ภาษาอังกฤษ หมวดสัตว์น่ารัก (มีเสียง)",
    coverUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAMqWjkDTgpBAYkMqc07kPMSK7i9zgaTfcAJW79JRnRSdm9yDOV_AVZOj443uUhVS5-xDMbVl6C5VwyD9auHR4PEVWOtyh-Q7g2ZE_IiHPBcwYqGpR06r-d6co_XjvsWNGa12NZRPMFCxuOEbtpMhAHISW6uFEPDQB-vSz_udRkXMictsif7pNNlOO-uLzKFjnEHJcUIfhAJTCn1My1HmEEtKn3UqQPrPRGI5UJT1LHyUKwgSmB4h4GKJZl_HcCUWWjH9ZeSkOlPw",
    storeName: "EngJoy Studio",
    storeInitial: "E",
    realTeacherBadge: true,
    rating: 5.0,
    reviewCount: 89,
    price: 59,
    badge: { label: "KruPass", variant: "krupass" },
  },
];

export const POPULAR_SELLERS = [
  {
    name: "Kru Aom Math",
    description: "สื่อคณิตศาสตร์ ป.1 - ป.6",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD29U9ejnQzRuELHMsWmzKgjcQvyH5ubuRZ-CtbkQKHoMPlF_2EH1VoDJh-RWG1LAlvWyVkSvOxQzWn-yD1NNP2p_9fjeB5HaZmQr3A49Coqmcv9BQxt-H0bhijqLt8_8_fifBui2vkpFEM-YXaaU9CMyhyp-pXVOZ0p3rVavbaSxXi_q7ecrUvqqJzajrjhIX9HMQXKCpDZMD3j2b-HK-jZCayzzi7MdAYBJy0-4iVDsfF_RSVUbSwd7KNV9DX1mI6jFlQzua2BA",
    followers: "1.2K",
    rating: "5.0",
    badge: "gold" as const,
  },
  {
    name: "Kru Big Science",
    description: "ใบงานวิทย์ ม.ต้น",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBlYHfe1TOQy4vA050E56l3pYsqkdD-t_-mT7jtopYYVcZDfidMWfbgygUJdsyZ_WA6xBVr7WWKBI0p4drO5_1FpwZL8Wo14Yn1_GAopWnpjcnhnPos7gxomr2oDhSJOulsCx9F6C28LUDQPNg0cSFel7scWsW-rGU9ji80wY6Ft7dJqURm4-8b2pRA7Kp7XaaNnrdB8gVl3pNgOiYB9ebNGqKmayWQtvXulXPcl-YrOmjW0bQssLhuN9tlXFkdNixC64wcY7PGeA",
    followers: "850",
    rating: "4.9",
    badge: "blue" as const,
  },
  {
    name: "Play & Learn",
    description: "สื่อปฐมวัยสีสันสดใส",
    initial: "P",
    followers: "3.4K",
    rating: "4.9",
    badge: null,
  },
  {
    name: "สถาบันภาษาไทย",
    description: "แผนการสอนภาษาไทย",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmHaWqU8F6eFWNP21k5ttp0PnbsT2DIHnRfjLcOd-fHFvEfHV2F8BXhxunnjnRzZPcYNX58zl25Oi2LHoMjAOiS0UDcrED1yksz89iVIlgpb0nBipH2j9TrlQq14W6a9KGvv0DHiUzOqWUsKC03sSgXFq8vp0ZyF-tZpeQKymmn6ayeJVFWX8b4v5uEclypr11ZCrjGPO5tvFKuVD_Jht6pM2v8ZR0s7FHaCU_n4513MLtLRiP7WZAtCCcEyBxRf42NfKhDDzjFQ",
    followers: "5.1K",
    rating: "4.8",
    badge: "institution" as const,
  },
];
