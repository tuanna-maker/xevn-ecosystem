# UC — `UC-HRM-MOB-08` · Phê duyệt hoặc từ chối đơn chờ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-08` |
| **stt_phase1** | 359 |
| **mod** | M06 |
| **name_vi** | Phê duyệt hoặc từ chối đơn chờ |
| **actors** | Manager uat.nv0001 (cấm ceo@ L1 leave) |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 359 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE · FR-UC-M03 |
| **tech_spec** | MOB-LEAVE-APPR neo · Leave L2 SPEC_GAP |
| **api_contract** | POST …/approve · …/reject |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | L1 HP; L2 SPEC_GAP inventory only. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Phê duyệt hoặc từ chối đơn chờ** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Hàng chờ QL | ManagerApprovals | QL uat.nv0001 |
| **CAP-02** | Duyệt L1 | Approve leave/att | QL |
| **CAP-03** | Từ chối L1 | Reject + lý do | QL |
| **CAP-04** | Chống gian lận | Self-approve · sai CT | hệ thống |
| **CAP-05** | L2 SPEC_GAP | Ladder cấp 2 | SPEC_GAP |

**Đếm nghiệp vụ:** **5**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-INBOX** | Mở ManagerApprovals | GET pending | N |
| CAP-02 | **FN-APPR** | Duyệt | POST approve | Y |
| CAP-03 | **FN-REJ** | Từ chối | POST reject | Y |
| CAP-04 | **FN-SELF** | Chặn tự duyệt | API | Y |
| CAP-05 | **FN-L2** | Duyệt L2 | API | Y |

**Đếm chức năng:** **5**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-INBOX | 1 | 0 | 0 | 1 | 2 | **4** |
| FN-APPR | 4 | 1 | 0 | 2 | 1 | **8** |
| FN-REJ | 1 | 2 | 0 | 0 | 0 | **3** |
| FN-SELF | 0 | 0 | 0 | 1 | 0 | **1** |
| FN-L2 | 0 | 0 | 0 | 0 | 0 (+2 SG/LOCK) | **2** |
| **Tổng** | 6 | 3 | 0 | 4 | 3 | **18** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-08-INBOX-HP-001** | CAP-01 | FN-INBOX | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | QL mở inbox thấy đơn NV | cards pending | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-APPR-HP-002** | CAP-02 | FN-APPR | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Duyệt leave L1 mobile | 2xx · approved · badge↓ · F5 | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-APPR-HP-003** | CAP-02 | FN-APPR | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Duyệt att update L1 | 203 HRM-ATT-REQ-203 · F5 | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-APPR-HP-004** | CAP-02 | FN-APPR | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | J-MOB-05 Duyệt/Từ chối | HDSD neo MOB-LEAVE-APPR | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-APPR-FD-001** | CAP-02 | FN-APPR | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Duyệt 2 lần | 4xx/no-op | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-REJ-FD-002** | CAP-03 | FN-REJ | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Từ chối thiếu lý do (nếu BR) | 4xx | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-REJ-HP-005** | CAP-03 | FN-REJ | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Từ chối + lý do đủ | rejected · F5 | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-SELF-AU-001** | CAP-04 | FN-SELF | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Self-approve bị chặn | 4xx BR-WF-04 | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-APPR-AU-002** | CAP-04 | FN-APPR | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Duyệt sai CT / thiếu x-company-id | 409 | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-APPR-AU-003** | CAP-04 | FN-APPR | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | cấm ceo@ làm L1 leave | persona lock | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-INBOX-UX-001** | CAP-01 | FN-INBOX | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Empty inbox | empty — không seed | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-APPR-UX-002** | CAP-02 | FN-APPR | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Sau duyệt row khỏi pending | UI update | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-L2-SG-001** | CAP-05 | FN-L2 | SG | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | SPEC_GAP L2 approve inventory | BLOCKED not PASS | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-L2-SG-002** | CAP-05 | FN-L2 | SG | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | SPEC_GAP L2 hold inventory | BLOCKED not PASS | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-REJ-FD-003** | CAP-03 | FN-REJ | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Reject lý do quá ngắn | 4xx nếu rule | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-INBOX-AU-004** | CAP-04 | FN-INBOX | AU | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | QL CT khác không thấy đơn | empty/403 | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-APPR-HP-006** | CAP-02 | FN-APPR | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Confirm modal approve/decline | ConfirmActionModal | MOBILE | matrix STT 359 · POST …/approve |
| **TC-HRM-MOB-08-INBOX-UX-003** | CAP-01 | FN-INBOX | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Filter tab Nghỉ vs Chỉnh CC | đúng pack neo | MOBILE | matrix STT 359 · POST …/approve |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | yes | yes | |
| Mọi FN mutate ≥1 HP + ≥1 FD (hoặc SG inventory) | yes | reviewed | SG/LOCK counted separate |
| Auth/scope nếu đa CT | yes | AU cases | |
| SPEC_GAP ghi rõ | yes | see below | không PASS |

**SPEC_GAP / LOCK inventory:**
- L2 approve/hold — SPEC_GAP inventory; không PASS

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | POST …/approve · …/reject |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 359 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_IMPL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-08
stt_phase1: 359
cases_designed: 18
code_readiness: LIKELY_IMPL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
