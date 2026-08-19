# TechSpec — Technical Specification for Wave 11: Contract Clause Library (Thư viện Điều khoản HĐLĐ)

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-CONTRACT-CLAUSE-TECHSPEC-01 |
| ref_srs | [BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md) |
| ref_extract | [BA_HRM_CONTRACT_CLAUSE_EXTRACT_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_EXTRACT_01_20260813.md) |
| ref_program | [PO_HRM_CNTT_PAYROLL_CATALOG_PROGRAM.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/PO_HRM_CNTT_PAYROLL_CATALOG_PROGRAM.md) |
| Domain | `hrm_contract_clauses` |
| Scope | HRM-Local (Quản lý trực tiếp per company/tenant, KHÔNG qua XBOS master publish) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Sẵn sàng cho DB_DESIGN & API_DESIGN |

---

## 1. Kiến trúc Immutable Snapshot & Scope

1. **HRM Local Management:** Bảng `pay_contract_clause` lưu danh mục 14 điều khoản chung + 4 điều khoản Lái xe.
2. **Contract Clause Snapshot Pattern (`ADR-CLAUSE-SNAPSHOT`):** Khi Hợp đồng lao động được khởi tạo (`pay_employee_contract`), các điều khoản được chọn sẽ được copy snapshot vào bảng `pay_employee_contract_clause_snapshot`. 
3. **Immutability Guarantee:** Mọi chỉnh sửa điều khoản gốc trong thư viện về sau **KHÔNG KHÁC BIỆT** đến nội dung các hợp đồng đã ký trước đó (`BR-CLAUSE-03`).
