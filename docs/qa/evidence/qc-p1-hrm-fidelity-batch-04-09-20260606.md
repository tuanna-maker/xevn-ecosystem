# QC Gate Decision — P1-HRM-FIDELITY-QC-BATCH-04-09 (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-FIDELITY-QC-BATCH-04-09` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `:28001` hrm-api · `:28002` xbos-api |
| **accounts** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) |
| **executed_at** | `2026-06-07` |
| **batch** | HRM fidelity AC-FID-04..09 — insurance · attendance · leave · payroll · payslip · recruitment |
| **decision** | **GO WITH CONDITIONS** — AC-FID-04..07 promotable **localhost U32 only**; AC-FID-08..09 **OPEN** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## QA chain audited (AC-FID-04..09)

| AC-ID | work_item_id | QA evidence | QA verdict | QC gate |
|-------|--------------|-------------|------------|---------|
| **AC-FID-04** | `P1-HRM-H14-AC-FID-04-INS` | `docs/qa/evidence/p1-hrm-h14-ac-fid-04-ins-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-05** | `P1-HRM-H15-AC-FID-05-ATT` | `docs/qa/evidence/p1-hrm-h15-ac-fid-05-att-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-06** | `P1-HRM-H16-AC-FID-06-LEAVE-QA` | `docs/qa/evidence/p1-hrm-h16-ac-fid-06-leave-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-07** | `P1-HRM-H17-AC-FID-07-PAY-QA` | `docs/qa/evidence/p1-hrm-h17-ac-fid-07-pay-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-08** | `P1-HRM-H18-AC-FID-08-PAYSLIP` | *(missing)* — dev `READY_FOR_QA` @ `p1-hrm-h18-ac-fid-08-payslip-20260606.md` | **N/A** | **OPEN** |
| **AC-FID-09** | `P1-HRM-H19-AC-FID-09-REC` | *(missing)* — PM bus DISPATCHED dev-be; no dev/QA artifact | **N/A** | **OPEN** |

**Prior partial gate:** `docs/qa/evidence/qc-p1-phase1-batch-closeout-20260606.md` closed **AC-FID-04** only; this batch consolidates **04..07** and adjudicates **08..09** backlog.

---

## Scope (bounded — fidelity batch slice)

| In scope | Out of scope |
|----------|--------------|
| Per-company SQL probes + global `verify:hrm:menu-density` **7/7** for **AC-FID-04..07** | Phase 1 program closure / G1–G9 full gate |
| L2 API spot: P-CC-05 insurance · P-CC-07 attendance/leave · P-CC-08 payroll | **AC-FID-10+** settings/metadata fidelity |
| L2.5 API: **J-HRM-06** list→employee · **J-HRM-07** payslip carry-forward | nip.io / VPS `:8088` promotion |
| Localhost U32 group CEO `main` rollup | Full browser iframe click-path (deferred GWC) |
| Close **CARD-INS-01** · **CARD-ATT-01** · **CARD-LVE-01** · **CARD-PAY-01** (period leg) | **G-FID-08** program QC (requires AC-FID-01..07 + persona matrix) |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h14-ac-fid-04-ins-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h15-ac-fid-05-att-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h16-ac-fid-06-leave-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h17-ac-fid-07-pay-qa-20260606.md
```

| File | Exit | Score | Failures |
|------|------|-------|----------|
| H14 AC-FID-04 QA | **1** | **3/8** | `work_item_id` / `ack_status` table vs `:` regex; missing C/R/U/D keyword block |
| H15 AC-FID-05 QA | **1** | **3/8** | same format; missing C/R/U/D keyword block |
| H16 AC-FID-06 QA | **1** | **4/8** | same + missing explicit `J-*` block (scope parity table present) |
| H17 AC-FID-07 QA | **1** | **3/8** | same format; missing C/R/U/D keyword block |

**QC adjudication:** **PROCESS GWC** — all four packs contain substantive `work_item_id`, L0 tables, per-slug AC probes, defect closure, residual §, handoff contract; format gap **does not** block bounded product gate per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3 and H13/H11 regate precedent (**C-FIDQC-01**).

**AC-FID-08/09:** No QA pack → cannot verify; **product gate blocked** until QA publishes retest artifacts.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot 2026-06-07) | ENV | **PASS** |
| QA L0 exit **0** on H14–H17 packs | ENV | **PASS** (concurred) |
| **AC-FID-04** five slugs `insurance_ratio` **≥ 0.95**; probe exit **0** | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-05** five slugs `employee_ratio` **≥ 0.80**; group **13 291** ≥ **12 000** | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-06** group **100** leave; five slugs CARD-LVE-01 **PASS** | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-07** group **119** periods; five slugs **21** ≥ **12** | PRODUCT | **PASS** — **CLOSED** |
| `verify:hrm:menu-density` **7/7** (QA sessions) | PRODUCT / fidelity | **PASS** (concurred) |
| P-CC-05 insurance **1043** · P-CC-07 attendance **13095** · leave **75** · P-CC-08 **80** periods + **893** payslips | PRODUCT / L2 | **PASS** |
| **J-HRM-06** list→employee **200** · **J-HRM-07** carry-forward | PRODUCT / L2.5 API | **PASS** |
| **AC-FID-08** payslip closed-ratio ≥ 0.90 | PRODUCT | **OPEN** — dev seed only; **no QA retest** |
| **AC-FID-09** recruitment density | PRODUCT | **OPEN** — no wave evidence |
| API @ `main` scoped count ≠ DB group total (leave 75 vs 100; periods 80 vs 119) | Scope design | **GWC accepted** — ADR scope ladder rollup vs full group seed (QA documented) |
| Browser iframe tab clicks (P-CC-05/07/08) | Coverage | **GWC deferred** — API sufficient this batch |
| VPS / nip.io fidelity parity | ENV / deploy | **GWC deferred** — localhost only verified |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-06-07) | Result |
|-------|----------------------|--------|
| `pnpm run qc:dev-stack` | exit **0** | **PASS** |
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |

---

## AC-FID-04 — Insurance (H14)

| Slug | with_contract | with_insurance | ratio | Target | Verdict |
|------|---------------|----------------|-------|--------|---------|
| holding | 203 | 193 | **0.951** | ≥ 0.95 | **PASS** |
| trsport | 207 | 197 | **0.952** | ≥ 0.95 | **PASS** |
| logistics | 197 | 188 | **0.954** | ≥ 0.95 | **PASS** |
| finance | 207 | 197 | **0.952** | ≥ 0.95 | **PASS** |
| services | 197 | 188 | **0.954** | ≥ 0.95 | **PASS** |

**CARD-INS-01** **CLOSED** via `seed:hrm:insurance-density`. P-CC-05 API **1043** rows @ `main`.

---

## AC-FID-05 — Attendance (H15)

| Slug | active_emp | emp_with_min_days | employee_ratio | Target | Verdict |
|------|------------|-------------------|----------------|--------|---------|
| holding | 213 | 171 | **0.803** | ≥ 0.80 | **PASS** |
| trsport | 207 | 166 | **0.802** | ≥ 0.80 | **PASS** |
| logistics | 207 | 166 | **0.802** | ≥ 0.80 | **PASS** |
| finance | 207 | 166 | **0.802** | ≥ 0.80 | **PASS** |
| services | 207 | 166 | **0.802** | ≥ 0.80 | **PASS** |

**Group:** **13 291** ≥ **12 000**. **CARD-ATT-01** **CLOSED**. P-CC-07 attendance **13095** rows; no 1970 dates.

---

## AC-FID-06 — Leave (H16)

| Slug | active_emp | leave_count | target | Verdict |
|------|------------|-------------|--------|---------|
| holding | 213 | **15** | 11 | **PASS** |
| trsport | 207 | **15** | 11 | **PASS** |
| logistics | 207 | **15** | 11 | **PASS** |
| finance | 207 | **15** | 11 | **PASS** |
| services | 207 | **15** | 11 | **PASS** |

**Group:** **100** ≥ **100**. **CARD-LVE-01** **CLOSED**. P-CC-07 leave tab **75** scoped rows; pending+approved mix.

---

## AC-FID-07 — Payroll periods (H17)

| Slug | period_count | target | Verdict |
|------|--------------|--------|---------|
| holding | **21** | 12 | **PASS** |
| trsport | **21** | 12 | **PASS** |
| logistics | **21** | 12 | **PASS** |
| finance | **21** | 12 | **PASS** |
| services | **21** | 12 | **PASS** |

**Group:** **119** ≥ **60**. **CARD-PAY-01** (period leg) **CLOSED**. P-CC-08 **80** periods + **893** payslips @ `main`.

---

## AC-FID-08 — Payslips (H18) — OPEN

| Signal | Status |
|--------|--------|
| Dev handoff `p1-hrm-h18-ac-fid-08-payslip-20260606.md` | **READY_FOR_QA** — all five slugs payslip_ratio **≥ 0.901** on latest closed period 12/2025 |
| QA retest `p1-hrm-h18-ac-fid-08-payslip-qa-20260606.md` | **MISSING** |
| QC product gate | **BLOCKED** — cannot promote without QA L0 + SQL probe + P-CC-08/J-HRM-07 retest |

---

## AC-FID-09 — Recruitment (H19) — OPEN

| Signal | Status |
|--------|--------|
| PM bus `P1-HRM-H19-AC-FID-09-REC` DISPATCHED dev-be | No dev completion / QA artifact in evidence folder |
| Matrix target | ≥ **5** requisitions group; ≥ **15** candidates; ≥ **3** cand/req avg |
| QC product gate | **BLOCKED** — wave not ready for gate |

---

## Defect / condition adjudication

| ID | Prior | QC verdict |
|----|-------|------------|
| **AC-FID-04** | backlog ~0.07–0.09 ratio | **CLOSED** |
| **AC-FID-05** | sparse ~6% attendance | **CLOSED** |
| **AC-FID-06** | sparse ~25 group leave | **CLOSED** |
| **AC-FID-07** | group **59** periods | **CLOSED** |
| **AC-FID-08** | payslip ratio ~0.07–0.45 | **OPEN** — QA pending |
| **AC-FID-09** | recruitment pipeline sparse | **OPEN** — dev wave in flight |
| **R-H10-02** | `seed:hrm:fidelity` long TX | **OPEN (P2)** — non-blocking batch |
| **C-FIDQC-01** | Pack format verify | **OPEN (process GWC)** — 3/8–4/8 on H14–H17 QA files |

---

## J-* / L2.5 coverage (U19 audit)

| J-ID | Batch coverage | QC verdict |
|------|----------------|------------|
| **J-HRM-06** | H15 API list→employee **200** | **PASS** |
| **J-HRM-07** | H17 carry-forward payslip row id **PASS** | **PASS** (API; no GET-by-id endpoint) |
| **J-HRM-04** | Not re-run this batch | **GWC deferred** browser |
| P-CC-05/07/08 iframe clicks | API spot only | **GWC deferred** |

**NO-GO avoided:** QA bounded to API + SQL fidelity probes; full browser matrix not claimed.

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| **AC-FID-08** | qa | Dispatch retest on dev `READY_FOR_QA` payslip seed — `p1-hrm-h18-ac-fid-08-payslip-qa-20260606.md` |
| **AC-FID-09** | dev-be → qa | Recruitment density wave — await dev completion then QA |
| **C-FIDQC-01** | qa | Evidence pack format **3/8**–**4/8** on H14–H17 — process GWC |
| **C-FIDQC-02** | devops → qa | VPS/nip.io fidelity retest before promotion beyond localhost |
| **C-FIDQC-03** | qa | Browser L2.5 iframe clicks P-CC-05/07/08 (optional) |
| **R-H10-02** | dev-be | Unified `seed:hrm:fidelity` operability (P2) |

---

## Conditions (bounded)

| ID | Status | Condition | Owner |
|----|--------|-----------|-------|
| **C-FIDQC-01** | **OPEN (process)** | QA pack format **3/8** — add `ack_status:` line + J-* / CRUD keyword blocks for **8/8** on fidelity QA files | qa |
| **C-FIDQC-02** | **OPEN (deferred)** | VPS/nip.io retest AC-FID-04..07 before promotion beyond localhost | devops → qa |
| **AC-FID-08** | **OPEN (backlog)** | QA retest payslip closed-ratio ≥ 0.90 — dev handoff ready | qa |
| **AC-FID-09** | **OPEN (backlog)** | Recruitment pipeline density — dev wave + QA | dev-be → qa |
| **C-FIDQC-03** | **OPEN (optional)** | Browser L2.5 iframe click-path P-CC-05/07/08 | qa |

**Reopen trigger:** Any AC-FID-04..07 slug regresses below threshold; `verify:hrm:menu-density` **< 7/7**; scope **409** on P-CC-05/07/08; attendance dates epoch **1970**.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **AC-FID-04** + **CARD-INS-01** | **Promotable** localhost U32 |
| **AC-FID-05** + **CARD-ATT-01** | **Promotable** localhost U32 |
| **AC-FID-06** + **CARD-LVE-01** | **Promotable** localhost U32 |
| **AC-FID-07** + **CARD-PAY-01** (periods) | **Promotable** localhost U32 |
| **AC-FID-08** payslip closed-ratio | **NOT promoted** — QA pending |
| **AC-FID-09** recruitment | **NOT promoted** — wave open |
| nip.io / PROD / Phase 1 DONE / G-FID-08 | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor: fidelity batch **AC-FID-04..07 CLOSED** on localhost U32 with per-company SQL probes + menu-density **7/7**.
- Sync `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json` — mark **04..07 CLOSED**; keep **08..09 OPEN**.
- Dispatch **qa** `P1-HRM-H18-AC-FID-08-PAYSLIP` retest (dev READY_FOR_QA) before next QC re-gate on 08.
- Continue **dev-be** `P1-HRM-H19-AC-FID-09-REC` → QA when dev completes.
- Do **not** claim Phase 1 DONE, PROD, or **G-FID-08** program QC GO.

---

## Completion contract

**completion_report:** P1-HRM-FIDELITY-QC-BATCH-04-09 **GO WITH CONDITIONS**. Audited QA H14–H17 chain. L0 spot **PASS**. **AC-FID-04..07 CLOSED** and **promotable localhost U32**. **AC-FID-08** dev READY_FOR_QA — **OPEN** (no QA pack). **AC-FID-09** — **OPEN** (no wave evidence). Pack verify **3/8**–**4/8** process GWC. **NOT** Phase 1 DONE / **NOT** PROD.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-HRM fidelity batch 04-09 QC intake (GO WITH CONDITIONS localhost U32)

work_item_id: P1-HRM-PM-FIDELITY-BATCH-04-09-INTAKE
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-hrm-fidelity-batch-04-09-20260606.md — AC-FID-04..07 CLOSED local U32; 08/09 OPEN
exit_criteria: (1) Bus fidelity batch gate recorded; (2) PM_FIDELITY_STATUS.json — closed 04..07, open 08..09; (3) Dispatch qa P1-HRM-H18-AC-FID-08-PAYSLIP retest (READY_FOR_QA); (4) Track dev-be P1-HRM-H19-AC-FID-09-REC → QA; (5) NOT Phase 1 DONE / NOT PROD / NOT G-FID-08 GO
evidence_path: docs/qa/evidence/qc-p1-hrm-fidelity-batch-04-09-20260606.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-hrm-fidelity-batch-04-09-20260606.md`

**ack_status:** **PASS_TO_PM**
