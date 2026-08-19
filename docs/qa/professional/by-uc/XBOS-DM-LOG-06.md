# UC — `XBOS-DM-LOG-06` · Sắp xếp phân cấp cha–con

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-06` |
| **stt_phase1** | 103 |
| **mod** | M03 |
| **name_vi** | Sắp xếp phân cấp cha–con |
| **actors** | Catalog Admin |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `UNKNOWN` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03 không map endpoint riêng LOG-06 (chỉ CRUD publish). Hierarchy/parentId có thể nằm trong items JSON — **UNKNOWN** FE kéo-thả; rủi ro GAP nếu chỉ flat list. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Gán/sắp parent–child và thứ tự hiển thị cây danh mục Logistic (kéo-thả hoặc gán parent); cấu trúc lưu và F5 còn.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Thiết lập phân cấp | Cây cha–con đúng nghiệp vụ 3 tầng | Catalog Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-TREE-ASSIGN | Gán parent cho giá trị | Tree / gán cha | Y |
| CAP-01 | FN-TREE-SORT | Đổi thứ tự anh–em | sortOrder / kéo ngang cấp | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-TREE-ASSIGN | 1 | 2 | 1 | 1 | 1 | 6 |
| FN-TREE-SORT | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 3 | 1 | 1 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-06-TREE-ASSIGN-HP-001 | CAP-01 | FN-TREE-ASSIGN | HP | P0 | ceo@xe.vn | ≥2 cấp giá trị | 1. Gán con vào cha 2. Lưu | Cây đúng; F5 còn quan hệ | UI/API | LOG-06 · liên quan LOG-20/21 |
| TC-DM-LOG-06-TREE-ASSIGN-FD-002 | CAP-01 | FN-TREE-ASSIGN | FD | P0 | ceo@xe.vn | Có cây | 1. Tạo vòng (A→B→A) hoặc gán cha = chính nó | 4xx BR cycle; không lưu | API | FD cycle |
| TC-DM-LOG-06-TREE-ASSIGN-BD-003 | CAP-01 | FN-TREE-ASSIGN | BD | P1 | ceo@xe.vn | Cây sâu | 1. Vượt max depth (vd >3 với LOG-20) | Chặn hoặc cảnh báo theo BR 3 tầng | UI/API | LOG-20 BR |
| TC-DM-LOG-06-TREE-ASSIGN-AU-004 | CAP-01 | FN-TREE-ASSIGN | AU | P0 | member | Sai scope | 1. Đổi cây holding | 403/409 | API | AU |
| TC-DM-LOG-06-TREE-ASSIGN-UX-005 | CAP-01 | FN-TREE-ASSIGN | UX | P1 | ceo@xe.vn | DnD | 1. Kéo thả sai vùng | Snap-back / toast; không mất node | UI | UX |
| TC-DM-LOG-06-TREE-ASSIGN-FD-006 | CAP-01 | FN-TREE-ASSIGN | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-06-TREE-SORT-HP-001 | CAP-01 | FN-TREE-SORT | HP | P1 | ceo@xe.vn | ≥2 sibling | 1. Đổi thứ tự 2. Lưu | Thứ tự mới sau F5 | UI/API | LOG-06 |
| TC-DM-LOG-06-TREE-SORT-FD-002 | CAP-01 | FN-TREE-SORT | FD | P2 | ceo@xe.vn | sortOrder âm / trùng | 1. API sort bất hợp lệ | 4xx hoặc normalize documented | API | FD |

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
| BE API/DTO | parentId/sortOrder trong items — chưa xác nhận schema LOG | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Tree DnD — UNKNOWN | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group write | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `UNKNOWN`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-06
cases_designed: 8
code_readiness: UNKNOWN
squad: W1-S4-DM-LOG
uat_done: false
```
