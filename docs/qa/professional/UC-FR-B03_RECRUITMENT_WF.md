# Use Case — Tuyển dụng có quy trình & vào biên chế (FR-UC-B03 + Hire)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-PRO-TC-UC-REC-01` |
| **UC / FR** | **FR-UC-B03** (WF hai cấp / inbox) · pipeline tuyển · **Hire** gắn NV (UF-HRM-12) · kéo theo FR-UC-H01 hồ sơ · FR-UC-H04 lương (hậu tố) |
| **Mục tiêu UC** | Thiết lập QT tuyển → tạo kế hoạch/YCTD → duyệt inbox → quản lý ứng viên → hire gắn NV → (tuỳ chọn) thấy HĐ/lương |
| **Actors** | Group CEO · HRBP · Approver hat QT · (scope) Member CEO |
| **Surfaces** | CC Quy trình · CC Hộp thư · HRM Tuyển dụng · Nhân sự · Hợp đồng · Lương |
| **Spec** | BA matrix HP-01..06 · HDSD CH07 · menu pack `HRM-RECRUITMENT.md` (chi tiết màn) |
| **Design status** | **DESIGNED** |
| **execution** | not started (thiết kế) — không đồng nghĩa spine FAIL/EVIDENCED cũ |

---

## 1. Cây nghiệp vụ trong UC

| Cap-ID | Nghiệp vụ | Mục đích | Actors |
|--------|-----------|----------|--------|
| **CAP-REC-01** | Thiết lập quy trình tuyển | QT definition active để spawn | CEO / Admin QT |
| **CAP-REC-02** | Lập kế hoạch tuyển dụng | KHTD → gửi duyệt QT | HRBP / CEO |
| **CAP-REC-03** | Lập yêu cầu tuyển (YCTD) | YCTD + JD → gửi duyệt QT | HRBP / CEO |
| **CAP-REC-04** | Phê duyệt / từ chối trên Inbox | Hoàn tất bước WF | Approver |
| **CAP-REC-05** | Thư viện JD / tin | Mẫu vị trí dùng cho YCTD | HRBP |
| **CAP-REC-06** | Quản lý ứng viên & pipeline | Tạo UV · chuyển stage · bắt đầu QT pipeline | HRBP |
| **CAP-REC-07** | Hire / gắn nhân viên | UV → NV chính thức | HRBP |
| **CAP-REC-08** | Hậu kiểm hồ sơ / HĐ / lương | Thấy NV sau hire | HRBP / CEO |
| **CAP-REC-09** | Kiểm soát phạm vi & chống tự duyệt | Scope CT · BR-WF-04 | Hệ thống |

**Đếm nghiệp vụ:** **9**

---

## 2. Chức năng theo nghiệp vụ

### CAP-REC-01 — QT

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-WF-OPEN** | Mở canvas QT recruitment | N |
| **FN-WF-SAVE** | Lưu / kích hoạt definition | Y |
| **FN-WF-RELOAD** | F5 còn definition | N |

### CAP-REC-02 — Kế hoạch

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-PLAN-LIST** | Xem danh sách KHTD | N |
| **FN-PLAN-CREATE** | Tạo kế hoạch | Y |
| **FN-PLAN-SUBMIT-WF** | Gửi duyệt QT | Y |
| **FN-PLAN-DETAIL** | Xem chi tiết / trạng thái WF | N |

### CAP-REC-03 — YCTD

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-REQ-LIST** | List YCTD | N |
| **FN-JD-PICK** | Chọn / tạo JD cho YCTD | Y |
| **FN-REQ-CREATE** | Tạo YCTD | Y |
| **FN-REQ-SUBMIT-WF** | Gửi duyệt QT YCTD | Y |
| **FN-REQ-DETAIL** | Chi tiết + stamp WF | N |

### CAP-REC-04 — Inbox

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-INBOX-OPEN** | Mở Hộp thư · thấy task | N |
| **FN-INBOX-APPROVE** | Duyệt / Xử lý nhanh | Y |
| **FN-INBOX-REJECT** | Từ chối + lý do ≥ ngưỡng | Y |
| **FN-INBOX-EMPTY** | Inbox trống (policy U65) | N |

### CAP-REC-05 — JD / Job (rút gọn P0)

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-JD-CREATE** | Thêm mẫu JD | Y |
| **FN-JD-LIST** | List thư viện | N |

### CAP-REC-06 — Ứng viên / pipeline

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-CAND-CREATE** | Thêm ứng viên | Y |
| **FN-CAND-LIST** | List / filter stage | N |
| **FN-CAND-STAGE** | Đổi stage / roadmap | Y |
| **FN-PIPE-START** | Bắt đầu QT pipeline | Y |
| **FN-PIPE-APPR** | Duyệt bước pipeline trên Inbox | Y |

### CAP-REC-07 — Hire

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-HIRE-OPEN** | Mở HireEmployeeLinkDialog | N |
| **FN-HIRE-LINK** | Gắn `employee_id` | Y |

### CAP-REC-08 — Hậu kiểm

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-EMP-OPEN** | Mở hồ sơ NV sau hire | N |
| **FN-CONTRACT-VIEW** | Xem HĐ cùng CT | N |
| **FN-PAY-VIEW** | Xem kỳ/payslip | N |

### CAP-REC-09 — Scope / self

| FN-ID | Chức năng | Mutate? |
|-------|-----------|---------|
| **FN-REC-SCOPE** | Member không mutate ngoài CT | Y (reject) |
| **FN-WF-SELF** | Chặn tự duyệt task mình | Y (reject) |

**Đếm chức năng:** **28**

---

## 3. Số case thiết kế theo chức năng

| FN-ID | HP | FD | BD | AU | UX | **Σ** |
|-------|---:|---:|---:|---:|---:|----:|
| FN-WF-OPEN | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-WF-SAVE | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-WF-RELOAD | 1 | 0 | 0 | 0 | 0 | 1 |
| FN-PLAN-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-PLAN-CREATE | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-PLAN-SUBMIT-WF | 1 | 1 | 0 | 0 | 1 | 3 |
| FN-PLAN-DETAIL | 1 | 0 | 0 | 0 | 0 | 1 |
| FN-REQ-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-JD-PICK | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-REQ-CREATE | 1 | 1 | 1 | 0 | 0 | 3 |
| FN-REQ-SUBMIT-WF | 1 | 1 | 0 | 0 | 1 | 3 |
| FN-REQ-DETAIL | 1 | 0 | 0 | 0 | 0 | 1 |
| FN-INBOX-OPEN | 1 | 0 | 0 | 0 | 0 | 1 |
| FN-INBOX-APPROVE | 1 | 1 | 0 | 0 | 1 | 3 |
| FN-INBOX-REJECT | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-INBOX-EMPTY | 0 | 0 | 0 | 0 | 1 | 1 |
| FN-JD-CREATE | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-JD-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-CAND-CREATE | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-CAND-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-CAND-STAGE | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-PIPE-START | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-PIPE-APPR | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-HIRE-OPEN | 1 | 0 | 0 | 0 | 0 | 1 |
| FN-HIRE-LINK | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-EMP-OPEN | 1 | 0 | 0 | 1 | 0 | 2 |
| FN-CONTRACT-VIEW | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-PAY-VIEW | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-REC-SCOPE | 0 | 0 | 0 | 1 | 0 | 1 |
| FN-WF-SELF | 0 | 1 | 0 | 0 | 0 | 1 |
| **Tổng** | | | | | | **56** |

Depth menu `HRM-RECRUITMENT` (tabs/dialogs) bổ sung field-level TC — **không** thay cây UC này; neo-map khi cần.

---

## 4. Test Case Specification — P0 (viết đủ bước)

### 4.1 CAP-REC-01 — QT

| TC-ID | Type | Pri | Steps | Expected | Map spine |
|-------|------|-----|-------|----------|-----------|
| **TC-REC-WF-SAVE-HP-001** | HP | P0 | CC → Quy trình → mở `hrm_recruitment_*` → Lưu/active → reload | Definition **2xx** · F5 còn · không banner lỗi | HP-01 |
| **TC-REC-WF-SAVE-FD-001** | FD | P1 | Lưu thiếu bước/vai bắt buộc | Từ chối / validate BR-WF | — |
| **TC-REC-WF-OPEN-UX-001** | UX | P2 | Mở canvas khi API chậm | Loading rồi sẵn sàng · không trắng vĩnh viễn | — |

### 4.2 CAP-REC-02 — Kế hoạch

| TC-ID | Type | Pri | Steps | Expected | Map |
|-------|------|-----|-------|----------|-----|
| **TC-REC-PLAN-CREATE-HP-001** | HP | P0 | Tuyển dụng → Kế hoạch → Tạo → điền → Lưu | **2xx** · row list · F5 | HP-02 phần tạo |
| **TC-REC-PLAN-CREATE-FD-001** | FD | P0 | Thiếu field bắt buộc → Lưu | FE/API 4xx · không row ảo | — |
| **TC-REC-PLAN-SUBMIT-HP-001** | HP | P0 | Mở KHTD → **Gửi duyệt QT** | **2xx** spawn · status «Chờ duyệt» · F5 | HP-02 · U84 P-REC-PLAN |
| **TC-REC-PLAN-SUBMIT-FD-001** | FD | P1 | Gửi khi đã terminal / thiếu QT | Banner honest hoặc 4xx | SPAWN |
| **TC-REC-PLAN-SUBMIT-UX-001** | UX | P1 | Sau gửi | UI khóa sửa đúng policy | — |

### 4.3 CAP-REC-03 — YCTD + JD

| TC-ID | Type | Pri | Steps | Expected | Map |
|-------|------|-----|-------|----------|-----|
| **TC-REC-JD-PICK-HP-001** | HP | P0 | Tạo/chọn JD thuộc đúng CT trước YCTD | JD **201**/chọn được | U84 JD |
| **TC-REC-JD-PICK-FD-001** | FD | P0 | JD holding vs assert CT khác | **`HRM-REC-JD-POS`** hoặc tương đương · không lừa user | D-U84 |
| **TC-REC-REQ-CREATE-HP-001** | HP | P0 | YCTD + JD + headcount ≥1 → Lưu | **201** · row · F5 | — |
| **TC-REC-REQ-CREATE-FD-001** | FD | P0 | headcount &lt; 1 / thiếu JD | 4xx · G-RC-01 | — |
| **TC-REC-REQ-CREATE-BD-001** | BD | P1 | headcount = 1 | **201** | — |
| **TC-REC-REQ-SUBMIT-HP-001** | HP | P0 | **Gửi duyệt QT** YCTD | **2xx** `HRM-REC-WF-*` · chờ duyệt · F5 | HP-02 · U84 P-REC-REQ |
| **TC-REC-REQ-SUBMIT-FD-001** | FD | P1 | Gửi nháp thiếu field | chặn | — |
| **TC-REC-REQ-SUBMIT-UX-001** | UX | P1 | Spawn missing | Banner trung thực | — |

### 4.4 CAP-REC-04 — Inbox

| TC-ID | Type | Pri | Steps | Expected | Map |
|-------|------|-----|-------|----------|-----|
| **TC-REC-INBOX-APPR-HP-001** | HP | P0 | Task từ FE → Duyệt/Xử lý nhanh | **201** `XBOS-WF-200` · card biến · HRM sync · F5 | HP-03 |
| **TC-REC-INBOX-APPR-FD-001** | FD | P0 | Duyệt task đã done | 4xx / no-op | — |
| **TC-REC-INBOX-APPR-UX-001** | UX | P1 | Sau duyệt | List inbox cập nhật không cần hard refresh sai | — |
| **TC-REC-INBOX-REJ-HP-001** | HP | P1 | Từ chối + lý do ≥10 | reject 2xx · status rejected | HP-13 |
| **TC-REC-INBOX-REJ-FD-001** | FD | P1 | Lý do ngắn | 4xx | — |
| **TC-REC-INBOX-EMPTY-UX-001** | UX | P0 | Inbox trống | **BLOCKED** policy — **cấm** seed để có task | HP-05 |

### 4.5 CAP-REC-06/07 — UV · Pipeline · Hire

| TC-ID | Type | Pri | Steps | Expected | Map |
|-------|------|-----|-------|----------|-----|
| **TC-REC-CAND-CREATE-HP-001** | HP | P0 | Thêm UV → Lưu | **201** `HRM-REC-CP-201` · row · F5 | HP-04 |
| **TC-REC-CAND-CREATE-FD-001** | FD | P0 | Body FE thừa field cấm / thiếu email | 400 validation | DTO |
| **TC-REC-PIPE-START-HP-001** | HP | P0 | Bắt đầu QT `hrm_candidate_pipeline` | **201** wi · F5 | U84 P-REC-PIPE |
| **TC-REC-PIPE-START-FD-001** | FD | P1 | Start khi thiếu preset WF | banner/4xx honest | — |
| **TC-REC-PIPE-APPR-HP-001** | HP | P0 | Inbox bước pipeline | **201** matching wi | — |
| **TC-REC-HIRE-LINK-HP-001** | HP | P0 | Đã tuyển → Hire dialog → gắn NV | PATCH **200** · `employee_id` · chip · F5 | HP-04 hire |
| **TC-REC-HIRE-LINK-FD-001** | FD | P1 | Hire không chọn NV / stage sai | fail-closed | — |

### 4.6 CAP-REC-08/09 — Hậu kiểm · scope · self

| TC-ID | Type | Pri | Expected | Map |
|-------|------|-----|----------|-----|
| **TC-REC-EMP-OPEN-HP-001** | HP | P0 | Hồ sơ NV mới mở **200** đúng CT | HP-05 |
| **TC-REC-EMP-OPEN-AU-001** | AU | P1 | Member không mở NV ngoài CT | 403/404 |
| **TC-REC-CONTRACT-HP-001** | HP | P1 | HĐ active cùng CT (hoặc empty hợp lệ có lý do) | HP-05/10 |
| **TC-REC-CONTRACT-AU-001** | AU | P1 | Không thấy HĐ CT khác | — |
| **TC-REC-CONTRACT-UX-EMPTY-001** | UX | P2 | Chưa có HĐ | empty hợp lệ |
| **TC-REC-PAY-HP-001** | HP | P1 | Thấy payslip/kỳ hoặc empty có lý do | HP-06 |
| **TC-REC-PAY-UX-EMPTY-001** | UX | P2 | Chưa có kỳ | empty |
| **TC-REC-SCOPE-AU-001** | AU | P0 | `du-lich.ceo` mutate ngoài CT → 403/409 | HP-12 |
| **TC-REC-WF-SELF-FD-001** | FD | P0 | Tự duyệt task mình → chặn | HP-04 BR-WF-04 |

---

## 5. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| 9 nghiệp vụ có FN | 9 | 9 | 0 |
| P0 create+submit plan/req + inbox + cand + hire | 6 chuỗi | có TC | 0 |
| Self-approve + scope | 2 | 2 | 0 |
| Empty inbox policy | 1 | 1 | 0 |
| Field-level mọi tab recruitment | depth pack | `HRM-RECRUITMENT.md` | depth ≠ thay UC tree |

**Design complete (A):** YES cho khung UC.  
**Menu depth 100% field:** theo pack riêng — giai đoạn bổ sung, không chặn cây UC.

---

## 6. Map spine HP-* → professional

| HP | Professional TC (chính) |
|----|-------------------------|
| HP-01 | TC-REC-WF-SAVE-HP-001 |
| HP-02 | PLAN/REQ CREATE+SUBMIT HP |
| HP-03 | TC-REC-INBOX-APPR-HP-001 |
| HP-04 | CAND-CREATE + HIRE-LINK HP |
| HP-05 | EMP-OPEN + CONTRACT |
| HP-06 | PAY-VIEW |

---

*PO-PRO-TC-UC-REC-01 · DESIGNED · 56 cases · execution not started*
