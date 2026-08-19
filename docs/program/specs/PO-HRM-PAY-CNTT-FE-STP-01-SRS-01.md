# SRS — PO-HRM-PAY-CNTT-FE-STP-01 (Slice-Specific)

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-PAY-CNTT-FE-STP-01` |
| **parent** | `PO-HRM-PAY-CNTT-UI-SCREEN-01` |
| **lane** | `ba-process` → handoff `dev-fe` |
| **component** | `PayPolicyPackList` + `PayPolicyPackDetail` |
| **screen_id** | `STP-POLICY-PACK` — L4 Thiết lập lương |
| **ref_index** | `UI-HRM-PAY-STP-SPEC-INDEX.md` §4 L4 |
| **ref_ui** | `UI-HRM-PAY-STP-POLICY-PACK.md` |
| **ref_sheet** | `PO-HRM-PAY-CNTT-SHEET-TEMPLATE-SPEC-01.md` §4–§6 |
| **date** | 2026-08-12 |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator HOLD · process amounts không LIVE |

---

## UC-BP-PAY-STP-01: CHUNG Policy Pack CRUD

- Scope: CHUNG pay-policy-packs CRUD — thang bậc QĐ 2A/127A
- Actor: Payroll Admin (C&B tập đoàn — `scope=CHUNG`)
- Pre: payroll admin role · token tenant chính
- Trigger: User clicks "Thiết lập lương > Chương trình chung" (TIẾNG VIỆT — không CHUNG/RIÊNG, không gộp scope trên 1 form)
- Flow: List (filter CHUNG) → Click [+ Thêm gói] → Nhập mã/tên → Rate Config → Lưu → Row cập nhật list → F5 kiểm tra dòng còn
- AC: AC-PAY-STP-01-01..AC-PAY-STP-01-05 · AC-PAY-STP-GLOBAL-01 · AC-PAY-STP-GLOBAL-02
- API: `POST /pay-policy-packs` · `PATCH /pay-policy-packs/:id` (`scope=CHUNG`)
- Component: `PayPolicyPackList` (filter tab CHUNG) + `PayPolicyPackDetail` (form)
- **BR-PAY-STP-01 (Cấm):** C&B OU (không phải C&B tập đoàn) mở CHUNG → 403 banner — không toast success message, không auto-redirect sang RIÊNG.
- **AC-PAY-STP-GLOBAL-01 (mọi mutate CHUNG+RIÊNG):** POST/PATCH → 2xx → list row cập nhật → F5 → row vẫn còn (scope parity — không mất dòng sau reload).
- **AC-PAY-STP-GLOBAL-02:** OU scope chỉ thấy pack cùng `business_line_tag` của OU mình — không leak pack BP khác qua filter.

### AC-PAY-STP-01-01 — CHUNG pack tạo mới Lưu 2xx
PASS khi: C&B tập đoàn → tab CHUNG → [+ Thêm gói] → nhập `code`/`nameVi` không trùng → Lưu → `POST` 2xx → row mới xuất hiện list → F5 còn.
FAIL khi: 201 nhưng F5 mất row · trùng mã không bắt · toast success mà row không thêm.

### AC-PAY-STP-01-02 — CHUNG pack cập nhật rateParams Lưu 2xx
PASS khi: Click row → tab Rate params → sửa `kpi_threshold_*` · `bcc_std` → Lưu → `PATCH` 2xx → tab hiển thị giá trị mới → F5 còn.
FAIL khi: PATCH 2xx nhưng FE vẫn hiển thị giá trị cũ · nhập string vào field Number không block.

### AC-PAY-STP-01-03 — CHUNG pack Archive
PASS khi: Click [Ngưng/Archive] → `PATCH status=retired` → 2xx → row chuyển trạng thái "Đã ngưng" → default filter ẩn row → F5 giữ trạng thái.
FAIL khi: Archive 2xx nhưng row vẫn active sau F5 · toast success mà row biến mất hoàn toàn (soft-delete vi phạm).

### AC-PAY-STP-01-04 — CHUNG pack trùng mã bắt lỗi
PASS khi: Nhập mã đã tồn tại CHUNG → Lưu → `HRM-PAY-POL-409-CODE` → toast/banner hiển thị → giữ nguyên form data.
FAIL khi: 409 nhưng toast mất form data · cho phép trùng mã âm thầm (BR vi phạm).

### AC-PAY-STP-01-05 — CHUNG pack hiệu lực validation
PASS khi: `effectiveTo` < `effectiveFrom` → Lưu → `HRM-PAY-POL-400-DATE` → field viền đỏ + message VI "Hiệu lực đến phải sau hiệu lực từ" → không gửi request.
FAIL khi: Request gửi đi dù validation fail · message không phải tiếng Việt · không hiển thị field nào sai.

---

## UC-BP-PAY-STP-02: RIÊNG Policy Pack CRUD

- Scope: RIÊNG pay-policy-packs theo OU/BP (ĐPHH · TĐHK · LX · VP)
- Actor: C&B OU/BP (`scope=RIÊNG`)
- Pre: payroll admin role · token của OU tương ứng
- Trigger: User clicks tab RIÊNG trên Policy Pack screen
- Flow: List (filter RIÊNG + BP tag) → Create → Chọn BP tag → Rate Config (geo/tuyến/VP) → Lưu → Row riêng theo `business_line_tag`
- AC: AC-PAY-STP-02-01..AC-PAY-STP-02-04 · AC-PAY-STP-GLOBAL-01 · AC-PAY-STP-GLOBAL-02
- API: `POST /pay-policy-packs` (`scope=RIENG`) · `PATCH /pay-policy-packs/:id`
- Component: `PayPolicyPackList` (filter tab RIÊNG + BP tag picker) + `PayPolicyPackDetail` (form RIÊNG)
- Rule: **Cấm gộp CHUNG+RIÊNG trên 1 form** — 2 entity riêng biệt, 2 tab riêng biệt.
- **Br-PAY-STP-01:** C&B OU mở CHUNG → 403 banner — không toast success.

### AC-PAY-STP-02-01 — RIÊNG ĐPHH pack Lưu 2xx
PASS khi: Tab RIÊNG → BP tag = `DPHH` → [+ Thêm] → nhập → Lưu → row có tag `DPHH` → filter `DPHH` trả row đó → F5 còn.
FAIL khi: Tạo RIÊNG nhưng tag hiển thị `CHUNG` · filter BP không hoạt động · row xuất hiện ở tab CHUNG.

### AC-PAY-STP-02-02 — RIÊNG pack bind geo/tuyến (VP cụm)
PASS khi: RIÊNG `LX_ROUTE` → Rate params → nhập `route_unit_price` + geo keys → Lưu → field hiển thị giá → F5 còn.
Fail khi: Geo keys hardcode enum 6 tỉnh (cấm theo UI-POLICY-PACK §4.3) · metadata-driven keys không render đúng control.

### AC-PAY-STP-02-03 — RIÊNG pack VP allowance/cost
PASS khi: RIÊNG `PROV_OFFICE` → Rate params → nhập `vp_allowance` · `vp_cost` → số tiền format `vi-VN` thousand group → Lưu → F5 kiểm tra.
FAIL khi: Format không phải `vi-VN` · field Number chấp nhận string · decimal nhập 3 chữ số lẻ không validate.

### AC-PAY-STP-02-04 — RIÊNG pack filter BP tag
PASS khi: Tab RIÊNG → dropdown BP tag (ĐPHH · TĐHK · LX · VP) → chọn `LX` → list chỉ trả pack `business_line_tag=LX_*` → chọn tất cả → list đầy đủ.
FAIL khi: Filter tag không hoạt động · dropdown thiếu option · list trả pack CHUNG khi đang ở tab RIÊNG.

---

## UC-BP-PAY-STP-03..06: Rate Params Detail Tabs

### UC-BP-PAY-STP-03 — Rate Params KPI Threshold
- Flow: Detail → tab Rate params → section `kpi_threshold_*` → nhập số điểm → Lưu
- AC: AC-PAY-STP-03-01
- Control: Number input `vi-VN` · `data_type=score` · không thousand-separator · decimal 0-100
- Validation: `kpi_threshold` ∈ [0, 100] · field viền đỏ nếu ngoài range · không gửi request nếu invalid

### AC-PAY-STP-03-01 — KPI threshold validate range
PASS khi: Nhập `kpi_threshold=150` → Lưu → field highlight đỏ + message "KPI threshold phải từ 0 đến 100" → không gửi PATCH.
FAIL khi: Cho gửi 150 · validate không có message VI · highlight mất sau khi blur ra ngoài.

### UC-BP-PAY-STP-04 — Rate Params BCC_STD
- Flow: Detail → section `bcc_std` → nhập số tiền → Lưu
- AC: AC-PAY-STP-04-01
- Control: Money `vi-VN` thousand group · `data_type=money_vnd`
- Rule: BCC_STD áp dụng cho TẤT CẢ tỉnh LX và VP — không per-province override (khác `route_unit_price` và geo keys)

### AC-PAY-STP-04-01 — BCC_STD format tiền
PASS khi: Nhập `5000000` → field hiển thị `5.000.000` → Lưu → PATCH body `{"rateParams":{"bcc_std":5000000}}` → F5 kiểm tra.
FAIL khi: Format không phải `5.000.000` · gửi string `"5.000.000"` thay vì number · PATCH 4xx do parse lỗi.

### UC-BP-PAY-STP-05 — Rate Params Geo/Tuyến
- Flow: Detail → section geo/tuyến → catalog picker địa bàn → chọn tỉnh → nhập `route_unit_price` → Lưu
- AC: AC-PAY-STP-05-01 · AC-PAY-STP-GLOBAL-02
- Rule: Metadata-driven keys — cấm Nest enum 6 tỉnh trên UI (catalog picker địa bàn động).
- Catalog source: Đọc từ `pay_policy_pack.rateParams` structure server — không hardcode item.

### AC-PAY-STP-05-01 — Geo picker metadata-driven
PASS khi: Section geo hiển thị picker động từ API · dropdown tỉnh (ND/NB/TB/PT/VT/YB theo catalog) → chọn `ND` → nhập giá → Lưu → F5 còn → filter OU scope không thấy pack BP khác.
FAIL khi: Hardcode code tỉnh trong component · picker thiếu tỉnh catalog đã có · filter OU lọt pack BP khác.

### UC-BP-PAY-STP-06 — Rate Params VP Allowance/Cost
- Flow: Detail → section VP → nhập `vp_allowance` · `vp_cost` → Lưu
- AC: AC-PAY-STP-06-01
- Control: Money `vi-VN` thousand group · 2 field riêng
- Rule: Chỉ KHẢ THI cho `RIÊNG` scope `business_line_tag` có VP (PROV_OFFICE · DPHH) — CHUNG scope không render section này.

### AC-PAY-STP-06-01 — VP allowance/cost RIÊNG-only
PASS khi: CHUNG pack → detail không render section VP → KHÔNG có field `vp_allowance`/`vp_cost` · RIÊNG `PROV_OFFICE` → section xuất hiện → nhập → Lưu → F5.
FAIL khi: CHUNG pack hiện field VP (scope vi phạm) · RIÊNG TG (`TIME_VP_HN`) hiện section VP (không có RIÊNG) · field nhập string thay vì number.

---

## Trace matrix

| STP | UC-BP-PAY-STP | AC-PAY-STP/FR | Screen | Component | API Endpoint |
|-----|--------------|---------------|--------|-----------|--------------|
| 01 | UC-BP-PAY-STP-01 | AC-PAY-STP-01-01..05 · AC-PAY-STP-GLOBAL-01 | STP-POLICY-PACK | `PayPolicyPackList` + `PayPolicyPackDetail` | `POST /pay-policy-packs` (`scope=CHUNG`) · `PATCH /pay-policy-packs/:id` |
| 02 | UC-BP-PAY-STP-02 | AC-PAY-STP-02-01..04 · AC-PAY-STP-GLOBAL-01/02 | STP-POLICY-PACK | `PayPolicyPackList` + `PayPolicyPackDetail` | `POST /pay-policy-packs` (`scope=RIENG`) · `PATCH /pay-policy-packs/:id` |
| 03 | UC-BP-PAY-STP-03 | AC-PAY-STP-03-01 | STP-POLICY-PACK | `PayPolicyPackDetail` (Rate params tab) | `PATCH /pay-policy-packs/:id` (`rateParams.kpi_threshold_*`) |
| 04 | UC-BP-PAY-STP-04 | AC-PAY-STP-04-01 | STP-POLICY-PACK | `PayPolicyPackDetail` (Rate params tab) | `PATCH /pay-policy-packs/:id` (`rateParams.bcc_std`) |
| 05 | UC-BP-PAY-STP-05 | AC-PAY-STP-05-01 · AC-PAY-STP-GLOBAL-02 | STP-POLICY-PACK | `PayPolicyPackDetail` (Rate params tab) | `PATCH /pay-policy-packs/:id` (`rateParams.route_unit_price` + geo keys) |
| 06 | UC-BP-PAY-STP-06 | AC-PAY-STP-06-01 | STP-POLICY-PACK | `PayPolicyPackDetail` (Rate params tab) | `PATCH /pay-policy-packs/:id` (`rateParams.vp_allowance` · `rateParams.vp_cost`) |

### Cross-reference

| FR nguồn | Liên kết UC-BP-PAY-STP | Ghi chú |
|----------|----------------------|---------|
| FR-UC-BP-PAY-01 | STP-01 · STP-02 | Chung/Riêng pack CRUD — trace đầy đủ |
| BR-PAY-STP-01 | STP-01 · STP-02 | 403 CHUNG cho C&B OU (RBAC bake vào JWT) |
| BR-PAY-STP-02 | STP-01 · STP-02 | Kiểm tra `effectiveTo` validation |
| AC-PAY-STP-GLOBAL-01 | STP-01..06 | Scope parity — mọi mutate 2xx → FE → F5 |
| AC-PAY-STP-GLOBAL-02 | STP-02 · STP-05 | OU scope filter — không leak pack BP khác |
| ADR-FRAGMENT-BIND-01 §5 | STP-03, PDF ref | Resolver fragment tier (RIÊNG override/extend) — uploadPolicyDocRefs chỉ ghi path, không eval giá trị |

---

## Behavior rule — ADR-FRAGMENT-BIND-01 residuals (FE display)

FE render `rateParams` theo metadata-driven keys — KHÔNG đánh giá formula override/extend logic. Override chain xử lý BE (SRC resolver):

1. Resolver mẫu (`applicability_scope` + `applicability_province_code`) — chọn template.
2. Resolver fragment `effective_from` — chọn `resolved_fragment_id` trong template đã chọn (khác tier, không trộn).
3. Override formula chỉ thắng catalog default **cho chính template đã resolver** — không có "override toàn cục xuyên tỉnh".
4. FE chỉ hiển thị giá trị `rateParams` như JSON blob — không tính, không merge, không eval.

---

## Error handling UI

| Error code | HTTP | FE hành vi | UC |
|-----------|------|-----------|-----|
| `HRM-PAY-POL-409-CODE` | 409 | Banner + toast trùng mã — giữ nguyên form data | STP-01 · STP-02 |
| `HRM-PAY-POL-400-DATE` | 400 | Field viền đỏ + message VI `effectiveTo` phải sau `effectiveFrom` | STP-01 · STP-02 |
| `403 RBAC` | 403 | Banner "Không có quyền thao tác scope này — liên hệ C&B tập đoàn" — không toast success | STP-01 (C&B OU) |

---

## Testid registry

| testid | Vùng | STP | AC |
|--------|------|-----|-----|
| `pay-policy-pack-list` | Bảng pack | STP-01..06 | GLOBAL-01 · GLOBAL-02 |
| `pay-policy-pack-scope-chung` | Filter/tab CHUNG | 01 | 01-01..05 |
| `pay-policy-pack-scope-rieng` | Filter/tab RIÊNG | 02 | 02-01..04 |
| `pay-policy-pack-save` | Lưu pack | 01 · 02 | 01-01 · 02-01 |
| `pay-policy-pack-bp-filter` | Dropdown BP tag | 02 · 05 | 02-04 · GLOBAL-02 |
| `pay-params-kpi-threshold` | Input KPI threshold | 03 | 03-01 |
| `pay-params-bcc-std` | Input BCC_STD | 04 | 04-01 |
| `pay-params-geo-picker` | Picker địa bàn | 05 | 05-01 |
| `pay-params-vp-allowance` | Input VP allowance | 06 | 06-01 |
| `pay-params-vp-cost` | Input VP cost | 06 | 06-01 |
| `pay-policy-pack-archive` | Nút Ngưng/Archive | 01 · 02 | 01-03 |

**Locale:** ngày `dd/MM/yyyy` · tiền thousand group `vi-VN` · KPI/% exempt thousand group · mọi message tiếng Việt.

---

## AC pack đầy đủ

| AC id | Pass (đo được) | Fail | Pri | Spec ref | testid |
|-------|----------------|------|-----|---------|--------|
| **AC-PAY-STP-01-01** | CHUNG pack tạo mới Lưu 2xx → F5 còn | 201 nhưng F5 mất row | P0 | UC-BP-PAY-STP-01 | `pay-policy-pack-save` |
| **AC-PAY-STP-01-02** | CHUNG pack cập nhật rateParams → PATCH 2xx → F5 còn | PATCH 2xx nhưng FE vẫn giá trị cũ | P0 | UC-BP-PAY-STP-01 | `pay-policy-pack-list` |
| **AC-PAY-STP-01-03** | CHUNG pack Archive → 2xx → row "Đã ngưng" → F5 giữ | Row biến mất hoàn toàn sau F5 | P0 | UC-BP-PAY-STP-01 | `pay-policy-pack-archive` |
| **AC-PAY-STP-01-04** | Trùng mã → `HRM-PAY-POL-409-CODE` → giữ form | Trùng mã nhưng ghi đè | P0 | UC-BP-PAY-STP-01 | `pay-policy-pack-save` |
| **AC-PAY-STP-01-05** | `effectiveTo` < `effectiveFrom` → 400 validate → giữ form | Gửi request dù validation fail | P0 | UC-BP-PAY-STP-01 | `pay-policy-pack-save` |
| **AC-PAY-STP-02-01** | RIÊNG ĐPHH Lưu 2xx → F5 còn → filter `DPHH` trả | Row xuất hiện tab CHUNG | P0 | UC-BP-PAY-STP-02 | `pay-policy-pack-scope-rieng` |
| **AC-PAY-STP-02-02** | RIÊNG LX → geo keys → metadata-driven picker → không hardcode 6 tỉnh | Hardcode enum tỉnh trong component | P0 | UC-BP-PAY-STP-05 | `pay-params-geo-picker` |
| **AC-PAY-STP-02-03** | RIÊNG VP-T → `vp_allowance`/`vp_cost` → format `vi-VN` → F5 | Format sai · field chấp nhận string | P0 | UC-BP-PAY-STP-06 | `pay-params-vp-allowance` |
| **AC-PAY-STP-02-04** | Tab RIÊNG → filter BP tag works → list chỉ RIÊNG | Filter không hoạt động · list trả CHUNG | P0 | UC-BP-PAY-STP-02 | `pay-policy-pack-bp-filter` |
| **AC-PAY-STP-03-01** | `kpi_threshold=150` → block + message VI "0–100" → no request | Cho gửi request · message không VI | P0 | UC-BP-PAY-STP-03 | `pay-params-kpi-threshold` |
| **AC-PAY-STP-04-01** | Nhập `5000000` → hiển thị `5.000.000` → PATCH number → F5 | Format `.` → gửi string → 4xx | P0 | UC-BP-PAY-STP-04 | `pay-params-bcc-std` |
| **AC-PAY-STP-05-01** | Geo picker động từ catalog → `ND` chọn → Lưu → F5 còn → OU scope filter | Hardcode code tỉnh · filter OU lọt pack BP khác | P0 | UC-BP-PAY-STP-05 | `pay-params-geo-picker` · `pay-policy-pack-bp-filter` |
| **AC-PAY-STP-06-01** | CHUNG → không render section VP → RIÊNG PROV_OFFICE → section xuất hiện → nhập → Lưu → F5 | CHUNG hiện field VP · RIÊNG TG hiện section VP | P0 | UC-BP-PAY-STP-06 | `pay-params-vp-allowance` |
| **AC-PAY-STP-GLOBAL-01** | Mọi mutate (01..06): 2xx → list row update → F5 row còn | Mất row sau F5 · scope cũ phát hiện pack mới | P0 | UC-BP-PAY-STP-01..06 | `pay-policy-pack-list` |
| **AC-PAY-STP-GLOBAL-02** | OU scope filter → chỉ thấy pack cùng BP tag | Leak pack BP khác qua filter | P0 | UC-BP-PAY-STP-02 · STP-05 | `pay-policy-pack-bp-filter` |

### Evidence block template

```markdown
### AC-PAY-STP-0x
- Persona / URL / click path: …
- Trước mutate: …
- Action: … → Lưu / Archive / Filter
- Network: … → 2xx / 4xx expected
- FE sau 2xx + F5: …
- Verdict: 🟢 / 🟡 / 🔴
- spec_ref: UC-BP-PAY-STP-0x · PO-HRM-PAY-CNTT-FE-STP-01-SRS-01
- seed: none (U65)
```

---

## Not scope (slice boundary)

- Chỉ STP-01..06 (`PayPolicyPackList` + `PayPolicyPackDetail`) — không STP-07+ (COMP-CATALOG, SHEET-TEMPLATE, INPUT-PROFILE, GROUP) trong slice này.
- Form `pay_policy_pack` — không gộp CHUNG+RIÊNG vào 1 form (quy tắc UI-POLICY-PACK §2).
- FE không eval formula override/extend chain — chỉ render `rateParams` JSON blob.
- Không hardcode Nest enum 6 tỉnh trên UI — catalog picker metadata-driven.
- FE không gọi resolver `resolveForEmployee` — backend owned (TPL-SPEC-01 §3).

---

## 3. Cross-UC dependencies (slice FE-STP-01)

### 3.1 Layer L1–L6 dependency chain (TECH_SPEC ADD)

```text
salary_components (L1 — STP-07) — catalog TP P0..P4
      ├─► default_formula_definition_id → pay_formula_definitions (L2 — HOLD eval)
      └─► fragment_id → pay_sheet_template_lines.fragment_id (L3 — template line)
pay_policy_pack (L4 — STP-01..06)
      └─► policy_pack_id → pay_sheet_templates.policy_pack_id
pay_input_pack_profile (L5 — STP-12)
      └─► input_pack_profile_id → pay_sheet_templates.input_pack_profile_id
pay_sheet_templates (L3 — STP-10/11)
      ├─► business_line_tag — applies OU/BP
      ├─► applicability_scope=province + applicability_province_code → resolveForEmployee (L6)
      └─► sheet_template_snapshot_json → payroll_periods → PROCESS
```

TechSpec ADD: `pay_policy_pack` · `pay_input_pack_profile` · `pay_sheet_template_lines.fragment_id` · `pay_sheet_template_lines.fragment_bind_mode` · `pay_sheet_templates.business_line_tag` · `pay_sheet_templates.applicability_province_code`. Cite DB_DESIGN_HRM_PAYROLL.md §8.

### 3.2 Fragment catalog → policy → template → input → process chain (SA-01 residual)

```text
63 fragment (POLICY-FRAGMENT-CATALOG)
  └─► policy_doc_refs_json.fragmentIds[] → pay_policy_pack (L4 validate on save)
  └─► fragment_bind_mode ∈ {CHUNG_ONLY, RIENG_OVERRIDE}
      └─► pay_sheet_template_lines → sheet_template_snapshot_json at bind-time
          └─► PROCESS eval tier: SRC-01 → SRC-02 → SRC-03 → SRC-04 → SRC-05
```

Resolver logic: two independent layers (SA-01 §2.4). Resolver mẫu (template by employee.province_code) is separate from resolver fragment `effective_from` (ADR-FRAGMENT-BIND §5).

### 3.3 SRS gốc trace (SRS_NEW.md §4.4)

| Slice UC | SRS_NEW.md gốc | This slice adds |
|----------|---------------|-----------------|
| STP-01..06 | UC-H04 → FR-HRM-PR-05 | ADD `pay_policy_pack` layer (L4) — not in generic SRS_NEW |
| STP-03 | UC-H04 → FR-HRM-PR-05 | ADD `rate_params_json` opaque param store; 63 fragment inputs_required |
| STP-07/08 | UC-H04 → FR-UC-BP-PAY-02 | EXPAND `salary_components` CHỪNG FE + fragment bind drawer |
| STP-09 | CHỜ BA-01 | ADD payroll group catalog Thiết lập (≠ runtime) |
| STP-10/11 | UC-H04 → FR-UC-BP-PAY-06 | EXPAND `pay_sheet_templates` multi-FK + province applicability + dual-template bind |
| STP-12 | UC-H04 → FR-UC-BP-PAY-06 | ADD `pay_input_pack_profile` typed taxonomy (L5) |

---

## 4. AC pack đầy đủ (AC-PAY-STP-01..12 — slice STP-01..12)

> Format U65 theo `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01.md §7` + UI-spec-INDEX testid. Mỗi AC có `testid` browser bind.

### 4.1 AC-PAY-STP-01..06 — Policy Pack (STP-POLICY-PACK)

| AC id | Pass (đo được) | Fail | Pri | trace |
|-------|----------------|------|-----|-------|
| **AC-PAY-STP-01** | CHUNG pack create: code+nameVi+effectiveFrom → 2xx; F5 còn | Dup code → not caught; F5 mất row | P0 | STP-01, F-PAY-POLICY-PACK-UPSERT-01 |
| **AC-PAY-STP-02** | CHUNG pack edit rateParams: kpi_threshold_* → PATCH 2xx; F5 giá trị mới | PATCH 2xx nhưng FE hiển thị giá cũ | P0 | STP-01, F-PAY-POLICY-PACK-UPSERT-01 |
| **AC-PAY-STP-03** | CHUNG pack archive → retired; default filter ẩn; F5 giữ | Row biến mất hoàn toàn (hard-delete) | P0 | STP-01, F-PAY-POLICY-PACK-ARCHIVE-01 |
| **AC-PAY-STP-04** | Dup code → `HRM-PAY-POL-409-CODE`; toast + giữ form | Ghi đè im lặng | P0 | STP-01/02 |
| **AC-PAY-STP-05** | `effectiveTo` < `effectiveFrom` → 400; field đỏ + VI message | Gửi request dù validation fail | P0 | STP-01/02 |
| **AC-PAY-STP-06** | RIÊNG pack: scope=RIENG + businessLineTag → 2xx; F5 còn | Row xuất hiện tab CHUNG | P0 | STP-02 |
| **AC-PAY-STP-07** | RIÊNG LX: geo keys metadata-driven picker → không hardcode 6 tỉnh | Hardcode enum tỉnh trong component | P0 | STP-05 |
| **AC-PAY-STP-08** | RIÊNG VP: vp_allowance/vp_cost format `vi-VN` → 2xx | Format sai; field chấp nhận string | P0 | STP-06 |
| **AC-PAY-STP-09** | RIÊNG BP tag filter: chọn `LX` → list chỉ LX_* | Filter không hoạt động; list trả CHUNG | P0 | STP-02/05 |
| **AC-PAY-STP-10** | CHUNG scope: C&B OU → 403 banner → không toast success | Toast success khi C&B OU mở CHUNG | P0 | STP-01 (BR-PAY-STP-01) |
| **AC-PAY-STP-11** | CHUNG pack detail: RIÊNG-only section VP NOT rendered | CHUNG render VP section | P0 | STP-06 |
| **AC-PAY-STP-GLOBAL-01** | All mutate STP-01..06: 2xx → FE row update → F5 row còn | Mất row sau F5; scope parity fail | P0 | STP-01..06 |
| **AC-PAY-STP-GLOBAL-02** | OU scope: chỉ thấy pack cùng `business_line_tag` | Leak pack BP khác qua filter | P0 | STP-02, U19 |

### 4.2 AC-PAY-COMP-01 — Catalog TP (STP-COMP-CATALOG)

| AC id | Pass | Fail | Pri | trace |
|-------|------|------|-----|-------|
| **AC-PAY-COMP-01** | CRUD TP P0–P4; search/filter; edit→2xx; soft-delete→archived; hard-delete→**FORBIDDEN**; duplicate code → 409; display-ready `code+VI label` | Hard-delete succeed; free-text code | P0 | STP-07, FR-UC-BP-PAY-02 |

### 4.3 AC-PAY-STP-07..12 — Remaining slice UC

| AC id | Pass | Fail | Pri | trace |
|-------|------|------|-----|-------|
| **AC-PAY-STP-07** | Fragment bind drawer: pick component → gợi ý fragment → confirm → `fragmentId/fragmentBindMode` PUT 2xx | `fragmentId` not catalog → `HRM-PAY-FRG-404`; RIENG+CHUNG pack → `HRM-PAY-FRG-409` | P0 | STP-08, F-PAY-SHEET-TPL-LINES-01 |
| **AC-PAY-STP-08** | `fragmentBindMode` ∈ {CHUNG_ONLY, RIENG_OVERRIDE} on line update | Invalid mode accepted silently | P0 | STP-08 |
| **AC-PAY-STP-09** | Input profile: edit `allowed_source_kinds_json` APPEND → 2xx; POST line kind ∈ list → 2xx; kind not in list → `HRM-PAY-INP-PROFILE-422` | Kind not in list silently accepted | P0 | STP-12, F-PAY-INPUT-PROFILE-UPSERT-01 |
| **AC-PAY-STP-10** | Template create: code+nameVi+businessLineTag+policyPackId+inputPackProfileId → 2xx | Required fields missing → 400 | P0 | STP-10, F-PAY-SHEET-TPL-UPSERT-01 |
| **AC-PAY-STP-11** | Template: filter by `business_line_tag=LX_ROUTE` → only LX-T | Cross-BP leak | P0 | STP-10, scope_parity U19 |
| **AC-PAY-STP-12** | Template edit: PATCH businessLineTag/policyPackId → 2xx; FK scope match | FK out-of-scope → not caught | P0 | STP-10, F-PAY-SHEET-TPL-UPSERT-01 EXPAND |
| **AC-PAY-STP-13** | Province applicability: `applicability_province_code+ND` + `business_line_tag=LX_ROUTE` → 2xx; set province w/o tag → `HRM-PAY-TPL-400-PROVINCE-SCOPE` | Province-only guard bypass | P0 | STP-11, spec §2.2 |
| **AC-PAY-STP-14** | Dup province: 2 active templates same `(LX_ROUTE, ND)` → `HRM-PAY-TPL-409-PROVINCE-DUP` | Dup silently allowed | P0 | STP-11, BR-TPL-PROV-02 |
| **AC-PAY-STP-15** | Province picker: metadata-driven from API; no hardcode BP→province | Hardcode `if (bp==='DPHH')` → reject CR | P0 | STP-11, spec §2 |

| AC id | Pass | Fail | Pri | trace |
|-------|------|------|-----|-------|
| **AC-CNTT-SETUP-01** | List scope mirror: GET list ≡ GET/:id predicate — same `resolveHrmListScope` | list returns rows get 404s | P0 | U19 |
| **AC-CNTT-SETUP-02** | Policy pack scope: create pack → same company; GET other company → 404 | Cross-tenant leak | P0 | SCOPE |
| **AC-CNTT-SETUP-03** | Snapshot immutability: after processed/closed → period setupContext immutable; PATCH → `HRM-PAY-TPL-409-IMMUTABLE` | Post-process mutate succeed | P0 | TPL-BE-01 §7.5 |
| **AC-CNTT-SETUP-04** | Input profile bind: POST input line → `source_kind` ∈ profile `allowedSourceKinds` → 2xx; else → 422 `HRM-PAY-INP-PROFILE-422` | Profile gating bypass | P0 | STP-12, F-PAY-PERIOD-INPUT-01 |
| **AC-CNTT-SETUP-05** | Fragment bind validate: PUT lines `fragmentId` → catalog validate → 2xx/404 | Orphan `fragmentId` accepted | P0 | STP-08, F-PAY-SHEET-TPL-LINES-01 |

---

## 5. NFR trace

| NFR id | NFR target | Slice binding |
|--------|-----------|---------------|
| NFR-03 | Batch 500 emp < 30min | Setup list scroll: 100 items < 300ms P95; P99 < 800ms |
| NFR-01 | API P95 < 300ms | Setup pages: list policy + template + input profile each < 300ms |
| NFR-04 | HTTPS/TLS 1.2 | All payroll API |
| NFR-05 | bcrypt cost 12 | Auth on payroll pages |

**CHỜ BA-01 BỔ SUNG:** NFR cho catalog read concurrency (63 fragment × 7 model picker queries — Redis `catalog:{tenantId}:v{version}` cache TTL 24h per TECH_SPEC_NEW §3.2).

---

## 6. Error taxonomy (slice FE-STP-01)

| Code | HTTP | VI description | trace |
|------|------|----------------|-------|
| `HRM-PAY-POL-409-CODE` | 409 | Duplicate active policy pack code | STP-01/02 |
| `HRM-PAY-POL-400-DATE` | 400 | `effective_to` < `effective_from` | STP-01/02 |
| `HRM-PAY-INP-PROF-409-CODE` | 409 | Duplicate active input profile code | STP-12 |
| `HRM-PAY-INP-PROFILE-422` | 422 | `source_kind` not allowed by period profile | STP-12 |
| `HRM-PAY-SETUP-404-PACK` | 404 | Policy/profile FK out of scope or archived | STP-10 |
| `HRM-PAY-TPL-400-PROVINCE-SCOPE` | 400 | `applicability_province_code` w/o `businessLineTag` | STP-11 |
| `HRM-PAY-TPL-409-PROVINCE-DUP` | 409 | Dup active template `(businessLineTag, applicabilityProvinceCode)` | STP-11 |
| `HRM-PAY-TPL-409-IMMUTABLE` | 409 | Mutate setup on processed/closed period | SETUP-03 |
| `HRM-PAY-TPL-412-TEMPLATE` | 404 | Secondary template not active/out-of-scope | dual-template bind |
| `HRM-PAY-FRG-404` | 404 | Fragment không tồn tại trong catalog | STP-08 |
| `HRM-PAY-FRG-409` | 409 | Xung đột CHUNG/RIÊNG (RIENG_OVERRIDE on CHUNG pack) | STP-02/08 |
| `HRM-PAY-FRG-412` | 412 | Không có fragment hiệu lực trong chuỗi override | STP-03 |
| *(existing)* | — | `HRM-SC-COMP-KEY` · scope 403/409 · `HRM-VAL-400` | Generic |

---

## 7. FE handoff (slice STP-01..12)

| AC id | testid | Screen | serialize |
|-------|--------|--------|-----------|
| AC-PAY-STP-01..06 | `pay-policy-pack-list` · `pay-policy-pack-scope-chung` · `pay-policy-pack-scope-rieng` · `pay-policy-pack-save` | STP-POLICY-PACK | PayPolicyPackList + PayPolicyPackDetail |
| AC-PAY-COMP-01 | `pay-comp-catalog-list` · `pay-comp-add-btn` | STP-COMP-CATALOG | PayComponentCatalogPanel |
| AC-PAY-STP-07..08 | `pay-fragment-map-drawer` | STP-COMP-CATALOG | PayFragmentMapDrawer + PT-SHEET-TEMPLATE editor |
| AC-PAY-STP-09 | `pay-stp-group-list` | STP-GROUP | PayrollSetupGroupPanel |
| AC-PAY-STP-10..12 | `pay-sheet-tpl-list` · `pay-sheet-tpl-editor` · `pay-sheet-tpl-col-picker` · `pay-sheet-tpl-bind-policy` · `pay-sheet-tpl-bind-profile` | STP-SHEET-TEMPLATE | PaySheetTemplateList + PaySheetTemplateEditor |
| AC-PAY-STP-13..15 | `pay-sheet-tpl-col-picker` (province picker) | STP-SHEET-TEMPLATE | PaySheetTemplateEditor (L6 bind) |
| AC-PAY-STP-12, AC-CNTT-SETUP-04 | `pay-input-profile-list` · `pay-input-profile-kinds` | STP-INPUT-PROFILE | PayInputPackProfileList + PayInputPackProfileForm |

---

## 8. Handoff

| Field | Value |
|-------|-------|
| **next_owner** | `pm` → `dev-fe` (screen STP-01..12) + `dev-be` (ensureSchema + F-PAY-*) |
| **ack_status** | DRAFT (chờ PM/SA review; SA xác nhận `applicability_province_code` schema iteration – spec §2.2) |
| **payroll_e2e_ready** | `false` |
| **evidence_path** | `docs/qa/evidence/po-hrm-pay-cntt-fe-stp-01-srs-01.md` |
| **spec_ref** | PO-HRM-PAY-CNTT-FE-STP-01-SRS-01 · UI-HRM-PAY-STP-SPEC-INDEX.md · PO-HRM-PAY-CNTT-API-01.md |
