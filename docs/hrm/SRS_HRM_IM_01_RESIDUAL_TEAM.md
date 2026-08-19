# SRS team delta — FR-HRM-IM-01 residual lock (G-IM-*)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-U71-IM-RESIDUAL-01` |
| **change_mode** | ADD · preserve_default |
| **lane** | governance · team-only (không gửi khách) |
| **ref_srs_khách** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.32 FR-HRM-IM-01 · UC HRM-IM-01 · Diễn biến #1–#8 |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` |
| **ref_db** | `docs/hrm/DB_DESIGN_HRM_IMPORT_PREVIEW.md` (N/A table) |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` §16.2 row 32 · §17.1 import preview |
| **Date** | 2026-07-27 |

> **must_keep:** Khách §3.32 narrative không wipe. Non-persist IM-01. U65 zero-seed.  
> **Cấm:** invent staging / `import_preview_*` table · claim IM-02/IM-03 DONE · prompt-echo agent meta vào SRS khách.

---

## 1. Decisions (close soft residuals)

### G-IM-01 — Commit / export leftover = separate FR

| Item | Lock |
|------|------|
| **FR-HRM-IM-01 DONE** | Chỉ `POST …/spreadsheet/import/preview` → `SHEET-200` + supporting limits/template |
| **OUT of IM-01 DONE** | `POST …/import/commit` → **HRM-IM-02** (`SHEET-201`) · `POST …/export` → **HRM-IM-03** |
| **Supporting (không claim FR riêng DONE)** | `GET …/templates/:kind` ≈ catalog **HRM-IM-04** (đã có trong API_DESIGN §C) |
| **Khách** | §3.32 đã mở khóa «Xác nhận import (HRM-IM-02)» — FR khách IM-02 depth = leftover riêng; **không** chặn PASS preview |

**BR-IM-01-SCOPE-01:** Nghiệm thu FR-HRM-IM-01 **không** yêu cầu commit hoặc export thành công.

**AC-IM-01-SCOPE-01:** PASS khi preview `SHEET-200` + zero `employees` INSERT từ path preview (F5 không sinh hồ sơ mới từ preview alone).  
**AC-IM-01-SCOPE-02:** FAIL nếu QA/Dev yêu cầu staging table hoặc commit để «đóng» IM-01.

---

### G-IM-SESSION-01 — «Mã phiên xem trước» = non-goal IM-01

| Khách «Kết quả trả về» | Team interpretation (IM-01) |
|------------------------|-----------------------------|
| Bảng xem trước | Map → response `previewRows[]` · `errors[]` · `rowCount` · `truncated` |
| Bản nháp / phiên | **Ephemeral HTTP payload** — không bản ghi DB |
| Mã phiên xem trước | **Non-goal** — **không** field `sessionId` / `previewToken` trong `SHEET-200` |
| Khóa mang sang IM-02 | Client-held: cùng `kind=employee_import` + scope headers (`x-company-id`) + tệp (hoặc dữ liệu đã preview) gửi lại commit — **không** durable session |

**BR-IM-01-SESSION-01:** FR-HRM-IM-01 non-persist **không** cấp mã phiên bền; cấm invent bảng phiên để khớp câu «mã phiên».

**AC-IM-01-SESSION-01:** PASS khi `SHEET-200` **không** có `sessionId`/`previewToken` và FE vẫn hiện bảng xem trước từ payload.  
**AC-IM-01-SESSION-02:** PASS khi sau preview, F5 **không** khôi phục phiên từ server (expected — state client/ephemeral).  
**AC-IM-01-SESSION-03:** FAIL nếu Dev thêm DDL staging/session để «đóng» residual này mà không có FR persist mới + Sponsor confirm.

---

### G-IM-CATALOG-01 — Độ sâu validate catalog / trùng mã

| Kiểm tra | In-scope IM-01 (in-memory) | Out-of-scope IM-01 |
|----------|----------------------------|--------------------|
| MIME / mẫu / rỗng / limits | ✅ `SHEET-400` / `413` / `408` | — |
| Thiếu `employee_code` / `email` / `full_name` · email/format/`hired_at` | ✅ row `errors[]` code `SHEET-422` | — |
| Trùng mã **trong tệp** (cùng upload) | ✅ **optional** in-memory nếu runtime đã/ sẽ emit `errors[]` — không cần DB | — |
| Trùng mã vs **`employees` DB** | — | ✅ **IM-02 commit** (hoặc WI riêng sau) |
| Thiếu danh mục nền (phòng ban / chức danh) hard-block / SYS→DB | — | ✅ **OUT** preview MVP — user dùng mở khóa «đồng bộ danh mục» (khách success row); không hard-fail preview |
| Staging snapshot catalog | — | ❌ **Cấm invent** |

**BR-IM-01-VAL-01:** Preview chỉ bắt buộc validate **in-memory** (parse + field rules trên buffer).  
**BR-IM-01-VAL-02:** Diễn biến khách #4 (thiếu danh mục) và phần «trùng mã DB» của #5 **không** là điều kiện FAIL của FR-HRM-IM-01 MVP.  
**BR-IM-02-VAL-01:** Commit (HRM-IM-02) mới được phép hard-fail trùng `employee_code` / catalog bắt buộc khi ghi `employees`.

**AC-IM-01-VAL-01:** PASS — thiếu họ tên/mã/email → `SHEET-200` kèm `errors[]` (không 422 cả request trừ khi product đổi contract — hiện row-level).  
**AC-IM-01-VAL-02:** PASS — preview **không** query DB để hard-block thiếu danh mục; không INSERT staging.  
**AC-IM-01-VAL-03:** PASS — preview **không** bắt buộc báo trùng mã đã có trên `employees`; trùng DB = AC của **IM-02**.  
**AC-IM-01-VAL-04:** FAIL (process) — dùng seed/DB fake hoặc invent `import_preview_*` để giả «catalog check».

---

## 2. BR summary

| BR | Condition | Action | Outcome |
|----|-----------|--------|---------|
| BR-IM-01-SCOPE-01 | Wave = FR-HRM-IM-01 | Chỉ nghiệm thu preview | Commit/export OUT |
| BR-IM-01-NONPERSIST | Preview path | Zero INSERT/UPDATE employees | Khớp TechSpec §17.1 |
| BR-IM-01-SESSION-01 | Success payload | Không cấp session id bền | FE dùng response ephemeral |
| BR-IM-01-VAL-01 | Row validate | In-memory field rules | `errors[]` / previewRows |
| BR-IM-01-VAL-02 | Catalog / DB dup | Không hard-fail trên IM-01 | Deferred IM-02 / catalog-sync UX |
| BR-IM-02-VAL-01 | Commit path | Persist + business hard checks | `SHEET-201` / fail commit |

---

## 3. QA evidence expectations (U65)

| Check | Evidence |
|-------|----------|
| Login → Import → upload → preview table | Browser path |
| Network `POST …/import/preview` → **200** `SHEET-200` | DevTools |
| FE sau 2xx: bảng + lý do lỗi | Screenshot / note |
| F5: không hồ sơ mới từ preview | List employees unchanged |
| **Không** seed · **không** staging table | Process |

**J-*:** nếu matrix có journey Import — cite trong QA pack; load-only ≠ DONE mutate preview.

---

## 4. Residual status after this wave

| ID | Prior | After BA-U71-IM-RESIDUAL-01 |
|----|-------|-------------------------------|
| **G-IM-01** | Info open | **CLOSED** — scope lock AC-IM-01-SCOPE-* |
| **G-IM-SESSION-01** | Info open | **CLOSED** — non-goal session; AC-IM-01-SESSION-* |
| **G-IM-CATALOG-01** | P2 open | **CLOSED (spec)** — in-memory vs OUT documented; runtime deepen catalog/dup = **optional future WI** under IM-02, not IM-01 blocker |
| **G-IM-OPENAPI-01** | P2 | **Execution** — `BE-HRM-OA-IMPORT-FLEET-01` (ngoài BA) |

---

## 5. Pointer for khách remaster (optional later)

Khi remaster SRS khách §3.32: chỉnh bảng «Kết quả trả về» — bỏ «mã phiên» / «bản nháp DB»; giữ bảng xem trước + chờ xác nhận. **Không** làm trong WI này (tránh prompt-echo / wipe khách).
