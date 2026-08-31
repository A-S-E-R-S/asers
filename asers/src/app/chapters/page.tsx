import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/data/chapters";

export const metadata: Metadata = {
  title: "Chapters",
  description: "ASERS state chapters: find your local symposium or start a new chapter.",
  alternates: { canonical: "/chapters" },
};

export default function ChaptersPage() {
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

      <div id="start" className="mt-12 border-2 border-dashed border-brand p-8 text-center">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">
          Start a chapter in your state
        </h2>
        <p className="mx-auto mt-3 max-w-xl font-light leading-[1.6]">
          Want to bring a research symposium to your state? We can help with the format,
          judging, registration, and fundraising.
        </p>
        <a
          href="mailto:contact@asers.org?subject=Starting%20an%20ASERS%20chapter"
          className="mt-6 inline-block bg-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark"
        >
          Email contact@asers.org
        </a>
      </div>
    </div>
  );
}
