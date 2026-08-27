// Sponsor tiers and current sponsors.
// Logos live in public/images/sponsors/ (transparent PNGs).

export type Sponsor = {
  name: string;
  logo?: string; // path under public/
  url?: string;
};

export type SponsorTier = {
  name: "Presenting Sponsor" | "Gold" | "Silver" | "Bronze" | "Supporter";
  amount: string;
  benefits: string;
  // banner gradient colors for the tier header
  from: string;
  to: string;
  text: string;
  sponsors: Sponsor[];
};

export const sponsorTiers: SponsorTier[] = [
  {
    name: "Presenting Sponsor",
    amount: "$1,500+",
    benefits:
      "Top placement, prominent ceremony recognition, optional event table, and a dedicated sponsor feature",
    from: "#9ee8f5",
    to: "#4db6cc",
    text: "#0b3a47",
    sponsors: [
      {
        name: "Millburn Education Foundation",
        logo: "/images/sponsors/mef.png",
        url: "https://millburnedfoundation.org",
      },
    ],
  },
  {
    name: "Gold",
    amount: "$750 – $1,499",
    benefits: "Website, prominent event signage, and awards ceremony recognition",
    from: "#f3d27a",
    to: "#c9982b",
    text: "#4a3405",
    sponsors: [
      {
        name: "Beyond Young Academy",
        logo: "/images/sponsors/beyond-young.png",
        url: "https://beyondyoung.org",
      },
    ],
  },
  {
    name: "Silver",
    amount: "$500 – $749",
    benefits: "Website, program recognition, social media thank-you, and event signage",
    from: "#e3e5e8",
    to: "#a9adb4",
    text: "#33363b",
    sponsors: [
      {
        name: "Art of Problem Solving",
        logo: "/images/sponsors/aops.png",
        url: "https://artofproblemsolving.com",
      },
      { name: "Clemenza's Brick Oven Pizza" },
    ],
  },
  {
    name: "Bronze",
    amount: "$250 – $499",
    benefits: "Logo on website and event signage",
    from: "#e0a370",
    to: "#a5642f",
    text: "#3e2410",
    sponsors: [],
  },
  {
    name: "Supporter",
    amount: "$100 – $249",
    benefits: "Name on the sponsor page and event sponsor board",
    from: "#d8a27e",
    to: "#b8754d",
    text: "#3e2410",
    sponsors: [],
  },
];
