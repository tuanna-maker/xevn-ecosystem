# BRD — Quản trị RACI & số hóa nhiệm vụ theo doanh nghiệp (X-BOS)

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|---|---|
| Tên tài liệu | BRD Quản trị RACI & số hóa nhiệm vụ |
| Phiên bản | 1.0 |
| Trạng thái | Draft — triển khai Wave RACI |
| Ngày hiệu lực | 2026-05-16 |
| Nguồn nghiệp vụ | `docs/ma trận chức năng RACI.md` (Công ty TNHH Xe Việt Nam) |
| Phạm vi | X-BOS (Command Center — Thiết lập công ty) + liên kết phân hệ |

## 2. Tóm tắt điều hành

Tập đoàn XeVN đã có **ma trận RACI** (~266 hoạt động × 18 vai trò tổ chức). Để **số hóa quản trị theo tập đoàn**, mỗi hoạt động mà nhân sự tham gia (R/A/C/I) phải:

1. Được **ghi nhận cấu hình** theo từng pháp nhân / công ty thành viên.
2. **Ánh xạ** sang ít nhất một **chức năng nghiệp vụ** trên phân hệ hệ sinh thái (HRM, CRM, Fleet, XBOS, …).
3. **Thực thi & audit** qua quyền, workflow và dữ liệu trong PostgreSQL (`tenant_id`, `company_id`).

Giải pháp: thêm tab **「Nhiệm vụ & RACI」** trong **chi tiết pháp nhân** (Command Center → Thiết lập công ty), kế thừa template tập đoàn và cho phép ghi đè theo công ty.

## 3. Bối cảnh & vấn đề

| Vấn đề | Tác động |
|--------|----------|
| RACI chỉ tồn tại trên Excel/Markdown | Không truy vết ai làm gì khi vận hành hệ thống |
| Phân quyền portal chỉ ~11 dòng module thô | Không phủ 266 hoạt động nghiệp vụ |
| Thiếu liên kết RACI ↔ HRM/Payroll/Fleet | Không chứng minh số hóa theo tập đoàn |
| Công ty thành viên khác nhau về COO/Kho/KD | Cần override theo `company_id`, không chỉ template group |

## 4. Mục tiêu & chỉ số thành công

| Mục tiêu | KPI / bằng chứng |
|----------|------------------|
| Một nguồn sự thật cho catalog hoạt động RACI | `raci_activity_catalog` ≥ 240 bản ghi versioned |
| Cấu hình ma trận theo công ty | Tab UI lưu/đọc `company_raci_matrix_cell` |
| Ánh xạ nghiệp vụ hệ thống | ≥ 80% hoạt động có **R hoặc A** được gắn ≥1 `ecosystem_capability` (mục tiêu P1) |
| Traceability | BRD → SRS → schema → API → UI → test |

## 5. Phạm vi

### 5.1 Trong phạm vi (Wave RACI P0–P1)

- Catalog master hoạt động RACI (import từ tài liệu khách hàng).
- 18 cột vai trò (`RACI_ORG_COLUMNS` — đã có trong portal).
- Tab **Nhiệm vụ & RACI** trong chi tiết pháp nhân: 3 sub-view (Ma trận / Ánh xạ phân hệ / Gán chức danh).
- API đọc catalog + ma trận + capability (XBOS).
- Seed capability mẫu cho HCNS, KD, VT, TCKT.
- BRD/SRS/TECHSPEC và ma trận traceability.

### 5.2 Ngoài phạm vi (defer)

- Tự động sinh toàn bộ `permission_grant` từ RACI (P2).
- Đồng bộ hai chiều real-time sang HRM standalone (port 8080) — dùng portal + XBOS làm cổng.
- Module Tài chính đầy đủ (chỉ map metadata + workflow tạm).

## 6. Stakeholder & RACI quản trị dự án

| Vai trò | Trách nhiệm |
|---------|-------------|
| Chủ tịch / HĐQT | Phê duyệt template ma trận tập đoàn |
| CHRO / HCNS | Xác nhận khối HCNS & mapping HRM |
| COO / Vận tải | Xác nhận khối vận tải & Fleet |
| Quản trị XBOS | Cấu hình template, override công ty |
| Dev/QA | Triển khai schema, API, UI theo SRS |

## 7. Yêu cầu nghiệp vụ (BR)

| Mã | Mô tả | Ưu tiên |
|----|--------|---------|
| BR-RACI-01 | Hệ thống lưu catalog hoạt động RACI versioned theo tenant tập đoàn | P0 |
| BR-RACI-02 | Mỗi công ty có ma trận RACI kế thừa template, cho phép override từng ô R/A/C/I | P0 |
| BR-RACI-03 | Mỗi hoạt động có thể gắn N capability phân hệ (`module_code`, `feature_code`, `permission_code`) | P0 |
| BR-RACI-04 | UI báo % hoạt động đã số hóa (có capability active cho R/A) | P1 |
| BR-RACI-05 | Cột RACI liên kết `position_template` / org column (`raci_{column_id}`) | P1 |
| BR-RACI-06 | Mọi thay đổi ma trận công ty ghi audit (`who`, `when`, `old`, `new`) | P1 |
| BR-RACI-07 | Tuân thủ phạm vi `tenant_id` + `company_id` (BR-ECO-SCOPE-02) | P0 |

## 8. Ma trận quy tắc nghiệp vụ

| Điều kiện | Hành động | Kết quả |
|-----------|-----------|---------|
| Ô ma trận chứa ký tự R,A,C,I hợp lệ | Lưu `company_raci_matrix_cell` | Hiển thị đúng màu/ ký hiệu trên UI |
| Ô trống hoặc `-` | Không tạo assignment / xóa override | Kế thừa template group nếu có |
| Hoạt động có R hoặc A nhưng 0 capability | Cảnh báo trên sub-view Ánh xạ | Trạng thái `chưa_số_hóa` |
| User sửa ma trận không thuộc scope công ty | Từ chối 403 | Không ghi DB |
| Import catalog version mới | Bump `catalog_version`, giữ matrix cũ cho tới khi migrate | Không mất override |

## 9. Tham chiếu

- SRS: `docs/xbos/RACI_GOVERNANCE_SRS.md`
- TECHSPEC: `docs/xbos/RACI_GOVERNANCE_TECHSPEC.md`
- Traceability: `docs/xbos/RACI_GOVERNANCE_TRACEABILITY.md`
- Catalog cột: `apps/web/web-portal/src/data/xevn-raci-catalog.ts`
