"use client";

/**
 * Taxonomy forms — server action ถูกส่งมาเป็น props จาก server page
 */

export function TaxonomyAddForm({
  action,
  kind,
}: {
  action: (formData: FormData) => void;
  kind: "subject" | "grade" | "type" | "exam";
}) {
  return (
    <form action={action} className="flex flex-wrap gap-2 items-center">
      <input name="mode" type="hidden" value="add" />
      <input name="kind" type="hidden" value={kind} />
      <input
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono w-40"
        name="code"
        placeholder="CODE"
        type="text"
      />
      <input
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-40"
        name="nameTh"
        placeholder="ชื่อภาษาไทย"
        type="text"
      />
      <button className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-primary-dark" type="submit">
        เพิ่ม
      </button>
    </form>
  );
}

export function TaxonomyToggleForm({
  action,
  kind,
  id,
  active,
}: {
  action: (formData: FormData) => void;
  kind: "subject" | "grade" | "type" | "exam";
  id: number;
  active: boolean;
}) {
  return (
    <form action={action}>
      <input name="mode" type="hidden" value="toggle" />
      <input name="kind" type="hidden" value={kind} />
      <input name="id" type="hidden" value={id} />
      <input name="active" type="hidden" value={active ? "0" : "1"} />
      <button
        className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
          active ? "border-gray-300 text-gray-600 hover:bg-gray-50" : "border-green-300 text-green-700 hover:bg-green-50"
        }`}
        type="submit"
      >
        {active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
      </button>
    </form>
  );
}
