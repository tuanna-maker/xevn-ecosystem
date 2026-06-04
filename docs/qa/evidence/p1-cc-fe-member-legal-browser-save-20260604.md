# Dev-FE evidence — P1-CC-FE-MEMBER-LEGAL-BROWSER-SAVE-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-BE-FE-MEMBER-LEGAL-BROWSER-SAVE-01 |
| **from_role** | dev-fe |
| **to_role** | devops → qa |
| **ack_status** | **READY_FOR_QA** |
| **depends_on** | QA L2.5 FAIL `docs/qa/evidence/p1-cc-qa-member-legal-save-l25-20260604.md` |

## Root cause (FE)

Browser PUT sent root `code`/`name` = edited display label (`QA L25 browser save 20260604`) instead of member slug `XE_DU_LICH` when detail GET failed and `companyForm.shortName` drifted from list row code.

## Fix

| File | Change |
|------|--------|
| `legalEntityPutBody.ts` | `normalizeLegalEntityPutBody` prefers `payload.companyForm.shortName` for root `code`; syncs nested `shortName`/`nameVi` |
| `orgFoundationApi.ts` | `createLegalEntity` / `updateLegalEntity` normalize body before PUT |
| `CommandCenterPage.tsx` | `saveCompanySettings` uses `scopeRow.code` as stable member slug; builds payload with corrected `companyFormForPayload` |
| `legalEntityFormMapper.ts` | `mapLegalEntityRowToCompanyForm` keeps `row.code` when nested `shortName` equals display name; `parseLegalEntitySaveFieldErrors` maps `code`/`name` → `shortName`/`nameVi` |

## Verify

```powershell
pnpm --filter web-portal exec vitest run src/integrations/legalEntityPutBody.test.ts src/integrations/legalEntityFormMapper.test.ts
pnpm --filter web-portal build
```

| Check | Result |
|-------|--------|
| vitest legalEntityPutBody + formMapper | **9/9 PASS** |
| web-portal build | **exit 0** |

## QA retest (after devops portal deploy)

1. `https://14-225-217-232.nip.io/command-center?settings=company_member_units` — `ceo@xe.vn`
2. **J-CC-02**: XE_DU_LICH → Chỉnh sửa → change **Tên tiếng Việt** → **Lưu thay đổi**
3. Expect: no ERROR banner; PUT **200**; request JSON root `code: "XE_DU_LICH"`, `name: <edited nameVi>`

## Residual

| Item | Owner |
|------|--------|
| Portal rebuild/deploy on nip.io | devops |
| Member GET-by-id preload (409/warn banner) | dev-be (separate) |
| BE 500 on malformed payload | dev-be (deployed middleware) |

## ack_status

**READY_FOR_QA** — FE normalize + stable member code wired; deploy portal then L2.5 retest.
