# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-SA-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **Date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `payroll_e2e_ready=false` · no LIVE · no `apps/**` · no Phase1 DONE |

---

## 1. read_first ack

| # | Artifact | Verdict used |
|---|----------|--------------|
| 1 | `DECISION_PACKET_Q_PAY_FORMULA.md` | **ANSWERED** — dual-control 2 bước; **R-PAY-DD-01** Form GĐ1 + DnD GĐ2; **Q-PAY-F-3** chỉ bảng công chốt |
| 2 | `ADR-HRM-4-PILLAR-API-BOUNDARY.md` §10 | Option **A** dual-control metadata engine — **KEEP**; status header was stale «SA Recommended» → APPEND pointer (this wave) |
| 3 | `ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` | Option **B** — PAY vertical = `salary_components` / `pay_types` open catalog + FormSchema; **no FE net** |
| 4 | `TECHSPEC_HRM_ENTERPRISE.md` §7 PAY | P1–P6 meeting-locked; `F-PAY-PROCESS-01` runtime eval bind; **F-PAY-FORMULA-* author HOLD** (stale reason «chờ confirm» → unlock = product fidelity docs, not workshop) |
| 5 | `API_DESIGN_HRM_ENTERPRISE.md` §4 / `DB_DESIGN` §5.3 | Process F.1 DRAFT; `pay_formula_definition` pointer + `expression_json` **opaque**; author F.1 HOLD |
| 6 | Evidence synth-pay-tech/db/api + `po-hrm-bp-adr-q-pay-formula-01.md` | Meeting HOLD superseded; residual was R-BP-FORMULA-CONFIRM — **paper now closed**; residual = **ship fidelity** |
| 7 | Platform TECHSPEC PAY row | Interface map GĐ1; DnD formula = GĐ2; AC-PLT-PAY-01 picker from catalog |

**Explicit:** Sponsor **Q-PAY-FORMULA already ANSWERED**. **Do NOT re-ask workshop.** Residual is **product fidelity** (TechSpec/DB/API depth + BE/FE/QA), not architecture optioning.

---

## 2. Architecture stance (no new Option fight)

| Decision | Status | Action this seat |
|----------|--------|------------------|
| Q-PAY-FORMULA Option **A** (ADR §10) | **LOCKED / ANSWERED** | Cite only; **cấm** reopen A/B/C |
| R-PAY-DD-01 | **LOCKED** — Form GĐ1 · DnD GĐ2 · cùng `expression_json` | **Cấm invent GĐ1 DnD** |
| Q-PAY-F-3 / I-3 | Closed timesheet only | must_keep on `F-PAY-PROCESS-01` |
| Platform Option **B** PAY vertical | Catalog + schema interfaces | Roll-out after CTR MergeToken; physicalize in DATA wave |
| New ADR | **Not required** | Only **APPEND status** on §10 (ANSWERED + product-fidelity residual) — see §9 |

---

## 3. Unlock checklist — lift `F-PAY-FORMULA-*` HOLD

HOLD lifts **only** when **all** boxes below are CONFIRMED (docs). Dev `apps/**` **after** DATA + API CONFIRMED — not from this SA seat alone.

### 3.1 Paper / governance (already mostly done)

| # | Artifact | Gate | Owner next |
|---|----------|------|------------|
| U0 | Q-PAY-FORMULA Option A + R-PAY-DD-01 + Q-PAY-F-3 | **DONE** (decision packet ANSWERED) | — |
| U1 | ADR §10 status = ANSWERED (not «chờ confirm») | APPEND pointer this wave | sa (done) → ba-docs DOC-DELTA TechSpec/API stale wording |
| U2 | SRS FR-UC-BP-PAY-02 / PAY-06 AC author·publish·preview·bind · GĐ1 form not DnD | DOC-DELTA if wording still says «chờ chốt» | ba-docs |
| U3 | Close residual id `R-BP-FORMULA-CONFIRM` as **PAPER_CLOSED** | Program residual → product fidelity | pm + ba-docs |

### 3.2 TechSpec depth (before API unlock)

| # | Must exist | Content bar |
|---|------------|-------------|
| T1 | TechSpec §7.4 rewrite / DOC-DELTA | HOLD reason = **product depth pending**, not «Q unsigned»; GĐ1 = form author + dual publish; GĐ2 = DnD |
| T2 | Runtime bind on `F-PAY-PROCESS-01` | Sequence: closed sheet → CORE C&B → RD enforced → evaluate **bound** `formula_version_id` → payslip lines; **412** if missing published formula |
| T3 | Variable catalog contract | Vars **only** from closed timesheet snapshot + CORE compensation / dependents / SI CFG — **no** live Leave/OT HTTP |
| T4 | Platform PAY map | Cite Platform ADR B + TECHSPEC AC-PLT-PAY-01; components/pay_types = **ICatalogRow** open catalog |

### 3.3 DB_DESIGN columns (ba-data — unlock physical)

| # | Table / object | Must deepen beyond opaque pointer |
|---|----------------|-----------------------------------|
| D1 | `pay_formula_definition` | Keep version/lifecycle columns; **unlock** `expression_json` **inner schema** (AST/nodes for form fields — **not** DnD UI DDL); `required_vars_json` typed allow-list |
| D2 | Formula version registry | Explicit: one **active** bindable version per `(company_id, code)` effective window; immutable after period bind |
| D3 | `salary_components` / `pay_types` | Physical **open catalog** (code, label_vi, calc_role, soft-delete) — **no** FE/TS closed enum ceiling; starter rows ≠ CHK IN (N) |
| D4 | Period / payslip bind | `formula_definition_id` (or `formula_version_id`) on period and/or payslip header — already DRAFT; confirm FK + immutability after process |
| D5 | ATT precondition | `pay_period_timesheet_bind` + payslip `timesheet_header_id` NOT NULL + app assert `closed` — must_keep |

### 3.4 API_DESIGN F.1 (purpose + SRS step — §F.1)

| F-id | Mục đích (VI) | Tham chiếu bước SRS | Unlock bar |
|------|---------------|---------------------|------------|
| **F-PAY-FORMULA-AUTHOR-01** | Soạn/sửa bản nháp công thức (form fields → `expression_json`) | FR-UC-BP-PAY-02 Diễn biến soạn | Full F.1: DTO↔cột · errors DRAFT-only |
| **F-PAY-FORMULA-PUBLISH-01** | Dual-control phát hành → `active` | FR-UC-BP-PAY-02 phát hành | AuthZ author ≠ publish; audit |
| **F-PAY-FORMULA-EVAL-01** | Dry-run / preview evaluate (BE SoT) | FR-UC-BP-PAY-02 xem trước | Input = closed sheet vars + draft/active def; **cấm FE net** |
| **F-PAY-FORMULA-LIST-01** | List versions / active for company scope | PAY-02 | scope_parity list↔get |
| **F-PAY-COMP-CATALOG-01** | CRUD/list `salary_components` / `pay_types` | Platform PAY + enroll/process pickers | Open catalog; soft-delete |
| **F-PAY-PROCESS-01** | Chạy kỳ (đã có DRAFT) | FR-UC-BP-PAY-01/02/06 | **Deepen only**: bind formula version + line provenance; keep ATT-412 / FORMULA-412 |
| **F-PAY-PERIOD-01** / enroll | Lập kỳ + enroll sau sheet chốt | FR-UC-BP-PAY-06 AC-PAY-HIRE-* | Cite hire-to-pay; no REC→PAY sync |

**Lift HOLD when:** T1–T4 + D1–D5 CONFIRMED + F-PAY-FORMULA-AUTHOR/PUBLISH/EVAL/LIST (+ COMP catalog) F.1 có **Mục đích · Nghiệp vụ · bước SRS · DTO↔cột · lỗi**.

---

## 4. Runtime evaluate bind — `F-PAY-PROCESS-01` (must_keep)

```text
Open/process period
  → Assert pay_period_timesheet_bind.sheet status = closed   [I-3 · Q-PAY-F-3]
  → Else HRM-PAY-ATT-412
  → Read CORE C&B + dependents + SI rate CFG                 [I-4]
  → Read KT/KL enforced for period                           [P3]
  → Deny Leave/OT HTTP                                       [GW-HRM · I-3]
  → Resolve formula_version_id bound at period open/cutoff
  → Evaluate expression_json against closed-sheet variable bag
  → Else HRM-PAY-FORMULA-412 (no tenant hardcoded fallback)
  → Write pay_payslip + pay_payslip_line (component codes from catalog)
  → FE displays BE lines only — never posts Net as SoT
```

| must_keep | Forbidden |
|-----------|-----------|
| Closed timesheet snapshot only for hour/OT/leave vars | Open/draft sheet vars; live OT/Leave API |
| Bound published formula version | Draft formula on live run; silent const `%` in Nest |
| Payslip line provenance → component catalog + formula version | FE-computed net / FE-built formula DTO |
| Immutable bind after process start (or paid) | Hotfix rewrite definition mid-period |

---

## 5. Platform PAY vertical

Align **ADR-HRM-DYNAMIC-CONFIG-PLATFORM Option B** (do not invent a fourth pattern):

| Registry | PAY GĐ1 application |
|----------|---------------------|
| **Catalog** | `salary_components`, `pay_types` — open rows (starter OK); picker = API list |
| **FormSchema** | Formula **author form** field order / required flags (GĐ1); **DnD canvas = GĐ2** on same schema |
| **MergeToken** | Payslip print tokens = **GĐ1.5** (after formula+lines stable) — not blocking GĐ1 author/run |
| **Formula version registry** | `pay_formula_definition` (domain table) implementing versioned metadata — shared **interfaces** only, not mega-EAV |

**Rollout note:** CTR MergeToken physical may proceed in parallel; PAY catalog bind is **next recommended** platform vertical after CTR (Platform TECHSPEC Q-PLT-05) — PM may reorder if AC preserved.

---

## 6. GĐ1 form author vs GĐ2 DnD (R-PAY-DD-01)

| Phase | Surface | Same contract |
|-------|---------|---------------|
| **GĐ1** | Form cấu hình (fields, operators, component refs, preview, dual publish) | `expression_json` + `required_vars_json` |
| **GĐ2** | Kéo-thả designer | **Same** metadata — no runtime fork |

**Cấm:** Ship GĐ1 DnD; claim DnD AC in GĐ1 U65; invent separate expression SoT for designer.

---

## 7. Failure modes (architecture)

| Failure mode | Detection | Mitigation |
|--------------|-----------|------------|
| **Hardcode tenant rates / % / expressions** in Nest calculate path | CI grep · golden «no tenant const» · QC deny GO | All coeffs in formula version or ATT-baked weighted hours |
| **FE net calc** / FE posts computed Net | Boundary review · OS 28 · QA Network | Preview only via `F-PAY-FORMULA-EVAL-01`; process writes BE lines |
| **REC→PAY sync** (hire creates payslip/lines) | Gateway deny · boundary test I-2 | Hire→CORE→ATT closed→PAY enroll/process only |
| **Open timesheet vars** on process | `HRM-PAY-ATT-412` · metric reject counter | Precheck closed only; no live Leave/OT |
| Self-publish without dual-control | AuthZ deny | Author ≠ publish permission; audit |
| Draft leaks into running period | Bind immutability test | Period stores `formula_version_id`; draft ignored |
| Closed-enum salary components | 9th component reject / FE hardcode cards | Open catalog + soft-delete (Platform L1) |
| Claim `payroll_e2e_ready` from research | QC honesty | Flag stays **false** until U65 browser + QC |

---

## 8. Recommended wave order

```text
DATA (ba-data)
  → expression_json inner schema + salary_components/pay_types catalog + bind FKs
API (sa / ba-docs F.1)
  → F-PAY-FORMULA-AUTHOR/PUBLISH/EVAL/LIST + COMP catalog + deepen PROCESS
BE (dev-be)
  → ensureSchema + evaluator + process bind + AuthZ publish
FE (dev-fe)
  → GĐ1 form author + preview + period/enroll UX (no DnD; no FE net)
QA (qa) U65
  → browser: author→publish→closed sheet→process→payslip lines + F5
  → cấm seed; cấm invent payroll_e2e_ready=true
```

| Wave | work_item (suggested) | Owner |
|------|----------------------|-------|
| W0 peer | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01` | ba-data |
| W0 peer | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BA-01` | ba-process (AC gap matrix) |
| W1 | DOC-DELTA TechSpec §7.4 + SRS stale «chờ chốt» | ba-docs |
| W1 | `…-API-01` F.1 formula author family | sa |
| W2 | ensureSchema + eval + process | dev-be |
| W2 | form author FE | dev-fe |
| W3 | U65 formula + lập bảng | qa → qc |

**Parallel OK:** DATA + BA-01 + QA inventory. **Serial hard gate:** DATA CONFIRMED → API F.1 CONFIRMED → BE → FE → QA.

---

## 9. ADR delta (pointer only — APPEND)

**File:** `ADR-HRM-4-PILLAR-API-BOUNDARY.md` §10  
**Change:** Status → **ANSWERED / LOCKED Option A** (cite decision packet + R-PAY-DD-01).  
**Do not:** Replace Option A; do not reopen B/C; do not claim LIVE / `payroll_e2e_ready`.  
**Residual wording:** Product fidelity (TechSpec/DB/API/Dev/QA) — **not** partner workshop.

Platform ADR Option B: **cite only** — no rewrite this wave.

---

## 10. Non-claims

- No `apps/**`
- No `payroll_e2e_ready=true` / PAY LIVE / Phase1 DONE
- No invent GĐ1 DnD
- No re-workshop Q-PAY-FORMULA
- No claim formula `expression_json` physical CONFIRMED (ba-data owns)

---

## 11. completion_report

**Closed**

1. Unlock path for `F-PAY-FORMULA-*` HOLD: checklist TechSpec · DB · API F.1 (§3).
2. Runtime bind contract on `F-PAY-PROCESS-01` with closed-timesheet must_keep (§4).
3. Platform PAY vertical map: open catalog components/pay_types + formula version registry (§5).
4. GĐ1 form vs GĐ2 DnD locked to R-PAY-DD-01 (§6).
5. Failure modes + wave order DATA→API→BE→FE→QA U65 (§7–§8).
6. Explicit: Q-PAY-FORMULA **ANSWERED** — residual = **product fidelity** (§1–§2).
7. ADR §10 APPEND status pointer (Option A unchanged) (§9).

**Residual (dispatch)**

| ID | Item | Owner |
|----|------|-------|
| R-PAY-DATA-EXPR | Physicalize `expression_json` + catalogs | ba-data `…-DATA-01` |
| R-PAY-API-F1 | F-PAY-FORMULA-* + COMP F.1 after DATA | sa `…-API-01` |
| R-PAY-DOCS-STALE | TechSpec §7.4 / API HOLD wording «chờ confirm» → ANSWERED | ba-docs |
| R-PAY-BA-AC | FR PAY-02/06 vs code vs evidence matrix | ba-process `…-BA-01` |
| R-PAY-QA-INV | Evidence inventory UNTESTED/FAIL | qa `…-QA-01` |
| Dev / UAT flag | HOLD until DATA+API CONFIRMED; flag false | pm |

---

## 12. Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-hrm-payroll-formula-run-gap-sa-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01
from_role: pm
to_role: ba-data
lane: governance
priority: P0
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01

## Mission
Physicalize PAY formula + catalog depth so F-PAY-FORMULA-* HOLD can lift after API F.1.
Cite SA unlock: docs/qa/evidence/po-hrm-payroll-formula-run-gap-sa-01.md §3.3 · §5.
Q-PAY-FORMULA Option A + R-PAY-DD-01 ANSWERED — do NOT re-workshop; residual = product fidelity.

## Deliver
1. DB_DESIGN / program DATA SoT: unlock expression_json INNER schema (form AST — not DnD UI tables)
2. required_vars_json allow-list from CLOSED timesheet + CORE C&B only
3. salary_components + pay_types open catalog columns (soft-delete; no CHK IN closed set)
4. Confirm formula_version bind columns on period/payslip + immutability rules
5. Evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-data-01.md

## Exit
- PASS_TO_PM · CONFIRMED physical intent
- next_dispatch_prompt for sa PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01 (F.1 AUTHOR/PUBLISH/EVAL/LIST + COMP + deepen PROCESS)
- Parallel ok: ba-docs DOC-DELTA TechSpec §7.4 stale «chờ confirm» → ANSWERED / product fidelity
- cấm: apps/** · migrations · invent GĐ1 DnD · claim payroll_e2e_ready=true · FE net SoT
```

### Parallel (optional same session)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P1

## Mission
DOC-DELTA ADD-only: TECHSPEC_HRM_ENTERPRISE §7.4 / §7.6 / §11 R-BP-FORMULA-CONFIRM + API_DESIGN F-PAY-FORMULA HOLD reason —
replace «chờ khách confirm Q-PAY-FORMULA» with «ANSWERED Option A · R-PAY-DD-01 · residual = product fidelity depth».
Cite DECISION_PACKET_Q_PAY_FORMULA.md + ADR §10 APPEND + sa evidence po-hrm-payroll-formula-run-gap-sa-01.md.
Keep F-PAY-FORMULA-* HOLD until DATA+API CONFIRMED. No wipe P1–P6. No apps/**. payroll_e2e_ready=false.
```

---

## Files touched

- `docs/qa/evidence/po-hrm-payroll-formula-run-gap-sa-01.md` (this file)
- `docs/client-delivery/hrm-enterprise-blueprint/ADR-HRM-4-PILLAR-API-BOUNDARY.md` (§10 status APPEND only)
