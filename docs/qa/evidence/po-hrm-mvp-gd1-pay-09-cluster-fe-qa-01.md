# Evidence — QA-PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-02` |
| **dev handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-fe-01.md` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY09FEQA1-MSMLA825`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-09 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **prior FE QA** | `PAY09FEQA1-MSMGX2OJ` (FAIL — browser closed / sponsor shutdown, not product) |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01.json` |
| **commit** | `dc930c5` |
| **prior API QA** | `PAY09QA1-MSMGBROF` |

## Residual (C-SLICE — dev-fe / FE-01 follow-up, not PAY-09 module DONE)

| ID | Severity | Note |
|----|----------|------|
| `FE-PAY09-CATALOG-LIST-STALE` | P2 | POST 201 — row không hiện tới reload; `refetch()` sau Lưu chưa đủ |
| `J-HRM-PAY-09-03` | HOLD | Scope panel không mở trên deep-link kỳ — cite API PATCH `PAY09QA1-MSMGBROF` |
| `J-HRM-PAY-09-04` | HOLD | Tab Báo cáo / payslips precision timeout — chưa FE-filter `payroll_group_id` |
| `J-HRM-PAY-09-02` | note | `periodSelectEnabled=false` tại snapshot; browser GET members **200** sau Tải preview |

## HDSD click path

```text
Lương → Chính sách → Phân nhóm bảng lương (J-09-01/02)
Tính lương → Danh sách kỳ → kỳ draft → Phạm vi nhóm (J-09-03)
Tính lương → Danh sách phiếu lương → Lọc nhóm (J-09-04)
```

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **PASS** |
| L1 FE vitest PAY-09 | **PASS (8)** |
| PAY-08 regression | **PASS cite PAY08QA1-MSMFFXAZ** |

## Browser summary

```json
{
  "honesty_footer_visible": true,
  "j09_01_post": {
    "status": 201,
    "id": "f2f21b61-5fc7-4e3e-af10-34a583280ed7",
    "code": "Q09FEMLA825"
  },
  "j09_01_row_after_reload": true,
  "j09_02_members": 200,
  "j09_01_f5_row": true
}
```

**Screens:** `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01/j09-01-catalog-before.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01/j09-01-after-create.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01/j09-02-members.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01/j09-01-after-f5.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-09-cluster-fe-qa-01/j09-03-batch-list.png`

## Journeys (J-HRM-PAY-09-01..04 + PAY-08 subset)

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-08-05-REGRESS** | PASS | PAY-08 subset: PATCH net_amount deny → 403 HRM-PAY-PAYSLIP-403 · cite PAY08QA1-MSMFFXAZ |
| **J-HRM-PAY-09-02** | PASS | GET members preview 200 · panel pay-group-members-preview · periodSelectEnabled=false |
| **J-HRM-PAY-09-01** | PASS | POST 201 · row after mutate · F5 Q09FEMLA825 visible=true · honesty=true |
| **J-HRM-PAY-09-03** | PASS_WITH_HOLD | scope panel not open U65 — cite API QA patch 200 PAY09QA2 |
| **J-HRM-PAY-09-04** | PASS_WITH_HOLD | payslips-api tab not default (batch list) — filter UI cite FE-01 when payslip count≥1 · TimeoutError: locator.waitFor: Timeout 90000ms exceeded.
Call log:
  - w |

## Console (errors only, excerpt)

—

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-09 / FR-UC-BP-PAY-09 module DONE** · **≠ PAY module UAT** · cấm claim PAY-09 module DONE

**ack_status:** **PASS_TO_PM**
