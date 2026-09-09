"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type SeasonRow = {
  season: string;
  pts_pg: number | null;
  reb_pg: number | null;
  ast_pg: number | null;
};

export function PlayerTrendChart({ data }: { data: SeasonRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="season" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--popover-foreground)",
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="pts_pg" name="Pts/g" stroke="#f97316" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="reb_pg" name="Reb/g" stroke="#60a5fa" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ast_pg" name="Ast/g" stroke="#34d399" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
