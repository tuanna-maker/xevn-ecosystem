# ADR: XeVN Theme — Sharp text · Ops-first density (web + mobile)

| Field | Value |
|-------|--------|
| **ADR-ID** | `ADR-XEVN-THEME-SHARP-OPS-20260722` |
| **work_item_id** | `XEVN-THM-SA-01` |
| **Status** | **Accepted** (sponsor APPROVED brand + remaster program) |
| **Date** | 2026-07-22 |
| **Decision owner** | SA |
| **Program** | [`P1-XEVN-THEME-REMASTER-PROGRAM.md`](../program/P1-XEVN-THEME-REMASTER-PROGRAM.md) |
| **Brand SoT** | [`XEVN_BRAND_UIUX_PROPOSAL.md`](../program/XEVN_BRAND_UIUX_PROPOSAL.md) — **APPROVED-SPONSOR** |
| **Locks** | **L-CONTRAST** · **L-TYPE** · **L-OPS** · L-THEME · L-SCOPE |
| **Consumers** | `XEVN-THM-FE-00` · `XEVN-THM-MOB-00` (authoritative for token implement) |
| **Non-goals** | No SRS/API change · no `apps/**` in this ADR · NOT Phase 1 DONE |

---

## 1. Decision context

Sponsor approved **XeVN Precision Motion** and ordered a **full theme remaster** of every web + mobile screen: chữ **sắc nét**, **cấm** chữ nhạt / cỡ nhỏ kiểu AI SaaS, **ít chrome thừa**, focus nghiệp vụ.

**AS-IS drift (fact):** portal `tailwind.config.cjs` and mobile `theme/tokens.ts` still ship `text: #1F2937` and `textSecondary: #6B7280`. HRM web leans on shadcn `text-muted-foreground` + frequent `text-xs` on ops chrome. That violates L-CONTRAST / L-TYPE for readable ops content.

**Failure if unresolved:** FE-00 / MOB-00 invent parallel hex; pale slate returns; QA cannot gate; brand proposal §3 and runtime tokens diverge again.

---

## 2. Problem to solve

| Class | Symptom | Architecture gap |
|-------|---------|------------------|
| Contrast | Body/label looks “AI gray” on `#F9FAFB` | Secondary/muted used for **readable** content |
| Type | Dense tables / chips at `text-xs` / 11–12px | No enforceable type floor for ops surfaces |
| Ops density | Stats strips / chip clusters / marketing chrome | No L-OPS layout contract |
| Dual SoT | Portal Tailwind ≠ HRM CSS vars ≠ RN `tokens.ts` | L-THEME broken |

**Constraints:** Light-first product (`.cursorrules` §2); dark **only** brand shell (login/splash/HTML cover); mobile touch ≥44; vi-VN date/number format unchanged; U65 zero-seed for QA.

---

## 3. Options

### Option A — Recommend: Single token SoT + sharp floors + grep gate

- One authoritative token table (this ADR + brand proposal §3).
- Web: CSS vars → Tailwind `xevn.*` → HRM shadcn bridge maps `--foreground` / `--muted-foreground` to XeVN floors.
- Mobile: `tokens.ts` mirrors same hex; typography floors from L-TYPE.
- CI/dev grep gate fails pale ops classes (allowlist for icons/placeholders only if needed).

### Option B — Soften secondary only; keep `#6B7280` as secondary

- Benefits: smaller diff.
- Risks: sponsor L-CONTRAST FAIL; muted and secondary collide; “nhạt” returns on tables.

### Option C — Full dark product theme

- Rejected — breaks light-first ops density and Luxury Style Guide.

### Trade-off

| Criteria | A | B | C |
|----------|---|---|---|
| Sponsor L-CONTRAST/TYPE/OPS | ✅ | ❌ | ❌ |
| Time to deliver W0–W1 | Medium | Fast | High |
| Maintainability (one SoT) | ✅ | Weak | N/A |
| Regression risk login/UF | Contained (token swap) | Low | High |

**Decision:** **Option A.**

**Assumptions:** FE-00 / MOB-00 consume this ADR as SoT without inventing a second palette; BA inventory (`XEVN-THM-BA-01`) tags ops vs chrome surfaces for L-OPS AC.

---

## 4. Decision — Token table (authoritative)

> Hex below are **law**. Hardcoded drift hex in screens must migrate to tokens (W1/W2), not the reverse.

### 4.1 Color — text & surface (sharp ops)

| Token | Hex | CSS var | Web (Tailwind / utility) | Mobile (`tokens.ts`) | Allowed use |
|-------|-----|---------|--------------------------|----------------------|-------------|
| **text** (body primary) | **`#111827`** | `--xevn-color-text` | `xevn-text` / `text-xevn-text` | `colors.text` | Body, table cell values, page titles, primary labels |
| **textSecondary** | **`#4B5563`** | `--xevn-color-text-secondary` | `xevn-textSecondary` | `colors.textSecondary` | Supporting readable copy, form hints that must still be read, secondary columns |
| **textMuted** | **`#6B7280`** | `--xevn-color-text-muted` | `xevn-textMuted` | `colors.textMuted` | **ONLY** placeholder text, decorative/disabled icons, non-readable chrome meta |
| Primary | `#1E40AF` | `--xevn-color-primary` | `xevn-primary` | `colors.primary` | CTA, links, mark |
| Primary pressed | `#1E3A8A` | `--xevn-color-primary-pressed` | (extend) | `primaryPressed` | Pressed |
| Accent | `#06B6D4` | `--xevn-color-accent` | `xevn-accent` | `accent` | Focus ring |
| Success / Warning / Danger / Info | `#10B981` / `#F59E0B` / `#EF4444` / `#3B82F6` | `--xevn-color-*` | `xevn-*` | same keys | DNA status — **icon + text**, not color-only |
| Surface | `#FFFFFF` | `--xevn-color-surface` | `xevn-surface` | `surface` | Cards / forms |
| Background | `#F9FAFB` | `--xevn-color-background` | `xevn-background` | `background` | App canvas |
| Border | `#E5E7EB` | `--xevn-color-border` | `xevn-border` | `border` | Dividers |
| Brand shell | `#000000` | `--xevn-color-brand-shell` | utility | splash `#000` | Login / splash / HTML dark cover only |

**L-CONTRAST floor (ops readable content):** never lighter than **`#4B5563`** for body, labels, or table cells. Prefer **`#111827`** for primary body. Program lock “≥ `#374151`” is the **minimum**; SoT tokens above **supersede** and are stricter for primary body.

**Muted contract:** `textMuted` / shadcn `muted-foreground` **must resolve to `#6B7280` max lightness for placeholders only**. Mapping `muted-foreground` → body/label is a **defect**.

### 4.2 Radius · shadow · spacing (unchanged brand)

| Token | Value |
|-------|--------|
| Radius input | `8px` → `rounded-input` / `radius.input` |
| Radius card | `12px` → `rounded-card` / `radius.card` |
| Shadow soft | `0 4px 24px -4px rgba(15,23,42,0.08)` |
| Safe inline | `.xevn-safe-inline` (web); mobile `screenPaddingH` 16 |

### 4.3 Typography floors (L-TYPE)

| Surface | Web floor | Mobile floor | Weight / notes |
|---------|-----------|--------------|----------------|
| Page title | **≥ 20px** bold/semibold | `title2`/`title1` (≥20) | Header axis `h-10` with search |
| Body (ops) | **≥ 15px** (prefer **16px** = `text-base`) | **≥ 17** (`body`) | Primary readable content |
| Table cell / list value | **≥ 14px** | **≥ 15** callout/subhead | Tabular nums for money |
| Form label | **≥ 14px** medium | **≥ 15** / footnote **13** only for field chrome | Label color ≥ `#4B5563` |
| Caption / badge meta | ≥ 12px | caption **12** / tabLabel **10** (tab bar only) | Not for primary ops sentences |
| **Forbidden ops** | `text-xs` (12px), `text-[11px]`, `text-[10px]` on body/label/table | fontSize &lt; 13 on ops body | See ban list §5 |

Family: web Inter + system; mobile System/SF; HTML cover may use Be Vietnam Pro (docs only).

### 4.4 L-OPS layout contract (ops screens)

Each **tác nghiệp** screen MUST present:

1. **One** clear page title (axis with search/filter if present).
2. **One** primary data region (table / form / master–detail pane).
3. **Clear primary CTA** (create / save / approve) — not buried in chip clusters.

**Reduce / defer:** marketing stats strips, decorative pill clusters, emoji chrome, multi-metric “dashboard hero” above forms. Sidebar secondary metrics may collapse. Empty/loading/error remain mandatory (a11y) but without pale micro-type.

---

## 5. Ban list (FAIL gate)

### 5.1 Color / class bans on **ops readable** content

| Ban | Why | Allowed exception |
|-----|-----|-------------------|
| `text-slate-400`, `text-gray-400`, `text-slate-500` (body/label/cell) | Below L-CONTRAST | None for readable text |
| Hex `#9CA3AF`, `#9CA3AF`-class neutrals for body | Pale AI gray | None |
| `text-muted-foreground` for **labels, table cells, body, section titles** | Muted ≠ readable | Placeholder / icon-only chrome after bridge maps muted → `#6B7280` and usage audited |
| Using `xevn-textMuted` / `colors.textMuted` for labels | Violates muted contract | Placeholder / disabled icon |
| Keeping AS-IS `#1F2937` as “text” token | Superseded by `#111827` | Migrate in FE-00 / MOB-00 |
| Keeping AS-IS `#6B7280` as **textSecondary** | Superseded by `#4B5563` | `#6B7280` demoted to **muted only** |

### 5.2 Type bans on ops

| Ban | Why | Exception |
|-----|-----|-----------|
| `text-xs` on body, form label, table cell, primary list row title | L-TYPE | Badge count, chart axis tick, legal footnote ≤1 line |
| `text-[11px]`, `text-[10px]`, `text-[9px]` on ops UI | AI micro-type | None on ops |
| Mobile body &lt; 17 for primary content | HIG + L-TYPE | caption/tabLabel only |

### 5.3 Visual / chrome bans (brand + L-OPS)

- Purple SaaS gradients, cream–terracotta kits, pill clusters as primary nav.
- Emoji as structural chrome.
- Dark mode as default product chrome (dark = brand shell only).
- UNICOM logo as XeVN hero (HTML P0 — separate work item).

---

## 6. Web + mobile implementation map

```text
                    ┌─────────────────────────────────────┐
                    │  ADR + Brand proposal §3 (SoT hex)   │
                    └─────────────────┬───────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
   web-portal CSS :root      HRM web shadcn bridge     hrm-mobile tokens.ts
   --xevn-color-*            map --foreground → text   colors.text = #111827
   Tailwind xevn.*           --muted-foreground →      colors.textSecondary =
   Login dark shell only       muted (#6B7280) ONLY      #4B5563
                             body/label → text /         colors.textMuted =
                               textSecondary               #6B7280 (new key if
                                                           missing)
```

| Layer | Path (implement owners) | Must converge |
|-------|-------------------------|---------------|
| Portal tokens | `apps/web/web-portal/tailwind.config.cjs` + `src/index.css` `:root` | `text #111827`, `textSecondary #4B5563`, add `textMuted #6B7280` |
| Portal chrome | `TopHeader`, `LoginPage` | Brand shell dark; mark; no pale nav labels |
| HRM web | `apps/web/hrm` theme / CSS vars / Tailwind | Bridge shadcn; replace ops `text-xs`+muted body |
| X-BOS / CC panels | portal settings / CC | Same `xevn.*` — no second palette |
| Mobile tokens | `apps/mobile/hrm-mobile/src/theme/tokens.ts` | Mirror hex; bump body 17; secondary `#4B5563` |
| Mobile screens | `src/features/**`, shared UI | Consume tokens only; touch ≥44 |
| Docs HTML | `docs/client-delivery/**` | Accent `#1E40AF`→`#06B6D4`; XeVN mark (P0 ba-docs) |

**Bridge rule (HRM shadcn):**  
`--foreground` → `#111827`; `--muted-foreground` → `#6B7280` **and** FE remaster must not use muted class on ops readable nodes (prefer explicit `text-foreground` / `xevn-textSecondary`).

---

## 7. Grep gate suggestion (FE-00 deliverable)

Implement as `pnpm` script (name suggestive): `verify:xevn:theme-contrast` (or under existing verify suite).

### 7.1 Fail (default — ops globs)

Scan `apps/web/web-portal/src/**`, `apps/web/hrm/src/**`, `apps/mobile/hrm-mobile/src/**` (tsx/ts/css):

```text
FAIL if match (content classes / style literals):
  text-slate-400|text-gray-400|text-slate-500
  #9CA3AF|#9ca3af
  text-\[1[01]px\]|text-\[9px\]
```

Optional stronger (wave W1+ after foundation):

```text
WARN/FAIL on ops paths:
  \btext-xs\b   (allowlist: **/ui/badge*, chart*, **/marketing* if any)
```

### 7.2 Token drift check

```text
FAIL if tailwind xevn.text / tokens colors.text ≠ #111827
FAIL if textSecondary ≠ #4B5563
FAIL if text (secondary role) still #6B7280 in token files
```

### 7.3 Allowlist file (optional)

`docs/architecture/theme-contrast-allowlist.txt` — path+reason+owner+expiry for true exceptions (icon-only, third-party). **No blanket allowlist** for `Recruitment.tsx`-style muted body.

### 7.4 Exit for FE-00

- CSS vars + Tailwind + HRM bridge + mobile tokens updated to §4.
- Grep script exits **0** on clean token files; residual ops class hits listed with owner wave (W1/W2), not “ignored forever”.

---

## 8. Rollout & validation

| Step | Owner | Checkpoint |
|------|-------|------------|
| W0 SoT (this ADR) | SA | **Done** — FE/MOB treat as law |
| FE-00 foundation | dev-fe | Tokens live; grep gate script; HRM bridge |
| MOB-00 foundation | dev-mobile | `tokens.ts` + ThemeProvider parity |
| W1 / W2 remaster | FE / Mobile squads | L-CONTRAST/TYPE/OPS per inventory |
| W3 | QA / qa-device / QC | Contrast spot + brand test login/splash |

**Rollback:** revert token file + CSS var commit; screens keep previous classes until re-applied — prefer forward-fix pale hits.

**Success criteria:**

1. Single SoT hex for text / secondary / muted across web+mobile token files.
2. Grep gate green on token layer; ops ban list trending to zero per inventory.
3. Ops screen sample: body ≥15px web / ≥17 mobile; no slate-400 body.
4. **NOT** claimed as Phase 1 product DONE.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| HRM shadcn HSL theme fights hex | Bridge once in FE-00; forbid dual invent |
| Mass `text-xs` churn | Ban on **new** + batch remaster by route inventory (BA-01) |
| Mobile secondary bump darkens chrome | Visual QA-device; keep muted for placeholders |
| Proposal §3 vs runtime drift | This ADR is **runtime law**; proposal §3 aligned 2026-07-22 |

---

## 10. References

- Brand proposal §3: `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md`
- Remaster program locks: `docs/program/P1-XEVN-THEME-REMASTER-PROGRAM.md`
- Mobile DS (typography structure; **contrast hex superseded** by this ADR): `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md`
- Luxury UI: `.cursorrules` §2
- A11y: `.cursor/rules/uiux-quality-accessibility.mdc`
- Logo sync: `assets/brand/README.md`

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | PM → ensure FE-00 / MOB-00 consume this ADR (already running) |
| **evidence_path** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` |

*Document owner: Solution Architect · XEVN-THM-SA-01 · 2026-07-22*
