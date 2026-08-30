import Link from "next/link";
import { notFound } from "next/navigation";
import { MaterialIcon } from "@/components/material-icon";
import { getCreatorBySlug } from "@/lib/creators";

export const metadata = { title: "ร้านค้าครู" };

// TASK-015: Creator public page /creator/[slug] — products จะแสดงเมื่อ Phase 2/6 เสร็จ
export default async function CreatorPage({ params }: PageProps<"/creator/[slug]">) {
  const { slug } = await params;
  const profile = await getCreatorBySlug(slug);
  if (!profile) notFound();

  const verified = profile.verificationStatus === "VERIFIED";

  return (
    <div>
      {/* Banner */}
      <div className="bg-primary-sidebar h-40 md:h-56" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {profile.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={profile.displayName} src={profile.profileImageUrl} className="w-full h-full object-cover" />
            ) : (
              <span className="font-headline text-4xl font-bold text-primary">
                {profile.displayName.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="font-headline text-2xl font-bold">{profile.displayName}</h1>
              {verified && (
                <span className="flex items-center text-xs text-badge-blue gap-0.5">
                  <MaterialIcon name="verified" className="text-sm" filled /> ยืนยันตัวตนแล้ว
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted">@{profile.slug}</p>
            {profile.bio && <p className="mt-2 text-sm max-w-xl">{profile.bio}</p>}
          </div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mb-10">
          {profile.subjects.map((subject) => (
            <span
              key={subject}
              className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-text-muted shadow-sm"
            >
              {subject}
            </span>
          ))}
          {profile.verificationStatus === "UNVERIFIED" && (
            <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-text-muted">
              🏛 ร้านใหม่ — รอการยืนยัน
            </span>
          )}
        </div>

        {/* Products */}
        <section className="mb-16">
          <h2 className="font-headline text-xl font-bold mb-6">สื่อการสอนของร้านนี้</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <MaterialIcon name="inventory_2" className="text-4xl text-gray-300 mb-3" />
            <p className="text-sm text-text-muted">ยังไม่มีสื่อที่เผยแพร่ — กลับมาดูใหม่นะ</p>
            <Link href="/search" className="mt-4 inline-block text-primary text-sm font-medium hover:underline">
              ค้นหาสื่อจากครูท่านอื่น
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
