# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API slice gate** (not browser UF · not module UAT) |
| **priority** | P0 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-02` PASS_TO_PM |
| **portal_url** | `http://127.0.0.1:5173` (L0 observe) · HRM `:28001` · XBOS `:28002` · **PORTAL_DEV_URL** N/A browser this seat |
| **Verdict** | **GO WITH CONDITIONS** — L1 formulas CRUD + dual-control ACCEPT |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-payroll-formula-run-gap-qa-02.md`](po-hrm-payroll-formula-run-gap-qa-02.md) stamp **`PAYFQ2-MSIGD3E0`** |
| **be_ref** | [`po-hrm-payroll-formula-run-gap-be-01.md`](po-hrm-payroll-formula-run-gap-be-01.md) READY_FOR_QA |
| **spec_ref** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` **§4** · **§7** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-02.FINAL.json`](_tmp-po-hrm-payroll-formula-run-gap-qa-02.FINAL.json) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 API GWC ≠ formula LIVE / payroll module UAT / Phase1 DONE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Formula LIVE / evaluator** | **DENIED** | Preview honest **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** |
| **Browser UF PASS** | **DENIED** | No FE GĐ1 form this seat |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | API smoke only · QA recovery rebuild ≠ seed |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 API smoke for **F-PAY-FORMULA-AUTHOR/PUBLISH/LIST** + dual-control + immutable + honest preview stub against API_DESIGN §4 / §7. Audited QA-02 MD + FINAL JSON stamp `PAYFQ2-MSIGD3E0` + BE-01 READY. Proven: POST draft **201** → list/get **200** → submit **pending_publish** → self-publish **403-DUAL** → second actor `admin@xe.vn` → **active** → PUT **409-IMMUTABLE** → preview **412-PREVIEW-STUB** · peer templates **not** claimed as formula SoT. QA pack verify **6/8** = **PROCESS OBS** (missing portal_url + journey_l25 on L1-only MD) — this QC consolidates **8/8**. Residual **R-PAY-F-STALE-DIST** = **CONDITION OK** (ops SOP). Evaluator / FE form remain open → next PM dispatch. **DENIED** formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · UF PASS without FE.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| AC1 POST draft opaque expression | QA-02 · JSON 201 `HRM-PAY-FORMULA-201` · id `d06e0d6d-…` | 🟢 **ACCEPT** |
| AC2 list / get scope | 200 `HRM-PAY-FORMULA-200` · inList · main→holding Plane B | 🟢 **ACCEPT** |
| AC3 submit → second-actor publish → active | pending → active · publisher `admin@xe.vn` | 🟢 **ACCEPT** |
| AC4 dual-control self-publish | **403** `HRM-PAY-FORMULA-403-DUAL` · VAL-PAY-F-01 | 🟢 **ACCEPT** |
| AC5 PUT active immutable | **409** `HRM-PAY-FORMULA-409-IMMUTABLE` · VAL-PAY-F-02 | 🟢 **ACCEPT** |
| AC6 preview stub | **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` · `payroll_e2e_ready:false` in details | 🟢 **ACCEPT** (honest staging) |
| AC7 no pay_sheet_template invent | peer TPL/salary-templates **200** · not formula SoT | 🟢 **ACCEPT** |
| Spec §4 / §7 taxonomy | codes match API_DESIGN | 🟢 **TRACE OK** |
| Honesty `payroll_e2e_ready=false` | MD + machine + preview details | 🟢 **DENIED promote** |
| R-PAY-F-STALE-DIST | BE READY vs live dist 404 until rebuild | 🟡 **CONDITION OK** (process) |
| Evaluator / FE form / process lines | residuals | 🟡 **CONDITION OPEN** — next wave |
| Module UAT / Phase1 | Explicit DENIED | 🟢 |

**Cấm:** invent formula LIVE · `payroll_e2e_ready=true` · Phase1 DONE · browser UF PASS without FE · reopen salary_components.formula as engine · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · evaluator not LIVE · no FE GĐ1 · no process lines UAT · preview stub only |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| DATA/API unlock | prior DATA-01 · API-01 CONFIRMED | — | **ACCEPT** prior governance |
| BE-01 Nest CRUD | `po-hrm-payroll-formula-run-gap-be-01.md` | READY_FOR_QA | **ACCEPT** · jest 18 PASS cited |
| QA-02 L1 smoke | `po-hrm-payroll-formula-run-gap-qa-02.md` | PASS_TO_PM | **ACCEPT** stamp `PAYFQ2-MSIGD3E0` |
| Machine QA-02 | `_tmp-po-hrm-payroll-formula-run-gap-qa-02.FINAL.json` | PASS | **ACCEPT** |
| Pack verify QA-02 | `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-02.md` | exit **1** · **6/8** | 🟡 **PROCESS OBS** — L1 seat; QC consolidates |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `PAYFQ2-MSIGD3E0` | 🟢 |
| `honesty.payroll_e2e_ready` / `formula_live` / `browser_uf` | all **false** | 🟢 |
| `checks.ac1`..`ac7` | all **PASS** | 🟢 |
| `ac4_self_publish_dual` | HTTP **403** `HRM-PAY-FORMULA-403-DUAL` | 🟢 |
| `ac3_second_actor_publish` | **201** · `status=active` · `publisher=admin@xe.vn` | 🟢 |
| `ac5_put_immutable` | **409** `HRM-PAY-FORMULA-409-IMMUTABLE` | 🟢 |
| `ac6_preview_stub` | **412** · warnings `EVALUATOR_NOT_LIVE` · details `payroll_e2e_ready:false` | 🟢 |
| `verdict` | **PASS** | 🟢 |
| Author / publisher `sub` | `ceo@xe.vn` ≠ `admin@xe.vn` | 🟢 dual-control real |

---

## Gate AC audit (API §4 / §7)

| # | Spec / AC | Observed | QC |
|---|-----------|----------|-----|
| 1 | F-PAY-FORMULA-AUTHOR-01 create draft | 201 · `status=draft` · opaque `expressionJson` | 🟢 |
| 2 | F-PAY-FORMULA-LIST-01 list/get | 200 · scope main resolves holding row | 🟢 |
| 3 | F-PAY-FORMULA-PUBLISH-01 SM | draft → pending_publish → active | 🟢 |
| 4 | §7 `403-DUAL` · VAL-PAY-F-01 | Self-publish blocked | 🟢 |
| 5 | §7 `409-IMMUTABLE` · VAL-PAY-F-02 | Active PUT rejected | 🟢 |
| 6 | §7 `412-PREVIEW-STUB` · PREVIEW staging | Honest stub · not LIVE | 🟢 |
| 7 | Non-claim peer templates | pay-sheet-templates / salary-templates peer only | 🟢 |
| 8 | PROCESS bind / evaluator UAT | Not this seat | ⬜ **OUT OF SCOPE** — CONDITION R-PAY-F-EVAL |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC |
|-----------------|-------|-------|-----|
| **L1 F-PAY-FORMULA CRUD + dual-control** (in-scope) | BE-01 READY | 🟢 AC1–7 PASS | 🟢 **PASS / ACCEPT** |
| **J-HRM-07** Lương → phiếu lương | Historical ✅ PASS (W5B) | **not retested this L1** | ⬜ **DEFERRED** — not claimed; ≠ formula LIVE |
| Browser formula author UF | No FE GĐ1 | DENIED | ⬜ **NOT IN SCOPE** — next `dev-fe` |
| Payroll process FORMULA-412 / lines | staged | not claimed | ⬜ **DEFERRED** — R-PAY-F-EVAL |

**U19 note:** This gate certifies the **L1 API slice** named in dispatch — **not** a claim that **J-HRM-07** or payroll module UAT is newly GO. Missing L2.5 browser on formula form does **not** NO-GO L1 CRUD; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + FE form residual) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (L1 API)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| POST draft formula | Create | **PASS** |
| GET list / get by id | Read | **PASS** |
| submit-publish | Update (SM) | **PASS** |
| publish (second actor) | Update (SM) | **PASS** |
| publish (same actor) | Update deny | **PASS** (403-DUAL) |
| PUT active | Update deny | **PASS** (409-IMMUTABLE) |
| POST preview | Read dry-run stub | **PASS** (412 stub honest) |
| Hard-delete formula | Delete | **N/A** — soft-delete/retire path not claimed this smoke |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-02 pack verify **6/8** (portal_url · journey_l25) | **PROCESS OBS** | Expected L1-only MD; QC consolidates **8/8** here — **not** product demote |
| Initial formulas **404** until rebuild dist | **ENV / PROCESS** | R-PAY-F-STALE-DIST CONDITION — post-READY dist refresh SOP |
| AC1–7 HTTP codes vs §7 | **PRODUCT OK** | Dual / immutable / stub match taxonomy |
| Preview **412-PREVIEW-STUB** | **PRODUCT OK** (honest) | Staging ≠ defect |
| Missing FE / evaluator / J-HRM-07 retest | **SCOPE / CONDITION** | Blocks ready=true · **not** L1 product NO-GO |
| No P0/P1 product residual on L1 CRUD | **PRODUCT OK** | Slice ACCEPT |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-F-STALE-DIST** | process P2 | `dev-be` / `devops` | **CONDITION OK** | Documented: READY claimed while live `:28001` dist lacked routes until QA rebuild — SOP: refresh dist after READY |
| **R-PAY-F-EVAL** | P1 staged | `dev-be` | **OPEN CONDITION** | Evaluator + real PREVIEW + PROCESS lines — **DENIED** LIVE claim |
| **R-PAY-FE-FORM** | P1 next | `dev-fe` | **OPEN CONDITION** | GĐ1 formula author form (**no DnD**) after this L1 GWC |
| **R-PAY-AMIS-TPL** | peer | AMIS lane | **OUT OF SEAL** | Template override depth — not this L1 |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** formula UF | L2.5 | `qa` later | **DEFERRED** | Historical shell PASS ≠ formula author UF |

**P0/P1 product residuals for this L1 WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` + R-PAY-F-STALE-DIST (documented) + R-PAY-F-EVAL + R-PAY-FE-FORM — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 GO; **not** product NO-GO for certified L1 CRUD dual-control.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-02.md` | exit **1** · **6/8** (`portal_url` · `journey_l25`) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-01.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness `node scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-02.mjs` (prior) | **PASS** · stamp `PAYFQ2-MSIGD3E0` | PRODUCT OK (cited) |
| BE `pnpm --filter hrm-api exec jest --testPathPatterns=pay-formula.service.spec …` (prior) | Suites **2** · Tests **18** **PASS** | PRODUCT OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack audit.

---

## completion_report

### Closed

1. QC L1 slice gate on payroll formulas CRUD + dual-control — **GO WITH CONDITIONS**.  
2. Audited QA-02 MD + FINAL JSON + BE-01 + API §4/§7 — AC1–7 **ACCEPT**.  
3. Honesty locks held: `payroll_e2e_ready=false` · formula LIVE **DENIED** · browser UF **DENIED**.  
4. R-PAY-F-STALE-DIST documented as **CONDITION OK** (process SOP).  
5. QA pack 6/8 = PROCESS OBS; this QC pack consolidates mandatory sections.  
6. Explicit **NO** to PM promote ready flag · **NOT** Phase 1 DONE · **C-SLICE-≠-MODULE**.

### Residual (open for next dispatch)

- R-PAY-FE-FORM → **dev-fe** GĐ1 form (no DnD)  
- R-PAY-F-EVAL → **dev-be** evaluator wave (staged)  
- Module UAT / J-HRM-07 formula UF → **qa** only after FE  

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → dispatch **dev-fe** (preferred) **or** **dev-be** evaluator |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | After GWC → **dev-fe** GĐ1 formula form (no DnD) — **cấm** flip `payroll_e2e_ready` / claim UF PASS without FE |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-01 GO WITH CONDITIONS (L1 API slice)
priority: P0

## Mission
GĐ1 payroll formula author form (no DnD): draft create/edit · submit-publish UX · dual-control messaging · immutable active guard · preview shows honest 412 stub (not LIVE claim). Wire Nest /api/hrm/payroll/formulas* only.

entry_criteria:
- QC-01 GWC · evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-01.md
- API_DESIGN §4 AUTHOR/PUBLISH/LIST · BE-01 READY · QA-02 L1 PASS
- ADR Form GĐ1 — cấm DnD canvas
- U65 zero-seed

exit_criteria:
- FE form binds display-ready fields from API (no FE formula engine)
- draft → submit-publish path; surface 403-DUAL / 409-IMMUTABLE / 412-PREVIEW-STUB honestly
- CODE-MEMORY + solid_convention_ack FE–BE boundary
- READY_FOR_QA · evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-01.md
- honesty: payroll_e2e_ready=false · cấm claim formula LIVE / UF PASS without QA browser

cấm: invent evaluator on FE · salary_components.formula as SoT · DnD · seed · flip payroll_e2e_ready

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-02.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4 · §7
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md
```

**Alternate (if PM prioritizes evaluator before FE):**

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
from_role: pm
to_role: dev-be
lane: execution
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-01 GWC
Mission: Ship staged evaluator + deepen PREVIEW beyond stub only when att_timesheet_line / closed-sheet bag ready; keep honest FORMULA-412 / ATT-412; payroll_e2e_ready=false until UF-proven. evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-eval-01.md
```
