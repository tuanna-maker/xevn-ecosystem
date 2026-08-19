# MFD Wave M1 — Attendance inventory manifest

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-INV-ALL` |
| **Matrix** | `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` |
| **Evidence** | `docs/qa/evidence/po-mfd-m1-att-inv-all.md` |
| **Generated** | 2026-08-04 |
| **Synth status** | **SYNTH_CLOSED** (`PO-MFD-M1-ATT-SYNTH` · 2026-08-04) |
| **M2 backlog** | `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_M2_BACKLOG.md` |
| **Synth evidence** | `docs/qa/evidence/po-mfd-m1-att-synth.md` |
| **uat_done** | `false` |

## Surface counts

| Cluster | Surfaces | STUB_UI | PARTIAL | UNKNOWN | BROKEN |
|---------|----------|---------|---------|---------|--------|
| C1 Overview | 5 | 0 | 0 | 5 | 0 |
| C2 Sheets/records/weekly/summary | 10 | 0 | 1 | 9 | 0 |
| C3 Shifts | 3 | 0 | 2 | 1 | 0 |
| C4 Requests (9 menu ids) | 9 | 0 | 0 | 9 | 0 |
| C5 Leave tab | 1 | 0 | 0 | 1 | 0 |
| C6 Reports | 2 | 0 | 0 | 2 | 0 |
| C7 Settings + rules subtabs | 16 | 9 | 2 | 5 | 0 |
| **Total** | **46** | **9** | **5** | **32** | **0** |

## Runtime guess totals (code-only)

| runtime | Count | Notes |
|---------|------:|-------|
| STUB_UI | 9 | `attPage.featureInDev` placeholder (settings 7 + rules tablet/proxy/auto) |
| PARTIAL | 5 | Shift schedule/OT menu không branch; settings employees actions; rules standard columns FE-static; face clock-in |
| UNKNOWN | 32 | QA U65 browser required |
| BROKEN | 0 | Workshift update loop **fixed** in `useWorkShifts.ts` (2026-08-04) — không đánh BROKEN từ code hiện tại |
| LIVE | 0 | Không claim LIVE trước QA |

## UC map coverage

| uc_tc_map | Rows |
|-----------|-----:|
| HRM-AT-01 | 2 |
| HRM-AT-02, AT-03 | 1 |
| HRM-AT-04..09 | 1 |
| HRM-AT-10..13 | 2 |
| HRM-AT-11 partial | 1 |
| UNMAPPED | 34 |

## P0 fix backlog (ordered — synth input)

| Rank | Surface # | menu_path (short) | runtime | owner_next | Rationale |
|------|-----------|-------------------|---------|------------|-----------|
| 1 | 17 | Ca→Phân ca (lịch) | PARTIAL | dev-fe | Menu enterprise visible; `activeShiftType=schedule` không đổi UI — false fidelity |
| 2 | 11–12 | Bảng chấm công + Thêm | UNKNOWN | qa → dev-be | Payroll chốt kỳ — chưa có UC; API sheets tồn tại |
| 3 | 6–10 | Clock-In hub + GPS | UNKNOWN | qa | `SRS_VN` geofence P0; nguồn TXN payroll |
| 4 | 16 | Danh sách ca | UNKNOWN | qa | REF ca — workshift CRUD; submenu OT/schedule misleading (row 18) |
| 5 | 21, 23 | OT request · Update attendance | UNKNOWN | qa | TXN + approve path — có by-uc |
| 6 | 32–33, 40–41 | Rules chung/công chuẩn · OT/leave settings STUB | STUB_UI / UNKNOWN | ba-data → dev-be | CFG stub → payroll sai |
| 7 | 19, 28 | Leave (requests + tab) | UNKNOWN | qa | HRM-AT-10..13 — persona QL not ceo@ (training pack AT-12) |
| 8 | 13 | Bản ghi chấm công | UNKNOWN | qa | HRM-AT-02/03 core |

## Deferred (P1/P2/GĐ2)

- Face/QR clock-in UNMAPPED (rows 8–9) — mindmap GĐ2 unless sponsor promotes  
- Leave plan / compensatory summary (rows 26–27)  
- Settings users/roles/system STUB (rows 44–46)  
- Export report (row 30)

## Next wave seats (program §3)

| Seat | work_item_id | Input |
|------|--------------|-------|
| QA runtime | PO-MFD-M1-ATT-QA-RUNTIME | Fill UNKNOWN → LIVE/PARTIAL/BROKEN U65 |
| BA-Data | PO-MFD-M1-ATT-DATA | REF/CFG column `config_how` depth |
| SA | PO-MFD-M1-ATT-SA | API parity + SPEC_GAP delta list |
| Synth | PO-MFD-M1-ATT-SYNTH | **CLOSED** — M2 backlog published |
| QA runtime | PO-MFD-M1-ATT-QA-RUNTIME | **OPEN** — no runtime evidence file |

## M2 dispatch snapshot (post-synth)

| work_item_id | Owner | Backlog seq | Status |
|--------------|-------|-------------|--------|
| PO-MFD-M2-ATT-SCOPE-01 | dev-be | P0-1 | DISPATCHED |
| PO-MFD-M1-ATT-P0-CFG-BE-01 | dev-be | P0-2 | READY (next) |
| PO-MFD-M2-ATT-WIRE-BALANCE-01 | dev-fe | P0-3 | DISPATCHED |
| PO-MFD-M1-ATT-P0-CFG-FE-01 | dev-fe | P0-4 | QUEUED |
| PO-MFD-M2-ATT-SHIFTS-02 | dev-fe | P0-5 | QUEUED |
| PO-MFD-M1-ATT-QA-RUNTIME | qa | — | OPEN |

---

*MFD-M1-ATT_MANIFEST · PO-MFD-M1-ATT-INV-ALL · SYNTH_CLOSED*
