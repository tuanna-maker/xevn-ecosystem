# QA — P1-HRM-H19-AC-FID-09-REC retest (recruitment pipeline fidelity)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H19-AC-FID-09-REC-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h19-ac-fid-09-rec-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-09 · CARD-REC-01/02 |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **8/8 PASS** (`recruitment-pipeline`: req **38** ≥ **5**, cand **114** ≥ **15**, avg **3.000** ≥ **3**, zero requisitions under 3 candidates); independent AC-FID-09 SQL probe **PASS**; L0 stack exit 0; L2 **P-CC-06 recruitment** API **200** `HRM-REC-200` with **24** scoped requisitions + **99** candidates @ `main`; J-HRM-05 list→GET requisition detail **200** `HRM-REC-200`.

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api | `http://127.0.0.1:28001` |
| xbos-api | `http://127.0.0.1:28002` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | `company_id=main` |
| DB | `xevn_hrm` via deploy env |

## L0 — Stack + density gates

| Check | Command | Result |
|-------|---------|--------|
| Dev stack | `pnpm run qc:dev-stack` | **exit 0** — hrm-api, xbos-api, web-portal **200** |
| Menu density | `pnpm run verify:hrm:menu-density` | **exit 0** — **8/8 PASS** |

### Density counts (QA session)

```
PASS  employees          employees=1190 (need >=1000)
PASS  contracts-ratio    contracts=1275 active=1122 ratio=1.136 need>=0.85
PASS  insurance-ratio    insurance=2152 ratio need>=0.85
PASS  attendance-scale   attendance=13291 need>=22
PASS  payroll-fidelity   payroll_periods=119; payslip_closed_ratio >=0.9 all slugs
PASS  recruitment-pipeline requisitions=38 candidates=114 avg=3.000 under_min_cand_req=0 need req>=5 cand>=15 avg>=3
PASS  leave-requests     leave_requests=100 need>=5
PASS  catalog-fidelity   synced_catalog_keys >=8/company (all slugs 74)

=== Summary: 8/8 PASS ===
```

**Recruitment uplift vs prior H18 wave:** candidates **55 → 114** (+59 seed rows); avg **1.447 → 3.000**; `requisitions_under_min_cand` **37 → 0**.

## AC-FID-09 — Group + per-requisition pipeline

Probe: `recruitmentFidelityStats` via `node ./scripts/tmp-p1-hrm-h19-rec-qa-probe.mjs`

| Metric | Value | Threshold | Result |
|--------|-------|-----------|--------|
| Group requisitions | **38** | ≥ **5** | **PASS** |
| Group candidates | **114** | ≥ **15** | **PASS** |
| Avg candidates / requisition | **3.000** | ≥ **3** | **PASS** |
| Requisitions with &lt; 3 candidates | **0** | **0** | **PASS** |

## L2 — P-CC-06 recruitment embed (API spot)

| P-CC | Route | Menu API | HTTP | Code | Scoped rows | 409 | Result |
|------|-------|----------|------|------|-------------|-----|--------|
| P-CC-06 | `/command-center/hrm/recruitment` | `GET /api/hrm/recruitment/requisitions?company_id=main&page_size=50` | **200** | HRM-REC-200 | **24** requisitions | none | **PASS** |
| P-CC-06 | `/command-center/hrm/recruitment` | `GET /api/hrm/recruitment/candidates?company_id=main&page_size=50` | **200** | HRM-REC-200 | **99** candidates | none | **PASS** |

**Note:** API rollup @ `main` returns **24** requisitions vs DB group **38** — consistent with ADR scope ladder. L2 criterion: non-empty requisitions + candidates + no 409.

## L2.5 — J-HRM-05

| Journey | Click path | List HTTP | Detail HTTP | Requisition id | Result |
|---------|------------|-----------|-------------|----------------|--------|
| J-HRM-05 | recruitment tab → requisition row → GET `/recruitment/requisitions/:id` | req **200** / cand **200** | **200** HRM-REC-200 | `c0410818-79b4-4efb-8dc5-60a64c1b1cbe` | **PASS** |

## Defects / closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-09** recruitment pipeline | avg 1.447; 37 reqs under min | **CLOSED** (avg **3.000**, zero under-min) |
| **CARD-REC-01/02** candidate cohort | sparse per requisition | **CLOSED** (114 candidates, 3/requisition) |
| **menu-density recruitment-pipeline** | cand=55 only count gate | **PASS** at **8/8** with AC-FID-09 semantics |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |
| **AC-FID-10+** | backlog | Settings catalog / metadata — H20 wave (parallel QA) |
| P-CC-06 browser iframe | qa | API L2 PASS; full iframe click not re-run this quick retest |

---

**completion_report:** **AC-FID-09 recruitment pipeline wave CLOSED** — group requisitions **38**, candidates **114**, avg **3.000**, zero requisitions under 3 candidates; global menu-density **8/8** (`recruitment-pipeline` gate); L0 stack exit 0; P-CC-06 recruitment tab **24** reqs + **99** candidates @ main, no 409; J-HRM-05 list→detail **200**. Residual: browser iframe GWC; AC-FID-10 catalog fidelity verified in parallel H20 QA.

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H19-AC-FID-09-REC-QA` PASS_TO_PM — mark AC-FID-09 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json`; pair with H20 AC-FID-10 PASS for fidelity batch; optional **qc** narrow re-gate AC-FID-04..10 chain.

**evidence_path:** `docs/qa/evidence/p1-hrm-h19-ac-fid-09-rec-qa-20260606.md`

**pm_dispatch_hint:** Scoped API counts (24/99) vs DB group (38/114) both non-empty — do not FAIL on rollup delta alone.
