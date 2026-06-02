# SkillSwap

SkillSwap is a peer-to-peer skill exchange platform. Members teach what they know, learn what they need, and connect through intelligent skill matching—without paying for courses.

**Repository:** [github.com/shotarevazishvilii/SkillSwap](https://github.com/shotarevazishvilii/SkillSwap)

---

## Features

| Area | Status |
|------|--------|
| Authentication (sign up, sign in, password reset) | Available |
| Profile & skills management | Available |
| Marketplace & public profiles | Available |
| Smart matching & saved matches | Available |
| Learning requests (send, accept, reject, cancel) | Available |
| Dashboard overview | Available |
| Messaging & session scheduling | Planned (UI placeholders) |

---

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, Radix UI / shadcn-style components
- **Backend:** [Supabase](https://supabase.com/) (Auth, PostgreSQL, Row Level Security)
- **Validation:** Zod, React Hook Form

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- A **Supabase** project (free tier is fine)

---

## Quick start

### 1. Clone the repository

```bash
git clone https://github.com/shotarevazishvilii/SkillSwap.git
cd SkillSwap
```

Use `main` for the default branch, or `cursor/audit-fixes-0927` for the latest audit fixes.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key (keep secret) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local development |

Restart the dev server after changing `.env`.

### 4. Apply database migrations

Run every file in `supabase/migrations/` **in filename order** in the Supabase SQL Editor (or use the Supabase CLI):

1. `20260601153600_create_mvp_schema.sql`
2. `20260601162700_allow_match_saves.sql`
3. `20260601163300_create_learning_requests.sql`
4. `20260601170000_sync_profile_full_name_from_signup.sql`

These migrations create tables, seed the skill catalog, enable RLS policies, and sync profile names on signup.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

---

## Project structure

```
src/
  app/              # Routes (marketing, auth, dashboard, API)
  components/       # Shared UI and layout
  features/         # Domain modules (auth, profile, marketplace, …)
  lib/              # Supabase clients, validations, helpers
  services/         # Service layer stubs (reserved for future use)
supabase/
  migrations/       # PostgreSQL schema and RLS
public/             # Static assets (logo, images)
```

---

## Troubleshooting

### “We could not load your dashboard / marketplace / matches…”

These messages appear when **Supabase requests fail**. The app catches the error and shows a generic fallback (or a setup hint if the failure looks like missing configuration).

**Common causes:**

1. **Missing or wrong `.env`** — URL or anon key incorrect, or dev server not restarted after editing `.env`.
2. **Migrations not applied** — Tables such as `profiles`, `skills`, or `learning_requests` do not exist yet.
3. **Empty skill catalog** — First migration not run; the `skills` table has no rows.
4. **Not signed in** — Dashboard routes require authentication.

**What to do:**

- Confirm `.env` matches your Supabase project.
- Run all migrations in `supabase/migrations/`.
- Sign out and sign in again.
- Check the browser **Network** tab for failed requests to `supabase.co` and read the response body.

### “We could not save your changes…”

Usually the same root cause as above (database unreachable, RLS, or validation). On Profile, it can also mean a **duplicate username** or **duplicate skill**—those show more specific messages when detected.

### Skills dropdown is greyed out / “can’t choose skills”

The **Skill** select is disabled when the catalog failed to load (`skills.length === 0`). That happens if:

- Supabase is not configured, or
- Migrations were not applied (no `skills` seed data).

Fix Supabase setup and migrations, then refresh the page. You should see skill names in “Available Skills” and enabled dropdowns.

### Can’t click “Skills” in the sidebar (mobile)

On small screens, open the **menu** (☰) in the top bar first. Navigation lives in a slide-out panel. After this fix, tapping a link also closes the panel so it does not block the page.

### Email sign-up

If email confirmation is enabled in Supabase, new users must confirm email before signing in. `full_name` is synced to `profiles` on signup and after email confirmation.

---

## Contributing

1. Create a branch from `main`.
2. Run `npm run typecheck`, `npm run lint`, and `npm run build` before opening a PR.
3. Include migration files for any schema changes.

---

## License

UNLICENSED — see repository settings for usage terms.
