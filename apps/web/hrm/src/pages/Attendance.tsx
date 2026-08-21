/**
 * @CODE-MEMORY
 * Screen:     /attendance — Chấm công (bảng theo kỳ + leave + weekly)
 * UC:         UC-HRM-23 · UC-HRM-32 · FR-HRM-AT-14
 * BR:         BR-ATT-SHEET-01..07 · AC-ATT-SHEET-01..06 · BR-UX-DATE-02
 * SRS:        docs/hrm/SRS.md AC-ATT-SHEET · docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md §3
 * TechSpec:   docs/hrm/TECHSPEC.md §12.1 · §14.4 · CreateAttendanceSheetDto @IsDateString
 * Purpose:    Tab bảng chấm công — tạo header kỳ (POST sheets) + xem lưới; ngày kỳ dd/MM/yyyy.
 * WorkItem:   FID-P0-FE-DATE-01
 * Coded:      2026-07-22
 * must_keep:  POST start_date/end_date = yyyy-MM-dd; không auto roster; empty honesty AC-ATT-SHEET
 * SOLID:      Sheet form dùng ViDatePickerField SoT — không parse split('/') ad-hoc
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-ATT-INVALID-DATE-01
 * change_mode: UPGRADE
 * What: Weekly title/period labels via formatWeeklyRangeTitleLabels + formatDisplayDate; leave Calendar format gated by isValid
 * Why: Sponsor crash RangeError Invalid time value at renderWeeklyAttendance (~1926)
 * must_keep: Do not call date-fns format() on API-derived strings without formatDisplayDate/isValid
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: D-HRM-ATT-SHEET-EMPTY-RELOAD-LOOP-01
 * change_mode: UPGRADE
 * What: Memoize weekly sheet context; show settled empty/error (no forever spinner); reload button uses isFetching only
 * Why: Inline sheet object + useEffect fetch thrash → «Tải lại» spin forever on create/open sheet
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FID-P0-FE-DATE-01
 * change_mode: FIX
 * What: Modal tạo bảng — ViDatePickerField (text + Calendar mở được); state ISO padded; timePreset đổi kỳ; chặn start>end
 * Why: Sponsor + SA/BA — icon lịch pointer-events-none; split('/') → 2026-7-1 fail @IsDateString
 * Spec: FR-HRM-AT-14 · ADR-HRM-DATE-WIRE-YYYY-MM-DD-20260722 · UX_VI_DATE · fid-p0-ba-data/ba-date/sa-date
 * must_keep: Wire chỉ YYYY-MM-DD (ADR — cấm dual wire); header-only AC-ATT-SHEET; không nới DTO; không seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-C1-ATTENDANCE-FE-01
 * change_mode: UPGRADE
 * What: Gộp submenu checkinout/qrcode/faceid/gps → task «clock-in» + ClockInMethodSelector;
 *       tab Chấm công 1-click mở wizard (method manual sẵn); CTA overview «Chấm công ngay»
 * Why: UX P0-a / UX-01 — proxy click depth ≤2 cho task chấm công chính; IA task-based
 * Spec: docs/program/UX-UI-ERP-ANALYSIS.md P0-a · UX-UI-ERP-PEER-DIVISION-PLAN C1
 * must_keep: Widget CheckInOut/QR/Face/GPS + API calls không đổi; sheets/records/weekly còn trong dropdown
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-UX03-DEBOUNCE-01
 * change_mode: FIX
 * What: Shifts search — wire value/onChange + debounce 300ms (useDebouncedValue); lọc code/name/unit
 * Why: UX-03 — Input chỉ placeholder → user tưởng search hỏng (recognition)
 * Spec: docs/program/UX-UI-ERP-ANALYSIS.md UX-03 · patch ux03-shifts-search
 * must_keep: Clock-In wizard C1; không đụng sheets/weekly placeholder search; taxSettlementFloatingUi ngoài file
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-UX09-SHIFTS-BULK-01
 * change_mode: ADD
 * What: Shifts — wire checkbox chọn dòng + toolbar bulk (Xóa/Bỏ chọn) + AlertDialog xác nhận;
 *       bulkDeleteShifts qua useWorkShifts; footer đếm theo filteredShiftsData
 * Why: UX-09 — checkbox không có action bar = flexibility giả, mất tin UI
 * Spec: docs/program/UX-UI-ERP-ANALYSIS.md UX-09 · UX-UI-ERP-REMAINING-SYNTHESIS R2
 * must_keep: Clock-In C1; UX-03 search debounce; không đụng Payroll / taxSettlementFloatingUi
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-WIRE-BALANCE-01
 * change_mode: FIX
 * What: Ca schedule/OT → GĐ2-HOLD banner; FaceID hold; settings Lưu không toast success giả
 * Why: HRM-ATTENDANCE_FIDELITY_MATRIX P0 — không pretend API lịch / CFG persist
 * must_keep: useWorkShifts loop fix; MD-01; leave approve scope untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M1-ATT-P0-CFG-FE-01
 * change_mode: FIX
 * What: Rules→Chung/Standard/App Lưu → Nest /attendance/rules; GPS CRUD work-sites; D4 stub banners
 * Why: ADR-HRM-ATTENDANCE-CFG-PERSIST D2–D4 · BE PO-MFD-M1-ATT-P0-CFG-BE-01
 * must_keep: work-shifts UI; TXN tabs; customize tab still non-persist
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-RULES-TAB-AMBIGUITY-01
 * change_mode: FIX
 * What: rulesTabs i18n — nhãn tab device/app/tablet/proxy/auto phân biệt; data-testid hdsd-att-rules-tab-{id}
 * Why: QA R-MFD-ATT-RULES-TAB-AMBIGUITY — getByRole «Máy chấm công» strict 4 elements; chặn smoke device vs app
 * must_keep: tablet/proxy/auto vẫn featureInDev stub; không fake LIVE CFG
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-SCANFACE-UNDEFINED-01
 * change_mode: FIX
 * What: Rules→App Face ID icon ScanFace → ScanLine; MethodIcon binding thay <method.icon/>
 * Why: QA R-MFD-ATT-SCANFACE-UNDEFINED — ReferenceError ScanFace is not defined (matrix #36 PARTIAL)
 * Spec: HRM-ATTENDANCE_FIDELITY_MATRIX #36 · ADR-HRM-ATTENDANCE-CFG-PERSIST (CFG wire không đổi)
 * must_keep: gps/wifi/qr toggles + Nest rules save; Face ID vẫn GĐ1 hold (enabled:false); không seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-SHIFTS-02
 * change_mode: FIX
 * What: Submenu Lịch phân ca / Ca làm thêm — badge GĐ2 + title hold; panel featureInDev (không shifts-table)
 * Why: M2 backlog P0-5 G-MENU-STUB · row 17 PARTIAL — không claim LIVE roster grid
 * Spec: HRM-ATTENDANCE_M2_BACKLOG P0-5 · PO-MFD-M2-ATT-GD2-ROSTER-01 hold via menu honesty
 * must_keep: Danh sách ca LIVE via useWorkShifts; leave-balance; CFG rules persist; không invent roster API
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-SETTINGS-EMP-01-FE
 * change_mode: FIX
 * What: Settings→Nhân viên — Lấy lại dữ liệu → useEmployees.refetch; Nhập khẩu → EmployeeImportDialog (HRM-IM-01)
 * Why: QA R-MFD-M2-ATT-SETTINGS-EMP-IMPORT-REFRESH-UNWIRED — buttons không onClick (0 network / no file dialog)
 * Spec: matrix #31 · FR-HRM-IM-01 · TECHSPEC spreadsheet import · HDSD Thiết lập→Nhân viên
 * must_keep: list GET path; scope headers; fail-closed toast nếu thiếu company; không đụng REPORTS/REQUESTS/LEAVE/OT/CLOCK
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-OVERVIEW-01
 * change_mode: FIX
 * What: Overview Select → năm (this-year/last-year) wire `year` vào useAttendanceOverview;
 *       bỏ day/week/month giả; badge «chỉ hiển thị theo năm» + error Alert; SPEC_GAP grain mịn
 * Why: ENTERPRISE_API_MAP C1 — overviewTimeFilter local-only PARTIAL; Nest chỉ company_id+year
 * Spec: HRM-ATTENDANCE_M2_BACKLOG P1-1 · AttendanceOverviewQueryDto
 * must_keep: CLOCK/SHEETS/LEAVE/OT/REQUESTS/REPORTS/RECORDS edit; không fake period API
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-ATT-03d-05b-FE-01
 * change_mode: UPGRADE
 * What: GPS work-sites edit UI (PATCH) + primary CTA tokens; sharp labels on GPS card
 * Why: FR-UC-BP-ATT-03d CRUD · Precision Motion A1–A5 foundation on ATT App GPS
 * must_keep: work-sites SoT (no gps_locations JSON); Face GĐ1 hold; stub honesty; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-A
 * change_mode: UPGRADE
 * What: Remaster Overview + Clock-In wizard chrome (S01–S03, S09–S12, S20–S22) → Precision Motion tokens
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-A
 * Spec: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md · HRM_UI_BRAND_SCREEN_INVENTORY W3-ATT-A
 * must_keep: ATT-03d/05b GPS+leave wires; Face web honesty stub (featureHold); PROP-03e QR SKIP no invent; no Attendance CLOSED claim
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-B
 * change_mode: UPGRADE
 * What: Remaster sheets/records + shifts CRUD chrome (S23–S28, S35–S38) → Precision Motion
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-B
 * Spec: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md · HRM_UI_BRAND_SCREEN_INVENTORY W3-ATT-B
 * must_keep: sheet create/delete wires; shift CRUD/bulk delete; records table PATCH/delete; Face honesty; GPS lat/lon; ATT-03d work-sites (W3-ATT-F); dialog.tsx R1 title; no QR clock (W3-ATT-E); no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-C
 * change_mode: UPGRADE
 * What: Remaster residual leave request/detail/approval chrome on Attendance shell (orange CTA → primary)
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-C (leave cluster)
 * must_keep: LeaveTab/LateEarly wires; leave-balance/panel; sheets/shifts ATT-B untouched; Face/GPS honesty; no QR; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-F
 * change_mode: UPGRADE
 * What: Remaster settings emp · rules (Chung/Công chuẩn/Thiết bị/Ứng dụng) · GPS work-sites chrome · settings sidebar
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-F S64–S65,S67–S68,S72–S75,S90
 * Spec: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md · HRM_UI_BRAND_SCREEN_INVENTORY W3-ATT-F
 * must_keep: ATT-03d work-sites CRUD (lat/lng/radius) wires; rules PATCH Nest; Face GĐ1 honesty banner; EmployeeImport Dialog wires; no Nest/seed; no Face LIVE; no Attendance CLOSED; no ATT-E charts fight; customize/G2 stubs chrome deferred to G1/G2
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-F stall#2
 * change_mode: FIX
 * What: Kill residual orange settings chrome (sidebar/rules tabs/save/device/app method icons); GPS DialogTitle ≥20; evidence rewrite
 * Why: PM RE-DISPATCH stall n=2 evidence MISS — prior seat left orange on S67–S73 shell
 * must_keep: ATT-03d create/edit/remove wires + lat/lng/radius; rules PATCH handlers; Face hold; no customize fight; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-E
 * change_mode: UPGRADE
 * What: Remaster overview charts S05–S08 + weekly S31–S33 + cell modal S32; QR clock panel hosts remastered QRCodeScanner (EmployeeQRCard SKIP)
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-E
 * must_keep: overview/weekly hooks; Face honesty; leave panel; OT mutate; ATT-03d sites (ATT-F owns); PROP-03e QR card SKIP; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-E stall#4
 * change_mode: FIX
 * What: Unmount EmployeeQRCard (PROP-03e SKIP honesty); weekly avatar no cyan; reports tab primary; records title ≥20; WRITE evidence
 * Why: PM RE-DISPATCH stall#4 — evidence MISS after 3 seats; bus READY without file
 * must_keep: QR clock scanner wire; Face featureHold; S29/S63 export; no Nest/seed; no Attendance CLOSED; no invent QR card
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-G1
 * change_mode: UPGRADE
 * What: Remaster STUB/GĐ2/ALIAS + web Face honesty chrome (S04, S17–S19, S39–S41, S58–S60, S66, S69–S70)
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-G1
 * Spec: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md · HRM_UI_BRAND_SCREEN_INVENTORY W3-ATT-G1
 * must_keep: Face featureHold (no LIVE invent); PROP-03e SKIP; ATT-03d/05b leave/GPS wires; customize/copy/filter no-op honesty; no Nest/seed; no Attendance CLOSED; no ATT-A..F regression
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-G1 stall#2
 * change_mode: FIX
 * What: Kill top-tab rainbow map → always xevn-primary; confirm stub/Face/ALIAS chrome sharp; WRITE evidence stall#2 CLOSE
 * Why: PM RE-DISPATCH stall#2 evidence MISS — prior seats froze after first Read/Grep
 * must_keep: Face featureHold; PROP-03e SKIP; leave/GPS/ATT-A..F wires; no Face LIVE; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-G2
 * change_mode: UPGRADE
 * What: Remaster S76–S85 — rules tablet/proxy/auto stub + CFG redirect + users/roles/system honesty chrome
 * Why: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §8–§10 · inventory W3-ATT-G2
 * Spec: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md · HRM_UI_BRAND_SCREEN_INVENTORY W3-ATT-G2
 * must_keep: tablet/proxy/auto featureInDev no-op (no invent LIVE CFG); CFG redirect no-op (link only); users/roles/system stub no-op; Face HOLD; PROP-03e SKIP; ATT-A..G1 wires; no Nest/seed; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-G2 stall#1
 * change_mode: FIX
 * What: Confirm S76–S85 Precision Motion honesty; i18n stub/CFG/GĐ2 keys; WRITE evidence stall CLOSE
 * Why: PM RE-DISPATCH prior cfc39090 froze after first reads — evidence MISS
 * must_keep: tablet/proxy/auto no-op; CFG redirect link-only; users/roles/system stub no-op; Face HOLD; PROP-03e SKIP; ATT-A..G1; no Nest/seed; no Attendance CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
 * change_mode: ADD
 * What: Weekly cell + GPS dialogs *dialog-precision + compact fields; weekly cell stub honesty Alert
 * Why: ADR §16 LOCK · FE-DIALOG-01 shell extend · inventory S32 + GPS ATT-03d
 * must_keep: leave/OT/GPS mutate wires; Face HOLD; PROP-03e SKIP; weekly cell no invent LIVE API; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT stall#2
 * change_mode: ADD
 * What: Shift form / add-sheet / page leave shells → compact fields + title ≥20; GPS sites keep legacy testids
 * Why: PM RE-DISPATCH stall#2 — remaining Attendance.tsx shells beyond request-tab wave
 * must_keep: att-shift-form-dialog · att-add-sheet-dialog · att-gps-*-dialog; Face HOLD; weekly stub honesty; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-BP-ATT-SIGN-FE-01
 * change_mode: ADD
 * What: Panel Ký chốt trên chi tiết bảng (weekly view) — GET/POST signatures + POST close; nhãn trạng thái VI
 * Why: UF-HRM-ATT-SIGN · UC-BP-ATT-11 · QA BLOCKED thiếu wire FE (po-hrm-bp-att-sign-qa-01)
 * Spec: FR-UC-BP-ATT-11 · F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02 · BR-BP-TS-02
 * must_keep: att-sheets-precision list chrome; vi-VN dates; U65 no seed; Face HOLD; no Attendance CLOSED claim
 * LastVerified: docs/qa/evidence/po-hrm-bp-att-sign-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-BP-ATT-SIGN-FE-SUBMIT-01
 * change_mode: ADD
 * What: Panel hold-draft exposes att-sign-submit-for-sign → submitAttendanceSheetForSign
 * Why: FR-UC-BP-ATT-10 · UF-HRM-ATT-SIGN prereq (QA submitButtonCount=0)
 * Spec: F-ATT-SHEET-01 · UC-BP-ATT-10/11
 * must_keep: AttendanceSheetSignPanel chrome; refetch list after 2xx
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01
 * change_mode: FIX
 * What: Sau att-sheets-add POST 201 → mở đúng sheetId vừa tạo (weekly + sign panel); refetch await on mutate
 * Why: QA R-ATT-SHEET-SUBMIT-SIGN-GAP — harness mở nhầm row đầu; Jan sheet kẹt draft
 * Spec: FR-UC-BP-ATT-10/11 · J-HRM-06c · AC-PAY-HIRE-04 prereq
 * must_keep: att-sheet-submit · att-sign-* testids; U65 no seed; scope main
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What: Sidebar attendance-codes / ot-types / ot-comp-types → Att*SettingsPanel (Nest FE-ADMIN CRUD)
 * Why: Sponsor unlock R-PLT-ATT-FE-ADMIN-01 ABSENT twin · Nest KEY LIVE
 * Spec: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01 §5.2
 * must_keep: leave-rules LIVE · work_shifts · LVRULE HOLD · consumer EFF CLOSED · honesty false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01
 * change_mode: ADD
 * What: Sidebar leave-rules → AttLeaveTypeSettingsPanel (F-ATT-CAT-LVT); removed CFG stub redirect
 * Why: AC-PLT-ATT-01 Settings/ATT CFG tạo loại phép open catalog
 * Spec: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01 §5
 * must_keep: work_shifts ops · sheet/sign · overtime/late-early stubs; U65; attendance_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Mount AttLatePenaltyModePanel under Rules→Chung — XOR mode/bands/scope shell;
 *       bind LIVE envelope when BE READY; stub-safe ABSENT (no fake XOR persist);
 *       RETAIN peers rules/sites/shifts/late-early physical /attendance/* · honesty footer;
 *       Nest /core ATT SoT = 0 · CFG alone ≠ ATT-02 DONE · PAY OUT · PLT/CORE RETAIN.
 * Why: UC-BP-ATT-02 · API-01 F.1 · BA O1–O12 · R-ATT-02-MODE-FE await BE · U65
 * must_keep: PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
 *            CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · attendance_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: Panel LIVE bind after BE-01 — close R-ATT-02-MODE-FE · display-ready mode/bands/scope/
 *       sourceFlags/latePenaltyEnabled · XOR + HRM-VAL-400 · Nest /core 0 · ≠ ATT UAT.
 * Why: UC-BP-ATT-02 · J-HRM-ATT-02-01..06 U65
 * must_keep: PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
 *            CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · PAY OUT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Danh sách ca statusLabelVi FE-derive · honesty footer ≠ ATT-01 DONE ·
 *       Lịch phân ca GĐ2-HOLD RETAIN · Nest /core 0 · DENY invent shift-assignments DONE.
 * Why: UC-BP-ATT-01 · F-ATT-CAT-SHIFT-01/02 · J-HRM-ATT-01-01/05/06 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md
 * must_keep: ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C ·
 *            ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE · R-ATT-01-ASSIGN open · printable false · PAY OUT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Sidebar holiday-calendar → AttHolidayCalendarPanel LIVE thin GET/PUT
 *       /api/hrm/attendance/holiday-calendars/:year · statusLabelVi FE-derive ·
 *       residual lunar/type/publish stub-honest · Nest /core 0 · honesty thin ≠ ATT-03b DONE.
 * Why: UC-BP-ATT-03b · F-ATT-HOL-01 · J-HRM-ATT-03B-01/05 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md
 * must_keep: ATT01QC1-MSLZ3KIM ≠ catalog=DONE · R-ATT-01-ASSIGN open · ATT11QC1-MSLXTH9P ·
 *            ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02/PLT/CORE ·
 *            DENY att_leave_hold · printable false · PAY OUT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: holiday-calendar panel residual LIVE — lunarFlag · calendarType · isPaid · dayType ·
 *       status · midYearPendingLeaveRecalcRequired · Nest /core 0 · ≠ residual alone=ATT-03b DONE.
 * Why: UC-BP-ATT-03b · BE-01 READY · J-HRM-ATT-03B-01..06 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md · BE evidence be-01
 * must_keep: ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D ·
 *            ATT08QC1-MSLSL36C HOL-MISS · ATT02/PLT/CORE · R-ATT-01-ASSIGN open · PAY OUT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-03b-cluster-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: GPS Settings card — statusLabelVi FE-derive · soft-retire CTA · empty CTA · honesty
 *       footer ≠ PLT WS = ATT-03d DONE · Nest /core 0 · DENY ensureDefault/seed.
 * Why: UC-BP-ATT-03d · F-ATT-CAT-WS-01/02 · J-HRM-ATT-03D-01/02/06 · HDSD CH05b · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01.md · ADR D3
 * must_keep: ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM R-ATT-01-ASSIGN open · ATT11/10/09/08/02 ·
 *            PLT/CORE · ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE · printable false · PAY OUT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-fe-01.md
 */
import { lazy, Suspense, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Users,
  ClipboardCheck,
  Clock,
  FileText,
  Settings,
  CalendarIcon,
  UserCheck,
  Shield,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Settings2,
  GripVertical,
  Plus,
  Eye,
  RotateCcw,
  Copy,
  Info,
  Sparkles,
  Smartphone,
  MapPin,
  Wifi,
  QrCode,
  Pencil,
  Trash2,
  Check,
  LayoutGrid,
  BarChart3,
  CalendarOff,
  Loader2,
  ScanLine,
  Calculator,
  Layers,
} from 'lucide-react';
import { LeaveTab } from '@/components/attendance/LeaveTab';
import { LeaveOverviewRecentPanel } from '@/components/attendance/LeaveOverviewRecentPanel';
import { AttLeaveTypeSettingsPanel } from '@/components/settings/AttLeaveTypeSettingsPanel';
import { AttLeaveAccrualPolicySettingsPanel } from '@/components/settings/AttLeaveAccrualPolicySettingsPanel';
import { AttOtCompLeavePolicySettingsPanel } from '@/components/settings/AttOtCompLeavePolicySettingsPanel';
import { AttSickLeaveFundOrderSettingsPanel } from '@/components/settings/AttSickLeaveFundOrderSettingsPanel';
import { AttAttendanceCodeSettingsPanel } from '@/components/settings/AttAttendanceCodeSettingsPanel';
import { AttOtTypeSettingsPanel } from '@/components/settings/AttOtTypeSettingsPanel';
import { AttOtCompTypeSettingsPanel } from '@/components/settings/AttOtCompTypeSettingsPanel';
import { AttShiftSettingsPanel } from '@/components/settings/AttShiftSettingsPanel';
import { AttWorkRuleSettingsPanel } from '@/components/settings/AttWorkRuleSettingsPanel';
import { AttScheduleGroupSettingsPanel } from '@/components/settings/AttScheduleGroupSettingsPanel';
import { OvertimeRequestTab } from '@/components/attendance/OvertimeRequestTab';
import { BusinessTripRequestTab } from '@/components/attendance/BusinessTripRequestTab';
import { LateEarlyRequestTab } from '@/components/attendance/LateEarlyRequestTab';
import { AttLatePenaltyModePanel } from '@/components/attendance/AttLatePenaltyModePanel';
import { AttHolidayCalendarPanel } from '@/components/attendance/AttHolidayCalendarPanel';
import { AttendanceUpdateRequestTab } from '@/components/attendance/AttendanceUpdateRequestTab';
import { ShiftChangeRequestTab } from '@/components/attendance/ShiftChangeRequestTab';
import { CheckInOutWidget } from '@/components/attendance/CheckInOutWidget';
import { ClockInMethodSelector } from '@/components/attendance/ClockInMethodSelector';
import { AttendanceRecordsTable } from '@/components/attendance/AttendanceRecordsTable';
import { EmployeeImportDialog } from '@/components/employee/EmployeeImportDialog';
import { resolveAttendanceEmployeeImportScope } from '@/lib/attendanceSettingsEmployeesActions';
import {
  OVERVIEW_PERIOD_SPEC_GAP,
  resolveOverviewApiYear,
  type OverviewYearFilter,
} from '@/lib/attendanceOverviewTimeFilter';
import {
  CLOCK_IN_ATTENDANCE_TYPE,
  isClockInAttendanceType,
  resolveClockInMethod,
  type ClockInMethod,
} from '@/lib/clockInMethods';
import {
  isAllVisibleSelected,
  selectAllOrClear,
  toggleIdInSelection,
} from '@/lib/shiftSelection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useDepartments } from '@/hooks/useDepartments';
import { useEmployees } from '@/hooks/useEmployees';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';
import { useAttendanceSheets } from '@/hooks/useAttendanceSheets';
import { useWorkShifts } from '@/hooks/useWorkShifts';
import { att01HonestyBannerText } from '@/lib/attShift01Ring';
import {
  att03dEmptyCatalogCtaMessage,
  att03dHonestyBannerText,
  isAtt03dActiveEmpty,
} from '@/lib/attWorkSite03dRing';
import {
  useAttendanceRules,
  WEEK_DAY_CODES,
  minutesToRoundingSelect,
  roundingSelectToMinutes,
  type AttendanceRulesInput,
  type GPSLocation,
} from '@/hooks/useAttendanceRules';
import { useAttendanceOverview } from '@/hooks/useAttendanceOverview';
import { useWeeklyAttendanceSummary } from '@/hooks/useWeeklyAttendanceSummary';
import {
  buildWeeklyDayHeaderFallback,
  formatOverviewYearSubtitle,
  formatWeeklyRangeSubtitle,
  formatWeeklyRangeTitleLabels,
  sumLeaveTypeValues,
  type AttendanceRecordTableRow,
} from '@/lib/attendanceDashboardAggregator';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import {
  AttendanceSheetSignPanel,
  sheetStatusViLabel,
} from '@/components/attendance/AttendanceSheetSignPanel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { updateAttendanceStatus } from '@/integrations/hrmApi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format, isValid } from 'date-fns';
import { ViDatePickerField } from '@/components/ui/ViDatePickerField';
import { formatIsoDateToViDisplay, parseViDisplayToIsoDate } from '@xevn/ui';
import { vi } from 'date-fns/locale';

function formatSafeCalendarDate(value: Date | undefined): string | null {
  if (!value || !isValid(value)) return null;
  return format(value, 'dd/MM/yyyy', { locale: vi });
}

const QRCodeScanner = lazy(() =>
  import('@/components/attendance/QRCodeScanner').then((module) => ({ default: module.QRCodeScanner })),
);
const FaceIDScanner = lazy(() =>
  import('@/components/attendance/FaceIDScanner').then((module) => ({ default: module.FaceIDScanner })),
);
const FaceRegistration = lazy(() =>
  import('@/components/attendance/FaceRegistration').then((module) => ({ default: module.FaceRegistration })),
);
const GPSAttendance = lazy(() =>
  import('@/components/attendance/GPSAttendance').then((module) => ({ default: module.GPSAttendance })),
);
const AttendanceReportsTab = lazy(() =>
  import('@/components/attendance/AttendanceReportsTab').then((module) => ({ default: module.AttendanceReportsTab })),
);

function lazyBlock(element: ReactNode) {
  return (
    <Suspense fallback={<div className="py-6 text-[15px] text-xevn-textSecondary">Loading...</div>}>
      {element}
    </Suspense>
  );
}

// Sidebar menu items - using translation keys
const getSidebarMenuItems = (t: any) => [
  { id: 'employees', label: t('attendance.settingsMenu.employees'), icon: Users },
  { id: 'rules', label: t('attendance.settingsMenu.rules'), icon: ClipboardCheck },
  { id: 'overtime', label: t('attendance.settingsMenu.overtime'), icon: Clock },
  { id: 'leave-rules', label: t('attendance.settingsMenu.leaveRules'), icon: FileText },
  { id: 'holiday-calendar', label: 'Lịch lễ / Tết', icon: CalendarOff },
  { id: 'attendance-codes', label: 'Mã chấm công', icon: ClipboardCheck },
  { id: 'ot-types', label: 'Loại tăng ca', icon: Clock },
  { id: 'ot-comp-types', label: 'Loại chi trả OT', icon: FileText },
  { id: 'ot-comp-leave-policy', label: 'Chế độ phép bù OT', icon: FileText },
  { id: 'sick-leave-fund-order', label: 'Thứ tự quỹ nghỉ ốm', icon: FileText },
  { id: 'shifts-config', label: 'Ca làm việc', icon: Clock },
  { id: 'work-rules-config', label: 'Quy tắc tính công', icon: Calculator },
  { id: 'schedule-groups-config', label: 'Nhóm lịch làm việc', icon: Layers },
  { id: 'late-early', label: t('attendance.settingsMenu.lateEarly'), icon: Clock },
  { id: 'request-rules', label: t('attendance.settingsMenu.requestRules'), icon: FileText },
  { id: 'users', label: t('attendance.settingsMenu.users'), icon: UserCheck },
  { id: 'roles', label: t('attendance.settingsMenu.roles'), icon: Shield },
  { id: 'system', label: t('attendance.settingsMenu.system'), icon: Building2 },
];

/** Rules subtabs — ids stable for QA `hdsd-att-rules-tab-{id}` (R-MFD-ATT-RULES-TAB-AMBIGUITY). */
export const ATTENDANCE_RULES_TAB_IDS = [
  'general',
  'standard',
  'customize',
  'device',
  'app',
  'tablet',
  'proxy',
  'auto',
] as const;

export type AttendanceRulesTabId = (typeof ATTENDANCE_RULES_TAB_IDS)[number];

const ATTENDANCE_RULES_TAB_LABEL_KEYS: Record<AttendanceRulesTabId, string> = {
  general: 'attendance.rulesTabs.general',
  standard: 'attendance.rulesTabs.standard',
  customize: 'attendance.rulesTabs.customize',
  device: 'attendance.rulesTabs.device',
  app: 'attendance.rulesTabs.app',
  tablet: 'attendance.rulesTabs.tablet',
  proxy: 'attendance.rulesTabs.proxy',
  auto: 'attendance.rulesTabs.auto',
};

// Attendance rules sub-tabs
const getAttendanceRulesTabs = (t: (key: string) => string) =>
  ATTENDANCE_RULES_TAB_IDS.map((id) => ({
    id,
    label: t(ATTENDANCE_RULES_TAB_LABEL_KEYS[id]),
  }));

// Attendance columns data
const getAttendanceColumnsData = (t: any) => [
  { id: '1', name: t('attendance.columns.holidayWork'), description: t('attendance.columns.holidayWork'), hasAdvanced: false },
  { id: '2', name: t('attendance.columns.paidOvertime'), description: t('attendance.columns.paidOvertime'), hasAdvanced: false },
  { id: '3', name: t('attendance.columns.compensatoryOvertime'), description: t('attendance.columns.compensatoryOvertime'), hasAdvanced: false },
  { id: '4', name: t('attendance.columns.annualLeave'), description: t('attendance.columns.annualLeave'), hasAdvanced: false },
  { id: '5', name: t('attendance.columns.holidayLeave'), description: t('attendance.columns.holidayLeave'), hasAdvanced: false },
  { id: '6', name: t('attendance.columns.businessTrip'), description: t('attendance.columns.businessTrip'), hasAdvanced: true },
  { id: '7', name: t('attendance.columns.unpaidLeave'), description: t('attendance.columns.unpaidLeave'), hasAdvanced: false },
  { id: '8', name: t('attendance.columns.mealAllowance'), description: t('attendance.columns.mealAllowance'), hasAdvanced: false },
  { id: '9', name: t('attendance.columns.totalPaidWork'), description: t('attendance.columns.totalPaidWork'), hasAdvanced: false },
  { id: '10', name: t('attendance.columns.totalOvertime'), description: t('attendance.columns.totalOvertime'), hasAdvanced: false },
];

// Top navigation tabs — Precision Motion (no orange/purple/blue AI rainbow on inactive chips)
const getTopTabs = (t: any) => [
  { id: 'overview', label: t('attendance.tabs.overview'), icon: LayoutGrid, color: 'bg-xevn-primary' },
  { id: 'attendance', label: t('attendance.tabs.attendance'), hasDropdown: true, icon: ClipboardCheck, color: 'bg-xevn-primary' },
  { id: 'shifts', label: t('attendance.tabs.shifts'), hasDropdown: true, icon: Clock, color: 'bg-xevn-primary' },
  { id: 'requests', label: t('attendance.tabs.requests'), hasDropdown: true, icon: FileText, color: 'bg-xevn-primary' },
  { id: 'leave', label: t('attendance.tabs.leave'), icon: CalendarOff, color: 'bg-xevn-primary' },
  { id: 'reports', label: t('attendance.tabs.reports'), icon: BarChart3, color: 'bg-xevn-primary' },
  { id: 'settings', label: t('attendance.tabs.settings'), icon: Settings, color: 'bg-xevn-primary' },
];

// Attendance submenu — Clock-In hub (methods in-page) + admin/list tasks
const getAttendanceMenuItems = (t: any) => [
  { id: CLOCK_IN_ATTENDANCE_TYPE, label: t('attendance.attendanceMenu.clockIn', 'Chấm công vào/ra') },
  { id: 'sheets', label: t('attendance.attendanceMenu.sheets') },
  { id: 'records', label: t('attendance.attendanceMenu.records') },
  { id: 'weekly', label: t('attendance.attendanceMenu.weekly') },
  { id: 'summary', label: t('attendance.attendanceMenu.summary') },
];

/** Shifts submenu — list = LIVE catalog; schedule/OT = GĐ2-HOLD (no roster API). */
const getShiftsMenuItems = (t: (key: string) => string) =>
  [
    { id: 'list' as const, label: t('attendance.shiftsMenu.list'), gd2Hold: false },
    {
      id: 'schedule' as const,
      label: t('attendance.shiftsMenu.schedule'),
      gd2Hold: true,
      holdHintKey: 'attPage.shiftScheduleHold' as const,
    },
    {
      id: 'overtime' as const,
      label: t('attendance.shiftsMenu.overtime'),
      gd2Hold: true,
      holdHintKey: 'attPage.shiftOvertimeHold' as const,
    },
  ] as const;

// Request management dropdown items
const getRequestMenuItems = (t: any) => [
  { id: 'leave', label: t('attendance.requestsMenu.leave') },
  { id: 'late-early', label: t('attendance.requestsMenu.lateEarly') },
  { id: 'overtime', label: t('attendance.requestsMenu.overtime') },
  { id: 'business-trip', label: t('attendance.requestsMenu.businessTrip') },
  { id: 'update-attendance', label: t('attendance.requestsMenu.updateAttendance') },
  { id: 'change-shift', label: t('attendance.requestsMenu.changeShift') },
  { id: 'leave-summary', label: t('attendance.requestsMenu.leaveSummary') },
  { id: 'compensatory-summary', label: t('attendance.requestsMenu.compensatorySummary') },
  { id: 'leave-plan', label: t('attendance.requestsMenu.leavePlan') },
];

// Leave request data removed - using real data from LeaveTab component

export default function Attendance() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const needsEmployeeList = activeTab !== 'overview';
  const {
    employees,
    isLoading: isLoadingEmployees,
    refetch: refetchEmployees,
  } = useEmployees(false, undefined, {
    enabled: needsEmployeeList,
  });
  const { departments } = useDepartments({ enabled: activeTab === 'settings' });
  const [settingsEmployeeImportOpen, setSettingsEmployeeImportOpen] = useState(false);
  const [isRefreshingSettingsEmployees, setIsRefreshingSettingsEmployees] = useState(false);
  // Initialize translation-based menu items
  const sidebarMenuItems = getSidebarMenuItems(t);
  const attendanceRulesTabs = getAttendanceRulesTabs(t);
  const attendanceColumnsData = getAttendanceColumnsData(t);
  const topTabs = getTopTabs(t);
  const attendanceMenuItems = getAttendanceMenuItems(t);
  const shiftsMenuItems = getShiftsMenuItems(t);
  const requestMenuItems = getRequestMenuItems(t);
  
  // Load data from database hooks
  const {
    sheets: attendanceSheetsDB,
    isLoading: isLoadingSheets,
    createSheet,
    deleteSheet: deleteSheetDB,
    refetch: refetchAttendanceSheets,
  } = useAttendanceSheets({ enabled: activeTab === 'attendance' });
  const { shifts: workShiftsDB, isLoading: isLoadingShifts, createShift, updateShift, deleteShift: deleteShiftDB, bulkDeleteShifts } =
    useWorkShifts({ enabled: activeTab === 'shifts' || activeTab === 'settings' });
  const {
    rules: attendanceRulesDB,
    isLoading: isLoadingRules,
    isSaving: isSavingRules,
    saveRules: saveAttendanceRules,
    addGPSLocation,
    removeGPSLocation,
    updateGPSLocation,
  } = useAttendanceRules();
  const [rulesForm, setRulesForm] = useState<AttendanceRulesInput>({});
  const [gpsDialogOpen, setGpsDialogOpen] = useState(false);
  /** null = create; number = edit index in gps_locations */
  const [gpsEditIndex, setGpsEditIndex] = useState<number | null>(null);
  const [gpsDraft, setGpsDraft] = useState<GPSLocation>({
    name: '',
    address: '',
    latitude: 21.0285,
    longitude: 105.8542,
    radius: 200,
  });

  const resetGpsDraft = () => {
    setGpsEditIndex(null);
    setGpsDraft({
      name: '',
      address: '',
      latitude: 21.0285,
      longitude: 105.8542,
      radius: 200,
    });
  };

  useEffect(() => {
    if (isLoadingRules) return;
    setRulesForm({
      work_start_day: attendanceRulesDB.work_start_day ?? 1,
      work_end_day: attendanceRulesDB.work_end_day ?? 31,
      work_days: attendanceRulesDB.work_days ?? ['mon', 'tue', 'wed', 'thu', 'fri'],
      round_in_minutes: attendanceRulesDB.round_in_minutes ?? 0,
      round_out_minutes: attendanceRulesDB.round_out_minutes ?? 0,
      standard_type: attendanceRulesDB.standard_type ?? 'fixed',
      standard_days_per_month: attendanceRulesDB.standard_days_per_month ?? 26,
      hours_per_day: attendanceRulesDB.hours_per_day ?? 8,
      allow_multiple_checkin: attendanceRulesDB.allow_multiple_checkin ?? true,
      auto_checkout: attendanceRulesDB.auto_checkout ?? false,
      notify_late: attendanceRulesDB.notify_late ?? true,
      gps_enabled: attendanceRulesDB.gps_enabled ?? true,
      wifi_enabled: attendanceRulesDB.wifi_enabled ?? true,
      qr_enabled: attendanceRulesDB.qr_enabled ?? false,
    });
  }, [
    isLoadingRules,
    attendanceRulesDB.id,
    attendanceRulesDB.updated_at,
    attendanceRulesDB.work_start_day,
    attendanceRulesDB.work_end_day,
    attendanceRulesDB.work_days,
    attendanceRulesDB.round_in_minutes,
    attendanceRulesDB.round_out_minutes,
    attendanceRulesDB.standard_type,
    attendanceRulesDB.standard_days_per_month,
    attendanceRulesDB.hours_per_day,
    attendanceRulesDB.allow_multiple_checkin,
    attendanceRulesDB.auto_checkout,
    attendanceRulesDB.notify_late,
    attendanceRulesDB.gps_enabled,
    attendanceRulesDB.wifi_enabled,
    attendanceRulesDB.qr_enabled,
  ]);
  /** Nest overview only accepts `year` — day/week/month Select was display-fake (P1-1). */
  const [overviewYearFilter, setOverviewYearFilter] = useState<OverviewYearFilter>('this-year');
  const overviewApiYear = useMemo(
    () => resolveOverviewApiYear(overviewYearFilter),
    [overviewYearFilter],
  );
  const { 
    stats: overviewStats, 
    monthlyLeaveData: monthlyLeaveDataDB, 
    departmentLeaveData: departmentLeaveDataDB,
    leaveTypeData: leaveTypeDataDB,
    lateEarlyList: lateEarlyListDB,
    isLoading: isLoadingOverview,
    error: overviewError,
    year: overviewLoadedYear,
    refetch: refetchOverview,
  } = useAttendanceOverview(overviewApiYear, { enabled: activeTab === 'overview' });

  const [activeAttendanceType, setActiveAttendanceType] = useState<string>(CLOCK_IN_ATTENDANCE_TYPE);
  const [clockInMethod, setClockInMethod] = useState<ClockInMethod>('manual');
  const [activeShiftType, setActiveShiftType] = useState('list');

  const openClockInWizard = (method: ClockInMethod = 'manual') => {
    setActiveTab('attendance');
    setActiveAttendanceType(CLOCK_IN_ATTENDANCE_TYPE);
    setClockInMethod(method);
  };
  const [activeSidebarItem, setActiveSidebarItem] = useState('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [activeRulesTab, setActiveRulesTab] = useState('device');
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<{
    id?: string;
    code: string;
    name: string;
    unit: string;
    startTime: string;
    endTime: string;
    coefficient: number;
    hours: number;
    status: string;
  } | null>(null);
  const { toast } = useToast();
  const { user, currentCompanyId } = useAuth();

  const notifyAttendanceCfgHold = () => {
    toast({
      title: t('attPage.featureInDev'),
      description: t('attPage.cfgNotPersisted'),
      variant: 'destructive',
    });
  };

  // SRS bước: Thiết lập → Nhân viên — Lấy lại dữ liệu (matrix #31 · same GET employees)
  const handleRefreshSettingsEmployees = useCallback(async () => {
    setIsRefreshingSettingsEmployees(true);
    try {
      await refetchEmployees();
    } finally {
      setIsRefreshingSettingsEmployees(false);
    }
  }, [refetchEmployees]);

  const settingsEmployeeImportScope = useMemo(
    () =>
      resolveAttendanceEmployeeImportScope(
        currentCompanyId,
        import.meta.env.VITE_HRM_SCOPE_TENANT_ID as string | undefined,
      ),
    [currentCompanyId],
  );

  // SRS bước: Thiết lập → Nhân viên — Nhập khẩu → EmployeeImportDialog (HRM-IM-01)
  const handleOpenSettingsEmployeeImport = useCallback(() => {
    if (!settingsEmployeeImportScope) {
      toast({
        title: t('attendance.toast.error'),
        description: t(
          'empImport.scopeMissing',
          'Thiếu phạm vi công ty — không thể nhập khẩu nhân viên.',
        ),
        variant: 'destructive',
      });
      return;
    }
    setSettingsEmployeeImportOpen(true);
  }, [settingsEmployeeImportScope, t, toast]);

  const handleSettingsEmployeeImportSuccess = useCallback(
    async ({ importedCount }: { importedCount: number }) => {
      await refetchEmployees();
      toast({
        title: t('attPage.import', 'Nhập khẩu'),
        description: t('employeesPage.importSuccess', {
          success: importedCount,
          total: importedCount,
          defaultValue: `Đã nhập ${importedCount} nhân viên.`,
        }),
      });
    },
    [refetchEmployees, t, toast],
  );

  const [shiftsSearchQuery, setShiftsSearchQuery] = useState('');
  const debouncedShiftsSearch = useDebouncedValue(shiftsSearchQuery, 300);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [bulkDeleteShiftsDialogOpen, setBulkDeleteShiftsDialogOpen] = useState(false);
  const [shiftPendingDelete, setShiftPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [isBulkDeletingShifts, setIsBulkDeletingShifts] = useState(false);

  // Transform DB data to display format (statusLabelVi FE-derive from useWorkShifts)
  const shiftsData = workShiftsDB.map(s => ({
    id: s.id,
    code: s.code,
    name: s.name,
    unit: s.department || t('attendance.sheetForm.allDepartments'),
    startTime: s.start_time,
    endTime: s.end_time,
    coefficient: s.coefficient || 1,
    hours: s.work_hours || 8,
    status: s.status,
    statusLabelVi: s.statusLabelVi,
  }));

  const filteredShiftsData = useMemo(() => {
    const q = debouncedShiftsSearch.trim().toLowerCase();
    if (!q) return shiftsData;
    return shiftsData.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.unit.toLowerCase().includes(q),
    );
  }, [shiftsData, debouncedShiftsSearch]);

  const filteredShiftIds = useMemo(() => filteredShiftsData.map((s) => s.id), [filteredShiftsData]);
  const allFilteredShiftsSelected = isAllVisibleSelected(selectedShifts, filteredShiftIds);

  // Add default colors for leave types
  const LEAVE_TYPE_COLORS: Record<string, string> = {
    [t('attPage.annualLeave')]: '#1E40AF',
    [t('attPage.maternityLeave')]: '#059669',
    [t('attPage.unpaidLeave')]: '#D97706',
    [t('attPage.sickLeave')]: '#DC2626',
    [t('attPage.weddingLeave')]: '#06B6D4',
    [t('attPage.bereavementLeave')]: '#4B5563',
    [t('common.other', 'Khác')]: '#6B7280',
  };

  const monthlyLeaveData = monthlyLeaveDataDB;
  const departmentLeaveData = departmentLeaveDataDB;
  const leaveTypeData = leaveTypeDataDB;
  const lateEarlyList = lateEarlyListDB;
  const overviewYear = new Date().getFullYear();
  const overviewYearSubtitle = formatOverviewYearSubtitle(overviewYear);
  const leaveTypeTotal = sumLeaveTypeValues(leaveTypeData);

  // Edit attendance record state
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<{
    id: string;
    name: string;
    unit: string;
    date: string;
    time: string;
  } | null>(null);

  const openEditAttendanceModal = (record: AttendanceRecordTableRow) => {
    setEditingAttendance({
      id: record.id,
      name: record.name,
      unit: record.unit,
      date: record.date,
      time: record.time,
    });
    setAttendanceModalOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!editingAttendance?.date || !editingAttendance?.time) {
      toast({
        title: t('attendance.toast.error'),
        description: t('attendance.toast.fillTimeInfo'),
        variant: 'destructive',
      });
      return;
    }
    if (!editingAttendance.id) {
      toast({
        title: t('attendance.toast.error'),
        description: 'Bản ghi chưa liên kết API — dùng tab Dữ liệu chấm công.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await updateAttendanceStatus(
        editingAttendance.id,
        {
          status: 'present',
          note: `Cập nhật giờ ${editingAttendance.time} ngày ${editingAttendance.date}`,
          updated_by: user?.id ?? undefined,
        },
        currentCompanyId ?? undefined,
      );
      toast({
        title: t('attendance.toast.updateSuccess'),
        description: t('attendance.toast.attendanceUpdated', { name: editingAttendance.name }),
      });
      setAttendanceModalOpen(false);
      setEditingAttendance(null);
    } catch (error: unknown) {
      toast({
        title: t('attendance.toast.error'),
        description: error instanceof Error ? error.message : 'Không lưu được chấm công',
        variant: 'destructive',
      });
    }
  };

  // Attendance view mode: 'list' (sheets list), 'data' (records), or 'weekly' (weekly summary)
  const [attendanceViewMode, setAttendanceViewMode] = useState<'list' | 'data' | 'weekly'>('list');
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);

  const selectedSheet = attendanceSheetsDB.find((sheet) => sheet.id === selectedSheetId) ?? null;
  const weeklyAttendanceEnabled = activeTab === 'attendance' && attendanceViewMode === 'weekly';
  // Stabilize sheet identity — new object every render was thrashing weekly fetch.
  const weeklySheetContext = useMemo(
    () =>
      selectedSheet
        ? {
            start_date: selectedSheet.start_date,
            end_date: selectedSheet.end_date,
            name: selectedSheet.name,
          }
        : null,
    [
      selectedSheet?.id,
      selectedSheet?.start_date,
      selectedSheet?.end_date,
      selectedSheet?.name,
    ],
  );
  const {
    weeklyRows: weeklyAttendanceData,
    range: weeklyRange,
    departmentOptions: weeklyDepartmentOptions,
    isLoading: isLoadingWeeklyAttendance,
    isFetching: isFetchingWeeklyAttendance,
    loadError: weeklyAttendanceLoadError,
    refetch: refetchWeeklyAttendance,
  } = useWeeklyAttendanceSummary({
    enabled: weeklyAttendanceEnabled,
    sheet: weeklySheetContext,
    employees,
  });
  const weeklyRangeSubtitle = formatWeeklyRangeSubtitle(weeklyRange.from, weeklyRange.to);

  // Add sheet modal state — startDate/endDate = ISO yyyy-MM-dd (API @IsDateString)
  const sheetMonthRangeIso = (monthOffset: number) => {
    const base = new Date();
    const start = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
    const end = new Date(base.getFullYear(), base.getMonth() + monthOffset + 1, 0);
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    };
  };
  const [addSheetModalOpen, setAddSheetModalOpen] = useState(false);
  const [newSheetForm, setNewSheetForm] = useState(() => ({
    unit: '',
    positions: 'all',
    name: '',
    timePreset: 'this-month',
    ...sheetMonthRangeIso(0),
    attendanceType: 'daily',
    standardType: 'fixed',
  }));

  const handleOpenSheet = (sheetId: string) => {
    setSelectedSheetId(sheetId);
    setAttendanceViewMode('weekly');
  };

  const handleSheetMutated = useCallback(async () => {
    await refetchAttendanceSheets();
  }, [refetchAttendanceSheets]);

  const handleSheetTimePreset = (preset: string) => {
    if (preset === 'this-month') {
      setNewSheetForm((prev) => ({ ...prev, timePreset: preset, ...sheetMonthRangeIso(0) }));
      return;
    }
    if (preset === 'last-month') {
      setNewSheetForm((prev) => ({ ...prev, timePreset: preset, ...sheetMonthRangeIso(-1) }));
      return;
    }
    setNewSheetForm((prev) => ({ ...prev, timePreset: preset }));
  };

  const handleAddSheet = async () => {
    // Defensive: if draft still vi display, pad via SoT (ADR — wire YYYY-MM-DD only)
    const startParsed = parseViDisplayToIsoDate(newSheetForm.startDate.trim());
    const endParsed = parseViDisplayToIsoDate(newSheetForm.endDate.trim());
    const startIso = startParsed === null || startParsed === '' ? '' : startParsed;
    const endIso = endParsed === null || endParsed === '' ? '' : endParsed;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startIso) || !/^\d{4}-\d{2}-\d{2}$/.test(endIso)) {
      toast({
        title: t('messages.error'),
        description: t(
          'attPage.invalidSheetDates',
          'Ngày kỳ không hợp lệ — dùng dd/MM/yyyy (vd. 01/07/2026 hoặc 1/7/2026) hoặc chọn trên lịch.',
        ),
        variant: 'destructive',
      });
      return;
    }
    if (startIso > endIso) {
      toast({
        title: t('messages.error'),
        description: t(
          'attPage.sheetDateOrder',
          'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc (BR-ATT-SHEET-04).',
        ),
        variant: 'destructive',
      });
      return;
    }

    const startLabel = formatIsoDateToViDisplay(startIso);
    const endLabel = formatIsoDateToViDisplay(endIso);
    const result = await createSheet({
      name: newSheetForm.name || `Bảng chấm công từ ${startLabel} đến ${endLabel}`,
      start_date: startIso,
      end_date: endIso,
      attendance_type: newSheetForm.attendanceType,
      standard_type: newSheetForm.standardType,
      department: newSheetForm.unit || undefined,
      positions: newSheetForm.positions === 'all' ? undefined : newSheetForm.positions,
    });

    if (result?.id) {
      setAddSheetModalOpen(false);
      handleOpenSheet(result.id);
    }
  };

  // Delete sheet modal state
  const [deleteSheetModalOpen, setDeleteSheetModalOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const openDeleteSheetModal = (sheet: { id: string; name: string }) => {
    setSheetToDelete(sheet);
    setDeleteSheetModalOpen(true);
  };

  const handleDeleteSheet = async () => {
    if (sheetToDelete) {
      await deleteSheetDB(sheetToDelete.id);
      setDeleteSheetModalOpen(false);
      setSheetToDelete(null);
    }
  };

  // Request management state
  const [activeRequestType, setActiveRequestType] = useState('leave');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [requestUnitFilter, setRequestUnitFilter] = useState('all');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [requestCurrentPage, setRequestCurrentPage] = useState(1);

  // Leave request modal state
  const [leaveRequestModalOpen, setLeaveRequestModalOpen] = useState(false);
  const [leaveRequestForm, setLeaveRequestForm] = useState({
    employee: '',
    leaveType: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: '',
  });

  const handleAddLeaveRequest = () => {
    if (!leaveRequestForm.employee || !leaveRequestForm.leaveType || !leaveRequestForm.startDate || !leaveRequestForm.endDate) {
      toast({
        title: t('attendance.toast.error'),
        description: t('attendance.toast.fillRequired'),
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: t('attendance.toast.addSuccess'),
      description: t('attendance.toast.leaveRequestCreated'),
    });
    setLeaveRequestModalOpen(false);
    setLeaveRequestForm({
      employee: '',
      leaveType: '',
      startDate: undefined,
      endDate: undefined,
      reason: '',
    });
  };

  // View/Edit leave request detail state (kept for compatibility but no longer uses mock data)
  const [leaveDetailModalOpen, setLeaveDetailModalOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<{ id: string; name: string; avatar: string; position: string; unit: string; leaveType: string; days: number; approver: string; status: string } | null>(null);
  const [editLeaveForm, setEditLeaveForm] = useState({
    leaveType: '',
    days: 0,
    reason: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [isEditingLeave, setIsEditingLeave] = useState(false);

  const openLeaveDetailModal = (request: { id: string; name: string; avatar: string; position: string; unit: string; leaveType: string; days: number; approver: string; status: string }) => {
    setSelectedLeaveRequest(request);
    setEditLeaveForm({
      leaveType: request.leaveType,
      days: request.days,
      reason: '',
      startDate: undefined,
      endDate: undefined,
    });
    setIsEditingLeave(false);
    setLeaveDetailModalOpen(true);
  };

  const handleSaveLeaveEdit = () => {
    toast({
      title: t('attendance.toast.updateSuccess'),
      description: t('attendance.toast.leaveUpdated', { name: selectedLeaveRequest?.name }),
    });
    setIsEditingLeave(false);
    setLeaveDetailModalOpen(false);
  };

  // Approve/Reject state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNote, setApprovalNote] = useState('');

  const openApprovalModal = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setApprovalNote('');
    setApprovalModalOpen(true);
  };

  const handleApprovalSubmit = () => {
    if (approvalAction === 'approve') {
      toast({
        title: t('attendance.toast.approved'),
        description: t('attendance.toast.leaveApproved', { name: selectedLeaveRequest?.name }),
      });
    } else {
      toast({
        title: t('attendance.toast.rejected'),
        description: t('attendance.toast.leaveRejected', { name: selectedLeaveRequest?.name }),
        variant: "destructive",
      });
    }
    setApprovalModalOpen(false);
    setLeaveDetailModalOpen(false);
  };

  // Weekly cell detail modal state
  const [cellDetailModalOpen, setCellDetailModalOpen] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState<{
    employeeName: string;
    employeeCode: string;
    dayLabel: string;
    date: string;
    shifts: Array<{
      shift?: string;
      name?: string;
      status?: string;
      time?: string;
      type?: string;
    }>;
  } | null>(null);

  const openCellDetailModal = (
    employee: { name: string; code: string },
    day: { dayLabel: string; date: string; shifts: any[] }
  ) => {
    setSelectedCellData({
      employeeName: employee.name,
      employeeCode: employee.code,
      dayLabel: day.dayLabel,
      date: day.date,
      shifts: day.shifts,
    });
    setCellDetailModalOpen(true);
  };

  const handleSaveCellDetail = () => {
    toast({
      title: t('attendance.toast.error'),
      description:
        'Chỉnh sửa ô lưới tuần chưa có API — dùng tab Dữ liệu chấm công hoặc đề nghị cập nhật công.',
      variant: 'destructive',
    });
    setCellDetailModalOpen(false);
    setSelectedCellData(null);
  };

  // Default shift form values
  const defaultShiftForm = {
    code: '',
    name: '',
    unit: t('attendance.sheetForm.allDepartments'),
    startTime: '08:00',
    endTime: '17:30',
    coefficient: 1,
    hours: 8,
    status: 'active',
  };

  const openAddShiftModal = () => {
    setEditingShift(defaultShiftForm);
    setShiftModalOpen(true);
  };

  const openEditShiftModal = (shift: typeof editingShift) => {
    setEditingShift(shift);
    setShiftModalOpen(true);
  };

  const toggleSelectShift = (id: string) => {
    setSelectedShifts((prev) => toggleIdInSelection(prev, id));
  };

  const toggleSelectAllShifts = () => {
    setSelectedShifts((prev) => selectAllOrClear(prev, filteredShiftIds));
  };

  const handleConfirmBulkDeleteShifts = async () => {
    if (selectedShifts.length === 0) return;
    setIsBulkDeletingShifts(true);
    try {
      const ok = await bulkDeleteShifts(selectedShifts);
      if (ok) {
        setSelectedShifts([]);
        setBulkDeleteShiftsDialogOpen(false);
      }
    } finally {
      setIsBulkDeletingShifts(false);
    }
  };

  const handleConfirmSingleDeleteShift = async () => {
    if (!shiftPendingDelete) return;
    const ok = await deleteShiftDB(shiftPendingDelete.id);
    if (ok) {
      setSelectedShifts((prev) => prev.filter((id) => id !== shiftPendingDelete.id));
      setShiftPendingDelete(null);
    }
  };

  const handleSaveShift = async () => {
    if (!editingShift?.code || !editingShift?.name) {
      toast({
        title: t('attendance.toast.error'),
        description: t('attendance.toast.fillShiftInfo'),
        variant: "destructive",
      });
      return;
    }
    
    if (editingShift.id) {
      // Update existing shift
      await updateShift(editingShift.id, {
        code: editingShift.code,
        name: editingShift.name,
        department: editingShift.unit,
        start_time: editingShift.startTime,
        end_time: editingShift.endTime,
        coefficient: editingShift.coefficient,
        work_hours: editingShift.hours,
        status: editingShift.status,
      });
    } else {
      // Create new shift
      await createShift({
        code: editingShift.code,
        name: editingShift.name,
        department: editingShift.unit,
        start_time: editingShift.startTime,
        end_time: editingShift.endTime,
        coefficient: editingShift.coefficient,
        work_hours: editingShift.hours,
        status: editingShift.status || 'active',
      });
    }
    
    setShiftModalOpen(false);
    setEditingShift(null);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalRecords = 2481;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredEmployees.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredEmployees.map(emp => emp.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Overview content — W3-ATT-A S01–S03 Precision Motion chrome
  const renderOverview = () => {
    if (isLoadingOverview) {
      return (
        <div
          className="flex items-center justify-center p-12"
          data-testid="overview-loading"
          aria-busy="true"
        >
          <Loader2 className="w-8 h-8 animate-spin text-xevn-primary" />
        </div>
      );
    }

    return (
      <div className="space-y-4 md:space-y-6 p-3 md:p-6" data-testid="att-overview-precision">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-[20px] font-bold text-xevn-text">{t('attendance.overview.title')}</h2>
            <p
              className="text-sm text-xevn-textSecondary"
              data-testid="overview-year-filter-honesty"
              title={OVERVIEW_PERIOD_SPEC_GAP}
            >
              {t(
                'attendance.overview.yearFilterHonesty',
                'Lọc theo năm (API). Ngày/tuần/tháng — chỉ hiển thị theo năm đã chọn (chưa có period trên Nest).',
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button
              type="button"
              className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
              data-testid="overview-clock-in-cta"
              onClick={() => openClockInWizard('manual')}
            >
              <ClipboardCheck className="w-4 h-4" />
              {t('attendance.overview.clockInCta', 'Chấm công ngay')}
            </Button>
            <Select
              value={overviewYearFilter}
              onValueChange={(v) => setOverviewYearFilter(v as OverviewYearFilter)}
            >
              <SelectTrigger
                className="w-[150px] md:w-[180px]"
                data-testid="overview-year-filter"
                aria-label={t('attendance.overview.selectYear', 'Chọn năm tổng quan')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('attendance.overview.selectYear', 'Chọn năm')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-year" data-testid="overview-year-this">
                  {t('attendance.overview.thisYear')} ({new Date().getFullYear()})
                </SelectItem>
                <SelectItem value="last-year" data-testid="overview-year-last">
                  {t('attendance.overview.lastYear')} ({new Date().getFullYear() - 1})
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2 hidden sm:flex border-xevn-border text-xevn-text disabled:opacity-60"
              type="button"
              disabled
              title={t('attendance.overview.customizeHold', 'Tùy chỉnh layout — chưa có API')}
              data-testid="att-overview-customize-hold"
              aria-label={t('attendance.overview.customizeHold', 'Tùy chỉnh layout — chưa có API')}
            >
              <Settings2 className="w-4 h-4 text-xevn-textMuted" />
              <span className="text-[15px] font-medium text-xevn-text">{t('attendance.overview.customize')}</span>
              <Badge variant="outline" className="ml-1 border-xevn-border text-xevn-textSecondary text-[10px] font-semibold">
                {t('attPage.gd2HoldBadge')}
              </Badge>
            </Button>
          </div>
        </div>

        {overviewError ? (
          <Alert variant="destructive" data-testid="overview-error">
            <AlertTitle>{t('attendance.overview.loadErrorTitle', 'Không tải được tổng quan')}</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span>{overviewError}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                data-testid="overview-error-retry"
                onClick={() => void refetchOverview()}
              >
                {t('common.retry', 'Thử lại')}
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <p className="text-sm text-xevn-textSecondary" data-testid="overview-loaded-year">
          {t('attendance.overview.showingYear', 'Đang xem năm {{year}}', { year: overviewLoadedYear })}
        </p>

        {/* Stats Cards Row — S02 KPI */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" data-testid="att-overview-kpi-cards">
          {/* Late/Early Card */}
          <Card className="rounded-card border-xevn-border">
            <CardContent className="p-3 md:p-4">
              <h3 className="text-[15px] font-semibold text-xevn-text mb-1">{t('attendance.overview.lateEarly')}</h3>
              <div className="flex items-center gap-1 text-sm text-xevn-textSecondary mb-1">
                <span>{t('attendance.overview.today')}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <p className="text-2xl md:text-4xl font-bold text-xevn-text mb-1 tabular-nums">{overviewStats.lateEarlyToday}</p>
              <div className="flex items-center gap-1 text-xevn-success text-sm mb-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>{overviewStats.lateEarlyChange}</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-xevn-primary text-sm font-medium">
                {t('attendance.overview.details')}
              </Button>
            </CardContent>
          </Card>

          {/* Actual Leave Card */}
          <Card className="rounded-card border-xevn-border">
            <CardContent className="p-3 md:p-4">
              <h3 className="text-[15px] font-semibold text-xevn-text mb-1">{t('attendance.overview.actualLeave')}</h3>
              <div className="flex items-center gap-1 text-sm text-xevn-textSecondary mb-1">
                <span>{t('attendance.overview.thisWeek')}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <p className="text-2xl md:text-4xl font-bold text-xevn-text mb-1 tabular-nums">{overviewStats.actualLeaveThisWeek}</p>
              <div className="flex items-center gap-1 text-xevn-success text-sm mb-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>{overviewStats.actualLeaveChange}</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-xevn-primary text-sm font-medium">
                {t('attendance.overview.details')}
              </Button>
            </CardContent>
          </Card>

          {/* Planned Leave Card */}
          <Card className="col-span-2 md:col-span-1 rounded-card border-xevn-border">
            <CardContent className="p-3 md:p-4">
              <h3 className="text-[15px] font-semibold text-xevn-text mb-1">{t('attendance.overview.plannedLeave')}</h3>
              <div className="flex items-center gap-1 text-sm text-xevn-textSecondary mb-1">
                <span>{t('attendance.overview.nextWeek')}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <p className="text-2xl md:text-4xl font-bold text-xevn-text mb-1 tabular-nums">{overviewStats.plannedLeaveNextWeek}</p>
              <div className="flex items-center gap-1 text-xevn-success text-sm mb-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>{overviewStats.plannedLeaveChange}</span>
              </div>
              <Button variant="link" className="p-0 h-auto text-xevn-primary text-sm font-medium">
                {t('attendance.overview.details')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts — S05–S08 Precision Motion */}
        <div className="space-y-4 md:space-y-6" data-testid="att-overview-charts-precision">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Leave by Time Chart — S05 */}
              <Card className="rounded-card border-xevn-border bg-xevn-surface">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[20px] font-bold text-xevn-text" data-testid="att-chart-leave-month">{t('attendance.overview.leaveByTime')}</CardTitle>
                  <p className="text-sm text-xevn-textSecondary">
                    {t('attendance.overview.allUnits')}<br />
                    {overviewYearSubtitle}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    {monthlyLeaveData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-[15px] text-xevn-textSecondary">
                        {t('attendance.overview.noData')}
                      </div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyLeaveData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" fontSize={10} angle={-30} textAnchor="end" height={60} />
                        <YAxis fontSize={10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#1E40AF" 
                          strokeWidth={2}
                          dot={{ fill: '#1E40AF', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Leave by Department Chart — S06 */}
              <Card className="rounded-card border-xevn-border bg-xevn-surface">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[20px] font-bold text-xevn-text" data-testid="att-chart-leave-dept">{t('attendance.overview.leaveByDepartment')}</CardTitle>
                  <p className="text-sm text-xevn-textSecondary">
                    {t('attendance.overview.allUnits')}<br />
                    {overviewYearSubtitle}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    {departmentLeaveData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-[15px] text-xevn-textSecondary">
                        {t('attendance.overview.noData')}
                      </div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentLeaveData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={9} angle={-30} textAnchor="end" height={70} interval={0} />
                        <YAxis fontSize={10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                        <Bar dataKey="value" fill="#1E40AF" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leave Type Analysis — S07 */}
              <Card className="rounded-card border-xevn-border bg-xevn-surface">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[20px] font-bold text-xevn-text" data-testid="att-chart-leave-type">{t('attendance.overview.leaveTypeAnalysis')}</CardTitle>
                  <p className="text-sm text-xevn-textSecondary">
                    {t('attendance.overview.allUnits')}<br />
                    {overviewYearSubtitle}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] relative">
                    {leaveTypeData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-[15px] text-xevn-textSecondary">
                        {t('attendance.overview.noData')}
                      </div>
                    ) : (
                    <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leaveTypeData}
                          cx="35%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {leaveTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center text */}
                    <div className="absolute top-1/2 left-[35%] transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-2xl font-bold text-xevn-text">{leaveTypeTotal}</p>
                      <p className="text-sm text-xevn-textSecondary">{t('attendance.overview.leaveRequests')}</p>
                    </div>
                    </>
                    )}
                  </div>
                  {/* Legend */}
                  <div className="space-y-2 mt-2">
                    {leaveTypeData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-sm" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xevn-textSecondary">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Late/Early List — S08 */}
              <Card className="rounded-card border-xevn-border bg-xevn-surface">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[20px] font-bold text-xevn-text" data-testid="att-chart-late-early-list">{t('attendance.overview.lateEarlyList')}</CardTitle>
                  <p className="text-sm text-xevn-textSecondary">
                    {t('attendance.overview.allUnits')}<br />
                    {overviewYearSubtitle}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lateEarlyList.length === 0 ? (
                      <p className="py-8 text-center text-[15px] text-xevn-textSecondary">
                        {t('attendance.overview.noData')}
                      </p>
                    ) : lateEarlyList.map((person, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="text-xs bg-xevn-primary/10 text-xevn-primary font-medium">
                            {person.name.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium text-xevn-text truncate">{person.name}</p>
                          <p className="text-sm text-xevn-textSecondary truncate">{person.dept}</p>
                        </div>
                        <span className="text-[15px] font-semibold text-xevn-text">{person.count} {t('attendance.overview.times')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent leave requests — overview F5 marker (D-HDSD-MUTATE-FE-04) */}
              <LeaveOverviewRecentPanel />
            </div>
          </div>
        </div>
    );
  };

  // Settings tab content with sidebar
  const renderSettingsContent = () => {
    if (activeSidebarItem === 'employees') {
      return (
        <div className="space-y-4" data-testid="att-settings-emp-precision">
          {/* Header */}
          <div className="flex items-center justify-between">
           <h2 className="text-[20px] font-bold text-xevn-text">{t('attPage.employees')}</h2>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                data-testid="hdsd-att-settings-emp-refresh"
                disabled={isRefreshingSettingsEmployees || isLoadingEmployees}
                onClick={() => {
                  void handleRefreshSettingsEmployees();
                }}
              >
                <RefreshCw
                  className={cn(
                    'w-4 h-4',
                    isRefreshingSettingsEmployees && 'animate-spin',
                  )}
                />
                {t('attPage.refreshData')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-xevn-border text-xevn-text"
                data-testid="hdsd-att-settings-emp-import"
                onClick={handleOpenSettingsEmployeeImport}
              >
                <Upload className="w-4 h-4" />
                {t('attPage.import')}
              </Button>
            </div>
          </div>

          {/* Filters — S66 Filter/Download stubs no-op + brand */}
          <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface" data-testid="att-settings-emp-filters">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted" />
                <Input
                  placeholder={t('attPage.search')}
                  className="pl-10 text-[15px] text-xevn-text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] text-xevn-text">
                    <SelectValue placeholder={t('attPage.working')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('attPage.all')}</SelectItem>
                    <SelectItem value="active">{t('attPage.working')}</SelectItem>
                    <SelectItem value="inactive">{t('attPage.resigned')}</SelectItem>
                    <SelectItem value="probation">{t('attPage.probation')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('attPage.allUnits')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('attPage.allUnits')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled
                  className="text-xevn-textMuted disabled:opacity-60"
                  title={t('attPage.settingsEmpFilterHold', 'Bộ lọc nâng cao — chưa có API (stub)')}
                  aria-label={t('attPage.settingsEmpFilterHold', 'Bộ lọc nâng cao — chưa có API (stub)')}
                  data-testid="att-settings-emp-filter-stub"
                >
                  <Filter className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled
                  className="text-xevn-textMuted disabled:opacity-60"
                  title={t('attPage.settingsEmpDownloadHold', 'Tải xuống danh sách — chưa có API (stub)')}
                  aria-label={t('attPage.settingsEmpDownloadHold', 'Tải xuống danh sách — chưa có API (stub)')}
                  data-testid="att-settings-emp-download-stub"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled
                  className="text-xevn-textMuted disabled:opacity-60"
                  title={t('attPage.featureInDev')}
                  aria-label={t('attPage.featureInDev')}
                  data-testid="att-settings-emp-settings-stub"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Data Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-xevn-border bg-xevn-background">
                    <th className="p-3 text-left w-10">
                      <Checkbox 
                        checked={selectedRows.length === filteredEmployees.length && filteredEmployees.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.employeeCode')}</th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.fullName')}</th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.department')}</th>
                    <th className="p-3 text-right font-semibold text-sm text-xevn-textSecondary">{t('attPage.leaveDays')}</th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.attendanceCode')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => (
                    <tr 
                      key={emp.id} 
                      className={cn(
                        "border-b border-xevn-border hover:bg-xevn-primary/5 transition-colors cursor-pointer",
                        selectedRows.includes(emp.id) && "bg-xevn-primary/5"
                      )}
                    >
                      <td className="p-3">
                        <Checkbox 
                          checked={selectedRows.includes(emp.id)}
                          onCheckedChange={() => toggleSelectRow(emp.id)}
                        />
                      </td>
                      <td className="p-3 text-sm text-xevn-text">{emp.employee_code}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-xevn-primary/10 text-xevn-primary font-medium">
                              {emp.full_name.split(' ').pop()?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-xevn-primary hover:underline">
                            {emp.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-xevn-textSecondary">{emp.department || '-'}</td>
                      <td className="p-3 text-sm text-right text-xevn-text">—</td>
                      <td className="p-3 text-sm text-xevn-text">{emp.employee_code || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-xevn-border">
              <div className="text-sm text-xevn-textSecondary">
                {t('attPage.totalRecords')}: <span className="font-medium text-xevn-text">{totalRecords.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4">
                <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-xevn-textSecondary">
                  {t('attPage.fromTo', { from: startRecord, to: endRecord })}
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Attendance rules content

    // Attendance rules content
    if (activeSidebarItem === 'rules') {
      const toggleWorkDay = (code: string) => {
        setRulesForm((prev) => {
          const days = prev.work_days ?? [];
          const next = days.includes(code) ? days.filter((d) => d !== code) : [...days, code];
          return { ...prev, work_days: next };
        });
      };

      const handleSaveGeneralRules = () => {
        void saveAttendanceRules({
          work_start_day: rulesForm.work_start_day,
          work_end_day: rulesForm.work_end_day,
          work_days: rulesForm.work_days,
          round_in_minutes: rulesForm.round_in_minutes,
          round_out_minutes: rulesForm.round_out_minutes,
          allow_multiple_checkin: rulesForm.allow_multiple_checkin,
          auto_checkout: rulesForm.auto_checkout,
          notify_late: rulesForm.notify_late,
        });
      };

      const handleSaveStandardRules = () => {
        void saveAttendanceRules({
          standard_type: rulesForm.standard_type,
          standard_days_per_month: rulesForm.standard_days_per_month,
          hours_per_day: rulesForm.hours_per_day,
        });
      };

      const handleSaveAppPolicy = (patch: AttendanceRulesInput) => {
        setRulesForm((prev) => ({ ...prev, ...patch }));
        void saveAttendanceRules(patch);
      };

      const handleSaveGpsSite = async () => {
        const ok =
          gpsEditIndex != null
            ? await updateGPSLocation(gpsEditIndex, gpsDraft)
            : await addGPSLocation(gpsDraft);
        if (ok) {
          setGpsDialogOpen(false);
          resetGpsDraft();
        }
      };

      const openGpsCreateDialog = () => {
        resetGpsDraft();
        setGpsDialogOpen(true);
      };

      const openGpsEditDialog = (index: number, location: GPSLocation) => {
        setGpsEditIndex(index);
        setGpsDraft({
          id: location.id,
          name: location.name,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          radius: location.radius,
        });
        setGpsDialogOpen(true);
      };

      // Tool versions data
      const toolVersions = [
        { version: 'Tool v1.0', description: t('attPage.toolV1Desc', 'Hỗ trợ .NET Framework 4.5.2'), isNew: true },
        { version: 'Tool v2.0', description: t('attPage.toolV2Desc', 'Hỗ trợ .NET Framework 4.8'), isNew: false },
      ];

      // FAQ items
      const faqItems = [
        t('attPage.faq1', 'Các loại máy chấm công có hỗ trợ kết nối với phần mềm'),
        t('attPage.faq2', 'Một số lỗi thường gặp khi kết nối máy chấm công và cách xử lý'),
        t('attPage.faq3', 'Cách khắc phục khi đồng bộ thiếu dữ liệu chấm công từ máy chấm công về công cụ'),
      ];

      // Login code
      const loginCode = 'npYvBqxfeCqNVQE9XRmp/7F261XVMQ68rv9jk0UccV9B/KJmum4Px9TswjaqxDSMqXlinsA6EghUqyyuKI1...';

      const handleCopyCode = () => {
        navigator.clipboard.writeText('npYvBqxfeCqNVQE9XRmp/7F261XVMQ68rv9jk0UccV9B/KJmum4Px9TswjaqxDSMqXlinsA6EghUqyyuKI1');
      };

      // Render device tab content
      const renderDeviceTabContent = () => (
        <div className="flex gap-6" data-testid="att-rules-device-precision">
          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-xevn-primary text-white text-sm font-medium">1</span>
                <span className="font-semibold text-[15px] text-xevn-text">{t('attPage.installTool')}</span>
                <Info className="w-4 h-4 text-xevn-textMuted" />
              </div>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-xevn-border bg-xevn-background">
                        <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.version')}</th>
                        <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.desc')}</th>
                        <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('attPage.download')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {toolVersions.map((tool, index) => (
                        <tr key={index} className="border-b border-xevn-border hover:bg-xevn-primary/5 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-xevn-text">{tool.version}</span>
                              {tool.isNew && (
                                <Sparkles className="w-4 h-4 text-xevn-accent" />
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-xevn-textSecondary">{tool.description}</td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="icon" className="text-xevn-primary hover:text-xevn-primaryPressed">
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-xevn-primary text-white text-sm font-medium">2</span>
                <span className="font-semibold text-[15px] text-xevn-text">{t('attPage.loginTool')}</span>
              </div>
              <Card className="border border-xevn-border bg-xevn-primary/5">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-xevn-textSecondary">
                    {t('attPage.loginHint')}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-xevn-surface border border-xevn-border rounded-md text-sm text-xevn-textSecondary truncate">
                      {loginCode}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleCopyCode}
                      className="shrink-0 text-xevn-textMuted"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-xevn-primary text-white text-sm font-medium">3</span>
                <span className="font-semibold text-[15px] text-xevn-text">{t('attPage.connectSync')}</span>
                <button type="button" className="text-xevn-primary text-sm font-medium hover:underline">
                  {t('attPage.viewGuide')}
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Sidebar */}
          <div className="w-72 shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-xevn-text">{t('attPage.faq')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {faqItems.map((item, index) => (
                  <button 
                    key={index}
                    type="button"
                    className="flex items-start gap-2 text-left text-sm text-xevn-primary hover:underline"
                  >
                    <span className="shrink-0 text-xevn-textMuted">○</span>
                    <span>{item}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
            {/* Illustration */}
            <div className="mt-6 flex justify-center">
              <div className="text-xevn-textMuted opacity-40 text-6xl" aria-hidden>❓</div>
            </div>
          </div>
        </div>
      );

      const renderGeneralTabContent = () => (
        <div className="space-y-6" data-testid="att-rules-general-precision">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Time settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[15px] text-xevn-text">{t('attPage.timeSettings')}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-xevn-textSecondary">{t('attPage.startDay')}</label>
                    <Select
                      value={String(rulesForm.work_start_day ?? 1)}
                      onValueChange={(v) =>
                        setRulesForm((prev) => ({ ...prev, work_start_day: Number(v) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectDay')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{t('attPage.dayN', { n: i + 1 })}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-xevn-textSecondary">{t('attPage.endDay')}</label>
                    <Select
                      value={String(rulesForm.work_end_day ?? 31)}
                      onValueChange={(v) =>
                        setRulesForm((prev) => ({ ...prev, work_end_day: Number(v) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectDay')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{t('attPage.dayN', { n: i + 1 })}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Work day settings */}
              <div className="space-y-4 pt-4 border-t border-xevn-border">
                <h3 className="font-semibold text-[15px] text-xevn-text">{t('attPage.workDaySettings')}</h3>
                <div className="flex items-center gap-2">
                  {WEEK_DAY_CODES.map((code, index) => {
                    const dayLabels = [
                      t('common.weekDays.mon', 'T2'), t('common.weekDays.tue', 'T3'), t('common.weekDays.wed', 'T4'),
                      t('common.weekDays.thu', 'T5'), t('common.weekDays.fri', 'T6'), t('common.weekDays.sat', 'T7'),
                      t('common.weekDays.sun', 'CN'),
                    ];
                    const active = (rulesForm.work_days ?? []).includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleWorkDay(code)}
                        className={cn(
                          'w-10 h-10 rounded-full text-sm font-medium transition-colors',
                          active
                            ? 'bg-xevn-primary text-white'
                            : 'bg-xevn-background text-xevn-textSecondary hover:bg-xevn-primary/10',
                        )}
                      >
                        {dayLabels[index]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attendance rounding */}
              <div className="space-y-4 pt-4 border-t border-xevn-border">
                <h3 className="font-semibold text-[15px] text-xevn-text">{t('attPage.roundingTitle')}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-xevn-textSecondary">{t('attPage.roundIn')}</label>
                    <Select
                      value={minutesToRoundingSelect(rulesForm.round_in_minutes)}
                      onValueChange={(v) =>
                        setRulesForm((prev) => ({
                          ...prev,
                          round_in_minutes: roundingSelectToMinutes(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectRounding')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('attPage.noRounding')}</SelectItem>
                        <SelectItem value="5">{t('attPage.round5')}</SelectItem>
                        <SelectItem value="10">{t('attPage.round10')}</SelectItem>
                        <SelectItem value="15">{t('attPage.round15')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-xevn-textSecondary">{t('attPage.roundOut')}</label>
                    <Select
                      value={minutesToRoundingSelect(rulesForm.round_out_minutes)}
                      onValueChange={(v) =>
                        setRulesForm((prev) => ({
                          ...prev,
                          round_out_minutes: roundingSelectToMinutes(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectRounding')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('attPage.noRounding')}</SelectItem>
                        <SelectItem value="5">{t('attPage.round5')}</SelectItem>
                        <SelectItem value="10">{t('attPage.round10')}</SelectItem>
                        <SelectItem value="15">{t('attPage.round15')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 pt-4 border-t border-xevn-border">
                <h3 className="font-semibold text-[15px] text-xevn-text">{t('attPage.otherOptions')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="allow-multiple"
                      checked={rulesForm.allow_multiple_checkin ?? true}
                      onCheckedChange={(checked) =>
                        setRulesForm((prev) => ({
                          ...prev,
                          allow_multiple_checkin: checked === true,
                        }))
                      }
                    />
                    <label htmlFor="allow-multiple" className="text-sm text-xevn-text">{t('attPage.allowMultiple')}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="auto-checkout"
                      checked={rulesForm.auto_checkout ?? false}
                      onCheckedChange={(checked) =>
                        setRulesForm((prev) => ({ ...prev, auto_checkout: checked === true }))
                      }
                    />
                    <label htmlFor="auto-checkout" className="text-sm text-xevn-text">{t('attPage.autoCheckout')}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="notify-late"
                      checked={rulesForm.notify_late ?? true}
                      onCheckedChange={(checked) =>
                        setRulesForm((prev) => ({ ...prev, notify_late: checked === true }))
                      }
                    />
                    <label htmlFor="notify-late" className="text-sm text-xevn-text">{t('attPage.notifyLate')}</label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
              disabled={isSavingRules || isLoadingRules}
              onClick={handleSaveGeneralRules}
              data-testid="att-rules-general-save"
            >
              {t('attPage.saveChanges')}
            </Button>
          </div>
        </div>
      );

      const renderStandardTabContent = () => (
        <div className="space-y-6" data-testid="att-rules-standard-precision">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Standard type */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[15px] text-xevn-text">{t('attPage.standardType')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="standard-type"
                      id="fixed"
                      checked={(rulesForm.standard_type ?? 'fixed') === 'fixed'}
                      onChange={() => setRulesForm((prev) => ({ ...prev, standard_type: 'fixed' }))}
                      className="w-4 h-4 accent-xevn-primary"
                    />
                    <label htmlFor="fixed" className="text-sm text-xevn-text">{t('attPage.fixedStandard')}</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="standard-type"
                      id="monthly"
                      checked={rulesForm.standard_type === 'monthly'}
                      onChange={() => setRulesForm((prev) => ({ ...prev, standard_type: 'monthly' }))}
                      className="w-4 h-4 accent-xevn-primary"
                    />
                    <label htmlFor="monthly" className="text-sm text-xevn-text">{t('attPage.monthlyStandard')}</label>
                  </div>
                </div>
              </div>

              {/* Fixed standard */}
              <div className="space-y-4 pt-4 border-t border-xevn-border">
                <h3 className="font-semibold text-[15px] text-xevn-text">{t('attPage.fixedCount')}</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-xevn-textSecondary">{t('attPage.daysPerMonth')}</label>
                    <Input
                      type="number"
                      value={rulesForm.standard_days_per_month ?? 26}
                      onChange={(e) =>
                        setRulesForm((prev) => ({
                          ...prev,
                          standard_days_per_month: Number(e.target.value),
                        }))
                      }
                      className="text-[15px] text-xevn-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-xevn-textSecondary">{t('attPage.hoursPerDay')}</label>
                    <Input
                      type="number"
                      value={rulesForm.hours_per_day ?? 8}
                      onChange={(e) =>
                        setRulesForm((prev) => ({
                          ...prev,
                          hours_per_day: Number(e.target.value),
                        }))
                      }
                      className="text-[15px] text-xevn-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-xevn-textSecondary">{t('attPage.totalHoursMonth')}</label>
                    <Input
                      type="number"
                      value={(rulesForm.standard_days_per_month ?? 26) * (rulesForm.hours_per_day ?? 8)}
                      disabled
                      className="bg-xevn-background text-[15px] text-xevn-textSecondary"
                    />
                  </div>
                </div>
              </div>

              {/* Workday calculation */}
              <div className="space-y-4 pt-4 border-t border-xevn-border">
                <h3 className="font-semibold text-[15px] text-xevn-text">{t('attPage.workdayConversion')}</h3>
                <Card className="bg-xevn-background border-xevn-border">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-xevn-textSecondary">{t('attPage.fullDay')}</span>
                        <span className="text-sm font-medium text-xevn-text">{t('attPage.oneDay')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-xevn-textSecondary">{t('attPage.halfDay')}</span>
                        <span className="text-sm font-medium text-xevn-text">{t('attPage.halfDayValue')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-xevn-textSecondary">{t('attPage.noCount')}</span>
                        <span className="text-sm font-medium text-xevn-text">{t('attPage.zeroDayValue')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
              disabled={isSavingRules || isLoadingRules}
              onClick={handleSaveStandardRules}
              data-testid="att-rules-standard-save"
            >
              {t('attPage.saveChanges')}
            </Button>
          </div>
        </div>
      );

      // Render app attendance tab content
      const renderAppTabContent = () => {
        const appMethods = [
          {
            id: 'gps',
            icon: MapPin,
            title: 'GPS',
            description: t('attPage.gpsDesc'),
            enabled: rulesForm.gps_enabled ?? true,
            flag: 'gps_enabled' as const,
          },
          {
            id: 'wifi',
            icon: Wifi,
            title: 'Wifi',
            description: t('attPage.wifiDesc'),
            enabled: rulesForm.wifi_enabled ?? true,
            flag: 'wifi_enabled' as const,
          },
          {
            id: 'qr',
            icon: QrCode,
            title: 'QR Code',
            description: t('attPage.qrDesc'),
            enabled: rulesForm.qr_enabled ?? false,
            flag: 'qr_enabled' as const,
          },
          {
            id: 'faceid',
            icon: ScanLine,
            title: 'Face ID',
            description: t('attPage.faceidGd1Banner', 'Nhận diện khuôn mặt chưa hỗ trợ GĐ1 — cấu hình tại phiên bản sau.'),
            enabled: false,
            flag: null,
          },
        ];

        return (
          <div className="space-y-6" data-testid="att-rules-app-precision">
            <Alert variant="destructive" data-testid="att-faceid-cfg-banner">
              <AlertTitle>{t('attPage.faceidGd1Title', 'Face ID — ngoài phạm vi GĐ1')}</AlertTitle>
              <AlertDescription>{t('attPage.faceidGd1Banner')}</AlertDescription>
            </Alert>
            {/* App download */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-xevn-primary/10 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-xevn-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[15px] text-xevn-text mb-1">{t('attPage.appTitle')}</h3>
                    <p className="text-xs text-xevn-textMuted mb-1">XeVN EcoSystem</p>
                    <p className="text-sm text-xevn-textSecondary mb-3">
                      {t('attPage.appDownloadDesc', 'Tải ứng dụng để nhân viên có thể chấm công trên điện thoại di động')}
                    </p>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" className="gap-2 border-xevn-border text-xevn-text">
                        <Download className="w-4 h-4" />
                        App Store
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 border-xevn-border text-xevn-text">
                        <Download className="w-4 h-4" />
                        Google Play
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-xevn-text">{t('attPage.attendanceMethods')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appMethods.map((method) => {
                  const MethodIcon = method.icon;
                  return (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-xevn-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        method.enabled ? "bg-xevn-primary/10" : "bg-xevn-background"
                      )}>
                        <MethodIcon className={cn(
                          "w-5 h-5",
                          method.enabled ? "text-xevn-primary" : "text-xevn-textMuted"
                        )} />
                      </div>
                      <div>
                        <h4 className="font-medium text-xevn-text">{method.title}</h4>
                        <p className="text-sm text-xevn-textSecondary">{method.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {method.enabled && method.id !== 'faceid' && (
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">{t('attPage.enabled')}</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-xevn-border text-xevn-text"
                        disabled={method.id === 'faceid' || isSavingRules || !method.flag}
                        data-testid={method.flag ? `att-app-toggle-${method.id}` : undefined}
                        onClick={() => {
                          if (method.flag) {
                            handleSaveAppPolicy({ [method.flag]: !method.enabled });
                          }
                        }}
                      >
                        {method.id === 'faceid'
                          ? t('attPage.faceidDisabled', 'Chưa hỗ trợ')
                          : method.enabled
                            ? t('attPage.disable', 'Tắt')
                            : t('attPage.enable')}
                      </Button>
                    </div>
                  </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* GPS locations — work-sites API (ADR D3 · UC-BP-ATT-03d) */}
            <Card data-testid="att-gps-sites-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-xevn-text">
                  {t('attPage.gpsLocations')}
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                  disabled={isSavingRules}
                  data-testid="att-gps-add-open"
                  onClick={openGpsCreateDialog}
                >
                  <Plus className="w-4 h-4" />
                  {t('attPage.addLocation')}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isAtt03dActiveEmpty((attendanceRulesDB?.gps_locations ?? []).length) ? (
                    <div
                      className="space-y-3 rounded-card border border-dashed border-xevn-border bg-xevn-background p-4 text-center"
                      data-testid="att-03d-empty-cta"
                      role="status"
                    >
                      <p className="text-[15px] text-xevn-textSecondary">
                        {att03dEmptyCatalogCtaMessage()}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                        disabled={isSavingRules}
                        data-testid="att-03d-empty-add"
                        onClick={openGpsCreateDialog}
                      >
                        <Plus className="w-4 h-4" />
                        {t('attPage.addLocation')}
                      </Button>
                    </div>
                  ) : (
                    (attendanceRulesDB?.gps_locations ?? []).map((location, index) => (
                    <div
                      key={location.id ?? `gps-${index}`}
                      className="flex items-center justify-between rounded-card border border-xevn-border bg-xevn-background p-3"
                      data-testid={`att-gps-row-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-xevn-primary" />
                        <div>
                          <p className="text-[15px] font-medium text-xevn-text">{location.name}</p>
                          <p className="text-sm text-xevn-textSecondary">{location.address || '—'}</p>
                          <p className="mt-0.5 text-xs font-medium text-xevn-text" data-testid={`att-gps-status-${index}`}>
                            {location.statusLabelVi ?? (location.active === false ? 'Ngừng' : 'Đang hiệu lực')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="mr-1 text-sm text-xevn-textSecondary">
                          {t('attPage.radius')}: {location.radius}m
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isSavingRules || !location.id}
                          data-testid={`att-gps-edit-${index}`}
                          aria-label={t('attPage.editLocation', 'Sửa vị trí')}
                          onClick={() => openGpsEditDialog(index, location)}
                        >
                          <Pencil className="h-4 w-4 text-xevn-primary" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isSavingRules}
                          data-testid={`att-gps-retire-${index}`}
                          aria-label={t('attPage.retireLocation', 'Ngừng theo dõi')}
                          title={t('attPage.retireLocation', 'Ngừng theo dõi')}
                          onClick={() => void removeGPSLocation(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
                <p
                  className="mt-3 text-xs leading-relaxed text-xevn-textSecondary"
                  data-testid="att-03d-honesty"
                  role="note"
                >
                  {att03dHonestyBannerText()}
                </p>
              </CardContent>
            </Card>

            <Dialog
              open={gpsDialogOpen}
              onOpenChange={(open) => {
                setGpsDialogOpen(open);
                if (!open) resetGpsDraft();
              }}
            >
              <DialogContent
                className="sm:max-w-[560px]"
                data-testid={gpsEditIndex != null ? 'att-gps-edit-dialog' : 'att-gps-add-dialog'}
              >
                <DialogHeader>
                  <DialogTitle className="text-[20px] font-bold text-xevn-text">
                    {gpsEditIndex != null
                      ? t('attPage.editLocation', 'Sửa vị trí')
                      : t('attPage.addLocation')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="space-y-1">
                    <label className="text-[15px] font-medium text-xevn-textSecondary">
                      {t('attPage.locationName', 'Tên vị trí')}
                    </label>
                    <Input
                      value={gpsDraft.name}
                      onChange={(e) => setGpsDraft((d) => ({ ...d, name: e.target.value }))}
                      className="xevn-field-name text-[15px] text-xevn-text"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[15px] font-medium text-xevn-textSecondary">
                      {t('attPage.address', 'Địa chỉ')}
                    </label>
                    <Input
                      value={gpsDraft.address}
                      onChange={(e) => setGpsDraft((d) => ({ ...d, address: e.target.value }))}
                      className="xevn-field-line text-[15px] text-xevn-text"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[15px] font-medium text-xevn-textSecondary">Latitude</label>
                      <Input
                        type="number"
                        step="any"
                        value={gpsDraft.latitude}
                        onChange={(e) => setGpsDraft((d) => ({ ...d, latitude: Number(e.target.value) }))}
                        className="xevn-field-num text-[15px] text-xevn-text"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[15px] font-medium text-xevn-textSecondary">Longitude</label>
                      <Input
                        type="number"
                        step="any"
                        value={gpsDraft.longitude}
                        onChange={(e) => setGpsDraft((d) => ({ ...d, longitude: Number(e.target.value) }))}
                        className="xevn-field-num text-[15px] text-xevn-text"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[15px] font-medium text-xevn-textSecondary">
                      {t('attPage.radius')} (m)
                    </label>
                    <Input
                      type="number"
                      value={gpsDraft.radius}
                      onChange={(e) => setGpsDraft((d) => ({ ...d, radius: Number(e.target.value) }))}
                      className="xevn-field-num text-[15px] text-xevn-text"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setGpsDialogOpen(false);
                      resetGpsDraft();
                    }}
                  >
                    {t('common.cancel', 'Hủy')}
                  </Button>
                  <Button
                    type="button"
                    className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                    disabled={!gpsDraft.name.trim() || isSavingRules}
                    data-testid={gpsEditIndex != null ? 'att-gps-edit-submit' : 'att-gps-add-submit'}
                    onClick={() => void handleSaveGpsSite()}
                  >
                    {t('common.save', 'Lưu')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      };

      // Render customize tab content — S69–S70 static/GĐ2 stub (no invent mutate LIVE)
      const renderCustomizeTabContent = () => (
        <div className="space-y-4" data-testid="att-rules-customize-precision">
          <Alert className="border-xevn-border" data-testid="att-rules-customize-hold-banner">
            <AlertTitle className="text-[20px] font-bold text-xevn-text">
              {t('attPage.featureInDev')}
              <Badge variant="outline" className="ml-2 border-xevn-border text-xevn-textSecondary text-[10px] font-semibold align-middle">
                {t('attPage.gd2HoldBadge')}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-[15px] text-xevn-textSecondary">
              {t(
                'attPage.rulesCustomizeHold',
                'Tùy chỉnh cột bảng công — chỉ xem tĩnh GĐ1; Reset / Xem trước / Thêm cột chưa lưu Nest.',
              )}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[15px] text-xevn-textSecondary italic">
              {t('attPage.customizeDesc')}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-xevn-border text-xevn-text disabled:opacity-60"
                disabled
                title={t('attPage.rulesCustomizeHold')}
                data-testid="att-rules-customize-reset-stub"
              >
                <RotateCcw className="w-4 h-4 text-xevn-textMuted" />
                {t('attPage.resetDefault')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-xevn-border text-xevn-text disabled:opacity-60"
                disabled
                title={t('attPage.rulesCustomizeHold')}
                data-testid="att-rules-customize-preview-stub"
              >
                <Eye className="w-4 h-4 text-xevn-textMuted" />
                {t('attPage.preview')}
              </Button>
            </div>
          </div>

          <Card className="rounded-card border-xevn-border bg-xevn-surface">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-xevn-border bg-xevn-background">
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary w-1/3">{t('attPage.columnName')}</th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.desc')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceColumnsData.map((column) => (
                    <tr key={column.id} className="border-b border-xevn-border hover:bg-xevn-background/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-xevn-textMuted" aria-hidden />
                          <span className="text-sm font-medium text-xevn-text">{column.name}</span>
                          {column.hasAdvanced && (
                            <button
                              type="button"
                              disabled
                              className="text-xevn-primary text-sm font-medium flex items-center gap-1 opacity-60 cursor-not-allowed"
                              title={t('attPage.rulesCustomizeHold')}
                              data-testid="att-rules-customize-advanced-stub"
                            >
                              {t('attPage.advancedSetup')}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-xevn-textSecondary whitespace-pre-line">
                          {column.description}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-xevn-border">
              <Button
                type="button"
                variant="ghost"
                disabled
                className="gap-2 text-xevn-primary disabled:opacity-60"
                title={t('attPage.rulesCustomizeHold')}
                data-testid="att-rules-customize-add-stub"
              >
                <Plus className="w-4 h-4" />
                {t('attPage.addColumn')}
              </Button>
            </div>
          </Card>
        </div>
      );

      return (
        <div className="space-y-4" data-testid="att-settings-rules-precision">
          {/* Header — S76–S78 share shell; suggest CTA stays disabled honesty (no invent) */}
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-xevn-text">{t('attPage.rulesTitle')}</h2>
            <Button
              type="button"
              variant="outline"
              disabled
              className="gap-2 border-xevn-border text-xevn-textSecondary disabled:opacity-60"
              title={t('attPage.featureInDev')}
              aria-label={t('attPage.featureInDev')}
              data-testid="att-rules-suggest-stub"
            >
              <Sparkles className="w-4 h-4 text-xevn-textMuted" aria-hidden />
              {t('attPage.suggestMethod')}
            </Button>
          </div>

          {/* Sub-tabs */}
          <div className="border-b border-xevn-border overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {attendanceRulesTabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`hdsd-att-rules-tab-${tab.id}`}
                  onClick={() => setActiveRulesTab(tab.id)}
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap",
                    activeRulesTab === tab.id
                      ? "text-xevn-primary"
                      : "text-xevn-textSecondary hover:text-xevn-text"
                  )}
                >
                  {tab.label}
                  {activeRulesTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-xevn-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          {activeRulesTab === 'general' && (
            <div className="space-y-6">
              {renderGeneralTabContent()}
              <AttLatePenaltyModePanel />
            </div>
          )}
          {activeRulesTab === 'standard' && renderStandardTabContent()}
          {activeRulesTab === 'customize' && renderCustomizeTabContent()}
          {activeRulesTab === 'device' && renderDeviceTabContent()}
          {activeRulesTab === 'app' && renderAppTabContent()}
          {/* S76–S78 — tablet / proxy / auto STUB|GĐ2 honesty (no invent LIVE CFG) */}
          {!['general', 'standard', 'customize', 'device', 'app'].includes(activeRulesTab) && (() => {
            const stubTabId = activeRulesTab as 'tablet' | 'proxy' | 'auto';
            const stubLabel = attendanceRulesTabs.find((tab) => tab.id === activeRulesTab)?.label ?? activeRulesTab;
            const isProxyGd2 = stubTabId === 'proxy';
            const isAutoAsIs = stubTabId === 'auto';
            return (
              <div className="space-y-4" data-testid={`att-rules-${stubTabId}-stub-precision`}>
                <Alert className="border-xevn-border bg-xevn-surface" data-testid={`att-rules-${stubTabId}-hold-banner`}>
                  <AlertTitle className="text-[20px] font-bold text-xevn-text">
                    {stubLabel}
                    <Badge
                      variant="outline"
                      className="ml-2 border-xevn-border text-xevn-textSecondary text-[10px] font-semibold align-middle"
                    >
                      {isProxyGd2
                        ? t('attPage.gd2HoldBadge')
                        : t('attPage.stubBadge', 'STUB')}
                    </Badge>
                    {isAutoAsIs ? (
                      <Badge
                        variant="outline"
                        className="ml-1 border-xevn-border text-xevn-textSecondary text-[10px] font-semibold align-middle"
                      >
                        {t('attPage.acceptedAsIsBadge', 'ACCEPTED_AS_IS')}
                      </Badge>
                    ) : null}
                  </AlertTitle>
                  <AlertDescription className="text-[15px] text-xevn-textSecondary">
                    {t(
                      'attPage.rulesChannelStubHold',
                      'Kênh quy tắc này chưa có API persist — chỉ hiển thị honesty; không cấu hình LIVE tại đây.',
                    )}
                  </AlertDescription>
                </Alert>
                <Card className="rounded-card border-xevn-border bg-xevn-surface">
                  <div className="flex items-center justify-center h-56 text-xevn-textSecondary">
                    <div className="text-center px-6">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-xevn-textMuted" aria-hidden />
                      <p className="text-[20px] font-bold text-xevn-text">{stubLabel}</p>
                      <p className="text-sm text-xevn-textSecondary mt-2">{t('attPage.featureInDev')}</p>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })()}
        </div>
      );
    }

    // S79–S82 — CFG redirect honesty (no Nest invent on Attendance settings)
    // leave-rules: LIVE F-ATT-CAT-LVT (PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01) — not stub
    if (activeSidebarItem === 'leave-rules') {
      return (
        <div className="space-y-4" data-testid="att-cfg-leave-rules-precision">
          <AttLeaveTypeSettingsPanel />
          <AttLeaveAccrualPolicySettingsPanel />
        </div>
      );
    }

    // ATT-03b thin LIVE — F-ATT-HOL-01 GET/PUT year (≠ ATT-03b DONE alone)
    if (activeSidebarItem === 'holiday-calendar') {
      return (
        <div className="space-y-4" data-testid="att-cfg-holiday-calendar-precision">
          <AttHolidayCalendarPanel />
        </div>
      );
    }

    if (activeSidebarItem === 'attendance-codes') {
      return (
        <div className="space-y-4" data-testid="att-cfg-attendance-codes-precision">
          <AttAttendanceCodeSettingsPanel />
        </div>
      );
    }
    if (activeSidebarItem === 'ot-types') {
      return (
        <div className="space-y-4" data-testid="att-cfg-ot-types-precision">
          <AttOtTypeSettingsPanel />
        </div>
      );
    }
    if (activeSidebarItem === 'ot-comp-types') {
      return (
        <div className="space-y-4" data-testid="att-cfg-ot-comp-types-precision">
          <AttOtCompTypeSettingsPanel />
        </div>
      );
    }
    if (activeSidebarItem === 'shifts-config') {
      return (
        <div className="space-y-4" data-testid="att-cfg-shifts-config-precision">
          <AttShiftSettingsPanel />
        </div>
      );
    }
    if (activeSidebarItem === 'work-rules-config') {
      return (
        <div className="space-y-4" data-testid="att-cfg-work-rules-config-precision">
          <AttWorkRuleSettingsPanel />
        </div>
      );
    }
    if (activeSidebarItem === 'schedule-groups-config') {
      return (
        <div className="space-y-4" data-testid="att-cfg-schedule-groups-config-precision">
          <AttScheduleGroupSettingsPanel />
        </div>
      );
    }
    if (activeSidebarItem === 'ot-comp-leave-policy') {
      return (
        <div className="space-y-4" data-testid="att-cfg-ot-comp-leave-policy-precision">
          <AttOtCompLeavePolicySettingsPanel />
        </div>
      );
    }
    if (activeSidebarItem === 'sick-leave-fund-order') {
      return (
        <div className="space-y-4" data-testid="att-cfg-sick-leave-fund-order-precision">
          <AttSickLeaveFundOrderSettingsPanel />
        </div>
      );
    }

    const d4StubSidebarIds = ['overtime', 'late-early', 'request-rules'] as const;
    if (d4StubSidebarIds.includes(activeSidebarItem as (typeof d4StubSidebarIds)[number])) {
      const cfgLabel = sidebarMenuItems.find((item) => item.id === activeSidebarItem)?.label ?? activeSidebarItem;
      const settingsCatalogLinkOuter = (
        <a
          href="/settings"
          className="inline-flex items-center gap-1 text-xevn-primary underline font-medium text-[15px] hover:text-xevn-primaryPressed"
          data-testid={`att-cfg-redirect-${activeSidebarItem}-link`}
        >
          {t('attPage.openSettingsCatalog', 'Cài đặt HRM → Danh mục / Công ty')}
        </a>
      );
      return (
        <div className="max-w-2xl space-y-4" data-testid={`att-cfg-redirect-${activeSidebarItem}-precision`}>
          <Alert className="border-xevn-border bg-xevn-surface" data-testid={`att-cfg-redirect-${activeSidebarItem}-banner`}>
            <AlertTitle className="text-[20px] font-bold text-xevn-text">
              {cfgLabel}
              <Badge
                variant="outline"
                className="ml-2 border-xevn-border text-xevn-textSecondary text-[10px] font-semibold align-middle"
              >
                {t('attPage.cfgRedirectBadge', 'CFG')}
              </Badge>
            </AlertTitle>
            <AlertDescription className="space-y-3 text-[15px] text-xevn-textSecondary">
              <p>
                {t(
                  'attPage.cfgRedirectSettings',
                  'Cấu hình mục này tại Cài đặt HRM — Danh mục hoặc Công ty, không lưu tại màn Chấm công.',
                )}
              </p>
              {settingsCatalogLinkOuter}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // S83–S85 — users / roles / system STUB honesty (no-op, no invent LIVE)
    const honestyStubSidebarIds = ['users', 'roles', 'system'] as const;
    if (honestyStubSidebarIds.includes(activeSidebarItem as (typeof honestyStubSidebarIds)[number])) {
      const stubSidebarLabel =
        sidebarMenuItems.find((item) => item.id === activeSidebarItem)?.label ?? activeSidebarItem;
      return (
        <div className="space-y-4" data-testid={`att-settings-${activeSidebarItem}-stub-precision`}>
          <Alert className="border-xevn-border bg-xevn-surface" data-testid={`att-settings-${activeSidebarItem}-hold-banner`}>
            <AlertTitle className="text-[20px] font-bold text-xevn-text">
              {stubSidebarLabel}
              <Badge
                variant="outline"
                className="ml-2 border-xevn-border text-xevn-textSecondary text-[10px] font-semibold align-middle"
              >
                {t('attPage.stubBadge', 'STUB')}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-[15px] text-xevn-textSecondary">
              {t(
                'attPage.settingsSidebarStubHold',
                'Màn hình này chưa có API — chỉ honesty stub; không tạo/sửa người dùng, vai trò hay cấu hình hệ thống tại Chấm công.',
              )}
            </AlertDescription>
          </Alert>
          <Card className="rounded-card border-xevn-border bg-xevn-surface">
            <div className="flex items-center justify-center h-56 text-xevn-textSecondary">
              <div className="text-center px-6">
                <Settings className="w-12 h-12 mx-auto mb-4 text-xevn-textMuted" aria-hidden />
                <p className="text-[20px] font-bold text-xevn-text">{stubSidebarLabel}</p>
                <p className="text-sm text-xevn-textSecondary mt-2">{t('attPage.featureInDev')}</p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Fallback sidebar placeholder (should not hit for known menu ids)
    return (
      <div className="flex items-center justify-center h-64 text-xevn-textSecondary" data-testid="att-settings-sidebar-stub">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-xevn-textMuted" aria-hidden />
          <p className="text-[20px] font-bold text-xevn-text">{sidebarMenuItems.find(item => item.id === activeSidebarItem)?.label}</p>
          <p className="text-sm text-xevn-textSecondary">{t('attPage.featureInDev')}</p>
        </div>
      </div>
    );
  };

  // Get avatar initials
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0);
    }
    return parts[0].charAt(0);
  };

  // Get avatar color based on name — Precision Motion (no purple/pink/cyan AI palette)
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-xevn-primary/10 text-xevn-primary',
      'bg-xevn-primary/15 text-xevn-primary',
      'bg-green-100 text-green-800',
      'bg-xevn-background text-xevn-textSecondary',
      'bg-xevn-textSecondary/15 text-xevn-textSecondary',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get status color for shift cell
  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case 'full': return 'bg-green-500';
      case 'half': return 'bg-yellow-500';
      case 'late': return 'bg-red-500';
      default: return 'bg-xevn-textMuted';
    }
  };

  // Render attendance sheets list
  const renderAttendanceSheetsList = () => {
    // Transform DB data to display format
    const sheetsDisplayData = attendanceSheetsDB.map(sheet => ({
      id: sheet.id,
      period: `${formatDisplayDate(sheet.start_date)} - ${formatDisplayDate(sheet.end_date)}`,
      name: sheet.name,
      type: sheet.attendance_type === 'hourly' ? t('attPage.byHour') : t('attPage.byDay'),
      unit: sheet.department || t('attPage.allUnits'),
      positions: sheet.positions || t('attPage.allPositions'),
    }));

    return (
      <div className="space-y-4 p-6" data-testid="att-sheets-precision">
        {/* Header — S23 */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-xevn-text">{t('attPage.sheetTitle')}</h2>
          <Button
            onClick={() => setAddSheetModalOpen(true)}
            className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
            data-testid="att-sheets-add"
          >
            <Plus className="w-4 h-4" />
            {t('attPage.add')}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted" />
            <Input placeholder={t('attPage.search')} className="pl-10 text-[15px] text-xevn-text" />
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('attPage.allUnits')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('attPage.allUnits')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" type="button" disabled title={t('attPage.weeklyStubHold', 'Cài đặt tuần — chưa có API')} data-testid="att-weekly-stub-settings">
              <Settings className="w-4 h-4 text-xevn-textMuted" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="rounded-card border-xevn-border bg-xevn-surface">
          {isLoadingSheets ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-xevn-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-xevn-border bg-xevn-background">
                    <th className="p-3 text-left w-10">
                      <Checkbox />
                    </th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.time')}</th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.sheetName')}</th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.attendanceType')}</th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.unit')}</th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.position')}</th>
                    <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attSign.statusColumn', 'Trạng thái')}</th>
                    <th className="p-3 text-center font-semibold text-sm w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {sheetsDisplayData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[15px] text-xevn-textSecondary">
                        {t('attPage.noSheets')}
                      </td>
                    </tr>
                  ) : attendanceSheetsDB.map((sheet) => {
                    const display = {
                      id: sheet.id,
                      period: `${formatDisplayDate(sheet.start_date)} - ${formatDisplayDate(sheet.end_date)}`,
                      name: sheet.name,
                      type: sheet.attendance_type === 'hourly' ? t('attPage.byHour') : t('attPage.byDay'),
                      unit: sheet.department || t('attPage.allUnits'),
                      positions: sheet.positions || t('attPage.allPositions'),
                      status: sheet.status,
                    };
                    return (
                    <tr 
                      key={display.id} 
                      className="border-b border-xevn-border hover:bg-xevn-background/80 transition-colors cursor-pointer"
                      onClick={() => handleOpenSheet(display.id)}
                      data-testid={`att-sheet-row-${display.id}`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox />
                      </td>
                      <td className="p-3 text-sm font-medium text-xevn-primary hover:underline">{display.period}</td>
                      <td className="p-3 text-sm font-medium text-xevn-primary hover:underline max-w-[300px] truncate">{display.name}</td>
                      <td className="p-3 text-sm text-xevn-textSecondary">{display.type}</td>
                      <td className="p-3 text-sm text-xevn-textSecondary">{display.unit}</td>
                      <td className="p-3 text-sm text-xevn-textSecondary max-w-[200px] truncate">{display.positions}</td>
                      <td className="p-3 text-sm text-xevn-textSecondary" data-testid={`att-sheet-status-${display.id}`}>
                        {sheetStatusViLabel(display.status, t)}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 text-xevn-textSecondary hover:text-destructive"
                          onClick={() => openDeleteSheetModal({ id: display.id, name: display.name })}
                          data-testid={`att-sheet-delete-${display.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-xevn-border">
            <div className="text-sm text-xevn-textSecondary">
              {t('attPage.totalRecords')}: <span className="font-medium text-xevn-text">{sheetsDisplayData.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <Select defaultValue="10">
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-xevn-textSecondary">{t('attPage.fromTo', { from: 1, to: 10 })}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render weekly attendance summary
  const renderWeeklyAttendance = () => {
    const weekHeader =
      weeklyAttendanceData[0]?.days ?? buildWeeklyDayHeaderFallback(weeklyRange.days);
    const { start: weeklyStartLabel, end: weeklyEndLabel } = formatWeeklyRangeTitleLabels(
      weeklyRange.from,
      weeklyRange.to,
    );

    return (
      <div
        className="space-y-4 p-6"
        data-testid="att-weekly-precision"
        data-active-sheet-id={selectedSheetId ?? undefined}
      >
        {/* Header — S31 weekly */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setAttendanceViewMode('list')}>
              <ChevronLeft className="w-4 h-4 text-xevn-textSecondary" />
            </Button>
            <h2 className="text-[20px] font-bold text-xevn-text">
              {selectedSheet?.name ?? t('attPage.weeklyTitle', { start: weeklyStartLabel, end: weeklyEndLabel })}
              <span className="text-xevn-textSecondary ml-2 font-normal text-base">({t('attPage.standardLabel')})</span>
            </h2>
            {/* S33 stub — no-op honesty */}
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              title={t('attPage.featureInDev')}
              aria-label={t('attPage.featureInDev')}
              data-testid="att-weekly-stub-pencil"
              type="button"
            >
              <Pencil className="w-3 h-3 text-xevn-textMuted" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2 border border-xevn-border rounded-card bg-xevn-surface">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-xevn-text">{t('attPage.fullAttendance')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-xevn-text">{t('attPage.halfAttendance')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-sm text-xevn-text">{t('attPage.absent')}</span>
              </div>
            </div>
            <Button
              className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
              onClick={() => void refetchWeeklyAttendance()}
              disabled={isFetchingWeeklyAttendance}
            >
              <RotateCcw className={cn('w-4 h-4', isFetchingWeeklyAttendance && 'animate-spin')} />
              {t('attPage.reload')}
            </Button>
            {/* S33 stub — no-op honesty */}
            <Button
              variant="ghost"
              size="icon"
              title={t('attPage.featureInDev')}
              aria-label={t('attPage.featureInDev')}
              type="button"
            >
              <Settings className="w-4 h-4 text-xevn-textMuted" />
            </Button>
          </div>
        </div>

        {selectedSheetId && currentCompanyId ? (
          <AttendanceSheetSignPanel
            sheetId={selectedSheetId}
            companyId={currentCompanyId}
            sheetStatus={selectedSheet?.status ?? 'draft'}
            onSheetMutated={handleSheetMutated}
          />
        ) : null}

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted" />
            <Input placeholder={t('attPage.search')} className="pl-10 text-[15px] text-xevn-text" />
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('attPage.allUnits')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('attPage.allUnits')}</SelectItem>
                {weeklyDepartmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* S33 stub — no-op honesty */}
            <Button
              variant="ghost"
              size="icon"
              title={t('attPage.featureInDev')}
              aria-label={t('attPage.featureInDev')}
              type="button"
            >
              <Download className="w-4 h-4 text-xevn-textMuted" />
            </Button>
          </div>
        </div>

        {/* Weekly Table — spinner only on initial load; settled empty/error stops reload storm */}
        <Card className="rounded-card border-xevn-border bg-xevn-surface">
          {isLoadingWeeklyAttendance ? (
            <div className="flex items-center justify-center p-12" role="status" aria-live="polite">
              <Loader2 className="w-8 h-8 animate-spin text-xevn-primary" />
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-xevn-border bg-xevn-background">
                  <th className="p-3 text-left w-10">
                    <Checkbox />
                  </th>
                  <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary min-w-[180px]">{t('attPage.employee')}</th>
                  {weekHeader.map((day, idx) => (
                    <th key={idx} className="p-3 text-center font-semibold text-sm min-w-[140px]">
                      <div className="text-xevn-textSecondary text-xs">{day.dayLabel}</div>
                      <div className="text-xl font-bold text-xevn-text">{day.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyAttendanceData.length === 0 ? (
                  <tr>
                    <td colSpan={weekHeader.length + 2} className="p-8 text-center text-[15px] text-xevn-textSecondary">
                      {weeklyAttendanceLoadError
                        ? weeklyAttendanceLoadError
                        : t('attendance.overview.noData')}
                    </td>
                  </tr>
                ) : weeklyAttendanceData.map((employee) => (
                  <tr key={employee.id} className="border-b border-xevn-border hover:bg-xevn-background/60">
                    <td className="p-3">
                      <Checkbox />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className={cn("text-xs font-medium", getAvatarColor(employee.name))}>
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-xevn-text">{employee.name}</div>
                          <div className="text-xs text-xevn-textSecondary">{employee.code}</div>
                        </div>
                      </div>
                    </td>
                    {employee.days.map((day, dayIdx) => (
                      <td 
                        key={dayIdx} 
                        className="p-2 align-top cursor-pointer hover:bg-xevn-background transition-colors"
                        onClick={() => openCellDetailModal(employee, day)}
                      >
                        <div className="space-y-1">
                          {day.shifts.map((shift, shiftIdx) => (
                            <div key={shiftIdx} className="text-xs">
                              {'type' in shift ? (
                                <div className={cn(
                                  "px-2 py-1 rounded border",
                                  shift.type === 'holiday' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                  shift.type === 'leave' ? 'bg-red-50 border-red-200 text-red-700' :
                                  'bg-xevn-background border-xevn-border text-xevn-text'
                                )}>
                                  {shift.name}
                                </div>
                              ) : (
                                <div className="flex items-start gap-1.5">
                                  <span className={cn("w-2 h-2 rounded-full mt-1 shrink-0", getShiftStatusColor(shift.status))}></span>
                                  <div>
                                    <div className="font-medium text-xevn-text">{shift.shift}</div>
                                    {shift.time && (
                                      <div className={cn(
                                        "text-[10px]",
                                        shift.status === 'late' ? 'text-red-600' : 'text-xevn-textSecondary'
                                      )}>
                                        {shift.time}
                                      </div>
                                    )}
                                    {!shift.time && <div className="text-[10px] text-xevn-textSecondary">--:--</div>}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          {day.shifts.length === 0 && (
                            <div className="text-xs text-xevn-textSecondary text-center py-2">-</div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-xevn-border">
            <div className="text-sm text-xevn-textSecondary">
              {t('attPage.total')}: <span className="font-medium text-xevn-text">{weeklyAttendanceData.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <Select defaultValue="15">
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-xevn-textSecondary">
                {weeklyRangeSubtitle}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderClockInMethodPanel = (method: ClockInMethod) => {
    if (method === 'manual') {
      return (
        <div className="space-y-6" data-testid="clock-in-panel-manual">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CheckInOutWidget />
            <Card className="rounded-card border-xevn-border p-6">
              <h3 className="text-lg font-semibold text-xevn-text mb-4">{t('attPage.checkinGuide')}</h3>
              <ul className="space-y-2 text-[15px] text-xevn-textSecondary">
                <li>• {t('attPage.checkinGuide1')}</li>
                <li>• {t('attPage.checkinGuide2')}</li>
                <li>• {t('attPage.checkinGuide3')}</li>
                <li>• {t('attPage.checkinGuide4')}</li>
                <li>• {t('attPage.checkinGuide5')}</li>
              </ul>
            </Card>
          </div>
        </div>
      );
    }
    if (method === 'qrcode') {
      // S13–S14 QR clock remastered; PROP-03e EmployeeQRCard = SKIP honesty (no invent card issuance)
      return (
        <div className="space-y-6" data-testid="clock-in-panel-qrcode">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lazyBlock(<QRCodeScanner />)}
            <Card
              className="rounded-card border-xevn-border bg-xevn-surface p-6"
              data-testid="att-prop-03e-qr-card-skip"
            >
              <Alert className="border-xevn-border">
                <AlertTitle className="text-[20px] font-bold text-xevn-text">
                  {t('attPage.featureInDev')}
                </AlertTitle>
                <AlertDescription className="text-[15px] text-xevn-textSecondary">
                  {t('attPage.qrCardSkip')}
                </AlertDescription>
              </Alert>
            </Card>
          </div>
        </div>
      );
    }
    if (method === 'faceid') {
      // S17–S19 Face web = GĐ2-HOLD honesty shell — must_keep featureHold; never claim Face LIVE
      return (
        <div className="space-y-6" data-testid="clock-in-panel-faceid">
          <Alert className="border-xevn-border bg-xevn-surface" data-testid="att-faceid-hold-banner">
            <AlertTitle className="text-[20px] font-bold text-xevn-text flex flex-wrap items-center gap-2">
              <span>{t('attPage.featureInDev')}</span>
              <Badge
                variant="outline"
                className="font-semibold text-xevn-textSecondary border-xevn-border"
                data-testid="att-faceid-gd2-badge"
              >
                {t('attPage.gd2HoldBadge')}
              </Badge>
              <span className="text-sm font-normal text-xevn-textSecondary">
                — {t('attendance.attendanceMenu.faceid', 'Khuôn mặt')}
              </span>
            </AlertTitle>
            <AlertDescription className="text-[15px] text-xevn-textSecondary">
              {t('attPage.faceIdHold')}
            </AlertDescription>
          </Alert>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-60 pointer-events-none"
            aria-disabled="true"
            data-testid="att-faceid-shell-disabled"
          >
            {lazyBlock(<FaceIDScanner featureHold />)}
            {lazyBlock(<FaceRegistration featureHold />)}
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6" data-testid="clock-in-panel-gps">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lazyBlock(<GPSAttendance />)}
          <Card className="rounded-card border-xevn-border p-6">
            <h3 className="text-lg font-semibold text-xevn-text mb-4">{t('attPage.gpsGuide')}</h3>
            <ul className="space-y-2 text-[15px] text-xevn-textSecondary">
              <li>• {t('attPage.gpsGuide1')}</li>
              <li>• {t('attPage.gpsGuide2')}</li>
              <li>• {t('attPage.gpsGuide3')}</li>
              <li>• {t('attPage.gpsGuide4')}</li>
              <li>• {t('attPage.gpsGuide5')}</li>
              <li>• {t('attPage.gpsGuide6')}</li>
            </ul>
            <div className="mt-6 p-4 rounded-card border border-xevn-border bg-xevn-primary/5">
              <h4 className="font-semibold text-[15px] text-xevn-primary mb-2">{t('attPage.accuracyNote')}</h4>
              <ul className="text-sm text-xevn-textSecondary space-y-1">
                <li>• &lt;10m: {t('attPage.accuracyVeryHigh', 'Rất chính xác (GPS mạnh)')}</li>
                <li>• 10-50m: {t('attPage.accuracyHigh', 'Chính xác (GPS tốt)')}</li>
                <li>• 50-100m: {t('attPage.accuracyMedium', 'Trung bình (có thể dùng)')}</li>
                <li>• &gt;100m: {t('attPage.accuracyLow', 'Kém (nên thử lại)')}</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Render attendance content (Chấm công tab)
  const renderAttendanceContent = () => {
    // Task-based Clock-In wizard (collapsed checkinout/qr/face/gps) — W3-ATT-A S10–S22 chrome
    if (isClockInAttendanceType(activeAttendanceType)) {
      const method = resolveClockInMethod(activeAttendanceType, clockInMethod);
      return (
        <div className="space-y-6 p-6" data-testid="clock-in-wizard">
          <div className="space-y-1">
            <h2 className="text-[20px] font-bold text-xevn-text">
              {t('attPage.clockInTitle', 'Chấm công / Clock-In')}
            </h2>
            <p className="text-[15px] text-xevn-textSecondary">
              {t(
                'attPage.clockInSubtitle',
                'Chọn phương thức chấm công để bắt đầu — thao tác chính trong tối đa 2 bước.',
              )}
            </p>
          </div>
          <ClockInMethodSelector
            value={method}
            onChange={(next) => {
              setActiveAttendanceType(CLOCK_IN_ATTENDANCE_TYPE);
              setClockInMethod(next);
            }}
          />
          {renderClockInMethodPanel(method)}
          <div className="mt-2" data-testid="clock-in-today-records">
            <h3 className="text-lg font-semibold text-xevn-text mb-4">{t('attPage.todayData')}</h3>
            <AttendanceRecordsTable />
          </div>
        </div>
      );
    }

    // Show real records from database — S26/S29 (+ S34 summary alias = same records wire)
    if (activeAttendanceType === 'records' || activeAttendanceType === 'summary') {
      return (
        <div className="space-y-4 p-6" data-testid="att-records-precision">
          <h2 className="text-[20px] font-bold text-xevn-text">{t('attPage.recordsTitle')}</h2>
          <AttendanceRecordsTable />
        </div>
      );
    }

    // Show sheets list
    if (attendanceViewMode === 'list') {
      return renderAttendanceSheetsList();
    }
    
    // Show weekly view if selected
    if (attendanceViewMode === 'weekly') {
      return renderWeeklyAttendance();
    }

    return (
      <div className="space-y-4 p-6" data-testid="att-records-fallback-precision">
        {/* Header — S29/S34 records+summary alias (= records wire) */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-xevn-text">{t('attPage.recordsTitle')}</h2>
          <Button 
            variant="outline" 
            className="gap-2 border-xevn-border text-xevn-text"
            onClick={() => setAttendanceViewMode('weekly')}
          >
            <Calendar className="w-4 h-4" />
            {t('attPage.viewWeekly')}
          </Button>
        </div>

        <AttendanceRecordsTable />
      </div>
    );
  };

  // Render shifts content — schedule/OT never mount shifts-table (GĐ2 roster HOLD)
  const renderShiftsContent = () => {
    if (activeShiftType === 'schedule' || activeShiftType === 'overtime') {
      const isSchedule = activeShiftType === 'schedule';
      const holdTestId = isSchedule ? 'shifts-schedule-hold' : 'shifts-overtime-hold';
      const holdTitle = isSchedule
        ? t('attendance.shiftsMenu.schedule')
        : t('attendance.shiftsMenu.overtime');
      const holdBody = isSchedule
        ? t('attPage.shiftScheduleHold')
        : t('attPage.shiftOvertimeHold');
      return (
        <div className="space-y-4 p-6" data-testid={holdTestId}>
          <Alert data-testid="shifts-gd2-hold-alert" className="border-xevn-border bg-xevn-surface">
            <AlertTitle className="flex flex-wrap items-center gap-2 text-[20px] font-bold text-xevn-text">
              <span>{t('attPage.featureInDev')}</span>
              <Badge
                variant="outline"
                className="font-semibold text-xevn-textSecondary border-xevn-border"
                data-testid="shifts-gd2-hold-badge"
              >
                {t('attPage.gd2HoldBadge')}
              </Badge>
              <span className="text-sm font-normal text-xevn-textSecondary">— {holdTitle}</span>
            </AlertTitle>
            <AlertDescription className="text-[15px] text-xevn-textSecondary">{holdBody}</AlertDescription>
          </Alert>
          <Button
            type="button"
            variant="outline"
            className="border-xevn-border text-xevn-text hover:bg-xevn-primary/5 hover:text-xevn-primary"
            data-testid="shifts-hold-goto-list"
            onClick={() => setActiveShiftType('list')}
          >
            {t('attendance.shiftsMenu.list')}
          </Button>
        </div>
      );
    }
    const shiftTotal = filteredShiftsData.length;
    return (
      <div className="space-y-4 p-6" data-testid="att-shifts-precision">
        {/* Header — S35 */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-xevn-text">{t('attPage.shiftsTitle')}</h2>
          <div className="flex items-center gap-2">
            {selectedShifts.length > 0 && (
              <>
                <span className="text-sm text-xevn-textSecondary" data-testid="shifts-bulk-count">
                  {t('attPage.shiftsSelectedCount', { count: selectedShifts.length })}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-xevn-border"
                  onClick={() => setSelectedShifts([])}
                >
                  {t('attPage.shiftsClearSelection')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  data-testid="shifts-bulk-delete"
                  onClick={() => setBulkDeleteShiftsDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  {t('attPage.shiftsBulkDelete', { count: selectedShifts.length })}
                </Button>
              </>
            )}
            <Button
              onClick={openAddShiftModal}
              className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
              data-testid="att-shifts-add"
            >
              <Plus className="w-4 h-4" />
              {t('attPage.add')}
            </Button>
            <Button variant="outline" size="icon" className="border-xevn-primary text-xevn-primary">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p
          className="text-xs text-xevn-textSecondary leading-relaxed px-1"
          data-testid="att-01-honesty"
        >
          {att01HonestyBannerText()}
        </p>

        {/* Filters */}
        <Card className="p-4 rounded-card border-xevn-border bg-xevn-surface">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted" />
              <Input
                placeholder={t('attPage.search')}
                value={shiftsSearchQuery}
                onChange={(e) => setShiftsSearchQuery(e.target.value)}
                className="pl-10 text-[15px] text-xevn-text"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-2 text-sm text-xevn-textSecondary">
                <span>{t('attPage.statusLabel')}:</span>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[100px] border-0 bg-transparent font-medium text-xevn-text">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('attPage.all')}</SelectItem>
                    <SelectItem value="active">{t('attPage.inUse')}</SelectItem>
                    <SelectItem value="inactive">{t('attPage.stopped')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select defaultValue="hanoi">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('attPage.selectOffice')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hanoi">{t('attPage.officeHanoi', 'Văn phòng Hà Nội')}</SelectItem>
                  <SelectItem value="hcm">{t('attPage.officeHCM', 'Văn phòng TP.HCM')}</SelectItem>
                  <SelectItem value="all">{t('attPage.allOffices')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4 text-xevn-textSecondary" />
              </Button>
              <Button variant="ghost" size="icon">
                <Filter className="w-4 h-4 text-xevn-textSecondary" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4 text-xevn-textSecondary" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Table — S35 */}
        <Card className="rounded-card border-xevn-border bg-xevn-surface">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="shifts-table">
              <thead>
                <tr className="border-b border-xevn-border bg-xevn-background">
                  <th className="p-3 text-left w-10">
                    <Checkbox
                      checked={allFilteredShiftsSelected}
                      onCheckedChange={toggleSelectAllShifts}
                      aria-label={t('attPage.shiftsSelectedCount', { count: filteredShiftIds.length })}
                      disabled={filteredShiftIds.length === 0}
                    />
                  </th>
                  <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.shiftCode')}</th>
                  <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.shiftName')}</th>
                  <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.appliedUnit')}</th>
                  <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('attPage.startTime')}</th>
                  <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('attPage.endTime')}</th>
                  <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('attPage.coefficient')}</th>
                  <th className="p-3 text-center font-semibold text-sm text-xevn-textSecondary">{t('attPage.workHours')}</th>
                  <th className="p-3 text-left font-semibold text-sm text-xevn-textSecondary">{t('attPage.statusLabel')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredShiftsData.map((shift) => (
                  <tr 
                    key={shift.id} 
                    className={cn(
                      "border-b border-xevn-border hover:bg-xevn-background/80 transition-colors group",
                      selectedShifts.includes(shift.id) && "bg-xevn-primary/5"
                    )}
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={selectedShifts.includes(shift.id)}
                        onCheckedChange={() => toggleSelectShift(shift.id)}
                        aria-label={shift.code}
                      />
                    </td>
                    <td className="p-3 text-sm font-medium text-xevn-text">{shift.code}</td>
                    <td className="p-3 text-sm text-xevn-text">{shift.name}</td>
                    <td className="p-3 text-sm text-xevn-textSecondary">{shift.unit}</td>
                    <td className="p-3 text-sm text-center text-xevn-text">{shift.startTime}</td>
                    <td className="p-3 text-sm text-center text-xevn-text">{shift.endTime}</td>
                    <td className="p-3 text-sm text-center text-xevn-text">{shift.coefficient}</td>
                    <td className="p-3 text-sm text-center text-xevn-text">{shift.hours}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "flex items-center gap-1.5 text-sm",
                          shift.status === 'active' ? "text-green-700" : "text-xevn-textSecondary"
                        )}>
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            shift.status === 'active' ? "bg-green-500" : "bg-xevn-textMuted"
                          )} />
                          {shift.statusLabelVi || (shift.status === 'active' ? t('attPage.inUse') : t('attPage.stopped'))}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditShiftModal(shift)}>
                            <Pencil className="w-4 h-4 text-xevn-textSecondary" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-xevn-textMuted disabled:opacity-60"
                            disabled
                            title={t('attPage.shiftCopyHold', 'Sao chép ca — chưa có API (stub)')}
                            aria-label={t('attPage.shiftCopyHold', 'Sao chép ca — chưa có API (stub)')}
                            data-testid="att-shift-copy-stub"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShiftPendingDelete({ id: shift.id, name: shift.name })}
                          >
                            <Trash2 className="w-4 h-4 text-xevn-textSecondary" />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-xevn-border">
            <div className="text-sm text-xevn-textSecondary">
              {t('attPage.total')}: <span className="font-medium text-xevn-text">{shiftTotal} {t('attPage.records', 'bản ghi')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-xevn-textSecondary">
                <span>{t('attPage.recordsPerPage')}</span>
                <Select defaultValue="50">
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-xevn-textSecondary">
                {t('attPage.fromTo', {
                  from: shiftTotal === 0 ? 0 : 1,
                  to: shiftTotal,
                })}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // renderRequestsContent removed - all leave request types now use LeaveTab with real data

  // Render main content based on active tab
  const renderMainContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'attendance':
        return renderAttendanceContent();
      case 'shifts':
        return renderShiftsContent();
      case 'requests':
        if (activeRequestType === 'overtime') return <OvertimeRequestTab />;
        if (activeRequestType === 'business-trip') return <BusinessTripRequestTab />;
        if (activeRequestType === 'late-early') return <LateEarlyRequestTab />;
        if (activeRequestType === 'update-attendance') return <AttendanceUpdateRequestTab />;
        if (activeRequestType === 'change-shift') return <ShiftChangeRequestTab />;
        // leave-request LIVE LeaveTab; S58–S60 leave-summary / compensatory / leave-plan = ALIAS + honesty chrome
        const leaveAliasTypes = ['leave-summary', 'compensatory-summary', 'leave-plan'] as const;
        const isLeaveAlias = (leaveAliasTypes as readonly string[]).includes(activeRequestType);
        if (isLeaveAlias) {
          const aliasLabel =
            requestMenuItems.find((item) => item.id === activeRequestType)?.label ?? activeRequestType;
          return (
            <div className="p-6 space-y-4" data-testid={`att-leave-alias-${activeRequestType}`}>
              <Alert className="border-xevn-border bg-xevn-surface" data-testid="att-leave-alias-honesty">
                <AlertTitle className="text-[20px] font-bold text-xevn-text flex flex-wrap items-center gap-2">
                  <span>{aliasLabel}</span>
                  <Badge variant="outline" className="border-xevn-border text-xevn-textSecondary text-[10px] font-semibold">
                    {t('attPage.aliasBadge', 'ALIAS')}
                  </Badge>
                  {activeRequestType === 'leave-plan' ? (
                    <Badge variant="outline" className="border-xevn-border text-xevn-textSecondary text-[10px] font-semibold">
                      {t('attPage.gd2HoldBadge')}
                    </Badge>
                  ) : null}
                </AlertTitle>
                <AlertDescription className="text-[15px] text-xevn-textSecondary">
                  {t(
                    'attPage.leaveAliasHonesty',
                    'Màn này dùng cùng danh sách đơn nghỉ (LeaveTab) — chưa phải báo cáo tổng hợp / kế hoạch riêng.',
                  )}
                </AlertDescription>
              </Alert>
              <LeaveTab />
            </div>
          );
        }
        return (
          <div className="p-6">
            <LeaveTab />
          </div>
        );
      case 'leave':
        return (
          <div className="p-6">
            <LeaveTab />
          </div>
        );
      case 'settings':
        return (
          <div className="flex min-h-[calc(100vh-180px)]" data-testid="att-settings-shell-precision">
            {/* Left Sidebar */}
            <div className="w-52 border-r border-xevn-border bg-xevn-background p-2">
              <nav className="space-y-1">
                {sidebarMenuItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSidebarItem(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                      activeSidebarItem === item.id
                        ? "bg-xevn-primary text-white"
                        : "text-xevn-textSecondary hover:bg-xevn-primary/10 hover:text-xevn-text"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-auto">
              {renderSettingsContent()}
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            {lazyBlock(<AttendanceReportsTab />)}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 text-xevn-textSecondary p-6" data-testid="att-tab-stub-hold">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-xevn-textMuted" aria-hidden />
              <p className="text-[20px] font-bold text-xevn-text">{topTabs.find(tab => tab.id === activeTab)?.label}</p>
              <p className="text-sm text-xevn-textSecondary">{t('attPage.featureInDev')}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-0 animate-fade-in -mt-3 -mx-3 md:-mt-6 md:-mx-6">
      <h1 className="sr-only">Chấm công (Attendance)</h1>
      {/* Top Navigation Tabs - Pill Style */}
      <div className="bg-background border-b px-2 md:px-6 py-2 md:py-3">
        <div className="mobile-scroll-tabs">
          {topTabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            
            const tabButtonClass = cn(
              "px-2.5 md:px-3 py-2 text-xs md:text-sm font-medium transition-all rounded-lg flex items-center gap-1 md:gap-2 whitespace-nowrap group touch-target",
              isActive
                ? 'bg-xevn-primary text-white shadow-md'
                : 'text-xevn-textSecondary hover:bg-xevn-background',
            );

            const iconBlock = (
              <div className={cn(
                'w-5 h-5 md:w-5 md:h-5 rounded flex items-center justify-center flex-shrink-0',
                isActive ? 'bg-white/20' : tab.color
              )}>
                <TabIcon className="w-3 h-3 text-white" />
              </div>
            );
            
            // Attendance: primary click → Clock-In wizard (≤1 click); chevron → sheets/records/…
            if (tab.id === 'attendance') {
              const clockInActive =
                activeTab === 'attendance' && isClockInAttendanceType(activeAttendanceType);
              return (
                <div key={tab.id} className="flex items-stretch">
                  <button
                    type="button"
                    data-testid="attendance-tab-clock-in"
                    onClick={() => openClockInWizard(clockInMethod)}
                    className={cn(tabButtonClass, 'rounded-r-none')}
                  >
                    {iconBlock}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={t('attendance.attendanceMenu.more', 'Thêm mục chấm công')}
                        data-testid="attendance-tab-menu"
                        className={cn(
                          tabButtonClass,
                          'rounded-l-none border-l border-white/20 px-1.5 md:px-2',
                          !isActive && 'border-l-border',
                        )}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-popover">
                      {attendanceMenuItems.map((item) => {
                        const itemActive =
                          activeTab === 'attendance' &&
                          (item.id === CLOCK_IN_ATTENDANCE_TYPE
                            ? clockInActive
                            : activeAttendanceType === item.id);
                        return (
                          <DropdownMenuItem
                            key={item.id}
                            onClick={() => {
                              if (item.id === CLOCK_IN_ATTENDANCE_TYPE) {
                                openClockInWizard(clockInMethod);
                                return;
                              }
                              setActiveTab('attendance');
                              setActiveAttendanceType(item.id);
                              if (item.id === 'weekly') setAttendanceViewMode('weekly');
                              if (item.id === 'sheets') setAttendanceViewMode('list');
                              if (item.id === 'records' || item.id === 'summary') {
                                setAttendanceViewMode('data');
                              }
                            }}
                            className={cn(
                              'flex items-center justify-between cursor-pointer',
                              itemActive && 'text-xevn-primary',
                            )}
                          >
                            {item.label}
                            {itemActive && <Check className="w-4 h-4 text-xevn-primary" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            }
            
            // Shifts dropdown
            if (tab.id === 'shifts') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button className={tabButtonClass}>
                      {iconBlock}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3 h-3 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 bg-popover">
                    {shiftsMenuItems.map((item) => {
                      const holdHint =
                        'holdHintKey' in item && item.holdHintKey
                          ? t(item.holdHintKey)
                          : undefined;
                      return (
                        <DropdownMenuItem
                          key={item.id}
                          title={holdHint}
                          data-testid={`shifts-menu-${item.id}`}
                          data-gd2-hold={item.gd2Hold ? 'true' : 'false'}
                          onClick={() => {
                            setActiveTab('shifts');
                            setActiveShiftType(item.id);
                          }}
                          className={cn(
                            'flex items-center justify-between gap-2 cursor-pointer text-xevn-text',
                            activeShiftType === item.id &&
                              activeTab === 'shifts' &&
                              'text-xevn-primary font-medium',
                          )}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{item.label}</span>
                            {item.gd2Hold && (
                              <Badge
                                variant="outline"
                                className="shrink-0 px-1.5 py-0 text-[10px] font-semibold text-xevn-textSecondary border-xevn-border"
                                data-testid={`shifts-menu-${item.id}-gd2`}
                              >
                                {t('attPage.gd2HoldBadge')}
                              </Badge>
                            )}
                          </span>
                          {activeShiftType === item.id && activeTab === 'shifts' && (
                            <Check className="w-4 h-4 text-xevn-primary shrink-0" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Requests dropdown
            if (tab.id === 'requests') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button className={tabButtonClass}>
                      {iconBlock}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3 h-3 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-popover">
                    {requestMenuItems.map((item) => {
                      const isAlias =
                        item.id === 'leave-summary' ||
                        item.id === 'compensatory-summary' ||
                        item.id === 'leave-plan';
                      return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          setActiveTab('requests');
                          setActiveRequestType(item.id);
                        }}
                        data-testid={`requests-menu-${item.id}`}
                        data-alias={isAlias ? 'true' : 'false'}
                        className={cn(
                          "flex items-center justify-between gap-2 cursor-pointer text-xevn-text",
                          activeRequestType === item.id && activeTab === 'requests' && "text-xevn-primary font-medium"
                        )}
                      >
                        <span className="flex items-center gap-2 min-w-0 truncate">
                          <span className="truncate">{item.label}</span>
                          {isAlias ? (
                            <Badge
                              variant="outline"
                              className="shrink-0 px-1.5 py-0 text-[10px] font-semibold text-xevn-textSecondary border-xevn-border"
                            >
                              {item.id === 'leave-plan'
                                ? t('attPage.gd2HoldBadge')
                                : t('attPage.aliasBadge', 'ALIAS')}
                            </Badge>
                          ) : null}
                        </span>
                        {activeRequestType === item.id && activeTab === 'requests' && (
                          <Check className="w-4 h-4 text-xevn-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Regular tabs without dropdown
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={tabButtonClass}
              >
                {iconBlock}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {renderMainContent()}

      {/* Shift Modal — S36 · W4 dialog chrome + compact fields (legacy testid kept) */}
      <Dialog open={shiftModalOpen} onOpenChange={setShiftModalOpen}>
        <DialogContent className="max-w-2xl" data-testid="att-shift-form-dialog">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">
              {editingShift?.id ? t('attPage.editShift') : t('attPage.addShift')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Row 1: Code & Name */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-4">
                <Label htmlFor="shift-code" className="text-xevn-text">{t('attPage.shiftCodeLabel')} <span className="text-destructive">*</span></Label>
                <Input 
                  id="shift-code" 
                  placeholder="VD: HC1, CA_SANG..."
                  value={editingShift?.code || ''}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, code: e.target.value} : null)}
                  maxLength={20}
                  className="xevn-field-code text-xevn-text"
                />
              </div>
              <div className="space-y-2 sm:col-span-8">
                <Label htmlFor="shift-name" className="text-xevn-text">{t('attPage.shiftNameLabel')} <span className="text-destructive">*</span></Label>
                <Input 
                  id="shift-name" 
                  placeholder="VD: Ca hành chính 1..."
                  value={editingShift?.name || ''}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, name: e.target.value} : null)}
                  maxLength={100}
                  className="xevn-field-name text-xevn-text"
                />
              </div>
            </div>

            {/* Row 2: Unit */}
            <div className="space-y-2">
              <Label htmlFor="shift-unit" className="text-xevn-text">{t('attPage.appliedUnitLabel')}</Label>
              <Select 
                value={editingShift?.unit || ''} 
                onValueChange={(value) => setEditingShift(prev => prev ? {...prev, unit: value} : null)}
              >
                <SelectTrigger className="xevn-field-select-md">
                  <SelectValue placeholder={t('attPage.selectUnit')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Công ty Cổ phần ABC">Công ty Cổ phần ABC</SelectItem>
                  <SelectItem value="Văn phòng Hà Nội">Văn phòng Hà Nội</SelectItem>
                  <SelectItem value="Chi nhánh TP.HCM">Chi nhánh TP.HCM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 3: Time */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-4">
                <Label htmlFor="shift-start" className="text-xevn-text">{t('attPage.startTime')}</Label>
                <Input 
                  id="shift-start" 
                  type="time"
                  value={editingShift?.startTime || '08:00'}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, startTime: e.target.value} : null)}
                  className="xevn-field-time text-xevn-text"
                />
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label htmlFor="shift-end" className="text-xevn-text">{t('attPage.endTime')}</Label>
                <Input 
                  id="shift-end" 
                  type="time"
                  value={editingShift?.endTime || '17:30'}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, endTime: e.target.value} : null)}
                  className="xevn-field-time text-xevn-text"
                />
              </div>
            </div>

            {/* Row 4: Coefficient & Hours */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-4">
                <Label htmlFor="shift-coefficient" className="text-xevn-text">{t('attPage.coefficientLabel')}</Label>
                <Input 
                  id="shift-coefficient" 
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editingShift?.coefficient || 1}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, coefficient: parseFloat(e.target.value) || 1} : null)}
                  className="xevn-field-num text-xevn-text"
                />
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label htmlFor="shift-hours" className="text-xevn-text">{t('attPage.workHoursLabel')}</Label>
                <Input 
                  id="shift-hours" 
                  type="number"
                  min="0"
                  max="24"
                  value={editingShift?.hours || 8}
                  onChange={(e) => setEditingShift(prev => prev ? {...prev, hours: parseInt(e.target.value) || 8} : null)}
                  className="xevn-field-num text-xevn-text"
                />
              </div>
            </div>

            {/* Row 5: Status */}
            <div className="flex items-center justify-between p-4 border border-xevn-border rounded-card">
              <div className="space-y-0.5">
                <Label htmlFor="shift-status" className="text-xevn-text">{t('attPage.activeStatus')}</Label>
                <p className="text-sm text-xevn-textSecondary">
                  {t('attPage.activeStatusDesc')}
                </p>
              </div>
              <Switch 
                id="shift-status"
                checked={editingShift?.status === 'active'}
                onCheckedChange={(checked) => setEditingShift(prev => prev ? {...prev, status: checked ? 'active' : 'inactive'} : null)}
              />
            </div>

            {/* Additional settings */}
            <div className="space-y-3 pt-2 border-t border-xevn-border">
              <Label className="text-sm font-semibold text-xevn-text">{t('attPage.advancedSettings')}</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Checkbox id="allow-late" defaultChecked />
                  <label htmlFor="allow-late" className="text-sm text-xevn-text">{t('attPage.allowLate')}</label>
                  <Input type="number" className="w-20" defaultValue="15" min="0" max="60" />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="allow-early" defaultChecked />
                  <label htmlFor="allow-early" className="text-sm text-xevn-text">{t('attPage.allowEarly')}</label>
                  <Input type="number" className="w-20" defaultValue="15" min="0" max="60" />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="require-break" />
                  <label htmlFor="require-break" className="text-sm text-xevn-text">{t('attPage.requireBreak')}</label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-xevn-border" onClick={() => setShiftModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleSaveShift} className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white">
              {editingShift?.id ? t('common.update', 'Cập nhật') : t('common.addNew', 'Thêm mới')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Modal (legacy shell — S27 companion; LIVE edit in AttendanceRecordsTable) */}
      <Dialog open={attendanceModalOpen} onOpenChange={setAttendanceModalOpen}>
        <DialogContent className="sm:max-w-[480px]" data-testid="att-page-attendance-edit-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">{t('attPage.editAttendance')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name - readonly */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-xevn-textSecondary">{t('attPage.fullNameCol')}</Label>
              <Input 
                value={editingAttendance?.name || ''} 
                readOnly 
                className="col-span-2 xevn-field-name bg-xevn-background text-xevn-text"
              />
            </div>

            {/* Unit - readonly */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-xevn-textSecondary">{t('attPage.unitCol')}</Label>
              <Input 
                value={editingAttendance?.unit || ''} 
                readOnly 
                className="col-span-2 xevn-field-line bg-xevn-background text-xevn-text"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-xevn-textSecondary">{t('attPage.timeLabel')}</Label>
              <div className="col-span-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <Input 
                    type="text"
                    value={editingAttendance?.date || ''} 
                    onChange={(e) => setEditingAttendance(prev => prev ? {...prev, date: e.target.value} : null)}
                    placeholder="DD/MM/YYYY"
                    className="xevn-field-date pr-10 text-xevn-text"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted pointer-events-none" />
                </div>
                <div className="relative">
                  <Input 
                    type="time"
                    value={editingAttendance?.time || ''} 
                    onChange={(e) => setEditingAttendance(prev => prev ? {...prev, time: e.target.value} : null)}
                    className="xevn-field-time pr-10 text-xevn-text"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-xevn-border" onClick={() => setAttendanceModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleSaveAttendance} className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white">
              {t('attPage.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weekly Cell Detail Modal — S32 (save stays honesty toast — no invent API) */}
      <Dialog open={cellDetailModalOpen} onOpenChange={setCellDetailModalOpen}>
        <DialogContent className="sm:max-w-[420px]" data-testid="att-weekly-cell-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text" data-testid="att-weekly-cell-detail-title">{t('attPage.cellTitle', { date: `${selectedCellData?.date}/05` })}</DialogTitle>
            <p className="text-sm text-xevn-textSecondary">
              {t('attPage.shiftInfo')}
            </p>
          </DialogHeader>
          <Alert className="border-xevn-border" data-testid="att-weekly-cell-stub-honesty">
            <AlertTitle className="text-[15px] font-semibold text-xevn-text">
              {t('attPage.weeklyCellStubTitle', 'Chi tiết ô tuần — bản nháp UI')}
            </AlertTitle>
            <AlertDescription className="text-[15px] text-xevn-textSecondary">
              {t(
                'attPage.weeklyCellStubBody',
                'Lưu chỉ báo honesty — chưa có API ghi ô tuần. Không coi là LIVE.',
              )}
            </AlertDescription>
          </Alert>

          <div className="py-2">
            {/* Data Table */}
            <div className="border border-xevn-border rounded-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-xevn-border bg-xevn-background">
                    <th className="p-3 text-left text-sm font-semibold text-xevn-textSecondary">{t('attPage.info')}</th>
                    <th className="p-3 text-right text-sm font-semibold text-xevn-textSecondary">{t('attPage.value')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-xevn-border">
                    <td className="p-3 text-sm text-xevn-text">
                      <div className="flex items-center gap-2">
                        <ChevronDown className="w-4 h-4 text-xevn-textMuted" />
                        <span>{t('attPage.paidWorkdays')}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-right font-medium text-xevn-text">1.00</td>
                  </tr>
                  <tr className="border-b border-xevn-border">
                    <td className="p-3 text-sm pl-8 text-xevn-text">{t('attPage.clockIn')}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 border border-xevn-border rounded-md px-3 py-1.5 bg-xevn-surface">
                        <Input type="text" defaultValue="08:07" className="xevn-field-time text-sm border-0 p-0 h-auto focus-visible:ring-0 text-center text-xevn-text" placeholder="HH:MM" />
                        <Clock className="w-4 h-4 text-xevn-textMuted" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-xevn-border">
                    <td className="p-3 text-sm pl-8 text-xevn-text">{t('attPage.clockOut')}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 border border-xevn-border rounded-md px-3 py-1.5 bg-xevn-surface">
                        <Input type="text" defaultValue="17:30" className="xevn-field-time text-sm border-0 p-0 h-auto focus-visible:ring-0 text-center text-xevn-text" placeholder="HH:MM" />
                        <Clock className="w-4 h-4 text-xevn-textMuted" />
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-xevn-border">
                    <td className="p-3 text-sm text-xevn-text">{t('attPage.lateMinutes')}</td>
                    <td className="p-3 text-sm text-right font-medium text-xevn-text">2</td>
                  </tr>
                  <tr className="border-b border-xevn-border">
                    <td className="p-3 text-sm text-xevn-text">{t('attPage.earlyMinutes')}</td>
                    <td className="p-3 text-sm text-right font-medium text-xevn-text">0</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-sm text-xevn-text">{t('attPage.totalOvertimeHours')}</td>
                    <td className="p-3 text-sm text-right font-medium text-xevn-text">0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-xevn-border" onClick={() => setCellDetailModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleSaveCellDetail} className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white">
              {t('attPage.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Sheet Modal — S24 · W4 chrome + compact fields (legacy testid kept) */}
      <Dialog open={addSheetModalOpen} onOpenChange={setAddSheetModalOpen}>
        <DialogContent className="sm:max-w-[560px]" data-testid="att-add-sheet-dialog">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">{t('attPage.addSheet')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Đơn vị công tác */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-xevn-text">{t('attPage.sheetUnit')}</Label>
              <div className="col-span-2">
                <Select 
                  value={newSheetForm.unit} 
                  onValueChange={(v) => setNewSheetForm(prev => ({...prev, unit: v}))}
                >
                  <SelectTrigger className="xevn-field-select-md">
                    <SelectValue placeholder={t('attPage.selectDepartment', 'Chọn phòng ban')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vị trí công việc */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-xevn-text">{t('attPage.sheetPositions')}</Label>
              <div className="col-span-2">
                <Select 
                  value={newSheetForm.positions} 
                  onValueChange={(v) => setNewSheetForm(prev => ({...prev, positions: v}))}
                >
                  <SelectTrigger className="xevn-field-select-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('attPage.allPositions', 'Tất cả vị trí')}</SelectItem>
                    {[...new Set(employees.map(e => e.position).filter(Boolean))].map(pos => (
                      <SelectItem key={pos!} value={pos!}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tên bảng chấm công */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-xevn-text">{t('attPage.sheetNameLabel')}</Label>
              <div className="col-span-2">
                <Input 
                  value={newSheetForm.name}
                  onChange={(e) => setNewSheetForm(prev => ({...prev, name: e.target.value}))}
                  placeholder="Bảng chấm công từ ngày 01/01/2022 đến ngày 31/01/2022"
                  className="xevn-field-line text-xevn-text"
                />
              </div>
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-3 items-start gap-4">
              <Label className="text-sm pt-2 text-xevn-text">{t('attPage.timePeriod')}</Label>
              <div className="col-span-2 space-y-3">
                <Select 
                  value={newSheetForm.timePreset}
                  onValueChange={handleSheetTimePreset}
                >
                  <SelectTrigger className="xevn-field-select-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">{t('attPage.thisMonth')}</SelectItem>
                    <SelectItem value="last-month">{t('attPage.lastMonth')}</SelectItem>
                    <SelectItem value="custom">{t('attPage.custom')}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <ViDatePickerField
                      value={newSheetForm.startDate}
                      onValueChange={(v) =>
                        setNewSheetForm((prev) => ({
                          ...prev,
                          startDate: v,
                          timePreset: 'custom',
                        }))
                      }
                      calendarAriaLabel={t('attPage.startDate')}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <ViDatePickerField
                      value={newSheetForm.endDate}
                      onValueChange={(v) =>
                        setNewSheetForm((prev) => ({
                          ...prev,
                          endDate: v,
                          timePreset: 'custom',
                        }))
                      }
                      calendarAriaLabel={t('attPage.endDate')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hình thức chấm công */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm text-xevn-text">{t('attPage.attendanceMethod')}</Label>
              <div className="col-span-2">
                <Select 
                  value={newSheetForm.attendanceType}
                  onValueChange={(v) => setNewSheetForm(prev => ({...prev, attendanceType: v}))}
                >
                  <SelectTrigger className="xevn-field-select-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t('attPage.daily')}</SelectItem>
                    <SelectItem value="hourly">{t('attPage.hourly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Công chuẩn */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-sm"></Label>
              <div className="col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="standardType" 
                    value="fixed"
                    checked={newSheetForm.standardType === 'fixed'}
                    onChange={() => setNewSheetForm(prev => ({...prev, standardType: 'fixed'}))}
                    className="w-4 h-4 text-xevn-primary accent-xevn-primary"
                  />
                  <span className="text-sm text-xevn-text">{t('attPage.fixedStandardShort')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="standardType" 
                    value="monthly"
                    checked={newSheetForm.standardType === 'monthly'}
                    onChange={() => setNewSheetForm(prev => ({...prev, standardType: 'monthly'}))}
                    className="w-4 h-4 text-xevn-primary accent-xevn-primary"
                  />
                  <span className="text-sm text-xevn-text">{t('attPage.monthlyStandardShort')}</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-xevn-border" onClick={() => setAddSheetModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleAddSheet} className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white">
              {t('attPage.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sheet Confirmation Dialog — S25 */}
      <AlertDialog open={deleteSheetModalOpen} onOpenChange={setDeleteSheetModalOpen}>
        <AlertDialogContent data-testid="att-delete-sheet-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">{t('attPage.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-xevn-textSecondary">
              {t('attPage.deleteSheetConfirm', { name: sheetToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSheetModalOpen(false)}>
              {t('attPage.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSheet}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('attPage.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* UX-09 — Shifts bulk delete confirm — S37 */}
      <AlertDialog open={bulkDeleteShiftsDialogOpen} onOpenChange={setBulkDeleteShiftsDialogOpen}>
        <AlertDialogContent data-testid="att-shifts-bulk-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">{t('attPage.shiftsConfirmBulkDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('attPage.shiftsConfirmBulkDeleteDesc', { count: selectedShifts.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeletingShifts}>{t('attPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isBulkDeletingShifts || selectedShifts.length === 0}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmBulkDeleteShifts();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkDeletingShifts ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('attPage.shiftsBulkDelete', { count: selectedShifts.length })
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* UX-09 — Shifts single row delete confirm — S38 */}
      <AlertDialog
        open={shiftPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setShiftPendingDelete(null);
        }}
      >
        <AlertDialogContent data-testid="att-shift-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">{t('attPage.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('attPage.shiftsConfirmDeleteDesc', { name: shiftPendingDelete?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('attPage.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmSingleDeleteShift();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('attPage.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Request Modal — W3-ATT-C residual · W4 compact chrome (LIVE create = LeaveTab) */}
      <Dialog open={leaveRequestModalOpen} onOpenChange={setLeaveRequestModalOpen}>
        <DialogContent className="sm:max-w-[920px]" data-testid="att-page-leave-create-dialog-precision">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('attPage.addLeaveRequest')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Employee */}
            <div className="space-y-2">
              <Label htmlFor="employee" className="text-xevn-text">{t('attPage.submitter')} <span className="text-destructive">*</span></Label>
              <Select 
                value={leaveRequestForm.employee} 
                onValueChange={(value) => setLeaveRequestForm(prev => ({...prev, employee: value}))}
              >
                <SelectTrigger className="xevn-field-select-md">
                  <SelectValue placeholder={t('attPage.selectEmployee')} />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="tran-dang-trung">Trần Đăng Trung</SelectItem>
                  <SelectItem value="dang-thi-phuong-loan">Đặng Thị Phương Loan</SelectItem>
                  <SelectItem value="nguyen-hoang-son">Nguyễn Hoàng Sơn</SelectItem>
                  <SelectItem value="pham-quang-anh">Phạm Quang Anh</SelectItem>
                  <SelectItem value="pham-my-hanh">Phạm Mỹ Hạnh</SelectItem>
                  <SelectItem value="le-minh-nguyet">Lê Minh Nguyệt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="leaveType" className="text-xevn-text">{t('attPage.leaveType')} <span className="text-destructive">*</span></Label>
              <Select 
                value={leaveRequestForm.leaveType} 
                onValueChange={(value) => setLeaveRequestForm(prev => ({...prev, leaveType: value}))}
              >
                <SelectTrigger className="xevn-field-select-md">
                  <SelectValue placeholder={t('attPage.selectLeaveType')} />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="nghi-phep">{t('attPage.annualLeave')}</SelectItem>
                  <SelectItem value="nghi-khong-huong-luong">{t('attPage.unpaidLeave')}</SelectItem>
                  <SelectItem value="nghi-thai-san">{t('attPage.maternityLeave')}</SelectItem>
                  <SelectItem value="nghi-om">{t('attPage.sickLeave')}</SelectItem>
                  <SelectItem value="nghi-ket-hon">{t('attPage.weddingLeave')}</SelectItem>
                  <SelectItem value="nghi-con-ket-hon">{t('attPage.childWeddingLeave', 'Nghỉ con kết hôn')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-4">
                <Label className="text-xevn-text">{t('attPage.startDate')} <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "xevn-field-date justify-start text-left font-normal",
                        !leaveRequestForm.startDate && "text-xevn-textMuted"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatSafeCalendarDate(leaveRequestForm.startDate) ?? (
                        <span>{t('attPage.selectDay', 'Chọn ngày')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={leaveRequestForm.startDate}
                      onSelect={(date) => setLeaveRequestForm(prev => ({...prev, startDate: date}))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label className="text-xevn-text">{t('attPage.endDate')} <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "xevn-field-date justify-start text-left font-normal",
                        !leaveRequestForm.endDate && "text-xevn-textMuted"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatSafeCalendarDate(leaveRequestForm.endDate) ?? (
                        <span>{t('attPage.selectDay', 'Chọn ngày')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={leaveRequestForm.endDate}
                      onSelect={(date) => setLeaveRequestForm(prev => ({...prev, endDate: date}))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-xevn-text">{t('attPage.reason')}</Label>
              <Textarea 
                id="reason"
                placeholder={t('attPage.reasonPlaceholder', 'Nhập lý do xin nghỉ...')}
                value={leaveRequestForm.reason}
                onChange={(e) => setLeaveRequestForm(prev => ({...prev, reason: e.target.value}))}
                rows={3}
                maxLength={500}
                className="xevn-field-reason text-xevn-text"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveRequestModalOpen(false)}>
              {t('attPage.cancel')}
            </Button>
            <Button onClick={handleAddLeaveRequest} className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white">
              {t('attPage.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Request Detail/Edit Modal — W3-ATT-C · W4 chrome */}
      <Dialog open={leaveDetailModalOpen} onOpenChange={setLeaveDetailModalOpen}>
        <DialogContent className="max-w-2xl" data-testid="att-page-leave-detail-dialog-precision">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[20px] font-bold text-xevn-text">
                {t('attPage.leaveDetailTitle')}
              </DialogTitle>
              {selectedLeaveRequest?.status === 'pending' && !isEditingLeave && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setIsEditingLeave(true)}
                >
                  <Pencil className="w-4 h-4" />
                  {t('attPage.editInfo')}
                </Button>
              )}
            </div>
          </DialogHeader>
          
          {selectedLeaveRequest && (
            <div className="space-y-6 py-4">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 rounded-card border border-xevn-border bg-xevn-background">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-sm bg-xevn-primary/10 text-xevn-primary font-medium">
                    {selectedLeaveRequest.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-xevn-text">{selectedLeaveRequest.name}</h3>
                  <p className="text-sm text-xevn-textSecondary">{selectedLeaveRequest.position}</p>
                  <p className="text-sm text-xevn-textSecondary">{selectedLeaveRequest.unit}</p>
                </div>
                <div className="ml-auto">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    selectedLeaveRequest.status === 'approved' 
                      ? "bg-green-100 text-green-700" 
                      : selectedLeaveRequest.status === 'rejected'
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                  )}>
                    {selectedLeaveRequest.status === 'approved' ? t('attPage.approved') : selectedLeaveRequest.status === 'rejected' ? t('attPage.rejected') : t('attPage.pending')}
                  </span>
                </div>
              </div>

              {/* Detail Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xevn-textSecondary">{t('attPage.leaveType')}</Label>
                  {isEditingLeave ? (
                    <Select 
                      value={editLeaveForm.leaveType} 
                      onValueChange={(value) => setEditLeaveForm(prev => ({...prev, leaveType: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('attPage.selectLeaveType')} />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="Nghỉ phép">{t('attPage.annualLeave')}</SelectItem>
                        <SelectItem value="Nghỉ không hưởng lương">{t('attPage.unpaidLeave')}</SelectItem>
                        <SelectItem value="Nghỉ thai sản">{t('attPage.maternityLeave')}</SelectItem>
                        <SelectItem value="Nghỉ ốm">{t('attPage.sickLeave')}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium">{selectedLeaveRequest.leaveType}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xevn-textSecondary">{t('attPage.leaveDaysCol')}</Label>
                  {isEditingLeave ? (
                    <Input 
                      type="number" 
                      step="0.5"
                      min="0.5"
                      value={editLeaveForm.days}
                      onChange={(e) => setEditLeaveForm(prev => ({...prev, days: parseFloat(e.target.value)}))}
                    />
                  ) : (
                    <p className="font-medium text-xevn-text">{selectedLeaveRequest.days} {t('attPage.days')}</p>
                  )}
                </div>
              </div>

              {isEditingLeave && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xevn-text">{t('attPage.startDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editLeaveForm.startDate && "text-xevn-textMuted"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatSafeCalendarDate(editLeaveForm.startDate) ?? (
                            <span>{t('attPage.selectDay', 'Chọn ngày')}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={editLeaveForm.startDate}
                          onSelect={(date) => setEditLeaveForm(prev => ({...prev, startDate: date}))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xevn-text">{t('attPage.endDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editLeaveForm.endDate && "text-xevn-textMuted"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatSafeCalendarDate(editLeaveForm.endDate) ?? (
                            <span>{t('attPage.selectDay', 'Chọn ngày')}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={editLeaveForm.endDate}
                          onSelect={(date) => setEditLeaveForm(prev => ({...prev, endDate: date}))}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xevn-textSecondary">{t('attPage.approver')}</Label>
                <p className="font-medium text-xevn-text">{selectedLeaveRequest.approver}</p>
              </div>

              {isEditingLeave && (
                <div className="space-y-2">
                  <Label className="text-xevn-text">{t('attPage.editReason', 'Lý do chỉnh sửa')}</Label>
                  <Textarea 
                    placeholder={t('attPage.editReasonPlaceholder', 'Nhập lý do chỉnh sửa...')}
                    value={editLeaveForm.reason}
                    onChange={(e) => setEditLeaveForm(prev => ({...prev, reason: e.target.value}))}
                    rows={3}
                    maxLength={500}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isEditingLeave ? (
              <>
                <Button variant="outline" onClick={() => setIsEditingLeave(false)}>
                  {t('attPage.cancelEdit', 'Hủy chỉnh sửa')}
                </Button>
                <Button onClick={handleSaveLeaveEdit} className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white">
                  {t('attPage.saveEdit')}
                </Button>
              </>
            ) : (
              <>
                {selectedLeaveRequest?.status === 'pending' && (
                  <div className="flex gap-2 mr-auto">
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => openApprovalModal('reject')}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('attPage.rejected')}
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => openApprovalModal('approve')}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t('attPage.approve', 'Duyệt đơn')}
                    </Button>
                  </div>
                )}
                <Button variant="outline" onClick={() => setLeaveDetailModalOpen(false)}>
                  {t('common.close', 'Đóng')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Modal — W3-ATT-C */}
      <AlertDialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">
              {approvalAction === 'approve' ? t('attPage.confirmApprove', 'Xác nhận duyệt đơn') : t('attPage.confirmReject', 'Xác nhận từ chối đơn')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-xevn-textSecondary">
              {approvalAction === 'approve' 
                ? t('attPage.confirmApproveDesc', { name: selectedLeaveRequest?.name, defaultValue: `Bạn có chắc chắn muốn duyệt đơn xin nghỉ của "${selectedLeaveRequest?.name}"?` })
                : t('attPage.confirmRejectDesc', { name: selectedLeaveRequest?.name, defaultValue: `Bạn có chắc chắn muốn từ chối đơn xin nghỉ của "${selectedLeaveRequest?.name}"?` })
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="approval-note">{t('attPage.approvalNote', 'Ghi chú')} {approvalAction === 'reject' && <span className="text-red-500">*</span>}</Label>
            <Textarea 
              id="approval-note"
              placeholder={approvalAction === 'approve' ? t('attPage.approveNotePlaceholder', 'Nhập ghi chú (không bắt buộc)...') : t('attPage.rejectNotePlaceholder', 'Nhập lý do từ chối...')}
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              className="mt-2"
              rows={3}
              maxLength={500}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApprovalModalOpen(false)}>
              {t('attPage.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApprovalSubmit}
              className={cn(
                approvalAction === 'approve' 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
              disabled={approvalAction === 'reject' && !approvalNote.trim()}
            >
              {approvalAction === 'approve' ? t('attPage.approve', 'Duyệt đơn') : t('attPage.rejected')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EmployeeImportDialog
        open={settingsEmployeeImportOpen}
        onOpenChange={setSettingsEmployeeImportOpen}
        onImportSuccess={handleSettingsEmployeeImportSuccess}
        spreadsheetScope={settingsEmployeeImportScope}
      />
    </div>
  );
}
