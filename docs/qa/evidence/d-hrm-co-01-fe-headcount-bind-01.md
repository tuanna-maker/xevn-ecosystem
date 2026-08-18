# Evidence — D-HRM-CO-01-FE-HEADCOUNT-BIND-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-CO-01-FE-HEADCOUNT-BIND-01` |
| **Date** | 2026-08-10 |
| **Lane** | dev-fe |
| **ack_status** | `READY_FOR_QA` |
| **UC** | UC-HRM-CO-01 · AC-CO-EMP-01..06 |
| **UI spec** | `docs/hrm/ui-screens/UI-CO-COMPANY-HEADCOUNT.md` |
| **BE contract** | `docs/qa/evidence/d-hrm-co-01-summary-be-01.md` |

---

## solid_convention_ack

- **FE–BE boundary:** Card/cột chỉ đọc `GET /api/hrm/employees/summary` qua `getEmployeesSummary` — không join aggregate trên FE, không dùng LE UUID làm `company_id`.
- **Display-ready:** `rollupTotal` = `data.total` (main); cột = `by_company[slug].total` sau bridge `resolveHrmCompanyRowOperatingSlug`.
- **SOLID:** Bridge/enrich tách `hrmCompanyEmployeeCount.ts`; `CompanyManagement` chỉ bind state + testid.

## spec_read_ack

- **srs:** `docs/hrm/SRS.md` UC-HRM-CO-01 · AC-CO-EMP-01..06
- **tech_spec:** `docs/hrm/TECHSPEC.md` §19 Company Headcount dual-plane
- **api_design:** `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md`
- **ui:** `docs/hrm/ui-screens/UI-CO-COMPANY-HEADCOUNT.md`

---

## Implementation summary

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/hrmCompanyEmployeeCount.ts` | `rollupTotal` from main summary; export `parseEmployeeSummaryByCompany`; `workforce_operating_slug` on rows; enrich returns `{ companies, rollupTotal }` |
| `apps/web/hrm/src/components/company/CompanyManagement.tsx` | Card binds `rollupHeadcount`; `data-testid` `co-total-headcount`, `co-row-{slug}-count`, `co-row-{slug}-industry` |
| `apps/web/hrm/src/lib/hrmCompanyEmployeeCount.test.ts` | +2 tests: UUID drop in `by_company`, single-call rollup |

---

## Test evidence

```text
pnpm exec vitest run src/lib/hrmCompanyEmployeeCount.test.ts
# Test Files  1 passed (1)
# Tests       7 passed (7)
```

---

## QA dispatch (U65)

- **Persona:** `ceo@xe.vn` / `Xevn@2026`
- **Route:** `/command-center/hrm/company` (embed `companyId=main`)
- **Network:** `GET /api/hrm/employees/summary?company_id=main` → 2xx `HRM-EMP-SUMMARY-200`
- **AC-CO-EMP-01:** `[data-testid=co-total-headcount]` ≈ Dashboard Tổng NV
- **AC-CO-EMP-02:** `[data-testid=co-row-{slug}-count]` khớp `by_company`
- **AC-CO-EMP-06:** F5 — số giữ nguyên
- **Fail:** HRM down → cột/card «—», không `0` giả

---

## code_diff

```diff
# apps/web/hrm/src/lib/hrmCompanyEmployeeCount.ts — rollupTotal + by_company parse + workforce_operating_slug
# apps/web/hrm/src/components/company/CompanyManagement.tsx — rollupHeadcount state + QA testids
# apps/web/hrm/src/lib/hrmCompanyEmployeeCount.test.ts — parse + fetch rollup tests
```

Full diff: `git diff apps/web/hrm/src/lib/hrmCompanyEmployeeCount.ts apps/web/hrm/src/components/company/CompanyManagement.tsx apps/web/hrm/src/lib/hrmCompanyEmployeeCount.test.ts`

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | UC-HRM-CO-01 FE headcount bind: card `summary.total`, cột `by_company[slug]`, QA testids, vitest 7/7 PASS |
| **residual** | UC matrix `planned` — chỉ QA browser promote; không flip honesty flags |
| **next_owner** | qa |
| **next_dispatch_prompt** | work_item_id QA-HRM-CO-01-HEADCOUNT-01 · U65 ceo@xe.vn · menu Công ty · AC-CO-EMP-01/02/06 + co-total-headcount / co-row-*-count · Network summary 2xx · F5 · evidence `docs/qa/evidence/qa-hrm-co-01-headcount-01.md` |
| **pm_dispatch_hint** | Pair with BE evidence `d-hrm-co-01-summary-be-01.md` — assert Dashboard total parity |

---

## U65 / governance

- Zero seed · no honesty flag changes · `change_mode: UPGRADE` preserve CO-BIND / industry bind
