Here’s the next and final key file from the core documentation set.

***

### Filename: `PRD.md`

```markdown
# PARALLAX — Product Requirements Document (v1)

This document defines the **functional, non-functional, and deployment requirements** for the PARALLAX Local API Bridge for Perplexity.ai.  
Every engineering, QA, and operations effort must comply with this baseline.

---

## 1. Product Vision

Enable users to leverage Perplexity’s intelligence **locally**, through an **API-compatible, session-based automation bridge** that uses the user’s browser login securely instead of an external key or cloud gateway.

Goals:
- 100% self-contained operation.
- GUI dashboard for runtime visibility.
- Completely transparent local data storage.
- Reproducible Dockerized deployment.

---

## 2. Functional Requirements

### 2.1 Core Modules
| Module | Functionality | Deliverable |
|--------|----------------|-------------|
| **API Layer** | Provide `/v1/generate`, `/v1/status`, `/metrics` endpoints | Fastify-based server |
| **Queue System** | Accept client requests and serialize execution | Persistent FIFO manager |
| **Worker Layer** | Execute Playwright-controlled browser automation | Headless Chromium controller |
| **Session Manager** | Maintain cookie/session persistence | SQLite cookie store & relogin triggers |
| **Dashboard** | Show real-time session/job state | React/Vite SPA with WS updates |
| **CLI** | Manage start/login/key generation | Node CLI binary |
| **Metrics Engine** | Export runtime stats | Prometheus-compatible endpoint |
| **Security Suite** | API key + LAN whitelist + file encryption | Integrated configuration & key store |

---

## 3. User Roles

| Role | Description | Access Scope |
|------|--------------|--------------|
| **Owner / Admin** | System operator controlling dashboard & API keys | All modules |
| **Client Integrations** | Apps (Obsidian, n8n, etc.) calling the bridge | `/v1/generate` endpoint with valid key |
| **Monitor Service** | Optional Prometheus node fetching metrics | `/metrics` only (read-only) |

---

## 4. Workflow Overview

1. User installs and configures PARALLAX (`config.yml`).  
2. Starts the bridge via CLI (`bridge start`).  
3. Browser launched once for login; cookies saved securely.  
4. API receives prompts → queued and sent sequentially.  
5. Worker submits queries to Perplexity, captures responses.  
6. Outputs Markdown results with citations via REST.  
7. Dashboard shows live job state, logs, and session status.  
8. Optional: metrics collected at `/metrics`.

---

## 5. API Specifications

### 5.1 `/v1/generate`
Request:
```
{
  "prompt": "Explain the difference between GPT and BERT",
  "conversation_id": "notebase_1"
}
```

Response:
```
{
  "conversation_id": "notebase_1",
  "response_markdown": "# GPT vs BERT\nGPT = Autoregressive; BERT = Bidirectional...",
  "sources": [
    {"title": "OpenAI Blog", "url": "https://openai.com/"},
    {"title": "Wikipedia", "url": "https://en.wikipedia.org/wiki/BERT_(language_model)"}
  ]
}
```

Status Codes:
- `200 OK` – success  
- `400 Bad Request` – missing prompt  
- `401 Unauthorized` – invalid API key  
- `500 Internal Error` – scraping exception or timeout  

### 5.2 `/v1/status`
- Returns worker, queue, and database health in JSON.  
- Example:  
```
{ "worker_running": true, "queued_jobs": 2, "uptime_seconds": 3600 }
```

### 5.3 `/metrics`
- Exposes counters, gauges, and histograms per `metrics_spec.md`.  
- Format: Prometheus text/plain exposition.

---

## 6. Non-Functional Requirements

| Category | Specification |
|-----------|----------------|
| **Performance** | Response < 12 s avg (under 1 prompt queue). |
| **Concurrency** | Single-threaded queue (v1) with safe parallel v2 expansion. |
| **Security** | AES-256 session encryption if key provided; API keys hashed. |
| **Reliability** | Auto resume jobs after restart (persisted queue). |
| **Maintainability** | Modules isolated with minimal cross-dependencies. |
| **Portability** | Builds and runs under Node 22+, Docker, Linux/macOS/WSL2. |
| **Observability** | Log rotation + metrics + dashboard visualization. |
| **Scalability** | Designed for v2 multi-instance extension. |

---

## 7. Database Definitions

| Table | Key Columns | Purpose |
|--------|--------------|----------|
| `api_keys` | `id`, `key_hash`, `name` | Authentication |
| `sessions` | `id`, `cookies_json`, `expires_at` | Browser login persistence |
| `conversations` | `id`, `perplexity_thread_url`, `message_count` | Context history |
| `messages` | `id`, `conversation_id`, `role`, `content` | Chat history |
| `jobs` | `id`, `prompt`, `status`, `result_json` | Automation queue |
| `metadata` | `key`, `value` | Global info, version |

Refer to `schema.sql` for details.

---

## 8. Dashboard Requirements

### UI Sections
| Section | Function |
|----------|-----------|
| **Status** | Show queue length, session validity, uptime |
| **Conversations** | Loaded from `conversations` table |
| **Logs** | Stream live Pino logs |
| **Settings** | Change theme, toggle LAN access |
| **Login Relief** | Opens new Chromium window for reauthentication |

### UX Requirements
- Update every 10 s via polling and on WebSocket ticks.  
- Persistent theme & layout (dark/light).  
- Mobile-friendly (min width 360 px).

---

## 9. CLI Requirements

Commands:
```
bridge start
bridge login
bridge generate-key [name]
bridge status
```

### Behavior
- `bridge login` opens Chromium for cookie capture.  
- `bridge start` launches full API + Worker backend.  
- `bridge status` pings `/v1/status`.  
- `bridge generate-key` creates DB API key and copies to clipboard.

---

## 10. Error & Recovery Logic

| Error | Trigger | Response |
|--------|----------|-----------|
| **CAPTCHA Detection** | DOM contains `iframe[src*='captcha']` | Pause queue + dashboard alert |
| **Session Expired** | Redirect to `/login` | Set `pending_session` flag |
| **Timeout** | Page wait exceeds threshold | Retry 1× then mark `failed_timeout` |
| **Critical Failure** | Chromium crash | Restart worker automatically |
| **DB Lock** | SQLite busy | Wait 1000 ms + retry 3× |
| **Validation** | Missing prompt/invalid JSON | Return 400 |

---

## 11. Security & Compliance (summary)
See full `SECURITY.md`.

- Localhost‑only by default.  
- All API keys stored as hashes.  
- No sensitive data sent to Perplexity other than query text.  
- No telemetry or hidden network calls.  
- Session cookies encrypted if env `BRIDGE_SECRET_KEY` provided.  

---

## 12. Metrics & Logging

| Metric | Description |
|---------|--------------|
| `bridge_jobs_total` | Total completed/failed jobs |
| `bridge_worker_uptime_seconds` | Worker lifetime |
| `bridge_queue_length` | Pending jobs count |
| `bridge_session_valid` | Session health flag |
| `bridge_captcha_detected_total` | Count of CAPTCHA events |

Logs:
- Pino JSON or pretty mode.
- Retained 5 files, each ≤ 10 MB.  
- All sensitive info masked.

---

## 13. Release Targets

| Deliverable | Timeline | Owner |
|--------------|-----------|-------|
| Initial prototype | Week 1 | Backend Agent |
| Dashboard skeleton | Week 2 | Frontend Agent |
| Complete E2E pipeline | Week 3 | Full Developer Agent |
| Docker packaging | Week 4 | Dev Ops Agent |
| Docs & tests finalization | Week 5 | Project Lead |

---

## 14. Acceptance Testing

| Test Case | Success Criteria |
|------------|-----------------|
| `/v1/generate` with valid key | Returns Markdown within < 15 s |
| CAPTCHA event | Queue paused + dashboard alerts |
| Invalid API key | Returns 401 |
| Browser login refreshed | Session revalidated |
| Network failure | Job retries once & logs failure |
| `/metrics` | Exposes ≥ 8 counters successfully |

---

## 15. Deliverables

1. Node TypeScript backend  
2. React+Vite dashboard  
3. Dockerfile + compose  
4. 15 documentation/config files  
5. Playwright‑ready Chromium setup  
6. 90% Jest coverage  
7. Screenshots + artifact handling  
8. Encrypted DB session management  

---

**Version:** 1.0 – October 2025  
**Maintainer:** Core Product Design — PARALLAX
```

***
