# UC — `HRM-NT-01` · Đánh dấu thông báo đã đọc

| Meta | Value |
|------|--------|
| **uc_id** | `HRM-NT-01` |
| **stt_phase1** | 291 |
| **mod** | M05 |
| **name_vi** | Đánh dấu thông báo đã đọc |
| **actors** | NV · QL |
| **surfaces** | hrm-embed / mobile / api |
| **srs_old** | BANG_TONG_HOP NT-01 |
| **srs_new** | SRS_VN mark read |
| **tech_spec** | TECHSPEC notifications |
| **api_contract** | PATCH …/inbox/:id/read |
| **author** | qa · PO-UC-TC-W1-S5-HRM-A |
| **design_status** | DESIGNED |
| **execution** | **PASS** (R4) — GET/list OK · personal mark PATCH **HRM-NOTIF-202** with UUID `company_id` · broadcast CTA hidden · `ceo@` → **EXPECTED_NO_INBOX** (§10) · `uat_done` false |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | Patch read endpoint. |
| **squad** | W1-S5-HRM-A |
| **uat_done** | false |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE.


---

## 1. Mục tiêu UC (1 đoạn)

Đánh dấu thông báo đã đọc: bảo đảm actor thực hiện đúng luồng HDSD trên surface nêu trên; hệ thống validate BR/DTO, tôn trọng scope đa pháp nhân, và phản hồi FE sau 2xx + F5 quan sát được. Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị / mở form | Đúng menu HDSD | NV · QL |
| CAP-02 | Thực thi mutate chính | Đánh dấu thông báo đã đọc | NV · QL |
| CAP-03 | Fail-deep nghiệp vụ | Validate · BR · SM | Hệ thống |
| CAP-04 | Phạm vi & chống gian lận | Scope · self-approve | RBAC |

**Đếm nghiệp vụ:** 4

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở UI / chọn context CT | menu HDSD | N |
| CAP-02 | FN-ACT | Hành động chính (create/update/process) | PATCH …/inbox/:id/read | Y |
| CAP-02 | FN-RELOAD | F5 / navigate lại | browser | N |
| CAP-03 | FN-VAL | Validate bắt buộc & format | DTO | Y |
| CAP-03 | FN-BR | Business rule reject | Service | Y |
| CAP-03 | FN-SM | State machine illegal transition | status | Y |
| CAP-04 | FN-SCOPE | Sai công ty / header | x-company-id | Y |
| CAP-04 | FN-RBAC | Sai role | JWT role | Y |

**Đếm chức năng:** 8

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
| **Tổng (fn plan)** | 4 | 7 | 2 | 5 | 4 | **22** |
| **Tổng (bảng §5)** | | | | | | **22** |

> Σ bàn giao Synth = **số dòng TC §5** (`22`). Fn plan dùng để kiểm coverage; lệch nhỏ do gộp optional được chấp nhận nếu §6 GAP ghi rõ.

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-HRM-NT-01-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | HR / ceo@xe.vn | Login đúng persona | 1. Menu HDSD → Đánh dấu thông báo đã đọc | Form/list sẵn sàng · không ERROR banner | UI | U76 HDSD |
| TC-HRM-NT-01-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | HR / ceo@xe.vn | — | 1. Open khi API down | Banner lỗi rõ | UI | health |
| TC-HRM-NT-01-ACT-HP-001 | CAP-02 | FN-ACT | HP | P0 | HR / ceo@xe.vn | Quyền + scope CT hợp lệ; data nguồn từ FE nếu cần | 1. Nhập đủ field hợp lệ theo HDSD cho «Đánh dấu thông báo đã đọc» 2. Lưu/Gửi/Thực thi 3. Quan sát Network 2xx 4. F5 | 2xx + FE cập nhật + F5 còn · U65 no seed | UI/API | PATCH …/inbox/:id/read |
| TC-HRM-NT-01-ACT-HP-002 | CAP-02 | FN-ACT | HP | P1 | ceo@xe.vn / member | Đổi scope CT hợp lệ | 1. Lặp happy trên CT thành viên | Persist đúng company_id | UI/API | scope |
| TC-HRM-NT-01-ACT-FD-001 | CAP-02 | FN-ACT | FD | P0 | HR / ceo@xe.vn | — | 1. Submit thiếu field bắt buộc | 4xx · FE giữ form · không tạo bản ghi | UI/API | FD |
| TC-HRM-NT-01-ACT-BD-001 | CAP-02 | FN-ACT | BD | P1 | HR / ceo@xe.vn | — | 1. Giá trị biên số/ngày/độ dài | Biên pass/fail đúng SRS | UI/API | BD |
| TC-HRM-NT-01-ACT-AU-001 | CAP-02 | FN-ACT | AU | P0 | role thiếu quyền | Login low privilege | 1. Thử mutate | 403 | API | RBAC |
| TC-HRM-NT-01-ACT-UX-001 | CAP-02 | FN-ACT | UX | P1 | HR / ceo@xe.vn | — | 1. Double-click Lưu | Idempotent hoặc disable nút | UI | UX |
| TC-HRM-NT-01-RELOAD-HP-001 | CAP-02 | FN-RELOAD | HP | P0 | HR / ceo@xe.vn | Sau ACT-HP-001 | 1. F5 | Dữ liệu còn | UI | U65 |
| TC-HRM-NT-01-RELOAD-UX-001 | CAP-02 | FN-RELOAD | UX | P2 | HR / ceo@xe.vn | — | 1. Back list → detail | Không 404 (parity) | UI | L2.5 |
| TC-HRM-NT-01-VAL-FD-001 | CAP-03 | FN-VAL | FD | P0 | HR / ceo@xe.vn | — | 1. Sai format (email/date/ISO time) | 400 + message | API | DTO |
| TC-HRM-NT-01-VAL-FD-002 | CAP-03 | FN-VAL | FD | P0 | HR / ceo@xe.vn | — | 1. Payload null/empty string bắt buộc | 400 | API | validation |
| TC-HRM-NT-01-VAL-BD-001 | CAP-03 | FN-VAL | BD | P2 | HR / ceo@xe.vn | — | 1. Max length lý do/ghi chú | Biên | API | BD |
| TC-HRM-NT-01-BR-FD-001 | CAP-03 | FN-BR | FD | P0 | HR / ceo@xe.vn | Điều kiện BR sai | 1. Thao tác vi phạm BR đã biết trong SRS/TechSpec | Reject mã lỗi nghiệp vụ ổn định | API | BR |
| TC-HRM-NT-01-BR-FD-002 | CAP-03 | FN-BR | FD | P1 | HR / ceo@xe.vn | — | 1. Trùng khóa nghiệp vụ (nếu có) | 409/400 | API | unique |
| TC-HRM-NT-01-SM-FD-001 | CAP-03 | FN-SM | FD | P0 | HR / ceo@xe.vn | Bản ghi terminal | 1. Mutate lại trạng thái cấm | 4xx illegal transition | API | SM |
| TC-HRM-NT-01-SM-FD-002 | CAP-03 | FN-SM | FD | P1 | HR / ceo@xe.vn | Pending | 1. Thao tác không đúng vai | 4xx | API | SM |
| TC-HRM-NT-01-SM-UX-001 | CAP-03 | FN-SM | UX | P1 | HR / ceo@xe.vn | Terminal | 1. UI nút | Nút duyệt/sửa ẩn hoặc disabled | UI | UX |
| TC-HRM-NT-01-SCOPE-AU-001 | CAP-04 | FN-SCOPE | AU | P0 | member CEO | Token CT A | 1. Header CT B | 409 SCOPE_CONTEXT_MISMATCH / tương đương | API | scope |
| TC-HRM-NT-01-SCOPE-AU-002 | CAP-04 | FN-SCOPE | AU | P0 | ceo@ | Holding | 1. Thao tác bản ghi member không thuộc rollup policy | 403/409 hoặc đúng ADR | API | ADR |
| TC-HRM-NT-01-RBAC-AU-001 | CAP-04 | FN-RBAC | AU | P0 | NV ESS | Không phải approver | 1. Gọi approve/admin API | 403 | API | RBAC |
| TC-HRM-NT-01-RBAC-AU-002 | CAP-04 | FN-RBAC | AU | P1 | anon | Hết hạn JWT | 1. Mutate | 401 | API | auth |

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
| BE API/DTO | LIKELY_IMPL — Patch read endpoint. | PATCH …/inbox/:id/read |
| FE menu/nút/role | Cần map HDSD/menu pack khi execution; design neo SRS cũ | portal / hrm-embed |
| Mobile (nếu có) | In-scope surface — case Layer MOBILE/API | |
| RBAC / scope | AU bắt buộc holding vs member | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_IMPL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: HRM-NT-01
cases_designed: 22
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S5-HRM-A
```

---

## 9. Execution stamp (QA W4-B3)

```
execution: PASS (R4 retest after FE mark company UUID)
uat_done: false
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-R4
evidence: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r4.md
p0_list: PASS — GET inbox 200 HRM-NOTIF-200 + list visible
p0_act_hp: PASS — PATCH company_id=UUID → 200 HRM-NOTIF-202; FE + F5; broadcast CTA hidden
ceo_spot: EXPECTED_NO_INBOX (AC-NT01-CEO-01 PASS)
residual: none P0 for NT-01 mark UUID (CLOSED R-W4-B3-NT01-MARK-COMPANY-UUID + MARK-BROADCAST-CTA)
prior: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r3.md · po-uc-tc-w4-fe-nt01-mark-company-uuid-01.md
```

---

## 10. BA delta — Group CEO without `employee_id` (`PO-UC-TC-W4-BA-NT01-CEO-EMPLOYEE-ID-01`)

**Evidence:** `docs/qa/evidence/po-uc-tc-w4-ba-nt01-ceo-employee-id-01.md`

| AC-ID | Rule | Pass | Fail |
|-------|------|------|------|
| **AC-NT01-PERSONA-01** | HP P0 = **NV/QL** có `employee_id` UUID — **not** `ceo@` sole HP | `uat.nv0007@xe.vn` hoặc `uat.nv####` + U65 fanout | NT-01 PASS chỉ với `ceo@` |
| **AC-NT01-CEO-01** | `ceo@xe.vn` không employee binding → **EXPECTED_NO_INBOX** (skip inbox UC) | QA verdict EXPECTED_NO_INBOX | FAIL product vì inbox 0 under ceo@ |
| **AC-NT01-API-01** | Thiếu `employee_id` UUID → validation 4xx (UC-HRM-12) | FD probe | Empty list 200 without UUID |
| **AC-NT01-LIST-01** | Viewer UUID hợp lệ → broadcast NULL **+** tin đích viewer | List UI/API | ceo@-only test |
| **AC-NT01-MARK-01** | PATCH read HP = tin **cá nhân** (`recipient = viewer`); broadcast mark = **SPEC_GAP** AS-IS | ACT-HP NV sau duyệt/từ chối | Mark broadcast NULL without spec |
| **AC-NT01-U65-01** | Inbox row từ FE mutate — zero-seed | U65 | Seed inbox |

**Option lock:** **A** (EXPECTED_NO_INBOX for ceo@) · **B** chỉ khi đã có viewer UUID · **C** (ops map ceo→employee) **không** bắt buộc pilot.

**TC persona note (§5):** P0 OPEN/ACT-HP rows ghi `ceo@` = **scope/AU slice only**; thay HP thực thi bằng **`uat.nv0007@xe.vn`** (`trsport`, NV ESS) sau FE-origin notification.
