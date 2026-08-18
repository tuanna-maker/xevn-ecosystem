# BE-HRM-ADMIN-DTO-01 — Close G-ADM-DTO-01

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-HRM-ADMIN-DTO-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution · sponsor zero-residual |
| **date** | 2026-07-27 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD · preserve_default |
| **HOLD_DEPLOY** | yes |
| **U65** | no seed |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | khách `SRS_HRM_KHACH.md` §3.24–3.27 · **FR-HRM-02..05** · Diễn biến company_id / user_id |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §16.2 · codes `HRM-ADMIN-201..204` |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` §3.3 DTO vs TEXT · profiles UUID `user_id` · memberships TEXT `company_id` |
| **api_design** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` §B/#2 · §C · §D · F.1 residual G-ADM-DTO-01 |
| **must_keep cite** | `docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md` — JWT / TEXT email `user_id` **not wiped / not unified** |
| **uc_ids** | UC-HRM-02..05 (FR-02..05 only — no invent staging/admin FR) |
| **change_mode** | ADD |

---

## 2. What closed

| Before | After |
|--------|--------|
| `CreateCompanyAdminDto.company_id` `@IsUUID()` | `@IsString` `@IsNotEmpty` `@MaxLength(64)` — Plane B slug / UUID-as-text |
| `InviteEmployeesDto.company_id` `@IsUUID()` | same TEXT ladder |
| Invite `employee_id` free string | optional `@IsUUID()` (soft employees.id) |
| `ResetUserPasswordDto.user_id` | kept `@IsUUID` — HRM profiles plane ≠ Auth email TEXT |
| Empty invite array | `@ArrayMinSize(1)` — FR-04 #3 |

**API/DB design docs:** G-ADM-DTO-01 marked **CLOSED** with this work_item.

---

## 3. Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/hrm-admin/dto/create-company-admin.dto.ts` | TEXT company_id + CODE-MEMORY |
| `apps/api/hrm-api/src/hrm-admin/dto/invite-employees.dto.ts` | TEXT company_id + UUID soft employee_id + CODE-MEMORY |
| `apps/api/hrm-api/src/hrm-admin/dto/reset-user-password.dto.ts` | CODE-MEMORY affirm UUID user_id |
| `apps/api/hrm-api/src/hrm-admin/dto/create-platform-admin.dto.ts` | CODE-MEMORY (no company_id) |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.controller.ts` | CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.service.ts` | CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.dto.spec.ts` | **ADD** class-validator plane tests |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.controller.spec.ts` | slug `holding` examples |
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` | residual CLOSED |
| `docs/hrm/DB_DESIGN_HRM_ADMIN.md` | §3.3 / gap table CLOSED |

**Untouched (must_keep):** Auth/Tenant YAML/body · Fleet/OP · Phase1/PROD · seed · OpenAPI admin deepen (still residual Info/P2).

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin --no-coverage
→ Test Suites: 3 passed · Tests: 13 passed
```

| Case | Result |
|------|--------|
| company_id `holding` / `trsport` / UUID-as-text on CreateCompanyAdmin | PASS 0 errors |
| empty company_id | PASS rejects |
| invite slug + ArrayMinSize | PASS |
| invite employee_id non-UUID | PASS rejects |
| reset user_id email TEXT | PASS rejects (UUID required) |

---

## 5. Residual (not this wave)

| ID | Note |
|----|------|
| G-ADM-01 | Audit log FR-05 |
| G-ADM-03 | Conflict vs upsert FR-02 |
| G-ADM-04 | Invite temp password |
| G-ADM-SCOPE-01 | Narrower-than-platform scope |
| G-ADM-05 | Reset missing user → 404 |
| OpenAPI `/admin/*` deepen | yaml still missing admin paths |
| G-ADM-PATH/CODE | Info alias docs |

---

## 6. Handoff

### completion_report

**Closed:** G-ADM-DTO-01 — Admin request DTO plane aligned: membership `company_id` TEXT MaxLength(64) (accepts Plane B slug); FR-05 `user_id` remains UUID; soft invite `employee_id` UUID; CODE-MEMORY APPEND; jest 13/13; API/DB design residuals CLOSED; Auth/Tenant must_keep cite preserved; no seed / no invent FR / HOLD_DEPLOY.

**Residual:** G-ADM-01/03/04/SCOPE-01/05 · OpenAPI admin deepen (separate).

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-ADMIN-DTO-01
role: qa
lane: execution · U65 browser-or-contract
read_first:
  - docs/qa/evidence/be-hrm-admin-dto-01-20260727.md
  - docs/hrm/API_DESIGN_HRM_ADMIN.md §B/§C (G-ADM-DTO-01 CLOSED)
  - apps/api/hrm-api/src/hrm-admin/dto/*.ts
entry_criteria: BE READY_FOR_QA · HOLD_DEPLOY · no seed
exit_criteria:
  1) Confirm CreateCompanyAdmin / InviteEmployees accept company_id=holding (class-validator or live ValidationPipe) — not 400 UUID-only
  2) Confirm reset-user-password rejects non-UUID user_id
  3) Update matrix/residual note G-ADM-DTO-01 CLOSED if in UF scope; else contract evidence OK
  4) evidence docs/qa/evidence/qa-hrm-admin-dto-01-20260727.md → PASS_TO_PM
cấm: seed admin/membership · wipe Auth · Phase1/PROD · invent staging
```

### evidence_path

`docs/qa/evidence/be-hrm-admin-dto-01-20260727.md`

### ack_status

**READY_FOR_QA**
