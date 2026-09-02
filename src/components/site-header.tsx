import { auth } from "@/auth";
import { getUnreadCount } from "@/lib/notifications";
import { HeaderClient } from "./header-client";

/** Server wrapper — ดึง session/unread แล้วส่งเป็น props ให้ client nav */
export async function SiteHeader() {
  const session = await auth();
  const unread = session?.user ? await getUnreadCount(session.user.id) : 0;

  return (
    <HeaderClient
      user={session?.user ? { name: session.user.name ?? null } : null}
      unread={unread}
    />
  );
}
