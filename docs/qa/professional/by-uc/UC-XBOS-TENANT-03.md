# UC — `UC-XBOS-TENANT-03` · Liệt kê đơn vị thành viên trong tập đoàn

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-TENANT-03` |
| **stt_phase1** | 47 |
| **mod** | M01 |
| **name_vi** | Liệt kê đơn vị thành viên trong tập đoàn |
| **actors** | Group CEO · Member |
| **surfaces** | api / web-portal |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 47 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #47 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE · group-member-units |
| **api_contract** | GET `/api/xbos/tenant-scope/group-member-units` · `XBOS-TENANT-200` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | groupMemberUnits + FE list member units UF-XBOS-02. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Liệt kê đơn vị thành viên; Group CEO thấy đủ; Member chỉ phạm vi được phép.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-T-MU | Member units list | List LE | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-T-MU | FN-T-MU | GET group-member-units | CC list | N |
| CAP-T-MU | FN-T-MU-NAV | Click → chi tiết đơn vị | CC detail | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-T-MU | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-T-MU-NAV | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-TENANT-03-T-MU-HP-001 | CAP-T-MU | FN-T-MU | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Mở list đơn vị / GET API | 200 · ≥1 member row · VI labels | UI/API | UF-XBOS-02 |
| TC-DM-TENANT-03-T-MU-AU-001 | CAP-T-MU | FN-T-MU | AU | P0 | du-lich.ceo@xe.vn / Member CEO | login member | 1. GET member-units | 403 hoặc chỉ CT mình | API | AU |
| TC-DM-TENANT-03-T-MU-UX-001 | CAP-T-MU | FN-T-MU | UX | P1 | ceo@xe.vn / Group CEO | empty group (edge) | 1. List | empty hợp lệ | UI | empty |
| TC-DM-TENANT-03-T-MU-NAV-HP-001 | CAP-T-MU | FN-T-MU-NAV | HP | P0 | ceo@xe.vn / Group CEO | list có row | 1. Click đơn vị → detail | detail load · không 404 scope (J-* L2.5) | UI | J-XBOS member detail |
| TC-DM-TENANT-03-T-MU-NAV-FD-001 | CAP-T-MU | FN-T-MU-NAV | FD | P1 | ceo@xe.vn / Group CEO | id giả trên URL | 1. Deep link UUID lạ | 404/403 honest | UI/API | deep link |

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
| BE API/DTO | Controller/service tồn tại cho GET /tenant-scope/group-member-units; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-02; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-TENANT-03
cases_designed: 5
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
