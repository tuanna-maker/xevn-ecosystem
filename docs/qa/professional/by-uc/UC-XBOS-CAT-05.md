# UC — `UC-XBOS-CAT-05` · Phê duyệt bước duyệt danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CAT-05` |
| **stt_phase1** | 371 |
| **mod** | M02 |
| **name_vi** | Phê duyệt bước duyệt danh mục |
| **actors** | Group CEO / catalog approver · Member requester (HR/CEO CT) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 371 · `docs/xbos/USECASE_TONG_THE_XBOS.md` · FR-XBOS-CAT-* |
| **srs_new** | `SRS_VN.md` § WF/catalog · `docs/xbos/TECHSPEC.md` FR-XBOS-CAT-02/05 |
| **tech_spec** | `TECHSPEC_HE` §7–8 · `docs/xbos/TECHSPEC.md` §5 M01-Catalog · catalog-governance |
| **api_contract** | `POST /api/xbos/catalog-governance/tasks/:taskId/approve` → **XBOS-CAT-201** |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | POST tasks/:taskId/approve → XBOS-CAT-201; FR-XBOS-CAT-05 ALIGNED. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Approver phê duyệt bước → extension áp dụng; FE sau 2xx + F5.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Mở task actionable | Precond FE chain | Người duyệt catalog gov (Group) |
| CAP-02 | Phê duyệt | Approve step | Người duyệt catalog gov (Group) |
| CAP-03 | Hậu duyệt | Consumer + inbox | HRM/XBOS |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN-TASK | Mở task pending | Inbox/detail | N |
| CAP-02 | FN-APPROVE | Approve catalog task | POST approve | Y |
| CAP-03 | FN-POST | Verify apply + outbox | FE F5 / consumer | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN-TASK | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-APPROVE | 2 | 2 | 0 | 1 | 1 | 6 |
| FN-POST | 2 | 0 | 0 | 1 | 1 | 4 |
| **Tổng** | 5 | 2 | 0 | 3 | 3 | **13** |

> **cases_designed (SoT §5 rows):** **16** (fn Σ thiết kế = 13; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CAT05-OP-HP-001 | CAP-01 | FN-OPEN-TASK | HP | P0 | Người duyệt catalog gov (Group) | Task FE start | 1. Mở task | Actionable Duyệt | UI | UF-09 |
| TC-CAT05-OP-AU-001 | CAP-01 | FN-OPEN-TASK | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Không assignee | 1. Mở | Ẩn/403 | UI/API | AU |
| TC-CAT05-OP-UX-001 | CAP-01 | FN-OPEN-TASK | UX | P1 | Người duyệt catalog gov (Group) | Empty | 1. Inbox | Empty — không seed | UI | U65 |
| TC-CAT05-AP-HP-001 | CAP-02 | FN-APPROVE | HP | P0 | Người duyệt catalog gov (Group) | Pending | 1. Confirm Phê duyệt | 201; F5 outbox | UI/API | XBOS-CAT-201 |
| TC-CAT05-AP-HP-002 | CAP-02 | FN-APPROVE | HP | P0 | Người duyệt catalog gov (Group) | Có review_note | 1. Approve + note | 201; note lưu | UI/API | HP |
| TC-CAT05-AP-FD-001 | CAP-02 | FN-APPROVE | FD | P0 | Người duyệt catalog gov (Group) | Đã approved | 1. Approve lại | 4xx | API | FD |
| TC-CAT05-AP-FD-002 | CAP-02 | FN-APPROVE | FD | P0 | Người duyệt catalog gov (Group) | taskId giả | 1. Approve | 404 | API | FD |
| TC-CAT05-AP-AU-001 | CAP-02 | FN-APPROVE | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member approve | 1. POST | 403/409 | API | AU |
| TC-CAT05-AP-UX-001 | CAP-02 | FN-APPROVE | UX | P1 | Người duyệt catalog gov (Group) | Dialog | 1. Cancel | Không API | UI | UX |
| TC-CAT05-POST-HP-001 | CAP-03 | FN-POST | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Sau 201 | 1. HRM settings consumer | Field/item áp dụng | UI/API | UF-15 |
| TC-CAT05-POST-HP-002 | CAP-03 | FN-POST | HP | P0 | Người duyệt catalog gov (Group) | Sau 201 | 1. Inbox F5 | Task không còn pending | UI | AC |
| TC-CAT05-POST-AU-001 | CAP-03 | FN-POST | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | CT không gán | 1. Consumer | Không thấy item | UI | DM-08 |
| TC-CAT05-POST-UX-001 | CAP-03 | FN-POST | UX | P1 | Người duyệt catalog gov (Group) | Success toast | 1. Quan sát | Toast + dialog đóng | UI | UX |
| TC-CAT05-AP-AU-002 | CAP-02 | FN-APPROVE | AU | P0 | anonymous | — | 1. POST | 401 | API | AU |
| TC-CAT05-OP-HP-002 | CAP-01 | FN-OPEN-TASK | HP | P1 | Người duyệt catalog gov (Group) | HDSD | 1. Đúng nút Phê duyệt | U76 | UI | U76 |
| TC-CAT05-AP-HP-003 | CAP-02 | FN-APPROVE | HP | P1 | Người duyệt catalog gov (Group) | main→holding | 1. Approve với JWT main | 201 scope ADR | API | ADR C2 |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | Y |  |
| Auth/scope nếu đa CT | Y | Y | |
| SPEC_GAP ghi rõ | Y | — | |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | actOnTask approve | apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.ts |
| FE menu/nút/role | POP-CAT-APPROVE · Phê duyệt | CatalogGovernancePanel · CommandCenterInbox · groupHrCatalogApi |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | Group read main→holding; write scope match; member start với memberCompanyId | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CAT-05
cases_designed: 16
code_readiness: LIKELY_IMPL
uat_done: false
```
