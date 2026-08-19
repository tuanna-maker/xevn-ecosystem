# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATTENDANCE-CLOSED-HOLD-SA-01 — Option/F.1 · `attendance_closed` program honesty HOLD (W8 U88)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATTENDANCE-CLOSED-HOLD-SA-01` |
| **Parent** | U88 continuous honesty registry · after **`FACE-LIVE-HOLD-SA-01`** SEALED (Option A · **`R-PLT-FACE-LIVE-01`** · SPEC **30710**) · peer **`REMASTER-DONE-HOLD-SA-01`** · **`ATT-UAT-HOLD-SA-01`** · **`ATT-E2E-LINKAGE-HOLD-SA-01`** · W8 ATT catalog + sign slices |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous governance · ATT platform dynamic config + BP sign spine |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for program honesty flag **`attendance_closed=false`** — formalize **LIVE** ATT catalog consumers · OT/COMP/CODE FE CLOSED · leave catalog · J-HRM-06c GWC · UF-HRM-ATT-SIGN GO vs **forbidden** program Attendance CLOSED / module UAT-READY / Phase1 DONE |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · mint **`R-PLT-ATTENDANCE-CLOSED-01`** · **DENY** flip `attendance_closed=true` · **DENY** conflate **FE slice CLOSED** with **program attendance_closed** |
| **residual_id** | **`R-PLT-ATTENDANCE-CLOSED-01`** *(minted this seat — consolidates program Attendance closure honesty + ATT slice inventory + peer module/e2e flags + WAIVE ladder RETAIN)* |
| **peer_cite_face** | [`FACE-LIVE-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-FACE-LIVE-HOLD-SA-01.md) · **`face_live=false`** · **RETAIN** · **DENY** bundle flip |
| **peer_cite_att_uat** | [`ATT-UAT-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01.md) · **`R-PLT-ATT-UAT-01`** · **`attendance_uat_ready=false`** |
| **peer_cite_att_e2e** | [`ATT-E2E-LINKAGE-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-E2E-LINKAGE-HOLD-SA-01.md) · **`R-PLT-ATT-E2E-LINK-01`** · **`attendance_e2e_linkage_ready=false`** |
| **peer_cite_remaster** | [`REMASTER-DONE-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REMASTER-DONE-HOLD-SA-01.md) · **`remaster_program_done=false`** |
| **Honesty** | **`attendance_closed=false`** · **`attendance_uat_ready=false`** · **`attendance_e2e_linkage_ready=false`** · **`face_live=false`** · **`remaster_program_done=false`** · **`product_go=false`** · five module + three companion flags false · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** Attendance module CLOSED · ATT UAT-READY · Phase1 DONE from catalog/sign slices |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

> **HARD EXIT GATE:** NFD path · UTF-8 **no BOM** · Shell **Length ≥ 8192** verified before CONFIRMED. Empty turn = INVALID.

---

## 1. Decision context (ADR option pack §1)

| | |
|--|--|
| **Decision title** | Formalize program honesty: **`attendance_closed=false`** HOLD vs sponsor-gated **Attendance module closure / full ATT UAT sign-off** wave vs invent flip from **L1 catalog GWC · FE consumer CLOSED · ATT-SIGN UF GO · J-06c GWC** |
| **Requestor** | pm · U88 after FACE-LIVE-HOLD-SA-01 SEALED · next program honesty vertical |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-ATT-* · AC-PLT-ATT-* · UF-HRM-ATT-SIGN · J-HRM-06 · J-HRM-06b · J-HRM-06c · WAIVE_L2_PHASE1 · LV-02 WAIVED_P1 · ATT platform W8 chain · brand ATT remaster slices |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + **§9 F.1** |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-ATTENDANCE-CLOSED-HOLD-SA-01` |

### 1.1 Problem — what ATT slices proved vs what `attendance_closed` still means

Under U65 and W8 continuous honesty, the program delivered **substantial ATT platform and consumer slices**:

- **Platform catalog L1** — leave-type · work-sites · attendance codes · work_shifts · LVRULE KEY · OT type · OT compensation_type — multiple **GWC SEALED** stamps.
- **FE consumer CLOSED** — Nest EFF rebind for CODE · SHIFT CNS-02 · COMP OTC-03 · OT paths — evidence rows say **«FE CLOSED»** meaning **slice wire closure**, not program **`attendance_closed=true`**.
- **UF-HRM-ATT-SIGN** — QC R2 **GO** on browser UF lane (UC-BP-ATT-11) with explicit **NOT Attendance module CLOSED** footer.
- **J-HRM-06c** — **FULL GWC** with optional OBS on one-session sign→close; still **`attendance_closed=false`** on all gates.
- **WAIVE ladder** — **WAIVE_L2_PHASE1** sealed · direct_manager one-step · **RETAIN** · does not imply module closure.

**Question for F.1:** Should SA recommend **`attendance_closed=true`** because many ATT catalog UF rows passed QC, FE consumer stamps read «CLOSED», or ATT-SIGN UF GO exists, or **LOCK Option A HOLD** until sponsor opens a **named Attendance module closure wave** (full J-HRM-06* matrix · timesheet AGG class · engine HOLD resolution · module UAT QC · journey map ATT spine)?

**Answer (LOCKED):** **Option A** — **L1 catalog LIVE** · **FE slice CLOSED** · **UF-SIGN GO** **≠** **`attendance_closed=true`**. **UNLOCK flag flip only** when sponsor message opens **explicit Attendance module CLOSED / ATT program closure wave** with UF/J-* inventory + QC GO on **module** scope — else **HOLD forever-until-sponsor**.

This seat **formalizes intentional program honesty** — **not** stale documentation after ATT GWC.

### 1.2 LIVE inventory — RETAIN (do not reopen as FAIL pretext for flip)

These surfaces are **LIVE** and **RETAIN** — they are **not** arguments to set **`attendance_closed=true`**:

| Vertical | Surface / stamp | Evidence class | Verdict |
|----------|-----------------|----------------|---------|
| **Leave-type catalog L1** | Nest open catalog · U65 AC-PLT-ATT-LEAVE | **`ATTLEAVEQA-MSJ7CPJH`** 9/9 GWC | **L1 LIVE** · **≠ attendance_closed** |
| **Attendance codes L1 + FE** | invent KEY · Nest Edit PATCH | **`ATTCODEQA-MSK4T1A5`** · **`ATTCODEQAFE-MSKCJA95`** FE **CLOSED** | **Slice CLOSED** · **≠ program flag** |
| **Work shifts L1 + CNS-02 FE** | ShiftChange rebind | **`ATTSHIFTQA-MSK5FXP3`** · **`ATTSHIFTQAFE-MSK6AJ8Z`** | **Slice LIVE/CLOSED** · **≠ module CLOSED** |
| **OT type L1** | att_ot_type invent KEY | **`ATTOTQA-MSK8VETU`** | **L1 LIVE** |
| **OT compensation_type** | OTC-03 Nest FE | QC-FE OTC-03 **CLOSED** | **FE slice CLOSED** · **≠ attendance_closed** |
| **Work-sites L1 + CNS-05** | GPS method FE | **`ATTWSQA-MSJC3IN9`** · **`ATTWSQA2-MSJCG47P`** | **L1 LIVE** · SITE-UNKNOWN HOLD RETAIN |
| **LVRULE policy L1** | invent KEY · CNS-WIRE | **`ATTLVRULEQA*`** GWC | **Admin L1** · **engine HOLD** RETAIN |
| **UF-HRM-ATT-SIGN** | UC-BP-ATT-11 browser UF | [`po-hrm-bp-att-sign-qc-01-r2.md`](../../qa/evidence/po-hrm-bp-att-sign-qc-01-r2.md) **GO** | **UF lane GO** · **NOT module CLOSED** |
| **J-HRM-06c** | Sign funnel + draft submit | QC R2 · OBS optional full e2e | **Journey GWC** · **flag false on footer** |
| **WAIVE_L2 ladder** | Phase-1 direct_manager | Bus confirm · SRS v0.14 | **Policy LIVE** · **≠ closure** |
| **Brand ATT remaster** | W3 ATT-A..G2 · W4 ATT-DIALOG-EXT | Brand QC GWC | **Chrome C-SLICE** · **attendance_closed false** |
| **ATT platform browser spot** | ATTPLATQA2 | GWC spot | **C-SLICE** · honesty false |

**Critical discrimination (mission LIVE vs DENY):**

| Claim | Allowed? | Why |
|-------|----------|-----|
| «Leave catalog L1 GWC PASS» | **YES** | Named stamp |
| «ATTCODEQAFE / OTC-03 / CNS-02 FE **CLOSED**» | **YES** as **slice wire** | **L-ATT-CLOSED-04** FE CLOSED ≠ program flag |
| «UF-HRM-ATT-SIGN QC GO R2» | **YES** | Narrow UF scope |
| «J-HRM-06c GWC with OBS footnote» | **YES** | Journey slice |
| «WAIVE_L2_PHASE1 sealed» | **YES** | Ladder policy RETAIN |
| «Set **`attendance_closed=true`** from catalog or sign UF» | **NO** | QC **explicitly denied** |
| «Claim **Attendance module CLOSED** or ATT UAT-READY» | **NO** | **`R-PLT-ATTENDANCE-CLOSED-01` HOLD** |
| «Claim **Phase1 DONE** from ATT slices» | **NO** | **`product_go=false`** |
| «Flip because evidence says FE CLOSED» | **NO** | **Vocabulary collision** — see §1.5 |
| «Bundle flip with face_live / remaster / uat_ready» | **NO** | Peer seats |

### 1.3 OPEN depth — supports flag false (not product broken)

| OPEN class | Description | Honesty impact |
|------------|-------------|----------------|
| **Module ATT UAT matrix** | **`attendance_uat_ready=false`** · **`R-PLT-ATT-UAT-01`** | **Distinct gate** · catalog LIVE OK |
| **ATT e2e spine** | **`attendance_e2e_linkage_ready=false`** · **`R-PLT-ATT-E2E-LINK-01`** | **Distinct gate** |
| **LVRULE accrual engine** | **`R-PLT-ATT-LVRULE-ENGINE-01`** HOLD | **≠ closure** |
| **SITE-UNKNOWN punch** | **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** | **≠ worksite catalog done** |
| **Timesheet AGG / sheet depth** | Residual class on bus | **Module spine OPEN** |
| **OBS-J-HRM-06c-FULL-E2E** | One-session sign→close optional | **≠ attendance_closed flip** |
| **Face product** | **`face_live=false`** | **Orthogonal** |
| **Full remaster** | **`remaster_program_done=false`** | **Orthogonal** |
| **FE-ADMIN HOLD pack** | Multiple R-PLT-ATT-*-FE-ADMIN-01 | **P2 NOTE** · not closure gate |

### 1.4 FORBIDDEN by `attendance_closed=false` (program honesty gate)

| Blocked claim | Detection | Mitigation |
|---------------|-----------|------------|
| **Attendance module CLOSED** | PM matrix / SERVICE_READINESS | Cite this SPEC + ATT QC honesty tables |
| Flip flag from L1 GWC or FE CLOSED alone | Bus diff on honesty JSON | SA **REJECT** · Option C |
| **ATT UAT-READY** from catalog/sign | Release narrative | QC NO-GO · peer **`R-PLT-ATT-UAT-01`** |
| **Phase1 DONE / product GO** from ATT wave | Program gates | **`product_go=false` RETAIN** |
| Conflate **QC stamp «FE CLOSED»** with **program flag** | Evidence misread | **L-ATT-CLOSED-04** |
| Reopen sealed ATT L1 GWC as FAIL pretext | Duplicate QA | **FORBIDDEN** |
| Bundle flip **attendance_uat_ready** + **attendance_closed** | Dual promote | Separate sponsor waves |
| Claim **TechSpec S3 GO / Attendance CLOSED** from bus history | Old must_keep | **RETAIN false** |
| **`apps/**`** patch to «fix honesty» | PM dispatch | **DENIED** this seat |

### 1.5 Vocabulary lock — «FE CLOSED» vs `attendance_closed` (architecture invariant)

| Term | Layer | Meaning | Flips program flag? |
|------|-------|---------|---------------------|
| **`R-PLT-ATT-CODE-FE-01` CLOSED** | Slice residual | Wire Nest EFF for codes admin consumer | **NO** |
| **`OTC-03 CLOSED`** | Slice QC condition | Compensation type FE bind proven | **NO** |
| **`CNS-02 CLOSED`** | Slice QC condition | Shift picker rebind proven | **NO** |
| **`attendance_closed`** | **Program honesty JSON** | **Entire Attendance module closure** sponsor gate | **Only sponsor ATT closure wave + QC** |
| **`attendance_uat_ready`** | Module honesty | Module UAT matrix ready | **Separate · peer ATT-UAT-HOLD** |
| **UF-HRM-ATT-SIGN GO** | UF lane | UC-BP-ATT-11 browser proven | **NO** — evidence says not module CLOSED |

PM/QC **must** use **program flag** vocabulary in release narrative; **slice CLOSED** remains valid QC shorthand **without** promoting **`attendance_closed=true`**.

### 1.6 Honesty flag registry (program gate — peer to module/companion pack)

| Flag key | AS-IS | This seat |
|----------|-------|-----------|
| **`attendance_closed`** | **false** (W3/W4/ATT/sign grep-locked) | **Primary subject** · mint **`R-PLT-ATTENDANCE-CLOSED-01`** |
| **`attendance_uat_ready`** | **false** · **`R-PLT-ATT-UAT-01`** | **Peer RETAIN** · **DENY** infer CLOSED from UAT |
| **`attendance_e2e_linkage_ready`** | **false** · **`R-PLT-ATT-E2E-LINK-01`** | **Peer RETAIN** |
| **`face_live`** | **false** · **`R-PLT-FACE-LIVE-01`** | **Peer RETAIN** |
| **`remaster_program_done`** | **false** · **`R-PLT-REMASTER-DONE-01`** | **Peer RETAIN** |
| **`product_go`** | **false** | **Peer RETAIN** |
| **Five module `*_ready`** | **false** · honesty pack synth | **RETAIN** |
| **Three companion `*_ready`** | **false** · companion pack synth | **RETAIN** |
| **`C-SLICE-≠-MODULE`** | **true** (doctrine) | **RETAIN** |

PM must not promote **`attendance_closed=true`** while module UAT · e2e linkage · engine HOLD · AGG residuals · full J-HRM-06* depth remain open without explicit QC scope for **Attendance module closure** — default **`attendance_closed=false`** until sponsor ATT closure wave.

### 1.7 RETAIN peer HOLDs (do not reopen as attendance_closed unlock)

| Residual / stamp | Spec / evidence | Rule |
|------------------|-----------------|------|
| **`R-PLT-ATT-UAT-01`** | ATT-UAT-HOLD | Module UAT **distinct** from closure flag |
| **`R-PLT-ATT-E2E-LINK-01`** | ATT-E2E-HOLD | E2e spine **distinct** |
| **`R-PLT-ATT-LVRULE-ENGINE-01`** | LVRULE-ENGINE | Engine deferred |
| **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** | SITE-UNKNOWN | Punch consumer gap |
| **`R-PLT-FACE-LIVE-01`** | FACE-LIVE-HOLD | Face **≠** ATT CLOSED |
| **`R-PLT-REMASTER-DONE-01`** | REMASTER-DONE-HOLD | Brand **≠** ATT CLOSED |
| **ATT L1 GWC stamps** | ATTCODE/SHIFT/LEAVE/… | **SEAL RETAIN** |
| **ATT-SIGN QC R2 GO** | po-hrm-bp-att-sign-qc-01-r2 | **UF scope only** |
| **WAIVE_L2_PHASE1** | leave ladder docs | **RETAIN** policy |

### 1.8 READ-ONLY apps cite (attendance spine — no edit)

| Symbol | Path (read-only) | Role |
|--------|------------------|------|
| Nest attendance module | `apps/api/hrm-api/src/attendance/*` | Catalog · sheet · sign services |
| Sheet sign | `attendance-sheet-sign.service.ts` | UF-SIGN backend spine |
| FE attendance | `apps/web/hrm/src/pages/Attendance*.tsx` | Consumers + admin partial |
| Catalog extensions | `catalog-extensions.service.ts` | Platform L1 patterns |

Audit finding: **Substantial ATT platform + UF-SIGN + FE consumer slices are LIVE** — yet **every** gate artifact repeats **`attendance_closed=false`**. SA **confirms** intentional honesty (module matrix · e2e · engine · AGG OPEN), **not** documentation drift or forgotten flip after «FE CLOSED» stamps.

---

## 2. Problem to solve (ADR §2)

- **Current state:** W8 sealed **many** ATT L1 catalog and FE consumer GWC rows while **every** honesty registry line repeats **`attendance_closed=false`** and forbids Attendance module CLOSED · ATT UAT-READY · Phase1 DONE · product GO.
- **Constraints:** U65 · honesty flags false · C-SLICE · DENY seed · DENY reopen sealed ATT GWC as FAIL · DENY bundle multi-flag promote · DENY confuse **slice FE CLOSED** with **program attendance_closed** · DENY claim module closure from UF-SIGN alone.
- **Failure impact if mis-resolved:** PM sets **`attendance_closed=true`** because QC row title contains «FE CLOSED» or ATT-SIGN GO → false PROD/UAT narrative · SERVICE_READINESS drift · violates **`R-PLT-ATT-UAT-01`** · sponsor trust loss on «catalog slice ≠ module CLOSED».

---

## 3. Options (ADR §3)

### Option A — ACCEPT_AS_IS_P2 HOLD (forever-until-sponsor) — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint **`R-PLT-ATTENDANCE-CLOSED-01`** · formalize **`attendance_closed=false`** as **intentional P2 HOLD** · document **LIVE** ATT catalog · FE consumer CLOSED · sign UF · J-06c vs **forbidden** module CLOSED flip · **no** execution unlock · **no** `apps/**` |
| **Benefits** | Aligns with all ATT/sign QC must_keep · honors W8 continuous honesty LOCK · clarifies FE CLOSED vocabulary · zero product churn |
| **Costs** | Attendance module closure narrative remains sponsor-gated |
| **Risks** | HOLD misread as «ATT broken» → mitigated by §1.2 LIVE table |
| **Gate** | ATT/sign QC PASS_TO_PM with explicit false flags — **true** |

### Option B — UNLOCK `attendance_closed=true` from L1 GWC / FE CLOSED / ATT-SIGN GO

| | |
|--|--|
| **Description** | Override Option A because catalog slices passed or UF-SIGN GO or FE stamps say CLOSED. |
| **Benefits** | None without sponsor ATT module closure UF wave |
| **Costs** | Violates QC must_keep · C-SLICE breach · collapses distinction with **`attendance_uat_ready`** |
| **Risks** | QC NO-GO · false release narrative |
| **Gate** | **REJECT default** — no sponsor ATT closure message |

### Option C — REJECT invent / reopen / flip / module CLOSED claim

| | |
|--|--|
| **Description** | Flip **`attendance_closed=true`** · claim Attendance module CLOSED · ATT UAT-READY · Phase1 DONE · product GO · reopen ATT L1 GWC · bundle uat/e2e/face/remaster flags · seed · **`apps/**`** from HOLD seat. |
| **Benefits** | None |
| **Costs** | Seal loss · trust breach |
| **Risks** | QC NO-GO class · U65 violation |
| **Gate** | **DENY** (mission lock) |

---

## 4. Trade-off matrix (ADR §4)

| Criteria | Weight | Option A HOLD | Option B flip | Option C invent |
|---|--:|--:|--:|--:|
| ATT/sign QC honesty / must_keep integrity | 5 | **5** | 0 | 0 |
| W8 continuous policy compliance | 5 | **5** | 0 | 0 |
| Clarity slice CLOSED vs program attendance_closed | 5 | **5** | 1 | 0 |
| Peer ATT-UAT / ATT-E2E integrity | 4 | **5** | 0 | 0 |
| Sponsor trust (intentional HOLD) | 4 | **5** | 0 | 0 |
| Time to module closure | 3 | 3 | **4** | 1 |
| Delivery cost now | 4 | **5** | 2 | 0 |
| WAIVE ladder + J-06c seal integrity | 4 | **5** | 1 | 0 |
| **Weighted tendency** | | **Dominates** | Reject | Reject |

---

## 5. Failure modes and mitigation (ADR §5)

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | «ATTCODEQAFE CLOSED ⇒ flip attendance_closed» | Bus promote | **L-ATT-CLOSED-04** + this SPEC |
| A | «ATT-SIGN GO ⇒ module CLOSED» | Release notes | Cite UF scope footer on R2 evidence |
| A | User thinks ATT completely blocked | Support | Cite §1.2 LIVE catalog table |
| A | PM drops attendance_closed row | Board scan | **`R-PLT-ATTENDANCE-CLOSED-01`** mint |
| B | False ATT UAT-READY narrative | QC audit | NO-GO · peer ATT-UAT HOLD |
| C | Reopen L1 GWC as FAIL pretext | Duplicate QA | **FORBIDDEN** |
| C | Bundle attendance_closed + uat_ready flip | Dual promote | Separate sponsor waves |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_P2 HOLD** |
| **Why** | W8 ATT L1 + FE consumer + UF-SIGN + J-06c evidence **mandates `attendance_closed=false`** on honesty footers while proving **bounded slices**. Module UAT · e2e · engine · AGG remain **open** via peer residuals. **FE slice CLOSED** **≠** **program attendance_closed=true**. |
| **Assumptions** | Sponsor did not open «Attendance module CLOSED / đóng attendance_closed» wave with UF inventory in this message. |
| **Rejected** | **Option B** flag flip · **Option C** full DENY list |

### 6.1 Unlock gates (Option A does not open)

| Question | Answer |
|----------|--------|
| Flip **`attendance_closed=true`** now? | **NO** |
| Flip **`attendance_uat_ready`** / **`attendance_e2e_linkage_ready`** via this seat? | **NO** |
| Flip **`face_live`** / **`remaster_program_done`** / **`product_go`** via this seat? | **NO** |
| Claim **Attendance module CLOSED** from UF-SIGN GO? | **NO** |
| Reopen sealed ATT L1 GWC? | **FORBIDDEN** |
| Dispatch dev-be/fe for «close attendance_closed» from HOLD alone? | **NO** default |

### 6.2 Sponsor-gated narrow alternate (not default)

```text
entry: sponsor message explicit «mở wave đóng Attendance module / attendance_closed=true» + named UF-IDs (full J-HRM-06* matrix · timesheet AGG closure class · engine/SITE-UNKNOWN policy if in scope · module UAT QC co-sign · persona matrix · U65 browser evidence plan)
retain: all L1 GWC seals · UF-SIGN GO scope · WAIVE_L2 ladder · FE slice CLOSED stamps · peer uat/e2e false until their waves · face_live/remaster/product_go false until their waves
scope_allowed: QA browser matrix per UF · QC program gate on Attendance MODULE closure scope (not L1 catalog alone) · THEN pm may set attendance_closed=true with QC sign-off on module closure scope only
scope_FORBIDDEN: flip from FE CLOSED vocabulary alone · flip from UF-SIGN alone · flip from catalog L1 alone · reopen L1 GWC · seed · bundle uat/e2e/face/remaster flags without separate sponsor waves
exit: R-PLT-ATTENDANCE-CLOSED-01 may CLOSE or narrow; requires QC GO on module closure scope — not catalog slice alone
```

### 6.3 Architecture boundary (text diagram)

```text
  ATT L1 catalogs (leave/code/shift/ot/comp/ws/lvrule KEY) --> LIVE slices · attendance_closed false RETAIN
  FE consumer CLOSED (CODE/SHIFT/COMP wires)              --> LIVE slice seals · ≠ program flag true
  UF-HRM-ATT-SIGN QC GO R2                                --> LIVE UF lane · ≠ module CLOSED
  J-HRM-06c GWC (+ optional OBS)                          --> LIVE journey slice · flag false RETAIN
  WAIVE_L2_PHASE1 ladder                                  --> LIVE policy · ≠ closure
  attendance_uat_ready + attendance_e2e_linkage_ready       --> false RETAIN (peer seats)
  LVRULE engine + SITE-UNKNOWN + AGG class                --> OPEN · support flag false
  attendance_closed                                       --> false RETAIN (R-PLT-ATTENDANCE-CLOSED-01)
  face_live · remaster_program_done · product_go            --> false RETAIN (peer seats)
  C-SLICE-≠-MODULE                                        --> RETAIN
```

---

## 7. Implementation and validation plan (ADR §7)

| Step | Owner | Action |
|------|-------|--------|
| 1 | pm | Seal board row **CONFIRMED** · append **`R-PLT-ATTENDANCE-CLOSED-01`** HOLD P2 |
| 2 | pm | **Do not** set **`attendance_closed=true`** · **Do not** dispatch module closure unlock from this seat alone |
| 3 | sa **or** ba-process | **Optional** ADD **`attendance_closed`** row to reopen-gate / program honesty inventory — **no** flip flags |
| 4 | qc | Any future `attendance_closed` promote requires **module closure** UF evidence — not L1/FE CLOSED alone |
| Rollback | sa | If flag flipped wrongly — CORRECTION bus · restore false · cite this SPEC |
| Validation | qa | Module closure wave must be U65 browser UF matrix when sponsor opens |
| Success | pm | SPEC_LEN ≥8192 NFD · PASS_TO_PM · honesty unchanged |

---

## 8. Locks (L-ATT-CLOSED-*)

| Lock | Rule |
|------|------|
| **L-ATT-CLOSED-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 does not delete ATT ACs · deferred **module closure** only |
| **L-ATT-CLOSED-02 Slices LIVE** | Catalog + consumer evidence **RETAIN** |
| **L-ATT-CLOSED-03 Flag false** | **DENY** PM/dev flip without sponsor closure wave + QC |
| **L-ATT-CLOSED-04 FE CLOSED ≠ flag** | QC «FE CLOSED» = slice wire · **not** program attendance_closed |
| **L-ATT-CLOSED-05 UF-SIGN scope** | ATT-SIGN GO **≠** module CLOSED |
| **L-ATT-CLOSED-06 Peer uat/e2e** | **DENY** infer CLOSED from uat_ready true (both false today) |
| **L-ATT-CLOSED-07 Peer program gates** | **DENY** bundle face_live · remaster · product_go flip with attendance alone |
| **L-ATT-CLOSED-08 C-SLICE** | L1 GWC **≠** module CLOSED GO |
| **L-ATT-CLOSED-09 Path lock** | UTF-8 no BOM NFD write gate |

---

## 9. F.1 physical notes (read-only — disposition only)

| Layer | Mục đích (VI) | Slice status today | Honesty impact |
|-------|---------------|--------------------|----------------|
| **FE catalog consumers** | Rebind Nest EFF cho mã ca · OT · compensation | **CLOSED** slice QC | **≠** attendance_closed true |
| **Nest L1 catalogs** | Open catalog invent KEY platform ATT | **LIVE** L1 | **≠** module CLOSED |
| **Sheet sign UF** | Ký/chốt bảng công embed | **UF GO** R2 | **≠** module CLOSED |
| **Leave ladder** | WAIVE L2 Phase-1 one-step | **Policy LIVE** | **≠** closure |
| **Program registry** | attendance_closed JSON honesty | **false RETAIN** | **This seat mints R-PLT-ATTENDANCE-CLOSED-01** |

No new API_DESIGN rows required this seat — **disposition + program honesty governance only**.

### 9.1 F.1 disposition summary

| Layer | This seat |
|-------|-----------|
| **DB** | **No** change · honesty flag is **program/registry** |
| **API** | **No** change · OPEN spine documented only |
| **FE** | **RETAIN** consumer CLOSED stamps · **no** honesty JSON patch from SA |
| **Program** | **`attendance_closed=false`** intentional until sponsor module closure wave |

---

## 10. Evidence index (RETAIN — grep-backed)

| Evidence path | Stamp / verdict | Honesty line |
|---------------|-----------------|--------------|
| `docs/qa/evidence/po-hrm-bp-att-sign-qc-01-r2.md` | UF-SIGN GO R2 | attendance_closed=false · not module |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qc-fe-01.md` | FE CLOSED | slice · not program flag |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-fe-01.md` | OTC-03 CLOSED | slice |
| `docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md` | W3 GWC | attendance_closed=false |
| `docs/qa/evidence/po-hrm-ui-brand-w4-qc-01.md` | W4 GWC | attendance_closed=false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01.md` | R-PLT-ATT-UAT-01 | uat_ready peer |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-E2E-LINKAGE-HOLD-SA-01.md` | R-PLT-ATT-E2E-LINK-01 | e2e peer |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-FACE-LIVE-HOLD-SA-01.md` | R-PLT-FACE-LIVE-01 | face peer |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | Board row | DISPATCHED → CONFIRMED |
| `docs/program/AGENT_MESSAGE_BUS.md` | must_keep lines | attendance_closed false |

---

## 11. Trace to program board (W8)

| Board row | Status | Action |
|-----------|--------|--------|
| ATT L1 catalog chain | GWC SEALED | **RETAIN** · **≠** attendance_closed true |
| ATT-SIGN UF QC R2 | GO | **RETAIN** UF scope |
| FACE-LIVE-HOLD-SA-01 | CONFIRMED | **RETAIN** peer |
| ATT-UAT / ATT-E2E HOLD | CONFIRMED | **RETAIN** peers |
| **ATTENDANCE-CLOSED-HOLD-SA-01** | **this seat** | Option A LOCK · mint **`R-PLT-ATTENDANCE-CLOSED-01`** |

---

## 12. Discrimination matrix (PM / QC)

| Evidence | Flip `attendance_closed`? | Why |
|----------|---------------------------|-----|
| **L1 catalog GWC** | **NO** | C-SLICE · peer uat HOLD |
| **FE stamp «CLOSED»** | **NO** | **L-ATT-CLOSED-04** |
| **UF-HRM-ATT-SIGN GO** | **NO** | UF lane only |
| **J-HRM-06c GWC** | **NO** | Journey slice · OBS ok |
| **WAIVE_L2 sealed** | **NO** | Policy · not closure |
| Sponsor ATT module closure wave + QC GO module scope | **YES** (future) | §6.2 only |

---

## 13. RETAIN stamps (ATT · honesty · peers)

| Stamp / residual | Action |
|------------------|--------|
| **ATT L1 + FE consumer seals** | **SEAL RETAIN** |
| **UF-SIGN GO R2** | **SEAL RETAIN** |
| **J-HRM-06c GWC** | **SEAL RETAIN** |
| **WAIVE_L2_PHASE1** | **RETAIN** |
| **`R-PLT-ATTENDANCE-CLOSED-01`** | **HOLD mint this seat** |
| **`attendance_closed`** | **false RETAIN** |
| **`R-PLT-ATT-UAT-01`** · **`R-PLT-ATT-E2E-LINK-01`** | **HOLD peer RETAIN** |
| **`R-PLT-FACE-LIVE-01`** · **`R-PLT-REMASTER-DONE-01`** | **HOLD peer RETAIN** |
| **`product_go`** · eight pack flags | **false RETAIN** |
| **`C-SLICE-≠-MODULE`** | **RETAIN** |

---

## 14. Non-goals (explicit)

1. Do not set **`attendance_closed=true`** without sponsor module closure wave.
2. Do not claim **Attendance module CLOSED** from catalog L1 or UF-SIGN alone.
3. Do not conflate **FE slice CLOSED** with **program attendance_closed**.
4. Do not flip **`attendance_uat_ready`** or **`attendance_e2e_linkage_ready`** from this seat.
5. Do not reopen ATT L1 GWC seals.
6. Do not set **`product_go=true`** or claim Phase1 DONE from ATT slices.
7. Do not bundle flip honesty flags on one bus line.
8. Do not seed ATT matrix (U65).
9. Do not edit `apps/**` in this seat.
10. Do not treat **`attendance_closed=false`** as stale docs — **intentional HOLD**.

---

## 15. Handback packet (mandatory)

| Field | Value |
|-------|--------|
| **completion_report** | Program honesty **`attendance_closed=false`** formalized as Option **A LOCKED** · mint **`R-PLT-ATTENDANCE-CLOSED-01`** ACCEPT_AS_IS_P2 HOLD · documented **LIVE** ATT catalog · OT/COMP/CODE FE CLOSED · leave · J-06c · ATT-SIGN UF · WAIVE ladder vs **forbidden** module CLOSED flip · **DENY** FE CLOSED vocabulary collision · **RETAIN** att uat/e2e · face · remaster · product_go · packs · no `apps/**`. |
| **selected_option** | **Option A** — ACCEPT_AS_IS_P2 HOLD |
| **residual** | **`R-PLT-ATTENDANCE-CLOSED-01`** = **HOLD** P2 |
| **SPEC_LEN** | Verified NFD UTF-8 no BOM · gate ≥8192 bytes (target ≥12288) |
| **next_owner** | **pm** — seal W8 row CONFIRMED · optional **sa** product_go HOLD **or** honesty-pack synth **or** **ba-process** BA-05 ADD |
| **next_dispatch_prompt** | See §16 |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATTENDANCE-CLOSED-HOLD-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 16. next_dispatch_prompt (copy-ready — U88)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATTENDANCE-CLOSED-HOLD-SA-01
from_role: sa
to_role: pm
lane: governance · U88
priority: P2
entry_criteria: SPEC PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATTENDANCE-CLOSED-HOLD-SA-01 PASS_TO_PM · Option A LOCK · mint R-PLT-ATTENDANCE-CLOSED-01 · SPEC_LEN verified ≥8192 NFD
exit_criteria: Seal W8 board row CONFIRMED · append residual R-PLT-ATTENDANCE-CLOSED-01 HOLD P2 · honesty unchanged (attendance_closed=false · attendance_uat_ready=false · attendance_e2e_linkage_ready=false · face_live=false · remaster_program_done=false · product_go=false · eight pack flags false)
optional_parallel (pick one — not all required for idle-ok):
  A) work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PRODUCT-GO-HOLD-SA-01 · sa · formalize product_go=false HOLD (last program honesty vertical)
  B) work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-HONESTY-PROGRAM-PACK-SYNTH-SA-03 · sa · rollup attendance_closed + face + remaster + product_go registry index
  C) work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-BA-05 · ba-process · ADD-only rows #25-27 attendance_closed + program honesty UF placeholders (no flip)
cấm: flip attendance_closed · claim Attendance module CLOSED from catalog/sign/FE CLOSED · reopen ATT L1 GWC · bundle uat/e2e/face/remaster flip · apps/** · seed
ack_status target: PASS_TO_PM (program seal) or IDLE-OK honesty vertical complete
evidence_path: docs/program/TEAM_WORKING_NOW.md + docs/program/PO_HRM_CONTINUOUS_W8_20260807.md delta
```

---

## 17. SA knowledge append (reuse-tag)

| Context | W8 program honesty vertical after FACE-LIVE-HOLD seal |
| Action | Option A LOCK mint R-PLT-ATTENDANCE-CLOSED-01 |
| Outcome | attendance_closed=false intentional · FE CLOSED slice ≠ program flag |
| Evidence | This SPEC path |
| Reuse-tag | attendance-closed-honesty-hold, r-plt-attendance-closed-01, fe-closed-neq-program-flag, att-sign-uf-neq-module-closed, catalog-live-neq-att-closed, j-06c-gwc-neq-closed, att-uat-e2e-peer-retain, deny-invent-flip, path-lock-nfd |

---

## 18. Verification record (write gate)

| Check | Result |
|-------|--------|
| Path NFD canonical | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATTENDANCE-CLOSED-HOLD-SA-01.md` |
| UTF-8 no BOM | PowerShell `[System.Text.UTF8Encoding]::new($false)` |
| Length ≥8192 | Shell `(Get-Item).Length` post-write |
| apps/** touched | **NO** |
| selected_option | **Option A** ACCEPT_AS_IS_P2 HOLD |
| residual minted | **`R-PLT-ATTENDANCE-CLOSED-01`** |

---

*End of PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATTENDANCE-CLOSED-HOLD-SA-01 · governance Option/F.1 · PASS_TO_PM.*
