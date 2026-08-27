import type { Metadata } from "next";
import Image from "next/image";
import { sponsorTiers } from "@/data/sponsors";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Sponsor an ASERS symposium. Donations fund logistics, printing, display materials, and student awards.",
  alternates: { canonical: "/donate" },
};

export default function DonatePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Donate</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">
        Support student research
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">
        Your donation helps expand access to high-quality student research competitions,
        including regional symposia, national programming, student travel assistance,
        awards, and judging resources.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Sponsor the organization", "Support regional symposia, national programming, student access, judging, awards, and chapter growth."],
          ["Sponsor an event or program", "Fund a poster session, awards ceremony, judge training, student networking, travel support, or chapter launch."],
          ["Sponsor a special award", "Create a named award recognizing strong research in a field connected to your organization's mission."],
        ].map(([title, body]) => (
          <div key={title} className="border-2 border-brand p-5">
            <h2 className="font-condensed text-xl uppercase tracking-tight text-brand">{title}</h2>
            <p className="mt-3 text-sm font-light leading-[1.7]">{body}</p>
          </div>
        ))}
      </div>
      <section className="mt-8 border-2 border-brand bg-brand px-6 py-7 text-white">
        <p className="font-condensed text-2xl uppercase tracking-wide">Help make Nationals accessible</p>
        <p className="mt-3 font-light leading-[1.7] text-brand-pale">
          We want qualifying for ASERS Nationals to depend on the quality of a
          student&apos;s research, not whether their family can afford the trip. ASERS
          aims to subsidize travel for National Finalists who would otherwise face
          financial barriers to attending.
        </p>
        <a href="mailto:contact@asers.org?subject=Donate%20to%20ASERS" className="mt-5 inline-block border-2 border-white px-5 py-2 font-medium text-white transition hover:border-brand-pale hover:text-brand-pale">
          Donate to ASERS
        </a>
      </section>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Examples of impact</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          ["$50", "can help cover a student's poster or event materials."],
          ["$250", "can help subsidize a finalist's travel to the National Symposium."],
          ["$500", "can support awards or operating costs for a regional symposium."],
          ["$1,000+", "can help launch or expand an ASERS chapter."],
        ].map(([amount, impact]) => (
          <div key={amount} className="border-2 border-brand-pale p-5">
            <p className="font-condensed text-2xl text-brand">{amount}</p>
            <p className="mt-2 text-sm font-light leading-[1.6]">{impact}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold tracking-[-0.015em]">General sponsorship levels</h2>
      <p className="mt-3 font-light leading-[1.6]">General sponsorship supports the organization where the need is greatest. Recognition scales with the level of support.</p>

      <div className="mt-6 space-y-10">
        {sponsorTiers.map((tier) => (
          <section key={tier.name}>
            {/* Tier banner */}
            <div
              className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-4"
              style={{
                background: `linear-gradient(90deg, ${tier.from}, ${tier.to})`,
                color: tier.text,
              }}
            >
              <span className="font-condensed text-[26px] uppercase tracking-[0.02em]">
                {tier.name}
              </span>
              <span className="text-lg font-bold">{tier.amount}</span>
              <span className="w-full text-sm font-light sm:w-auto">{tier.benefits}</span>
            </div>

            {/* Sponsors in this tier */}
            {tier.sponsors.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-12 gap-y-6 border-2 border-t-0 border-strip-border px-6 py-6">
                {tier.sponsors.map((s) =>
                  s.logo ? (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.name}
                    >
                      <Image
                        src={s.logo}
                        alt={s.name}
                        width={220}
                        height={100}
                        className="h-[72px] w-auto object-contain"
                      />
                    </a>
                  ) : (
                    <span key={s.name} className="text-lg font-medium">
                      {s.name}
                    </span>
                  )
                )}
              </div>
            ) : (
              <div className="border-2 border-t-0 border-dashed border-strip-border px-6 py-6 text-sm font-light">
                Your organization here.{" "}
                <a className="font-medium text-brand underline" href="mailto:contact@asers.org">
                  Become a {tier.name} sponsor
                </a>
                .
              </div>
            )}
          </section>
        ))}
      </div>

      <p className="mt-6 text-sm font-light">
        …plus the individual families and donors who sponsor our special awards. Thank
        you!
      </p>

      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">Sponsor a special award</h2>
        <p className="mt-3 font-light leading-[1.6]">Organizations can propose a named award recognizing strong research in an area connected to their mission. Special awards typically begin at $500, with most of the contribution supporting the student prize.</p>
        <p className="mt-3 font-light leading-[1.6]">Sponsors may help define the scientific focus and nominate qualified judges. ASERS reviews all criteria, judge assignments, and conflicts of interest before judging. Special-award sponsors do not select Grand Award winners.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {["Excellence in Artificial Intelligence", "Cancer Research Award", "Environmental Sustainability Award", "Biomedical Innovation Award", "Statistical Methods Award", "Engineering Design Award", "Computational Science Award", "Scientific Communication Award"].map((award) => <div key={award} className="border border-brand-pale px-4 py-3 text-sm font-light">{award}</div>)}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-[-0.015em]">Sponsor a program or event</h2>
        <p className="mt-3 font-light leading-[1.6]">We welcome support for specific event components and access programs, including:</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {["Student Access Sponsor", "Travel Support Sponsor", "School Access Sponsor", "Chapter Launch Sponsor", "Poster Session Sponsor", "Awards Ceremony Sponsor", "Judge Training Sponsor", "Student Networking Sponsor", "Printing or Photography Sponsor", "In-kind venue, food, software, or transportation partner"].map((item) => <li key={item} className="border border-brand-pale px-4 py-3 text-sm font-light">{item}</li>)}
        </ul>
        <p className="mt-4 font-light leading-[1.6]">Program sponsors receive recognition connected to what they make possible. Sponsors do not control judge assignments or award selection.</p>
      </section>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">How to donate</h2>
      <p className="mt-3 font-light leading-[1.6]">
        To sponsor a chapter or donate a special award, contact us and we&apos;ll connect
        you with the right chapter:
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        <a
          href="mailto:contact@asers.org"
          className="bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark"
        >
          contact@asers.org
        </a>
        <a
          href="mailto:fairdirector@njsrs.org"
          className="border-2 border-brand px-6 py-3 font-medium text-brand transition hover:bg-brand hover:text-white"
        >
          New Jersey: fairdirector@njsrs.org
        </a>
      </div>
    </div>
  );
}
