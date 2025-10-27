import chalk from "chalk";

import type { HandshakeResult, HealthCheckReport, HealthStatus, ServerReport } from "../types.js";

const STATUS_LABEL: Record<HealthStatus, string> = {
  ok: chalk.green("OK"),
  warn: chalk.hex("#FFB020")("WARN"),
  skipped: chalk.cyan("SKIP"),
  error: chalk.red("ERROR"),
};

const STATUS_WEIGHT: Record<HealthStatus, number> = {
  ok: 0,
  warn: 1,
  skipped: 2,
  error: 3,
};

export function sortServers(reports: ServerReport[]): ServerReport[] {
  return [...reports].sort((a, b) => {
    const diff = STATUS_WEIGHT[b.status] - STATUS_WEIGHT[a.status];
    if (diff !== 0) {
      return diff;
    }
    return a.server.name.localeCompare(b.server.name);
  });
}

export function renderSummary(report: HealthCheckReport): void {
  const lines: string[] = [];
  lines.push(chalk.bold(`Parallax MCP Health Report (${report.metadataVersion})`));
  lines.push(chalk.gray(`Generated at ${report.generatedAt}`));
  if (report.filters.servers?.length) {
    lines.push(chalk.gray(`Server filters: ${report.filters.servers.join(", ")}`));
  }
  if (report.filters.clients?.length) {
    lines.push(chalk.gray(`Client filters: ${report.filters.clients.join(", ")}`));
  }
  lines.push("");

  for (const serverReport of sortServers(report.servers)) {
    lines.push(`${STATUS_LABEL[serverReport.status]} ${chalk.bold(serverReport.server.name)} (${serverReport.server.id})`);
    for (const result of serverReport.results) {
      lines.push(
        `  • ${STATUS_LABEL[result.status]} ${result.client} → ${result.protocol} ${result.endpoint} | ${result.summary}`
      );
      if (result.message) {
        lines.push(chalk.gray(`      ↳ ${result.message}`));
      }
      if (result.missingCredentials && result.missingCredentials.length) {
        lines.push(
          chalk.hex("#FF6B6B")(
            `      ↳ Missing credentials: ${result.missingCredentials.join(", ")}`
          )
        );
      }
      if (result.guidance) {
        const guidanceLines = result.guidance.split(/\r?\n/);
        for (const guidanceLine of guidanceLines) {
          const prefix = guidanceLines.length > 1 ? "        " : "      ";
          lines.push(chalk.gray(`${prefix}↳ ${guidanceLine}`));
        }
      }
    }
    lines.push("");
  }

  process.stderr.write(`${lines.join("\n")}\n`);
}

export function toJson(report: HealthCheckReport): string {
  return JSON.stringify(report, null, 2);
}

export function summarizeResults(results: HandshakeResult[]): HealthStatus {
  return results.reduce<HealthStatus>((worst, result) => {
    return STATUS_WEIGHT[result.status] > STATUS_WEIGHT[worst] ? result.status : worst;
  }, "ok");
}
