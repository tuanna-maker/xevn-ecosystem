# UC — `UC-XBOS-INF-02` · Quản lý mẫu siêu dữ liệu theo pháp nhân

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-INF-02` |
| **stt_phase1** | 75 |
| **mod** | M01 |
| **name_vi** | Quản lý mẫu siêu dữ liệu theo pháp nhân |
| **actors** | Group CEO |
| **surfaces** | api / xbos-cc |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 75 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #75 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | metadata templates per LE |
| **api_contract** | GET/PUT infrastructure metadata templates by entity |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | Metadata template per LE — verify FE surface. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

CRUD mẫu siêu dữ liệu gắn pháp nhân; không lẫn LE.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-I2 | Metadata templates | per LE | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-I2 | FN-I2-LIST | List templates LE | GET | N |
| CAP-I2 | FN-I2-SAVE | Lưu mẫu | PUT/POST | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-I2-LIST | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-I2-SAVE | 1 | 2 | 0 | 0 | 0 | 3 |
| **Tổng** | 2 | 2 | 0 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-INF-02-I2-LIST-HP-001 | CAP-I2 | FN-I2-LIST | HP | P0 | ceo@xe.vn / Group CEO | chọn LE | 1. List | 200 scoped | API/UI | INF-02 |
| TC-DM-INF-02-I2-LIST-AU-001 | CAP-I2 | FN-I2-LIST | AU | P0 | du-lich.ceo@xe.vn / Member CEO | — | 1. List LE khác | 403/404 | API | AU |
| TC-DM-INF-02-I2-SAVE-HP-001 | CAP-I2 | FN-I2-SAVE | HP | P0 | ceo@xe.vn / Group CEO | LE | 1. Lưu mẫu 2. F5 | 2xx sticky | UI/API | INF-02 |
| TC-DM-INF-02-I2-SAVE-FD-001 | CAP-I2 | FN-I2-SAVE | FD | P0 | ceo@xe.vn / Group CEO | — | 1. Schema field invalid | 4xx | API | FD |
| TC-DM-INF-02-I2-SAVE-FD-002 | CAP-I2 | FN-I2-SAVE | FD | P1 | ceo@xe.vn / Group CEO | — | 1. Lưu nhầm entityId | scope fail | API | cross-LE |
| TC-DM-INF-02-I2-LIST-UX-001 | CAP-I2 | FN-I2-LIST | UX | P1 | ceo@xe.vn / Group CEO | 0 | 1. List | empty | UI | empty |

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
| BE API/DTO | Controller/service tồn tại cho metadata templates; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF INF-02; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-INF-02
cases_designed: 6
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
