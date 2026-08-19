# Menu TC Pack — `MOB-LEAVE-APPR` · Mobile nghỉ phép + phê duyệt QL

| Meta | Value |
|------|--------|
| **menu_id** | `MOB-LEAVE-APPR` |
| **surface** | `hrm-mobile` |
| **route(s)** | Profile stack: `LeaveRequestsList` · `CreateLeaveRequest` · `LeaveRequestDetail` · `ManagerApprovals` |
| **HDSD** | Mobile ESS Ch09–12 · `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.2–4.3 · persona matrix `docs/program/MOBILE_PERSONA_UX_MATRIX.md` |
| **SRS / FR / UC** | FR-UC-H03 · FR-UC-M03 · UC-HRM-MOB-06/06b/06c · UC-HRM-MOB-08 · **UF-HRM-08** |
| **TechSpec** | `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` · `docs/brand-new-documents-20270801/TECH_SPEC_VN.md` §5 attachment |
| **API_CONTRACT** | `POST/GET /api/hrm/attendance/leave-requests` · `POST …/{id}/approve` · `POST …/{id}/reject` · `POST /api/hrm/files/upload?feature=leave-attachment` · `GET …/leave-balance` |
| **UF / J-*** | **UF-HRM-08** · **J-MOB-03** (list→detail) · **J-MOB-05** (QL Duyệt/Từ chối) · *J-MOB-04 payslip ngoài pack này* |
| **Catalog neo** | TC-LV-01..02 · TC-LV-05..07 (web parity refs) · TC-MGR-03 · TC-LV-03 **BLOCKED** |
| **author** | qa · PO-ECO-TC-MOB-LEAVE-APPR-01 |
| **work_item_id** | `PO-ECO-TC-MOB-LEAVE-APPR-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |
| **Persona lock** | Submitter **`uat.nv0003@xe.vn`** / `xevn-uat-2026` · Approver **`uat.nv0001@xe.vn`** / `xevn-uat-2026` · **cấm** `ceo@xe.vn` làm L1 duyệt nghỉ |
| **Locks** | U65 zero-seed · U76 HDSD · U78 test-log when executed · **cấm** invent `T_L1`/`N` · **cấm** UAT DONE |

> Chuẩn: IEEE 829 / ISO 29119 lean — mỗi TC quan sát được trên device; E2E nghỉ phép = luồng FE mobile đầy đủ (login → tạo → list → QL duyệt → F5/kill-reopen).

---

## 0. Spec read ack (inventory source)

| Source | Path | Sections used |
|--------|------|----------------|
| Create wizard | `apps/mobile/hrm-mobile/src/features/attendance/CreateLeaveRequestScreen.tsx` | 4-step STEPS · fields · ConfirmActionModal |
| Leave list | `LeaveRequestsListScreen.tsx` | tabs · balance header · swipe · empty CTA |
| Leave detail | `LeaveRequestDetailScreen.tsx` | hero · metrics · attach · Sửa/Hủy |
| Manager inbox | `ManagerApprovalsScreen.tsx` | filters · cards · modals · APIs |
| FAB | `navigation/fabPrimaryActions.ts` · `FabPrimaryActionSheet.tsx` | create_leave · manager_approvals |
| Nav helpers | `navigation/profileStackNav.ts` | `navigateToLeaveRequestsList` · `navigateToCreateLeaveRequest` · `navigateToManagerApprovals` |
| BR attach | `utils/leaveAttachment.ts` | sick/maternity · 10MB · MIME |
| PO spine | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` §3 · `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` | LV-02 SPEC_GAP |
| Persona | `docs/qa/evidence/r-spine-mgr-hier-01-persona-lock.md` | uat.nv0003 → uat.nv0001 L1 |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| SCR-FAB-SHEET | sheet | FAB «Thao tác nhanh» (`CheckInFabOverlay`) | Danh sách hành động persona | open / dismiss |
| SCR-HOME-DASH | tab | Home | Tile/time-off hub → list hoặc approvals (manager) | loading · content |
| SCR-REQ-TAB | tab | Requests (nếu wired) | Entry danh sách đơn | — |
| SCR-LEAVE-LIST | page | `LeaveRequestsList` | «Nghỉ phép của tôi» + tabs trạng thái | loading shimmer · empty · error banner · list |
| SCR-LEAVE-CREATE | page | `CreateLeaveRequest` | Wizard 4 bước | step 0–3 · busy submit |
| SCR-LEAVE-DETAIL | page | `LeaveRequestDetail` | Chi tiết đơn | loading · error · empty · content |
| SCR-MGR-APPR | page | `ManagerApprovals` | Inbox QL | shimmer · empty · error · cards |
| SCR-PROFILE-ENTRY | row | Profile → Phê duyệt | `ProfileManagerApprovalsEntry` | badge pending |
| SCR-SETTINGS-ENTRY | row | Cài đặt → Phê duyệt | chỉ `auth.isManager` | hidden non-mgr |
| SCR-NOTIF-DEEP | page | Thông báo → deep link | case `ManagerApprovals` | — |
| SHT-DATE-RANGE | sheet | Bước 1 create | `HrmDateRangeField` calendar | pick start/end |
| CMP-ATTACH-PICKER | inline | Bước 2 sick/maternity | `LeaveAttachmentPicker` | pick · upload · error |
| POP-CONFIRM-SUBMIT | modal | Bước 4 «Gửi đơn nghỉ» | `ConfirmActionModal` kind=submit | confirm/cancel |
| POP-CONFIRM-MGR | modal | Duyệt/Từ chối card | `ConfirmActionModal` approve/decline | confirm/cancel |
| POP-REJECT-REASON | modal | Sau «Tiếp tục» từ chối | TextInput lý do | Huỷ · Gửi |
| POP-CANCEL-LEAVE | modal | Detail «Hủy đơn» | ConfirmActionModal decline | *API cancel chưa khả dụng — honest empty* |
| SNACK-UNDO | snackbar | Sau duyệt/từ chối | `UndoSnackbar` | hoàn tác chưa khả dụng |

**Đếm:** pages=6 · tabs=2 · sheets=1 · dialogs/modals=5 · confirms=4

---

## 2. Field dictionary (đủ mọi trường)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format | notes |
|----------|---------------|-----------|---------|----------|---------------|----------|--------|-------|
| F-LB-CHIP | Số dư nghỉ | SCR-LEAVE-CREATE step0–1 | chip | N | GET leave-balance | `GET …/leave-balance` | số ngày · «—» if N/C | `LeaveBalanceChip` testID `leave-balance-chip` |
| F-LB-HEADER | Số dư (header list) | SCR-LEAVE-LIST | header | N | annual balance | same | vi-VN | `LeaveBalanceHeader` |
| F-DATE-START | Từ ngày | SCR-LEAVE-CREATE | date | Y | end ≥ start | `start_date` | dd/MM/yyyy | `HrmDateRangeField` |
| F-DATE-END | Đến ngày | SCR-LEAVE-CREATE | date | Y | total_days ≥ 0.5 | `end_date` | dd/MM/yyyy | |
| F-TOTAL-DAYS | Tổng ngày (meta) | SCR-LEAVE-CREATE | read-only | Y | inclusive calendar | `total_days` | decimal | hiển thị step 0 |
| F-LEAVE-TYPE | Loại nghỉ | SCR-LEAVE-CREATE step1 | chip grid | Y | enum `leaveTypeOptions` | `leave_type` | label VI | 8 loại + catalog LVT_* display |
| F-ATTACH | Giấy tờ đính kèm | step1 sick/maternity | file | Y* | BR-LEAVE-DOC-01 · max 3 · 10MB · PDF/JPEG/PNG/WebP | `attachment_url` | — | *required types only |
| F-TITLE | Tiêu đề | step2 | text | N | default «Xin nghỉ từ mobile» | merged vào `reason` | | |
| F-CONTACT | Liên hệ | step2 | text | N | | `handover_to` | | placeholder SĐT |
| F-REASON | Mô tả | step2 | multiline | N | | `reason` | | |
| F-HANDOVER | Công việc bàn giao | step2 | multiline | N | | `handover_tasks` | | |
| F-EMP-CODE | Mã NV (review) | step3–4 | read-only | Y | from membership/hydrate | `employee_code` | | |
| F-EMP-NAME | Tên NV | step3–4 | read-only | Y | | `employee_name` | | |
| F-DEPT | Phòng ban | hidden hydrate | text | N | | `department` | | optional body |
| F-POSITION | Chức danh | hidden hydrate | text | N | | `position` | | optional |
| F-LIST-TAB | Đang xét / Đã duyệt / Từ chối | SCR-LEAVE-LIST | segmented | Y | maps status query | `status=` pending/approved/rejected | | |
| F-LIST-ROW-TITLE | Loại nghỉ (row) | SCR-LEAVE-LIST | list | — | label not raw key | `leave_type` | | `resolveLeaveTypeLabel` |
| F-LIST-ROW-RANGE | Khoảng ngày (row) | SCR-LEAVE-LIST | list | — | | start/end | dd/MM/yyyy | |
| F-LIST-ROW-STATUS | Trạng thái badge | SCR-LEAVE-LIST | badge | — | DNA pending/approved/rejected | `status` | | |
| F-DET-HERO-NAME | Tên NV | SCR-LEAVE-DETAIL | hero | — | | `employee_name` | | |
| F-DET-HERO-CODE | Mã NV | hero | — | | `employee_code` | | |
| F-DET-HERO-STATUS | Trạng thái | hero badge | — | | `status` | | |
| F-DET-METRICS | Loại/Số ngày/Từ/Đến | detail card | grid | — | | | dd/MM/yyyy | |
| F-DET-REASON | Lý do | Nội dung | note | N | sanitize seed display | `reason` | | |
| F-DET-HANDOVER | Bàn giao | Nội dung | note | N | | handover_to/tasks | | |
| F-DET-REJECT | Lý do từ chối | Phản hồi | note | N | if rejected | `rejected_reason` | | |
| F-DET-ATTACH-LINK | Xem / tải giấy tờ | attach card | button | N | opens URL | `attachment_url` | | testID `leave-attachment-open` |
| F-DET-SENT | Gửi | timestamps | read-only | — | | `requested_at` | dd/MM/yyyy HH:mm | |
| F-DET-REVIEWED | Duyệt | timestamps | read-only | N | | `reviewed_at` | datetime | |
| F-MGR-FILTER | Tất cả / Chỉnh sửa CC / Nghỉ phép | SCR-MGR-APPR | chips | Y | inbox filter | — | | counts on chips |
| F-MGR-CARD-NAME | Tên NV (card) | SCR-MGR-APPR | card | — | | `employee_name` | | ManagerLeaveCard |
| F-MGR-CARD-TYPE | Loại + range | card subtitle | — | | leave_type + dates | | |
| F-MGR-REJECT-TXT | Lý do từ chối | POP-REJECT-REASON | text | N | default if empty | `rejected_reason` | | modal |
| F-FAB-CREATE | Tạo đơn nghỉ | SCR-FAB-SHEET | row | — | testID `fab-action-create-leave` | nav CreateLeaveRequest | | all personas except leader-only path |
| F-FAB-MGR | Duyệt đơn | SCR-FAB-SHEET | row+badge | mgr/leader | pending count | nav ManagerApprovals | | testID `fab-action-manager-approvals` |

**Đếm fields:** **34** (list columns included)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API | success FE + reopen | fail / edge | HDSD |
|-------|---------------|-----------|---------|-----|---------------------|-------------|------|
| FN-FAB-OPEN | FAB «Thao tác nhanh» | global | logged in | — | sheet visible | offline N/A | Home |
| FN-FAB-LEAVE | Tạo đơn nghỉ | FAB sheet | employee scope | — | → CreateLeaveRequest | | ESS create |
| FN-FAB-MGR | Duyệt đơn | FAB sheet | is_manager | — | → ManagerApprovals | hidden emp no reports | QL inbox |
| FN-DASH-LEAVE | Tile nghỉ / time off | Home | persona | GET list optional | → LeaveRequestsList or Mgr | | hub |
| FN-PROF-MGR | Phê duyệt (profile) | Profile | is_manager | GET pending | → ManagerApprovals | | |
| FN-LIST-REFRESH | Kéo làm mới | SCR-LEAVE-LIST | scope OK | GET leave-requests | rows update | error banner | |
| FN-LIST-TAB | Chuyển tab trạng thái | SCR-LEAVE-LIST | | GET filtered | rows match status | empty OK | |
| FN-LIST-OPEN | Tap row | SCR-LEAVE-LIST | row exists | GET detail via list | → Detail | 404 scope FAIL | J-MOB-03 |
| FN-LIST-SWIPE | Vuốt row | SCR-LEAVE-LIST | tab pending | — | actions per tab | | |
| FN-LIST-EMPTY-CTA | Tạo đơn (empty) | SCR-LEAVE-LIST | no rows | — | → Create | | |
| FN-CREATE-NEXT | Tiếp tục | wizard | step valid | — | next step | disabled attach/dates | |
| FN-CREATE-BACK | Quay lại / Huỷ | wizard | | — | prev or pop | | |
| FN-CREATE-UPLOAD | Đính kèm | step1 | sick/maternity | POST files/upload 201 | uploadedUrl set | Alert error | LV-04 parity |
| FN-CREATE-SUBMIT | Gửi đơn nghỉ | step3 | online · scope | POST leave-requests 201 | Alert «Đã gửi» → list pending | 4xx formatHrmError | TC-LV-01 |
| FN-CREATE-CONFIRM | Xác nhận modal gửi | modal | | | POST after confirm | cancel = no POST | |
| FN-DET-ATTACH-OPEN | Xem / tải giấy tờ | detail | URL present | — | external open | Alert lỗi | |
| FN-DET-EDIT | Sửa đơn | detail pending | status=pending | — | → Create prefill *new submit* | note API no PATCH | |
| FN-DET-CANCEL | Hủy đơn | detail pending | | cancel API | Alert «Chưa khả dụng» | honest | |
| FN-MGR-LOAD | Load inbox | SCR-MGR-APPR | manager_id filter | GET update-requests + leave-requests pending | cards or empty | 500 banner | |
| FN-MGR-FILTER | Lọc chip | SCR-MGR-APPR | | — | visible subset | empty message per filter | |
| FN-MGR-APPROVE | Duyệt | card | online | POST …/approve 2xx | snackbar success · row gone · F5 | 4xx Alert | J-MOB-05 · TC-LV-02 |
| FN-MGR-DECLINE | Từ chối | card | online | POST …/reject 2xx | snackbar · row gone | | |
| FN-MGR-SWIPE | Vuốt Duyệt/Từ chối | card | swipeReady | same as above | same | deferred mount if !focus | |
| FN-MGR-REFRESH | Pull refresh | SCR-MGR-APPR | | GET | counts update | | |
| FN-OFFLINE-GUARD | Mọi mutate | all | offline | — | Alert block | no POST | |

**Đếm functions:** **25** (mutate: 8)

---

## 4. Test case matrix

### Quy ước

- **TC-ID:** `TC-MOB-LV-<area>-<nnn>` · Type: `HP` · `FD` · `BD` · `AU` · `UX` · `NAV`
- **Layer:** DEVICE (adb/emulator) · API (DevTools proxy) khi cần parity
- **Status mặc định:** `PLANNED` (pack design — chưa device run wave này)

### 4.1 Navigation & entry (FAB / hub / profile)

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Automate | Status |
|-------|------|--------|---------|---------|--------------|----------|----------|--------|
| TC-MOB-LV-NAV-001 | NAV | FN-FAB-OPEN · FN-FAB-LEAVE | uat.nv0003 | Login OK · company UUID scope | Home → FAB → «Tạo đơn nghỉ» | `CreateLeaveRequest` title «Tạo đơn nghỉ» · stepper 4 bước | DEVICE | PLANNED |
| TC-MOB-LV-NAV-002 | NAV | FN-DASH-LEAVE | uat.nv0003 | | Home → tile/time-off (hub) | `LeaveRequestsList` · header balance | DEVICE | PLANNED |
| TC-MOB-LV-NAV-003 | NAV | FN-LIST-EMPTY-CTA | uat.nv0003 | list empty tab Đang xét | Requests/Profile path → list empty → CTA | → Create wizard | DEVICE | PLANNED |
| TC-MOB-LV-NAV-004 | NAV | FN-FAB-MGR · FN-PROF-MGR | uat.nv0001 | `is_manager=true` · direct reports | FAB «Duyệt đơn» **or** Profile Phê duyệt | `ManagerApprovals` testID screen · subtitle CC+nghỉ | DEVICE | PLANNED |
| TC-MOB-LV-NAV-005 | AU | FN-FAB-MGR hidden | uat.nv0003 | NV không QL | FAB sheet | **Không** có «Duyệt đơn» | DEVICE | PLANNED |
| TC-MOB-LV-NAV-006 | NAV | Settings entry | uat.nv0001 | | Cài đặt → Phê duyệt | → ManagerApprovals | DEVICE | PLANNED |

### 4.2 CreateLeaveRequest — wizard happy & UX

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-LV-CR-HP-001 | HP | FN-CREATE-* annual 1d | uat.nv0003 | balance load OK | B1 chọn hôm nay→hôm nay · B2 «Nghỉ phép năm» · B3 tiêu đề+liên hệ · B4 Gửi → confirm | POST **201** · Alert «Đã gửi đơn» · list tab **Đang xét** có row · **kill app reopen** row còn | DEVICE+API | PLANNED |
| TC-MOB-LV-CR-HP-002 | HP | F-LB-CHIP | uat.nv0003 | | Step0–1 observe chip | Không crash · «—» hoặc số ngày · không raw error code | DEVICE | PLANNED |
| TC-MOB-LV-CR-UX-001 | UX | stepper | uat.nv0003 | | Walk 4 labels | «Chọn ngày»→«Loại nghỉ»→«Xác nhận»→«Gửi đơn» active dot | DEVICE | PLANNED |
| TC-MOB-LV-CR-BD-001 | BD | F-DATE multi-day | uat.nv0003 | | B1 chọn 3 ngày liên tiếp | Meta «Tổng: 3 ngày» · dd/MM/yyyy range | DEVICE | PLANNED |
| TC-MOB-LV-CR-BD-002 | BD | F-TOTAL-DAYS min | uat.nv0003 | | end before start attempt | «Tiếp tục» disabled or Alert end≥start | DEVICE | PLANNED |
| TC-MOB-LV-CR-UX-002 | UX | balance warn | uat.nv0003 | balance depleted/exceed | chọn ngày vượt dư | Banner warn testID `leave-balance-warn-step*` · submit modal cảnh báo vẫn cho gửi (pilot warn-only) | DEVICE | PLANNED |

### 4.3 Create — BR-LEAVE-DOC (sick/maternity)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-LV-CR-FD-001 | FD | F-ATTACH block step1 | uat.nv0003 | | B2 chọn «Nghỉ ốm» · không upload · bấm Tiếp tục | **Disabled** `leave-create-next` and/or Alert · **no** step 3 | DEVICE | PLANNED |
| TC-MOB-LV-CR-HP-003 | HP | FN-CREATE-UPLOAD sick≥3d | uat.nv0003 | file PDF ≤10MB | Upload → Tiếp tục → submit | POST upload **201** `HRM-FILE-201` · POST leave **201** · `attachment_url` in GET | DEVICE+API | PLANNED |
| TC-MOB-LV-CR-FD-002 | FD | MIME invalid | uat.nv0003 | | pick disallowed type | Alert validation · no uploadedUrl | DEVICE | PLANNED |
| TC-MOB-LV-CR-FD-003 | FD | offline submit | uat.nv0003 | airplane mode | B4 Gửi | Alert offline · **no** POST | DEVICE | PLANNED |

### 4.4 Leave list & J-MOB-03

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-LV-LST-HP-001 | HP | FN-LIST-OPEN | uat.nv0003 | ≥1 pending row | Tab **Đang xét** → tap row | → Detail · hero + metrics · dates dd/MM/yyyy | DEVICE | PLANNED |
| TC-MOB-LV-LST-HP-002 | HP | J-MOB-03 E2E | uat.nv0003 | after CR-HP-001 | list → detail → back → detail again | URL/route stable · GET list contains id · no scope 409 | DEVICE | PLANNED |
| TC-MOB-LV-LST-UX-001 | UX | tabs | uat.nv0003 | rows mixed status | Switch Đã duyệt / Từ chối | Query status matches · empty state illustration OK | DEVICE | PLANNED |
| TC-MOB-LV-LST-FD-001 | FD | scope error | uat.nv0003 | corrupt scope sim | open list | Banner lỗi VI · không spinner vô hạn | DEVICE | PLANNED |
| TC-MOB-LV-LST-UX-002 | UX | labels U72 | uat.nv0003 | catalog LVT row if any | list row title | **Không** raw `LVT_02` / `annual` — label VI or «—» | DEVICE | PLANNED |

### 4.5 Leave detail

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-LV-DET-HP-001 | HP | F-DET-* | uat.nv0003 | pending w/ reason | open detail | Fields match create · timestamps formatted | DEVICE | PLANNED |
| TC-MOB-LV-DET-HP-002 | HP | FN-DET-ATTACH-OPEN | uat.nv0003 | sick w/ attach | «Xem / tải giấy tờ» | opens viewer/browser | DEVICE | PLANNED |
| TC-MOB-LV-DET-HP-003 | HP | FN-DET-EDIT | uat.nv0003 | pending | «Sửa đơn» | Create prefill · note tạo đơn mới | DEVICE | PLANNED |
| TC-MOB-LV-DET-FD-001 | FD | FN-DET-CANCEL | uat.nv0003 | pending | Hủy → confirm | Alert «Chưa khả dụng» · status still pending | DEVICE | PLANNED |
| TC-MOB-LV-DET-FD-002 | FD | missing id | uat.nv0003 | deep link bad id | open | «Không tìm thấy đơn» empty | DEVICE | PLANNED |

### 4.6 ManagerApprovals & J-MOB-05 (persona lock)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-LV-MGR-HP-001 | HP | FN-MGR-APPROVE leave | uat.nv0001 | pending leave from **0003** · manager_id edge | Filter **Nghỉ phép** → card NV0003 → Duyệt → confirm | POST approve **2xx** (e.g. HRM-LEAVE-203) · snackbar · card removed · **0003** list → **Đã duyệt** | DEVICE+API | PLANNED |
| TC-MOB-LV-MGR-HP-002 | HP | FN-MGR-DECLINE | uat.nv0001 | second pending | Từ chối → confirm → nhập lý do → Gửi | POST reject **2xx** · **0003** tab Từ chối shows reason | DEVICE+API | PLANNED |
| TC-MOB-LV-MGR-HP-003 | HP | J-MOB-05 chain | uat.nv0003 → **0001** | U65 full FE | **0003** create (CR-HP-001) → logout → **0001** approve | End-to-end pending→approved **without seed/API cheat** | DEVICE | PLANNED |
| TC-MOB-LV-MGR-UX-001 | UX | FN-MGR-FILTER | uat.nv0001 | mixed att+leave pending | Chips Tất cả / CC / Nghỉ phép | Counts match lists · empty copy correct | DEVICE | PLANNED |
| TC-MOB-LV-MGR-UX-002 | UX | swipe | uat.nv0001 | focus screen | Swipe card | Same as button approve/decline modals | DEVICE | PLANNED |
| TC-MOB-LV-MGR-BD-001 | BD | empty inbox | uat.nv0001 | no pending | Open approvals | Empty illustration · no error banner | DEVICE | PLANNED |
| TC-MOB-LV-MGR-FD-001 | FD | offline approve | uat.nv0001 | pending | airplane → Duyệt | Alert block · no POST | DEVICE | PLANNED |
| TC-MOB-LV-MGR-AU-001 | AU | TC-MGR-03 / not CEO | uat.nv0001 | **ceo not approver** | Verify pending query uses `manager_employee_id=0001` | 0003 đơn **visible** to 0001 · **not** approved by ceo path | API+DEVICE | PLANNED |

### 4.7 Cross-catalog & HOLD

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Automate | Status |
|-------|------|--------|---------|---------|-------|----------|----------|--------|
| TC-MOB-LV-X-001 | HP | TC-LV-01 map | uat.nv0003 | | Same as CR-HP-001 | Maps catalog **TC-LV-01** MOBILE | DEVICE | PLANNED |
| TC-MOB-LV-X-002 | HP | TC-LV-02 map | uat.nv0001 | mgr hier | Same as MGR-HP-001 | Maps **TC-LV-02** | DEVICE | PLANNED |
| TC-MOB-LV-X-003 | **BLOCKED** | TC-LV-03 · LV-02 ladder | any | Sponsor **chưa** chốt `T_L1`/`N` | Submit đơn > N ngày → L1 → L2 | **Không execute** — mark BLOCKED SPEC_GAP | MANUAL | **BLOCKED** |
| TC-MOB-LV-X-004 | FD | TC-LV-10 self-approve | uat.nv0003 | same user mgr+submitter illegal | 0003 tries approve own | **4xx** / UI không có self inbox | DEVICE | PLANNED |
| TC-MOB-LV-X-005 | FD | TC-LV-11 scope | wrong CT approver | | approve other company | **403/409** · status unchanged | PLANNED | PLANNED |

### Coverage check

| Check | Required | In matrix | GAP |
|-------|----------|-----------|-----|
| Functions ≥1 HP | 25 | 25 | 0 |
| Mutate fn ≥1 FD | 8 | 8 | 0 |
| Required fields FD/BD | 6 (dates, type, attach*, submit) | 6 | 0 |
| Modals open/cancel/submit | 4 | 4 (CR confirm, MGR confirm, reject, cancel) | 0 |
| J-MOB-03 explicit | 1 | LST-HP-002 | 0 |
| J-MOB-05 explicit | 1 | MGR-HP-003 | 0 |
| UF-HRM-08 E2E | 1 | MGR-HP-003 + CR-HP-001 | 0 |

**TC count:** **38** executable PLANNED + **1** BLOCKED (LV-02 ladder)

---

## 5. Traceability

| TC-ID | SRS / UC | TechSpec | API | Catalog | HDSD |
|-------|----------|----------|-----|---------|------|
| TC-MOB-LV-CR-HP-001 | FR-UC-M03 · UC-HRM-MOB-06 | MOBILE_W7 §3.5 | POST leave-requests | TC-LV-01 | Mobile tạo nghỉ |
| TC-MOB-LV-CR-FD-001 | BR-LEAVE-DOC-01 · LV-03 parity | §5.2 attach gate | VAL-ATT / FE block | TC-LV-05 | Đính kèm ốm |
| TC-MOB-LV-CR-HP-003 | LV-04 | upload | files/upload + leave 201 | TC-LV-07 | |
| TC-MOB-LV-LST-HP-002 | UF-HRM-08 · J-MOB-03 | list/detail | GET leave-requests | — | Danh sách→chi tiết |
| TC-MOB-LV-MGR-HP-001 | FR-UC-H03 L1 · J-MOB-05 | manager filter | POST approve | TC-LV-02 · TC-MGR-03 | QL Duyệt |
| TC-MOB-LV-MGR-HP-002 | FR-UC-H03 reject | | POST reject | — | QL Từ chối |
| TC-MOB-LV-X-003 | LV-02 GAP-LEAVE-LADDER-01 | WF 2-step | — | TC-LV-03 | **BLOCKED** |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| J-MOB-04 payslip list→detail | UF payslip — pack **MOB-LEAVE-APPR** | OOS |
| WF L2 day ladder `T_L1`/`N` | LV-02 SPEC_GAP · catalog TC-LV-03 | **BLOCKED** |
| API PATCH cancel/update leave | Detail «Hủy» honest stub | DET-FD-001 documents |
| Undo snackbar auto-revert | BR-ESS-UNDO-01 not impl | UX note only |
| Attendance update-requests approve | Same screen — TC optional AT-02 link | MGR filter «Chỉnh sửa CC» PLANNED in FN-MGR-* |
| `ceo@xe.vn` mobile L1 approve | Persona lock — not UAT path | AU |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-mob-leave-appr-01.md
next_owner: qa-synth (rollup PO_SPEC_TEST_REPORT + roster pack_path)
counts: screens=15 fields=34 functions=25 tcs=39 (38 PLANNED + 1 BLOCKED)
catalog_map: TC-LV-01/02/05/07/MGR-03 · UF-HRM-08 · J-MOB-03/05
```

*PO-ECO-TC-MOB-LEAVE-APPR-01 · WORLD-STANDARD depth pack · no UAT execution claim*
