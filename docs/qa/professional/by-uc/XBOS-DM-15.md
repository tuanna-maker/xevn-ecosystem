# UC — `XBOS-DM-15` · Yêu cầu bổ sung trường (công ty con)

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-15` |
| **stt_phase1** | 91 |
| **mod** | M01 |
| **name_vi** | Yêu cầu bổ sung trường (công ty con) |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 91 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 91 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | `/api/hrm/settings-catalogs` · extension-requests · `HRM-SET-209` · `XBOS-CAT-200` |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | HRM extension + gov spawn HRM-SET-209 — Primary CAT-EXT paths. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Yêu cầu bổ sung trường (công ty con)» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). CT thành viên đề nghị thêm field/extension vào catalog tập đoàn.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Yêu cầu bổ sung trường (công ty con) | CT thành viên đề nghị thêm field/extension vào catalog tập đoàn. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-REQ-ADD | Tạo yêu cầu bổ sung trường | Xác nhận áp dụng | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-REQ-ADD | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 3 | 1 | 0 | 2 | 3 | **9** |

> **cases_designed (SoT §5 rows):** **14** (fn Σ thiết kế = 9; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM15-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login + OU member | 1. Mở company_group_hr | Form cấu hình | UI | #91 · UF-15 |
| TC-DM15-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Mở CT khác | Chặn | UI/API | AU |
| TC-DM15-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | — | 1. Dialog field | Tabs khối | UI | UX |
| TC-DM15-ADD-HP-001 | CAP-02 | FN-REQ-ADD | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Thêm field FE | 1. Xác nhận áp dụng | 209/2xx; pending gov; F5 | UI/API | HRM-SET-209 · U65 |
| TC-DM15-ADD-FD-001 | CAP-02 | FN-REQ-ADD | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Thiếu mã/label | 1. Submit | 4xx; không spawn | UI/API | FD |
| TC-DM15-ADD-AU-001 | CAP-02 | FN-REQ-ADD | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Sai x-company-id | 1. Submit | 403/409 | API | AU |
| TC-DM15-ADD-UX-001 | CAP-02 | FN-REQ-ADD | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Confirm | 1. Cancel | Không gọi API | UI | UX |
| TC-DM15-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | Người duyệt catalog gov (Group) | Sau request FE | 1. extension-requests / panel | Thấy chờ | UI/API | XBOS-CAT-200 |
| TC-DM15-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Trước request | 1. Gov list | Empty OK | UI | U65 |
| TC-DM15-ADD-HP-002 | CAP-02 | FN-REQ-ADD | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Multi field | 1. Apply batch | Đủ items trong request | UI/API | HP |
| TC-DM15-ADD-FD-002 | CAP-02 | FN-REQ-ADD | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Trùng mã field | 1. Submit | 4xx BR | API | FD |
| TC-DM15-OPEN-HP-002 | CAP-01 | FN-OPEN | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | HDSD | 1. Đúng menu | U76 align | UI | U76 |
| TC-DM15-VER-HP-002 | CAP-03 | FN-VERIFY | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Sau 209 | 1. F5 dialog | Submitted state | UI | AC |
| TC-DM15-ADD-AU-002 | CAP-02 | FN-REQ-ADD | AU | P0 | anonymous | — | 1. POST | 401 | API | AU |

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
| BE API/DTO | POST extension / settings apply | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | company_group_hr → Xác nhận áp dụng | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-15
cases_designed: 14
code_readiness: LIKELY_IMPL
uat_done: false
```
