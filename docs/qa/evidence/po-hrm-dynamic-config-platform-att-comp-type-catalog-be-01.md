# BE Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | BA-01 + DATA-01 CONFIRMED Option B (Nest `att_ot_comp_type` DEFINE) |
| **change_mode** | ADD |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **Get-Item Length** | 9775 bytes |
| **git toplevel** | `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem` (canonical NFD) |

> **Path note:** OneDrive created multiple shadow copies of `Tài liệu` (NFC/NFD/ASCII). All edits, tsc, and jest ran against the **git repo (NFD)** copy verified via `git rev-parse --show-toplevel`. A transient `TS2300 Duplicate identifier` seen mid-session came from a stale OneDrive shadow directory, not the git repo — final tsc on the git repo is **exit 0**.

## spec_read_ack

- **DATA:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md` §2–§4 · §9 dev notes — ADD `public.att_ot_comp_type` (ICatalogRow, partial UQ `lower(code)`, soft-delete, list/effective IX, format/name/row-status CHKs; **no** closed `code IN (...)`; **no** coeff column; KEEP `overtime_requests.compensation_type` TEXT).
- **BA:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md` — AC-PLT-ATT-COMP-01 / 01b / 01c / 01d / 01e / 01f / 01H · BR-PLT-02/04/05/06 · BR-PLT-ATT-COMP-01..14 · VAL-ATT-COMP-CNS-01..10 · error taxonomy §7 (`HRM-ATT-OT-COMP-KEY` / `HRM-ATT-OTC-404/409/VAL`).
- **SA:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md` Option B · L-ATT-OTC-01..16 · F-ATT-CAT-OTC-01/02.
- **Peer (cite ≠ copy):** `att-ot-type.service.ts` + `att-ot-type.constants.ts` + `dto/att-ot-type.dto.ts` + controller `ot-types*` routes + `attendance-requests.service.createOvertimeRequest` OT-type wire. **Orthogonal OWN** — separate table `att_ot_comp_type`, no fold into `att_ot_type`.

## Change set (ADD only)

| File | Action |
|------|--------|
| `apps/api/hrm-api/src/attendance/att-ot-comp-type.constants.ts` | **NEW** — statuses, format regex, catalog kind, error codes (`HRM-ATT-OTC-404/409/VAL`, `HRM-ATT-OT-COMP-KEY`, conflict), starter keys (docs-only). |
| `apps/api/hrm-api/src/attendance/dto/att-ot-comp-type.dto.ts` | **NEW** — List/Upsert/Patch/Get/ListEffective DTOs. **No** `defaultCoeff`; **no** `@IsIn` ceiling. |
| `apps/api/hrm-api/src/attendance/att-ot-comp-type.service.ts` | **NEW** — `ensureSchema` ADD `public.att_ot_comp_type`; `listEffective`, `listOtCompTypes`, `getOtCompTypeById`, `upsertOtCompType`, `patchOtCompType`, `retireOtCompType`, `assertCompTypeInEffectiveCatalog`. Scope parity via `resolveHrmListScope`/`assertResourceInHrmScope` (U19). Display-ready `nameVi`. |
| `apps/api/hrm-api/src/attendance/att-ot-comp-type.service.spec.ts` | **NEW** — 9 tests (ensureSchema CHK/no-closed-IN/no att_ot_type ALTER/no coeff, admin N+1, bad format VAL, invent KEY, empty soft-skip, happy hit, soft-retire hide, U19 scope, list nameVi). |
| `apps/api/hrm-api/src/app.module.ts` | **WIRE** — import + provider `AttOtCompTypeService`. |
| `apps/api/hrm-api/src/attendance/attendance.controller.ts` | **WIRE** — inject service; routes `GET /attendance/ot-comp-types/effective`, `GET /ot-comp-types`, `POST /ot-comp-types`, `PUT /ot-comp-types`, `GET /ot-comp-types/:compTypeId`, `PATCH /ot-comp-types/:compTypeId`, `POST /ot-comp-types/:compTypeId/retire`, `DELETE /ot-comp-types/:compTypeId` (soft; hard forbidden 405). `@CODE-MEMORY-CHANGE` appended. |
| `apps/api/hrm-api/src/attendance/attendance-requests.service.ts` | **WIRE** — inject optional `AttOtCompTypeService`; `createOvertimeRequest` asserts `compensation_type ∈ EFF` when active count>0 → `HRM-ATT-OT-COMP-KEY` (400); EFF=0 soft-skip; **KEEP** `overtime_requests.compensation_type` TEXT. `@CODE-MEMORY-CHANGE` appended. |
| `apps/api/hrm-api/src/attendance/attendance.controller.spec.ts` | **WIRE** — mock + provider so existing controller tests keep passing. |
| `apps/api/hrm-api/src/attendance/dto/create-overtime-request.dto.ts` | **DOC** — `@CODE-MEMORY-CHANGE`: `compensation_type` stays open `@IsString()`; no `@IsIn` ceiling; KEY lives in service. |

## Schema (ensureSchema — no migrate execute, no seed)

```sql
CREATE TABLE IF NOT EXISTS public.att_ot_comp_type (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  name_en TEXT NULL,
  sort_order INT NOT NULL DEFAULT 100,
  color TEXT NULL,
  metadata_json JSONB NULL,
  status TEXT NOT NULL DEFAULT 'active',
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- uq_att_ot_comp_type_company_code_active: (company_id, lower(code)) WHERE archived_at IS NULL
-- ix_att_ot_comp_type_company_status / _company_sort / _effective (active & not archived)
-- chk_..._code_format (^[a-z][a-z0-9_]*$) · chk_..._name_vi (1..128) · chk_..._row_status (active|inactive)
-- FORBIDDEN: CHECK (code IN ('salary','compensatory_leave')) · ALTER att_ot_type · default_coeff column
```

## Verification evidence

| Gate | Command | Result |
|------|---------|--------|
| Type build | `node node_modules/typescript/bin/tsc -p tsconfig.build.json --noEmit` (git repo) | **exit 0** · 0 errors |
| Unit tests | `node node_modules/jest/bin/jest.js src/attendance/att-ot-comp-type.service.spec.ts att-ot-type.service.spec.ts attendance-requests.service.spec.ts attendance.controller.spec.ts` | **exit 0** · 4 suites / **56 tests** passed |
| Gate 1 Test-Path | service/spec/constants/dto | all **True** |
| Gate 2 grep | `HRM-ATT-OT-COMP-KEY` · `att_ot_comp_type` in `apps/api/hrm-api/src` | 10 · 65 matches |

### New-service spec cases (9)

- `ensureSchema` ADD `att_ot_comp_type` + CHKs; **no** closed `code IN (...)`; **no** `ALTER att_ot_type`; **no** `default_coeff`.
- Admin CREATE open N+1 (`banked_hours`) display-ready `nameVi`.
- Bad code format → `HRM-ATT-OTC-VAL`.
- Invent `compensation_type` when EFF>0 → `HRM-ATT-OT-COMP-KEY` (400) — **not** OT-TYPE key.
- Empty EFF → soft-skip (null) — U65 no seed.
- Happy: `compensation_type ∈ EFF` → display-ready hit.
- Soft-retire → inactive + `archived_at`; `listEffective` hides.
- U19 scope parity: member cannot get holding row (404/409).
- `listOtCompTypes` exposes `nameVi` for open N+1 code.

## Scope parity (U19)

`listEffective` / `listOtCompTypes` / `getOtCompTypeById` / `patchOtCompType` / `retireOtCompType` / `assertCompTypeInEffectiveCatalog` all resolve via `resolveHrmListScope` + `expandHrmTextCompanyIds`; get-by-id + mutate call `assertResourceInHrmScope` with `HRM-ATT-OTC-404/409`. Spec asserts group-CEO `main` vs member `xe-du-lich` mismatch.

## FORBIDDEN — confirmed NOT done

- ❌ fold compensation into `att_ot_type` / work_shifts / leave / day-code / worksite (separate table; spec asserts no `att_ot_type` ALTER).
- ❌ seed (ensureSchema seeds nothing; U65).
- ❌ payroll formula LIVE / coeff column (spec asserts no `default_coeff`).
- ❌ flip `attendance_uat_ready` / `payroll_e2e_ready` / `contracts_printable_ready`.
- ❌ reopen OT-TYPE / CTR / ATT L1 seals.
- ❌ mega-EAV (typed columns + optional `metadata_json` hint only).
- ✅ KEEP `overtime_requests.compensation_type` TEXT soft key.

## Honesty / seals

`attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` — **not** flipped. `C-SLICE-≠-MODULE`: this is the OT-compensation catalog slice only; not module ATT/PAY UAT. OT-TYPE / CTR / ATT-CODE / WS / SHIFT / leave / EMP / SI / PAY / DEC seals RETAIN.

## Completion contract

- **completion_report:** ADD Nest `att_ot_comp_type` open catalog LIVE — ensureSchema (partial UQ `lower(code)`, soft-delete, list/effective IX, format/name/row-status CHKs, no closed enum, no coeff), F-ATT-CAT-OTC-01/02 + EFF routes under `/attendance/ot-comp-types*`, consumer invent KEY `HRM-ATT-OT-COMP-KEY` on `createOvertimeRequest` when EFF>0 (EFF=0 soft-skip), display-ready `nameVi`, scope parity U19, orthogonal vs `att_ot_type`. tsc exit 0; 56 jest tests pass. KEEP `overtime_requests.compensation_type` TEXT. No seed / no formula LIVE / no flip / no fold / no reopen. Residual: FE rebind (dev-fe), client API DOC-DELTA (ba-docs).
- **next_owner:** qa
- **next_dispatch_prompt:** `Task qa work_item_id PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-01. U65 browser-only from FE. AC-PLT-ATT-COMP-01/01b/01c/01d/01e/01f/01H. Persona ceo@xe.vn (rollup main) + member HCNS scope 409. Verify: (1) Admin CREATE OT-compensation type N+1 (code+nameVi) → POST /api/hrm/attendance/ot-comp-types 201 → list F5 persists; (2) OvertimeRequestTab when EFF>0 picks Nest compensation → create 2xx; (3) invent compensation_type when EFF>0 → 400 HRM-ATT-OT-COMP-KEY (Network proof, no persist); (4) EFF=0 → soft empty + CTA, hardcode salary|compensatory_leave bootstrap OK, no seed; (5) soft-retire → picker hides, history OK; (6) detail shows Nest name_vi, no binary invent. Confirm KEY ≠ HRM-ATT-OT-TYPE-KEY. Do NOT claim payroll formula LIVE / flip attendance_uat_ready|payroll_e2e_ready|contracts_printable_ready. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.md. FE rebind still residual (dev-fe) — if FE not yet rebound, verify BE via API + note FE residual.`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-be-01.md`
- **ack_status:** READY_FOR_QA