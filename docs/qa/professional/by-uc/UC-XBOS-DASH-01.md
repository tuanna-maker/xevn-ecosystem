# UC — `UC-XBOS-DASH-01` · Cockpit tổng hợp KPI điều hành

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-DASH-01` |
| **stt_phase1** | 71 |
| **mod** | M01 |
| **name_vi** | Cockpit tổng hợp KPI điều hành |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 71 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #71 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | kpi-engine rollup |
| **api_contract** | GET kpi-engine rollup/cockpit endpoints |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | kpi-engine controller; series[] empty OK; UF-XBOS-10. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Cockpit KPI tập đoàn load không 409 cho Group CEO; empty series hợp lệ.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-D1 | Cockpit KPI | Đọc rollup | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-D1 | FN-D1-OPEN | Mở cockpit | CC | N |
| CAP-D1 | FN-D1-LOAD | Load series | kpi-engine | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-D1-OPEN | 1 | 0 | 0 | 0 | 0 | 1 |
| FN-D1-LOAD | 1 | 1 | 0 | 1 | 1 | 4 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-DASH-01-D1-OPEN-HP-001 | CAP-D1 | FN-D1-OPEN | HP | P0 | ceo@xe.vn / Group CEO | login main | 1. Mở cockpit | UI VI widgets | UI | UF-XBOS-10 |
| TC-DM-DASH-01-D1-LOAD-HP-001 | CAP-D1 | FN-D1-LOAD | HP | P0 | ceo@xe.vn / Group CEO | — | 1. GET rollup | 2xx · series có hoặc [] | API | DASH-01 |
| TC-DM-DASH-01-D1-LOAD-AU-001 | CAP-D1 | FN-D1-LOAD | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. GET holding rollup | 403/409 | API | UF-XBOS-11 |
| TC-DM-DASH-01-D1-LOAD-UX-001 | CAP-D1 | FN-D1-LOAD | UX | P1 | ceo@xe.vn / Group CEO | [] | 1. Charts | empty state · không crash | UI | empty |
| TC-DM-DASH-01-D1-LOAD-FD-001 | CAP-D1 | FN-D1-LOAD | FD | P1 | ceo@xe.vn / Group CEO | 500 | 1. Mở | banner | UI | FD |

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
| BE API/DTO | Controller/service tồn tại cho kpi-engine; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-10; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-DASH-01
cases_designed: 5
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
