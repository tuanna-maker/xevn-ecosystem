# QC Gate — XEVN-THM-QC-FE-W1-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-QC-FE-W1-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` (ICT ~22:25–22:35) |
| **program** | `P1-XEVN-THEME-REMASTER` |
| **ack_status** | **PASS_TO_PM** |
| **gate_verdict** | **GO WITH CONDITIONS** |
| **scope** | Portal FE-W1 P0 theme ONLY — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full remaster DONE |
| **entry** | `XEVN-THM-QA-W1` PASS_TO_PM · `docs/qa/evidence/xevn-thm-qa-w1-20260722.md` (+ Dev `xevn-thm-fe-w1-20260722.md`) |
| **runtime_SoT** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` (**Accepted**) · inventory FE-W1 P0 |
| **U65** | zero-seed — QC sample source + contrast gate only; **no** `pnpm seed:*`; QC did **not** edit `apps/**` |
| **PORTAL_DEV_URL** | Local SoT `http://localhost:5173` (QA) · QC source audit on FE-W1 tree |
| **api_base** | N/A for theme chrome sample (no mutate) |

---

## Scope (bounded — FE-W1 portal P0 theme)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Sample audit TopHeader mark≥40 + wordmark «XeVN» | Phase1 / PROD DONE claim |
| CC settings labels not pale (xevn tokens) | Full remaster / density P1–P2 inventory |
| `verify:xevn:theme-contrast` exit 0 · debt ≤16 | Seed · QC code edits `apps/**` |
| GWC OK: title «X-BOS Unified Portal» P1; `:8088` deploy lag | Claiming VPS `:8088` already remastered |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/xevn-thm-fe-w1-20260722.md` | Dev-FE | `READY_FOR_QA` — TopHeader remaster; portal pale cleared; baseline drop |
| `docs/qa/evidence/xevn-thm-qa-w1-20260722.md` | QA | `PASS_TO_PM` **PASS** — browser TopHeader + CC settings + contrast debt 0 |
| `docs/qa/evidence/xevn-theme-contrast-baseline.json` | Gate SoT | `hitCount=0` · `work_item_id=XEVN-THM-FE-W1-HRM` |
| ADR Sharp Ops | SA SoT | sharp text tokens; ops density; brand mark |

---

## Micro-checklist (≤5 exit_criteria)

| # | Exit criteria | QC method | Observed | Result |
|---|---------------|-----------|----------|--------|
| **1** | TopHeader mark ≥40 + wordmark «XeVN» brand test | Read `TopHeader.tsx` | `data-testid=portal-brand-mark`; `img` `h-10 w-10` + `width={40}` `height={40}`; wordmark span **XeVN** `text-xevn-text`; sticky `h-14` `bg-xevn-surface/80 backdrop-blur-md` | **PASS** |
| **2** | CC settings labels not pale (xevn tokens) | Spot `settings-form-pattern.tsx` + CC panels + rg pale ban | Captions/labels use `text-xevn-text` / `textSecondary` / `textMuted`; portal `text-slate-400\|gray-400\|slate-300` = **0** hits | **PASS** |
| **3** | `verify:xevn:theme-contrast` exit 0 · debt ≤16 | Independent re-run | scanned 715; pale hits=0; **debt 0 ≤ baseline 0** (also ≤16); exit **0** | **PASS** |
| **4** | GO / GWC — title polish + `:8088` lag OK | Adjudication | Product P0 **1–3 PASS**; title «X-BOS Unified Portal» = **C1**; VPS lag = **C2** per PM exit | **GWC** |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | QC finding |
|--------|-------|------------|
| TopHeader mark 40 + wordmark XeVN | **PRODUCT** | **PASS** |
| CC settings / form pattern xevn tokens | **PRODUCT** | **PASS** |
| Theme contrast debt 0 | **PRODUCT** | **PASS** |
| CC page title «X-BOS Unified Portal» | **PRODUCT-P1 residual** | **Condition OK** — dual naming vs TopHeader «XeVN»; not FAIL this wave |
| VPS `:8088` TopHeader pre-FE-W1 (no `portal-brand-mark`) | **ENV / deploy lag** | **Condition OK** — local source + QA `:5173` PASS = SoT; not product NO-GO |
| Seed | **PROCESS U65** | **PASS** — none |
| Phase1 / PROD / full remaster DONE | **OUT OF SLICE** | **NOT claimed** |
| QA pack Layer-B 3/8 miss | **PROCESS-P3** | Not product NO-GO — QC pack must 8/8 |

---

## Command / probe table

| Command / probe | Result | Classification |
|-----------------|--------|----------------|
| `pnpm run verify:xevn:theme-contrast` | **PASS** · pale hits=0 · debt **0** ≤ baseline **0** · exit **0** · 2026-07-22 ~22:25 | PRODUCT |
| Source: `TopHeader.tsx` mark `h-10`/`40` + wordmark `XeVN` + `portal-brand-mark` | **PASS** | PRODUCT |
| Source: `settings-form-pattern.tsx` captions → `text-xevn-textSecondary` / muted placeholders | **PASS** | PRODUCT |
| `rg` pale ban `text-slate-400\|text-gray-400\|text-slate-300` under `apps/web/web-portal/src` | **0 hits** · **PASS** | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/xevn-thm-qa-w1-20260722.md` | **FAIL 3/8** — journey_l25 / crud_or_matrix / residual_section heading style | **PROCESS-P3** — not product NO-GO |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/xevn-thm-qc-fe-w1-01-20260722.md` | **PASS 8/8** · exit **0** (this QC pack) | PROCESS |

---

## L2.5 / journey coverage

| J-ID / surface | Status | Note |
|----------------|--------|------|
| **WP-SHELL-HEADER** theme brand (TopHeader) | **PASS** | QC independent source + QA browser U65 |
| **WP-CC-SET / company_member_units** labels contrast | **PASS** | QA CDP paleClassHits=0; QC token spot |
| **J-CC-*** / **J-HRM-*** business mutate journeys | **N/A** | Out of theme chrome slice — no CRUD UF this gate |
| Portal cross-nav full L2.5 promote | **DEFERRED** | Not required for FE-W1 P0 theme sample |

**L2.5 note:** Gate is **theme remaster sample** (chrome + contrast), not business journey promote. Journey row documents theme surfaces with **PASS**.

---

## Read-only theme AC matrix (P0 portal)

| screen_id / module | Read (token / brand) | Update (mutate) | Delete | QC |
|--------------------|----------------------|-----------------|--------|-----|
| WP-SHELL-HEADER | mark 40 + wordmark XeVN · sticky glass | N/A theme | N/A | **PASS** |
| WP-CC-HOME chrome | `text-xevn-text` / secondary rail | N/A | N/A | **PASS** |
| WP-CC-SET company_member_units | labels not pale · form pattern tokens | N/A theme | N/A | **PASS** |
| Contrast gate monorepo | debt 0 | N/A | N/A | **PASS** |
| CC title string | «X-BOS Unified Portal» present | P1 polish | N/A | **Condition C1** |

---

## Residual / Conditions (GWC)

| # | Residual | Severity | Owner | Blocks FE-W1 P0 theme? |
|---|----------|----------|-------|------------------------|
| **C1** | CC title «X-BOS Unified Portal» vs TopHeader «XeVN» dual naming | **P1 polish** | **dev-fe** optional | **No** — PM exit_criteria condition OK |
| **C2** | VPS `:8088` deploy lag (TopHeader pre-FE-W1) | **ENV** | **devops** when sponsor deploy | **No** — local source PASS = SoT |
| **C3** | `--strict` contrast DoD after density polish waves | P2 program | theme program | No for this slice |
| **C4** | Full inventory P1/P2 density remaster rows | P2 | FE waves | No — not claimed DONE |
| **C5** | QA MD Layer-B incomplete (3/8) | PROCESS-P3 | qa template | No — QC pack 8/8 |

**Explicit:** This GWC **closes portal FE-W1 P0 theme remaster sample only**. It does **not** close Phase 1 product completion, PROD-READY, or full monorepo remaster.

---

## Gate verdict

### **GO WITH CONDITIONS** — Portal FE-W1 P0 theme slice

- Independent QC sample of exit_criteria **1–3** = **PASS**.
- Conditions **C1** (title polish) and **C2** (`:8088` deploy lag) **accepted** per PM `exit_criteria`.
- **NOT Phase 1 DONE · NOT PROD-READY · NOT full remaster GO.**

---

## completion_report

- **Closed:** QC sample audit on portal FE-W1 P0 theme — TopHeader mark≥40 + wordmark «XeVN»; CC settings/form-pattern xevn tokens (0 pale ban in portal); independent `verify:xevn:theme-contrast` exit 0 debt 0.
- **Residual:** C1 title dual-naming P1 polish; C2 `:8088` deploy lag; C3–C5 non-blocking.
- **Did not:** seed; claim Phase1/PROD/full remaster; edit `apps/**`.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: XEVN-THM-PM-INTAKE-FE-W1-GWC-01
from_role: qc
to_role: pm
entry_criteria: XEVN-THM-QC-FE-W1-01 GO WITH CONDITIONS — docs/qa/evidence/xevn-thm-qc-fe-w1-01-20260722.md
exit_criteria:
1) Bus INTAKE + update TEAM_WORKING_NOW / theme program — FE-W1 portal P0 theme GWC (slice closed; NOT Phase1/PROD)
2) Optional P1: Task dev-fe rename/align CC title «X-BOS Unified Portal» vs brand «XeVN» (close C1) — only if inventory prioritizes
3) When sponsor wants live VPS parity → Task devops deploy web-portal slice then QA spot TopHeader on :8088 (close C2)
4) Continue open theme waves (inventory P1/P2 / MOB follow-ups) — do NOT claim full remaster DONE
cấm: seed; Phase1 DONE claim; reopen FE-W1 P0 chrome without regression (contrast + brand mark)
evidence_path: docs/program/AGENT_MESSAGE_BUS.md (append) + docs/program/TEAM_WORKING_NOW.md
ack_status: DISPATCHED next wave
```

## ack_status

**PASS_TO_PM** — gate_verdict **GO WITH CONDITIONS**
