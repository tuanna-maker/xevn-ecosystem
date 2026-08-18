# PCOMP-W6-DO-STABLE-DIST-01 — Stabilize hrm-api dist for W6 sponsor UAT

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W6-DO-STABLE-DIST-01` |
| **from_role** | devops |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **Date** | 2026-07-25 |
| **Scope** | local 1B only · HOLD_DEPLOY · U65 no seed · NOT `:8088` · NOT Phase1/PROD |
| **QA residual** | R1 in `docs/qa/evidence/qa-pcomp-w6-local-uat-01-20260725.md` |
| **L0 restore ref** | `docs/qa/evidence/do-hrm-settings-md-l0-restore-01-20260725.md` |

---

## 0. Verdict

| Gate | Result |
|------|--------|
| Single process on `:28001` from `dist-uat-w6` | **PASS** |
| `GET http://127.0.0.1:28001/api/hrm` | **200** `HRM-HEALTH-200` |
| Ops lock documented (no parallel nest build/watch) | **PASS** |
| Seed / `:8088` / Phase1 / PROD | **NOT claimed** |

---

## 1. Root cause (R1)

Concurrent multi-agent activity ran:

- `pnpm run dev:hrm-api` / `turbo run dev --filter=hrm-api` / `nest start --watch`
- `nest build` with Nest `deleteOutDir: true`

→ `apps/api/hrm-api/dist/` wiped mid-serve → Node serving `dist/main` flaps / crashes → `:28001` L0 FAIL during sponsor dry-run.

**Mitigation:** serve from a frozen copy **outside** Nest `outDir`:

```text
apps/api/hrm-api/dist-uat-w6/   ← copy of known-good dist
node --enable-source-maps dist-uat-w6/main.js   # cwd = apps/api/hrm-api
```

---

## 2. Steps executed

1. Audited `:28001` — was serving `dist/main` while **multiple** `nest start --watch` / `dev:hrm-api` trees ran.
2. Stopped all hrm-api watch trees (`taskkill /T` on turbo/pnpm/nest for `filter=hrm-api` / `dev:hrm-api`).
3. Exclusive `npx nest build` in `apps/api/hrm-api` (exit 0) → refreshed `dist-uat-w6` (652 files mirrored).
4. Started **one** Node process: `cwd=apps/api/hrm-api`, entry `dist-uat-w6/main.js`, `HRM_BE_PORT=28001`.
5. Observed other Cursor agent scripts rebinding `:28001` with `dist/main` — cleared usurpers; locked UAT entry.
6. Added sponsor-window watchdog: `scripts/hrm-api-sponsor-uat-stable.ps1`  
   - Keeps `:28001` on `dist-uat-w6`  
   - Kills hrm `nest --watch` / `dev:hrm-api` usurpers  
   - Writes `dist-uat-w6/.SPONSOR_UAT_LOCK` + `.SPONSOR_UAT_PID`

---

## 3. Gate evidence (at handoff)

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:28001/api/hrm` | **200** `{"code":"HRM-HEALTH-200","data":{"service":"hrm-api","status":"ok"},...}` |
| Listener command | `node --enable-source-maps dist-uat-w6\main.js` (PID recorded in `.SPONSOR_UAT_PID`) |
| Lock file | `apps/api/hrm-api/dist-uat-w6/.SPONSOR_UAT_LOCK` |
| Watchdog | `scripts/hrm-api-sponsor-uat-stable.ps1` (PID in `.SPONSOR_UAT_WATCHDOG_PID`) |
| Optional L0 peers | xbos `:28002` **200** · portal `:5173` **200** (observed during stabilize) |

### Sample health body

```json
{"success":true,"code":"HRM-HEALTH-200","message":"HRM service is healthy","data":{"service":"hrm-api","status":"ok"}}
```

---

## 4. Sponsor-window OPS LOCK (mandatory)

**During `PCOMP-W6-SP-01` / any W6 local UAT session:**

| Do | Do **not** |
|----|------------|
| Leave `dist-uat-w6` + watchdog running | `pnpm run dev:hrm-api` |
| Probe health only | `nest start --watch` on hrm-api |
| One exclusive `nest build` **only if** rebuild needed, then **re-copy** `dist → dist-uat-w6` and restart node from `dist-uat-w6` | Parallel `nest build` while `:28001` serves from `dist/` |
| cwd = `apps/api/hrm-api` for node | `node dist/main.js` from monorepo root (env/DB path wrong) |

**Why:** Nest `deleteOutDir` deletes `dist/` under the running process → intermittent 000/500 on portal proxy → false UAT FAIL.

**Stop watchdog after sponsor session (optional):**

```powershell
# read PID from apps/api/hrm-api/dist-uat-w6/.SPONSOR_UAT_WATCHDOG_PID then:
taskkill /F /T /PID <watchdog_pid>
```

---

## 5. Residuals

| ID | Sev | Note |
|----|-----|------|
| R-W6-AGENT-PORT-RACE | P2 ops | Other local agents may still spawn `dev:hrm-api`; watchdog mitigates during window. PM: remind all roles — no hrm nest watch during SP-01. |
| R2/R3 from QA dry-run | unchanged | Payslip GET-by-id (P2 note); browser click = sponsor SP-01. |

---

## 6. Explicit non-claims

- Not Phase 1 DONE / not PROD-READY  
- Not `:8088` / `portal.xe.vn`  
- No seed  
- Does **not** close `PCOMP-W6-SP-01` (sponsor FE click)

---

## 7. Handoff

```text
completion_report: |
  Closed QA R1 for W6 local UAT: hrm-api serves :28001 from dist-uat-w6
  (outside nest deleteOutDir). Exclusive rebuild + copy done. Watchdog
  scripts/hrm-api-sponsor-uat-stable.ps1 keeps single UAT entry and
  suppresses hrm nest watch. GET /api/hrm 200 HRM-HEALTH-200.
  Documented ops lock: no parallel nest build/watch during sponsor session.
  No seed. HOLD_DEPLOY. NOT :8088 / Phase1 / PROD.
next_owner: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/pcomp-w6-do-stable-dist-01-20260725.md
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PCOMP-W6-SP-01
from_role: pm
to_role: sponsor (invite)
entry_criteria:
  - L0: GET http://127.0.0.1:28001/api/hrm → 200 (dist-uat-w6; see PCOMP-W6-DO-STABLE-DIST-01)
  - Team dry-run PASS: docs/qa/evidence/qa-pcomp-w6-local-uat-01-20260725.md
  - Pack: docs/qa/evidence/pcomp-w6-qa-uat-prep-01-20260725.md
  - Ops lock: do NOT run pnpm run dev:hrm-api / nest build on hrm-api during session
exit_criteria:
  - Sponsor FE click checklist P-CC-01..09 + J-HRM-01..07 on http://127.0.0.1:5173
  - Bus verdict PCOMP-W6-SP-01 (UAT-PASS / UAT-FAIL / BLOCKED)
cấm: seed · :8088 · portal.xe.vn · Phase1/PROD claim
locks: U65 · HOLD_DEPLOY · 1B local only
```
