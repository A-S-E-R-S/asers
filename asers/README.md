# asers.org

Website for the **American Science and Engineering Research Symposium**, the national
umbrella org for state chapters like [NJSRS](https://njsrs.org) (New Jersey).

Built with Next.js (App Router) and deployed to **Cloudflare Workers** via
[OpenNext](https://opennext.js.org/cloudflare).

## Develop

```bash
npm install
npm run db:migrate:local   # create the local D1 database (first time, and after new migrations)
npm run admin:create -- --email you@example.com --first Your --last Name --password somepassword
npm run dev                # Next dev server at http://localhost:3000
```

Emails (verification codes, password links) aren't really sent locally: Wrangler prints
each one in the dev server output, with the message body saved to a temp file.

To test in the real Workers runtime:

```bash
npx opennextjs-cloudflare build
npx wrangler dev --port 8788 --local-upstream localhost:8788
```

`--local-upstream` matters: because `wrangler.jsonc` has `asers.org` routes, plain
`wrangler dev` rewrites requests to `asers.org`, so server-action redirects (login,
registration) fetch the *live* site instead of your local build.

## Deploy

```bash
npx wrangler login         # first time only
npm run db:migrate:remote  # apply any new migrations to the production D1 database
npm run deploy             # builds with OpenNext and deploys the Worker
```

First deploy only:

1. **Database.** `npx wrangler d1 create asers`, paste the printed `database_id` into
   the `d1_databases` entry in `wrangler.jsonc`, then `npm run db:migrate:remote`.
2. **First admin.** `npm run admin:create -- --email you@asers.org --first Your --last Name --remote`
   prints a temporary password. Log in at `/login` and change it at `/account`. Every other
   admin is added from the admin panel.
3. **Email.** Onboard the sending domain: `npx wrangler email sending enable asers.org`.
   Until then, emails fail and are logged instead (check `npx wrangler tail`), so nobody
   gets a verification code. In the meantime, admins can "Mark email verified" on a
   registration.

### Hooking up asers.org

1. Add the `asers.org` zone to the Cloudflare account (Dashboard → **Add a domain**)
   and point the domain's nameservers at Cloudflare.
2. Uncomment the `routes` block in `wrangler.jsonc`.
3. `npm run deploy` again. Cloudflare provisions DNS + certs for each custom domain
   automatically.

### Chapter subdomains

`nj.asers.org` → **301** → `asers.org/chapters/new-jersey`

How it works:

- Chapters live in the D1 `chapters` table and are managed from `/admin` (national admins
  create chapters, set the subdomain, and publish; chapter admins edit their own page and
  registration settings).
- [src/middleware.ts](src/middleware.ts) 301s `<sub>.asers.org` to `/chapters/<sub>`, and
  the chapter page resolves the subdomain to the chapter's slug.
- The subdomain must also reach this Worker: list it as a `custom_domain` route in
  `wrangler.jsonc` and redeploy.

To add a new chapter (e.g. New York):

1. `/admin` → **New chapter** (slug `new-york`, subdomain `ny`). It starts as a draft.
2. Fill in **Chapter page** and **Settings**, add chapter admins under **Admins**, then
   tick **Published**.
3. Add `{ "pattern": "ny.asers.org", "custom_domain": true }` to `routes` in
   `wrangler.jsonc` and `npm run deploy`.

## Registration & admin

Modeled on last year's njsrs.org flow, but per chapter:

| Who | Registers at | Approved by | Dashboard |
| --- | --- | --- | --- |
| Science Research Advisor (SRA) | `/register/<chapter>/sra` (adds their school) | Chapter admin | Approves their school's students, marks entry fees received |
| Student | `/register/<chapter>/student` (school must have an SRA) | Their SRA (or an admin) | Status, SRA contact, team partner, editable project |
| Judge | `/register/<chapter>/judge` (9-step form) | Chapter admin | Status, availability and conflicts |

- One account per email; the same login can register with several chapters (e.g. a
  remote judge), once per chapter.
- Team projects: the registering student enters their partner, who gets an email link
  to set their own password. Both share one project record.
- New accounts verify their email with a 6-digit code before reaching the dashboard.
- Chapter registration opens and closes per role from **Settings**. Students can edit
  their project while student registration is open.

**Admin panel (`/admin`)**

- *Chapter admins* see only their chapters: overview with pending queues; students,
  SRAs and judges lists (search, filter, approve/reject, fees, CSV export); full
  registration detail (status with optional email, notes, project ID, move school,
  password links, delete); schools (rename/merge); the public chapter page (description,
  announcement, dates, venue, fee, about text); registration settings; activity log.
- *National admins* see every chapter, plus: create/publish/delete chapters, change chapter
  names and subdomains, add/remove chapter admins, add national admins, search all
  users (disable, change email, send password links), and a global activity log.

Code map: schema in `migrations/`, server logic in `src/lib/` and `src/app/actions/`,
pages under `src/app/{register,dashboard,admin}`, form components in `src/components/`.

## Content TODOs

- [ ] Photos from past NJSRS fairs → `public/images/` (placeholders are on the
      homepage and chapter pages)
- [ ] Real impact numbers → `impactStats` in `src/data/chapters.ts`
- [ ] Turn on email sending for asers.org (see Deploy step 3)
- [ ] Confirm national leadership team → `src/app/about/page.tsx`
- [ ] Set up `contact@asers.org` mail (referenced in footer/donate/about pages)
