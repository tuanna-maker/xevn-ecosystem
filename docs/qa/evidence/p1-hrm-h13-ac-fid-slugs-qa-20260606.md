# QA evidence — P1-HRM-H13-AC-FID-SLUGS (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H13-AC-FID-SLUGS` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-06 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h13-ac-fid-slugs-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-03 |

## Verdict

**PASS_TO_PM** — Dev-BE seed extension verified: global `verify:hrm:menu-density` **7/7 PASS**; per-company AC-FID-03 **all five UAT slugs** `contract_ratio` **≥ 0.95**; L0 stack exit 0; L2 **P-CC-04** contracts API **200** with data @ `main`.

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api | `http://127.0.0.1:28001` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | `company_id=main` (group CEO rollup) |
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
PASS  insurance-ratio    insurance=2092 ratio need>=0.85
PASS  attendance-scale   attendance=2852 need>=22
PASS  payroll-periods    payroll_periods=59 need>=10
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=25 need>=5

=== Summary: 7/7 PASS ===
```

## AC-FID-03 — Per-company contract_ratio (same-slug join)

Probe: `HRM_ACFID03_PROBE_COMPANIES=holding,trsport,logistics,finance,services node ./scripts/tmp-p1-hrm-r-h10-01-acfid03-probe.mjs`

| company_id | active_emp | with_contract | contract_ratio | Target | Before (H13 dev) | Result |
|------------|------------|---------------|----------------|--------|------------------|--------|
| **holding** | 213 | 203 | **0.953** | ≥ 0.95 | 0.873 | **PASS** |
| **trsport** | 207 | 207 | **1.000** | ≥ 0.95 | 1.000 (R-H10-01) | **PASS** |
| **logistics** | 207 | 197 | **0.952** | ≥ 0.95 | 0.836 | **PASS** |
| **finance** | 207 | 207 | **1.000** | ≥ 0.95 | 1.000 (R-H10-01) | **PASS** |
| **services** | 207 | 197 | **0.952** | ≥ 0.95 | 0.870 | **PASS** |

Probe exit: **0** — `=== AC-FID-03 PASS ===`

## L2 — P-CC-04 contracts embed (API spot)

Probe: `node ./scripts/tmp-p1-hrm-web-audit-probe.mjs` (portal login `ceo@xe.vn`).

| P-CC | Route | Menu API | HTTP | Rows | Result |
|------|-------|----------|------|------|--------|
| P-CC-04 | `/command-center/hrm/contracts` | `/contracts-insurance/contracts?company_id=main&page_size=50` | **200** | **50** | **PASS** |

Scope parity carry-forward: J-HRM-01 contract→employee GET **200** (same probe).

## Defects / GWC closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-03 holding/logistics/services** | backlog (< 0.95) | **CLOSED** (all ≥ 0.95) |
| **R-H10-01 trsport/finance** | CLOSED (prior QA) | **Re-verified PASS** |

## Residual (out of scope — carry from dev handoff)

| ID | Owner | Note |
|----|-------|------|
| AC-FID-04 insurance | dev-be | Per-company insurance ratio still below 0.95 — separate CARD-INS-01 wave |
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging |

---

**completion_report:** **AC-FID-03 slug wave CLOSED** — all five UAT slugs (`holding`, `trsport`, `logistics`, `finance`, `services`) `contract_ratio` ≥ **0.95**; global menu-density **7/7**; L0 stack exit 0; P-CC-04 contracts data @ main. Residual: AC-FID-04 insurance per-company (separate wave).

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H13-AC-FID-SLUGS` PASS_TO_PM — mark AC-FID-03 five-slug wave **CLOSED** in fidelity matrix; dispatch **qc** H13 regression batch gate if DoD requires; defer AC-FID-04 insurance CARD-INS-01 unless PM opens seed wave.

**evidence_path:** `docs/qa/evidence/p1-hrm-h13-ac-fid-slugs-qa-20260606.md`

**pm_dispatch_hint:** No re-dispatch dev-be for H13 AC-FID slugs; next fidelity gap is AC-FID-04 insurance per-company.
