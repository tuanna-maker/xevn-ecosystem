# Chuẩn Viết BRD & SRS — XeVN Ecosystem

> **Áp dụng cho:** Toàn bộ sub-agent (SA, BA-Process, BA-Data, Dev-BE, Dev-FE, PM) khi soạn tài liệu thiết kế hệ thống.
> **Cập nhật lần cuối:** 22/07/2026 · **SA-SPEC-OS-ALIGN-01** (brand P0 + OS SoT links)

### Agent — SRS khách XeVN (đọc trước khi làm việc)

| Việc | Nguồn |
|------|--------|
| **OS chất lượng (SoT MUST)** | `projects/_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` (§3.4 FR đồng nhất · failure-first · Kết quả trả về · skeleton · dual-doc · TechSpec depth) |
| **OS truy vết** | `projects/_vibe-team-os/14-TRACEABILITY-SRS-TECHSPEC-CODE.md` (`ref_srs` · CODE-MEMORY VI · ADD/UPGRADE) |
| Quy trình đầy đủ (global) | `~/.cursor/skills/client-delivery-brd-srs/SKILL.md` + subagent **`@ba-docs`** |
| XeVN paths | `.cursor/skills/client-delivery-docs/PROJECT_PROFILE.md` |
| Gap register | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` |
| Bài học global | `~/.cursor/knowledge-base/client-delivery-brd-srs.md` |
| Mẫu viết FR | `E-Office-Bateco/document_HDSD/02_Tai_lieu_nghiep_vu.md` + `docs/srs-overrides/_TEMPLATE_FR.md` |
| Build | `pnpm docs:srs:audit` → `pnpm docs:srs:html` |
| Kiểm sơ đồ | `node scripts/audit-mermaid-diagrams.mjs` (BRD); Việt hóa **không** sửa trong ` ```mermaid ` |
| **Mặc định** | SRS **6 chương Bateco**, **373 FR × 7 mục** — **không** revert 8 chương / 12 mục UC / REQ-SRS |
| **Shell HTML** | TSCAir + logo `docs/client-delivery/assets/xevn-logo.png` · footer **XeVN Group** (cấm UNICOM trên deliverable / chuẩn viết) |

---

## 1. Nguyên tắc cốt lõi (30 năm PM đúc kết)

| Nguyên tắc | Diễn giải hành động |
|-----------|---------------------|
| **Đo được hay không tính** | Mọi mục tiêu, NFR, tiêu chí chấp nhận phải có con số cụ thể. "Hiệu năng tốt" ❌ → "P95 API < 500ms dưới 200 CCU" ✅ |
| **Phạm vi trước, chi tiết sau** | BRD định phạm vi IN/OUT, mục tiêu, quy tắc. SRS mới đặc tả luồng, API, mã lỗi. Không lẫn lộn hai tài liệu. |
| **Không nêu lộ trình trong BRD** | BRD chỉ mô tả *hệ thống cần làm gì* — không nêu phase, sprint, timeline. Lộ trình thuộc tài liệu Project Plan riêng. |
| **Số lượng use case phải đếm được** | BRD phải có **373 dòng UC có mã** (không chỉ tóm tắt): mục **5.1** (ma trận), **7.5 / 8.5 / 9.5** (bảng theo XBOS/HRM/Logistic), **Phụ lục A** (danh mục đầy đủ). 183 catalog XBOS tách riêng. |
| **Quy tắc nghiệp vụ có mã** | Mỗi business rule phải có mã duy nhất (BR-XXX-YYY). SRS kế thừa mã này khi trích dẫn. |
| **Stakeholder phải mapping nhu cầu** | Không liệt kê stakeholder rỗng. Mỗi stakeholder: vai trò → nhu cầu nghiệp vụ cốt lõi → phân hệ phục vụ. |
| **Tiếng Việt thuần (gửi khách)** | Toàn bộ câu văn, bảng mô tả, chú thích BRD/SRS **bằng tiếng Việt** — không câu Anh–Việt lẫn (vd. ❌ *snapshot tenant* → ✅ *bản dữ liệu của công ty khác*). Giữ mã định danh (`UC-XBOS-01`, `BR-ECO-SCOPE`). Cột *Kênh*: Dịch vụ / Cổng web / Di động. Build áp `scripts/lib/brd-vietnamese-prose.mjs`. |

---

## 2. Cấu trúc BRD chuẩn (9 chương)

```
Trang Bìa (Cover) — **bắt buộc giống layout TSCAir** (shell XeVN, không dùng `.hero`):
  - `accent-bar` + `header` (mã tài liệu trái, phiên bản phải) + `divider`
  - `logo-wrap` (logo XeVN `docs/client-delivery/assets/xevn-logo.png`, base64 trong HTML gửi khách)
  - `doc-label`, `project-title` (`.eo` / `.bateco`), `subtitle`, `meta-info`
  - `footer`: **XeVN Group** · `© 2026 — All Rights Reserved` (cấm footer UNICOM legacy)
  - Mã tài liệu: `XEVN/BRD-*` / `XEVN/SRS-*` (vd. `XEVN/BRD-XEVN-OS-001`) — cấm `UNICOM/*`
  - Build: `node scripts/build-brd-xevn-html.mjs` / `node scripts/build-srs-xevn-html.mjs`

Chương 1. Tóm tắt điều hành & Bài toán nghiệp vụ
  - 1.1 Tóm tắt điều hành (stat-row: số UC, catalog, phân hệ, kênh)
  - 1.2 Bài toán nghiệp vụ (bảng: thách thức → hệ quả → phân hệ)
  - 1.3 Mục tiêu & KPI đo lường
  - 1.4 In-scope / Out-of-scope (two-col)

Chương 2. Stakeholder & Vai trò
  - Bảng stakeholder đầy đủ: role, nhu cầu cốt lõi, phân hệ
  - Ma trận RACI cấp cao

Chương 3. Yêu cầu nghiệp vụ (tách theo phân hệ)
  - Mỗi phân hệ: bảng BR-XXX với Mức độ (Bắt buộc/Khuyến nghị/Tùy chọn)
  - Không đặc tả API/luồng kỹ thuật tại đây (để SRS)

Chương 4. Danh mục Use Case tóm tắt
  - Bảng phân bổ UC theo phân hệ và kênh
  - Bảng catalog XBOS (tổng, phân hệ HRM/Logistic)

Chương 5. Quy tắc nghiệp vụ (Business Rules Matrix)
  - Bảng: Mã | Điều kiện | Hành động | Kết quả
  - Nhóm: phạm vi dữ liệu, catalog, HRM, UX/tích hợp

Chương 6. Yêu cầu phi chức năng (NFR)
  - Bảo mật, Hiệu năng, Độ tin cậy, Vận hành, Khả năng mở rộng
  - Mỗi mục có con số mục tiêu cụ thể

Chương 7. Yêu cầu dữ liệu mức nghiệp vụ
  - Phân tầng dữ liệu (Dùng chung / Danh mục / Quy trình / Giao dịch)
  - Mô hình tenant (Master tenant, Member tenant, email chuẩn)

Chương 8. Rủi ro & Biện pháp giảm thiểu
  - Bảng: Rủi ro | Mức độ (Cao/TB/Thấp) | Tác động | Biện pháp

Chương 9. Tiêu chí nghiệm thu & Giả định/Ràng buộc
  - Acceptance criteria có bằng chứng đo được
  - Assumptions & Constraints rõ ràng
```

---

## 3. Cấu trúc SRS chuẩn (6 chương — mẫu Bateco E-Office)

> **Deliverable HTML:** `docs/client-delivery/02_SRS_XeVN_OS.html` — build `pnpm docs:srs:html`  
> **Generator:** `scripts/lib/srs-bateco-body.mjs` + `scripts/lib/srs-fr-spec.mjs` (373 × `FR-{Mã UC}`)

```
Trang Bìa (Cover) — format Bateco, màu cyan

Chương 1. Giới thiệu tài liệu
  - 1.1 Mục đích · 1.2 Phạm vi · 1.3 Định nghĩa · 1.4 Tài liệu liên quan

Chương 2. Mô tả tổng quan hệ thống
  - 2.1 Bối cảnh (kiến trúc Hub-and-Spoke + hình)
  - 2.2 Đối tượng người dùng
  - 2.3 Vòng đời nghiệp vụ chính
  - 2.4 Ràng buộc hệ thống

Chương 3. Yêu cầu chức năng (373 FR = 373 UC catalog)
  - MOD-M00 … MOD-M08 (3.1–3.9)
  - Mỗi FR (373/373 — **đủ 7 mục, không tier ngắn**): bảng Actor/Ưu tiên/Tiên quyết/Hậu
    · Dữ liệu đầu vào · Luồng chính · Quy tắc nghiệp vụ · Trường hợp đặc biệt
    · Sơ đồ tương tác · Diễn biến nghiệp vụ (7 dòng)
  - Audit: `node scripts/audit-srs-uc-quality.mjs` — gate 7 sections

Chương 4. Yêu cầu phi chức năng (NFR-SEC, PERF, AVAIL, COMPAT, DATA)

Chương 5. Yêu cầu giao diện ngoài (Cổng Web, HRM API/Mobile, XBOS, Logistic)

Chương 6. Ràng buộc nghiệp vụ tổng quát (BR-ECO, BR-CAT, …)
```

**Không đưa vào SRS gửi khách (khác mẫu Bateco):** Chương 0 meta pipeline; 8 chương kỹ thuật tách rời; Phụ lục traceability REQ-SRS; 12 mục/UC (Kiểm chứng, bảng mã lỗi 6 dòng/UC, Metadata STT/REQ-ID); `stat-row` / `flow-box` HTML tùy biến (dùng markdown số thứ tự như Bateco).

### 3.1 OS MUST bổ sung (bám `_vibe-team-os/13` §3.4 — chưa đủ nếu chỉ đếm 7 tiêu đề)

| OS § | Yêu cầu MUST | Áp dụng XeVN |
|------|--------------|--------------|
| **3.4.2** | Diễn biến: auth ≤2 dòng · success ≥40% · fail domain ≥30% | Bắt buộc khi remaster / ADD FR; audit `docs:srs:audit` **chưa** đếm tỷ lệ → gap **G-RULE-02** |
| **3.4.6** | Mục **Kết quả trả về khi thành công** (người dùng thấy · bản ghi · khóa · trạng thái · UC mở khóa) | Bắt buộc trên FR mới / remaster; bổ sung `_TEMPLATE_FR.md` (gap **G-RULE-05**) |
| **3.4.7** | Remaster **ADD-only** — không giảm số dòng đầu vào / quy tắc | QC so sánh bản trước; cấm wipe stub |
| **3.4.8** | Skeleton Ch.4–6 trong **body** + inventory UC từ BRD | HTML SRS XeVN đã có 6 chương; inventory SoT = catalog 373 + module khách |
| **3.4.10** | Dual-doc: bản khách = SoT đầy đủ; `*_team.md` = clone + path | Module HRM/XBOS: `SRS_*_KHACH.md` + team `docs/*/SRS.md` |
| **3.4.11** | TechSpec: ma trận `Bước# → API → bảng` + file `DB_DESIGN_*` / `API_DESIGN_*` (field-level) | Team TechSpec có `ref_srs` / §17 matrix **PARTIAL**; thiếu chuẩn bắt buộc trong file này → **G-RULE-03** |
| **14** | Mọi block TechSpec có `ref_srs`; CODE-MEMORY VI trỏ FR/UC + bước | Policy global + wave SA; coverage chưa 100% |

Chi tiết gap: `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §1 · evidence `docs/qa/evidence/sa-spec-os-align-01-20260722.md`.

---

## 4. Format HTML — Chuẩn Bateco (bắt buộc)

### 4.1 CSS Variables
```css
--blue: #3d7de8    /* BRD */
--cyan: #0ab4d8    /* SRS */
--dark: #0e1b2e    /* hero background */
--grad: linear-gradient(135deg, #3d7de8, #0ab4d8)
--line: #dde6f4
--text: #1a2a3a
--sub:  #5a7090
--bg:   #f5f8fd
```

### 4.2 Component classes bắt buộc
- `.page` — A4 page shell (210mm, min-height 297mm)
- `.ph` — top gradient bar (5px)
- `.doc-header` — logo/brand + doc meta bên phải
- `.hero` — dark hero với grid overlay + glow spot
- `.doc-badge` — "Business Requirements Document" badge
- `.meta-grid` — 2-col grid thông tin tài liệu
- `.tags` — phân hệ nghiệp vụ
- `.client-block` — thông tin khách hàng
- `.sig-strip` — 2-col signature boxes
- `.doc-footer` — dark footer với version info

### 4.3 Content page classes
- `.content` — padding 24px 48px
- `.stat-row` / `.stat-box` — stat numbers highlight
- `.two-col` / `.col-box` — 2-column layout
- `.flow-box` / `.flow-step` / `.step-num` — numbered flows
- `.callout` — blue info box (cyan border cho SRS)
- `.callout-warn` — amber warning box

### 4.4 Màu sắc phân biệt BRD vs SRS
- BRD: `.sec-label` và accent dùng `--blue`; hero gradient `135deg blue→cyan`
- SRS: `.sec-label` và accent dùng `--cyan`; hero glow dùng blue tone
- Background body: BRD `#d0daea`, SRS `#c8d6e8`

---

## 5. Chuẩn đặt tên file

```
docs/client-delivery/01_BRD_[TEN_HE_THONG].html
docs/client-delivery/02_SRS_[TEN_HE_THONG].html
docs/client-delivery/03_NV_[TEN_HE_THONG].html   (Tài liệu Nghiệp vụ / User Guide)
```

Quy tắc đặt số:
- `01_` = BRD (Business Requirements Document)
- `02_` = SRS (Software Requirements Specification)
- `03_` = NV (Nghiệp vụ / User manual)

---

## 6. Trích dẫn & Traceability

- Mỗi BR trong BRD phải có mã duy nhất: `BR-[PREFIX]-[NHÓM]-[SỐ]`
- Mỗi UC phải có mã: `UC-[PHÂN HỆ]-[SỐ]`
- SRS khi đặc tả UC phải trích dẫn mã UC từ BRD
- Quy tắc phạm vi (BR-ECO-SCOPE-*) được trích dẫn từ `docs/ecosystem/BRD.md` — không viết lại
- Acceptance criteria phải có trường "Bằng chứng nghiệm thu" (evidence path)

---

## 7. Anti-pattern phải tránh

| Anti-pattern | Lý do | Thay thế đúng |
|---|---|---|
| "Hiệu năng tốt" | Không đo được | "P95 < 500ms dưới 200 CCU" |
| Lộ trình trong BRD | BRD không nói *khi nào* | Tạo Project Plan riêng |
| Mục tiêu không có KPI | Không nghiệm thu được | Mỗi mục tiêu gắn ≥1 chỉ số |
| UC tổng hợp chung | Không truy vết được | Liệt kê UC có mã, kênh, phân hệ |
| Stakeholder liệt kê rỗng | Không dùng được | Mỗi stakeholder: role + nhu cầu + phân hệ |
| Business rule không mã | Không trích dẫn được từ SRS | BR-XXX-NNN bắt buộc |
| SRS lẫn "khi nào deploy" | Thuộc DevOps plan | SRS chỉ nói *gì* và *thế nào* |
| NFR không có điều kiện đo | Không kiểm chứng | Ghi rõ "đo tại staging, 200 CCU" |
| Meta prompt / báo cáo agent trong HTML khách | Lộ quy trình nội bộ, mất uy tín gửi khách | Không ghi: Writing Standards, Chuẩn 8 chương, pipeline, audit, override, `docs/...`, ISO 29148, Verify/trace script |
| Câu Anh–Việt lẫn trong narrative khách | Khó đọc, không chuyên nghiệp với khách VN | Viết thuần tiếng Việt; thuật ngữ kỹ thuật dịch hoặc diễn giải (tenant→công ty, snapshot→bản chụp dữ liệu, workflow→quy trình) |
| Subtitle SRS kiểu "Chuẩn 8 chương (BRD & SRS Writing Standards)" | Giống ghi chú nội bộ | `Yêu cầu phần mềm — Hệ sinh thái đa phân hệ` |
| Sửa trực tiếp file HTML deliverable | Không tái tạo được, diff khó | Sửa markdown/scripts → `pnpm docs:brd:html` / `docs:srs:html` |

---

## 8. Ví dụ tài liệu chuẩn

Tài liệu chuẩn đã được viết và phê duyệt (dùng làm mẫu):

| File | Loại | Hệ thống | Ghi chú |
|------|------|---------|---------|
| `docs/client-delivery/01_BRD_XeVN_OS.html` | BRD | XeVN OS | 9 trang, 373 UC, 183 catalog |
| `docs/client-delivery/02_SRS_XeVN_OS.html` | SRS | XeVN OS | 8 trang, luồng chi tiết |
| `docs/client-delivery/01_Tai_lieu_thiet_ke_he_thong_XEVN_HRM_MOBILE.html` | BRD | HRM Mobile | BRD phân hệ đơn lẻ |

---

## 9. Kiểm tra nhanh trước khi submit

- [ ] Trang bìa TSCAir: `doc-page cover`, logo XeVN (`xevn-logo.png`), mã `XEVN/BRD-*` hoặc `XEVN/SRS-*`, footer **XeVN Group**, **không** class `hero-title` / UNICOM legacy
- [ ] BRD/SRS: sơ đồ kiến trúc PNG và Mermaid sequence/flowchart **hiển thị hình** (không để text/raw) — build `pnpm docs:client-delivery:html`
- [ ] Tham chiếu tài liệu: ghi **tên tài liệu**, không ghi đường dẫn file `.md` / `docs/...`
- [ ] BRD: 373 UC — mục 7.5, 8.5, 9.5 và Phụ lục A
- [ ] Chương 1 có stat-row với ít nhất 4 con số định lượng
- [ ] Mỗi yêu cầu nghiệp vụ có mã BR-XXX và mức độ
- [ ] NFR có con số mục tiêu (không dùng "tốt" hay "nhanh")
- [ ] Acceptance criteria có cột "Bằng chứng"
- [ ] Không có nội dung lộ trình (phase/sprint) trong BRD
- [ ] SRS có mã lỗi cho mọi failure path chính
- [ ] State machine có bảng hoặc mô tả rõ các transition
- [ ] Không có meta agent (Writing Standards, pipeline, audit, path `docs/` trong narrative)
- [ ] Văn phong tiếng Việt thuần — không câu Anh–Việt lẫn trong thân tài liệu khách
- [ ] SRS: `pnpm docs:srs:audit` → 373/373; build `ok=true`
- [ ] (OS §3.4.6) FR remaster / mới có **Kết quả trả về khi thành công** — không chỉ «Thành công»
- [ ] (OS §3.4.2) Spot-check Diễn biến: auth ≤2 · có ≥3 bước success nghiệp vụ · fail domain sâu
- [ ] Ctrl+F deliverable: không còn `UNICOM`, meta pipeline, path `docs/` trong narrative khách

---

## 10. Hướng dẫn Agent / Sub-agent (Cursor)

**Bắt buộc trước khi soạn hoặc build tài liệu khách:**

| Artifact | Đường dẫn |
|----------|-----------|
| OS SoT chất lượng | `projects/_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` |
| OS SoT truy vết | `projects/_vibe-team-os/14-TRACEABILITY-SRS-TECHSPEC-CODE.md` |
| Rule (file docs/client-delivery, build script) | `.cursor/rules/client-delivery-docs.mdc` |
| Skill (quy trình đầy đủ) | `.cursor/skills/client-delivery-docs/SKILL.md` (+ global `client-delivery-brd-srs`) |
| KB ngắn (lessons) | `.cursor/knowledge-base/client-delivery-docs.md` |
| Gap / alignment | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` |

**Lệnh build (agent tự chạy, không nhờ user):**

```bash
pnpm docs:client-delivery:html    # BRD + SRS
pnpm docs:srs:api-hints           # trước khi cập nhật bảng API SRS
pnpm docs:srs:audit               # gate 7 mục / FR × 373 — không phải rubric 12 mục cũ
pnpm docs:srs:html                # chỉ SRS
```

**Vai trò:**

- **BA-Process / BA-Data:** UC, BR, AC → `docs/srs-overrides/` hoặc BRD markdown; không paste vào HTML.
- **SA:** Ch.1–4 SRS, API catalog, TechSpec `ref_srs` + ma trận bước→API→DB (OS §3.4.11); giữ shell TSCAir **XeVN Group**.
- **PM:** Chỉ gửi khách sau build `ok=true` + spot-check bìa/TOC trên trình duyệt.

**Subagent Task:** khi dispatch BA/SA/PM cho BRD/SRS khách, ghi trong prompt: *Đọc OS `_vibe-team-os/13` + `14`, skill `client-delivery-docs`, tuân `BRD_SRS_WRITING_STANDARDS.md`; cấm meta prompt / UNICOM trong deliverable.*
