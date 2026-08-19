# Use Case — Nghỉ phép & phê duyệt (FR-UC-H03 / FR-UC-M03)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-PRO-TC-UC-LEAVE-01` |
| **UC / FR** | **FR-UC-H03** (web) · **FR-UC-M03** (mobile ESS) · liên quan FR-UC-B03 (WF) |
| **Mục tiêu UC** | Nhân viên tạo đơn nghỉ đúng loại/ngày/giấy tờ; quản lý duyệt/từ chối theo cấp; số dư & chống gian lận (tự duyệt, sai CT) được hệ thống chặn |
| **Actors** | NV ESS · QL trực tiếp (`manager_id`) · HRBP fallback · (GĐ1.5 backlog) L2 Giám đốc |
| **Phase-1 ladder** | **WAIVE_L2_PHASE1** — LV-02 / CAP-LV-06 = **WAIVED_P1**; cấm invent `N` · `attendance_uat_ready=false` |
| **Surfaces** | Mobile Đơn nghỉ / Phê duyệt · Web Chấm công → Nghỉ phép · CC Hộp thư (khi có WF task) |
| **Spec** | BA `po-e2e-ba-case-matrix-01.md` §1–§3 · SRS_VN § nghỉ · API leave-requests |
| **Design status** | **DESIGNED** — chưa execution wave |
| **execution** | not started |

---

## 1. Cây nghiệp vụ trong UC

| Cap-ID | Nghiệp vụ (capability) | Mục đích nghiệp vụ | Actors |
|--------|------------------------|--------------------|--------|
| **CAP-LV-01** | Nộp đơn nghỉ | NV đăng ký nghỉ đúng loại & kỳ | NV |
| **CAP-LV-02** | Kiểm soát giấy tờ / validate nộp | Chặn đơn ốm dài thiếu file; path file hợp lệ | NV · hệ thống |
| **CAP-LV-03** | Kiểm soát số dư & trùng lịch | Không vượt phép; không overlap | NV · hệ thống |
| **CAP-LV-04** | Báo trước (notice) | Phép năm gửi trước ≥3 ngày lịch (SRS) | NV · hệ thống |
| **CAP-LV-05** | Phê duyệt L1 | QL trực tiếp duyệt/từ chối → cập nhật trạng thái | QL |
| **CAP-LV-06** | Phê duyệt L2 (ladder) | Đơn vượt ngưỡng cần cấp 2 | L2 · **WAIVED_P1** (Phase-1) · Option A backlog |
| **CAP-LV-07** | Chống tự duyệt & sai phạm vi | BR-WF-04 · scope CT | Hệ thống |
| **CAP-LV-08** | Theo dõi đơn & số dư | List/detail/balance sau thao tác | NV · QL · HCNS |

**Đếm nghiệp vụ:** **8**

---

## 2. Chức năng theo từng nghiệp vụ

### CAP-LV-01 — Nộp đơn nghỉ

| FN-ID | Chức năng | UI / API | Mutate? |
|-------|-----------|----------|---------|
| **FN-LEAVE-OPEN** | Mở form tạo đơn (mobile/web) | Mobile wizard · Web «Tạo yêu cầu nghỉ» | N |
| **FN-LEAVE-FILL** | Nhập loại / từ-đến / lý do | form fields | N |
| **FN-LEAVE-CREATE** | Gửi đơn (create) | `POST …/attendance/leave-requests` | **Y** |
| **FN-LEAVE-DRAFT** | Lưu nháp (nếu UI có) | PATCH/POST draft | Y* |
| **FN-LEAVE-CANCEL-OWN** | Hủy đơn pending của mình (nếu có) | cancel API/UI | Y* |

\* Đánh dấu optional nếu UI chưa expose — vẫn giữ điều kiện thiết kế.

### CAP-LV-02 — Giấy tờ / validate nộp

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-LEAVE-ATTACH** | Upload giấy / gắn `attachment_url` | Y |
| **FN-LEAVE-VAL-ATT** | Chặn ốm ≥3 ngày thiếu đính kèm | Y (reject) |
| **FN-LEAVE-VAL-PATH** | Chặn URL đính kèm ngoài `/api/hrm/files/` | Y (reject) |

### CAP-LV-03 — Số dư & overlap

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-LEAVE-VAL-BAL** | Chặn vượt số dư | Y (reject) |
| **FN-LEAVE-VAL-OVL** | Chặn trùng khoảng ngày | Y (reject) |

### CAP-LV-04 — Notice

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-LEAVE-VAL-NOTICE** | Chặn phép năm gửi sát ngày (<3 ngày lịch) | Y (reject) — **PARTIAL cite SRS** nếu BE soft |

### CAP-LV-05 — Duyệt L1

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-LEAVE-LIST-MGR** | QL xem hàng chờ nghỉ | N |
| **FN-LEAVE-APPROVE-L1** | Duyệt L1 (mobile / inbox / web) | Y |
| **FN-LEAVE-REJECT-L1** | Từ chối L1 + lý do | Y |

### CAP-LV-06 — Duyệt L2

| FN-ID | Chức năng | Mutate? | Ghi chú |
|-------|-----------|---------|---------|
| **FN-LEAVE-APPROVE-L2** | Duyệt cấp 2 | Y | **WAIVED_P1** — WF AS-IS 1 bước |
| **FN-LEAVE-HOLD-L2** | Sau L1 chưa terminal khi vượt N | Y | **WAIVED_P1** |

### CAP-LV-07 — Chống gian lận phạm vi

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-LEAVE-SELF-APPR** | Chặn tự duyệt | Y (reject) |
| **FN-LEAVE-SCOPE** | Chặn duyệt sai công ty | Y (reject) |

### CAP-LV-08 — Theo dõi

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-LEAVE-LIST-OWN** | NV xem đơn của mình | N |
| **FN-LEAVE-DETAIL** | Mở chi tiết đơn | N |
| **FN-LEAVE-BALANCE** | Xem / assert số dư sau duyệt | N |

**Đếm chức năng (core):** **20** (kể optional draft/cancel)

---

## 3. Phân rã số case theo chức năng (thiết kế)

| FN-ID | HP | FD | BD | AU | UX | **Σ thiết kế** | Ghi chú |
|-------|---:|---:|---:|---:|---:|---------------:|---------|
| FN-LEAVE-OPEN | 1 | 0 | 0 | 0 | 1 | **2** | empty form · error mount |
| FN-LEAVE-FILL | 0 | 0 | 0 | 0 | 0 | **0** | gộp vào CREATE |
| FN-LEAVE-CREATE | 2 | 1 | 1 | 1 | 1 | **6** | mobile HP + web HP · thiếu field · biên ngày · member scope · spawn banner |
| FN-LEAVE-DRAFT | 1 | 1 | 0 | 0 | 0 | **2** | optional UI |
| FN-LEAVE-CANCEL-OWN | 1 | 1 | 0 | 0 | 0 | **2** | optional / illegal cancel |
| FN-LEAVE-ATTACH | 1 | 1 | 0 | 0 | 0 | **2** | upload OK · sai loại file |
| FN-LEAVE-VAL-ATT | 0 | 2 | 1 | 0 | 0 | **3** | ≥3 thiếu file · =3 biên · có file pass nằm ở ATTACH+CREATE |
| FN-LEAVE-VAL-PATH | 0 | 1 | 0 | 0 | 0 | **1** | evil URL |
| FN-LEAVE-VAL-BAL | 0 | 1 | 1 | 0 | 0 | **2** | over · đúng biên còn 1 ngày |
| FN-LEAVE-VAL-OVL | 0 | 1 | 0 | 0 | 0 | **1** | overlap pending |
| FN-LEAVE-VAL-NOTICE | 0 | 1 | 1 | 0 | 0 | **2** | <3d · đúng 3d |
| FN-LEAVE-LIST-MGR | 1 | 0 | 0 | 1 | 1 | **3** | có đơn · không thấy CT khác · empty |
| FN-LEAVE-APPROVE-L1 | 2 | 1 | 0 | 0 | 1 | **4** | mobile + web/inbox · approve 2 lần · badge |
| FN-LEAVE-REJECT-L1 | 1 | 1 | 0 | 0 | 0 | **2** | lý do đủ · lý do ngắn |
| FN-LEAVE-APPROVE-L2 | 0 | 0 | 0 | 0 | 0 | **0*** | *SPEC_GAP — chỉ TC inventory BLOCKED |
| FN-LEAVE-HOLD-L2 | 0 | 0 | 0 | 0 | 0 | **0*** | SPEC_GAP inventory 2 TC đánh dấu SG |
| FN-LEAVE-SELF-APPR | 0 | 1 | 0 | 0 | 0 | **1** | |
| FN-LEAVE-SCOPE | 0 | 0 | 0 | 1 | 0 | **1** | |
| FN-LEAVE-LIST-OWN | 1 | 0 | 0 | 0 | 1 | **2** | |
| FN-LEAVE-DETAIL | 1 | 0 | 0 | 1 | 0 | **2** | · 404 ngoài scope |
| FN-LEAVE-BALANCE | 1 | 0 | 0 | 0 | 0 | **1** | sau approve giảm đúng |

| | | | | | | **Tổng** |
|--|--|--|--|--|--|--------:|
| **Cộng (không kể SPEC_GAP inventory)** | | | | | | **37** |
| **+ SPEC_GAP L2 inventory** | | | | | | **+2** = **39** |

> Map spine cũ: LV-01..06 là **subset E2E**; bảng này mới là **đủ chức năng** trong UC.

---

## 4. Test Case Specification (chi tiết — P0 trước)

### 4.1 CAP-LV-01 / FN-LEAVE-CREATE

| TC-ID | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-LEAVE-CREATE-HP-MOB-001** | HP | P0 | `uat.nv####` | Đã login mobile · có `manager_id` | 1. Đơn nghỉ → Tạo 2. Phép năm · chọn kỳ · lý do 3. Gửi | **2xx** leave · status pending · toast · F5 còn · (spawn WF hoặc banner honest) | MOBILE | FR-UC-M03 · LV-01 |
| **TC-LEAVE-CREATE-HP-WEB-001** | HP | P0 | NV/CEO trên Attendance | Web Chấm công → Nghỉ phép | 1. Tạo yêu cầu nghỉ 2. Điền 3. Lưu/Gửi | **2xx** · row list · F5 | UI | FR-UC-H03 |
| **TC-LEAVE-CREATE-FD-REQ-001** | FD | P0 | NV | Form mở | Gửi thiếu ngày hoặc thiếu loại | **4xx**/FE block · không tạo row | UI/API | validation |
| **TC-LEAVE-CREATE-BD-DAY-001** | BD | P1 | NV | — | `total_days` = 1 (biên ngắn) | **2xx** create | UI | — |
| **TC-LEAVE-CREATE-AU-SCOPE-001** | AU | P1 | `du-lich.ceo` | JWT member | Tạo đơn gắn CT khác (nếu UI cho phép inject) | **403/409** · không persist ngoài CT | API | scope |
| **TC-LEAVE-CREATE-UX-SPAWN-001** | UX | P1 | NV | WF template missing | Gửi đơn | Banner `SPAWN-MISSING` trung thực · **không** silent success | UI | bridge |

### 4.2 CAP-LV-02 — Giấy tờ

| TC-ID | Type | Pri | Steps (tóm) | Expected | Trace |
|-------|------|-----|-------------|----------|-------|
| **TC-LEAVE-ATTACH-HP-001** | HP | P0 | Ốm ≥3d · upload giấy hợp lệ → Gửi | **201** file + leave · `attachment_url` non-null · F5 | LV-04 |
| **TC-LEAVE-ATTACH-FD-TYPE-001** | FD | P1 | Upload loại file không cho phép | FE/API reject · không leave 201 | — |
| **TC-LEAVE-VAL-ATT-FD-001** | FD | P0 | Ốm ≥3d · **không** file → Lưu | **`HRM-LEAVE-VAL-ATT`** · không đơn hợp lệ | LV-03 |
| **TC-LEAVE-VAL-ATT-BD-3D-001** | BD | P0 | Ốm **đúng 3** ngày · không file | Cùng VAL-ATT (biên ≥3) | BR-LEAVE-ATT |
| **TC-LEAVE-VAL-PATH-FD-001** | FD | P0 | POST `attachment_url` ngoài `/api/hrm/files/` | **`HRM-LEAVE-VAL-ATT`** | unit/API |

### 4.3 CAP-LV-03 / 04 — Balance · Overlap · Notice

| TC-ID | Type | Pri | Expected | Trace |
|-------|------|-----|----------|-------|
| **TC-LEAVE-VAL-BAL-FD-001** | FD | P0 | Vượt số dư → `HRM-LEAVE-VAL-BALANCE` | unit+UI |
| **TC-LEAVE-VAL-BAL-BD-001** | BD | P1 | Còn đúng 1 ngày · xin 1 ngày → **2xx** | — |
| **TC-LEAVE-VAL-OVL-FD-001** | FD | P0 | Overlap pending → `HRM-LEAVE-VAL-OVERLAP` | — |
| **TC-LEAVE-VAL-NOTICE-FD-001** | FD | P1 | Phép năm start <3 ngày lịch → **4xx** hoặc residual BE soft ghi rõ | SRS notice |
| **TC-LEAVE-VAL-NOTICE-BD-001** | BD | P1 | Đúng 3 ngày lịch → cho phép create | — |

### 4.4 CAP-LV-05 — Duyệt / từ chối L1

| TC-ID | Type | Pri | Persona | Steps (tóm) | Expected | Trace |
|-------|------|-----|---------|-------------|----------|-------|
| **TC-LEAVE-APPR-L1-HP-MOB-001** | HP | P0 | QL `manager_id` | Cần duyệt → Nghỉ → Duyệt | **2xx** · NV approved · balance ↓ · F5 | LV-01 AP · J-MOB-05 |
| **TC-LEAVE-APPR-L1-HP-INBOX-001** | HP | P0 | Approver hat | Inbox task leave → Duyệt | Task complete · status sync · F5 | UF-XBOS-08 |
| **TC-LEAVE-APPR-L1-FD-DBL-001** | FD | P1 | QL | Duyệt lần 2 cùng đơn | **4xx** / no-op deterministic | SM |
| **TC-LEAVE-APPR-L1-UX-BADGE-001** | UX | P1 | QL | Sau duyệt | Badge «Cần duyệt» giảm | — |
| **TC-LEAVE-REJ-L1-HP-001** | HP | P0 | QL | Từ chối + lý do ≥ ngưỡng | rejected · NV thấy lý do · F5 | — |
| **TC-LEAVE-REJ-L1-FD-SHORT-001** | FD | P1 | QL | Lý do quá ngắn | **4xx** · status không đổi | API reject rule |
| **TC-LEAVE-LIST-MGR-HP-001** | HP | P0 | QL | Mở tab nghỉ | Thấy đơn NV dưới quyền | — |
| **TC-LEAVE-LIST-MGR-AU-001** | AU | P0 | QL CT A | — | Không thấy đơn CT B | — |
| **TC-LEAVE-LIST-MGR-UX-EMPTY-001** | UX | P2 | QL | Không đơn | Empty hợp lệ · không spinner storm | — |

### 4.5 CAP-LV-06 — L2 (**WAIVED_P1** inventory — không PASS Phase-1)

| TC-ID | Type | Pri | Status thiết kế | Expected khi reopen (sponsor `N` hoặc config-from-FE) |
|-------|------|-----|-----------------|------------------------------------------------------|
| **TC-LEAVE-L2-SG-HOLD-001** | SG | P0 | **WAIVED_P1** | Sau L1 đơn `total_days > N` **chưa** APPROVED |
| **TC-LEAVE-L2-SG-APPR-001** | SG | P0 | **WAIVED_P1** | L2 approve → APPROVED |

Phase-1 honesty: WF `hrm_leave_approval` **1 bước** QL trực tiếp = AC nghiệm thu; **cấm** invent `N` · **cấm** 🟢 LV-02.

### 4.6 CAP-LV-07 — Self / scope

| TC-ID | Type | Pri | Expected | Trace |
|-------|------|-----|----------|-------|
| **TC-LEAVE-SELF-APPR-FD-001** | FD | P0 | Submitter=approver → chặn / **4xx** | LV-05 · BR-WF-04 |
| **TC-LEAVE-SCOPE-AU-001** | AU | P0 | Approver sai CT → **403/409** · status không đổi | LV-06 |

### 4.7 CAP-LV-08 — Theo dõi

| TC-ID | Type | Pri | Expected |
|-------|------|-----|----------|
| **TC-LEAVE-LIST-OWN-HP-001** | HP | P0 | NV thấy đơn vừa gửi |
| **TC-LEAVE-LIST-OWN-UX-EMPTY-001** | UX | P2 | Empty list hợp lệ |
| **TC-LEAVE-DETAIL-HP-001** | HP | P0 | Mở detail đúng field · không epoch 1970 |
| **TC-LEAVE-DETAIL-AU-001** | AU | P1 | ID ngoài scope → 404/403 |
| **TC-LEAVE-BALANCE-HP-001** | HP | P0 | Sau approve số dư giảm đúng `total_days` |

### 4.8 Optional draft / cancel (nếu UI có)

| TC-ID | Type | Pri | Note |
|-------|------|-----|------|
| TC-LEAVE-DRAFT-HP-001 | HP | P2 | Lưu nháp |
| TC-LEAVE-DRAFT-FD-001 | FD | P2 | Nháp thiếu bắt buộc |
| TC-LEAVE-CANCEL-HP-001 | HP | P2 | Hủy pending của mình |
| TC-LEAVE-CANCEL-FD-001 | FD | P2 | Hủy đơn đã approved → reject |

---

## 5. Coverage check (thiết kế)

| Check | Required | In spec | GAP |
|-------|----------|---------|-----|
| Nghiệp vụ có ≥1 FN | 8 | 8 | 0 |
| FN mutate có ≥1 HP hoặc ≥1 FD | 14 mutate-ish | xem §3 | Draft/Cancel optional |
| VAL-ATT / BAL / OVL / SELF / SCOPE | 5 nhóm P0 | có TC | 0 |
| L2 ladder | TO-BE / GĐ1.5 | 2 SG | **WAIVED_P1** — reopen = sponsor `N` hoặc config-from-FE |
| Mobile + Web create | 2 HP | 2 | 0 |
| Approve mobile + inbox | 2 HP | 2 | 0 |

**Design complete (giai đoạn A):** **YES** cho AS-IS + gap L2 minh bạch.  
**UAT / execution:** **NO**.

---

## 6. Map sang artifact cũ (không xóa)

| Spine / cũ | Nằm ở professional |
|------------|-------------------|
| LV-01 | CREATE-HP-MOB + APPR-L1-HP-MOB |
| LV-02 | L2-SG-* |
| LV-03 | VAL-ATT-FD-001 |
| LV-04 | ATTACH-HP-001 + APPR |
| LV-05 | SELF-APPR-FD-001 |
| LV-06 | SCOPE-AU-001 |
| TC-LV-* catalog | subset / unit song song |

---

## 7. Khi nào chạy (chưa làm)

Chỉ khi Sponsor lệnh execution. Ưu tiên P0 trong §4. Luồng E2E tổng (mobile tạo → QL duyệt → balance) = giai đoạn B — ghép các TC HP, không thay bảng chức năng này.

---

*PO-PRO-TC-UC-LEAVE-01 · DESIGNED · 39 conditions/cases · execution not started*
