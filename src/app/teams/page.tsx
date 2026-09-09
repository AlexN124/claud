import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TeamLogo } from "@/components/team-logo";
import { getTeams } from "@/lib/data";

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Teams</h1>
      <p className="mt-1 text-muted-foreground">
        Every franchise that appears in the box score data, including relocations and renames.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {teams.map((t) => (
          <Link key={t.team_id} href={`/teams/${t.team_id}`}>
            <Card className="transition-colors hover:border-accent">
              <CardContent className="flex items-center gap-3 py-4">
                <TeamLogo teamId={t.team_id} abbreviation={t.abbreviation} size={40} />
                <div>
                  <p className="font-medium">{t.city}</p>
                  <p className="text-sm text-muted-foreground">{t.abbreviation}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
