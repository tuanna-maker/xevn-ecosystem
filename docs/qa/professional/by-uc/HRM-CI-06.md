# UC — `HRM-CI-06` · Xóa hợp đồng

| Meta | Value |
|------|--------|
| **uc_id** | `HRM-CI-06` |
| **stt_phase1** | 315 |
| **mod** | M05 |
| **name_vi** | Xóa hợp đồng |
| **actors** | HCNS · Tenant Admin |
| **surfaces** | hrm-embed / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 315 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_VN § soft-delete |
| **tech_spec** | TECHSPEC_HE §9.3 |
| **api_contract** | DELETE/soft-delete contracts/:id |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | Soft-delete only — hard-delete FD. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Xóa hợp đồng** đúng HDSD/SRS trên bề mặt hrm-embed / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Thực hiện Xóa hợp đồng | Mục tiêu chính UC | primary actor |
| **CAP-02** | Kiểm soát dữ liệu / BR | Validate · biên · trạng thái | hệ thống |
| **CAP-03** | Phạm vi & quyền | RBAC · company scope | hệ thống |
| **CAP-04** | Phản hồi FE sau soft-delete | List ẩn row · F5 | user |

**Đếm nghiệp vụ:** **4**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-OPEN** | Mở màn/HDSD path | UI | N |
| CAP-01 | **FN-MAIN** | Thực hiện hành động chính | UI/API | Y |
| CAP-02 | **FN-VAL** | Validate / BR fail-deep | API/UI | Y |
| CAP-03 | **FN-SCOPE** | Auth/scope | API | Y |
| CAP-01 | **FN-DETAIL** | List→detail / deep link | UI/API | N |
| CAP-01 | **FN-SOFT** | Soft-delete | API | Y |
| CAP-02 | **FN-HARD** | Chặn hard-delete | API | Y |
| CAP-04 | **FN-FE** | FE sau 2xx + F5 | UI | N |

**Đếm chức năng:** **8**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-MAIN | 1 | 1 | 0 | 0 | 3 | **5** |
| FN-VAL | 0 | 2 | 2 | 0 | 0 | **4** |
| FN-SCOPE | 0 | 0 | 0 | 3 | 0 | **3** |
| FN-DETAIL | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-SOFT | 1 | 0 | 0 | 1 | 0 | **2** |
| FN-HARD | 0 | 1 | 0 | 0 | 0 | **1** |
| FN-FE | 1 | 0 | 0 | 0 | 0 | **1** |
| **Tổng** | 5 | 4 | 2 | 4 | 3 | **18** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-CI-06-OPEN-HP-001** | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Login persona → menu SRS → Xóa hợp đồng (HDSD) | land đúng màn · không banner ERROR | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-MAIN-HP-002** | CAP-01 | FN-MAIN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Thực hiện mutate chính → Lưu/Gửi | 2xx mã nghiệp vụ · FE cập nhật · F5 còn | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-VAL-FD-001** | CAP-02 | FN-VAL | FD | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Thiếu field bắt buộc / BR sai | 4xx · không persist | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-VAL-FD-002** | CAP-02 | FN-VAL | FD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Trạng thái illegal (đã chốt/đã xóa/đã duyệt) | 4xx deterministic | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-SCOPE-AU-001** | CAP-03 | FN-SCOPE | AU | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Sai company / member vượt scope | 403/409 · không lộ data | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-SCOPE-AU-002** | CAP-03 | FN-SCOPE | AU | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Role không đủ quyền | 403 · nút ẩn/disabled | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-MAIN-UX-001** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Empty state | empty hợp lệ · không spinner vĩnh viễn | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-MAIN-UX-002** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | API 500 / sync error | banner honest | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-DETAIL-HP-003** | CAP-01 | FN-DETAIL | HP | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | List→detail hoặc deep link | không 404 scope_parity | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-VAL-BD-001** | CAP-02 | FN-VAL | BD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Biên ngày/số/tiền (vi-VN) | accept/reject documented | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-FE-HP-004** | CAP-04 | FN-FE | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | FE sau 2xx: row/toast/state | quan sát UI · F5 | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-MAIN-FD-003** | CAP-01 | FN-MAIN | FD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Double submit | idempotent/4xx | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-VAL-BD-002** | CAP-02 | FN-VAL | BD | P2 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Boundary độ dài lý do/tên | documented | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-SCOPE-AU-003** | CAP-03 | FN-SCOPE | AU | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Group CEO main vs member slug | rollup đúng ADR | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-MAIN-UX-003** | CAP-01 | FN-MAIN | UX | P2 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Loading/busy CTA | no double | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-SOFT-HP-005** | CAP-01 | FN-SOFT | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Soft-delete | 2xx · ẩn khỏi list active · F5 | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-HARD-FD-004** | CAP-02 | FN-HARD | FD | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Hard-delete attempt | forbidden 4xx | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |
| **TC-HRM-CI-06-SOFT-AU-004** | CAP-03 | FN-SOFT | AU | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Xóa ngoài quyền | 403 | UI/API | matrix STT 315 · DELETE/soft-delete contracts/:id |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | DELETE/soft-delete contracts/:id |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 315 |
| Mobile (nếu có) | N/A hoặc consumer phụ | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_IMPL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: HRM-CI-06
stt_phase1: 315
cases_designed: 18
code_readiness: LIKELY_IMPL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
