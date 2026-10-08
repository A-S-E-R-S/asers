import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { formatDate, getChapter, getChapterBySubdomain, paragraphs } from "@/lib/chapters";
import { getAdminScope, getCurrentUser, canManageChapter } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chapter = await getChapter(slug);
  if (!chapter || !chapter.published) return {};
  return {
    title: `${chapter.name} (${chapter.shortName})`,
    description: chapter.description,
    alternates: { canonical: "/chapters/" + slug },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params;
  let chapter = await getChapter(slug);
  if (!chapter) {
    // <subdomain>.asers.org redirects here as /chapters/<subdomain>.
    const bySubdomain = await getChapterBySubdomain(slug);
    if (bySubdomain?.published) permanentRedirect(`/chapters/${bySubdomain.slug}`);
    notFound();
  }
  // Unpublished chapters are visible only to their admins (as a preview).
  const user = await getCurrentUser();
  const canEdit = canManageChapter(await getAdminScope(user), chapter.slug);
  if (!chapter.published && !canEdit) notFound();
  chapter = chapter!;

  const facts: [string, React.ReactNode][] = [];
  if (chapter.eventDate) {
    facts.push(["Symposium", `${formatDate(chapter.eventDate)}${chapter.eventDetails ? ` · ${chapter.eventDetails}` : ""}`]);
  }
  if (chapter.venue) facts.push(["Venue", chapter.venue]);
  if (chapter.registrationDeadline) facts.push(["Registration deadline", formatDate(chapter.registrationDeadline)]);
  if (chapter.studentFee) facts.push(["Student entry fee", chapter.studentFee]);
  if (chapter.founded) facts.push(["Founded", chapter.founded]);
  if (chapter.email) {
    facts.push([
      "Contact",
      <a key="email" className="font-medium text-brand underline" href={`mailto:${chapter.email}`}>
        {chapter.email}
      </a>,
    ]);
  }
  if (chapter.site) {
    facts.push([
      "Website",
      <a key="site" className="font-medium text-brand underline" href={chapter.site}>
        {chapter.site.replace(/^https?:\/\//, "")}
      </a>,
    ]);
  }

  const anyOpen = chapter.regOpen.student || chapter.regOpen.sra || chapter.regOpen.judge;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      {(!chapter.published || canEdit) && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-l-4 border-brand bg-strip px-4 py-3 text-sm">
          <span>{chapter.published ? "You manage this chapter." : "Draft preview: this chapter isn't published yet."}</span>
          <Link href={`/admin/${chapter.slug}/page`} className="font-medium text-brand underline">
            Edit this page
          </Link>
        </div>
      )}
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">
        ASERS Chapter{chapter.subdomain ? ` · ${chapter.subdomain}.asers.org` : ""}
      </p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">
        {chapter.fullName} ({chapter.shortName})
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">{chapter.description}</p>

      {chapter.announcement && (
        <div className="mt-8 border-l-4 border-brand bg-strip px-5 py-4">
          <p className="font-condensed text-lg uppercase tracking-tight text-brand">Announcement</p>
          <p className="mt-1 whitespace-pre-line font-light leading-[1.6]">{chapter.announcement}</p>
        </div>
      )}

      {facts.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="border-2 border-brand-pale p-5">
              <p className="font-condensed text-lg uppercase tracking-tight text-brand">{label}</p>
              <div className="mt-1 font-light">{value}</div>
            </div>
          ))}
        </div>
      )}

      {paragraphs(chapter.about).length > 0 && (
        <div className="mt-10 space-y-4 text-[17px] font-light leading-[1.7]">
          {paragraphs(chapter.about).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      )}

      {/* TODO: add photos from this chapter's past fairs to public/images/<slug>/ */}

      <section className="mt-12 border-t-2 border-brand-pale pt-8">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">Get involved</h2>
        {!anyOpen && <p className="mt-2 font-light">Registration for the next symposium hasn&apos;t opened yet.</p>}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {chapter.regOpen.student && (
            <Link
              href={`/register/${chapter.slug}/student`}
              className="bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark"
            >
              Register as a Student
            </Link>
          )}
          {chapter.regOpen.sra && (
            <Link
              href={`/register/${chapter.slug}/sra`}
              className="border-2 border-brand px-6 py-3 font-medium text-brand transition hover:bg-brand hover:text-white"
            >
              Register as an Advisor (SRA)
            </Link>
          )}
          {chapter.regOpen.judge && (
            <Link
              href={`/register/${chapter.slug}/judge`}
              className="border-2 border-brand px-6 py-3 font-medium text-brand transition hover:bg-brand hover:text-white"
            >
              Register as a Judge
            </Link>
          )}
          <Link
            href={`/donate?chapter=${chapter.slug}#contact`}
            className="border-2 border-brand px-6 py-3 font-medium text-brand transition hover:bg-brand hover:text-white"
          >
            Support {chapter.shortName}
          </Link>
          <Link href="/chapters" className="font-medium text-brand underline">
            All chapters
          </Link>
        </div>
      </section>
    </div>
  );
}
