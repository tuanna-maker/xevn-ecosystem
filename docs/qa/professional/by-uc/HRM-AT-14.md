# UC — `HRM-AT-14` · Cấu hình quy tắc chấm công, cột bảng công & bảng kỳ

| Meta | Value |
|------|--------|
| **uc_id** | `HRM-AT-14` |
| **stt_phase1** | — (alias SRS · **MFD add** U87 2026-08-04; xem `_INVENTORY_PHASE1.md`) |
| **mod** | M05 |
| **name_vi** | Cấu hình quy tắc chấm công (Chung/Công chuẩn/Ứng dụng), GPS điểm làm việc, tùy chỉnh cột bảng công; bảng chấm công theo kỳ |
| **actors** | HCNS · Quản lý đơn vị · HR Admin |
| **surfaces** | hrm-embed / api |
| **srs_old** | `docs/hrm/SRS.md` UC-HRM-23 / **HRM-AT-14** · AC-ATT-SHEET-01..06 · BR-ATT-SHEET-01..07 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` **FR-HRM-AT-14** (bảng kỳ) · **SPEC_GAP** — quy tắc `attendance_rules` / cột catalog chưa có FR đủ 7 mục |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §12.1 / §14.4 (sheets ALIGNED) · rules/geofence **PENDING_SYNTH** |
| **api_contract** | **Sheets:** `GET/POST/PATCH/DELETE /api/hrm/attendance/attendance-sheets` (`HRM-AS-201/200`) · **Records (lưới):** `GET /api/hrm/attendance/records` · **Rules:** `GET/PATCH /api/hrm/attendance/rules` (ADR D2 · M1 CFG GWC — **supersedes** prior NO_API) · **Work-sites admin:** `GET/POST/PATCH/DELETE /api/hrm/attendance/work-sites` (ADR D3) · **Columns:** **NO_API** (still HARDCODED FE) |
| **author** | ba-process · PO-MFD-M1-ATT-AT14-BYUC-01 · DOC-DELTA `PO-MFD-M2-ATT-CFG-DOC-01` |
| **design_status** | DESIGNED |
| **execution** | CFG rules/GPS slice **GWC** (`po-mfd-m1-att-p0-cfg-qc-01.md`) — **not** full UC UAT |
| **code_readiness** | `PARTIAL` — **không** = UAT PASS |
| **code_note** | Sheets **LIKELY_IMPL**. Rules Chung/Công chuẩn + App GPS work-sites: Nest wire + browser PATCH/POST **200/201** on `dc930c5` (~~`cfgNotPersisted` / in-memory save~~ **SUPERSEDED**). Residual: columns HARDCODED; tablet/proxy/auto STUB; Face ID OUT GĐ1. ADR: `ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`. |
| **squad** | PO-MFD-M1-ATT (U87) |
| **uat_done** | false |
| **program_ref** | `docs/program/PO_MENU_FIDELITY_DEPTH_PROGRAM.md` · `docs/qa/evidence/po-mfd-m1-att-cfg-ref-01.md` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE. **CFG stub:** tab load 200 **không** đủ PASS (U87).

---

## 1. Mục tiêu UC (1 đoạn)

HCNS cấu hình **nguồn công chuẩn** và **hiển thị bảng công** cho Payroll/Mobile: quy tắc chung (ngày công, làm tròn, auto-checkout), công chuẩn tháng/giờ, thiết bị/ứng dụng (GPS, QR, FaceID), danh sách điểm GPS, catalog cột bảng công; đồng thời tạo/quản lý **header bảng chấm công theo kỳ** (AC-ATT-SHEET). Mọi thay đổi CFG **phải** persist qua API và còn sau F5; geofence check-in phải dùng cùng phạm vi công ty (slug parity). Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Bảng công theo kỳ | Tạo/sửa header kỳ; list→lưới; AC-ATT-SHEET | HCNS |
| CAP-02 | Quy tắc — Chung | Ngày công, làm tròn, multi check-in, notify | HCNS |
| CAP-03 | Quy tắc — Công chuẩn | `standard_type`, ngày công/tháng, giờ/ngày | HCNS |
| CAP-04 | Quy tắc — Ứng dụng & GPS | Bật GPS; CRUD điểm làm việc (radius) | HCNS |
| CAP-05 | Tùy chỉnh cột bảng công | Thứ tự/hiển thị cột payroll | HCNS |
| CAP-06 | Fail-deep & SPEC_GAP | Stub tablet/proxy/auto; Save giả | Hệ thống |
| CAP-07 | Phạm vi & RBAC | Holding vs member; NV không cấu hình CFG | RBAC |

**Đếm nghiệp vụ:** 7

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-SHEET-OPEN | Mở tab Bảng công / list | Chấm công→Bảng công | N |
| CAP-01 | FN-SHEET-ACT | Tạo/sửa/xóa bảng kỳ | POST/PATCH/DELETE `attendance-sheets` | Y |
| CAP-01 | FN-SHEET-GRID | Mở bảng → lưới tuần/records | GET `records` + sheet context | N |
| CAP-02 | FN-RULE-GEN-OPEN | Mở Cài đặt→Quy tắc→**Chung** | Rules subtabs | N |
| CAP-02 | FN-RULE-GEN-SAVE | Lưu quy tắc chung | Target PATCH rules API | Y |
| CAP-03 | FN-RULE-STD-SAVE | Lưu công chuẩn | Target PATCH rules API | Y |
| CAP-04 | FN-RULE-APP-SAVE | Lưu toggles GPS/WiFi/QR/FaceID | Target PATCH rules API | Y |
| CAP-04 | FN-GPS-CRUD | Thêm/sửa/xóa điểm GPS | Hook `addGPSLocation` → API work-sites/rules | Y |
| CAP-05 | FN-COL-LIST | Xem catalog cột | Rules→Tùy chỉnh | N |
| CAP-05 | FN-COL-MUTATE | Thêm/sắp xếp cột | Target column config API | Y |
| CAP-06 | FN-STUB-HONESTY | Subtabs tablet/proxy/auto | `featureInDev` banner | N |
| CAP-06 | FN-VAL | Validate field CFG | DTO/rules service | Y |
| CAP-07 | FN-SCOPE | Sai `company_id` / header | x-company-id slug | Y |
| CAP-07 | FN-RBAC | Role không HCNS | JWT role | Y |

**Đếm chức năng:** 14

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-SHEET-OPEN | 1 | 0 | 0 | 0 | 1 | **2** |
| FN-SHEET-ACT | 2 | 2 | 1 | 0 | 1 | **6** |
| FN-SHEET-GRID | 1 | 1 | 0 | 0 | 1 | **3** |
| FN-RULE-GEN-OPEN | 1 | 0 | 0 | 0 | 1 | **2** |
| FN-RULE-GEN-SAVE | 1 | 2 | 1 | 0 | 1 | **5** |
| FN-RULE-STD-SAVE | 1 | 2 | 1 | 0 | 0 | **4** |
| FN-RULE-APP-SAVE | 1 | 1 | 0 | 0 | 0 | **2** |
| FN-GPS-CRUD | 1 | 2 | 1 | 0 | 1 | **5** |
| FN-COL-LIST | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-COL-MUTATE | 0 | 1 | 0 | 0 | 1 | **2** |
| FN-STUB-HONESTY | 0 | 1 | 0 | 0 | 0 | **1** |
| FN-VAL | 0 | 2 | 0 | 0 | 0 | **2** |
| FN-SCOPE | 0 | 0 | 0 | 2 | 0 | **2** |
| FN-RBAC | 0 | 0 | 0 | 2 | 0 | **2** |
| **Tổng (fn plan)** | 10 | 14 | 4 | 4 | 7 | **39** |
| **Tổng (bảng §5)** | | | | | | **37** |

> Σ bàn giao Synth = **37** dòng TC §5. FN plan 39 — gộp 2 UX sheet storm vào AC-ATT-SHEET-04/06 (trùng trace).

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-HRM-AT-14-SHEET-OPEN-HP-001 | CAP-01 | FN-SHEET-OPEN | HP | P0 | HCNS / ceo@xe.vn · main | Login · stack L0 | 1. CC→HRM→Chấm công→**Bảng công** | List/tab sẵn sàng · không ERROR banner | UI | AC-ATT-SHEET-03 · J-HRM-06b |
| TC-HRM-AT-14-SHEET-OPEN-UX-001 | CAP-01 | FN-SHEET-OPEN | UX | P1 | HCNS | — | 1. Vào tab khi API sheets down | Banner lỗi · không fake rows | UI | health |
| TC-HRM-AT-14-SHEET-ACT-HP-001 | CAP-01 | FN-SHEET-ACT | HP | P0 | HCNS / ceo@xe.vn | U65 no seed | 1. **Thêm** bảng kỳ **01/07/2026–31/07/2026** · Công chuẩn 2. Lưu 3. Network 2xx 4. F5 | POST **201** `HRM-AS-201` · row list **trước F5** · F5 còn | UI/API | AC-ATT-SHEET-01 · BR-ATT-SHEET-01 |
| TC-HRM-AT-14-SHEET-ACT-HP-002 | CAP-01 | FN-SHEET-ACT | HP | P1 | member CEO | Scope CT thành viên | 1. Tạo bảng trên CT member | `company_id` persist đúng token | UI/API | scope |
| TC-HRM-AT-14-SHEET-ACT-FD-001 | CAP-01 | FN-SHEET-ACT | FD | P0 | HCNS | — | 1. Lưu thiếu ngày / start>end | 4xx · không tạo header | UI/API | BR-ATT-SHEET-04 |
| TC-HRM-AT-14-SHEET-ACT-FD-002 | CAP-01 | FN-SHEET-ACT | FD | P0 | HCNS | Trùng kỳ+đơn vị nếu BE cấm | 1. Tạo trùng kỳ | 409/400 message ổn định | API | BR-ATT-SHEET-04 · SPEC_GAP unique |
| TC-HRM-AT-14-SHEET-ACT-BD-001 | CAP-01 | FN-SHEET-ACT | BD | P1 | HCNS | — | 1. Kỳ 1 ngày · kỳ 31 ngày | Accept/reject đúng DTO `@IsDateString` | API | DTO |
| TC-HRM-AT-14-SHEET-ACT-UX-001 | CAP-01 | FN-SHEET-ACT | UX | P1 | HCNS | — | 1. Double-click Lưu tạo bảng | ≤1 POST hoặc disable nút | UI | UX |
| TC-HRM-AT-14-SHEET-GRID-HP-001 | CAP-01 | FN-SHEET-GRID | HP | P0 | HCNS | Sau ACT-HP-001 | 1. Mở row bảng vừa tạo | Lưới empty **hoặc** data · không storm spinner | UI | AC-ATT-SHEET-02 · BR-ATT-SHEET-06 |
| TC-HRM-AT-14-SHEET-GRID-FD-001 | CAP-01 | FN-SHEET-GRID | FD | P0 | HCNS | API records 4xx | 1. Mở lưới | ERROR banner · **không** che empty giả | UI | AC-ATT-SHEET-03 |
| TC-HRM-AT-14-SHEET-GRID-UX-001 | CAP-01 | FN-SHEET-GRID | UX | P0 | HCNS | Tab list mở 10s | 1. Quan sát Network | GET sheets ≤**2**/10s · records ≤**2**/10s | UI | AC-ATT-SHEET-04/06 · BR-ATT-SHEET-07 |
| TC-HRM-AT-14-RULE-GEN-OPEN-HP-001 | CAP-02 | FN-RULE-GEN-OPEN | HP | P0 | HCNS | — | 1. Cài đặt→Quy tắc chấm công→**Chung** | Form controls hiển thị | UI | U76 HDSD |
| TC-HRM-AT-14-RULE-GEN-OPEN-UX-001 | CAP-02 | FN-RULE-GEN-OPEN | UX | P1 | HCNS | AS-IS | 1. Quan sát nút Lưu | **FAIL design until API:** Save không persist (document AS-IS) | UI | matrix HARDCODED |
| TC-HRM-AT-14-RULE-GEN-SAVE-HP-001 | CAP-02 | FN-RULE-GEN-SAVE | HP | P0 | HCNS | **Target:** rules API shipped | 1. Đổi `round_in_minutes`=15 · `work_days` gồm T7 2. Lưu 3. F5 | PATCH/PUT 2xx · UI khớp · F5 còn · **không** reset default hook | UI/API | SPEC_GAP rules API |
| TC-HRM-AT-14-RULE-GEN-SAVE-FD-001 | CAP-02 | FN-RULE-GEN-SAVE | FD | P0 | HCNS | — | 1. `work_start_day`=32 hoặc start>end | 400 + FE giữ form | API | validation |
| TC-HRM-AT-14-RULE-GEN-SAVE-FD-002 | CAP-02 | FN-RULE-GEN-SAVE | FD | P0 | HCNS | AS-IS pre-API | 1. Lưu · F5 | **EXPECTED_FAIL persist** — toast success nhưng F5 về default 26/Mon–Fri | UI | P0-2 matrix |
| TC-HRM-AT-14-RULE-GEN-SAVE-BD-001 | CAP-02 | FN-RULE-GEN-SAVE | BD | P1 | HCNS | — | 1. `round_*` ∈ {0,5,10,15} biên | Accept enum | API | matrix §2.2 |
| TC-HRM-AT-14-RULE-GEN-SAVE-UX-001 | CAP-02 | FN-RULE-GEN-SAVE | UX | P1 | HCNS | — | 1. Bật auto_checkout · Lưu (target) | Persist boolean; policy duration = SPEC_GAP | UI | auto-checkout hours |
| TC-HRM-AT-14-RULE-STD-SAVE-HP-001 | CAP-03 | FN-RULE-STD-SAVE | HP | P0 | HCNS | Target API | 1. Công chuẩn→`standard_type`=monthly · `standard_days_per_month`=22 · `hours_per_day`=8 2. Lưu · F5 | Payroll consumer đọc được cùng giá trị | UI/API | CFG Payroll link |
| TC-HRM-AT-14-RULE-STD-SAVE-FD-001 | CAP-03 | FN-RULE-STD-SAVE | FD | P0 | HCNS | — | 1. `standard_days_per_month`=0 hoặc 32 | 400 | API | validation |
| TC-HRM-AT-14-RULE-STD-SAVE-FD-002 | CAP-03 | FN-RULE-STD-SAVE | FD | P0 | HCNS | — | 1. `hours_per_day`≤0 | 400 | API | validation |
| TC-HRM-AT-14-RULE-STD-SAVE-BD-001 | CAP-03 | FN-RULE-STD-SAVE | BD | P1 | HCNS | — | 1. days=1 và days=31 | Pass biên | API | BD |
| TC-HRM-AT-14-RULE-APP-SAVE-HP-001 | CAP-04 | FN-RULE-APP-SAVE | HP | P0 | HCNS | Target API | 1. Tab **Ứng dụng** · tắt QR · bật GPS 2. Lưu · F5 | Flags persist | UI/API | matrix §2.2 |
| TC-HRM-AT-14-RULE-APP-SAVE-FD-001 | CAP-04 | FN-RULE-APP-SAVE | FD | P0 | HCNS | gps_enabled=false | 1. Mobile check-in GPS (wave sau) | Reject hoặc skip GPS per policy — SPEC_GAP mobile | API | MOB backlog |
| TC-HRM-AT-14-GPS-CRUD-HP-001 | CAP-04 | FN-GPS-CRUD | HP | P0 | HCNS | Target API + slug scope | 1. Thêm điểm «Trụ sở» lat/lon hợp lệ · radius 200m 2. Lưu · F5 3. Clock-in trong radius (U65 FE) | Site persist · check-in 2xx | UI/API | work_sites |
| TC-HRM-AT-14-GPS-CRUD-FD-001 | CAP-04 | FN-GPS-CRUD | FD | P0 | HCNS | — | 1. radius=0 hoặc thiếu tên | 400 | API | validation |
| TC-HRM-AT-14-GPS-CRUD-FD-002 | CAP-04 | FN-GPS-CRUD | FD | P0 | HCNS | AS-IS | 1. Bấm Thêm GPS (unwired) | **BLOCKED** — không modal/API · verdict STUB | UI | MISSING_CFG_UI |
| TC-HRM-AT-14-GPS-CRUD-BD-001 | CAP-04 | FN-GPS-CRUD | BD | P1 | HCNS | Site active | 1. Check-in ngoài radius | **400** `HRM-ATT-GEO-001` | API | geofence |
| TC-HRM-AT-14-GPS-CRUD-UX-001 | CAP-04 | FN-GPS-CRUD | UX | P1 | HCNS | 2 sites | 1. Sửa radius site 1 | Update persist · không mất site 2 | UI/API | CRUD |
| TC-HRM-AT-14-COL-LIST-HP-001 | CAP-05 | FN-COL-LIST | HP | P0 | HCNS | — | 1. Rules→**Tùy chỉnh** | ≥1 cột label vi-VN · key ổn định | UI | getAttendanceColumnsData |
| TC-HRM-AT-14-COL-MUTATE-FD-001 | CAP-05 | FN-COL-MUTATE | FD | P0 | HCNS | AS-IS | 1. Thêm cột / kéo thứ tự | **BLOCKED** — GripVertical non-functional | UI | HARDCODED P0-3 |
| TC-HRM-AT-14-COL-MUTATE-UX-001 | CAP-05 | FN-COL-MUTATE | UX | P1 | HCNS | Target API | 1. Ẩn cột OT · F5 sheet grid | Cột ẩn trên lưới bảng công | UI | Payroll import |
| TC-HRM-AT-14-STUB-FD-001 | CAP-06 | FN-STUB-HONESTY | FD | P0 | HCNS | — | 1. Mở subtabs tablet/proxy/auto | Banner «đang phát triển» · **không** claim PASS CFG | UI | featureInDev |
| TC-HRM-AT-14-VAL-FD-001 | CAP-06 | FN-VAL | FD | P0 | HCNS | Target API | 1. Payload rules JSON quá lớn / invalid enum | 400 stable code | API | DTO |
| TC-HRM-AT-14-VAL-FD-002 | CAP-06 | FN-VAL | FD | P1 | HCNS | — | 1. `gps_locations` trùng tên | Accept hoặc 409 — ghi SPEC_GAP khi implement | API | SPEC_GAP |
| TC-HRM-AT-14-SCOPE-AU-001 | CAP-07 | FN-SCOPE | AU | P0 | member CEO | Token CT A | 1. PATCH rules/sheet header CT B | 409 SCOPE mismatch | API | ADR scope |
| TC-HRM-AT-14-SCOPE-AU-002 | CAP-07 | FN-SCOPE | AU | P0 | ceo@ holding | main rollup | 1. Đọc rules CT member không thuộc policy | 403/409 hoặc đúng ADR | API | ADR-GROUP-CEO |
| TC-HRM-AT-14-RBAC-AU-001 | CAP-07 | FN-RBAC | AU | P0 | NV ESS | Không HCNS | 1. Gọi mutate rules/sheets admin | 403 | API | RBAC |
| TC-HRM-AT-14-RBAC-AU-002 | CAP-07 | FN-RBAC | AU | P0 | anon | JWT hết hạn | 1. Lưu rules | 401 | API | auth |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y (mutate) | Y except FN-COL-MUTATE (FD+UX only — AS-IS no API) | Ghi P0-3 |
| Auth/scope đa CT | Y | AU ×4 | |
| Rules persist vs in-memory | Y (U87) | FD-002 GEN-SAVE | **SUPERSEDED** — Chung PATCH 200 + F5 (M1 CFG QA/QC); columns/stub tabs still open |
| Sheet AC-ATT-SHEET-01..06 | Y | §5 sheet rows | Sheets **PARTIAL** impl |
| SPEC_GAP ghi rõ | Y | auto-checkout duration · OT column codes · rules FR delta | ba-process/SA before Dev |
| Device tab login code | Optional | Out of §5 P0 | UNMAPPED device UC |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | **PARTIAL** — sheets CRUD + `GET/PATCH /attendance/rules` + work-sites admin CRUD (ADR D2/D3 · M1 CFG); GEO-001 check-in not re-certified this DOC seat | `po-mfd-m1-att-p0-cfg-be-01.md` · ADR |
| FE menu/nút/role | Rules→Chung/Công chuẩn Save → Nest PATCH; App GPS CRUD wired; ~~`cfgNotPersisted`~~ **retired**; columns hardcoded; tablet/proxy/auto stub | `po-mfd-m1-att-p0-cfg-fe-01.md` · DOC-01 |
| Mobile (nếu có) | GPS check-in consumes work-sites — CFG persist GWC; GEO-001 browser residual | MOB-04 linkage |
| RBAC / scope | AU mandatory HCNS vs ESS; holding rollup | ADR-HRM-RBAC-SCOPE-LADDER |

**Verdict code_readiness:** `PARTIAL` (rules/GPS admin **LIKELY_IMPL** GWC; sheets **LIKELY_IMPL**; columns/stub tabs **GAP**) — **`uat_done: false`**

---

## 8. Business rules (CFG — deterministic)

| BR-ID | Điều kiện | Hành động | Kết quả |
|-------|-----------|-----------|---------|
| BR-AT14-CFG-01 | Lưu quy tắc thành công | `PATCH /attendance/rules` **200** · ghi `attendance_rules` per `company_id` slug | F5 + GET đọc lại cùng giá trị (M1 CFG GWC) |
| BR-AT14-CFG-02 | ~~`saveRules` chỉ `setState` / `cfgNotPersisted`~~ | — | **SUPERSEDED** `PO-MFD-M2-ATT-CFG-DOC-01` — AS-IS trên `dc930c5` = Nest PATCH; fake success vẫn **FAIL** U87 |
| BR-AT14-CFG-03 | GPS site inactive hoặc ngoài radius | Check-in có lat/lon | 400 `HRM-ATT-GEO-001` |
| BR-AT14-CFG-04 | Cột bảng hardcoded | Payroll import | SPEC_GAP mapping until API |
| BR-AT14-CFG-05 | Sheet header created | Không auto `attendance_records` | Empty lưới hợp lệ BR-ATT-SHEET-06 |

---

## 9. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: HRM-AT-14
cases_designed: 37
code_readiness: PARTIAL
work_item_id: PO-MFD-M1-ATT-AT14-BYUC-01
doc_delta: PO-MFD-M2-ATT-CFG-DOC-01 — retire cfgNotPersisted / NO_API rules wording; align ADR + M1 CFG GWC
spec_gap: attendance_rules FR 7-mục (client pack) · column catalog API · auto_checkout duration job GĐ2
cfg_persist_slice: GWC po-mfd-m1-att-p0-cfg-qc-01.md (NOT full UC UAT)
uat_done: false
```
