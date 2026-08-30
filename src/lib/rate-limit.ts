/**
 * TASK-121: in-memory sliding-window rate limiter (PRD §68: rate limiting)
 * หมายเหตุ: บน Vercel serverless แบบ multi-instance ตัวนับจะแยกต่อ instance —
 * production จริงจังควรเปลี่ยนเป็น Upstash Redis (@upstash/ratelimit) โดยคง interface เดียวกัน
 */

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();

// กัน memory leak — ล้าง bucket ที่ไม่ active
const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.hits.length === 0 || now - bucket.hits[bucket.hits.length - 1] > 10 * 60 * 1000) {
      buckets.delete(key);
    }
  }
}

export type RateLimitResult = { allowed: boolean; retryAfterSec: number };

export function rateLimit(key: string, limit: number, windowSec: number): RateLimitResult {
  cleanup();
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return { allowed: false, retryAfterSec: Math.ceil((oldest + windowMs - now) / 1000) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSec: 0 };
}

/** key สำหรับต่อ IP — ใช้ x-forwarded-for (Vercel) หรือ fallback */
export function ipKey(request: Request | { headers: Headers }, prefix: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return `${prefix}:${ip}`;
}
