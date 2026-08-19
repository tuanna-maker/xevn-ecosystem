# PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 — Runtime bind mẫu bảng lương theo kỳ + đa tỉnh

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01` |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-DEPTH-01` · `PO-HRM-PAY-CNTT-SA-01` · `PO-HRM-PAY-CNTT-SA-FRAGMENT-MAP-02` |
| **lane** | governance · ba-process |
| **change_mode** | **ADD** — đóng gap "Template bind to period" · **EXPAND** `applicability_scope` (province) · **cấm** `apps/**` |
| **date** | 2026-08-12 |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator vẫn theo trạng thái đã lock (không đổi HOLD/LIVE tại đây) · resolver này KHÔNG tính số tiền — chỉ chọn đúng mẫu + đọc đúng snapshot |
| **must_keep** | `pay_sheet_templates`/`pay_sheet_template_lines` LIVE (TPL-BE-01) · SRC resolver LIVE trên PROCESS (SRC-BE-01/02) · `fragment_id`/`fragment_bind_mode` ADR-FRAGMENT-BIND-01 · Option B override FK-only · open catalog (cấm `CHECK (code IN (...))`) |
| **ack_status** | DRAFT — chờ PM/SA review |

---

## 0. read_first ack

| # | Artifact | Dùng gì |
|---|----------|---------|
| 1 | `docs/qa/evidence/po-hrm-pay-cntt-research-summary-20260811.md` | Gap register §2.2 — "Template bind to period" |
| 2 | `docs/program/specs/PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` §1–§5 | 63 fragment, override/extends chain, LX-T 6 tỉnh (ND/NB/TB/PT/VT/YB), VP-T 6 tỉnh |
| 3 | `docs/program/specs/PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` §3.1, §9 | Cột "Nơi làm việc (tỉnh)" LX-T · template code `LX_TUYEN` / `VP_HN_THOI_GIAN` |
| 4 | `docs/program/specs/PO-HRM-PAY-CNTT-SA-01.md` §2.2, §3.2, §12.3 | Multi pay_sheet_template rule · `F-PAY-SHEET-TPL-*` EXPAND · `F-PAY-SETUP-RESOLVE-01` |
| 5 | `docs/architecture/ADR-HRM-PAY-MULTI-TEMPLATE-01.md` §4.1 | `pay_sheet_template` applicability field ADD list |
| 6 | `docs/architecture/ADR-HRM-PAY-FRAGMENT-BIND-01.md` §3, §5 | `fragment_id`/`fragment_bind_mode` · resolver `effective_from` (fragment-level, khác resolver mẫu ở spec này) |
| 7 | `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-be-01.md` | **LIVE**: `pay_sheet_templates` CRUD + period bind + immutable snapshot — KHÔNG viết lại, chỉ EXPAND |
| 8 | `docs/qa/evidence/po-hrm-amis-parity-pay-src-be-01.md` §3, `…-be-02.md` §1 | **LIVE**: PROCESS đã đọc `sheet_template_snapshot_json.columns` — claim cũ "process chưa đọc snapshot" trong research-summary §2.2 là **STALE**, spec này correct lại (xem §1.3) |
| 9 | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` §8.3, §8.7 | `pay_sheet_templates` EXPAND (`business_line_tag`, `policy_pack_id`, `input_pack_profile_id`) · `pay_sheet_template_lines` EXPAND (`fragment_id`, `fragment_bind_mode`) — PAPER, cite không redesign |
| 10 | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` L49, L81 | `employees.custom_fields.work_location` TEXT — nguồn tỉnh hiện có (free-text), dùng cho §2.3 |

**Explicit:** Spec này **không** mở lại Option B (override = FK only), **không** đổi thứ tự SRC-01..05 (đã lock ở `po-hrm-amis-parity-sa-01.md` §3.4 và `po-hrm-payroll-formula-run-gap-be-01.md`), **không** claim evaluator LIVE.

---

## 1. Đối chiếu hiện trạng (correction so với research-summary)

### 1.1 Đã LIVE (cite, không redesign)

| Capability | Evidence | Trạng thái |
|---|---|---|
| `pay_sheet_templates` + `pay_sheet_template_lines` CRUD, soft-delete, scope_parity | `po-hrm-amis-parity-pay-tpl-be-01.md` | LIVE |
| Period tạo/bind `paySheetTemplateId` → snapshot `sheet_template_snapshot_json` ngay tại thời điểm bind, immutable sau `processed` | `po-hrm-amis-parity-pay-tpl-be-01.md` §7.5 | LIVE |
| PROCESS đọc `sheet_template_snapshot_json.columns` để build formula bag (`parsePeriodSnapshotColumns`) | `po-hrm-amis-parity-pay-src-be-01.md` §3 | LIVE |
| PROCESS ưu tiên SRC-02 (emp_cb) trên cột `BASE`/`LUONG_CO_BAN`, có `source_tier` trên payslip line | `po-hrm-amis-parity-pay-src-be-02.md` §5 (live repro NV002 = 9.500.000đ) | LIVE cho generic AMIS parity model — **chưa** wire cho 63 fragment CNTT |
| `fragment_id` / `fragment_bind_mode` trên `pay_sheet_template_lines` — governance trace | ADR-HRM-PAY-FRAGMENT-BIND-01 | **PAPER** (chưa `ensureSchema`) |
| `policy_pack_id` / `input_pack_profile_id` FK trên `pay_sheet_templates` | DB_DESIGN §8.3 | **PAPER** |

### 1.2 Gap thật (spec này đóng)

| Gap | Vấn đề |
|---|---|
| **G-TPL-01** | `applicability_scope` hiện tại (`company`\|`ou`\|`position`\|`employee`) **không** biểu diễn được "1 BP có N mẫu theo tỉnh" (LX-T 6 tỉnh, VP-T 6 tỉnh) — không có trục tỉnh |
| **G-TPL-02** | Chưa có hàm `resolveForEmployee(employee, period)` xác định — hiện chỉ có `F-PAY-SETUP-RESOLVE-01` (helper gợi ý cho FORM, không phải resolver ràng buộc lúc bind/process) |
| **G-TPL-03** | Chưa có quy tắc rõ ràng: khi nào override (`fragment_bind_mode=RIENG_OVERRIDE` / `formula_override_definition_id`) thắng catalog default trong bối cảnh multi-tỉnh (1 component có N mức giá theo tỉnh — override nào áp dụng cho tỉnh nào?) |

### 1.3 Correction ghi nhận

`po-hrm-pay-cntt-research-summary-20260811.md` §2.2 ghi "process doesn't read snapshot" — **đã lỗi thời**: PROCESS đọc snapshot columns từ SRC-BE-01 (2026-08-07). Điều còn thiếu không phải "đọc snapshot" mà là "**chọn đúng snapshot nào** khi 1 BP có N mẫu theo tỉnh" — đây chính là gap G-TPL-01/02 spec này đóng.

---

## 2. `applicability_scope` EXPAND — hỗ trợ cấp tỉnh

### 2.1 Nguyên tắc (khóa)

- **Cấm** `CHECK (applicability_scope IN ('company','ou','position','employee','province'))` — giữ nguyên tinh thần "recommended values, không closed enum" đã lock ở TPL-API-01 §5.2.
- ADD 1 cột mới **`applicability_province_code`** (TEXT NULL, open string — **không** `CHECK (... IN ('ND','NB',...))`). Khi set, đại diện 1 tỉnh/thành cụ thể mà mẫu áp dụng, dùng **cùng lúc** với `business_line_tag` (VD: `business_line_tag='LX_ROUTE'` + `applicability_province_code='ND'`).
- `applicability_scope='province'` là 1 **giá trị recommended** thêm vào danh sách hiện có — hàm ý: mẫu này áp dụng theo (`business_line_tag`, `applicability_province_code`) thay vì theo `ou_id`/`position_key`/`employee_id` đơn thuần.
- Một template có thể vẫn set `ou_id` **song song** `applicability_province_code` khi OU đã map 1-1 theo tỉnh (không bắt buộc — 2 trục độc lập).

### 2.2 Bảng field ADD (cite DB_DESIGN §8.3, spec chỉ mô tả nghiệp vụ — vật lý do dev-be)

| Field (nghiệp vụ) | Ý nghĩa | Ví dụ |
|---|---|---|
| `applicability_scope` | Trục phân giải chính | `province` (mới, bên cạnh `company`\|`ou`\|`position`\|`employee`) |
| `applicability_province_code` | Mã tỉnh mở (không FK closed) | `ND`, `NB`, `TB`, `PT`, `VT`, `YB` (LX-T/VP-T — theo `PO-HRM-PAY-CNTT-XLSX-COLUMN-MAP.md` §3, §71–73 catalog) |
| `business_line_tag` (đã có) | Nhóm mô hình khách | `LX_ROUTE`, `PROV_OFFICE`, `DPHH`, `TDHK`, `TIME_VP_HN` |

**BR-TPL-PROV-01:** `applicability_province_code` chỉ có ý nghĩa khi đi kèm `business_line_tag` khác null. Set `applicability_province_code` mà không set `business_line_tag` → publish template phải reject (`HRM-PAY-TPL-400-PROVINCE-SCOPE`) — vì tỉnh solo không đủ để phân biệt mô hình (LX-T ND ≠ VP-T ND).

**BR-TPL-PROV-02:** Trong cùng `(company_id, business_line_tag)` không cho phép **2 template active không-archived cùng `applicability_province_code`** — trùng lặp phải archive bản cũ trước (giữ nguyên rule duplicate code hiện có, mở rộng sang cặp province).

### 2.3 Nguồn tỉnh phía nhân viên (đọc, không redefine)

- Nguồn hiện có: `employees.custom_fields.work_location` (TEXT tự do — `DB_DESIGN_HRM_EMPLOYEES.md` L49/L81). Đây **không phải spec item mới** — cite field đã tồn tại.
- **BR-TPL-PROV-03 (dependency mở):** `work_location` hiện là free-text (VD: "Nam Định", "Chi nhánh Ninh Bình") — cần bảng normalize `work_location → province_code` (VD: chứa "Nam Định" → `ND`) để resolver §3 hoạt động. Spec này **không** tự định nghĩa bảng normalize (thuộc ba-data/dev-be wave sau, tương tự salary-history) — liệt kê là **dependency mở** (xem báo cáo cuối).
- Ngắn hạn (GĐ1 honesty): nếu `work_location` chưa normalize được → resolver trả `province_code=null` cho nhân viên đó → rơi vào nhánh "no province match" (§3.4) — **không đoán** tỉnh.

---

## 3. `resolveForEmployee(employee, period)` — hợp đồng nghiệp vụ

> Đây là đặc tả **hành vi**, không phải kiến trúc kỹ thuật (AST/thuật toán thực thi do dev-be quyết định cách hiện thực — có thể tái dùng logic ranking đã có ở `F-PAY-SETUP-RESOLVE-01`).

### 3.1 Khi nào được gọi

| Thời điểm gọi | Mục đích | Bắt buộc? |
|---|---|---|
| **(a) Form lập kỳ** (trước bind) | Gợi ý mẫu cho C&B chọn — **đã có** `GET /pay-setup/resolve` (không đổi) | Không mutate |
| **(b) Bind kỳ** (`POST …/periods` hoặc `POST …/periods/:id/bind-sheet-template`) | Xác nhận mẫu **được chọn thủ công bởi C&B** khớp scope tỉnh của cohort nhân viên dự kiến enroll (nếu period đã có roster) — **guard, không auto-pick** | **Có** — spec ADD mới |
| **(c) PROCESS mỗi nhân viên** | Đối chiếu `province_code` của nhân viên đang xử lý với `applicability_province_code` của template đã snapshot trong period — phát hiện lệch (nhân viên gán nhầm kỳ) | **Có** — spec ADD mới |

**Quan trọng (giữ nguyên kiến trúc hiện có):** `resolveForEmployee` **không** tự động chọn và bind template thay C&B — nó chỉ (i) **gợi ý** ở (a), và (ii) **guard/validate** ở (b)/(c). Việc bind template vẫn là hành động tường minh của C&B (giữ nguyên `AC-PAY-TPL-01..03` đã lock — cấm auto-bind).

### 3.2 Input / Output (nghiệp vụ)

```text
resolveForEmployee(employee, period_context) → { candidates[], recommended, matchStatus }

Input:
  employee: { id, company_id, ou_id?, position_key?, province_code? (normalized từ work_location) }
  period_context: { company_id, business_line_tag?, pay_period_end_date, bound_template_id? }

Output:
  candidates[]: mẫu active, không archived, cùng company_id, khớp business_line_tag (nếu có)
  recommended: candidate điểm cao nhất theo §3.3
  matchStatus: "MATCHED" | "NO_PROVINCE_MATCH" | "AMBIGUOUS" | "NO_CANDIDATE"
```

### 3.3 Thứ tự ưu tiên chọn mẫu (ranking — mở rộng `F-PAY-SETUP-RESOLVE-01` hiện có)

Ranking hiện tại (API-01 §4): `employee > position > ou > company` (tie-break `is_default` rồi `updated_at DESC`).

**EXPAND (ADD, không xóa tier cũ):**

```text
1. applicability_scope=employee, employee_id khớp                     (đặc thù nhất)
2. applicability_scope=position, position_key khớp
3. applicability_scope=province, business_line_tag khớp
     VÀ applicability_province_code == employee.province_code          ← ADD tier mới
4. applicability_scope=ou, ou_id khớp
5. applicability_scope=company (mặc định BP/công ty)
Tie-break (mọi tier): is_default=true trước, rồi updated_at DESC
```

**BR-TPL-RESOLVE-01:** Tier 3 (province) chỉ tham gia ranking khi `employee.province_code` **không null** (đã normalize được từ `work_location`). Nếu null → tier 3 bị bỏ qua hoàn toàn, resolver rơi xuống tier 4/5, `matchStatus="NO_PROVINCE_MATCH"` phải xuất hiện trong `warnings[]` (không âm thầm chọn nhầm tỉnh).

**BR-TPL-RESOLVE-02:** Nếu ≥2 template cùng tier cao nhất (VD 2 mẫu cùng active cho `LX_ROUTE` + `ND` — vi phạm BR-TPL-PROV-02 nhưng có thể tồn tại do lỗi thao tác) → `matchStatus="AMBIGUOUS"`, **không** tự chọn 1 trong 2 — trả lỗi rõ ràng cho (b)/(c), cảnh báo cho (a).

### 3.4 Case cụ thể theo yêu cầu Task

| Case | Input | Kỳ vọng resolver |
|---|---|---|
| LX-T nhân viên tỉnh Nam Định | `business_line_tag=LX_ROUTE`, `province_code=ND` | Chọn template `applicability_province_code=ND` trong 6 template LX-T (ND/NB/TB/PT/VT/YB) — không phải template mặc định company-wide |
| VP-T nhân viên tỉnh Vĩnh Phúc (nếu chưa có mẫu riêng — catalog chỉ xác nhận ND/NB/TB) | `business_line_tag=PROV_OFFICE`, `province_code=VT` (không khớp 3 mẫu ND/NB/TB đã catalog) | `matchStatus="NO_PROVINCE_MATCH"` → fallback tier 4/5 (OU/company) **có cảnh báo**, không tự bịa mẫu VT (đúng R3 catalog §7: "6 tỉnh VP xlsx nhưng 3 PDF QC — gap PT/VT/YB") |
| TG (VP Hà Nội) | `business_line_tag=TIME_VP_HN` — **không** có PDF RIÊNG (catalog §1: dùng CHUNG) | Không dùng tier 3 (không có khái niệm tỉnh cho TG) — resolver chọn thẳng company-wide `VP_HN_THOI_GIAN` |

---

## 4. Snapshot timing (đặc tả chính xác)

### 4.1 Khi nào snapshot ghi

**Đã LIVE (cite, không đổi — TPL-BE-01 §7.5):** snapshot `sheet_template_snapshot_json` được ghi **tại thời điểm bind** — tức là:
- `POST /periods` với `paySheetTemplateId` truyền kèm → snapshot ngay lúc tạo period, HOẶC
- `POST /periods/:id/bind-sheet-template` gọi sau khi period đã tồn tại (draft) → snapshot tại thời điểm gọi bind.

**Không phải** lúc process (`POST /periods/:id/process`) — process chỉ **đọc** snapshot đã đóng băng từ trước (đã LIVE — SRC-BE-01 §3 `parsePeriodSnapshotColumns`).

### 4.2 Ai đọc snapshot đó lúc tính lương

| Reader | Đọc gì | Trạng thái |
|---|---|---|
| PROCESS evaluate (SRC resolver) | `sheet_template_snapshot_json.columns[]` → build formula bag + xác định `formula_definition_id` theo tier SRC-04 (override)/SRC-05 (default) | **LIVE** (SRC-BE-01/02) |
| PROCESS SRC-03 (period pack) | Độc lập snapshot template — đọc `pay_period_input_lines` (đã LIVE, INPUT-PACK-BE-01) | LIVE |
| **PROCESS province guard (ADD spec này)** | `sheet_template_snapshot_json.applicabilityProvinceCode` (mirror tại bind-time) so với `employee.province_code` mỗi dòng — phát cảnh báo/lỗi khi lệch | **MISSING — spec này yêu cầu** |
| Setup context (`setupContext.policyPackRateParams` …) | Context read-only cho audit — **không** áp vào số tiền (SA-01 §12 EXPAND F-PAY-PROCESS-01 note) | LIVE (paper) |

### 4.3 BR mới — province guard tại PROCESS

**BR-TPL-PROC-01:** Khi `sheet_template_snapshot_json` có `applicabilityProvinceCode` (không null) và nhân viên đang xử lý có `province_code` normalize được và **khác** giá trị đó → payslip line cho các component `fragment_bind_mode=RIENG_OVERRIDE` của nhân viên đó phải mang cờ `warnings[]: "HRM-PAY-TPL-PROVINCE-MISMATCH"` (VI: "Nhân viên thuộc tỉnh khác mẫu bảng lương đang áp dụng") — **không** chặn cứng process (để không phá luồng enroll hiện có), nhưng **cấm** hiển thị dòng này như đã đối soát xong (AC ở §5).

**BR-TPL-PROC-02:** Khi `employee.province_code` là `null` (chưa normalize) và template có `applicability_province_code` → line cũng mang `warnings[]` tương tự (không silent).

---

## 5. Override chain — khi nào override thắng catalog default

*(Không mở lại BR-AMIS-PAY-SRC-04 đã lock — chỉ làm rõ trong bối cảnh multi-tỉnh.)*

**BR-TPL-OV-01:** `pay_sheet_template_lines.override_formula_definition_id` (hoặc field tương đương OV-C) chỉ thắng catalog default **cho chính template đã được resolver §3 chọn** — tức override luôn "theo tỉnh": override trên template `LX_ROUTE/ND` **không** áp dụng cho nhân viên resolver chọn template `LX_ROUTE/NB`. Không có khái niệm "override toàn cục xuyên tỉnh" — mỗi tỉnh là 1 dòng override độc lập trên template riêng của tỉnh đó.

**BR-TPL-OV-02:** Khi 1 component (VD `PC_LXT_LUOT` — lương lượt) có `fragment_id` khác nhau theo tỉnh (VD `FRG-LXT-LUOT-NB` cho NB, `FRG-LXT-LUOT-TB` cho TB — catalog XLSX-map §3.1) NHƯNG cùng `component_code`, `fragment_bind_mode=RIENG_OVERRIDE` trên **mỗi template tỉnh** phải trỏ `fragment_id` đúng của tỉnh đó — publish-time validate (đã có ở API-FRAGMENT-MAP-02 §12.1 `HRM-PAY-FRG-404`/`409`) áp dụng độc lập cho từng template tỉnh, không cross-check giữa các tỉnh.

**BR-TPL-OV-03 (resolver fragment ≠ resolver mẫu):** Có **2 lớp resolver riêng biệt, không trộn**:
1. Resolver **mẫu** (spec này §3) — chọn `pay_sheet_template` nào áp dụng cho nhân viên/kỳ.
2. Resolver **fragment `effective_from`** (ADR-FRAGMENT-BIND-01 §5, đã lock) — trong 1 template đã chọn, xác định `resolved_fragment_id` nào hiệu lực tại `pay_period_end_date` (VD `FRG-LXT-QD439-LUOT` thắng `FRG-LXT-LUOT-ND` từ 01/09/2025).
Spec này **không đổi** lớp (2) — chỉ bổ sung lớp (1) đang thiếu.

---

## 6. Error taxonomy (ADD — theo namespace đã có `HRM-PAY-TPL-*` / `HRM-PAY-FRG-*`)

| Code | HTTP | Khi nào | Layer |
|---|---|---|---|
| `HRM-PAY-TPL-400-PROVINCE-SCOPE` | 400 | `applicability_province_code` set mà thiếu `business_line_tag` | Publish template (§2.2) |
| `HRM-PAY-TPL-409-PROVINCE-DUP` | 409 | 2 template active cùng `(business_line_tag, applicability_province_code)` | Publish template (§2.2) |
| `HRM-PAY-TPL-PROVINCE-MISMATCH` | *(warning, không phải HTTP error)* | PROCESS: nhân viên province ≠ template province đã bind | PROCESS payslip line `warnings[]` (§4.3) |
| `HRM-PAY-TPL-412-NO-PROVINCE-MATCH` | *(soft — chỉ trong `resolve` preview)* | Resolver không tìm thấy template khớp tỉnh, rơi fallback company/ou | `GET /pay-setup/resolve` `warnings[]` (không phải 4xx cứng — preview honest) |

---

## 7. AC pack (U65 — theo format PAY-DEPTH-01 §4)

| AC id | Pass (đo được) | Fail | Pri | Maps |
|-------|-----------------|------|-----|------|
| **AC-PAY-TPL-PROV-01** | C&B tạo 2 template cùng `business_line_tag=LX_ROUTE` khác `applicability_province_code` (ND, NB) → cả 2 lưu 2xx, F5 còn cả 2, list filter theo `business_line_tag` trả cả 2 | 1 trong 2 bị ghi đè; publish 2xx dù thiếu `business_line_tag` khi có province | P0 | BR-TPL-PROV-01/02 |
| **AC-PAY-TPL-PROV-02** | Tạo template thứ 3 trùng `(LX_ROUTE, ND)` khi bản 1 còn active → publish trả `HRM-PAY-TPL-409-PROVINCE-DUP` | Cho phép trùng lặp âm thầm | P0 | BR-TPL-PROV-02 |
| **AC-PAY-TPL-PROV-03** | `GET /pay-setup/resolve?business_line_tag=LX_ROUTE&province_code=ND` trả `recommended` = template ND, không phải NB/TB | Trả sai tỉnh hoặc trả company-wide khi có match tỉnh | P0 | §3.3 |
| **AC-PAY-TPL-PROV-04** | Nhân viên `work_location` normalize không ra tỉnh khớp catalog (VD PT/VT/YB VP-T chưa có mẫu) → resolve trả `matchStatus=NO_PROVINCE_MATCH` + `warnings[]`, **không** tự bịa mẫu | Trả `recommended` rỗng-im-lặng hoặc tự tạo mẫu giả | P0 | §3.4, BR-TPL-RESOLVE-01 |
| **AC-PAY-TPL-PROV-05** | PROCESS kỳ đã bind template `LX_ROUTE/ND`, có 1 nhân viên `province_code=NB` trong roster → payslip line của NV đó mang `warnings: HRM-PAY-TPL-PROVINCE-MISMATCH`; các NV `province_code=ND` khác không có cảnh báo này | Cảnh báo xuất hiện tràn lan cho cả NV đúng tỉnh, hoặc không xuất hiện cho NV sai tỉnh | P0 | BR-TPL-PROC-01 |
| **AC-PAY-TPL-PROV-06** | Sau `processed`, đổi `applicability_province_code` trên template đã bind **không** làm đổi dòng kỳ đã chạy (kế thừa AC-PAY-TPL-05 immutability đã lock) | Hot-swap tỉnh giữa kỳ đổi số | P0 | AC-PAY-TPL-05 (cite, không đổi) |

### 7.1 Evidence block template (QA — mỗi UF, cite format PAY-DEPTH-01 §4.3)

```markdown
### AC-PAY-TPL-PROV-0x
- Persona / URL / click path: …
- Trước mutate: …
- Action: … → Lưu / Process
- Network: … → 2xx / 4xx expected
- FE sau 2xx + F5: …
- Verdict: 🟢 / 🟡 / 🔴
- spec_ref: BR-TPL-PROV-0x · PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01
- seed: none (U65)
```

---

## 8. Không làm trong Task này

- Không viết `apps/**` — physical DDL (`applicability_province_code` column, `ensureSchema`) là việc dev-be sau khi spec này PASS_TO_PM.
- Không định nghĩa lại bảng normalize `work_location → province_code` (dependency mở, xem báo cáo cuối) — chỉ mô tả interface cần.
- Không đổi thứ tự SRC-01..05 hay Option B (override = FK only).
- Không claim `payroll_e2e_ready=true`.
- Không tạo API mới ngoài field EXPAND đã liệt kê (`applicability_scope=province`, `applicability_province_code`) — mọi route giữ nguyên (`GET/POST/PATCH /pay-sheet-templates*`, `GET /pay-setup/resolve`, `POST /periods/:id/bind-sheet-template`).

---

## 9. Dependency mở (không tự viết lan sang)

| Dependency | Lý do ngoài phạm vi | Owner đề xuất |
|---|---|---|
| Normalize `employees.custom_fields.work_location` → `province_code` chuẩn (ND/NB/TB/PT/VT/YB…) | Cần ba-data xác nhận domain giá trị thật trên dữ liệu nhân viên hiện có; không đoán | ba-data (wave sau) |
| VP-T tỉnh PT/VT/YB chưa có PDF/QC nguồn (catalog §7 R3) | Cần sponsor bổ sung PDF trước khi tạo template chính thức cho 3 tỉnh này | sponsor → ba-process |
| `pay_sheet_templates.applicability_province_code` physical DDL + `ensureSchema` | Thuộc lane dev-be, không code trong spec BA | dev-be (sau PM dispatch) |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `pm` → `sa` (API_DESIGN EXPAND `applicability_scope=province` + `applicability_province_code` field) → `dev-be` |
| **evidence_path** | `docs/qa/evidence/po-hrm-pay-sheet-template-src-input-packs-spec-01.md` (chung 3 spec) |
| **ack_status** | DRAFT — chờ PM/SA review, chưa CONFIRMED |
| **payroll_e2e_ready** | `false` |
