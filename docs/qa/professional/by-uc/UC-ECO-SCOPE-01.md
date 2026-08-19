# UC — `UC-ECO-SCOPE-01` · Truy cập khi chưa đăng nhập (phạm vi quản trị hệ thống)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-ECO-SCOPE-01` |
| **stt_phase1** | 48 |
| **mod** | M00 |
| **name_vi** | Truy cập khi chưa đăng nhập (phạm vi quản trị hệ thống) |
| **actors** | Anonymous |
| **surfaces** | web-portal / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 48 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #48 · matrix SRS Có |
| **srs_new** | N/A-DELTA · public vs protected routes |
| **tech_spec** | TECHSPEC_HE §8 |
| **api_contract** | Protected routes → 401; login page public |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | Portal route guard + API auth; pattern e2e_pass trên matrix. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Chưa đăng nhập chỉ vào được bề mặt public (login); mọi API/CC bị chặn.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-ECO-ANON | Anonymous access control | Fail-closed | Hệ thống |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-ECO-ANON | FN-ECO-PUB | Mở trang login | GET /login | N |
| CAP-ECO-ANON | FN-ECO-BLOCK | Chặn CC/API | GET /command-center · API | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-ECO-PUB | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-ECO-BLOCK | 0 | 1 | 0 | 1 | 0 | 2 |
| **Tổng** | 1 | 1 | 0 | 1 | 1 | **4** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-ECO-SCOPE-01-ECO-PUB-HP-001 | CAP-ECO-ANON | FN-ECO-PUB | HP | P0 | (chưa đăng nhập) | clear storage | 1. Mở URL portal login | form login hiển thị | UI | ECO-SCOPE-01 |
| TC-ECO-SCOPE-01-ECO-PUB-UX-001 | CAP-ECO-ANON | FN-ECO-PUB | UX | P1 | (chưa đăng nhập) | — | 1. Deep link CC khi anon | redirect login · giữ returnUrl nếu có | UI | guard |
| TC-ECO-SCOPE-01-ECO-BLOCK-AU-001 | CAP-ECO-ANON | FN-ECO-BLOCK | AU | P0 | (chưa đăng nhập) | — | 1. GET API org/raci/wf không token | 401 | API | AU |
| TC-ECO-SCOPE-01-ECO-BLOCK-FD-001 | CAP-ECO-ANON | FN-ECO-BLOCK | FD | P0 | (chưa đăng nhập) | — | 1. Thử mutate shareholder không token | 401 · không ghi DB | API | FD |

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
| BE API/DTO | Controller/service tồn tại cho route guards; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF ECO-01; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-ECO-SCOPE-01
cases_designed: 4
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
