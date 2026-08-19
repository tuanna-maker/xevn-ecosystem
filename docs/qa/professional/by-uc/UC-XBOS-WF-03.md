# UC — `UC-XBOS-WF-03` · Khởi tạo phiên chạy quy trình

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-WF-03` |
| **stt_phase1** | 33 |
| **mod** | M01 |
| **name_vi** | Khởi tạo phiên chạy quy trình |
| **actors** | Requester |
| **surfaces** | api / web-portal |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 33 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST `/api/xbos/workflow-engine/instances` · `/instances/start` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | POST instances + instances/start. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Khởi tạo phiên chạy quy trình từ definition active, sinh task chờ duyệt.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-WI-01 | Start instance | Tạo phiên | Requester |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-WI-01 | FN-WI-START | POST start instance | Gửi yêu cầu / API | Y |
| CAP-WI-01 | FN-WI-CREATE | POST instances | API | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-WI-START | 1 | 2 | 1 | 2 | 1 | 7 |
| FN-WI-CREATE | 1 | 0 | 0 | 0 | 0 | 1 |
| **Tổng** | 2 | 2 | 1 | 2 | 1 | **8** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-WF-03-ST-HP-001 | CAP-WI-01 | FN-WI-START | HP | P0 | Employee / requester | definition active | 1. Start từ FE | 2xx · instanceId · task chờ | UI/API | UC-XBOS-WF-03 |
| TC-XBOS-WF-03-ST-FD-001 | CAP-WI-01 | FN-WI-START | FD | P0 | Employee / requester | definitionId sai | 1. Start | 404/4xx | API |  |
| TC-XBOS-WF-03-ST-FD-002 | CAP-WI-01 | FN-WI-START | FD | P0 | Employee / requester | payload thiếu | 1. Start | 4xx | API |  |
| TC-XBOS-WF-03-ST-AU-001 | CAP-WI-01 | FN-WI-START | AU | P0 | EMPLOYEE (NV thường) | không quyền | 1. Start | 403 | API | RBAC |
| TC-XBOS-WF-03-CR-HP-001 | CAP-WI-01 | FN-WI-CREATE | HP | P1 | service/admin JWT | — | 1. POST instances rồi start | hành vi AS-IS document | API |  |
| TC-XBOS-WF-03-ST-UX-001 | CAP-WI-01 | FN-WI-START | UX | P1 | Employee / requester | sau start | 1. xem trạng thái phiên | pending/running rõ | UI |  |
| TC-XBOS-WF-03-ST-AU-002 | CAP-WI-01 | FN-WI-START | AU | P0 | du-lich.ceo@xe.vn (member CEO) | sai CT | 1. Start cho CT khác | 409/403 | API | scope |
| TC-XBOS-WF-03-ST-BD-001 | CAP-WI-01 | FN-WI-START | BD | P2 | Employee / requester | — | 1. payload cực lớn | reject rõ | API |  |

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
| BE API/DTO | POST instances + instances/start. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-WF-03
cases_designed: 8
code_readiness: LIKELY_IMPL
```
