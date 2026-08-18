# Evidence — PO-MFD-M1-ATT-INV-ALL

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-INV-ALL` |
| **from_role** | ba-process |
| **to_role** | pm → synth queue |
| **ack_status** | **READY_FOR_SYNTH** |
| **uat_done** | `false` |
| **evidence_path** | `docs/qa/evidence/po-mfd-m1-att-inv-all.md` |

## Deliverables

| Artifact | Path |
|----------|------|
| Fidelity matrix (46 rows) | `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` |
| Manifest | `docs/qa/professional/menu-fidelity/_squad/MFD-M1-ATT_MANIFEST.md` |

## completion_report

**Closed:** Full Attendance menu inventory from `Attendance.tsx` constants (7 top tabs, attendance/shifts/requests submenus, 9 settings items, 8 rules subtabs). **46 surfaces** with all U87 §2 columns; clusters C1–C7 covered; **34 UNMAPPED** vs HRM-AT-01..13; runtime from code: **9 STUB_UI**, **5 PARTIAL**, **32 UNKNOWN**, **0 BROKEN** (workshift loop fix acknowledged in `useWorkShifts.ts`).

**Residual:** Browser runtime not executed (U65); `SRS_VN` / `TECH_SPEC_VN` thin vs legacy `docs/hrm/SRS.md` — many `SPEC_GAP`; ba-data REF/CFG `config_how` depth; SA API_CONTRACT full path list; QA must promote UNKNOWN rows.

## Training pack §15.4 quiz (MFD seat)

### 1. ≥5 surfaces + runtime đoán (trước browser)

| Surface | Runtime đoán | Lý do code |
|---------|--------------|------------|
| Ca→Phân ca (lịch) | **PARTIAL** | `setActiveShiftType('schedule')` nhưng `renderShiftsContent()` không branch |
| Cài đặt→Quy tắc tăng ca | **STUB_UI** | `renderSettingsContent` fallback `featureInDev` |
| Quy tắc→Máy tính bảng | **STUB_UI** | Rules tab ngoài general/standard/customize/device/app → placeholder |
| Clock-In GPS | **UNKNOWN** | `GPSAttendance` lazy + API 422 contract — cần U65 |
| Bảng chấm công (sheets) | **UNKNOWN** | Hook `useAttendanceSheets` + POST sheets — chưa smoke |

### 2. Một REF và một CFG — cấu hình ở đâu?

| Class | Ví dụ field | config_how |
|-------|-------------|------------|
| **REF** | Mã ca (`work-shifts.code`) | HRM `GET/POST /attendance/work-shifts` per company; ideally sync metadata từ org — không hardcode FE list |
| **CFG** | Geofence 200m / auto-checkout 10h | `SRS_VN.md` executive · lẽ ra **Cài đặt→Quy tắc** (`saveRules`) + holding policy; hiện subtabs tablet/proxy/auto **STUB_UI** |

### 3. Surfaces UNMAPPED by-uc (tiêu biểu P0)

Overview KPI; sheets/weekly/summary; shift master + schedule/OT menus; late-early / business-trip / shift-change / leave-summary / compensatory / leave-plan; reports + export; toàn bộ settings STUB (OT rules, leave-rules, late-early, request-rules, users, roles, system); clock-in QR; rules tablet/proxy/auto.

*(Chi tiết 34/46 rows — cột `uc_tc_map=UNMAPPED` trong matrix.)*

### 4. Liên kết Payroll / Leave — surface P0

| Surface P0 | Payroll | Leave |
|------------|---------|-------|
| Bảng chấm công (sheets) | Kỳ chốt công → payroll run input | — |
| Clock-In / bản ghi TXN | Công chuẩn ngày/giờ | — |
| Đơn từ→Nghỉ / tab Nghỉ phép | Trừ công hưởng lương | Quỹ nghỉ · WF approve (HRM-AT-10..13) |
| Cài đặt→Quy tắc công chuẩn (STUB OT/leave rules) | **Sai cột/hệ số → lương sai** | Map leave_types REF |

### 5. P0 fix đầu tiên + owner

**#1 Ca→Phân ca (lịch)** — menu hiển thị nhưng UI vẫn danh sách ca (`PARTIAL` false fidelity). **Owner:** `dev-fe` (branch `activeShiftType`) + `qa` retest J-shift; **ba** delta SRS schedule FR nếu SPEC_GAP.

---

## Handoff

- **next_owner:** `pm`
- **next_dispatch_prompt:** see below

---

*PO-MFD-M1-ATT-INV-ALL · ba-process · no code · no seed*
