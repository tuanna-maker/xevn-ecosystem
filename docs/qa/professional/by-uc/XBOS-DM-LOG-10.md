# UC — `XBOS-DM-LOG-10` · Xuất danh mục ra file

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-10` |
| **stt_phase1** | 107 |
| **mod** | M03 |
| **name_vi** | Xuất danh mục ra file |
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
| **code_note** | TECHSPEC_M03 + OpenAPI delta: export paths config-sync. Cần xác nhận FE nút Xuất trên catalog LOG. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Xuất nhóm/bộ DM Logistic ra file (CSV/JSON) để lưu trữ hoặc chuyển môi trường.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Xuất file | Portable snapshot | Catalog Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-EXPORT | Xuất CSV/JSON danh mục | Xuất → tải file | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-EXPORT | 1 | 2 | 1 | 2 | 2 | 8 |
| **Tổng** | 1 | 2 | 1 | 2 | 2 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-10-EXPORT-HP-001 | CAP-01 | FN-EXPORT | HP | P0 | ceo@xe.vn | Có nhóm + values | 1. Chọn nhóm/bộ 2. Xuất | 2xx; file tải; nội dung khớp list (code/label/status) | UI/API | LOG-10 · OpenAPI export |
| TC-DM-LOG-10-EXPORT-FD-002 | CAP-01 | FN-EXPORT | FD | P1 | ceo@xe.vn | Key không tồn tại | 1. Export key giả | 4xx | API | FD |
| TC-DM-LOG-10-EXPORT-AU-003 | CAP-01 | FN-EXPORT | AU | P0 | member | Ngoài scope | 1. Export holding full | 403/409 hoặc chỉ CT mình | API | AU |
| TC-DM-LOG-10-EXPORT-UX-004 | CAP-01 | FN-EXPORT | UX | P2 | ceo@xe.vn | Empty catalog | 1. Xuất nhóm trống | File header-only hoặc thông báo empty — không crash | UI | UX |
| TC-DM-LOG-10-EXPORT-FD-005 | CAP-01 | FN-EXPORT | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-10-EXPORT-BD-006 | CAP-01 | FN-EXPORT | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-10-EXPORT-AU-007 | CAP-01 | FN-EXPORT | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-10-EXPORT-UX-008 | CAP-01 | FN-EXPORT | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |

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
| BE API/DTO | GET/POST export catalog | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Nút Xuất file | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Admin + scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-10
cases_designed: 8
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
