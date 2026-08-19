# UC — `UC-XBOS-AUTH-02` · Xem thông tin phiên đăng nhập

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-AUTH-02` |
| **stt_phase1** | 44 |
| **mod** | M01 |
| **name_vi** | Xem thông tin phiên đăng nhập |
| **actors** | User đã login |
| **surfaces** | web-portal / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 44 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #44 · matrix SRS Có |
| **srs_new** | N/A-DELTA · session /me |
| **tech_spec** | TECHSPEC_HE · GET auth/me |
| **api_contract** | GET `/api/xbos/auth/me` · `XBOS-AUTH-200` / `XBOS-AUTH-401` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | AuthController.me đọc JWT sub/email. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Hiển thị thông tin phiên (user, memberships, role) khớp JWT đang dùng.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-SESS | Đọc phiên | me() | User |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-SESS | FN-ME | GET me | GET /auth/me | N |
| CAP-SESS | FN-ME-UI | Hiển thị identity trên shell | portal header | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-ME | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-ME-UI | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-AUTH-02-ME-HP-001 | CAP-SESS | FN-ME | HP | P0 | ceo@xe.vn / Group CEO | đã login | 1. GET /auth/me | 200 · email/role khớp | API | AUTH-02 |
| TC-DM-AUTH-02-ME-AU-001 | CAP-SESS | FN-ME | AU | P0 | (chưa đăng nhập) | không token | 1. GET /me | 401 `XBOS-AUTH-401` | API | 401 |
| TC-DM-AUTH-02-ME-FD-001 | CAP-SESS | FN-ME | FD | P1 | ceo@xe.vn / Group CEO | token hết hạn / giả | 1. GET /me | 401 | API | JWT |
| TC-DM-AUTH-02-ME-UI-HP-001 | CAP-SESS | FN-ME-UI | HP | P0 | ceo@xe.vn / Group CEO | login OK | 1. Mở portal shell | hiển thị tên/email đúng | UI | shell |
| TC-DM-AUTH-02-ME-UI-UX-001 | CAP-SESS | FN-ME-UI | UX | P1 | ceo@xe.vn / Group CEO | /me chậm | 1. Reload shell | skeleton/loading · không crash | UI | UX |

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
| BE API/DTO | Controller/service tồn tại cho GET /auth/me; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF AUTH-02; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-AUTH-02
cases_designed: 5
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
