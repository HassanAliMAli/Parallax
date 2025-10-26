/**
 * ============================================================ 
 * PARALLAX - Database Migration Script (v1)
 * ============================================================ 
 * Initializes the SQLite database by executing the schema.sql
 * definitions and performing initial seeding (API key, indexes,
 * metadata entries).
 * 
 * Usage:
 *   npx ts-node scripts/migrate.ts
 *   or
 *   npm run migrate
 * ============================================================ 
 */

import fs from "fs";
import path from "path";
import chalk from "chalk";
import Database from "better-sqlite3";

const ROOT = path.resolve(path.join(__dirname, ".."));
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "perplex_bridge.db");
const SCHEMA_PATH = path.join(ROOT, "schema.sql");

async function runMigration() {
  console.log(chalk.cyanBright("💾 Starting PARALLAX Database Migration...\n"));

  // Ensure required directories exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(chalk.gray(`Created data directory: ${DATA_DIR}`));
  }
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(chalk.red("\n❌ Missing schema.sql file. Migration aborted."));
    process.exit(1);
  }

  // Read and clean schema file
  const schemaSQL = fs.readFileSync(SCHEMA_PATH, "utf8");

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  try {
    db.exec(schemaSQL);
    console.log(chalk.green("✓ Schema applied successfully."));
  } catch (err) {
    console.error(chalk.red("❌ Schema execution failed:\n"), err);
    process.exit(1);
  }

  // Verify default key record
  const keyCount = db.prepare("SELECT COUNT(*) AS total FROM api_keys").get() as { total: number };
  if (!keyCount.total) {
    db.prepare(
      `INSERT INTO api_keys (id, key_hash, name, created_at)
       VALUES (?, ?, ?, strftime('%s','now'))`
    ).run("seed_key", "placeholder", "default");
    console.log(chalk.yellow("⚠ Seed API key placeholder inserted."));
  }

  // Verify metadata defaults
  db.prepare(
    `INSERT OR IGNORE INTO metadata (key, value)
     VALUES ('bridge_version', '1.0.0'), ('created_at', strftime('%s','now'))`
  ).run();

  db.close();
  console.log(chalk.greenBright("\n✅ Migration complete!"));
  console.log(chalk.gray(`Database ready at: ${DB_PATH}\n`));
}

runMigration().catch((e) => {
  console.error(chalk.red("\nMigration failed due to an unexpected exception:\n"), e);
  process.exit(1);
});