import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Set DATABASE_URL");

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(`
      drop table if exists backfill_progress cascade;
      drop table if exists player_box_scores cascade;
    `);
    const sql = fs.readFileSync(
      path.join(__dirname, "..", "supabase", "migrations", "0001_schema.sql"),
      "utf-8"
    );
    await client.query(sql);
    console.log("schema applied");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
