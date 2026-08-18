# QC Gate — QC-HRM-LEAVE-CREATE-8088-01 (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-LEAVE-CREATE-8088-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-21` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — G-DB-03 CREATE + G-AT10-01 slug residual CLOSED on Dev8088 |
| **scope_claim** | Leave create path only (`leave_requests` ensureSchema CREATE + `company_id` TEXT/slug ladder) |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser FE chain only; no seed in DevOps / BE / QA / QC |

---

## Scope (bounded — NARROW)

| In scope | Explicitly out (cấm expand) |
|----------|------------------------------|
| Audit G-DB-03 CREATE live on `:8088` (no 42P01 / relation missing) | **G-AT10-02** overlap/balance |
| Audit G-AT10-01 slug/`company_id` TEXT ladder (list `company_id=main`; no UUID hard-fail) | Attendance sheet / weekly RQ / AC-ATT-SHEET |
| QA browser U65 leave create → POST 201 → FE + F5 | Phase 1 DONE · PROD-READY |
| Process pack polish residual | Reopen **CD-FB-07** employee picker |
| Soft-nav P3 note | Recruitment / other HRM modules |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/be-hrm-g-db-03-leave-create-01-20260721.md` | Dev-BE | Nest `CREATE TABLE IF NOT EXISTS public.leave_requests`; jest leave-requests + bridge PASS; TechSpec G-DB-03 CLOSED note |
| `docs/qa/evidence/be-hrm-g-at10-01-scope-slug-01-20260721.md` | Dev-BE | DTO `@IsString`/`MaxLength(64)`; INSERT `$2::text`; create `main`→`holding` TEXT; 21 jest PASS |
| `docs/qa/evidence/d-do-sync-8088-leave-schema-01-20260721.md` | DevOps | VPS sync + rebuild hrm-be×3; dist CREATE + `$2::text` + IsString markers; health **200** |
| `docs/qa/evidence/qa-hrm-leave-create-8088-01-20260721.md` | QA primary | Browser U65 PASS_TO_PM — POST **201** `HRM-LEAVE-201`; 87→88 / F5 88; slug `main` list |
| `docs/hrm/TECHSPEC.md` §17.3 / §14.9 | Spec | G-DB-03 · G-AT10-01 |

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-leave-create-8088-01-20260721.md` | **FAIL** exit **1** (2/8) — missing `command_table` + `portal_url` regex (`PORTAL_DEV_URL` / 517x) | **PROCESS** — format-only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-leave-create-8088-01-20260721.md` | **PASS** exit **0** (8/8) | This gate file |
| BE jest (cited) leave-requests + leave-workflow.bridge | **21 PASS** | PRODUCT — BE regression |
| QC L0 spot `curl.exe` `http://14.225.217.232:8088/` | **200** | ENV |
| QC L0 spot `curl.exe` `http://14.225.217.232:3101/api/hrm/` | **200** | ENV |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` (not localhost-only).

**QC adjudication:** PROCESS gap on QA pack is **format-only** (precedent `qc-hrm-att-sheet-ac-01-20260721`, UX-VI format GWC). Browser substance — click path, Network POST **201**, no 42P01, FE counters + F5, U65 — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| POST leave-requests **201** `HRM-LEAVE-201`; no 42P01 / relation missing | PRODUCT | **PASS** — G-DB-03 |
| List/query `company_id=main` (slug) **200**; create under holding/`main` scope without UUID DTO hard-fail | PRODUCT | **PASS** — G-AT10-01 |
| FE after 2xx: toast + counters 87→88 / 29→30; dialog closed | PRODUCT | **PASS** |
| F5: totals 88/30; row `ca24b5d2-…` persists | PRODUCT | **PASS** |
| FE POST body maps `holding`→UUID (CD-FB-07 must_keep) | PRODUCT / design | **PASS** — compatible; **cấm reopen** picker |
| Dev8088 hrm-be sync + health | ENV | **PASS** — DevOps + QC spot 200 |
| Seed / API fake | PROCESS U65 | **PASS** — none |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| Soft-nav Att↔Rec bounce mid-session | P3 UX | **DEFER OK** |
| G-AT10-02 / sheet / Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## AC adjudication (narrow residual)

| Residual AC | Pass criteria | QA evidence | QC |
|-------------|---------------|-------------|-----|
| **G-DB-03** | CREATE ensure live; POST leave 2xx; no relation-missing | POST **201**; no 42P01; DevOps dist CREATE marker | **PASS** |
| **G-AT10-01** | Slug ladder list/create; no UUID-only hard-fail on OU scope | `companyId=main` + GET `company_id=main` **200**; create **201** | **PASS** |
| FE + F5 persist | Counters + row after reload | 87→88; F5 88/30; id `ca24b5d2-…` | **PASS** |
| U65 | Browser-only; no seed | Explicit in QA + DevOps | **PASS** |

---

## L2.5 — leave create journey (this slice)

| J-ID / path | Journey | Evidence | Verdict | Promotable |
|-------------|---------|----------|---------|------------|
| **Leave-create path** (QA: J-HRM leave create) | Login → Chấm công → Nghỉ phép → Tạo → Gửi → FE + F5 | `qa-hrm-leave-create-8088-01-20260721.md` | **PASS** | Yes within residual only |
| **J-HRM-06b** / attendance sheet | Sheet create→weekly | — | **NOT TESTED** | Out of scope (cấm) |
| **G-AT10-02** | Overlap/balance | — | **NOT TESTED** | Out of scope (cấm) |

**Mandatory for this QC slice:** leave-create path only. Sheet / G-AT10-02 **deferred by PM NARROW** — not reopened.

---

## Residual / Conditions (GWC register)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-LEAVE-CREATE-PACK-01** | P3 PROCESS | qa | **OPEN** | Add `command_table` (pnpm + exit) + literal `PORTAL_DEV_URL=` so QA pack verify **8/8** |
| Soft-nav Att↔Rec | P3 | fe optional | **DEFER OK** | Known soft-nav class; dedicated tab stabilized create |
| FE POST UUID map | Info | — | **CLOSED as design** | CD-FB-07 must_keep — **cấm reopen** picker |
| G-AT10-02 / sheet | OUT | — | **FORBIDDEN expand** | Not this wave |
| Phase1 / PROD | — | — | **FORBIDDEN** | Not claimed |

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| GO/GWC for G-DB-03 + G-AT10-01 browser residual only | **GWC** — product CLOSED; process pack P3 OPEN |
| Do NOT expand G-AT10-02 / sheet / Phase1/PROD | **Respected** |
| cấm seed · reopen CD-FB-07 picker | **Respected** |
| Evidence path this file | **PASS** |

---

## Decision

**GO WITH CONDITIONS** for residual slice **G-DB-03 CREATE + G-AT10-01 slug** on Dev8088 (`PORTAL_DEV_URL=http://14.225.217.232:8088`).

- Product leave create U65: **CLOSED**.
- Process pack polish: **OPEN P3** (non-blocking).
- **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** G-AT10-02 / sheet.

---

## completion_report

### Closed
- QC audit of BE + DevOps + QA chain for leave create on `:8088`.
- **G-DB-03:** POST **201**, no 42P01 — CREATE path live.
- **G-AT10-01:** slug `main` list/create scope without UUID hard-fail.
- FE counters + F5 persist; U65 zero-seed; CD-FB-07 picker **not** reopened.
- QC evidence pack verify **8/8** on this file; L0 spot portal + HRM LB **200**.

### Open (conditions)
- **C-LEAVE-CREATE-PACK-01** — QA pack format 6/8 → polish to 8/8 (P3 PROCESS).
- Soft-nav P3 defer OK.
- Program Phase1/PROD / G-AT10-02 / sheet — standing out of scope.

### next_owner
`pm`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-LEAVE-CREATE-PACK-POLISH-01
from_role: pm
to_role: qa
lane: execution
priority: P3
entry: QC GWC docs/qa/evidence/qc-hrm-leave-create-8088-01-20260721.md — product G-DB-03+G-AT10-01 CLOSED; condition C-LEAVE-CREATE-PACK-01 OPEN
exit: Patch docs/qa/evidence/qa-hrm-leave-create-8088-01-20260721.md — add command_table with pnpm run verify:qc:evidence-pack exit codes + literal PORTAL_DEV_URL=http://14.225.217.232:8088; re-run verify exit 0 (8/8); PASS_TO_PM; do NOT retest product leave create unless pack polish reveals gap; cấm seed · G-AT10-02 · sheet · Phase1/PROD · CD-FB-07
```

**ack_status:** `PASS_TO_PM`  
**evidence_path:** `docs/qa/evidence/qc-hrm-leave-create-8088-01-20260721.md`
