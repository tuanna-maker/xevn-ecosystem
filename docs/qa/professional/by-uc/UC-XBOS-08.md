# UC — `UC-XBOS-08` · Thêm / sửa / xóa dữ liệu master theo lĩnh vực

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-08` |
| **stt_phase1** | 10 |
| **mod** | M01 |
| **name_vi** | Thêm / sửa / xóa dữ liệu master theo lĩnh vực |
| **actors** | Admin master data |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 10 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET domains · CRUD `/api/xbos/business-master/:domain/items` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | business-master.controller.ts GET domains + items CRUD. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

CRUD master theo domain whitelist (lĩnh vực), không domain tự do ngoài danh sách.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-BM-01 | Chọn lĩnh vực | List domains hợp lệ | Admin |
| CAP-BM-02 | CRUD theo domain | Thêm/sửa/xóa item | Admin |
| CAP-BM-03 | Chặn domain lạ | Whitelist | Hệ thống |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-BM-01 | FN-BM-DOMAINS | List domains | GET domains | N |
| CAP-BM-02 | FN-BM-UPSERT | Upsert item | PUT item | Y |
| CAP-BM-02 | FN-BM-DELETE | Delete item | DELETE | Y |
| CAP-BM-03 | FN-BM-DOMAIN-GUARD | Reject unknown domain | API | Y |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-BM-DOMAINS | 2 | 0 | 0 | 0 | 1 | 3 |
| FN-BM-UPSERT | 2 | 1 | 1 | 2 | 0 | 6 |
| FN-BM-DELETE | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-BM-DOMAIN-GUARD | 0 | 1 | 0 | 0 | 0 | 1 |
| **Tổng** | 5 | 3 | 1 | 2 | 1 | **12** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-08-DOM-HP-001 | CAP-BM-01 | FN-BM-DOMAINS | HP | P0 | ceo@xe.vn (group CEO) | login | 1. GET domains / mở Settings master | danh sách domain whitelist | API/UI | UC-XBOS-08 |
| TC-XBOS-08-UPS-HP-001 | CAP-BM-02 | FN-BM-UPSERT | HP | P0 | ceo@xe.vn (group CEO) | chọn 1 domain | 1. Thêm item · Lưu | 2xx · F5 | UI/API |  |
| TC-XBOS-08-UPS-FD-001 | CAP-BM-02 | FN-BM-UPSERT | FD | P0 | ceo@xe.vn (group CEO) | — | 1. Payload thiếu | 4xx | API |  |
| TC-XBOS-08-DEL-HP-001 | CAP-BM-02 | FN-BM-DELETE | HP | P0 | ceo@xe.vn (group CEO) | item tồn tại | 1. Xóa mềm | 2xx | API |  |
| TC-XBOS-08-DEL-FD-001 | CAP-BM-02 | FN-BM-DELETE | FD | P1 | ceo@xe.vn (group CEO) | itemId sai | 1. DELETE | 404 | API |  |
| TC-XBOS-08-GRD-FD-001 | CAP-BM-03 | FN-BM-DOMAIN-GUARD | FD | P0 | service/admin JWT | — | 1. PUT domain=evil | 4xx whitelist | API | security |
| TC-XBOS-08-UPS-AU-001 | CAP-BM-02 | FN-BM-UPSERT | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. Ghi domain tập đoàn | 403/409 | API | scope |
| TC-XBOS-08-DOM-UX-001 | CAP-BM-01 | FN-BM-DOMAINS | UX | P1 | ceo@xe.vn (group CEO) | — | 1. Mở UI domain trống items | empty OK | UI |  |
| TC-XBOS-08-UPS-BD-001 | CAP-BM-02 | FN-BM-UPSERT | BD | P1 | ceo@xe.vn (group CEO) | — | 1. code biên độ dài | validate | UI |  |
| TC-XBOS-08-UPS-HP-002 | CAP-BM-02 | FN-BM-UPSERT | HP | P1 | ceo@xe.vn (group CEO) | item có | 1. Sửa · Lưu | F5 còn | UI |  |
| TC-XBOS-08-UPS-AU-002 | CAP-BM-02 | FN-BM-UPSERT | AU | P0 | EMPLOYEE (NV thường) | NV | 1. PUT | 403 | API | RBAC |
| TC-XBOS-08-DOM-HP-002 | CAP-BM-01 | FN-BM-DOMAINS | HP | P2 | service/admin JWT | — | 1. Đổi domain liên tiếp | isolation data đúng domain | API |  |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Yes | Yes | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | Yes | Partial | — |
| Auth/scope nếu đa CT | Yes | Yes | — |
| SPEC_GAP ghi rõ | Yes | xem code_note / FD | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | business-master.controller.ts GET domains + items CRUD. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-08
cases_designed: 12
code_readiness: LIKELY_IMPL
```
