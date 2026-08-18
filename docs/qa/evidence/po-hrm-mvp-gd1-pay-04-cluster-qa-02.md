# Evidence — PO-HRM-MVP-GD1-PAY-04-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-QA-02` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY04QA2-MSMCZ6AO`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-04 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **FE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-fe-01.md` |
| **prior QA** | `PAY04QA1-MSMCR401` · `PAY04QC1-MSMCR4GWC1` sealed |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-02.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **PASS** |
| L1 FE vitest | **PASS (9)** (PAY-04 FE-01 pack) |
| L1 regression cite | **delegate PAY04QA1-MSMCR401 jest 52 PASS** (`PAY04QA1-MSMCR401`) |

## U65 J-HRM-PAY-04-06 (L2.5 browser)

| Check | Result |
|-------|--------|
| List GET payslips | **200** |
| Detail GET by id | **200** `HRM-PAY-200` |
| `pay-payslip-header-net` binds BE net | **PASS** |
| Segments table or `pay-04-honesty` | **pay-04-honesty** |
| F5 reopen same binding | **PASS** |

**Click path:** login → Lương → Báo cáo (reports) → danh sách phiếu lương → Eye → dialog `pay-payslip-detail-dialog-precision`

**Screens:** `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-04-cluster-qa-02/j-pay-04-06-list.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-04-cluster-qa-02/j-pay-04-06-detail.png`

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-04-01** | PASS_WITH_HOLD | BLOCKED U65: no mid-period C&B payslip with segment_count≥2 without CORE/FE path (zero-seed) |
| **J-HRM-PAY-04-02** | PASS_WITH_HOLD | jest+DDL OK · live segments HOLD — BLOCKED U65: no mid-period C&B payslip with segment_count≥2 without CORE/FE path (zero-seed) |
| **J-HRM-PAY-04-03** | PASS_WITH_HOLD | static merge L1 only · cite PAY04QA1 |
| **J-HRM-PAY-04-04** | PASS_WITH_HOLD | BLOCKED U65: no mid-period C&B payslip with segment_count≥2 without CORE/FE path (zero-seed) |
| **J-HRM-PAY-04-07** | PASS_WITH_HOLD | closed-hour proration jest only · cite PAY04QA1 |
| **J-HRM-PAY-04-05** | PASS | L1 SPLIT-409 contract · cite PAY04QA1 |
| **J-HRM-PAY-01-04** | PASS_WITH_HOLD | regression delegate PAY01QC1 · cite PAY04QA1 |
| **J-HRM-PAY-02-05** | PASS_WITH_HOLD | regression delegate PAY02QC1 · cite PAY04QA1 |
| **J-HRM-PAY-04-06** | PASS | L2.5 list→Eye→GET 200 · header net from BE · panel=pay-04-honesty · F5 OK |
| **J-HRM-PAY-04-08** | PASS | must_keep seals · nest /core hits=0 |

## PAY-04 segments scan (API cite)

```json
{
  "list_status": 200,
  "scanned": 25,
  "dtoSample": {
    "payslip_id": "3a5333f7-237e-4157-bade-39c4b98a3fa9",
    "has_segments_array": true,
    "split": false,
    "segmentCount": 0,
    "net_amount": 9500000
  },
  "splitSample": null
}
```

## must_keep

- `PAY01QC1-MSMBGWC1` · `PAY02QC1-MSMC4GWC1` · `PAY04QC1-MSMCR4GWC1` · cite `PAY04QA1-MSMCR401`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-04 / FR-UC-BP-PAY-04 module DONE** · **≠ PAY module UAT**

**ack_status:** **PASS_TO_PM**
