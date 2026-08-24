import Link from "next/link";
import { chapters } from "@/data/chapters";

export default function Footer() {
  return (
    <footer className="bg-brand text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="font-condensed text-[22px] uppercase tracking-tight">ASERS</p>
          <p className="mt-2 text-sm font-light leading-relaxed text-brand-pale">
            American Science and Engineering Research Symposium, a national network of
            student-run research competitions.
          </p>
        </div>
        <div>
          <p className="font-condensed text-lg uppercase tracking-tight text-brand-pale">
            Symposium
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:underline" href="/competition">Competition</Link></li>
            <li><Link className="hover:underline" href="/judging">Judging</Link></li>
            <li><Link className="hover:underline" href="/donate">Donate</Link></li>
            <li><Link className="hover:underline" href="/about">About</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-condensed text-lg uppercase tracking-tight text-brand-pale">
            Chapters
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {chapters.map((c) => (
              <li key={c.slug}>
                <Link className="hover:underline" href={`/chapters/${c.slug}`}>
                  {c.name} ({c.shortName})
                </Link>
              </li>
            ))}
            <li>
              <Link className="hover:underline" href="/chapters#start">Start a chapter</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-condensed text-lg uppercase tracking-tight text-brand-pale">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="hover:underline" href="mailto:contact@asers.org">contact@asers.org</a>
            </li>
            <li>
              <a className="hover:underline" href="mailto:fairdirector@njsrs.org">
                fairdirector@njsrs.org (NJ)
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-xs text-brand-pale">
        © {new Date().getFullYear()} American Science and Engineering Research Symposium
      </div>
    </footer>
  );
}
