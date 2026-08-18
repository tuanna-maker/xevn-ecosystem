# SA-U71-HRM-ADMIN-DESIGN-01 — Physical DB + API (FR-02..05)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-ADMIN-DESIGN-01` |
| **from_role** | `pm` |
| **to_role** | `sa` |
| **lane** | governance · U71 P2 physical design |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN (canonical) | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` | **ADD** |
| API_DESIGN (canonical) | `docs/hrm/API_DESIGN_HRM_ADMIN.md` | **ADD** |
| Pointer DB | `docs/tech-spec/DB_DESIGN_HRM_ADMIN.md` | **ADD** |
| Pointer API | `docs/tech-spec/API_DESIGN_HRM_ADMIN.md` | **ADD** |
| Index promote | `docs/tech-spec/README.md` §2 → **20** pairs · §3 Admin **DONE** · Import residual P3 | **UPDATED** |

**forbidden_paths:** `apps/**` — **not touched**.

---

## 2. F.1 checklist (API_DESIGN)

| § | Endpoint | Mục đích | Nghiệp vụ xử lý | Bước SRS (UC/FR + Diễn biến) | Verdict |
|---|----------|----------|-----------------|------------------------------|---------|
| A | `POST /api/hrm/admin/platform-admin` | ✅ Tạo grant quản trị nền tảng | ✅ assertPlatformAdmin + profiles + platform_admins upsert | FR-HRM-02 #1/#3/#6/#8 · G-ADM-03 on #4 | **PASS** |
| B | `POST /api/hrm/admin/company-admin` | ✅ Gán/cập nhật quản trị ĐV | ✅ profiles + membership UPSERT role admin | FR-HRM-03 #1/#2/#6/#8 · G-ADM-DTO-01/#3 residual | **PASS** |
| C | `POST /api/hrm/admin/invite-employee` | ✅ Lô mời — kết quả từng dòng | ✅ loop UPSERT employee membership + soft employee_id | FR-HRM-04 #1/#3/#6/#7/#8 · G-ADM-04 temp pwd | **PASS** |
| D | `POST /api/hrm/admin/reset-user-password` | ✅ Đổi MK/email nhạy cảm | ✅ hash update + email cascade · no plaintext | FR-HRM-05 #1/#6/#8 · G-ADM-01/#5 residual | **PASS** |
| E | Supporting membership CRUD | ✅ Documented supporting | ✅ same table — not invent as FR primary DONE | FR-03 F5 helpers | **PASS** (supporting) |

**Note:** Wire codes TechSpec `HRM-ADMIN-201..204`. Path singular `invite-employee` = runtime SoT (G-ADM-PATH-01 vs team SRS plural).

---

## 3. must_keep (verified not rewritten)

| Pair | Path |
|------|------|
| HRM Fleet | `docs/hrm/DB_DESIGN_HRM_FLEET.md` · API |
| HRM Operations | `docs/hrm/DB_DESIGN_HRM_OPERATIONS.md` · API |
| HRM W2 slice | `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` · API |
| HRM Payroll / Leave / ATT | prior `docs/hrm/DB_DESIGN_HRM_*` |
| XBOS Auth/Tenant | `docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md` · API — **cite JWT/membership only** |
| XBOS RACI / WF / catalog-gov / KPI | prior `docs/xbos/DB_DESIGN_XBOS_*` |

---

## 4. Architecture facts (evidence-based)

| Fact | Source |
|------|--------|
| Tables `profiles` · `platform_admins` · `user_company_memberships` | `HrmAdminService.ensureAdminSchema` |
| `user_id` UUID on HRM admin plane | DDL + INSERT |
| `company_id` TEXT on memberships | DDL |
| UK `(user_id, company_id)` WHERE user_id NOT NULL | `uq_user_company_memberships_user_company` |
| Privilege: JWT role OR `platform_admins` row | `assertPlatformAdmin` |
| Soft `employee_id` on invite | invite INSERT |
| Password hash SHA-256(password) | `hashPassword` — ≠ XBOS portal hash scheme |
| Dual plane vs XBOS Auth | Auth/Tenant TEXT email `user_id` must_keep cite |
| DTO `@IsUUID()` company_id | CreateCompanyAdminDto / InviteEmployeesDto → **G-ADM-DTO-01** |
| No audit table | G-ADM-01 / TechSpec gap table |

---

## 5. Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **G-ADM-01** | P2 | `dev-be` | Audit log for sensitive reset (NFR-HRM-04) |
| **G-ADM-03** | P2 | `ba`/`dev-be` | FR-02 conflict vs upsert |
| **G-ADM-04** | P2 | `dev-be` | Invite temp password `12345678` / channel |
| **G-ADM-DTO-01** | P2 | `dev-be` | company_id UUID DTO vs TEXT slug |
| **G-ADM-SCOPE-01** | P2 | `dev-be` | Narrower-than-platform company scope |
| **G-ADM-05** | P2 | `dev-be` | Reset missing user → explicit 404 |
| **G-ADM-PATH-01** / **G-ADM-CODE-01** | Info | `ba` optional | Path/code aliases |
| OpenAPI `/admin/*` | P2 | `dev-be` | yaml deepen |
| **SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01** | P3 | `sa` | **next** IM-01 non-persist API_DESIGN |

**Non-claims:** Phase 1 DONE · PROD-READY · UF 🟢 bulk · seed for evidence · `:8088` UAT.

---

## 6. Handoff

### completion_report

**Closed:** U71 P2 HRM Admin physical design — `DB_DESIGN_HRM_ADMIN` (`profiles` / `platform_admins` / `user_company_memberships`) + `API_DESIGN_HRM_ADMIN` F.1 for FR-HRM-02..05 (`platform-admin` · `company-admin` · `invite-employee` · `reset-user-password`); dual credential plane cited vs XBOS Auth/Tenant (must_keep, no wipe); TEXT membership `company_id` + UUID `user_id` documented; supporting membership routes §E; thin pointers; README §2 count **20**; §3 Admin marked DONE; F.1 checklist complete; must_keep Fleet/OP/W2/payroll/leave/ATT + XBOS Auth/RACI/WF/catalog-gov/KPI preserved; no `apps/**`.

**Residual:** G-ADM-01/03/04/DTO-01/SCOPE-01/05 · OpenAPI deepen · next SA Import preview IM-01 (P3).

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01
role: sa
lane: governance · U71 P3
read_first:
  - docs/hrm/TECHSPEC.md §16.2 FR-HRM-IM-01 (POST …/spreadsheet/import/preview · no commit)
  - docs/hrm/DB_DESIGN_HRM_ADMIN.md · API_DESIGN_HRM_ADMIN.md (must_keep sibling just landed)
  - docs/hrm/DB_DESIGN_HRM_FLEET.md · DB_DESIGN_HRM_OPERATIONS.md · DB_DESIGN_HRM_W2_SLICE.md (must_keep)
  - docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md (must_keep)
  - docs/tech-spec/README.md §3 residual Import only
  - templates TECHSPEC_API_CONTRACT (API-only OK — no persist table)
deliver:
  - docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md F.1 for IM-01 (preview payload; cấm invent commit table as DONE)
  - optional thin DB note or explicit «no table» section in API_DESIGN / pointer
  - thin pointers + README §2 promote · mark Import DONE in §3
  - evidence docs/qa/evidence/sa-u71-hrm-import-preview-design-01-YYYYMMDD.md
change_mode: ADD · preserve_default
cấm: apps/** · wipe Admin/Fleet/OP/W2/Auth · seed · Phase1/PROD claim · invent commit/export as ALIGNED
```

### evidence_path

`docs/qa/evidence/sa-u71-hrm-admin-design-01-20260727.md`

### ack_status

**PASS_TO_PM**
