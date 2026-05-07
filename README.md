# Borderland Street Team Tracker

A simple, mobile-first web app for managing the Borderland Festival street team. Ambassadors log promo work and earn a free festival ticket; admins review submissions, track progress on a leaderboard, see poster pins on a map, and DM ambassadors directly.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **Tailwind CSS v4** — dark theme with Borderland-inspired ember/moss accents
- **Supabase** — Auth, Postgres (with RLS), Storage
- **Leaflet + react-leaflet** — admin poster map (free, no API key)
- **lucide-react** — icons
- Deploys cleanly to **Vercel**

## Quick start

```bash
# 1. Install
npm install

# 2. Run the SQL migration
#    Open the Supabase dashboard → SQL Editor → paste & run:
#    supabase/migrations/001_initial_schema.sql

# 3. Confirm .env.local has your project URL + publishable key
cat .env.local

# 4. Dev server
npm run dev   # → http://localhost:3000
```

### Promote yourself to admin

After signing up once, run this in Supabase SQL Editor (replace the email):

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

You'll see the **Admin** link appear in the header next time you load.

### Email confirmation

Supabase ships with email confirmation **on** by default. For an internal MVP you almost certainly want it off:

> Supabase dashboard → Authentication → Sign In / Up → uncheck **Confirm email**

If you leave it on, signup will show a "check your email" screen until users click the magic link.

## App map

```
src/
├── app/
│   ├── (auth)/                 # /login + /signup, no header
│   ├── (app)/                  # ambassador-facing
│   │   ├── dashboard/          # progress, recent activity, quick CTAs
│   │   └── upload/{poster,event,social}/
│   ├── admin/                  # admin-only (role-gated in layout)
│   │   ├── page.tsx            # overview + leaderboard
│   │   ├── submissions/        # pending review queue
│   │   ├── map/                # Leaflet poster map
│   │   ├── messages/           # DM threads
│   │   └── users/[id]/         # ambassador profile + photo grid
│   ├── layout.tsx
│   └── page.tsx                # → /dashboard
├── components/
│   ├── ui/                     # button, card, input, badge, progress, empty
│   ├── layout/                 # header, admin-nav
│   ├── dashboard/              # quick-actions, submission-row
│   ├── upload/                 # photo-input, geo-button, upload-form
│   └── admin/                  # review-card, poster-map
├── lib/
│   ├── supabase/               # client, server, middleware (per @supabase/ssr docs)
│   ├── photos.ts               # signed Storage URL helpers
│   ├── points.ts               # point values + ticket goal
│   └── utils.ts                # cn() + formatRelative()
├── types/database.ts
└── proxy.ts                    # Next 16 auth middleware (was middleware.ts in N15)
supabase/migrations/001_initial_schema.sql
```

## How it works

### Auth flow

1. Signup → `auth.users` row + trigger `handle_new_user` → `profiles` row (default `role = ambassador`)
2. Proxy (`src/proxy.ts`) calls `updateSession` on every navigation; unauthenticated users hit `/login` with a `?next=` param
3. `(app)/layout.tsx` requires a session; `admin/layout.tsx` additionally requires `role = 'admin'`

### Submission flow

1. Ambassador opens `/upload/poster` (or `/event` or `/social`)
2. Client picks a photo (with `capture="environment"` for instant camera on mobile)
3. Optional GPS pin via the browser geolocation API
4. Form posts to a Server Action (`src/app/(app)/actions.ts`):
   - Uploads file to Storage at `submission-photos/{userId}/{type}/{YYYY-MM}/{uuid}.{ext}`
   - Inserts a `submissions` row with `status = 'pending'`, `points = pointsFor(type, platform)`
5. Admin opens `/admin/submissions`, taps Approve or Reject (with optional reason)
6. Approved points roll up via the `user_progress` view → ambassador's progress bar updates

### Point system

Defined in `src/lib/points.ts`:

| Action | Points |
|---|---|
| Poster proof | 5 |
| Event promo | 10 |
| IG Story / TikTok | 5 |
| IG Feed post | 10 |
| **Goal** | **100** |

### Photo storage & access

- Bucket `submission-photos` is **private** (created by the migration)
- Storage RLS: ambassadors can only write/read their own folder; admins can read all
- Pages use `signedPhotoUrl()` / `signedPhotoUrls()` to mint short-lived signed URLs at render time

### Map

- Admin → Map tab uses CartoDB dark tiles + Leaflet
- Pulls every poster submission with non-null `lat`/`lng` (last 500), drops ember pins, popup shows photo + ambassador

### Messaging

- One thread per ambassador (`/admin/messages/[id]`)
- Either party can read; admins can start; messages stored in `admin_messages` with RLS that scopes visibility to sender + recipient

## Deploy to Vercel

1. Push the project to GitHub
2. Import in Vercel → set the same two env vars from `.env.local`
3. Done. The proxy + Server Actions Just Work.

## Suggested future upgrades

In rough priority order:

- **Push / email notifications** — ping ambassadors on approval / rejection (Supabase + Resend)
- **Real-time** — `supabase.channel(...)` so dashboards / message threads update live
- **Bulk approve** — checkbox + batch action on the submissions queue
- **CSV export** — admin → "export ambassadors as CSV" for festival ticketing
- **QR redemption flow** — once an ambassador hits 100, generate a one-use QR code on their dashboard for box-office redemption
- **Rejection-with-resubmit** — let ambassadors edit + resubmit instead of just being rejected
- **Smarter location** — reverse-geocode the GPS pin to autofill address (Nominatim or Mapbox)
- **Offline draft mode** — queue uploads when no signal (useful at outdoor venues)
- **Per-cohort goals** — multiple street teams (e.g. by school) with their own leaderboards
- **Image moderation** — auto-flag NSFW / duplicate photos before they hit the queue
- **Tighten signup** — invite code or school-email allowlist so randos can't sign up
- **Rate limit upload action** — Postgres `rate_limit` extension or Vercel KV
