import "server-only";
import { cache } from "react";
import { all, first, parseJSON } from "@/lib/db";

export type ChapterRow = {
  slug: string;
  subdomain: string | null;
  name: string;
  short_name: string;
  full_name: string;
  description: string;
  about: string;
  announcement: string;
  site: string | null;
  contact_email: string | null;
  venue: string | null;
  founded: string | null;
  event_date: string | null;
  event_details: string;
  registration_deadline: string | null;
  student_fee: string;
  student_reg_open: number;
  sra_reg_open: number;
  judge_reg_open: number;
  judge_availability: string;
  published: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Chapter = {
  slug: string;
  subdomain: string | null;
  name: string;
  shortName: string;
  fullName: string;
  description: string;
  about: string;
  announcement: string;
  site: string | null;
  email: string | null;
  venue: string | null;
  founded: string | null;
  eventDate: string | null;
  eventDetails: string;
  registrationDeadline: string | null;
  studentFee: string;
  regOpen: { student: boolean; sra: boolean; judge: boolean };
  judgeAvailability: string[];
  published: boolean;
  sortOrder: number;
};

export function toChapter(r: ChapterRow): Chapter {
  return {
    slug: r.slug,
    subdomain: r.subdomain,
    name: r.name,
    shortName: r.short_name,
    fullName: r.full_name,
    description: r.description,
    about: r.about,
    announcement: r.announcement,
    site: r.site,
    email: r.contact_email,
    venue: r.venue,
    founded: r.founded,
    eventDate: r.event_date,
    eventDetails: r.event_details,
    registrationDeadline: r.registration_deadline,
    studentFee: r.student_fee,
    regOpen: {
      student: !!r.student_reg_open,
      sra: !!r.sra_reg_open,
      judge: !!r.judge_reg_open,
    },
    judgeAvailability: parseJSON<string[]>(r.judge_availability, []),
    published: !!r.published,
    sortOrder: r.sort_order,
  };
}

const ORDER = "ORDER BY sort_order, name";

/** Published chapters, for public pages. */
export const getPublishedChapters = cache(async (): Promise<Chapter[]> => {
  const rows = await all<ChapterRow>(`SELECT * FROM chapters WHERE published = 1 ${ORDER}`);
  return rows.map(toChapter);
});

/** Every chapter including drafts, for admin pages. */
export const getAllChapters = cache(async (): Promise<Chapter[]> => {
  const rows = await all<ChapterRow>(`SELECT * FROM chapters ${ORDER}`);
  return rows.map(toChapter);
});

export const getChapter = cache(async (slug: string): Promise<Chapter | null> => {
  const row = await first<ChapterRow>("SELECT * FROM chapters WHERE slug = ?", slug);
  return row ? toChapter(row) : null;
});

export async function getChapterBySubdomain(subdomain: string): Promise<Chapter | null> {
  const row = await first<ChapterRow>("SELECT * FROM chapters WHERE subdomain = ?", subdomain);
  return row ? toChapter(row) : null;
}

/** Splits admin-entered long text into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
