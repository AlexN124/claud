# Hardwood Almanac

An NBA stats explorer built on Next.js, Supabase, and shadcn/ui. It turns 708,683 individual
player box-score rows (2003-04 through 2024-25) into season leaderboards, career trend charts,
and team splits.

**Live:** https://hardwood-almanac.vercel.app

## Pages

- **Home** — search-first hero, headline dataset stats, current-season scoring leaders
- **Leaders** — player and team leaderboards, filterable by season, season type, and stat
- **Players** — search directory + player detail (career trend chart, season-by-season table)
- **Teams** — team directory + team detail (brand color banner, season-by-season table)

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **shadcn/ui** components (Button, Card, Table, Select, Tabs, etc.)
- **Supabase** (Postgres) for data storage, with Row Level Security policies allowing public read
- **Recharts** for career/season trend charts
- Deployed on **Vercel**

## Data model

Source data: `NBAALLSTATS.csv`, one row per player per game.

Normalized into:

- `teams` — team_id, abbreviation, city
- `players` — player_id, name, nickname
- `games` — game_id, season, season_type
- `player_game_stats` — full box score line per player per game (FK to the three tables above)

Plus SQL views that drive the app's pages:

- `season_list` — distinct seasons, for the season picker
- `player_season_stats` — per-player, per-season averages
- `player_career_stats` — per-player career totals/averages
- `team_season_stats` — per-team, per-season averages (single-pass aggregate over
  `player_game_stats`, not nested through a per-game view — nesting two full-table
  aggregations was slow enough to time out on the free compute tier)

Schema lives in `supabase/migrations/0001_schema.sql`.

## Setup

1. Create a Supabase project.
2. Apply the schema:
   ```bash
   DATABASE_URL="postgresql://...your-connection-string..." node scripts/apply-schema.mjs
   ```
3. Transform `NBAALLSTATS.csv` into the normalized load CSVs (see `scripts/load-data.mjs` for the
   expected `DATA_DIR` layout: `teams.csv`, `players.csv`, `games.csv`, `player_game_stats.csv`).
4. Load the data:
   ```bash
   DATABASE_URL="postgresql://...your-connection-string..." node scripts/load-data.mjs
   ```
5. Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL + publishable
   (anon) key.
6. `npm install && npm run dev`

## Deploying

Connect the GitHub repo to Vercel and set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` as project environment variables.
