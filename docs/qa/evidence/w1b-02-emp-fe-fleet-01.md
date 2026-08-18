# Evidence — W1-B-02-EMP-FE-FLEET-01

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP-FE-FLEET-01` |
| **defect** | `D-HRM-FLEET-IMPORT-01` |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **parent FAIL** | `docs/qa/evidence/w1b-02-emp-qa-ret.md` |
| **ack_status** | `READY_FOR_QA` |
| **U65** | zero-seed · no `pnpm seed:*` · no EMP BE rewrite |

## Problem

QA browser J-HRM-02 blocked: Vite `Failed to resolve import "./pages/Fleet" from "src/App.tsx"` → `GET /hr/src/App.tsx` **500** → `#root` empty on `:8080/hr/employees` and `:5173/hr/employees`.

Package: `apps/web/hrm` (`vite_react_shadcn_ts`, `base: /hr/`).

## Fix (prefer restore)

Restored FL-01 list-only Fleet FE from stash commit `43c479afd56531654ee3d3100a9681f60ff7c4e0` (untracked files capture 2026-07-31):

| Path | Role |
|------|------|
| `apps/web/hrm/src/pages/Fleet.tsx` | Lazy route `/fleet` page |
| `apps/web/hrm/src/hooks/useFleetVehicles.ts` | GET list + catalog overview |
| `apps/web/hrm/src/lib/fleetCatalogUx.ts` | Empty / catalog-missing UX helpers |
| `apps/web/hrm/src/lib/fleetCatalogUx.test.ts` | Unit coverage |

`App.tsx` route table **unchanged** (minimal diff — no touch auth / Employees / EmployeeProfile).

CODE-MEMORY-CHANGE APPEND on restored files for `W1-B-02-EMP-FE-FLEET-01`.

## Verify

| Check | Result |
|-------|--------|
| `pnpm --filter vite_react_shadcn_ts exec vitest run src/lib/fleetCatalogUx.test.ts` | **6/6 PASS** |
| `GET :8080/hr/src/App.tsx` | **200** (no resolve error) |
| `GET :8080/hr/src/pages/Fleet.tsx` | **200** |
| `GET :5173/hr/src/App.tsx` | **200** (same HRM Vite via portal proxy) |
| `GET :8080/hr/employees` HTML | **200** · `#root` present · no Internal Server Error |
| `GET :5173/hr/employees?portal=1…` HTML | **200** · `#root` present · no Internal Server Error |

## must_keep

- Employees + EmployeeProfile + portal embed paths untouched
- EMP display-ready FE bindings untouched
- App.tsx auth / W1-B-04 label paths untouched
- FL-01 list-only · no invent create · U65

## Residual

- Browser J-HRM-02 click path + PATCH UI + F5 = **QA** (`W1-B-02-EMP-QA-RET2`) — FE boot unblock only; no UF 🟢 claimed here
- L1 EMP API already PASS (out of scope)

## Handoff

- **next_owner:** qa
- **ack_status:** READY_FOR_QA
