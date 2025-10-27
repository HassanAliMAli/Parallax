#!/usr/bin/env node
import { performance } from "node:perf_hooks";

import { Command } from "commander";
import chalk from "chalk";

import { performHandshake } from "../lib/handshake.js";
import { loadMetadata, filterServers, resolveClients } from "../lib/metadata.js";
import { renderSummary, toJson, summarizeResults } from "../lib/reporting.js";
import type {
  HandshakeDefinition,
  HandshakeResult,
  HealthCheckFilters,
  HealthCheckReport,
  ServerReport,
  MetadataDocument,
} from "../types.js";

const program = new Command();

program
  .name("health-check")
  .description("Universal MCP health-check CLI for Parallax environments.")
  .option("-s, --server <id...>", "Only inspect the specified server identifiers")
  .option("-c, --client <id...>", "Only include the specified client identifiers")
  .option("-l, --list", "Show available servers and clients, then exit")
  .option("--json-only", "Skip human summary output and print JSON")
  .option("--no-summary", "Alias for --json-only")
  .option("--timeout <ms>", "Reserved for future live probes", (value) => Number.parseInt(value, 10), 3000)
  .addHelpText(
    "after",
    `\nExamples:\n  npm run health-check\n  npm run health-check -- --server core-api --client cli\n  npm run health-check -- --list\n\nThe CLI prints a human-readable summary to stderr and structured JSON to stdout.`
  );

program.parse(process.argv);

const options = program.opts<{
  server?: string[];
  client?: string[];
  jsonOnly?: boolean;
  summary?: boolean;
  list?: boolean;
  timeout?: number;
}>();

if (options.summary === false) {
  options.jsonOnly = true;
}

const filters: HealthCheckFilters = {
  servers: options.server,
  clients: options.client,
};

(async () => {
  const metadata = await loadMetadata();
  const clientMap = resolveClients(metadata);

  if (options.list) {
    renderCatalogue(metadata);
    process.exit(0);
  }

  const start = performance.now();
  const servers = filterServers(metadata, filters);

  if (servers.length === 0) {
    process.stderr.write(chalk.yellow("No servers matched the provided filters.\n"));
    process.stdout.write(
      toJson({
        generatedAt: new Date().toISOString(),
        durationMs: Math.round(performance.now() - start),
        metadataVersion: metadata.version,
        filters,
        servers: [],
      } satisfies HealthCheckReport)
    );
    process.stdout.write("\n");
    process.exit(0);
  }

  const reports: ServerReport[] = [];

  for (const server of servers) {
    const handshakes = applyClientFilter(server.handshakes, filters.clients);
    if (handshakes.length === 0) {
      reports.push({
        server,
        results: [],
        status: "skipped",
      });
      continue;
    }

    const results: HandshakeResult[] = [];
    for (const handshake of handshakes) {
      if (!clientMap.has(handshake.client)) {
        results.push({
          serverId: server.id,
          serverName: server.name,
          client: handshake.client,
          status: "warn",
          latencyMs: 0,
          protocol: handshake.protocol,
          endpoint: handshake.endpoint,
          summary: handshake.summary,
          requiresCredentials: handshake.requiresCredentials,
          message: `Unknown client '${handshake.client}' in metadata.`,
        });
        continue;
      }

      const result = await performHandshake(server, handshake);
      results.push(result);
    }

    const status = results.length ? summarizeResults(results) : "skipped";
    reports.push({
      server,
      results,
      status,
    });
  }

  const durationMs = Math.round(performance.now() - start);
  const report: HealthCheckReport = {
    generatedAt: new Date().toISOString(),
    durationMs,
    metadataVersion: metadata.version,
    filters,
    servers: reports,
  };

  if (!options.jsonOnly && options.summary !== false) {
    renderSummary(report);
  }

  process.stdout.write(`${toJson(report)}\n`);

  const exitStatus = computeExitStatus(report);
  process.exit(exitStatus);
})().catch((error) => {
  process.stderr.write(`${chalk.red("Health-check failed: ")}${error.message}\n`);
  process.exit(1);
});

function applyClientFilter(
  handshakes: HandshakeDefinition[],
  clients: string[] | undefined
): HandshakeDefinition[] {
  if (!clients || clients.length === 0) {
    return handshakes;
  }
  const allowed = new Set(clients.map((client) => client.toLowerCase()));
  return handshakes.filter((handshake) => allowed.has(handshake.client.toLowerCase()));
}

function renderCatalogue(metadata: MetadataDocument): void {
  process.stderr.write("Available servers:\n");
  for (const server of metadata.servers) {
    process.stderr.write(`  - ${server.id}: ${server.name}\n`);
  }
  process.stderr.write("\nAvailable clients:\n");
  for (const client of metadata.clients) {
    process.stderr.write(`  - ${client.id}: ${client.name}\n`);
  }
}

function computeExitStatus(report: HealthCheckReport): number {
  const hasError = report.servers.some((server) =>
    server.results.some((result) => result.status === "error")
  );

  return hasError ? 1 : 0;
}
