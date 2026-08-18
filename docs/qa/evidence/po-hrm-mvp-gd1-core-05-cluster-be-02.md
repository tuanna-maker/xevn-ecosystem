# PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-02 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-05) |
| **lane** | execution · **dev-be** |
| **uc_ids** | `UC-BP-CORE-05` |
| **Date** | 2026-08-09 |
| **change_mode** | **FIX** · `preserve_default: true` |
| **depends_on** | QA-01 **FAIL** `CORE05QA-MSLGFOXU` · P0 **R-CORE-05-EMPTY-DATE-500** · BE-01 READY · API-01 CONFIRMED |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 · **DENY** claim CORE-05 DONE · **DENY** invent CORE-06/07 · seed · honesty flip |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-CORE-05** · optional assigned/return dates |
| **api_design** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md` F-CORE-AST-01 · assignedDate/returnDate optional |
| **qa fail** | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-01.md` · stamp `CORE05QA-MSLGFOXU` |
| **be-01** | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-be-01.md` spine RETAIN |
| **sponsor_confirm** | API-01 CONFIRMED · FIX empty DATE only |
| **change_mode** | **FIX** normalize · **RETAIN** serial 409 · BB · DELETE-FORBIDDEN · Nest `/core` DENY · U19 |

---

## 2. Root cause → fix

| ID | Detail |
|----|--------|
| **R-CORE-05-EMPTY-DATE-500** | FE default body sends `assignedDate: ""` / `returnDate: ""` → INSERT `::$n::date` with `""` → PG `invalid input syntax for type date: ""` → **500** `HRM-SYS-001` |
| **FIX** | `normalizeAssetWritePayload` — after camel→snake, coerce blank/`trim()===''` on `assigned_date` / `return_date` → **`null`** before INSERT/UPDATE |
| **Parity** | Matches QA diag: omit / `null` → **201**; blank string now same as null |

**File:** `apps/api/hrm-api/src/employees/employee-profile.service.ts`  
**CODE-MEMORY:** APPEND `@CODE-MEMORY-CHANGE … BE-02` (FIX empty DATE)

---

## 3. RETAIN / DENY

| Class | Status |
|-------|--------|
| Serial **409 `HRM-EMP-ASSET-SERIAL-CONFLICT`** | **RETAIN** |
| BB confirm `handoverConfirmed` + `handoverDocId=id` | **RETAIN** |
| Soft-delete **409 `HRM-EMP-ASSET-DELETE-FORBIDDEN`** | **RETAIN** |
| Nest `@Controller('core')` AST SoT | **DENY** (ABSENT) |
| U19 list=get=mutate scope | **RETAIN** |
| CORE-03 / 02b / 09d..01 seals | **RETAIN** · not reopened |
| Invent CORE-06/07 · honesty flip · seed | **DENY** |
| Claim CRUD alone = CORE-05 DONE | **DENY** · C-SLICE |

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-core-05-cluster-be-01|employee-profile.service.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 19 passed
  (CORE-05: 11 · profile residual: 8)
  NEW: createAsset assignedDate:'' / returnDate:'' → null DATE · 201 (not 500)

pnpm --filter hrm-api exec tsc -p tsconfig.build.json --noEmit
→ exit 0
```

---

## 5. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa` (after FE-02 peer READY — omit blank dates optional; BE coerce is primary)
- **evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-be-02.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-02
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-05
depends_on: BE-02 READY_FOR_QA — docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-be-02.md · FE-02 peer READY (omit blank dates optional)
prior_fail: QA-01 CORE05QA-MSLGFOXU · R-CORE-05-EMPTY-DATE-500
entry_criteria: L0 stack; rebuild+restart hrm-api :28001; U65 zero-seed; browser-only; honesty false; C-SLICE
MISSION: Retest J-HRM-CORE-05-01..05 — Profile Tài sản Thêm cấp phát với assignedDate/returnDate blank (FE default "") → POST /api/hrm/employees/:id/assets **201** (not 500); F5 row + statusLabelVi; BB confirm handoverDocId=id; notes≠BB; duplicate serial → 409 SERIAL-CONFLICT; soft returned prefer · DELETE issued → 409 DELETE-FORBIDDEN; Nest /core assets 0; RETAIN CORE-03/02b/09d..01; DENY invent CORE-06/07 · claim CORE-05 DONE · seed · honesty flip.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-qa-02.md · PASS_TO_PM or FAIL
cấm: seed · API-only PASS · Nest /core SoT · honesty flip
```

---

## completion_report

- **Closed:** P0 **R-CORE-05-EMPTY-DATE-500** — empty-string DATE coerce → null in `normalizeAssetWritePayload`; jest create `assignedDate:''`/`returnDate:''` **PASS** (params null, not `""`); tsc exit 0; must_keep serial/BB/DELETE-FORBIDDEN/`/core` DENY/U19; honesty false · C-SLICE.
- **Residual:** QA-02 U65 J-HRM-CORE-05-01..05 after FE-02 peer · CORE-06 QUEUED · personnel/printable false · **DENY** CORE-05 DONE.
