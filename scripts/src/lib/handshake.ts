import { performance } from "node:perf_hooks";

import type {
  HandshakeDefinition,
  HandshakeResult,
  HealthStatus,
  ServerDefinition,
} from "../types.js";

export interface HandshakeOptions {
  environment?: NodeJS.ProcessEnv;
}

const STATUS_WEIGHT: Record<HealthStatus, number> = {
  ok: 0,
  warn: 1,
  skipped: 2,
  error: 3,
};

export function mergeStatus(a: HealthStatus, b: HealthStatus): HealthStatus {
  return STATUS_WEIGHT[a] >= STATUS_WEIGHT[b] ? a : b;
}

function defaultGuidance(envVars: string[] | undefined): string | undefined {
  if (!envVars || envVars.length === 0) {
    return undefined;
  }
  const exports = envVars.map((envVar) => `  export ${envVar}=<value>`).join("\n");
  return `Set the following environment variables before re-running the check:\n${exports}`;
}

export async function performHandshake(
  server: ServerDefinition,
  handshake: HandshakeDefinition,
  options: HandshakeOptions = {}
): Promise<HandshakeResult> {
  const environment = options.environment ?? process.env;
  const start = performance.now();

  const missingCredentials = handshake.requiresCredentials
    ? (handshake.credentialEnvVars ?? []).filter((variable) => {
        const value = environment[variable];
        return !value || value.trim().length === 0;
      })
    : [];

  if (missingCredentials.length) {
    const ended = performance.now();
    return {
      serverId: server.id,
      serverName: server.name,
      client: handshake.client,
      status: "skipped",
      latencyMs: Math.round(ended - start),
      protocol: handshake.protocol,
      endpoint: handshake.endpoint,
      summary: handshake.summary,
      requiresCredentials: handshake.requiresCredentials,
      missingCredentials,
      guidance: handshake.guidance ?? defaultGuidance(missingCredentials),
      message: `Missing credentials: ${missingCredentials.join(", ")}`,
    };
  }

  let status: HealthStatus = "warn";
  let message: string | undefined = "Probe executed using mock handshake.";
  let payload: Record<string, unknown> | undefined;
  let latencyMs: number;

  if (handshake.mock) {
    payload = handshake.mock.payload;
    message = handshake.mock.message ?? message;
    latencyMs = handshake.mock.latencyMs ?? Math.round(performance.now() - start);

    switch (handshake.mock.result) {
      case "ok":
        status = "ok";
        break;
      case "warn":
        status = "warn";
        break;
      default:
        status = "error";
        break;
    }
  } else {
    latencyMs = Math.round(performance.now() - start);
    message =
      "No mock handshake available; provide an endpoint probe implementation to enable live checking.";
  }

  return {
    serverId: server.id,
    serverName: server.name,
    client: handshake.client,
    status,
    latencyMs,
    protocol: handshake.protocol,
    endpoint: handshake.endpoint,
    summary: handshake.summary,
    guidance: handshake.guidance,
    message,
    requiresCredentials: handshake.requiresCredentials,
    payload,
  };
}

export function aggregateStatus(results: HandshakeResult[]): HealthStatus {
  return results.reduce<HealthStatus>((current, result) => mergeStatus(current, result.status), "ok");
}
