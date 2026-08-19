# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01 — Option/F.1 · FE residual **R-PLT-ATT-LVRULE-FE-01g** (panel / admin / grant bind)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01` |
| **dispatch_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01-R2` |
| **r2_note** | Prior SA agent empty/INVALID — **R2** reconfirm on NFD `.git` toplevel via WriteAllText · **same** Option **B** LOCK (no architecture flip) |
| **Parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-02` **GWC** · CNS-WIRE **CLOSED** · FE 01g **HOLD** · U88 after ATT-COMP-TYPE QC-FE GWC OTC-03 CLOSED |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **narrow FE 01g residual only** |
| **change_mode** | **ADD** Option/F.1 disposition for Condition **R-PLT-ATT-LVRULE-FE-01g** · **NO CODE** `apps/**` · **no seed** · **no wipe** leave-balance L1/KEY · COMP OTC-03 · OT-TYPE · ATT L1 |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** · ba-process **HOLD** (no new AC pack) · FE/BE **HOLD** until sponsor opens FE wave |
| **prior_seals** | Leave-balance admin L1 `ATTLVRULEQA-MSK6G783` · invent KEY Network `ATTLVRULEQA2-MSK79F2F` · ATT leave-type / CODE / WS / SHIFT · COMP OTC-03 CLOSED · OT-TYPE L1/FE · FE-ADMIN OT-comp HOLD · DOCS CH05e/CH05g · SRS v0.37/v0.41 — **SEAL / HOLD RETAIN** |
| **prior_sa** | [`ATT-LEAVE-BALANCE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md) Option **B** Nest `att_leave_accrual_policy` **CONFIRMED** — this seat **≠** reopen rule schema |
| **prior_ba** | [`ATT-LEAVE-BALANCE-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md) **AC-PLT-ATT-LEAVE-BAL-01g** already locked — **RETAIN** |
| **peer_cite** | ATT-COMP **R-PLT-ATT-OTC-FE-ADMIN** HOLD RETAIN after OTC-03 CLOSED · OT-TYPE FE-ADMIN HOLD — **cite ≠ copy** · **FORBIDDEN** invent OT-comp FE-ADMIN here |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · F-ATT-LEAVE-04 engine LIVE **HOLD** · formula LIVE **HOLD** · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module ATT UAT · seed · reopen COMP OTC-03 / OT-TYPE / LVRULE L1 |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | Disposition for **R-PLT-ATT-LVRULE-FE-01g** (P2) — unlock BA/FE now vs ACCEPT_AS_IS HOLD |
| **Requestor** | pm · U88 continuous · R2 after INVALID prior SA |
| **Decision owner** | sa |
| **Related** | AC-PLT-ATT-LEAVE-BAL-01g · VAL-ATT-LVRULE-CNS-08 · BR-PLT-ATT-LVRULE-06 · S-ATT-LVRULE-CNS-02 · S-ATT-LVRULE-ADM-01 · QC-02 Condition KEEP HOLD |

### 1.1 Problem — what FE surface is HOLD (AS-IS evidence)

QC-02 closed Condition **R-PLT-ATT-LVRULE-CNS-WIRE** (invent KEY Network LIVE via gated `assert-consumer`). Remaining product Condition:

| Residual ID | Severity | Surface inventory (HOLD) | Proven already (RETAIN) |
|-------------|----------|--------------------------|-------------------------|
| **R-PLT-ATT-LVRULE-FE-01g** | **P2 HOLD** | **(1)** Consumer **panel quỹ** on Nghỉ phép create (`leave-balance-panel` / by-type) — AC-01g: when EFF leave types / policy >0, type source must ⊆ EFF / policy-bound — **not** closed `MVP_LEAVE_BALANCE_TYPES` five-code **sole** SoT · **(2)** Admin FE «**Quy tắc quỹ phép**» Settings/ATT CFG panel — **ABSENT** (L1 admin proven via Network API only) · **(3)** Grant/adjust UI bind to published policy params — invent assert proven on gated assert-consumer **≠** product grant FE | Nest policy CRUD L1 · invent **400 `HRM-ATT-LVRULE-KEY`** · leave-type invent **`HRM-LEAVE-TYPE-UNKNOWN`** · ledger GET leave-balance · DOCS CH05e |

**Code facts (R2 read-only audit — no apps edit this seat):**

| Layer | Fact | Gap vs AC-01g |
|-------|------|---------------|
| BE `leave-balance.service.ts` | `MVP_LEAVE_BALANCE_TYPES` = annual\|seniority\|compensatory\|carry_over\|advance · `getLeaveBalancePanel` iterates fixed five | Panel response still MVP-five sole when open catalog EFF>0 → **VAL-CNS-08 FAIL class** if claimed |
| BE invent KEY | `att-leave-accrual-policy.service` + controller assert-consumer → `HRM-ATT-LVRULE-KEY` | **SEALED** CNS-WIRE CLOSED — **not** this residual |
| FE `leaveBalance.ts` | `resolveLeaveBalanceTypeCodes` prefers catalog when non-empty; MVP fallback when empty | Partial prefer — **not** full AC-01g (BE panel still MVP; policy-bound deepen OUT) |
| FE `LeaveTab.tsx` | Leave **type picker** uses Nest EFF (`useAttLeaveTypesEffective`) · panel still consumes MVP-gated / panel GET | Picker ≠ panel type source SoT |
| FE admin accrual policy | No Settings/ATT CFG «Quy tắc quỹ phép» CRUD surface shipped | Peer **FE-ADMIN HOLD** class (Network L1 OK) |
| Engine / grant product path | F-ATT-LEAVE-04 HOLD · grant invent via assert-consumer only | Product grant FE **OUT** this Condition unless sponsor opens |

**Failure if unresolved badly:** PM invents mandatory FE Task without sponsor (violates QC-02 DENY) · invents OT-comp FE-ADMIN panel «while at it» · reopens COMP OTC-03 / LVRULE L1 · flips `attendance_uat_ready` because panel MVP · claims module ATT UAT from ACCEPT HOLD.

### 1.2 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent FE 01g Task as mandatory (QC-02 · peer FE-ADMIN)
- **DENY** invent OT-comp / OT-TYPE **FE-ADMIN** panel this seat
- **DENY** reopen COMP OTC-03 CLOSED · OT-TYPE L1/FE · leave-balance L1/KEY · ATT CODE/WS/SHIFT/leave-type
- **DENY** flip ready · engine LIVE · formula LIVE · module ATT UAT · Phase1
- BA-01 **AC-01g already exists** — this seat is **disposition**, not redefine rule schema Option B

### 1.3 Decision heuristic

| Rule | Application |
|------|-------------|
| Network L1 + invent KEY CLOSED ≠ FE UF required for honesty | Peer OTC FE-ADMIN HOLD after OTC-03 CLOSED |
| P2 UX deepen with AC already locked → ACCEPT HOLD until sponsor | Prefer **B** over invent BA/FE wave |
| Unlock BA/FE only when sponsor opens FE wave or P0/P1 Condition | **A** is gated alternate, not default |
| REJECT invent OT FE-ADMIN / reopen seals / flip UAT | **C** |

---

## 2. Options

### Option A — Unlock now: ba-process FE surface delta → FE (+ optional BE panel deepen)

| | |
|--|--|
| **Description** | Treat FE 01g as **mandatory continuous wave**: ba-process ADD-only FE inventory (UF-ATT-LEAVE-PANEL · UF-ATT-LVRULE-ADM · grant bind click paths) deepen AC-01g evidence map → unlock `dev-fe` (and likely `dev-be` panel source ⊆ EFF/policy-bound) same program board. |
| **Benefits** | Closes VAL-CNS-08 / AC-01g earlier; aligns HDSD CH05e admin screen with shipped FE; clears board residual FE 01g. |
| **Costs** | Forces FE/BE execution without sponsor FE-wave open; competes with U88 next vertical; risks inventing admin panel scope creep (grant + admin + panel) in one Task. |
| **Risks** | Violates QC-02 **DENY invent FE** unless sponsor opens; idle pressure if BA ships and FE quota busy; may reopen L1 «to finish UF». |
| **Gate** | **Only** if sponsor explicitly opens FE wave in same message — then A becomes unlock path. |

### Option B — ACCEPT_AS_IS_P2 HOLD RETAIN until sponsor opens FE wave — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | **Keep** Condition **R-PLT-ATT-LVRULE-FE-01g** as **P2 HOLD / NOTE** on W8 board. Product integrity for rule SoT + invent KEY remains **SEALED** (L1 + CNS-WIRE). **Do not** invent ba-process AC pack (AC-01g already in BA-01). **Do not** invent `dev-fe` / FE-ADMIN Tasks. Peer class = ATT-COMP **R-PLT-ATT-OTC-FE-ADMIN** HOLD after consumer Condition CLOSED. When sponsor later opens FE wave: reuse BA-01 §6.1 **01g** + §6.4 UF inventory as entry — optional narrow BA ADD only if click-path labels need refresh (not architecture reopen). |
| **Benefits** | Honors QC-02 DENY invent FE · matches peer FE-ADMIN HOLD · preserves U88 continuous bandwidth · honesty / C-SLICE intact · no seal churn. |
| **Costs** | Panel still MVP-five on BE; admin FE ABSENT; VAL-CNS-08 remains deferred FAIL-if-claimed. |
| **Risks** | Misread HOLD as «AC-01g waived forever» → **L-FE-01G-*** mitigations (HOLD ≠ waive AC; deferred until FE wave). |

### Option C — Hybrid invent / waive / reopen / flip / invent OT FE-ADMIN

| | |
|--|--|
| **Description** | Invent FE+admin OT-comp panel now; or mark AC-01g WAIVED without HOLD stamp; or reopen COMP OTC-03 / LVRULE L1 «to fix panel»; or flip `attendance_uat_ready` / claim engine LIVE / seed panel demo. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Seal churn · sponsor trust · C-SLICE violation. |
| **Risks** | **REJECT** — DENY invent OT FE-ADMIN · DENY reopen COMP/OT/LVRULE seals · DENY waive without HOLD · DENY ready flip · DENY seed. |

---

## 3. Trade-off matrix

| Criteria | Weight | A Unlock now | **B ACCEPT HOLD P2** | C Invent/waive/reopen |
|----------|-------:|-------------:|---------------------:|----------------------:|
| Honesty / QC-02 DENY invent FE | 5 | 1 | **5** | 0 |
| Seal safety (COMP·OT·LVRULE L1) | 5 | 3 | **5** | 0 |
| Business value (AC-01g close timing) | 4 | **5** | 2 | 1 |
| U88 continuous bandwidth | 4 | 1 | **5** | 0 |
| Complexity / blast radius | 4 | 2 | **5** | 0 |
| Maintainability (peer FE-ADMIN class) | 4 | 2 | **5** | 1 |
| **Weighted** | | 54 | **112** | 8 |

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | FE invented without sponsor · scope creep admin+grant+panel | Bus DISPATCHED FE without sponsor open | Prefer B; A only with sponsor FE-wave line |
| **B** | HOLD misread as AC waive forever | Evidence claims «01g N/A waived» | Stamp **ACCEPT_AS_IS_P2 HOLD** · AC-01g **RETAIN deferred** · VAL-CNS-08 deferred |
| B | Silent invent OT FE-ADMIN «paired» | Diff Settings OT-comp admin | **FORBIDDEN** · cite OTC FE-ADMIN HOLD |
| C | Ready flip / seal reopen | Honesty matrix | DENY · NO-GO process |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option B** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** (R2 reconfirm) |
| **Disposition** | **ACCEPT_AS_IS_P2 HOLD** on **R-PLT-ATT-LVRULE-FE-01g** |
| **Why B** | Invent KEY + admin L1 already CLOSED; residual is P2 FE/UX deepen (panel MVP sole + ABSENT admin FE + grant UI); QC-02 + peer FE-ADMIN HOLD forbid inventing FE as mandatory; BA-01 already owns AC-01g — no F.1 schema reopen. |
| **Rejected** | **A** as default unlock (retain as sponsor-gated alternate) · **C** invent/waive/reopen/flip |
| **Assumptions** | Sponsor has **not** opened FE wave in this message; ATT-COMP FE-ADMIN remains HOLD; engine LIVE remains HOLD. |

### 5.1 Unlock gates (what Option B does **not** open)

| Question | Answer |
|----------|--------|
| Unlock ba-process new AC pack? | **HOLD** — AC-01g already in BA-01 · **no** duplicate BA seat |
| Unlock ba-data / BE L1 reopen? | **FORBIDDEN** |
| Unlock FE mandatory? | **HOLD** until sponsor opens FE wave |
| Unlock OT-comp FE-ADMIN? | **FORBIDDEN** invent this seat |
| May PM claim AC-01g PASS / module ATT UAT? | **NO** |
| May PM remove Condition from board? | **NO** — keep **HOLD P2** stamp · ACCEPT_AS_IS ≠ CLOSED Condition |

### 5.2 When sponsor later opens FE wave (A alternate — copy-ready gates)

```text
entry: sponsor message contains explicit «mở FE wave LVRULE 01g / panel quỹ / Quy tắc quỹ phép»
retain: L1 ATTLVRULEQA-MSK6G783 · KEY ATTLVRULEQA2-MSK79F2F · COMP OTC-03 · OT-TYPE · FE-ADMIN OT HOLD
task order:
  1) optional ba-process ADD-only UF click-path refresh (NOT redefine AC-01g architecture)
  2) dev-be (if needed): GET leave-balance/panel type source ⊆ EFF leave types / policy-bound when >0
  3) dev-fe: LeaveTab panel bind + optional admin «Quy tắc quỹ phép» (scope BA inventories) — DENY invent OT FE-ADMIN
  4) qa browser U65 UF-ATT-LEAVE-PANEL · VAL-CNS-08 · F5
exit: Condition R-PLT-ATT-LVRULE-FE-01g CLOSED · honesty false RETAIN · C-SLICE
```

---

## 6. Locks (L-FE-01G-*)

| Lock | Rule |
|------|------|
| **L-FE-01G-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 **does not** delete AC-PLT-ATT-LEAVE-BAL-01g · VAL-CNS-08 remains deferred FAIL-if-claimed |
| **L-FE-01G-02 Surfaces in HOLD** | Panel MVP-five sole · admin FE ABSENT · grant product FE OUT — **named** residual only |
| **L-FE-01G-03 Seals RETAIN** | L1 + KEY Network · leave-type UNKNOWN · CODE/WS/SHIFT · COMP OTC-03 · OT-TYPE L1/FE · DOCS CH05e/g |
| **L-FE-01G-04 DENY invent FE** | No mandatory `…-FE-01` / `…-FE-01g` Task without sponsor FE-wave open |
| **L-FE-01G-05 DENY OT FE-ADMIN** | **FORBIDDEN** invent OT-comp / OT-TYPE FE-ADMIN panel from this residual |
| **L-FE-01G-06 Engine / ready** | F-ATT-LEAVE-04 HOLD · attendance/payroll ready **false** · formula HOLD |
| **L-FE-01G-07 Peer class** | Cite COMP **R-PLT-ATT-OTC-FE-ADMIN** HOLD — Network L1 OK without FE admin ship |
| **L-FE-01G-08 C-SLICE** | FE HOLD ACCEPT ≠ module ATT UAT · ≠ Phase1 · ≠ UF 🟢 whole ATT |
| **L-FE-01G-09 R2 path** | Writes only NFD tree where `.git`+`apps` True · WriteAllText UTF-8 no BOM |

```text
  Nest att_leave_accrual_policy L1 + assert-consumer KEY  ──► SEALED (QC-01/02)
  FE admin «Quy tắc quỹ phép»                              ──► ABSENT HOLD (peer FE-ADMIN)
  GET leave-balance/panel MVP-five                        ──► DEFERRED AC-01g (HOLD)
  Leave type picker Nest EFF                              ──► RETAIN (≠ panel SoT claim)
  F-ATT-LEAVE-04 / grant product FE                       ──► ENGINE/FE HOLD
  Invent OT-comp FE-ADMIN                                 ──► FORBIDDEN this seat
```

---

## 7. Impacted systems & non-goals

| In scope (docs disposition) | OUT / FORBIDDEN |
|-----------------------------|-----------------|
| Board residual FE 01g stamp ACCEPT_AS_IS_P2 HOLD | `apps/**` edits · migration · seed |
| Option A/B/C + next_dispatch | Invent OT-comp FE-ADMIN panel |
| Cite BA-01 AC-01g RETAIN | Redefine Nest rule schema Option B |
| Peer FE-ADMIN HOLD class | Flip ready · engine LIVE · reopen COMP OTC-03 |
| U88 PM continue other verticals | Claim module ATT UAT / Phase1 / UF 🟢 |

---

## 8. Validation / acceptance evidence plan

| Checkpoint | PASS when |
|------------|-----------|
| Spec ≥3KB on NFD `.git` toplevel | This file |
| Evidence ≥3KB | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-lvrule-fe-01g-sa-01.md` |
| Option LOCKED | **B** ACCEPT_AS_IS_P2 HOLD |
| next_dispatch | ACCEPT HOLD seal to PM — **not** invent ba-process/FE |
| Honesty | ready=false · engine HOLD · C-SLICE · DENY OT FE-ADMIN invent |
| R2 prove | Lengths printed after WriteAllText · `.git`+`apps` True |

---

## 9. completion_report

**Closed:** Narrow SA Option/F.1 for **R-PLT-ATT-LVRULE-FE-01g** — R2 reconfirm on NFD · inventory HOLD surfaces (panel MVP-five sole · admin FE ABSENT · grant product FE OUT) · Option **A/B/C** · trade-off · **Option B LOCKED ACCEPT_AS_IS_P2 HOLD** · ba-process/FE **HOLD** · AC-01g **RETAIN deferred** · peer FE-ADMIN cite · DENY invent OT FE-ADMIN · DENY reopen COMP/OT/LVRULE seals · honesty false · C-SLICE · no `apps/**`.

**Open / residual:** Condition **R-PLT-ATT-LVRULE-FE-01g** remains **HOLD P2** on board until sponsor FE-wave; engine LIVE HOLD; ready flags false.

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM** · **CONFIRMED**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-lvrule-fe-01g-sa-01.md`

### next_dispatch_prompt (copy-ready — ACCEPT HOLD)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01-R2
from_role: sa
to_role: pm
lane: governance · U88
ack_status: PASS_TO_PM
verdict: Option B LOCKED — ACCEPT_AS_IS_P2 HOLD on R-PLT-ATT-LVRULE-FE-01g
action:
  1) Seal board residual FE 01g = ACCEPT_AS_IS_P2 HOLD (Condition KEEP — not CLOSED; not WAIVED)
  2) DENY invent ba-process / FE / OT-comp FE-ADMIN Tasks from this residual
  3) RETAIN: LVRULE L1+KEY · COMP OTC-03 CLOSED · OT-TYPE · ATT seals · FE-ADMIN OT HOLD · honesty false · engine HOLD · C-SLICE
  4) Continue U88 next vertical/governance per continuous board (not invent LVRULE FE)
sponsor_gated_reopen_only: explicit «mở FE wave LVRULE 01g» → then Option A path (optional BA ADD click-path → BE panel EFF bind → FE → QA VAL-CNS-08)
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-FE-01G-SA-01.md
         docs/qa/evidence/po-hrm-dynamic-config-platform-att-lvrule-fe-01g-sa-01.md
```

**DENY alternate:** invent `…-ATT-LEAVE-BALANCE-FE-01` / `…-FE-01g` / OT-comp FE-ADMIN · reopen COMP OTC-03 · flip `attendance_uat_ready` · claim AC-01g PASS.