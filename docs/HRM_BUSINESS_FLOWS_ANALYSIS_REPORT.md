# BÁO CÁO PHÂN TÍCH LUỒNG NGHIỆP VỤ HRM & ĐỀ XUẤT CẢI TIẾN

## XeVN Ecosystem OS — Enterprise HRM Review

| Thuộc tính | Giá trị |
|---|---|
| Tài liệu nguồn | BRD-XEVN-OS-001 + SRS-XEVN-OS-001 + S7_KICKOFF.md |
| Ngày | 2026-07-31 |
| Trạng thái | apps/api/{hrm-api,xbos-api}, apps/web, apps/mobile |

## 3. PHÂN TÍCH BRD

### 3.1 XBOS — 4 luồng chính
- B1 Khởi tạo Tenant mới
- B2 RBAC đa tầng (Platform/Tenant/Resource)
- B3 Workflow Engine: SUBMITTED → L1_PENDING → L1_APPROVED → L2_PENDING → L2_APPROVED/REJECTED; SLA 24h/48h; anti-self-approval
- B4 Catalog Governance: 2 tầng (Platform + Tenant), propagate 7 ngày

### 3.2 HRM Web — 5 luồng
- H1 Employee: Form 4 tab, validation CCCD unique, lương ≥ min vùng
- H2 Attendance: GPS check-in/out, geofence ≤200m, auto checkout 10h
- H3 Leave: 5 loại, approval workflow
- H4 Payroll: Batch ngày 25, công thức lãnh, 6 bước → LOCKED
- H5 Recruitment: 5 bước cố định → thiếu dynamic 13 bước

### 3.3 HRM Mobile
- M1 Multi-tenant login
- M2 Check-in GPS + fallback thủ công
- M3 Leave mobile (5 bước employee, 5 bước manager)
- M4 Payslip mobile + security blur

### 3.4 Integration
- XBOS → HRM: REST API
- HRM → XBOS: Event queue
- HRM → Notification: Event queue
→ **Vấn đề:** đơn chiều, thiếu real-time sync

## 4. PHÂN TÍCH SRS
- P0 đầy đủ: UC-H01~H04, UC-M01~M03
- P1 cơ bản: UC-H05 Recruitment, UC-H06 Report, UC-B04/B05
- Thiếu: API contract chính thức, batch endpoints, event schema

## 5. ROOT CAUSE LỖI HIỆN TẠI
1. Data linkage lỏng lẻo → FE gọi nhiều endpoint rời
2. Thiếu batch API → mỗi màn hình gọi 5-6 request
3. Thiếu caching → mỗi request hit DB
4. Recruitment static 5 bước → không đủ enterprise

## 6. ĐỀ XUẤT CẢI TIẾN
1. Event-Driven: Employee create → emit EMPLOYEE_CREATED → XBOS auto-create Membership+RBAC+Notification
2. Batch API: POST /api/batch cho employee detail
3. Catalog caching: key catalog:{tenantId}:v{version}
4. Dynamic Recruitment Workflow: TA customize steps theo position
5. Data linkage checklist cho toàn hệ sinh thái

## 7. PRIORITIZED ACTIONS
| P | Action | Module |
|---|---|---|
| P0 | Event Bus internal | XBOS |
| P0 | Batch API endpoints | HRM |
| P1 | Dynamic Workflow mở rộng | XBOS |
| P1 | Catalog caching | XBOS |
| P1 | Connection pool tuning | Infra |
| P2 | Mobile offline sync | Mobile |
