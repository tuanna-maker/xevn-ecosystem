# UC — `UC-XBOS-CC-05` · Thanh điều hành — KPI / tác vụ / cảnh báo

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CC-05` |
| **stt_phase1** | 61 |
| **mod** | M01 |
| **name_vi** | Thanh điều hành — KPI / tác vụ / cảnh báo |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 61 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #61 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE · command-center strip |
| **api_contract** | GET kpi-engine / alerts / workflow tasks summary |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | Widgets CC; KPI series[] empty hợp lệ; member 409 holding. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Thanh điều hành hiển thị KPI/tác vụ/cảnh báo đúng persona; không 409 trên Group CEO main.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CC05 | Ops strip | Đọc 3 vùng | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CC05 | FN-CC05-KPI | KPI strip | kpi-engine | N |
| CAP-CC05 | FN-CC05-TASK | Tác vụ chờ | WF tasks | N |
| CAP-CC05 | FN-CC05-ALRT | Cảnh báo | alerts | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CC05-KPI | 1 | 0 | 0 | 1 | 0 | 2 |
| FN-CC05-TASK | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-CC05-ALRT | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 3 | 1 | 0 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-CC-05-CC05-KPI-HP-001 | CAP-CC05 | FN-CC05-KPI | HP | P0 | ceo@xe.vn / Group CEO | login main | 1. Quan sát widget KPI | 2xx hoặc series[] · label VI | UI/API | UF-XBOS-10 |
| TC-DM-CC-05-CC05-KPI-AU-001 | CAP-CC05 | FN-CC05-KPI | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Rollup holding | 403/409 | API | UF-XBOS-11 |
| TC-DM-CC-05-CC05-TASK-HP-001 | CAP-CC05 | FN-CC05-TASK | HP | P0 | ceo@xe.vn / Group CEO | — | 1. Vùng Việc cần xử lý | count ≥0 · click → inbox | UI | CC-05 |
| TC-DM-CC-05-CC05-TASK-UX-001 | CAP-CC05 | FN-CC05-TASK | UX | P1 | ceo@xe.vn / Group CEO | 0 task | 1. Strip | 0 hợp lệ | UI | empty |
| TC-DM-CC-05-CC05-ALRT-HP-001 | CAP-CC05 | FN-CC05-ALRT | HP | P1 | ceo@xe.vn / Group CEO | — | 1. Vùng cảnh báo | 2xx/empty | UI/API | alerts |
| TC-DM-CC-05-CC05-ALRT-FD-001 | CAP-CC05 | FN-CC05-ALRT | FD | P1 | ceo@xe.vn / Group CEO | API 500 | 1. Mở strip | banner · không fake alert | UI | FD |

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
| BE API/DTO | Controller/service tồn tại cho CC strip; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF CC-05; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CC-05
cases_designed: 6
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
