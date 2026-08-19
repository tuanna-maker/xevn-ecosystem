# Hướng dẫn sử dụng — XBOS (Business Operating System)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-XBOS-000 |
| **Phiên bản** | 1.1 |
| **Sản phẩm** | **XBOS** — không bao gồm nghiệp vụ HRM chi tiết |
| **API** | `/api/xbos` (cổng `:28002`) |
| **Đối tượng** | Ban điều hành tập đoàn, Quản trị hệ thống, CFO, vận hành |

> Nghiệp vụ **Nhân sự, HĐ, chấm công, lương** → tài liệu [**HDSD HRM**](../hrm/HDSD_HRM_INDEX.md).  
> **Đăng nhập & chuyển phân hệ** → [**Cổng chung**](../ecosystem/HDSD_ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE.md).

---

## Mục lục XBOS

| Chương | Tên | File |
|--------|-----|------|
| **1** | Command Center — tổng quan, Action Cards, KPI rollup | [HDSD_XBOS_CH01_COMMAND_CENTER.md](./HDSD_XBOS_CH01_COMMAND_CENTER.md) |
| **2** | Cài đặt tập đoàn — Tổ chức & pháp nhân | [HDSD_XEVN_CH03_XBOS_TO_CHUC.md](./HDSD_XEVN_CH03_XBOS_TO_CHUC.md) |
| **3** | Workflow, RACI, Danh mục & KPI (trong CC) | [HDSD_XEVN_CH04_XBOS_WF_CAT_KPI.md](./HDSD_XEVN_CH04_XBOS_WF_CAT_KPI.md) |
| **4** | Dashboard vận hành — Cockpit, Tổ chức, KPI, Khách hàng, Đối tác, Settings (**16 route — đủ §4.1–4.7**) | [HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md](./HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md) |
| **5** | Quản trị danh mục tập đoàn (Catalog Governance) | *(gộp Ch.3 §5 + Ch.4 §catalog-governance)* |

---

## Inventory màn XBOS

| STT | Màn hình | Route | Chương |
|-----|----------|-------|--------|
| 1 | Command Center | `/command-center` | 1 |
| 2 | Cài đặt — Danh sách đơn vị | CC → Cài đặt → Tổ chức | 2 |
| 3 | Hồ sơ pháp nhân / Cổ đông / Tài liệu | Modal/tab trong Cài đặt | 2 |
| 4 | Phòng ban (org-units) | Cài đặt → Phòng ban | 2 |
| 5 | Ma trận phân quyền (RBAC) | Cài đặt → RBAC | 2 |
| 6 | RACI | Cài đặt → RACI | 3 |
| 7 | Hộp thư Workflow | CC / inbox | 3 |
| 8 | Canvas thiết kế quy trình | Workflow | 3 |
| 9 | Danh mục CC (autosave) | Cài đặt → Danh mục | 3 |
| 10 | Catalog Governance | `/catalog-governance` | 3–4 |
| 11 | Cockpit / Executive | `/cockpit` | 4 |
| 12 | Tổ chức (dashboard) | `/dashboard/organization` | 4 |
| 13 | Nhân sự (dashboard stub) | `/dashboard/hr` | 4 *(liên kết HRM)* |
| 14 | Khách hàng | `/dashboard/customers` | 4 |
| 15 | Đối tác | `/dashboard/partners` | 4 |
| 16 | KPI Policy | `/dashboard/kpi-policy` | 4 |
| 17 | KPI Dashboard | `/dashboard/kpi-dashboard` | 4 |
| 18 | Settings — Chức danh, PB, Vùng, Loại xe, NCC, DM chi phí, KPI metrics/formulas | `/dashboard/settings/*` | 4 |

---

## Liên kết nghiệp vụ (SRS / UF)

| UF | Nội dung XBOS |
|----|----------------|
| UF-XBOS-01..15 | Toàn bộ luồng Command Center & Cài đặt |
| UC-CC-* | Command Center use cases |
| UC-XBOS-ORG-* | Tổ chức, pháp nhân, cổ đông |

## Kiểm thử XBOS

Wave **W1** trong `HDSD_DRIVEN_UAT_SCENARIO.md` — persona `ceo@xe.vn`, **không** thay bằng test HRM embed.
