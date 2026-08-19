# Inventory BRD → SRS — Phân hệ XBOS (Command Center / nền tảng)

| Mục | Giá trị |
|-----|---------|
| Phiên bản inventory | 1.0-W2-CATALOG |
| Ngày khóa W1 | 2026-07-22 |
| Ngày cập nhật W2 | 2026-07-22 |
| work_item | BA-XBOS-SRS-BATECO-W2-CATALOG-01 (sau W1-SPINE-01) |
| SoT khách | `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` · `BRD_XBOS_KHACH.md` |
| Annex đội ngũ | `docs/xbos/SRS.md` · `BRD.md` · `BANG_TONG_HOP_USECASE_XBOS.md` (97) + `UC-XBOS-CAT-*` (7) |

> **Cấm wipe** hàng UF-XBOS 🟢 trên ma trận nghiệm thu. **Không** remaster 373 FR / 97 UC đầy đủ. W1 spine **giữ nguyên**; W2 chỉ **ADD** batch UF-07/10/13/14.

---

## 1. Thống kê khóa

| Chỉ tiêu | Số |
|----------|-----|
| Yêu cầu BRD khách (W1 + W2 batch) | **12** (Yêu cầu-01..12) |
| UC / FR `body_ready` | **16** (12 W1 + 4 W2) |
| UC XBOS nền tảng (catalog đội ngũ) | 97 + 7 CAT |
| Leftover sau W2 batch | CAT-01/03/04/06/07 · WF-02/05/06 · DM-* · RACI-03..06 · ORG phụ |

---

## 2. Map Yêu cầu → UC primary

### 2.1 W1 spine (`body_ready` — đóng băng)

| Yêu cầu | Mô tả ngắn | UC / FR primary W1 | UF liên quan | status |
|---------|------------|--------------------|--------------|--------|
| Yêu cầu-01 | Đăng nhập cổng điều hành | UC-XBOS-AUTH-01 | UF-XBOS-01 | `body_ready` |
| Yêu cầu-02 | Chọn / liệt kê tư cách đơn vị | UC-XBOS-TENANT-01 | UF-XBOS-01 · 11 | `body_ready` |
| Yêu cầu-03 | Phạm vi dữ liệu sau đăng nhập | UC-ECO-SCOPE-02 | UF-XBOS-11 | `body_ready` |
| Yêu cầu-04 | Danh sách / cây đơn vị thành viên | UC-XBOS-ORG-01 · UC-CC-03 | UF-XBOS-02 | `body_ready` |
| Yêu cầu-05 | Hồ sơ pháp nhân + tài liệu | UC-XBOS-ORG-03 · UC-CC-P0-02 | UF-XBOS-03 · 06 | `body_ready` |
| Yêu cầu-06 | Cổ đông theo pháp nhân | UC-CC-P0-01 | UF-XBOS-04 · 05 | `body_ready` |
| Yêu cầu-07 | Phòng ban (đơn vị tổ chức) | UC-XBOS-ORG-02 · UC-CC-P0-03 | UF-XBOS-12 | `body_ready` |
| Yêu cầu-08 | Quy trình + duyệt hộp thư | UC-XBOS-WF-01 · 03 · 04 | UF-XBOS-08 | `body_ready` |
| *(cùng YC-08 nhánh danh mục)* | Mở yêu cầu & phê duyệt danh mục HRM | UC-XBOS-CAT-02 · CAT-05 | UF-XBOS-15 · 09 | `body_ready` |

### 2.2 W2 catalog batch (`body_ready` — ADD 2026-07-22)

| Yêu cầu | Mô tả ngắn | UC / FR primary W2 | UF liên quan | status |
|---------|------------|--------------------|--------------|--------|
| Yêu cầu-09 | Ma trận RACI theo pháp nhân | UC-RACI-02 (alias UC-CC-RACI) | UF-XBOS-07 | `body_ready` |
| Yêu cầu-10 | Ma trận phân quyền Settings | UC-CC-P0-04 | UF-XBOS-13 | `body_ready` |
| Yêu cầu-11 | Catalog CC autosave (văn bản / đo lường / giá) | UC-CC-P0-05 | UF-XBOS-14 | `body_ready` |
| Yêu cầu-12 | KPI rollup đa cấp trên bảng điều hành | UC-XBOS-KPI-03 | UF-XBOS-10 | `body_ready` |

> Inventory đếm **16 FR** = 12 W1 + RACI-02 + CC-P0-04 + CC-P0-05 + KPI-03.

---

## 3. Danh sách FR (đóng băng mã)

### 3.1 W1 spine (12) — không rút

| # | Mã UC | Tên ngắn | Nhóm | FR khách |
|---|-------|----------|------|----------|
| 1 | UC-XBOS-AUTH-01 | Đăng nhập cổng | auth | FR-XBOS-AUTH-01 |
| 2 | UC-XBOS-TENANT-01 | Liệt kê / chọn tư cách đơn vị | auth | FR-XBOS-TENANT-01 |
| 3 | UC-ECO-SCOPE-02 | Phạm vi dữ liệu khi đã đăng nhập | scope | FR-ECO-SCOPE-02 |
| 4 | UC-XBOS-ORG-01 | Xem danh sách / cây đơn vị | org | FR-XBOS-ORG-01 |
| 5 | UC-XBOS-ORG-03 | Lưu hồ sơ pháp nhân (+ tài liệu) | org | FR-XBOS-ORG-03 |
| 6 | UC-CC-P0-01 | Thêm / sửa cổ đông | org | FR-CC-P0-01 |
| 7 | UC-XBOS-ORG-02 | Thêm / sửa / xóa phòng ban | org | FR-XBOS-ORG-02 |
| 8 | UC-XBOS-WF-01 | Lưu sơ đồ quy trình | WF | FR-XBOS-WF-01 |
| 9 | UC-XBOS-WF-03 | Khởi tạo phiên chạy quy trình | WF | FR-XBOS-WF-03 |
| 10 | UC-XBOS-WF-04 | Hoàn thành bước phê duyệt | WF | FR-XBOS-WF-04 |
| 11 | UC-XBOS-CAT-02 | Khởi chạy phê duyệt danh mục | catalog publish | FR-XBOS-CAT-02 |
| 12 | UC-XBOS-CAT-05 | Phê duyệt bước danh mục | catalog publish | FR-XBOS-CAT-05 |

### 3.2 W2 batch (4) — ADD

| # | Mã UC | Tên ngắn | Nhóm | FR khách | UF |
|---|-------|----------|------|----------|-----|
| 13 | UC-RACI-02 | Ma trận RACI theo pháp nhân | RACI | FR-XBOS-RACI-02 | UF-XBOS-07 |
| 14 | UC-CC-P0-04 | Ma trận phân quyền Settings | RBAC | FR-CC-P0-04 | UF-XBOS-13 |
| 15 | UC-CC-P0-05 | Catalog CC autosave | CAT/CC | FR-CC-P0-05 | UF-XBOS-14 |
| 16 | UC-XBOS-KPI-03 | KPI rollup đa cấp | KPI | FR-XBOS-KPI-03 | UF-XBOS-10 |

**Gate W2:** số «Mã UC» trên SRS khách = số «Kết quả trả về» = **16**.

---

## 4. Leftover sau W2 batch (chưa viết thân FR)

| Nhóm | Mã ví dụ | UF / lý do | status |
|------|----------|------------|--------|
| CAT còn lại | CAT-01 · 03 · 04 · 06 · 07 | hộp thư / từ chối / mẫu (UF-15 thân tạo đã gắn CAT-02; CAT-01 chi tiết optional) | `planned_W3` |
| WF còn lại | WF-02 · 05 · 06 | phiên bản / chi tiết / từ chối | `planned_W3` |
| RACI sâu | RACI-01 · 03 · 04 · 05 · 06 | catalog / ánh xạ / import / báo cáo | `planned_W3` |
| DM / master | XBOS-DM-* · MD-* | pattern phát hành chi tiết | `planned_W3` |
| ECO-SCOPE-01 | truy cập chưa đăng nhập | gom auth / chặn route | `planned_W3` |
| Holding TENANT-02/03 | tổng quan tập đoàn | bổ sung sau TENANT-01 | `planned_W3` |

---

## 5. TechSpec `ref_srs` (ghi nhận gap — owner SA)

| Artifact | `ref_srs` hiện tại | Việc SA |
|----------|--------------------|---------|
| `docs/xbos/TECHSPEC.md` | **0** khớp FR khách (trước W1 SA) | Map 12 W1 + **4 W2** → endpoint/DTO |
| `COMMAND_CENTER_P0_TECHSPEC.md` | endpoint P0 | Map UC-CC-P0-04/05 + P0-01..03 → FR khách |
| `RACI_GOVERNANCE_*` / OpenAPI raci | partial | `ref_srs` → FR-XBOS-RACI-02 |
| KPI / kpi-engine | partial | `ref_srs` → FR-XBOS-KPI-03 |
| Ecosystem TECHSPEC_HE | partial | Align ECO-SCOPE với FR-ECO-SCOPE-02 |

---

## 6. Trạng thái wave

| Wave | Mục tiêu | Status |
|------|----------|--------|
| **W1 SPINE** | Inventory + skeleton Ch.1–6 + 12 FR | **PASS** (2026-07-22) |
| **W2 CATALOG** | ADD RACI-02 · CC-P0-04 · CC-P0-05 · KPI-03 (UF-07/13/14/10) | **PASS** (2026-07-22) — evidence `ba-xbos-srs-bateco-w2-catalog-01-20260722.md` |
| W3 | CAT/WF leftover · RACI sâu · DM | `planned_W3` |
| SA | `ref_srs` TechSpec W1+W2 | **OPEN** — `SA-XBOS-TECHSPEC-W2-REF-01` |
