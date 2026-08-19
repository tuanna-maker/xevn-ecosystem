# UC — `UC-HRM-MOB-09` · Xem tóm tắt lương theo kỳ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-09` |
| **stt_phase1** | 360 |
| **mod** | M06 |
| **name_vi** | Xem tóm tắt lương theo kỳ |
| **actors** | ESS |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 360 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE · J-MOB-04 |
| **tech_spec** | TECHSPEC_MOBILE |
| **api_contract** | GET payroll/payslip summary |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Payslip vi-VN; API partial. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Xem tóm tắt lương theo kỳ** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Xem tóm tắt lương | Payslip theo kỳ | NV |
| **CAP-02** | Chi tiết phiếu | Net/gross / khấu trừ | NV |
| **CAP-03** | Bảo mật & format | Chỉ own · vi-VN money | hệ thống |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-SUM** | Mở tóm tắt kỳ | GET payroll summary | N |
| CAP-02 | **FN-DET** | Xem chi tiết dòng | UI | N |
| CAP-03 | **FN-FMT** | Format tiền | UI | N |
| CAP-03 | **FN-SCOPE** | Chỉ phiếu của mình | API | N |

**Đếm chức năng:** **4**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-SUM | 4 | 2 | 0 | 0 | 3 | **9** |
| FN-DET | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-FMT | 0 | 1 | 1 | 0 | 0 | **2** |
| FN-SCOPE | 0 | 0 | 0 | 2 | 0 | **2** |
| **Tổng** | 5 | 3 | 1 | 2 | 3 | **14** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-09-SUM-HP-001** | CAP-01 | FN-SUM | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Mở Payslip kỳ hiện tại | tóm tắt hoặc empty hợp lệ | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SUM-HP-002** | CAP-01 | FN-SUM | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | J-MOB-04 deep link nếu có | land đúng | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SUM-HP-003** | CAP-01 | FN-SUM | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Chọn kỳ khác | load đúng period | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SUM-FD-001** | CAP-01 | FN-SUM | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | API 500/partial | banner · không số bịa | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SUM-UX-001** | CAP-01 | FN-SUM | UX | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Chưa có phiếu kỳ | empty honest | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SCOPE-AU-001** | CAP-03 | FN-SCOPE | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Không xem phiếu NV khác | 403/404 | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SCOPE-AU-002** | CAP-03 | FN-SCOPE | AU | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Sai company scope | 409/empty | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-DET-HP-004** | CAP-02 | FN-DET | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Chi tiết khấu trừ/gross | dòng bind | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-FMT-BD-001** | CAP-03 | FN-FMT | BD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Money grouping vi-VN | hiển thị đúng | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-FMT-FD-002** | CAP-03 | FN-FMT | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Null amount | — không NaN | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SUM-UX-002** | CAP-01 | FN-SUM | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Loading shimmer | OK | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SUM-UX-003** | CAP-01 | FN-SUM | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Pull refresh | OK | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SUM-HP-005** | CAP-01 | FN-SUM | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Kỳ đã chốt vs draft | label trạng thái | MOBILE | matrix STT 360 · GET payroll/payslip summary |
| **TC-HRM-MOB-09-SUM-FD-003** | CAP-01 | FN-SUM | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Period invalid | 4xx | MOBILE | matrix STT 360 · GET payroll/payslip summary |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | GET payroll/payslip summary |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 360 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_PARTIAL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-09
stt_phase1: 360
cases_designed: 14
code_readiness: LIKELY_PARTIAL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
