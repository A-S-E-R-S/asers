import Link from "next/link";

const navLinks = [
  { href: "/chapters", label: "Chapters" },
  { href: "/national-symposium", label: "Nationals" },
  { href: "/judging", label: "Judging" },
  { href: "/donate", label: "Donate" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  return (
    <header>
      {/* Pale-blue rule */}
      <div className="h-[10px] w-full bg-brand-pale" />

      {/* Main nav */}
      <div className="flex w-full items-center justify-between gap-10 bg-brand px-[56px] py-[26px]">
        <Link href="/" className="flex items-center gap-[18px]">
          <span className="flex h-[54px] w-[54px] items-center justify-center rounded-full border-[3px] border-white">
            <span className="h-5 w-5 rounded-full bg-white" />
          </span>
          <span className="font-condensed text-[27px] uppercase leading-[1.02] tracking-[0.01em] text-white">
            American Science &amp; Engineering
            <br />
            Research Symposium
          </span>
        </Link>
        <nav className="flex items-center gap-[44px]">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-condensed text-[22px] uppercase tracking-[0.02em] text-white hover:text-brand-pale"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/competition"
            className="border-2 border-white px-[22px] py-[12px] font-condensed text-[22px] uppercase leading-none tracking-[0.02em] text-white transition hover:border-brand-pale hover:text-brand-pale"
          >
            Compete
          </Link>
        </nav>
      </div>
    </header>
  );
}
