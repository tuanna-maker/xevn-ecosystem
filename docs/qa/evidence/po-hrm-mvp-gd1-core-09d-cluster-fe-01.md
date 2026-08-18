# Evidence — PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-16 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-09d` |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA O1–O12 · SA Option A · peer `CORE09CQC1-MSLBXMUT` · must_keep `CORE09BQC1-MSLB05DZ` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | UPGRADE · preserve_default · CODE-MEMORY APPEND · **NO** invent schema/API/endpoints · **NO** Nest `/core` |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR module UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md` | O1–O12 · BR-CTR-TPL-DYN-01..04 · AC-CTR-XEVN-01..11 · AC-PLT-CTR-TPL-01..07+H · J-HRM-CORE-09D-01..04 DRAFT · J-HRM-CTR-04/07 |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md` | F-CORE-CTR-TPL-01/02 (+ PUT …/clauses · activate) · F-CORE-CTR-CFG-01 RETAIN · physical `/contracts-insurance/contract-templates*` · paper `/core` alias only · OBS `R-QA-CORE-09B-CLAUSE-FP-EMPTY` |
| **DATA-01** | HOLD RETAIN `hrm_contract_templates` + `hrm_contract_template_clauses` · open catalog · **no** mega-EAV · schema ADD NOT unlock |
| **CORR / DYNAMIC-LOCK** | starter 8 = examples ≠ ceiling · CODE-INVALID = format only · `matrix=xevn` → `matrix_family` only |
| **CORE-09c / 09b / 09a / 08 / 02 / 01** | stamps `CORE09CQC1-MSLBXMUT` · `CORE09BQC1-MSLB05DZ` · `CORE09AQC1-MSLA4LX9` · `CORE08QC1-MSL9BFFE` · `CORE02QC1-MSL80DU6` · `CORE01QC1-MSL6WMS7` **must_keep** · **≠** printable DONE · **≠** closed-8 TPL DONE |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09d Diễn biến #1–#11 · BR-CTR-TPL-DYN-01..04 · AC-CTR-XEVN-01..11
- tech_spec / api: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-API-01.md F-CORE-CTR-TPL-01/02 · F-CORE-CTR-CFG-01
- ba: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-BA-01.md O1–O12 · J-HRM-CORE-09D-01..04
- db_design: DATA-01 HOLD cite — no FE invent
- sponsor_confirm: API-01 CONFIRMED RETAIN 2026-08-09 · peer CORE09CQC1-MSLBXMUT · must_keep CORE09BQC1-MSLB05DZ
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind Settings «Tạo/sửa mẫu HĐ» → LIVE GET/POST/PATCH `/contract-templates*` + activate | **UPGRADE** (RETAIN paths · meta PATCH + activate) |
| Bind clause order → LIVE **PUT …/:id/clauses** (SoT junction) | **UPGRADE** — `syncContractTemplateClauseBind` no longer PATCH-only |
| GET …/:id U19 | **ADD** `getContractTemplate` |
| Open catalog #9+ · CODE-INVALID format toast only | **PASS** (RETAIN helpers + toast copy) |
| `matrix=xevn` = family filter only (not code IN 8) | **PASS** (API query passthrough) |
| Display-ready code/template_code · pack VI · term · duration · title_print · matrix · status · clauses[] | **UPGRADE** Settings table + picker label |
| OBS IT_OFFICE vs DRIVER distinct PUT clauses → F5 PREV non-empty | **PASS** FE wire (QA browser when library has active clauses) |
| DENY Nest `/core` dual TPL | **PASS** (source lock) |
| must_keep CORE-09c VER/PDF ≠ printable · 09b PACK+PREV · 09a CL · 08/02/01 | **PASS** |
| DENY claim closed-8 DONE · printable flip · invent endpoints · seed | **PASS** |
| Dev-BE HOLD | **PASS** — no wire gap invent |
| vitest | **32 PASS** (7 files) |

### Files touched

- `apps/web/hrm/src/integrations/hrmApi.ts` — getContractTemplate · putContractTemplateClauses · sync→PUT · clauses[] type
- `apps/web/hrm/src/integrations/contractTemplateClauseBind.test.ts`
- `apps/web/hrm/src/lib/contractClauseOrder.ts` (+ `clauseIdsFromTemplate`) · test
- `apps/web/hrm/src/lib/contractTemplateCatalog.ts` (+ `formatTemplatePickerLabel`) · test
- `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx`
- `apps/web/hrm/src/components/contracts/ContractPrintSpinePanel.tsx`
- `apps/web/hrm/src/lib/poHrmMvpGd1Core09dClusterFe01.source.test.ts`

### Network assert path (QA)

```text
1) Settings → Mẫu HĐ → Tạo mã #9+ hợp lệ → Lưu
   → POST …/contract-templates → 201 HRM-CTR-TPL-201
   → PUT  …/contract-templates/:id/clauses → 200 HRM-CTR-TPL-200
2) F5 / Làm mới → GET …/contract-templates → row còn · template_code/pack/term/title
3) Hợp đồng picker → chọn mẫu #9+ → pack/title/term bind · PREV uses junction clauses[]
4) OBS: Settings bind IT_OFFICE canvas A vs DRIVER canvas B → PUT …/clauses each
   → F5 → GET/:id hoặc list clauses[] non-empty + distinct (khi library có active clauses)
5) matrix=xevn checkbox → GET …?matrix=xevn (family only) — NOT code IN 8
6) Bad format code → toast CODE-INVALID format only (≠ «not in 8»)
7) Path MUST contain /contracts-insurance — Nest /api/hrm/core/** = FAIL
8) must_keep: PREV ephemeral · VER/PDF spine · CL library · registry nullable template
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/integrations/contractTemplateClauseBind.test.ts \
  src/lib/contractClauseOrder.test.ts \
  src/lib/contractTemplateCatalog.test.ts \
  src/lib/poHrmMvpGd1Core09dClusterFe01.source.test.ts \
  src/lib/poHrmMvpGd1Core09cClusterFe01.source.test.ts \
  src/lib/apiError.core-09b.test.ts \
  src/lib/contractPackPreviewUx.test.ts
# → 7 files · 32 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-09D-01** | Login → Cài đặt → Điều khoản HĐ / Mẫu → Tạo mã #9+ → Lưu → F5 | Network **POST** templates **201** `HRM-CTR-TPL-201` + **PUT** `…/clauses` **200** · row còn · **không** Nest `/core` |
| **J-HRM-CORE-09D-02** | Hợp đồng → picker chọn mẫu #9+ → xem trước | Picker có mã custom · PREV binds pack/title/term · `clauses[]` non-empty khi đã bind |
| **J-HRM-CORE-09D-03** | Settings: bind distinct clauses IT_OFFICE vs DRIVER → F5 | PUT …/clauses ×2 · GET list/detail `clauses[]` distinct · dispose OBS empty FP · **không** seed |
| **J-HRM-CORE-09D-04** | matrix=xevn + bad format + seals | GET `?matrix=xevn` family-only · CODE-INVALID format toast · CORE-09c/09b/09a/08/02/01 smoke · **≠** printable true · **≠** closed-8 TPL DONE |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Settings + Contracts  
**Prerequisite:** LIVE Nest contract-templates* + PUT clauses (API RETAIN) · ≥1 active clause in library for OBS  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · claim CORE-09c=printable · claim closed-8 DONE · honesty flip · reopen sealed J-CORE-09C/09B/09A/08/02/01 rewrite

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-09D-BE-LIVE** | CREATE/PUT/activate need LIVE Nest for browser 🟢; FE residual done · Dev-BE HOLD unless wire gap proven | QA / BE if FAIL |
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | Dispose via J-09D-03 PUT bind when library has active clauses — **≠** printable DONE | QA |
| Honesty | `contracts_printable_ready=false` · C-SLICE · ≠ closed-8 TPL DONE · ≠ module CTR UAT | QC |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-01.md
completion_report: |
  Settings + HĐ picker bound to LIVE contracts-insurance/contract-templates*
  (GET/POST/PATCH/GET:id/activate) + PUT …/clauses SoT for junction OBS.
  Open catalog #9+ · matrix=xevn family · display-ready clauses[]/template_code/pack/term.
  must_keep CORE-09c/09b/09a/08/02/01 · printable=false · Nest /core DENY · no seed.
  vitest 32 PASS. Residual: browser U65 J-09D-01..04 on LIVE Nest.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QA-01
  lane: qa · U65 zero-seed browser-only
  entry: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-01.md
  J-*: J-HRM-CORE-09D-01..04
  assert: POST templates 201 + PUT …/clauses 200 · F5 còn · picker #9+ · IT vs DRIVER clauses[] distinct
  path MUST /contracts-insurance — DENY Nest /core · DENY seed · DENY printable flip · DENY closed-8 DONE
  exit: evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qa-01.md · PASS_TO_PM or FAIL with residual
```
