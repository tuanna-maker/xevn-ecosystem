# Evidence — D-HRM-CO-INDUSTRY-FE-01

**work_item_id:** `D-HRM-CO-INDUSTRY-FE-01`  
**role:** dev-fe  
**date:** 2026-07-27  
**ack_status:** READY_FOR_QA  
**change_mode:** FIX · preserve_default · code_memory APPEND

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/hrm/SRS.md` **UC-HRM-CO-01** / FR-HRM-CO-HC-01 — Company Management embed (ĐVTV Plane A XBOS + Plane B headcount). Industry/ngành nghề is profile field of legal entity, **not** org `entity_type`. |
| **tech / SoT field** | XBOS `xbos_legal_entity.business_lines` (org-foundation upsert DTO `businessLines`) · payload `companyForm.industry` / `businessLines` fallback · **defect:** FE mapped `member.entity_type` → `industry` |
| **i18n** | `apps/web/hrm/src/i18n/locales/vi.json` → `industries.*` (tourism, logistics, …) — same catalog as CompanyManagement Select |
| **must_keep verified** | CO-EMP-COUNT enrich path unchanged · CO-BIND tax/founded/MST enrich · GROUP_HOLDING_ROOT_ID / OU filter id |

### Defect note

`mapGroupMemberUnitsToHrmCompanies` set `industry: member.entity_type \|\| null` → UI «Ngành nghề» showed raw `subsidiary` / `holding`. **entity_type ≠ industry.**

## Problem → fix

| Before | After |
|--------|-------|
| `industry: member.entity_type` | `extractIndustryFromLegalSources({ business_lines, payload })` — never reads `entity_type` |
| Empty business_lines → still showed subsidiary | `null` → UI `-` / `—` via `\|\| '-'` + `resolveIndustryDisplay` |
| Catalog key raw in table | Key → VI label (`tourism` → «Du lịch - Khách sạn») |
| Enrich legal ignored industry | `enrichHrmCompaniesWithLegalProfiles` merges `business_lines` → industry |

## Implementation

| File | Change |
|------|--------|
| `apps/web/hrm/src/integrations/tenantScopeApi.ts` | `resolveIndustryDisplay` · `extractIndustryFromLegalSources` · mapper + legal enrich industry; CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/company/CompanyManagement.tsx` | Table/badge display via `resolveIndustryDisplay`; CODE-MEMORY APPEND |
| `apps/web/hrm/src/integrations/tenantScopeApi.test.ts` | 6 industry cases + regression empty/emp-count |
| `apps/web/hrm/src/lib/hrmCompanyEmployeeCount.test.ts` | Fixture industry no longer `'subsidiary'` |

## Vitest

```text
pnpm exec vitest run src/integrations/tenantScopeApi.test.ts src/lib/hrmCompanyEmployeeCount.test.ts
→ 2 files, 13 passed (2026-07-27)
```

## Residual / QA

- group-member-units SQL may omit `business_lines` on thin list — FE relies on legal-entities enrich (`SELECT *`) which includes column; empty SoT → honest `-`.
- Optional entity-type VI column **not** added (not already on Company table).
- HOLD_DEPLOY until QA browser PASS.

## next_owner

qa

## next_dispatch_prompt

```text
work_item_id: QA-HRM-CO-INDUSTRY-01
from_role: pm
to_role: qa
entry_criteria: D-HRM-CO-INDUSTRY-FE-01 READY_FOR_QA; L0 stack up; U65 zero-seed browser-only
exit_criteria: UF Company Ngành nghề không còn raw holding/subsidiary; empty → «-»; có business_lines thì VI/human text; CO-EMP-COUNT regression OK
evidence_path: docs/qa/evidence/qa-hrm-co-industry-01-20260727.md

Persona: ceo@xe.vn / Xevn@2026
URL: /command-center/hrm/company (portal embed) và/hoặc /company
Click path: Login → HRM → Công ty → quan sát cột «Ngành nghề» trên mọi dòng ĐVTV + holding
AC:
1. Không dòng nào hiện `subsidiary` / `holding` trong cột Ngành nghề
2. Empty business_lines → `-` (không fake ngành)
3. F5 sau load — vẫn không raw entity_type
4. Card/table Số NV không regress về toàn 0 (CO-EMP-COUNT must_keep)
spec_ref: UC-HRM-CO-01 · defect entity_type→industry misuse
cấm: seed · PASS chỉ curl
```

## ack_status

READY_FOR_QA
