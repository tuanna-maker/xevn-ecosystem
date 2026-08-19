# UC — `UC-XBOS-15` · Cấu hình tuyến báo cáo và tổng hợp kết quả quy trình

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-15` |
| **stt_phase1** | 30 |
| **mod** | M01 |
| **name_vi** | Cấu hình tuyến báo cáo và tổng hợp kết quả quy trình |
| **actors** | Process admin |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 30 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET/POST `/api/xbos/workflow-engine/reporting-routes` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | workflow-engine reporting-routes GET/POST. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Cấu hình tuyến báo cáo và xem tổng hợp kết quả phiên quy trình theo tuyến.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-RR-01 | Cấu hình tuyến báo cáo | CRUD routes | Admin |
| CAP-RR-02 | Tổng hợp kết quả | Aggregate theo route | Admin |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-RR-01 | FN-RR-LIST | List reporting routes | GET reporting-routes | N |
| CAP-RR-01 | FN-RR-SAVE | Create/Update route | POST reporting-routes | Y |
| CAP-RR-02 | FN-RR-AGG | Xem tổng hợp theo tuyến | UI báo cáo / API | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-RR-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-RR-SAVE | 1 | 1 | 1 | 2 | 0 | 5 |
| FN-RR-AGG | 1 | 1 | 0 | 0 | 1 | 3 |
| **Tổng** | 3 | 2 | 1 | 2 | 2 | **10** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-15-LIST-HP-001 | CAP-RR-01 | FN-RR-LIST | HP | P0 | ceo@xe.vn (group CEO) | login | 1. Mở cấu hình tuyến báo cáo | list 2xx | UI/API | UC-XBOS-15 |
| TC-XBOS-15-SAVE-HP-001 | CAP-RR-01 | FN-RR-SAVE | HP | P0 | ceo@xe.vn (group CEO) | form | 1. Thêm tuyến · Lưu | 2xx · F5 còn | UI/API |  |
| TC-XBOS-15-SAVE-FD-001 | CAP-RR-01 | FN-RR-SAVE | FD | P0 | ceo@xe.vn (group CEO) | — | 1. thiếu process/route target | 4xx | API |  |
| TC-XBOS-15-AGG-HP-001 | CAP-RR-02 | FN-RR-AGG | HP | P0 | ceo@xe.vn (group CEO) | đã có phiên | 1. Xem tổng hợp tuyến | số liệu khớp phiên (không seed giả) | UI/API | U65 |
| TC-XBOS-15-AGG-UX-001 | CAP-RR-02 | FN-RR-AGG | UX | P0 | ceo@xe.vn (group CEO) | chưa có phiên | 1. Xem tổng hợp | empty OK | UI |  |
| TC-XBOS-15-SAVE-AU-001 | CAP-RR-01 | FN-RR-SAVE | AU | P0 | EMPLOYEE (NV thường) | NV | 1. POST | 403 | API | RBAC |
| TC-XBOS-15-SAVE-AU-002 | CAP-RR-01 | FN-RR-SAVE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. cấu hình holding | 403/409 | API | scope |
| TC-XBOS-15-LIST-UX-001 | CAP-RR-01 | FN-RR-LIST | UX | P1 | ceo@xe.vn (group CEO) | trống | 1. list | empty | UI |  |
| TC-XBOS-15-SAVE-BD-001 | CAP-RR-01 | FN-RR-SAVE | BD | P2 | ceo@xe.vn (group CEO) | — | 1. tên tuyến dài | validate | UI |  |
| TC-XBOS-15-AGG-FD-001 | CAP-RR-02 | FN-RR-AGG | FD | P1 | ceo@xe.vn (group CEO) | routeId sai | 1. mở tổng hợp | 404/4xx | API |  |

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
| BE API/DTO | workflow-engine reporting-routes GET/POST. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-15
cases_designed: 10
code_readiness: LIKELY_IMPL
```
