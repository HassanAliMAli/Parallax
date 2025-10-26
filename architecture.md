Here’s the next file, an upgraded and complete version of your system architecture specification.

***

### Filename: `architecture.md`

```markdown
# PARALLAX System Architecture (v1)

This document defines the complete technical architecture of **PARALLAX**, including component roles, communication flow, storage design, concurrency constraints, and error recovery systems.

---

## 1. High-Level Overview

**PARALLAX** is a local bridge automation framework that converts natural browser usage of [Perplexity.ai](https://www.perplexity.ai) into a programmatic API.

It consists of five major components:

| Layer | Component | Description |
|-------|------------|-------------|
| API Server | Fastify Framework | Handles HTTP requests, responses, and authentication |
| Queue Manager | Internal Event System | Serializes incoming prompts into jobs for processing |
| Worker | Playwright Automation | Runs headless Chromium to scrape output and maintain session |
| Database | SQLite | Stores keys, sessions, jobs, messages, and conversations |
| Dashboard | React + Vite SPA | Front-end monitoring and session management system |

---

## 2. Component Interaction Flow

```
        ┌────────────────────────────┐
        │   Client App (e.g. Obsidian)│
        └──────────────┬─────────────┘
                       │  POST /v1/generate
                       ▼
        ┌────────────────────────────────────┐
        │           Fastify API               │
        │ - Auth (API key)                   │
        │ - Job enqueue                      │
        │ - Response handling                │
        └───────┬────────────────────────────┘
                │
                ▼
        ┌────────────────────────────────────┐
        │           Queue Manager             │
        │ - FIFO system                       │
        │ - Backpressure + retry control      │
        │ - Persists all enqueued jobs        │
        └───────┬────────────────────────────┘
                │
                ▼
        ┌────────────────────────────────────┐
        │           Worker (Playwright)       │
        │ - Loads Perplexity session          │
        │ - Sends prompt -> captures Markdown │
        │ - Handles errors, CAPTCHA, timeouts │
        └───────┬────────────────────────────┘
                │
                ▼
        ┌────────────────────────────────────┐
        │           SQLite Database           │
        │ - Messages, Jobs, Sessions, Keys    │
        │ - Fully ACID persistent store       │
        └────────────────────────────────────┘
                       │
                       ▼
        ┌────────────────────────────────────┐
        │           Dashboard SPA             │
        │ - WebSocket updates for status      │
        │ - UI controls for login/key mgmt    │
        └────────────────────────────────────┘
```

---

## 3. Server Component Layout

### Directory Responsibilities

```
src/
├── server/
│   ├── index.ts          # Fastify bootstrap
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth + logging
│   └── plugins/          # Metrics, healthcheck
├── worker/
│   ├── index.ts          # Main Playwright controller
│   ├── pageHandler.ts    # Command queue consumer
│   ├── scraper.ts        # DOM → Markdown conversion
│   ├── sessionManager.ts # Cookies handling
│   └── captchaWatcher.ts # CAPTCHA detector/resolver
├── queue/
│   ├── jobQueue.ts       # Persistent FIFO wrapper
│   └── retryPolicy.ts
├── db/
│   ├── index.ts          # SQLite instance
│   ├── models/           # ORM-like CRUD modules
│   └── migrations/
└── utils/
    ├── logger.ts
    ├── config.ts
    └── types.ts
```

---

## 4. Data Flow Lifecycle

| Step | Description |
|------|--------------|
| 1. | Client sends `POST /v1/generate` containing `prompt` and optional `conversation_id`. |
| 2. | Fastify validates input, verifies API key, logs request. |
| 3. | A new record is inserted into the **jobs** table with `status=pending`. |
| 4. | The **Queue Manager** monitors pending jobs and dispatches to the Worker when idle. |
| 5. | The **Worker** sends the prompt through Perplexity using loaded cookies. |
| 6. | Scraper extracts HTML, converts to structured Markdown and citations. |
| 7. | Job result saved as JSON in SQLite and returned to API layer. |
| 8. | Fastify responds with Markdown and source links. |
| 9. | Dashboard updates automatically via WebSocket broadcast. |

---

## 5. Thread Management System

- Each conversation maps to a **Perplexity thread URL**.  
- Threads are switched dynamically within the same Chromium page (`page.goto(url)` if new context).  
- Avoids new tab large-memory costs while maintaining context.  

**Thread storage schema:**  
| Column | Example |
|---------|----------|
| `id` | `conv_obsidian_1` |
| `perplexity_thread_url` | `https://www.perplexity.ai/search/...` |
| `app_name` | `Obsidian` |
| `message_count` | 24 |

---

## 6. Session Persistence & Refresh Logic

| Event | Detected by | Action |
|--------|--------------|--------|
| Cookies expired | Login watcher | Queue paused, dashboard alerted |
| CAPTCHA challenge | `captchaWatcher` | Pause + require manual completion |
| User clicks “Re-login” | Dashboard → WebSocket | Opens Chromium visible mode |
| New login success | `sessionManager` | Cookies updated in DB |
| Resumed ops | Worker resumes pending jobs |

---

## 7. Queue & Retry Logic

**Persistence:**  
Jobs written to SQLite on enqueue → ensures restart-safety.

**Fail Handling Hierarchy:**
```
on failure
└── if (retries < max)
      └─ status → retry_pending
└── else if CANNOT_RECOVER (captcha/login)
      └─ status → pending_session
└── else
      └─ status → failed
```

**Retry Parameters**
```
retry_attempts: 1
retry_delay_ms: 3000
```

---

## 8. Error Recovery Mechanisms

| Failure Type | Detection | Resolution |
|---------------|------------|-------------|
| Timeout | Playwright page inactivity | Retry job / flag as failed_timeout |
| CAPTCHA | iframe or `challenge-form` | Pause queue and notify dashboard |
| Login lost | redirect to `/login` | Pause jobs & open visible browser |
| JS Evaluation | DOM or selector not found | Retries with adjusted selectors |
| Network crash | Chromium closed | Restart browser context automatically |

---

## 9. Database Layer

- **Engine:** SQLite with WAL + foreign keys.  
- **Access Layer:** [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (synchronous, threadsafe).  
- **Backup rotation:** max 5 files every 12 hours.  
- Foreign keys enforced across all tables for clean cascades.  

---

## 10. Metrics & Monitoring

All components push metrics via the `/metrics` plugin.

**Metrics originate from:**
- QueueManager — job counters  
- Worker — uptime, retries  
- API — requests, response latency  
- SessionMonitor — session validity  

Prometheus visualization dashboard (`localhost:9090`) recommended if Docker Compose used.

---

## 11. Frontend Dashboard Architecture

**Technology:** React 18 + Vite + TypeScript.

| Section | Purpose |
|----------|----------|
| **/status** | Shows uptime, queue, memory usage |
| **/conversations** | View list of threads and message count |
| **/jobs** | Inspect recent task history |
| **/settings** | Edit configuration, toggle LAN mode |
| **/session** | Manual relogin & cookie view |

**Real-time updates:**  
WebSocket events:  
```
job_update, queue_stats, captcha_alert, session_expired, metrics_tick
```

Uses context provider to synchronize all UI states with Fastify backend.

---

## 12. Scalability Roadmap

Planned upgrades for v2:
1. Multiple concurrent browser pages (parallel queueing).  
2. Optional distributed job queue via `BullMQ`.  
3. Built-in SSE / WebSocket streaming support.  
4. Multi-user key isolation and quotas.  
5. External database support (PostgreSQL).  

---

**Revision:** October 26 2025  
**Maintainer:** Core Engineering — PARALLAX Project
```

***

Once you’ve saved this file, the next one will be **`ACTIONABLES.md`**, which documents the scraper pipeline rules, DOM-to-Markdown structure, and operational standards used by the Playwright worker.