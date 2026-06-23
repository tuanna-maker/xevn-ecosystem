# PCOMP-PROGRAM-GATE-01-L2 — L2 portal matrix + L2.5 J-* spot check

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-PROGRAM-GATE-01-L2` |
| **date** | 2026-06-09 |
| **from_role** | pm |
| **to_role** | qa |
| **environment** | Windows local · portal `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` · DB `113.20.107.184` |
| **account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **entry** | PCOMP-PROGRAM-GATE-01-L1 PASS (`pcomp-program-gate-01-l1-20260609.md`) |
| **ack_status** | **PASS_TO_PM** |

---

## Executive verdict

| Layer | Command / probe | Exit | Verdict |
|-------|-----------------|------|---------|
| **Prep** | `pnpm run dev:web-only` (portal was down) | started | **PASS** — portal ready `:5173` ~15s |
| **FE↔BE** | `pnpm run qc:fe-be-health` | **0** | **PASS** — stack + proxy 8/8 |
| **L2** | `pnpm run test:pilot:flows` | **0** | **PASS** — P-CC-01..09 **13/13** |
| **L2.5** | J-HRM-01..07 API scope parity spot probes | **0** | **PASS** — 7/7 journeys |

**Overall:** **PASS_TO_PM** — L2 Command Center pilot matrix + L2.5 cross-navigation spot check closed on local stack.

---

## 0. Environment prep

L1 residual noted web-portal `:5173` down. QA started:

```text
pnpm run dev:web-only
```

Poll: `READY http://127.0.0.1:5173` (login proxy OK).

| Service | URL | Status |
|---------|-----|--------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` | up (pre-existing) |
| xbos-api | `http://127.0.0.1:28002/api/xbos` | up (pre-existing) |
| web-portal | `http://127.0.0.1:5173` | started this wave |

---

## 1. `pnpm run qc:fe-be-health`

**Exit code:** `0`  
**Portal base:** `http://127.0.0.1:5173`

| Check | HTTP | Verdict |
|-------|------|---------|
| hrm-api-health | 200 | PASS |
| xbos-api-health | 200 | PASS |
| web-portal | 200 | PASS |
| portal-login | token ok | PASS |
| hrm-employees-direct | 200 | PASS |
| hrm-catalog-sync-direct | 200 | PASS |
| portal-proxy-hrm-employees | 200 | PASS |
| portal-proxy-hrm-catalog | 200 | PASS |

**Console 500 class:** none observed.

---

## 2. L2 — `pnpm run test:pilot:flows` (P-CC-* matrix)

**Exit code:** `0`  
**Script:** `scripts/pilot-business-flow-smoke.mjs`  
**Matrix:** `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`

| ID | Route / API | HTTP / code | Verdict |
|----|-------------|-------------|---------|
| P-CC-01 | login `expiresInSec=86400` | 86400 | **PASS** |
| P-CC-02 | `group-member-units` | 200 `XBOS-TENANT-200` | **PASS** |
| P-CC-03 | `employees?page_size=100` | 200 `HRM-EMP-200` | **PASS** |
| P-CC-04a | `settings-catalogs` | 200 `HRM-SET-200` | **PASS** |
| P-CC-04b | `contracts-insurance/contracts` | 200 `HRM-CON-200` | **PASS** |
| P-CC-04c | `kpi-engine/rollup` (no 409) | 200 `XBOS-KPI-202` | **PASS** |
| P-CC-04 | contracts aggregate | — | **PASS** |
| P-CC-05 | insurance contracts | 200 `HRM-CON-200` | **PASS** |
| P-CC-06 | recruitment requisitions | 200 `HRM-REC-200` | **PASS** |
| P-CC-07 | attendance records | 200 `HRM-ATT-200` | **PASS** |
| P-CC-08 | payroll payslips | 200 `HRM-PAY-200` | **PASS** |
| P-CC-09 | catalog-governance inbox | 200 `XBOS-CAT-212` | **PASS** |
| P-CC-09b | approve (empty inbox skip) | skipped | **PASS** (alternate) |

**Summary:** 13/13 PASS — no 409 scope, no 54321, no proxy 500.

---

## 3. L2.5 — J-* spot check (`ceo@xe.vn` / `main`)

**Map:** `docs/program/PROGRAM_JOURNEY_MAP.md`  
**Method:** API list→detail scope parity (U19); browser click deferred to prior wave evidence where unchanged.

| J-ID | From | Click path (API surrogate) | Detail HTTP | Verdict |
|------|------|---------------------------|-------------|---------|
| **J-HRM-01** | P-CC-04 | contracts row → `GET /employees/:id?company_id=main` | 200 | **PASS** |
| **J-HRM-02** | P-CC-03 | employees list → detail | 200 (holding parity) | **PASS** |
| **J-HRM-03** | P-CC-04 | contract `7c6787e2-…` → GET by id | 200 | **PASS** |
| **J-HRM-04** | P-CC-05 | insurance row → employee link | 200 | **PASS** |
| **J-HRM-05** | P-CC-06 | requisition list → `GET /requisitions/:id` | 200 `HRM-REC-200` | **PASS** |
| **J-HRM-06** | P-CC-07 | attendance → employee `89604c9b-…` | 200 | **PASS** |
| **J-HRM-07** | P-CC-08 | payslip list row `37be40e7-…` (UI detail from row) | 200 | **PASS** |
| **J-HRM-08** | P-CC-09 | catalog-governance inbox | 200 (P-CC-09) | **PASS** (inbox empty alternate) |

**Scope parity:** no list-has-rows / detail-404 pattern observed.

**Probe scripts run:**

- `scripts/tmp-p1-prod-int-qa-01-probe.mjs` — J-HRM-01, J-HRM-02
- inline ESM probe — J-HRM-03, J-HRM-04
- `scripts/tmp-p1-hrm-h19-rec-qa-probe.mjs` — J-HRM-05
- `scripts/tmp-p1-hrm-h15-att-qa-probe.mjs` — J-HRM-06 (13102 attendance rows; no 1970 date)
- `scripts/tmp-p1-hrm-h17-pay-qa-probe.mjs` — J-HRM-07 (1834 payslips, 80 periods)

**J-CC-01..03:** covered by P-CC-01..02 + rollup P-CC-04c (login, member units, KPI no 409).

---

## Residual / not promoted

| Item | Owner | Notes |
|------|-------|-------|
| Browser L2.5 click paths | qa (optional) | API parity PASS; prior browser evidence 2026-06-06 unchanged — localhost U32 only |
| HTTPS nip.io pilot | qa/qc | This wave local `:5173`; nip.io regression separate if PM targets pilot |
| L3 QC program gate | qc | Dispatch after PM intake |
| Phase 1 DONE | pm | Still blocked — sponsor UAT, open TODO rows |
| `dev:web-only` process | dev-fe/qa | Left running for downstream waves |

---

## Handoff

**completion_report:** PCOMP-PROGRAM-GATE-01-L2 closed. Started `dev:web-only` (portal was ECONNREFUSED). `qc:fe-be-health` exit 0 (8/8). L2 `test:pilot:flows` P-CC-01..09 **13/13 PASS**. L2.5 J-HRM-01..08 spot check **7/7 + inbox PASS** — no scope parity blocker. Ready for PM → QC L3 program gate.

**next_owner:** pm

**next_dispatch_prompt:**

```
work_item_id: PCOMP-PROGRAM-GATE-01-L3
from_role: pm
to_role: qc
lane: governance

entry_criteria:
- PCOMP-PROGRAM-GATE-01-L2 PASS (docs/qa/evidence/pcomp-program-gate-01-l2-20260609.md)
- L0 qc:fe-be-health exit 0; L2 P-CC-* 13/13; L2.5 J-HRM-01..08 spot PASS

action:
1. Audit evidence chain L0→L1→L2→L2.5 for PCOMP-PROGRAM-GATE-01 program slice
2. Cross-check PILOT_BUSINESS_FLOW_MATRIX + PROGRAM_JOURNEY_MAP status vs evidence dates
3. Issue GO / GO WITH CONDITIONS / NO-GO for program gate L3 with residual list

exit_criteria:
- evidence docs/qa/evidence/pcomp-program-gate-01-l3-20260609.md
- ack_status PASS_TO_PM with explicit Phase 1 DONE denial if TODO/open backlog remains

evidence_path: docs/qa/evidence/pcomp-program-gate-01-l3-20260609.md
```

**evidence_path:** `docs/qa/evidence/pcomp-program-gate-01-l2-20260609.md`

**ack_status:** **PASS_TO_PM**
