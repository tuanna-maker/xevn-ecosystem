# Evidence — PO-MFD-M3-EMP-DETAIL-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-DETAIL-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **startedAt** | `2026-08-04T09:10:13.789Z` |
| **finishedAt** | `2026-08-04T09:10:30.688Z` |
| **commit** | `dc930c5` |
| **spec_ref** | UC-HRM-21 §15 · HRM-EM-03 · J-HRM-02 · UF-HRM-MENU-02b · HDSD CH06 §6 / §6.1 / §6.3 · must_keep FN-SCOPE-PARITY #28 |
| **hdsd_align** | **true** (U76) |
| **U65** | zero-seed · no `pnpm seed:*` · no deep-mutate profile tabs · no invent Employees CLOSED |
| **matrix** | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` surfaces **#10, #11, #12** |
| **runtime_json** | `docs/qa/evidence/_tmp-po-mfd-m3-emp-detail-01-browser.json` |
| **harness** | `scripts/qa/_tmp-po-mfd-m3-emp-detail-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m3-emp-detail-01/` |
| **ack_status** | **PASS_TO_PM** |
| **Employees CLOSED** | **false** — detail shell seat only |
| **Attendance CLOSED** | **false** — not invented |
| **uat_done** | **false** |

## L0 `qc:fe-be-health`

| Checkpoint | Result |
|------------|--------|
| Entry (before browser) | **ALL PASS** |
| Exit (after browser) | **ALL PASS** |

## Persona

| Persona | Account | Scope |
|---------|---------|-------|
| Group CEO | `ceo@xe.vn` / `Xevn@2026` | `tenantId=xevn` · `companyId=main` rollup |

## hdsd_inventory (U76)

| HDSD / journey surface | Attempted | Result |
|------------------------|-----------|--------|
| Login Group CEO | API login portal proxy | **201** · `companyId=main` |
| CH06 §2 Danh sách nhân sự | `/hr/employees?…companyId=main` | List **50** rows · GET **200** total **59** |
| CH06 §6 / §2.4 List → hồ sơ | Click holding rollup row | `/hr/employees/646306df-…` · GET **200** `HRM-EMP-200` · body `company_id=holding` |
| CH06 §6.1 Tab Thông tin chung | Default tab on load | Labels VI: Thông tin chung · Phòng ban · Chức vụ · Đang làm việc · Quản lý · Email · **no raw i18n keys** |
| CH06 §6.1/§6.3 Tab Lương (gate spot) | Click «Lương & Phụ cấp» | Gate **allows** CEO · empty honesty «Chưa có dữ liệu lương» · **no** PermissionFallback · **0** mutates |
| CH06 §6 ← Danh sách | Icon ArrowLeft header | List restored **50** rows · on `/hr/employees` |

## J-HRM-02 — list → detail → Back

| Step | Evidence | Verdict |
|------|----------|---------|
| List GET | `GET /api/hrm/employees?company_id=main&page=1&page_size=50` → **200** | 🟢 |
| Click row | Holding `646306df-f4a6-4199-bf99-9ea8a3ff8584` · «Tập đoàn XeVN» | 🟢 |
| Detail GET | `GET /employees/646306df-…?company_id=main` → **200** `HRM-EMP-200` · body `holding` | 🟢 scope parity must_keep #28 |
| Shell UI | Back icon · Sửa · tabs Chung/Công việc/Hợp đồng/Lương/Bảo hiểm | 🟢 |
| General labels | VI fields; `rawKeyLeak=false` | 🟢 |
| Salary spot | `CONTENT_VISIBLE` empty honesty (CEO has `view_salary`) | 🟢 spot |
| Back | icon → list **50** rows · no detail id | 🟢 |
| 404/409 | **none** | 🟢 |
| Mutates | **0** POST/PUT/PATCH/DELETE | 🟢 U65 |

## AC matrix

| # | AC | Verdict |
|---|-----|---------|
| 1 | L0 fe-be health entry+exit | 🟢 PASS |
| 2 | J-HRM-02 list→detail→Back no 404/409 | 🟢 PASS |
| 3 | Profile shell #10 (Back · Sửa · core tabs) | 🟢 PASS |
| 4 | General tab #11 VI labels (no raw keys) | 🟢 PASS |
| 5 | Salary gate #12 spot (CEO content / empty honesty) | 🟢 PASS spot |
| 6 | must_keep #28 scope query `company_id=main` on detail | 🟢 PASS |
| 7 | No deep-mutate nested tabs (P1 later) | 🟢 PASS |
| 8 | U65 zero-seed · not invent Employees CLOSED | 🟢 PASS |

## Matrix stamp (this seat)

| Surface # | Prior | After DETAIL-01 | Note |
|-----------|-------|-----------------|------|
| **10** Hồ sơ shell | UNKNOWN | **LIVE** | GET 200 · tabs · Edit · icon Back |
| **11** Thông tin chung | UNKNOWN | **LIVE** | Default tab · VI labels · no key leak |
| **12** Lương gate | UNKNOWN | **LIVE** (spot) | CEO `CONTENT_VISIBLE` + empty honesty; deny-path AU → P1-6 |
| **28** FN-SCOPE-PARITY | LIVE (SCOPE-01) | **must_keep** | Reconfirmed detail `company_id=main` → body `holding` |

## Defects / residuals / OBS

| ID | Severity | Status | Note |
|----|----------|--------|------|
| OBS-BACK-ICON-QUERY-DROP | P3 polish | OPEN | `navigate('/employees')` drops `?portal&companyId` — list still scopes via session (50 rows). HDSD text «← Danh sách» vs icon-only = label honesty OBS |
| OBS-SALARY-EMPTY | env honesty | N/A | «Chưa có dữ liệu lương» under CEO — not FAIL |
| R-MFD-M3-EMP-RBAC-SALARY | P1 | OPEN | Deny-path PermissionFallback AU not exercised this seat (ceo has view_salary) → `PO-MFD-M3-EMP-RBAC-SALARY-01` |
| — | — | **none P0** | No BE/FE fix required for shell seat |

## Screens

| File | Content |
|------|---------|
| `01-list.png` | Employees list main rollup |
| `02-detail-shell.png` | Profile shell + general |
| `03-salary-tab.png` | Lương tab empty honesty |
| `04-back-list.png` | After icon Back |

## completion_report

**Closed:** P0-4 `PO-MFD-M3-EMP-DETAIL-01` — U65 browser J-HRM-02 profile shell under `ceo@xe.vn` / `main`: list→detail→general VI labels→salary gate spot→Back; L0 entry+exit PASS; matrix **#10 LIVE · #11 LIVE · #12 LIVE (spot)**; must_keep **#28** reconfirmed; **0** mutates; no 404/409.

**Residual / not claimed:** Employees menu **not** CLOSED; Attendance **not** CLOSED; nested profile tabs mutate = P1-5; salary deny AU = P1-6; LIST/IMPORT/CREATE seats remain; OBS icon-back query drop P3.

**ack_status:** **PASS_TO_PM**

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-LIST-01
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
hdsd_align: true
ack_status target: PASS_TO_PM

## Entry
- DETAIL-01 PASS — evidence docs/qa/evidence/po-mfd-m3-emp-detail-01.md · matrix #10–12 LIVE (salary spot)
- must_keep: SCOPE #28 · DETAIL #10–11 (do not regress)
- If LIST-01 already in-flight: do not duplicate — intake RUNTIME-01 or next OPEN P0

## Job
Browser U65 ceo@xe.vn main: HDSD CH06 §2 list — load · keyword search · status filter · pagination · company_display_name VI; no Sync ERROR; empty honesty if applicable.
No seed. Not Employees CLOSED.

## Exit
evidence_path: docs/qa/evidence/po-mfd-m3-emp-list-01.md
Bus PASS_TO_PM + stamp matrix #1–6 exercised
```
