# PARALLAX — Local Perplexity Bridge v1

## 🚧 Project Status: Under Development 🚧

**This project is currently in the initial development phase. The core backend infrastructure and database setup are complete. The API server can be started, but the worker and dashboard are not yet implemented.**

---

## Overview
**PARALLAX** is a local API bridge that automates a Chromium browser to interact with [Perplexity.ai](https://www.perplexity.ai) via real user sessions instead of the paid API. It scrapes structured Markdown answers with citations and exposes them through a modern REST API fully compatible with OpenAI-style integrations.

This system allows **apps like Obsidian, Cursor, n8n, VS Code, and others** to call your local "AI backend" as if it were a cloud model — but privately and without cost.

---

## Core Features (Planned)

- **Local-first operation** — no network beyond Perplexity itself.
- **OpenAI-compatible endpoint** (`POST /v1/generate`).
- **Single persistent Playwright page** for contextual continuity.
- **Smart thread management** (Automatic switching via stored `perplexity_thread_url`).
- **Session persistence** (Cookies-first with fallback storageState).
- **Automatic detection of CAPTCHAs or login expiration** with dashboard alerts.
- **Queue-based architecture** — handles job persistence, retries, and recovery.
- **React + Vite dashboard** — monitor jobs, logs, conversations, or reauthenticate easily.
- **CLI & Docker support** — single executable or multi-platform deployment.

---

## API Endpoints

### `GET /v1/status`

Provides a real-time snapshot of the system's health and status.

**Returns:**

```json
{
  "worker_running": false,
  "queued_jobs": 0,
  "uptime_seconds": 120,
  "db_status": "connected"
}
```

-   `worker_running`: `true` if the browser automation worker is active.
-   `queued_jobs`: Number of tasks waiting in the queue.
-   `uptime_seconds`: How long the server has been running.
-   `db_status`: Status of the database connection.

---

## Technical Stack

| Layer | Technology |
|-------|-------------|
| API Server | Fastify (TypeScript) |
| Browser Automation | Playwright (Chromium) |
| Database | SQLite (`better-sqlite3`) |
| Queue Manager | Custom FIFO Queue with persistence |
| Frontend | React + Vite + WebSocket |
| Logging | Pino with rotation |
| Metrics | Prometheus format |
| Packaging | Docker, pkg (single executable) |
| Tests | Jest + Playwright fixtures |

---

## Setup

### 1. Prerequisites
- Node.js ≥ 20
- Git

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/HassanAliMAli/Parallax.git
cd Parallax

# Install dependencies
npm install

# Install Playwright's browser binaries
npx playwright install chromium

# Set up the database
npm run migrate
```

### 3. Launch
```bash
# Build and start the server
npm start
```
The API server will be running at `http://localhost:3000`. Currently, it only has a placeholder `{"hello":"world"}` response.

---

## Operational Tooling

A new suite of cross-platform scripts lives in `scripts/`. They provide consistent entrypoints for provisioning, service orchestration, and health verification across macOS, Linux, and Windows environments.

### Bootstrap the workspace

Run the bootstrap workflow to install dependencies and materialise `.env` from `.env.example`:

| Platform | Command |
|----------|---------|
| macOS & Linux | `npm run bootstrap` or `./scripts/bootstrap.sh`
| Windows (PowerShell) | `npm run bootstrap -- --dry-run` (preview) or `pwsh ./scripts/bootstrap.ps1`

Pass `--dry-run` to preview actions or `--skip-python` / `--skip-node` to skip specific steps.

### MCP health-check CLI

Use the health-checker to inspect MCP handshake metadata and surface missing credentials:

```bash
npm run health-check
npm run health-check -- --server core-api --client cli --json-only
npm run health-check -- --list # enumerate known servers/clients
```

The command writes a colourised summary to **stderr** and emits machine-readable JSON to **stdout**, making it easy to redirect structured output into other tools.

### Service orchestration helpers

Start or stop local infrastructure via Docker Compose or the per-server local fallbacks defined in metadata:

| Action | npm script | POSIX wrapper | PowerShell wrapper |
|--------|------------|---------------|--------------------|
| Start  | `npm run orchestrate:start` | `./scripts/start.sh` | `pwsh ./scripts/start.ps1` |
| Stop   | `npm run orchestrate:stop`  | `./scripts/stop.sh`  | `pwsh ./scripts/stop.ps1`  |

Add `--server <id>` to scope the action to specific services or `--prefer-local` to bypass Docker even when Compose metadata is present.

### Environment convenience scripts

Load environment variables from `.env` or `.env.example` without manual copy/paste:

- **macOS/Linux** – `eval "$(node scripts/set-env.mjs)"`
- **Windows** – `. .\scripts\set-env.ps1`

The PowerShell script can also be run with `-Print` to emit persistent `setx` commands.

---

## CLI Usage (In Development)

The command-line interface (`CLI.ts`) is included but not yet fully integrated. Once complete, you will be able to run it via `npm run cli -- <command>`.

Planned commands:
```bash
# Start the local API + worker
npm run cli -- start

# Generate a new API key
npm run cli -- generate-key --name obsidian

# Check server status
npm run cli -- status
```

---

## Directory Structure

```
PARALLAX/
├─ src/
│  ├─ server/
│  ├─ worker/
│  ├─ queue/
│  ├─ db/
│  ├─ utils/
│  └─ index.ts            # Main server entry point
│
├─ dashboard/             # (Not yet implemented)
├─ scripts/
│  └─ migrate.ts
├─ tests/
├─ data/                  # (Git-ignored) Runtime data
│
├─ Dockerfile
├─ docker-compose.yml
├─ config.yml.example
├─ schema.sql
└─ README.md
```

---

## Future Enhancements (v2 Roadmap)
- Streaming responses (SSE for real-time Markdown output)
- Multi-page concurrency (scalable parallel jobs)
- Multi-user session handling
- OAuth or token-based login support
- UI-based configuration editing

---

## License
MIT License © 2025 PARALLAX Project Maintainers
