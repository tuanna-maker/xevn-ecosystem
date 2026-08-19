# UC — `UC-XBOS-ORG-03` · Lưu hồ sơ pháp nhân (mã số thuế, đại diện, vốn…)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-ORG-03` |
| **stt_phase1** | 27 |
| **mod** | M01 |
| **name_vi** | Lưu hồ sơ pháp nhân (mã số thuế, đại diện, vốn…) |
| **actors** | Group CEO · Legal admin |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 27 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | PUT `/api/xbos/org-foundation/legal-entities/:entityId` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | PUT legal-entities · vốn dùng vi-VN grouping trên FE. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Lưu hồ sơ pháp nhân (MST, đại diện, vốn điều lệ…) đúng định dạng và scope.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-LE-01 | Xem hồ sơ pháp nhân | Load profile | CEO |
| CAP-LE-02 | Lưu hồ sơ | Persist fields | Admin |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-LE-01 | FN-LE-GET | GET legal-entity | Chi tiết pháp nhân | N |
| CAP-LE-02 | FN-LE-SAVE | PUT legal-entity | Lưu | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LE-GET | 2 | 0 | 0 | 0 | 1 | 3 |
| FN-LE-SAVE | 2 | 2 | 1 | 2 | 0 | 7 |
| **Tổng** | 4 | 2 | 1 | 2 | 1 | **10** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-ORG-03-GET-HP-001 | CAP-LE-01 | FN-LE-GET | HP | P0 | ceo@xe.vn (group CEO) | login | 1. Mở chi tiết pháp nhân | form load MST/đại diện/vốn | UI/API | UC-XBOS-ORG-03 |
| TC-XBOS-ORG-03-SAVE-HP-001 | CAP-LE-02 | FN-LE-SAVE | HP | P0 | ceo@xe.vn (group CEO) | form hợp lệ | 1. Sửa đại diện · nhập vốn có thousand-group · Lưu | 2xx · F5 còn · API số thuần | UI/API | vi-VN money |
| TC-XBOS-ORG-03-SAVE-FD-001 | CAP-LE-02 | FN-LE-SAVE | FD | P0 | ceo@xe.vn (group CEO) | — | 1. MST sai định dạng | 4xx · không lưu | UI/API | validate |
| TC-XBOS-ORG-03-SAVE-FD-002 | CAP-LE-02 | FN-LE-SAVE | FD | P0 | ceo@xe.vn (group CEO) | — | 1. thiếu đại diện bắt buộc | 4xx | UI/API |  |
| TC-XBOS-ORG-03-SAVE-BD-001 | CAP-LE-02 | FN-LE-SAVE | BD | P1 | ceo@xe.vn (group CEO) | — | 1. vốn = 0 / rất lớn | validate rõ | UI | BD |
| TC-XBOS-ORG-03-SAVE-AU-001 | CAP-LE-02 | FN-LE-SAVE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. Sửa hồ sơ holding | 403/409 | API | scope |
| TC-XBOS-ORG-03-SAVE-AU-002 | CAP-LE-02 | FN-LE-SAVE | AU | P0 | EMPLOYEE (NV thường) | NV | 1. PUT | 403 | API | RBAC |
| TC-XBOS-ORG-03-GET-UX-001 | CAP-LE-01 | FN-LE-GET | UX | P1 | ceo@xe.vn (group CEO) | field null | 1. Xem hồ sơ thiếu vốn | hiển thị — · không epoch junk | UI | locale |
| TC-XBOS-ORG-03-SAVE-HP-002 | CAP-LE-02 | FN-LE-SAVE | HP | P1 | ceo@xe.vn (group CEO) | đã lưu | 1. Đổi MST hợp lệ · F5 | còn | UI |  |
| TC-XBOS-ORG-03-GET-HP-002 | CAP-LE-01 | FN-LE-GET | HP | P1 | ceo@xe.vn (group CEO) | list LE | 1. list→detail | J-* cross-nav OK | UI | J-* |

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
| BE API/DTO | PUT legal-entities · vốn dùng vi-VN grouping trên FE. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-ORG-03
cases_designed: 10
code_readiness: LIKELY_IMPL
```
