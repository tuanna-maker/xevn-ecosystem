# QA Evidence — HRM-MVP-GD1-PAY-09-CLUSTER-01

- work_item_id: HRM-MVP-GD1-PAY-09-CLUSTER-01
- qa_role: qa
- qa_date_utc: 2026-08-11T10:22–10:26Z
- ack_status: **PASS_WITH_HOLD**
  - Code hoạt động đúng theo test hiện có; có 2 GAP đáng ghi nhận (không tự fix — xem mục 4).

## 1. Jest scope — `pnpm exec jest src/payroll --silent`

```
Test Suites: 21 passed, 21 total
Tests:       212 passed, 212 total
Snapshots:   0 total
Time:        4.292 s
```
21/21 suites PASS — khớp baseline đã biết.

## 2. Code review — pay-payroll-group.service.ts + payroll.controller.ts (route `groups`)

- File đọc: `apps/api/hrm-api/src/payroll/pay-payroll-group.service.ts`, `apps/api/hrm-api/src/payroll/pay-payroll-group-resolver.ts`, `apps/api/hrm-api/src/payroll/pay-payroll-group.constants.ts`, route map trong `apps/api/hrm-api/src/payroll/payroll.controller.ts` (dòng 236–309: `GET/POST /groups`, `GET/PATCH /groups/:groupId`, `GET /groups/:groupId/members`).
- CRUD payroll_group (F-PAY-GROUP-01): `listGroups`, `getGroupById`, `createGroup`, `updateGroup` — đủ 4 thao tác, có scope theo company_id (`resolveHrmListScope` + `expandPayrollPeriodCompanyIds`), có kiểm tra unique code (`23505` → `HRM-PAY-409` `DUPLICATE_CODE`).
- `resolveEffectiveGroupForEmployee` (dòng ~340 trong service) gọi `loadActiveGroupsForCompany(companyId)` rồi `resolvePayrollGroupWinner` (trong `pay-payroll-group-resolver.ts`): match theo `employee_ids` (explicit) > `department_ids` > `position_keys`; nếu nhiều group cùng match, group có `priority` cao nhất thắng; nếu **nhiều group cùng priority cao nhất** → `ambiguous:true` → service ném `HRM-PAY-409` (`throwDualGroup409`, reason_code `AMBIGUOUS_PRIORITY`). Đây chính là câu trả lời cho case "2 payroll_group cùng applicability chồng nhau — ai thắng?": **không ai thắng, hệ thống từ chối (409) bắt buộc admin set priority rõ ràng** — đã có test cover (xem mục 3).

## 3. Coverage đối chiếu exit criteria gốc

### 3a. "Template bind: period create stores template_id snapshot (AC-PAY-TPL-03)" → **COVERED**
- `payroll.service.ts` dòng 624–625: field `pay_sheet_template_id` được map ra response kèm comment `/** AC-PAY-TPL-03 — bind fields must survive list/get refetch (R-PAY-PERIOD-LIST-TPL). */`.
- Có test tham chiếu AC-PAY-TPL-03 / `pay_sheet_template_id` trong: `pay-sheet-template.service.spec.ts`, `payroll.controller.spec.ts`, `payroll.service.spec.ts` — đã PASS trong run 21/21 ở mục 1.

### 3b. "Applicability: OU/BP/province scope resolution correct" → **PARTIAL COVERED, có GAP (xem mục 4.1)**
- Scope theo company_id (đại diện OU/BP: `holding` / `main` / `trsport` / `logistics`) được test đầy đủ ở `src/common/hrm-list-scope.spec.ts`:
  - `describe('expandPayrollPeriodCompanyIds ...')` — group CEO rollup gồm `main` + `HRM_GROUP_MEMBER_COMPANY_SLUGS`.
  - `describe('expandPayrollAttendanceSheetCompanyIds ...')` — 3 case: `holding` (gồm main+holding UUID, KHÔNG gồm trsport/logistics), `main` (gồm holding parity), `trsport` (hẹp, không rollup lên holding/main).
  - → Xác nhận OU/BP-level scope resolution (company_id ladder) đúng và có test.
- **Nhưng "province" thì KHÔNG có mặt ở bất kỳ đâu trong module payroll.** Đã grep toàn bộ `src/payroll/` cho từ khóa "province" (case-insensitive) → 0 kết quả. `PayPayrollGroupMatchRule` (trong `pay-payroll-group-resolver.ts`) chỉ có 3 field: `department_ids`, `position_keys`, `employee_ids` — không có field nào biểu diễn tỉnh/thành hoặc OU con.

## 4. GAP (không tự fix — chỉ ghi nhận)

### 4.1 GAP — Applicability rule không có dimension "province" tường minh
- Mô tả nghiệp vụ mẫu trong Task: "multi-template theo BP (VD: 6 tỉnh cho 1 BP, mỗi tỉnh 1 payroll_group riêng)". Nhưng schema `match_rule_json` (`PayPayrollGroupMatchRule`) chỉ match theo `department_ids` / `position_keys` / `employee_ids` của nhân viên — không có `province_id` / `province_code`.
- Hệ quả: để phân biệt 6 payroll_group theo 6 tỉnh trong cùng 1 BP (cùng company_id), team vận hành phải map gián tiếp qua `department_ids` (giả định mỗi tỉnh có phòng ban riêng) — **không có gì trong code hoặc test đảm bảo mapping "department = province" là đúng/nhất quán**. Nếu một BP có nhân viên nhiều tỉnh nhưng cùng phòng ban logic (VD: phòng "Kinh doanh" trải nhiều tỉnh), applicability rule hiện tại KHÔNG thể phân biệt được theo tỉnh.
- Khuyến nghị (không tự làm): xác nhận với BA/PO liệu "province" có nên là field applicability riêng (`province_ids?: string[]`) hay nghiệp vụ chấp nhận mapping qua department là đủ; nếu chấp nhận, nên có ít nhất 1 test case minh hoạ multi-province-per-BP thực tế thay vì chỉ test department/position/employee đơn thuần.

### 4.2 GAP — Case "chồng lấn priority" đã có test đơn vị (resolver) nhưng CHƯA có test tầng service/controller
- `pay-payroll-group-resolver.spec.ts` có test `'equal priority → ambiguous'` (PASS) chứng minh hàm thuần `resolvePayrollGroupWinner` trả `ambiguous:true` đúng.
- Nhưng KHÔNG tìm thấy test nào ở tầng `pay-payroll-group.service.ts` / `payroll.controller.spec.ts` gọi `resolveEffectiveGroupForEmployee` hoặc route liên quan và assert HTTP 409 + `reason_code:AMBIGUOUS_PRIORITY` thực sự được service ném ra đúng lúc trong luồng thật (VD lúc bind payroll period hoặc tính lương). Đây là GAP nhỏ về coverage tầng tích hợp (integration-level), logic lõi đã đúng nhưng đường dẫn để lỗi 409 này thực sự "nổi" lên cho user chưa được test end-to-end trong suite hiện có (theo phạm vi file đã đọc).

## 5. Live curl

- Server thật đang chạy sẵn trên máy (PID 9548, port 28001 — xem chi tiết & lý do không tự start instance riêng trong evidence `qa-d-hrm-be-testfix-di-providers-01.md` mục 2).
- `GET http://127.0.0.1:28001/api/hrm/payroll/groups?company_id=holding` → `HTTP_STATUS:401`, body `{"success":false,"code":"HRM-AUTH-001","message":"Unauthorized payroll access",...}` — xác nhận route `groups` map đúng, `PayrollController` + `PayPayrollGroupService` DI resolve OK trên runtime thật.
- Không test được response 200 thật (cần JWT hợp lệ + dữ liệu DB thật — ngoài phạm vi, không seed theo U65). Mức verify đạt được: code-review + jest (212/212 src/payroll) + curl xác nhận route sống ở tầng auth-gate.

## 6. Kết luận

- ack_status: PASS_WITH_HOLD — code đúng theo test hiện có, boot/route sống thật; 2 GAP ở mục 4 cần BA/PO xác nhận, không phải lỗi code.
