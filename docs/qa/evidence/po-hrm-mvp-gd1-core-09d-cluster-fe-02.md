# Evidence — PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-02` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-09d` |
| **depends_on** | QA-01 **FAIL_TO_PM** · `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qa-01.md` · stamp `CORE09DQA-MSLD9JI9` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **FIX** · preserve_default · CODE-MEMORY APPEND · **NO** invent endpoints · **NO** Nest `/core` rewrite · **NO** sealed CORE-09c/09b/09a reopen |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR module UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only |
| **spec_ref** | API-01 F-CORE-CTR-TPL-02 · AC-CORE-09D-OBS-01 · BA O5 · UpdateContractTemplateDto (no body `company_id`) |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09d · AC-CORE-09D-OBS-01 (IT vs DRIVER bind)
- tech_spec / api: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md F-CORE-CTR-TPL-02 · PATCH meta + PUT …/clauses
- ba: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md O5 · J-HRM-CORE-09D-03
- db_design: DATA-01 HOLD cite — no FE invent
- defect: QA-01 R-FE-CORE-09D-PATCH-COMPANY-ID · HRM-VAL-001 property company_id should not exist
- sponsor_confirm: API-01 CONFIRMED RETAIN · must_keep J-01/02/04 PASS from QA-01
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| **R-FE-CORE-09D-PATCH-COMPANY-ID** — `updateContractTemplate` PATCH body omits `company_id` (query only) | **FIXED** |
| Settings edit Lưu → PATCH 2xx then **PUT …/clauses** 200 (path unblocked) | **FIXED** (wire RETAIN; body strip unblocks) |
| must_keep J-01 create POST+PUT · J-02 picker+PREV · J-04 matrix/format/Nest0 | **PASS** (no regression to create/picker paths) |
| DENY Nest `/core` · printable flip · closed-8 DONE · seed · invent endpoints | **PASS** |
| Sealed CORE-09c/09b/09a rewrite | **not touched** (CODE-MEMORY APPEND only) |
| vitest | **36 PASS** (8 files) |

### Root cause

QA-01 J-03: Settings edit starter `XEVN_FT_12M_OFFICE` / `DRIVER` → FE `updateContractTemplate` spread `…payload` into PATCH JSON **including `company_id`** → BE `HRM-VAL-001` → `syncContractTemplateClauseBind` / PUT …/clauses **never called**.

### Fix

`apps/web/hrm/src/integrations/hrmApi.ts` — destructure `company_id` to query `?company_id=` only; `JSON.stringify(body)` without `company_id`.

Settings panel RETAIN: still passes `company_id` in the client arg object (scope); strip happens inside hrmApi (peer `updateContractClause` pattern).

### Files touched

- `apps/web/hrm/src/integrations/hrmApi.ts` — FIX updateContractTemplate + CODE-MEMORY FE-02
- `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx` — CODE-MEMORY FE-02 APPEND only
- `apps/web/hrm/src/integrations/contractTemplateClauseBind.test.ts` — PATCH body omit assert
- `apps/web/hrm/src/lib/poHrmMvpGd1Core09dClusterFe02.source.test.ts` — source lock

### Network assert path (QA-02)

```text
1) Settings → open XEVN_FT_12M_OFFICE (or DRIVER) → canvas bind ≥1 clause → Lưu
   → PATCH …/contract-templates/:id?company_id=main → 200 (body MUST NOT contain company_id)
   → PUT  …/contract-templates/:id/clauses?company_id=main → 200 HRM-CTR-TPL-200
2) F5 / Làm mới → GET list or GET/:id → clauses[] or layout distinct vs other pack
3) Repeat DRIVER pack — clauses[] distinct from IT_OFFICE (OBS AC-CORE-09D-OBS-01)
4) Regression must_keep: J-01 create POST 201+PUT · J-02 picker #9+ PREV · J-04 matrix/format/Nest0
5) Path MUST /contracts-insurance — Nest /api/hrm/core/** = FAIL
6) DENY seed · printable flip · closed-8 DONE claim
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/integrations/contractTemplateClauseBind.test.ts \
  src/lib/poHrmMvpGd1Core09dClusterFe02.source.test.ts \
  src/lib/poHrmMvpGd1Core09dClusterFe01.source.test.ts \
  src/lib/contractClauseOrder.test.ts \
  src/lib/contractTemplateCatalog.test.ts \
  src/lib/poHrmMvpGd1Core09cClusterFe01.source.test.ts \
  src/lib/apiError.core-09b.test.ts \
  src/lib/contractPackPreviewUx.test.ts
# → 8 files · 36 tests PASS
```

---

## 4. U65 browser plan (QA-02 — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-09D-03** (retest P0) | Settings → edit `XEVN_FT_12M_OFFICE` / `XEVN_FT_12M_DRIVER` → canvas bind → Lưu → F5 | PATCH **200** (no body `company_id`) + **PUT …/clauses 200** · F5 `clauses[]`/`layout` distinct · Nest `/core` **0** |
| **J-HRM-CORE-09D-01** | must_keep create #9+ | POST **201** + PUT clauses **200** · F5 row |
| **J-HRM-CORE-09D-02** | must_keep picker + PREV | picker #9+ · PREV ephemeral |
| **J-HRM-CORE-09D-04** | must_keep seals | matrix=xevn · format toast · Nest 0 · printable **false** · ≠ closed-8 DONE |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · Settings `?tab=contract-legal`  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · claim CORE-09c=printable · claim closed-8 DONE · honesty flip

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | Close when J-03 PUT bind + F5 clauses[] distinct PASS | QA-02 |
| **R-QA-CORE-09D-ACTIVATE-BTN** | P2 — activate flaky on create (QA-01) | FE later if retest fails |
| **R-QA-CORE-09D-DND-STORM** | P2 — `@hello-pangea/dnd` console storm | FE later · not P0 after PATCH fix |
| Honesty | `contracts_printable_ready=false` · C-SLICE · ≠ closed-8 TPL DONE · ≠ module CTR UAT | QC |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-02
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-02.md
completion_report: |
  Fixed R-FE-CORE-09D-PATCH-COMPANY-ID: updateContractTemplate PATCH omits
  company_id from JSON body (query ?company_id= only). Settings edit Lưu can
  reach PUT …/clauses 200. must_keep J-01/02/04 paths untouched. Nest /core
  DENY · printable=false · no seed · no sealed 09c/09b/09a rewrite.
  vitest 36 PASS (8 files).
next_owner: qa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QA-02
  lane: qa · U65 zero-seed browser-only
  program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
  uc_ids: UC-BP-CORE-09d
  depends_on: FE-02 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-02.md
  entry_criteria: Fix R-FE-CORE-09D-PATCH-COMPANY-ID landed — PATCH body no company_id
  J-*: retest J-HRM-CORE-09D-03 (P0) + must_keep J-01/02/04
  assert: edit XEVN_FT_12M_OFFICE / DRIVER → PATCH 200 (body omit company_id) + PUT …/clauses 200
          · F5 clauses[] or layout distinct · Nest /core 0 · printable false · no seed
  exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qa-02.md · PASS_TO_PM or FAIL residual
  cấm: seed · Nest /core · flip contracts_printable_ready · claim closed-8 DONE · claim CORE-09c printable DONE
```
