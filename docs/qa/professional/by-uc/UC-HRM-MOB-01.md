# UC — `UC-HRM-MOB-01` · Đăng nhập và thiết lập phiên an toàn

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-01` |
| **stt_phase1** | 352 |
| **mod** | M06 |
| **name_vi** | Đăng nhập và thiết lập phiên an toàn |
| **actors** | uat.nv#### · manager mobile |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 352 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE · SRS_VN § auth mobile |
| **tech_spec** | docs/hrm/TECHSPEC_MOBILE.md §5.2 |
| **api_contract** | POST /api/hrm/auth/mobile/login · refresh |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | **PASS** (P0 smoke 2026-08-04) — `docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-rollup.md` · UI login HP+FD |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | SecureStore refresh; neo MOB-HOME/SETTINGS. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Đăng nhập và thiết lập phiên an toàn** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Đăng nhập ESS | Xác thực + JWT/memberships | NV |
| **CAP-02** | Làm mới phiên | Refresh SecureStore | NV · hệ thống |
| **CAP-03** | Chặn phiên lỗi | Sai MK / lockout / network | NV · hệ thống |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-LOGIN** | Submit login | POST …/auth/mobile/login | Y |
| CAP-01 | **FN-STORE** | Lưu token an toàn | SecureStore | Y |
| CAP-02 | **FN-REFRESH** | Refresh access | POST …/refresh | Y |
| CAP-03 | **FN-FAIL** | Hiển thị lỗi đăng nhập | UI | N |
| CAP-03 | **FN-LOCK** | Lockout sau N lần | API/UI | Y |

**Đếm chức năng:** **5**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LOGIN | 1 | 2 | 1 | 1 | 1 | **6** |
| FN-STORE | 1 | 0 | 0 | 1 | 0 | **2** |
| FN-REFRESH | 1 | 1 | 0 | 0 | 0 | **2** |
| FN-FAIL | 0 | 0 | 0 | 0 | 1 | **1** |
| FN-LOCK | 0 | 1 | 0 | 0 | 0 | **1** |
| **Tổng** | 3 | 4 | 1 | 2 | 2 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-01-LOGIN-HP-001** | CAP-01 | FN-LOGIN | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Login đúng credential → Home | 2xx + tokens + Home | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-LOGIN-FD-001** | CAP-01 | FN-LOGIN | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Sai password | 4xx VI · không vào Home | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-LOGIN-FD-002** | CAP-01 | FN-LOGIN | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Thiếu email/password | FE block | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-LOGIN-BD-001** | CAP-01 | FN-LOGIN | BD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Password biên dài/ngắn | accept/reject documented | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-LOGIN-AU-001** | CAP-01 | FN-LOGIN | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Sai tenant/company header | 403/409 | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-FAIL-UX-001** | CAP-03 | FN-FAIL | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Network down | HRM-MOB-ERR-NETWORK | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-REFRESH-HP-002** | CAP-02 | FN-REFRESH | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Kill-reopen còn session (refresh) | Home nếu refresh OK | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-REFRESH-FD-003** | CAP-02 | FN-REFRESH | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Refresh hết hạn | force login · clear store | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-STORE-HP-003** | CAP-01 | FN-STORE | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Refresh chỉ SecureStore | không AsyncStorage refresh | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-LOGIN-UX-002** | CAP-01 | FN-LOGIN | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Loading khi login | không trắng | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-LOCK-FD-004** | CAP-03 | FN-LOCK | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Lockout threshold | cooldown message | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |
| **TC-HRM-MOB-01-STORE-AU-002** | CAP-01 | FN-STORE | AU | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Token không log plaintext | no secret in logs | MOBILE | matrix STT 352 · POST /api/hrm/auth/mobile/login |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | yes | yes | |
| Mọi FN mutate ≥1 HP + ≥1 FD (hoặc SG inventory) | yes | reviewed | SG/LOCK counted separate |
| Auth/scope nếu đa CT | yes | AU cases | |
| SPEC_GAP ghi rõ | yes | see below | không PASS |

**SPEC_GAP / LOCK inventory:**
- (không — trừ ghi chú case SG/LOCK trong bảng TC)

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | POST /api/hrm/auth/mobile/login · refresh |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 352 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_IMPL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-01
stt_phase1: 352
cases_designed: 12
code_readiness: LIKELY_IMPL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
