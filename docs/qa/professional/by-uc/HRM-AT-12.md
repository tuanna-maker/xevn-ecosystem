# UC — `HRM-AT-12` · Phê duyệt đơn nghỉ phép

| Meta | Value |
|------|--------|
| **uc_id** | `HRM-AT-12` |
| **stt_phase1** | 282 |
| **mod** | M05 |
| **name_vi** | Phê duyệt đơn nghỉ phép |
| **actors** | QL L1 · (L2 SPEC_GAP) |
| **surfaces** | hrm-embed / mobile / inbox |
| **srs_old** | BANG_TONG_HOP STT35 · xref FR-H03 |
| **srs_new** | SRS_VN leave approve |
| **tech_spec** | TECHSPEC leave |
| **api_contract** | POST …/leave-requests/:id/approve |
| **author** | qa · PO-UC-TC-W1-S5-HRM-A |
| **design_status** | DESIGNED |
| **execution** | **PARTIAL** L1 PASS / L2=SPEC_GAP — W4-E2-R4 (`PO-UC-TC-W4-QA-E2-HRM-AT-R4-AT12-L1`): QL `uat.nv0002@trsport` · `Chờ duyệt (1)` · Duyệt → POST approve **201** `HRM-LEAVE-203` · `x-company-id=trsport` (not main) · FE **Đã duyệt** + F5. R3 FAIL scope CLOSED. BA EXPECTED_NO_CTA for ceo@ **stands**. FE create still BLOCKED (leave_types empty). evidence `po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md` · FE `po-uc-tc-w4-fe-at12-l1-approve-scope-01.md` |
| **code_readiness** | `LIKELY_PARTIAL` — L1 approve evidenced; L2 SPEC_GAP · **không** = UAT PASS |
| **code_note** | L1 Duyệt CTA + mutate scope OK (`resolveHrmMutateCompanyScope`). Residual **R-W4-AT12-L1-APPROVE-SCOPE CLOSED**. Leave L2 SPEC_GAP — do not invent PASS. AT-07 untouched. CREATE-CATALOG P1 open. |
| **squad** | W1-S5-HRM-A |
| **uat_done** | false |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE.


> **Cross-ref depth (neo, không đè):** `docs/qa/professional/UC-FR-H03_LEAVE.md` — filename Phase1 `HRM-AT-12` là SoT.

---

## 1. Mục tiêu UC (1 đoạn)

Phê duyệt đơn nghỉ phép: bảo đảm actor thực hiện đúng luồng HDSD trên surface nêu trên; hệ thống validate BR/DTO, tôn trọng scope đa pháp nhân, và phản hồi FE sau 2xx + F5 quan sát được. Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị / mở form | Đúng menu HDSD | QL L1 · (L2 SPEC_GAP) |
| CAP-02 | Thực thi mutate chính | Phê duyệt đơn nghỉ phép | QL L1 · (L2 SPEC_GAP) |
| CAP-03 | Fail-deep nghiệp vụ | Validate · BR · SM | Hệ thống |
| CAP-04 | Phạm vi & chống gian lận | Scope · self-approve | RBAC |
| CAP-05 | Phê duyệt / từ chối / inbox | Hoàn tất bước | Approver |
| CAP-06 | Số dư / giấy tờ / notice (leave) | BR nghỉ phép | NV · Hệ thống |

**Đếm nghiệp vụ:** 6

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở UI / chọn context CT | menu HDSD | N |
| CAP-02 | FN-ACT | Hành động chính (create/update/process) | POST …/leave-requests/:id/approve | Y |
| CAP-02 | FN-RELOAD | F5 / navigate lại | browser | N |
| CAP-03 | FN-VAL | Validate bắt buộc & format | DTO | Y |
| CAP-03 | FN-BR | Business rule reject | Service | Y |
| CAP-03 | FN-SM | State machine illegal transition | status | Y |
| CAP-04 | FN-SCOPE | Sai công ty / header | x-company-id | Y |
| CAP-04 | FN-RBAC | Sai role | JWT role | Y |
| CAP-05 | FN-APPR | Duyệt | approve API/UI | Y |
| CAP-05 | FN-REJ | Từ chối + lý do | reject API/UI | Y |
| CAP-05 | FN-SELF | Chặn tự duyệt | BR-WF-04 | Y |
| CAP-06 | FN-BAL | Chặn vượt số dư | leave-balance | Y |
| CAP-06 | FN-ATT | Ốm ≥3d thiếu file | attachment | Y |
| CAP-06 | FN-NOTICE | Notice ≥3 ngày lịch (nếu SRS) | create validate | Y |

**Đếm chức năng:** 14

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
| FN-BAL | 0 | 1 | 1 | 0 | 0 | **2** |
| FN-ATT | 0 | 2 | 1 | 0 | 0 | **3** |
| FN-NOTICE | 0 | 1 | 1 | 0 | 0 | **2** |
| **Tổng (fn plan)** | 7 | 14 | 5 | 7 | 5 | **38** |
| **Tổng (bảng §5)** | | | | | | **39** |

> Σ bàn giao Synth = **số dòng TC §5** (`39`). Fn plan dùng để kiểm coverage; lệch nhỏ do gộp optional được chấp nhận nếu §6 GAP ghi rõ.

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-HRM-AT-12-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | QL / manager | Login đúng persona | 1. Menu HDSD → Phê duyệt đơn nghỉ phép | Form/list sẵn sàng · không ERROR banner | UI | U76 HDSD |
| TC-HRM-AT-12-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | QL / manager | — | 1. Open khi API down | Banner lỗi rõ | UI | health |
| TC-HRM-AT-12-ACT-HP-001 | CAP-02 | FN-ACT | HP | P0 | QL / manager | Nguồn pending tạo từ FE trước (U65 — cấm seed inbox) | 1. Nhập đủ field hợp lệ theo HDSD cho «Phê duyệt đơn nghỉ phép» 2. Lưu/Gửi/Thực thi 3. Quan sát Network 2xx 4. F5 | 2xx + FE cập nhật + F5 còn · U65 no seed | UI/API | POST …/leave-requests/:id/approve |
| TC-HRM-AT-12-ACT-HP-002 | CAP-02 | FN-ACT | HP | P1 | ceo@xe.vn / member | Đổi scope CT hợp lệ | 1. Lặp happy trên CT thành viên | Persist đúng company_id | UI/API | scope |
| TC-HRM-AT-12-ACT-FD-001 | CAP-02 | FN-ACT | FD | P0 | QL / manager | — | 1. Submit thiếu field bắt buộc | 4xx · FE giữ form · không tạo bản ghi | UI/API | FD |
| TC-HRM-AT-12-ACT-BD-001 | CAP-02 | FN-ACT | BD | P1 | QL / manager | — | 1. Giờ/ngày biên (00:00, 23:59, ISO T) / số ngày = 1 | Biên pass/fail đúng SRS | UI/API | BD |
| TC-HRM-AT-12-ACT-AU-001 | CAP-02 | FN-ACT | AU | P0 | role thiếu quyền | Login low privilege | 1. Thử mutate | 403 | API | RBAC |
| TC-HRM-AT-12-ACT-UX-001 | CAP-02 | FN-ACT | UX | P1 | QL / manager | — | 1. Double-click Lưu | Idempotent hoặc disable nút | UI | UX |
| TC-HRM-AT-12-RELOAD-HP-001 | CAP-02 | FN-RELOAD | HP | P0 | QL / manager | Sau ACT-HP-001 | 1. F5 | Dữ liệu còn | UI | U65 |
| TC-HRM-AT-12-RELOAD-UX-001 | CAP-02 | FN-RELOAD | UX | P2 | QL / manager | — | 1. Back list → detail | Không 404 (parity) | UI | L2.5 |
| TC-HRM-AT-12-VAL-FD-001 | CAP-03 | FN-VAL | FD | P0 | QL / manager | — | 1. Sai format (email/date/ISO time) | 400 + message | API | DTO |
| TC-HRM-AT-12-VAL-FD-002 | CAP-03 | FN-VAL | FD | P0 | QL / manager | — | 1. Payload null/empty string bắt buộc | 400 | API | validation |
| TC-HRM-AT-12-VAL-BD-001 | CAP-03 | FN-VAL | BD | P2 | QL / manager | — | 1. Max length lý do/ghi chú | Biên | API | BD |
| TC-HRM-AT-12-BR-FD-001 | CAP-03 | FN-BR | FD | P0 | QL / manager | Điều kiện BR sai | 1. Thao tác vi phạm BR đã biết trong SRS/TechSpec | Reject mã lỗi nghiệp vụ ổn định | API | BR |
| TC-HRM-AT-12-BR-FD-002 | CAP-03 | FN-BR | FD | P1 | QL / manager | — | 1. Trùng khóa nghiệp vụ (nếu có) | 409/400 | API | unique |
| TC-HRM-AT-12-SM-FD-001 | CAP-03 | FN-SM | FD | P0 | QL / manager | Bản ghi terminal | 1. Mutate lại trạng thái cấm | 4xx illegal transition | API | SM |
| TC-HRM-AT-12-SM-FD-002 | CAP-03 | FN-SM | FD | P1 | QL / manager | Pending | 1. Thao tác không đúng vai | 4xx | API | SM |
| TC-HRM-AT-12-SM-UX-001 | CAP-03 | FN-SM | UX | P1 | QL / manager | Terminal | 1. UI nút | Nút duyệt/sửa ẩn hoặc disabled | UI | UX |
| TC-HRM-AT-12-SCOPE-AU-001 | CAP-04 | FN-SCOPE | AU | P0 | member CEO | Token CT A | 1. Header CT B | 409 SCOPE_CONTEXT_MISMATCH / tương đương | API | scope |
| TC-HRM-AT-12-SCOPE-AU-002 | CAP-04 | FN-SCOPE | AU | P0 | ceo@ | Holding | 1. Thao tác bản ghi member không thuộc rollup policy | 403/409 hoặc đúng ADR | API | ADR |
| TC-HRM-AT-12-RBAC-AU-001 | CAP-04 | FN-RBAC | AU | P0 | NV ESS | Không phải approver | 1. Gọi approve/admin API | 403 | API | RBAC |
| TC-HRM-AT-12-RBAC-AU-002 | CAP-04 | FN-RBAC | AU | P1 | anon | Hết hạn JWT | 1. Mutate | 401 | API | auth |
| TC-HRM-AT-12-APPR-HP-001 | CAP-05 | FN-APPR | HP | P0 | QL/approver | Có đơn pending từ FE (không seed) | 1. Mở list/inbox 2. Duyệt | 2xx · status approved · F5 | UI/API | POST …/leave-requests/:id/approve |
| TC-HRM-AT-12-APPR-HP-002 | CAP-05 | FN-APPR | HP | P1 | approver | Multi-hat nếu có | 1. Duyệt đúng hat | Task đóng · badge giảm | UI | WF |
| TC-HRM-AT-12-APPR-FD-001 | CAP-05 | FN-APPR | FD | P0 | approver | Đã approved | 1. Approve lần 2 | 4xx | API | SM |
| TC-HRM-AT-12-APPR-AU-001 | CAP-05 | FN-APPR | AU | P0 | approver CT khác | — | 1. Approve thiếu/sai x-company-id | 409 scope | API | ATT/leave Primary class |
| TC-HRM-AT-12-APPR-UX-001 | CAP-05 | FN-APPR | UX | P1 | approver | Inbox trống | 1. Mở inbox | Empty — BLOCKED tạo nguồn từ FE · không seed | UI | U65 |
| TC-HRM-AT-12-REJ-HP-001 | CAP-05 | FN-REJ | HP | P0 | approver | Pending | 1. Từ chối + lý do đủ | 2xx rejected · F5 | UI/API | reject |
| TC-HRM-AT-12-REJ-FD-001 | CAP-05 | FN-REJ | FD | P0 | approver | — | 1. Reject không lý do / lý do ngắn | 4xx validate | API | FD |
| TC-HRM-AT-12-SELF-FD-001 | CAP-05 | FN-SELF | FD | P0 | NV=QL cùng user | Self pending | 1. Tự duyệt | Reject BR-WF-04 / tương đương | API | BR-WF-04 |
| TC-HRM-AT-12-SELF-AU-001 | CAP-05 | FN-SELF | AU | P1 | NV | — | 1. Approve API của mình | 403/422 | API | AU |
| TC-HRM-AT-12-BAL-FD-001 | CAP-06 | FN-BAL | FD | P0 | NV | Số dư thấp | 1. Xin vượt số dư | Reject | API | FR-H03 |
| TC-HRM-AT-12-BAL-BD-001 | CAP-06 | FN-BAL | BD | P1 | NV | Còn đúng 1 ngày | 1. Xin 1 ngày | Pass biên | API | FR-H03 |
| TC-HRM-AT-12-ATT-FD-001 | CAP-06 | FN-ATT | FD | P0 | NV | Ốm ≥3 ngày | 1. Không đính kèm | Reject | API | FR-H03 |
| TC-HRM-AT-12-ATT-FD-002 | CAP-06 | FN-ATT | FD | P0 | NV | — | 1. attachment_url ngoài /api/hrm/files/ | Reject path | API | FR-H03 |
| TC-HRM-AT-12-ATT-BD-001 | CAP-06 | FN-ATT | BD | P1 | NV | Ốm đúng 3 ngày + file | 1. Submit | Pass | API | FR-H03 |
| TC-HRM-AT-12-NOTICE-FD-001 | CAP-06 | FN-NOTICE | FD | P1 | NV | Phép năm | 1. Gửi <3 ngày lịch | Reject hoặc soft-warn theo SRS — ghi SPEC_GAP nếu lệch | API | FR-H03 |
| TC-HRM-AT-12-NOTICE-BD-001 | CAP-06 | FN-NOTICE | BD | P2 | NV | Đúng 3 ngày | 1. Submit | Pass biên | API | FR-H03 |
| TC-HRM-AT-12-L2-UX-001 | CAP-05 | FN-APPR | UX | P0 | L2 | Đơn vượt ngưỡng L2 | 1. Tìm bước L2 | SPEC_GAP AS-IS 1 bước — case BLOCKED design · không claim PASS | UI | FR-H03 SPEC_GAP |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y (mutate) | Xem §4 | Optional FN ghi * |
| Auth/scope nếu đa CT | Y | AU cases | |
| SPEC_GAP ghi rõ | Y | | |
| L2 leave ladder | SRS exemplar FR-H03 | AS-IS 1 bước | **SPEC_GAP** — không PASS |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | LIKELY_PARTIAL — L1 approve IMPL; L2 ladder SPEC_GAP per exemplar FR-H03 — do not invent PASS. | POST …/leave-requests/:id/approve |
| FE menu/nút/role | Duyệt on Chờ duyệt for QL · POST approve **201** + `x-company-id=trsport` (R4). Group CEO ≠ L1 HP (BA EXPECTED_NO_CTA). L2 SPEC_GAP | `po-uc-tc-w4-qa-e2-hrm-at-r4-at12.md` · `po-uc-tc-w4-ba-at12-l1-cta-01.md` |
| Mobile (nếu có) | In-scope surface — case Layer MOBILE/API · J-MOB manager Cần duyệt | |
| RBAC / scope | AU bắt buộc holding vs member; L1 resolver `direct_manager` + hrbp fallback | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · UC-FR-H03 |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: HRM-AT-12
cases_designed: 39
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S5-HRM-A
```
