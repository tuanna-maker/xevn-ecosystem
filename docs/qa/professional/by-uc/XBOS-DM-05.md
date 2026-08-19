# UC — `XBOS-DM-05` · Ngừng hoặc kích hoạt giá trị

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-05` |
| **stt_phase1** | 81 |
| **mod** | M01 |
| **name_vi** | Ngừng hoặc kích hoạt giá trị |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 81 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 81 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | GET/PUT `/api/xbos/business-master/.../items*` · `XBOS-MASTER-200/201` |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | CC catalogs có checkbox active (UF-XBOS-14); generic DM admin shell có thể partial. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Ngừng hoặc kích hoạt giá trị» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Đổi trạng thái active/inactive của giá trị danh mục không hard-delete.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Ngừng hoặc kích hoạt giá trị | Đổi trạng thái active/inactive của giá trị danh mục không hard-delete. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-TOGGLE-INACTIVE | Ngừng hiệu lực giá trị | Toggle Hiệu lực · PUT/PATCH item | Y |
| CAP-02 | FN-TOGGLE-ACTIVE | Kích hoạt lại giá trị | Toggle · PUT/PATCH item | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-TOGGLE-INACTIVE | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-TOGGLE-ACTIVE | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 4 | 2 | 0 | 3 | 3 | **12** |

> **cases_designed (SoT §5 rows):** **12** (fn Σ thiết kế = 12; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM05-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Đã login CC | 1. Mở settings catalog 2. Quan sát cột hiệu lực | List 2xx; thấy active | UI | PHASE1 #81 · UF-XBOS-14 |
| TC-DM05-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Login member CEO | 1. Mở holding catalog | 403/blocked hoặc chỉ scope CT | UI/API | ADR holding |
| TC-DM05-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Catalog empty | 1. Mở tab trống | Empty + CTA — không 500 | UI | U65 |
| TC-DM05-INACT-HP-001 | CAP-02 | FN-TOGGLE-INACTIVE | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | ≥1 dòng active tạo từ FE | 1. Bỏ Hiệu lực 2. Autosave/Lưu | 2xx; F5 inactive | UI/API | XBOS-MASTER-201 |
| TC-DM05-INACT-FD-001 | CAP-02 | FN-TOGGLE-INACTIVE | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Giá trị in-use (BR) | 1. Inactive khi BR chặn | 4xx; F5 không đổi | UI/API | BR in-use |
| TC-DM05-INACT-AU-001 | CAP-02 | FN-TOGGLE-INACTIVE | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Ngoài scope | 1. PATCH active=false holding | 403/409 | API | scope_parity |
| TC-DM05-INACT-UX-001 | CAP-02 | FN-TOGGLE-INACTIVE | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Sau inactive | 1. Filter ngừng | UI đúng trạng thái | UI | UX |
| TC-DM05-ACT-HP-001 | CAP-02 | FN-TOGGLE-ACTIVE | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Dòng inactive FE | 1. Bật lại | 2xx; F5 active | UI/API | XBOS-MASTER-201 |
| TC-DM05-ACT-FD-001 | CAP-02 | FN-TOGGLE-ACTIVE | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Conflict mã | 1. Activate khi validate fail | 4xx | UI/API | validate |
| TC-DM05-ACT-AU-001 | CAP-02 | FN-TOGGLE-ACTIVE | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Sai companyId | 1. Activate API | 403/409 | API | AU |
| TC-DM05-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Đã toggle | 1. F5 | Đúng trạng thái | UI | AC |
| TC-DM05-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | API chậm | 1. Quan sát | Loading; không ghost submit | UI | UX |

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
| BE API/DTO | PUT items active flag · soft-disable; cấm hard-delete platform rows | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | CC document/measure/pricing cột Hiệu lực; HRM settings-catalogs tùy domain | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-05
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
```
