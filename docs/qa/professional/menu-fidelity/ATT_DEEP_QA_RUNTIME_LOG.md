# ATT Deep QA — Runtime log (PO-HRM-BP-ATT-DEEP-QA-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-DEEP-QA-01` |
| **Prior runtime** | `PO-MFD-M2-ATT-QA-RUNTIME-01` / `HRM-ATTENDANCE_RUNTIME_LOG.md` |
| **Date** | 2026-08-04 |
| **Persona** | `ceo@xe.vn` · `company_id=main` |
| **URL** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **U65** | zero-seed · **read-only** |
| **L0 entry / exit** | `pnpm run qc:fe-be-health` **PASS** / **PASS** |
| **commit** | `dc930c5` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-bp-att-deep-qa-01-browser.json` |
| **Evidence** | `docs/qa/evidence/po-hrm-bp-att-deep-qa-01.md` |
| **Screenshots** | `docs/qa/evidence/screens/po-hrm-bp-att-deep-qa-01/` (44) |
| **Code inventory** | `ATT_SURFACE_INVENTORY_DEEP.md` |
| **uat_done** | `false` |
| **Attendance CLOSED** | `false` |

## Runtime summary

| Stamp | Count |
|-------|------:|
| LIVE | 28 |
| STUB_UI | 12 |
| PARTIAL | 3 (#8 · #30 · #33) |
| GĐ2-HOLD | 1 (#9) |
| BROKEN | 0 |

Network: **401** GET 2xx · **0** ≥400 · **0** unexpected mutates · **0** pageErrors.

## Surface table

| id | menu_path | runtime | Honesty / Network | Matrix # |
|----|-----------|---------|-------------------|----------|
| tab-overview | Tổng quan | LIVE | overview GET 200 | 1–5 |
| att-clock-in | Clock-In hub | LIVE | shell | 6 |
| clock-manual | Thủ công | LIVE | no POST | 7 |
| clock-qr | QR | PARTIAL | shell | 8 |
| clock-face | Khuôn mặt | GĐ2-HOLD | featureInDev + GĐ2 | 9 |
| clock-gps | GPS | LIVE | no POST | 10 |
| att-sheets | Bảng chấm công | LIVE | sheets GET | 11 |
| att-sheets-add-dialog | Thêm bảng CTA | LIVE | screenshot; no Lưu | 12 |
| att-records | Dữ liệu chấm công | LIVE | records GET | 13 |
| att-weekly | Chấm công tuần | LIVE | records week | 14 |
| att-summary | Tổng hợp công | LIVE wire | same-as-records OBS | 15 |
| shifts-list | Danh sách ca | LIVE | work-shifts GET | 16 |
| shifts-schedule | Lịch phân ca | **STUB_UI** | featureInDev + GĐ2 | 17 |
| shifts-overtime | Ca làm thêm | **STUB_UI** | featureInDev + GĐ2 | 18 |
| req-leave … req-leave-plan | Đơn từ #19–27 | LIVE | list GETs; no mutate | 19–27 |
| tab-leave | Nghỉ phép | LIVE | leave API | 28 |
| tab-reports | Báo cáo | LIVE | fan-in | 29 |
| tab-reports-export-dialog | Xuất báo cáo | **PARTIAL** | dialog open · no download · client empty fetch | **30** |
| settings-Nhân-viên | Nhân viên | LIVE | employees GET | 31 |
| settings-Quy-định-chấm-công | Quy định chấm công | LIVE | rules | 32 |
| settings OT/nghỉ/muộn/đơn | #40–43 | **STUB_UI** | `att-cfg-stub-*` cfgRedirect | 40–43 |
| settings users/roles/system | #44–46 | **STUB_UI** | featureInDev | 44–46 |
| rules Chung…app | #32–36 | LIVE / #33 PARTIAL | rules tabs | 32–36 |
| rules tablet/proxy/auto | #37–39 | **STUB_UI** | featureInDev | 37–39 |

## Delta vs M2 RUNTIME-01

| Item | Change |
|------|--------|
| #30 export | **Opened dialog** this seat → keep **PARTIAL** (was “not clicked”) |
| #40–43 | Confirmed **STUB_UI** via cfgRedirect testid (not mis-stamped LIVE) |
| Screenshots | Full 44-file folder for deep walk |
| Nested MISSING | Not all 18 inventory MISSING dialog-walked — see evidence residuals |

## A1–A6 (browser)

See evidence § SPEC_GAP / STUB / UNMAPPED. **Do not** mark Attendance CLOSED.
