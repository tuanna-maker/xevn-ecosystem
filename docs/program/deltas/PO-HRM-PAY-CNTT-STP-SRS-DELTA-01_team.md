# PO-HRM-PAY-CNTT-STP-SRS-DELTA-01 — team mirror

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-SRS-DELTA-01` |
| **customer_body** | `docs/program/deltas/PO-HRM-PAY-CNTT-STP-SRS-DELTA-01.md` |
| **merge_pointer** | `docs/hrm/SRS.md` §16.9 |
| **enterprise_mirror** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` v0.42 |
| **honesty** | `payroll_e2e_ready=false` |
| **sponsor_confirm** | 2026-08-11 |

## UC inventory (ADD)

| UC-ID | FR | AMIS step | P0 function |
|-------|-----|-----------|-------------|
| UC-BP-PAY-STP-01 | FR-UC-BP-PAY-STP-01 | B1 CHUNG | F-STP-03 |
| UC-BP-PAY-STP-02 | FR-UC-BP-PAY-STP-02 | B1 RIÊNG | F-STP-03 |
| UC-BP-PAY-STP-03 | FR-UC-BP-PAY-STP-03 | B1–2 params | STP-03 |
| UC-BP-PAY-STP-04 | FR-UC-BP-PAY-STP-04 | B4 vars | ATT link |
| UC-BP-PAY-STP-05 | FR-UC-BP-PAY-STP-05 | B1 geo | F-STP-03 |
| UC-BP-PAY-STP-06 | FR-UC-BP-PAY-STP-06 | B1 VP-T | F-STP-03 |
| UC-BP-PAY-STP-07 | FR-UC-BP-PAY-STP-07 | B2 catalog | F-STP-02 |
| UC-BP-PAY-STP-08 | FR-UC-BP-PAY-STP-08 | B2 fragment | F-STP-02 |
| UC-BP-PAY-STP-09 | FR-UC-BP-PAY-STP-09 | B1/3 groups | F-STP-06 · **≠ REPLACE** FR-UC-BP-PAY-09 |
| UC-BP-PAY-STP-10 | FR-UC-BP-PAY-STP-10 | B3 template | F-STP-01 |
| UC-BP-PAY-STP-11 | FR-UC-BP-PAY-STP-11 | B3 multi | F-STP-01 |
| UC-BP-PAY-STP-12 | FR-UC-BP-PAY-STP-12 | B4 input pack | F-STP-04 |

## Handoff chain

| Owner | Artifact |
|-------|----------|
| ba-process | `PO-HRM-PAY-CNTT-BA-PROCESS-01.md` |
| ba-data | `po-hrm-pay-cntt-ba-data-01.md` |
| sa | `PO-HRM-PAY-CNTT-SA-01.md` · ADR multi-template |
| ba-docs | **this delta** |
| pm | DB_DESIGN + API_DESIGN confirm → Dev |

## must_keep (🟢 — cấm REPLACE)

- FR-UC-BP-PAY-01..09 runtime slices GWC
- FR-UC-BP-PAY-02 dual SoT · AC-PAY-COMP-01
- UC-HRM-24 embed honesty `payroll_e2e_ready=false`

## QA dispatch hints (U65)

- Menu: **Lương → Thiết lập lương** (new cluster)
- Persona: `ceo@xe.vn` C&B scope
- AC-PAY-STP-01..05 + AC-PAY-STP-GLOBAL-01..03
- **Cấm seed** mutate để có kỳ demo

Body đầy đủ 7 mục/FR: **customer_body** (clone nội dung — không chỉnh meta pipeline vào bản gửi khách HTML).
