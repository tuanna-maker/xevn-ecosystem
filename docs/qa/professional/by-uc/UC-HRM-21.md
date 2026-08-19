# UC — `UC-HRM-21` · Embed — Danh sách nhân sự

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-21` |
| **stt_phase1** | 345 |
| **mod** | M05 |
| **name_vi** | Embed — Danh sách nhân sự |
| **actors** | ceo@ · HRBP · member CEO |
| **surfaces** | web-portal / hrm-embed |
| **srs_old** | `docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md` STT 345 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS FR (nếu map) |
| **srs_new** | SRS_VN § NV |
| **tech_spec** | TECHSPEC_HE §9.3 |
| **api_contract** | GET /api/hrm/employees |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | J-HRM-01 list→profile scope_parity. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Embed — Danh sách nhân sự** đúng HDSD/SRS trên bề mặt web-portal / hrm-embed: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Thực hiện Embed — Danh sách nhân sự | Mục tiêu chính UC | primary actor |
| **CAP-02** | Kiểm soát dữ liệu / BR | Validate · biên · trạng thái | hệ thống |
| **CAP-03** | Phạm vi & quyền | RBAC · company scope | hệ thống |
| **CAP-04** | Cross-nav embed | Tab load + list→detail | user |

**Đếm nghiệp vụ:** **4**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | **FN-OPEN** | Mở màn/HDSD path | UI | N |
| CAP-01 | **FN-MAIN** | Xem/tải dữ liệu chính | UI/API | N |
| CAP-02 | **FN-VAL** | Validate / BR fail-deep | API/UI | Y |
| CAP-03 | **FN-SCOPE** | Auth/scope | API | Y |
| CAP-01 | **FN-DETAIL** | List→detail / deep link | UI/API | N |
| CAP-04 | **FN-TAB** | Load tab embed | UI | N |
| CAP-04 | **FN-J** | Journey L2.5 | UI | N |

**Đếm chức năng:** **7**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-MAIN | 1 | 0 | 0 | 0 | 2 | **3** |
| FN-VAL | 0 | 2 | 1 | 0 | 0 | **3** |
| FN-SCOPE | 0 | 0 | 0 | 3 | 0 | **3** |
| FN-DETAIL | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-TAB | 1 | 1 | 0 | 0 | 1 | **3** |
| FN-J | 1 | 0 | 0 | 0 | 0 | **1** |
| **Tổng** | 5 | 3 | 1 | 3 | 3 | **15** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-21-OPEN-HP-001** | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Login persona → menu SRS → Embed — Danh sách nhân sự (HDSD) | land đúng màn · không banner ERROR | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-MAIN-HP-002** | CAP-01 | FN-MAIN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Tải dữ liệu chính / list | 2xx · FE bind · empty hợp lệ nếu 0 | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-VAL-FD-001** | CAP-02 | FN-VAL | FD | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Thiếu field bắt buộc / BR sai | 4xx · không persist | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-VAL-FD-002** | CAP-02 | FN-VAL | FD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Trạng thái illegal (đã chốt/đã xóa/đã duyệt) | 4xx deterministic | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-SCOPE-AU-001** | CAP-03 | FN-SCOPE | AU | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Sai company / member vượt scope | 403/409 · không lộ data | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-SCOPE-AU-002** | CAP-03 | FN-SCOPE | AU | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Role không đủ quyền | 403 · nút ẩn/disabled | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-MAIN-UX-001** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Empty state | empty hợp lệ · không spinner vĩnh viễn | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-MAIN-UX-002** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | API 500 / sync error | banner honest | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-DETAIL-HP-003** | CAP-01 | FN-DETAIL | HP | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | List→detail hoặc deep link | không 404 scope_parity | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-VAL-BD-001** | CAP-02 | FN-VAL | BD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Biên ngày/số/tiền (vi-VN) | accept/reject documented | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-TAB-HP-004** | CAP-04 | FN-TAB | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Tab embed load P-CC / HRM | không 409/54321 bắt buộc | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-J-HP-005** | CAP-04 | FN-J | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | L2.5 click path list→detail | PASS URL+API | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-TAB-FD-003** | CAP-04 | FN-TAB | FD | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | HRM API down (:28001) | banner Sync ERROR · không pretend OK | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-SCOPE-AU-003** | CAP-03 | FN-SCOPE | AU | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | member CEO vs ceo@xe.vn scope | đúng ADR | UI | matrix STT 345 · GET /api/hrm/employees |
| **TC-HRM-21-TAB-UX-003** | CAP-04 | FN-TAB | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | iframe/proxy reload F5 | data còn/empty hợp lệ | UI | matrix STT 345 · GET /api/hrm/employees |

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
| BE API/DTO | Matrix/API_CONTRACT có tín hiệu | GET /api/hrm/employees |
| FE menu/nút/role | Surface khai trong inventory | BANG_TONG_HOP STT 345 |
| Mobile (nếu có) | N/A hoặc consumer phụ | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** `LIKELY_IMPL` (design-time; matrix `e2e_pass` ≠ UAT FE U65).

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-21
stt_phase1: 345
cases_designed: 15
code_readiness: LIKELY_IMPL
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
```
