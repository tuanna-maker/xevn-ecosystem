# Sprint S0 — Retrospective

**Date:** 2026-05-23

## Facts (not marketing)

| Metric | Claimed earlier | Thực tế user |
|--------|-----------------|--------------|
| L2 smoke 11/11 | PASS | Đúng **proxy shell** sau BE fix |
| UI HRM embed | "Sẵn sàng" | User vẫn thấy **nhiều API lỗi** trong app — iframe còn hook Supabase |
| PM auto hook | Tiện | **Treo máy** — đã **STOP** |

## What went well

- BE `company_id=main` cho recruitment/attendance/payslips.
- Ma trận pilot + BA trace P-CC-05..08.

## What failed

- Gate chỉ Nest/proxy — **thiếu FE iframe audit**.
- Bus/QC PASS không khớp trải nghiệm browser.
- Hook inject prompt mỗi vòng → overload.

## Role improvements (sprint sau)

| Role | Cam kết |
|------|---------|
| **PM** | `STOP` hook; sprint backlog + retro; không ghi xanh trước FE audit |
| **QA** | `test:hrm-embed:audit` + vitest bắt buộc mỗi sprint |
| **Dev-FE** | Audit `apps/web/hrm` — mọi tab embed CC; loại Supabase khi `hrmDataMode` |
| **Dev-BE** | Restart API evidence sau DTO đổi |
| **QC** | GO chỉ khi USER_PILOT_STATUS khớp audit |

## Actions → S1 backlog

1. `hrm-embed-fe-audit` PASS trên mọi P-CC.
2. Giảm file gọi `supabase` trong path embed (ưu tiên use* hooks).
3. `web-portal` vitest ổn định.
