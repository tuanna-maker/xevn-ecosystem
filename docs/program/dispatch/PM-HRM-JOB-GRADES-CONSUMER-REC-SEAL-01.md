# PM seal — job_grades YCTD consumer (AC-SET-CONSUMER-JG-REC-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PM-HRM-JOB-GRADES-CONSUMER-REC-SEAL-01` |
| **date** | 2026-08-10 |
| **qa_stamp** | `JGRECQA-MSNP1AX8` |
| **qc_stamp** | `JGRECQC1-MSNP1AXQC1` · [QC narrow job_grades YCTD consumer GWC](af4a0f44-9ec5-4f55-bdc3-f446f6a093a0) |

## GWC — closed in slice (CREATE + F5)

**AC-SET-CONSUMER-JG-REC-01** — YCTD Ngạch/bậc `job_grade_key` POST 201 + list/detail label

Evidence: `docs/qa/evidence/qc-po-hrm-job-grades-consumer-rec-01.md`

## Carry

PATCH edit when catalog EFF ≥ 2 grades

## Retain

`RECCHQC1-MSNKIJ5QC1` · sibling consumer seals

## Denied

`settings_catalog_e2e_ready` flip · UF-HRM-10 full
