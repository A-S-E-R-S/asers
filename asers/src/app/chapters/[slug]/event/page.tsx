import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChapterNav from "@/components/ChapterNav";
import { formatDate, getChapter } from "@/lib/chapters";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const chapter = await getChapter((await params).slug);
  return chapter?.published ? { title: `${chapter.shortName} Event` } : {};
}

export default async function ChapterEventPage({ params }: Props) {
  const chapter = await getChapter((await params).slug);
  if (!chapter?.published) notFound();
  return (
    <>
      <ChapterNav chapter={chapter} />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">{chapter.shortName}</p>
        <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">Event information</h1>
        <p className="mt-4 text-[19px] font-light leading-[1.6]">Everything you need to know about the next {chapter.shortName} symposium.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {chapter.eventDate && <div className="border-2 border-brand-pale p-5"><p className="font-condensed text-lg uppercase tracking-tight text-brand">Date</p><p className="mt-1 font-light">{formatDate(chapter.eventDate)}</p></div>}
          {chapter.eventDetails && <div className="border-2 border-brand-pale p-5"><p className="font-condensed text-lg uppercase tracking-tight text-brand">Format</p><p className="mt-1 font-light">{chapter.eventDetails}</p></div>}
          {chapter.venue && <div className="border-2 border-brand-pale p-5"><p className="font-condensed text-lg uppercase tracking-tight text-brand">Venue</p><p className="mt-1 font-light">{chapter.venue}</p></div>}
          {chapter.registrationDeadline && <div className="border-2 border-brand-pale p-5"><p className="font-condensed text-lg uppercase tracking-tight text-brand">Registration deadline</p><p className="mt-1 font-light">{formatDate(chapter.registrationDeadline)}</p></div>}
        </div>
        {chapter.announcement && <div className="mt-10 border-l-4 border-brand bg-strip px-5 py-4"><p className="font-condensed text-lg uppercase tracking-tight text-brand">Announcement</p><p className="mt-1 whitespace-pre-line font-light leading-[1.6]">{chapter.announcement}</p></div>}
        <Link href={`/register?chapter=${chapter.slug}`} className="mt-10 inline-block bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark">Register for this chapter</Link>
      </main>
    </>
  );
}
