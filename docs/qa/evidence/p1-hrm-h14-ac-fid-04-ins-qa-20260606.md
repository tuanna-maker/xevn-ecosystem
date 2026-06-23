# QA — P1-HRM-H14-AC-FID-04-INS retest (localhost U32)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H14-AC-FID-04-INS` |
| **batch** | `P1-PHASE1-QA-BATCH-RETST` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h14-ac-fid-04-ins-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-04 · CARD-INS-01 |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **7/7 PASS**; per-company AC-FID-04 **all five UAT slugs** `insurance_ratio` **≥ 0.95** vs active-contract employees; L2 **P-CC-05** insurance API **200** with **1043** rows @ `main` (no empty-state failure).

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api | `http://127.0.0.1:28001` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | `company_id=main` |
| DB | `xevn_hrm` via deploy env |

## L0 — Stack + density gates

| Check | Command | Result |
|-------|---------|--------|
| Dev stack | `pnpm run qc:dev-stack` | **exit 0** — hrm-api, xbos-api, web-portal **200** |
| Menu density | `pnpm run verify:hrm:menu-density` | **exit 0** — **7/7 PASS** |

### Density counts (QA session)

```
PASS  employees          employees=1190 (need >=1000)
PASS  contracts-ratio    contracts=1275 active=1122 ratio=1.136 need>=0.85
PASS  insurance-ratio    insurance=2152 ratio need>=0.85
PASS  attendance-scale   attendance=2854 need>=22
PASS  payroll-periods    payroll_periods=59 need>=10
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=25 need>=5

=== Summary: 7/7 PASS ===
```

## AC-FID-04 — Per-company insurance_ratio (same-slug join vs active contracts)

Probe: `node ./scripts/tmp-p1-hrm-acfid04-probe.mjs`

| company_id | with_contract | with_insurance | insurance_ratio | Target | Result |
|------------|---------------|----------------|-----------------|--------|--------|
| **holding** | 203 | 193 | **0.951** | ≥ 0.95 | **PASS** |
| **trsport** | 207 | 197 | **0.952** | ≥ 0.95 | **PASS** |
| **logistics** | 197 | 188 | **0.954** | ≥ 0.95 | **PASS** |
| **finance** | 207 | 197 | **0.952** | ≥ 0.95 | **PASS** |
| **services** | 197 | 188 | **0.954** | ≥ 0.95 | **PASS** |

Probe exit: **0** — `=== AC-FID-04 PASS ===`

## L2 — P-CC-05 insurance embed (API spot)

| P-CC | Route | Menu API | HTTP | Total rows | Result |
|------|-------|----------|------|------------|--------|
| P-CC-05 | `/command-center/hrm/insurance` | `/contracts-insurance/insurance?company_id=main&page_size=50` | **200** | **1043** | **PASS** |

Note: `/insurance-policy-participants` returns **5** rows (participant registry slice) — embed menu uses `contracts-insurance/insurance` workforce linkage; not empty BHXH banner risk.

## Defects / GWC closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-04** per-company insurance | backlog (~0.07–0.09 ratio) | **CLOSED** (all five slugs ≥ 0.95) |
| **CARD-INS-01** | seed gap | **CLOSED** via `seed:hrm:insurance-density` |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |
| AC-FID-05+ | backlog | Attendance / payslip per-company fidelity — separate waves |
| J-HRM-04 browser click | qa | API density PASS; full iframe click-path not re-run this batch |

---

**completion_report:** **AC-FID-04 insurance wave CLOSED** — all five UAT slugs `insurance_ratio` ≥ **0.95**; global menu-density **7/7**; L0 stack exit 0; P-CC-05 insurance data **1043** @ main. Residual: AC-FID-05+ attendance/payslip per-company (separate wave).

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H14-AC-FID-04-INS` PASS_TO_PM — mark AC-FID-04 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md`; next fidelity gap **AC-FID-05** attendance per-company unless PM defers; no dev-be re-dispatch for insurance density.

**evidence_path:** `docs/qa/evidence/p1-hrm-h14-ac-fid-04-ins-qa-20260606.md`

**pm_dispatch_hint:** Insurance fidelity parity with contracts (AC-FID-03) — per-company SQL probe required; global gate alone insufficient.
