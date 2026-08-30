import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { getOwnProduct, ProductError } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import { EditorFields } from "./editor-fields";
import { submitForReviewAction } from "../actions";

export const metadata = { title: "แก้ไขสื่อการสอน" };

const SUBMIT_ERRORS: Record<string, string> = {
  incomplete: "ข้อมูลยังไม่ครบ — กรุณากรอกชื่อและรายละเอียดก่อนส่งตรวจ",
  invalid_status: "สินค้าสถานะนี้ส่งตรวจไม่ได้",
};

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/dashboard/products/[id]"> & {
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const session = await requirePermission("product:create");
  const profile = await getCreatorByUserId(session.user.id);
  if (!profile) redirect("/sell/start");

  let product;
  try {
    product = await getOwnProduct(profile.id, id);
  } catch (e) {
    if (e instanceof ProductError) notFound();
    throw e;
  }

  const [productTypes, subjects, grades, curricula] = await Promise.all([
    prisma.productType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.subject.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.grade.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.curriculum.findMany({ orderBy: { id: "asc" } }),
  ]);

  const editable = ["DRAFT", "NEEDS_CHANGES", "REJECTED"].includes(product.status);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link href="/dashboard/products" className="hover:text-primary">
          สื่อการสอนของฉัน
        </Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <span className="truncate">{product.title}</span>
      </div>

      {/* Wizard steps (ตาม design เพิ่มผลงานใหม่) — ไฟล์/ปก/ตัวอย่างจะเปิดใน Phase 3 */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-sm">
        <span className="text-gray-300 flex items-center gap-1">
          <MaterialIcon name="cloud_upload" className="text-base" /> ไฟล์สื่อ (เร็ว ๆ นี้)
        </span>
        <span className="text-gray-300 flex items-center gap-1">
          <MaterialIcon name="image" className="text-base" /> ปกสินค้า (เร็ว ๆ นี้)
        </span>
        <span className="text-gray-300 flex items-center gap-1">
          <MaterialIcon name="visibility" className="text-base" /> ตัวอย่างไฟล์ (เร็ว ๆ นี้)
        </span>
        <span className="text-primary font-bold flex items-center gap-1 border-b-2 border-primary">
          <MaterialIcon name="description" className="text-base" filled /> รายละเอียด
        </span>
        <span className="text-primary flex items-center gap-1">
          <MaterialIcon name="payments" className="text-base" /> ราคาและเผยแพร่
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{SUBMIT_ERRORS[error] ?? "เกิดข้อผิดพลาด"}</p>
      )}

      <EditorFields
        product={{
          id: product.id,
          title: product.title,
          shortDescription: product.shortDescription ?? "",
          description: product.description ?? "",
          productTypeId: product.productTypeId,
          subjectId: product.subjectId,
          primaryGradeId: product.primaryGradeId,
          curriculumId: product.curriculumId,
          price: product.price.toNumber(),
          tags: product.tags.map((t) => t.tag.name).join(", "),
        }}
        options={{
          productTypes: productTypes.map((t) => ({ id: t.id, name: t.nameTh })),
          subjects: subjects.map((s) => ({ id: s.id, name: s.nameTh })),
          grades: grades.map((g) => ({ id: g.id, name: g.nameTh, group: g.group })),
          curricula: curricula.map((c) => ({ id: c.id, name: c.nameTh })),
        }}
        disabled={!editable}
      />

      {editable && (
        <form action={submitForReviewAction} className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            ส่งสื่อเข้าระบบตรวจสอบ — ทีมงานจะตรวจเนื้อหาและลิขสิทธิ์ก่อนเผยแพร่
          </p>
          <input name="productId" type="hidden" value={product.id} />
          <button
            className="bg-accent hover:bg-accent/90 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-colors shadow-sm whitespace-nowrap"
            type="submit"
          >
            ส่งตรวจสอบ
          </button>
        </form>
      )}
    </div>
  );
}
