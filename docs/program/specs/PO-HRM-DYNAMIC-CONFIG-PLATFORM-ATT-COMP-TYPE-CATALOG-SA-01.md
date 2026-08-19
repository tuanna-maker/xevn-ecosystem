# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01 — Option/F.1 · OT compensation_type open catalog (salary|compensatory_leave… ≠ hardcode)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QC-01` **GWC** · invent KEY Network **LIVE SEALED** · DOCS ACCEPT · U88 continuous next vertical |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-ATT-COMP-01*** · **DEFINE** Nest OT compensation-type open catalog (**Nest ABSENT** AS-IS) · **NO CODE** `apps/**` · **no seed** · **no wipe** OT-TYPE KEY · CTR · ATT L1 seals |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **UNLOCK** · ba-process **UNLOCK** · BE **HOLD** until BA (+ DATA) |
| **prior_qc** | OT-TYPE QC GWC invent **`HRM-ATT-OT-TYPE-KEY`** Network **LIVE** · honesty `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · FE Condition residual · **SEAL RETAIN** |
| **prior_seals** | OT-TYPE L1 KEY · CTR template KEY · CTR-CLAUSE `body_vi` · ATT leave-balance / LVRULE 01g **HOLD** · ATT-CODE / WS / SHIFT / leave L1 · EMP / SI / PAY / DEC / MergeToken — **SEAL RETAIN** · **cấm reopen** |
| **ref_peer_ot_type** | [`OT-TYPE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md) — Nest `att_ot_type` DEFINE→LIVE · invent **`HRM-ATT-OT-TYPE-KEY`** · **orthogonal OWN** this seat · **cite ≠ copy** · **FORBIDDEN** fold compensation into `att_ot_type` · **FORBIDDEN** reopen OT-TYPE L1 |
| **ref_peer_leave_balance** | [`ATT-LEAVE-BALANCE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) — Nest-ABSENT DEFINE Option B · ba-data UNLOCK · engine HOLD **cite** |
| **ref_peer_att_code** | Nest day-code Option B L1 **SEAL RETAIN** — **≠** compensation type · **FORBIDDEN** fold |
| **ref_peer_ctr_retain** | [`CTR-TEMPLATE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md) — Nest LIVE **RETAIN** class · **alternate:** if Nest `att_ot_comp_type` later found LIVE → RETAIN+clarify (this seat = DEFINE because ABSENT) |
| **ref_peer_engine_hold** | PAY-CATALOG Option B — catalog SoT **≠** formula LIVE · **cite** · **FORBIDDEN** claim compensation catalog = payroll formula LIVE |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog open · Q-PLT-03 mega-EAV DENY · [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D4** OT sidebar stub · Settings REF |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.3 ATT GĐ1 deepen · BR-PLT-02/04/05/06 · Face/device **OUT** · residual compensation_type not named AC yet → this seat opens **AC-PLT-ATT-COMP-01*** |
| **ref_srs** | FR-UC-BP-ATT / UC-HRM-ATT-OT · Đơn từ→Tăng ca LIVE TXN · compensation picker source SPEC_GAP (closed FE hardcode) |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · **DENIED** invent module ATT/PAY UAT · **DENIED** flip formula LIVE · **DENIED** reopen OT-TYPE/CTR/ATT L1 · **DENIED** invent FE HOLDs · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | `overtime_requests` TXN LIVE (create/approve/delete) · `compensation_type` TEXT column (retain column · catalog membership assert ADD later) · `overtime_type` + `att_ot_type` KEY LIVE · CTR KEY seals · ATT L1 · FE LVRULE 01g HOLD · work_shifts ADR D1 · payroll LIST-TOTALS / aggregate GĐ1 · soft-delete class · scope_parity U19 |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-ATT-COMP-01 — Nest OT **compensation_type** open catalog SoT · admin CREATE N+1 · consumer invent KEY when EFF>0 · Settings sole REJECT · free-TEXT RETAIN REJECT as product SoT |
| **Requestor** | pm · U88 after OT-TYPE-CATALOG-QC-01 GWC KEY LIVE + DOCS ACCEPT · continuous ATT residual |
| **Decision owner** | sa |
| **Related** | BR-PLT-02/04/05/06 · peer OT-TYPE orthogonal · UC-HRM-ATT-OT · createOvertimeRequest |

### 1.1 Problem — AS-IS vs target

| Current state (AS-IS grep evidence 2026-08-08) | Gap / target |
|-----------------------------------------------|--------------|
| FE **`OvertimeRequestTab`** hardcodes closed **2** compensation SelectItems: `salary` \| `compensatory_leave` (i18n `overtime.compensationTimeOff` — **not** slug `time_off` / `time-off`) | Open catalog N+1 — starter two = **bootstrap ≠ ceiling** (**BR-PLT-05**) |
| FE detail badge: `compensation_type === 'salary' ? Salary : TimeOff` — binary label invent for any non-salary string | Display-ready Nest `name_vi` when EFF>0 · **cấm** FE invent labels when BE provides |
| Nest **`overtime_requests.compensation_type`** TEXT DEFAULT `'salary'` · DTO `@IsOptional() @IsString()` · INSERT `body.compensation_type?.trim() ?? 'salary'` · **no** catalog assert · **no** invent KEY | When EFF/active count >0 → assert ∈ Nest catalog → **`HRM-ATT-OT-COMP-KEY`** |
| Nest **`att_ot_comp_type` / compensation-type catalog table** — **ABSENT** (grep zero CREATE / service) | **DEFINE** Nest open catalog (peer OT-TYPE Nest-ABSENT DEFINE class **before** OT-TYPE LIVE) |
| Nest **`att_ot_type`** — **LIVE** (KEY LIVE GWC) — asserts `overtime_type` only | **Orthogonal OWN** · compensation ≠ OT type · **FORBIDDEN** fold into `att_ot_type` columns / reopen OT-TYPE L1 |
| Settings / XBOS compensation codes — **no** LIVE ops producer for OT compensation | Settings = **REF merge-read only** if present later — **FORBIDDEN** sole SoT |
| Payroll formula / OT amount engine | Catalog may carry optional display flags later · **≠** formula LIVE · **HOLD** |

**Failure if unresolved:** FE closed-2 treated as product ceiling while BE accepts invent free-text; admin cannot CREATE 3rd form (e.g. mixed pay+leave / banked hours); someone folds compensation into `att_ot_type` or reopens OT-TYPE KEY seal; PM flips `payroll_e2e_ready` / claims formula LIVE; ba-data skips physicalize while BE hardcodes two enums forever.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `attendance_uat_ready=true` · `payroll_e2e_ready=true` · `contracts_printable_ready=true` · module ATT/PAY UAT · Phase1
- **SEAL RETAIN:** OT-TYPE KEY LIVE · CTR-TEMPLATE KEY · CTR-CLAUSE `body_vi` · ATT leave-balance / LVRULE 01g **HOLD** (**DENY invent FE**) · ATT-CODE / WS / SHIFT / leave L1 · EMP / SI / PAY / DEC / MergeToken
- Cite `/api/hrm/attendance/*` — **cấm** invent `/api/hrm/platform/att/*` mega catalog / mega-EAV
- **FORBIDDEN** fold into `att_ot_type` · reopen OT-TYPE/CTR/ATT L1 · rewrite aggregate · Face/device LIVE · seed bootstrap for UF density · formula LIVE

### 1.3 Decision heuristic (program rule — applied)

| Rule | Application this seat |
|------|------------------------|
| Prefer **B Nest** if producer absent / hardcode residual | Comp-type catalog table **ABSENT** + FE closed-2 hardcode + TXN free string → **B DEFINE** |
| Prefer **A Settings** if producer LIVE | No LIVE Settings compensation producer for OT → **A REJECT** as sole SoT |
| Prefer **RETAIN free TEXT** only if sponsor locks closed legal enum forever | Continuous wave asks **open catalog** · BR-PLT-05 starter≠ceiling → **RETAIN free TEXT REJECT** as product SoT (column TEXT **retained** as storage; membership SoT = Nest) |
| Prefer **B RETAIN** if Nest LIVE open catalog | **Alternate:** Nest comp catalog **not** LIVE → **not** CTR RETAIN class; if later LIVE → RETAIN+clarify |
| REJECT hybrid dual writers / mega-EAV / fold into ot_type·code·leave / reopen OT-TYPE·CTR·ATT L1 / invent FE HOLD / flip ready / formula LIVE / seed | Explicit **Option C** reject |

---

## 2. Options

### Option A — Settings Master Data / XBOS = sole SoT for compensation_type

| | |
|--|--|
| **Description** | Authoritative compensation list only in Settings Master Data / XBOS catalog; Nest has no `att_ot_comp_type`; `OvertimeRequestTab` reads Settings density (or keeps hardcode as «settings mirror»). |
| **Benefits** | Zero Nest physicalize; nominal match to older «danh mục» wording. |
| **Costs** | No LIVE Settings producer found for OT compensation; peer ATT OT-type/leave/code/worksite/shift chose Nest domain SoT for TXN REF; free-text TXN continues while MD may lag; dual orphan vs Nest `overtime_requests`. |
| **Risks** | AC green on Settings while create OT still hardcodes two / accepts invent string — **REJECT** as primary SoT. Settings may remain **REF** for group labels — **≠** sole SoT. |

### Option B — Nest `att_ot_comp_type` (F-ATT-CAT-OTC-*) = authoritative open compensation-type catalog · Settings REF only · formula HOLD — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **OT-TYPE / EMP-STATUS / SI-INS / leave-balance Nest-ABSENT DEFINE** class: single open **OT compensation type** catalog = Nest **`public.att_ot_comp_type`** (ba-data may stamp synonym `att_overtime_comp_type` — **one** table) via caps **F-ATT-CAT-OTC-01** list/effective · **F-ATT-CAT-OTC-02** mutate. Columns (minimum intent): `company_id`, `code` (slug), `name_vi`, optional `name_en`, optional `sort_order`, `status` active\|inactive, soft-retire (`archived_at` / inactive), scope U19. **No** payroll formula / amount engine columns required GĐ1. **Admin** CREATE **N+1** open (`code` + label — **BR-PLT-05** · starter `salary` / `compensatory_leave` = bootstrap examples **≠ ceiling**). When **active/EFF count > 0**, **`createOvertimeRequest`** (and `OvertimeRequestTab` create/mutate consumers BA-listed) **must** pick ∈ Nest catalog (**BR-PLT-02** · **AC-PLT-ATT-COMP-01**). Invent unknown `compensation_type` → **`HRM-ATT-OT-COMP-KEY`** (400). Empty active catalog → soft skip invent + CTA admin CREATE · **no seed** · FE hardcoded two OK **only** as bootstrap fallback when EFF=0. Settings/XBOS = **REF merge-read only** (**BR-PLT-06**) — **FORBIDDEN** dual-write / sole SoT. **Payroll formula LIVE HOLD**. **Orthogonal** to **`att_ot_type`** (OT type = when/how OT classifies day; compensation = how OT is paid/banked — **≠**). TXN column remains TEXT storing Nest `code` (soft FK pattern — peer OT type). |
| **Benefits** | Closes hardcode ceiling · admin≠consumer · aligns peer Nest catalog · no reopen OT-TYPE · no formula invent · no fold. |
| **Costs** | ba-data physicalize + ba-process AC pack + later BE CRUD/EFF/KEY assert on createOvertimeRequest + FE rebind Select when EFF>0. |
| **Risks** | Misread as reopen `att_ot_type` / claim payroll formula LIVE / fold into day-code → **L-ATT-OTC-*** mitigations. |

### Option C — RETAIN free TEXT + closed FE hardcode forever / hybrid dual writers / mega-EAV / fold into `att_ot_type` / reopen OT-TYPE·CTR·ATT L1 / invent FE HOLDs / flip ready / formula LIVE / seed

| | |
|--|--|
| **Description** | (C1) Keep `compensation_type` free TEXT forever + FE closed-2 as product SoT (no Nest catalog). (C2) Settings **and** Nest both write. (C3) Store compensation as fake columns/rows on `att_ot_type`. (C4) Reopen OT-TYPE KEY / CTR / ATT L1 / invent FE LVRULE; flip attendance/payroll ready; seed two types to pass QA. |
| **Benefits** | C1 = shortest path; others none for GĐ1 honesty. |
| **Costs** | C1 blocks BR-PLT-05 open catalog + admin N+1; invent free-text persists; C2–C4 dual SoT · seal churn · OT-TYPE collision · payroll regression · U65 breach. |
| **Risks** | **REJECT** — DENY RETAIN free-TEXT as product SoT for this open-catalog seat · DENY mega-EAV (Q-PLT-03) · DENY dual writers · DENY fold into ot_type · DENY reopen · DENY invent FE HOLD · DENY UAT/formula flip · DENY seed. |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings sole | **B Nest att_ot_comp_type DEFINE** | C RETAIN TEXT / fold / reopen / formula |
|----------|-------:|----------------:|-----------------------------------:|---------------------------------------:|
| Business value (open forms · BR-PLT-02/05 · OT TXN) | 5 | 1 | **5** | 1 |
| Honesty / seal safety (OT-TYPE·CTR·ATT·FE HOLD·payroll) | 5 | 3 | **5** | 0 |
| Single ops SoT vs free-TEXT invent | 5 | 1 | **5** | 1 |
| Time to deliver | 4 | 4 | **2** | 5 |
| Complexity / maintainability (admin≠consumer · peer) | 4 | 1 | **5** | 0 |
| Orthogonal to `att_ot_type` (DENY fold) | 5 | 2 | **5** | 0 |
| **Weighted** | | 54 | **132** | 28 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Nest compensation-type catalog **ABSENT** + FE closed-2 hardcode + free-string TXN = DEFINE Nest open catalog (peer OT-TYPE DEFINE class). Settings not LIVE ops producer → Option A REJECT sole. Free-TEXT RETAIN rejects open-catalog / BR-PLT-05 intent. Catalog ≠ payroll formula LIVE. Orthogonal OWN from sealed `att_ot_type`. |
| **Rejected** | **A** Settings sole · **C** RETAIN free-TEXT-as-SoT / hybrid / mega-EAV / fold into ot_type / reopen OT-TYPE·CTR·ATT / invent FE HOLD / flip ready / formula LIVE / seed |
| **Assumptions** | OT-TYPE KEY · CTR · ATT L1 · FE LVRULE HOLD remain sealed; `overtime_requests` TXN path RETAIN; starter codes `salary` / `compensatory_leave` remain valid historical TXN values; ba-data stamps exact DDL name once. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **UNLOCK** — Nest `att_ot_comp_type` (or stamped synonym) **ABSENT** · **FORBIDDEN** second mega-EAV · **FORBIDDEN** fold into `att_ot_type` / day-code / leave / worksite / shifts |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01` AC pack (**AC-PLT-ATT-COMP-01***) |
| Unlock ba-data? | **YES** — physical DDL + indexes + soft-delete + scope columns |
| Unlock BE? | **HOLD** until BA (+ DATA) CONFIRMED — then CRUD/EFF + invent KEY on **createOvertimeRequest** when EFF>0 |
| Unlock FE? | After BA — `OvertimeRequestTab` rebind Nest list/EFF when count>0; **FORBIDDEN** invent FE LVRULE 01g / ATT-CODE FE HOLD / reopen OT-TYPE FE Condition as mandatory wipe |
| Reopen OT-TYPE / CTR / ATT L1 / work_shifts? | **FORBIDDEN** |
| Flip attendance_uat / payroll_e2e / printable / formula LIVE / Phase1? | **FORBIDDEN** |

### 4.2 Peer / adjacent catalogs (cite — do not reopen / fold)

| Catalog / ops | Nest / SoT | This seat |
|---------------|------------|-----------|
| **OT types** | Nest `att_ot_type` LIVE · KEY **`HRM-ATT-OT-TYPE-KEY`** | **OUT reopen** · compensation **orthogonal** · **FORBIDDEN** fold |
| Work shifts | Nest `work_shifts` LIVE · ADR D1 | **OUT** |
| Attendance codes | Nest `att_attendance_code` | **OUT** |
| Leave types / accrual | Nest leave + leave-balance | **OUT** (compensatory_leave **code** ≠ leave-type catalog fold) |
| Work sites | Nest `attendance_work_sites` | **OUT** |
| **OT compensation types** | Nest **`att_ot_comp_type` DEFINE** · F-ATT-CAT-OTC-* | **OWN** AC-PLT-ATT-COMP-01 |
| Settings compensation MD | REF merge-read (if any) | **REF only** — not sole SoT |
| Payroll formula / LIST-TOTALS / aggregate | PAY catalog ≠ engine · ATT aggregate GĐ1 | **OUT** formula LIVE · **OUT** rewrite aggregate |
| CTR template / clause | KEY LIVE · body_vi | **SEAL RETAIN** |
| FE LVRULE 01g | HOLD | **HOLD RETAIN** — **DENY invent FE** |

### 4.3 Alternate note — if Nest comp catalog already LIVE (RETAIN+clarify)

| Probe | Result this seat (2026-08-08) |
|-------|-------------------------------|
| Nest `CREATE TABLE` / service for `att_ot_comp_type` / OT compensation catalog | **ABSENT** |
| Admin CRUD API for compensation types | **ABSENT** (only TXN `overtime-requests`) |
| FE admin panel bound to Nest compensation types | **ABSENT** (hardcode Select only) |
| Consumer invent KEY on compensation_type | **ABSENT** (free string + default `'salary'`) |

**Conclusion:** **Not** CTR-TEMPLATE / OT-TYPE RETAIN class. If a future audit finds Nest comp catalog LIVE (CRUD + open N+1 + invent path), SA must **RETAIN+clarify** Option B (ba-data **HOLD**, deepen AC only) — **do not** invent second table. This seat documents DEFINE because ABSENT is proven.

### 4.4 Orthogonality note — OT type ≠ compensation

```text
  overtime_type     ──► att_ot_type        (when/class of OT day — weekday/weekend/holiday/…)
  compensation_type ──► att_ot_comp_type   (how OT is settled — salary / compensatory_leave / …)

  FORBIDDEN: add compensation_code column as mandatory child of att_ot_type that replaces catalog
  FORBIDDEN: encode compensation as overtime_type slug
  FORBIDDEN: reopen OT-TYPE L1 to «fix» compensation hardcode
```

Compensatory leave **may later cite** leave-type for accrual funnel — **OUT** this seat (no leave-type reopen; no auto-funnel LIVE claim).

---

## 5. Locks (L-ATT-OTC-*)

| Lock | Rule |
|------|------|
| **L-ATT-OTC-01 Admin ≠ consumer** | Catalog admin POST/PATCH F-ATT-CAT-OTC-02 = **open N+1**. Consumers (`createOvertimeRequest` / `OvertimeRequestTab`) when **EFF/active >0** = **picker/FK only** (BR-PLT-02 · **AC-PLT-ATT-COMP-01**). |
| **L-ATT-OTC-02 Code SoT** | Authoritative compensation list = Nest `att_ot_comp_type` via F-ATT-CAT-OTC-01/02 — **FORBIDDEN** Settings alone as SoT · **FORBIDDEN** FE closed-2 as sole SoT when EFF>0 · **FORBIDDEN** free-TEXT invent as SoT |
| **L-ATT-OTC-03 Dual SoT REF** | Settings/XBOS = **REF merge-read only** — Nest tenant wins (**BR-PLT-06**) · **FORBIDDEN** dual-write |
| **L-ATT-OTC-04 Admin open** | CREATE N+1 open `code` slug — **FORBIDDEN** closed salary\|compensatory_leave ceiling as product SoT · starter two = bootstrap (**BR-PLT-05**) |
| **L-ATT-OTC-05 Consumer invent** | EFF>0 → `compensation_type` must ∈ scoped Nest catalog — invent → **`HRM-ATT-OT-COMP-KEY`** (400) |
| **L-ATT-OTC-06 Empty EFF** | EFF=0 → soft empty + CTA admin CREATE · invent assert **skip** · **no seed** · hardcode two OK **only** when empty |
| **L-ATT-OTC-07 Soft-delete** | Retire prefer `status='inactive'` / `archived_at` · history TXN refs OK (**BR-PLT-04**) |
| **L-ATT-OTC-08 Orthogonal / no fold** | **≠** `att_ot_type` · **≠** `work_shifts` · **≠** `att_attendance_code` · **≠** `att_leave_type` · **≠** worksite · **FORBIDDEN** fold · **FORBIDDEN** reopen OT-TYPE/SHIFT/CODE/leave/WS L1 |
| **L-ATT-OTC-09 Seals retain** | **FORBIDDEN** reopen OT-TYPE KEY · CTR KEY/clause · ATT leave-balance · FE LVRULE 01g invent · ATT L1 · EMP/SI/PAY/DEC without warrant |
| **L-ATT-OTC-10 Honesty / formula HOLD** | **DENIED** `attendance_uat_ready` / `payroll_e2e_ready` / `contracts_printable_ready` / module ATT·PAY UAT / Phase1 · **DENIED** claim compensation catalog = payroll formula LIVE · **`C-SLICE-≠-MODULE`** |
| **L-ATT-OTC-11 Scope** | list ↔ get-by-id ↔ mutate ↔ consumer assert = `resolveHrmListScope` (**U19**) |
| **L-ATT-OTC-12 Display-ready** | List/EFF expose `code`/`name_vi` — FE **cấm** invent labels when BE provides; detail must not binary-map non-salary → TimeOff when Nest label exists |
| **L-ATT-OTC-13 Mega-EAV** | **FORBIDDEN** one ATT mega catalog for code+leave+sites+shifts+OT-type+comp (Q-PLT-03) |
| **L-ATT-OTC-14 Face / device OUT** | Face/device rules — BA-01 **OUT** · **FORBIDDEN** invent LIVE this seat |
| **L-ATT-OTC-15 Seed DENY** | **FORBIDDEN** `pnpm seed:*` / ensureDefault compensation types for UF density (U65) |
| **L-ATT-OTC-16 Invent KEY stamp** | Consumer invent class = **`HRM-ATT-OT-COMP-KEY`** — **≠** `HRM-ATT-OT-TYPE-KEY` · **≠** SHIFT/LEAVE/CTR KEY taxonomy |

```text
  Settings/XBOS compensation MD (if any) ──► REF merge-read only (Option A REJECT as sole)
           │
  F-ATT-CAT-OTC CRUD ──► public.att_ot_comp_type (DEFINE SoT)
           │
           ▼
  F-ATT-CAT-OTC-01 list / EFF ──► picker code / name_vi
           │
  Consumers (EFF>0): createOvertimeRequest · OvertimeRequestTab create
           │
  invent compensation_type ──► HRM-ATT-OT-COMP-KEY
  empty EFF ──► skip assert · CTA · no seed · hardcode fallback only
  att_ot_type / day-code / leave / worksite / shifts / CTR / FE LVRULE / payroll formula ──► OUT
```

---

## 6. F.1 capability define (ADD — no apps this seat)

| Cap | Path / rule (intent) | AC |
|-----|----------------------|-----|
| List / EFF admin SoT | **F-ATT-CAT-OTC-01** `GET /api/hrm/attendance/ot-comp-types` (+ optional `/effective`) — display-ready · default active filter · **cấm** ensureDefault on U65 | **AC-PLT-ATT-COMP-01** |
| Admin create open | **F-ATT-CAT-OTC-02** POST — N+1 `code`/name OK | **AC-PLT-ATT-COMP-01d** |
| Admin update / retire | **F-ATT-CAT-OTC-02** PATCH inactive / soft archive | BR-PLT-04 |
| Consumer invent | **createOvertimeRequest** when EFF>0 → **`HRM-ATT-OT-COMP-KEY`** | **AC-PLT-ATT-COMP-01b** |
| Empty CTA | EFF=0 → CTA + skip invent · no seed | **AC-PLT-ATT-COMP-01c** |
| Settings REF | MD compensation — read only | L-ATT-OTC-03 |
| OT-TYPE / CTR / ATT L1 / formula / Face | **must_keep** — **OUT** | DENY reopen / flip / fold |

**Error (consumer invent):**

| Condition | Code |
|-----------|------|
| EFF>0 ∧ `compensation_type` ∉ scoped Nest catalog | **`HRM-ATT-OT-COMP-KEY`** (400) |
| OOS get/mutate catalog | **`HRM-ATT-OTC-404`** / scope **`HRM-ATT-OTC-409`** (BA may stamp) |
| Admin validation (empty code/name) | **`HRM-ATT-OTC-VAL`** (BA may stamp) |
| Taxonomy ≠ KEY | 404 / CODE-INVALID / VAL / **`HRM-ATT-OT-TYPE-KEY`** **≠** invent **COMP** KEY |

---

## 7. AC / validation stubs (for ba-process — draft)

| ID | Condition | Expected PASS | FAIL |
|----|-----------|---------------|------|
| **AC-PLT-ATT-COMP-01** | Nest EFF ≥1 · OvertimeRequestTab picks Nest compensation | 2xx · FE after 2xx · F5 Nest still SoT | Settings sole · free invent hardcode succeed when EFF>0 |
| **AC-PLT-ATT-COMP-01b** | Invent `compensation_type` ∉ catalog when EFF>0 on createOvertimeRequest | 4xx **`HRM-ATT-OT-COMP-KEY`** · no persist | 2xx invent · wrong KEY (OT-TYPE/SHIFT/LEAVE/CTR) |
| **AC-PLT-ATT-COMP-01c** | GET list/EFF 200 · empty [] OK · CTA · no seed | empty honesty · U65 | seed default · silent invent |
| **AC-PLT-ATT-COMP-01d** | Admin CREATE Nest N+1 open `code` (e.g. `banked_hours`) | 2xx · F5 list has row · consumer picker includes | closed salary\|compensatory_leave ceiling · Settings dual-write |
| **AC-PLT-ATT-COMP-01e** | Soft-retire → hide default picker · historical TXN OK | inactive hidden · refs OK | hard-delete only with refs |
| **AC-PLT-ATT-COMP-01f** | Detail/list display Nest `name_vi` when EFF>0 | display-ready · no binary invent | non-salary → TimeOff invent when Nest label exists |
| **AC-PLT-ATT-COMP-01H** | Honesty / seals | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · OT-TYPE KEY / CTR / ATT L1 / FE LVRULE HOLD **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · Face OUT · formula HOLD | Flip ready · reopen seals · fold into ot_type · Phase1 · module ATT/PAY UAT |

**Consumer surface inventory (ba-process must enumerate exact UF/J-*):** Attendance → Đơn từ→Tăng ca (`OvertimeRequestTab`) create + detail · BE `createOvertimeRequest` · optional mobile OT create if in-scope · **not** OT-type admin reopen · **not** ShiftChange · **not** payroll calculate · **not** Face/device · **not** CTR print · **not** leave-type L1.

---

## 8. Explicit OUT (this seat)

| OUT | Reason |
|-----|--------|
| Reopen **`att_ot_type`** / OT-TYPE L1 invent KEY seats | OT-TYPE SEAL · L-ATT-OTC-08/09 · orthogonality |
| Fold compensation into `att_ot_type` columns / rows | L-ATT-OTC-08 · Q-PLT-03 |
| Payroll **formula LIVE** / flip `payroll_e2e_ready` | Peer PAY engine HOLD · L-ATT-OTC-10 |
| Flip `attendance_uat_ready` / `contracts_printable_ready` | Honesty · C-SLICE |
| Face / device rules LIVE | BA-01 OUT · L-ATT-OTC-14 |
| Mega-EAV / fold into shifts·code·leave·worksite | Q-PLT-03 · L-ATT-OTC-08/13 |
| Seed / ensureDefault compensation types for UF | U65 · L-ATT-OTC-15 |
| Reopen CTR template/clause KEY · ATT leave-balance · invent FE LVRULE 01g | Parent seals · DENY invent FE |
| Module ATT/PAY UAT · Phase1 DONE | Slice ≠ module |
| Rewrite `att-timesheet-line-aggregate` / LIST-TOTALS | Aggregate seal |
| Auto leave-funnel LIVE from compensatory_leave | OUT — may cite later; no leave L1 reopen |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **CONFIRMED Option** | **B** — Nest `att_ot_comp_type` DEFINE (Settings REF only · free-TEXT RETAIN REJECT as SoT) |
| **next_owner** | **ba-process** + **ba-data** (**UNLOCK**) |
| **next_dispatch_prompt** | See evidence `po-hrm-dynamic-config-platform-att-comp-type-catalog-sa-01.md` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-sa-01.md` |
| **BE unlock** | **HOLD** until BA + DATA CONFIRMED |

---

## 10. completion_report

**Closed:** Docs-only Option **B LOCKED** for OT **compensation_type** open catalog — Nest ABSENT → **DEFINE** `att_ot_comp_type` + invent stamp **`HRM-ATT-OT-COMP-KEY`** + admin CREATE N+1 ≠ consumer invent; bind `createOvertimeRequest` / `OvertimeRequestTab` when EFF>0; Settings REF only; free-TEXT RETAIN REJECT as product SoT; formula/Face/OT-TYPE fold/reopen/seed/mega-EAV **OUT**; OT-TYPE KEY + CTR + ATT L1 + FE LVRULE HOLD **RETAIN**; honesty flags false · **C-SLICE**; ba-data **UNLOCK** · ba-process **UNLOCK** · BE HOLD. Alternate RETAIN path documented if Nest later found LIVE. **No** `apps/**`.

**Residual:** BA AC pack + ba-data DDL · later BE/FE · formula LIVE never this vertical alone · leave-funnel OUT.
