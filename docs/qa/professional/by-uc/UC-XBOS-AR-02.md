# UC — `UC-XBOS-AR-02` · Tạo yêu cầu tài sản mới

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-AR-02` |
| **stt_phase1** | 39 |
| **mod** | M01 |
| **name_vi** | Tạo yêu cầu tài sản mới |
| **actors** | Requester |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 39 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST `/api/xbos/asset-requests` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | POST asset-request.controller.ts. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Tạo yêu cầu tài sản mới với dữ liệu hợp lệ và thấy trên danh sách sau Lưu/F5.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-ARC-01 | Create AR | Tạo mới | Requester |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-ARC-01 | FN-AR-CREATE | POST asset-request | Tạo mới · Lưu | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-AR-CREATE | 2 | 3 | 2 | 2 | 1 | 10 |
| **Tổng** | 2 | 3 | 2 | 2 | 1 | **10** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-AR-02-CR-HP-001 | CAP-ARC-01 | FN-AR-CREATE | HP | P0 | Employee / requester | form | 1. Nhập loại/SL/lý do · Lưu | 2xx · xuất hiện list · F5 còn | UI/API | UC-XBOS-AR-02 |
| TC-XBOS-AR-02-CR-FD-001 | CAP-ARC-01 | FN-AR-CREATE | FD | P0 | Employee / requester | — | 1. thiếu field bắt buộc | 4xx · không tạo | UI/API | validate |
| TC-XBOS-AR-02-CR-FD-002 | CAP-ARC-01 | FN-AR-CREATE | FD | P0 | Employee / requester | — | 1. loại tài sản không thuộc master | 4xx | API | MD bind |
| TC-XBOS-AR-02-CR-AU-001 | CAP-ARC-01 | FN-AR-CREATE | AU | P0 | EMPLOYEE (NV thường) | không quyền | 1. POST | 403 | API | RBAC |
| TC-XBOS-AR-02-CR-AU-002 | CAP-ARC-01 | FN-AR-CREATE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | company lệch | 1. POST | 409 | API | scope |
| TC-XBOS-AR-02-CR-BD-001 | CAP-ARC-01 | FN-AR-CREATE | BD | P1 | Employee / requester | — | 1. SL=0 | 4xx | UI | BD |
| TC-XBOS-AR-02-CR-BD-002 | CAP-ARC-01 | FN-AR-CREATE | BD | P1 | Employee / requester | có tiền | 1. nhập số tiền có dấu phân nhóm | API nhận số thuần | UI/API | vi-VN |
| TC-XBOS-AR-02-CR-UX-001 | CAP-ARC-01 | FN-AR-CREATE | UX | P1 | Employee / requester | sau tạo | 1. toast + list | FE sau 2xx đúng SRS | UI | post-mutate FE |
| TC-XBOS-AR-02-CR-HP-002 | CAP-ARC-01 | FN-AR-CREATE | HP | P1 | Employee / requester | draft nếu có | 1. lưu nháp rồi gửi | AS-IS document | UI |  |
| TC-XBOS-AR-02-CR-FD-003 | CAP-ARC-01 | FN-AR-CREATE | FD | P2 | Employee / requester | API 500 | 1. Lưu | không báo thành công giả | UI |  |

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
| BE API/DTO | POST asset-request.controller.ts. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-AR-02
cases_designed: 10
code_readiness: LIKELY_IMPL
```
