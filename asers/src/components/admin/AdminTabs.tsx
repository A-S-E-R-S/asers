"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const path = usePathname();
  // Longest matching prefix wins so /admin/x/students/... highlights "Students".
  const active = tabs
    .filter((t) => path === t.href || path.startsWith(`${t.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <nav className="mt-5 flex gap-1 overflow-x-auto border-b-2 border-brand-pale text-sm">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`-mb-[2px] whitespace-nowrap border-b-2 px-3 py-2 font-medium transition ${
            active === t.href ? "border-brand text-brand" : "border-transparent text-ink-soft hover:text-brand"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
