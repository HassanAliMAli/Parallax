export type HandshakeMockResult = "ok" | "warn" | "error";

export interface HandshakeMock {
  result: HandshakeMockResult;
  latencyMs?: number;
  payload?: Record<string, unknown>;
  message?: string;
}

export interface HandshakeDefinition {
  client: string;
  protocol: string;
  endpoint: string;
  summary: string;
  requiresCredentials: boolean;
  credentialEnvVars?: string[];
  guidance?: string;
  mock?: HandshakeMock;
}

export interface OrchestrationConfig {
  composeService?: string;
  local?: {
    start?: string;
    stop?: string;
  };
}

export interface ServerDefinition {
  id: string;
  name: string;
  description: string;
  host: string;
  tags: string[];
  documentationUrl?: string;
  orchestration?: OrchestrationConfig;
  handshakes: HandshakeDefinition[];
}

export interface ClientDefinition {
  id: string;
  name: string;
  description?: string;
}

export interface MetadataDocument {
  version: string;
  clients: ClientDefinition[];
  servers: ServerDefinition[];
}

export interface HealthCheckFilters {
  servers?: string[];
  clients?: string[];
}

export type HealthStatus = "ok" | "warn" | "error" | "skipped";

export interface HandshakeResult {
  serverId: string;
  serverName: string;
  client: string;
  status: HealthStatus;
  latencyMs: number;
  protocol: string;
  endpoint: string;
  summary: string;
  guidance?: string;
  message?: string;
  requiresCredentials: boolean;
  missingCredentials?: string[];
  payload?: Record<string, unknown>;
}

export interface ServerReport {
  server: ServerDefinition;
  results: HandshakeResult[];
  status: HealthStatus;
}

export interface HealthCheckReport {
  generatedAt: string;
  durationMs: number;
  metadataVersion: string;
  filters: HealthCheckFilters;
  servers: ServerReport[];
}
