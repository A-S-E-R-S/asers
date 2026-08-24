// Registry of ASERS state chapters.
// Adding a chapter here automatically:
//   - lists it on /chapters and the homepage
//   - creates its page at /chapters/<slug>
//   - enables the <subdomain>.asers.org -> asers.org/chapters/<slug> 301 redirect
//     (the subdomain also needs a custom-domain route in wrangler.jsonc)

export type Chapter = {
  slug: string;
  subdomain: string;
  name: string; // state name
  shortName: string; // e.g. "NJSRS"
  fullName: string;
  site?: string; // chapter's own site, if it has one
  email?: string;
  venue?: string;
  founded?: string;
  description: string;
};

export const chapters: Chapter[] = [
  {
    slug: "new-jersey",
    subdomain: "nj",
    name: "New Jersey",
    shortName: "NJSRS",
    fullName: "New Jersey Science Research Symposium",
    site: "https://njsrs.org",
    email: "fairdirector@njsrs.org",
    venue: "Millburn High School, 462 Millburn Ave, Millburn, NJ 07041",
    founded: "2025",
    description:
      "Our founding chapter. NJSRS is a premier science research competition open to any high school student attending a public or private high school in New Jersey, featuring oral presentations judged by STEM professionals, a finals round, a poster session, and sponsored special awards.",
  },
];

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

// TODO: update these as chapters report real numbers.
export const impactStats = [
  { value: "100+", label: "Student researchers" },
  { value: "40+", label: "STEM professional judges" },
  { value: "$2,500+", label: "Awarded in prizes" },
  { value: "1", label: "State chapter (and growing)" },
];
