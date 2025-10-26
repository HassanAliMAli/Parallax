Here’s the next file in the series.

***

### Filename: `SECURITY.md`

```markdown
# PARALLAX Security Specification (v1)

This file documents all security as well as privacy measures implemented within the PARALLAX local bridge.  
The system is designed with a *local-first privacy model*, minimal external connections, and strict session handling to maintain user control.

---

## 1. Design Principles

- **Local-First Privacy:** All data, cookies, and conversation content remain on your local machine.  
- **Least-Privilege Architecture:** Each component (API, worker, dashboard) has minimal execution rights and isolated storage scope.  
- **Explicit LAN Opt-In:** No external access is allowed by default. User must explicitly enable LAN binding in `config.yml`.  
- **No Cloud Sync or Third-Party Telemetry.**  
- **User-Controlled Session Lifecycle:** You decide when to log in or expire a session.  
- **Fail-Safe Defaults:** All errors (network, cookies, auth) cause job pauses — never background resubmission.  

---

## 2. API Access Control

### Authentication
- All endpoints require an API key unless `require_api_key: false` in config.  
- Keys are validated using SHA256 hash comparison stored in `api_keys` table.  
- Keys can be generated via CLI (`bridge generate-key --name <client>`).  

**Request Authentication Example**
```
Authorization: Bearer bridge_123abc456
# or
X-API-Key: bridge_123abc456
```

### Key Storage
- API keys are stored in SQLite with hashed values only (`key_hash`), not plaintext.  
- Displayed once upon creation and optionally written to `data/api-key.txt`.  

### Rate Limiting
- Optional per-key limit configurable in `config.yml`.  
- Controlled via in-memory counters (No external Redis dependency).

---

## 3. Session Security

| Aspect | Description |
|--------|-------------|
| **Cookies JSON** | Stored in DB (`sessions.cookies_json`), encrypted with AES-256 if encryption key provided via env var `BRIDGE_SECRET_KEY`. |
| **Auto-Logout Detection** | Worker watches for Perplexity UI elements like `.login-button` or redirects to `/login`. |
| **Manual Re-Auth Flow** | Dashboard issue alert → user clicks “Re-login” → visible browser session opened → cookies recaptured & saved. |
| **Session Scope** | Single browser profile per installation. No multilogin or sharing allowed. |

A session record stays marked `valid=1` until token or cookie expiration time (`expires_at`).
Expired or invalidated session triggers state `pending_session` in queue and halts job processing.

---

## 4. LAN Mode and Firewall Policy

**`lan_enabled: false`** blocks external connections entirely (127.0.0.1 only).  

When `lan_enabled: true`:
1. The API binds to `0.0.0.0`.  
2. Requests without a valid API key are denied (401).  
3. Optional whitelist `allowed_ips` enforced at request-level middleware.  

LAN should be paired with internal firewall rule such as:
```
ufw allow from 192.168.0.0/24 to any port 3000 proto tcp
```

---

## 5. Data Security & Logging

**Data Access**
- All DB operations routed through the `db` module which sanitizes input (no raw string interpolation).  
- DB file stored under `./data/perplex_bridge.db` with 600 permissions (`chmod 600`).  

**Logging**
- Logs use [Pino](https://github.com/pinojs/pino) JSON mode (or `pino-pretty` if specified).  
- Sensitive data like cookies, session URLs, or API keys are masked in logs.  
  Example masked output:
  ```
  [info] Session refreshed for: *****@gmail.com
  [warn] CAPTCHA detected — user action required
  ```

**File Locations**
```
./data/logs/bridge.log          # rolling log (10MB x 5)
./data/artifacts/               # optional screenshots/html dumps
```

---

## 6. Browser Security Practices

- The Playwright worker launches Chromium with user data isolation.  
- Disables:
  - `--remote-debugging-port`
  - `--disable-web-security` (paranoid by default)
- Uses a clean Chromium binary; no extensions, no devtools runtime injection.

**Persistence Mode**
- Cookies loaded and applied at startup.
- After login, system replaces saved cookies only after explicit “Done Logging In” confirmation.

---

## 7. Encryption & Secrets Management

| Secret | Description | Source |
|--------|--------------|--------|
| `BRIDGE_SECRET_KEY` | AES-256 key for encrypting `sessions.cookies_json`. | Environment variable |
| `BRIDGE_CONFIG_PATH` | Override for config file location. | Environment variable |
| `BRIDGE_LOG_LEVEL` | Overrides default from config file. | Environment variable |

All secrets read using Node.js `process.env` and must **never** be hardcoded in source files.

---

## 8. Dashboard Authentication (Optional)

The dashboard is **read-only** by default and open locally (`http://127.0.0.1:3000/dashboard`).  
You may enforce authentication via:
```
dashboard:
  auth_required: true
```

When enabled:
- Randomly generated admin password stored in `data/dashboard_auth.json`.
- Logout via `/v1/logout` clears session immediately.

---

## 9. Exported Data & Privacy

- Exports (`/v1/export`) generate local `.json` or `.md` files only.  
- No external sync, cloud push, or analytics calls.  
- Exported content never contains cookies or API keys.  

---

## 10. Common Hardening Best Practices

1. Run bridge executable or Docker container under non-root user.  
2. Use `lan_enabled: false` when unnecessary.  
3. Enable `backups_enabled` for the database.  
4. Restrict access to `data` directory (`chmod -R 700 data`).  
5. Keep Playwright and Chromium updated (`npx playwright install chromium`).  
6. Verify logs for “SESSION EXPIRED” or “CAPTCHA DETECTED” warnings daily.  

---

## 11. Future Security Enhancements (v2+)

- JWT-based multi-user system.  
- Dashboard-based API key rotation & expiry scheduler.  
- Optional 2FA for CLI logins.  
- Audit log streaming to file or syslog.  
- WebSocket encryption using local SSL certificates (mkcert).  

---

**Revision:** 2025-10-26  
**Maintainer:** Security Lead — PARALLAX Project
```

***
