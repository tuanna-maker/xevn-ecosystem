# QA Program Gate — P1-PHASE1-QA-PROGRAM-GATE-03 (2026-06-05)

| Field | Value |
|-------|-------|
| work_item_id | `P1-PHASE1-QA-PROGRAM-GATE-03` |
| from_role | `pm` |
| to_role | `qa` → `qc` |
| condition_closed | **C-RBACQC-03** — strict program gate |
| environment_primary | `https://14-225-217-232.nip.io` (pilot HTTPS) |
| environment_local | `127.0.0.1` — APIs **not running** this session |
| ack_status | **READY_FOR_QC** |
| phase1_done_claim | **NO** — matrix/program G4/G5 and PROD remain open |

## Entry criteria (verified)

| Criterion | Status |
|-----------|--------|
| BA `P1-PHASE1-BA-CRUD-MATRIX-SYNC-05` §9 HRM-EMP slice | **Met** — per `PHASE1_CRUD_ACCEPTANCE_MATRIX.md` §18 |
| Prior residual `C-RBACQC-03` from `p1-phase1-qc-full-rbac-20260604.md` | **Addressed** — strict gate + A1 capabilities on nip.io |

## 1. L0 stack — `pnpm run qc:dev-stack`

| Check | Command | Exit | Result |
|-------|---------|------|--------|
| Local L0 | `pnpm run qc:dev-stack` | **1** | `hrm-api` :28001 fetch failed; `xbos-api` :28002 fetch failed; `web-portal` :5173 fetch failed |

**Classification:** **ENV** — local dev stack not started (ECONNREFUSED). Does not block nip.io strict gate per QC prior adjudication on `C-RBACQC-03`.

### Nip.io L0 substitute (health table)

Env substitute (same pattern as `p1-r3-qa-01-r1-20260529.md`):

```powershell
$env:XBOS_HEALTH_URL='https://14-225-217-232.nip.io/api/xbos'
$env:HRM_HEALTH_URL='https://14-225-217-232.nip.io/api/hrm'
```

| Endpoint | HTTP | Verdict |
|----------|------|---------|
| `https://14-225-217-232.nip.io/` | **200** | PASS |
| `https://14-225-217-232.nip.io/api/hrm/metrics` | **200** | PASS |
| `https://14-225-217-232.nip.io/api/xbos/metrics` | **200** | PASS |

## 2. Strict program gate — `pnpm phase1:gate --strict`

Prerequisite: `XBOS_HEALTH_URL` + `HRM_HEALTH_URL` → nip.io (above).

| Check | Command | Exit | Result |
|-------|---------|------|--------|
| Matrix + capabilities (full smoke, not A1-only) | `pnpm phase1:gate --strict` | **0** | Matrix **245** rows: `e2e_pass=244`, `waived=1`; capability smoke **pass=23**, **skip=35**, **fail=0** |

Capability smoke notes (unauthenticated probe — expected):

- Mapped HTTP smokes return **401** or **404** (reachable API, not 5xx/0).
- **35** rows skipped — no HTTP smoke mapped (document/manual per script).

Report regenerated: `docs/qa/PHASE1_GATE_REPORT.md` (timestamp 2026-06-05 run).

## 3. Capability group A1 — `pnpm run verify:capabilities --group A1`

| Check | Command | Exit | Result |
|-------|---------|------|--------|
| A1 only | `pnpm run verify:capabilities -- --group A1` | **0** | **2/2** PASS |

| capability_code | HTTP | Verdict |
|-----------------|------|---------|
| `BTN-A1-INBOX-DETAIL` | **401** | PASS (<500, auth required) |
| `BTN-A1-INBOX-QUICK` | **401** | PASS |

## Classification summary

| Signal | Class | Gate impact |
|--------|-------|-------------|
| Local `qc:dev-stack` exit **1** | **ENV** | Substituted by nip.io L0 table |
| `phase1:gate --strict` exit **0** (nip.io API URLs) | **PRODUCT/PROCESS — PASS** | **C-RBACQC-03** strict gate satisfied on authoritative pilot |
| `verify:capabilities --group A1` exit **0** | **PRODUCT — PASS** | A1 smoke OK on pilot |
| 245 UC matrix / PROD / sponsor closure | **OUT OF SCOPE** | **NOT** Phase 1 DONE / **NOT** PROD-READY |

## Residual (post QA — not blocking C-RBACQC-03 closure)

| ID | Owner | Note |
|----|-------|------|
| Local L0 reproducibility | devops | Re-run `qc:dev-stack` exit **0** on `127.0.0.1:28001/28002/5175` when sponsor needs local strict gate without env override |
| **C-EMPGRPQC-01** | qa (optional) | Browser J-HRM-02 P-CC-03 embed |
| **C-EMPGRPQC-02** | qa | Evidence pack headings 6/8 (process) |
| **C-MEMCC-01** | dev-fe (GWC) | CC iframe member HRM session |
| **C-RBACQC-05** | ba-process | Journey map sync |
| Program G4/G5, PROD | pm/qc | Unchanged |

## Commands log (reproducible)

```powershell
Set-Location "<repo-root>"
pnpm run qc:dev-stack
# exit 1 — local down

$env:XBOS_HEALTH_URL='https://14-225-217-232.nip.io/api/xbos'
$env:HRM_HEALTH_URL='https://14-225-217-232.nip.io/api/hrm'
pnpm run verify:capabilities -- --group A1
pnpm phase1:gate --strict
```

## Handoff packet

```yaml
completion_report: |
  C-RBACQC-03 closed for QA scope: strict phase1:gate (pass=23/fail=0 on nip.io)
  and verify:capabilities A1 (2/2) both exit 0 with HRM/XBOS_HEALTH_URL pointed at pilot.
  Local qc:dev-stack exit 1 — documented nip.io L0 substitute (portal/hrm/xbos metrics 200).
  Does NOT assert Phase 1 DONE, PROD-READY, or full local gate without env override.
next_owner: qc
next_dispatch_prompt: |
  QC P1-PHASE1-QC-PROGRAM-GATE-03 — Re-adjudicate C-RBACQC-03 using
  docs/qa/evidence/p1-phase1-qa-program-gate-03-20260605.md: confirm phase1:gate --strict
  exit 0 and A1 capabilities on nip.io; accept nip.io L0 substitute when local stack down;
  update p1-phase1-qc-full-rbac-20260604.md addendum to CLOSED C-RBACQC-03 if concurred.
  Do NOT promote Phase 1 DONE / PROD. Residual local L0 = GWC for devops only.
evidence_path: docs/qa/evidence/p1-phase1-qa-program-gate-03-20260605.md
ack_status: READY_FOR_QC
```
