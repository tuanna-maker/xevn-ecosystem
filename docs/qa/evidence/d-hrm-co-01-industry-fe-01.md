# Evidence — D-HRM-CO-01-INDUSTRY-FE-01

**work_item_id:** `D-HRM-CO-01-INDUSTRY-FE-01`  
**role:** dev-fe  
**date:** 2026-08-10  
**ack_status:** READY_FOR_QA  
**change_mode:** FIX · preserve_default · code_memory APPEND

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/hrm/SRS.md` **UC-HRM-CO-01** · **FR-HRM-CO-IND-01** · **AC-CO-IND-01..04** · **BR-CO-IND-01** · VAL-CO-IND-01 |
| **tech** | `docs/hrm/TECHSPEC.md` §20 (industry Plane A `business_lines`) · orthogonal §19 headcount Plane B |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` § Company «Ngành nghề» |
| **backlog** | `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` §2 — sole `planned` UC-HRM-CO-01 (FE slice) |

## solid_convention_ack

- Industry display logic in **mapper** (`tenantScopeApi`) — not in table cell formulas.
- FE does not join XBOS + HRM aggregates; headcount remains `hrmCompanyEmployeeCount` enrich.
- `resolveIndustryDisplay` = single display gate (blocklist entity_type + catalog VI).

## Problem → fix

| Before | After |
|--------|-------|
| `industry ← member.entity_type` → raw `subsidiary` / `holding` | `extractIndustryFromLegalSources({ business_lines, payload })` — **never** `entity_type` |
| Catalog keys (`tourism`, `logistics`) shown raw | `INDUSTRY_CATALOG_VI` → VI labels aligned with `industries.*` i18n |
| Missing industry | UI **«—»** (AC-CO-IND-03); blocklist keys → null → «—» |

## Implementation

| File | Change |
|------|--------|
| `apps/web/hrm/src/integrations/tenantScopeApi.ts` | `resolveIndustryDisplay` · `extractIndustryFromLegalSources` · `INDUSTRY_CATALOG_VI`; mapper + legal enrich industry |
| `apps/web/hrm/src/integrations/tenantScopeApi.test.ts` | 8 cases — entity_type block, business_lines text/key, companyForm fallback, legal enrich |
| `apps/web/hrm/src/components/company/CompanyManagement.tsx` | Table/detail bind `resolveIndustryDisplay`; empty «—»; CODE-MEMORY UC-HRM-CO-01 |

### must_keep verified (code)

- `mapGroupMemberUnitsToHrmCompanies` keeps `employee_count: null` — enrich unchanged in `fetchCompanies`
- `enrichHrmCompaniesWithWorkforceCounts` + `formatHrmEmployeeCount` + card `sumKnownEmployeeCounts` untouched
- CO-BIND legal profile path (`fetchGroupMemberUnitsForHrm`) unchanged order

## Tests

```text
cd apps/web/hrm
pnpm exec vitest run src/integrations/tenantScopeApi.test.ts src/lib/hrmCompanyEmployeeCount.test.ts
→ Test Files  2 passed (2) · Tests  13 passed (13)
```

## QA browser (U65 — zero seed)

**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**URL:** Portal embed HRM → menu **Công ty** (`/hr/...` company route, portal mode)

| UF / AC | Action | PASS when |
|---------|--------|-----------|
| AC-CO-IND-01 | Load list | Cột «Ngành nghề» = VI label khi XBOS có `business_lines` / companyForm industry |
| AC-CO-IND-02 | Scan rows | **Không** thấy `subsidiary` / `holding` / raw entity_type |
| AC-CO-IND-03 | Holding / empty member | «—» khi không có ngành SoT |
| AC-CO-IND-04 | Detail badge | View dialog badge khớp cột list |
| AC-CO-IND-06 | F5 | Cùng nhãn; Network `group-member-units` / legal-entities **2xx** |
| **Regression** AC-CO-EMP-* | Same session | Card Tổng NV + cột Số NV vẫn khớp summary slug (không về 0 giả) |

**Journey:** `J-HRM-CO-01` (list Company embed, group CEO `company_id=main`)

## Matrix promote (after QA PASS)

```bash
pnpm docs:phase1:matrix
```

Promote `UC-HRM-CO-01` when QA confirms AC-CO-IND + AC-CO-EMP (BE summary slice `D-HRM-CO-01-SUMMARY-BE-01` if still open — industry FE does not block IND AC).

## Residual

| Id | Note |
|----|------|
| R1 | BE `D-HRM-CO-01-SUMMARY-BE-01` — `by_company` batch headcount; FE interim N× summary unchanged |
| R2 | Member list without `business_lines` in API — industry may show «—» until legal enrich 2xx |

## next_owner

**qa** — browser retest AC-CO-IND-* + AC-CO-EMP regression on Company embed.

## next_dispatch_prompt

```text
work_item_id: QA-HRM-CO-01-INDUSTRY-01
entry: dev-fe READY_FOR_QA D-HRM-CO-01-INDUSTRY-FE-01 · evidence docs/qa/evidence/d-hrm-co-01-industry-fe-01.md
exit: Browser U65 ceo@xe.vn — HRM embed Công ty — AC-CO-IND-01..04 + AC-CO-IND-06 F5; regression AC-CO-EMP card/cột NV; Network group-member-units exposes business_lines when DB has value
on PASS: pnpm docs:phase1:matrix to promote UC-HRM-CO-01 industry+headcount closure per backlog
ack_status: PASS_TO_PM or FAIL with spec_ref + screenshot
```
