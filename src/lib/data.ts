import { supabase } from "@/lib/supabase";

export const STAT_OPTIONS = [
  { value: "pts_pg", label: "Points" },
  { value: "reb_pg", label: "Rebounds" },
  { value: "ast_pg", label: "Assists" },
  { value: "stl_pg", label: "Steals" },
  { value: "blk_pg", label: "Blocks" },
  { value: "fg_pct", label: "FG%" },
  { value: "fg3_pct", label: "3P%" },
  { value: "ft_pct", label: "FT%" },
  { value: "ts_pct", label: "True Shooting %" },
  { value: "efg_pct", label: "Effective FG%" },
  { value: "ast_to_tov", label: "Ast/TOV" },
  { value: "game_score", label: "Game Score" },
] as const;

// Columns shown in the heat table, in display order. Each maps to a column on
// player_season_stats and a formatting hint for the heat-map cell renderer.
export const GRID_STATS = [
  { value: "pts_pg", label: "PTS", kind: "counting" },
  { value: "reb_pg", label: "REB", kind: "counting" },
  { value: "ast_pg", label: "AST", kind: "counting" },
  { value: "stl_pg", label: "STL", kind: "counting" },
  { value: "blk_pg", label: "BLK", kind: "counting" },
  { value: "tov_pg", label: "TOV", kind: "counting-inverse" },
  { value: "ts_pct", label: "TS%", kind: "pct" },
  { value: "efg_pct", label: "eFG%", kind: "pct" },
  { value: "ast_to_tov", label: "AST/TOV", kind: "counting" },
  { value: "game_score", label: "GmSc", kind: "counting" },
] as const;

export type StatKey = (typeof STAT_OPTIONS)[number]["value"];

export async function getSeasons() {
  const { data, error } = await supabase
    .from("season_list")
    .select("season")
    .order("season", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((g) => g.season);
}

export async function getLeaders({
  season,
  seasonType,
  stat,
  limit = 25,
  minGames = 20,
}: {
  season: string;
  seasonType: string;
  stat: StatKey;
  limit?: number;
  minGames?: number;
}) {
  const { data, error } = await supabase
    .from("player_season_stats")
    .select(
      "player_id, name, games_played, pts_pg, reb_pg, ast_pg, stl_pg, blk_pg, fg_pct, fg3_pct, ft_pct, ts_pct, efg_pct, ast_to_tov, game_score"
    )
    .eq("season", season)
    .eq("season_type", seasonType)
    .gte("games_played", minGames)
    .order(stat, { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getSeasonGrid({
  season,
  seasonType,
  sortBy = "game_score",
  minGames = 10,
  limit = 150,
}: {
  season: string;
  seasonType: string;
  sortBy?: string;
  minGames?: number;
  limit?: number;
}) {
  const { data, error } = await supabase
    .from("player_season_stats")
    .select(
      "player_id, name, games_played, pts_pg, reb_pg, ast_pg, stl_pg, blk_pg, tov_pg, ts_pct, efg_pct, ast_to_tov, game_score"
    )
    .eq("season", season)
    .eq("season_type", seasonType)
    .gte("games_played", minGames)
    .order(sortBy, { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getTeamLeaders({
  season,
  seasonType,
  limit = 30,
}: {
  season: string;
  seasonType: string;
  limit?: number;
}) {
  const { data, error } = await supabase
    .from("team_season_stats")
    .select("team_id, abbreviation, city, games_played, pts_pg, reb_pg, ast_pg, stl_pg, blk_pg, tov_pg")
    .eq("season", season)
    .eq("season_type", seasonType)
    .order("pts_pg", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function searchPlayers(query: string, limit = 25) {
  let q = supabase.from("players").select("player_id, name, nickname").order("name").limit(limit);
  if (query) q = q.ilike("name", `%${query}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getPlayer(playerId: number) {
  const { data: player, error: playerErr } = await supabase
    .from("players")
    .select("player_id, name, nickname")
    .eq("player_id", playerId)
    .single();
  if (playerErr) throw playerErr;

  const { data: seasons, error: seasonsErr } = await supabase
    .from("player_season_stats")
    .select("season, season_type, games_played, min_pg, pts_pg, reb_pg, ast_pg, stl_pg, blk_pg, tov_pg, fg_pct, fg3_pct, ft_pct")
    .eq("player_id", playerId)
    .order("season", { ascending: true });
  if (seasonsErr) throw seasonsErr;

  const { data: career, error: careerErr } = await supabase
    .from("player_career_stats")
    .select("games_played, career_pts, career_reb, career_ast, career_stl, career_blk, pts_pg, reb_pg, ast_pg")
    .eq("player_id", playerId)
    .single();
  if (careerErr && careerErr.code !== "PGRST116") throw careerErr;

  return { player, seasons: seasons ?? [], career: career ?? null };
}

export async function getTeams() {
  const { data, error } = await supabase
    .from("teams")
    .select("team_id, abbreviation, city")
    .order("city");
  if (error) throw error;
  return data ?? [];
}

export async function getTeam(teamId: number) {
  const { data: team, error: teamErr } = await supabase
    .from("teams")
    .select("team_id, abbreviation, city")
    .eq("team_id", teamId)
    .single();
  if (teamErr) throw teamErr;

  const { data: seasons, error: seasonsErr } = await supabase
    .from("team_season_stats")
    .select("season, season_type, games_played, pts_pg, reb_pg, ast_pg, stl_pg, blk_pg, tov_pg")
    .eq("team_id", teamId)
    .order("season", { ascending: true });
  if (seasonsErr) throw seasonsErr;

  return { team, seasons: seasons ?? [] };
}

export async function getHomeStats() {
  const [{ count: playerCount }, { count: gameCount }, { count: statRowCount }] = await Promise.all([
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("games").select("*", { count: "exact", head: true }),
    supabase.from("player_game_stats").select("*", { count: "exact", head: true }),
  ]);
  return {
    playerCount: playerCount ?? 0,
    gameCount: gameCount ?? 0,
    statRowCount: statRowCount ?? 0,
  };
}
