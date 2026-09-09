import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerTrendChart } from "@/components/player-trend-chart";
import { PlayerAvatar } from "@/components/player-avatar";
import { getPlayer } from "@/lib/data";

export default async function PlayerPage(props: PageProps<"/players/[id]">) {
  const { id } = await props.params;
  const playerId = Number(id);
  if (Number.isNaN(playerId)) notFound();

  let result: Awaited<ReturnType<typeof getPlayer>>;
  try {
    result = await getPlayer(playerId);
  } catch {
    notFound();
  }
  const { player, seasons, career } = result;

  const regularSeasons = seasons.filter((s) => s.season_type === "Regular Season");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-5">
        <PlayerAvatar playerId={playerId} name={player.name} size={84} className="ring-2 ring-border" />
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">{player.name}</h1>
          {player.nickname && player.nickname !== player.name && (
            <p className="text-muted-foreground">&ldquo;{player.nickname}&rdquo;</p>
          )}
        </div>
      </div>

      {career && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatBox label="Games" value={career.games_played} />
          <StatBox label="Pts/g" value={career.pts_pg} />
          <StatBox label="Reb/g" value={career.reb_pg} />
          <StatBox label="Ast/g" value={career.ast_pg} />
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-heading text-base">Career trend (regular season)</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerTrendChart data={regularSeasons} />
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-heading text-base">Season by season</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[420px] overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>Season</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">GP</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Pts</TableHead>
                <TableHead className="text-right">Reb</TableHead>
                <TableHead className="text-right">Ast</TableHead>
                <TableHead className="text-right">Stl</TableHead>
                <TableHead className="text-right">Blk</TableHead>
                <TableHead className="text-right">FG%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.map((s) => (
                <TableRow key={`${s.season}-${s.season_type}`}>
                  <TableCell className="font-medium">{s.season}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.season_type === "Regular Season" ? "Reg" : "Playoffs"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{s.games_played}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.min_pg}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-accent">{s.pts_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.reb_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.ast_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.stl_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.blk_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.fg_pct}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
