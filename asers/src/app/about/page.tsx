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
        About Us
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">
        The American Science and Engineering Research Symposium (ASERS) provides high
        school students with a comprehensive research competition experience: a place
        to present experimental work, receive feedback from professionals, and compete
        for recognition.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Our story</h2>
      <p className="mt-3 font-light leading-[1.6]">
        ASERS grew out of the New Jersey Science Research Symposium (NJSRS), created to
        fill the gap left by the suspension of JSHS. What began as a single statewide
        fair is growing into a national network of chapters, each combining
        competition, education, mentorship, and community building among young
        researchers through oral presentations, category-based judging, poster
        sessions, and special awards.
      </p>
      <p className="mt-3 font-light leading-[1.6]">
        We are committed to making these competitions accessible, fair, and educational
        for all participants.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Leadership team</h2>
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
