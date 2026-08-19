# UC — `UC-XBOS-KPI-02` · Tính KPI theo lô trên máy chủ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-KPI-02` |
| **stt_phase1** | 12 |
| **mod** | M01 |
| **name_vi** | Tính KPI theo lô trên máy chủ |
| **actors** | KPI engine |
| **surfaces** | api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 12 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST `/api/xbos/kpi-engine/evaluate-batch` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | POST evaluate-batch. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Tính nhiều KPI trong một lần gọi lô, trả kết quả từng phần tử.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-KB-01 | Evaluate batch | Tính nhiều metric | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-KB-01 | FN-KPI-BATCH | POST evaluate-batch | API | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-KPI-BATCH | 2 | 2 | 1 | 1 | 1 | 7 |
| **Tổng** | 2 | 2 | 1 | 1 | 1 | **7** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-KPI-02-BAT-HP-001 | CAP-KB-01 | FN-KPI-BATCH | HP | P0 | ceo@xe.vn (group CEO) | ≥2 metrics | 1. POST batch hợp lệ | 2xx · đủ phần tử kết quả | API | UC-XBOS-KPI-02 |
| TC-XBOS-KPI-02-BAT-FD-001 | CAP-KB-01 | FN-KPI-BATCH | FD | P0 | ceo@xe.vn (group CEO) | — | 1. batch rỗng | 4xx | API |  |
| TC-XBOS-KPI-02-BAT-FD-002 | CAP-KB-01 | FN-KPI-BATCH | FD | P0 | ceo@xe.vn (group CEO) | 1 metric sai trong lô | 1. batch hỗn hợp | partial error rõ / fail-all — AS-IS | API | error semantics |
| TC-XBOS-KPI-02-BAT-AU-001 | CAP-KB-01 | FN-KPI-BATCH | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. batch company lệch | 409 | API | scope |
| TC-XBOS-KPI-02-BAT-BD-001 | CAP-KB-01 | FN-KPI-BATCH | BD | P1 | ceo@xe.vn (group CEO) | — | 1. batch rất lớn | limit/4xx · không 500 OOM | API | perf |
| TC-XBOS-KPI-02-BAT-UX-001 | CAP-KB-01 | FN-KPI-BATCH | UX | P2 | ceo@xe.vn (group CEO) | UI | 1. Chạy batch từ CC | progress/kết quả | UI |  |
| TC-XBOS-KPI-02-BAT-HP-002 | CAP-KB-01 | FN-KPI-BATCH | HP | P1 | service/admin JWT | size=1 | 1. batch 1 phần tử | tương đương evaluate đơn | API |  |

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
| BE API/DTO | POST evaluate-batch. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-KPI-02
cases_designed: 7
code_readiness: LIKELY_IMPL
```
