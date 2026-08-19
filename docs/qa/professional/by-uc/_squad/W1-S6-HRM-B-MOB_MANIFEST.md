# Manifest — Squad W1-S6-HRM-B-MOB

| Meta | Value |
|------|--------|
| **squad_id** | `W1-S6-HRM-B-MOB` |
| **work_item_id** | `PO-UC-TC-W1-S6-HRM-B-MOB` |
| **STT range** | **301–366** |
| **UC count** | **66** |
| **cases_designed (sum)** | **963** |
| **design_status** | DESIGNED |
| **execution** | not started |
| **uat_done** | **false** |
| **ack_status** | **READY_FOR_SYNTH** |
| **author** | qa · PO-UC-TC-W1-S6-HRM-B-MOB |
| **date** | 2026-08-04 |
| **locks** | U65 · U76 · Leave L2 = SPEC_GAP inventory not PASS · Mobile ESS ≥10 cases · design ≠ UAT |

---

## 1. Sums

| Metric | Value |
|--------|------:|
| UC files | **66** |
| Tổng **cases_designed** | **963** |
| code_readiness LIKELY_IMPL | 33 |
| code_readiness LIKELY_PARTIAL | 31 |
| code_readiness GAP | 2 |
| code_readiness UNKNOWN | 0 |
| UC có SPEC_GAP/LOCK inventory | 7 |

### Theo depth

| depth | UC | cases |
|-------|---:|------:|
| mutate | 19 | 289 |
| read | 13 | 156 |
| report | 4 | 52 |
| wf | 6 | 120 |
| soft | 1 | 18 |
| embed | 8 | 122 |
| mobile | 15 | 206 |

---

## 2. Per-UC

| STT | uc_id | name_vi | cases_designed | code_readiness | HP/FD/SG | file |
|----:|-------|---------|---------------:|----------------|----------|------|
| 301 | `HRM-PR-04` | Chốt kỳ lương | 17 | `LIKELY_IMPL` | 4/4/0 | [`HRM-PR-04.md`](../HRM-PR-04.md) |
| 302 | `HRM-PR-05` | Xem phiếu lương | 12 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-PR-05.md`](../HRM-PR-05.md) |
| 303 | `HRM-PR-06` | Báo cáo đối soát lương | 13 | `LIKELY_PARTIAL` | 5/2/0 | [`HRM-PR-06.md`](../HRM-PR-06.md) |
| 304 | `HRM-RC-01` | Tạo yêu cầu tuyển dụng | 20 | `LIKELY_IMPL` | 6/4/0 | [`HRM-RC-01.md`](../HRM-RC-01.md) |
| 305 | `HRM-RC-02` | Xem danh sách yêu cầu tuyển dụng | 12 | `LIKELY_IMPL` | 4/3/0 | [`HRM-RC-02.md`](../HRM-RC-02.md) |
| 306 | `HRM-RC-03` | Tạo hồ sơ ứng viên | 16 | `LIKELY_IMPL` | 4/3/1 | [`HRM-RC-03.md`](../HRM-RC-03.md) |
| 307 | `HRM-RC-04` | Xem danh sách ứng viên | 12 | `LIKELY_IMPL` | 4/3/0 | [`HRM-RC-04.md`](../HRM-RC-04.md) |
| 308 | `HRM-RC-05` | Lên lịch phỏng vấn | 15 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-RC-05.md`](../HRM-RC-05.md) |
| 309 | `HRM-RC-06` | Cập nhật kết quả phỏng vấn | 15 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-RC-06.md`](../HRM-RC-06.md) |
| 310 | `HRM-CI-01` | Tạo hợp đồng lao động | 15 | `LIKELY_IMPL` | 4/3/0 | [`HRM-CI-01.md`](../HRM-CI-01.md) |
| 311 | `HRM-CI-02` | Ghi nhận bảo hiểm nhân viên | 15 | `LIKELY_IMPL` | 4/3/0 | [`HRM-CI-02.md`](../HRM-CI-02.md) |
| 312 | `HRM-CI-03` | Xem danh sách hợp đồng | 12 | `LIKELY_IMPL` | 4/3/0 | [`HRM-CI-03.md`](../HRM-CI-03.md) |
| 313 | `HRM-CI-04` | Cảnh báo hợp đồng sắp hết hạn | 13 | `LIKELY_PARTIAL` | 5/2/0 | [`HRM-CI-04.md`](../HRM-CI-04.md) |
| 314 | `HRM-CI-05` | Cập nhật hợp đồng | 15 | `LIKELY_IMPL` | 4/3/0 | [`HRM-CI-05.md`](../HRM-CI-05.md) |
| 315 | `HRM-CI-06` | Xóa hợp đồng | 18 | `LIKELY_IMPL` | 5/4/0 | [`HRM-CI-06.md`](../HRM-CI-06.md) |
| 316 | `HRM-CI-07` | Cảnh báo bảo hiểm sắp hết hạn | 13 | `LIKELY_PARTIAL` | 5/2/0 | [`HRM-CI-07.md`](../HRM-CI-07.md) |
| 317 | `HRM-MD-01` | Gửi yêu cầu thay đổi metadata hồ sơ | 15 | `LIKELY_IMPL` | 4/3/0 | [`HRM-MD-01.md`](../HRM-MD-01.md) |
| 318 | `HRM-MD-02` | Xem hàng chờ thay đổi metadata | 12 | `LIKELY_IMPL` | 4/3/0 | [`HRM-MD-02.md`](../HRM-MD-02.md) |
| 319 | `HRM-MD-03` | Phê duyệt thay đổi metadata | 20 | `LIKELY_IMPL` | 6/4/0 | [`HRM-MD-03.md`](../HRM-MD-03.md) |
| 320 | `HRM-MD-04` | Từ chối thay đổi metadata | 20 | `LIKELY_IMPL` | 6/4/0 | [`HRM-MD-04.md`](../HRM-MD-04.md) |
| 321 | `HRM-MD-05` | Xem nhật ký thay đổi metadata | 12 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-MD-05.md`](../HRM-MD-05.md) |
| 322 | `HRM-SC-01` | Xem tổng quan danh mục cấu hình HRM | 12 | `LIKELY_IMPL` | 4/3/0 | [`HRM-SC-01.md`](../HRM-SC-01.md) |
| 323 | `HRM-SC-02` | Đồng bộ toàn bộ danh mục từ XBOS | 15 | `LIKELY_IMPL` | 4/3/0 | [`HRM-SC-02.md`](../HRM-SC-02.md) |
| 324 | `HRM-SC-03` | Bổ sung giá trị danh mục mở rộng | 20 | `LIKELY_IMPL` | 6/4/0 | [`HRM-SC-03.md`](../HRM-SC-03.md) |
| 325 | `HRM-SC-04` | Yêu cầu xóa trường danh mục | 16 | `LIKELY_PARTIAL` | 4/4/0 | [`HRM-SC-04.md`](../HRM-SC-04.md) |
| 326 | `HRM-SC-05` | Phê duyệt lô mở rộng danh mục | 20 | `LIKELY_IMPL` | 6/4/0 | [`HRM-SC-05.md`](../HRM-SC-05.md) |
| 327 | `HRM-SC-06` | Từ chối lô mở rộng danh mục | 20 | `LIKELY_IMPL` | 6/4/0 | [`HRM-SC-06.md`](../HRM-SC-06.md) |
| 328 | `HRM-SC-07` | Khởi tạo mẫu import nhân sự tập đoàn | 15 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-SC-07.md`](../HRM-SC-07.md) |
| 329 | `HRM-SC-08` | Khởi tạo danh mục phòng ban – chức vụ theo công ty | 15 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-SC-08.md`](../HRM-SC-08.md) |
| 330 | `HRM-SC-09` | Khởi tạo danh mục hồ sơ xe du lịch | 15 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-SC-09.md`](../HRM-SC-09.md) |
| 331 | `HRM-IM-01` | Xem trước import nhân sự từ file | 15 | `LIKELY_IMPL` | 4/3/0 | [`HRM-IM-01.md`](../HRM-IM-01.md) |
| 332 | `HRM-IM-02` | Xác nhận import nhân sự | 15 | `LIKELY_IMPL` | 4/3/0 | [`HRM-IM-02.md`](../HRM-IM-02.md) |
| 333 | `HRM-IM-03` | Export danh sách nhân sự | 12 | `LIKELY_IMPL` | 4/3/0 | [`HRM-IM-03.md`](../HRM-IM-03.md) |
| 334 | `HRM-IM-04` | Tải file mẫu import | 12 | `LIKELY_IMPL` | 4/3/0 | [`HRM-IM-04.md`](../HRM-IM-04.md) |
| 335 | `HRM-OP-01` | Tạo công việc vận hành | 15 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-OP-01.md`](../HRM-OP-01.md) |
| 336 | `HRM-OP-02` | Xem danh sách công việc | 12 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-OP-02.md`](../HRM-OP-02.md) |
| 337 | `HRM-OP-03` | Cập nhật trạng thái công việc | 15 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-OP-03.md`](../HRM-OP-03.md) |
| 338 | `HRM-OP-04` | Báo cáo tổng hợp công việc | 13 | `LIKELY_PARTIAL` | 5/2/0 | [`HRM-OP-04.md`](../HRM-OP-04.md) |
| 339 | `HRM-PF-01` | Tạo chu kỳ đánh giá hiệu suất | 15 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-PF-01.md`](../HRM-PF-01.md) |
| 340 | `HRM-PF-02` | Xem danh sách chu kỳ đánh giá | 12 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-PF-02.md`](../HRM-PF-02.md) |
| 341 | `HRM-PF-03` | Tạo phiếu đánh giá | 15 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-PF-03.md`](../HRM-PF-03.md) |
| 342 | `HRM-PF-04` | Xem danh sách phiếu đánh giá | 12 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-PF-04.md`](../HRM-PF-04.md) |
| 343 | `HRM-FL-01` | Xem danh sách hồ sơ xe (fleet) | 12 | `LIKELY_PARTIAL` | 4/3/0 | [`HRM-FL-01.md`](../HRM-FL-01.md) |
| 344 | `UC-HRM-20` | Embed — Tổng quan HRM | 15 | `LIKELY_PARTIAL` | 5/3/0 | [`UC-HRM-20.md`](../UC-HRM-20.md) |
| 345 | `UC-HRM-21` | Embed — Danh sách nhân sự | 15 | `LIKELY_IMPL` | 5/3/0 | [`UC-HRM-21.md`](../UC-HRM-21.md) |
| 346 | `UC-HRM-22` | Embed — Tuyển dụng | 15 | `LIKELY_IMPL` | 5/3/0 | [`UC-HRM-22.md`](../UC-HRM-22.md) |
| 347 | `UC-HRM-23` | Embed — Chấm công | 16 | `LIKELY_IMPL` | 5/4/0 | [`UC-HRM-23.md`](../UC-HRM-23.md) |
| 348 | `UC-HRM-24` | Embed — Lương | 15 | `LIKELY_IMPL` | 5/3/0 | [`UC-HRM-24.md`](../UC-HRM-24.md) |
| 349 | `UC-HRM-25` | Embed — Hợp đồng và bảo hiểm xã hội | 15 | `LIKELY_IMPL` | 5/3/0 | [`UC-HRM-25.md`](../UC-HRM-25.md) |
| 350 | `UC-HRM-26` | Embed — Hàng chờ duyệt metadata | 15 | `LIKELY_PARTIAL` | 5/3/0 | [`UC-HRM-26.md`](../UC-HRM-26.md) |
| 351 | `UC-HRM-27` | Embed — Quyết định và báo cáo (backlog) | 16 | `GAP` | 5/3/1 | [`UC-HRM-27.md`](../UC-HRM-27.md) |
| 352 | `UC-HRM-MOB-01` | Đăng nhập và thiết lập phiên an toàn | 12 | `LIKELY_IMPL` | 3/4/0 | [`UC-HRM-MOB-01.md`](../UC-HRM-MOB-01.md) |
| 353 | `UC-HRM-MOB-02` | Chọn và xác nhận phạm vi công ty | 12 | `LIKELY_IMPL` | 3/2/0 | [`UC-HRM-MOB-02.md`](../UC-HRM-MOB-02.md) |
| 354 | `UC-HRM-MOB-03` | Xem bảng điều khiển cá nhân | 12 | `LIKELY_PARTIAL` | 5/2/0 | [`UC-HRM-MOB-03.md`](../UC-HRM-MOB-03.md) |
| 355 | `UC-HRM-MOB-04` | Ghi nhận chấm công / điểm danh | 14 | `LIKELY_IMPL` | 4/4/0 | [`UC-HRM-MOB-04.md`](../UC-HRM-MOB-04.md) |
| 356 | `UC-HRM-MOB-05` | Xem lịch sử chấm công | 12 | `LIKELY_PARTIAL` | 4/2/0 | [`UC-HRM-MOB-05.md`](../UC-HRM-MOB-05.md) |
| 357 | `UC-HRM-MOB-06` | Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép | 26 | `LIKELY_IMPL` | 6/10/2 | [`UC-HRM-MOB-06.md`](../UC-HRM-MOB-06.md) |
| 358 | `UC-HRM-MOB-07` | Xem danh sách đơn và trạng thái | 12 | `LIKELY_PARTIAL` | 5/2/0 | [`UC-HRM-MOB-07.md`](../UC-HRM-MOB-07.md) |
| 359 | `UC-HRM-MOB-08` | Phê duyệt hoặc từ chối đơn chờ | 18 | `LIKELY_IMPL` | 6/3/2 | [`UC-HRM-MOB-08.md`](../UC-HRM-MOB-08.md) |
| 360 | `UC-HRM-MOB-09` | Xem tóm tắt lương theo kỳ | 14 | `LIKELY_PARTIAL` | 5/3/0 | [`UC-HRM-MOB-09.md`](../UC-HRM-MOB-09.md) |
| 361 | `UC-HRM-MOB-10` | Xem hợp đồng và bảo hiểm | 12 | `LIKELY_PARTIAL` | 4/2/0 | [`UC-HRM-MOB-10.md`](../UC-HRM-MOB-10.md) |
| 362 | `UC-HRM-MOB-11` | Quản lý công việc và yêu cầu dịch vụ | 14 | `LIKELY_PARTIAL` | 5/3/0 | [`UC-HRM-MOB-11.md`](../UC-HRM-MOB-11.md) |
| 363 | `UC-HRM-MOB-12` | Xem và cập nhật hồ sơ cá nhân | 12 | `LIKELY_PARTIAL` | 4/3/0 | [`UC-HRM-MOB-12.md`](../UC-HRM-MOB-12.md) |
| 364 | `UC-HRM-MOB-13` | Nhận thông báo (in-app / realtime / push) | 12 | `LIKELY_PARTIAL` | 4/3/1 | [`UC-HRM-MOB-13.md`](../UC-HRM-MOB-13.md) |
| 365 | `UC-HRM-MOB-14` | Làm việc ngoại tuyến có kiểm soát | 12 | `GAP` | 3/3/1 | [`UC-HRM-MOB-14.md`](../UC-HRM-MOB-14.md) |
| 366 | `UC-HRM-MOB-15` | Đăng xuất và thu hồi phiên | 12 | `LIKELY_PARTIAL` | 4/3/1 | [`UC-HRM-MOB-15.md`](../UC-HRM-MOB-15.md) |

---

## 3. Notes (honest)

- Exemplar Leave/ATT professional + `docs/qa/testcases/hrm-mobile/*` dùng **neo** — không đè nội dung pack menu.
- `UC-HRM-MOB-06` / `UC-HRM-MOB-08`: case type **SG** = inventory L2 ladder — **không** PASS.
- Matrix Phase1 `e2e_pass` **không** suy ra `uat_done: true`.
- Generator: `_gen_w1_s6.mjs` (có thể xóa sau synth nếu PM muốn).

---

## 4. Handoff

```
ack_status: READY_FOR_SYNTH
work_item_id: PO-UC-TC-W1-S6-HRM-B-MOB
from_role: qa
to_role: pm
next_owner: pm
cases_designed_sum: 963
uc_files: 66
uat_done: false
evidence_path: docs/qa/professional/by-uc/_squad/W1-S6-HRM-B-MOB_MANIFEST.md
next_dispatch_prompt: PO-UC-TC-W2-SYNTH-01 — Synth sau khi S1–S6 READY_FOR_SYNTH; dedupe TC-ID; cập nhật MASTER_COVERAGE_REPORT.md; uat_done vẫn false.
```
