# PO-HRM-EMP-SALARY-HISTORY-SPEC-01 — Employee salary-history / C&B timeline: interface SRC-02 + AuthZ field-gate

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` **≡** `PO-HRM-MVP-GD1-CORE-02-DATA-01` (dispatch cũ 2026-08-11T16:05 không evidence — **đóng luôn tại đây**, xem §1.2) |
| **parent** | `PO-HRM-PAY-SRC-PRIORITY-SPEC-01` (dependency #1) · `PO-HRM-MVP-GD1-CORE-02-CLUSTER-*` (physical + AuthZ SoT thật) |
| **lane** | governance · ba-process |
| **change_mode** | **DOC-ONLY** — RETAIN + cite LIVE `employee_compensation_packages\|lines\|history` + LIVE `compensation-cb-authz.ts` · **KHÔNG** viết `apps/**` · **KHÔNG** mở schema mới |
| **date** | 2026-08-12 |
| **honesty** | `payroll_e2e_ready=false` giữ nguyên — spec này đóng dependency **interface**, không claim formula evaluator / process engine LIVE |
| **must_keep** | `employee_compensation_packages\|lines\|history` ONE SoT (DATA-01 §1) · `HRM-CORE-CB-403` public strip (CORE-01 SEALED) · `HRM-CORE-CB-AUTHZ-403` C&B membership gate (CORE-02 CONFIRMED+SEALED) · BR-AMIS-PAY-SRC-01..05 thứ tự đã lock · overlap-409 write-time invariant |
| **ack_status** | **PASS_TO_PM** |

---

## 0. read_first ack

| # | Artifact | Dùng gì |
|---|----------|---------|
| 1 | `docs/qa/evidence/po-hrm-pay-sheet-template-src-input-packs-spec-01.md` §5 dòng #1 | Dependency mở gốc — chính Task này đóng |
| 2 | `docs/program/specs/PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` §1, §8 | Interface SRC-02 kỳ vọng: `{employee_id, component_code, amount, effective_from, effective_to}`; "history wins thắng tất cả" |
| 3 | `docs/qa/evidence/po-hrm-pay-cntt-research-summary-20260811.md` §2.2, §5.2 | Claim gốc "not started" — **STALE**, xem §1.1 |
| 4 | `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` | ADR này quản **tenant/company scope ladder** (Rung 1–3) — **KHÔNG** phải AuthZ field-level C&B; xem correction §4.3 |
| 5 | `apps/api/hrm-api/src/employees/employee-profile.service.ts` | Không có logic salary/C&B (đã grep — 0 match); C&B thực sự sống ở `contracts-insurance/employee-compensation.service.ts` |
| 6 | `apps/api/hrm-api/src/employees/employees.service.ts` L389, L1078–L1112 | `AC-CORE-PUB-01/02` DENY raw dump; `include=compensation_summary` gate (VAL-D-06 option c) |
| 7 | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md`, `DB_DESIGN_HRM_PAYROLL.md`, `DB_DESIGN_HRM_CONTRACTS_INS.md` | **0 match** `employee_compensation_*` — tài liệu DB_DESIGN hiện KHÔNG có trang riêng cho bảng này (xem §5.3 gap) |
| 8 | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md` (CONFIRMED 2026-08-09) | Physical DB lock chính thức — bank/MST header ADD, SI timeline RETAIN, ONE C&B SoT — **spec này CITE, không viết lại** |
| 9 | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-{be,fe,qa,qc}-01.md` | BE/FE/QA/QC đã **SEALED** GO WITH CONDITIONS, stamp `CORE02QC1-MSL80DU6` / `CORE02QA-MSL7X7SJ`, 2026-08-09 |
| 10 | `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts`, `compensation-cb-authz.ts`, `dto/create-compensation-package.dto.ts`, `dto/list-compensation.query.dto.ts`, `contracts-insurance.controller.ts` | Code thật — đọc đủ để mô tả interface I/O chính xác |
| 11 | `apps/api/hrm-api/src/payroll/pay-src-resolver.ts` (`loadEmployeeFixedAmountForComponent`), `pay-formula-variable-bag.ts` (`resolveEffectiveCompensationPackage`) | **SRC-02 resolver thật** — đây chính là "interface cần" mà SRC-PRIORITY-SPEC-01 §1 yêu cầu mô tả |

---

## 1. Correction quan trọng — LIVE sẵn, research-summary STALE

### 1.1 "Salary history / C&B" KHÔNG phải "NOT STARTED"

`po-hrm-pay-cntt-research-summary-20260811.md` §2.2 ghi:

> **Salary history / C&B** | Fixed PC from employee history not feeding vars | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` not started

Đây là claim **STALE tại thời điểm ghi (2026-08-11)**. Thực tế trên `main` tại thời điểm Task này (2026-08-12):

| Lớp | Trạng thái thật | Bằng chứng |
|---|---|---|
| Bảng vật lý `employee_compensation_packages\|lines\|history` | **LIVE** từ 2026-07-19 (`CD-FB-08-CONTRACT`), versioned + append-only history | `employee-compensation.service.ts` L1–L63 CODE-MEMORY |
| `component_code` per-line (bind SRC-02 theo component) | **LIVE ADD** từ 2026-08-07 (`PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-SRC-02-01`) | cùng file L46–L49; `pay-src-resolver.ts` L20–L28 |
| SRC-02 resolver generic (`loadEmployeeFixedAmountForComponent`) | **LIVE** từ 2026-08-07, cắm vào `pay-src-resolver.ts` process chain | `pay-src-resolver.ts` L378–L432 |
| C&B AuthZ field-gate (`HRM-CORE-CB-AUTHZ-403` + access audit) | **LIVE + CONFIRMED + SEALED QC** 2026-08-09 | `compensation-cb-authz.ts` toàn file; stamp `CORE02QC1-MSL80DU6` |
| Bank/MST trên package header | **LIVE ADD** 2026-08-09 (`PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01`) | `employee-compensation.service.ts` L290–L306, L824–L855 |
| DB physical decision (ONE SoT, bank/MST home, SI timeline) | **CONFIRMED** `PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md` 2026-08-09 | file đó, `ack_status: PASS_TO_PM CONFIRMED` |
| End-to-end QA/QC UC-BP-CORE-02 | **SEALED GO WITH CONDITIONS** | `po-hrm-mvp-gd1-core-02-cluster-qc-01.md` |

**Điều thật sự CHƯA có** (đúng như SRC-PRIORITY-SPEC-01 §1 diễn giải) là: **63 fragment CNTT chưa được người dùng C&B nhập `component_code` khớp catalog** (data-entry, không phải thiếu schema/engine) — resolver generic đã sẵn sàng nhận bất kỳ `component_code` nào khớp `salary_components.code` hiệu lực (xem §3.5).

### 1.2 Đóng `PO-HRM-MVP-GD1-CORE-02-DATA-01`

work_item_id thứ 2 trong dispatch (`PO-HRM-MVP-GD1-CORE-02-DATA-01`) không tồn tại đúng tên — file thật trên `docs/program/specs/` là **`PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md`**, đã **CONFIRMED** 2026-08-09 (không phải dispatch treo thiếu evidence — evidence tồn tại đầy đủ tại `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-data-01.md`). Dispatch cũ 2026-08-11T16:05 nhiều khả năng gõ nhầm tên hoặc trùng lặp với cluster đã xong. **Đóng tại đây** theo đúng chỉ đạo Task — không mở lại DATA-01 cluster.

---

## 2. Physical DB — cite CONFIRMED, không thiết kế lại

**SoT:** `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md` §2–§9 (CONFIRMED). Spec này chỉ tóm tắt phần liên quan trực tiếp tới interface SRC-02, **không lặp lại toàn bộ**.

| Bảng | Cột chính | Vai trò |
|---|---|---|
| `employee_compensation_packages` | `id, company_id, employee_id, contract_id, version, supersedes_package_id, effective_from, effective_to, currency, change_reason, bank_account, bank_name, bank_branch, tax_id, created_at, updated_at` | Header 1 phiên bản C&B — **revise** đóng bản cũ (`effective_to`), tạo bản mới `version+1`, **không** UPDATE đè |
| `employee_compensation_lines` | `id, package_id, line_type(base\|probation\|allowance), amount, currency, allowance_code, component_code, taxable, note, sort_order` | Từng dòng thành phần lương của 1 package — `component_code` là khoá SRC-02 đọc theo |
| `employee_compensation_history` | `id, company_id, employee_id, package_id, previous_package_id, version, change_reason, snapshot(JSONB)` | Append-only, mỗi create/revise ghi 1 dòng snapshot đầy đủ (lines + bank/MST + effective) |

`spec_ref`: `PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md` §2 alias map, §4 bank/MST lock, §9 data interaction matrix.

**must_keep (RETAIN):** ONE SoT — **KHÔNG** tạo bảng `hrm_employee_compensation` song song, **KHÔNG** Nest `/core/*` compensation table (DV-CORE-CB-01, DV-CORE-PATH-01 — DATA-01 §8).

---

## 3. Interface đọc cho SRC resolver (Section A — trọng tâm Task)

### 3.1 Chữ ký hàm LIVE — không đề xuất chữ ký mới

```ts
// apps/api/hrm-api/src/payroll/pay-src-resolver.ts L381-433
export async function loadEmployeeFixedAmountForComponent(
  db: HrmDbService,
  input: {
    companyId: string;
    employeeId: string;
    asOfDate: string | Date;
    componentCode: string;
  },
): Promise<EmpCbFixedAmount | null>;

// EmpCbFixedAmount:
type EmpCbFixedAmount = {
  amount: number;
  source_ref: string;   // 'emp_cb:package:{packageId}:line:{lineId}'
  warnings: string[];
};
```

**Input** khớp đúng yêu cầu SRC-PRIORITY-SPEC-01 §1 (`employee_id, component_code` + `as_of` thay cho `period` — as-of date, không phải period_id, vì C&B là mốc điểm-thời-gian không phải theo kỳ lương). **Output** khác nhẹ so với hình dung ban đầu `{employee_id, component_code, amount, effective_from, effective_to}` — xem gap thật ở §3.6.

### 3.2 "History wins" — quy tắc chọn dòng khi resolver tìm package hiệu lực

Cite `resolveEffectiveCompensationPackage` (`apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts` L131–L265) — đây là bước **trước** khi đọc `component_code`:

**Bước 1 — write-time invariant (ngăn chồng lấn từ gốc):** Mọi `POST .../compensation-packages` và `POST .../compensation-packages/:id/revise` đều gọi `assertNoOverlappingPackages` (`employee-compensation.service.ts` L394–L433) — **409 `HRM-COMP-409-OVERLAP`** (alias `HRM-CORE-CB-OVERLAP-409`) nếu khoảng `[effective_from, effective_to]` mới chồng khoảng đã tồn tại cho **cùng** `employee_id` + `company_id`. ⇒ Trong điều kiện vận hành bình thường, **tại một `company_id` xác định, không có 2 package chồng hiệu lực cho cùng 1 nhân viên** — "nhiều dòng chồng" chỉ có thể xảy ra khi mở rộng phạm vi qua nhiều `company_id` (group scope alias) hoặc dữ liệu legacy trước khi invariant này có hiệu lực.

**Bước 2 — read-time cascade (3 tầng, dừng ở tầng đầu tiên có kết quả):**

| Tầng | Điều kiện tìm | ORDER BY / tie-break | Cảnh báo gắn kèm |
|---|---|---|---|
| **1. `scoped_package`** | `employee_id` khớp + `company_id` ∈ `expandCbReadCompanyIds(periodCompanyId, employeeCompanyId)` (mở rộng alias main↔holding + company hiện tại của NV) + `effective_from <= as_of` + (`effective_to IS NULL` hoặc `effective_to >= as_of`) | `ORDER BY effective_from DESC, version DESC LIMIT 1` | `CB_PACKAGE_COMPANY_ALIAS_MATCH` nếu company package ≠ company kỳ lương |
| **2. `employee_fallback`** (chỉ chạy nếu tầng 1 rỗng) | Bỏ điều kiện `company_id`, chỉ còn `employee_id` + as-of window | `ORDER BY effective_from DESC, version DESC LIMIT 1` | `CB_PACKAGE_EMPLOYEE_FALLBACK` |
| **3. `contract_link`** (chỉ chạy nếu tầng 1–2 rỗng) | `employee_contracts.compensation_package_id IS NOT NULL AND archived_at IS NULL` | `ORDER BY effective_date DESC NULLS LAST, created_at DESC LIMIT 1` | `CB_PACKAGE_FROM_CONTRACT_LINK` |
| Không tầng nào có | — | — | `CB_PACKAGE_ABSENT` → trả `null` (SRC-02 rỗng, resolver payroll fallback SRC-04/05) |

**Diễn giải "history wins" chính xác:** trong cùng company scope, khi (giả thuyết) có nhiều bản ghi hiệu lực chồng ngày `as_of` (dữ liệu legacy hoặc do mở rộng company alias), phần thắng là bản ghi có **`effective_from` GẦN NHẤT (mới nhất) không vượt quá `as_of`**; nếu 2 bản ghi trùng `effective_from`, phần thắng là **`version` cao hơn**. Đây **không phải** "bản ghi tạo sau cùng" (`created_at`) mà là **"bản ghi có hiệu lực khởi đầu gần ngày chấm công nhất"** — đúng tinh thần "history wins" của BR-AMIS-PAY-SRC-02: lịch sử C&B tại đúng thời điểm trả lương thắng, không phải bản mới nhất theo thời gian nhập liệu.

### 3.3 Bước sau — khớp `component_code`

Sau khi có `packageId` thắng cuộc, `loadEmployeeFixedAmountForComponent` đọc **toàn bộ lines** của package đó (`loadPackageLinesForSrc`), rồi so khớp:

1. Chuẩn hoá `component_code` đích (`normalizeComponentCode` — lowercase, non-alnum→`_`).
2. Với mỗi line, suy ra `component_code` hiệu lực qua `resolveLineComponentCode` (ưu tiên cột `component_code` tường minh; fallback `allowance_code` khi `line_type=allowance`; `base`/`probation` khi đúng `line_type`).
3. So khớp bằng `componentCodesMatch` — có bảng alias cứng cho 2 nhóm: `BASE_COMPONENT_ALIASES = {base, base_salary, luong_co_ban, luongcoban, lcb, luong_cb}` và `PROBATION_COMPONENT_ALIASES = {probation, probation_salary, thu_viec}`. **Ngoài 2 nhóm này, không có alias ngầm** — `component_code` phải khớp **chính xác** (sau chuẩn hoá) giữa catalog fragment và dòng C&B đã nhập.
4. Khớp đầu tiên → trả `amount` + `source_ref = emp_cb:package:{packageId}:line:{lineId}`.
5. Không khớp dòng nào nhưng có dòng "unmapped" (thiếu `component_code` suy luận được) → cảnh báo `CB_COMPONENT_UNMAPPED`, vẫn trả `null` (không đoán).

**Hệ quả cho 63 fragment CNTT (bám SRC-PRIORITY-SPEC-01 §3):** khi C&B admin tạo/sửa package cho NV có lương cứng LX-TR (`FRG-LXTR-CUNG-01`) hoặc PC QĐ 752 (`FRG-TDHK-PC-01`), **phải** nhập `component_code` trùng đúng code catalog `salary_components` tương ứng fragment đó (VD `cung`, `pc_752`) trên dòng `allowance` hoặc `base` — đây là thao tác **nhập liệu** (đã có UI/API sẵn), **không phải** thiếu code.

### 3.4 `assertComponentCodeInEffectiveCatalog` — chặn "phát minh" component

Ghi chú tại `employee-compensation.service.ts` L365–L376 (gọi `assertComponentCodeInCatalog` trên **write path** create/revise, không phải trên SRC-02 read path): mọi `component_code` suy ra từ line **bắt buộc** ∈ `salary_components` hiệu lực khi catalog Nest active > 0 (S-PAY-CNS-03/04) — chặn nhập tùy tiện code không có trong catalog 183-key. SRC-02 read chỉ đọc những gì write path đã cho phép lưu — **không cần validate lại** ở tầng đọc.

### 3.5 Không mở schema mới cho 63 fragment CNTT

Đúng yêu cầu §1 SRC-PRIORITY-SPEC-01 ("giả định cùng interface áp dụng ... không mở rộng schema C&B ở đây") — xác nhận: **không cần** cột/bảng mới. `component_code` (TEXT, đã ADD 2026-08-07) là generic — nhận bất kỳ chuỗi nào khớp catalog, không giới hạn theo model AMIS parity hay CNTT.

### 3.6 Gap thật (nhỏ, không chặn SRC-02) — residual dev-be tương lai

| # | Gap | Ảnh hưởng | Đề xuất |
|---|---|---|---|
| G1 | `loadEmployeeFixedAmountForComponent` trả `source_ref` (package/line UUID) chứ **không** trả trực tiếp `effective_from`/`effective_to` như hình dung ban đầu SRC-PRIORITY-SPEC-01 §1 | Không ảnh hưởng tính đúng của resolver (as-of đã lọc trong SQL) — chỉ ảnh hưởng **traceability hiển thị** (VD payslip audit UI muốn show "áp dụng từ ngày X") | Nếu cần, dev-be join `source_ref` → `GET /compensation-packages/:packageId` (đã LIVE) để lấy `effective_from/to`; **không cần đổi chữ ký `loadEmployeeFixedAmountForComponent`** — P2, không block SRC-02 |
| G2 | Bảng `employee_compensation_packages\|lines\|history` **không xuất hiện** trong bất kỳ file `docs/hrm/DB_DESIGN_HRM_*.md` nào (đã grep 0 match cả `DB_DESIGN_HRM_EMPLOYEES.md`, `DB_DESIGN_HRM_PAYROLL.md`, `DB_DESIGN_HRM_CONTRACTS_INS.md`) | Tài liệu DB_DESIGN chính thức thiếu 1 trang cho C&B — người đọc mới phải lần theo `PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md` mới thấy | DOC-DELTA riêng (ba-data), **ngoài phạm vi** Task này — không tự viết ở đây |
| G3 | Alias `component_code` chỉ có cho `base`/`probation` — 63 fragment CNTT khác (`he_so`, `pc_752`, `cung`...) phải khớp **tuyệt đối**, sai chính tả = `CB_COMPONENT_UNMAPPED` âm thầm rơi xuống SRC-04/05 (không phải lỗi cứng, chỉ warning) | Rủi ro vận hành: C&B admin gõ sai code → line C&B bị bỏ qua, payroll dùng catalog default thay vì lương cố định đã thoả thuận | **Không phải gap kỹ thuật** — thuộc quy trình vận hành nhập liệu; đề xuất QA thêm case "C&B component_code sai chính tả → fallback catalog, có warning log" khi U65 payroll wave sau |

---

## 4. C&B AuthZ (Section B — role-gated fields)

### 4.1 Field nào thuộc vòng C&B — liệt kê đủ, cite code, không đoán thêm

**Nguồn A — public-ring deny-list** (`employees/employee-public-ring.ts` `isCorePublicCbDenyKey`, L86–L112): áp dụng cho **body/DTO/custom_fields** trên `/employees*` public — GET omit, PATCH/POST → `HRM-CORE-CB-403`.

| Deny key (khớp chính xác) | Deny theo prefix/suffix |
|---|---|
| `salary`, `base_salary`, `allowances`, `tax_code`, `tax_id`, `mst`, `bank_account`, `bank_name` | `*_salary` (suffix) · `allowance_*` (prefix) · `bank_*` (prefix) · `social_insurance_*`, `bhxh_*`, `si_rate*` (prefix) |

**Nguồn B — package header + lines (C&B SoT thật)** (`employee-compensation.service.ts`): `bank_account`, `bank_name`, `bank_branch`, `tax_id` (header) + `amount`, `allowance_code`, `component_code` trên từng `line` (base/probation/allowance) — toàn bộ **CHỈ** truy cập được qua `assertCompensationCbAccess` (§4.2), **không** qua đường public employees.

**Không có field nào khác ngoài 2 nguồn trên** được xác nhận trong code — spec này **không** tự thêm field mật ngoài danh sách đã cite (đúng chỉ đạo "không đoán thêm").

### 4.2 Role nào được xem/sửa — cite `compensation-cb-authz.ts`, không phát minh tầng mới

**Correction quan trọng:** `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` (đã đọc toàn văn) quản lý **scope ladder tenant/company** (Rung 1 group / Rung 2 company / Rung 3 dept-manager) — **KHÔNG** định nghĩa AuthZ field-level cho C&B. Gate C&B thật là 1 cơ chế **độc lập, đã LIVE, đã CONFIRMED**: `apps/api/hrm-api/src/contracts-insurance/compensation-cb-authz.ts` (`hasCompensationCbMembership`, L74–L92).

**Cơ chế gate (RETAIN nguyên văn, không đổi):**

| Ưu tiên | Điều kiện | Kết quả |
|---|---|---|
| 1 | JWT claim `view_salary===true` hoặc `viewSalary===true` hoặc `cb_membership===true`/`cbMembership===true` | **ALLOW** — override role |
| 2 | `permissions[]`/`perms[]`/`actions[]` chứa string `view_salary`/`employees:view_salary`/chứa `view_salary`/`compensation`/`cb`, hoặc object `{module, action}` với `action=view_salary` hoặc (`module∈{employees,compensation,payroll,contracts}` và `action∈{manage,write,view_salary}`) | **ALLOW** |
| 3 | `roleCode` khớp regex deny `^(employee\|driver\|mobile\|mobile_user\|self_service)$` | **DENY** (fail-closed, không cần xét tiếp) |
| 4 | `roleCode` chứa `subsidiary` hoặc bằng/chứa `member_ceo` **và không có claim tầng 1–2** | **DENY** — đúng BA O4 "CEO đơn vị không C&B → deny" |
| 5 | `roleCode` khớp regex allow `^(group_ceo\|ceo_group\|ceo\|hrbp\|hrbp_manager\|payroll_admin\|payroll\|admin\|system_admin\|comp_ben\|c_and_b)$` hoặc chứa `hrbp`/`payroll`/`group_ceo` | **ALLOW** |
| else | — | **DENY** (fail-closed mặc định) |

Gọi trên **mọi** open (GET) và mutate (POST create/revise) — `assertCompensationCbAccess` (L165–L192) — fail-closed, ném `HttpStatus.FORBIDDEN` `HRM_CORE_CB_AUTHZ_403` nếu deny, **và luôn ghi access audit** (kể cả khi deny) trước khi throw.

**must_keep:** đây là gate DUY NHẤT cho C&B mutate/open — spec này **RETAIN nguyên văn**, không đề xuất thêm role/permission mới ngoài danh sách đã cite. Nếu 63 fragment CNTT wave sau cần role mới (VD `cb_lxt_only` khu vực), đó là quyết định **sa/PM**, ngoài phạm vi Task.

### 4.3 Access audit — đã LIVE, RETAIN

Bảng `public.hrm_cb_access_audit` (`compensation-cb-authz.ts` L100–L121): `id, company_id, actor_sub, actor_role, action(open|mutate), resource_kind, resource_id, employee_id, outcome(allowed|denied), detail(JSONB), occurred_at`. Ghi **best-effort** (soft-fail, không chặn AuthZ nếu insert audit lỗi — L152–L182). Đủ để trả lời "ai đã xem/sửa lương của ai, khi nào, kết quả gì" — không cần thiết kế thêm.

### 4.4 Summary gate (list aggregate) — RETAIN, không đổi

`wantsCompensationSummary` (`employee-public-ring.ts` L189–L196) — `GET /employees` summary chỉ trả `avg_salary`/`salary_ranges` khi query `include=compensation_summary` **và** actor có C&B membership (gate ở `employees.service.ts` L1078–L1112, VAL-D-06 option (c)). Đây là 1 use-case khác (aggregate, không phải per-employee record) — cùng nguồn AuthZ §4.2, RETAIN.

---

## 5. Đã có sẵn trong `employee-profile.service.ts` / `employees.service.ts` (không đề xuất viết lại)

| File | Đã có | Ghi chú |
|---|---|---|
| `employee-profile.service.ts` | **0** logic salary/compensation/C&B/bank/tax (đã grep xác nhận) | File này thuần hồ sơ công khai — C&B không thuộc phạm vi service này, **đúng thiết kế tách SoT** (DATA-01 §1) |
| `employees.service.ts` L389 | `assertNoCorePublicCbDenyKeys` gọi trên create/update public — DENY raw dump salary/bank/tax/SI qua custom_fields | RETAIN — public path, khác hẳn C&B path |
| `employees.service.ts` L940–L1112 | Aggregate salary bands cho dashboard summary, gate `include=compensation_summary` | RETAIN — đọc **denormalized** `custom_fields->>'salary'` cho aggregate cũ (khác C&B packages SoT) — đã được DATA-01 ghi nhận là "legacy CF có thể còn giá trị cũ, sản phẩm path = packages" (DATA-01 §4.1 Invariant CORE-CB-BANK-MST-ONE) |

**Phần THỰC SỰ thiếu** (cần dev-be, KHÔNG làm ở Task này): không có — SRC-02 interface + AuthZ đã đầy đủ LIVE. Chỉ có 3 gap nhỏ P2 tại §3.6 (không chặn).

---

## 6. AC pack (U65 — cite hành vi LIVE, không mint AC mới trừ khi cần thiết)

| AC id | Pass (đo được) | Fail | Pri | Nguồn |
|-------|-----------------|------|-----|-------|
| **AC-SALHIST-01** | NV có package hiệu lực `as_of` kỳ lương, dòng `component_code=X` khớp fragment → `loadEmployeeFixedAmountForComponent` trả `amount` đúng dòng, `source_ref` dạng `emp_cb:package:*:line:*` | Trả `null` dù có dòng khớp, hoặc trả sai dòng khi có nhiều package | P0 | §3.1–§3.3 (đã LIVE, cite `pay-src-resolver.spec.ts`) |
| **AC-SALHIST-02** | 2 package "liền kề" (revise đóng bản cũ đúng ngày trước `effective_from` mới) → as-of đúng ngày biên chọn đúng bản, không cả hai / không rỗng | Chọn nhầm bản do lệch biên ngày | P0 | §3.2 tầng 1, `revisePackage` L935–L950 |
| **AC-SALHIST-03** | Thử tạo/revise 2 package chồng ngày hiệu lực cùng NV/company → **409** `HRM-COMP-409-OVERLAP` | Chồng lấn được lưu thành công (silent) | P0 | §3.2 bước 1, `assertNoOverlappingPackages` |
| **AC-SALHIST-04** | Role `employee`/`driver`/`mobile` gọi GET/POST compensation-packages → **403** `HRM-CORE-CB-AUTHZ-403`, có access audit `outcome=denied` | Trả 200 hoặc audit thiếu dòng | P0 | §4.2 tầng 3, `assertCompensationCbAccess` |
| **AC-SALHIST-05** | `subsidiary_ceo`/`member_ceo` không có claim `view_salary` → **403** như trên (đúng BA O4) | Cho phép mở mật vì có chữ "ceo" trong role | P0 | §4.2 tầng 4 |
| **AC-SALHIST-06** | `component_code` không khớp bất kỳ dòng nào trong package thắng cuộc → trả `null` (không đoán/không dùng dòng gần đúng) | Trả amount của dòng khác component | P0 | §3.3 bước 4–5 |

---

## 7. Không làm trong Task này

- Không viết `apps/**`.
- Không mở lại `PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md` đã CONFIRMED — chỉ cite.
- Không tự thiết kế tầng AuthZ/role mới ngoài `compensation-cb-authz.ts` đã LIVE.
- Không đổi `PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` đã DRAFT chờ review — chỉ cung cấp interface nó cần.
- Không viết DOC-DELTA cho `DB_DESIGN_HRM_*` (gap G2 §3.6) — nêu dependency, không tự làm.
- Không claim `payroll_e2e_ready=true` — engine formula evaluate + fragment 63 bind vẫn chưa xong (thuộc phạm vi SRC-PRIORITY-SPEC-01 §3 + dev-be wave sau).

---

## 8. Dependency còn mở

| # | Dependency | Owner đề xuất | Mức ưu tiên |
|---|---|---|---|
| 1 | DOC-DELTA `DB_DESIGN_HRM_*` thêm trang `employee_compensation_packages\|lines\|history` (gap G2 §3.6) | ba-data | P2 |
| 2 | Traceability `effective_from/to` trực tiếp trên output SRC-02 (gap G1 §3.6) — chỉ nếu payslip audit UI cần hiển thị | dev-be (P2, không chặn) | P2 |
| 3 | 63 fragment CNTT `component_code` data-entry đúng catalog (gap G3 §3.6) — vận hành, không phải code | ba-process/dev-be QA case bổ sung | P2 |
| 4 | Nối 63 fragment vào resolver generic (đã map tier ở `PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` §3) | dev-be, chờ evaluator lift HOLD | P0 (đã track ở spec khác) |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **from_role** | ba-process |
| **to_role** | pm |
| **work_item_id** | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` + `PO-HRM-MVP-GD1-CORE-02-DATA-01` (đóng cả 2, xem §1.2) |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-emp-salary-history-spec-01.md` |
| **payroll_e2e_ready** | `false` |
| **next_owner gợi ý** | `pm` → cập nhật `PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` dependency #1 từ NOT STARTED → **RESOLVED (interface đã LIVE, cite spec này)** |
