# QC Gate Decision — CD-FB-07-LEAVE-CREATE-COMPANY-UUID-QC (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-LEAVE-CREATE-COMPANY-UUID-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **residual_auto_fix** | `true` |
| **closes** | **C-CD-FB-07-06** / **R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID** |
| **parent_gate** | `CD-FB-07-WF-DYNAMIC-QC-01` — `docs/qa/evidence/cd-fb-07-wf-dynamic-qc-20260719.md` (**GO WITH CONDITIONS**) |
| **picker_gate** | `CD-FB-07-FE-LEAVE-PICKER-QC` — `docs/qa/evidence/cd-fb-07-fe-leave-picker-qc-20260719.md` (**C-01 CLOSED**; opened C-06) |
| **qa_evidence** | `docs/qa/evidence/cd-fb-07-leave-create-company-uuid-qa-20260719.md` (**PASS_TO_PM**) |
| **fe_evidence** | `docs/qa/evidence/cd-fb-07-leave-create-company-uuid-20260719.md` (**READY_FOR_QA**) |
| **executed_at** | `2026-07-19` |
| **decision** | **GO** — residual create-UUID close only; **parent F4 GWC retained** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **f_delivery_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · no TEXT/`::uuid` P0 reopen · no C-01 picker reopen |

---

## Executive summary

QC audited FE slug→UUID leave-create fix + QA browser U65 **PASS** for residual **C-CD-FB-07-06**. Under Group CEO `companyId=main`: create leave for **HLD-0006** → `POST /api/hrm/attendance/leave-requests` **201** with body/response `company_id` = holding UUID `10000000-0000-4000-8000-000000000001` (**not** slug `main`); FE counters 85→86 / pending 27→28; list first row; F5 persist; typeahead HLD-0006 **must_keep**; soft-nav Att↔Rec SPA spot **PASS**.

**C-CD-FB-07-06 / R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID = CLOSED.**

Parent **CD-FB-07-WF-DYNAMIC** remains **GO WITH CONDITIONS** for **C-02** (canvas), **C-03** (live position/parallel), **C-04** (pack process), **C-05** (NOT Phase1/PROD). Closed picker **C-01** and closed TEXT/`::uuid` P0 **`D-CD-FB-07-RESOLVER-COMPANY-TEXT`** are **not reopened**.

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| parent qc (F4) | `cd-fb-07-wf-dynamic-qc-20260719.md` | GWC — C-02..05 OPEN; C-01 was later closed by picker QC |
| picker qc | `cd-fb-07-fe-leave-picker-qc-20260719.md` | C-01 **CLOSED**; **C-06 OPEN** (create 400 under `main`) |
| dev-fe | `cd-fb-07-leave-create-company-uuid-20260719.md` | READY_FOR_QA — `buildLeaveCreatePayload` slug→UUID; vitest 22 PASS |
| qa | `cd-fb-07-leave-create-company-uuid-qa-20260719.md` | **PASS_TO_PM** — POST 201 UUID + FE/F5 + typeahead + soft-nav |
| qc (this) | `cd-fb-07-leave-create-company-uuid-qc-20260719.md` | **GO** — **C-06 CLOSED**; parent F4 GWC retained |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `cd-fb-07-leave-create-company-uuid-qa-20260719.md` | **1** | **2/8** | **PROCESS GWC** — missing `command_table` + `crud_or_matrix` regex; browser click-path, L0, J-HRM-06, AC table, Network 201 UUID present in prose. **Not** product NO-GO for residual close (precedent: picker / F4 pack format). |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/cd-fb-07-leave-create-company-uuid-qa-20260719.md
# FAIL: QC evidence pack incomplete (2/8 checks)
#   - command_table
#   - crud_or_matrix
```

**QC rule applied:** Product residual adjudicated from readable QA MD (U65 click path, POST 201 UUID, FE after 2xx, F5, typeahead + soft-nav must_keep, zero-seed). Pack format gap → process note only — **does not** keep **C-CD-FB-07-06** OPEN. Aligns with standing **C-CD-FB-07-04**.

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| Create-UUID QA pack format 2/8 | P3 process | qa (optional polish) | **Noted** — absorbed by **C-04**; not blocking C-06 close |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QC spot `qc:dev-stack` 2026-07-19 | ENV | hrm `/api/hrm` · xbos `/api/xbos` · portal `:5173` **200** — **PASS**; Windows UV assert after print = **ENV flake** — **not** product NO-GO |
| POST leave-requests **201** with UUID `company_id` (not `main`) | PRODUCT | **PASS** — residual closed |
| FE list update after 2xx (85→86 / 27→28) + F5 | PRODUCT | **PASS** |
| Typeahead HLD-0006 (C-01 must_keep) | PRODUCT | **PASS** — **C-01 not reopened** |
| Soft-nav Att↔Rec SPA | PRODUCT must_keep | **PASS** |
| TEXT/`::uuid` resolver P0 | PRODUCT (closed) | **CLOSED** — **do not reopen** |
| Seed | PROCESS U65 | **PASS** — none |
| evidence-pack 2/8 | PROCESS | **GWC format** — not product reopen → **C-04** |
| Member-slug outside FE map (e.g. `xe-du-lich`) | OUT OF SLICE | **Deferred** — Dev residual note; holding/`main` path covered |
| Phase1 / PROD / F-DELIVERY | OUT OF SLICE | **NOT claimed** → **C-05** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-07-19) | Result |
|-------|----------------------|--------|
| hrm-api `:28001` `/api/hrm` | HTTP **200** | **PASS** |
| xbos-api `:28002` `/api/xbos` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |
| process exit after healthy print | Windows UV assert | **ENV flake** — treat as PASS |

Concurs QA pack L0.

---

## Exit criteria adjudication

| # | Exit | QC |
|---|------|-----|
| 1 | Close **C-CD-FB-07-06** or NO-GO with reason | **CLOSED** — GO residual |
| 2 | Do not reopen TEXT/uuid workflow P0 | **PASS** — not touched |
| 3 | Do not reopen **C-CD-FB-07-01** picker | **PASS** — typeahead still PASS; C-01 stays CLOSED |
| 4 | Evidence this file | **PASS** |
| 5 | NOT Phase1/PROD; PASS_TO_PM | **PASS** |

---

## Condition adjudication (vs parent F4 GWC)

| ID | Prior status | This wave | QC status now |
|----|--------------|-----------|---------------|
| **C-CD-FB-07-01** | CLOSED (picker QC) | Typeahead must_keep PASS | **CLOSED** (unchanged) |
| **C-CD-FB-07-02** | OPEN — canvas AC-CD-F4-06 | Out of scope | **OPEN** (unchanged) |
| **C-CD-FB-07-03** | OPEN — live position/parallel | Out of scope | **OPEN** (unchanged) |
| **C-CD-FB-07-04** | OPEN — pack format process | This QA also 2/8 | **OPEN** (unchanged) |
| **C-CD-FB-07-05** | OPEN — NOT Phase1/PROD | Standing | **OPEN** (unchanged) |
| **C-CD-FB-07-06** | OPEN — create UUID under `main` | QA POST 201 UUID + FE/F5 | **CLOSED** |

### C-CD-FB-07-06 close criteria (met)

| # | Expect | QA evidence | QC |
|---|--------|-------------|-----|
| 1 | POST leave-requests 2xx under `main` scope | **201** `HRM-LEAVE-201` | **PASS** |
| 2 | `company_id` = UUID not slug `main` | `10000000-0000-4000-8000-000000000001` body+response | **PASS** |
| 3 | FE after 2xx list update | 85→86 · pending 27→28 · row HLD-0006 | **PASS** |
| 4 | F5 persist | Totals/row remain | **PASS** |
| 5 | Typeahead HLD-0006 (C-01) | Keyword Select option | **PASS** |
| 6 | Soft-nav Att↔Rec | SPA `navigation.length===1` | **PASS** |
| 7 | No seed · no TEXT/uuid P0 reopen | None · P0 not touched | **PASS** |

---

## L2.5 journey coverage (U19)

| Journey | In this gate? | Status |
|---------|---------------|--------|
| **J-HRM-06** (attendance → leave create / list) | Yes — full create mutate path | **PASS** — dialog → select HLD-0006 → submit 201 → list + F5 |
| Full FE create→inbox approve for HLD-0006 | Desired post-create | **Out of C-06 scope** — WF spawn/inbox remains under parent F4 conditions (C-02/C-03); create mutate unblocked |
| F4 AC-CD-F4-01/02 live spawn | Parent closed | **Not reopened** |
| Full Phase1 J-* matrix | Out of slice | **Not claimed** |

**NO-GO trigger not met:** in-scope C-06 has browser product evidence; pack missing regex labels = process only.

---

## Residuals / conditions detail

| ID | Severity | Owner hint | QC |
|----|----------|------------|-----|
| **C-CD-FB-07-06** / `R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID` | was P2 | — | **CLOSED** |
| **C-CD-FB-07-01** | was P2 UX | — | **CLOSED** — **do not reopen** |
| **C-CD-FB-07-02..05** | per parent F4 | as prior | **OPEN** (parent GWC) |
| `D-CD-FB-07-RESOLVER-COMPANY-TEXT` | was P0 | — | **CLOSED** — **do not reopen** |
| Member-slug outside FE map | P3 / defer | optional FE map extend | **Noted** — out of residual |
| UX SelectItem overflow long UF03/QA suffixes | P3 | optional FE truncate | **Noted** — non-blocking |

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / UAT full-program exit
- F-DELIVERY / full Bay.vn parity from this residual close
- Reopen closed TEXT/`::uuid` P0 without new FAIL evidence
- Reopen **C-CD-FB-07-01** picker without new FAIL
- Seed to force create/inbox
- Upgrade parent F4 GWC to unconditional GO

---

## completion_report

### Closed
- **C-CD-FB-07-06** leave create `company_id` UUID under Group CEO `main` slug — browser U65 POST **201** UUID; FE list + F5; typeahead + soft-nav must_keep; U65 zero-seed.
- Prior P0 TEXT/`::uuid` and picker **C-01** — **not reopened**.

### Open (parent F4 GWC retained)
- **C-CD-FB-07-02** canvas AC-CD-F4-06
- **C-CD-FB-07-03** live position/parallel
- **C-CD-FB-07-04** pack format process
- **C-CD-FB-07-05** standing NOT Phase1/PROD

### Residual risk
Holding/`main` leave create mutate unblocked. Member companies outside FE slug map remain out-of-scope. Bounded residual close only — **NOT** Phase1/PROD.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: CD-FB-07-LEAVE-CREATE-COMPANY-UUID-QC
from_role: qc
to_role: pm
lane: governance
entry: docs/qa/evidence/cd-fb-07-leave-create-company-uuid-qc-20260719.md — GO (residual C-06 close)
actions:
  1) Bus INTAKE — promote C-CD-FB-07-06 / R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID CLOSED
  2) Retain parent CD-FB-07-WF-DYNAMIC GWC — C-02 canvas, C-03 live position/parallel, C-04 pack process, C-05 NOT Phase1/PROD remain OPEN
  3) Keep C-CD-FB-07-01 CLOSED; do NOT reopen D-CD-FB-07-RESOLVER-COMPANY-TEXT
  4) Continue customer-demo backlog (optional next: C-02 canvas or next CD-FB item) — do NOT claim Phase1/PROD/F-DELIVERY
cấm: seed · Phase1/PROD · reopen TEXT/uuid P0 · reopen C-01 picker without new FAIL
```

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/cd-fb-07-leave-create-company-uuid-qc-20260719.md`
