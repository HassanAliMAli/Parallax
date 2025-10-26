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
