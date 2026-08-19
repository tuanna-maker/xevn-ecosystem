# UC — `UC-XBOS-AR-01` · Danh sách yêu cầu tài sản

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-AR-01` |
| **stt_phase1** | 38 |
| **mod** | M01 |
| **name_vi** | Danh sách yêu cầu tài sản |
| **actors** | Requester · Approver · Admin |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 38 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET `/api/xbos/asset-requests` (asset-request.controller) |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | asset-request.controller.ts GET list. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Liệt kê yêu cầu tài sản theo phạm vi quyền/công ty.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-ARL-01 | List AR | Xem danh sách | User |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-ARL-01 | FN-AR-LIST | GET asset-requests | Danh sách YC tài sản | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-AR-LIST | 2 | 1 | 0 | 2 | 1 | 6 |
| **Tổng** | 2 | 1 | 0 | 2 | 1 | **6** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-AR-01-LIST-HP-001 | CAP-ARL-01 | FN-AR-LIST | HP | P0 | ceo@xe.vn (group CEO) | login | 1. Mở danh sách YC tài sản | 2xx · lưới · không ERROR | UI/API | UC-XBOS-AR-01 |
| TC-XBOS-AR-01-LIST-UX-001 | CAP-ARL-01 | FN-AR-LIST | UX | P0 | ceo@xe.vn (group CEO) | chưa có YC | 1. Mở list | empty hợp lệ | UI | U65 |
| TC-XBOS-AR-01-LIST-AU-001 | CAP-ARL-01 | FN-AR-LIST | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. list | chỉ CT mình | API | scope |
| TC-XBOS-AR-01-LIST-HP-002 | CAP-ARL-01 | FN-AR-LIST | HP | P1 | ceo@xe.vn (group CEO) | có rows | 1. click row → detail | J-* OK | UI | cross-nav |
| TC-XBOS-AR-01-LIST-FD-001 | CAP-ARL-01 | FN-AR-LIST | FD | P1 | ceo@xe.vn (group CEO) | API 500 | 1. mở | banner lỗi | UI |  |
| TC-XBOS-AR-01-LIST-AU-002 | CAP-ARL-01 | FN-AR-LIST | AU | P1 | EMPLOYEE (NV thường) | NV ngoài quyền | 1. GET | 403 hoặc filtered | API | RBAC |

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
| BE API/DTO | asset-request.controller.ts GET list. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-AR-01
cases_designed: 6
code_readiness: LIKELY_IMPL
```
