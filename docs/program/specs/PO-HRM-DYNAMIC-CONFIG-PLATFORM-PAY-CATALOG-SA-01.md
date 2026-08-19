# PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01 — Option/F.1 · AC-PLT-PAY-01 consumer picker (catalog ≠ empty)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-EXT-QC-01` **GWC** · **R-EMP-TOK-EXT SEALED** · U88 continuous |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-PAY-01** · **REFINE** consumer SoT vs catalog admin · **NO** new physical table · **NO CODE** `apps/**` · **no seed** · **no wipe** PAY-CATALOG QC · EXT · EMP · DEC · CTR · LIST-TOTALS |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **HOLD** · ba-process **UNLOCK** · BE consumer-validate **HOLD** until BA AC pack |
| **prior_api** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md) F-PLT-PAY-COMP-01..04 **CONFIRMED** · QC GWC [`pay-catalog-qc-01`](../../qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-qc-01.md) **SEAL RETAIN** |
| **ref_qc_peer** | [`po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md`](../../qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qc-01.md) · stamps `EMPTOKEXTQA-MSJ57PE1` · `EMPTOKQA-MSJ290VB` |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete · §7 PAY row |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **AC-PLT-PAY-01** · **BR-PLT-02/04/05** · [`po-hrm-amis-parity-ba-01`](../../qa/evidence/po-hrm-amis-parity-ba-01.md) Step2 · **AC-PAY-COMP-01** |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-PAY-02** dual SoT + **AC-PAY-COMP-01** · platform **AC-PLT-PAY-01** |
| **ref_peers** | EMP DOC/ET · DEC decision-types · [`PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md`](./PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md) PC↔SC dual SoT |
| **ref_formula** | [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md`](./PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) — **cấm** reopen / invent formula LIVE |
| **ref_as_is_gap** | [`po-hrm-e2e-link-pay-cfg-qa-02.md`](../../qa/evidence/po-hrm-e2e-link-pay-cfg-qa-02.md) **O4-CATALOG-DENSITY-01** — FE picker bound Settings key absent while Nest SC rows exist |
| **Honesty** | `payroll_e2e_ready=false` · **DENIED** formula LIVE · **DENIED** J-HRM-07 FULL GWC reopen/flip · **DENIED** reopen EXT·EMP·DEC·CTR·LIST-TOTALS · `printable=false` · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | F-PLT-PAY-COMP-* live paths · `pay_types` E2 REF · soft-delete · open catalog no CHK IN (N) · scope_parity U19 · formula TEXT ≠ engine · OS28 FE no net |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-PAY-01 / AC-PAY-COMP-01 — picker SoT when `salary_components` effective ≠ empty |
| **Requestor** | pm · U88 after EXT-QC-01 GWC |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-PAY-02 · BR-PLT-02 · AC-PLT-PAY-01 · AC-PAY-COMP-01 · F-PLT-PAY-COMP-01 · Allowance SYNC · O4 residual |

### 1.1 Problem

| Current state | Gap |
|---------------|-----|
| Nest **`salary_components`** open catalog CRUD **SEALED** (PAY-CATALOG QC GWC · stamp `PAYCATQA-R2-MSILIVE`) | Catalog **admin** UF ≠ claim **consumer** picker AC |
| FE `CatalogSearchPicker` historically keys Settings overview `salary_components` / `payroll_components` | Settings key **ABSENT** (O4) → picker never flips while Nest has rows — **false dual SoT** |
| SRS dual SoT: (1) component **code** catalog · (2) `pay_types` nature REF | Code SoT must be **one** authoritative list for consumers |
| Formula API / ATT-line / ESS / LIST-TOTALS peers sealed or staged | **FORBIDDEN** invent formula LIVE to «pass» AC-PLT-PAY-01 |

**Failure if unresolved:** FE invents free-text codes on template/period/C&B while Nest catalog >0; or PM unlocks BE that reopens formula; or ba-data invents second catalog table; seals churned.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `payroll_e2e_ready=true` · formula LIVE · printable · Phase1 · J-HRM-07 flip
- **SEAL RETAIN:** PAY-CATALOG QC · EXT · MERGE-TOKEN-EMP · EMP-QC · DEC · CTR · LIST-TOTALS
- Cite existing paths — **cấm** invent `/api/hrm/platform/pay/*`

---

## 2. Options

### Option A — Settings extension `salary_components` = sole picker SoT (O4 synthesize)

| | |
|--|--|
| **Description** | Synthesize Settings overview key; FE continues CatalogSearchPicker on extension-items density; Nest `salary_components` remains separate admin table. |
| **Benefits** | Matches older e2e-link FE assumption; small Settings overview change. |
| **Costs** | **Dual orphan** persists (Settings vs Nest); PAY-CATALOG GWC unused for picker; Allowance SYNC already chose Nest as PAY runtime identity. |
| **Risks** | AC-PLT-PAY-01 green on Settings while process/template bind Nest codes — **REJECT** as primary SoT. |

### Option B — Nest `salary_components` (F-PLT-PAY-COMP-01) = authoritative code catalog · consumer picker when ≠ empty — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **EMP DOC/ET · DEC decision-types · Allowance PAY mirror**: single open catalog = Nest `public.salary_components` via **F-PLT-PAY-COMP-01** list. When **effective active count > 0**, consumer forms **must** pick `code` ∈ catalog (**BR-PLT-02** · AC-PLT-PAY-01 · AC-PAY-COMP-01). FE picker binds **GET `/api/hrm/payroll/salary-components`** (display-ready), **not** Settings extension density alone. Catalog **admin** CREATE N+1 remains **open slug** (**BR-PLT-05** · VAL-PAY-COMP-01) — free-text code OK **only** on F-PLT-PAY-COMP-02. `pay_types` stays nature REF (dual SoT layer 2). Allowance PC → mirror SC (**ALLOWANCE-SYNC**) remains ADD path into Nest. Settings `salary_components` extension = **optional REF/alias** or deprecate as picker SoT — **not** second writer. |
| **Benefits** | Aligns SRS FR-UC-BP-PAY-02 · PAY-CATALOG-API-01 · Allowance · EMP/DEC consumer pattern; closes O4 without XBOS P2 invent; no new table. |
| **Costs** | ba-process AC surface matrix + FE rebind + BE assert on consumer writes. |
| **Risks** | Misread AC as «forbid open catalog create» → mitigate: **L-PAY-AC-01** split admin vs consumer (§4). |

### Option C — Invent formula LIVE / new mega catalog / reopen seals

| | |
|--|--|
| **Description** | Claim payroll e2e / formula LIVE; or ADD parallel `hrm_pay_catalog_rows`; or reopen EXT/EMP/DEC/CTR/PAY-CATALOG GWC. |
| **Benefits** | Fake module green. |
| **Costs** | Honesty breach · seal churn · dual SoT. |
| **Risks** | **REJECT** — DENY invent formula LIVE · DENY reopen seals · DENY mega-EAV (ADR Q-PLT-03). |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings SoT | **B Nest F-PLT-PAY-COMP** | C Invent LIVE |
|----------|-------:|---------------:|--------------------------:|--------------:|
| Business value (SRS dual SoT / BR-PLT-02) | 5 | 2 | **5** | 0 |
| Honesty / seal safety | 5 | 3 | **5** | 0 |
| Single code SoT reliability | 5 | 1 | **5** | 1 |
| Time to deliver | 4 | 4 | **3** | 5 |
| Complexity | 4 | 3 | **4** | 1 |
| Maintainability (peer EMP/DEC/Allowance) | 4 | 1 | **5** | 0 |
| **Weighted** | | 66 | **111** | 24 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Nest catalog already LIVE (PAY-CATALOG GWC); SRS/AC name Nest as code SoT; peers EMP/DEC/Allowance use domain table + consumer assert; O4 is FE SoT mis-bind, not missing physicalize. |
| **Rejected** | **A** Settings-only picker SoT · **C** invent formula LIVE / mega table / seal reopen |
| **Assumptions** | F-PLT-PAY-COMP-01..04 remain authoritative; formula engine stays staged peer — **not** this AC. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **HOLD** — `salary_components` already physical (PAY-CATALOG BE/API) · **FORBIDDEN** second catalog table |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01` AC pack (consumer surfaces + admin vs consumer split) |
| Unlock ba-data? | **NO** this seat |
| Unlock BE consumer validate? | **HOLD** until BA AC pack CONFIRMED — then `…-PAY-CATALOG-CNS-BE-01` (assert ∈ catalog on consumer writes) |
| Unlock FE picker rebind? | After BA AC (or parallel with CNS-BE) — bind F-PLT-PAY-COMP-01 |
| Formula / process BE? | **FORBIDDEN** invent from this seat |

---

## 5. Locks (L-PAY-AC-*)

| Lock | Rule |
|------|------|
| **L-PAY-AC-01 Admin ≠ consumer** | **Catalog admin** POST F-PLT-PAY-COMP-02 = **open code N+1** (BR-PLT-05). **Consumers** (template lines · period packs · compensation history lines · formula component refs · hire→period path) when effective Nest SC **>0** = **picker/FK only** (BR-PLT-02 · AC-PLT-PAY-01 · AC-PAY-COMP-01). |
| **L-PAY-AC-02 Code SoT** | Authoritative code list = Nest `salary_components` via **F-PLT-PAY-COMP-01** — **FORBIDDEN** Settings extension density as sole SoT |
| **L-PAY-AC-03 Nature SoT** | `component_type` / nature = **`pay_types`** REF (E2) — keep dual SoT layer 2 |
| **L-PAY-AC-04 Empty catalog** | Effective active count **=0** → consumer may show empty picker + VI guidance; **FORBIDDEN** fake starter in UF (U65); admin CREATE still allowed |
| **L-PAY-AC-05 Soft-delete** | Retired/`is_active=false` hidden from default picker; history codes remain readable (**BR-PLT-04**) |
| **L-PAY-AC-06 Scope** | list ↔ get-by-id ↔ consumer assert same `resolveHrmListScope` (**U19**) |
| **L-PAY-AC-07 Allowance peer** | PC/KT Settings writer → mirror Nest SC (**ALLOWANCE-SYNC**) — **ADD** path; **not** wipe PAY-CATALOG |
| **L-PAY-AC-08 Formula OUT** | **FORBIDDEN** treat this AC as formula LIVE / evaluator / process payslip GO |
| **L-PAY-AC-09 Seals retain** | **FORBIDDEN** reopen PAY-CATALOG QC · EXT · EMP · DEC · CTR · LIST-TOTALS |
| **L-PAY-AC-10 Honesty** | `payroll_e2e_ready=false` · printable=false · J-HRM-07 FULL GWC retain (no flip) · **`C-SLICE-≠-MODULE`** |

```text
  Settings pay_types (REF) ──► component_type on SC / forms
           │
  F-PLT-PAY-COMP CRUD ──► public.salary_components (code SoT)
           │
           ├── Allowance PC SYNC (optional mirror writer)
           │
           ▼
  Consumers (when count>0): pick code ∈ catalog
    · pay_sheet_template lines
    · period / input packs
    · employee compensation / salary-history lines
    · formula expression component refs (soft)
           │
  Settings salary_components extension ──► NOT sole picker SoT (Option A REJECT)
  Formula LIVE / process e2e ──► OUT this seat
```

---

## 6. F.1 capability pointer (cite — do not duplicate API-01)

| Cap | Path / rule | AC |
|-----|-------------|-----|
| List picker SoT | **F-PLT-PAY-COMP-01** `GET /api/hrm/payroll/salary-components?company_id=` · default active | **AC-PLT-PAY-01** |
| Get-by-id | **F-PLT-PAY-COMP-01** `GET …/:componentId` scope_parity | U19 |
| Admin create open | **F-PLT-PAY-COMP-02** — N+1 slug OK | VAL-PAY-COMP-01 · **≠** consumer free-text |
| Consumer assert | EXPAND on existing mutate endpoints: `component_code` ∈ effective SC when count>0 → else **`HRM-SC-COMP-KEY`** / peer 4xx | **AC-PAY-COMP-01** |
| Nature REF | `assertCodeInEffectiveCatalog(pay_types)` | dual SoT · keep |
| Formula bind | `default_formula_definition_id` FK — **hint TEXT ≠ engine** | G-PAY-F-07 · **no LIVE invent** |

**Error (consumer invent):** when catalog ≠ empty and body `component_code` / free-text code not in active|retired-allowed set → **`HRM-SC-COMP-KEY`** (or existing `HRM-COMP-004` class) — format-only codes **do not** bypass membership check.

---

## 7. AC / validation matrix (for ba-process deepen)

| ID | Condition | Expected PASS | FAIL |
|----|-----------|---------------|------|
| **AC-PLT-PAY-01** | Nest SC active ≥1 · consumer create line/TP-on-form | Picker from F-PLT-PAY-COMP-01 · 2xx · F5 code ∈ catalog | Free-text Input as SoT |
| **AC-PAY-COMP-01** | Same · invent unknown code | **4xx** `HRM-SC-COMP-KEY` | 2xx invent |
| **AC-PLT-PAY-01b** | Nest SC active =0 | Empty picker + admin may CREATE open · no fake rows | Seed/fake density for UF |
| **AC-PLT-PAY-01c** | Catalog admin CREATE N+1 | **201** open slug (PAY-CATALOG GWC retain) | Reject as «must pick existing only» |
| **AC-PLT-PAY-01H** | Honesty | ready=false · no formula LIVE · seals retain | Flip flags / reopen seals |
| **VAL-PAY-CNS-01** | Template line `component_code` OOS | 4xx | Silent accept |
| **VAL-PAY-CNS-02** | Compensation history line invent | 4xx | Silent accept |
| **VAL-PAY-CNS-03** | List picker scope ≠ assert scope | jest FAIL scope_parity | Drift |

**Consumer surface inventory (ba-process must enumerate exact UF/J-*):** pay-sheet-template lines · period input packs · EMP salary-history / compensation lines · formula author component refs (soft warn OK GĐ1) — **not** F-PLT-PAY-COMP-02 admin create.

---

## 8. Failure modes

| Option / path | Failure mode | Detection | Mitigation |
|---------------|--------------|-----------|------------|
| A | Settings green · Nest orphan | O4 retest + process bind miss | Reject A; bind Nest |
| B | FE still uses Settings key | QA AC-PLT-PAY-01 picker source probe | FE rebind F-PLT-PAY-COMP-01 |
| B | BE treats admin create as invent | Catalog N+1 4xx | L-PAY-AC-01 · VAL-PAY-COMP-01 retain |
| C | Claim formula LIVE | Honesty flag / seal reopen | DENY · residual to formula peer only |
| Any | Seed density for picker | U65 audit | FAIL QA |

---

## 9. Rollout / validation

| Step | Owner | Exit |
|------|-------|------|
| 1 This SA Option B LOCK | sa | **CONFIRMED** (this file) |
| 2 AC pack consumer surfaces | **ba-process** | CONFIRMED AC-PLT-PAY-01* click paths |
| 3 (optional) DOC-DELTA client SRS wording admin vs consumer | ba-docs | ADD-only if BA flags ambiguity |
| 4 BE assert ∈ catalog on consumers | **dev-be** HOLD→unlock after BA | jest VAL-PAY-CNS-* |
| 5 FE picker rebind Nest list | **dev-fe** | CatalogSearchPicker source = F-PLT-PAY-COMP-01 |
| 6 QA U65 AC-PLT-PAY-01 / COMP-01 | qa | browser · zero-seed · no formula LIVE claim |
| 7 QC slice GWC | qc | `C-SLICE-≠-MODULE` · ready=false |

**Rollback:** retain PAY-CATALOG GWC; revert FE bind only — no DDL drop.

**Success (this seat):** Option B locked · ba-data HOLD · ba-process unlocked · honesty false · seals retained.

---

## 10. Non-claims

- No `apps/**` / migration / seed.
- No `payroll_e2e_ready=true` · no formula LIVE · no J-HRM-07 flip · no printable.
- No reopen EXT · EMP · DEC · CTR · LIST-TOTALS · PAY-CATALOG GWC.
- No claim module PAY UAT / Phase1 / AMIS DONE.
- Prior evidence `pay-catalog-sa-01` API unlock **superseded for residual scope** — API F.1 remains CONFIRMED; this file owns **AC-PLT-PAY-01 consumer Option**.

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **next_owner** | **pm** → **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-sa-01.md` |
| **ba-data** | **HOLD** |
| **BE** | **HOLD** until BA AC pack |
