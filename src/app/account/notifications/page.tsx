import Link from "next/link";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { getSession } from "@/lib/session";
import { listNotifications } from "@/lib/notifications";
import { markAllReadAction } from "../actions";

export const metadata = { title: "การแจ้งเตือน" };

const ICONS: Record<string, string> = {
  PRODUCT_APPROVED: "check_circle",
  PRODUCT_REJECTED: "cancel",
  PRODUCT_NEEDS_CHANGES: "edit_note",
  NEW_SALE: "shopping_bag",
  PAYMENT_SUCCESS: "paid",
  PAYOUT_UPDATE: "account_balance_wallet",
  REPORT_UPDATE: "flag",
};

// TASK-094: in-app notifications
export default async function NotificationsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const notifications = await listNotifications(session.user.id);
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline text-2xl font-bold">การแจ้งเตือน {unread > 0 && <span className="text-accent">({unread} ใหม่)</span>}</h1>
        {unread > 0 && (
          <form action={markAllReadAction}>
            <button className="text-sm text-primary hover:underline" type="submit">
              อ่านทั้งหมดแล้ว
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MaterialIcon name="notifications_none" className="text-5xl text-gray-200 mb-4" />
          <p className="text-sm text-text-muted">ยังไม่มีการแจ้งเตือน</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border shadow-sm p-5 flex gap-4 ${n.readAt ? "border-gray-100 opacity-75" : "border-primary-100 bg-primary-50/30"}`}
            >
              <MaterialIcon
                name={ICONS[n.type] ?? "notifications"}
                className={n.readAt ? "text-gray-300 text-xl" : "text-primary text-xl"}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-text-muted">{n.body}</p>
                {n.linkUrl && (
                  <Link href={n.linkUrl} className="text-xs text-primary hover:underline mt-1 inline-block">
                    เปิดดู →
                  </Link>
                )}
              </div>
              {!n.readAt && <span className="w-2 h-2 bg-accent rounded-full shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
