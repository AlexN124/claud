import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerSearch } from "@/components/player-search";
import { PlayerAvatar } from "@/components/player-avatar";
import { searchPlayers } from "@/lib/data";

export default async function PlayersPage(props: PageProps<"/players">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const players = await searchPlayers(q, 60);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Players</h1>
      <p className="mt-1 text-muted-foreground">
        {q ? `Results for "${q}"` : "Search across every player tracked since 2003-04."}
      </p>

      <div className="mt-6">
        <PlayerSearch initialQuery={q} />
      </div>

      <Card className="mt-6">
        <CardContent className="grid grid-cols-1 gap-1 p-2 sm:grid-cols-2">
          {players.map((p) => (
            <Link
              key={p.player_id}
              href={`/players/${p.player_id}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-secondary/60"
            >
              <PlayerAvatar playerId={p.player_id} name={p.name} size={36} />
              <span>
                <span className="font-medium">{p.name}</span>
                {p.nickname && p.nickname !== p.name && (
                  <span className="ml-2 text-sm text-muted-foreground">&ldquo;{p.nickname}&rdquo;</span>
                )}
              </span>
            </Link>
          ))}
          {players.length === 0 && (
            <p className="col-span-2 py-8 text-center text-muted-foreground">No players found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
