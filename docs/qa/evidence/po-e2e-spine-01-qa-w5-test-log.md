# Test execution log — PO-E2E-SPINE-01-QA-W5

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-01-QA-W5-20260803` |
| **work_item_id** | `PO-E2E-SPINE-01-QA-W5` |
| **tester** | qa · `po-e2e-spine-01-qa-w5-browser` |
| **started_at** | `2026-08-03T15:54:54.849Z` |
| **ended_at** | `2026-08-03T15:55:29.444Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · `ceo@xe.vn` · `companyId=main` |
| **hdsd_sot** | HDSD Nhân viên · Hợp đồng · CC Tiền lương |
| **spec_ref** | E2E-SPINE-01 · HP-05 · HP-06 · J-HRM-01/02/03/07 · FR-UC-H01 · FR-UC-H04 |
| **hdsd_align** | true |
| **machine_log** | `docs/qa/evidence/po-e2e-spine-01-qa-w5-test-log.json` |
| **raw_harness** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w5-browser.json` |
| **screens_dir** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w5-20260803/` |

## Chronological steps

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 15:54:54Z | L0 probes | hrm+xbos+portal 200 | all 200 | GET /api/hrm 200 | pass | — |
| 2 | 15:54:55Z | Open portal shell | ceo session | navigated `:5173` | — | pass | `00-shell.png` |
| 3 | 15:54:58Z | Nav Nhân viên | list loads | 47 NV · no Sync ERROR | GET employees 200 | pass | `01-employees-list.png` |
| 4 | 15:55:01Z | Search emp id | find linked hire emp | keyword `5c3ea407` · no UUID row (soft-link) | GET employees?keyword 200 | pass | — |
| 5 | 15:55:07Z | Deep-link hồ sơ | GET detail 200 · not 404 | UAT-0020 profile · GET **200** | GET employees/{id} 200 | pass | `02-emp-detail.png` |
| 6 | 15:55:11Z | Tab Hợp đồng | contract content or empty honest | stayed Thông tin chung · Loại HĐ=`--` | — | warn | `03-emp-tab-contracts.png` |
| 7 | 15:55:13Z | Menu Hợp đồng | list/empty chrome | **whitescreen** · Vite Contracts.tsx **500** | dynamic import fail | fail | `04-contracts-list.png` |
| 8 | 15:55:16Z | J-HRM-01 fallback | profile via deep-link | detail re-open OK | GET employees/{id} 200 | pass | `05-jhrm01-fallback.png` |
| 9 | 15:55:18Z | CC Tiền lương | content or honest empty | **blank main pane** · menu active | — | fail | `06-payroll.png` |
| 10 | 15:55:22Z | F5 payroll | persist honesty | still blank | — | fail | `07-payroll-f5.png` |
| 11 | 15:55:24Z | Emp tab Lương | payslip or honest empty | «Chưa có dữ liệu lương» | GET payslips 200 | pass | `08-emp-tab-luong.png` |
| 12 | 15:55:29Z | Vite module probe | Contracts/Payroll resolve 200 | both **500** | GET …/Contracts.tsx 500 · Payroll.tsx 500 | fail | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | HP05_HD / HP06_CC | fail | Contracts+Payroll Vite 500 · CC blank |
| B success HDSD | HP05_DETAIL | pass | deep-link UAT-0020 after hire soft-link |
| C logic BR | soft-link stamp | pass | stamp absent expected · not hire FAIL |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-PO-SPINE01-PAYROLL-BLANK | P1 | CC payroll content or honest empty | blank pane · Payroll.tsx 500 | PO-E2E-SPINE-01-FE-VITE-PAY-CON-01 |
| R-PO-SPINE01-CONTRACTS-VITE | P1 | /hr/contracts list/empty | whitescreen · Contracts.tsx 500 | PO-E2E-SPINE-01-FE-VITE-PAY-CON-01 |

## Summary

| passed | failed | blocked | skipped | warn |
|--------|--------|---------|---------|------|
| 7 | 4 | 0 | 0 | 1 |

| Metric | Value |
|--------|--------|
| clicks | 12 |
| idle_guard | PASS |
| seed_used | false |
| u65_zero_seed | true |

**ack_status:** FAIL_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
