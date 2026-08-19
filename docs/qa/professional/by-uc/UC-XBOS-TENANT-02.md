# UC — `UC-XBOS-TENANT-02` · Xem tổng quan tổ chức tập đoàn theo quyền

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-TENANT-02` |
| **stt_phase1** | 46 |
| **mod** | M01 |
| **name_vi** | Xem tổng quan tổ chức tập đoàn theo quyền |
| **actors** | Group CEO · Member (negative) |
| **surfaces** | api / web-portal |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 46 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #46 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE · group-org-overview |
| **api_contract** | GET `/api/xbos/tenant-scope/group-org-overview` · `XBOS-TENANT-200` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | groupOrgOverview; member expect thu hẹp / 403 tùy service. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Group CEO xem overview tổ chức tập đoàn; member không vượt quyền.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-T-OV | Overview tập đoàn | Đọc tree/summary | Group CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-T-OV | FN-T-OV | GET group-org-overview | API/CC | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-T-OV | 1 | 1 | 0 | 1 | 1 | 4 |
| **Tổng** | 1 | 1 | 0 | 1 | 1 | **4** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-TENANT-02-T-OV-HP-001 | CAP-T-OV | FN-T-OV | HP | P0 | ceo@xe.vn / Group CEO | login main | 1. GET overview | 200 · có holding + members summary | API/UI | TENANT-02 |
| TC-DM-TENANT-02-T-OV-AU-001 | CAP-T-OV | FN-T-OV | AU | P0 | du-lich.ceo@xe.vn / Member CEO | login member | 1. GET overview | 403 hoặc payload thu hẹp deterministic | API | UF-XBOS-11 |
| TC-DM-TENANT-02-T-OV-UX-001 | CAP-T-OV | FN-T-OV | UX | P1 | ceo@xe.vn / Group CEO | API lỗi | 1. Mở overview khi BE down | banner lỗi honest · không mock giả là data thật (P0-09 liên quan) | UI | error UX |
| TC-DM-TENANT-02-T-OV-FD-001 | CAP-T-OV | FN-T-OV | FD | P1 | ceo@xe.vn / Group CEO | userId spoof header | 1. x-user-id người khác khi JWT khác | JWT thắng · không escalate | API | resolveUserId |

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
| BE API/DTO | Controller/service tồn tại cho GET /tenant-scope/group-org-overview; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF TENANT-02; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-TENANT-02
cases_designed: 4
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
