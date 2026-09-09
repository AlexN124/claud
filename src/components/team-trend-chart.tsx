"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type SeasonRow = {
  season: string;
  pts_pg: number | null;
};

export function TeamTrendChart({ data, color = "#f97316" }: { data: SeasonRow[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
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
        <Line type="monotone" dataKey="pts_pg" name="Pts/g" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
