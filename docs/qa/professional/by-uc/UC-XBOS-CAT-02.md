# UC — `UC-XBOS-CAT-02` · Khởi chạy quy trình phê duyệt danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CAT-02` |
| **stt_phase1** | 368 |
| **mod** | M02 |
| **name_vi** | Khởi chạy quy trình phê duyệt danh mục |
| **actors** | Group CEO / catalog approver · Member requester (HR/CEO CT) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 368 · `docs/xbos/USECASE_TONG_THE_XBOS.md` · FR-XBOS-CAT-* |
| **srs_new** | `SRS_VN.md` § WF/catalog · `docs/xbos/TECHSPEC.md` FR-XBOS-CAT-02/05 |
| **tech_spec** | `TECHSPEC_HE` §7–8 · `docs/xbos/TECHSPEC.md` §5 M01-Catalog · catalog-governance |
| **api_contract** | `POST /api/xbos/catalog-governance/workflows/start` → **XBOS-CAT-211** |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | POST workflows/start → XBOS-CAT-211; TECHSPEC FR-XBOS-CAT-02 ALIGNED. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Từ extension/batch đã có (tạo từ FE), start WF phê duyệt catalog.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chọn batch chờ | Precond FE extension | Requester/Gov |
| CAP-02 | Start WF | Spawn instance+task | System/User |
| CAP-03 | Xác nhận inbox | Task xuất hiện | Người duyệt catalog gov (Group) |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-SELECT | Chọn batchId | UI select | N |
| CAP-02 | FN-START | Start catalog approval WF | POST workflows/start | Y |
| CAP-03 | FN-ASSERT-TASK | Assert task inbox | GET inbox | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-SELECT | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-START | 1 | 2 | 0 | 1 | 1 | 5 |
| FN-ASSERT-TASK | 1 | 0 | 0 | 1 | 1 | 3 |
| **Tổng** | 3 | 2 | 0 | 3 | 3 | **11** |

> **cases_designed (SoT §5 rows):** **14** (fn Σ thiết kế = 11; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CAT02-SEL-HP-001 | CAP-01 | FN-SELECT | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Extension FE xong | 1. Chọn batch | UI sẵn Start | UI | UF-15 |
| TC-CAT02-SEL-AU-001 | CAP-01 | FN-SELECT | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Batch CT khác | 1. Chọn | Không cho | UI/API | AU |
| TC-CAT02-SEL-UX-001 | CAP-01 | FN-SELECT | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Không batch | 1. Mở | Empty + hint FE create | UI | U65 |
| TC-CAT02-ST-HP-001 | CAP-02 | FN-START | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | batchId hợp lệ FE | 1. Start WF | 211; instance+task; F5 | UI/API | XBOS-CAT-211 |
| TC-CAT02-ST-FD-001 | CAP-02 | FN-START | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | batchId giả | 1. Start | 4xx | API | FD |
| TC-CAT02-ST-FD-002 | CAP-02 | FN-START | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Đã started | 1. Start lại | 4xx/BR idempotent | API | FD |
| TC-CAT02-ST-AU-001 | CAP-02 | FN-START | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Sai memberCompanyId | 1. Start | 403/409 | API | AU |
| TC-CAT02-ST-UX-001 | CAP-02 | FN-START | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | After start | 1. UI | Pending state; disable Start | UI | UX |
| TC-CAT02-AS-HP-001 | CAP-03 | FN-ASSERT-TASK | HP | P0 | Người duyệt catalog gov (Group) | Sau start FE | 1. GET inbox | 212; thấy task | UI/API | XBOS-CAT-212 |
| TC-CAT02-AS-AU-001 | CAP-03 | FN-ASSERT-TASK | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member inbox | 1. List | Không thấy task CT khác | API | AU |
| TC-CAT02-AS-UX-001 | CAP-03 | FN-ASSERT-TASK | UX | P1 | Người duyệt catalog gov (Group) | Trước start | 1. Inbox | Empty OK | UI | U65 |
| TC-CAT02-ST-HP-002 | CAP-02 | FN-START | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | HDSD | 1. Đúng nút khởi chạy | U76 align | UI | U76 |
| TC-CAT02-SEL-HP-002 | CAP-01 | FN-SELECT | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Multi batch | 1. Chọn đúng batch | Payload batchId khớp | UI/API | HP |
| TC-CAT02-ST-AU-002 | CAP-02 | FN-START | AU | P0 | anonymous | — | 1. POST start | 401 | API | AU |

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
| BE API/DTO | startCatalogApprovalWorkflow | apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.ts |
| FE menu/nút/role | Start từ gov panel / after apply | CatalogGovernancePanel · CommandCenterInbox · groupHrCatalogApi |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | Group read main→holding; write scope match; member start với memberCompanyId | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CAT-02
cases_designed: 14
code_readiness: LIKELY_IMPL
uat_done: false
```
