# UC — `UC-HRM-MOB-03` · Xem bảng điều khiển cá nhân

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-03` |
| **stt_phase1** | 354 |
| **mod** | M06 |
| **name_vi** | Xem bảng điều khiển cá nhân |
| **actors** | ESS |
| **surfaces** | hrm-mobile |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 354 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE |
| **tech_spec** | TECHSPEC_MOBILE · MOB-HOME neo |
| **api_contract** | dashboard summary GETs |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Home tiles; neo MOB-HOME only. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Xem bảng điều khiển cá nhân** đúng HDSD/SRS trên bề mặt hrm-mobile: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Xem Home ESS | Tóm tắt cá nhân | NV |
| **CAP-02** | Điều hướng tile | Vào leave/att/payslip | NV |
| **CAP-03** | Trạng thái lỗi/empty | Banner honest | NV |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-LOAD** | Load dashboard | GET summaries | N |
| CAP-02 | **FN-NAV** | Tap tile/nav | UI | N |
| CAP-03 | **FN-ERR** | API down | UI | N |

**Đếm chức năng:** **3**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LOAD | 2 | 0 | 1 | 1 | 2 | **6** |
| FN-NAV | 3 | 0 | 0 | 0 | 0 | **3** |
| FN-ERR | 0 | 2 | 0 | 0 | 1 | **3** |
| **Tổng** | 5 | 2 | 1 | 1 | 3 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-03-LOAD-HP-001** | CAP-01 | FN-LOAD | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Home có tên NV + CT | content · không trắng | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-LOAD-HP-002** | CAP-01 | FN-LOAD | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Stats chấm công | số hoặc 0 hợp lệ | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-ERR-FD-001** | CAP-03 | FN-ERR | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | API summary 500 | banner · không fake data | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-LOAD-UX-001** | CAP-03 | FN-LOAD | UX | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Empty stats ngày mới | 0 / empty | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-LOAD-UX-002** | CAP-01 | FN-LOAD | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Pull-to-refresh | reload OK | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-NAV-HP-003** | CAP-02 | FN-NAV | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Tap Đi muộn → CreateUpdateRequest | land đúng | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-NAV-HP-004** | CAP-02 | FN-NAV | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Tap nghỉ phép hub | Leave path | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-LOAD-AU-001** | CAP-01 | FN-LOAD | AU | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Scope CT trên Home | data đúng CT | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-LOAD-BD-001** | CAP-01 | FN-LOAD | BD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Tên NV dài | truncate OK | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-ERR-UX-003** | CAP-03 | FN-ERR | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Offline banner nếu cache | chỉ xem nếu P2 | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-NAV-HP-005** | CAP-02 | FN-NAV | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Manager entry phê duyệt | badge nếu isManager | MOBILE | matrix STT 354 · dashboard summary GETs |
| **TC-HRM-MOB-03-ERR-FD-002** | CAP-03 | FN-ERR | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Partial tile fail | lỗi cục bộ | MOBILE | matrix STT 354 · dashboard summary GETs |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | dashboard summary GETs |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 354 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_PARTIAL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-03
stt_phase1: 354
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
