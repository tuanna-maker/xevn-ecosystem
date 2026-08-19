# ADR: XeVN Precision Motion — design tokens (remaster W0)

| Field | Value |
|-------|--------|
| **ADR-ID** | `ADR-XEVN-PRECISION-MOTION-TOKENS` |
| **work_item_id** | `PO-HRM-UI-BRAND-ADR-01` (+ **APPEND** `PO-HRM-UI-BRAND-ADR-02-APPEND` · **LOCK** `PO-HRM-UI-BRAND-ADR-03-LOCK`) |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · Wave **W0** + sponsor fill override + final lock |
| **Status** | **Accepted** (governance SoT) · **2026-08-05 sponsor FINAL LOCK** (§16 — B5 body · S3 · ATT 90) |
| **Date** | 2026-08-05 |
| **Decision owner** | SA |
| **Sponsor authorize** | Chat «cho team làm luôn wave thiết kế lại» · FILL **UI-1=Có** · **UI-2=tất cả** (squad) · Open Q §3–§4 ~13:37 · **§7.1 FINAL ~13:44** |
| **Skill** | `xevn-precision-motion-theme` |
| **Doctrine** | `_vibe-team-os/17-BRAND-UIUX-THEME-REMASTER.md` · `INC-AI-PALE-TEXT-CLUTTER-UX` |
| **Open Q** | `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_UI_BRAND_OPEN_QUESTIONS.md` §3–§4 · §7.1 · §8 — **all brand locks CLOSED** (no B5/S3 PENDING) |
| **Evidence** | `docs/qa/evidence/po-hrm-ui-brand-adr-01.md` · `docs/qa/evidence/po-hrm-ui-brand-adr-02.md` · `docs/qa/evidence/po-hrm-ui-brand-adr-03.md` |
| **Supersedes / restores** | Runtime law previously cited as `ADR-XEVN-THEME-SHARP-OPS-20260722` (**file missing** from `docs/architecture/` as of 2026-08-05) — this ADR **re-establishes** token SoT from skill + live `:root` / Tailwind / mobile tokens |
| **Research prompt** | `docs/program/prompts/CLAUDE_ENTERPRISE_UI_RESEARCH_PROMPT.md` (Prompt 1–3 spirit — enterprise dialog, not marketing) |

---

## 1. Decision context

Sponsor opened UI remaster for **portal shell + HRM embed (ATT/EMP/REC/PAY) + mobile tokens**. Governance needs a single Accepted token ADR before Dev-FE foundation and squad remaster.

**Facts (repo evidence — read-only):**

| Surface | Token location | Hex lock already present |
|---------|----------------|--------------------------|
| Portal | `apps/web/web-portal/src/index.css` `:root` + `tailwind.config.cjs` `xevn.*` | primary `#1E40AF`, text `#111827` |
| HRM | `apps/web/hrm/src/index.css` `:root` + shadcn HSL bridge + `tailwind.config.ts` `xevn.*` | same hex; `--muted-foreground` already sharpened to Gray-600-class |
| Mobile | `apps/mobile/hrm-mobile/src/theme/tokens.ts` | same hex; type floors ≥17 body |

**Problem:** Remaster program needs **governance SoT** (dual-surface iframe rules, modal chrome, A1–A5 until Open Questions filled). Inventing a second customer palette while B1–B5 empty = architecture defect.

**Constraints:**

- No API / SRS business change (`must_keep`).
- Stub / `featureInDev` honesty banners **stay**.
- **Cấm** purple–indigo / cream–terracotta / glow AI themes.
- Do **not** treat unanswered Open Questions §3 B1–B5 as final customer brand.

---

## 2. Options

### Option A — Re-lock Precision Motion (existing hex) + dual-surface embed law

- **Description:** Accept current portal/HRM/mobile token hex as **runtime SoT**; document dual-surface (portal chrome vs HRM iframe), ops-dense modal chrome, pale-text ban, A1–A5 until sponsor fills §3.
- **Benefits:** Zero palette invent; FE foundation = align/grep gate + remaster, not redesign; matches `.cursorrules` luxury primary and skill locks.
- **Costs:** Brand “wow” limited until B1–B5 answered; Inter remains interim font (B5 open).
- **Risks:** Sponsor later changes primary → controlled token bump only (one ADR delta).

### Option B — Invent new customer brand now (new primary / display font / marketing shell)

- **Description:** Pick new palette/fonts as if B1–B5 filled; ship as final brand.
- **Benefits:** Faster “new look” demos.
- **Costs:** High rework when sponsor answers Open Questions; violates “cấm invent B1–B5”.
- **Risks:** Purple/AI drift; dual-surface mismatch; QC reject.

### Option C — Portal-only tokens; defer HRM iframe / modal remaster

- **Description:** Foundation only on portal; HRM embed keeps pale shadcn body until later wave.
- **Benefits:** Smaller W2 blast radius.
- **Costs:** Violates UI-2=tất cả; sponsor still sees pale ATT/EMP modals in iframe.
- **Risks:** Brand test fails inside product path user actually uses.

---

## 3. Trade-off matrix

| Criteria | Weight | A | B | C |
|----------|-------:|--:|--:|--:|
| Business value (sponsor remaster authorize) | 25 | 5 | 3 | 2 |
| Time to deliver W2 foundation | 20 | 5 | 2 | 4 |
| Complexity / rework risk | 20 | 5 | 1 | 3 |
| Maintainability (one hex SoT) | 15 | 5 | 2 | 2 |
| Ops readability (pale ban) | 20 | 5 | 3 | 2 |
| **Weighted** | 100 | **5.0** | **2.2** | **2.6** |

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Remaster only changes primary button, leaves pale labels | QA pale grep + contrast sample | Ban list §6 + exit criteria W2 |
| A | Portal vs HRM hex drift | Diff `:root` vs `xevn.*` vs mobile | Foundation Task must keep lockstep |
| B | Fake “final” brand | Open Q §3 still blank | **Rejected** |
| C | Iframe still AI-pale | Sponsor screenshot ATT modal | **Rejected** (UI-2) |

---

## 5. Decision — **RECOMMENDED: Option A**

**Selected:** Option A.

**Why:** Tokens already live in three surfaces; skill + `.cursorrules` + program A1–A5 agree; Option B invents unanswered brand; Option C breaks UI-2 scope.

**Rejected:** B (invent brand), C (portal-only).

---

## 6. Assumptions A1–A5 (until sponsor fills Open Questions §3)

| # | Assumption (temporary SoT) | Override when |
|---|----------------------------|---------------|
| **A1** | Brand = XeVN / X-BOS **ops dual-surface**; primary **`#1E40AF`** | §3 **B1** |
| **A2** | Text sharp locks per skill: body **`#111827`**, secondary **`#4B5563`**, muted **`#6B7280`** placeholder/icon only | §3 **Q2** |
| **A3** | **Ops-dense** — no hero marketing on business modals | §3 **U1** |
| **A4** | Modal chrome = token + typography + **light brand header** — **no** full-bleed image | §3 **U2** |
| **A5** | Stub / `featureInDev` → remaster chrome **and keep** honesty banner | §3 **S3** |

**Font interim (B5 open — historical W0):** keep **Inter** (already wired). Display font change = ADR delta after sponsor answer — do not invent.

**Mood interim (B3 open — historical W0):** logistics sharp / ops-first — not corporate marketing luxury on ATT/EMP dialogs. `.cursorrules` “Apple-style” applies to **layout symmetry + soft shadow**, not pale glass clutter.

> **§16 LOCK (2026-08-05 ~13:44 / Open Q §7.1):** Font interim above is **SUPERSEDED**. Final SoT = display **Montserrat** · body **Source Sans 3**. B3 mood resolved via §15.2 (sắc nét enterprise). See §16.2.

---

## 7. RECOMMENDED token table (copy-ready)

### 7.1 Color / radius / shadow / density

| Token | Hex / value | Use |
|-------|-------------|-----|
| `--xevn-color-primary` | `#1E40AF` | CTA, links, focus brand |
| `--xevn-color-primary-pressed` | `#1E3A8A` | Pressed |
| `--xevn-color-accent` | `#06B6D4` | Focus ring / accent (not purple) |
| `--xevn-color-success` | `#10B981` | DNA Active |
| `--xevn-color-warning` | `#F59E0B` | DNA Pending |
| `--xevn-color-danger` | `#EF4444` | DNA Error |
| `--xevn-color-surface` | `#FFFFFF` | Cards, dialogs |
| `--xevn-color-background` | `#F9FAFB` | Page canvas |
| `--xevn-color-text` | `#111827` | **Body / table cell / readable label** |
| `--xevn-color-text-secondary` | `#4B5563` | Secondary copy |
| `--xevn-color-text-muted` | `#6B7280` | **Placeholder / decorative icon only** |
| `--xevn-color-border` | `#E5E7EB` | Borders |
| `--xevn-color-brand-shell` | `#000000` | Login / splash shell only |
| `--xevn-radius-input` | `8px` | Inputs |
| `--xevn-radius-card` | `12px` | Cards / dialogs |
| `--xevn-shadow-soft` | `0 4px 24px -4px rgba(15, 23, 42, 0.08)` | Cards |
| `--xevn-shadow-overlay` | `0 25px 50px -12px rgba(15, 23, 42, 0.18)` | Modal |
| Density web | portal `--xevn-ui-density` default ~0.9; HRM `html` ~87.5% | Ops density — do not inflate to marketing spacing |
| Type floors web | body ≥15px (prefer 16); table ≥14; title ≥20 bold | Skill lock |
| Type floors mobile | body ≥17 | Skill lock |

### 7.2 `:root` snippet (Dev-FE — keep lockstep)

```css
:root {
  --xevn-color-primary: #1e40af;
  --xevn-color-primary-pressed: #1e3a8a;
  --xevn-color-accent: #06b6d4;
  --xevn-color-success: #10b981;
  --xevn-color-warning: #f59e0b;
  --xevn-color-danger: #ef4444;
  --xevn-color-surface: #ffffff;
  --xevn-color-background: #f9fafb;
  --xevn-color-text: #111827;
  --xevn-color-text-secondary: #4b5563;
  --xevn-color-text-muted: #6b7280;
  --xevn-color-border: #e5e7eb;
  --xevn-color-brand-shell: #000000;
  --xevn-radius-input: 8px;
  --xevn-radius-card: 12px;
  --xevn-shadow-soft: 0 4px 24px -4px rgba(15, 23, 42, 0.08);
  --xevn-shadow-overlay: 0 25px 50px -12px rgba(15, 23, 42, 0.18);
}
```

### 7.3 Tailwind `theme.extend.colors.xevn` (mirror hex)

```js
xevn: {
  primary: '#1E40AF',
  primaryPressed: '#1E3A8A',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  brandShell: '#000000',
}
```

### 7.4 HRM shadcn bridge (must)

| shadcn var | Must equal | Rule |
|------------|------------|------|
| `--primary` | HSL of `#1E40AF` (`226 71% 40%`) | Brand CTA |
| `--foreground` / `--card-foreground` | `#111827` class | Body |
| `--muted-foreground` | **≈ `#4B5563`** (readable secondary) | **Never** body/label via pale slate-400 |
| `--ring` | accent cyan | Focus |

**Law:** `text-muted-foreground` on **body / table label / form label** = **FAIL** pale gate. Allowed: empty-state hint icon, true placeholder, disabled chrome.

---

## 8. Pale-text locks (skill + INC)

| Allowed | Forbidden on readable content |
|---------|-------------------------------|
| `text-xevn-text` / `#111827` | `text-slate-400`, `#9CA3AF`, Gray-400 body |
| `text-xevn-textSecondary` / `#4B5563` | `text-muted-foreground` as table/ops label |
| `text-xevn-textMuted` / `#6B7280` **placeholder/icon only** | Soft AI gray for section titles |

W2 exit: grep/lint gate over inventory surfaces (program W2).

---

## 9. Dual-surface — portal vs HRM embed (iframe)

```text
┌─ Portal shell (web-portal) ─────────────────────────┐
│  Nav / Command Center chrome · brandShell login     │
│  ┌─ iframe / embed HRM ───────────────────────────┐ │
│  │  Light ops canvas · same --xevn-* hex          │ │
│  │  HRM sidebar dark OK · no second primary       │ │
│  │  Modals = ops-dense dialog surface             │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

| Rule | Owner | Detail |
|------|-------|--------|
| **Hex lockstep** | Portal + HRM + Mobile | One primary/text/surface table — no fork |
| **Outside iframe** | Portal | Owns app chrome, safe-inline, CC routes |
| **Inside iframe** | HRM | Owns module nav + dialogs; **must not** re-implement portal top nav |
| **Conflict** | Hex from this ADR wins | Visual “who draws shell” = portal outside / HRM inside; colors never diverge |
| **Dark shell** | Login / splash / brandShell only | Product ops canvases = **light-first** |
| **Module accent chips** | HRM `--hrm-*` HSL | Optional module tint for badges — **not** replacement for `--xevn-color-primary` CTA |

---

## 10. Modal / dialog chrome (ops-dense)

**Pattern (portal utility + HRM Dialog equivalent):**

1. Panel: `bg-surface` `#FFFFFF` · `rounded-card` 12px · `border` `#E5E7EB` · `shadow-overlay`.
2. Title: ≥20px bold · `#111827` — one job.
3. Header brand signal: **thin primary bar** and/or small wordmark — **not** full-bleed photo, **not** glass marketing hero (A4).
4. Body: dense form/table; secondary text `#4B5563`; **no** stats strip / chip cluster “for beauty”.
5. CTA row: primary `#1E40AF` / danger DNA; sticky footer OK with `backdrop-blur` + `bg-surface/80` per `.cursorrules`.
6. Component library: **keep shadcn Dialog** — remap tokens; do not replace with side-sheet/stepper unless inventory + BA AC say so (Open Q §4.5).

Utility reference (portal): `.xevn-dialog-surface`.

---

## 11. must_keep / non-goals

| must_keep | Non-goal |
|-----------|----------|
| No API contract / Nest / Prisma change for “beauty” | New customer brand invent (B1–B5) |
| No SRS FR rewrite for remaster | Purple / cream AI theme |
| Stub / `featureInDev` **honesty banners remain** | Claim Attendance CLOSED via UI polish |
| Scope parity / RBAC / seed locks unchanged | Fake seed for screenshots |
| Primary `#1E40AF` until B1 override | Full-bleed modal heroes |

---

## 12. Rollout / validation

| Step | Owner | Exit |
|------|-------|------|
| W0 this ADR | SA | Accepted + evidence |
| W1 inventory | BA | Surface SoT list |
| W2 theme foundation | Dev-FE | `:root` + Tailwind + shadcn map + pale grep gate PASS |
| W3 squad remaster | Dev-FE batches | Screenshots per inventory batch |
| W4 mobile tokens | Dev-Mobile | Mirror hex + type floors |
| W5 QA/QC | QA → QC | Contrast + density GWC |

**Rollback:** Revert CSS/TW only; no data migration.

**Success:** Grep pale FAIL=0 on remastered paths; 5s brand test = primary `#1E40AF` + sharp text (not purple scaffold).

---

## 13. Next dispatch — FE foundation (W2)

**work_item_id:** `PO-HRM-UI-BRAND-FE-FOUNDATION-01` · **owner:** `dev-fe`

**Entry:** This ADR Accepted · evidence `docs/qa/evidence/po-hrm-ui-brand-adr-01.md`.

**Exit (foundation only — not full remaster):**

1. Restore `scripts/verify-xevn-theme-contrast.mjs` so `pnpm run verify:xevn:theme-contrast` exits **0**.
2. Portal + HRM `:root --xevn-*` + Tailwind `xevn.*` hex **lockstep** with §7 (no invent).
3. HRM shadcn bridge per §7.4; pale ban §8 enforceable on foundation paths.
4. CODE-MEMORY APPEND on `index.css` files — cite **this ADR** (retire missing `ADR-XEVN-THEME-SHARP-OPS-20260722` / proposal paths).
5. Evidence `docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01.md` · `READY_FOR_QA` or `PASS_TO_PM`.

**Cấm:** Nest/API/SRS mutate · seed · W3 screen-by-screen remaster in same Task · claim program DONE.

**Parallel:** BA inventory `PO-HRM-UI-BRAND-BA-INV-01` (does not block W2).

Full copy-ready prompt: evidence §6.

---

## 14. References

- Program: `docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md`
- Open questions: `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_UI_BRAND_OPEN_QUESTIONS.md`
- Skill: `~/.cursor/skills/xevn-precision-motion-theme/SKILL.md`
- `.cursorrules` §2 UI/UX Luxury Style Guide
- Runtime mirrors: `apps/web/web-portal/src/index.css`, `apps/web/hrm/src/index.css`, `apps/mobile/hrm-mobile/src/theme/tokens.ts`
- Enterprise UI research + HTML neo prompts: `docs/program/prompts/CLAUDE_ENTERPRISE_UI_RESEARCH_PROMPT.md`

---

## 15. APPEND — Sponsor fill 2026-08-05 (~13:37) — Open Q §3–§4 + §8

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-ADR-02-APPEND` |
| **Source** | `SPONSOR_UI_BRAND_OPEN_QUESTIONS.md` §3.1–§3.4 · §4 · §8.1–§8.4 |
| **Mode** | **APPEND only** — does **not** wipe §1–§14 hex locks / pale ban / dual-surface hex lockstep |
| **Evidence** | `docs/qa/evidence/po-hrm-ui-brand-adr-02.md` |
| **External consult** | Tham khảo only — **không** SoT; override sponsor → SA APPEND (this section) |

### 15.1 Status of interim assumptions A1–A5

| # | W0 interim (§6) | Sponsor 2026-08-05 | ADR law now |
|---|-----------------|--------------------|-------------|
| **A1 / B1** | XeVN / X-BOS dual-surface | **B1 = XeVN** (portal nội bộ HRM) | **LOCKED** — brand name **XeVN**; hex dual-surface **unchanged** (`#1E40AF` / `#111827`) |
| **A2 / Q2** | Sharp text floors | **Q2 = 12–14px** tối thiểu; sắc nét **đậm** | **LOCKED** — floor web readable ≥12–14px bold/medium; body/table still prefer ≥14–15; muted `#6B7280` placeholder/icon only |
| **A3 / U1** | Ops-dense — **no** hero on business modals | **U1 = hero/visual mạnh trên modal OK** | **SUPERSEDED** — hero/visual **allowed** on modals; still **no** purple/cream/glow AI décor |
| **A4 / U2** | Light brand header — **no** full-bleed / glass marketing | **U2 = glass + full-bleed header brand** (+ token + typography) | **SUPERSEDED** — modal chrome = **glass header + full-bleed brand bar** (see §15.4) |
| **A5 / S3** | Remaster chrome **and keep** honesty | **S3 = A** (FINAL §7.1 ~13:44) | **LOCKED** via **§16** — remaster chrome brand + keep honesty banner / disabled (**not** invent LIVE) |

### 15.2 Brand locks (B1–B5)

| ID | Lock | Notes |
|----|------|-------|
| **B1** | Brand chính = **XeVN** | Portal nội bộ HRM; không đổi sang X-BOS-only naming trên modal chrome |
| **B2** | **Wordmark bắt buộc trên mọi modal** | Logo nhỏ **trái** + viền/thanh brand đầu modal (align **Q1**) |
| **B3** | Mood = **sắc nét enterprise** | **Bỏ cực cứng** «Apple luxury» vs «ops 1000 NV»; chọn pattern enterprise hợp lý (Prompt 1 research) |
| **B4** | **Cấm** palette AI | Tím→indigo gradient · cream+serif+terracotta · glow/neon/blur quá đà (§8.1). Primary giữ `#1E40AF` · text `#111827` — **CONFIRMED FINAL** §16 / Open Q §7.1 |
| **B5** | Display = **Montserrat** (SemiBold–Bold) | Body = **Source Sans 3** (**LOCKED** §16) — candidates B/C retired |

**B5 body — historical candidates (superseded by §16 LOCKED = A):**

| Option | Font | License | Disposition |
|--------|------|---------|-------------|
| **A** | **Source Sans 3** Regular/Medium | Google Fonts OFL | **LOCKED FINAL** (sponsor §7.1 ~13:44) |
| **B** | **Be Vietnam Pro** | OFL | Not selected |
| **C** | **IBM Plex Sans** | OFL | Not selected |

**Font SoT (after §16):** Display **Montserrat** · Body **Source Sans 3** (Google Fonts OFL). Dev-FE wires both; Inter demoted from interim body.

### 15.3 UX density / “bắt mắt” (U1–U4)

| ID | Lock |
|----|------|
| **U1** | Hero / visual mạnh trên modal = **OK** (không bắt buộc mỗi dialog; khi dùng phải brand-aligned, không AI glow) |
| **U2** | Ưu tiên **glass + full-bleed header brand** (+ token màu + typography) |
| **U3** | **Được** giảm / gộp field để đẹp hơn; dialog **mở rộng** khi nhiều thông tin; input/select **compact theo độ dài ký tự thực tế** (không full-width mù) |
| **U4** | Mobile driver app = **cùng brand system** với web HRM (hex + chrome law + type floors mobile ≥17 vẫn giữ) |

### 15.4 Modal chrome law (overrides §10 items 3–4 & 6 — APPEND)

**Anatomy (Prompt 3 / enterprise dialog spirit):**

1. **Full-bleed brand header** — thanh/viền xanh primary đầu modal (`#1E40AF`) edge-to-edge trong panel.
2. **Wordmark / logo nhỏ trái** + title Montserrat ≥20 bold `#111827`.
3. **Glass** — `backdrop-blur` + surface translucent trên header/sticky footer OK; **cấm** purple glow / neon blur.
4. Body: enterprise density hợp lý — field width theo loại dữ liệu (ngày/số/mã ngắn · textarea lý do rộng); dialog **wide** khi form dài (U3).
5. Optional hero/visual zone dưới header (U1) — một neo visual, không chip/stat strip giả sang.
6. CTA row sticky OK (`bg-surface/80` + blur).
7. **Component library:** **được thay** shadcn/Dialog/lib nếu UX chuyên nghiệp hơn (Radix/vaul/Base UI/…) — **bố cục nghiệp vụ / field order / API contract giữ** (`must_keep` nghiệp vụ).
8. **QA 5s brand (Q1):** screenshot modal → nhận **viền xanh đầu** + **logo trái**.

§10 item «keep shadcn Dialog — remap tokens only» → **relaxed** by §15.4.7 (replace OK for UX; no API/SRS smash).

### 15.5 Scope / sequencing (S1–S4) + §4 governance

| ID | Lock |
|----|------|
| **S1** | Team tự kế hoạch; **làm hết**; **squad song song** nhiều màn |
| **S2** | **LOCKED §16** — remaster **cả 90** ATT surfaces (batch A…G2 song song); SKIP nhận **S3=A** chrome+honesty — **không** invent LIVE |
| **S3** | **LOCKED §16 = A** — remaster chrome brand + giữ honesty banner / disabled |
| **S4** | **Có** — HTML/Figma neo **trước** Dev-FE foundation/remaster tiếp (pipeline Open Q §5 · §7.1) |
| **D7 vs UI** | **Song song** — UI remaster **không** chờ khóa giấy tuyệt đối |
| **Brand ownership** | Brand = **portal chrome**; wordmark/viền trên modal trong HRM **embed** vẫn theo XeVN |
| **Tư vấn ngoài** | Tham khảo only — SoT = ADR này (+ APPEND §15 + LOCK §16) |

### 15.6 S3 — historical PENDING (superseded by §16 LOCKED = A)

| Option | Meaning | Disposition |
|--------|---------|-------------|
| **A — Remaster chrome + honesty** | Viền xanh + logo + typography; giữ banner «Chưa mở / GĐ2» / disabled | **LOCKED FINAL** (§16 / Open Q §7.1) |
| **B — Xám honesty** | Ít brand trên stub | **Not selected** |

### 15.7 must_keep / cấm (APPEND — additive)

| must_keep | Cấm tuyệt đối |
|-----------|---------------|
| Hex primary `#1E40AF` · text `#111827` · pale ban §8 | Claim **remaster DONE** / Attendance **CLOSED** / Face **LIVE** / product GO từ UI polish |
| Nghiệp vụ field/API/SRS đã chốt | Invent LIVE capability on SKIP / stub surfaces |
| Stub honesty visible (**S3=A**) | Palette AI tím/cream/glow (**B4 CONFIRMED**) |
| HTML neo trước Dev-FE (S4) khi wave neo | Seed để screenshot «đạt» |
| Mobile cùng brand (U4) · fonts Montserrat + Source Sans 3 | Đập layout nghiệp vụ khi thay component |

### 15.8 Next dispatch (after ADR-02 — historical; see §16.5 for current)

| Priority | work_item_id | Owner | Exit |
|----------|--------------|-------|------|
| P0 | `PO-HRM-UI-BRAND-HTML-NEO-01` | `ba-docs` | Prompt 1 research + Prompt 2 HTML neo — **DONE** (bus 2026-08-05) |
| P1 | Sponsor one-liner B5/S3 | Sponsor / PM | **DONE** §7.1 ~13:44 → **§16 LOCK** |
| P2 | Dev-FE after HTML neo | `dev-fe` | Wire Montserrat + Source Sans 3 + dialog chrome §15.4 / §16 — **không** claim remaster DONE |

**Cấm claim:** remaster program DONE · Attendance CLOSED · Face LIVE.

---

## 16. LOCK — Sponsor FINAL 2026-08-05 (~13:44) — Open Q §7.1

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-ADR-03-LOCK` |
| **Source** | `SPONSOR_UI_BRAND_OPEN_QUESTIONS.md` **§7.1** (+ §3.1 B4/B5 · §3.3 S2/S3) |
| **Mode** | **APPEND LOCK only** — does **not** wipe §1–§15 · hex SoT · pale ban · dual-surface · modal anatomy §15.4 |
| **Prior** | §15 PENDING (B5 body · S3 A/B · S2 wording) → **CLOSED** |
| **Evidence** | `docs/qa/evidence/po-hrm-ui-brand-adr-03.md` |

### 16.1 Final locks (no PENDING remaining on brand Open Q)

| Lock | Value | ADR disposition |
|------|-------|-----------------|
| **B4** | **CONFIRMED** — **cấm** AI purple–indigo / cream–terracotta / glow | Reinforces §8 + §15.2 B4 — **hard law** for Dev/QA/QC |
| **B5 body** | **Source Sans 3** (final) + display **Montserrat** | **LOCKED** — retire Inter as interim body; OFL Google Fonts |
| **S3** | **A** — chrome brand + honesty (final) | **LOCKED** — remaster stub chrome; **keep** banner / disabled; **cấm** invent LIVE |
| **ATT scope** | Remaster **all 90** surfaces | **LOCKED** — batch A…G2 song song; SKIP surfaces get **S3=A** chrome+honesty only |
| **Pipeline** | HTML neo → FE squad parallel · libs OK if research chốt | **LOCKED** — Radix / cmdk / vaul / Base UI OK when research SoT chốt; **no** API/SRS smash |

### 16.2 Font stack (final SoT)

| Role | Font | Weight hint | License |
|------|------|-------------|---------|
| **Display / title / wordmark chrome** | **Montserrat** | SemiBold–Bold | Google Fonts OFL |
| **Body / table / form** | **Source Sans 3** | Regular / Medium | Google Fonts OFL |

**Law:** Type floors unchanged (Q2: readable ≥12–14px sắc nét; mobile body ≥17). Pale ban §8 still applies regardless of font family.

### 16.3 Stub / SKIP surface law (S3=A + ATT 90)

```text
Surface LIVE (API + AC)     → full remaster chrome + ops UX
Surface SKIP / stub / HOLD  → remaster chrome (viền xanh + logo + fonts)
                            → honesty banner «Chưa mở / GĐ2» + disabled CTAs
                            → FORBIDDEN: invent Face LIVE / fake attendance CLOSED
```

| Rule | Detail |
|------|--------|
| **90 surfaces** | Inventory sâu S01–S90 — **in-scope remaster** = all 90 under S3=A for SKIP rows |
| **Honesty** | Banner + disabled stay visible — brand polish ≠ capability claim |
| **QA** | 5s brand (Q1) still required on stub chrome; capability claims = separate UF / J-* |

### 16.4 must_keep / cấm (LOCK — additive)

| must_keep | Cấm tuyệt đối |
|-----------|---------------|
| Hex `#1E40AF` / `#111827` · pale ban · dual-surface lockstep | Wipe ADR §1–§15 · invent second palette |
| Montserrat + Source Sans 3 | Claim **remaster DONE** / Attendance **CLOSED** / Face **LIVE** |
| S3=A honesty on stubs/SKIP | Invent LIVE UX on SKIP surfaces |
| HTML neo → FE foundation → squad parallel | Seed for «đạt» screenshots |
| Lib swap OK (research-chốt) without API/SRS change | Đập field order / Nest contracts |

### 16.5 Next dispatch (after this LOCK)

| Priority | work_item_id | Owner | Exit |
|----------|--------------|-------|------|
| P0 (in flight) | `PO-HRM-UI-BRAND-FE-DIALOG-01` | `dev-fe` | Dialog chrome wire Montserrat + Source Sans 3 + §15.4/§16; evidence `po-hrm-ui-brand-fe-dialog-01.md` |
| P1 | FE foundation / remaining chrome | `dev-fe` | Theme lockstep + pale gate; **không** claim remaster DONE |
| P2 | Squad parallel ATT 90 + REC/PAY/EMP/portal/mobile | `dev-fe` batches (+ `dev-mobile` tokens) | Batch evidence; SKIP = S3=A only |
| P3 | QA brand gate | `qa` | Q1 5s + Q2 contrast; stub honesty still visible |

**Cấm claim:** remaster program DONE · Attendance CLOSED · Face LIVE · invent LIVE on SKIP.
