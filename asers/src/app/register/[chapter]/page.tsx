import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getChapter, getPublishedChapters } from "@/lib/chapters";
import { PageShell } from "@/components/ui";
import { ROLES, ROLE_BLURBS, ROLE_LABELS, isRole } from "@/lib/options";

type Props = { params: Promise<{ chapter: string }> };

export const metadata: Metadata = { title: "Register" };

/**
 * /register/<chapter>  -> pick a role for that chapter
 * /register/<role>     -> pick a chapter for that role (njsrs.org-style URLs)
 */
export default async function RegisterChapterPage({ params }: Props) {
  const { chapter: param } = await params;

  if (isRole(param)) {
    const chapters = (await getPublishedChapters()).filter((c) => c.regOpen[param]);
    if (chapters.length === 1) redirect(`/register/${chapters[0].slug}/${param}`);
    return (
      <PageShell eyebrow="Register" title={`Register as ${param === "sra" ? "an SRA" : `a ${ROLE_LABELS[param].toLowerCase()}`}`} intro="Choose your chapter.">
        {chapters.length === 0 && <p className="font-light">Registration isn&apos;t open in any chapter right now.</p>}
        <div className="space-y-3">
          {chapters.map((c) => (
            <Link
              key={c.slug}
              href={`/register/${c.slug}/${param}`}
              className="block border-2 border-brand p-5 transition hover:bg-brand hover:text-white"
            >
              <span className="text-xl font-bold">{c.name}</span> <span className="font-light">({c.shortName})</span>
            </Link>
          ))}
        </div>
      </PageShell>
    );
  }

  const chapter = await getChapter(param);
  if (!chapter || !chapter.published) notFound();

  return (
    <PageShell eyebrow={chapter.shortName} title={`Register for ${chapter.shortName}`} intro={chapter.fullName}>
      <div className="space-y-4">
        {ROLES.map((r) => (
          <div key={r} className="flex flex-wrap items-center justify-between gap-4 border-2 border-brand-pale p-5">
            <div className="max-w-md">
              <p className="font-condensed text-xl uppercase tracking-tight text-brand">{ROLE_LABELS[r]}</p>
              <p className="mt-1 text-sm font-light">{ROLE_BLURBS[r]}</p>
            </div>
            {chapter.regOpen[r] ? (
              <Link
                href={`/register/${chapter.slug}/${r}`}
                className="bg-brand px-5 py-2.5 font-medium text-white transition hover:bg-brand-dark"
              >
                Register
              </Link>
            ) : (
              <span className="text-sm font-light text-ink-soft">Not open yet</span>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
