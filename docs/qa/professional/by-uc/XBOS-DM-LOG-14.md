# UC — `XBOS-DM-LOG-14` · Xem lịch sử thay đổi danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-14` |
| **stt_phase1** | 111 |
| **mod** | M03 |
| **name_vi** | Xem lịch sử thay đổi danh mục |
| **actors** | Catalog Admin · Auditor |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03: `platform-audit/events?entityType=catalog`. UI lịch sử trên panel LOG — UNKNOWN depth. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem audit trail thay đổi catalog (ai, khi nào, field trước/sau, version).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Xem lịch sử | Truy vết thay đổi | Auditor |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-HIST-LIST | List sự kiện audit catalog | Lịch sử · filter thời gian | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-HIST-LIST | 1 | 2 | 1 | 2 | 2 | 8 |
| **Tổng** | 1 | 2 | 1 | 2 | 2 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-14-HIST-LIST-HP-001 | CAP-01 | FN-HIST-LIST | HP | P0 | ceo@xe.vn | Đã có mutate LOG-03/04 trước đó (FE) | 1. Mở lịch sử nhóm 2. Xem event mới nhất | 2xx; event actor+timestamp+diff; khớp thao tác | UI/API | LOG-14 · platform-audit |
| TC-DM-LOG-14-HIST-LIST-UX-002 | CAP-01 | FN-HIST-LIST | UX | P1 | ceo@xe.vn | Chưa có event | 1. Mở lịch sử | Empty hợp lệ | UI | UX |
| TC-DM-LOG-14-HIST-LIST-AU-003 | CAP-01 | FN-HIST-LIST | AU | P0 | member | Member | 1. Đọc audit holding | 403/409 hoặc chỉ CT mình | API | AU |
| TC-DM-LOG-14-HIST-LIST-FD-004 | CAP-01 | FN-HIST-LIST | FD | P2 | ceo@xe.vn | entityId sai | 1. Query audit giả | Empty/404 — không 500 | API | FD |
| TC-DM-LOG-14-HIST-LIST-FD-005 | CAP-01 | FN-HIST-LIST | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-14-HIST-LIST-BD-006 | CAP-01 | FN-HIST-LIST | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-14-HIST-LIST-AU-007 | CAP-01 | FN-HIST-LIST | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-14-HIST-LIST-UX-008 | CAP-01 | FN-HIST-LIST | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |

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
| BE API/DTO | platform-audit events | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Tab Lịch sử | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Admin/auditor read | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-14
cases_designed: 8
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
