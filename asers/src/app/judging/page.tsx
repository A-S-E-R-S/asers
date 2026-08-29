import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Judging",
  description: "How ASERS evaluates student research with multiple reviewers, structured feedback, and measurable judging practices.",
  alternates: { canonical: "/judging" },
};

const evaluation = [
  ["Research paper", "Reviewers check the research record and flag questions for the event."],
  ["Oral presentation", "Students present and answer questions from one panel."],
  ["Poster session", "A separate panel examines the methods, figures, results, and claims."],
];

const safeguards = [
  "Multiple judges",
  "Expertise-aware assignments",
  "Separate oral and poster panels",
  "Independent scoring before discussion",
  "Conflict screening",
  "Review of large score differences",
];

export default function JudgingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Judging</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">How We Judge</h1>
      <p className="mt-4 max-w-3xl text-[19px] font-light leading-[1.6]">We want the evaluation to be as careful as the research. That means more than one panel, independent scores, useful questions, and feedback students can act on.</p>
      <a href="#judge-registration" className="mt-7 inline-block bg-brand px-6 py-3 font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark">Register as a judge</a>

      <section className="mt-12 border-l-4 border-brand bg-strip px-5 py-5">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">Designed with the limits of judging in mind</h2>
        <p className="mt-3 font-light leading-[1.7]">Research on expert scoring shows that first impressions, differences in judge severity, and panel discussion can all affect an evaluation. Our process is designed to reduce those effects, not to pretend they can be removed completely.</p>
        <p className="mt-3 font-light leading-[1.7]">Independent panels and statistical review make results more consistent when the judging design and data support it. They do not make a winner objectively correct, replace scientific judgment, or eliminate the need for careful review.</p>
      </section>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">One project, several views</h2>
      <div className="mt-5 divide-y-2 divide-brand-pale border-y-2 border-brand-pale">
        {evaluation.map(([title, body], index) => (
          <div key={title} className="grid gap-2 py-5 sm:grid-cols-[64px_180px_1fr]">
            <p className="font-condensed text-2xl text-brand">0{index + 1}</p>
            <h3 className="font-condensed text-xl uppercase tracking-tight text-brand">{title}</h3>
            <p className="font-light leading-[1.7]">{body}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-light leading-[1.7]">Oral and poster judges score independently before seeing the other group&apos;s evaluations.</p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">What matters</h2>
      <p className="mt-3 font-light leading-[1.7]">Judges focus on scientific quality, evidence, original contribution, and the student&apos;s understanding of the work. They ask what the student actually contributed and whether the conclusion follows from the evidence.</p>
      <p className="mt-3 font-light leading-[1.7]">Large datasets, expensive equipment, polished graphics, and mentor prestige do not earn points by themselves.</p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Questions and feedback</h2>
      <p className="mt-3 font-light leading-[1.7]">The strongest questions usually come from a student&apos;s previous answer. Judges are trained to follow claims into the figures, methods, and results instead of relying only on a prepared script.</p>
      <p className="mt-3 font-light leading-[1.7]">After judging, students should receive a clear strength, limitation, alternative explanation, possible next analysis or experiment, and question worth pursuing.</p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">How scores are reviewed</h2>
      <p className="mt-3 font-light leading-[1.7]">Judges naturally use scales differently. ASERS uses statistical review, including <strong className="font-medium">Many-Facet Rasch Measurement (MFRM)</strong> where appropriate, to study judge severity and make comparisons across panels more consistent.</p>
      <details className="mt-5 border border-brand-pale p-5">
        <summary className="cursor-pointer font-medium text-brand">Technical details</summary>
        <div className="mt-4 space-y-3 font-light leading-[1.7]">
          <p>MFRM places project performance, judge severity, and criterion difficulty on a common measurement scale. It supports review; it does not replace scientific judgment or automatically determine winners.</p>
          <p>Large differences between oral and poster evaluations may trigger review of judge comments, paper concerns, or specific scientific questions. Connected assignments with enough overlap between judges and projects make panel comparisons stronger.</p>
        </div>
      </details>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">The safeguards</h2>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {safeguards.map((item) => <li key={item} className="border border-brand-pale px-4 py-3 text-sm font-light">{item}</li>)}
      </ul>
      <p className="mt-4 font-light leading-[1.7]">Judges receive guidance on evidence, student contribution, limitations, conflicts, and productive discussion. Consensus is not required.</p>

      <section className="mt-14 border-2 border-brand-pale bg-strip px-6 py-7">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">Top awards</p>
        <h2 className="mt-1 text-2xl font-bold tracking-[-0.015em]">The cross-category final</h2>
        <p className="mt-3 font-light leading-[1.7]">The strongest projects from each category advance to a final round in the auditorium. Finalists rank projects independently, discuss strengths, weaknesses, and unresolved questions, then submit a final private ranking for the highest awards across categories.</p>
      </section>

      <section id="judge-registration" className="mt-14 border-2 border-dashed border-brand p-7">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">Register as an ASERS judge</h2>
        <p className="mt-3 font-light leading-[1.7]">Judge registration is opening soon. We are building a national community of scientists, engineers, faculty, graduate researchers, and other qualified STEM professionals for local chapter symposia and the National Symposium.</p>
        <span className="mt-5 inline-block border-2 border-brand-pale px-5 py-2 text-sm font-medium text-ink-soft">Registration form coming soon</span>
      </section>
      <div className="mt-8"><Link href="/about" className="font-medium text-brand underline">Questions? Learn more about ASERS</Link></div>
    </div>
  );
}
