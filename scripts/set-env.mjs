#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");
const ENV_EXAMPLE_PATH = path.join(ROOT, ".env.example");

const target = fs.existsSync(ENV_PATH) ? ENV_PATH : ENV_EXAMPLE_PATH;

if (!fs.existsSync(target)) {
  console.error("No .env or .env.example file found. Run npm run bootstrap to generate one.");
  process.exit(1);
}

const content = fs.readFileSync(target, "utf8");
const entries = parseEnv(content);

if (!entries.length) {
  console.error(`No environment assignments found in ${target}.`);
  process.exit(1);
}

process.stdout.write(`# Run: eval \"$(node scripts/set-env.mjs)\"\n`);
process.stdout.write(`# Loaded from: ${path.relative(process.cwd(), target)}\n`);
for (const [key, value] of entries) {
  process.stdout.write(`export ${key}=${quote(value)}\n`);
}

function parseEnv(source) {
  const result = [];
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const index = line.indexOf("=");
    if (index === -1) {
      continue;
    }
    const key = line.slice(0, index).trim();
    if (!key) {
      continue;
    }
    const value = line.slice(index + 1).trim();
    result.push([key, value]);
  }
  return result;
}

function quote(value) {
  const escaped = value.replace(/"/g, '\\\"');
  return `"${escaped}"`;
}
