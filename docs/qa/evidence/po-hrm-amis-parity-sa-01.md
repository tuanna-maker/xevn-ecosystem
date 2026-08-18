# Evidence — PO-HRM-AMIS-PARITY-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-SA-01` |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | Research ≠ UAT · **no AMIS parity DONE** · `payroll_e2e_ready=false` · no Phase1 DONE · **no** `apps/**` · U65 |
| **Program SoT** | [`docs/program/PO_HRM_AMIS_PARITY_RESEARCH_01.md`](../../program/PO_HRM_AMIS_PARITY_RESEARCH_01.md) |
| **BA peer (folded)** | [`docs/qa/evidence/po-hrm-amis-parity-ba-01.md`](./po-hrm-amis-parity-ba-01.md) — **CLOSED** |

---

## 1. read_first ack

| # | Artifact | Used |
|---|----------|------|
| 1 | Program + AMIS Tiền lương 7-step (public help) | Spine principles — no UI/brand clone |
| 2 | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option **B** | Catalog · FormSchema · MergeToken |
| 3 | `ADR-HRM-4-PILLAR` §10 Q-PAY-FORMULA Option **A** | **ANSWERED / LOCKED** — **cấm** re-workshop |
| 4 | `po-hrm-payroll-formula-run-gap-sa-01.md` + DATA-01 | Unlock · closed timesheet · GĐ1 form / GĐ2 DnD |
| 5 | Platform TECHSPEC PAY row | `salary_components` / `pay_types` · AC-PLT-PAY-01 · no FE net |
| 6 | **`po-hrm-amis-parity-ba-01.md`** | Full HR OK\|BETTER\|GAP · PAY depth 1–7 · BR-AMIS-PAY-SRC-01..05 · Q2 storage |
| 7 | `TEAM_WORKING_NOW` 2026-08-07 | Formula **API-01 DISPATCHED** · DATA-01 PASS · CTR MergeToken parallel |

**Explicit:** BA matrix peer **CLOSED** — folded here (no second SA work_item). Q-PAY-FORMULA remains ANSWERED.

---

## 2. Context — BA fold summary

| BA stamp | SA action |
|----------|-----------|
| P0 GAP: formula engine · `pay_sheet_template`+override · SRC priority · process≠0₫ · salary-history/PC catalog | Architecture layers + storage + wave order (this file) |
| BETTER: scope ladder · print-spine CTR · JD-DYNAMIC · dual-control Option A paper · no FE net · ATT closed-sheet · enroll seals | **must_keep** — do not overwrite |
| OOS: AI AVA · Face marketing · full tax/BHXH apps · GĐ1 DnD | Non-goals confirmed |
| Q2: template override store vs global formula version | **Answered §4** (storage Option B) |

---

## 3. Layer map (canonical)

```text
┌──────────────────────────────────────────────────────────────────┐
│ Platform Option B (logical)                                      │
│  Catalog · FormSchema · MergeToken                               │
└────────────┬───────────────────────────────┬─────────────────────┘
             │                               │
   ┌─────────▼─────────┐           ┌─────────▼─────────┐
   │ salary_components │           │ pay_types (REF)   │
   │ (+ nature/type)   │           │ leave/att codes   │
   └─────────┬─────────┘           └───────────────────┘
             │ component_code
   ┌─────────▼──────────────────────────────────────────┐
   │ pay_sheet_template (+ columns: order, label, OU)   │  FormSchema consumer
   │   override_formula_definition_id? ─────────────────┼──┐
   └─────────┬──────────────────────────────────────────┘  │
             │ snapshot at period create                     │
   ┌─────────▼─────────┐     ┌──────────────────────────────▼──┐
   │ payroll_periods   │     │ pay_formula_definition (SoT)    │
   │ + template_id     │     │ versioned · dual-control A      │
   │ + formula binds   │     │ expression_json · required_vars │
   └─────────┬─────────┘     └──────────────▲──────────────────┘
             │                              │
             │         SRC priority resolver (BR-AMIS-PAY-SRC-*)
             │                              │
   ┌─────────▼──────────────────────────────┴──────────────────┐
   │ Resolve(component, emp, period):                          │
   │  1. Emp salary-history / C&B fixed PC                     │
   │  2. Period input pack (other-income · advance · ADJ)      │
   │  3. Template override → evaluate that formula version     │
   │  4. Catalog/default → evaluate default formula version    │
   │ Hour/OT/leave vars ONLY from ATT closed sheet snapshot    │
   └─────────┬─────────────────────────────────────────────────┘
             │
   ┌─────────▼─────────┐
   │ F-PAY-PROCESS-01  │ → payslip lines (≠ 0₫ stub) · FE display only
   └───────────────────┘
```

### 3.1 `salary_components` (Catalog)

| Fact | Stance |
|------|--------|
| Live PARTIAL; open code direction OK; free-text TX residual | Bind picker **AC-PLT-PAY-01** P0 |
| `formula TEXT` ≠ engine | **Deprecate as SoT** (DATA G-PAY-F-07) |
| Nature / type / cap attributes | Deepen via ba-data — GAP attribute depth |
| Starter ≠ closed enum | **must_keep** Platform L1 |

Default formula for a component (when used at priority 4) = FK `default_formula_definition_id` → **active** `pay_formula_definition` (ADD-plan), **not** TEXT column.

### 3.2 `pay_sheet_template` (FormSchema consumer) — Option B ADD

| Decision | Keep from prior SA |
|----------|-------------------|
| ADD `pay_sheet_template` + `pay_sheet_template_column` | **Yes** — do **not** overload enroll `salary_templates` |
| Columns: `component_code` · `sort_order` · `display_label_vi` · override FK · group | Yes |
| Period create snapshots template | Immutable after process start |
| Column reorder GĐ1 OK; formula DnD = GĐ2 | R-PAY-DD-01 |

BA stamps Step3 **GAP P0** — confirms unlock need.

### 3.3 `pay_formula_definition` (formula metadata)

| Decision | Status |
|----------|--------|
| Q-PAY-FORMULA Option **A** dual-control | ANSWERED — paper **BETTER**; product **FAIL** until LIVE |
| DATA-01 ADD-plan columns | CONFIRMED paper — **not** Nest LIVE |
| API-01 F.1 AUTHOR/PUBLISH/EVAL/LIST | **DISPATCHED** (peer) — do not duplicate this seat |
| GĐ1 form / GĐ2 DnD | Locked |

### 3.4 SRC priority (BA BR-AMIS-PAY-SRC-01..05) — architecture lock

```text
1 Emp history / C&B fixed PC     → amount or skip to next
2 Period input pack              → amount or skip
3 Template override formula      → evaluate(override_formula_definition_id)
4 Catalog/default formula        → evaluate(default_formula_definition_id)
ELSE → HRM-PAY-FORMULA-412 / explicit VI (no silent 0 without reason)
```

| BR | Architecture rule |
|----|-------------------|
| **SRC-01** | Hour/OT/leave vars **only** closed timesheet snapshot (Q-PAY-F-3) |
| **SRC-02** | History/C&B **wins** over template/catalog for fixed PC when present |
| **SRC-03** | Period pack **wins** for period-variable components when pack row exists |
| **SRC-04** | Template override **wins** catalog default when override FK set |
| **SRC-05** | Catalog default only if 1–4 empty — **cấm** Nest % fallback |

**Gap:** chain **not implemented** → P0 product fidelity (PAY-DEPTH DOC + engine).

### 3.5 ATT → PAY bind («chuyển tính lương»)

```text
attendance_sheets.status = closed
  → timesheet.closed facade (4-pillar)
  → period input bind (header now; lines when att_timesheet_line LIVE)
  → enroll / process assert else HRM-PAY-ATT-412
```

| Preserve (BETTER / OK slice) | Residual |
|------------------------------|----------|
| ATT-412 closed-sheet gate · enroll AC-PAY-HIRE-04/05 seals | “Chuyển” UX pack shallow · `att_timesheet_line` PAPER · other-income/advance packs GAP |

---

## 4. Storage choice — template override vs global formula version

**BA Q2:** single global `pay_formula_definition` vs per-template expression store — SA chooses; BA requires **override semantics**.

### Options

| Option | Description | Pros | Cons / risks | Verdict |
|--------|-------------|------|--------------|---------|
| **A** | Template column stores inline `expression_override_json` (no FK to formula registry) | Fast AMIS-like edit | Bypasses dual-control Option A; two SoTs; audit/rollback weak | **Reject** |
| **B** | **All expressions in `pay_formula_definition`**; template override = nullable `override_formula_definition_id` → **published** version; catalog default = `default_formula_definition_id` | One SoT · dual-control · version freeze · SRC-04 clean | Need author UX “create override version from template” | **RECOMMEND** |
| **C** | Global formula only; template cannot override (display/order only) | Simplest engine | Fails AMIS Step3 + BA GAP | **Reject** |

### Selected: **Option B** (FK override)

| Rule | Detail |
|------|--------|
| SoT | `pay_formula_definition` only for executable expressions |
| Catalog default | `salary_components.default_formula_definition_id` (or company formula set by code) |
| Template override | `pay_sheet_template_column.override_formula_definition_id` nullable |
| Publish | Override must be **active/published** before period bind; draft ignored on process |
| Author UX GĐ1 | Form creates/edits a definition version scoped code e.g. `TPL:{template_code}:{component_code}` then publish; template row stores FK |
| Forbidden | Free-text on template as runtime SoT; writing Nest const; FE net |
| SRC | Amounts from history/packs short-circuit **before** evaluate; override FK used only at priority 3 |

**Transition:** Until template DATA exists, formula API-01 proceeds on global definitions only; template F.1 adds override FK after sheet-template DATA.

---

## 5. Wave order vs CTR MergeToken + FORMULA-RUN-GAP

```text
CTR MergeToken / print-spine (BETTER)
  │  parallel OK — must_keep; PAY does not block/redesign
  │
PAYROLL-FORMULA-RUN-GAP
  DATA-01 …………… PASS (ADD-plan; formula PAPER)
  DOCS-01 ………… PASS (ANSWERED paper; F.* HOLD product)
  API-01 …………… DISPATCHED (F-PAY-FORMULA F.1) ← do not re-open/duplicate
  │
  ▼ after API-01 CONFIRMED
  BE ensureSchema + evaluator + process bind (kill 0₫)
  FE GĐ1 form author + preview (no DnD)
  QA U65
  │
AMIS parity (this research)
  BA-01 …………… PASS (matrix folded)
  SA-01 …………… this evidence PASS_TO_PM
  PAY-DEPTH-01 … next (BR/AC DOC: template + SRC + packs)
  Sheet-template DATA → F-PAY-SHEET-TPL-01 (after or parallel DATA formula)
  │
  ▼ integrate into PROCESS deepen
  Template snapshot + SRC resolver + payslip lines
```

| Lane | Parallel? | Serial gate |
|------|-----------|-------------|
| CTR MergeToken / XEVN-TPL FE·QA | **Yes** | Preserve BETTER; no PAY wipe |
| Formula API-01 | **In flight** | Wait CONFIRMED before BE |
| PAY-DEPTH BR/AC DOC | **Yes** after this SA | Feeds SRS DOC-DELTA; does not unlock Dev alone |
| Sheet-template DATA | After BA GAP confirm (now) | Before TPL API; can follow formula DATA |
| Formula BE / FE / QA | **After** API-01 (+ template DATA if process requires template snapshot AC) | Dev HOLD until API CONFIRMED |
| Platform PAY vertical (Q-PLT-05) | After CTR | COMP picker + formula form + template = one PAY vertical |

**Honesty:** enroll/process seals ≠ customer-ready. `payroll_e2e_ready=false` until formula+lines U65 + QC.

---

## 6. Preserve BETTER / OK (BA + SA)

| Item | Rule |
|------|------|
| Multi-tenant **scope ladder** | Same resolver list↔get↔mutate on all new PAY APIs |
| **Print-spine CTR** + open catalog CORR | No PAY redesign PDF; MergeToken deepen only |
| **JD-DYNAMIC** | Platform instance #2 — keep |
| Dual-control Option **A** paper | Keep AuthZ; ship product fidelity |
| **No FE net** (OS 28) | EVAL/PROCESS BE lines only |
| **ATT closed-sheet** ATT-412 | Keep |
| **Enroll** AC-PAY-HIRE-04/05 seals | Keep; do not claim module UAT from seals |
| Soft-delete · starter≠enum · U65 | Keep |

---

## 7. Non-goals (confirmed with BA)

| Non-goal | Why |
|----------|-----|
| **AI AVA** formula author/check | OOS GĐ2+ |
| **FaceID / GPS / máy chấm** marketing as ATT UAT | Help marketing ≠ close spine; MOB Face only if already scoped |
| Full clone AMIS Kế toán / TNCN / BHXH apps | Cross-app OOS GĐ1 |
| **GĐ1 DnD** formula designer | R-PAY-DD-01 = GĐ2 |
| Clone AMIS UI/IA/brand | Principles only |
| Claim **parity DONE** / flip `payroll_e2e_ready` | Honesty |
| Blacklist→REC · MXH nội bộ | OOS |

---

## 8. Failure modes

| Mode | Mitigation |
|------|------------|
| Hardcode Nest rates/% | Golden CI; coeffs only in definitions / C&B / ATT-baked |
| FE net | Boundary + Network review |
| Closed-enum components | Open catalog + soft-delete |
| Open timesheet vars | ATT-412 |
| Inline template expression bypass dual-control | Storage **Option B** FK only |
| Conflate `salary_templates` enroll with mẫu | Separate `pay_sheet_template` |
| Silent 0₫ without FORMULA-412 | AC-PAY-RUN-09 |
| Duplicate formula API-01 | Cite DISPATCHED peer; deepen PROCESS later |
| Parity research → UAT claim | Flag stays false |

---

## 9. Architecture decisions (locked this seat)

| # | Decision |
|---|----------|
| D1 | Platform Option **B** cite — no rewrite |
| D2 | Q-PAY-FORMULA Option **A** cite — no reopen |
| D3 | `pay_sheet_template` **ADD** (entity Option B) — not enroll pack deepen |
| D4 | Formula storage **Option B**: all expressions in `pay_formula_definition`; template override = **FK** to published version |
| D5 | SRC priority = BA BR-AMIS-PAY-SRC-01..05 |
| D6 | Wave: formula API-01 → BE; parallel PAY-DEPTH + CTR; template DATA before TPL API |
| D7 | New ADR file **not required** — evidence + optional Platform DOC-DELTA PAY row |

**NFR:** New PAY APIs → `@xevn/platform-core` + observability baseline; RLS only after SA sign-off.

---

## 10. Non-claims

- No `apps/**` / migrations  
- No `payroll_e2e_ready=true` / parity DONE / Phase1 DONE  
- No invent GĐ1 formula DnD / AVA / Face marketing UAT  
- No claim formula or template **LIVE**  
- No duplicate `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01`  

---

## 11. completion_report

**Closed**

1. Folded BA matrix peer CLOSED into SA layers (§2–§3).  
2. Canonical map: `salary_components` · `pay_sheet_template` · `pay_formula_definition` · SRC priority · ATT→PAY bind.  
3. **Storage Option B** — template override = FK to published formula version (not inline SoT) (§4).  
4. Wave order vs CTR MergeToken + FORMULA DATA/API-01 in flight (§5).  
5. BETTER preserve + non-goals AI AVA / Face / GĐ1 DnD (§6–§7).  
6. Honesty: research ≠ UAT · `payroll_e2e_ready=false` · no parity DONE.

**Residual**

| ID | Owner |
|----|-------|
| Formula API-01 CONFIRMED (in flight) | sa peer |
| `PO-HRM-AMIS-PARITY-PAY-DEPTH-01` BR/AC DOC | ba-process (+ sa co-read) |
| Sheet-template DATA then TPL F.1 | ba-data → sa |
| Formula BE after API | dev-be |
| FE form GĐ1 → QA U65 | dev-fe → qa |
| Sponsor Q1 other-income/advance P0 vs P1 | pm |

---

## 12. Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-hrm-amis-parity-sa-01.md`

### next_dispatch_prompt (primary — PAY depth DOC)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-DEPTH-01
from_role: pm
to_role: ba-process
lane: governance
priority: P0
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
co_read: docs/qa/evidence/po-hrm-amis-parity-sa-01.md · po-hrm-amis-parity-ba-01.md §2

## Mission
Depth SoT DOC-ready for AMIS Tiền lương spine → feed PAYROLL-FORMULA-RUN-GAP + Enterprise SRS DOC-DELTA.
Lock: BR-AMIS-PAY-SRC-01..05 · AC-AMIS-PAY-TPL-01/02 · AC-AMIS-PAY-SRC-01 · storage SA Option B (override = FK to pay_formula_definition published version).
pay_sheet_template ADD (not salary_templates enroll). Cấm GĐ1 formula DnD · AI AVA · Face marketing · parity DONE.

## Deliver
1. Evidence docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md
2. BR/AC pack for template + SRC + input packs (P0 vs P1 per sponsor Q1 note)
3. next_dispatch_prompt: ba-data sheet-template DATA and/or wait formula API-01 → BE

## Exit
PASS_TO_PM · payroll_e2e_ready=false · no apps/** · no UAT flip
```

### next_dispatch_prompt (after formula API-01 CONFIRMED — kill 0₫)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-EVAL-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
entry_criteria: PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01 CONFIRMED + DATA-01 ADD-plan cited
spec_ref: ADR §10 Option A · SA po-hrm-amis-parity-sa-01.md §3–§4 · formula-run-gap-sa-01 §4
read_first: API F.1 evidence · DATA-01 · AMIS SA SRC priority

## Mission
ensureSchema pay_formula_definitions + evaluator + F-PAY-PROCESS bind; SRC short-circuit history/pack then evaluate override/default FK; closed timesheet only; dual-control AuthZ; payslip lines ≠ silent 0₫.
cấm: salary_components.formula TEXT as SoT · FE net · open sheet vars · invent GĐ1 DnD · claim payroll_e2e_ready

## Exit
READY_FOR_QA · evidence path · jest lifecycle draft→publish→eval · ATT-412 + FORMULA-412
next: dev-fe GĐ1 form author + qa U65
```

### Parallel (optional — template physical)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P0
parent: PO-HRM-AMIS-PARITY-RESEARCH-01

## Mission
Physicalize pay_sheet_template + columns + override_formula_definition_id FK per SA storage Option B
(docs/qa/evidence/po-hrm-amis-parity-sa-01.md §3.2 · §4). Alias lock vs salary_templates enroll pack.

## Exit
PASS_TO_PM · next sa F-PAY-SHEET-TPL-01 F.1 · cấm apps/** · payroll_e2e_ready=false
```

---

## Files touched

- `docs/qa/evidence/po-hrm-amis-parity-sa-01.md` (this file — BA fold + storage + wave update)
- **cấm** `apps/**` · no second SA work_item · no ADR wipe
