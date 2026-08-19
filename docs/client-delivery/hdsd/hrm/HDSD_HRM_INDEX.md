# Hướng dẫn sử dụng — HRM (Human Resource Management)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-000 |
| **Phiên bản** | 1.1 |
| **Sản phẩm** | **HRM** — phân hệ nhân sự **độc lập**, tách khỏi XBOS |
| **API** | `/api/hrm` (cổng `:28001`) |
| **Đối tượng** | HR, HCNS, Kế toán lương, Quản lý, Ban điều hành (theo scope) |

> **Tổ chức tập đoàn, workflow, danh mục gốc** → [**HDSD XBOS**](../xbos/HDSD_XBOS_INDEX.md).  
> **Đăng nhập Cổng** → [**Cổng chung**](../ecosystem/HDSD_ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE.md).

---

## Hai cách sử dụng HRM Web (bắt buộc nắm)

| Cách | Mô tả | URL mẫu |
|------|--------|---------|
| **1 — Ứng dụng HRM độc lập (W2a)** | Mở trực tiếp app HRM (`apps/web/hrm`, Vite mặc định cổ **8080**, base `/hr/`). Sidebar đầy đủ. | `http://127.0.0.1:8080/hr/employees` |
| **2 — HRM nhúng trong Command Center (W2b)** | Từ Cổng Web → Command Center → rail **NHÂN SỰ** → iframe + sidebar HRM trên shell XBOS | `http://127.0.0.1:5173/command-center/hrm/employees` |

### Bảng entry nghiệm thu (W2a / W2b)

| Entry | Wave | Base URL | Ghi chú |
|-------|------|----------|---------|
| **Standalone W2a** | HRM độc lập | `http://127.0.0.1:8080/hr/*` | Cổ mặc định `vite.config.ts` (`apps/web/hrm`). Route ví dụ: `/hr/employees`, `/hr/attendance`. |
| **Embed W2b** | HRM nhúng CC | `http://127.0.0.1:5173/command-center/hrm/*` | Cần portal `:5173` (`pnpm run dev:web-only`). Route ví dụ: `…/hrm/employees`. |
| *(tùy chọn)* Standalone thủ công | W2a alt | `http://127.0.0.1:5175/*` | Chỉ khi chạy `pnpm run dev:hrm-standalone` (base `/`, không `/hr/`). Không thay W2a canonical. |

Nội dung nghiệp vụ **giống nhau**; khác **khung shell** (portal embed vs app thuần). Nghiệm thu hệ sinh thái phải test **cả hai** với cùng persona.

Chi tiết nhúng: [HDSD_HRM_CH00_VAO_UNG_DUNG.md](./HDSD_HRM_CH00_VAO_UNG_DUNG.md)

---

## Mục lục HRM

| Chương | Tên | File |
|--------|-----|------|
| **0** | Vào ứng dụng — standalone vs embed | [HDSD_HRM_CH00_VAO_UNG_DUNG.md](./HDSD_HRM_CH00_VAO_UNG_DUNG.md) |
| **1** | Nhân sự — danh sách & hồ sơ | [HDSD_XEVN_CH05_HRM_NHAN_SU.md](./HDSD_XEVN_CH05_HRM_NHAN_SU.md) |
| **2** | Hợp đồng & Bảo hiểm | [HDSD_XEVN_CH06_HRM_HD_BH.md](./HDSD_XEVN_CH06_HRM_HD_BH.md) |
| **3** | Tuyển dụng | [HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md](./HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md) |
| **4** | Chấm công & Nghỉ phép | [HDSD_XEVN_CH08_HRM_CHAM_CONG.md](./HDSD_XEVN_CH08_HRM_CHAM_CONG.md) |
| **5** | Lương & Bảng lương | [HDSD_XEVN_CH09_HRM_LUONG.md](./HDSD_XEVN_CH09_HRM_LUONG.md) |
| **6** | Công ty, Quyết định, Công việc, DVC, Quy trình, Fleet | [HDSD_XEVN_CH10_HRM_CO_QD_CV.md](./HDSD_XEVN_CH10_HRM_CO_QD_CV.md) |
| **7** | Cài đặt HRM & Báo cáo | [HDSD_XEVN_CH11_HRM_SETTINGS_REPORTS.md](./HDSD_XEVN_CH11_HRM_SETTINGS_REPORTS.md) |
| **M** | Mobile HRM | [HDSD_XEVN_CH12_MOBILE_HRM.md](./HDSD_XEVN_CH12_MOBILE_HRM.md) |

---

## Inventory menu HRM (20 mục sidebar + guide)

| Menu | Route standalone | Route embed | UC chính |
|------|------------------|-------------|----------|
| Tổng quan | `/` | `…/hrm/dashboard` | UC-HRM-20 |
| Nhân sự | `/employees` | `…/hrm/employees` | UC-HRM-21 |
| Hợp đồng | `/contracts` | `…/hrm/contracts` | UC-HRM-25 |
| Bảo hiểm | `/insurance` | `…/hrm/insurance` | HRM-CI-02 |
| Quyết định | `/decisions` | `…/hrm/decisions` | UC-HRM-27 |
| Tuyển dụng | `/recruitment` | `…/hrm/recruitment` | UC-HRM-22 |
| Chấm công | `/attendance` | `…/hrm/attendance` | UC-HRM-23 |
| Tiền lương | `/payroll` | `…/hrm/payroll` | UC-HRM-24 |
| Đánh giá | `/performance` | `…/hrm/performance` | HRM-PF-* |
| Công việc | `/tasks` | `…/hrm/tasks` | HRM-OP-02 |
| Quy trình & chính sách | `/processes` | `…/hrm/processes` | read-only XBOS ref |
| Dịch vụ nội bộ | `/internal-services` | `…/hrm/internal_services` | HRM-SV-02 |
| Công cụ & thiết bị | `/tools-equipment` | `…/hrm/tools_equipment` | deferred |
| Hồ sơ xe | `/fleet` | `…/hrm/fleet` | HRM-FL-01 |
| Phòng/Ban & Công ty | `/company` | `…/hrm/company` | UC-HRM-CO-01 |
| Báo cáo | `/reports` | `…/hrm/reports` | HRM-PR-06 |
| Cấu hình HRM | `/settings` | `…/hrm/settings` | HRM-SC-01..09 |
| Hướng dẫn (in-app) | `/guide` | `…/hrm/guide` | — |
| UniAI | `/ai` | `…/hrm/hrm_ai` | pilot |

> **Công cụ & thiết bị:** menu có trên sidebar; nghiệp vụ **deferred** — OUT-OF-SCOPE pilot UAT (inventory ghi nhận route).

---

## Liên kết XBOS

| Luồng liên thông | XBOS | HRM |
|------------------|------|-----|
| Danh mục gốc | Publish catalog XBOS | Pull/sync → Cấu hình HRM |
| Headcount công ty | Đơn vị thành viên | Màn Công ty — cột NV |
| Workflow duyệt | Inbox CC | Đơn nghỉ / HRM requests |

## Kiểm thử HRM

- Wave **W2a** — HRM standalone (`http://127.0.0.1:8080/hr/*`; cổ 8080 canonical)  
- Wave **W2b** — HRM embed (`http://127.0.0.1:5173/command-center/hrm/*`)  
- Wave **W3** — Mobile  
- UF: `UF-HRM-01..13` · `docs/hrm/SRS.md`
