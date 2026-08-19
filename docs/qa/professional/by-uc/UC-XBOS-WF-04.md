# UC — `UC-XBOS-WF-04` · Hoàn thành bước phê duyệt trong phiên

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-WF-04` |
| **stt_phase1** | 34 |
| **mod** | M01 |
| **name_vi** | Hoàn thành bước phê duyệt trong phiên |
| **actors** | Approver |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 34 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · API_CONTRACT approve |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST `/api/xbos/workflow-engine/tasks/:taskId/complete` · catalog-gov approve |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | tasks/:taskId/complete + catalog-governance approve. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Hoàn thành bước phê duyệt đang chờ trong phiên, chuyển trạng thái bước kế.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-WC-01 | Complete task | Duyệt xong bước | Approver |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-WC-01 | FN-WC-COMPLETE | POST complete task | Duyệt · API complete | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-WC-COMPLETE | 3 | 4 | 1 | 2 | 2 | 12 |
| **Tổng** | 3 | 4 | 1 | 2 | 2 | **12** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-WF-04-COM-HP-001 | CAP-WC-01 | FN-WC-COMPLETE | HP | P0 | Manager có quyền inbox WF | task pending từ FE | 1. Duyệt / complete | 2xx · bước kế hoặc terminal · F5 | UI/API | UC-XBOS-WF-04 |
| TC-XBOS-WF-04-COM-FD-001 | CAP-WC-01 | FN-WC-COMPLETE | FD | P0 | Manager có quyền inbox WF | task không phải của mình | 1. complete | 403/4xx | API |  |
| TC-XBOS-WF-04-COM-FD-002 | CAP-WC-01 | FN-WC-COMPLETE | FD | P0 | Manager có quyền inbox WF | đã complete | 1. complete lại | 4xx | API |  |
| TC-XBOS-WF-04-COM-AU-001 | CAP-WC-01 | FN-WC-COMPLETE | AU | P0 | Employee / requester | tự duyệt | 1. complete task mình tạo | blocked SRS_VN | API | self-approve |
| TC-XBOS-WF-04-COM-AU-002 | CAP-WC-01 | FN-WC-COMPLETE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | sai CT | 1. complete | 409/403 | API | scope |
| TC-XBOS-WF-04-COM-UX-001 | CAP-WC-01 | FN-WC-COMPLETE | UX | P1 | Manager có quyền inbox WF | sau OK | 1. inbox cập nhật | task biến khỏi hàng chờ | UI |  |
| TC-XBOS-WF-04-COM-BD-001 | CAP-WC-01 | FN-WC-COMPLETE | BD | P2 | Manager có quyền inbox WF | comment dài | 1. complete + comment | OK hoặc cắt rõ | API |  |
| TC-XBOS-WF-04-COM-HP-002 | CAP-WC-01 | FN-WC-COMPLETE | HP | P1 | Manager có quyền inbox WF | nhiều bước | 1. complete L1 → còn L2 | state đúng ladder | UI/API | 2 cấp |
| TC-XBOS-WF-04-COM-FD-003 | CAP-WC-01 | FN-WC-COMPLETE | FD | P1 | Manager có quyền inbox WF | taskId sai | 1. complete | 404 | API |  |
| TC-XBOS-WF-04-COM-UX-002 | CAP-WC-01 | FN-WC-COMPLETE | UX | P1 | Manager có quyền inbox WF | double click | 1. Duyệt 2 lần nhanh | một transition | UI |  |
| TC-XBOS-WF-04-COM-HP-003 | CAP-WC-01 | FN-WC-COMPLETE | HP | P1 | service/admin JWT | catalog-gov path | 1. POST approve tương đương | 2xx | API | catalog-governance |
| TC-XBOS-WF-04-COM-FD-004 | CAP-WC-01 | FN-WC-COMPLETE | FD | P2 | Manager có quyền inbox WF | instance cancelled | 1. complete | 4xx state | API | SM |

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
| BE API/DTO | tasks/:taskId/complete + catalog-governance approve. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-WF-04
cases_designed: 12
code_readiness: LIKELY_IMPL
```
