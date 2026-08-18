# D-HRM-BE-TESTFIX-DI-PROVIDERS-01 — Sửa lỗi test FAIL (DI provider thiếu + business rule sealed)

**work_item_id:** `D-HRM-BE-TESTFIX-DI-PROVIDERS-01`
**Status:** DONE — jest full suite 0 failed

## Tóm tắt

Toàn bộ `production code` (`app.module.ts`) đã đăng ký đủ provider từ trước; lỗi FAIL nằm hoàn toàn ở
test file cũ chưa cập nhật theo constructor mới của `AttendanceController` / `PayrollController`, và
1 test kỳ vọng hành vi cũ đã bị business rule mới (đã sealed, QA PASS) thay thế.

## Baseline trước khi sửa

```
Test Suites: 6 failed, 200 passed, 206 total
Tests:       48 failed, 1813 passed, 1861 total
```

## Kết quả sau khi sửa

```
Test Suites: 206 passed, 206 total
Tests:       1861 passed, 1861 total
```

`pnpm exec tsc --noEmit` vẫn còn ~268 lỗi type tồn đọng từ trước (không thuộc phạm vi task này —
mock spec kiểu cũ ở các module khác); không có lỗi TS mới phát sinh trong các file đã sửa. Các lỗi TS
còn sót lại trong `payroll.controller.spec.ts` (dòng ~183, 204, 218, 353 — sai số lượng tham số gọi
`processPayrollPeriod` / `enrollPayrollPeriod`, sai literal type `PayrollEnrollMode`) là lỗi tiền tồn
tại từ trước, nằm ngoài các đoạn tôi chỉnh sửa (chỉ đụng vào phần import + mảng `providers` trong
`beforeEach`).

## Nhóm A — DI thiếu mock provider (5 file)

Đọc constructor thực tế:
- `AttendanceController` (`src/attendance/attendance.controller.ts:276-294`) — 17 tham số, thiếu 3
  provider trong nhiều spec file: `AttOtCompLeavePolicyService`, `AttSickLeaveFundOrderService`,
  và **`AttActivateEnrollService`** (phát hiện thêm trong quá trình sửa — không nằm trong root-cause
  brief ban đầu, nhưng cùng nhóm lỗi DI, cùng file, cần thiết để đạt 0 fail).
- `PayrollController` (`src/payroll/payroll.controller.ts:157-165`) — 7 tham số, thiếu
  `PayCnttSetupService` và **`PayPayrollGroupService`** (phát hiện thêm tương tự, chỉ thiếu trong
  `p1-phase1-be-mob-jmob-04-05.spec.ts` — `payroll.controller.spec.ts` đã có sẵn).

File đã sửa (thêm import + provider mock trong `Test.createTestingModule({ providers: [...] })`):

1. `src/payroll/payroll.controller.spec.ts` — thêm `PayCnttSetupService` (mock đủ 11 method được
   controller gọi qua route `pay-policy-packs*` / `pay-input-pack-profiles*` / `pay-setup/resolve`,
   dùng `jest.fn()` theo convention sẵn có của file).
2. `src/attendance/attendance.controller.spec.ts` — thêm `AttSickLeaveFundOrderService` (2 method
   `getFundOrder`/`putFundOrder`, theo pattern `attOtCompLeavePolicyMock` đã có sẵn) và
   `AttActivateEnrollService` (`useValue: {}` — controller inject nhưng không gọi method nào trong
   test file này).
3. `src/attendance/attendance-sheet-scope-parity.spec.ts` — thêm `AttOtCompLeavePolicyService`,
   `AttSickLeaveFundOrderService`, `AttActivateEnrollService` (cả 3 dùng `useValue: {}` theo convention
   toàn file — không có test nào gọi method của các service này).
4. `src/attendance/be-hrm-c-conv-as-01.spec.ts` — thêm 3 provider tương tự file (3), cùng convention
   `useValue: {}`.
5. `src/common/p1-phase1-be-mob-jmob-04-05.spec.ts` — file dùng chung 2 block `createTestingModule`
   (1 cho `PayrollController`, 1 cho `AttendanceController`). Thêm `PayCnttSetupService` +
   `PayPayrollGroupService` vào block Payroll; thêm `AttOtCompLeavePolicyService` +
   `AttSickLeaveFundOrderService` + `AttActivateEnrollService` vào block Attendance — tất cả
   `useValue: {}` vì test file này chỉ verify HTTP scope-parity, không gọi method của các service mới.

Toàn bộ mock đều đủ để Nest DI resolve được (không cần mock đủ method — theo đúng chỉ dẫn của task);
riêng `PayCnttSetupService` trong `payroll.controller.spec.ts` được mock đầy đủ method vì file này có
convention rõ ràng (mock chi tiết theo route).

## Nhóm B — Test lỗi thời do business rule đã sealed (1 file)

`src/merge-tokens/emp-extension-merge-token.spec.ts` — test `VAL-EMP-TOK-05b`:

- **Trước:** gọi `appendExtensionItems('xevn', 'holding', 'leave_types', [...])` và kỳ vọng
  `out.upserted === 1`, không tạo merge token — đây là hành vi CŨ, trước khi
  `PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01` chốt rule.
- **Sau:** đổi thành `await expect(service.appendExtensionItems(...)).rejects.toMatchObject({ code:
  HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN, status: HttpStatus.CONFLICT })`, theo đúng pattern test
  `appendExtensionItems on leave_types → 409 HRM-SC-LEAVE-REF-ONLY` trong
  `src/settings-catalogs/hrm-settings-leave-type-sot.spec.ts` (test đã PASS, cùng cặp
  guard/constant `assertLeaveTypesExtensionMutateForbidden` /
  `HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN` từ `src/settings-catalogs/hrm-settings-leave-type-sot.ts:47`).
- Đổi tên test thành "non-allow-list extension save on leave_types → forbidden, must use attendance
  leave-types API", giữ nguyên ID prefix `VAL-EMP-TOK-05b`.
- **Không đụng vào guard/business logic** — chỉ sửa expectation của test cho khớp hành vi đã sealed
  (QA PASS `ATTLVTSOTQA-MSNG88NH`, QC GWC `ATTLVTSOTQC1-MSNGQC01`).
- Import thêm `HttpStatus` (`@nestjs/common`) và `HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN`
  (`../settings-catalogs/hrm-settings-leave-type-sot`) vào đầu file.

## Files đã sửa (đúng allowed_paths)

- `apps/api/hrm-api/src/attendance/attendance.controller.spec.ts`
- `apps/api/hrm-api/src/attendance/attendance-sheet-scope-parity.spec.ts`
- `apps/api/hrm-api/src/attendance/be-hrm-c-conv-as-01.spec.ts`
- `apps/api/hrm-api/src/payroll/payroll.controller.spec.ts`
- `apps/api/hrm-api/src/common/p1-phase1-be-mob-jmob-04-05.spec.ts`
- `apps/api/hrm-api/src/merge-tokens/emp-extension-merge-token.spec.ts`
- `docs/qa/evidence/d-hrm-be-testfix-di-providers-01.md` (file này)

Không đụng `app.module.ts`, không đụng bất kỳ `*.service.ts` / `*.controller.ts` nào, không chạm
`apps/web/**` / `apps/mobile/**`. Không `git add` / không commit.
