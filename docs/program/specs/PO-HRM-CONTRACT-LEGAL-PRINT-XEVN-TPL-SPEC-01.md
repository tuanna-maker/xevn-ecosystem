# Delta SPEC — Ma trận mẫu HĐ X.E (`template_code` × loại × thời hạn × khối)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-01` |
| **Parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` · SPEC AS-IS [`PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md) |
| **Outline** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TEMPLATES-OUTLINE-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TEMPLATES-OUTLINE-01.md) |
| **Source structure** | `docs/program/refs/2026.08.07-hop-dong-mau-X.E-templates-only.xlsx` (10 sheet mẫu) |
| **Change mode** | **ADD-only** vs SPEC-01 (packs `GENERAL`/`IT_OFFICE`/`DRIVER` + print spine) |
| **Status** | **BA LOCKED** · **SRS merge DONE** (FR-UC-BP-CORE-09d · Enterprise SRS v0.19) — **CORR-01 SUPERSEDES closed enum** (see `@CHANGE` dưới) |
| **Honesty** | `contracts_printable_ready=false` · U65 zero-seed |
| **Cấm** | Paste full body HĐ vào docs khách · copy sheet `Mã NV` / PII · seed body · claim printable UAT · sửa `apps/**` · đè Q-CTR-01/02 CLOSED · **fix cứng 8 mã / CHK IN (8)** |
| **Correction** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · [`DYNAMIC-LOCK`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) |

---

## 0. Mục tiêu

Bổ sung **8 `template_code` canonical** từ mẫu thực tế X.E (HĐTV / 12T / 24T / KXĐ × Văn phòng / Lái xe) vào print-spine đã có — **không** thay CRUD UF-HRM-02, **không** thay khung Đ.21/UNICOM, **không** thay pack SoT `IT_OFFICE`·`DRIVER`.

| Giữ từ SPEC-01 | ADD wave này |
|----------------|--------------|
| Core Đ.21 field map · clause groups · Settings library · print spine AC-CTR-PRINT-* | Ma trận `template_code` → loại HĐ + duration default + pack + clause inventory (titles) + merge fields X.E |
| Pack `GENERAL` / `IT_OFFICE` / `DRIVER` | Neo VP → `IT_OFFICE` · LX → `DRIVER` (không invent pack `OFFICE` riêng) |
| Q-CTR-01/02 CLOSED / GWC print-spine | Không mở lại; residual printable UAT vẫn DENIED |

---

## 1. As-is vs To-be (template matrix)

| | As-is (print GĐ1) | To-be (X.E matrix) |
|---|-------------------|---------------------|
| Chọn mẫu | Pack nghề (`IT_OFFICE`↔`DRIVER`) | **+** chọn `template_code` từ **open catalog** (starter 8 ví dụ + HR-added 9+) |
| Loại / thời hạn | `contract_type` catalog + ngày tay | Template **neo** loại + default duration; user vẫn sửa ngày trong biên hợp lệ |
| VP vs LX | Clause pack khác | Preview/PDF **khác** tiêu đề loại + (LX) khối GPLX + clause DRIVER |
| HĐTV vs 12T vs 24T vs KXĐ | Một body pack | Preview **khác** nhãn loại HĐ + có/không `effective_to` + pattern số HĐ |
| Excel 10 sheet | — | **8 starter** SoT examples; 2 sheet KXĐ LX = duplicate bootstrap; catalog **động** (CORR-01) |

---

## 2. Canonical `template_code` matrix (BA LOCK)

> **@CHANGE CORR-01 (2026-08-07):** §2 = **starter examples** từ Excel — **không** là closed enum / ceiling. Catalog = **open** (`hrm_contract_templates`); HR Settings CRUD mẫu **9+**. Cấm fix cứng 8 mã. Chi tiết: [`CORR-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md).

### 2.1 Tám mã starter (ví dụ X.E — không ceiling)

| `template_code` | Sheet nguồn (canonical) | Loại HĐ (business) | `term_type` | Duration default | `pack_code` | Tiêu đề in (logic) |
|-----------------|-------------------------|--------------------|-------------|------------------|-------------|---------------------|
| `XEVN_PROBATION_OFFICE` | `HĐTV (Khối VP)` | Hợp đồng thử việc | `probation` | **60 ngày** mặc định UI (user đổi trong khung pháp lý); **không** auto `effective_to` = +12/+24 tháng | `IT_OFFICE` | HỢP ĐỒNG THỬ VIỆC |
| `XEVN_FT_12M_OFFICE` | `HĐLĐ 12T (Khối VP)` | HĐLĐ xác định thời hạn 12 tháng | `definite` | **+12 tháng** từ `effective_from` | `IT_OFFICE` | HỢP ĐỒNG LAO ĐỘNG |
| `XEVN_FT_24M_OFFICE` | `HĐLĐ 24T( Khối VP)` | HĐLĐ xác định thời hạn 24 tháng | `definite` | **+24 tháng** từ `effective_from` | `IT_OFFICE` | HỢP ĐỒNG LAO ĐỘNG |
| `XEVN_INDEF_OFFICE` | `HĐLĐ KXĐTH` | HĐLĐ không xác định thời hạn | `indefinite` | Chỉ `effective_from`; **cấm** bắt buộc `effective_to` | `IT_OFFICE` | HỢP ĐỒNG LAO ĐỘNG |
| `XEVN_PROBATION_DRIVER` | `HĐTV (Khối LX)` | Hợp đồng thử việc | `probation` | **60 ngày** mặc định (như VP) | `DRIVER` | HỢP ĐỒNG THỬ VIỆC |
| `XEVN_FT_12M_DRIVER` | `HĐLĐ 12T (Khối LX)` | HĐLĐ XĐTH 12 tháng | `definite` | **+12 tháng** | `DRIVER` | HỢP ĐỒNG LAO ĐỘNG |
| `XEVN_FT_24M_DRIVER` | `HĐLĐ 24T ( Khối LX)` | HĐLĐ XĐTH 24 tháng | `definite` | **+24 tháng** | `DRIVER` | HỢP ĐỒNG LAO ĐỘNG |
| `XEVN_INDEF_DRIVER` | `HĐLĐ KXĐTH (lx- nhiều công ty)` | HĐLĐ KXĐTH | `indefinite` | Chỉ `effective_from` | `DRIVER` | HỢP ĐỒNG LAO ĐỘNG |

**Resolve rule:** chọn `template_code` → set `pack_code` + `term_type` + gợi ý ngày; HCNS **được** đổi pack trước ban hành nếu sai họ nghề (giữ BR SPEC-01) nhưng **không** được lưu template_code lệch pack (vd. `*_OFFICE` với `DRIVER`) — chặn + thông báo.

### 2.2 Dedupe sheet KXĐ Lái xe (BA LOCK)

| Sheet Excel | Quyết định | Lý do |
|-------------|------------|-------|
| `HĐLĐ KXĐTH (lx- nhiều công ty)` | **Canonical** → `XEVN_INDEF_DRIVER` | Đủ Đơn vị đa pháp nhân + GPLX + loại KXĐ |
| `HĐKXĐ ( Khối LX)` | **Alias / không tạo `template_code` riêng** | Cùng loại KXĐ + DRIVER; mẫu trống/#N/A — chỉ tham chiếu cấu trúc |
| `HĐ KXĐ (Khối LX)` | **Alias / không tạo `template_code` riêng** | Cùng loại; biến thể số `…/HĐLĐ-XE` — gộp pattern số vào keyword_map |

**Bootstrap:** **Không auto-tạo** `XEVN_INDEF_DRIVER_V2` / `XEVN_KXĐ_LX_ALT` từ sheet alias (dedupe). **CORR-01:** HR **được** tạo mã tùy chỉnh thứ 9+ qua Settings (không phải alias auto-bootstrap) — xem AC-CTR-XEVN-11.

### 2.3 Sheets ngoài SoT template (giữ outline)

| Sheet | Lý do loại |
|-------|------------|
| `Mã NV` (workbook gốc) | PII master — **không** vào repo evidence / SRS |
| `Thẻ nghiệp vụ` · vận hành ký | Ngoài print-spine HĐ |
| `Bản sao của …` | Duplicate |

---

## 3. Map `contract_type` catalog ↔ `template_code`

| `template_code` | `contract_type_key` gợi ý (logical) | Ghi chú |
|-----------------|--------------------------------------|---------|
| `*_PROBATION_*` | `probation` / HĐTV | must_keep picker UF-HRM-02; template **không** thay catalog |
| `*_FT_12M_*` | `fixed_term` (hoặc key tenant tương đương XĐTH) | Duration hint 12T |
| `*_FT_24M_*` | `fixed_term` | Duration hint 24T — **cùng** type catalog, khác template |
| `*_INDEF_*` | `indefinite` / KXĐTH | |

**BR-CTR-TPL-01:** Một `contract_type` có thể map nhiều `template_code` (12T vs 24T). SoT in = `template_code`, không chỉ type.

**BR-CTR-TPL-02:** Đổi `template_code` trên draft → re-resolve clause pack + duration default; snapshot chưa ban hành thì thay; đã `issued` → amend / version mới (BR-CTR-CL-01).

**BR-CTR-TPL-03:** `term_type=indefinite` → validate **không** yêu cầu `effective_to` để `can_issue`; `definite`/`probation` → yêu cầu cả hai ngày hợp lệ.

---

## 4. Clause inventory (titles / groups only — cấm full body)

> Body Điều = tài sản DN → Settings clause library. Dưới đây chỉ **mã nhóm + tiêu đề logic** khớp cấu trúc Excel X.E + map pack SPEC-01 §B.3.

### 4.1 Skeleton chung (mọi `template_code`)

| # | Section / Điều (title) | `clause_group` (reuse SPEC-01) | OFFICE | DRIVER |
|---|------------------------|--------------------------------|--------|--------|
| 0 | Quốc hiệu · tiêu đề · số HĐ · đơn vị | layout + `PARTIES` header | ✓ | ✓ |
| 1 | Bên A (NSDLĐ) / Bên B (NLĐ) | `PARTIES` | ✓ | ✓ + GPLX block |
| 2 | Điều 1 — Thời hạn và công việc | `TERM_PROBATION` + `JOB_DUTIES` | Nhãn loại theo template | + chức danh lái / địa điểm phân công |
| 3 | Điều 2 — Chế độ làm việc | `WORKING_HOURS` (+ PPE mỏng) | VP | + phương tiện / GTĐB gắn DRIVER |
| 4 | Điều 3 — Nghĩa vụ & quyền lợi NLĐ | `COMPENSATION` · `GRADE_RAISE` · `SOCIAL_INSURANCE` · `TRAINING` · `NDA_TRADE_SECRET` · … | NDA default on OFFICE | + `DRIVER_VEHICLE` · `DRIVER_SAFETY_ALCOHOL` · `DRIVER_LIABILITY` · thông báo hết hạn bằng lái |
| 5 | Điều 4 — Nghĩa vụ & quyền hạn NSDLĐ | (group `EMPLOYER_DUTIES` **ADD** nếu chưa có — hoặc nhánh `TERMINATION_GENERAL` sibling) | ✓ | ✓ |
| 6 | Điều 5 — Điều khoản thi hành (khi mẫu có) | `DISPUTE_LAW` / thi hành | ✓ (HĐTV/24T/KXĐ VP) | ✓ (một số mẫu LX) |
| 7 | Chữ ký hai bên | layout | ✓ | ✓ |

### 4.2 Delta DRIVER-only (bắt buộc khi `pack_code=DRIVER`)

| Clause title (logic) | `clause_group` | Mandatory |
|----------------------|----------------|-----------|
| Chấp hành luật GTĐB / sử dụng phương tiện | `DRIVER_SAFETY_ALCOHOL` / `DRIVER_VEHICLE` | Yes |
| Thông báo sắp hết hạn bằng lái / đổi CCCD | `DRIVER_LIABILITY` hoặc `TRAINING` sibling `DRIVER_LICENSE_NOTICE` | Yes |
| GPLX trên phần Bên B (field, không phải body dài) | merge fields §5 | Yes để `can_issue` |

### 4.3 Delta theo loại HĐ (cùng pack)

| Template family | Điều 1 nhãn loại (logic) | Khác biệt validate |
|-----------------|--------------------------|--------------------|
| `*_PROBATION_*` | «Hợp đồng thử việc» | Không bắt buộc full SI enrollment như HĐLĐ chính thức nếu tenant rule tắt — **không** invent: mặc định vẫn hiện clause SI nếu SPEC-01 mandatory; SA xác nhận GĐ1 |
| `*_FT_12M_*` / `*_FT_24M_*` | «HĐLĐ xác định thời hạn» + khoảng ngày | `effective_to` bắt buộc |
| `*_INDEF_*` | «HĐLĐ không xác định thời hạn» | Chỉ ngày bắt đầu |

---

## 5. Merge fields từ Excel X.E (logical)

### 5.1 Chung (OFFICE + DRIVER)

| Logical field | Excel signal (label) | Nguồn SoT | Ghi chú |
|---------------|----------------------|-----------|---------|
| `employer_legal_name` | Dòng pháp nhân đầu trang | company | Đa pháp nhân: X.E / Du lịch X.E / Visun… |
| `employer_unit_label` | Cột «Đơn vị» | company / operating unit | Picker đơn vị thuộc scope |
| `contract_number` | «Số: …» | contract (`contract_code`) | Pattern §5.3 |
| `sign_place_motto` | Quốc hiệu / Độc lập — Tự do — Hạnh phúc | template layout | Cố định layout |
| `employee_full_name` · DOB · CCCD · issue date/place · phone | Bên B | employee | PII — không vào evidence |
| `job_title` · `work_location` | Điều 1 | position + contract | |
| `effective_from` · `effective_to` | Từ ngày / đến ngày | contract | Theo `term_type` |
| `base_salary_*` · phụ cấp · thưởng | Điều 3 khối lương | **cb** snapshot | Che thiếu quyền C&B |

### 5.2 DRIVER-only (Bên B)

| Logical field | Excel label | Nguồn | Validate khi DRIVER |
|---------------|-------------|-------|---------------------|
| `driver_license_number` | Số GPLX | employee / cb | **Required** `can_issue` |
| `driver_license_class` | Hạng (D, B2, …) | employee / cb | **Required** |
| `driver_license_issued_on` | Ngày cấp | employee / cb | Required |
| `driver_license_issued_place` | Nơi cấp (Sở GTVT…) | employee / cb | Required |

**BR-CTR-TPL-04:** Template `*_OFFICE` → **không** bắt GPLX; `*_DRIVER` thiếu GPLX → chặn preview issue + liệt kê field (cùng AC-CTR-PRINT-06).

### 5.3 Pattern số HĐ (keyword_map — không hardcode FE)

| Pattern logic | Áp dụng | Ví dụ cấu trúc (không copy PII) |
|---------------|---------|----------------------------------|
| `{seq}/{yyyy}/HĐTV-{orgSuffix}` | `*_PROBATION_*` | `…/HĐTV-X.E` |
| `{seq}/{yyyy}/HĐLĐ-{orgSuffix}` | FT / INDEF mặc định X.E | `…/HĐLĐ-X.E` |
| `{seq}/{yyyy}/HĐLĐ-DLVISUN` | Khi đơn vị = Visun (mẫu 24T VP) | suffix theo `employer_unit` |
| `{seq}/{yyyy}/HĐLĐ-DLX.E` | Khi đơn vị = Du lịch X.E (mẫu KXĐ VP) | |
| `{seq}/{yyyy}/HĐLĐ-XE` | Alias lịch sử KXĐ LX | map vào cùng generator `orgSuffix=XE` |

**BR-CTR-TPL-05:** `orgSuffix` lấy từ cấu hình pháp nhân/đơn vị (Settings), không hardcode «Visun» trên FE. UF-HRM-02 `contract_code` vẫn SoT người dùng có thể sửa trước ban hành.

### 5.4 Đơn vị đa pháp nhân

| Rule | Nội dung |
|------|----------|
| **BR-CTR-TPL-06** | Header «Đơn vị» + Bên A legal name phải khớp `company_id` / operating unit trong **scope token** (group CEO rollup được chọn member; member CEO chỉ đơn vị mình). |
| **BR-CTR-TPL-07** | Đổi đơn vị trên draft → re-merge Bên A + pattern số; không đổi snapshot đã `issued`. |

---

## 6. Acceptance criteria (U65 — browser)

> Probe/API alone **không** 🟢. Zero-seed. FE sau 2xx + F5.

| Mã | Đạt khi | Không đạt khi |
|----|---------|----------------|
| **AC-CTR-XEVN-01** | Settings/catalog **open** từ API; starter **8** `XEVN_*` **có thể** có sau bootstrap/ensure (không seed body HĐ); FE **không** hardcode 8; HR **được** thêm >8 | FE list cứng 8 · API/DB chặn thêm · seed body |
| **AC-CTR-XEVN-02** | Tạo HĐ chọn `XEVN_FT_12M_OFFICE` → preview: tiêu đề HĐLĐ · nhãn XĐTH · có `effective_to` · **không** khối GPLX | Preview = registry form; có GPLX trên VP |
| **AC-CTR-XEVN-03** | Cùng NV, chọn `XEVN_FT_12M_DRIVER` → preview **có** GPLX/hạng + clause GTĐB; khác rõ so với AC-02 | VP≡LX |
| **AC-CTR-XEVN-04** | `XEVN_PROBATION_OFFICE` vs `XEVN_FT_12M_OFFICE`: tiêu đề / nhãn loại **khác** (HĐTV vs HĐLĐ) | Cùng title |
| **AC-CTR-XEVN-05** | `XEVN_FT_12M_*` vs `XEVN_FT_24M_*`: default khoảng ngày **12 vs 24** tháng (sau chọn ngày bắt đầu) | Cùng khoảng |
| **AC-CTR-XEVN-06** | `XEVN_INDEF_*`: preview nhãn KXĐTH · **không** bắt buộc ngày kết thúc để Lưu phiên bản in | Bắt `effective_to` như XĐTH |
| **AC-CTR-XEVN-07** | Đổi đơn vị pháp nhân (trong scope) → Bên A + gợi ý pattern số đổi; Network 2xx; F5 còn `template_code` | Header lệch scope / mất sau F5 |
| **AC-CTR-XEVN-08** | Regression UF-HRM-02: tạo/sửa HĐ registry không chọn print template vẫn CRUD + F5 | Vỡ registry |
| **AC-CTR-XEVN-09** | `*_DRIVER` thiếu GPLX → chặn In/PDF + liệt kê | In được thiếu GPLX |
| **AC-CTR-XEVN-10** | Bootstrap/UI **không auto-sinh** mã riêng cho sheet `HĐKXĐ` / `HĐ KXĐ` | Auto-duplicate alias starter |
| **AC-CTR-XEVN-11** | **CORR-01:** Settings tạo `template_code` thứ **9** → 2xx → list + **F5** còn → dùng trên tạo HĐ/preview | Reject «không thuộc 8» · mất sau F5 · picker không thấy mã 9 |

**J-* đề xuất (ba-docs / journey map):**  
`J-HRM-CTR-04` (starter templates → preview diff) · `J-HRM-CTR-05` (VP vs LX GPLX) · `J-HRM-CTR-06` (HĐTV vs 12T vs 24T vs KXĐ duration) · **`J-HRM-CTR-07`** (Settings mẫu 9+ → picker → preview — U65).

Giữ `J-HRM-CTR-01..03` từ SPEC-01.

---

## 7. Draft FR ADD (cho ba-docs — không wipe CORE-09a/b/c)

### FR-UC-BP-CORE-09d — Chọn mẫu HĐ theo ma trận X.E (`template_code`)

| Mục | Nội dung |
|-----|----------|
| Tác nhân | HCNS · C&B |
| Tiên quyết | Có NV trong scope; mẫu `template_code` hiệu lực |
| BR | BR-CTR-TPL-01..07 · BR-CTR-CL-02..04 |
| must_keep | UF-HRM-02 · CORE-09a/b/c |

#### Diễn biến (cân bằng)

| # | Tương tác | Điều kiện / quy tắc | Kết quả hoặc lỗi |
|---|-----------|---------------------|------------------|
| 1 | Mở tạo / sửa HĐ | Đúng pháp nhân | Form lõi + danh sách mẫu **active từ catalog** (starter + HR-added) |
| 2 | Chọn `template_code` | Mẫu active | Gợi ý pack · loại · ngày |
| 3 | Hệ thống merge | Đủ master / C&B tùy quyền | Preview theo mẫu |
| 4 | VP vs LX | Pack từ template | Có/không GPLX + clause DRIVER |
| 5 | Thiếu bắt buộc | Field Đ.21 / GPLX DRIVER / clause mandatory | Chặn — liệt kê |
| 6 | Lưu phiên bản in | `can_issue` | 2xx · list hiện `template_code` |
| 7 | F5 | — | Còn đúng mẫu + snapshot |
| Thành công | — | — | Bản xem trước/PDF đúng loại HĐ đã chọn |

```mermaid
sequenceDiagram
  autonumber
  actor H as HCNS
  participant UI as Màn Hợp đồng
  participant M as Thư viện mẫu
  participant API as Dịch vụ HĐ
  H->>UI: Tạo hợp đồng và chọn mẫu
  UI->>M: Lấy mẫu hiệu lực theo mã
  M-->>UI: Loại thời hạn và gói nghề
  UI->>API: Ghép hồ sơ và điều khoản
  alt Thiếu GPLX với mẫu lái xe hoặc thiếu trường bắt buộc
    UI-->>H: Chặn lưu in và liệt kê thiếu
  else Đủ điều kiện
    H->>UI: Lưu phiên bản và xem trước
    UI->>API: Lưu ảnh chụp theo mẫu
    API-->>UI: Thành công
    UI-->>H: Danh sách cập nhật; tải lại trang vẫn còn mẫu
  end
```

---

## 8. must_keep / forbidden

| must_keep | forbidden |
|-----------|-----------|
| UF-HRM-02 / J-HRM-03 registry CRUD + F5 | Paste full Điều / body Excel vào SRS khách |
| Print-spine GWC + AC-CTR-PRINT-01..08 | Claim `contracts_printable_ready=true` |
| Q-CTR-01 CLOSED (group publish Option A) · Q-CTR-02 residual NFR | Seed HĐ / inbox để pass QA |
| Pack codes SPEC-01 `IT_OFFICE`·`DRIVER`·`GENERAL` | Auto-bootstrap mã từ sheet alias KXĐ (AC-10) |
| Open catalog + starter 8 (CORR-01) | Closed enum / CHK `code IN (8)` / FE hardcode 8 / API reject 9th |
| U65 zero-seed · soft-delete · scope parity | Sửa `apps/**` trong wave governance này |
| UNICOM/Đ.21 khung | Đè / wipe CORE-09 · EMP Q-CTR đã CLOSED |

---

## 9. Mapping Tech / DATA (gợi ý SA · ba-data — không physicalize ở seat này)

| Artifact | Delta |
|----------|-------|
| `hrm_contract_template.code` | **Open** unique code (+ optional starter 8 `XEVN_*` + legacy) — **cấm** CHK IN (8) |
| `hrm_contract_template.pack_code` | FK logic theo bảng §2.1 |
| `hrm_contract_template.default_term_type` · `default_duration_months` | `probation`/null · 12 · 24 · null indefinite |
| `keyword_map` | §5 fields + số HĐ pattern |
| `employee_contracts.template_code` / `template_id` | Snapshot khi ban hành |
| DRIVER PII fields | Cột employee hoặc JSON cb — ba-data chốt |

---

## 10. Honesty & residual

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| Print-spine GWC | Giữ — **không** = module printable UAT |
| Residual sau SPEC | **CORR-01** supersede closed enum → sa DOC-DELTA nếu cần → BE/FE **dynamic catalog** → QA AC-CTR-XEVN-01..11 (gồm 11) U65 |

---

## 11. Handoff

| next_owner | ba-docs (historical) · **CORR-01** → pm |
| evidence | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-01.md` · corr: `…-corr-01.md` |
| ack_status | PASS_TO_PM |

---

## @CHANGE — CORR-01 (2026-08-07) sponsor dynamic catalog

| Field | Value |
|-------|--------|
| **work_item** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01` |
| **Lock** | [`DYNAMIC-LOCK`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) · [`CORR-01`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) |
| **SUPERSEDE** | Closed enum «đúng 8 mã» · FORBIDDEN 9th · AC-01 ceiling · FR Diễn biến #1 «8 mẫu» as exclusive list |
| **KEEP** | Starter matrix §2.1 · packs · UF-HRM-02 · print-spine · Q-CTR · AC-02..10 (10 = bootstrap dedupe only) |
| **ADD** | AC-CTR-XEVN-11 · BR-CTR-TPL-DYN-01..07 · J-HRM-CTR-07 · BR-UI-POPUP-AUTO-CLOSE-01 (Tự động đóng Popup Modal & Refresh danh sách khi Submit thành công) |
| **Honesty** | `contracts_printable_ready=false` |

---

## 12. Quy tắc phản hồi UI Popup Modal & Tự động Refresh Danh Sách (BR-UI-POPUP-AUTO-CLOSE-01)

1. **Busy State:** Mọi nút bấm Submit / Lưu trên Popup Dialog Cài đặt (*Sửa mẫu HĐ*, *Thêm/sửa điều khoản*, *Master data*, *Token Merge*, *Bảo hiểm*, *Tuyển dụng*...) phải có trạng thái `saveBusy` / `disabled` hiển thị visual loader `Đang lưu...` để chống double submit.
2. **Auto Close Dialog:** Khi API phản hồi thành công (HTTP 200/201), Modal Dialog **BẮT BUỘC TỰ ĐỘNG ĐÓNG LẠI** (`closeDialog()` / `setOpen(false)`).
3. **Auto List Refresh:** Sau khi đóng Modal Dialog, hệ thống **BẮT BUỘC** gọi hàm cập nhật danh sách (`loadAll()` / `loadRows()` / `invalidateQueries()`) để danh sách ngoài màn hình làm mới dữ liệu tự động mà không bắt người dùng bấm F5.

