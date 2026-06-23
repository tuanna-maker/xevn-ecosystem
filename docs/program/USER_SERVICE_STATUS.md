# Trạng thái dịch vụ — XeVN (cho user)

**Cập nhật:** 2026-06-07 · Không dùng từ “pilot” — xem **UAT** / **Production**

## Tóm tắt

| Môi trường | Trạng thái |
|------------|------------|
| **UAT (dev/local)** — Command Center + HRM | **Sẵn sàng UAT (GWC)** — W5 QC **GO WITH CONDITIONS** localhost; Nest `/api/hrm` + Postgres `xevn_hrm`; cần bật `hrm-api` :28001 |
| **Mobile (localhost API)** | **API PASS** — ScopeScreen U39 parity (`pcomp-w4-qa-01`); thao tác tap trên máy thật/emulator **chưa** ký nhận |
| **Sponsor UAT (W6)** | **Chưa mở** — chờ buổi ký nhận sponsor sau PM sync (`PCOMP-W6-SP-01`) |
| **UAT HTTPS** (`14-225-217-232.nip.io`) | **Sẵn sàng slice** tập đoàn — L0–L2.5 API **PASS** (gates trước); **không** thay W6 localhost sponsor session |
| **Production** | **Chưa sẵn sàng** — [`SERVICE_READINESS_UAT_PRODUCTION.md`](./SERVICE_READINESS_UAT_PRODUCTION.md) §3 (corp domain **BLOCKED**; ~90% product completion **≠** PROD) |

### Product completion (~90%)

W1–W3 **đóng** trên localhost (mock-free embed + integrity script exit **0**). W4 mobile **API PASS**. W5 QC **GWC**. W6 sponsor UAT **pending**. **Chưa** hoàn thành Phase 1 · **chưa** PROD.

### Bắt buộc trước khi mở portal (tránh lỗi 500 giả)

| API | Port | Lệnh |
|-----|------|------|
| **hrm-api** | 28001 | `pnpm run dev:hrm-api` |
| xbos-api | 28002 | `pnpm run dev:xbos-api` |
| web-portal | 5175 | `pnpm run dev:web` |

Nếu **chỉ** bật portal mà **không** bật `hrm-api` → màn Nhân sự báo **HRM API 500** (proxy không có upstream). Team tự chạy `pnpm run qc:fe-be-health` để kiểm tra.

## Command Center (`http://localhost:5175`)

**Tài khoản UAT tập đoàn:** `ceo@xe.vn` / `Xevn@2026`

| Chức năng | UAT |
|-----------|-----|
| Đăng nhập, đơn vị thành viên | Sẵn sàng (GWC) |
| Nhân sự, hợp đồng | Sẵn sàng (GWC) |
| Bảo hiểm, tuyển dụng, chấm công, lương (iframe) | Sẵn sàng — dữ liệu liên kết; W5 regression **13/13** pilot health |

Một số nhánh mock còn mở (**M-CC-11/12** GlobalFilter / trang CC) — team đang xử lý; không phải lỗi mạng khi API đã bật.

## Mobile HRM

| Slice | UAT |
|-------|-----|
| ScopeScreen + operating-units API | **API PASS** — group CEO **5** slugs; member CEO cách ly (`du-lich.ceo@xe.vn`) |
| J-MOB device journeys | **Chưa ký nhận** — chờ emulator/device smoke |

## Báo cáo dự án (PM)

- **Báo cáo trạng thái:** [`PROJECT_STATUS_REPORT.md`](./PROJECT_STATUS_REPORT.md)  
- **Chi tiết UAT/Prod:** [`SERVICE_READINESS_UAT_PRODUCTION.md`](./SERVICE_READINESS_UAT_PRODUCTION.md)  
- **Bằng chứng kiểm chứng:** [`EVIDENCE_INDEX.md`](./EVIDENCE_INDEX.md)

> Product completion ~**90%** (W1–W5 localhost GWC). **Chưa** kết luận “hoàn thành dự án” — W6 sponsor UAT + residuals M-CC-11/12 / J-MOB device + PROD corp domain còn mở.
