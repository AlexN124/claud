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
import { TeamTrendChart } from "@/components/team-trend-chart";
import { getTeam } from "@/lib/data";

export default async function TeamPage(props: PageProps<"/teams/[id]">) {
  const { id } = await props.params;
  const teamId = Number(id);
  if (Number.isNaN(teamId)) notFound();

  let result: Awaited<ReturnType<typeof getTeam>>;
  try {
    result = await getTeam(teamId);
  } catch {
    notFound();
  }
  const { team, seasons } = result;
  const regularSeasons = seasons.filter((s) => s.season_type === "Regular Season");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">
        {team.city} <span className="text-muted-foreground">{team.abbreviation}</span>
      </h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Points per game by season</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamTrendChart data={regularSeasons} />
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Season by season</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Season</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">GP</TableHead>
                <TableHead className="text-right">Pts</TableHead>
                <TableHead className="text-right">Reb</TableHead>
                <TableHead className="text-right">Ast</TableHead>
                <TableHead className="text-right">Stl</TableHead>
                <TableHead className="text-right">Blk</TableHead>
                <TableHead className="text-right">TOV</TableHead>
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
                  <TableCell className="text-right font-mono tabular-nums text-accent">{s.pts_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.reb_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.ast_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.stl_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.blk_pg}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.tov_pg}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
