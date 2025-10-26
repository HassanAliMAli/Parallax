/**
 * ============================================================ 
 * PARALLAX CLI (v1)
 * ============================================================ 
 * An interactive command-line interface for managing
 * the local Perplexity bridge lifecycle:
 * - start/stop/status server
 * - generate API keys
 * - initiate login session
 * - check updates & metrics
 * ============================================================ 
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import readline from "readline";
import { spawn } from "child_process";
import clipboardy from "clipboardy";
import ora from "ora";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../data");
const CONFIG_PATH = process.env.BRIDGE_CONFIG_PATH || path.join(__dirname, "../../config.yml");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Generate a random API key and save its hash into SQLite.
 */
async function generateApiKey(label = "default") {
  const keyRaw = "bridge_" + crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256").update(keyRaw).digest("hex");
  const dbFile = path.join(DATA_DIR, "perplex_bridge.db");

  const Database = (await import("better-sqlite3")).default;
  const db = new Database(dbFile);
  db.prepare(
    `INSERT INTO api_keys (id, key_hash, name, created_at)
     VALUES (?, ?, ?, strftime('%s','now'))`
  ).run(crypto.randomUUID(), hash, label);
  db.close();

  fs.writeFileSync(path.join(DATA_DIR, "api-key.txt"), keyRaw);
  clipboardy.writeSync(keyRaw);
  console.log(chalk.green("✓ API key generated and copied to clipboard."));
  console.log(chalk.gray(`Stored hash in DB for label: ${label}`));
  return keyRaw;
}

/**
 * Start the bridge (server + worker)
 */
function startBridge() {
  ensureDataDir();
  const logFile = path.join(DATA_DIR, "logs/startup.log");
  const spinner = ora("Launching PARALLAX server...").start();

  const child = spawn("node", ["dist/index.js"], {
    cwd: path.resolve(__dirname, "../.."),
    detached: true,
    stdio: ["ignore", fs.openSync(logFile, "a"), fs.openSync(logFile, "a")],
  });

  child.unref();
  setTimeout(() => {
    spinner.succeed("PARALLAX is now running at http://localhost:3000");
    console.log(chalk.blueBright("\nDashboard → http://localhost:3000/dashboard\n"));
  }, 2500);
}

/**
 * Display server status using /v1/status REST call.
 */
async function checkStatus() {
  try {
    const response = await fetch("http://127.0.0.1:3000/v1/status");
    if (!response.ok) throw new Error("not running");
    const status = await response.json();
    console.log(chalk.green("✓ Bridge online"));
    console.table(status);
  } catch {
    console.log(chalk.yellow("Bridge not running or unreachable."));
  }
}

/**
 * Launch visible login browser to capture session cookies.
 */
async function loginFlow() {
  console.log(chalk.cyan("\n⏳ Launching Chromium for login..."));
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.perplexity.ai");
  console.log(chalk.magenta("Please log in manually, then press ENTER here when done."));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise<void>((resolve) => rl.question("", () => resolve()));
  rl.close();

  const cookies = await page.context().cookies();
  ensureDataDir();
  const sessionFile = path.join(DATA_DIR, "session_cookies.json");
  fs.writeFileSync(sessionFile, JSON.stringify(cookies, null, 2));
  console.log(chalk.green(`✓ Cookies saved to ${sessionFile}`));
  await browser.close();
}

/**
 * CLI entrypoint
 */
async function main() {
  const [, , cmd, ...args] = process.argv;
  switch (cmd) {
    case "start":
      return startBridge();
    case "status":
      return checkStatus();
    case "generate-key":
      return generateApiKey(args[0] || "default");
    case "login":
      return loginFlow();
    case "help":
    default:
      console.log(`
Usage:
  bridge start             Start the PARALLAX service
  bridge status            Check current service status
  bridge generate-key [id] Generate API key & save hash
  bridge login             Open login browser to save cookies
`);
  }
}

main().catch((err) => console.error(chalk.red("Error:"), err));