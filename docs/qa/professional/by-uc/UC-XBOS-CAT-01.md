# UC — `UC-XBOS-CAT-01` · Xem yêu cầu mở rộng danh mục HRM đang chờ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CAT-01` |
| **stt_phase1** | 367 |
| **mod** | M02 |
| **name_vi** | Xem yêu cầu mở rộng danh mục HRM đang chờ |
| **actors** | Group CEO / catalog approver · Member requester (HR/CEO CT) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 367 · `docs/xbos/USECASE_TONG_THE_XBOS.md` · FR-XBOS-CAT-* |
| **srs_new** | `SRS_VN.md` § WF/catalog · `docs/xbos/TECHSPEC.md` FR-XBOS-CAT-02/05 |
| **tech_spec** | `TECHSPEC_HE` §7–8 · `docs/xbos/TECHSPEC.md` §5 M01-Catalog · catalog-governance |
| **api_contract** | `GET /api/xbos/catalog-governance/extension-requests` → **XBOS-CAT-200** |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | GET extension-requests → XBOS-CAT-200; panel gov list. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Approver/Group xem danh sách extension requests pending trước khi start/duyệt.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Mở danh sách chờ | Thấy pending extensions | Người duyệt catalog gov (Group) |
| CAP-02 | Lọc/phạm vi | Đúng tenant | Người duyệt catalog gov (Group) |
| CAP-03 | Empty/error | U65 empty OK | Người duyệt catalog gov (Group) |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-LIST-EXT | List pending extension requests | GET extension-requests | N |
| CAP-02 | FN-SCOPE | Scope tenant filter | query tenantId | N |
| CAP-03 | FN-EMPTY | Empty & error states | UI | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LIST-EXT | 2 | 1 | 0 | 2 | 1 | 6 |
| FN-SCOPE | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-EMPTY | 1 | 1 | 0 | 0 | 1 | 3 |
| **Tổng** | 4 | 3 | 0 | 3 | 2 | **12** |

> **cases_designed (SoT §5 rows):** **12** (fn Σ thiết kế = 12; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CAT01-LIST-HP-001 | CAP-01 | FN-LIST-EXT | HP | P0 | Người duyệt catalog gov (Group) | Request từ FE (UF-15) | 1. Mở panel / GET list | 200 XBOS-CAT-200; thấy batch | UI/API | UC-XBOS-CAT-01 |
| TC-CAT01-LIST-HP-002 | CAP-01 | FN-LIST-EXT | HP | P0 | Người duyệt catalog gov (Group) | Request pending | 1. Click row | Highlight two-pane | UI | two-pane |
| TC-CAT01-LIST-FD-001 | CAP-01 | FN-LIST-EXT | FD | P0 | Người duyệt catalog gov (Group) | API down | 1. Mở | Banner — không mock | UI | FD |
| TC-CAT01-LIST-AU-001 | CAP-01 | FN-LIST-EXT | AU | P0 | anonymous | — | 1. GET | 401 XBOS-AUTH-001 | API | AU |
| TC-CAT01-LIST-AU-002 | CAP-01 | FN-LIST-EXT | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member CEO | 1. List | Không thấy request CT khác | UI/API | AU |
| TC-CAT01-LIST-UX-001 | CAP-01 | FN-LIST-EXT | UX | P1 | Người duyệt catalog gov (Group) | Loading | 1. Mở | Loading rồi list | UI | UX |
| TC-CAT01-SCP-HP-001 | CAP-02 | FN-SCOPE | HP | P0 | Người duyệt catalog gov (Group) | Multi request | 1. Filter tenant | Đúng tập | API | scope |
| TC-CAT01-SCP-FD-001 | CAP-02 | FN-SCOPE | FD | P0 | Người duyệt catalog gov (Group) | tenantId rác | 1. GET | 4xx hoặc empty deterministic | API | FD |
| TC-CAT01-SCP-AU-001 | CAP-02 | FN-SCOPE | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. List all-tenant | Chỉ phạm vi cho phép | API | AU |
| TC-CAT01-EMP-HP-001 | CAP-03 | FN-EMPTY | HP | P0 | Người duyệt catalog gov (Group) | Chưa có request FE | 1. Mở | Empty — không seed | UI | U65 |
| TC-CAT01-EMP-FD-001 | CAP-03 | FN-EMPTY | FD | P1 | Người duyệt catalog gov (Group) | 403 role | 1. Wrong role | Message quyền | UI | FD |
| TC-CAT01-EMP-UX-001 | CAP-03 | FN-EMPTY | UX | P1 | Người duyệt catalog gov (Group) | — | 1. Hint HDSD | Copy tạo từ company_group_hr | UI | U76 |

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
| BE API/DTO | listPendingExtensionRequests | apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.ts |
| FE menu/nút/role | hrm_catalog_governance / pending list | CatalogGovernancePanel · CommandCenterInbox · groupHrCatalogApi |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | Group read main→holding; write scope match; member start với memberCompanyId | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CAT-01
cases_designed: 12
code_readiness: LIKELY_IMPL
uat_done: false
```
