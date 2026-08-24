import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/data/chapters";

export const metadata: Metadata = {
  title: "Become a Judge",
  description:
    "Qualified scientists and engineers: judge an ASERS symposium and mentor the next generation of researchers.",
};

export default function JudgingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">
        Are you a qualified scientist or engineer?
      </p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">
        Judge our science fairs
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">
        Judges are the heart of every ASERS symposium. Spend a day evaluating high
        school research, asking sharp questions, and giving students feedback they will
        carry into their scientific careers.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">
        Who we&apos;re looking for
      </h2>
      <p className="mt-3 font-light leading-[1.6]">
        Judges should have a strong background in STEM with a bachelor&apos;s degree or
        higher, or equivalent professional experience. We welcome graduate students,
        industry professionals, university faculty, and experienced high school STEM
        teachers. Judges must be comfortable evaluating high school research, providing
        constructive feedback, and complying with conflict-of-interest and ethics
        policies.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">How judging works</h2>
      <p className="mt-3 font-light leading-[1.6]">
        Scoring focuses on the quality of the research question, experimental design,
        data analysis, conclusions, and the student&apos;s understanding and
        communication. Chapters use the Oral Presentation Rubric that JSHS has used in
        past years, along with published judging guidelines covering assignments,
        timing, and debriefing.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Register to judge</h2>
      <ul className="mt-4 space-y-3">
        {chapters.map((c) => (
          <li
            key={c.slug}
            className="flex flex-wrap items-center justify-between gap-3 border-2 border-brand-pale p-4"
          >
            <div>
              <p className="font-medium">
                {c.name} ({c.shortName})
              </p>
              {c.venue && <p className="text-sm font-light">{c.venue}</p>}
            </div>
            {c.site ? (
              <a
                href={`${c.site}/register/judge`}
                className="bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
              >
                Register to judge
              </a>
            ) : (
              <span className="text-sm font-light">Registration opening soon</span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-12">
        <Link href="/about" className="font-medium text-brand underline">
          Questions? Learn more about ASERS
        </Link>
      </div>
    </div>
  );
}
