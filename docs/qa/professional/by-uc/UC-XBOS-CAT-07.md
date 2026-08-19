# UC — `UC-XBOS-CAT-07` · Khởi tạo quy trình duyệt danh mục mẫu (theo công ty)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CAT-07` |
| **stt_phase1** | 373 |
| **mod** | M02 |
| **name_vi** | Khởi tạo quy trình duyệt danh mục mẫu (theo công ty) |
| **actors** | Group CEO / catalog approver · Member requester (HR/CEO CT) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 373 · `docs/xbos/USECASE_TONG_THE_XBOS.md` · FR-XBOS-CAT-* |
| **srs_new** | `SRS_VN.md` § WF/catalog · `docs/xbos/TECHSPEC.md` FR-XBOS-CAT-02/05 |
| **tech_spec** | `TECHSPEC_HE` §7–8 · `docs/xbos/TECHSPEC.md` §5 M01-Catalog · catalog-governance |
| **api_contract** | `POST …/catalog-governance/workflows/seed-xe-du-lich-catalog` → **XBOS-CAT-210** (ops) · FE WF designer preset tương đương |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | POST workflows/seed-xe-du-lich-catalog → XBOS-CAT-210 tồn tại — **U65: không dùng seed làm evidence UAT**; case design kiểm soát quyền + FE preset tương đương. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo WF definition mẫu catalog approval tồn tại theo công ty (vd. X.E Du lịch) trước khi chạy duyệt.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị WF định nghĩa | Có def theo CT | Admin/Gov |
| CAP-02 | Khởi tạo mẫu | Ensure workflow def | Admin |
| CAP-03 | Sẵn sàng start | CAT-02 chạy được | System |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-CHECK-DEF | Kiểm tra WF def tồn tại | GET workflow defs | N |
| CAP-02 | FN-ENSURE | Tạo/ensure WF mẫu từ FE (ưu tiên) hoặc ops endpoint | FE designer / seed endpoint | Y |
| CAP-03 | FN-READY | Verify có thể start CAT-02 | UI/API | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CHECK-DEF | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-ENSURE | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-READY | 1 | 0 | 0 | 1 | 1 | 3 |
| **Tổng** | 3 | 1 | 0 | 3 | 3 | **10** |

> **cases_designed (SoT §5 rows):** **14** (fn Σ thiết kế = 10; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CAT07-CHK-HP-001 | CAP-01 | FN-CHECK-DEF | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login | 1. Mở WF list / API defs | Thấy hoặc thiếu rõ ràng | UI/API | UC-XBOS-CAT-07 |
| TC-CAT07-CHK-AU-001 | CAP-01 | FN-CHECK-DEF | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. List holding defs | Scope hạn chế | API | AU |
| TC-CAT07-CHK-UX-001 | CAP-01 | FN-CHECK-DEF | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Empty defs | 1. Mở | Empty + CTA tạo | UI | U65 |
| TC-CAT07-ENS-HP-001 | CAP-02 | FN-ENSURE | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Thiếu def | 1. Tạo WF từ FE designer (preset catalog) theo HDSD | 201/2xx; def tồn tại; F5 — **không** dùng seed làm UAT evidence | UI/API | U65 · Primary CAT-DL neo |
| TC-CAT07-ENS-FD-001 | CAP-02 | FN-ENSURE | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Payload invalid | 1. Lưu def thiếu bước | 4xx | UI/API | FD |
| TC-CAT07-ENS-AU-001 | CAP-02 | FN-ENSURE | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member seed/holding | 1. POST seed-xe-du-lich | 403/409 nếu không quyền | API | AU |
| TC-CAT07-ENS-UX-001 | CAP-02 | FN-ENSURE | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | After create | 1. List WF | Def hiển thị tên CT | UI | UX |
| TC-CAT07-RDY-HP-001 | CAP-03 | FN-READY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Def sẵn + extension FE | 1. Start CAT-02 | 211 OK | UI/API | CAT-02 chain |
| TC-CAT07-RDY-AU-001 | CAP-03 | FN-READY | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Def CT khác | 1. Start | 403/409 | API | AU |
| TC-CAT07-RDY-UX-001 | CAP-03 | FN-READY | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Def inactive | 1. Start | Message def không active | UI | UX |
| TC-CAT07-ENS-HP-002 | CAP-02 | FN-ENSURE | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Idempotent | 1. Ensure lần 2 | 200/210 không nhân bản lỗi | API | XBOS-CAT-210 ops-only note |
| TC-CAT07-CHK-HP-002 | CAP-01 | FN-CHECK-DEF | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Theo công ty DL | 1. Filter company | Đúng def xe_du_lich | UI/API | company-scoped |
| TC-CAT07-ENS-AU-002 | CAP-02 | FN-ENSURE | AU | P0 | anonymous | — | 1. POST | 401 | API | AU |
| TC-CAT07-RDY-HP-002 | CAP-03 | FN-READY | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | HDSD | 1. Menu WF → tạo mẫu | U76 path | UI | U76 |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | Y |  |
| Auth/scope nếu đa CT | Y | Y | |
| SPEC_GAP ghi rõ | Y | Seed endpoint là ops — UAT chỉ chấp nhận tạo def từ FE | |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | ensureXeDuLichCatalogWorkflow | apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.ts |
| FE menu/nút/role | WF designer tạo/preset wf_hrm_catalog_extension_* từ UI | CatalogGovernancePanel · CommandCenterInbox · groupHrCatalogApi |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | Group read main→holding; write scope match; member start với memberCompanyId | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CAT-07
cases_designed: 14
code_readiness: LIKELY_PARTIAL
uat_done: false
```
