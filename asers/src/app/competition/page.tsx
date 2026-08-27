import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/data/chapters";

export const metadata: Metadata = {
  title: "Competition",
  description: "How students present, defend, and are evaluated at an ASERS research symposium.",
  alternates: { canonical: "/competition" },
};

const format = [
  ["Research paper review", "Research papers are reviewed before the event for scientific consistency, methods, supporting evidence, and possible research integrity concerns. The paper helps judges understand and verify the work; writing polish does not determine awards."],
  ["Oral presentation", "Students give a timed presentation followed by questions from a panel of judges. Judges score projects independently before discussing them with one another."],
  ["Poster session", "A separate group of judges examines the project at the poster, looking closely at figures, methods, results, and individual claims. Poster judges do not see oral scores before submitting their own evaluations."],
  ["Final review", "Major awards consider the full set of evaluations. Large differences between oral and poster results are reviewed rather than automatically averaged away."],
];

export default function CompetitionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Competition</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">Compete at ASERS</h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">ASERS gives high school students several ways to present and defend their research throughout the day.</p>
      <p className="mt-5 text-[19px] font-light leading-[1.6]">Students give an oral presentation, answer questions from judges, and later discuss their work in a poster session. Different judges evaluate the oral and poster portions whenever possible, giving each project more than one independent review.</p>
      <p className="mt-5 text-[19px] font-light leading-[1.6]">ASERS uses several independent evaluations because judging complex work can be affected by first impressions, individual scoring styles, and group discussion.</p>

      <section id="feedback" className="mt-14 border-2 border-brand bg-brand px-6 py-7 text-white">
        <p className="font-condensed text-2xl uppercase tracking-wide">Structured scientific feedback</p>
        <p className="mt-3 font-light leading-[1.7] text-brand-pale">Every participant should get value from presenting, whether or not they receive an award. After the symposium, ASERS aims to provide a combined feedback report built from judge evaluations.</p>
        <ul className="mt-5 grid gap-3 text-sm font-light leading-[1.6] sm:grid-cols-2">
          {["Strongest part of the work", "Most important limitation", "Alternative explanation to consider", "One experiment or analysis that would strengthen the conclusion", "One question worth pursuing next"].map((item) => <li key={item} className="border border-white/30 px-4 py-3">{item}</li>)}
        </ul>
      </section>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Competition format</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {format.map(([title, body]) => (
          <div key={title} className="border-2 border-brand-pale p-5">
            <h3 className="font-condensed text-xl uppercase text-brand">{title}</h3>
            <p className="mt-3 text-sm font-light leading-[1.7]">{body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Find your chapter</h2>
      <p className="mt-3 font-light leading-[1.6]">Registration and eligibility details are handled by each chapter.</p>
      <div className="mt-4 space-y-3">
        {chapters.map((chapter) => (
          <div key={chapter.slug} className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-pale py-3">
            <span>{chapter.name} ({chapter.shortName})</span>
            {chapter.site ? <a className="font-medium text-brand underline" href={chapter.site + "/register/student"}>Register</a> : <span className="text-sm font-light">Registration opening soon</span>}
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">The improvement loop</h2>
      <p className="mt-3 font-light leading-[1.7]">Science is not a frozen submission. Students present, receive criticism, revise, and test again. Regional finalists are encouraged to strengthen their analyses, address judge feedback, conduct additional experiments, and correct limitations before the National Symposium.</p>
      <p className="mt-4 border-y-2 border-brand py-4 text-center font-condensed text-xl uppercase tracking-wide text-brand">Submit → present → receive feedback → improve → defend again</p>
      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/chapters" className="bg-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark">Find your chapter</Link>
        <Link href="/judging" className="border-2 border-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-brand transition hover:bg-brand hover:text-white">Become a judge</Link>
      </div>
    </div>
  );
}
