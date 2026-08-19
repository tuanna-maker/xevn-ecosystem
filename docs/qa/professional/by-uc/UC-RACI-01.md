# UC — `UC-RACI-01` · Xem danh mục hoạt động RACI theo khối nghiệp vụ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-RACI-01` |
| **stt_phase1** | 65 |
| **mod** | M00 |
| **name_vi** | Xem danh mục hoạt động RACI theo khối nghiệp vụ |
| **actors** | Group CEO / Governance |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 65 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #65 · matrix SRS Có |
| **srs_new** | N/A-DELTA · raci catalog |
| **tech_spec** | DB_DESIGN_XBOS_RACI_RBAC · TECHSPEC_HE §8 |
| **api_contract** | GET `/api/xbos/raci-governance/catalog` `XBOS-RACI-200` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | raci-governance.controller catalog. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem catalog hoạt động RACI theo domain/khối.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-R1 | Catalog RACI | Đọc | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-R1 | FN-R1-CAT | GET catalog | API/UI | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-R1-CAT | 1 | 1 | 0 | 1 | 1 | 4 |
| **Tổng** | 1 | 1 | 0 | 1 | 1 | **4** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-RACI-01-R1-CAT-HP-001 | CAP-R1 | FN-R1-CAT | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Mở RACI catalog / GET | `XBOS-RACI-200` · activities | UI/API | RACI-01 |
| TC-RACI-01-R1-CAT-UX-001 | CAP-R1 | FN-R1-CAT | UX | P1 | ceo@xe.vn / Group CEO | domain filter rỗng | 1. Filter domain không có | empty hợp lệ | UI | empty |
| TC-RACI-01-R1-CAT-AU-001 | CAP-R1 | FN-R1-CAT | AU | P0 | (chưa đăng nhập) | — | 1. GET không auth | 401 | API | AU |
| TC-RACI-01-R1-CAT-FD-001 | CAP-R1 | FN-R1-CAT | FD | P1 | ceo@xe.vn / Group CEO | — | 1. domain invalid | 4xx hoặc empty deterministic | API | FD |

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
| BE API/DTO | Controller/service tồn tại cho raci-governance/catalog; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF RACI-01; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-RACI-01
cases_designed: 4
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
