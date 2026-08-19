# UC — `XBOS-DM-17` · Phát hành phiên bản danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-17` |
| **stt_phase1** | 93 |
| **mod** | M01 |
| **name_vi** | Phát hành phiên bản danh mục |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 93 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 93 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | `POST /api/xbos/catalog-governance/publish` → **XBOS-CFG-203** |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | POST catalog-governance/publish → config-sync XBOS-CFG-203. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Phát hành phiên bản danh mục» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Publish version để phân hệ pull cấu hình mới.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Phát hành phiên bản danh mục | Publish version để phân hệ pull cấu hình mới. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-PUBLISH | Phát hành phiên bản | POST catalog-governance/publish | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-PUBLISH | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 3 | 1 | 0 | 2 | 3 | **9** |

> **cases_designed (SoT §5 rows):** **14** (fn Σ thiết kế = 9; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM17-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Draft items FE | 1. Mở publish | Form version/name | UI | #93 · §8.1 |
| TC-DM17-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Publish holding | 403/409 | API | AU |
| TC-DM17-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | — | 1. Mở | Hint version | UI | UX |
| TC-DM17-PUB-HP-001 | CAP-02 | FN-PUBLISH | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Items hợp lệ FE | 1. Publish | 203; version↑; F5 | UI/API | XBOS-CFG-203 |
| TC-DM17-PUB-FD-001 | CAP-02 | FN-PUBLISH | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Thiếu name/items | 1. Publish | 4xx | API | FD |
| TC-DM17-PUB-AU-001 | CAP-02 | FN-PUBLISH | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Sai company | 1. Publish | 403/409 | API | AU |
| TC-DM17-PUB-UX-001 | CAP-02 | FN-PUBLISH | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | After | 1. Banner | Version hiển thị | UI | UX |
| TC-DM17-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Published | 1. Pull HRM/module | Version mới | UI/API | §8.2 |
| TC-DM17-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Publish fail | 1. 500 | Error; draft giữ | UI | UX |
| TC-DM17-PUB-FD-002 | CAP-02 | FN-PUBLISH | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Empty items | 1. Publish | 4xx | API | FD |
| TC-DM17-PUB-HP-002 | CAP-02 | FN-PUBLISH | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | catalogKey job_titles | 1. Publish | 203 đúng key | API | HP |
| TC-DM17-OPEN-AU-002 | CAP-01 | FN-OPEN | AU | P0 | anonymous | — | 1. POST publish | 401 | API | AU |
| TC-DM17-VER-HP-002 | CAP-03 | FN-VERIFY | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Sau publish | 1. History | Event phát hành | UI | DM-14 |
| TC-DM17-PUB-UX-002 | CAP-02 | FN-PUBLISH | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Double publish | 1. Click 2 lần | Idempotent/BR rõ | UI/API | UX |

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
| BE API/DTO | publishCatalog | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | Nút Phát hành / publish dialog | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-17
cases_designed: 14
code_readiness: LIKELY_IMPL
uat_done: false
```
