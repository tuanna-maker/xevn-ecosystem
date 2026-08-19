# UC — `UC-RACI-06` · Báo cáo độ phủ số hóa theo công ty

| Meta | Value |
|------|--------|
| **uc_id** | `UC-RACI-06` |
| **stt_phase1** | 70 |
| **mod** | M00 |
| **name_vi** | Báo cáo độ phủ số hóa theo công ty |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 70 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #70 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | coverage endpoint |
| **api_contract** | GET `/api/xbos/raci-governance/companies/:companyId/coverage` `XBOS-RACI-200` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | getCoverage trên controller. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem báo cáo độ phủ RACI/số hóa theo công ty (companyId path main hoặc UUID).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-R6 | Coverage report | Đọc | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-R6 | FN-R6-COV | GET coverage | API/UI | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-R6-COV | 2 | 1 | 0 | 1 | 1 | 5 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-RACI-06-R6-COV-HP-001 | CAP-R6 | FN-R6-COV | HP | P0 | ceo@xe.vn / Group CEO | login | 1. GET coverage company | 200 metrics | API/UI | RACI-06 |
| TC-RACI-06-R6-COV-HP-002 | CAP-R6 | FN-R6-COV | HP | P1 | ceo@xe.vn / Group CEO | — | 1. path companyId=main | 200 holding partition | API | main |
| TC-RACI-06-R6-COV-AU-001 | CAP-R6 | FN-R6-COV | AU | P0 | du-lich.ceo@xe.vn / Member CEO | — | 1. coverage LE khác | 403/404 | API | AU |
| TC-RACI-06-R6-COV-UX-001 | CAP-R6 | FN-R6-COV | UX | P1 | ceo@xe.vn / Group CEO | 0 cells | 1. Coverage | 0% / empty honest | UI | empty |
| TC-RACI-06-R6-COV-FD-001 | CAP-R6 | FN-R6-COV | FD | P1 | ceo@xe.vn / Group CEO | — | 1. companyId không tồn tại | `XBOS-RACI-404` | API | 404 |

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
| BE API/DTO | Controller/service tồn tại cho raci coverage; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF RACI-06; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-RACI-06
cases_designed: 5
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
