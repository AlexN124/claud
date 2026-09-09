// Loads the normalized NBA CSVs into Supabase Postgres via COPY.
// Usage: DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres" node scripts/load-data.mjs
import { Client } from "pg";
import { from as copyFrom } from "pg-copy-streams";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR =
  process.env.DATA_DIR ||
  "C:/Users/alexa/AppData/Local/Temp/claude/C--Users-alexa/950fb9e7-d2a6-4729-a2d7-dc46d8415bf1/scratchpad";

const TABLES = [
  { file: "teams.csv", table: "teams", columns: "(team_id, abbreviation, city)" },
  { file: "players.csv", table: "players", columns: "(player_id, name, nickname)" },
  { file: "games.csv", table: "games", columns: "(game_id, season, season_type)" },
  {
    file: "player_game_stats.csv",
    table: "player_game_stats",
    columns:
      "(game_id, team_id, player_id, start_position, comment, minutes_played, fgm, fga, fg_pct, fg3m, fg3a, fg3_pct, ftm, fta, ft_pct, oreb, dreb, reb, ast, stl, blk, tov, pf, pts, plus_minus)",
  },
];

async function copyTable(client, { file, table, columns }) {
  const filePath = path.join(DATA_DIR, file);
  const sql = `COPY ${table} ${columns} FROM STDIN WITH (FORMAT csv, HEADER true, NULL '')`;
  await new Promise((resolve, reject) => {
    const stream = client.query(copyFrom(sql));
    const source = fs.createReadStream(filePath);
    source.on("error", reject);
    stream.on("error", reject);
    stream.on("finish", resolve);
    source.pipe(stream);
  });
  console.log(`loaded ${table} from ${file}`);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DATABASE_URL to your Supabase Postgres connection string");
  }
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query("truncate table player_game_stats, games, players, teams restart identity cascade");
    for (const t of TABLES) {
      await copyTable(client, t);
    }
    const { rows } = await client.query("select count(*)::int as n from player_game_stats");
    console.log("player_game_stats rows:", rows[0].n);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
