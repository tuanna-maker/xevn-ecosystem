# UC — `UC-XBOS-ORG-01` · Xem và sửa cây pháp nhân / đơn vị tổ chức

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-ORG-01` |
| **stt_phase1** | 25 |
| **mod** | M01 |
| **name_vi** | Xem và sửa cây pháp nhân / đơn vị tổ chức |
| **actors** | Group CEO · Org admin |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 25 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET `/api/xbos/org-foundation/org-units/tree` · PUT org-units |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | org-foundation org-units/tree + legal-entities. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Xem và chỉnh cây pháp nhân/đơn vị tổ chức tập đoàn đúng quan hệ cha–con.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-ORG-01 | Xem cây | Tree view | CEO |
| CAP-ORG-02 | Sửa nút cây | Đổi thuộc tính đơn vị | Admin |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-ORG-01 | FN-ORG-TREE | GET tree | Cây tổ chức | N |
| CAP-ORG-02 | FN-ORG-UPDATE | PUT org-unit | Sửa · Lưu | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-ORG-TREE | 2 | 0 | 0 | 1 | 2 | 5 |
| FN-ORG-UPDATE | 1 | 2 | 1 | 1 | 0 | 5 |
| **Tổng** | 3 | 2 | 1 | 2 | 2 | **10** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-ORG-01-TREE-HP-001 | CAP-ORG-01 | FN-ORG-TREE | HP | P0 | ceo@xe.vn (group CEO) | login main | 1. Mở Cây tổ chức | tree load · holding+members | UI/API | UC-XBOS-ORG-01 |
| TC-XBOS-ORG-01-TREE-UX-001 | CAP-ORG-01 | FN-ORG-TREE | UX | P1 | ceo@xe.vn (group CEO) | — | 1. Expand/collapse | không mất selection | UI |  |
| TC-XBOS-ORG-01-UPD-HP-001 | CAP-ORG-02 | FN-ORG-UPDATE | HP | P0 | ceo@xe.vn (group CEO) | chọn nút | 1. Sửa tên đơn vị · Lưu | 2xx · F5 · cây cập nhật | UI/API |  |
| TC-XBOS-ORG-01-UPD-FD-001 | CAP-ORG-02 | FN-ORG-UPDATE | FD | P0 | ceo@xe.vn (group CEO) | — | 1. Lưu tên rỗng | 4xx | UI/API |  |
| TC-XBOS-ORG-01-TREE-AU-001 | CAP-ORG-01 | FN-ORG-TREE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. Xem cây | chỉ CT mình / không full holding nếu policy | UI/API | scope |
| TC-XBOS-ORG-01-UPD-AU-001 | CAP-ORG-02 | FN-ORG-UPDATE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. Sửa nút holding | 403/409 | API |  |
| TC-XBOS-ORG-01-TREE-HP-002 | CAP-ORG-01 | FN-ORG-TREE | HP | P1 | ceo@xe.vn (group CEO) | click node | 1. Click pháp nhân → chi tiết | deep link OK | UI | J-* |
| TC-XBOS-ORG-01-UPD-FD-002 | CAP-ORG-02 | FN-ORG-UPDATE | FD | P1 | ceo@xe.vn (group CEO) | cycle parent | 1. đặt cha tạo vòng | 4xx | API | tree integrity |
| TC-XBOS-ORG-01-UPD-BD-001 | CAP-ORG-02 | FN-ORG-UPDATE | BD | P2 | ceo@xe.vn (group CEO) | — | 1. tên max length | validate | UI |  |
| TC-XBOS-ORG-01-TREE-UX-002 | CAP-ORG-01 | FN-ORG-TREE | UX | P1 | ceo@xe.vn (group CEO) | API chậm | 1. mở cây | loading rồi data/error | UI |  |

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
| BE API/DTO | org-foundation org-units/tree + legal-entities. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-ORG-01
cases_designed: 10
code_readiness: LIKELY_IMPL
```
