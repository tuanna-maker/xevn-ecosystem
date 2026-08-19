# UC — `UC-XBOS-WF-02` · Xem danh sách phiên bản quy trình

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-WF-02` |
| **stt_phase1** | 32 |
| **mod** | M01 |
| **name_vi** | Xem danh sách phiên bản quy trình |
| **actors** | Process admin |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 32 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET definitions (versions list) |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | GET workflow-engine/definitions — versioning depth PARTIAL nếu UI mỏng. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Xem danh sách phiên bản định nghĩa quy trình để chọn bản active/rollback (nếu có).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-WV-01 | List versions | Xem lịch sử version | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-WV-01 | FN-WV-LIST | List definition versions | GET definitions | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-WV-LIST | 2 | 1 | 0 | 2 | 1 | 6 |
| **Tổng** | 2 | 1 | 0 | 2 | 1 | **6** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-WF-02-LIST-HP-001 | CAP-WV-01 | FN-WV-LIST | HP | P0 | ceo@xe.vn (group CEO) | ≥1 definition | 1. Mở danh sách phiên bản | thấy version/id · 2xx | UI/API | UC-XBOS-WF-02 |
| TC-XBOS-WF-02-LIST-UX-001 | CAP-WV-01 | FN-WV-LIST | UX | P0 | ceo@xe.vn (group CEO) | chưa có | 1. Mở list | empty OK | UI | U65 |
| TC-XBOS-WF-02-LIST-AU-001 | CAP-WV-01 | FN-WV-LIST | AU | P0 | EMPLOYEE (NV thường) | NV | 1. GET | 403 hoặc filtered | API | RBAC |
| TC-XBOS-WF-02-LIST-HP-002 | CAP-WV-01 | FN-WV-LIST | HP | P1 | ceo@xe.vn (group CEO) | nhiều version | 1. sort/filter | thứ tự version đúng | UI |  |
| TC-XBOS-WF-02-LIST-FD-001 | CAP-WV-01 | FN-WV-LIST | FD | P1 | ceo@xe.vn (group CEO) | API 500 | 1. Mở list | banner lỗi · không bảng giả | UI |  |
| TC-XBOS-WF-02-LIST-AU-002 | CAP-WV-01 | FN-WV-LIST | AU | P1 | du-lich.ceo@xe.vn (member CEO) | member | 1. list holding defs | scope đúng | API | scope |

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
| BE API/DTO | GET workflow-engine/definitions — versioning depth PARTIAL nếu UI mỏng. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-WF-02
cases_designed: 6
code_readiness: LIKELY_IMPL
```
