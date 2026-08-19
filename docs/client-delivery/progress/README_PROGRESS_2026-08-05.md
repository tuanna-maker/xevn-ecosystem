# Báo cáo tiến độ khách — 2026-08-05 (nội bộ team)

> File Excel khách: không chứa work_item / seed / sponsor lock. File này được phép meta.

## Đầu ra

| File | UC | Hoàn thành | Đang làm (gồm P1) | P1 trong Đang làm | Chưa/Chờ | % HT |
|------|---:|----------:|------------------:|------------------:|---------:|-----:|
| `BAO_CAO_TIEN_DO_XBOS_2026-08-05.xlsx` | 126 | 54 | 72 | 2 | 0 | 42.9% |
| `BAO_CAO_TIEN_DO_HRM_2026-08-05.xlsx` | 167 | 43 | 100 | 74 | 24 | 25.7% |

> `% HT` = Hoàn thành / Tổng — **không** cộng Chấp nhận tạm (P1).

Parse: Phase1=246 · XBOS=126 · HRM Phase1=120 · Blueprint=47

## Module XBOS

- **Auth / Cổng Portal**: 7/9 (77.8%)
- **Tổ chức / Pháp nhân**: 11/20 (55%)
- **Danh mục (Catalog)**: 10/45 (22.2%)
- **Danh mục Logistic**: 0/22 (0%)
- **Quy trình (Workflow)**: 10/11 (90.9%)
- **KPI / Command Center**: 8/10 (80%)
- **RACI / Phân quyền**: 8/8 (100%)
- **Cấu hình / Hệ thống**: 0/1 (0%)

## Module HRM

- **Nhân sự**: 19/35 (54.3%)
- **Chấm công**: 5/18 (27.8%)
- **Nghỉ phép**: 0/12 (0%)
- **Lương**: 2/16 (12.5%)
- **Tuyển dụng**: 5/18 (27.8%)
- **Mobile**: 0/15 (0%)
- **Metadata / Đồng bộ danh mục**: 12/33 (36.4%)
- **Quyết định / Khác**: 0/20 (0%)

## Locks (không claim)

- Phase 1 DONE = false
- remaster_program_done = false
- face_live = false
- Attendance module CLOSED = false

## Rebuild

```bash
node scripts/client-delivery/build-progress-xlsx.mjs
```

## work_item

`PO-CLIENT-PROGRESS-XBOS-HRM-XLSX-01`
