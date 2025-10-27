#!/usr/bin/env node
import { copyFile, access } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

import { Command } from "commander";
import chalk from "chalk";

import { runCommand } from "../lib/process.js";

const ROOT = path.resolve(process.cwd());

const program = new Command();

program
  .name("bootstrap")
  .description("Prepare the Parallax development environment.")
  .option("--skip-node", "Skip npm dependency installation")
  .option("--skip-python", "Skip Python dependency installation")
  .option("--force", "Force re-installation of dependencies")
  .option("--dry-run", "Show the actions without executing them")
  .addHelpText(
    "after",
    `\nExamples:\n  npm run bootstrap\n  npm run bootstrap -- --dry-run\n  npm run bootstrap -- --skip-python`)
  .parse(process.argv);

const options = program.opts<{
  skipNode?: boolean;
  skipPython?: boolean;
  force?: boolean;
  dryRun?: boolean;
}>();

(async () => {
  if (!options.skipNode) {
    await ensureNodeDependencies({ force: options.force, dryRun: options.dryRun });
  } else {
    logStep("Skipping npm dependency installation (--skip-node)");
  }

  if (!options.skipPython) {
    await ensurePythonDependencies({ dryRun: options.dryRun });
  } else {
    logStep("Skipping Python dependency installation (--skip-python)");
  }

  await ensureEnvFile({ dryRun: options.dryRun });

  logComplete("Bootstrap complete.");
})().catch((error) => {
  process.stderr.write(`${chalk.red("Bootstrap failed:")} ${error.message}\n`);
  process.exit(1);
});

interface EnsureOptions {
  dryRun?: boolean;
}

interface NodeEnsureOptions extends EnsureOptions {
  force?: boolean;
}

async function ensureNodeDependencies(options: NodeEnsureOptions): Promise<void> {
  const nodeModules = path.join(ROOT, "node_modules");
  const shouldInstall = options.force || !fs.existsSync(nodeModules);

  if (!shouldInstall) {
    logStep("Node dependencies already installed. Use --force to reinstall.");
    return;
  }

  const dryLabel = options.dryRun ? " (dry-run)" : "";
  logStep(`Installing npm dependencies${dryLabel}...`);
  if (options.dryRun) {
    return;
  }
  await runCommand("npm", ["install"], { cwd: ROOT });
}

async function ensurePythonDependencies(options: EnsureOptions): Promise<void> {
  const requirementsPath = path.join(ROOT, "requirements.txt");
  if (!fs.existsSync(requirementsPath)) {
    logStep("No requirements.txt found; skipping Python dependency installation.");
    return;
  }

  const dryLabel = options.dryRun ? " (dry-run)" : "";
  logStep(`Installing Python dependencies${dryLabel}...`);
  if (options.dryRun) {
    return;
  }
  await runCommand("python3", ["-m", "pip", "install", "-r", requirementsPath], {
    cwd: ROOT,
  });
}

async function ensureEnvFile(options: EnsureOptions): Promise<void> {
  const envExample = path.join(ROOT, ".env.example");
  const envFile = path.join(ROOT, ".env");

  try {
    await access(envFile, fs.constants.F_OK);
    logStep(".env already exists. Skipping creation.");
    return;
  } catch {
    // Continue to copy
  }

  try {
    await access(envExample, fs.constants.F_OK);
  } catch {
    throw new Error("Missing .env.example file. Add one to the project root to use bootstrap.");
  }

  const dryLabel = options.dryRun ? " (dry-run)" : "";
  logStep(`Creating .env from .env.example${dryLabel}...`);
  if (options.dryRun) {
    return;
  }
  await copyFile(envExample, envFile);
}

function logStep(message: string): void {
  process.stderr.write(`${chalk.cyan("›")} ${message}\n`);
}

function logComplete(message: string): void {
  process.stderr.write(`${chalk.green("✔")} ${message}\n`);
}
