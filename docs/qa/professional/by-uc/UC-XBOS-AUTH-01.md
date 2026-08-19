# UC — `UC-XBOS-AUTH-01` · Đăng nhập cổng Web Portal

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-AUTH-01` |
| **stt_phase1** | 43 |
| **mod** | M01 |
| **name_vi** | Đăng nhập cổng Web Portal |
| **actors** | Mọi user portal |
| **surfaces** | web-portal / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 43 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #43 · matrix SRS Có |
| **srs_new** | `SRS_VN.md` § auth/JWT (tóm tắt) · map portal login |
| **tech_spec** | TECHSPEC_HE §4–9 · auth |
| **api_contract** | POST `/api/xbos/auth/login` · `XBOS-AUTH-200` · lockout policy AS-IS |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | **PASS** · W4-E1 2026-08-04 · P0 HP+FD+NAV EVIDENCED (`po-uc-tc-w4-qa-e1-xbos-rollup.md`) · `uat_done: false` |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | AuthController.login + portal login form; UF-XBOS-01 🟢 design reference — không claim re-UAT. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Người dùng đăng nhập bằng email/password hợp lệ, nhận JWT/session và vào Command Center đúng persona.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-AUTH-IN | Đăng nhập | Cấp phiên | User |
| CAP-AUTH-FAIL | Từ chối đăng nhập sai | FD/AU | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-AUTH-IN | FN-LOGIN | Submit login | POST /auth/login | Y |
| CAP-AUTH-IN | FN-LOGIN-NAV | Điều hướng sau login | portal router | N |
| CAP-AUTH-FAIL | FN-LOGIN-BAD | Sai mật khẩu / email | POST login | Y |
| CAP-AUTH-FAIL | FN-LOGIN-LOCK | Lockout sau nhiều lần sai | POST login | Y |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LOGIN | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-LOGIN-NAV | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-LOGIN-BAD | 0 | 1 | 0 | 1 | 0 | 2 |
| FN-LOGIN-LOCK | 0 | 1 | 1 | 0 | 0 | 2 |
| **Tổng** | 2 | 3 | 1 | 1 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-AUTH-01-LOGIN-HP-001 | CAP-AUTH-IN | FN-LOGIN | HP | P0 | ceo@xe.vn / Group CEO | Chưa login · account pilot sống | 1. Mở portal 2. Nhập ceo@xe.vn / Xevn@2026 3. Đăng nhập | 200 `XBOS-AUTH-200` · token · vào CC · không banner lỗi | UI/API | UF-XBOS-01 · AUTH-01 |
| TC-DM-AUTH-01-LOGIN-FD-001 | CAP-AUTH-IN | FN-LOGIN | FD | P0 | ceo@xe.vn / Group CEO | form trống | 1. Submit thiếu email/password | FE validate · không gọi hoặc 4xx | UI | PortalLoginDto |
| TC-DM-AUTH-01-LOGIN-NAV-HP-001 | CAP-AUTH-IN | FN-LOGIN-NAV | HP | P0 | ceo@xe.vn / Group CEO | login HP vừa xong | 1. Quan sát landing CC | widgets VI · không raw keys | UI | UF-XBOS-01 |
| TC-DM-AUTH-01-LOGIN-NAV-UX-001 | CAP-AUTH-IN | FN-LOGIN-NAV | UX | P1 | ceo@xe.vn / Group CEO | API chậm | 1. Login | loading rồi sẵn sàng · không trắng vĩnh viễn | UI | UX |
| TC-DM-AUTH-01-LOGIN-BAD-FD-001 | CAP-AUTH-FAIL | FN-LOGIN-BAD | FD | P0 | attacker@xe.vn | account tồn tại hoặc không | 1. Sai password | 401 · message không lộ enumeration quá mức | API | login fail |
| TC-DM-AUTH-01-LOGIN-BAD-AU-001 | CAP-AUTH-FAIL | FN-LOGIN-BAD | AU | P1 | (chưa đăng nhập) | — | 1. Gọi API protected không token | 401 | API | guard |
| TC-DM-AUTH-01-LOGIN-LOCK-FD-001 | CAP-AUTH-FAIL | FN-LOGIN-LOCK | FD | P1 | ceo@xe.vn / Group CEO | policy 5 fail | 1. Sai password ×5+ | lockout / cooldown deterministic (CLAUDE.md 30m) | API | lockout |
| TC-DM-AUTH-01-LOGIN-LOCK-BD-001 | CAP-AUTH-FAIL | FN-LOGIN-LOCK | BD | P2 | ceo@xe.vn / Group CEO | 4 fails | 1. Lần 5 | vẫn theo policy biên | API | BD lock |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 2 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 3 | PARTIAL | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho POST /auth/login; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-01; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-AUTH-01
cases_designed: 8
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
