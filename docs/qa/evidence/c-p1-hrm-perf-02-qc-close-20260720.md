# QC Gate Decision — C-P1-HRM-PERF-02-QC-CLOSE (cursor FE + TZ residual) (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `C-P1-HRM-PERF-02-QC-CLOSE` |
| **closes** | **C-P1-HRM-PERF-02** / **D-C-P1-HRM-PERF-02-CURSOR-TZ** / FE `listAllEmployees` cursor walk |
| **parent** | `P1-HRM-PERF-QC-01` · `docs/qa/evidence/p1-hrm-perf-qc-01-20260719.md` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **decision** | **GO** — residual cursor/TZ close only; **parent PERF GWC retained** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **f_delivery_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | `2026-07-20` |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · no F3–F6 mutate AC reopen |
| **qa_r2** | `docs/qa/evidence/c-p1-hrm-perf-02-qa-r2-20260720.md` (**PASS_TO_PM**) |
| **be_fix** | `docs/qa/evidence/d-c-p1-hrm-perf-02-cursor-tz-be-20260720.md` (**READY_FOR_QA**) |
| **prior_fail** | `docs/qa/evidence/c-p1-hrm-perf-02-qa-20260720.md` (**FAIL_TO_PM** — closed by R2) |

---

## Session / portal

| Item | Value |
|------|--------|
| Portal URL | `http://127.0.0.1:5173/command-center/hrm/*` (PORTAL_DEV_URL local) |
| Persona | `ceo@xe.vn` · `companyId=main` (QA R2 audited) |
| Method | Audit of QA R2 browser Network + Bearer walk + QC L0 spot |

---

## command_table (QC spot)

| Command | Exit | Notes |
|---------|------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/c-p1-hrm-perf-02-qa-r2-20260720.md` | **1** | **2/8** — PROCESS format (journey_l25 / crud regex) |
| `pnpm run qc:dev-stack` | health **200** | hrm `:28001` / xbos `:28002` / portal `:5173` (Win UV noise) |

---

## Executive summary

QC audited the chain for parent GWC condition **C-P1-HRM-PERF-02** (P3 FE `listAllEmployees` → `next_cursor`). FE wired cursor Export/Archive; QA-R1 found live page-2 **500** `HRM-SYS-001` timezone `gmt+0700`; BE encoded ISO-8601 Z + microsecond `to_char`; QA-R2 retest **PASS**: portal Bearer + browser Network walks **12 pages / 1108/1108 all 200**, ISO `next_cursor` (no `GMT+`), Export/Archive **0** deep OFFSET, dashboard mount **7 ≤ 8** + summary **1×**, F3–F6 soft-nav `_v` stable. L0 spot hrm/xbos/portal **200**. U65 zero-seed.

**C-P1-HRM-PERF-02 = CLOSED.** Prior **D-C-P1-HRM-PERF-02-CURSOR-TZ = CLOSED** (do not reopen).

Parent **P1-HRM-PERF-QC-01** remains **GO WITH CONDITIONS** for **C-01** (Strict Mode dual catalogs), **C-03** (pack process polish), **C-04** (NOT Phase1/PROD).

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| parent qc | `p1-hrm-perf-qc-01-20260719.md` | GWC · **C-P1-HRM-PERF-02** was **OPEN** (defer OK) |
| qa R1 | `c-p1-hrm-perf-02-qa-20260720.md` | **FAIL** — cursor Network shape OK; page-2 500 TZ |
| dev-be | `d-c-p1-hrm-perf-02-cursor-tz-be-20260720.md` | **READY_FOR_QA** — ISO encode + micros; 39 jest PASS; live 1108/1108 |
| qa R2 | `c-p1-hrm-perf-02-qa-r2-20260720.md` | **PASS_TO_PM** — cursor exhaust + Export/Archive + mount + F3–F6 |
| qc (this) | `c-p1-hrm-perf-02-qc-close-20260720.md` | **GO** — C-02 CLOSED; parent GWC retained |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `c-p1-hrm-perf-02-qa-r2-20260720.md` | **1** | **2/8** | **PROCESS** — missing `journey_l25` / `crud_or_matrix` regex only. Exit criteria matrix + Export/Archive Network + soft-nav F3–F6 + L0 present in prose. **Not** product NO-GO (precedent: PERF parent pack 1/8; leave-picker 2/8; deeplink ~6/8). |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/c-p1-hrm-perf-02-qa-r2-20260720.md
# FAIL: QC evidence pack incomplete (2/8 checks) — journey_l25, crud_or_matrix
```

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| R2 pack J-*/CRUD regex 2/8 | P3 process | qa optional polish | **Noted** — not blocking residual product close |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QC spot `qc:dev-stack` 2026-07-20 | ENV | hrm/xbos/portal **200** — **PASS** (Win UV assert after print = harness noise, not product) |
| Prior page-2 cursor 500 `gmt+0700` | PRODUCT (closed) | **CLOSED** — R2 not reproduced |
| Live cursor walk 12×200 · 1108/1108 · ISO micros | PRODUCT | **PASS** |
| Export/Archive Network `cursor=` · 0× `page>5` · all 200 | PRODUCT | **PASS** |
| Dashboard mount **7** · summary **1×** · no employees?page= storm | PRODUCT must_keep | **PASS** |
| F3–F6 soft-nav `_v` stable | PRODUCT must_keep | **PASS** — mutate ACs not reopened |
| Vitest cursor + FE-02/03/04 14/14 | PRODUCT | **PASS** (QA) |
| Seed | PROCESS U65 | **PASS** — none |
| Pack verify 2/8 | PROCESS | **GWC format note** — not product reopen |
| Phase1 / PROD / F-DELIVERY | OUT OF SLICE | **NOT claimed** |

---

## Exit criteria adjudication

| # | Exit | QA R2 | QC |
|---|------|-------|-----|
| 1 | Export/Archive cursor walk page-2+ 200 until exhausted; ISO `next_cursor` (no GMT+) | 12 pages · 1108/1108 · ISO · Network all 200 | **PASS** |
| 2 | Dashboard summary 1× + mount ≤8 | 7 APIs · summary 1× | **PASS** |
| 3 | F3–F6 smoke | soft-nav `_v` stable · no ERROR | **PASS** |
| 4 | Close **C-P1-HRM-PERF-02** | Recommend QC close | **CLOSED** |
| 5 | Retain other F7 / parent PERF conditions | — | **YES** — C-01/C-03/C-04 remain OPEN |
| 6 | NOT Phase1/PROD; evidence this file | — | **PASS** |

---

## Conditions status (parent P1-HRM-PERF-QC-01)

| ID | Severity | Status after this gate |
|----|----------|------------------------|
| **C-P1-HRM-PERF-01** | P2 | **OPEN** (defer OK) — Strict Mode dual catalogs first touch |
| **C-P1-HRM-PERF-02** | P3 | **CLOSED** — FE cursor wire + BE ISO TZ; Export/Archive exhaust PASS |
| **C-P1-HRM-PERF-03** | P3 process | **OPEN** (noted) — pack `command_table` / J-* regex polish (parent + R2) |
| **C-P1-HRM-PERF-04** | standing | **OPEN** — **NOT** Phase1 DONE · **NOT** PROD · **NOT** F-DELIVERY |

**D-C-P1-HRM-PERF-02-CURSOR-TZ:** **CLOSED** — do not reopen without new TZ/ISO regression evidence.

---

## L2.5 / must_keep (U19 — no reopen)

| Journey / AC | This residual gate | Status |
|--------------|-------------------|--------|
| Soft-nav multi-tab (J-HRM-02 class / embed) | Smoke F3–F6 + `_v` | **PASS** (QA R2) — parent soft-nav PASS stands |
| Dashboard Network mount AC | Remount 7 ≤ 8 | **PASS** |
| Export/Archive cursor exhaust | In scope | **PASS** |
| F3–F6 product mutate ACs | Not reopened | Prior CD-FB / parent GWC **PASS** stands |
| **J-HRM-02** employee list→detail CRUD | Out of slice | **Not reopened** |

**NO-GO trigger not met:** residual product defect + FE wire fixed with live browser + Bearer evidence; in-scope soft-nav/mount covered; no new user P0 on unmapped journey.

---

## U65 zero-seed audit

| Check | Result |
|-------|--------|
| Seed in BE/QA/QC steps | **None** |
| Data | Existing pilot employee set (~1108) via production GET only |
| Verdict | **PASS** |

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / F-DELIVERY exit
- Upgrade parent **P1-HRM-PERF-QC-01** from GWC to full GO
- Close **C-01** / **C-03** / **C-04** from this pack alone
- Reopen F3–F6 product mutate ACs without new defect + regression
- Seed / fake Network fixtures for retest
- Claim cursor complete while TZ 500 still present (closed — historical FAIL only)

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| C-P1-HRM-PERF-01 | P2 | Strict Mode dual catalogs — parent GWC defer OK | `dev-fe` optional |
| C-P1-HRM-PERF-03 | P3 process | Pack J-*/CRUD regex polish | `qa` optional |
| C-P1-HRM-PERF-04 | standing | NOT Phase1/PROD/F-DELIVERY | `pm` |
| C-P1-HRM-PERF-02 | — | **CLOSED** this gate | — |
| D-C-P1-HRM-PERF-02-CURSOR-TZ | — | **CLOSED** — do not reopen | — |

## Residual disposition

| Item | QC disposition |
|------|----------------|
| D-C-P1-HRM-PERF-02-CURSOR-TZ | **CLOSED** |
| C-P1-HRM-PERF-02 | **CLOSED** |
| C-P1-HRM-PERF-01 Strict catalogs | Remain **OPEN** defer OK on parent GWC |
| Pack process 2/8 (R2) | Fold into **C-03** noted — optional QA polish |
| Phase1/PROD | **C-04** standing OPEN |

---

## completion_report

QC **GO** for residual **C-P1-HRM-PERF-02**. FE Export/Archive `cursor=` walks + BE ISO-8601 Z cursor encode closed prior page-2 **500** `gmt+0700`; QA R2 live **1108/1108** all **200**, mount **7**, F3–F6 soft-nav PASS. Pack verify **2/8** adjudicated **PROCESS** (not product NO-GO). L0 stack **200**. Parent **P1-HRM-PERF-QC-01** stays **GO WITH CONDITIONS** (C-01, C-03, C-04). U65 no seed. **NOT** Phase1/PROD.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: P1-HRM-PERF-QC-01
from_role: pm
to_role: pm
lane: governance
residual_auto_fix: true
entry: docs/qa/evidence/c-p1-hrm-perf-02-qc-close-20260720.md GO — C-P1-HRM-PERF-02 CLOSED
actions:
  1) Bus INTAKE: close C-P1-HRM-PERF-02 + D-C-P1-HRM-PERF-02-CURSOR-TZ on parent GWC
  2) Retain parent P1-HRM-PERF GO WITH CONDITIONS — C-01 (Strict catalogs P2 defer), C-03 (pack process), C-04 (NOT Phase1/PROD)
  3) Continue program backlog — do NOT claim Phase1/PROD/F-DELIVERY from this residual
  4) Optional later: C-01 coalesce catalogs; C-03 polish QA pack J-*/CRUD regex
cấm: seed · Phase1/PROD claim · reopen F3–F6 mutate ACs · upgrade parent to full GO without closing C-01/C-04 · reopen CURSOR-TZ without new regression
```

**evidence_path:** `docs/qa/evidence/c-p1-hrm-perf-02-qc-close-20260720.md`

**ack_status:** **PASS_TO_PM**
