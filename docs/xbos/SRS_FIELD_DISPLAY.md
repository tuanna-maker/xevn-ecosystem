# SRS — Đặc tả hiển thị trường XBOS (Field Display Spec)

> **ADD** `BA-U72-FIELD-DISPLAY-XBOS-SRS-01` (2026-07-27) — khóa hiển thị cho mọi trường user-facing XBOS / Command Center / x-bos-core (không chỉ một cột).  
> **Neo:** inventory `docs/qa/evidence/ba-display-xbos-review-01-20260727.md` · **BR-XBOS-LABEL-01..03** · U72 `.cursor/rules/display-label-no-raw-key.mdc`.  
> **GWC R2 (must_keep):** `docs/qa/evidence/qc-xbos-u72-field-display-01-r2-20260727.md` — **AC-F-XBOS-01..11 · F-09/F-10 CLOSED** local; **cấm** reopen / đè nhãn đã PASS trừ FAIL mới có evidence.  
> **File đội ngũ** — không đưa work_item / chat meta vào bản khách HTML.

---

## 1. Mục đích & phạm vi

| Mục | Nội dung |
|-----|----------|
| **Mục đích** | Mọi giá trị enum / mã catalog / slug / UUID trên giao diện XBOS phải hiện **nhãn tiếng Việt đã định nghĩa**; thiếu mapping → **«—»**; **cấm** fallback raw key. |
| **Phạm vi** | Command Center (pháp nhân, ĐVTV, cổ đông, hạ tầng, catalog, workflow); portal Partners/Customers/Settings; **x-bos-core** (Organization, Metadata, KPI, Policy, RewardPenalty); consumer HRM khi bind XBOS (`business_lines` — must_keep AC-CO-IND). |
| **Ngoài phạm vi** | Cột mã danh mục `code` **kèm** `label` (admin intentional); wire JSON API; ID nội bộ không render end-user; Network query `companyId=holding` (wire OK — không phải label UI). |
| **Must keep** | `ENTITY_LEVEL_LABELS`; `INFRA_*_LABELS`; shareholder CRUD text fields; HRM `resolveIndustryDisplay` / **AC-CO-IND-*** — cấm `entity_type` làm «Ngành nghề»; **GWC-closed F-XBOS-01..11** (local PASS). |

### 1.1 Quy tắc chung (FR-XBOS-U72-LABEL-01)

| BR / FR | Điều kiện | Hành động | Kết quả |
|---------|-----------|-----------|---------|
| **BR-XBOS-LABEL-01** | Field trên UI người dùng | Resolve dictionary / catalog `label` / tên pháp nhân trước khi render | Không còn raw enum/slug/UUID |
| **FR-XBOS-U72-LABEL-01** | Enum / code / slug trên list, detail, badge, select option text, toast copy | Map → nhãn VI chuẩn bảng §2–§3; null/unknown → **«—»** | AC-U72-XBOS-GLOBAL + AC-F-XBOS-* |
| **BR-XBOS-LABEL-02** | Cột «Ngành nghề» / industry | Chỉ `business_lines` → VI; **cấm** bind `entity_type` | AC-CO-IND / VAL-XBOS-LABEL-02 |
| **BR-XBOS-LABEL-03** | Boolean user-facing | «Có» / «Không» (hoặc badge tương đương) | Không `true`/`false` |
| **BR-U72-NULL-01** | Nguồn null / empty / không có trong dictionary | Hiển thị **«—»** | **Cấm** hiện `null`, chuỗi rỗng, hoặc raw key |

**AC-U72-XBOS-GLOBAL (PASS/FAIL):**

| Pass | Fail |
|------|------|
| User thấy nhãn VI đã khóa (hoặc «—») | User thấy `holding`, `subsidiary`, `active`, `draft`, `monthly`, `supplier`, `org_unit`, `general - …`, UUID thay nhãn |

---

## 2. Bảng Field Display — FAIL F-XBOS-01..11 (ưu tiên P0)

Cột: **nguồn** · **label VI** · **dạng nguồn** · **dạng UI** · **null→—**

| ID | Module / bề mặt | Nguồn (API / field) | Label VI bắt buộc | Dạng nguồn | Dạng UI | null / unknown |
|----|-----------------|---------------------|-------------------|------------|---------|----------------|
| **F-XBOS-01** | x-bos-core — Tổ chức · Loại đơn vị | `orgTypeCode` (table + select) | `holding`→**Tập đoàn**; `subsidiary`→**Công ty thành viên**; `division`→**Khối**; `department`→**Phòng ban** | Enum TEXT | Văn bản cột + option select cùng map; **value=** giữ key | **«—»** |
| **F-XBOS-02** | x-bos-core — Tổ chức · Trạng thái | `status` | `active`→**Đang hoạt động**; `inactive`→**Tạm dừng** | Enum TEXT | Badge / ô cột (không raw) | **«—»** |
| **F-XBOS-03a** | x-bos-core — Metadata · Kiểu thực thể | `entityType` | `org_unit`→**Đơn vị tổ chức** | Enum TEXT | Văn bản cột; code kỹ thuật chỉ tooltip admin (optional) | **«—»** |
| **F-XBOS-03b** | x-bos-core — Metadata · Kiểu dữ liệu | `dataType` | `text`→**Văn bản**; `number`→**Số**; `date`→**Ngày**; `boolean`→**Đúng/Sai**; `select`→**Lựa chọn** | Enum TEXT | Văn bản / chip (không `select ·` thô) | **«—»** |
| **F-XBOS-04a** | x-bos-core — KPI Definitions · Trạng thái | `status` | `draft`→**Nháp**; `active`→**Đang hoạt động**; `inactive`→**Tạm dừng** | Enum TEXT | Badge + option select VI | **«—»** |
| **F-XBOS-04b** | x-bos-core — KPI Definitions · Tần suất | `frequency` | `daily`→**Hằng ngày**; `weekly`→**Hằng tuần**; `monthly`→**Hằng tháng** | Enum TEXT | Ô bảng + option select VI | **«—»** |
| **F-XBOS-05** | x-bos-core — KPI Assignments · Header trạng thái | allocation / header `status` | `draft`→**Nháp**; `pending_approval`→**Chờ duyệt**; `approved`→**Đã duyệt**; `frozen`→**Đã khóa**; tiêu đề cột/prefix = **«Trạng thái»** (không EN «Status») | Enum TEXT | Badge + nhãn VI; bỏ `font-mono` raw | **«—»** |
| **F-XBOS-06** | x-bos-core — Policy · Trạng thái nhóm/chính sách | group/policy `status` | `draft`→**Nháp**; `active`→**Đang hoạt động**; `inactive`→**Tạm dừng** | Enum TEXT | Table + select VI | **«—»** |
| **F-XBOS-07** | x-bos-core — Reward/Penalty · Trạng thái | run/list `status` | `draft`→**Nháp**; `final`→**Hoàn tất** (và map mở rộng nếu BE thêm mã) | Enum TEXT | List badge VI | **«—»** |
| **F-XBOS-08** | Portal — Partners · Loại đối tác | `type` | `supplier`→**Nhà cung cấp**; `distributor`→**Nhà phân phối**; `service`→**Dịch vụ**; khác đã biết → dictionary; unknown → **Khác** (không dump key) | Enum TEXT | Badge VI | **«—»** nếu null |
| **F-XBOS-09** | CC — Hạ tầng · Modal field tùy chỉnh · Khối | `blockCode` option text | `general`→**Khối Thông tin chung**; `location`→**Khối Vị trí**; `capacity`→**Khối Công suất** (chỉ nhãn VI — **cấm** prefix `general - `) | Enum TEXT | Option select; `value=` giữ key | **«—»** |
| **F-XBOS-10** | CC — Apply catalog + toast lưu hồ sơ | Copy UI chứa jargon EN | «Nguồn **tập đoàn**» / «Tải lại nguồn **tập đoàn**»; toast «hồ sơ **tập đoàn**» / «**công ty mẹ**» — **không** nhúng từ `holding` | Free text UI | Chuỗi VI nghiệp vụ | n/a |
| **F-XBOS-11** | CC / Workflow · Trạng thái phiên | instance `status` qua `workflowInstanceStatusLabelVi` | `pending`→**Đang chờ**; `running`→**Đang chạy**; `completed`→**Hoàn thành**; `rejected`→**Từ chối**; mọi status BE đã ship phải có entry | Enum TEXT | Badge / chip VI | **«—»** (cấm echo raw) |

---

## 3. Bảng Field Display — High-risk enums (khóa dictionary + regression)

Các trường hay lộ key / anti-pattern — **bắt buộc** dictionary dù inventory đã PASS hoặc N/A.

| ID | Module / bề mặt | Nguồn | Label VI chuẩn | Dạng nguồn | Dạng UI | null / unknown |
|----|-----------------|-------|----------------|------------|---------|----------------|
| **H-XBOS-01** | CC — Cấp bậc pháp nhân | `entityLevel` (map từ wire `entity_type`: `holding`→`parent`, `subsidiary`, `affiliate`) | `parent`→**Công ty mẹ**; `subsidiary`→**Công ty con**; `affiliate`→**Công ty liên kết** | Enum TEXT | Cột list + select form (`ENTITY_LEVEL_LABELS`) | **«—»** |
| **H-XBOS-02** | Wire / BE · `entity_type` | `holding` / `subsidiary` (/ `associate`) | **Không render raw** trên UI; chỉ qua H-XBOS-01 hoặc F-XBOS-01 | Enum wire | JSON only hoặc map FE | **«—»** nếu hiện cột |
| **H-XBOS-03** | Ngành nghề / industry (CC optional + HRM consumer) | `business_lines` / catalog key (`tourism`, …) | Catalog **`label` VI** hoặc free-text VI đã lưu; **cấm** dùng `entity_type` | TEXT / catalog | Văn bản cột «Ngành nghề» | **«—»** |
| **H-XBOS-04** | CC — Loại hình DN | `enterpriseType` (payload; alias nghiệp vụ `legal_form`) | `joint-stock`→**Công ty cổ phần**; `llc-2-members`→**Công ty TNHH 2 thành viên trở lên**; `llc-1-member`→**Công ty TNHH một thành viên**; `state-owned`→**Doanh nghiệp nhà nước** | Enum TEXT | Select option VI; card tóm tắt cùng map | **«—»** |
| **H-XBOS-05** | Catalog jsc/llc/sole (nếu xuất hiện) | legacy `legal_form` keys | Đồng bộ dictionary H-XBOS-04 hoặc «—» — **cấm** raw `jsc`/`llc`/`sole` | Enum TEXT | Văn bản / select | **«—»** |
| **H-XBOS-06** | Infra sites · Loại cơ sở | `facilityType` | Dictionary `INFRA_FACILITY_LABELS` (kho / bãi xe / …) | Enum TEXT | Ô bảng + select | **«—»** |
| **H-XBOS-07** | Infra sites · Trạng thái | `status` | `active`→**Hoạt động**; `maintenance`→**Bảo trì**; `inactive`→**Ngưng** (`INFRA_STATUS_LABELS`) | Enum TEXT | Badge VI | **«—»** |
| **H-XBOS-08** | Partners / Customers / Regions · Trạng thái | `status` | `active`→**Hoạt động**; `inactive`→**Ngưng** | Enum TEXT | Badge VI | **«—»** |
| **H-XBOS-09** | Customers · Loại | `type` | `corporate`→**Doanh nghiệp**; `individual`→**Cá nhân** | Enum TEXT | Badge / ô | **«—»** |
| **H-XBOS-10** | Partners · Loại | `type` | Cùng **F-XBOS-08** | Enum TEXT | Badge VI | **«—»** / **Khác** |
| **H-XBOS-11** | KPI portal health (icon) | health `status` / `trend` | Icon OK; nếu thêm text: `good`→**Ổn định**; `warning`→**Cảnh báo**; `critical`→**Nghiêm trọng** | Enum | Icon ± nhãn | **«—»** |
| **H-XBOS-12** | KPI Definitions · status + frequency | `status`, `frequency` | Cùng **F-XBOS-04a/b** | Enum | Badge + select | **«—»** |
| **H-XBOS-13** | Boolean user-facing (khi field xuất hiện) | `is_public` / `is_listed` / … | `true`→**Có**; `false`→**Không** | Bool | Văn bản / badge | **«—»** |
| **H-XBOS-14** | Catalog governance · Dòng item | `code` + `label` + optional `status` | Label VI bắt buộc; `code` được hiện **cạnh** label; status user-facing → VI (`active`→**Đang dùng**; `draft`→**Nháp`) | Catalog | Bảng admin | **«—»** |

> **Anti-pattern khóa:** `entity_type` ∈ {`holding`,`subsidiary`,…} **không bao giờ** là giá trị cột «Ngành nghề». Regression: **AC-CO-IND-02** + **VAL-XBOS-LABEL-02**.

### 3.1 Catalog SoT — `entity_type` / `business_lines` / `legal_form` (label VI bắt buộc)

Dictionary khóa cho catalog / wire keys hay bị nhầm cột. Cột: **nguồn** · **label VI** · **dạng nguồn** · **dạng UI** · **null→—**.

#### C-XBOS-ET — `entity_type` (loại pháp nhân / tổ chức — **không** = ngành nghề)

| Key nguồn | Label VI SoT | Bối cảnh UI | Dạng nguồn | Dạng UI | null / unknown |
|-----------|--------------|-------------|------------|---------|----------------|
| `holding` | **Tập đoàn** (x-bos-core `orgTypeCode`); map CC cấp bậc → `parent` → **Công ty mẹ** | Org type / cấp bậc | Enum TEXT wire | Văn bản / option — **cấm** raw; **cấm** cột «Ngành nghề» | **«—»** |
| `subsidiary` | **Công ty thành viên** (`orgTypeCode`); CC `entityLevel` → **Công ty con** | Org type / cấp bậc | Enum TEXT | Văn bản / option | **«—»** |
| `parent` | **Công ty mẹ** | CC `entityLevel` (sau map từ `holding`) | Enum FE | Cột + select | **«—»** |
| `affiliate` | **Công ty liên kết** | CC `entityLevel` | Enum TEXT | Cột + select | **«—»** |
| `associate` | **Công ty liên kết** (alias wire → cùng `affiliate`) | Nếu BE trả `associate` | Enum TEXT | Map 1:1 → nhãn affiliate | **«—»** |
| `division` | **Khối** | x-bos-core org | Enum TEXT | Cột + select | **«—»** |
| `department` | **Phòng ban** | x-bos-core org | Enum TEXT | Cột + select | **«—»** |
| `org_unit` | **Đơn vị tổ chức** | Metadata `entityType` | Enum TEXT | Cột | **«—»** |

**VAL-XBOS-ET-01:** User-facing không echo `holding`/`subsidiary`/`affiliate`/`associate` trừ khi đã qua dictionary trên.  
**VAL-XBOS-ET-02:** Giá trị thuộc bảng này **không** được bind vào «Ngành nghề».

#### C-XBOS-BL — `business_lines` (ngành nghề / lĩnh vực — SoT cột «Ngành nghề»)

| Key nguồn (catalog) | Label VI SoT | Dạng nguồn | Dạng UI | null / unknown |
|---------------------|--------------|------------|---------|----------------|
| `it` | **Công nghệ thông tin** | Catalog key TEXT | Văn bản cột / badge | **«—»** |
| `manufacturing` | **Sản xuất** | Catalog key | Văn bản | **«—»** |
| `trading` | **Thương mại** | Catalog key | Văn bản | **«—»** |
| `services` | **Dịch vụ** | Catalog key | Văn bản | **«—»** |
| `finance` | **Tài chính - Ngân hàng** | Catalog key | Văn bản | **«—»** |
| `realestate` | **Bất động sản** | Catalog key | Văn bản | **«—»** |
| `education` | **Giáo dục** | Catalog key | Văn bản | **«—»** |
| `healthcare` | **Y tế** | Catalog key | Văn bản | **«—»** |
| `tourism` | **Du lịch - Khách sạn** | Catalog key | Văn bản | **«—»** |
| `logistics` | **Vận tải - Logistics** | Catalog key | Văn bản | **«—»** |
| `construction` | **Xây dựng** | Catalog key | Văn bản | **«—»** |
| `other` | **Khác** | Catalog key | Văn bản | **«—»** |
| Free-text VI hợp lệ | Hiển thị nguyên văn (đã là nhãn người) | TEXT | Văn bản | — |
| Token ∈ C-XBOS-ET / blocklist | **Không hợp lệ** cho ngành | — | **«—»** (không echo) | **«—»** |
| NULL / empty | — | — | **«—»** | **«—»** |

> Mirror consumer: HRM `INDUSTRY_CATALOG_VI` / `resolveIndustryDisplay` · `DB_DESIGN_XBOS_ORG_LEGAL` §2.3 · **AC-CO-IND-02**.

#### C-XBOS-LF — `legal_form` / `enterpriseType` (loại hình doanh nghiệp)

| Key nguồn | Label VI SoT | Dạng nguồn | Dạng UI | null / unknown |
|-----------|--------------|------------|---------|----------------|
| `joint-stock` | **Công ty cổ phần** | Enum payload `enterpriseType` | Select option + card tóm tắt | **«—»** |
| `llc-2-members` | **Công ty TNHH 2 thành viên trở lên** | Enum | Select / văn bản | **«—»** |
| `llc-1-member` | **Công ty TNHH một thành viên** | Enum | Select / văn bản | **«—»** |
| `state-owned` | **Doanh nghiệp nhà nước** | Enum | Select / văn bản | **«—»** |
| `jsc` (legacy) | **Công ty cổ phần** (= `joint-stock`) | Legacy `legal_form` | Map → cùng nhãn; **cấm** raw `jsc` | **«—»** |
| `llc` (legacy) | **Công ty TNHH** (không phân biệt 1/2 TV nếu thiếu chi tiết) | Legacy | Map hoặc «—» nếu không phân biệt được | **«—»** |
| `sole` (legacy) | **Doanh nghiệp tư nhân / hộ kinh doanh** | Legacy | Map VI; **cấm** raw `sole` | **«—»** |

**VAL-XBOS-LF-01:** Option text / cell = nhãn VI bảng trên; `value=` giữ key wire.  
**VAL-XBOS-LF-02:** Không hiện `joint-stock` / `jsc` / `llc` / `sole` thô trên UI user.

### 3.2 UNKNOWN inventory + soft residual (5 cột) — không reopen GWC 🟢

| ID | Module / bề mặt | Nguồn | Label VI bắt buộc | Dạng nguồn | Dạng UI | null / unknown |
|----|-----------------|-------|-------------------|------------|---------|----------------|
| **U-XBOS-01** | CC mapper `affiliate` / BE `associate` | `entityLevel` / wire `entity_type` | `associate`→**Công ty liên kết** (= `affiliate`); thiếu map → **«—»** | Enum | Cột + select | **«—»** |
| **U-XBOS-02** | Catalog / payload legacy `legal_form` | `jsc` / `llc` / `sole` | Theo **C-XBOS-LF**; không dùng thì **không** render raw | Enum legacy | Select / văn bản | **«—»** |
| **U-XBOS-03** | Config-sync / catalog publish · `status` | `active` / `draft` (và mã BE đã ship) | `active`→**Đang dùng**; `draft`→**Nháp**; `inactive`→**Ngưng** | Enum | Badge VI nếu surface user | **«—»** |
| **U-XBOS-04** | CC toast lưu hồ sơ (ngoài Apply catalog) | Copy UI có thể còn `(holding)` | «hồ sơ **tập đoàn**» / «**công ty mẹ**» — **không** nhúng EN `holding` | Free text UI | Toast VI | n/a |
| **R-XBOS-P2-01** | Metadata / infra field · `dataType` option title-case EN | `Text`/`Number`/`Date` hoặc `text`/`date` | Cùng **F-XBOS-03b** (Văn bản / Số / Ngày…) — soft P2 GWC | Enum | Option + list | **«—»** |
| **R-XBOS-P2-02** | Apply catalog dropdown paren tech code | `Chức danh (job_titles)` | «**Chức danh**» (mã catalog chỉ tooltip admin optional) | Catalog | Option text VI | n/a |

> **GWC:** U-XBOS-04 / R-XBOS-P2-* = **C-XBOS-U72-P2** soft OK — **không** Dev reopen F-09/F-10 đã CLOSED trừ sponsor ưu tiên riêng.

---

## 4. Ma trận AC kiểm thử (QA)

### 4.1 Toàn cục

| AC | Pass | Fail |
|----|------|------|
| **AC-U72-XBOS-GLOBAL** | Mọi field in-scope qua dictionary; thiếu map → «—» | Raw English / snake_case / slug / UUID thay nhãn |
| **AC-U72-NULL-01** | null/empty/unknown → «—» | `null` chữ, `undefined`, hoặc raw fallback |
| **VAL-XBOS-LABEL-01** | Snapshot UI không match raw key đã map (trừ cột `code` catalog) | Còn `\b(holding\|subsidiary\|active\|draft\|monthly\|supplier)\b` trên surface đã khóa |
| **VAL-XBOS-LABEL-02** | «Ngành nghề» ≠ `entity_type` | `subsidiary`/`holding` trong cột ngành |
| **AC-CO-IND-02** (regression consumer) | HRM Company: không hiện `subsidiary`/`holding` ở «Ngành nghề» | Regression industry |

### 4.2 AC theo FAIL ID (F-XBOS-01..11)

| AC | Liên kết | Pass (đo được) | Fail |
|----|----------|----------------|------|
| **AC-F-XBOS-01** | F-XBOS-01 | Tổ chức: cột + select = Tập đoàn / Công ty thành viên / Khối / Phòng ban; submit vẫn enum key | `holding`/`subsidiary`/`division`/`department` raw |
| **AC-F-XBOS-02** | F-XBOS-02 | Badge Đang hoạt động / Tạm dừng | `active`/`inactive` thô |
| **AC-F-XBOS-03** | F-XBOS-03a/b | Metadata: Đơn vị tổ chức + kiểu dữ liệu VI | `org_unit`, `boolean`, `select` raw |
| **AC-F-XBOS-04** | F-XBOS-04a/b | KPI Def: status + frequency VI trên table **và** form | `draft`/`monthly` raw |
| **AC-F-XBOS-05** | F-XBOS-05 | Không EN «Status:»; Trạng thái: Nháp / Chờ duyệt / Đã duyệt / Đã khóa | `Status: draft`, mono raw |
| **AC-F-XBOS-06** | F-XBOS-06 | Policy status VI mọi surface | draft/active raw |
| **AC-F-XBOS-07** | F-XBOS-07 | Reward/Penalty status VI | raw status |
| **AC-F-XBOS-08** | F-XBOS-08 | Partner badge: Nhà cung cấp / Nhà phân phối / Dịch vụ; unknown = Khác | `supplier` raw |
| **AC-F-XBOS-09** | F-XBOS-09 | Option chỉ nhãn VI (không `general - …`) | key prefix trong option text |
| **AC-F-XBOS-10** | F-XBOS-10 | Copy Apply catalog + toast không chứa EN `holding` | Chuỗi «holding» user-facing |
| **AC-F-XBOS-11** | F-XBOS-11 | Mọi status BE đã ship có nhãn; unknown → «—» | Echo raw status |

### 4.3 AC high-risk enums (spot bắt buộc)

| AC | Liên kết | Pass | Fail |
|----|----------|------|------|
| **AC-H-XBOS-01** | H-XBOS-01 | CC list/form cấp bậc = Công ty mẹ / con / liên kết | `parent`/`holding` raw |
| **AC-H-XBOS-03** | H-XBOS-03 | Industry = VI hoặc «—»; không entity_type | key ngành thô / subsidiary |
| **AC-H-XBOS-04** | H-XBOS-04 | enterpriseType select VI | `joint-stock` trong option text |
| **AC-H-XBOS-07** | H-XBOS-07 | Infra status VI | raw infra status |
| **AC-H-XBOS-08** | H-XBOS-08 | Partner/Customer/Region status VI | raw |
| **AC-H-XBOS-10** | H-XBOS-10 | = AC-F-XBOS-08 | — |
| **AC-H-XBOS-12** | H-XBOS-12 | = AC-F-XBOS-04 | — |

### 4.3b AC Catalog SoT + UNKNOWN (ADD reclaim)

| AC | Liên kết | Pass | Fail |
|----|----------|------|------|
| **AC-C-XBOS-ET** | C-XBOS-ET | `entity_type` / cấp bậc / org type = nhãn VI bảng §3.1; wire key không echo | Raw `holding`/`subsidiary` trên UI cấp bậc/org |
| **AC-C-XBOS-BL** | C-XBOS-BL | «Ngành nghề» = VI catalog hoặc free-text VI hoặc «—» | Key `tourism` thô / `subsidiary` trong cột ngành |
| **AC-C-XBOS-LF** | C-XBOS-LF | Loại hình DN = nhãn VI; legacy `jsc`/`llc`/`sole` đã map hoặc «—» | Raw `joint-stock` / `jsc` trên UI |
| **AC-U-XBOS-01** | U-XBOS-01 | `associate` hiển thị **Công ty liên kết** hoặc «—» | Echo `associate` |
| **AC-U-XBOS-02** | U-XBOS-02 | Legacy legal_form không raw | `jsc`/`llc`/`sole` thô |
| **AC-U-XBOS-03** | U-XBOS-03 | Publish status user-facing = Đang dùng / Nháp / Ngưng | `draft`/`active` raw trên surface user |
| **AC-U-XBOS-04** | U-XBOS-04 | Toast CC không chứa EN `holding` (soft — ngoài Apply đã GWC) | Toast còn `(holding)` / «holding» |

### 4.4 Persona / bằng chứng (U65)

| Hạng mục | Giá trị |
|----------|---------|
| Persona | `ceo@xe.vn` / mật khẩu pilot chuẩn |
| Surfaces ưu tiên | x-bos-core Tổ chức + KPI Definitions; portal Partners; CC hạ tầng modal + Apply catalog + Workflow status |
| Cách test | Browser: login → menu SRS → mở bề mặt → quan sát ô field / badge / select option → F5 |
| Cấm | Seed để «có data»; PASS chỉ API/probe |
| Evidence mẫu | Mỗi AC-F-XBOS-*: URL + click path + trước/sau (nhãn) + Network 2xx nếu có mutate |

---

## 5. Quy tắc nghiệp vụ tóm tắt

| BR | Điều kiện | Hành động | Kết quả |
|----|-----------|-----------|---------|
| BR-XBOS-LABEL-01 | UI user-facing XBOS | Dictionary bắt buộc; wire giữ key | AC-U72-XBOS-GLOBAL |
| BR-XBOS-LABEL-02 | Industry / ngành | Chỉ `business_lines` | VAL-XBOS-LABEL-02 · AC-CO-IND |
| BR-XBOS-LABEL-03 | Boolean | Có/Không | Không true/false |
| BR-U72-NULL-01 | Miss map / null | «—» | Không raw |
| BR-U72-ADMIN-CODE-01 | Catalog admin | Được hiện `code` **kèm** `label` | Code-only không kèm label = FAIL |
| BR-XBOS-COPY-01 | Toast / panel copy | Không nhúng EN jargon (`holding`) khi nói với user | AC-F-XBOS-10 |

---

## 6. Traceability (SRS → API → FE → Test)

| Requirement | API / DB | FE | Journey / UF |
|-------------|---------|----|--------------|
| FR-XBOS-U72-LABEL-01 | Wire enums OK | Label maps (CC + x-bos-core + Partners) | UF-XBOS-* + x-bos-core pages |
| F-XBOS-01..02 / H-XBOS-01 | `orgTypeCode` / `entity_type` | `ORG_TYPE_LABELS` · `ENTITY_LEVEL_LABELS` | UF-XBOS-02 · J-CC |
| F-XBOS-04..05 / H-XBOS-12 | KPI status/frequency | `resolveKpiFrequencyLabel` · cascade status map | UF-XBOS-10 |
| F-XBOS-08 / H-XBOS-10 | partners.`type` | Partner type dictionary | Partners settings |
| F-XBOS-11 | workflow instance.status | `workflowInstanceStatusLabelVi` | UF-XBOS-08 · J-XBOS-01 |
| H-XBOS-03 / BR-XBOS-LABEL-02 / **C-XBOS-BL** | `business_lines` | HRM `resolveIndustryDisplay` · `INDUSTRY_CATALOG_VI` | J-HRM-CO-01 · AC-CO-IND · AC-C-XBOS-BL |
| H-XBOS-04 / **C-XBOS-LF** | `enterpriseType` / `legal_form` | CC select options VI + legacy map | UF-XBOS-03 · AC-C-XBOS-LF |
| **C-XBOS-ET** | `entity_type` | `ENTITY_LEVEL_LABELS` · `ORG_TYPE_LABELS` | UF-XBOS-02 · AC-C-XBOS-ET |
| U-XBOS-01..04 | affiliate / legacy LF / publish status / toast soft | Map §3.2 | Spot QA / soft P2 |

---

## 7. Handoff Dev / QA

| Role | Việc |
|------|------|
| **dev-fe** | **Không** reopen F-XBOS-01..11 đã GWC PASS trừ FAIL mới. Soft P2 (U-XBOS-04 / R-XBOS-P2-*) chỉ khi sponsor ưu tiên. Catalog §3.1 = SoT regression. |
| **dev-be** (P2) | Tuỳ chọn enum SoT `associate`↔`affiliate` parity nếu U-XBOS-01 FAIL live |
| **qa** | Regression AC-C-XBOS-ET/BL/LF + AC-CO-IND-02; **không** re-open closed F-* làm FAIL trừ quan sát raw mới |

**Inventory gốc:** `docs/qa/evidence/ba-display-xbos-review-01-20260727.md`  
**QC GWC R2:** `docs/qa/evidence/qc-xbos-u72-field-display-01-r2-20260727.md`  
**Con trỏ team SRS:** `docs/xbos/SRS.md` §1.1 + §13.  
**Mirror HRM:** `docs/hrm/SRS_FIELD_DISPLAY.md` (cùng khung U72; dictionary ngành mirror C-XBOS-BL).
