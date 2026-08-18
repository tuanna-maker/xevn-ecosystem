# Evidence — `PO-HRM-REC-PLAN-CONSOLE-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-PLAN-CONSOLE-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 governance — narrow `C-CONSOLE-CRASH` on recruitment **plan** path only |
| **priority** | P0 console seat seal |
| **portal_url** | `http://127.0.0.1:5173` · `/command-center/hrm/recruitment?tab=plans` |
| **Verdict** | **GO WITH CONDITIONS** — **plan-console slice only** |
| **ack_status** | `PASS_TO_PM` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · mutates=**0** |
| **gap_class** | `C-CONSOLE-CRASH` (OS `36` §3) — **not** BA E2E linkage |
| **OS honesty** | `C-SLICE-≠-MODULE` — slice GWC ≠ module UAT |

### Honesty locks (mandatory — all false / denied)

| Flag | Value |
|------|-------|
| **recruitment_uat_ready** | **false** |
| **jd_dynamic_done** | **false** |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **Phase 1 DONE** | **false** / **NOT claimed** |
| **Module UAT recruitment** | **NOT certified** — prior process NO-GO stands |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT seal for **plan-path console clean** only:

1. Browser L2.5: login → `tab=plans` → open plan detail `TMDV-PLAN-DH7VCT` — `openedDetail: true`
2. Console: `pageErrors=0` · `Uncaught=0` · `uniqueKey=0` · `ReferenceError=0` · `TypeError=0` · drag-handle=0 on plan path
3. FE FIX root cause ACCEPT: `Recruitment.tsx` plan dept maps keyed `Fragment` (create + detail)
4. U65: mutates=0 · zero-seed

**Conditions (explicit NON-CERTIFIED):**

- **NOT** recruitment module UAT-ready (`recruitment_uat_ready=false`)
- **NOT** `jd_dynamic_done`
- **NOT** BA UV position SELECT / CandidateComparison / định biên SoT close — still open under `PO-HRM-REC-E2E-LINKAGE-SPEC-01` / UV-YCTD Tech cascade
- **NOT** promote prior JD-dynamic GWC or this plan-console GWC as «tuyển dụng chạy được»
- Prior process **NO-GO** [`po-hrm-rec-ux-qc-process-01.md`](po-hrm-rec-ux-qc-process-01.md) **remains** for module certification

---

## Entry audit (FE + QA)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Dev-FE FIX | [`po-hrm-rec-plan-console-fe-01.md`](po-hrm-rec-plan-console-fe-01.md) | READY_FOR_QA | **ACCEPT** — unique-key Fragment fix · must_keep mutate/SoT/compare untouched |
| QA browser | [`po-hrm-rec-plan-console-qa-01.md`](po-hrm-rec-plan-console-qa-01.md) | PASS_TO_PM · **PASS** seat | **ACCEPT** product counts · browser click path present |
| Process prior | [`po-hrm-rec-ux-qc-process-01.md`](po-hrm-rec-ux-qc-process-01.md) | NO-GO process module | **RETAIN** — slice ≠ module |

### Machine JSON (QA)

| Artifact | Present | QC spot |
|----------|---------|---------|
| [`_tmp-po-hrm-rec-plan-console-qa-01.json`](_tmp-po-hrm-rec-plan-console-qa-01.json) | ✅ | `openedDetail: true` · `pageErrors: 0` · all classCounts 0 · `verdict: PASS` · `mutates: 0` · detail `TMDV-PLAN-DH7VCT` |

### Before → After (console class)

| Metric | FE before FIX | QA after |
|--------|-------------:|---------:|
| `pageErrors` / Uncaught | 0 | **0** |
| `consoleErrors` | 1 (unique-key) | **0** |
| `uniqueKey` | 1 | **0** |
| `getDialogPortalContainer` | 0 | **0** |
| `LayoutDashboard` | 0 | **0** |
| `dragHandle` | 0 | **0** |

---

## AC / read-only matrix (plan-console seat)

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | L0 FE↔BE health | **PASS** | QA: `pnpm run qc:fe-be-health` ALL PASS |
| 2 | Open `/recruitment?tab=plans` as `ceo@xe.vn` | **PASS** | QA click path + JSON finalUrl |
| 3 | Open plan detail TMDV-PLAN-* (list→detail) | **PASS** | `openedDetail: true` · dept table snippet |
| 4 | `pageErrors=0` / zero Uncaught on plan path | **PASS** | JSON classCounts |
| 5 | zero unique-key warning on plan path | **PASS** | uniqueKey 1→0 |
| 6 | U65 zero mutate | **PASS** | mutates=0 |
| 7 | UV position SELECT / compare | **deferred** | BA cascade — **not asserted** |
| 8 | `recruitment_uat_ready` / module UAT | **Denied** | `C-SLICE-≠-MODULE` |

**Score:** 6/6 in-scope AC **PASS** · 2 honesty/deferred **not promoted**.

---

## L2.5 J-* audit (U19 — plan-console host only)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-05** Tuyển dụng (host) | `tab=plans` → list → plan detail open · console clean · mutates=0 | **PASS** (**plan-console C-CONSOLE-CRASH slice only**) · **NOT** candidate/requisition CRUD · **NOT** UV/compare · **NOT** JD designer |
| Other J-* / UF-HRM-REC / J-REC-WF-* | Out of scope | **deferred** — not claimed |

Mandatory for this gate: plan-path console ACs + honesty denials. **Not** invent module UAT / JD dynamic DONE / product GO.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Plan list→detail console clean ACCEPT after FE unique-key FIX; Uncaught/uniqueKey=0 |
| **PROCESS** | QA seat pack `verify:qc:evidence-pack` **FAIL 2/8** (`journey_l25` + `crud_or_matrix`) — **OBS only**; this QC consolidated pack carries J-HRM-05 host matrix + AC table (same pattern as `po-hrm-ui-p0-logo-font-title-01-qc.md`) |
| **ENV** | None blocking — L0 PASS on `:5173` / `:28001` |
| **OUT-OF-SCOPE** | BA UV position SELECT · CandidateComparison · định biên SoT · JD DnD / remaster · recruitment module UAT · Phase 1 DONE · `jd_dynamic_done` |

ENV does not drive NO-GO. Process pack-field gap on QA seat ≠ product demote when QC consolidates J-* + matrix.

---

## Residual

| Item | Sev | Owner | Blocks plan-console GWC? |
|------|-----|-------|--------------------------|
| BA E2E linkage — UV position SELECT / compare empty | P1 program | ba-process / sa (`PO-HRM-REC-E2E-LINKAGE-SPEC-01` · UV-YCTD Tech) | **No** (parallel) |
| Module recruitment UAT-ready | P0 program honesty | pm / qc process | **No** for this slice — **still false** |
| QA seat pack format (`journey_l25` / matrix lines) | P3 process | qa (next console seat) | **No** — OBS |
| Prior process NO-GO module cert | — | retained | N/A — honesty lock |

**No product P0 residual** on plan-console `C-CONSOLE-CRASH` seat → **idle-ok** for this narrow lane. Continue BA / YCTD cascade separately.

---

## Gate commands (QC)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-plan-console-qa-01.md
→ FAIL process 2/8 · journey_l25 + crud_or_matrix — PROCESS OBS only (product browser verified via QA MD + JSON)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-plan-console-qc-01.md
→ PASS 8/8 (this pack · sealed 2026-08-06)
```

| Check | Result |
|-------|--------|
| `verify:qc:evidence-pack` QA seat | **FAIL process** 2/8 — OBS |
| `verify:qc:evidence-pack` QC pack | **PASS** 8/8 |
| Browser path present | ✅ |
| Module UAT claim in QA/FE | ❌ absent — ACCEPT honesty |

---

## completion_report

- **Closed:** Narrow GWC for `C-CONSOLE-CRASH` on recruitment **plan** path — FE unique-key FIX + QA browser PASS (TMDV-PLAN-DH7VCT · Uncaught/uniqueKey=0) audited; honesty denials stamped; prior module process NO-GO retained.
- **Open / residual:** BA UV/compare linkage; `recruitment_uat_ready=false`; `jd_dynamic_done=false`; QA pack format P3 OBS.
- **NOT claimed:** module UAT · product GO · Phase 1 DONE · JD remaster.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-PLAN-CONSOLE-QC-01 → INTAKE
role: pm
ack: PASS_TO_PM
verdict: GO WITH CONDITIONS — plan-console C-CONSOLE-CRASH slice ONLY
evidence: docs/qa/evidence/po-hrm-rec-plan-console-qc-01.md
facts:
  - pageErrors=0 uniqueKey=0 Uncaught=0 · opened TMDV-PLAN-DH7VCT · U65 mutates=0
  - recruitment_uat_ready=false · jd_dynamic_done=false · NOT module UAT
  - BA UV/compare still open (PO-HRM-REC-E2E-LINKAGE / UV-YCTD Tech) — parallel
  - prior process NO-GO po-hrm-rec-ux-qc-process-01.md RETAINED for module cert
cấm: promote this GWC to recruitment UAT-ready / invent UV SELECT AC / claim jd_dynamic_done
next_wave (do NOT re-open plan-console unless regression):
  1) continue PO-HRM-REC-UV-YCTD-TECH / E2E linkage cascade
  2) optional P3: QA add J-HRM-05 host + matrix lines on next C-CONSOLE seat pack
```

## ack_status

**PASS_TO_PM**
