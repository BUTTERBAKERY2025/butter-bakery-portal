# Staff portal · بوابة الموظفين

A private area of the website where the Butter team and approved partners open and download the brand package.
Each person has their own account, and an admin decides, section by section, what they can see.

- **Website button:** "Staff only · للموظفين فقط" under the BUTTER BAKERY name in the footer → `/staff`
- **Pages:** `/staff` (sign in) · `/staff/library` (files) · `/staff/admin` (accounts, activity log, library)
- **Code:** `lib/db/src/schema/staff.ts`, `lib/db/src/brand-sections.ts`, `artifacts/api-server/src/routes/staff.ts`,
  `artifacts/api-server/src/lib/staffAuth.ts`, `artifacts/butter-bakery/src/pages/staff/`, `scripts/src/import-brand-files.ts`

## Access levels

Every section of the package can be set per person to **Hidden**, **View** (open in the browser) or **Download**.
Admins see everything and manage accounts. Three presets follow the package README:

| Preset | Sections |
|---|---|
| Partner 🟢 | Logos, fonts, A3 summary, packaging, signage, business card |
| Agency 🟡 | Partner + social templates, menu references, mockups |
| Management 🔴 | Everything, including the full guide and `brand.json` |

Accounts can have an end date (useful for a printer or agency on one job) and can be disabled at any time;
disabling or resetting a password signs that person out immediately.

## Security

- Passwords are hashed with scrypt; sessions are random tokens stored hashed, in an `httpOnly`, `SameSite=Lax` cookie (12 hours).
- Five wrong passwords from the same IP for the same username lock that pair for 15 minutes.
- Every sign-in, failed sign-in, file open and download is written to the activity log with the user and IP.
- Files the user is not allowed to see return 404, so ids cannot be probed. Staff pages are `noindex` and `no-store`.
- **The brand files are stored in Postgres, never in git** (this repository is public).
- "View" is a convenience, not DRM: anyone who can open a file in a browser can also save it. Give confidential sections only to people you trust.

## Setup (once)

1. Secrets on the deployment: `DATABASE_URL` (already used by the API), `STAFF_ADMIN_USERNAME`, `STAFF_ADMIN_PASSWORD` (10+ characters).
2. Create the tables: `pnpm --filter @workspace/db run push`
3. Load the files, either way:
   - **From the portal (easiest):** sign in as admin → Admin → "Files in the library" → upload `butter-bakery-brand-v1.zip`, then `butter-bakery-brand-v1-print.zip`.
   - **From a terminal:** unzip both into one folder, then `pnpm --filter @workspace/scripts run brand:import /path/to/butter-bakery-brand-v1`
4. Deploy. On start the API creates the first admin from the two secrets (only if there is no admin yet).
   Sign in at `/staff`, then change nothing else in the secrets; manage people from `/staff/admin`.

To publish a new version of the package, upload the new zips (only changed files are replaced). The terminal import also accepts `--prune` to remove files that were dropped.

## Design office (Admin → Designs)

Every cup, box, paper, sign, card, uniform, bag, social template and menu reference, each with a status
(draft → in review → approved → at the printer), its specification, print files, images and a 3D model
(cups, boxes and cards are real 3D; sheets and boards are shown as printed panels).

**Protected share links** (for a designer or printer, view only):
- `/share/<token>` + a 6-digit PIN shown once to the admin. Send the link and the PIN in separate messages.
- The link stops working when it expires (24 h – 30 days), when its open limit is reached, when an admin cancels it,
  or after 10 wrong PINs. Five wrong PINs from one IP pause that IP for 15 minutes.
- Only hashes of the token and PIN are stored. The share page shows the 3D model, specs and images only — no print files,
  no staff data — and every open is logged (Admin → Activity log, and under each link).
- "View only" can't stop a screenshot; the recipient's name is shown on the viewer.

Tables: `designs`, `design_shares` (see `lib/db/src/schema/designs.ts`). Design images and textures are paths into `brand_files`.
