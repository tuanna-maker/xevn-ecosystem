# Trạng thái dịch vụ — XeVN (cho user)

**Cập nhật:** 2026-05-29 · Không dùng từ “pilot” — xem **UAT** / **Production**

## Tóm tắt

| Môi trường | Trạng thái |
|------------|------------|
| **UAT (dev/local)** — Command Center + HRM | **Sẵn sàng UAT** — Nest `/api/hrm` + Postgres `xevn_hrm`; **không** Supabase (`p1-r4-qc-01`, `p1-supa-qc-04`) |
| **UAT HTTPS** (`14-225-217-232.nip.io`) | **Sẵn sàng slice** tập đoàn — cần 3 API + đăng nhập lại sau deploy |

### Bắt buộc trước khi mở portal (tránh lỗi 500 giả)

| API | Port | Lệnh |
|-----|------|------|
| **hrm-api** | 28001 | `pnpm run dev:hrm-api` |
| xbos-api | 28002 | `pnpm run dev:xbos-api` |
| web-portal | 5175 | `pnpm run dev:web` |

Nếu **chỉ** bật portal mà **không** bật `hrm-api` → màn Nhân sự báo **HRM API 500** (proxy không có upstream). Team tự chạy `pnpm run qc:fe-be-health` để kiểm tra.
| **UAT** — CEO công ty thành viên / HRBP | **Chưa đủ dữ liệu** — đang S1–S3 |
| **Production** | **Chưa sẵn sàng** |

## Command Center (`http://localhost:5175`)

**Tài khoản UAT tập đoàn:** `ceo@xe.vn` / `Xevn@2026`

| Chức năng | UAT |
|-----------|-----|
| Đăng nhập, đơn vị thành viên | Sẵn sàng |
| Nhân sự, hợp đồng | Sẵn sàng |
| Bảo hiểm, tuyển dụng, chấm công, lương (iframe) | Sẵn sàng (đã có dữ liệu liên kết — QA 2026-05-24) |

Một số thao tác **tạo mới sâu** (vd. pipeline tuyển dụng đầy đủ) có thể bị chặn có thông báo — không phải lỗi mạng.

## Báo cáo dự án (PM)

- **Báo cáo trạng thái:** [`PROJECT_STATUS_REPORT.md`](./PROJECT_STATUS_REPORT.md)  
- **Chi tiết UAT/Prod:** [`SERVICE_READINESS_UAT_PRODUCTION.md`](./SERVICE_READINESS_UAT_PRODUCTION.md)  
- **Bằng chứng kiểm chứng:** [`EVIDENCE_INDEX.md`](./EVIDENCE_INDEX.md)

> Phase 1 **chưa xong** (~111 use case còn đang phát triển). Team **không** kết luận “hoàn thành dự án” cho đến khi báo cáo PM ghi QC GO Phase 1.
