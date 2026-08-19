# Manifest — Squad W1-S4-DM-LOG

| Meta | Value |
|------|--------|
| **squad_id** | `W1-S4-DM-LOG` |
| **work_item_id** | `PO-UC-TC-W1-S4-DM-LOG` |
| **STT Phase1** | 98–119 |
| **UC count** | 22 |
| **author** | qa |
| **design_status** | DESIGNED |
| **ack_status** | **READY_FOR_SYNTH** |
| **execution** | not started · `uat_done: false` |
| **date** | 2026-08-04 |

## Nguồn thiết kế

| Nguồn | Ghi chú |
|-------|---------|
| `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B | STT 98–119 |
| `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` | UC local 1–22 = DM-LOG-01..22 |
| `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` | Pattern reuse M01 — **mỏng** |
| `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / M03 | Catalog hub pattern |
| `SRS_VN.md` | **N/A-DELTA** — không FR DM-LOG riêng |

## Honesty (TechSpec mỏng)

- Không có TechSpec logistics sâu từng UC → case DESIGN từ tên UC + bảng tổng hợp + pattern API.
- Jest `catalog-governance.controller.spec` gắn **cả 22** UC-ID vào **một** inbox smoke — **không** = 22 UC đã IMPL.
- P1 non-goal: `logistic-api`, 128 LG-* — notify/pull spoke = P2 stub.
- U65: sau này cấm seed evidence; seed cardinality (LOG-20/21) chỉ là gợi ý BR thiết kế.
- Floor độ sâu: CRUD/read ≥8 · WF (12/13/15/16) ≥12 (pad contract/auth/UX sau case nghiệp vụ lõi).
- Generator tái tạo (audit): `_gen_w1_s4_dm_log.mjs` — không phải artifact nghiệm thu.

## Bảng UC

| STT | uc_id | name_vi | caps | fns | cases_designed | code_readiness | file |
|----:|-------|---------|-----:|----:|---------------:|----------------|------|
| 98 | `XBOS-DM-LOG-01` | Xem tổng quan danh mục theo phân hệ Logistic | 2 | 3 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-01.md`](../XBOS-DM-LOG-01.md) |
| 99 | `XBOS-DM-LOG-02` | Tạo nhóm danh mục mới | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-02.md`](../XBOS-DM-LOG-02.md) |
| 100 | `XBOS-DM-LOG-03` | Thêm giá trị vào danh mục | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-03.md`](../XBOS-DM-LOG-03.md) |
| 101 | `XBOS-DM-LOG-04` | Sửa giá trị danh mục | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-04.md`](../XBOS-DM-LOG-04.md) |
| 102 | `XBOS-DM-LOG-05` | Ngừng hoặc kích hoạt giá trị | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-05.md`](../XBOS-DM-LOG-05.md) |
| 103 | `XBOS-DM-LOG-06` | Sắp xếp phân cấp cha–con | 1 | 2 | 8 | `UNKNOWN` | [`XBOS-DM-LOG-06.md`](../XBOS-DM-LOG-06.md) |
| 104 | `XBOS-DM-LOG-07` | Gán danh mục cho phân hệ Logistic | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-07.md`](../XBOS-DM-LOG-07.md) |
| 105 | `XBOS-DM-LOG-08` | Gán danh mục theo công ty thành viên | 1 | 1 | 8 | `UNKNOWN` | [`XBOS-DM-LOG-08.md`](../XBOS-DM-LOG-08.md) |
| 106 | `XBOS-DM-LOG-09` | Sao chép bộ danh mục sang công ty mới | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-09.md`](../XBOS-DM-LOG-09.md) |
| 107 | `XBOS-DM-LOG-10` | Xuất danh mục ra file | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-10.md`](../XBOS-DM-LOG-10.md) |
| 108 | `XBOS-DM-LOG-11` | Nhập danh mục từ file mẫu | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-11.md`](../XBOS-DM-LOG-11.md) |
| 109 | `XBOS-DM-LOG-12` | Gửi phê duyệt khi sửa danh mục nhạy cảm | 1 | 1 | 12 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-12.md`](../XBOS-DM-LOG-12.md) |
| 110 | `XBOS-DM-LOG-13` | Phê duyệt hoặc từ chối thay đổi danh mục | 2 | 2 | 12 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-13.md`](../XBOS-DM-LOG-13.md) |
| 111 | `XBOS-DM-LOG-14` | Xem lịch sử thay đổi danh mục | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-14.md`](../XBOS-DM-LOG-14.md) |
| 112 | `XBOS-DM-LOG-15` | Công ty con yêu cầu bổ sung trường danh mục | 1 | 1 | 12 | `UNKNOWN` | [`XBOS-DM-LOG-15.md`](../XBOS-DM-LOG-15.md) |
| 113 | `XBOS-DM-LOG-16` | Công ty con yêu cầu xóa trường — chuyển phê duyệt tập đoàn | 1 | 1 | 12 | `UNKNOWN` | [`XBOS-DM-LOG-16.md`](../XBOS-DM-LOG-16.md) |
| 114 | `XBOS-DM-LOG-17` | Phát hành phiên bản danh mục mới | 1 | 1 | 8 | `LIKELY_PARTIAL` | [`XBOS-DM-LOG-17.md`](../XBOS-DM-LOG-17.md) |
| 115 | `XBOS-DM-LOG-18` | Thông báo phân hệ Logistic có danh mục mới | 1 | 1 | 8 | `GAP` | [`XBOS-DM-LOG-18.md`](../XBOS-DM-LOG-18.md) |
| 116 | `XBOS-DM-LOG-19` | Kiểm tra danh mục thiếu trước vận hành | 1 | 1 | 8 | `UNKNOWN` | [`XBOS-DM-LOG-19.md`](../XBOS-DM-LOG-19.md) |
| 117 | `XBOS-DM-LOG-20` | Khai báo đủ 3 tầng dịch vụ vận tải | 1 | 1 | 8 | `UNKNOWN` | [`XBOS-DM-LOG-20.md`](../XBOS-DM-LOG-20.md) |
| 118 | `XBOS-DM-LOG-21` | Khai báo đủ 3 tầng loại phương tiện | 1 | 1 | 8 | `UNKNOWN` | [`XBOS-DM-LOG-21.md`](../XBOS-DM-LOG-21.md) |
| 119 | `XBOS-DM-LOG-22` | Rà soát sản phẩm dịch vụ chưa gắn bảng giá | 1 | 1 | 8 | `UNKNOWN` | [`XBOS-DM-LOG-22.md`](../XBOS-DM-LOG-22.md) |

## Sums

| Metric | Value |
|--------|------:|
| **UC files** | 22 |
| **cases_designed (Σ)** | **192** |
| Avg cases / UC | 8.7 |

### code_readiness rollup (UC count)

| readiness | UC |
|-----------|---:|
| `GAP` | 2 |
| `LIKELY_PARTIAL` | 12 |
| `UNKNOWN` | 8 |

### cases_designed by UC (quick)

| uc_id | cases |
|-------|------:|
| `XBOS-DM-LOG-01` | 8 |
| `XBOS-DM-LOG-02` | 8 |
| `XBOS-DM-LOG-03` | 8 |
| `XBOS-DM-LOG-04` | 8 |
| `XBOS-DM-LOG-05` | 8 |
| `XBOS-DM-LOG-06` | 8 |
| `XBOS-DM-LOG-07` | 8 |
| `XBOS-DM-LOG-08` | 8 |
| `XBOS-DM-LOG-09` | 8 |
| `XBOS-DM-LOG-10` | 8 |
| `XBOS-DM-LOG-11` | 8 |
| `XBOS-DM-LOG-12` | 12 |
| `XBOS-DM-LOG-13` | 12 |
| `XBOS-DM-LOG-14` | 8 |
| `XBOS-DM-LOG-15` | 12 |
| `XBOS-DM-LOG-16` | 12 |
| `XBOS-DM-LOG-17` | 8 |
| `XBOS-DM-LOG-18` | 8 |
| `XBOS-DM-LOG-19` | 8 |
| `XBOS-DM-LOG-20` | 8 |
| `XBOS-DM-LOG-21` | 8 |
| `XBOS-DM-LOG-22` | 8 |
| **Σ** | **192** |

## Handoff

```
ack_status: READY_FOR_SYNTH
work_item_id: PO-UC-TC-W1-S4-DM-LOG
squad: W1-S4-DM-LOG
uc_covered: 22/22
cases_designed: 192
next_owner: pm
evidence_path: docs/qa/professional/by-uc/_squad/W1-S4-DM-LOG_MANIFEST.md
```
