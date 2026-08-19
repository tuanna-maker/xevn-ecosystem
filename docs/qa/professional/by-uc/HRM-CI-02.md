# UC — `HRM-CI-02` · Ghi nhận bảo hiểm nhân viên

| Meta | Value |
|------|--------|
| **uc_id** | `HRM-CI-02` |
| **stt_phase1** | 311 |
| **mod** | M05 |
| **name_vi** | Ghi nhận bảo hiểm nhân viên |
| **actors** | HCNS |
| **surfaces** | hrm-embed / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 311 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_VN § BHXH |
| **tech_spec** | TECHSPEC_HE §9.3 |
| **api_contract** | POST insurance enrollment |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | Insurance amounts vi-VN grouping FE. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Ghi nhận bảo hiểm nhân viên** đúng HDSD/SRS trên bề mặt hrm-embed / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Thực hiện Ghi nhận bảo hiểm nhân viên | Mục tiêu chính UC | primary actor |
| **CAP-02** | Kiểm soát dữ liệu / BR | Validate · biên · trạng thái | hệ thống |
| **CAP-03** | Phạm vi & quyền | RBAC · company scope | hệ thống |
| **CAP-04** | Phản hồi FE sau mutate | List/detail/F5 sau 2xx | user |

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
| CAP-04 | **FN-FE** | FE sau 2xx + F5 | UI | N |

**Đếm chức năng:** **6**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-MAIN | 1 | 1 | 0 | 0 | 3 | **5** |
| FN-VAL | 0 | 2 | 2 | 0 | 0 | **4** |
| FN-SCOPE | 0 | 0 | 0 | 3 | 0 | **3** |
| FN-DETAIL | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-FE | 1 | 0 | 0 | 0 | 0 | **1** |
| **Tổng** | 4 | 3 | 2 | 3 | 3 | **15** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-CI-02-OPEN-HP-001** | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Login persona → menu SRS → Ghi nhận bảo hiểm nhân viên (HDSD) | land đúng màn · không banner ERROR | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-MAIN-HP-002** | CAP-01 | FN-MAIN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Thực hiện mutate chính → Lưu/Gửi | 2xx mã nghiệp vụ · FE cập nhật · F5 còn | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-VAL-FD-001** | CAP-02 | FN-VAL | FD | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Thiếu field bắt buộc / BR sai | 4xx · không persist | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-VAL-FD-002** | CAP-02 | FN-VAL | FD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Trạng thái illegal (đã chốt/đã xóa/đã duyệt) | 4xx deterministic | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-SCOPE-AU-001** | CAP-03 | FN-SCOPE | AU | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Sai company / member vượt scope | 403/409 · không lộ data | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-SCOPE-AU-002** | CAP-03 | FN-SCOPE | AU | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Role không đủ quyền | 403 · nút ẩn/disabled | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-MAIN-UX-001** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Empty state | empty hợp lệ · không spinner vĩnh viễn | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-MAIN-UX-002** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | API 500 / sync error | banner honest | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-DETAIL-HP-003** | CAP-01 | FN-DETAIL | HP | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | List→detail hoặc deep link | không 404 scope_parity | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-VAL-BD-001** | CAP-02 | FN-VAL | BD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Biên ngày/số/tiền (vi-VN) | accept/reject documented | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-FE-HP-004** | CAP-04 | FN-FE | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | FE sau 2xx: row/toast/state | quan sát UI · F5 | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-MAIN-FD-003** | CAP-01 | FN-MAIN | FD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Double submit | idempotent/4xx | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-VAL-BD-002** | CAP-02 | FN-VAL | BD | P2 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Boundary độ dài lý do/tên | documented | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-SCOPE-AU-003** | CAP-03 | FN-SCOPE | AU | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Group CEO main vs member slug | rollup đúng ADR | UI/API | matrix STT 311 · POST insurance enrollment |
| **TC-HRM-CI-02-MAIN-UX-003** | CAP-01 | FN-MAIN | UX | P2 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Loading/busy CTA | no double | UI/API | matrix STT 311 · POST insurance enrollment |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | POST insurance enrollment |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 311 |
| Mobile (nếu có) | N/A hoặc consumer phụ | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_IMPL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: HRM-CI-02
stt_phase1: 311
cases_designed: 15
code_readiness: LIKELY_IMPL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
