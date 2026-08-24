import type { Metadata } from "next";
import Image from "next/image";
import { sponsorTiers } from "@/data/sponsors";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Sponsor an ASERS symposium. Donations fund logistics, printing, display materials, and student awards.",
};

export default function DonatePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-condensed text-lg uppercase tracking-tight text-brand">Donate</p>
      <h1 className="mt-2 text-[46px] font-bold leading-tight tracking-[-0.015em]">
        Support student research
      </h1>
      <p className="mt-4 text-[19px] font-light leading-[1.6]">
        ASERS symposia give high school students a venue to present STEM research,
        compete for prizes, receive feedback, and learn from peers. Contributions
        support logistics, printing, display materials, and awards.
      </p>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">
        Sponsorship tiers &amp; our sponsors
      </h2>

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
