# Evidence — PO-HRM-PAY-CNTT-FE-STP-01-CLEANUP-01

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-PAY-CNTT-FE-STP-01-CLEANUP-01` (đóng luôn `PO-HRM-PAY-CNTT-FE-STP-01`) |
| lane | dev-fe |
| date | 2026-08-12 |
| ack_status | **READY_FOR_QA** |
| seed | none (U65) |

## spec_read_ack

Đã đọc đúng thứ tự trước khi sửa:

1. `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md` — UC-BP-PAY-STP-01 (CHUNG CRUD), AC-PAY-STP-01-01/02/04/05, AC-PAY-STP-GLOBAL-01, testid registry, error taxonomy.
2. `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md` §2.1 — bảng `pay_policy_pack` (company_id bắt buộc, code/nameVi/scope/businessLineTag/effectiveFrom/effectiveTo/status/rateParams).
3. `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-API-01.md` — file chỉ có 9 dòng (header + meta), không có nội dung route chi tiết; route thật lấy trực tiếp từ BE service (mục 6 dưới).
4. `docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md` — IA layout, field map §4.1/4.2/4.3, luồng U65, empty/error states, AC UI + testid.
5. `docs/hrm/ui-screens/UI-HRM-PAY-STP-HUB.md` — bối cảnh hub L1–L6 (màn Policy Pack là 1 nav-item con — không đổi vì ngoài phạm vi).
6. `apps/api/hrm-api/src/payroll/payroll.controller.ts` (route `pay-policy-packs*`, prefix Nest `api/hrm` từ `main.ts` `setGlobalPrefix('api/hrm')` + controller `payroll`) + `apps/api/hrm-api/src/payroll/pay-cntt-setup.service.ts` (`listPolicyPacks`/`createPolicyPack`/`updatePolicyPack` — response luôn `{items}` cho list, object cho create/update) + `apps/api/hrm-api/src/payroll/dto/pay-cntt-setup.dto.ts` (`company_id` bắt buộc mọi request) + `apps/api/hrm-api/src/common/api-response.ts` + `apps/api/hrm-api/src/common/http-exception.filter.ts` (envelope `{success, code, message, data, timestamp}`) — **BE đã LIVE**, đối chiếu route/DTO thật, không đoán.
7. `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` — chỉ đọc để tham khảo pattern; không copy react-hook-form/zod (quá nặng cho slice CHUNG hiện tại, ngoài "không đổi kiến trúc"). Đối chiếu convention test thật (`fireEvent`, `.toBeTruthy()`, `afterEach(cleanup)`, `render(createElement(Component))` trong `.test.ts`) từ `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.test.ts`.
8. `_vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md` §4 + `_vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md` — FE chỉ bind/validate input, không tính/merge nghiệp vụ; component hiện tại tuân thủ (rateParams chỉ pass-through JSON blob, không eval).

## solid_convention_ack

- SRP: `usePolicyPackApi.ts` chỉ lo data-fetch/mutate; `PolicyPackSetupScreen.tsx` chỉ lo UI/bind/validate — không trộn.
- FE/BE separation: không tính KPI/rateParams tại FE — chỉ JSON.stringify/JSON.parse pass-through; validate chỉ format-level (required, date order, JSON syntax) — đúng khuôn 28-FE-BE-SEPARATION §AP-01..06 (không có AP nào vi phạm).
- Không hard-delete, không tự sáng tác BR mới ngoài spec.

## Danh sách file

### Xoá
- `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.tsx.bak` — file backup rác.
- `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetup.test.ts` — test cũ, đã gộp.
- `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetup.test.tsx` — test cũ (mock sai kiểu, gán runtime sau `await import(...)` thay vì `vi.mock` hoisted), đã gộp.
- `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetup.test.skip.ts` — nháp bị skip, đã gộp.

### Sửa (giữ, viết lại toàn bộ nội dung)
- `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.tsx` — @CODE-MEMORY đầy đủ; toàn bộ copy UI/validate chuyển sang tiếng Việt có dấu chuẩn (trước đó gõ không dấu: "Ma goi", "Luu goi chinh sach"...); message hiệu lực khớp nguyên văn AC-PAY-STP-01-05 `"Hiệu lực đến phải sau hiệu lực từ"`; giữ nguyên `data-testid="pay-policy-pack-list"` (root) + `"pay-policy-pack-save"` (form) đúng testid registry SRS-01; thêm `data-testid="pay-policy-pack-scope-chung"` trên vùng heading (registry §Testid — khớp "Filter/tab CHUNG", hiện chưa có tab UI riêng vì component chỉ scope CHUNG theo đúng phạm vi cleanup này).
- `apps/web/hrm/src/components/payroll/policy-pack/usePolicyPackApi.ts` — viết lại root cause thật: hook cũ (1) không gửi `company_id` dù DTO `ListPayPolicyPacksQueryDto`/`CreatePayPolicyPackDto`/`UpdatePayPolicyPackDto` đều bắt buộc field này (sẽ luôn 400 khi chạy thật), (2) đọc thẳng `res.json()` làm kiểu trả về (BE thật trả `{success,code,message,data}`, list `data.items[]`) — khiến `list.data.map` sẽ crash lúc runtime thật dù test có thể pass vì test luôn mock hook. Hook mới: `company_id` bắt buộc trên mọi call (lấy qua `resolveHrmSpreadsheetScope()`/`HRM_LIST_DEFAULT_COMPANY_ID` — helper dùng chung toàn app, không tự chế mới), unwrap đúng envelope, map `HRM-PAY-POL-409-CODE`/`HRM-PAY-POL-400-DATE` → message tiếng Việt (SRS-01 §Error handling UI). Không đụng `apps/api/**`, không thêm dependency mới, không sửa `hrmApi.ts` (kiến trúc chung 376KB — ngoài phạm vi cleanup, chỉ tái sử dụng lib có sẵn `@/lib/portalAuthBridge`, `@/lib/hrmSpreadsheetScope`, `@/lib/hrmListScope`, `@/lib/safeRandomUuid`).

### Tạo mới (canonical test)
- `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.test.ts` — **lưu ý tên đuôi**: sponsor brief yêu cầu `.test.tsx`, nhưng `apps/web/hrm/vite.config.ts` `test.include` chỉ khớp `"src/**/*.test.ts"` (xác nhận bằng cách chạy thử `.tsx` — vitest báo `No test files found` dù filter đúng thư mục; kể cả 1 file `.test.tsx` có sẵn từ trước, `EmployeeSkillsRadarChart.test.tsx`, cũng chưa từng chạy vì lý do y hệt — bug tồn tại từ trước, không phải do slice này). Đã cân nhắc sửa `vite.config.ts` include glob để hỗ trợ `.tsx`, nhưng revert lại (giữ nguyên, xác nhận byte-identical với HEAD bằng `cmp`) vì: (a) ngoài `allowed_paths` của cleanup này, (b) bật `.tsx` làm lộ 1 test khác đang FAIL không liên quan (`EmployeeSkillsRadarChart.test.tsx` thiếu `ResizeObserver` polyfill cho `recharts`/jsdom) → rủi ro bị hiểu nhầm là regression do slice này gây ra. Chọn phương án an toàn hơn: giữ `.test.ts`, JSX viết bằng `React.createElement(...)` — đúng convention thật đang chạy trong repo (xem `EmployeeCompensationPanel.test.ts`). Đã flag việc này là action item riêng (xem mục "Ngoài phạm vi" bên dưới) thay vì tự ý mở rộng sửa.

## vitest — kết quả THẬT

Lệnh chạy đúng như yêu cầu:

```
cd apps/web/hrm && pnpm exec vitest run src/components/payroll/policy-pack/ --no-coverage
```

Kết quả:

```
✓ src/components/payroll/policy-pack/PolicyPackSetupScreen.test.ts (7 tests) 145ms

Test Files  1 passed (1)
     Tests  7 passed (7)
```

**7/7 PASS — 0 FAIL.**

Danh sách 7 test:
1. render danh sách CHUNG kèm dữ liệu (AC-PAY-STP-GLOBAL-01)
2. hiển thị empty state khi chưa có gói CHUNG nào
3. validate field bắt buộc — chặn submit khi thiếu mã/tên gói
4. AC-PAY-STP-01-01: tạo mới CHUNG hợp lệ → gọi create với payload đúng (2xx)
5. AC-PAY-STP-01-05: hiệu lực đến trước hiệu lực từ → chặn submit, không gửi request
6. rateParams không phải JSON hợp lệ → chặn submit kèm thông báo lỗi
7. AC-PAY-STP-01-02: sửa gói đã có — PATCH cập nhật rateParams (2xx)

## TypeScript

`pnpm exec tsc --noEmit -p tsconfig.app.json` (root `tsconfig.json` là project-references rỗng `files:[]`, không check gì nếu không `-b`; dùng thẳng `tsconfig.app.json` để check thật):

- Kết quả: **362 lỗi TS pre-existing** trên toàn app (nợ kỹ thuật đã biết, không liên quan slice này — ví dụ `UniAIChat.tsx`, `AttendanceExportDialog.tsx`, `ContractImportDialog.tsx`...).
- `grep -n "policy-pack" <tsc output>` → **0 dòng** — xác nhận 3 file trong `policy-pack/` (component + hook + test) **không phát sinh lỗi TS mới nào**.

## Ngoài phạm vi (không tự ý mở rộng — flag riêng)

- `apps/web/hrm/vite.config.ts` `test.include` chưa hỗ trợ `*.test.tsx` (bug repo-wide, ảnh hưởng cả `EmployeeSkillsRadarChart.test.tsx` có sẵn từ trước) — không sửa trong cleanup này vì ngoài `allowed_paths`; đã cân nhắc và revert. Cần PM/dev-fe khác xử lý riêng (thêm `.test.tsx` vào include + polyfill `ResizeObserver` cho jsdom nếu muốn bật lại `EmployeeSkillsRadarChart.test.tsx`).
- UC-BP-PAY-STP-02..06 (RIÊNG scope, BP filter, geo picker, VP allowance/cost, Archive) — component hiện tại (và bản cleanup này) **chỉ scope CHUNG** đúng như state được bàn giao; brief cleanup không yêu cầu build thêm các UC này (mục "Việc cần làm" #5 chỉ liệt kê: list+empty, required-field, create 2xx, rateParams JSON lỗi, sửa — đã đủ). Đã ghi rõ trong `@CODE-MEMORY` "NOT scope" để dev sau không nhầm là đã hoàn chỉnh toàn slice STP-01..06.

## Xác nhận đường dẫn (NFD canonical)

```
$ ls -la "apps/web/hrm/src/components/payroll/policy-pack/"
PolicyPackSetupScreen.test.ts
PolicyPackSetupScreen.tsx
usePolicyPackApi.ts
```

Chạy qua đúng `NFD_DIR=$(printf 'Ta\xcc\x80i li\xc3\xaa\xcc\xa3u')` construct, verify bằng Bash `ls`/`cat` (Read/Edit/Write tool bị lỗi ghi nhầm NFC trên path này — đã né bằng cách viết ra scratchpad ASCII rồi `cp` qua Bash, đúng theo `.agentmemory/MEMORY.md` đã ghi nhận từ trước).
