# UC — `UC-CC-04` · Lưu thông tin pháp nhân

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-04` |
| **stt_phase1** | 60 |
| **mod** | M00 |
| **name_vi** | Lưu thông tin pháp nhân |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 60 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #60 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE §8 · PUT legal-entities |
| **api_contract** | PUT/POST `/api/xbos/org-foundation/legal-entities/:entityId` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | UF-XBOS-03 PUT 200 + F5. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Sửa và Lưu hồ sơ pháp nhân (tên, MST, địa chỉ, đại diện…) sticky sau F5.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CC04 | Lưu hồ sơ LE | PUT profile | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CC04 | FN-CC04-SAVE | Lưu thay đổi | PUT LE | Y |
| CAP-CC04 | FN-CC04-VAL | Validate MST/fields | PUT | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CC04-SAVE | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-CC04-VAL | 0 | 1 | 1 | 0 | 0 | 2 |
| **Tổng** | 1 | 2 | 1 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-04-CC04-SAVE-HP-001 | CAP-CC04 | FN-CC04-SAVE | HP | P0 | ceo@xe.vn / Group CEO | detail member | 1. Sửa địa chỉ 2. Lưu thay đổi 3. F5 | PUT 200 · sticky · UF-XBOS-03 | UI/API | UF-XBOS-03 |
| TC-CC-04-CC04-SAVE-FD-001 | CAP-CC04 | FN-CC04-SAVE | FD | P0 | ceo@xe.vn / Group CEO | form | 1. Xóa tên bắt buộc → Lưu | 4xx/FE block | UI/API | FD |
| TC-CC-04-CC04-SAVE-AU-001 | CAP-CC04 | FN-CC04-SAVE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. PUT LE tập đoàn | 403/409 | API | AU |
| TC-CC-04-CC04-VAL-FD-001 | CAP-CC04 | FN-CC04-VAL | FD | P0 | ceo@xe.vn / Group CEO | form | 1. MST sai định dạng | 4xx | API | MST |
| TC-CC-04-CC04-VAL-BD-001 | CAP-CC04 | FN-CC04-VAL | BD | P1 | ceo@xe.vn / Group CEO | form | 1. Vốn điều lệ vi-VN grouping | parse number đúng | UI | money |
| TC-CC-04-CC04-SAVE-UX-001 | CAP-CC04 | FN-CC04-SAVE | UX | P1 | ceo@xe.vn / Group CEO | sau 200 | 1. Quan sát toast | toast success · không overlay kẹt | UI | UX |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 1 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 2 | PARTIAL | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho PUT legal-entities; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-03; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-04
cases_designed: 6
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
