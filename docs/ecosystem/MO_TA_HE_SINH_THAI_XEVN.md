# TÀI LIỆU MÔ TẢ HỆ SINH THÁI (BRD — Tổng quan)

## XeVN OS — Hệ sinh thái quản trị & vận hành tập đoàn vận tải

| Thuộc tính | Giá trị |
|------------|---------|
| **Phiên bản tài liệu** | 1.1 |
| **Ngày cập nhật** | 20/05/2026 |
| **Trạng thái** | Bản trình bày / gửi khách hàng |
| **Phạm vi** | Toàn bộ hệ sinh thái XeVN OS: Portal, XBOS, HRM (Web + Mobile), Logistic, quy tắc đa tenant |
| **Đơn vị triển khai** | UNICOM — AI Software Factory |

---

## Mục lục

**[Chương 1. Tổng quan và quy mô sản phẩm](#chương-1-tổng-quan-và-quy-mô-sản-phẩm)**
- [I. Tóm tắt điều hành](#i-tóm-tắt-điều-hành)
- [II. Bối cảnh và stakeholder](#ii-bối-cảnh-và-stakeholder)
- [III. Chỉ số quy mô đã chuẩn hóa](#iii-chỉ-số-quy-mô-đã-chuẩn-hóa)
- [IV. Lộ trình hai giai đoạn](#iv-lộ-trình-hai-giai-đoạn)

**[Chương 2. Phân hệ và phạm vi chức năng](#chương-2-phân-hệ-và-phạm-vi-chức-năng)**
- [I. Bản đồ phân hệ](#i-bản-đồ-phân-hệ)
- [II. XBOS — Lõi nền tảng](#ii-xbos--lõi-nền-tảng)
- [III. Nhân sự (HRM)](#iii-nhân-sự-hrm)
- [IV. Logistic](#iv-logistic)
- [V. Danh mục cấu hình trên XBOS (183 mục)](#v-danh-mục-cấu-hình-trên-xbos-183-mục)

**[Chương 3. Kiến trúc và mô hình vận hành](#chương-3-kiến-trúc-và-mô-hình-vận-hành)**
- [I. Kiến trúc bốn tầng](#i-kiến-trúc-bốn-tầng)
- [II. Mô hình Hub-and-Spoke](#ii-mô-hình-hub-and-spoke)
- [III. Phân tầng dữ liệu](#iii-phân-tầng-dữ-liệu)
- [IV. Mô hình đa tenant (pilot)](#iv-mô-hình-đa-tenant-pilot)

**[Chương 4. Tiêu chí chấp nhận và tiến độ](#chương-4-tiêu-chí-chấp-nhận-và-tiến-độ)**

**[Phụ lục — Tài liệu tham chiếu](#phụ-lục--tài-liệu-tham-chiếu)**

---

## Chương 1. Tổng quan và quy mô sản phẩm

### I. Tóm tắt điều hành

**XeVN OS** là hệ sinh thái phần mềm **đa công ty** phục vụ tập đoàn vận tải — logistics, vận hành theo mô hình **quản trị tập trung — vận hành phân tán**:

| Thành phần | Vai trò |
|------------|---------|
| **Cổng Web (Portal / Command Center)** | Một điểm vào: bảng điều hành, KPI, hộp thư duyệt, thiết lập công ty, nhúng module |
| **XBOS** | Lõi: tổ chức, danh mục chuẩn, quy trình phê duyệt, RACI, master data, tenant scope |
| **Nhân sự (HRM)** | Web + Mobile: hồ sơ, chấm công, đơn từ, lương, tuyển dụng, thông báo |
| **Logistic** | Chuỗi kinh doanh → điều phối → vận đơn/chuyến → app lái xe (Phase 2) |

**Quy mô đã chuẩn hóa trong tài liệu nghiệp vụ** (mỗi mục có mã UC/danh mục, nhóm nghiệp vụ, kênh Web/API/Mobile):

| Chỉ tiêu | Số lượng | Ý nghĩa |
|----------|----------|---------|
| **Use case (tình huống sử dụng)** | **373** | Mọi việc người dùng làm được — đã liệt kê, phân loại, gán kênh |
| **Danh mục cấu hình trên XBOS** | **183** | 72 HRM + 111 Logistic (91 DM + 20 quy trình vận hành) |
| **Use case Phase 1 (go-live)** | **245** | XBOS 104 + HRM 119 + quản trị DM Logistic 22 |
| **Use case Phase 2** | **128** | Logistic nghiệp vụ Web ~100 + app lái xe 28 |

> Nguồn đếm: [`BANG_TONG_HOP_USECASE_XEVN.md`](BANG_TONG_HOP_USECASE_XEVN.md) · [`LO_TRINH_PHASE_1_2_XEVN.md`](LO_TRINH_PHASE_1_2_XEVN.md)

---

### II. Bối cảnh và stakeholder

| Stakeholder | Nhu cầu | Phân hệ phục vụ |
|-------------|---------|-----------------|
| **Ban Tổng Giám đốc / Điều hành tập đoàn** | Tầm nhìn đa công ty, KPI, cảnh báo, RACI | Portal Command Center, XBOS KPI |
| **Khối quản trị (Corporate / XBOS)** | Master data, phân quyền, chuẩn danh mục, workflow | XBOS |
| **Quản trị nhân sự / HR** | Vòng đời NV, chấm công, lương, tuyển dụng đa công ty | HRM Web + Mobile |
| **Kinh doanh / Điều phối / Hiện trường** | Chuỗi KD → chuyến → app lái → doanh thu/lương % | Logistic (Phase 2) |
| **CNTT & An ninh** | SSO, phân tách tenant, audit, tuân thủ | XBOS auth, BR-ECO-SCOPE-* |

**Bài toán điều hành cần giải:**

| Thách thức | Hệ quả nếu không giải quyết |
|------------|----------------------------|
| Mỗi đơn vị một công cụ rời | Không so sánh KPI, không kiểm soát danh mục chung |
| Nhân sự — xe — đơn hàng tách rời | Không chạy chuỗi **kinh doanh → vận hành** |
| Phê duyệt & RACI chưa số hóa | Trách nhiệm mơ hồ, chậm quyết định |

---

### III. Chỉ số quy mô đã chuẩn hóa

#### III.1 Tổng hợp use case theo phân hệ

| Phân hệ | Tổng UC | Trong đó | Ghi chú |
|---------|--------:|----------|---------|
| **XBOS — nền tảng thuần** | **97** | Command Center, org, RACI, workflow, master, auth | [`BANG_TONG_HOP_USECASE_XBOS.md`](../xbos/BANG_TONG_HOP_USECASE_XBOS.md) |
| **XBOS — quản trị DM Logistic** | **22** | Mã `XBOS-DM-LOG-*` | Phase 1 — khai 111 mục cấu hình |
| **XBOS — quản trị DM HRM** | **15** | Mã `XBOS-DM-HRM-*` | Nằm trong khối HRM 119 |
| **XBOS — governance duyệt DM HRM** | **7** | Mã `UC-XBOS-CAT-*` | Phase 1 |
| **Tổng trách nhiệm XBOS** | **141** | 97 + 22 + 15 + 7 | |
| **HRM — nghiệp vụ (API/Web/Mobile)** | **104** | Trừ 15 UC quản trị DM trên XBOS | Trong tổng 119 HRM |
| **HRM — tổng (gồm DM trên XBOS)** | **119** | | [`BANG_TONG_HOP_USECASE_HRM.md`](../hrm/BANG_TONG_HOP_USECASE_HRM.md) |
| **Logistic — nghiệp vụ Web** | **~100** | Mã `LG-*` | Phase 2 |
| **Logistic — app lái xe** | **28** | Mã `LG-MB-*` | Phase 2 — **bắt buộc** go-live |
| **Logistic — tổng (gồm DM trên XBOS)** | **150** | | [`BANG_TONG_HOP_USECASE_LOGISTIC.md`](../logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md) |
| **TOÀN HỆ** | **373** | Không trùng mã | [`BANG_TONG_HOP_USECASE_XEVN.md`](BANG_TONG_HOP_USECASE_XEVN.md) |

#### III.2 Phân bổ use case theo kênh triển khai

| Kênh | Phạm vi ước lượng | Ví dụ |
|------|-------------------|-------|
| **Web Portal** | Command Center, HRM Web, Logistic Web, master MD | RACI, org, workflow canvas |
| **API** | HRM API, XBOS API, đồng bộ catalog | Auth, attendance, payroll, catalog publish |
| **Mobile — HRM** | **15 UC** | Chấm công, đơn, lương, duyệt, phạm vi tenant |
| **Mobile — lái xe** | **28 UC** | 5 bước trả hàng, chứng từ, doanh thu/lương % |
| **XBOS (quản trị DM)** | **37 UC** | 22 LOG + 15 HRM trên nền XBOS |

#### III.3 Tổng hợp danh mục cấu hình (183 mục)

| Phân hệ | Danh mục nghiệp vụ | Quy trình trên XBOS | **Tổng** |
|---------|-------------------:|--------------------:|---------:|
| **HRM** | 72 | *(gộp trong 72)* | **72** |
| **Logistic** | 91 | 20 | **111** |
| **Cộng** | **163** | **20** | **183** |

---

### IV. Lộ trình hai giai đoạn

![Lộ trình hai giai đoạn](assets/lo-trinh-hai-giai-doan-xevn.png)

| | **Phase 1** | **Phase 2** |
|---|-------------|-------------|
| **Mục tiêu go-live** | XBOS + HRM 100%; khai **183/183** danh mục; Logistic **chỉ cấu hình** | Logistic Web + app lái xe end-to-end |
| **Use case phần mềm** | **245** | **128** |
| **Trong phạm vi** | 104 XBOS + 119 HRM + 22 `XBOS-DM-LOG-*` | ~100 `LG-*` + 28 `LG-MB-*` |
| **Ngoài phạm vi** | Đơn/chuyến thật, app lái xe | — |
| **Điều kiện mở P2** | HRM live · 183/183 DM phát hành · checklist “đủ DM Logistic” | |

#### IV.1 Nội dung giao Phase 1 (chi tiết)

| Khối | Nội dung | Quy mô UC | Quy mô DM |
|------|----------|----------:|----------:|
| **XBOS hoàn chỉnh** | Command Center, RACI, workflow, org, master, auth đa công ty | **104** | 18 mẫu quản trị DM chung |
| **Danh mục Nhân sự** | 72 mục + quy trình duyệt mở rộng (`UC-XBOS-CAT-*`) | 15 + 7 governance | **72** |
| **Danh mục Logistic** | 91 DM + 20 quy trình *(chưa vận hành đơn)* | **22** | **111** |
| **Nhân sự 100%** | API + Web nhúng Portal + **HRM Mobile** | **119** | — |
| **Tổng Phase 1** | | **245** | **183** |

#### IV.2 Nội dung giao Phase 2 (chi tiết)

| Nhóm | Số UC | Nội dung |
|------|------:|----------|
| Master tuyến / lộ trình / trạm phí | 8 | Bắt buộc trước điều phối |
| Kinh doanh → báo giá → hợp đồng → đơn | 14 | Đầu chuỗi |
| Điều phối + vận đơn + chuyến | 25 | Core P2 |
| Đội xe + tuân thủ + đối tác | 19 | |
| Kho + giá + đối soát | 17 | |
| **App lái xe** | **28** | 5 bước trả hàng · chứng từ · doanh thu/lương % |
| **Tổng Phase 2** | **128** | 20 quy trình P1 gắn dữ liệu thật |

**Pilot đề xuất P2:** một công ty con — chuỗi **chào giá → đơn → chuyến → app lái → chốt lương tháng**.

---

## Chương 2. Phân hệ và phạm vi chức năng

### I. Bản đồ phân hệ

| Mã | Phân hệ | Vai trò | Trách nhiệm chính | Không thay thế |
|----|---------|---------|-------------------|----------------|
| — | **Portal / Trung tâm** | Presentation + điều hành | KPI, inbox, nhúng module, lọc công ty | Nghiệp vụ chuyên sâu |
| **X-BOS** | **XBOS** | Hub — nền tảng | Catalog, workflow, org, RACI, auth | Đơn vận chuyển, bảng lương chi tiết |
| **HRM** | **Nhân sự** | Satellite | Vòng đời NV, chấm công, lương, app NV | Quản lý chuyến xe |
| — | **Logistic** | Satellite | KD → vận hành → hiện trường | Tự định nghĩa catalog gốc |
| **X-FINANCE** | **Tài chính** | Satellite (lộ trình) | Thu chi, đối soát, ngân sách | Engine workflow |
| — | **Cài đặt** | Cross-cutting | Tham số, chính sách toàn hệ | — |

*Mở rộng tương lai (BRD HLD): TRSPORT, LGTS, EXPRESS, X-SCM, X-OFFICE, CRM, X-MAINTENANCE — cùng nguyên tắc Hub-and-Spoke.*

---

### II. XBOS — Lõi nền tảng

**Mục tiêu:** **Nguồn chuẩn duy nhất** cho dữ liệu dùng chung; không thay nghiệp vụ chuyên sâu HRM/Logistic.

#### II.1 Nhóm chức năng nền tảng (97 UC thuần + 7 governance = 104 UC Phase 1)

| Nhóm | Số UC | Nội dung |
|------|------:|----------|
| Nền tảng và đồng bộ | 9 | Health, đồng bộ catalog, kiểm toán, bootstrap |
| Master data và KPI | 12 | Chức danh, NCC, KH, loại xe, rollup KPI, cảnh báo |
| Tổ chức, chức danh, phân quyền | 6 | Pháp nhân, phòng ban, ma trận quyền |
| Quy trình và phê duyệt | 9 | Canvas workflow, phiên chạy, inbox |
| Tài sản và yêu cầu tài chính | 6 | Đăng ký tài sản, yêu cầu 5 bước kế toán |
| Xác thực và phạm vi | 7 | Login Portal, tenant scope, membership |
| Command Center P0 | 8 | Cổ đông, tài liệu pháp lý, phòng ban, RBAC |
| Command Center mở rộng | 7 | Chi tiết pháp nhân, RACI, canvas |
| Quản trị RACI | 6 | Catalog hoạt động, ma trận, gán chức danh |
| Bảng điều hành | 3 | KPI / tác vụ / cảnh báo |
| Hạ tầng và cài đặt | 3 | Danh mục nền, phòng ban mẫu |
| Quản trị danh mục chung | 18 | Mẫu `XBOS-DM-01` … `XBOS-DM-18` đa phân hệ |
| Master toàn hệ & tích hợp FE | 3 | |
| **Governance duyệt DM HRM** | **7** | `UC-XBOS-CAT-01` … `07` |
| **Tổng khối XBOS Phase 1** | **104** | |

#### II.2 Command Center — giá trị Ban lãnh đạo

| Chức năng | Giá trị |
|-----------|---------|
| Cây pháp nhân và phòng ban | Nhìn một lần toàn tập đoàn |
| Ma trận RACI | Ai R/A/C/I trên từng hoạt động |
| Hồ sơ pháp lý và cổ đông | Minh bạch pháp nhân, tài liệu có phiên bản |
| Quy trình và hộp thư duyệt | Phê duyệt tập trung, không email rời |
| Nhúng Nhân sự | Quản trị HR trên cùng cổng |

---

### III. Nhân sự (HRM)

**Mục tiêu:** Vòng đời nhân sự đa công ty; tiêu thụ org/catalog từ XBOS.

#### III.1 Nhóm chức năng (119 UC)

| Nhóm | Số UC | Kênh chính |
|------|------:|------------|
| Quản trị danh mục trên XBOS | 15 | XBOS (`XBOS-DM-HRM-*`) |
| Nền tảng, quản trị, đồng bộ | 8 | API |
| Chấm công và đơn từ | 13 | API / Web / Mobile |
| Yêu cầu dịch vụ nội bộ | 6 | API / Web |
| Hộp thư thông báo | 2 | API / Web / Mobile |
| Quản lý nhân viên | 5 | API / Web |
| Lương | 6 | API / Web / Mobile |
| Tuyển dụng | 6 | API / Web |
| Hợp đồng và bảo hiểm | 7 | API / Web |
| Thay đổi metadata hồ sơ | 5 | API / Web |
| Cấu hình danh mục HRM | 9 | API / Web |
| Import / export nhân sự | 4 | API / Web |
| Công việc vận hành (tasks) | 4 | API / Web |
| Đánh giá hiệu suất | 4 | API / Web |
| Hồ sơ xe (du lịch) | 1 | API / Web |
| Nhúng Command Center | 8 | Web Portal |
| **Ứng dụng di động nhân viên** | **15** | **Mobile (Expo)** |
| **Tổng** | **119** | |

#### III.2 HRM Mobile — pilot hiện tại (15 UC, trích yếu)

| STT | Nhóm | Số UC | Mức độ |
|-----|------|------:|--------|
| 1 | Xác thực đa tenant & phiên | 3 | Bắt buộc |
| 2 | Chấm công & lịch sử | 3 | Bắt buộc |
| 3 | Đơn nghỉ / điều chỉnh chấm công | 5 | Bắt buộc |
| 4 | Phê duyệt (manager) | 2 | Bắt buộc |
| 5 | Lương & phiếu lương | 3 | Bắt buộc |
| 6 | Thông báo & hồ sơ | 3 | Khuyến nghị |
| 7 | Cài đặt, offline, sinh trắc học (khung) | 3 | Khuyến nghị |

**Quy tắc pilot:** email `@xe.vn` + mật khẩu; server trả `memberships[]`; JWT gắn `tenant_id`, `company_id`, `employee_id`; **không** hardcode tenant trên app.

---

### IV. Logistic

**Mục tiêu:** Chuỗi **kinh doanh → vận hành → hiện trường**; app lái xe **bắt buộc** khi go-live Phase 2.

![Chuỗi giá trị Logistic](assets/chuoi-gia-tri-logistic-xevn.png)

#### IV.1 Nhóm chức năng (150 UC tổng)

| Nhóm | Số UC | Giai đoạn |
|------|------:|-----------|
| Quản trị danh mục Logistic trên XBOS | 22 | **Phase 1** |
| Kinh doanh đầu chuỗi | 8 | Phase 2 |
| Master tuyến và lộ trình | 8 | Phase 2 |
| Hạ tầng xe và liên thông nhân sự | 6 | Phase 2 |
| Tổng quan điều hành | 4 | Phase 2 |
| Điều phối | 16 | Phase 2 |
| Phê duyệt | 6 | Phase 2 |
| Vận đơn và theo dõi | 9 | Phase 2 |
| Đội xe | 10 | Phase 2 |
| Đối tác | 4 | Phase 2 |
| Tuân thủ | 5 | Phase 2 |
| Khách hàng, giá, báo giá | 6 | Phase 2 |
| Kho | 8 | Phase 2 |
| Vật tư và tài sản | 3 | Phase 2 |
| Hỗ trợ thông minh | 3 | Phase 2 |
| Hệ thống | 4 | Phase 2 |
| Mobile — nền tảng | 9 | Phase 2 |
| Mobile — trả hàng (5 công đoạn) | 5 | Phase 2 |
| Mobile — chứng từ và sự cố | 8 | Phase 2 |
| Mobile — doanh thu và lương | 6 | Phase 2 |
| **Tổng** | **150** | |

---

### V. Danh mục cấu hình trên XBOS (183 mục)

#### V.1 HRM — 72 mục (12 nhóm)

| Nhóm | Số mục |
|------|------:|
| Tổ chức và pháp nhân | 6 |
| Chức danh và phân quyền | 8 |
| Biểu mẫu hồ sơ nhân viên | 12 |
| Hợp đồng, chấm công, lương | 10 |
| Tuyển dụng | 6 |
| Hồ sơ và tài liệu nhân viên | 3 |
| Hồ sơ xe (du lịch) | 9 |
| Quy trình và phê duyệt HRM | 5 |
| Master dùng chung | 4 |
| RACI và nhiệm vụ | 5 |
| Cấu hình Command Center (HRM) | 4 |
| **Tổng** | **72** |

#### V.2 Logistic — 111 mục (22 nhóm)

| Nhóm | Số mục |
|------|------:|
| Nhóm 1 — Tổ chức và phạm vi | 5 |
| Nhóm 2 — Địa điểm và hạ tầng | 4 |
| Nhóm 3 — Dịch vụ vận tải (3 cấp) | 3 |
| Nhóm 4 — Phương tiện (3 cấp) | 6 |
| Nhóm 5 — Thiết bị gắn xe (3 cấp) | 3 |
| Nhóm 6 — Công cụ và đồ bảo hộ (3 cấp) | 3 |
| Nhóm 7 — Vật tư tiêu hao (3 cấp) | 5 |
| Nhóm 8 — Khách hàng và hợp đồng | 6 |
| Nhóm 9 — Đối tác vận tải | 4 |
| Nhóm 10 — Điều phối, vận đơn, chuyến | 8 |
| Nhóm 11 — Tuân thủ và giấy tờ | 4 |
| Nhóm 12 — Giá cước, phí, tài chính | 5 |
| Nhóm 13 — Kho vận | 5 |
| Nhóm 14 — Sự cố và cảnh báo | 4 |
| Nhóm 15 — KPI, chính sách, phê duyệt | 4 |
| Nhóm 16 — Biểu mẫu và trường mở rộng | 3 |
| Nhóm 17 — Tuyến và lộ trình | 5 |
| Nhóm 18 — Trạm thu phí và chi phí tuyến | 3 |
| Nhóm 19 — Quy cách phương tiện và vòng đời xe | 3 |
| Nhóm 20 — Chính sách lái xe và lương vận hành | 4 |
| Nhóm 21 — Kinh doanh đầu chuỗi | 4 |
| Nhóm 22 — **Quy trình vận hành trên XBOS** | **20** |
| **Tổng** | **111** *(91 DM + 20 quy trình)* |

---

## Chương 3. Kiến trúc và mô hình vận hành

### I. Kiến trúc bốn tầng

![Kiến trúc bốn tầng](assets/kien-truc-bon-tang-xevn.png)

| Tầng | Thành phần | Vai trò |
|------|------------|---------|
| **Trình bày** | Portal, HRM Web, XBOS UI, HRM Mobile, App lái xe | UI theo vai trò & kênh |
| **Nghiệp vụ** | HRM API, Logistic API | Giao dịch hàng ngày |
| **Nền tảng** | XBOS API | Catalog, workflow, org, membership |
| **Dữ liệu** | PostgreSQL | Phân vùng theo tenant |

### II. Mô hình Hub-and-Spoke

![Vai trò và luồng](assets/kien-truc-vai-tro-luong-xevn.png)

| Nguyên tắc | Mô tả |
|------------|--------|
| **Ghi catalog chuẩn** | Ưu tiên tại XBOS (hoặc workflow phê duyệt rồi cam kết tại hub) |
| **Đọc tại vệ tinh** | API phiên bản hóa; cache có TTL, invalidate khi hub phát hành mới |
| **Giao dịch nghiệp vụ** | Thuộc bounded context HRM/Logistic; **tham chiếu** mã catalog từ hub |
| **Cảnh báo** | Vi phạm ngưỡng tại spoke → hội tụ Hot Point Alert trên dashboard |

### III. Phân tầng dữ liệu

| Tầng | Quản lý tại | Ví dụ |
|------|-------------|-------|
| Dùng chung tập đoàn | XBOS | Pháp nhân, RACI, membership |
| Danh mục nghiệp vụ | XBOS (theo phân hệ) | 6 nhóm trường hồ sơ NV, loại xe, mẫu tuyến |
| Quy trình phê duyệt | XBOS | 20 quy trình Logistic; duyệt mở rộng DM HRM |
| Giao dịch vận hành | HRM / Logistic | Employee, attendance, vận đơn, chuyến |

**Quy tắc governance (`docs/ecosystem/BRD.md`):**

| Mã | Tóm tắt |
|----|---------|
| BR-ECO-SCOPE-01 | Chưa đăng nhập (môi trường cho phép): system admin — phạm vi rộng |
| BR-ECO-SCOPE-02 | Đã đăng nhập: chỉ tenant/công ty được gán |
| BR-ECO-CAT-01 | Công ty con thêm trường DM: lớp mở rộng + workflow |
| BR-ECO-CAT-02 | Xóa trường DM: yêu cầu phê duyệt tập đoàn |
| BR-ECO-UX-01 | Modal nhúng Portal: phủ toàn viewport |

### IV. Mô hình đa tenant (pilot)

| Khái niệm | Mô tả |
|-----------|--------|
| Master tenant `xevn` | Holding — nhiều `company_id` |
| Member tenant `xe-du-lich` | Công ty thành viên — `employees.custom_fields.tenant_id` |
| Email | Chuẩn `@xe.vn`; prefix công ty con: `du-lich.ceo@xe.vn` |
| Portal auth | XBOS membership |
| Mobile auth | HRM `/auth/mobile/login` → memberships → JWT |

---

## Chương 4. Tiêu chí chấp nhận và tiến độ

### 4.1 Tiêu chí chấp nhận tổng thể

| # | Tiêu chí | Bằng chứng |
|---|----------|------------|
| 1 | Đủ **373** UC có mô tả và phân loại | `BANG_TONG_HOP_USECASE_XEVN.md` |
| 2 | Đủ **183** DM khai trên XBOS (Phase 1) | Seed + phiên bản phát hành |
| 3 | Chuỗi Logistic chạy thật (Phase 2) | UAT pilot 1 công ty con |
| 4 | Phân tách dữ liệu đúng tenant | Test 2 tài khoản khác công ty |
| 5 | Phê duyệt tập trung qua XBOS | Demo workflow + inbox |

### 4.2 Gate Phase 1 → mở Phase 2

- [ ] **104/104** UC khối XBOS
- [ ] **119/119** UC HRM (gồm Mobile pilot)
- [ ] **183/183** mục danh mục phát hành
- [ ] **22/22** `XBOS-DM-LOG-*` — checklist “đủ danh mục” PASS
- [ ] Không blocker P0 security / tenant scope

### 4.3 Gate Phase 2 → production Logistic

- [ ] **128/128** UC Logistic + mobile
- [ ] Pilot ≥ 1 công ty: KD → đơn → chuyến → app lái → chốt lương %
- [ ] QC Go/No-Go + residual risk

### 4.4 Giá trị cốt lõi cho XEVN

| # | Giá trị | Chỉ số |
|---|---------|--------|
| 1 | Một chuẩn — nhiều công ty | 183 DM + phạm vi tenant |
| 2 | Truy vết và kiểm soát | Audit log, phiên bản catalog |
| 3 | Chuỗi KD → vận hành | Logistic P2 trên nền P1 |
| 4 | Minh bạch với lái xe | App: doanh thu, khấu trừ, lương/chuyến |
| 5 | Mở rộng theo khung | 373 UC đã định nghĩa |

### 4.5 Tiến độ hiện tại (ước lượng 05/2026)

| Hạng mục | Trạng thái |
|----------|------------|
| Phân tích 373 UC + 183 DM | ✅ Hoàn thành |
| XBOS + Portal Command Center | 🔄 Đang hoàn thiện |
| HRM API + Web + **Mobile pilot** | 🔄 ~50% — Mobile pilot tenant du lịch |
| Logistic nghiệp vụ | 📋 Phase 2 — tài liệu & prototype |

### 4.6 Triển khai kỹ thuật (monorepo / VPS dev)

| Thành phần | Đường dẫn | Cổng |
|------------|-----------|------|
| Portal | `apps/web/web-portal` | 8088 |
| HRM Web | nhúng Portal | 8080 |
| XBOS UI | Portal | 5173 |
| HRM API | `apps/api/hrm-api` | 3001 |
| XBOS API | `apps/api/xbos-api` | 28002 |
| HRM Mobile | `apps/mobile/hrm-mobile` | Expo |

---

## Phụ lục — Tài liệu tham chiếu

| Nhóm | Tài liệu |
|------|----------|
| **Toàn hệ** | [`BRD_TONG_HOP_HE_SINH_THAI_XEVN.md`](BRD_TONG_HOP_HE_SINH_THAI_XEVN.md) |
| | [`BANG_TONG_HOP_USECASE_XEVN.md`](BANG_TONG_HOP_USECASE_XEVN.md) — **373 UC** |
| | [`LO_TRINH_PHASE_1_2_XEVN.md`](LO_TRINH_PHASE_1_2_XEVN.md) |
| | [`BRD.md`](BRD.md) — quy tắc tenant |
| **XBOS** | [`../xbos/BRD.md`](../xbos/BRD.md) · [`../xbos/BANG_TONG_HOP_USECASE_XBOS.md`](../xbos/BANG_TONG_HOP_USECASE_XBOS.md) |
| **HRM** | [`../hrm/BRD.md`](../hrm/BRD.md) · [`../hrm/BANG_TONG_HOP_USECASE_HRM.md`](../hrm/BANG_TONG_HOP_USECASE_HRM.md) |
| | [`../hrm/DANH_MUC_XBOS_CHO_HRM.md`](../hrm/DANH_MUC_XBOS_CHO_HRM.md) — **72 DM** |
| **Logistic** | [`../logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md`](../logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md) |
| | [`../logistics/DANH_MUC_XBOS_VA_USECASE_LOGISTIC.md`](../logistics/DANH_MUC_XBOS_VA_USECASE_LOGISTIC.md) — **111 DM** |
| **Gửi khách** | [`../client-delivery/00_Mo_ta_he_sinh_thai_XEVN.html`](../client-delivery/00_Mo_ta_he_sinh_thai_XEVN.html) |
| **Pilot** | [`../hrm/HUONG_DAN_DANG_NHAP_PILOT.md`](../hrm/HUONG_DAN_DANG_NHAP_PILOT.md) |

---

**Tóm tắt một câu:** XeVN OS = **373 use case** · **183 danh mục XBOS** · **245 UC Phase 1** (XBOS + HRM + khai DM Logistic) · **128 UC Phase 2** (Logistic + app lái xe) — trên nền **Portal + XBOS Hub-and-Spoke + PostgreSQL đa tenant**.
