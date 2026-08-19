# UC — `UC-RACI-04` · Gán cột RACI với chức danh

| Meta | Value |
|------|--------|
| **uc_id** | `UC-RACI-04` |
| **stt_phase1** | 68 |
| **mod** | M00 |
| **name_vi** | Gán cột RACI với chức danh |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 68 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #68 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | matrix org_column ↔ position |
| **api_contract** | PUT matrix/cell + org_column_id · position catalog |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | Gán cột qua org_column_id; FE picker chức danh có thể PARTIAL. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Gán/hiểu cột ma trận RACI với chức danh; lưu cell phản ánh cột đúng.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-R4 | Map column–position | Gán cột | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-R4 | FN-R4-MAP | Gán cột–chức danh | UI+PUT | Y |
| CAP-R4 | FN-R4-VIEW | Xem cột | GET matrix | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-R4-MAP | 1 | 1 | 1 | 1 | 0 | 4 |
| FN-R4-VIEW | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 2 | 1 | 1 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-RACI-04-R4-VIEW-HP-001 | CAP-R4 | FN-R4-VIEW | HP | P0 | ceo@xe.vn / Group CEO | matrix | 1. Xem header cột | cột = chức danh/org role | UI | RACI-04 |
| TC-RACI-04-R4-MAP-HP-001 | CAP-R4 | FN-R4-MAP | HP | P0 | ceo@xe.vn / Group CEO | có position catalog | 1. Gán cột 2. Lưu cell 3. F5 | 201 sticky | UI/API | RACI-04 |
| TC-RACI-04-R4-MAP-FD-001 | CAP-R4 | FN-R4-MAP | FD | P0 | ceo@xe.vn / Group CEO | — | 1. org_column_id không tồn tại | 4xx | API | FD |
| TC-RACI-04-R4-MAP-AU-001 | CAP-R4 | FN-R4-MAP | AU | P0 | du-lich.ceo@xe.vn / Member CEO | — | 1. Gán cột LE ngoài scope | 403/409 | API | AU |
| TC-RACI-04-R4-MAP-BD-001 | CAP-R4 | FN-R4-MAP | BD | P2 | ceo@xe.vn / Group CEO | — | 1. Một cột nhiều letters | theo BR | API | BD |
| TC-RACI-04-R4-VIEW-UX-001 | CAP-R4 | FN-R4-VIEW | UX | P1 | ceo@xe.vn / Group CEO | catalog position trống | 1. Mở gán | empty picker honest | UI | UX |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 1 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 1 | YES | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho org_column_id; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF RACI-04; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-RACI-04
cases_designed: 6
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
