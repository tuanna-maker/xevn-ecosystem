# UC — `UC-HRM-MOB-15` · Đăng xuất và thu hồi phiên

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-15` |
| **stt_phase1** | 366 |
| **mod** | M06 |
| **name_vi** | Đăng xuất và thu hồi phiên |
| **actors** | ESS |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 366 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE |
| **tech_spec** | TECHSPEC_MOBILE §5.3 |
| **api_contract** | logout · clear SecureStore · revoke if exists |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Local clear; remote revoke may GAP. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Đăng xuất và thu hồi phiên** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Đăng xuất cục bộ | Xóa token SecureStore | NV |
| **CAP-02** | Thu hồi từ xa | Revoke nếu API có | NV · hệ thống |
| **CAP-03** | Sau logout | Không gọi API authenticated | hệ thống |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-LOGOUT** | Tap Đăng xuất | UI | Y |
| CAP-02 | **FN-REVOKE** | Gọi revoke | API optional | Y |
| CAP-03 | **FN-GUARD** | Chặn vào Home sau logout | UI | N |

**Đếm chức năng:** **3**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LOGOUT | 3 | 2 | 0 | 0 | 2 | **7** |
| FN-REVOKE | 0 | 1 | 0 | 0 | 0 (+1 SG/LOCK) | **2** |
| FN-GUARD | 1 | 0 | 0 | 2 | 0 | **3** |
| **Tổng** | 4 | 3 | 0 | 2 | 2 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-15-LOGOUT-HP-001** | CAP-01 | FN-LOGOUT | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Đăng xuất → login | tokens cleared | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-GUARD-HP-002** | CAP-03 | FN-GUARD | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Kill-reopen sau logout | login screen | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-LOGOUT-FD-001** | CAP-01 | FN-LOGOUT | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Logout khi API down | vẫn clear local | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-REVOKE-SG-001** | CAP-02 | FN-REVOKE | SG | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Remote revoke thiếu | GAP inventory — fallback local | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-GUARD-AU-001** | CAP-03 | FN-GUARD | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Access token cũ sau logout | 401 | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-LOGOUT-UX-001** | CAP-01 | FN-LOGOUT | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Confirm dialog logout | confirm/cancel | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-LOGOUT-HP-003** | CAP-01 | FN-LOGOUT | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Clear refresh SecureStore | không auto-login | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-LOGOUT-FD-002** | CAP-01 | FN-LOGOUT | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Double tap logout | idempotent | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-LOGOUT-UX-002** | CAP-01 | FN-LOGOUT | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Loading logout | OK | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-GUARD-AU-002** | CAP-03 | FN-GUARD | AU | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Deep link sau logout | login · không lộ data | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-LOGOUT-HP-004** | CAP-01 | FN-LOGOUT | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Multi-account switch | clear trước login mới | MOBILE | matrix STT 366 · logout |
| **TC-HRM-MOB-15-REVOKE-FD-003** | CAP-02 | FN-REVOKE | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Revoke 4xx vẫn local clear | honest | MOBILE | matrix STT 366 · logout |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | logout · clear SecureStore · revoke if exists |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 366 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_PARTIAL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-15
stt_phase1: 366
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
