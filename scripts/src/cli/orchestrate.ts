#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

import { Command } from "commander";
import chalk from "chalk";

import { loadMetadata, filterServers } from "../lib/metadata.js";
import type { HealthCheckFilters, ServerDefinition } from "../types.js";
import { runCommand } from "../lib/process.js";

const ROOT = path.resolve(process.cwd());
const DOCKER_COMPOSE_FILE = path.join(ROOT, "docker-compose.yml");

const program = new Command();

program
  .name("orchestrate")
  .description("Start or stop Parallax services using Docker Compose or local commands.")
  .option("-a, --action <action>", "Action to perform: start or stop", validateAction, "start")
  .option("-s, --server <id...>", "Only operate on specified servers")
  .option("--prefer-local", "Force use of local commands even if Docker is available")
  .option("--dry-run", "Print the commands without executing them")
  .option("-l, --list", "Print the known servers and exit")
  .addHelpText(
    "after",
    `\nExamples:\n  npm run orchestrate:start\n  npm run orchestrate:stop -- --server core-api\n  npm run orchestrate:start -- --prefer-local --dry-run`)
  .parse(process.argv);

const options = program.opts<{
  action: "start" | "stop";
  server?: string[];
  preferLocal?: boolean;
  dryRun?: boolean;
  list?: boolean;
}>();

const filters: HealthCheckFilters = {
  servers: options.server,
};

(async () => {
  const metadata = await loadMetadata();

  if (options.list) {
    process.stderr.write("Available servers:\n");
    for (const server of metadata.servers) {
      process.stderr.write(`  - ${server.id}: ${server.name}\n`);
    }
    return;
  }

  const servers = filterServers(metadata, filters);
  if (!servers.length) {
    process.stderr.write(chalk.yellow("No servers matched the provided filters.\n"));
    return;
  }

  const composeAvailable = fs.existsSync(DOCKER_COMPOSE_FILE);
  const composeServices = new Set<string>();
  const localCommands: Array<{ server: ServerDefinition; command: string }> = [];

  for (const server of servers) {
    const orchestration = server.orchestration;
    if (!orchestration) {
      logWarn(`Server ${server.id} has no orchestration configuration.`);
      continue;
    }

    const prefersLocal = options.preferLocal || !composeAvailable || !orchestration.composeService;
    if (prefersLocal) {
      const localCommand = orchestration.local?.[options.action];
      if (localCommand) {
        localCommands.push({ server, command: localCommand });
      } else {
        logWarn(
          `No local ${options.action} command defined for ${server.id}. See ${server.documentationUrl ?? "project docs"}.`
        );
      }
    } else if (orchestration.composeService) {
      composeServices.add(orchestration.composeService);
    }
  }

  const commands: Array<() => Promise<void>> = [];

  if (composeServices.size > 0) {
    const services = Array.from(composeServices);
    const args = buildComposeArgs(options.action, services);
    commands.push(async () => {
      const label = `docker ${args.join(" ")}`;
      logStep(`${label}${options.dryRun ? " [dry-run]" : ""}`);
      await runCommand("docker", args, { cwd: ROOT, dryRun: options.dryRun });
    });
  }

  for (const { server, command } of localCommands) {
    commands.push(async () => {
      const label = `${server.id} (${options.action})`;
      logStep(`${label}: ${command}${options.dryRun ? " [dry-run]" : ""}`);
      if (!options.dryRun) {
        await runCommand(command, [], { cwd: ROOT, useShell: true });
      }
    });
  }

  if (!commands.length) {
    logWarn("No commands scheduled. Check your filters or orchestration metadata.");
    return;
  }

  for (const execute of commands) {
    await execute();
  }

  logComplete(`${capitalize(options.action)} sequence complete.`);
})().catch((error) => {
  logError(error);
  process.exit(1);
});

function validateAction(input: string): "start" | "stop" {
  if (input !== "start" && input !== "stop") {
    throw new Error("Action must be 'start' or 'stop'.");
  }
  return input;
}

function buildComposeArgs(action: "start" | "stop", services: string[]): string[] {
  if (action === "start") {
    return ["compose", "up", "-d", ...services];
  }
  return ["compose", "stop", ...services];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function logStep(message: string): void {
  process.stderr.write(`${chalk.cyan("›")} ${message}\n`);
}

function logComplete(message: string): void {
  process.stderr.write(`${chalk.green("✔")} ${message}\n`);
}

function logWarn(message: string): void {
  process.stderr.write(`${chalk.yellow("⚠")} ${message}\n`);
}

function logError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${chalk.red("✖")} ${message}\n`);
}
