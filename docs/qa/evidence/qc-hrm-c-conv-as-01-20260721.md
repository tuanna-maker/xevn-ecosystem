# QC Gate — QC-HRM-C-CONV-AS-01 (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-C-CONV-AS-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-21` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — TM **C-CONV-AS-01** / Condition **C3** attendance-sheet DTO residual CLOSED |
| **scope_claim** | §15.1 DTO-at-edge for `POST/PATCH attendance-sheets` only |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser FE create only; no seed in BE / DevOps / QA / QC |

---

## Scope (bounded — NARROW)

| In scope | Explicitly out (cấm expand) |
|----------|------------------------------|
| Close TM C3 / gap **C-CONV-AS-01** (`CreateAttendanceSheetDto` + ValidationPipe live) | **Hire G-DB-01** / J-HRM-INT-01 reopen |
| Audit BE DTO wire + DevOps :8088 sync + QA U65 create/empty/F5/VAL400 | **G-AT10-02** leave overlap |
| J-HRM-06b smoke slice (create → list → open weekly empty) | Phase 1 DONE · PROD-READY |
| Process pack polish residual (QA Layer B) | Work-shifts still `Record<string, unknown>` |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/tm-hrm-code-spec-convention-01-20260721.md` | TM | Condition **C3** / gap **C-CONV-AS-01** — sheets `Record<string, unknown>` |
| `docs/qa/evidence/be-hrm-c-conv-as-01-20260721.md` | Dev-BE | DTO create/update + controller wire; jest **10/10**; must_keep header-only INSERT |
| `docs/qa/evidence/d-do-sync-8088-g-db-01-conv-01-20260721.md` | DevOps | DTO files on VPS; dist `IsDateString` + `CreateAttendanceSheetDto`; hrm-be×3 healthy |
| `docs/qa/evidence/qa-hrm-c-conv-as-01-20260721.md` | QA primary | Browser U65 PASS — POST **201** `HRM-AS-201`; list 3→4 + F5; empty honesty; invalid → **400** |
| Code spot (QC) | QC | `create-attendance-sheet.dto.ts` class-validator; controller `@Body() CreateAttendanceSheetDto` / `UpdateAttendanceSheetDto` |
| `docs/hrm/TECHSPEC.md` §15.1 | Spec | DTO at edge |

---

## Evidence pack gate (Layer B)

### command_table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-c-conv-as-01-20260721.md` | **FAIL** exit **1** (1/8) — `command_table` needs pnpm/adb/node + exit token | **PROCESS** — format-only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-c-conv-as-01-20260721.md` | **PASS** exit **0** (8/8) | This gate file |
| BE jest (cited) `be-hrm-c-conv-as-01.spec.ts` | **10 PASS** | PRODUCT — BE regression |
| QC L0 spot `curl.exe` `http://14.225.217.232:8088/` | **200** | ENV |
| QC L0 spot `curl.exe` `http://14.225.217.232:3101/api/hrm/` | **200** | ENV |
| QC L0 spot `curl.exe` `http://14.225.217.232:3001/api/hrm/` | **200** | ENV |
| Local `pnpm run qc:dev-stack` | **FAIL** exit **1** (localhost :28001/:28002 down) | **ENV** — not product; Dev8088 is SoT for this residual |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088`

**QC adjudication:** QA Layer B PROCESS gap is **format-only** (precedent leave-create / att-sheet GWC). Browser substance — create 201, empty honesty, F5, VAL 400 — complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Sheets POST/PATCH typed DTO (no `Record<string, unknown>` on sheet edge) | PRODUCT | **PASS** — C-CONV-AS-01 |
| ValidationPipe whitelist live: missing/non-ISO/unknown field → **400** `HRM-VAL-001` | PRODUCT | **PASS** |
| Create header → POST **201** `HRM-AS-201`; list 3→4; F5 still 4 | PRODUCT | **PASS** — AC-ATT-SHEET-01/05 |
| Open weekly: empty honesty (`Tổng số: 0`, no auto roster) | PRODUCT | **PASS** — AC-ATT-SHEET-02/06 must_keep |
| Dev8088 hrm-be sync + health | ENV | **PASS** — DevOps + QC spot 200 |
| Local qc:dev-stack down | ENV | **N/A** — slice is Dev8088 |
| Seed / hire retest / G-AT10-02 | PROCESS U65 / out | **PASS** — not run (cấm) |
| QA pack Layer B 1/8 | PROCESS | **OPEN P3** — non-blocking |
| BR-ATT-SHEET-04 start≤end in DTO | PRODUCT soft | **DEFER OK** — service/FE; not §15.1 convention block |
| Phase1 / PROD | OUT | **NOT claimed** |

---

## AC adjudication (narrow residual)

| Residual AC | Pass criteria | QA / BE evidence | QC |
|-------------|---------------|------------------|-----|
| **C-CONV-AS-01 / TM C3** | class-validator DTO on sheets POST/PATCH; pipe active | BE DTO + wire; QA invalid → 400 | **PASS** |
| AC-ATT-SHEET-01 create | POST 201 + list row | `HRM-AS-201` id `beb89499-…`; list 4 | **PASS** |
| AC-ATT-SHEET-02/06 empty | Open weekly no invent roster | `total:0`; spinner 0 | **PASS** |
| AC-ATT-SHEET-05 F5 | Persist after hard nav | F5 `_cb=` → 4 rows | **PASS** |
| U65 | Browser-only; no seed | Explicit QA + DevOps | **PASS** |

---

## L2.5 — journey matrix (this slice)

| J-ID / path | Journey | Evidence | Verdict | Promotable |
|-------------|---------|----------|---------|------------|
| **J-HRM-06b** (smoke) | Create sheet → list → open weekly empty | `qa-hrm-c-conv-as-01-20260721.md` | **PASS** | Yes within C-CONV-AS residual only |
| Hire G-DB-01 / J-HRM-INT-01 | Hire negative + happy | — | **NOT TESTED** | Out of scope (cấm reopen hire) |
| G-AT10-02 | Leave overlap | — | **NOT TESTED** | Out of scope (cấm) |

**Mandatory for this QC slice:** J-HRM-06b create/empty/F5 + VAL400 for DTO residual. Hire / G-AT10-02 **deferred by PM NARROW**.

**Map status:** J-HRM-06b already ✅ PASS on journey map from prior att-sheet AC wave; this QC confirms DTO convention residual does not regress that path on Dev8088.

---

## Residual / Conditions (GWC register)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-CONV-AS-PACK-01** | P3 PROCESS | qa | **OPEN** | Patch QA evidence `command_table` with `pnpm run verify:qc:evidence-pack` + exit so verify **8/8** |
| **C-CONV-AS-BR04** | P3 soft | be/fe optional | **DEFER OK** | BR-ATT-SHEET-04 start≤end not enforced in DTO (BE residual note) — not blocking C3 close |
| Work shifts `Record<…>` | Info | — | **OUT** | Not C-CONV-AS-01 |
| Hire G-DB-01 | Separate | qa | **FORBIDDEN expand** | Parallel lane if still open — not this gate |
| G-AT10-02 | OUT | — | **FORBIDDEN expand** | Not this wave |
| Phase1 / PROD | — | — | **FORBIDDEN** | Not claimed |

**TM C3 / C-CONV-AS-01 product residual:** **CLOSED**.

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| GO/GWC; close TM C-CONV-AS-01 / attendance sheet DTO residual | **GWC** — product CLOSED; process pack P3 OPEN |
| cấm seed · reopen hire · G-AT10-02 · Phase1/PROD | **Respected** |
| Evidence path this file | **PASS** |

---

## Decision

**GO WITH CONDITIONS** for residual slice **C-CONV-AS-01** (TM Condition **C3**) on Dev8088 (`PORTAL_DEV_URL=http://14.225.217.232:8088`).

- Product sheet DTO at edge + U65 create/empty/F5/VAL400: **CLOSED**.
- Process pack polish: **OPEN P3** (non-blocking).
- **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** hire / G-AT10-02.

---

## completion_report

### Closed
- QC audit of TM C3 → BE DTO → DevOps :8088 sync → QA browser chain.
- **C-CONV-AS-01:** `CreateAttendanceSheetDto` / `UpdateAttendanceSheetDto` live; ValidationPipe **400** on invalid; POST **201** `HRM-AS-201`.
- **must_keep** AC-ATT-SHEET empty honesty held (no auto roster).
- J-HRM-06b smoke **PASS**; U65 zero-seed; hire / G-AT10-02 **not** reopened.
- QC evidence pack verify **8/8** on this file; Dev8088 L0 spot portal + HRM **200**.

### Open (conditions)
- **C-CONV-AS-PACK-01** — QA pack format 1/8 → polish to 8/8 (P3 PROCESS).
- **C-CONV-AS-BR04** — start≤end business reject defer OK (not §15.1 block).
- Program Phase1/PROD / hire / G-AT10-02 — standing out of scope.

### next_owner
`pm`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-C-CONV-AS-PACK-POLISH-01
from_role: pm
to_role: qa
lane: execution
priority: P3
entry: QC GWC docs/qa/evidence/qc-hrm-c-conv-as-01-20260721.md — product C-CONV-AS-01/TM C3 CLOSED; condition C-CONV-AS-PACK-01 OPEN
exit: Patch docs/qa/evidence/qa-hrm-c-conv-as-01-20260721.md — command_table must include `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-c-conv-as-01-20260721.md` with exit 0/1 token (keep PORTAL_DEV_URL); re-run verify exit 0 (8/8); PASS_TO_PM; do NOT retest product sheet create unless polish reveals gap; cấm seed · hire reopen · G-AT10-02 · Phase1/PROD

# Parallel if hire G-DB-01 still open (separate lane — not this QC):
work_item_id: QA-HRM-G-DB-01-HIRE-8088-01
from_role: pm
to_role: qa
U65 browser hire negative HRM-REC-HIRE-400 + happy employee_id — separate from sheet DTO
```

**ack_status:** `PASS_TO_PM`  
**evidence_path:** `docs/qa/evidence/qc-hrm-c-conv-as-01-20260721.md`
