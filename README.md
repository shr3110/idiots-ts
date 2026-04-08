# Idiots — Community Ideas Platform

> **Explore. Validate. Experiment.**

A community-driven idea platform where users post ideas, rate them 1–5 stars, comment, save favourites, and watch the live Top 10 dashboard update in real time every minute — driven purely by community votes via a time-decay ranking formula.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, SSR) + Tailwind CSS |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase Postgres + Row Level Security |
| Realtime | Supabase Realtime (WebSockets) |
| Edge Functions | Supabase Edge Functions (Deno) |
| Storage | Supabase Storage |
| Email | Resend |
| PWA | Web App Manifest + Service Worker |
| Fingerprinting | FingerprintJS (anti-manipulation) |
| Deployment | Vercel + Supabase Cloud |

---

## Project Structure

```
idiots-app/
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout + fonts + providers
│   │   ├── page.tsx                 # Homepage: Top 10 Dashboard
│   │   ├── auth/
│   │   │   ├── page.tsx             # Login page
│   │   │   └── callback/route.ts   # OAuth callback + profile upsert
│   │   ├── feed/page.tsx            # Vertical scroll feed
│   │   ├── profile/page.tsx         # User profile + saved ideas
│   │   └── api/
│   │       ├── ideas/route.ts       # GET/POST ideas
│   │       ├── ratings/route.ts     # POST rating
│   │       └── comments/route.ts   # GET/POST comments
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx     # Session listener + Zustand sync
│   │   │   ├── AuthCard.tsx         # Google OAuth sign-in card
│   │   │   └── ProfileView.tsx      # Profile tabs (ideas / saved)
│   │   ├── dashboard/
│   │   │   ├── TopIdeasDashboard.tsx  # Real-time Top 10 grid
│   │   │   ├── DashboardIdeaCard.tsx  # Individual rank card
│   │   │   └── DashboardSkeleton.tsx  # Loading skeleton
│   │   ├── ideas/
│   │   │   ├── IdeaFeed.tsx         # Scroll-snap feed container
│   │   │   ├── FeedCard.tsx         # Full-screen idea card
│   │   │   ├── IdeaPostModal.tsx    # Post new idea modal
│   │   │   └── CommentPanel.tsx    # Slide-up comment panel
│   │   ├── layout/
│   │   │   ├── NavBar.tsx           # Sticky navigation
│   │   │   └── HomeHero.tsx         # Hero section
│   │   └── ui/
│   │       └── StarRating.tsx       # Reusable star rating
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser Supabase client
│   │   │   ├── server.ts            # Server Supabase client (SSR)
│   │   │   └── middleware.ts        # Session refresh middleware
│   │   ├── hooks/
│   │   │   ├── useAuthStore.ts      # Zustand auth state
│   │   │   ├── useTopIdeas.ts       # Real-time top 10
│   │   │   ├── useFeed.ts           # Infinite scroll feed
│   │   │   ├── useRating.ts         # Submit ratings
│   │   │   └── useSaved.ts          # Save/unsave ideas
│   │   └── utils/index.ts           # cn, calculateScore, helpers
│   ├── styles/globals.css           # Design system CSS variables
│   ├── types/index.ts               # All TypeScript types
│   └── middleware.ts                # Route protection
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Full DB schema, RLS, triggers
│   └── functions/
│       ├── process-vote/            # Edge Function: rate idea
│       ├── moderate-content/        # Edge Function: OpenAI moderation
│       └── send-notification/       # Edge Function: Resend emails
└── public/
    ├── manifest.json                # PWA manifest
    ├── sw.js                        # Service worker
    └── register-sw.js              # SW registration
```

---

## Setup Guide (VS Code)

### Prerequisites

- Node.js 18+ (`node -v`)
- npm or pnpm
- Git
- [Supabase account](https://supabase.com) — project already created ✓
- [Resend account](https://resend.com) — API key ready ✓

---

### Step 1 — Clone / open the project

```bash
# If you received this as a zip, extract it, then:
cd idiots-app
code .
```

---

### Step 2 — Install dependencies

Open the VS Code terminal (`Ctrl+`` ` or `Terminal → New Terminal`):

```bash
npm install
```

---

### Step 3 — Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

```env
# From Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key...

# From Resend Dashboard → API Keys
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Your local URL (change for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For OpenAI content moderation
OPENAI_API_KEY=sk-...
```

---

### Step 4 — Set up the Supabase database

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New query**
5. Open `supabase/migrations/001_initial_schema.sql` in VS Code
6. Copy the entire file contents
7. Paste into the SQL Editor
8. Click **Run** (or `Ctrl+Enter`)

You should see: `Success. No rows returned`

---

### Step 5 — Enable Google OAuth in Supabase

1. Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** → toggle **Enable**
3. You'll need a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://xxxxxxxxxxxx.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**
4. Paste them into Supabase's Google provider settings
5. Save

---

### Step 6 — Configure Supabase Realtime

1. Supabase Dashboard → **Database** → **Replication**
2. Ensure these tables have realtime enabled:
   - `public.ideas` ✓
   - `public.ratings` ✓
   - `public.comments` ✓

*(The migration SQL does this automatically — just verify)*

---

### Step 7 — Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### Step 8 — (Optional) Deploy Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy process-vote
supabase functions deploy moderate-content
supabase functions deploy send-notification

# Set secrets for edge functions
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

### Step 9 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, then add environment variables:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add NEXT_PUBLIC_APP_URL

# Production deploy
vercel --prod
```

Also update your Supabase project's **Site URL**:
- Dashboard → **Authentication** → **URL Configuration**
- Site URL: `https://your-app.vercel.app`
- Add redirect: `https://your-app.vercel.app/auth/callback`

---

## Key Features

### Ranking Formula (Time-Decay)
```
score = (avg_rating ^ 1.8) × sqrt(votes) / (gravity × age_hours ^ 1.8)
```
- Recalculated automatically on every vote via Postgres trigger
- `gravity = 4.0` (controls decay speed)
- Zero AI involvement in ranking — purely democratic

### Real-time Updates
- Top 10 dashboard subscribes to Supabase Realtime WebSocket
- Updates whenever a rating is submitted or an idea score changes
- Auto-refreshes every 60 seconds as fallback

### Feed Navigation
- Scroll-snap vertical feed (Instagram Reels style)
- Arrow keys (`↑` / `↓`) for keyboard navigation
- Up/Down buttons on the right for mouse/touch
- Position indicator at bottom

### Content Moderation
- Every idea passes through moderation before going live
- Falls back to keyword filter if OpenAI key not set
- Rejected ideas show `moderation_status = 'rejected'` in DB

---

## VS Code Recommended Extensions

Install these for the best DX:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "formulahendry.auto-rename-tag"
  ]
}
```

Or: `Ctrl+Shift+P` → "Show Recommended Extensions"

---

## Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint
npm run type-check   # TypeScript check
```

---

## Adding Icons (PWA)

Place PNG files in `public/icons/`:
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px
- `apple-touch-icon.png` — 180×180px

Use [RealFaviconGenerator](https://realfavicongenerator.net) to generate all sizes.

---

## Scale Roadmap

| DAU | Action |
|-----|--------|
| ~10k | Activate Upstash Redis for hot vote counts + rate limiting |
| ~15k | Add Inngest for notification fanout, feed ranking jobs |
| ~50k | Add Postgres read replica; evaluate Typesense for search |
| ~100k | Evaluate self-hosted Supabase on dedicated infra |
