# P1-PHASE1-QC-CONTRACTS-RATIO-01 — C-W12QC-02 formal closure (2026-06-05)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QC-CONTRACTS-RATIO-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **entry** | QA `P1-PHASE1-QA-CONTRACTS-RATIO-01` — `docs/qa/evidence/p1-phase1-qa-contracts-ratio-20260605.md` |
| **prior_qc** | `docs/qa/evidence/p1-s5-qc-g5-01-20260605.md`, `docs/qa/evidence/p1-s5-qc-g5-jxbos-02-20260605.md` — **C-W12QC-02** OPEN (`contracts-ratio` **0.848**) |
| **environment_authoritative** | Shared pilot DB `xevn_hrm` (`deploy/xevn-ecosystem/.env` → `113.20.107.184`); nip.io informational spot-check |
| **decision** | **GO** — **C-W12QC-02 CLOSED** (scoped condition register) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope

**In scope:** Formal QC sign-off that **C-W12QC-02** (`contracts-ratio` ≥ **0.85** on active workforce) is **CLOSED** after Dev-BE seed fix + QA independent retest; affirm no regression to prior **6/7** menu-density FAIL.

**Out of scope (must not be claimed):** Phase 1 program DONE; corporate **PROD-READY**; **G8** zero-defect closure; **C-W12QC-01** mobile P5; full L2/L2.5 browser matrix; persona matrix; fresh `phase1:gate --strict` rerun.

---

## Evidence consumed

| # | Artifact | Role |
|---|----------|------|
| 1 | `docs/qa/evidence/p1-phase1-qa-contracts-ratio-20260605.md` | QA — primary retest |
| 2 | `docs/qa/evidence/p1-phase1-be-contracts-ratio-20260605.md` | Dev-BE — idempotent seed + 7/7 |
| 3 | `docs/qa/evidence/p1-s5-qc-g5-01-20260605.md` | Prior QC — C-W12QC-02 baseline **OPEN** |
| 4 | `docs/qa/evidence/p1-s5-qc-g5-jxbos-02-20260605.md` | Latest parent QC — C-W12QC-02 still **OPEN** |
| 5 | `docs/qa/evidence/p1-p100-w12-qc-final-20260531.md` | W12 FINAL — original **C-W12QC-02** condition |
| 6 | `docs/program/SERVICE_READINESS_UAT_PRODUCTION.md` | SVC-06 row — PM refresh target |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-contracts-ratio-20260605.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **1/8** — `ack_status` table cell vs `ack_status:` colon line |
| QC adjudication | **Process GWC** — density-only narrow wave; substantive commands, delta table, classification, residuals, and handoff fields present. Same pattern as `p1-s5-qc-g5-01` (**1/8**). **Does not** block C-W12QC-02 closure adjudication. |

---

## QC independent spot-check

```bash
pnpm run verify:hrm:menu-density
```

**Exit code:** **0** (`2026-06-05` QC session)

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

**Concurrence:** Matches QA (`p1-phase1-qa-contracts-ratio-20260605.md`) and Dev-BE (`p1-phase1-be-contracts-ratio-20260605.md`) — **954/1122 = 0.850**; idempotent re-run `inserted: 0`.

---

## Classification

| Signal | Type | QC adjudication |
|--------|------|-----------------|
| `contracts-ratio` **0.850** ≥ **0.85** | **PRODUCT** | **PASS** — threshold met (`ceil(1122×0.85)=954`) |
| Prior **0.848** (952/1122) | **PRODUCT** (resolved) | **CLOSED** — +2 `employee_contracts` FK rows |
| `qc:dev-stack` exit **1** (xbos-api down) | **ENV** | **Non-blocking** — density gate uses shared DB script, not local stack |
| Nip.io list `total=780` vs DB **954** rows | **SCOPE** (informational) | **Non-blocking** — group CEO rollup filter; same pattern W12 seed closure 2026-05-31 |
| ~168 active without contract row | **BY DESIGN** | **N/A** — ratio uses row count, not 100% FK coverage |

---

## Fail-closed checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | QA independent `verify:hrm:menu-density` **7/7** exit **0** | **PASS** |
| 2 | `contracts-ratio` ≥ **0.85** on active workforce | **PASS** — **0.850** |
| 3 | QC spot-check reproduces QA numbers | **PASS** |
| 4 | No regression to **6/7** (0.848) | **PASS** — stable at **0.850** |
| 5 | **C-W12QC-01** mobile unchanged | **PASS** — remains **OPEN** |
| 6 | Phase 1 DONE / PROD claim | **NOT APPROVED** |

---

## J-* coverage (L2.5 — U19)

| Journey | Tested | Deferred | QC |
|---------|--------|----------|-----|
| *(none in slice)* | — | Full J-* matrix | **N/A** — density gate only per PM dispatch; does not invalidate prior L2.5 PASS evidence |

---

## Condition register delta

| ID | Prior (`p1-s5-qc-g5-jxbos-02`) | After this QC |
|----|-------------------------------|---------------|
| **C-W12QC-02** | **OPEN** — `contracts-ratio` **0.848** (952/1122) | **CLOSED** — **0.850** (954/1122) |
| **C-W12QC-01** | **OPEN** — mobile P5 | **OPEN** (unchanged) |
| **SVC-06** (`SERVICE_READINESS`) | Residual open | **PM refresh** → UAT PASS for density ratio (PROD column still GWC / not promoted) |

**Parent QC addendum:** `p1-s5-qc-g5-01-20260605.md` § residuals — mark **C-W12QC-02 CLOSED** on condition register (no full re-gate required).

---

## Options considered

| Option | Rationale | QC decision |
|--------|-----------|-------------|
| **NO-GO** (process) | Pack **1/8** | **Rejected** — cosmetic `ack_status` format only; substantive evidence complete |
| **NO-GO** (product) | Ratio still &lt; 0.85 | **Rejected** — QA + QC both **0.850** |
| **GO** unconditional Phase 1 | C-W12QC-02 closed | **Rejected** — **G8**, **PROD**, **C-W12QC-01**, program gates open |
| **GO** scoped condition closure | C-W12QC-02 **CLOSED** with bounded scope | **Selected** |

---

## Final verdict

| Decision tier | **GO** (scoped) |
|---------------|-----------------|
| **C-W12QC-02** (`contracts-ratio` ≥ 0.85) | **CLOSED** — concurs QA + Dev-BE + QC spot-check |
| **SVC-06** density ratio | **UAT promotable** — PM sync `SERVICE_READINESS_UAT_PRODUCTION.md` |
| **Phase 1 DONE** | **NOT APPROVED** |
| **PROD-READY** / corporate fully live | **NOT APPROVED** |

---

## Residual / prevention

| ID | Item | Owner | QC status |
|----|------|-------|-----------|
| **C-W12QC-01** | Mobile JWT P5 UAT 36/37 | `qa-device` + `dev-mobile` | **OPEN** |
| **C-W12QC-02** | contracts-ratio ≥ 0.85 | — | **CLOSED** |
| **PREV-CR-01** | Re-run `seed:hrm:contracts-density` after G5/fidelity employee adds | `dev-be` / `devops` | **Recommend** (prevention) |
| **G8 / PROD** | Program zero-defect + corporate live | `pm` / `qc` / `devops` | **NOT MET** |

---

## completion_report

- **Closed:** **C-W12QC-02** formally — QC concurs QA + Dev-BE chain; independent `verify:hrm:menu-density` **7/7** exit **0**; `contracts-ratio` **0.850** (954/1122) ≥ **0.85**; resolves S5 G5 **6/7** gap (0.848).
- **Affirmed:** No regression to prior FAIL; idempotent seed stable (`inserted: 0` on re-run).
- **Open:** **C-W12QC-01** mobile P5; **G8**; corporate **PROD**; Phase 1 program DONE; PM refresh **SVC-06** + `PROJECT_STATUS_REPORT.md` C-W12QC-02 row.

## next_owner

**pm**

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-PM-CONTRACTS-RATIO-CLOSE-01
from_role: qc
to_role: pm
entry_criteria: QC P1-PHASE1-QC-CONTRACTS-RATIO-01 PASS_TO_PM — evidence docs/qa/evidence/p1-phase1-qc-contracts-ratio-20260605.md; C-W12QC-02 CLOSED (contracts-ratio 0.850, menu-density 7/7); C-W12QC-01 mobile OPEN; NOT Phase 1 DONE / NOT PROD
exit_criteria: Update SERVICE_READINESS_UAT_PRODUCTION.md SVC-06 → UAT PASS; PROJECT_STATUS_REPORT.md C-W12QC-02 → CLOSED; TEAM_WORKING_NOW.md residual row; addendum note on p1-s5-qc-g5-jxbos-02 condition register; no sponsor Phase 1 DONE claim
evidence_path: docs/program/SERVICE_READINESS_UAT_PRODUCTION.md
ack_status: PASS_TO_PM
pm_dispatch_hint: C-W12QC-01 mobile P5 remains P0 residual — dispatch qa-device when stack green; optional devops prevention hook for seed:hrm:contracts-density post-fidelity
```

## evidence_path

`docs/qa/evidence/p1-phase1-qc-contracts-ratio-20260605.md`

## ack_status

**PASS_TO_PM**
