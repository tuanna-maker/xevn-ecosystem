# PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01 — Option/F.1 · Catalog mẫu HĐ mở (loại × khối) — ADD

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **NO CODE** `apps/**` · **no seed** · **preserve_default** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock BA AC → (ba-data HOLD default) → API residual only if BA proves gap → Dev |
| **depends_on** | QC-01 GWC Wave-15 UC-BP-CORE-09c **SEALED** — stamp `CORE09CQC1-MSLBXMUT` · evidence `docs/qa/evidence/po-hrm-mvp-gd1-core-09c-cluster-qc-01.md` · peer QA `CORE09CQA-MSLBR3YX` · peer must_keep `CORE09BQC1-MSLB05DZ` · printable **false** · **≠** invent closed-8 TPL DONE |
| **uc_ids** | `UC-BP-CORE-09d` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#18** after CORE-09c (#17 SEALED) |
| **ref_sa_spine** | Peer VER/PDF [`PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09C-CLUSTER-SA-01.md) · pack+PREV [`PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09B-CLUSTER-SA-01.md) · clause [`PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-09A-CLUSTER-SA-01.md) · RD [`PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-08-CLUSTER-SA-01.md) · C&B [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md) · public [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) · CORR open catalog [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md) · [`…-DYNAMIC-LOCK.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) · XEVN-TPL TECHSPEC/API/DATA · print spine TECHSPEC **§ F-CORE-CTR-TPL-*** — **reuse · DENY reopen sealed J-HRM-CORE-09C-01..04 / J-HRM-CORE-09B / 09A / 08/02/01 without regression** |
| **ref_honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · personnel / CORE / CTR module UAT **false** · 16 program honesty flags **false** · **DENY claim CORE-09c VER/PDF = printable module UAT** · **DENY invent printable DONE** · **DENY claim closed-8 TPL DONE** · carry OBS **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** **IN-SCOPE** this seat (TPL `clause_ids` bind) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-09d** · Diễn biến **#1–#11** · **AC-CTR-XEVN-01..11** · **AC-PLT-CTR-01..06** · **AC-PLT-CTR-TPL-01..07+H** · **BR-CTR-TPL-01..07** · **BR-CTR-TPL-DYN-01..04** · **BR-PLT-02..05** · peers CORE-09 · 09a · 09b · 09c (**must_keep**) · FR-UC-BP-PLT-01 pointer (không claim PLT module DONE) |
| **ref_paper_api** | `API_DESIGN` / TECHSPEC **F-CORE-CTR-TPL-01** · **F-CORE-CTR-TPL-02** · **F-CORE-CTR-CFG-01** (org suffix) · RETAIN **F-CORE-CTR-VER-01/02** · **F-CORE-CTR-PDF-01** · RETAIN **F-CORE-CTR-PACK-01** · **F-CORE-CTR-PREV-01** ephemeral · RETAIN **F-CORE-CTR-CL-01..04** · CORR-01 SUPERSEDE closed enum |
| **ref_code** | `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.controller.ts` (`GET/POST/PATCH …/contract-templates*` · `PUT …/clauses` · `POST …/activate`) · `contract-legal-print.service.ts` (`listTemplates` · `createTemplate` · `updateTemplate` · `replaceTemplateClauses` · open catalog · `matrix=xevn` filter · CODE-INVALID format-only) · `contract-legal-print.constants.ts` (starter 8 helper · **≠** ceiling) · tables `hrm_contract_templates` · `hrm_contract_template_clauses` |
| **OUT** | Nest `/core` dual TPL SoT · reinstate closed enum / «reject 9th» · claim CORE-09c = printable UAT · invent printable DONE · DnD layout reorder / DOCX as this FR DONE (SRS OUT) · reopen rewrite CORE-09c/09b/09a/08/02/01 · seed · honesty flip |
| **Honesty** | `recruitment_uat_ready=false` · **`jd_dynamic_done=false`** · **`contracts_printable_ready=false`** · **C-SLICE** · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-16 architecture unlock: **open contract-template catalog** (starter `XEVN_*` examples · Settings 9+ · matrix type×pack · GPLX/term defaults · TPL `clause_ids` bind) vs AS-IS LIVE open catalog |
| **Requestor** | PM · program `PO-HRM-MVP-GD1-CONTINUOUS` · U89 after CORE-09c QC-01 GWC (`CORE09CQC1-MSLBXMUT`) |
| **Date** | 2026-08-09 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-CORE-09d · AC-CTR-XEVN-01..11 · AC-PLT-CTR-01..06 · CORR-01 · DYNAMIC-LOCK · F-CORE-CTR-TPL-* · J-HRM-CTR-04 / J-HRM-CTR-07 DRAFT · must_keep CORE-09c VER/PDF · CORE-09b PACK+PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · Nest `/core` DENY · U19 · carry `R-QA-CORE-09B-CLAUSE-FP-EMPTY` |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE)** | **CORE-09c SEALED (`CORE09CQC1-MSLBXMUT`):** issued VER persist + PDF-from-snapshot · PREV ephemeral · Nest `/core` 0 · **printable false** · **≠** module CORE/CTR UAT · **≠** CORE-09b=printable · **≠** 09d TPL invent DONE. **Carry OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY`:** IT/DRIVER active templates often expose **empty** `clause_ids` / junction → preview clause arrays empty (pack/DRIVER gates still differ). **TPL AS-IS (Nest PRESENT + CORR-01 already in code):** (1) Table `hrm_contract_templates` open catalog (`code` UQ per company · duration/title/`matrix_family` · **no** `CHK code IN (8)`). (2) `GET/POST/PATCH /api/hrm/contracts-insurance/contract-templates*` · `GET …/:id` scope_parity · `POST …/activate` · `PUT …/:id/clauses` → `hrm_contract_template_clauses`. (3) Starter 8 `XEVN_*` = **helper/bootstrap examples** in constants — **not** ceiling; jest proves CREATE 9+ + `matrix=xevn` filters `matrix_family` (**not** `code IN 8`). (4) `HRM-CTR-TPL-CODE-INVALID` = **format/slug only**; invent free-text when EFF>0 → `HRM-CTR-TPL-KEY`; empty catalog → `HRM-CTR-TPL-NONE`. (5) Pack neo starter `*_OFFICE`→`IT_OFFICE` · `*_DRIVER`→`DRIVER`; custom → pack ∈ configured. (6) **No** Nest `@Controller('core')` TPL SoT. (7) VER/PDF / PREV / CL seals **must_keep**. |
| **Paper target** | FR-UC-BP-CORE-09d: picker = **open catalog**; starter 8 = **ví dụ khởi tạo**; Settings **Tạo mẫu 9+** → F5 → chọn trên HĐ/preview; matrix loại×khối drives title/term/GPLX; registry CRUD **không** bắt buộc mẫu (AC-CTR-XEVN-08); freeze `template_code` on issued VER (must_keep 09c); **không** claim printable module UAT. |
| **Gap class** | **fidelity / AC residual on LIVE open TPL spine** — **not** greenfield dual: (1) board #18 needs GĐ1 Option lock + BA AC for U65 catalog 9+ · picker matrix · clause bind; (2) risk reinstate closed-8 / «reject 9th»; (3) risk invent Nest `/core` dual; (4) risk claim CORE-09c VER/PDF = printable DONE; (5) risk ignore OBS empty `clause_ids` (preview empty clauses despite pack gate); (6) reopen sealed J-09C/09B/09A/08/02/01; (7) conflate LIVE TPL API = FR-09d DONE without BA AC / J-CTR-04/07. |
| **Constraints** | U89 continuous · **preserve** CORE-09c VER/PDF · CORE-09b PACK+PREV ephemeral · CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY · CORR-01 open catalog · C-SLICE · DENY claim CORE-09c = printable · DENY invent printable DONE · DENY closed-8 DONE · DENY seed · **cấm code until Option CONFIRMED** · OBS clause-empty **IN-SCOPE** (bind disposition — not invent TPL mega-engine) |
| **Failure impact if unresolved** | Board #18 stalls; Dev reinvents closed enum or `/core` dual; honesty flip; empty IT/DRIVER clause bind persists as silent product gap; regression CORE-09c..01 |

### 1.2 Architecture diagram (target — Option A)

```text
  UC-BP-CORE-01..08 (SEALED)     UC-BP-CORE-09a (SEALED)     UC-BP-CORE-09b (SEALED)
  public · C&B · RD              /contract-clauses*          pack-resolve · PREV ephemeral
  Nest /core DENY                body SoT · snapshot freeze  NO VER INSERT · Nest /core DENY
       │                                │                           │
       └──────────── must_keep ─────────┴───────────────────────────┘
                                         │
  UC-BP-CORE-09c (SEALED CORE09CQC1-MSLBXMUT)
  POST/GET print-versions* · GET …/pdf · snapshot freeze · Nest /core DENY
  printable false · ≠ module UAT · ≠ invent 09d DONE
       │
       │  must_keep RETAIN — DENY claim VER/PDF = printable module UAT
       ▼
  ┌──────────────── FR-UC-BP-CORE-09d (this seat) ─────────────────────────────────┐
  │                                                                                  │
  │  F-CORE-CTR-TPL-01 RETAIN physical                                               │
  │    GET /api/hrm/contracts-insurance/contract-templates (+ :id)                   │
  │    → open catalog all active · matrix=xevn = family filter ONLY (≠ ceiling)      │
  │    → display term/duration/title/matrix_family · template_code↔code alias        │
  │                                                                                  │
  │  F-CORE-CTR-TPL-02 RETAIN physical                                               │
  │    POST/PATCH …/contract-templates · POST …/activate                             │
  │    → CREATE 9+ · CODE-INVALID = format only · DENY reject «not in starter 8»     │
  │    → pack ∈ configured · starter OFFICE/DRIVER matrix neo · soft retire           │
  │                                                                                  │
  │  F-CORE-CTR-TPL-CL bind (residual — OBS)                                         │
  │    PUT …/contract-templates/:id/clauses  → hrm_contract_template_clauses         │
  │    → disposition R-QA-CORE-09B-CLAUSE-FP-EMPTY: Settings/admin bind clause_ids   │
  │       so IT_OFFICE vs DRIVER preview returns non-empty distinct clause sets      │
  │       when library has active clauses (U65 · zero-seed · no invent closed-8)      │
  │                                                                                  │
  │  F-CORE-CTR-CFG-01 RETAIN (orgSuffix) when LIVE present                          │
  │    AC-CTR-XEVN-07 unit remesh · paper alias only                                 │
  │                                                                                  │
  │  Consume must_keep (no rewrite)                                                  │
  │    PREV ephemeral · VER/PDF snapshot · CL body SoT · PACK resolve                │
  │    Registry CRUD nullable template (AC-CTR-XEVN-08)                              │
  │                                                                                  │
  │  CORR-01 / DYNAMIC-LOCK RETAIN                                                   │
  │    starter 8 XEVN_* = examples · catalog open · FORBIDDEN CHK IN(8)              │
  │                                                                                  │
  │  RETAIN: CORE-09c VER/PDF · CORE-09b PACK+PREV · CORE-09a CL · 08 · 02 · 01      │
  │          Nest /core DENY                                                         │
  └──────────────────────────────────────────────────────────────────────────────────┘
       │
       │  OUT this seat
       ▼
  DnD clause reorder / DOCX as FR DONE   = OUT (SRS) · peer PLT later
  Flip contracts_printable_ready         = DENY this SA seat
  Claim CORE-09c VER/PDF = printable UAT = DENY
  Claim closed-8 TPL DONE                = DENY

  DENY: Nest /core dual TPL · reopen sealed J-09C/09B/09A/08/02/01
  Honesty: C-SLICE ≠ recruitment_uat_ready · ≠ jd_dynamic_done · ≠ CORE/CTR UAT
```

**Label lock:** «Chọn mẫu HĐ theo catalog mở» = **open `hrm_contract_templates` + Settings 9+ + matrix defaults + clause bind** — **not** closed enum of 8; not printable module UAT; not VER/PDF reopen; not PREV→INSERT.  
**Spine lock:** Physical prefer `/api/hrm/contracts-insurance/contract-templates*` — paper `/core/…` = **alias only** — **DENY** Nest `/core` second SoT.  
**CORR lock:** Starter 8 = examples — **DENY** `CHK code IN (8)` · **DENY** API/FE «reject 9th».  
**OBS lock:** `R-QA-CORE-09B-CLAUSE-FP-EMPTY` = **IN-SCOPE** residual — bind via `PUT …/clauses` / create+`clause_ids` → junction SoT (prefer over empty `layout_json.clause_ids` alone).  
**Honesty lock:** Slice GWC later **≠** auto-flip `contracts_printable_ready` · **≠** claim CORE-09c VER/PDF = printable DONE · **≠** claim closed-8 TPL DONE · **≠** module CORE/CTR/personnel UAT.

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / API) | AS-IS LIVE | Verdict |
|------------|-------------------|------------|---------|
| Open catalog list | F-CORE-CTR-TPL-01 · AC-CTR-XEVN-01/11 | `GET …/contract-templates` open active | **RETAIN** |
| `matrix=xevn` filter | CORR-01 · TPL-01 | filters `matrix_family` · **not** `code IN 8` | **RETAIN** |
| Create 9th+ | AC-CTR-XEVN-11 · DYN-01/03 | `POST …/contract-templates` accepts custom codes | **RETAIN** / FE AC residual |
| CODE-INVALID | format only | format/slug only · **≠** «not in 8» | **RETAIN** must_keep CORR |
| Starter 8 matrix | XEVN_* examples · term/title/pack | constants + ensure helpers | **RETAIN** examples · **≠** ceiling |
| Clause bind on TPL | AC-PLT-CTR-02 / pack clause set · OBS | `PUT …/clauses` · `clause_ids` on create/update · junction table | **RETAIN** + **UPGRADE fidelity residual** (OBS empty IT/DRIVER) |
| Picker → PREV | AC-CTR-XEVN-02..06/09 | PREV consumes template + pack | **must_keep PREV** · consume |
| Freeze template on VER | AC-PLT-CTR-TPL-03 · BR-PLT-03 | VER denorm `template_*` | **must_keep CORE-09c** |
| Registry without TPL | AC-CTR-XEVN-08 | contracts CRUD nullable template | **must_keep** |
| VER/PDF spine | CORE-09c | print-versions* + pdf | **must_keep RETAIN** — **DENY claim = printable UAT** |
| PACK+PREV ephemeral | CORE-09b | SEALED | **must_keep RETAIN** |
| Clause library | CORE-09a | `/contract-clauses*` SEALED | **must_keep RETAIN** |
| Nest `/core` TPL | paper alias? | **DENY** dual | **DENY** |
| Closed enum 8 | SUPERSEDED CORR-01 | OPEN in code | **DENY reinstate** |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options

### Option A — ACCEPT_AS_IS_RETAIN: LIVE open catalog + starter examples + Settings 9+ + TPL clause_ids bind residual (RECOMMENDED)

| | |
|--|--|
| **Description** | **Preserve** CORE-09c F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 on physical `/contracts-insurance/*` (**DENY** claim VER/PDF = printable module UAT) · CORE-09b F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 **ephemeral** · CORE-09a F-CORE-CTR-CL-01..04 · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY. **Preserve** LIVE Nest **F-CORE-CTR-TPL-01/02** (+ activate + `PUT …/clauses`) as **single open-catalog SoT** under CORR-01 / DYNAMIC-LOCK: starter 8 `XEVN_*` = **examples**; Settings **CRUD 9+**; `CODE-INVALID` = format only; `matrix=xevn` = family filter only. **Disposition OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY`:** IN-SCOPE — BA/Dev residual to **bind** `clause_ids` (Settings → `PUT …/clauses` / create payload) so IT_OFFICE vs DRIVER previews surface **distinct non-empty** clause sets when active clause library exists — **prefer** junction `hrm_contract_template_clauses` as bind SoT; soft empty allowed only when library truly empty (TPL-NONE / CTA) — **DENY** seed · **DENY** invent closed-8 · **DENY** Nest dual. Paper `/core/…` = **alias only**. **OUT** DnD reorder / DOCX as this FR DONE. **DENY** invent printable DONE · reopen sealed J-HRM-CORE-09C-01..04 / 09B / 09A / 08/02/01 · flip honesty flags. |
| **Benefits** | Aligns FR-09d + CORR-01 + LIVE code; unlocks U89 #18 BA; closes carry OBS without greenfield; preserves W10–W15 must_keep; clear printable honesty boundary |
| **Costs** | BA AC O1–O12 + U65 FE Settings/picker residual; ba-data HOLD default (tables LIVE); optional API-01 only if wire gap proven |
| **Risks** | Dev reinstates closed-8 / Nest dual / claims printable — **mitigate:** DENY + O8–O10. Empty clause bind ignored — **mitigate:** O5 OBS disposition |

### Option B — Nest `/core` dual TPL · OR reinstate closed enum / «reject 9th» · OR wipe LIVE templates for second SoT · OR claim CORE-09c VER/PDF = printable DONE

| | |
|--|--|
| **Description** | Implement paper `/api/hrm/core/…/templates` as primary Nest SoT; **or** ship `CHK code IN (8)` / API reject 9th; **or** wipe open catalog for closed helper-only list; **or** treat Wave-15 VER+PDF GWC as printable module UAT. |
| **Benefits** | Illusion of paper-path purity / false printable DONE |
| **Costs** | Dual writers · CORR-01 break · Nest `/core` DENY break · honesty break · U89 delay |
| **Risks** | Regression CORE-09c..01 · sponsor DYNAMIC-LOCK violation — **REJECT** |

### Option C — HOLD / LIVE TPL = FR-09d DONE / closed-8 DONE / honesty flip / reopen sealed / ignore OBS

| | |
|--|--|
| **Description** | Treat LIVE TPL API or starter constants as FR-UC-BP-CORE-09d complete without BA AC; or HOLD board; or claim closed-8 TPL DONE; or flip `contracts_printable_ready` / recruitment / personnel UAT; or reopen sealed J-HRM-CORE-09C/09B/09A/08/02/01; or leave `R-QA-CORE-09B-CLAUSE-FP-EMPTY` without disposition. |
| **Benefits** | Short-term idle |
| **Costs** | AC-CTR-XEVN-11 unmet; OBS remains product gap; board #18 false DONE or stuck; violates U89 + honesty |
| **Risks** | C-SLICE violation · sponsor idle — **REJECT** |

---

## 4. Trade-off Matrix

| Criteria | Weight | Option A | Option B | Option C |
|----------|-------:|:--------:|:--------:|:--------:|
| Business value (FR-CORE-09d + AC-CTR-XEVN-01/11 + OBS bind) | 25 | **9** | 3 | 2 |
| Time to deliver (U89 continuous) | 20 | **9** | 2 | 1 |
| Complexity / blast radius | 15 | **9** | 2 | 6 |
| Security / CORR open + CORE-01·02·08·09a·09b·09c + U19 | 15 | **9** | 2 | 2 |
| Reliability (ONE TPL SoT · no closed enum · no PREV rewrite) | 15 | **9** | 2 | 2 |
| Maintainability (RETAIN LIVE · Nest DENY · peer seals) | 10 | **9** | 2 | 2 |
| **Weighted (≈)** | 100 | **9.00** | **2.15** | **2.35** |

---

## 5. Failure Modes and Mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Nest `/core/…/templates` as second SoT | Grep routes | **DENY** dual Nest; paper = alias only |
| A | Reinstate closed-8 / reject 9th | Jest + U65 AC-11 | **DENY** · CORR-01 must_keep · O3 |
| A | Ignore empty IT/DRIVER `clause_ids` | Preview clause arrays | **O5** OBS disposition · PUT clauses bind |
| A | Claim CORE-09c VER/PDF = printable UAT | Review honesty | **DENY** · O9 |
| A | Invent printable DONE / flip ready flags | QC honesty | **DENY** · O10 |
| A | Rewrite PREV to INSERT VER / reopen VER/PDF | Diff seals | **DENY reopen** · must_keep 09c/09b |
| A | FE hardcode picker = 8 only | Browser | AC-CTR-XEVN-01/11 · open list API |
| A | Seed to fill clause_ids | QA evidence | **DENY** seed U65 |
| A | DnD/DOCX claimed DONE | Scope | **OUT** O8 |
| B | Dual SoT / closed enum / printable false claim | Integration | Reject B |
| C | Board idle / false DONE / OBS orphan | U89 | Reject C |

---

## 6. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE open `contract-templates*` + Settings 9+ + starter `XEVN_*` examples + `PUT …/clauses` bind residual for OBS; paper `/core` alias only; **RETAIN** CORE-09c VER/PDF · CORE-09b PACK+PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · Nest `/core` DENY · CORR-01; **DENY** closed enum / claim printable / reopen seals |
| **Why selected** | AS-IS already implements CORR-01 open catalog, 9+ create, format-only CODE-INVALID, matrix family filter, and clause junction bind; residual is **GĐ1 BA AC + U65 Settings/picker + OBS clause_ids bind fidelity** under U89 — not greenfield Nest dual, not closed-8 reinstate, not printable invent; preserves W10–W15 must_keep; unlocks board #18 |
| **Assumptions** | CORE-09c F-CORE-CTR-VER/PDF **SEALED RETAIN** (`CORE09CQC1-MSLBXMUT` · QA `CORE09CQA-MSLBR3YX`). CORE-09b PACK+PREV **RETAIN** (`CORE09BQC1-MSLB05DZ`). CORE-09a CL **RETAIN** (`CORE09AQC1-MSLA4LX9`). CORE-08/02/01 stamps **RETAIN**. Nest `/core` DENY **RETAIN**. CORR-01 / DYNAMIC-LOCK **RETAIN**. `contracts_printable_ready=false` · `jd_dynamic_done=false` · `recruitment_uat_ready=false`. OBS clause-empty **IN-SCOPE**. |
| **Rejected** | **B** — Nest `/core` dual / closed enum / wipe TPL / claim CORE-09c=printable · **C** — HOLD / LIVE=FR-09d DONE / closed-8 DONE / honesty flip / reopen sealed / ignore OBS |

### 6.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|----------------------|-----------------|
| **O1** | Physical path | Prefer `GET/POST/PATCH …/contract-templates*` · `PUT …/:id/clauses` · `POST …/activate`; any `/core/…` = alias / DOC-DELTA only — **DENY** Nest `/core` dual | Cite Network paths Settings + HĐ picker |
| **O2** | Open catalog | Default list = all active; starter 8 **may** appear; **>8** after AC-11 PASS; soft warn missing starter **must not** block create | AC-CTR-XEVN-01 · AC-PLT-CTR-06 · DYN-01/02 |
| **O3** | Create 9+ / CODE-INVALID | Accept HR code + pack ∈ configured; `CODE-INVALID` = format/slug only — **DENY** «not in starter 8»; invent free-text on draft when EFF>0 → `HRM-CTR-TPL-KEY` class | AC-CTR-XEVN-11 · AC-PLT-CTR-TPL-01/04 |
| **O4** | Matrix type×pack | Starter neo OFFICE↔IT_OFFICE · DRIVER↔DRIVER; term/duration/title defaults; OFFICE **no** GPLX · DRIVER **GPLX required** for issue/PDF | AC-CTR-XEVN-02..06/09 · BR-CTR-TPL-03/04 |
| **O5** | OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` | **IN-SCOPE:** Settings bind `clause_ids` via `PUT …/clauses` (junction SoT) so IT vs DRIVER preview clause sets **differ and non-empty** when library has active clauses; empty only if library empty + CTA — **DENY** seed · **DENY** invent closed-8 as “fix” | AC matrix + residual close criteria |
| **O6** | FE after 2xx | Settings create 9th → list + **F5 còn** → HĐ picker chọn được → PREV bind pack/title/term → F5 còn `template_code` if attached | AC-CTR-XEVN-11 · U65 |
| **O7** | Registry must_keep | Create/edit/F5 sổ HĐ **without** template still PASS (AC-CTR-XEVN-08) | AC-PLT-CTR-TPL-06 |
| **O8** | Peers OUT / must_keep | DnD reorder / DOCX OUT this FR; CORE-02b / ATT / PAY OUT; **must_keep** CORE-09c VER/PDF · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest DENY | Scope note |
| **O9** | CORE-09c printable boundary | **DENY** claim Wave-15 VER+PDF = printable module UAT · **DENY** invent printable DONE · freeze `template_code` on issued VER still must_keep | Footer · AC-PLT-CTR-TPL-H |
| **O10** | Honesty | All flags false · C-SLICE · **DENY** flip `recruitment_uat_ready` / `jd_dynamic_done` / `contracts_printable_ready` / module CORE·personnel·CTR UAT · **DENY** claim closed-8 TPL DONE | Footer every evidence |
| **O11** | Display-ready | TPL DTO: `code`/`template_code` · pack label VI · term · duration · title_print_vi · matrix_family · status · clause_ids[] display-ready | FE bind |
| **O12** | Journeys | DRAFT promote `J-HRM-CTR-04` · `J-HRM-CTR-07` (+ optional `J-HRM-CORE-09D-01..0n` aliases) — picker matrix · Settings 9+ → picker → PREV · Nest `/core` 0 · seals regression · OBS clause bind | BA mint / map |

### 6.2 must_keep / DENY

| Class | Rule |
|-------|------|
| **must_keep** | LIVE `…/contract-templates*` open catalog · `PUT …/clauses` · activate · CORR-01 / DYNAMIC-LOCK (starter ≠ ceiling · CODE-INVALID format-only) · LIVE `POST/GET …/print-versions*` · `GET …/pdf` (CORE-09c) · LIVE `GET …/pack-resolve` · `POST …/preview` **ephemeral** (CORE-09b) · LIVE `/contract-clauses*` (CORE-09a) · LIVE `/employees/:id/rewards*` + `/discipline*` + payroll_link (CORE-08) · compensation-packages* + eins · **`HRM-CORE-CB-AUTHZ-403`** · **`HRM-CORE-CB-403`** · CORE-01 public strip · Nest `/core` DENY · employee_contracts registry CRUD nullable template · soft-delete · `resolveHrmListScope` U19 · stamps **`CORE09CQC1-MSLBXMUT`** · **`CORE09BQC1-MSLB05DZ`** · **`CORE09AQC1-MSLA4LX9`** · **`CORE08QC1-MSL9BFFE`** · **`CORE02QC1-MSL80DU6`** · **`CORE01QC1-MSL6WMS7`** · REC seals · honesty false |
| **DENY invent** | Nest `/api/hrm/core/**` as **second** TPL SoT · closed enum / `CHK code IN (8)` / API·FE «reject 9th» · reopen rewrite CORE-09c VER/PDF · reopen rewrite CORE-09b PREV→INSERT · reopen rewrite CORE-09a CL · claim CORE-09c VER/PDF = printable module UAT · invent printable DONE · claim closed-8 TPL DONE · flip `contracts_printable_ready` / `jd_dynamic_done` / `recruitment_uat_ready` · seed · reopen sealed J-HRM-CORE-09C/09B/09A/08/02/01 without regression |
| **OUT** | DnD clause reorder as FR DONE · DOCX as primary template SoT · CORE-05/06/07 · ATT · CORE-02b · PAY · FR-PLT-01 full platform DONE |
| **HOLD peer** | `contracts_printable_ready` (until named printable QA/QC) · recruitment module UAT · personnel / CORE / CTR module UAT · `payroll_e2e_ready` · `R-PLT-JD-DYNAMIC-DONE-01` |
| **Honesty** | All flags **false** until named waves · **C-SLICE** |

### 6.3 Sealed peers (RETAIN — do not reopen)

| Wave | Stamp / residual | Rule |
|------|------------------|------|
| W1–W9 REC | prior GWC stamps | RETAIN |
| W10 CORE-01 | stamp **`CORE01QC1-MSL6WMS7`** | RETAIN — **DENY reopen without regression** |
| W11 CORE-02 | stamp **`CORE02QC1-MSL80DU6`** | RETAIN — packages **≠** CORE pillar DONE |
| W12 CORE-08 | stamp **`CORE08QC1-MSL9BFFE`** | RETAIN — RD **≠** print · **≠** CORE pillar DONE |
| W13 CORE-09a | stamp **`CORE09AQC1-MSLA4LX9`** · J-HRM-CORE-09A-01..04 | RETAIN — **DENY reopen rewrite** · CL **≠** printable DONE |
| W14 CORE-09b | stamp **`CORE09BQC1-MSLB05DZ`** · J-HRM-CORE-09B-01..04 | RETAIN — PREV ephemeral **must_keep** · pack+PREV **≠** printable DONE · OBS carried **into this seat** |
| W15 CORE-09c | stamp **`CORE09CQC1-MSLBXMUT`** · QA `CORE09CQA-MSLBR3YX` · J-HRM-CORE-09C-01..04 | RETAIN — **DENY reopen** · VER/PDF **≠** printable module UAT · **≠** invent 09d DONE |
| Print honesty | `contracts_printable_ready=false` | **DENY flip** this SA |

### 6.4 OBS disposition — `R-QA-CORE-09B-CLAUSE-FP-EMPTY`

| | |
|--|--|
| **Signal** | IT/DRIVER active templates → preview `clauses[]` empty (`layout.clause_ids` / junction empty) while pack/DRIVER gates still differ |
| **Class** | PRODUCT **P2** carry from CORE-09b/09c → **UC-BP-CORE-09d** |
| **Option A disposition** | **IN-SCOPE residual** for this cluster — **not** invent closed-8 DONE · **not** invent printable UAT · **not** reopen CL body SoT rewrite |
| **Technical prefer** | Bind via `PUT /api/hrm/contracts-insurance/contract-templates/:id/clauses` (and/or create/update `clause_ids`) writing **`hrm_contract_template_clauses`**; PREV/PACK resolve reads junction (RETAIN CORE-09b consume path) |
| **PASS when (BA→QA)** | After Settings bind (U65 · zero-seed): same employee, switch IT_OFFICE ↔ DRIVER → preview clause sets **non-empty and distinct** when active clauses exist for packs; empty only if library empty + CTA |
| **DENY** | Seed clause rows to pass · FE hardcode legal text · Nest `/core` dual · claim OBS closed = printable DONE |

---

## 7. F.1 API map (intent — unlock BA; physical lock at API-01 if residual)

| Cap | F-id | change | Physical prefer (Option A) | Paper alias | SRS bước |
|-----|------|--------|----------------------------|-------------|----------|
| List/get templates | **F-CORE-CTR-TPL-01** | **RETAIN** (+ FE AC residual) | `GET /api/hrm/contracts-insurance/contract-templates` · `GET …/:templateId` | `/core/…` alias only | FR-CORE-09d Diễn biến **#1** · AC-CTR-XEVN-01/10/11 |
| Upsert/activate | **F-CORE-CTR-TPL-02** | **RETAIN** (+ FE AC residual) | `POST/PATCH …/contract-templates` · `POST …/:id/activate` | alias | **#8** · AC-CTR-XEVN-11 · DYN-03 |
| Bind clauses on TPL | **F-CORE-CTR-TPL-02** (clauses sub) | **RETAIN** + **OBS residual** | `PUT …/contract-templates/:id/clauses` | alias | **#2–#4** · O5 · AC-PLT-CTR-02 pointer |
| Org suffix CFG | **F-CORE-CTR-CFG-01** | **RETAIN** if LIVE | company-settings orgSuffix path LIVE | alias | AC-CTR-XEVN-07 · BR-CTR-TPL-05 |
| Pack resolve | **F-CORE-CTR-PACK-01** | **RETAIN SEALED** | `GET …/contracts/pack-resolve` | alias | FR-CORE-09b — **must_keep** |
| Merge preview | **F-CORE-CTR-PREV-01** | **RETAIN SEALED ephemeral** | `POST …/contracts/:id/preview` | alias | FR-CORE-09b — **must_keep · DENY INSERT VER** |
| Save print version | **F-CORE-CTR-VER-01** | **RETAIN SEALED** | `POST …/print-versions` | alias | FR-CORE-09c — **must_keep · ≠ printable UAT** |
| List/get versions | **F-CORE-CTR-VER-02** | **RETAIN SEALED** | `GET …/print-versions*` | alias | FR-CORE-09c — **must_keep** |
| PDF / print | **F-CORE-CTR-PDF-01** | **RETAIN SEALED** | `GET …/print-versions/:versionId/pdf` | alias | FR-CORE-09c — **must_keep · ≠ printable UAT** |
| Clause library | **F-CORE-CTR-CL-01..04** | **RETAIN SEALED** | `/contracts-insurance/contract-clauses*` | alias | FR-CORE-09a — **must_keep** |
| Registry CRUD | **F-CORE-CTR-01** family | **RETAIN** | `/contracts-insurance/contracts*` | — | AC-CTR-XEVN-08 |
| CORE-08 RD | **F-CORE-RD-01** | **RETAIN SEALED** | `/employees/:id/rewards*` + `/discipline*` | alias | FR-CORE-08 — **≠ 09d** |
| CORE-02 C&B | **F-CORE-EMP-02** | **RETAIN SEALED** | compensation-packages* | alias | FR-CORE-02 |
| CORE-01 public | **F-CORE-EMP-01** | **RETAIN SEALED** | `/api/hrm/employees*` | alias | FR-CORE-01 |

**Wire codes (RETAIN — no invent rewrite):** `HRM-CTR-TPL-200/201` · `HRM-CTR-TPL-CODE-INVALID` (format only) · `HRM-CTR-TPL-PACK-MISMATCH` · `HRM-CTR-TPL-KEY` · `HRM-CTR-TPL-NONE` · `HRM-CTR-TPL-404` · `HRM-CTR-CL-404` · RETAIN PREV/PACK/VER/PDF/CL/CORE-08/02/01 codes.

**U19:** template list ↔ get-by-id ↔ activate ↔ put-clauses = **same** contracts-insurance / hrm list-scope resolver family as pack-resolve + preview + print-versions.

**Serializer / boundary rule:** Template responses **MAY** include `clause_ids` + metadata display-ready. Public `/employees*` **MUST NOT** grow C&B dumps. Preview **MUST NOT** persist issued snapshot (CORE-09b). CORE-09d seat **MUST NOT** flip printable readiness or claim CORE-09c VER/PDF = printable module UAT.

**F.1 TPL-01 purpose (lock):**
1. **Mục đích** — Cấp danh sách/chi tiết mẫu hiệu lực (catalog mở) cho Cài đặt + picker HĐ.
2. **Nghiệp vụ xử lý** — Scope; filter status/pack; `matrix=xevn` → `matrix_family` only; exclude archived; empty `[]` = 200 + CTA.
3. **Bước SRS** — FR-UC-BP-CORE-09d Diễn biến **#1** · AC-CTR-XEVN-01/11.

**F.1 TPL-02 purpose (lock):**
1. **Mục đích** — Tạo/sửa/activate mẫu thứ 9+; gắn gói · term · title · `clause_ids`.
2. **Nghiệp vụ xử lý** — Validate format + UQ + pack ∈ configured; **DENY** closed-8 reject; optional `replaceTemplateClauses`; soft retire.
3. **Bước SRS** — FR-UC-BP-CORE-09d Diễn biến **#8** · AC-CTR-XEVN-11 · O5 OBS bind.

**F.1 CFG-01 purpose (lock):**
1. **Mục đích** — Hậu tố số HĐ / remesh đơn vị (AC-CTR-XEVN-07).
2. **Nghiệp vụ xử lý** — company settings orgSuffix; scope remesh Bên A.
3. **Bước SRS** — FR-UC-BP-CORE-09d Diễn biến remesh đơn vị · BR-CTR-TPL-05/06/07.

---

## 8. ba-data / API unlock ladder

```text
SA-01 Option A CONFIRMED (this seat)
  → ba-process BA-01 AC (O1–O12 + OBS O5) CONFIRMED
  → ba-data DATA-01 HOLD default (tables LIVE: hrm_contract_templates + hrm_contract_template_clauses + XEVN cols)
       └─ conditional UNLOCK only if BA proves physical column gap for TPL matrix/bind fields
  → sa API-01 F.1 physical LOCK only if BA/QA prove residual wire gap
       └─ else RETAIN cite F-CORE-CTR-TPL-01/02 (+ CFG-01) → Dev FE Settings/picker + clause bind fidelity
  → Dev BE (HOLD unless residual) + FE-01 open catalog U65
  → QA U65 · QC GWC C-SLICE
```

**cấm code** `apps/**` until BA (+ DATA when required) + API contracts CONFIRMED per program gate.  
**cấm** honesty flip / Nest `/core` dual / reopen sealed CORE-09c/09b/09a/08/02/01 / claim CORE-09c = printable / claim closed-8 TPL DONE / invent printable DONE.

---

## 9. Validation / acceptance evidence plan (for BA→QA)

| Layer | PASS when |
|-------|-----------|
| L0 | Stack health |
| L1 | GET templates open catalog · POST 9th 2xx · CODE-INVALID on bad format only · PUT clauses binds junction · PREV IT vs DRIVER clause sets differ when bound · Nest `/core` DENY · CORE-09c VER/PDF + CORE-09b PREV ephemeral + CORE-09a CL + CORE-08/02/01 still PASS · registry without template still 2xx |
| L2.5 J-* | Settings tạo mẫu 9+ → F5 → picker HĐ chọn được → PREV title/term/GPLX matrix · Nest `/core` 0 · no CORE-09c/09b/09a/08/02/01 regression · OBS clause bind PASS when library has clauses |
| L3 QC | GWC C-SLICE only · honesty false · DENY module CORE/personnel/CTR UAT · DENY auto-flip `contracts_printable_ready` · DENY claim CORE-09c VER/PDF = printable DONE · DENY claim closed-8 TPL DONE · DENY reopen J-HRM-CORE-09C/09B/09A/08/02/01 without regression |

**Proposed journeys (DRAFT for BA):**  
`J-HRM-CTR-04` (paper) / `J-HRM-CORE-09D-01` — chọn mẫu starter/matrix → PREV khác nhau (OFFICE vs DRIVER · 12M vs 24M · thử việc vs HĐLĐ).  
`J-HRM-CTR-07` / `J-HRM-CORE-09D-02` — Settings tạo mẫu 9+ → F5 → picker → PREV.  
`J-HRM-CORE-09D-03` — OBS clause bind IT↔DRIVER non-empty distinct (when library has clauses) · Nest `/core` 0.  
`J-HRM-CORE-09D-04` — registry without template F5 · seals CORE-09c/09b/09a/08/02/01 must_keep · printable=false.

---

## 10. Completion

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-CORE-09d: RETAIN LIVE open catalog **F-CORE-CTR-TPL-01/02** (+ `PUT …/clauses` · activate · CFG-01) on `/contracts-insurance/contract-templates*` under **CORR-01/DYNAMIC-LOCK** (starter 8 = examples · Settings 9+ · CODE-INVALID format-only · `matrix=xevn` ≠ ceiling); **IN-SCOPE** disposition **`R-QA-CORE-09B-CLAUSE-FP-EMPTY`** via junction `clause_ids` bind residual; **must_keep** CORE-09c VER/PDF (**DENY** claim = printable UAT) · CORE-09b PACK+PREV ephemeral · CORE-09a CL · CORE-08 RD+payroll_link · CORE-02 AuthZ/CB-403 · CORE-01 public · Nest `/core` DENY; **DENY** closed enum / «reject 9th» · invent printable DONE · claim closed-8 TPL DONE · reopen sealed J-HRM-CORE-09C/09B/09A/08/02/01; REJECT B Nest dual/closed-enum/printable-claim + C HOLD/LIVE=DONE/ignore-OBS; unlock **ba-process** BA-01; **no** `apps/**`; honesty false · C-SLICE · `contracts_printable_ready=false`. |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09d
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-SA-01.md · peer QC CORE09CQC1-MSLBXMUT · must_keep CORE09BQC1-MSLB05DZ
spec_ref: SRS FR-UC-BP-CORE-09d · AC-CTR-XEVN-01..11 · AC-PLT-CTR-01..06 · AC-PLT-CTR-TPL-01..07+H · CORR-01 · DYNAMIC-LOCK · F-CORE-CTR-TPL-01/02 · F-CORE-CTR-CFG-01 · must_keep F-CORE-CTR-VER-01/02 + F-CORE-CTR-PDF-01 · F-CORE-CTR-PACK-01 + F-CORE-CTR-PREV-01 ephemeral · F-CORE-CTR-CL-01..04 · SA O1–O12 · OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY

MISSION — BA AC pack (narrow):
1) Confirm O1–O12 under Option A — physical GET/POST/PATCH contract-templates* + PUT …/clauses · open catalog · Settings 9+ · CODE-INVALID format-only · matrix type×pack · GPLX/term defaults · Nest /core 0
2) AC matrix U65: AC-CTR-XEVN-01..11 (+ PLT-CTR / TPL-* as needed) · Settings tạo mẫu 9→F5→picker→PREV · OFFICE vs DRIVER · registry without template
3) Disposition OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY — AC for TPL clause_ids bind (junction SoT) so IT↔DRIVER preview clauses non-empty+distinct when library has active clauses (zero-seed)
4) Mint/map DRAFT J-HRM-CTR-04 · J-HRM-CTR-07 (+ optional J-HRM-CORE-09D-01..04) · must_keep CORE-09c VER/PDF · CORE-09b PREV ephemeral · CORE-09a CL · CORE-08 · CORE-02 · CORE-01 · Nest /core DENY
5) DENY closed enum / reject 9th · DENY claim CORE-09c VER/PDF = printable UAT · invent printable DONE · claim closed-8 TPL DONE · contracts_printable_ready flip · reopen sealed J-HRM-CORE-09C/09B/09A/08/02/01 · seed · apps/**

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md · PASS_TO_PM · next ba-data HOLD default (or sa API-01 if residual)
```
