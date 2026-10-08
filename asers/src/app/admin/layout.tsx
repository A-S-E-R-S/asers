import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getAllChapters } from "@/lib/chapters";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | ASERS Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { scope } = await requireAdmin();
  const chapters = (await getAllChapters()).filter((c) => scope.national || scope.chapters.includes(c.slug));

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_1fr]">
      <aside className="grid gap-4 border-b-2 border-brand-pale pb-4 text-sm sm:grid-cols-2 lg:block lg:space-y-6 lg:border-0 lg:pb-0">
        <div>
          <p className="font-condensed text-lg uppercase tracking-tight text-brand">
            {scope.national ? "National admin" : "Chapter admin"}
          </p>
          <nav className="mt-1 flex flex-wrap gap-x-4 lg:mt-2 lg:block lg:space-y-1">
            <Link href="/admin" className="block py-1 hover:text-brand hover:underline">
              Overview
            </Link>
            {scope.national && (
              <>
                <Link href="/admin/chapters/new" className="block py-1 hover:text-brand hover:underline">
                  New chapter
                </Link>
                <Link href="/admin/users" className="block py-1 hover:text-brand hover:underline">
                  Users &amp; admins
                </Link>
                <Link href="/admin/activity" className="block py-1 hover:text-brand hover:underline">
                  Activity log
                </Link>
              </>
            )}
          </nav>
        </div>
        <div>
          <p className="font-condensed text-lg uppercase tracking-tight text-brand">Chapters</p>
          <nav className="mt-1 flex flex-wrap gap-x-4 lg:mt-2 lg:block lg:space-y-1">
            {chapters.map((c) => (
              <Link key={c.slug} href={`/admin/${c.slug}`} className="block py-1 hover:text-brand hover:underline">
                {c.shortName}
                {!c.published && <span className="ml-1 text-xs text-ink-soft">(draft)</span>}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
