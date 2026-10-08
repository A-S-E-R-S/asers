import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, getChapter } from "@/lib/chapters";
import { getSchools, getSchoolsWithSras, getUserRegistrationInChapter } from "@/lib/registrations";
import { ROLE_LABELS, isRole } from "@/lib/options";
import { Alert, PageShell, TextLink } from "@/components/ui";
import StudentForm from "@/components/register/StudentForm";
import SraForm from "@/components/register/SraForm";
import JudgeForm from "@/components/register/JudgeForm";

type Props = { params: Promise<{ chapter: string; role: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapter: slug, role } = await params;
  const chapter = await getChapter(slug);
  if (!chapter || !isRole(role)) return {};
  return { title: `${ROLE_LABELS[role]} registration | ${chapter.shortName}` };
}

export default async function RegisterFormPage({ params }: Props) {
  const { chapter: slug, role } = await params;
  if (!isRole(role)) notFound();
  const chapter = await getChapter(slug);
  if (!chapter || !chapter.published) notFound();

  const user = await getCurrentUser();
  const prior = user ? await getUserRegistrationInChapter(user.id, chapter.slug) : null;
  // A withdrawn registration can be replaced by registering again.
  const existing = prior?.status === "withdrawn" ? null : prior;
  const accountUser = user
    ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone }
    : null;

  const titles = {
    student: "Register as a Student",
    sra: "Register as a Science Research Advisor",
    judge: "Register as a Judge",
  };
  const intros = {
    student: (
      <>
        Register to compete in the {chapter.fullName}. You must have a Science Research Advisor from your school
        registered first.{chapter.studentFee && <> Entry fee: {chapter.studentFee}, collected through your school&apos;s SRA.</>}
      </>
    ),
    sra: <>Each school must have an SRA before its students can register for the {chapter.fullName}. Register your school first.</>,
    judge: <>Help evaluate student research projects at the {chapter.fullName}.</>,
  };

  let body: React.ReactNode;
  if (existing) {
    body = (
      <Alert tone="info">
        You&apos;re already registered with {chapter.shortName} as {ROLE_LABELS[existing.role].toLowerCase()}.{" "}
        <TextLink href={`/dashboard/${chapter.slug}`}>Go to your dashboard</TextLink>.
      </Alert>
    );
  } else if (!chapter.regOpen[role]) {
    body = (
      <Alert tone="warning">
        {chapter.shortName} isn&apos;t accepting {ROLE_LABELS[role].toLowerCase()} registrations right now.
        {chapter.email && (
          <>
            {" "}
            Questions? Email <a className="font-medium underline" href={`mailto:${chapter.email}`}>{chapter.email}</a>.
          </>
        )}
      </Alert>
    );
  } else if (role === "student") {
    const schools = await getSchoolsWithSras(chapter.slug);
    body = (
      <StudentForm
        chapterSlug={chapter.slug}
        chapterShortName={chapter.shortName}
        contactEmail={chapter.email}
        user={accountUser}
        schools={schools.map((s) => ({ id: s.id, name: s.name, town: s.town }))}
      />
    );
  } else if (role === "sra") {
    const schools = await getSchools(chapter.slug);
    body = (
      <SraForm
        chapterSlug={chapter.slug}
        chapterName={chapter.name}
        user={accountUser}
        schools={schools.map((s) => ({ id: s.id, name: s.name, town: s.town }))}
      />
    );
  } else {
    body = (
      <JudgeForm
        chapterSlug={chapter.slug}
        chapterShortName={chapter.shortName}
        eventDateLabel={formatDate(chapter.eventDate)}
        availabilityOptions={chapter.judgeAvailability}
        user={accountUser}
      />
    );
  }

  return (
    <PageShell eyebrow={`${chapter.shortName} registration`} title={titles[role]} intro={intros[role]}>
      {chapter.registrationDeadline && !existing && chapter.regOpen[role] && (
        <p className="-mt-3 mb-6 text-sm font-medium text-brand">
          Registration deadline: {formatDate(chapter.registrationDeadline)}
        </p>
      )}
      {prior?.status === "withdrawn" && chapter.regOpen[role] && (
        <div className="mb-6">
          <Alert tone="info">
            You previously withdrew from {chapter.shortName}. Registering again replaces that registration.
          </Alert>
        </div>
      )}
      {body}
      {!user && !existing && (
        <p className="mt-10 border-t-2 border-brand-pale pt-6 text-sm font-light">
          Already have an ASERS account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(`/register/${chapter.slug}/${role}`)}`}
            className="font-medium text-brand underline"
          >
            Log in
          </Link>{" "}
          to register with it.
        </p>
      )}
    </PageShell>
  );
}
