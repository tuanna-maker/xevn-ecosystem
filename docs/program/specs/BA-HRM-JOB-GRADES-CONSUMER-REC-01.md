# BA-HRM-JOB-GRADES-CONSUMER-REC-01 — `job_grades` consumer (Recruitment YCTD)

| Meta | Value |
|------|--------|
| **work_item_id** | `GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-04` |
| **parent** | `BR-SET-CONSUMER-MATRIX-01` · `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` §6.2 |
| **date** | 2026-08-11 |
| **ack_status** | `PASS_TO_PM` |
| **lane** | governance · docs only |

## spec_read_ack

| Layer | Path |
|-------|------|
| srs | `docs/hrm/SRS.md` §16.7 P0 allow-list · **FR-HRM-SC-GRADE-01** · `docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md` §3.3 |
| tech_spec | `docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md` §6 STT 37–42 · `UI-CATALOG-CONSUMER-EMP-REC.md` §4 |
| db_design | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` — module `recruitment` · DM `job_grades` |
| api_design | `docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md` — family `job_grades` / alias `grades` |

## Consumer row (P0 — next matrix leg)

| AC-ID | catalog_key | Màn → field | Owner | QA hint |
|-------|-------------|-------------|-------|---------|
| **AC-SET-CONSUMER-JG-REC-01** | `job_grades` (alias `grades`) | Tuyển dụng → tab **Yêu cầu tuyển** (`JobRequisitionsTab`) · trường **Ngạch / bậc** (persist **`job_grade_key`** = catalog `code` khi EFF>0) | **dev-fe** (`jobGradeOptionsFromCatalog` + `CatalogSearchPicker`; list/detail label `resolveJobGradeLabel`) → **dev-be** (write assert ∈ effective when EFF>0 · đề xuất **`HRM-REC-GRADE-KEY`**) | **UF-HRM-10** narrow · **FR-HRM-SC-GRADE-01** · **AC-HRM-PICKER-01** · U65: Cài đặt đồng bộ `job_grades` → Tạo/sửa YCTD chọn ngạch → POST/PATCH 2xx → F5 row + detail label · **≠** full UF-HRM-10 PASS |

## Spec says / Code does (2026-08-11)

| | Spec | Code |
|---|------|------|
| REC consumer | YCTD bind `job_grades` khi field expose (matrix §37–42) | Audit: `JobRequisitionsTab` có `job_titles` + `departments` · **không** `jobGradeOptionsFromCatalog` |
| PERF only | Optional KPI bind (E3) | `jobGradeOptionsFromCatalog` trên Performance **PASS** — **≠** đóng P0 REC leg |
| Empty | EFF=0 → CTA Settings bucket ngạch / sync | Cho phép null grade; không invent band text làm SoT khi EFF>0 |

## BR & validation (narrow)

| ID | Rule |
|----|------|
| **BR-SET-CONSUMER-JG-SOT-01** | EFF>0 → picker chỉ options `mergeEffectiveItemsByKeys(..., job_grades keys)`; POST gửi **code** |
| **BR-SET-CONSUMER-JG-SOT-02** | EFF=0 → honest empty + CTA; không claim consumer PASS |
| **VAL-JG-REC-FE-01** | Network body `job_grade_key` (hoặc field API chuẩn hiện hành) khớp code đã chọn |
| **VAL-JG-REC-BE-01** | EFF>0 · non-null grade on write → ∈ active codes · else **400** |

## OUT OF SCOPE (this leg)

| Item | Rationale |
|------|-----------|
| Performance KPI `job_grade_key` depth | E3 slice · AC-PERF-05 — wave riêng |
| JD dynamic `select` grade | `PO-HRM-JD-DYNAMIC-DATA-01` |
| `pay_types` / Payroll assert | SETFID residual **NEXT** candidate |
| Candidates `source` | **CLOSED** `RECCHQC1` |

**must_keep:** sealed `RECCHQC1` · `ATTLVTSOTQC1` · `WHPOSQC1` · `ETCTRQC1` · `settings_catalog_e2e_ready=false`.

## completion_report

**Closed:** P0 matrix leg **`job_grades` → REC YCTD** with **AC-SET-CONSUMER-JG-REC-01** + BR/VAL rows; delta §6.2 NEXT-04 appended. **Residual:** `pay_types` Payroll `component_type` assert depth · PERF optional grade on KPI · full `BR-SET-CONSUMER-MATRIX-01`.

## next_owner

`pm` → dispatch **dev-fe** then **dev-be** (pattern REC-CH / ET-CTR).

## next_dispatch_prompt

```text
work_item_id: D-FE-HRM-REC-JOB-GRADE-CONSUMER-01
role: dev-fe
read_first:
  - docs/program/specs/BA-HRM-JOB-GRADES-CONSUMER-REC-01.md
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2 AC-SET-CONSUMER-JG-REC-01
  - docs/program/specs/BA-HRM-REC-CHANNELS-CONSUMER-01.md (picker pattern)
  - apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx
entry_criteria: GOV-HRM-SETTINGS-CONSUMER-MATRIX-NEXT-04 PASS_TO_PM; must_keep RECCHQC1 + ATTLVTSOTQC1; settings_catalog_e2e_ready=false
exit_criteria: JobRequisitionsTab (± JobPostingsTab if same field) bind Ngạch/bậc via jobGradeOptionsFromCatalog + CatalogSearchPicker; persist job_grade_key on save; vitest; evidence docs/qa/evidence/po-hrm-job-grades-consumer-rec-fe-01.md; READY_FOR_QA narrow AC-SET-CONSUMER-JG-REC-01
cấm: UF-HRM-10 full PASS; reopen sealed consumer slices; seed
evidence_path: docs/qa/evidence/po-hrm-job-grades-consumer-rec-fe-01.md
```

```text
work_item_id: D-BE-HRM-REC-JOB-GRADE-ASSERT-01
role: dev-be
read_first:
  - docs/program/specs/BA-HRM-JOB-GRADES-CONSUMER-REC-01.md
  - docs/hrm/API_DESIGN_HRM_SETTINGS_E1B.md
entry_criteria: D-FE-HRM-REC-JOB-GRADE-CONSUMER-01 READY_FOR_QA or parallel if field already on DTO
exit_criteria: create/update requisition assert job_grade_key ∈ effective job_grades when EFF>0; jest; HRM-REC-GRADE-KEY (or reuse HRM-PERF-GRADE-KEY if shared); evidence docs/qa/evidence/po-hrm-job-grades-consumer-rec-be-01.md
cấm: schema break; seed
evidence_path: docs/qa/evidence/po-hrm-job-grades-consumer-rec-be-01.md
```

## evidence_path

`docs/program/specs/BA-HRM-JOB-GRADES-CONSUMER-REC-01.md` · `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2
