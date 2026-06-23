# P1-CC-BE-MEMBER-LEGAL-SAVE-01 — Group CEO member legal entity save scope

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-BE-MEMBER-LEGAL-SAVE-01 |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | READY_FOR_QA |
| **date** | 2026-06-04 |

## Bug

Command Center `settings=company_member_units` — group CEO (`ceo@xe.vn`, JWT `tenantId=xevn`, `companyId=main`) saves member unit (e.g. XE_TMDV) → **HTTP 409** `tenantId mismatches token scope` on `PUT /org-foundation/legal-entities/:id`.

FE sends `x-tenant-id: xe-tmdv`, `x-company-id: main` while bearer carries `xevn`/`main`.

## Root cause

`OrgFoundationController` used `resolveXbosGroupLegalReadScopeContext` for POST/PUT; non-holding requests fell through to strict `resolveScopeContext` → claim `xevn` ≠ request `xe-tmdv`.

## Fix (BE)

1. **`resolveXbosGroupLegalMutationScopeContext`** (`apps/api/xbos-api/src/common/xbos-group-legal-scope.ts`):
   - Validates bearer once with JWT claims only (`resolveScopeContext` on claim tenant/company).
   - Group CEO on `xevn`/`main`: holding writes → `{ tenantId: xevn, companyId: holding }` (same as read alias).
   - Group CEO: member registry slug tenant (`xe-tmdv`, not `xevn`/`main`) → accept requested `tenantId` + `companyId` (`main` or member slug) without 409.
   - Member CEOs and mismatches → strict `resolveScopeContext`.
2. **`org-foundation.controller.ts`**: POST/PUT `legal-entities` use `mutationScope`; GET/list/org-units unchanged (`readScope`).

## Verification

```text
pnpm --filter xbos-api test -- xbos-group-legal-scope     → 14/14 PASS
pnpm --filter xbos-api test -- org-foundation.controller.spec → 12/12 PASS
```

| Test | Intent |
|------|--------|
| `resolveXbosGroupLegalMutationScopeContext` xe-tmdv/main | Group CEO member save scope |
| Member CEO cross-tenant | Still 409 |
| JWT holding vs request main | Still 409 on mutation |
| `OrgFoundationController` group CEO PUT xe-tmdv/main | Controller wiring |

## QA retest (required)

- **Route:** `https://14-225-217-232.nip.io/command-center?settings=company_member_units`
- **Account:** `ceo@xe.vn` / `Xevn@2026`
- **J-***: Command Center member unit settings save (company_member_units)
- **Expect:** PUT legal-entity **201/200**, no 409 `tenantId mismatches token scope`

## Residual / deploy

- **VPS:** `xbos-be` must be redeployed with this change before pilot retest passes (`devops`).
- **Probe:** `node scripts/tmp-cc-legal-entity-crud-probe.mjs` covers holding CRUD only; member save needs manual/CC UI or extended probe.

## Files touched

- `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts`
- `apps/api/xbos-api/src/common/xbos-group-legal-scope.spec.ts`
- `apps/api/xbos-api/src/org-foundation/org-foundation.controller.ts`
- `apps/api/xbos-api/src/org-foundation/org-foundation.controller.spec.ts`
