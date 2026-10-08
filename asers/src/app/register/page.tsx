import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedChapters } from "@/lib/chapters";
import { PageShell } from "@/components/ui";
import { ROLES, ROLE_BLURBS, ROLE_LABELS } from "@/lib/options";

export const metadata: Metadata = {
  title: "Register",
  description: "Register for an ASERS chapter symposium as a student, Science Research Advisor, or judge.",
  alternates: { canonical: "/register" },
};


export default async function RegisterPage() {
  const chapters = await getPublishedChapters();

  return (
    <PageShell
      eyebrow="Register"
      title="Register for a symposium"
      width="max-w-4xl"
      intro="Each ASERS chapter runs its own symposium and registration. Pick your chapter, then register as a student, Science Research Advisor (SRA), or judge."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role} className="border-2 border-brand-pale p-5">
            <p className="font-condensed text-xl uppercase tracking-tight text-brand">{ROLE_LABELS[role]}</p>
            <p className="mt-2 text-sm font-light leading-relaxed">{ROLE_BLURBS[role]}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold tracking-[-0.015em]">Choose your chapter</h2>
      {chapters.length === 0 && <p className="mt-4 font-light">No chapters are open yet. Check back soon.</p>}
      <div className="mt-5 space-y-4">
        {chapters.map((c) => {
          const open = ROLES.filter((r) => c.regOpen[r]);
          return (
            <div key={c.slug} className="border-2 border-brand p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xl font-bold">
                  {c.name} <span className="font-light">({c.shortName})</span>
                </p>
                <Link href={`/chapters/${c.slug}`} className="text-sm font-medium text-brand underline">
                  About this chapter
                </Link>
              </div>
              {open.length === 0 ? (
                <p className="mt-3 text-sm font-light">Registration isn&apos;t open yet.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-3">
                  {open.map((r) => (
                    <Link
                      key={r}
                      href={`/register/${c.slug}/${r}`}
                      className="bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
                    >
                      Register as {r === "sra" ? "an SRA" : `a ${ROLE_LABELS[r].toLowerCase()}`}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-sm font-light">
        Already registered? <Link href="/login" className="font-medium text-brand underline">Log in</Link>. Registering
        for a second chapter? Log in first and use the same account.
      </p>
    </PageShell>
  );
}
