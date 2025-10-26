Here’s the third file you should create.

***

### Filename: `metrics_spec.md`

```markdown
# PARALLAX Metrics Specification (v1)

This document defines all metrics exposed at the `/metrics` endpoint in Prometheus format.  
The API and worker processes update these values automatically through the internal metrics module.

---

## Overview

Metrics are served at:

```
GET /metrics
Content‑Type: text/plain; version=0.0.4
```

These values are designed for monitoring through **Prometheus**, **Grafana**, or any tool compatible with the Prometheus exposition format.

All counters are cumulative unless otherwise noted.

---

## Metrics Catalogue

### 1. Job Processing Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `bridge_jobs_total` | **counter** | Total number of jobs processed by the worker. Includes completed, failed, timeout, captcha-blocked. |
| `bridge_jobs_total{status="completed"}` | **counter** | Successful job completions. |
| `bridge_jobs_total{status="failed"}` | **counter** | Jobs that failed permanently. |
| `bridge_jobs_total{status="failed_timeout"}` | **counter** | Jobs that exceeded the timeout (default 180 s). |
| `bridge_jobs_total{status="failed_captcha"}` | **counter** | Jobs halted because of CAPTCHA detection. |
| `bridge_jobs_total{status="pending_session"}` | **counter** | Jobs paused due to invalid or expired login session. |

**Update points**
- Incremented in the worker right after a job transitions to a terminal state.
- Failure types use label assignments according to `status`.

---

### 2. Queue Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `bridge_queue_length` | **gauge** | Number of jobs waiting in the queue at runtime. |
| `bridge_queue_active` | **gauge** | 1 when worker active, 0 when idle. |
| `bridge_queue_last_job_seconds` | **gauge** | Elapsed seconds since the last job processed. |

**Update points**
- Updated on every enqueue/dequeue event.
- Exported directly by QueueManager module.

---

### 3. Worker Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `bridge_worker_uptime_seconds` | **counter** | Running time of the worker process since last launch. |
| `bridge_worker_restart_total` | **counter** | Number of times the browser worker was restarted. |
| `bridge_worker_active_threads` | **gauge** | Number of simultaneous threads/pages (fixed = 1 in v1). |

---

### 4. Session & CAPTCHA Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `bridge_session_valid` | **gauge** | 1 when logged in, 0 when session expired. |
| `bridge_session_refresh_total` | **counter** | Number of times a manual re‑authentication occurred. |
| `bridge_captcha_detected_total` | **counter** | CAPTCHAs detected over lifetime. |
| `bridge_captcha_solved_total` | **counter** | Count of CAPTCHAs successfully solved by user. |

**Update points**
- Emitted by the SessionMonitor observer.
- CAPTCHA counters are raised upon detection and resolution events.

---

### 5. API Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `bridge_http_requests_total` | **counter** | Total HTTP requests handled by the Fastify API. |
| `bridge_http_requests_duration_ms` | **histogram** | Latency histogram for request processing time. |
| `bridge_http_request_errors_total` | **counter** | Count of requests returning 4xx or 5xx status codes. |

**Default histogram buckets:**  
`[5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]` milliseconds.

---

### 6. Database Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `bridge_db_connection_count` | **gauge** | Active SQLite connections. |
| `bridge_db_query_duration_ms` | **histogram** | Query execution time distribution. |
| `bridge_db_write_failures_total` | **counter** | Number of failed write attempts. |

---

### Example Output

```
# HELP bridge_jobs_total Total jobs processed
# TYPE bridge_jobs_total counter
bridge_jobs_total{status="completed"} 42
bridge_jobs_total{status="failed"} 3
bridge_jobs_total{status="failed_timeout"} 1

# HELP bridge_queue_length Current queued jobs
# TYPE bridge_queue_length gauge
bridge_queue_length 2

# HELP bridge_worker_uptime_seconds Uptime of worker
# TYPE bridge_worker_uptime_seconds counter
bridge_worker_uptime_seconds 3700
```

---

### Implementation Notes
- Metrics module registered as a Fastify plugin via `/src/server/plugins/metrics.ts`.
- Cached values updated through events from QueueManager, Worker, and SessionMonitor.
- Output conforms strictly to Prometheus v0.0.4 format.
- Safe for HTTP GET polling every 15 s.

---
