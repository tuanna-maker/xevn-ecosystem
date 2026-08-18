# Evidence — PO-HRM-PAY-TPL-RESOLVE-PROCESS-GUARD-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-TPL-RESOLVE-PROCESS-GUARD-BE-01` |
| **parent** | `PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01` · `PO-HRM-PAY-TPL-RESOLVE-PROVINCE-BE-01` · `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01` |
| **from_role** | dev-be |
| **to_role** | pm / qa |
| **lane** | execution |
| **date** | 2026-08-13 |
| **priority** | P0 |
| **change_mode** | ADD (guard cảnh báo) · ADD (mirror field snapshot) |
| **honesty** | `payroll_e2e_ready=false` · guard KHÔNG chặn process, chỉ cảnh báo · so khớp province là hygiene-only (trim/case), KHÔNG chuẩn hoá domain |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| # | Artifact | Dùng |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01.md` §4.2, §4.3, §6, §7 (AC-PAY-TPL-PROV-05) | BR-TPL-PROC-01/02 — đối chiếu `sheet_template_snapshot_json.applicabilityProvinceCode` với `province_code` nhân viên tại PROCESS, warning không block |
| 2 | `docs/qa/evidence/po-hrm-pay-tpl-resolve-province-be-01.md` | Chữ ký thật `resolveForEmployee`, `PaySheetTemplateHeaderView.applicabilityProvinceCode` — KHÔNG gọi lại hàm này ở Task |
| 3 | `docs/qa/evidence/po-hrm-pay-tpl-resolve-bind-wire-be-01.md` | Điểm gọi (b) `autoResolve` đã wire qua `bindToPeriod` — xác nhận đây là ĐIỂM DUY NHẤT ghi `sheet_template_snapshot_json` |
| 4 | `apps/api/hrm-api/src/payroll/payroll.service.ts` `processPayrollPeriod` (đọc toàn bộ trước khi sửa) | Luồng per-employee loop, cách đọc `current.sheet_template_snapshot_json`, pattern warnings hiện có (`formulaWarnings` → response `warnings[]`), `employeeProcessSummaries` per-employee output |
| 5 | `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` `bindToPeriod` (đọc trước khi sửa) | **Phát hiện gap** — snapshot object tại bind-time KHÔNG mang `applicabilityProvinceCode` (xem §2 bên dưới) |
| 6 | `apps/api/hrm-api/src/payroll/pay-sheet-template.constants.ts` | `HRM_PAY_TPL_PROVINCE_MISMATCH = 'HRM-PAY-TPL-PROVINCE-MISMATCH'` đã ADD sẵn từ Task trước — dùng nguyên, KHÔNG tự đặt code mới |
| 7 | `apps/api/hrm-api/src/employees/employee-directory.ts` (`readDepartment`/`readPhoneNumber`), `apps/api/hrm-api/src/payroll/pay-termination.service.ts` (query `custom_fields` theo employee_id) | Pattern đọc `employees.custom_fields.<key>` AS-IS, không tự chuẩn hoá — bắt chước style này cho `work_location` |
| 8 | `AGENTS.md` + `docs/program/SUBAGENT_READ_MAP.md` | Path lock NFD, cấm đụng `apps/web/**` |

---

## 2. Phát hiện đáng báo cáo — snapshot thiếu field cần thiết cho guard này

`bindToPeriod()` (điểm gọi (b), đã LIVE từ 2 Task trước) xây `snapshot` object chỉ gồm
`template_id, template_code, template_name, columns, bound_at, setupContext?` — **không** có
`applicabilityProvinceCode`, dù spec §4.2 liệt kê rõ field này là **"MISSING — spec này yêu cầu"**
đúng cho chính guard PROCESS (Task này). 2 Task dev-be trước không thêm field này vì phạm vi của họ
không bao gồm điểm gọi (c) (đã ghi rõ trong evidence — "KHÔNG wire tại (c)").

**Quyết định:** ADD tối thiểu 1 field vào object literal `snapshot` trong `bindToPeriod()` —
`applicabilityProvinceCode: template.applicability_province_code ?? null` — mirror giá trị tại
bind-time (đúng nguyên tắc immutable snapshot AC-PAY-TPL-05/06: đổi tỉnh trên template sau khi bind
không ảnh hưởng dòng kỳ đã bind/đã chạy, vì PROCESS chỉ đọc bản mirror đã đóng băng, không re-query
template sống). Đây là thay đổi ADD-only, không đổi field cũ, không đổi cột DB, không đổi
`resolveForEmployee`. Không có thay đổi này thì guard ở điểm gọi (c) **không thể hoạt động** —
coi đây là phần bắt buộc thuộc scope Task này (đóng nốt gap còn lại của cụm 3 điểm gọi).

---

## 3. Deliverables (files sửa)

| Path | Thay đổi |
|------|------|
| `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` | `bindToPeriod()`: ADD `applicabilityProvinceCode` vào object `snapshot` (mirror tại bind-time). `@CODE-MEMORY-CHANGE 2026-08-13`. |
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | ADD import `HRM_PAY_TPL_PROVINCE_MISMATCH`. ADD 3 helper module-level: `readSnapshotApplicabilityProvinceCode`, `readEmployeeWorkLocationRaw`, `provinceRawValuesEqual`. `processPayrollPeriod`: ADD field `warnings?: string[]` vào type `employeeProcessSummaries`; ADD preload 1 query batch `SELECT id::text AS id, custom_fields FROM public.employees WHERE id = ANY($1::uuid[])` — **chỉ chạy khi snapshot có `applicabilityProvinceCode`** (0 query thêm cho period không dùng province); trong loop per-employee, tính `provinceMismatchWarnings` (so khớp trim+case-insensitive, KHÔNG chuẩn hoá domain) và gắn vào cả 2 nhánh `employeeProcessSummaries.push({...})` (nhánh `mergedGrossVnd>0` và nhánh else) qua spread `...(provinceMismatchWarnings ? { warnings: provinceMismatchWarnings } : {})`. `@CODE-MEMORY-CHANGE 2026-08-13`. |
| `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` | ADD describe `'PO-HRM-PAY-TPL-RESOLVE-PROCESS-GUARD-BE-01 - province mismatch guard (diem goi c)'` với 3 test case (§5). |

**Không đụng:** `apps/web/**` · `resolveForEmployee` (không gọi lại, không sửa) · công thức tính lương/thuế/BH (`pay-tncn-resolver.ts`, `pay-si-ceiling-resolver.ts`, `pay-gtgc-resolver.ts` — không sửa) · `pay-src-resolver.ts` / `PaySrcResolvedLine` (không thêm field per-line — xem §4 lý do thiết kế) · route/endpoint (không có API mới).

---

## 4. Thiết kế — vì sao chọn `employeeProcessSummaries[].warnings` thay vì payslip line thật

- `payroll_payslip_lines` (bảng SQL thật, `pay-formula.service.ts` ensureSchema) **không có** cột
  warning/note nào — chỉ có `component_code, amount, sign, source_ref, formula_definition_id,
  sort_order, source_tier`. Thêm cột mới vào bảng này là thay đổi lớn hơn phạm vi Task (đụng DDL +
  `PaySrcResolvedLine` type + `pay-src-resolver.ts` + `pay-payslip-split.service.ts` + persist path) —
  không cần thiết vì response-level đã có chỗ hợp lý hơn.
- `payroll_payslips` (bảng header) cũng không có cột warning.
- Pattern **đã có sẵn** gần nhất là `formulaWarnings: string[]` → response `warnings: [...new
  Set(formulaWarnings)].slice(0, 40)` — nhưng đây là mảng **dedup toàn kỳ**, không phân biệt theo
  nhân viên → nếu dùng chung mảng này, 2 NV khác nhau cùng bị cảnh báo sẽ khó tách ai bị ai không
  (vi phạm AC-05: "cảnh báo... không tràn lan cho cả NV đúng tỉnh"). Không tái dùng mảng này cho
  cảnh báo tỉnh.
- Chọn `employeeProcessSummaries[].warnings?: string[]` (field mới, optional, per-employee) —
  đã có sẵn trong response `result.employees[]` (per-NV, đã trả `employee_id`) → đúng tinh thần
  "payslip line/1 trường warning riêng" dispatch yêu cầu, giữ đúng khả năng phân biệt AC-05 đòi hỏi,
  KHÔNG động vào output cũ khi field rỗng (chỉ set key khi có mismatch, giống pattern
  `dependents_count: ... : undefined` đã có sẵn trong cùng object).
- **Không** scope theo `fragment_bind_mode=RIENG_OVERRIDE` như câu chữ literal BR-TPL-PROC-01 vì
  `fragment_bind_mode` hiện là **PAPER** (spec §1.1: "chưa `ensureSchema`") — không tồn tại vật lý
  trong `pay_sheet_template_lines` để lọc theo. Áp dụng cảnh báo ở cấp **nhân viên/kỳ** (mọi dòng của
  NV đó trong kỳ), khớp đúng chữ AC-PAY-TPL-PROV-05 ("payslip line của NV đó mang warnings") — không
  literal-implement phần fragment_bind_mode filter (dependency PAPER, ghi ở §9 residual).

---

## 5. Test mới (3 case bắt buộc + đối chiếu AC-05)

File: `apps/api/hrm-api/src/payroll/payroll.service.spec.ts`, describe
`'PO-HRM-PAY-TPL-RESOLVE-PROCESS-GUARD-BE-01 - province mismatch guard (diem goi c)'`.

| # | Test | Kỳ vọng |
|---|------|------|
| 1 | `AC-PAY-TPL-PROV-05 - province mismatch => warning tren dung NV, khong block process` | Period bind snapshot `applicabilityProvinceCode='ND'`, NV `work_location='NB'` → `result.employees[0].warnings === ['HRM-PAY-TPL-PROVINCE-MISMATCH']`; `result.status==='processed'`, `total_net` tính bình thường (KHÔNG block) |
| 2 | `regression - province khop snapshot => khong warning, hanh vi y het cu` | Snapshot `applicabilityProvinceCode='ND'`, NV `work_location='  nd  '` (khác hoa/thường + khoảng trắng — chỉ hygiene, không chuẩn hoá domain) → khớp → `warnings` **undefined**, response y hệt cũ |
| 3 | `regression - snapshot rong/null (period chua dung province template) => bo qua guard hoan toan, 0 query them` | `draftPeriod` gốc (không có `sheet_template_snapshot_json`, đúng đa số period hiện tại) → `warnings` undefined, **và** assert query `custom_fields` KHÔNG hề được gọi (0 overhead khi period không dùng province) |

Case "snapshot null/rỗng → không crash" còn được chứng minh gián tiếp bởi **toàn bộ 228 test cũ**
(tất cả dùng `draftPeriod` không có `sheet_template_snapshot_json`) vẫn PASS y nguyên sau khi sửa —
bằng chứng regression mạnh nhất (không chỉ 1 test riêng).

---

## 6. Jest trước/sau

**Trước khi sửa (baseline, verify lại — khớp cite từ evidence Task trước 228/228):**
```text
cd apps/api/hrm-api && pnpm exec jest src/payroll --silent
→ Test Suites: 22 passed, 22 total
→ Tests:       228 passed, 228 total
```

**Sau khi sửa:**
```text
pnpm exec jest src/payroll/payroll.service.spec.ts --silent
→ Test Suites: 1 passed, 1 total
→ Tests:       47 passed, 47 total   (44 cũ + 3 mới)

pnpm exec jest src/payroll --silent
→ Test Suites: 22 passed, 22 total
→ Tests:       231 passed, 231 total   (228 baseline + 3 mới, 0 fail, 0 giảm)
```

---

## 7. tsc --noEmit

Phương pháp: `git checkout --` tạm 2 file tracked (`payroll.service.ts`,
`payroll.service.spec.ts`) về đúng bản trước khi sửa (bản đã stage sẵn, không phải HEAD — file này
vốn đã `MM` từ trước phiên làm việc), chạy `tsc` lấy baseline, rồi khôi phục lại bản đã sửa
(`pay-sheet-template.service.ts` là file **untracked** hoàn toàn — không có baseline git để revert,
nhưng 2 chỗ sửa ở file này chỉ là (a) thêm 1 block comment và (b) thêm 1 field vào object literal
không có type annotation tường minh — không thể sinh lỗi TS mới về mặt cấu trúc, và tsc sau khi sửa
xác nhận **0 lỗi** cho file này).

```text
BEFORE (git checkout tạm về bản trước sửa):
pnpm exec tsc --noEmit -p . → 272 lỗi TS tổng
  payroll.service.spec.ts: 17 lỗi (tất cả pre-existing — 'Argument of type { code } not assignable
  to ApiException' x nhiều, 1x PayrollEnrollMode, 1x .status trên bridgeAdvanceRequestToPeriod)
  payroll.service.ts: 0 lỗi
  pay-sheet-template.service.ts: (không revert được — untracked)

AFTER (khôi phục bản đã sửa):
pnpm exec tsc --noEmit -p . → 272 lỗi TS tổng — Y HỆT baseline, không tăng
  payroll.service.spec.ts: 17 lỗi — cùng nội dung, chỉ dịch số dòng (do tôi chèn ~200 dòng test mới
  phía trên các dòng lỗi cũ) — đối chiếu từng dòng lỗi nội dung giống hệt bản before
  payroll.service.ts: 0 lỗi
  pay-sheet-template.service.ts: 0 lỗi
```

**Kết luận: 0 lỗi TS mới trong 3 file đã sửa.** (272 tổng repo trước/sau bằng nhau — khác con số
"268" cite ở evidence Task trước 1 ngày do các lane khác đang có thay đổi song song trên repo, không
liên quan Task này.)

---

## 8. Regression check — hành vi cũ (không mismatch / không dùng province) có đổi gì không?

**Không đổi.** Cụ thể:

1. **Period không bind `sheet_template_snapshot_json`** (đa số period hiện tại, kể cả toàn bộ 228
   test cũ) → `readSnapshotApplicabilityProvinceCode()` trả `null` ngay từ đầu (typeof check +
   field access) → guard **tắt hoàn toàn**: không thêm 1 query DB nào (`employeeWorkLocationById`
   map rỗng, vòng lặp không gọi `SELECT ... custom_fields`), `provinceMismatchWarnings` luôn
   `undefined` cho mọi NV, `employeeProcessSummaries` push object **y hệt shape cũ** (spread rỗng
   `{}` khi `provinceMismatchWarnings` undefined — key `warnings` không xuất hiện trong object,
   đúng yêu cầu "không thêm field lạ vào response nếu rỗng/null"). Verify bằng: toàn bộ 228 test cũ
   PASS nguyên trạng, không sửa 1 assertion nào trong các test cũ.
2. **Period CÓ bind province template nhưng NV khớp tỉnh** (test #2) → vẫn 1 query
   `custom_fields` thêm (chi phí nhỏ, chỉ khi period thật sự dùng `applicability_scope=province`),
   nhưng `warnings` vẫn không xuất hiện trên object — không đổi shape response so với trường hợp
   không có province.
3. **Không đổi** bất kỳ công thức tính `gross/deduction/net/tax/si/gtgc` nào — guard chạy hoàn toàn
   độc lập, chỉ đọc thêm dữ liệu và gắn field optional vào summary, không rẽ nhánh logic tính toán.
4. **Không** gọi `resolveForEmployee` — chỉ đọc `sheet_template_snapshot_json` đã đóng băng từ bind
   time, đúng yêu cầu "KHÔNG gọi lại resolveForEmployee để chọn template mới".
5. **Không block** payslip khi mismatch — `processed` vẫn set bình thường, `net_amount` vẫn tính,
   `bindFinalPayslipToSettlement` vẫn chạy — chỉ thêm field cảnh báo bên cạnh (test #1 assert rõ
   `result.status==='processed'` + `total_net` đúng dù có mismatch).

---

## 9. Honesty / residual

| Item | Status |
|------|--------|
| `payroll_e2e_ready` | **false** |
| So khớp province PROCESS | **Hygiene-only** (trim + case-insensitive) — KHÔNG chuẩn hoá domain (`"Nam Định"` free-text sẽ hầu như luôn lệch so với code `"ND"` trừ khi vận hành nhập trùng) — đúng dependency mở ba-data đã ghi ở spec §9, KHÔNG tự viết bảng normalize trong Task này |
| Scoping theo `fragment_bind_mode=RIENG_OVERRIDE` (câu chữ literal BR-TPL-PROC-01) | **KHÔNG implement** — field này còn PAPER (chưa `ensureSchema`), không tồn tại vật lý để lọc. Cảnh báo áp dụng cấp nhân viên/kỳ (mọi payslip line của NV mismatch), khớp đúng ý AC-PAY-TPL-PROV-05 |
| `applicabilityProvinceCode` mirror vào snapshot | **ADD mới trong Task này** (gap từ 2 Task trước, xem §2) — chỉ áp dụng cho period bind **sau** thời điểm deploy thay đổi này; period đã bind trước đó (snapshot cũ không có field) → guard tự động bỏ qua (an toàn, không crash — đã test case #3) |
| Endpoint/API mới | Không có — thay đổi hoàn toàn nội bộ `processPayrollPeriod` + `bindToPeriod`, không đổi request/response contract ngoài field optional mới |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | §3–§8 |
| **files sửa** | `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` · `apps/api/hrm-api/src/payroll/payroll.service.ts` · `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` |
| **evidence_path** | `docs/qa/evidence/po-hrm-pay-tpl-resolve-process-guard-be-01.md` |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | pm → qa (verify sống theo rule "không rubber-stamp", đối chiếu §8 regression claim bằng cách tự chạy lại `pnpm exec jest src/payroll --silent`) |
