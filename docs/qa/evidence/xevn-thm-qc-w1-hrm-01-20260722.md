# QC Gate — XEVN-THM-QC-W1-HRM-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-QC-W1-HRM-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` (ICT ~22:34–22:45) |
| **program** | `P1-XEVN-THEME-REMASTER` |
| **ack_status** | **PASS_TO_PM** |
| **gate_verdict** | **GO WITH CONDITIONS** |
| **scope** | FE-W1-HRM pale-contrast slice ONLY — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full remaster DONE |
| **entry** | `XEVN-THM-QA-W1-HRM` PASS_TO_PM · `docs/qa/evidence/xevn-thm-qa-w1-hrm-20260722.md` (+ Dev `xevn-thm-fe-w1-hrm-20260722.md`) |
| **runtime_SoT** | ADR sharp-ops · inventory FE-W1-HRM · L-CONTRAST |
| **U65** | zero-seed — QC sample source + contrast gate only; **no** `pnpm seed:*`; QC did **not** edit `apps/**` |
| **PORTAL_DEV_URL** | Local SoT `http://localhost:5173` (QA browser) · QC independent source + gate re-run |

---

## Scope (bounded — FE-W1-HRM pale contrast)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| `verify:xevn:theme-contrast -- --strict` exit 0 · hitCount 0 | Phase1 / PROD DONE claim |
| Spot OU filter + CO/REC badges use xevn tokens | Full remaster / density rainbow FAIL |
| GWC OK: density rainbow / payroll tutorial deferred | Seed · QC code edits `apps/**` |
| Accept QA note: fresh Vite required (stale = false FAIL) | Claiming density polish DONE |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/xevn-thm-fe-w1-hrm-20260722.md` | Dev-FE | `READY_FOR_QA` — pale 16→0; OU + CO/REC badges → xevn |
| `docs/qa/evidence/xevn-thm-qa-w1-hrm-20260722.md` | QA | `PASS_TO_PM` **PASS** — strict 0; CDP OU tokens; CO/REC readable; rainbow waived |
| `docs/qa/evidence/xevn-theme-contrast-baseline.json` | Gate SoT | `hitCount=0` · `work_item_id=XEVN-THM-FE-W1-HRM` |

---

## Micro-checklist (exit_criteria)

| # | Exit criteria | QC method | Observed | Result |
|---|---------------|-----------|----------|--------|
| **1** | `pnpm run verify:xevn:theme-contrast -- --strict` exit 0 (hitCount 0) | Independent re-run | scanned 715; pale hits=0 files=0; **STRICT PASS**; exit **0** | **PASS** |
| **2** | Spot OU filter / CO-REC badges use xevn tokens | Source sample + pale-ban rg | OU: `text-xevn-text\|Secondary\|Muted` + `border-xevn-border bg-xevn-background/90`; CO inactive + REC pending/cancelled/closed/no_show → `bg-xevn-neutral/15 text-xevn-textSecondary`; pale ban 0 on sample files | **PASS** |
| **3** | GO / GWC — density rainbow deferred = condition OK | Adjudication | Product **1–2 PASS**; density rainbow / payroll tutorial = **C1** per PM exit — **not FAIL** | **GWC** |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | QC finding |
|--------|-------|------------|
| Theme contrast strict hitCount 0 | **PRODUCT** | **PASS** |
| OU filter xevn tokens | **PRODUCT** | **PASS** |
| CO/REC status badges xevn tokens | **PRODUCT** | **PASS** |
| Density rainbow REC tabs / payroll tutorial | **PRODUCT-P1 residual** | **Condition OK** — deferred polish; cấm FAIL this wave |
| Stale Vite shows pre-remaster slate | **ENV** | **Condition OK** — QA: fresh Vite required; not product NO-GO when source+gate PASS |
| Seed | **PROCESS U65** | **PASS** — none |
| Phase1 / PROD / full remaster DONE | **OUT OF SLICE** | **NOT claimed** |

---

## Command / probe table

| Command / probe | Result | Classification |
|-----------------|--------|----------------|
| `pnpm run verify:xevn:theme-contrast -- --strict` | **PASS** · pale hits=0 · exit **0** · 2026-07-22 ~22:34 | PRODUCT |
| Source: `HrmOperatingUnitFilter.tsx` — `text-xevn-text` / `textSecondary` / `textMuted` + chrome `border-xevn-border bg-xevn-background/90` | **PASS** | PRODUCT |
| Source: `CompanyManagement.tsx` / `CompanyMembersManagement.tsx` inactive → `bg-xevn-neutral/15 text-xevn-textSecondary` | **PASS** | PRODUCT |
| Source: `InterviewsTab.tsx` / `HeadcountProposalTab.tsx` pending/cancelled/closed/no_show → xevn Secondary | **PASS** | PRODUCT |
| `rg` pale ban on OU/CO/REC sample files (`text-slate-400\|text-gray-400\|text-slate-300`) | **0 hits** · **PASS** | PRODUCT |
| QA browser CDP OU colors `#111827` / `#4B5563` / `#6B7280` (accept QA log) | **PASS** | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/xevn-thm-qc-w1-hrm-01-20260722.md` | **PASS 8/8** · exit **0** (this QC pack) | PROCESS |

---

## L2.5 / journey coverage

| J-ID / surface | Status | Note |
|----------------|--------|------|
| **HRM-CO** theme contrast (OU compact + company badges) | **PASS** | QC source + QA CDP U65 |
| **HRM-REC** theme contrast (OU bar + status badges) | **PASS** | QC source + QA browser |
| **WP-HRM-EMBED** OU filter chrome | **PASS** | `HrmOperatingUnitFilter` tokens |
| **J-HRM-*** business mutate journeys | **N/A** | Out of pale-contrast theme slice — no CRUD UF this gate |
| Cross-nav full L2.5 promote | **DEFERRED** | Not required for FE-W1-HRM pale sample |

**L2.5 note:** Gate is **theme remaster pale-contrast sample**, not business journey promote. Journey rows document theme surfaces with **PASS**.

---

## Read-only theme AC matrix (FE-W1-HRM pale)

| screen_id / module | Read (token / contrast) | Update (mutate) | Delete | QC |
|--------------------|-------------------------|-----------------|--------|-----|
| WP-HRM-EMBED / OU filter | xevn text/Secondary/Muted + border chrome | N/A theme | N/A | **PASS** |
| HRM-CO status/role badges | inactive/viewer Secondary + neutral | N/A theme | N/A | **PASS** |
| HRM-REC interview/headcount badges | pending/cancelled/closed/no_show Secondary | N/A theme | N/A | **PASS** |
| Contrast gate monorepo | hitCount 0 strict | N/A | N/A | **PASS** |
| REC density rainbow tabs | visible clutter | deferred polish | N/A | **Condition C1** |

---

## Residual / Conditions (GWC)

| # | Residual | Severity | Owner | Blocks FE-W1-HRM pale? |
|---|----------|----------|-------|------------------------|
| **C1** | Inventory density P1/P2 — rainbow REC tabs, payroll tutorial cards | **P1 polish** | **dev-fe** later wave | **No** — PM exit_criteria condition OK |
| **C2** | Stale Vite / orphan portal risk (false pale on UAT demo) | **ENV** | devops / FE restart before demo | **No** — source + strict PASS = SoT |
| **C3** | MOB-W2 / other theme waves | P2 program | theme program | No — separate work_item |
| **C4** | Full remaster DONE claim | OUT | — | **Forbidden** |

**Explicit:** This GWC **closes FE-W1-HRM pale-contrast remaster sample only**. It does **not** close Phase 1 product completion, PROD-READY, density remaster, or full monorepo remaster.

---

## Gate verdict

### **GO WITH CONDITIONS** — FE-W1-HRM pale-contrast slice

- Independent QC sample of exit_criteria **1–2** = **PASS**.
- Condition **C1** (density rainbow deferred) **accepted** per PM `exit_criteria`.
- **NOT Phase 1 DONE · NOT PROD-READY · NOT full remaster GO.**

---

## completion_report

- **Closed:** QC sample audit on FE-W1-HRM pale-contrast — independent `verify:xevn:theme-contrast -- --strict` exit 0 hitCount 0; OU filter + CO/REC badges use xevn tokens (source + pale-ban 0); QA CDP evidence accepted.
- **Residual:** C1 density rainbow deferred (condition OK); C2 stale Vite ENV note; C3–C4 out of slice.
- **Did not:** seed; FAIL density polish; claim Phase1/PROD/full remaster; edit `apps/**`.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: XEVN-THM-PM-INTAKE-W1-HRM-GWC-01
from_role: qc
to_role: pm
entry_criteria: XEVN-THM-QC-W1-HRM-01 GO WITH CONDITIONS — docs/qa/evidence/xevn-thm-qc-w1-hrm-01-20260722.md
exit_criteria:
1) Bus INTAKE + update TEAM_WORKING_NOW / theme program — FE-W1-HRM pale-contrast GWC (slice closed; NOT Phase1/PROD/full remaster)
2) Continue open theme waves per inventory — prefer XEVN-THM-MOB-W2 or density polish FE wave (C1) if prioritized
3) Before UAT demos: ensure fresh HRM Vite (C2) — stale stack can false-show slate
cấm: seed; Phase1 DONE claim; reopen FE-W1-HRM pale without regression (strict contrast + OU/CO-REC tokens); FAIL density as reopen of this closed pale gate
evidence_path: docs/program/AGENT_MESSAGE_BUS.md (append) + docs/program/TEAM_WORKING_NOW.md
ack_status: DISPATCHED next wave
```

## ack_status

**PASS_TO_PM** — gate_verdict **GO WITH CONDITIONS**
