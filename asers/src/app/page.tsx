import Link from "next/link";
import type { Metadata } from "next";
import { chapters, impactStats } from "@/data/chapters";
import HeroCarousel from "@/components/HeroCarousel";

export const metadata: Metadata = {
  title: "Student Research, Judged by Scientists",
  description:
    "A student-led research competition where high school researchers present original work, receive structured scientist feedback, and improve their work before Nationals.",
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
            Built by students. Judged by scientists. Designed for fairer evaluation.
          </h1>
          <p className="mb-[26px] text-[19px] font-light leading-[1.6] text-ink-soft [text-wrap:pretty]">
            ASERS is a student-led network of research symposia where high school
            students present original work, defend it before STEM professionals, and
            help build research communities in their own states.
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
          <p className="font-condensed text-lg uppercase tracking-tight text-brand">Beyond the awards</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.015em]">Every researcher leaves with a way to make the work better.</h2>
          <p className="mt-4 max-w-3xl text-[19px] font-light leading-[1.6]">ASERS judges do more than rank projects. Each researcher receives structured feedback from scientists: the strongest part of the work, an important limitation, an alternative explanation to consider, one experiment or analysis that could strengthen the conclusion, and a question worth pursuing next.</p>
          <Link href="/competition#feedback" className="mt-6 inline-block font-medium text-brand underline">See how the feedback loop works</Link>
        </div>
      </section>

      {/* National symposium */}
      <section className="bg-strip">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="font-condensed text-lg uppercase tracking-tight text-brand">New for 2027</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.015em]">Regional ASERS → National ASERS</h2>
          <p className="mt-4 max-w-2xl text-[19px] font-light leading-[1.6]">We are planning our first National Symposium, where regional finalists can respond to scientist feedback, strengthen their work, and defend it nationally.</p>
          </div>
          <Link href="/national-symposium" className="whitespace-nowrap bg-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark">Explore Nationals</Link>
        </div>
      </section>

      {/* What is ASERS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">
          What we do
        </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.015em]">A research symposium in every state</h2>
          <div className="mt-6 space-y-5 text-[19px] font-light leading-[1.6]">
            <p>ASERS chapters run full-day research symposia with oral presentations, poster sessions, judge Q&amp;A, and awards under shared national standards for judging, research integrity, and event structure.</p>
            <p>Students organize the chapters and recruit scientists, engineers, graduate researchers, faculty, and other qualified STEM professionals to evaluate the work. Our research-informed process combines independent scores, field-aware assignments, structured feedback, and a chance for finalists to improve before Nationals. <Link href="/about" className="font-medium text-brand underline">Learn more about us</Link>.</p>
          </div>
      </section>

      {/* Chapters */}
      <section className="border-t-[10px] border-brand-pale">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="font-condensed text-lg uppercase tracking-tight text-brand">
            Our chapters
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.015em]">
            Organized locally, connected nationally
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
              <p className="text-xl font-bold">Your state here</p>
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
