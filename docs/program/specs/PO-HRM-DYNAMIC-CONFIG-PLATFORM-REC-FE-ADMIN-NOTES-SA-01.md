# PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01 — Option/F.1 · REC FE-ADMIN notes pack residual

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01` |
| **Parent** | REC-STAGE-CATALOG CNS QC-01 **GWC** · invent KEY **`RECCNSQA-MSJ8KFL7`** · kanban **`RECCNSKAN-MSJ8OZBH`** · OBS funnel idle-ok · CNS-FE-01 **READY** (Kanban EFF · IV soft-gate · vitest) absorbed by QA-01 · DOCS **ACCEPT** SRS **v0.27** · HDSD **CH07b** · prior PAY-FE-ADMIN-NOTES-SA-01 Option **A** HOLD sealed (**`R-PLT-PAY-FE-ADMIN-01`** · SPEC 49325) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for consolidated REC **FE-ADMIN notes** residual after pipeline-stages catalog CNS wave · **no seed** · **no wipe** sealed peers |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · ba-process **HOLD** (no new AC pack) · FE/BE **HOLD** · invent Nest dual REC admin **DENY** · reopen CNS GWC as FAIL **DENY** |
| **residual_id** | **`R-PLT-REC-FE-ADMIN-01`** *(minted this seat — consolidates Nest `rec_pipeline_stage` Settings FE-ADMIN + starter-six / MD REF notes)* |
| **prior_cns** | CNS-QA-01 PASS stamp **`RECCNSQA-MSJ8KFL7`** · kanban **`RECCNSKAN-MSJ8OZBH`** · CNS-QC-01 **GWC** · CNS-BE-01 jest READY · CNS-FE-01 vitest READY absorbed — **FORBIDDEN reopen as FAIL** |
| **prior_catalog** | REC-STAGE-CATALOG SA Option **B** Nest SoT · BA AC-PLT-REC-STAGE-01* · F-REC-CAT-STG/EFF · REC-QC-01/02 **SEAL RETAIN** |
| **prior_docs** | REC-STAGE-CATALOG-DOCS-01 **ACCEPT** · SRS v0.27 · HDSD CH07b — **RETAIN** |
| **peer_cite_hold** | [`PAY-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md) **Option A ACCEPT_AS_IS_P2 HOLD · `R-PLT-PAY-FE-ADMIN-01`** (SPEC 49325) · [`SI-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-SI-FE-ADMIN-01`** (SPEC 40113) · [`ATT-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-ATT-FE-ADMIN-01`** (SPEC 31734) · [`EMP-FE-ADMIN-NOTES-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md) **Option A · `R-PLT-EMP-FE-ADMIN-01`** — **cite class (twin pack)** |
| **peer_cite_consumer** | REC-STAGE CNS consumer assert **SEAL ACCEPT** · Kanban EFF + IV soft-gate READY/absorbed — **≠** this residual class · **FORBIDDEN reopen CNS GWC** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module REC UAT · Phase1 DONE · seed · flip printable/personnel/payroll/recruitment ready · invent Nest dual REC admin · invent LVRULE · reopen PAY/SI/ATT/EMP FE-ADMIN HOLDs as unlock · reopen CNS as FAIL · reopen REC UX QC process / JD DnD / IV one-active |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 1. Decision context (ADR option pack)

| | |
|--|--|
| **Decision title** | Disposition for REC **FE-ADMIN notes pack** after `rec_pipeline_stage` CNS wave (KEY LIVE · admin open N+1 proven · Kanban EFF + IV soft-gate proven) — ACCEPT_AS_IS HOLD vs unlock FE-ADMIN deepen vs invent Nest dual / reopen CNS |
| **Requestor** | pm · U88 continuous · after PAY-FE-ADMIN-NOTES-SA-01 Option A HOLD sealed (`R-PLT-PAY-FE-ADMIN-01` · SPEC 49325) · REC-STAGE CNS QC-01 GWC · DOCS ACCEPT |
| **Decision owner** | sa |
| **Related** | Nest `public.rec_pipeline_stage` SoT LIVE · Settings `RecPipelineStageSettingsPanel` FE-ADMIN LIVE · CNS consumers (CandidatesTab / CandidateFormDialog / Kanban / hire / IV soft-gate) SEAL · starter-six / MD REF · PAY/SI/ATT/EMP FE-ADMIN HOLD peers · LVRULE 01g HOLD · OBS funnel idle-ok P2 |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + F.1 notes |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-REC-FE-ADMIN-NOTES-SA-01` **DISPATCHED** |

### 1.1 Problem — what residual remains after CNS GWC

REC-STAGE-CATALOG CNS consumer assert is **SEAL ACCEPT** (QC GWC · stamp `RECCNSQA-MSJ8KFL7` · kanban `RECCNSKAN-MSJ8OZBH`). Catalog Option B Nest SoT is **LOCKED**. DOCS SRS v0.27 / HDSD CH07b **ACCEPT**. What remains is **not** another closable CNS consumer KEY residual — it is the **FE-ADMIN notes pack class** (peer PAY / SI / ATT / EMP FE-ADMIN NOTES):

| Residual / note | Severity | Surface inventory (AS-IS) | Proven already (RETAIN) |
|-----------------|----------|---------------------------|-------------------------|
| **`R-PLT-REC-STG-FE-ADMIN`** | **P2 HOLD NOTE** | Nest «Giai đoạn REC / pipeline-stages» Settings admin CRUD FE **LIVE** — `RecPipelineStageSettingsPanel` mounted on `Settings.tsx` tab `rec-pipeline-stages` · `upsertRecPipelineStage` / `retireRecPipelineStage` · `hrmApi` list/create/upsert/patch/retire · REC-QC-02 browser admin CREATE N+1 stamp `RECPLATQA2-MSIXNFE2` · F5 list proven | Nest STG L1 + REC-QC-01/02 · CNS AC-PLT-REC-STAGE-01d · invent KEY consumer closed at CNS |
| **`R-PLT-REC-SETTINGS-SIX-REF`** | **P2 HOLD NOTE** | Starter-six helpers / MD label maps (`REC_PIPELINE_STAGE_STARTER_KEYS` · `getStageOptions` · funnel «6 giai đoạn» copy) = **REF/label fallback only** (Option A picker SoT **REJECT**) · CandidateDetailView static funnel · **≠** Nest SoT · **≠** second admin writer | L-REC-STAGE-02/04 · BR-PLT-REC-STAGE-04 · O4 Settings/six-only REJECT RETAIN |
| **`R-PLT-REC-FE-ADMIN-01`** *(mint this seat)* | **P2 HOLD NOTE pack** | **Consolidation** of the two rows above into one board residual for U88 continuity — **does not** invent new product surface · **does not** reopen CNS GWC | CNS GWC · DOCS ACCEPT · Nest SoT RETAIN |

**Critical discrimination vs ATT FE-ADMIN ABSENT and vs SI/PAY LIVE:**

| Catalog family | FE-ADMIN mount | FE-ADMIN persist client | Consumer FE / CNS | Residual class this seat |
|----------------|----------------|-------------------------|-------------------|--------------------------|
| **ATT** CODE/OT/COMP | **ABSENT** (GET `listEffective*` only) | **ABSENT** create/update client | CLOSED | HOLD = deepen ABSENT Nest admin until sponsor |
| **EMP** ST Nest | **ABSENT** Nest ST admin | Network L1 only | CLOSED | HOLD = Nest ST admin ABSENT |
| **SI** INS + INSURER | Settings Nest admin tabs **LIVE** | `upsert*` / `retire*` **LIVE** | CLOSED | HOLD = **no closable mount/persist gap** · NOTE pack |
| **PAY** salary_components | Payroll tab **LIVE** | create/update/delete **LIVE** | CNS SEAL | HOLD = **no closable mount/persist gap** · NOTE pack |
| **REC** pipeline-stages | Settings tab **LIVE** (`RecPipelineStageSettingsPanel`) | `upsert` / `retire` **LIVE** | CNS SEAL ACCEPT (`RECCNSQA-MSJ8KFL7`) | HOLD = **no closable mount/persist gap** · NOTE pack (SI/PAY-class inventory) |

**Discrimination (must not confuse with consumer UNLOCK / CNS reopen):**

| Class | When used | REC pipeline-stages | This seat (FE-ADMIN notes) |
|-------|-----------|---------------------|----------------------------|
| **Consumer CNS / picker invent KEY** | Nest SoT + BE assert + FE rebind · AC-PLT-REC-STAGE-01* | CNS-QA/QC → **GWC SEAL** · KEY LIVE · Kanban EFF · IV soft-gate | **OUT** — already SEALED · **FORBIDDEN reopen as FAIL** |
| **FE-ADMIN / deepen ABSENT Nest admin panel** | Network L1 OK · product Nest admin CRUD FE OUT | **NOT REC AS-IS** — Settings admin tab **LIVE** | Cite ATT peer class only for *pack structure* — REC audit ≠ ABSENT |
| **FE-ADMIN LIVE + no mount/persist gap** | Settings tab mount + CRUD wire + REC-QC-02 admin CREATE proven | Admin shipped · AC-PLT-REC-STAGE-01d browser PASS | **THIS residual** → Option **A ACCEPT_AS_IS_P2 HOLD** |
| **OBS funnel idle-ok** | Funnel title «6 giai đoạn» display helper · not kanban SoT | CONDITION idle-ok P2 (QC) | **NOTE RETAIN** — **≠** closable FE-ADMIN mount/persist gap · **≠** unlock trigger |
| **Invent / reopen / flip** | Invent second Nest REC admin path · reopen CNS as FAIL · LVRULE unlock · flip recruitment ready | REJECT | **Option C REJECT** |

**Board audit (closable CNS residual still OPEN? closable FE-ADMIN mount/persist gap?)**

| Candidate | Board / seal | Verdict for this seat |
|-----------|--------------|------------------------|
| REC-STAGE CNS consumer invent KEY | QC-01 GWC · `RECCNSQA-MSJ8KFL7` SEAL ACCEPT | **SEALED** — **FORBIDDEN reopen as FAIL** |
| REC-STAGE CNS kanban EFF | `RECCNSKAN-MSJ8OZBH` · VAL-REC-CNS-04 | **SEALED** — RETAIN |
| REC-STAGE CNS-FE-01 Kanban EFF · IV soft-gate | READY vitest · QA-01 absorbs | **RETAIN** — not reopen as mandatory `dev-fe` |
| REC-STAGE CNS-BE-01 VAL assert | jest READY | **RETAIN** |
| REC-STAGE DOCS | ACCEPT SRS v0.27 · HDSD CH07b | **RETAIN** |
| REC-QC-01 / REC-QC-02 (admin catalog prior) | GWC SEAL RETAIN · `RECPLATQA2-MSIXNFE2` | **RETAIN** — not reopen |
| Nest STG FE-ADMIN mount `RecPipelineStageSettingsPanel` | `Settings.tsx` tab → panel LIVE · testid `settings-tab-rec-pipeline-stages` | **LIVE** — **no mount gap** |
| Nest STG FE-ADMIN persist | `upsertRecPipelineStage` · `retireRecPipelineStage` · panel `onSave`/`onRetire` | **LIVE** — **no persist gap** |
| Starter-six / MD / funnel copy | REF/label only · not sole SoT when EFF>0 | **REF RETAIN** — DENY revive Option A |
| OBS funnel «6 giai đoạn» | QC CONDITION idle-ok P2 | **HOLD NOTE** — not unlock gap |
| PAY FE-ADMIN pack | `R-PLT-PAY-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — twin LIVE class · **FORBIDDEN reopen as unlock** |
| SI FE-ADMIN pack | `R-PLT-SI-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — twin LIVE class |
| ATT FE-ADMIN pack | `R-PLT-ATT-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — **FORBIDDEN reopen as unlock** |
| EMP FE-ADMIN / EMP-CF FE | `R-PLT-EMP-FE-ADMIN-01` · `R-PLT-EMP-CF-FE-01` HOLD | **HOLD RETAIN** — DENY reopen as unlock |
| LVRULE FE-01g | ACCEPT_AS_IS_P2 HOLD | **HOLD RETAIN** — DENY invent unlock |
| REC UX QC process / JD DnD / IV one-active | SEAL RETAIN | **FORBIDDEN reopen** |

**Conclusion:** No named closable **CNS consumer** residual remains OPEN as FAIL. READ-ONLY audit finds **no closable FE-ADMIN mount/persist gap** (Settings `RecPipelineStageSettingsPanel` mounted + Nest upsert/retire clients wired + REC-QC-02 browser admin CREATE proven). Residual class = **FE-ADMIN notes pack after LIVE admin + CNS SEAL** → prefer Option **A** · residual stays **HOLD** (not UNLOCK to `dev-fe`).

### 1.2 READ-ONLY apps/web audit (cited — no edit)

| Surface | Path | Kind | Verdict |
|---------|------|------|---------|
| Nest STG list API client | `apps/web/hrm/src/integrations/hrmApi.ts` · `listRecPipelineStages` · `HrmRecPipelineStageRecord` (~7057–7120) | GET F-REC-CAT-STG-01 | **LIVE** RETAIN |
| Nest STG effective client | `hrmApi.ts` · `listEffectiveRecPipelineStages` (~7125–7140) | GET F-REC-CAT-EFF-01 | **LIVE** consumer SoT |
| Nest STG admin CRUD clients | `hrmApi.ts` · `createRecPipelineStage` · `upsertRecPipelineStage` · `patchRecPipelineStage` · `retireRecPipelineStage` (~7157–7211) | FE-ADMIN CRUD client | **LIVE** |
| Admin panel | `apps/web/hrm/src/components/settings/RecPipelineStageSettingsPanel.tsx` | Settings «Giai đoạn REC» CRUD · upsert/retire · invalidate EFF | **LIVE mount+persist** |
| Settings shell mount | `apps/web/hrm/src/pages/Settings.tsx` · import + TabsTrigger `rec-pipeline-stages` + `<RecPipelineStageSettingsPanel />` · testid `settings-tab-rec-pipeline-stages` | product admin route | **MOUNTED LIVE** |
| Consumer EFF hook | `apps/web/hrm/src/hooks/useRecPipelineStagesEffective.ts` | Nest effective cache for pickers / kanban / IV | CNS READY RETAIN |
| Catalog helpers | `apps/web/hrm/src/lib/recPipelineStageCatalog.ts` · `.test.ts` | display-ready · soft warn · starter REF · kanban column builder · IV allow helper | RETAIN |
| Consumer UV transition | `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` · `JobCandidatesDialog.tsx` | Nest EFF picker · invent VI | CNS RETAIN |
| Consumer UV create/edit | `apps/web/hrm/src/components/recruitment/CandidateFormDialog.tsx` | Nest EFF initial stage | CNS RETAIN |
| Consumer Kanban | `apps/web/hrm/src/pages/Recruitment.tsx` · `buildRecPipelineKanbanColumns` | EFF columns when >0 · soft-empty CTA | CNS-FE READY · QA absorbed RETAIN |
| Consumer IV soft-gate | `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.tsx` · `isRecPipelineStageInterviewScheduleAllowed` | soft-block when flag false | CNS RETAIN |
| Funnel / detail REF | `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` · static funnel stages | display helper | **REF** · OBS idle-ok ≠ SoT |
| KEY toast map | `apps/web/hrm/src/lib/apiError.ts` · `HRM-REC-STAGE-UNKNOWN` | consumer invent | CNS RETAIN |

**Audit finding (unlock gate):** Unlike ATT CODE/OT/COMP (GET `listEffective*` **only**, **no** create/update admin client, **no** admin panel), REC ships **full FE-ADMIN path**: Settings tab mount + `RecPipelineStageSettingsPanel` CRUD + Nest upsert/retire clients. CNS wave already proved consumer invent KEY (**400** `HRM-REC-STAGE-UNKNOWN`), Kanban EFF columns (not starter-six), and IV soft-gate (**400** `HRM-REC-IV-400-STAGE-DISALLOW`). OBS funnel «6 giai đoạn» idle-ok is **not** a missing mount/persist of admin. **No closable FE-ADMIN mount/persist gap** → Option A HOLD · **do not** `next_owner=dev-fe`.

### 1.3 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** invent Nest dual REC admin FE as *new* mandatory continuous Task (admin already LIVE on Settings — invent would be dual/polish without sponsor)
- **DENY** reopen REC-STAGE CNS QC-01 GWC as FAIL · reopen CNS-QA stamp · reopen CNS-BE/FE READY as FAIL
- **DENY** invent LVRULE 01g unlock · reopen PAY/SI/ATT/EMP FE-ADMIN HOLD **as unlock**
- **DENY** reopen sealed REC UX QC process / JD DnD / IV one-active · reopen REC-QC-01/02 · reopen EMP/DEC/PAY/ATT/EXT/CTR/LIST-TOTALS
- **DENY** flip `recruitment_uat_ready` / `jd_dynamic_done` / `contracts_printable_ready` / `hrm_personnel_uat_ready` / `payroll_e2e_ready`
- **DENY** claim module REC UAT · Phase1 DONE · UF 🟢 whole REC
- BA AC packs for REC-STAGE-CATALOG **already locked** (BA-01) · DOCS ACCEPT — this seat is **disposition**, not redefine Nest Option B SoT
- must_keep: **CNS GWC `RECCNSQA-MSJ8KFL7`** · **Nest STG SoT** · **RecPipelineStageSettingsPanel LIVE** · **starter-six ≠ sole SoT** · **PAY/SI/ATT/EMP FE-ADMIN HOLD** · **LVRULE HOLD** · **honesty false** · **C-SLICE**

### 1.4 Decision heuristic

| Rule | Application |
|------|-------------|
| CNS SEAL + Nest is SoT + FE-ADMIN mount+persist LIVE + admin CREATE proven | FE-ADMIN invent deepen = **Option B/C reject**; note = HOLD pack |
| Closable FE-ADMIN mount/persist gap found? | Audit: **NO** → residual **HOLD** · next_owner **pm** (not `dev-fe`) |
| OBS funnel idle-ok alone? | **Not** a mount/persist gap → **does not** unlock Option B |
| Unlock FE-ADMIN only if sponsor explicitly opens polish wave OR audit finds mount/persist gap | Board + audit: no gap · no sponsor FE-ADMIN polish message → **Option A** |
| No open closable CNS FAIL residual | Prefer **A**; do not invent LVRULE / reopen PAY/SI/ATT/EMP FE-ADMIN HOLDs / flip recruitment |

---

## 2. Options

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor for REC FE-ADMIN notes — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint / stamp board residual **`R-PLT-REC-FE-ADMIN-01`** as **P2 HOLD / NOTE pack** consolidating: (1) **`R-PLT-REC-STG-FE-ADMIN`** Nest pipeline-stages Settings admin FE **LIVE** notes (mount+persist RETAIN · no further mandatory deepen); (2) **`R-PLT-REC-SETTINGS-SIX-REF`** starter-six / MD / funnel copy REF-only notes (DENY sole SoT revive). **Do not** invent `dev-fe` dual Nest admin panels. **Do not** invent ba-process AC pack. **Do not** reopen CNS GWC as FAIL. Peer *pack structure* = PAY/SI FE-ADMIN NOTES — **REC AS-IS inventory matches SI/PAY LIVE class** (not ATT ABSENT). Unlock REC FE-ADMIN polish **only** if sponsor later explicitly opens «mở FE wave REC FE-ADMIN polish / quản trị Giai đoạn REC» **or** a future audit finds a **named closable** mount/persist defect. OBS funnel idle-ok remains CONDITION NOTE — optional copy polish only under sponsor, **not** default unlock. |
| **Benefits** | Honors peer FE-ADMIN HOLD pack class · matches U88 bandwidth · honesty / C-SLICE intact · no seal churn · FE-ADMIN already covers Nest STG CRUD · CNS SEAL RETAIN · starter-six REF discipline RETAIN |
| **Costs** | Optional HDSD / UX polish for admin tab / funnel copy remains deferred until sponsor; Condition KEEP on board (HOLD ≠ CLOSED) |
| **Risks** | Misread HOLD as «waive REC admin forever» or as permission to invent second Nest admin «to complete admin» or to reopen CNS «while polishing admin» or to flip `recruitment_uat_ready` → mitigations **L-REC-FE-ADMIN-*** |
| **Gate** | CNS GWC SEAL · DOCS ACCEPT · Nest SoT RETAIN · FE-ADMIN LIVE (no gap) · honesty false |

### Option B — UNLOCK narrow FE-ADMIN deepen (`dev-fe`) if closable mount/persist gap

| | |
|--|--|
| **Description** | Unlock `dev-fe` **only if** READ-ONLY audit proves a **named closable** FE-ADMIN defect: Settings tab **not mounted**, `RecPipelineStageSettingsPanel` **missing**, or upsert/retire **unwired** / persist fail class. Optionally narrow polish for OBS funnel copy **only** when sponsor names click-path UF. |
| **Benefits** | Would close a true product admin hole if one existed; would close OBS funnel copy UF if sponsor prioritizes. |
| **Costs** | On AS-IS audit: tab **mounted**, panel **LIVE**, CRUD **wired**, REC-QC-02 admin CREATE **LIVE**, consumer KEY **400 LIVE**, Kanban EFF **LIVE**. Unlocking now invents polish / dual work **without gap** — same risk as invent ATT Nest admin without sponsor. Treating OBS idle-ok as unlock forces bandwidth without mount/persist defect. |
| **Risks** | Scope creep · reopen CNS as FAIL «while wiring admin» · flip recruitment ready · duplicate BA seat · confuse starter-six REF with Nest admin. |
| **Gate** | **Reject as default** — audit finds **no** closable mount/persist gap. Retain B only if future audit/sponsor names an explicit gap or sponsor opens funnel copy polish. |

### Option C — REJECT invent Nest dual REC admin / invent LVRULE unlock / reopen CNS as FAIL / flip printable·recruitment / reopen PAY·SI·ATT·EMP FE-ADMIN HOLDs

| | |
|--|--|
| **Description** | Invent second Nest REC admin CRUD surface (e.g. dual master outside Settings) as mandatory continuous Task; invent LVRULE 01g unlock; reopen CNS GWC as FAIL; reopen PAY/SI/ATT/EMP FE-ADMIN HOLD as unlock; flip `recruitment_uat_ready` / printable / personnel / payroll / claim module REC UAT / Phase1 / seed / reopen REC UX QC process / JD DnD / IV one-active. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Seal churn · sponsor trust · C-SLICE violation · dual admin path confusion · starter-six vs Nest SoT regression (O4 class). |
| **Risks** | **REJECT** — all DENY lines in §1.3. |

---

## 3. Trade-off matrix

| Criteria | Weight | **A ACCEPT HOLD P2** | B Unlock FE-ADMIN gap | C Invent/reopen/flip |
|----------|-------:|---------------------:|----------------------:|---------------------:|
| Honesty / DENY invent Nest dual REC admin | 5 | **5** | 2 | 0 |
| Seal safety (CNS GWC · DOCS · REC-QC · PAY/SI/ATT/EMP HOLD · LVRULE · UX/JD/IV) | 5 | **5** | 3 | 0 |
| Match peer FE-ADMIN NOTES pack class (PAY/SI LIVE twin) | 5 | **5** | 1 | 0 |
| Business value (close true mount/persist gap) | 3 | 2 | **4** *(if gap)* / 1 *(no gap)* | 1 |
| U88 continuous bandwidth | 4 | **5** | 1 | 0 |
| Complexity / blast radius | 4 | **5** | 2 | 0 |
| Maintainability (Nest SoT + LIVE Settings admin + starter REF) | 4 | **5** | 2 | 0 |
| **Weighted** | | **128** | ≤52 | 3 |

*(Weighted = Σ weight×score; A dominates when audit shows no gap.)*

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| **A** | HOLD misread as AC waive / REC admin «N/A forever without stamp» | Evidence claims REC FE-ADMIN waived | Stamp **ACCEPT_AS_IS_P2 HOLD** · AC RETAIN deferred · Condition KEEP on board |
| **A** | Silent invent second Nest REC admin «to finish admin» (dual master) | Diff dual CRUD / duplicate panels | **FORBIDDEN** · L-REC-FE-ADMIN-03 Nest dual DENY · Settings admin LIVE RETAIN |
| **A** | Reopen CNS GWC as FAIL under «admin polish» | Diff CNS evidence / stamp reopen | Cite `RECCNSQA-MSJ8KFL7` SEAL · DENY |
| **A** | Invent LVRULE 01g / reopen PAY·SI·ATT·EMP FE-ADMIN HOLDs as unlock / flip printable·recruitment | Diff LeaveTab / PAY/SI/ATT admin / CTR print / recruitment flag | DENY · peers HOLD RETAIN · printable/recruitment false |
| **A** | Mis-equate REC LIVE admin with ATT ABSENT admin → dispatch invent FE | Bus invents REC admin Task citing ATT ABSENT | Cite §1.1 discrimination · REC LIVE ≠ ATT ABSENT (SI/PAY-class) |
| **A** | Treat OBS funnel idle-ok as closable FE-ADMIN gap | Bus DISPATCHED `dev-fe` from OBS alone | L-REC-FE-ADMIN-13 · OBS ≠ mount/persist gap |
| **A** | Flip `recruitment_uat_ready` because CNS GWC | Honesty matrix | DENY · C-SLICE · AC-PLT-REC-STAGE-01H RETAIN |
| B | Unlock without mount/persist gap | Bus DISPATCHED `dev-fe` REC FE-ADMIN without gap evidence | Prefer A; B only gap-or-sponsor |
| C | Ready flip / Nest invent / CNS reopen as FAIL | Honesty matrix / seals | DENY · NO-GO process |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option A** — architecture **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Disposition** | **ACCEPT_AS_IS_P2 HOLD** on **`R-PLT-REC-FE-ADMIN-01`** (pack includes `R-PLT-REC-STG-FE-ADMIN` + `R-PLT-REC-SETTINGS-SIX-REF`) |
| **Why A** | CNS GWC SEAL (`RECCNSQA-MSJ8KFL7`); Nest is SoT (Option B catalog); Network/browser admin CREATE **LIVE** (REC-QC-02); Settings FE-ADMIN panel **LIVE** (mount + upsert/retire persist) — audit finds **no closable FE-ADMIN mount/persist gap**. OBS funnel idle-ok ≠ gap. Residual = NOTE pack peer PAY/SI FE-ADMIN HOLD *structure + LIVE inventory*, not ATT ABSENT invent. Option B unlock **not** gap-evidenced. Option C DENY. |
| **Rejected** | **B** as default unlock · **C** invent Nest dual / reopen CNS as FAIL / flip / reopen HOLDs |
| **Assumptions** | Sponsor has **not** opened REC FE-ADMIN polish wave in this message; PAY/SI/ATT/EMP FE-ADMIN HOLD remain HOLD; LVRULE 01g remains HOLD; honesty flags remain false; CNS GWC remains ACCEPT. |
| **residual** | **`R-PLT-REC-FE-ADMIN-01` = HOLD** (not UNLOCK) |
| **next_owner** | **pm** (not `dev-fe`) |

### 5.1 Unlock gates (what Option A does **not** open)

| Question | Answer |
|----------|--------|
| Unlock ba-process new AC pack? | **HOLD** — REC-STAGE BA-01 already locked · **no** duplicate BA seat for admin invent |
| Unlock ba-data / new Nest tables? | **FORBIDDEN** — `rec_pipeline_stage` already LIVE (Option B) · no schema change · no second catalog |
| Unlock REC FE-ADMIN mandatory `dev-fe`? | **HOLD** — audit shows LIVE mount+persist · no closable gap |
| Unlock / reopen CNS GWC as FAIL? | **FORBIDDEN** |
| Unlock OBS funnel copy as mandatory? | **HOLD** — idle-ok CONDITION · sponsor-gated only |
| Unlock LVRULE 01g / reopen PAY·SI·ATT·EMP FE-ADMIN HOLD as unlock? | **FORBIDDEN** |
| May PM flip `recruitment_uat_ready` / printable / personnel / payroll / claim module REC UAT? | **NO** |
| May PM remove Condition from board as CLOSED? | **NO** — keep **HOLD P2** stamp · ACCEPT_AS_IS ≠ CLOSED Condition · ≠ WAIVED |

### 5.2 When sponsor later opens REC FE-ADMIN polish wave (narrow alternate — not default)

```text
entry: sponsor message contains explicit «mở FE wave REC FE-ADMIN polish / quản trị Giai đoạn REC»
   OR future READ-ONLY audit cites named closable mount/persist gap with path+symptom
   OR sponsor explicitly opens «OBS funnel copy polish UF» (narrow — not mount invent)
retain: RECCNSQA-MSJ8KFL7 CNS GWC SEAL · RECCNSKAN-MSJ8OZBH · DOCS SRS v0.27 / HDSD CH07b ACCEPT
       · REC-QC-01/02 · Nest Option B SoT · PAY/SI/ATT/EMP FE-ADMIN HOLD · LVRULE HOLD · honesty false
       · REC UX QC process / JD DnD / IV one-active SEAL RETAIN
scope_allowed:
  1) optional ba-process ADD-only UF inventory for Settings RecPipelineStageSettingsPanel polish — NOT redefine Nest Option B schema
  2) dev-fe: narrow polish on RecPipelineStageSettingsPanel / funnel display copy ONLY (already LIVE admin)
scope_FORBIDDEN:
  - new Nest tables / schema change (rec_pipeline_stage already SoT)
  - starter-six / MD as sole picker SoT revive (Option A REJECT forever)
  - reopen CNS GWC as FAIL · reopen CNS-BE/FE as FAIL
  - invent LVRULE 01g · reopen PAY/SI/ATT/EMP FE-ADMIN HOLD as unlock · flip printable/recruitment ready
  - reopen REC UX QC process / JD DnD / IV one-active · module REC UAT / Phase1 / seed
exit: R-PLT-REC-*-FE-ADMIN may CLOSE; R-PLT-REC-FE-ADMIN-01 pack may narrow; honesty false RETAIN · C-SLICE
```

### 5.3 Architecture boundary diagram (text)

```text
  Nest public.rec_pipeline_stage L1 + REC-QC-01/02     --> SEALED RETAIN
  F-REC-CAT-STG-01 list (admin SoT)                    --> LIVE Nest
  F-REC-CAT-EFF-01 effective (picker SoT)              --> LIVE Nest
  F-REC-CAT-STG-02 admin CREATE open N+1               --> LIVE (browser REC-QC-02)
  CNS consumer invent KEY HRM-REC-STAGE-UNKNOWN        --> SEAL ACCEPT (RECCNSQA-MSJ8KFL7)
  CNS Kanban EFF + IV soft-gate                        --> READY absorbed · RETAIN
  DOCS SRS v0.27 / HDSD CH07b                          --> ACCEPT RETAIN

  REC Nest admin FE Settings tab
       RecPipelineStageSettingsPanel + upsert/retire   --> LIVE (no mount/persist gap) · NOTE HOLD

  Starter-six / MD / funnel «6 giai đoạn» copy
       CandidateDetailView / label helpers             --> REF only · ≠ sole SoT · NOTE HOLD

  R-PLT-REC-FE-ADMIN-01 (pack of the 2 NOTE rows)      --> ACCEPT_AS_IS_P2 HOLD
  PAY/SI/ATT/EMP FE-ADMIN / LVRULE / CTR FE            --> HOLD RETAIN (FORBIDDEN reopen-as-unlock)
  recruitment_uat_ready / printable / personnel        --> false RETAIN · C-SLICE

  DISCRIMINATION: ATT FE-ADMIN ABSENT ≠ REC FE-ADMIN LIVE (SI/PAY-class)
  both packs end HOLD — different inventory reasons
```

---

## 6. Locks (L-REC-FE-ADMIN-*)

| Lock | Rule |
|------|------|
| **L-REC-FE-ADMIN-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 **does not** delete AC-PLT-REC-STAGE-01* / AC-PLT-REC-02..05 · admin polish AC remains deferred FAIL-if-claimed until sponsor wave |
| **L-REC-FE-ADMIN-02 CNS SEAL frozen** | `RECCNSQA-MSJ8KFL7` · `RECCNSKAN-MSJ8OZBH` · CNS-QC-01 GWC · CNS-BE/FE READY **FORBIDDEN reopen as FAIL** |
| **L-REC-FE-ADMIN-03 Nest dual DENY** | No invent second Nest REC admin CRUD FE / dual-master without sponsor polish wave / named gap |
| **L-REC-FE-ADMIN-04 Starter-six ≠ sole SoT** | Starter helpers / MD / funnel copy remain **REF** — Option A picker SoT **REJECT RETAIN** (O4 / L-REC-STAGE-02) |
| **L-REC-FE-ADMIN-05 Printable / personnel / payroll / recruitment ready frozen** | DENY flip `contracts_printable_ready` · `hrm_personnel_uat_ready` · `payroll_e2e_ready` · `recruitment_uat_ready` · `jd_dynamic_done` |
| **L-REC-FE-ADMIN-06 Peer HOLD RETAIN** | DENY reopen PAY/SI/ATT/EMP FE-ADMIN HOLD · EMP-CF FE HOLD **as unlock** |
| **L-REC-FE-ADMIN-07 LVRULE HOLD** | DENY invent LVRULE 01g unlock |
| **L-REC-FE-ADMIN-08 Honesty** | DENY flip ready flags · C-SLICE RETAIN · DENY module REC UAT |
| **L-REC-FE-ADMIN-09 Condition KEEP** | ACCEPT_AS_IS ≠ CLOSED ≠ WAIVED — keep HOLD P2 on board |
| **L-REC-FE-ADMIN-10 LIVE ≠ ABSENT** | REC Settings admin LIVE must not be narrated as ATT-style ABSENT invent trigger |
| **L-REC-FE-ADMIN-11 Nest SoT RETAIN** | Nest `rec_pipeline_stage` remain Option B SoT — starter-six REF only · no six-only SoT revert |
| **L-REC-FE-ADMIN-12 Admin ≠ consumer** | L-REC-STAGE-01 RETAIN — invent KEY applies to consumers · admin open N+1 RETAIN |
| **L-REC-FE-ADMIN-13 OBS ≠ gap** | OBS funnel idle-ok **≠** closable FE-ADMIN mount/persist gap · not default unlock |
| **L-REC-FE-ADMIN-14 Path lock** | UTF-8 no BOM on NFD `.git`+`apps` True tree |
| **L-REC-FE-ADMIN-15 DOCS RETAIN** | SRS v0.27 · HDSD CH07b ACCEPT — no wipe client wording |
| **L-REC-FE-ADMIN-16 UX/JD/IV seals** | DENY reopen REC UX QC process · JD DnD · IV one-active · REC-QC-01/02 |

---

## 7. Impacted systems & non-goals

| In scope (docs disposition) | OUT / FORBIDDEN |
|-----------------------------|-----------------|
| Board residual `R-PLT-REC-FE-ADMIN-01` ACCEPT_AS_IS_P2 HOLD | `apps/**` edits · migration · seed |
| Option A/B/C + LOCKED A · next_dispatch PM | Invent Nest REC dual admin CRUD FE |
| Cite peer PAY/SI/ATT/EMP FE-ADMIN HOLD pack class | Reopen CNS GWC as FAIL |
| Consolidate FE-ADMIN + starter REF NOTES into pack | Invent LVRULE 01g · reopen PAY/SI HOLD as unlock · flip printable/recruitment |
| U88 PM continue next vertical/governance | Flip recruitment ready · module REC UAT · Phase1 DONE |
| Nest STG SoT + LIVE Settings admin RETAIN | Revive starter-six as sole picker SoT |

---

## 8. Validation / acceptance evidence plan

| Checkpoint | PASS when |
|------------|-----------|
| Spec ≥8KB on NFD `.git` toplevel | This file Length verified (≥8192; target peer ≥25KB) |
| Status | **CONFIRMED** · Option **A** **LOCKED** |
| Residual | `R-PLT-REC-FE-ADMIN-01` minted · **HOLD** P2 (not CLOSED · not WAIVED · not UNLOCK) |
| next_dispatch | ACCEPT HOLD seal to **pm** — **not** invent ba-process/FE Nest dual · **not** `dev-fe` |
| Honesty | ready=false · C-SLICE · DENY Nest dual invent · DENY CNS reopen as FAIL · DENY LVRULE invent · DENY flip printable/recruitment |
| Peer seals | CNS GWC · DOCS · REC-QC · PAY/SI/ATT/EMP FE-ADMIN HOLD · LVRULE HOLD RETAIN |
| Audit | Mount LIVE + persist LIVE cited — no closable gap used to force Option B |

---

## 9. Peer seal RETAIN checklist (FORBIDDEN reopen)

| Seal / HOLD | Stamp / id | Action |
|-------------|------------|--------|
| REC CNS invent KEY / IV / APP-02 | `RECCNSQA-MSJ8KFL7` · CNS-QC-01 GWC | RETAIN · DENY reopen as FAIL |
| REC CNS kanban EFF | `RECCNSKAN-MSJ8OZBH` · VAL-REC-CNS-04 | RETAIN |
| REC CNS-BE VAL | jest · CNS-BE-01 | RETAIN |
| REC CNS-FE Kanban + IV | vitest READY · QA absorbs | RETAIN |
| REC DOCS | SRS v0.27 · HDSD CH07b ACCEPT | RETAIN |
| REC-QC-01 / REC-QC-02 | GWC · `RECPLATQA2-MSIXNFE2` | RETAIN |
| REC UX QC process / JD DnD / IV one-active | process seals | RETAIN · DENY reopen |
| PAY FE-ADMIN | `R-PLT-PAY-FE-ADMIN-01` HOLD (SPEC 49325) | RETAIN · twin LIVE class · DENY reopen-as-unlock |
| SI FE-ADMIN | `R-PLT-SI-FE-ADMIN-01` HOLD (SPEC 40113) | RETAIN · twin LIVE class |
| ATT FE-ADMIN | `R-PLT-ATT-FE-ADMIN-01` HOLD (SPEC 31734) | RETAIN · DENY reopen-as-unlock |
| EMP FE-ADMIN | `R-PLT-EMP-FE-ADMIN-01` HOLD | RETAIN · twin class |
| EMP-CF FE | `R-PLT-EMP-CF-FE-01` HOLD | RETAIN · DENY reopen-as-unlock |
| LVRULE 01g | ACCEPT_AS_IS_P2 HOLD | RETAIN · DENY invent unlock |
| CTR-TEMPLATE FE | HOLD · printable not flipped | RETAIN |
| EMP/DEC/PAY/ATT/EXT/CTR/LIST-TOTALS | prior seals | RETAIN |

---

## 10. completion_report

**Closed:** SA Option/F.1 for REC **FE-ADMIN notes pack** after pipeline-stages CNS wave — READ-ONLY apps/web audit shows Settings `RecPipelineStageSettingsPanel` **mounted** (`settings-tab-rec-pipeline-stages`), `upsertRecPipelineStage` / `retireRecPipelineStage` **LIVE**, `hrmApi` Nest STG CRUD clients **LIVE** (contrast ATT GET-only ABSENT admin; match SI/PAY LIVE class); CNS GWC stamp **`RECCNSQA-MSJ8KFL7`** SEAL ACCEPT · kanban **`RECCNSKAN-MSJ8OZBH`**; DOCS SRS v0.27 / HDSD CH07b ACCEPT; starter-six / funnel REF ≠ sole SoT; board audit shows **no** open closable CNS FAIL residual and **no** closable FE-ADMIN mount/persist gap (OBS funnel idle-ok ≠ gap); class = FE-ADMIN NOTES pack after LIVE admin + CNS SEAL (peer PAY/SI FE-ADMIN HOLD *structure + LIVE inventory*); Option **A/B/C** evaluated; **Option A LOCKED ACCEPT_AS_IS_P2 HOLD**; mint **`R-PLT-REC-FE-ADMIN-01`** (packs STG FE-ADMIN + starter/MD REF); residual **HOLD** (not UNLOCK); ba-process/FE **HOLD**; DENY invent Nest dual · invent LVRULE · reopen CNS as FAIL · reopen PAY/SI/ATT/EMP FE-ADMIN HOLD as unlock · flip printable/recruitment ready · reopen UX/JD/IV; honesty false · C-SLICE · docs-only · no `apps/**`.

**Open / residual:** Condition **`R-PLT-REC-FE-ADMIN-01`** remains **HOLD P2** on W8 board until sponsor opens REC FE-ADMIN polish wave (or future named mount/persist gap); OBS funnel idle-ok remains CONDITION NOTE; ready flags false.

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM** · **CONFIRMED** · Option **A** **LOCKED**

**evidence_path:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md`

### next_dispatch_prompt (copy-ready — U88 next peer)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01
from_role: sa
to_role: pm
lane: governance · U88
ack_status: PASS_TO_PM
verdict: Option A LOCKED — ACCEPT_AS_IS_P2 HOLD on R-PLT-REC-FE-ADMIN-01
selected_option: A
residual: R-PLT-REC-FE-ADMIN-01 = HOLD (not UNLOCK)
action:
  1) Seal board residual R-PLT-REC-FE-ADMIN-01 = ACCEPT_AS_IS_P2 HOLD (Condition KEEP — not CLOSED; not WAIVED; not UNLOCK to dev-fe)
     · pack includes R-PLT-REC-STG-FE-ADMIN + R-PLT-REC-SETTINGS-SIX-REF
     · AS-IS: Settings Nest admin LIVE (RecPipelineStageSettingsPanel mount+persist) — no closable FE-ADMIN gap
     · Starter-six / MD / funnel copy = REF only (DENY sole SoT revive)
  2) DENY invent ba-process / Nest dual REC admin FE / new rec_pipeline_stage tables Tasks from this residual
  3) RETAIN: RECCNSQA-MSJ8KFL7 CNS GWC · RECCNSKAN-MSJ8OZBH · CNS-BE/FE READY · DOCS SRS v0.27 / HDSD CH07b ACCEPT
     · REC-QC-01/02 SEAL · Nest Option B SoT
     · PAY FE-ADMIN HOLD R-PLT-PAY-FE-ADMIN-01 · SI FE-ADMIN HOLD R-PLT-SI-FE-ADMIN-01
     · ATT FE-ADMIN HOLD R-PLT-ATT-FE-ADMIN-01 · EMP FE-ADMIN HOLD R-PLT-EMP-FE-ADMIN-01
     · LVRULE 01g HOLD · OBS funnel idle-ok NOTE · honesty false · C-SLICE
     · REC UX QC process / JD DnD / IV one-active SEAL RETAIN
  4) Continue U88 next vertical/governance peer per continuous board
     — DENY invent LVRULE unlock · DENY reopen CNS as FAIL
     — DENY reopen PAY/SI/ATT/EMP FE-ADMIN HOLD as unlock
     — DENY flip recruitment_uat_ready / jd_dynamic_done / contracts_printable_ready / hrm_personnel_uat_ready / payroll_e2e_ready
sponsor_gated_reopen_only: explicit «mở FE wave REC FE-ADMIN polish / quản trị Giai đoạn REC»
  OR future audit cites named closable mount/persist gap
  OR sponsor opens «OBS funnel copy polish UF» narrow
  → then narrow polish on existing RecPipelineStageSettingsPanel / funnel display ONLY (Nest Option B schema RETAIN · no new tables · no CNS reopen as FAIL · starter-six ≠ sole SoT)
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md
```

**DENY alternate:** invent Nest REC dual admin CRUD FE · invent LVRULE 01g · reopen CNS GWC as FAIL · reopen PAY/SI/ATT/EMP FE-ADMIN HOLD as unlock · flip `recruitment_uat_ready` · flip printable/personnel/payroll · claim module REC UAT / Phase1 DONE · reopen UX/JD/IV · seed · apps/** · next_owner=dev-fe without gap.

---

## 11. F.1 API / DB disposition notes (governance — no physical unlock)

| Layer | Disposition |
|-------|-------------|
| **DB** | No ADD table · Nest `public.rec_pipeline_stage` remain **LIVE SoT (Option B)** — this seat does **not** open ba-data · no schema change · no second catalog |
| **API** | No new Nest admin CRUD routes required; F-REC-CAT-STG-01/02 + F-REC-CAT-EFF-01 already proven (REC-QC + CNS invent KEY + admin CREATE) — RETAIN; FE clients upsert/retire RETAIN |
| **FE consumer** | CNS SEAL RETAIN — **out of scope reopen** (`useRecPipelineStagesEffective` · CandidatesTab · CandidateFormDialog · Recruitment Kanban · ScheduleInterviewDialog · hire hiredOutcomeKey) |
| **FE admin** | Settings Nest STG admin **LIVE RETAIN** — **HOLD** polish / dual invent |
| **Starter / MD REF** | Starter-six / funnel copy REF/alias RETAIN — **FORBIDDEN** sole picker SoT when EFF>0 |
| **F.1 completeness** | Disposition complete for residual class; physical F.1 for REC FE-ADMIN polish deferred until sponsor wave or named gap (optional BA ADD click-path only) |

### 11.1 F.1 surface map (admin ≠ consumer)

| Surface id | Role | SoT | Status this seat |
|------------|------|-----|------------------|
| S-REC-ADM-01 | Settings tab Giai đoạn REC | Nest `rec_pipeline_stage` via F-REC-CAT-STG-02 | LIVE admin · NOTE HOLD |
| S-REC-CNS-01 | Ứng viên Đổi trạng thái APP-02 | Nest EFF / F-REC-CAT-EFF-01 | CNS SEAL RETAIN |
| S-REC-CNS-02 | UV create/update initial stage | Nest EFF | CNS SEAL RETAIN |
| S-REC-CNS-03 | Kanban columns / move | Nest EFF columns | CNS SEAL · Kanban stamp RETAIN |
| S-REC-CNS-04 | Hire / hired-outcome | Nest EFF hiredOutcomeKey | CNS / hire RETAIN |
| S-REC-CNS-05 | IV schedule soft-gate | Nest EFF `allows_interview_schedule` | CNS SEAL RETAIN |
| S-REC-REF-01 | Starter-six / MD / funnel copy | REF label/display only | NOTE HOLD · ≠ sole SoT |
| S-REC-OUT-01 | JD FormSchema / IV one-active core / YCTD | separate seals | OUT · SEAL RETAIN |

### 11.2 Capability pointer (cite — do not duplicate API-01)

| Cap | Path / rule | This seat |
|-----|-------------|-----------|
| List / admin SoT | F-REC-CAT-STG-01 `GET /api/hrm/recruitment/pipeline-stages` | RETAIN · REC-QC |
| Effective picker SoT | F-REC-CAT-EFF-01 `GET …/pipeline-stages/effective` | RETAIN · CNS |
| Admin create open | F-REC-CAT-STG-02 — N+1 slug OK | RETAIN · LIVE FE admin |
| Consumer assert | `HRM-REC-STAGE-UNKNOWN` when Nest >0 | RETAIN · CNS SEAL |
| IV soft-gate | `HRM-REC-IV-400-STAGE-DISALLOW` | RETAIN · CNS SEAL |
| Hire outcome | `is_hired_outcome` / hiredOutcomeKey | must_keep RETAIN |
| JD / IV one-active / YCTD | OUT reopen | DENY |

---

## 12. References

| Artifact | Role |
|----------|------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md` | Option B Nest SoT LOCKED · L-REC-STAGE-* |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md` | AC-PLT-REC-STAGE-01* · admin≠consumer · surface inventory |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack LIVE admin (`R-PLT-PAY-FE-ADMIN-01` · SPEC 49325) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack LIVE admin (`R-PLT-SI-FE-ADMIN-01` · SPEC 40113) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack ABSENT admin (`R-PLT-ATT-FE-ADMIN-01` · SPEC 31734) |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-ADMIN-NOTES-SA-01.md` | Twin ACCEPT_AS_IS_P2 HOLD pack (`R-PLT-EMP-FE-ADMIN-01`) |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | Continuous board · REC-STAGE rows · REC FE-ADMIN NOTES row |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qc-01.md` | CNS GWC · `RECCNSQA-MSJ8KFL7` · OBS funnel idle-ok |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-docs-01.md` | DOCS ACCEPT SRS v0.27 · HDSD CH07b |
| `apps/web/hrm/src/pages/Settings.tsx` | READ-ONLY: RecPipelineStageSettingsPanel mount |
| `apps/web/hrm/src/components/settings/RecPipelineStageSettingsPanel.tsx` | READ-ONLY: LIVE admin CRUD |
| `apps/web/hrm/src/integrations/hrmApi.ts` §7057–7211 | READ-ONLY: list + effective + upsert/retire |
| `apps/web/hrm/src/hooks/useRecPipelineStagesEffective.ts` | READ-ONLY: consumer EFF |
| `apps/web/hrm/src/pages/Recruitment.tsx` | READ-ONLY: Kanban EFF consumer |
| `apps/web/hrm/src/lib/recPipelineStageCatalog.ts` | READ-ONLY: starter REF + kanban builder |
| `.cursor/templates/ADR_OPTION_TEMPLATE.md` | Option evaluation structure |

---

## 13. Expanded rationale (audit trail for PM / QC)

### 13.1 Why this is not CNS UNLOCK / reopen class

REC-STAGE-CATALOG-CNS shipped **consumer assert** (BE KEY + FE Nest picker/Kanban/IV soft-gate rebind) and **admin open N+1** was already proven at REC-QC-02. Those Conditions were executed by `dev-be` / `dev-fe` / `qa` / `qc` and SEALED at CNS-QC-01 GWC with stamp `RECCNSQA-MSJ8KFL7`. DOCS ACCEPT followed. This seat owns **only** the remaining **FE-ADMIN notes pack** class. Treating FE-ADMIN as another mandatory `dev-fe` wave without a mount/persist gap would violate DENY invent lines and risk narrating CNS GWC as FAIL «while polishing».

### 13.2 Why REC FE-ADMIN LIVE still ends HOLD (not CLOSED Condition)

FE-ADMIN panel being LIVE does **not** auto-CLOSE the board residual. Per PAY/SI/ATT/EMP FE-ADMIN NOTES peers, the pack residual is stamped **ACCEPT_AS_IS_P2 HOLD** as a durable U88 NOTE: Condition KEEP · not WAIVED · not CLOSED. LIVE inventory means **do not unlock invent** — it does **not** mean «remove residual and claim module REC admin UAT». Honesty / C-SLICE remain false. `recruitment_uat_ready` remains **false**.

### 13.3 Why REC LIVE ≠ ATT ABSENT (same HOLD outcome, different reason) — PAY/SI twin

| | ATT FE-ADMIN NOTES | REC FE-ADMIN NOTES (this seat) | PAY FE-ADMIN NOTES | SI FE-ADMIN NOTES |
|--|--------------------|--------------------------------|--------------------|-------------------|
| Admin panel component | ABSENT | LIVE (`RecPipelineStageSettingsPanel`) | LIVE (`SalaryComponentsTab`) | LIVE (`Si*SettingsPanel`) |
| Admin CRUD client | ABSENT (GET effective only) | LIVE upsert/retire | LIVE create/update/delete | LIVE upsert/retire |
| Product mount | ABSENT | LIVE Settings tab | LIVE Payroll tab | LIVE Settings tabs |
| Why HOLD | Optional Nest admin invent deferred to sponsor | No closable gap · polish deferred · NOTE pack | No closable gap · polish deferred · NOTE pack | No closable gap · polish deferred · NOTE pack |
| Unlock default? | No (sponsor FE-ADMIN wave) | No (no gap · sponsor polish only) | No | No |
| next_owner | pm | **pm** | pm | pm |

PM must **not** copy ATT «ABSENT → invent admin FE later» narrative onto REC as an automatic `dev-fe` Task. REC already has the admin FE ATT lacks (SI/PAY-class).

### 13.4 Why Nest SoT (not starter-six / MD sole) shapes this pack

REC-STAGE-CATALOG chose **Option B = Nest `rec_pipeline_stage` as code SoT**. Starter-six / MD / funnel copy remain REF/label (Option A REJECT · L-REC-STAGE-02). FE-ADMIN Settings panel is **Nest-backed** CRUD (not a starter-six-only SoT). Therefore there is **no** Settings-gap unlock, and **no** ATT-style «admin ABSENT» invent. The residual is a consolidation NOTE after CNS SEAL. Pack explicitly includes starter REF row so PM does not misread «funnel 6 giai đoạn» as missing Nest admin.

### 13.5 OBS funnel idle-ok — why not Option B

CNS-QC stamped funnel title «6 giai đoạn» as CONDITION idle-ok P2: display helper ≠ kanban SoT (kanban already EFF cols proven). That is an **evidence coverage / copy note**, not a missing `RecPipelineStageSettingsPanel` mount or unwired upsert/retire. Using OBS alone to unlock `dev-fe` would invent a mandatory polish wave without sponsor and without FE-ADMIN mount/persist gap — **DENY as default** (L-REC-FE-ADMIN-13). Sponsor may later open narrow funnel copy UF under §5.2.

### 13.6 Honesty / C-SLICE statement

Closing CNS Conditions and stamping FE-ADMIN HOLD **must not** flip:

- `recruitment_uat_ready`
- `jd_dynamic_done`
- `contracts_printable_ready`
- `hrm_personnel_uat_ready`
- `payroll_e2e_ready`

Nor claim module REC UAT, Phase1 DONE, or UF 🟢 for whole REC. **`C-SLICE-≠-MODULE`** remains true: many GWC slices ≠ module GO. REC UX QC process / JD DnD / IV one-active remain SEAL RETAIN.

### 13.7 U88 continuity after this seat

PM should:

1. Seal `R-PLT-REC-FE-ADMIN-01` HOLD on W8 board.
2. **Not** dispatch `dev-fe` / ba-process for REC FE-ADMIN invent (HOLD · no gap).
3. Continue next vertical / governance peer without inventing LVRULE unlock, reopening CNS as FAIL, reopening PAY/SI/ATT/EMP FE-ADMIN HOLD as unlock, or flipping recruitment/printable/personnel/payroll.
4. Keep peer FE-ADMIN HOLDs RETAIN — **do not** reopen-as-unlock.

### 13.8 Seal citation block (mission seals)

| Seal | Role |
|------|------|
| `RECCNSQA-MSJ8KFL7` | REC CNS QA-01 invent KEY + IV soft-gate · QC-01 GWC SEAL ACCEPT |
| `RECCNSKAN-MSJ8OZBH` | Kanban EFF VAL-REC-CNS-04 |
| CNS-FE-01 READY | Kanban EFF · IV soft-gate vitest · absorbed by QA-01 |
| DOCS ACCEPT | SRS v0.27 · HDSD CH07b |
| `R-PLT-PAY-FE-ADMIN-01` | Prior U88 PAY FE-ADMIN Option A HOLD · SPEC 49325 — DENY reopen as unlock |
| `R-PLT-SI-FE-ADMIN-01` | Peer LIVE FE-ADMIN HOLD pack · SPEC 40113 |

### 13.9 W8 board REC rows (context — disposition only)

| Board row | Role status (AS-IS) | This seat effect |
|-----------|---------------------|------------------|
| REC-STAGE-CATALOG SA→BA | CONFIRMED Option B → AC pack | RETAIN |
| REC-STAGE CNS-BE→FE→QA→QC | READY / PASS / GWC `RECCNSQA-MSJ8KFL7` | RETAIN · FORBIDDEN reopen as FAIL |
| REC-STAGE DOCS-01 | ACCEPT SRS v0.27 · HDSD CH07b | RETAIN |
| REC-FE-ADMIN-NOTES-SA-01 | DISPATCHED → this CONFIRMED A HOLD | Mint `R-PLT-REC-FE-ADMIN-01` HOLD |

---

## 14. Residual ID registry (mint)

| ID | Severity | Status after this seat | Owner next |
|----|----------|------------------------|------------|
| **R-PLT-REC-FE-ADMIN-01** | P2 | **ACCEPT_AS_IS_P2 HOLD** (KEEP Condition) | pm (board seal) |
| R-PLT-REC-STG-FE-ADMIN | P2 | **HOLD ⊆ pack** (not CLOSED) · LIVE admin NOTE | sponsor-gated polish / named gap only |
| R-PLT-REC-SETTINGS-SIX-REF | P2 | **HOLD ⊆ pack** · starter/MD REF NOTE · DENY sole SoT | sponsor-gated docs/UX only |
| OBS funnel «6 giai đoạn» | P2 | **CONDITION idle-ok RETAIN** · ≠ mount gap | sponsor-gated copy polish only |
| CNS invent KEY / Kanban / IV | — | **SEAL ACCEPT** RETAIN (`RECCNSQA-MSJ8KFL7`) | — |

---

## 15. RETAIN list (must_keep for next owners)

1. Nest `rec_pipeline_stage` Option B SoT LIVE + F-REC-CAT-STG/EFF
2. Settings FE-ADMIN `RecPipelineStageSettingsPanel` LIVE (mount + upsert/retire) — do not invent dual
3. CNS GWC stamp `RECCNSQA-MSJ8KFL7` · kanban `RECCNSKAN-MSJ8OZBH` · CNS-BE/FE READY — DENY reopen as FAIL
4. DOCS SRS v0.27 · HDSD CH07b ACCEPT
5. Starter-six / MD / funnel REF ≠ sole picker SoT (O4 / Option A REJECT)
6. PAY FE-ADMIN HOLD `R-PLT-PAY-FE-ADMIN-01` · SI FE-ADMIN HOLD `R-PLT-SI-FE-ADMIN-01` · ATT FE-ADMIN HOLD · EMP FE-ADMIN HOLD · EMP-CF FE HOLD
7. LVRULE 01g ACCEPT_AS_IS_P2 HOLD
8. `recruitment_uat_ready=false` · `jd_dynamic_done=false` · printable/personnel/payroll false
9. U65 zero-seed · `C-SLICE-≠-MODULE` · no module REC UAT claim
10. Admin ≠ consumer (L-REC-STAGE-01) · open N+1 admin ≠ invent KEY consumer
11. OBS funnel idle-ok NOTE ≠ FE-ADMIN gap
12. REC UX QC process / JD DnD / IV one-active SEAL RETAIN
13. Path lock NFD WriteAllText UTF-8 no BOM

---

## 16. Option evaluation appendix (template §§1–7 coverage map)

| Template § | This document |
|------------|---------------|
| §1 Decision Context | Header table + §1 |
| §2 Problem to Solve | §1.1–1.4 |
| §3 Options A/B/C | §2 |
| §4 Trade-off Matrix | §3 |
| §5 Failure Modes | §4 |
| §6 Decision | §5 |
| §7 Implementation / Validation | §5.2 · §7 · §8 · §10 · §11 |
| F.1 notes | §11 + §11.1 + §11.2 |

---

## 17. QA/QC evidence pointers (read-only cite)

| Evidence | Stamp / verdict | Use |
|----------|-----------------|-----|
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qc-01.md` | GWC · `RECCNSQA-MSJ8KFL7` · OBS idle-ok | CNS SEAL RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01.md` | PASS invent KEY + IV + APP-02 | SEAL cite |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-fe-01.md` | READY vitest Kanban+IV | absorbed RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-be-01.md` | jest READY | VAL RETAIN |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-docs-01.md` | ACCEPT SRS v0.27 · HDSD CH07b | DOCS RETAIN |
| PAY FE-ADMIN NOTES SPEC | Length 49325 · Option A HOLD | Peer LIVE depth COPY |
| SI FE-ADMIN NOTES SPEC | Length 40113 · Option A HOLD | Peer LIVE depth COPY |
| ATT FE-ADMIN NOTES SPEC | Length 31734 · Option A HOLD | Peer ABSENT contrast |

---

## 18. Explicit non-claims (process honesty)

This seat **does not** claim:

- Module REC UAT READY
- `recruitment_uat_ready=true`
- `jd_dynamic_done=true`
- Module CTR printable READY / personnel UAT READY / payroll READY
- Phase 1 DONE
- UF 🟢 for whole recruitment pillar
- FE-ADMIN Condition CLOSED (it is HOLD)
- Permission to reopen PAY/SI/ATT/EMP FE-ADMIN HOLD as unlock
- Permission to invent LVRULE unlock
- Permission to reopen CNS GWC as FAIL
- Permission to reopen REC UX QC process / JD DnD / IV one-active
- Closable FE-ADMIN mount/persist gap (audit negative)
- OBS funnel idle-ok as mount/persist defect

---

## 19. Scope parity / U19 note (SA proactive)

List `GET /api/hrm/recruitment/pipeline-stages`, get-by-id, admin mutate, effective, and consumer assert paths must continue to share **`resolveHrmListScope`** (L-REC-STAGE-06 · CNS-BE scope_parity). This seat **does not** reopen scope work; any future polish wave must **retain** scope_parity tests. **No** J-HRM-REC* L2.5 promote from this disposition.

---

## 20. Program journey / honesty flags (U19)

| Flag / journey | State after this seat |
|----------------|----------------------|
| `recruitment_uat_ready` | **false** RETAIN |
| `jd_dynamic_done` | **false** RETAIN |
| J-HRM-REC* L2.5 promote | **DENIED / deferred** |
| `C-SLICE-≠-MODULE` | **true** |
| printable / personnel / payroll | **false** RETAIN |
| Missing J-* for REC FE-ADMIN polish | Documented as **sponsor-gated** — not architecture gap forcing unlock |

---

## 21. BA governance notes (for future sponsor wave only)

If sponsor opens §5.2 polish:

1. **ba-process** ADD-only UF inventory for `RecPipelineStageSettingsPanel` polish — **do not** redefine Nest Option B / AC-PLT-REC-STAGE-01*.
2. Keep admin≠consumer split explicit in any new AC rows.
3. Starter-six / MD REF remains non-SoT — any funnel UX polish must not revive Option A picker SoT.
4. OBS funnel copy = separate narrow UF if named — not bundled as Nest dual invent.
5. QA evidence must remain U65 FE-only · no seed.
6. DENY reopen CNS GWC / REC UX QC process / JD DnD / IV one-active as side-effect of polish.

Until then: **ba-process HOLD** this residual.

---

## 22. Risk register (compressed)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PM unlocks `dev-fe` without gap | Med | Med | Option A LOCK · next_owner pm · L-REC-FE-ADMIN-03/10 |
| CNS narrated FAIL during polish talk | Low | High | L-REC-FE-ADMIN-02 · seal checklist §9 |
| Starter-six sole SoT revive | Med | High | L-REC-FE-ADMIN-04 · pack REF row |
| recruitment_uat_ready flip | Med | High | L-REC-FE-ADMIN-05/08 · §18 non-claims |
| ATT ABSENT narrative copied to REC | Med | Med | §13.3 discrimination table |
| PAY/SI FE-ADMIN HOLD reopened as unlock | Low | High | L-REC-FE-ADMIN-06 · mission DENY |
| REC UX / JD / IV reopen under polish | Low | High | L-REC-FE-ADMIN-16 |

---

## 23. Write protocol verification block

| Check | Expected |
|-------|----------|
| Path | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md` |
| Encoding | UTF-8 **no BOM** via `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))` |
| Tree | NFD `.git`+`apps` True (canonical) |
| Length | **MUST ≥ 8192** (peer target ≥25KB) |
| Lane | docs-only · **no** `apps/**` · **no** `packages/**` |

---

## 24. Admin vs Kanban consumer boundary (mission cover)

| Axis | Settings admin (FE-ADMIN) | Kanban / CNS consumer |
|------|---------------------------|------------------------|
| SoT | Nest `rec_pipeline_stage` via F-REC-CAT-STG list/mutate | Nest EFF via F-REC-CAT-EFF-01 |
| UI | `RecPipelineStageSettingsPanel` · Settings tab | `Recruitment.tsx` `buildRecPipelineKanbanColumns` + CandidatesTab + FormDialog + ScheduleInterviewDialog |
| Create N+1 | **OPEN** admin (BR-PLT-05 · AC-PLT-REC-STAGE-01d) | **FORBIDDEN** invent stage key when EFF>0 |
| Invent KEY | N/A (admin creates valid slug) | **400** `HRM-REC-STAGE-UNKNOWN` |
| This seat | LIVE · HOLD NOTE pack | CNS SEAL RETAIN · FORBIDDEN reopen |
| Misread risk | Treat as ABSENT → invent dual | Treat as reopen CNS to «finish admin» |

**Architecture rule:** Admin Settings CRUD and Kanban consumer are **orthogonal surfaces** of one Nest SoT. CNS FE READY (Kanban EFF) **does not** imply FE-ADMIN mount gap. FE-ADMIN LIVE **does not** imply CNS reopen. Residual is NOTES HOLD only.

---

## 25. Cross-vertical FE-ADMIN HOLD registry (U88 continuity)

| Residual | Vertical | Inventory class | Status |
|----------|----------|-----------------|--------|
| `R-PLT-ATT-FE-ADMIN-01` | ATT | ABSENT Nest admin | HOLD RETAIN |
| `R-PLT-EMP-FE-ADMIN-01` | EMP | ST ABSENT / POS·DEPT Settings | HOLD RETAIN |
| `R-PLT-SI-FE-ADMIN-01` | SI | LIVE Settings Nest admin | HOLD RETAIN |
| `R-PLT-PAY-FE-ADMIN-01` | PAY | LIVE Payroll Nest admin | HOLD RETAIN |
| **`R-PLT-REC-FE-ADMIN-01`** | **REC** | **LIVE Settings Nest admin** | **HOLD minted this seat** |
| LVRULE 01g | ATT leave | ABSENT product FE | HOLD RETAIN · DENY invent |

All of the above end as **ACCEPT_AS_IS_P2 HOLD** for U88 — unlock only on sponsor polish wave or named closable gap. **DENY** reinterpret any HOLD as unlock because a peer vertical sealed CNS/consumer.

---

## 26. Final stamp (SA)

| Field | Value |
|-------|--------|
| **selected_option** | **A** |
| **residual** | **`R-PLT-REC-FE-ADMIN-01` = HOLD** |
| **next_owner** | **pm** |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **SPEC path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-ADMIN-NOTES-SA-01.md` |
| **RETAIN** | CNS GWC · DOCS · Nest SoT · Settings admin LIVE · PAY/SI/ATT/EMP FE-ADMIN HOLD · LVRULE HOLD · honesty false · C-SLICE · UX/JD/IV seals |
