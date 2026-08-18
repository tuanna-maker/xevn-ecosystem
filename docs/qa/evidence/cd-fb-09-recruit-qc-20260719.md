# QC Gate Decision — CD-FB-09-RECRUIT (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-09-RECRUIT` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **environment** | portal `:5173` · hrm `:28001` · xbos `:28002` (QA L0) |
| **accounts** | Group CEO session · `JWT xevn/main` · `companyId=main` |
| **executed_at** | `2026-07-19` |
| **program** | Customer demo HRM delta F6 (recruitment JD / requisition / funnel) |
| **spec_ref** | `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` §6 F6 · AC-CD-F6-01..04 · `J-HRM-05` · `P-CC-06` · UC-HRM-22 |
| **decision** | **GO WITH CONDITIONS** — F6 MVP AC-CD-F6-01..04 + **J-HRM-05** + **P-CC-06** (hard path) PASS |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited QA `cd-fb-09-recruit-qa-20260719.md` (**PASS_TO_PM**) after FE READY_FOR_QA. Evidence pack **`verify:qc:evidence-pack` 8/8 exit 0**. Product browser U65: JD library CRUD (POST **HRM-REC-JD-201** + PATCH + F5 persist), requisition from template with JD snapshot, 6-stage funnel live (no `1OFFICE`), ĐVTV filter → `company_id=trsport` with JWT `main` stable, **J-HRM-05** list→detail snapshot, **P-CC-06** hard-nav funnel visible — all **PASS**.

Explicitly **not required** this wave: **AC-CD-F6-06**, XBOS recruitment WF / **J-REC-WF-***. Soft-nav iframe stall is a known embed class residual (hard reload works) — **not** F6 product FAIL.

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY / customer-demo program exit.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| dev-fe | `docs/qa/evidence/cd-fb-09-recruit-fe-20260719.md` | READY_FOR_QA — JD tab, funnel, snapshot; XBOS WF out of scope |
| qa | `docs/qa/evidence/cd-fb-09-recruit-qa-20260719.md` | **PASS_TO_PM** — browser U65 AC-CD-F6-01..04 + J-HRM-05 + P-CC-06 |
| qc (this) | `docs/qa/evidence/cd-fb-09-recruit-qc-20260719.md` | **GO WITH CONDITIONS** |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `cd-fb-09-recruit-qa-20260719.md` | **0** | **8/8** | **PASS** — gate open for QC product adjudication |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/cd-fb-09-recruit-qa-20260719.md
# PASS: QC evidence pack ready (8/8)
```

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QA L0 hrm/xbos/portal **200** | ENV | **PASS** (recorded in QA pack; U65 run concurrent) |
| QC spot `qc:dev-stack` 2026-07-19 ~16:06 | ENV | **hrm-api fetch failed**; xbos+portal **200** — **ENV at gate time**; does **not** reopen product ACs already evidenced under live stack |
| `verify:qc:evidence-pack` 8/8 | PROCESS | **PASS** |
| AC-CD-F6-01 JD CRUD + F5 | PRODUCT | **PASS** (QA browser) |
| AC-CD-F6-02 requisition + snapshot | PRODUCT | **PASS** |
| AC-CD-F6-03 funnel 6 cột live | PRODUCT | **PASS** — BR-DQ-01 no 1OFFICE |
| AC-CD-F6-04 ĐVTV subset + JWT main | PRODUCT | **PASS** — `company_id=trsport` |
| AC-CD-F6-05 hire→INT | OUT OF SLICE | **Not promoted** |
| AC-CD-F6-06 interview deep-link | OUT OF SLICE | **Deferred** → **C-CD-FB-09-02** (do not require) |
| **J-HRM-05** list→detail | PRODUCT L2.5 | **PASS** |
| **P-CC-06** hard-nav funnel | PRODUCT L2 | **PASS** |
| Soft-nav iframe stall | PRODUCT UX residual | **OPEN** → **C-CD-FB-09-01** — known class; hard path PASS |
| XBOS WF / J-REC-WF-* | OUT OF SLICE | **Deferred** → **C-CD-FB-09-03** — **cấm require** |
| Seed in evidence | PROCESS U65 | **PASS** — none |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health

| Check | Source | Result |
|-------|--------|--------|
| hrm-api `:28001` | QA pack | HTTP **200** — **PASS** |
| xbos-api `:28002` | QA pack | HTTP **200** — **PASS** |
| web-portal `:5173` | QA pack | HTTP **200** — **PASS** |
| QC optional spot | `pnpm run qc:dev-stack` | hrm **down** / xbos+portal **200** — **ENV** (not product NO-GO; QA product evidence stands) |

---

## AC matrix adjudication

| AC / ID | Expect | QA | QC |
|---------|--------|----|----|
| **AC-CD-F6-01** | JD library CRUD + F5 | PASS | **PASS** |
| **AC-CD-F6-02** | Requisition from template + snapshot | PASS | **PASS** |
| **AC-CD-F6-03** | Dashboard funnel 6 cột live | PASS | **PASS** |
| **AC-CD-F6-04** | Scope ĐVTV subset + JWT main | PASS | **PASS** |
| **AC-CD-F6-06** | Interview deep-link from funnel | Residual / deferred | **Deferred** — **C-CD-FB-09-02** |
| **J-HRM-05** | List → detail snapshot | PASS | **PASS** |
| **P-CC-06** | CC recruitment funnel visible | PASS (hard nav) | **PASS** (hard path) |

---

## L2.5 journey coverage (U19)

| Journey | In this gate? | Status |
|---------|---------------|--------|
| **J-HRM-05** | **Yes** (mandatory for F6) | **PASS** — requisition list → Chi tiết; snapshot fields; GET by id; no 404/409 |
| **P-CC-06** | **Yes** (L2 embed) | **PASS** — hard nav `/command-center/hrm/recruitment`; 6-stage funnel in iframe |
| Soft-nav Attendance → Tuyển dụng | Supporting residual | **Known stall** — **C-CD-FB-09-01**; hard reload / dedicated URL OK |
| **J-REC-WF-01..05** | No | **Deferred** — **C-CD-FB-09-03** (SA / later wave; **do not require**) |
| Full J-HRM-01..07 / Phase1 matrix | Out of slice | Not claimed |

**NO-GO trigger not met:** in-scope mandatory **J-HRM-05** has browser click-path evidence PASS; not left ⏳ against a blind PASS claim. Journey map already marks J-HRM-05 ✅ PASS (must_keep for REC-WF bridge — bridge itself out of this gate).

---

## Conditions

| ID | Severity | Owner | Expiry / trigger | Status |
|----|----------|-------|------------------|--------|
| **C-CD-FB-09-01** | P2 UX / embed | optional `dev-fe` (soft-nav class) | Soft click Tuyển dụng remounts `/hr/recruitment` iframe without hard reload | **OPEN** (non-blocking for hard-path F6) |
| **C-CD-FB-09-02** | Scope defer | pm → qa next wave | AC-CD-F6-06 interview deep-link from funnel stage | **OPEN** — **out of this exit** (do not require) |
| **C-CD-FB-09-03** | Scope defer | sa / later | XBOS recruitment WF bridge + J-REC-WF-* | **OPEN** — **cấm require** this wave |
| **C-CD-FB-09-04** | Standing | pm | Forever for this gate | **OPEN** — **NOT** Phase1 DONE · **NOT** PROD · **NOT** F-DELIVERY exit |

---

## Residual (concur QA)

| ID | Severity | Note | QC |
|----|----------|------|-----|
| Soft-nav P-CC-06 iframe stall | P2 | Attendance stuck after soft click | = **C-CD-FB-09-01** |
| AC-CD-F6-06 | Deferred | Interview deep-link | = **C-CD-FB-09-02** |
| XBOS WF bridge | Deferred | SA / ADR later | = **C-CD-FB-09-03** |
| Multi-tab membership pollution | Info | Parallel tab `du-lich.ceo`; primary AC on Group CEO | Noted — not product FAIL |

**not promoted:** Phase1 DONE · PROD-READY · AC-CD-F6-05 · AC-CD-F6-06 · J-REC-WF-*

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / UAT full-program exit
- F-DELIVERY AC-CD-DEL-* closure from this slice alone
- Require XBOS recruitment WF bridge / J-REC-WF-* for this GO
- Seed to fabricate funnel/interview tasks
- Promote unrelated UF/J-* rows from this pack alone

---

## completion_report

QC **GO WITH CONDITIONS** for `CD-FB-09-RECRUIT` (customer demo F6 MVP). Closed: **AC-CD-F6-01..04** + **J-HRM-05** + **P-CC-06** (hard path); evidence-pack **8/8**; U65 zero-seed. Open conditions: soft-nav embed (**C-CD-FB-09-01**), AC-CD-F6-06 deferred (**C-CD-FB-09-02**), XBOS WF deferred (**C-CD-FB-09-03**), standing no Phase1/PROD (**C-CD-FB-09-04**). QC L0 spot hrm-api down classified **ENV** — does not reopen product ACs. No Phase1/PROD claim. XBOS WF **not** required.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: CD-FB-09-RECRUIT
from_role: pm
to_role: pm
lane: governance
entry: docs/qa/evidence/cd-fb-09-recruit-qc-20260719.md GO WITH CONDITIONS
actions:
  1) Bus INTAKE + promote CD-FB-09 F6 slice (AC-CD-F6-01..04 + J-HRM-05 + P-CC-06 hard path)
  2) Continue customer-demo backlog next CD-FB-* — do NOT claim Phase1/PROD/F-DELIVERY
  3) Do NOT dispatch XBOS WF / J-REC-WF as blocker for this slice
optional_parallel (non-blocking):
  work_item_id: CD-FB-09-SOFT-NAV (or ATT-NAV soft-nav family)
  to_role: dev-fe
  entry: C-CD-FB-09-01 — soft click Tuyển dụng must remount /hr/recruitment iframe
  exit: READY_FOR_QA soft-nav smoke + hard-path regression
  evidence: docs/qa/evidence/cd-fb-09-soft-nav-fe-YYYYMMDD.md
optional_later:
  work_item_id: CD-FB-09-AC-F6-06 (when scheduled)
  to_role: qa
  entry: AC-CD-F6-06 interview deep-link — C-CD-FB-09-02
cấm: seed · require XBOS WF for F6 close · Phase1/PROD claim · reopen AC already PASS without regression
```

**ack_status:** **PASS_TO_PM**
