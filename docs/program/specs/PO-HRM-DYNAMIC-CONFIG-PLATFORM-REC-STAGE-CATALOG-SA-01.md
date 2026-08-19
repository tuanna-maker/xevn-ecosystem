# PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01 — Option/F.1 · AC-PLT-REC-STAGE-01 consumer picker (catalog ≠ empty)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01` **DOC-DELTA ACCEPT** · U88 continuous |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-REC-STAGE-01** · **REFINE** admin vs consumer SoT · **NO** new physical table · **NO CODE** `apps/**` · **no seed** · **no wipe** REC UX QC process · JD DnD · IV one-active · EMP/DEC/PAY/ATT/EXT/CTR/LIST-TOTALS |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **HOLD** · ba-process **UNLOCK** · BE consumer-deepen **HOLD** until BA AC pack |
| **prior_vertical** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md) F-REC-CAT-STG/EFF **CONFIRMED** · DATA/BE/FE/QA/QC **SEAL RETAIN** |
| **prior_seals** | REC-QC-01 L1 GWC · REC-QC-02 browser AC-PLT-REC-02..05 stamp `RECPLATQA2-MSIXNFE2` · JD DnD / IV one-active / YCTD / hire→EMP **RETAIN** · `po-hrm-rec-ux-qc-process-01` process NO-GO **RETAIN** (cấm reopen without warrant) |
| **ref_peer_emp** | EMP DOC/ET open catalog · [`EMP-VERTICAL-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md) |
| **ref_peer_dec** | DEC decision-types · [`DEC-VERTICAL-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md) |
| **ref_peer_pay** | PAY Nest `salary_components` Option B · [`PAY-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md) **AC-PLT-PAY-01** |
| **ref_peer_att** | ATT Nest `att_leave_type` Option B · [`ATT-LEAVE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) **AC-PLT-ATT-LEAVE-01** |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete · §7 REC row |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** · REC §2.2 · vertical **AC-PLT-REC-02..05** · **AC-PLT-REC-01** (JD — OUT) |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-REC-05** («Theo danh mục pipeline đơn vị») · **05a** (UV+YCTD) · **06 / 06a / 06b** (IV/eval/compare) · **07** hire · **00a–00c** JD FormSchema **OUT** this AC |
| **ref_tech** | [`TECHSPEC_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md) FR-UC-BP-REC-05/06/07 → F-REC-APP-* · F-REC-HIRE-01 · UV-YCTD overlay |
| **ref_api** | [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) F-REC-APP-02 · F-REC-UV-YCTD · F-REC-HIRE-01 · program F-REC-CAT-STG/EFF |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §2.4a `rec_pipeline_stage` · §2.5 `rec_candidate_application.stage` · §2.6 history |
| **Honesty** | `recruitment_uat_ready=false` · **DENIED** invent REC UAT · **DENIED** reopen REC UX QC process / JD DnD / IV one-active seals without warrant · **DENIED** reopen EMP/DEC/PAY/ATT/EXT/CTR/LIST-TOTALS · `payroll_e2e_ready=false` · `jd_dynamic_done=false` · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | F-REC-CAT-STG/EFF live · F-REC-APP-02 history append-only · JD FormSchema DnD · IV one-active · hire→EMP · YCTD↔JD · soft-delete · scope_parity U19 · open catalog no CHK IN (starter six) · WF ops map ≠ second SoT |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-REC-STAGE-01 — picker / invent SoT when Nest `rec_pipeline_stage` effective ≠ empty |
| **Requestor** | pm · U88 after ATT-LEAVE-CATALOG-DOCS-01 ACCEPT |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-REC-05/05a/06/06a/07 · BR-PLT-02/05/06 · AC-PLT-REC-02..05 · F-REC-CAT-STG/EFF · peer AC-PLT-ATT-LEAVE-01 / AC-PLT-PAY-01 / EMP / DEC |

### 1.1 Problem

| Current state | Gap |
|---------------|-----|
| Nest **`rec_pipeline_stage`** open catalog CRUD **SEALED** (REC-BE · REC-QC-01 L1 · REC-QC-02 browser AC-PLT-REC-02..05 stamp `RECPLATQA2-MSIXNFE2`) | Catalog **admin** UF ≠ named **consumer invent** AC pack peer ATT/PAY (**AC-PLT-REC-STAGE-01** / deepen **AC-PLT-REC-04**) |
| Settings **Giai đoạn REC** + UV transition bind **GET `/recruitment/pipeline-stages/effective`** | Risk of treating Settings MD partition / hardcoded starter six / WF task codes as **sole** picker SoT (PAY O4 / ATT leave_types class) |
| BE F-REC-APP-02 asserts `to_stage` ∈ F-REC-CAT-EFF-01 → **`HRM-REC-STAGE-UNKNOWN`** when catalog >0 | Named peer AC pack + residual consumer surface inventory (create UV initial stage · kanban · hire gate · IV schedule allow flag) not stamped as **AC-PLT-REC-STAGE-01*** |
| REC UX QC process NO-GO · JD DnD · IV one-active seals | **FORBIDDEN** invent reopen to «pass» stage catalog AC / flip `recruitment_uat_ready` |

**Failure if unresolved:** FE invents free-text `stage` while Nest catalog >0; or Settings MD / starter six alone become SoT; or PM flips `recruitment_uat_ready` / reopens REC UX process seals; or ba-data invents second stage catalog table.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `recruitment_uat_ready=true` · module REC UAT · Phase1 · invent REC UX QC process / JD DnD / IV one-active reopen without warrant
- **SEAL RETAIN:** REC-QC-01 · REC-QC-02 · EMP/DEC/PAY/ATT/EXT/CTR/LIST-TOTALS · JD DnD · IV one-active · YCTD · hire→EMP · ATT leave catalog seals
- Cite existing paths — **cấm** invent `/api/hrm/platform/rec/*` mega catalog

---

## 2. Options

### Option A — Settings Master Data / starter-six hardcode = sole picker SoT

| | |
|--|--|
| **Description** | Consumer UV transition / kanban bind only Settings MD density or closed FE set `{screening,interview,offer,hired,rejected,withdrawn}`; Nest `rec_pipeline_stage` remains admin-only orphan. |
| **Benefits** | Matches older closed-enum FE helpers. |
| **Costs** | Dual orphan vs REC-QC-02 seal (Settings Giai đoạn REC → Nest PUT → picker #7+); peer EMP/DEC/PAY/ATT already chose Nest domain table as code SoT; violates **BR-PLT-05** / DYNAMIC-LOCK. |
| **Risks** | AC green on starter six while TXN asserts Nest effective — **REJECT** as primary SoT. |

### Option B — Nest `rec_pipeline_stage` (F-REC-CAT-STG-01 / F-REC-CAT-EFF-01) = authoritative stage catalog · consumer picker when ≠ empty — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **EMP DOC/ET · DEC decision-types · PAY salary_components · ATT leave Nest LVT**: single open pipeline-stage catalog = Nest `public.rec_pipeline_stage` via **F-REC-CAT-STG-01** list + **F-REC-CAT-EFF-01** effective (tenant writer = SoT; no XBOS stages REF GĐ1 — WF `wf_task_type_key` = **ops map only**). When **effective active count > 0**, consumer forms **must** pick `stage` / `to_stage` ∈ catalog (**BR-PLT-02** · **AC-PLT-REC-STAGE-01** · aligns **AC-PLT-REC-04**). FE picker binds **GET `/api/hrm/recruitment/pipeline-stages/effective`** (display-ready), **not** Settings MD density alone / not hardcode six. Catalog **admin** CREATE N+1 on Settings tab Giai đoạn REC / **F-REC-CAT-STG-02** remains **open slug** (**BR-PLT-05** · REC-QC-02 retain). Invent unknown key → **`HRM-REC-STAGE-UNKNOWN`** (typed KEY 4xx). |
| **Benefits** | Aligns REC-VERTICAL F.1 · REC seals · SRS FR-UC-BP-REC-05 «danh mục pipeline đơn vị» · peer ATT/PAY AC packs; no new table; closes MD/six-vs-Nest ambiguity without inventing XBOS stage REF. |
| **Costs** | ba-process AC surface matrix (APP-02 transition · UV create initial stage · kanban · hire outcome · IV allow flag if in-scope) + optional BE deepen residuals. |
| **Risks** | Misread AC as «forbid open catalog create» → mitigate: **L-REC-STAGE-01** admin vs consumer (§4). Misread as reopen REC UX module process → mitigate: **L-REC-STAGE-09/10**. |

### Option C — Invent recruitment_uat_ready / reopen REC UX QC process · JD DnD · IV / mega EAV

| | |
|--|--|
| **Description** | Flip `recruitment_uat_ready`; reopen `po-hrm-rec-ux-qc-process-01` / JD DnD / IV one-active seals; or ADD parallel `hrm_rec_catalog_rows`. |
| **Benefits** | Fake module green. |
| **Costs** | Honesty breach · seal churn. |
| **Risks** | **REJECT** — DENY invent UAT · DENY process/JD/IV reopen without warrant · DENY mega-EAV (ADR Q-PLT-03). |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings/six SoT | **B Nest F-REC-CAT** | C Invent UAT/process |
|----------|-------:|-------------------:|---------------------:|---------------------:|
| Business value (SRS REC-05 / BR-PLT-02) | 5 | 2 | **5** | 0 |
| Honesty / seal safety | 5 | 3 | **5** | 0 |
| Single stage-key SoT reliability | 5 | 1 | **5** | 1 |
| Time to deliver | 4 | 4 | **3** | 5 |
| Complexity | 4 | 3 | **4** | 1 |
| Maintainability (peer EMP/DEC/PAY/ATT) | 4 | 1 | **5** | 0 |
| **Weighted** | | 66 | **111** | 24 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Nest stage catalog already LIVE + QC sealed; SRS/AC name open unit pipeline catalog + consumer assert; peers EMP/DEC/PAY/ATT use domain Nest + consumer KEY 4xx; residual is **named AC pack + surface inventory**, not missing physicalize. |
| **Rejected** | **A** Settings-MD / starter-six-only picker SoT · **C** invent UAT / process·JD·IV reopen / mega table |
| **Assumptions** | F-REC-CAT-STG/EFF + REC-QC seals remain authoritative; JD FormSchema / IV one-active / hire spine stay must_keep — **not** this AC. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **HOLD** — `rec_pipeline_stage` already physical (REC-DATA/BE) · **FORBIDDEN** second stage catalog table |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01` AC pack (**AC-PLT-REC-STAGE-01***) |
| Unlock ba-data? | **NO** this seat — EXPAND only if BA proves column gap (unlikely GĐ1; flags already typed) |
| Unlock BE consumer deepen? | **HOLD** until BA AC pack CONFIRMED — then narrow CNS-BE only for surfaces BA lists as missing assert (APP-02 assert **may retain** if BA stamps sufficient) |
| Unlock FE picker rebind? | After BA — only if BA finds MD/six-bound surface still inventing; Settings Giai đoạn + UV EFF bind **RETAIN** when already correct |
| REC UAT / UX process / JD / IV? | **FORBIDDEN** invent from this seat |

### 4.2 Peer REC catalog codes already Nest / separate verticals (cite — do not reopen)

| Catalog / ops | Nest / SoT | This seat |
|---------------|------------|-----------|
| Pipeline stages | `rec_pipeline_stage` · F-REC-CAT-STG/EFF | **OWN** AC-PLT-REC-STAGE-01 |
| JD field + layout DnD | `rec_jd_*` FormSchema (ARCH-01 Option A) | **RETAIN OUT** — AC-PLT-REC-01 · **≠** stage catalog |
| YCTD `pipeline_flags_json` | Requisition progress flags | **OPS LOCK** — **≠** application stage catalog (**L-REC-CAT-09**) |
| Interview schedule lifecycle | REC-IV-ONE-ACTIVE | **OPS LOCK** — status ≠ stage catalog |
| Interview eval template | residual R-PLT-REC-04 GĐ1.5 | **OUT** — later Catalog P2 |
| WF task-type codes | `wf_task_type_key` ops map | **OPS** — **≠** second SoT (**L-REC-CAT-02**) |
| REC-03 / `job_postings` | OUT GĐ1 | **FORBIDDEN** stage SoT |

---

## 5. Locks (L-REC-STAGE-*)

| Lock | Rule |
|------|------|
| **L-REC-STAGE-01 Admin ≠ consumer** | **Catalog admin** POST/PUT F-REC-CAT-STG-02 = **open key N+1** (BR-PLT-05 · AC-PLT-REC-02). **Consumers** (APP-02 transition · UV create/update initial `stage` when catalog >0 · kanban column move · hire target stage) when effective Nest **>0** = **picker/FK only** (BR-PLT-02 · **AC-PLT-REC-STAGE-01** · AC-PLT-REC-04). |
| **L-REC-STAGE-02 Code SoT** | Authoritative stage list = Nest `rec_pipeline_stage` via **F-REC-CAT-STG-01** + **F-REC-CAT-EFF-01** — **FORBIDDEN** Settings MD alone / starter-six hardcode as sole SoT |
| **L-REC-STAGE-03 Dual SoT** | HRM tenant writer = SoT; XBOS WF codes = **ops map** only — **FORBIDDEN** dual master write; no GĐ1 XBOS stages REF required |
| **L-REC-STAGE-04 Empty catalog** | Effective active count **=0** → empty picker + VI guidance / optional create CTA; **FORBIDDEN** fake starter in UF (U65); admin CREATE still allowed; compat defaults may use starter keys **only** when empty |
| **L-REC-STAGE-05 Soft-delete** | Retired/`archived_at` hidden from default picker; history `from_stage`/`to_stage` + past `application.stage` remain (**BR-PLT-04** · AC-PLT-REC-03) |
| **L-REC-STAGE-06 Scope** | list ↔ get-by-id ↔ consumer assert same `resolveHrmListScope` (**U19**) |
| **L-REC-STAGE-07 Invent KEY** | When catalog ≠ empty and body `to_stage`/`stage` not in effective → **`HRM-REC-STAGE-UNKNOWN`** — format-only codes **do not** bypass membership |
| **L-REC-STAGE-08 Adjacent OUT** | **FORBIDDEN** fold JD FormSchema / IV one-active / YCTD flags / eval template / REC-03 into this AC pack |
| **L-REC-STAGE-09 Seals retain** | **FORBIDDEN** reopen REC-QC-01/02 · EMP · DEC · PAY · ATT · EXT · CTR · LIST-TOTALS · REC UX QC process · JD DnD · IV one-active without warrant |
| **L-REC-STAGE-10 Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · payroll false · **`C-SLICE-≠-MODULE`** · DENY module REC UAT |

```text
  XBOS WF task codes (rec_screening…) ──► ops map → stage_key only
           │
  F-REC-CAT-STG CRUD ──► public.rec_pipeline_stage (code SoT)
           │
           ▼
  F-REC-CAT-EFF-01 effective (+ hiredOutcomeKey)
           │
  Consumers (when count>0): pick stage ∈ catalog
    · PATCH …/stage · F-REC-APP-02 transition (FR-UC-BP-REC-05)
    · UV create/update initial stage (FR-UC-BP-REC-05a) — BA enumerate
    · Kanban / list badge columns — BA enumerate
    · Hire path → is_hired_outcome key (FR-UC-BP-REC-07) — must_keep
    · IV schedule soft gate allows_interview_schedule (FR-UC-BP-REC-06a) — BA enumerate
           │
  Settings MD / starter six alone ──► NOT sole picker SoT (Option A REJECT)
  recruitment_uat / UX process reopen ──► OUT this seat
  JD FormSchema / IV one-active ──► SEPARATE must_keep
```

---

## 6. F.1 capability pointer (cite — do not duplicate REC-VERTICAL)

| Cap | Path / rule | AC |
|-----|-------------|-----|
| List / admin SoT | **F-REC-CAT-STG-01** `GET /api/hrm/recruitment/pipeline-stages` | AC-PLT-REC-02 |
| Effective picker SoT | **F-REC-CAT-EFF-01** `GET …/pipeline-stages/effective` | **AC-PLT-REC-STAGE-01** |
| Admin create open | **F-REC-CAT-STG-02** — N+1 slug OK | VAL-REC-STG · **≠** consumer free-text |
| Consumer assert | EXPAND on APP-02 / UV mutate: `to_stage`/`stage` ∈ effective when count>0 → else **`HRM-REC-STAGE-UNKNOWN`** | **AC-PLT-REC-STAGE-01** · AC-PLT-REC-04 |
| Retire / history | F-REC-CAT-STG-02 retire · soft-delete | AC-PLT-REC-03 |
| Hire outcome | `is_hired_outcome` → F-REC-HIRE-01 | AC-PLT-REC-05 · must_keep |
| IV / JD / YCTD | Existing spines — **cite SRS** — **OUT** reopen | DENY |

**Error (consumer invent):** catalog ≠ empty ∧ `to_stage`/`stage` ∉ effective → **`HRM-REC-STAGE-UNKNOWN`** (400).

---

## 7. AC / validation matrix (for ba-process deepen)

| ID | Condition | Expected PASS | FAIL |
|----|-----------|---------------|------|
| **AC-PLT-REC-STAGE-01** | Nest/EFF active ≥1 · consumer transition / set stage | Picker from F-REC-CAT-EFF-01 · 2xx · F5 stage ∈ catalog | Free-text Input as SoT · Settings MD / six alone |
| **AC-PLT-REC-STAGE-01b** | Same · invent unknown key | **4xx** `HRM-REC-STAGE-UNKNOWN` | 2xx invent |
| **AC-PLT-REC-STAGE-01c** | Nest/EFF active =0 | Empty picker + admin may CREATE open · no fake rows in UF | Seed/fake density for UF |
| **AC-PLT-REC-STAGE-01d** | Catalog admin CREATE N+1 | **2xx** open slug (REC-QC-02 retain) | Reject as «must pick existing only» / closed six |
| **AC-PLT-REC-STAGE-01H** | Honesty | `recruitment_uat_ready=false` · UX process/JD/IV seals retain · no module UAT | Flip flags / reopen seals |
| **AC-PLT-REC-02** | (retain) admin create → F5 → picker | Already GWC — **RETAIN** | Reopen as new work |
| **AC-PLT-REC-03** | (retain) retire hide · history | Already GWC — **RETAIN** | Hard-delete |
| **AC-PLT-REC-04** | Aligns **01b** invent 4xx | L1+browser SEAL; pack cross-ref | Silent accept |
| **AC-PLT-REC-05** | (retain) hire → hired-outcome · EMP link | Already GWC — **RETAIN** | Break hire spine |
| **VAL-REC-CNS-01** | APP-02 `to_stage` OOS when catalog >0 | 4xx UNKNOWN | Silent accept |
| **VAL-REC-CNS-02** | UV create invent initial stage (if BA in-scope) | 4xx or picker-only | Free-text SoT |
| **VAL-REC-CNS-03** | List picker scope ≠ assert scope | jest FAIL scope_parity | Drift |

**Consumer surface inventory (ba-process must enumerate exact UF/J-*):** Ứng viên đổi trạng thái (FR-UC-BP-REC-05) · UV create/update initial stage (FR-UC-BP-REC-05a) · kanban/list stage columns · Hire/offer accept (FR-UC-BP-REC-07) · IV schedule allow soft-gate (FR-UC-BP-REC-06a) if stage-flag bound — **not** F-REC-CAT-STG-02 admin create · **not** JD DnD · **not** IV one-active core · **not** YCTD flags · **not** REC-03.

**Align note:** **AC-PLT-REC-STAGE-01** = named peer of **AC-PLT-ATT-LEAVE-01** / **AC-PLT-PAY-01**; vertical **AC-PLT-REC-04** remains the invent row — BA pack must cross-ref both (no duplicate conflicting rules).

---

## 8. Failure modes

| Option / path | Failure mode | Detection | Mitigation |
|---------------|--------------|-----------|------------|
| A | MD/six green · Nest orphan | UV probe source ≠ effective | Reject A; bind EFF |
| B | FE still uses six-only helper | QA AC-PLT-REC-STAGE-01 picker source | FE rebind / remove six sole path |
| B | BE treats admin create as invent | Catalog N+1 4xx | L-REC-STAGE-01 · REC-QC-02 retain |
| C | Claim recruitment_uat / reopen UX process | Honesty / seal audit | DENY |
| Any | Seed density for picker | U65 audit | FAIL QA |

---

## 9. Rollout / validation

| Step | Owner | Exit |
|------|-------|------|
| 1 This SA Option B LOCK | sa | **CONFIRMED** (this file) |
| 2 AC pack consumer surfaces | **ba-process** | CONFIRMED AC-PLT-REC-STAGE-01* click paths |
| 3 ba-data | **HOLD** unless BA proves physical EXPAND | No second table |
| 4 BE consumer deepen | **dev-be** HOLD→unlock after BA | jest VAL-REC-CNS-* only for BA gaps |
| 5 FE picker fix | **dev-fe** only if BA flags MD/six sole bind | EFF bind retain when OK |
| 6 QA U65 invent + picker | qa | browser · zero-seed · no UAT flip |
| 7 QC slice GWC | qc | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` |

**Rollback:** retain REC-QC seals; revert FE bind only — no DDL drop.

**Success (this seat):** Option B locked · ba-data HOLD · ba-process unlocked · BE HOLD · honesty false · seals retained · REC UX process/JD/IV **not** reopened.

---

## 10. Non-claims

- No `apps/**` / migration / seed.
- No `recruitment_uat_ready=true` · no module REC UAT · no Phase1 · no invent REC UX QC process / JD DnD / IV one-active reopen.
- No reopen EMP · DEC · PAY · ATT · EXT · CTR · LIST-TOTALS · REC-QC-01/02 · ATT leave catalog seals.
- No claim payroll e2e / printable / formula LIVE / `jd_dynamic_done=true`.
- Prior REC-VERTICAL / REC-DATA / REC-BE / REC-FE / REC-QC **remain CONFIRMED** — this file owns **AC-PLT-REC-STAGE-01 consumer Option** (peer ATT-LEAVE-CATALOG-SA-01 / PAY-CATALOG-SA-01), not a second F.1 API redesign.

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **next_owner** | **pm** → **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-sa-01.md` |
| **ba-data** | **HOLD** |
| **BE** | **HOLD** until BA AC pack |
