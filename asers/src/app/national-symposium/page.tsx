import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "National Symposium",
  description: "ASERS is planning its first National Symposium for 2027.",
};

const model = [
  ["Regional qualification", "Participating ASERS chapters run local symposia under shared national standards. Their strongest researchers can advance to the national event."],
  ["Research-backed judging", "National finalists present to scientists through ASERS's multiple-evaluation format, with separate oral and poster reviews whenever possible."],
  ["A national community", "Students from participating regions meet peers, receive serious scientific feedback, and help build the research community beyond their home chapter."],
];

export default function NationalSymposiumPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Coming in 2027</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">The ASERS National Symposium</h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">ASERS is planning its first National Symposium, bringing together top researchers from participating regional ASERS chapters across the United States.</p>
      <p className="mt-5 text-[19px] font-light leading-[1.6]">Selected finalists will be invited to present and compete nationally through the same research-informed judging system that guides our regional symposia.</p>

      <div className="mt-10 border-2 border-brand bg-brand px-6 py-7 text-white">
        <p className="font-condensed text-2xl uppercase tracking-wide">Regional ASERS → National ASERS</p>
        <p className="mt-3 font-light leading-[1.7] text-brand-pale">Run a recognized regional symposium. Give your strongest students a path to a national stage. Build a local research community connected to something larger.</p>
      </div>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">How the model works</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {model.map(([title, body]) => (
          <div key={title} className="border-2 border-brand-pale p-5">
            <h3 className="font-condensed text-xl uppercase text-brand">{title}</h3>
            <p className="mt-3 text-sm font-light leading-[1.7]">{body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Cost should not determine who gets to compete</h2>
      <p className="mt-3 font-light leading-[1.7]">ASERS aims to subsidize travel for National Finalists who would otherwise face financial barriers to attending. Support may include travel grants, hotel rooms, registration, meals, local transportation, and poster printing, depending on the program budget and approved assistance policies.</p>
      <p className="mt-3 font-light leading-[1.7]">The first national event is being planned as a focused gathering of serious regional programs. Details such as the final location, number of participating chapters, finalist count, and subsidy amounts will be announced as the program develops.</p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Help build the national network</h2>
      <p className="mt-3 font-light leading-[1.7]">Chapter founders make this possible. Beginning in 2027, top researchers from participating regional symposia are planned to advance to the ASERS National Symposium.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link href="/chapters#start" className="bg-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark">Start a chapter</Link>
        <Link href="/donate" className="border-2 border-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-brand transition hover:bg-brand hover:text-white">Donate to ASERS</Link>
      </div>
    </div>
  );
}
