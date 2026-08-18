# QA-HRM-OA-ADMIN-01 — OpenAPI /admin/* F.1 contract spot

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-OA-ADMIN-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · contract spot · U65 |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `docs/qa/evidence/be-hrm-oa-admin-01-20260727.md` READY_FOR_QA · HOLD_DEPLOY |
| **spec_ref** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` §A–D · OpenAPI `hrm-api.yaml` **1.3.5-admin-f1** |
| **prior CLOSED** | G-ADM-DTO-01 — `docs/qa/evidence/qa-hrm-admin-dto-01-20260727.md` (**do not regress**) |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Contract spot: OpenAPI F.1 on 4 primary `POST /admin/*` | Live mutate admin / seed invite |
| verify:openapi-hrm-p1-s3b ≥85 EXIT 0 | Browser UF · Phase1/PROD · `:8088` |
| Examples Plane B `company_id: holding` · reset `user_id` UUID | Wipe / reopen G-ADM-DTO-01 DTO plane |
| Audit Mục đích · Nghiệp vụ · Bước SRS vs API_DESIGN §A–D | Invent FR · claim §E supporting membership DONE |

---

## 2. Environment

| Item | Result |
|------|--------|
| Workspace | `C:\xevn-ecosystem` |
| Seed | **none** (U65) |
| Live admin mutate | **none** (contract-only read) |
| HOLD_DEPLOY | yes |

---

## 3. Exit criteria results

### 3.1 verify:openapi-hrm-p1-s3b

```text
pnpm run verify:openapi-hrm-p1-s3b
→ PASS verify-openapi-hrm-p1-s3b …/hrm-api.yaml (85 checks)
→ EXIT:0
```

| Expect | Result |
|--------|--------|
| EXIT 0 | **PASS** |
| 85+ checks | **85 PASS** |
| version `1.3.5-admin-f1` | **PASS** (info.version) |

### 3.2 F.1 audit — 4 `/admin/*` vs API_DESIGN §A–D

| Path | opId | Code | Mục đích | Nghiệp vụ | Bước SRS (OpenAPI cite) | API_DESIGN § | Verdict |
|------|------|------|----------|-----------|-------------------------|--------------|---------|
| `POST /admin/platform-admin` | `adminCreatePlatformAdmin` | `HRM-ADMIN-201` | Platform grant → profiles + platform_admins · unlock UC-03 | Auth → assertPlatformAdmin → validate → findOrCreate → UPSERT (G-ADM-03) | FR-HRM-02 #1/#3/#6/#8 · §3.24 | **A** | **PASS** |
| `POST /admin/company-admin` | `adminCreateCompanyAdmin` | `HRM-ADMIN-202` | Gán QT ĐV · membership TEXT company_id · unlock UC-04 | Auth → validate TEXT company_id (G-ADM-DTO-01) → UPSERT membership | FR-HRM-03 #1/#2/#4/#6/#8 · §3.25 | **B** | **PASS** |
| `POST /admin/invite-employee` | `adminInviteEmployees` | `HRM-ADMIN-203` | Lô mời per-row result · không dừng lô | Bearer/key → TEXT company_id + ArrayMinSize → per-row (G-ADM-04) | FR-HRM-04 #1–#4/#6–#8 · §3.26 | **C** | **PASS** |
| `POST /admin/reset-user-password` | `adminResetUserPassword` | `HRM-ADMIN-204` | Reset mật khẩu/email · không lộ secret | Auth → UUID user_id → UPDATE; audit **G-ADM-01** residual | FR-HRM-05 #1/#2/#5/#6/#8 · §3.27 | **D** | **PASS** |

Aligned: each OpenAPI description includes **Mục đích · Nghiệp vụ · Bước SRS**; wires `HRM-ADMIN-201..204`; cites API_DESIGN Endpoint A–D; residual honesty G-ADM-03/04/01/05 called out in OA/API_DESIGN (not claimed CLOSED by this wave).

### 3.3 Examples + G-ADM-DTO-01 no regression

| Check | Evidence | Verdict |
|-------|----------|---------|
| `company_id: holding` TEXT Plane B | OA examples `slugHolding` / `batchSlug`; schema `CreateCompanyAdminRequest` / `InviteEmployeesRequest` type string maxLength 64 · example holding | **PASS** |
| reset `user_id` UUID | OA examples `55555555-5555-4555-8555-555555555555`; schema `format: uuid` | **PASS** |
| G-ADM-DTO-01 not wiped | Runtime DTO: `CreateCompanyAdminDto` / `InviteEmployeesDto` `@IsString` `@MaxLength(64)` (not `@IsUUID`); `ResetUserPasswordDto` `@IsUUID`; OA must_keep + schema text `G-ADM-DTO-01 CLOSED`; verify needle `G-ADM-DTO-01 CLOSED` | **PASS** |
| Prior QA DTO evidence | `qa-hrm-admin-dto-01-20260727.md` CLOSED retained — this wave did **not** re-open or mutate DTO files | **PASS** |

### 3.4 API_DESIGN residual table

| ID | Status after this QA |
|----|----------------------|
| ~~OpenAPI admin paths~~ | **CLOSED** (BE + QA contract spot) |
| ~~G-ADM-DTO-01~~ | **CLOSED** preserved |
| G-ADM-01 / 03 / 04 / SCOPE-01 / 05 | **OPEN** (P2) — not this wave |
| §E supporting membership OpenAPI | Optional / not FR primary |

---

## 4. Residual (still open — not blocking OA F.1)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-ADM-01** | P2 | `dev-be` | Audit log FR-05 |
| **G-ADM-03** | P2 | `ba` / `dev-be` | Conflict vs upsert FR-02 |
| **G-ADM-04** | P2 | `dev-be` | Invite temp password channel |
| **G-ADM-SCOPE-01** | P2 | `dev-be` | Narrower-than-platform scope |
| **G-ADM-05** | P2 | `dev-be` | Reset missing user → 404 |
| G-ADM-PATH/CODE | Info | `ba` optional | Alias docs |

**Not claimed:** Phase1 DONE · PROD · `:8088` · live admin mutate PASS · §E OpenAPI deepen DONE.

---

## 5. Handoff

### completion_report

**Closed:** QA-HRM-OA-ADMIN-01 — contract spot PASS. `pnpm run verify:openapi-hrm-p1-s3b` **85 checks EXIT 0**; OpenAPI **1.3.5-admin-f1** F.1 Mục đích · Nghiệp vụ · Bước SRS audited on all 4 primary `POST /admin/*` against API_DESIGN §A–D (FR-HRM-02..05 · HRM-ADMIN-201..204); examples confirm Plane B `company_id: holding` and reset `user_id` UUID; G-ADM-DTO-01 CLOSED **not** regressed (DTO runtime + OA must_keep + verify needles). U65: no seed, no live admin mutate, HOLD_DEPLOY.

**Residual:** G-ADM-01 / 03 / 04 / SCOPE-01 / 05 stay **OPEN** (P2).

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-OA-ADMIN-01
role: qc
lane: governance · GWC local · HOLD_DEPLOY
read_first:
  - docs/qa/evidence/qa-hrm-oa-admin-01-20260727.md
  - docs/qa/evidence/be-hrm-oa-admin-01-20260727.md
  - docs/hrm/API_DESIGN_HRM_ADMIN.md §A–D · §7 residual
  - docs/api/openapi/hrm-api.yaml version 1.3.5-admin-f1 (/admin/*)
entry_criteria: QA-HRM-OA-ADMIN-01 PASS_TO_PM · verify 85 EXIT 0 cited · U65 · HOLD_DEPLOY
exit_criteria:
  1) Formal GWC: OpenAPI admin F.1 CLOSED (BE-HRM-OA-ADMIN-01 + QA spot)
  2) Confirm G-ADM-DTO-01 remains CLOSED (no reopen)
  3) Residual G-ADM-01/03/04/SCOPE-01/05 stay OPEN explicitly
  4) evidence docs/qa/evidence/qc-hrm-oa-admin-01-20260727.md → PASS_TO_PM
  5) verify:qc:evidence-pack if required by QC gate pack
cấm: Phase1/PROD · :8088 · seed · invent FR · wipe DTO plane · claim UF admin mutate
```

### evidence_path

`docs/qa/evidence/qa-hrm-oa-admin-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

PASS → **QC-HRM-OA-ADMIN-01** GWC local; residual **G-ADM-01/03/04/SCOPE/05** stay OPEN; HOLD_DEPLOY; no Phase1/PROD.
