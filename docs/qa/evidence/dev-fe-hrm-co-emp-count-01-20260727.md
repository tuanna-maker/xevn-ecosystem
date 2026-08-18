# Evidence — D-HRM-CO-EMP-COUNT-FE-01

**work_item_id:** `D-HRM-CO-EMP-COUNT-FE-01`  
**role:** dev-fe  
**date:** 2026-07-27  
**ack_status:** READY_FOR_QA  
**change_mode:** FIX · preserve_default · code_memory APPEND

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.2 `/company` (UC-HRM-03) · `docs/hrm/SRS.md` §15 **BR-INT-05** (ĐVTV vận hành map 1:1 với slug `employees.company_id`) |
| **tech** | `GET /api/hrm/employees/summary` (`hrmApi.getEmployeesSummary` / FE-04 dashboard) · `apps/web/hrm/src/lib/hrmListScope.ts` operating slugs · `GET /api/hrm/operating-units` display_name bridge |
| **sibling BE** | `D-HRM-CO-EMP-COUNT-BE-01` — `by_company` **chưa** có trên `EmployeeSummaryResult` (src). FE type optional `by_company` sẵn; runtime interim = N× summary theo slug |

## Problem → fix

| Before | After |
|--------|-------|
| `mapGroupMemberUnitsToHrmCompanies` hard-sets `employee_count: null` | Mapper **giữ** null (XBOS không có headcount) — đúng |
| UI `employee_count \|\| 0` → card/table luôn **0** | Enrich sau load qua **operating slug**; UI `formatHrmEmployeeCount` → «—» khi unknown |
| Dashboard đúng qua `employees/summary` | Company page dùng **cùng** summary API, keyed by slug — dashboard path **không đổi** |

## Implementation

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/hrmCompanyEmployeeCount.ts` | Bridge LE/holding → slug; enrich; sumKnown; fetch (prefer `by_company` else per-slug) |
| `apps/web/hrm/src/lib/hrmCompanyEmployeeCount.test.ts` | Vitest: null→enriched; LE UUID không làm company_id count |
| `CompanyManagement.tsx` | `enrichHrmCompaniesWithWorkforceCounts` after CO-BIND fetch; card/table/detail «—» |
| `hrmApi.ts` | Optional `HrmEmployeeSummary.by_company` (types only) |
| `tenantScopeApi.ts` | CODE-MEMORY APPEND only — mapper null kept |

### Bridge rules (BR-INT-05)

1. `xbos-group-holding-root` / tên Tập đoàn → `holding`
2. Name match vs `GET /operating-units` `display_name_vi` (+ folded fallback LE names)
3. Pilot HRM UUID map only — **cấm** LE UUID làm `company_id` summary
4. Interim: try `summary?company_id=main` + `by_company`; else `Promise.all` summary per slug

### must_keep verified (code)

- CO-BIND tax/founded/MST enrichment path unchanged (`fetchGroupMemberUnitsForHrm` → legal enrich first)
- OU filter / JWT `companyId` not mutated
- Dashboard `useEmployeesSummary` unchanged

## Tests

```text
pnpm exec vitest run src/lib/hrmCompanyEmployeeCount.test.ts src/integrations/tenantScopeApi.test.ts
→ Test Files  2 passed (2) · Tests  7 passed (7)
```

## Residual

| Id | Note |
|----|------|
| R1 | BR-INT-05 4 LE ≠ 5 slug — row không map → «—»; sum card = sum known rows (có thể &lt; dashboard `main` nếu thiếu 1 slug trên list) |
| R2 | BE `by_company` chưa ship — interim N calls; flip automatic when BE adds field |

## next_owner

**qa** — `QA-HRM-CO-EMP-COUNT-01`
