// Sponsor tiers and current sponsors.
// Logos live in public/images/sponsors/ (transparent PNGs).

export type Sponsor = {
  name: string;
  logo?: string; // path under public/
  url?: string;
};

export type SponsorTier = {
  name: "Diamond" | "Gold" | "Silver" | "Bronze";
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
    name: "Diamond",
    amount: "$750+",
    benefits:
      "Website, signage, merchandise, plus special acknowledgment at the awards ceremony",
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
    amount: "$500 – $749",
    benefits: "Website, signage, and merchandise (t-shirts)",
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
    amount: "$250 – $499",
    benefits: "Website and event signage",
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
    amount: "$100 – $249",
    benefits: "Website recognition",
    from: "#e0a370",
    to: "#a5642f",
    text: "#3e2410",
    sponsors: [],
  },
];
