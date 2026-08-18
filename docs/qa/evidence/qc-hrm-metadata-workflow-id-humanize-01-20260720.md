# QC Gate Decision — QC-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01 (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01` |
| **closes** | **C-HRM-MENU-SWEEP-01** / `D-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01` |
| **parent** | `QC-HRM-MENU-FULL-SWEEP-01` · `docs/qa/evidence/qc-hrm-menu-full-sweep-01-20260720.md` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **decision** | **GO** — residual metadata workflow-id humanize close only; **parent menu-sweep GWC retained** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | `2026-07-20` |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · **do not reopen** chrome-strip CLOSED |
| **qa_evidence** | `docs/qa/evidence/qa-hrm-metadata-workflow-id-humanize-01-20260720.md` (**PASS_TO_PM**) |
| **fe_evidence** | `docs/qa/evidence/d-hrm-metadata-workflow-id-humanize-01-fe-20260720.md` (**READY_FOR_QA**) |

---

## Session / portal

| Item | Value |
|------|--------|
| Portal URL | `http://127.0.0.1:5173/hr/employee-metadata?portal=1&tenantId=xevn&companyId=main` |
| Persona | `ceo@xe.vn` · `companyId=main` (QA audited) |
| Method | Audit QA browser/CDP spot-check + FE unit evidence + QC L0 + Layer-B pack verify |

---

## command_table (QC spot)

| Command | Exit | Notes |
|---------|------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-metadata-workflow-id-humanize-01-20260720.md` | **0** | **8/8** — primary QC handoff |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/d-hrm-metadata-workflow-id-humanize-01-fe-20260720.md` | **1** | **3/8** — PROCESS (command_table / portal_url / journey_l25) |
| `pnpm run qc:dev-stack` | health **200** | hrm `:28001` / xbos `:28002` / portal `:5173` (Win UV harness noise after print) |

---

## Executive summary

QC audited residual close for parent GWC condition **C-HRM-MENU-SWEEP-01** (P3 metadata queue raw `xbos.employee_metadata.default` / dotted machine workflow ids). FE mapped known codes to VI labels and hid other technical ids; QA U65 browser spot-check on `/hr/employee-metadata` shows cột **Quy trình** = **Duyệt thay đổi hồ sơ (mặc định)** ×11, `hasXbos=false`, Vietnamese headers (**Quy trình**, **Trường dữ liệu**, **Mã trường**). Primary QA pack **8/8**. L0 hrm/xbos/portal **200**. U65 zero-seed. Chrome-strip CLOSED rows **not** reopened.

**C-HRM-MENU-SWEEP-01 = CLOSED.**

Parent **QC-HRM-MENU-FULL-SWEEP-01** remains **GO WITH CONDITIONS** for **C-HRM-MENU-SWEEP-02** (FE strip packs 4/8 process polish, defer OK).

**NOT** Phase 1 DONE · **NOT** PROD-READY.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| parent qc | `qc-hrm-menu-full-sweep-01-20260720.md` | GWC · **C-HRM-MENU-SWEEP-01** was **OPEN** (defer OK) |
| dev-fe | `d-hrm-metadata-workflow-id-humanize-01-fe-20260720.md` | **READY_FOR_QA** — `formatMetadataWorkflowLabel`; vitest 8 PASS |
| qa | `qa-hrm-metadata-workflow-id-humanize-01-20260720.md` | **PASS_TO_PM** — CDP 0× `xbos.employee_metadata` / dotted machine id |
| qc (this) | `qc-hrm-metadata-workflow-id-humanize-01-20260720.md` | **GO** — C-01 CLOSED; parent GWC retained |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `qa-hrm-metadata-workflow-id-humanize-01-20260720.md` | **0** | **8/8** | **PASS** — primary QC handoff |
| `d-hrm-metadata-workflow-id-humanize-01-fe-20260720.md` | **1** | **3/8** | **PROCESS** — FE READY handoff missing Layer-B regex fields; **not** product NO-GO (precedent: parent FE strip 4/8) |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-metadata-workflow-id-humanize-01-20260720.md
# PASS: QC evidence pack ready (8/8)
```

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| FE metadata humanize pack 3/8 | P3 process | qa/dev-fe optional polish | **Noted** — not blocking residual product close |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QC spot `qc:dev-stack` 2026-07-20 | ENV | hrm/xbos/portal **200** — **PASS** (Win UV assert after print = harness noise) |
| Metadata queue load + 11 pending rows | PRODUCT | **PASS** (QA) |
| Cột **Quy trình** VI human label; 0× `xbos.employee_metadata` / dotted machine id | PRODUCT | **PASS** — **C-HRM-MENU-SWEEP-01 CLOSED** |
| Headers **Quy trình** / **Trường dữ liệu** / submit **Mã trường** | PRODUCT | **PASS** |
| Approve/Từ chối visible (mutate not exercised) | PRODUCT must_keep | **PASS** (out of chrome AC depth) |
| Prior chrome-strip CLOSED (payroll/salary/processes/sync/perf/Dashboard) | PRODUCT must_keep | **PASS** — **not reopened** |
| Optional `field_key` mono labels (`personal_email`, …) | PRODUCT residual P3 optional | **OUT OF C-01** — not blocking |
| Seed | PROCESS U65 | **PASS** — none |
| FE pack 3/8 | PROCESS | **Noted** — not product reopen |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## Exit criteria adjudication

| # | Exit | QA | QC |
|---|------|----|----|
| 1 | `/hr/employee-metadata` load OK; no white-crash | PASS | **PASS** |
| 2 | Cột **Quy trình** VI; no `xbos.employee_metadata` / dotted machine id | CDP ×11 humanized | **PASS** |
| 3 | VI headers (Quy trình / Trường dữ liệu / Mã trường) | PASS | **PASS** |
| 4 | Close **C-HRM-MENU-SWEEP-01** | READY TO CLOSE | **CLOSED** |
| 5 | Do not reopen chrome-strip CLOSED | Explicit | **PASS** |
| 6 | Retain other parent GWC conditions | — | **YES** — C-02 remains OPEN |
| 7 | NOT Phase1/PROD; evidence this file | Explicit | **PASS** |

---

## L2.5 / journey coverage (U19 — residual slice)

| Related journey / UF | In-scope for this residual gate? | Status |
|----------------------|----------------------------------|--------|
| `UF-HRM-MENU-17` / UC-HRM-26 metadata queue chrome | Yes (workflow-id display) | **PASS** |
| Full J-HRM-* mutate / approve-reject deep | **Out of slice** | **Not claimed** |
| Parent 17-menu load + chrome strip ACs | must_keep (not reopened) | **PASS** (prior CLOSED retained) |

**Mandatory in-scope for this QC:** close P3 metadata workflow-id leakage only. **Deferred / out of slice:** full J-* mutate, member-CEO, Phase1/PROD.

---

## Conditions status (parent QC-HRM-MENU-FULL-SWEEP-01)

| ID | Severity | Status after this gate |
|----|----------|------------------------|
| **C-HRM-MENU-SWEEP-01** | P3 | **CLOSED** — FE humanize + QA CDP 0× machine workflow id |
| **C-HRM-MENU-SWEEP-02** | P3 process | **OPEN** (defer OK) — FE strip-01/02 packs 4/8 Layer-B polish |

### Closed this residual (must not reopen without new FAIL)

| ID | Sev | Status |
|----|-----|--------|
| `C-HRM-MENU-SWEEP-01` / `D-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01` | P3 | **CLOSED** |

### Still closed from parent (must_keep — do not reopen)

| ID | Status |
|----|--------|
| `D-HRM-PAYROLL-STRIP-HRM-API-LABEL-01` | **CLOSED** |
| `D-HRM-EMP-SALARY-GRADE-API-BADGE-01` | **CLOSED** |
| `D-HRM-PROCESSES-STRIP-XBOS-DM-CODE-01` | **CLOSED** |
| `D-HRM-SETTINGS-SYNC-ISO-FORMAT-01` | **CLOSED** |
| `D-HRM-PERF-CYCLE-ISO-DISPLAY-01` | **CLOSED** |
| Dashboard GET/ops/UC/Nest chrome (`D-HRM-UI-STRIP-TECH-CHROME-01`) | **CLOSED** |

---

## Residual risk statement

- **Persona:** Group CEO `main` only — member CEO / HRBP not retested this wave.
- **Depth:** Display/chrome spot-check; approve/reject mutate not exercised (out of C-01 AC).
- **Optional P3:** `field_key` still shows machine keys — explicitly **out of** C-HRM-MENU-SWEEP-01; sponsor may open separate chrome wave.
- **Parent GWC:** C-02 FE pack process polish remains OPEN (defer OK) — does not reopen product chrome.

---

## Forbidden claims

- **NOT** Phase 1 DONE
- **NOT** PROD-READY / UAT program-complete
- **NOT** reopen chrome-strip CLOSED without new browser FAIL
- **Cấm** seed in any follow-up evidence

---

## Parent GWC amendment

Amend `docs/qa/evidence/qc-hrm-menu-full-sweep-01-20260720.md` § Conditions:

- **C-HRM-MENU-SWEEP-01** → **CLOSED** (this evidence)
- **C-HRM-MENU-SWEEP-02** → remains **OPEN** (defer OK)
- Parent decision remains **GO WITH CONDITIONS** (C-02 only)

---

## completion_report

**Closed:** QC residual gate `QC-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01` — audited FE humanize + QA U65 CDP spot-check; primary pack **8/8**; L0 **200**×3; **C-HRM-MENU-SWEEP-01 CLOSED**; chrome-strip CLOSED retained; U65 honored.

**Open / residual:** Parent **C-HRM-MENU-SWEEP-02** FE pack format polish (process, defer OK); optional field_key catalog labels (out of C-01).

**Overall:** **GO** (residual close) · parent menu-sweep stays **GWC** · **PASS_TO_PM**. No Phase1/PROD claim.

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PM-HRM-MENU-SWEEP-C01-CLOSED-INTAKE-01
from_role: qc
to_role: pm
lane: governance
entry_criteria: QC-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01 GO; C-HRM-MENU-SWEEP-01 CLOSED; evidence docs/qa/evidence/qc-hrm-metadata-workflow-id-humanize-01-20260720.md
action:
  1) Bus INTAKE — record residual GO; amend parent QC-HRM-MENU-FULL-SWEEP-01 GWC: C-01 CLOSED; C-02 still OPEN (defer OK)
  2) Continue program backlog — do NOT reopen chrome-strip CLOSED or claim Phase1/PROD
  3) Optional (defer OK): polish FE strip/metadata packs Layer-B (C-02) — not product reopen
cấm: seed · Phase1/PROD claim · reopen CLOSED chrome without new FAIL
```

## ack_status

**PASS_TO_PM**
