"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STAT_OPTIONS } from "@/lib/data";

export function LeadersFilters({
  seasons,
  season,
  seasonType,
  stat,
  mode,
}: {
  seasons: string[];
  season: string;
  seasonType: string;
  stat: string;
  mode: "players" | "teams";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) params.set(k, v);
    router.push(`/leaders?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs value={mode} onValueChange={(v) => update({ mode: v })}>
        <TabsList>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
      </Tabs>

      <Select value={season} onValueChange={(v) => v && update({ season: v })}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Season" />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tabs value={seasonType} onValueChange={(v) => update({ type: v })}>
        <TabsList>
          <TabsTrigger value="Regular Season">Regular</TabsTrigger>
          <TabsTrigger value="Playoffs">Playoffs</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "players" && (
        <Select value={stat} onValueChange={(v) => v && update({ stat: v })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stat">
              {(v: string) => STAT_OPTIONS.find((s) => s.value === v)?.label ?? v}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STAT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
