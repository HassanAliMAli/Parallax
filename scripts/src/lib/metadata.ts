import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  ClientDefinition,
  HealthCheckFilters,
  MetadataDocument,
  ServerDefinition,
} from "../types.js";

const METADATA_PATH = path.resolve(process.cwd(), "scripts/config/servers.json");

let cache: MetadataDocument | null = null;

export async function loadMetadata(): Promise<MetadataDocument> {
  if (cache) {
    return cache;
  }

  const raw = await readFile(METADATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as MetadataDocument;
  validateMetadata(parsed);
  cache = parsed;
  return parsed;
}

export function clearMetadataCache(): void {
  cache = null;
}

export function filterServers(
  metadata: MetadataDocument,
  filters: HealthCheckFilters
): ServerDefinition[] {
  let servers = metadata.servers;

  if (filters.servers && filters.servers.length) {
    const wanted = new Set(filters.servers.map((s) => s.toLowerCase()));
    servers = servers.filter((server) => wanted.has(server.id.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return servers;
}

export function resolveClients(metadata: MetadataDocument): Map<string, ClientDefinition> {
  return new Map(metadata.clients.map((client) => [client.id, client]));
}

function validateMetadata(metadata: MetadataDocument): void {
  if (!metadata || typeof metadata !== "object") {
    throw new Error("Invalid metadata document: expected an object");
  }

  if (!Array.isArray(metadata.servers)) {
    throw new Error("Invalid metadata document: missing servers array");
  }

  for (const server of metadata.servers) {
    if (!server.id || !server.name) {
      throw new Error(`Server entry missing id or name: ${JSON.stringify(server)}`);
    }
    if (!Array.isArray(server.handshakes)) {
      throw new Error(`Server ${server.id} missing handshakes definition`);
    }
  }
}
