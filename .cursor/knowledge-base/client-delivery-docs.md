# KB — Client delivery BRD/SRS HTML (XeVN repo)

> **Tri thức toàn Cursor:** `C:\Users\ADMIN\.cursor\knowledge-base\client-delivery-brd-srs.md`  
> **Skill global:** `client-delivery-brd-srs` · **Agent:** `@ba-docs`

## Entry 1 — Không meta agent trong HTML khách

### Context

User từ chối meta ngôn ngữ prompt/agent trong bìa và changelog SRS.

### Action

- `stripClientDeliveryMeta()` trong `doc-markdown-prep.mjs`
- Subtitle SRS: *Yêu cầu phần mềm — Hệ sinh thái đa phân hệ*

### Outcome

HTML không lộ pipeline/audit/Writing Standards.

### Evidence

Phiên 2026-05-21; `02_SRS_XeVN_OS.html`.

### Reuse-tag

`client-delivery`, `no-agent-meta`

---

## Entry 2 — SRS theo mẫu Bateco E-Office (373 FR × 7 mục)

### Context

SRS cũ (~9MB) nhúng 373 UC × 12 mục ISO (REQ-SRS, Kiểm chứng, bảng lỗi…) — khách khó đọc, không giống deliverable Bateco (`E-Office-Bateco/document_HDSD/02_Tai_lieu_nghiep_vu`). User yêu cầu đủ 373 UC nhưng **cùng một bộ mục**, không FR nào thiếu sơ đồ/đầu vào.

### Action

1. **Cấu trúc SRS 6 chương** (thay 8 chương): Giới thiệu → Tổng quan → **Yêu cầu chức năng (373 FR)** → NFR → Giao diện ngoài → Ràng buộc BR.
2. **Generator mới:** `srs-bateco-body.mjs` + `srs-fr-spec.mjs`; `build-srs-xevn-html.mjs` chỉ gọi pipeline này.
3. **Mỗi FR = 1 UC:** tiêu đề `#### FR-{Mã UC} — {tên}`; module MOD-M00…M08 trong Ch.3.
4. **7 mục bắt buộc mọi FR:** metadata (Actor, Ưu tiên, Tiên quyết, Hậu) · Dữ liệu đầu vào · Luồng chính · Quy tắc nghiệp vụ · Trường hợp đặc biệt · Sơ đồ tương tác · Diễn biến (7 dòng).
5. **Bỏ** `frTier` short/standard/full; `auditFrBlock()` gate 7 sections.
6. **Override:** `convertOverrideToFr()` merge file `docs/srs-overrides/` — thiếu mục thì fill template.
7. **Sửa lỗi kỹ thuật:** `sliceBetween` regex cờ `m`; CSS `srs-delivery-styles.mjs`; blank line trước list markdown.
8. **Tri thức agent:** skill + rule + template `_TEMPLATE_FR.md` + cập nhật `BRD_SRS_WRITING_STANDARDS.md` §3.

### Outcome

- `02_SRS_XeVN_OS.html` v2.1, ~8.6MB, `fr_blocks=373`, audit **373/373**
- Cấu trúc giống Bateco; không Phụ lục A/B trace trong SRS khách
- User không cần nhắc lại "làm SRS kiểu Bateco" — đọc skill/rule là đủ

### Evidence

- `pnpm docs:srs:audit` → 373/373 pass (uniform FR 7 sections)
- `pnpm docs:srs:html` → `ok=true`
- Mẫu: `../E-Office-Bateco/document_HDSD/02_Tai_lieu_nghiep_vu.md`
- Code: `scripts/lib/srs-fr-spec.mjs`, `scripts/lib/srs-bateco-body.mjs`

### Reuse-tag

`SRS-Bateco-FR-7sections`, `373-FR-uniform`, `client-delivery`, `TSCAir`

---

## Entry 3 — HTML cover còn brand UNICOM (gap XeVN)

### Context

Sponsor/PM cần brand XeVN trên HTML khách; master logo đã có tại `assets/brand/xevn-logo-master.png`.

### Action

Inventory 5 HTML `docs/client-delivery/**/*.html` (2026-07-22): hero logo = UNICOM; accent `#3d7de8→#0ab4d8`; font Be Vietnam Pro; generators hardcode `logo-unicom.png`.

### Outcome

Evidence + cover template + P0 AC copy-ready cho SA merge proposal — chưa rewrite HTML trong wave research.

### Evidence

`docs/qa/evidence/ba-xevn-html-brand-gap-01-20260722.md`

### Reuse-tag

`client-delivery`, `brand-gap`, `xevn-logo`, `cover-template`

---

## Entry 4 — Dual-mark UNICOM text + orphan logo (P1 C1/C4)

### Context

QC-DOCS-HTML-BRAND-SAMPLE-01 GWC: hero XeVN PASS nhưng inner/footer còn «UNICOM»; `assets/logo-unicom.png` còn file dù HTML refs = 0.

### Action

Replace brand chrome/author/footer → XeVN / XeVN Group trong `docs/client-delivery/**`; delete `logo-unicom.png`; align generators (`doc-tscair-shell`, `srs-bateco-body`, BRD/SRS build, commercial pptx) + rule/standards logo path.

### Outcome

Grep client-delivery **0** UNICOM/`logo-unicom`; assets chỉ `xevn-logo.png`; C1+C4 closed — evidence P1 dualmark.

### Evidence

`docs/qa/evidence/xevn-thm-docs-p1-dualmark-01-20260722.md`

### Reuse-tag

`client-delivery`, `dual-mark`, `xevn-logo`, `no-unicom-hero`

---

## Entry 5 — P0 shell brand XeVN (sponsor lock 2026-07-22)

### Context

Sponsor OK Precision Motion; **không còn UNICOM** trên tài liệu khách — P0 HTML shell.

### Action

- Sync `xevn-logo-master.png` → `docs/client-delivery/assets/xevn-logo.png`
- Generators: LOGO XeVN; `rewriteLegacyUnicomAccentCss` (`#3d7de8`→`#1E40AF`, `#0ab4d8`→`#06B6D4`); cover tokens `#1E40AF`→`#06B6D4`
- `loadStyleSourceHtml(primary, fallback OUT)` khi thiếu file TSCAir trên máy
- Rebuild BRD/SRS `ok=true`; FR=373 giữ nguyên

### Outcome

AC-HTML-BRAND-01..06 **PASS**; grep `logo-unicom` / `UNICOM | AI SOFTWARE FACTORY` / `#3d7de8` = 0 trên HTML khách.

### Evidence

`docs/qa/evidence/ba-xevn-brand-html-p0-20260722.md`

### Reuse-tag

`xevn-brand-p0`, `doc-tscair-shell`, `cover-accent`, `style-fallback`

---

## Entry — SI insurer catalog DOC-DELTA (2026-08-08)

### Context

QC GWC seal SI-INSURER L1 (`SIINRQA-MSJB1WLH`); U88 ba-docs residual after peer SI type CH06b pattern; KEY taxonomy INSURER ≠ TYPE.

### Action

ADD-only: API F-SI-CAT-INS-01/02 · INS-EFF-01 · F-SI-REC-01 · EXPAND F-SI-POL-01 (`HRM-INS-INSURER-KEY`); SRS CORE-10/CORE-02 v0.29 AC-SI-INR-01..03; HDSD CH06c; DB footer pointer. No wipe type L1 / CTR / enrollment; no invent FE-01; no fold into `si_insurance_type`.

### Outcome

**DOC-DELTA ACCEPT** · `PASS_TO_PM` · honesty printable/personnel=false LOCKED.

### Evidence

`docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-docs-01.md`

### Reuse-tag

`si-insurer-catalog-docs`, `admin-ne-consumer`, `hrm-ins-insurer-key`, `peer-type-key-separate`

---

## Entry — ATT work-sites catalog DOC-DELTA (2026-08-08)

### Context

After ATT-WORKSITE-CATALOG-QC-01 GWC (`ATTWSQA-MSJC3IN9`), U88 ba-docs residual for Nest `attendance_work_sites` / F-ATT-CAT-WS — peer ATT-LEAVE / PAY catalog docs pattern.

### Action

ADD-only: API F-ATT-CAT-WS-01/02 · EXPAND F-ATT-PUNCH-01 (`HRM-ATT-GEO-001` / `HRM-ATT-GEO-REQ`); SRS ATT-03d v0.30; HDSD CH05b + CH05 pointer; DB footer. SITE-UNKNOWN HOLD · J-MOB-02 OOS · CNS-05 note without inventing FE · honesty `attendance_uat_ready=false` · seals RETAIN.

### Outcome

**DOC-DELTA ACCEPT** · `PASS_TO_PM` · no module ATT UAT / Phase1.

### Evidence

`docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-docs-01.md`

### Reuse-tag

`att-worksite-catalog-docs`, `admin-ne-consumer`, `hrm-att-geo-001`, `soft-retire-active-false`

---

## Entry — EMP custom-field catalog DOC-DELTA (2026-08-08)

### Context

After EMP-CUSTOM-FIELD-QC-01 GWC (`EMPCFQA-MSK14LUH`), U88 ba-docs residual for Settings extension SoT / invent `HRM-EMP-CUSTOM-FIELD-KEY` — peer ATT-WORKSITE / PAY catalog docs pattern. GAP `EMPCFCNSGAP-MSJCUBJB` CLOSED; EXT `EMPTOKEXTQA-MSJ57PE1` SEAL RETAIN; R-EMP-CF-FE-01 P2 HOLD (no invent FE).

### Action

ADD-only: API F-EMP-CF-01..03 · F-EMP-CF-CNS-01/02 · EXPAND F-EMP-TOK-03 RETAIN; SRS CORE-02b / PLT-01 v0.31; HDSD CH06d + CH06 pointer; DB footer. DENY Nest `emp_custom_field` / mega-EAV / personnel flip / reopen EXT · honesty false · `C-SLICE-≠-MODULE`.

### Outcome

**DOC-DELTA ACCEPT** · `PASS_TO_PM` · no module EMP UAT / Phase1 / UF 🟢 · no invent FE.

### Evidence

`docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-docs-01.md`

### Reuse-tag

`emp-custom-field-docs`, `admin-ne-consumer`, `hrm-emp-custom-field-key`, `settings-extension-sot`

---

## Entry — ATT work_shifts catalog DOC-DELTA (2026-08-08)

### Context

After ATT-SHIFT-CATALOG-QC-01 GWC (`ATTSHIFTQA-MSK5FXP3`), U88 ba-docs residual for Nest `work_shifts` SoT / invent `HRM-ATT-SHIFT-KEY` — peer ATT-CODE / ATT-WORKSITE docs pattern. FE CNS-02 Condition OPEN (no invent FE / no claim product invent closed). ATT-CODE / leave / worksite seals RETAIN.

### Action

ADD-only: API F-ATT-CAT-SHIFT-01/02 · EFF-01 · F-ATT-SHIFT-CNS-01 · EXPAND F-ATT-SHIFT-01; SRS PLT-01 / ATT-01 v0.36; HDSD CH05d + CH05/5b/5c pointers; DB footer; BA_TRACE §21e proposed J-HRM-ATT-SHIFT-CAT-*. Settings/`shifts` REF only · soft-retire inactive · admin≠consumer · honesty false · `C-SLICE-≠-MODULE`.

### Outcome

**DOC-DELTA ACCEPT** · `PASS_TO_PM` · no module ATT UAT / Phase1 / UF 🟢 · FE CNS-02 note only (Condition OPEN).

### Evidence

`docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-docs-01.md`

### Reuse-tag

`att-shift-catalog-docs`, `admin-ne-consumer`, `hrm-att-shift-key`, `settings-shifts-ref-only`, `soft-retire-inactive`

---

## Quick reference (agent)

| Câu hỏi user | Làm ngay |
|--------------|----------|
| "Làm/cập nhật SRS khách" | Đọc skill → `docs:srs:api-hints` → `docs:srs:audit` → `docs:srs:html` |
| "Thêm UC" | Sửa `BANG_TONG_HOP_USECASE_XEVN.md` → rebuild (FR tự sinh) |
| "UC vàng / viết tay" | `docs/srs-overrides/_TEMPLATE_FR.md` + folder Mxx |
| "SRS thiếu mục" | Không sửa HTML — sửa `srs-fr-spec.mjs` / bỏ tier — audit |
| "Giống Bateco" | Đã là mặc định từ v2.1 — không revert sang 12 mục |

**Không dùng cho SRS khách:** `srs-body-markdown.mjs` (8 chương legacy), `srs-uc-spec.mjs` Ch.5 12 mục (trừ `parseUcRowsFromCatalog`).
