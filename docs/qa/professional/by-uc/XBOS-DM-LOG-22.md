# UC — `XBOS-DM-LOG-22` · Rà soát sản phẩm dịch vụ chưa gắn bảng giá

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-22` |
| **stt_phase1** | 119 |
| **mod** | M03 |
| **name_vi** | Rà soát sản phẩm dịch vụ chưa gắn bảng giá |
| **actors** | Catalog Admin · Kinh doanh / Pricing ops |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `UNKNOWN` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03: «QA report row in LOG-19 output» — read-only check, phụ thuộc pricing master (có thể P2). **UNKNOWN/GAP** UI riêng; không invent PASS. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Báo cáo read-only các sản phẩm/dịch vụ (tầng leaf) chưa gắn bảng giá — hỗ trợ chặn vận hành/báo giá thiếu giá.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Rà soát dịch vụ chưa có giá | Phát hiện gap pricing trước vận hành | Pricing ops |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-UNPRICED | List sản phẩm chưa gắn bảng giá | Báo cáo / tab Unpriced | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-UNPRICED | 2 | 2 | 1 | 2 | 1 | 8 |
| **Tổng** | 2 | 2 | 1 | 2 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-22-UNPRICED-HP-001 | CAP-01 | FN-UNPRICED | HP | P0 | ceo@xe.vn | Có leaf dịch vụ; một số chưa price list | 1. Mở báo cáo unpriced (hoặc đọc output LOG-19) | Danh sách leaf thiếu giá; count >0 đúng; không mutate | UI/API/CLI | LOG-22 · LOG-19 report |
| TC-DM-LOG-22-UNPRICED-HP-002 | CAP-01 | FN-UNPRICED | HP | P1 | admin | Tất cả đã gắn giá | 1. Chạy báo cáo | Empty PASS / 0 rows | UI/CLI | HP clean |
| TC-DM-LOG-22-UNPRICED-FD-003 | CAP-01 | FN-UNPRICED | FD | P1 | admin | Price module chưa có (P2) | 1. Gọi API báo cáo | 501/SPEC stub rõ hoặc empty+warning — không 500 giả PASS | API | honest GAP |
| TC-DM-LOG-22-UNPRICED-AU-004 | CAP-01 | FN-UNPRICED | AU | P0 | member | Member | 1. Xem unpriced CT khác | 403/409 hoặc chỉ CT mình | API | AU |
| TC-DM-LOG-22-UNPRICED-UX-005 | CAP-01 | FN-UNPRICED | UX | P1 | ops | Có rows | 1. Click leaf → deep link master giá/dịch vụ | Điều hướng đúng hoặc CTA documented; không 404 scope | UI | L2.5 style nav |
| TC-DM-LOG-22-UNPRICED-FD-006 | CAP-01 | FN-UNPRICED | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-22-UNPRICED-BD-007 | CAP-01 | FN-UNPRICED | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-22-UNPRICED-AU-008 | CAP-01 | FN-UNPRICED | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | N/A read-mostly | Sensitive/hierarchy nhánh có thể SPEC_GAP |
| Auth/scope nếu đa CT | Y | Y (AU cases) | |
| SPEC_GAP ghi rõ | Y | TechSpec mỏng M03 pattern; SRS_VN N/A-DELTA | logistics TechSpec sâu / FE HDSD LOG |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Report join service×price — mỏng/P2 | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Màn rà soát unpriced — UNKNOWN | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Admin/KD read | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `UNKNOWN`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-22
cases_designed: 8
code_readiness: UNKNOWN
squad: W1-S4-DM-LOG
uat_done: false
```
