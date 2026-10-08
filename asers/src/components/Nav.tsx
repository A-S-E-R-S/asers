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
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {admin && (
                  <Link
                    href="/admin"
                    className="inline-flex min-h-12 items-center justify-center border-2 border-white px-4 font-condensed text-[17px] uppercase tracking-[0.02em] text-white transition hover:bg-white hover:text-brand sm:px-5 sm:text-[19px]"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center bg-white px-4 font-condensed text-[17px] uppercase tracking-[0.02em] text-brand transition hover:bg-brand-pale sm:px-5 sm:text-[19px]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/account"
                  className="hidden text-sm font-medium text-white hover:text-brand-pale sm:inline"
                >
                  {user.firstName}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex min-h-12 items-center justify-center bg-white px-5 font-condensed text-[19px] uppercase tracking-[0.02em] text-brand transition hover:bg-brand-pale sm:px-7 sm:text-[21px]"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center border-2 border-white px-5 font-condensed text-[19px] uppercase tracking-[0.02em] text-white transition hover:bg-white hover:text-brand sm:px-7 sm:text-[21px]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
