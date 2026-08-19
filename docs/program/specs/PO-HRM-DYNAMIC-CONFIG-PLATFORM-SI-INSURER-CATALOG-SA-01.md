# PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01 — Option/F.1 · AC-PLT-SI-INSURER-01 insurers Nest open catalog

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QC-01` **GWC** (L1 type catalog **SEAL RETAIN**) · U88 continuous · prior residual insurers Nest OUT (`L-SI-INS-08` / R-PLT-DATA-04 insurers) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-SI-INSURER-01** · **DEFINE** Nest SoT (AS-IS Settings MD `insurers` only — **no** Nest domain table) · **NO CODE** `apps/**` · **no seed** · **no wipe** SI-INS L1 GWC · CTR legal-print · enrollment EMP-BE-02 · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **UNLOCK** (physical EXPAND) · ba-process **UNLOCK** · BE **HOLD** until BA (+ DATA) |
| **prior_spine** | [`SI-INS-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md) Option B **LOCKED** · type Nest `si_insurance_type` **L1 SEAL** · insurers stamped **OUT** · E3 `HRM-INS-INSURER-KEY` path retain until this seat |
| **prior_seals** | SI-INS-CATALOG-QC-01 L1 GWC **RETAIN** · CTR legal-print QC-01/02/03 **RETAIN** · SI enrollment EMP-BE-02 **RETAIN** · EMP DOC/ET · DEC · PAY Nest SC · ATT leave · REC stage **RETAIN** |
| **ref_peer_si_type** | SI insurance-type Nest Option B · [`SI-INS-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-SA-01.md) **AC-PLT-SI-INS-01** · F-SI-CAT-TYP/EFF |
| **ref_peer_att** | ATT Nest leave Option B · [`ATT-LEAVE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) · work-sites Nest EXPAND cite only ([`ATT-VERTICAL-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) F-ATT-CAT-WS) — **≠** insurers physical |
| **ref_peer_pay** | PAY Nest `salary_components` Option B · [`PAY-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md) **AC-PLT-PAY-01** |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete · §7 Contracts/Settings |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** · matrix «Attendance codes / work sites» = ATT domain cite only |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-CORE-10** · E3 **AC-INS-02** (insurer soft-ref) |
| **ref_tech** | [`TECHSPEC_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md) · [`docs/hrm/TECHSPEC.md`](../../hrm/TECHSPEC.md) E-INS-DEPTH · `HRM-INS-INSURER-KEY` |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) **F-CORE-SI-01** · physical Nest `/api/hrm/contracts-insurance/*` · **DOC-DELTA pointer** ADD F-SI-CAT-INS-* (no wipe) |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §3.6 / §3.6a type · policy `insurer_key` text soft · **no** `si_insurer` physical yet · **DOC-DELTA pointer** ADD §3.6b (no wipe · **FORBIDDEN** fold into `si_insurance_type`) |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **DENIED** invent SI/CTR module UAT · **DENIED** reopen SI-INS L1 GWC · **DENIED** reopen CTR legal-print · **DENIED** reopen EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | SI type Nest F-SI-CAT-TYP/EFF L1 seal · Enrollment ONE SoT `employee_insurances` · F-CORE-SI-02/03 · CTR print-spine / library · E3 typed KEY class (`HRM-INS-INSURER-KEY`) · soft-delete · scope_parity U19 · open catalog no CHK IN · type catalog **≠** insurer catalog |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-SI-INSURER-01 — Nest insurers catalog SoT · admin open CREATE · consumer picker when ≠ empty · invent typed KEY 4xx |
| **Requestor** | pm · U88 after SI-INS-CATALOG-QC-01 GWC · residual insurers Nest OUT |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-CORE-10 · E3 AC-INS-02 · BR-PLT-02/05/06 · peer AC-PLT-SI-INS-01 · F-SI-CAT-TYP/EFF sealed |

### 1.1 Problem

| Current state | Gap |
|---------------|-----|
| Settings Master Data partition **`insurers`** (+ aliases `insurance_providers` / `bhxh_providers`) via `settingsCatalogs.assertCodeInEffectiveCatalog` | **No** Nest domain catalog table (`si_insurer` **absent** — grep empty) — AS-IS ≠ peer SI **type** Nest SoT just sealed |
| Policy create/update (`ContractsInsuranceService.assertInsurerKey`) → **`HRM-INS-INSURER-KEY`** when MD catalog ≠ empty | Catalog **admin** Settings MD ≠ named **Nest** SoT + **consumer invent** AC pack peer SI type / ATT / PAY |
| FE `catalogSearchPicker` binds Settings `insurers` (AC-INS-02) | Risk of locking Settings MD alone as SoT (PAY O4 / SI type Option A class) while type peers chose Nest domain |
| SI-INS-CATALOG L1 GWC · honesty printable/personnel · CTR legal-print | **FORBIDDEN** fold insurers into type seat · invent reopen / flip ready |

**Failure if unresolved:** Settings MD remains sole insurer SoT while type is Nest; policy invents free-text `insurer_key` after Nest density; PM folds insurers into sealed type slice; ba-data invents mega EAV / second type table; printable/personnel flipped; CTR legal-print reopened.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `contracts_printable_ready=true` · `hrm_personnel_uat_ready=true` · module SI/CTR UAT · Phase1
- **SEAL RETAIN:** SI-INS-CATALOG-QC-01 L1 · CTR legal-print QC-01/02/03 · SI enrollment EMP-BE-02 · EMP/DEC/PAY/ATT/REC/EXT/LIST-TOTALS
- Cite existing contracts-insurance paths — **cấm** invent `/api/hrm/platform/si/*` mega catalog
- **FORBIDDEN** fold insurers rows into `si_insurance_type` / reopen SI type L1 GWC
- Enrollment lifecycle SoT remains `employee_insurances` — this seat ≠ rewrite enrollment schema / type catalog

---

## 2. Options

### Option A — Settings Master Data `insurers` = sole picker SoT

| | |
|--|--|
| **Description** | Keep consumer policy / records bind only settings-catalogs partition `insurers`; never Nest-physicalize insurer catalog. |
| **Benefits** | Matches AS-IS E3 assert + FE picker today; zero DDL. |
| **Costs** | Permanent orphan vs peer SI **type** Nest SoT just sealed; Settings MD class rejected on EMP/DEC/PAY/ATT/REC/SI-type verticals. |
| **Risks** | AC green on MD while Platform Option B demands Nest ICatalogRow — **REJECT** as primary SoT. |

### Option B — Nest `si_insurer` (F-SI-CAT-INS-*) = authoritative insurers catalog · consumer picker when ≠ empty — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **SI insurance-type · EMP DOC/ET · DEC · PAY · ATT leave · REC stage**: single open insurers catalog = Nest **`public.si_insurer`** (ADD physical · `ICatalogRow`) via **F-SI-CAT-INS-01** list + **F-SI-CAT-INS-EFF-01** effective (tenant writer = SoT; Settings partition `insurers` = **group REF merge-read only** — dual-SoT class). When **effective active count > 0**, consumers **must** pick `insurer_key` ∈ catalog (**BR-PLT-02** · **AC-PLT-SI-INSURER-01** · deepen **AC-INS-02**). FE picker binds Nest **GET `…/insurers/effective`** (display-ready), **not** Settings MD density alone. Catalog **admin** CREATE N+1 on Settings insurers tab / **F-SI-CAT-INS-02** remains **open slug** (**BR-PLT-05**). Invent unknown key → typed KEY 4xx — **retain** `HRM-INS-INSURER-KEY` (E3) as synonym of peer `*-UNKNOWN` class (BA may alias without breaking E3 matrix). |
| **Benefits** | Aligns Platform Option B · closes SI type / insurer dual-orphan · SRS CORE-10 / E3 AC-INS-02 integrity · admin open ≠ consumer invent. |
| **Costs** | ba-data physical ADD · ba-process AC surface matrix · BE/FE after BA+DATA. |
| **Risks** | Misread as reopen SI type L1 / CTR print / flip printable → mitigate **L-SI-INR-08/09/10**. Misread as fold into `si_insurance_type` → **L-SI-INR-08**. |

### Option C — Invent contracts_printable_ready / hrm_personnel_uat_ready / reopen CTR·SI-type L1 / mega EAV / fold into type table

| | |
|--|--|
| **Description** | Flip printable or personnel ready; reopen CTR legal-print or SI-INS L1 GWC; ADD parallel mega `hrm_si_catalog_rows`; or fold insurer columns into `si_insurance_type`. |
| **Benefits** | Fake module green / one-table illusion. |
| **Costs** | Honesty breach · seal churn · type/insurer SoT collision. |
| **Risks** | **REJECT** — DENY invent UAT · DENY seal reopen · DENY mega-EAV (ADR Q-PLT-03) · DENY fold into type (**L-SI-INS-08** retained). |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings MD SoT | **B Nest F-SI-CAT-INS** | C Invent / fold / reopen |
|----------|-------:|------------------:|------------------------:|-------------------------:|
| Business value (CORE-10 / AC-INS-02 / BR-PLT-02) | 5 | 2 | **5** | 0 |
| Honesty / seal safety | 5 | 3 | **5** | 0 |
| Single insurer SoT reliability | 5 | 1 | **5** | 1 |
| Time to deliver | 4 | 5 | **2** | 5 |
| Complexity | 4 | 4 | **3** | 1 |
| Maintainability (peer SI type / EMP/DEC/PAY/ATT/REC) | 4 | 1 | **5** | 0 |
| **Weighted** | | 70 | **105** | 24 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | SI type Nest already Option B + L1 sealed; insurers AS-IS is Settings-only — must **define Nest SoT** (not keep A); residual = physicalize + named AC pack, not mega-EAV / UAT invent / fold into type. |
| **Rejected** | **A** Settings-MD-only picker SoT · **C** invent printable/personnel / reopen CTR·SI-type L1 / mega table / fold into `si_insurance_type` |
| **Assumptions** | SI type F-SI-CAT-TYP/EFF + enrollment ONE SoT + CTR print-spine stay must_keep — **not** this AC; ATT work-sites Nest = pattern cite only (**≠** insurers table). |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **UNLOCK** — **ADD** `public.si_insurer` (`ICatalogRow`) · **FORBIDDEN** second mega catalog · **FORBIDDEN** fold into `si_insurance_type` · **FORBIDDEN** rewrite `employee_insurances` schema |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01` AC pack (**AC-PLT-SI-INSURER-01***) |
| Unlock ba-data? | **YES** this seat — Nest **absent** ⇒ physical **EXPAND** required (peer SI-INS-CATALOG-DATA / EMP/DEC class — **≠** ATT-LEAVE HOLD) |
| Unlock BE? | **HOLD** until BA AC pack **and** DATA CONFIRMED — then Nest ensureSchema + F-SI-CAT-INS-* + consumer assert deepen |
| Unlock FE picker rebind? | After BA+BE — bind EFF Nest; Settings MD alone **REJECT** as sole SoT |
| Printable / personnel / CTR print / SI type L1? | **FORBIDDEN** invent reopen / flip from this seat |

### 4.2 Peer / adjacent (cite — do not reopen)

| Catalog / ops | Nest / SoT | This seat |
|---------------|------------|-----------|
| Insurance **type** codes | Nest `si_insurance_type` · F-SI-CAT-TYP/EFF · **L1 SEAL** | **OUT reopen** — **≠** insurer SoT |
| **Insurers** | **DEFINE** Nest `si_insurer` · F-SI-CAT-INS-* | **OWN** AC-PLT-SI-INSURER-01 |
| Enrollment lifecycle | `employee_insurances` ONE SoT · F-CORE-SI-02/03 | **must_keep RETAIN** |
| Policy CRUD | `/contracts-insurance/insurance-policies` | Consumer of **insurer_key** (+ type sealed path) |
| Legacy `employee_insurance_records.insurer_key` | Soft text | Optional consumer — BA enumerate (≠ enrollment type) |
| ATT work-sites | Nest `attendance_work_sites` · F-ATT-CAT-WS | **Pattern cite only** — different domain |
| CTR template / clause / print / library | CTR legal-print spine | **SEAL RETAIN** — **FORBIDDEN** reopen |

---

## 5. Locks (L-SI-INR-*)

| Lock | Rule |
|------|------|
| **L-SI-INR-01 Admin ≠ consumer** | **Catalog admin** POST/PUT F-SI-CAT-INS-02 = **open key N+1** (BR-PLT-05). **Consumers** (policy create/update `insurer_key` · optional records soft key when catalog >0) = **picker/FK only** (BR-PLT-02 · **AC-PLT-SI-INSURER-01**). |
| **L-SI-INR-02 Code SoT** | Authoritative insurer list = Nest `si_insurer` via **F-SI-CAT-INS-01** + **F-SI-CAT-INS-EFF-01** — **FORBIDDEN** Settings MD alone as sole SoT |
| **L-SI-INR-03 Dual SoT** | HRM tenant writer Nest = SoT; Settings/XBOS `insurers` = **group REF merge-read** only — tenant wins collision (**BR-PLT-06** · SI type / ATT leave peer) |
| **L-SI-INR-04 Empty catalog** | Effective active count **=0** → empty picker + VI guidance / optional create CTA; **FORBIDDEN** fake/seed density in UF (U65); admin CREATE still allowed |
| **L-SI-INR-05 Soft-delete** | Retired/`archived_at` hidden from default picker; past policy keys remain (**BR-PLT-04**) |
| **L-SI-INR-06 Scope** | list ↔ get-by-id ↔ consumer assert same `resolveHrmListScope` (**U19**) |
| **L-SI-INR-07 Invent KEY** | When catalog ≠ empty and body `insurer_key` ∉ effective → **`HRM-INS-INSURER-KEY`** (retain E3) / BA alias UNKNOWN — format-only codes **do not** bypass membership |
| **L-SI-INR-08 Adjacent OUT** | **FORBIDDEN** fold into SI type seat / `si_insurance_type` · reopen SI-INS L1 GWC · CTR print · enrollment SM rewrite · PAY formula LIVE · ATT work-sites rewrite |
| **L-SI-INR-09 Seals retain** | **FORBIDDEN** reopen SI-INS-CATALOG L1 · CTR legal-print GWC · SI enrollment EMP-BE-02 · EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS without warrant |
| **L-SI-INR-10 Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · payroll/ATT/REC ready false · **`C-SLICE-≠-MODULE`** · DENY module SI/CTR UAT |

```text
  XBOS / Settings insurers ──► group REF merge-read only
           │
  F-SI-CAT-INS CRUD ──► public.si_insurer (code SoT)  [ADD physical]
           │
           ▼
  F-SI-CAT-INS-EFF-01 effective
           │
  Consumers (when count>0): pick insurer_key ∈ catalog
    · POST/PATCH insurance-policies (insurer_key) — E3 AC-INS-02
    · optional employee_insurance_records.insurer_key — BA enumerate
           │
  Settings MD alone ──► NOT sole picker SoT (Option A REJECT)
  si_insurance_type / F-SI-CAT-TYP ──► SEPARATE SoT · L1 SEAL · FORBIDDEN fold
  CTR legal-print / printable invent ──► OUT this seat
  Enrollment ONE SoT employee_insurances ──► must_keep SEPARATE
```

---

## 6. F.1 capability pointer (DEFINE Nest — cite contracts-insurance)

| Cap | Path / rule (target) | AC |
|-----|----------------------|-----|
| List / admin SoT | **F-SI-CAT-INS-01** `GET /api/hrm/contracts-insurance/insurers` | AC-PLT-SI-INSURER-01d peer |
| Effective picker SoT | **F-SI-CAT-INS-EFF-01** `GET …/insurers/effective` | **AC-PLT-SI-INSURER-01** |
| Admin create open | **F-SI-CAT-INS-02** POST/PUT/retire — N+1 slug OK | **≠** consumer free-text |
| Consumer assert policy | EXPAND `assertInsurerKey` → Nest EFF when count>0 (migrate off MD-only) | **AC-PLT-SI-INSURER-01** · **01b** |
| Consumer records soft | Optional `employee_insurance_records.insurer_key` ∈ EFF when count>0 | BA enumerate |
| SI type catalog | F-SI-CAT-TYP/EFF — **cite** — **OUT** reopen / fold | DENY |
| Enrollment actions | F-CORE-SI-03 — **must_keep** · not insurer catalog | DENY fold |
| CTR print / library | Existing spines — **cite** — **OUT** reopen | DENY |

**AS-IS cite (code — do not treat as Nest SoT):**

- `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` — `assertInsurerKey` · `catalogKey: 'insurers'` · `HRM_INS_INSURER_KEY`
- `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts` — familyId `insurers` · aliases `insurance_providers` / `bhxh_providers`
- `apps/web/hrm/src/lib/catalogSearchPicker.ts` — Settings `insurers` picker (AC-INS-02)

**Error (consumer invent):** catalog ≠ empty ∧ `insurer_key` ∉ effective → **`HRM-INS-INSURER-KEY`** (400) — BA may document UNKNOWN alias.

**Physical pointer (ba-data):** ADD `public.si_insurer` columns peer `si_insurance_type` / `att_leave_type` / `emp_document_type` — `id`, `company_id`, `insurer_key` (open slug), `name_vi`, `status`, `archived_at`, `sort_order?`, timestamps — **no** CHK IN starter set; policy/records keep **text** soft keys (soft FK).

### 6.1 DOC-DELTA pointers (ADD-only — no wipe)

| Artifact | Pointer |
|----------|---------|
| **API_DESIGN** | ADD § F-SI-CAT-INS-01 / F-SI-CAT-INS-02 / F-SI-CAT-INS-EFF-01 under contracts-insurance family — **Mục đích · Nghiệp vụ · Tham chiếu bước SRS** (E3 AC-INS-02 / FR-UC-BP-CORE-10) · request/response → `si_insurer` · errors `HRM-INS-INSURER-KEY` · **no wipe** F-CORE-SI / F-SI-CAT-TYP |
| **DB_DESIGN** | ADD §3.6b `si_insurer` physical (peer §3.6a type) · dual SoT Settings `insurers` REF · soft FK note on policy `insurer_key` · **FORBIDDEN** fold into §3.6a · **no wipe** enrollment §3.6 |

---

## 7. AC / validation matrix (for ba-process deepen)

| ID | Condition | Expected PASS | FAIL |
|----|-----------|---------------|------|
| **AC-PLT-SI-INSURER-01** | Nest/EFF active ≥1 · consumer set `insurer_key` | Picker from F-SI-CAT-INS-EFF-01 · 2xx · F5 key ∈ catalog | Free-text Input as SoT · Settings MD alone |
| **AC-PLT-SI-INSURER-01b** | Same · invent unknown key | **4xx** `HRM-INS-INSURER-KEY` (typed KEY) | 2xx invent |
| **AC-PLT-SI-INSURER-01c** | Nest/EFF active =0 | Empty picker + admin may CREATE open · no fake rows in UF | Seed/fake density for UF |
| **AC-PLT-SI-INSURER-01d** | Catalog admin CREATE N+1 | **2xx** open slug | Closed enum / «must pick existing only» as admin rule |
| **AC-PLT-SI-INSURER-01H** | Honesty | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · SI type L1 + CTR print seals retain · no module SI/CTR UAT | Flip flags / reopen seals |
| **VAL-SI-INR-CNS-01** | Policy invent insurer when catalog >0 | 4xx KEY | Silent accept |
| **VAL-SI-INR-CNS-02** | List picker scope ≠ assert scope | jest FAIL scope_parity | Drift |

**Consumer surface inventory (ba-process must enumerate exact UF/J-*):** Policy create/update (`J-HRM-INS-E3-01` / **AC-INS-02**) · optional legacy records soft `insurer_key` — **not** F-SI-CAT-INS-02 admin create alone · **not** insurance **type** picker · **not** enrollment `type` · **not** CTR print · **not** SI action suspend/resume core · **not** ATT work-sites.

**Align note:** **AC-PLT-SI-INSURER-01** = named peer of **AC-PLT-SI-INS-01** / **AC-PLT-ATT-LEAVE-01** / **AC-PLT-PAY-01**; E3 **AC-INS-02** remain — BA pack must cross-ref (no conflicting invent rules). Type KEY `HRM-INS-TYPE-KEY` **≠** insurer KEY `HRM-INS-INSURER-KEY`.

---

## 8. Failure modes

| Option / path | Failure mode | Detection | Mitigation |
|---------------|--------------|-----------|------------|
| A | MD green · Nest never ships | Peer Nest audits (type already Nest) | Reject A |
| B | FE still Settings-only after Nest live | QA AC-PLT-SI-INSURER-01 picker source | FE rebind EFF |
| B | BE treats admin create as invent | Catalog N+1 4xx | L-SI-INR-01 |
| B | Fold insurer into type table / reopen L1 | DATA/DDL audit | L-SI-INR-08 |
| C | Claim printable / reopen CTR / SI type L1 | Honesty / seal audit | DENY |
| Any | Seed density for picker | U65 audit | FAIL QA |

---

## 9. Rollout / validation

| Step | Owner | Exit |
|------|-------|------|
| 1 This SA Option B LOCK | sa | **CONFIRMED** (this file) |
| 2 AC pack consumer surfaces | **ba-process** | CONFIRMED AC-PLT-SI-INSURER-01* click paths |
| 3 Physical Nest table | **ba-data** | CONFIRMED `si_insurer` ADD-plan |
| 4 BE Nest + consumer assert | **dev-be** HOLD→unlock after BA+DATA | jest VAL-SI-INR-CNS-* · F-SI-CAT-INS-* |
| 5 FE picker rebind | **dev-fe** after BE | EFF Nest bind · MD alone reject |
| 6 QA U65 invent + picker | qa | browser · zero-seed · no printable/personnel flip |
| 7 QC slice GWC | qc | `C-SLICE-≠-MODULE` · honesty false · SI type L1 retain |

**Rollback:** retain SI type L1 + CTR/SI enrollment seals; additive Nest table only — no DDL drop of policy/enrollment.

**Success (this seat):** Option B locked · Nest insurer SoT **defined** · ba-data **UNLOCK** · ba-process **UNLOCK** · BE **HOLD** · honesty false · seals retained · SI-INS L1 **not** reopened · CTR legal-print **not** reopened.

---

## 10. Non-claims / Explicit OUT

- No `apps/**` / migration / seed.
- No `contracts_printable_ready=true` · no `hrm_personnel_uat_ready=true` · no module SI/CTR UAT · no Phase1.
- **OUT — fold into SI type seat** · **OUT — reopen SI-INS L1 GWC** · **OUT — reopen CTR legal-print** · **OUT — flip printable/personnel** · **OUT — invent module SI UAT**.
- No invent reopen EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS / enrollment EMP-BE-02 without warrant.
- No claim payroll e2e / formula LIVE / ATT work-sites rewrite this seat.
- SI type Nest F-SI-CAT-TYP/EFF **remain sealed separate** — this file owns **AC-PLT-SI-INSURER-01 insurers catalog Option** (peer SI-INS type / ATT-LEAVE / PAY), not a second type redesign.

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **next_owner** | **pm** → **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01` (+ parallel **ba-data** `…-SI-INSURER-CATALOG-DATA-01` OK) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-sa-01.md` |
| **ba-data** | **UNLOCK** (physical EXPAND — Nest absent) |
| **BE** | **HOLD** until BA (+ DATA) |
