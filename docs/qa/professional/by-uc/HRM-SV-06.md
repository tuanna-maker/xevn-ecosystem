# UC — `HRM-SV-06` · Từ chối yêu cầu dịch vụ

| Meta | Value |
|------|--------|
| **uc_id** | `HRM-SV-06` |
| **stt_phase1** | 289 |
| **mod** | M05 |
| **name_vi** | Từ chối yêu cầu dịch vụ |
| **actors** | Approver · HR |
| **surfaces** | hrm-embed / api |
| **srs_old** | BANG_TONG_HOP STT42 |
| **srs_new** | SRS_VN SV reject |
| **tech_spec** | TECHSPEC operations |
| **api_contract** | POST …/service-requests/:id/reject |
| **author** | qa · PO-UC-TC-W1-S5-HRM-A |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | Reject + reason FD. |
| **squad** | W1-S5-HRM-A |
| **uat_done** | false |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE.


---

## 1. Mục tiêu UC (1 đoạn)

Từ chối yêu cầu dịch vụ: bảo đảm actor thực hiện đúng luồng HDSD trên surface nêu trên; hệ thống validate BR/DTO, tôn trọng scope đa pháp nhân, và phản hồi FE sau 2xx + F5 quan sát được. Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị / mở form | Đúng menu HDSD | Approver · HR |
| CAP-02 | Thực thi mutate chính | Từ chối yêu cầu dịch vụ | Approver · HR |
| CAP-03 | Fail-deep nghiệp vụ | Validate · BR · SM | Hệ thống |
| CAP-04 | Phạm vi & chống gian lận | Scope · self-approve | RBAC |
| CAP-05 | Phê duyệt / từ chối / inbox | Hoàn tất bước | Approver |

**Đếm nghiệp vụ:** 5

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở UI / chọn context CT | menu HDSD | N |
| CAP-02 | FN-ACT | Hành động chính (create/update/process) | POST …/service-requests/:id/reject | Y |
| CAP-02 | FN-RELOAD | F5 / navigate lại | browser | N |
| CAP-03 | FN-VAL | Validate bắt buộc & format | DTO | Y |
| CAP-03 | FN-BR | Business rule reject | Service | Y |
| CAP-03 | FN-SM | State machine illegal transition | status | Y |
| CAP-04 | FN-SCOPE | Sai công ty / header | x-company-id | Y |
| CAP-04 | FN-RBAC | Sai role | JWT role | Y |
| CAP-05 | FN-APPR | Duyệt | approve API/UI | Y |
| CAP-05 | FN-REJ | Từ chối + lý do | reject API/UI | Y |
| CAP-05 | FN-SELF | Chặn tự duyệt | BR-WF-04 | Y |

**Đếm chức năng:** 11

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 0 | 1 | **2** |
| FN-ACT | 2 | 1 | 1 | 1 | 1 | **6** |
| FN-RELOAD | 1 | 0 | 0 | 0 | 1 | **2** |
| FN-VAL | 0 | 2 | 1 | 0 | 0 | **3** |
| FN-BR | 0 | 2 | 0 | 0 | 0 | **2** |
| FN-SM | 0 | 2 | 0 | 0 | 1 | **3** |
| FN-SCOPE | 0 | 0 | 0 | 2 | 0 | **2** |
| FN-RBAC | 0 | 0 | 0 | 2 | 0 | **2** |
| FN-APPR | 2 | 1 | 0 | 1 | 1 | **5** |
| FN-REJ | 1 | 1 | 0 | 0 | 0 | **2** |
| FN-SELF | 0 | 1 | 0 | 1 | 0 | **2** |
| **Tổng (fn plan)** | 7 | 10 | 2 | 7 | 5 | **31** |
| **Tổng (bảng §5)** | | | | | | **31** |

> Σ bàn giao Synth = **số dòng TC §5** (`31`). Fn plan dùng để kiểm coverage; lệch nhỏ do gộp optional được chấp nhận nếu §6 GAP ghi rõ.

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-HRM-SV-06-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | HR / ceo@xe.vn | Login đúng persona | 1. Menu HDSD → Từ chối yêu cầu dịch vụ | Form/list sẵn sàng · không ERROR banner | UI | U76 HDSD |
| TC-HRM-SV-06-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | HR / ceo@xe.vn | — | 1. Open khi API down | Banner lỗi rõ | UI | health |
| TC-HRM-SV-06-ACT-HP-001 | CAP-02 | FN-ACT | HP | P0 | HR / ceo@xe.vn | Nguồn pending tạo từ FE trước (U65 — cấm seed inbox) | 1. Nhập đủ field hợp lệ theo HDSD cho «Từ chối yêu cầu dịch vụ» 2. Lưu/Gửi/Thực thi 3. Quan sát Network 2xx 4. F5 | 2xx + FE cập nhật + F5 còn · U65 no seed | UI/API | POST …/service-requests/:id/reject |
| TC-HRM-SV-06-ACT-HP-002 | CAP-02 | FN-ACT | HP | P1 | ceo@xe.vn / member | Đổi scope CT hợp lệ | 1. Lặp happy trên CT thành viên | Persist đúng company_id | UI/API | scope |
| TC-HRM-SV-06-ACT-FD-001 | CAP-02 | FN-ACT | FD | P0 | HR / ceo@xe.vn | — | 1. Submit thiếu field bắt buộc | 4xx · FE giữ form · không tạo bản ghi | UI/API | FD |
| TC-HRM-SV-06-ACT-BD-001 | CAP-02 | FN-ACT | BD | P1 | HR / ceo@xe.vn | — | 1. Giá trị biên số/ngày/độ dài | Biên pass/fail đúng SRS | UI/API | BD |
| TC-HRM-SV-06-ACT-AU-001 | CAP-02 | FN-ACT | AU | P0 | role thiếu quyền | Login low privilege | 1. Thử mutate | 403 | API | RBAC |
| TC-HRM-SV-06-ACT-UX-001 | CAP-02 | FN-ACT | UX | P1 | HR / ceo@xe.vn | — | 1. Double-click Lưu | Idempotent hoặc disable nút | UI | UX |
| TC-HRM-SV-06-RELOAD-HP-001 | CAP-02 | FN-RELOAD | HP | P0 | HR / ceo@xe.vn | Sau ACT-HP-001 | 1. F5 | Dữ liệu còn | UI | U65 |
| TC-HRM-SV-06-RELOAD-UX-001 | CAP-02 | FN-RELOAD | UX | P2 | HR / ceo@xe.vn | — | 1. Back list → detail | Không 404 (parity) | UI | L2.5 |
| TC-HRM-SV-06-VAL-FD-001 | CAP-03 | FN-VAL | FD | P0 | HR / ceo@xe.vn | — | 1. Sai format (email/date/ISO time) | 400 + message | API | DTO |
| TC-HRM-SV-06-VAL-FD-002 | CAP-03 | FN-VAL | FD | P0 | HR / ceo@xe.vn | — | 1. Payload null/empty string bắt buộc | 400 | API | validation |
| TC-HRM-SV-06-VAL-BD-001 | CAP-03 | FN-VAL | BD | P2 | HR / ceo@xe.vn | — | 1. Max length lý do/ghi chú | Biên | API | BD |
| TC-HRM-SV-06-BR-FD-001 | CAP-03 | FN-BR | FD | P0 | HR / ceo@xe.vn | Điều kiện BR sai | 1. Thao tác vi phạm BR đã biết trong SRS/TechSpec | Reject mã lỗi nghiệp vụ ổn định | API | BR |
| TC-HRM-SV-06-BR-FD-002 | CAP-03 | FN-BR | FD | P1 | HR / ceo@xe.vn | — | 1. Trùng khóa nghiệp vụ (nếu có) | 409/400 | API | unique |
| TC-HRM-SV-06-SM-FD-001 | CAP-03 | FN-SM | FD | P0 | HR / ceo@xe.vn | Bản ghi terminal | 1. Mutate lại trạng thái cấm | 4xx illegal transition | API | SM |
| TC-HRM-SV-06-SM-FD-002 | CAP-03 | FN-SM | FD | P1 | HR / ceo@xe.vn | Pending | 1. Thao tác không đúng vai | 4xx | API | SM |
| TC-HRM-SV-06-SM-UX-001 | CAP-03 | FN-SM | UX | P1 | HR / ceo@xe.vn | Terminal | 1. UI nút | Nút duyệt/sửa ẩn hoặc disabled | UI | UX |
| TC-HRM-SV-06-SCOPE-AU-001 | CAP-04 | FN-SCOPE | AU | P0 | member CEO | Token CT A | 1. Header CT B | 409 SCOPE_CONTEXT_MISMATCH / tương đương | API | scope |
| TC-HRM-SV-06-SCOPE-AU-002 | CAP-04 | FN-SCOPE | AU | P0 | ceo@ | Holding | 1. Thao tác bản ghi member không thuộc rollup policy | 403/409 hoặc đúng ADR | API | ADR |
| TC-HRM-SV-06-RBAC-AU-001 | CAP-04 | FN-RBAC | AU | P0 | NV ESS | Không phải approver | 1. Gọi approve/admin API | 403 | API | RBAC |
| TC-HRM-SV-06-RBAC-AU-002 | CAP-04 | FN-RBAC | AU | P1 | anon | Hết hạn JWT | 1. Mutate | 401 | API | auth |
| TC-HRM-SV-06-APPR-HP-001 | CAP-05 | FN-APPR | HP | P0 | QL/approver | Có đơn pending từ FE (không seed) | 1. Mở list/inbox 2. Duyệt | 2xx · status approved · F5 | UI/API | POST …/service-requests/:id/reject |
| TC-HRM-SV-06-APPR-HP-002 | CAP-05 | FN-APPR | HP | P1 | approver | Multi-hat nếu có | 1. Duyệt đúng hat | Task đóng · badge giảm | UI | WF |
| TC-HRM-SV-06-APPR-FD-001 | CAP-05 | FN-APPR | FD | P0 | approver | Đã approved | 1. Approve lần 2 | 4xx | API | SM |
| TC-HRM-SV-06-APPR-AU-001 | CAP-05 | FN-APPR | AU | P0 | approver CT khác | — | 1. Approve thiếu/sai x-company-id | 409 scope | API | ATT/leave Primary class |
| TC-HRM-SV-06-APPR-UX-001 | CAP-05 | FN-APPR | UX | P1 | approver | Inbox trống | 1. Mở inbox | Empty — BLOCKED tạo nguồn từ FE · không seed | UI | U65 |
| TC-HRM-SV-06-REJ-HP-001 | CAP-05 | FN-REJ | HP | P0 | approver | Pending | 1. Từ chối + lý do đủ | 2xx rejected · F5 | UI/API | reject |
| TC-HRM-SV-06-REJ-FD-001 | CAP-05 | FN-REJ | FD | P0 | approver | — | 1. Reject không lý do / lý do ngắn | 4xx validate | API | FD |
| TC-HRM-SV-06-SELF-FD-001 | CAP-05 | FN-SELF | FD | P0 | NV=QL cùng user | Self pending | 1. Tự duyệt | Reject BR-WF-04 / tương đương | API | BR-WF-04 |
| TC-HRM-SV-06-SELF-AU-001 | CAP-05 | FN-SELF | AU | P1 | NV | — | 1. Approve API của mình | 403/422 | API | AU |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y (mutate) | Xem §4 | Optional FN ghi * |
| Auth/scope nếu đa CT | Y | AU cases | |
| SPEC_GAP ghi rõ | Y | | |
| — | — | — | Không giấu gap |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | LIKELY_IMPL — Reject + reason FD. | POST …/service-requests/:id/reject |
| FE menu/nút/role | Cần map HDSD/menu pack khi execution; design neo SRS cũ | portal / hrm-embed |
| Mobile (nếu có) | N/A wave này trừ khi surfaces ghi mobile | |
| RBAC / scope | AU bắt buộc holding vs member | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_IMPL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: HRM-SV-06
cases_designed: 31
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S5-HRM-A
```
