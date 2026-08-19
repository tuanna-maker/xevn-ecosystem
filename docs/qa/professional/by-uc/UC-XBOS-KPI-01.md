# UC — `UC-XBOS-KPI-01` · Tính KPI đơn lẻ trên máy chủ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-KPI-01` |
| **stt_phase1** | 11 |
| **mod** | M01 |
| **name_vi** | Tính KPI đơn lẻ trên máy chủ |
| **actors** | KPI engine · Admin điều hành |
| **surfaces** | api / xbos-cc |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 11 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC · TECHSPEC kpi-engine |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST `/api/xbos/kpi-engine/evaluate` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | kpi-engine.controller.ts POST evaluate. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Tính một chỉ số KPI trên máy chủ theo tham số kỳ/phạm vi và trả kết quả xác định.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-KPI-01 | Evaluate đơn | Tính 1 metric | Admin |
| CAP-KPI-02 | Scope KPI | Đúng company/tenant | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-KPI-01 | FN-KPI-EVAL | POST evaluate | API / CC trigger | Y |
| CAP-KPI-02 | FN-KPI-SCOPE | Scope on evaluate | companyId | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-KPI-EVAL | 1 | 2 | 1 | 1 | 1 | 6 |
| FN-KPI-SCOPE | 0 | 0 | 0 | 1 | 0 | 1 |
| **Tổng** | 1 | 2 | 1 | 2 | 1 | **7** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-KPI-01-EVAL-HP-001 | CAP-KPI-01 | FN-KPI-EVAL | HP | P0 | ceo@xe.vn (group CEO) | metric tồn tại | 1. POST evaluate hợp lệ | 2xx · value số · mã KPI | API | UC-XBOS-KPI-01 |
| TC-XBOS-KPI-01-EVAL-FD-001 | CAP-KPI-01 | FN-KPI-EVAL | FD | P0 | ceo@xe.vn (group CEO) | — | 1. Thiếu metricKey/kỳ | 4xx | API |  |
| TC-XBOS-KPI-01-EVAL-FD-002 | CAP-KPI-01 | FN-KPI-EVAL | FD | P0 | ceo@xe.vn (group CEO) | metric lạ | 1. evaluate | 4xx not found | API |  |
| TC-XBOS-KPI-01-SCOPE-AU-001 | CAP-KPI-02 | FN-KPI-SCOPE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. evaluate company khác | 409 scope mismatch | API | companyId token |
| TC-XBOS-KPI-01-EVAL-BD-001 | CAP-KPI-01 | FN-KPI-EVAL | BD | P1 | ceo@xe.vn (group CEO) | — | 1. from=to biên | OK hoặc 4xx rõ | API | BD |
| TC-XBOS-KPI-01-EVAL-UX-001 | CAP-KPI-01 | FN-KPI-EVAL | UX | P1 | ceo@xe.vn (group CEO) | UI có nút tính | 1. Bấm tính | loading → kết quả | UI | UX |
| TC-XBOS-KPI-01-EVAL-AU-001 | CAP-KPI-01 | FN-KPI-EVAL | AU | P1 | EMPLOYEE (NV thường) | NV | 1. POST | 403 | API | RBAC |

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
| BE API/DTO | kpi-engine.controller.ts POST evaluate. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-KPI-01
cases_designed: 7
code_readiness: LIKELY_IMPL
```
