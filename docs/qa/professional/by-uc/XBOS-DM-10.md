# UC — `XBOS-DM-10` · Xuất danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-10` |
| **stt_phase1** | 86 |
| **mod** | M01 |
| **name_vi** | Xuất danh mục |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 86 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 86 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | Export endpoint (matrix Có) · auth required |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | Matrix: Có endpoint; map controller khi execute. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Xuất danh mục» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Export file (CSV/XLSX/JSON) bộ danh mục đang chọn.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Xuất danh mục | Export file (CSV/XLSX/JSON) bộ danh mục đang chọn. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-EXPORT | Xuất file danh mục | Nút Xuất · GET export | N |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-EXPORT | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 3 | 1 | 0 | 2 | 3 | **9** |

> **cases_designed (SoT §5 rows):** **10** (fn Σ thiết kế = 9; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM10-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login | 1. Mở catalog | Thấy Xuất | UI | #86 |
| TC-DM10-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Export holding full | 403 hoặc scope CT | API | AU |
| TC-DM10-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Empty | 1. Export rỗng | Header-only hoặc chặn + message | UI | UX |
| TC-DM10-EXP-HP-001 | CAP-02 | FN-EXPORT | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Có data FE | 1. Bấm Xuất | 200 file khớp list | UI/API | export |
| TC-DM10-EXP-FD-001 | CAP-02 | FN-EXPORT | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | format sai | 1. format=exe | 4xx | API | FD |
| TC-DM10-EXP-AU-001 | CAP-02 | FN-EXPORT | AU | P0 | anonymous | Không token | 1. GET export | 401 XBOS-AUTH-001 | API | AU |
| TC-DM10-EXP-UX-001 | CAP-02 | FN-EXPORT | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Downloading | 1. Xuất | Busy state | UI | UX |
| TC-DM10-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | File tải | 1. Mở file | UTF-8; đủ cột | — | AC |
| TC-DM10-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Lỗi mạng | 1. Fail download | Toast lỗi | UI | UX |
| TC-DM10-EXP-HP-002 | CAP-02 | FN-EXPORT | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Filter active | 1. Export filtered | File chỉ subset | UI/API | HP |

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
| BE API/DTO | GET export stream | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | Nút Xuất trên màn catalog | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-10
cases_designed: 10
code_readiness: LIKELY_PARTIAL
uat_done: false
```
