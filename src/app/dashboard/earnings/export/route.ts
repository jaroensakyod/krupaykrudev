import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** TASK §76/§10: ส่งออกรายงานรายได้เป็น CSV (ไว้ยื่นภาษี/บันทึกบัญชี) */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("UNAUTHORIZED", { status: 401 });
  }

  const entries = await prisma.ledgerEntry.findMany({
    where: { accountType: "CREATOR", accountId: session.user.id, entryType: "CREATOR_EARNING" },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["วันที่", "หมายเลขคำสั่งซื้อ", "รายได้สุทธิ (บาท)", "พร้อมถอนเมื่อ"],
    ...entries.map((e) => [
      e.createdAt.toISOString().slice(0, 10),
      e.orderId?.slice(0, 8).toUpperCase() ?? "-",
      e.amount.toFixed(2),
      e.availableAt ? e.availableAt.toISOString().slice(0, 10) : "-",
    ]),
  ];

  const csv = "\uFEFF" + rows.map((r) => r.join(",")).join("\r\n"); // BOM สำหรับ Excel ไทย
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="krupaykru-earnings-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
