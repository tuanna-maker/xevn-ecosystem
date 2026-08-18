# QC Gate Decision — QC-HRM-MENU-FULL-SWEEP-01 (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-MENU-FULL-SWEEP-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **residual_auto_fix** | `true` (P3 only — defer OK) |
| **qa_evidence_r2** | `docs/qa/evidence/qa-hrm-menu-full-sweep-01-r2-20260720.md` (**PASS_TO_PM**) |
| **qa_evidence_parent** | `docs/qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md` (**FAIL_TO_PM** → residuals closed by R2) |
| **fe_evidence_01** | `docs/qa/evidence/d-hrm-ui-strip-tech-chrome-01-fe-20260720.md` (**READY_FOR_QA** — Dashboard strip) |
| **fe_evidence_02** | `docs/qa/evidence/d-hrm-ui-strip-tech-chrome-02-fe-20260720.md` (**READY_FOR_QA** — 5 residuals) |
| **executed_at** | `2026-07-20` |
| **env / portal_url** | portal `http://127.0.0.1:5173` · HRM iframe `/hr/*?portal=1` · hrm-api `:28001` · xbos-api `:28002` |
| **decision** | **GO WITH CONDITIONS** — bounded HRM sidebar load + tech-chrome strip |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited the full AppSidebar leaf sweep (17 menus) plus chrome-strip waves (Dashboard + batch-02 residuals). Product exit for this slice **PASS**: L0 healthy; U65 zero-seed; all menus load without white-crash / Sync ERROR / RangeError; Dashboard GET/ops/UC/Nest chrome gone; R2 closed all five FAIL chrome rows (payroll `hrm-api`, salaryGrade `API` badge, Processes `XBOS-DM-*`, Settings sync ISO-Z, Performance cycle ISO-Z).

**GO WITH CONDITIONS** — residual **P3** metadata queue workflow id strings remain visible (out of chrome-strip batch; defer OK). FE packs fail Layer-B format (4/8) adjudicated **PROCESS** only — primary QA R2 + parent packs are **8/8**.

**NOT** Phase 1 DONE · **NOT** PROD-READY. **Do not** reopen Dashboard strip-01 or the five CLOSED chrome defects without new browser FAIL.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| dev-fe | `d-hrm-ui-strip-tech-chrome-01-fe-20260720.md` | Dashboard / recruit / banners strip READY |
| qa parent | `qa-hrm-menu-full-sweep-01-20260720.md` | 17 menus load; Dashboard PASS; **5 chrome FAIL** |
| dev-fe | `d-hrm-ui-strip-tech-chrome-02-fe-20260720.md` | Batch close 5 residuals; vitest 19 PASS |
| qa R2 | `qa-hrm-menu-full-sweep-01-r2-20260720.md` | FAIL rows only → **all PASS** · **PASS_TO_PM** |
| qc (this) | `qc-hrm-menu-full-sweep-01-20260720.md` | **GWC** — product PASS; P3 + FE pack PROCESS |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `qa-hrm-menu-full-sweep-01-r2-20260720.md` | **0** | **8/8** | **PASS** — primary QC handoff |
| `qa-hrm-menu-full-sweep-01-20260720.md` | **0** | **8/8** | **PASS** — parent sweep SoT |
| `d-hrm-ui-strip-tech-chrome-02-fe-20260720.md` | **1** | **4/8** | **PROCESS** — FE handoff missing command_table / portal_url / journey_l25 / crud_or_matrix; **not** product NO-GO |
| `d-hrm-ui-strip-tech-chrome-01-fe-20260720.md` | **1** | **4/8** | **PROCESS** — same; FE READY not QA pack |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-menu-full-sweep-01-r2-20260720.md
# PASS: QC evidence pack ready (8/8)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md
# PASS: QC evidence pack ready (8/8)
```

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| FE strip-01/02 packs 4/8 | P3 process | qa/dev-fe optional polish | **Noted** — not blocking product GWC |
| Primary QA R2 pack 8/8 | — | — | **Closed for Layer B** |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QA L0 hrm/xbos/portal **200**; fe-be-health ALL PASS | ENV | **PASS** (QA packs) |
| QC spot `qc:dev-stack` hrm/xbos/portal **200** (Win UV exit noise) | ENV | **PASS** health; exit noise **not** product |
| 17 AppSidebar leaves load (Group CEO `main`) | PRODUCT | **PASS** |
| Dashboard no GET/ops/UC/Nest/hrm-api chrome | PRODUCT | **PASS** |
| Payroll header no `hrm-api` | PRODUCT | **PASS** (R2 CLOSED) |
| Employee Lương no `API` badge; no Invalid time | PRODUCT | **PASS** (R2 CLOSED) |
| Processes empty notice no `XBOS-DM-*` | PRODUCT | **PASS** (R2 CLOSED) |
| Settings sync + Performance dates humanized | PRODUCT | **PASS** (R2 CLOSED) |
| Metadata queue `xbos.employee_metadata.default` ids | PRODUCT residual P3 | **CONDITION** — defer OK |
| Tools & equipment Phase 2 stub | PRODUCT expected | **PASS** (stub allowed) |
| Recruitment Tin/Ứng viên CDP submenu partial | PRODUCT observation | **Noted** — load PASS; not FAIL |
| Seed | PROCESS U65 | **PASS** — none |
| FE evidence-pack 4/8 | PROCESS | **GWC format** — not product reopen |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## Exit criteria adjudication

| # | Criteria | QA | QC |
|---|----------|----|----|
| 1 | Full sidebar 17 menus load OK | Parent matrix all Load OK | **PASS** |
| 2 | Dashboard tech chrome stripped | Parent + R2 spot PASS | **PASS** |
| 3 | 5 chrome residuals CLOSED | R2 defect map all CLOSED | **PASS** |
| 4 | U65 zero-seed · browser-only | Explicit in packs | **PASS** |
| 5 | No Phase1/PROD claim | Explicit | **PASS** |
| 6 | Note P3 metadata workflow ids if residual | R2 residual table | **CONDITION C-01** |
| 7 | QC evidence path | This file | **PASS** |

---

## L2.5 / journey coverage (U19 — bounded slice)

This wave is **menu load + user-facing chrome strip**, not a full mutate L2.5 promote of PROGRAM_JOURNEY_MAP.

| Related journey / UF | In-scope for this gate? | Status |
|----------------------|-------------------------|--------|
| Proposed `UF-HRM-MENU-01..17` (parent proposal) | Load + chrome AC | **PASS load**; chrome ACs closed via R2 |
| Dashboard embed (ops strip) | Yes | **PASS** |
| Employee → Lương (DVU-0005) — J-HRM-02 class deep check | Yes (chrome + crash) | **PASS** — no Invalid time; no API badge |
| Payroll chrome (J-HRM-07 adjacent) | Yes (label only) | **PASS** — no `hrm-api` |
| Full J-HRM-01..08 mutate / inbox | **Out of slice** | **Not claimed** — prior map status unchanged |

**Mandatory in-scope for this QC:** sidebar load + chrome strip ACs. **Deferred / out of slice:** full J-* mutate retest, member-CEO persona, mobile.

---

## Conditions (GWC)

| ID | Severity | Status | Note | Owner |
|----|----------|--------|------|-------|
| **C-HRM-MENU-SWEEP-01** | P3 | **CLOSED** (2026-07-20) | Metadata workflow ids humanized — see `docs/qa/evidence/qc-hrm-metadata-workflow-id-humanize-01-20260720.md` (**GO** residual) | — |
| **C-HRM-MENU-SWEEP-02** | P3 process | **OPEN** (defer OK) | FE strip-01/02 evidence packs 4/8 — optional polish if PM wants FE handoffs Layer-B clean | `qa` / `dev-fe` optional |

> **Amendment 2026-07-20:** Residual `QC-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01` closed **C-HRM-MENU-SWEEP-01**. Parent decision remains **GO WITH CONDITIONS** (C-02 only). **NOT** Phase1/PROD.

### Closed this wave (must not reopen without new FAIL)

| ID | Sev | Status |
|----|-----|--------|
| `D-HRM-PAYROLL-STRIP-HRM-API-LABEL-01` | P1 | **CLOSED** |
| `D-HRM-EMP-SALARY-GRADE-API-BADGE-01` | P2 | **CLOSED** |
| `D-HRM-PROCESSES-STRIP-XBOS-DM-CODE-01` | P2 | **CLOSED** |
| `D-HRM-SETTINGS-SYNC-ISO-FORMAT-01` | P2 | **CLOSED** |
| `D-HRM-PERF-CYCLE-ISO-DISPLAY-01` | P2 | **CLOSED** |
| Dashboard GET/ops/UC/Nest chrome (`D-HRM-UI-STRIP-TECH-CHROME-01`) | — | **CLOSED** (verified parent + R2 spot) |

---

## Residual risk statement

- **Persona:** Group CEO `ceo@xe.vn` / `companyId=main` only — member CEO / HRBP not in this sweep.
- **Depth:** Soft-nav iframe load + CDP text assert; not full CRUD mutate on every menu.
- **Recruitment:** Tin/Ứng viên dropdown deep-nav CDP flaky in parent — buttons present; Dashboard/Yêu cầu/JD verified; **not** promoted as FAIL.
- **P3 metadata ids:** cosmetic / internal id leakage only; no crash / Sync ERROR / load block.

---

## Forbidden claims

- **NOT** Phase 1 DONE
- **NOT** PROD-READY / UAT program-complete
- **NOT** reopen CLOSED chrome defects or Invalid-time salary crash without new browser evidence
- **Cấm** seed in any follow-up evidence

---

## completion_report

**Closed:** QC gate for `QC-HRM-MENU-FULL-SWEEP-01` — audited parent full sidebar sweep + FE strip-01/02 + QA R2; Layer B primary packs **8/8**; L0 spot 200×3; product chrome ACs for Dashboard + 5 residuals **PASS**; U65 honored.

**Open / residual:** **C-HRM-MENU-SWEEP-01** **CLOSED** via `QC-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01` (2026-07-20); **C-HRM-MENU-SWEEP-02** FE pack format polish (process, defer OK).

**Overall:** **GO WITH CONDITIONS** (C-02 only after amendment) · **PASS_TO_PM**. No Phase1/PROD claim.

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PM-HRM-MENU-SWEEP-C01-CLOSED-INTAKE-01
from_role: qc
to_role: pm
lane: governance
entry_criteria: QC-HRM-MENU-FULL-SWEEP-01 GWC amended; C-HRM-MENU-SWEEP-01 CLOSED via QC-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01; evidence docs/qa/evidence/qc-hrm-metadata-workflow-id-humanize-01-20260720.md
action:
  1) Bus INTAKE — C-01 CLOSED; C-02 still OPEN (FE pack process, defer OK); NOT Phase1/PROD
  2) Continue program backlog — do NOT reopen CLOSED chrome / C-01 without new FAIL
  3) Optional (defer OK): polish FE strip packs Layer-B (C-02) only
cấm: seed · claim Phase1/PROD DONE · treat FE pack format as product NO-GO
```

## ack_status

**PASS_TO_PM**
