# UC — `UC-HRM-MOB-06` · Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-06` |
| **stt_phase1** | 357 |
| **mod** | M06 |
| **name_vi** | Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép |
| **actors** | ESS uat.nv0003 |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 357 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE · FR-UC-M03/M04 · exemplar Leave/ATT |
| **tech_spec** | TECHSPEC_MOBILE · MOB-LEAVE-APPR · MOB-ATTENDANCE neo |
| **api_contract** | POST update-requests · leave-requests · files/upload |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | **PARTIAL** (P0 smoke 2026-08-04) — ATT create `HRM-ATT-REQ-201` PASS; leave wizard PARTIAL; L2 **SPEC_GAP** · `po-uc-tc-w4-qa-e5-mob-rollup.md` |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | ESS 25+; L2 SPEC_GAP inventory not PASS. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Tạo đơn chỉnh CC / đi muộn | NV đăng ký sửa giờ | NV |
| **CAP-02** | Tạo đơn nghỉ phép | NV đăng ký nghỉ | NV |
| **CAP-03** | Validate nộp | Field / balance / notice | hệ thống |
| **CAP-04** | Giấy tờ nghỉ | Upload path hợp lệ | NV |
| **CAP-05** | L2 ladder (TO-BE) | Duyệt cấp 2 vượt ngưỡng | L2 · SPEC_GAP |

**Đếm nghiệp vụ:** **5**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-ATT-NAV** | Mở CreateUpdateRequest | UI MOB-ATTENDANCE | N |
| CAP-01 | **FN-ATT-CREATE** | Gửi update-request | POST …/update-requests | Y |
| CAP-02 | **FN-LV-NAV** | Mở CreateLeaveRequest | UI MOB-LEAVE-APPR | N |
| CAP-02 | **FN-LV-CREATE** | Gửi leave-request | POST …/leave-requests | Y |
| CAP-03 | **FN-VAL** | Validate date/reason/type | API/UI | Y |
| CAP-04 | **FN-ATTACH** | Upload leave attachment | POST …/files/upload | Y |
| CAP-05 | **FN-L2** | Approve L2 | API | Y |

**Đếm chức năng:** **7**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-ATT-NAV | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-ATT-CREATE | 1 | 0 | 1 | 1 | 1 | **4** |
| FN-LV-NAV | 1 | 0 | 0 | 0 | 1 | **2** |
| FN-LV-CREATE | 2 | 1 | 1 | 1 | 1 | **6** |
| FN-VAL | 0 | 6 | 1 | 0 | 0 | **7** |
| FN-ATTACH | 1 | 3 | 0 | 0 | 0 | **4** |
| FN-L2 | 0 | 0 | 0 | 0 | 0 (+2 SG/LOCK) | **2** |
| **Tổng** | 6 | 10 | 3 | 2 | 3 | **26** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-06-ATT-CREATE-HP-001** | CAP-01 | FN-ATT-CREATE | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | ATT: FAB → Đơn công → ISO giờ + lý do → Gửi | 201 HRM-ATT-REQ-201 · pending · F5 | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-LV-CREATE-HP-002** | CAP-02 | FN-LV-CREATE | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | LEAVE: wizard 4 bước → Gửi phép năm | 2xx pending · list · F5 | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-ATT-NAV-HP-003** | CAP-01 | FN-ATT-NAV | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Neo MOB-ATTENDANCE CreateUpdateRequest | land HDSD | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-LV-NAV-HP-004** | CAP-02 | FN-LV-NAV | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Neo MOB-LEAVE-APPR CreateLeaveRequest | wizard OK | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-VAL-FD-001** | CAP-03 | FN-VAL | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | ATT thiếu ngày/lý do | 4xx · không row | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-VAL-FD-002** | CAP-03 | FN-VAL | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | ATT giờ HH:mm trần | 4xx (không 500) | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-VAL-FD-003** | CAP-03 | FN-VAL | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | LEAVE thiếu loại/ngày | FE/API block | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-ATTACH-FD-004** | CAP-04 | FN-ATTACH | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | LEAVE ốm ≥3d thiếu attach | 4xx | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-VAL-FD-005** | CAP-03 | FN-VAL | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | LEAVE vượt số dư | 4xx | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-VAL-FD-006** | CAP-03 | FN-VAL | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | LEAVE overlap pending | 4xx | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-VAL-FD-007** | CAP-03 | FN-VAL | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | LEAVE phép năm <3d notice | 4xx hoặc soft documented | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-ATTACH-FD-008** | CAP-04 | FN-ATTACH | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Attach URL ngoài /api/hrm/files/ | 4xx | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-ATT-CREATE-BD-001** | CAP-01 | FN-ATT-CREATE | BD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | ATT ISO TIMESTAMPTZ | 201 | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-LV-CREATE-BD-002** | CAP-02 | FN-LV-CREATE | BD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | LEAVE total_days=1 | 2xx | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-VAL-BD-003** | CAP-03 | FN-VAL | BD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | LEAVE biên số dư còn 1 | 2xx | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-ATT-CREATE-AU-001** | CAP-01 | FN-ATT-CREATE | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Tạo đơn gắn CT khác | 403/409 | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-LV-CREATE-AU-002** | CAP-02 | FN-LV-CREATE | AU | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Member scope leave | không persist ngoài CT | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-LV-CREATE-UX-001** | CAP-02 | FN-LV-CREATE | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | WF spawn missing | SPAWN-MISSING honest | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-ATT-CREATE-UX-002** | CAP-01 | FN-ATT-CREATE | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Busy submit | 1 request | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-LV-NAV-UX-003** | CAP-02 | FN-LV-NAV | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Empty balance header | 0/— | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-ATTACH-HP-005** | CAP-04 | FN-ATTACH | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Upload attach sick OK | 2xx + create | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-ATTACH-FD-009** | CAP-04 | FN-ATTACH | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | File >10MB / sai MIME | reject | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-L2-SG-001** | CAP-05 | FN-L2 | SG | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | SPEC_GAP inventory: đơn vượt ngưỡng cần L2 | BLOCKED — không claim PASS | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-L2-SG-002** | CAP-05 | FN-L2 | SG | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | SPEC_GAP inventory: sau L1 chưa terminal khi vượt N | BLOCKED design only | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-LV-CREATE-HP-006** | CAP-02 | FN-LV-CREATE | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Persona uat.nv0003 → manager uat.nv0001 | manager_id lock | MOBILE | matrix STT 357 · POST update-requests |
| **TC-HRM-MOB-06-LV-CREATE-FD-010** | CAP-02 | FN-LV-CREATE | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Cancel/edit own pending illegal | 4xx | MOBILE | matrix STT 357 · POST update-requests |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | yes | yes | |
| Mọi FN mutate ≥1 HP + ≥1 FD (hoặc SG inventory) | yes | reviewed | SG/LOCK counted separate |
| Auth/scope nếu đa CT | yes | AU cases | |
| SPEC_GAP ghi rõ | yes | see below | không PASS |

**SPEC_GAP / LOCK inventory:**
- FN-L2 / CAP-05 — ladder L2 AS-IS 1 bước: inventory TC only, không PASS / không invent T_L1/N

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | POST update-requests · leave-requests · files/upload |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 357 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_IMPL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-06
stt_phase1: 357
cases_designed: 26
code_readiness: LIKELY_IMPL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
