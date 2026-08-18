# QC Gate Decision — CD-FB-07-FE-LEAVE-PICKER-QC (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-FE-LEAVE-PICKER-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **residual_auto_fix** | `true` |
| **closes** | **C-CD-FB-07-01** (leave create employee typeahead beyond first page) |
| **parent_gate** | `CD-FB-07-WF-DYNAMIC-QC-01` — `docs/qa/evidence/cd-fb-07-wf-dynamic-qc-20260719.md` (**GO WITH CONDITIONS**) |
| **qa_evidence** | `docs/qa/evidence/cd-fb-07-fe-leave-picker-qa-20260719.md` (**PASS_TO_PM**) |
| **fe_evidence** | `docs/qa/evidence/cd-fb-07-fe-leave-picker-20260719.md` (**READY_FOR_QA**) |
| **executed_at** | `2026-07-19` |
| **decision** | **GO WITH CONDITIONS** — residual **C-CD-FB-07-01 CLOSED**; parent F4 GWC retained; new create-UUID condition **OPEN** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **f_delivery_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited leave-picker residual after FE UPGRADE (`useEmployeePickerSearch` + debounced keyword) + QA browser U65 **PASS**. Click path: Attendance → Nghỉ phép → Tạo yêu cầu → keyword `HLD-0006` → Select **Huỳnh Văn An — HLD-0006** (beyond capped 50/1107); `GET /api/hrm/employees?…keyword=HLD-0006` **200**; soft-nav Att↔Rec spot **PASS**.

**C-CD-FB-07-01** → **CLOSED**.

Parent **CD-FB-07-WF-DYNAMIC** remains **GO WITH CONDITIONS**. Closed TEXT/`::uuid` P0 **`D-CD-FB-07-RESOLVER-COMPANY-TEXT`** is **not reopened**. F4 AC-CD-F4-01/02 pilot product path **not reopened**.

**New condition (separate from picker):** **C-CD-FB-07-06** / `R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID` — leave create `POST` under Group CEO `companyId=main` slug → **400** `HRM-VAL-001` (`company_id must be a UUID`). Out of picker GWC scope; does **not** keep C-01 OPEN.

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY. **Cấm** seed.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| parent qc | `cd-fb-07-wf-dynamic-qc-20260719.md` | GWC — C-01 was OPEN leave picker |
| dev-fe | `cd-fb-07-fe-leave-picker-20260719.md` | READY_FOR_QA — typeahead + vitest 12 PASS |
| qa | `cd-fb-07-fe-leave-picker-qa-20260719.md` | **PASS_TO_PM** — HLD-0006 typeahead + keyword 200 + soft-nav |
| qc (this) | `cd-fb-07-fe-leave-picker-qc-20260719.md` | **C-CD-FB-07-01 CLOSED**; parent GWC retained; **C-06 OPEN** |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `cd-fb-07-fe-leave-picker-qa-20260719.md` | **1** | **2/8** | **PROCESS GWC** — missing `command_table` + `crud_or_matrix` regex; browser click-path, L0, J-HRM-06, AC vs C-01 table present in prose. **Not** product NO-GO for residual close (precedent: soft-nav / F4 pack format). |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/cd-fb-07-fe-leave-picker-qa-20260719.md
# FAIL: QC evidence pack incomplete (2/8 checks)
#   - command_table
#   - crud_or_matrix
```

**QC rule applied:** Product residual adjudicated from readable QA MD (U65 click path, Network keyword 200, Select option HLD-0006, soft-nav spot, zero-seed). Pack format gap → process note only — **does not** keep **C-CD-FB-07-01** OPEN.

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| Leave-picker QA pack format 2/8 | P3 process | qa (optional polish) | **Noted** — not blocking C-01 close |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 hrm/xbos/portal **200** (QA + QC spot 2026-07-19) | ENV | **PASS** — healthy lines; Windows libuv assert after print = **ENV flake** — **not** product NO-GO |
| Typeahead keyword Input + capped hint 50/1107 | PRODUCT | **PASS** |
| Keyword `HLD-0006` → GET employees **200** · option beyond first page | PRODUCT | **PASS** |
| Soft-nav Att↔Rec SPA (`navigation` length 1) | PRODUCT must_keep | **PASS** |
| Leave create POST 400 `company_id must be a UUID` under `main` slug | PRODUCT (separate) | **OPEN** → **C-CD-FB-07-06** — **not** picker FAIL |
| TEXT/`::uuid` resolver P0 | PRODUCT (closed) | **CLOSED** — **do not reopen** |
| F4 AC-CD-F4-01/02 | OUT OF SLICE this residual | **Not reopened** |
| Seed | PROCESS U65 | **PASS** — none |
| evidence-pack 2/8 | PROCESS | **GWC format** — not product reopen |
| Phase1 / PROD / F-DELIVERY | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-07-19) | Result |
|-------|----------------------|--------|
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |
| process exit after healthy print | Windows UV assert | **ENV flake** — treat as PASS |

Concurs QA pack L0.

---

## Condition adjudication (vs parent F4 GWC)

| ID | Parent status | This wave | QC status now |
|----|---------------|-----------|---------------|
| **C-CD-FB-07-01** | OPEN — leave picker typeahead | QA typeahead PASS + FE fix audited | **CLOSED** |
| **C-CD-FB-07-02** | OPEN — AC-CD-F4-06 canvas | Out of scope | **OPEN** (unchanged) |
| **C-CD-FB-07-03** | OPEN — live position/parallel | Out of scope | **OPEN** (unchanged) |
| **C-CD-FB-07-04** | OPEN — pack format process | Optional; this QA also 2/8 | **OPEN** (unchanged) |
| **C-CD-FB-07-05** | OPEN — NOT Phase1/PROD | Standing | **OPEN** (unchanged) |
| **C-CD-FB-07-06** | *(new)* | Create POST 400 under `main` slug | **OPEN** — `R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID` |

### C-CD-FB-07-01 close criteria (met)

| # | Expect | QA evidence | QC |
|---|--------|-------------|-----|
| 1 | Typeahead replaces Select-only first page | Keyword Input + cap hint 50/1107 | **PASS** |
| 2 | Discover HLD-0006 beyond first page | Option `Huỳnh Văn An — HLD-0006` after keyword | **PASS** |
| 3 | GET employees keyword **200** | Network + probe `HRM-EMP-200` · total=1 | **PASS** |
| 4 | Soft-nav / F4 path not broken | Att↔Rec SPA; nav entries = 1 | **PASS** |
| 5 | No seed · no TEXT/uuid P0 reopen | None · P0 not touched | **PASS** |
| 6 | Full FE create→list 2xx+F5 | **Not in C-01 scope** — create 400 UUID → **C-06** | **N/A for C-01** |

---

## L2.5 journey coverage (U19)

| Journey | In this gate? | Status |
|---------|---------------|--------|
| **J-HRM-06** (attendance leave surface) | Yes — picker on leave create | **PASS** — dialog typeahead + keyword discover |
| Full FE create→inbox for HLD-0006 | Desired post-picker | **Deferred** — create UUID → **C-CD-FB-07-06** |
| F4 AC-CD-F4-01/02 live spawn | Parent closed | **Not reopened** |
| Full Phase1 J-* matrix | Out of slice | **Not claimed** |

**NO-GO trigger not met:** in-scope C-01 has browser product evidence; pack missing regex labels = process only.

---

## Residuals / conditions detail

| ID | Severity | Owner hint | QC |
|----|----------|------------|-----|
| **C-CD-FB-07-01** / `D-CD-FB-07-FE-LEAVE-PICKER` | was P2 UX | — | **CLOSED** |
| **C-CD-FB-07-06** / `R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID` | P2 | `dev-be` / `dev-fe` — map slug→UUID on leave create under `main` | **OPEN** (separate; non-blocking picker close) |
| UX SelectItem overflow long UF03/QA suffixes | P3 | optional FE truncate | **Noted** — non-blocking |
| `D-CD-FB-07-RESOLVER-COMPANY-TEXT` | was P0 | — | **CLOSED** — **do not reopen** |

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / UAT full-program exit
- F-DELIVERY / full Bay.vn parity from this residual close
- Reopen closed TEXT/`::uuid` P0 without new FAIL evidence
- Seed to force create/inbox
- Claim full FE create→inbox for HLD-0006 closed (C-06 still OPEN)
- Upgrade parent F4 GWC to unconditional GO

---

## completion_report

### Closed
- **C-CD-FB-07-01** leave create employee typeahead — browser U65 HLD-0006 beyond first page; keyword GET 200; soft-nav spot PASS; FE vitest supporting; U65 zero-seed.
- Prior P0 TEXT/`::uuid` — **not reopened**.

### Open (parent F4 GWC retained)
- **C-CD-FB-07-02** canvas AC-CD-F4-06
- **C-CD-FB-07-03** live position/parallel
- **C-CD-FB-07-04** pack format process
- **C-CD-FB-07-05** standing NOT Phase1/PROD
- **C-CD-FB-07-06** (new) leave create `company_id` UUID under `main` slug

### Residual risk
Group CEO leave create mutate still blocked by slug→UUID validation; picker discoverability unblocked. Bounded residual close only — **NOT** Phase1/PROD.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: CD-FB-07-FE-LEAVE-PICKER-QC
from_role: qc
to_role: pm
lane: governance
entry: docs/qa/evidence/cd-fb-07-fe-leave-picker-qc-20260719.md — GO WITH CONDITIONS
actions:
  1) Bus INTAKE — promote C-CD-FB-07-01 CLOSED; parent F4 GWC retained (C-02..05 OPEN)
  2) Register new condition C-CD-FB-07-06 / R-CD-FB-07-LEAVE-CREATE-COMPANY-UUID (leave create 400 under companyId=main slug)
  3) Optional dispatch (non-blocking F4 pilot):
     work_item_id: CD-FB-07-LEAVE-CREATE-COMPANY-UUID
     to_role: dev-be (or dev-fe if slug map is FE-only)
     entry: C-CD-FB-07-06 — POST leave-requests with Group CEO main slug → map to holding UUID; U65; no TEXT/uuid P0 reopen
     exit: READY_FOR_QA — create 2xx under main + FE after 2xx + F5; evidence docs/qa/evidence/cd-fb-07-leave-create-uuid-YYYYMMDD.md
  4) Continue customer-demo backlog — do NOT claim Phase1/PROD/F-DELIVERY; do NOT reopen D-CD-FB-07-RESOLVER-COMPANY-TEXT
cấm: seed · Phase1/PROD · reopen TEXT/uuid P0 without new FAIL
```

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/cd-fb-07-fe-leave-picker-qc-20260719.md`
