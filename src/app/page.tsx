import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getHomeStats, getLeaders, getSeasons } from "@/lib/data";

export default async function HomePage() {
  const seasons = await getSeasons();
  const latestSeason = seasons[0];
  const [stats, topScorers] = await Promise.all([
    getHomeStats(),
    getLeaders({ season: latestSeason, seasonType: "Regular Season", stat: "pts_pg", limit: 5 }),
  ]);

  return (
    <div>
      <section className="border-b border-border/60 bg-gradient-to-b from-secondary/40 to-background">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
            22 seasons · one box score at a time
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Every player, every game, every stat line since 2003.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Hardwood Almanac turns {stats.statRowCount.toLocaleString()} individual NBA box
            score rows into season leaderboards, career arcs, and team splits &mdash; built on
            Supabase and rendered with Next.js.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" render={<Link href="/leaders" />}>
              Browse leaderboards
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/players" />}>
              Find a player
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
          <h2 className="text-xl font-semibold">
            {latestSeason} scoring leaders
          </h2>
          <Link href="/leaders" className="text-sm text-accent hover:underline">
            View all leaderboards &rarr;
          </Link>
        </div>
        <Card>
          <CardContent className="divide-y divide-border/60 p-0">
            {topScorers.map((p, i) => (
              <Link
                key={p.player_id}
                href={`/players/${p.player_id}`}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-secondary/60"
              >
                <div className="flex items-center gap-4">
                  <span className="w-5 text-sm font-mono text-muted-foreground">{i + 1}</span>
                  <span className="font-medium">{p.name}</span>
                </div>
                <span className="font-mono text-sm text-accent">{p.pts_pg} pts/g</span>
              </Link>
            ))}
          </CardContent>
        </Card>
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
        <p className="text-3xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
