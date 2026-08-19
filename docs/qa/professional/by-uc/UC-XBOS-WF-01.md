# UC — `UC-XBOS-WF-01` · Lưu sơ đồ quy trình trên canvas

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-WF-01` |
| **stt_phase1** | 31 |
| **mod** | M01 |
| **name_vi** | Lưu sơ đồ quy trình trên canvas |
| **actors** | Process designer |
| **surfaces** | web-portal (canvas) |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 31 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | PUT definitions (graph payload) · FE Workflow Canvas |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | BE definitions có; FE canvas Bézier — depth UI cần spot thêm. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Lưu sơ đồ quy trình từ canvas (node/edge, nét đứt từ chối) thành definition bền vững.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CV-01 | Vẽ/sửa canvas | Chỉnh graph | Designer |
| CAP-CV-02 | Lưu sơ đồ | Persist graph | Designer |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CV-01 | FN-CV-EDIT | Edit nodes/edges | Canvas | N |
| CAP-CV-02 | FN-CV-SAVE | Lưu sơ đồ | Lưu · PUT definition | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CV-EDIT | 2 | 0 | 0 | 0 | 1 | 3 |
| FN-CV-SAVE | 1 | 2 | 1 | 1 | 0 | 5 |
| **Tổng** | 3 | 2 | 1 | 1 | 1 | **8** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-WF-01-EDIT-HP-001 | CAP-CV-01 | FN-CV-EDIT | HP | P0 | ceo@xe.vn (group CEO) | mở canvas | 1. Thêm node duyệt · nối Bézier | UI hiển thị mũi tên định hướng | UI | UC-XBOS-WF-01 |
| TC-XBOS-WF-01-SAVE-HP-001 | CAP-CV-02 | FN-CV-SAVE | HP | P0 | ceo@xe.vn (group CEO) | graph hợp lệ | 1. Lưu | 2xx · F5 còn graph | UI/API |  |
| TC-XBOS-WF-01-SAVE-FD-001 | CAP-CV-02 | FN-CV-SAVE | FD | P0 | ceo@xe.vn (group CEO) | node mồ côi | 1. Lưu | 4xx / validation UI | UI/API |  |
| TC-XBOS-WF-01-EDIT-UX-001 | CAP-CV-01 | FN-CV-EDIT | UX | P1 | ceo@xe.vn (group CEO) | — | 1. cạnh Từ chối | nét đứt (dashed) theo style guide | UI | UIUX |
| TC-XBOS-WF-01-SAVE-AU-001 | CAP-CV-02 | FN-CV-SAVE | AU | P0 | EMPLOYEE (NV thường) | NV | 1. Lưu | 403 | API | RBAC |
| TC-XBOS-WF-01-SAVE-FD-002 | CAP-CV-02 | FN-CV-SAVE | FD | P1 | ceo@xe.vn (group CEO) | mất mạng | 1. Lưu | không mất draft im lặng / báo lỗi | UI |  |
| TC-XBOS-WF-01-SAVE-BD-001 | CAP-CV-02 | FN-CV-SAVE | BD | P2 | ceo@xe.vn (group CEO) | rất nhiều node | 1. Lưu | limit/perf rõ | UI/API |  |
| TC-XBOS-WF-01-EDIT-HP-002 | CAP-CV-01 | FN-CV-EDIT | HP | P1 | ceo@xe.vn (group CEO) | đã lưu | 1. Mở lại canvas | khớp vị trí node | UI | F5 |

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
| BE API/DTO | BE definitions có; FE canvas Bézier — depth UI cần spot thêm. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-WF-01
cases_designed: 8
code_readiness: LIKELY_PARTIAL
```
