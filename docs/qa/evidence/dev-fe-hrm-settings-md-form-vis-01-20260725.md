# D-HRM-SETTINGS-MD-FORM-VIS-FE-01 — Upsert form visibility (leave / dept)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | dev-fe |
| **work_item_id** | `D-HRM-SETTINGS-MD-FORM-VIS-FE-01` |
| **lane** | execution |
| **QA trigger** | `docs/qa/evidence/qa-hrm-settings-master-data-02-20260725.md` — `#md-code-leaveTypes` not in DOM |
| **U65** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD · **NOT** `:8088` |
| **ack_status** | `READY_FOR_QA` |

---

## spec_read_ack

| Spec | Cite |
|------|------|
| **SRS** | `docs/client-delivery/hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md` §2 **FR-HRM-SC-POS-01** (AC-SC-POS-01 CRUD Cài đặt + F5) · §4 **FR-HRM-SC-LEAVE-01** |
| **BA AC** | `docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md` — **AC-SET-FS-01..05** · BR-SET-MD-01..03 · FR-HRM-SC-POS/LEAVE |
| **TechSpec** | `docs/hrm/TECHSPEC.md` §18.1 Settings master-data · POST `/settings-catalogs/items` |
| **change_mode** | ADD (visibility) — no REPLACE of leave/dept empty-CTA / value=code locks |

**spec says:** Settings → Danh mục nghiệp vụ → Thêm / cập nhật mục → Lưu → F5 còn.  
**code did (before):** `MasterDataBucketPanel` early-returned on `isLoading` / `isError` → no `#md-code-*`; Radix `TabsContent` unmounted inactive nested tabs → leave/dept form often missing under API race.  
**code does (after):** with `scope` → upsert form always mounts; list area only shows loading/error; CRUD tabs `forceMount`.

---

## Root cause

1. **Gate:** loading/error paths returned *before* the «Thêm / cập nhật mục» block → `#md-code-leaveTypes` absent when GET settings-catalogs flaky (`:28001`).
2. **Tabs:** inactive `TabsContent` unmounted → nested Loại nghỉ / Phòng ban remount race; automation often found panel chrome without form fields.

---

## Fix (allowed paths only)

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/settings/MasterDataSettingsPanel.tsx` | Decouple list vs form; `data-testid` `md-upsert-form-*` / `md-code-*`; `forceMount` on positions/departments/leaveTypes/decisionTypes; `@CODE-MEMORY-CHANGE` |
| `apps/web/hrm/src/components/settings/MasterDataSettingsPanel.test.ts` | 5 cases: forceMount ids, loading, error, no-scope, tab click |

**must_keep (not touched):** `catalogSearchPicker` leave/dept empty CTA · value=code · EmployeeFormDialog / LeaveTab.

---

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/components/settings/MasterDataSettingsPanel.test.ts src/lib/catalogSearchPicker.test.ts
→ Test Files  2 passed · Tests  22 passed (5 form-vis + 17 picker lock)
```

| Exit criterion | Verdict |
|----------------|---------|
| Form visible after Loại nghỉ + Phòng ban (component test) | **PASS** — `#md-code-leaveTypes` / `#md-code-departments` in DOM with scope; survive loading/error; tab click |
| Prior picker locks | **PASS** — 17/17 catalogSearchPicker |
| READY_FOR_QA | **YES** |
| Seed / Phase1 / :8088 claim | **not done** |

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| Live create leave/dept → POST 2xx → F5 | **qa** | After L0-STAB; browser UF not claimed this wave |
| hrm-api dist race | devops/dev-be | From QA-02 — outside FE scope |

---

## Handoff

- **completion_report:** Closed FE form-visibility gap for Settings nested leave/dept upsert (`#md-code-*` mounts when scope allows). Picker regression green. Live U65 create→F5 not claimed.
- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/dev-fe-hrm-settings-md-form-vis-01-20260725.md`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-SETTINGS-MASTER-DATA-03
role: qa
lane: execution
entry_criteria: L0-STAB (hrm-api :28001 stable); D-HRM-SETTINGS-MD-FORM-VIS-FE-01 READY_FOR_QA — docs/qa/evidence/dev-fe-hrm-settings-md-form-vis-01-20260725.md
U65: browser-only · zero-seed · HOLD_DEPLOY · NOT Phase1/PROD · NOT :8088
AC:
  1) Settings → Danh mục nghiệp vụ → Loại nghỉ: #md-code-leaveTypes (or data-testid) visible → nhập mã/tên → Lưu → POST settings-catalogs/items 2xx → F5 còn
  2) Same for Phòng ban (#md-code-departments)
  3) Regression: leave empty CTA / dept empty CTA / dept picker value=code (unit 17/17 ok; browser smoke)
cấm: seed invent codes; claim full matrix 🟢 if JT/POS residuals open
exit: evidence docs/qa/evidence/qa-hrm-settings-master-data-03-YYYYMMDD.md · PASS_TO_PM or FAIL with residual
```
