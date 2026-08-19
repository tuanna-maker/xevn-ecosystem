# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01 — Option/F.1 · AC-PLT-ATT-SHIFT-01 Nest work_shifts deepen

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-01` **GWC** stamp **`ATTCODEQA-MSK4T1A5`** · U88 continuous · **L-ATT-CODE-08** orthogonal residual **`work_shifts`** (≠ day-code · ≠ leave · ≠ work-sites) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-ATT-SHIFT-01*** · **DEEPEN** Nest **`public.work_shifts`** already **LIVE** (ADR **D1**) · **NO** new physical table · **NO CODE** `apps/**` · **no seed** · **no wipe** ATT-CODE L1 · ATT leave/worksite · EMP seals · SI/CTR · aggregate GĐ1 |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **HOLD** · ba-process **UNLOCK** · BE deepen **HOLD** until BA · ba-data **HOLD** unless BA proves column EXPAND |
| **prior_qc** | ATT-CODE-CATALOG QC GWC **`ATTCODEQA-MSK4T1A5`** — **SEAL RETAIN** · R-PLT-ATT-CODE-FE-01 **HOLD** (**do not invent FE**) · honesty `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** |
| **prior_seals** | ATT leave `ATTLEAVEQA-MSJ7CPJH` · ATT worksite `ATTWSQA-MSJC3IN9` · EMP `EMPDEPTQA-MSK3VVXX` · `EMPPOSQA2-MSK3CDH1` · `EMPSTQA-MSK20G7H` · `EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1` · SI/CTR · PAY/LIST-TOTALS / aggregate GĐ1 — **SEAL RETAIN** |
| **ref_peer_att_code** | Nest day-code Option **B** · [`ATT-CODE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md) **L-ATT-CODE-08** — **`work_shifts` OUT / OPS LOCK** · **cite ≠ copy** · **FORBIDDEN** fold · **FORBIDDEN** reopen L1 |
| **ref_peer_att_leave** | Nest leave Option **B** · [`ATT-LEAVE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) — **cite** admin≠consumer · **SEAL RETAIN** |
| **ref_peer_att_worksite** | Nest work-sites Option **B** deepen LIVE · [`ATT-WORKSITE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md) — **closest structural peer** (Nest LIVE + hard DELETE residual + Settings REF ≠ sole SoT) · **cite ≠ copy** |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog · L6 soft-delete · **Q-PLT-03 mega-EAV DENY** · [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D1** work_shifts ops SoT · XBOS/`shifts` REF only |
| **ref_ba** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) **BR-PLT-02/04/05/06** · ATT §2.3 · DATA_CLASS CFG «Ca làm việc (instance)» |
| **ref_srs** | [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) FR-UC-BP-ATT / FR-HRM-SC-SHIFT-01 (dual resolved D1) · Ca list · OT / shift-change TXN consumers |
| **ref_db** | [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) `work_shifts` ops SoT · ≠ att_leave_type · ≠ attendance_work_sites · ≠ att_attendance_code |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **DENIED** invent module ATT UAT · **DENIED** reopen ATT-CODE L1 / leave / worksite / EMP / SI / CTR · **DENIED** rewrite aggregate · **DENIED** invent FE ATT-CODE HOLD · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | Nest `public.work_shifts` LIVE CRUD · ADR D1 «work_shifts wins» · Settings/`shifts` REF only (no dual-write) · ATT-CODE / leave / worksite seals · soft-delete class · scope_parity U19 · open `code` slug · payroll coeff on assigned shift row (consumer cite) |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-ATT-SHIFT-01 — Nest work_shifts open catalog deepen · admin CREATE N+1 · consumer invent KEY when catalog ≠ empty · Settings `shifts` REF only |
| **Requestor** | pm · U88 after ATT-CODE-CATALOG-QC-01 GWC · L-ATT-CODE-08 orthogonal `work_shifts` platform deepen |
| **Decision owner** | sa |
| **Related** | ADR D1 · BR-PLT-02/04/05/06 · FR-HRM-SC-SHIFT-01 · peer AC-PLT-ATT-WORKSITE-01 / ATT-LEAVE-01 / ATT-CODE-01 |

### 1.1 Problem — AS-IS vs target

| Current state (AS-IS grep evidence) | Gap / target |
|-------------------------------------|--------------|
| Nest **`public.work_shifts` LIVE** — `AttendanceCatalogService.ensureWorkShiftSchema` + `GET/POST/PATCH/DELETE /api/hrm/attendance/work-shifts*` · FE `useWorkShifts` / Attendance tab Ca | Named **AC-PLT-ATT-SHIFT-01*** deepen peer leave/worksite/code — admin open ≠ consumer invent |
| ADR **D1** locks ops SoT = Nest `work_shifts`; XBOS/Settings partition **`shifts`** = **group REF only** · MD panel **cấm dual-write** (`mdBucketRegistry` / MasterDataSettingsPanel must_keep) | Risk of Option A misread: treat Settings MD `shifts` as sole SoT — **REJECT** (contradicts D1 + peer worksite class) |
| FE **`ShiftChangeRequestTab`** hardcodes closed shift list `morning \| afternoon \| night \| office \| flexible` (**H**) — **not** Nest `listWorkShifts` | Consumer picker must bind Nest EFF/list when count>0; hardcode = bootstrap fallback only when empty |
| DELETE = **hard** `DELETE FROM public.work_shifts` | Platform **BR-PLT-04** soft-retire (`status='inactive'` / `archived_at`) deepen residual — **not** new table |
| List returns **all** rows (no default active filter) | Default exclude inactive unless `include_inactive=true` — deepen |
| No consumer invent assert on shift-change / OT / assignment binding `shift_id`/`code` ∈ scoped catalog | Invent → typed **`HRM-ATT-SHIFT-KEY`** (alias `HRM-ATT-SHIFT-UNKNOWN` / retain `HRM-WS-404` for get-by-id OOS — BA locks one invent code) |
| ATT-CODE **L-ATT-CODE-08** stamps `work_shifts` **orthogonal OPS LOCK** | This seat **OWN** deepen — **FORBIDDEN** fold into day-code / leave / worksite · **FORBIDDEN** reopen ATT-CODE L1 |

**Failure if unresolved:** Settings/`shifts` treated as sole SoT (ADR D1 breach); shift-change stays closed hardcode while Nest catalog open; hard-delete orphans assignment history; someone folds shifts into `att_attendance_code` / leave / worksite; PM flips `attendance_uat_ready` / invents FE ATT-CODE HOLD; ba-data invents second shifts table / mega-EAV.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `attendance_uat_ready=true` · `payroll_e2e_ready=true` · module ATT UAT · Phase1
- **SEAL RETAIN:** ATT-CODE L1 **`ATTCODEQA-MSK4T1A5`** · R-PLT-ATT-CODE-FE-01 HOLD (**do not invent FE**) · ATT leave · ATT worksite · EMP dept/pos/status/custom/token-ext · SI · CTR · aggregate GĐ1 / LIST-TOTALS
- Cite existing `/api/hrm/attendance/work-shifts*` — **cấm** invent `/api/hrm/platform/att/*` mega catalog
- **FORBIDDEN** fold work_shifts into `att_attendance_code` / `att_leave_type` / `attendance_work_sites`
- **FORBIDDEN** reopen ATT-CODE L1 · leave · worksite · EMP · SI/CTR seals
- **FORBIDDEN** rewrite `att-timesheet-line-aggregate` / payroll formula this seat

### 1.3 Decision heuristic (program rule — applied)

| Rule | Application this seat |
|------|------------------------|
| Prefer **B Nest** if producer absent / hardcode residual | Nest producer **LIVE** + **hardcode residual** on consumer (`ShiftChangeRequestTab`) + hard DELETE + no invent KEY → **B deepen** (peer worksite) |
| Prefer **A Settings** if producer LIVE | Settings/`shifts` is **REF only** (ADR D1) — **not** LIVE ops producer → **A REJECT** as primary SoT |
| REJECT mega-EAV · fold into code/leave/worksite · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD | Explicit **Option C** reject |

---

## 2. Options

### Option A — Settings Master Data / XBOS `shifts` = sole SoT

| | |
|--|--|
| **Description** | Consumer Ca list / shift-change / OT bind only settings-catalogs partition `shifts` (or XBOS catalog sync density); Nest `work_shifts` becomes orphan or dual-write chaos. |
| **Benefits** | Nominal match to older «catalog» wording; zero Nest deepen. |
| **Costs** | Contradicts ADR **D1** (`work_shifts` wins for schedule / payroll coeff / OT) · MD panel already forbids dual-write · FE Ca tab already Nest-bound · peer leave/worksite/code Nest SoT. |
| **Risks** | AC green on REF while ops/payroll read Nest — **REJECT** as primary SoT. |

### Option B — Nest `work_shifts` (F-ATT-CAT-SHIFT-*) = authoritative open shift catalog · Settings `shifts` REF merge-read · deepen admin open + consumer invent — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **ATT leave · ATT worksite · ATT code · EMP/DEC/PAY**: single open **work-shift instance** catalog = Nest **`public.work_shifts`** via existing CRUD paths (**KEEP** — deepen only; name caps **F-ATT-CAT-SHIFT-01** list/effective · **F-ATT-CAT-SHIFT-02** mutate). When **active shift count > 0**, consumer surfaces that bind a shift (shift-change request · OT base · any mutate with `shift_id`/`code` in BA inventory) **must** pick ∈ Nest catalog (**BR-PLT-02** · **AC-PLT-ATT-SHIFT-01**). Catalog **admin** CREATE N+1 remains **open** (`code` + name + times + coefficient — **BR-PLT-05** · no closed morning/afternoon enum ceiling). Settings/XBOS **`shifts`** = **group REF merge-read only** (**BR-PLT-06** · ADR D1) — **FORBIDDEN** dual-write / sole SoT. Invent unknown key/id → **`HRM-ATT-SHIFT-KEY`**. Empty active catalog → soft skip invent + CTA admin CREATE · **no seed** · FE hardcode five-shift list = **bootstrap fallback only** (EFF=0). Soft-retire prefer `status='inactive'` (or `archived_at`) over hard DELETE when history may reference (**BR-PLT-04**). Display-ready `name`/`code`/times from Nest row. |
| **Benefits** | Aligns ADR D1 · peer worksite LIVE deepen · closes hardcode consumer gap · admin≠consumer · no new table · closes L-ATT-CODE-08 OUT residual without reopening ATT-CODE. |
| **Costs** | ba-process AC surface matrix (Ca CRUD · ShiftChange · OT if in-scope) + optional BE deepen (soft-retire · list active filter · invent KEY · optional `/effective`) · FE rebind residual. |
| **Risks** | Misread as reopen ATT-CODE / fold into day-code · flip UAT · dual-write Settings → **L-ATT-SHIFT-08/09/10**. Misread empty skip as «allow invent always» → **L-ATT-SHIFT-06**. |

### Option C — Hybrid dual writers / mega-EAV / fold into code·leave·worksite / reopen ATT-CODE L1 / invent FE ATT-CODE HOLD / flip UAT / rewrite aggregate

| | |
|--|--|
| **Description** | Settings MD **and** Nest both write; or mega `hrm_att_catalog_rows`; or fold shifts into `att_attendance_code` / leave / worksite; or reopen ATT-CODE L1 / invent FE ATT-CODE HOLD as mandatory; or flip `attendance_uat_ready` / rewrite aggregate. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Dual SoT · seal churn · day-code/shift SoT collision · payroll regression. |
| **Risks** | **REJECT** — DENY mega-EAV (Q-PLT-03) · DENY dual writers · DENY fold · DENY reopen · DENY invent FE HOLD · DENY UAT flip · DENY aggregate rewrite. |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings/`shifts` sole | **B Nest work_shifts deepen** | C Hybrid / fold / reopen / UAT |
|----------|-------:|-------------------------:|------------------------------:|-------------------------------:|
| Business value (ADR D1 / BR-PLT-02/05 · Ca + TXN) | 5 | 1 | **5** | 0 |
| Honesty / seal safety (ATT-CODE·leave·WS·EMP·agg) | 5 | 3 | **5** | 0 |
| Single ops SoT vs ADR D1 | 5 | 0 | **5** | 1 |
| Time to deliver | 4 | 4 | **3** | 4 |
| Complexity | 4 | 3 | **4** | 0 |
| Maintainability (admin open ≠ consumer invent · peer) | 4 | 1 | **5** | 1 |
| **Weighted** | | 52 | **112** | 18 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Nest `work_shifts` already **LIVE** ops SoT (ADR D1) + FE Ca Nest-bound; Settings/`shifts` is **REF only** (not LIVE ops producer → Option A inapplicable). Residual = **named AC pack + F.1 deepen** (admin≠consumer · soft-retire · invent KEY · kill closed hardcode on ShiftChange · list active filter) — peer **ATT-WORKSITE** LIVE deepen class. Hardcode consumer + hard DELETE = deepen triggers, **not** missing physicalize. |
| **Rejected** | **A** Settings/`shifts` sole SoT · **C** hybrid / mega-EAV / fold / reopen ATT-CODE / invent FE HOLD / UAT invent / aggregate rewrite |
| **Assumptions** | ATT-CODE L1 · leave · worksite · EMP · SI/CTR · aggregate remain sealed; one-way REF sync catalog→`work_shifts.code` stays **deferred** (ADR D1); roster grid «Lịch ca» OUT unless BA splits. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **HOLD** — `work_shifts` already LIVE · **FORBIDDEN** second shifts table · **FORBIDDEN** fold into att_attendance_code / leave / worksite |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01` AC pack (**AC-PLT-ATT-SHIFT-01***) |
| Unlock ba-data? | **HOLD** this seat — EXPAND only if BA proves column gap (e.g. `archived_at` / unique `(company_id, lower(code))` GĐ1.5) |
| Unlock BE deepen? | **HOLD** until BA AC pack CONFIRMED — then narrow: soft-retire vs hard DELETE · list default active · invent KEY assert · optional EFF endpoint |
| Unlock FE? | After BA — ShiftChange (and BA-listed consumers) rebind Nest list/EFF; **FORBIDDEN** invent FE ATT-CODE HOLD as mandatory this wave |
| Reopen ATT-CODE L1 / leave / worksite / EMP / SI / CTR? | **FORBIDDEN** |
| Flip attendance_uat / payroll_e2e / Phase1 / rewrite aggregate? | **FORBIDDEN** |

### 4.2 Peer / adjacent ATT catalogs (cite — do not reopen / fold)

| Catalog / ops | Nest / SoT | This seat |
|---------------|------------|-----------|
| Attendance codes (day-code) | Nest `att_attendance_code` · **ATT-CODE L1 GWC SEAL** | **OUT reopen/fold** — **L-ATT-CODE-08** · **≠** work_shifts |
| Leave types | Nest `att_leave_type` · **ATT-LEAVE GWC SEAL** | **OUT** |
| Work sites | Nest `attendance_work_sites` · **ATT-WS GWC SEAL** | **OUT** |
| **Work shifts** | Nest `work_shifts` · ADR D1 · **F-ATT-CAT-SHIFT-*** deepen | **OWN** AC-PLT-ATT-SHIFT-01 |
| Settings/`shifts` | XBOS → HRM catalog REF | **REF merge-read only** — **not** sole SoT |
| Aggregate / LIST-TOTALS | `att-timesheet-line-aggregate` | **SEALED CODE** — OUT rewrite |
| Shift-change / OT / Ca list | Consumers of Nest shifts | BA enumerate UF/J-* |

---

## 5. Locks (L-ATT-SHIFT-*)

| Lock | Rule |
|------|------|
| **L-ATT-SHIFT-01 Admin ≠ consumer** | **Catalog admin** POST/PATCH F-ATT-CAT-SHIFT-02 = **open N+1** (`code`/name/times/coeff — BR-PLT-05). **Consumers** (shift-change · OT · assignment mutate when BA in-scope) when **active count >0** = **picker/FK only** (BR-PLT-02 · **AC-PLT-ATT-SHIFT-01**). |
| **L-ATT-SHIFT-02 Code SoT** | Authoritative work-shift instance list = Nest `work_shifts` via **F-ATT-CAT-SHIFT-01/02** — **FORBIDDEN** Settings MD/`shifts` alone as ops SoT (ADR D1) · **FORBIDDEN** FE closed hardcode as sole SoT when active>0 |
| **L-ATT-SHIFT-03 Dual SoT REF** | Settings/XBOS `shifts` = **group REF merge-read only** — Nest tenant wins (**BR-PLT-06**) · **FORBIDDEN** dual-write from MD panel |
| **L-ATT-SHIFT-04 Admin open** | CREATE N+1 open `code` slug — **FORBIDDEN** closed enum ceiling (`morning`/`afternoon`/…) as product SoT · **FORBIDDEN** reject N+1 when code unique in scope |
| **L-ATT-SHIFT-05 Consumer invent** | Active count >0 → consumer `shift_id`/`code` must ∈ scoped Nest catalog — invent → **`HRM-ATT-SHIFT-KEY`** (alias `HRM-ATT-SHIFT-UNKNOWN`; get-by-id OOS may retain `HRM-WS-404` — BA stamps) |
| **L-ATT-SHIFT-06 Empty EFF** | Active count **=0** → soft empty + CTA admin CREATE · invent assert **skip** · **no seed** · hardcode five-shift list OK **only** when empty |
| **L-ATT-SHIFT-07 Soft-delete** | Retire prefer **`status='inactive'`** (or `archived_at`) · history refs OK (**BR-PLT-04**) · **FORBIDDEN** hard-delete as sole product retire when refs exist |
| **L-ATT-SHIFT-08 Orthogonal / no fold** | **≠** `att_attendance_code` · **≠** `att_leave_type` · **≠** `attendance_work_sites` · **≠** EMP status — **FORBIDDEN** fold / dual master · **FORBIDDEN** reopen ATT-CODE L1 |
| **L-ATT-SHIFT-09 Seals retain** | **FORBIDDEN** reopen ATT-CODE · leave · worksite · EMP dept/pos/status/custom/token-ext · SI · CTR · aggregate / LIST-TOTALS without warrant |
| **L-ATT-SHIFT-10 Honesty** | **DENIED** `attendance_uat_ready` / `payroll_e2e_ready` / module ATT UAT / Phase1 · **`C-SLICE-≠-MODULE`** · DENY invent FE ATT-CODE HOLD |
| **L-ATT-SHIFT-11 Scope** | list ↔ get-by-id ↔ mutate ↔ consumer assert = `resolveHrmListScope` (**U19**) |
| **L-ATT-SHIFT-12 Display-ready** | List/get expose `code`/`name`/times/coeff (or safe fallback) — FE **cấm** invent label when BE provides |
| **L-ATT-SHIFT-13 Mega-EAV** | **FORBIDDEN** one ATT mega catalog for code+leave+work-sites+shifts (ADR Q-PLT-03) |
| **L-ATT-SHIFT-14 Roster OUT** | One-way REF sync / «Lịch ca» roster grid = **deferred** (ADR D1) — **OUT** invent this seat unless BA splits work_item |

```text
  Settings/XBOS shifts (group REF) ──► merge-read only (ADR D1 · Option A REJECT as sole)
           │
  F-ATT-CAT-SHIFT CRUD ──► public.work_shifts (ops SoT LIVE)
           │
           ▼
  F-ATT-CAT-SHIFT-01 list / optional EFF ──► picker code/name/times
           │
  Consumers (count>0): shift-change · OT · assignment ∈ Nest
           │
  invent shift ──► HRM-ATT-SHIFT-KEY
  empty active ──► skip assert · CTA · no seed · hardcode fallback only
  att_attendance_code / leave / work_sites / EMP / aggregate ──► OUT this seat
```

---

## 6. F.1 capability deepen (cite LIVE paths — ADD locks only)

| Cap | Path / rule | AC |
|-----|-------------|-----|
| List / admin SoT | **F-ATT-CAT-SHIFT-01** `GET /api/hrm/attendance/work-shifts` · get-by-id — **DEEPEN:** default active filter; display-ready; **cấm** ensureDefault on U65 | **AC-PLT-ATT-SHIFT-01** |
| Admin create open | **F-ATT-CAT-SHIFT-02** POST — N+1 `code`/name/times/coeff OK | **AC-PLT-ATT-SHIFT-01d** |
| Admin update / retire | **F-ATT-CAT-SHIFT-02** PATCH `status=inactive` preferred; DELETE hard = residual deepen | BR-PLT-04 |
| Consumer invent | BA-listed surfaces bind Nest id/code when active>0 → **`HRM-ATT-SHIFT-KEY`** | **AC-PLT-ATT-SHIFT-01b** |
| Empty CTA | Active=0 → CTA + skip invent · no seed | **AC-PLT-ATT-SHIFT-01c** |
| Settings REF | `shifts` MD / XBOS — read only | L-ATT-SHIFT-03 |
| ATT-CODE / leave / WS / EMP / SI / CTR / agg | **must_keep** — **OUT** | DENY reopen |

**Error (consumer invent):**

| Condition | Code |
|-----------|------|
| active shifts >0 ∧ body `shift_id`/`code` ∉ scoped Nest catalog | **`HRM-ATT-SHIFT-KEY`** (400) — alias `HRM-ATT-SHIFT-UNKNOWN` OK if BA stamps |
| OOS get/mutate | **`HRM-WS-404`** / scope **`HRM-WS-409`** (retain · U19) |
| Admin validation (empty code/name, bad times) | **`HRM-WS-VAL`** (BA may stamp) |

---

## 7. AC / validation matrix (for ba-process deepen)

| ID | Condition | Expected PASS | FAIL |
|----|-----------|---------------|------|
| **AC-PLT-ATT-SHIFT-01** | Nest active ≥1 · consumer shift-change / BA surface picks Nest shift | 2xx · FE after 2xx · F5 Nest still SoT | Settings/`shifts` sole SoT · free invent hardcode id succeed |
| **AC-PLT-ATT-SHIFT-01b** | Invent `shift_id`/`code` ∉ catalog when active>0 | 4xx **`HRM-ATT-SHIFT-KEY`** · no persist | 2xx invent · wrong KEY taxonomy (leave/code/EMP) |
| **AC-PLT-ATT-SHIFT-01c** | GET list/EFF 200 · empty [] OK · CTA · no seed | empty honesty · U65 | seed default shifts · silent invent |
| **AC-PLT-ATT-SHIFT-01d** | Admin CREATE Nest N+1 open `code` | 2xx · F5 list has row | closed morning/afternoon ceiling · Settings dual-write |
| **AC-PLT-ATT-SHIFT-01e** | Soft-retire → hide default list/picker · history OK | inactive hidden · refs OK | hard-delete only product retire with refs |
| **AC-PLT-ATT-SHIFT-01H** | Honesty / seals | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT-CODE/`ATTCODEQA-MSK4T1A5` · leave/WS/EMP/SI/CTR/agg **SEAL RETAIN** · **no invent FE ATT-CODE HOLD** · **`C-SLICE-≠-MODULE`** · U65 | Flip ready · reopen seals · fold · invent FE HOLD · Phase1 · module ATT UAT |

**Consumer surface inventory (ba-process must enumerate exact UF/J-*):** Attendance → tab Ca (CRUD admin) · ShiftChangeRequestTab (consumer) · OT surfaces if bind shift · payroll coeff **cite only** (no formula invent) · **not** attendance-code · **not** leave-type · **not** work-sites · **not** sheet close/sign · **not** aggregate rewrite.

---

## 8. Explicit OUT (this seat)

| OUT | Reason |
|-----|--------|
| Flip `attendance_uat_ready` / `payroll_e2e_ready` | Honesty · C-SLICE |
| Seed / `ensureDefaultWorkShift` for UF density | U65 · L-ATT-SHIFT-06 |
| Phase1 DONE / module ATT UAT | Slice ≠ module |
| Rewrite `att-timesheet-line-aggregate` / LIST-TOTALS | L-ATT-CODE-07 peer seal |
| Fold into attendance-code / leave / worksite | L-ATT-SHIFT-08 · L-ATT-CODE-08 |
| Reopen ATT-CODE L1 · invent FE ATT-CODE HOLD | QC CONDITION HOLD · must_keep |
| Settings/`shifts` sole SoT / dual-write | ADR D1 · Option A REJECT |
| Mega-EAV / second Nest shifts table | Q-PLT-03 · ba-data HOLD |
| Roster «Lịch ca» / one-way REF sync | ADR D1 deferred · L-ATT-SHIFT-14 |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **CONFIRMED Option** | **B** — Nest `work_shifts` deepen (Settings `shifts` REF only) |
| **next_owner** | **ba-process** (+ **ba-data** only if BA proves EXPAND column gap; default **HOLD**) |
| **next_dispatch_prompt** | See evidence `po-hrm-dynamic-config-platform-att-shift-catalog-sa-01.md` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-sa-01.md` |
| **BE unlock** | **HOLD** until BA (± DATA if EXPAND) CONFIRMED |

---

## 10. completion_report

**Closed:** Architecture Option **B LOCKED** for AC-PLT-ATT-SHIFT-01 — Nest `public.work_shifts` LIVE deepen (peer ATT-WORKSITE); invent KEY **`HRM-ATT-SHIFT-KEY`**; empty CTA no seed; admin open N+1; Settings/`shifts` REF only (ADR D1); REJECT Option A Settings sole · Option C mega-EAV/fold/reopen ATT-CODE/invent FE HOLD/UAT flip/aggregate rewrite; ba-process **UNLOCK**; ba-data **HOLD**; BE **HOLD**; honesty false · C-SLICE · seals RETAIN; docs-only no `apps/**`.

**Residual:** BA AC pack surface matrix + invent KEY stamp; optional DATA EXPAND if soft-retire column gap; FE ShiftChange rebind after BA; R-PLT-ATT-CODE-FE-01 remains HOLD (do not invent).
