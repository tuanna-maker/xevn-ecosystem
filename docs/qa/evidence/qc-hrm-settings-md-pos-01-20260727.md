# QC Gate Decision — QC-HRM-SETTINGS-MD-POS-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-SETTINGS-MD-POS-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-27` |
| **decision** | **GO WITH CONDITIONS** |
| **scope** | Settings **Chức danh** / POS UI (`MdBucket=positions` → writeKey `job_titles`) — create→POST **201**→F5 · empty CTA · POS-SEED **403** — **local only** |
| **environment** | Local portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` · `company_id=main` |
| **HOLD_DEPLOY** | **honored** — **no** `:8088` / Phase1 / PROD claim |
| **U65** | zero-seed — QA reports **none** (`pnpm seed:*` not run); seed probe only (expect 403) |
| **Phase1 / PROD** | **NONE** — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `:8088` |
| **Full Settings MD matrix 🟢** | **NOT** in scope / **NOT** approved |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Mission / prior residual

| Prior | Status entering this gate |
|-------|---------------------------|
| `QC-HRM-SETTINGS-MD-LEAVE-DEPT-01` | GWC CLOSED — leave+dept; **POS deferred** |
| `QC-HRM-SETTINGS-MD-JT-01` | GWC CLOSED — JT **consumer** (Recruitment pick `job_titles` → `position_code`) |
| This WI | Close residual **«POS deferred»** for **Settings Chức danh CRUD** (not JT consumer; not N/A) |

**SoT clarification (QC accepts QA §0):** Settings bucket **Chức danh** (`positions` UI / `writeKey: job_titles`) is a **separate** Settings master-data path from JT consumer. **Not N/A** after JT GWC.

---

## 1. Evidence consumed

| # | Artifact | Role | Status |
|---|----------|------|--------|
| 1 | `docs/qa/evidence/qa-hrm-settings-md-pos-browser-01-20260727.md` | QA primary | **READY_FOR_QC** · Overall **PASS** · U65 · HOLD_DEPLOY |
| 2 | `docs/qa/evidence/_tmp-qa-hrm-settings-md-pos-browser-01-runtime.json` | QA runtime | All steps `ok:true` · verdicts all **PASS** · `fullMatrixGreenClaimed: false` |
| 3 | `docs/qa/evidence/qc-hrm-settings-md-leave-dept-01-20260725.md` | Prior QC | GWC — POS deferred residual |
| 4 | `docs/qa/evidence/qc-hrm-settings-md-jt-01-20260725.md` | Prior QC | GWC — JT consumer CLOSED (not re-run) |
| 5 | `docs/qa/evidence/be-hrm-settings-md-pos-seed-01-20260725.md` / `qa-hrm-settings-md-pos-seed-01-20260725.md` | BE/QA seed gate | POS-SEED **403** CLOSED — **do not reopen** |

---

## 2. Evidence pack integrity (Layer B — PASS)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-settings-md-pos-browser-01-20260727.md
→ exit 0 — PASS: QC evidence pack ready (8/8)
```

| Check | Result |
|-------|--------|
| Pack completeness | **8/8 PASS** |
| Layer B process gate | **PASS** |
| Rule `.cursor/rules/qc-evidence-pack-gate.mdc` | Satisfied before GWC |

---

## 3. Product audit (promoted — bounded local)

| AC / assert | QA claim | Runtime corroboration | QC verdict |
|-------------|----------|----------------------|------------|
| Form `#md-code-positions` / `md-upsert-form-positions` visible | PASS | `hasCode/hasForm/hasBucket=true` · FR hint | **PASS** |
| POST `/api/hrm/settings-catalogs/items` **201** writeKey `job_titles` | PASS · code `QA_POS_2LVZCM` | Network POST 201 · body `category_key=job_titles` · `writeKeyHint=true` | **PASS** |
| F5 row persists | PASS | `ac-pos-f5` code in DOM | **PASS** |
| API `job_titles.effectiveItems` has code | PASS · n=8→9 | `code=QA_POS_2LVZCM in job_titles=true n=9` | **PASS** |
| Empty CTA (intercept) · no fake bootstrap | PASS | `amberOrCta=true` · `fakeBootstrap=false` | **PASS** |
| Employees picker surface (smoke) | PASS | labels `Chức vụ` · `comboboxN=7` | **PASS** (surface only; full employee mutate **not** required) |
| POS-SEED remains gated | PASS · **403** `HRM-CAT-POS-SEED-FORBIDDEN` | `pos-seed-403` ok | **PASS** — **do not reopen** |
| Seed mutate / invent happy path | none | U65 | **OK** |

### AC-SET-FS rollup (Chức danh / POS Settings)

| AC | QC |
|----|-----|
| **AC-SET-FS-01** effectiveItems options | **PASS** |
| **AC-SET-FS-03** persist **code** not free label | **PASS** (`item_key` / `category_key=job_titles`) |
| **AC-SET-FS-05** empty honesty | **PASS** |

---

## 4. L2.5 journey (U19)

| ID | QA pack | QC |
|----|---------|-----|
| **J-HRM-MENU-SWEEP** (Settings catalogs · Chức danh create→201→F5) + **UF-HRM-10** | **PASS** | **PASS** — click path documented + runtime network |
| **J-HRM-05** (JT consumer) | Already CLOSED `QC-HRM-SETTINGS-MD-JT-01` | **not re-run** — out of this WI |
| Leave+dept journeys | Prior GWC | **out of scope** |

**U19:** In-scope journey row present and PASS. No mandatory J-* left untested for this bounded slice.

**J-\* tested PASS this slice:** **J-HRM-MENU-SWEEP** + **UF-HRM-10** (Chức danh create).  
**J-\* deferred:** none mandatory for POS Settings CRUD; full employee `job_title_key` mutate = P3 optional (residual, not blocker).

---

## 5. Classification

| Finding | Type | Gate impact |
|---------|------|-------------|
| Chức danh create→201→F5 · writeKey `job_titles` · empty CTA · POS-SEED 403 | **PRODUCT** | **PASS** — promote bounded local |
| SoT «N/A because JT closed» | **Governance** | **Rejected** — Settings CRUD path exists and PASS |
| Pack Layer B 8/8 | **Process** | **PASS** |
| HOLD_DEPLOY / not `:8088` | Governance | Standing condition (not product fail) |
| Full Settings MD matrix (decisionTypes, salary, fleet, import, …) | Out of scope | **NOT** greened |
| Employees create→persist `job_title_key` full UF | P3 optional | Residual — not required to close POS Settings |

---

## 6. Conditions (GO WITH CONDITIONS)

| Condition | Owner | Status |
|-----------|-------|--------|
| Residual **«POS deferred»** (Settings Chức danh CRUD) | qc → pm | **CLOSED** this gate |
| POS-SEED / G-ORPH-BE-03 reopen | — | **CLOSED** — 403 confirmed; **cấm reopen** |
| HOLD_DEPLOY · NOT Phase1/PROD/:8088 | pm | **OPEN** (standing) — local GWC only |
| Full Settings MD matrix 🟢 | pm / later QA | **OPEN deferred** — **NOT** promoted |
| Employees full mutate `job_title_key` | qa later (P3) | Optional residual — not blocker |

**GO WITH CONDITIONS** = product POS Settings local PASS + pack 8/8 + U19 journey PASS; **NOT** Phase 1 DONE · **NOT** full matrix 🟢 · **NOT** `:8088` / PROD.

---

## 7. Forbidden compliance

| Rule | Status |
|------|--------|
| No seed in evidence (U65) | **OK** |
| No POS-SEED reopen | **OK** (403 only) |
| No Phase1 DONE / PROD / `:8088` claim | **OK** |
| No full matrix 🟢 claim | **OK** (`fullMatrixGreenClaimed: false`) |
| Pack verify exit 0 before GO/GWC | **OK** (QC re-ran 8/8) |
| No invent for happy path | **OK** |

---

## 8. Residual closed vs remaining

| Item | Status |
|------|--------|
| Settings Chức danh / POS create→201→F5 (local) | **CLOSED** — product promote under GWC |
| «POS deferred» from leave+dept GWC handoff | **CLOSED** |
| JT consumer J-HRM-05 | Remains CLOSED (prior) — unchanged |
| Full Settings MD matrix / Phase1 / PROD / `:8088` | **Still open** — standing program conditions |

---

## 9. Handoff

```yaml
work_item_id: QC-HRM-SETTINGS-MD-POS-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
decision: GO WITH CONDITIONS
evidence_path: docs/qa/evidence/qc-hrm-settings-md-pos-01-20260727.md
next_owner: pm
completion_report: |
  Independent QC after QA-HRM-SETTINGS-MD-POS-BROWSER-01 READY_FOR_QC.
  verify:qc:evidence-pack exit 0 (8/8). Runtime corroborates POST 201
  category_key=job_titles code QA_POS_2LVZCM → F5 + API n=9; empty CTA;
  POS-SEED 403. L2.5 J-HRM-MENU-SWEEP + UF-HRM-10 PASS. Residual «POS deferred»
  CLOSED for Settings Chức danh CRUD. HOLD_DEPLOY · NOT Phase1/PROD/:8088 ·
  NOT full Settings MD matrix 🟢. No Dev reopen. Do not reopen POS-SEED.
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-SETTINGS-MD-POS-GWC-CLOSE-01
from_role: pm
to_role: pm
lane: governance
entry: QC-HRM-SETTINGS-MD-POS-01 GO WITH CONDITIONS · docs/qa/evidence/qc-hrm-settings-md-pos-01-20260727.md
action:
  1) Bus INTAKE — mark Settings Chức danh/POS local GWC VERIFIED; close residual «POS deferred» on residual lists / TEAM_WORKING_NOW
  2) Do NOT green full Settings MD matrix; do NOT claim Phase1/PROD/:8088
  3) Do NOT reopen POS-SEED (403 stands); do NOT reopen leave+dept or JT product AC without new defect
  4) Next execution only if PM program priority picks remaining MD buckets (decisionTypes / salary / fleet / import) or P3 employee job_title_key full UF
exit: bus + residual lists updated; HOLD_DEPLOY remains
cấm: seed · invent matrix 🟢 · deploy :8088 · reopen POS-SEED · claim Phase1/PROD
```
