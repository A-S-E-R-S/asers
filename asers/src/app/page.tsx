import Link from "next/link";
import { chapters, impactStats } from "@/data/chapters";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="grid items-center gap-16 bg-white px-[56px] pb-[90px] pt-[70px] lg:grid-cols-2">
        {/* Image column: blue square offset behind the photo */}
        <div className="relative pl-12 pt-12">
          <div className="absolute left-0 top-0 h-80 w-80 bg-brand" aria-hidden />
          {/* TODO: replace the striped placeholder with a real photo from a past
              NJSRS fair (public/images/) */}
          <div
            className="relative flex aspect-[5/4] w-full items-center justify-center"
            style={{
              background:
                "repeating-linear-gradient(135deg, #eceff7 0 12px, #dfe4f2 12px 24px)",
            }}
          >
            <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-[#5a6480]">
              feature photo - 1200x960
            </span>
          </div>
          {/* Carousel arrows. TODO: wire up once there is more than one photo */}
          <div className="relative -mt-px flex">
            <button
              type="button"
              aria-label="Previous photo"
              className="flex h-[62px] w-[78px] cursor-pointer items-center justify-center border-r border-white bg-brand text-[17px] text-white hover:bg-brand-dark"
            >
              ◀
            </button>
            <button
              type="button"
              aria-label="Next photo"
              className="flex h-[62px] w-[78px] cursor-pointer items-center justify-center bg-brand text-[17px] text-white hover:bg-brand-dark"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Text column */}
        <div className="max-w-[560px]">
          <h1 className="mb-[30px] text-[46px] font-bold leading-[1.1] tracking-[-0.015em] [text-wrap:balance]">
            Where high school researchers share, defend, and advance their original
            STEM research.
          </h1>
          <p className="mb-[26px] text-[19px] font-light leading-[1.6] text-ink-soft [text-wrap:pretty]">
            ASERS is a national network of student-run science research competitions.
            Our state chapters host premier symposia where students present
            experimental research to panels of STEM professionals and compete for
            awards.
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

      {/* What is ASERS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">
          What we do
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-0.015em]">
          A research symposium in every state
        </h2>
        <div className="mt-6 grid gap-12 lg:grid-cols-2">
          <p className="text-[19px] font-light leading-[1.6]">
            ASERS chapters run full-day research symposia: students deliver oral
            presentations of their original experimental work, field questions from
            judges, advance to finals, and present posters for sponsored special
            awards. Judging panels are made up of graduate students, industry
            professionals, university faculty, and experienced STEM teachers.
          </p>
          <p className="text-[19px] font-light leading-[1.6]">
            The competition is more than a contest. Each symposium is built around
            education, mentorship, and community building among young researchers.{" "}
            <Link href="/about" className="font-medium text-brand underline">
              Learn more about us
            </Link>
            .
          </p>
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
