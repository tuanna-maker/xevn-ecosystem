# UC — `UC-XBOS-11` · Quản lý mẫu chức danh và gán vị trí (kiêm nhiệm)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-11` |
| **stt_phase1** | 23 |
| **mod** | M01 |
| **name_vi** | Quản lý mẫu chức danh và gán vị trí (kiêm nhiệm) |
| **actors** | Group admin RBAC |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 23 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · RBAC roles |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | position-rbac templates/assignments · `/api/xbos/position-rbac/*` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | position-rbac.controller.ts templates + assignments. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Quản lý mẫu chức danh và gán vị trí (kể cả kiêm nhiệm đa CT) đúng membership.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-POS-01 | CRUD mẫu chức danh | Templates | Admin |
| CAP-POS-02 | Gán vị trí / kiêm nhiệm | Assignments | Admin |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-POS-01 | FN-POS-TPL-LIST | List templates | GET templates | N |
| CAP-POS-01 | FN-POS-TPL-SAVE | Create/Update template | POST/PUT templates | Y |
| CAP-POS-02 | FN-POS-ASSIGN | Assign position | POST assignments | Y |
| CAP-POS-02 | FN-POS-ASSIGN-LIST | List assignments | GET assignments | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-POS-TPL-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-POS-TPL-SAVE | 2 | 1 | 0 | 1 | 0 | 4 |
| FN-POS-ASSIGN | 2 | 1 | 1 | 1 | 0 | 5 |
| FN-POS-ASSIGN-LIST | 1 | 0 | 0 | 0 | 0 | 1 |
| **Tổng** | 6 | 2 | 1 | 2 | 1 | **12** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-11-TPL-HP-001 | CAP-POS-01 | FN-POS-TPL-LIST | HP | P0 | ceo@xe.vn (group CEO) | login | 1. Mở quản lý mẫu chức danh | list 2xx | UI/API | UC-XBOS-11 |
| TC-XBOS-11-TPL-HP-002 | CAP-POS-01 | FN-POS-TPL-SAVE | HP | P0 | ceo@xe.vn (group CEO) | form | 1. Tạo mẫu · Lưu | 2xx · F5 còn | UI/API |  |
| TC-XBOS-11-TPL-FD-001 | CAP-POS-01 | FN-POS-TPL-SAVE | FD | P0 | ceo@xe.vn (group CEO) | — | 1. thiếu tên mẫu | 4xx | UI/API |  |
| TC-XBOS-11-ASN-HP-001 | CAP-POS-02 | FN-POS-ASSIGN | HP | P0 | ceo@xe.vn (group CEO) | user+template | 1. Gán vị trí 1 CT | 2xx · hiện assignment | UI/API | kiêm nhiệm |
| TC-XBOS-11-ASN-HP-002 | CAP-POS-02 | FN-POS-ASSIGN | HP | P0 | ceo@xe.vn (group CEO) | đã có 1 CT | 1. Gán thêm CT khác | 2xx · memberships phản ánh | UI/API | ADR multi-hat |
| TC-XBOS-11-ASN-FD-001 | CAP-POS-02 | FN-POS-ASSIGN | FD | P0 | ceo@xe.vn (group CEO) | — | 1. gán user không tồn tại | 4xx | API |  |
| TC-XBOS-11-ASN-AU-001 | CAP-POS-02 | FN-POS-ASSIGN | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. gán ngoài CT | 403/409 | API | scope |
| TC-XBOS-11-TPL-AU-001 | CAP-POS-01 | FN-POS-TPL-SAVE | AU | P0 | EMPLOYEE (NV thường) | NV | 1. POST template | 403 | API | RBAC |
| TC-XBOS-11-ASN-LIST-HP-001 | CAP-POS-02 | FN-POS-ASSIGN-LIST | HP | P1 | ceo@xe.vn (group CEO) | có assignments | 1. GET list | đủ bản ghi | API |  |
| TC-XBOS-11-TPL-UX-001 | CAP-POS-01 | FN-POS-TPL-LIST | UX | P1 | ceo@xe.vn (group CEO) | trống | 1. list | empty OK | UI |  |
| TC-XBOS-11-ASN-BD-001 | CAP-POS-02 | FN-POS-ASSIGN | BD | P2 | ceo@xe.vn (group CEO) | — | 1. gán trùng cùng CT+role | conflict rõ | API |  |
| TC-XBOS-11-TPL-HP-003 | CAP-POS-01 | FN-POS-TPL-SAVE | HP | P1 | ceo@xe.vn (group CEO) | template có | 1. Sửa · Lưu | F5 | UI |  |

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
| BE API/DTO | position-rbac.controller.ts templates + assignments. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-11
cases_designed: 12
code_readiness: LIKELY_IMPL
```
