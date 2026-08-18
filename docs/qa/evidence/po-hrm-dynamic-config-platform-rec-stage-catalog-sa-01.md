# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — Option/F.1 narrow **AC-PLT-REC-STAGE-01** (consumer picker when Nest `rec_pipeline_stage` ≠ empty) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01` DOC-DELTA **ACCEPT** · U88 |
| **ref_peer_emp** | EMP DOC/ET open catalog |
| **ref_peer_dec** | DEC decision-types |
| **ref_peer_pay** | PAY Nest salary_components Option B · AC-PLT-PAY-01 |
| **ref_peer_att** | ATT Nest leave Option B · AC-PLT-ATT-LEAVE-01 |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md) |
| **Verdict** | **CONFIRMED** — Option **B** LOCKED |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD Option/F.1 · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · no UF invent |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · DENY REC UX QC process / JD DnD / IV one-active reopen · DENY reopen EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS · DENY module REC UAT |

### Honesty locks (mandatory)

| Flag | Value | SA note |
|------|-------|---------|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`jd_dynamic_done`** | **`false`** | retained — JD DnD OUT of this AC |
| **REC UX QC process** (`po-hrm-rec-ux-qc-process-01`) | **SEAL RETAIN** (process NO-GO) | **cấm reopen** without warrant |
| **JD DnD · IV one-active · YCTD · hire→EMP** | **SEAL RETAIN** | **cấm reopen** |
| **REC-QC-01 L1 · REC-QC-02 browser** | **SEAL RETAIN** | AC-PLT-REC-02..05 stamp `RECPLATQA2-MSIXNFE2` retained |
| **`payroll_e2e_ready`** | **`false`** | retained |
| **EMP · DEC · PAY · ATT · EXT · CTR · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module REC UAT / Phase1** | **DENIED** | Slice Option ≠ module GO |
| **Seed** | **DENIED** (U65) | |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| REC vertical F.1 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` F-REC-CAT-STG/EFF · L-REC-CAT-* · AC-PLT-REC-02..05 |
| REC DATA / BE / FE / QA / QC | DATA-01 · BE-01 · FE-01 · QA-02 · QC-01/02 GWC SEAL stamp `RECPLATQA2-MSIXNFE2` |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` BR-PLT-02/04/05/06 · REC §2.2 |
| SRS pipeline | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-05** («Theo danh mục pipeline đơn vị») · **05a** · **06/06a/06b** · **07** · JD **00a–00c OUT** |
| TechSpec | `TECHSPEC_HRM_ENTERPRISE.md` FR-UC-BP-REC-05/06/07 → F-REC-APP-* · F-REC-HIRE-01 |
| API | `API_DESIGN_HRM_ENTERPRISE.md` F-REC-APP-02 · UV-YCTD · HIRE · program F-REC-CAT-* |
| DB | `DB_DESIGN_HRM_ENTERPRISE.md` §2.4a `rec_pipeline_stage` · §2.5 application.stage · §2.6 history |
| ADR | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` Option B REC row |
| Peer ATT leave | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md` Option B AC-PLT-ATT-LEAVE-01 |
| Peer PAY | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md` Option B AC-PLT-PAY-01 |
| Peer EMP / DEC | EMP-VERTICAL · DEC-VERTICAL consumer assert when catalog >0 |
| Nest AS-IS | `RecPipelineStageService` · `HRM-REC-STAGE-UNKNOWN` · controller `pipeline-stages/effective` · APP-02 wire |
| Parent U88 | ATT-LEAVE-CATALOG-DOCS-01 ACCEPT → this REC stage catalog SA |

**Prior note:** REC-VERTICAL unlocked physical + F.1 → already shipped + QC. This seat owns **AC-PLT-REC-STAGE-01 consumer Option** (peer ATT-LEAVE / PAY-CATALOG) — does **not** reopen REC API F.1 / seals.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md) | Option A/B/C · trade-off · **B LOCKED** · L-REC-STAGE-01..10 · AC/VAL matrix · ba-data HOLD · ba-process UNLOCK · BE HOLD |

**Không đụng:** `apps/**` · seed · flip `recruitment_uat_ready` · reopen REC UX process / JD / IV · reopen EMP/DEC/PAY/ATT seals.

---

## 3. Option summary

| Option | Verdict |
|--------|---------|
| **A** Settings MD / starter-six = sole picker SoT | **REJECT** — dual orphan / PAY O4 class |
| **B** Nest `rec_pipeline_stage` via F-REC-CAT-STG/EFF = code SoT; consumer picker when ≠ empty; admin CREATE open N+1; invent → `HRM-REC-STAGE-UNKNOWN` | **LOCKED / CONFIRMED** |
| **C** Invent recruitment_uat / reopen UX process·JD·IV / mega table | **REJECT** |

**Weighted score:** A 66 · **B 111** · C 24.

---

## 4. Architecture locks (machine-readable)

| Lock | Rule |
|------|------|
| L-REC-STAGE-01 | Admin CREATE open N+1 ≠ consumer free-text when EFF>0 |
| L-REC-STAGE-02 | Nest F-REC-CAT-STG/EFF = sole code SoT (not MD/six alone) |
| L-REC-STAGE-03 | WF ops map ≠ second SoT |
| L-REC-STAGE-04 | Empty catalog → empty picker; no fake UF rows |
| L-REC-STAGE-05 | Soft-delete; history keys intact |
| L-REC-STAGE-06 | scope_parity U19 |
| L-REC-STAGE-07 | Invent → `HRM-REC-STAGE-UNKNOWN` |
| L-REC-STAGE-08 | JD / IV / YCTD flags / eval / REC-03 OUT |
| L-REC-STAGE-09 | Seals retain (REC-QC · peers · UX process · JD · IV) |
| L-REC-STAGE-10 | Honesty false · C-SLICE ≠ module |

---

## 5. Gate matrix

| Gate | Status |
|------|--------|
| ba-process AC pack | **UNLOCK** → `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01` |
| ba-data physical EXPAND | **HOLD** (unless BA proves column gap) |
| BE consumer deepen | **HOLD** until BA CONFIRMED |
| FE rebind | After BA only if MD/six sole bind found |
| QA / QC | After BA (+ BE/FE if needed) · U65 · no UAT flip |

---

## 6. Peer Nest REC codes (cite — do not reopen)

| Code family | Nest path | This seat |
|-------------|-----------|-----------|
| Pipeline stages | `rec_pipeline_stage` · F-REC-CAT-STG/EFF | **OWN** AC-PLT-REC-STAGE-01 |
| JD FormSchema | `rec_jd_*` | **RETAIN OUT** |
| IV one-active | interview schedule spine | **RETAIN OUT** |
| YCTD flags | `pipeline_flags_json` | **≠** stage catalog |
| Eval template | R-PLT-REC-04 later | **OUT** |

---

## 7. SRS / TechSpec cite (stage / application / JD-adjacent)

| Path | Role in this seat |
|------|-------------------|
| **FR-UC-BP-REC-05** | Pipeline transition «Theo danh mục pipeline đơn vị» → Nest EFF picker |
| **FR-UC-BP-REC-05a** | UV create/update — initial stage consumer surface (BA enumerate) |
| **FR-UC-BP-REC-06 / 06a** | IV inside pipeline — allow flag soft-gate only; one-active must_keep |
| **FR-UC-BP-REC-07** | Hire → `is_hired_outcome` key must_keep |
| **FR-UC-BP-REC-00a–00c** | JD FormSchema — **adjacent OUT** (AC-PLT-REC-01) |
| TechSpec F-REC-APP-* / F-REC-HIRE-01 | Consumer TXN deepen source only |
| F-REC-CAT-STG/EFF (program) | Authoritative catalog F.1 already CONFIRMED |

---

## 8. completion_report

**Closed:** Option **B** LOCKED for **AC-PLT-REC-STAGE-01** — Nest `rec_pipeline_stage` via F-REC-CAT-STG/EFF = authoritative open stage catalog; Settings admin CREATE remains open N+1; consumers must pick when effective ≠ empty; invent → `HRM-REC-STAGE-UNKNOWN`; Settings MD / starter-six alone **REJECT** as SoT; invent `recruitment_uat_ready` / reopen REC UX QC process · JD DnD · IV one-active **REJECT**; ba-data **HOLD**; ba-process **UNLOCK**; BE **HOLD** until BA; peer EMP/DEC/PAY/ATT pattern aligned; REC-VERTICAL/QC seals **RETAIN**; docs-only · no `apps/**` · no seed · `C-SLICE-≠-MODULE` · DENY module REC UAT.

**Residual:** ba-process must emit AC-PLT-REC-STAGE-01* + VAL-REC-CNS-* surface inventory (APP-02 · UV initial stage · kanban · hire · IV allow soft-gate); ba-data only if physical EXPAND proven; BE deepen only for BA gaps.

---

## 9. Handoff contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **next_owner** | **pm** → **ba-process** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-sa-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01
from_role: pm
to_role: ba-process
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01 CONFIRMED Option B
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD

## task
CONFIRMED AC pack for AC-PLT-REC-STAGE-01 / 01b / 01c / 01d / 01H + VAL-REC-CNS-* peer ATT-LEAVE / PAY:
- Nest F-REC-CAT-STG/EFF = stage_key SoT; admin CREATE open N+1 RETAIN (REC-QC-02)
- Consumers (APP-02 transition · UV initial stage · kanban · hire · IV allow soft-gate if in-scope) picker when EFF>0
- invent → HRM-REC-STAGE-UNKNOWN (align AC-PLT-REC-04)
- Enumerate exact UF/J-* click paths + FE bind source (EFF vs MD/six)
- ba-data HOLD unless column EXPAND proven; BE HOLD until this BA CONFIRMED
- Cite SA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-ba-01.md
- Spec out: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md

## must_keep / honesty / cấm
recruitment_uat_ready=false · jd_dynamic_done=false · REC UX QC process / JD DnD / IV one-active / REC-QC-01/02 RETAIN
EMP/DEC/PAY/ATT/EXT/CTR/LIST-TOTALS RETAIN · no apps/** · no seed · C-SLICE-≠-MODULE · DENY module REC UAT

## exit
PASS_TO_PM · CONFIRMED · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```
