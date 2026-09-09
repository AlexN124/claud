import Link from "next/link";
import { PlayerAvatar } from "@/components/player-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GRID_STATS } from "@/lib/data";

type GridRow = {
  player_id: number;
  name: string;
  games_played: number;
  pts_pg: number | null;
  reb_pg: number | null;
  ast_pg: number | null;
  stl_pg: number | null;
  blk_pg: number | null;
  tov_pg: number | null;
  ts_pct: number | null;
  efg_pct: number | null;
  ast_to_tov: number | null;
  game_score: number | null;
};

// Sequential single-hue heat scale (accent orange), stepped rather than a continuous
// gradient so every cell in a tier renders identical shading. "Lower is better"
// columns (turnovers) invert which end of the range counts as hot.
const HEAT_STEPS = ["#f9731600", "#f9731626", "#f9731644", "#f9731666", "#f9731688", "#f97316aa"];

function heatStyle(value: number | null, min: number, max: number, invert: boolean) {
  if (value === null || max === min) return {};
  let t = (value - min) / (max - min);
  if (invert) t = 1 - t;
  const step = Math.min(HEAT_STEPS.length - 1, Math.floor(t * HEAT_STEPS.length));
  return { backgroundColor: HEAT_STEPS[step] };
}

function fmt(value: number | null, kind: string) {
  if (value === null) return "—";
  if (kind === "pct") return `${(value * 100).toFixed(1)}%`;
  return value.toFixed(1);
}

export function StatHeatTable({ rows }: { rows: GridRow[] }) {
  const ranges = Object.fromEntries(
    GRID_STATS.map((col) => {
      const values = rows.map((r) => r[col.value as keyof GridRow] as number | null).filter((v): v is number => v !== null);
      return [col.value, { min: Math.min(...values, 0), max: Math.max(...values, 1) }];
    })
  );

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Darker cells are stronger within this season &mdash; inverted for TOV, where fewer is
        better. Qualified players only (10+ games).
      </p>
      <div className="max-h-[600px] overflow-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-card">Player</TableHead>
              <TableHead className="text-right">GP</TableHead>
              {GRID_STATS.map((col) => (
                <TableHead key={col.value} className="text-right">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.player_id}>
                <TableCell className="sticky left-0 z-10 bg-card">
                  <Link
                    href={`/players/${r.player_id}`}
                    className="flex items-center gap-2 font-medium hover:text-accent"
                  >
                    <PlayerAvatar playerId={r.player_id} name={r.name} size={26} />
                    <span className="whitespace-nowrap">{r.name}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {r.games_played}
                </TableCell>
                {GRID_STATS.map((col) => {
                  const value = r[col.value as keyof GridRow] as number | null;
                  const range = ranges[col.value];
                  return (
                    <TableCell
                      key={col.value}
                      className="text-right font-mono tabular-nums"
                      style={heatStyle(value, range.min, range.max, col.kind === "counting-inverse")}
                    >
                      {fmt(value, col.kind)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={GRID_STATS.length + 2} className="py-8 text-center text-muted-foreground">
                  No qualifying players for this season.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
