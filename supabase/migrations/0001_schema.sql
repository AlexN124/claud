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

-- Per-player, per-season aggregate (drives leaderboards & player pages)
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
  round(avg(pgs.fg_pct)::numeric, 3)         as fg_pct,
  round(avg(pgs.fg3_pct)::numeric, 3)        as fg3_pct,
  round(avg(pgs.ft_pct)::numeric, 3)         as ft_pct,
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
