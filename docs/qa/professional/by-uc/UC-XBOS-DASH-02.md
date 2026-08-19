# UC — `UC-XBOS-DASH-02` · Bảng KPI theo công ty

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-DASH-02` |
| **stt_phase1** | 72 |
| **mod** | M01 |
| **name_vi** | Bảng KPI theo công ty |
| **actors** | Group CEO · Member CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 72 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #72 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | kpi-engine per company |
| **api_contract** | GET kpi by companyId |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | Per-company KPI table; scope parity list↔detail. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem bảng KPI theo từng công ty trong scope.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-D2 | KPI by company | Đọc | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-D2 | FN-D2-TBL | Bảng theo CT | GET | N |
| CAP-D2 | FN-D2-NAV | Click CT → detail KPI | UI | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-D2-TBL | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-D2-NAV | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-DASH-02-D2-TBL-HP-001 | CAP-D2 | FN-D2-TBL | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Mở bảng KPI CT | rows members | UI/API | DASH-02 |
| TC-DM-DASH-02-D2-TBL-AU-001 | CAP-D2 | FN-D2-TBL | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Bảng | chỉ CT mình | API | AU |
| TC-DM-DASH-02-D2-NAV-HP-001 | CAP-D2 | FN-D2-NAV | HP | P1 | ceo@xe.vn / Group CEO | có row | 1. Click CT | detail load J-* | UI | L2.5 |
| TC-DM-DASH-02-D2-NAV-FD-001 | CAP-D2 | FN-D2-NAV | FD | P1 | ceo@xe.vn / Group CEO | — | 1. companyId lạ | 404/409 | API | FD |
| TC-DM-DASH-02-D2-TBL-UX-001 | CAP-D2 | FN-D2-TBL | UX | P1 | ceo@xe.vn / Group CEO | [] | 1. Bảng | empty | UI | empty |

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
| BE API/DTO | Controller/service tồn tại cho kpi by company; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF DASH-02; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-DASH-02
cases_designed: 5
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
