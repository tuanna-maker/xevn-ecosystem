# QA Evidence — HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND-V2

| Field | Value |
|-------|-------|
| **work_item_id** | `HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND-V2` |
| **Date** | 2026-08-18T02:50Z |
| **Persona** | ceo@xe.vn · company `main` (login via XeVN HRM /hr/login) |
| **URL base** | http://localhost:8080/hr/settings |
| **U65** | Zero seed · FE mutate + F5 |
| **ack_status** | **PASS_TO_PM** |

## Predecessor
V1 `HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND` = **FAIL_TO_PM** — search testid missing (`settings-contract-clauses-search` not locatable), list shell not visible.
Fix `D-FE-CTR-TESTID-FIX-01` added test IDs on `ContractLegalPrintSettingsPanel.tsx` (clauses + templates views) via `SettingsCatalogScreenShell` `testId` prop → `${testId}-search`.

## Stack verified (live, not assumed)
- HRM FE: http://localhost:8080/hr/ (Vite, PID 2480) LISTENING
- HRM BE: http://localhost:28001/api/hrm (Nest, PID 17316) LISTENING
- No process killed/restarted for this test.

## Test matrix

| # | Step | Result | Evidence |
|---|------|--------|----------|
| 1 | Login `ceo@xe.vn / Xevn@2026` → `/hr/settings` | PASS | Landing page rendered, "Đăng nhập thành công" toast |
| 2 | Navigate to HĐ lao động → **Điều khoản HĐ** tab | PASS | URL `?tab=contract-clauses`, 13 group nav + clause list shell visible |
| 3 | `settings-contract-clauses-search` locatable by data-testid | PASS | Playwright `locator('[data-testid="settings-contract-clauses-search"]')` resolves; input visible, placeholder "Tìm theo mã hoặc tên…" |
| 4 | Search filters list (fail path first) | PASS | `THOI_HAN` → rows 13 → 2 (THOI_HAN_CONG_VIEC_VP, THOI_HAN_CONG_VIEC_LX); `XYZ_NO_MATCH` → list shell still renders (no crash) |
| 5 | List shell visible after search (V1 blocker) | PASS | `<table>` + pagination "Trang 1/2" present; not empty/hidden |
| 6 | Switch to **Mẫu hợp đồng** tab | PASS | URL `?tab=contract-templates`, 8 template rows |
| 7 | `settings-contract-templates-search` locatable | PASS | `locator('[data-testid="settings-contract-templates-search"]')` resolves; placeholder "Tìm mã hoặc tên mẫu…" |
| 8 | Templates search filters list | PASS | `DRIVER` → rows 8 → 4 (XEVN_FT_12M_DRIVER, XEVN_FT_24M_DRIVER, XEVN_INDEF_DRIVER, XEVN_PROBATION_DRIVER) |
| 9 | F5 reload persistence | PASS | After reload: clauses tab restored, 13 rows, search input reset to '' (search is local UI state — expected, not optimistic UI) |

## Screenshots
- `docs/qa/evidence/screens/hrm-ctr-picker-inline-portal-01-retest-dnd-v2/` (clause tab with search + template tab with search)

## AC verdict
- Both search inputs locatable by data-testid: **PASS**
- List shell visible after search interaction: **PASS**
- F5 reload keeps page state: **PASS**

**ack_status: PASS_TO_PM**
