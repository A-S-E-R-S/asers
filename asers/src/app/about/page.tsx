import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "ASERS is a student-run national network of science research symposia, founded to expand access to research competition, mentorship, and community.",
  alternates: { canonical: "/about" },
};

// TODO: confirm titles / add-remove people for the national org.
const team = [
  { name: "Subhi Stephan", role: "Technology Committee Chair", image: "/images/people/subhi_stephan.jpg" },
  { name: "Paridhi Tyagi", role: "Participant Outreach Chair", image: "/images/people/pari_tyagi.jpg" },
  { name: "Daniel Han", role: "Logistics & Fundraising", image: "/images/people/daniel_han.jpg" },
  { name: "Ahisha Ravi", role: "Logistics & Fundraising, Marketing", image: "/images/people/ahisha_ravi.jpg" },
  { name: "Aaron Yu", role: "Judging Outreach Chair", image: "/images/people/aaron_yu.jpg" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">About</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">
        About ASERS
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">
        ASERS is a student-run science research competition. At our symposia, students
        present original work, answer questions from scientists and engineers, get
        detailed feedback, and compete for recognition.
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
        After that first symposium, we started asking a bigger question: how can a
        research competition make judging more consistent, fair, and useful to every
        student, including the ones who do not win?
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        That question became the foundation for ASERS.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        We use more than one evaluation, match judges to the subject when possible,
        screen for conflicts, collect scores before discussion, and look again when
        evaluations differ sharply. Students present orally and at a poster, then
        receive feedback they can use to improve the work.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        ASERS started as a response to a temporary gap in research opportunities. It is
        now growing into a national network of student-led chapters with shared
        standards and a simple goal: evaluate student research as carefully as possible.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Students run ASERS</h2>
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
          <div key={m.name} className="overflow-hidden border-2 border-brand-pale">
            <div className="relative aspect-[4/3] bg-brand-pale">
              <Image src={m.image} alt={m.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="p-5">
              <p className="font-medium">{m.name}</p>
              <p className="mt-1 text-sm font-light">{m.role}</p>
            </div>
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
