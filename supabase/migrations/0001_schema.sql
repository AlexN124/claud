-- NBA box score data warehouse schema
-- Source: NBAALLSTATS.csv (per-player, per-game box scores, 2003-04 through 2024-25)

create table if not exists teams (
  team_id      bigint primary key,
  abbreviation text not null,
  city         text
);

create table if not exists players (
  player_id bigint primary key,
  name      text not null,
  nickname  text
);

create table if not exists games (
  game_id     bigint primary key,
  season      text not null,
  season_type text not null
);

create table if not exists player_game_stats (
  id              bigserial primary key,
  game_id         bigint not null references games(game_id),
  team_id         bigint not null references teams(team_id),
  player_id       bigint not null references players(player_id),
  start_position  text,
  comment         text,
  minutes_played  numeric,
  fgm             numeric,
  fga             numeric,
  fg_pct          numeric,
  fg3m            numeric,
  fg3a            numeric,
  fg3_pct         numeric,
  ftm             numeric,
  fta             numeric,
  ft_pct          numeric,
  oreb            numeric,
  dreb            numeric,
  reb             numeric,
  ast             numeric,
  stl             numeric,
  blk             numeric,
  tov             numeric,
  pf              numeric,
  pts             numeric,
  plus_minus      numeric
);

create index if not exists idx_pgs_player on player_game_stats (player_id);
create index if not exists idx_pgs_team on player_game_stats (team_id);
create index if not exists idx_pgs_game on player_game_stats (game_id);

-- Distinct list of seasons (drives the season picker; querying `games` directly
-- and de-duping client-side silently truncates to whatever the PostgREST row cap
-- returns, which can be just the most recent season)
create or replace view season_list as
select distinct season from games order by season desc;

-- Per-player, per-season aggregate (drives leaderboards & player pages)
-- Shooting splits (fg_pct/fg3_pct/ft_pct) and the advanced metrics below are all
-- ratios of season totals (sum/sum), not averages of each game's percentage — the
-- latter overweights low-attempt games. Since every average here shares the same
-- denominator (games_played), sum(x)/sum(y) reduces to avg(x)/avg(y), so we can
-- compute season-accurate ratios directly from the per-game averages without a
-- second pass over player_game_stats.
create or replace view player_season_stats as
select
  pgs.player_id,
  p.name,
  g.season,
  g.season_type,
  count(*)                                  as games_played,
  round(avg(pgs.minutes_played)::numeric, 1) as min_pg,
  round(avg(pgs.pts)::numeric, 1)            as pts_pg,
  round(avg(pgs.reb)::numeric, 1)            as reb_pg,
  round(avg(pgs.ast)::numeric, 1)            as ast_pg,
  round(avg(pgs.stl)::numeric, 1)            as stl_pg,
  round(avg(pgs.blk)::numeric, 1)            as blk_pg,
  round(avg(pgs.tov)::numeric, 1)            as tov_pg,
  round(avg(pgs.fgm)::numeric, 1)            as fgm_pg,
  round(avg(pgs.fga)::numeric, 1)            as fga_pg,
  round(avg(pgs.fg3m)::numeric, 1)           as fg3m_pg,
  round(avg(pgs.fg3a)::numeric, 1)           as fg3a_pg,
  round(avg(pgs.ftm)::numeric, 1)            as ftm_pg,
  round(avg(pgs.fta)::numeric, 1)            as fta_pg,
  round(
    nullif(avg(pgs.fgm), 0) / nullif(avg(pgs.fga), 0)
  ::numeric, 3)                              as fg_pct,
  round(
    nullif(avg(pgs.fg3m), 0) / nullif(avg(pgs.fg3a), 0)
  ::numeric, 3)                              as fg3_pct,
  round(
    nullif(avg(pgs.ftm), 0) / nullif(avg(pgs.fta), 0)
  ::numeric, 3)                              as ft_pct,
  -- True shooting %: points per shooting possession, weighting free throws at 0.44
  round(
    avg(pgs.pts) / nullif(2 * (avg(pgs.fga) + 0.44 * avg(pgs.fta)), 0)
  ::numeric, 3)                              as ts_pct,
  -- Effective FG%: credits made threes at 1.5x a two-point make
  round(
    (avg(pgs.fgm) + 0.5 * avg(pgs.fg3m)) / nullif(avg(pgs.fga), 0)
  ::numeric, 3)                              as efg_pct,
  round(
    avg(pgs.ast) / nullif(avg(pgs.tov), 0)
  ::numeric, 2)                              as ast_to_tov,
  -- Hollinger Game Score: single-number per-game production estimate, averaged
  round(
    avg(
      pgs.pts + 0.4 * pgs.fgm - 0.7 * pgs.fga - 0.4 * (pgs.fta - pgs.ftm)
      + 0.7 * pgs.oreb + 0.3 * pgs.dreb + pgs.stl + 0.7 * pgs.ast
      + 0.7 * pgs.blk - 0.4 * pgs.pf - pgs.tov
    )
  ::numeric, 1)                              as game_score,
  sum(pgs.pts)                               as pts_total
from player_game_stats pgs
join players p on p.player_id = pgs.player_id
join games g on g.game_id = pgs.game_id
group by pgs.player_id, p.name, g.season, g.season_type;

-- Career totals per player (drives all-time leaderboards)
create or replace view player_career_stats as
select
  pgs.player_id,
  p.name,
  count(distinct pgs.game_id)               as games_played,
  sum(pgs.pts)                              as career_pts,
  sum(pgs.reb)                              as career_reb,
  sum(pgs.ast)                              as career_ast,
  sum(pgs.stl)                              as career_stl,
  sum(pgs.blk)                              as career_blk,
  round(avg(pgs.pts)::numeric, 1)           as pts_pg,
  round(avg(pgs.reb)::numeric, 1)           as reb_pg,
  round(avg(pgs.ast)::numeric, 1)           as ast_pg
from player_game_stats pgs
join players p on p.player_id = pgs.player_id
group by pgs.player_id, p.name;

-- Per-team, per-season averages (drives team leaderboards & team pages)
-- Single-pass aggregation: summing player rows directly and dividing by distinct
-- game count is equivalent to averaging per-game team totals, but far cheaper than
-- a nested (per-game -> per-season) aggregation over 700k+ rows.
create or replace view team_season_stats as
select
  pgs.team_id,
  t.abbreviation,
  t.city,
  g.season,
  g.season_type,
  count(distinct pgs.game_id)                                    as games_played,
  round(sum(pgs.pts)::numeric / count(distinct pgs.game_id), 1)   as pts_pg,
  round(sum(pgs.reb)::numeric / count(distinct pgs.game_id), 1)   as reb_pg,
  round(sum(pgs.ast)::numeric / count(distinct pgs.game_id), 1)   as ast_pg,
  round(sum(pgs.stl)::numeric / count(distinct pgs.game_id), 1)   as stl_pg,
  round(sum(pgs.blk)::numeric / count(distinct pgs.game_id), 1)   as blk_pg,
  round(sum(pgs.tov)::numeric / count(distinct pgs.game_id), 1)   as tov_pg
from player_game_stats pgs
join teams t on t.team_id = pgs.team_id
join games g on g.game_id = pgs.game_id
group by pgs.team_id, t.abbreviation, t.city, g.season, g.season_type;

alter table teams enable row level security;
alter table players enable row level security;
alter table games enable row level security;
alter table player_game_stats enable row level security;

create policy "public read teams" on teams for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read games" on games for select using (true);
create policy "public read player_game_stats" on player_game_stats for select using (true);
