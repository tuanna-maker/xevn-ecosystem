# UC — `XBOS-DM-LOG-07` · Gán danh mục cho phân hệ Logistic

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-07` |
| **stt_phase1** | 104 |
| **mod** | M03 |
| **name_vi** | Gán danh mục cho phân hệ Logistic |
| **actors** | Catalog Admin · Group CEO |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03: metadata assignmentTargets seed JSON. Runtime UI gán phân hệ có thể chỉ seed — PARTIAL/UNKNOWN FE. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Gắn nhóm danh mục vào phân hệ Logistic (`assignmentTargets: [logistic]`) để spoke/form LOG nhìn thấy đúng bộ DM.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Gán phân hệ | Catalog visible cho Logistic | Catalog Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-ASSIGN-MOD | Gán/gỡ assignment Logistic | Metadata · checkbox phân hệ | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-ASSIGN-MOD | 1 | 2 | 1 | 2 | 2 | 8 |
| **Tổng** | 1 | 2 | 1 | 2 | 2 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-07-ASSIGN-MOD-HP-001 | CAP-01 | FN-ASSIGN-MOD | HP | P0 | ceo@xe.vn | Nhóm chưa gán logistic | 1. Gán Logistic 2. Lưu 3. Mở tổng quan LOG-01 | Nhóm xuất hiện filter Logistic; F5 còn | UI/API | LOG-07 · TECHSPEC_M03 |
| TC-DM-LOG-07-ASSIGN-MOD-FD-002 | CAP-01 | FN-ASSIGN-MOD | FD | P1 | ceo@xe.vn | Nhóm đang dùng | 1. Gỡ assignment khi còn consumer | Cảnh báo / chặn nếu BR; không orphan im lặng | UI/API | FD |
| TC-DM-LOG-07-ASSIGN-MOD-AU-003 | CAP-01 | FN-ASSIGN-MOD | AU | P0 | member | Member | 1. Đổi assignment tập đoàn | 403/409 | API | AU |
| TC-DM-LOG-07-ASSIGN-MOD-UX-004 | CAP-01 | FN-ASSIGN-MOD | UX | P1 | ceo@xe.vn | Đa phân hệ | 1. Gán đồng thời HRM+Logistic nếu UI cho | Targets phản ánh đủ; filter từng phân hệ đúng | UI | UX |
| TC-DM-LOG-07-ASSIGN-MOD-FD-005 | CAP-01 | FN-ASSIGN-MOD | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-07-ASSIGN-MOD-BD-006 | CAP-01 | FN-ASSIGN-MOD | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-07-ASSIGN-MOD-AU-007 | CAP-01 | FN-ASSIGN-MOD | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-07-ASSIGN-MOD-UX-008 | CAP-01 | FN-ASSIGN-MOD | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |

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
| BE API/DTO | catalog metadata assignmentTargets | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | UI gán phân hệ — spot UNKNOWN | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group admin | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-07
cases_designed: 8
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
