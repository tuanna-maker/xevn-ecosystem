# QA — PO-HRM-PAY-TYPES-CONSUMER-PAY-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-PAY-TYPES-CONSUMER-PAY-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-11 |
| **ack_status** | **`PASS_TO_PM`** |
| **spec_ref** | `BA-HRM-PAY-TYPES-CONSUMER-PAY-01` · **AC-SET-CONSUMER-PT-PAY-01** · **J-HRM-PAY-E2-01** (narrow) |
| **persona** | `ceo@xe.vn` / `company_id=main` · portal `http://127.0.0.1:5173` |
| **commit** | `dc930c5` |
| **stamp** | **`PTPAYQA-MSNPHTEC`** |
| **u65** | zero-seed · `pay_types` EFF=3 từ Settings sync sẵn có — **no** `pnpm seed:*` |
| **honesty** | `settings_catalog_e2e_ready=false` · `payroll_e2e_ready=false` · **≠** UF-HRM-10 full · **must_keep** JGRECQC1 · ATTLVTSOTQC1 · ETCTRQC1 · RECCHQC1 · QACONPAYSTQC1 |

## L0 / automation

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | HRM + XBOS + portal **HTTP 200** (Node process exit glitch on Windows — services healthy) |
| `pnpm run qc:fe-be-health` | **exit 0** |
| `vitest` (5 files per Dev handoff) | **57/57** |

## UF narrow — AC-SET-CONSUMER-PT-PAY-01

### Click path (J-HRM-PAY-E2-01 narrow)

- **URL:** `/hr/payroll` → tab **Thành phần lương** (`payroll-tab-components`)
- **HDSD testids:** `hdsd-pay-salary-component-add` · `hdsd-pay-salary-component-type` · `hdsd-pay-salary-component-save`

### Trước mutate

- `pay_types` EFF=3 · codes `cham_cong` / `luong` / `thue` · `GET /api/hrm/settings-catalogs?company_id=main`
- Picker parity: **3** options = API EFF **3**

### Action + Network

- Tạo TP: mã `QA_PT_MSNPHTEC` · tên `QA TP PAY PTPAYQA-MSNPHTEC` · **Bản chất** = `cham_cong` (Chấm công)
- **POST** `/api/hrm/payroll/salary-components` → **201**
- Body (excerpt): `component_type: "cham_cong"` (catalog code, not VI label)

### FE sau 2xx + F5

- Row list hiển thị tên TP + cột bản chất **Chấm công** (`resolvePayTypeLabel`)
- **F5:** row + label retained · mã API normalize uppercase `QA_PT_MSNPHTEC` (list có thể ẩn mã thường — assert theo tên + label)

### Regression API (VAL-PT-PAY-BE-01)

- **POST** invent `component_type=INVENT_PT_*` → **400** `HRM-PAY-TYPE-KEY`

### Regression sealed consumers

- `scripts/qa/_tmp-qa-hrm-settings-consumer-pay-stale-01.mjs` → **exit 0** (QACONPAYSTQC1 không reopen)

## Verdict matrix

| AC / step | Verdict |
|-----------|---------|
| PAY-TYPES-EFF>0 | 🟢 |
| Picker = catalog EFF | 🟢 |
| AC-SET-CONSUMER-PT-PAY-01 CREATE (POST + `component_type` code) | 🟢 |
| AC-SET-CONSUMER-PT-PAY-01 F5 list + label | 🟢 |
| VAL-PT-PAY-BE-01 invent `HRM-PAY-TYPE-KEY` | 🟢 |
| REGRESSION QACONPAYST | 🟢 |

## Artifacts

- Runtime JSON: `docs/qa/evidence/_tmp-qa-po-hrm-pay-types-consumer-pay-01.json`
- Screens: `docs/qa/evidence/screens/qa-po-hrm-pay-types-consumer-pay-01/`
- Harness: `scripts/qa/_tmp-qa-po-hrm-pay-types-consumer-pay-01.mjs`
- Dev handoff: `docs/qa/evidence/po-hrm-pay-types-consumer-pay-fe-01.md`

## completion_report

**Closed:** Narrow **AC-SET-CONSUMER-PT-PAY-01** — Payroll Thành phần lương binds `component_type` to Settings `pay_types` code; U65 browser POST **201** + F5 label; invent API **400** `HRM-PAY-TYPE-KEY`; L0 + vitest **57/57**; pay-stale regression PASS; sealed QC legs untouched.

**Open / carry:** **≠** UF-HRM-10 full · `settings_catalog_e2e_ready` **DENY** · PATCH edit khi ≥2 pay_types chưa retest · formula/PAY-02 LIVE out of scope.

## next_owner

`pm` → dispatch **QC** narrow consumer matrix leg (`pay_types`).

## next_dispatch_prompt

```text
work_item_id: QC-PO-HRM-PAY-TYPES-CONSUMER-PAY-01
role: qc
read_first:
  - docs/qa/evidence/qa-po-hrm-pay-types-consumer-pay-01.md
  - docs/program/specs/BA-HRM-PAY-TYPES-CONSUMER-PAY-01.md
  - docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md §72 · J-HRM-PAY-E2-01
entry_criteria: QA-PO-HRM-PAY-TYPES-CONSUMER-PAY-01 PASS_TO_PM; stamp PTPAYQA-MSNPHTEC; must_keep JGRECQC1+ETCTRQC1+RECCHQC1+QACONPAYSTQC1; settings_catalog_e2e_ready=false
exit_criteria: Audit AC-SET-CONSUMER-PT-PAY-01 U65 evidence (picker parity, POST component_type, F5 label, HRM-PAY-TYPE-KEY); GWC if PATCH carry; ≠ UF-HRM-10 full GO; settings_catalog_e2e_ready DENY
cấm: seed; reopen sealed JGRECQC1 legs; claim Settings module UAT
evidence_path: docs/qa/evidence/qc-po-hrm-pay-types-consumer-pay-01.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```
