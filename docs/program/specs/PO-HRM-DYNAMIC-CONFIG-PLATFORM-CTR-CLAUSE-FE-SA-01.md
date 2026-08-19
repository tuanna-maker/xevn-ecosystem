# PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-SA-01 — Option/F.1 · CTR clause **body_vi** FE residual disposition (after DOCS ACCEPT)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-SA-01` |
| **Parent** | CTR-CLAUSE-DOCS-01 **ACCEPT** SRS **v0.38** · HDSD **CH06h** · evidence `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-docs-01.md` |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for FE (and BE boundary) residual after DOCS — **no wipe** prior CTR-CLAUSE SA/BA · **no seed** · **no reopen** EMP seals |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **B** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** on minted **`R-PLT-CTR-CL-FE-01`** · ba-process **HOLD** (AC pack already CONFIRMED) · FE/BE **HOLD** (no closable GAP) |
| **residual_id** | **`R-PLT-CTR-CL-FE-01`** *(minted this seat — FE residual after DOCS ACCEPT; KEEP HOLD ≠ CLOSED ≠ WAIVED)* |
| **prior_sa** | [`CTR-CLAUSE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md) Option **B RETAIN** Nest `hrm_contract_clauses.body_vi` SoT — **RETAIN · do not wipe** |
| **prior_ba** | [`CTR-CLAUSE-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md) **AC-PLT-CTR-CL-01*** CONFIRMED · BE/FE **HOLD (no GAP)** — **RETAIN** |
| **prior_docs** | DOCS-01 ACCEPT SRS v0.38 CH06h — client wording locked |
| **U88_entry** | EMP-FE-ADMIN-NOTES-SA-01 Option A **ACCEPT_AS_IS_P2 HOLD** · `R-PLT-EMP-FE-ADMIN-01` · EMP STATUS/POSITION/DEPT consumer FE **CLOSED RETAIN** · honesty **false LOCKED** |
| **Honesty** | `contracts_printable_ready=false` · `payroll_e2e_ready=false` · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module CTR UAT · Phase1 · seed · flip printable · reopen EMP FE CLOSED · invent LVRULE · invent EMP FE-ADMIN unlock |
| **must_keep** | EMP FE CLOSED pack · EMP FE-ADMIN HOLD · DEPT/POSITION KEY · ATT · LVRULE HOLD · CTR DOCS CH06h · CTR-CLAUSE SA Option B RETAIN · BA AC pack · honesty false |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** · Option **LOCKED** |

> **HARD EXIT GATE:** this file WriteAllText NFD · Shell **Length ≥ 8KB** verified before CONFIRMED. Empty turn = INVALID.

---

## 1. Decision context (ADR option evaluation)

| | |
|--|--|
| **Decision title** | Disposition for CTR clause **body_vi FE residual** after DOCS ACCEPT — UNLOCK consumer/admin deepen vs ACCEPT_AS_IS HOLD vs invent/reject |
| **Requestor** | pm · U88 continuous · board row `…-CTR-CLAUSE-FE-SA-01` · after DOCS ACCEPT · BE/FE HOLD residual unlock-vs-HOLD |
| **Decision owner** | sa |
| **Related** | AC-PLT-CTR-CL-01..06 · BR-CTR-CL-01..04 · FR-UC-BP-CORE-09a · Q-PLT-01 `{{x}}` · print-spine snapshot · peer EMP consumer UNLOCK · peer EMP-FE-ADMIN / LVRULE ACCEPT_AS_IS |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` |

### 1.1 Problem — what residual remains after DOCS ACCEPT

Prior seats already locked:

| Seat | Verdict | Residual left for *this* seat? |
|------|---------|--------------------------------|
| CTR-CLAUSE-SA-01 | Option **B RETAIN** Nest body SoT + version-bump + snapshot | Architecture SoT **CLOSED** — **do not wipe / do not redefine** |
| CTR-CLAUSE-BA-01 | AC pack CONFIRMED · ba-data HOLD · **BE/FE HOLD (no GAP)** | AC wording **CLOSED** — ba-process **HOLD** this seat |
| CTR-CLAUSE-DOCS-01 | SRS v0.38 + HDSD CH06h **ACCEPT** | Client docs **CLOSED** |
| Board BE/FE HOLD | Named residual: *disposition unlock vs HOLD* after DOCS | **THIS seat** — FE/BE boundary Option/F.1 only |

**Question for F.1:** Is there a **closable FE (or BE) deepen GAP** that warrants Option **A UNLOCK** execution, or is the residual **ACCEPT_AS_IS_P2 HOLD** (surfaces LIVE + AC locked + no build GAP)?

### 1.2 Code audit (read-only — AS-IS evidence)

#### A. Where `body_vi` is **edited** (admin writer)

| Surface | Path / symbol | LIVE? | Role |
|---------|---------------|------:|------|
| Nest SoT table | `public.hrm_contract_clauses.body_vi TEXT NOT NULL` · migration `20260806_contract_legal_print.sql` | **YES** | **Body SoT** (SA-01 Option B RETAIN) |
| Nest mutate | `ContractLegalPrintService.createClause` / `updateClause` / `activateClause` | **YES** | Admin CREATE/PATCH/version-bump |
| Soft-block issued edit | `updateClause` → `clauseHasIssuedSnapshot` → `HRM-CTR-CL-CODE-CONFLICT` when active+issued+`body_vi` change | **YES** | BR-CTR-CL-01 RETAIN |
| FE admin form | `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx` — `clauseForm.body_vi` · `onSaveClause` → `createContractClause` / `updateContractClause` · activate/retire | **YES** | **FE-ADMIN LIVE** (not ABSENT) |
| FE API client | `hrmApi.ts` — `list/create/update/activate/retire` `/api/hrm/contracts-insurance/contract-clauses*` | **YES** | Wire to Nest |

**FE-ADMIN class verdict:** Settings legal-print panel **PRESENT** with editable `body_vi` textarea + CRUD. This is **≠** EMP-FE-ADMIN / LVRULE **ABSENT admin** class. Inventing a second Nest dual admin or Settings-MD body SoT is **FORBIDDEN**.

#### B. Where `body_vi` is **consumed** (resolve, not invent)

| Surface | Path / symbol | LIVE? | Role |
|---------|---------------|------:|------|
| Print spine preview | `ContractPrintSpinePanel.tsx` — maps `preview.clauses[].body_vi` | **YES** | **Consumer resolve** from API preview |
| PDF / HTML render | `contract-print-pdf.renderer.ts` — `doc.text(c.body_vi)` / escapeHtml body | **YES** | Consumer render from snapshot/clause payload |
| Freeze snapshot | `hrm_contract_print_versions.clauses_snapshot_json` | **YES** | Issued body immutable (**must_keep**) |
| Library publish | `contract-library-publish.service.ts` copies `body_vi` group→member | **YES** | Propagation RETAIN — not new SoT |
| FE constants | `contractLegalPrintConstants.ts` | **YES** | Pack/clause_group **labels only** — CODE-MEMORY: **cấm** chứa `body_vi` |

**Consumer class verdict:** Consumer surfaces **LIVE** and already resolve body from Nest row / snapshot. **No** hardcode legal-body string catalog to rebind (peer ATT-CODE / EMP-STATUS hardcode Select class **does not apply**). **No** invent KEY wire for free-text consumer clause body (unlike `HRM-CTR-TPL-KEY` on template picker) — SA-01 explicitly: FE hardcode body = **QA/lint FAIL (BR-CTR-CL-03)**, not a new 4xx invent KEY.

#### C. Settings catalog vs Nest

| Layer | Body SoT? | Evidence |
|-------|-----------|----------|
| Nest `hrm_contract_clauses` | **OWN / RETAIN** | SA-01 Option B LOCKED |
| Settings Master-Data / XBOS catalog | **REF only** (labels/merge) — **≠** body SoT | SA-01 Option A REJECT as body SoT |
| FE Settings panel (legal-print) | **Admin UX** over Nest APIs — not a second store | Panel calls Nest endpoints |

#### D. Invent KEY inventory (clause body seat)

| Code / KEY | Status | Notes |
|------------|--------|-------|
| `HRM-CTR-CL-REQUIRED` | **RETAIN LIVE** | empty body |
| `HRM-CTR-CL-CODE-CONFLICT` | **RETAIN LIVE** | UQ + issued soft-block / version bump |
| `HRM-CTR-CL-404` | **RETAIN LIVE** | miss |
| `HRM-CTR-ISSUE-BLOCKED` | **RETAIN LIVE** | mandatory missing on issue |
| **`HRM-CTR-CL-KEY` (invent consumer free-text)** | **NOT MINTED / NOT REQUIRED** | Consumer does not free-type clause body codes when catalog EFF>0 in the same sense as TPL/OT KEY — body is admin-library data |
| FE hardcode long legal body | **QA/lint FAIL** | BR-CTR-CL-03 · AC-PLT-CTR-CL-05 |

#### E. Closable GAP checklist (A-precondition)

| Precondition for Option A UNLOCK | Met? | Evidence |
|----------------------------------|------|----------|
| Consumer surface LIVE | **YES** | Spine preview + PDF resolve `body_vi` |
| FE-ADMIN surface LIVE | **YES** | `ContractLegalPrintSettingsPanel` body form |
| AC locked | **YES** | BA-01 AC-PLT-CTR-CL-01* CONFIRMED |
| **Closable deepen GAP** (form-gate omit / hardcode Select / missing wire / invent KEY missing) | **NO** | BA-01 §8 **NO GAP** · audit confirms LIVE admin+consumer+BE soft-block |
| BE schema / route missing | **NO** | Routes + `updateClause` LIVE |

**Heuristic application (mission §4):** Prefer **A only if** LIVE + AC locked + **closable gap**. Closable gap = **false** → **Option B**.

### 1.3 Discrimination — FE-ADMIN vs consumer (mandatory)

| Class | Peer pattern | CTR-CLAUSE body seat |
|-------|--------------|----------------------|
| **Consumer EFF / picker deepen UNLOCK** | EMP-STATUS/POSITION/DEPT FE-SA Option A → CLOSED | **OUT** — consumer already resolves Nest/snapshot body; **no** hardcode picker to rebind; **FORBIDDEN** invent “consumer deepen” wave without gap |
| **FE-ADMIN ABSENT → ACCEPT_AS_IS HOLD** | EMP-FE-ADMIN-NOTES / LVRULE 01g | **OUT as primary class** — clause **FE-ADMIN is LIVE** (Settings panel), not ABSENT |
| **Surfaces LIVE + AC locked + no build GAP → ACCEPT_AS_IS HOLD** | Residual after DOCS when BA already HOLD | **THIS residual** — mint `R-PLT-CTR-CL-FE-01` **P2 HOLD**; optional future QA U65 AC slice is **sponsor/PM gated**, not mandatory unlock |
| **Invent Nest dual / reopen EMP / flip printable** | Option C reject class | **REJECT** |

**Do not confuse:** EMP consumer UNLOCK was correct because Settings EFF picker was LIVE but form-gate omitted field / Select hardcode — **closable**. CTR clause has **no** equivalent omit/hardcode gap on body edit or resolve path.

### 1.4 Constraints

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** wipe / redefine CTR-CLAUSE-SA-01 Option B RETAIN
- **DENY** reopen EMP-POSITION / STATUS / DEPT FE **CLOSED**
- **DENY** invent EMP FE-ADMIN unlock (`R-PLT-EMP-FE-ADMIN-01` HOLD sealed)
- **DENY** invent LVRULE 01g unlock
- **DENY** flip `contracts_printable_ready` / personnel / payroll · module CTR UAT · Phase1 · UF 🟢 whole CTR
- **DENY** Settings/XBOS as second body SoT · mega clause-version EAV · snapshot rewrite
- **OUT:** DnD reorder (AC-PLT-CTR-03) · DOCX GĐ2
- must_keep stamps listed in header

### 1.5 Decision heuristic (program rule — applied)

| Rule | Application this seat |
|------|------------------------|
| Prefer A UNLOCK if consumer LIVE + AC locked + **closable gap** | Gap **absent** → **A REJECT default** |
| Prefer B ACCEPT_AS_IS when residual is P2 HOLD / no build GAP | **B LOCK** |
| REJECT invent Nest dual / reopen EMP seals / flip printable | **C REJECT** |
| Discriminate FE-ADMIN vs consumer | Admin LIVE ≠ invent admin; consumer LIVE ≠ invent deepen |

---

## 2. Options

### Option A — UNLOCK FE (and/or BE if GAP) consumer/admin deepen

| | |
|--|--|
| **Description** | Dispatch `dev-fe` (and/or `dev-be`) to “deepen” clause body FE: rebind consumer, invent admin panel, wire invent KEY, or patch form-gate — treating residual as closable Condition like EMP-DEPT/POSITION/STATUS FE. |
| **Benefits** | Would close a real wiring gap **if one existed**. |
| **Costs** | Invents execution without BA/GAP evidence; risks churn on LIVE print-spine + Settings panel; confuses with EMP consumer UNLOCK class; billing/wave noise. |
| **Risks** | Over-scope · reopen sealed peers by accident · claim printable/module CTR ready · **REJECT as default** because **closable gap = NO** (BA §8 + code audit). |
| **When revisit** | Only if future **QA U65** proves a **named** wiring defect (e.g. soft-block toast missing, F5 body stale, activate CTA absent) with `spec_ref` AC-PLT-CTR-CL-* — then narrow FIX seat, **not** this Option A unlock-as-default. |

### Option B — ACCEPT_AS_IS_P2 HOLD on `R-PLT-CTR-CL-FE-01` — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | **Mint** Condition **`R-PLT-CTR-CL-FE-01`** = P2 FE residual after DOCS ACCEPT. **KEEP HOLD** (≠ CLOSED ≠ WAIVED). **RETAIN** Nest body SoT + FE-ADMIN LIVE panel + consumer resolve LIVE + BA AC pack + DOCS CH06h. **Do not** dispatch `dev-fe`/`dev-be` from this seat. Optional browser QA against AC-PLT-CTR-CL-01..06 remains **PM-gated** (honesty false · `C-SLICE` · J-HRM-CTR-CL-* not promoted). BE boundary: **HOLD** — no schema/route GAP. |
| **Benefits** | Matches BA HOLD (no GAP); preserves seals; honesty; clears board unlock-vs-HOLD without inventing work; peer-consistent with “ACCEPT_AS_IS when no closable deepen”. |
| **Costs** | AC browser U65 not executed this seat — residual stays **HOLD NOTE** until PM opens optional QA (or forever P2 if no sponsor ask). |
| **Risks** | Misread HOLD as “admin ABSENT invent panel” (wrong — admin LIVE) or as “consumer UNLOCK pending” (wrong — no gap) → mitigated by §1.3 discrimination table. |

### Option C — REJECT invent Nest dual / reopen EMP seals / flip printable / Settings body SoT

| | |
|--|--|
| **Description** | Move body to Settings MD dual SoT; invent Nest second clause admin; reopen EMP-POSITION/STATUS/DEPT FE CLOSED; invent EMP FE-ADMIN unlock; invent LVRULE; flip `contracts_printable_ready`; mega body-history EAV; rewrite issued snapshot. |
| **Benefits** | None for GĐ1 honesty. |
| **Costs** | Seal churn · dual writers · legal-print regression · personnel/CTR false ready. |
| **Risks** | **REJECT** — explicit DENY list in §1.4. |

---

## 3. Trade-off matrix

| Criteria | Weight | A UNLOCK deepen | **B ACCEPT_AS_IS HOLD** | C Invent / reopen / flip |
|----------|-------:|----------------:|------------------------:|-------------------------:|
| Business value (AC already locked · surfaces LIVE) | 5 | 2 | **5** | 0 |
| Honesty / seal safety (EMP CLOSED · printable false) | 5 | 2 | **5** | 0 |
| Closable-gap fidelity (no invent work) | 5 | 0 | **5** | 0 |
| Time / wave cost | 4 | 1 | **5** | 0 |
| Maintainability (RETAIN LIVE spine) | 4 | 2 | **5** | 1 |
| Confusion risk FE-ADMIN vs consumer | 4 | 1 | **5** | 0 |
| **Weighted** | | 34 | **120** | 4 |

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Unlock without gap → churn LIVE panel / spine | Diff invents wire without BA GAP | **Reject A**; only reopen on QA-named defect |
| B | HOLD misread as ABSENT-admin invent | Board invents Nest dual admin | Cite §1.3 — admin LIVE; HOLD = no deepen |
| B | HOLD misread as deferred consumer UNLOCK | PM dispatches EMP-style FE deepen | Cite audit — resolve LIVE; no hardcode Select |
| C | Flip printable / reopen EMP | Honesty flags / matrix | DENY · must_keep stamps |
| Any | Wipe SA-01 Option B | Spec rewrite | **FORBIDDEN** — RETAIN prior SA/BA/DOCS |

---

## 5. Decision

| | |
|--|--|
| **Selected** | **Option B** — **ACCEPT_AS_IS_P2 HOLD** · Condition **`R-PLT-CTR-CL-FE-01`** **LOCKED** |
| **Seat verdict** | **CONFIRMED** |
| **Why B** | Consumer LIVE + FE-ADMIN LIVE + AC-PLT-CTR-CL-01* locked + DOCS ACCEPT + BA §8 **NO GAP** + code audit shows soft-block/version/snapshot already LIVE → **no closable deepen** → A unlock would invent work. Class ≠ EMP consumer UNLOCK; class ≠ EMP-FE-ADMIN ABSENT (admin here is LIVE). Residual = named P2 HOLD for board continuity + optional PM-gated QA only. |
| **Rejected** | **A** default unlock FE/BE · **C** invent Nest dual / reopen EMP / invent LVRULE / flip printable / Settings body SoT |
| **Assumptions** | `clauses_snapshot_json` still preserves issued bodies; `{{x}}` token lock holds; no sponsor mandate for admin body-history UI (ba-data remains HOLD). |

### 5.1 Condition disposition

| Field | Value |
|-------|--------|
| **Condition id** | **`R-PLT-CTR-CL-FE-01`** *(minted — no prior R-PLT-CTR-CL* in docs)* |
| **Severity** | **P2** |
| **State** | **HOLD** (ACCEPT_AS_IS) — **≠ CLOSED ≠ WAIVED** |
| **Owner** | pm (board) · optional future qa if PM opens U65 AC slice |
| **Closable by FE deepen this wave?** | **NO** |
| **Closable by invent KEY?** | **NO** — no `HRM-CTR-CL-KEY` invent required |
| **Related AC** | AC-PLT-CTR-CL-01..06 **RETAIN deferred-as-optional-QA** (not waived) |
| **Related BE** | **HOLD** — boundary confirmed no GAP |

### 5.2 Layer map (RETAIN)

| Layer | Artifact | This seat |
|-------|----------|-----------|
| Body SoT | Nest `hrm_contract_clauses.body_vi` | **RETAIN** (SA-01 B) |
| FE-ADMIN | `ContractLegalPrintSettingsPanel` | **LIVE RETAIN** — no invent · no unlock |
| Consumer | Spine preview + PDF renderer | **LIVE RETAIN** — resolve-not-hardcode |
| Freeze | `clauses_snapshot_json` | **must_keep** |
| Settings MD / XBOS | — | **≠** body SoT |
| AC / DOCS | BA-01 · SRS v0.38 · CH06h | **RETAIN** |
| Residual | `R-PLT-CTR-CL-FE-01` | **HOLD P2** |

### 5.3 Gates after this seat

| Question | Answer |
|----------|--------|
| Unlock ba-process? | **NO** — AC pack already CONFIRMED |
| Unlock ba-data? | **NO** — HOLD (history trigger not fired) |
| Unlock BE? | **NO** — HOLD · no GAP |
| Unlock FE? | **NO** — HOLD · Option B |
| Optional QA U65 AC slice? | **PM-gated only** — not auto-dispatch from this seat |
| Flip `contracts_printable_ready`? | **FORBIDDEN** |
| Reopen EMP FE CLOSED / FE-ADMIN HOLD / LVRULE? | **FORBIDDEN** |

---

## 6. Locks (L-CTR-CL-FE-*)

| Lock | Rule |
|------|------|
| **L-CTR-CL-FE-01** | Option **B** LOCKED — `R-PLT-CTR-CL-FE-01` **ACCEPT_AS_IS_P2 HOLD** |
| **L-CTR-CL-FE-02** | Nest body SoT RETAIN — **cấm** Settings/XBOS body SoT dual |
| **L-CTR-CL-FE-03** | FE-ADMIN panel LIVE RETAIN — **cấm** invent second admin / Nest dual |
| **L-CTR-CL-FE-04** | Consumer resolve LIVE — **cấm** invent hardcode-rebind “deepen” without QA-named gap |
| **L-CTR-CL-FE-05** | **No** invent `HRM-CTR-CL-KEY` this seat — wire codes `HRM-CTR-CL-*` RETAIN |
| **L-CTR-CL-FE-06** | Snapshot freeze + version-bump soft-block **must_keep** |
| **L-CTR-CL-FE-07** | EMP STATUS/POSITION/DEPT FE **CLOSED RETAIN** · EMP FE-ADMIN **HOLD RETAIN** · LVRULE **HOLD RETAIN** · ATT seals RETAIN |
| **L-CTR-CL-FE-08** | `contracts_printable_ready=false` · personnel/payroll false · `C-SLICE-≠-MODULE` · U65 |
| **L-CTR-CL-FE-09** | Prior CTR-CLAUSE SA/BA/DOCS **RETAIN — do not wipe** |
| **L-CTR-CL-FE-10** | DnD / DOCX **OUT** (cite AC-PLT-CTR-03 / GĐ2) |

---

## 7. Architecture diagram logic (text)

```
HCNS admin FE (LIVE Settings panel)
    │  edit body_vi
    ▼
Nest hrm_contract_clauses.body_vi  ←── BODY SoT (SA-01 Option B RETAIN)
    │
    ├─ draft / not-issued ──► PATCH in-place ──► F5 / draft preview
    └─ active + issued ──► soft-block HRM-CTR-CL-CODE-CONFLICT
                              └─► activate / version++ 
                                    └─ old HĐ keep clauses_snapshot_json

Consumer (LIVE)
    Spine preview / PDF renderer
        └─ resolve body from clause row OR snapshot
        └─ BR-CTR-CL-03 cấm FE hardcode body

THIS SEAT residual
    R-PLT-CTR-CL-FE-01 = P2 HOLD (ACCEPT_AS_IS)
        └─ NO unlock FE/BE (no closable GAP)
        └─ optional QA AC slice = PM-gated only
```

---

## 8. Impacted systems · dependencies · non-goals

| System | Impact |
|--------|--------|
| hrm-api contracts-insurance legal-print | **None** this seat (docs-only · HOLD) |
| web HRM Settings legal-print panel | **None** — LIVE RETAIN |
| web ContractPrintSpinePanel / PDF | **None** — LIVE RETAIN |
| EMP / ATT / LVRULE / SI / PAY | **None** — seals RETAIN · DENY reopen |
| Client SRS/HDSD | **RETAIN** DOCS ACCEPT — no rewrite |

**Non-goals:** module CTR UAT · printable ready · invent KEY · Nest dual · EMP FE-ADMIN invent · LVRULE invent · DnD · DOCX · seed · apps/**.

---

## 9. Rollout / checkpoint plan

| Step | Owner | Exit |
|------|-------|------|
| 1. Seal this Option B on bus + board | pm | `R-PLT-CTR-CL-FE-01` HOLD stamped · Option LOCKED |
| 2. U88 next vertical / residual governance | pm → sa/ba | **not** invent CTR FE unlock |
| 3. (Optional) QA U65 AC-PLT-CTR-CL-01..06 | pm-gated qa | Evidence browser · honesty false · J-* not auto-promoted |
| 4. If QA finds **named** wiring gap | pm → narrow FIX | New work_item — **not** reopen this Option as A-default |

**Rollback:** N/A docs-only; if mis-dispatch A occurs → CORRECTION + stop FE invent.

---

## 10. Validation · acceptance evidence plan

| Check | Expected |
|-------|----------|
| Spec Length ≥ 8KB NFD | Shell `(Get-Item).Length` PASS |
| Option LOCKED = B | Header + §5 |
| Condition minted | `R-PLT-CTR-CL-FE-01` HOLD |
| Prior SA/BA/DOCS | RETAIN citations |
| Discrimination table | FE-ADMIN LIVE ≠ ABSENT; consumer LIVE ≠ unlock |
| DENY list | EMP CLOSED · FE-ADMIN HOLD · LVRULE · printable · Nest dual |
| next_owner | **pm** (not dev-fe/dev-be) |
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
| CTR DOCS CH06h / SRS v0.38 | **RETAIN ACCEPT** |
| This seat | Docs-only Option/F.1 · **no** `apps/**` |

---

## 12. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-SA-01.md` *(this file)* |
| **next_owner** | **pm** |
| **completion_report** | See §13 |
| **next_dispatch_prompt** | See §14 |

---

## 13. completion_report

**Closed:** Docs-only SA Option/F.1 for `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-SA-01`. Code audit (read-only) confirms: Nest `hrm_contract_clauses.body_vi` SoT LIVE; FE-ADMIN `ContractLegalPrintSettingsPanel` body CRUD LIVE; consumer spine/PDF resolve LIVE; issued soft-block `HRM-CTR-CL-CODE-CONFLICT` LIVE; Settings/XBOS ≠ body SoT; no invent `HRM-CTR-CL-KEY` required. Prior CTR-CLAUSE SA Option B RETAIN + BA AC-PLT-CTR-CL-01* + DOCS SRS v0.38 CH06h **RETAIN (not wiped)**. **Minted `R-PLT-CTR-CL-FE-01`**. **Option B LOCKED — ACCEPT_AS_IS_P2 HOLD** (≠ CLOSED ≠ WAIVED). Rejected Option A UNLOCK (no closable gap despite LIVE+AC). Rejected Option C invent Nest dual / reopen EMP CLOSED / invent EMP FE-ADMIN / invent LVRULE / flip printable. Discriminated FE-ADMIN LIVE ≠ ABSENT HOLD class; consumer LIVE ≠ EMP-style deepen UNLOCK. BE boundary HOLD. Honesty flags false · `C-SLICE` · U65 · no `apps/**`.

**Residual:** Board Condition `R-PLT-CTR-CL-FE-01` **KEEP HOLD**; optional PM-gated QA U65 AC slice only; U88 next vertical per continuous board — **not** CTR FE unlock.

---

## 14. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-SA-01-SEAL
from_role: pm
to_role: pm (self-seal) → then U88 next governance vertical (sa/ba) OR optional qa
lane: governance
priority: P2
program: PO-HRM-CONTINUOUS-W8-20260807

## Intake
CTR-CLAUSE-FE-SA-01 CONFIRMED Option B LOCKED — ACCEPT_AS_IS_P2 HOLD on R-PLT-CTR-CL-FE-01
Prior RETAIN: CTR-CLAUSE-SA-01 Option B · BA AC-PLT-CTR-CL-01* · DOCS SRS v0.38 CH06h
U88: EMP FE CLOSED pack · EMP FE-ADMIN HOLD · LVRULE HOLD · honesty false

## Actions
1. Seal bus + board: R-PLT-CTR-CL-FE-01 = HOLD (≠ CLOSED ≠ WAIVED); FE/BE unlock REJECTED.
2. DENY dispatch dev-fe / dev-be for CTR clause body deepen from this residual.
3. Continue U88 continuous pipeline: next sa/ba vertical from board (not invent CTR FE unlock; not invent LVRULE; not reopen EMP seals).
4. Optional only if sponsor asks U65 AC browser: Task qa AC-PLT-CTR-CL-01..06 — honesty false · C-SLICE · no printable flip · no seed.

## DENY
apps/** · seed · flip contracts_printable_ready · reopen EMP-POSITION/STATUS/DEPT FE CLOSED · invent EMP FE-ADMIN · invent LVRULE · Nest dual body SoT · module CTR UAT

## Evidence
docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-SA-01.md
```

---

## 15. Spec_read_ack (governance)

| Artifact | Citation |
|----------|----------|
| prior SA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md` Option B RETAIN |
| prior BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md` AC-PLT-CTR-CL-01* · §8 NO GAP |
| prior DOCS | evidence `po-hrm-dynamic-config-platform-ctr-clause-docs-01.md` ACCEPT v0.38 CH06h |
| peer HOLD | `EMP-FE-ADMIN-NOTES-SA-01` · `ATT-LVRULE-FE-01G-SA-01` (cite class-diff: admin LIVE here) |
| peer UNLOCK | EMP-STATUS/POSITION/DEPT FE-SA Option A (cite class-diff: closable gap there — **absent** here) |
| code | `ContractLegalPrintSettingsPanel.tsx` · `ContractPrintSpinePanel.tsx` · `contract-legal-print.service.ts` `updateClause` · `contract-print-pdf.renderer.ts` · `contractLegalPrintConstants.ts` |
| ADR template | `.cursor/templates/ADR_OPTION_TEMPLATE.md` |

---

*End of CTR-CLAUSE-FE-SA-01 — Option B LOCKED · R-PLT-CTR-CL-FE-01 HOLD · PASS_TO_PM*