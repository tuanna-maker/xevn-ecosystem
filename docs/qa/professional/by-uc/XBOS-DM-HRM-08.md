# UC — `XBOS-DM-HRM-08` · Gán danh mục cho phân hệ Nhân sự

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-HRM-08` |
| **stt_phase1** | 255 |
| **mod** | M02 |
| **name_vi** | Gán danh mục cho phân hệ Nhân sự |
| **actors** | Catalog admin |
| **surfaces** | xbos-cc |
| **srs_old** | BANG_TONG_HOP STT8 |
| **srs_new** | SRS_VN target subsystem |
| **tech_spec** | TECHSPEC_HE §7–8 |
| **api_contract** | assign catalog → target=hrm |
| **author** | qa · PO-UC-TC-W1-S5-HRM-A |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Pattern XBOS-DM assign; HRM target binding FE menu pack neo only. |
| **squad** | W1-S5-HRM-A |
| **uat_done** | false |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE.


---

## 1. Mục tiêu UC (1 đoạn)

Gán danh mục cho phân hệ Nhân sự: bảo đảm actor thực hiện đúng luồng HDSD trên surface nêu trên; hệ thống validate BR/DTO, tôn trọng scope đa pháp nhân, và phản hồi FE sau 2xx + F5 quan sát được. Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Xem cấu hình / danh mục | Đọc trạng thái hiện tại | Catalog admin |
| CAP-02 | Tạo / cập nhật cấu hình | Ghi master đúng CT | Catalog admin |
| CAP-03 | Validate & phạm vi | Chặn sai BR / ngoài scope | Hệ thống |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn cấu hình | CC/HRM menu | N |
| CAP-01 | FN-LIST | List giá trị / nhóm | GET | N |
| CAP-02 | FN-CREATE | Thêm mới | POST | Y |
| CAP-02 | FN-UPDATE | Sửa | PATCH/PUT | Y |
| CAP-02 | FN-DISABLE | Ngừng / xóa mềm (nếu có) | DELETE/soft | Y |
| CAP-03 | FN-VAL | Validate bắt buộc / trùng mã | BE DTO | Y |
| CAP-03 | FN-SCOPE | Scope đa CT | header/JWT | Y |

**Đếm chức năng:** 7

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 0 | 1 | **2** |
| FN-LIST | 1 | 0 | 0 | 1 | 1 | **3** |
| FN-CREATE | 2 | 2 | 1 | 1 | 1 | **7** |
| FN-UPDATE | 1 | 2 | 0 | 1 | 1 | **5** |
| FN-DISABLE | 1 | 1 | 0 | 0 | 0 | **2** |
| FN-VAL | 0 | 2 | 1 | 0 | 0 | **3** |
| FN-SCOPE | 0 | 0 | 0 | 2 | 0 | **2** |
| **Tổng (fn plan)** | 6 | 7 | 2 | 5 | 4 | **24** |
| **Tổng (bảng §5)** | | | | | | **24** |

> Σ bàn giao Synth = **số dòng TC §5** (`24`). Fn plan dùng để kiểm coverage; lệch nhỏ do gộp optional được chấp nhận nếu §6 GAP ghi rõ.

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-DM-HRM-08-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn | Login | 1. Menu SRS → Gán danh mục cho phân hệ Nhân sự | Màn load · không 409 | UI | BANG_TONG_HOP STT8 |
| TC-XBOS-DM-HRM-08-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@ | API chậm | 1. Open | Loading rõ | UI | UX |
| TC-XBOS-DM-HRM-08-LIST-HP-001 | CAP-01 | FN-LIST | HP | P0 | HR Admin | — | 1. List | 2xx + FE bind | UI/API | assign catalog → target=hrm |
| TC-XBOS-DM-HRM-08-LIST-AU-001 | CAP-01 | FN-LIST | AU | P0 | member | Member | 1. List | Chỉ CT mình / đúng partition | UI/API | scope |
| TC-XBOS-DM-HRM-08-LIST-UX-001 | CAP-01 | FN-LIST | UX | P1 | HR | Empty | 1. CT mới | Empty hợp lệ | UI | U65 |
| TC-XBOS-DM-HRM-08-CREATE-HP-001 | CAP-02 | FN-CREATE | HP | P0 | HR Admin | Quyền đủ | 1. Thêm 2. Lưu | 2xx · row hiện · F5 còn | UI/API | assign catalog → target=hrm |
| TC-XBOS-DM-HRM-08-CREATE-HP-002 | CAP-02 | FN-CREATE | HP | P1 | ceo@ | Holding | 1. Tạo bản ghi holding-scope | Persist đúng company_id | UI/API | ADR main |
| TC-XBOS-DM-HRM-08-CREATE-FD-001 | CAP-02 | FN-CREATE | FD | P0 | HR | — | 1. Bỏ field bắt buộc 2. Lưu | 4xx validate · FE message | UI/API | DTO |
| TC-XBOS-DM-HRM-08-CREATE-FD-002 | CAP-02 | FN-CREATE | FD | P0 | HR | Mã trùng | 1. Tạo trùng code | 409/400 deterministic | API | BR unique |
| TC-XBOS-DM-HRM-08-CREATE-BD-001 | CAP-02 | FN-CREATE | BD | P1 | HR | — | 1. Độ dài mã min/max | Biên pass/fail đúng | API | BD |
| TC-XBOS-DM-HRM-08-CREATE-AU-001 | CAP-02 | FN-CREATE | AU | P0 | NV thường | Không quyền | 1. POST | 403 | API | RBAC |
| TC-XBOS-DM-HRM-08-CREATE-UX-001 | CAP-02 | FN-CREATE | UX | P1 | HR | — | 1. Lưu OK | Toast/row · nút không double-submit | UI | UX |
| TC-XBOS-DM-HRM-08-UPDATE-HP-001 | CAP-02 | FN-UPDATE | HP | P0 | HR | Có row | 1. Sửa 2. Lưu 3. F5 | 2xx · giá trị mới còn | UI/API | assign catalog → target=hrm |
| TC-XBOS-DM-HRM-08-UPDATE-FD-001 | CAP-02 | FN-UPDATE | FD | P0 | HR | Row locked/published | 1. Sửa khi không cho | 4xx BR lock | API | BR |
| TC-XBOS-DM-HRM-08-UPDATE-FD-002 | CAP-02 | FN-UPDATE | FD | P1 | HR | ID lạ | 1. PATCH uuid random | 404 | API | not found |
| TC-XBOS-DM-HRM-08-UPDATE-AU-001 | CAP-02 | FN-UPDATE | AU | P0 | member | Row CT khác | 1. PATCH | 403/409 | API | scope |
| TC-XBOS-DM-HRM-08-UPDATE-UX-001 | CAP-02 | FN-UPDATE | UX | P2 | HR | — | 1. Concurrent edit (nếu có) | Thông báo xung đột hoặc last-write documented | UI | SPEC_GAP nếu im |
| TC-XBOS-DM-HRM-08-DISABLE-HP-001 | CAP-02 | FN-DISABLE | HP | P1 | HR Admin | Row active | 1. Ngừng/xóa mềm | 2xx · không hard-delete | UI/API | soft-delete |
| TC-XBOS-DM-HRM-08-DISABLE-FD-001 | CAP-02 | FN-DISABLE | FD | P0 | HR | Đang được reference | 1. Disable | 4xx FK/in-use hoặc soft only | API | BR |
| TC-XBOS-DM-HRM-08-VAL-FD-001 | CAP-03 | FN-VAL | FD | P0 | HR | — | 1. Ký tự cấm / null | Reject | API | validation |
| TC-XBOS-DM-HRM-08-VAL-FD-002 | CAP-03 | FN-VAL | FD | P1 | HR | — | 1. Enum sai | 400 | API | DTO |
| TC-XBOS-DM-HRM-08-VAL-BD-001 | CAP-03 | FN-VAL | BD | P2 | HR | — | 1. Max length name | Biên | API | BD |
| TC-XBOS-DM-HRM-08-SCOPE-AU-001 | CAP-03 | FN-SCOPE | AU | P0 | member | — | 1. Ghi vào CT khác | 409/403 | API | scope |
| TC-XBOS-DM-HRM-08-SCOPE-AU-002 | CAP-03 | FN-SCOPE | AU | P0 | ceo@ | main | 1. Ghi holding vs member | Đúng partition JWT | API | ADR |

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
| BE API/DTO | LIKELY_PARTIAL — Pattern XBOS-DM assign; HRM target binding FE menu pack neo only. | assign catalog → target=hrm |
| FE menu/nút/role | Cần map HDSD/menu pack khi execution; design neo SRS cũ | portal / hrm-embed |
| Mobile (nếu có) | N/A wave này trừ khi surfaces ghi mobile | |
| RBAC / scope | AU bắt buộc holding vs member | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-HRM-08
cases_designed: 24
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S5-HRM-A
```
