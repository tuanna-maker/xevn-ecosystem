# P1-PHASE1-QA-CONTRACTS-RATIO-01 — contracts-ratio density retest (C-W12QC-02)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QA-CONTRACTS-RATIO-01` |
| **from_role** | qa |
| **to_role** | pm |
| **parent_dev** | `P1-PHASE1-BE-CONTRACTS-RATIO-01` |
| **date** | 2026-06-05 |
| **environment** | Shared pilot DB `xevn_hrm` via `deploy/xevn-ecosystem/.env` (`113.20.107.184`) |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → **qc** (C-W12QC-02 closure note on S5/W12 condition register) |

## Scope (exit criteria)

| Criterion | Target | Verdict |
|-----------|--------|---------|
| Menu density gate | `pnpm run verify:hrm:menu-density` **7/7** exit 0 | **PASS** |
| contracts-ratio | ≥ **0.85** on active workforce | **PASS** — **0.850** (954/1122) |
| Close QC condition | **C-W12QC-02** | **CLOSED** |

**Out of scope this wave:** Full L2/L2.5 browser matrix, persona matrix, mobile P5 (C-W12QC-01), PROD promotion — density gate only per PM dispatch.

---

## 1) Independent verification command

```text
pnpm run verify:hrm:menu-density
```

**Exit code:** **0**

```text
verify-hrm-menu-data-density — xevn_hrm

PASS  employees  employees=1190 (need >=1000)
PASS  contracts-ratio  contracts=954 active=1122 ratio=0.850 need>=0.85
PASS  insurance-ratio  insurance=1270 ratio need>=0.85
PASS  attendance-scale  attendance=471 need>=22
PASS  payroll-periods  payroll_periods=59 need>=10
PASS  recruitment-pipeline  requisitions=38 candidates=55 need>=5
PASS  leave-requests  leave_requests=59 need>=5

=== Summary: 7/7 PASS ===
```

---

## 2) Delta vs prior evidence

| Metric | S5 G5 QA (`p1-s5-qa-g5-01-20260605.md`) | Dev-BE fix | This QA retest |
|--------|----------------------------------------|------------|----------------|
| Summary | **6/7** FAIL | **7/7** PASS | **7/7** PASS |
| contracts-ratio | **0.848** (952/1122) | **0.850** (954/1122) | **0.850** (954/1122) |
| Gap vs threshold | −2 rows (`ceil(1122×0.85)=954`) | +2 `employee_contracts` inserted | Reproduced |
| Condition | **C-W12QC-02** OPEN | Dev claims CLOSED | **CLOSED** |

**Cross-check Dev handoff:** `docs/qa/evidence/p1-phase1-be-contracts-ratio-20260605.md` — idempotent re-run `inserted: 0`, seed tag `p1-p100-w12-contracts-density`.

---

## 3) Nip.io spot-check (informational)

```text
PORTAL_DEV_URL=https://14-225-217-232.nip.io
GET /api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=5
→ 200 HRM-CON-200 total=780
```

List API `total` is scope-filtered for group CEO rollup; menu-density gate counts all `employee_contracts` rows vs active employees in DB. **Not a blocker** for C-W12QC-02 — same pattern as W12 QA seed closure 2026-05-31.

**Local L0:** `pnpm run qc:dev-stack` exit **1** (xbos-api `:28002` down; hrm-api **200**) — not required for this density-only wave.

---

## 4) Residual / not promoted

| ID | Item | Status |
|----|------|--------|
| **C-W12QC-01** | Mobile JWT P5 UAT 36/37 | **OPEN** — unchanged |
| **C-W12QC-02** | contracts-ratio ≥ 0.85 | **CLOSED** (this wave) |
| Prevention | Re-run `seed:hrm:contracts-density` after G5/fidelity employee adds | **Recommend** (Dev residual) |
| ~168 active employees without contract row | By design — ratio gate uses row count, not 100% FK coverage | **N/A** |
| Phase 1 / PROD | Program DONE / PROD LIVE | **NOT claimed** |

---

## 5) Handoff packet

| Field | Value |
|-------|-------|
| **completion_report** | **C-W12QC-02 CLOSED.** QA independently reproduced `verify:hrm:menu-density` **7/7 PASS**; `contracts-ratio` **0.850** (954/1122) ≥ 0.85. Resolves S5 G5 **6/7** gap (0.848). Mobile P5 and PROD slice out of scope. |
| **next_owner** | **pm** → **qc** for condition-register update (SVC-06 / W12 FINAL delta) |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/p1-phase1-qa-contracts-ratio-20260605.md` |
| **pm_dispatch_hint** | Update `SERVICE_READINESS_UAT_PRODUCTION.md` SVC-06 + `PROJECT_STATUS_REPORT.md` C-W12QC-02 → CLOSED; dispatch **qc** narrow condition closure only |

### next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-CONTRACTS-RATIO-01. Role: qc. Entry: QA PASS_TO_PM docs/qa/evidence/p1-phase1-qa-contracts-ratio-20260605.md — verify:hrm:menu-density 7/7 exit 0, contracts-ratio 0.850 (954/1122), C-W12QC-02 QA-satisfied. Exit: Confirm C-W12QC-02 CLOSED on docs/qa/evidence/p1-s5-qc-g5-01-20260605.md + docs/program/SERVICE_READINESS_UAT_PRODUCTION.md SVC-06; no regression to 6/7; C-W12QC-01 mobile remains OPEN. ack_status PASS_TO_PM with condition delta only. evidence_path: docs/qa/evidence/p1-phase1-qc-contracts-ratio-20260605.md
```
