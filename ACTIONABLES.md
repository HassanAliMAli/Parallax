Here’s the next file.

***

### Filename: `ACTIONABLES.md`

```markdown
# ACTIONABLES — Scraper & Automation Rules (v1)

This document outlines the structured operational logic, DOM scraping rules, timeout behavior, and content transformation pipeline for the PARALLAX Playwright Worker.

---

## 1. Playwright Worker Responsibilities

| Function | Description |
|-----------|-------------|
| Load session cookies | Reads cookies from SQLite or local JSON |
| Navigate to thread URL | Reuses last open thread for that app |
| Submit query prompt | Inserts user message → sends “Enter” |
| Wait for Perplexity response | Observes new DOM nodes until stable |
| Scrape answer HTML | Extracts Markdown-ready content |
| Convert HTML → Markdown | Handles formatting, links, citations |
| Save result | Writes to DB and returns as job result |

---

## 2. Core Workflow

```
Job Received
│
├─▶ Validate session cookies
│
├─▶ Navigate to stored thread (or new one)
│
├─▶ Input prompt into search box
│
├─▶ Wait for new response block
│     ├─ poll DOM ".answer > div"
│     └─ timeout = 180s
│
├─▶ Extract HTML, clean DOM, build Markdown
│
├─▶ Capture citations & sources
│
└─▶ Update database → Return JSON result
```

---

## 3. Query Submission Logic

**Primary selectors:**
```
inputSelector = "textarea[placeholder*='Ask anything'], input[data-testid='query']";
sendButtonSelector = "button[aria-label='Send'], button[type='submit']";
```

**Fallback:**
- If the text area is detached after navigation, reload thread URL.  
- If button missing, use keyboard: `page.keyboard.press("Enter")`.

Job timeout enforced via `Promise.race` between reply observer and global timeout.

---

## 4. HTML → Markdown Conversion

### General Rules:

| Element | Conversion |
|----------|-------------|
| `<h1>–<h6>` | `#`, `##`, etc. |
| `<p>` | Plain text line with double newline separator |
| `<strong>` | `**text**` |
| `<em>` | `_text_` |
| `<blockquote>` | `> text` |
| `<code>` | Inline: `` `snippet` ``, Block: triple‐backticks |
| `<ul><li>` | `- item` |
| `<ol><li>` | `1. item` (auto numbering) |
| `<a href>` | `[text](url)` |
| `<img>` | `![alt](src)` |
| `<table>` | Markdown table with `| col |` formatting |

Implementation uses the lightweight library [`turndown`](https://github.com/mixmark-io/turndown) for HTML-to-Markdown conversion with custom rules for citation blocks and code formatting.

---

## 5. Citation & Source Extraction

### Target Selectors
```
".source-item a",
".citation-container a",
"footer a[href*='http']"
```

### Extraction Schema
```
[
  { "title": "Stanford Encyclopedia", "url": "https://plato.stanford.edu/entries/qt-entangle/" },
  { "title": "Wikipedia", "url": "https://en.wikipedia.org/wiki/Quantum_entanglement" }
]
```

These are embedded into `sources_json` for each message in DB.

---

## 6. Content Cleaning

**Remove from HTML prior to conversion:**
- Scripts & style tags  
- `div.share-buttons`, `svg`, `button`  
- Hidden/ARIA-off elements  

Italic/emoji tags preserved. URLs auto-expanded if truncated (via `page.evaluate()`).

---

## 7. CAPTCHA & Error Handling Rules

| Event | Detection | Response |
|--------|------------|----------|
| CAPTCHA visible | `iframe[src*='captcha']` | Pause all jobs, call dashboard alert |
| Login expired | Redirection to `/login` | Worker flag → `pending_session` |
| DOM stall | No new nodes after 15 s | Retry once, otherwise `failed_timeout` |
| JavaScript error | `pageerror` event | Retry job or log diagnostic artifact |

Each serious job failure triggers:
1. Screenshot → `data/artifacts/failed_<timestamp>.png`  
2. HTML dump → `data/artifacts/failed_<timestamp>.html`  
3. Log entry via Pino  

---

## 8. Markdown Post-Processing Pipeline

Steps performed after initial conversion:

| Stage | Description |
|--------|-------------|
| Trim whitespace | Remove leading/trailing line breaks |
| Normalize line endings | Converts CRLF → LF |
| Remove duplicate sources | Unique URLs only |
| Final validation | Ensures Markdown > 100 chars before commit |

If Markdown too short or blank → triggers “requeue” once.

---

## 9. Job Output Structure

```
{
  "conversation_id": "conv_obsidian_1",
  "response_markdown": "# Quantum Entanglement\nQuantum entanglement...",
  "sources": [{"title":"Wikipedia","url":"https://..."}],
  "screenshot_path": "./data/artifacts/20251026_121122.png",
  "runtime_ms": 8042
}
```

---

## 10. Logging Standards

- All worker output tagged as:
  ```
  [worker] INFO: Job completed in 8.0s
  [worker] WARN: CAPTCHA detected
  [worker] ERROR: Timeout while awaiting response
  ```
- Metrics counters updated accordingly.  
- Job runtime measured in milliseconds for `/metrics`.

---

## 11. Performance Targets

| Metric | Goal |
|---------|------|
| Job median duration | ≤ 12 seconds |
| Browser restarts | ≤ 1 per hour |
| Memory footprint | ≤ 250 MB avg |
| Markdown structural accuracy | ≥ 95% |
| Successful conversions (non-empty) | ≥ 99% |

---

**Revision:** 2025‑10‑26  
**Maintainers:** Worker Automation Team — PARALLAX
```

***

Once you’ve created this file, we’ll move on to **`ACTIONABLES_AGENT.md`**, which documents the coding agent’s development milestones and implementation order.