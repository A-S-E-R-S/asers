import Link from "next/link";
import { requireChapterAdmin } from "@/lib/admin";
import AdminTabs from "@/components/admin/AdminTabs";

export default async function ChapterAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: slug } = await params;
  const { chapter, scope } = await requireChapterAdmin(slug);
  const tabs = [
    { href: `/admin/${slug}`, label: "Overview" },
    { href: `/admin/${slug}/students`, label: "Students" },
    { href: `/admin/${slug}/sras`, label: "SRAs" },
    { href: `/admin/${slug}/judges`, label: "Judges" },
    { href: `/admin/${slug}/schools`, label: "Schools" },
    { href: `/admin/${slug}/page`, label: "Chapter page" },
    { href: `/admin/${slug}/settings`, label: "Settings" },
    { href: `/admin/${slug}/admins`, label: "Admins" },
    { href: `/admin/${slug}/activity`, label: "Activity" },
  ];
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-condensed text-lg uppercase tracking-tight text-brand">
            {scope.national ? "National admin" : "Chapter admin"}
            {!chapter.published && " · Draft chapter"}
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.015em]">{chapter.fullName}</h1>
        </div>
        <Link href={`/chapters/${slug}`} className="text-sm font-medium text-brand underline">
          View public page →
        </Link>
      </div>
      <AdminTabs tabs={tabs} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
