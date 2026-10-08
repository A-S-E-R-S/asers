import Link from "next/link";
import Image from "next/image";
import { getAdminScope, getCurrentUser, isAnyAdmin } from "@/lib/auth";

const navLinks = [
  { href: "/chapters", label: "Chapters" },
  { href: "/national-symposium", label: "Nationals" },
  { href: "/judging", label: "Judging" },
  { href: "/donate", label: "Donate" },
  { href: "/about", label: "About" },
];

export default async function Nav() {
  const user = await getCurrentUser();
  const admin = isAnyAdmin(await getAdminScope(user));

  return (
    <header>
      {/* Pale-blue rule with account links */}
      <div className="flex min-h-[10px] w-full justify-end gap-5 bg-brand-pale px-4 text-[13px] font-medium text-brand sm:px-6 md:px-[56px]">
        {user ? (
          <>
            {admin && (
              <Link href="/admin" className="py-1 hover:underline">
                Admin
              </Link>
            )}
            <Link href="/dashboard" className="py-1 hover:underline">
              Dashboard
            </Link>
            <Link href="/account" className="py-1 hover:underline">
              {user.firstName}
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="py-1 hover:underline">
              Log in
            </Link>
            <Link href="/register" className="py-1 hover:underline">
              Register
            </Link>
          </>
        )}
      </div>

      {/* Main nav */}
      <div className="flex w-full flex-col gap-5 bg-brand px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-10 md:px-[56px] md:py-[26px]">
        <Link href="/" aria-label="ASERS home" className="flex min-w-0 items-center">
          <span className="flex h-[92px] w-[190px] items-center sm:h-[100px] sm:w-[215px] md:h-[108px] md:w-[240px]">
            <Image
              src="/images/aserswide.png"
              alt="American Science and Engineering Research Symposium"
              width={666}
              height={375}
              priority
              className="block h-auto w-full brightness-0 invert"
            />
          </span>
        </Link>
        <nav className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-6 md:w-auto md:gap-[44px]">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-condensed text-[18px] uppercase tracking-[0.02em] text-white hover:text-brand-pale sm:text-[20px] md:text-[22px]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/competition"
            className="border-2 border-white px-4 py-2 font-condensed text-[18px] uppercase leading-none tracking-[0.02em] text-white transition hover:border-brand-pale hover:text-brand-pale sm:px-[22px] sm:py-[12px] sm:text-[20px] md:text-[22px]"
          >
            Compete
          </Link>
        </nav>
      </div>
    </header>
  );
}
