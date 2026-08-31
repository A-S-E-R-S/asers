import Link from "next/link";
import type { Metadata } from "next";
import { chapters, impactStats } from "@/data/chapters";
import HeroCarousel from "@/components/HeroCarousel";

export const metadata: Metadata = {
  title: { absolute: "ASERS | High School Research Symposium" },
  description:
    "ASERS is a student-led research symposium where high school students present original work, answer questions from scientists, and receive detailed feedback.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="grid items-center gap-16 bg-white px-[56px] pb-[90px] pt-[70px] lg:grid-cols-2">
        {/* Image column: blue square offset behind the photo */}
        <div className="relative pl-6 pt-6 sm:pl-12 sm:pt-12">
          <div className="absolute left-0 top-0 h-48 w-48 bg-brand sm:h-80 sm:w-80" aria-hidden />
          <HeroCarousel />
        </div>

        {/* Text column */}
        <div className="max-w-[560px]">
          <h1 className="mb-[30px] text-[46px] font-bold leading-[1.1] tracking-[-0.015em] [text-wrap:balance]">
            Bring your research to a room of scientists.
          </h1>
          <p className="mb-[26px] text-[19px] font-light leading-[1.6] text-ink-soft [text-wrap:pretty]">
            ASERS is a student-led symposium for high school researchers. Submit a
            paper, present your project in an oral session and poster session, and
            get detailed questions and feedback from scientists and engineers.
          </p>
          <p className="text-[19px] font-medium">
            <Link href="/competition" className="text-brand underline hover:text-brand-dark">
              Learn how to compete
            </Link>
            <span className="font-light text-ink-soft"> and </span>
            <Link href="/judging" className="text-brand underline hover:text-brand-dark">
              become a judge
            </Link>
            <span className="font-light text-ink-soft">.</span>
          </p>
          <a
            href="https://discord.gg/ZTDKEAS2hB"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-sm font-medium text-brand underline hover:text-brand-dark"
          >
            Join the ASERS community on Discord →
          </a>
        </div>
      </section>

      {/* Impact numbers */}
      <section className="bg-brand text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-14 text-center sm:px-6 lg:grid-cols-4">
          {impactStats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold">{s.value}</p>
              <p className="mt-2 text-sm font-light text-brand-pale">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-strip-border bg-strip">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="font-condensed text-lg uppercase tracking-tight text-brand">Useful feedback</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.015em]">You can leave with something useful, even if you do not win.</h2>
          <p className="mt-4 max-w-3xl text-[19px] font-light leading-[1.6]">Judges point out what is working, what needs more support, and what they would try next. We aim to send each researcher home with comments they can use.</p>
          <Link href="/competition#feedback" className="mt-6 inline-block font-medium text-brand underline">See how the feedback loop works</Link>
        </div>
      </section>

      {/* National symposium */}
      <section className="bg-strip">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="font-condensed text-lg uppercase tracking-tight text-brand">New for 2027</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.015em]">Regional ASERS → National ASERS</h2>
            <p className="mt-4 max-w-2xl text-[19px] font-light leading-[1.6]">We are planning our first National Symposium. Regional finalists will have time to respond to feedback, strengthen their work, and defend it in front of a national panel.</p>
          </div>
          <Link href="/national-symposium" className="whitespace-nowrap bg-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark">Explore Nationals</Link>
        </div>
      </section>

      {/* What is ASERS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">
          What we do
        </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.015em]">Local events, shared standards</h2>
          <div className="mt-6 space-y-5 text-[19px] font-light leading-[1.6]">
            <p>Each ASERS chapter runs a full-day symposium with oral presentations, posters, questions, and awards. Chapters share the same basic standards for judging, research integrity, and event structure.</p>
            <p>Students run the chapters and invite scientists, engineers, faculty, and other STEM professionals to judge. The result is local competition with a common set of expectations. <Link href="/about" className="font-medium text-brand underline">Learn more about us</Link>.</p>
          </div>
      </section>

      {/* Chapters */}
      <section className="border-t-[10px] border-brand-pale">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="font-condensed text-lg uppercase tracking-tight text-brand">
            Our chapters
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.015em]">
            Chapters close to home, a network beyond them
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((c) => (
              <Link
                key={c.slug}
                href={`/chapters/${c.slug}`}
                className="group border-2 border-brand p-6 transition hover:bg-brand hover:text-white"
              >
                <p className="font-condensed text-lg uppercase tracking-tight text-brand group-hover:text-white">
                  {c.shortName}
                </p>
                <p className="mt-1 text-xl font-bold">{c.name}</p>
                <p className="mt-2 line-clamp-3 text-sm font-light leading-relaxed">
                  {c.description}
                </p>
              </Link>
            ))}
            <Link
              href="/chapters#start"
              className="flex flex-col items-center justify-center border-2 border-dashed border-brand p-6 text-center transition hover:bg-brand hover:text-white"
            >
              <p className="text-xl font-bold">Bring ASERS to your state</p>
              <p className="mt-2 text-sm font-light">
                Interested in bringing ASERS to your state? Start a chapter.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Donate CTA */}
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-[-0.015em]">
            Support student research
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[19px] font-light leading-[1.6] text-brand-pale">
            Donations and sponsorships cover event logistics, printing, display
            materials, and student awards. Sponsors are recognized on our website, at
            events, and on merchandise.
          </p>
          <Link
            href="/donate"
            className="mt-8 inline-block border-2 border-white px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-[0.02em] transition hover:border-brand-pale hover:text-brand-pale"
          >
            Become a Sponsor
          </Link>
        </div>
      </section>
    </>
  );
}
