# Evidence — PO-HRM-UI-BRAND-ADR-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-ADR-01` |
| **Role** | SA |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · Wave **W0** |
| **ack_status** | **PASS_TO_PM** |
| **ADR** | [`docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md`](../../architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md) |
| **Cấm** | `apps/**` implement (honored — docs only) |

---

## 1. Intake / why RE-KICK

Prior seat stalled with **evidence MISS**. Repo audit this seat:

| Expected legacy SoT | Status 2026-08-05 |
|---------------------|-------------------|
| `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` | **MISSING** |
| `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` | **MISSING** |
| `.cursor/rules/xevn-theme-sharp-ops.mdc` | **MISSING** |
| `scripts/verify-xevn-theme-contrast.mjs` | **MISSING** (`package.json` still lists `verify:xevn:theme-contrast`) |
| Runtime `--xevn-*` portal/HRM CSS + mobile `tokens.ts` | **PRESENT** (hex = skill Precision Motion) |

**Conclusion:** Re-establish **living ADR** as governance SoT. W2 restores contrast gate + CODE-MEMORY pointers — **does not invent** a second palette.

---

## 2. Read set

| Artifact | Used |
|----------|------|
| `docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md` | W0–W5 · A1–A5 |
| `xevn-precision-motion-theme` skill | Sharp locks · pipeline |
| `SPONSOR_UI_BRAND_OPEN_QUESTIONS.md` | §3 open · §4 conflicts |
| `_vibe-team-os/17-BRAND-UIUX-THEME-REMASTER.md` | Theme before remaster |
| `INC-AI-PALE-TEXT-CLUTTER-UX` | Pale ban class |
| Case `BRAND-UIUX-CASE.md` | Prior XeVN pattern |
| Portal/HRM `index.css` + mobile `tokens.ts` | Fact: hex already locked |

---

## 3. Option evaluation

| Option | Verdict |
|--------|---------|
| **A** Re-lock Precision Motion (existing hex) + dual-surface embed + pale ban + A1–A5 | **ACCEPTED** |
| **B** Invent new customer brand now (as if B1–B5 filled) | **Rejected** — Open Q blank |
| **C** Portal-only; defer HRM iframe remaster | **Rejected** — breaks UI-2 |

Matrix: ADR §3. Decision rationale: ADR §5.

---

## 4. Decisions locked

1. SoT = `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` (supersedes missing 2026-07-22 citations).
2. Hex: primary `#1E40AF` · text `#111827` · secondary `#4B5563` · muted `#6B7280` placeholder-only · brand-shell `#000000` · accent `#06B6D4`.
3. Assumptions **A1–A5** bind until Open Questions §3 filled (override = ADR APPEND).
4. Dual-surface: portal outside chrome / HRM inside iframe — **hex lockstep** (ADR §9).
5. Modal = ops-dense + light brand header — no full-bleed hero (ADR §10 · A4).
6. Keep shadcn Dialog; remap tokens only (ADR §10.6).
7. UI-only parallel MVP — no API/SRS/DB; honesty stubs remaster chrome (A5).
8. W2 must restore `scripts/verify-xevn-theme-contrast.mjs`.

---

## 5. Closed / residual

### Closed

- [x] ADR Accepted under `docs/architecture/`
- [x] Evidence this file (RE-KICK exit)
- [x] Program exit W0 checkbox + Open Questions SoT pointer
- [x] ADR §13 next_dispatch FE foundation
- [x] `apps/**` untouched

### Residual

| ID | Item | Owner WI |
|----|------|----------|
| R1 | BA inventory all surfaces | `PO-HRM-UI-BRAND-BA-INV-01` |
| R2 | FE foundation + pale gate restore | `PO-HRM-UI-BRAND-FE-FOUNDATION-01` |
| R3 | Sponsor §3 Open Q → ADR APPEND | Sponsor / PM → SA |
| R4 | Squad remaster W3 | After W1+W2 |

---

## 6. Handoff contract

```yaml
work_item_id: PO-HRM-UI-BRAND-ADR-01
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-adr-01.md
completion_report: |
  W0 CLOSED — ADR Precision Motion tokens Accepted (Option A).
  Replaces missing 2026-07-22 ADR/proposal SoT.
  A1–A5 until Open Questions §3; dual-surface + modal chrome locked.
  No apps/**.
next_owner: pm
pm_dispatch_hint: PO-HRM-UI-BRAND-FE-FOUNDATION-01 — W2 theme foundation (+ parallel BA-INV)
```

### next_dispatch_prompt (PM → dev-fe) — copy-ready

```text
work_item_id: PO-HRM-UI-BRAND-FE-FOUNDATION-01
role: dev-fe
lane: execution · UI-only · cấm Nest/API/SRS mutate · cấm seed (U65)

read_first:
  1. docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md (§6–§13)
  2. docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md
  3. docs/qa/evidence/po-hrm-ui-brand-adr-01.md
  4. skill xevn-precision-motion-theme

spec_read_ack:
  adr: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §7 token · §8 pale · §9 dual-surface · §10 modal
  program: HRM_UI_BRAND_REMASTER_PROGRAM W2
  change_mode: FIX/UPGRADE foundation
  code_memory_required: true
  code_memory_mode: APPEND — retarget missing ADR-XEVN-THEME-SHARP-OPS-20260722 / XEVN_BRAND_UIUX_PROPOSAL → ADR-20260805

allowed_paths:
  - apps/web/web-portal/src/index.css
  - apps/web/hrm/src/index.css
  - apps/web/**/tailwind.config.* (only if xevn.* hex drift)
  - scripts/verify-xevn-theme-contrast.mjs  (RESTORE — MISSING)
  - package.json (script path fix only if needed)
  - docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01.md
  - .cursor/rules/xevn-theme-sharp-ops.mdc (optional restore → cite new ADR)

forbidden_paths:
  - apps/api/**
  - **/prisma/**
  - W3 screen remaster batches
  - seed scripts

must_keep:
  - primary #1E40AF · text #111827 · secondary #4B5563 · muted placeholder-only
  - radius card 12 / input 8
  - featureInDev / honesty banners
  - no purple/cream AI theme

exit_criteria:
  1. scripts/verify-xevn-theme-contrast.mjs exists; pnpm run verify:xevn:theme-contrast exit 0
  2. Portal + HRM :root --xevn-* hex == ADR §7
  3. HRM --muted-foreground == readable secondary (§7.4) — not slate-400 body
  4. CODE-MEMORY APPEND cites ADR-20260805
  5. Evidence po-hrm-ui-brand-fe-foundation-01.md + gate log
  6. READY_FOR_QA or PASS_TO_PM — cấm claim full remaster DONE

evidence_path: docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01.md
```

### Parallel BA (optional)

```text
work_item_id: PO-HRM-UI-BRAND-BA-INV-01
role: ba-process
Inventory mọi màn/popup ATT+EMP+REC/PAY+portal. Cite ADR §8 ban + A3 density AC.
evidence_path: docs/qa/evidence/po-hrm-ui-brand-ba-inv-01.md
Exit: screen_id · route · P0/P1 · batch id → PASS_TO_PM
```

---

## 7. SA validation

| Check | Result |
|-------|--------|
| ADR Option A/B/C + matrix | PASS |
| Token table + pale ban + dual-surface + modal | PASS |
| A1–A5 map Open Q | PASS |
| Evidence path (this file) | PASS |
| next_dispatch FE foundation | PASS |
| apps/** untouched | PASS |
| Contrast script present | FAIL → R2 W2 |
)
