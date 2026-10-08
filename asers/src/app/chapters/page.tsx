import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedChapters } from "@/lib/chapters";

const chaptersInDevelopment = [
  { name: "Pittsburgh", partners: "University of Pittsburgh and Carnegie Mellon University" },
  { name: "North Carolina", partners: "Duke University" },
  { name: "California", partners: "UC Berkeley" },
  { name: "New York City", partners: "High school students and college clubs — details coming soon" },
];

export const metadata: Metadata = {
  title: "Chapters",
  description: "ASERS state chapters: find your local symposium or start a new chapter.",
  alternates: { canonical: "/chapters" },
};

export default async function ChaptersPage() {
  const chapters = await getPublishedChapters();
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Chapters</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">
        Chapters
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">
        Chapters run local research symposia with support and shared standards from
        ASERS.
      </p>

      <div className="mt-10 space-y-6">
        {chapters.map((c) => (
          <Link
            key={c.slug}
            href={`/chapters/${c.slug}`}
            className="group block border-2 border-brand p-6 transition hover:bg-brand hover:text-white"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-2xl font-bold">{c.name}</p>
              <p className="font-condensed text-lg uppercase tracking-tight text-brand group-hover:text-white">
                {c.shortName}
              </p>
            </div>
            <p className="mt-2 font-light leading-relaxed">{c.description}</p>
            {c.venue && <p className="mt-3 text-sm font-light">📍 {c.venue}</p>}
          </Link>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Chapters in development</h2>
      <p className="mt-3 font-light leading-[1.6]">
        These chapters are being organized by high school and undergraduate students.
        Symposium registration will open when each chapter is ready.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {chaptersInDevelopment.map((chapter) => (
          <div key={chapter.name} className="border-2 border-brand-pale p-5">
            <p className="text-xl font-bold">{chapter.name}</p>
            <p className="mt-2 text-sm font-light leading-[1.6]">Working with {chapter.partners}.</p>
          </div>
        ))}
      </div>

      <div id="start" className="mt-12 border-2 border-dashed border-brand p-8 text-center">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">Help organize a chapter</h2>
        <p className="mx-auto mt-3 max-w-xl font-light leading-[1.6]">
          High school and undergraduate students can register their interest in helping
          organize a chapter. Tell us your city, school or college, and the kind of
          work you would like to help with.
        </p>
        <a
          href="mailto:contact@asers.org?subject=Help%20organize%20an%20ASERS%20chapter"
          className="mt-6 inline-block bg-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark"
        >
          Register your interest
        </a>
      </div>
    </div>
  );
}
