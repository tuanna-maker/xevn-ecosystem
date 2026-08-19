# UC — `UC-XBOS-12` · Gán hoặc thu hồi quyền; kiểm tra xung đột quyền

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-12` |
| **stt_phase1** | 24 |
| **mod** | M01 |
| **name_vi** | Gán hoặc thu hồi quyền; kiểm tra xung đột quyền |
| **actors** | Security admin |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 24 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · RBAC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST grants · GET grants/conflicts · matrix PUT · position-rbac |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | position-rbac grants + conflicts + matrix. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Gán/thu hồi quyền và phát hiện xung đột quyền trước khi áp dụng.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-GR-01 | Gán/thu hồi quyền | Grants | Admin |
| CAP-GR-02 | Phát hiện xung đột | Conflicts | Admin |
| CAP-GR-03 | Ma trận quyền | Matrix view/edit | Admin |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-GR-01 | FN-GR-GRANT | POST grants | Gán quyền | Y |
| CAP-GR-02 | FN-GR-CONFLICT | GET conflicts | Kiểm tra xung đột | N |
| CAP-GR-03 | FN-GR-MATRIX | GET/PUT matrix | Ma trận | Y |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-GR-GRANT | 2 | 1 | 1 | 2 | 0 | 6 |
| FN-GR-CONFLICT | 1 | 1 | 0 | 0 | 1 | 3 |
| FN-GR-MATRIX | 1 | 1 | 0 | 0 | 1 | 3 |
| **Tổng** | 4 | 3 | 1 | 2 | 2 | **12** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-12-GR-HP-001 | CAP-GR-01 | FN-GR-GRANT | HP | P0 | ceo@xe.vn (group CEO) | user+perm | 1. Gán quyền · Lưu | 2xx · F5 còn grant | UI/API | UC-XBOS-12 |
| TC-XBOS-12-GR-FD-001 | CAP-GR-01 | FN-GR-GRANT | FD | P0 | ceo@xe.vn (group CEO) | perm lạ | 1. Gán | 4xx | API |  |
| TC-XBOS-12-CF-HP-001 | CAP-GR-02 | FN-GR-CONFLICT | HP | P0 | ceo@xe.vn (group CEO) | có conflict tiềm ẩn | 1. GET conflicts | trả danh sách conflict | API | conflicts |
| TC-XBOS-12-CF-UX-001 | CAP-GR-02 | FN-GR-CONFLICT | UX | P1 | ceo@xe.vn (group CEO) | không conflict | 1. GET | [] | API |  |
| TC-XBOS-12-MX-HP-001 | CAP-GR-03 | FN-GR-MATRIX | HP | P0 | ceo@xe.vn (group CEO) | login | 1. Mở ma trận · sửa 1 ô · Lưu | 2xx · F5 | UI/API | matrix |
| TC-XBOS-12-MX-FD-001 | CAP-GR-03 | FN-GR-MATRIX | FD | P0 | ceo@xe.vn (group CEO) | ô invalid | 1. PUT | 4xx | API |  |
| TC-XBOS-12-GR-AU-001 | CAP-GR-01 | FN-GR-GRANT | AU | P0 | EMPLOYEE (NV thường) | NV | 1. POST grants | 403 | API | RBAC |
| TC-XBOS-12-GR-AU-002 | CAP-GR-01 | FN-GR-GRANT | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. grant holding | 403/409 | API | scope |
| TC-XBOS-12-GR-HP-002 | CAP-GR-01 | FN-GR-GRANT | HP | P1 | ceo@xe.vn (group CEO) | đã grant | 1. Thu hồi | 2xx · mất quyền · F5 | UI/API | revoke |
| TC-XBOS-12-CF-FD-001 | CAP-GR-02 | FN-GR-CONFLICT | FD | P1 | ceo@xe.vn (group CEO) | bỏ qua cảnh báo | 1. Cố gán cặp conflict | blocked hoặc warning bắt buộc — AS-IS | UI/API | BR SoD |
| TC-XBOS-12-MX-UX-001 | CAP-GR-03 | FN-GR-MATRIX | UX | P1 | ceo@xe.vn (group CEO) | matrix lớn | 1. scroll/filter | không trắng | UI |  |
| TC-XBOS-12-GR-BD-001 | CAP-GR-01 | FN-GR-GRANT | BD | P2 | ceo@xe.vn (group CEO) | — | 1. grant trùng | idempotent | API |  |

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
| BE API/DTO | position-rbac grants + conflicts + matrix. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-12
cases_designed: 12
code_readiness: LIKELY_IMPL
```
