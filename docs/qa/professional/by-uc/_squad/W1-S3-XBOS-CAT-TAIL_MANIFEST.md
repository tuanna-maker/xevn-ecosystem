# Manifest — Squad W1-S3-XBOS-CAT-TAIL

| Meta | Value |
|------|--------|
| **squad_id** | `W1-S3-XBOS-CAT-TAIL` |
| **work_item_id** | `PO-UC-TC-W1-S3-XBOS-CAT` |
| **from_role** | qa |
| **ack_status** | **READY_FOR_SYNTH** |
| **date** | 2026-08-04 |
| **scope STT** | 81–97 · 367–373 |
| **uc_count** | 24 |
| **cases_designed_sum** | **302** |
| **uat_done** | false (design only · U65) |
| **locks** | U65 zero-seed · HP+FD+AU trên catalog/extension/publish · srs_old+srs_new mapped |

## Inventory

| STT | uc_id | name_vi | cases_designed | code_readiness | file |
|----:|-------|---------|---------------:|----------------|------|
| 81 | `XBOS-DM-05` | Ngừng hoặc kích hoạt giá trị | 12 | LIKELY_PARTIAL | `XBOS-DM-05.md` |
| 82 | `XBOS-DM-06` | Sắp xếp phân cấp cha–con | 12 | LIKELY_PARTIAL | `XBOS-DM-06.md` |
| 83 | `XBOS-DM-07` | Gán danh mục cho phân hệ đích | 11 | LIKELY_PARTIAL | `XBOS-DM-07.md` |
| 84 | `XBOS-DM-08` | Gán danh mục theo công ty | 12 | LIKELY_IMPL | `XBOS-DM-08.md` |
| 85 | `XBOS-DM-09` | Sao chép bộ danh mục | 10 | GAP | `XBOS-DM-09.md` |
| 86 | `XBOS-DM-10` | Xuất danh mục | 10 | LIKELY_PARTIAL | `XBOS-DM-10.md` |
| 87 | `XBOS-DM-11` | Nhập danh mục từ file | 14 | LIKELY_PARTIAL | `XBOS-DM-11.md` |
| 88 | `XBOS-DM-12` | Gửi phê duyệt thay đổi nhạy cảm | 14 | LIKELY_IMPL | `XBOS-DM-12.md` |
| 89 | `XBOS-DM-13` | Phê duyệt hoặc từ chối | 16 | LIKELY_IMPL | `XBOS-DM-13.md` |
| 90 | `XBOS-DM-14` | Xem lịch sử thay đổi | 10 | LIKELY_PARTIAL | `XBOS-DM-14.md` |
| 91 | `XBOS-DM-15` | Yêu cầu bổ sung trường (công ty con) | 14 | LIKELY_IMPL | `XBOS-DM-15.md` |
| 92 | `XBOS-DM-16` | Yêu cầu xóa trường — phê duyệt tập đoàn | 14 | LIKELY_PARTIAL | `XBOS-DM-16.md` |
| 93 | `XBOS-DM-17` | Phát hành phiên bản danh mục | 14 | LIKELY_IMPL | `XBOS-DM-17.md` |
| 94 | `XBOS-DM-18` | Thông báo phân hệ có danh mục mới | 11 | LIKELY_PARTIAL | `XBOS-DM-18.md` |
| 95 | `UC-ECO-MASTER-01` | Quản lý master data theo tenant và công ty | 12 | LIKELY_PARTIAL | `UC-ECO-MASTER-01.md` |
| 96 | `UC-ECO-MASTER-02` | Mở rộng tenant mới với tenant master | 12 | LIKELY_PARTIAL | `UC-ECO-MASTER-02.md` |
| 97 | `UC-ECO-FE-01` | Thay thế dữ liệu giả lập trên Web Portal bằng API thật | 10 | LIKELY_PARTIAL | `UC-ECO-FE-01.md` |
| 367 | `UC-XBOS-CAT-01` | Xem yêu cầu mở rộng danh mục HRM đang chờ | 12 | LIKELY_IMPL | `UC-XBOS-CAT-01.md` |
| 368 | `UC-XBOS-CAT-02` | Khởi chạy quy trình phê duyệt danh mục | 14 | LIKELY_IMPL | `UC-XBOS-CAT-02.md` |
| 369 | `UC-XBOS-CAT-03` | Xem hộp thư duyệt danh mục | 12 | LIKELY_IMPL | `UC-XBOS-CAT-03.md` |
| 370 | `UC-XBOS-CAT-04` | Xem chi tiết phiên duyệt danh mục | 12 | LIKELY_IMPL | `UC-XBOS-CAT-04.md` |
| 371 | `UC-XBOS-CAT-05` | Phê duyệt bước duyệt danh mục | 16 | LIKELY_IMPL | `UC-XBOS-CAT-05.md` |
| 372 | `UC-XBOS-CAT-06` | Từ chối bước duyệt danh mục | 14 | LIKELY_IMPL | `UC-XBOS-CAT-06.md` |
| 373 | `UC-XBOS-CAT-07` | Khởi tạo quy trình duyệt danh mục mẫu (theo công ty) | 14 | LIKELY_PARTIAL | `UC-XBOS-CAT-07.md` |

## Case sum

| Metric | Value |
|--------|------:|
| UC files | 24 |
| **Σ cases_designed** | **302** |
| Avg cases / UC | 12.6 |

## code_readiness rollup

| Verdict | UC count |
|---------|---------:|
| LIKELY_PARTIAL | 12 |
| LIKELY_IMPL | 11 |
| GAP | 1 |

## Notes for Synth

- Neo depth packs (không đè): `docs/qa/testcases/xbos/XBOS-CATALOG-CC.md` · `XBOS-INBOX-CAT.md` · `XBOS-CATALOG-MEMBER-MATRIX.md`
- API runtime cite: `catalog-governance.controller.ts` (`XBOS-CAT-200..213`, `XBOS-CFG-203`, `XBOS-CAT-210`)
- `XBOS-DM-09` = **GAP** (clone API chưa neo) — giữ TC, không claim IMPL
- `UC-XBOS-CAT-07` seed endpoint = ops only; UAT path = FE WF designer
- Design ≠ UAT DONE

## Handoff

```
ack_status: READY_FOR_SYNTH
work_item_id: PO-UC-TC-W1-S3-XBOS-CAT
uc_count: 24
cases_designed_sum: 302
next_owner: pm
evidence_path: docs/qa/professional/by-uc/_squad/W1-S3-XBOS-CAT-TAIL_MANIFEST.md
```
