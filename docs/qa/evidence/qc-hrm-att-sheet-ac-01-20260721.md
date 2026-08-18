# QC Gate — QC-HRM-ATT-SHEET-AC-01 (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-ATT-SHEET-AC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-21` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — product AC-ATT-SHEET-01..06 + **J-HRM-06b** CLOSED on Dev8088 |
| **scope_claim** | Attendance sheet create → list → open weekly (P-CC-07 / UC-HRM-23 / HRM-AT-14) only |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser-only; no seed in FE / DevOps / QA / QC chain |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA browser vs BA AC-ATT-SHEET-01..06 | Phase 1 DONE · `phase1:gate --strict` |
| Confirm **J-HRM-06b** L2.5 create → list → open weekly | PROD-READY |
| Confirm FE reload-storm + DevOps `:8088` sync chain | Auto-roster / generate records on POST sheet (CR) |
| Residual register for process + UF promote | Member-CEO / HRBP / mobile attendance |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/ba-hrm-att-sheet-ac-01-20260721.md` | BA AC | AC-ATT-SHEET-01..06 + BR-ATT-SHEET-06/07 locked; U65 |
| `docs/qa/evidence/sa-hrm-att-sheet-techspec-01-20260721.md` | SA | Header≠roster ALIGNED; empty 200 OK; RQ singleflight NFR |
| `docs/qa/evidence/d-hrm-att-sheet-empty-reload-loop-01-fe-20260721.md` | Dev-FE | RQ singleflight + week-clip; vitest 20 PASS; READY_FOR_QA |
| `docs/qa/evidence/d-do-sync-8088-att-weekly-fix-01-20260721.md` | DevOps | `:8088` bind-mount sync; Vite markers `useQuery` / `weeklySheetContext`; L0 200 |
| `docs/qa/evidence/qa-hrm-att-sheet-ac-01-20260721.md` | QA primary | Browser U65 PASS_TO_PM — AC-01..06 + musts; J-HRM-06b PASS |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey SoT | **J-HRM-06b** already ✅ cite QA AC 2026-07-21 |
| `docs/hrm/SRS.md` UC-HRM-23 / HRM-AT-14 | Spec | AC-ATT-SHEET-01..06 |

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-att-sheet-ac-01-20260721.md` | **FAIL** exit **1** (2/8) | **PROCESS** — missing `command_table` + `portal_url` regex only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-att-sheet-ac-01-20260721.md` | **PASS** exit **0** (8/8) | This gate file |
| FE vitest (cited in FE evidence) | **20 PASS** | PRODUCT — FE regression |
| DevOps public `:8088/hr/` + module markers | **200** | ENV — sync live |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` (not localhost-only).

**QC adjudication:** PROCESS gap on QA pack is **format-only** (precedent `qc-d-hrm-att-nav-stall-01`, `qc-gwc-hrm-rec-uf12-01`). Browser substance — click path, Network POST 201 / GET counts, idle 10s, F5, settled empty, U65 — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Create Jul sheet + Công chuẩn → POST **201** → list row without F5 | PRODUCT | **PASS** — AC-01 |
| Open weekly → spinner ends; empty `Không có dữ liệu` / `Tổng số: 0` when records 200 empty | PRODUCT | **PASS** — AC-02 |
| List `total=0` empty-copy path | PRODUCT | **N/A this run** (list already had rows) — weekly honesty covers empty class; soft residual |
| No ERROR banner on records **200** empty | PRODUCT | **PASS** — AC-03 honesty (weekly) |
| `GET attendance-sheets` ≤2 / 10s settle; idle 0 | PRODUCT | **PASS** — AC-04 |
| F5 / hard nav → 3 Jul sheets persist | PRODUCT | **PASS** — AC-05 |
| `GET …/records` open **1**; idle 10s **0**; «Tải lại» click-only +1 | PRODUCT | **PASS** — AC-06 (sponsor storm class **CLOSED**) |
| 0 Invalid time / RangeError | PRODUCT | **PASS** — must #6 |
| Dev8088 FE sync markers | ENV | **PASS** — DevOps evidence |
| Seed / API fake rows | PROCESS U65 | **PASS** — none |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| UF-HRM-16 in `USER_FLOW_OPERABILITY_MATRIX.md` §4 | GOVERNANCE | **OPEN** — promote pending |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## AC-ATT-SHEET-01..06 adjudication

| AC | BA Pass criteria | QA evidence | QC |
|----|------------------|-------------|-----|
| **01** | POST 201 + list row no F5 | POST 201; `Tổng số` 2→3; row `Tất cả vị trí` | **PASS** |
| **02** | Grid or settled empty + reason; no forever spinner | Settled empty; `.animate-spin` **0**; week-clipped 20–26/07 | **PASS** |
| **03** | List total=0 empty copy, no false ERROR | N/A list (total=3); weekly empty honest | **PASS** (weekly); cold-list **soft N/A** |
| **04** | sheets GET ≤2 / 10s | Post-create 1 GET; idle 0 | **PASS** |
| **05** | F5 sheet remains | Hard nav `_cb=` → 3 Jul rows | **PASS** |
| **06** | records GET ≤2 / 10s; loading ends | Open 1; idle 0; prior 1000+ storm **absent** | **PASS** |

---

## L2.5 — J-HRM-06b

| J-ID | Journey | Evidence | Verdict | Promotable |
|------|---------|----------|---------|------------|
| **J-HRM-06b** | Create sheet → list → open weekly (no reload storm) | QA `qa-hrm-att-sheet-ac-01-20260721.md` · journey map ✅ | **PASS** | Yes — map already ✅; UF-HRM-16 matrix flag still pending |

**Mandatory J-* for this slice:** J-HRM-06b only. Parent **J-HRM-06** (records/requests) unchanged / prior PASS — not reopened.

---

## Residual / Conditions (GWC register)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-ATT-SHEET-PACK-01** | P3 PROCESS | qa | **OPEN** | Add `command_table` (pnpm + exit) + literal `PORTAL_DEV_URL` / portal URL pattern so QA pack verify **8/8** |
| **C-ATT-SHEET-UF16-01** | P2 GOVERNANCE | pm → qa | **OPEN** | Promote **UF-HRM-16** into `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §4 (🟢 cite this QC + QA) |
| **C-ATT-SHEET-AC03-COLD** | P3 soft | qa optional | **DEFER OK** | Cold list `total=0` path not exercised this run |
| Auto-roster on create | OUT OF SCOPE | product CR | **CLOSED as residual** | SA/BA header-only lock; empty weekly OK |
| Phase1 / PROD | — | — | **FORBIDDEN** | Not claimed |

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| Audit browser evidence vs AC-01..06 | **DONE** — product PASS |
| Audit **J-HRM-06b** | **DONE** — PASS; journey map ✅ |
| GO or GWC with residual list | **GWC** — residuals above |
| Evidence this file | **DONE** |
| cấm seed · probe-only · localhost-only · Phase1/PROD | **RESPECTED** |

---

## Executive summary

QC audited the full BA → SA → FE → DevOps `:8088` sync → QA browser chain for attendance sheet create/open. Sponsor defect class (empty + reload storm / forever spinner) is **CLOSED** on Dev8088 for Group CEO: POST sheet 201, list update, weekly settles with honest empty, records GET no storm, F5 persists, 0 Invalid time. **J-HRM-06b PASS.**

**GO WITH CONDITIONS** for this bounded slice only. Conditions = process pack polish + UF-HRM-16 matrix promote (and optional AC-03 cold-list soft). **NOT** Phase 1 DONE · **NOT** PROD-READY.

---

## Handoff

- **completion_report:** Closed QC gate for `QC-HRM-ATT-SHEET-AC-01`. Product AC-ATT-SHEET-01..06 + J-HRM-06b **PASS** on Dev8088 U65. Layer B QA pack 2/8 = PROCESS GWC (not product NO-GO). Residuals: C-ATT-SHEET-PACK-01, C-ATT-SHEET-UF16-01, optional AC03 cold. Auto-roster out of scope. No Phase1/PROD.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qc-hrm-att-sheet-ac-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: P1-UF-HRM-16-PROMOTE-01
from_role: pm
to_role: qa
lane: governance
priority: P2
residual_auto_fix: true
entry_criteria: QC GWC docs/qa/evidence/qc-hrm-att-sheet-ac-01-20260721.md; J-HRM-06b ✅; QA PASS qa-hrm-att-sheet-ac-01-20260721.md
exit_criteria: Add UF-HRM-16 row to docs/qa/USER_FLOW_OPERABILITY_MATRIX.md §4 as 🟢 Dev8088 with cite QC+QA+BA; optional polish QA pack command_table + PORTAL_DEV_URL for verify 8/8 (C-ATT-SHEET-PACK-01); ack_status PASS_TO_PM; evidence docs/qa/evidence/qa-uf-hrm-16-promote-01-20260721.md
cấm: seed · reopen AC-01..06 product · Phase1/PROD claim
```

Parallel optional (P3 process only — do not block):

```text
work_item_id: C-ATT-SHEET-PACK-01
to_role: qa
exit: Edit qa-hrm-att-sheet-ac-01-20260721.md — add command_table with pnpm verify/vitest exit + PORTAL_DEV_URL=http://14.225.217.232:8088; pnpm run verify:qc:evidence-pack exit 0
```
