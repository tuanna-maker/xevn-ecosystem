# UC — `HRM-AT-10` · Tạo đơn nghỉ phép

| Meta | Value |
|------|--------|
| **uc_id** | `HRM-AT-10` |
| **stt_phase1** | 280 |
| **mod** | M05 |
| **name_vi** | Tạo đơn nghỉ phép |
| **actors** | NV ESS |
| **surfaces** | hrm-embed / mobile |
| **srs_old** | BANG_TONG_HOP STT33 · xref FR-H03 |
| **srs_new** | SRS_VN §4 leave |
| **tech_spec** | docs/hrm/TECHSPEC.md leave |
| **api_contract** | POST …/attendance/leave-requests |
| **author** | qa · PO-UC-TC-W1-S5-HRM-A |
| **design_status** | DESIGNED |
| **execution** | PASS — W4-E2 2026-08-04 U65 create POST 201 HRM-LEAVE-201 + FD · `po-uc-tc-w4-qa-e2-hrm-at-rollup.md` |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | leave-requests create + leave-workflow.controller; depth xref UC-FR-H03 — Phase1 id SoT. |
| **squad** | W1-S5-HRM-A |
| **uat_done** | false |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE.


> **Cross-ref depth (neo, không đè):** `docs/qa/professional/UC-FR-H03_LEAVE.md` — filename Phase1 `HRM-AT-10` là SoT.

---

## 1. Mục tiêu UC (1 đoạn)

Tạo đơn nghỉ phép: bảo đảm actor thực hiện đúng luồng HDSD trên surface nêu trên; hệ thống validate BR/DTO, tôn trọng scope đa pháp nhân, và phản hồi FE sau 2xx + F5 quan sát được. Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị / mở form | Đúng menu HDSD | NV ESS |
| CAP-02 | Thực thi mutate chính | Tạo đơn nghỉ phép | NV ESS |
| CAP-03 | Fail-deep nghiệp vụ | Validate · BR · SM | Hệ thống |
| CAP-04 | Phạm vi & chống gian lận | Scope · self-approve | RBAC |
| CAP-06 | Số dư / giấy tờ / notice (leave) | BR nghỉ phép | NV · Hệ thống |

**Đếm nghiệp vụ:** 5

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở UI / chọn context CT | menu HDSD | N |
| CAP-02 | FN-ACT | Hành động chính (create/update/process) | POST …/attendance/leave-requests | Y |
| CAP-02 | FN-RELOAD | F5 / navigate lại | browser | N |
| CAP-03 | FN-VAL | Validate bắt buộc & format | DTO | Y |
| CAP-03 | FN-BR | Business rule reject | Service | Y |
| CAP-03 | FN-SM | State machine illegal transition | status | Y |
| CAP-04 | FN-SCOPE | Sai công ty / header | x-company-id | Y |
| CAP-04 | FN-RBAC | Sai role | JWT role | Y |
| CAP-06 | FN-BAL | Chặn vượt số dư | leave-balance | Y |
| CAP-06 | FN-ATT | Ốm ≥3d thiếu file | attachment | Y |
| CAP-06 | FN-NOTICE | Notice ≥3 ngày lịch (nếu SRS) | create validate | Y |

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
| FN-BAL | 0 | 1 | 1 | 0 | 0 | **2** |
| FN-ATT | 0 | 2 | 1 | 0 | 0 | **3** |
| FN-NOTICE | 0 | 1 | 1 | 0 | 0 | **2** |
| **Tổng (fn plan)** | 4 | 11 | 5 | 5 | 4 | **29** |
| **Tổng (bảng §5)** | | | | | | **29** |

> Σ bàn giao Synth = **số dòng TC §5** (`29`). Fn plan dùng để kiểm coverage; lệch nhỏ do gộp optional được chấp nhận nếu §6 GAP ghi rõ.

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-HRM-AT-10-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | NV ESS / uat.nv | Login đúng persona | 1. Menu HDSD → Tạo đơn nghỉ phép | Form/list sẵn sàng · không ERROR banner | UI | U76 HDSD |
| TC-HRM-AT-10-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | NV ESS / uat.nv | — | 1. Open khi API down | Banner lỗi rõ | UI | health |
| TC-HRM-AT-10-ACT-HP-001 | CAP-02 | FN-ACT | HP | P0 | NV ESS / uat.nv | Quyền + scope CT hợp lệ; data nguồn từ FE nếu cần | 1. Nhập đủ field hợp lệ theo HDSD cho «Tạo đơn nghỉ phép» 2. Lưu/Gửi/Thực thi 3. Quan sát Network 2xx 4. F5 | 2xx + FE cập nhật + F5 còn · U65 no seed | UI/API | POST …/attendance/leave-requests |
| TC-HRM-AT-10-ACT-HP-002 | CAP-02 | FN-ACT | HP | P1 | ceo@xe.vn / member | Đổi scope CT hợp lệ | 1. Lặp happy trên CT thành viên | Persist đúng company_id | UI/API | scope |
| TC-HRM-AT-10-ACT-FD-001 | CAP-02 | FN-ACT | FD | P0 | NV ESS / uat.nv | — | 1. Submit thiếu field bắt buộc | 4xx · FE giữ form · không tạo bản ghi | UI/API | FD |
| TC-HRM-AT-10-ACT-BD-001 | CAP-02 | FN-ACT | BD | P1 | NV ESS / uat.nv | — | 1. Giờ/ngày biên (00:00, 23:59, ISO T) / số ngày = 1 | Biên pass/fail đúng SRS | UI/API | BD |
| TC-HRM-AT-10-ACT-AU-001 | CAP-02 | FN-ACT | AU | P0 | role thiếu quyền | Login low privilege | 1. Thử mutate | 403 | API | RBAC |
| TC-HRM-AT-10-ACT-UX-001 | CAP-02 | FN-ACT | UX | P1 | NV ESS / uat.nv | — | 1. Double-click Lưu | Idempotent hoặc disable nút | UI | UX |
| TC-HRM-AT-10-RELOAD-HP-001 | CAP-02 | FN-RELOAD | HP | P0 | NV ESS / uat.nv | Sau ACT-HP-001 | 1. F5 | Dữ liệu còn | UI | U65 |
| TC-HRM-AT-10-RELOAD-UX-001 | CAP-02 | FN-RELOAD | UX | P2 | NV ESS / uat.nv | — | 1. Back list → detail | Không 404 (parity) | UI | L2.5 |
| TC-HRM-AT-10-VAL-FD-001 | CAP-03 | FN-VAL | FD | P0 | NV ESS / uat.nv | — | 1. Sai format (email/date/ISO time) | 400 + message | API | DTO |
| TC-HRM-AT-10-VAL-FD-002 | CAP-03 | FN-VAL | FD | P0 | NV ESS / uat.nv | — | 1. Payload null/empty string bắt buộc | 400 | API | validation |
| TC-HRM-AT-10-VAL-BD-001 | CAP-03 | FN-VAL | BD | P2 | NV ESS / uat.nv | — | 1. Max length lý do/ghi chú | Biên | API | BD |
| TC-HRM-AT-10-BR-FD-001 | CAP-03 | FN-BR | FD | P0 | NV ESS / uat.nv | Overlap pending hoặc thiếu số dư | 1. Tạo đơn overlap ngày | Reject mã lỗi nghiệp vụ ổn định | API | BR |
| TC-HRM-AT-10-BR-FD-002 | CAP-03 | FN-BR | FD | P1 | NV ESS / uat.nv | — | 1. Trùng khóa nghiệp vụ (nếu có) | 409/400 | API | unique |
| TC-HRM-AT-10-SM-FD-001 | CAP-03 | FN-SM | FD | P0 | NV ESS / uat.nv | Bản ghi terminal | 1. Mutate lại trạng thái cấm | 4xx illegal transition | API | SM |
| TC-HRM-AT-10-SM-FD-002 | CAP-03 | FN-SM | FD | P1 | NV ESS / uat.nv | Pending | 1. Thao tác không đúng vai | 4xx | API | SM |
| TC-HRM-AT-10-SM-UX-001 | CAP-03 | FN-SM | UX | P1 | NV ESS / uat.nv | Terminal | 1. UI nút | Nút duyệt/sửa ẩn hoặc disabled | UI | UX |
| TC-HRM-AT-10-SCOPE-AU-001 | CAP-04 | FN-SCOPE | AU | P0 | member CEO | Token CT A | 1. Header CT B | 409 SCOPE_CONTEXT_MISMATCH / tương đương | API | scope |
| TC-HRM-AT-10-SCOPE-AU-002 | CAP-04 | FN-SCOPE | AU | P0 | ceo@ | Holding | 1. Thao tác bản ghi member không thuộc rollup policy | 403/409 hoặc đúng ADR | API | ADR |
| TC-HRM-AT-10-RBAC-AU-001 | CAP-04 | FN-RBAC | AU | P0 | NV ESS | Không phải approver | 1. Gọi approve/admin API | 403 | API | RBAC |
| TC-HRM-AT-10-RBAC-AU-002 | CAP-04 | FN-RBAC | AU | P1 | anon | Hết hạn JWT | 1. Mutate | 401 | API | auth |
| TC-HRM-AT-10-BAL-FD-001 | CAP-06 | FN-BAL | FD | P0 | NV | Số dư thấp | 1. Xin vượt số dư | Reject | API | FR-H03 |
| TC-HRM-AT-10-BAL-BD-001 | CAP-06 | FN-BAL | BD | P1 | NV | Còn đúng 1 ngày | 1. Xin 1 ngày | Pass biên | API | FR-H03 |
| TC-HRM-AT-10-ATT-FD-001 | CAP-06 | FN-ATT | FD | P0 | NV | Ốm ≥3 ngày | 1. Không đính kèm | Reject | API | FR-H03 |
| TC-HRM-AT-10-ATT-FD-002 | CAP-06 | FN-ATT | FD | P0 | NV | — | 1. attachment_url ngoài /api/hrm/files/ | Reject path | API | FR-H03 |
| TC-HRM-AT-10-ATT-BD-001 | CAP-06 | FN-ATT | BD | P1 | NV | Ốm đúng 3 ngày + file | 1. Submit | Pass | API | FR-H03 |
| TC-HRM-AT-10-NOTICE-FD-001 | CAP-06 | FN-NOTICE | FD | P1 | NV | Phép năm | 1. Gửi <3 ngày lịch | Reject hoặc soft-warn theo SRS — ghi SPEC_GAP nếu lệch | API | FR-H03 |
| TC-HRM-AT-10-NOTICE-BD-001 | CAP-06 | FN-NOTICE | BD | P2 | NV | Đúng 3 ngày | 1. Submit | Pass biên | API | FR-H03 |

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
| BE API/DTO | LIKELY_IMPL — leave-requests create + leave-workflow.controller; depth xref UC-FR-H03 — Phase1 id SoT. | POST …/attendance/leave-requests |
| FE menu/nút/role | Cần map HDSD/menu pack khi execution; design neo SRS cũ | portal / hrm-embed |
| Mobile (nếu có) | In-scope surface — case Layer MOBILE/API | |
| RBAC / scope | AU bắt buộc holding vs member | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_IMPL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: HRM-AT-10
cases_designed: 29
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S5-HRM-A
```
