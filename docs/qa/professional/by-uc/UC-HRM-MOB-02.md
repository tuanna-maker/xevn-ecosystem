# UC — `UC-HRM-MOB-02` · Chọn và xác nhận phạm vi công ty

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-02` |
| **stt_phase1** | 353 |
| **mod** | M06 |
| **name_vi** | Chọn và xác nhận phạm vi công ty |
| **actors** | multi-membership ESS |
| **surfaces** | hrm-mobile / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 353 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE · ADR scope ladder |
| **tech_spec** | TECHSPEC_MOBILE §4.2 |
| **api_contract** | memberships[] · x-company-id |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | **PARTIAL** (P0 smoke 2026-08-04) — single-CT PASS; multi-CT CONFIRM N/A · `po-uc-tc-w4-qa-e5-mob-rollup.md` |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | Company picker; 409 mismatch. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Chọn và xác nhận phạm vi công ty** đúng HDSD/SRS trên bề mặt hrm-mobile / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Chọn công ty | Multi-membership picker | NV kiêm nhiệm |
| **CAP-02** | Xác nhận scope | Gắn x-company-id | NV · hệ thống |
| **CAP-03** | Chặn lệch scope | 409/empty ngoài CT | hệ thống |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-PICK** | Mở danh sách membership | UI | N |
| CAP-02 | **FN-CONFIRM** | Xác nhận CT active | UI/API | Y |
| CAP-03 | **FN-MISMATCH** | Gọi API sai CT | API | Y |
| CAP-01 | **FN-SINGLE** | 1 membership auto | UI | N |

**Đếm chức năng:** **4**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-PICK | 0 | 0 | 1 | 0 | 3 | **4** |
| FN-CONFIRM | 2 | 2 | 0 | 0 | 0 | **4** |
| FN-MISMATCH | 0 | 0 | 0 | 3 | 0 | **3** |
| FN-SINGLE | 1 | 0 | 0 | 0 | 0 | **1** |
| **Tổng** | 3 | 2 | 1 | 3 | 3 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-02-CONFIRM-HP-001** | CAP-02 | FN-CONFIRM | HP | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | ≥2 CT → chọn → confirm | Active CT · header khớp | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-SINGLE-HP-002** | CAP-01 | FN-SINGLE | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | 1 membership auto | Home đúng CT | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-CONFIRM-FD-001** | CAP-02 | FN-CONFIRM | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Bỏ confirm khi bắt buộc | không mutate ngoài CT | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-MISMATCH-AU-001** | CAP-03 | FN-MISMATCH | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Đổi CT rồi gọi list CT cũ | 404/409 | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-MISMATCH-AU-002** | CAP-03 | FN-MISMATCH | AU | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Member không rollup tập đoàn | 403/409/empty ADR | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-PICK-UX-001** | CAP-01 | FN-PICK | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Empty memberships | message · logout path | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-PICK-UX-002** | CAP-01 | FN-PICK | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Loading memberships | shimmer | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-PICK-BD-001** | CAP-01 | FN-PICK | BD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Nhiều membership (>5) | scroll/select OK | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-CONFIRM-HP-003** | CAP-02 | FN-CONFIRM | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Persist CT sau kill-reopen | còn CT đã chọn | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-CONFIRM-FD-002** | CAP-02 | FN-CONFIRM | FD | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | CT inactive | reject + message | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-MISMATCH-AU-003** | CAP-03 | FN-MISMATCH | AU | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Thiếu x-company-id mutate | 409 | MOBILE | matrix STT 353 · memberships[] |
| **TC-HRM-MOB-02-PICK-UX-003** | CAP-01 | FN-PICK | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Tên CT trên shell | user thấy CT active | MOBILE | matrix STT 353 · memberships[] |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | memberships[] · x-company-id |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 353 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_IMPL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-02
stt_phase1: 353
cases_designed: 12
code_readiness: LIKELY_IMPL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
