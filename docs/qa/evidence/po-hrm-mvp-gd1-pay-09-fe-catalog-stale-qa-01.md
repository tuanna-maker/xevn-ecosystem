# Evidence — QA-PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01` |
| **dev handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY09CSTQA1-MSMLOEWZ`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY module DONE · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **prior FE QA** | `PAY09FEQA1-MSMLA825` (defect `FE-PAY09-CATALOG-LIST-STALE`) |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.json` |
| **commit** | `dc930c5` |

## HDSD click path

```text
Lương → Chính sách → Phân nhóm bảng lương
Tạo nhóm mới → Lưu (no manual F5)
```

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **PASS** |
| L1 vitest | **11 PASS** — payPay09GroupRing · clusterFe01 source · usePayrollGroups.cache |

## J-HRM-PAY-09-01

| Check | Result |
|-------|--------|
| Verdict | **PASS** |
| POST create | {"status":201,"id":"1a4f40c9-22aa-42be-941f-aa6c9b909e3d","code":"Q09CSTMLOEWZ"} |
| Row visible ≤20s (no F5) | **true** |
| Defect cleared | **true** |

```json
{
  "honesty_footer_visible": true,
  "j09_01_post": {
    "status": 201,
    "id": "1a4f40c9-22aa-42be-941f-aa6c9b909e3d",
    "code": "Q09CSTMLOEWZ"
  },
  "j09_01_row_without_f5": true,
  "defect_fe_pay09_catalog_list_stale_cleared": true
}
```

**Screens:** `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01/before-create.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01/after-create-no-f5.png`

## Console (errors only)

—

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY module UAT** · cấm claim PAY-09 / PAY module DONE

**ack_status:** **PASS_TO_PM**
