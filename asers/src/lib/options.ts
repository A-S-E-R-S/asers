// Shared form options (client + server). Carried over from the NJSRS 2026 forms.

export const ROLES = ["student", "sra", "judge"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  sra: "Science Research Advisor",
  judge: "Judge",
};

export const ROLE_PLURAL: Record<Role, string> = {
  student: "Students",
  sra: "SRAs",
  judge: "Judges",
};

export const ROLE_BLURBS: Record<Role, string> = {
  student: "High school researchers presenting original work. Your school's Science Research Advisor must register first.",
  sra: "Teachers who sponsor students from their school. Each school needs an SRA before its students can register.",
  judge: "Scientists, engineers, faculty, and other STEM professionals who evaluate projects and give feedback.",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export const STATUSES = ["pending", "approved", "rejected", "withdrawn"] as const;
export type Status = (typeof STATUSES)[number];

export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export const GRADES = ["9", "10", "11", "12"] as const;
export const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const DOMAINS = [
  "Life Sciences (Biology, Microbiology, Neuroscience, Medicine, Biochemistry)",
  "Physical Sciences (Physics, Chemistry, Materials Science, Astronomy)",
  "Engineering & Technology (Mechanical, Electrical, Civil, Biomedical, Robotics)",
  "Computer Science & Artificial Intelligence",
  "Environmental & Earth Sciences (Ecology, Climate, Geology, Atmospheric Science)",
  "Mathematics",
  "Social & Behavioral Sciences (Psychology, Sociology, Behavioral Studies)",
] as const;
export const MAX_DOMAINS = 2;

export const METHOD_GROUPS: { group: string; options: string[] }[] = [
  {
    group: "Experimental / Lab-Based",
    options: [
      "Wet lab experimentation (biological or chemical testing)",
      "Physical experimentation (physics/material testing)",
      "Environmental or field data collection",
    ],
  },
  {
    group: "Engineering / Applied Testing",
    options: [
      "Engineering prototype built and physically tested",
      "Device performance testing with measurable output",
      "Hardware construction with experimental validation",
    ],
  },
  {
    group: "Computational / Data-Driven",
    options: [
      "Computational modeling with experimental validation",
      "Machine learning model",
      "Statistical analysis",
      "Simulation",
    ],
  },
  {
    group: "Human Subjects Research",
    options: ["Controlled behavioral experiment", "Survey study"],
  },
];
export const METHODS = METHOD_GROUPS.flatMap((g) => g.options);

export const FOCUSES = [
  "Healthcare / Disease",
  "Environmental Sustainability / Climate",
  "Energy Systems",
  "Agriculture / Food Systems",
  "Infrastructure / Engineering Systems",
  "Accessibility / Assistive Technology",
  "Education",
  "Public Safety / Cybersecurity",
  "Fundamental Scientific Advancement",
  "Theoretical Mathematics",
  "Applied Mathematics/Physics",
  "Other",
] as const;

export const DESCRIPTION_MAX_WORDS = 150;

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export const EMPLOYMENT_STATUSES = ["Currently Working", "Retired"] as const;

export const DEGREES = [
  "Bachelor's",
  "Master's",
  "PhD",
  "MD",
  "MD/PhD",
  "Other doctorate (JD, PharmD, DVM, ...)",
  "Currently enrolled in a graduate program",
  "Other",
] as const;

export const PASSWORD_MIN = 8;
