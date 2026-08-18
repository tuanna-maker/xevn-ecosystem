# Test execution log — PO-E2E-SPINE-01-QA-W5-R1

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-E2E-SPINE-01-QA-W5-R1-20260803` |
| **work_item_id** | `PO-E2E-SPINE-01-QA-W5-R1` |
| **tester** | qa · `po-e2e-spine-01-qa-w5-browser` |
| **started_at** | `2026-08-03T16:07:58.072Z` |
| **ended_at** | `2026-08-03T16:08:33.994Z` |
| **environment** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · `ceo@xe.vn` · `companyId=main` · HEAD `dc930c5` |
| **hdsd_sot** | HDSD Hợp đồng · CC Tiền lương · Nhân viên deep-link |
| **spec_ref** | E2E-SPINE-01 · HP-05 · HP-06 · J-HRM-01/02/07 · FR-UC-H01 · FR-UC-H04 |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | `docs/qa/evidence/po-e2e-spine-01-qa-w5-r1-test-log.json` |
| **raw_harness** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w5-r1-browser.json` |
| **evidence_narrative** | `docs/qa/evidence/po-e2e-spine-01-qa-w5-r1.md` |
| **screens_dir** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w5-20260803/` |

## Chronological steps (U78)

| seq | time | action (HDSD) | expected | actual | network | result | attachment |
|-----|------|---------------|----------|--------|---------|--------|------------|
| 1 | 16:07:58Z | L0 probes | hrm+xbos+portal 200 | all 200 | GET /api/hrm 200 | pass | — |
| 2 | 16:07:58Z | Vite module probe (QA) | Contracts/Payroll 200 | :5173/:8080 **200** | GET …/Contracts.tsx 200 · Payroll.tsx 200 | pass | — |
| 3 | 16:07:58Z | Open portal shell | ceo session | navigated `:5173` | — | pass | `00-shell.png` |
| 4 | 16:08:01Z | Nav Nhân viên | list loads | list OK · no Sync ERROR | GET employees 200 | pass | `01-employees-list.png` |
| 5 | 16:08:11Z | Deep-link hồ sơ | GET detail 200 | profile OK · GET **200** | GET employees/{id} 200 | pass | `02-emp-detail.png` |
| 6 | 16:08:14Z | Tab Hợp đồng | contract tab content | tab click OK | — | pass | `03-emp-tab-contracts.png` |
| 7 | 16:08:17Z | Menu Hợp đồng HP-05 | list/rows or honest empty | **Hợp đồng chrome + rows** · no 500 | GET contracts **200** | pass | `04-contracts-list.png` |
| 8 | 16:08:20Z | J-HRM-01 | contracts→profile | link click · no 404 | GET employees/{id} 200 | pass | `05-jhrm01.png` |
| 9 | 16:08:23Z | CC Tiền lương HP-06 | content or honest empty FR-UC-H04 | **mounted** · not blank · textLen 485 | GET payslips 200 | pass | `06-payroll.png` |
| 10 | 16:08:26Z | F5 payroll | persist | stable content | GET payslips 200 | pass | `07-payroll-f5.png` |
| 11 | 16:08:31Z | Emp tab Lương | honest empty on profile | «Chưa có…» class copy | GET payslips 200 | pass | `08-emp-tab-luong.png` |
| 12 | 16:08:33Z | Console audit | no Vite 500 / pageError | `consoleErrors=[]` `pageErrors=[]` | — | pass | — |

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep (retest) | HP05_HD / HP06_CC | pass | W5 Vite 500 class **closed** |
| B success HDSD | HP05_DETAIL · J-HRM-01 | pass | deep-link + contracts cross-nav |
| C logic BR | soft-link stamp | pass | SP4SDEKW49 absent expected |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| — | — | — | none new | — |

**Prior incidents CLOSED:** R-PO-SPINE01-CONTRACTS-VITE · R-PO-SPINE01-PAYROLL-BLANK

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| 12 | 0 | 0 | 0 |

| Metric | Value |
|--------|--------|
| clicks | 12 |
| idle_guard | PASS |
| seed_used | false |

**verdict:** pass  
**ack_status:** PASS_TO_PM  
**SoT:** `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`
