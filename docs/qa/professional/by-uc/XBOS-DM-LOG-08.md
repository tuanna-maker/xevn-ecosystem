# UC — `XBOS-DM-LOG-08` · Gán danh mục theo công ty thành viên

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-08` |
| **stt_phase1** | 105 |
| **mod** | M03 |
| **name_vi** | Gán danh mục theo công ty thành viên |
| **actors** | Group CEO · Catalog Admin |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `UNKNOWN` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03: «Bootstrap script per company slug» — thiên seed/DevOps, không FE mutate chuẩn. DESIGN cases vẫn mô tả FE mong muốn; **code_readiness UNKNOWN/GAP** cho UI; U65 cấm seed trong evidence UAT sau này. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Chỉ định bộ/phiên bản danh mục áp dụng cho từng công ty thành viên (slug/UUID) trong tập đoàn.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Gán DM theo công ty | Member thấy đúng bộ catalog | Group CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-CO-ASSIGN | Áp dụng catalog cho CT thành viên | Chọn CT → Áp dụng | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CO-ASSIGN | 1 | 2 | 1 | 2 | 2 | 8 |
| **Tổng** | 1 | 2 | 1 | 2 | 2 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-08-CO-ASSIGN-HP-001 | CAP-01 | FN-CO-ASSIGN | HP | P0 | ceo@xe.vn | Có CT thành viên + catalog published | 1. Chọn CT 2. Chọn bộ DM 3. Áp dụng | 2xx; CT nhận version; F5 member scope thấy | UI/API | LOG-08 · config-sync apply members |
| TC-DM-LOG-08-CO-ASSIGN-FD-002 | CAP-01 | FN-CO-ASSIGN | FD | P0 | ceo@xe.vn | CT không tồn tại / sai slug | 1. Apply companyId giả | 4xx; không ghi partial | API | FD |
| TC-DM-LOG-08-CO-ASSIGN-AU-003 | CAP-01 | FN-CO-ASSIGN | AU | P0 | du-lich.ceo@xe.vn | Member CEO | 1. Apply sang CT khác | 403/409 | API | AU |
| TC-DM-LOG-08-CO-ASSIGN-UX-004 | CAP-01 | FN-CO-ASSIGN | UX | P1 | ceo@xe.vn | Nhiều CT | 1. Xem ma trận CT×catalog version | Bảng rõ version/checksum từng CT | UI | UX |
| TC-DM-LOG-08-CO-ASSIGN-FD-005 | CAP-01 | FN-CO-ASSIGN | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-08-CO-ASSIGN-BD-006 | CAP-01 | FN-CO-ASSIGN | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-08-CO-ASSIGN-AU-007 | CAP-01 | FN-CO-ASSIGN | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-08-CO-ASSIGN-UX-008 | CAP-01 | FN-CO-ASSIGN | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |

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
| BE API/DTO | applyCatalogToMembers / company assignment — config-sync có apply members pattern HRM | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | UI gán theo CT — UNKNOWN | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group only; member không gán CT khác | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `UNKNOWN`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-08
cases_designed: 8
code_readiness: UNKNOWN
squad: W1-S4-DM-LOG
uat_done: false
```
