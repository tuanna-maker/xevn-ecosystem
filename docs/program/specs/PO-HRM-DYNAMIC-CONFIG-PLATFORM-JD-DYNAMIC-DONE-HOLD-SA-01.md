# PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01 — Option/F.1 · `jd_dynamic_done` companion honesty HOLD (W8 U88)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01` |
| **Parent** | U88 continuous honesty registry · after **`FE-ADMIN-REOPEN-GATE-BA-03`** SEALED (ADD rows **#17–21** · SPEC **23971**) · peer **`HONESTY-PACK-SYNTH-SA-01`** Option A LOCKED (SPEC **25083**) · **`REC-UAT-HOLD-SA-01`** SEALED (`R-PLT-REC-UAT-01` · SPEC **35658**) · **`EMP-UAT-HOLD-SA-01`** SEALED (`R-PLT-EMP-UAT-01` · SPEC **43380**) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 continuous governance |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for program companion honesty flag **`jd_dynamic_done=false`** — formalize **LIVE** JD dynamic **L3 QC-01 GWC** (J-HRM-JD-01..03 scoped + G4) vs **forbidden** JD program DONE / `jd_dynamic_done=true` / REC module UAT / Phase1 DONE claims |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** forever-until-sponsor · mint **`R-PLT-JD-DYNAMIC-DONE-01`** · **DENY** flip `jd_dynamic_done=true` · **DENY** conflate L3 GWC with program closure |
| **residual_id** | **`R-PLT-JD-DYNAMIC-DONE-01`** *(minted this seat — consolidates JD dynamic depth honesty + L3 QC stamp inventory + YCTD/JD ref chain deferral + REC peer companion cite)* |
| **peer_cite_rec_uat** | [`REC-UAT-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01.md) **`R-PLT-REC-UAT-01`** · **`recruitment_uat_ready=false`** · **`jd_dynamic_done=false`** (companion cited there) — **RETAIN · FORBIDDEN bundled flip without separate sponsor waves** |
| **peer_cite_honesty_pack** | [`HONESTY-PACK-SYNTH-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-HONESTY-PACK-SYNTH-SA-01.md) §10 companion row **`jd_dynamic_done=false`** — **RETAIN** |
| **peer_cite_jd_l3** | QC **`PO-HRM-JD-DYNAMIC-QC-01`** GWC · evidence [`po-hrm-jd-dynamic-qc-01.md`](../../qa/evidence/po-hrm-jd-dynamic-qc-01.md) · QA-03 PASS — **SEAL RETAIN · ≠ jd_dynamic_done true** |
| **Honesty** | **`jd_dynamic_done=false`** · **`recruitment_uat_ready=false`** (peer) · **`hrm_personnel_uat_ready=false`** · **`employees_e2e_linkage_ready=false`** (peer companion class) · **`remaster_program_done=false`** · **`face_live=false`** · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** JD program DONE · Phase1 DONE · product GO · flip jd_dynamic_done from L3 GWC · reopen REC CNS / FE-ADMIN HOLDs as unlock |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

> **HARD EXIT GATE:** NFD path · UTF-8 **no BOM** · Shell **Length ≥ 8192** verified before CONFIRMED. Empty turn = INVALID.

---

## 1. Decision context (ADR option pack §1)

| | |
|--|--|
| **Decision title** | Formalize companion honesty: **`jd_dynamic_done=false`** HOLD vs sponsor-gated **JD dynamic program closure** wave vs invent flip from **PO-HRM-JD-DYNAMIC-QC-01** L3 GWC |
| **Requestor** | pm · U88 after FE-ADMIN-REOPEN-GATE-BA-03 SEALED |
| **Decision owner** | sa |
| **Related** | FR-HRM-RC-JD-* · PO-HRM-JD-DYNAMIC-SPEC-01 · ARCH-02 · J-HRM-JD-01..03 · J-HRM-JD-YCTD-01 · YCTD↔JD ref chain · REC UX P0 · plan console · IV slices · platform catalog dynamic (field/group/pack/job-templates) |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` §§1–7 + **§9 F.1** |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` row `…-JD-DYNAMIC-DONE-HOLD-SA-01` |

### 1.1 Problem — what JD L3 QC-01 GWC proved vs what `jd_dynamic_done` still means

Under U65, the **JD dynamic bounded slice** (Settings field create + rules PUT + F5; pack resolve + canvas groups=6 + job-templates POST 201 + snapshot GET + F5; wave hierarchy Xem scoped; G4 pack-confirm) received **QC GO WITH CONDITIONS** on **`PO-HRM-JD-DYNAMIC-QC-01`** while **every** gate artifact explicitly stamps **`jd_dynamic_done=false`**, **`remaster_program_done=false`**, **`face_live=false`**, and **denies** Phase 1 DONE · product UAT DONE · PROD-READY.

**Question for F.1:** Should SA recommend **`jd_dynamic_done=true`** because J-HRM-JD-01..03 + G4 passed L2.5 browser QC, or **LOCK Option A HOLD** until sponsor opens a **named JD dynamic program closure** wave (YCTD attach · full FormSchema depth · UV/compare · REC-03 policy · remaster/face gates · journey map full JD spine)?

**Answer (LOCKED):** **Option A** — L3 **catalog dynamic / CFG slice LIVE** **≠** **`jd_dynamic_done=true`**. **UNLOCK flag flip only** when sponsor message opens **explicit JD dynamic DONE wave** with UF/J-* inventory + QC GO on **program** scope — else **HOLD forever-until-sponsor**.

This seat **formalizes intentional program honesty** — **not** stale documentation left behind after QC-01.

### 1.2 LIVE inventory — RETAIN (do not reopen as FAIL pretext for flip)

These surfaces are **LIVE** and **RETAIN** — they are **not** arguments to set **`jd_dynamic_done=true`**:

| Vertical | Surface / stamp | Evidence class | Verdict |
|----------|-----------------|----------------|---------|
| **JD dynamic L3 QC** | J-HRM-JD-01 field+rules+F5 · J02 create+snapshot+F5 · J03 wave Xem scoped · G4 confirm | QC **`PO-HRM-JD-DYNAMIC-QC-01`** GWC · QA-03 PASS | **L3 C-SLICE SEALED** · **≠ program DONE** |
| **JD dynamic CFG stack** | field/group/pack resolve · job-templates · rules PUT strip · writer canvas | BE-02 READY · FE-03 READY · jest/vitest PASS | **LIVE product slice** |
| **Platform catalog dynamic pattern** | Invent KEY · pack resolve · snapshot groupsLen | Same wave as L3 QC | **Catalog dynamic LIVE** · **≠ jd_dynamic_done** |
| **REC stage catalog L1/CNS** | RECPLATQA* · RECCNSQA | REC vertical platform | **Orthogonal REC slice** · **≠ JD program DONE** |
| **REC UX P0 / plan console** | UX process QC stamps | Narrow GWC | **C-SLICE** · honesty false on seal |
| **REC IV one-active browser** | IV soft-gate slice GWC | recruitment_uat_ready=false on evidence | **C-SLICE** · **≠ module REC UAT** |
| **JD DnD CERTIFIED slice** | Sponsor 2026-08-06 UX process | Bus honesty false | **C-SLICE** · **DENY jd_dynamic flip** |
| **YCTD↔JD ref chain** | Paper/API trace · J-HRM-JD-YCTD-01 deferred soft on QC-01 | QC condition · not exercised | **OPEN depth** · supports flag false |
| **HONESTY-PACK-SYNTH** | Five module flags false + companions | Option A LOCK | **RETAIN all false** |

**Critical discrimination (mission LIVE vs DENY):**

| Claim | Allowed? | Why |
|-------|----------|-----|
| «JD dynamic L3 QC-01 GWC on J-HRM-JD-01..03 + G4» | **YES** | Bounded CFG + library slice |
| «Platform catalog dynamic (field/pack/template) LIVE» | **YES** | **≠** `jd_dynamic_done=true` |
| «REC UX P0 / plan console / IV slices GWC» | **YES** | **C-SLICE** only |
| «YCTD↔JD ref chain documented on paper/API» | **YES** as trace | **NOT** module/program DONE |
| «Set **`jd_dynamic_done=true`** from QC-01» | **NO** | QC **explicitly denied** |
| «Claim JD/REC **module UAT** or Phase1 DONE from L3 GWC» | **NO** | **`R-PLT-REC-UAT-01`** HOLD · C-SLICE |
| «Flip **`recruitment_uat_ready`** because JD slice passed» | **NO** | Separate module flag |
| «Reopen sealed REC CNS / FE-ADMIN HOLDs» | **NO** | Mission DENY |
| «Invent Nest dual admin writer» | **NO** | Mission DENY · ARCH locked |

### 1.3 FORBIDDEN by `jd_dynamic_done=false` (companion honesty gate)

| Blocked claim | Detection | Mitigation |
|---------------|-----------|------------|
| JD dynamic **program DONE** | PM matrix / bus promote | Cite this SPEC + QC-01 honesty table |
| Flip flag from L3 GWC alone | Bus diff on honesty JSON | SA **REJECT** · Option C |
| Phase 1 DONE / product GO from JD slice | Release narrative | QC NO-GO · **`R-PLT-JD-DYNAMIC-DONE-01` HOLD** |
| Bundle flip with **`recruitment_uat_ready`** | Dual promote | Cite **`R-PLT-REC-UAT-01`** |
| Reopen **RECCNSQA** / REC FE-ADMIN as JD unlock | Dispatch pattern | **FORBIDDEN** · sealed HOLDs |
| Claim full **J-HRM-JD-YCTD-01** closed from J03 scoped view | Journey map | **DENY** · QC deferred YCTD attach |
| **`remaster_program_done`** / **`face_live`** from JD wave | QC-01 must_keep | **RETAIN false** |
| **`apps/**`** patch to «fix honesty» | PM dispatch | **DENIED** this seat |

### 1.4 Honesty flag registry (companion — not a sixth module UAT flag)

| Flag key | AS-IS | This seat |
|----------|-------|-----------|
| **`jd_dynamic_done`** | **false** (QC-01 · honesty pack · bus grep) | **Primary subject** · mint **`R-PLT-JD-DYNAMIC-DONE-01`** |
| **`recruitment_uat_ready`** | **false** · **`R-PLT-REC-UAT-01` SEALED** | **Peer module gate** · **DENY** bundled flip |
| **`employees_e2e_linkage_ready`** | **false** · **`R-PLT-EMP-UAT-01`** | **Peer companion class** · separate e2e wave |
| **`remaster_program_done`** | **false** (QC-01 locked) | **RETAIN** · orthogonal program gate |
| **`face_live`** | **false** (QC-01 locked) | **RETAIN** · orthogonal program gate |
| **`C-SLICE-≠-MODULE`** | **true** (doctrine) | **RETAIN** |

PM must not promote **`jd_dynamic_done=true`** while YCTD attach · full JD spine · REC module UAT · remaster/face gates remain open without explicit QC scope for **JD program closure** — default **`jd_dynamic_done=false`** until sponsor JD dynamic DONE wave.

### 1.5 RETAIN peer HOLDs (do not reopen as JD DONE unlock)

| Residual | Spec | Rule |
|----------|------|------|
| **`R-PLT-REC-UAT-01`** | REC-UAT-HOLD | REC module UAT · **`recruitment_uat_ready=false`** |
| **`R-PLT-REC-FE-ADMIN-01`** | REC-FE-ADMIN-NOTES | **FORBIDDEN reopen** as JD/REC module unlock |
| **`RECCNSQA-MSJ8KFL7`** | REC CNS GWC | **SEAL RETAIN** |
| **`R-PLT-EMP-UAT-01`** | EMP-UAT-HOLD | Personnel module · separate wave |
| **HONESTY-PACK-SYNTH** | Five module flags | **Option A** · all false |
| **FE-ADMIN-REOPEN-GATE-BA-03** | Rows #17–21 | Module UF placeholders · **no flip from doc** |

### 1.6 READ-ONLY apps cite (JD dynamic spine — no edit)

| Symbol | Path (read-only) | Role |
|--------|------------------|------|
| JD constants / pack | `apps/api/hrm-api/src/recruitment/jd-dynamic.constants.ts` | Pack keys · resolve |
| Nest JD CFG | `apps/api/hrm-api/src/recruitment/*` · job-templates · field rules | CFG SoT |
| FE Settings JD | Settings Cấu hình JD · writer · hierarchy view | L3 QC paths |
| FE slice map | `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` | Feature slice |

Audit finding: **Substantial JD dynamic CFG + library slice is LIVE** for **L3 QC-01 GWC** — yet **QC evidence requires `jd_dynamic_done=false`**. SA **confirms** intentional honesty (YCTD deferral · full program spine · REC-03/UV depth · remaster/face gates), **not** documentation drift or forgotten flip.

### 1.7 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** `jd_dynamic_done=true` without sponsor JD dynamic DONE wave
- **DENY** reopen REC CNS / REC FE-ADMIN HOLD as pretext
- **DENY** claim JD/REC module UAT or Phase1 DONE from L3 GWC
- **DENY** invent Nest dual writer / empty governance turn
- **RETAIN** QC-01 GWC · soft OBS conditions · honesty false · **C-SLICE**
- **UNLOCK** honesty flag **only** if sponsor **explicit** JD dynamic program closure wave + UF/J-* list + QC GO **program** scope

### 1.8 Decision heuristic

| Rule | Application |
|------|-------------|
| L3 GWC + `jd_dynamic_done=false` on evidence | **Option A HOLD** — formalize, do not flip |
| Sponsor opens «JD dynamic DONE wave» + UF | **Future Option B** — out of this seat default |
| «QC-01 PASS ⇒ jd_dynamic_done true» | **Option C REJECT** — violates QC seal |
| «Catalog dynamic LIVE ⇒ program DONE» | **REJECT** — C-SLICE taxonomy |
| «REC slice passed ⇒ flip jd_dynamic_done» | **REJECT** — peer HOLD |
| «YCTD paper trace ⇒ flip flag» | **REJECT** — depth wave open |

---

## 2. Problem to solve (ADR §2)

### 2.1 Current state

| Layer | AS-IS | Honesty reading |
|-------|-------|-----------------|
| JD dynamic L3 QC-01 | J01..03 scoped + G4 GWC | **Slice LIVE** · flag **false** correct |
| Platform catalog dynamic | field/pack/template resolve LIVE | **≠ jd_dynamic_done** |
| YCTD↔JD ref chain | Paper/API · J03 YCTD attach deferred | **OPEN** · supports false |
| REC UX / IV / plan console slices | GWC under U65 | **C-SLICE** · **≠ JD program DONE** |
| REC module UAT | **`R-PLT-REC-UAT-01` HOLD** | **Orthogonal** |
| remaster / face program gates | false on QC-01 | **RETAIN** |
| Program W8 | Row DISPATCHED for this seat | **Needs mint** **`R-PLT-JD-DYNAMIC-DONE-01`** |

### 2.2 Failure impact if mis-governed

| Risk | Impact |
|------|--------|
| Flip `jd_dynamic_done` from QC-01 alone | False program DONE · QC honesty breach |
| Claim Phase1 / product GO from JD slice | Violates continuous honesty program |
| Conflate REC L1/CNS with JD program closure | Scope collapse · **`R-PLT-REC-UAT-01`** violation |
| Reopen REC CNS / FE-ADMIN as unlock | Seal loss · mission DENY |
| Bundle flip recruitment + jd_dynamic | Dual-flag promote without QC scope |
| PM treats false flag as stale docs | Sponsor trust loss · re-dispatch waste |

---

## 3. Options (ADR §3)

### Option A — ACCEPT_AS_IS_P2 HOLD forever-until-sponsor — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint **`R-PLT-JD-DYNAMIC-DONE-01`**: (1) **LIVE** L3 QC-01 + catalog dynamic inventory §1.2; (2) **`jd_dynamic_done=false`** **correct** until sponsor JD dynamic DONE wave; (3) **DENY** flip/reopen paths §6.3; (4) **RETAIN** peer REC/EMP/honesty-pack HOLDs. |
| **Benefits** | Aligns QC-01 explicit denial · closes companion honesty gap · zero apps churn · symmetric with REC-UAT companion cite |
| **Costs** | Full JD program closure deferred until sponsor |
| **Risks** | HOLD misread as «JD broken» → mitigations **L-JD-DYN-*** |
| **Gate** | QC-01 + honesty pack grep **`jd_dynamic_done=false`** consistent |

### Option B — UNLOCK `jd_dynamic_done=true` (default reject)

| | |
|--|--|
| **Description** | Set flag true because L3 QC-01 GWC passed. |
| **Benefits** | None — contradicts QC-01 must_keep |
| **Costs** | Honesty violation |
| **Risks** | **DENIED** mission line |
| **Gate** | **REJECT** unless sponsor + program UF matrix + QC sign-off |

### Option C — REJECT invent / reopen / flip

| | |
|--|--|
| **Description** | Flip flag · reopen REC CNS/FE-ADMIN · claim REC/JD module UAT · Phase1 DONE · invent Nest dual · seed · `apps/**`. |
| **Benefits** | None |
| **Costs** | Seal loss |
| **Risks** | **DENY** all mission FORBIDDEN lines |

---

## 4. Trade-off matrix (ADR §4)

| Criteria | Weight | Option A HOLD | Option B flip | Option C invent |
|---|--:|--:|--:|--:|
| QC-01 honesty / must_keep integrity | 5 | **5** | 0 | 0 |
| W8 continuous policy compliance | 5 | **5** | 0 | 0 |
| Clarity L3 slice vs JD program DONE | 5 | **5** | 1 | 0 |
| Sponsor trust (intentional HOLD) | 4 | **5** | 0 | 0 |
| Time to full JD program closure | 3 | 3 | **4** | 1 |
| Delivery cost now | 4 | **5** | 2 | 0 |
| **Weighted tendency** | | **Dominates** | Reject | Reject |

---

## 5. Failure modes and mitigation (ADR §5)

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | «QC-01 ⇒ flip jd_dynamic_done» | Bus promote without UF | Cite QC-01 §NOT claimed + this SPEC |
| A | User thinks JD CFG missing | Support | Cite LIVE J01..03 evidence + flag false intentional |
| A | PM drops companion row | Board scan | **`R-PLT-JD-DYNAMIC-DONE-01`** mint |
| B | False program DONE narrative | QC audit | NO-GO · revert flag |
| C | Reopen REC CNS as JD unlock | Duplicate QA | **FORBIDDEN** · RECCNSQA RETAIN |
| C | Bundle REC + jd_dynamic flip | Dual promote | Cite **`R-PLT-REC-UAT-01`** |
| C | Invent Nest dual | Architecture drift | ARCH-02 RETAIN · DENY |

---

## 6. Decision (ADR §6)

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_P2 HOLD** |
| **Why** | **PO-HRM-JD-DYNAMIC-QC-01** **GWC** proves bounded J-HRM-JD-01..03 + G4 while **mandating `jd_dynamic_done=false`**. YCTD attach · full JD spine · REC module UAT · remaster/face remain **open**. Platform **catalog dynamic** LIVE **≠** program DONE. Companion **`R-PLT-REC-UAT-01`** and honesty pack **RETAIN**. |
| **Assumptions** | Sponsor did not open «JD dynamic DONE wave» with UF list in this message. |
| **Rejected** | **Option B** flag flip · **Option C** full DENY list |

### 6.1 Unlock gates (Option A does not open)

| Question | Answer |
|----------|--------|
| Flip **`jd_dynamic_done=true`** now? | **NO** |
| Flip **`recruitment_uat_ready`** via this seat? | **NO** — **`R-PLT-REC-UAT-01`** |
| Reopen REC CNS / REC FE-ADMIN HOLD? | **FORBIDDEN** |
| Claim Phase1 DONE / product GO from L3? | **NO** |
| Dispatch dev-* for «close jd_dynamic_done» from HOLD? | **NO** default |

### 6.2 Sponsor-gated narrow alternate (not default)

```text
entry: sponsor message explicit «mở wave JD dynamic DONE / đóng jd_dynamic_done» + named UF-IDs (J-HRM-JD-YCTD-01 attach · full FormSchema depth · UV/compare where in scope · remaster/face policy explicit · REC-03 policy · persona matrix) + U65 browser evidence plan
retain: PO-HRM-JD-DYNAMIC-QC-01 GWC stamp · REC CNS/FE-ADMIN HOLDs · recruitment_uat_ready false until REC module wave · honesty false until QC closes JD PROGRAM scope (not L3 slice alone)
scope_allowed: QA browser matrix per UF · QC program gate on JD dynamic DONE scope · THEN pm may set jd_dynamic_done=true with QC sign-off on program scope only
scope_FORBIDDEN: flip from L3 QC-01 alone · reopen REC CNS · reopen FE HOLD · seed · bundle recruitment flip · claim REC module UAT from JD wave · invent Nest dual
exit: R-PLT-JD-DYNAMIC-DONE-01 may CLOSE or narrow; requires QC GO on program scope — not L3 slice alone
```

### 6.3 Architecture boundary (text diagram)

```text
  JD dynamic L3 QC-01 GWC (J01..03 + G4)           --> LIVE bounded slice · jd_dynamic_done false RETAIN
  Platform catalog dynamic (field/pack/template)   --> LIVE · ≠ program DONE
  REC stage L1/CNS · UX P0 · IV · plan console     --> LIVE C-SLICE · ≠ jd_dynamic_done true
  YCTD↔JD ref chain (paper/API)                    --> trace LIVE · depth OPEN
  REC module UAT (R-PLT-REC-UAT-01)                --> recruitment_uat_ready false RETAIN
  remaster_program_done / face_live                --> false RETAIN (QC-01)
  jd_dynamic_done                                  --> false RETAIN (R-PLT-JD-DYNAMIC-DONE-01)
  C-SLICE-≠-MODULE                                 --> RETAIN
```

---

## 7. Implementation and validation plan (ADR §7)

| Step | Owner | Action |
|------|-------|--------|
| 1 | pm | Seal board row **CONFIRMED** · append **`R-PLT-JD-DYNAMIC-DONE-01`** HOLD P2 |
| 2 | pm | **Do not** set **`jd_dynamic_done=true`** · **Do not** dispatch JD program closure unlock from this seat alone |
| 3 | ba-process | **Optional** ADD companion row **`jd_dynamic_done`** to reopen-gate inventory (BA-03 extension or companion table) — **no** flip flags |
| 4 | qc | Any future `jd_dynamic_done` promote requires **JD program** UF evidence — not L3 QC-01 alone |
| Rollback | sa | If flag flipped wrongly — CORRECTION bus · restore false · cite this SPEC |
| Validation | qa | Program wave must be U65 browser UF matrix when sponsor opens |
| Success | pm | SPEC_LEN ≥8192 NFD · PASS_TO_PM · honesty unchanged |

---

## 8. Locks (L-JD-DYN-*)

| Lock | Rule |
|------|------|
| **L-JD-DYN-01 HOLD ≠ WAIVE** | ACCEPT_AS_IS_P2 does not delete L3 QC ACs · deferred **program** closure only |
| **L-JD-DYN-02 L3 LIVE** | QC-01 GWC **RETAIN** — HOLD does not negate slice evidence |
| **L-JD-DYN-03 Flag false** | **DENY** PM/dev flip without sponsor program wave + QC |
| **L-JD-DYN-04 Catalog dynamic ≠ DONE** | Platform dynamic CFG LIVE **≠** `jd_dynamic_done` |
| **L-JD-DYN-05 REC orthogonality** | **DENY** reopen REC CNS/FE-ADMIN · **DENY** bundle `recruitment_uat_ready` flip |
| **L-JD-DYN-06 YCTD depth** | Paper/API trace **≠** flip without YCTD UF wave |
| **L-JD-DYN-07 remaster/face** | **RETAIN false** per QC-01 |
| **L-JD-DYN-08 Honesty pack** | Companion row in synth §10 **RETAIN** |
| **L-JD-DYN-09 C-SLICE** | REC UX/IV/plan console GWC **≠** program DONE |
| **L-JD-DYN-10 Path lock** | UTF-8 no BOM NFD write gate |

---

## 9. F.1 physical notes (API_DESIGN alignment — read-only)

| Function / area | Mục đích (VI) | Slice status today | Honesty impact |
|-----------------|---------------|--------------------|----------------|
| **F-JD-CFG-FIELD-*** | Cấu hình trường JD Settings | **LIVE** L3 J01 | **≠** jd_dynamic_done true |
| **F-JD-CFG-RULES-PUT** | Lưu rules snapshot | **LIVE** L3 J01 | **≠** program DONE |
| **F-JD-PACK-RESOLVE** | Resolve pack theo job_family | **LIVE** L3 J02 | **≠** flag true |
| **F-JD-TEMPLATE-POST** | Tạo job-template + snapshot groups | **LIVE** L3 J02 | **≠** program DONE |
| **F-JD-WAVE-VIEW** | Xem hierarchy từ wave | **LIVE** scoped J03 | YCTD attach **deferred** |
| **F-JD-G4-CONFIRM** | Xác nhận đổi pack giữ title | **LIVE** G4 | **≠** program closure |
| **YCTD↔JD attach** | Gắn YCTD vào JD | **Not closed** in QC-01 | **Supports flag false** |
| **REC-03 / UV / compare** | Tin đăng · so sánh UV | **OUT / gap** class | **Supports flag false** |
| **Platform REC catalog** | Stage pipeline dynamic | **LIVE REC slice** | **Orthogonal** |

No new API_DESIGN rows required this seat — **disposition + companion honesty governance only**.

### 9.1 F.1 disposition summary

| Layer | This seat |
|-------|-----------|
| **DB** | **No** schema change · honesty flag is **program/registry** |
| **API** | **RETAIN** L3-proven endpoints as C-SLICE evidence only |
| **FE** | **RETAIN** writer/settings paths · **no** honesty JSON patch from SA |
| **Program** | **`jd_dynamic_done=false`** intentional until sponsor JD DONE wave |

---

## 10. Evidence index (RETAIN — grep-backed)

| Evidence path | Stamp / verdict | Honesty line |
|---------------|-----------------|--------------|
| `docs/qa/evidence/po-hrm-jd-dynamic-qc-01.md` | **GWC** PO-HRM-JD-DYNAMIC-QC-01 | **jd_dynamic_done=false** must_keep |
| `docs/qa/evidence/po-hrm-jd-dynamic-qa-03.md` | PASS J01..03+G4 | false · not claimed |
| `docs/qa/evidence/_tmp-po-hrm-jd-dynamic-qa-03.FINAL.json` | verdict PASS | jd_dynamic_done_claimed=false |
| `docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md` | FR spine | program scope reference |
| `docs/program/specs/PO-HRM-JD-DYNAMIC-ARCH-02.md` | Option B Nest SoT | **RETAIN** · no dual invent |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-UAT-HOLD-SA-01.md` | **R-PLT-REC-UAT-01** | jd_dynamic companion false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-HONESTY-PACK-SYNTH-SA-01.md` | §10 companion | jd_dynamic_done=false |
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-BA-03.md` | ADD #17–21 | module flags false |
| `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` | JD-DYNAMIC-DONE row | board SoT |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md` | REC L1 GWC | **≠** jd_dynamic_done (catalog dynamic REC) |

---

## 11. Trace to program board (W8)

| Board row | Status | Action |
|-----------|--------|--------|
| PO-HRM-JD-DYNAMIC-QC-01 | GWC SEALED | **RETAIN** · **DENY** reinterpret as jd_dynamic_done true |
| REC-UAT-HOLD-SA-01 | SEALED | peer RETAIN |
| HONESTY-PACK-SYNTH-SA-01 | CONFIRMED | companion row RETAIN |
| FE-ADMIN-REOPEN-GATE-BA-03 | SEALED | **RETAIN** #17–21 |
| **JD-DYNAMIC-DONE-HOLD-SA-01** | **this seat** | Option A LOCK · mint **`R-PLT-JD-DYNAMIC-DONE-01`** |

---

## 12. Discrimination matrix (PM / QC)

| Evidence | Flip `jd_dynamic_done`? | Why |
|----------|-------------------------|-----|
| **PO-HRM-JD-DYNAMIC-QC-01** GWC | **NO** | QC denied · bounded L3 |
| Platform catalog dynamic LIVE | **NO** | **L-JD-DYN-04** |
| REC UX P0 / IV / plan console GWC | **NO** | C-SLICE |
| YCTD↔JD paper/API trace | **NO** | Depth open |
| Sponsor JD DONE wave + QC GO program scope | **YES** (future) | §6.2 only |

---

## 13. RETAIN stamps (JD · REC · honesty)

| Stamp / residual | Action |
|------------------|--------|
| **PO-HRM-JD-DYNAMIC-QC-01** GWC | **SEAL RETAIN** |
| **PO-HRM-JD-DYNAMIC-QA-03** PASS | **SEAL RETAIN** |
| OBS-IT-POSITION-CONFIG · OBS-DRIVER-UI-PREVIEW | **GWC conditions RETAIN** |
| **`R-PLT-REC-UAT-01`** · **`recruitment_uat_ready=false`** | **HOLD RETAIN** |
| **`RECCNSQA-MSJ8KFL7`** · **`R-PLT-REC-FE-ADMIN-01`** | **SEAL/HOLD RETAIN** |
| **`R-PLT-JD-DYNAMIC-DONE-01`** | **HOLD mint this seat** |
| **`jd_dynamic_done`** | **false RETAIN** |
| **`remaster_program_done`** · **`face_live`** | **false RETAIN** |
| **`C-SLICE-≠-MODULE`** | **RETAIN** |

---

## 14. Non-goals (explicit)

1. Do not set **`jd_dynamic_done=true`** without sponsor JD program DONE wave.
2. Do not set **`recruitment_uat_ready=true`** from this seat.
3. Do not reopen REC CNS GWC or REC FE-ADMIN HOLD.
4. Do not claim JD/REC module UAT or Phase1 DONE from L3 GWC.
5. Do not conflate REC platform catalog dynamic L1 with JD program closure.
6. Do not bundle flip honesty flags on one bus line.
7. Do not invent Nest dual admin writer.
8. Do not dispatch dev-fe/dev-be for program closure without sponsor UF wave.
9. Do not seed JD matrix (U65).
10. Do not edit `apps/**` in this seat.
11. Do not treat **`jd_dynamic_done=false`** as stale docs — **intentional HOLD**.

---

## 15. Handback packet (mandatory)

| Field | Value |
|-------|--------|
| **completion_report** | Companion honesty **`jd_dynamic_done=false`** formalized as Option **A LOCKED** · mint **`R-PLT-JD-DYNAMIC-DONE-01`** ACCEPT_AS_IS_P2 HOLD · documented **LIVE** L3 QC-01 GWC + platform catalog dynamic vs **forbidden** program DONE flip · **DENY** reopen REC CNS/FE-ADMIN · **RETAIN** peer **`R-PLT-REC-UAT-01`** + honesty pack · intentional HOLD not stale docs · no `apps/**`. |
| **selected_option** | **Option A** — ACCEPT_AS_IS_P2 HOLD |
| **residual** | **`R-PLT-JD-DYNAMIC-DONE-01`** = **HOLD** |
| **SPEC_LEN** | Verified NFD UTF-8 no BOM · gate ≥8192 bytes |
| **next_owner** | **pm** — seal W8 row CONFIRMED · optional **ba-process** companion inventory ADD |
| **next_dispatch_prompt** | See §16 |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

---

## 16. next_dispatch_prompt (copy-ready — U88)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01
from_role: sa
to_role: pm
lane: governance · U88
ack_status: PASS_TO_PM
verdict: Option A LOCKED — jd_dynamic_done companion honesty HOLD (intentional · not stale docs)
action:
  1) Seal board row PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01 = CONFIRMED
     · cite evidence docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01.md
     · mint R-PLT-JD-DYNAMIC-DONE-01 HOLD P2 on W8 board + honesty registry
  2) RETAIN jd_dynamic_done=false · RETAIN PO-HRM-JD-DYNAMIC-QC-01 GWC · RETAIN R-PLT-REC-UAT-01 · C-SLICE
  3) Update PO_HRM_CONTINUOUS_W8_20260807.md + TEAM_WORKING_NOW
  4) U88 optional branch: Task ba-process ADD-only companion row to reopen-gate inventory
     · work_item: PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-ADMIN-REOPEN-GATE-BA-03-COMPANION-01
     · entry: SA PASS JD-DYNAMIC-DONE-HOLD · ADD row jd_dynamic_done + R-PLT-JD-DYNAMIC-DONE-01
       · OR parallel employees_e2e companion HOLD SA if board prefers EMP peer pattern first
     · exit: ADD inventory only · no flip flags · no Nest redefine · PASS_TO_PM
  5) Default if no sponsor JD DONE wave: PM -> ALL idle-ok companion honesty governance slice
  DENY: flip jd_dynamic_done · claim JD/REC module UAT · Phase1 DONE from L3 · reopen REC CNS/FE-ADMIN · apps/**
evidence: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01.md
```

---

## 17. Extended governance notes

**QC-01 explicit denial:** Evidence header lists **NOT claimed** Phase 1 DONE · product UAT DONE · **`jd_dynamic_done`**. Conditions OBS-IT/DRIVER are **soft** — they do **not** justify flag flip. J03 PASS is **scoped** to wave Xem — YCTD «gắn JD» **deferred** per QC residual table.

**Catalog dynamic vs program DONE:** W8 platform wave proved **dynamic catalog** patterns (invent KEY · pack resolve · consumer assert) across ATT/REC/PAY/EMP **and** JD CFG. **None** of those L1/L3 slices closed **`jd_dynamic_done`** — synth honesty pack §10 lists companion **false** by design.

**REC peer symmetry:** REC-UAT-HOLD §1.4 documents **`jd_dynamic_done`** as companion — this seat **owns** formal disposition for that flag so PM does not re-litigate under REC module UAT dispatch.

**BA-03 rows #17–21:** Module **`recruitment_uat_ready`** placeholders — **distinct** from **`jd_dynamic_done`**. Optional ba-process ADD should use **companion class** (like **`employees_e2e_linkage_ready`** on EMP-UAT spec) — **no** wipe of BA-03.

**FE-ADMIN reopen-gate:** Admin polish UF inventory **does not** unlock **`jd_dynamic_done`**. JD program closure requires **§6.2** sponsor wave.

**U65:** HOLD does not authorize seed to green JD program matrix.

**TM/QC block:** NO-GO on release narrative claiming **JD dynamic program DONE** while **`R-PLT-JD-DYNAMIC-DONE-01=HOLD`** and flag false.

**Dev coaching:** Do not patch honesty registry JSON after L3 PASS without PM + QC after sponsor program wave.

**Path lock:** Canonical NFD `Tài liệu` — WriteAllText UTF-8 no BOM gate per mission protocol.

**Vertical continuity U88:** After PM seals this row, governance may continue per continuous board — **idle-ok companion honesty seat ≠ idle JD product program**; full spine remains sponsor-gated with **`jd_dynamic_done=false` RETAIN**.

---

## 18. SA KB append (reference)

| Context | jd_dynamic_done companion after JD L3 QC-01 GWC · U88 after BA-03 SEAL |
| Action | Option A LOCK · mint R-PLT-JD-DYNAMIC-DONE-01 · L3 LIVE vs program DONE taxonomy |
| Outcome | PASS_TO_PM · no apps/** |
| Evidence | This SPEC path |
| Reuse-tag | jd-dynamic-done-honesty-hold, r-plt-jd-dynamic-done-01, l3-gwc-neq-program-done, catalog-dynamic-live, deny-invent-flip, rec-uat-peer-retain, honesty-pack-companion, yctd-deferred-retain, path-lock-nfd |

---

*End of SPEC — PO-HRM-DYNAMIC-CONFIG-PLATFORM-JD-DYNAMIC-DONE-HOLD-SA-01*
