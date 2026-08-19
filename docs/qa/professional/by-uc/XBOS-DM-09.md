# UC — `XBOS-DM-09` · Sao chép bộ danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-09` |
| **stt_phase1** | 85 |
| **mod** | M01 |
| **name_vi** | Sao chép bộ danh mục |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 85 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 85 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | `POST /api/xbos/config-sync/catalog/{catalogKey}/clone` · `XBOS-CFG-206` / `XBOS-CFG-409` · OpenAPI `configSyncCloneCatalog` · bundle twin `POST …/catalogs/clone-bundle` (`XBOS-CFG-205`) |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT · BE PO-UC-TC-W3-BE-DM09 · QA PO-UC-TC-W3-QA-DM09 · R2 PO-UC-TC-W3-QA-DM09-R2 |
| **design_status** | DESIGNED |
| **execution** | API_PASS · UI_PASS (browser R2 2026-08-04) |
| **code_readiness** | LIKELY_READY |
| **code_note** | **API (U65):** HP `XBOS-CFG-206` · FD `XBOS-CFG-409` · AU `XBOS-AUTH-003` · self `XBOS-VAL-013` — `po-uc-tc-w3-qa-dm09.md`. **FE wire:** `CloneCatalogPanel` + `POST …/catalog/{key}/clone` — FE evidence `po-uc-tc-w3-fe-dm09.md`. **Browser R2:** HDSD Cài đặt → Sao chép bộ danh mục · HP `shifts` **201** `XBOS-CFG-206` + toast/result + dest verify · FD **409** `XBOS-CFG-409` on UI · AU `du-lich.ceo` menu hidden + deep-link blocked — `po-uc-tc-w3-qa-dm09-r2.md`. **must_keep:** Apply = DM-HRM-07 ≠ DM-09. `uat_done: false`. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Sao chép bộ danh mục» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Nhân bản bộ giá trị sang nhóm/CT/domain đích.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Sao chép bộ danh mục | Nhân bản bộ giá trị sang nhóm/CT/domain đích. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-COPY | Sao chép bộ danh mục | Action Sao chép · POST clone | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-COPY | 1 | 1 | 1 | 1 | 1 | 5 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 3 | 1 | 1 | 2 | 3 | **10** |

> **cases_designed (SoT §5 rows):** **10** (fn Σ thiết kế = 10; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM09-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login | 1. Mở nguồn | Thấy Sao chép hoặc ghi GAP UI | UI | #85 |
| TC-DM09-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Copy master | 403/ẩn nút | UI/API | AU |
| TC-DM09-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Empty source | 1. Copy rỗng | Chặn | UI | UX |
| TC-DM09-CPY-HP-001 | CAP-02 | FN-COPY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Source có rows FE | 1. Copy sang đích | 2xx `XBOS-CFG-206`; F5 bản sao | UI/API | DM-09 |
| TC-DM09-CPY-FD-001 | CAP-02 | FN-COPY | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Dest trùng mã | 1. Copy đè | `XBOS-CFG-409` | API | FD |
| TC-DM09-CPY-BD-001 | CAP-02 | FN-COPY | BD | P1 | ceo@xe.vn (Group CEO / main→holding) | 1 row | 1. Copy | OK biên nhỏ | API | BD |
| TC-DM09-CPY-AU-001 | CAP-02 | FN-COPY | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Sai CT đích | 1. Copy | `XBOS-AUTH-003` / 403 | API | AU |
| TC-DM09-CPY-UX-001 | CAP-02 | FN-COPY | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Progress | 1. Copy bộ lớn | Progress; chống double-click | UI | UX |
| TC-DM09-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Đã copy | 1. Sửa source | Dest độc lập | UI | AC |
| TC-DM09-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | FE GAP | 1. Quan sát | Nếu FE chưa wire clone → BLOCKED UI — không PASS giả | — | FE residual |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | Y | API + browser R2 PASS (HP CFG-206 / FD CFG-409) |
| Auth/scope nếu đa CT | Y | Y | Member API AUTH-003 · browser menu hidden + AU blocked |
| SPEC_GAP ghi rõ | Y | Closed for single-key clone API + FE wire | R-DM09-FE-WIRE closed by FE+QA-R2; residual UX P2 only |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | `POST …/catalog/:key/clone` · DTO `CloneCatalogDto` · service `cloneCatalog` | `apps/api/xbos-api/src/config-sync/config-sync.{controller,service}.ts` · `dto/clone-catalog.dto.ts` |
| FE menu/nút/role | **WIRED** — `CloneCatalogPanel` · menu `hrm_catalog_clone` · Group CEO only | `po-uc-tc-w3-fe-dm09.md` · R2 browser |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | API AUTH-003 · browser AU menu hidden + deep-link blocked | qa-dm09 + qa-dm09-r2 |

**Verdict code_readiness:** LIKELY_READY (BE 🟢 · FE wire 🟢 · browser R2 🟢 · uat_done false)

### Dev8088 / execution notes (QA 2026-08-04 · R2)

| Layer | Status | Note |
|-------|--------|------|
| API P0 CPY-HP/FD/AU | 🟢 | CFG-206 / CFG-409 / AUTH-003 (+ VAL-013) |
| Browser FE clone U65 | 🟢 | R2: HDSD → `shifts` 201 CFG-206 · FD CFG-409 · AU hide — `po-uc-tc-w3-qa-dm09-r2.md` |
| must_keep Apply ≠ DM-09 | 🟢 | Clone panel path only; Apply = DM-HRM-07 |
| UAT / Phase1 | ❌ not claimed | `uat_done: false` |

---

## 8. Handoff

```
ack_status: PASS_TO_PM
uc_id: XBOS-DM-09
cases_designed: 10
code_readiness: LIKELY_READY
execution: API_PASS · UI_PASS
uat_done: false
evidence_path: docs/qa/evidence/po-uc-tc-w3-qa-dm09-r2.md
work_item_id: PO-UC-TC-W3-QA-DM09-R2
next_owner: pm
```
