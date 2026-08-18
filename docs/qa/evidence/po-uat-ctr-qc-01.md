# Evidence — `PO-UAT-CTR-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-CTR-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — **printable contracts UAT pack slice** (`C-SLICE-≠-MODULE`) |
| **priority** | Pack reconfirm · soft OBS retained · ready flag DENIED |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **Verdict** | **GO WITH CONDITIONS** — printable contracts UAT pack slice ACCEPT |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-UAT-CTR-01` `PASS_WITH_OBS` |
| **program** | `PO-UAT-MODULES-PARALLEL-01` |
| **qa_ref** | [`po-uat-ctr-01.md`](po-uat-ctr-01.md) |
| **machine** | [`_tmp-po-uat-ctr-01.FINAL.json`](_tmp-po-uat-ctr-01.FINAL.json) · DnD [`_tmp-po-uat-ctr-01-dnd.FINAL.json`](_tmp-po-uat-ctr-01-dnd.FINAL.json) stamp **`UATDND-ICMSC8`** |
| **screens** | `docs/qa/evidence/screens/po-uat-ctr-01/` (**5** PNG on disk · spot `03-f5-canvas.png`) |
| **prior seals** | Print-spine GWC [`po-hrm-contract-legal-print-qc-01.md`](po-hrm-contract-legal-print-qc-01.md) · Q-CTR-02 CLOSED [`po-hrm-contract-legal-print-qc-02.md`](po-hrm-contract-legal-print-qc-02.md) · Q-CTR-01 CLOSED [`po-hrm-contract-legal-print-qc-q-ctr-01.md`](po-hrm-contract-legal-print-qc-q-ctr-01.md) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — pack GWC ≠ full printable catalog UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **contracts_printable_ready** | **false** | **DENIED** — soft OBS + slice ≠ full catalog (X.E 8 templates SPEC) · **PM must not set true** |
| **Module printable UAT** | **DENIED** | Pack slice ≠ full contracts printable module |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes `seed` · `api_only_pass` · `invent_printable_uat` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT UAT pack reconfirm for **printable contracts slice**: Settings **LEGAL_BASIS** CRUD + activate + F5 · template DnD/reorder + F5 **Mở** canvas · UF-HRM-02 → preview `can_issue=true` → print-version → PDF **`%PDF`** · holding publish **v4** → member pull/apply + origin badge · **J-HRM-03** Eye · process gates clean. Prior print-spine GWC + Q-CTR-01/02 **CLOSED** **must_keep** — **not reopened**. Soft OBS remain → **not** clean GO / **not** `contracts_printable_ready=true`. X.E template wave remains **SPEC only** (out of seal — does not NO-GO this pack).

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **1a** LEGAL_BASIS clause CRUD + activate + F5 | stamp `CTRQA-ICFFU2` · codes `LEGAL_*` + `JOB_*` · POST **201** · F5 | 🟢 **ACCEPT** |
| **1b** Template DnD persist + reorder + F5 **Mở** | `_tmp-po-uat-ctr-01-dnd.FINAL.json` · orderMatch=true · dndStorm=0 · PNG `02`/`03` | 🟢 **ACCEPT** |
| **2a** UF-HRM-02 create + `work_location` + F5 | R3 `CTR3-ICBW7K` · `HD-CCEC8` · POST **201** `HRM-CON-201` | 🟢 **ACCEPT** |
| **2b** Preview → print-version → PDF `%PDF` | `can_issue=true` · VER **201** · GET pdf **200** `application/pdf` magic `%PDF` · engine=pdfkit · QA-02 toast | 🟢 **ACCEPT** (Q-CTR-02 CLOSED must_keep) |
| **3** Holding publish → member pull/apply + origin | QA-05 `CTR5-ICBYP8` · publish **201** **v4** · pull/apply **201** · `Tập đoàn · v4` | 🟢 **ACCEPT** (Q-CTR-01 CLOSED must_keep) |
| **4** J-HRM-03 Eye dialog | dialog open · code=`HD-BN37L` · latch=1 | 🟢 **PASS** L2.5 |
| **5** Process gates | dndStorm=0 · uncaught=0 · mojibake=false | 🟢 **ACCEPT** |
| Soft OBS OU chip / CODE-CONFLICT | documented soft | 🟡 **OPEN soft** — blocks clean GO / flag promote only |
| X.E 8 templates | SPEC open (entry) | ⚪ **OUT OF SEAL** — deny ready=true · **not** product NO-GO this pack |
| Honesty false | MD + machine + this QC | 🟢 **DENIED promote** |
| Seed / Phase1 DONE | DENIED / NOT claimed | 🟢 |

**Cấm:** `contracts_printable_ready=true` · reopen Q-CTR-01/02 CLOSED without evidence gap · invent Phase 1 DONE · seed · invent full printable module UAT.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `contracts_printable_ready=true`? | **NO** |
| Why | Soft OBS remain · `C-SLICE-≠-MODULE` · X.E 8 templates still **SPEC** (slice ≠ full catalog) · sponsor honesty DENIED unless explicit **GO** full printable module with **zero** P0/P1 — this seat is **GWC pack slice**, not full-module GO |
| Recommended flag state | keep **`contracts_printable_ready=false`** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Print-spine GWC | `po-hrm-contract-legal-print-qc-01.md` | PASS_TO_PM | **must_keep** — not reopened |
| Q-CTR-02 PDF binary CLOSED | `po-hrm-contract-legal-print-qc-02.md` | PASS_TO_PM | **must_keep** |
| Q-CTR-01 library publish CLOSED | `po-hrm-contract-legal-print-qc-q-ctr-01.md` | PASS_TO_PM | **must_keep** · OU chip soft OBS prior |
| QA UAT pack | `po-uat-ctr-01.md` | PASS_WITH_OBS | **ACCEPT** U65 browser matrix 1–5 |
| Machine rollup | `_tmp-po-uat-ctr-01.FINAL.json` | PASS_WITH_OBS | **ACCEPT** pack all PASS · honesty false |
| DnD machine | `_tmp-po-uat-ctr-01-dnd.FINAL.json` | PASS | **ACCEPT** stamp `UATDND-ICMSC8` |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| Rollup `pack.*` | CL/DND/UF/PRINT/PDF/HOLDING/PULL/ORIGIN/J-03/PROCESS all **PASS** | 🟢 |
| `honesty.contracts_printable_ready` | **false** · `denied[]` includes ready=true · seed · invent | 🟢 |
| `l0` | portal/hrm/xbos **200** · fe_be_health **ALL PASS** | 🟢 |
| DnD `AC-CTR-TPL-DND` | orderMatch=true · reorder=true · dndStorm=0 | 🟢 |
| DnD ids | `LEGAL_UATDND-ICMSC8` · `TPL_UATDND-ICMSC8` | 🟢 matches PNG |
| Stamps cited | CL `CTRQA-ICFFU2` · spine `CTR3-ICBW7K` · pdf `CTR2-ICBY1V` · lib `CTR5-ICBYP8` | 🟢 |
| `obs[]` | OU chip soft · CODE-CONFLICT soft | 🟡 soft only |
| `overall` | **PASS_WITH_OBS** | 🟢 slice |

### Screenshot visual spot (mandatory DnD F5)

| File | QC observation |
|------|----------------|
| `03-f5-canvas.png` | Canvas/clauses **LEGAL_UATDND-ICMSC8** + **JOB_*** · template table row **TPL_UATDND-ICMSC8** active · **Mở** highlighted · origin rows **Tập đoàn - v4** visible — DnD+F5 + v4 lineage ACCEPT |
| Screens dir | **5** PNG on disk (`01`–`03` + probes) |

---

## Soft OBS classification (soft vs block)

| ID | Class | Block GWC pack? | Block `ready=true`? | Note |
|----|-------|-----------------|---------------------|------|
| **OBS-OU-CHIP-SETTINGS** | **OBS soft** | **NO** | **YES** (with peers) | Settings hides OU chip; member pull/apply works via `sessionStorage['hrm:operating-unit-filter']` (prior Q-CTR-01). Discoverability backlog — **not** product NO-GO. |
| **OBS-CODE-CONFLICT** | **OBS soft** | **NO** | **YES** (with peers) | Member-local collide path not exercised under U65 (no invent). Multi-row same code with origin `Tập đoàn · vN` vs `Nội bộ` on F5 = **lineage display**, not reopen Q-CTR. |
| **OBS-QA01-HARNESS-MO** | **PROCESS / P3 harness** | **NO** | **NO** alone | Legacy harness looked for **Sửa**; product load = **Mở**. Closed by focused DnD harness. |
| **X.E 8 templates** | **OUT OF SEAL (SPEC)** | **NO** (entry) | **YES** | Catalog completeness gap — deny full-module ready; **do not** NO-GO this pack. |
| P0/P1 product | **none** | — | — | No product FAIL this UAT pack |

---

## Gate AC audit

| # | AC / Check | Evidence | QC |
|---|------------|----------|-----|
| 1 | L0 stack + fe-be-health | QA MD + rollup l0 200 | 🟢 |
| 2 | LEGAL_BASIS + activate + F5 | CTRQA-ICFFU2 | 🟢 |
| 3 | Template DnD + F5 Mở | UATDND-ICMSC8 · PNG 03 | 🟢 |
| 4 | UF-HRM-02 + print spine + `%PDF` | R3 + QA-02 | 🟢 |
| 5 | Holding v4 publish / member pull-apply / origin | CTR5-ICBYP8 | 🟢 |
| 6 | J-HRM-03 L2.5 Eye | dialog + HD-BN37L | 🟢 |
| 7 | Process gates | dndStorm=0 · uncaught=0 | 🟢 |
| 8 | Q-CTR-01/02 not reopened | prior CLOSED must_keep | 🟢 |
| 9 | U65 zero-seed | denied seed · browser | 🟢 |
| 10 | Honesty flag stay false | MD + machine + this QC | 🟢 **DENIED promote** |
| 11 | Module UAT / Phase 1 | Explicit DENIED / NOT claimed | 🟢 |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey | Prior | UAT 2026-08-07 | QC |
|---------|-------|----------------|-----|
| **J-HRM-03** | PASS (emp Eye) | PASS dialog=`HD-BN37L` | 🟢 **PASS** — in-scope L2.5 for contracts list Eye |
| Print-spine / UF-HRM-02 mutate path | GWC / CLOSED PDF | PASS `%PDF` | 🟢 pack reconfirm (not separate J-* id) |

### CRUD / mutate matrix (slice)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Clause LEGAL_BASIS create + activate | Create / Update | **PASS** |
| Template create + DnD layout save | Create / Update | **PASS** |
| Contract create UF-HRM-02 | Create | **PASS** |
| Print-version + PDF download | Create / Read | **PASS** |
| Library publish / pull / apply | Create / Update | **PASS** |
| J-HRM-03 Eye dialog | Read | **PASS** |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack verify **1/8** (`command_table` missing) | **PROCESS OBS** | QC consolidates **8/8** here — **not** product demote |
| OBS-OU-CHIP-SETTINGS | **OBS** soft | Discoverability — blocks clean GO / ready only |
| OBS-CODE-CONFLICT | **OBS** soft | U65 — blocks clean GO / ready only |
| X.E 8 templates SPEC | **SCOPE OBS** | Out of seal — deny ready=true · not pack NO-GO |
| Portal `:5173` | **ENV OBS** | QA L0 PASS on evidence port |
| No P0/P1 product residual | **PRODUCT OK** | Pack matrix all PASS |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| Print-spine GWC | — | — | **SEALED must_keep** | Do not reopen |
| **Q-CTR-02** PDF binary | — | — | **CLOSED must_keep** | Do not reopen |
| **Q-CTR-01** library publish | — | — | **CLOSED must_keep** | Do not reopen |
| **OBS-OU-CHIP-SETTINGS** | soft | product/UX | **OPEN soft** | Backlog discoverability |
| **OBS-CODE-CONFLICT** | soft | — | **OPEN soft** | U65 — no invent collide |
| **X.E template catalog (8)** | SPEC | BA/Dev (separate wave) | **OPEN out-of-seal** | Deny `contracts_printable_ready=true` |

**P0/P1 residuals for this WI:** none.

**CONDITION for GWC:** soft OBS + catalog SPEC gap — sufficient to deny `contracts_printable_ready=true` and deny clean full-module GO; **not** product NO-GO for this pack slice.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-ctr-01.md` | exit **1** · **1/8** (`command_table`) | **PROCESS OBS** — consolidated below |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-ctr-qc-01.md` | exit **0** · **PASS 8/8** | QC pack SoT |
| QA rollup overall | **PASS_WITH_OBS** | PRODUCT OK |
| QA claimed `qc:dev-stack` + `qc:fe-be-health` | L0 200 · ALL PASS | L0 OK |
| Spot screen `03-f5-canvas.png` | exists · visual ACCEPT (LEGAL_* + TPL_UATDND + v4 origin) | ASSET OK |

---

## Scope boundary (explicit)

| In seal | Out of seal |
|---------|-------------|
| UAT pack items 1–5 (LEGAL_BASIS · DnD · UF-02 print `%PDF` · holding v4 · J-HRM-03 · process) | Full contracts printable **module** UAT |
| Prior Q-CTR-01/02 CLOSED + print-spine GWC must_keep | **`contracts_printable_ready=true`** |
| Soft OBS documented | X.E **8** customer templates (SPEC wave) |
| Honesty flag **false** | Phase 1 DONE · production GO · other HRM modules |

**NOT Phase 1 DONE.** **NOT** `contracts_printable_ready`. **NOT** full printable catalog GO.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | See below |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-ctr-qc-01.md` |
| **ack_status** | **PASS_TO_PM** |

### completion_report

**GO WITH CONDITIONS** for **printable contracts UAT pack slice** (LEGAL_BASIS + DnD/F5 Mở · UF-HRM-02 → `%PDF` · holding publish **v4** pull/apply/origin · J-HRM-03 · process). Prior print-spine GWC + Q-CTR-01/02 CLOSED **must_keep** — **not reopened**. Soft OBS (OU chip · CODE-CONFLICT) + X.E 8 templates still SPEC → **deny** clean GO and **deny** `contracts_printable_ready=true` (**explicit NO** to PM promote). QA pack format 1/8 = PROCESS OBS (QC consolidates 8/8). U65 / seed DENIED. **C-SLICE-≠-MODULE**. **NOT** Phase 1 DONE. Zero P0/P1 product blockers.

### next_owner

pm

### next_dispatch_prompt

```text
work_item_id: PO-UAT-CTR-PM-CLOSE-01
from_role: pm
to_role: pm (bus + backlog)
lane: governance
parent: PO-UAT-CTR-QC-01 GO WITH CONDITIONS
program: PO-UAT-MODULES-PARALLEL-01

task:
  - Bus INTAKE: printable contracts UAT pack slice GWC — LEGAL_BASIS+DnD · UF-02 %PDF · holding v4 · J-HRM-03 ACCEPT
  - Keep contracts_printable_ready=false (QC DENIED promote — soft OBS + X.E 8 templates SPEC · C-SLICE-≠-MODULE)
  - Do NOT reopen Q-CTR-01 / Q-CTR-02 CLOSED or print-spine GWC without new evidence gap
  - Soft OBS (OU chip · CODE-CONFLICT) — optional UX backlog; non-blocking for other module lanes
  - X.E template wave remains SPEC-only — separate work_item when sponsor unlocks; do not invent ready=true
  - Continue PO-UAT-MODULES-PARALLEL-01 next module lane

exit: bus updated · honesty flag unchanged · no invent Phase1 DONE · no seed
evidence: docs/qa/evidence/po-uat-ctr-qc-01.md
```
