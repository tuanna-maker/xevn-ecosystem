# QC Gate Decision — P1-HRM-FIDELITY-QC-BATCH-04-13 (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-FIDELITY-QC-BATCH-04-13` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `:28001` hrm-api · `:28002` xbos-api |
| **accounts** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) |
| **executed_at** | `2026-06-07` |
| **batch** | HRM fidelity AC-FID-04..13 — insurance · attendance · leave · payroll · payslip · recruitment · catalogs · metadata · operations · performance |
| **decision** | **GO WITH CONDITIONS** — AC-FID-04..10 promotable **localhost U32 only**; AC-FID-11..13 **OPEN** (QA pending) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## QA chain audited (AC-FID-04..13)

| AC-ID | work_item_id | QA evidence | QA verdict | QC gate |
|-------|--------------|-------------|------------|---------|
| **AC-FID-04** | `P1-HRM-H14-AC-FID-04-INS` | `docs/qa/evidence/p1-hrm-h14-ac-fid-04-ins-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-05** | `P1-HRM-H15-AC-FID-05-ATT` | `docs/qa/evidence/p1-hrm-h15-ac-fid-05-att-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-06** | `P1-HRM-H16-AC-FID-06-LEAVE-QA` | `docs/qa/evidence/p1-hrm-h16-ac-fid-06-leave-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-07** | `P1-HRM-H17-AC-FID-07-PAY-QA` | `docs/qa/evidence/p1-hrm-h17-ac-fid-07-pay-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-08** | `P1-HRM-H18-AC-FID-08-PAYSLIP-QA` | `docs/qa/evidence/p1-hrm-h18-ac-fid-08-payslip-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-09** | `P1-HRM-H19-AC-FID-09-REC-QA` | `docs/qa/evidence/p1-hrm-h19-ac-fid-09-rec-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-10** | `P1-HRM-H20-AC-FID-10-CAT-QA` | `docs/qa/evidence/p1-hrm-h20-ac-fid-10-cat-qa-20260606.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-11** | `P1-HRM-H21-AC-FID-11-META` | *(missing)* — dev `READY_FOR_QA` @ `p1-hrm-h21-ac-fid-11-meta-20260606.md` | **N/A** | **OPEN** |
| **AC-FID-12** | `P1-HRM-H22-AC-FID-12-OPS` | *(missing)* — dev `READY_FOR_QA` @ `p1-hrm-h22-ac-fid-12-ops-20260606.md` | **N/A** | **OPEN** |
| **AC-FID-13** | `P1-HRM-H23-AC-FID-13-PERF` | *(missing)* — dev `READY_FOR_QA` @ `p1-hrm-h23-ac-fid-13-perf-20260606.md` | **N/A** | **OPEN** |

**Prior partial gate:** `docs/qa/evidence/qc-p1-hrm-fidelity-batch-04-09-20260606.md` closed **AC-FID-04..07** with **08/09 OPEN**; this batch uplifts to **04..10 CLOSED** and adjudicates **11..13** backlog.

---

## Scope (bounded — fidelity batch slice)

| In scope | Out of scope |
|----------|--------------|
| Per-company SQL probes + global `verify:hrm:menu-density` for **AC-FID-04..10** | Phase 1 program closure / G1–G9 full gate |
| L2 API spot: P-CC-05 insurance · P-CC-06 recruitment · P-CC-07 attendance/leave · P-CC-08 payroll · settings-catalogs | **AC-FID-14+** persona RBAC matrix |
| L2.5 API: **J-HRM-05** · **J-HRM-06** · **J-HRM-07** | nip.io / VPS `:8088` promotion |
| Localhost U32 group CEO `main` rollup + member slug API (H20) | Full browser iframe click-path (deferred GWC) |
| Close **CARD-INS/ATT/LVE/PAY/REC-01/02** fidelity cards | **G-FID-08** program QC (requires AC-FID-01..13 + persona matrix) |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h14-ac-fid-04-ins-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h15-ac-fid-05-att-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h16-ac-fid-06-leave-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h17-ac-fid-07-pay-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h18-ac-fid-08-payslip-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h19-ac-fid-09-rec-qa-20260606.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h20-ac-fid-10-cat-qa-20260606.md
```

| File | Exit | Score | Failures |
|------|------|-------|----------|
| H14 AC-FID-04 QA | **1** | **3/8** | `work_item_id` / `ack_status` table vs `:` regex; missing C/R/U/D keyword block |
| H15 AC-FID-05 QA | **1** | **3/8** | same format; missing C/R/U/D keyword block |
| H16 AC-FID-06 QA | **1** | **4/8** | same + missing explicit `J-*` block |
| H17 AC-FID-07 QA | **1** | **3/8** | same format; missing C/R/U/D keyword block |
| H18 AC-FID-08 QA | **1** | **3/8** | same format; missing C/R/U/D keyword block |
| H19 AC-FID-09 QA | **1** | **3/8** | same format; missing C/R/U/D keyword block |
| H20 AC-FID-10 QA | **1** | **4/8** | same + missing explicit `J-*` block |

**QC adjudication:** **PROCESS GWC** — all seven packs contain substantive `work_item_id`, L0 tables, per-slug AC probes, defect closure, residual §, handoff contract; format gap **does not** block bounded product gate per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3 and H13/H11 regate precedent (**C-FIDQC-01**).

**AC-FID-11/12/13:** No QA pack → cannot verify; **product gate blocked** until QA publishes retest artifacts.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot 2026-06-07) | ENV | **PASS** |
| QA L0 exit **0** on H14–H20 packs | ENV | **PASS** (concurred) |
| **AC-FID-04** five slugs `insurance_ratio` **≥ 0.95** | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-05** five slugs `employee_ratio` **≥ 0.80**; group **13 291** | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-06** group **100** leave; five slugs CARD-LVE-01 **PASS** | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-07** group **119** periods; five slugs **21** ≥ **12** | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-08** five slugs payslip_ratio **≥ 0.901** @ 12/2025 closed | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-09** req **38**, cand **114**, avg **3.000**, zero under-min | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-10** five slugs **74** distinct catalog keys (API **76**) | PRODUCT | **PASS** — **CLOSED** |
| `verify:hrm:menu-density` **8/8** (H19/H20 sessions) | PRODUCT / fidelity | **PASS** (concurred) |
| **AC-FID-11** metadata linked **20** (dev only) | PRODUCT | **OPEN** — **no QA retest** |
| **AC-FID-12** tasks **25**, service_requests **50** (dev only) | PRODUCT | **OPEN** — **no QA retest** |
| **AC-FID-13** cycles **14**, evaluations **300** (dev only) | PRODUCT | **OPEN** — **no QA retest** |
| API @ `main` scoped count ≠ DB group total | Scope design | **GWC accepted** — ADR scope ladder rollup vs full group seed |
| Browser iframe tab clicks | Coverage | **GWC deferred** — API sufficient this batch |
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

## AC-FID-08 — Payslips (H18) — CLOSED

| company_id | ratio @ 12/2025 closed | Target | Verdict |
|------------|------------------------|--------|---------|
| holding | **0.901** | ≥ 0.90 | **PASS** |
| trsport | **0.903** | ≥ 0.90 | **PASS** |
| logistics | **0.903** | ≥ 0.90 | **PASS** |
| finance | **0.903** | ≥ 0.90 | **PASS** |
| services | **0.903** | ≥ 0.90 | **PASS** |

**Group DB:** **1905** payslips. P-CC-08 API **80** periods + **1833** payslips @ `main`. **CARD-PAY-01** payslip leg **CLOSED**.

---

## AC-FID-09 — Recruitment (H19) — CLOSED

| Metric | Value | Threshold | Verdict |
|--------|-------|-----------|---------|
| Group requisitions | **38** | ≥ **5** | **PASS** |
| Group candidates | **114** | ≥ **15** | **PASS** |
| Avg candidates / requisition | **3.000** | ≥ **3** | **PASS** |
| Requisitions with < 3 candidates | **0** | **0** | **PASS** |

P-CC-06 API **24** reqs + **99** candidates @ `main`. **CARD-REC-01/02** **CLOSED**.

---

## AC-FID-10 — Catalogs (H20) — CLOSED

| company_id | distinct_keys (DB) | API count | Target | Verdict |
|------------|-------------------|-----------|--------|---------|
| holding | **74** | **76** | ≥ **8** | **PASS** |
| trsport | **74** | **76** | ≥ **8** | **PASS** |
| logistics | **74** | **76** | ≥ **8** | **PASS** |
| finance | **74** | **76** | ≥ **8** | **PASS** |
| services | **74** | **76** | ≥ **8** | **PASS** |

Member slugs uplift **0 → 74** keys. No **409** on settings-catalogs API.

---

## AC-FID-11..13 — OPEN (dev READY_FOR_QA, no QA artifact)

| AC-ID | Dev evidence | Dev claims | QC gate |
|-------|--------------|------------|---------|
| **AC-FID-11** | `p1-hrm-h21-ac-fid-11-meta-20260606.md` | linked **20** metadata requests; scope UUID filter fix; menu-density **11/11** | **OPEN** — QA retest required |
| **AC-FID-12** | `p1-hrm-h22-ac-fid-12-ops-20260606.md` | tasks **25**, service_requests **50**; menu-density **10/10** | **OPEN** — QA retest required |
| **AC-FID-13** | `p1-hrm-h23-ac-fid-13-perf-20260606.md` | cycles **14**, evaluations **300**; menu-density **10/10** | **OPEN** — QA retest required |

**QC rule:** Dev `READY_FOR_QA` density claims **cannot** promote without independent QA L0 + SQL/API probe per `QC_ZERO_DEFECT_REFORM_PLAN.md` Layer A.

---

## Defect / condition adjudication

| ID | Prior | QC verdict |
|----|-------|------------|
| **AC-FID-04..07** | partial batch 04-09 | **CLOSED** (reaffirmed) |
| **AC-FID-08** | OPEN in batch 04-09 | **CLOSED** (H18 QA PASS) |
| **AC-FID-09** | OPEN in batch 04-09 | **CLOSED** (H19 QA PASS) |
| **AC-FID-10** | backlog member slugs 0 keys | **CLOSED** (H20 QA PASS) |
| **AC-FID-11..13** | dev waves READY_FOR_QA | **OPEN** — QA pending |
| **R-H10-02** | `seed:hrm:fidelity` long TX | **OPEN (P2)** — non-blocking batch |
| **C-FIDQC-01** | Pack format verify | **OPEN (process GWC)** — 3/8–4/8 on H14–H20 QA files |

---

## J-* / L2.5 coverage (U19 audit)

| J-ID | Batch coverage | QC verdict |
|------|----------------|------------|
| **J-HRM-05** | H19 list→GET requisition detail **200** | **PASS** |
| **J-HRM-06** | H15 API list→employee **200** | **PASS** |
| **J-HRM-07** | H17/H18 payslip row id + non-empty list **PASS** | **PASS** (API; no GET-by-id endpoint) |
| **J-HRM-04** | Not re-run this batch | **GWC deferred** browser |
| P-CC-05/06/07/08 iframe clicks | API spot only | **GWC deferred** |
| Metadata / operations / performance L2.5 | AC-FID-11..13 QA missing | **NOT tested** |

**NO-GO avoided:** QA bounded to API + SQL fidelity probes; full browser matrix not claimed for 11..13.

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| **AC-FID-11** | qa | Retest dev `READY_FOR_QA` — `p1-hrm-h21-ac-fid-11-meta-20260606-qa.md` |
| **AC-FID-12** | qa | Retest dev `READY_FOR_QA` — `p1-hrm-h22-ac-fid-12-ops-qa-20260606.md` |
| **AC-FID-13** | qa | Retest dev `READY_FOR_QA` — `p1-hrm-h23-ac-fid-13-perf-qa-20260606.md` |
| **C-FIDQC-01** | qa | Evidence pack format **3/8** — add `ack_status:` line + J-* / CRUD keyword blocks |
| **C-FIDQC-02** | devops → qa | VPS/nip.io fidelity retest before promotion beyond localhost |
| **C-FIDQC-03** | qa | Browser L2.5 iframe clicks P-CC-05..08 (optional) |
| **R-H10-02** | dev-be | Unified `seed:hrm:fidelity` operability (P2) |

---

## Conditions (bounded)

| ID | Status | Condition | Owner |
|----|--------|-----------|-------|
| **C-FIDQC-01** | **OPEN (process)** | QA pack format **3/8**–**4/8** — target **8/8** on fidelity QA files | qa |
| **C-FIDQC-02** | **OPEN (deferred)** | VPS/nip.io retest AC-FID-04..10 before promotion beyond localhost | devops → qa |
| **AC-FID-11** | **OPEN (backlog)** | QA retest metadata queue ≥ 20 linked | qa |
| **AC-FID-12** | **OPEN (backlog)** | QA retest operations tasks ≥ 25 + service_requests ≥ 50 | qa |
| **AC-FID-13** | **OPEN (backlog)** | QA retest performance cycles ≥ 5 + evaluations ≥ 300 | qa |
| **C-FIDQC-03** | **OPEN (optional)** | Browser L2.5 iframe click-path P-CC-05..08 | qa |

**Reopen trigger:** Any AC-FID-04..10 slug regresses below threshold; `verify:hrm:menu-density` **< 8/8**; scope **409** on fidelity APIs; attendance dates epoch **1970**.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **AC-FID-04** + **CARD-INS-01** | **Promotable** localhost U32 |
| **AC-FID-05** + **CARD-ATT-01** | **Promotable** localhost U32 |
| **AC-FID-06** + **CARD-LVE-01** | **Promotable** localhost U32 |
| **AC-FID-07** + **CARD-PAY-01** (periods) | **Promotable** localhost U32 |
| **AC-FID-08** payslip closed-ratio | **Promotable** localhost U32 |
| **AC-FID-09** recruitment pipeline | **Promotable** localhost U32 |
| **AC-FID-10** synced catalogs per slug | **Promotable** localhost U32 |
| **AC-FID-11** metadata | **NOT promoted** — QA pending |
| **AC-FID-12** operations | **NOT promoted** — QA pending |
| **AC-FID-13** performance | **NOT promoted** — QA pending |
| nip.io / PROD / Phase 1 DONE / G-FID-08 | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor: fidelity batch **AC-FID-04..10 CLOSED** on localhost U32 with per-company SQL probes + menu-density **8/8**.
- Sync `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json` — mark **04..10 CLOSED**; keep **11..13 OPEN**.
- Dispatch **qa** retest H21/H22/H23 (all dev `READY_FOR_QA`) before next QC re-gate on 11..13.
- Do **not** claim Phase 1 DONE, PROD, or **G-FID-08** program QC GO.

---

## Completion contract

**completion_report:** P1-HRM-FIDELITY-QC-BATCH-04-13 **GO WITH CONDITIONS**. Audited QA H14–H20 chain (7 packs). L0 spot **PASS**. **AC-FID-04..10 CLOSED** and **promotable localhost U32**. **AC-FID-11..13** dev READY_FOR_QA — **OPEN** (no QA packs). Pack verify **3/8**–**4/8** process GWC. **NOT** Phase 1 DONE / **NOT** PROD.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-HRM fidelity batch 04-13 QC intake (GO WITH CONDITIONS localhost U32)

work_item_id: P1-HRM-PM-FIDELITY-BATCH-04-13-INTAKE
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-hrm-fidelity-batch-04-13-20260606.md — AC-FID-04..10 CLOSED local U32; 11..13 OPEN
exit_criteria: (1) Bus fidelity batch gate recorded; (2) PM_FIDELITY_STATUS.json — closed 04..10, open 11..13; (3) Dispatch qa P1-HRM-H21-AC-FID-11-META + P1-HRM-H22-AC-FID-12-OPS + P1-HRM-H23-AC-FID-13-PERF retests (all READY_FOR_QA); (4) After QA PASS dispatch qc P1-HRM-FIDELITY-QC-BATCH-11-13 re-gate; (5) NOT Phase 1 DONE / NOT PROD / NOT G-FID-08 GO
evidence_path: docs/qa/evidence/qc-p1-hrm-fidelity-batch-04-13-20260606.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-hrm-fidelity-batch-04-13-20260606.md`

**ack_status:** **PASS_TO_PM**
