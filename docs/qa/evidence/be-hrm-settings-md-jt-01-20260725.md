# D-HRM-SETTINGS-MD-JT-BE-01 — Job template position_code catalog SoT

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | dev-be |
| **work_item_id** | `D-HRM-SETTINGS-MD-JT-BE-01` |
| **QA FAIL ref** | `docs/qa/evidence/qa-hrm-settings-master-data-01-20260725.md` §1.3 (AC-SET-FS-03 FAIL) |
| **spec_ref** | FR-HRM-RC-JD-01 (= FR-HRM-SC-JT-01) · AC-SET-FS-03 · BR-HRM-MD-01 · VAL-SET-MD |
| **change_mode** | UPGRADE |
| **U65** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Spec says / code did

| Spec | Before | After |
|------|--------|-------|
| Create JD must link `position_code` from `job_titles` (FR-HRM-RC-JD-01) | `position_code` optional; free `title`/`position_name` API-legal as sole SoT | **Required** on create DTO + service assert |
| AC-SET-FS-03 persist catalog **code** | No `assertCodeInEffectiveCatalog` on JT | `assertJdPositionCodeInCatalog` → `job_titles` |
| Reject invent-only free SoT | Allowed | Missing/invalid/cleared `position_code` → **400 `HRM-REC-JD-POS`** |

---

## 2. Changes

| File | What |
|------|------|
| `dto/create-job-template.dto.ts` | `position_code` **required** `@IsString` |
| `dto/update-job-template.dto.ts` | Comment: empty clear rejected |
| `recruitment-catalog.service.ts` | Inject `SettingsCatalogsService`; create requires + asserts code; denormalize `position_name` from catalog label when omitted; update rejects clear / invent-only `position_name` without existing code |
| `recruitment.controller.ts` | Pass `{ tenantId }` into create/update |
| `be-hrm-settings-md-jt-01.spec.ts` | DTO + service validation (8 tests) |

**must_keep:** soft-delete JD; dual catalog F1–F10; G-RC-01 requisition `job_template_id`; CRUD with **valid** catalog `position_code`.

**Error code:** `HRM-REC-JD-POS`

---

## 3. Verification

| Check | Result |
|-------|--------|
| `tsc --noEmit -p tsconfig.build.json` | **exit 0** |
| jest `be-hrm-settings-md-jt-01.spec.ts` + `recruitment-catalog.service.spec.ts` | **10/10 PASS** |
| jest `be-hrm-g-rc-01` + `be-hrm-g-db-01-hire-link-01` + `bm-be-rec-cand-get-by-id-01` | **20/20 PASS** (UF-HRM recruitment regression) |
| Seed | **none** (U65) |

---

## 4. Residual (not this wave)

- **FE bind:** `JobTemplatesTab` / `useJobTemplates` still POST/PATCH `position_name` (label) **without** `position_code` → live create will **400** until `D-HRM-SETTINGS-MD-JT-FE-01` (or equivalent) persists picker `value` as `position_code`.
- Browser UF / F5 / Network — QA after FE + L0.
- HOLD_DEPLOY · not Phase1/PROD.

---

## 5. Handoff

- **next_owner:** `qa`
- **ack_status:** READY_FOR_QA
- **evidence_path:** `docs/qa/evidence/be-hrm-settings-md-jt-01-20260725.md`
