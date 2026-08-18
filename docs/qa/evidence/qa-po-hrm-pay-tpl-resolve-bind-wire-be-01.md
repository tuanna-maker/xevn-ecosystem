# QA Evidence — QA-PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01` |
| **parent** | `PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-12 |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Cảnh báo đã đọc

Đã đọc `docs/qa/evidence/_archived-fabricated/qa-po-hrm-pay-tpl-resolve-bind-wire-be-01_FABRICATED-2026-08-12.md`
(bản cũ claim `PASS_TO_PM`, "12 passed, 12 total", "no compile errors" cho code dead-code lồng trong
`if (templateId)` — không bao giờ chạy tới). Không dùng bản đó làm căn cứ. Toàn bộ số liệu dưới đây
là do QA này tự chạy trong Task hiện tại, đối chiếu trực tiếp với code hiện có trên đĩa.

## 1. jest — tự chạy

```
cd apps/api/hrm-api && pnpm exec jest src/payroll --silent
→ Test Suites: 22 passed, 22 total
→ Tests:       228 passed, 228 total
→ Time:        3.661s
```

Khớp đúng baseline dev-be báo (228/228).

## 2. Code review — xác nhận nhánh autoResolve KHÔNG phải dead code

Đọc `apps/api/hrm-api/src/payroll/payroll.controller.ts`, method `createPayrollPeriod` (khoảng dòng
191–279):

- Luồng thật: `payrollService.createPayrollPeriod(...).then(async (data) => { if (templateId) { ...; return ok(...); } if (body.autoResolve) { ... } return ok(data, ...); })`.
- Nhánh `if (body.autoResolve)` nằm CÙNG CẤP với nhánh `if (templateId) { ...; return ok(...); }`, KHÔNG lồng bên trong nó — nhánh `templateId` có `return` sớm nên khi `templateId` có giá trị, nhánh `autoResolve` bị bỏ qua đúng như thiết kế (bind thủ công ưu tiên); khi không có `templateId`, luồng rơi xuống `if (body.autoResolve)` và CHẠY ĐƯỢC. Đây là khác biệt căn bản so với bug đã archive (code cũ lồng `autoResolve` bên trong chính `if (templateId)`, tự mâu thuẫn điều kiện, không bao giờ true).
- 4 nhánh kết quả đọc trực tiếp từ code, đúng như evidence dev-be mô tả:
  - Thiếu `employeeContext.employee_id` → throw `HRM_PAY_TPL_400_AUTO_RESOLVE_INPUT` (`HRM-PAY-TPL-400-AUTO-RESOLVE-INPUT`), 400.
  - `resolution.matchStatus === AMBIGUOUS` → throw `resolution.errorCode ?? HRM_PAY_TPL_409_PROVINCE_DUP` (`HRM-PAY-TPL-409-PROVINCE-DUP`), 409.
  - `resolution.matchStatus === NO_CANDIDATE || !resolution.recommended` → throw `resolution.errorCode ?? HRM_PAY_TPL_404` (`HRM-PAY-TPL-404`), 404.
  - `MATCHED`/`NO_PROVINCE_MATCH` có `recommended` → `bindToPeriod` + response có `resolve_match_status` (+ `resolve_warnings` nếu `warnings.length > 0`).
- Đối chiếu `apps/api/hrm-api/src/payroll/dto/create-payroll-period.dto.ts` — `autoResolve?: boolean` (IsOptional+IsBoolean) và `employeeContext?: CreatePayrollPeriodEmployeeContextDto` (IsOptional+ValidateNested) tồn tại đúng như mô tả; `CreatePayrollPeriodEmployeeContextDto.employee_id` là `@IsUUID()` bắt buộc (không optional) trên chính DTO con.
- Đối chiếu `apps/api/hrm-api/src/payroll/pay-sheet-template.constants.ts` — `HRM_PAY_TPL_400_AUTO_RESOLVE_INPUT = HRM-PAY-TPL-400-AUTO-RESOLVE-INPUT` (hyphen format, đúng convention 2 constant cũ HRM_PAY_TPL_404/HRM_PAY_TPL_409_PROVINCE_DUP), cả 3 constant được import đúng ở đầu payroll.controller.ts (dòng 143–145) và dùng đúng chỗ.

Kết luận: nhánh autoResolve là code thật, nằm đúng vị trí có thể chạy tới — không phải dead code như lần bị archive.

## 3. Live smoke — server đang chạy sẵn, ĐÃ verify sống

`netstat -ano | grep LISTENING` cho thấy hrm-api đang LISTEN ở cổng 28001 (không phải 3001 như
CLAUDE.md ghi mặc định — có thể do remap docker cục bộ khác) và hrm-fe ở cổng 8080. Vì server có
sẵn, đã thực hiện live smoke thật (không chỉ code-review), dùng INTERNAL_API_KEY dev mặc định lấy từ
apps/api/hrm-api/.env (`xevn-dev-internal-key`, trùng với .env.example — không phải secret thật).

Case 1 — thiếu employeeContext.employee_id (đúng yêu cầu dispatch), gọi employeeContext: {}:

```
POST /api/hrm/payroll/periods
Body: {..., "autoResolve": true, "employeeContext": {}}
→ HTTP 400
→ {"success":false,"code":"HRM-VAL-001","message":"employeeContext.employee_id must be a UUID", ...}
```

Đây là lỗi từ global ValidationPipe (class-validator `@IsUUID()` trên `employee_id!` của DTO con
chạy trước khi vào controller) — không phải lỗi tự viết `HRM-PAY-TPL-400-AUTO-RESOLVE-INPUT` của
controller. Do employeeContext là object có mặt (dù rỗng) nên `@ValidateNested()` chạy, và IsUUID
fail trước khi code trong `if (body.autoResolve)` được thực thi. Đây là hành vi đúng và an toàn về mặt
dữ liệu (400 sớm hơn), nhưng khác code cụ thể so với những gì evidence dev-be mô tả cho case
"thiếu employee_id".

Case 2 — omit hẳn employeeContext (không truyền field), autoResolve: true:

```
POST /api/hrm/payroll/periods
Body: {..., "autoResolve": true}   (không có employeeContext)
→ HTTP 400
→ {"success":false,"code":"HRM-PAY-TPL-400-AUTO-RESOLVE-INPUT","message":"employeeContext.employee_id is required when autoResolve=true", ...}
```

Đây mới là case verify đúng nhánh guard tự viết của controller (`if (!body.employeeContext?.employee_id)`) — 400 với đúng error code tự định nghĩa, khớp 100% mô tả trong evidence dev-be §1 case 7.

Kết luận live smoke: nhánh autoResolve guard THẬT SỰ chạy được và trả đúng error code khi test bằng
cách omit hẳn employeeContext. Khi employeeContext có mặt nhưng rỗng, DTO-level validation (global
ValidationPipe) chặn trước và trả HRM-VAL-001 thay vì custom code — đây không phải bug (chặn sớm hơn
vẫn đúng ngữ nghĩa 400), nhưng là điểm khác với cách diễn đạt "employeeContext thiếu employee_id" trong
dispatch — PM nên biết 2 sub-case cho ra 2 code khác nhau nếu FE tích hợp sau này cần phân biệt.

## 4. Phát hiện phụ (side-effect cần PM lưu ý) — KHÔNG phải seed giả, là hệ quả trực tiếp của live smoke

Khi gọi Case 2 (auth hợp lệ, autoResolve=true, thiếu employeeContext), request VẪN tạo ra 1 dòng
payroll_period thật trong DB trước khi guard throw — vì code gọi
`this.payrollService.createPayrollPeriod(body, ...)` (tạo period) TRƯỚC, rồi mới `.then()` chạy guard
autoResolve. Guard throw sau khi period đã persist, không có rollback/transaction bao ngoài. Đã xác
nhận bằng:

```
GET /api/hrm/payroll/periods?company_id=c1
→ data.data[0] = {id: "c2a3a676-1ea5-4207-b0b7-9d55f485e82e", company_id: "c1",
   period_label: "QA Smoke 3", status: "draft", ...}
```

Client nhận HTTP 400 (tưởng request thất bại hoàn toàn) nhưng thực tế đã có 1 kỳ lương "draft" mồ côi
tồn tại trong hệ thống — không liên kết pay_sheet_template_id (null), không gây sai lệch nghiệp vụ
ngay lập tức nhưng là rác dữ liệu / hành vi không idempotent. Đây là hành vi tồn tại sẵn ở cả nhánh
templateId thủ công cũ (không phải lỗi riêng của autoResolve) — vì payrollService.createPayrollPeriod
luôn chạy trước mọi guard bind template trong cùng 1 request. Không thuộc phạm vi autoResolve Task này
để sửa (không phải regression do Task này gây ra), nhưng nên có Task riêng xem xét bọc transaction hoặc
soft-cleanup period khi bind guard fail. Test record trên (c2a3a676-..., company c1, label
"QA Smoke 3") là dữ liệu QA tạo ra do side-effect của lệnh curl thật (không phải seed cố ý) — không
tự hard-delete (đúng rule dự án); đề nghị PM quyết định có cần dọn hay để lại vì company_id=c1 là
company thử nghiệm không phải company thật của tenant.

## 5. Exit criteria

| Criteria | Status | Ghi chú |
|----------|--------|---------|
| jest src/payroll = 228/228 | PASS | Tự chạy, khớp baseline |
| Nhánh autoResolve không phải dead code | PASS | Đọc code, xác nhận cùng cấp với if(templateId), không lồng |
| Custom error codes đúng constants | PASS | 3 constant đối chiếu file constants |
| Live smoke 400 đúng error code | PASS (case omit employeeContext) | Case truyền employeeContext:{} cho HRM-VAL-001 (DTO-level) khác custom code — đã ghi rõ khác biệt ở §3 |
| payroll_e2e_ready=false giữ nguyên | PASS | Không đổi field này, không claim UAT |
| Không seed DB giả cố ý (U65) | PASS (có ghi chú) | 1 period "draft" phát sinh do side-effect live smoke — đã báo cáo minh bạch ở §4, không che giấu |

## 6. Kết luận

Code đã sửa đúng vị trí, chạy được, jest 228/228 khớp baseline, live smoke xác nhận nhánh chạy thật với
đúng custom error code (ở sub-case omit field). Không phát hiện dead code hay claim giả như lần trước.
Có 1 phát hiện phụ (period mồ côi khi guard fail) cần PM cân nhắc Task riêng — không phải blocker cho
việc promote work item này.

## 7. Handoff

| Field | Value |
|-------|-------|
| **evidence_path** | `docs/qa/evidence/qa-po-hrm-pay-tpl-resolve-bind-wire-be-01.md` |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | pm — promote PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01 → DONE; cân nhắc Task riêng cho phát hiện phụ §4 |
