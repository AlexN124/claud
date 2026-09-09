import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/components/hero-search";
import { PlayerAvatar } from "@/components/player-avatar";
import { getHomeStats, getLeaders, getSeasons } from "@/lib/data";

export default async function HomePage() {
  const seasons = await getSeasons();
  const latestSeason = seasons[0];
  const [stats, topScorers] = await Promise.all([
    getHomeStats(),
    getLeaders({ season: latestSeason, seasonType: "Regular Season", stat: "pts_pg", limit: 6 }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
            22 seasons · one box score at a time
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Every player, every game, every stat line since 2003.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Hardwood Almanac turns {stats.statRowCount.toLocaleString()} individual NBA box
            score rows into season leaderboards, career arcs, and team splits.
          </p>

          <HeroSearch />

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/leaders" />}>
              Browse leaderboards
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/teams" />}>
              Explore teams
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-12 sm:grid-cols-3">
        <StatCard label="Players tracked" value={stats.playerCount.toLocaleString()} />
        <StatCard label="Games logged" value={stats.gameCount.toLocaleString()} />
        <StatCard label="Box score rows" value={stats.statRowCount.toLocaleString()} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-heading text-xl font-bold">{latestSeason} scoring leaders</h2>
          <Link href="/leaders" className="text-sm text-accent hover:underline">
            View all leaderboards &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topScorers.map((p, i) => (
            <Link key={p.player_id} href={`/players/${p.player_id}`}>
              <Card className="h-full transition-colors hover:border-accent/60">
                <CardContent className="flex items-center gap-3 py-4">
                  <span className="w-5 text-sm font-mono text-muted-foreground">{i + 1}</span>
                  <PlayerAvatar playerId={p.player_id} name={p.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.games_played} games</p>
                  </div>
                  <span className="font-mono text-lg font-semibold text-accent">{p.pts_pg}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-3xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
