# UC — `UC-XBOS-CAT-04` · Xem chi tiết phiên duyệt danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CAT-04` |
| **stt_phase1** | 370 |
| **mod** | M02 |
| **name_vi** | Xem chi tiết phiên duyệt danh mục |
| **actors** | Group CEO / catalog approver · Member requester (HR/CEO CT) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 370 · `docs/xbos/USECASE_TONG_THE_XBOS.md` · FR-XBOS-CAT-* |
| **srs_new** | `SRS_VN.md` § WF/catalog · `docs/xbos/TECHSPEC.md` FR-XBOS-CAT-02/05 |
| **tech_spec** | `TECHSPEC_HE` §7–8 · `docs/xbos/TECHSPEC.md` §5 M01-Catalog · catalog-governance |
| **api_contract** | `GET /api/xbos/catalog-governance/instances/:instanceId` → **XBOS-CAT-213** |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | GET instances/:instanceId → XBOS-CAT-213. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Mở chi tiết instance/task để xem items và trạng thái trước khi duyệt.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Mở chi tiết instance | Xem payload duyệt | Người duyệt catalog gov (Group) |
| CAP-02 | Scope/id validity | 404/403 đúng | Hệ thống |
| CAP-03 | UI states | loading/fail | Người duyệt catalog gov (Group) |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-DETAIL | GET approval detail | GET instances/:id | N |
| CAP-02 | FN-ID-GUARD | Validate instanceId/scope | API | N |
| CAP-03 | FN-DETAIL-UX | Loading/error detail | UI | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-DETAIL | 2 | 0 | 0 | 1 | 1 | 4 |
| FN-ID-GUARD | 0 | 2 | 0 | 1 | 0 | 3 |
| FN-DETAIL-UX | 1 | 1 | 0 | 0 | 1 | 3 |
| **Tổng** | 3 | 3 | 0 | 2 | 2 | **10** |

> **cases_designed (SoT §5 rows):** **12** (fn Σ thiết kế = 10; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CAT04-DET-HP-001 | CAP-01 | FN-DETAIL | HP | P0 | Người duyệt catalog gov (Group) | Instance từ FE | 1. Mở chi tiết | 213; thấy items/status | UI/API | UC-XBOS-CAT-04 |
| TC-CAT04-DET-HP-002 | CAP-01 | FN-DETAIL | HP | P0 | Người duyệt catalog gov (Group) | Có items | 1. Đọc field đề nghị | Đủ mã/label/CT | UI | HP |
| TC-CAT04-DET-AU-001 | CAP-01 | FN-DETAIL | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Instance holding | 1. GET | 403/404 scope | API | AU |
| TC-CAT04-DET-UX-001 | CAP-01 | FN-DETAIL | UX | P1 | Người duyệt catalog gov (Group) | Loading | 1. Mở | Loading rồi content | UI | UX |
| TC-CAT04-ID-FD-001 | CAP-02 | FN-ID-GUARD | FD | P0 | Người duyệt catalog gov (Group) | id giả | 1. GET | 404 | API | FD |
| TC-CAT04-ID-FD-002 | CAP-02 | FN-ID-GUARD | FD | P0 | Người duyệt catalog gov (Group) | id malformed | 1. GET | 400/404 | API | FD |
| TC-CAT04-ID-AU-001 | CAP-02 | FN-ID-GUARD | AU | P0 | anonymous | — | 1. GET | 401 | API | AU |
| TC-CAT04-UX-HP-001 | CAP-03 | FN-DETAIL-UX | HP | P0 | Người duyệt catalog gov (Group) | OK detail | 1. Quan sát actions | Nút Duyệt/Từ chối đúng state | UI | SM |
| TC-CAT04-UX-FD-001 | CAP-03 | FN-DETAIL-UX | FD | P0 | Người duyệt catalog gov (Group) | GET fail | 1. Mở | Fail state + retry | UI | FD |
| TC-CAT04-UX-UX-001 | CAP-03 | FN-DETAIL-UX | UX | P1 | Người duyệt catalog gov (Group) | Terminal instance | 1. Mở approved | Actions locked | UI | UX |
| TC-CAT04-DET-HP-003 | CAP-01 | FN-DETAIL | HP | P1 | Người duyệt catalog gov (Group) | Deep link instanceId | 1. Open URL | Đúng detail — L2.5 | UI | J-XBOS-02 |
| TC-CAT04-DET-AU-002 | CAP-01 | FN-DETAIL | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Wrong company query | 1. GET | 403/409 | API | AU |

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
| BE API/DTO | getApprovalDetail | apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.ts |
| FE menu/nút/role | Detail pane / drawer | CatalogGovernancePanel · CommandCenterInbox · groupHrCatalogApi |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | Group read main→holding; write scope match; member start với memberCompanyId | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CAT-04
cases_designed: 12
code_readiness: LIKELY_IMPL
uat_done: false
```
