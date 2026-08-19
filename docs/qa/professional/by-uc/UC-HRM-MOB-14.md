# UC — `UC-HRM-MOB-14` · Làm việc ngoại tuyến có kiểm soát

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-MOB-14` |
| **stt_phase1** | 365 |
| **mod** | M06 |
| **name_vi** | Làm việc ngoại tuyến có kiểm soát |
| **actors** | ESS |
| **surfaces** | hrm-mobile |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 365 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_MOBILE P2 offline |
| **tech_spec** | TECHSPEC_MOBILE §8 |
| **api_contract** | cache read-model (no fake mutate) |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `GAP` — **không** = UAT PASS |
| **code_note** | P2 offline — GAP/PARTIAL honest. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

> **Depth pack neo (không copy đè):** `docs/qa/testcases/hrm-mobile/` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar `UC-FR-H03_LEAVE.md` · `UC-ATT_ESS_ADJUST.md`.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Làm việc ngoại tuyến có kiểm soát** đúng HDSD/SRS trên bề mặt hrm-mobile: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Đọc cache offline | Read-model TTL | NV |
| **CAP-02** | Chặn mutate offline | Không POST giả thành công | hệ thống |
| **CAP-03** | Banner chỉ xem | UX honest | NV |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-CACHE** | Xem dữ liệu đã sync | cache | N |
| CAP-02 | **FN-BLOCK** | Thử gửi đơn offline | UI | Y |
| CAP-03 | **FN-BANNER** | Banner offline | UI | N |

**Đếm chức năng:** **3**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CACHE | 3 | 1 | 1 | 1 | 1 | **7** |
| FN-BLOCK | 0 | 2 | 0 | 0 | 0 (+1 SG/LOCK) | **3** |
| FN-BANNER | 0 | 0 | 0 | 0 | 2 | **2** |
| **Tổng** | 3 | 3 | 1 | 1 | 3 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MOB-14-CACHE-HP-001** | CAP-01 | FN-CACHE | HP | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Airplane sau sync → History cache | read-model hoặc empty honest | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-BLOCK-FD-001** | CAP-02 | FN-BLOCK | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Gửi leave/att offline | block · không fake 2xx | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-BLOCK-FD-002** | CAP-02 | FN-BLOCK | FD | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Check-in offline | queue documented hoặc block | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-BANNER-UX-001** | CAP-03 | FN-BANNER | UX | P0 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Banner «chỉ xem» | hiện khi cache | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-CACHE-UX-002** | CAP-01 | FN-CACHE | UX | P1 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Hết TTL cache | force online/error | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-CACHE-AU-001** | CAP-01 | FN-CACHE | AU | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Cache không lẫn CT | scope | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-CACHE-BD-001** | CAP-01 | FN-CACHE | BD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Cache size max | evict documented | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-BLOCK-SG-001** | CAP-02 | FN-BLOCK | SG | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | SPEC_GAP: offline queue mutate chưa ship | inventory BLOCKED | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-CACHE-HP-002** | CAP-01 | FN-CACHE | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Reconnect → sync pull | REST refresh | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-CACHE-FD-003** | CAP-01 | FN-CACHE | FD | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Corrupt cache | safe clear | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-BANNER-UX-003** | CAP-03 | FN-BANNER | UX | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Settings offline mode | nếu có | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |
| **TC-HRM-MOB-14-CACHE-HP-003** | CAP-01 | FN-CACHE | HP | P2 | uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt) | U65 FE precond · không seed | Payslip cache read-only | không edit | MOBILE | matrix STT 365 · cache read-model (no fake mutate) |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | yes | yes | |
| Mọi FN mutate ≥1 HP + ≥1 FD (hoặc SG inventory) | yes | reviewed | SG/LOCK counted separate |
| Auth/scope nếu đa CT | yes | AU cases | |
| SPEC_GAP ghi rõ | yes | see below | không PASS |

**SPEC_GAP / LOCK inventory:**
- P2 offline — nhiều nhánh GAP vs TECHSPEC_MOBILE §8

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Thiếu/ partial endpoint | cache read-model (no fake mutate) |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 365 |
| Mobile (nếu có) | TECHSPEC_MOBILE + depth pack neo | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `GAP` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-MOB-14
stt_phase1: 365
cases_designed: 12
code_readiness: GAP
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
