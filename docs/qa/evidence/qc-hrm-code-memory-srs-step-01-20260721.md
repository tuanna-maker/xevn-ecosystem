# QC Gate — QC-HRM-CODE-MEMORY-SRS-STEP-01 (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-CODE-MEMORY-SRS-STEP-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-21` |
| **environment** | local repo audit (doc-in-code) · `PORTAL_DEV_URL=http://14.225.217.232:8088` (N/A runtime — no browser mutate) |
| **portal_url** | `PORTAL_DEV_URL=http://14.225.217.232:8088` (cited for pack gate; wave is CODE-MEMORY grep, not UF) |
| **persona** | N/A — no login / browser (U65 zero-seed; no FE mutate) |
| **decision** | **GO WITH CONDITIONS** — W1 spine CODE-MEMORY ↔ SRS Diễn biến ↔ TechSpec §14 `ref_srs` FR-HRM-* **14/14 PASS** |
| **scope_claim** | W1 spine 14 BE files only (EM/CI/AT/PR/RC/SC) — comments/CODE-MEMORY ADD |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — QA/QC: no `pnpm seed:*`; no rewrite business logic |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA sample table 14/14 + QC re-grep spine | Phase 1 DONE · `phase1:gate --strict` |
| Confirm no logic rewrite / must_keep AC-ATT-SHEET · G-RC-01 | UF Dev8088 promote · browser U65 retest |
| Soft residual `attendance.service` `ref_srs:` token = GWC P3 | W2+ FR outside spine (AT-02/03, PR mutate, candidates) |
| Evidence pack Layer B on this QC file | Claim PROD-READY |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/be-hrm-code-memory-srs-step-01-20260721.md` | Dev-BE | W1 ADD CODE-MEMORY; READY_FOR_QA; no logic change intended |
| `docs/qa/evidence/qa-hrm-code-memory-srs-step-01-20260721.md` | QA primary | 14/14 PASS; soft P3 `ref_srs:`; jest 4/28 PASS; PASS_TO_PM |
| `docs/client-delivery/hrm/SRS_HRM_KHACH.md` | SRS SoT | Diễn biến per FR (spot EM-01 / AT-14 / RC-01) |
| `docs/hrm/TECHSPEC.md` §14.1–14.8 | TechSpec | `ref_srs` FR-HRM-* |
| Spine sources under `apps/api/hrm-api/src/{employees,contracts-insurance,attendance,payroll,recruitment,settings-catalogs}` | Code | QC re-count CM/DV/ref_srs/FR/§14 |

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-code-memory-srs-step-01-20260721.md` | **FAIL** exit **1** (2/8) — missing `ack_status:` colon form + `portal_url` | **PROCESS** — format-only; substance table + residual present |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-code-memory-srs-step-01-20260721.md` | **PASS** exit **0** (8/8) | This gate file |
| QC PowerShell re-count `@CODE-MEMORY` / `Diễn biến` / `ref_srs:` / `FR-HRM-` / `§14` on 14 spine files | **PASS** — all CM≥3, DV≥3; `attendance.service` `ref_srs=0` (soft) | PRODUCT/doc — confirms QA |
| QA cited `pnpm --filter hrm-api exec jest` (4 patterns) | **PASS** 4 suites / 28 tests | PRODUCT — smoke no seed |
| Seed / rewrite apps logic | none observed | PROCESS U65 **PASS** |

**QC adjudication:** PROCESS gap on QA pack is **format-only** (precedent ATT-SHEET / REC-UF12 GWC). Grep + must_keep substance is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| 14/14 spine `@CODE-MEMORY` + Diễn biến | PRODUCT (doc-in-code) | **PASS** |
| TechSpec §14 + FR cite (13/14 literal `ref_srs:`) | PRODUCT (doc-in-code) | **PASS*** — soft on AT-01 service header |
| AC-ATT-SHEET — `createAttendanceSheet` INSERT sheets only; no `INSERT INTO public.attendance_records` in catalog create | PRODUCT must_keep | **PASS** (QC grep: zero matches for that INSERT in catalog file) |
| G-RC-01 — `job_requisitions.headcount` ≥1; must_keep not postings | PRODUCT must_keep | **PASS** |
| Jest smoke 28 PASS | PRODUCT | **PASS** |
| QA Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| Browser / J-* UF promote | OUT OF SLICE | **N/A** — deferred; matrix 🟢 untouched |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## QC re-grep summary (W1 spine)

| File | CM | DV | ref_srs | Verdict |
|------|----|----|---------|---------|
| employees.controller / .service | ≥7 / ≥7 | ≥8 / ≥9 | ≥1 | **PASS** |
| contracts-insurance controller / service | ≥4 | ≥7 | ≥1 | **PASS** |
| attendance.controller | 8 | 13 | ≥1 | **PASS** |
| attendance.service | 3 | 5 | **0** | **PASS*** soft |
| attendance-catalog.service | 4 | 6 | ≥1 | **PASS** |
| leave-requests.service | 3 | 4 | ≥1 | **PASS** |
| payroll controller / service | 3 | ≥5 | ≥1 | **PASS** |
| recruitment controller / service | ≥5 | ≥5 | ≥1 | **PASS** |
| settings-catalogs controller / service | ≥3 | ≥3 | ≥1 | **PASS** |

\* Soft: header `TechSpec: … §14.4 liên kết · FR-HRM-AT-01` — FR + §14 present; literal token `ref_srs:` missing.

**Hard FAIL rows:** none.

---

## L2.5 journey (U19)

| Journey | Status | Note |
|---------|--------|------|
| J-* browser cross-nav | **N/A this wave** | Doc-in-code traceability only; QA explicitly no UF Dev8088 column change |
| J-HRM-06b / UF-HRM-12 / G-RC-01 browser | **deferred** | Separate QA work_item if product retest needed — not blocker for CODE-MEMORY stamp |

**GO WITH CONDITIONS** lists deferred J-* explicitly — does **not** claim journey retest PASS.

---

## Residual / Conditions

| ID | Item | Owner | Priority | Blocks GO? |
|----|------|-------|----------|------------|
| C-CM-01 | Normalize `attendance.service.ts` TechSpec line → `(ref_srs: FR-HRM-AT-01)` | `dev-be` (doc-only) | P3 optional | **No** — waive-or-fix |
| C-CM-02 | QA pack Layer B format (`ack_status:` + portal N/A note) | `qa` next similar wave | P3 process | **No** |
| C-CM-03 | W2+ CODE-MEMORY FR outside spine | PM / `dev-be` | deferred | **No** — out of W1 |

**No residual** that forces product NO-GO for this slice.

---

## Decision

### **GO WITH CONDITIONS**

**Closed:** QC audit confirms W1 spine **14/14** CODE-MEMORY ↔ Diễn biến ↔ TechSpec §14 FR cites; must_keep AC-ATT-SHEET + G-RC-01 intact; no Phase1 DONE; no seed; no logic rewrite claim contested.

**Conditions (non-blocking):** C-CM-01 optional BE token normalize; C-CM-02 QA pack polish; C-CM-03 W2 deferred.

**NOT Phase 1 DONE. NOT PROD-READY. NOT UF matrix promote.**

---

### completion_report

**Closed:** `QC-HRM-CODE-MEMORY-SRS-STEP-01` governance gate — **GWC** on W1 spine CODE-MEMORY/SRS/TechSpec traceability after QA PASS + QC re-grep.  
**Open:** optional P3 `ref_srs:` on `attendance.service.ts`; W2+ FR CODE-MEMORY; QA pack format polish on future waves.

### next_owner

`pm`

### next_dispatch_prompt

```
work_item_id: BE-HRM-CODE-MEMORY-SRS-STEP-02 (optional) OR close W1 CODE-MEMORY wave
from_role: pm
to_role: dev-be (optional P3) OR ba/pm backlog W2
lane: execution (optional) / program
priority: P3

entry_criteria: QC-HRM-CODE-MEMORY-SRS-STEP-01 GWC PASS_TO_PM; evidence docs/qa/evidence/qc-hrm-code-memory-srs-step-01-20260721.md
exit_criteria (if BE-02):
  1) attendance.service.ts header includes literal (ref_srs: FR-HRM-AT-01)
  2) no business logic change; READY_FOR_QA grep-only
OR PM may waive C-CM-01 and dispatch W2 CODE-MEMORY spine expansion / product residual separately
cấm: seed · Phase1 DONE · rewrite apps logic under guise of CODE-MEMORY
```

### ack_status: PASS_TO_PM

### evidence_path

`docs/qa/evidence/qc-hrm-code-memory-srs-step-01-20260721.md`
