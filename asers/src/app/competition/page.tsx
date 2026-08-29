import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/data/chapters";

export const metadata: Metadata = {
  title: "Competition",
  description: "How students present, defend, and improve original research at an ASERS symposium.",
  alternates: { canonical: "/competition" },
};

const stages = [
  ["01", "Research paper", "Submit a paper before the symposium so reviewers can understand the methods, evidence, and research record."],
  ["02", "Oral presentation", "Present your question, methods, results, interpretation, and limitations, then answer questions from a panel."],
  ["03", "Poster session", "Discuss the project in more detail with a separate group of judges who submit independent evaluations."],
  ["04", "Cross-category final", "Top projects from each category advance to a final round in the auditorium. Finalists defend their work before a final panel competing for the highest awards."],
];

export default function CompetitionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Competition</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">Compete at ASERS</h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">ASERS gives high school students several ways to present, defend, and improve original research throughout the day.</p>

      <section className="mt-12 border-2 border-brand-pale bg-strip px-6 py-7">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">Rules &amp; eligibility</p>
        <div className="mt-5 grid gap-x-8 gap-y-3 text-sm font-light leading-[1.6] sm:grid-cols-2">
          <p><strong className="font-medium">Grades:</strong> 9–12</p>
          <p><strong className="font-medium">Projects:</strong> Individual or team</p>
          <p><strong className="font-medium">Research:</strong> Original experimental, computational, engineering, or theoretical work</p>
          <p><strong className="font-medium">Required:</strong> Paper, oral presentation, and poster</p>
          <p><strong className="font-medium">Safety review:</strong> Required where applicable</p>
          <p><strong className="font-medium">Registration:</strong> Through your local chapter</p>
        </div>
        <p className="mt-5 font-light leading-[1.7]">Projects must represent original student research. Demonstrations, literature reviews, informational projects, and work that only reproduces existing results are not eligible as research entries.</p>
        <Link href="/competition/rules" className="mt-4 inline-block font-medium text-brand underline">Read the full rules and eligibility guidance →</Link>
      </section>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">The competition journey</h2>
      <div className="mt-5 divide-y-2 divide-brand-pale border-y-2 border-brand-pale">
        {stages.map(([number, title, body]) => (
          <div key={number} className="grid gap-3 py-5 sm:grid-cols-[64px_180px_1fr] sm:items-start">
            <p className="font-condensed text-2xl text-brand">{number}</p>
            <h3 className="font-condensed text-xl uppercase tracking-tight text-brand">{title}</h3>
            <p className="font-light leading-[1.7]">{body}</p>
          </div>
        ))}
      </div>

      <section id="feedback" className="mt-14 bg-brand px-6 py-7 text-white">
        <p className="font-condensed text-2xl uppercase tracking-wide">What you leave with</p>
        <p className="mt-3 font-light leading-[1.7] text-brand-pale">Every researcher should get value from presenting, whether or not they receive an award. ASERS aims to provide a combined feedback report identifying:</p>
        <ul className="mt-5 grid gap-x-8 gap-y-2 text-sm font-light leading-[1.6] sm:grid-cols-2">
          {["The strongest part of the work", "An important limitation", "An alternative explanation to consider", "One experiment or analysis that could strengthen the conclusion", "A question worth pursuing next"].map((item) => <li key={item} className="border-l border-white/50 pl-3">{item}</li>)}
        </ul>
      </section>

      <section className="mt-14 border-2 border-brand-pale bg-strip px-6 py-7">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">Top awards</p>
        <h2 className="mt-1 text-2xl font-bold tracking-[-0.015em]">A final round across categories</h2>
        <p className="mt-3 font-light leading-[1.7]">After category judging, the strongest projects from each category advance to a cross-category final round in the auditorium. Finalists present and defend their research before the final panel, which considers the complete set of evaluations, scientific concerns, and student understanding when selecting the top awards.</p>
      </section>

      <section className="mt-14">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">A different kind of competition</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.015em]">The improvement loop</h2>
        <p className="mt-3 font-light leading-[1.7]">Science is not a frozen submission. Students present, receive criticism, revise, and test again. Regional finalists are encouraged to strengthen analyses, address feedback, conduct additional experiments, and correct limitations before the National Symposium.</p>
        <p className="mt-4 border-y-2 border-brand py-4 text-center font-condensed text-xl uppercase tracking-wide text-brand">Submit → present → receive feedback → improve → defend again</p>
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
