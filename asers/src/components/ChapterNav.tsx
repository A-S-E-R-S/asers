import Link from "next/link";
import type { Chapter } from "@/lib/chapters";

export default function ChapterNav({ chapter }: { chapter: Chapter }) {
  return (
    <div className="border-b-2 border-brand-pale bg-white">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-4 sm:px-6">
        <Link href={`/chapters/${chapter.slug}`} className="mr-auto font-condensed text-lg uppercase tracking-tight text-brand">
          {chapter.shortName}
        </Link>
        <nav aria-label={`${chapter.shortName} chapter navigation`} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-ink-soft">
          <Link href={`/chapters/${chapter.slug}`} className="hover:text-brand">Overview</Link>
          <Link href={`/chapters/${chapter.slug}/event`} className="hover:text-brand">Event</Link>
          <Link href={`/chapters/${chapter.slug}/rules`} className="hover:text-brand">Rules</Link>
          <Link href={`/chapters/${chapter.slug}/photos`} className="hover:text-brand">Photos</Link>
        </nav>
        <Link href={`/register?chapter=${chapter.slug}`} className="bg-brand px-4 py-2 font-medium text-white transition hover:bg-brand-dark">
          Register
        </Link>
      </div>
    </div>
  );
}
