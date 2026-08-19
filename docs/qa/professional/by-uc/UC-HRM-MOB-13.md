# UC — `UC-HRM-MOB-13` · Nhận thông báo (in-app / realtime / push)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-13` |
| **stt_phase1** | 364 |
| **mod** | M06 |
| **name_vi** | Nhận thông báo (in-app / realtime / push) |
| **actors** | ESS · Manager |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 364 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE · PLAN_MOBILE_REALTIME |
| **tech_spec** | TECHSPEC_MOBILE §7 |
| **api_contract** | GET notifications/inbox · socket /hrm-realtime · push-tokens |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | In-app P0; push P1 LOCK. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Nhận thông báo (in-app / realtime / push)** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Inbox in-app | GET notifications | NV · QL |
| **CAP-02** | Realtime | Socket hrm:event | NV · QL |
| **CAP-03** | Push (P1) | FCM/APNs optional | P1 LOCK |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-INBOX** | Mở inbox | GET …/notifications/inbox | N |
| CAP-01 | **FN-READ** | Đánh dấu đã đọc | PATCH …/read | Y |
| CAP-02 | **FN-SOCK** | Nhận event → refresh | socket | N |
| CAP-03 | **FN-PUSH** | Đăng ký push-token | POST push-tokens | Y |

**Đếm chức năng:** **4**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-INBOX | 1 | 0 | 0 | 1 | 3 | **5** |
| FN-READ | 1 | 1 | 0 | 0 | 0 | **2** |
| FN-SOCK | 1 | 1 | 0 | 0 | 0 | **2** |
| FN-PUSH | 1 | 1 | 0 | 0 | 0 (+1 SG/LOCK) | **3** |
| **Tổng** | 4 | 3 | 0 | 1 | 3 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-13-INBOX-HP-001** | CAP-01 | FN-INBOX | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Mở inbox thông báo | list hoặc empty | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-READ-HP-002** | CAP-01 | FN-READ | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Mark read | 2xx · UI cập nhật | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-READ-FD-001** | CAP-01 | FN-READ | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Mark read id lạ | 404 | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-SOCK-HP-003** | CAP-02 | FN-SOCK | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Realtime event → refresh | UI cập nhật (REST SoT) | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-SOCK-FD-002** | CAP-02 | FN-SOCK | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Socket disconnect | app vẫn REST OK | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-INBOX-UX-001** | CAP-01 | FN-INBOX | UX | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Empty inbox | empty — không seed | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-INBOX-UX-002** | CAP-01 | FN-INBOX | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Deep link notif → ManagerApprovals | land đúng | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-INBOX-AU-001** | CAP-01 | FN-INBOX | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Không thấy notif CT khác | scope | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-PUSH-SG-001** | CAP-03 | FN-PUSH | SG | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Push P1 LOCK inventory | không claim EVIDENCED nếu chưa ship | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-PUSH-HP-004** | CAP-03 | FN-PUSH | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Register push token opt-in | 2xx nếu endpoint có | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-PUSH-FD-003** | CAP-03 | FN-PUSH | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Token invalid | 4xx | MOBILE | matrix STT 364 · GET notifications/inbox |
| **TC-HRM-MOB-13-INBOX-UX-003** | CAP-01 | FN-INBOX | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Badge count | đúng pending | MOBILE | matrix STT 364 · GET notifications/inbox |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | GET notifications/inbox · socket /hrm-realtime · push-tokens |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 364 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_PARTIAL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-13
stt_phase1: 364
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
