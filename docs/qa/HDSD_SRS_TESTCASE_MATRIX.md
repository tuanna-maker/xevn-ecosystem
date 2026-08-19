# Ma trận Testcase — HDSD ↔ SRS (XBOS · HRM · Ecosystem · Mobile)

**Program:** `HDSD-P2-FULL-01` · **Work item:** `HDSD-P2-TC-MATRIX-01` v2.0
**Ngày:** 30/07/2026 · **Nguồn scan:** `docs/client-delivery/hdsd/**/*.md`

### Wave UAT overlay — `QA-HDSD-FULL-W0-W4-01` (2026-07-30)

Browser Puppeteer · `ceo@xe.vn` · U65 zero-seed · evidence `docs/qa/evidence/hdsd-uat-*-20260730.md`

**Body promoted:** `QA-HDSD-MATRIX-PROMOTE-01` (2026-07-30) — **26 rows** · **23🟢 · 3🟡** · evidence `hdsd-matrix-promote-20260730.md`
**Wave 02:** `QA-HDSD-MATRIX-PROMOTE-02` (2026-07-30) — **+25 rows** · evidence `qa-hdsd-matrix-promote-02-20260730.md`
**BF sweep promote:** `QA-HDSD-MATRIX-PROMOTE-SWEEP-02` (2026-08-01) · evidence `qa-hdsd-matrix-promote-sweep-02-20260801.md`
**BF-01 bulk promote:** `QA-HDSD-BF-01-BULK-01` (2026-08-01) — **+40🟢 · +15🟡** · evidence `qa-hdsd-bf-01-bulk-01-20260801.md`
**BF-02 bulk promote:** `QA-HDSD-BF-02-BULK-01` (2026-08-01) — **+12🟢 · +7🟡** · evidence `qa-hdsd-bf-02-bulk-01-20260801.md`
**BF-03 bulk promote:** `QA-HDSD-BF-03-BULK-01` (2026-08-01) — **+37🟢 · +22🟡** · evidence `qa-hdsd-bf-03-bulk-01-20260801.md`
**Matrix sync:** `QA-HDSD-MATRIX-SYNC-01` (2026-08-01) — header + §Coverage summary ↔ promote JSON rollup · evidence `qa-hdsd-matrix-sync-01-20260801.md`
**BF-03 profile depth:** `QA-HDSD-BF-03-PROFILE-DEPTH-01` (2026-08-01) — **+7🟢 · −7🟡** TC-028..034 · evidence `qa-hdsd-bf-03-profile-depth-01-20260801.md`

| Wave | Spot TC (representative) | Verdict | Evidence |
|------|------------------------|---------|----------|
| W0 | TC-ECO-001..008, TC-HRM-HDSD-001..005 | 🟢/🟡 | `hdsd-uat-eco-20260730.md` |
| W1 | TC-XBOS-HDSD-001 CC, 064 ĐVTV, 087 Phòng ban 🟡, 099 RBAC, 108 inbox, 132 catalog, 011 cockpit, 016 org dash | 🟢 mostly | `hdsd-uat-xbos-20260730.md` |
| W2a | TC-HRM-HDSD-004 standalone, 006–007 employees, 037 contracts, 074 attendance, 096 payroll, 106 headcount, 154 catalog | 🟢 | `hdsd-uat-hrm-standalone-20260730.md` · `:8080/hr/` · scope parity R2 `qa-hdsd-w2a-scope-parity-01-r2-20260731.md` |
| W2b | TC-HRM-HDSD-002 embed, 006–007 employees+J-HRM, 037 contracts, 055 recruitment, 074 attendance, 096 payroll, 106 headcount, 154/168 settings+reports | 🟢 | `hdsd-uat-hrm-embed-20260730.md` |
| W4 | TC-ECO-INT-01 catalog 🟢, TC-ECO-INT-02 headcount 🟢, TC-ECO-INT-03 WF 🟢 | 🟢 | `hdsd-uat-w4-20260730.md` · `qa-hdsd-w4-int-03-r4-20260731.md` |
| **Mutate spot** | TC-HDSD-03-02-01 UF-XBOS-05 holding shareholder POST+F5 | **🟢** | `qa-hdsd-mutate-ret-03-shr-20260731.md` · `:5173` U65 |
| W5 | TC-XBOS-HDSD-M01 · TC-HRM-HDSD-M01 member scope negative | 🟢 | `qa-hdsd-w5-scope-01-20260801.md` |
| W3 | Mobile Ch12 | 🟢/🟡 | `hdsd-uat-mobile-ch12-20260730.md` |
| **W3 Mobile** | `QA-HDSD-MOB-CH12-01` — Ch12 device load walk · `emulator-5554` · evidence `hdsd-uat-mobile-ch12-20260730.md` | **12🟢 · 2🟡** | adb + uiautomator |

**W5 scope promote:** `QA-HDSD-W5-SCOPE-01` (2026-08-01) — **+2🟢** · evidence `qa-hdsd-w5-scope-01-20260801.md`

**Summary:** W0–W5 + BF-01/02/03 bulk + W5 scope + **BF-03 profile depth** + **BF-03 mobile depth** promoted · **324🟢 · 40🟡 · 0⬜** (body grep TC/ECO rows · MOB-BF03-DEPTH-01: TC-MOB-020/021/022/030 →🟢 · yellow −4 vs prior 47🟡) · **360 body rows** · U65 · evidence `qa-hdsd-mob-bf03-depth-01-20260801.md`

## Quy ước ID

| Prefix | Bộ | Entry |
|--------|-----|-------|
| `TC-ECO-*` | Cổng chung — login, shell, chuyển phân hệ, liên thông W4 | portal |
| `TC-XBOS-HDSD-*` | XBOS — CC, tổ chức, WF, catalog, dashboard | standalone |
| `TC-HRM-HDSD-*` | HRM web — mọi menu/tab/dialog | **standalone \| embed \| both** |
| `TC-MOB-*` | Mobile HRM ESS | mobile |

**Quy tắc coverage:** Mỗi `###` (tab / dialog / panel) trong HDSD = ≥1 TC. Màn không có `###` con → 1 TC ở cấp `##`.

**Map SRS:** cột UF ↔ `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` · cột FR ↔ UC catalog SRS.

---

## A — Cổng chung (Ecosystem) (8 TC)

| TC ID | HDSD § | UF | FR | Entry | Mô tả / AC spot | Verdict |
|-------|--------|----|----|-------|-----------------|---------|
| TC-ECO-001 | ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE §1. Mục đích | — | FR-UC-PORTAL-AUTH | portal | 1. Mục đích | 🟢 |
| TC-ECO-002 | ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE §2. Đăng nhập Cổng → Cách vào | UF-XBOS-01 | FR-UC-PORTAL-AUTH | portal | Cách vào | 🟢 |
| TC-ECO-003 | ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE §2. Đăng nhập Cổng → Bảng Nút & chức năng | UF-XBOS-01 | FR-UC-PORTAL-AUTH | portal | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-ECO-004 | ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE §2. Đăng nhập Cổng → Persona tham chiếu | UF-XBOS-01 | FR-UC-PORTAL-AUTH | portal | Persona tham chiếu | 🟢 |
| TC-ECO-005 | ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE §3. Sau đăng nhập — chọn sản phẩm | UF-XBOS-01 | FR-UC-PORTAL-AUTH | portal | 3. Sau đăng nhập — chọn sản phẩm | 🟢 |
| TC-ECO-006 | ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE §4. Rail phân hệ (Command Center) | UF-XBOS-01 | FR-UC-PORTAL-AUTH | portal | 4. Rail phân hệ (Command Center) | 🟢 |
| TC-ECO-007 | ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE §5. Phiên làm việc & lỗi chung | UF-XBOS-01 | FR-UC-PORTAL-AUTH | portal | 5. Phiên làm việc & lỗi chung | 🟢 |
| TC-ECO-008 | ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE §6. Kiểm thử (TC-ECO) | — | FR-UC-PORTAL-AUTH | portal | 6. Kiểm thử (TC-ECO) | 🟢 |

## B — XBOS (138 TC)

| TC ID | HDSD § | UF | FR | Entry | Mô tả / AC spot | Verdict |
|-------|--------|----|----|-------|-----------------|---------|
| TC-XBOS-HDSD-001 | XBOS_CH01_COMMAND_CENTER §1.1 Command Center — Tổng quan (GROUP) → Mục đích & phân quyền | UF-XBOS-13 | FR-UC-CC-01 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-002 | XBOS_CH01_COMMAND_CENTER §1.1 Command Center — Tổng quan (GROUP) → Cách vào | — | FR-UC-CC-01 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-003 | XBOS_CH01_COMMAND_CENTER §1.1 Command Center — Tổng quan (GROUP) → Bảng Nút & chức năng | — | FR-UC-CC-01 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-004 | XBOS_CH01_COMMAND_CENTER §1.1 Command Center — Tổng quan (GROUP) → Bảng Hộp thoại — các trường | — | FR-UC-CC-01 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-005 | XBOS_CH01_COMMAND_CENTER §1.1 Command Center — Tổng quan (GROUP) → Bảng Cột danh sách | — | FR-UC-CC-01 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-006 | XBOS_CH01_COMMAND_CENTER §1.1 Command Center — Tổng quan (GROUP) → Trạng thái nghiệp vụ | — | FR-UC-CC-01 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-007 | XBOS_CH01_COMMAND_CENTER §1.1 Command Center — Tổng quan (GROUP) → Lỗi thường gặp | — | FR-UC-CC-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-008 | XBOS_CH01_COMMAND_CENTER §1.1 Command Center — Tổng quan (GROUP) → UF nghiệm thu | — | FR-UC-CC-01 | standalone | UF nghiệm thu | 🟢 |
| TC-XBOS-HDSD-009 | XBOS_CH01_COMMAND_CENTER §1.2 Rail phân hệ (XBOS vs HRM) | UF-XBOS-01 | FR-UC-CC-01 | standalone | 1.2 Rail phân hệ (XBOS vs HRM) | 🟢 |
| TC-XBOS-HDSD-010 | XBOS_CH04_DASHBOARD_VAN_HANH §4.1 Cockpit — Bảng điều hành (Executive) → Mục đích & phân quyền | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-011 | XBOS_CH04_DASHBOARD_VAN_HANH §4.1 Cockpit — Bảng điều hành (Executive) → Cách vào | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-012 | XBOS_CH04_DASHBOARD_VAN_HANH §4.1 Cockpit — Bảng điều hành (Executive) → Bảng Nút & chức năng | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-013 | XBOS_CH04_DASHBOARD_VAN_HANH §4.1 Cockpit — Bảng điều hành (Executive) → Trạng thái & lỗi | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | Trạng thái & lỗi | 🟢 |
| TC-XBOS-HDSD-014 | XBOS_CH04_DASHBOARD_VAN_HANH §4.1 Cockpit — Bảng điều hành (Executive) → UF nghiệm thu | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | UF nghiệm thu | 🟢 |
| TC-XBOS-HDSD-015 | XBOS_CH04_DASHBOARD_VAN_HANH §4.2 Dashboard Tổ chức → Mục đích | — | FR-UC-XBOS-DASH-01 | standalone | Mục đích | 🟢 |
| TC-XBOS-HDSD-016 | XBOS_CH04_DASHBOARD_VAN_HANH §4.2 Dashboard Tổ chức → Bảng Nút & chức năng | — | FR-UC-XBOS-DASH-01 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-017 | XBOS_CH04_DASHBOARD_VAN_HANH §4.2 Dashboard Tổ chức → Lỗi thường gặp | — | FR-UC-XBOS-DASH-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-018 | XBOS_CH04_DASHBOARD_VAN_HANH §4.3 Khách hàng & Đối tác → Bảng cột danh sách (mẫu) | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | Bảng cột danh sách (mẫu) | 🟢 |
| TC-XBOS-HDSD-019 | XBOS_CH04_DASHBOARD_VAN_HANH §4.3 Khách hàng & Đối tác → Nút chung | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | Nút chung | 🟢 |
| TC-XBOS-HDSD-020 | XBOS_CH04_DASHBOARD_VAN_HANH §4.4 KPI — Chính sách & Dashboard → 4.4.1 Chính sách KPI | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | 4.4.1 Chính sách KPI | 🟢 |
| TC-XBOS-HDSD-021 | XBOS_CH04_DASHBOARD_VAN_HANH §4.4 KPI — Chính sách & Dashboard → 4.4.2 KPI Dashboard | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | 4.4.2 KPI Dashboard | 🟢 |
| TC-XBOS-HDSD-022 | XBOS_CH04_DASHBOARD_VAN_HANH §4.4 KPI — Chính sách & Dashboard → Lỗi KPI | UF-XBOS-10 | FR-UC-XBOS-DASH-01 | standalone | Lỗi KPI — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-023 | XBOS_CH04_DASHBOARD_VAN_HANH §4.5 Quản trị danh mục (Catalog Governance) | UF-XBOS-09 | FR-UC-XBOS-DASH-01 | standalone | 4.5 Quản trị danh mục (Catalog Governance) | 🟢 |
| TC-XBOS-HDSD-024 | XBOS_CH04_DASHBOARD_VAN_HANH §4.6 Settings vận hành (`/dashboard/settings/*`) → Pattern CRUD (mọi màn settings) | — | FR-UC-XBOS-DASH-01 | standalone | Pattern CRUD (mọi màn settings) | 🟢 |
| TC-XBOS-HDSD-025 | XBOS_CH04_DASHBOARD_VAN_HANH §4.6 Settings vận hành (`/dashboard/settings/*`) → Lỗi settings | — | FR-UC-XBOS-DASH-01 | standalone | Lỗi settings — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-026 | XBOS_CH04_DASHBOARD_VAN_HANH §4.7 HR Dashboard stub (`/dashboard/hr`) | — | FR-UC-XBOS-DASH-01 | standalone | 4.7 HR Dashboard stub (`/dashboard/hr`) | 🟢 |
| TC-XBOS-HDSD-027 | CH02_COMMAND_CENTER_LEGACY §2.1 Màn hình Đăng nhập Cổng → Mục đích & phân quyền | UF-XBOS-01 | FR-UC-CC-01 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-028 | CH02_COMMAND_CENTER_LEGACY §2.1 Màn hình Đăng nhập Cổng → Cách vào | UF-XBOS-01 | FR-UC-CC-01 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-029 | CH02_COMMAND_CENTER_LEGACY §2.1 Màn hình Đăng nhập Cổng → Bảng Nút & chức năng | UF-XBOS-01 | FR-UC-CC-01 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-030 | CH02_COMMAND_CENTER_LEGACY §2.1 Màn hình Đăng nhập Cổng → Bảng Hộp thoại — các trường | UF-XBOS-01 | FR-UC-CC-01 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-031 | CH02_COMMAND_CENTER_LEGACY §2.1 Màn hình Đăng nhập Cổng → Bảng Cột danh sách | UF-XBOS-01 | FR-UC-CC-01 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-032 | CH02_COMMAND_CENTER_LEGACY §2.1 Màn hình Đăng nhập Cổng → Trạng thái nghiệp vụ | UF-XBOS-01 | FR-UC-CC-01 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-033 | CH02_COMMAND_CENTER_LEGACY §2.1 Màn hình Đăng nhập Cổng → Lỗi thường gặp | UF-XBOS-01 | FR-UC-CC-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-034 | CH02_COMMAND_CENTER_LEGACY §2.2 Phiên làm việc & bảo vệ route → Mục đích & phân quyền | UF-XBOS-01 | FR-UC-CC-01 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-035 | CH02_COMMAND_CENTER_LEGACY §2.2 Phiên làm việc & bảo vệ route → Cách vào | UF-XBOS-01 | FR-UC-CC-01 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-036 | CH02_COMMAND_CENTER_LEGACY §2.2 Phiên làm việc & bảo vệ route → Bảng Nút & chức năng | UF-XBOS-01 | FR-UC-CC-01 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-037 | CH02_COMMAND_CENTER_LEGACY §2.2 Phiên làm việc & bảo vệ route → Bảng Hộp thoại — các trường | UF-XBOS-01 | FR-UC-CC-01 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-038 | CH02_COMMAND_CENTER_LEGACY §2.2 Phiên làm việc & bảo vệ route → Bảng Cột danh sách | UF-XBOS-01 | FR-UC-CC-01 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-039 | CH02_COMMAND_CENTER_LEGACY §2.2 Phiên làm việc & bảo vệ route → Trạng thái nghiệp vụ | UF-XBOS-01 | FR-UC-CC-01 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-040 | CH02_COMMAND_CENTER_LEGACY §2.2 Phiên làm việc & bảo vệ route → Lỗi thường gặp | UF-XBOS-01 | FR-UC-CC-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-041 | CH02_COMMAND_CENTER_LEGACY §2.3 Command Center — Tổng quan (GROUP) → Mục đích & phân quyền | UF-XBOS-13 | FR-UC-CC-01 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-042 | CH02_COMMAND_CENTER_LEGACY §2.3 Command Center — Tổng quan (GROUP) → Cách vào | — | FR-UC-CC-01 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-043 | CH02_COMMAND_CENTER_LEGACY §2.3 Command Center — Tổng quan (GROUP) → Bảng Nút & chức năng | — | FR-UC-CC-01 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-044 | CH02_COMMAND_CENTER_LEGACY §2.3 Command Center — Tổng quan (GROUP) → Bảng Hộp thoại — các trường | — | FR-UC-CC-01 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-045 | CH02_COMMAND_CENTER_LEGACY §2.3 Command Center — Tổng quan (GROUP) → Bảng Cột danh sách | — | FR-UC-CC-01 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-046 | CH02_COMMAND_CENTER_LEGACY §2.3 Command Center — Tổng quan (GROUP) → Trạng thái nghiệp vụ | — | FR-UC-CC-01 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-047 | CH02_COMMAND_CENTER_LEGACY §2.3 Command Center — Tổng quan (GROUP) → Lỗi thường gặp | — | FR-UC-CC-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-048 | CH02_COMMAND_CENTER_LEGACY §2.4 Chuyển phân hệ trên rail (tóm tắt) | UF-XBOS-01 | FR-UC-CC-01 | standalone | 2.4 Chuyển phân hệ trên rail (tóm tắt) | 🟢 |
| TC-XBOS-HDSD-049 | CH02_COMMAND_CENTER_LEGACY §2.5 Nhúng HRM — chuyển tab & menu → Mục đích & phân quyền | UF-XBOS-13 | FR-UC-CC-01 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-050 | CH02_COMMAND_CENTER_LEGACY §2.5 Nhúng HRM — chuyển tab & menu → Cách vào | — | FR-UC-CC-01 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-051 | CH02_COMMAND_CENTER_LEGACY §2.5 Nhúng HRM — chuyển tab & menu → Bảng Nút & chức năng | — | FR-UC-CC-01 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-052 | CH02_COMMAND_CENTER_LEGACY §2.5 Nhúng HRM — chuyển tab & menu → Bảng Hộp thoại — các trường | — | FR-UC-CC-01 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-053 | CH02_COMMAND_CENTER_LEGACY §2.5 Nhúng HRM — chuyển tab & menu → Bảng Cột danh sách | — | FR-UC-CC-01 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-054 | CH02_COMMAND_CENTER_LEGACY §2.5 Nhúng HRM — chuyển tab & menu → Trạng thái nghiệp vụ | — | FR-UC-CC-01 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-055 | CH02_COMMAND_CENTER_LEGACY §2.5 Nhúng HRM — chuyển tab & menu → Lỗi thường gặp | — | FR-UC-CC-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-056 | CH02_COMMAND_CENTER_LEGACY §2.6 Liên kết kịch bản nghiệm thu | — | FR-UC-CC-01 | standalone | 2.6 Liên kết kịch bản nghiệm thu | 🟢 |
| TC-XBOS-HDSD-057 | CH03_XBOS_TO_CHUC §3.0 Khung Cài đặt hệ thống (shell chung) → Mục đích & phân quyền | UF-XBOS-13 | FR-UC-XBOS-ORG-02 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-058 | CH03_XBOS_TO_CHUC §3.0 Khung Cài đặt hệ thống (shell chung) → Cách vào | UF-HRM-04 | FR-UC-XBOS-ORG-02 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-059 | CH03_XBOS_TO_CHUC §3.0 Khung Cài đặt hệ thống (shell chung) → Bảng Nút & chức năng (shell) | UF-HRM-04 | FR-UC-XBOS-ORG-02 | standalone | Bảng Nút & chức năng (shell) — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-060 | CH03_XBOS_TO_CHUC §3.0 Khung Cài đặt hệ thống (shell chung) → Bảng Hộp thoại — các trường | UF-HRM-04 | FR-UC-XBOS-ORG-02 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-061 | CH03_XBOS_TO_CHUC §3.0 Khung Cài đặt hệ thống (shell chung) → Bảng Cột danh sách | UF-HRM-04 | FR-UC-XBOS-ORG-02 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-062 | CH03_XBOS_TO_CHUC §3.0 Khung Cài đặt hệ thống (shell chung) → Trạng thái nghiệp vụ | UF-HRM-04 | FR-UC-XBOS-ORG-02 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-063 | CH03_XBOS_TO_CHUC §3.0 Khung Cài đặt hệ thống (shell chung) → Lỗi thường gặp | UF-HRM-04 | FR-UC-XBOS-ORG-02 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-064 | CH03_XBOS_TO_CHUC §3.1 Danh sách đơn vị thành viên → Mục đích & phân quyền | UF-XBOS-02 | FR-UC-XBOS-ORG-02 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-065 | CH03_XBOS_TO_CHUC §3.1 Danh sách đơn vị thành viên → Cách vào | UF-XBOS-02 | FR-UC-XBOS-ORG-02 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-066 | CH03_XBOS_TO_CHUC §3.1 Danh sách đơn vị thành viên → Bảng Nút & chức năng | UF-XBOS-02 | FR-UC-XBOS-ORG-02 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-067 | CH03_XBOS_TO_CHUC §3.1 Danh sách đơn vị thành viên → Bảng Hộp thoại — các trường | UF-XBOS-02 | FR-UC-XBOS-ORG-02 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-068 | CH03_XBOS_TO_CHUC §3.1 Danh sách đơn vị thành viên → Bảng Cột danh sách | UF-XBOS-02 | FR-UC-XBOS-ORG-02 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-069 | CH03_XBOS_TO_CHUC §3.1 Danh sách đơn vị thành viên → Trạng thái nghiệp vụ | UF-XBOS-02 | FR-UC-XBOS-ORG-02 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-070 | CH03_XBOS_TO_CHUC §3.1 Danh sách đơn vị thành viên → Lỗi thường gặp | UF-XBOS-02 | FR-UC-XBOS-ORG-02 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-071 | CH03_XBOS_TO_CHUC §3.2 Hồ sơ pháp nhân — form chi tiết → Mục đích & phân quyền | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-072 | CH03_XBOS_TO_CHUC §3.2 Hồ sơ pháp nhân — form chi tiết → Cách vào | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-073 | CH03_XBOS_TO_CHUC §3.2 Hồ sơ pháp nhân — form chi tiết → Bảng Nút & chức năng | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-074 | CH03_XBOS_TO_CHUC §3.2 Hồ sơ pháp nhân — form chi tiết → Bảng Hộp thoại — các trường | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-075 | CH03_XBOS_TO_CHUC §3.2 Hồ sơ pháp nhân — form chi tiết → Bảng Cột danh sách | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-076 | CH03_XBOS_TO_CHUC §3.2 Hồ sơ pháp nhân — form chi tiết → Trạng thái nghiệp vụ | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-077 | CH03_XBOS_TO_CHUC §3.2 Hồ sơ pháp nhân — form chi tiết → Lỗi thường gặp | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-078 | CH03_XBOS_TO_CHUC §3.3 Tab Nhiệm vụ & RACI (trên hồ sơ pháp nhân) → Mục đích & phân quyền | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-079 | CH03_XBOS_TO_CHUC §3.3 Tab Nhiệm vụ & RACI (trên hồ sơ pháp nhân) → Cách vào | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-080 | CH03_XBOS_TO_CHUC §3.3 Tab Nhiệm vụ & RACI (trên hồ sơ pháp nhân) → Bảng Nút & chức năng | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-081 | CH03_XBOS_TO_CHUC §3.3 Tab Nhiệm vụ & RACI (trên hồ sơ pháp nhân) → Bảng Hộp thoại — các trường | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-082 | CH03_XBOS_TO_CHUC §3.3 Tab Nhiệm vụ & RACI (trên hồ sơ pháp nhân) → Bảng Cột danh sách | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-083 | CH03_XBOS_TO_CHUC §3.3 Tab Nhiệm vụ & RACI (trên hồ sơ pháp nhân) → Trạng thái nghiệp vụ | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-084 | CH03_XBOS_TO_CHUC §3.3 Tab Nhiệm vụ & RACI (trên hồ sơ pháp nhân) → Lỗi thường gặp | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-085 | CH03_XBOS_TO_CHUC §3.4 Hệ thống Phòng/Ban (khung tập đoàn) → Mục đích & phân quyền | UF-XBOS-12 | FR-UC-XBOS-ORG-02 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-086 | CH03_XBOS_TO_CHUC §3.4 Hệ thống Phòng/Ban (khung tập đoàn) → Cách vào | UF-XBOS-12 | FR-UC-XBOS-ORG-02 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-087 | CH03_XBOS_TO_CHUC §3.4 Hệ thống Phòng/Ban (khung tập đoàn) → Bảng Nút & chức năng | UF-XBOS-12 | FR-UC-XBOS-ORG-02 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-088 | CH03_XBOS_TO_CHUC §3.4 Hệ thống Phòng/Ban (khung tập đoàn) → Bảng Hộp thoại — các trường | UF-XBOS-12 | FR-UC-XBOS-ORG-02 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-089 | CH03_XBOS_TO_CHUC §3.4 Hệ thống Phòng/Ban (khung tập đoàn) → Bảng Cột danh sách — Danh mục khung | UF-XBOS-09 | FR-UC-XBOS-ORG-02 | standalone | Bảng Cột danh sách — Danh mục khung | 🟢 |
| TC-XBOS-HDSD-090 | CH03_XBOS_TO_CHUC §3.4 Hệ thống Phòng/Ban (khung tập đoàn) → Trạng thái nghiệp vụ | UF-XBOS-12 | FR-UC-XBOS-ORG-02 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-091 | CH03_XBOS_TO_CHUC §3.4 Hệ thống Phòng/Ban (khung tập đoàn) → Lỗi thường gặp | UF-XBOS-12 | FR-UC-XBOS-ORG-02 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-092 | CH03_XBOS_TO_CHUC §3.5 Phòng/Ban pháp nhân (cây theo công ty) → Mục đích & phân quyền | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-093 | CH03_XBOS_TO_CHUC §3.5 Phòng/Ban pháp nhân (cây theo công ty) → Cách vào | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-094 | CH03_XBOS_TO_CHUC §3.5 Phòng/Ban pháp nhân (cây theo công ty) → Bảng Nút & chức năng | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-095 | CH03_XBOS_TO_CHUC §3.5 Phòng/Ban pháp nhân (cây theo công ty) → Bảng Hộp thoại — các trường | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-096 | CH03_XBOS_TO_CHUC §3.5 Phòng/Ban pháp nhân (cây theo công ty) → Bảng Cột danh sách | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Bảng Cột danh sách | 🟢 |
| TC-XBOS-HDSD-097 | CH03_XBOS_TO_CHUC §3.5 Phòng/Ban pháp nhân (cây theo công ty) → Trạng thái nghiệp vụ | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-098 | CH03_XBOS_TO_CHUC §3.5 Phòng/Ban pháp nhân (cây theo công ty) → Lỗi thường gặp | UF-XBOS-03 | FR-UC-XBOS-ORG-02 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-099 | CH03_XBOS_TO_CHUC §3.6 Hệ thống phân quyền (RBAC) → Mục đích & phân quyền | UF-XBOS-13 | FR-UC-XBOS-ORG-02 | standalone | Mục đích & phân quyền | 🟢 |
| TC-XBOS-HDSD-100 | CH03_XBOS_TO_CHUC §3.6 Hệ thống phân quyền (RBAC) → Cách vào | UF-XBOS-13 | FR-UC-XBOS-ORG-02 | standalone | Cách vào | 🟢 |
| TC-XBOS-HDSD-101 | CH03_XBOS_TO_CHUC §3.6 Hệ thống phân quyền (RBAC) → Bảng Nút & chức năng | UF-XBOS-13 | FR-UC-XBOS-ORG-02 | standalone | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-XBOS-HDSD-102 | CH03_XBOS_TO_CHUC §3.6 Hệ thống phân quyền (RBAC) → Bảng Hộp thoại — các trường | UF-XBOS-13 | FR-UC-XBOS-ORG-02 | standalone | Bảng Hộp thoại — các trường — verify fields + Lưu + F5 | 🟢 |
| TC-XBOS-HDSD-103 | CH03_XBOS_TO_CHUC §3.6 Hệ thống phân quyền (RBAC) → Bảng Cột danh sách — Ma trận quyền | UF-XBOS-13 | FR-UC-XBOS-ORG-02 | standalone | Bảng Cột danh sách — Ma trận quyền | 🟢 |
| TC-XBOS-HDSD-104 | CH03_XBOS_TO_CHUC §3.6 Hệ thống phân quyền (RBAC) → Trạng thái nghiệp vụ — Phạm vi dữ liệu | UF-XBOS-13 | FR-UC-XBOS-ORG-02 | standalone | Trạng thái nghiệp vụ — Phạm vi dữ liệu | 🟢 |
| TC-XBOS-HDSD-105 | CH03_XBOS_TO_CHUC §3.6 Hệ thống phân quyền (RBAC) → Lỗi thường gặp | UF-XBOS-13 | FR-UC-XBOS-ORG-02 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-XBOS-HDSD-106 | CH03_XBOS_TO_CHUC §3.7 Tóm tắt luồng nghiệp vụ khuyến nghị | UF-HRM-04 | FR-UC-XBOS-ORG-02 | standalone | 3.7 Tóm tắt luồng nghiệp vụ khuyến nghị | 🟢 |
| TC-XBOS-HDSD-107 | CH03_XBOS_TO_CHUC §3.8 Liên kết kịch bản nghiệm thu | UF-HRM-04 | FR-UC-XBOS-ORG-02 | standalone | 3.8 Liên kết kịch bản nghiệm thu | 🟢 |
| TC-XBOS-HDSD-108 | CH04_XBOS_WF_CAT_KPI §4.1 Hộp thư Workflow (Action Cards) → Mục đích | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Mục đích | 🟢 |
| TC-XBOS-HDSD-109 | CH04_XBOS_WF_CAT_KPI §4.1 Hộp thư Workflow (Action Cards) → Điều hướng | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Điều hướng | 🟢 |
| TC-XBOS-HDSD-110 | CH04_XBOS_WF_CAT_KPI §4.1 Hộp thư Workflow (Action Cards) → Bảng nút & chức năng | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Bảng nút & chức năng | 🟢 |
| TC-XBOS-HDSD-111 | CH04_XBOS_WF_CAT_KPI §4.1 Hộp thư Workflow (Action Cards) → Bảng cột / thông tin trên thẻ | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Bảng cột / thông tin trên thẻ | 🟢 |
| TC-XBOS-HDSD-112 | CH04_XBOS_WF_CAT_KPI §4.1 Hộp thư Workflow (Action Cards) → Panel Chi tiết nhiệm vụ | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Panel Chi tiết nhiệm vụ | 🟢 |
| TC-XBOS-HDSD-113 | CH04_XBOS_WF_CAT_KPI §4.1 Hộp thư Workflow (Action Cards) → Trạng thái nghiệp vụ | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-114 | CH04_XBOS_WF_CAT_KPI §4.1 Hộp thư Workflow (Action Cards) → Lỗi thường gặp | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟡 |
| TC-XBOS-HDSD-115 | CH04_XBOS_WF_CAT_KPI §4.2 Thiết kế quy trình (Canvas Workflow) → Mục đích | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Mục đích | 🟢 |
| TC-XBOS-HDSD-116 | CH04_XBOS_WF_CAT_KPI §4.2 Thiết kế quy trình (Canvas Workflow) → Điều hướng | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Điều hướng | 🟢 |
| TC-XBOS-HDSD-117 | CH04_XBOS_WF_CAT_KPI §4.2 Thiết kế quy trình (Canvas Workflow) → Bảng nút & chức năng — Danh sách | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Bảng nút & chức năng — Danh sách | 🟢 |
| TC-XBOS-HDSD-118 | CH04_XBOS_WF_CAT_KPI §4.2 Thiết kế quy trình (Canvas Workflow) → Bảng cột — Danh sách quy trình | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Bảng cột — Danh sách quy trình | 🟢 |
| TC-XBOS-HDSD-119 | CH04_XBOS_WF_CAT_KPI §4.2 Thiết kế quy trình (Canvas Workflow) → Bảng nút & chức năng — Canvas chi tiết | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Bảng nút & chức năng — Canvas chi tiết | 🟢 |
| TC-XBOS-HDSD-120 | CH04_XBOS_WF_CAT_KPI §4.2 Thiết kế quy trình (Canvas Workflow) → Trường cấu hình quy trình (form chi tiết) | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Trường cấu hình quy trình (form chi tiết) | 🟢 |
| TC-XBOS-HDSD-121 | CH04_XBOS_WF_CAT_KPI §4.2 Thiết kế quy trình (Canvas Workflow) → Trạng thái nghiệp vụ | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-122 | CH04_XBOS_WF_CAT_KPI §4.2 Thiết kế quy trình (Canvas Workflow) → Lỗi thường gặp | UF-XBOS-08 | FR-UC-XBOS-WF-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟡 |
| TC-XBOS-HDSD-123 | CH04_XBOS_WF_CAT_KPI §4.3 Ma trận RACI → Mục đích | UF-XBOS-07 | FR-UC-XBOS-WF-01 | standalone | Mục đích | 🟢 |
| TC-XBOS-HDSD-124 | CH04_XBOS_WF_CAT_KPI §4.3 Ma trận RACI → Điều hướng | UF-XBOS-07 | FR-UC-XBOS-WF-01 | standalone | Điều hướng | 🟢 |
| TC-XBOS-HDSD-125 | CH04_XBOS_WF_CAT_KPI §4.3 Ma trận RACI → Bảng tab con | UF-XBOS-07 | FR-UC-XBOS-WF-01 | standalone | Bảng tab con | 🟢 |
| TC-XBOS-HDSD-126 | CH04_XBOS_WF_CAT_KPI §4.3 Ma trận RACI → Bảng nút & chức năng | UF-XBOS-07 | FR-UC-XBOS-WF-01 | standalone | Bảng nút & chức năng | 🟢 |
| TC-XBOS-HDSD-127 | CH04_XBOS_WF_CAT_KPI §4.3 Ma trận RACI → Bảng cột — Danh mục hoạt động | UF-XBOS-07 | FR-UC-XBOS-WF-01 | standalone | Bảng cột — Danh mục hoạt động | 🟢 |
| TC-XBOS-HDSD-128 | CH04_XBOS_WF_CAT_KPI §4.3 Ma trận RACI → Bảng cột — Ma trận RACI | UF-XBOS-07 | FR-UC-XBOS-WF-01 | standalone | Bảng cột — Ma trận RACI | 🟢 |
| TC-XBOS-HDSD-129 | CH04_XBOS_WF_CAT_KPI §4.3 Ma trận RACI → Thẻ thống kê (khi tải thành công) | UF-XBOS-07 | FR-UC-XBOS-WF-01 | standalone | Thẻ thống kê (khi tải thành công) | 🟢 |
| TC-XBOS-HDSD-130 | CH04_XBOS_WF_CAT_KPI §4.3 Ma trận RACI → Trạng thái nghiệp vụ | UF-XBOS-07 | FR-UC-XBOS-WF-01 | standalone | Trạng thái nghiệp vụ | 🟢 |
| TC-XBOS-HDSD-131 | CH04_XBOS_WF_CAT_KPI §4.3 Ma trận RACI → Lỗi thường gặp | UF-XBOS-07 | FR-UC-XBOS-WF-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟡 |
| TC-XBOS-HDSD-132 | CH04_XBOS_WF_CAT_KPI §4.4 Danh mục tập đoàn & đồng bộ → 4.4.1 Áp dụng danh mục HRM sang ĐVTV | UF-XBOS-09 | FR-UC-XBOS-WF-01 | standalone | 4.4.1 Áp dụng danh mục HRM sang ĐVTV | 🟢 |
| TC-XBOS-HDSD-133 | CH04_XBOS_WF_CAT_KPI §4.4 Danh mục tập đoàn & đồng bộ → 4.4.2 Phê duyệt bổ sung danh mục (Governance) | UF-XBOS-09 | FR-UC-XBOS-WF-01 | standalone | 4.4.2 Phê duyệt bổ sung danh mục (Governance) | 🟢 |
| TC-XBOS-HDSD-134 | CH04_XBOS_WF_CAT_KPI §4.5 Chỉ số KPI trên Bảng điều khiển → Mục đích | UF-XBOS-10 | FR-UC-XBOS-WF-01 | standalone | Mục đích | 🟢 |
| TC-XBOS-HDSD-135 | CH04_XBOS_WF_CAT_KPI §4.5 Chỉ số KPI trên Bảng điều khiển → Vị trí | UF-XBOS-10 | FR-UC-XBOS-WF-01 | standalone | Vị trí | 🟢 |
| TC-XBOS-HDSD-136 | CH04_XBOS_WF_CAT_KPI §4.5 Chỉ số KPI trên Bảng điều khiển → Thành phần hiển thị | UF-XBOS-10 | FR-UC-XBOS-WF-01 | standalone | Thành phần hiển thị | 🟢 |
| TC-XBOS-HDSD-137 | CH04_XBOS_WF_CAT_KPI §4.5 Chỉ số KPI trên Bảng điều khiển → Trạng thái | UF-XBOS-10 | FR-UC-XBOS-WF-01 | standalone | Trạng thái | 🟢 |
| TC-XBOS-HDSD-138 | CH04_XBOS_WF_CAT_KPI §4.5 Chỉ số KPI trên Bảng điều khiển → Lỗi thường gặp | UF-XBOS-10 | FR-UC-XBOS-WF-01 | standalone | Lỗi thường gặp — reproduce + recovery path | 🟡 |

## C — HRM Web (176 TC)

| TC ID | HDSD § | UF | FR | Entry | Mô tả / AC spot | Verdict |
|-------|--------|----|----|-------|-----------------|---------|
| TC-HRM-HDSD-001 | HRM_CH00_VAO_UNG_DUNG §0.1 Hai cách mở HRM Web | — | FR-UC-HRM-20 | both | 0.1 Hai cách mở HRM Web | 🟢 |
| TC-HRM-HDSD-002 | HRM_CH00_VAO_UNG_DUNG §0.2 HRM nhúng — cách vào → Bảng menu sidebar HRM (embed & standalone giống nhau) | UF-HRM-MENU-01 | FR-UC-HRM-20 | both | Bảng menu sidebar HRM (embed & standalone giống nhau) | 🟢 |
| TC-HRM-HDSD-003 | HRM_CH00_VAO_UNG_DUNG §0.2 HRM nhúng — cách vào → Nút shell (chỉ embed) | UF-HRM-MENU-01 | FR-UC-HRM-20 | both | Nút shell (chỉ embed) | 🟡 |
| TC-HRM-HDSD-004 | HRM_CH00_VAO_UNG_DUNG §0.3 HRM standalone — cách vào | UF-HRM-MENU-01 | FR-UC-HRM-20 | both | 0.3 HRM standalone — cách vào | 🟢 |
| TC-HRM-HDSD-005 | HRM_CH00_VAO_UNG_DUNG §0.4 Trạng thái & lỗi (HRM) | — | FR-UC-HRM-20 | both | 0.4 Trạng thái & lỗi (HRM) | 🟡 |
| TC-HRM-HDSD-006 | CH05_HRM_NHAN_SU §5.1 Danh sách nhân viên → Mục đích | UF-HRM-01 | FR-UC-HRM-21 | both | Mục đích | 🟢 |
| TC-HRM-HDSD-007 | CH05_HRM_NHAN_SU §5.1 Danh sách nhân viên → Điều hướng | UF-HRM-01 | FR-UC-HRM-21 | both | Điều hướng | 🟢 |
| TC-HRM-HDSD-008 | CH05_HRM_NHAN_SU §5.1 Danh sách nhân viên → Tiêu đề trang | UF-HRM-01 | FR-UC-HRM-21 | both | Tiêu đề trang | 🟢 |
| TC-HRM-HDSD-009 | CH05_HRM_NHAN_SU §5.1 Danh sách nhân viên → Bảng nút & chức năng (thanh tiêu đề) | UF-HRM-01 | FR-UC-HRM-21 | both | Bảng nút & chức năng (thanh tiêu đề) | 🟢 |
| TC-HRM-HDSD-010 | CH05_HRM_NHAN_SU §5.1 Danh sách nhân viên → Bộ lọc | UF-HRM-01 | FR-UC-HRM-21 | both | Bộ lọc | 🟡 |
| TC-HRM-HDSD-011 | CH05_HRM_NHAN_SU §5.1 Danh sách nhân viên → Bảng cột danh sách | UF-HRM-01 | FR-UC-HRM-21 | both | Bảng cột danh sách | 🟢 |
| TC-HRM-HDSD-012 | CH05_HRM_NHAN_SU §5.1 Danh sách nhân viên → Hành vi bảng | UF-HRM-01 | FR-UC-HRM-21 | both | Hành vi bảng | 🟢 |
| TC-HRM-HDSD-013 | CH05_HRM_NHAN_SU §5.1 Danh sách nhân viên → Trạng thái nghiệp vụ | UF-HRM-01 | FR-UC-HRM-21 | both | Trạng thái nghiệp vụ | 🟢 |
| TC-HRM-HDSD-014 | CH05_HRM_NHAN_SU §5.1 Danh sách nhân viên → Lỗi thường gặp | UF-HRM-01 | FR-UC-HRM-21 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-015 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Mục đích | UF-HRM-03 | FR-UC-HRM-21 | both | Mục đích | 🟢 |
| TC-HRM-HDSD-016 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Mở hộp thoại | UF-HRM-03 | FR-UC-HRM-21 | both | Mở hộp thoại | 🟢 |
| TC-HRM-HDSD-017 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Tab hộp thoại | UF-HRM-03 | FR-UC-HRM-21 | both | Tab hộp thoại | 🟢 |
| TC-HRM-HDSD-018 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Bảng trường — Tab Thông tin cơ bản | UF-HRM-03 | FR-UC-HRM-21 | both | Bảng trường — Tab Thông tin cơ bản | 🟢 |
| TC-HRM-HDSD-019 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Bảng trường — Tab Cá nhân (khi bật) | UF-HRM-03 | FR-UC-HRM-21 | both | Bảng trường — Tab Cá nhân (khi bật) | 🟢 |
| TC-HRM-HDSD-020 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Bảng trường — Tab Công việc (khi bật) | UF-HRM-03 | FR-UC-HRM-21 | both | Bảng trường — Tab Công việc (khi bật) | 🟢 |
| TC-HRM-HDSD-021 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Bảng trường — Tab Tài chính (khi bật) | UF-HRM-03 | FR-UC-HRM-21 | both | Bảng trường — Tab Tài chính (khi bật) | 🟢 |
| TC-HRM-HDSD-022 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Nút chân hộp thoại | UF-HRM-03 | FR-UC-HRM-21 | both | Nút chân hộp thoại | 🟢 |
| TC-HRM-HDSD-023 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Trạng thái | UF-HRM-03 | FR-UC-HRM-21 | both | Trạng thái | 🟢 |
| TC-HRM-HDSD-024 | CH05_HRM_NHAN_SU §5.2 Hộp thoại Thêm / Chỉnh sửa nhân viên → Lỗi thường gặp | UF-HRM-03 | FR-UC-HRM-21 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-025 | CH05_HRM_NHAN_SU §5.3 Xóa mềm nhân viên → Mục đích | — | FR-UC-HRM-21 | both | Mục đích | 🟢 |
| TC-HRM-HDSD-026 | CH05_HRM_NHAN_SU §5.4 Hồ sơ nhân viên (chi tiết) → Mục đích | UF-HRM-01 | FR-UC-HRM-21 | both | Mục đích | 🟢 |
| TC-HRM-HDSD-027 | CH05_HRM_NHAN_SU §5.4 Hồ sơ nhân viên (chi tiết) → Điều hướng | UF-HRM-01 | FR-UC-HRM-21 | both | Điều hướng | 🟢 |
| TC-HRM-HDSD-028 | CH05_HRM_NHAN_SU §5.4 Hồ sơ nhân viên (chi tiết) → Header | UF-HRM-01 | FR-UC-HRM-21 | both | Header | 🟢 |
| TC-HRM-HDSD-029 | CH05_HRM_NHAN_SU §5.4 Hồ sơ nhân viên (chi tiết) → Dải tab — Nhóm Cốt lõi (luôn hiển thị) | UF-HRM-01 | FR-UC-HRM-21 | both | Dải tab — Nhóm Cốt lõi (luôn hiển thị) | 🟢 |
| TC-HRM-HDSD-030 | CH05_HRM_NHAN_SU §5.4 Hồ sơ nhân viên (chi tiết) → Nhóm tab mở rộng (popover) | UF-HRM-01 | FR-UC-HRM-21 | both | Nhóm tab mở rộng (popover) | 🟢 |
| TC-HRM-HDSD-031 | CH05_HRM_NHAN_SU §5.4 Hồ sơ nhân viên (chi tiết) → Tab Thông tin chung — các khối | UF-HRM-01 | FR-UC-HRM-21 | both | Tab Thông tin chung — các khối | 🟢 |
| TC-HRM-HDSD-032 | CH05_HRM_NHAN_SU §5.4 Hồ sơ nhân viên (chi tiết) → Phân quyền xem nhạy cảm | UF-XBOS-13 | FR-UC-HRM-21 | both | Phân quyền xem nhạy cảm | 🟢 |
| TC-HRM-HDSD-033 | CH05_HRM_NHAN_SU §5.4 Hồ sơ nhân viên (chi tiết) → Trạng thái hồ sơ | UF-HRM-01 | FR-UC-HRM-21 | both | Trạng thái hồ sơ | 🟢 |
| TC-HRM-HDSD-034 | CH05_HRM_NHAN_SU §5.4 Hồ sơ nhân viên (chi tiết) → Lỗi thường gặp | UF-HRM-01 | FR-UC-HRM-21 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-035 | CH05_HRM_NHAN_SU §5.5 Liên kết dữ liệu & danh mục | UF-XBOS-09 | FR-UC-HRM-21 | both | 5.5 Liên kết dữ liệu & danh mục | 🟢 |
| TC-HRM-HDSD-036 | CH06_HRM_HD_BH §1. Giới thiệu chương | — | FR-UC-HRM-25 | both | 1. Giới thiệu chương | 🟢 |
| TC-HRM-HDSD-037 | CH06_HRM_HD_BH §2. Hợp đồng lao động → 2.1. Tổng quan màn hình | UF-HRM-02 | FR-UC-HRM-25 | both | 2.1. Tổng quan màn hình | 🟢 |
| TC-HRM-HDSD-038 | CH06_HRM_HD_BH §2. Hợp đồng lao động → 2.2. Bộ lọc nâng cao | UF-HRM-02 | FR-UC-HRM-25 | both | 2.2. Bộ lọc nâng cao | 🟡 |
| TC-HRM-HDSD-039 | CH06_HRM_HD_BH §2. Hợp đồng lao động → 2.3. Hộp thoại — Thêm / Sửa hợp đồng | UF-HRM-02 | FR-UC-HRM-25 | both | 2.3. Hộp thoại — Thêm / Sửa hợp đồng — verify fields + Lưu + F5 | 🟢 |
| TC-HRM-HDSD-040 | CH06_HRM_HD_BH §2. Hợp đồng lao động → 2.4. Hộp thoại — Xem hợp đồng | UF-HRM-02 | FR-UC-HRM-25 | both | 2.4. Hộp thoại — Xem hợp đồng — verify fields + Lưu + F5 | 🟡 |
| TC-HRM-HDSD-041 | CH06_HRM_HD_BH §2. Hợp đồng lao động → 2.5. Xóa hợp đồng | UF-HRM-02 | FR-UC-HRM-25 | both | 2.5. Xóa hợp đồng | 🟢 |
| TC-HRM-HDSD-042 | CH06_HRM_HD_BH §2. Hợp đồng lao động → 2.6. Trạng thái nghiệp vụ — Hợp đồng | UF-HRM-02 | FR-UC-HRM-25 | both | 2.6. Trạng thái nghiệp vụ — Hợp đồng | 🟡 |
| TC-HRM-HDSD-043 | CH06_HRM_HD_BH §2. Hợp đồng lao động → 2.7. Lỗi thường gặp — Hợp đồng | UF-HRM-02 | FR-UC-HRM-25 | both | 2.7. Lỗi thường gặp — Hợp đồng — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-044 | CH06_HRM_HD_BH §3. Bảo hiểm → 3.1. Tổng quan màn hình | UF-HRM-04 | FR-UC-HRM-25 | both | 3.1. Tổng quan màn hình | 🟢 |
| TC-HRM-HDSD-045 | CH06_HRM_HD_BH §3. Bảo hiểm → 3.2. Panel — Chính sách bảo hiểm (master) | UF-HRM-04 | FR-UC-HRM-25 | both | 3.2. Panel — Chính sách bảo hiểm (master) | 🟢 |
| TC-HRM-HDSD-046 | CH06_HRM_HD_BH §3. Bảo hiểm → 3.3. Cảnh báo & thẻ tổng hợp | UF-HRM-04 | FR-UC-HRM-25 | both | 3.3. Cảnh báo & thẻ tổng hợp | 🟢 |
| TC-HRM-HDSD-047 | CH06_HRM_HD_BH §3. Bảo hiểm → 3.4. Dải lọc loại & trạng thái | UF-HRM-04 | FR-UC-HRM-25 | both | 3.4. Dải lọc loại & trạng thái | 🟡 |
| TC-HRM-HDSD-048 | CH06_HRM_HD_BH §3. Bảo hiểm → 3.5. Bảng tham gia bảo hiểm (nhân viên) | UF-HRM-04 | FR-UC-HRM-25 | both | 3.5. Bảng tham gia bảo hiểm (nhân viên) | 🟢 |
| TC-HRM-HDSD-049 | CH06_HRM_HD_BH §3. Bảo hiểm → 3.6. Hộp thoại — Thêm / Sửa bảo hiểm nhân viên | UF-HRM-03 | FR-UC-HRM-25 | both | 3.6. Hộp thoại — Thêm / Sửa bảo hiểm nhân viên — verify fields + Lưu + F5 | 🟢 |
| TC-HRM-HDSD-050 | CH06_HRM_HD_BH §3. Bảo hiểm → 3.7. Hộp thoại — Xem bảo hiểm | UF-HRM-04 | FR-UC-HRM-25 | both | 3.7. Hộp thoại — Xem bảo hiểm — verify fields + Lưu + F5 | 🟡 |
| TC-HRM-HDSD-051 | CH06_HRM_HD_BH §3. Bảo hiểm → 3.8. Trạng thái nghiệp vụ — Bảo hiểm | UF-HRM-04 | FR-UC-HRM-25 | both | 3.8. Trạng thái nghiệp vụ — Bảo hiểm | 🟡 |
| TC-HRM-HDSD-052 | CH06_HRM_HD_BH §3. Bảo hiểm → 3.9. Lỗi thường gặp — Bảo hiểm | UF-HRM-04 | FR-UC-HRM-25 | both | 3.9. Lỗi thường gặp — Bảo hiểm — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-053 | CH06_HRM_HD_BH §4. Liên kết kiểm thử | — | FR-UC-HRM-25 | both | 4. Liên kết kiểm thử | 🟢 |
| TC-HRM-HDSD-054 | CH07_HRM_TUYEN_DUNG §1. Giới thiệu | — | FR-UC-HRM-22 | both | 1. Giới thiệu | 🟢 |
| TC-HRM-HDSD-055 | CH07_HRM_TUYEN_DUNG §2. Tab Tổng quan → 2.1. Sub-tab Dashboard / Bảng Kanban | UF-HRM-12 | FR-UC-HRM-22 | both | 2.1. Sub-tab Dashboard / Bảng Kanban | 🟢 |
| TC-HRM-HDSD-056 | CH07_HRM_TUYEN_DUNG §3. Tab Yêu cầu tuyển dụng | UF-HRM-12 | FR-UC-HRM-22 | both | 3. Tab Yêu cầu tuyển dụng | 🟢 |
| TC-HRM-HDSD-057 | CH07_HRM_TUYEN_DUNG §4. Tab Thư viện JD | UF-HRM-12 | FR-UC-HRM-22 | both | 4. Tab Thư viện JD | 🟢 |
| TC-HRM-HDSD-058 | CH07_HRM_TUYEN_DUNG §5. Tab Tin tuyển dụng | UF-HRM-12 | FR-UC-HRM-22 | both | 5. Tab Tin tuyển dụng | 🟢 |
| TC-HRM-HDSD-059 | CH07_HRM_TUYEN_DUNG §6. Tab Ứng viên | UF-HRM-12 | FR-UC-HRM-22 | both | 6. Tab Ứng viên | 🟢 |
| TC-HRM-HDSD-060 | CH07_HRM_TUYEN_DUNG §7. Tab Đề xuất định biên | — | FR-UC-HRM-22 | both | 7. Tab Đề xuất định biên | 🟢 |
| TC-HRM-HDSD-061 | CH07_HRM_TUYEN_DUNG §8. Tab Chiến dịch | — | FR-UC-HRM-22 | both | 8. Tab Chiến dịch | 🟢 |
| TC-HRM-HDSD-062 | CH07_HRM_TUYEN_DUNG §9. Tab Phỏng vấn | UF-HRM-12 | FR-UC-HRM-22 | both | 9. Tab Phỏng vấn | 🟢 |
| TC-HRM-HDSD-063 | CH07_HRM_TUYEN_DUNG §10. Tab Đánh giá | — | FR-UC-HRM-22 | both | 10. Tab Đánh giá | 🟢 |
| TC-HRM-HDSD-064 | CH07_HRM_TUYEN_DUNG §11. Tab Kế hoạch tuyển dụng → 11.1. Danh sách kế hoạch | UF-HRM-12 | FR-UC-HRM-22 | both | 11.1. Danh sách kế hoạch | 🟢 |
| TC-HRM-HDSD-065 | CH07_HRM_TUYEN_DUNG §11. Tab Kế hoạch tuyển dụng → 11.2. Hộp thoại — Tạo kế hoạch mới | UF-HRM-12 | FR-UC-HRM-22 | both | 11.2. Hộp thoại — Tạo kế hoạch mới — verify fields + Lưu + F5 | 🟡 |
| TC-HRM-HDSD-066 | CH07_HRM_TUYEN_DUNG §11. Tab Kế hoạch tuyển dụng → 11.3. Chi tiết kế hoạch | UF-HRM-12 | FR-UC-HRM-22 | both | 11.3. Chi tiết kế hoạch | 🟡 |
| TC-HRM-HDSD-067 | CH07_HRM_TUYEN_DUNG §12. Tab Báo cáo | UF-HRM-MENU-16 | FR-UC-HRM-22 | both | 12. Tab Báo cáo | 🟢 |
| TC-HRM-HDSD-068 | CH07_HRM_TUYEN_DUNG §13. Hộp thoại dùng chung | — | FR-UC-HRM-22 | both | 13. Hộp thoại dùng chung — verify fields + Lưu + F5 | 🟡 |
| TC-HRM-HDSD-069 | CH07_HRM_TUYEN_DUNG §14. Trạng thái nghiệp vụ | — | FR-UC-HRM-22 | both | 14. Trạng thái nghiệp vụ | 🟢 |
| TC-HRM-HDSD-070 | CH07_HRM_TUYEN_DUNG §15. Lỗi thường gặp | — | FR-UC-HRM-22 | both | 15. Lỗi thường gặp — reproduce + recovery path | 🟡 |
| TC-HRM-HDSD-071 | CH07_HRM_TUYEN_DUNG §16. Liên kết kiểm thử | — | FR-UC-HRM-22 | both | 16. Liên kết kiểm thử | 🟢 |
| TC-HRM-HDSD-072 | CH08_HRM_CHAM_CONG §1. Giới thiệu | — | FR-UC-HRM-23 | both | 1. Giới thiệu | 🟢 |
| TC-HRM-HDSD-073 | CH08_HRM_CHAM_CONG §2. Tab Tổng quan | — | FR-UC-HRM-23 | both | 2. Tab Tổng quan | 🟢 |
| TC-HRM-HDSD-074 | CH08_HRM_CHAM_CONG §3. Tab Chấm công — Chấm công vào/ra | UF-HRM-05 | FR-UC-HRM-23 | both | 3. Tab Chấm công — Chấm công vào/ra | 🟢 |
| TC-HRM-HDSD-075 | CH08_HRM_CHAM_CONG §4. Tab Chấm công — Bảng chấm công | UF-HRM-05 | FR-UC-HRM-23 | both | 4. Tab Chấm công — Bảng chấm công | 🟢 |
| TC-HRM-HDSD-076 | CH08_HRM_CHAM_CONG §5. Tab Chấm công — Dữ liệu / Tuần / Tổng hợp → 5.1. Dữ liệu chấm công | UF-HRM-05 | FR-UC-HRM-23 | both | 5.1. Dữ liệu chấm công | 🟢 |
| TC-HRM-HDSD-077 | CH08_HRM_CHAM_CONG §5. Tab Chấm công — Dữ liệu / Tuần / Tổng hợp → 5.2. Chấm công tuần | UF-HRM-03 | FR-UC-HRM-23 | both | 5.2. Chấm công tuần | 🟢 |
| TC-HRM-HDSD-078 | CH08_HRM_CHAM_CONG §5. Tab Chấm công — Dữ liệu / Tuần / Tổng hợp → 5.3. Tổng hợp công | UF-HRM-05 | FR-UC-HRM-23 | both | 5.3. Tổng hợp công | 🟢 |
| TC-HRM-HDSD-079 | CH08_HRM_CHAM_CONG §6. Tab Ca làm việc → 6.1. Danh sách ca | UF-HRM-05 | FR-UC-HRM-23 | both | 6.1. Danh sách ca | 🟢 |
| TC-HRM-HDSD-080 | CH08_HRM_CHAM_CONG §6. Tab Ca làm việc → 6.2. Lịch phân ca | UF-HRM-05 | FR-UC-HRM-23 | both | 6.2. Lịch phân ca | 🟢 |
| TC-HRM-HDSD-081 | CH08_HRM_CHAM_CONG §6. Tab Ca làm việc → 6.3. Ca làm thêm | UF-HRM-05 | FR-UC-HRM-23 | both | 6.3. Ca làm thêm | 🟢 |
| TC-HRM-HDSD-082 | CH08_HRM_CHAM_CONG §7. Tab Quản lý đơn → 7.1. Đơn xin nghỉ (mẫu chung LeaveTab) | J-MOB-03 | FR-UC-HRM-23 | both | 7.1. Đơn xin nghỉ (mẫu chung LeaveTab) | 🟢 |
| TC-HRM-HDSD-083 | CH08_HRM_CHAM_CONG §8. Tab Nghỉ phép | J-MOB-03 | FR-UC-HRM-23 | both | 8. Tab Nghỉ phép | 🟢 |
| TC-HRM-HDSD-084 | CH08_HRM_CHAM_CONG §9. Tab Báo cáo | UF-HRM-MENU-16 | FR-UC-HRM-23 | both | 9. Tab Báo cáo | 🟢 |
| TC-HRM-HDSD-085 | CH08_HRM_CHAM_CONG §10. Tab Thiết lập | — | FR-UC-HRM-23 | both | 10. Tab Thiết lập | 🟢 |
| TC-HRM-HDSD-086 | CH08_HRM_CHAM_CONG §11. Trạng thái nghiệp vụ | — | FR-UC-HRM-23 | both | 11. Trạng thái nghiệp vụ | 🟡 |
| TC-HRM-HDSD-087 | CH08_HRM_CHAM_CONG §12. Lỗi thường gặp | — | FR-UC-HRM-23 | both | 12. Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-088 | CH08_HRM_CHAM_CONG §13. Liên kết kiểm thử | — | FR-UC-HRM-23 | both | 13. Liên kết kiểm thử | 🟢 |
| TC-HRM-HDSD-089 | CH09_HRM_LUONG §1. Giới thiệu | — | FR-UC-HRM-24 | both | 1. Giới thiệu | 🟢 |
| TC-HRM-HDSD-090 | CH09_HRM_LUONG §2. Tab Tổng quan | — | FR-UC-HRM-24 | both | 2. Tab Tổng quan | 🟢 |
| TC-HRM-HDSD-091 | CH09_HRM_LUONG §3. Tab Thành phần lương | — | FR-UC-HRM-24 | both | 3. Tab Thành phần lương | 🟢 |
| TC-HRM-HDSD-092 | CH09_HRM_LUONG §4. Tab Chính sách → 4.1. Chính sách thuế | — | FR-UC-HRM-24 | both | 4.1. Chính sách thuế | 🟢 |
| TC-HRM-HDSD-093 | CH09_HRM_LUONG §4. Tab Chính sách → 4.2. Chính sách bảo hiểm | UF-HRM-04 | FR-UC-HRM-24 | both | 4.2. Chính sách bảo hiểm | 🟢 |
| TC-HRM-HDSD-094 | CH09_HRM_LUONG §4. Tab Chính sách → 4.3. Chính sách phụ cấp · Thưởng · Tổng hợp doanh số | — | FR-UC-HRM-24 | both | 4.3. Chính sách phụ cấp · Thưởng · Tổng hợp doanh số | 🟢 |
| TC-HRM-HDSD-095 | CH09_HRM_LUONG §5. Tab Dữ liệu | — | FR-UC-HRM-24 | both | 5. Tab Dữ liệu | 🟢 |
| TC-HRM-HDSD-096 | CH09_HRM_LUONG §6. Tab Tính lương → 6.1. Tạo bảng lương (kỳ lương) | UF-HRM-06 | FR-UC-HRM-24 | both | 6.1. Tạo bảng lương (kỳ lương) | 🟢 |
| TC-HRM-HDSD-097 | CH09_HRM_LUONG §6. Tab Tính lương → 6.2. Danh sách bảng lương & Phiếu lương | UF-HRM-06 | FR-UC-HRM-24 | both | 6.2. Danh sách bảng lương & Phiếu lương | 🟢 |
| TC-HRM-HDSD-098 | CH09_HRM_LUONG §6. Tab Tính lương → 6.3. Tạm ứng lương | UF-HRM-06 | FR-UC-HRM-24 | both | 6.3. Tạm ứng lương | 🟢 |
| TC-HRM-HDSD-099 | CH09_HRM_LUONG §6. Tab Tính lương → 6.4. Mẫu bảng lương | UF-HRM-06 | FR-UC-HRM-24 | both | 6.4. Mẫu bảng lương | 🟢 |
| TC-HRM-HDSD-100 | CH09_HRM_LUONG §6. Tab Tính lương → 6.5. Quyết toán thuế | UF-HRM-06 | FR-UC-HRM-24 | both | 6.5. Quyết toán thuế | 🟢 |
| TC-HRM-HDSD-101 | CH09_HRM_LUONG §7. Tab Chi trả | — | FR-UC-HRM-24 | both | 7. Tab Chi trả | 🟢 |
| TC-HRM-HDSD-102 | CH09_HRM_LUONG §8. Tab Báo cáo | UF-HRM-MENU-16 | FR-UC-HRM-24 | both | 8. Tab Báo cáo | 🟢 |
| TC-HRM-HDSD-103 | CH09_HRM_LUONG §9. Trạng thái nghiệp vụ | — | FR-UC-HRM-24 | both | 9. Trạng thái nghiệp vụ | 🟡 |
| TC-HRM-HDSD-104 | CH09_HRM_LUONG §10. Lỗi thường gặp | — | FR-UC-HRM-24 | both | 10. Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-105 | CH09_HRM_LUONG §11. Liên kết kiểm thử | — | FR-UC-HRM-24 | both | 11. Liên kết kiểm thử | 🟢 |
| TC-HRM-HDSD-106 | CH10_HRM_CO_QD_CV §10.1 Thông tin công ty (Headcount & tổ chức) → Mô tả | UF-HRM-MENU-15 | FR-UC-HRM-CO-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-107 | CH10_HRM_CO_QD_CV §10.1 Thông tin công ty (Headcount & tổ chức) → Tab trên màn hình | UF-HRM-MENU-15 | FR-UC-HRM-CO-01 | both | Tab trên màn hình | 🟢 |
| TC-HRM-HDSD-108 | CH10_HRM_CO_QD_CV §10.1 Thông tin công ty (Headcount & tổ chức) → Bảng Nút & chức năng — Tab Quản lý công ty | UF-HRM-MENU-15 | FR-UC-HRM-CO-01 | both | Bảng Nút & chức năng — Tab Quản lý công ty — click each button; Network 2xx | 🟢 |
| TC-HRM-HDSD-109 | CH10_HRM_CO_QD_CV §10.1 Thông tin công ty (Headcount & tổ chức) → Bảng Cột danh sách — Công ty | UF-HRM-MENU-15 | FR-UC-HRM-CO-01 | both | Bảng Cột danh sách — Công ty | 🟡 |
| TC-HRM-HDSD-110 | CH10_HRM_CO_QD_CV §10.1 Thông tin công ty (Headcount & tổ chức) → Bảng Hộp thoại — Thêm / Sửa công ty | UF-HRM-MENU-15 | FR-UC-HRM-CO-01 | both | Bảng Hộp thoại — Thêm / Sửa công ty — verify fields + Lưu + F5 | 🟡 |
| TC-HRM-HDSD-111 | CH10_HRM_CO_QD_CV §10.1 Thông tin công ty (Headcount & tổ chức) → Tab Thành viên & Phòng ban | UF-XBOS-12 | FR-UC-HRM-CO-01 | both | Tab Thành viên & Phòng ban | 🟡 |
| TC-HRM-HDSD-112 | CH10_HRM_CO_QD_CV §10.1 Thông tin công ty (Headcount & tổ chức) → Tab Gói dịch vụ | UF-HRM-MENU-15 | FR-UC-HRM-CO-01 | both | Tab Gói dịch vụ | 🟡 |
| TC-HRM-HDSD-113 | CH10_HRM_CO_QD_CV §10.1 Thông tin công ty (Headcount & tổ chức) → Lỗi thường gặp | UF-HRM-MENU-15 | FR-UC-HRM-CO-01 | both | Lỗi thường gặp — reproduce + recovery path | 🟡 |
| TC-HRM-HDSD-114 | CH10_HRM_CO_QD_CV §10.2 Quyết định nhân sự → Mô tả | UF-HRM-MENU-05 | FR-UC-HRM-CO-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-115 | CH10_HRM_CO_QD_CV §10.2 Quyết định nhân sự → Bảng Nút & chức năng — Thanh công cụ | UF-HRM-MENU-05 | FR-UC-HRM-CO-01 | both | Bảng Nút & chức năng — Thanh công cụ — click each button; Network 2xx | 🟢 |
| TC-HRM-HDSD-116 | CH10_HRM_CO_QD_CV §10.2 Quyết định nhân sự → Tab loại quyết định | UF-HRM-MENU-05 | FR-UC-HRM-CO-01 | both | Tab loại quyết định | 🟢 |
| TC-HRM-HDSD-117 | CH10_HRM_CO_QD_CV §10.2 Quyết định nhân sự → Bảng Cột danh sách | UF-HRM-MENU-05 | FR-UC-HRM-CO-01 | both | Bảng Cột danh sách | 🟢 |
| TC-HRM-HDSD-118 | CH10_HRM_CO_QD_CV §10.2 Quyết định nhân sự → Phân trang | UF-HRM-MENU-05 | FR-UC-HRM-CO-01 | both | Phân trang | 🟢 |
| TC-HRM-HDSD-119 | CH10_HRM_CO_QD_CV §10.2 Quyết định nhân sự → Bảng Hộp thoại — Thêm / Sửa quyết định | UF-HRM-MENU-05 | FR-UC-HRM-CO-01 | both | Bảng Hộp thoại — Thêm / Sửa quyết định — verify fields + Lưu + F5 | 🟢 |
| TC-HRM-HDSD-120 | CH10_HRM_CO_QD_CV §10.2 Quyết định nhân sự → Trạng thái nghiệp vụ | UF-HRM-MENU-05 | FR-UC-HRM-CO-01 | both | Trạng thái nghiệp vụ | 🟢 |
| TC-HRM-HDSD-121 | CH10_HRM_CO_QD_CV §10.2 Quyết định nhân sự → Lỗi thường gặp | UF-HRM-MENU-05 | FR-UC-HRM-CO-01 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-122 | CH10_HRM_CO_QD_CV §10.3 Quản lý công việc → Mô tả | UF-HRM-MENU-01 | FR-UC-HRM-CO-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-123 | CH10_HRM_CO_QD_CV §10.3 Quản lý công việc → Bảng Nút & chức năng — Header | UF-HRM-MENU-01 | FR-UC-HRM-CO-01 | both | Bảng Nút & chức năng — Header — click each button; Network 2xx | 🟢 |
| TC-HRM-HDSD-124 | CH10_HRM_CO_QD_CV §10.3 Quản lý công việc → Chế độ xem | UF-HRM-MENU-01 | FR-UC-HRM-CO-01 | both | Chế độ xem | 🟢 |
| TC-HRM-HDSD-125 | CH10_HRM_CO_QD_CV §10.3 Quản lý công việc → Bộ lọc | UF-HRM-MENU-01 | FR-UC-HRM-CO-01 | both | Bộ lọc | 🟢 |
| TC-HRM-HDSD-126 | CH10_HRM_CO_QD_CV §10.3 Quản lý công việc → Bảng Hộp thoại — Tạo / Sửa công việc | UF-HRM-MENU-01 | FR-UC-HRM-CO-01 | both | Bảng Hộp thoại — Tạo / Sửa công việc — verify fields + Lưu + F5 | 🟢 |
| TC-HRM-HDSD-127 | CH10_HRM_CO_QD_CV §10.3 Quản lý công việc → Trạng thái công việc | UF-HRM-MENU-01 | FR-UC-HRM-CO-01 | both | Trạng thái công việc | 🟢 |
| TC-HRM-HDSD-128 | CH10_HRM_CO_QD_CV §10.3 Quản lý công việc → Lỗi thường gặp | UF-HRM-MENU-01 | FR-UC-HRM-CO-01 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-129 | CH10_HRM_CO_QD_CV §10.4 Dịch vụ nội bộ → Mô tả | — | FR-UC-HRM-CO-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-130 | CH10_HRM_CO_QD_CV §10.4 Dịch vụ nội bộ → Tab dịch vụ | — | FR-UC-HRM-CO-01 | both | Tab dịch vụ | 🟢 |
| TC-HRM-HDSD-131 | CH10_HRM_CO_QD_CV §10.4 Dịch vụ nội bộ → Thẻ thống kê (mỗi tab) | — | FR-UC-HRM-CO-01 | both | Thẻ thống kê (mỗi tab) | 🟢 |
| TC-HRM-HDSD-132 | CH10_HRM_CO_QD_CV §10.4 Dịch vụ nội bộ → Bảng Nút & chức năng | — | FR-UC-HRM-CO-01 | both | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-HRM-HDSD-133 | CH10_HRM_CO_QD_CV §10.4 Dịch vụ nội bộ → Bảng Hộp thoại — Tạo / Sửa (chung) | — | FR-UC-HRM-CO-01 | both | Bảng Hộp thoại — Tạo / Sửa (chung) — verify fields + Lưu + F5 | 🟢 |
| TC-HRM-HDSD-134 | CH10_HRM_CO_QD_CV §10.4 Dịch vụ nội bộ → Trạng thái yêu cầu | — | FR-UC-HRM-CO-01 | both | Trạng thái yêu cầu | 🟢 |
| TC-HRM-HDSD-135 | CH10_HRM_CO_QD_CV §10.4 Dịch vụ nội bộ → Lỗi thường gặp | — | FR-UC-HRM-CO-01 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-136 | CH10_HRM_CO_QD_CV §10.5 Quy trình & Quy định (chỉ xem) → Mô tả | UF-XBOS-08 | FR-UC-HRM-CO-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-137 | CH10_HRM_CO_QD_CV §10.5 Quy trình & Quy định (chỉ xem) → Bảng Nút & chức năng | UF-XBOS-08 | FR-UC-HRM-CO-01 | both | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-HRM-HDSD-138 | CH10_HRM_CO_QD_CV §10.5 Quy trình & Quy định (chỉ xem) → Tab | UF-XBOS-08 | FR-UC-HRM-CO-01 | both | Tab | 🟢 |
| TC-HRM-HDSD-139 | CH10_HRM_CO_QD_CV §10.5 Quy trình & Quy định (chỉ xem) → Thẻ danh sách (mỗi dòng) | UF-XBOS-08 | FR-UC-HRM-CO-01 | both | Thẻ danh sách (mỗi dòng) | 🟢 |
| TC-HRM-HDSD-140 | CH10_HRM_CO_QD_CV §10.5 Quy trình & Quy định (chỉ xem) → Hộp thoại Xem chi tiết | UF-XBOS-08 | FR-UC-HRM-CO-01 | both | Hộp thoại Xem chi tiết — verify fields + Lưu + F5 | 🟡 |
| TC-HRM-HDSD-141 | CH10_HRM_CO_QD_CV §10.5 Quy trình & Quy định (chỉ xem) → Lỗi thường gặp | UF-XBOS-08 | FR-UC-HRM-CO-01 | both | Lỗi thường gặp — reproduce + recovery path | 🟡 |
| TC-HRM-HDSD-142 | CH10_HRM_CO_QD_CV §10.6 Hồ sơ xe (Fleet) → Mô tả | — | FR-UC-HRM-CO-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-143 | CH10_HRM_CO_QD_CV §10.6 Hồ sơ xe (Fleet) → Bảng Nút & chức năng | — | FR-UC-HRM-CO-01 | both | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-HRM-HDSD-144 | CH10_HRM_CO_QD_CV §10.6 Hồ sơ xe (Fleet) → Bảng Cột danh sách | — | FR-UC-HRM-CO-01 | both | Bảng Cột danh sách | 🟢 |
| TC-HRM-HDSD-145 | CH10_HRM_CO_QD_CV §10.6 Hồ sơ xe (Fleet) → Trạng thái empty | — | FR-UC-HRM-CO-01 | both | Trạng thái empty | 🟢 |
| TC-HRM-HDSD-146 | CH10_HRM_CO_QD_CV §10.6 Hồ sơ xe (Fleet) → Lỗi thường gặp | — | FR-UC-HRM-CO-01 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-147 | CH11_HRM_SETTINGS_REPORTS §11.1 Cài đặt HRM — Tổng quan → Mô tả | UF-HRM-10 | FR-UC-HRM-SC-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-148 | CH11_HRM_SETTINGS_REPORTS §11.1 Cài đặt HRM — Tổng quan → Tab Cài đặt | UF-HRM-10 | FR-UC-HRM-SC-01 | both | Tab Cài đặt | 🟢 |
| TC-HRM-HDSD-149 | CH11_HRM_SETTINGS_REPORTS §11.2 Tab Tài khoản → Bảng Trường | — | FR-UC-HRM-SC-01 | both | Bảng Trường | 🟢 |
| TC-HRM-HDSD-150 | CH11_HRM_SETTINGS_REPORTS §11.3 Tab Thông báo | J-MOB-07 | FR-UC-HRM-SC-01 | both | 11.3 Tab Thông báo | 🟢 |
| TC-HRM-HDSD-151 | CH11_HRM_SETTINGS_REPORTS §11.4 Tab Bảo mật → Đổi mật khẩu | — | FR-UC-HRM-SC-01 | both | Đổi mật khẩu | 🟢 |
| TC-HRM-HDSD-152 | CH11_HRM_SETTINGS_REPORTS §11.4 Tab Bảo mật → Xác thực hai lớp | — | FR-UC-HRM-SC-01 | both | Xác thực hai lớp | 🟡 |
| TC-HRM-HDSD-153 | CH11_HRM_SETTINGS_REPORTS §11.5 Tab Hệ thống | — | FR-UC-HRM-SC-01 | both | 11.5 Tab Hệ thống | 🟢 |
| TC-HRM-HDSD-154 | CH11_HRM_SETTINGS_REPORTS §11.6 Danh mục cài đặt (Đồng bộ XBOS) → Mô tả | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-155 | CH11_HRM_SETTINGS_REPORTS §11.6 Danh mục cài đặt (Đồng bộ XBOS) → Bảng Nút & chức năng | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Bảng Nút & chức năng — click each button; Network 2xx | 🟢 |
| TC-HRM-HDSD-156 | CH11_HRM_SETTINGS_REPORTS §11.6 Danh mục cài đặt (Đồng bộ XBOS) → Bảng Cột — Danh sách mục catalog | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Bảng Cột — Danh sách mục catalog | 🟢 |
| TC-HRM-HDSD-157 | CH11_HRM_SETTINGS_REPORTS §11.6 Danh mục cài đặt (Đồng bộ XBOS) → Form thêm mục mở rộng | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Form thêm mục mở rộng | 🟢 |
| TC-HRM-HDSD-158 | CH11_HRM_SETTINGS_REPORTS §11.6 Danh mục cài đặt (Đồng bộ XBOS) → Metadata hiển thị | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Metadata hiển thị | 🟢 |
| TC-HRM-HDSD-159 | CH11_HRM_SETTINGS_REPORTS §11.6 Danh mục cài đặt (Đồng bộ XBOS) → Lỗi thường gặp | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-160 | CH11_HRM_SETTINGS_REPORTS §11.7 Danh mục nghiệp vụ (Master Data) → Mô tả | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-161 | CH11_HRM_SETTINGS_REPORTS §11.7 Danh mục nghiệp vụ (Master Data) → Các nhóm danh mục (tab con) | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Các nhóm danh mục (tab con) | 🟢 |
| TC-HRM-HDSD-162 | CH11_HRM_SETTINGS_REPORTS §11.7 Danh mục nghiệp vụ (Master Data) → Bảng Nút & chức năng (mỗi tab) | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Bảng Nút & chức năng (mỗi tab) — click each button; Network 2xx | 🟢 |
| TC-HRM-HDSD-163 | CH11_HRM_SETTINGS_REPORTS §11.7 Danh mục nghiệp vụ (Master Data) → Bảng Cột | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Bảng Cột | 🟢 |
| TC-HRM-HDSD-164 | CH11_HRM_SETTINGS_REPORTS §11.7 Danh mục nghiệp vụ (Master Data) → Form thêm / sửa mục | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Form thêm / sửa mục | 🟢 |
| TC-HRM-HDSD-165 | CH11_HRM_SETTINGS_REPORTS §11.7 Danh mục nghiệp vụ (Master Data) → Metadata nhân viên (trường động ESS) | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Metadata nhân viên (trường động ESS) | 🟢 |
| TC-HRM-HDSD-166 | CH11_HRM_SETTINGS_REPORTS §11.7 Danh mục nghiệp vụ (Master Data) → Deep-link liên quan | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Deep-link liên quan | 🟢 |
| TC-HRM-HDSD-167 | CH11_HRM_SETTINGS_REPORTS §11.7 Danh mục nghiệp vụ (Master Data) → Lỗi thường gặp | UF-XBOS-09 | FR-UC-HRM-SC-01 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-168 | CH11_HRM_SETTINGS_REPORTS §11.8 Báo cáo HRM → Mô tả | UF-HRM-MENU-16 | FR-UC-HRM-SC-01 | both | Mô tả | 🟢 |
| TC-HRM-HDSD-169 | CH11_HRM_SETTINGS_REPORTS §11.8 Báo cáo HRM → Bảng Nút & chức năng — Header | UF-HRM-MENU-16 | FR-UC-HRM-SC-01 | both | Bảng Nút & chức năng — Header — click each button; Network 2xx | 🟢 |
| TC-HRM-HDSD-170 | CH11_HRM_SETTINGS_REPORTS §11.8 Báo cáo HRM → Tab báo cáo | UF-HRM-MENU-16 | FR-UC-HRM-SC-01 | both | Tab báo cáo | 🟢 |
| TC-HRM-HDSD-171 | CH11_HRM_SETTINGS_REPORTS §11.8 Báo cáo HRM → Tab Tổng quan — thẻ số liệu | UF-HRM-MENU-16 | FR-UC-HRM-SC-01 | both | Tab Tổng quan — thẻ số liệu | 🟢 |
| TC-HRM-HDSD-172 | CH11_HRM_SETTINGS_REPORTS §11.8 Báo cáo HRM → Lỗi thường gặp | UF-HRM-MENU-16 | FR-UC-HRM-SC-01 | both | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-HRM-HDSD-173 | CH11_HRM_SETTINGS_REPORTS §11.9 Hướng dẫn trong ứng dụng (In-app Guide) → Mô tả | — | FR-UC-HRM-SC-01 | both | Mô tả | 🟡 |
| TC-HRM-HDSD-174 | CH11_HRM_SETTINGS_REPORTS §11.9 Hướng dẫn trong ứng dụng (In-app Guide) → Bảng Nút & chức năng | — | FR-UC-HRM-SC-01 | both | Bảng Nút & chức năng — click each button; Network 2xx | 🟡 |
| TC-HRM-HDSD-175 | CH11_HRM_SETTINGS_REPORTS §11.9 Hướng dẫn trong ứng dụng (In-app Guide) → Cấu trúc một bước hướng dẫn | — | FR-UC-HRM-SC-01 | both | Cấu trúc một bước hướng dẫn | 🟡 |
| TC-HRM-HDSD-176 | CH11_HRM_SETTINGS_REPORTS §11.9 Hướng dẫn trong ứng dụng (In-app Guide) → Quyền | — | FR-UC-HRM-SC-01 | both | Quyền | 🟡 |

## D — Mobile HRM (33 TC)

| TC ID | HDSD § | UF | FR | Entry | Mô tả / AC spot | Verdict |
|-------|--------|----|----|-------|-----------------|---------|
| TC-MOB-001 | CH12_MOBILE_HRM §12.0 Cấu trúc điều hướng → Thanh tab dưới (4 tab cố định) | — | FR-UC-HRM-MOB-01 | mobile | Thanh tab dưới (4 tab cố định) | 🟢 |
| TC-MOB-002 | CH12_MOBILE_HRM §12.0 Cấu trúc điều hướng → Nút FAB chấm công | UF-HRM-05 | FR-UC-HRM-MOB-01 | mobile | Nút FAB chấm công | 🟢 |
| TC-MOB-003 | CH12_MOBILE_HRM §12.0 Cấu trúc điều hướng → Tài khoản UAT mobile | — | FR-UC-HRM-MOB-01 | mobile | Tài khoản UAT mobile | 🟡 |
| TC-MOB-004 | CH12_MOBILE_HRM §12.1 Đăng nhập & chọn phạm vi → Màn Đăng nhập | UF-XBOS-01 | FR-UC-HRM-MOB-01 | mobile | Màn Đăng nhập | 🟡 |
| TC-MOB-005 | CH12_MOBILE_HRM §12.1 Đăng nhập & chọn phạm vi → Hành vi sau đăng nhập | UF-XBOS-01 | FR-UC-HRM-MOB-01 | mobile | Hành vi sau đăng nhập | 🟢 |
| TC-MOB-006 | CH12_MOBILE_HRM §12.1 Đăng nhập & chọn phạm vi → Màn Phạm vi (Scope) — Profile stack | UF-XBOS-01 | FR-UC-HRM-MOB-01 | mobile | Màn Phạm vi (Scope) — Profile stack | 🟢 |
| TC-MOB-007 | CH12_MOBILE_HRM §12.1 Đăng nhập & chọn phạm vi → Lỗi thường gặp | UF-XBOS-01 | FR-UC-HRM-MOB-01 | mobile | Lỗi thường gặp — reproduce + recovery path | 🟡 |
| TC-MOB-008 | CH12_MOBILE_HRM §12.2 Trang chủ (Home) → Thanh trên (HomeTopBar) | J-MOB-02 | FR-UC-HRM-MOB-01 | mobile | Thanh trên (HomeTopBar) | 🟢 |
| TC-MOB-009 | CH12_MOBILE_HRM §12.2 Trang chủ (Home) → Lưới truy cập nhanh (QuickAccessGrid) | J-MOB-02 | FR-UC-HRM-MOB-01 | mobile | Lưới truy cập nhanh (QuickAccessGrid) | 🟢 |
| TC-MOB-010 | CH12_MOBILE_HRM §12.2 Trang chủ (Home) → Thẻ thống kê & feed | J-MOB-02 | FR-UC-HRM-MOB-01 | mobile | Thẻ thống kê & feed | 🟢 |
| TC-MOB-011 | CH12_MOBILE_HRM §12.2 Trang chủ (Home) → Lỗi thường gặp | J-MOB-02 | FR-UC-HRM-MOB-01 | mobile | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-MOB-012 | CH12_MOBILE_HRM §12.3 Chấm công & Đội nhóm → 12.3.1 Danh bạ đội nhóm (TeamDirectory) | UF-HRM-04 | FR-UC-HRM-MOB-01 | mobile | 12.3.1 Danh bạ đội nhóm (TeamDirectory) | 🟢 |
| TC-MOB-013 | CH12_MOBILE_HRM §12.3 Chấm công & Đội nhóm → 12.3.2 Chấm công vào (CheckIn) | UF-HRM-04 | FR-UC-HRM-MOB-01 | mobile | 12.3.2 Chấm công vào (CheckIn) | 🟢 |
| TC-MOB-014 | CH12_MOBILE_HRM §12.3 Chấm công & Đội nhóm → 12.3.3 Lịch sử chấm công (AttendanceHistory) | UF-HRM-04 | FR-UC-HRM-MOB-01 | mobile | 12.3.3 Lịch sử chấm công (AttendanceHistory) | 🟡 |
| TC-MOB-015 | CH12_MOBILE_HRM §12.4 Nghỉ phép & Yêu cầu cập nhật công → 12.4.1 Danh sách đơn nghỉ (LeaveRequestsList) | J-MOB-03 | FR-UC-HRM-MOB-01 | mobile | 12.4.1 Danh sách đơn nghỉ (LeaveRequestsList) | 🟢 |
| TC-MOB-016 | CH12_MOBILE_HRM §12.4 Nghỉ phép & Yêu cầu cập nhật công → 12.4.2 Tạo đơn nghỉ (CreateLeaveRequest) — Wizard 4 bước | J-MOB-03 | FR-UC-HRM-MOB-01 | mobile | 12.4.2 Tạo đơn nghỉ (CreateLeaveRequest) — Wizard 4 bước | 🟡 |
| TC-MOB-017 | CH12_MOBILE_HRM §12.4 Nghỉ phép & Yêu cầu cập nhật công → 12.4.3 Yêu cầu cập nhật công (UpdateRequests) | J-MOB-03 | FR-UC-HRM-MOB-01 | mobile | 12.4.3 Yêu cầu cập nhật công (UpdateRequests) | 🟡 |
| TC-MOB-018 | CH12_MOBILE_HRM §12.4 Nghỉ phép & Yêu cầu cập nhật công → Lỗi thường gặp | J-MOB-03 | FR-UC-HRM-MOB-01 | mobile | Lỗi thường gặp — reproduce + recovery path | 🟡 |
| TC-MOB-019 | CH12_MOBILE_HRM §12.5 Phiếu lương → Danh sách phiếu lương (PayslipList) | UF-HRM-06 | FR-UC-HRM-MOB-01 | mobile | Danh sách phiếu lương (PayslipList) | 🟢 |
| TC-MOB-020 | CH12_MOBILE_HRM §12.5 Phiếu lương → Chi tiết phiếu lương (PayslipDetail) | UF-HRM-06 | FR-UC-HRM-MOB-01 | mobile | Chi tiết phiếu lương (PayslipDetail) | 🟢 |
| TC-MOB-021 | CH12_MOBILE_HRM §12.5 Phiếu lương → Tổng hợp lương (PayrollSummary) | UF-HRM-02 | FR-UC-HRM-MOB-01 | mobile | Tổng hợp lương (PayrollSummary) | 🟢 |
| TC-MOB-022 | CH12_MOBILE_HRM §12.5 Phiếu lương → Lỗi thường gặp | UF-HRM-06 | FR-UC-HRM-MOB-01 | mobile | Lỗi thường gặp — reproduce + recovery path | 🟢 |
| TC-MOB-023 | CH12_MOBILE_HRM §12.6 Phê duyệt (Manager) → Bộ lọc chip | J-MOB-05 | FR-UC-HRM-MOB-01 | mobile | Bộ lọc chip | 🟢 |
| TC-MOB-024 | CH12_MOBILE_HRM §12.6 Phê duyệt (Manager) → Thẻ yêu cầu | J-MOB-05 | FR-UC-HRM-MOB-01 | mobile | Thẻ yêu cầu | 🟡 |
| TC-MOB-025 | CH12_MOBILE_HRM §12.6 Phê duyệt (Manager) → Hộp thoại từ chối | J-MOB-05 | FR-UC-HRM-MOB-01 | mobile | Hộp thoại từ chối — verify fields + Lưu + F5 | 🟡 |
| TC-MOB-026 | CH12_MOBILE_HRM §12.7 Hồ sơ cá nhân → Tab segmented hồ sơ | J-MOB-06 | FR-UC-HRM-MOB-01 | mobile | Tab segmented hồ sơ | 🟢 |
| TC-MOB-027 | CH12_MOBILE_HRM §12.7 Hồ sơ cá nhân → EmployeeHeroCard | J-MOB-06 | FR-UC-HRM-MOB-01 | mobile | EmployeeHeroCard | 🟢 |
| TC-MOB-028 | CH12_MOBILE_HRM §12.7 Hồ sơ cá nhân → Form Thông tin (catalog-driven) | UF-XBOS-09 | FR-UC-HRM-MOB-01 | mobile | Form Thông tin (catalog-driven) | 🟢 |
| TC-MOB-029 | CH12_MOBILE_HRM §12.7 Hồ sơ cá nhân → ProfileQuickActionGrid | J-MOB-06 | FR-UC-HRM-MOB-01 | mobile | ProfileQuickActionGrid | 🟢 |
| TC-MOB-030 | CH12_MOBILE_HRM §12.7 Hồ sơ cá nhân → Hợp đồng & BHXH (ContractsScreen) | UF-HRM-02 | FR-UC-HRM-MOB-01 | mobile | Hợp đồng & BHXH (ContractsScreen) | 🟢 |
| TC-MOB-031 | CH12_MOBILE_HRM §12.8 Thông báo → Loại thông báo (navigation) | J-MOB-07 | FR-UC-HRM-MOB-01 | mobile | Loại thông báo (navigation) | 🟢 |
| TC-MOB-032 | CH12_MOBILE_HRM §12.9 Cài đặt Mobile | UF-HRM-10 | FR-UC-HRM-MOB-01 | mobile | 12.9 Cài đặt Mobile | 🟢 |
| TC-MOB-033 | CH12_MOBILE_HRM §12.10 Bảng tổng hợp UC ↔ Màn hình | UF-HRM-02 | FR-UC-HRM-MOB-01 | mobile | 12.10 Bảng tổng hợp UC ↔ Màn hình | 🟢 |

## E — Liên thông & scope negative (W4/W5)

| TC ID | HDSD / Wave | UF | FR | Entry | Mô tả | Verdict |
|-------|-------------|----|----|-------|-------|---------|
| TC-ECO-INT-01 | W4 Catalog XBOS publish → HRM settings pull | UF-HRM-10 | FR-UC-XBOS-CAT-01 | both | Catalog sync end-to-end | 🟢 |
| TC-ECO-INT-02 | W4 Headcount công ty ↔ đơn vị XBOS | UF-HRM-MENU-15 | FR-UC-HRM-CO-01 | both | Company headcount parity | 🟢 |
| TC-ECO-INT-03 | W4 Workflow HRM request → CC inbox | UF-XBOS-08 | FR-UC-XBOS-WF-01 | portal | Cross-product workflow | 🟢 |
| TC-XBOS-HDSD-M01 | W5 Member CEO — CC rollup negative | UF-XBOS-11 | FR-UC-CC-SCOPE-02 | standalone | du-lich.ceo@xe.vn 403/409 | 🟢 |
| TC-HRM-HDSD-M01 | W5 Member CEO — HRM scope negative | UF-HRM-13 | FR-UC-HRM-SCOPE-02 | both | Member mutate blocked | 🟢 |

---

## Coverage summary

| Bộ | TC count | HDSD files scanned | Inventory ref | Promoted (🟢/🟡) |
|----|----------|-------------------|---------------|------------------|
| Ecosystem (ECO) | 11 | ecosystem/HDSD_ECOSYSTEM_CH01 | HDSD_ECOSYSTEM_INDEX W0 | 8🟢 |
| XBOS | 139 | xbos/* (6 chapters) | HDSD_XBOS_INDEX A1–A10 | 134🟢 · 4🟡 |
| HRM Web | 177 | hrm/* (Ch.0–11) | HDSD_HRM_INDEX B1–B8 + 17 menu | 139🟢 · 37🟡 |
| Mobile | 33 | hrm/HDSD_XEVN_CH12_MOBILE_HRM | HDSD_ECOSYSTEM_INDEX D1 | 20🟢 · 13🟡 |
| Liên thông (E) | 5 | W4/W5 integration | ECO-INT | 5🟢 |
| **Tổng** | **360** | 16 content MD | 37+ main + tab/dialog children | **324🟢 · 40🟡 · 0⬜** (body grep · MOB-BF03-DEPTH-01 TC-020/021/022/030 🟢) |

### Coverage by HDSD chapter

| File HDSD | TC rows |
|-----------|---------|
| `HDSD_ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE.md` | 8 |
| `HDSD_HRM_CH00_VAO_UNG_DUNG.md` | 5 |
| `HDSD_XBOS_CH01_COMMAND_CENTER.md` | 9 |
| `HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` | 17 |
| `HDSD_XEVN_CH02_COMMAND_CENTER_LEGACY.md` | 30 |
| `HDSD_XEVN_CH03_XBOS_TO_CHUC.md` | 51 |
| `HDSD_XEVN_CH04_XBOS_WF_CAT_KPI.md` | 31 |
| `HDSD_XEVN_CH05_HRM_NHAN_SU.md` | 30 |
| `HDSD_XEVN_CH06_HRM_HD_BH.md` | 18 |
| `HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` | 18 |
| `HDSD_XEVN_CH08_HRM_CHAM_CONG.md` | 17 |
| `HDSD_XEVN_CH09_HRM_LUONG.md` | 17 |
| `HDSD_XEVN_CH10_HRM_CO_QD_CV.md` | 41 |
| `HDSD_XEVN_CH11_HRM_SETTINGS_REPORTS.md` | 30 |
| `HDSD_XEVN_CH12_MOBILE_HRM.md` | 33 |

### UF coverage (primary flows)

| UF band | TC mapped (approx) | HDSD chapters |
|---------|-------------------|---------------|
| UF-XBOS-01..15 | 180+ | Ch.1–4 XBOS |
| UF-HRM-01..16 + MENU-01..17 | 170+ | Ch.0–11 HRM |
| J-MOB-01..08 | 33 | Ch.12 Mobile |
| W4 integration | 3 | ECO-INT |

*Legacy TC-HDSD-02..12 → migrated v1.1. v2.0 full inventory scan 30/07/2026.*