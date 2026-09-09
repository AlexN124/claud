import { LeadersFilters } from "@/components/leaders-filters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { getLeaders, getSeasons, getTeamLeaders, STAT_OPTIONS, type StatKey } from "@/lib/data";

export default async function LeadersPage(props: PageProps<"/leaders">) {
  const sp = await props.searchParams;
  const seasons = await getSeasons();

  const season = (typeof sp.season === "string" ? sp.season : undefined) ?? seasons[0];
  const seasonType = (typeof sp.type === "string" ? sp.type : undefined) ?? "Regular Season";
  const stat = ((typeof sp.stat === "string" ? sp.stat : undefined) ?? "pts_pg") as StatKey;
  const mode = (typeof sp.mode === "string" ? sp.mode : undefined) === "teams" ? "teams" : "players";

  const statLabel = STAT_OPTIONS.find((s) => s.value === stat)?.label ?? stat;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Leaderboards</h1>
      <p className="mt-1 text-muted-foreground">
        Ranked across every {seasonType.toLowerCase()} game logged for {season}.
      </p>

      <div className="mt-6">
        <LeadersFilters seasons={seasons} season={season} seasonType={seasonType} stat={stat} mode={mode} />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border/60">
        {mode === "players" ? (
          <PlayerLeadersTable season={season} seasonType={seasonType} stat={stat} statLabel={statLabel} />
        ) : (
          <TeamLeadersTable season={season} seasonType={seasonType} />
        )}
      </div>
    </div>
  );
}

async function PlayerLeadersTable({
  season,
  seasonType,
  stat,
  statLabel,
}: {
  season: string;
  seasonType: string;
  stat: StatKey;
  statLabel: string;
}) {
  const rows = await getLeaders({ season, seasonType, stat });
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="text-right">GP</TableHead>
          <TableHead className="text-right">{statLabel}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={r.player_id}>
            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
            <TableCell>
              <Link href={`/players/${r.player_id}`} className="font-medium hover:text-accent">
                {r.name}
              </Link>
            </TableCell>
            <TableCell className="text-right tabular-nums">{r.games_played}</TableCell>
            <TableCell className="text-right font-mono tabular-nums text-accent">
              {r[stat as keyof typeof r] as number}
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
              No qualifying players for this season.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

async function TeamLeadersTable({ season, seasonType }: { season: string; seasonType: string }) {
  const rows = await getTeamLeaders({ season, seasonType });
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">GP</TableHead>
          <TableHead className="text-right">Pts/g</TableHead>
          <TableHead className="text-right">Reb/g</TableHead>
          <TableHead className="text-right">Ast/g</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={r.team_id}>
            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
            <TableCell>
              <Link href={`/teams/${r.team_id}`} className="font-medium hover:text-accent">
                {r.city} {r.abbreviation}
              </Link>
            </TableCell>
            <TableCell className="text-right tabular-nums">{r.games_played}</TableCell>
            <TableCell className="text-right font-mono tabular-nums text-accent">{r.pts_pg}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{r.reb_pg}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{r.ast_pg}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
