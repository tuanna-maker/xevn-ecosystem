# HRM full quality audit — 2026-05-24

| Field | Value |
|-------|--------|
| **work_item_id** | HRM-QA-FULL-AUDIT-20260524 |
| **date** | 2026-05-24 |
| **owner** | QA |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **stack** | hrm-api `:28001` · xbos-api `:28002` · portal `:5175` |
| **method** | Automation gates + L2.5 API smoke (J-HRM-01..07); no browser click path this run |

## Executive verdict

| Layer | Verdict |
|-------|---------|
| **L0–L1 automation** | **PASS** (all scripted gates green) |
| **L2 embed list load** | **PASS** (8/8 via `test:hrm-embed:audit`) |
| **L2.5 J-HRM-01..07** | **FAIL** (5/7 PASS, 2 FAIL — see below) |
| **Overall** | **FAIL** for full HRM cross-nav closure — do **not** treat as UAT-ready for J-* until J-HRM-05 + J-HRM-07 fixed or PM-waived |

---

## Gate table

| # | Gate | Command | Exit | Result | Notes |
|---|------|---------|-----:|--------|-------|
| L0 | Dev stack | `pnpm run qc:dev-stack` | 0 | **PASS** | HRM + XBOS + portal HTTP 200 |
| G-FID | Menu data density | `pnpm run verify:hrm:menu-density` | 0 | **PASS** | **7/7** — employees 1170, contracts ratio 0.948, insurance, attendance 5534, payroll periods 57, requisitions 34, leave 25 |
| L2 | HRM embed audit | `pnpm run test:hrm-embed:audit` | 0 | **PASS** | **8/8** P-CC-03..08 + health → `hrm-embed-fe-audit-20260524.md` |
| L1 | System integration UAT | `pnpm run test:system:uat` | 0 | **PASS** | **37/37** PASS, verdict PASS → `system-integration-uat-report.json` |
| L2.5 | J-HRM-01..07 API smoke | Live probes (this doc §Journeys) | 1 | **FAIL** | 5 PASS / 2 FAIL |

---

## L2.5 — J-HRM journey results (API smoke)

Account: group CEO · `company_id=main` on list probes · `x-company-id: main` header.

| J-ID | Journey | Probe | HTTP / code | Result |
|------|---------|-------|-------------|--------|
| **J-HRM-01** | Hợp đồng → Hồ sơ NV | `GET /contracts-insurance/contracts?company_id=main` → `GET /employees/{employee_id}?company_id=main` (+ portal proxy) | 200 HRM-CON-200 → 200 HRM-EMP-200 | **PASS** |
| **J-HRM-02** | Nhân sự list → Hồ sơ | `GET /employees?company_id=main&page_size=5` → GET by id | 200 → 200 HRM-EMP-200 | **PASS** |
| **J-HRM-03** | Hợp đồng → chi tiết HĐ | List row must expose `id` + `employee_id` (no GET-by-id API) | Row `939d5bb6-…` | **PASS** |
| **J-HRM-04** | Bảo hiểm → NV linked | `GET /contracts-insurance/insurance?company_id=main` → GET employee | 200 → 200 HRM-EMP-200 | **PASS** |
| **J-HRM-05** | Tuyển dụng → ứng viên/req | Requisitions list OK; **candidates** with `company_id=main` | req 200 HRM-REC-200; cand **400 HRM-VAL-001** | **FAIL** |
| **J-HRM-06** | Chấm công → bản ghi | `GET /attendance/records?company_id=main` → GET employee from row | 200 → 200 HRM-EMP-200 | **PASS** |
| **J-HRM-07** | Lương → phiếu lương | `GET /payroll/payslips?company_id=main` → GET employee from payslip | list 200; GET emp **404 HRM-EMP-404** | **FAIL** |

### J-HRM-01 evidence (scope parity — retest after 2026-05-24 fix)

- Contract row `employee_id`: `62dff592-104c-4c8c-8e3a-a335109e3131`
- `GET /employees/62dff592-…?company_id=main` → **200** · **Lý Thị Hùng** · member `company_id` trsport (holding rollup)
- Portal proxy same path → **200**

### J-HRM-05 — FAIL detail

- `GET /recruitment/requisitions?company_id=main` → **200** HRM-REC-200 (5 rows on first page)
- `GET /recruitment/candidates?company_id=main` → **400** `HRM-VAL-001` — **`company_id must be a UUID`**
- `ListCandidatesQueryDto` requires `@IsUUID()`; requisitions list accepts slug `main` — **embed cross-nav to candidates broken for group CEO** unless FE passes resolved UUID or BE aligns validation with `resolveHrmListScope`.
- Retry with requisition row `company_id=holding` on candidates → still **400** (holding is slug, not UUID).

**Tag:** `spec_gap` + validation inconsistency · owner: **dev-be**

### J-HRM-07 — FAIL detail (scope_parity)

- Payslip sample: `726e2131-26ba-4895-84a8-ed7dc61a6f00` · `employee_id` `ecb3d81a-23b9-4792-9d8c-bcba5a0c3ba2` · payslip `company_id` **holding**
- `GET /employees/ecb3d81a-…?company_id=main` → **404** HRM-EMP-404
- `GET …?company_id=holding` → **409** SCOPE_CONTEXT_MISMATCH (header `x-company-id: main` vs query holding)

**Tag:** `scope_parity` — list under `main` rollup shows payslip but get-by-id does not resolve same employee · owner: **dev-be**

---

## Automation output summary

### `verify:hrm:menu-density`

```
PASS employees 1170 (>=1000)
PASS contracts-ratio 0.948
PASS insurance-ratio
PASS attendance-scale 5534
PASS payroll-periods 57
PASS recruitment-pipeline requisitions=34 candidates=55
PASS leave-requests 25
Summary: 7/7 PASS
```

### `test:hrm-embed:audit`

```
PASS P-CC-03..08 + FE-hrm-health (8/8)
```

### `test:system:uat`

```
Verdict: PASS — 37 PASS / 0 FAIL / 0 SKIP
```

---

## PM / Dev actions

| Priority | Item | Suggested fix |
|----------|------|----------------|
| P1 | J-HRM-07 payslip → employee 404 | Apply same `resolveHrmListScope` on GET employee when sourced from payroll list under `main` |
| P1 | J-HRM-05 candidates 400 on `main` | Allow slug `main`/holding in candidates query DTO or resolve to scope UUID server-side (parity with requisitions) |
| P2 | J-HRM-03 | Optional `GET /contracts/:id` for true detail journey (UI drawer may use row today — API PASS via list row) |

---

## References

- Journey map: `docs/program/PROGRAM_JOURNEY_MAP.md`
- Prior scope fix: `docs/qa/evidence/u18-hrm-emp-scope-fix-20260524.md`
- Embed audit: `docs/qa/evidence/hrm-embed-fe-audit-20260524.md`
- UAT report: `docs/qa/evidence/system-integration-uat-report.json`

## ack_status

**FAIL_TO_PM** — automation gates green; **L2.5 incomplete** (J-HRM-05, J-HRM-07). Recommend dispatch **dev-be** before QC GO on HRM embed journeys.
