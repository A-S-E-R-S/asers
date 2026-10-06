import { NextRequest, NextResponse } from "next/server";

// Chapter subdomains go to their chapter page on the apex domain:
//   nj.asers.org/* -> https://asers.org/chapters/nj -> /chapters/new-jersey
// The chapter page resolves the subdomain to the chapter's slug (chapters live
// in D1, so this stays in sync with whatever admins configure). Each subdomain
// must also reach this Worker (custom-domain route in wrangler.jsonc, or a
// wildcard route + DNS record).
const APEX = "asers.org";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  if (!host.endsWith(`.${APEX}`) || host === `www.${APEX}`) {
    return NextResponse.next();
  }
  const subdomain = host.slice(0, -(APEX.length + 1));
  if (!/^[a-z0-9-]+$/.test(subdomain)) return NextResponse.next();
  return NextResponse.redirect(`https://${APEX}/chapters/${subdomain}`, 301);
}

export const config = {
  // Skip static assets and Next internals.
  matcher: ["/((?!_next/|favicon|.*\\..*).*)"],
};
