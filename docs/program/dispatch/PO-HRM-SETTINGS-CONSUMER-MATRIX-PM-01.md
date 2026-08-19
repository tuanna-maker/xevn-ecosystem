# PM board — Settings consumer narrow slice (post-QC GWC)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-CONSUMER-MATRIX-PM-01` |
| **date** | 2026-08-10 |
| **qc_stamp** | `QACONPAYSTQC1-MSNG1JQC1` ([GWC consumer + PAY stale](4cb279e5-23a7-49fd-ad17-a498d79b933d)) |
| **qa_stamp** | `QACONPAYST1-MSNG1JPS` ([QA consumer + PAY stale](de7a330d-3dae-4432-945c-2747c575e58e)) |

## Annotated (narrow slice only — C-SLICE)

| Surface | UF / J-* | Dev8088 / slice | Evidence |
|---------|----------|-----------------|----------|
| Contracts create · **Phòng ban + Loại HĐ** pickers | UF-HRM-10 (legs) | **🟢 slice CLOSED** | `po-hrm-settings-catalog-consumer-audit-fe-01.md` · QA/GWC above |
| Payroll · Tạo nhóm BL · row không F5 | J-HRM-PAY-09-01 | **🟢 slice CLOSED** | `po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md` |

## Not promoted (honesty)

- `settings_catalog_e2e_ready` — **false**
- `payroll_e2e_ready` — **false**
- Full UF-HRM-10 consumer matrix · PAY module · Settings module UAT — **NOT DONE**
- **HOLD:** J-HRM-PAY-09-03 · J-HRM-PAY-09-04
- **OPEN:** `recruitment_channels` consumer (BE/BA) per audit residual

## Parent seals (RETAIN — not reopened)

`PAY09QCCST1-MSMLOEWQC1` · `PAY09QCFE1` · `PAY09QC1` · `SETFIDQC1-MSN8VQ3L`
