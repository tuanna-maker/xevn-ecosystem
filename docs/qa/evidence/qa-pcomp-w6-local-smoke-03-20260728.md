# QA-PCOMP-W6-LOCAL-SMOKE-03 — L0/L2 local smoke (2026-07-28)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-PCOMP-W6-LOCAL-SMOKE-03` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **Host** | `http://127.0.0.1:5173` only (1B LOCAL) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `company_id=main` |
| **L0 entry** | `docs/qa/evidence/pcomp-w6-do-local-stack-02-20260728.md` |
| **Pack** | `docs/qa/evidence/pcomp-w6-qa-uat-prep-02-20260728.md` |
| **Locks** | **U65** zero-seed · **HOLD_DEPLOY** · NOT `:8088` · NOT `portal.xe.vn` · NOT Phase1/PROD |
| **Sponsor UAT-PASS** | **NOT claimed** — only sponsor marks `PCOMP-W6-SP-01` |

---

## 0. Verdict

| Gate | Result |
|------|--------|
| L0 GET `:28001` / `:28002` / `:5173` | **PASS** — HTTP **200** × 3 |
| `pnpm run qc:fe-be-health` | **PASS** exit **0** — ALL PASS |
| `pnpm run qc:dev-stack` probes | **PASS** (✓×3); process exit Windows UV abort noise (same as STACK-02) |
| Team L2 smoke (login → CC → HRM employees) | **PASS** — documented FE path |
| Sync ERROR / 409 load / 54321 | **None observed** |
| **Sponsor may start PCOMP-W6-SP-01** | **YES** |
| Phase1 / PROD / portal.xe.vn / sponsor UAT-PASS | **NOT claimed** |

---

## 1. L0 reconfirm (QA window ~08:57–09:00 UTC+7)

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:28001/api/hrm` | **200** |
| `GET http://127.0.0.1:28002/api/xbos` | **200** |
| `GET http://127.0.0.1:5173` | **200** |
| Listeners | `:28001` PID 30316 · `:28002` PID 15908 · `:5173` PID 28000 |
| `pnpm run qc:fe-be-health` | exit **0** — hrm/xbos/portal + login + employees/catalog direct + portal proxy |
| `node ./scripts/qc-dev-stack.mjs` | ✓ hrm / xbos / portal 200; then UV abort (ignore exit; trust probes + fe-be-health) |

**Seed:** not run (U65). **Deploy / :8088 / portal.xe.vn:** not touched (HOLD_DEPLOY).

---

## 2. Method (evidence integrity)

| Layer | How | U65 |
|-------|-----|-----|
| L0 / L1 | Health + `qc:fe-be-health` | No seed |
| L2 smoke | Documented FE path: portal login API → SPA shell routes → portal-proxy HRM employees + catalog-sync | No seed |
| Browser DOM click | **Not available** (no Playwright / browser MCP in agent session) — does **not** replace sponsor click on `PCOMP-W6-SP-01` | — |
| Mutate | None | Honored |

SoT root used: `C:\xevn-ecosystem`.

---

## 3. L2 smoke — login → Command Center → HRM employees

### 3a. Auth (P-CC-01 analogue)

| Check | Result |
|-------|--------|
| `POST /api/xbos/auth/login` (`ceo@xe.vn`) | **201** `XBOS-AUTH-200` |
| `expiresInSec` | **86400** |
| JWT `company_id` | **main** |

### 3b. SPA shell (load path)

| Route | HTTP | `#root` | Sync ERROR | 54321 | 409 |
|-------|------|---------|------------|-------|-----|
| `/login` | **200** | yes | no | no | no |
| `/command-center` | **200** | yes | no | no | no |
| `/command-center/hrm/employees` | **200** | yes | no | no | no |

### 3c. Embed data plane (P-CC-03 load — no Sync ERROR / 409)

| Call | HTTP | Code | Notes |
|------|------|------|-------|
| Portal proxy `GET /api/hrm/employees?page_size=5&company_id=main` | **200** | `HRM-EMP-200` | `total=1109`; no scope 409 |
| Portal proxy `GET /api/hrm/catalog-sync` | **200** | `HRM-SYNC-202` | catalogs listed; no Sync ERROR class |
| Direct `GET :28001/api/hrm/employees?…company_id=main` | **200** | `HRM-EMP-200` | matches proxy |

**Smoke verdict:** **PASS** — stack + login + one HRM embed tab path ready for sponsor FE click.

---

## 4. Explicit gate — Sponsor may start

| Question | Answer |
|----------|--------|
| **Sponsor may start PCOMP-W6-SP-01:** | **YES** |
| Reason | L0 green (200×3 + `qc:fe-be-health` exit 0) + team L2 smoke PASS on employees embed path |
| Pack for sponsor checklist | `docs/qa/evidence/pcomp-w6-qa-uat-prep-02-20260728.md` §3 (P-CC-01..09 + J-HRM-01..07) |
| Team claim of sponsor UAT-PASS | **NO** — sponsor owns `PCOMP-W6-SP-01` |

---

## 5. Residual / honesty

1. **No Playwright** — SPA shell 200 + authenticated proxy APIs prove load path; sponsor still owns visual UF (banner/toast/DOM).
2. **Full P-CC-01..09 + J-HRM-01..07** not re-executed in this smoke (scope = L0 + one HRM tab). Sponsor pack checklist remains the click matrix.
3. `qc:dev-stack` Windows UV abort after healthy print — known noise; trust probe lines + fe-be-health.
4. Do **not** restart `dev:hrm-api` / nest-watch during sponsor session (freeze `dist-uat-w6`).

---

## 6. Locks honored

| Lock | Status |
|------|--------|
| U65 zero-seed | **Honored** |
| HOLD_DEPLOY | **Honored** |
| LOCAL ONLY | **Honored** (`127.0.0.1:5173`) |
| NOT Phase1 / PROD | **Honored** |
| NOT sponsor UAT-PASS | **Honored** |

---

## 7. Handoff

```text
completion_report: |
  QA-PCOMP-W6-LOCAL-SMOKE-03 PASS. L0 reconfirm 200×3; qc:fe-be-health exit 0.
  Documented FE path: login ceo@xe.vn → /command-center → /command-center/hrm/employees
  (SPA 200 + proxy employees/catalog 200, no Sync ERROR / 409 / 54321).
  Sponsor may start PCOMP-W6-SP-01: YES.
  NOT sponsor UAT-PASS · NOT Phase1/PROD · HOLD_DEPLOY · U65.
next_owner: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-pcomp-w6-local-smoke-03-20260728.md
```
