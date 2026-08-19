# PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01 — Option/F.1 · `recruitment_uat_ready` honesty HOLD (W8 U88)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01` |
| **Parent** | W8 continuous honesty registry · after **`ATT-UAT-HOLD-SA-01`** SEALED (Option A · **`R-PLT-ATT-UAT-01`** · SPEC 32664) · peer **`PAY-E2E-HOLD-SA-01`** SEALED (`R-PLT-PAY-E2E-01` · SPEC 28002) · **`CTR-PRINTABLE-HOLD-SA-01`** SEALED (`R-PLT-CTR-PRINTABLE-01`) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous governance |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for program honesty flag **`recruitment_uat_ready=false`** (synonyms **`jd_dynamic_done=false`**, **`hrm_recruitment_uat_ready`**) — formalize LIVE REC platform stage catalog **L1/CNS slices** + **FE-ADMIN HOLD** vs **forbidden** REC module UAT / Phase1 REC DONE claims |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · mint **`R-PLT-REC-UAT-01`** · ba-process **HOLD** (no new AC pack) · **DENY** flip `recruitment_uat_ready=true` · **DENY** reopen REC CNS as module UAT unlock |
| **residual_id** | **`R-PLT-REC-UAT-01`** *(minted this seat — consolidates REC module honesty + L1/CNS stamp inventory + FE-ADMIN HOLD cite + J-HRM-05* denial taxonomy)* |
| **peer_cite_att_uat** | [`ATT-UAT-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01.md) **`R-PLT-ATT-UAT-01`** · **`attendance_uat_ready=false`** — **RETAIN · FORBIDDEN bundled flip with recruitment** |
| **peer_cite_pay_e2e** | [`PAY-E2E-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01.md) **`R-PLT-PAY-E2E-01`** · **`payroll_e2e_ready=false`** — **RETAIN · orthogonal** |
| **peer_cite_printable** | [`CTR-PRINTABLE-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-PRINTABLE-HOLD-SA-01.md) **`R-PLT-CTR-PRINTABLE-01`** — **RETAIN · orthogonal** |
| **peer_cite_rec_fe_admin** | [`REC-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md) **`R-PLT-REC-FE-ADMIN-01`** — **RETAIN HOLD · FORBIDDEN reopen as recruitment UAT unlock** |
| **peer_cite_rec_cns** | REC-STAGE-CATALOG CNS QC-01 **GWC** stamp **`RECCNSQA-MSJ8KFL7`** · kanban **`RECCNSKAN-MSJ8OZBH`** · CNS-BE jest READY · CNS-FE vitest absorbed — **SEAL RETAIN · FORBIDDEN reopen as FAIL pretext** |
| **Honesty** | **`recruitment_uat_ready=false`** · **`jd_dynamic_done=false`** · **`payroll_e2e_ready=false`** (peer) · **`attendance_uat_ready=false`** (peer) · **`contracts_printable_ready=false`** (peer) · **`hrm_personnel_uat_ready=false`** · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module REC UAT · Phase1 REC DONE · J-HRM-05 module DONE from slices · seed · flip recruitment · reopen REC CNS · reopen REC FE-ADMIN as unlock · claim JD DnD / UV compare module ready |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

> **HARD EXIT GATE:** NFD path · UTF-8 **no BOM** · Shell **Length ≥ 8192** verified before CONFIRMED. Empty turn = INVALID.

---

## 1. Decision context (ADR option pack §1)

| | |
|--|--|
| **Decision title** | Formalize program honesty: **`recruitment_uat_ready=false`** HOLD vs sponsor-gated REC module UAT UF wave vs invent flip / reopen REC CNS / claim REC module UAT |
| **Requestor** | pm · U88 after ATT-UAT SA SEALED |
| **Decision owner** | sa |
| **Related** | FR-UC-BP-REC-* · AC-PLT-REC-* · AC-PLT-REC-STAGE-01* · J-HRM-05 · J-HRM-REC-UV-01 · J-HRM-JD-YCTD-01 · J-REC-WF-* · UF-HRM-REC-* · platform stage catalog L1/CNS chain W8 |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + **§9 F.1** |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-REC-UAT-HOLD-SA-01` |

### 1.1 Problem — what many REC GWC L1/CNS slices proved vs what honesty flags still say

Under U65, W8 already **proved narrow REC platform catalog slices** (Nest `rec_pipeline_stage` L1 API smoke, browser admin CREATE N+1, CNS consumer invent KEY, Kanban EFF columns, IV soft-gate, Settings pipeline-stages FE-ADMIN LIVE) while **every** QC/QA evidence file in the grep chain repeats **`recruitment_uat_ready=false`** and **`jd_dynamic_done=false`**.

Resume plan K6.2e sealed **slice GWC** with honesty **LOCKED false** at REC QC stamps — explicitly **DENY module REC UAT** despite browser AC-PLT-REC partial PASS and **`RECPLATQA2-MSIXNFE2`** GWC.

**Question for F.1:** Should SA recommend flipping **`recruitment_uat_ready=true`** because RECPLATQA/RECPLATQA2 / RECCNSQA / stage catalog CNS slices passed QC GWC, or **LOCK Option A HOLD** until sponsor opens a **named REC module UAT UF wave** with full J-HRM-05* matrix + QC gate?

**Answer (LOCKED):** **Option A** — slice LIVE **≠** honesty flag true. **UNLOCK flag flip only** when sponsor message opens REC module UAT with explicit UF/J-* inventory + QC GO on **module** scope — else **HOLD forever-until-sponsor**.

### 1.2 LIVE inventory — REC platform stage catalog / CNS / FE-ADMIN slices (READ-ONLY)

These surfaces are **LIVE** and **RETAIN** — they are **not** arguments to flip **`recruitment_uat_ready`**:

| Vertical | Surface / stamp | Evidence class | Verdict |
|----------|-----------------|----------------|---------|
| **Stage catalog L1 API** | F-REC-CAT-STG/EFF · invent KEY · hiredOutcomeKey · STAGE-UNKNOWN pool | QA **`RECPLATQA-MSIWKJWP`** 10/10 L1 · QC GWC REC-QC-01 | **L1 LIVE slice SEALED** |
| **Stage catalog browser admin** | Settings Giai đoạn REC · open N+1 CREATE | QA **`RECPLATQA2-MSIXNFE2`** · QC REC-QC-02 GWC · K6.2e CLOSED | **L1 browser LIVE** · **≠ module UAT** |
| **CNS consumer assert** | VAL-REC-CNS-02 pool · IV soft-gate VAL-REC-CNS-05 | QA **`RECCNSQA-MSJ8KFL7`** · QC CNS GWC | **CNS LIVE slice SEALED** |
| **Kanban EFF columns** | VAL-REC-CNS-04 · `RECCNSKAN-MSJ8OZBH` | CNS-FE vitest · QA absorbed | **L1 consumer LIVE** |
| **FE-ADMIN pipeline-stages** | `RecPipelineStageSettingsPanel` · upsert/retire LIVE | REC-FE-ADMIN SA **`R-PLT-REC-FE-ADMIN-01`** HOLD | **LIVE admin** · P2 NOTE · **not** module unlock |
| **DOCS** | SRS v0.27 CH07b · stage catalog DOC-DELTA | REC-STAGE-CATALOG-DOCS ACCEPT | **RETAIN** |
| **REC vertical SA** | Option B Nest SoT locked | REC-STAGE-CATALOG-SA-01 | **RETAIN** · **≠** module UAT |
| **JD DnD CERTIFIED slice** | UX process stamp | Bus honesty false on seal | **C-SLICE** · **≠ jd_dynamic_done true** |
| **IV one-active browser** | REC-IV slice GWC | recruitment_uat_ready=false on evidence | **C-SLICE** · **≠ module DONE** |

**Critical discrimination:**

| Claim | Allowed? | Why |
|-------|----------|-----|
| «Stage catalog L1 API smoke 10/10 passed QC» | **YES** | **`RECPLATQA-MSIWKJWP`** C-SLICE |
| «Browser admin CREATE N+1 + F5 passed REC-QC-02» | **YES** | **`RECPLATQA2-MSIXNFE2`** |
| «CNS invent KEY + Kanban EFF + IV soft-gate GWC» | **YES** | **`RECCNSQA-MSJ8KFL7`** |
| «Settings pipeline-stages FE-ADMIN CRUD LIVE» | **YES** | Peer **`R-PLT-REC-FE-ADMIN-01`** HOLD ≠ absent |
| «**Module** recruitment **UAT ready**» | **NO** | Honesty flag **false** · J-HRM-05* matrix open · UV/compare depth · REC-03 OUT |
| «Set **`recruitment_uat_ready=true`** on board» | **NO** | **DENIED invent flip** (mission + all QC gates) |
| «Set **`jd_dynamic_done=true`** because JD DnD slice» | **NO** | **DENIED** — separate honesty flag |
| «Phase 1 REC DONE / product GO from catalog L1» | **NO** | Program gates open · **C-SLICE-≠-MODULE** |
| «Reopen REC CNS GWC ⇒ flip flag» | **NO** | **`RECCNSQA-MSJ8KFL7`** SEAL RETAIN |
| «Reopen REC FE-ADMIN HOLD ⇒ module UAT unlock» | **NO** | **`R-PLT-REC-FE-ADMIN-01`** orthogonal |

### 1.3 FORBIDDEN by honesty flag (what `recruitment_uat_ready=false` blocks)

| Blocked claim | Detection | Mitigation |
|---------------|-----------|------------|
| Module REC UAT GO | PM matrix / SERVICE_READINESS | Cite this SPEC + QC honesty tables |
| Flip flag without sponsor UF wave | Bus diff on honesty JSON | SA **REJECT** · Option C |
| Reopen **REC-STAGE CNS** GWC as FAIL to force module UAT | QA invent reopen | **FORBIDDEN** — **`RECCNSQA-MSJ8KFL7` RETAIN** |
| Reopen **`R-PLT-REC-FE-ADMIN-01`** as recruitment UAT unlock | Dispatch dev-fe from FE HOLD | **FORBIDDEN** — orthogonal FE-ADMIN NOTE class |
| Reopen REC UX QC process / JD DnD / IV one-active as module unlock | Governance drift | **FORBIDDEN** — seals RETAIN |
| Bundle flip with **`payroll_e2e_ready`** / **`attendance_uat_ready`** / **`contracts_printable_ready`** | Dual/triple flag promote | **FORBIDDEN** — peer ATT/PAY/CTR SA |
| Claim **`jd_dynamic_done=true`** from JD slice alone | Honesty registry | **DENIED** — UV/compare spec_gap class open |
| Claim J-HRM-05 **DONE** from stage catalog slices alone | Journey map | **DENY** · **C-SLICE** |
| Use **`job_postings`** / REC-03 as SoT for UV/compare UAT | Honesty FORBIDDEN lines | **DENIED** |
| Use seed to «complete» REC matrix | U65 violation | **DENIED** |
| API-only PASS without browser UF for module promotion | qa-fe-outside-browser-gate | **DENIED** |

### 1.4 Honesty flag synonyms (registry — treat as one logical gate for module REC UAT)

| Flag key (docs/evidence) | AS-IS | This seat |
|--------------------------|-------|-----------|
| **`recruitment_uat_ready`** | **false** (bus grep dominant) | **Primary subject** · mint **`R-PLT-REC-UAT-01`** |
| **`hrm_recruitment_uat_ready`** | **false** (FE-ADMIN pack synth) | **Same HOLD** · do not flip independently |
| **`jd_dynamic_done`** | **false** | **Companion honesty** · JD/FormSchema depth wave **not closed** · **DENY** flip with recruitment flag without sponsor JD wave |
| **`payroll_e2e_ready`** (peer) | **false** · **`R-PLT-PAY-E2E-01` SEALED** | **RETAIN** · **DENY** bundled flip |
| **`attendance_uat_ready`** (peer) | **false** · **`R-PLT-ATT-UAT-01` SEALED** | **RETAIN** · **DENY** bundled flip |
| **`contracts_printable_ready`** (peer) | **false** · **`R-PLT-CTR-PRINTABLE-01` SEALED** | **RETAIN** · orthogonal |
| **`hrm_personnel_uat_ready`** | **false** | **RETAIN** · hire soft-link slices **≠** personnel module UAT |

PM must not promote **`recruitment_uat_ready=true`** while companion flags false without explicit QC scope definition — default **`recruitment_uat_ready=false`** until sponsor REC module UAT wave.

### 1.5 RETAIN peer HOLDs (do not reopen as REC UAT unlock)

| Residual | Spec | Rule |
|----------|------|------|
| **`R-PLT-REC-FE-ADMIN-01`** | REC-FE-ADMIN-NOTES | Settings pipeline-stages LIVE · HOLD = P2 NOTE |
| **`R-PLT-ATT-UAT-01`** | ATT-UAT-HOLD | ATT module honesty · separate wave |
| **`R-PLT-PAY-E2E-01`** | PAY-E2E-HOLD | Payroll module e2e · separate wave |
| **`R-PLT-CTR-PRINTABLE-01`** | CTR-PRINTABLE-HOLD | Printable · separate wave |
| **`R-PLT-ATT-LVRULE-ENGINE-01`** | LVRULE-ENGINE | **DENY** invent as REC unlock |
| REC UX QC process / JD DnD / IV one-active | Prior seals | **FORBIDDEN reopen** |

### 1.6 READ-ONLY apps cite (recruitment platform spine — no edit)

| Symbol | Path (read-only) | Role |
|--------|------------------|------|
| Nest REC stage module | `apps/api/hrm-api/src/recruitment/*` · pipeline stage services | Catalog SoT |
| Stage table | `rec_pipeline_stage` · migrations | Platform catalog |
| FE recruitment | `apps/web/hrm/src/pages/Recruitment.tsx` | Kanban · consumer |
| FE admin panel | `RecPipelineStageSettingsPanel.tsx` | FE-ADMIN LIVE |
| FE consumers | `CandidatesTab` · `CandidateFormDialog` · `ScheduleInterviewDialog` | CNS wire |
| Catalog helpers | `recPipelineStageCatalog.ts` | EFF · starter REF |

Audit finding: **Substantial REC platform stage catalog stack is LIVE** for **L1/CNS slices** already GWC — yet **every** QC/QA evidence repeats **`recruitment_uat_ready=false`**. SA **confirms** intentional honesty (module matrix · UV/compare spec_gap · REC-03 OUT · JD dynamic depth · full J-HRM-05* open), not stale typo.

### 1.7 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** `recruitment_uat_ready=true` (and unjustified `jd_dynamic_done=true`) without sponsor REC module UAT wave
- **DENY** reopen **`RECCNSQA-MSJ8KFL7`** · REC CNS QC GWC as unlock pretext
- **DENY** reopen **`R-PLT-REC-FE-ADMIN-01`** as module UAT unlock
- **DENY** bundle flip with payroll_e2e / attendance_uat / printable flags
- **RETAIN** all REC L1/CNS seals · FE-ADMIN HOLD · honesty false · **C-SLICE**
- **UNLOCK** honesty flag **only** if sponsor **explicit** REC module UAT wave + UF/J-* list in **same** governance cycle + QC GO

### 1.8 Decision heuristic

| Rule | Application |
|------|-------------|
| L1/CNS GWC + flag false on evidence | **Option A HOLD** — formalize, do not flip |
| Sponsor opens «REC module UAT wave» + UF | **Future Option B** — out of this seat default |
| «RECPLATQA2 browser PASS ⇒ flip flag» | **Option C REJECT** — violates QC seal honesty |
| «CNS GWC ⇒ reopen CNS as FAIL for dev-fe» | **REJECT** — seal loss |
| «FE-ADMIN LIVE ⇒ flip flag» | **REJECT** — peer HOLD |
| «JD DnD CERTIFIED ⇒ jd_dynamic_done true» | **REJECT** — separate flag · depth open |

---

## 2. Problem to solve (ADR §2)

### 2.1 Current state

| Layer | AS-IS | Honesty reading |
|-------|-------|-----------------|
| REC platform stage catalog L1 | Nest STG/EFF · admin CREATE · retire+history | **Slice LIVE** |
| REC CNS consumer | Invent KEY · pool assert · Kanban EFF · IV soft-gate | **Slice LIVE** |
| REC browser spot / platform QA | RECPLATQA2 GWC | **C-SLICE** |
| Settings FE-ADMIN pipeline-stages | CRUD LIVE + HOLD pack | **LIVE** · P2 NOTE |
| UV / compare / YCTD depth | spec_gap / impl_gap class on bus | **≠ module DONE** |
| JD dynamic FormSchema | DnD slice CERTIFIED · depth partial | **`jd_dynamic_done=false` correct** |
| REC-03 / job_postings SoT | **OUT** / FORBIDDEN | **Supports flag false** |
| Module REC UAT matrix | **Not closed** — J-HRM-05* · WF · full spine | **Flag false correct** |
| Program W8 | Row DISPATCHED for this seat | **Needs SA mint** **`R-PLT-REC-UAT-01`** |

### 2.2 Failure impact if mis-governed

| Risk | Impact |
|------|--------|
| Flip flag from L1/CNS GWC alone | False UAT-ready · QC NO-GO · sponsor trust loss |
| Reopen REC CNS as «finish REC» | Scope creep · violates CNS seal |
| Claim Phase1 REC DONE from catalogs | Violates continuous honesty program |
| Bundle attendance/payroll/printable flip | Violates peer ATT/PAY/CTR SA locks |
| Reopen REC FE-ADMIN as mandatory dev-fe | Violates REC-FE-ADMIN SA Option A |
| Promote `jd_dynamic_done` from JD slice alone | False JD module readiness |

---

## 3. Options (ADR §3)

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint **`R-PLT-REC-UAT-01`** documenting: (1) **LIVE** REC L1/CNS/FE-ADMIN inventory §1.2; (2) **`recruitment_uat_ready=false`** **correct** until sponsor opens named REC module UAT UF wave; (3) **`jd_dynamic_done=false`** RETAIN as companion; (4) **DENY** flip/reopen/invent paths §6.3; (5) **RETAIN** peer HOLDs + L1/CNS stamps. |
| **Benefits** | Aligns W8 REC evidence chain · closes honesty gap without code · preserves U88 bandwidth · symmetric with ATT-UAT/PAY-E2E peers |
| **Costs** | Full REC module UAT deferred until sponsor |
| **Risks** | HOLD misread as «REC broken» → mitigations **L-REC-UAT-*** |
| **Gate** | Evidence chain grep **`recruitment_uat_ready=false`** consistent |

### Option B — UNLOCK honesty flag / «REC module UAT ready» (default reject)

| | |
|--|--|
| **Description** | Set **`recruitment_uat_ready=true`** because L1/CNS/browser slices passed. |
| **Benefits** | None on current evidence — contradicts QC |
| **Costs** | Honesty violation · false module GO |
| **Risks** | **DENIED** mission line |
| **Gate** | **REJECT** unless sponsor + UF matrix + QC sign-off in future wave |

### Option C — REJECT invent / reopen / flip

| | |
|--|--|
| **Description** | Flip flag · reopen REC CNS · reopen REC FE-ADMIN HOLD · reopen UX/JD/IV seals · claim REC module UAT · invent job_postings SoT · seed · `apps/**` from this seat. |
| **Benefits** | None |
| **Costs** | Seal loss |
| **Risks** | **DENY** all mission FORBIDDEN lines |

---

## 4. Trade-off matrix (ADR §4)

| Criteria | Weight | Option A HOLD | Option B flip | Option C invent |
|---|--:|--:|--:|--:|
| QC/QA honesty chain integrity | 5 | **5** | 0 | 0 |
| W8 continuous policy compliance | 5 | **5** | 0 | 0 |
| Clarity L1/CNS slice vs module UAT | 5 | **5** | 1 | 0 |
| Sponsor trust | 4 | **5** | 0 | 0 |
| Time to full REC module UAT | 3 | 3 | **4** | 1 |
| Delivery cost now | 4 | **5** | 2 | 0 |
| **Weighted tendency** | | **Dominates** | Reject | Reject |

---

## 5. Failure modes and mitigation (ADR §5)

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | «RECPLATQA2 ⇒ flip flag» | Bus promote without UF | Cite RECPLATQA2 honesty § + this SPEC |
| A | User thinks stage admin missing | Support ticket | Cite LIVE panel + **`R-PLT-REC-FE-ADMIN-01`** HOLD ≠ absent |
| A | PM drops REC honesty row | Board scan | **`R-PLT-REC-UAT-01`** mint |
| B | False SERVICE_READINESS | QC audit | NO-GO · revert flag |
| C | Reopen CNS GWC | Duplicate QA FAIL | FORBIDDEN · **`RECCNSQA-MSJ8KFL7` RETAIN** |
| C | Bundle ATT/PAY flip | Dual flag promote | Cite **`R-PLT-ATT-UAT-01`** · **`R-PLT-PAY-E2E-01`** |
| C | Flip jd_dynamic_done from JD slice | Honesty drift | Cite bus spec_gap · separate JD wave |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_P2 HOLD** |
| **Why** | REC **L1/CNS catalog slices** are **LIVE and GWC** — but **every** gate evidence requires **`recruitment_uat_ready=false`**. UV/compare depth · REC-03 OUT · full J-HRM-05* matrix open. CNS SEAL and FE-ADMIN HOLD are **orthogonal** — **not** unlock paths for flag flip. **`jd_dynamic_done=false`** remains correct for JD depth wave. |
| **Assumptions** | Sponsor did not open «REC module UAT wave» with UF list in this message. |
| **Rejected** | **Option B** flag flip · **Option C** full DENY list |

### 6.1 Unlock gates (Option A does not open)

| Question | Answer |
|----------|--------|
| Flip **`recruitment_uat_ready=true`** now? | **NO** |
| Flip **`jd_dynamic_done=true`** via this seat? | **NO** — separate sponsor JD wave |
| Reopen REC-STAGE CNS GWC? | **FORBIDDEN** |
| Reopen REC FE-ADMIN HOLD? | **FORBIDDEN** |
| Dispatch dev-fe/dev-be for «REC module UAT» from HOLD? | **NO** default |
| Claim J-HRM-05* module DONE? | **NO** |

### 6.2 Sponsor-gated narrow alternate (not default)

```text
entry: sponsor message explicit «mở wave REC module UAT» + named UF-IDs (J-HRM-05 full matrix, J-HRM-REC-UV-01, J-HRM-JD-YCTD-01, J-REC-WF-* where in scope, UV/compare depth ACs, REC-03 policy explicit) + persona matrix + U65 browser evidence plan
retain: all prior REC L1/CNS GWC stamps · CNS SEAL · FE-ADMIN HOLD · jd_dynamic_done false until separate JD wave closes · honesty false until QC closes module wave
scope_allowed: QA browser matrix per UF · QC module gate · THEN pm may set recruitment_uat_ready=true (and aligned synonyms) with QC sign-off on module scope only
scope_FORBIDDEN: flip flag from L1 catalog/CNS alone · reopen CNS as pretext · reopen FE HOLD · seed · API-only · bundle payroll/attendance/printable flip · job_postings SoT · claim jd_dynamic_done from slice alone
exit: R-PLT-REC-UAT-01 may CLOSE or narrow; requires QC GO on full module scope — not L1 slice alone
```

### 6.3 Architecture boundary (text diagram)

```text
  Stage catalog L1 RECPLATQA-MSIWKJWP GWC              --> LIVE catalog slice
  Browser admin CREATE RECPLATQA2-MSIXNFE4 GWC         --> LIVE · honesty false RETAIN
  CNS consumer RECCNSQA-MSJ8KFL7 + kanban EFF          --> LIVE CNS slice SEALED
  Settings RecPipelineStageSettingsPanel FE-ADMIN      --> LIVE · R-PLT-REC-FE-ADMIN-01 HOLD RETAIN
  JD DnD CERTIFIED / IV one-active browser slices      --> LIVE C-SLICE · ≠ module UAT
  UV/compare depth · REC-03 · job_postings SoT         --> OPEN / OUT (honesty)
  Module REC UAT matrix (J-HRM-05*)                    --> OPEN (honesty)
  recruitment_uat_ready / hrm_recruitment_*          --> false RETAIN (R-PLT-REC-UAT-01)
  jd_dynamic_done                                      --> false RETAIN (companion)
  payroll_e2e_ready (peer)                             --> false RETAIN (R-PLT-PAY-E2E-01)
  attendance_uat_ready (peer)                          --> false RETAIN (R-PLT-ATT-UAT-01)
  contracts_printable_ready (peer)                     --> false RETAIN (R-PLT-CTR-PRINTABLE-01)
  C-SLICE-≠-MODULE                                     --> RETAIN
```

---

## 7. Implementation and validation plan (ADR §7)

| Step | Owner | Action |
|------|-------|--------|
| 1 | pm | Seal board row **CONFIRMED** · append **`R-PLT-REC-UAT-01`** HOLD P2 |
| 2 | pm | **Do not** set **`recruitment_uat_ready=true`** · **Do not** dispatch REC module UAT unlock from this seat |
| 3 | pm | Keep honesty registry until sponsor opens UF wave — then **new** work_item (not silent flip) |
| 4 | qc | Any future flag promote requires **full** REC module UF evidence — not L1/CNS alone |
| Rollback | sa | If flag flipped wrongly — CORRECTION bus · restore false · cite this SPEC |
| Validation | qa | Module wave must be U65 browser UF matrix when sponsor opens |
| Success | pm | SPEC_LEN ≥8192 NFD · PASS_TO_PM · honesty unchanged |

---

## 8. Locks (L-REC-UAT-*)

| Lock | Rule |
|------|------|
| **L-REC-UAT-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 does not delete L1/CNS catalog ACs · deferred **module** UAT only |
| **L-REC-UAT-02 L1/CNS LIVE** | All §1.2 stamps **RETAIN** — HOLD does not negate slice evidence |
| **L-REC-UAT-03 Flag false** | **DENY** PM/dev flip without sponsor UF wave + QC |
| **L-REC-UAT-04 CNS orthogonality** | **DENY** reopen **`RECCNSQA-MSJ8KFL7`** as module UAT unlock |
| **L-REC-UAT-05 FE-ADMIN orthogonality** | **DENY** reopen **`R-PLT-REC-FE-ADMIN-01`** as module unlock |
| **L-REC-UAT-06 JD companion** | **`jd_dynamic_done=false`** RETAIN · **DENY** flip from JD slice alone |
| **L-REC-UAT-07 ATT/PAY/CTR peer** | **DENY** bundled flip with attendance/payroll/printable |
| **L-REC-UAT-08 Honesty** | **C-SLICE-≠-MODULE** RETAIN · **DENY** Phase1 REC DONE from L1 |
| **L-REC-UAT-09 REC-03 / job_postings** | **FORBIDDEN** SoT for module promotion |
| **L-REC-UAT-10 Path lock** | UTF-8 no BOM NFD write gate |

---

## 9. F.1 physical notes (API_DESIGN alignment — read-only)

| Function / area | Mục đích (VI) | Slice status today | Honesty impact |
|-----------------|---------------|--------------------|----------------|
| **F-REC-CAT-STG-01 / STG-02** | Danh mục giai đoạn pipeline Nest admin + open N+1 | **LIVE** L1 | **≠** module UAT ready |
| **F-REC-CAT-EFF-01** | Danh sách effective cho picker consumer | **LIVE** L1 | **≠** flag true |
| **F-REC-CAT-STG invent KEY** | Consumer assert stage ∈ catalog | **LIVE** CNS | **≠** module UAT |
| **VAL-REC-CNS-02** | Pool create/update assert UNKNOWN | **LIVE** CNS | **≠** flag true |
| **VAL-REC-CNS-04** | Kanban columns from EFF | **LIVE** CNS-FE | **≠** flag true |
| **VAL-REC-CNS-05** | IV schedule soft-gate | **LIVE** CNS | **≠** IV one-active module reopen |
| **F-REC-HIRE-01** | Hire outcome stage assert | Partial spot | **≠** personnel module UAT |
| **JD FormSchema / REC-03 / UV compare** | JD dynamic · tin đăng · so sánh UV | **OUT / gap** | **Supports flag false** |
| **J-REC-WF-*** | WF ops map | Partial | Module matrix open |

No new API_DESIGN rows required this seat — **disposition + honesty governance only**.

---

## 10. Evidence index (RETAIN — grep-backed)

| Evidence path | Stamp / verdict | Honesty line |
|---------------|-----------------|--------------|
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-01.md` | **`RECPLATQA-MSIWKJWP`** | recruitment_uat_ready=false |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-02.md` | **`RECPLATQA2-MSIXNFE2`** | false RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md` | L1 GWC SEAL | false |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-02.md` | REC-QC-02 GWC K6.2e | false · DENY module UAT |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01.md` | **`RECCNSQA-MSJ8KFL7`** | false |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qc-01.md` | CNS GWC | false RETAIN |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md` | **`R-PLT-REC-FE-ADMIN-01`** | recruitment_uat_ready=false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md` | AC-PLT-REC-STAGE-01* | false · DENY flip |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-UAT-HOLD-SA-01.md` | **`R-PLT-ATT-UAT-01`** | peer false RETAIN |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-E2E-HOLD-SA-01.md` | **`R-PLT-PAY-E2E-01`** | peer false RETAIN |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | REC-UAT row DISPATCHED | board SoT |
| `docs/program/PO_HRM_RESUME_PLAN_20260807.md` | K6.2e honesty LOCKED | false at seal |

---

## 11. Trace to program board (W8)

| Board row | Status | Action |
|-----------|--------|--------|
| REC stage catalog SA/BA/CNS/DOCS chain | GWC / SEALED mix | **RETAIN** · **DENY** reopen as module unlock |
| REC-FE-ADMIN-NOTES-SA-01 | CONFIRMED HOLD | **RETAIN** |
| REC-QC-01 / REC-QC-02 | GWC SEAL | **RETAIN** |
| ATT-UAT-HOLD-SA-01 | SEALED | peer RETAIN |
| PAY-E2E-HOLD-SA-01 | SEALED | peer RETAIN |
| CTR-PRINTABLE-HOLD-SA-01 | SEALED | peer RETAIN |
| **REC-UAT-HOLD-SA-01** | **this seat** | Option A LOCK · mint **`R-PLT-REC-UAT-01`** |

---

## 12. Discrimination matrix (PM / QC)

| Evidence | Flip `recruitment_uat_ready`? | Why |
|----------|-------------------------------|-----|
| Stage L1 **`RECPLATQA-MSIWKJWP`** | **NO** | L1 C-SLICE |
| Browser admin **`RECPLATQA2-MSIXNFE2`** | **NO** | Catalog slice |
| CNS **`RECCNSQA-MSJ8KFL7`** | **NO** | Consumer CNS slice |
| FE-ADMIN LIVE + HOLD | **NO** | P2 NOTE |
| JD DnD CERTIFIED slice | **NO** · **NO** jd_dynamic flip | C-SLICE |
| IV one-active browser GWC | **NO** | C-SLICE |
| Sponsor REC module UAT wave + QC GO | **YES** (future) | §6.2 only |

---

## 13. RETAIN stamps (REC slices · peers · honesty)

| Stamp / residual | Action |
|------------------|--------|
| **`RECPLATQA-MSIWKJWP`** · L1 API | **SEAL RETAIN** |
| **`RECPLATQA2-MSIXNFE2`** · browser admin | **SEAL RETAIN** |
| **`RECCNSQA-MSJ8KFL7`** · **`RECCNSKAN-MSJ8OZBH`** | **SEAL RETAIN** |
| REC-STAGE CNS-BE/FE READY | **RETAIN** |
| REC-STAGE DOCS ACCEPT SRS v0.27 | **RETAIN** |
| **`R-PLT-REC-FE-ADMIN-01`** | **HOLD RETAIN** |
| **`R-PLT-REC-UAT-01`** | **HOLD mint this seat** |
| **`R-PLT-ATT-UAT-01`** · **`R-PLT-PAY-E2E-01`** · **`R-PLT-CTR-PRINTABLE-01`** | **HOLD RETAIN** (peers) |
| **`recruitment_uat_ready`** · **`jd_dynamic_done`** | **false RETAIN** |
| **`C-SLICE-≠-MODULE`** | **RETAIN** |
| REC UX QC process / JD DnD / IV one-active seals | **SEAL RETAIN** |

---

## 14. Non-goals (explicit)

1. Do not set **`recruitment_uat_ready=true`** without sponsor module wave.
2. Do not set **`jd_dynamic_done=true`** without sponsor JD dynamic wave.
3. Do not reopen REC CNS GWC as FAIL pretext.
4. Do not reopen REC FE-ADMIN HOLD as module unlock.
5. Do not reopen sealed UX/JD/IV process seats as module unlock.
6. Do not claim module REC UAT · J-HRM-05* DONE · Phase1 REC DONE.
7. Do not bundle flip with **`payroll_e2e_ready`** · **`attendance_uat_ready`** · **`contracts_printable_ready`**.
8. Do not use **`job_postings`** / REC-03 as SoT for UAT promotion.
9. Do not dispatch dev-fe/dev-be for module closure without sponsor UF wave.
10. Do not seed REC matrix (U65).
11. Do not edit `apps/**` in this seat.

---

## 15. Handback packet (mandatory)

| Field | Value |
|-------|--------|
| **completion_report** | REC module honesty formalized as Option **A LOCKED** · mint **`R-PLT-REC-UAT-01`** ACCEPT_AS_IS_P2 HOLD · documented **LIVE** L1/CNS slices (RECPLATQA* · RECCNSQA) + FE-ADMIN HOLD vs **`recruitment_uat_ready=false`** / **`jd_dynamic_done=false`** RETAIN · **DENY** flag flip · **DENY** reopen REC CNS · **RETAIN** RECCNSQA + REC FE-ADMIN + peer ATT/PAY/CTR honesty HOLDs · no `apps/**`. |
| **selected_option** | **Option A** — ACCEPT_AS_IS_P2 HOLD |
| **residual** | **`R-PLT-REC-UAT-01`** = **HOLD** |
| **SPEC_LEN** | Verified NFD UTF-8 no BOM · gate ≥8192 bytes |
| **next_owner** | **pm** — seal W8 row CONFIRMED · **do not** flip honesty · U88 next vertical per board (not REC module UAT unlock) |
| **next_dispatch_prompt** | `work_item_id: PO-HRM-CONTINUOUS-W8-PM-SEAL-REC-UAT-HOLD-01` · from_role: pm · to_role: pm · lane: governance · entry: SA PASS `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01` Option A · evidence `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01.md` · mint `R-PLT-REC-UAT-01` HOLD on W8 board + honesty registry · exit: row CONFIRMED · RETAIN `recruitment_uat_ready=false` · RETAIN `jd_dynamic_done=false` · RETAIN `RECCNSQA-MSJ8KFL7` · RETAIN `R-PLT-REC-FE-ADMIN-01` · RETAIN peer ATT/PAY/CTR flags false · C-SLICE · **cấm** dispatch dev-* REC module UAT unlock · **cấm** flip flag · **cấm** reopen REC CNS · ack PASS_TO_PM internal seal |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 16. SA KB append (reference)

| Context | REC module UAT honesty after L1/CNS GWC slices · U88 after ATT-UAT SEAL |
| Action | Option A LOCK · mint R-PLT-REC-UAT-01 · L1/CNS LIVE vs flag false taxonomy |
| Outcome | PASS_TO_PM · no apps/** |
| Evidence | This SPEC path |
| Reuse-tag | rec-uat-honesty-hold, r-plt-rec-uat-01, slice-live-neq-module-uat, deny-invent-flip, l1-cns-catalog-retain, reccnsqa-retain, rec-fe-admin-hold-retain, att-uat-peer-retain, pay-e2e-peer-retain, jd-dynamic-false-retain, path-lock-nfd |

---

## 17. Extended governance notes (cross-reference)

**Continuous W8 policy:** Board header **Honesty LOCKED: all `*_ready=false` · `C-SLICE-≠-MODULE`**. This seat **formalizes the REC leg** of that registry — complementary to ATT-UAT, PAY-E2E, and CTR-PRINTABLE seats already SEALED. PM must not interpret «ATT honesty formalized» as permission to flip recruitment (or vice versa).

**Resume plan K6.2e:** REC QC **`RECPLATQA2-MSIXNFE2`** seal explicitly retained **`recruitment_uat_ready=false`** alongside **`attendance_uat_ready=false`** and **`payroll_e2e_ready=false`**. This seat **does not** reopen K6.2e; it **documents** why those seals did not promote module honesty.

**RECCNSQA stamp discipline:** CNS consumer invent KEY, pool assert, Kanban EFF, and IV soft-gate are **proven** — reopening CNS as FAIL to «force module UAT» would violate **`L-REC-UAT-04`** and duplicate closed W8 work.

**REC-FE-ADMIN peer (SPEC REC-FE-ADMIN-NOTES):** Settings pipeline-stages admin is **LIVE** with **ACCEPT_AS_IS_P2 HOLD** on **`R-PLT-REC-FE-ADMIN-01`**. Module UAT promotion must not treat FE-ADMIN HOLD as a blocker to flip nor as a mandatory unlock path — both are **orthogonal** to **`R-PLT-REC-UAT-01`**.

**jd_dynamic_done companion flag:** JD DnD and related UX slices may show **CERTIFIED** or GWC on narrow UF — bus consistently keeps **`jd_dynamic_done=false`** for FormSchema depth, UV/compare spec_gap, and REC-03 exclusion. PM must not flip **`recruitment_uat_ready`** and **`jd_dynamic_done`** together without explicit QC scope for **each** flag.

**UV / compare / YCTD program lines:** Bus blunt notes (free-text compare stub, shallow BA depth) support **module honesty false** — L1 stage catalog success **does not** close UV spine or YCTD flags.

**J-HRM-05 journey map:** List→detail recruitment, UV lifecycle, hire→EMP soft-link, and cross-nav to DEC/PAY remain **architecture test gaps** for module UAT — stage catalog L1 PASS does not close J-* rows.

**Platform catalog vs operational depth:** W8 REC vertical implemented **F-REC-CAT-* L1** platform catalog pattern (invent KEY, soft-retire, CNS wire) — distinct from **operational** JD dynamic, campaign, compare, and WF depth required for module UAT.

**U65 zero-seed:** Any future module wave must create sources from FE — HOLD does not authorize seed to «green» matrix.

**QC coaching:** When auditing REC evidence, QC must copy honesty line from evidence header — if missing, **FAIL spec_gap** to QA author. Module promotion discussion with **`recruitment_uat_ready=false`** in evidence → **NO-GO** unless sponsor wave + full matrix PASS.

**Dev coaching:** `dev-be` / `dev-fe` must not interpret L1 invent KEY or CNS CLOSED as ticket to update honesty JSON without PM + QC after sponsor module wave.

**BA coaching:** No new AC-PLT-REC **module UAT** pack required for HOLD. Future sponsor wave may request BA delta for **full** REC UF — separate work_item.

**TM/QC block:** Recommend **NO-GO** on any release narrative claiming REC module UAT while **`R-PLT-REC-UAT-01=HOLD`** and flag false.

**Peer ATT-UAT (SPEC 32664):** ATT module honesty **does not** unlock REC. Cross-module hires referencing ATT leave types in spot slices remain **orthogonal** flags.

**Peer PAY-E2E (SPEC 28002):** Payroll J07 spot slices **do not** unlock recruitment. **`payroll_e2e_ready=false`** RETAIN.

**FE-ADMIN-REOPEN-GATE-BA-02:** Reopen-gate inventory lists **`recruitment_uat_ready=false`** — **not** unlock of module honesty. This seat is **downstream SA disposition**.

**Synonym discipline:** Documents using `hrm_recruitment_uat_ready` vs `recruitment_uat_ready` must be updated **together** on any future promote — default all **false** until QC signs module scope.

**PO-UAT-REC-01 line:** Parallel UAT module row shows **GWC CLOSED** slice with **`recruitment_uat_ready=false`** — consistent with **C-SLICE-≠-MODULE**; this seat prevents misread as module GO.

**Scope parity (U19):** Future module wave must retain list↔get-by-id↔consumer assert parity on `rec_pipeline_stage` — HOLD does not waive scope audit on execution waves.

**Path lock:** Canonical NFD `Tài liệu` — this SPEC written via PowerShell UTF-8 no BOM gate per mission protocol.

**RECCNSQA coaching for PM dispatch:** When dispatching execution after this seat, **cấm** wording «close REC UAT via CNS retest» — CNS is **SEALED**. Module work must cite **new** UF IDs under sponsor wave, not reopen **`RECCNSQA-MSJ8KFL7`**.

**P0 UX slices vs module UAT (sponsor 2026-08-06):** Narrow QC GWC on REC platform browser **≠** module «chạy được». Storm/mojibake/duplicate header/ReferenceError on recruitment surfaces still **FAIL** module readiness even when L1 catalog honesty HOLD is correct.

**Vertical continuity U88:** After PM seals this row, governance may continue to next W8 vertical per board — **idle-ok REC honesty seat ≠ idle REC product program**; full spine remains on continuous board with honesty flags false until sponsor module waves.

---

*End of SPEC — PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01*
