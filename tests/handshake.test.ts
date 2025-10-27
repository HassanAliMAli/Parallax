import assert from "node:assert/strict";

import { performHandshake } from "../scripts/src/lib/handshake.js";
import type { HandshakeDefinition, ServerDefinition } from "../scripts/src/types.js";

const baseServer: ServerDefinition = {
  id: "test-server",
  name: "Test Server",
  description: "Server used for handshake unit tests",
  host: "http://localhost",
  tags: ["test"],
  handshakes: [],
};

const baseHandshake: HandshakeDefinition = {
  client: "cli",
  protocol: "mcp-http",
  endpoint: "/handshake",
  summary: "Test handshake",
  requiresCredentials: true,
  credentialEnvVars: ["TEST_TOKEN"],
  mock: {
    result: "ok",
    latencyMs: 10,
    payload: { version: "1.0.0" },
  },
};

async function run(): Promise<void> {
  await ensuresMissingCredentialsSkipped();
  await ensuresSuccessfulHandshake();
  await ensuresMockErrorPropagates();
  console.info("Handshake logic tests passed");
}

async function ensuresMissingCredentialsSkipped(): Promise<void> {
  const result = await performHandshake(baseServer, baseHandshake, {
    environment: {},
  });

  assert.equal(result.status, "skipped", "Expected status to be skipped when credentials missing");
  assert.deepEqual(result.missingCredentials, ["TEST_TOKEN"]);
  assert.ok(result.message?.includes("Missing credentials"));
}

async function ensuresSuccessfulHandshake(): Promise<void> {
  const result = await performHandshake(baseServer, baseHandshake, {
    environment: { TEST_TOKEN: "abc123" },
  });

  assert.equal(result.status, "ok", "Expected handshake to succeed with credentials");
  assert.equal(result.latencyMs, baseHandshake.mock?.latencyMs);
  assert.deepEqual(result.payload, baseHandshake.mock?.payload);
}

async function ensuresMockErrorPropagates(): Promise<void> {
  const handshake: HandshakeDefinition = {
    ...baseHandshake,
    mock: {
      result: "error",
      message: "Simulated failure",
    },
  };

  const result = await performHandshake(baseServer, handshake, {
    environment: { TEST_TOKEN: "value" },
  });

  assert.equal(result.status, "error", "Expected mock failure to propagate error status");
  assert.equal(result.message, "Simulated failure");
}

run().catch((error) => {
  console.error("Handshake tests failed", error);
  process.exit(1);
});
