# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-BE-WATCH-TS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-WATCH-TS-01` |
| **role** | `dev-be` |
| **date** | 2026-08-07 |
| **ack_status** | `READY_FOR_QA` |
| **change_mode** | FIX · preserve_default · code_memory_required |
| **parent** | OBS from `PO-HRM-E2E-LINK-EMP-QA-J03-01` — nest `--watch` TS2345 |
| **honesty** | `contracts_printable_ready=false` · U65 zero-seed · **no** UAT claim |

---

## Root cause

| Item | Detail |
|------|--------|
| Error | `TS2345` at `contract-legal-print.service.ts` ~L1059 |
| Site | `resolvePackForEmployee` → `assertResourceInHrmScope(row, …)` |
| Why | Query typed `custom_fields: Record<string, unknown> \| string \| null` (pg JSONB), but `assertResourceInHrmScope` requires `custom_fields?: Record<string, unknown> \| null` |
| Impact | `nest --watch` / `tsc -p tsconfig.build.json` fail → QA L0 used `start:prod` dist workaround |

---

## Fix (narrow)

1. `parseJsonObject(row.custom_fields)` **before** scope assert.
2. Pass `{ company_id, custom_fields: cf }` into `assertResourceInHrmScope` (also correct for member `tenant_id` when JSONB arrives as string).
3. `@CODE-MEMORY-CHANGE` APPEND `PO-HRM-CONTRACT-LEGAL-PRINT-BE-WATCH-TS-01`.

**must_keep:** BE-02 PDF binary · print-spine · pack resolve · registry · soft-delete · honesty false. **No** wipe BE-02/BE-03 paths.

---

## Verification

| Check | Result |
|-------|--------|
| `pnpm exec tsc --noEmit -p tsconfig.build.json` | **exit 0** (no `contract-legal-print` / TS2345) |
| `pnpm run build` (`nest build` + `verify-dist`) | **exit 0** |
| `pnpm exec jest --testPathPatterns="contract-legal-print\|contract-print-pdf"` | **13/13 PASS** |
| Seed | **none** |

---

## QA smoke (compile-only product scope)

```text
entry: hrm-api source tree with this FIX
smoke: pnpm --filter hrm-api exec tsc --noEmit -p tsconfig.build.json  OR  nest start:dev — must compile without TS2345 on contract-legal-print.service.ts
exit: R-HRM-API-WATCH-TS / OBS watch closed for this file; do not promote contracts_printable_ready
```

---

## Residual

| Id | Severity | Note |
|----|----------|------|
| — | — | Compile-only FIX; print-spine / PDF product gate unchanged (`contracts_printable_ready=false`) |

---

## Handoff

- `ack_status`: **READY_FOR_QA**
- `next_owner`: **qa**
- `pm_dispatch_hint`: Confirm nest `--watch` / `start:dev` compiles clean; close OBS from J03 evidence; **no** browser UF required for this work_item unless watch still fails.
