# P1 — XeVN Precision Motion · Full Theme + Screen Remaster

| | |
|--|--|
| **Program** | `P1-XEVN-THEME-REMASTER` |
| **Sponsor lock** | 2026-07-22 — brand proposal **tạm OK**; **mọi** màn web + mobile; dựng **bộ theme**; chữ **sắc nét**, **không** màu nhạt / cỡ nhỏ kiểu AI; **ít chrome thừa**, focus nghiệp vụ |
| **SoT brand** | `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` → **APPROVED-SPONSOR** |
| **Status** | EXECUTION — FE-W1 + FE-W1-HRM pale + MOB-W2 **GWC**; density C1 in flight; :8088 synced (QA R2) |

---

## 1. Sponsor locks (bắt buộc mọi wave)

| ID | Lock | FAIL khi |
|----|------|----------|
| **L-CONTRAST** | Body / label / table cell ≥ **#374151** (`text-gray-700`); primary body **#111827** hoặc `xevn-text` đã làm đậm | `text-slate-400`, `text-muted-foreground` nhạt, `#9CA3AF` cho nội dung đọc |
| **L-TYPE** | Web body ≥ **15px**; table ≥ **14px**; page title ≥ **20px** bold; mobile body ≥ **17** (đã có) | `text-xs` / `text-[11px]` cho nghiệp vụ chính |
| **L-OPS** | Màn tác nghiệp: 1 tiêu đề + 1 vùng data chính + CTA rõ; sidebar/metrics phụ thu gọn | Dashboard “marketing” / chip cluster / stats strip che form |
| **L-THEME** | Một SoT token web+mobile; cấm hardcode hex lệch | Hex rải rác không qua token |
| **L-SCOPE** | **Tất cả** màn portal + HRM web + HRM mobile in-scope | Chỉ sửa 1–2 màn “demo” |

**Cấm:** purple SaaS, cream terracotta, pill cluster, emoji chrome, chữ xám nhạt trên nền xám.

---

## 2. Wave plan

| Wave | Outcome | Owners | Exit |
|------|---------|--------|------|
| **W0** | Design system SoT + contrast/type floor + screen inventory | SA, ba-process | ADR/token doc + inventory AC |
| **W1a** | Theme package / CSS vars / Tailwind / shadcn map (portal + HRM) | dev-fe | Tokens live; grep pale-text FAIL gate |
| **W1b** | Remaster **tất cả** web screens theo theme (chrome → CC → HRM embed → settings) | dev-fe (squad batches) | Visual AC L-CONTRAST/TYPE/OPS |
| **W2** | Mobile tokens + **tất cả** màn ESS/approve/attendance… | dev-mobile | Same locks + touch ≥44 |
| **W3** | QA visual + a11y contrast spot; QC GWC | qa, qa-device, qc | Evidence per surface |
| **P0 HTML** | Bìa khách UNICOM → XeVN (song song) | ba-docs | AC-HTML-BRAND |

---

## 3. Work items

| ID | Role | Việc |
|----|------|------|
| **XEVN-THM-SA-01** | sa | Khóa token: text `#111827` / secondary `#4B5563`; type scale; ban list class nhạt; ADR short |
| **XEVN-THM-BA-01** | ba-process | Inventory **mọi** route web+mobile; AC density ops-first mỗi nhóm màn |
| **XEVN-THM-FE-00** | dev-fe | Implement theme foundation (CSS vars + Tailwind + HRM shadcn bridge + lint/grep) |
| **XEVN-THM-FE-W1** | dev-fe | Remaster portal chrome + login dark shell + CC + settings (batch 1) |
| **XEVN-THM-FE-W1-HRM** | dev-fe | Remaster HRM web toàn bộ pages/components theo theme |
| **XEVN-THM-MOB-00** | dev-mobile | Align `tokens.ts` contrast/type + ThemeProvider |
| **XEVN-THM-MOB-W2** | dev-mobile | Remaster mọi screen features theo tokens |
| **XEVN-THM-DOCS-P0** | ba-docs | HTML khách logo XeVN (P0 proposal) |
| **XEVN-THM-QA-01** | qa | Visual contrast + ops density spot matrix |

---

## 4. Definition of Done (program)

- [ ] Token SoT một nguồn; web+mobile mirror
- [ ] Grep gate: không `text-slate-400` / `text-gray-400` trên body/label nghiệp vụ
- [ ] Mọi màn in inventory có verdict remaster hoặc waiver owner+expiry
- [ ] QA PASS contrast sample + login brand test
- [ ] **NOT** Phase 1 DONE claim

---

## 5. Liên kết

- **Theme ADR (runtime law):** `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` — token `#111827` / `#4B5563` / muted-only `#6B7280`; type floors; ban list; grep gate
- Brand: `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §3
- Mobile DS: `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` (structure; contrast hex **superseded** by ADR)
- Luxury: `.cursorrules` §2
- A11y: `uiux-quality-accessibility.mdc`
