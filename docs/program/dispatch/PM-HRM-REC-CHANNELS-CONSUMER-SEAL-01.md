# PM seal — recruitment_channels consumer (AC-REC narrow)

| Meta | Value |
|------|--------|
| **work_item_id** | `PM-HRM-REC-CHANNELS-CONSUMER-SEAL-01` |
| **date** | 2026-08-10 |
| **qc_stamp** | `RECCHQC1-MSNKIJ5QC1` · [QC narrow REC channels consumer GWC](7727252e-b634-4f75-a1c0-62769b0154c9) |
| **qa_stamps** | `RECCHQA-MSNK95YR` (01/03) · `RECCHQA-MSNKIJ5R` (02) |

## GWC — closed in slice

- **AC-REC-01..03** + **AC-REC-02** + **VAL-REC-CH-FE-01**
- Preconditions (not reopened): YCTD create, WF inbox bridge, BOD `open_for_hire` — evidence chain in QA retest #1–#5

## Retain sealed (must_keep)

`DEPTCONREG1` · `SETW3SWPQC1` · `QACONPAYSTQC1` · `SETW3MUTQC1` · `ATTLVTSOTQC1` · …

## Denied

- `settings_catalog_e2e_ready` → **true**
- Full **UF-HRM-10** · Settings module UAT · recruitment module UAT

## Residual (non-blocking)

`CandidateSourceStats` P1 · `VAL-REC-CH-BE-01` · QA evidence pack hygiene (`## Residual` heading)

## Evidence

`docs/qa/evidence/qc-po-hrm-rec-channels-consumer-01.md`
