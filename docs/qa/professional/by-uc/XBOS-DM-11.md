# UC — `XBOS-DM-11` · Nhập danh mục từ file

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-11` |
| **stt_phase1** | 87 |
| **mod** | M01 |
| **name_vi** | Nhập danh mục từ file |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 87 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 87 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | Import endpoint · row validation errors |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | Matrix endpoint Có; FE wizard xác nhận khi execute. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Nhập danh mục từ file» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Import file tạo/cập nhật giá trị với validate hàng.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Nhập danh mục từ file | Import file tạo/cập nhật giá trị với validate hàng. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-IMPORT | Upload & nhập file | Upload · POST import | Y |
| CAP-02 | FN-IMPORT-PREVIEW | Xem trước / báo lỗi dòng | Preview grid | N |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-IMPORT | 1 | 1 | 1 | 1 | 1 | 5 |
| FN-IMPORT-PREVIEW | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 4 | 1 | 1 | 3 | 4 | **13** |

> **cases_designed (SoT §5 rows):** **14** (fn Σ thiết kế = 13; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM11-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login | 1. Mở Nhập | Dialog upload | UI | #87 |
| TC-DM11-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Import master | 403/ẩn | UI/API | AU |
| TC-DM11-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | — | 1. Mở | Hướng dẫn mẫu file | UI | UX |
| TC-DM11-IMP-HP-001 | CAP-02 | FN-IMPORT | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | File hợp lệ tự tạo | 1. Upload 2. Xác nhận | 2xx; F5 rows | UI/API | U65 file tự tạo |
| TC-DM11-IMP-FD-001 | CAP-02 | FN-IMPORT | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Thiếu cột bắt buộc | 1. Upload | 4xx/preview errors; không nửa vời | UI/API | FD |
| TC-DM11-IMP-BD-001 | CAP-02 | FN-IMPORT | BD | P1 | ceo@xe.vn (Group CEO / main→holding) | 0 data rows | 1. Chỉ header | Chặn hoặc no-op rõ | UI/API | BD |
| TC-DM11-IMP-AU-001 | CAP-02 | FN-IMPORT | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Sai CT | 1. Import holding | 403/409 | API | AU |
| TC-DM11-IMP-UX-001 | CAP-02 | FN-IMPORT | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Large file | 1. Upload | Progress; cancel an toàn | UI | UX |
| TC-DM11-PRV-HP-001 | CAP-02 | FN-IMPORT-PREVIEW | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | File mixed | 1. Preview | Highlight dòng lỗi | UI | preview |
| TC-DM11-PRV-UX-001 | CAP-02 | FN-IMPORT-PREVIEW | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Binary | 1. Upload | Message parse fail | UI | UX |
| TC-DM11-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Import OK | 1. F5 | Đủ rows mới | UI | AC |
| TC-DM11-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Partial BR | 1. Quan sát | All-or-nothing theo spec | UI | BR |
| TC-DM11-IMP-FD-002 | CAP-02 | FN-IMPORT | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Duplicate codes | 1. Import trùng | 4xx/merge BR rõ | API | FD |
| TC-DM11-OPEN-AU-002 | CAP-01 | FN-OPEN | AU | P0 | anonymous | — | 1. POST import | 401 | API | AU |

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
| BE API/DTO | POST import multipart | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | Nhập từ file dialog | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-11
cases_designed: 14
code_readiness: LIKELY_PARTIAL
uat_done: false
```
