# PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01 — Option/F.1 · AC-PLT-SI-INS-01 insurance-type catalog (Nest SoT)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-DOCS-01` **DOC-DELTA ACCEPT** · U88 continuous |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-SI-INS-01** · **DEFINE** Nest SoT (AS-IS Settings MD only — **no** Nest domain table yet) · **NO CODE** `apps/**` · **no seed** · **no wipe** CTR legal-print / SI enrollment seals · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **UNLOCK** (physical EXPAND) · ba-process **UNLOCK** · BE **HOLD** until BA (+ DATA) |
| **prior_spine** | [`PO-HRM-E2E-LINK-EMP-SA-01`](./PO-HRM-E2E-LINK-EMP-SA-01.md) **F-CORE-SI-02/03** · EMP-BE-02 enrollment ONE SoT `employee_insurances` **SEAL RETAIN** · E3 policy assert Settings `insurance_types` / `insurers` |
| **prior_seals** | CTR legal-print QC-01/02 · library PUB/PULL/APPLY QC-03 **RETAIN** · SI enrollment bridge EMP-BE-02 **RETAIN** · EMP DOC/ET · DEC · PAY Nest SC · ATT leave · REC stage **RETAIN** |
| **ref_peer_emp** | EMP DOC/ET open catalog · [`EMP-VERTICAL-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md) |
| **ref_peer_dec** | DEC decision-types · [`DEC-VERTICAL-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md) |
| **ref_peer_pay** | PAY Nest `salary_components` Option B · [`PAY-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md) **AC-PLT-PAY-01** |
| **ref_peer_att** | ATT Nest `att_leave_type` Option B · [`ATT-LEAVE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) **AC-PLT-ATT-LEAVE-01** |
| **ref_peer_rec** | REC Nest `rec_pipeline_stage` Option B · [`REC-STAGE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md) **AC-PLT-REC-STAGE-01** |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete · §7 Contracts/Settings rows |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-CORE-10** (BH vòng đời) · E3 depth **AC-INS-*** (policy / type / insurer soft-ref) |
| **ref_tech** | [`TECHSPEC_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md) FR-UC-BP-CORE-10 → **F-CORE-SI-02/03** · CTR print OUT |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) **F-CORE-SI-01** · physical Nest `/api/hrm/contracts-insurance/*` · `/api/hrm/employee-insurances*` |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.6 enrollment ONE SoT `employee_insurances` · `insurance_type_key` / AS-IS `type` text · **no** `si_insurance_type` physical yet |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **DENIED** invent SI/CTR module UAT · **DENIED** reopen CTR legal-print GWC without warrant · **DENIED** reopen EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | Enrollment ONE SoT `employee_insurances` · F-CORE-SI-02/03 actions · CTR print-spine / library · UF-HRM-02 · soft-delete · scope_parity U19 · open catalog no CHK IN · E3 typed KEY class (`HRM-INS-TYPE-KEY` / peer UNKNOWN) |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-SI-INS-01 — Nest insurance-type catalog SoT · admin open CREATE · consumer picker when ≠ empty · invent typed KEY 4xx |
| **Requestor** | pm · U88 after REC-STAGE-CATALOG-DOCS-01 ACCEPT |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-CORE-10 · F-CORE-SI-01/02/03 · E3 AC-INS · BR-PLT-02/05/06 · peer AC-PLT-*-01 EMP/DEC/PAY/ATT/REC |

### 1.1 Problem

| Current state | Gap |
|---------------|-----|
| Settings Master Data partition **`insurance_types`** (+ **`insurers`**) via `settingsCatalogs.assertCodeInEffectiveCatalog` | **No** Nest domain catalog table (`si_insurance_type` **absent** — grep empty) — AS-IS ≠ peer EMP/DEC/PAY/ATT/REC Nest SoT |
| Policy create/update (`ContractsInsuranceService.assertInsuranceTypeKey`) → **`HRM-INS-TYPE-KEY`** when MD catalog ≠ empty | Catalog **admin** Settings MD ≠ named **Nest** SoT + **consumer invent** AC pack peer ATT/PAY/REC |
| Enrollment create (`EmployeeInsurancesService`) accepts free-text **`type`** (default `social`) — **no** catalog assert | Consumer enrollment / SI timeline may invent while policy path asserts MD — dual consumer rigor gap |
| FE `catalogSearchPicker` binds Settings `insurance_types` | Risk of locking Settings MD alone as SoT (PAY O4 / ATT leave_types class) while peers chose Nest domain |
| CTR legal-print / SI enrollment seals · honesty printable/personnel | **FORBIDDEN** invent reopen / flip `contracts_printable_ready` / `hrm_personnel_uat_ready` |

**Failure if unresolved:** Settings MD remains sole SoT while peers Nest; enrollment invents free-text `type`; PM flips printable/personnel; ba-data invents mega EAV; CTR legal-print GWC reopened without warrant.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `contracts_printable_ready=true` · `hrm_personnel_uat_ready=true` · module SI/CTR UAT · Phase1 · invent CTR legal-print reopen without warrant
- **SEAL RETAIN:** CTR legal-print QC-01/02 · library QC-03 · SI enrollment EMP-BE-02 · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS
- Cite existing contracts-insurance / employee-insurances paths — **cấm** invent `/api/hrm/platform/si/*` mega catalog
- **Enrollment lifecycle SoT** remains `employee_insurances` — catalog seat ≠ rewrite enrollment schema

---

## 2. Options

### Option A — Settings Master Data `insurance_types` = sole picker SoT

| | |
|--|--|
| **Description** | Keep consumer policy / enrollment / rate-cfg bind only settings-catalogs partition `insurance_types`; never Nest-physicalize type catalog. |
| **Benefits** | Matches AS-IS E3 assert + FE picker today; zero DDL. |
| **Costs** | Permanent orphan vs peer EMP/DEC/PAY/ATT/REC Nest domain SoT; Settings MD class rejected on those verticals; enrollment free-text stays soft. |
| **Risks** | AC green on MD while Platform Option B demands Nest ICatalogRow — **REJECT** as primary SoT. |

### Option B — Nest `si_insurance_type` (F-SI-CAT-TYP/EFF) = authoritative insurance-type catalog · consumer picker when ≠ empty — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **EMP DOC/ET · DEC decision-types · PAY salary_components · ATT leave · REC stage**: single open insurance-type catalog = Nest **`public.si_insurance_type`** (ADD physical) via **F-SI-CAT-TYP-01** list + **F-SI-CAT-EFF-01** effective (tenant writer = SoT; Settings partition `insurance_types` = **group REF merge-read only** — ATT leave_types dual-SoT class). When **effective active count > 0**, consumers **must** pick `insurance_type` / enrollment `type` / rate-cfg `insurance_type_key` ∈ catalog (**BR-PLT-02** · **AC-PLT-SI-INS-01**). FE picker binds Nest **GET `…/insurance-types/effective`** (display-ready), **not** Settings MD density alone. Catalog **admin** CREATE N+1 on Settings SI type tab / **F-SI-CAT-TYP-02** remains **open slug** (**BR-PLT-05**). Invent unknown key → typed KEY 4xx — **retain** `HRM-INS-TYPE-KEY` (E3) as synonym of peer `*-UNKNOWN` class (BA may alias `HRM-SI-INS-TYPE-UNKNOWN` without breaking E3 matrix). |
| **Benefits** | Aligns Platform Option B · peer AC packs · SRS CORE-10 type field integrity · closes MD-vs-Nest ambiguity; enrollment assert gap addressable after Nest EFF. |
| **Costs** | ba-data physical ADD · ba-process AC surface matrix · BE/FE after BA+DATA. |
| **Risks** | Misread as reopen CTR print / flip printable → mitigate **L-SI-INS-09/10**. Misread as fold `insurers` / enrollment rewrite → **L-SI-INS-08**. |

### Option C — Invent contracts_printable_ready / hrm_personnel_uat_ready / reopen CTR legal-print / mega EAV

| | |
|--|--|
| **Description** | Flip printable or personnel ready; reopen CTR legal-print GWC; or ADD parallel `hrm_si_catalog_rows` mega table. |
| **Benefits** | Fake module green. |
| **Costs** | Honesty breach · seal churn. |
| **Risks** | **REJECT** — DENY invent UAT · DENY CTR reopen without warrant · DENY mega-EAV (ADR Q-PLT-03). |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings MD SoT | **B Nest F-SI-CAT** | C Invent printable/UAT |
|----------|-------:|------------------:|--------------------:|-----------------------:|
| Business value (CORE-10 / BR-PLT-02) | 5 | 2 | **5** | 0 |
| Honesty / seal safety | 5 | 3 | **5** | 0 |
| Single insurance-type SoT reliability | 5 | 1 | **5** | 1 |
| Time to deliver | 4 | 5 | **2** | 5 |
| Complexity | 4 | 4 | **3** | 1 |
| Maintainability (peer EMP/DEC/PAY/ATT/REC) | 4 | 1 | **5** | 0 |
| **Weighted** | | 70 | **105** | 24 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Peers EMP/DEC/PAY/ATT/REC already Nest SoT + consumer KEY 4xx; SI AS-IS is Settings-only — must **define Nest SoT** (not keep A); residual = physicalize + named AC pack, not mega-EAV / UAT invent. |
| **Rejected** | **A** Settings-MD-only picker SoT · **C** invent printable/personnel / CTR reopen / mega table |
| **Assumptions** | Enrollment ONE SoT + CTR print-spine stay must_keep — **not** this AC; `insurers` catalog = adjacent OUT GĐ1 residual. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **UNLOCK** — **ADD** `public.si_insurance_type` (`ICatalogRow`) · **FORBIDDEN** second mega catalog / rewrite `employee_insurances` schema |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01` AC pack (**AC-PLT-SI-INS-01***) |
| Unlock ba-data? | **YES** this seat — Nest **absent** ⇒ physical **EXPAND** required (peer EMP/DEC/ATT vertical class — **≠** ATT-LEAVE HOLD) |
| Unlock BE? | **HOLD** until BA AC pack **and** DATA CONFIRMED — then Nest ensureSchema + F-SI-CAT-* + consumer assert deepen |
| Unlock FE picker rebind? | After BA+BE — bind EFF Nest; Settings MD alone **REJECT** as sole SoT |
| Printable / personnel / CTR print? | **FORBIDDEN** invent from this seat |

### 4.2 Peer / adjacent (cite — do not reopen)

| Catalog / ops | Nest / SoT | This seat |
|---------------|------------|-----------|
| Insurance **type** codes | **DEFINE** Nest `si_insurance_type` · F-SI-CAT-TYP/EFF | **OWN** AC-PLT-SI-INS-01 |
| Insurers | Settings `insurers` · E3 `HRM-INS-INSURER-KEY` | **OUT GĐ1 residual** — optional later Catalog P2 (**≠** type SoT) |
| Enrollment lifecycle | `employee_insurances` ONE SoT · F-CORE-SI-02/03 | **must_keep RETAIN** |
| Policy CRUD | `/contracts-insurance/insurance-policies` | Consumer of type (+ insurer OUT) |
| PAY rate master | `pay_insurance_rate_cfg.insurance_type_key` | Consumer of type catalog — BA enumerate |
| CTR template / clause / print / library | CTR legal-print spine | **SEAL RETAIN** — **FORBIDDEN** reopen |
| Legacy `employee_insurance_records` | Bridge source only | **≠** enrollment SoT · **≠** type catalog |

---

## 5. Locks (L-SI-INS-*)

| Lock | Rule |
|------|------|
| **L-SI-INS-01 Admin ≠ consumer** | **Catalog admin** POST/PUT F-SI-CAT-TYP-02 = **open key N+1** (BR-PLT-05). **Consumers** (policy create/update · enrollment create/update `type` · rate-cfg upsert when catalog >0) = **picker/FK only** (BR-PLT-02 · **AC-PLT-SI-INS-01**). |
| **L-SI-INS-02 Code SoT** | Authoritative type list = Nest `si_insurance_type` via **F-SI-CAT-TYP-01** + **F-SI-CAT-EFF-01** — **FORBIDDEN** Settings MD alone as sole SoT |
| **L-SI-INS-03 Dual SoT** | HRM tenant writer Nest = SoT; Settings/XBOS `insurance_types` = **group REF merge-read** only — tenant wins collision (**BR-PLT-06** · ATT leave peer) |
| **L-SI-INS-04 Empty catalog** | Effective active count **=0** → empty picker + VI guidance / optional create CTA; **FORBIDDEN** fake/seed density in UF (U65); admin CREATE still allowed |
| **L-SI-INS-05 Soft-delete** | Retired/`archived_at` hidden from default picker; past enrollment/policy keys remain (**BR-PLT-04**) |
| **L-SI-INS-06 Scope** | list ↔ get-by-id ↔ consumer assert same `resolveHrmListScope` (**U19**) |
| **L-SI-INS-07 Invent KEY** | When catalog ≠ empty and body type key ∉ effective → **`HRM-INS-TYPE-KEY`** (retain E3) / BA alias UNKNOWN — format-only codes **do not** bypass membership |
| **L-SI-INS-08 Adjacent OUT** | **FORBIDDEN** fold insurers catalog / CTR print / enrollment SM rewrite / PAY formula LIVE into this AC pack |
| **L-SI-INS-09 Seals retain** | **FORBIDDEN** reopen CTR legal-print GWC · SI enrollment EMP-BE-02 · EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS without warrant |
| **L-SI-INS-10 Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · payroll/ATT/REC ready false · **`C-SLICE-≠-MODULE`** · DENY module SI/CTR UAT |

```text
  XBOS / Settings insurance_types ──► group REF merge-read only
           │
  F-SI-CAT-TYP CRUD ──► public.si_insurance_type (code SoT)  [ADD physical]
           │
           ▼
  F-SI-CAT-EFF-01 effective
           │
  Consumers (when count>0): pick type ∈ catalog
    · POST/PATCH insurance-policies (insurance_type) — FR-HRM-CI / E3 AC-INS
    · POST/PATCH employee-insurances (type) — FR-UC-BP-CORE-10 · F-CORE-SI-02
    · Settings insurance-rate-cfg (insurance_type_key) — BA enumerate
           │
  Settings MD alone ──► NOT sole picker SoT (Option A REJECT)
  insurers ──► OUT residual (E3 retain path until SI-INSURER seat)
  CTR legal-print / printable invent ──► OUT this seat
  Enrollment ONE SoT employee_insurances ──► must_keep SEPARATE
```

---

## 6. F.1 capability pointer (DEFINE Nest — cite contracts-insurance / employee-insurances)

| Cap | Path / rule (target) | AC |
|-----|----------------------|-----|
| List / admin SoT | **F-SI-CAT-TYP-01** `GET /api/hrm/contracts-insurance/insurance-types` | AC-PLT-SI-INS-01d peer |
| Effective picker SoT | **F-SI-CAT-EFF-01** `GET …/insurance-types/effective` | **AC-PLT-SI-INS-01** |
| Admin create open | **F-SI-CAT-TYP-02** POST/PUT/retire — N+1 slug OK | **≠** consumer free-text |
| Consumer assert policy | EXPAND `assertInsuranceTypeKey` → Nest EFF when count>0 (migrate off MD-only) | **AC-PLT-SI-INS-01** · **01b** |
| Consumer assert enrollment | EXPAND create/update `type` ∈ EFF when count>0 | **AC-PLT-SI-INS-01** · VAL-SI-CNS-* |
| Consumer rate-cfg | `insurance_type_key` ∈ EFF when count>0 | BA enumerate |
| Enrollment actions | F-CORE-SI-03 — **must_keep** · not type catalog | DENY fold |
| CTR print / library | Existing spines — **cite** — **OUT** reopen | DENY |

**AS-IS cite (code — do not treat as Nest SoT):**

- `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` — `assertInsuranceTypeKey` · `catalogKey: 'insurance_types'` · `HRM_INS_TYPE_KEY`
- `apps/api/hrm-api/src/employee-insurances/employee-insurances.service.ts` — free-text `type` (GAP for BA)
- `apps/web/hrm/src/lib/catalogSearchPicker.ts` — Settings `insurance_types` picker

**Error (consumer invent):** catalog ≠ empty ∧ type key ∉ effective → **`HRM-INS-TYPE-KEY`** (400) — BA may document UNKNOWN alias.

**Physical pointer (ba-data):** ADD `public.si_insurance_type` columns peer `att_leave_type` / `emp_document_type` — `id`, `company_id`, `insurance_type_key` (open slug), `name_vi`, `status`, `archived_at`, `sort_order?`, timestamps — **no** CHK IN starter set; enrollment/policy keep **text** keys (soft FK).

---

## 7. AC / validation matrix (for ba-process deepen)

| ID | Condition | Expected PASS | FAIL |
|----|-----------|---------------|------|
| **AC-PLT-SI-INS-01** | Nest/EFF active ≥1 · consumer set type | Picker from F-SI-CAT-EFF-01 · 2xx · F5 key ∈ catalog | Free-text Input as SoT · Settings MD alone |
| **AC-PLT-SI-INS-01b** | Same · invent unknown key | **4xx** `HRM-INS-TYPE-KEY` (typed KEY) | 2xx invent |
| **AC-PLT-SI-INS-01c** | Nest/EFF active =0 | Empty picker + admin may CREATE open · no fake rows in UF | Seed/fake density for UF |
| **AC-PLT-SI-INS-01d** | Catalog admin CREATE N+1 | **2xx** open slug | Closed enum / «must pick existing only» as admin rule |
| **AC-PLT-SI-INS-01H** | Honesty | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · CTR print seals retain · no module SI/CTR UAT | Flip flags / reopen seals |
| **VAL-SI-CNS-01** | Policy invent type when catalog >0 | 4xx KEY | Silent accept |
| **VAL-SI-CNS-02** | Enrollment invent `type` when catalog >0 | 4xx KEY | Free-text SoT |
| **VAL-SI-CNS-03** | List picker scope ≠ assert scope | jest FAIL scope_parity | Drift |

**Consumer surface inventory (ba-process must enumerate exact UF/J-*):** Policy create/update (`J-HRM-INS-E3-01` / AC-INS) · Enrollment create/update on profile SI timeline (FR-UC-BP-CORE-10 · F-CORE-SI-02) · optional Settings `insurance-rate-cfg` type key — **not** F-SI-CAT-TYP-02 admin create alone · **not** insurers · **not** CTR print · **not** SI action suspend/resume core.

**Align note:** **AC-PLT-SI-INS-01** = named peer of **AC-PLT-ATT-LEAVE-01** / **AC-PLT-PAY-01** / **AC-PLT-REC-STAGE-01**; E3 **AC-INS-*** remain — BA pack must cross-ref (no conflicting invent rules).

---

## 8. Failure modes

| Option / path | Failure mode | Detection | Mitigation |
|---------------|--------------|-----------|------------|
| A | MD green · Nest never ships | Peer Nest audits | Reject A |
| B | FE still Settings-only after Nest live | QA AC-PLT-SI-INS-01 picker source | FE rebind EFF |
| B | BE treats admin create as invent | Catalog N+1 4xx | L-SI-INS-01 |
| B | Enrollment still free-text after EFF>0 | VAL-SI-CNS-02 | BE assert deepen |
| C | Claim printable / reopen CTR print | Honesty / seal audit | DENY |
| Any | Seed density for picker | U65 audit | FAIL QA |

---

## 9. Rollout / validation

| Step | Owner | Exit |
|------|-------|------|
| 1 This SA Option B LOCK | sa | **CONFIRMED** (this file) |
| 2 AC pack consumer surfaces | **ba-process** | CONFIRMED AC-PLT-SI-INS-01* click paths |
| 3 Physical Nest table | **ba-data** | CONFIRMED `si_insurance_type` ADD-plan |
| 4 BE Nest + consumer assert | **dev-be** HOLD→unlock after BA+DATA | jest VAL-SI-CNS-* · F-SI-CAT-* |
| 5 FE picker rebind | **dev-fe** after BE | EFF Nest bind · MD alone reject |
| 6 QA U65 invent + picker | qa | browser · zero-seed · no printable/personnel flip |
| 7 QC slice GWC | qc | `C-SLICE-≠-MODULE` · honesty false |

**Rollback:** retain CTR/SI enrollment seals; additive Nest table only — no DDL drop of enrollment.

**Success (this seat):** Option B locked · Nest SoT **defined** · ba-data **UNLOCK** · ba-process **UNLOCK** · BE **HOLD** · honesty false · seals retained · CTR legal-print **not** reopened.

---

## 10. Non-claims

- No `apps/**` / migration / seed.
- No `contracts_printable_ready=true` · no `hrm_personnel_uat_ready=true` · no module SI/CTR UAT · no Phase1.
- No invent reopen CTR legal-print GWC / SI enrollment EMP-BE-02 / EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS without warrant.
- No claim payroll e2e / formula LIVE / insurers Nest this seat.
- Enrollment ONE SoT + F-CORE-SI-02/03 **remain** — this file owns **AC-PLT-SI-INS-01 type catalog Option** (peer ATT-LEAVE / PAY / REC-STAGE), not a second enrollment redesign.

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **next_owner** | **pm** → **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01` (+ parallel **ba-data** `…-SI-INS-CATALOG-DATA-01` OK) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-sa-01.md` |
| **ba-data** | **UNLOCK** (physical EXPAND — Nest absent) |
| **BE** | **HOLD** until BA (+ DATA) |
