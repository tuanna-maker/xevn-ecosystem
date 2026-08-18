# D-HRM-SETTINGS-MD-L0-STAB-01 — Stabilize hrm-api L0 for Settings MD retest

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-SETTINGS-MD-L0-STAB-01` |
| **from_role** | devops |
| **to_role** | qa / pm |
| **ack_status** | **READY_FOR_QA** |
| **Date** | 2026-07-25 |
| **Trigger** | `QA-HRM-SETTINGS-MASTER-DATA-02` PARTIAL — flaky `:28001` under dist/nest races |
| **W6 freeze** | `PCOMP-W6-DO-STABLE-DIST-01` — serve `dist-uat-w6` only |
| **Scope** | local 1B · HOLD_DEPLOY · U65 zero-seed · **NOT** Phase1/PROD · **NOT** `:8088` |

---

## 0. Verdict

| Exit criterion | Result |
|----------------|--------|
| `GET /api/hrm` **200** stable ≥2 checks ~30s apart | **PASS** |
| Process serving `dist-uat-w6` (no race / no wipe) | **PASS** |
| Evidence this file | **PASS** |
| Seed / deploy `:8088` / Phase1 DONE | **NOT done / NOT claimed** |

**Overall:** **READY_FOR_QA** — L0 unblocked for `QA-HRM-SETTINGS-MASTER-DATA-03` (after FE FORM-VIS if still open).

---

## 1. Runtime state (no rebuild)

| Item | Value |
|------|--------|
| Listener PID | **14896** (unchanged during this work item) |
| Command | `node --enable-source-maps dist-uat-w6\main.js` |
| cwd (lock) | `apps/api/hrm-api` |
| Port | `28001` (`HRM_BE_PORT`) |
| Started | 2026-07-25 18:56:18 (+07/+08 local) |
| Competing `dev:hrm-api` / hrm `nest --watch` | **None** observed |
| W6 lock file | `apps/api/hrm-api/dist-uat-w6/.SPONSOR_UAT_LOCK` |
| Sponsor PID file | `.SPONSOR_UAT_PID` = `14896` |

**Action taken:** Audit + dual health only. **Did not** run `pnpm run dev:hrm-api`, `nest build --watch`, or wipe/rebuild `dist-uat-w6`. Existing W6 freeze process kept.

**Watchdog:** Prior `.SPONSOR_UAT_WATCHDOG_PID` was dead. Fixed parse breakage in `scripts/hrm-api-sponsor-uat-stable.ps1` (em-dash / empty `catch` under Windows console encoding) and restarted watchdog **PID 36472**. Watchdog refreshes lock; does **not** replace healthy `dist-uat-w6` listener.

---

## 2. Health probes (exit #1)

| # | Time (local) | Endpoint | HTTP | Body code |
|---|--------------|----------|------|-----------|
| A | 19:04:59 | `GET http://127.0.0.1:28001/api/hrm` | **200** | `HRM-HEALTH-200` |
| B | 19:05:29 | same (~30.1s later) | **200** | `HRM-HEALTH-200` |
| C | 19:08:49 | same (post-watchdog restart) | **200** | — |
| D | 19:09:20 | same (~30.1s later) | **200** | — |

Sample body (A/B):

```json
{"success":true,"code":"HRM-HEALTH-200","message":"HRM service is healthy","data":{"service":"hrm-api","status":"ok"}}
```

Same PID **14896** still listening after all probes.

### Peer L0 (optional, observed)

| Service | Result |
|---------|--------|
| xbos `:28002` | **200** |
| portal `:5173` | **200** |
| portal `:5175` | ERR (not required for this WI) |

---

## 3. Ops note for sponsor / QA (no race instructions)

- HRM API on **`:28001`** is served from frozen **`apps/api/hrm-api/dist-uat-w6`**, not live `dist/` under Nest `deleteOutDir`.
- **Do not** start a second HRM API (`dev:hrm-api`, turbo filter hrm-api, `nest start --watch` on hrm-api) during W6 / Settings MD retest.
- If `:28001` dies: restart **only**  
  `node --enable-source-maps dist-uat-w6/main.js`  
  with cwd `apps/api/hrm-api` (or re-run `scripts/hrm-api-sponsor-uat-stable.ps1`).  
  **Do not** rebuild unless DevOps explicitly refreshes `dist-uat-w6`.
- U65: **no seed**.

Cross-ref freeze SoT: `docs/qa/evidence/pcomp-w6-do-stable-dist-01-20260725.md`.

---

## 4. Residuals

| ID | Note | Owner |
|----|------|-------|
| Watchdog ASCII fix | Em-dash in PS1 broke parse under Win console — fixed in repo script | devops (closed this WI) |
| Settings MD UF | Leave create→F5 / dept persist still **not promoted** in MASTER-DATA-02 | qa (MASTER-DATA-03) |
| FE FORM-VIS | If still open — close before or parallel with MASTER-DATA-03 per PM | fe / qa |

---

## 5. Handoff

```text
work_item_id: D-HRM-SETTINGS-MD-L0-STAB-01
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/devops-hrm-settings-md-l0-stab-01-20260725.md
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-SETTINGS-MASTER-DATA-03
from_role: pm
to_role: qa
lane: execution
entry_criteria:
  - D-HRM-SETTINGS-MD-L0-STAB-01 READY_FOR_QA — GET :28001/api/hrm 200 stable from dist-uat-w6 (evidence devops-hrm-settings-md-l0-stab-01-20260725.md)
  - If FE FORM-VIS still open for Settings master-data create forms (#md-code-leaveTypes / dept), wait FE READY_FOR_QA or note BLOCKED-FORM-VIS
  - U65 zero-seed; HOLD_DEPLOY; NOT :8088; NOT Phase1/PROD
  - W6 freeze: do NOT start nest watch / rebuild against :28001
exit_criteria:
  - Browser U65: Settings leave create → POST 2xx → F5 row persists (or explicit BLOCKED with DOM evidence)
  - Browser U65: dept create/picker value=code persist → F5 (or explicit BLOCKED)
  - Evidence path + matrix residual update; no seed in evidence
  - ack_status PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hrm-settings-master-data-03-20260725.md
cấm: pnpm seed:* · API fake catalog · claim full matrix 🟢 without FE click path
```
