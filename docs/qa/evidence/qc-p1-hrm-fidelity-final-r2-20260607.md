# QC Gate Decision — P1-HRM-FIDELITY-QC-FINAL-R2 (2026-06-07)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-FIDELITY-QC-FINAL-R2` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `:28001` hrm-api · `:28002` xbos-api |
| **accounts** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) |
| **executed_at** | `2026-06-07` |
| **batch** | HRM fidelity **final slice R2** — target close **AC-FID-04..16** localhost U32 |
| **prior_gate** | `docs/qa/evidence/qc-p1-hrm-fidelity-final-20260607.md` — **NO-GO (process)** (QA pack missing) |
| **prior_regate** | `docs/qa/evidence/qc-p1-hrm-fidelity-regate-11-13-20260607.md` — **04..13 CLOSED** GWC |
| **decision** | **GO WITH CONDITIONS** — **AC-FID-04..16 promotable localhost U32 only** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **g_fid_08_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC R2 audits the full fidelity chain **04..16** after H25 UI PASS, H26 initial FAIL → dev-be fix, and regate **11..13**. **AC-FID-04..15** close on bounded QA evidence (pack format process GWC). **AC-FID-16** closes on **dev-be fix chain + QC independent reproduction** (probe exit **0**, row-level lineage **1.000** all five slugs) — superseding initial QA FAIL; formal QA retest pack after fix is **still absent** (process condition).

**NOT** Phase 1 DONE · **NOT** PROD · **NOT** unconditional **G-FID-08** program GO (G-FID-01..07 + VPS persona remain outside this slice).

---

## QA / Dev chain audited

| AC-ID | work_item_id | Evidence | Lane verdict | QC gate |
|-------|--------------|----------|--------------|---------|
| **04..10** | H14–H20 | `qc-p1-hrm-fidelity-batch-04-13-20260606.md` + per-wave QA | prior CLOSED | **CLOSED** (reaffirmed) |
| **11..13** | H21–H23 | `p1-hrm-h21-ac-fid-11-meta-qa-20260607.md` … `p1-hrm-h23-ac-fid-13-perf-qa-20260607.md` | PASS_TO_PM | **CLOSED** |
| **14** | H24 RBAC | `p1-hrm-h24-ac-fid-14-rbac-20260607.md` | PASS_TO_PM | **CLOSED** |
| **15** | H25 UI | `p1-hrm-h25-ac-fid-15-ui-20260607.md` | PASS_TO_PM | **CLOSED** |
| **16** | H26 lineage | `p1-hrm-h26-ac-fid-16-lineage-20260607.md` (**FAIL**) → `p1-hrm-h26-ac-fid-16-lineage-fix-20260607.md` (**READY_FOR_QA**) | FAIL → fix | **CLOSED** (QC spot + dev-be; see §AC-FID-16) |

**Bus note:** `pm -> qa DISPATCHED P1-HRM-H26-AC-FID-16-LINEAGE-RETEST` @ `01:35` — no `qa -> pm PASS_TO_PM` retest file on disk at QC audit time.

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `p1-hrm-h25-ac-fid-15-ui-20260607.md` | **1** | **2/8** | **PROCESS GWC** — substantive L0/L2/probe/handoff; format gap non-blocking |
| `p1-hrm-h26-ac-fid-16-lineage-20260607.md` | — | FAIL artifact | Superseded by fix + QC spot |
| `p1-hrm-h26-ac-fid-16-lineage-fix-20260607.md` | N/A (dev) | READY_FOR_QA | Audited as fix chain input |
| Combined QA pack `qc-p1-hrm-fidelity-final-r2-20260607.md` (QA) | **N/A** | — | **Not published by QA**; QC verdict is this file |

Per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3: H25/H26 split packs adjudicated **process GWC**; product gate proceeds on bounded runtime evidence + QC spot.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` exit **0** (QC spot 2026-06-07) | ENV | **PASS** |
| `verify:hrm:menu-density` **11/11** (QC spot) | PRODUCT / fidelity | **PASS** |
| **AC-FID-15** P-CC-03..08 spot **6/6** + zero `:54321` | PRODUCT | **PASS** — **CLOSED** |
| **AC-FID-16** distinct-code probe **0** fail / row lineage **1.000** | PRODUCT | **PASS** — **CLOSED** (QC spot) |
| H26 QA formal retest pack missing | PROCESS | **GWC** — **C-FIDQC-05** |
| VPS / nip.io fidelity | ENV / deploy | **GWC deferred** |
| Phase 1 DONE / PROD / **G-FID-08** | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-06-07) | Result |
|-------|------------------------|--------|
| `pnpm run qc:dev-stack` | exit **0** | **PASS** |
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |

---

## AC-FID-15 — UI fidelity (H25) — CLOSED

Concurs `p1-hrm-h25-ac-fid-15-ui-20260607.md`:

| Criterion | Evidence | QC verdict |
|-----------|----------|------------|
| No «empty OK» on API 4xx/5xx | Invalid scope **409** `SCOPE_CONTEXT_MISMATCH`; `HrmListLoadBanner` / `HrmApiHealthBanner` | **PASS** |
| No required `:54321` on P-CC-03..08 | Browser CDP `badCount=0`; `supabaseRestGuard` **3/3** | **PASS** |
| P-CC-03..08 data @ `main` | Probe **6/6** non-empty (1107 emp, 1043 ins, 24 rec, 13095 att, 1833 payslips) | **PASS** |

**GWC accepted (non-blocking):** GWC-FID15-01 transient 500 warm-up; GWC-FID15-02 portal health banner without JWT; GWC-FID15-04 J-HRM iframe clicks deferred.

---

## AC-FID-16 — Catalog lineage (H26) — CLOSED (GWC process)

| Stage | Artifact | Result |
|-------|----------|--------|
| Initial QA | `p1-hrm-h26-ac-fid-16-lineage-20260607.md` | **FAIL** — 35 probe failures; lineage **0%–40%** |
| Dev-BE fix | `p1-hrm-h26-ac-fid-16-lineage-fix-20260607.md` | Migration + snapshot expand; probe **exit 0** claimed |
| QA retest | *(missing)* | **No PASS_TO_PM file** |
| **QC spot** | `node ./scripts/tmp-p1-hrm-acfid16-lineage-probe.mjs` | **exit 0** — `=== AC-FID-16 PASS ===` |
| **QC spot** | `node ./scripts/tmp-p1-hrm-acfid16-row-level.mjs` | **exit 0** — all slugs **lineage_pct: 1.000** |
| Probe JSON | `p1-hrm-h26-ac-fid-16-lineage-probe-20260607.json` | `summary.pass: true`, `fail_probes: 0` |

**QC adjudication:** Initial FAIL **superseded** by auditable dev-be fix + independent reproduction. **CLOSED** localhost U32 with **C-FIDQC-05** (QA formal retest pack for audit trail).

---

## Prior slices reaffirmed (04..14)

| Slice | Status |
|-------|--------|
| **AC-FID-04..13** | **CLOSED** per `qc-p1-hrm-fidelity-regate-11-13-20260607.md` |
| **AC-FID-14** RBAC persona | **CLOSED** per H24 QA |
| Menu-density **11/11** | **PASS** (QC spot — no regression) |

---

## J-* / L2.5 coverage (U19 audit)

| J-ID / slice | Coverage | QC verdict |
|--------------|----------|------------|
| Prior J-HRM API (04..14) | H14–H24 chain | **PASS** (reaffirmed) |
| **AC-FID-15** P-CC-03..08 embed | H25 API + CDP 54321 sweep | **PASS** (API; iframe clicks GWC deferred) |
| **AC-FID-16** catalog lineage | SQL probes only | **PASS** (no UI journey required) |
| Full browser J-HRM-01..07 iframe | Not re-run this batch | **GWC deferred** |

---

## Defect / condition adjudication

| ID | Prior | QC verdict |
|----|-------|------------|
| **AC-FID-04..15** | CLOSED / OPEN→CLOSED | **CLOSED** localhost U32 |
| **AC-FID-16** | OPEN (FAIL) | **CLOSED** (GWC process — C-FIDQC-05) |
| **C-FIDQC-01** | Pack format 2/8–3/8 | **OPEN (process GWC)** |
| **C-FIDQC-02** | VPS deferred | **OPEN (deferred)** |
| **C-FIDQC-03** | Browser iframe optional | **OPEN (optional)** |
| **C-FIDQC-05** | — | **NEW OPEN (process)** — H26 QA retest pack absent |

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| **C-FIDQC-05** | qa | Publish `p1-hrm-h26-ac-fid-16-lineage-retest-20260607.md` (or equivalent) + `verify:qc:evidence-pack` after fix |
| **C-FIDQC-01** | qa | Pack format **2/8** on H24/H25 — target **8/8** |
| **C-FIDQC-02** | devops → qa | VPS/nip.io retest **AC-FID-04..16** before promotion beyond localhost |
| **C-FIDQC-03** | qa | Browser L2.5 iframe clicks (optional) |
| **G-FID-08** | qc / pm | **NOT MET** — G-FID-01..07 program gates + VPS persona not closed this wave |

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **AC-FID-04..16** | **Promotable** localhost U32 (**GO WITH CONDITIONS**) |
| **G-FID fidelity AC batch (04..16)** | **GWC promotable** — density **11/11** + lineage **100%** + UI/no-54321 |
| **G-FID-08** program QC | **NOT MET** |
| nip.io / PROD / Phase 1 DONE | **NOT claimed** |

---

## pm_dispatch_hint

- Sponsor: fidelity **AC-FID-04..16 CLOSED** localhost U32 (GWC) — menu-density **11/11**, catalog lineage **100%**, UI fidelity PASS.
- PM may sync `PM_FIDELITY_STATUS.json` → all **04..16 closed** local U32; keep **open** for VPS until C-FIDQC-02.
- **Do not** claim Phase 1 DONE, PROD, or **G-FID-08** GO until program gates G-FID-01..07 + pilot promotion close.
- Optional: dispatch QA narrow pack hygiene (C-FIDQC-05) — non-blocking for localhost slice.

---

## Completion contract

**completion_report:** P1-HRM-FIDELITY-QC-FINAL-R2 **GO WITH CONDITIONS**. Audited regate 11–13 + H24/H25/H26 chain. L0 **PASS**. **AC-FID-04..16 promotable localhost U32**. H26 initial FAIL superseded by dev-be fix + QC spot (probe **0**, lineage **1.000**). H26 QA retest pack **missing** (C-FIDQC-05). **NOT** Phase 1 DONE / **NOT** PROD / **NOT** G-FID-08.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
@pm — P1-HRM fidelity final R2 QC intake (GO WITH CONDITIONS localhost U32)

work_item_id: P1-HRM-PM-FIDELITY-FINAL-R2-INTAKE
entry_criteria: QC PASS_TO_PM docs/qa/evidence/qc-p1-hrm-fidelity-final-r2-20260607.md — AC-FID-04..16 GWC promotable local U32; supersedes qc-p1-hrm-fidelity-final-20260607.md NO-GO (process)
exit_criteria: (1) Bus R2 gate recorded; (2) PM_FIDELITY_STATUS.json — mark AC-FID-04..16 CLOSED local U32; (3) Optional QA C-FIDQC-05 H26 retest pack for audit hygiene; (4) PM program next: G-FID-08 prep / VPS C-FIDQC-02 — NOT Phase 1 DONE / NOT PROD / NOT G-FID-08 unconditional GO
evidence_path: docs/qa/evidence/qc-p1-hrm-fidelity-final-r2-20260607.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-p1-hrm-fidelity-final-r2-20260607.md`

**ack_status:** **PASS_TO_PM**
