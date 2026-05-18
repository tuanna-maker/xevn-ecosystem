# Danh sách công ty, vai trò và cơ cấu tổ chức tập đoàn

Tài liệu mô tả **toàn bộ pháp nhân / đơn vị thành viên**, **phòng ban** và **chức danh** (vai trò công việc) theo nguồn nghiệp vụ nội bộ. Cột *Định hướng* trong bản gốc để trống — không dùng làm dữ liệu hệ thống.

## Nguồn sự thật kỹ thuật (implementation)

| Thành phần | Đường dẫn |
|------------|-----------|
| Cơ cấu org + chức danh seed XBOS | `apps/api/xbos-api/data/org-seed-member-companies.json` |
| Nạp DB | `cd apps/api/xbos-api && npm run seed:org` |
| Portal — danh sách đơn vị thành viên | Command Center (ngữ cảnh tập đoàn) đọc `GET /api/xbos/tenant-scope/group-member-units` |

Sau khi chỉnh JSON, **chạy lại** `npm run seed:org` trên môi trường tương ứng để DB khớp tài liệu.

---

## Sơ đồ phân cấp pháp nhân

```mermaid
flowchart TB
  H["Tập đoàn XeVN\n(tenant: xevn — holding)"]
  T1["Công ty Cổ phần TM & DV X.E\n(tenant: xe-tmdv)"]
  T2["Công ty TNHH Du lịch Visun\n(tenant: visun)"]
  T3["Công ty TNHH Du lịch X.E Việt Nam\n(tenant: xe-du-lich)"]
  T4["Công ty TNHH X.E Việt Nam\n(tenant: xe-vietnam)"]
  H --> T1
  H --> T2
  H --> T3
  H --> T4
```

---

## Bảng ánh xạ công ty ↔ tenant

| Tên pháp nhân (đầy đủ) | `tenant_id` / `companyId` trong seed | Mã pháp nhân (`code` JSON) | Tên ngắn seed |
|------------------------|--------------------------------------|-----------------------------|---------------|
| Tập đoàn XeVN | `xevn` (master) | `XEVN-HOLDING` | Tập đoàn |
| Công ty Cổ phần Thương mại và Dịch vụ X.E | `xe-tmdv` | `XE_TMDV` | X.E TM-DV |
| Công ty TNHH Du lịch Visun | `visun` | `VISUN` | Visun |
| Công ty TNHH Du lịch X.E Việt Nam | `xe-du-lich` | `XE_DU_LICH` | X.E Du lịch VN |
| Công ty TNHH X.E Việt Nam | `xe-vietnam` | `XE_VIETNAM` | X.E Việt Nam |

---

## 1. Công ty Cổ phần Thương mại và Dịch vụ X.E (`xe-tmdv`)

| Phòng ban | Chức danh |
|-----------|-----------|
| Ban Giám đốc | Phó giám đốc |
| Xưởng dịch vụ | Bảo vệ - Rửa xe; Cố vấn dịch vụ; Học việc; Kế toán tổng hợp; Nhân viên tạp vụ; Quản đốc Xưởng; Thợ học việc; Thợ kỹ thuật; Thủ kho; Tổ phó; Tổ trưởng |

---

## 2. Công ty TNHH Du lịch Visun (`visun`)

| Phòng ban | Chức danh |
|-----------|-----------|
| Ban Giám đốc | Giám đốc Visun + Trợ lý GĐ X.E |
| Phòng TCKT | Phó phòng TCKT |
| Phòng VTHK | Trưởng nhóm điều hành |

---

## 3. Công ty TNHH Du lịch X.E Việt Nam (`xe-du-lich`)

| Phòng ban | Chức danh |
|-----------|-----------|
| Ban Giám đốc | GĐ Du lịch + Thư ký Chủ tịch; Trợ lý Chủ tịch; Trợ lý Giám đốc X.E |
| Ban Giám sát | Giám sát dịch vụ |
| Phòng HCNS | Hành chính; Trưởng nhóm tuyển dụng |
| Phòng Marketing | Chuyên viên quay dựng; Chuyên viên sáng tạo nội dung; Chuyên viên thiết kế; Trưởng phòng MKT |
| Phòng TCKT | Kế toán công nợ; Kế toán tỉnh; Kế toán tổng hợp |
| Phòng VTHK | Chăm sóc khách hàng; Điều phối; Kinh doanh; Lái xe tuyến; Lễ tân; Nhân viên tổng đài; Trưởng bộ phận tổng đài; Trưởng ca tổng đài |

---

## 4. Công ty TNHH X.E Việt Nam (`xe-vietnam`)

| Phòng ban | Chức danh |
|-----------|-----------|
| Ban Giám đốc | Chủ tịch HĐTV; Giám đốc; Thư ký Chủ tịch; Trợ lý chủ tịch HĐTV |
| Ban Giám sát | Giám sát dịch vụ; Giám sát tuân thủ; Trưởng nhóm giám sát |
| Phòng Dự Án | Lập trình viên |
| Phòng HCNS | Bảo vệ; Chuyên viên CNTT; Chuyên viên pháp chế; Nhân viên cận vệ Chủ tịch Hội đồng thành viên; Nhân viên tạp vụ; Nhân viên Tiền lương và Phúc lợi; Trưởng nhóm tuyển dụng; Trưởng phòng HCNS; Tuyển dụng |
| Phòng QLPT | Chuyên viên quản lý phương tiện; Trưởng phòng QLPT |
| Phòng TCKT | Kế toán chuyên quản; Kế toán công nợ; Kế toán hàng hoá; Kế toán thanh toán; Kế toán thuế; Thủ quỹ; Trưởng nhóm thanh toán |
| Phòng VTHH | Admin; Bảo vệ - Rửa xe; Bốc xếp; Điều hành điều phối hàng hoá; Điều hành Lái Cont; Điều hành trung tâm; Điều hành tuyến chính; Điều hành tuyến nhánh; Điều phối; Điều phối hàng hoá; Kinh doanh; Lái tải dự phòng; Lái tải tuyến chính; Lái tải tuyến nhánh; Lái xe Container; Lái xe tải tuyến nhánh *(biến thể cách ghi trùng nội dung với “Lái tải tuyến nhánh” — một chức danh trong seed)*; Lái xe trung chuyển; Nhân viên Giám Sát dự án; Nhân viên Kinh doanh; Nhân viên lái xe trung chuyển hàng hoá; Nhân viên tổng đài; TBP Kinh doanh; Trưởng bưu cục; Trưởng nhóm điều hành; Trưởng nhóm tổng đài |
| Phòng VTHK | Admin; Bảo vệ; Điều hành tỉnh; Điều hành Trung tâm; Điều phối; Lái xe trung chuyển; Lái xe tuyến; Nhân viên rửa xe; Nhân viên tạp vụ; Nhân viên tổng đài; Phó phòng VTHK; Thực tập sinh Điều hành trung tâm; Trưởng chi nhánh |

---

## Ma trận traceability (BRD → seed)

| Mục | Pass / Fail bằng chứng |
|-----|-------------------------|
| Đủ 5 pháp nhân (holding + 4 thành viên) | Đếm `subsidiaries.length === 4` trong JSON + 1 `holding` |
| Mỗi dòng “Công ty + Phòng + Chức danh” gốc có trong JSON | So khớp thủ công hoặc script kiểm tra (khuyến nghị QA) |
| Portal hiển thị đơn vị thành viên | Sau seed + login master, API `group-member-units` trả đủ tenant |

---

## Phụ lục — bản gốc dạng bảng (TSV)

Dùng để đối chiếu nhanh với email/Excel; ký tự tab giữa các cột.

```
Công ty	Phòng ban	Chức danh hiện tại	Định hướng
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Ban Giám đốc	Phó giám đốc	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Bảo vệ - Rửa xe	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Cố vấn dịch vụ	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Học việc	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Kế toán tổng hợp	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Nhân viên tạp vụ	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Quản đốc Xưởng	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Thợ học việc	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Thợ kỹ thuật	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Thủ kho	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Tổ phó	
Công ty Cổ phần Thương mại và Dịch vụ X.E 	Xưởng dịch vụ	Tổ trưởng	
Công ty TNHH Du lịch Visun	Ban Giám đốc	Giám đốc Visun + Trợ lý GĐ X.E	
Công ty TNHH Du lịch Visun	Phòng TCKT	Phó phòng TCKT	
Công ty TNHH Du lịch Visun	Phòng VTHK	Trưởng nhóm điều hành	
Công ty TNHH Du lịch X.E Việt Nam	Ban Giám đốc	GĐ Du lịch + Thư ký Chủ tịch	
Công ty TNHH Du lịch X.E Việt Nam	Ban Giám đốc	Trợ lý Chủ tịch	
Công ty TNHH Du lịch X.E Việt Nam	Ban Giám đốc	Trợ lý Giám đốc X.E	
Công ty TNHH Du lịch X.E Việt Nam	Ban Giám sát	Giám sát dịch vụ	
Công ty TNHH Du lịch X.E Việt Nam	Phòng HCNS	Hành chính	
Công ty TNHH Du lịch X.E Việt Nam	Phòng HCNS	Trưởng nhóm tuyển dụng	
Công ty TNHH Du lịch X.E Việt Nam	Phòng Marketing	Chuyên viên quay dựng	
Công ty TNHH Du lịch X.E Việt Nam	Phòng Marketing	Chuyên viên sáng tạo nội dung	
Công ty TNHH Du lịch X.E Việt Nam	Phòng Marketing	Chuyên viên thiết kế	
Công ty TNHH Du lịch X.E Việt Nam	Phòng Marketing	Trưởng phòng MKT	
Công ty TNHH Du lịch X.E Việt Nam	Phòng TCKT	Kế toán công nợ	
Công ty TNHH Du lịch X.E Việt Nam	Phòng TCKT	Kế toán tỉnh	
Công ty TNHH Du lịch X.E Việt Nam	Phòng TCKT	Kế toán tổng hợp	
Công ty TNHH Du lịch X.E Việt Nam	Phòng VTHK	Chăm sóc khách hàng	
Công ty TNHH Du lịch X.E Việt Nam	Phòng VTHK	Điều phối	
Công ty TNHH Du lịch X.E Việt Nam	Phòng VTHK	Kinh doanh	
Công ty TNHH Du lịch X.E Việt Nam	Phòng VTHK	Lái xe tuyến	
Công ty TNHH Du lịch X.E Việt Nam	Phòng VTHK	Lễ tân	
Công ty TNHH Du lịch X.E Việt Nam	Phòng VTHK	Nhân viên tổng đài	
Công ty TNHH Du lịch X.E Việt Nam	Phòng VTHK	Trưởng bộ phận tổng đài	
Công ty TNHH Du lịch X.E Việt Nam	Phòng VTHK	Trưởng ca tổng đài	
Công ty TNHH X.E Việt Nam	Ban Giám đốc	Chủ tịch HĐTV	
Công ty TNHH X.E Việt Nam	Ban Giám đốc	Giám đốc	
Công ty TNHH X.E Việt Nam	Ban Giám đốc	Thư ký Chủ tịch	
Công ty TNHH X.E Việt Nam	Ban Giám đốc	Trợ lý chủ tịch HĐTV	
Công ty TNHH X.E Việt Nam	Ban Giám sát	Giám sát dịch vụ	
Công ty TNHH X.E Việt Nam	Ban Giám sát	Giám sát tuân thủ	
Công ty TNHH X.E Việt Nam	Ban Giám sát	Trưởng nhóm giám sát	
Công ty TNHH X.E Việt Nam	Phòng Dự Án	Lập trình viên	
Công ty TNHH X.E Việt Nam	Phòng HCNS	Bảo vệ	
Công ty TNHH X.E Việt Nam	Phòng HCNS	Chuyên viên CNTT	
Công ty TNHH X.E Việt Nam	Phòng HCNS	Chuyên viên pháp chế	
Công ty TNHH X.E Việt Nam	Phòng HCNS	Nhân viên cận vệ Chủ tịch Hội đồng thành viên	
Công ty TNHH X.E Việt Nam	Phòng HCNS	Nhân viên tạp vụ	
Công ty TNHH X.E Việt Nam	Phòng HCNS	Nhân viên Tiền lương và Phúc lợi	
Công ty TNHH X.E Việt Nam	Phòng HCNS	Trưởng nhóm tuyển dụng	
Công ty TNHH X.E Việt Nam	Phòng HCNS	Trưởng phòng HCNS	
Công ty TNHH X.E Việt Nam	Phòng HCNS	Tuyển dụng	
Công ty TNHH X.E Việt Nam	Phòng QLPT	Chuyên viên quản lý phương tiện	
Công ty TNHH X.E Việt Nam	Phòng QLPT	Trưởng phòng QLPT	
Công ty TNHH X.E Việt Nam	Phòng TCKT	Kế toán chuyên quản	
Công ty TNHH X.E Việt Nam	Phòng TCKT	Kế toán công nợ	
Công ty TNHH X.E Việt Nam	Phòng TCKT	Kế toán hàng hoá	
Công ty TNHH X.E Việt Nam	Phòng TCKT	Kế toán thanh toán 	
Công ty TNHH X.E Việt Nam	Phòng TCKT	Kế toán thuế	
Công ty TNHH X.E Việt Nam	Phòng TCKT	Thủ quỹ	
Công ty TNHH X.E Việt Nam	Phòng TCKT	Trưởng nhóm thanh toán	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Admin	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Bảo vệ - Rửa xe	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Bốc xếp	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Điều hành điều phối hàng hoá	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Điều hành Lái Cont	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Điều hành trung tâm	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Điều hành tuyến chính	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Điều hành tuyến nhánh	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Điều phối	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Điều phối hàng hoá	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Kinh doanh	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Lái tải dự phòng	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Lái tải tuyến chính	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Lái tải tuyến nhánh	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Lái xe Container	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Lái xe tải tuyến nhánh	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Lái xe trung chuyển	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Nhân viên Giám Sát dự án	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Nhân viên Kinh doanh	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Nhân viên lái xe trung chuyển hàng hoá	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Nhân viên tổng đài	
Công ty TNHH X.E Việt Nam	Phòng VTHH	TBP Kinh doanh	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Trưởng bưu cục	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Trưởng nhóm điều hành	
Công ty TNHH X.E Việt Nam	Phòng VTHH	Trưởng nhóm tổng đài	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Admin	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Bảo vệ	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Điều hành tỉnh	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Điều hành Trung tâm	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Điều phối	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Lái xe trung chuyển	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Lái xe tuyến	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Nhân viên rửa xe	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Nhân viên tạp vụ	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Nhân viên tổng đài	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Phó phòng VTHK	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Thực tập sinh Điều hành trung tâm	
Công ty TNHH X.E Việt Nam	Phòng VTHK	Trưởng chi nhánh	
```
