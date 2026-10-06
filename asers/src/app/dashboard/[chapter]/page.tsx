import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireVerifiedUser } from "@/lib/auth";
import { formatDate, getChapter } from "@/lib/chapters";
import { getUserRegistrationInChapter } from "@/lib/registrations";
import { ROLE_LABELS } from "@/lib/options";
import { Alert, PageShell, StatusBadge } from "@/components/ui";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import SraDashboard from "@/components/dashboard/SraDashboard";
import JudgeDashboard from "@/components/dashboard/JudgeDashboard";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

type Props = { params: Promise<{ chapter: string }> };

export default async function ChapterDashboardPage({ params }: Props) {
  const { chapter: slug } = await params;
  const user = await requireVerifiedUser(`/dashboard/${slug}`);
  const [chapter, reg] = await Promise.all([getChapter(slug), getUserRegistrationInChapter(user.id, slug)]);
  if (!chapter || !reg) notFound();

  const facts = [
    chapter.eventDate && ["Event", formatDate(chapter.eventDate) + (chapter.eventDetails ? ` · ${chapter.eventDetails}` : "")],
    chapter.venue && ["Venue", chapter.venue],
    chapter.registrationDeadline && ["Registration deadline", formatDate(chapter.registrationDeadline)],
    chapter.email && ["Contact", <a key="e" className="text-brand underline" href={`mailto:${chapter.email}`}>{chapter.email}</a>],
  ].filter(Boolean) as [string, React.ReactNode][];

  return (
    <PageShell
      width="max-w-5xl"
      eyebrow={
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
      }
      title={
        <span className="flex flex-wrap items-center gap-3">
          {ROLE_LABELS[reg.role]} Dashboard <StatusBadge status={reg.status} />
        </span>
      }
      intro={`${chapter.fullName} (${chapter.shortName})`}
    >
      <div className="space-y-6">
        {chapter.announcement && <Alert tone="info">{chapter.announcement}</Alert>}
        {facts.length > 0 && (
          <div className="grid gap-3 border-2 border-brand-pale bg-strip p-4 text-sm sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <p key={k}>
                <span className="font-medium">{k}:</span> <span className="font-light">{v}</span>
              </p>
            ))}
          </div>
        )}
        {reg.role === "student" && <StudentDashboard user={user} reg={reg} chapter={chapter} />}
        {reg.role === "sra" && <SraDashboard user={user} reg={reg} chapter={chapter} />}
        {reg.role === "judge" && <JudgeDashboard reg={reg} chapter={chapter} />}
      </div>
    </PageShell>
  );
}
