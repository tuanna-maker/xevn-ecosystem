# UC — `UC-XBOS-KPI-04` · Phát cảnh báo KPI lên cổng điều hành

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-KPI-04` |
| **stt_phase1** | 14 |
| **mod** | M01 |
| **name_vi** | Phát cảnh báo KPI lên cổng điều hành |
| **actors** | KPI engine · Portal CC |
| **surfaces** | api / xbos-cc |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 14 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET/POST `/api/xbos/kpi-engine/portal-alerts` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | portal-alerts GET/POST trên kpi-engine.controller.ts. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Phát và đọc cảnh báo KPI trên cổng điều hành khi vượt ngưỡng.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-KA-01 | Tạo cảnh báo KPI | POST alert | Engine/Admin |
| CAP-KA-02 | Xem cảnh báo cổng | CC đọc alerts | CEO |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-KA-01 | FN-KPI-ALERT-POST | POST portal-alerts | API | Y |
| CAP-KA-02 | FN-KPI-ALERT-GET | GET portal-alerts | CC thanh cảnh báo | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-KPI-ALERT-POST | 1 | 1 | 1 | 1 | 0 | 4 |
| FN-KPI-ALERT-GET | 1 | 0 | 0 | 1 | 1 | 3 |
| **Tổng** | 2 | 1 | 1 | 2 | 1 | **7** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-KPI-04-POST-HP-001 | CAP-KA-01 | FN-KPI-ALERT-POST | HP | P0 | service/admin JWT | ngưỡng vượt | 1. POST alert hợp lệ | 2xx · lưu alert | API | UC-XBOS-KPI-04 |
| TC-XBOS-KPI-04-POST-FD-001 | CAP-KA-01 | FN-KPI-ALERT-POST | FD | P0 | service/admin JWT | — | 1. thiếu metric/threshold | 4xx | API |  |
| TC-XBOS-KPI-04-GET-HP-001 | CAP-KA-02 | FN-KPI-ALERT-GET | HP | P0 | ceo@xe.vn (group CEO) | đã có alert | 1. Mở CC / GET alerts | thấy cảnh báo · không 409 | UI/API | CC |
| TC-XBOS-KPI-04-GET-UX-001 | CAP-KA-02 | FN-KPI-ALERT-GET | UX | P0 | ceo@xe.vn (group CEO) | không alert | 1. GET | [] empty OK | UI/API |  |
| TC-XBOS-KPI-04-POST-AU-001 | CAP-KA-01 | FN-KPI-ALERT-POST | AU | P0 | EMPLOYEE (NV thường) | NV | 1. POST | 403 | API |  |
| TC-XBOS-KPI-04-GET-AU-001 | CAP-KA-02 | FN-KPI-ALERT-GET | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. GET alerts holding | scope đúng | API | scope |
| TC-XBOS-KPI-04-POST-BD-001 | CAP-KA-01 | FN-KPI-ALERT-POST | BD | P2 | service/admin JWT | — | 1. threshold = 0 | hành vi rõ | API | BD |

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
| BE API/DTO | portal-alerts GET/POST trên kpi-engine.controller.ts. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-KPI-04
cases_designed: 7
code_readiness: LIKELY_IMPL
```
