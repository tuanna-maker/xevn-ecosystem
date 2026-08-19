# PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BE-SA-01 — Option/F.1 · CTR clause **body_vi** Nest BE residual disposition (after BA CONFIRM · FE-SA HOLD)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BE-SA-01` |
| **Parent** | CTR-CLAUSE-BA-01 **CONFIRMED** · BE/FE **HOLD (no GAP)** · CTR-CLAUSE-FE-SA-01 Option B **`R-PLT-CTR-CL-FE-01`** · DOCS ACCEPT SRS v0.38 CH06h |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` · U88 after **HONESTY-REGISTRY-QC-01 GWC** · W8-FULL-HONESTY-GOVERNANCE IDLE-OK · next **non-honesty** vertical |
| **lane** | governance · sa · **docs-only** · **NO** `apps/**` |
| **change_mode** | **ADD** Option/F.1 disposition for Nest **BE** residual on clause catalog — **no wipe** prior CTR-CLAUSE SA/BA/FE-SA · **no seed** · **no reopen** ATT/EMP seals |
| **Date** | 2026-08-08 |
| **Status** | **CONFIRMED** — Option **A** **LOCKED** · **ACCEPT_AS_IS_P2 HOLD** on minted **`R-PLT-CTR-CL-BE-01`** · dev-be **HOLD** (no unlock this wave) · ba-process **HOLD** (AC pack already CONFIRMED) |
| **selected_option** | **A** |
| **residual_id** | **`R-PLT-CTR-CL-BE-01`** *(minted this seat — BE boundary after LIVE stack + BA NO GAP; KEEP HOLD ≠ CLOSED ≠ WAIVED)* |
| **prior_sa** | [`CTR-CLAUSE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md) Option **B RETAIN** Nest `hrm_contract_clauses.body_vi` SoT — **RETAIN · do not wipe** |
| **prior_ba** | [`CTR-CLAUSE-BA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md) **AC-PLT-CTR-CL-01*** CONFIRMED · **BE/FE HOLD (no GAP)** — **RETAIN** |
| **prior_fe_sa** | [`CTR-CLAUSE-FE-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-SA-01.md) Option B **`R-PLT-CTR-CL-FE-01`** ACCEPT_AS_IS_P2 HOLD — **symmetric BE HOLD** |
| **peer_printable** | [`CTR-PRINTABLE-HOLD-SA-01`](./PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-PRINTABLE-HOLD-SA-01.md) Option A **`R-PLT-CTR-PRINTABLE-01`** · **`contracts_printable_ready=false` RETAIN** |
| **peer_template_be** | CTR-TEMPLATE-BE-01 invent **`HRM-CTR-TPL-KEY`** — **cite class-difference** (template open-catalog consumer KEY gap · **≠** clause body seat) |
| **Honesty** | `contracts_printable_ready=false` · `payroll_e2e_ready=false` · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · U65 · **DENIED** module CTR UAT · Phase1 · seed · flip printable · invent dual Nest SoT |
| **must_keep** | `hrm_contract_print_versions.clauses_snapshot_json` · `updateClause` issued soft-block · `ContractLegalPrintService` clause CRUD LIVE · FE-SA + BA AC pack · honesty false · CTR-TEMPLATE KEY seal · ATT/EMP CLOSED pack |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** · Option **LOCKED** |

> **HARD EXIT GATE:** NFD path · UTF-8 **no BOM** · Shell **Length ≥ 8192** verified before CONFIRMED. Empty turn = INVALID.

---

## 1. Decision context (ADR option evaluation)

| | |
|--|--|
| **Decision title** | Disposition for CTR clause **Nest BE** residual — UNLOCK narrow invent KEY / soft-retire / `F-CTR-CL-*` allow-list vs **ACCEPT_AS_IS_P2 HOLD** |
| **Requestor** | pm · U88 continuous · board row `…-CTR-CLAUSE-BE-SA-01` · after FE-SA HOLD · BA BE/FE HOLD |
| **Decision owner** | sa |
| **Related** | AC-PLT-CTR-CL-01..06 · VAL-CTR-CL-01..03 · BR-CTR-CL-01..04 · FR-UC-BP-CORE-09a · Q-PLT-01 `{{x}}` · print-spine snapshot · peer CTR-TEMPLATE-BE invent KEY |
| **Template** | `.cursor/templates/ADR_OPTION_TEMPLATE.md` |
| **Board** | `docs/program/PO_HRM_CONTINUOUS_W8_20260807.md` rows CTR-CLAUSE-* |

### 1.1 Problem — what BE residual remains after BA CONFIRM + FE-SA HOLD

Prior seats already closed architecture and AC wording:

| Seat | Verdict | BE implication |
|------|---------|----------------|
| CTR-CLAUSE-SA-01 | Option **B RETAIN** Nest body SoT + snapshot freeze | **Unlock BE? HOLD** — RETAIN LIVE; no schema unless ba-data fires |
| CTR-CLAUSE-BA-01 | AC pack CONFIRMED · **BE/FE HOLD (no GAP)** | BA audit: routes + mutate + soft-retire **LIVE** — **no build GAP** |
| CTR-CLAUSE-DOCS-01 | SRS v0.38 CH06h ACCEPT | Client docs CLOSED — no BE delta |
| CTR-CLAUSE-FE-SA-01 | Option B **`R-PLT-CTR-CL-FE-01`** P2 HOLD | FE boundary HOLD — **BE should not diverge** (unlock FE without BE or vice versa forbidden without gap) |
| CTR-TEMPLATE-BE-01 | **UNLOCK** invent `HRM-CTR-TPL-KEY` | **Different class:** template **open-catalog consumer** invent when EFF>0 — **not** clause body library |

**Question for F.1:** Does Nest BE need a **UNLOCK_BE** wave (invent KEY, soft-retire deepen, `F-CTR-CL-*` platform-catalog allow-list) or **ACCEPT_AS_IS_P2 HOLD** on minted **`R-PLT-CTR-CL-BE-01`**?

### 1.2 Code audit (read-only — AS-IS BE evidence)

#### A. Physical schema (RETAIN — no physicalize)

| Artifact | Evidence | Verdict |
|----------|----------|---------|
| Table `public.hrm_contract_clauses` | `20260806_contract_legal_print.sql` + `ensureSchema` in `contract-legal-print.service.ts` | **LIVE** — `body_vi TEXT NOT NULL`, `version`, `status`, `archived_at`, UQ active code |
| Library lineage | `20260807_contract_library_publish.sql` columns on clauses | **LIVE** — group publish RETAIN |
| Snapshot freeze | `hrm_contract_print_versions.clauses_snapshot_json` | **LIVE** — **must_keep** |
| Append-only history table | — | **ABSENT** — ba-data **HOLD** (no trigger) |

#### B. Service surface (`ContractLegalPrintService`)

| Operation | Symbol / route (controller) | Wire codes | Verdict |
|-----------|----------------------------|------------|---------|
| List | `listClauses` · `GET …/contract-clauses` | `HRM-CTR-CL-200` | **LIVE** |
| Create | `createClause` · `POST …/contract-clauses` | `HRM-CTR-CL-201` | **LIVE** |
| Get by id | `getClauseById` · `GET …/contract-clauses/:id` | `HRM-CTR-CL-200` / `404` | **LIVE** |
| Update body | `updateClause` · `PATCH …/contract-clauses/:id` | `HRM-CTR-CL-200` · soft-block `HRM-CTR-CL-CODE-CONFLICT` | **LIVE** |
| Activate / version bump | `activateClause` · `POST …/:id/activate` | `HRM-CTR-CL-200` | **LIVE** |
| Soft-retire | `retireClause` · `POST …/:id/retire` | `HRM-CTR-CL-200` | **LIVE** |
| Issued guard | `clauseHasIssuedSnapshot()` | VAL-CTR-CL-01 | **LIVE** |
| Required body | `assertClauseRequired` | `HRM-CTR-CL-REQUIRED` | **LIVE** jest spec |

Routes live under `contracts-insurance.controller.ts` L549–648 (not a separate `/legal-print/clauses` mega-router — **RETAIN** existing wire).

#### C. Platform catalog pattern (`SettingsCatalogsService` / invent KEY) — **OUT for clause body**

| Pattern | CTR-TEMPLATE seat | CTR-CLAUSE body seat |
|---------|-------------------|----------------------|
| SoT | `hrm_contract_templates.template_code` open catalog | `hrm_contract_clauses.body_vi` **library row** |
| Consumer invent KEY | **`HRM-CTR-TPL-KEY`** when EFF>0 free-text blocked | **NOT REQUIRED** — body is admin-library data; consumer resolves row/snapshot (FE-SA §1.2D) |
| `F-CTR-CL-*` as platform function IDs | N/A for template KEY wire | SA-01 §6: **RETAIN** existing legal-print endpoints — **cấm** invent `/api/hrm/platform/ctr/*` mega catalog |
| Dual Nest SoT | REJECT Settings body + Nest body | **DENY** wiring clause body into Settings MD catalog as second writer |

**Class verdict:** UNLOCK_BE for **`HRM-CTR-CL-KEY`** or **`F-CTR-CL-*` SettingsCatalogs allow-list** would **mis-apply** the platform open-catalog pattern to a **dedicated legal-print module** that already owns CRUD. That is **Option C / invent dual SoT** risk — **REJECT** for Option B.

#### D. Closable GAP checklist (B-precondition)

| Precondition for Option B UNLOCK_BE | Met? | Evidence |
|-------------------------------------|------|----------|
| BE routes / schema **ABSENT** | **NO** | Controller + migration LIVE |
| Missing soft-retire / activate | **NO** | `retireClause` / `activateClause` LIVE |
| Missing invent KEY for consumer | **NO** | FE-SA: **NOT MINTED / NOT REQUIRED** |
| BA flags **GAP** | **NO** | BA-01 §2 «Không có GAP build» |
| QA FAIL on L1 invent | **NO** | No `…-CTR-CLAUSE-BE-01` / `…-CTR-CLAUSE-QA-01` dispatched — **optional** future U65 slice PM-gated |
| Scope parity list≠get | **UNKNOWN / not blocking** | VAL-CTR-CL-02 in BA pack — **jest spot**, not mandatory unlock without FAIL evidence |

**Heuristic:** Prefer **B only if** narrow BE gap (KEY / CNS / schema). Gap = **false** → **Option A HOLD**.

### 1.3 Constraints (mission DENY list)

- Docs-only · **no** `apps/**` · **no** seed (U65)
- **DENY** flip `contracts_printable_ready=true` · module CTR UAT · Phase1 DONE · product GO
- **DENY** invent **dual Nest SoT** (Settings MD body + `hrm_contract_clauses`)
- **DENY** reopen CTR-CLAUSE FE HOLD (`R-PLT-CTR-CL-FE-01`) as excuse for BE unlock
- **DENY** honesty flag flips · **`C-SLICE-≠-MODULE`**
- **RETAIN** CTR-PRINTABLE **`R-PLT-CTR-PRINTABLE-01`** · CTR-TEMPLATE KEY GWC seal
- **RETAIN** ATT L1 · EMP FE CLOSED · leave-balance Conditions

---

## 2. Options

### Option A — **ACCEPT_AS_IS_P2 HOLD** · Nest BE clause stack **RETAIN LIVE** · **no dev-be unlock this wave** — **RECOMMEND / LOCK**

| | |
|--|--|
| **Description** | Mint **`R-PLT-CTR-CL-BE-01`**. Acknowledge Nest BE for clause body (`createClause` / `updateClause` / `activateClause` / `retireClause` / snapshot guards) is **already LIVE** and aligned with SA-01 Option B + BA AC pack. **Hold** any dev-be seat until (a) sponsor opens named CTR clause U65 QA wave, or (b) ba-data conditional history trigger fires, or (c) measured FAIL on VAL-CTR-CL-02 scope parity — **not** speculative UNLOCK. |
| **Benefits** | Symmetric with FE-SA **`R-PLT-CTR-CL-FE-01`**; honors BA **NO GAP**; avoids platform-catalog KEY mis-wire; zero print-spine churn; honesty-safe. |
| **Costs** | Optional U65 browser evidence for AC-PLT-CTR-CL-* remains **PM/sponsor gated** (not mandatory this wave). |
| **Risks** | Misread as «module CTR BE done» → mitigated by **P2 HOLD** + honesty false + printable HOLD. |

### Option B — **UNLOCK_BE** · narrow invent KEY / soft-retire deepen / `F-CTR-CL-*` allow-list

| | |
|--|--|
| **Description** | Dispatch `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BE-01` dev-be to add `HRM-CTR-CL-KEY`, platform catalog registration, or duplicate admin paths «for consistency» with OT/TPL catalogs. |
| **Benefits** | Would only help if a **proven** consumer invent gap existed (like TPL KEY). |
| **Costs** | Duplicate semantics vs LIVE legal-print CRUD; risk **dual SoT**; violates SA-01 «no mega platform ctr catalog»; unnecessary diff on frozen print-spine adjacency. |
| **Risks** | **REJECT** — no closable gap · invent KEY **not required** · soft-retire **already LIVE**. |

### Option C — Hybrid / flip printable / reopen FE / mega-EAV / seed — **REJECT**

| | |
|--|--|
| **Description** | Use BE unlock to flip honesty, reopen FE HOLD, add Settings body SoT, or seed clauses for QA. |
| **Benefits** | None for GĐ1 governance. |
| **Costs** | Honesty violation · dual writers · U65 breach. |
| **Risks** | **REJECT** per mission DENY list. |

---

## 3. Trade-off matrix

| Criteria | Weight | **A ACCEPT_AS_IS_P2 HOLD** | B UNLOCK_BE | C Hybrid / flip |
|----------|-------:|---------------------------:|------------:|----------------:|
| Honesty / seal safety | 5 | **5** | 3 | 0 |
| Align BA «NO GAP» | 5 | **5** | 2 | 0 |
| Single body SoT (no dual Nest) | 5 | **5** | 2 | 0 |
| Symmetry FE-SA HOLD | 4 | **5** | 2 | 0 |
| Time / churn (RETAIN vs invent) | 4 | **5** | 2 | 1 |
| Business value (correct gap fix only) | 4 | **4** | 1 | 0 |
| Maintainability | 4 | **5** | 2 | 0 |
| **Weighted total** | | **118** | 52 | 4 |

---

## 4. Failure modes and mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | PM claims «BE CLOSED» → module CTR UAT | Honesty registry · printable HOLD | **`R-PLT-CTR-CL-BE-01` = P2 HOLD** · `contracts_printable_ready=false` |
| A | Stale docs say «BE HOLD until BA» after BA CONFIRMED | Board W8 row | This seat **updates** disposition to **HOLD with rationale**, not ABSENT |
| B | Invent `HRM-CTR-CL-KEY` conflicts with library CRUD | Code review | **REJECT B** — FE-SA §1.2D |
| B | Platform allow-list duplicates legal-print routes | ADR-GROUP / Q-PLT-03 | **DENY** mega `/platform/ctr/*` |
| B | Unlock BE while FE HOLD → asymmetric slice claim | Dispatch audit | **FORBIDDEN** without paired gap |
| C | Flip `contracts_printable_ready` via BE change | QC honesty GWC | **DENY** · Option C REJECT |
| C | Seed clause body for QA | U65 sponsor lock | **FAIL** QA ethics |
| Any | Issued body retroactive change | Snapshot diff | RETAIN `clauseHasIssuedSnapshot` — **no BE change needed** |
| Any | Scope list≠get drift | `VAL-CTR-CL-02` jest | **Future** narrow BE fix **only on FAIL** — not pre-unlock |

---

## 5. Decision

| | |
|--|--|
| **Selected option** | **A** — **ACCEPT_AS_IS_P2 HOLD** |
| **Seat verdict** | **CONFIRMED** |
| **Why A** | BE clause stack is **LIVE** and matches locked architecture; BA explicitly **NO GAP**; FE-SA already **P2 HOLD**; TPL invent KEY pattern **does not transfer** to clause body; UNLOCK_BE would invent platform-catalog surface area **denied** by SA-01 and risks **dual SoT**. |
| **Rejected** | **B** UNLOCK_BE (no closable gap) · **C** hybrid / flip / seed |
| **Assumptions** | Existing wire codes `HRM-CTR-CL-*` remain canonical; optional QA U65 wave is **out of scope** for mandatory unlock. |

### 5.1 Residual registry

| residual_id | Class | Status | Meaning |
|-------------|-------|--------|---------|
| **`R-PLT-CTR-CL-BE-01`** | BE boundary P2 | **HOLD** | Nest legal-print clause CRUD **LIVE** · no dev-be wave until proven FAIL or sponsor QA inventory |
| **`R-PLT-CTR-CL-FE-01`** | FE boundary P2 | **HOLD RETAIN** | Peer FE-SA — do not reopen as BE unlock driver |
| **`R-PLT-CTR-PRINTABLE-01`** | Program honesty | **HOLD RETAIN** | Printable flag false — BE HOLD **≠** printable GO |

### 5.2 Layer map (BE ownership)

| Layer | Owner | This seat |
|-------|-------|-----------|
| Clause body SoT | Nest `hrm_contract_clauses` | **RETAIN** — no Settings catalog migration |
| CRUD + lifecycle | `ContractLegalPrintService` | **LIVE** — HOLD disposition only |
| Consumer invent KEY | — | **NOT MINTED** |
| Platform `SettingsCatalogsService` | Other verticals (OT, TPL, …) | **≠** clause body — **no allow-list expand** |
| Snapshot / issue | print_versions JSON | **must_keep** |

### 5.3 Locks (L-CTR-CL-BE-*)

| Lock | Rule |
|------|------|
| **L-CTR-CL-BE-01** | **No** dev-be unlock from this seat — **`R-PLT-CTR-CL-BE-01` HOLD** |
| **L-CTR-CL-BE-02** | **DENY** invent `HRM-CTR-CL-KEY` without measured consumer FAIL |
| **L-CTR-CL-BE-03** | **DENY** `/api/hrm/platform/ctr/*` or mega-EAV clause catalog |
| **L-CTR-CL-BE-04** | **DENY** flip `contracts_printable_ready` · module CTR UAT · Phase1 DONE |
| **L-CTR-CL-BE-05** | **RETAIN** wire codes `HRM-CTR-CL-REQUIRED` · `CODE-CONFLICT` · `404` · issue blocked |
| **L-CTR-CL-BE-06** | **RETAIN** CTR-TEMPLATE **`HRM-CTR-TPL-KEY`** seal — do not conflate with clause BE |
| **L-CTR-CL-BE-07** | **U65** — optional QA is browser FE path; **no seed** to «unlock» BE |
| **L-CTR-CL-BE-08** | **`C-SLICE-≠-MODULE`** — L1 legal-print slice LIVE **≠** program BE CLOSED |

---

## 6. Implementation and validation plan

| Step | Owner | Gate |
|------|-------|------|
| 1 This SA Option A LOCK | sa | **CONFIRMED** (this file + evidence) |
| 2 PM board W8 row seal | pm | Mark `…-CTR-CLAUSE-BE-SA-01` **CONFIRMED** · residual **`R-PLT-CTR-CL-BE-01`** |
| 3 ba-process | ba-process | **HOLD** — AC pack already CONFIRMED · **no** new AC pack unless spec_gap |
| 4 dev-be | dev-be | **HOLD** — **no dispatch** until FAIL or sponsor QA wave |
| 5 Optional QA U65 | qa | **PM gated** — AC-PLT-CTR-CL-* browser · zero-seed · does not require pre-BE unlock |
| 6 ba-data | ba-data | **HOLD** — conditional history table only if new AC trigger |

**Rollback:** N/A (docs-only). If future VAL-CTR-CL-02 FAIL → narrow BE scope parity fix only — **not** full UNLOCK_BE pattern.

**Success criteria:** Spec + evidence **≥8192 bytes** NFD · Option A LOCKED · residual minted · no `apps/**` diff.

---

## 7. Explicit OUT

| OUT | Rule |
|-----|------|
| dev-be invent KEY / platform catalog | **OUT** this wave (Option B rejected) |
| Flip `contracts_printable_ready` | **OUT** · peer PRINTABLE HOLD |
| Reopen FE-SA UNLOCK | **OUT** |
| Module CTR UAT / Phase1 / product GO | **OUT** |
| Seed · mega-EAV · Settings body SoT | **OUT** |
| Reopen ATT/EMP/LVRULE seals | **OUT** |

---

## 8. Handback (completion contract)

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **selected_option** | **A** |
| **residual_id** | **`R-PLT-CTR-CL-BE-01`** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-be-sa-01.md` |
| **next_owner** | **pm** (idle HOLD seal on W8 board + honesty registry cite) |
| **completion_report** | Docs-only SA Option/F.1 for CTR clause Nest BE residual. Read-only audit: `ContractLegalPrintService` clause CRUD + soft-retire + issued guard LIVE; BA-01 NO GAP; FE-SA symmetric HOLD; TPL invent KEY class **does not apply**; **DENY** dual SoT platform catalog. **Option A LOCKED** — mint **`R-PLT-CTR-CL-BE-01`** ACCEPT_AS_IS_P2 HOLD. Rejected UNLOCK_BE and Option C. Honesty flags false · U65 · no `apps/**`. |
| **next_dispatch_prompt** | See evidence file §Handback (PM idle HOLD seal — **no** ba-process dispatch required). |

---

## 9. Traceability

| Requirement | SA seat | BA | BE disposition |
|-------------|---------|-----|----------------|
| AC-PLT-CTR-02 body-as-data | SA-01 Option B | BA-01 CONFIRMED | **BE HOLD `R-PLT-CTR-CL-BE-01`** (LIVE stack) |
| AC-PLT-CTR-CL-01..06 | BA pack | CONFIRMED | Optional QA only |
| BR-CTR-CL-01 snapshot | SA-01 must_keep | AC-03 | RETAIN LIVE guard |
| Q-PLT-01 tokens | SA-01 | AC-05 | RETAIN |
| Printable honesty | PRINTABLE HOLD | AC-H cite | **DENY flip** |

---

## 10. Peer comparison table (why not CTR-TEMPLATE-BE-01?)

| Dimension | CTR-TEMPLATE-BE-01 | CTR-CLAUSE-BE-SA-01 (this seat) |
|-----------|-------------------|--------------------------------|
| Gap type | Consumer free-text when catalog EFF>0 | **No** equivalent — body is library field |
| Invent KEY | **`HRM-CTR-TPL-KEY`** required | **Not required** (FE-SA audit) |
| Service | Template open catalog + freeze code | Dedicated clause library + snapshot |
| BA verdict | BE unlock for KEY wire | **NO GAP** |
| QC | L1 `CTRTPLQA-MSK7U4CG` | **No** clause L1 QC seat — optional PM |
| SA outcome | UNLOCK BE narrow | **HOLD A** |

This table is the **primary** rationale for rejecting Option B without a new FAIL artifact.

---

## 11. Sponsor-facing summary (Vietnamese)

Điều khoản hợp đồng (`body_vi`) **đã** nằm trên Nest (`hrm_contract_clauses`) với đủ API tạo/sửa/kích hoạt/ngưng và cơ chế chặn sửa nội dung đã phát hành. BA xác nhận **không thiếu** lớp BE để build thêm. SA **giữ HOLD** (P2) cho residual BE — **không** mở wave dev-be «invent KEY» kiểu catalog lương/OT/mẫu HĐ, vì sẽ trùng SoT và không khớp nghiệp vụ thư viện điều khoản. Cờ `contracts_printable_ready=false` **giữ nguyên**; slice in/PDF đã LIVE **không** đồng nghĩa module in ấn UAT xong.

---

*End of spec · work_item_id PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BE-SA-01 · SPEC_LEN verified via Shell.*
