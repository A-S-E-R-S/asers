import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "ASERS is a student-run national network of science research symposia, founded to expand access to research competition, mentorship, and community.",
  alternates: { canonical: "/about" },
};

// TODO: confirm titles / add-remove people for the national org.
const team = [
  { name: "Subhi Stephan", role: "Technology Committee Chair" },
  { name: "Paridhi Tyagi", role: "Participant Outreach Chair" },
  { name: "Daniel Han", role: "Logistics & Fundraising" },
  { name: "Ahisha Ravi", role: "Logistics & Fundraising, Marketing" },
  { name: "Aaron Yu", role: "Judging Outreach Chair" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">About</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">
        About ASERS
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">
        ASERS is a national science research competition built and led by high school
        students. We organize research symposia where students present original work,
        defend it before scientists and engineers, receive detailed feedback, and
        compete for recognition.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Our story</h2>
      <p className="mt-3 font-light leading-[1.6]">
        ASERS began with the New Jersey Science Research Symposium in 2026, after the
        suspension of JSHS left student researchers in our area without one of the
        major opportunities we had expected to compete in. Having gone through science
        fairs ourselves, including JSHS and ISEF, we decided to build a symposium so
        students could still present their research and have it evaluated by scientists.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        Running that first symposium made us interested in a broader problem: how
        research competitions can make judging more consistent, fair, and useful to
        every student, regardless of whether they win.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        That became the foundation for ASERS.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        Our judging structure emphasizes multiple independent evaluations,
        expertise-aware judge assignments, conflict screening, independent scoring
        before deliberation, and review of major disagreements. Students present through
        both oral and poster formats and receive detailed feedback designed to help
        them strengthen their work.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        What began as a response to a temporary gap in research opportunities has grown
        into something with a different purpose. ASERS is now building a national
        network of student-led chapters under shared standards, centered on making the
        evaluation of student research as rigorous as the research itself.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Built by students</h2>
      <p className="mt-3 font-light leading-[1.6]">
        ASERS is planned and run by high school students across judging, outreach,
        technology, logistics, fundraising, marketing, and chapter development.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        Researchers, faculty, graduate students, engineers, physicians, and other STEM
        professionals serve as judges and help us keep the scientific evaluation
        rigorous.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Our team</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {team.map((m) => (
          <div key={m.name} className="border-2 border-brand-pale p-5">
            <p className="font-medium">{m.name}</p>
            <p className="mt-1 text-sm font-light">{m.role}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Get in touch</h2>
      <p className="mt-3 font-light leading-[1.6]">
        Questions about competing, judging, sponsoring, or starting a chapter in your
        state?{" "}
        <a className="font-medium text-brand underline" href="mailto:contact@asers.org">
          contact@asers.org
        </a>
      </p>
      <p className="mt-6">
        <Link className="font-medium text-brand underline" href="/chapters">
          Meet our chapters
        </Link>
      </p>
    </div>
  );
}
