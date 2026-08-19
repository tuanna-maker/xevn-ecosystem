# UC — `XBOS-DM-HRM-01` · Xem tổng quan danh mục theo phân hệ Nhân sự

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-HRM-01` |
| **stt_phase1** | 248 |
| **mod** | M02 |
| **name_vi** | Xem tổng quan danh mục theo phân hệ Nhân sự |
| **actors** | Group CEO · HR Admin XBOS |
| **surfaces** | xbos-cc / web-portal |
| **srs_old** | BANG_TONG_HOP_USECASE_HRM.md STT1 · matrix 248 |
| **srs_new** | SRS_VN §4 catalog/HRM (overlap) · N/A-DELTA nếu thiếu FR riêng |
| **tech_spec** | TECHSPEC_HE §7–8 · docs/hrm/TECHSPEC.md catalog |
| **api_contract** | GET /api/xbos/config-sync/catalog/:key · CC catalogs |
| **author** | qa · PO-UC-TC-W1-S5-HRM-A |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | XBOS config-sync + business-master catalog paths tồn tại; overview HRM-specific UI cần FE CC verify. |
| **squad** | W1-S5-HRM-A |
| **uat_done** | false |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE.


---

## 1. Mục tiêu UC (1 đoạn)

Xem tổng quan danh mục theo phân hệ Nhân sự: bảo đảm actor thực hiện đúng luồng HDSD trên surface nêu trên; hệ thống validate BR/DTO, tôn trọng scope đa pháp nhân, và phản hồi FE sau 2xx + F5 quan sát được. Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Truy vấn / liệt kê | Xem tổng quan danh mục theo phân hệ Nhân sự | Group CEO · HR Admin XBOS |
| CAP-02 | Chi tiết / filter / empty | Deep-link & empty trung thực | Group CEO · HR Admin XBOS |
| CAP-03 | Phạm vi đa công ty | Không lộ ngoài scope | RBAC |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-LIST | List / overview | GET /api/xbos/config-sync/catalog/:key | N |
| CAP-02 | FN-DETAIL | Mở chi tiết / by-id | GET by id / row click | N |
| CAP-02 | FN-FILTER | Lọc theo trạng thái/CT/kỳ | query params UI | N |
| CAP-03 | FN-SCOPE | Chặn scope sai | 403/409 / empty đúng | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LIST | 2 | 0 | 0 | 1 | 2 | **5** |
| FN-DETAIL | 1 | 1 | 0 | 1 | 1 | **4** |
| FN-FILTER | 1 | 0 | 1 | 0 | 1 | **3** |
| FN-SCOPE | 0 | 0 | 0 | 2 | 0 | **2** |
| **Tổng (fn plan)** | 4 | 1 | 1 | 4 | 4 | **14** |
| **Tổng (bảng §5)** | | | | | | **14** |

> Σ bàn giao Synth = **số dòng TC §5** (`14`). Fn plan dùng để kiểm coverage; lệch nhỏ do gộp optional được chấp nhận nếu §6 GAP ghi rõ.

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-DM-HRM-01-LIST-HP-001 | CAP-01 | FN-LIST | HP | P0 | ceo@xe.vn | Đã login holding | 1. Vào màn liên quan Xem tổng quan danh mục theo phân hệ Nhân sự 2. Chờ load | List 2xx · không banner ERROR · empty hợp lệ nếu 0 row | UI/API | BANG_TONG_HOP_USECASE_HRM.md STT1 · matrix 248 |
| TC-XBOS-DM-HRM-01-LIST-HP-002 | CAP-01 | FN-LIST | HP | P1 | member CEO | Login member slug | 1. Mở cùng màn scope member | Chỉ data CT mình · 2xx | UI/API | ADR scope ladder |
| TC-XBOS-DM-HRM-01-LIST-UX-001 | CAP-01 | FN-LIST | UX | P0 | HR | Filter ra empty | 1. Filter không khớp | Empty state trung thực · không GET storm | UI | U65 |
| TC-XBOS-DM-HRM-01-LIST-UX-002 | CAP-01 | FN-LIST | UX | P0 | HR | API 500 giả lập | 1. Quan sát banner | Error rõ · có Tải lại thủ công | UI | U63 |
| TC-XBOS-DM-HRM-01-LIST-AU-001 | CAP-01 | FN-LIST | AU | P0 | du-lich.ceo | Member token | 1. Gọi list holding rollup (nếu UI có) | 403/409 hoặc không hiện CT khác | UI/API | scope |
| TC-XBOS-DM-HRM-01-DETAIL-HP-001 | CAP-02 | FN-DETAIL | HP | P0 | HR | Có ≥1 row từ FE | 1. Click row / deep link | Detail 2xx · không 404 khi list có (scope_parity) | UI/API | J-HRM-* |
| TC-XBOS-DM-HRM-01-DETAIL-FD-001 | CAP-02 | FN-DETAIL | FD | P0 | HR | ID ngoài scope | 1. Deep link UUID CT khác | 404/409 deterministic | API | scope_parity |
| TC-XBOS-DM-HRM-01-DETAIL-AU-001 | CAP-02 | FN-DETAIL | AU | P1 | NV thường | Không quyền xem all | 1. Mở list/detail người khác | 403 hoặc mask theo RBAC | UI/API | RBAC |
| TC-XBOS-DM-HRM-01-DETAIL-UX-001 | CAP-02 | FN-DETAIL | UX | P2 | HR | Loading chậm | 1. Open detail | Skeleton/spinner · không trắng | UI | UX |
| TC-XBOS-DM-HRM-01-FILTER-HP-001 | CAP-02 | FN-FILTER | HP | P1 | HR | Có data đa trạng thái | 1. Đổi filter status | Grid khớp filter · F5 giữ hoặc reset theo HDSD | UI | HDSD |
| TC-XBOS-DM-HRM-01-FILTER-BD-001 | CAP-02 | FN-FILTER | BD | P2 | HR | — | 1. Page size biên / ngày biên | Không crash · vi-VN date | UI | UX_VI format |
| TC-XBOS-DM-HRM-01-FILTER-UX-001 | CAP-02 | FN-FILTER | UX | P2 | HR | — | 1. Clear filter | Trả về full list hợp lệ | UI | UX |
| TC-XBOS-DM-HRM-01-SCOPE-AU-001 | CAP-03 | FN-SCOPE | AU | P0 | member | Token member | 1. Đổi x-company-id sang CT khác | 409 SCOPE / mismatch | API | scope |
| TC-XBOS-DM-HRM-01-SCOPE-AU-002 | CAP-03 | FN-SCOPE | AU | P0 | ceo@ | Holding main | 1. List rollup vs member detail | Parity list↔get-by-id | API | scope_parity |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y (mutate) | Xem §4 | Optional FN ghi * |
| Auth/scope nếu đa CT | Y | AU cases | |
| SPEC_GAP ghi rõ | Y | | |
| — | — | — | Không giấu gap |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | LIKELY_PARTIAL — XBOS config-sync + business-master catalog paths tồn tại; overview HRM-specific UI cần FE CC verify. | GET /api/xbos/config-sync/catalog/:key · CC catalogs |
| FE menu/nút/role | Cần map HDSD/menu pack khi execution; design neo SRS cũ | portal / hrm-embed |
| Mobile (nếu có) | N/A wave này trừ khi surfaces ghi mobile | |
| RBAC / scope | AU bắt buộc holding vs member | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-HRM-01
cases_designed: 14
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S5-HRM-A
```
