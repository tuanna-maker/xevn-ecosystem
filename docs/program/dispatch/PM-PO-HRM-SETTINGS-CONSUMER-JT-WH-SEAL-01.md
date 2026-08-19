# PM seal — job_titles QTCT consumer (AC-SET-CONSUMER-JT-WH-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PM-PO-HRM-SETTINGS-CONSUMER-JT-WH-SEAL-01` |
| **date** | 2026-08-10 |
| **qa_stamp** | `WHPOS1-MSNL78LF` |
| **qc_stamp** | `WHPOSQC1-MSNL78QC1` · [QC narrow JT-WH consumer slice GWC](e83e6b07-c568-4290-9f8b-19ad33ab37d9) |

## GWC — closed in slice

**AC-SET-CONSUMER-JT-WH-01** — QTCT Vị trí picker `job_titles`, POST `position_key`, F5 label; BE scope `main`→`holding` parity (`D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01`)

Evidence: `qc-po-hrm-settings-consumer-jt-wh-01.md` · QA `qa-po-hrm-settings-consumer-jt-wh-02.md`

## Retain sealed

`RECCHQC1-MSNLKIJ5QC1` · `DEPTCONREG1` · `QACONPAYSTQC1` · W3/JD/ATT family

## Denied

`settings_catalog_e2e_ready` flip · UF-HRM-10 full · Settings module UAT

## Residual (non-blocking)

CHRO second browser pick (jest covers BE)
