# PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-FE-SA-01 — Option/F.1 · CTR **template** FE residual disposition (after L1 KEY GWC + DOCS)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-FE-SA-01` |
| **Parent** | CTR-TEMPLATE L1 invent KEY **GWC SEALED** stamp **`CTRTPLQA-MSK7U4CG`** · DOCS-01 **ACCEPT** SRS **v0.39** · HDSD **CH06i** · residual *FE consumer/admin deepen after L1* |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for FE residual after L1 + DOCS — **no wipe** prior CTR-TEMPLATE SA/BA/BE/QA/QC · **no seed** · **no reopen** EMP / CTR-CLAUSE FE seals |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** on minted **`R-PLT-CTR-TPL-FE-01`** · ba-process **HOLD** (AC pack already CONFIRMED) · FE/BE **HOLD** (no closable GAP) |
| **residual_id** | **`R-PLT-CTR-TPL-FE-01`** *(minted this seat — FE residual after L1 KEY + DOCS; KEEP HOLD ≠ CLOSED ≠ WAIVED)* |
| **prior_sa** | [`CTR-TEMPLATE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md) Option **B RETAIN** Nest `hrm_contract_templates` open catalog — **RETAIN · do not wipe** |
| **prior_ba** | [`CTR-TEMPLATE-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01.md) **AC-PLT-CTR-TPL-01*** CONFIRMED · FE **HOLD** (admin CRUD LIVE) — **RETAIN** |
| **prior_be** | CTR-TEMPLATE-BE-01 **READY** · invent KEY **`HRM-CTR-TPL-KEY`** LIVE — **RETAIN** |
| **prior_qa_qc** | QA-01 PASS **`CTRTPLQA-MSK7U4CG`** · QC-01 **GWC SEALED L1** · `network_key_hit=true` — **RETAIN** |
| **prior_docs** | DOCS-01 ACCEPT SRS v0.39 CH06i — client wording locked |
| **U88_entry** | CTR-CLAUSE-FE-SA-01 Option **B ACCEPT_AS_IS_P2 HOLD** · `R-PLT-CTR-CL-FE-01` · EMP FE pack **CLOSED** · EMP FE-ADMIN **HOLD RETAIN** · honesty **false LOCKED** |
| **Honesty** | `contracts_printable_ready=false` · `payroll_e2e_ready=false` · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module CTR UAT · Phase1 · seed · flip printable · reopen EMP FE CLOSED · invent EMP FE-ADMIN · invent LVRULE · reopen CTR-CLAUSE FE HOLD as unlock |
| **must_keep** | CTR-CLAUSE FE HOLD · EMP FE CLOSED · EMP FE-ADMIN HOLD · CTRTPL L1 KEY · ATT · LVRULE HOLD · honesty false · prior CTR-TEMPLATE SA Option B · BA AC pack · DOCS CH06i |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** · Option **LOCKED** |

> **HARD EXIT GATE:** this file WriteAllText NFD · Shell **Length ≥ 8KB** verified before CONFIRMED. Empty turn = INVALID.

---

## 1. Decision context (ADR option evaluation)

| | |
|--|--|
| **Decision title** | Disposition for CTR **template catalog FE residual** after L1 invent KEY GWC + DOCS ACCEPT — UNLOCK consumer/admin deepen vs ACCEPT_AS_IS HOLD vs invent/reject |
| **Requestor** | pm · U88 continuous · board row `…-CTR-TEMPLATE-FE-SA-01` · after L1 KEY SEALED · FE residual unlock-vs-HOLD |
| **Decision owner** | sa |
| **Related** | AC-PLT-CTR-TPL-01..07+H · BR-CTR-TPL-DYN-01..07 · BR-PLT-02/03/04/05 · FR-UC-BP-CORE-09d · invent KEY `HRM-CTR-TPL-KEY` · peer CTR-CLAUSE-FE HOLD · peer EMP consumer UNLOCK · peer EMP-FE-ADMIN / LVRULE ACCEPT_AS_IS |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` |

### 1.1 Problem — what residual remains after L1 + DOCS

Prior seats already locked:

| Seat | Verdict | Residual left for *this* seat? |
|------|---------|--------------------------------|
| CTR-TEMPLATE-SA-01 | Option **B RETAIN** Nest open catalog SoT + starter≠ceiling + invent KEY class | Architecture SoT **CLOSED** — **do not wipe / do not redefine** |
| CTR-TEMPLATE-BA-01 | AC-PLT-CTR-TPL-01* CONFIRMED · FE HOLD (admin LIVE) · KEY taxonomy locked | AC wording **CLOSED** — ba-process **HOLD** this seat |
| CTR-TEMPLATE-BE-01 | `HRM-CTR-TPL-KEY` wire READY · 404/NONE/CODE-INVALID taxonomy | BE KEY CNS **CLOSED** at L1 |
| QA-01 / QC-01 | PASS / **GWC SEALED L1** stamp `CTRTPLQA-MSK7U4CG` · `network_key_hit=true` | Invent KEY Network **SEALED** — **cấm reopen** |
| DOCS-01 | SRS v0.39 + HDSD CH06i **ACCEPT** | Client docs **CLOSED** |
| Board FE residual | Named residual: *FE consumer/admin deepen after L1* | **THIS seat** — FE Option/F.1 only |

**Question for F.1:** Is there a **closable FE deepen GAP** (mount / persist / KEY toast) that warrants Option **A UNLOCK** execution, or is the residual **ACCEPT_AS_IS_P2 HOLD** (surfaces LIVE + AC locked + L1 KEY LIVE + no build GAP)?

### 1.2 Code audit (read-only — AS-IS evidence)

#### A. Where templates are **authored** (FE-ADMIN writer)

| Surface | Path / symbol | LIVE? | Role |
|---------|---------------|------:|------|
| Nest SoT table | `public.hrm_contract_templates` · migrations `20260806` / `20260807` library | **YES** | **Open catalog SoT** (SA-01 Option B RETAIN) |
| Nest mutate | `ContractLegalPrintService.createTemplate` / `updateTemplate` / `activate` / soft-retire · `bootstrapXevnMatrixDrafts` | **YES** | Admin CREATE N+1 / mã 9+ · starter upsert ≠ ceiling |
| FE admin form | `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx` — «**Tạo mẫu #9+**» · `createContractTemplate` / `updateContractTemplate` / `activateContractTemplate` · soft warn `missingStarterTemplateCodes` | **YES** | **FE-ADMIN LIVE** (not ABSENT) |
| FE API client | `hrmApi.ts` — `list/create/update/activate` `/api/hrm/contracts-insurance/contract-templates*` | **YES** | Wire to Nest |
| Settings mount | `Settings.tsx` embeds `ContractLegalPrintSettingsPanel` | **YES** | Admin UX over Nest — **≠** Settings MD second SoT |

**FE-ADMIN class verdict:** Settings legal-print templates tab **PRESENT** with open-catalog CREATE #9+, soft-warn starters (không chặn), activate/retire. This is **≠** EMP-FE-ADMIN / LVRULE **ABSENT admin** class. Inventing a second Nest dual admin or moving SoT to Settings Master-Data is **FORBIDDEN** (SA-01 Option A REJECT retained).

#### B. Where templates are **consumed** (picker / bind / preview — not invent)

| Surface | Path / symbol | LIVE? | Role |
|---------|---------------|------:|------|
| Print spine picker | `ContractPrintSpinePanel.tsx` — `listContractTemplates({ status: 'active' })` · Select `ctr-print-template` · options from API rows · echo `template_code` | **YES** | **Consumer open-catalog picker** — CODE-MEMORY: **cấm hardcode 8-only** |
| HĐ form persist | `Contracts.tsx` + `useContracts.ts` — `template_id` / `template_code` on create/update · edit restore `restorePrintSpineFromContract` | **YES** | **Persist LIVE** (XEVN-TPL-FE-01 / FE-EDIT-01 already shipped) |
| Preview / issue body | `contractPrintRequest.ts` + Nest PREV/VER | **YES** | Resolve active catalog · invent → **`HRM-CTR-TPL-KEY`** (L1 LIVE) |
| Helpers | `contractTemplateCatalog.ts` — starter list = **soft-warn / badge only** | **YES** | **≠** picker ceiling |
| Library publish | Nest library publish/pull + lineage | **YES** | Group→member RETAIN — not new SoT |

**Consumer class verdict:** Consumer surfaces **LIVE** and already bind Nest open catalog (any active code including mã 9+). **No** closed-8 hardcode Select to rebind (peer ATT-CODE / EMP-STATUS hardcode class **does not apply**). Persist + F5 edit restore already FIXED in prior XEVN-TPL FE seats — **not** a new closable gap for this residual.

#### C. Settings catalog vs Nest

| Layer | Template SoT? | Evidence |
|-------|---------------|----------|
| Nest `hrm_contract_templates` | **OWN / RETAIN** | SA-01 Option B LOCKED |
| Settings Master-Data / XBOS catalog | **REF only** (labels/merge) — **≠** template SoT | SA-01 Option A REJECT as sole SoT |
| FE Settings panel (legal-print) | **Admin UX** over Nest APIs — not a second store | Panel calls Nest endpoints |
| Settings departments / job_titles | **Orthogonal** EMP consumer SoT | **OUT** this seat — DENY reopen EMP |

#### D. Invent KEY inventory (template seat)

| Code / KEY | Status | Notes |
|------------|--------|-------|
| **`HRM-CTR-TPL-KEY`** | **L1 LIVE SEALED** | preview/issue invent code/id when EFF>0 → **400** · stamp `CTRTPLQA-MSK7U4CG` · `network_key_hit=true` |
| `HRM-CTR-TPL-404` | **RETAIN LIVE** | GET miss ≠ KEY |
| `HRM-CTR-TPL-CODE-INVALID` | **RETAIN LIVE** | format/slug only ≠ KEY · ≠ «not in starter 8» |
| `HRM-CTR-TPL-NONE` | **RETAIN** · QC **P3 NOTE_BLOCKED** `R-PLT-CTR-TPL-NONE-LIVE` | empty catalog print paths · U65 no wipe |
| `HRM-CTR-TPL-PACK-MISMATCH` | **RETAIN LIVE** | pack gate |
| Admin CREATE N+1 | **≠ invent** | 201 `HRM-CTR-TPL-201` RETAIN — L-CTR-TPL-02 |

**KEY toast FE:** Consumer path is **Select-from-API** (no free-text invent field on happy path). Invent KEY is enforced on Nest PREV/VER when bypass / malformed payload. Dedicated VI toast map for KEY beyond generic API error surface = **P3 OBS** (peer OT/COMP «Select-only invent OBS» ACCEPT class) — **not** a closable mount/persist Condition like EMP form-gate omit. **Do not** invent FE-ADMIN or reopen L1 to “add toast only”.

#### E. Closable GAP checklist (A-precondition)

| Precondition for Option A UNLOCK | Met? | Evidence |
|----------------------------------|------|----------|
| Consumer picker LIVE (mount) | **YES** | `ContractPrintSpinePanel` Select from Nest active list |
| Persist LIVE (create/update + F5 edit restore) | **YES** | `Contracts.tsx` / `useContracts` / `contractPrintEditRestore` |
| FE-ADMIN surface LIVE | **YES** | Settings «Tạo mẫu #9+» |
| AC locked | **YES** | BA-01 AC-PLT-CTR-TPL-01* CONFIRMED |
| Invent KEY Network LIVE | **YES** | QC GWC L1 `CTRTPLQA-MSK7U4CG` |
| **Closable deepen GAP** (form-gate omit / hardcode closed-8 Select / missing persist / missing KEY wire) | **NO** | Audit: open catalog already; persist already; KEY already Network LIVE; BA FE HOLD |
| BE schema / route missing | **NO** | Templates CRUD + KEY CNS LIVE |

**Heuristic application (mission §4):** Prefer **A only if** closable gap (mount/persist/KEY toast). Closable gap = **false** → **Option B**. Prefer **B if LIVE complete** → **YES**.

### 1.3 Discrimination — FE-ADMIN vs consumer (mandatory)

| Class | Peer pattern | CTR-TEMPLATE seat |
|-------|--------------|-------------------|
| **Consumer EFF / picker deepen UNLOCK** | EMP-STATUS/POSITION/DEPT / ATT-CODE FE-SA Option A → CLOSED | **OUT** — consumer already Nest open-catalog Select + persist; **no** hardcode-8 / form-gate omit; **FORBIDDEN** invent “consumer deepen” wave without gap |
| **FE-ADMIN ABSENT → ACCEPT_AS_IS HOLD** | EMP-FE-ADMIN-NOTES / LVRULE 01g | **OUT as primary class** — template **FE-ADMIN is LIVE** (Settings panel), not ABSENT |
| **Surfaces LIVE + AC locked + L1 KEY LIVE + no build GAP → ACCEPT_AS_IS HOLD** | Peer **CTR-CLAUSE-FE-SA-01** Option B | **THIS residual** — mint `R-PLT-CTR-TPL-FE-01` **P2 HOLD**; optional future QA U65 AC browser = **sponsor/PM gated**, not mandatory unlock |
| **Invent Nest dual / reopen EMP / reopen CTR-CLAUSE FE as unlock / flip printable** | Option C reject class | **REJECT** |

**Do not confuse:**
- EMP consumer UNLOCK was correct because Settings EFF picker LIVE but form-gate omitted field / Select hardcode — **closable**.
- CTR template has **no** equivalent omit/hardcode/persist gap; prior XEVN-TPL FE already delivered open catalog + edit restore.
- CTR-CLAUSE FE HOLD = same **ACCEPT_AS_IS** class (LIVE admin+consumer, no GAP) — **RETAIN**; **cấm** reopen clause FE HOLD *as* template unlock pretext.

### 1.4 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** wipe / redefine CTR-TEMPLATE-SA-01 Option B RETAIN · BA AC pack · L1 KEY seal
- **DENY** reopen EMP-POSITION / STATUS / DEPT FE **CLOSED**
- **DENY** invent EMP FE-ADMIN unlock (`R-PLT-EMP-FE-ADMIN-01` HOLD sealed)
- **DENY** invent LVRULE 01g unlock
- **DENY** reopen CTR-CLAUSE FE `R-PLT-CTR-CL-FE-01` HOLD as unlock
- **DENY** flip `contracts_printable_ready` / personnel / payroll · module CTR UAT · Phase1 · UF 🟢 whole CTR
- **DENY** Settings/XBOS as second template SoT · mega template-EAV · closed-8 restore · reopen invent KEY L1
- **OUT:** DnD reorder (AC-PLT-CTR-03) · DOCX GĐ2 · NONE P3 wipe UF
- must_keep stamps listed in header

### 1.5 Decision heuristic (program rule — applied)

| Rule | Application this seat |
|------|------------------------|
| Prefer A UNLOCK if consumer/admin LIVE + AC locked + **closable gap** (mount/persist/KEY toast) | Gap **absent** → **A REJECT default** |
| Prefer B ACCEPT_AS_IS when residual is P2 HOLD / LIVE complete / no build GAP | **B LOCK** |
| REJECT invent Nest dual / reopen EMP / CTR-CLAUSE FE / flip printable | **C REJECT** |
| Discriminate FE-ADMIN vs consumer | Admin LIVE ≠ invent admin; consumer LIVE ≠ invent deepen |
| Peer CTR-CLAUSE-FE Option B | **Cite class-same** — ACCEPT_AS_IS when no closable deepen |

---

## 2. Options

### Option A — UNLOCK FE consumer/admin deepen

| | |
|--|--|
| **Description** | Dispatch `dev-fe` to “deepen” template FE: rebind consumer picker, invent admin panel, wire KEY toast-only, or patch form-gate — treating residual as closable Condition like EMP-DEPT/POSITION/STATUS / ATT-CODE FE. |
| **Benefits** | Would close a real wiring gap **if one existed** (e.g. hardcode-8 Select, missing persist, KEY Network absent). |
| **Costs** | Invents execution without BA/GAP evidence; risks churn on LIVE print-spine + Settings panel + L1 KEY seal; confuses with EMP consumer UNLOCK class; billing/wave noise. |
| **Risks** | Over-scope · reopen sealed peers by accident · claim printable/module CTR ready · **REJECT as default** because **closable gap = NO** (BA FE HOLD + code audit + L1 KEY LIVE). |
| **When revisit** | Only if future **QA U65** proves a **named** wiring defect (e.g. picker hardcode-8 regression, edit restore regress, KEY toast missing on a free-text path that product exposes) with `spec_ref` AC-PLT-CTR-TPL-* — then narrow FIX seat, **not** this Option A unlock-as-default. |

### Option B — ACCEPT_AS_IS_P2 HOLD on `R-PLT-CTR-TPL-FE-01` — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | **Mint** Condition **`R-PLT-CTR-TPL-FE-01`** = P2 FE residual after L1 KEY + DOCS. **KEEP HOLD** (≠ CLOSED ≠ WAIVED). **RETAIN** Nest open catalog SoT + FE-ADMIN LIVE «Tạo mẫu #9+» + consumer open-catalog picker + persist/edit restore + invent KEY Network LIVE + BA AC pack + DOCS CH06i. **Do not** dispatch `dev-fe`/`dev-be` from this seat. Optional browser QA against AC-PLT-CTR-TPL-01..07 remains **PM-gated** (honesty false · `C-SLICE` · J-HRM-CTR-* not auto-promoted). BE boundary: **HOLD** — L1 KEY sealed; optional CRUD assert wire remains P2 observe from QC (not this unlock). |
| **Benefits** | Matches BA FE HOLD + QC «DENY invent FE»; preserves seals; honesty; clears board unlock-vs-HOLD without inventing work; peer-consistent with CTR-CLAUSE-FE ACCEPT_AS_IS. |
| **Costs** | Full U65 browser AC matrix not executed this seat — residual stays **HOLD NOTE** until PM opens optional QA (or forever P2 if no sponsor ask). KEY-specific VI toast polish remains OBS P3. |
| **Risks** | Misread HOLD as “admin ABSENT invent panel” (wrong — admin LIVE) or as “consumer UNLOCK pending” (wrong — no gap) → mitigated by §1.3 discrimination table. |

### Option C — REJECT invent Nest dual / reopen EMP·CTR-CLAUSE seals / flip printable

| | |
|--|--|
| **Description** | Move template SoT to Settings MD dual writers; invent Nest second template admin; reopen EMP FE CLOSED; invent EMP FE-ADMIN; invent LVRULE; reopen CTR-CLAUSE FE HOLD as unlock; flip `contracts_printable_ready`; restore closed-8; mega template-EAV; reopen L1 KEY taxonomy. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Seal churn · dual writers · legal-print regression · personnel/CTR false ready. |
| **Risks** | **REJECT** — explicit DENY list in §1.4. |

---

## 3. Trade-off matrix

| Criteria | Weight | A UNLOCK deepen | **B ACCEPT_AS_IS HOLD** | C Invent / reopen / flip |
|----------|-------:|----------------:|------------------------:|-------------------------:|
| Business value (AC locked · surfaces LIVE · KEY LIVE) | 5 | 2 | **5** | 0 |
| Honesty / seal safety (EMP CLOSED · CTR-CLAUSE FE HOLD · printable false · L1 KEY) | 5 | 2 | **5** | 0 |
| Closable-gap fidelity (no invent work) | 5 | 0 | **5** | 0 |
| Time / wave cost | 4 | 1 | **5** | 0 |
| Maintainability (RETAIN LIVE spine + Settings CRUD) | 4 | 2 | **5** | 1 |
| Confusion risk FE-ADMIN vs consumer | 4 | 1 | **5** | 0 |
| **Weighted** | | 34 | **120** | 4 |

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Unlock without gap → churn LIVE panel / spine / L1 KEY | Diff invents wire without BA GAP | **Reject A**; only reopen on QA-named defect |
| B | HOLD misread as ABSENT-admin invent | Board invents Nest dual admin | Cite §1.3 — admin LIVE; HOLD = no deepen |
| B | HOLD misread as deferred consumer UNLOCK | PM dispatches EMP-style FE deepen | Cite audit — open catalog Select LIVE; persist LIVE; KEY LIVE |
| B | HOLD misread as reopen CTR-CLAUSE FE | Board flips clause FE HOLD → unlock | Cite must_keep — clause FE HOLD **RETAIN**; orthogonal residual |
| C | Flip printable / reopen EMP / invent LVRULE | Honesty flags / matrix | DENY · must_keep stamps |
| Any | Wipe SA-01 Option B / reopen L1 KEY | Spec rewrite / retest KEY | **FORBIDDEN** — RETAIN prior SA/BA/BE/QA/QC/DOCS |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option B** — **ACCEPT_AS_IS_P2 HOLD** |
| **Seat verdict** | **CONFIRMED** · Option **LOCKED** |
| **Why B** | Template FE-ADMIN + consumer are **already LIVE** on Nest open catalog; invent **`HRM-CTR-TPL-KEY`** is **L1 Network LIVE**; AC pack + DOCS locked; **no closable mount/persist/KEY-wire gap**. Prefer A only with closable gap — **absent**. Matches peer CTR-CLAUSE-FE Option B class. |
| **Rejected** | **A** UNLOCK deepen (no GAP) · **C** invent Nest dual / reopen EMP·CTR-CLAUSE / flip printable / invent LVRULE |
| **Assumptions** | Prior XEVN-TPL FE open-catalog + edit restore remain in tree; L1 KEY seal remains authoritative; UF-HRM-02 nullable template must_keep; NONE P3 stays NOTE_BLOCKED. |

### 5.1 Condition mint

| Field | Value |
|-------|--------|
| **residual_id** | **`R-PLT-CTR-TPL-FE-01`** |
| **Class** | FE residual after L1 KEY + DOCS |
| **Disposition** | **ACCEPT_AS_IS_P2 HOLD** |
| **≠** | CLOSED · WAIVED · UNLOCK |
| **Owner after seal** | pm (board Condition KEEP HOLD) |
| **Unlock trigger** | Sponsor/PM opens FE wave **only** after QA-named closable gap with `spec_ref` AC-PLT-CTR-TPL-* |

### 5.2 Layer map (RETAIN)

| Layer | Artifact | This seat |
|-------|----------|-----------|
| Template catalog SoT | Nest `hrm_contract_templates` | **RETAIN** (SA-01 B) |
| FE-ADMIN | `ContractLegalPrintSettingsPanel` «Tạo mẫu #9+» | **LIVE RETAIN** — no invent · no unlock |
| Consumer picker | `ContractPrintSpinePanel` Nest active Select | **LIVE RETAIN** — open catalog · no hardcode-8 rebind |
| Persist / restore | `Contracts.tsx` · `useContracts` · edit restore | **LIVE RETAIN** |
| Invent KEY | `HRM-CTR-TPL-KEY` Network L1 | **SEALED RETAIN** — cấm reopen |
| Freeze | `print_versions.template_code` + layout/clause snapshot | **must_keep** |
| Settings MD / XBOS | — | **≠** template SoT |
| AC / DOCS | BA-01 · SRS v0.39 · CH06i | **RETAIN** |
| Peer CTR-CLAUSE FE | `R-PLT-CTR-CL-FE-01` | **HOLD RETAIN** |
| Residual | `R-PLT-CTR-TPL-FE-01` | **HOLD P2** |

### 5.3 Gates after this seat

| Question | Answer |
|----------|--------|
| Unlock ba-process? | **NO** — AC pack already CONFIRMED |
| Unlock ba-data? | **NO** — HOLD (table LIVE) |
| Unlock BE? | **NO** — L1 KEY SEALED · optional CRUD assert = P2 observe only |
| Unlock FE? | **NO** — HOLD · Option B · **next_owner = pm** (not dev-fe) |
| Optional QA U65 AC slice? | **PM-gated only** — not auto-dispatch from this seat |
| Flip `contracts_printable_ready`? | **FORBIDDEN** |
| Reopen EMP FE CLOSED / FE-ADMIN HOLD / LVRULE / CTR-CLAUSE FE HOLD? | **FORBIDDEN** |
| Reopen L1 invent KEY? | **FORBIDDEN** |

---

## 6. Locks (L-CTR-TPL-FE-*)

| Lock | Rule |
|------|------|
| **L-CTR-TPL-FE-01** | Option **B** LOCKED — `R-PLT-CTR-TPL-FE-01` **ACCEPT_AS_IS_P2 HOLD** |
| **L-CTR-TPL-FE-02** | Nest open catalog SoT RETAIN — **cấm** Settings/XBOS sole SoT dual |
| **L-CTR-TPL-FE-03** | FE-ADMIN panel LIVE RETAIN — **cấm** invent second admin / Nest dual |
| **L-CTR-TPL-FE-04** | Consumer open-catalog picker + persist LIVE — **cấm** invent hardcode-rebind “deepen” without QA-named gap |
| **L-CTR-TPL-FE-05** | Invent KEY **`HRM-CTR-TPL-KEY`** L1 Network **SEALED RETAIN** — **cấm** reopen taxonomy / alias wipe |
| **L-CTR-TPL-FE-06** | Admin CREATE N+1 ≠ consumer invent (**L-CTR-TPL-02** RETAIN) |
| **L-CTR-TPL-FE-07** | Starter-8 ≠ ceiling (**AC-PLT-CTR-TPL-02**) RETAIN |
| **L-CTR-TPL-FE-08** | Issued `template_code` freeze **must_keep** (**AC-PLT-CTR-TPL-03**) |
| **L-CTR-TPL-FE-09** | EMP FE CLOSED pack · EMP FE-ADMIN HOLD · LVRULE HOLD · ATT seals · CTR-CLAUSE FE HOLD **RETAIN** |
| **L-CTR-TPL-FE-10** | `contracts_printable_ready=false` · personnel/payroll false · `C-SLICE-≠-MODULE` · U65 |
| **L-CTR-TPL-FE-11** | Prior CTR-TEMPLATE SA/BA/BE/QA/QC/DOCS **RETAIN — do not wipe** |
| **L-CTR-TPL-FE-12** | DnD / DOCX **OUT** (cite AC-PLT-CTR-03 / GĐ2) · NONE P3 **NOTE_BLOCKED** RETAIN |

---

## 7. Architecture diagram logic (text)

```
HCNS admin FE (LIVE Settings · «Tạo mẫu #9+»)
    │  CREATE / update / activate / soft-retire
    │  soft-warn missing starters (≠ block)
    ▼
Nest hrm_contract_templates  ←── OPEN CATALOG SoT (SA-01 Option B RETAIN)
    │  starter bootstrap XEVN_* optional ≠ ceiling
    │
    ├─ Consumer picker (LIVE)
    │     ContractPrintSpinePanel Select ← listContractTemplates(active)
    │     Contracts form persist template_id + template_code · F5 edit restore
    │
    ├─ Preview / issue (LIVE)
    │     resolve active row
    │     invent code/id when EFF>0 ──► 400 HRM-CTR-TPL-KEY  (L1 SEALED)
    │     GET miss ──► 404 HRM-CTR-TPL-404 ≠ KEY
    │     bad format ──► CODE-INVALID ≠ KEY
    │
    └─ Issue freeze template_code + layout/clause snapshot (must_keep)

THIS SEAT residual
    R-PLT-CTR-TPL-FE-01 = P2 HOLD (ACCEPT_AS_IS)
        └─ NO unlock FE/BE (no closable GAP mount/persist/KEY)
        └─ optional QA AC slice = PM-gated only
        └─ peer R-PLT-CTR-CL-FE-01 HOLD RETAIN (orthogonal)
```

---

## 8. Impacted systems · dependencies · non-goals

| System | Impact |
|--------|--------|
| hrm-api contracts-insurance legal-print | **None** this seat (docs-only · HOLD · L1 KEY RETAIN) |
| web HRM Settings legal-print panel | **None** — LIVE RETAIN |
| web ContractPrintSpinePanel / Contracts.tsx | **None** — LIVE RETAIN open catalog |
| EMP / ATT / LVRULE / SI / PAY | **None** — seals RETAIN · DENY reopen |
| CTR-CLAUSE FE residual | **None** — HOLD RETAIN · DENY reopen-as-unlock |
| Client SRS/HDSD | **RETAIN** DOCS ACCEPT CH06i — no rewrite |

**Non-goals:** module CTR UAT · printable ready · invent FE deepen · Nest dual · EMP FE-ADMIN invent · LVRULE invent · reopen CTR-CLAUSE FE · DnD · DOCX · seed · apps/** · reopen L1 KEY.

---

## 9. Rollout / checkpoint plan

| Step | Owner | Exit |
|------|-------|------|
| 1. Seal this Option B on bus + board | pm | `R-PLT-CTR-TPL-FE-01` HOLD stamped · Option LOCKED |
| 2. U88 next vertical / residual governance | pm → sa/ba | **not** invent CTR template FE unlock · **not** invent LVRULE · **not** reopen EMP |
| 3. (Optional) QA U65 AC-PLT-CTR-TPL-01..07 | pm-gated qa | Evidence browser · honesty false · J-* not auto-promoted · L1 KEY RETAIN |
| 4. If QA finds **named** wiring gap | pm → narrow FIX | New work_item — **not** reopen this Option as A-default |

**Rollback:** N/A docs-only; if mis-dispatch A occurs → CORRECTION + stop FE invent.

---

## 10. Validation · acceptance evidence plan

| Check | Expected |
|-------|----------|
| Spec Length ≥ 8KB NFD | Shell `(Get-Item -LiteralPath).Length` PASS |
| Option LOCKED = B | Header + §5 |
| Condition minted | `R-PLT-CTR-TPL-FE-01` HOLD |
| Prior SA/BA/BE/QA/QC/DOCS | RETAIN citations · L1 KEY stamp `CTRTPLQA-MSK7U4CG` |
| Discrimination table | FE-ADMIN LIVE ≠ ABSENT; consumer LIVE ≠ unlock |
| DENY list | EMP CLOSED · FE-ADMIN HOLD · LVRULE · CTR-CLAUSE FE HOLD · printable · Nest dual · reopen L1 KEY |
| next_owner | **pm** (not dev-fe) — Option B |
| ack | **PASS_TO_PM** |

---

## 11. Honesty

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| Module CTR UAT / Phase1 | **DENIED** |
| `C-SLICE-≠-MODULE` | **RETAIN** |
| EMP FE CLOSED pack | **RETAIN** |
| EMP FE-ADMIN HOLD | **RETAIN** (`R-PLT-EMP-FE-ADMIN-01`) |
| LVRULE HOLD | **RETAIN** |
| CTR-CLAUSE FE HOLD | **RETAIN** (`R-PLT-CTR-CL-FE-01`) |
| CTRTPL L1 KEY | **RETAIN SEALED** (`CTRTPLQA-MSK7U4CG`) |
| CTR DOCS CH06i / SRS v0.39 | **RETAIN ACCEPT** |
| ATT seals | **RETAIN** |
| This seat | Docs-only Option/F.1 · **no** `apps/**` |

---

## 12. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-FE-SA-01.md` *(this file)* |
| **next_owner** | **pm** |
| **completion_report** | See §13 |
| **next_dispatch_prompt** | See §14 |

---

## 13. completion_report

**Closed:** Docs-only SA Option/F.1 for `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-FE-SA-01`. Read-only audit confirms: Nest `hrm_contract_templates` open catalog SoT LIVE; FE-ADMIN `ContractLegalPrintSettingsPanel` «Tạo mẫu #9+» + soft-warn starters LIVE; consumer `ContractPrintSpinePanel` Nest active Select LIVE (cấm hardcode-8); HĐ persist `template_code` + F5 edit restore LIVE; invent **`HRM-CTR-TPL-KEY`** Network L1 **SEALED** (`CTRTPLQA-MSK7U4CG`); Settings/XBOS ≠ template SoT; KEY toast polish = P3 OBS on Select-only path — **not** closable mount/persist Condition. Prior CTR-TEMPLATE SA Option B RETAIN + BA AC-PLT-CTR-TPL-01* + BE-01 KEY + QA/QC L1 GWC + DOCS SRS v0.39 CH06i **RETAIN (not wiped)**. **Minted `R-PLT-CTR-TPL-FE-01`**. **Option B LOCKED — ACCEPT_AS_IS_P2 HOLD** (≠ CLOSED ≠ WAIVED). Rejected Option A UNLOCK (no closable gap despite LIVE+AC+KEY). Rejected Option C invent Nest dual / reopen EMP CLOSED / invent EMP FE-ADMIN / invent LVRULE / reopen CTR-CLAUSE FE HOLD as unlock / flip printable / reopen L1 KEY. Discriminated FE-ADMIN LIVE ≠ ABSENT HOLD class; consumer LIVE ≠ EMP-style deepen UNLOCK. Peer CTR-CLAUSE-FE Option B **cite class-same**. BE/FE unlock **HOLD**. Honesty flags false · `C-SLICE` · U65 · no `apps/**`.

**Residual:** Board Condition `R-PLT-CTR-TPL-FE-01` **KEEP HOLD**; optional PM-gated QA U65 AC slice only; NONE P3 NOTE_BLOCKED RETAIN; U88 next vertical per continuous board — **not** CTR template FE unlock.

---

## 14. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-FE-SA-01-SEAL
from_role: pm
to_role: pm (self-seal) → then U88 next governance vertical (sa/ba) OR optional qa
lane: governance
priority: P2
program: PO-HRM-CONTINUOUS-W8-20260807

## Intake
CTR-TEMPLATE-FE-SA-01 CONFIRMED Option B LOCKED — ACCEPT_AS_IS_P2 HOLD on R-PLT-CTR-TPL-FE-01
Prior RETAIN: CTR-TEMPLATE-SA-01 Option B · BA AC-PLT-CTR-TPL-01* · BE KEY · QA/QC L1 CTRTPLQA-MSK7U4CG · DOCS SRS v0.39 CH06i
Peer RETAIN: CTR-CLAUSE-FE R-PLT-CTR-CL-FE-01 HOLD · EMP FE CLOSED · EMP FE-ADMIN HOLD · LVRULE HOLD · ATT · honesty false

## Actions
1. Seal bus + board: R-PLT-CTR-TPL-FE-01 = HOLD (≠ CLOSED ≠ WAIVED); FE/BE unlock REJECTED; next_owner was pm (not dev-fe).
2. DENY dispatch dev-fe / dev-be for CTR template consumer/admin deepen from this residual.
3. Continue U88 continuous pipeline: next sa/ba vertical from board (not invent CTR FE unlock; not invent LVRULE; not reopen EMP seals; not reopen CTR-CLAUSE FE HOLD as unlock).
4. Optional only if sponsor asks U65 AC browser: Task qa AC-PLT-CTR-TPL-01..07 — honesty false · C-SLICE · L1 KEY RETAIN · no printable flip · no seed.

## DENY
apps/** · seed · flip contracts_printable_ready · reopen EMP-POSITION/STATUS/DEPT FE CLOSED · invent EMP FE-ADMIN · invent LVRULE · reopen CTR-CLAUSE FE HOLD · Nest dual template SoT · reopen L1 KEY · module CTR UAT

## Evidence
docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-FE-SA-01.md
```

---

## 15. Spec_read_ack (governance)

| Artifact | Citation |
|----------|----------|
| prior SA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md` Option B RETAIN Nest open catalog |
| prior BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01.md` AC-PLT-CTR-TPL-01* · FE HOLD |
| prior BE/QA/QC | evidence `…-ctr-template-be-01.md` · `…-qa-01.md` stamp `CTRTPLQA-MSK7U4CG` · `…-qc-01.md` GWC L1 KEY |
| prior DOCS | evidence `…-ctr-template-docs-01.md` ACCEPT SRS v0.39 CH06i |
| peer HOLD same class | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-SA-01.md` Option B · `R-PLT-CTR-CL-FE-01` |
| peer HOLD admin-absent class | `EMP-FE-ADMIN-NOTES-SA-01` · `ATT-LVRULE-FE-01G-SA-01` (cite class-diff: admin LIVE here) |
| peer UNLOCK | EMP-STATUS/POSITION/DEPT / ATT-CODE FE-SA Option A (cite class-diff: closable gap there — **absent** here) |
| code | `ContractLegalPrintSettingsPanel.tsx` · `ContractPrintSpinePanel.tsx` · `Contracts.tsx` · `useContracts.ts` · `contractTemplateCatalog.ts` · `contract-legal-print.service.ts` KEY CNS · `contract-legal-print.constants.ts` `HRM_CTR_TPL_KEY` |
| ADR template | `.cursor/templates/ADR_OPTION_TEMPLATE.md` |
| must_keep | CTR-CLAUSE FE HOLD · EMP FE CLOSED · EMP FE-ADMIN HOLD · CTRTPL L1 KEY · ATT · LVRULE HOLD · honesty false |

---

## 16. QA-named reopen criteria (narrow FIX only — not Option A-default)

Unlock/revisit as **narrow FIX** `work_item_id` only when **all** true:

1. Browser U65 evidence cites concrete AC-PLT-CTR-TPL-* FAIL (not honesty/module claim).
2. Defect is **closable** wiring: e.g. picker regresses to closed-8 hardcode; persist/edit restore regresses; free-text invent path exposed without KEY toast **and** product requires it.
3. PM stamps CORRECTION — **does not** wipe L1 KEY seal · **does not** reopen EMP/CTR-CLAUSE FE HOLDs · **does not** flip printable.

Otherwise **KEEP** `R-PLT-CTR-TPL-FE-01` HOLD.

---

*End of PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-FE-SA-01 — Option B LOCKED · PASS_TO_PM.*
