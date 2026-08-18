# D-HRM-UI-STRIP-TECH-CHROME-01 — FE evidence (2026-07-20)

**work_item_id:** `D-HRM-UI-STRIP-TECH-CHROME-01`  
**role:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**U65:** no seed · copy/chrome only · no business-logic change  

## Spec / sponsor intent

Sponsor: Dashboard tiles still showed API path annotations (`GET /employees/summary`, `operations/reports/summary`). Order: strip **all** user-visible technical chrome across HRM UI (and portal HRM workspace copy) — business Vietnamese only.

## Closed scope

### Hotspot — Dashboard ops tiles
- `apps/web/hrm/src/components/dashboard/PortalOperationsSummary.tsx`
  - Removed tile `hint` under values
  - CardTitle → `Tổng quan HRM` (no `UC-HRM-20`)
  - Removed subtitle `Nest API — không dùng mock…`

### Recruit / metadata / compensation (user-facing strings)
- `MetadataQueueTab.tsx`, `EmployeeMetadataPage.tsx`, `SettingsCatalogsPage.tsx`
- `JobRequisitionsTab.tsx`, `JobTemplatesTab.tsx`, `CandidatesTab.tsx`, `HeadcountProposalTab.tsx`
- `useRecruitmentPlans.ts` toasts
- `recruitmentWorkflowUi.ts` SPAWN-MISSING / LOCKED copy (no error codes / workflow code list in UI body)
- `apiError.ts` mapped messages (JWT / SPAWN-MISSING / LOCKED codes removed from user text)
- Compensation / contracts UI copy (`AC-CD-F5-*` stripped)
- Loading / sync banners: `HrmListLoadBanner`, `HrmApiSyncBanner`, `HrmApiReminders`
- Pages: Contracts / Insurance / InternalServices / DepartmentManagement loading copy
- i18n `vi.json` / `en.json` HRM-API phrasing in load/preview strings
- Softened `hrmApi.ts` fallback error messages (still keep HTTP status when useful)

### Portal embed HRM workspace
- `HrmWorkspacePanel.tsx` — insurance/decisions subtitles + metadata CTA line
- `HrmMetadataQueueSection.tsx` — header subtitle
- Confirmed **not** remounted: `PortalEmbedScopeBar` / `HrmEmbedScopeBar` (comment-only CODE-MEMORY; no JSX render)

## Grep exit criteria

| Check | Result |
|-------|--------|
| User-rendered `GET /` `POST /` `PATCH /` `UC-HRM-*` `Nest API` in TSX text/toast/Dialog | **0** (remaining hits = `@CODE-MEMORY` / block comments / `data-*` attrs for QA) |
| Dashboard tile hints | **removed** |
| Scope annotation bars remounted | **no** |

**False positives (keep):**
- `@CODE-MEMORY` / file header comments in `*.tsx` / `*.ts`
- JSX comment in `Dashboard.tsx` line ~430 (`{/* UC-HRM-20 … */}`) — not rendered
- `data-rec-wf-code="HRM-REC-WF-SPAWN-MISSING"` on banner — attribute for QA, not visible copy
- Constant codes in `recruitmentWorkflowUi.ts` / `apiError` **keys** (internal map keys)

## Tests

```text
pnpm exec vitest run src/lib/recruitmentWorkflowUi.test.ts src/lib/compensationLines.test.ts
→ 2 files, 9 tests PASS
```

## Manual smoke (dev-fe)

Not browser-run in this wave (U65 FE-only for QA). Expected after refresh:
1. Portal embed Dashboard → tiles show **label + number only**
2. Recruitment create/update toasts → no POST/PATCH paths
3. Metadata queue subtitle → count only / business VI

## Residual

- English fallbacks inside `hrmApi.ts` for empty-body / no-data still generic English (rare); not path/UC chrome.
- Detail dialog may still show raw `company_id` UUID as data field (business identifier, not annotation strip).

## Handoff

- **next_owner:** qa  
- **next_dispatch:** `QA-HRM-MENU-FULL-SWEEP-01` annotation recheck (browser FE-only)
