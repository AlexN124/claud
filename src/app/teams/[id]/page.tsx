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
import { TeamLogo } from "@/components/team-logo";
import { teamColor } from "@/lib/team-colors";
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
  const { primary, secondary } = teamColor(team.abbreviation);

  return (
    <div>
      <div
        className="border-b border-border/60"
        style={{
          background: `linear-gradient(135deg, ${primary}22, transparent 60%)`,
          borderBottomColor: `${primary}55`,
        }}
      >
        <div className="mx-auto flex max-w-4xl items-center gap-5 px-4 py-10">
          <TeamLogo teamId={teamId} abbreviation={team.abbreviation} size={72} />
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              {team.city} <span style={{ color: primary }}>{team.abbreviation}</span>
            </h1>
            <div className="mt-2 flex gap-1.5">
              <span
                className="h-2 w-8 rounded-full"
                style={{ backgroundColor: primary }}
              />
              <span
                className="h-2 w-8 rounded-full"
                style={{ backgroundColor: secondary }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">Points per game by season</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamTrendChart data={regularSeasons} />
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
    </div>
  );
}
