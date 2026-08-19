# PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01 — Option/F.1 · `attendance_uat_ready` honesty HOLD (W8 U88)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01` |
| **Parent** | W8 continuous honesty registry · after **`PAY-E2E-HOLD-SA-01`** SEALED (Option A · **`R-PLT-PAY-E2E-01`** · SPEC 28002) · peer **`CTR-PRINTABLE-HOLD-SA-01`** SEALED (`R-PLT-CTR-PRINTABLE-01`) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous governance |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for program honesty flag **`attendance_uat_ready=false`** (synonyms **`hrm_attendance_uat_ready`**, **`attendance_e2e_linkage_ready`**) — formalize LIVE ATT platform catalog **L1 slices** vs **forbidden** ATT module UAT / Phase1 ATT DONE claims |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · mint **`R-PLT-ATT-UAT-01`** · ba-process **HOLD** (no new AC pack) · **DENY** flip `attendance_uat_ready=true` · **DENY** reopen LVRULE engine / FE 01g as UAT unlock |
| **residual_id** | **`R-PLT-ATT-UAT-01`** *(minted this seat — consolidates ATT module honesty + L1 catalog stamp inventory + peer HOLD cites + J-HRM-06* denial taxonomy)* |
| **peer_cite_pay_e2e** | [`PAY-E2E-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01.md) **`R-PLT-PAY-E2E-01`** · **`payroll_e2e_ready=false`** — **RETAIN · FORBIDDEN bundled flip with attendance** |
| **peer_cite_printable** | [`CTR-PRINTABLE-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-PRINTABLE-HOLD-SA-01.md) **`R-PLT-CTR-PRINTABLE-01`** — **RETAIN · orthogonal** |
| **peer_cite_lvrule_engine** | [`ATT-LVRULE-ENGINE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md) **`R-PLT-ATT-LVRULE-ENGINE-01`** — **RETAIN HOLD · FORBIDDEN reopen as attendance UAT unlock** |
| **peer_cite_leave_fe_admin** | [`ATT-LEAVE-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-FE-ADMIN-NOTES-SA-01.md) **`R-PLT-ATT-LEAVE-FE-ADMIN-01`** — **RETAIN HOLD** |
| **Honesty** | **`attendance_uat_ready=false`** · **`hrm_attendance_uat_ready=false`** · **`attendance_e2e_linkage_ready=false`** · **`payroll_e2e_ready=false`** (peer) · **`contracts_printable_ready=false`** (peer) · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module ATT UAT · Phase1 ATT DONE · J-HRM-06/06b module DONE from slices · seed · flip attendance · reopen LVRULE engine/01g |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

> **HARD EXIT GATE:** NFD path · UTF-8 **no BOM** · Shell **Length ≥ 8192** verified before CONFIRMED. Empty turn = INVALID.

---

## 1. Decision context (ADR option pack §1)

| | |
|--|--|
| **Decision title** | Formalize program honesty: **`attendance_uat_ready=false`** HOLD vs sponsor-gated ATT module UAT UF wave vs invent flip / reopen LVRULE engine / claim ATT module UAT |
| **Requestor** | pm · U88 after PAY-E2E SA SEALED |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-ATT-* · AC-PLT-ATT-* · J-HRM-06 · J-HRM-06b · J-HRM-06c · UF-HRM-ATT-* · WAIVE_L2 · LV-02 WAIVED_P1 · platform catalog L1 chain W8 |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + **§11 F.1** |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-ATT-UAT-HOLD-SA-01` |

### 1.1 Problem — what many ATT GWC L1 slices proved vs what honesty flags still say

Under U65, W8 already **proved narrow ATT platform catalog slices** (leave-type, work-sites, attendance codes, work_shifts, leave accrual policy L1 invent KEY, OT type, OT compensation_type, browser spot ATT platform QA) while **every** QC/QA evidence file in the grep chain repeats **`attendance_uat_ready=false`** (and registry synonyms **`hrm_attendance_uat_ready=false`**, **`attendance_e2e_linkage_ready=false`**).

Resume plan K5–K6 sealed **slice GWC** with honesty **LOCKED false** at ATT/REC QC stamps — explicitly **DENY module ATT UAT** despite browser AC-PLT-ATT partial PASS.

**Question for F.1:** Should SA recommend flipping **`attendance_uat_ready=true`** because ATTPLATQA/ATTPLATQA2 / leave catalog / shift / worksite / code / OT / COMP L1 slices passed QC GWC, or **LOCK Option A HOLD** until sponsor opens a **named ATT module UAT UF wave** with full J-HRM-06* matrix + QC gate?

**Answer (LOCKED):** **Option A** — slice LIVE **≠** honesty flag true. **UNLOCK flag flip only** when sponsor message opens ATT module UAT with explicit UF/J-* inventory + QC GO on **module** scope — else **HOLD forever-until-sponsor**.

### 1.2 LIVE inventory — ATT platform catalog L1 slices (READ-ONLY)

These surfaces are **LIVE** and **RETAIN** — they are **not** arguments to flip **`attendance_uat_ready`**:

| Vertical | Surface / stamp | Evidence class | Verdict |
|----------|-----------------|----------------|---------|
| **Leave-type catalog** | Nest open catalog · invent KEY · U65 AC-PLT-ATT-LEAVE | QA **`ATTLEAVEQA-MSJ7CPJH`** 9/9 · QC GWC | **L1 LIVE slice SEALED** |
| **Work-sites catalog** | Soft-retire · GEO-001 · list active | QA **`ATTWSQA-MSJC3IN9`** L1 · CNS-05 FE **`ATTWSQA2-MSJCG47P`** | **L1 LIVE** · **SITE-UNKNOWN HOLD** RETAIN |
| **Attendance codes** | att_attendance_code · invent KEY · EFF FE rebind | QA **`ATTCODEQA-MSK4T1A5`** · FE **`ATTCODEQAFE-MSKCJA95`** | **L1 LIVE** · **FE-ADMIN HOLD** RETAIN |
| **Work shifts** | att work_shifts · ShiftChange CNS-02 | QA **`ATTSHIFTQA-MSK5FXP3`** · CNS-02 CLOSED · FE **`ATTSHIFTQAFE-MSK6AJ8Z`** | **L1 LIVE** · **SHIFT FE-ADMIN HOLD** RETAIN |
| **Leave accrual policy (LVRULE)** | F-ATT-LVRULE · invent KEY · CNS-WIRE | QA **`ATTLVRULEQA-MSK6G783`** · **`ATTLVRULEQA2-MSK79F2F`** · CNS-WIRE CLOSED | **L1 admin LIVE** · **ENGINE HOLD** RETAIN |
| **OT type catalog** | att_ot_type · invent KEY | QA **`ATTOTQA-MSK8VETU`** PASS_WITH_OBS | **L1 LIVE** · FE OBS class |
| **OT compensation_type** | att_ot_comp · OTC-03 Nest FE | QC-FE OTC-03 CLOSED · DOCS CH05g | **L1 LIVE** · **FE-ADMIN HOLD** RETAIN |
| **ATT platform browser spot** | AC-PLT-ATT leave-type picker UF | QA **`ATTPLATQA2-MSIVNE4A`** · prior L1 **`ATTPLATQA-MSISVY4L`** | **C-SLICE browser** · **≠ module UAT** |
| **Leave funnel / sheet** | Cancel stub · AC-ATT-LV-SHEET-02 | QA U65 cancel POST 201 | **Consumer slice** · flag false on evidence |
| **DOCS deltas** | SRS v0.26–v0.41 CH05* platform ATT | Multiple ACCEPT rows W8 board | **RETAIN** |

**Critical discrimination:**

| Claim | Allowed? | Why |
|-------|----------|-----|
| «Leave-type L1 catalog UF passed QC GWC» | **YES** | **`ATTLEAVEQA-MSJ7CPJH`** C-SLICE |
| «Work_shifts invent KEY + CNS-02 CLOSED» | **YES** | Named stamps |
| «Work-sites L1 + CNS-05 gps method FE CLOSED» | **YES** | **≠** SITE-UNKNOWN resolved |
| «LVRULE L1 invent KEY + CNS-WIRE CLOSED» | **YES** | **≠** accrual **engine** LIVE |
| «ATT platform browser spot GWC» | **YES** | **`ATTPLATQA2-MSIVNE4A`** · honesty still false |
| «**Module** attendance **UAT ready**» | **NO** | Honesty flag **false** · J-HRM-06* matrix open · WAIVE_L2 · AGG/sheet residuals |
| «Set **`attendance_uat_ready=true`** on board» | **NO** | **DENIED invent flip** (mission + all QC gates) |
| «Phase 1 ATT DONE / product GO from catalog L1» | **NO** | Program gates open · **C-SLICE-≠-MODULE** |
| «Reopen LVRULE engine / FE 01g ⇒ flip flag» | **NO** | **`R-PLT-ATT-LVRULE-ENGINE-01`** HOLD · orthogonal |

### 1.3 FORBIDDEN by honesty flag (what `attendance_uat_ready=false` blocks)

| Blocked claim | Detection | Mitigation |
|---------------|-----------|------------|
| Module ATT UAT GO | PM matrix / SERVICE_READINESS | Cite this SPEC + QC honesty tables |
| Flip flag without sponsor UF wave | Bus diff on honesty JSON | SA **REJECT** · Option C |
| Reopen **LVRULE ENGINE** HOLD as attendance UAT unlock | Dispatch dev-be accrue / formula LIVE | **FORBIDDEN** — **`R-PLT-ATT-LVRULE-ENGINE-01` RETAIN** |
| Reopen **FE 01g** (leave balance admin panel) as engine/UAT unlock | dev-fe from 01g HOLD | **FORBIDDEN** — SA-01 Option B LOCKED |
| Reopen ATT **FE-ADMIN HOLD** pack as module unlock | SHIFT/CODE/OT/COMP/LEAVE/WS FE-ADMIN | **FORBIDDEN** — P2 NOTE class |
| Reopen ATT L1 QC GWC as FAIL to force module UAT | QA invent reopen | **FORBIDDEN** — seals RETAIN |
| Bundle flip with **`payroll_e2e_ready`** or **`contracts_printable_ready`** | Dual/triple flag promote | **FORBIDDEN** — peer PAY/CTR SA |
| Claim J-HRM-06/06b **DONE** from funnel/sheet slices alone | Journey map | **DENY** · **C-SLICE** |
| Use seed to «complete» ATT matrix | U65 violation | **DENIED** |
| API-only PASS without browser UF for module promotion | qa-fe-outside-browser-gate | **DENIED** |

### 1.4 Honesty flag synonyms (registry — treat as one logical gate)

| Flag key (docs/evidence) | AS-IS | This seat |
|--------------------------|-------|-----------|
| **`attendance_uat_ready`** | **false** (bus grep dominant) | **Primary subject** · mint **`R-PLT-ATT-UAT-01`** |
| **`hrm_attendance_uat_ready`** | **false** (FE-ADMIN pack synth) | **Same HOLD** · do not flip independently |
| **`attendance_e2e_linkage_ready`** | **false** | **Same HOLD** · e2e linkage wave not closed |
| **`payroll_e2e_ready`** (peer) | **false** · **`R-PLT-PAY-E2E-01` SEALED** | **RETAIN** · **DENY** bundled flip |
| **`contracts_printable_ready`** (peer) | **false** · **`R-PLT-CTR-PRINTABLE-01` SEALED** | **RETAIN** · orthogonal |

PM must not promote one synonym true while others false without explicit QC scope definition — default **all false** until sponsor ATT module UAT wave.

### 1.5 RETAIN peer HOLDs (do not reopen as ATT UAT unlock)

| Residual | Spec | Rule |
|----------|------|------|
| **`R-PLT-ATT-LVRULE-ENGINE-01`** | LVRULE-ENGINE-SA-01 | Accrual **engine** deferred · L1 KEY LIVE only |
| **`R-PLT-ATT-LEAVE-FE-ADMIN-01`** | LEAVE-FE-ADMIN-NOTES | Settings leave panel LIVE · HOLD = P2 NOTE |
| **`R-PLT-ATT-SHIFT-FE-ADMIN-01`** | SHIFT-FE-ADMIN-NOTES | Ca-tab CRUD LIVE · HOLD |
| **`R-PLT-ATT-WS-FE-ADMIN-01`** | WORKSITE-FE-ADMIN-NOTES | GPS card LIVE · HOLD |
| **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** | WS-SITE-UNKNOWN | No consumer work_site_id on punch · HOLD |
| **`R-PLT-ATT-FE-ADMIN-01`** | ATT-FE-ADMIN-NOTES | CODE/OT/COMP ABSENT admin class |
| **`R-PLT-PAY-E2E-01`** | PAY-E2E-HOLD | Payroll module e2e · separate wave |
| **`R-PLT-CTR-PRINTABLE-01`** | CTR-PRINTABLE-HOLD | Printable · separate wave |

### 1.6 READ-ONLY apps cite (attendance platform spine — no edit)

| Symbol | Path (read-only) | Role |
|--------|------------------|------|
| Nest attendance module | `apps/api/hrm-api/src/attendance/*` | Catalog services · sheet · leave |
| Leave types | `att-leave-type.service.ts` | Open catalog L1 |
| Work sites | `attendance-catalog.service.ts` / work-site DTOs | L1 + GEO |
| Codes / shifts / OT / comp | `att-attendance-code.service.ts` · shift catalog · ot-type · ot-comp | Platform L1 |
| LVRULE policy | `att-leave-accrual-policy.service.ts` | L1 invent · engine HOLD |
| FE attendance | `apps/web/hrm/src/pages/Attendance*.tsx` · settings panels | Consumer + partial admin |

Audit finding: **Substantial ATT platform catalog stack is LIVE** for **L1 slices** already GWC — yet **every** QC/QA evidence repeats **`attendance_uat_ready=false`**. SA **confirms** intentional honesty (module matrix · WAIVE_L2 · engine HOLD · SITE-UNKNOWN · AGG residuals), not stale typo.

### 1.7 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** `attendance_uat_ready=true` (and synonyms) without sponsor ATT module UAT wave
- **DENY** reopen **`R-PLT-ATT-LVRULE-ENGINE-01`** · FE 01g as UAT unlock
- **DENY** reopen ATT L1 GWC stamps as FAIL pretext
- **DENY** bundle flip with payroll_e2e / printable flags
- **RETAIN** all ATT L1 seals · FE-ADMIN HOLDs · SITE-UNKNOWN · honesty false · **C-SLICE**
- **UNLOCK** honesty flag **only** if sponsor **explicit** ATT module UAT wave + UF/J-* list in **same** governance cycle + QC GO

### 1.8 Decision heuristic

| Rule | Application |
|------|-------------|
| L1 catalog GWC + flag false on evidence | **Option A HOLD** — formalize, do not flip |
| Sponsor opens «ATT module UAT wave» + UF | **Future Option B** — out of this seat default |
| «ATTPLATQA2 browser PASS ⇒ flip flag» | **Option C REJECT** — violates QC seal honesty |
| «LVRULE L1 KEY ⇒ engine LIVE ⇒ flip flag» | **REJECT** — engine HOLD explicit |
| «Leave FE-ADMIN LIVE ⇒ flip flag» | **REJECT** — peer HOLD |

---

## 2. Problem to solve (ADR §2)

### 2.1 Current state

| Layer | AS-IS | Honesty reading |
|-------|-------|-----------------|
| ATT platform catalogs L1 | Leave · WS · CODE · SHIFT · LVRULE KEY · OT · COMP proven | **Slice LIVE** |
| ATT browser spot / platform QA | ATTPLATQA2 GWC | **C-SLICE** |
| Leave consumer funnel/sheet | Partial UF slices · WAIVE_L2 | **≠ module DONE** |
| LVRULE accrual engine | **HOLD** · FE 01g ACCEPT_AS_IS_P2 | **NOT LIVE** · flag false correct |
| SITE-UNKNOWN on punch | **HOLD** | **≠ worksite catalog closure** |
| FE-ADMIN HOLD pack | Multiple R-PLT-ATT-*-FE-ADMIN-01 | **P2 NOTE** · not flag gate |
| Module ATT UAT matrix | **Not closed** — J-HRM-06* depth · timesheet AGG class | **Flag false correct** |
| Program W8 | Row DISPATCHED for this seat | **Needs SA mint** **`R-PLT-ATT-UAT-01`** |

### 2.2 Failure impact if mis-governed

| Risk | Impact |
|------|--------|
| Flip flag from L1 GWC alone | False UAT-ready · QC NO-GO · sponsor trust loss |
| Reopen LVRULE engine as «finish ATT» | Scope creep · violates engine HOLD seal |
| Claim Phase1 ATT DONE from catalogs | Violates continuous honesty program |
| Bundle payroll/printable flip | Violates peer PAY/CTR SA locks |
| Reopen SITE-UNKNOWN as FAIL mandatory | Violates SITE-UNKNOWN ACCEPT HOLD |

---

## 3. Options (ADR §3)

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint **`R-PLT-ATT-UAT-01`** documenting: (1) **LIVE** ATT L1 catalog inventory §1.2; (2) **`attendance_uat_ready=false`** **correct** until sponsor opens named ATT module UAT UF wave; (3) **DENY** flip/reopen/invent paths §6.3; (4) **RETAIN** peer HOLDs + L1 stamps. |
| **Benefits** | Aligns W8 ATT evidence chain · closes honesty gap without code · preserves U88 bandwidth |
| **Costs** | Full ATT module UAT deferred until sponsor |
| **Risks** | HOLD misread as «ATT broken» → mitigations **L-ATT-UAT-*** |
| **Gate** | Evidence chain grep **`attendance_uat_ready=false`** consistent |

### Option B — UNLOCK honesty flag / «ATT module UAT ready» (default reject)

| | |
|--|--|
| **Description** | Set **`attendance_uat_ready=true`** because L1/browser slices passed. |
| **Benefits** | None on current evidence — contradicts QC |
| **Costs** | Honesty violation · false module GO |
| **Risks** | **DENIED** mission line |
| **Gate** | **REJECT** unless sponsor + UF matrix + QC sign-off in future wave |

### Option C — REJECT invent / reopen / flip

| | |
|--|--|
| **Description** | Flip flag · reopen LVRULE engine/01g · reopen FE-ADMIN HOLDs · reopen L1 GWC · claim ATT module UAT · invent SITE-UNKNOWN FAIL · seed · `apps/**` from this seat. |
| **Benefits** | None |
| **Costs** | Seal loss |
| **Risks** | **DENY** all mission FORBIDDEN lines |

---

## 4. Trade-off matrix (ADR §4)

| Criteria | Weight | Option A HOLD | Option B flip | Option C invent |
|---|--:|--:|--:|--:|
| QC/QA honesty chain integrity | 5 | **5** | 0 | 0 |
| W8 continuous policy compliance | 5 | **5** | 0 | 0 |
| Clarity L1 slice vs module UAT | 5 | **5** | 1 | 0 |
| Sponsor trust | 4 | **5** | 0 | 0 |
| Time to full ATT module UAT | 3 | 3 | **4** | 1 |
| Delivery cost now | 4 | **5** | 2 | 0 |
| **Weighted tendency** | | **Dominates** | Reject | Reject |

---

## 5. Failure modes and mitigation (ADR §5)

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | «ATTPLATQA2 ⇒ flip flag» | Bus promote without UF | Cite ATTPLATQA2 honesty § + this SPEC |
| A | User thinks leave admin missing | Support ticket | Cite LIVE panels + **`R-PLT-ATT-LEAVE-FE-ADMIN-01`** HOLD ≠ absent |
| A | PM drops ATT honesty row | Board scan | **`R-PLT-ATT-UAT-01`** mint |
| B | False SERVICE_READINESS | QC audit | NO-GO · revert flag |
| C | Reopen LVRULE engine | Duplicate dev-be wave | FORBIDDEN · engine HOLD RETAIN |
| C | Bundle PAY flip | Dual flag promote | Cite **`R-PLT-PAY-E2E-01`** |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_P2 HOLD** |
| **Why** | ATT **L1 catalog slices** are **LIVE and GWC** — but **every** gate evidence requires **`attendance_uat_ready=false`**. Engine HOLD · SITE-UNKNOWN · module J-HRM-06* matrix open. LVRULE L1 KEY **≠** engine LIVE. FE-ADMIN HOLDs are **orthogonal** — **not** unlock paths for flag flip. |
| **Assumptions** | Sponsor did not open «ATT module UAT wave» with UF list in this message. |
| **Rejected** | **Option B** flag flip · **Option C** full DENY list |

### 6.1 Unlock gates (Option A does not open)

| Question | Answer |
|----------|--------|
| Flip **`attendance_uat_ready=true`** now? | **NO** |
| Flip **`hrm_attendance_uat_ready`** / **`attendance_e2e_linkage_ready`** independently? | **NO** |
| Reopen LVRULE **engine** HOLD? | **FORBIDDEN** |
| Reopen FE **01g** as UAT unlock? | **FORBIDDEN** |
| Reopen ATT FE-ADMIN HOLD pack? | **FORBIDDEN** |
| Dispatch dev-fe/dev-be for «ATT module UAT» from HOLD? | **NO** default |
| Claim J-HRM-06* module DONE? | **NO** |

### 6.2 Sponsor-gated narrow alternate (not default)

```text
entry: sponsor message explicit «mở wave ATT module UAT» + named UF-IDs (J-HRM-06/06b/06c full matrix, timesheet/sign where in scope, WAIVE_L2 policy explicit) + persona matrix + U65 browser evidence plan
retain: all prior ATT L1 GWC stamps · ENGINE HOLD until separate sponsor engine wave · FE-ADMIN HOLDs · SITE-UNKNOWN · honesty false until QC closes module wave
scope_allowed: QA browser matrix per UF · QC module gate · THEN pm may set attendance_uat_ready=true (and aligned synonyms) with QC sign-off
scope_FORBIDDEN: flip flag from L1 catalog alone · reopen engine as pretext · reopen FE HOLD · seed · API-only · bundle payroll/printable flip
exit: R-PLT-ATT-UAT-01 may CLOSE or narrow; requires QC GO on full module scope — not L1 slice alone
```

### 6.3 Architecture boundary (text diagram)

```text
  Leave-type L1 ATTLEAVEQA-MSJ7CPJH GWC           --> LIVE catalog slice
  Work-sites L1 ATTWSQA + CNS-05 FE CLOSED         --> LIVE · SITE-UNKNOWN HOLD RETAIN
  Attendance codes L1 ATTCODEQA + FE QC            --> LIVE · FE-ADMIN HOLD RETAIN
  Work shifts L1 ATTSHIFTQA + CNS-02 CLOSED        --> LIVE · SHIFT FE-ADMIN HOLD RETAIN
  LVRULE policy L1 ATTLVRULEQA* + CNS-WIRE         --> LIVE admin KEY · ENGINE HOLD RETAIN
  OT type / OT comp L1 stamps                      --> LIVE · FE-ADMIN OBS/HOLD RETAIN
  ATT platform browser ATTPLATQA2                  --> LIVE C-SLICE · honesty false RETAIN
  LVRULE accrual engine + FE 01g                   --> NOT LIVE (R-PLT-ATT-LVRULE-ENGINE-01)
  Punch work_site_id consumer (SITE-UNKNOWN)         --> NOT LIVE (R-PLT-ATT-WS-SITE-UNKNOWN-01)
  Module ATT UAT matrix (J-HRM-06*)                --> OPEN (honesty)
  attendance_uat_ready / hrm_attendance_*          --> false RETAIN (R-PLT-ATT-UAT-01)
  payroll_e2e_ready (peer)                         --> false RETAIN (R-PLT-PAY-E2E-01)
  contracts_printable_ready (peer)                 --> false RETAIN (R-PLT-CTR-PRINTABLE-01)
  C-SLICE-≠-MODULE                                 --> RETAIN
```

---

## 7. Implementation and validation plan (ADR §7)

| Step | Owner | Action |
|------|-------|--------|
| 1 | pm | Seal board row **CONFIRMED** · append **`R-PLT-ATT-UAT-01`** HOLD P2 |
| 2 | pm | **Do not** set **`attendance_uat_ready=true`** · **Do not** dispatch ATT module UAT unlock from this seat |
| 3 | pm | Keep honesty registry until sponsor opens UF wave — then **new** work_item (not silent flip) |
| 4 | qc | Any future flag promote requires **full** ATT module UF evidence — not L1 alone |
| Rollback | sa | If flag flipped wrongly — CORRECTION bus · restore false · cite this SPEC |
| Validation | qa | Module wave must be U65 browser UF matrix when sponsor opens |
| Success | pm | SPEC_LEN ≥8192 NFD · PASS_TO_PM · honesty unchanged |

---

## 8. Locks (L-ATT-UAT-*)

| Lock | Rule |
|------|------|
| **L-ATT-UAT-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 does not delete L1 catalog ACs · deferred **module** UAT only |
| **L-ATT-UAT-02 L1 LIVE** | All §1.2 stamps **RETAIN** — HOLD does not negate slice evidence |
| **L-ATT-UAT-03 Flag false** | **DENY** PM/dev flip without sponsor UF wave + QC |
| **L-ATT-UAT-04 Engine orthogonality** | **DENY** reopen **`R-PLT-ATT-LVRULE-ENGINE-01`** / FE 01g as UAT unlock |
| **L-ATT-UAT-05 FE-ADMIN orthogonality** | **DENY** reopen ATT FE-ADMIN HOLD pack as module unlock |
| **L-ATT-UAT-06 SITE-UNKNOWN** | **RETAIN** **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** · **DENY** invent FAIL as flip pretext |
| **L-ATT-UAT-07 PAY/CTR peer** | **DENY** bundled flip with payroll_e2e / printable |
| **L-ATT-UAT-08 Honesty** | **C-SLICE-≠-MODULE** RETAIN · **DENY** Phase1 ATT DONE from L1 |
| **L-ATT-UAT-09 Path lock** | UTF-8 no BOM NFD write gate |

---

## 9. F.1 physical notes (API_DESIGN alignment — read-only)

| Function / area | Mục đích (VI) | Slice status today | Honesty impact |
|-----------------|---------------|--------------------|----------------|
| **F-PLT-ATT-LEAVE-TYP-*** | Danh mục loại nghỉ phép Nest open catalog | **LIVE** L1 | **≠** module UAT ready |
| **F-PLT-ATT-WS-*** | Danh mục điểm chấm công / work-sites | **LIVE** L1 | **≠** SITE-UNKNOWN closure |
| **F-PLT-ATT-CODE-*** | Mã chấm công attendance codes | **LIVE** L1 | **≠** flag true |
| **F-PLT-ATT-SHIFT-*** | Ca làm việc work_shifts | **LIVE** L1 | **≠** flag true |
| **F-ATT-LVRULE-*** | Chính sách cộng phép (policy table + invent KEY) | **LIVE** L1 admin | **≠** engine LIVE |
| **F-PLT-ATT-OT-*** / **COMP-*** | Loại OT · hình thức bù OT | **LIVE** L1 | **≠** flag true |
| **F-ATT-SHEET-*** / **AGG-*** | Bảng công · tổng hợp dòng | Partial consumer slices | Module matrix open |
| **F-ATT-LVRULE-ENGINE-*** | Chạy cộng phép định kỳ / runtime | **HOLD** | **Supports flag false** |

No new API_DESIGN rows required this seat — **disposition + honesty governance only**.

---

## 10. Evidence index (RETAIN — grep-backed)

| Evidence path | Stamp / verdict | Honesty line |
|---------------|-----------------|--------------|
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-qa-01.md` | **`ATTLEAVEQA-MSJ7CPJH`** | attendance_uat_ready=false |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-ws-catalog-qa-01.md` | **`ATTWSQA-MSJC3IN9`** | false RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qa-01.md` | **`ATTCODEQA-MSK4T1A5`** | false |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qa-01.md` | **`ATTSHIFTQA-MSK5FXP3`** | false |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-lvrule-qa-01.md` | **`ATTLVRULEQA-MSK6G783`** | false · engine HOLD |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-02.md` | **`ATTPLATQA2-MSIVNE4A`** | false · DENY module UAT |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LVRULE-ENGINE-SA-01.md` | **`R-PLT-ATT-LVRULE-ENGINE-01`** | attendance_uat_ready=false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WS-SITE-UNKNOWN-SA-01.md` | **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** | false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01.md` | **`R-PLT-PAY-E2E-01`** | peer false RETAIN |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-PRINTABLE-HOLD-SA-01.md` | **`R-PLT-CTR-PRINTABLE-01`** | peer false RETAIN |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | ATT-UAT row DISPATCHED | board SoT |
| `docs/program/PO_HRM_RESUME_PLAN_20260807.md` | K5–K6 honesty LOCKED | false at seal |

---

## 11. Trace to program board (W8)

| Board row | Status | Action |
|-----------|--------|--------|
| ATT catalog L1 chain (leave/ws/code/shift/lvrule/ot/comp) | GWC / SEALED mix | **RETAIN** · **DENY** reopen as module unlock |
| ATT-LVRULE-ENGINE-SA-01 | CONFIRMED HOLD | **RETAIN** · **DENY** reopen |
| ATT-*-FE-ADMIN-NOTES seats | CONFIRMED HOLD | **RETAIN** |
| ATT-WS-SITE-UNKNOWN-SA-01 | CONFIRMED HOLD | **RETAIN** |
| PAY-E2E-HOLD-SA-01 | SEALED | peer RETAIN |
| CTR-PRINTABLE-HOLD-SA-01 | SEALED | peer RETAIN |
| **ATT-UAT-HOLD-SA-01** | **this seat** | Option A LOCK · mint **`R-PLT-ATT-UAT-01`** |

---

## 12. Discrimination matrix (PM / QC)

| Evidence | Flip `attendance_uat_ready`? | Why |
|----------|------------------------------|-----|
| Leave catalog **`ATTLEAVEQA-MSJ7CPJH`** | **NO** | L1 C-SLICE |
| Shift/WS/CODE L1 GWC | **NO** | Catalog slice |
| LVRULE L1 KEY + CNS-WIRE | **NO** | **≠** engine LIVE |
| ATTPLATQA2 browser GWC | **NO** | Spot UF · honesty false on seal |
| Leave funnel / sheet cancel UF | **NO** | Consumer slice |
| FE-ADMIN panels LIVE + HOLD | **NO** | P2 NOTE |
| Sponsor ATT module UAT wave + QC GO | **YES** (future) | §6.2 only |

---

## 13. RETAIN stamps (ATT slices · peers · honesty)

| Stamp / residual | Action |
|------------------|--------|
| **`ATTLEAVEQA-MSJ7CPJH`** · leave L1 | **SEAL RETAIN** |
| **`ATTWSQA-MSJC3IN9`** · **`ATTWSQA2-MSJCG47P`** | **SEAL RETAIN** |
| **`ATTCODEQA-MSK4T1A5`** · FE QC | **SEAL RETAIN** |
| **`ATTSHIFTQA-MSK5FXP3`** · CNS-02 CLOSED | **SEAL RETAIN** |
| **`ATTLVRULEQA*`** · CNS-WIRE CLOSED | **SEAL RETAIN** |
| **`ATTOTQA-MSK8VETU`** · OTC-03 | **SEAL RETAIN** |
| **`ATTPLATQA-MSISVY4L`** · **`ATTPLATQA2-MSIVNE4A`** | **SEAL RETAIN** |
| **`R-PLT-ATT-LVRULE-ENGINE-01`** | **HOLD RETAIN** |
| **`R-PLT-ATT-WS-SITE-UNKNOWN-01`** | **HOLD RETAIN** |
| **`R-PLT-ATT-*-FE-ADMIN-01`** pack | **HOLD RETAIN** |
| **`R-PLT-ATT-UAT-01`** | **HOLD mint this seat** |
| **`R-PLT-PAY-E2E-01`** · **`R-PLT-CTR-PRINTABLE-01`** | **HOLD RETAIN** (peers) |
| **`attendance_uat_ready`** (+ synonyms) | **false RETAIN** |
| **`C-SLICE-≠-MODULE`** | **RETAIN** |

---

## 14. Non-goals (explicit)

1. Do not set **`attendance_uat_ready=true`** (or **`hrm_attendance_uat_ready`** / **`attendance_e2e_linkage_ready`**) without sponsor module wave.
2. Do not reopen LVRULE **engine** or FE **01g** as attendance UAT unlock.
3. Do not reopen ATT L1 QC GWC stamps as FAIL pretext.
4. Do not reopen ATT FE-ADMIN HOLD pack as module unlock.
5. Do not claim module ATT UAT · J-HRM-06* DONE · Phase1 ATT DONE.
6. Do not bundle flip with **`payroll_e2e_ready`** or **`contracts_printable_ready`**.
7. Do not dispatch dev-fe/dev-be for module closure without sponsor UF wave.
8. Do not seed ATT matrix (U65).
9. Do not edit `apps/**` in this seat.

---

## 15. Handback packet (mandatory)

| Field | Value |
|-------|--------|
| **completion_report** | ATT module honesty formalized as Option **A LOCKED** · mint **`R-PLT-ATT-UAT-01`** ACCEPT_AS_IS_P2 HOLD · documented **LIVE** L1 catalog slices (leave/ws/code/shift/lvrule/ot/comp) + ATTPLATQA2 browser C-SLICE vs **`attendance_uat_ready=false`** RETAIN · **DENY** flag flip · **DENY** reopen LVRULE engine/01g · **RETAIN** SITE-UNKNOWN + FE-ADMIN HOLD pack + peer PAY-E2E + CTR-PRINTABLE · no `apps/**`. |
| **selected_option** | **Option A** — ACCEPT_AS_IS_P2 HOLD |
| **residual** | **`R-PLT-ATT-UAT-01`** = **HOLD** |
| **SPEC_LEN** | Verified NFD UTF-8 no BOM · gate ≥8192 bytes |
| **next_owner** | **pm** — seal W8 row CONFIRMED · **do not** flip honesty · U88 next vertical per board (not ATT module UAT unlock) |
| **next_dispatch_prompt** | `work_item_id: PO-HRM-CONTINUOUS-W8-PM-SEAL-ATT-UAT-HOLD-01` · from_role: pm · to_role: pm · lane: governance · entry: SA PASS `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01` Option A · evidence `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01.md` · mint `R-PLT-ATT-UAT-01` HOLD on W8 board + honesty registry · exit: row CONFIRMED · RETAIN `attendance_uat_ready=false` and synonyms · RETAIN `R-PLT-ATT-LVRULE-ENGINE-01` · RETAIN peer PAY/CTR flags false · C-SLICE · **cấm** dispatch dev-* ATT module UAT unlock · **cấm** flip flag · **cấm** reopen engine/01g · ack PASS_TO_PM internal seal |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 16. SA KB append (reference)

| Context | ATT module UAT honesty after L1 GWC slices · U88 after PAY-E2E SEAL |
| Action | Option A LOCK · mint R-PLT-ATT-UAT-01 · L1 LIVE vs flag false taxonomy |
| Outcome | PASS_TO_PM · no apps/** |
| Evidence | This SPEC path |
| Reuse-tag | att-uat-honesty-hold, r-plt-att-uat-01, slice-live-neq-module-uat, deny-invent-flip, l1-catalog-retain, lvrule-engine-hold-retain, site-unknown-retain, fe-admin-hold-retain, pay-e2e-peer-retain, ctr-printable-peer-retain, path-lock-nfd |

---

## 17. Extended governance notes (cross-reference)

**Continuous W8 policy:** Board header **Honesty LOCKED: all `*_ready=false` · `C-SLICE-≠-MODULE`**. This seat **formalizes the ATT leg** of that registry — complementary to PAY-E2E and CTR-PRINTABLE seats already SEALED. PM must not interpret «payroll honesty formalized» as permission to flip attendance (or vice versa).

**Resume plan K5–K6:** ATT QC **`ATTPLATQA-MSISVY4L`** / browser **`ATTPLATQA2-MSIVNE4A`** and REC seal explicitly retained **`attendance_uat_ready=false`**. This seat **does not** reopen K5–K6; it **documents** why those seals did not promote module honesty.

**WAIVE_L2 / LV-02 WAIVED_P1:** Phase-1 leave workflow constraints remain on consumer evidence — module UAT promotion must respect journey map rows, not override via catalog L1 alone.

**AGG / timesheet line HOLD class:** Bus references AGG HOLD and sheet navigation deferrals — module ATT UAT remains open while those program lines exist unless sponsor wave explicitly closes them with UF evidence.

**QC coaching:** When auditing ATT evidence, QC must copy honesty line from evidence header — if missing, **FAIL spec_gap** to QA author. Module promotion discussion with **`attendance_uat_ready=false`** in evidence → **NO-GO** unless sponsor wave + full matrix PASS.

**Dev coaching:** `dev-be` / `dev-fe` must not interpret L1 invent KEY or CNS CLOSED as ticket to update honesty JSON without PM + QC after sponsor module wave.

**BA coaching:** No new AC-PLT-ATT **module UAT** pack required for HOLD. Future sponsor wave may request BA delta for **full** ATT UF — separate work_item.

**TM/QC block:** Recommend **NO-GO** on any release narrative claiming ATT module UAT while **`R-PLT-ATT-UAT-01=HOLD`** and flag false.

**Peer PAY-E2E (SPEC 28002):** Payroll hire/J07 spot slices **do not** unlock attendance. Cross-module J-HRM-07 references in PAY evidence remain **payroll C-SLICE** — attendance flag unchanged.

**FE-ADMIN-REOPEN-GATE-BA-02:** Reopen-gate inventory **defers** engine/printable/leave residuals — **not** unlock of **`attendance_uat_ready`**. This seat is **downstream SA disposition**.

**Synonym discipline:** Documents using `hrm_attendance_uat_ready` vs `attendance_uat_ready` must be updated **together** on any future promote — default all **false** until QC signs module scope.

**J-HRM-06 journey map:** List→detail, leave request lifecycle, sheet sign, and cross-nav to payroll remain **architecture test gaps** for module UAT — L1 catalog PASS does not close J-* rows.

**Platform catalog vs consumer depth:** W8 verticals implemented **F-PLT-ATT-* L1** platform catalog pattern (invent KEY, soft-retire, CNS wire) — distinct from **operational** timesheet/leave approval depth required for module UAT.

**U65 zero-seed:** Any future module wave must create sources from FE — HOLD does not authorize seed to «green» matrix.

**Path lock:** Canonical NFD `Tài liệu` — this SPEC written via PowerShell UTF-8 no BOM gate per mission protocol.

---

*End of SPEC — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01*
