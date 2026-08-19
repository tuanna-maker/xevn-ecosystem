# UC — `UC-XBOS-ORG-02` · Thêm / sửa / xóa phòng ban (đơn vị tổ chức)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-ORG-02` |
| **stt_phase1** | 26 |
| **mod** | M01 |
| **name_vi** | Thêm / sửa / xóa phòng ban (đơn vị tổ chức) |
| **actors** | Org admin |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 26 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST/PUT/DELETE `/api/xbos/org-foundation/org-units` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | org-units CRUD trên org-foundation.controller.ts. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Thêm, sửa, xóa mềm phòng ban/đơn vị tổ chức thuộc đúng pháp nhân.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-OU-01 | Thêm phòng ban | Create OU | Admin |
| CAP-OU-02 | Sửa/xóa phòng ban | Update/Delete | Admin |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-OU-01 | FN-OU-CREATE | POST org-units | Thêm phòng ban | Y |
| CAP-OU-02 | FN-OU-UPDATE | PUT org-units | Sửa | Y |
| CAP-OU-02 | FN-OU-DELETE | DELETE org-units | Xóa | Y |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OU-CREATE | 1 | 2 | 1 | 2 | 0 | 6 |
| FN-OU-UPDATE | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-OU-DELETE | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 3 | 3 | 1 | 2 | 1 | **10** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-ORG-02-CR-HP-001 | CAP-OU-01 | FN-OU-CREATE | HP | P0 | ceo@xe.vn (group CEO) | chọn LE | 1. Thêm phòng ban mã/tên · Lưu | 2xx · cây có node · F5 | UI/API | UC-XBOS-ORG-02 |
| TC-XBOS-ORG-02-CR-FD-001 | CAP-OU-01 | FN-OU-CREATE | FD | P0 | ceo@xe.vn (group CEO) | — | 1. thiếu mã | 4xx | UI/API |  |
| TC-XBOS-ORG-02-CR-FD-002 | CAP-OU-01 | FN-OU-CREATE | FD | P0 | ceo@xe.vn (group CEO) | trùng mã | 1. tạo | 4xx | API |  |
| TC-XBOS-ORG-02-UP-HP-001 | CAP-OU-02 | FN-OU-UPDATE | HP | P0 | ceo@xe.vn (group CEO) | OU có | 1. Sửa · Lưu | F5 | UI/API |  |
| TC-XBOS-ORG-02-DEL-HP-001 | CAP-OU-02 | FN-OU-DELETE | HP | P0 | ceo@xe.vn (group CEO) | OU không con/FK | 1. Xóa mềm | 2xx · biến khỏi active | UI/API | soft-delete |
| TC-XBOS-ORG-02-DEL-FD-001 | CAP-OU-02 | FN-OU-DELETE | FD | P0 | ceo@xe.vn (group CEO) | OU có nhân sự/con | 1. Xóa | 4xx blocked | API | FK |
| TC-XBOS-ORG-02-CR-AU-001 | CAP-OU-01 | FN-OU-CREATE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. tạo OU CT khác | 403/409 | API | scope |
| TC-XBOS-ORG-02-CR-AU-002 | CAP-OU-01 | FN-OU-CREATE | AU | P0 | EMPLOYEE (NV thường) | NV | 1. POST | 403 | API |  |
| TC-XBOS-ORG-02-CR-BD-001 | CAP-OU-01 | FN-OU-CREATE | BD | P1 | ceo@xe.vn (group CEO) | — | 1. mã ký tự đặc biệt | validate | UI |  |
| TC-XBOS-ORG-02-UP-UX-001 | CAP-OU-02 | FN-OU-UPDATE | UX | P1 | ceo@xe.vn (group CEO) | sau lưu | 1. navigate list→detail | J-* OK | UI | cross-nav |

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
| BE API/DTO | org-units CRUD trên org-foundation.controller.ts. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-ORG-02
cases_designed: 10
code_readiness: LIKELY_IMPL
```
