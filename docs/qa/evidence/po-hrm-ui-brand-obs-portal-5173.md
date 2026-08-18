# OBS-PORTAL-5173 — Portal `:5173` restore (ops residual)

| Field | Value |
|-------|--------|
| **work_item_id** | `OBS-PORTAL-5173` |
| **from_role** | devops |
| **to_role** | pm |
| **priority** | P2 |
| **lane** | execution (ops health only) |
| **date** | 2026-08-05 |
| **ack_status** | **PASS_TO_PM** |
| **related_qc** | `docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md` (GWC condition ENV portal late ATT) |

## Scope lock

- Restored **local** Unified Portal Vite on `:5173` only.
- Did **not** reopen brand remaster FE.
- Did **not** claim remaster DONE · Attendance CLOSED · Face LIVE · product GO.
- No seed.

---

## 1) Diagnosis

| Check | Result |
|-------|--------|
| `Get-NetTCPConnection -LocalPort 5173` (pre) | **No LISTEN** — process missing |
| `http://127.0.0.1:5173/` (pre) | **ECONNREFUSED** / Unable to connect |
| `http://127.0.0.1:8080/` (pre) | **200** — `hrm_fe` (`vite_react_shadcn_ts`) still up (PID 18884) |
| Wrong port? | No — `apps/web/web-portal/vite.config.ts` binds **5173** (documented) |
| Crash loop? | No active crash — prior sessions show portal Vite **aborted** / left stopped after ATT QA wave; not a code fault |

**Root cause:** `web-portal` Vite process was **not running** (process missing). Late ATT QA seats correctly fell back to `hrm_fe` `:8080`. Class = **ENV / ops**, not product defect.

Historical context (same day terminals): earlier `pnpm --filter web-portal exec vite --port 5173` sessions ended `aborted`/`failed`; `hrm_fe` on `:8080` and `hrm-api` `:28001` remained up — matches QC “intermittency / late ATT ECONNREFUSED”.

---

## 2) Restore actions

```text
pnpm run dev:web
# turbo: web-portal + xbos-api + vite_react_shadcn_ts + x-bos
```

| Package | Port / note |
|---------|-------------|
| **web-portal** | `http://localhost:5173/` — **ready** (VITE 5.4.21) |
| **x-bos** | `:5176` ready |
| **vite_react_shadcn_ts** (new turbo child) | Port **8080 in use** → bound `:8081/hr/` (harmless; existing hrm_fe PID 18884 keeps canonical `:8080`) |
| **xbos-api** | nest watch started (compile OK) |

Listener post-restore:

| Port | State | Role |
|------|-------|------|
| **5173** | LISTEN (PID 17616, vite web-portal) | Unified Portal |
| **8080** | LISTEN (PID 18884) | hrm_fe (canonical fallback) |
| **5176** | LISTEN | x-bos-core |

---

## 3) Health / load verification

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:5173/` | **200** · HTML/Vite body (~757 bytes) |
| `GET http://127.0.0.1:5173/command-center` | **200** |
| `GET http://127.0.0.1:8080/` | **200** (workaround still valid) |

**Verdict:** Portal L0 load **PASS**. OBS condition closable for stack health.

---

## 4) Workaround (document)

If `:5173` drops again during long QA waves:

1. Prefer restart: `pnpm run dev:web` (or `pnpm --filter web-portal exec vite --port 5173 --host`).
2. **Fallback (QC-accepted):** brand ATT seats on `http://127.0.0.1:8080` (`hrm_fe`) — dual-surface embed parity may differ; do not treat fallback alone as brand FAIL when screens corroborate.

Not **BLOCKED-EXTERNAL** — restore succeeded on this host.

---

## 5) Residual / honesty

| Item | Status |
|------|--------|
| Portal `:5173` LISTEN + GET 200 | **CLOSED** (this wave) |
| Brand remaster program DONE | **false** (untouched) |
| Attendance CLOSED / Face LIVE / product GO | **false** |
| Duplicate hrm Vite on `:8081` from turbo | OBS noise — ignore; keep using `:8080` |
| Long-run stability (process killed mid-wave) | Ops hygiene — keep `dev:web` terminal alive during ATT portal seats |

---

## Handoff

- **completion_report:** Diagnosed process-missing on `:5173`; restored via `pnpm run dev:web`; GET `/` and `/command-center` **200**. Brand FE not edited.
- **next_owner:** pm
- **next_dispatch_prompt:** see bus entry
- **evidence_path:** `docs/qa/evidence/po-hrm-ui-brand-obs-portal-5173.md`
- **ack_status:** PASS_TO_PM
