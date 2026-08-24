import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/data/chapters";

export const metadata: Metadata = {
  title: "Competition",
  description:
    "How ASERS symposia work: eligibility, registration, event-day format, and special awards.",
};

const schedule = [
  ["8:00 – 8:30 AM", "Check-in and setup"],
  ["8:30 AM – 12:00 PM", "Category judging with oral presentations"],
  ["12:00 – 1:00 PM", "Lunch break"],
  ["1:00 – 3:30 PM", "Finals for category winners"],
  ["3:45 – 5:00 PM", "Poster session for special awards"],
  ["5:30 – 6:30 PM", "Awards ceremony"],
];

export default function CompetitionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Compete</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">
        The Competition
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">
        ASERS chapters host annual research symposia where high school students present
        original experimental STEM research to panels of professional judges.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Who can compete</h2>
      <p className="mt-3 font-light leading-[1.6]">
        Any high school student attending a public or private high school in a state
        with an ASERS chapter is eligible. Projects must be experimental research.
        Check your chapter&apos;s rules for the qualifying project start date and entry
        fee (typically $30 per student).
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">How to register</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-6 font-light leading-[1.6]">
        <li>
          Your school registers a Science Research Advisor (SRA). Any faculty member
          can serve in this role.
        </li>
        <li>Students select their school and SRA to complete individual registration.</li>
        <li>
          Entry fees are collected by each school and mailed as a single payment to the
          chapter&apos;s venue.
        </li>
      </ol>
      <div className="mt-4 border-l-4 border-brand bg-brand-pale/40 p-4 text-sm">
        Registration is handled by each chapter.{" "}
        {chapters
          .filter((c) => c.site)
          .map((c) => (
            <span key={c.slug}>
              {c.name} students register at{" "}
              <a className="font-medium text-brand underline" href={`${c.site}/register/student`}>
                {c.site!.replace("https://", "")}
              </a>
              .
            </span>
          ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Competition format</h2>
      <p className="mt-3 font-light leading-[1.6]">
        Students deliver a 10-minute oral presentation using slides in their category
        round, followed by Q&amp;A from judges and the audience. Category winners
        present again in the finals (judges&apos; questions only). A poster session
        determines sponsored special awards.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Event day schedule</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            {schedule.map(([time, item]) => (
              <tr key={time} className="border-b border-brand-pale">
                <td className="whitespace-nowrap py-3 pr-6 font-medium">{time}</td>
                <td className="py-3 font-light">{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Special awards</h2>
      <p className="mt-3 font-light leading-[1.6]">
        Sponsored cash prizes recognize outstanding work in areas such as AI and
        biomedical convergence, cancer research, statistics, engineering innovation,
        assistive technology, and environmental sustainability.
      </p>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/chapters"
          className="bg-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark"
        >
          Find your chapter
        </Link>
        <Link
          href="/judging"
          className="border-2 border-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-brand transition hover:bg-brand hover:text-white"
        >
          Become a judge
        </Link>
      </div>
    </div>
  );
}
