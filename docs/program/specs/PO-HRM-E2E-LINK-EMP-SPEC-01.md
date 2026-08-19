# PO-HRM-E2E-LINK-EMP-SPEC-01 — Spine liên kết E2E Nhân sự (NV · HĐ · BH · QSĐ)

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-EMP-SPEC-01` |
| program | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| lane | governance · ba-process · senior BA accountability |
| change_mode | ADD delta draft only · **NO CODE** `apps/**` · **no merge** file khách |
| date | 2026-08-06 |
| SoT khách | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` (FR-UC-BP-CORE-01/02/08/09/10 + inventory CORE-*) |
| SoT đội ngũ | `docs/hrm/SRS.md` §16.0 **BR-HRM-MD-01** · **AC-HRM-PICKER-01** · UC-HRM-21/25/27 · E1-A A1/A7–A8 · E3 INS |
| Fidelity matrix | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 / §4.1–4.3 |
| Hire-to-Pay | `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md` E2E-SPINE-01 **bước 5** |
| Journey / UF | J-HRM-01..04 · UF-HRM-01..04 · J-HRM-IM-01 |
| Pattern twin | `docs/program/specs/PO-HRM-REC-E2E-LINKAGE-SPEC-01.md` (class C-*) |
| honesty | `employees_e2e_linkage_ready=false` · `hrm_personnel_uat_ready=false` · U65 zero-seed · **cấm** claim UAT-ready |
| ack_status | **PASS_TO_PM** |

---

## 0. Verdict thẳng (sponsor challenge REC → Nhân sự)

Sponsor đúng khi mở rộng lớp **liên kết nghiệp vụ** (free-text vs SELECT, orphan screen, spine gãy) sang Nhân sự. Journey map J-HRM-01..04 / UF-HRM-01..03 có cờ 🟢 **load / cross-nav / mutate hẹp** — **không** đồng nghĩa Hire-to-Pay bước 5 + vòng C&B + QSĐ→lịch sử công tác đã khóa end-to-end.

| Layer | Honesty |
|-------|---------|
| **Enterprise spine** | CORE-01 công khai ≠ CORE-02 C&B; HĐ/BH là nguồn biến tiền–BH; QSĐ bổ nhiệm/thuyên chuyển **phải** phản ánh lịch sử công tác; CORE-09 mẫu HĐ điền sẵn; CORE-10 timeline BH (đóng/ngừng/tạm hoãn). |
| **Team SRS picker** | **BR-HRM-MD-01** / **AC-HRM-PICKER-01** + E1-A (A1 Work History · A7–A8 Contracts) + E3 insurers/types — đã cấm free-text SoT trên consumer. |
| **FE skim (UI only)** | Dept/chức danh form NV + loại HĐ + loại QSĐ + insurer/type/policy **đã có** CatalogSearchPicker ở nhiều chỗ; **còn** free-text / optional khóa / tách C&B / WH không neo QSĐ — pattern giống REC UV. |
| **Fidelity matrix** | FK `employee_id` density ≠ UX spine PASS; decisions Implemented-empty / density mở; insurance list API đã refresh nhưng timeline CORE-10 chưa nghiệm thu. |

**Kết luận BA:** Lõi entity (NV master → HĐ/BH FK → QSĐ list) **có** trên giấy + runtime một phần; **depth liên kết** (C&B tách vòng, WH←QSĐ, template HĐ, timeline BH, WH position picker) = **spec_gap nông + impl_gap** — **không** claim personnel UAT-ready.

---

## A. Spine table — nút/tab/modal → FR/UC → khóa mang → màn kế

> Gap class (cột): `ok` | `impl_gap` | `spec_gap` | `out_mvp` | `broken`  
> Khóa mang = identity nghiệp vụ user mang sang bước sau (không chỉ HTTP 200).

| # | Surface UI (HR embed) | Actor | FR / UC SoT | Khóa mang | Màn / UC kế (Hire-to-Pay / nội bộ) | FE/UI does (skim) | Gap |
|---|----------------------|-------|-------------|-----------|-----------------------------------|-------------------|-----|
| 1 | Menu **Nhân sự** list · row · Eye | HCNS · Group CEO | UC-HRM-21 · FR-UC-BP-CORE-01 · J-HRM-02 · UF-HRM-01/03 | `employee_id` · `company_id` (slug / `main` rollup) | Profile `/employees/:id` → tab HĐ / BH / Career | List→detail navigate; scope parity historically fixed | **ok** (cross-nav) — residual C&B fields xem #3 |
| 2 | **Thêm / Sửa NV** `EmployeeFormDialog` | HCNS | CORE-01 (công khai) · BR-HRM-MD-01 | `employee_id` (sau create) · `department`/`position` = catalog **code** | Profile · tạo HĐ (#5) · Hire bước 5 | Dept/position = CatalogSearchPicker; vẫn có field **salary / bank / tax / SI numbers** trên cùng form metadata | **impl_gap** C&B trên form công khai (#D1) |
| 3 | Profile tabs Core: general · work · **contract** · **salary** | HCNS · C&B | CORE-01 vs CORE-02 | `employee_id` | Tab contract → `EmployeeContracts`; salary panel; insurance group | Salary/C&B nằm trên profile strip Core — lệch «chỉ vòng C&B / HĐ–BH» | **impl_gap** + **spec_gap** map IA (#D1) |
| 4 | Profile **Lịch sử công tác** `EmployeeWorkHistory` | HCNS | CORE-01 «QSĐ → lịch sử»; E1-A **A1** | `employee_id` · `position_key` (SoT) · optional `decision_id` | Career / quyết định | Form **position = Input free-text**; **không** neo QSĐ đã hiệu lực | **impl_gap** (#D2) · shallow nếu thiếu FR create-from-QSĐ |
| 5 | Menu **Hợp đồng** list · Eye · link tên NV | HCNS · C&B | UC-HRM-25 · J-HRM-01/03 · UF-HRM-02 · BR-LINK-02 | `contract_id` · `employee_id` | Profile NV · phụ lục · payroll biến C&B | Click NV → `/employees/:id`; Eye → view dialog | **ok** deep-link (J-HRM-01/03 🟢) |
| 6 | **Tạo / sửa HĐ** dialog (Contracts + profile `EmployeeContracts`) | HCNS · C&B | UC-HRM-25 · FR-UC-BP-CORE-09 (mẫu) · E1-A A7–A8 · FR-HRM-SC-CT-01 | `employee_id` **bắt buộc** · `contract_id` · `contract_type` (catalog) · `position_key` | Profile tab HĐ · CORE-02 biến · kỳ lương | Employee Select + `contract_types` picker; **`employee_name` Input sửa tay**; prefill NV đầu danh sách khi mở create; **không** surface «chọn mẫu → điền sẵn» CORE-09 | **impl_gap** name denorm (#D3) · **C-ORPHAN-SCREEN** mẫu HĐ (#D4) |
| 7 | Contracts **Import** / **Export** | HCNS | Matrix Import lane · FR-HRM-IM-* (NV); HĐ import team | Preview session / file | List HĐ sau commit (nếu có) | Export = client XLSX từ list đã load; Import dialog riêng | Export = client aggregate (**P2** honesty) · Import HĐ cần AC riêng vs J-HRM-IM-01 NV |
| 8 | Menu **Bảo hiểm** list · link NV · Add | HCNS · C&B | UC-HRM-25 · FR-UC-BP-CORE-10 · J-HRM-04 · UF-HRM-04 · E3 | `employee_id` · `policy_id` · participant/record id · mức theo ngày | Profile insurance · PAY trần BH · timeline | Add: employee picker + policy_id + insurer/type catalog; block khi 0 policy; list→NV link | **ok** participant link lõi · **impl_gap** timeline đóng/ngừng/tạm hoãn (#D5) |
| 9 | **Policy master** panel (Insurance) | C&B | E3 · CORE-10 tiên quyết mức | `policy_id` | Add participant (#8) | CRUD policy + pickers | **ok** neo policy trước link (pattern REC YCTD) |
| 10 | Insurance Import / Export | HCNS | — (thiếu FR Enterprise riêng) | file / list | List BH | Export client; Import dialog | **C-SPEC-SHALLOW** + P2 orphan export (#D8) |
| 11 | Menu **Quyết định** list · tabs loại · create | HCNS · Lãnh đạo | UC-HRM-27 · CORE-01 BR lịch sử · BR-DEC-* | `decision_id` · `employee_id` (spine) · `decision_type` · `position_key` · `effective_date` | Profile work history · org chart | `decision_types` picker; position_key bắt buộc trên FE; validate UI **không** bắt `employee_id` — chỉ `decision_code` + `employee_name` + `title`; BE `employee_id` **optional**, `employee_name` required | **impl_gap** + **spec_gap** (#D6) |
| 12 | QSĐ list → click NV | HCNS | J-* decisions↔employee · BR-DEC-05 | `employee_id` | Profile | Link khi có `employee_id`; row chỉ tên text nếu thiếu id | **impl_gap** khi tạo thiếu id |
| 13 | Hire-to-Pay **bước 5** (sau REC hire) | HCNS | E2E-SPINE-01 #5 · FR-UC-BP-REC-07 → CORE | `employee_id` từ hire · `company_id` · HĐ active | Payroll bước 6 | Hire bind có; tạo HĐ/BH sau hire **không** auto-gate «đã có HĐ active» trên spine nghiệm thu | **C-SPINE-BREAK** process (#D7) — AC bước 5 chưa khóa Diễn biến |
| 14 | Employees **Import Excel** preview | HCNS | FR-HRM-IM-01 · J-HRM-IM-01 | dryRun session | Cancel → list unchanged | Preview non-persist PASS local (journey) | **ok** preview · IM-02 commit **out** claim này |
| 15 | OCR giấy tờ | — | UC-BP-CORE-04 | — | — | — | **out_mvp** (OUT) |

### A.1 Thuật ngữ khóa (chống hiểu sai)

| UI / sponsor nói | SoT |
|------------------|-----|
| Form Nhân sự có lương / STK / MST / số BH | **CORE-02 / HĐ–BH** — không SoT trên hồ sơ công khai CORE-01 |
| Lịch sử công tác gõ tay chức danh | Snapshot chỉ hợp lệ nếu **derived** từ QSĐ/catalog `position_key` — cấm free-text SoT (BR-HRM-MD-01 · E1-A A1) |
| Tên NV trên form HĐ/QSĐ | Denorm hiển thị OK; **khóa mang** = `employee_id` thuộc scope |
| «Đã có menu HĐ/BH/QSĐ» | ≠ Hire-to-Pay bước 5 PASS · ≠ CORE-09/10 PASS |
| J-HRM-01..03 🟢 | Cross-nav / mutate hẹp — **không** đóng C-* orphan field |

---

## B. Defect scorecard (class C-*)

| ID | Class | UI symptom | Spec says | Code/UI does | Verdict | P |
|----|-------|------------|-----------|--------------|---------|---|
| **D1** | **C-SPINE-BREAK** (+ C-ORPHAN-FIELD) | Tạo/sửa NV và tab Core **salary** nhập lương / NH / MST / số BH trên hồ sơ «Nhân sự» | Enterprise: lương·NH·MST·BH chi tiết **chỉ** CORE-02 / module HĐ–BH; CORE-01 không lộ C&B | `EmployeeFormDialog` schema + metadata fields `salary`, `bank_*`, `tax_code`, `*_insurance_number`; profile pin `salary` in Core | **impl_gap** (lệch vòng) · **spec_gap** nông nếu IA profile chưa map «C&B-only surface» | **P0** |
| **D2** | **C-ORPHAN-FIELD** | Lịch sử công tác: ô **Vị trí** gõ tay | Team E1-A **A1** + BR-HRM-MD-01: position = catalog picker / `position_key`; Enterprise: lịch sử từ QSĐ bổ nhiệm/thuyên chuyển | `EmployeeWorkHistory` `Input` `formData.position`; không `CatalogSearchPicker` / không `position_key` | **impl_gap** (team lock đã có) | **P0** |
| **D3** | **C-ORPHAN-FIELD** | Form HĐ: **Tên nhân viên** vẫn Input sửa được song song Select NV | Khóa mang `employee_id`; tên = denorm từ hồ sơ; BR-LINK-02 FK hợp lệ | Select `employee_id` + Input `employee_name` onChange tự do; submit bắt cả hai | **impl_gap** (denorm editable) | **P1** |
| **D4** | **C-ORPHAN-SCREEN** | Không thấy luồng «chọn mẫu HĐ → xem trước điền sẵn → lưu phiên bản» | **FR-UC-BP-CORE-09** MVP EXPAND — mẫu tenant + fill từ hồ sơ/C&B | CRUD HĐ thủ công + Import/Export; không wizard mẫu | **impl_gap** product · **spec_gap** nếu Diễn biến CORE-09 chưa đủ AC FE | **P1** |
| **D5** | **C-SPINE-BREAK** | BH = gắn participant/policy; thiếu action **đóng / ngừng / tạm hoãn** + dòng timeline mức | **FR-UC-BP-CORE-10** timeline + action; kỳ lương đọc mức hiệu lực | AddInsurance + policy master + rates trên form; không Diễn biến tạm hoãn/ngừng rõ trên UI | **impl_gap** · **C-SPEC-SHALLOW** Diễn biến FE AC | **P0** |
| **D6** | **C-SPINE-BREAK** (+ C-ORPHAN-FIELD) | Tạo QSĐ: có thể Lưu với **tên** mà không bắt buộc chọn NV; QSĐ hiệu lực **không** sinh dòng lịch sử công tác | Enterprise CORE-01: QSĐ bổ nhiệm/thuyên chuyển đã hiệu lực → lịch sử công tác. Team: `employee_name` required; `employee_id` optional (BR-DEC-05) — **mâu thuẫn** spine CAREER | FE validate thiếu `employee_id`; BE DTO `employee_id?` + `employee_name!`; WH CRUD tách, không consume `decision_id` | **spec_gap** (Enterprise vs team optional) + **impl_gap** (không ghi WH) | **P0** |
| **D7** | **C-SPINE-BREAK** | Sau hire: hồ sơ NV mở được nhưng **không** có AC cứng «HĐ active cùng company + sẵn sàng payroll» trên cùng chuỗi U65 | E2E-SPINE-01 bước 5: mở hồ sơ + HĐ active cùng `company_id` → bước 6 lương | Hire link + menus độc lập; không gate/checklist bước 5 trên giấy nghiệm thu | **spec_gap** (thiếu FR/AC bước 5) · process **impl_gap** sau confirm | **P0** |
| **D8** | **C-ORPHAN-SCREEN** | Nút Export HĐ/BH tải XLSX từ client list | Enterprise không FR export HĐ/BH riêng; NV import có FR-IM-01 | `XLSX` client-side trên filtered rows | **out_mvp** / ACCEPTED_AS_IS candidate (P2) — **cấm** claim server export LIVE | **P2** |
| **D9** | **C-SPEC-SHALLOW** | Form create HĐ/BH/QSĐ: Diễn biến Enterprise mỏng so với AC picker team | CORE-09/10 có FR 7 mục nhưng consumer create HĐ list + QSĐ→WH thiếu Diễn biến depth (giống REC UV) | Team SRS/E1/E3 sâu hơn Enterprise trên picker | **spec_gap** — ba-docs ADD | **P0** (docs) |
| **D10** | **C-CONSOLE-CRASH** | (Seat này) không có log sponsor riêng NV như REC plan | — | Không triage console mới trong wave paper | **ok** / N/A seat — nếu QA thấy dialog portal/DnD trên NV → mở WI FE riêng | — |
| **D11** | — | Prefill HĐ = NV đầu list khi mở (+) | Tiên quyết: user **chọn** NV từ list/profile trước hoặc picker bắt buộc không auto-gán nhầm | Auto `firstEmp` khi dialog open | **impl_gap** UX (risk sai NV) | **P1** |
| **D12** | **C-ORPHAN-FIELD** (residual) | Catalog dept/position trống → user kẹt hoặc lưu lệch | Picker từ XBOS publish/pull · BR-HRM-MD-01 | EmployeeForm dùng catalogs; empty = block/partial tùy data | **ok** pattern nếu empty-state CTA Settings; **impl_gap** nếu vẫn lưu text lệch | **P1** khi empty |

---

## C. Focus P0 — pattern giống REC

| REC pattern | Nhân sự analog | Defect IDs | Bắt buộc khi fix |
|-------------|----------------|------------|------------------|
| Free-text vị trí thay SELECT YCTD/catalog | WH **position** Input; (đã tốt: form NV dept/position picker) | **D2** | `position_key` SoT; cấm Input SoT |
| Form không bắt buộc khóa từ bước trước | QSĐ không bắt `employee_id`; HĐ prefill NV đầu list | **D6**, **D11** | Create path: picker NV bắt buộc (bổ nhiệm/thuyên chuyển/kỷ luật gắn người); HĐ create từ profile preselect hoặc bắt chọn rõ |
| Deep-link list→detail gãy | J-HRM-01..04 đã 🟢 — **không** reopen trừ regression | — | must_keep scope parity `main` rollup |
| Import/Export orphan | Export client HĐ/BH; Import HĐ/BH ≠ J-HRM-IM-01 | **D8** | Honesty label; không claim server export; Import HĐ/BH cần AC riêng hoặc GĐ2 |
| Picker chức danh/PB không neo XBOS catalog | Form NV đã neo; WH chưa; QSĐ position_key đã; HĐ position_key profile đã | **D2**, **D12** | Mọi consumer = cùng `job_titles` / dept catalog codes |
| SoT entity lệch MVP (REC tin đăng) | C&B trên form công khai; salary Core tab | **D1** | Tách surface / ẩn field / redirect CORE-02 |
| Stub empty sai entity (REC compare) | CORE-09 không có màn; CORE-10 thiếu action timeline | **D4**, **D5** | ADD AC + Dev sau confirm — không fake timeline |
| Hire không nối bước sau | Bước 5 thiếu AC HĐ active | **D7** | Checklist FE hoặc AC QA cứng bước 5→6 |

**Positive (không đụng đè 🟢):**

- J-HRM-01/02/03/04 cross-nav link `employee_id` trên list HĐ/BH khi id có.
- EmployeeForm dept/position CatalogSearchPicker (CODE-MEMORY cấm free-text position).
- Contracts/EmployeeContracts `contract_types` + position_key pickers.
- Decisions `decision_type` + position_key gate trên FE.
- Insurance: `employee_id` + `policy_id` + insurer/type catalog (E3).
- J-HRM-IM-01 preview NV non-persist.

---

## D. Draft SRS ADD (bullet) — **MERGED** `PO-HRM-E2E-LINK-EMP-DOCS-01` (2026-08-06)

> **Status:** Enterprise merge **DONE** (v0.12 stamp; tip có thể 0.13 sau PAY). Evidence: `docs/qa/evidence/po-hrm-e2e-link-emp-docs-01.md`. ADD-only · no wipe · no_prompt_echo.

### D.1 EXPAND **FR-UC-BP-CORE-01 / 02** — ranh giới field + AC FE

- Liệt kê field **cấm** trên form/màn hồ sơ công khai (lương CB, PC tiền, NH, MST, số sổ BH chi tiết).
- AC-CORE-PUB-01: vai trò không C&B không thấy/sửa field mật trên `/employees` create-edit và tab công khai.
- AC-CORE-CB-01: biến mật chỉ qua surface HĐ–BH / màn C&B; F5 không lộ trên CORE-01.
- Map IA: tab Profile `salary` = C&B-gated hoặc chuyển nhãn/route HĐ–BH.

### D.2 ADD **FR-UC-BP-CORE-01a** (hoặc EXPAND CORE-01) — QSĐ hiệu lực → lịch sử công tác

- Tiên quyết: QSĐ loại bổ nhiệm/thuyên chuyển (và loại cấu hình tenant) ở trạng thái hiệu lực + `employee_id` bắt buộc.
- Diễn biến: Lưu QSĐ 2xx → tạo/cập nhật dòng lịch sử (`position_key`, dept, effective_date, `decision_id`) · F5 profile thấy dòng · cấm chỉ ghi `employee_name` không id với các loại này.
- AC-DEC-WH-01..04: bắt `employee_id`; WH có `decision_id`; sửa QSĐ/hủy theo BR; không free-text position trên dòng auto.

### D.3 EXPAND **E1-A A1 / BR-HRM-MD-01** (team) + mirror Enterprise — Work History picker

- Mọi create/update WH: `position_key` + dept code từ catalog; UI CatalogSearchPicker; reject free-text SoT.
- AC-WH-PICK-01..03 khớp AC-HRM-PICKER-01.

### D.4 EXPAND **FR-UC-BP-CORE-09** — AC browser mẫu HĐ

- Empty 0 mẫu → CTA cấu hình mẫu; không Lưu phiên bản giả.
- Preview điền từ hồ sơ + C&B đủ quyền; thiếu field → chặn + liệt kê.
- AC-CTR-TPL-01..05 (U65 FE).

### D.5 EXPAND **FR-UC-BP-CORE-10** — AC action timeline

- Action Đóng / Ngừng / Tạm hoãn + đổi mức + ngày hiệu lực; lịch sử không bị ghi đè im lặng.
- AC-SI-TL-01..06; kỳ lương đọc mức (trace PAY) = residual PAY seat.

### D.6 ADD — Hire-to-Pay **bước 5** AC (program spine)

- Sau hire: profile `employee_id` + cùng `company_id` · tồn tại HĐ `active` (hoặc trạng thái SoT) · optional BH participant nếu BR bắt buộc trước lương.
- AC-HTP-05-01..03: F5 còn HĐ; member CEO không thấy ngoài CT; thiếu HĐ → payroll bước 6 🟡 BLOCKED rõ (không seed).

### D.7 DOC-DELTA team **BR-DEC-05**

- Đổi: với `decision_type` ∈ {bổ nhiệm, thuyên chuyển, … configurable} → `employee_id` **required**; giữ optional chỉ cho loại không gắn người (nếu sponsor xác nhận có loại đó).
- Đồng bộ Enterprise vs `docs/hrm/SRS.md` UC-HRM-27.

---

## E. P0_fix_queue (PM) — **NO implement** trong seat này

| Priority | work_item_id (đề xuất) | Role | Entry | Exit |
|----------|------------------------|------|-------|------|
| 1 | `PO-HRM-E2E-LINK-EMP-DOCS-01` | **ba-docs** | Sponsor CONFIRM §D bullets | Merge ADD-only Enterprise (+ team BR-DEC-05 delta) · evidence path |
| 2 | `PO-HRM-E2E-LINK-EMP-SA-01` | **sa** | Docs merge D.2/D.5/D.6 | TechSpec F.1 + DB/API: `decision_id`→WH; insurance timeline actions; HTP-05 fields — **HOLD code** đến confirm |
| 3 | `PO-HRM-E2E-LINK-EMP-BE-01` | **dev-be** | SA DB/API ready | `employee_id` required theo loại QSĐ; WH write-on-decision; SI timeline APIs; regression jest scope — U65 no seed |
| 4 | `PO-HRM-E2E-LINK-EMP-FE-01` | **dev-fe** | BE contract + docs | WH CatalogSearchPicker; ẩn/tách C&B trên EmployeeForm; QSĐ bắt NV; HĐ name read-only denorm; bỏ/auto-prefill an toàn; CORE-10 actions UI |
| 5 | `PO-HRM-E2E-LINK-EMP-FE-TPL-01` | **dev-fe** | D.4 confirm | Wizard mẫu HĐ CORE-09 hoặc hide CTA đến khi sẵn sàng (honesty) |
| 6 | `PO-HRM-E2E-LINK-EMP-QA-01` | **qa** | FE/BE P0 đóng | Browser U65: D1–D7 · J-HRM-01..04 regression · UF-HRM-01..04 · bước 5 HTP · **cấm** seed |
| 7 | (song song docs) | **ba-docs** / **pm** | — | P2 export honesty note — **không** chặn P0 |

**FORBIDDEN cascade:** seed để có QSĐ/HĐ/BH cho PASS · claim `hrm_personnel_uat_ready` · đè J-HRM-01..03 không regression · mở OCR CORE-04 · PM/Composer sửa `apps/**`.

```text
Sponsor CONFIRM §D
  → PO-HRM-E2E-LINK-EMP-DOCS-01 (ba-docs)
  → PO-HRM-E2E-LINK-EMP-SA-01 (sa Tech/DB/API)
  → PO-HRM-E2E-LINK-EMP-BE-01 + PO-HRM-E2E-LINK-EMP-FE-01 (parallel sau SA)
  → PO-HRM-E2E-LINK-EMP-FE-TPL-01 (CORE-09 — có thể sau P0 D1/D2/D5/D6)
  → PO-HRM-E2E-LINK-EMP-QA-01
  → QC hẹp — employees_e2e_linkage_ready vẫn false đến khi D1/D2/D5/D6/D7 đóng
```

---

## F. Honesty locks

| Flag | Value |
|------|-------|
| `employees_e2e_linkage_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| J-HRM-01..04 journey 🟢 | **must_keep** cross-nav — ≠ E2E linkage closed |
| UF-HRM-01..03 matrix 🟢 | mutate hẹp — residual C-* vẫn mở |
| U65 zero-seed | **true** |
| Fidelity G-FID | ≠ UX E2E linkage PASS |
| CORE-04 OCR | **OUT** |

---

## G. BA accountability (blunt)

1. Enterprise đã đúng hướng **tách C&B** và **QSĐ→lịch sử** — depth consumer (WH picker, bắt `employee_id`, timeline BH, HTP bước 5) **nông** → **spec_gap** §D, không chỉ đổ Dev.
2. Team **BR-HRM-MD-01 / E1-A A1** đã cấm free-text WH — FE WH vẫn Input = **impl_gap** rõ (cùng class REC position).
3. BR-DEC-05 `employee_id` optional **xung đột** spine CAREER Enterprise → ba-docs phải hòa trước Dev.
4. Không được dùng J/UF 🟢 để tuyên bố Nhân sự «liên kết xong».

---

## Completion contract

- `completion_report`: Đã phát hành spine §A, scorecard §B (D1–D12), focus P0 kiểu REC §C, draft SRS ADD §D, P0_fix_queue §E; honesty false; **không** sửa `apps/**`; **không** merge SRS khách; **không** claim UAT-ready.
- `next_owner`: **pm** (intake + confirm sponsor §D) → **ba-docs** `PO-HRM-E2E-LINK-EMP-DOCS-01` (sau confirm).
- `next_dispatch_prompt`: (copy-ready bên dưới)
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
program: PO-HRM-ALL-MENU-E2E-LINK-01

entry_criteria:
  - Sponsor CONFIRM draft §D trong docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md
  - read_first: SPEC-01 §D + SRS_HRM_ENTERPRISE.md CORE-01/02/09/10 + docs/hrm/SRS.md UC-HRM-27 BR-DEC-05 + BR-HRM-MD-01

task:
  - ADD-only merge Enterprise: D.1 C&B boundary AC · D.2 QSĐ→WH FR · D.3 WH picker · D.4 CORE-09 AC · D.5 CORE-10 timeline AC · D.6 HTP bước 5 AC
  - DOC-DELTA team BR-DEC-05: employee_id required cho loại QSĐ gắn người
  - no_prompt_echo · no wipe FR · không apps/**

exit_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-docs-01.md
  - completion_report + next_dispatch_prompt → sa PO-HRM-E2E-LINK-EMP-SA-01
  - ack_status PASS_TO_PM

cấm: apps/** · seed · claim hrm_personnel_uat_ready
```
