import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { getOrCreateReferralCode } from "@/lib/growth";
import { prisma } from "@/lib/prisma";
import { MaterialIcon } from "@/components/material-icon";

export const metadata = { title: "แนะนำเพื่อน" };

export default async function ReferralsPage() {
  const session = await requirePermission("product:create");
  const creator = await getCreatorByUserId(session.user.id);
  if (!creator) return null;
  const code = await getOrCreateReferralCode(creator.id, creator.displayName);
  const rewards = await prisma.referralReward.aggregate({ where: { creatorUserId: session.user.id, revokedAt: null }, _sum: { amount: true }, _count: true });
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://krupaykru.com";
  const link = `${origin}/?ref=${code.code}`;
  const amount = rewards._sum.amount?.toNumber() ?? 0;
  return <div className="max-w-3xl space-y-6"><div><p className="text-xs font-bold tracking-wider text-accent">CREATOR REFERRAL</p><h1 className="font-headline text-3xl font-bold mt-1">ชวนเพื่อนมาสร้างรายได้ด้วยกัน</h1><p className="text-sm text-text-muted mt-2">รับ 5% ของค่าบริการแพลตฟอร์มจากยอดซื้อของผู้ที่คุณแนะนำ ภายใน 90 วัน</p></div><section className="rounded-2xl bg-primary-sidebar text-white p-6 md:p-8"><div className="flex gap-4"><div className="w-11 h-11 rounded-xl bg-white/15 grid place-items-center"><MaterialIcon name="share" filled /></div><div><h2 className="font-headline text-xl font-bold">ลิงก์ชวนของคุณพร้อมแล้ว</h2><p className="text-sm text-white/75 mt-1">แชร์ใน Facebook Group หรือโพสต์แนะนำสื่อได้ทันที</p></div></div><div className="mt-5 rounded-xl bg-white p-3 flex items-center gap-3"><code className="min-w-0 flex-1 truncate text-sm text-primary font-medium">{link}</code><span className="text-xs font-bold bg-primary-50 text-primary px-2 py-1 rounded">{code.code}</span></div></section><section className="grid sm:grid-cols-2 gap-4"><div className="bg-white rounded-2xl border border-gray-100 p-5"><span className="text-sm text-text-muted">รายการที่เกิดรายได้</span><p className="font-headline text-3xl font-bold mt-3">{rewards._count}</p><p className="text-xs text-text-muted mt-1">คำสั่งซื้อจากลิงก์ของคุณ</p></div><div className="bg-white rounded-2xl border border-gray-100 p-5"><span className="text-sm text-text-muted">รางวัลรอตรวจสอบ</span><p className="font-headline text-3xl font-bold mt-3">฿{amount.toLocaleString()}</p><p className="text-xs text-text-muted mt-1">พร้อมถอนหลังผ่านเงื่อนไข</p></div></section></div>;
}
