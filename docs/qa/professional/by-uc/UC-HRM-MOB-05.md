# UC — `UC-HRM-MOB-05` · Xem lịch sử chấm công

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-05` |
| **stt_phase1** | 356 |
| **mod** | M06 |
| **name_vi** | Xem lịch sử chấm công |
| **actors** | ESS |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 356 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE |
| **tech_spec** | MOB-ATTENDANCE neo |
| **api_contract** | GET attendance records history |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Calendar; ≠ epoch 1970. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Xem lịch sử chấm công** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Xem lịch sử | Calendar + timeline | NV |
| **CAP-02** | Lọc ngày | Chi tiết ngày | NV |
| **CAP-03** | Chất lượng dữ liệu | Không epoch / format VI | hệ thống |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-HIST** | Mở AttendanceHistory | GET records | N |
| CAP-02 | **FN-DAY** | Chọn ngày | UI | N |
| CAP-03 | **FN-FMT** | Format ngày giờ | UI | N |

**Đếm chức năng:** **3**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-HIST | 3 | 1 | 0 | 2 | 2 | **8** |
| FN-DAY | 0 | 0 | 1 | 0 | 1 | **2** |
| FN-FMT | 1 | 1 | 0 | 0 | 0 | **2** |
| **Tổng** | 4 | 2 | 1 | 2 | 3 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-05-HIST-HP-001** | CAP-01 | FN-HIST | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Lịch sử sau check-in | thấy bản ghi | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-HIST-HP-002** | CAP-01 | FN-HIST | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Đổi tháng calendar | load đúng kỳ | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-HIST-FD-001** | CAP-01 | FN-HIST | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | API 500 | banner | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-DAY-UX-001** | CAP-02 | FN-DAY | UX | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Ngày không có chấm | empty day | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-HIST-UX-002** | CAP-01 | FN-HIST | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Shimmer loading | không trắng | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-DAY-BD-001** | CAP-02 | FN-DAY | BD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Ngày đầu/cuối tháng | đúng | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-HIST-AU-001** | CAP-01 | FN-HIST | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Không thấy CT khác | scope | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-FMT-HP-003** | CAP-03 | FN-FMT | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Ngày ≠ 01/01/1970 | dd/MM/yyyy HH:mm | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-FMT-FD-002** | CAP-03 | FN-FMT | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Timestamp 0/null | — không crash | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-HIST-HP-004** | CAP-01 | FN-HIST | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Badge đi muộn/vắng | đúng enum | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-HIST-UX-003** | CAP-01 | FN-HIST | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Pull refresh | OK | MOBILE | matrix STT 356 · GET attendance records history |
| **TC-HRM-MOB-05-HIST-AU-002** | CAP-01 | FN-HIST | AU | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Deep link history | đúng NV | MOBILE | matrix STT 356 · GET attendance records history |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | GET attendance records history |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 356 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_PARTIAL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-05
stt_phase1: 356
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
