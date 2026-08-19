# HRM Employees — Runtime log (U87 · M3)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-QA-RUNTIME-01` |
| **Date** | 2026-08-04 |
| **Persona** | `ceo@xe.vn` · `company_id=main` |
| **URL** | `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| **U65** | zero-seed · **read-only** |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** |
| **L0 exit** | **PASS** |
| **commit** | `dc930c5` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m3-emp-qa-runtime-01-browser.json` |
| **Evidence** | `docs/qa/evidence/po-mfd-m3-emp-qa-runtime-01.md` |
| **uat_done** | `false` |
| **Employees CLOSED** | `false` |
| **Attendance CLOSED** | `false` |

## Runtime summary

| Stamp | Count |
|-------|------:|
| LIVE | **26** (TRAINING-QA-01 closed #19) |
| PARTIAL | 2 (#9 Xuất Nest · #18 Job) |
| BROKEN | **0** |
| STUB_UI | 0 |
| GĐ2-HOLD | 0 |
| UNKNOWN | **0** |

Network (RUNTIME-01 baseline): **55** GET tracked · **0** ≥400 · **0** unexpected mutates · **3** pageErrors (Training — **superseded** by TRAINING-QA-01: pageErrors **0**).

## Surface stamps

| # | menu_path | runtime | Network / notes |
|---|-----------|---------|-----------------|
| 1 | Danh sách load | LIVE | GET employees 200 |
| 2 | Tìm kiếm | LIVE | keyword= |
| 3 | Lọc trạng thái | LIVE | status=active |
| 4 | Lọc phòng ban | LIVE | client |
| 5 | Phân trang | LIVE | range honest |
| 6 | Cột công ty | LIVE | VI labels |
| 7 | Thêm NV dialog | LIVE | tabs RO |
| 8 | Nhập Excel | LIVE | dialog · no commit |
| 9 | Xuất | PARTIAL | EXPORT-01: client dialog+xlsx LIVE · Nest unused · Nest probe 201 header-only (0 rows vs FE 60) · SPEC_GAP |
| 10 | Hồ sơ shell | LIVE | GET :id 200 |
| 11 | Thông tin chung | LIVE | tab |
| 12 | Lương gate | LIVE | payslips / gate |
| 13 | Xóa mềm Hủy | LIVE | alertdialog |
| 14 | Đã xóa | LIVE | archived GET |
| 15 | Khôi phục presence | LIVE | no confirm |
| 16 | Hợp đồng | LIVE | contracts GET |
| 17 | BH | LIVE | insurance GET |
| 18 | Công việc / Job | **PARTIAL** | tasks GET + local fallback |
| 19 | Đào tạo | **LIVE** | TRAINING-QA-01: GET training 200 · stats 0 · pageErrors 0 · F5 OK · [`po-mfd-m3-emp-training-qa-01.md`](../../evidence/po-mfd-m3-emp-training-qa-01.md) |
| 20 | Tài sản | LIVE | assets GET |
| 21 | KPI | LIVE | employee-kpis GET |
| 22 | CV/bằng/CC/skills | LIVE | resume-files… |
| 23 | Khen thưởng | LIVE | discipline GET |
| 24 | Gia đình | LIVE | tab shell |
| 25 | Lịch sử công việc | LIVE | work-timeline GET |
| 26 | RBAC CTAs | LIVE | ceo create/edit/delete |
| 27 | Manager picker | LIVE | form field |
| 28 | Scope parity spot | LIVE | list→detail main |

## Residual

- `R-MFD-M3-EMP-TRAINING-CRASH` → **CLOSED** (`PO-MFD-M3-EMP-TRAINING-FIX-01` + `PO-MFD-M3-EMP-TRAINING-QA-01`)
- #9 Xuất PARTIAL → `PO-MFD-M3-EMP-EXPORT-01` **CLOSED** (honesty) → residual wire `EXPORT-WIRE-01` + Nest `EXPORT-NEST-01`
- Job PARTIAL → `PO-MFD-M3-EMP-JOB-MOCK-01`

## Delta — PO-MFD-M3-EMP-EXPORT-01 (2026-08-04)

| Field | Value |
|-------|--------|
| Persona | `ceo@xe.vn` · `company_id=main` |
| Dialog | 17 cols · xlsx+csv · export count 60 · download xlsx |
| Nest probe | POST export **201** · header-only 0 rows |
| FE Nest calls | **0** |
| #19 spot | LIVE · pageErrors 0 |
| Stamp #9 | **PARTIAL** + SPEC_GAP (dev-fe + dev-be) |
| Machine | `docs/qa/evidence/_tmp-po-mfd-m3-emp-export-01-browser.json` |
| Evidence | [`po-mfd-m3-emp-export-01.md`](../../evidence/po-mfd-m3-emp-export-01.md) |
| Employees CLOSED | **false** |

## Delta — PO-MFD-M3-EMP-TRAINING-QA-01 (2026-08-04)

| Field | Value |
|-------|--------|
| Persona | `ceo@xe.vn` · `company_id=main` |
| Path | list → `0f6e1369-…` → nhóm HR → Đào tạo → F5 re-open |
| GET training | **200** `HRM-EMP-PROFILE-200` · itemCount=0 · hasStatsKey=false |
| pageErrors | **0** |
| UI | Đã hoàn thành 0 · empty honesty · Thêm khóa học |
| Machine | `docs/qa/evidence/_tmp-po-mfd-m3-emp-training-qa-01-browser.json` |
| Employees CLOSED | **false** |
