import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/data/chapters";

export const metadata: Metadata = {
  title: "Judging",
  description: "How ASERS evaluates student research and reduces bias in scientific judging.",
};

const areas = [
  "Scientific quality: Are the methods, controls, analysis, and study design sound?",
  "Evidence: Do the results support the conclusions?",
  "Original contribution: What did the project add?",
  "Understanding and ownership: Can the student explain the choices, results, limitations, and their own contribution?",
];

const safeguards = [
  "multiple judges for each project",
  "separate oral and poster panels",
  "independent scoring before discussion",
  "central judge assignment",
  "conflict-of-interest screening",
  "review of major scoring disagreements",
  "paper review focused on scientific consistency rather than writing polish",
  "private final rankings after discussion",
];

export default function JudgingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Judging</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">How We Judge</h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">ASERS judging was shaped by our own experience competing in major science fairs and research programs, and by research on how judges evaluate complex work.</p>
      <p className="mt-5 font-light leading-[1.7]">Research on expert grading has found that judges can form an overall impression of a project and then give similar scores across several supposedly separate rubric categories. Research on review panels has also shown that discussion can help judges share expertise, while sometimes making individual opinions less independent.</p>
      <section className="mt-12 border-2 border-brand bg-brand px-6 py-7 text-white">
        <p className="font-condensed text-2xl uppercase tracking-wide">A rigorous evaluation system</p>
        <p className="mt-3 font-light leading-[1.7] text-brand-pale">ASERS does not claim to eliminate bias. We treat judging itself as something that can be measured and improved, using training, calibration, independent scoring, conflict controls, expertise-aware assignments, and review of unusual disagreements.</p>
      </section>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Three-part evaluation</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          ["Research paper review", "Reviewers check the scientific record before the event and flag questions that may need closer attention during live judging."],
          ["Oral presentation", "Students present their work and answer questions from one panel of judges."],
          ["Poster session", "A different panel examines the same project in greater detail."],
        ].map(([title, body]) => (
          <div key={title} className="border-2 border-brand-pale p-5">
            <h3 className="font-condensed text-xl uppercase text-brand">{title}</h3>
            <p className="mt-3 text-sm font-light leading-[1.7]">{body}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 font-light leading-[1.7]">Oral and poster judges submit scores independently before seeing the other group&apos;s evaluations.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">What judges look for</h2>
      <ul className="mt-4 space-y-3 font-light leading-[1.6]">
        {areas.map((area) => <li key={area} className="border-l-4 border-brand pl-4">{area}</li>)}
      </ul>
      <p className="mt-5 font-light leading-[1.7]">Project size, expensive equipment, large datasets, complicated models, polished graphics, and mentor prestige do not carry weight on their own.</p>
      <p className="mt-4 font-light leading-[1.7]">Judges also answer two explicit questions: What intellectual contribution did the student make? Does the conclusion follow from the evidence actually generated?</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Scoring and deliberation</h2>
      <p className="mt-3 font-light leading-[1.7]">Judges use a short rubric based on the four areas above. We keep the rubric short because adding more scoring categories does not necessarily make judgments more independent.</p>
      <p className="mt-4 border-y-2 border-brand py-4 text-center font-condensed text-xl uppercase tracking-wide text-brand">Independent scoring → score submission → judge discussion → optional private revision</p>
      <p className="mt-4 font-light leading-[1.7]">Judges discuss projects only after their first scores are submitted. Discussion gives judges a chance to raise scientific concerns, explain field-specific details, and point out things another judge may have missed. Judges do not have to reach consensus.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Judge assignment and conflicts</h2>
      <p className="mt-3 font-light leading-[1.7]">Projects are assigned centrally based on relevant expertise and conflicts of interest. Judges may not evaluate students they have mentored, supervised, collaborated with, or have a close personal or professional connection to. Conflicts can also include a connection to a direct competitor.</p>
      <p className="mt-3 font-light leading-[1.7]">Parents or guardians of competitors may not take part in judging decisions that could affect their child&apos;s awards.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Reducing bias</h2>
      <p className="mt-3 font-light leading-[1.7]">Our goal is to reduce how much any one person&apos;s impression can affect the final result. ASERS uses:</p>
      <ul className="mt-4 grid gap-2 font-light leading-[1.6] sm:grid-cols-2">
        {safeguards.map((item) => <li key={item} className="border border-brand-pale px-4 py-3">{item}</li>)}
      </ul>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Feedback that helps researchers improve</h2>
      <p className="mt-3 font-light leading-[1.7]">A judging interaction should remain useful after the rankings are published. ASERS judges are asked to identify the strongest part of the work, an important limitation, an alternative explanation, one way to strengthen the conclusion, and a question worth pursuing next.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Judge training</h2>
      <p className="mt-3 font-light leading-[1.7]">Before the event, judges receive short guidance on following the evidence closely, asking follow-up questions based on the student&apos;s answers, checking whether claims match the data, separating future potential from demonstrated results, evaluating student understanding and contribution, recognizing limitations as part of good scientific reasoning, and using discussion to share expertise without pressuring other judges to agree.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Final awards</h2>
      <p className="mt-3 font-light leading-[1.7]">For top awards, judges first rank finalists independently. They then discuss the projects, raise scientific concerns, explain field-specific details, and resolve factual questions. After discussion, each judge submits a final private ranking.</p>
      <p className="mt-3 font-light leading-[1.7]">The final decision uses those rankings along with the oral and poster results and any important concerns raised during paper review.</p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Register to judge</h2>
      <ul className="mt-4 space-y-3">
        {chapters.map((chapter) => (
          <li key={chapter.slug} className="flex flex-wrap items-center justify-between gap-3 border-2 border-brand-pale p-4">
            <div><p className="font-medium">{chapter.name} ({chapter.shortName})</p>{chapter.venue && <p className="text-sm font-light">{chapter.venue}</p>}</div>
            {chapter.site ? <a href={chapter.site + "/register/judge"} className="bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark">Register to judge</a> : <span className="text-sm font-light">Registration opening soon</span>}
          </li>
        ))}
      </ul>
      <div className="mt-12"><Link href="/about" className="font-medium text-brand underline">Questions? Learn more about ASERS</Link></div>
    </div>
  );
}
