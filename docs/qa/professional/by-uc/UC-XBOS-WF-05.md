# UC — `UC-XBOS-WF-05` · Xem chi tiết phiên và các bước đang chờ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-WF-05` |
| **stt_phase1** | 35 |
| **mod** | M01 |
| **name_vi** | Xem chi tiết phiên và các bước đang chờ |
| **actors** | Requester · Approver · Admin |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 35 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC · API_CONTRACT history |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET `/api/xbos/workflow-engine/instances/:id/detail` · history |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | GET instances/:instanceId/detail. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Xem chi tiết phiên và các bước đang chờ để theo dõi tiến độ phê duyệt.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-WDTL-01 | Xem chi tiết phiên | Detail + pending steps | Involved |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-WDTL-01 | FN-WDTL-GET | GET instance detail | Chi tiết phiên | N |
| CAP-WDTL-01 | FN-WDTL-HIST | GET history | Lịch sử | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-WDTL-GET | 2 | 1 | 0 | 2 | 1 | 6 |
| FN-WDTL-HIST | 1 | 0 | 0 | 0 | 0 | 1 |
| **Tổng** | 3 | 1 | 0 | 2 | 1 | **7** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-WF-05-GET-HP-001 | CAP-WDTL-01 | FN-WDTL-GET | HP | P0 | Employee / requester | có instance | 1. Mở chi tiết phiên | thấy bước chờ · status | UI/API | UC-XBOS-WF-05 |
| TC-XBOS-WF-05-GET-FD-001 | CAP-WDTL-01 | FN-WDTL-GET | FD | P0 | Employee / requester | id sai | 1. GET | 404 | API |  |
| TC-XBOS-WF-05-GET-AU-001 | CAP-WDTL-01 | FN-WDTL-GET | AU | P0 | EMPLOYEE (NV thường) | không liên quan | 1. GET detail | 403 | API | API_CONTRACT Involved |
| TC-XBOS-WF-05-HIST-HP-001 | CAP-WDTL-01 | FN-WDTL-HIST | HP | P1 | Manager có quyền inbox WF | đã có approve | 1. Xem lịch sử | timeline bước | UI/API | history |
| TC-XBOS-WF-05-GET-UX-001 | CAP-WDTL-01 | FN-WDTL-GET | UX | P1 | Employee / requester | pending | 1. highlight bước chờ | rõ ràng | UI |  |
| TC-XBOS-WF-05-GET-HP-002 | CAP-WDTL-01 | FN-WDTL-GET | HP | P1 | ceo@xe.vn (group CEO) | list instances | 1. list→detail | J-* OK | UI | cross-nav |
| TC-XBOS-WF-05-GET-AU-002 | CAP-WDTL-01 | FN-WDTL-GET | AU | P0 | du-lich.ceo@xe.vn (member CEO) | sai CT | 1. GET | 409/403 | API | scope |

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
| BE API/DTO | GET instances/:instanceId/detail. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-WF-05
cases_designed: 7
code_readiness: LIKELY_IMPL
```
