# PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-UAT-HOLD-SA-01 — Option/F.1 · `hrm_personnel_uat_ready` honesty HOLD (W8 U88)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-UAT-HOLD-SA-01` |
| **Parent** | W8 continuous honesty registry · after **`REC-UAT-HOLD-SA-01`** SEALED (Option A · **`R-PLT-REC-UAT-01`** · SPEC 35658) · peer **`ATT-UAT-HOLD-SA-01`** SEALED (`R-PLT-ATT-UAT-01` · SPEC 32664) · **`PAY-E2E-HOLD-SA-01`** · **`CTR-PRINTABLE-HOLD-SA-01`** |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous governance |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for program honesty flag **`hrm_personnel_uat_ready=false`** (synonyms **`personnel_uat`**, **`employees_e2e_linkage_ready=false`**) — formalize LIVE EMP platform catalog **L1/CNS slices** + **consumer FE CLOSED** (status/position/dept) + **FE-ADMIN HOLD** + **custom-field HOLD** + **MergeToken EXT sealed** vs **forbidden** EMP/personnel module UAT / Phase1 EMP DONE claims |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · mint **`R-PLT-EMP-UAT-01`** · ba-process **HOLD** (no new AC pack) · **DENY** flip `hrm_personnel_uat_ready=true` · **DENY** reopen EMP CNS as module UAT unlock |
| **residual_id** | **`R-PLT-EMP-UAT-01`** *(minted this seat — consolidates EMP module honesty + L1/CNS/FE stamp inventory + FE-ADMIN/CUSTOM-FIELD HOLD cites + J-HRM-03* denial taxonomy)* |
| **peer_cite_rec_uat** | [`REC-UAT-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01.md) **`R-PLT-REC-UAT-01`** · **`recruitment_uat_ready=false`** — **RETAIN · FORBIDDEN bundled flip with personnel** |
| **peer_cite_att_uat** | [`ATT-UAT-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01.md) **`R-PLT-ATT-UAT-01`** · **`attendance_uat_ready=false`** — **RETAIN · orthogonal** |
| **peer_cite_pay_e2e** | [`PAY-E2E-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01.md) **`R-PLT-PAY-E2E-01`** · **`payroll_e2e_ready=false`** — **RETAIN · orthogonal** |
| **peer_cite_printable** | [`CTR-PRINTABLE-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-PRINTABLE-HOLD-SA-01.md) **`R-PLT-CTR-PRINTABLE-01`** — **RETAIN · orthogonal** |
| **peer_cite_emp_fe_admin** | [`EMP-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md) **`R-PLT-EMP-FE-ADMIN-01`** — **RETAIN HOLD · FORBIDDEN reopen as personnel UAT unlock** |
| **peer_cite_emp_cf** | [`EMP-CUSTOM-FIELD-FE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-FE-SA-01.md) **`R-PLT-EMP-CF-FE-01`** — **RETAIN HOLD · consumer LIVE · FORBIDDEN reopen as module unlock** |
| **peer_cite_merge_ext** | MergeToken EMP EXT QC **`EMPTOKEXTQA-MSJ57PE1`** · **`R-EMP-TOK-EXT` SEALED** — **RETAIN · FORBIDDEN reopen as personnel UAT unlock** |
| **Honesty** | **`hrm_personnel_uat_ready=false`** · **`employees_e2e_linkage_ready=false`** · **`recruitment_uat_ready=false`** (peer) · **`attendance_uat_ready=false`** (peer) · **`payroll_e2e_ready=false`** (peer) · **`contracts_printable_ready=false`** (peer) · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module EMP/personnel UAT · Phase1 EMP DONE · J-HRM-03 module DONE from slices · seed · flip personnel · reopen EMP CNS · reopen EMP FE CLOSED · reopen FE-ADMIN/CUSTOM-FIELD HOLD as unlock · claim full employee spine UAT |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

> **HARD EXIT GATE:** NFD path · UTF-8 **no BOM** · Shell **Length ≥ 8192** verified before CONFIRMED. Empty turn = INVALID.

---

## 1. Decision context (ADR option pack §1)

| | |
|--|--|
| **Decision title** | Formalize program honesty: **`hrm_personnel_uat_ready=false`** HOLD vs sponsor-gated EMP/personnel module UAT UF wave vs invent flip / reopen EMP CNS / claim EMP module UAT |
| **Requestor** | pm · U88 after REC-UAT SA SEALED |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-EMP-* · AC-PLT-EMP-* · AC-PLT-EMP-TOK-* · J-HRM-03 · J-HRM-01 · UF-HRM-01..03 · UF-HRM-10 · UF-HRM-12 · platform catalog L1/CNS chain W8 · MergeToken `custom.emp` |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + **§9 F.1** |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-EMP-UAT-HOLD-SA-01` |

### 1.1 Problem — what many EMP GWC L1/CNS/FE slices proved vs what honesty flags still say

Under U65, W8 already **proved narrow EMP platform catalog slices** (document-types / employment-types L1, platform browser AC-PLT-EMP-02..05, employment-status / position / department invent KEY L1, custom-field CNS invent KEY, MergeToken `custom.emp` + EXT GWC, consumer FE CLOSED for status/position/dept pickers, Settings DOC/ET admin FE) while **every** QC/QA evidence file in the grep chain repeats **`hrm_personnel_uat_ready=false`** and **`employees_e2e_linkage_ready=false`**.

Resume plan and EMP QC stamps sealed **slice GWC** with honesty **LOCKED false** at **`EMPPLATQA2-MSJ0OAL9`** — explicitly **DENY module EMP/personnel UAT** despite browser partial PASS and **`R-PLT-EMP-FE` CLOSED**.

**Question for F.1:** Should SA recommend flipping **`hrm_personnel_uat_ready=true`** because EMPPLATQA/EMPPLATQA2 / EMPSTQA / EMPPOSQA2 / EMPDEPTQA / EMPCFQA / EMPTOK* slices passed QC GWC, or **LOCK Option A HOLD** until sponsor opens a **named EMP/personnel module UAT UF wave** with full J-HRM-03* / employee spine matrix + QC gate?

**Answer (LOCKED):** **Option A** — slice LIVE **≠** honesty flag true. **UNLOCK flag flip only** when sponsor message opens EMP module UAT with explicit UF/J-* inventory + QC GO on **module** scope — else **HOLD forever-until-sponsor**.

### 1.2 LIVE inventory — EMP platform catalog / CNS / consumer FE / MergeToken slices (READ-ONLY)

These surfaces are **LIVE** and **RETAIN** — they are **not** arguments to flip **`hrm_personnel_uat_ready`**:

| Vertical | Surface / stamp | Evidence class | Verdict |
|----------|-----------------|----------------|---------|
| **Platform L1 DOC/ET** | F-EMP-CAT document-types + employment-types | QA **`EMPPLATQA-MSIZXHIM`** 20/20 L1 · D-EMP-PLT-STALE-DIST CLOSED | **L1 LIVE slice SEALED** |
| **Platform browser admin** | AC-PLT-EMP-02..05 Settings pickers | QA **`EMPPLATQA2-MSJ0OAL9`** 21/21 · QC GWC · **`R-PLT-EMP-FE` CLOSED** | **L1 browser LIVE** · **≠ module UAT** |
| **Employment status catalog L1** | invent STATUS-KEY + REASON-KEY · CHECK absent | QA **`EMPSTQA-MSK20G7H`** · QC GWC narrow L1 | **L1 LIVE** · **FE-ADMIN HOLD** RETAIN |
| **Employment status consumer FE** | Nest Select on EmployeeForm | QA-FE **`EMPSTQAFE2-MSKE3NV1`** · QC-FE GWC · **`R-PLT-EMP-ST-FE-01` CLOSED** | **Consumer CLOSED** · honesty false on seal |
| **Position catalog L1** | Settings job_titles invent KEY · Nest emp_position DENY | QA **`EMPPOSQA2-MSK3CDH1`** · BE wire CLOSED | **L1 LIVE** · Settings SoT |
| **Position consumer FE** | CatalogSearchPicker job_title_key | QC-FE **`EMPPOSQCFE-8DEF5536`** · **`R-PLT-EMP-POS-FE-01` CLOSED** | **Consumer CLOSED** |
| **Department catalog L1** | Settings departments invent KEY · Nest emp_department DENY | QA **`EMPDEPTQA-MSK3VVXX`** | **L1 LIVE** |
| **Department consumer FE** | custom_fields.department EFF | QC-FE **`EMPDEPTQCFE-MSKH2Q7P`** · **`R-PLT-EMP-DEPT-FE-01` CLOSED** | **Consumer CLOSED** |
| **Custom-field CNS L1** | VAL-EMP-CF-CNS-01 invent → HRM-EMP-CUSTOM-FIELD-KEY | QA **`EMPCFQA-MSK14LUH`** · GAP CLOSED | **CNS LIVE slice SEALED** |
| **Custom-field consumer + Settings admin** | buildDynamicFields · SettingsCatalogsTab | SA **`R-PLT-EMP-CF-FE-01`** Option B HOLD | **LIVE** · P2 NOTE · **not** module unlock |
| **MergeToken core** | AC-PLT-EMP-TOK browser | QA **`EMPTOKQA-MSJ290VB`** 14/14 | **L1 LIVE slice** |
| **MergeToken EXT** | AC-PLT-EMP-TOK-04/04b/04c | QA **`EMPTOKEXTQA-MSJ57PE1`** 8/8 · **`R-EMP-TOK-EXT` SEALED** | **EXT SEALED RETAIN** |
| **FE-ADMIN notes pack** | Nest ST/STR admin ABSENT · Nest pos/dept DENY | SA **`R-PLT-EMP-FE-ADMIN-01`** HOLD | **P2 NOTE** · **not** flag gate |
| **DOCS** | SRS v0.32 CH06e–g · EMP catalog DOC-DELTA | Multiple ACCEPT rows W8 board | **RETAIN** |
| **J-HRM-03 narrow slice** | iframe contracts-view latch spot | QA PASS **C-SLICE** · honesty false | **≠ module DONE** |

**Critical discrimination:**

| Claim | Allowed? | Why |
|-------|----------|-----|
| «EMP platform L1 DOC/ET passed QC GWC» | **YES** | **`EMPPLATQA-MSIZXHIM`** C-SLICE |
| «Browser AC-PLT-EMP-02..05 passed EMPPLATQA2» | **YES** | **`EMPPLATQA2-MSJ0OAL9`** |
| «STATUS/POSITION/DEPT invent KEY + consumer FE CLOSED» | **YES** | Named stamps · **≠ module UAT** |
| «Custom-field CNS invent KEY GWC» | **YES** | **`EMPCFQA-MSK14LUH`** |
| «MergeToken custom.emp + EXT GWC» | **YES** | **`EMPTOK*`** · **≠ personnel module UAT** |
| «Settings custom_fields admin LIVE + HOLD» | **YES** | **`R-PLT-EMP-CF-FE-01`** |
| «Nest ST/STR admin Network L1 only + FE-ADMIN HOLD» | **YES** | **`R-PLT-EMP-FE-ADMIN-01`** |
| «**Module** personnel / EMP **UAT ready**» | **NO** | Honesty flag **false** · J-HRM-03* matrix open · e2e linkage open |
| «Set **`hrm_personnel_uat_ready=true`** on board» | **NO** | **DENIED invent flip** (mission + all QC gates) |
| «Set **`employees_e2e_linkage_ready=true`** from hire/REC soft-link alone» | **NO** | **DENIED** — separate companion flag |
| «Phase 1 EMP DONE / product GO from catalog L1» | **NO** | Program gates open · **C-SLICE-≠-MODULE** |
| «Reopen EMP CNS GWC ⇒ flip flag» | **NO** | **`EMPCFQA-MSK14LUH`** SEAL RETAIN |
| «Reopen EMP FE CLOSED ⇒ flip flag» | **NO** | ST/POS/DEPT FE **CLOSED ACCEPT** |
| «Reopen EMP FE-ADMIN / CF HOLD ⇒ module UAT unlock» | **NO** | Peer HOLD orthogonal |

### 1.3 FORBIDDEN by honesty flag (what `hrm_personnel_uat_ready=false` blocks)

| Blocked claim | Detection | Mitigation |
|---------------|-----------|------------|
| Module EMP/personnel UAT GO | PM matrix / SERVICE_READINESS | Cite this SPEC + QC honesty tables |
| Flip flag without sponsor UF wave | Bus diff on honesty JSON | SA **REJECT** · Option C |
| Reopen **EMP-CUSTOM CNS** GWC as module UAT unlock | QA invent reopen **`EMPCFQA-MSK14LUH`** | **FORBIDDEN** — seal RETAIN |
| Reopen **EMP STATUS/POSITION/DEPT FE CLOSED** as module unlock | Dispatch dev-fe from CLOSED | **FORBIDDEN** — seals RETAIN |
| Reopen **`R-PLT-EMP-FE-ADMIN-01`** or **`R-PLT-EMP-CF-FE-01`** as personnel UAT unlock | FE-ADMIN wave without sponsor module UF | **FORBIDDEN** — P2 NOTE class |
| Reopen **MergeToken EXT** `R-EMP-TOK-EXT` as module unlock | EXT retest pretext | **FORBIDDEN** — **`EMPTOKEXTQA-MSJ57PE1` RETAIN** |
| Bundle flip with **`recruitment_uat_ready`** / **`attendance_uat_ready`** / **`payroll_e2e_ready`** / **`contracts_printable_ready`** | Dual/multi flag promote | **FORBIDDEN** — peer REC/ATT/PAY/CTR SA |
| Claim J-HRM-03 **DONE** from platform/catalog slices alone | Journey map | **DENY** · **C-SLICE** |
| Claim full employee spine (profile, contracts tab depth, DEC linkage, PAY consumer) **UAT ready** from L1 alone | UF matrix | **DENY** |
| Use seed to «complete» EMP matrix | U65 violation | **DENIED** |
| API-only PASS without browser UF for module promotion | qa-fe-outside-browser-gate | **DENIED** |
| Invent Nest `emp_position` / `emp_department` admin to «finish personnel» | Catalog Option A Settings SoT | **DENIED** — EMP-FE-ADMIN SA |

### 1.4 Honesty flag synonyms (registry — treat as one logical gate for module EMP UAT)

| Flag key (docs/evidence) | AS-IS | This seat |
|--------------------------|-------|-----------|
| **`hrm_personnel_uat_ready`** | **false** (bus grep dominant) | **Primary subject** · mint **`R-PLT-EMP-UAT-01`** |
| **`personnel_uat`** (informal) | **false** | **Same HOLD** · map to primary key |
| **`employees_e2e_linkage_ready`** | **false** | **Companion honesty** · hire→EMP · DEC/PAY/ATT cross-link wave **not closed** · **DENY** flip with personnel flag without sponsor e2e wave |
| **`recruitment_uat_ready`** (peer) | **false** · **`R-PLT-REC-UAT-01` SEALED** | **RETAIN** · **DENY** bundled flip |
| **`attendance_uat_ready`** (peer) | **false** · **`R-PLT-ATT-UAT-01` SEALED** | **RETAIN** · orthogonal |
| **`payroll_e2e_ready`** (peer) | **false** · **`R-PLT-PAY-E2E-01` SEALED** | **RETAIN** · orthogonal |
| **`contracts_printable_ready`** (peer) | **false** · **`R-PLT-CTR-PRINTABLE-01` SEALED** | **RETAIN** · orthogonal |

PM must not promote **`hrm_personnel_uat_ready=true`** while companion flags false without explicit QC scope definition — default **`hrm_personnel_uat_ready=false`** until sponsor EMP module UAT wave.

### 1.5 RETAIN peer HOLDs (do not reopen as EMP UAT unlock)

| Residual | Spec | Rule |
|----------|------|------|
| **`R-PLT-EMP-FE-ADMIN-01`** | EMP-FE-ADMIN-NOTES | Nest ST/STR admin ABSENT · Settings pos/dept LIVE · HOLD = P2 NOTE |
| **`R-PLT-EMP-CF-FE-01`** | EMP-CUSTOM-FIELD-FE | Consumer + Settings admin LIVE · HOLD = P2 NOTE |
| **`R-EMP-TOK-EXT`** | MergeToken EXT QA | **`EMPTOKEXTQA-MSJ57PE1`** SEALED |
| **`R-PLT-REC-UAT-01`** | REC-UAT-HOLD | REC module honesty · separate wave |
| **`R-PLT-ATT-UAT-01`** | ATT-UAT-HOLD | ATT module honesty · separate wave |
| **`R-PLT-PAY-E2E-01`** | PAY-E2E-HOLD | Payroll module e2e · separate wave |
| **`R-PLT-CTR-PRINTABLE-01`** | CTR-PRINTABLE-HOLD | Printable · separate wave |
| **`R-PLT-ATT-LVRULE-ENGINE-01`** | LVRULE-ENGINE | **DENY** invent as EMP unlock |

### 1.6 READ-ONLY apps cite (personnel platform spine — no edit)

| Symbol | Path (read-only) | Role |
|--------|------------------|------|
| Nest employees module | `apps/api/hrm-api/src/employees/*` | CRUD · catalog wire |
| Settings catalog sync | `SettingsCatalogsService` · employees module import | job_titles · departments · custom_fields |
| FE employees | `apps/web/hrm/src/pages/Employees*.tsx` · `EmployeeFormDialog` | Consumer |
| FE Settings | `SettingsCatalogsTab` · document-types · employment-types | Admin LIVE |
| MergeToken register | platform catalog `custom.emp` hook | EXT slice |

Audit finding: **Substantial EMP platform catalog stack is LIVE** for **L1/CNS/consumer FE slices** already GWC — yet **every** QC/QA evidence repeats **`hrm_personnel_uat_ready=false`**. SA **confirms** intentional honesty (full employee spine · e2e linkage · profile/contracts depth · J-HRM-03* open), not stale typo.

### 1.7 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** `hrm_personnel_uat_ready=true` (and unjustified `employees_e2e_linkage_ready=true`) without sponsor EMP module UAT wave
- **DENY** reopen **`EMPCFQA-MSK14LUH`** · EMP CNS QC GWC as unlock pretext
- **DENY** reopen EMP ST/POS/DEPT **FE CLOSED** as module unlock
- **DENY** reopen **`R-PLT-EMP-FE-ADMIN-01`** · **`R-PLT-EMP-CF-FE-01`** as module UAT unlock
- **DENY** reopen **`R-EMP-TOK-EXT`** as module unlock
- **DENY** bundle flip with recruitment/attendance/payroll/printable flags
- **RETAIN** all EMP L1/CNS/FE seals · FE-ADMIN HOLDs · honesty false · **C-SLICE**
- **UNLOCK** honesty flag **only** if sponsor **explicit** EMP module UAT wave + UF/J-* list in **same** governance cycle + QC GO

### 1.8 Decision heuristic

| Rule | Application |
|------|-------------|
| L1/CNS/FE GWC + flag false on evidence | **Option A HOLD** — formalize, do not flip |
| Sponsor opens «EMP module UAT wave» + UF | **Future Option B** — out of this seat default |
| «EMPPLATQA2 browser PASS ⇒ flip flag» | **Option C REJECT** — violates QC seal honesty |
| «EMPCFQA CNS GWC ⇒ reopen CNS as FAIL for dev-be» | **REJECT** — seal loss |
| «ST/POS/DEPT FE CLOSED ⇒ flip flag» | **REJECT** — consumer slice only |
| «FE-ADMIN LIVE ⇒ flip flag» | **REJECT** — peer HOLD |
| «MergeToken EXT SEALED ⇒ personnel module ready» | **REJECT** — platform slice only |

---

## 2. Problem to solve (ADR §2)

### 2.1 Current state

| Layer | AS-IS | Honesty reading |
|-------|-------|-----------------|
| EMP platform catalogs L1 | DOC/ET · ST · POS · DEPT · CF CNS · MergeToken | **Slice LIVE** |
| EMP browser spot / platform QA | EMPPLATQA2 GWC · R-PLT-EMP-FE CLOSED | **C-SLICE** |
| Consumer FE status/position/dept | QC-FE GWC CLOSED | **≠ module DONE** |
| Custom-field consumer + admin | LIVE · **`R-PLT-EMP-CF-FE-01`** HOLD | **LIVE** · P2 NOTE |
| FE-ADMIN notes pack | Nest admin ABSENT/DENY | **HOLD** · not flag gate |
| MergeToken EXT | SEALED | **≠ personnel module UAT** |
| Employee e2e linkage (hire, DEC, PAY, ATT) | Partial spots · **`employees_e2e_linkage_ready=false`** | **Open** |
| Module EMP UAT matrix | **Not closed** — J-HRM-03* · UF-HRM-01..12 depth | **Flag false correct** |
| Program W8 | Row DISPATCHED for this seat | **Needs SA mint** **`R-PLT-EMP-UAT-01`** |

### 2.2 Failure impact if mis-governed

| Risk | Impact |
|------|--------|
| Flip flag from L1/CNS/FE GWC alone | False UAT-ready · QC NO-GO · sponsor trust loss |
| Reopen EMP CNS as «finish EMP» | Scope creep · violates CNS seal |
| Reopen consumer FE CLOSED | Seal churn · dual dispatch |
| Claim Phase1 EMP DONE from catalogs | Violates continuous honesty program |
| Bundle REC/ATT/PAY flip | Violates peer SA locks |
| Reopen FE-ADMIN as mandatory dev-fe | Violates EMP-FE-ADMIN SA Option A |
| Promote `employees_e2e_linkage_ready` from hire slice alone | False e2e readiness |

---

## 3. Options (ADR §3)

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint **`R-PLT-EMP-UAT-01`** documenting: (1) **LIVE** EMP L1/CNS/FE inventory §1.2; (2) **`hrm_personnel_uat_ready=false`** **correct** until sponsor opens named EMP module UAT UF wave; (3) **`employees_e2e_linkage_ready=false`** RETAIN as companion; (4) **DENY** flip/reopen/invent paths §6.3; (5) **RETAIN** peer HOLDs + L1/CNS/FE stamps + MergeToken EXT. |
| **Benefits** | Aligns W8 EMP evidence chain · closes honesty gap without code · preserves U88 bandwidth · symmetric with REC/ATT/PAY peers |
| **Costs** | Full EMP module UAT deferred until sponsor |
| **Risks** | HOLD misread as «EMP broken» → mitigations **L-EMP-UAT-*** |
| **Gate** | Evidence chain grep **`hrm_personnel_uat_ready=false`** consistent |

### Option B — UNLOCK honesty flag / «EMP module UAT ready» (default reject)

| | |
|--|--|
| **Description** | Set **`hrm_personnel_uat_ready=true`** because L1/CNS/browser/consumer FE slices passed. |
| **Benefits** | None on current evidence — contradicts QC |
| **Costs** | Honesty violation · false module GO |
| **Risks** | **DENIED** mission line |
| **Gate** | **REJECT** unless sponsor + UF matrix + QC sign-off in future wave |

### Option C — REJECT invent / reopen / flip

| | |
|--|--|
| **Description** | Flip flag · reopen EMP CNS · reopen FE CLOSED · reopen FE-ADMIN/CUSTOM-FIELD HOLD · reopen MergeToken EXT · claim EMP module UAT · invent Nest pos/dept admin · seed · `apps/**` from this seat. |
| **Benefits** | None |
| **Costs** | Seal loss |
| **Risks** | **DENY** all mission FORBIDDEN lines |

---

## 4. Trade-off matrix (ADR §4)

| Criteria | Weight | Option A HOLD | Option B flip | Option C invent |
|---|--:|--:|--:|--:|
| QC/QA honesty chain integrity | 5 | **5** | 0 | 0 |
| W8 continuous policy compliance | 5 | **5** | 0 | 0 |
| Clarity L1/CNS/FE slice vs module UAT | 5 | **5** | 1 | 0 |
| Sponsor trust | 4 | **5** | 0 | 0 |
| Time to full EMP module UAT | 3 | 3 | **4** | 1 |
| Delivery cost now | 4 | **5** | 2 | 0 |
| **Weighted tendency** | | **Dominates** | Reject | Reject |

---

## 5. Failure modes and mitigation (ADR §5)

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | «EMPPLATQA2 ⇒ flip flag» | Bus promote without UF | Cite EMPPLATQA2 honesty § + this SPEC |
| A | User thinks status admin missing | Support ticket | Cite Network L1 + **`R-PLT-EMP-FE-ADMIN-01`** HOLD ≠ absent consumer |
| A | PM drops EMP honesty row | Board scan | **`R-PLT-EMP-UAT-01`** mint |
| B | False SERVICE_READINESS | QC audit | NO-GO · revert flag |
| C | Reopen CNS GWC | Duplicate QA FAIL | FORBIDDEN · **`EMPCFQA-MSK14LUH` RETAIN** |
| C | Reopen FE CLOSED | Duplicate dev-fe | FORBIDDEN · ST/POS/DEPT seals |
| C | Bundle REC/ATT/PAY flip | Multi flag promote | Cite peer **`R-PLT-REC-UAT-01`** · **`R-PLT-ATT-UAT-01`** · **`R-PLT-PAY-E2E-01`** |
| C | Flip employees_e2e from hire slice | Honesty drift | Cite bus · separate e2e wave |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_P2 HOLD** |
| **Why** | EMP **L1/CNS/consumer FE slices** are **LIVE and GWC** — but **every** gate evidence requires **`hrm_personnel_uat_ready=false`**. Full J-HRM-03* matrix · e2e linkage · profile/contracts depth open. CNS SEAL, FE CLOSED, FE-ADMIN HOLD, MergeToken EXT are **orthogonal** — **not** unlock paths for flag flip. **`employees_e2e_linkage_ready=false`** remains correct for cross-module spine wave. |
| **Assumptions** | Sponsor did not open «EMP module UAT wave» with UF list in this message. |
| **Rejected** | **Option B** flag flip · **Option C** full DENY list |

### 6.1 Unlock gates (Option A does not open)

| Question | Answer |
|----------|--------|
| Flip **`hrm_personnel_uat_ready=true`** now? | **NO** |
| Flip **`employees_e2e_linkage_ready=true`** via this seat? | **NO** — separate sponsor e2e wave |
| Reopen EMP-CUSTOM CNS GWC? | **FORBIDDEN** |
| Reopen EMP ST/POS/DEPT FE CLOSED? | **FORBIDDEN** |
| Reopen EMP FE-ADMIN / CF HOLD? | **FORBIDDEN** |
| Reopen MergeToken EXT? | **FORBIDDEN** |
| Dispatch dev-fe/dev-be for «EMP module UAT» from HOLD? | **NO** default |
| Claim J-HRM-03* module DONE? | **NO** |

### 6.2 Sponsor-gated narrow alternate (not default)

```text
entry: sponsor message explicit «mở wave EMP module UAT» + named UF-IDs (J-HRM-03 full matrix, UF-HRM-01..12 where in scope, employees_e2e_linkage ACs, profile/contracts tab depth, DEC/PAY/ATT cross-nav, persona matrix) + U65 browser evidence plan
retain: all prior EMP L1/CNS/FE GWC stamps · CNS SEAL · FE CLOSED · FE-ADMIN HOLD · MergeToken EXT · employees_e2e_linkage false until separate e2e wave closes · honesty false until QC closes module wave
scope_allowed: QA browser matrix per UF · QC module gate · THEN pm may set hrm_personnel_uat_ready=true (and aligned synonyms) with QC sign-off on module scope only
scope_FORBIDDEN: flip flag from L1 catalog/CNS/FE alone · reopen CNS as pretext · reopen FE CLOSED · reopen FE HOLD · seed · API-only · bundle recruitment/attendance/payroll/printable flip · invent Nest pos/dept admin
exit: R-PLT-EMP-UAT-01 may CLOSE or narrow; requires QC GO on full module scope — not L1 slice alone
```

### 6.3 Architecture boundary (text diagram)

```text
  Platform L1 DOC/ET EMPPLATQA-MSIZXHIM GWC              --> LIVE catalog slice
  Browser admin AC-PLT-EMP EMPPLATQA2-MSJ0OAL9 GWC     --> LIVE · R-PLT-EMP-FE CLOSED · honesty false RETAIN
  STATUS/POSITION/DEPT L1 invent KEY                     --> LIVE L1 slices
  STATUS/POSITION/DEPT consumer FE QC GWC                --> CLOSED · ≠ module UAT
  Custom-field CNS EMPCFQA-MSK14LUH                      --> LIVE CNS slice SEALED
  Custom-field consumer + Settings admin                 --> LIVE · R-PLT-EMP-CF-FE-01 HOLD RETAIN
  MergeToken core + EXT EMPTOK* SEALED                   --> LIVE platform slice · ≠ personnel module UAT
  FE-ADMIN notes R-PLT-EMP-FE-ADMIN-01                   --> HOLD RETAIN (Nest admin ABSENT/DENY)
  Employee e2e linkage (hire/DEC/PAY/ATT)                --> OPEN (honesty)
  Module EMP UAT matrix (J-HRM-03*)                      --> OPEN (honesty)
  hrm_personnel_uat_ready / personnel_uat              --> false RETAIN (R-PLT-EMP-UAT-01)
  employees_e2e_linkage_ready                              --> false RETAIN (companion)
  recruitment_uat_ready (peer)                             --> false RETAIN (R-PLT-REC-UAT-01)
  attendance_uat_ready (peer)                              --> false RETAIN (R-PLT-ATT-UAT-01)
  payroll_e2e_ready (peer)                                 --> false RETAIN (R-PLT-PAY-E2E-01)
  contracts_printable_ready (peer)                         --> false RETAIN (R-PLT-CTR-PRINTABLE-01)
  C-SLICE-≠-MODULE                                         --> RETAIN
```

---

## 7. Implementation and validation plan (ADR §7)

| Step | Owner | Action |
|------|-------|--------|
| 1 | pm | Seal board row **CONFIRMED** · append **`R-PLT-EMP-UAT-01`** HOLD P2 |
| 2 | pm | **Do not** set **`hrm_personnel_uat_ready=true`** · **Do not** dispatch EMP module UAT unlock from this seat |
| 3 | pm | Keep honesty registry until sponsor opens UF wave — then **new** work_item (not silent flip) |
| 4 | qc | Any future flag promote requires **full** EMP module UF evidence — not L1/CNS/FE alone |
| Rollback | sa | If flag flipped wrongly — CORRECTION bus · restore false · cite this SPEC |
| Validation | qa | Module wave must be U65 browser UF matrix when sponsor opens |
| Success | pm | SPEC_LEN ≥8192 NFD · PASS_TO_PM · honesty unchanged |

---

## 8. Locks (L-EMP-UAT-*)

| Lock | Rule |
|------|------|
| **L-EMP-UAT-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 does not delete L1/CNS/FE catalog ACs · deferred **module** UAT only |
| **L-EMP-UAT-02 L1/CNS/FE LIVE** | All §1.2 stamps **RETAIN** — HOLD does not negate slice evidence |
| **L-EMP-UAT-03 Flag false** | **DENY** PM/dev flip without sponsor UF wave + QC |
| **L-EMP-UAT-04 CNS orthogonality** | **DENY** reopen **`EMPCFQA-MSK14LUH`** as module UAT unlock |
| **L-EMP-UAT-05 FE CLOSED orthogonality** | **DENY** reopen ST/POS/DEPT FE CLOSED as module unlock |
| **L-EMP-UAT-06 FE-ADMIN/CUSTOM-FIELD** | **DENY** reopen **`R-PLT-EMP-FE-ADMIN-01`** · **`R-PLT-EMP-CF-FE-01`** as module unlock |
| **L-EMP-UAT-07 MergeToken EXT** | **DENY** reopen **`R-EMP-TOK-EXT`** as module unlock |
| **L-EMP-UAT-08 E2E companion** | **`employees_e2e_linkage_ready=false`** RETAIN · **DENY** flip from hire slice alone |
| **L-EMP-UAT-09 REC/ATT/PAY/CTR peer** | **DENY** bundled flip with recruitment/attendance/payroll/printable |
| **L-EMP-UAT-10 Honesty** | **C-SLICE-≠-MODULE** RETAIN · **DENY** Phase1 EMP DONE from L1 |
| **L-EMP-UAT-11 Nest pos/dept admin** | **FORBIDDEN** invent — Settings SoT RETAIN |
| **L-EMP-UAT-12 Path lock** | UTF-8 no BOM NFD write gate |

---

## 9. F.1 physical notes (API_DESIGN alignment — read-only)

| Function / area | Mục đích (VI) | Slice status today | Honesty impact |
|-----------------|---------------|--------------------|----------------|
| **F-EMP-CAT-DOC/ET-01** | Danh mục loại hồ sơ / loại hợp đồng lao động platform | **LIVE** L1 | **≠** module UAT ready |
| **F-EMP-CAT-ST-01 / ST-02** | Trạng thái NV + lý do Nest catalog invent KEY | **LIVE** L1 | **≠** flag true |
| **F-EMP-CAT-POS-01** | Chức danh Settings job_titles invent KEY | **LIVE** L1 | **≠** flag true |
| **F-EMP-CAT-DEPT-01** | Phòng ban Settings departments invent KEY | **LIVE** L1 | **≠** flag true |
| **F-EMP-CF-CNS-01** | Custom field invent assert trên employee write | **LIVE** CNS | **≠** module UAT |
| **F-EMP-TOK-01 / EXT** | MergeToken custom.emp Settings UF | **LIVE** / **SEALED** | **≠** personnel module UAT |
| **Employee CRUD consumer** | Form pickers ST/POS/DEPT/CF | **FE CLOSED** slices | **≠** module DONE |
| **Profile / contracts tab / e2e spine** | J-HRM-03 depth · iframe · linkage | Partial spot | **Supports flag false** |
| **Nest emp_position / emp_department admin** | Dual master | **DENIED** | **Supports FE-ADMIN HOLD** |

No new API_DESIGN rows required this seat — **disposition + honesty governance only**.

---

## 10. Evidence index (RETAIN — grep-backed)

| Evidence path | Stamp / verdict | Honesty line |
|---------------|-----------------|--------------|
| `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-01.md` | **`EMPPLATQA-MSIZXHIM`** | hrm_personnel_uat_ready=false |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-02.md` | **`EMPPLATQA2-MSJ0OAL9`** | false RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-02.md` | GWC · R-PLT-EMP-FE CLOSED | false · DENY module UAT |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-catalog-qa-01.md` | **`EMPSTQA-MSK20G7H`** | false |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qa-01.md` | **`EMPCFQA-MSK14LUH`** | false RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qa-01.md` | **`EMPTOKQA-MSJ290VB`** | false |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-ext-qa-01.md` | **`EMPTOKEXTQA-MSJ57PE1`** | false RETAIN |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md` | **`R-PLT-EMP-FE-ADMIN-01`** | hrm_personnel_uat_ready=false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-FE-SA-01.md` | **`R-PLT-EMP-CF-FE-01`** | false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01.md` | **`R-PLT-REC-UAT-01`** | peer false RETAIN |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01.md` | **`R-PLT-ATT-UAT-01`** | peer false RETAIN |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | EMP-UAT row DISPATCHED | board SoT |
| `docs/program/AGENT_MESSAGE_BUS.md` | grep hrm_personnel_uat_ready | consistent false |

---

## 11. Trace to program board (W8)

| Board row | Status | Action |
|-----------|--------|--------|
| EMP-FE-01 → QA-02 → QC-02 | GWC **`EMPPLATQA2-MSJ0OAL9`** | **RETAIN** · **DENY** reopen as module unlock |
| EMP STATUS/POSITION/DEPT L1+FE chain | GWC / CLOSED mix | **RETAIN** |
| EMP-CUSTOM-FIELD CNS | GWC **`EMPCFQA-MSK14LUH`** | **RETAIN** |
| MergeToken custom.emp + EXT | GWC · EXT SEALED | **RETAIN** |
| EMP-FE-ADMIN-NOTES-SA-01 | CONFIRMED HOLD | **RETAIN** |
| EMP-CUSTOM-FIELD-FE-SA-01 | CONFIRMED HOLD | **RETAIN** |
| REC-UAT-HOLD-SA-01 | SEALED | peer RETAIN |
| ATT-UAT-HOLD-SA-01 | SEALED | peer RETAIN |
| PAY-E2E / CTR-PRINTABLE | SEALED | peer RETAIN |
| **EMP-UAT-HOLD-SA-01** | **this seat** | Option A LOCK · mint **`R-PLT-EMP-UAT-01`** |

---

## 12. Discrimination matrix (PM / QC)

| Evidence | Flip `hrm_personnel_uat_ready`? | Why |
|----------|-------------------------------|-----|
| L1 **`EMPPLATQA-MSIZXHIM`** | **NO** | L1 C-SLICE |
| Browser **`EMPPLATQA2-MSJ0OAL9`** | **NO** | Platform slice |
| ST/POS/DEPT L1 + FE CLOSED | **NO** | Catalog + consumer slices |
| CNS **`EMPCFQA-MSK14LUH`** | **NO** | Custom-field CNS slice |
| MergeToken **`EMPTOK*`** | **NO** | Platform slice |
| FE-ADMIN LIVE + HOLD | **NO** | P2 NOTE |
| J-HRM-03 narrow spot PASS | **NO** | C-SLICE |
| Sponsor EMP module UAT wave + QC GO | **YES** (future) | §6.2 only |

---

## 13. RETAIN stamps (EMP slices · peers · honesty)

| Stamp / residual | Action |
|------------------|--------|
| **`EMPPLATQA-MSIZXHIM`** · L1 DOC/ET | **SEAL RETAIN** |
| **`EMPPLATQA2-MSJ0OAL9`** · browser platform | **SEAL RETAIN** |
| **`R-PLT-EMP-FE`** | **CLOSED RETAIN** |
| **`EMPSTQA-MSK20G7H`** · **`EMPPOSQA2-MSK3CDH1`** · **`EMPDEPTQA-MSK3VVXX`** | **L1 RETAIN** |
| **`R-PLT-EMP-ST/POS/DEPT-FE-01`** | **CLOSED RETAIN** |
| **`EMPCFQA-MSK14LUH`** | **SEAL RETAIN** |
| **`EMPTOKQA-MSJ290VB`** · **`EMPTOKEXTQA-MSJ57PE1`** · **`R-EMP-TOK-EXT`** | **SEAL RETAIN** |
| **`R-PLT-EMP-FE-ADMIN-01`** · **`R-PLT-EMP-CF-FE-01`** | **HOLD RETAIN** |
| **`R-PLT-EMP-UAT-01`** | **HOLD mint this seat** |
| **`R-PLT-REC-UAT-01`** · **`R-PLT-ATT-UAT-01`** · **`R-PLT-PAY-E2E-01`** · **`R-PLT-CTR-PRINTABLE-01`** | **HOLD RETAIN** (peers) |
| **`hrm_personnel_uat_ready`** · **`employees_e2e_linkage_ready`** | **false RETAIN** |
| **`C-SLICE-≠-MODULE`** | **RETAIN** |

---

## 14. Non-goals (explicit)

1. Do not set **`hrm_personnel_uat_ready=true`** without sponsor module wave.
2. Do not set **`employees_e2e_linkage_ready=true`** without sponsor e2e linkage wave.
3. Do not reopen EMP CNS GWC as FAIL pretext.
4. Do not reopen EMP ST/POS/DEPT FE CLOSED as module unlock.
5. Do not reopen EMP FE-ADMIN / CUSTOM-FIELD HOLD as module unlock.
6. Do not reopen MergeToken EXT as module unlock.
7. Do not claim module EMP UAT · J-HRM-03* DONE · Phase1 EMP DONE.
8. Do not bundle flip with **`recruitment_uat_ready`** · **`attendance_uat_ready`** · **`payroll_e2e_ready`** · **`contracts_printable_ready`**.
9. Do not invent Nest `emp_position` / `emp_department` admin panels.
10. Do not dispatch dev-fe/dev-be for module closure without sponsor UF wave.
11. Do not seed EMP matrix (U65).
12. Do not edit `apps/**` in this seat.

---

## 15. Handback packet (mandatory)

| Field | Value |
|-------|--------|
| **completion_report** | EMP/personnel module honesty formalized as Option **A LOCKED** · mint **`R-PLT-EMP-UAT-01`** ACCEPT_AS_IS_P2 HOLD · documented **LIVE** L1/CNS/FE slices (EMPPLATQA* · EMPST/POS/DEPT · EMPCFQA · EMPTOK*) + FE CLOSED + FE-ADMIN/CUSTOM-FIELD HOLD + MergeToken EXT SEALED vs **`hrm_personnel_uat_ready=false`** / **`employees_e2e_linkage_ready=false`** RETAIN · **DENY** flag flip · **DENY** reopen EMP CNS · **RETAIN** EMPCFQA + EMP FE CLOSED + peer REC/ATT/PAY honesty HOLDs · no `apps/**`. |
| **selected_option** | **Option A** — ACCEPT_AS_IS_P2 HOLD |
| **residual** | **`R-PLT-EMP-UAT-01`** = **HOLD** |
| **SPEC_LEN** | Verified NFD UTF-8 no BOM · gate ≥8192 bytes |
| **next_owner** | **pm** — seal W8 row CONFIRMED · **do not** flip honesty · U88 next vertical per board (not EMP module UAT unlock) |
| **next_dispatch_prompt** | `work_item_id: PO-HRM-CONTINUOUS-W8-PM-SEAL-EMP-UAT-HOLD-01` · from_role: pm · to_role: pm · lane: governance · entry: SA PASS `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-UAT-HOLD-SA-01` Option A · evidence `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-UAT-HOLD-SA-01.md` · mint `R-PLT-EMP-UAT-01` HOLD on W8 board + honesty registry · exit: row CONFIRMED · RETAIN `hrm_personnel_uat_ready=false` · RETAIN `employees_e2e_linkage_ready=false` · RETAIN `EMPCFQA-MSK14LUH` · RETAIN EMP ST/POS/DEPT FE CLOSED · RETAIN `R-PLT-EMP-FE-ADMIN-01` · RETAIN `R-PLT-EMP-CF-FE-01` · RETAIN `R-EMP-TOK-EXT` · RETAIN peer REC/ATT/PAY/CTR flags false · C-SLICE · **cấm** dispatch dev-* EMP module UAT unlock · **cấm** flip flag · **cấm** reopen EMP CNS · ack PASS_TO_PM internal seal |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-UAT-HOLD-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 16. SA KB append (reference)

| Context | EMP module UAT honesty after L1/CNS/FE GWC slices · U88 after REC-UAT SEAL |
| Action | Option A LOCK · mint R-PLT-EMP-UAT-01 · L1/CNS/FE LIVE vs flag false taxonomy |
| Outcome | PASS_TO_PM · no apps/** |
| Evidence | This SPEC path |
| Reuse-tag | emp-uat-honesty-hold, r-plt-emp-uat-01, slice-live-neq-module-uat, deny-invent-flip, l1-cns-fe-catalog-retain, empcfqa-retain, emp-fe-closed-retain, emp-fe-admin-hold-retain, emp-cf-fe-hold-retain, emptok-ext-sealed-retain, rec-att-pay-peer-retain, employees-e2e-false-retain, path-lock-nfd |

---

## 17. Extended governance notes (cross-reference)

**Continuous W8 policy:** Board header **Honesty LOCKED: all `*_ready=false` · `C-SLICE-≠-MODULE`**. This seat **formalizes the EMP/personnel leg** of that registry — complementary to REC-UAT, ATT-UAT, PAY-E2E, and CTR-PRINTABLE seats already SEALED. PM must not interpret «REC honesty formalized» as permission to flip personnel (or vice versa).

**EMPPLATQA2 seal discipline:** Browser platform QA **`EMPPLATQA2-MSJ0OAL9`** explicitly retained **`hrm_personnel_uat_ready=false`** alongside **`R-PLT-EMP-FE` CLOSED**. This seat **does not** reopen EMP-FE-01; it **documents** why platform browser GWC did not promote module honesty.

**Consumer FE CLOSED vs module UAT:** STATUS/POSITION/DEPT consumer FE Conditions are **CLOSED ACCEPT** — reopening them as «finish personnel UAT» would violate **`L-EMP-UAT-05`** and duplicate closed W8 work. Module promotion requires **new** UF scope under sponsor wave, not consumer re-QA.

**EMP-FE-ADMIN peer (SPEC EMP-FE-ADMIN-NOTES):** Nest ST/STR admin is **Network L1 only** with **ACCEPT_AS_IS_P2 HOLD** on **`R-PLT-EMP-FE-ADMIN-01`**. Settings job_titles/departments admin is **LIVE**. Module UAT promotion must not treat FE-ADMIN HOLD as a blocker to flip nor as a mandatory unlock path — both are **orthogonal** to **`R-PLT-EMP-UAT-01`**.

**EMP-CUSTOM-FIELD peer (SPEC EMP-CUSTOM-FIELD-FE):** Consumer dynamic fields and Settings admin are **LIVE** with **Option B HOLD** on **`R-PLT-EMP-CF-FE-01`**. CNS invent KEY is **SEALED** — **FORBIDDEN** reopen as module unlock pretext.

**MergeToken EXT:** **`EMPTOKEXTQA-MSJ57PE1`** / **`R-EMP-TOK-EXT`** is **SEALED** — platform Settings UF slice only. Personnel module UAT requires employee operational spine evidence, not MergeToken retest alone.

**employees_e2e_linkage_ready companion flag:** Hire from REC soft-link, contracts iframe spot (**J-HRM-03** narrow PASS), and cross-nav to DEC/PAY/ATT may show **C-SLICE** GWC — bus consistently keeps **`employees_e2e_linkage_ready=false`** for full e2e spine. PM must not flip **`hrm_personnel_uat_ready`** and **`employees_e2e_linkage_ready`** together without explicit QC scope for **each** flag.

**J-HRM-03 journey map:** List→detail employee, profile tabs, contracts view, DEC/PAY consumer linkage, and cross-nav remain **architecture test gaps** for module UAT — catalog L1 PASS does not close J-* rows.

**Platform catalog vs operational depth:** W8 EMP vertical implemented **F-EMP-CAT-* L1** platform catalog pattern (invent KEY, Settings SoT for POS/DEPT, soft-retire, CNS wire) — distinct from **operational** profile depth, org chart, bulk import, and full UF-HRM-01..12 required for module UAT.

**U65 zero-seed:** Any future module wave must create sources from FE — HOLD does not authorize seed to «green» matrix.

**QC coaching:** When auditing EMP evidence, QC must copy honesty line from evidence header — if missing, **FAIL spec_gap** to QA author. Module promotion discussion with **`hrm_personnel_uat_ready=false`** in evidence → **NO-GO** unless sponsor wave + full matrix PASS.

**Dev coaching:** `dev-be` / `dev-fe` must not interpret L1 invent KEY or FE CLOSED as ticket to update honesty JSON without PM + QC after sponsor module wave.

**BA coaching:** No new AC-PLT-EMP **module UAT** pack required for HOLD. Future sponsor wave may request BA delta for **full** EMP UF — separate work_item.

**TM/QC block:** Recommend **NO-GO** on any release narrative claiming EMP module UAT while **`R-PLT-EMP-UAT-01=HOLD`** and flag false.

**Peer REC-UAT (SPEC 35658):** REC module honesty **does not** unlock personnel. Hire soft-link slices remain **orthogonal** flags.

**Peer ATT-UAT (SPEC 32664):** ATT module honesty **does not** unlock personnel. Leave/attendance consumer spots remain orthogonal.

**Peer PAY-E2E (SPEC 28002):** Payroll J07 spots **do not** unlock personnel. **`payroll_e2e_ready=false`** RETAIN.

**FE-ADMIN-REOPEN-GATE-BA-02:** Reopen-gate inventory lists **`hrm_personnel_uat_ready=false`** — **not** unlock of module honesty. This seat is **downstream SA disposition**.

**Synonym discipline:** Documents using `personnel_uat` vs `hrm_personnel_uat_ready` must be updated **together** on any future promote — default all **false** until QC signs module scope.

**Scope parity (U19):** Future module wave must retain list↔get-by-id↔consumer assert parity on employee and catalog endpoints — HOLD does not waive scope audit on execution waves.

**Path lock:** Canonical NFD `Tài liệu` — this SPEC written via PowerShell UTF-8 no BOM gate per mission protocol.

**EMPCFQA coaching for PM dispatch:** When dispatching execution after this seat, **cấm** wording «close EMP UAT via custom-field CNS retest» — CNS is **SEALED**. Module work must cite **new** UF IDs under sponsor wave, not reopen **`EMPCFQA-MSK14LUH`**.

**P0 UX slices vs module UAT:** Narrow QC GWC on EMP platform browser **≠** module «chạy được». Console errors, scope 409, empty employee list when API fail, and duplicate shell on embed surfaces still **FAIL** module readiness even when L1 catalog honesty HOLD is correct.

**Vertical continuity U88:** After PM seals this row, governance may continue to next W8 vertical per board — **idle-ok EMP honesty seat ≠ idle EMP product program**; full spine remains on continuous board with honesty flags false until sponsor module waves.

**EMPPLATQA stamp coaching:** L1 **`EMPPLATQA-MSIZXHIM`** closed stale dist and proved DOC/ET catalogs — honesty false on every handoff was **intentional** module gate, not QA omission. PM must not «fix» by flipping board JSON without sponsor UF wave.

**Settings vs Nest admin taxonomy:** POSITION/DEPT product admin is **Settings/XBOS LIVE**; Nest dual-master admin is **DENIED forever** per catalog Option A. Personnel module UAT does **not** require inventing Nest admin panels — would violate EMP-FE-ADMIN SA and **`L-EMP-UAT-11`**.

**Document-types / employment-types FE CLOSED path:** **`R-PLT-EMP-FE` CLOSED** means Settings admin path for DOC/ET is proven — **not** that entire Employees module passed UAT. Discrimination table §12 applies to all EMPPLATQA* stamps.

**Cross-module hire linkage:** REC hire outcome asserting stage ∈ catalog is **REC C-SLICE** — does not close **`employees_e2e_linkage_ready`**. Personnel flag remains false until explicit e2e UF wave closes DEC/PAY/ATT consumer chains from employee profile.

**Insurance / contracts tab spots:** Prior J-HRM-03 iframe PASS is **narrow** — does not close insurance empty-mask class, contract create depth, or full UF-HRM-12 matrix. Honesty flags remain false.

**Mobile OUT default:** Mobile employee journeys (J-MOB-*) are **OUT** of this HOLD scope unless sponsor expands UF list — board honesty false still applies to web module UAT claims.

**Governance bandwidth U88:** This seat is **docs-only disposition** — zero execution quota consumed. PM should seal quickly and advance continuous board without dispatching dev lanes from HOLD text alone.

**Duplicate flip prevention:** If two PM agents attempt flip from different slice evidence (EMPPLATQA2 vs EMPCFQA), QC must **REJECT both** and cite **`R-PLT-EMP-UAT-01`** — single minted residual is SoT for module honesty.

**Audit trail:** Bus grep **`hrm_personnel_uat_ready=false`** spans EMP, REC, PAY, ATT, SI, CTR waves — consistency proves program-level honesty registry, not per-module typo. This SPEC anchors EMP leg only.

**Retire wording «personnel pilot ready»:** SERVICE_READINESS and USER_SERVICE_STATUS must not use «personnel UAT ready» while this HOLD open — use «L1 catalog slices LIVE» + «module UAT HOLD» language per **`L-EMP-UAT-01`**.

---

*End of SPEC — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-UAT-HOLD-SA-01*
