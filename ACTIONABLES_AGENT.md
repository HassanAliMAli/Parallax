# ACTIONABLES_AGENT — Coding Agent Milestone Plan (v1)

This file specifies milestone sequence, module dependencies, and validation steps for any AI or human agent assigned to implement the PARALLAX project.

---

## 1. Milestone Roadmap

| Milestone | Description | Output |
|-----------|-------------|--------|
| **M1** | Repo & TS init; config; DB setup | Ready-to-run Fastify skeleton, `schema.sql`, lint passing |
| **M2** | Queue + persistent jobs; session model; CLI skeleton | FIFO queue + `cli.ts` interface |
| **M3** | Worker integration; Playwright login/auth logic | Browser automation, cookies, DOM proof |
| **M4** | Scraper core; HTML→Markdown; citation extraction | Test suite for Markdown output |
| **M5** | API endpoints: `/v1/generate`, `/v1/status`, `/metrics` | End-to-end input/output test |
| **M6** | Dashboard SPA (React+Vite+WS socket) | Status board, relogin, logs UI |
| **M7** | Metrics, Prometheus, logging polish | `/metrics`, log rotation, env implements |
| **M8** | Docker+pkg packaging, doc refresh, test coverage | One-command deployable artifact |

---

## 2. Coding Rules

- Use only tools and NPM dependencies specified in README and PRD.
- All configs in `config.yml` (do not hardcode constants in runtime files).
- All environment variables listed in `README.md`.
- Every DB migration must be idempotent (may run multiple times safely).
- Use **TypeScript strict mode** everywhere.
- Inline JSDoc for every public function and class.
- Automated tests before each milestone is marked complete.

---

## 3. Acceptance Criteria (per milestone)

Each PR or merge must:
- Pass `npm run lint` and `npm test` for all new files.
- Include at least one end-to-end demo script under `tests/fixtures`.
- All error flows accounted for: login expired, network down, CAPTCHA detected.
- Functional dashboard for manual job and session inspection.
- Prometheus `/metrics` endpoint returns at least five counters on successful boot.
- `Dockerfile` and `docker-compose.yml` boot without manual tweaking.

---

## 4. Documentation & Onboarding

Each module directory (**src/server**, **src/worker**, etc) must have its own readable `README.md` describing:
- Exported types/interfaces
- What to extend or plug in for v2 (extensibility notes)
- Fast reference on running unit tests

---

## 5. Next Steps for Agent

1. Initialize repo from this manifest and boostrap dependencies.
2. Validate schema creation via provided migration script.
3. Implement each milestone in strict order, do not skip.
4. Commit only after CI coverage > 90%.
5. Ping owner after full end-to-end API cycle is verifiably working.

---

**Project: PARALLAX**  
**Agent: [Fill by orchestration controller]**  
**Revision:** 2025-10-26  
