# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01 — Option/F.1 · leave balance / accrual **rule schema** (bound to `att_leave_type`)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QC-01` **GWC** + **DOCS-01 ACCEPT** · U88 continuous next vertical |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-ATT-LEAVE-BAL-01*** · **DEFINE** Nest versioned **rule schema** · **NOT** reopen leave-type catalog L1 · **NO CODE** `apps/**` · **no seed** · **no wipe** ATT-LEAVE/CODE/WS/SHIFT L1 · EMP/SI/CTR/PAY · aggregate GĐ1 |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **UNLOCK** · ba-process **UNLOCK** · BE **HOLD** until BA (+ DATA) |
| **prior_seals** | ATT leave L1 GWC · ATT-CODE `ATTCODEQA-MSK4T1A5` · ATT-WS · ATT-SHIFT `ATTSHIFTQA-MSK5FXP3` (L1) · EMP/SI/CTR/PAY — **SEAL RETAIN** |
| **prior_att_leave_sa** | [`ATT-LEAVE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) — accrual/balance **OUT residual** now **OWN** this seat · **FORBIDDEN** reopen L1 invent KEY seats |
| **prior_vertical** | [`ATT-VERTICAL-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) **R-PLT-ATT-02** Accrual policy CRUD bound to catalog keys |
| **ref_peer_nest_absent** | EMP-STATUS / SI-INS / SI-INSURER Option **B** DEFINE Nest — **cite ≠ copy** (class match: Nest ABSENT → physicalize) |
| **ref_peer_catalog_retain** | ATT-LEAVE Option **B** Nest `att_leave_type` — **cite** admin≠consumer · **SEAL RETAIN** · **≠** this seat’s rule table |
| **ref_peer_pay_engine** | PAY-CATALOG Option B — catalog SoT **≠** formula LIVE — **cite** engine HOLD pattern |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · Catalog + Schema · Q-PLT-03 mega-EAV DENY · [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.1 **Leave types / balance rules** — *Catalog + Schema · GĐ1 deepen* |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-ATT-04/04b/05/05b/06/09** · Q-LEAVE-ACCRUAL / UNIT direction |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.4b **`att_leave_accrual_policy`** → balance → hold |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) F-ATT-LEAVE-04 accrue outline · leave-types F-ATT-CAT-* RETAIN |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **DENIED** invent module ATT UAT · **DENIED** reopen ATT-LEAVE/CODE/WS/SHIFT L1 · **DENIED** invent FE HOLDs (ATT-CODE FE · ATT-SHIFT CNS-02) · **DENIED** rewrite aggregate · **DENIED** seed · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | Nest `att_leave_type` L1 · F-ATT-CAT-EFF · leave-requests invent `HRM-LEAVE-TYPE-UNKNOWN` · `employee_leave_balances` ledger read/hold TXN · leave funnel WAIVE/sign · ATT-CODE/WS/SHIFT L1 · FE HOLDs as named Conditions · dual SoT REF `leave_types` merge-read |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-ATT-LEAVE-BAL-01 — versioned leave balance / accrual **rule schema** SoT (bound to sealed `att_leave_type`) |
| **Requestor** | pm · U88 after ATT-SHIFT QC GWC + DOCS ACCEPT · BA-01 §2.1 GĐ1 deepen |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-ATT-04..06/05b/09 · R-PLT-ATT-02 · BR-PLT-02/04/05/06 · DB §4.4b · peer PAY formula-engine HOLD |

### 1.1 Problem — AS-IS vs target

| Current state (AS-IS evidence) | Gap / target |
|--------------------------------|--------------|
| Nest **`att_leave_type`** open catalog **SEALED** L1 (ATT-LEAVE GWC) — flags `allows_carry_over` / `allows_advance` / `category` on type row | **Type catalog ≠ accrual rule schema** — BA-01 asks *rule schema versioned* deepen |
| Nest **`employee_leave_balances`** LIVE (entitled/used/pending) + GET leave-balance / panel | **Ledger** exists; **policy rows that drive entitled** ABSENT as first-class table |
| Panel / MVP hardcodes **`MVP_LEAVE_BALANCE_TYPES`** = `annual\|seniority\|compensatory\|carry_over\|advance` | Risk treating closed five codes as SoT while catalog open — residual for BA (bind EFF / policy-bound types) |
| Nest **`att_leave_accrual_policy`** — **ABSENT** in hrm-api (grep zero `CREATE TABLE` / service) | DB_DESIGN §4.4b + API F-ATT-LEAVE-04 outline already name policy → entitled |
| `attendance_rules` (punch/GPS/standard days) LIVE | **≠** leave accrual policy — must not become sole SoT |
| Settings MD `leave_types` = **REF merge** into EFF (ATT-LEAVE L-ATT-LEAVE-02/03) | **FORBIDDEN** promote MD / company-settings KV as sole **rule** SoT |
| ATT-LEAVE BA **BR-PLT-ATT-LEAVE-08** / residual R3: accrual policy admin **OUT** of leave-type AC pack | This seat **OWN** — **FORBIDDEN** reopen leave-type L1 invent seats |
| F-ATT-LEAVE-04 accrue job = **outline** · Q-LEAVE-ACCRUAL params partial | Schema + CRUD + bind can lock **without** inventing accrual **engine LIVE** (peer PAY formula) |

**Failure if unresolved:** Settings/`attendance_rules`/MD treated as accrual SoT; FE invents ad-hoc grant params; ba-data skips physical policy while BE hardcodes modes; someone reopens ATT-LEAVE L1 / folds rules into type flags only; PM flips `attendance_uat_ready` / invents FE HOLDs / rewrites aggregate to «prove» balance.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `attendance_uat_ready=true` · `payroll_e2e_ready=true` · module ATT UAT · Phase1
- **SEAL RETAIN:** ATT-LEAVE L1 · ATT-CODE `ATTCODEQA-MSK4T1A5` · ATT-WS · ATT-SHIFT `ATTSHIFTQA-MSK5FXP3` · EMP/SI/CTR/PAY · leave WAIVE/sign/J-06c · aggregate GĐ1 / LIST-TOTALS
- **FE HOLD RETAIN (do not invent):** R-PLT-ATT-CODE-FE-01 · R-PLT-ATT-SHIFT-CNS-02 (if still open Condition)
- Cite `/api/hrm/attendance/*` — **cấm** invent `/api/hrm/platform/att/*` mega catalog / mega-EAV
- **FORBIDDEN** reopen ATT-LEAVE/CODE/WS/SHIFT L1 invent KEY seats · fold policy into day-code / worksite / shift · rewrite `att-timesheet-line-aggregate`

### 1.3 Decision heuristic (program rule — applied)

| Rule | Application this seat |
|------|------------------------|
| Prefer **B Nest** if producer absent / hardcode residual | Accrual **policy table ABSENT** + DB_DESIGN names Nest ATT writer + ledger already Nest → **B DEFINE** |
| Prefer **A Settings** if producer LIVE | No LIVE Settings accrual-policy producer; `attendance_rules` ≠ leave accrual → **A REJECT** as primary SoT |
| REJECT hybrid dual writers / mega-EAV / reopen L1 / invent FE HOLD / flip UAT / engine LIVE as this AC | Explicit **Option C** reject |
| Catalog L1 sealed ≠ Schema deepen | Leave-type **RETAIN**; this seat = **Schema/CFG** bound to type keys |

---

## 2. Options

### Option A — Settings-sole (MD / company-settings KV / `attendance_rules`) = rule SoT

| | |
|--|--|
| **Description** | Persist accrual/balance rules only in Settings Master Data, company-settings JSON, or stretch `attendance_rules` columns; Nest has no `att_leave_accrual_policy`; consumers read Settings density. |
| **Benefits** | Zero Nest physicalize; reuses Settings UX. |
| **Costs** | Contradicts DB_DESIGN §4.4b ATT-owned policy → balance chain; `attendance_rules` is punch/GPS/standard-days; dual orphan vs Nest ledger + sealed Nest leave types; peer EMP/DEC/PAY/ATT catalogs chose Nest domain SoT for operational CFG. |
| **Risks** | AC green on Settings while entitle/hold mutate Nest ledger — **REJECT** as primary SoT. |

### Option B — Nest versioned rule table `att_leave_accrual_policy` (bound to `att_leave_type`) = SoT · Settings REF only · engine apply HOLD — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **EMP-STATUS / SI-INS DEFINE Nest** class + **PAY catalog≠engine**: single open **rule schema** = Nest **`public.att_leave_accrual_policy`** (name per DB §4.4b) with soft FK **`leave_type_key` → sealed `att_leave_type` / EFF**. Rows are **versioned / effective-dated** (`effective_from` / `effective_to` or monotonic `version` + `status=active|retired`). **Admin** Settings/ATT CFG may **CREATE N+1** policy rows (open — multiple versions / component lines per type — **BR-PLT-05**). **Consumers** that bind a policy or invent grant parameters when active policy set ≠ empty must pick ∈ published EFF policy for that type (**BR-PLT-02**) — invent → **`HRM-ATT-LVRULE-KEY`**. Leave-type invent remains **`HRM-LEAVE-TYPE-UNKNOWN`** (RETAIN — **≠** reopen L1). Group/Settings leave MD = **REF only** for type merge — **FORBIDDEN** sole rule SoT / dual-write policy. **Accrue engine / job** (F-ATT-LEAVE-04) remains **outline HOLD** this wave — schema + CRUD + resolve + KEY assert may ship **without** inventing full component formula LIVE (1d/month + seniority + position evaluator). Ledger `employee_leave_balances` **RETAIN**; ba-data may EXPAND columns (`carried_in`/`advanced`) as companion — **not** second ledger table. |
| **Benefits** | Aligns BA-01 Catalog+Schema · DB §4.4b · R-PLT-ATT-02 · ATT ownership matrix · admin≠consumer · closes Settings-sole ambiguity · no reopen leave-type L1. |
| **Costs** | ba-data physicalize + ba-process AC pack + later BE CRUD/resolve; engine LIVE = follow-on after Q-LEAVE-ACCRUAL component lock. |
| **Risks** | Misread as reopen leave-type L1 / claim accrual engine UAT / fold into ATT-CODE → **L-ATT-LVRULE-*** mitigations. |

### Option C — Hybrid dual writers / mega-EAV / reopen ATT-LEAVE·CODE·WS·SHIFT L1 / invent FE HOLDs / flip ready / rewrite aggregate / engine LIVE as this seat

| | |
|--|--|
| **Description** | Settings **and** Nest both write policies; or mega `hrm_att_catalog_rows`; or reopen sealed L1 invent seats; invent FE HOLDs as mandatory; flip attendance/payroll ready; rewrite aggregate; claim formula/accrue LIVE GO from this AC. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Dual SoT · seal churn · payroll/ATT regression. |
| **Risks** | **REJECT** — DENY mega-EAV (Q-PLT-03) · DENY dual writers · DENY reopen L1 · DENY invent FE HOLD · DENY UAT flip · DENY aggregate rewrite · DENY engine LIVE invent. |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings-sole | **B Nest rule table** | C Hybrid / reopen / LIVE |
|----------|-------:|----------------:|----------------------:|-------------------------:|
| Business value (FR-ATT-04..06 · BA-01 Schema) | 5 | 1 | **5** | 0 |
| Honesty / seal safety (LEAVE·CODE·WS·SHIFT·agg) | 5 | 3 | **5** | 0 |
| Single ATT rule SoT vs DB §4.4b | 5 | 0 | **5** | 1 |
| Time to deliver (schema vs engine) | 4 | 4 | **3** | 2 |
| Complexity | 4 | 3 | **4** | 0 |
| Maintainability (admin open ≠ invent · peer) | 4 | 1 | **5** | 1 |
| **Weighted** | | 52 | **112** | 16 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Nest accrual-policy **ABSENT** while DB/API/SRS name ATT-owned versioned policy bound to leave types; ledger already Nest; leave-type L1 sealed must not be reopened; Settings/`attendance_rules` wrong surface; peer Nest-absent DEFINE + PAY engine-HOLD pattern fits GĐ1. |
| **Rejected** | **A** Settings-sole · **C** hybrid / mega-EAV / reopen L1 / invent FE HOLD / flip ready / aggregate rewrite / engine LIVE as this AC |
| **Assumptions** | `att_leave_type` EFF remains type SoT; Q-LEAVE-ACCRUAL component formula may stay partial — **schema keys** lock without inventing evaluator LIVE. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **UNLOCK** — DEFINE Nest **`att_leave_accrual_policy`** (ABSENT) · optional EXPAND ledger columns per DB §4.4b — **FORBIDDEN** second leave-type catalog · **FORBIDDEN** second balance mega table |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01` AC pack (**AC-PLT-ATT-LEAVE-BAL-01***) |
| Unlock ba-data? | **YES** — `…-ATT-LEAVE-BALANCE-DATA-01` narrow ADD policy (+ EXPAND ledger if BA proves) |
| Unlock BE? | **HOLD** until BA CONFIRMED **and** DATA CONFIRMED |
| Unlock FE admin/consumer? | After BE READY_FOR_QA — only surfaces BA inventories; **FORBIDDEN** invent ATT-CODE / ATT-SHIFT FE HOLDs |
| Accrue engine LIVE / attendance UAT? | **FORBIDDEN** invent from this seat |
| Reopen ATT-LEAVE L1? | **FORBIDDEN** |

### 4.2 Layer map (SoT vs REF vs OUT)

| Layer | Artifact | Role this seat |
|-------|----------|----------------|
| **Catalog (RETAIN)** | Nest `att_leave_type` · F-ATT-CAT-LVT/EFF | Type key SoT — **SEAL** · not rewritten |
| **Schema/CFG (OWN)** | Nest `att_leave_accrual_policy` | **Rule SoT** — versioned · bound to `leave_type_key` |
| **Ledger (RETAIN / EXPAND)** | `employee_leave_balances` | Balance numbers — ATT writer · not Settings |
| **REF** | Settings/`leave_types` · group REF | Type merge-read only — **≠** rule SoT |
| **NOT SoT** | `attendance_rules` | Punch/GPS/standard — **OUT** as accrual sole |
| **Engine HOLD** | F-ATT-LEAVE-04 accrue job | Outline — **OUT** LIVE claim |
| **OUT** | Face/device · aggregate · ATT-CODE/WS/SHIFT reopen · seed · ready flip | Explicit §8 |

---

## 5. Locks (L-ATT-LVRULE-*)

| Lock | Rule |
|------|------|
| **L-ATT-LVRULE-01 Admin ≠ consumer** | **Rule admin** POST/PUT policy = **open N+1** rows (versioned; soft FK to EFF leave type — **BR-PLT-05**). **Consumers** (leave create/hold that depend on policy gates · grant/adjust UI · accrue job bind · any mutate inventing accrual params) when active policy for type **>0** = **picker/FK / published params only** (**BR-PLT-02** · **AC-PLT-ATT-LEAVE-BAL-01**). |
| **L-ATT-LVRULE-02 Rule SoT** | Authoritative accrual/balance **rules** = Nest `att_leave_accrual_policy` — **FORBIDDEN** Settings MD / company-settings KV / `attendance_rules` as sole rule SoT |
| **L-ATT-LVRULE-03 Bound to type catalog** | Every policy row soft-refs `leave_type_key` ∈ sealed EFF `att_leave_type` (or retired-allowed history) — orphan key on admin write → **4xx** (BA locks code; class membership) — **FORBIDDEN** invent type via policy seat |
| **L-ATT-LVRULE-04 Version / effective** | Concurrent versions allowed with non-overlapping effective window **or** single `active` + retired history — BA locks UQ/SM; soft-retire (**BR-PLT-04**) — **FORBIDDEN** hard-delete when ledger/history refs |
| **L-ATT-LVRULE-05 Invent KEY (rules)** | When active policy set for scope/type ≠ empty and consumer invents unknown `policy_id` / ad-hoc accrual mode|days outside published row → **`HRM-ATT-LVRULE-KEY`** (400) |
| **L-ATT-LVRULE-06 Type invent RETAIN** | Unknown `leave_type` on leave TXN → **`HRM-LEAVE-TYPE-UNKNOWN`** — **RETAIN** ATT-LEAVE L1 — **≠** LVRULE-KEY · **FORBIDDEN** reopen L1 invent AC as this pack |
| **L-ATT-LVRULE-07 Empty policy** | No active policy for type → empty CTA / soft skip grant engine · **FORBIDDEN** seed fake policy for UF (U65); admin CREATE still allowed |
| **L-ATT-LVRULE-08 Engine OUT** | **FORBIDDEN** claim accrue evaluator / component formula LIVE / attendance UAT GO from this AC — F-ATT-LEAVE-04 remains outline until dedicated wave |
| **L-ATT-LVRULE-09 Scope** | list ↔ get-by-id ↔ resolve ↔ consumer assert same `resolveHrmListScope` (**U19**) |
| **L-ATT-LVRULE-10 Seals / honesty** | **FORBIDDEN** reopen ATT-LEAVE/CODE/WS/SHIFT L1 · invent FE HOLDs · Face/device · aggregate rewrite · fold into day-code · seed · flip `attendance_uat_ready` / `payroll_e2e_ready` · **`C-SLICE-≠-MODULE`** |

```text
  Settings leave_types / attendance_rules ──► NOT rule SoT (Option A REJECT)
           │
  att_leave_type (SEALED L1) ──► leave_type_key SoT
           │
           ▼
  att_leave_accrual_policy (DEFINE · versioned) ──► RULE SoT (this seat)
           │
           ▼
  employee_leave_balances (RETAIN ledger) ← entitle/hold/settle TXN
           │
  F-ATT-LEAVE-04 accrue job ──► HOLD LIVE (outline)
  Consumers: pick published policy / no invent params
  Invent rule ──► HRM-ATT-LVRULE-KEY
  Invent type ──► HRM-LEAVE-TYPE-UNKNOWN (RETAIN)
```

---

## 6. F.1 API map (Nest Option B)

| Cap ID | METHOD / path (proposed Nest — cite ATT attendance prefix) | Mục đích | Nghiệp vụ xử lý (tóm tắt) | Tham chiếu bước SRS | Request → DB | Lỗi |
|--------|-------------------------------------------------------------|----------|---------------------------|---------------------|--------------|-----|
| **F-ATT-LVRULE-01** | `GET /api/hrm/attendance/leave-accrual-policies` (+ optional `leave_type_key`, `include_inactive`) | List versioned policies — display-ready | Scope · filter active default · join labels from EFF leave type | FR-UC-BP-ATT-04 Diễn biến cấu hình | `att_leave_accrual_policy` | `HRM-SCOPE-409` |
| **F-ATT-LVRULE-02** | `POST /api/hrm/attendance/leave-accrual-policies` | Admin CREATE open N+1 | Validate `leave_type_key` ∈ EFF · version/effective window · open slug/id · **≠** consumer invent | FR-UC-BP-ATT-04 admin | INSERT policy | type OOS · conflict window |
| **F-ATT-LVRULE-03** | `PATCH …/leave-accrual-policies/{id}` · retire | Update / soft-retire | Soft-delete class · history intact | FR-UC-BP-ATT-04/05 | UPDATE status/`archived_at` | `404` scope |
| **F-ATT-LVRULE-04** | `GET …/leave-accrual-policies/effective?leave_type_key=&as_of=` | Resolve published policy for type/as-of | ATT wins · empty = 200 empty | FR-UC-BP-ATT-04/05b | read model | scope |
| **F-ATT-LVRULE-CNS-01** | EXPAND leave-request / grant / adjust paths | Consumer invent assert | When policy active>0 · invent params/`policy_id` → **`HRM-ATT-LVRULE-KEY`**; type invent → **`HRM-LEAVE-TYPE-UNKNOWN`** RETAIN | FR-UC-BP-ATT-05b/09 · 04b | TXN | 400 KEY |
| **F-ATT-LEAVE-04** | `POST …/leave-balances/accrue` *(job)* | Accrue outline | **HOLD LIVE** — cite API_DESIGN outline · **OUT** this AC GO | FR-UC-BP-ATT-04 | policy → ledger.entitled | outline |
| **F-ATT-LEAVE-BAL-*** | `GET leave-balance` · `leave-balance/panel` | Panel/ledger read | **RETAIN** — BA may deepen panel type source vs MVP hardcode | FR-UC-BP-ATT-05b | `employee_leave_balances` | RETAIN |

**SoT vs REF**

| Surface | Class |
|---------|-------|
| Nest `att_leave_accrual_policy` | **SoT** rules |
| Nest `att_leave_type` / EFF | **SoT** type keys (sealed) |
| Nest `employee_leave_balances` | **SoT** ledger balances |
| Settings `leave_types` | **REF** type merge only |
| `attendance_rules` | **OPS** punch/GPS — **REF≠accrual** |
| F-ATT-LEAVE-04 engine | **HOLD** — not SoT claim this seat |

**Path naming:** prefer existing `/api/hrm/attendance/...` (peer leave-types / work-sites). Paper alias `/api/hrm/att/...` = DOC-DELTA only — **cấm** dual runtime writers.

---

## 7. Admin open N+1 ≠ consumer invent (stamp)

| Class | Who | Allowed | Forbidden | Error stamp |
|-------|-----|---------|-----------|-------------|
| **ADMIN-RULE** | HCNS Settings / ATT CFG policy CRUD | CREATE **N+1** versioned rows; open fields within BA validation (`accrual_mode` keys from locked A3 set, `annual_days`, `unit`, carry expire, flags) | Treating admin CREATE as invent KEY failure | — (2xx) |
| **CONSUMER-RULE** | Leave create/hold gates · grant/adjust · accrue bind · any body inventing mode/days/`policy_id` | Pick ∈ EFF policy for type when count>0 | Free-text / hardcode ad-hoc rule as SoT | **`HRM-ATT-LVRULE-KEY`** |
| **CONSUMER-TYPE** | Leave TXN `leave_type` | Pick ∈ EFF leave types | Invent type | **`HRM-LEAVE-TYPE-UNKNOWN`** (**RETAIN** · ≠ reopen L1 pack) |
| **EMPTY** | EFF policy count=0 for type | CTA admin · soft skip engine | Seed policy to pass UF | — |

**Proposed stamp (LOCKED for BA wording):** `HRM-ATT-LVRULE-KEY`  
Aliases BA may document as OBS only: `HRM-ATT-LEAVE-BAL-RULE-KEY` — **one** wire code in BE.

---

## 8. Explicit OUT

| OUT | Rule |
|-----|------|
| Face / device / punch hardware | **OUT** — not rule schema |
| Aggregate rewrite (`att-timesheet-line-aggregate` / LIST-TOTALS) | **OUT** · **SEAL RETAIN** |
| ATT-CODE fold / reopen L1 `ATTCODEQA-MSK4T1A5` | **OUT** · **FORBIDDEN** |
| ATT-WS / ATT-SHIFT L1 reopen · roster reopen | **OUT** · **FORBIDDEN** |
| ATT-LEAVE leave-type L1 invent KEY reopen | **OUT** · **FORBIDDEN** |
| Invent FE HOLDs (ATT-CODE FE · ATT-SHIFT CNS-02) | **OUT** — Conditions **RETAIN** as named HOLDs |
| Seed / `pnpm seed:*` / fake policy density | **OUT** (U65) |
| Flip `attendance_uat_ready` / `payroll_e2e_ready` | **OUT** |
| Module ATT UAT / Phase1 DONE | **OUT** · **`C-SLICE-≠-MODULE`** |
| Accrue engine / component formula LIVE GO | **OUT** this seat (F-ATT-LEAVE-04 HOLD) |
| Mega-EAV / platform mega catalog table | **OUT** (Q-PLT-03) |
| Settings-sole Option A | **OUT** / REJECT |

---

## 9. ba-data UNLOCK vs HOLD

| Decision | **UNLOCK** |
|----------|------------|
| Rationale | Nest `att_leave_accrual_policy` **ABSENT** (Nest-absent DEFINE class — peer EMP-STATUS / SI-INS). DB_DESIGN §4.4b already specifies columns. |
| Scope | ADD table `att_leave_accrual_policy` · soft FK text `leave_type_key` · version/effective · status soft-retire · IX `(company_id, leave_type_key, …)` · optional EXPAND `employee_leave_balances` (`carried_in`/`advanced`) if BA proves vs AS-IS pending/entitled |
| HOLD = NO | Second `att_leave_type` · mega EAV · dual ledger rename wipe · Face tables |
| Next work_item | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01` (after or parallel ba-process per PM) |

---

## 10. Draft AC stubs (for ba-process)

| ID | Stub (PASS intent) | FAIL |
|----|---------------------|------|
| **AC-PLT-ATT-LEAVE-BAL-01** | When ≥1 active policy for type: admin/CFG surfaces + resolve bind Nest F-ATT-LVRULE-* · display-ready · F5 row remains | Settings/`attendance_rules` sole SoT · free-text rule SoT |
| **AC-PLT-ATT-LEAVE-BAL-01b** | Consumer invent unknown `policy_id` / ad-hoc accrual params when policy active>0 → **4xx `HRM-ATT-LVRULE-KEY`** | 2xx invent |
| **AC-PLT-ATT-LEAVE-BAL-01c** | Active policy count=0 for type → empty CTA · **no seed** · admin may CREATE | Seed/fake density for UF |
| **AC-PLT-ATT-LEAVE-BAL-01d** | Admin CREATE open N+1 versioned policy row bound to EFF `leave_type_key` → **2xx** · F5 list has row | Reject admin as invent · orphan type without 4xx |
| **AC-PLT-ATT-LEAVE-BAL-01e** | Soft-retire policy → default resolve hides · ledger/history OK | Hard-delete orphans |
| **AC-PLT-ATT-LEAVE-BAL-01f** | Leave-type invent on TXN still **`HRM-LEAVE-TYPE-UNKNOWN`** · leave-type L1 seals **RETAIN** | Reopen L1 invent pack / conflate with LVRULE-KEY |
| **AC-PLT-ATT-LEAVE-BAL-01g** | Panel/ledger read RETAIN; BA may require panel types ⊆ EFF/policy-bound when catalog>0 (kill closed MVP-only SoT) | MVP five hardcode as sole SoT while EFF open |
| **AC-PLT-ATT-LEAVE-BAL-01H** | Honesty: `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no engine LIVE claim · no Face/aggregate/CODE/WS/SHIFT reopen · FE HOLDs retain · U65 · **`C-SLICE-≠-MODULE`** | Flip flags / reopen seals / invent FE HOLD |
| **VAL-ATT-LVRULE-CNS-01** | Mutate invent rule params | 4xx LVRULE-KEY | Silent accept |
| **VAL-ATT-LVRULE-CNS-02** | Admin N+1 vs consumer invent split | Admin 2xx · consumer 4xx | Collapsed |
| **VAL-ATT-LVRULE-CNS-03** | Scope list ≠ resolve | jest FAIL scope_parity | Drift |

**ba-process must:** enumerate exact UF/J-* (Settings policy admin · leave create/hold · panel · grant if in-scope) · lock column/validation matrix with ba-data · cross-ref ATT-LEAVE AC-PLT-ATT-LEAVE-01* as **RETAIN** (type) vs this pack (rules).

---

## 11. Failure modes

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Settings green / Nest ledger drift | Dual density audit | L-ATT-LVRULE-02 REJECT A |
| B | BE treats admin CREATE as invent | Admin N+1 4xx | L-ATT-LVRULE-01 |
| B | Claim engine LIVE / UAT flip | Honesty flags | L-ATT-LVRULE-08/10 |
| B | Reopen leave-type L1 | Seal churn | L-ATT-LVRULE-06/10 |
| C | Mega-EAV / fold CODE / aggregate | Diff scope | Option C REJECT |

---

## 12. Rollout / validation

| Step | Owner | Gate |
|------|-------|------|
| 1 This SA Option B LOCK | sa | **CONFIRMED** (this file) |
| 2 ba-process AC pack | ba-process | AC-PLT-ATT-LEAVE-BAL-01* CONFIRMED |
| 3 ba-data physical | ba-data | DATA-01 CONFIRMED |
| 4 BE F-ATT-LVRULE-* | dev-be | HOLD → unlock after BA+DATA |
| 5 FE admin/consumer deepen | dev-fe | After BE — **no** invent FE HOLDs |
| 6 QA U65 L1 | qa | browser · zero-seed · no UAT flip |
| 7 QC GWC slice | qc | C-SLICE · honesty false |

**Success (this seat):** Option B locked · ba-data UNLOCK · ba-process UNLOCK · BE HOLD · honesty false · seals retained · no `apps/**`.

---

## 13. Honesty

| Flag | Value |
|------|-------|
| `attendance_uat_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| Module ATT UAT / Phase1 | **DENIED** |
| Accrue engine LIVE | **DENIED** this seat |
| `C-SLICE-≠-MODULE` | **RETAIN** |
| This seat | Docs-only Option/F.1 |

---

## 14. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-sa-01.md` |
| **next_owner** | **ba-process** (+ **ba-data** UNLOCK parallel) |
| **completion_report** | CONFIRMED Option B: Nest versioned `att_leave_accrual_policy` rule schema SoT bound to sealed `att_leave_type`; Settings/`attendance_rules` REJECT as sole; invent stamp `HRM-ATT-LVRULE-KEY`; engine LIVE HOLD; ba-data UNLOCK; leave-type L1 RETAIN; no apps/**. |
