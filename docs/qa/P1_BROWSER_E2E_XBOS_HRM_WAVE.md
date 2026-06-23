# P1 — Browser E2E wave XBOS → HRM (test từ ngoài FE)

**Owner:** QA → QC  
**Sponsor lock U63:** Browser thật only — **cấm** seed/probe làm bằng chứng 🟢  
**URL mặc định nghiệm thu:** `http://14.225.217.232:8088/`  
**Account chính:** `ceo@xe.vn` / `Xevn@2026`  
**Member negative/scope:** `du-lich.ceo@xe.vn`, `du-lich.hr@xe.vn`  
**Matrix SoT:** `USER_FLOW_OPERABILITY_MATRIX.md`  
**Evidence file:** `docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md`

---

## Quy tắc mỗi UF

1. Login UI (không inject token trừ khi login form broken — ghi defect).
2. Click path đúng menu SRS.
3. Mutate (Create/Update/Delete theo UC).
4. **Ghi FE sau API 2xx** — UI thay đổi gì (row, count, field, toast, tab consumer U34).
5. **F5** hoặc rời màn → quay lại — persist?
6. Screenshot + Network POST/PUT/PATCH 2xx.
7. Nếu SRS không mô tả FE feedback → `spec_gap` → BA delta.

---

## Wave 1 — XBOS (UF-XBOS-01 .. 15)

| # | UF-ID | Click path (tóm tắt) | FE post-mutation cần quan sát | SRS ref |
|---|-------|----------------------|-------------------------------|---------|
| 1 | UF-XBOS-01 | `/login` → CC shell | Dashboard/rail hiện; không Vite overlay | UC-XBOS-AUTH-01 |
| 2 | UF-XBOS-02 | Settings → Đơn vị thành viên → chọn row | Detail/form load đúng entity | UC-CC-03 |
| 3 | UF-XBOS-03 | Member unit → Chỉnh sửa → sửa field → Lưu | Toast OK; F5 field còn | UC-XBOS-ORG-03 |
| 4 | UF-XBOS-04 | Member → Cổ đông → + row → ✓ | Row persist; ratio/contributed **độc lập** (AC-SHR) | UC-CC-P0-01 |
| 5 | UF-XBOS-05 | TẬP ĐOÀN → Cổ đông → + → ✓ | POST UUID 201; row trong bảng; F5 | UC-CC-P0-01 |
| 6 | UF-XBOS-06 | Tài liệu pháp lý → + upload | Doc trong list; F5 | UC-XBOS-ORG-03 |
| 7 | UF-XBOS-07 | RACI matrix → toggle → debounce save | Ô sticky sau F5 | UC-CC-RACI |
| 8 | UF-XBOS-08 | **Bước 1:** Settings → Quy trình → tạo/lưu WF → **Bước 2:** Inbox → Duyệt | Task biến mất sau Duyệt | UC-XBOS-WF |
| | | **Cấm:** `seed:workflow:inbox` — U64 | | |
| 9 | UF-XBOS-09 | **Bước 1:** Tạo extension/catalog từ FE → **Bước 2:** Inbox → Duyệt | Consumer sync | UC-XBOS-CAT |
| | | **Cấm:** API seed inbox — U64 | | |
| 10 | UF-XBOS-10 | KPI dashboard | Cards/charts load; không 409 | UC-XBOS-KPI |
| 11 | UF-XBOS-11 | `du-lich.ceo@xe.vn` — CC rollup blocked | 403/409 hoặc scope message | U28 |
| 12 | UF-XBOS-12 | Phòng ban → thêm node → Lưu | Tree node F5 | UC-CC-P0-03 |
| 13 | UF-XBOS-13 | Ma trận phân quyền Settings → toggle | Matrix re-GET match | UC-CC-P0-04 |
| 14 | UF-XBOS-14 | Catalog CC autosave row | PUT debounce → list có item | UC-CC-P0-05 |
| 15 | UF-XBOS-15 | Catalog governance extension item | POST → list HRM DM | UC-XBOS-CAT-01 |

**Wave 1 exit:** 15/15 browser evidence blocks; matrix §3 cập nhật 🟢/🟡/🔴 thật.

---

## Wave 2 — HRM embed (UF-HRM-01 .. 13)

| # | UF-ID | Click path | FE post-mutation | SRS / J-* |
|---|-------|------------|------------------|-----------|
| 1 | UF-HRM-01 | HRM tab → NV list → click row | Detail panel/route | J-HRM-01 |
| 2 | UF-HRM-02 | Hợp đồng → tạo/sửa → Lưu | notes/field F5 | J-HRM-03 |
| 3 | UF-HRM-03 | NV → sửa → Lưu | full_name F5 | J-HRM-02 |
| 4 | UF-HRM-04 | Bảo hiểm → link NV | link visible | J-HRM-04 |
| 5 | UF-HRM-05 | Chấm công | record in list | J-HRM-06 |
| 6 | UF-HRM-06 | Lương → phiếu | payslip detail | J-HRM-07 |
| 7 | UF-HRM-09 | `du-lich.hr@xe.vn` PATCH NV scope | 200 member; 403 cross | U28 |
| 8 | UF-HRM-10 | Settings catalogs → sync → thêm item | sync OK; item in list | HRM-SC-01..03 |
| 9 | UF-HRM-11 | Metadata queue → submit → approve | status approved in UI | UC-HRM-26 |
| 10 | UF-HRM-12 | Tuyển dụng → requisition → sửa | GET-by-id F5 | UC-HRM-22 |
| 11 | UF-HRM-13 | Member CEO employee mutate | PATCH F5 | UC-HRM-SCOPE-02 |

Skip ⚪ UF-HRM-07/08 (mobile).

**Wave 2 exit:** 11/11 browser blocks; matrix §4 cập nhật.

---

## QC gate (sau QA Wave 1+2)

- Audit **100%** evidence có FE post-mutation + screenshot
- Reject hàng chỉ có probe/API
- GO chỉ khi sponsor-visible browser PASS hoặc GWC có owner

---

## PM dispatch order

1. `devops` — sync latest `web-portal/src` + shareholder UX fix → `:8088` (prerequisite)
2. `qa` — Wave 1 XBOS browser
3. `qa` — Wave 2 HRM browser (sau Wave 1 PASS hoặc parallel nếu capacity)
4. `qc` — `P1-BROWSER-E2E-QC-8088`
