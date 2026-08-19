# PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01 — Option/F.1 · Động cơ công thức lương — RETAIN + gap AC

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (**U89** — single GD continuous · **NO** phase split) |
| **lane** | governance · sa |
| **change_mode** | **ADD** Option/F.1 disposition · **gap-only** · **NO CODE** `apps/**` · **no seed** · **preserve_default** · **DENY** Nest `/core` dual invent · **DENY** wipe PAY-01 / ATT peer seals · **DENY** invent `att_leave_hold` · **DENY** merge sick/compensatory/carry→annual · **DENY** honesty flip · **DENY** claim PAY module UAT · **C-SLICE** |
| **Date** | 2026-08-10 |
| **Status** | **CONFIRMED** · Option **A** **LOCKED** · unlock **ba-process** BA-01 AC → (ba-data HOLD default) → API deepen cite → Dev/FE/QA waves · **cấm apps/** until Option CONFIRMED (this seat docs-only) |
| **depends_on** | QC-01 GWC Wave-37 UC-BP-PAY-01 **SEALED** — stamp **`PAY01QC1-MSMBGWC1`** · QA **`PAY01QA1-MSMBA9OA`** · evidence `docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-qc-01.md` · **must_keep** **`PAY01QC1-MSMBGWC1`** boundary · **`ATT12QC1-MSMAIGWC1`** · **`ATT11QC1-MSLXTH9P`** · **`ATT10QC1-MSLWGUYH`** · **`ATT09QC1-MSLUTL9D`** · ATT07/06/05b/CORE07 chain · **`payroll_e2e_ready=false`** · J-HRM-PAY-01-05 FORMULA-412 **HOLD** (non-blocking GWC) · U65 zero-seed |
| **uc_ids** | `UC-BP-PAY-02` · `FR-UC-BP-PAY-02` |
| **board** | `docs/program/PO_HRM_MVP_GD1_CONTINUOUS.md` — seat **#43** after PAY-01 (#42 SEALED GWC) · PAY-04..09 **QUEUED** |
| **ref_pay01** | [`PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md) · API-01 · BA-01 · QC GWC · **F-PAY-ATT-CLOSED-01** · **HRM-PAY-ATT-412** · **must_keep** closed-sheet hour SoT |
| **ref_formula_program** | [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md`](./PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) (**CONFIRMED** F-PAY-FORMULA-*) · evidence `docs/qa/evidence/po-hrm-payroll-formula-run-gap-sa-01.md` · ADR §10 **Q-PAY-FORMULA Option A ANSWERED** |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-PAY-02** · Diễn biến **#0a–#3 + Thành công** · **BR-BP-PAY-01** · **AC-PAY-COMP-01** · **Q-PAY-F-3** (chỉ bảng công chốt) · **R-PAY-DD-01** Form GĐ1 + DnD GĐ2 · cross **FR-UC-BP-PAY-06** |
| **ref_techspec** | `TECHSPEC_HRM_ENTERPRISE.md` **P1–P4** · **F-PAY-FORMULA-*** · **F-PAY-PROCESS-01** eval bind · **F-PAY-COMP-CATALOG-01** · Platform PAY open catalog |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` **F-PAY-FORMULA-AUTHOR/PUBLISH/LIST/PREVIEW-01** · deepen **F-PAY-PROCESS-01** formula bind · physical `/api/hrm/payroll/formulas*` · alias `/api/hrm/pay/formulas*` |
| **ref_db** | `pay_formula_definitions` · `salary_components` / `pay_types` · `payroll_periods.formula_definition_id` (bind) · **must_keep** `pay_period_timesheet_bind` + `att_timesheet_line` (PAY-01) |
| **ref_code** | **read-only cite:** `pay-formula.service.ts` · `pay-formula-evaluator.ts` (`gd1_eval_v1`) · `payroll.service.ts` process + **HRM-PAY-FORMULA-412** · `pay-formula-variable-bag.ts` + **F-PAY-ATT-CLOSED-01** · `payroll-catalog.service.ts` · Nest `@Controller('payroll')` — **≠ claim LIVE UAT from grep alone** |
| **OUT** | GĐ1 DnD designer · FE net as SoT · hardcode tenant % in Nest · REC→PAY sync · open/draft sheet vars · Leave/OT HTTP for hour vars · claim `gd1_eval_v1` stub = FR-PAY-02 DONE · flip `payroll_e2e_ready` · PAY module UAT · wipe PAY01/ATT seals · seed · apps/** this seat |
| **Honesty** | `payroll_e2e_ready=false` · `attendance_uat_ready=false` · **≠ PAY-02 / PAY module UAT** · **≠** «động cơ đã chạy thật toàn module» (SRS disclaimer) · **C-SLICE** |
| **ack_status** | **PASS_TO_PM** · Option A CONFIRMED |

---

## 1. Decision Context

| | |
|--|--|
| **Decision title** | Wave-38 architecture unlock: **lắp ráp và chạy động cơ công thức lương** (FR-UC-BP-PAY-02 · BR-BP-PAY-01) vs AS-IS LIVE metadata engine — **gap-only** under U89 · **bind PAY-01 closed-sheet boundary** |
| **Requestor** | PM · program `PO_HRM_MVP_GD1_CONTINUOUS` · U88 after PAY-01 QC-01 GWC (`PAY01QC1-MSMBGWC1`) |
| **Date** | 2026-08-10 |
| **Decision owner** | SA |
| **Related requirements** | FR-UC-BP-PAY-02 · BR-BP-PAY-01 · AC-PAY-COMP-01 · Q-PAY-FORMULA Option A · R-PAY-DD-01 · Q-PAY-F-3 · F-PAY-FORMULA-* · F-PAY-PROCESS-01 eval deepen · must_keep PAY01 + ATT11/12 + ATT peer chain · ≠ payroll_e2e LIVE · ≠ reopen sealed ATT journeys |

### 1.1 Problem to Solve

| | |
|--|--|
| **Current state (AS-IS LIVE — partial)** | **PAY-01 SEALED (`PAY01QC1-MSMBGWC1`):** closed-sheet bind · eligibility `NO_CLOSED_SHEET` · process **HRM-PAY-ATT-412** · `loadAttHoursFromClosedLine` · **≠ PAY-01 / PAY module UAT** · **J-HRM-PAY-01-05** `HRM-PAY-FORMULA-412` **HOLD** (expected until PAY-02 depth). **Formula engine (PRESENT — cite, staged):** (1) Table **`pay_formula_definitions`** + `pay-formula.service` CRUD lifecycle `draft` → `pending_publish` → `active`/`retired`. (2) **Dual-control:** `HRM-PAY-FORMULA-403-DUAL` on self-publish (jest). (3) **Evaluator:** `pay-formula-evaluator` form **`gd1_eval_v1`** — opaque `expression_json` lines → gross/net component lines (unit tests). (4) **Process:** `payroll.service` binds **published** formula → evaluate → `payroll_payslip_lines`; **HRM-PAY-FORMULA-412** / **FORMULA-412-VARS** when missing/incomplete bag (no silent zero UAT). (5) **Preview:** `F-PAY-FORMULA-PREVIEW-01` path with variable bag + closed-sheet vars policy. (6) **Catalog:** `salary_components` / `pay_types` + FK optional `default_formula_definition_id`. **ABSENT / residual:** GĐ1 **form author FE** fidelity (R-PAY-DD-01) · full **AC-PAY-FORMULA-01..08** browser U65 · **AC-PAY-COMP-01** dual SoT on all bind surfaces · open component **N+1** without closed enum · expression inner schema documentation beyond opaque · template override (AMIS layer 3) · split-month (**PAY-04**) · full PAY-06 hire→payslip e2e. **Paper:** Q-PAY-FORMULA **ANSWERED** — **cấm** re-workshop Option A/B/C. |
| **Paper target** | FR-UC-BP-PAY-02: C&B **form GĐ1** lắp biến từ bảng công chốt + CORE · **hai bước** soạn→phát hành · preview/chạy thử · runtime **không** deploy mã khi đổi công thức thường · dual SoT danh mục thành phần (**AC-PAY-COMP-01**) · **không** đọc OT/phép song song (**Q-PAY-F-3** + PAY-01 boundary). |
| **Gap class** | **GĐ1 continuous AC + regression + journey mint** on LIVE formula metadata + evaluator stub depth — **not** claim FR-PAY-02 module DONE; **not** flip `payroll_e2e_ready`; **not** GĐ2 DnD; **preserve** PAY-01 closed-sheet gate. |
| **Constraints** | U89 · preserve **PAY01QC1** + **ATT12QC1** + **ATT11QC1** + ATT10..CORE07 · Nest `/core` DENY · C-SLICE · DENY seed · gap-only · DENY merge buckets · DENY `att_leave_hold` · DENY reopen **J-HRM-ATT-12-*** / **J-HRM-ATT-07-*** / **J-HRM-PAY-01-*** without regression bus |
| **Failure impact if unresolved** | Board #43 stalls; Dev hardcodes tenant formulas; FE computes net; draft formula on live process; false `payroll_e2e_ready`; breaks BR-BP-TS-03 / PAY-01 boundary |

### 1.2 Architecture diagram (target — Option A)

```text
  PAY-01 SEALED (must_keep): closed sheet bind · ATT-412 · F-PAY-ATT-CLOSED-01 bag
  ATT-11/12 SEALED: close+lock · panel ≠ formula trigger
       │
       ▼
  ┌──────────── FR-UC-BP-PAY-02 (this seat — engine RETAIN + gap AC) ────────────┐
  │                                                                              │
  │  RETAIN LIVE (cite — ≠ PAY-02 DONE alone)                                    │
  │    pay_formula_definitions lifecycle + dual-control publish                  │
  │    gd1_eval_v1 evaluator (BE SoT) · expression_json opaque GĐ1 form          │
  │    process: published formula → payslip lines · FORMULA-412 honesty          │
  │    preview: bag = closed-sheet vars + CORE C&B (no Leave/OT HTTP)            │
  │    salary_components / pay_types open catalog (picker SoT)                   │
  │                                                                              │
  │  RESIDUAL unlock (BA → API cite → Dev/FE/QA)                                 │
  │    R-PAY-02-AUTHOR-FE   : GĐ1 form author UX (not DnD)                       │
  │    R-PAY-02-PUBLISH-AC  : dual-control browser + F5 immutability             │
  │    R-PAY-02-PREVIEW-AC  : preview 2xx + line breakdown display-ready         │
  │    R-PAY-02-PROCESS-AC  : process after bind+publish+closed sheet (412 family) │
  │    R-PAY-02-COMP-01     : AC-PAY-COMP-01 on template/period/enroll surfaces   │
  │    R-PAY-02-CATALOG-N+1 : open catalog — reject closed enum on new code      │
  │    R-PAY-02-VARS        : required_vars_json / FORMULA-412-VARS AC            │
  │    R-PAY-02-JOURNEY     : mint J-HRM-PAY-02-* DRAFT + regression PAY-01/ATT   │
  │    R-PAY-02-EVAL-DEPTH  : gd1_eval_v1 ≠ full tax/BH/split (PAY-03/04/05/06)  │
  │                                                                              │
  │  HOLD / OUT this seat                                                        │
  │    GĐ2 DnD designer · template formula override (AMIS layer 3)               │
  │    PAY-04 split · PAY-06 full hire e2e · payslip security (PAY-08)           │
  └──────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
  GĐ1 DnD as requirement          = DENY (GĐ2 only · same expression_json)
  FE net / FE formula DTO write   = DENY (OS 28 · I-5)
  Hardcode tenant formula in Nest = DENY (BR-BP-PAY-01 · ADR I-5)
  Draft/active skip publish       = DENY
  Open/draft sheet hour vars      = DENY (PAY-01 · Q-PAY-F-3)
  Leave/OT HTTP in bag/process    = DENY
  Claim gd1_eval_v1 = module DONE = DENY
  Flip payroll_e2e_ready / PAY UAT= DENY
  Wipe PAY01QC1 / ATT11/12 seals  = DENY
  C-SLICE ≠ module PAY UAT

  Honesty: payroll_e2e_ready=false · attendance_uat_ready=false · product_go=false
```

**Label lock:** Board «Lắp ráp và chạy động cơ công thức lương» GĐ1 = **RETAIN cite LIVE metadata engine + gd1_eval_v1 runtime path** + **gap AC author/publish/preview/process/catalog** — **not** full tax/BH/split/payslip module DONE; **not** GĐ2 DnD; **bind PAY-01** closed-sheet invariant; **C-SLICE**.  
**Spine lock:** Physical Nest `/api/hrm/payroll/formulas*` + internal evaluator · paper `/api/hrm/pay/formulas*` = **alias**.  
**Hour/var lock:** Variable bag for evaluate/preview **inherits F-PAY-ATT-CLOSED-01** — **DENY** parallel Leave/OT HTTP (**must_keep PAY01**).  
**Honesty lock:** Slice GWC later **≠** `payroll_e2e_ready=true` · **≠** PAY module UAT · SRS: «**không** khẳng định động cơ đã chạy thật trên môi trường nghiệm thu».

---

## 2. LIVE vs gap map (preserve_default)

| Capability | Paper (SRS / TechSpec / API) | AS-IS LIVE | Verdict |
|------------|------------------------------|------------|---------|
| Q-PAY-FORMULA Option A dual-control | ADR §10 ANSWERED | service + 403-DUAL test | **RETAIN cite** · **cấm** reopen B/C |
| Form GĐ1 author (not DnD) | R-PAY-DD-01 | API + partial FE | **GAP** R-PAY-02-AUTHOR-FE |
| Draft upsert | F-PAY-FORMULA-AUTHOR-01 | pay-formula.service | **RETAIN cite** |
| Publish dual-control | F-PAY-FORMULA-PUBLISH-01 | submit/publish SM | **RETAIN cite** · **R-PAY-02-PUBLISH-AC** |
| List/get scope parity | F-PAY-FORMULA-LIST-01 | list/get | **RETAIN cite** · U19 |
| Preview dry-run | F-PAY-FORMULA-PREVIEW-01 | preview endpoint | **RETAIN cite** · **R-PAY-02-PREVIEW-AC** |
| Evaluator runtime | gd1_eval_v1 | pay-formula-evaluator | **RETAIN cite** · **≠ full PAY DONE** |
| Process bind published | F-PAY-PROCESS-01 | payroll.service process | **RETAIN partial** · **must_keep ATT-412 first** |
| FORMULA-412 family | Diễn biến FAIL | 412 no silent zero | **RETAIN cite** · J-PAY-01-05 HOLD→PAY-02 AC |
| Closed-sheet hour vars | Q-PAY-F-3 · PAY-01 | variable bag loader | **peer RETAIN** · **must_keep PAY01** |
| Component catalog open | AC-PAY-COMP-01 · Platform B | salary_components CRUD | **RETAIN partial** · **R-PAY-02-COMP-01** |
| Dual SoT catalog vs bind form | SRS §0a–0c | partial enforcement | **GAP** AC-PAY-COMP-01 surfaces |
| C&B vars in bag | Diễn biến #1 P2 | partial | **GAP** trace F-PAY-CB-READ-01 |
| Template override | AMIS layer 3 | HOLD | **OUT** GĐ1.5 |
| GĐ2 DnD | SRS GĐ2 | not in scope | **HOLD** GĐ2 |
| PAY-04/06 depth | queued UC | OUT | **HOLD** footers |
| Module / honesty | program | C-SLICE | **DENY flip** |

---

## 3. Options A / B / C

### Option A — ACCEPT_AS_IS_RETAIN metadata engine + gd1_eval_v1 + gap AC (RECOMMENDED)

| | |
|--|--|
| **Summary** | **RETAIN** LIVE `pay_formula_definitions` lifecycle · dual-control publish · **`gd1_eval_v1`** evaluator · process binds **published** formula → payslip lines · preview with closed-sheet + CORE bag · open `salary_components` catalog. **must_keep** **PAY01QC1-MSMBGWC1** closed-sheet boundary + **ATT12QC1** + **ATT11QC1** + full ATT peer chain. Unlock BA residuals **R-PAY-02-*** AC + mint **J-HRM-PAY-02-***. **DENY** GĐ1 DnD · FE net · hardcode · draft on live run. **F-PAY-FORMULA-*** F.1 = **cite** [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md`](./PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) — deepen only deltas for U89 cluster. **≠ PAY-02 module UAT** · **≠ payroll_e2e_ready**. |
| **Scope** | Gap-only docs lock · **no** `apps/**` this seat |
| **Complexity** | Medium (engine PRESENT; residual = FE author + U65 journeys + COMP-01 enforcement) |
| **Risk** | Low if BA does not claim evaluator stub = full payroll |
| **Pros** | Matches Q-PAY-FORMULA ANSWERED · preserves PAY-01 · coded dual-control + 412 honesty |
| **Cons** | gd1_eval_v1 ≠ full statutory payroll; browser AC still open |
| **Failure modes** | Self-publish · FE net · open sheet vars · honesty flip |
| **Mitigation** | O1–O16 · regression PAY-01/ATT |

### Option B — GĐ1 DnD + FE net calc + hardcode tenant formulas (REJECT)

| | |
|--|--|
| **Summary** | Ship kéo-thả GĐ1; FE computes net; Nest embeds tenant %; or read Leave/OT HTTP for formula vars |
| **Pros** | Demo-friendly |
| **Cons** | Violates R-PAY-DD-01 · BR-BP-PAY-01 · PAY-01 boundary · ADR I-5 · OS 28 |
| **Mitigation** | **REJECT** |

### Option C — HOLD / claim gd1_eval_v1 jest = PAY-02 DONE / payroll_e2e LIVE (REJECT)

| | |
|--|--|
| **Summary** | Declare FR-PAY-02 DONE because table/evaluator exists; flip `payroll_e2e_ready`; skip author/publish U65; ignore AC-PAY-COMP-01 |
| **Pros** | Fast chat claim |
| **Cons** | Violates SRS disclaimer · C-SLICE · QC PAY-01 GWC honesty |
| **Mitigation** | **REJECT** |

### Trade-off matrix

| Dimension | Weight | A (RETAIN+gap AC) | B (DnD/FE net/hardcode) | C (HOLD/claim DONE) |
|-----------|-------:|-------------------:|------------------------:|--------------------:|
| Business value (FR-PAY-02) | 5 | **5** | 1 | 0 |
| Time to deliver | 4 | **4** | 2 | Fake PASS |
| Fit Q-PAY-FORMULA + PAY-01 | 5 | **5** | 0 | 1 |
| Security / scope U19 | 4 | **5** | 2 | Honesty breach |
| Reliability / preserve seals | 5 | **5** | 1 | High defect |
| Maintainability (I-5) | 5 | **5** | 0 | Spec lie |

---

## 4. Decision

| | |
|--|--|
| **Selected option** | **Option A** — **ACCEPT_AS_IS_RETAIN**: LIVE formula definitions + dual publish + gd1_eval_v1 process/preview path; unlock R-PAY-02-* AC; **RETAIN** PAY01 + ATT11/12 + peer chain; **cite** CONFIRMED F-PAY-FORMULA-* API pack; **DENY** GĐ1 DnD · FE net · hardcode · open sheet vars · Leave/OT HTTP · `payroll_e2e_ready` flip · PAY module UAT · reopen sealed journeys · seed · apps/** |
| **Why selected** | Architecture decision **Q-PAY-FORMULA** already **ANSWERED**; AS-IS implements Option A spine; FR-PAY-02 gap is **author FE + publish/preview/process U65 AC + AC-PAY-COMP-01** — not second engine or GĐ1 DnD |
| **Assumptions** | **PAY01QC1-MSMBGWC1 RETAIN** · **ATT12QC1+ATT11QC1 RETAIN** · `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01` **CONFIRMED** remains SoT for F.1 depth · `payroll_e2e_ready=false`. Physical formula + evaluator **PRESENT** (grep/jest 2026-08-10) — **≠ UAT claim**. |
| **Rejected** | **B** — DnD GĐ1 / FE net / hardcode / Leave-OT read · **C** — HOLD / honesty flip |

### 4.1 OPEN decisions for BA (lockable — not invent)

| ID | Topic | SA default (Option A) | BA must CONFIRM |
|----|-------|------------------------|-----------------|
| O1 | Engine SoT | Metadata `pay_formula_definitions` · **cấm** `salary_components.formula` TEXT as versioned engine | AC cite G-PAY-F-07 |
| O2 | GĐ1 surface | **Form** author only · DnD = **GĐ2 OUT** | R-PAY-DD-01 footer |
| O3 | Dual-control | Author ≠ publisher · `HRM-PAY-FORMULA-403-DUAL` | AC-PAY-FORMULA-02/03 |
| O4 | Publish vars | `required_vars_json` before publish · `HRM-PAY-FORMULA-412-VARS` | AC-PAY-FORMULA-05 |
| O5 | Closed-sheet vars | Preview/process bag **must_keep PAY-01** · no Leave/OT HTTP | Q-PAY-F-3 · O1 PAY-01 |
| O6 | Process order | **ATT-412** before formula eval · then **FORMULA-412** if no publish | J-PAY-01-05 → PAY-02 AC |
| O7 | Evaluator depth | `gd1_eval_v1` = **C-SLICE** · tax/BH/split = PAY-03/04/05/06 | Footer ≠ full payroll |
| O8 | AC-PAY-COMP-01 | Bind surfaces pick code from catalog when non-empty | SRS #0a–0c |
| O9 | Catalog admin | Admin may **add** new component code · bind form **cannot** free-text | SRS special cases |
| O10 | Preview | BE SoT preview · FE displays lines only | AC-PAY-FORMULA-04 |
| O11 | Immutability | `active` → new version only · period bind frozen | ADR §10.4 |
| O12 | scope_parity | formulas list ↔ get ↔ mutate same resolver as periods | U19 |
| O13 | Regression | **DENY reopen** J-HRM-PAY-01-* · J-HRM-ATT-12-07 · J-ATT-07-03..05 · J-ATT-06-04 | must_keep |
| O14 | must_keep stamps | PAY01QC1 + ATT12QC1 + ATT11QC1 + ATT peer chain | ≠ wipe |
| O15 | Honesty | Mint **J-HRM-PAY-02-*** DRAFT · `payroll_e2e_ready=false` | **≠ PAY UAT** |
| O16 | J-PAY-01-05 | FORMULA-412 after closed bind = **expected HOLD→PAY-02** · non-blocking PAY-01 GWC | QC cite |

---

## 5. F.1 disposition (cluster lock · full depth = cite API-01)

> **SoT F.1 body:** [`PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md`](./PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md) — this section **locks RETAIN/HOLD/GAP** for U89 seat #43 only.

| F-id | Physical METHOD/path (prefer) | Disposition | Mục đích (VI) | Bước SRS |
|------|-------------------------------|-------------|---------------|----------|
| **F-PAY-FORMULA-AUTHOR-01** | `POST/PUT /api/hrm/payroll/formulas*` · `POST …/:code/versions` | **RETAIN cite** · GAP FE form | Soạn bản nháp form GĐ1 → `expression_json` | Diễn biến **#1** · #0a admin catalog |
| **F-PAY-FORMULA-PUBLISH-01** | `POST …/submit-publish` · `POST …/publish` | **RETAIN cite** · GAP browser AC | Hai bước phát hành · dual-control | Diễn biến **#2** |
| **F-PAY-FORMULA-LIST-01** | `GET /api/hrm/payroll/formulas` · `GET …/:id` | **RETAIN cite** | List/version picker scope parity | FR-PAY-02 · AC-PAY-FORMULA-01 |
| **F-PAY-FORMULA-PREVIEW-01** | `POST …/formulas/:id/preview` | **RETAIN cite** · GAP AC | Dry-run BE · bag closed+C&B | Diễn biến **#3** trial · AC-04 |
| **F-PAY-FORMULA-EVAL** (internal) | `pay-formula-evaluator` · `evaluateBoundFormula` | **RETAIN cite** · **HOLD depth** | Evaluate `gd1_eval_v1` | Diễn biến **#3** · **≠ module DONE** |
| **F-PAY-COMP-CATALOG-01** | `GET|POST|PATCH …/salary-components` | **RETAIN partial** · **GAP COMP-01** | Danh mục mở · picker SoT | #0a–0c · AC-PAY-COMP-01 |
| **F-PAY-ATT-CLOSED-01** (peer PAY-01) | internal bag loader | **must_keep RETAIN** | Giờ từ sheet chốt only | PAY-01 · Q-PAY-F-3 |
| **F-PAY-PROCESS-01** | `POST …/payroll/periods/{id}/process` | **RETAIN partial** · GAP process AC | Bind published + eval → lines | Diễn biến **#3** · PAY-06 peer |
| **F-PAY-CB-READ-01** | internal facade | **GAP trace** | C&B vars vào bag | Diễn biến P2 |
| **F-PAY-RD-APPLY-01** | internal | **HOLD** | KT/KL | CORE-08 · PAY-06 |
| **F-PAY-SHEET-TPL-*** | template layer | **HOLD** GĐ1.5 | AMIS override | OUT seat |

**DENY:** GĐ1 DnD API requirement · FE net SoT · hardcode tenant expression in Nest calculate · draft formula on live process · Leave/OT HTTP for hour vars · treat **jest gd1_eval_v1** alone as FR-PAY-02 module DONE.

**Display-ready cite for BA:** Formula DTO `code`, `version`, `status`, `expressionJson`, `requiredVarsJson`, `publishedBy/At` · preview/process response `lines[]` with `componentCode`, `amountVnd` (vi-VN display) · errors `HRM-PAY-FORMULA-412*` · `HRM-PAY-FORMULA-403-DUAL` · **`HRM-PAY-ATT-412`** (PAY-01 first).

---

## 6. unlock_lane (clear)

```text
BA-01 (ba-process) AC pack O1–O16 + mint J-HRM-PAY-02-* DRAFT + regression J-HRM-PAY-01-* / ATT peers
  → ba-data HOLD default (cite PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-01 if closable delta)
  → sa API-01 cluster delta (optional — only if F.1 drift vs API-01)
  → Dev-FE GĐ1 form author + catalog bind UX (no DnD; no FE net)
  → Dev-BE residual ONLY (gap-only · preserve gd1_eval_v1)
  → QA U65 J-HRM-PAY-02-* + regression PAY-01/ATT
  → QC GWC C-SLICE (≠ PAY-02 module UAT · ≠ payroll_e2e_ready flip)
```

| Step | Owner | Exit |
|------|-------|------|
| 1. This Option A CONFIRMED | sa | Spec path + bus PASS_TO_PM |
| 2. BA O1–O16 AC + mint J-HRM-PAY-02-* DRAFT | ba-process | Spec BA-01 · **no apps/** |
| 3. ba-data HOLD default | ba-data | HOLD unless closable |
| 4. sa API cluster delta (if needed) | sa | Optional API-02 |
| 5. Dev-FE/BE wire residual ONLY | dev-* | READY_FOR_QA |
| 6. QA U65 J-HRM-PAY-02-* · regression PAY-01/ATT | qa | PASS_TO_PM |
| 7. QC GWC C-SLICE | qc | ≠ PAY module UAT · ≠ honesty flip |

**Rollback:** Docs-only seat — supersede if sponsor REJECT; **no** product code to roll back.  
**Success criteria:** Option A locked · BA unlocked · PAY01QC1 + ATT12+ATT11+peer stamps untouched · `payroll_e2e_ready=false` · apps/** untouched · **≠** claim PAY-02 module DONE.

---

## 7. Failure modes & mitigation

| Option | Failure mode | Detection | Mitigation |
|--------|--------------|-----------|------------|
| A | Self-publish | 403-DUAL | O3 |
| A | FE net on preview/process | Network / OS 28 | O10 |
| A | Open sheet vars in eval | ATT-412 / boundary audit | O5 · must_keep PAY01 |
| A | Free-text component on bind | AC-PAY-COMP-01 FAIL | O8–O9 |
| A | Claim gd1_eval_v1 = DONE | Evidence footer | O7 · O15 |
| A | Flip payroll_e2e_ready | Flag true | O15 DENY |
| A | Reopen PAY-01/ATT journeys | QA regression FAIL | O13 |
| B | DnD GĐ1 / hardcode | ADR/SRS violation | **REJECT B** |
| C | Honesty / false UAT | Module UAT claim | **REJECT C** |

---

## 8. must_keep / DENY checklist (copy into BA)

| Lock | Rule |
|------|------|
| **PAY01QC1-MSMBGWC1** | RETAIN · closed-sheet bind · ATT-412 · F-PAY-ATT-CLOSED-01 · **≠ PAY-01 module UAT** |
| **ATT12QC1-MSMAIGWC1** | RETAIN · ≠ FR-12 DONE |
| **ATT11QC1-MSLXTH9P** | RETAIN · close spine · prerequisite for hour vars |
| **ATT10/09/07/06/05b/CORE07** | RETAIN · DENY merge · DENY `att_leave_hold` |
| **J-HRM-PAY-01-01..07** | RETAIN PASS · regression mandatory |
| **Q-PAY-FORMULA Option A** | **ANSWERED** · **cấm** reopen workshop |
| **R-PAY-DD-01** | Form GĐ1 · DnD GĐ2 |
| Nest `/core` | **DENY** dual invent |
| GĐ1 DnD | **DENY** as requirement |
| FE net / hardcode formula | **DENY** |
| `payroll_e2e_ready` / PAY module UAT | **DENY** flip · **C-SLICE** |
| Claim engine jest = FR-PAY-02 DONE | **DENY** |
| Honesty | **DENY** flip · U65 zero-seed |
| apps/** | **CẤM** until contracts after BA |

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Option **A LOCKED** for UC-BP-PAY-02: **RETAIN** `pay_formula_definitions` lifecycle · dual-control publish · **`gd1_eval_v1`** evaluator · process/preview bind published formula with **FORMULA-412** honesty; **must_keep** **PAY01QC1** closed-sheet boundary + **ATT12QC1+ATT11QC1** + ATT peer chain; **GAP** **R-PAY-02-AUTHOR-FE/PUBLISH-AC/PREVIEW-AC/PROCESS-AC/COMP-01/CATALOG-N+1/VARS/JOURNEY**; **cite** F-PAY-FORMULA-* F.1 from **PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01**; **HOLD** GĐ2 DnD · template override · PAY-04/06 full depth; docs-only · no `apps/**`. |
| **next_owner** | **ba-process** (BA-01 AC pack) |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01
role: ba-process
lane: governance · UC-BP-PAY-02 · FR-UC-BP-PAY-02 · BR-BP-PAY-01 · AC-PAY-COMP-01 · Option A CONFIRMED
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-SA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-SA-01.md (must_keep PAY01 closed-sheet · F-PAY-ATT-CLOSED-01)
  - docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md (F-PAY-FORMULA-* F.1 SoT)
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-02
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-qc-01.md (PAY01QC1-MSMBGWC1 · J-05 FORMULA-412 HOLD)
entry_criteria: SA PASS_TO_PM CONFIRMED Option A · must_keep PAY01QC1-MSMBGWC1 + ATT12QC1-MSMAIGWC1 + ATT11QC1-MSLXTH9P + full ATT peer chain · payroll_e2e_ready=false · U65 zero-seed
exit_criteria:
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-02-CLUSTER-BA-01.md
  - AC O1–O16 from SA §4.1 · mint J-HRM-PAY-02-* DRAFT (author form GĐ1 · dual publish · preview · process after closed bind+publish · AC-PAY-COMP-01 · regression J-HRM-PAY-01-* + J-HRM-ATT-12-07 + J-HRM-ATT-07-03..05 + J-HRM-ATT-06-04)
  - Footer: ≠ PAY-02 / FR-UC-BP-PAY-02 module DONE · ≠ payroll_e2e_ready · ≠ PAY module UAT · gd1_eval_v1 = C-SLICE not full statutory payroll · GĐ2 DnD OUT · DENY merge buckets · DENY att_leave_hold · DENY FE net SoT · DENY reopen sealed PAY-01/ATT journeys without regression bus
  - ack_status PASS_TO_PM · next ba-data DATA-01 HOLD default
cấm: honesty flip · seed · GĐ1 DnD requirement · claim jest evaluator = DONE · apps/**
```
