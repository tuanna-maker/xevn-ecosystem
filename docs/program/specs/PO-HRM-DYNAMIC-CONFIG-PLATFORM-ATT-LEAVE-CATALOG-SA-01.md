# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01 — Option/F.1 · AC-PLT-ATT-LEAVE-01 consumer picker (catalog ≠ empty)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-DOCS-01` **DOC-DELTA ACCEPT** · U88 continuous |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-ATT-LEAVE-01** · **REFINE** admin vs consumer SoT · **NO** new physical table · **NO CODE** `apps/**` · **no seed** · **no wipe** ATT WAIVE / sign / J-HRM-06c · EMP/DEC/PAY/EXT/CTR/LIST-TOTALS |
| **Date** | 2026-08-07 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **HOLD** · ba-process **UNLOCK** · BE consumer-deepen **HOLD** until BA AC pack |
| **prior_vertical** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md) F-ATT-CAT-LVT/EFF **CONFIRMED** · DATA/BE/FE/QA/QC **SEAL RETAIN** |
| **prior_seals** | ATT-QC-01 L1 GWC · ATT-QC-02 browser AC-PLT-ATT-01..02 stamp `ATTPLATQA2-MSIVNE4A` · leave funnel WAIVE / J-HRM-06c **RETAIN** |
| **ref_peer_emp** | EMP DOC/ET open catalog · [`EMP-VERTICAL-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md) |
| **ref_peer_dec** | DEC decision-types · [`DEC-VERTICAL-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md) |
| **ref_peer_pay** | PAY Nest `salary_components` Option B · [`PAY-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md) **AC-PLT-PAY-01** |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete · §7 ATT row · [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) D1–D4 |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** · ATT §2.3 · vertical **AC-PLT-ATT-01..03** |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) **FR-UC-BP-ATT-04/04b/05/05b/06/07/08/09** (leave type · balance panel · hold · sick) · funnel leave TXN must_keep |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) §4.4 `att_leave_type` · leave_requests / balance soft FK keys |
| **Honesty** | `attendance_uat_ready=false` · **DENIED** invent ATT UAT · **DENIED** reopen leave WAIVE / sign / J-HRM-06c without warrant · **DENIED** reopen EMP/DEC/PAY/EXT/CTR/LIST-TOTALS · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | F-ATT-CAT-LVT/EFF live · `work_shifts` ops · sheet close/sign · leave funnel · dual SoT group REF `leave_types` · soft-delete · scope_parity U19 · open catalog no CHK IN (N) |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-ATT-LEAVE-01 — picker / invent SoT when Nest `att_leave_type` effective ≠ empty |
| **Requestor** | pm · U88 after PAY-CATALOG-DOCS-01 ACCEPT |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-ATT-04..09 · BR-PLT-02/05/06 · AC-PLT-ATT-01..03 · F-ATT-CAT-LVT/EFF · peer AC-PLT-PAY-01 / EMP / DEC |

### 1.1 Problem

| Current state | Gap |
|---------------|-----|
| Nest **`att_leave_type`** open catalog CRUD **SEALED** (ATT-BE · ATT-QC-01 L1 · ATT-QC-02 browser AC-01..02) | Catalog **admin** UF ≠ named **consumer invent** AC pack peer PAY (**AC-PLT-ATT-LEAVE-01** / deepen **AC-PLT-ATT-03**) |
| LeaveTab binds **GET `/attendance/leave-types/effective`** (ATT + group REF) | Settings Master Data still exposes partition **`leave_types`** — risk of treating REF as **sole** picker SoT (PAY O4 class) |
| BE `createLeaveRequest` asserts ∈ F-ATT-CAT-EFF-01 → **`HRM-LEAVE-TYPE-UNKNOWN`** when catalog >0 | Browser invent residual + balance/accrual surfaces not stamped as **AC-PLT-ATT-LEAVE-01*** pack |
| Leave WAIVE / J-HRM-06c / sheet-sign seals | **FORBIDDEN** invent reopen to «pass» leave catalog AC |

**Failure if unresolved:** FE invents free-text leave keys while Nest catalog >0; or Settings MD alone becomes SoT; or PM flips `attendance_uat_ready` / reopens WAIVE; or ba-data invents second leave catalog table.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `attendance_uat_ready=true` · module ATT UAT · Phase1 · invent leave WAIVE reopen / J-HRM-06c flip without warrant
- **SEAL RETAIN:** ATT-QC-01 · ATT-QC-02 · EMP/DEC/PAY/EXT/CTR/LIST-TOTALS · leave funnel WAIVE seals
- Cite existing paths — **cấm** invent `/api/hrm/platform/att/*` mega catalog

---

## 2. Options

### Option A — Settings Master Data `leave_types` = sole picker SoT

| | |
|--|--|
| **Description** | Consumer LeaveTab / balance panel bind only settings-catalogs partition `leave_types`; Nest `att_leave_type` remains admin-only orphan. |
| **Benefits** | Matches older MD leaveTypes FE helpers (`leaveTypeOptionsFromCatalog`). |
| **Costs** | Dual orphan vs ATT-QC-02 seal (Settings Loại phép ATT → Nest PUT); peer EMP/DEC/PAY already chose Nest domain table as code SoT. |
| **Risks** | AC green on REF while TXN asserts Nest effective — **REJECT** as primary SoT. |

### Option B — Nest `att_leave_type` (F-ATT-CAT-LVT-01 / F-ATT-CAT-EFF-01) = authoritative leave-type catalog · consumer picker when ≠ empty — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **EMP DOC/ET · DEC decision-types · PAY salary_components Option B**: single open leave-type catalog = Nest `public.att_leave_type` via **F-ATT-CAT-LVT-01** list + **F-ATT-CAT-EFF-01** effective union (ATT wins collision over group REF `leave_types`). When **effective active count > 0**, consumer forms **must** pick `leave_type` ∈ catalog (**BR-PLT-02** · **AC-PLT-ATT-LEAVE-01** · aligns **AC-PLT-ATT-03**). FE picker binds **GET `/api/hrm/attendance/leave-types/effective`** (display-ready), **not** Settings MD density alone. Catalog **admin** CREATE N+1 on Settings tab Loại phép ATT / **F-ATT-CAT-LVT-02** remains **open slug** (**BR-PLT-05** · ATT-QC-02 retain). Group REF = **read merge** only — **not** second writer for consumer invent. Invent unknown key → **`HRM-LEAVE-TYPE-UNKNOWN`** (typed KEY 4xx). |
| **Benefits** | Aligns ATT-VERTICAL F.1 · ATT seals · SRS leave FR · peer PAY AC-PLT-PAY-01; no new table; closes MD-vs-Nest ambiguity without XBOS P2 invent. |
| **Costs** | ba-process AC surface matrix (leave create · balance panel · accrual policy if in-scope) + optional BE deepen residuals. |
| **Risks** | Misread AC as «forbid open catalog create» → mitigate: **L-ATT-LEAVE-01** admin vs consumer (§4). |

### Option C — Invent attendance_uat_ready / reopen WAIVE·sign·J-HRM-06c / mega EAV

| | |
|--|--|
| **Description** | Flip `attendance_uat_ready`; reopen leave WAIVE / sheet-sign seals; or ADD parallel `hrm_att_catalog_rows`. |
| **Benefits** | Fake module green. |
| **Costs** | Honesty breach · seal churn. |
| **Risks** | **REJECT** — DENY invent UAT · DENY WAIVE reopen without warrant · DENY mega-EAV (ADR Q-PLT-03). |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings MD SoT | **B Nest F-ATT-CAT** | C Invent UAT/WAIVE |
|----------|-------:|------------------:|---------------------:|-------------------:|
| Business value (SRS leave FR / BR-PLT-02) | 5 | 2 | **5** | 0 |
| Honesty / seal safety | 5 | 3 | **5** | 0 |
| Single leave-type SoT reliability | 5 | 1 | **5** | 1 |
| Time to deliver | 4 | 4 | **3** | 5 |
| Complexity | 4 | 3 | **4** | 1 |
| Maintainability (peer EMP/DEC/PAY) | 4 | 1 | **5** | 0 |
| **Weighted** | | 66 | **111** | 24 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Nest leave-type catalog already LIVE + QC sealed; SRS/AC name open catalog + consumer assert; peers EMP/DEC/PAY use domain Nest + consumer KEY 4xx; residual is **named AC pack + surface inventory**, not missing physicalize. |
| **Rejected** | **A** Settings-MD-only picker SoT · **C** invent UAT / WAIVE reopen / mega table |
| **Assumptions** | F-ATT-CAT-LVT/EFF + ATT-QC seals remain authoritative; sheet/sign/WAIVE stay must_keep — **not** this AC. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **HOLD** — `att_leave_type` already physical (ATT-DATA/BE) · **FORBIDDEN** second leave catalog table |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01` AC pack (**AC-PLT-ATT-LEAVE-01***) |
| Unlock ba-data? | **NO** this seat — EXPAND only if BA proves column gap (unlikely GĐ1) |
| Unlock BE consumer deepen? | **HOLD** until BA AC pack CONFIRMED — then narrow CNS-BE only for surfaces BA lists as missing assert (leave-requests assert **may retain** if BA stamps sufficient) |
| Unlock FE picker rebind? | After BA — only if BA finds MD-bound surface still inventing; LeaveTab effective bind **RETAIN** when already correct |
| ATT UAT / WAIVE / sign? | **FORBIDDEN** invent from this seat |

### 4.2 Peer ATT catalog codes already Nest (cite — do not reopen)

| Catalog / ops | Nest SoT | This seat |
|---------------|----------|-----------|
| Leave types | `att_leave_type` · F-ATT-CAT-LVT/EFF | **OWN** AC-PLT-ATT-LEAVE-01 |
| Work sites | `attendance_work_sites` · F-ATT-CAT-WS-* | **RETAIN** — out of AC-LEAVE pack (AC-PLT-ATT-04 peer) |
| Work shifts | `work_shifts` ops (ADR D1) | **OPS LOCK** — **FORBIDDEN** treat as platform Catalog duplicate |

---

## 5. Locks (L-ATT-LEAVE-*)

| Lock | Rule |
|------|------|
| **L-ATT-LEAVE-01 Admin ≠ consumer** | **Catalog admin** POST/PUT F-ATT-CAT-LVT-02 = **open key N+1** (BR-PLT-05 · AC-PLT-ATT-01). **Consumers** (leave-request create · balance panel bind · accrual policy key when in-scope) when effective Nest/EFF **>0** = **picker/FK only** (BR-PLT-02 · **AC-PLT-ATT-LEAVE-01** · AC-PLT-ATT-03). |
| **L-ATT-LEAVE-02 Code SoT** | Authoritative leave-type list = Nest `att_leave_type` via **F-ATT-CAT-LVT-01** + **F-ATT-CAT-EFF-01** — **FORBIDDEN** Settings MD `leave_types` density as sole SoT |
| **L-ATT-LEAVE-03 Dual SoT REF** | Group REF `leave_types` = **merge-read** into effective; ATT native **wins** collision — **FORBIDDEN** dual master write |
| **L-ATT-LEAVE-04 Empty catalog** | Effective active count **=0** → empty picker + VI guidance / optional sync CTA; **FORBIDDEN** fake starter in UF (U65); admin CREATE still allowed |
| **L-ATT-LEAVE-05 Soft-delete** | Retired/`archived_at` hidden from default picker; history leave_requests keys remain (**BR-PLT-04** · AC-PLT-ATT-02) |
| **L-ATT-LEAVE-06 Scope** | list ↔ get-by-id ↔ consumer assert same `resolveHrmListScope` (**U19**) |
| **L-ATT-LEAVE-07 Invent KEY** | When catalog ≠ empty and body `leave_type` not in effective → **`HRM-LEAVE-TYPE-UNKNOWN`** — format-only codes **do not** bypass membership |
| **L-ATT-LEAVE-08 Ops OUT** | **FORBIDDEN** fold `work_shifts` into leave catalog AC; work-sites deepen OUT of this pack |
| **L-ATT-LEAVE-09 Seals retain** | **FORBIDDEN** reopen ATT-QC-01/02 · EMP · DEC · PAY · EXT · CTR · LIST-TOTALS · leave WAIVE / J-HRM-06c / sheet-sign without warrant |
| **L-ATT-LEAVE-10 Honesty** | `attendance_uat_ready=false` · payroll false · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT |

```text
  XBOS / settings-catalogs leave_types (group REF) ──► merge-read only
           │
  F-ATT-CAT-LVT CRUD ──► public.att_leave_type (code SoT)
           │
           ▼
  F-ATT-CAT-EFF-01 effective (ATT wins)
           │
  Consumers (when count>0): pick leave_type ∈ catalog
    · POST leave-requests (create)
    · Leave balance panel / hold (FR-UC-BP-ATT-05b/09) — BA enumerate
    · Accrual policy bind keys (if UF in-scope) — BA enumerate
           │
  Settings MD leave_types alone ──► NOT sole picker SoT (Option A REJECT)
  attendance_uat / WAIVE reopen ──► OUT this seat
```

---

## 6. F.1 capability pointer (cite — do not duplicate ATT-VERTICAL)

| Cap | Path / rule | AC |
|-----|-------------|-----|
| List / admin SoT | **F-ATT-CAT-LVT-01** `GET /api/hrm/attendance/leave-types` | AC-PLT-ATT-01 |
| Effective picker SoT | **F-ATT-CAT-EFF-01** `GET …/leave-types/effective` | **AC-PLT-ATT-LEAVE-01** |
| Admin create open | **F-ATT-CAT-LVT-02** — N+1 slug OK | VAL-ATT-LVT · **≠** consumer free-text |
| Consumer assert | EXPAND on leave TXN: `leave_type` ∈ effective when count>0 → else **`HRM-LEAVE-TYPE-UNKNOWN`** | **AC-PLT-ATT-LEAVE-01** · AC-PLT-ATT-03 |
| Retire / history | F-ATT-CAT-LVT-02 retire · soft-delete | AC-PLT-ATT-02 |
| Leave balance / hold | Existing F-ATT-LEAVE-* / balance APIs — **cite SRS FR-UC-BP-ATT-05b/09** — BA lists assert deepen | residual if missing |
| Sheet / sign / WAIVE | **must_keep** — **OUT** | DENY reopen |

**Error (consumer invent):** catalog ≠ empty ∧ `leave_type` ∉ effective → **`HRM-LEAVE-TYPE-UNKNOWN`** (400).

---

## 7. AC / validation matrix (for ba-process deepen)

| ID | Condition | Expected PASS | FAIL |
|----|-----------|---------------|------|
| **AC-PLT-ATT-LEAVE-01** | Nest/EFF active ≥1 · consumer create leave | Picker from F-ATT-CAT-EFF-01 · 2xx · F5 type ∈ catalog | Free-text Input as SoT · Settings MD alone |
| **AC-PLT-ATT-LEAVE-01b** | Same · invent unknown key | **4xx** `HRM-LEAVE-TYPE-UNKNOWN` | 2xx invent |
| **AC-PLT-ATT-LEAVE-01c** | Nest/EFF active =0 | Empty picker + admin may CREATE open · no fake rows | Seed/fake density for UF |
| **AC-PLT-ATT-LEAVE-01d** | Catalog admin CREATE N+1 | **2xx** open slug (ATT-QC-02 retain) | Reject as «must pick existing only» |
| **AC-PLT-ATT-LEAVE-01H** | Honesty | `attendance_uat_ready=false` · WAIVE/sign/J-06c seals retain · no module UAT | Flip flags / reopen seals |
| **AC-PLT-ATT-01** | (retain) admin create → F5 → picker | Already GWC — **RETAIN** | Reopen as new work |
| **AC-PLT-ATT-02** | (retain) retire hide · history | Already GWC — **RETAIN** | Hard-delete |
| **AC-PLT-ATT-03** | Aligns **01b** invent 4xx | L1 SEAL; browser stamp via LEAVE-01b | Silent accept |
| **VAL-ATT-CNS-01** | Leave create type OOS when catalog >0 | 4xx UNKNOWN | Silent accept |
| **VAL-ATT-CNS-02** | Balance/hold mutate invent key (if BA in-scope) | 4xx or picker-only | Free-text SoT |
| **VAL-ATT-CNS-03** | List picker scope ≠ assert scope | jest FAIL scope_parity | Drift |

**Consumer surface inventory (ba-process must enumerate exact UF/J-*):** Nghỉ phép create dialog · leave balance panel (FR-UC-BP-ATT-05b) · hold on submit (FR-UC-BP-ATT-09) · sick/attach rules class (FR-UC-BP-ATT-07) — **not** F-ATT-CAT-LVT-02 admin create · **not** sheet close/sign · **not** work_shifts.

**Align note:** **AC-PLT-ATT-LEAVE-01** = named peer of **AC-PLT-PAY-01**; vertical **AC-PLT-ATT-03** remains the invent row — BA pack must cross-ref both (no duplicate conflicting rules).

---

## 8. Failure modes

| Option / path | Failure mode | Detection | Mitigation |
|---------------|--------------|-----------|------------|
| A | MD green · Nest orphan | LeaveTab probe source ≠ effective | Reject A; bind EFF |
| B | FE still uses MD-only helper | QA AC-PLT-ATT-LEAVE-01 picker source | FE rebind / remove MD sole path |
| B | BE treats admin create as invent | Catalog N+1 4xx | L-ATT-LEAVE-01 · ATT-QC-02 retain |
| C | Claim attendance_uat / reopen WAIVE | Honesty / seal audit | DENY |
| Any | Seed density for picker | U65 audit | FAIL QA |

---

## 9. Rollout / validation

| Step | Owner | Exit |
|------|-------|------|
| 1 This SA Option B LOCK | sa | **CONFIRMED** (this file) |
| 2 AC pack consumer surfaces | **ba-process** | CONFIRMED AC-PLT-ATT-LEAVE-01* click paths |
| 3 ba-data | **HOLD** unless BA proves physical EXPAND | No second table |
| 4 BE consumer deepen | **dev-be** HOLD→unlock after BA | jest VAL-ATT-CNS-* only for BA gaps |
| 5 FE picker fix | **dev-fe** only if BA flags MD sole bind | LeaveTab EFF retain when OK |
| 6 QA U65 invent + picker | qa | browser · zero-seed · no UAT flip |
| 7 QC slice GWC | qc | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` |

**Rollback:** retain ATT-QC seals; revert FE bind only — no DDL drop.

**Success (this seat):** Option B locked · ba-data HOLD · ba-process unlocked · BE HOLD · honesty false · seals retained · WAIVE/sign/J-06c **not** reopened.

---

## 10. Non-claims

- No `apps/**` / migration / seed.
- No `attendance_uat_ready=true` · no module ATT UAT · no Phase1 · no invent leave WAIVE / J-HRM-06c / sheet-sign reopen.
- No reopen EMP · DEC · PAY · EXT · CTR · LIST-TOTALS · ATT-QC-01/02.
- No claim payroll e2e / printable / formula LIVE.
- Prior ATT-VERTICAL / ATT-DATA / ATT-BE **remain CONFIRMED** — this file owns **AC-PLT-ATT-LEAVE-01 consumer Option** (peer PAY-CATALOG-SA-01), not a second F.1 API redesign.

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **next_owner** | **pm** → **ba-process** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-sa-01.md` |
| **ba-data** | **HOLD** |
| **BE** | **HOLD** until BA AC pack |
