# UC — `XBOS-DM-LOG-21` · Khai báo đủ 3 tầng loại phương tiện

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-21` |
| **stt_phase1** | 118 |
| **mod** | M03 |
| **name_vi** | Khai báo đủ 3 tầng loại phương tiện |
| **actors** | Catalog Admin · Data steward |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `UNKNOWN` — **không** = UAT PASS |
| **code_note** | Cùng seed bundle TECHSPEC_M03 LOG-21. FE riêng UNKNOWN; mirror cases LOG-20 với domain vehicle. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Tương tự LOG-20 cho master loại phương tiện (3 tầng) phục vụ gán xe/định mức.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Khai báo 3 tầng loại PT | Master phương tiện đủ phân loại | Data steward |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-VEH-3T | Tạo/đủ cây 3 tầng loại phương tiện | Tree loại xe | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-VEH-3T | 1 | 3 | 1 | 2 | 1 | 8 |
| **Tổng** | 1 | 3 | 1 | 2 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-21-VEH-3T-HP-001 | CAP-01 | FN-VEH-3T | HP | P0 | ceo@xe.vn | Catalog vehicle LOG | 1. Đủ 3 tầng 2. Publish 3. Precheck LOG-19 | PASS cardinality vehicle; F5 cây đúng | UI/API | LOG-21 |
| TC-DM-LOG-21-VEH-3T-FD-002 | CAP-01 | FN-VEH-3T | FD | P0 | admin | Thiếu leaf | 1. Precheck | FAIL liệt kê node thiếu | CLI/API | FD |
| TC-DM-LOG-21-VEH-3T-FD-003 | CAP-01 | FN-VEH-3T | FD | P1 | admin | Orphan child | 1. Child không parent | Validate chặn publish | API | FD orphan |
| TC-DM-LOG-21-VEH-3T-AU-004 | CAP-01 | FN-VEH-3T | AU | P0 | member | Sai scope | 1. Mutate hub tree | 403/409 | API | AU |
| TC-DM-LOG-21-VEH-3T-UX-005 | CAP-01 | FN-VEH-3T | UX | P1 | admin | Sau sửa | 1. Expand/collapse cây | Performance OK; không mất state sai | UI | UX |
| TC-DM-LOG-21-VEH-3T-FD-006 | CAP-01 | FN-VEH-3T | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-21-VEH-3T-BD-007 | CAP-01 | FN-VEH-3T | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-21-VEH-3T-AU-008 | CAP-01 | FN-VEH-3T | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |

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
| BE API/DTO | seed cardinality vehicle tiers | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Tree loại PT — UNKNOWN | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group/data steward | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `UNKNOWN`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-21
cases_designed: 8
code_readiness: UNKNOWN
squad: W1-S4-DM-LOG
uat_done: false
```
