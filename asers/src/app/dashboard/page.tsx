import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminScope, isAnyAdmin, requireVerifiedUser } from "@/lib/auth";
import { getUserRegistrations } from "@/lib/registrations";
import { ROLE_LABELS } from "@/lib/options";
import { PageShell, StatusBadge, TextLink } from "@/components/ui";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardPage() {
  const user = await requireVerifiedUser("/dashboard");
  const [registrations, scope] = await Promise.all([getUserRegistrations(user.id), getAdminScope(user)]);
  const admin = isAnyAdmin(scope);

  if (registrations.length === 1 && !admin) redirect(`/dashboard/${registrations[0].chapter_slug}`);
  if (registrations.length === 0 && admin) redirect("/admin");

  return (
    <PageShell eyebrow="Dashboard" title={`Welcome, ${user.firstName}`}>
      {admin && (
        <Link
          href="/admin"
          className="mb-8 block border-2 border-brand bg-brand p-5 text-white transition hover:bg-brand-dark"
        >
          <span className="font-condensed text-xl uppercase tracking-tight">Admin panel</span>
          <span className="mt-1 block text-sm font-light text-brand-pale">
            {scope.national ? "National admin: all chapters" : `Manage ${scope.chapters.length} chapter${scope.chapters.length === 1 ? "" : "s"}`}
          </span>
        </Link>
      )}

      {registrations.length === 0 ? (
        <p className="font-light">
          You aren&apos;t registered with any chapter yet. <TextLink href="/register">Register now</TextLink>.
        </p>
      ) : (
        <div className="space-y-4">
          {registrations.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/${r.chapter_slug}`}
              className="flex flex-wrap items-center justify-between gap-3 border-2 border-brand-pale p-5 transition hover:border-brand"
            >
              <span>
                <span className="block text-lg font-bold">
                  {r.chapter_name} ({r.chapter_short_name})
                </span>
                <span className="text-sm font-light">
                  {ROLE_LABELS[r.role]}
                  {r.school_name ? ` · ${r.school_name}` : ""}
                </span>
              </span>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}

      <p className="mt-10 text-sm font-light">
        <TextLink href="/register">Register for another chapter</TextLink> ·{" "}
        <TextLink href="/account">Account settings</TextLink>
      </p>
    </PageShell>
  );
}
