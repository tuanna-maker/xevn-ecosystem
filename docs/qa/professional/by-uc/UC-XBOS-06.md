# UC — `UC-XBOS-06` · Truy vấn nhật ký kiểm toán

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-06` |
| **stt_phase1** | 6 |
| **mod** | M01 |
| **name_vi** | Truy vấn nhật ký kiểm toán |
| **actors** | Auditor · Admin |
| **surfaces** | api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 6 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · audit append-only |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET platform audit events · `platform-audit.controller.ts` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | `platform-audit.controller.ts` GET events. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Truy vấn nhật ký kiểm toán append-only theo bộ lọc thời gian/đối tượng.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-AUD-01 | Tra cứu audit | Xem sự kiện đã ghi | Auditor |
| CAP-AUD-02 | Bảo vệ truy cập | Chỉ role được phép | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-AUD-01 | FN-AUD-LIST | List audit events | GET events | N |
| CAP-AUD-02 | FN-AUD-AUTH | Auth audit query | JWT | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-AUD-LIST | 2 | 1 | 1 | 0 | 1 | 5 |
| FN-AUD-AUTH | 0 | 0 | 0 | 1 | 0 | 1 |
| **Tổng** | 2 | 1 | 1 | 1 | 1 | **6** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-06-LIST-HP-001 | CAP-AUD-01 | FN-AUD-LIST | HP | P0 | TENANT_ADMIN / SUPER_ADMIN | đã có sự kiện | 1. GET events from/to | 200 · sort thời gian | API | SRS_VN audit |
| TC-XBOS-06-LIST-FD-001 | CAP-AUD-01 | FN-AUD-LIST | FD | P1 | TENANT_ADMIN / SUPER_ADMIN | — | 1. from > to | 4xx | API | validate |
| TC-XBOS-06-LIST-BD-001 | CAP-AUD-01 | FN-AUD-LIST | BD | P1 | TENANT_ADMIN / SUPER_ADMIN | — | 1. Khoảng rất rộng | paginate/limit · không timeout vô hạn | API | NFR |
| TC-XBOS-06-AUTH-AU-001 | CAP-AUD-02 | FN-AUD-AUTH | AU | P0 | EMPLOYEE (NV thường) | NV | 1. GET events | 403 | API | RBAC |
| TC-XBOS-06-LIST-UX-001 | CAP-AUD-01 | FN-AUD-LIST | UX | P1 | TENANT_ADMIN / SUPER_ADMIN | không sự kiện | 1. GET khoảng trống | 200 + [] | API | empty |
| TC-XBOS-06-LIST-HP-002 | CAP-AUD-01 | FN-AUD-LIST | HP | P1 | TENANT_ADMIN / SUPER_ADMIN | sau mutate FE | 1. Mutate hợp lệ từ FE · 2. Query audit | có event append-only | API | U65 chuỗi FE |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Yes | Yes | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | Yes | N/A (read-only) | — |
| Auth/scope nếu đa CT | Yes | Yes | — |
| SPEC_GAP ghi rõ | Yes | xem code_note / FD | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | `platform-audit.controller.ts` GET events. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-06
cases_designed: 6
code_readiness: LIKELY_IMPL
```
