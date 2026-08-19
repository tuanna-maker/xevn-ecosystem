# UC — `UC-XBOS-TENANT-01` · Liệt kê tenant / công ty người dùng được truy cập

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-TENANT-01` |
| **stt_phase1** | 45 |
| **mod** | M01 |
| **name_vi** | Liệt kê tenant / công ty người dùng được truy cập |
| **actors** | User đã login |
| **surfaces** | api / web-portal |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 45 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #45 · matrix SRS Có |
| **srs_new** | N/A-DELTA · tenant-scope |
| **tech_spec** | TECHSPEC_HE · tenant-scope |
| **api_contract** | GET `/api/xbos/tenant-scope/accessible` · `XBOS-TENANT-200` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | TenantScopeController.accessible. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Trả danh sách tenant/company user được phép truy cập theo membership.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-T-ACC | Accessible tenants | List scope | User |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-T-ACC | FN-T-LIST | GET accessible | GET tenant-scope/accessible | N |
| CAP-T-ACC | FN-T-PICK | Chọn membership (nếu UI) | POST auth/select-membership | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-T-LIST | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-T-PICK | 1 | 1 | 0 | 1 | 0 | 3 |
| **Tổng** | 2 | 1 | 0 | 2 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-TENANT-01-T-LIST-HP-001 | CAP-T-ACC | FN-T-LIST | HP | P0 | ceo@xe.vn / Group CEO | login | 1. GET accessible | 200 · items chứa holding | API | TENANT-01 |
| TC-DM-TENANT-01-T-LIST-AU-001 | CAP-T-ACC | FN-T-LIST | AU | P0 | du-lich.ceo@xe.vn / Member CEO | login member | 1. GET accessible | 200 · chỉ CT được gán · không full group trừ policy | API | RBAC ladder |
| TC-DM-TENANT-01-T-LIST-UX-001 | CAP-T-ACC | FN-T-LIST | UX | P1 | ceo@xe.vn / Group CEO | user mới 0 membership | 1. GET | 200 empty · UI hướng dẫn | UI/API | empty |
| TC-DM-TENANT-01-T-PICK-HP-001 | CAP-T-ACC | FN-T-PICK | HP | P1 | ceo@xe.vn / Group CEO | ≥2 membership | 1. select-membership tenantId | 201 `XBOS-AUTH-201` | API | select-membership |
| TC-DM-TENANT-01-T-PICK-FD-001 | CAP-T-ACC | FN-T-PICK | FD | P0 | ceo@xe.vn / Group CEO | login | 1. select tenant không thuộc user | 4xx/403 | API | FD |
| TC-DM-TENANT-01-T-PICK-AU-001 | CAP-T-ACC | FN-T-PICK | AU | P0 | (chưa đăng nhập) | — | 1. select không token | 401 | API | AU |

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
| BE API/DTO | Controller/service tồn tại cho GET /tenant-scope/accessible; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF TENANT-01; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-TENANT-01
cases_designed: 6
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
