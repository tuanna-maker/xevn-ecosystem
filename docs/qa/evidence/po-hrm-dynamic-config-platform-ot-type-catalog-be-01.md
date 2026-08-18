# PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01 — Nest `att_ot_type` + invent KEY

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01` |
| **role** | dev-be |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **change_mode** | ADD |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |

---

## spec_read_ack

| Layer | Cite |
|-------|------|
| **srs/BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md` · **AC-PLT-ATT-OT-01 / 01b / 01c / 01d / 01e / 01f / 01H** · **VAL-ATT-OT-CNS-01..10** · invent **`HRM-ATT-OT-TYPE-KEY`** |
| **tech_spec/SA** | `…-OT-TYPE-CATALOG-SA-01.md` **Option B** Nest **DEFINE** `att_ot_type` · L-ATT-OT-* · F-ATT-CAT-OT-01/02 |
| **db_design/DATA** | `…-OT-TYPE-CATALOG-DATA-01.md` §2 · `public.att_ot_type` · partial UQ `(company_id, lower(code)) WHERE archived_at IS NULL` · `default_coeff` display-ready ≠ formula · status `active\|inactive` |
| **api_design** | F-ATT-CAT-OT-01 list/EFF/get-by-id · F-ATT-CAT-OT-02 CREATE/PATCH/retire · consumer invent KEY on `POST …/overtime-requests` |
| **sponsor_confirm** | BA-01 CONFIRMED + DATA-01 CONFIRMED · PM DISPATCHED BE-01 |

**spec says / code does**

| Spec | Impl |
|------|------|
| EnsureSchema ADD `att_ot_type` | `AttOtTypeService.ensureSchema` CREATE TABLE + partial UQ + IX list/effective + format/name/coeff/status CHKs — **no** `code IN (weekday…)` |
| Admin open N+1 | POST/PUT `/attendance/ot-types` upsert |
| List default active · include_inactive | GET `/ot-types` |
| EFF picker | GET `/ot-types/effective` |
| Soft-retire | POST `/ot-types/:id/retire` + DELETE soft; `?hard=true` → **405** |
| Display-ready | `nameVi` + `defaultCoeff` / `defaultCoefficient` on list/EFF |
| EFF>0 invent | `assertOtTypeInEffectiveCatalog` → **400 `HRM-ATT-OT-TYPE-KEY`** wired in `createOvertimeRequest` |
| EFF=0 soft-skip | assert returns null · bootstrap weekday OK · **no seed** |
| DTO open string | `CreateOvertimeRequestDto.overtime_type` remains `@IsString()` — **no** `@IsIn(3)` |
| Scope parity U19 | get-by-id uses same `resolveHrmListScope` as list |
| Formula HOLD | `default_coeff` prefill only when body.coefficient omitted — **not** payroll engine LIVE |

---

## EnsureSchema SQL cite

```sql
CREATE TABLE IF NOT EXISTS public.att_ot_type (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  name_en TEXT NULL,
  default_coeff NUMERIC(6,2) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 100,
  color TEXT NULL,
  metadata_json JSONB NULL,
  status TEXT NOT NULL DEFAULT 'active',
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- uq_att_ot_type_company_code_active (company_id, lower(code)) WHERE archived_at IS NULL
-- ix_att_ot_type_company_status / sort / effective
-- chk_att_ot_type_code_format · name_vi · default_coeff >= 0 · status IN ('active','inactive')
-- FORBIDDEN: CHECK (code IN ('weekday','weekend','holiday'))
-- U65: no starter INSERT
```

File: `apps/api/hrm-api/src/attendance/att-ot-type.service.ts` · `ensureSchema()`.

---

## Routes (Nest `/api/hrm/attendance`)

| Method | Path | Cap |
|--------|------|-----|
| GET | `ot-types/effective` | F-ATT-CAT-OT-01 picker |
| GET | `ot-types` | F-ATT-CAT-OT-01 list (default active; `include_inactive`) |
| GET | `ot-types/:otTypeId` | get-by-id scope_parity |
| POST | `ot-types` | F-ATT-CAT-OT-02 create |
| PUT | `ot-types` | upsert |
| PATCH | `ot-types/:otTypeId` | update |
| POST | `ot-types/:otTypeId/retire` | soft-retire → `inactive` + `archived_at` |
| DELETE | `ot-types/:otTypeId` | soft alias; `hard=true` → 405 |
| POST | `overtime-requests` | consumer assert KEY when EFF>0 |

Error codes: `HRM-ATT-OT-TYPE-KEY` · `HRM-ATT-OT-404` · `HRM-ATT-OT-409` · `HRM-ATT-OT-VAL` · `HRM-PLT-CAT-CODE-CONFLICT`.

---

## Files touched

| Path | Change |
|------|--------|
| `att-ot-type.constants.ts` | ADD |
| `att-ot-type.service.ts` | ADD EnsureSchema + CRUD + EFF + assert |
| `att-ot-type.service.spec.ts` | ADD jest |
| `dto/att-ot-type.dto.ts` | ADD |
| `dto/create-overtime-request.dto.ts` | CODE-MEMORY open-string lock |
| `attendance-requests.service.ts` | wire invent KEY + optional coeff prefill |
| `attendance-requests.service.spec.ts` | CNS-01/05 wire tests |
| `attendance.controller.ts` | ot-types* routes |
| `attendance.controller.spec.ts` | AttOtTypeService mock |
| `app.module.ts` | register `AttOtTypeService` |
| `attendance-sheet-scope-parity.spec.ts` · `p1-ex-https-hrm-probe-l2.spec.ts` · `p1-phase1-be-mob-jmob-04-05.spec.ts` | DI providers |

**RETAIN / FORBIDDEN honored:** leave / ATT-CODE / WS / SHIFT / LVRULE HOLD / CTR / EMP / SI / PAY · no fold · no seed · no formula LIVE · no `*_ready=true` · no aggregate wipe.

---

## Jest evidence

**Command:**

```bash
pnpm --filter hrm-api exec jest --testPathPatterns="att-ot-type.service.spec|attendance-requests.service.spec|attendance.controller.spec|attendance-sheet-scope-parity" --no-coverage
```

**Result:** exit **0** · **4** suites · **51** tests PASS.

### Invent KEY / soft-skip / scope test names

| Test | Maps |
|------|------|
| `VAL-ATT-OT-CNS-01: invent overtime_type when EFF>0 → HRM-ATT-OT-TYPE-KEY` | AC-01b |
| `VAL-ATT-OT-CNS-05 / AC-01c: empty EFF soft-skip invent assert` | AC-01c U65 |
| `VAL-ATT-OT-CNS-01 wire: createOvertimeRequest invent → HRM-ATT-OT-TYPE-KEY` | consumer wire |
| `VAL-ATT-OT-CNS-05 wire: createOvertimeRequest soft-skip when EFF empty` | consumer soft-skip |
| `VAL-ATT-OT-CAT-06 / U19 scope_parity: member cannot get holding row` | list↔get-by-id |
| `VAL-ATT-OT-CAT ensureSchema … FORBIDDEN closed weekday\|weekend\|holiday IN` | BR-PLT-05 |
| `VAL-ATT-OT-CAT-01 / AC-01d: admin CREATE open N+1 code comp_time` | admin ≠ invent |
| `listOtTypes default active exposes nameVi + defaultCoeff` | display-ready |

---

## Residual / must_keep for QA

1. FE OvertimeRequestTab still hardcode-3 sole when Nest EFF>0 → **VAL-ATT-OT-CNS-06** (FE lane residual — **not** this BE seat).
2. Settings/D4 OT REF merge-read — Nest-only EFF this seat (ATT wins when dual SoT later).
3. Approve OT path does **not** re-assert type (TXN already stored) — history retired types OK.
4. Honesty flags remain **false**.

---

## completion_report

**Closed:** Nest `public.att_ot_type` EnsureSchema + F-ATT-CAT-OT-01/02 CRUD/EFF/retire + display-ready `nameVi`/`defaultCoeff` + consumer invent **`HRM-ATT-OT-TYPE-KEY`** when EFF>0 + soft-skip when EFF=0 + U19 scope_parity jest + open DTO overtime_type + CODE-MEMORY APPEND · jest 51 PASS.

**Residual:** FE picker rebind when EFF>0 (CNS-06); dual Settings REF optional later; no payroll formula LIVE.

---

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01 READY_FOR_QA
entry_criteria: L0 stack; U65 zero-seed browser-only; BE evidence docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-be-01.md
exit_criteria: PASS_TO_PM with AC-PLT-ATT-OT-01/01b/01c/01d/01e/01f/01H evidence; invent KEY Network 400 when EFF>0; empty EFF soft-skip; admin CREATE N+1 2xx F5; no seed; honesty flags false; seals RETAIN
cấm: pnpm seed:* · API fake catalog · claim formula LIVE · flip *_ready
UF: UF-HRM-ATT-OT catalog admin + OvertimeRequestTab create invent/happy
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.md
```

## ack_status

**READY_FOR_QA**
