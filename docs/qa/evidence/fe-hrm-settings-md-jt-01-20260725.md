# D-HRM-SETTINGS-MD-JT-FE-01 — Job template position_code catalog SoT (FE)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | dev-fe |
| **work_item_id** | `D-HRM-SETTINGS-MD-JT-FE-01` |
| **Depends on** | `D-HRM-SETTINGS-MD-JT-BE-01` (`docs/qa/evidence/be-hrm-settings-md-jt-01-20260725.md`) |
| **spec_ref** | FR-HRM-RC-JD-01 · AC-SET-FS-03 · BR-HRM-MD-01 · VAL-SET-MD |
| **change_mode** | UPGRADE |
| **U65** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD · local only |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Spec says / code did

| Spec | Before | After |
|------|--------|-------|
| Create/update JD must persist `position_code` from `job_titles` | Form stored **label** in `position_name`; picker `onChange(hit.label)`; POST/PATCH **no** `position_code` → live create **400 HRM-REC-JD-POS** | Form SoT = `position_code`; picker `onValueChange={field.onChange}` (code); payload via `buildJobTemplatePositionFields` |
| Empty catalog → honest CTA (no invent) | Picker empty CTA existed but submit still possible with empty/label | Submit **disabled** when catalog empty / code not in options; toast + Settings link |
| Label optional denormalized | Label was sole SoT | `position_name` sent only as denorm from catalog label |

---

## 2. Changes

| File | What |
|------|------|
| `lib/catalogSearchPicker.ts` | `jobTitleOptionsFromCatalog` · `resolveJobTitleLabel` · `buildJobTemplatePositionFields` |
| `lib/catalogSearchPicker.test.ts` | +4 tests AC-SET-FS-03 |
| `lib/jobTemplatesPositionCode.test.ts` | Static lock JobTemplatesTab / hook payload |
| `components/recruitment/JobTemplatesTab.tsx` | `position_code` form field; create/update send code; submit guard; CODE-MEMORY APPEND |
| `hooks/useJobTemplates.ts` | Payload types include required `position_code` |
| `integrations/hrmApi.ts` | `HrmJobDescriptionTemplate.position_code`; create/update API types |

**must_keep:** JD CRUD when catalog has items; UF recruitment 🟢 elsewhere; CatalogSearchPicker empty CTA; no invent codes; no seed.

---

## 3. Verification

| Check | Result |
|-------|--------|
| `pnpm exec vitest run src/lib/catalogSearchPicker.test.ts src/lib/jobTemplatesPositionCode.test.ts` (apps/web/hrm) | **21/21 PASS** |
| Seed | **none** (U65) |
| Browser create→2xx→F5 | **QA** (this wave unit/static lock only) |

---

## 4. Residual (QA)

- Browser UF: Recruitment → Thư viện JD → Thêm JD → chọn chức danh catalog → Lưu → Network POST body has `position_code` → **2xx** → F5 row còn.
- Empty `job_titles` → amber CTA + Lưu disabled (no invent).
- HOLD_DEPLOY · not Phase1/PROD.

---

## 5. Handoff

- **next_owner:** `qa`
- **ack_status:** READY_FOR_QA
- **evidence_path:** `docs/qa/evidence/fe-hrm-settings-md-jt-01-20260725.md`
- **next_dispatch_prompt:** see completion packet below
