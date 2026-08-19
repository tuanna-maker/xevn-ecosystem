# UC — `UC-HRM-MOB-04` · Ghi nhận chấm công / điểm danh

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-04` |
| **stt_phase1** | 355 |
| **mod** | M06 |
| **name_vi** | Ghi nhận chấm công / điểm danh |
| **actors** | ESS (không Leader FAB) |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 355 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE · FR-UC-M04 |
| **tech_spec** | TECHSPEC_MOBILE · MOB-ATTENDANCE neo |
| **api_contract** | POST /api/hrm/attendance/records |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | **PASS** (P0 smoke 2026-08-04) — check-in `HRM-ATT-201` · `po-uc-tc-w4-qa-e5-mob-rollup.md` |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | J-MOB-02 GPS check-in. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Ghi nhận chấm công / điểm danh** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Chấm công vào | Ghi nhận điểm danh | NV ESS |
| **CAP-02** | Vị trí / GPS | Gắn coords | NV · hệ thống |
| **CAP-03** | Chặn sai điều kiện | Trùng / role | hệ thống |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-OPEN** | Mở CheckIn | UI | N |
| CAP-01 | **FN-CHECKIN** | POST records | POST /attendance/records | Y |
| CAP-02 | **FN-GPS** | Lấy vị trí | device | N |
| CAP-03 | **FN-ROLE** | Ẩn FAB Leader | UI | N |
| CAP-03 | **FN-DUP** | Chặn chấm trùng | API | Y |

**Đếm chức năng:** **5**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-CHECKIN | 2 | 1 | 1 | 2 | 3 | **9** |
| FN-GPS | 1 | 1 | 0 | 0 | 0 | **2** |
| FN-ROLE | 0 | 1 | 0 | 0 | 0 | **1** |
| FN-DUP | 0 | 1 | 0 | 0 | 0 | **1** |
| **Tổng** | 4 | 4 | 1 | 2 | 3 | **14** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-04-CHECKIN-HP-001** | CAP-01 | FN-CHECKIN | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | CheckIn → Chấm công | 2xx · toast · history có | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-GPS-HP-002** | CAP-02 | FN-GPS | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | J-MOB-02 GPS permission OK | coords/optional documented | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-GPS-FD-001** | CAP-02 | FN-GPS | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Deny location khi bắt buộc | message · không silent | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-DUP-FD-002** | CAP-03 | FN-DUP | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Chấm lần 2 cùng ca (nếu BR) | 4xx | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-CHECKIN-AU-001** | CAP-03 | FN-CHECKIN | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Sai company header | 409 | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-CHECKIN-UX-001** | CAP-01 | FN-CHECKIN | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Busy CTA | no double-submit | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-CHECKIN-UX-002** | CAP-01 | FN-CHECKIN | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | API down | error rõ | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-CHECKIN-BD-001** | CAP-01 | FN-CHECKIN | BD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Biên giờ ca | documented | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-OPEN-HP-003** | CAP-01 | FN-OPEN | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Neo MOB-ATTENDANCE CheckIn | HDSD | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-ROLE-FD-003** | CAP-03 | FN-ROLE | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Leader không FAB check-in | ẩn/disabled | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-CHECKIN-AU-002** | CAP-03 | FN-CHECKIN | AU | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Không ghi hộ NV khác | 403 | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-CHECKIN-UX-003** | CAP-01 | FN-CHECKIN | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Success alert | dismiss OK | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-CHECKIN-FD-004** | CAP-03 | FN-CHECKIN | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Thiếu employee_id | block | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |
| **TC-HRM-MOB-04-CHECKIN-HP-004** | CAP-01 | FN-CHECKIN | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Offline queue nếu có | không claim nếu GAP | MOBILE | matrix STT 355 · POST /api/hrm/attendance/records |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | POST /api/hrm/attendance/records |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 355 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_IMPL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-04
stt_phase1: 355
cases_designed: 14
code_readiness: LIKELY_IMPL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
