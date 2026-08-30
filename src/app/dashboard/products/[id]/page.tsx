import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { requirePermission } from "@/lib/session";
import { getCreatorByUserId } from "@/lib/creators";
import { getOwnProduct, ProductError } from "@/lib/products";
import { listProductFiles } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { EditorFields } from "./editor-fields";
import { FilesSection } from "./files-section";
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
  const productFiles = await listProductFiles(product.id);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link href="/dashboard/products" className="hover:text-primary">
          สื่อการสอนของฉัน
        </Link>
        <MaterialIcon name="chevron_right" className="text-base" />
        <span className="truncate">{product.title}</span>
      </div>

      {/* Wizard steps (ตาม design เพิ่มผลงานใหม่) — ตัวอย่างไฟล์จากไฟล์รูปอัตโนมัติ */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-sm">
        <span className="text-primary font-bold flex items-center gap-1 border-b-2 border-primary">
          <MaterialIcon name="cloud_upload" className="text-base" filled /> ไฟล์สื่อ
        </span>
        <span className="text-primary flex items-center gap-1">
          <MaterialIcon name="image" className="text-base" /> ปกสินค้า
        </span>
        <span className="text-gray-300 flex items-center gap-1">
          <MaterialIcon name="visibility" className="text-base" /> ตัวอย่างไฟล์ (อัตโนมัติจากรูป)
        </span>
        <span className="text-primary flex items-center gap-1">
          <MaterialIcon name="description" className="text-base" /> รายละเอียด
        </span>
        <span className="text-primary flex items-center gap-1">
          <MaterialIcon name="payments" className="text-base" /> ราคาและเผยแพร่
        </span>
      </div>

      <FilesSection
        productId={product.id}
        initialFiles={productFiles.map((f) => ({
          id: f.id,
          originalFilename: f.originalFilename,
          mimeType: f.mimeType,
          fileSize: f.fileSize,
          fileRole: f.fileRole,
          hasPreview: Boolean(f.preview),
        }))}
        disabled={!editable}
      />

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
          productTypes: productTypes.map((t) => ({ id: t.id, name: t.nameTh, code: t.code })),
          subjects: subjects.map((s) => ({ id: s.id, name: s.nameTh, code: s.code })),
          grades: grades.map((g) => ({ id: g.id, name: g.nameTh, group: g.group, code: g.code })),
          curricula: curricula.map((c) => ({ id: c.id, name: c.nameTh })),
        }}
        disabled={!editable}
      />

      {editable && (
        <form action={submitForReviewAction} className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <input name="productId" type="hidden" value={product.id} />
          {/* TASK-050: copyright declaration ก่อน submit (PRD §46) */}
          <div className="flex items-start mb-4">
            <div className="flex items-center h-5 pt-0.5">
              <input
                className="w-4 h-4 text-primary bg-white border-gray-300 rounded"
                id="declaration"
                name="declaration"
                required
                type="checkbox"
              />
            </div>
            <div className="ml-3 text-xs text-text-muted leading-tight">
              <label htmlFor="declaration">
                ข้าพเจ้ารับรองว่า: มีสิทธิ์ขายสื่อนี้ · ไม่ละเมิดงานของผู้อื่น · มีสิทธิ์ใช้ฟอนต์/ภาพ/เสียงทั้งหมดในผลงาน
                และยอมรับนโยบาย takedown ของ KruPayKru
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              ส่งสื่อเข้าระบบตรวจสอบ — ทีมงานจะตรวจเนื้อหาและลิขสิทธิ์ก่อนเผยแพร่
            </p>
            <button
              className="bg-accent hover:bg-accent/90 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-colors shadow-sm whitespace-nowrap"
              type="submit"
            >
              ส่งตรวจสอบ
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
