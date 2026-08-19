# UC — `UC-XBOS-CAT-03` · Xem hộp thư duyệt danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CAT-03` |
| **stt_phase1** | 369 |
| **mod** | M02 |
| **name_vi** | Xem hộp thư duyệt danh mục |
| **actors** | Group CEO / catalog approver · Member requester (HR/CEO CT) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 369 · `docs/xbos/USECASE_TONG_THE_XBOS.md` · FR-XBOS-CAT-* |
| **srs_new** | `SRS_VN.md` § WF/catalog · `docs/xbos/TECHSPEC.md` FR-XBOS-CAT-02/05 |
| **tech_spec** | `TECHSPEC_HE` §7–8 · `docs/xbos/TECHSPEC.md` §5 M01-Catalog · catalog-governance |
| **api_contract** | `GET /api/xbos/catalog-governance/inbox` → **XBOS-CAT-212** |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | GET inbox → XBOS-CAT-212; FE CatalogGovernancePanel / CC inbox. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Approver xem inbox các task phê duyệt danh mục đang chờ.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Mở inbox catalog | List tasks | Người duyệt catalog gov (Group) |
| CAP-02 | Phạm vi assignee | Chỉ task được gán | Người duyệt catalog gov (Group) |
| CAP-03 | Empty/loading | U65 | Người duyệt catalog gov (Group) |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-INBOX | List catalog approval inbox | GET inbox | N |
| CAP-02 | FN-ASSIGNEE | Filter assigneeUserId | query/header | N |
| CAP-03 | FN-STATE | Empty/loading/error | UI | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-INBOX | 2 | 1 | 0 | 1 | 1 | 5 |
| FN-ASSIGNEE | 1 | 0 | 0 | 1 | 0 | 2 |
| FN-STATE | 1 | 1 | 0 | 0 | 1 | 3 |
| **Tổng** | 4 | 2 | 0 | 2 | 2 | **10** |

> **cases_designed (SoT §5 rows):** **12** (fn Σ thiết kế = 10; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CAT03-INB-HP-001 | CAP-01 | FN-INBOX | HP | P0 | Người duyệt catalog gov (Group) | Task từ FE start | 1. Mở inbox catalog | 212; thấy thẻ | UI/API | UC-XBOS-CAT-03 |
| TC-CAT03-INB-HP-002 | CAP-01 | FN-INBOX | HP | P0 | Người duyệt catalog gov (Group) | Có task | 1. Đọc title/priority | display-ready; vi-VN due | UI | BE-INBOX |
| TC-CAT03-INB-FD-001 | CAP-01 | FN-INBOX | FD | P0 | Người duyệt catalog gov (Group) | API 500 | 1. Mở | Banner lỗi | UI | FD |
| TC-CAT03-INB-AU-001 | CAP-01 | FN-INBOX | AU | P0 | anonymous | — | 1. GET | 401 | API | AU |
| TC-CAT03-INB-UX-001 | CAP-01 | FN-INBOX | UX | P1 | Người duyệt catalog gov (Group) | Loading | 1. Mở | Loading state | UI | UX |
| TC-CAT03-ASG-HP-001 | CAP-02 | FN-ASSIGNEE | HP | P0 | Người duyệt catalog gov (Group) | Multi assignee | 1. Filter user | Đúng tasks | API | assignee |
| TC-CAT03-ASG-AU-001 | CAP-02 | FN-ASSIGNEE | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Inbox group | Không thấy task holding nếu không quyền | UI/API | AU |
| TC-CAT03-ST-HP-001 | CAP-03 | FN-STATE | HP | P0 | Người duyệt catalog gov (Group) | Chưa có task FE | 1. Mở | Empty U65 | UI | U65 |
| TC-CAT03-ST-FD-001 | CAP-03 | FN-STATE | FD | P1 | Người duyệt catalog gov (Group) | non-master blocked UI | 1. Mở từ member shell | Blocked message nếu BR | UI | XBOS-INBOX-CAT |
| TC-CAT03-ST-UX-001 | CAP-03 | FN-STATE | UX | P1 | Người duyệt catalog gov (Group) | — | 1. Hint HDSD | U76 copy | UI | U76 |
| TC-CAT03-INB-HP-003 | CAP-01 | FN-INBOX | HP | P1 | Người duyệt catalog gov (Group) | Deep link settings | 1. ?settings=hrm_catalog_governance | Đúng panel | UI | route |
| TC-CAT03-ASG-HP-002 | CAP-02 | FN-ASSIGNEE | HP | P1 | Người duyệt catalog gov (Group) | Header x-user-id | 1. GET | Default assignee hợp lệ | API | HP |

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
| BE API/DTO | listApprovalInbox | apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.ts |
| FE menu/nút/role | SCR-CAT-GOV / inbox rail | CatalogGovernancePanel · CommandCenterInbox · groupHrCatalogApi |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | Group read main→holding; write scope match; member start với memberCompanyId | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CAT-03
cases_designed: 12
code_readiness: LIKELY_IMPL
uat_done: false
```
