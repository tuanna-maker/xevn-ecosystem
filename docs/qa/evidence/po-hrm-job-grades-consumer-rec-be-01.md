# Evidence — PO-HRM-JOB-GRADES-CONSUMER-REC-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-BE-HRM-REC-JOB-GRADE-ASSERT-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-11 |
| **ack_status** | **`READY_FOR_QA`** |
| **spec_ref** | `BA-HRM-JOB-GRADES-CONSUMER-REC-01` · **AC-SET-CONSUMER-JG-REC-01** · **VAL-JG-REC-BE-01** |
| **must_keep** | `RECCHQC1` · YCTD WF · `settings_catalog_e2e_ready=false` |

## Change (BE)

| Area | Detail |
|------|--------|
| Schema | `job_requisitions.job_grade_key TEXT NULL` via `ensureSchema` |
| Create | `CreateJobRequisitionDto.job_grade_key` · INSERT + `resolveJobGradeKeyForWrite` |
| Update | `UpdateJobRequisitionDto.job_grade_key` · PATCH touch + COALESCE |
| Assert | `SettingsCatalogsService.assertCodeInEffectiveCatalog` · `job_grades` · **`HRM-REC-GRADE-KEY`** |
| Scope | `resolveHrmSettingsCatalogCompanyId` — Group CEO `main` → `holding` catalog partition |
| List/get | `requisitionSelectSql` returns `job_grade_key` |

## Verification

| Check | Result |
|-------|--------|
| `pnpm exec jest src/recruitment/po-hrm-job-grades-consumer-rec-be-01.spec.ts` | **3/3 PASS** |
| U65 | no seed |

## Residual

- Browser QA narrow leg with FE evidence + Network `job_grade_key` body.

## completion_report

**Closed:** BE persist + catalog assert for REC YCTD `job_grade_key` per AC-SET-CONSUMER-JG-REC-01.

**Open:** QA U65 mutate + F5 label.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-JOB-GRADES-CONSUMER-REC-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-job-grades-consumer-rec-fe-01.md
  - docs/qa/evidence/po-hrm-job-grades-consumer-rec-be-01.md
  - docs/program/specs/BA-HRM-JOB-GRADES-CONSUMER-REC-01.md
entry_criteria: D-FE + D-BE READY_FOR_QA; L0 stack; ceo@xe.vn / main; job_grades EFF>0 from Settings sync (U65 — no seed)
exit_criteria: Tuyển dụng → Yêu cầu tuyển → Tạo/sửa → chọn Ngạch/bậc → POST/PATCH body job_grade_key = catalog code → 2xx → F5 list + detail label; Network evidence; cấm UF-HRM-10 full PASS; must_keep RECCHQC1
evidence_path: docs/qa/evidence/qa-po-hrm-job-grades-consumer-rec-01.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```
