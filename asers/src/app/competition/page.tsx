import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/data/chapters";

export const metadata: Metadata = {
  title: "Competition",
  description: "How students present, defend, and improve original research at an ASERS symposium.",
  alternates: { canonical: "/competition" },
};

const stages = [
  ["01", "Submit", "Research paper review helps judges understand your methods, evidence, and research record."],
  ["02", "Present", "Give a timed oral presentation, answer questions, and discuss your work at a poster session."],
  ["03", "Improve", "Receive structured feedback from scientists, including a strength, limitation, alternative explanation, and next step."],
  ["04", "Advance", "The strongest projects from each category move to a cross-category final in the auditorium for the top awards."],
];

export default function CompetitionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Competition</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">Compete at ASERS</h1>
      <p className="mt-4 max-w-3xl text-[19px] font-light leading-[1.6]">Bring original research, explain how you did it, and get useful questions and feedback from scientists.</p>

      <section className="mt-12 border-2 border-brand-pale bg-strip px-6 py-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-[-0.015em]">Rules &amp; eligibility</h2>
          <Link href="/competition/rules" className="font-medium text-brand underline">Read the full rules →</Link>
        </div>
        <div className="mt-5 grid gap-x-8 gap-y-2 text-sm font-light leading-[1.6] sm:grid-cols-2">
          <p><strong className="font-medium">Grades:</strong> 9–12</p>
          <p><strong className="font-medium">Projects:</strong> Individual or team</p>
          <p><strong className="font-medium">Research:</strong> Original experimental, computational, engineering, or theoretical work</p>
          <p><strong className="font-medium">Required:</strong> Paper, oral presentation, and poster</p>
          <p><strong className="font-medium">Safety review:</strong> Required where applicable</p>
          <p><strong className="font-medium">Registration:</strong> Through your local chapter</p>
        </div>
      </section>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">The competition journey</h2>
      <div className="mt-5 divide-y-2 divide-brand-pale border-y-2 border-brand-pale">
        {stages.map(([number, title, body]) => (
          <div key={number} className="grid gap-2 py-5 sm:grid-cols-[64px_150px_1fr] sm:items-start">
            <p className="font-condensed text-2xl text-brand">{number}</p>
            <h3 className="font-condensed text-xl uppercase tracking-tight text-brand">{title}</h3>
            <p className="font-light leading-[1.7]">{body}</p>
          </div>
        ))}
      </div>

      <section id="feedback" className="mt-14 border-l-4 border-brand pl-5">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">More than a ranking</h2>
        <p className="mt-3 font-light leading-[1.7]">Oral and poster judges score independently, so your project gets more than one review. After the symposium, we aim to combine their comments into feedback you can use.</p>
        <p className="mt-3 border-y-2 border-brand py-4 text-center font-condensed text-xl uppercase tracking-wide text-brand">Submit → present → get feedback → improve → defend again</p>
      </section>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Find your chapter</h2>
      <p className="mt-3 font-light leading-[1.6]">Registration and local eligibility details are handled by each chapter.</p>
      <div className="mt-4 divide-y divide-brand-pale border-y border-brand-pale">
        {chapters.map((chapter) => (
          <div key={chapter.slug} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span>{chapter.name} ({chapter.shortName})</span>
            {chapter.site ? <a className="font-medium text-brand underline" href={chapter.site + "/register/student"}>Register</a> : <span className="text-sm font-light">Registration opening soon</span>}
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="/chapters" className="bg-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark">Find your chapter</Link>
        <Link href="/judging" className="border-2 border-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-brand transition hover:bg-brand hover:text-white">See how judging works</Link>
      </div>
    </div>
  );
}
