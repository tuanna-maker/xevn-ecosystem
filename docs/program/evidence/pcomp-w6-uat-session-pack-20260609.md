# W6 Sponsor UAT Session Pack — PCOMP-W6-SP-01

**Ngày chuẩn bị:** 2026-06-09 · **PM:** P1-L0-W6-UAT-PACK  
**Mục đích:** Bước duy nhất sponsor phải làm bằng tay — ký nhận UAT browser. Mọi gate kỹ thuật do team chạy trước.

## URL & stack

| Dịch vụ | URL |
|---------|-----|
| Web portal | http://localhost:5173 (fallback 5175) |
| HRM API | http://localhost:28001 |
| XBOS API | http://localhost:28002 |

Team đã xác nhận L0 PASS (`qc:dev-stack`, `qc:fe-be-health:pilot` 13/13) ngày 2026-06-09.

## Tài khoản

| Persona | Email | Mật khẩu | Kỳ vọng |
|---------|-------|----------|---------|
| CEO tập đoàn | ceo@xe.vn | Xevn@2026 | Full rollup CC + HRM embed |
| CEO ĐVTV | du-lich.ceo@xe.vn | Xevn@2026 | Chỉ scope công ty; 403/409 rollup |

## Checklist bắt buộc (đánh dấu PASS/FAIL)

### L2 — P-CC-01..09 (Command Center + HRM embed tabs)

Mở từng tab embed HRM — không banner đỏ, không bảng trống do API fail, không 409 scope.

### L2.5 — J-HRM-01..07

List → detail / deep link / back — không 404 scope.

## Mobile (song song — team QA, không bắt sponsor adb)

- APK qa-device SHA `C152EDD6…412BE` @ https://14-225-217-232.nip.io
- uat.nv0001@xe.vn / xevn-uat-2026

## Ký nhận

| Field | Value |
|-------|-------|
| Verdict | [ ] UAT-PASS [ ] UAT-FAIL |
| Ghi chú defect | |
| Ngày | |

Ghi verdict vào bus: `PCOMP-W6-SP-01 | sponsor -> pm | verdict`
