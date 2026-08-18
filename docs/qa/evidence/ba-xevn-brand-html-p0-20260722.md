# D-DOCS-SHELL-XEVN-BRAND-P0-01 — HTML shell XeVN brand (P0)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-DOCS-SHELL-XEVN-BRAND-P0-01` |
| **from_role** | ba-docs |
| **to_role** | qa |
| **date** | 2026-07-22 |
| **scope** | `docs/client-delivery/**` + generators (`scripts/lib/doc-tscair-shell.mjs`, `build-brd/srs-xevn-html.mjs`, `srs-delivery-styles.mjs`) |
| **apps/** | Không đụng |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | qa |

---

## 1. completion_report

### Đã đóng

| Hạng mục | Kết quả |
|----------|---------|
| Logo master → client-delivery | `assets/brand/xevn-logo-master.png` → `docs/client-delivery/assets/xevn-logo.png` (SHA256 khớp `E1763A9D…836A3D`, 137704 bytes) |
| README | Đã ghi logo XeVN path (không UNICOM hero) |
| 5/5 HTML cover | Hero `alt="XeVN"`; hand HTML dùng `assets/xevn-logo.png`; BRD/SRS OS embed base64 từ `xevn-logo.png` |
| Accent cover | `#1E40AF` → `#06B6D4`; **0** `#3d7de8` trong HTML khách |
| Doc code / footer shell | `XEVN/BRD-XEVN-OS-001`, `XEVN/SRS-XEVN-OS-001`; footer `XeVN Group` |
| Generators | `LOGO` = `xevn-logo.png`; `rewriteLegacyUnicomAccentCss`; `XEVN_COVER_BRAND_STYLES`; fallback style khi thiếu file TSCAir Telegram Desktop |
| Rebuild | `pnpm docs:brd:html` → `ok=true`; `pnpm docs:srs:html` → `fr_blocks=373 ok=true` |
| Grep shell | `logo-unicom` / `UNICOM \| AI SOFTWARE FACTORY` → **0** trên `docs/client-delivery/**/*.html` |
| Orphan asset | `logo-unicom.png` **không** còn trong `docs/client-delivery/assets/` |

### Residual (không block P0 shell)

| Item | Note |
|------|------|
| Primary style ref Telegram Desktop | Máy thiếu `TSCAir_BRD_…` / `Unicom_SRS_…` — build dùng **fallback** OUT hiện có; warn in console. Nên vendoring style snippet vào repo (P1 ops) nếu CI cần deterministic. |
| Path `DEFAULT_SRS_REF` còn chữ Unicom | Chỉ đường dẫn file local máy cá nhân — **không** vào HTML khách. |
| `doc-markdown-prep` regex `template Unicom` | Strip legacy prose — giữ an toàn, không hero. |

### Không claim

Phase 1 DONE / PROD-READY. Không seed. Không sửa `apps/**`.

---

## 2. AC-HTML-BRAND-01..06

| ID | AC | Verdict | Evidence |
|----|----|---------|----------|
| **AC-HTML-BRAND-01** | Logo bìa 5/5 = XeVN, không `logo-unicom` hero | **PASS** | 3 hand: `src="assets/xevn-logo.png"`; 2 OS: base64 + `alt="XeVN"`; grep `logo-unicom` = 0 |
| **AC-HTML-BRAND-02** | Accent-bar / sep / title = `#1E40AF` → `#06B6D4` | **PASS** | Hand CSS gradient `#1E40AF,#06B6D4`; OS CSS + `--xevn-primary/secondary`; `#3d7de8` = 0 |
| **AC-HTML-BRAND-03** | Tồn tại `docs/client-delivery/assets/xevn-logo.png` khớp master | **PASS** | SHA256 = master |
| **AC-HTML-BRAND-04** | Generator rebuild không nhúng UNICOM hero | **PASS** | BRD/SRS rebuild `ok=true`; LOGO path xevn; gate `!logo-unicom` / `!UNICOM \| AI SOFTWARE FACTORY` / `!#3d7de8` |
| **AC-HTML-BRAND-05** | Font Be Vietnam Pro | **PASS** | 5/5 HTML có `'Be Vietnam Pro'` |
| **AC-HTML-BRAND-06** | Không đổi số FR / skeleton Bateco | **PASS** | SRS `fr_blocks=373`; chapters 1–6 vẫn trong gate build |

---

## 3. File list (touched / verified)

### Assets

- `docs/client-delivery/assets/xevn-logo.png` (sync master)
- `docs/client-delivery/README.md` (đã mô tả XeVN logo)

### HTML khách

- `docs/client-delivery/00_Mo_ta_he_sinh_thai_XEVN.html` (highlight-box accent → `#1E40AF`)
- `docs/client-delivery/01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html` (verified XeVN cover)
- `docs/client-delivery/02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.html` (verified XeVN cover)
- `docs/client-delivery/01_BRD_XeVN_OS.html` (**rebuilt**)
- `docs/client-delivery/02_SRS_XeVN_OS.html` (**rebuilt**, 373 FR)

### Generators

- `scripts/lib/doc-tscair-shell.mjs` — brand CSS + rewrite + `loadStyleSourceHtml` fallback
- `scripts/lib/srs-delivery-styles.mjs` — `--cyan` fallback `#06B6D4`
- `scripts/build-brd-xevn-html.mjs` — LOGO XeVN + brand gates + style fallback
- `scripts/build-srs-xevn-html.mjs` — LOGO XeVN + brand gates + style fallback

---

## 4. Grep verify (2026-07-22)

```text
docs/client-delivery/**/*.html
  logo-unicom                        → 0
  UNICOM | AI SOFTWARE FACTORY       → 0
  #3d7de8                            → 0
  assets/logo-unicom.png exists      → false
  assets/xevn-logo.png exists        → true
```

---

## 5. next_dispatch_prompt

```text
work_item_id: QA-DOCS-HTML-BRAND-P0-01
role: qa
entry_criteria: đọc docs/qa/evidence/ba-xevn-brand-html-p0-20260722.md; U65 N/A (docs-only)
scope: spot-check 5 covers trong browser (không seed; không apps/**)
files:
  1) docs/client-delivery/00_Mo_ta_he_sinh_thai_XEVN.html
  2) docs/client-delivery/01_BRD_XeVN_OS.html
  3) docs/client-delivery/02_SRS_XeVN_OS.html
  4) docs/client-delivery/01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html
  5) docs/client-delivery/02_Tai_lieu_nghiep_vu_XEVN_HRM_MOBILE.html
AC map: AC-HTML-BRAND-01..06
exit_criteria:
  - Mỗi cover: logo XeVN visible; không UNICOM hero/alt; accent bar primary→cyan (#1E40AF→#06B6D4)
  - Header/footer shell: XeVN / XEVN/… / XeVN Group
  - SRS vẫn 373 FR / 6 chương (smoke title + 1 FR random)
  - Evidence path + PASS_TO_PM hoặc FAIL với residual
cấm: seed; claim Phase1/PROD; sửa apps/**
evidence_path: docs/qa/evidence/qa-xevn-brand-html-p0-20260722.md
```

---

## 6. ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/ba-xevn-brand-html-p0-20260722.md`
