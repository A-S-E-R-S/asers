import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chapters, getChapter } from "@/data/chapters";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) return {};
  return {
    title: `${chapter.name} (${chapter.shortName})`,
    description: chapter.description,
    alternates: { canonical: "/chapters/" + slug },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">
        ASERS Chapter · {chapter.subdomain}.asers.org
      </p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">
        {chapter.fullName} ({chapter.shortName})
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">{chapter.description}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {chapter.venue && (
          <div className="border-2 border-brand-pale p-5">
            <p className="font-condensed text-lg uppercase tracking-tight text-brand">Venue</p>
            <p className="mt-1 font-light">{chapter.venue}</p>
          </div>
        )}
        {chapter.founded && (
          <div className="border-2 border-brand-pale p-5">
            <p className="font-condensed text-lg uppercase tracking-tight text-brand">Founded</p>
            <p className="mt-1 font-light">{chapter.founded}</p>
          </div>
        )}
        {chapter.email && (
          <div className="border-2 border-brand-pale p-5">
            <p className="font-condensed text-lg uppercase tracking-tight text-brand">Contact</p>
            <a className="mt-1 block font-medium text-brand underline" href={`mailto:${chapter.email}`}>
              {chapter.email}
            </a>
          </div>
        )}
        {chapter.site && (
          <div className="border-2 border-brand-pale p-5">
            <p className="font-condensed text-lg uppercase tracking-tight text-brand">Website</p>
            <a className="mt-1 block font-medium text-brand underline" href={chapter.site}>
              {chapter.site.replace("https://", "")}
            </a>
          </div>
        )}
      </div>

      {/* TODO: add photos from this chapter's past fairs to public/images/<slug>/ */}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        {chapter.site && (
          <>
            <a
              href={`${chapter.site}/register/student`}
              className="bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark"
            >
              Register as a Student
            </a>
            <a
              href={`${chapter.site}/register/judge`}
              className="border-2 border-brand px-6 py-3 font-medium text-brand transition hover:bg-brand hover:text-white"
            >
              Register as a Judge
            </a>
          </>
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
    </div>
  );
}
