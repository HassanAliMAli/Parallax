Here’s the next file — the most important one for guiding any AI or developer agent.

***

### Filename: `MASTER_PROMPT.md`

```markdown
# MASTER_PROMPT — AI Development Directive for PARALLAX (v1)

This document serves as the **ultimate build instruction file** for AI coding agents or human developers executing the PARALLAX project autonomously.  
It provides high-level policies, module-by-module instructions, API specifications, and success evaluation criteria.

---

## 1. Project Objective

Design and deploy a fully functional **local API bridge** for [Perplexity.ai](https://www.perplexity.ai) using browser automation (Playwright) instead of the paid API.  

**Goal:**  
Expose a local OpenAI-compatible REST interface (`/v1/generate`, `/v1/conversations`) that interacts privately with Perplexity, processes Markdown output, and provides citation‑rich responses.

---

## 2. Core Directives

1. **Follow 1:1 compliance** with design and architecture specified in:
   - `README.md`
   - `architecture.md`
   - `PRD.md`
   - `ACTIONABLES.md`
   - `SECURITY.md`
2. **No external AI inference APIs** allowed.
3. **All logic must be local** — including session persistence and scraping.
4. **Worker must never leak user data** via network logs or telemetry.
5. **Modular coding** — each subsystem (worker/server/dashboard) must run and test independently.

---

## 3. Implementation Hierarchy

1. **Bootstrap environment**
   - `npm init -y && npm install fastify playwright better-sqlite3 pino`
   - Create `/src` as root code directory.
   - Load config from `config.yml`.

2. **Build API layer**
   - Endpoints:
     - `/v1/generate` → Accepts `{ prompt, conversation_id }`.
     - `/v1/status` → Returns worker state, uptime, queue.
     - `/metrics` → Prometheus metrics stream.
   - Include middleware for:
     - Authentication (validate API key hash).
     - Rate limit (if enabled).
     - CORS.

3. **Implement Queue Manager**
   - Maintain in-memory + DB queue sync (table: `jobs`).
   - Use event emitter pattern to communicate job dispatch to Playwright Worker.
   - Create `JobQueue` class with:
     ```
     enqueue(job): string
     dequeue(): Job | null
     stats(): {queued, running, completed}
     ```

4. **Develop Worker Subsystem**
   - Implements Playwright Chromium controller.
   - Loads cookies from DB and launches one persistent page.
   - Behavioral rules defined in `ACTIONABLES.md`.
   - Error recovery: CAPTCHA, timeout, relogin.
   - Writes result to DB and logs to file.

5. **Scrape and Convert**
   - Query DOM, wait until response visibility stable.
   - Extract citations and convert DOM → Markdown via Turndown.
   - Normalize sources to `[{title,url}]`.
   - Pass structured payload back through queue to API.

6. **Implement Dashboard SPA**
   - Must visualize:
     - Job Queue
     - Worker Status
     - Session State
     - Logs & Errors
   - Real-time WS events: `job_update`, `captcha_detected`, `session_expired`.

7. **Add CLI Tools**
   - Commands: `start`, `status`, `login`, `generate-key`.
   - Reuse sample code in `CLI.ts`.

8. **Write Tests**
   - Include end-to-end test in `tests/example.test.ts`.
   - Validate DB structure, API uptime, results format.

---

## 4. Required Data Contracts

### Request (OpenAI-compatible)
```
{
  "prompt": "Explain reinforcement learning",
  "conversation_id": "test_thread_01"
}
```

### Response
```
{
  "conversation_id": "test_thread_01",
  "response_markdown": "## Reinforcement Learning\nReinforcement learning...",
  "sources": [
    {"title": "DeepMind Blog", "url": "https://deepmind.com/"},
    {"title": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Reinforcement_learning"}
  ]
}
```

---

## 5. Coding Conventions & Quality Gates

| Standard | Enforcement |
|-----------|-------------|
| TypeScript strict mode | Mandatory |
| Linting | ESLint + Prettier |
| Commits | Conventional Commits |
| Testing | Jest or Vitest; 90% coverage minimum |
| Code style | Functional, minimal side effects |
| Error handling | Try/catch with descriptive logs |
| Security | No plaintext secrets; config YAML only |
| Logging | `pino` JSON logs for machine analysis |

All modules must load configuration from `config.yml` and must not rely on speculative defaults.

---

## 6. Success Evaluation Criteria

| Area | Definition of “Complete” |
|-------|---------------------------|
| Launch | `npm start` boots API + Worker without error |
| API | Returns Markdown text and JSON structure |
| Dashboard | Receives live metrics and session alerts |
| Worker | Handles CAPTCHA/login/timeouts gracefully |
| Queue | Automatically retries failed jobs |
| Security | LAN access disabled by default |
| Metrics | 10+ counters exposed in `/metrics` stream |
| Packaging | `docker-compose up` launches full stack |
| Documentation | 15 files total, all complete & verified |

---

## 7. Versioning & Future Guidance

| Version | Focus |
|----------|--------|
| v1.0 | Local single‑worker release |
| v1.1 | Streamed live responses |
| v2.0 | Multi‑browser concurrency + cloud DB option |
| v3.0 | Full user multi‑tenant portal |

---

## 8. Warnings for Automation Systems

- Never retry logins automatically — only open browser visible mode.  
- Do not bypass Perplexity verification checks (CAPTCHA/manual login only).  
- Keep browser context persistent between jobs.  
- Shutdown Chromium cleanly between restarts — avoid ghost processes.  
- Disallow external fetches except Perplexity endpoints.

---

## 9. Environment Variables List

| Variable | Purpose |
|-----------|----------|
| `BRIDGE_SECRET_KEY` | Encrypts cookies in DB |
| `BRIDGE_CONFIG_PATH` | Custom config path override |
| `NODE_ENV` | `development` or `production` |
| `PLAYWRIGHT_BROWSERS_PATH` | Shared Chromium cache path |
| `BRIDGE_LOG_LEVEL` | Overrides config logging level |
| `BRIDGE_API_KEY` | (Optional) Hardcoded local test key |

---

## 10. Completion Criteria for AI Agents

Before finishing execution, ensure the following are true:
1. All tests pass with `npm test`.
2. Manual login flow validated successfully.
3. Dashboard accessible locally via `localhost:3000/dashboard`.
4. Perplexity scraping works non‑interactively once logged in.
5. `bridge generate-key` produces working authentication tokens.
6. API complies with OpenAI schema pattern (`prompt` → `response_markdown`).
7. Docker image builds < 1.5 GB and passes healthcheck.

---

**End of MASTER_PROMPT.md**  
**Created:** October 26 2025  
**Maintainer:** PARALLAX Automation Lead Team
```

***
