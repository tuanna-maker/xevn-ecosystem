# UC — `HRM-EM-01` · Tạo hồ sơ nhân viên

| Meta | Value |
|------|--------|
| **uc_id** | `HRM-EM-01` |
| **stt_phase1** | 293 |
| **mod** | M05 |
| **name_vi** | Tạo hồ sơ nhân viên |
| **actors** | HRBP · HR Admin |
| **surfaces** | hrm-embed / api |
| **srs_old** | BANG_TONG_HOP EM-01 · menu HRM-EMPLOYEES neo |
| **srs_new** | SRS_VN §4 employee |
| **tech_spec** | docs/hrm/TECHSPEC.md employees |
| **api_contract** | POST /api/hrm/employees |
| **author** | qa · PO-UC-TC-W1-S5-HRM-A |
| **design_status** | DESIGNED |
| **execution** | **UI_PASS** — W4-E3 browser U65 (`PO-UC-TC-W4-QA-E3-HRM-EM`) OPEN+FD+POST 201 `HRM-EMP-201`+F5 |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | employees.controller Post(); hire path overlaps FR-B03 — Phase1 EM-01 SoT. |
| **squad** | W1-S5-HRM-A |
| **uat_done** | false |
| **evidence** | `docs/qa/evidence/po-uc-tc-w4-qa-e3-hrm-em-rollup.md` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE.


> **Cross-ref depth (neo, không đè):** `docs/qa/professional/UC-FR-B03_RECRUITMENT_WF.md (hire neo)` — filename Phase1 `HRM-EM-01` là SoT.

---

## 1. Mục tiêu UC (1 đoạn)

Tạo hồ sơ nhân viên: bảo đảm actor thực hiện đúng luồng HDSD trên surface nêu trên; hệ thống validate BR/DTO, tôn trọng scope đa pháp nhân, và phản hồi FE sau 2xx + F5 quan sát được. Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị / mở form | Đúng menu HDSD | HRBP · HR Admin |
| CAP-02 | Thực thi mutate chính | Tạo hồ sơ nhân viên | HRBP · HR Admin |
| CAP-03 | Fail-deep nghiệp vụ | Validate · BR · SM | Hệ thống |
| CAP-04 | Phạm vi & chống gian lận | Scope · self-approve | RBAC |
| CAP-06 | Liên kết master sau mutate | Dept/position/catalog | HR |

**Đếm nghiệp vụ:** 5

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở UI / chọn context CT | menu HDSD | N |
| CAP-02 | FN-ACT | Hành động chính (create/update/process) | POST /api/hrm/employees | Y |
| CAP-02 | FN-RELOAD | F5 / navigate lại | browser | N |
| CAP-03 | FN-VAL | Validate bắt buộc & format | DTO | Y |
| CAP-03 | FN-BR | Business rule reject | Service | Y |
| CAP-03 | FN-SM | State machine illegal transition | status | Y |
| CAP-04 | FN-SCOPE | Sai công ty / header | x-company-id | Y |
| CAP-04 | FN-RBAC | Sai role | JWT role | Y |
| CAP-06 | FN-LINK | Gán phòng ban / chức danh catalog | FK catalogs | Y |

**Đếm chức năng:** 9

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
| FN-LINK | 1 | 1 | 0 | 0 | 0 | **2** |
| **Tổng (fn plan)** | 5 | 8 | 2 | 5 | 4 | **24** |
| **Tổng (bảng §5)** | | | | | | **24** |

> Σ bàn giao Synth = **số dòng TC §5** (`24`). Fn plan dùng để kiểm coverage; lệch nhỏ do gộp optional được chấp nhận nếu §6 GAP ghi rõ.

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-HRM-EM-01-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | HRBP / ceo@ | Login đúng persona | 1. Menu HDSD → Tạo hồ sơ nhân viên | Form/list sẵn sàng · không ERROR banner | UI | U76 HDSD |
| TC-HRM-EM-01-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | HRBP / ceo@ | — | 1. Open khi API down | Banner lỗi rõ | UI | health |
| TC-HRM-EM-01-ACT-HP-001 | CAP-02 | FN-ACT | HP | P0 | HRBP / ceo@ | Catalog dept/pos đã có từ luồng FE/sync (không seed evidence) | 1. Nhập đủ field hợp lệ theo HDSD cho «Tạo hồ sơ nhân viên» 2. Lưu/Gửi/Thực thi 3. Quan sát Network 2xx 4. F5 | 2xx + FE cập nhật + F5 còn · U65 no seed | UI/API | POST /api/hrm/employees |
| TC-HRM-EM-01-ACT-HP-002 | CAP-02 | FN-ACT | HP | P1 | ceo@xe.vn / member | Đổi scope CT hợp lệ | 1. Lặp happy trên CT thành viên | Persist đúng company_id | UI/API | scope |
| TC-HRM-EM-01-ACT-FD-001 | CAP-02 | FN-ACT | FD | P0 | HRBP / ceo@ | — | 1. Submit thiếu field bắt buộc | 4xx · FE giữ form · không tạo bản ghi | UI/API | FD |
| TC-HRM-EM-01-ACT-BD-001 | CAP-02 | FN-ACT | BD | P1 | HRBP / ceo@ | — | 1. CCCD/email biên độ dài | Biên pass/fail đúng SRS | UI/API | BD |
| TC-HRM-EM-01-ACT-AU-001 | CAP-02 | FN-ACT | AU | P0 | role thiếu quyền | Login low privilege | 1. Thử mutate | 403 | API | RBAC |
| TC-HRM-EM-01-ACT-UX-001 | CAP-02 | FN-ACT | UX | P1 | HRBP / ceo@ | — | 1. Double-click Lưu | Idempotent hoặc disable nút | UI | UX |
| TC-HRM-EM-01-RELOAD-HP-001 | CAP-02 | FN-RELOAD | HP | P0 | HRBP / ceo@ | Sau ACT-HP-001 | 1. F5 | Dữ liệu còn | UI | U65 |
| TC-HRM-EM-01-RELOAD-UX-001 | CAP-02 | FN-RELOAD | UX | P2 | HRBP / ceo@ | — | 1. Back list → detail | Không 404 (parity) | UI | L2.5 |
| TC-HRM-EM-01-VAL-FD-001 | CAP-03 | FN-VAL | FD | P0 | HRBP / ceo@ | — | 1. Sai format (email/date/ISO time) | 400 + message | API | DTO |
| TC-HRM-EM-01-VAL-FD-002 | CAP-03 | FN-VAL | FD | P0 | HRBP / ceo@ | — | 1. Payload null/empty string bắt buộc | 400 | API | validation |
| TC-HRM-EM-01-VAL-BD-001 | CAP-03 | FN-VAL | BD | P2 | HRBP / ceo@ | — | 1. Max length lý do/ghi chú | Biên | API | BD |
| TC-HRM-EM-01-BR-FD-001 | CAP-03 | FN-BR | FD | P0 | HRBP / ceo@ | Điều kiện BR sai | 1. Thao tác vi phạm BR đã biết trong SRS/TechSpec | Reject mã lỗi nghiệp vụ ổn định | API | BR |
| TC-HRM-EM-01-BR-FD-002 | CAP-03 | FN-BR | FD | P1 | HRBP / ceo@ | — | 1. Trùng khóa nghiệp vụ (nếu có) | 409/400 | API | unique |
| TC-HRM-EM-01-SM-FD-001 | CAP-03 | FN-SM | FD | P0 | HRBP / ceo@ | Bản ghi terminal | 1. Mutate lại trạng thái cấm | 4xx illegal transition | API | SM |
| TC-HRM-EM-01-SM-FD-002 | CAP-03 | FN-SM | FD | P1 | HRBP / ceo@ | Pending | 1. Thao tác không đúng vai | 4xx | API | SM |
| TC-HRM-EM-01-SM-UX-001 | CAP-03 | FN-SM | UX | P1 | HRBP / ceo@ | Terminal | 1. UI nút | Nút duyệt/sửa ẩn hoặc disabled | UI | UX |
| TC-HRM-EM-01-SCOPE-AU-001 | CAP-04 | FN-SCOPE | AU | P0 | member CEO | Token CT A | 1. Header CT B | 409 SCOPE_CONTEXT_MISMATCH / tương đương | API | scope |
| TC-HRM-EM-01-SCOPE-AU-002 | CAP-04 | FN-SCOPE | AU | P0 | ceo@ | Holding | 1. Thao tác bản ghi member không thuộc rollup policy | 403/409 hoặc đúng ADR | API | ADR |
| TC-HRM-EM-01-RBAC-AU-001 | CAP-04 | FN-RBAC | AU | P0 | NV ESS | Không phải approver | 1. Gọi approve/admin API | 403 | API | RBAC |
| TC-HRM-EM-01-RBAC-AU-002 | CAP-04 | FN-RBAC | AU | P1 | anon | Hết hạn JWT | 1. Mutate | 401 | API | auth |
| TC-HRM-EM-01-LINK-HP-001 | CAP-06 | FN-LINK | HP | P0 | HRBP | Catalog dept/pos đã sync | 1. Chọn PB/chức danh 2. Lưu | FK hợp lệ · FE hiển thị tên | UI/API | catalog |
| TC-HRM-EM-01-LINK-FD-001 | CAP-06 | FN-LINK | FD | P0 | HRBP | Pos không thuộc CT | 1. Gán sai catalog | 4xx assert catalog | API | JD/pos class |

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
| BE API/DTO | LIKELY_IMPL — employees.controller Post(); hire path overlaps FR-B03 — Phase1 EM-01 SoT. | POST /api/hrm/employees |
| FE menu/nút/role | Cần map HDSD/menu pack khi execution; design neo SRS cũ | portal / hrm-embed |
| Mobile (nếu có) | N/A wave này trừ khi surfaces ghi mobile | |
| RBAC / scope | AU bắt buộc holding vs member | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_IMPL`

---

## 8. Handoff

```
ack_status: PASS_TO_PM
uc_id: HRM-EM-01
cases_designed: 24
execution: UI_PASS
uat_done: false
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W4-QA-E3-HRM-EM
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-e3-hrm-em-rollup.md
```
