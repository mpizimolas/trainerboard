# TrainerBoard — Briefing (Catch-Up)

**Last updated:** 2026-08-26  (commit `192b285` on `main`)

## 1) What This Is
TrainerBoard — Client OS for independent personal trainers. Replace WhatsApp/Sheets. Trainer creates templates from 50-exercise library, assigns to client via magic link (no app), sees Today's check-ins compressed/expandable. Bio & Goals per client for customization (trainer-only, hidden from client). Monetization planned: Free 3, Starter $19/15, Pro $39/50.

## 2) Live URLs
- **Production (Vercel, Demo mode localStorage):** https://trainerboard.vercel.app
  - Landing: `/`  — `/dashboard` (trainer) — `/c/[token]` (client PWA) — `/login` (Supabase auth when enabled)
- **GitHub:** https://github.com/mpizimolas/trainerboard (`main`)
- **Local dev:** `http://localhost:3000` — `npm run dev` in `C:\Projects\trainerboard` (currently running)

## 3) Tech Stack (Demo-first, Supabase-ready)
- Next.js 16.3.2 (App Router) + Tailwind + lucide-react (lime/emerald Option A)
- Supabase: `supabase/schema.sql` (profiles, clients with bio/goals, workouts, workout_exercises, assignments, logs + RLS + anon SELECT for client links). First run creates tables; later runs alter if exists.
- Hybrid storage: `src/lib/store.ts` (localStorage Demo) + `src/lib/db.ts` + `src/lib/supabase/client.ts` / `server.ts` — auto switches when `NEXT_PUBLIC_SUPABASE_URL` + anon key set.
- Vercel Demo domain, no env needed. Supabase mode requires env.

## 4) Current State (Done)
- **Landing** `src/app/page.tsx` — Option A energetic fitness (lime gradient, phone mockup, pricing).
- **Layout** `src/app/layout.tsx` + `src/app/globals.css` — viewport themeColor #a3e635, hero gradient.
- **Dashboard** `src/app/dashboard/page.tsx` — Today's check-ins (compress on completed, click Undo to expand + show exercises), Clients with Bio & Goals (create/edit), Workouts (50 seeded via `src/lib/exercises.ts`), Assign workout (with goal hint). Hybrid Supabase/Demo.
- **Client PWA** `src/app/c/[token]/page.tsx` — Shows workouts only, Bio/Goals **hidden** (trainer-only). Compress on Mark complete → collapsed ✓, tap Undo to expand/edit. Supabase fetch is `id,name,invite_token` only (privacy).
- **Auth** `src/app/login/page.tsx` + `src/app/auth/callback/route.ts`
- **Validation Kit** `docs/validation/` — `3-trainer-tracker.csv`, `DM-scripts.md`, `loom-checklist.md`
- **Build:** `npm run build` passes (7 routes). Latest commits: `192b285` docs, `c11ef0c` client compress, `15b7a52` trainer compress, `ba82b75` hide bio, `450ecaf` bio/goals, `e982805` Option A.

## 5) How to Run / Deploy
```powershell
cd C:\Projects\trainerboard
npm run dev          # http://localhost:3000
npm run build        # verify 7 routes

# Enable Supabase (cross-device links)
# 1) Create project at supabase.com
# 2) SQL Editor → paste & Run supabase/schema.sql
# 3) Create .env.local from .env.local.example (URL + anon key), disable "Confirm email" in Auth Settings for test
# 4) Restart dev → /login → Sign up → Dashboard shows emerald Supabase banner
# 5) Add same env to Vercel → Redeploy

# Deploy (already linked)
git add .; git commit -m "msg"; git push  # → Vercel auto-deploys
```

## 6) Validation — Where to Resume (You picked Option 1)
Goal: 30 DMs → 10 replies → 3 testers → 2× "would pay $19" → then wire Stripe.
- **Tracker:** `docs/validation/3-trainer-tracker.csv`
- **DMs:** `docs/validation/DM-scripts.md` (uses live https://trainerboard.vercel.app/dashboard + example /c/tok_alex123 — note Demo requires trainer to create own client on their device)
- **Loom:** `docs/validation/loom-checklist.md` (60-sec script 0:00-0:58, 7-day schedule Day1 Loom+15 DMs → Day7 decision)
- **Next after validation:** Wire Stripe Checkout + Portal (Free 3 / $19 / $39) in `src/lib/db.ts` + `src/app/api/stripe/*`

## 7) Important Files
- `src/lib/store.ts` — Client type (bio/goals), loadStore migration, createClient, updateClientBioGoals
- `src/lib/db.ts` — DbClient, createClientDb(bio/goals), updateClientBioGoalsDb
- `supabase/schema.sql` — alter table adds bio/goals if missing, anon policies for MVP
- `public/manifest.json` — PWA

## 8) Recent Decisions Locked
- Deployment via GitHub → Vercel, Demo mode, standard domain.
- Option A lime/emerald visual.
- Bio & Goals trainer-only (hidden from client).
- Compress completed workouts on both trainer (`src/app/dashboard/page.tsx:132`) and client (`src/app/c/[token]/page.tsx:18`) — tap Undo to expand & edit.

## 9) Next Steps When You Reload
1. `git pull` + `npm install` if needed
2. `npm run dev` → test `http://localhost:3000/dashboard` → add client with Bio/Goals → assign → `/c/[token]` → Mark complete → compress → Undo
3. Resume Day 1 of `docs/validation/loom-checklist.md` — record Loom, DM 15 trainers

Questions? Open this file and `docs/validation/*`.
