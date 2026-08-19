# API Design — OpenAPI & DTO Contracts for Wave 11: Contract Clause Library

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-CONTRACT-CLAUSE-API-DESIGN-01 |
| ref_techspec | [BA_HRM_CONTRACT_CLAUSE_TECHSPEC_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_TECHSPEC_01_20260813.md) |
| ref_db_design | [BA_HRM_CONTRACT_CLAUSE_DB_DESIGN_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_DB_DESIGN_01_20260813.md) |
| ref_srs | [BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_CLAUSE_LIBRARY_SRS_01_20260813.md) |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Đủ điều kiện Handoff cho Dev FE/BE |

---

## 1. Ma trận Truy xuất SRS -> API -> CSDL (Traceability Matrix)

| SRS UC / FR ID | Tham chiếu Diễn biến SRS | Endpoints API | Controller / Service | Bảng CSDL ảnh hưởng |
|---|---|---|---|---|
| `UC-HRM-CLAUSE-01` | Quản lý Thư viện điều khoản HĐ | `GET /api/v1/hrm/contract-clauses`, `POST /api/v1/hrm/contract-clauses` | `HrmContractClauseController` -> `ClauseService` | `pay_contract_clause` |
| `UC-HRM-CLAUSE-02` | Soạn HĐ chọn điều khoản | `POST /api/v1/hrm/employee-contracts` | `HrmEmployeeContractController` -> `ContractService` | `pay_employee_contract` |
| `UC-HRM-CLAUSE-03` | Snapshot điều khoản hợp đồng | Internal Snapshot Execution during Contract Creation | `ContractClauseSnapshotService` | `pay_employee_contract_clause_snapshot` |

---

## 2. Chi tiết Endpoints Specs

### 2.1. `POST /api/v1/hrm/contract-clauses` (Tạo Điều khoản HĐ)

**Request Body (`CreateContractClauseDto`):**
```json
{
  "code": "CLAUSE_RESPONSIBILITY_DRIVER",
  "title": "Trách nhiệm bảo quản phương tiện",
  "content": "Người lao động có trách nhiệm bảo quản xe được giao...",
  "clauseType": "DRIVER_SPECIFIC"
}
```
