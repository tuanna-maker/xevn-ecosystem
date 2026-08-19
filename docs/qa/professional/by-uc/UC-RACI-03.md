# UC — `UC-RACI-03` · Xem ánh xạ chức năng phân hệ cho hoạt động

| Meta | Value |
|------|--------|
| **uc_id** | `UC-RACI-03` |
| **stt_phase1** | 67 |
| **mod** | M00 |
| **name_vi** | Xem ánh xạ chức năng phân hệ cho hoạt động |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 67 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #67 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | raci capabilities |
| **api_contract** | GET `/api/xbos/raci-governance/capabilities` `XBOS-RACI-200` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | listCapabilities. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem mapping activity → capability/module chức năng phân hệ.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-R3 | Capabilities map | Đọc | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-R3 | FN-R3-CAP | GET capabilities | API/UI | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-R3-CAP | 2 | 1 | 0 | 1 | 1 | 5 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-RACI-03-R3-CAP-HP-001 | CAP-R3 | FN-R3-CAP | HP | P0 | ceo@xe.vn / Group CEO | login | 1. GET capabilities | 200 | API/UI | RACI-03 |
| TC-RACI-03-R3-CAP-HP-002 | CAP-R3 | FN-R3-CAP | HP | P1 | ceo@xe.vn / Group CEO | — | 1. Filter activityCode | subset đúng | API | filter |
| TC-RACI-03-R3-CAP-UX-001 | CAP-R3 | FN-R3-CAP | UX | P1 | ceo@xe.vn / Group CEO | code lạ | 1. Filter | empty | UI | empty |
| TC-RACI-03-R3-CAP-AU-001 | CAP-R3 | FN-R3-CAP | AU | P0 | (chưa đăng nhập) | — | 1. GET | 401 | API | AU |
| TC-RACI-03-R3-CAP-FD-001 | CAP-R3 | FN-R3-CAP | FD | P2 | ceo@xe.vn / Group CEO | — | 1. BE error | banner | UI | FD |

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
| BE API/DTO | Controller/service tồn tại cho raci capabilities; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF RACI-03; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-RACI-03
cases_designed: 5
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
