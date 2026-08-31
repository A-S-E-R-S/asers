import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "National Symposium",
  description: "ASERS is planning its first National Symposium for 2027.",
  alternates: { canonical: "/national-symposium" },
};

const model = [
  ["Regional qualification", "Participating ASERS chapters run local symposia under shared national standards. Their strongest researchers can advance to the national event."],
  ["Research-backed judging", "National finalists present to scientists through ASERS's multiple-evaluation format, with separate oral and poster reviews whenever possible."],
  ["Beyond your chapter", "Students from participating regions meet peers and receive scientific feedback from people who did not judge them at Regionals."],
];

export default function NationalSymposiumPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Coming in 2027</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">The ASERS National Symposium</h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">ASERS is planning its first National Symposium for researchers who qualify through participating regional chapters.</p>
      <p className="mt-5 text-[19px] font-light leading-[1.6]">Finalists will present nationally, receive another round of questions, and have time to respond to feedback before the event.</p>

      <div className="mt-10 border-2 border-brand bg-brand px-6 py-7 text-white">
        <p className="font-condensed text-2xl uppercase tracking-wide">Regional ASERS → National ASERS</p>
        <p className="mt-3 font-light leading-[1.7] text-brand-pale">A regional chapter gives its strongest students a path to a national event and connects them with researchers from other parts of the country.</p>
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

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Research can keep moving</h2>
      <p className="mt-3 font-light leading-[1.7]">Finalists advance the same underlying research project, but they are encouraged to strengthen analyses, address judge feedback, conduct additional experiments, and correct limitations between Regionals and Nationals. Actual science is iterative: present, get questioned, revise, and test again.</p>
      <p className="mt-4 border-y-2 border-brand py-4 text-center font-condensed text-xl uppercase tracking-wide text-brand">Regional feedback → research improvement → National defense</p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Helping finalists attend</h2>
      <p className="mt-3 font-light leading-[1.7]">ASERS aims to subsidize travel for National Finalists who would otherwise face financial barriers to attending. Support may include travel grants, hotel rooms, registration, meals, local transportation, and poster printing, depending on the program budget and approved assistance policies.</p>
      <p className="mt-3 font-light leading-[1.7]">The location, participating chapters, finalist count, and travel-support details will be announced when they are settled.</p>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">Help build the national network</h2>
      <p className="mt-3 font-light leading-[1.7]">Chapter founders make this possible. Starting in 2027, strong projects from participating regional symposia are expected to advance to Nationals.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link href="/chapters#start" className="bg-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-white transition hover:bg-brand-dark">Start a chapter</Link>
        <Link href="/donate" className="border-2 border-brand px-[22px] py-[12px] font-condensed text-[22px] uppercase tracking-tight text-brand transition hover:bg-brand hover:text-white">Donate to ASERS</Link>
      </div>
    </div>
  );
}
