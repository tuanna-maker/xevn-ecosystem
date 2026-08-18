# BE-HRM-OA-ADMIN-01 — OpenAPI /admin/* F.1 deepen

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-HRM-OA-ADMIN-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution · OpenAPI F.1 residual after G-ADM-DTO-01 |
| **date** | 2026-07-27 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD · preserve_default |
| **HOLD_DEPLOY** | yes |
| **U65** | no seed |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | khách `SRS_HRM_KHACH.md` §3.24–3.27 · **FR-HRM-02..05** · Diễn biến #1–#8 |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §16.2 · codes `HRM-ADMIN-201..204` |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` · profiles UUID · memberships TEXT `company_id` |
| **api_design** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` §A–D F.1 · residual OpenAPI CLOSED this wave |
| **openapi** | `docs/api/openapi/hrm-api.yaml` **1.3.5-admin-f1** |
| **prior residual** | `docs/qa/evidence/be-hrm-admin-dto-01-20260727.md` · OpenAPI `/admin/*` deepen |
| **must_keep** | G-ADM-DTO-01 CLOSED DTO plane · Auth/Tenant · U65 · HOLD_DEPLOY · no invent FR · no wipe DTO |
| **uc_ids** | UC-HRM-02..05 (FR-02..05 only) |
| **change_mode** | ADD |

---

## 2. What closed

| Before | After |
|--------|--------|
| OpenAPI missing `/admin/*` paths | F.1 deepen 4 primary POST paths + schemas + examples |
| Residual «OpenAPI admin paths» P2 | **CLOSED** in `API_DESIGN_HRM_ADMIN.md` §7 |
| verify needles stop at fleet keyword (58) | Admin F.1 needles → **85** checks PASS |

### Paths deepened (F.1)

| Path | operationId | Code | SRS |
|------|-------------|------|-----|
| `POST /admin/platform-admin` | `adminCreatePlatformAdmin` | `HRM-ADMIN-201` | FR-HRM-02 #1/#3/#6/#8 |
| `POST /admin/company-admin` | `adminCreateCompanyAdmin` | `HRM-ADMIN-202` | FR-HRM-03 #1/#2/#4/#6/#8 |
| `POST /admin/invite-employee` | `adminInviteEmployees` | `HRM-ADMIN-203` | FR-HRM-04 #1–#4/#6–#8 |
| `POST /admin/reset-user-password` | `adminResetUserPassword` | `HRM-ADMIN-204` | FR-HRM-05 #1/#2/#5/#6/#8 |

Each description includes **Mục đích · Nghiệp vụ · Bước SRS**. Examples use `company_id: holding` (TEXT Plane B). Reset keeps UUID `user_id`.

**Not changed:** DTO runtime (G-ADM-DTO-01 CLOSED preserved) · Auth/Tenant · seed · Phase1/PROD · §E supporting membership paths (still Info residual discoverability).

---

## 3. Files touched

| Path | Change |
|------|--------|
| `docs/api/openapi/hrm-api.yaml` | version 1.3.5-admin-f1 · tag Admin · schemas · 4 paths F.1 |
| `scripts/verify-openapi-hrm-p1-s3b.mjs` | version + Admin operationIds/paths/F.1 needles |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.controller.ts` | CODE-MEMORY APPEND (no behavior change) |
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` | OpenAPI residual CLOSED |

---

## 4. Verification

```text
pnpm run verify:openapi-hrm-p1-s3b
→ PASS verify-openapi-hrm-p1-s3b …/hrm-api.yaml (85 checks)
→ EXIT:0
```

| Needle class | Result |
|--------------|--------|
| version `1.3.5-admin-f1` | PASS |
| 4 `/admin/*` paths + operationIds | PASS |
| F.1 Mục đích ×4 FR-02..05 | PASS |
| Bước SRS FR-HRM-02..05 Diễn biến | PASS |
| `HRM-ADMIN-201..204` | PASS |
| `company_id: holding` + `G-ADM-DTO-01 CLOSED` | PASS |
| Prior IM/Fleet needles retained | PASS |

---

## 5. Residual (not this wave)

| ID | Note |
|----|------|
| G-ADM-01 | Audit log FR-05 |
| G-ADM-03 | Conflict vs upsert FR-02 |
| G-ADM-04 | Invite temp password |
| G-ADM-SCOPE-01 | Narrower-than-platform scope |
| G-ADM-05 | Reset missing user → 404 |
| G-ADM-PATH/CODE | Info alias docs |
| §E supporting membership OpenAPI | Optional deepen (not FR primary) |

---

## 6. Handoff

### completion_report

**Closed:** BE-HRM-OA-ADMIN-01 — OpenAPI F.1 deepen for `platform-admin` / `company-admin` / `invite-employee` / `reset-user-password` with Mục đích · Nghiệp vụ · Bước SRS + TEXT slug examples (`holding`); schemas + `HRM-ADMIN-201..204`; verify needles extended → **85 PASS EXIT 0**; API_DESIGN OpenAPI residual CLOSED; CODE-MEMORY APPEND on controller (no DTO/runtime wipe); G-ADM-DTO-01 CLOSED preserved; Auth/Tenant · U65 · HOLD_DEPLOY.

**Residual:** G-ADM-01/03/04/SCOPE-01/05 · §E supporting paths optional.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-OA-ADMIN-01
role: qa
lane: execution · contract spot · U65
read_first:
  - docs/qa/evidence/be-hrm-oa-admin-01-20260727.md
  - docs/hrm/API_DESIGN_HRM_ADMIN.md §A–D
  - docs/api/openapi/hrm-api.yaml (1.3.5-admin-f1) /admin/*
entry_criteria: BE READY_FOR_QA · HOLD_DEPLOY · no seed
exit_criteria:
  1) pnpm run verify:openapi-hrm-p1-s3b EXIT 0 (85+)
  2) Audit F.1 Mục đích/Nghiệp vụ/Bước SRS on 4 /admin/* paths vs API_DESIGN §A–D
  3) Confirm examples company_id TEXT slug holding + reset user_id UUID; G-ADM-DTO-01 not regressed
  4) evidence docs/qa/evidence/qa-hrm-oa-admin-01-20260727.md → PASS_TO_PM
cấm: seed admin · invent FR · Phase1/PROD · wipe DTO plane · live mutate unless contract-only
```

### evidence_path

`docs/qa/evidence/be-hrm-oa-admin-01-20260727.md`

### ack_status

**READY_FOR_QA**
