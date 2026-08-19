# UC — `UC-XBOS-AR-03` · Chuyển trạng thái yêu cầu tài sản

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-AR-03` |
| **stt_phase1** | 40 |
| **mod** | M01 |
| **name_vi** | Chuyển trạng thái yêu cầu tài sản |
| **actors** | Approver · Kế toán |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 40 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST `/api/xbos/asset-requests/:requestId/transition` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | POST :requestId/transition trên asset-request.controller.ts. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Chuyển trạng thái yêu cầu tài sản theo máy trạng thái cho phép.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-ART-01 | Transition AR | Đổi trạng thái hợp lệ | Approver |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-ART-01 | FN-AR-TRANS | POST transition | Chuyển TT / Duyệt | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-AR-TRANS | 2 | 3 | 1 | 2 | 2 | 10 |
| **Tổng** | 2 | 3 | 1 | 2 | 2 | **10** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-AR-03-TR-HP-001 | CAP-ART-01 | FN-AR-TRANS | HP | P0 | Manager có quyền inbox WF | AR pending từ FE | 1. Chuyển trạng thái hợp lệ | 2xx · status mới · F5 | UI/API | UC-XBOS-AR-03 |
| TC-XBOS-AR-03-TR-FD-001 | CAP-ART-01 | FN-AR-TRANS | FD | P0 | Manager có quyền inbox WF | transition illegal | 1. chuyển nhảy trạng thái | 4xx SM | API |  |
| TC-XBOS-AR-03-TR-FD-002 | CAP-ART-01 | FN-AR-TRANS | FD | P0 | Manager có quyền inbox WF | requestId sai | 1. transition | 404 | API |  |
| TC-XBOS-AR-03-TR-AU-001 | CAP-ART-01 | FN-AR-TRANS | AU | P0 | EMPLOYEE (NV thường) | không quyền | 1. transition | 403 | API | RBAC |
| TC-XBOS-AR-03-TR-AU-002 | CAP-ART-01 | FN-AR-TRANS | AU | P0 | du-lich.ceo@xe.vn (member CEO) | sai CT | 1. transition | 409/403 | API | scope |
| TC-XBOS-AR-03-TR-UX-001 | CAP-ART-01 | FN-AR-TRANS | UX | P1 | Manager có quyền inbox WF | sau OK | 1. list/detail cập nhật | FE sau 2xx | UI |  |
| TC-XBOS-AR-03-TR-BD-001 | CAP-ART-01 | FN-AR-TRANS | BD | P2 | Manager có quyền inbox WF | terminal | 1. transition tiếp | 4xx | API | SM |
| TC-XBOS-AR-03-TR-HP-002 | CAP-ART-01 | FN-AR-TRANS | HP | P1 | Manager có quyền inbox WF | reject path nếu có | 1. chuyển rejected + lý do | status rejected | UI/API |  |
| TC-XBOS-AR-03-TR-FD-003 | CAP-ART-01 | FN-AR-TRANS | FD | P1 | Manager có quyền inbox WF | thiếu reason khi reject | 1. transition | 4xx | API |  |
| TC-XBOS-AR-03-TR-UX-002 | CAP-ART-01 | FN-AR-TRANS | UX | P2 | Manager có quyền inbox WF | double click | 1. chuyển 2 lần | một lần thành công | UI |  |

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
| BE API/DTO | POST :requestId/transition trên asset-request.controller.ts. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-AR-03
cases_designed: 10
code_readiness: LIKELY_IMPL
```
