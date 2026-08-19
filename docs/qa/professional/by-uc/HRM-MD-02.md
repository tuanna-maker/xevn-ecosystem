# UC — `HRM-MD-02` · Xem hàng chờ thay đổi metadata

| Meta | Value |
|------|--------|
| **uc_id** | `HRM-MD-02` |
| **stt_phase1** | 318 |
| **mod** | M05 |
| **name_vi** | Xem hàng chờ thay đổi metadata |
| **actors** | HCNS · HRBP · Approver |
| **surfaces** | hrm-embed / api |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 318 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_VN § metadata |
| **tech_spec** | TECHSPEC_HE §9.3 |
| **api_contract** | GET metadata queue |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | **UI_PASS** — R1 regression (`PO-UC-TC-W4-QA-B2-HRM-MD-R1`) OPEN land + GET **200** `HRM-META-200` · no Sync ERROR |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | Embed UC-HRM-26 consumer. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W4-QA-B2-HRM-MD-R1` |
| **evidence** | `docs/qa/evidence/po-uc-tc-w4-qa-b2-hrm-md-r1.md` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Xem hàng chờ thay đổi metadata** đúng HDSD/SRS trên bề mặt hrm-embed / api: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Thực hiện Xem hàng chờ thay đổi metadata | Mục tiêu chính UC | primary actor |
| **CAP-02** | Kiểm soát dữ liệu / BR | Validate · biên · trạng thái | hệ thống |
| **CAP-03** | Phạm vi & quyền | RBAC · company scope | hệ thống |

**Đếm nghiệp vụ:** **3**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-OPEN** | Mở màn/HDSD path | UI | N |
| CAP-01 | **FN-MAIN** | Xem/tải dữ liệu chính | UI/API | N |
| CAP-02 | **FN-VAL** | Validate / BR fail-deep | API/UI | Y |
| CAP-03 | **FN-SCOPE** | Auth/scope | API | Y |
| CAP-01 | **FN-DETAIL** | List→detail / deep link | UI/API | N |

**Đếm chức năng:** **5**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-MAIN | 2 | 0 | 0 | 0 | 2 | **4** |
| FN-VAL | 0 | 3 | 1 | 0 | 0 | **4** |
| FN-SCOPE | 0 | 0 | 0 | 2 | 0 | **2** |
| FN-DETAIL | 1 | 0 | 0 | 0 | 0 | **1** |
| **Tổng** | 4 | 3 | 1 | 2 | 2 | **12** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-MD-02-OPEN-HP-001** | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Login persona → menu SRS → Xem hàng chờ thay đổi metadata (HDSD) | land đúng màn · không banner ERROR | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-MAIN-HP-002** | CAP-01 | FN-MAIN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Tải dữ liệu chính / list | 2xx · FE bind · empty hợp lệ nếu 0 | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-VAL-FD-001** | CAP-02 | FN-VAL | FD | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Thiếu field bắt buộc / BR sai | 4xx · không persist | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-VAL-FD-002** | CAP-02 | FN-VAL | FD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Trạng thái illegal (đã chốt/đã xóa/đã duyệt) | 4xx deterministic | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-SCOPE-AU-001** | CAP-03 | FN-SCOPE | AU | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Sai company / member vượt scope | 403/409 · không lộ data | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-SCOPE-AU-002** | CAP-03 | FN-SCOPE | AU | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Role không đủ quyền | 403 · nút ẩn/disabled | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-MAIN-UX-001** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Empty state | empty hợp lệ · không spinner vĩnh viễn | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-MAIN-UX-002** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | API 500 / sync error | banner honest | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-DETAIL-HP-003** | CAP-01 | FN-DETAIL | HP | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | List→detail hoặc deep link | không 404 scope_parity | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-VAL-BD-001** | CAP-02 | FN-VAL | BD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Biên ngày/số/tiền (vi-VN) | accept/reject documented | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-MAIN-HP-004** | CAP-01 | FN-MAIN | HP | P2 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Pagination / search nếu có | đúng page | UI/API | matrix STT 318 · GET metadata queue |
| **TC-HRM-MD-02-VAL-FD-003** | CAP-02 | FN-VAL | FD | P2 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Malformed query | 4xx | UI/API | matrix STT 318 · GET metadata queue |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | GET metadata queue |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 318 |
| Mobile (nếu có) | N/A hoặc consumer phụ | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_IMPL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: PASS_TO_PM
uc_id: HRM-MD-02
stt_phase1: 318
cases_designed: 12
execution: UI_PASS
code_readiness: LIKELY_IMPL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W4-QA-B2-HRM-MD
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b2-hrm-md-rollup.md
```
