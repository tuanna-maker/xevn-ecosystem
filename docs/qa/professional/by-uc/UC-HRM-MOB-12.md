# UC — `UC-HRM-MOB-12` · Xem và cập nhật hồ sơ cá nhân

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-12` |
| **stt_phase1** | 363 |
| **mod** | M06 |
| **name_vi** | Xem và cập nhật hồ sơ cá nhân |
| **actors** | ESS |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 363 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE |
| **tech_spec** | MOB-PROFILE neo |
| **api_contract** | GET/PATCH profile · metadata request |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Profile view/update. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Xem và cập nhật hồ sơ cá nhân** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Xem hồ sơ | Profile read | NV |
| **CAP-02** | Cập nhật field cho phép | Edit own | NV |
| **CAP-03** | Yêu cầu đổi metadata | MD-01 bridge | NV |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-VIEW** | Mở profile | GET | N |
| CAP-02 | **FN-EDIT** | Lưu field ESS | PATCH | Y |
| CAP-03 | **FN-MD** | Gửi yêu cầu MD | POST | Y |

**Đếm chức năng:** **3**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-VIEW | 2 | 1 | 0 | 1 | 2 | **6** |
| FN-EDIT | 1 | 1 | 1 | 1 | 0 | **4** |
| FN-MD | 1 | 1 | 0 | 0 | 0 | **2** |
| **Tổng** | 4 | 3 | 1 | 2 | 2 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-12-VIEW-HP-001** | CAP-01 | FN-VIEW | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Mở Profile | họ tên · mã NV | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-EDIT-HP-002** | CAP-02 | FN-EDIT | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Sửa field cho phép → Lưu | 2xx · F5 | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-EDIT-FD-001** | CAP-02 | FN-EDIT | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Sửa field bị khóa | 4xx/disabled | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-MD-HP-003** | CAP-03 | FN-MD | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Gửi yêu cầu đổi metadata | 2xx pending | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-MD-FD-002** | CAP-03 | FN-MD | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | MD thiếu lý do/value | 4xx | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-EDIT-AU-001** | CAP-02 | FN-EDIT | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Không sửa NV khác | 403 | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-VIEW-UX-001** | CAP-01 | FN-VIEW | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Empty optional | — | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-VIEW-UX-002** | CAP-01 | FN-VIEW | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | API fail | banner | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-EDIT-BD-001** | CAP-02 | FN-EDIT | BD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Phone/email format | validate | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-VIEW-HP-004** | CAP-01 | FN-VIEW | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Neo MOB-PROFILE | HDSD | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-VIEW-FD-003** | CAP-01 | FN-VIEW | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | PII mask trên log | no leak | MOBILE | matrix STT 363 · GET/PATCH profile |
| **TC-HRM-MOB-12-VIEW-AU-002** | CAP-01 | FN-VIEW | AU | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Scope CT | đúng CT | MOBILE | matrix STT 363 · GET/PATCH profile |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | GET/PATCH profile · metadata request |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 363 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_PARTIAL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-12
stt_phase1: 363
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
