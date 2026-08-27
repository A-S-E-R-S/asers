import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "ASERS is a student-run national network of science research symposia, founded to expand access to research competition, mentorship, and community.",
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
        ASERS grew out of the New Jersey Science Research Symposium, which began as a
        student-run effort to create more opportunities for high school researchers to
        present their work. As we competed in other research programs ourselves, we
        became increasingly interested in how judging could be made more consistent and
        fair.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        That led us to build ASERS around a research-informed judging structure,
        multiple independent evaluations, and local chapters run by students under
        shared national standards. We use separate oral and poster panels, conflict
        screening, independent scoring before deliberation, and review of major
        disagreements.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        What started as one student-run symposium is growing into a national network of
        local chapters.
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
