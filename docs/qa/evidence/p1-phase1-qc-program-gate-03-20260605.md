# QC Gate Decision — P1-PHASE1-QC-PROGRAM-GATE-03 (2026-06-05)

work_item_id: `P1-PHASE1-QC-PROGRAM-GATE-03`
from_role: `qc`
to_role: `pm`
parent_condition: **C-RBACQC-03** (from `p1-phase1-qc-full-rbac-20260604.md`)
ack_status: **PASS_TO_PM**

| Field | Value |
|-------|-------|
| work_item_id | `P1-PHASE1-QC-PROGRAM-GATE-03` |
| from_role | `pm` → `qa` → `qc` |
| execution_date | `2026-06-05` |
| decision | **GO WITH CONDITIONS** — **C-RBACQC-03 CLOSED** on nip.io strict gate; **NOT** Phase 1 DONE / **NOT** PROD-READY |
| environment_primary | `https://14-225-217-232.nip.io` (pilot HTTPS) |
| environment_local | `127.0.0.1` — APIs **not running** (ENV) |

## Entry criteria (verified)

| Criterion | Status |
|-----------|--------|
| QA `READY_FOR_QC` — `p1-phase1-qa-program-gate-03-20260605.md` | **Met** |
| Re-adjudicate **C-RBACQC-03** from `p1-phase1-qc-full-rbac-20260604.md` | **Met** — closed below |
| `phase1:gate --strict` exit **0** on nip.io | **Met** — QC reproduced |
| `verify:capabilities --group A1` exit **0** on nip.io | **Met** — QC reproduced **2/2** |

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-program-gate-03-20260605.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **1/8** — missing `work_item_id:` line near top (script format) |
| QC adjudication | **Process GWC** — `work_item_id` present in table + handoff YAML; does **not** block product adjudication for bounded strict-gate slice |

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| Local `qc:dev-stack` exit **1** | **ENV** | Substituted by nip.io L0 table — **no NO-GO** |
| Nip.io portal + metrics **200** | **ENV substitute — PASS** | Authoritative pilot L0 per prior `C-RBACQC-03` policy |
| `phase1:gate --strict` exit **0** (nip.io URLs) | **PRODUCT/PROCESS — PASS** | Matrix **244** `e2e_pass` / **1** `waived`; capability **pass=23 skip=35 fail=0** |
| `verify:capabilities --group A1` exit **0** | **PRODUCT — PASS** | **2/2** (`401` auth-required — expected) |
| Program G4/G5 / PROD / sponsor closure | **OUT OF SCOPE** | **NOT** Phase 1 DONE / **NOT** PROD-READY |

## QC reproduction (2026-06-05)

| # | Check | Command | Result |
|---|-------|---------|--------|
| 1 | Local L0 | `pnpm run qc:dev-stack` | Exit **1** — `:28001/:28002/:5173` fetch failed (**ENV**) |
| 2 | Nip.io L0 | `Invoke-WebRequest` portal + metrics | **200** / **200** / **200** |
| 3 | A1 capabilities | `$env:XBOS_HEALTH_URL` + `$env:HRM_HEALTH_URL` → nip.io; `pnpm run verify:capabilities -- --group A1` | Exit **0** — **2/2** PASS |
| 4 | Strict program gate | Same env; `pnpm phase1:gate --strict` | Exit **0** — **244/245** matrix; capability **23/0/35** pass/fail/skip |
| 5 | Gate report | `docs/qa/PHASE1_GATE_REPORT.md` | Regenerated `2026-06-05T01:20:27.919Z` |

Env override (reproducible):

```powershell
$env:XBOS_HEALTH_URL='https://14-225-217-232.nip.io/api/xbos'
$env:HRM_HEALTH_URL='https://14-225-217-232.nip.io/api/hrm'
```

## C-RBACQC-03 adjudication

**Parent condition** (`p1-phase1-qc-full-rbac-20260604.md` § Conditions):

> Re-run `phase1:gate --strict` + capability smoke when local stack up **OR** nip.io capability script — before program-level GO.

| Requirement | QA (2026-06-05) | QC spot-check | Verdict |
|-------------|-----------------|---------------|---------|
| `phase1:gate --strict` exit **0** | Exit **0** on nip.io | Exit **0** — concurred | **CLOSED** |
| Capability smoke **fail=0** | **23 pass / 0 fail** | **23 pass / 0 fail** | **CLOSED** |
| A1 group smoke | **2/2** exit **0** | **2/2** exit **0** | **CLOSED** |
| Local stack required | Not mandatory when nip.io authoritative | Local exit **1** accepted | **GWC** — see condition below |

**Verdict:** **C-RBACQC-03 CLOSED** — strict program gate + capability smoke satisfied on HTTPS pilot with `HRM_HEALTH_URL` / `XBOS_HEALTH_URL` override. Addendum recorded on `p1-phase1-qc-full-rbac-20260604.md`.

## QC decision

**GO WITH CONDITIONS** for **C-RBACQC-03 closure** on nip.io pilot:

- Strict `phase1:gate` and A1 capability smoke **reproduced** with exit **0**.
- Local `qc:dev-stack` remains **ENV** residual — optional **devops** for sponsor local reproducibility without env override.
- Parent U28 RBAC slice verdict **unchanged** — **GO WITH CONDITIONS**; **NOT** Phase 1 DONE · **NOT** Production GO · **NOT** 245/245 sponsor DONE.

## Conditions (bounded)

| ID | Condition | Owner | Blocks C-RBACQC-03? |
|----|-----------|-------|---------------------|
| **C-RBACQC-03-LOCAL** | Re-run `qc:dev-stack` + `phase1:gate --strict` exit **0** on `127.0.0.1` without env override | **devops** (optional) | **No** — GWC for local reproducibility only |
| **C-EMPGRPQC-01** | Browser J-HRM-02 P-CC-03 embed click | **qa** (optional) | **No** |
| ~~**C-MEMCC-01**~~ | ~~CC iframe member HRM session~~ | — | **CLOSED** 2026-06-05 — `qc-p1-w6-memcc-close-20260605.md` |
| **C-RBACQC-05** | Journey map / matrix sync | **ba-process** / **pm** | **No** for this gate |
| Program G4/G5, PROD | Corporate production readiness | **pm** / **qc** | **Yes** for **Program DONE** only |

## Residual (explicit)

| Item | Severity | Owner |
|------|----------|-------|
| Local L0 reproducibility | ENV / process GWC | devops |
| QA evidence pack **1/8** format | Process GWC | qa |
| HRBP persona browser depth | Coverage | qa |
| Excellence / PROD columns | Program | pm |

## completion_report

- **Closed:** **C-RBACQC-03** — `phase1:gate --strict` exit **0** and `verify:capabilities --group A1` exit **0** on nip.io with `HRM/XBOS_HEALTH_URL` override; capability smoke **fail=0**; matrix **244 e2e_pass / 1 waived**.
- **Concurred:** nip.io L0 substitute when local `qc:dev-stack` exit **1** (portal + HRM/XBOS metrics **200**).
- **Closed (addendum 2026-06-05):** **C-MEMCC-01** — `qc-p1-w6-memcc-close-20260605.md`.
- **Open:** Local strict gate without env override (**C-RBACQC-03-LOCAL** GWC); **C-RBACQC-05**, program G4/G5 / PROD.
- **Not claimed:** Phase 1 DONE, PROD-READY, sponsor 245/245 closure.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-PROGRAM-GATE-03 — QC PASS_TO_PM. C-RBACQC-03 CLOSED on nip.io strict gate (phase1:gate --strict exit 0; A1 2/2; capability fail=0). Evidence: docs/qa/evidence/p1-phase1-qc-program-gate-03-20260605.md + addendum on p1-phase1-qc-full-rbac-20260604.md. PM: refresh PHASE1_CRUD_ACCEPTANCE_MATRIX.md §18 residual (C-RBACQC-03 → CLOSED); update bus + USER_SERVICE_STATUS note for strict gate on pilot; optional devops C-RBACQC-03-LOCAL (local qc:dev-stack + strict without env override); ba-process C-RBACQC-05 journey sync. Do NOT claim Phase 1 DONE or PROD-READY.
```

## ack_status

**PASS_TO_PM** — **GO WITH CONDITIONS** — **C-RBACQC-03 CLOSED** on nip.io; local L0 **GWC** optional; **NOT** Phase 1 DONE / **NOT** PROD-READY.
