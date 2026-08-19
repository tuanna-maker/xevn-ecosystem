# UC — `UC-HRM-27` · Embed — Quyết định nhân sự

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-27` |
| **stt_phase1** | 351 |
| **mod** | M05 |
| **name_vi** | Embed — Quyết định nhân sự (SoT HRM) · ecosystem STT 351 alias «…và báo cáo (backlog)» = stale/waived |
| **actors** | CEO · HRBP |
| **surfaces** | web-portal / hrm-embed |
| **srs_old** | `docs/hrm/SRS.md` UC-HRM-27 · `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` STT 104 · ecosystem STT 351 (alias stale) · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` |
| **srs_new** | N/A-DELTA (SRS_VN không map riêng) |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §11.2 / §16.5 #50 / G-DEC-01 · TECHSPEC_HE §9.3 (generic only) |
| **api_contract** | `GET/POST/PATCH/DELETE /api/hrm/decisions` (`HRM-DEC-200`/`201`) — reports OUT |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB · BA delta PO-UC-TC-W3-BA-HRM27 |
| **design_status** | **DESIGNED** |
| **execution** | decisions live (density GWC); product DONE open |
| **uat_done** | **false** |
| **code_readiness** | `PARTIAL` — **không** = UAT PASS · **không** = product DONE |
| **code_note** | W3 BA **BACKLOG-HOLD** rewrite: FE+BE decisions live (`Decisions.tsx` + `decisions/*`); G-DEC-01 density CLOSED 2026-07-22; AC-DEC-DONE still open; `/reports` OUT of UC-27 (mock backlog). Evidence: `docs/qa/evidence/po-uc-tc-w3-ba-hrm27.md`. |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | `PO-UC-TC-W3-BA-HRM27` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **Embed — Quyết định nhân sự** (`/decisions`) đúng HDSD/`docs/hrm/SRS.md` UC-HRM-27 trên web-portal / hrm-embed: list/empty/create→F5 theo AC-DEC-*; scope parity; **không** gộp `/reports` vào DONE; **không** claim UAT/product DONE khi AC-DEC-DONE còn mở. W3: Dev rewrite greenfield = **BACKLOG-HOLD**.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| **CAP-01** | Thực hiện Embed — Quyết định nhân sự | Mục tiêu chính UC (decisions-only) | primary actor |
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
| FN-MAIN | 1 | 0 | 0 | 0 | 2 (+1 SG/LOCK) | **4** |
| FN-VAL | 0 | 2 | 1 | 0 | 0 | **3** |
| FN-SCOPE | 0 | 0 | 0 | 3 | 0 | **3** |
| FN-DETAIL | 1 | 0 | 0 | 0 | 0 | **1** |
| FN-TAB | 1 | 1 | 0 | 0 | 1 | **3** |
| FN-J | 1 | 0 | 0 | 0 | 0 | **1** |
| **Tổng** | 5 | 3 | 1 | 3 | 3 | **16** |

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| **TC-HRM-27-OPEN-HP-001** | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Login → menu Quyết định → `/hr/decisions` (HDSD) | land đúng màn · không banner ERROR | UI | SRS UC-HRM-27 · AC-DEC-01 |
| **TC-HRM-27-MAIN-HP-002** | CAP-01 | FN-MAIN | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Tải list `GET …/decisions` | 200 `HRM-DEC-200` · FE bind · empty hợp lệ nếu 0 | UI | AC-DEC-01/02 |
| **TC-HRM-27-VAL-FD-001** | CAP-02 | FN-VAL | FD | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Thiếu field bắt buộc / BR sai | 4xx · không persist | UI | BR-DEC / CreateDecisionDto |
| **TC-HRM-27-VAL-FD-002** | CAP-02 | FN-VAL | FD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Trạng thái illegal (đã xóa / id lạ) | 4xx deterministic | UI | PATCH/DELETE fail-deep |
| **TC-HRM-27-SCOPE-AU-001** | CAP-03 | FN-SCOPE | AU | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Sai company / member vượt scope | 403/409 · không lộ data | UI | BR-DEC-02 |
| **TC-HRM-27-SCOPE-AU-002** | CAP-03 | FN-SCOPE | AU | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Role không đủ quyền | 403 · nút ẩn/disabled | UI | RBAC module decisions |
| **TC-HRM-27-MAIN-UX-001** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Empty state | «Không có quyết định nào» · không spinner vĩnh viễn | UI | AC-DEC-02 · BR-DEC-03 |
| **TC-HRM-27-MAIN-UX-002** | CAP-01 | FN-MAIN | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | API 500 / sync error | banner honest · không mock row | UI | BR-MOCK-02 · E-DEC-5xx |
| **TC-HRM-27-DETAIL-HP-003** | CAP-01 | FN-DETAIL | HP | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | List→detail hoặc deep link | không 404 scope_parity | UI | H-DEC-DETAIL · AC-DEC-03 |
| **TC-HRM-27-VAL-BD-001** | CAP-02 | FN-VAL | BD | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Biên ngày (vi-VN dd/MM/yyyy) | accept/reject documented | UI | effective_date / signing_date |
| **TC-HRM-27-TAB-HP-004** | CAP-04 | FN-TAB | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | Tab embed load decisions | không 409/54321 bắt buộc | UI | UF-HRM-MENU-05 |
| **TC-HRM-27-J-HP-005** | CAP-04 | FN-J | HP | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed · row tồn tại qua FE create | L2.5 list→detail | PASS URL+API | UI | AC-DEC-03 |
| **TC-HRM-27-TAB-FD-003** | CAP-04 | FN-TAB | FD | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | HRM API down (:28001) | banner Sync ERROR · không pretend OK | UI | E-DEC-5xx |
| **TC-HRM-27-SCOPE-AU-003** | CAP-03 | FN-SCOPE | AU | P0 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | member CEO vs ceo@xe.vn scope | đúng ADR ladder | UI | BR-DEC-02 |
| **TC-HRM-27-TAB-UX-003** | CAP-04 | FN-TAB | UX | P1 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | iframe/proxy reload F5 | data còn/empty hợp lệ | UI | AC-DEC-04 F5 |
| **TC-HRM-27-MAIN-SG-001** | CAP-01 | FN-MAIN | SG | P2 | ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU | U65 FE precond · không seed | AC-DEC-DONE / reports OUT — HOLD inventory | không claim UAT/product DONE; `/reports` ≠ UC-27 | UI | W3 BACKLOG-HOLD · po-uc-tc-w3-ba-hrm27 |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | yes | yes | |
| Mọi FN mutate ≥1 HP + ≥1 FD (hoặc SG inventory) | yes | reviewed | SG/LOCK counted separate |
| Auth/scope nếu đa CT | yes | AU cases | |
| SPEC_GAP ghi rõ | yes | see below | không PASS |

**SPEC_GAP / LOCK inventory:**
- **BACKLOG-HOLD (W3):** không Dev rewrite greenfield STT 351; product DONE = AC-DEC-DONE (T1 reopen)
- **OUT:** `/reports` mock backlog — UC/menu riêng (không gộp UC-27)
- Leave L2 = SPEC_GAP **khác** UC — không liên quan HRM-27

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Live `decisions` CRUD codes | `decisions.controller.ts` · TECHSPEC §16.5 #50 |
| FE menu/nút/role | `/decisions` live; `/reports` tách | `App.tsx` · `Decisions.tsx` · UF-HRM-MENU-05/16 |
| Mobile (nếu có) | N/A hoặc consumer phụ | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | AU đa CT / member vs main | ADR-HRM-RBAC-SCOPE-LADDER · BR-DEC-02 |

**Verdict code_readiness:** `PARTIAL` (live spine + density GWC; `uat_done` / AC-DEC-DONE vẫn false — W3 **BACKLOG-HOLD** rewrite).

---

## 8. Handoff

```
ack_status: PASS_TO_PM
uc_id: UC-HRM-27
stt_phase1: 351
cases_designed: 16
code_readiness: PARTIAL
uat_done: false
w3_verdict: BACKLOG-HOLD
squad: W1-S6-HRM-B-MOB
work_item_id: PO-UC-TC-W3-BA-HRM27
evidence_path: docs/qa/evidence/po-uc-tc-w3-ba-hrm27.md
```
