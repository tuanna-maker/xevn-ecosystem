# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01 — Option/F.1 · FE residual **R-PLT-ATT-CODE-FE-01** (consumer Nest EFF rebind)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01` |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-01` **GWC** L1 `ATTCODEQA-MSK4T1A5` · DOCS **ACCEPT** CH05c · residual **FE HOLD** |
| **U88 context** | Just sealed: ATT-COMP OTC-03 **CLOSED** · LVRULE FE-01g Option **B** **ACCEPT_AS_IS_P2 HOLD** (no invent FE) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **narrow FE HOLD disposition only** |
| **change_mode** | **ADD** Option/F.1 for **R-PLT-ATT-CODE-FE-01** · **NO CODE** `apps/**` · **no seed** · **no wipe** ATT-CODE L1 · COMP OTC-03 · OT-TYPE · LVRULE HOLD |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **A** **LOCKED** · **UNLOCK FE consumer Nest EFF rebind** · ba-process **HOLD** (AC-PLT-ATT-CODE-01/01f already locked) · next = **dev-fe** |
| **prior_seals** | ATT-CODE L1 `ATTCODEQA-MSK4T1A5` · DOCS CH05c SRS v0.35 · leave/WS/SHIFT · COMP OTC-03 CLOSED · OT-TYPE L1/FE · LVRULE FE-01g ACCEPT_AS_IS HOLD · FE-ADMIN OT/OTC HOLD — **SEAL / HOLD RETAIN** |
| **prior_sa** | [`ATT-CODE-CATALOG-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md) Option **B** Nest `att_attendance_code` — this seat **≠** reopen catalog SoT |
| **prior_ba** | [`ATT-CODE-CATALOG-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md) **AC-PLT-ATT-CODE-01 / 01f** already locked — **RETAIN** (no new AC pack) |
| **peer_cite_unlock** | OT-TYPE FE-01 · COMP FE-01 · SHIFT FE-01 — Nest EFF Select consumer rebind — **cite ≠ invent admin** |
| **peer_cite_hold** | LVRULE FE-01g ACCEPT_AS_IS_P2 · OT/OTC **FE-ADMIN** HOLD — **cite ≠ copy onto consumer residual** |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · formula LIVE **HOLD** · aggregate GĐ1 **SEALED** · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module ATT UAT · seed · reopen COMP/OT/LVRULE/CODE L1 |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | Disposition for **R-PLT-ATT-CODE-FE-01** (P2) — unlock Nest EFF consumer rebind vs ACCEPT_AS_IS HOLD vs invent admin |
| **Requestor** | pm · U88 continuous after COMP OTC-03 CLOSED + LVRULE 01g HOLD |
| **Decision owner** | sa |
| **Related** | AC-PLT-ATT-CODE-01 / 01b / 01c / 01f · VAL-ATT-CODE-CNS-06 · BR-PLT-ATT-CODE-06/07 · S-ATT-CODE-CNS-01 · F-ATT-CAT-CODE-EFF-01 · F-ATT-CODE-CNS-01/02 |

### 1.1 Problem — what FE surface is HOLD (AS-IS evidence)

QC-01 sealed ATT-CODE **L1** (invent KEY + DTO open + admin N+1 + soft-retire). Remaining product Condition:

| Residual ID | Severity | Surface inventory | Proven already (RETAIN) |
|-------------|----------|-------------------|-------------------------|
| **R-PLT-ATT-CODE-FE-01** | **P2 HOLD → unlock candidate** | **Consumer** `AttendanceRecordsTable` — Edit status Select + filter still **closed hardcode** (`API_STATUS_OPTIONS` = `pending\|present\|absent\|leave`; filter also offers `late` / `early_leave` / display map has `on_leave` / `business_trip` / `holiday` / `weekend`) — **no** `useAttAttendanceCodesEffective` hook · **no** GET `…/attendance-codes/effective` bind | Nest `att_attendance_code` L1 · invent **400 `HRM-ATT-CODE-KEY`** · EFF admin N+1 · display `status_label`/`symbol` BE · DOCS CH05c |
| **R-PLT-ATT-CODE-FE-ADMIN** (named NOTE) | **P2 HOLD RETAIN** | Settings/ATT CFG «Ký hiệu công» **admin FE ABSENT** (L1 proven via Network API only) | Peer OT/OTC FE-ADMIN HOLD class — **FORBIDDEN invent this seat** |

**Code facts (read-only audit — no apps edit this seat):**

| Layer | Fact | Gap vs AC-01 / 01f |
|-------|------|--------------------|
| BE `GET …/attendance-codes/effective` | LIVE F-ATT-CAT-CODE-EFF-01 (controller) | **SEALED** L1 — consumer FE unbound |
| BE invent KEY | create/update record status ∈ EFF when count>0 → `HRM-ATT-CODE-KEY` | **SEALED** — FE hardcode can POST closed-4 only; admin-created `wfh`/`CT` **unreachable** from Select |
| FE `AttendanceRecordsTable.tsx` | `API_STATUS_OPTIONS` hardcode 4; `statusLabel` map richer (`early_leave`/`on_leave`/…) · filter SelectItem hardcode | **FAIL class** AC-PLT-ATT-CODE-01 / 01f / VAL-CNS-06 when EFF>0 |
| FE hooks | `useAttOtTypesEffective` / `useAttOtCompTypesEffective` / work-shifts EFF **LIVE peer** · **no** attendance-code EFF hook | Gap = consumer rebind only |
| FE admin attendance-codes | Grep Settings/components: **ABSENT** | FE-ADMIN HOLD — **not** unlock scope |

**Class discrimination (critical):**

| Class | Example | Disposition |
|-------|---------|-------------|
| **Consumer Nest EFF rebind** (surface LIVE + Nest EFF LIVE + AC picker locked) | OT-TYPE FE-01 · COMP FE-01 · SHIFT FE-01 · **THIS residual** | **UNLOCK** Option A |
| **FE-ADMIN / deepen ABSENT panel** (Network L1 OK · product admin FE OUT) | LVRULE FE-01g · OT FE-ADMIN · OTC FE-ADMIN | **ACCEPT_AS_IS_P2 HOLD** — **not** this residual's primary class |
| **Invent / reopen / flip** | Invent admin «while at it» · reopen L1 · flip ready | **REJECT** Option C |

**Failure if unresolved badly:** KEEP forever HOLD while EFF>0 → admin CREATE N+1 green but bảng ghi công Select still 4-code sole SoT (VAL-CNS-06 FAIL-if-claimed) · OR invent Settings admin FE + LVRULE 01g + OT FE-ADMIN in one Task · OR flip `attendance_uat_ready` because FE Select rebound.

### 1.2 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent LVRULE FE 01g · invent OT-comp / OT-TYPE **FE-ADMIN**
- **DENY** reopen COMP OTC-03 CLOSED · OT-TYPE L1/FE · ATT-CODE L1 · leave/WS/SHIFT
- **DENY** flip ready · formula LIVE · aggregate rewrite · module ATT UAT · Phase1 · seed
- BA-01 **AC-01 / 01f already exist** — this seat is **disposition unlock**, not redefine Nest Option B

### 1.3 Decision heuristic

| Rule | Application |
|------|-------------|
| Nest L1 KEY LIVE + consumer FE surface LIVE + AC picker locked → unlock consumer FE | Prefer **A** (peer OT/COMP/SHIFT) |
| QC «do not invent FE as L1 mandatory» ≠ forever FE-ADMIN HOLD | L1 seal time deferred Condition; U88 now may unlock **consumer** only |
| ACCEPT_AS_IS HOLD reserved for ABSENT admin / MVP deepen without consumer picker FAIL | LVRULE 01g class — **reject as default here** |
| REJECT invent admin / reopen seals / flip UAT | **C** |

---

## 2. Options

### Option A — Unlock FE consumer Nest EFF rebind (peer OT-TYPE / COMP / SHIFT) — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Treat **R-PLT-ATT-CODE-FE-01** as **named Condition closable** via `dev-fe` ADD-only: add `useAttAttendanceCodesEffective` (+ hrmApi `listEffectiveAttendanceCodes`) peer `useAttOtTypesEffective`; rebind `AttendanceRecordsTable` Edit status Select + filter (+ badge prefer catalog `nameVi`/`symbol` / BE `status_label`) when **EFF>0**; bootstrap closed-4 / map **only** when EFF=0; surface invent toast on **400 `HRM-ATT-CODE-KEY`**; reconcile / drop sole SoT for BE-rejected keys (`early_leave`/`on_leave` as Select values when EFF>0). **KEEP** **R-PLT-ATT-CODE-FE-ADMIN** as separate **HOLD NOTE** (DENY invent Settings admin panel). |
| **Benefits** | Closes VAL-CNS-06 / AC-01 / 01f; admin N+1 codes become selectable; aligns peer OT/COMP/SHIFT already CLOSED; HDSD CH05c consumer path matches shipped FE; clears board FE HOLD without inventing admin. |
| **Costs** | One FE Task + QA-FE + QC-FE Condition close; vitest + browser U65. |
| **Risks** | Scope creep into FE-ADMIN or LVRULE 01g invent → mitigate with allowed_paths + DENY list. |
| **Gate** | L1 ATTCODEQA-MSK4T1A5 RETAIN · Nest EFF LIVE · ba AC RETAIN · honesty false. |

### Option B — ACCEPT_AS_IS_P2 HOLD RETAIN until sponsor opens FE wave

| | |
|--|--|
| **Description** | Keep Condition **R-PLT-ATT-CODE-FE-01** as **P2 HOLD / NOTE** forever-until-sponsor (peer LVRULE FE-01g). Do not dispatch `dev-fe`. |
| **Benefits** | Bandwidth for other verticals; zero FE churn. |
| **Costs** | When EFF>0, consumer Select remains closed-4 sole SoT → **documented FAIL-if-claimed** on AC-01/01f; CH05c consumer path unproven on FE; board residual stalls after peers OT/COMP already closed same class. |
| **Risks** | Misread HOLD as «AC-01 waived» or as FE-ADMIN class forever · sponsor sees admin CREATE green but bảng ghi công cannot pick Nest codes. |
| **Gate** | **Reject as default** — unlike LVRULE, consumer surface + Nest EFF + AC picker already exist; QC HOLD was L1-mandatory deferral, not FE-ADMIN ABSENT. Retain B only if sponsor **explicitly** says defer ATT-CODE FE. |

### Option C — Hybrid invent admin / invent LVRULE / reopen / flip

| | |
|--|--|
| **Description** | Invent Settings «Ký hiệu công» admin FE + LVRULE 01g panel + OT-comp FE-ADMIN «while at it»; or reopen ATT-CODE L1 / COMP OTC-03; or flip `attendance_uat_ready` / claim formula LIVE / seed density. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Seal churn · C-SLICE violation · sponsor trust. |
| **Risks** | **REJECT** — DENY invent FE-ADMIN · DENY invent LVRULE 01g · DENY reopen COMP/OT/CODE L1 · DENY ready flip · DENY seed. |

---

## 3. Trade-off matrix

| Criteria | Weight | **A Unlock consumer FE** | B ACCEPT HOLD P2 | C Invent/reopen/flip |
|----------|-------:|-------------------------:|-----------------:|---------------------:|
| AC-01/01f / VAL-CNS-06 honesty | 5 | **5** | 1 | 0 |
| Peer OT/COMP/SHIFT class fit | 5 | **5** | 2 | 0 |
| Seal safety (CODE L1·COMP·OT·LVRULE) | 5 | **5** | **5** | 0 |
| Deny invent FE-ADMIN / LVRULE 01g | 5 | **5** | **5** | 0 |
| Business value (admin N+1 usable) | 4 | **5** | 1 | 1 |
| Blast radius / complexity | 4 | 4 | **5** | 0 |
| U88 continuous (close named residual) | 4 | **5** | 2 | 0 |
| **Weighted** | | **154** | 91 | 4 |

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **A** | FE invents admin panel + consumer in one Task | Diff Settings attendance-codes CRUD | **FORBIDDEN** · allowed_paths = consumer table + hook + hrmApi EFF only · FE-ADMIN HOLD RETAIN |
| **A** | Touches LVRULE / OT FE-ADMIN / COMP OTC | Diff LeaveTab / OvertimeRequestTab admin | DENY paths · cite LVRULE HOLD + OTC CLOSED |
| **A** | Claims module ATT UAT after Select rebind | Honesty matrix | **L-ATT-CODE-FE-08** C-SLICE · ready=false |
| **A** | Keeps `early_leave`/`on_leave` as sole Select SoT when EFF>0 | QA AC-01f | Reconcile: map→catalog code or drop from Edit Select; filter may show historical keys as read-only chips |
| B | HOLD forever while EFF>0 | Board stall + VAL-CNS-06 | Prefer A; B only sponsor-explicit defer |
| C | Ready flip / seal reopen | Honesty / stamp | DENY · NO-GO process |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option A** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Disposition** | **UNLOCK** Condition **R-PLT-ATT-CODE-FE-01** → **dev-fe** Nest EFF consumer rebind |
| **Why A** | Nest L1 KEY + EFF LIVE; consumer `AttendanceRecordsTable` LIVE with hardcode sole Select; BA AC-01/01f require Nest picker; peer OT-TYPE/COMP/SHIFT already proved same pattern; QC FE HOLD was «not L1-mandatory invent», not FE-ADMIN ABSENT class (contrast LVRULE 01g). |
| **Rejected** | **B** as default ACCEPT_AS_IS (wrong class) · **C** invent admin / reopen / flip |
| **Assumptions** | Sponsor/PM U88 asks disposition now (this message) · COMP OTC-03 stays CLOSED · LVRULE 01g stays ACCEPT_AS_IS HOLD · FE-ADMIN ATT-CODE stays HOLD |

### 5.1 Unlock gates (what Option A opens / does not)

| Question | Answer |
|----------|--------|
| Unlock ba-process new AC pack? | **HOLD** — AC-01/01f already in BA-01 · **no** duplicate BA seat |
| Unlock ba-data / BE L1 reopen? | **FORBIDDEN** — L1 ATTCODEQA-MSK4T1A5 **RETAIN** |
| Unlock FE consumer Nest EFF? | **YES** — `dev-fe` FE-01 |
| Unlock FE-ADMIN Settings «Ký hiệu công»? | **HOLD / FORBIDDEN invent** this seat (`R-PLT-ATT-CODE-FE-ADMIN`) |
| Unlock LVRULE FE 01g / OT FE-ADMIN? | **FORBIDDEN** |
| May PM flip attendance_uat / claim module ATT UAT? | **NO** |
| May PM remove L1 seal? | **NO** |

### 5.2 FE bind contract (copy for dev-fe)

```text
EFF>0:
  - Edit status Select options = GET /attendance/attendance-codes/effective
    (code + nameVi/symbol display-ready; sort_order)
  - Submit PATCH/POST status = Nest code (BE KEY assert live)
  - Badge/label prefer BE status_label / catalog nameVi+symbol; no invent join
  - Drop early_leave|on_leave as Edit Select values unless present as Nest codes
EFF=0:
  - Bootstrap pending|present|absent|leave (+ hint CTA Settings / CH05c)
  - invent assert soft-skip (BE) · no seed · no hardcode-as-SoT claim
Negative:
  - invent status when EFF>0 → Network 400 HRM-ATT-CODE-KEY + VI toast
must_keep:
  - list GET LIVE · CLOCK/SHEETS/LEAVE/OT wires · Face HOLD
  - aggregate GĐ1 sealed (no rewrite counting)
  - no FE-ADMIN invent · no LVRULE · no OT/COMP reopen
honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE
```

---

## 6. Locks (L-ATT-CODE-FE-*)

| Lock | Rule |
|------|------|
| **L-ATT-CODE-FE-01 Consumer ≠ Admin** | Unlock **consumer** Select only · **FORBIDDEN** invent Settings admin FE this seat |
| **L-ATT-CODE-FE-02 Nest EFF SoT when >0** | FORBIDDEN hardcode `API_STATUS_OPTIONS` sole SoT when EFF>0 (**L-ATT-CODE-02** cite) |
| **L-ATT-CODE-FE-03 Bootstrap EFF=0** | Closed-4 / map OK **only** EFF=0 · no seed (**AC-01c**) |
| **L-ATT-CODE-FE-04 Invent KEY surface** | EFF>0 invent → toast + Network **`HRM-ATT-CODE-KEY`** (≠ leave/EMP/OT KEY) |
| **L-ATT-CODE-FE-05 Divergence reconcile** | `early_leave`/`on_leave` not sole Edit options when EFF>0 (**AC-01f**) |
| **L-ATT-CODE-FE-06 Seals RETAIN** | ATTCODEQA-MSK4T1A5 · COMP OTC-03 · OT-TYPE · LVRULE 01g HOLD · leave/WS/SHIFT · DOCS CH05c |
| **L-ATT-CODE-FE-07 DENY invent peers** | **FORBIDDEN** invent LVRULE FE 01g · OT/OTC FE-ADMIN · reopen COMP/OT L1 |
| **L-ATT-CODE-FE-08 Honesty / C-SLICE** | ready=false · formula HOLD · aggregate GĐ1 sealed · FE unlock ≠ module ATT UAT |
| **L-ATT-CODE-FE-09 Peer class** | Cite OT-TYPE/COMP/SHIFT **consumer** FE-01 — **not** LVRULE ACCEPT_AS_IS class |
| **L-ATT-CODE-FE-10 Path** | Writes only NFD tree `.git`+`apps` True · WriteAllText UTF-8 no BOM |

```text
  Nest att_attendance_code L1 + KEY + EFF     ──► SEALED (QC-01 · DOCS CH05c)
  AttendanceRecordsTable Edit Select hardcode ──► UNLOCK FE Nest EFF (this seat → dev-fe)
  Settings admin «Ký hiệu công» FE            ──► ABSENT HOLD (FE-ADMIN NOTE)
  LVRULE FE-01g / OT FE-ADMIN                 ──► HOLD RETAIN (FORBIDDEN invent)
  COMP OTC-03 / OT-TYPE L1/FE                 ──► CLOSED / SEAL RETAIN
  Aggregate / formula / attendance_uat        ──► SEALED GĐ1 / HOLD / false
```

---

## 7. Impacted systems & non-goals

| In scope (docs disposition + unlock FE consumer) | OUT / FORBIDDEN |
|--------------------------------------------------|-----------------|
| Option A/B/C + LOCKED A · next_dispatch **dev-fe** | `apps/**` this SA seat · migration · seed |
| Cite BA AC-01/01f RETAIN · peer OT/COMP FE pattern | Invent FE-ADMIN Settings attendance-codes |
| Name FE-ADMIN HOLD residual separately | Invent LVRULE 01g · invent OT FE-ADMIN |
| U88 PM → FE → QA-FE → QC-FE Condition close | Flip ready · reopen COMP OTC-03 · aggregate rewrite · module ATT UAT |

---

## 8. Validation / acceptance evidence plan

| Checkpoint | PASS when |
|------------|-----------|
| Spec ≥3KB on NFD `.git` toplevel | This file |
| Evidence ≥3KB | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-fe-sa-01.md` |
| Option LOCKED | **A** UNLOCK FE consumer Nest EFF |
| next_dispatch | **dev-fe** `…-ATT-CODE-CATALOG-FE-01` (not HOLD-only; not FE-ADMIN) |
| Honesty | ready=false · C-SLICE · DENY LVRULE/OT FE-ADMIN invent · COMP/OT seals RETAIN |

---

## 9. completion_report

**Closed:** Narrow SA Option/F.1 for **R-PLT-ATT-CODE-FE-01** — inventory consumer hardcode Select vs Nest EFF LIVE · class = peer OT/COMP/SHIFT consumer rebind (**≠** LVRULE ACCEPT_AS_IS) · Option **A/B/C** · trade-off · **Option A LOCKED UNLOCK FE** · FE-ADMIN ATT-CODE **HOLD RETAIN** · DENY invent LVRULE 01g / OT FE-ADMIN · DENY reopen COMP/OT/CODE L1 · honesty false · C-SLICE · no `apps/**`.

**Open / residual:** Condition **R-PLT-ATT-CODE-FE-01** → **dev-fe** execution; **R-PLT-ATT-CODE-FE-ADMIN** remains HOLD NOTE; LVRULE 01g ACCEPT_AS_IS HOLD RETAIN; ready flags false.

**next_owner:** **pm** → Task **dev-fe**

**ack_status:** **PASS_TO_PM** · **CONFIRMED**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-fe-sa-01.md`

### next_dispatch_prompt (copy-ready — UNLOCK FE)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
change_mode: ADD
entry_criteria:
  - ATT-CODE L1 SEAL RETAIN ATTCODEQA-MSK4T1A5 · DOCS CH05c ACCEPT
  - SA FE Option A LOCKED (this seat) · Nest GET …/attendance-codes/effective LIVE
  - peer pattern: useAttOtTypesEffective + OvertimeRequestTab / useAttOtCompTypesEffective / ShiftChange Nest EFF
  - U65 zero-seed · browser-only later QA
exit_criteria:
  - AttendanceRecordsTable Edit status Select binds Nest EFF when EFF>0 (code+nameVi/symbol)
  - EFF=0 bootstrap pending|present|absent|leave + hint · no seed
  - submit status = Nest code; invent → toast + 400 HRM-ATT-CODE-KEY
  - reconcile early_leave|on_leave: not sole Edit SoT when EFF>0
  - vitest hook+bind PASS · eslint/build touched paths PASS
  - CODE-MEMORY APPEND · solid_convention_ack display-ready
  - DENY invent FE-ADMIN Settings · DENY touch LVRULE/OT FE-ADMIN/COMP OTC · DENY flip ready · DENY aggregate rewrite
allowed_paths:
  - apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx
  - apps/web/hrm/src/hooks/useAttAttendanceCodesEffective.ts (+ .test.ts)
  - apps/web/hrm/src/integrations/hrmApi.ts (listEffectiveAttendanceCodes only)
  - apps/web/hrm/src/lib/attAttendanceCodeCatalog.ts (+ .test.ts) optional helper
forbidden_paths:
  - apps/api/** · Settings admin attendance-codes invent · LeaveTab LVRULE · OvertimeRequestTab admin
  - aggregate / payroll formula · seed scripts
must_keep:
  - list GET LIVE · CLOCK/SHEETS/LEAVE/OT · Face HOLD · L1 KEY · COMP OTC-03 CLOSED · OT-TYPE FE · LVRULE 01g HOLD
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-fe-01.md
ack_status_target: READY_FOR_QA
spec_ref:
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md (Option A LOCKED)
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md AC-PLT-ATT-CODE-01/01f
read_first: SA FE-01 · BA-01 § AC-01/01f · peer ot-type-catalog-fe-01.md · qc-01 residual R-PLT-ATT-CODE-FE-01
```

**DENY alternate:** invent `…-ATT-CODE FE-ADMIN` · invent LVRULE FE-01g · reopen COMP OTC-03 · flip `attendance_uat_ready` · claim module ATT UAT from FE Select alone.