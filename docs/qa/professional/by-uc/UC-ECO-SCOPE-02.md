# UC — `UC-ECO-SCOPE-02` · Truy cập khi đã đăng nhập (một tenant)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-ECO-SCOPE-02` |
| **stt_phase1** | 49 |
| **mod** | M00 |
| **name_vi** | Truy cập khi đã đăng nhập (một tenant) |
| **actors** | User 1-tenant / multi-membership |
| **surfaces** | web-portal / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 49 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #49 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE §8 |
| **api_contract** | JWT + X-Tenant-ID match · select-membership |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | Scope header must match JWT; membership switch. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Sau login, mọi thao tác gắn đúng một tenant active; đổi membership có kiểm soát.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-ECO-IN | In-session tenant scope | 1 tenant active | User |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-ECO-IN | FN-ECO-USE | Gọi API với tenant khớp | headers | N |
| CAP-ECO-IN | FN-ECO-MIS | Header tenant lệch JWT | headers | N |
| CAP-ECO-IN | FN-ECO-SW | Đổi membership | POST select-membership | Y |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-ECO-USE | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-ECO-MIS | 0 | 1 | 0 | 1 | 0 | 2 |
| FN-ECO-SW | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 2 | 0 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-ECO-SCOPE-02-ECO-USE-HP-001 | CAP-ECO-IN | FN-ECO-USE | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Gọi API với X-Tenant-ID khớp | 2xx theo endpoint | API | ECO-02 |
| TC-ECO-SCOPE-02-ECO-MIS-AU-001 | CAP-ECO-IN | FN-ECO-MIS | AU | P0 | ceo@xe.vn / Group CEO | login | 1. X-Tenant-ID khác JWT | 401/403 deterministic | API | tenant match |
| TC-ECO-SCOPE-02-ECO-MIS-FD-001 | CAP-ECO-IN | FN-ECO-MIS | FD | P1 | ceo@xe.vn / Group CEO | login | 1. Thiếu X-Tenant-ID khi bắt buộc | 4xx | API | FD |
| TC-ECO-SCOPE-02-ECO-SW-HP-001 | CAP-ECO-IN | FN-ECO-SW | HP | P1 | ceo@xe.vn / Group CEO | multi membership | 1. select-membership | 201 · API sau dùng scope mới | API/UI | AUTH-201 |
| TC-ECO-SCOPE-02-ECO-SW-FD-001 | CAP-ECO-IN | FN-ECO-SW | FD | P0 | du-lich.ceo@xe.vn / Member CEO | chỉ 1 CT | 1. select tenant ngoài membership | 4xx | API | FD |
| TC-ECO-SCOPE-02-ECO-USE-UX-001 | CAP-ECO-IN | FN-ECO-USE | UX | P2 | ceo@xe.vn / Group CEO | session sắp hết | 1. Thao tác muộn | re-login hoặc refresh policy rõ | UI | UX session |

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
| BE API/DTO | Controller/service tồn tại cho JWT+tenant; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF ECO-02; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-ECO-SCOPE-02
cases_designed: 6
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
