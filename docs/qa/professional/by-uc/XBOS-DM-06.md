# UC — `XBOS-DM-06` · Sắp xếp phân cấp cha–con

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-06` |
| **stt_phase1** | 82 |
| **mod** | M01 |
| **name_vi** | Sắp xếp phân cấp cha–con |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 82 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 82 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | Pattern catalog items parentId · OpenAPI xbos-api M01 |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | Hierarchy domain-dependent; CC flat catalogs có thể không có cha–con. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Sắp xếp phân cấp cha–con» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Gán/đổi parent và thứ tự hiển thị cây danh mục.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Sắp xếp phân cấp cha–con | Gán/đổi parent và thứ tự hiển thị cây danh mục. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-SET-PARENT | Gán giá trị cha | Picker parent | Y |
| CAP-02 | FN-REORDER | Đổi thứ tự anh–em | sort_order / drag | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-SET-PARENT | 1 | 1 | 1 | 1 | 0 | 4 |
| FN-REORDER | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 4 | 2 | 1 | 3 | 3 | **13** |

> **cases_designed (SoT §5 rows):** **12** (fn Σ thiết kế = 13; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM06-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login | 1. Mở danh mục hierarchy | Thấy cây/cột cha | UI | #82 |
| TC-DM06-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Mở | Scope hạn chế | UI/API | ADR |
| TC-DM06-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Empty | 1. Mở | Empty OK | UI | U65 |
| TC-DM06-PAR-HP-001 | CAP-02 | FN-SET-PARENT | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | ≥2 giá trị FE | 1. Gán con dưới cha 2. Lưu | 2xx; F5 đúng parent | UI/API | DM-06 |
| TC-DM06-PAR-FD-001 | CAP-02 | FN-SET-PARENT | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Có node | 1. Gán parent=self / cycle | 4xx; cây không vỡ | UI/API | BR hierarchy |
| TC-DM06-PAR-BD-001 | CAP-02 | FN-SET-PARENT | BD | P1 | ceo@xe.vn (Group CEO / main→holding) | Root | 1. Clear parent | 2xx root | UI/API | BD |
| TC-DM06-PAR-AU-001 | CAP-02 | FN-SET-PARENT | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Sai CT | 1. Đổi parent ngoài scope | 403/409 | API | AU |
| TC-DM06-ORD-HP-001 | CAP-02 | FN-REORDER | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | ≥2 siblings | 1. Đổi sort 2. Lưu | F5 thứ tự mới | UI/API | sort_order |
| TC-DM06-ORD-FD-001 | CAP-02 | FN-REORDER | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Version khóa | 1. Reorder | 4xx hoặc disabled | UI/API | version lock |
| TC-DM06-ORD-AU-001 | CAP-02 | FN-REORDER | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Reorder master | 403/409 | API | AU |
| TC-DM06-ORD-UX-001 | CAP-02 | FN-REORDER | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Dragging | 1. Preview | UI ổn định | UI | UX |
| TC-DM06-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Đã sắp | 1. F5 | Cây ổn định | UI | AC |

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
| BE API/DTO | PATCH parent_id / sort_order khi API hỗ trợ | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | Tree UI nếu có — không bịa drag trên màn flat | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-06
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
```
