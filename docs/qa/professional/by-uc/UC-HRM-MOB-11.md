# UC — `UC-HRM-MOB-11` · Quản lý công việc và yêu cầu dịch vụ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-11` |
| **stt_phase1** | 362 |
| **mod** | M06 |
| **name_vi** | Quản lý công việc và yêu cầu dịch vụ |
| **actors** | ESS · Manager |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 362 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE |
| **tech_spec** | MOB-OPERATIONS · MOB-TEAM neo |
| **api_contract** | tasks APIs |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Ops mobile status update. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Quản lý công việc và yêu cầu dịch vụ** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Xem việc được giao | Ops list | NV · QL |
| **CAP-02** | Cập nhật trạng thái | SM task | NV |
| **CAP-03** | Tạo/yêu cầu dịch vụ | Create nếu UI | NV · QL |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-LIST** | List tasks | GET | N |
| CAP-02 | **FN-STATUS** | Update status | PATCH | Y |
| CAP-03 | **FN-CREATE** | Create task/request | POST | Y |

**Đếm chức năng:** **3**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LIST | 3 | 0 | 0 | 1 | 3 | **7** |
| FN-STATUS | 1 | 2 | 0 | 1 | 0 | **4** |
| FN-CREATE | 1 | 1 | 1 | 0 | 0 | **3** |
| **Tổng** | 5 | 3 | 1 | 2 | 3 | **14** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-11-LIST-HP-001** | CAP-01 | FN-LIST | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Mở Operations/Tasks | list hoặc empty | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-STATUS-HP-002** | CAP-02 | FN-STATUS | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Đổi trạng thái hợp lệ | 2xx · F5 | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-STATUS-FD-001** | CAP-02 | FN-STATUS | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Chuyển trạng thái illegal | 4xx | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-CREATE-HP-003** | CAP-03 | FN-CREATE | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Tạo việc (nếu UI) | 2xx · list có | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-CREATE-FD-002** | CAP-03 | FN-CREATE | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Tạo thiếu tiêu đề | 4xx | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-LIST-AU-001** | CAP-01 | FN-LIST | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Không thấy việc CT khác | scope | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-LIST-UX-001** | CAP-01 | FN-LIST | UX | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Empty | empty | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-LIST-UX-002** | CAP-01 | FN-LIST | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Error API | banner | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-CREATE-BD-001** | CAP-03 | FN-CREATE | BD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Title dài | truncate/reject | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-LIST-HP-004** | CAP-01 | FN-LIST | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Neo MOB-OPERATIONS | HDSD | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-STATUS-AU-002** | CAP-02 | FN-STATUS | AU | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Assignee only update own | 403 nếu sửa hộ | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-LIST-UX-003** | CAP-01 | FN-LIST | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Pull refresh | OK | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-STATUS-FD-003** | CAP-02 | FN-STATUS | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Double status tap | idempotent/4xx | MOBILE | matrix STT 362 · tasks APIs |
| **TC-HRM-MOB-11-LIST-HP-005** | CAP-01 | FN-LIST | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Filter theo trạng thái | đúng | MOBILE | matrix STT 362 · tasks APIs |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | tasks APIs |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 362 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_PARTIAL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-11
stt_phase1: 362
cases_designed: 14
code_readiness: LIKELY_PARTIAL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
