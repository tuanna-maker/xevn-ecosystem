# PO-HRM Settings consumer — job_titles → Work Timeline (FE)

| Meta | Value |
|------|--------|
| **work_item_id** | `D-FE-HRM-WH-POSITION-PICKER-01` |
| **role** | dev-fe |
| **date** | 2026-08-11 |
| **ack_status** | `READY_FOR_QA` |

## spec_read_ack

| Field | Path / ref |
|-------|------------|
| **srs** | `docs/hrm/SRS.md` §16.8 O4 · `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2 **AC-SET-CONSUMER-JT-WH-01** |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §11.4 / §14 (profile work timeline) |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md` §3 — `position_key` |
| **api_design** | `docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md` WH-C / WH-U |
| **uc_ids** | UF-HRM-10 · AC-HRM-PICKER-01 · AC-SET-CONSUMER-JT-WH-01 |
| **change_mode** | ADD (trace helper + vitest); QTCT picker **RETAIN** E1-A wiring |

## completion_report

**Closed (FE leg):**

- **Màn:** `EmployeeProfile` → tab **Quá trình công tác** — `EmployeeWorkTimeline.tsx` (production path; `EmployeeWorkHistory.tsx` stub không mount).
- **Vị trí:** `CatalogSearchPicker` + `jobTitleOptionsFromCatalog` (`job_titles` / alias `positions`).
- **Lưu:** `resolveWorkTimelinePositionFromCatalog` → POST/PATCH body `position_key` + `position` snapshot label.
- **F5:** list dùng `resolvePositionDisplayLabel` (catalog label, không raw key).
- **HDSD:** `hdsd-work-timeline-position-picker` (`HDSD_MUTATE_TEST_IDS.workTimelinePositionPicker`).
- **Honesty:** `settings_catalog_e2e_ready=false` — không đổi flag.

**Residual:**

- Browser U65 UF-HRM-10 (XBOS pull → QTCT Lưu → F5) — **QA** narrow slice.
- Full consumer matrix — **ba-data** / `BR-SET-CONSUMER-MATRIX-01`.

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/catalogSearchPicker.ts` | `resolveWorkTimelinePositionFromCatalog` |
| `apps/web/hrm/src/components/employee/EmployeeWorkTimeline.tsx` | Save uses WH resolver; CODE-MEMORY |
| `apps/web/hrm/src/lib/po-hrm-settings-consumer-jt-wh-fe-01.test.ts` | Vitest AC-SET-CONSUMER-JT-WH-01 |

## Verification

```text
cd apps/web/hrm && pnpm test -- po-hrm-settings-consumer-jt-wh-fe-01.test.ts
→ Test Files: 1 passed · Tests: 4 passed
pnpm test -- empPositionCatalog.test.ts catalogSearchPicker.test.ts employeeWorkTimelineUi.test.ts hdsdMutateTestIds.test.ts
```

| Check | Expected |
|-------|----------|
| Picker SoT | `job_titles` EFF via `useSettingsCatalogsOverview` |
| Network POST/PATCH | `position_key` required; `position` = catalog label |
| Empty catalog | CTA `data-hrm-empty-catalog=HRM-WH-PICK-EMPTY-CATALOG` |
| QA click path | `hdsd-work-timeline-add-btn` → picker → `hdsd-work-timeline-submit` |

**U65:** QA evidence = browser-only; no seed in dev-fe proof.

## QA dispatch (copy-ready)

```text
work_item_id: QA-PO-HRM-WH-POSITION-PICKER-01
role: qa
entry_criteria: D-FE-HRM-WH-POSITION-PICKER-01 READY_FOR_QA; D-BE-HRM-WH-POSITION-KEY-01 READY_FOR_QA; L0 stack up
exit_criteria:
  - UF-HRM-10 narrow: login ceo@xe.vn → NV detail → Quá trình công tác
  - Thêm/sửa dòng → chọn Vị trí từ picker (job_titles sau catalog pull nếu EFF=0 → CTA Settings, không seed)
  - Network POST/PATCH → position_key 2xx; FE sau Lưu row label catalog; F5 giữ label
  - data-testid: hdsd-work-timeline-position-picker · hdsd-work-timeline-submit
  - evidence block mẫu qa-fe-outside-browser-gate.mdc
  - ack_status PASS_TO_PM hoặc FAIL với defect + spec_ref
cấm: pnpm seed:* · API-only PASS
hdsd_align: UF-HRM-10 QTCT Vị trí
```

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-WH-POSITION-PICKER-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-settings-consumer-jt-wh-fe-01.md
  - docs/qa/evidence/po-hrm-settings-consumer-jt-wh-be-01.md
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2 AC-SET-CONSUMER-JT-WH-01
entry_criteria: FE+BE READY_FOR_QA; browser-only U65
exit_criteria: UF-HRM-10 QTCT — CatalogSearchPicker Vị trí → Lưu 2xx → F5 label catalog; Network position_key; hdsd-work-timeline-position-picker evidence
ack_status: PASS_TO_PM or FAIL with J-* / UF-ID
```
