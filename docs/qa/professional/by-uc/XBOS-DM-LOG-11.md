# UC — `XBOS-DM-LOG-11` · Nhập danh mục từ file mẫu

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-11` |
| **stt_phase1** | 108 |
| **mod** | M03 |
| **name_vi** | Nhập danh mục từ file mẫu |
| **actors** | Catalog Admin |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Import path OpenAPI delta. U65: import qua UI, không SQL. Risk: template LOG chưa có — SPEC_GAP template. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Import giá trị từ file mẫu (template) vào nhóm DM; validate hàng lỗi; commit khi hợp lệ.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Nhập từ file mẫu | Bulk load an toàn | Catalog Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-IMPORT | Upload & commit import | Nhập file → xem trước → Xác nhận | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-IMPORT | 1 | 2 | 2 | 2 | 1 | 8 |
| **Tổng** | 1 | 2 | 2 | 2 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-11-IMPORT-HP-001 | CAP-01 | FN-IMPORT | HP | P0 | ceo@xe.vn | File mẫu hợp lệ | 1. Tải mẫu (nếu có) 2. Upload 3. Preview OK 4. Xác nhận | 2xx; values xuất hiện; F5 còn | UI/API | LOG-11 |
| TC-DM-LOG-11-IMPORT-FD-002 | CAP-01 | FN-IMPORT | FD | P0 | ceo@xe.vn | File sai cột / trùng code | 1. Upload invalid | Row errors; không commit partial trừ BR rõ | UI/API | FD validate |
| TC-DM-LOG-11-IMPORT-BD-003 | CAP-01 | FN-IMPORT | BD | P1 | ceo@xe.vn | File lớn / encoding | 1. UTF-8 BOM · max rows | Giới hạn rõ; không 500 | API | BD |
| TC-DM-LOG-11-IMPORT-AU-004 | CAP-01 | FN-IMPORT | AU | P0 | member | Sai scope | 1. Import holding | 403/409 | API | AU |
| TC-DM-LOG-11-IMPORT-UX-005 | CAP-01 | FN-IMPORT | UX | P1 | ceo@xe.vn | Preview | 1. Hủy sau preview | Không ghi DB | UI | UX cancel |
| TC-DM-LOG-11-IMPORT-FD-006 | CAP-01 | FN-IMPORT | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-11-IMPORT-BD-007 | CAP-01 | FN-IMPORT | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-11-IMPORT-AU-008 | CAP-01 | FN-IMPORT | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | Y (mutate FNs) | Sensitive/hierarchy nhánh có thể SPEC_GAP |
| Auth/scope nếu đa CT | Y | Y (AU cases) | |
| SPEC_GAP ghi rõ | Y | TechSpec mỏng M03 pattern; SRS_VN N/A-DELTA | logistics TechSpec sâu / FE HDSD LOG |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | import endpoint + row errors | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Upload + preview | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group write | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-11
cases_designed: 8
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
