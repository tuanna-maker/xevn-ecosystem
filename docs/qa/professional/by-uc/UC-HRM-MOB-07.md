# UC — `UC-HRM-MOB-07` · Xem danh sách đơn và trạng thái

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-07` |
| **stt_phase1** | 358 |
| **mod** | M06 |
| **name_vi** | Xem danh sách đơn và trạng thái |
| **actors** | ESS |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 358 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE |
| **tech_spec** | MOB-LEAVE-APPR · MOB-ATTENDANCE neo |
| **api_contract** | GET leave-requests · update-requests |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | J-MOB-03 list→detail. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Xem danh sách đơn và trạng thái** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Danh sách đơn của tôi | Leave + update-request | NV |
| **CAP-02** | Chi tiết đơn | List→detail J-MOB-03 | NV |
| **CAP-03** | Trạng thái / filter | Tabs pending/approved | NV |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-LIST** | Mở list đơn | GET | N |
| CAP-02 | **FN-DET** | Mở detail | GET by id | N |
| CAP-03 | **FN-FILTER** | Đổi tab/filter | UI | N |

**Đếm chức năng:** **3**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LIST | 2 | 0 | 1 | 1 | 3 | **7** |
| FN-DET | 1 | 2 | 0 | 0 | 0 | **3** |
| FN-FILTER | 2 | 0 | 0 | 0 | 0 | **2** |
| **Tổng** | 5 | 2 | 1 | 1 | 3 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-07-LIST-HP-001** | CAP-01 | FN-LIST | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Sau create → list thấy đơn | row pending | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-DET-HP-002** | CAP-02 | FN-DET | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Tap row → detail | J-MOB-03 không 404 | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-DET-FD-001** | CAP-02 | FN-DET | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Detail id ngoài scope | 404/409 | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-LIST-UX-001** | CAP-01 | FN-LIST | UX | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Empty list | CTA tạo đơn | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-LIST-UX-002** | CAP-01 | FN-LIST | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Error banner API | không trắng | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-FILTER-HP-003** | CAP-03 | FN-FILTER | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Filter Nghỉ / Chỉnh CC | đúng loại | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-FILTER-HP-004** | CAP-03 | FN-FILTER | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Tab approved sau duyệt | thấy status | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-LIST-AU-001** | CAP-01 | FN-LIST | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Không thấy đơn CT khác | scope | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-LIST-BD-001** | CAP-01 | FN-LIST | BD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Nhiều trang | pagination | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-LIST-UX-003** | CAP-01 | FN-LIST | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Pull refresh | OK | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-LIST-HP-005** | CAP-01 | FN-LIST | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Swipe/actions trên list | documented | MOBILE | matrix STT 358 · GET leave-requests |
| **TC-HRM-MOB-07-DET-FD-002** | CAP-02 | FN-DET | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Stale id sau soft-delete | 404 honest | MOBILE | matrix STT 358 · GET leave-requests |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | GET leave-requests · update-requests |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 358 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_PARTIAL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-07
stt_phase1: 358
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
