# UC — `UC-CC-03` · Chi tiết đơn vị thành viên — hồ sơ pháp nhân và liên kết

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-03` |
| **stt_phase1** | 59 |
| **mod** | M00 |
| **name_vi** | Chi tiết đơn vị thành viên — hồ sơ pháp nhân và liên kết |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 59 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #59 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE §8 · legal-entities GET |
| **api_contract** | GET `/api/xbos/org-foundation/legal-entities/:entityId` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | Detail LE + tabs cổ đông/RACI/docs; UF-XBOS-02/03. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Mở chi tiết đơn vị thành viên: hồ sơ pháp nhân, điều hướng tab liên quan không 404 scope.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CC03 | Member unit detail | Đọc LE | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CC03 | FN-CC03-OPEN | Mở detail (và fetchHoldingLegalEntities) | GET LE | N |
| CAP-CC03 | FN-CC03-TAB | Chuyển tab hồ sơ/cổ đông/RACI | CC tabs | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CC03-OPEN | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-CC03-TAB | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-03-CC03-OPEN-HP-001 | CAP-CC03 | FN-CC03-OPEN | HP | P0 | ceo@xe.vn / Group CEO | list có row | 1. Click Chỉnh sửa/detail | 200 · form hồ sơ | UI/API | UF-XBOS-02 |
| TC-CC-03-CC03-OPEN-AU-001 | CAP-CC03 | FN-CC03-OPEN | AU | P0 | du-lich.ceo@xe.vn / Member CEO | LE khác | 1. Deep link | 403/404 | API | AU |
| TC-CC-03-CC03-OPEN-FD-001 | CAP-CC03 | FN-CC03-OPEN | FD | P1 | ceo@xe.vn / Group CEO | — | 1. UUID lạ | 404 | API | 404 |
| TC-CC-03-CC03-TAB-HP-001 | CAP-CC03 | FN-CC03-TAB | HP | P0 | ceo@xe.vn / Group CEO | detail mở | 1. Tab cổ đông → RACI | load OK · J L2.5 | UI | cross-nav |
| TC-CC-03-CC03-TAB-UX-001 | CAP-CC03 | FN-CC03-TAB | UX | P1 | ceo@xe.vn / Group CEO | — | 1. Tab chậm | loading per tab | UI | UX |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 1 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 0 | YES | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho legal-entities/:id; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF CC-03; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-03
cases_designed: 5
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
