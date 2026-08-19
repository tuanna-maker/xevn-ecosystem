# UC — `XBOS-DM-LOG-05` · Ngừng hoặc kích hoạt giá trị

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-05` |
| **stt_phase1** | 102 |
| **mod** | M03 |
| **name_vi** | Ngừng hoặc kích hoạt giá trị |
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
| **code_note** | Status flag trên item trong publish payload — pattern M01. Soft-disable expected; hard-delete cấm platform catalog. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Chuyển trạng thái giá trị active↔inactive; giá trị ngừng không chọn được trên form vận hành mới nhưng giữ lịch sử tham chiếu.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Đổi trạng thái giá trị | Ngừng dùng / mở lại | Catalog Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-VAL-TOGGLE | Ngừng hoặc kích hoạt | Toggle / menu trạng thái | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-VAL-TOGGLE | 2 | 2 | 1 | 2 | 1 | 8 |
| **Tổng** | 2 | 2 | 1 | 2 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-05-VAL-TOGGLE-HP-001 | CAP-01 | FN-VAL-TOGGLE | HP | P0 | ceo@xe.vn | Giá trị active | 1. Ngừng 2. Xác nhận 3. F5 | status inactive; không còn picker active; bản ghi còn trên admin | UI/API | LOG-05 |
| TC-DM-LOG-05-VAL-TOGGLE-HP-002 | CAP-01 | FN-VAL-TOGGLE | HP | P0 | ceo@xe.vn | Giá trị inactive | 1. Kích hoạt lại | active; picker thấy lại sau publish nếu cần | UI/API | LOG-05 |
| TC-DM-LOG-05-VAL-TOGGLE-FD-003 | CAP-01 | FN-VAL-TOGGLE | FD | P1 | ceo@xe.vn | Giá trị bắt buộc hệ thống / platform-locked | 1. Ngừng giá trị nền tảng | 4xx / khóa UI — không soft-delete platform row | UI/API | platform catalog guard |
| TC-DM-LOG-05-VAL-TOGGLE-AU-004 | CAP-01 | FN-VAL-TOGGLE | AU | P0 | member | Sai scope | 1. Toggle ngoài scope | 403/409 | API | AU |
| TC-DM-LOG-05-VAL-TOGGLE-UX-005 | CAP-01 | FN-VAL-TOGGLE | UX | P1 | ceo@xe.vn | Sau ngừng | 1. Filter «Đang dùng» vs «Ngừng» | Badge trạng thái rõ; không chỉ màu | UI | a11y status |
| TC-DM-LOG-05-VAL-TOGGLE-FD-006 | CAP-01 | FN-VAL-TOGGLE | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-05-VAL-TOGGLE-BD-007 | CAP-01 | FN-VAL-TOGGLE | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-05-VAL-TOGGLE-AU-008 | CAP-01 | FN-VAL-TOGGLE | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |

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
| BE API/DTO | item.status active/inactive | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Toggle Ngừng/Kích hoạt | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group write | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-05
cases_designed: 8
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
