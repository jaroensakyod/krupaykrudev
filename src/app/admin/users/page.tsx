import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateUserAction } from "./actions";

export const metadata = { title: "จัดการสมาชิก" };

// TASK-111: user management
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; error?: string; q?: string }>;
}) {
  const session = await requirePermission("user:manage");
  const { done, error, q } = await searchParams;
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(q ? { email: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-headline text-2xl font-bold mb-1">จัดการสมาชิก ({users.length})</h1>
      <p className="text-sm text-text-muted mb-6">เปลี่ยนบทบาท / ระงับบัญชี — ทุกการแก้ไขเข้า audit log</p>

      {done && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">บันทึกแล้ว</p>}
      {error === "self" && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">ไม่สามารถแก้ไขบัญชีตัวเองได้</p>}

      <form action="/admin/users" className="mb-4 flex gap-2">
        <input className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={q} name="q" placeholder="ค้นหาด้วยอีเมล..." type="text" />
        <button className="bg-primary text-white text-sm px-4 rounded-lg" type="submit">
          ค้นหา
        </button>
      </form>

      <div className="space-y-3">
        {users.map((u) => (
          <form key={u.id} action={updateUserAction} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
            <input name="userId" type="hidden" value={u.id} />
            <div className="flex-1 min-w-40">
              <p className="text-sm font-medium">
                {u.displayName} {u.id === session.user.id && <span className="text-xs text-text-muted">(คุณ)</span>}
              </p>
              <p className="text-xs text-text-muted">{u.email}</p>
            </div>
            <select name="role" defaultValue={u.role} className="px-2 py-2 border border-gray-300 rounded-lg text-xs">
              <option value="BUYER">Buyer</option>
              <option value="CREATOR">Creator</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select name="status" defaultValue={u.status} className="px-2 py-2 border border-gray-300 rounded-lg text-xs">
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
            <button className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-primary-dark" type="submit">
              บันทึก
            </button>
          </form>
        ))}
      </div>

      {users.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <MaterialIcon name="search_off" className="text-4xl text-gray-200 mb-3" />
          <p className="text-sm text-text-muted">ไม่พบสมาชิก</p>
        </div>
      )}
    </div>
  );
}
