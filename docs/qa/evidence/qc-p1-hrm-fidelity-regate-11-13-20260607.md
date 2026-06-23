# QC Gate Decision — P1-HRM-FIDELITY-QC-REGATE-11-13 (2026-06-07)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-FIDELITY-QC-REGATE-11-13` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `:28001` hrm-api · `:28002` xbos-api |
| **accounts** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) |
| **executed_at** | `2026-06-07` |
| **batch** | HRM fidelity AC-FID-04..13 re-gate — closes **11..13** after H21/H22/H23 QA PASS |
| **prior_gate** | `docs/qa/evidence/qc-p1-hrm-fidelity-batch-04-13-20260606.md` — **04..10 CLOSED** · **11..13 OPEN** |
| **decision** | **GO WITH CONDITIONS** — **AC-FID-04..13 promotable localhost U32 only** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **g_fid_08_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## QA chain audited (AC-FID-11..13 — new)

| AC-ID | work_item_id | QA evidence | QA verdict | QC gate |
|-------|--------------|-------------|------------|---------|
| **AC-FID-11** | `P1-HRM-H21-AC-FID-11-META-QA` | `docs/qa/evidence/p1-hrm-h21-ac-fid-11-meta-qa-20260607.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-12** | `P1-HRM-H22-AC-FID-12-OPS-QA` | `docs/qa/evidence/p1-hrm-h22-ac-fid-12-ops-qa-20260607.md` | **PASS_TO_PM** | **CLOSED** |
| **AC-FID-13** | `P1-HRM-H23-AC-FID-13-PERF-QA` | `docs/qa/evidence/p1-hrm-h23-ac-fid-13-perf-qa-20260607.md` | **PASS_TO_PM** | **CLOSED** |

**Shared probe JSON:** `docs/qa/evidence/p1-hrm-h21-h23-fidelity-qa-probe-20260607.json` — `batch_pass: true`

**Prior batch (04..10):** reaffirmed **CLOSED** per `qc-p1-hrm-fidelity-batch-04-13-20260606.md` — no regression signal in H21–H23 sessions.

---

## Scope (bounded — fidelity batch slice)

| In scope | Out of scope |
|----------|--------------|
| Per-company SQL probes + global `verify:hrm:menu-density` for **AC-FID-04..13** | Phase 1 program closure / G1–G9 full gate |
| L2 API spot: metadata · operations · performance + prior P-CC-05..08 fidelity APIs | **AC-FID-14+** persona RBAC matrix |
| L2.5 API list non-empty + scope parity notes (GET-by-id **404** accepted GWC) | nip.io / VPS `:8088` promotion |
| Localhost U32 group CEO `main` rollup | Full browser iframe click-path (deferred GWC) |
| Close **CARD-META/OPS/PERF** fidelity cards + batch **04..13** | **G-FID-08** program QC (requires persona matrix + VPS) |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h21-ac-fid-11-meta-qa-20260607.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h22-ac-fid-12-ops-qa-20260607.md
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-h23-ac-fid-13-perf-qa-20260607.md
```

| File | Exit | Score | Failures |
|------|------|-------|----------|
| H21 AC-FID-11 QA | **1** | **3/8** | `work_item_id` / `ack_status` table vs `:` regex; missing C/R/U/D keyword block |
| H22 AC-FID-12 QA | **1** | **3/8** | same format; missing C/R/U/D keyword block |
| H23 AC-FID-13 QA | **1** | **3/8** | same format; missing C/R/U/D keyword block |

**QC adjudication:** **PROCESS GWC** — all three packs contain substantive `work_item_id` table, L0 tables, SQL/API probes, defect closure, residual §, handoff contract; format gap **does not** block bounded product gate per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3 and prior batch **C-FIDQC-01** precedent.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot 2026-06-07) | ENV | **PASS** |
| QA L0 exit **0** on H21–H23 packs | ENV | **PASS** (concurred) |
| **AC-FID-11** linked **20** (pending **12**, historical **8**) | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-12** `hrm_tasks` **25**, `service_requests` **50** | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-13** cycles **14**, evaluations **300** | PRODUCT | **PASS** — **CLOSED** |
| `verify:hrm:menu-density` **11/11** (H21–H23 sessions) | PRODUCT / fidelity | **PASS** (concurred) |
| Metadata/ops/perf API @ `main` — no **409** | Scope | **PASS** |
| API task count **22** vs SQL **25** (rollup filter) | Scope design | **GWC accepted** — ADR scope ladder |
| GET-by-id metadata/ops/perf **404** HRM-DATA-404 | Coverage | **GWC accepted** — density wave; P3 deep-link parity deferred |
| Browser iframe tabs (decisions/ops/performance) | Coverage | **GWC deferred** — API sufficient this batch |
| **AC-FID-04..10** (prior batch) | PRODUCT | **CLOSED** (reaffirmed, no regression) |
| VPS / nip.io fidelity parity | ENV / deploy | **GWC deferred** — localhost only verified |
| Phase 1 DONE / PROD / G-FID-08 | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-06-07) | Result |
|-------|----------------------|--------|
| `pnpm run qc:dev-stack` | exit **0** | **PASS** |
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |

---

## AC-FID-11 — Metadata (H21) — CLOSED

| Metric | SQL | Target | API @ `main` | Verdict |
|--------|-----|--------|--------------|---------|
| **linked_total** | **20** | ≥ **20** | **20** (all list) | **PASS** |
| **pending** | **12** | ≥ **1** | **12** (pending filter) | **PASS** |
| **historical** | **8** | — | — | **PASS** |

Unit tests: `employee-metadata` **4/4** PASS. Scope UUID filter fix verified (prior empty-list defect **CLOSED**).

---

## AC-FID-12 — Operations (H22) — CLOSED

| table | SQL count | Target | API @ `main` | Verdict |
|-------|-----------|--------|--------------|---------|
| **hrm_tasks** | **25** | ≥ **25** | **22** (rollup visible) | **PASS** |
| **service_requests** | **50** | ≥ **50** | **50** | **PASS** |

---

## AC-FID-13 — Performance (H23) — CLOSED

| metric | SQL count | Target | API @ `main` | Verdict |
|--------|-----------|--------|--------------|---------|
| **performance_cycles** | **14** | ≥ **5** | **14** | **PASS** |
| **performance_evaluations** | **300** | ≥ **300** | **300** | **PASS** |

**QA note concurred:** do not pass `page_size` on performance list DTOs — `forbidNonWhitelisted` → **400** false FAIL.

---

## Defect / condition adjudication

| ID | Prior (batch 04-13) | QC verdict |
|----|---------------------|------------|
| **AC-FID-04..10** | CLOSED | **CLOSED** (reaffirmed) |
| **AC-FID-11** | OPEN — QA pending | **CLOSED** (H21 QA PASS) |
| **AC-FID-12** | OPEN — QA pending | **CLOSED** (H22 QA PASS) |
| **AC-FID-13** | OPEN — QA pending | **CLOSED** (H23 QA PASS) |
| **C-FIDQC-01** | Pack format 3/8–4/8 | **OPEN (process GWC)** — H21–H23 also **3/8** |
| **C-FIDQC-02** | VPS deferred | **OPEN (deferred)** — unchanged |
| **C-FIDQC-03** | Browser iframe optional | **OPEN (optional)** — unchanged |
| **R-H10-02** | seed stdout noise | **OPEN (P2)** — non-blocking |

---

## J-* / L2.5 coverage (U19 audit)

| J-ID / slice | Batch coverage | QC verdict |
|--------------|----------------|------------|
| **J-HRM-05/06/07** | Prior H19/H15/H17–H18 API | **PASS** (reaffirmed) |
| Metadata list API | H21 pending + all **200** non-empty | **PASS** (API; no list→detail route) |
| Operations list API | H22 tasks + service-requests **200** | **PASS** (API; GET-by-id **404** GWC) |
| Performance list API | H23 cycles + evaluations **200** | **PASS** (API; GET-by-id **404** GWC) |
| P-CC decisions/ops/performance iframe clicks | Not re-run | **GWC deferred** |
| **J-HRM-04** browser | Not re-run this batch | **GWC deferred** |

**NO-GO avoided:** QA bounded to API + SQL fidelity probes; full browser matrix not claimed for 11..13.

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| **C-FIDQC-01** | qa | Evidence pack format **3/8** on H14–H23 — add `ack_status:` line + J-* / CRUD keyword blocks |
| **C-FIDQC-02** | devops → qa | VPS/nip.io fidelity retest **AC-FID-04..13** before promotion beyond localhost |
| **C-FIDQC-03** | qa | Browser L2.5 iframe clicks P-CC-05..08 + metadata/ops/performance tabs (optional) |
| **GET-by-id** metadata/ops/perf | dev-be | **P3** — deep-link parity deferred |
| **R-H10-02** | dev-be | Density seed stdout on verify import (P2) |

---

## Conditions (bounded)

| ID | Status | Condition | Owner |
|----|--------|-----------|-------|
| **C-FIDQC-01** | **OPEN (process)** | QA pack format **3/8** — target **8/8** on fidelity QA files | qa |
| **C-FIDQC-02** | **OPEN (deferred)** | VPS/nip.io retest AC-FID-04..13 before promotion beyond localhost | devops → qa |
| **C-FIDQC-03** | **OPEN (optional)** | Browser L2.5 iframe click-path fidelity tabs | qa |
| **GET-by-id P3** | **OPEN (optional)** | List→detail routes for metadata/ops/performance | dev-be |

**Reopen trigger:** Any AC-FID-04..13 slug regresses below threshold; `verify:hrm:menu-density` **< 11/11**; scope **409** on fidelity APIs; attendance dates epoch **1970**.

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **AC-FID-04..10** | **Promotable** localhost U32 (prior batch reaffirmed) |
| **AC-FID-11** metadata queue density | **Promotable** localhost U32 |
| **AC-FID-12** operations tasks + service requests | **Promotable** localhost U32 |
| **AC-FID-13** performance cycles + evaluations | **Promotable** localhost U32 |
| **Batch AC-FID-04..13** | **Promotable** localhost U32 (GWC conditions above) |
| nip.io / PROD / Phase 1 DONE / **G-FID-08** | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor: fidelity batch **AC-FID-04..13 CLOSED** on localhost U32 — menu-density **11/11**; H21/H22/H23 QA PASS closes prior **11..13 OPEN** from batch 04-13.
- Sync `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json` — mark **04..13 CLOSED** local U32.
- Next backlog: **AC-FID-14+** persona matrix or **G-FID-08** program gate — **not** in this slice.
- Do **not** claim Phase 1 DONE, PROD, or **G-FID-08** GO until persona + VPS conditions close.

---

## Completion contract

**completion_report:** P1-HRM-FIDELITY-QC-REGATE-11-13 **GO WITH CONDITIONS**. Audited QA H21–H23 chain (3 packs) + prior batch 04..10. L0 spot **PASS**. **AC-FID-11..13 CLOSED**; **AC-FID-04..13 batch promotable localhost U32**. Pack verify **3/8** process GWC. **NOT** Phase 1 DONE / **NOT** PROD / **NOT** G-FID-08.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-HRM fidelity regate 11-13 QC intake (GO WITH CONDITIONS localhost U32)

work_item_id: P1-HRM-PM-FIDELITY-REGATE-11-13-INTAKE
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-hrm-fidelity-regate-11-13-20260607.md — AC-FID-04..13 CLOSED local U32; supersedes batch 04-13 OPEN 11..13
exit_criteria: (1) Bus regate gate recorded; (2) PM_FIDELITY_STATUS.json + HRM_MENU_DATA_LINKAGE_MATRIX — mark 04..13 CLOSED local U32; (3) PM dispatch AC-FID-14+ wave or G-FID-08 persona prep per backlog; (4) NOT Phase 1 DONE / NOT PROD / NOT G-FID-08 GO
evidence_path: docs/qa/evidence/qc-p1-hrm-fidelity-regate-11-13-20260607.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-hrm-fidelity-regate-11-13-20260607.md`

**ack_status:** **PASS_TO_PM**
