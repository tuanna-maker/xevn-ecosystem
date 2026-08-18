# Evidence — PO-HRM-PAY-TPL-RESOLVE-PROVINCE-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAY-TPL-RESOLVE-PROVINCE-BE-01` |
| **parent** | `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01` |
| **from_role** | dev-be |
| **to_role** | pm / qa |
| **lane** | execution |
| **date** | 2026-08-12 |
| **priority** | P0 |
| **change_mode** | ADD (cột) · EXPAND (`applicability_scope=province`) |
| **honesty** | `payroll_e2e_ready=false` · resolver KHÔNG tính lương, chỉ chọn đúng mẫu · KHÔNG wire vào bind kỳ (b) hay mỗi dòng process (c) — Task khác |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01.md` (đọc toàn bộ) | §2 applicability_scope EXPAND · §3 resolveForEmployee ranking + I/O · §4 snapshot timing (cite, không đổi) · §5 override chain (cite, không đổi) · §6 error taxonomy 4 code · §7 6 AC pack · §9 dependency mở |
| 2 | `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` (đọc trước khi sửa) | ensureSchema pattern (`DO $$ IF NOT EXISTS` cho ALTER TABLE ADD COLUMN, đã có tiền lệ ở `payroll_periods.pay_sheet_template_id`) · CRUD hiện có · `headerSelectSql`/`headerFromJoin`/`mapHeader` |
| 3 | `apps/api/hrm-api/src/payroll/pay-sheet-template.service.spec.ts` | Pattern mock `db.query` stateful, `groupCeoToken`/`memberCeoToken`, `rejects.toMatchObject({ code })` |
| 4 | `docs/program/specs/PO-HRM-PAY-SRC-PRIORITY-SPEC-01.md` §1 | Xác nhận resolver mẫu (spec này) và SRC resolver (`pay-src-resolver.ts`) là 2 lớp độc lập — spec SRC-PRIORITY dẫn chiếu ngược `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 §5` cho override-theo-tỉnh, không đổi thứ tự SRC-01..05 |
| 5 | `apps/api/hrm-api/src/payroll/payroll.controller.ts` (đoạn `pay-sheet-templates*`) | Xác nhận route hiện có KHÔNG cần thêm — Task này không tạo endpoint mới (đúng §8 spec: "Không tạo API mới ngoài field EXPAND") |
| 6 | `apps/api/hrm-api/src/payroll/pay-payroll-group-resolver.ts` (PAY-09) | Pattern `resolvePayrollGroupWinner` — trả `{winner_id:null, ambiguous:true, group_ids}` thay vì throw khi tie ở tier cao nhất → **bắt chước style non-throw này** cho `resolveForEmployee` |
| 7 | `AGENTS.md` + `docs/program/SUBAGENT_READ_MAP.md` (dev-be lane) | Path lock NFD, cấm đụng `apps/web/**` |

---

## 2. solid_convention_ack

**Lưu ý phát hiện:** `_vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md`, `_vibe-team-os/04-CODE-MEMORY-JOURNAL.md`, `_vibe-team-os/26-DEV-LANES-WEB-MOBILE-BE.md` được dispatch prompt và `AGENTS.md`/`CLAUDE.md` trỏ tới **không còn tồn tại** trong `_vibe-team-os/` hiện tại (đã kiểm `ls _vibe-team-os/` — chỉ còn `19,31,33,35,36,37,README,UX-PRODUCT-RULES,incidents,rules,templates`). Đây là stale-reference across nhiều file cấu hình (không phải lỗi Task này, PM nên biết). Vì không đọc được `25`/`04` gốc, tôi bám sát **convention thực tế đã áp dụng trong chính file `pay-sheet-template.service.ts`** (block `@CODE-MEMORY` / `@CODE-MEMORY-CHANGE` với đủ trường Screen/UC/BR/SRS/TechSpec/DB_DESIGN/API_DESIGN/Purpose/WorkItem/Coded/Callers/Callees/FE-Actions/BE-Chain/Impact/must_keep/SOLID/LastVerified) — coi đây là SoT convention vì nó là bằng chứng sống, mới hơn doc đã mất.

| Trường | Giá trị |
|---|---|
| **be_boundary** | `PaySheetTemplateService.resolveForEmployee` chỉ đọc `pay_sheet_templates` (active, không archived) trong scope company + business_line_tag, xếp hạng, trả kết quả có cấu trúc. KHÔNG tính số tiền, KHÔNG mutate DB, KHÔNG tự bind template vào period, KHÔNG gọi tại (b) bind kỳ hay (c) mỗi dòng process (đúng yêu cầu Task — dependency mở cho Task sau) |
| **fe_boundary** | N/A — Task này BE-only, không đụng `apps/web/**`/`apps/portal-fe/**`/HRM FE (đúng lane dev-be, `_vibe-team-os/26` referenced nhưng không tồn tại — tuân theo tinh thần "BE lane" nêu ở `AGENTS.md`) |
| **@CODE-MEMORY-CHANGE** | Đã thêm block tiếng Việt đầy đủ trên `pay-sheet-template.service.ts` (xem §3 danh sách file), field SOLID giải thích rõ ranh giới resolver-only + quyết định thiết kế non-throw |

---

## 3. Deliverables (files sửa/thêm)

| Path | Thay đổi |
|------|------|
| `apps/api/hrm-api/src/payroll/pay-sheet-template.constants.ts` | EXPAND `PAY_SHEET_TPL_APPLICABILITY` thêm `'province'` (recommended value, không CHECK enum đóng) · ADD 4 error code `HRM_PAY_TPL_400_PROVINCE_SCOPE` / `HRM_PAY_TPL_409_PROVINCE_DUP` / `HRM_PAY_TPL_PROVINCE_MISMATCH` (constant, chưa dùng — dành cho Task PROCESS wiring) / `HRM_PAY_TPL_412_NO_PROVINCE_MATCH` |
| `apps/api/hrm-api/src/payroll/dto/pay-sheet-template.dto.ts` | ADD `applicabilityProvinceCode`/`applicability_province_code` (optional string, camel+snake dual) vào `CreatePaySheetTemplateDto` và `UpdatePaySheetTemplateDto` |
| `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` | ADD cột `applicability_province_code` (ensureSchema, `DO $$ IF NOT EXISTS` ALTER TABLE — pattern đã có tiền lệ, KHÔNG CHECK enum) + UNIQUE INDEX defense-in-depth `uq_pay_sheet_templates_company_line_province_active` (partial, chỉ khi province NOT NULL) · `PaySheetTemplateRow`/`mapHeader`/`headerSelectSql` EXPAND field · `createTemplate`/`updateTemplate` ADD BR-TPL-PROV-01 (`assertProvinceScope`) + BR-TPL-PROV-02 (`assertNoProvinceDuplicate`, proactive SELECT trước insert/update, có catch dự phòng nếu race vào unique index) · ADD method `resolveForEmployee(employee, periodContext, authorization?)` + type `PaySheetTemplateHeaderView`/`ResolveForEmployeeInput`/`ResolveForEmployeePeriodContext`/`PaySheetTemplateResolveResult` · `@CODE-MEMORY-CHANGE 2026-08-12` |
| `apps/api/hrm-api/src/payroll/pay-sheet-template-resolve-province.service.spec.ts` | **File mới** — 9 test case theo 4/6 AC khả thi trong scope + 2 test phòng thủ (AMBIGUOUS, NO_CANDIDATE) |

**Không đụng:** `apps/web/**` · `payroll.controller.ts` (không endpoint mới) · `pay-cntt-setup.service.ts` (endpoint `GET /pay-setup/resolve` hiện có KHÔNG sửa — resolver mới độc lập, xem §5) · PROCESS/SRC resolver · bảng normalize `work_location→province_code`.

---

## 4. Thiết kế `resolveForEmployee` (quyết định kỹ thuật, giải trình)

```text
resolveForEmployee(
  employee: { id, ouId?, positionKey?, provinceCode? },
  periodContext: { companyId, businessLineTag? },
  authorization?,
) → {
  candidates: PaySheetTemplateHeaderView[],
  recommended: PaySheetTemplateHeaderView | null,
  matchStatus: 'MATCHED' | 'NO_PROVINCE_MATCH' | 'AMBIGUOUS' | 'NO_CANDIDATE',
  warnings: string[],
  errorCode?: string,
  tiedTemplateIds?: string[],   // chỉ set khi AMBIGUOUS
}
```

- **Ranking:** tier1 `employee` khớp `employee_id` > tier2 `position` khớp `position_key` > tier3 `province` (khớp `business_line_tag` **và** `applicability_province_code === employee.provinceCode`, cả hai đều không null) > tier4 `ou` khớp `ou_id` > tier5 `company` (mặc định). Tie-break mọi tier: `is_default=true` trước, rồi `updated_at DESC` (đúng §3.3).
- **`employee.provinceCode`:** input nhận trực tiếp giá trị đã đọc AS-IS từ `employees.custom_fields.work_location` — **hàm này không tự query bảng employees, không tự chuẩn hoá domain** (đúng yêu cầu Task, dependency mở ba-data ở §9 spec). Caller (Task wiring sau) chịu trách nhiệm trích field và truyền vào.
- **NO_CANDIDATE (ranking rỗng — 0 template khớp ở BẤT KỲ tier nào, kể cả company mặc định):** trả `matchStatus='NO_CANDIDATE'`, `recommended=null`, `errorCode=HRM_PAY_TPL_404`.
- **AMBIGUOUS (≥2 template cùng tier cao nhất VÀ cùng tie-break `is_default`+`updated_at`):** trả `matchStatus='AMBIGUOUS'`, `recommended=null`, `errorCode=HRM_PAY_TPL_409_PROVINCE_DUP`, `tiedTemplateIds` liệt kê các id — **không tự chọn 1**.
- **Quyết định KHÔNG throw cho 2 case trên** (khác với các method CRUD khác trong cùng service vốn `throw new ApiException`): Task yêu cầu tường minh "bắt chước style `pay-payroll-group-resolver.ts`" cho case ambiguous — hàm đó trả `{winner_id:null, ambiguous:true}` chứ không throw. Áp dụng nhất quán cho cả NO_CANDIDATE để hàm resolver là 1 **pure query có cấu trúc**, không mutate side-effect qua exception; đúng tinh thần spec §3.1 "(b)/(c) — guard, không auto-bind": callers ở Task wiring sau tự quyết định throw/reject dựa trên `matchStatus`/`errorCode`. Đã ghi rõ quyết định này trong `@CODE-MEMORY` field SOLID để PM/SA review lại nếu muốn đổi thành throw khi wiring thật.
- **NO_PROVINCE_MATCH:** chỉ set khi có ≥1 candidate `applicability_scope=province` cùng `business_line_tag` (tức catalog CÓ khái niệm tỉnh cho model này) nhưng không khớp `employee.provinceCode` (null hoặc không đúng danh sách) → `warnings` chứa `HRM_PAY_TPL_412_NO_PROVINCE_MATCH`, `recommended` vẫn trả fallback tier 4/5 hợp lệ (không tự bịa mẫu tỉnh). Nếu model KHÔNG có trục tỉnh (VD `TIME_VP_HN`) → không có candidate province nào → không cảnh báo, `matchStatus='MATCHED'` thẳng company-wide (đúng case TG §3.4 spec).

---

## 5. Đối chiếu 6 AC (`AC-PAY-TPL-PROV-01..06`)

| AC | Trạng thái | Ghi chú |
|----|------|------|
| **AC-PAY-TPL-PROV-01** | ✅ PASS (2 test case) | `createTemplate` 2 template cùng `business_line_tag=LX_ROUTE` khác province lưu 2xx; thiếu `business_line_tag` khi có province → `HRM-PAY-TPL-400-PROVINCE-SCOPE` |
| **AC-PAY-TPL-PROV-02** | ✅ PASS | Template thứ 3 trùng `(LX_ROUTE, ND)` khi bản 1 active → `HRM-PAY-TPL-409-PROVINCE-DUP` |
| **AC-PAY-TPL-PROV-03** | ⚠️ PASS **qua `resolveForEmployee` trực tiếp, không qua HTTP** | Spec mô tả AC-03 bằng `GET /pay-setup/resolve?business_line_tag=…&province_code=…` — đó là endpoint **hiện có** `F-PAY-SETUP-RESOLVE-01` sống trong `pay-cntt-setup.service.ts` (`resolveSetup`, ranking cũ employee>position>ou>company, CHƯA có tier province). Task này **không được phép sửa** endpoint đó (ngoài scope dispatch — chỉ implement `resolveForEmployee` mới trên `PaySheetTemplateService`). Test AC-03 verify cùng ý định nghiệp vụ (chọn đúng template ND trong 3 mẫu ND/NB/TB) bằng cách gọi thẳng `svc.resolveForEmployee(...)` |
| **AC-PAY-TPL-PROV-04** | ✅ PASS (qua `resolveForEmployee`, cùng lý do AC-03) | province không khớp catalog → `NO_PROVINCE_MATCH` + warning, fallback company, không tự bịa mẫu |
| **AC-PAY-TPL-PROV-05** | ❌ **KHÔNG implement** (đúng chỉ định Task) | Cảnh báo `HRM-PAY-TPL-PROVINCE-MISMATCH` trên payslip line thuộc PROCESS/SRC resolver (`pay-src-resolver.ts` hoặc payroll process pipeline) — Task chỉ định rõ "KHÔNG viết luôn phần gọi resolver tại … mỗi dòng process". Constant `HRM_PAY_TPL_PROVINCE_MISMATCH` đã ADD sẵn ở `pay-sheet-template.constants.ts` cho Task wiring sau dùng, nhưng chưa gắn vào bất kỳ code path PROCESS nào |
| **AC-PAY-TPL-PROV-06** | ✅ PASS (kế thừa, không phải test mới) | "Đổi `applicability_province_code` sau `processed` không đổi dòng kỳ đã chạy" — đã được test bao phủ bởi test **có sẵn** `pay-sheet-template.service.spec.ts`: `'bind snapshot; immutability after processed → HRM-PAY-TPL-409-IMMUTABLE'` (snapshot đã đóng băng tại bind-time, cơ chế immutability không đổi bởi field mới) — không cần thêm test, cite lại |

**Test phòng thủ thêm (ngoài 6 AC, Task yêu cầu tường minh):**
- `BR-TPL-RESOLVE-02` — 2 template cùng tier cao nhất + cùng tie-break → `AMBIGUOUS`.
- Ranking rỗng — company scope 0 template active → `NO_CANDIDATE`.
- Case TG (`TIME_VP_HN`, không có trục tỉnh) — xác nhận không sinh cảnh báo giả khi model không dùng province.

---

## 6. Jest trước/sau

**Trước khi sửa (baseline, cite từ dispatch prompt và verify lại):**
```text
pnpm exec jest src/payroll --silent
→ Test Suites: 21 passed, 21 total
→ Tests:       212 passed, 212 total
```

**Sau khi sửa:**
```text
pnpm exec jest src/payroll/pay-sheet-template-resolve-province --silent
→ Test Suites: 1 passed, 1 total
→ Tests:       9 passed, 9 total

pnpm exec jest src/payroll --silent
→ Test Suites: 22 passed, 22 total
→ Tests:       221 passed, 221 total   (212 baseline + 9 mới, 0 fail, 0 giảm)
```

**tsc --noEmit:**
```text
pnpm exec tsc --noEmit -p .
→ 268 lỗi TS (baseline tồn đọng trước Task, xác nhận qua grep) — 0 lỗi liên quan pay-sheet-template*/pay-cntt-setup* sau khi sửa
```

---

## 7. Honesty / residual

| Item | Status |
|------|--------|
| `payroll_e2e_ready` | **false** |
| Wiring (b) bind kỳ — guard resolveForEmployee khi C&B chọn thủ công | **CHƯA làm** — dependency mở, Task sau |
| Wiring (c) PROCESS mỗi dòng — `HRM-PAY-TPL-PROVINCE-MISMATCH` trên payslip line | **CHƯA làm** — dependency mở, Task sau (AC-05) |
| `GET /pay-setup/resolve` (F-PAY-SETUP-RESOLVE-01) EXPAND tier province | **CHƯA làm** — ngoài scope dispatch, cần Task riêng nếu muốn AC-03 literal qua HTTP |
| Normalize `work_location → province_code` | **CHƯA làm** — dependency mở ba-data (đúng spec §9, không tự chuẩn hoá) |

---

## 8. Phát hiện đáng báo cáo (correction, giống 2 lần trước)

1. **Doc OS đã mất:** `_vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md`, `04-CODE-MEMORY-JOURNAL.md`, `26-DEV-LANES-WEB-MOBILE-BE.md` được `CLAUDE.md`, `AGENTS.md`, `docs/program/SUBAGENT_READ_MAP.md` và chính dispatch prompt này trỏ tới nhưng **không tồn tại** trong `_vibe-team-os/` hiện tại (chỉ còn `19,31,33,35,36,37,README,UX-PRODUCT-RULES,incidents,rules,templates`). PM nên xác nhận đây là archive có chủ đích hay mất file ngoài ý muốn — nhiều role khác (dev-fe/dev-mobile/qa) cũng đang trỏ vào các file này.
2. **AC-PAY-TPL-PROV-03 trong spec mô tả sai tầng:** spec §7 viết AC-03 test qua `GET /pay-setup/resolve?...&province_code=...`, nhưng field `province_code` **không tồn tại** trong `ResolvePaySetupQueryDto` hiện tại của `pay-cntt-setup.service.ts` (chỉ có `ou_id`/`position_key`/`employee_id`/`business_line_tag`), và `resolveSetup()`/`applicabilityRank()` ở đó **chưa có tier `province`** (ranking cũ 4 tier employee>position>ou>company, không đọc `applicability_province_code`). Nghĩa là AC-03 **không thể PASS qua HTTP endpoint đó** cho tới khi có Task riêng EXPAND `pay-cntt-setup.service.ts` — đây là gap giữa spec và code thật, không phải lỗi Task này (Task này chỉ định rõ không sửa file đó). Đề xuất PM tạo Task `PO-HRM-PAY-SETUP-RESOLVE-PROVINCE-BE-01` (hoặc tương đương) để EXPAND `pay-setup/resolve` dùng chung ranking mới, hoặc chính thức xác nhận `GET /pay-setup/resolve` và `resolveForEmployee` là 2 API cố ý tách biệt (gợi ý/preview vs guard nghiêm ngặt).
3. **`is_default` không có ý nghĩa rõ ràng ở tier `province`:** cột `is_default` hiện dùng cho tier `company` (1 mặc định/công ty, code hiện có tự reset `is_default=false` cho các template khác khi 1 template set `is_default=true` **toàn company**, không phân biệt theo `business_line_tag`). Nếu tương lai 2 template `province` khác `business_line_tag` cùng set `is_default=true`, logic reset hiện tại (`WHERE company_id = $1 AND archived_at IS NULL`) sẽ tắt default của CẢ HAI (cross business_line_tag) — có thể không phải hành vi mong muốn khi multi-model. Task này **không sửa** hành vi `is_default` hiện có (ngoài scope), chỉ ghi nhận để SA cân nhắc khi thiết kế Task wiring sau.

---

## 9. next_owner / next_dispatch_prompt (đề xuất)

```text
work_item_id: PO-HRM-PAY-TPL-RESOLVE-PROVINCE-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P0
depends_on: PO-HRM-PAY-TPL-RESOLVE-PROVINCE-BE-01 READY_FOR_QA
entry_criteria: jest 221/221 PASS; tsc 0 lỗi mới; evidence này
exit_criteria: review code resolveForEmployee đúng ranking spec §3.3; xác nhận AC-01/02/03/04/06 qua unit test đủ tin cậy (KHÔNG cần browser — chưa có FE/endpoint mới); AC-05 explicit NOT_IMPLEMENTED
cấm: claim payroll_e2e_ready; seed DB; browser test (chưa có UI mới)
evidence: docs/qa/evidence/po-hrm-pay-tpl-resolve-province-qa-01.md
honesty: payroll_e2e_ready=false
```

---

## 10. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §3–§6 |
| **next_owner** | pm → qa (hoặc pm quyết định dispatch Task wiring (b)/(c) trước) |
| **next_dispatch_prompt** | §9 |
| **evidence_path** | `docs/qa/evidence/po-hrm-pay-tpl-resolve-province-be-01.md` |
| **ack_status** | `READY_FOR_QA` |
