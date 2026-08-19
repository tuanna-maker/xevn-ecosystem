# UC — `UC-XBOS-WF-06` · Từ chối bước phê duyệt trong phiên

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-WF-06` |
| **stt_phase1** | 36 |
| **mod** | M01 |
| **name_vi** | Từ chối bước phê duyệt trong phiên |
| **actors** | Approver |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 36 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · reject min 10 chars API_CONTRACT |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST tasks/:taskId/reject · API_CONTRACT reject 10 chars min |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | tasks reject + catalog-governance reject · lý do ≥10 ký tự. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Từ chối bước phê duyệt với lý do hợp lệ, cập nhật trạng thái phiên/task.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-WJ-01 | Reject task | Từ chối + lý do | Approver |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-WJ-01 | FN-WJ-REJECT | POST reject | Từ chối · API | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-WJ-REJECT | 2 | 4 | 2 | 2 | 2 | 12 |
| **Tổng** | 2 | 4 | 2 | 2 | 2 | **12** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-WF-06-RJ-HP-001 | CAP-WJ-01 | FN-WJ-REJECT | HP | P0 | Manager có quyền inbox WF | task pending từ FE | 1. Từ chối + lý do ≥10 ký tự | 2xx · trạng thái rejected · F5 | UI/API | API_CONTRACT_VN |
| TC-XBOS-WF-06-RJ-FD-001 | CAP-WJ-01 | FN-WJ-REJECT | FD | P0 | Manager có quyền inbox WF | — | 1. lý do <10 ký tự | 4xx | UI/API | 10 chars min |
| TC-XBOS-WF-06-RJ-FD-002 | CAP-WJ-01 | FN-WJ-REJECT | FD | P0 | Manager có quyền inbox WF | đã reject | 1. reject lại | 4xx | API |  |
| TC-XBOS-WF-06-RJ-AU-001 | CAP-WJ-01 | FN-WJ-REJECT | AU | P0 | Employee / requester | tự reject vòng mình nếu cấm | 1. reject | 403/4xx theo BR | API |  |
| TC-XBOS-WF-06-RJ-AU-002 | CAP-WJ-01 | FN-WJ-REJECT | AU | P0 | du-lich.ceo@xe.vn (member CEO) | sai CT | 1. reject | 409/403 | API | scope |
| TC-XBOS-WF-06-RJ-UX-001 | CAP-WJ-01 | FN-WJ-REJECT | UX | P1 | Manager có quyền inbox WF | sau reject | 1. requester xem detail | thấy lý do · dashed edge nếu canvas | UI |  |
| TC-XBOS-WF-06-RJ-BD-001 | CAP-WJ-01 | FN-WJ-REJECT | BD | P1 | Manager có quyền inbox WF | — | 1. lý do đúng 10 ký tự | OK | API | BD |
| TC-XBOS-WF-06-RJ-BD-002 | CAP-WJ-01 | FN-WJ-REJECT | BD | P2 | Manager có quyền inbox WF | — | 1. lý do 9 ký tự | 4xx | API | BD |
| TC-XBOS-WF-06-RJ-HP-002 | CAP-WJ-01 | FN-WJ-REJECT | HP | P1 | service/admin JWT | catalog-gov | 1. POST reject tương đương | 2xx | API |  |
| TC-XBOS-WF-06-RJ-FD-003 | CAP-WJ-01 | FN-WJ-REJECT | FD | P1 | Manager có quyền inbox WF | taskId sai | 1. reject | 404 | API |  |
| TC-XBOS-WF-06-RJ-UX-002 | CAP-WJ-01 | FN-WJ-REJECT | UX | P1 | Manager có quyền inbox WF | form | 1. mở dialog Từ chối | required lý do rõ | UI |  |
| TC-XBOS-WF-06-RJ-FD-004 | CAP-WJ-01 | FN-WJ-REJECT | FD | P2 | Manager có quyền inbox WF | instance terminal | 1. reject | 4xx state | API | SM |

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
| BE API/DTO | tasks reject + catalog-governance reject · lý do ≥10 ký tự. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-WF-06
cases_designed: 12
code_readiness: LIKELY_IMPL
```
