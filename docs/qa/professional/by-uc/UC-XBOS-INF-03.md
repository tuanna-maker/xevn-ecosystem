# UC — `UC-XBOS-INF-03` · Xem tóm tắt trạng thái hạ tầng danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-INF-03` |
| **stt_phase1** | 76 |
| **mod** | M01 |
| **name_vi** | Xem tóm tắt trạng thái hạ tầng danh mục |
| **actors** | Group CEO |
| **surfaces** | api / xbos-cc |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 76 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #76 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | infrastructure summary |
| **api_contract** | GET infrastructure summary/status |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | Summary read — pattern API. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem tóm tắt health/status hạ tầng danh mục (publish state, sync).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-I3 | Infra summary | Đọc status | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-I3 | FN-I3-SUM | GET summary | API/UI | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-I3-SUM | 1 | 1 | 0 | 1 | 1 | 4 |
| **Tổng** | 1 | 1 | 0 | 1 | 1 | **4** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-INF-03-I3-SUM-HP-001 | CAP-I3 | FN-I3-SUM | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Mở tóm tắt hạ tầng | 200 status cards | UI/API | INF-03 |
| TC-DM-INF-03-I3-SUM-AU-001 | CAP-I3 | FN-I3-SUM | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. GET holding summary | 403 hoặc thu hẹp | API | AU |
| TC-DM-INF-03-I3-SUM-UX-001 | CAP-I3 | FN-I3-SUM | UX | P1 | ceo@xe.vn / Group CEO | chưa bootstrap | 1. Summary | states pending/empty honest | UI | UX |
| TC-DM-INF-03-I3-SUM-FD-001 | CAP-I3 | FN-I3-SUM | FD | P1 | ceo@xe.vn / Group CEO | API down | 1. Mở | banner | UI | FD |

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
| BE API/DTO | Controller/service tồn tại cho infra summary; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF INF-03; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-INF-03
cases_designed: 4
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
