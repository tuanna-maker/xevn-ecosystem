# UC — `UC-HRM-MOB-10` · Xem hợp đồng và bảo hiểm

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-10` |
| **stt_phase1** | 361 |
| **mod** | M06 |
| **name_vi** | Xem hợp đồng và bảo hiểm |
| **actors** | ESS |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 361 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE |
| **tech_spec** | TECHSPEC_MOBILE · MOB-PROFILE neo |
| **api_contract** | GET contracts/insurance own |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Own contract read. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Xem hợp đồng và bảo hiểm** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Xem HĐ của tôi | Contract read | NV |
| **CAP-02** | Xem BH | Insurance read | NV |
| **CAP-03** | Format / scope | Date VI · own only | hệ thống |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-CTR** | List/detail HĐ | GET | N |
| CAP-02 | **FN-INS** | Xem BH | GET | N |
| CAP-03 | **FN-FMT** | dd/MM/yyyy | UI | N |

**Đếm chức năng:** **3**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CTR | 3 | 1 | 0 | 2 | 2 | **8** |
| FN-INS | 1 | 0 | 0 | 0 | 1 | **2** |
| FN-FMT | 0 | 1 | 1 | 0 | 0 | **2** |
| **Tổng** | 4 | 2 | 1 | 2 | 3 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-10-CTR-HP-001** | CAP-01 | FN-CTR | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Mở HĐ/BH từ Profile | HĐ active hoặc empty | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-CTR-HP-002** | CAP-01 | FN-CTR | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Chi tiết HĐ | số HĐ · ngày hiệu lực | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-INS-HP-003** | CAP-02 | FN-INS | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Thông tin BHXH | sổ / trạng thái | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-CTR-FD-001** | CAP-01 | FN-CTR | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | API fail | banner | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-CTR-UX-001** | CAP-01 | FN-CTR | UX | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Chưa có HĐ | empty | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-CTR-AU-001** | CAP-03 | FN-CTR | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Không xem HĐ NV khác | 403/404 | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-FMT-BD-001** | CAP-03 | FN-FMT | BD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Ngày hết hạn biên | format đúng | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-FMT-FD-002** | CAP-03 | FN-FMT | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Null date | — | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-CTR-UX-002** | CAP-01 | FN-CTR | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Loading | OK | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-CTR-HP-004** | CAP-01 | FN-CTR | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Neo MOB-PROFILE | entry đúng | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-CTR-AU-002** | CAP-03 | FN-CTR | AU | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Sai CT | empty/409 | MOBILE | matrix STT 361 · GET contracts/insurance own |
| **TC-HRM-MOB-10-INS-UX-003** | CAP-02 | FN-INS | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Pull refresh | OK | MOBILE | matrix STT 361 · GET contracts/insurance own |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | GET contracts/insurance own |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 361 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_PARTIAL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-10
stt_phase1: 361
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
