# PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01 — Option/F.1 · OT type open catalog (weekday/weekend/holiday… ≠ hardcode)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QC-01` **GWC** · KEY LIVE **SEALED** · U88 continuous next vertical |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 narrow **AC-PLT-ATT-OT-01*** · **DEFINE** Nest OT-type open catalog (**Nest ABSENT** AS-IS) · **NO CODE** `apps/**` · **no seed** · **no wipe** CTR KEY · ATT L1 · FE LVRULE 01g HOLD |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · ba-data **UNLOCK** · ba-process **UNLOCK** · BE **HOLD** until BA (+ DATA) |
| **prior_qc** | CTR-TEMPLATE QC GWC invent KEY Network **LIVE** · honesty `contracts_printable_ready=false` · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · FE HOLD · **SEAL RETAIN** |
| **prior_seals** | CTR template KEY · CTR-CLAUSE `body_vi` · ATT leave-balance CNS / LVRULE 01g **HOLD** · ATT-CODE / WS / SHIFT / leave L1 · EMP / SI / PAY / DEC / MergeToken — **SEAL RETAIN** · **cấm reopen** |
| **ref_peer_att_shift** | [`ATT-SHIFT-CATALOG-SA/BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md) — **S-ATT-SHIFT-CITE-01** OT type weekday/weekend/holiday **CITE OUT** of work_shifts pack · **orthogonal OWN** this seat · **cite ≠ copy** · **FORBIDDEN** reopen SHIFT L1 |
| **ref_peer_leave_balance** | [`ATT-LEAVE-BALANCE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) — Nest-ABSENT DEFINE Option B · ba-data UNLOCK · engine HOLD pattern **cite** |
| **ref_peer_att_code** | Nest day-code Option B L1 **SEAL RETAIN** — **≠** OT type · **FORBIDDEN** fold |
| **ref_peer_ctr_retain** | [`CTR-TEMPLATE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md) — Nest LIVE **RETAIN** class · **alternate note:** OT catalog **not** LIVE → **DEFINE** (this seat) ≠ RETAIN |
| **ref_peer_engine_hold** | PAY-CATALOG Option B — catalog SoT **≠** formula LIVE · **cite** · **FORBIDDEN** claim OT coeff = payroll formula LIVE |
| **ref_adr** | [`ADR-HRM-DYNAMIC-CONFIG-PLATFORM`](../../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) Option B · L1 Catalog open · Q-PLT-03 mega-EAV DENY · [`ADR-HRM-ATTENDANCE-CFG-PERSIST`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) **D4** OT type sidebar = stub GĐ1 · Settings REF + OT TXN |
| **ref_ba_platform** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) §2.3 ATT GĐ1 deepen · BR-PLT-02/04/05/06 · Face/device **OUT** · residual OT type not named AC yet → this seat opens **AC-PLT-ATT-OT-01*** |
| **ref_data_class** | [`HRM-ATTENDANCE_DATA_CLASS_MATRIX.md`](../../qa/professional/menu-fidelity/HRM-ATTENDANCE_DATA_CLASS_MATRIX.md) §2.5 OT type catalog **REF** · SPEC_GAP · MISSING_CFG_UI sidebar stub |
| **ref_srs** | FR-UC-BP-ATT / UC-HRM-ATT-OT · Đơn từ→Tăng ca LIVE TXN · OT type picker source SPEC_GAP |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · **DENIED** invent module ATT/PAY UAT · **DENIED** flip formula LIVE · **DENIED** reopen CTR/ATT L1 · **DENIED** invent FE HOLDs · **`C-SLICE-≠-MODULE`** · U65 |
| **must_keep** | `overtime_requests` TXN LIVE (create/approve/delete) · overtime_type TEXT column · CTR KEY seals · ATT L1 · FE LVRULE 01g HOLD · work_shifts ADR D1 · payroll LIST-TOTALS / aggregate GĐ1 · soft-delete class · scope_parity U19 |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | AC-PLT-ATT-OT-01 — Nest OT-type open catalog SoT · admin CREATE N+1 · consumer invent KEY when EFF>0 · Settings stub REF only |
| **Requestor** | pm · U88 after CTR-TEMPLATE-QC-01 GWC KEY LIVE SEALED · continuous OT / attendance ops residual |
| **Decision owner** | sa |
| **Related** | BR-PLT-02/04/05/06 · ADR D4 OT stub · DATA_CLASS §2.5 · peer ATT-SHIFT CITE OUT · UC-HRM-ATT-OT |

### 1.1 Problem — AS-IS vs target

| Current state (AS-IS grep evidence) | Gap / target |
|-------------------------------------|--------------|
| FE **`OvertimeRequestTab`** hardcodes closed **3** types: `weekday` \| `weekend` \| `holiday` (filter + create SelectItem + badge + label) | Open catalog N+1 — starter three = **bootstrap ≠ ceiling** (**BR-PLT-05**) |
| FE **`getCoefficient`** maps hardcoded 1.5 / 2.0 / 3.0 on create — client invents default coeff | Default coeff may live on **catalog row** (display-ready) · TXN may override · **≠** payroll formula engine LIVE |
| Nest **`overtime_requests.overtime_type`** TEXT NOT NULL DEFAULT `'weekday'` · DTO `@IsString()` · **no** catalog assert · **no** invent KEY | When EFF/active count >0 → assert ∈ Nest catalog → **`HRM-ATT-OT-TYPE-KEY`** |
| Nest **`att_ot_type` / `att_overtime_type` / OT catalog table** — **ABSENT** (grep zero CREATE / service for ot_type catalog) | **DEFINE** Nest open catalog (peer EMP-STATUS / SI-INS / leave-balance Nest-ABSENT class) |
| Attendance sidebar **«Tăng ca»** = **stub** (ADR **D4**) · DATA_CLASS **MISSING_CFG_UI** · Settings/XBOS OT codes **SPEC_GAP** | Settings = **REF merge-read only** — **FORBIDDEN** sole SoT |
| ATT-SHIFT BA **S-ATT-SHIFT-CITE-01** — OT request has **no** work_shift field; type weekday/weekend/holiday **CITE OUT** of shift pack | This seat **OWN** OT type · **FORBIDDEN** fold into `work_shifts` · **FORBIDDEN** reopen SHIFT L1 |
| BE SHIFT deepen CODE-MEMORY: **must_keep: OT no invent KEY** on shift assert path | Correct — OT invent KEY belongs **here**, not on shift-change |

**Failure if unresolved:** Settings stub treated as sole SoT while FE hardcode remains product ceiling; admin cannot CREATE 4th type (night/comp time/…); consumer invents free-text `overtime_type` while catalog open; someone folds OT types into `work_shifts` or day-code; PM flips `payroll_e2e_ready` / claims formula LIVE from coeff map; reopens CTR KEY / ATT L1 / invents FE LVRULE; ba-data skips physicalize while BE hardcodes three enums.

### 1.2 Constraints

- Docs-only this seat · **no** `apps/**` · **no** seed (U65)
- **DENY** `attendance_uat_ready=true` · `payroll_e2e_ready=true` · `contracts_printable_ready=true` · module ATT/PAY UAT · Phase1
- **SEAL RETAIN:** CTR-TEMPLATE KEY · CTR-CLAUSE `body_vi` · ATT leave-balance / LVRULE 01g **HOLD** (**DENY invent FE**) · ATT-CODE / WS / SHIFT / leave L1 · EMP / SI / PAY / DEC / MergeToken
- Cite `/api/hrm/attendance/*` — **cấm** invent `/api/hrm/platform/att/*` mega catalog / mega-EAV
- **FORBIDDEN** reopen work_shifts L1 · fold OT into shifts/code/leave/worksite · rewrite aggregate · Face/device LIVE · seed bootstrap for UF density

### 1.3 Decision heuristic (program rule — applied)

| Rule | Application this seat |
|------|------------------------|
| Prefer **B Nest** if producer absent / hardcode residual | OT catalog table **ABSENT** + FE closed-3 hardcode + TXN free string → **B DEFINE** |
| Prefer **A Settings** if producer LIVE | Settings «Tăng ca» / OT codes = **stub / SPEC_GAP** — **not** LIVE ops producer → **A REJECT** as sole SoT |
| Prefer **B RETAIN** if Nest LIVE open catalog | **Alternate note:** Nest OT catalog **not** LIVE → **not** CTR-TEMPLATE RETAIN class; if later discovered LIVE → RETAIN+clarify (see §4.3) |
| REJECT hybrid dual writers / mega-EAV / fold into shift·code·leave / reopen CTR·ATT L1 / invent FE HOLD / flip ready / formula LIVE | Explicit **Option C** reject |

---

## 2. Options

### Option A — Settings Master Data / XBOS OT codes / sidebar stub = sole SoT

| | |
|--|--|
| **Description** | Authoritative OT type list only in Settings Master Data / XBOS catalog partition / Attendance stub «Tăng ca»; Nest has no `att_ot_type`; `OvertimeRequestTab` reads Settings density (or keeps hardcode as «settings mirror»). |
| **Benefits** | Nominal match to older ADR D4 wording «Settings→Danh mục»; zero Nest physicalize. |
| **Costs** | Stub is **MISSING_CFG_UI** (DATA_CLASS) — no LIVE producer; peer ATT leave/code/worksite/shift chose Nest domain SoT for operational REF on TXN; free-text TXN continues while MD may lag; dual orphan vs Nest `overtime_requests`. |
| **Risks** | AC green on Settings while create OT still hardcodes three / accepts invent string — **REJECT** as primary SoT. Settings/XBOS may remain **REF** for group labels — **≠** sole SoT. |

### Option B — Nest `att_ot_type` (F-ATT-CAT-OT-*) = authoritative open OT-type catalog · Settings stub REF only · formula HOLD — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Peer **EMP-STATUS / SI-INS / leave-balance Nest-ABSENT DEFINE** + **ATT leave/code/worksite/shift Nest catalog class**: single open **OT type** catalog = Nest **`public.att_ot_type`** (ba-data may stamp exact name `att_overtime_type` — one table) via caps **F-ATT-CAT-OT-01** list/effective · **F-ATT-CAT-OT-02** mutate. Columns (minimum intent): `company_id`, `code` (slug), `name_vi`, optional `name_en`, **`default_coefficient`** (numeric ≥0 display-ready), `status` active\|inactive, soft-retire (`archived_at` / inactive), scope U19. **Admin** CREATE **N+1** open (`code` + label + default coeff — **BR-PLT-05** · starter `weekday`/`weekend`/`holiday` = bootstrap examples **≠ ceiling**). When **active/EFF count > 0**, **`OvertimeRequestTab`** (and any BA-listed OT create/mutate consumer) **must** pick ∈ Nest catalog (**BR-PLT-02** · **AC-PLT-ATT-OT-01**). Invent unknown `overtime_type` → **`HRM-ATT-OT-TYPE-KEY`** (400). Empty active catalog → soft skip invent + CTA admin CREATE · **no seed** · FE hardcoded three OK **only** as bootstrap fallback when EFF=0. Settings/XBOS OT codes / D4 stub = **REF merge-read only** (**BR-PLT-06**) — **FORBIDDEN** dual-write / sole SoT. **Payroll formula / OT amount engine** remains **HOLD** — catalog default coeff + TXN override **≠** claim `payroll_e2e_ready` / formula LIVE (peer PAY). Orthogonal to **`work_shifts`** (shift has own coeff for schedule — **≠** OT type catalog). |
| **Benefits** | Closes hardcode ceiling · admin≠consumer · aligns peer Nest catalog pattern · ADR D4 stub becomes REF honesty · no reopen SHIFT · no formula invent. |
| **Costs** | ba-data physicalize + ba-process AC pack + later BE CRUD/EFF/KEY assert + FE rebind Select when EFF>0. |
| **Risks** | Misread as reopen work_shifts / claim payroll formula LIVE / fold into day-code → **L-ATT-OT-*** mitigations. |

### Option C — Hybrid dual writers / mega-EAV / fold into work_shifts·code·leave / reopen CTR·ATT L1 / invent FE HOLDs / flip ready / formula LIVE / seed

| | |
|--|--|
| **Description** | Settings **and** Nest both write OT types; or mega `hrm_att_catalog_rows`; or store OT types as fake `work_shifts` rows / day-codes; reopen CTR KEY / ATT L1 / invent FE LVRULE as mandatory; flip attendance/payroll ready; claim coeff map = formula LIVE; seed three types to pass QA. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Dual SoT · seal churn · SHIFT/OT collision · payroll regression · U65 breach. |
| **Risks** | **REJECT** — DENY mega-EAV (Q-PLT-03) · DENY dual writers · DENY fold · DENY reopen · DENY invent FE HOLD · DENY UAT/formula flip · DENY seed. |

---

## 3. Trade-off matrix

| Criteria | Weight | A Settings/stub sole | **B Nest att_ot_type DEFINE** | C Hybrid / fold / reopen / formula |
|----------|-------:|---------------------:|------------------------------:|-----------------------------------:|
| Business value (open types · BR-PLT-02/05 · OT TXN) | 5 | 1 | **5** | 0 |
| Honesty / seal safety (CTR·ATT·FE HOLD·payroll) | 5 | 3 | **5** | 0 |
| Single ops SoT vs stub SPEC_GAP | 5 | 1 | **5** | 1 |
| Time to deliver | 4 | 4 | **2** | 4 |
| Complexity / maintainability (admin≠consumer · peer) | 4 | 1 | **5** | 0 |
| Orthogonal to work_shifts (ATT-SHIFT CITE OUT) | 5 | 2 | **5** | 0 |
| **Weighted** | | 54 | **132** | 18 |

---

## 4. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Nest OT-type catalog **ABSENT** + FE closed-3 hardcode + free-string TXN = DEFINE Nest open catalog (peer EMP-STATUS / SI-INS / leave-balance). Settings/ADR D4 stub is **not** LIVE ops producer → Option A inapplicable as sole SoT. Catalog default coeff ≠ payroll formula LIVE (peer PAY engine HOLD). Orthogonal OWN from ATT-SHIFT CITE OUT. |
| **Rejected** | **A** Settings/stub sole · **C** hybrid / mega-EAV / fold / reopen CTR·ATT / invent FE HOLD / flip ready / formula LIVE / seed |
| **Assumptions** | CTR KEY · ATT L1 · FE LVRULE HOLD remain sealed; `overtime_requests` TXN path RETAIN; starter three codes remain valid historical TXN values; ba-data stamps exact DDL name once. |

### 4.1 Physical / DATA / BA / BE gates

| Question | Answer |
|----------|--------|
| New ba-data physicalize? | **UNLOCK** — Nest `att_ot_type` (or stamped synonym) **ABSENT** · **FORBIDDEN** second mega-EAV · **FORBIDDEN** fold into `work_shifts` / day-code / leave / worksite |
| Unlock ba-process? | **YES** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01` AC pack (**AC-PLT-ATT-OT-01***) |
| Unlock ba-data? | **YES** — physical DDL + indexes + soft-delete + scope columns |
| Unlock BE? | **HOLD** until BA (+ DATA) CONFIRMED — then CRUD/EFF + invent KEY on OT create |
| Unlock FE? | After BA — `OvertimeRequestTab` rebind Nest list/EFF when count>0; **FORBIDDEN** invent FE LVRULE 01g / ATT-CODE FE HOLD as mandatory |
| Reopen CTR / ATT L1 / work_shifts? | **FORBIDDEN** |
| Flip attendance_uat / payroll_e2e / printable / formula LIVE / Phase1? | **FORBIDDEN** |

### 4.2 Peer / adjacent catalogs (cite — do not reopen / fold)

| Catalog / ops | Nest / SoT | This seat |
|---------------|------------|-----------|
| Work shifts | Nest `work_shifts` LIVE · ADR D1 · ATT-SHIFT L1 | **OUT reopen** · OT type **orthogonal** (CITE OUT from SHIFT pack) |
| Attendance codes | Nest `att_attendance_code` · ATT-CODE L1 | **OUT** |
| Leave types / accrual | Nest leave + leave-balance | **OUT** |
| Work sites | Nest `attendance_work_sites` | **OUT** |
| **OT types** | Nest **`att_ot_type` DEFINE** · F-ATT-CAT-OT-* | **OWN** AC-PLT-ATT-OT-01 |
| Settings OT / D4 stub | REF merge-read | **REF only** — not sole SoT |
| Payroll formula / LIST-TOTALS / aggregate | PAY catalog ≠ engine · ATT aggregate GĐ1 | **OUT** formula LIVE · **OUT** rewrite aggregate |
| CTR template / clause | KEY LIVE · body_vi | **SEAL RETAIN** |
| FE LVRULE 01g | HOLD | **HOLD RETAIN** — **DENY invent FE** |

### 4.3 Alternate note — if OT catalog already LIVE (RETAIN+clarify)

| Probe | Result this seat (2026-08-08) |
|-------|-------------------------------|
| Nest `CREATE TABLE` / service for `att_ot_type` / overtime type catalog | **ABSENT** |
| Admin CRUD API for OT types | **ABSENT** (only TXN `overtime-requests`) |
| FE admin panel bound to Nest OT types | **ABSENT** (hardcode Select + D4 stub) |

**Conclusion:** **Not** CTR-TEMPLATE RETAIN class. If a future audit finds Nest OT catalog LIVE (CRUD + open N+1 + invent path), SA must **RETAIN+clarify** Option B like CTR-TEMPLATE (ba-data **HOLD**, deepen AC only) — **do not** invent second table. This seat documents DEFINE because ABSENT is proven.

---

## 5. Locks (L-ATT-OT-*)

| Lock | Rule |
|------|------|
| **L-ATT-OT-01 Admin ≠ consumer** | Catalog admin POST/PATCH F-ATT-CAT-OT-02 = **open N+1**. Consumers (`OvertimeRequestTab` create / BA-listed) when **EFF/active >0** = **picker/FK only** (BR-PLT-02 · **AC-PLT-ATT-OT-01**). |
| **L-ATT-OT-02 Code SoT** | Authoritative OT type list = Nest `att_ot_type` via F-ATT-CAT-OT-01/02 — **FORBIDDEN** Settings/stub alone as SoT · **FORBIDDEN** FE closed-3 as sole SoT when EFF>0 |
| **L-ATT-OT-03 Dual SoT REF** | Settings/XBOS OT codes / D4 sidebar stub = **REF merge-read only** — Nest tenant wins (**BR-PLT-06**) · **FORBIDDEN** dual-write |
| **L-ATT-OT-04 Admin open** | CREATE N+1 open `code` slug — **FORBIDDEN** closed enum ceiling (weekday/weekend/holiday only) as product SoT · starter three = bootstrap (**BR-PLT-05**) |
| **L-ATT-OT-05 Consumer invent** | EFF>0 → `overtime_type` must ∈ scoped Nest catalog — invent → **`HRM-ATT-OT-TYPE-KEY`** (400) |
| **L-ATT-OT-06 Empty EFF** | EFF=0 → soft empty + CTA admin CREATE · invent assert **skip** · **no seed** · hardcode three OK **only** when empty |
| **L-ATT-OT-07 Soft-delete** | Retire prefer `status='inactive'` / `archived_at` · history TXN refs OK (**BR-PLT-04**) |
| **L-ATT-OT-08 Orthogonal / no fold** | **≠** `work_shifts` · **≠** `att_attendance_code` · **≠** `att_leave_type` · **≠** worksite · **FORBIDDEN** fold · **FORBIDDEN** reopen SHIFT/CODE/leave/WS L1 |
| **L-ATT-OT-09 Seals retain** | **FORBIDDEN** reopen CTR KEY/clause · ATT leave-balance · FE LVRULE 01g invent · ATT L1 · EMP/SI/PAY/DEC without warrant |
| **L-ATT-OT-10 Honesty / formula HOLD** | **DENIED** `attendance_uat_ready` / `payroll_e2e_ready` / `contracts_printable_ready` / module ATT·PAY UAT / Phase1 · **DENIED** claim default_coefficient = payroll formula LIVE · **`C-SLICE-≠-MODULE`** |
| **L-ATT-OT-11 Scope** | list ↔ get-by-id ↔ mutate ↔ consumer assert = `resolveHrmListScope` (**U19**) |
| **L-ATT-OT-12 Display-ready** | List/EFF expose `code`/`name_vi`/`default_coefficient` — FE **cấm** invent labels when BE provides; FE may prefill coeff from catalog but TXN override remains optional |
| **L-ATT-OT-13 Mega-EAV** | **FORBIDDEN** one ATT mega catalog for code+leave+sites+shifts+OT (Q-PLT-03) |
| **L-ATT-OT-14 Face / device OUT** | Face/device rules — BA-01 **OUT** · **FORBIDDEN** invent LIVE this seat |
| **L-ATT-OT-15 Seed DENY** | **FORBIDDEN** `pnpm seed:*` / ensureDefault OT types for UF density (U65) |

```text
  Settings/XBOS OT codes + D4 «Tăng ca» stub ──► REF merge-read only (Option A REJECT as sole)
           │
  F-ATT-CAT-OT CRUD ──► public.att_ot_type (DEFINE SoT)
           │
           ▼
  F-ATT-CAT-OT-01 list / EFF ──► picker code / name_vi / default_coefficient
           │
  Consumers (EFF>0): OvertimeRequestTab create · BA-listed OT mutate
           │
  invent overtime_type ──► HRM-ATT-OT-TYPE-KEY
  empty EFF ──► skip assert · CTA · no seed · hardcode fallback only
  work_shifts / day-code / leave / worksite / CTR / FE LVRULE / payroll formula ──► OUT
```

---

## 6. F.1 capability define (ADD — no apps this seat)

| Cap | Path / rule (intent) | AC |
|-----|----------------------|-----|
| List / EFF admin SoT | **F-ATT-CAT-OT-01** `GET /api/hrm/attendance/ot-types` (+ optional `/effective`) — display-ready · default active filter · **cấm** ensureDefault on U65 | **AC-PLT-ATT-OT-01** |
| Admin create open | **F-ATT-CAT-OT-02** POST — N+1 `code`/name/default_coefficient OK | **AC-PLT-ATT-OT-01d** |
| Admin update / retire | **F-ATT-CAT-OT-02** PATCH inactive / soft archive | BR-PLT-04 |
| Consumer invent | OT create when EFF>0 → **`HRM-ATT-OT-TYPE-KEY`** | **AC-PLT-ATT-OT-01b** |
| Empty CTA | EFF=0 → CTA + skip invent · no seed | **AC-PLT-ATT-OT-01c** |
| Settings REF | D4 stub / MD OT codes — read only | L-ATT-OT-03 |
| CTR / ATT L1 / SHIFT / formula / Face | **must_keep** — **OUT** | DENY reopen / flip |

**Error (consumer invent):**

| Condition | Code |
|-----------|------|
| EFF>0 ∧ `overtime_type` ∉ scoped Nest catalog | **`HRM-ATT-OT-TYPE-KEY`** (400) |
| OOS get/mutate catalog | **`HRM-ATT-OT-404`** / scope **`HRM-ATT-OT-409`** (BA may stamp) |
| Admin validation (empty code/name, bad coeff) | **`HRM-ATT-OT-VAL`** (BA may stamp) |
| Taxonomy ≠ KEY | 404 / CODE-INVALID / VAL **≠** invent KEY (peer CTR KEY taxonomy) |

---

## 7. AC / validation stubs (for ba-process — draft)

| ID | Condition | Expected PASS | FAIL |
|----|-----------|---------------|------|
| **AC-PLT-ATT-OT-01** | Nest EFF ≥1 · OvertimeRequestTab picks Nest type | 2xx · FE after 2xx · F5 Nest still SoT | Settings stub sole · free invent hardcode succeed when EFF>0 |
| **AC-PLT-ATT-OT-01b** | Invent `overtime_type` ∉ catalog when EFF>0 | 4xx **`HRM-ATT-OT-TYPE-KEY`** · no persist | 2xx invent · wrong KEY (SHIFT/LEAVE/CTR) |
| **AC-PLT-ATT-OT-01c** | GET list/EFF 200 · empty [] OK · CTA · no seed | empty honesty · U65 | seed default OT types · silent invent |
| **AC-PLT-ATT-OT-01d** | Admin CREATE Nest N+1 open `code` (e.g. `comp_time`) | 2xx · F5 list has row · consumer picker includes | closed weekday/weekend/holiday ceiling · Settings dual-write |
| **AC-PLT-ATT-OT-01e** | Soft-retire → hide default picker · historical TXN OK | inactive hidden · refs OK | hard-delete only with refs |
| **AC-PLT-ATT-OT-01f** | Prefill `coefficient` from `default_coefficient` optional · TXN override OK | display-ready · no formula claim | claim payroll formula LIVE / flip `payroll_e2e_ready` |
| **AC-PLT-ATT-OT-01H** | Honesty / seals | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · CTR KEY / ATT L1 / FE LVRULE HOLD / SHIFT **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · U65 · Face OUT | Flip ready · reopen seals · invent FE · fold into shifts · Phase1 · module ATT/PAY UAT |

**Consumer surface inventory (ba-process must enumerate exact UF/J-*):** Attendance → Đơn từ→Tăng ca (`OvertimeRequestTab`) list filter + create · detail badge · optional mobile OT create if in-scope · **not** ShiftChange · **not** work_shifts CRUD · **not** payroll calculate · **not** Face/device · **not** CTR print.

---

## 8. Explicit OUT (this seat)

| OUT | Reason |
|-----|--------|
| Reopen **work_shifts** / ATT-SHIFT L1 invent KEY seats | ATT-SHIFT SEAL · L-ATT-OT-08 · S-ATT-SHIFT-CITE-01 OWN reverse |
| Payroll **formula LIVE** / flip `payroll_e2e_ready` | Peer PAY engine HOLD · L-ATT-OT-10 · default coeff ≠ formula |
| Flip `attendance_uat_ready` / `contracts_printable_ready` | Honesty · C-SLICE |
| Face / device rules LIVE | BA-01 OUT · L-ATT-OT-14 |
| Mega-EAV / fold OT into shifts·code·leave·worksite | Q-PLT-03 · L-ATT-OT-08/13 |
| Seed / ensureDefault OT types for UF | U65 · L-ATT-OT-15 |
| Reopen CTR template/clause KEY · ATT leave-balance · invent FE LVRULE 01g | Parent seals · DENY invent FE |
| Module ATT/PAY UAT · Phase1 DONE | Slice ≠ module |
| Rewrite `att-timesheet-line-aggregate` / LIST-TOTALS | Aggregate seal |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **CONFIRMED Option** | **B** — Nest `att_ot_type` DEFINE (Settings/D4 stub REF only) |
| **next_owner** | **ba-process** + **ba-data** (**UNLOCK**) |
| **next_dispatch_prompt** | See evidence `po-hrm-dynamic-config-platform-ot-type-catalog-sa-01.md` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-sa-01.md` |
| **BE unlock** | **HOLD** until BA + DATA CONFIRMED |

---

## 10. completion_report

**Closed:** Docs-only Option **B LOCKED** for OT type open catalog — Nest ABSENT → **DEFINE** `att_ot_type` + invent stamp **`HRM-ATT-OT-TYPE-KEY`** + admin CREATE N+1 ≠ consumer invent; bind `OvertimeRequestTab` when EFF>0; Settings/D4 stub REF only; formula/Face/SHIFT reopen/seed/mega-EAV **OUT**; CTR KEY + ATT L1 + FE LVRULE HOLD **RETAIN**; honesty flags false · **C-SLICE**; ba-data **UNLOCK** · ba-process **UNLOCK** · BE HOLD. Alternate RETAIN path documented if Nest later found LIVE. **No** `apps/**`.

**Residual:** BA AC pack + ba-data DDL · later BE/FE · formula LIVE never this vertical alone.
