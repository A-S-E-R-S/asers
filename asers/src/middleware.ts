import { NextRequest, NextResponse } from "next/server";
import { chapters } from "@/data/chapters";

// 301 chapter subdomains to their chapter page on the apex domain:
//   nj.asers.org/* -> https://asers.org/chapters/new-jersey
// Each subdomain must also be attached to this Worker as a custom domain
// (see the routes block in wrangler.jsonc).
const APEX = "asers.org";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  if (!host.endsWith(`.${APEX}`) || host === `www.${APEX}`) {
    return NextResponse.next();
  }
  const subdomain = host.slice(0, -(APEX.length + 1));
  const chapter = chapters.find((c) => c.subdomain === subdomain);
  if (chapter) {
    return NextResponse.redirect(`https://${APEX}/chapters/${chapter.slug}`, 301);
  }
  return NextResponse.next();
}

export const config = {
  // Skip static assets and Next internals.
  matcher: ["/((?!_next/|favicon|.*\\..*).*)"],
};
