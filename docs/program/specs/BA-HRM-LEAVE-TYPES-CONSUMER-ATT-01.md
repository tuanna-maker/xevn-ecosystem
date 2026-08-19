# BA-HRM-LEAVE-TYPES-CONSUMER-ATT-01 — `leave_types` consumer (Nest EFF ≠ Settings MD)

| Meta | Value |
|------|--------|
| **work_item_id** | `GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-03` |
| **parent** | `BR-SET-CONSUMER-MATRIX-01` · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §6.2 |
| **date** | 2026-08-11 |
| **ack_status** | `PASS_TO_PM` |
| **lane** | governance · docs only |

## spec_read_ack

| Layer | Path |
|-------|------|
| srs | `docs/hrm/SRS.md` §16 · **FR-HRM-SC-LEAVE-01** · P0 allow-list `leave_types` |
| tech_spec | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md` Option B |
| db_design | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` §1.1 #3 · `att_leave_type` + REF merge |
| api_design | `GET /api/hrm/attendance/leave-types/effective` (**F-ATT-CAT-EFF-01**) · `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` REF `leave_types` |

## Consumer row (P0)

| AC-ID | catalog_key | Màn → field | Owner | QA hint |
|-------|-------------|-------------|-------|---------|
| **AC-SET-CONSUMER-LV-ATT-01** | `leave_types` (family; consumer SoT = **Nest effective union** ATT ∪ group REF) | **Chấm công → Nghỉ phép** (`LeaveTab` picker + label) · **Dashboard** `HrmApiReminders` pending-leave label | **dev-fe** (align all TXN surfaces to `useAttLeaveTypesEffective`) → **dev-be** (regression: create assert **RETAIN** `HRM-LEAVE-TYPE-UNKNOWN`) | **UF-HRM-10** narrow · **AC-PLT-ATT-LEAVE-01** · U65: tạo loại phép tab ATT (hoặc sync REF) → đơn nghỉ chọn code ∈ EFF → POST 2xx → F5 · **≠** full UF-HRM-10 PASS |

## Spec says / Code does

| | Spec | Code (2026-08-11) |
|---|------|-------------------|
| Consumer SoT | Picker / assert = **`GET …/attendance/leave-types/effective`** when EFF>0; Settings MD `leave_types` = merge-read only (**BR-PLT-06** · **BR-PLT-ATT-LEAVE-04**) | `LeaveTab.tsx` → `useAttLeaveTypesEffective` **PASS** |
| Dual SoT honesty | Cấm `leaveTypeOptionsFromCatalog(settings overview)` làm SoT mã trên luồng nghiệp vụ | `HrmApiReminders.tsx` → `leaveTypeOptionsFromCatalog(catalogs)` **FAIL** (label lệch / empty khi ATT có row nhưng MD REF chưa sync) |
| Empty | EFF=0 → empty picker + CTA tab **Loại phép ATT** / sync | LeaveTab honest empty **PASS**; Reminders nên resolve label qua cùng EFF hook |

## Validation matrix

| Condition | Rule | Expected |
|-----------|------|----------|
| EFF>0 | Picker options | Chỉ codes từ effective API (ATT wins collision vs REF) |
| EFF=0 | Honest empty | CTA → Cài đặt ATT Loại phép; không invent `annual`/`sick` hardcode |
| Mutate | U65 | Chọn loại → Lưu đơn → Network POST `leave_type` = catalog code → F5 |
| Display | Pending list / reminders | Label = `resolveLeaveTypeLabel(effectiveOptions, code)` — **cùng** option set LeaveTab |
| Regression | ATT LVT sealed tab mutate | Không đổi `ATTLVTSOTQC1` smoke-only path |

## BR (narrow)

| BR-ID | Rule |
|-------|------|
| **BR-SET-CONSUMER-LV-SOT-01** | Mọi surface **TXN** (tạo/duyệt/hiển thị đơn) dùng **F-ATT-CAT-EFF-01**; Settings overview `leave_types` chỉ cho MD admin / empty CTA |
| **BR-SET-CONSUMER-LV-SOT-02** | `HrmApiReminders` và widget tương lai **cấm** import `leaveTypeOptionsFromCatalog` cho label map khi Nest reachable |
| **VAL-LV-ATT-FE-01** | FE vitest: Reminders (hoặc shared helper) không gọi `leaveTypeOptionsFromCatalog` khi `isHrmNestApiReachable()` |

## scope_parity

List leave requests và get-by-id dùng cùng `company_id` scope — không đổi WI; QA regression J-HRM-ATT leave list→detail nếu đụng Reminders.

## Traceability

| SRS / BR | API | DB | FE (target) | Test |
|----------|-----|----|-------------|------|
| FR-HRM-SC-LEAVE-01 · AC-PLT-ATT-LEAVE-01 | `GET …/leave-types/effective` | `att_leave_type` + REF merge | `LeaveTab` · `HrmApiReminders` | AC-SET-CONSUMER-LV-ATT-01 |
| BR-PLT-06 | settings-catalogs REF read | `synced_catalogs.leave_types` | MD panel only | Vitest + U65 narrow |

## Honesty

`settings_catalog_e2e_ready=false` · **cấm** claim UF-HRM-10 full PASS · **cấm** reopen sealed `departments` · `recruitment_channels` · `contract_types` CTR · `job_titles` QTCT · `employment_types` CTR `work_arrangement` (`ETCTRQC1`).

## completion_report

**Closed:** P0 matrix leg **`leave_types` → ATT consumer effective SoT** with **AC-SET-CONSUMER-LV-ATT-01** + BR/VAL rows; delta §6.2 appended (NEXT-03). **Residual:** `BR-SET-CONSUMER-MATRIX-01` full P0 keys (`pay_types` depth, `job_grades` recruitment bind, …) · §6.2 REC/ET rows hygiene CLOSED stamps · `HrmApiReminders` execution.

## next_owner

`dev-fe` (primary) · `dev-be` (regression only)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-LEAVE-TYPES-CONSUMER-ATT-FE-01
role: dev-fe
read_first:
  - docs/program/specs/BA-HRM-LEAVE-TYPES-CONSUMER-ATT-01.md
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2 AC-SET-CONSUMER-LV-ATT-01
  - apps/web/hrm/src/components/attendance/LeaveTab.tsx (peer: useAttLeaveTypesEffective)
  - apps/web/hrm/src/components/dashboard/HrmApiReminders.tsx
  - apps/web/hrm/src/hooks/useAttLeaveTypesEffective.ts
  - apps/web/hrm/src/lib/hrmSettingsLeaveTypeSot.ts
entry_criteria: GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-03 PASS; must_keep ATTLVTSOTQC1 leave-types smoke; settings_catalog_e2e_ready=false
exit_criteria: HrmApiReminders pending-leave labels use useAttLeaveTypesEffective (or shared resolveLeaveTypeLabel on effective options); remove leaveTypeOptionsFromCatalog from TXN path; vitest lock VAL-LV-ATT-FE-01; evidence docs/qa/evidence/po-hrm-leave-types-consumer-att-fe-01.md; READY_FOR_QA narrow AC-SET-CONSUMER-LV-ATT-01
cấm: UF-HRM-10 full PASS; reopen ETCTR/WHPOS/RECCH/DEPT sealed slices; seed
allowed_paths: apps/web/hrm/src/components/dashboard/** · apps/web/hrm/src/hooks/useAttLeaveTypesEffective.ts · apps/web/hrm/src/lib/hrmSettingsLeaveTypeSot.ts · related tests
evidence_path: docs/qa/evidence/po-hrm-leave-types-consumer-att-fe-01.md
```

## evidence_path

`docs/program/specs/BA-HRM-LEAVE-TYPES-CONSUMER-ATT-01.md` · `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2 (NEXT-03)
