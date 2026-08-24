# asers.org

Website for the **American Science and Engineering Research Symposium**, the national
umbrella org for state chapters like [NJSRS](https://njsrs.org) (New Jersey).

Built with Next.js (App Router) and deployed to **Cloudflare Workers** via
[OpenNext](https://opennext.js.org/cloudflare).

## Develop

```bash
npm install
npm run dev        # Next dev server at http://localhost:3000
npm run preview    # build + run in the actual Workers runtime locally
```

## Deploy

```bash
npx wrangler login   # first time only
npm run deploy       # builds with OpenNext and deploys the Worker
```

With no routes configured, this deploys to `asers.<account>.workers.dev`.

### Hooking up asers.org

1. Add the `asers.org` zone to the Cloudflare account (Dashboard → **Add a domain**)
   and point the domain's nameservers at Cloudflare.
2. Uncomment the `routes` block in `wrangler.jsonc`.
3. `npm run deploy` again. Cloudflare provisions DNS + certs for each custom domain
   automatically.

### Chapter subdomains

`nj.asers.org` → **301** → `asers.org/chapters/new-jersey`

How it works:

- [src/data/chapters.ts](src/data/chapters.ts) is the chapter registry (slug,
  subdomain, name, links). Adding a chapter there automatically creates its page at
  `/chapters/<slug>`, lists it everywhere, and enables its redirect.
- [src/middleware.ts](src/middleware.ts) matches the request host and issues the 301.
- The subdomain must also be listed as a `custom_domain` route in `wrangler.jsonc`
  so it reaches this Worker.

To add a new chapter (e.g. New York):

1. Add an entry to `src/data/chapters.ts` with `subdomain: "ny"`, `slug: "new-york"`.
2. Add `{ "pattern": "ny.asers.org", "custom_domain": true }` to `routes` in
   `wrangler.jsonc`.
3. `npm run deploy`.

## Content TODOs

- [ ] Photos from past NJSRS fairs → `public/images/` (placeholders are on the
      homepage and chapter pages)
- [ ] Real impact numbers → `impactStats` in `src/data/chapters.ts`
- [ ] Confirm national leadership team → `src/app/about/page.tsx`
- [ ] Set up `contact@asers.org` mail (referenced in footer/donate/about pages)
