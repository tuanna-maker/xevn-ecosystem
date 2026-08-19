# UC — `UC-XBOS-KPI-03` · Tổng hợp KPI đa cấp (rollup)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-KPI-03` |
| **stt_phase1** | 13 |
| **mod** | M01 |
| **name_vi** | Tổng hợp KPI đa cấp (rollup) |
| **actors** | Group CEO · KPI engine |
| **surfaces** | api / xbos-cc |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 13 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC · FR-XBOS-KPI-03 TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET `/api/xbos/kpi-engine/rollup` → `XBOS-KPI-202` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | GET rollup · TECHSPEC §14.17 OpenAPI kpiEngineRollup. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Tổng hợp KPI đa cấp (rollup) theo cây tổ chức/pháp nhân cho cockpit điều hành.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-KR-01 | Rollup đa cấp | Xem tổng hợp | Group CEO |
| CAP-KR-02 | Scope rollup | main vs member | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-KR-01 | FN-KPI-ROLLUP | GET rollup | GET rollup / CC | N |
| CAP-KR-02 | FN-KPI-ROLLUP-SCOPE | Scope rollup | companyId | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-KPI-ROLLUP | 2 | 1 | 1 | 0 | 1 | 5 |
| FN-KPI-ROLLUP-SCOPE | 0 | 0 | 0 | 1 | 0 | 1 |
| **Tổng** | 2 | 1 | 1 | 1 | 1 | **6** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-KPI-03-ROL-HP-001 | CAP-KR-01 | FN-KPI-ROLLUP | HP | P0 | ceo@xe.vn (group CEO) | main scope | 1. GET rollup / mở cockpit | 200 XBOS-KPI-202 · có nodes | API/UI | UC-XBOS-KPI-03 |
| TC-XBOS-KPI-03-ROL-FD-001 | CAP-KR-01 | FN-KPI-ROLLUP | FD | P1 | ceo@xe.vn (group CEO) | — | 1. thiếu from/to | 4xx | API |  |
| TC-XBOS-KPI-03-ROL-AU-001 | CAP-KR-02 | FN-KPI-ROLLUP-SCOPE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. rollup toàn tập đoàn | 403/409 hoặc chỉ CT mình theo ADR | API | scope ladder |
| TC-XBOS-KPI-03-ROL-UX-001 | CAP-KR-01 | FN-KPI-ROLLUP | UX | P0 | ceo@xe.vn (group CEO) | không data kỳ | 1. Mở rollup | empty hợp lệ · không ERROR | UI | U65 |
| TC-XBOS-KPI-03-ROL-HP-002 | CAP-KR-01 | FN-KPI-ROLLUP | HP | P1 | ceo@xe.vn (group CEO) | có con | 1. Mở node cha → con | cross-nav số liệu khớp | UI | J-* |
| TC-XBOS-KPI-03-ROL-BD-001 | CAP-KR-01 | FN-KPI-ROLLUP | BD | P2 | ceo@xe.vn (group CEO) | — | 1. kỳ 1 ngày vs 1 năm | không crash | API | NFR |

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
| BE API/DTO | GET rollup · TECHSPEC §14.17 OpenAPI kpiEngineRollup. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-KPI-03
cases_designed: 6
code_readiness: LIKELY_IMPL
```
