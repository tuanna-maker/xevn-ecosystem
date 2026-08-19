# UC — `UC-XBOS-MD-01` · Quản lý chức danh (master)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-MD-01` |
| **stt_phase1** | 15 |
| **mod** | M01 |
| **name_vi** | Quản lý chức danh (master) |
| **actors** | Group admin · Master data steward |
| **surfaces** | web-portal / xbos-cc / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 15 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC · TECHSPEC M01-Master |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET/PUT/DELETE `/api/xbos/business-master/job_titles/items*` · domain whitelist |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | BE `business-master.controller.ts` domain `job_titles`; FE Settings/master theo TECHSPEC. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Quản lý master «Quản lý chức danh (master)» (list/upsert/xóa mềm) theo domain business-master, đúng scope pháp nhân.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-MD-01 | Xem danh sách | Liệt kê items domain | Admin |
| CAP-MD-02 | Thêm/sửa | Upsert item | Admin |
| CAP-MD-03 | Ngừng/xóa mềm | Không hard-delete sai | Admin |
| CAP-MD-04 | Phạm vi công ty | Không lộ/ghi ngoài scope | Hệ thống |

**Đếm nghiệp vụ:** 4

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-MD-01 | FN-MD-LIST | List items | GET …/job_titles/items | N |
| CAP-MD-02 | FN-MD-UPSERT | Create/Update item | PUT item / form Lưu | Y |
| CAP-MD-03 | FN-MD-DELETE | Soft delete / deactivate | DELETE item | Y |
| CAP-MD-04 | FN-MD-SCOPE | Scope check | company_id + JWT | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-MD-LIST | 2 | 0 | 0 | 0 | 1 | 3 |
| FN-MD-UPSERT | 2 | 2 | 1 | 1 | 0 | 6 |
| FN-MD-DELETE | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-MD-SCOPE | 0 | 0 | 0 | 1 | 0 | 1 |
| **Tổng** | 5 | 3 | 1 | 2 | 1 | **12** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-MD-01-LIST-HP-001 | CAP-MD-01 | FN-MD-LIST | HP | P0 | ceo@xe.vn (group CEO) | đã login | 1. Mở màn master tương ứng · 2. Xem lưới | 200 · lưới hiển thị · không banner ERROR | UI/API | UC-XBOS-MD-01 · business-master |
| TC-XBOS-MD-01-LIST-UX-001 | CAP-MD-01 | FN-MD-LIST | UX | P0 | ceo@xe.vn (group CEO) | domain trống | 1. Mở list | empty hợp lệ · không storm reload | UI | U65 |
| TC-XBOS-MD-01-UPSERT-HP-001 | CAP-MD-02 | FN-MD-UPSERT | HP | P0 | ceo@xe.vn (group CEO) | form | 1. Thêm item mã/tên hợp lệ · Lưu | 2xx · row mới · F5 còn | UI/API | mutate FE |
| TC-XBOS-MD-01-UPSERT-FD-001 | CAP-MD-02 | FN-MD-UPSERT | FD | P0 | ceo@xe.vn (group CEO) | form | 1. Lưu thiếu mã | 4xx · không tạo row | UI/API | validate |
| TC-XBOS-MD-01-UPSERT-FD-002 | CAP-MD-02 | FN-MD-UPSERT | FD | P0 | ceo@xe.vn (group CEO) | đã có mã | 1. Tạo trùng mã | 4xx conflict/business | API | unique |
| TC-XBOS-MD-01-UPSERT-HP-002 | CAP-MD-02 | FN-MD-UPSERT | HP | P1 | ceo@xe.vn (group CEO) | item tồn tại | 1. Sửa tên · Lưu | 2xx · F5 tên mới | UI/API | update |
| TC-XBOS-MD-01-DEL-HP-001 | CAP-MD-03 | FN-MD-DELETE | HP | P0 | ceo@xe.vn (group CEO) | item không bị khóa | 1. Ngừng/xóa mềm | 2xx · không còn active · F5 | UI/API | soft-delete |
| TC-XBOS-MD-01-DEL-FD-001 | CAP-MD-03 | FN-MD-DELETE | FD | P1 | ceo@xe.vn (group CEO) | item đang được tham chiếu | 1. Xóa | 4xx/blocked rõ | API | FK guard |
| TC-XBOS-MD-01-SCOPE-AU-001 | CAP-MD-04 | FN-MD-SCOPE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. List/ghi domain holding | 403/409 hoặc chỉ data CT mình | API | scope |
| TC-XBOS-MD-01-UPSERT-BD-001 | CAP-MD-02 | FN-MD-UPSERT | BD | P1 | ceo@xe.vn (group CEO) | — | 1. Tên dài biên / ký tự đặc biệt | validate rõ | UI | BD |
| TC-XBOS-MD-01-UPSERT-AU-001 | CAP-MD-02 | FN-MD-UPSERT | AU | P0 | EMPLOYEE (NV thường) | NV | 1. PUT item | 403 | API | RBAC |
| TC-XBOS-MD-01-LIST-HP-002 | CAP-MD-01 | FN-MD-LIST | HP | P1 | ceo@xe.vn (group CEO) | nhiều trang | 1. Đổi page size | phân trang đúng | UI | UX |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Yes | Yes | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | Yes | Yes | — |
| Auth/scope nếu đa CT | Yes | Yes | — |
| SPEC_GAP ghi rõ | Yes | xem code_note / FD | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | BE `business-master.controller.ts` domain `job_titles`; FE Settings/master theo TECHSPEC. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-MD-01
cases_designed: 12
code_readiness: LIKELY_IMPL
```
