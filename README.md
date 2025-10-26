Here’s the full and **most up‑to‑date `README.md`** for your **PARALLAX** project — the definitive entry point for any human or AI coding agent to understand, set up, and build your system.

***

### Filename: `README.md`

```markdown
# PARALLAX — Local Perplexity Bridge v1

## Overview
**PARALLAX** is a local API bridge that automates a Chromium browser to interact with [Perplexity.ai](https://www.perplexity.ai) via real user sessions instead of the paid API. It scrapes structured Markdown answers with citations and exposes them through a modern REST API fully compatible with OpenAI-style integrations.

This system allows **apps like Obsidian, Cursor, n8n, VS Code, and others** to call your local "AI backend" as if it were a cloud model — but privately and without cost.

---

## Core Features

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

## Key Concepts

**Conversation = Thread**
Each app using the bridge (e.g., Obsidian, n8n, or Cursor) gets a dedicated conversation/thread — mapped inside SQLite with its Perplexity-powered thread URL (`https://perplexity.ai/search/...`).  
The worker toggles between URLs to maintain separated contexts, all within a single browser page.

**Job Queue**
The queue ensures serialized operation:
1. Every API call becomes a “Job”.
2. The `Worker` executes jobs sequentially.
3. Each job includes retry & error capture policies.

**Cookies-First Session Persistence**
- Cookies loaded/saved automatically to the `sessions` table.
- Session refresh handled via dashboard prompts.
- Optional fallback storageState for long-term stability.

---

## Directory Structure

```
PARALLAX/
├─ src/
│  ├─ server/               # Fastify routes, API controllers
│  ├─ worker/               # Playwright worker and scraping logic
│  ├─ queue/                # Job queue with DB persistence
│  ├─ db/                   # DB wrapper, models, migrations
│  ├─ utils/                # Helper utilities
│  └─ cli/                  # CLI launcher and menu logic
│
├─ dashboard/               # React+Vite SPA (status/logs/settings)
│  ├─ components/
│  ├─ pages/
│  ├─ hooks/
│  └─ websocket/
│
├─ scripts/                 # migrate.ts, seed.ts tools
├─ tests/                   # Unit + Integration + Fixture tests
├─ data/                    # Runtime data (db, logs, sessions)
│
├─ Dockerfile
├─ docker-compose.yml
├─ config.yml.example
├─ schema.sql
├─ README.md
├─ PRD.md
├─ architecture.md
├─ ACTIONABLES.md
├─ ACTIONABLES_AGENT.md
├─ MASTER_PROMPT.md
├─ metrics_spec.md
├─ SECURITY.md
└─ LICENSE
```

---

## Setup

### 1. Prerequisites
- Node.js ≥ 20  
- Playwright (`npx playwright install chromium`)  
- SQLite (included natively)  

### 2. Installation
```
git clone https://github.com/yourname/PARALLAX.git
cd PARALLAX
npm install
npm run build
npm run migrate  # setup SQLite schema
```

### 3. Launch
```
npm start
```

Then open:
```
Dashboard: http://localhost:3000/dashboard
API:       http://localhost:3000/v1/generate
```

---

## CLI Usage

```
# Start the local API + worker
bridge start

# Generate a new API key
bridge generate-key --name obsidian

# Check server status
bridge status
```

### First Run
1. A visible Chromium window opens.
2. Log in to your Perplexity account.
3. Hit **Enter** in the CLI to save session cookies.
4. The API starts automatically with `bridge_xxx` API Key printed & copied.

---

## Example API Calls

### Example: `POST /v1/generate`
Request (from Obsidian or Curl):
```
{
  "prompt": "Summarize quantum entanglement",
  "conversation_id": "obsidian_notes"
}
```

Response:
```
{
  "conversation_id": "obsidian_notes",
  "response_markdown": "# Quantum Entanglement\nQuantum entanglement...",
  "sources": [
    {
      "title": "Stanford Encyclopedia of Philosophy",
      "url": "https://plato.stanford.edu/entries/qt-entangle/"
    }
  ]
}
```

---

## Dashboard Highlights

- **Status Page:** Queue length, processed jobs, uptime.
- **Conversations Page:** Thread list with message counts & timestamps.
- **Logs Page:** Live streaming (last 500 lines).
- **Settings Page:** Manage API Keys, config, re-login.
- **CAPTCHA Solver:** Pop-up window to manually authenticate when needed.

---

## Metrics Endpoint
Exposes Prometheus-compatible metrics at `/metrics`, including:
```
bridge_jobs_total{status="completed"} 42
bridge_jobs_total{status="failed"} 3
bridge_queue_length 1
bridge_worker_uptime 3600
```

---

## Security Features

- Localhost-only by default (`lan_enabled: false`).
- Optional LAN access with explicit `allowed_ips`.
- All API endpoints require a valid API key.
- Session cookies never leave device.
- Logs sanitized for URLs & cookies.

---

## Development Conventions

- **TypeScript best practices**
- **ESLint + Prettier**
- **Environment-neutral path handling**
- **Functional modularization (no shared state)**  

GitHub Actions CI runs:
- `npm run lint`
- `npm test`
- `npm run build`

---

## Docker Support
```
docker build -t parallax .
docker run -p 3000:3000 -v data:/app/data parallax
```

or with docker-compose:
```
docker-compose up -d
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
```

***