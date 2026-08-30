import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateCreatorAction } from "./actions";

export const metadata = { title: "จัดการผู้ขาย" };

// TASK-112 + คิวยืนยันตัวตน (designs/admin-kyc)
export default async function AdminCreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  await requirePermission("creator:manage");
  const { done } = await searchParams;
  const creators = await prisma.creatorProfile.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } }, _count: { select: { products: true } } },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">จัดการผู้ขาย ({creators.length})</h1>
      <p className="text-sm text-text-muted mb-6">ตั้งสถานะการยืนยันตัวตน — VERIFIED จะแสดงป้ายบนร้าน</p>
      {done && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">บันทึกแล้ว</p>}

      <div className="space-y-3">
        {creators.map((c) => (
          <form key={c.id} action={updateCreatorAction} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
            <input name="creatorId" type="hidden" value={c.id} />
            <div className="flex-1 min-w-48">
              <p className="text-sm font-medium">
                {c.displayName}{" "}
                <Link href={`/creator/${c.slug}`} className="text-xs text-primary hover:underline">
                  @{c.slug}
                </Link>
              </p>
              <p className="text-xs text-text-muted">
                {c.user.email} · {c._count.products} สื่อ
              </p>
            </div>
            <select name="verificationStatus" defaultValue={c.verificationStatus} className="px-2 py-2 border border-gray-300 rounded-lg text-xs">
              <option value="UNVERIFIED">UNVERIFIED</option>
              <option value="BASIC">BASIC</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="RESTRICTED">RESTRICTED</option>
            </select>
            <button className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-primary-dark" type="submit">
              บันทึก
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
