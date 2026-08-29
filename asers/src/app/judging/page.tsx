import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Judging",
  description: "How ASERS evaluates student research with multiple reviewers, structured feedback, and measurable judging practices.",
  alternates: { canonical: "/judging" },
};

const evaluation = [
  ["Research paper", "Reviewers check the scientific record before the event and flag questions for live judging."],
  ["Oral presentation", "Students present their work and answer questions from one panel."],
  ["Poster session", "A separate panel examines figures, methods, results, and individual claims in more detail."],
];

const safeguards = [
  "Multiple judges for each project",
  "Expertise-aware central assignments",
  "Separate oral and poster panels",
  "Independent scoring before discussion",
  "Conflict-of-interest screening",
  "Review of unusually divergent evaluations",
];

export default function JudgingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Judging</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">How We Judge</h1>
      <p className="mt-4 max-w-3xl text-[19px] font-light leading-[1.6]">ASERS asks how a science competition can make the evaluation itself as rigorous as the research being evaluated.</p>
      <a href="#judge-registration" className="mt-7 inline-block bg-brand px-6 py-3 font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark">Register as a judge</a>

      <section className="mt-12 border-y-2 border-brand py-7">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">A clear, independent evaluation</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {evaluation.map(([title, body], index) => (
            <div key={title}>
              <p className="font-condensed text-2xl text-brand">0{index + 1}</p>
              <h3 className="mt-2 font-condensed text-xl uppercase tracking-tight text-brand">{title}</h3>
              <p className="mt-2 text-sm font-light leading-[1.7]">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 font-light leading-[1.7]">Oral and poster judges submit scores independently before seeing the other group&apos;s evaluations.</p>
      </section>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">What judges look for</h2>
      <p className="mt-3 font-light leading-[1.7]">Judges focus on scientific quality, evidence, original contribution, and the student&apos;s understanding and ownership of the work.</p>
      <p className="mt-3 font-light leading-[1.7]">They also ask: What intellectual contribution did the student make? Does the conclusion follow from the evidence actually generated? Project size, expensive equipment, polished graphics, and mentor prestige do not carry weight on their own.</p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Structured feedback</h2>
      <p className="mt-3 font-light leading-[1.7]">Judging should remain useful after rankings are published. Judges identify the strongest part of the work, an important limitation, an alternative explanation, one way to strengthen the conclusion, and a question worth pursuing next.</p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">How scores are reviewed</h2>
      <p className="mt-3 font-light leading-[1.7]">Even with the same rubric, judges use rating scales differently. Some score more strictly; others score more generously.</p>
      <p className="mt-3 font-light leading-[1.7]">ASERS can analyze scoring using <strong className="font-medium">Many-Facet Rasch Measurement (MFRM)</strong>, a method used in performance assessment to estimate judge severity while accounting for differences among projects and rubric criteria.</p>
      <p className="mt-3 font-light leading-[1.7]">This can make scores from different panels more comparable and identify patterns worth reviewing. Statistical adjustment does not replace scientific judgment or automatically determine winners.</p>
      <details className="mt-5 border border-brand-pale p-5">
        <summary className="cursor-pointer font-medium text-brand">Technical details</summary>
        <div className="mt-4 space-y-3 font-light leading-[1.7]">
          <p>MFRM models project performance, judge severity, and rubric-criterion difficulty on a common measurement scale. This helps ASERS study how consistently judges use the scoring system.</p>
          <p>The method works best when assignments contain enough overlap between judges and projects to connect different panels statistically. ASERS considers that need when designing assignments.</p>
        </div>
      </details>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Safeguards and training</h2>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {safeguards.map((item) => <li key={item} className="border border-brand-pale px-4 py-3 text-sm font-light">{item}</li>)}
      </ul>
      <p className="mt-5 font-light leading-[1.7]">Before the event, judges receive guidance on following evidence, checking claims against data, evaluating student contribution, recognizing limitations, and sharing expertise without pressuring others to agree. Judges do not have to reach consensus.</p>

      <section className="mt-14 border-2 border-brand-pale bg-strip px-6 py-7">
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">Top awards</p>
        <h2 className="mt-1 text-2xl font-bold tracking-[-0.015em]">The cross-category final</h2>
        <p className="mt-3 font-light leading-[1.7]">The strongest projects from each category advance to a final round in the auditorium. Finalists present and defend their research before a final panel. The panel considers the complete set of evaluations, scientific concerns, and student understanding when selecting the highest awards across categories.</p>
      </section>

      <section id="judge-registration" className="mt-14 border-2 border-dashed border-brand p-7">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">Register as an ASERS judge</h2>
        <p className="mt-3 font-light leading-[1.7]">Judge registration is opening soon. We are building a national community of scientists, engineers, faculty, graduate researchers, and other qualified STEM professionals who can evaluate student research at local ASERS chapter symposia and the National Symposium.</p>
        <span className="mt-5 inline-block border-2 border-brand-pale px-5 py-2 text-sm font-medium text-ink-soft">Registration form coming soon</span>
      </section>
      <div className="mt-8"><Link href="/about" className="font-medium text-brand underline">Questions? Learn more about ASERS</Link></div>
    </div>
  );
}
