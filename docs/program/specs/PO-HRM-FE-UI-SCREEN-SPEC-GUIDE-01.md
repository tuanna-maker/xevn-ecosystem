# Hướng dẫn loại tài liệu cho Dev FE — dựng giao diện đúng SRS (XeVN HRM)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01` |
| **Sponsor** | 2026-08-10 — thiếu lớp giữa TechSpec và code; Cài đặt/JD/catalog lệch mô tả |
| **Owner** | BA-Process + SA (governance) · Dev-FE implement |

---

## 0. Sponsor lock — tham khảo vs SoT (2026-08-10)

| Loại | Vai trò |
|------|---------|
| **SRS · TechSpec · API_DESIGN · DB_DESIGN** | **SoT nghiệp vụ** — Dev/QA bắt buộc |
| **UI_SCREEN_SPEC / PAT-*** (trong repo) | Cụ thể hóa màn — map AC UI → SRS bước Diễn biến |
| **UI_UX_SPEC enterprise + phụ lục Named Field** (Desktop / `docs/reference/`) | **Chỉ tham khảo** cấu trúc tài liệu quốc tế; **cấm** thêm field/luồng/API không có trong SoT |
| **Named Field (MOD-CON phụ lục)** | Bind template/preview — TechSpec + API; UI spec mô tả render theo `field_key`, không generic builder |

Index tham khảo: `docs/reference/README-UI-UX-REFERENCE-SPONSOR.md` · OS: `_vibe-team-os/37-UI-SCREEN-SPEC-SRS-FIRST-AND-REFERENCE.md`

Modal CC embed: **PAT-DIALOG-FULL-VIEWPORT-CC-01** — full viewport trình duyệt, parent portal (không kẹt iframe).

---

## 1. Ba lớp spec hiện có — mỗi lớp trả lời câu gì

| Lớp | Trả lời | **Không** trả lời |
|-----|---------|-------------------|
| **SRS** | *Làm gì, vì sao, ai, AC sau Lưu/F5, luồng nghiệp vụ* | Vị trí nút, kích thước cột, master-detail vs tab |
| **TechSpec** | Kiến trúc, API map bước SRS, DB, component map **thô** | Layout pixel, empty state copy, thứ tự màn list→detail |
| **API_DESIGN** | DTO ↔ cột, mục đích endpoint, bước Diễn biến SRS | Không mô tả shell UI |

**Kết luận:** Dev FE cần thêm một artifact **cụ thể hoá màn hình** — không thay SRS, không trùng TechSpec dài.

---

## 2. Artifact đề xuất: **UI_SCREEN_SPEC** (hoặc **FE_INTERACTION_SPEC**)

**Vị trí pipeline (sponsor lock):**

```text
SRS (confirm) → TechSpec (ref_srs) → DB_DESIGN + API_DESIGN
 → UI_SCREEN_SPEC (per màn hoặc per tab Settings)
 → test plan (TC browser bám HDSD) → Dev-FE → QA
```

**Quy tắc đặt tên file (HRM Web Settings / module):**

- `docs/hrm/ui-screens/UI-<MODULE>-<SCREEN-ID>.md`

**Mobile ESS (toàn app):**

- Khung bàn giao: **`docs/UI_UX_SPEC_XEVN_HRM_MOBILE.md`**
- Chi tiết từng màn (khi tách): `docs/hrm/ui-screens/MOB-*.md`

**Một UI_SCREEN_SPEC bắt buộc có (7 mục):**

| # | Mục | Nội dung |
|---|-----|----------|
| 1 | **Screen ID + route** | `tab=` hoặc path · persona RBAC |
| 2 | **Mục đích (1 đoạn VI)** | Trích SRS Purpose / UC |
| 3 | **IA layout** | Master-detail / list-only / list+dialog / two-pane — **vẽ Mermaid hoặc bảng vùng** |
| 4 | **Thành phần UI** | Header, toolbar (search, filter), bảng cột, pagination, dialog fields — **map field → API field** |
| 5 | **Luồng tương tác** | sequenceDiagram: Mở → Tìm → Thêm → Dialog → Lưu → FE sau 2xx → F5 |
| 6 | **Empty / error / loading** | Copy tiếng Việt · CTA U65 (không seed) |
| 7 | **AC UI (testable)** | Bảng: bước click · Network · FE quan sát · testid gợi ý |

**Tham chiếu chéo bắt buộc:** `ref_srs` (UC + Diễn biến #) · `ref_api_design` (METHOD path) · `ref_pattern` (vd. `SettingsCatalogScreenShell` compact = **PAT-SETTINGS-CATALOG-01**).

---

## 3. PAT-SETTINGS-CATALOG-01 (mẫu Loại phép — đã khóa sponsor)

| Hạng mục | Chuẩn |
|----------|--------|
| Shell | `SettingsCatalogScreenShell` `density="compact"` |
| List | Chỉ bảng + search mã/tên + pagination |
| Mutate | Dialog; Select → `SettingsDialogSelectContent` |
| Density | MUST_KEEP W1.5 — không `xevn-safe-inline` trên root Settings |
| **Không áp dụng** | DnD composer HĐ (PAT-CTR-TEMPLATE-COMPOSER-01 riêng) |

Mọi tab catalog Cài đặt **phải** có UI_SCREEN_SPEC trỏ `ref_pattern: PAT-SETTINGS-CATALOG-01` hoặc ghi **exception** có SA sign-off.

---

## 4. JD — tách đúng hai màn (sponsor 2026-08-10)

| Màn | SRS / UC | IA đề xuất |
|-----|----------|------------|
| **Thư viện JD master** | UC-BP-REC-00 · FR-UC-BP-REC-00 | **List JD theo vị trí/mã** → Sửa mở **detail** (writer layout, pack, group) |
| **Cấu hình JD động (catalog)** | UC-BP-REC-00a–00f · Settings Q1 | Giữ tab **Cấu hình trường/nhóm/pack/rule** — **không** thay thế thư viện JD |

Hiện trạng gap: `JdDynamicSettingsPanel` = catalog CFG only; **thiếu** màn list JD master trong Cài đặt (hoặc deep link từ Tuyển dụng) theo AC list→detail SRS §7–9 `PO-HRM-JD-GROUP-SPEC-01.md`.

**Deliverable BA:** `UI-SETTINGS-JD-MASTER-LIST.md` + cập nhật `settingsNavigation.ts` nếu tách tab «Thư viện JD» vs «Cấu hình trường JD».

---

## 5. Danh mục XBOS + HRM — consumer, không chỉ tab sync

| Vai trò | Màn | Hành vi mong đợi (SRS UF-HRM-10) |
|---------|-----|----------------------------------|
| **Admin sync** | Cài đặt → Danh mục (sync) | Overview + pull XBOS + extension items |
| **Consumer** | Hợp đồng, Hồ sơ NV, form nghiệp vụ | Select/combobox bind `settings-catalogs` — **hiển thị label**, không chỉ dev thấy list ở Settings |

Gap sponsor: tab sync chỉ list — **chưa audit** mọi form HRM có bind catalog đúng key. Wave fidelity: ma trận **catalog_key → màn consumer → AC chọn được giá trị sau sync FE**.

**Deliverable BA-Data:** bảng trong `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` (hoặc delta) cột **UI consumer** + UI_SCREEN_SPEC cho 3 màn consumer P0 (Contracts create, Employee form, Recruitment).

---

## 6. PAT-CTR-TEMPLATE-COMPOSER-01 (sửa gap ảnh screenshot)

| Sai (AS-IS W3) | Đúng (TO-BE) |
|----------------|--------------|
| Dialog «Sửa mẫu HĐ» chỉ text + Đóng; composer Card **bên dưới** list | Toàn bộ form + palette + canvas DnD **nằm trong** Dialog (hoặc full-page detail — **một** surface) |
| User kéo «canvas bên dưới» nhưng canvas không trong dialog | AC: mở Sửa → thấy palette + canvas + Lưu **cùng modal** |

UI_SCREEN_SPEC: `UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md` · work item `PO-HRM-CTR-TPL-DIALOG-COMPOSER-FE-01`.

---

## 7. Ai viết, ai ký

| Role | Việc |
|------|------|
| **BA-Process** | UI_SCREEN_SPEC mục 3–6 (luồng + AC UI) |
| **BA-Data** | Cột field ↔ API ↔ catalog_key |
| **SA** | PAT-* registry · exception IA |
| **Dev-FE** | `spec_read_ack` gồm ui_screen_spec path · không code thiếu file |
| **QA** | TC browser = bảng AC UI (U76 HDSD) |

Template file: `_vibe-team-os/templates/UI_SCREEN_SPEC.md` — PM dispatch BA clone vào `docs/hrm/ui-screens/`. Entry point: `docs/program/PM_PO_DELIVERY_PIPELINE_UIUX.md`.

---

## 8. Phạm vi program (không chỉ Cài đặt)

Sponsor 2026-08-10: cuốn chiếu **mọi UC in-scope chưa DONE** — Settings là wave 1; REC/JD/CTR/catalog consumer là wave 2+. Dispatch: `PO-HRM-SETTINGS-FIDELITY-PROGRAM-WAVE-01.md`.
