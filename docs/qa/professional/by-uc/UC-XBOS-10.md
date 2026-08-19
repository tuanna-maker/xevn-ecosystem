# UC — `UC-XBOS-10` · Nâng mảng kinh doanh thành công ty con

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-10` |
| **stt_phase1** | 22 |
| **mod** | M01 |
| **name_vi** | Nâng mảng kinh doanh thành công ty con |
| **actors** | Group CEO · Org admin |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 22 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · vòng đời tenant/pháp nhân |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST `/api/xbos/org-foundation/business-lines/promote` · `segments/:id/promote` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | org-foundation.controller.ts promote endpoints. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Nâng mảng/segment kinh doanh thành pháp nhân công ty con với hồ sơ và scope mới.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-PR-01 | Promote business line | Tạo CT con từ mảng | Group CEO |
| CAP-PR-02 | Validate điều kiện nâng | Chặn promote thiếu dữ liệu | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-PR-01 | FN-PROMOTE | POST promote | CC Tổ chức · Nâng cấp | Y |
| CAP-PR-02 | FN-PROMOTE-VAL | Validate promote | API | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-PROMOTE | 2 | 0 | 0 | 2 | 2 | 6 |
| FN-PROMOTE-VAL | 0 | 3 | 1 | 0 | 0 | 4 |
| **Tổng** | 2 | 3 | 1 | 2 | 2 | **10** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-10-PRO-HP-001 | CAP-PR-01 | FN-PROMOTE | HP | P0 | ceo@xe.vn (group CEO) | mảng đủ điều kiện | 1. Chọn mảng · Nâng thành CT con · xác nhận | 2xx · pháp nhân mới · cây ORG cập nhật · F5 | UI/API | UC-XBOS-10 |
| TC-XBOS-10-PRO-FD-001 | CAP-PR-02 | FN-PROMOTE-VAL | FD | P0 | ceo@xe.vn (group CEO) | thiếu MST/đại diện | 1. Promote | 4xx · không tạo LE | UI/API | validate |
| TC-XBOS-10-PRO-FD-002 | CAP-PR-02 | FN-PROMOTE-VAL | FD | P0 | ceo@xe.vn (group CEO) | đã promote | 1. Promote lại | 4xx conflict | API |  |
| TC-XBOS-10-PRO-AU-001 | CAP-PR-01 | FN-PROMOTE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. Promote | 403 | API | RBAC |
| TC-XBOS-10-PRO-AU-002 | CAP-PR-01 | FN-PROMOTE | AU | P0 | EMPLOYEE (NV thường) | NV | 1. POST | 403 | API |  |
| TC-XBOS-10-PRO-UX-001 | CAP-PR-01 | FN-PROMOTE | UX | P1 | ceo@xe.vn (group CEO) | sau OK | 1. Mở chi tiết CT mới | deep link OK · không 404 scope | UI | J-* ORG |
| TC-XBOS-10-PRO-BD-001 | CAP-PR-02 | FN-PROMOTE-VAL | BD | P2 | ceo@xe.vn (group CEO) | tên dài | 1. Promote | validate | UI |  |
| TC-XBOS-10-PRO-HP-002 | CAP-PR-01 | FN-PROMOTE | HP | P1 | ceo@xe.vn (group CEO) | segment path | 1. promote qua segments/:id | 2xx tương đương | API | segments/promote |
| TC-XBOS-10-PRO-FD-003 | CAP-PR-02 | FN-PROMOTE-VAL | FD | P1 | ceo@xe.vn (group CEO) | segmentId sai | 1. POST | 404 | API |  |
| TC-XBOS-10-PRO-UX-002 | CAP-PR-01 | FN-PROMOTE | UX | P2 | ceo@xe.vn (group CEO) | đang xử lý | 1. Double submit | một bản ghi | UI |  |

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
| BE API/DTO | org-foundation.controller.ts promote endpoints. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-10
cases_designed: 10
code_readiness: LIKELY_IMPL
```
