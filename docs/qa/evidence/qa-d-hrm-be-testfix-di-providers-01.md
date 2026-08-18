# QA Evidence — D-HRM-BE-TESTFIX-DI-PROVIDERS-01

- work_item_id: D-HRM-BE-TESTFIX-DI-PROVIDERS-01
- qa_role: qa
- qa_date_utc: 2026-08-11T10:19–10:22Z
- ack_status: **PASS_WITH_HOLD**
  - HOLD lý do: server thật đã boot và 2 controller (Attendance/Payroll) resolve DI OK (verify qua HTTP curl thật), nhưng server đó là **instance có sẵn** đang chạy trên máy (không phải server QA tự start trong Task này — cổng HRM_BE_PORT=28001 đã bị chiếm bởi process khác trước khi QA bắt đầu). QA không kill process lạ theo đúng chỉ dẫn Task. Vì vậy "boot log" riêng của attempt QA tự start bị EADDRINUSE ngay khi listen (không tới bước resolve module vì compile xong, resolve module xong, chỉ fail ở bước listen — xem log bên dưới) — KHÔNG chứng minh được gì thêm ngoài compile OK; bằng chứng "DI resolve OK, controller sống" đến từ HTTP curl vào server có sẵn (đã chạy dist/main từ trước, cùng source code sau fix, cùng thư mục NFD project).

## 1. Jest baseline (đầy đủ, `pnpm exec jest --silent`)

```
Test Suites: 206 passed, 206 total
Tests:       1861 passed, 1861 total
Snapshots:   0 total
Time:        19.838 s
```
0 fail — khớp baseline dev-be báo cáo (206/206 suites, 1861/1861 tests).

## 2. Live smoke — server thật

### 2a. QA tự start (`pnpm run start:dev`, port cấu hình HRM_BE_PORT=28001 theo deploy/xevn-ecosystem/.env)

Kết quả: Nest compile thành công ("Found 0 errors. Watching for file changes.") rồi crash ngay ở bước `listen()`:

```
[5:20:04 PM] Found 0 errors. Watching for file changes.

node:net:2009
    const ex = new UVExceptionWithHostPort(err, 'listen', address, port);
Error: listen EADDRINUSE: address already in use :::28001
    ...
    at async bootstrap (...\apps\api\hrm-api\src\main.ts:56:3) {
  code: 'EADDRINUSE', errno: -4091, syscall: 'listen', address: '::', port: 28001
}
```

→ Compile OK, KHÔNG thấy lỗi "Nest can't resolve dependencies of X" ở bất kỳ đâu trong log (nếu DI thiếu provider, Nest sẽ throw lỗi resolve TRƯỚC bước listen — không xảy ra ở đây). Nguyên nhân crash là port đã bị process khác (PID 9548, `node dist/main`, cùng path project, CreationDate 2026-08-11 17:10:39) chiếm — process này KHÔNG do QA start, QA không kill theo đúng rule "không kill process không rõ nguồn gốc của người khác". Port 3001 (PORT mặc định .env) không dùng vì `main.ts` ưu tiên `HRM_BE_PORT` (=28001) trước `PORT`.

### 2b. curl thật vào server có sẵn đang chạy (PID 9548, port 28001) — chứng minh 2 controller vừa fix DI resolve OK

```
$ curl -s -o /dev/null -w "HTTP_STATUS:%{http_code}\n" http://127.0.0.1:28001/api/hrm/attendance/records?company_id=holding
HTTP_STATUS:401

$ curl -s http://127.0.0.1:28001/api/hrm/attendance/records?company_id=holding
{"success":false,"code":"HRM-AUTH-001","message":"Unauthorized attendance access","timestamp":"2026-08-11T10:20:44.583Z"}

$ curl -s -o /dev/null -w "HTTP_STATUS:%{http_code}\n" http://127.0.0.1:28001/api/hrm/payroll/groups?company_id=holding
HTTP_STATUS:401

$ curl -s http://127.0.0.1:28001/api/hrm/payroll/groups?company_id=holding
{"success":false,"code":"HRM-AUTH-001","message":"Unauthorized payroll access","timestamp":"2026-08-11T10:20:44.723Z"}
```

Nhận định: HTTP 401 có body JSON đúng envelope chuẩn (`success:false`, `code:HRM-AUTH-001`, `message`) — nghĩa là request đã đi qua toàn bộ Nest pipeline: routing → controller instantiate (DI resolve tất cả provider trong constructor, bao gồm các service vừa được fix mock provider trong spec) → guard auth check → reject vì thiếu JWT hợp lệ. Nếu DI resolve fail, ứng dụng sẽ crash ngay khi bootstrap (ApplicationContext creation throw), sẽ KHÔNG có server nào lắng nghe port 28001 để trả response — do đó 401 có cấu trúc đúng là bằng chứng gián tiếp nhưng chắc chắn rằng AttendanceController và PayrollController (cùng toàn bộ dependency chain của chúng) resolve DI thành công trên server runtime thật (không phải test mock).

Không thử lấy JWT hợp lệ để test 200 vì: (a) Task cho phép dừng ở mức "chứng minh controller resolve" không bắt buộc phải tới 200, (b) không được seed/fake auth (U65).

## 3. Kết luận

- Jest: PASS đầy đủ (206/206, 1861/1861).
- Server boot: KHÔNG có lỗi DI resolve ở bất kỳ log nào quan sát được (cả compile log của QA lẫn hành vi runtime của server có sẵn).
- Curl 2 endpoint đại diện (Attendance, Payroll): PASS ở mức "controller sống, DI resolve OK" (401 auth, không phải 500/crash).
- HOLD: chưa tự tay start & giữ log full lifecycle của MỘT server instance do chính QA khởi tạo (vì port bị chiếm sẵn, đúng luật không kill process lạ) — nếu cần bằng chứng "sạch" hơn, cần người có quyền dừng process PID 9548 hoặc đổi port test.
