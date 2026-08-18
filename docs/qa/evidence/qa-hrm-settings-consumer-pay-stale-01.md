# Evidence — QA-HRM-SETTINGS-CONSUMER-PAY-STALE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-SETTINGS-CONSUMER-PAY-STALE-01` |
| **from_role** | `pm` |
| **date** | 2026-08-10 |
| **stamp** | **`QACONPAYST1-MSNG1JPS`** |
| **ack_status** | **`PASS_TO_PM`** |
| **overall** | **PASS** (U65 browser · không seed) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **portal** | `http://127.0.0.1:5173` · hrm-api `:28001` |
| **commit** | `dc930c5` |
| **runner** | `scripts/qa/_tmp-qa-hrm-settings-consumer-pay-stale-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-qa-hrm-settings-consumer-pay-stale-01.json` |
| **dev handoff** | `po-hrm-settings-catalog-consumer-audit-fe-01.md` · `po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md` |

## Gates

| Gate | Command / artifact | Result |
|------|-------------------|--------|
| **L0** | `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |
| **L2.5** | Browser click paths below | **PASS** (2/2 in scope) |

## UF-HRM-10 — Settings catalog consumer (Contracts create)

**spec_ref:** `docs/hrm/SRS.md` **§16.8 O4** (picker consumer → storageKey) · **HRM-SC-02** · **UF-HRM-10** · `docs/hrm/ui-screens/UI-CATALOG-CONSUMER-EMP-REC.md` · consumer matrix `po-hrm-settings-catalog-consumer-audit-fe-01.md`

| Check | Result |
|-------|--------|
| **Verdict** | **PASS** |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **Click path** | Command Center → HRM **Hợp đồng** → **Tạo HĐ** → bước 1 |
| **Network** | `GET /api/hrm/settings-catalogs` **200** (cached overview) |
| **Phòng ban** | `ctr-create-department-picker-combobox` → **4** `catalog-picker-option-*` (sample `catalog-picker-option-DEPT_01`) |
| **Loại HĐ** | `hdsd-contracts-form-contract-type` (Popover combobox) → **5** options (sample `catalog-picker-option-HDHV`) |
| **Console** | 0 `Uncaught` · no HRM 500 storm on load |
| **FE sau load (SRS)** | Cả hai `CatalogSearchPicker` hiển thị mục danh mục đã sync (không chỉ Settings list) |

**Regression cite:** narrow dept leg `SETFID02DEPT-MSNFWQUK` (cùng ngày) — dept picker đồng nhất.

## J-HRM-PAY-09-01 — Payroll group create without F5

**spec_ref:** **FR-UC-BP-PAY-09** · **UC-BP-PAY-09** · `docs/hrm/ui-screens/UI-PAYROLL-CLUSTER-EMBED.md` **J-HRM-PAY-09-01**

| Check | Result |
|-------|--------|
| **Verdict** | **PASS** |
| **Click path** | **Lương** → **Chính sách** → **Phân nhóm bảng lương** → **Tạo nhóm mới** → **Lưu** (no manual F5) |
| **Network** | `POST /api/hrm/payroll/groups` → **201** · `id=51f3b891-24c2-43f6-abd5-71fa3e269b64` · code `Q09CPYNG1JPS` |
| **FE sau 2xx** | `pay-group-row-51f3b891-24c2-43f6-abd5-71fa3e269b64` visible **≤20s** · **không F5** |
| **Defect** | **`FE-PAY09-CATALOG-LIST-STALE`** — **cleared** on this run (`row_without_f5=true`) |

## Screenshots

- `docs/qa/evidence/screens/qa-hrm-settings-consumer-pay-stale-01/contracts-create-pickers.png`
- `docs/qa/evidence/screens/qa-hrm-settings-consumer-pay-stale-01/pay-group-after-create-no-f5.png`

## Residual / honesty (không promote module)

| Item | Note |
|------|------|
| PAY module / PAY-09 DONE | **DENIED** · `payroll_e2e_ready=false` · C-SLICE only |
| J-HRM-PAY-09-03 / 04 | **HOLD** (unchanged) |
| Full UF-HRM-10 matrix | Consumer legs PASS; không claim toàn bộ Settings UF 🟢 từ 2 picker alone |
| XBOS sync step | Catalogs đã có trên env pilot (EFF>0); không chạy seed U65 |

## completion_report

**Closed:** Independent browser retest of Claude `READY_FOR_QA` handoffs — **UF-HRM-10** Contracts create **department + contract_type** `CatalogSearchPicker` options after settings overview load; **J-HRM-PAY-09-01** POST **201** + row visible without F5. L0 PASS.

**Open:** PAY-09 journey HOLD rows; full UF-HRM-10 / PAY module UAT not in scope.

## next_owner

`qc` (narrow re-gate on consumer + stale slice if PM requests) · else `pm` for matrix promote.

## next_dispatch_prompt

```text
work_item_id: QC-HRM-SETTINGS-CONSUMER-PAY-STALE-GWC-01
read_first: docs/qa/evidence/qa-hrm-settings-consumer-pay-stale-01.md
entry: QA PASS_TO_PM stamp QACONPAYST1-MSNG1JPS
exit: GWC or GO on UF-HRM-10 consumer legs + J-HRM-PAY-09-01 no-F5 only; retain payroll_e2e_ready=false; evidence docs/qa/evidence/qc-hrm-settings-consumer-pay-stale-gwc-01.md
```

**ack_status:** **PASS_TO_PM**
