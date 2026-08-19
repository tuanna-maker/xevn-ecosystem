# HRM Attendance — Runtime log (U87 · M2 refresh)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-QA-RUNTIME-01` (supersedes M1 log stamps where Network re-proved) |
| **Prior** | `PO-MFD-M1-ATT-QA-RUNTIME` |
| **Date** | 2026-08-04 |
| **Persona** | `ceo@xe.vn` / holding · `company_id=main` |
| **URL** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **U65** | zero-seed · **read-only** |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** |
| **L0 exit** | **PASS** |
| **commit** | `dc930c5` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-qa-runtime-01-browser.json` |
| **Evidence** | `docs/qa/evidence/po-mfd-m2-att-qa-runtime-01.md` |
| **uat_done** | `false` |
| **Attendance CLOSED** | `false` |

## Runtime summary (this seat probes)

| Stamp | Count (probes) |
|-------|---------------:|
| LIVE | 28 |
| STUB_UI | 12 |
| PARTIAL | 1 (#8 QR) |
| GĐ2-HOLD | 1 (#9 Face) |
| BROKEN | 0 |

Network: **379** GET 2xx · **0** ≥400 · **0** unexpected mutates · **0** pageErrors.

## Surface table (browser 2026-08-04 · RUNTIME-01)

| id | menu_path | runtime | Network / console notes | Matrix # |
|----|-----------|---------|-------------------------|----------|
| tab-overview | Tổng quan | LIVE | `GET /attendance/overview` 200 | 1–5 |
| att-clock-in | Clock-In hub | LIVE | shell + today records fan-in | 6 |
| clock-manual | Thủ công (spot open) | LIVE | no POST (must_keep GWC) | 7 |
| clock-qr | QR shell | PARTIAL | ACCEPTED_AS_IS_P1 · work-sites 200 | 8 |
| clock-face | Khuôn mặt | GĐ2-HOLD | stub + GĐ2 banner · 0 POST | 9 |
| clock-gps | GPS (spot open) | LIVE | method open · no POST · R2 GWC kept | 10 |
| att-sheets | Bảng chấm công | LIVE | sheets GET 200 · SHEETS-01 GWC kept | **11–12 LIVE** |
| att-records | Dữ liệu chấm công | LIVE | records GET 200 HRM-ATT-200 · edit GWC R3 kept (not re-mutated) | **13 LIVE** |
| att-weekly | Chấm công tuần | LIVE | records week GET 200 · WEEKLY GWC | **14** |
| att-summary | Tổng hợp công | LIVE wire | records GET 200 · OBS same-as-records | **15** |
| shifts-list | Ca → Danh sách ca | LIVE | work-shifts GET 200 · no depth loop | 16 |
| shifts-schedule | Ca → Lịch phân ca | **STUB_UI** | SHIFTS-02 honesty `featureInDev` + GĐ2 | **17** |
| shifts-overtime | Ca → Ca làm thêm | **STUB_UI** | SHIFTS-02 honesty · NO_API roster | **18** |
| req-leave | Đơn xin nghỉ | LIVE | leave-requests GET 200 · WF GWC kept | 19 |
| req-late-early | Đi muộn/về sớm | **LIVE** | late-early-requests GET 200 · REQUESTS R2 GWC | **20** |
| req-overtime | Làm thêm | LIVE | overtime-requests GET 200 | 21 |
| req-trip | Công tác | **LIVE** | business-trip GET 200 | **22** |
| req-update-att | Cập nhật công | LIVE | update-requests GET 200 | 23 |
| req-change-shift | Đổi ca | **LIVE** | shift-change GET 200 | **24** |
| req-leave-summary | TH nghỉ phép | LIVE | leave-requests aggregate UI | 25 |
| req-comp-summary | TH nghỉ bù | LIVE | LeaveTab mount | 26 |
| req-leave-plan | Kế hoạch nghỉ | LIVE wire | leave-requests GET · priority GĐ2-HOLD kept | 27 |
| tab-leave | Tab Nghỉ phép | LIVE | leave API · LEAVE-WF GWC | 28 |
| tab-reports | Báo cáo | LIVE | fan-in 200 · export not clicked | **29 LIVE** · 30 PARTIAL |
| tab-settings | Thiết lập shell | LIVE | | settings shell |
| settings-Nhân-viên | Nhân viên | **LIVE** | employees GET 200 · SETTINGS-EMP R2 GWC | **31 LIVE** |
| settings-Quy-định-chấm-công | Quy định chấm công | LIVE | rules GET path | 32 |
| settings stubs | OT/nghỉ/late/đơn/users/roles/system | STUB_UI | featureInDev | 40–46 |
| rules-Chung | Chung | LIVE | rules persist GWC kept | 32 |
| rules-Số-công-chuẩn | Số công chuẩn | LIVE | columns PARTIAL ACCEPTED_AS_IS_P1 | 33 |
| rules-Tùy-chỉnh | Tùy chỉnh bảng công | LIVE | settings-catalogs 200 | 34 |
| rules-Máy-chấm-công | Máy chấm công | LIVE | testid device · DEVICE ACCEPTED_AS_IS | 35 |
| rules-Chấm-trên-app | Ứng dụng di động | LIVE | testid app · ScanFace CLOSED | 36 |
| rules-stub tablet/proxy/auto | Máy tính bảng / Chấm công hộ / Tự động chấm công | STUB_UI | i18n labels; AUTO ACCEPTED_AS_IS_P1 | 37–39 |

## P0 backlog status (runtime)

1. ~~ScanFace~~ **CLOSED**
2. ~~Rules tab ambiguity~~ **CLOSED**
3. **R-MFD-ATT-SETTINGS-STUB-CLUSTER** — #40–46 + #37–39 STUB_UI (P2 / governance)
4. ~~Catalog 500~~ **CLOSED**
5. ~~WorkShift infinite loop~~ **CLOSED**

## Matrix

See `HRM-ATTENDANCE_FIDELITY_MATRIX.md` § Browser runtime overlay (`PO-MFD-M2-ATT-QA-RUNTIME-01`).
