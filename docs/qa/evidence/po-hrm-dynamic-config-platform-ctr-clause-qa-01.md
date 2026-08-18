# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | CTR-CLAUSE-BA-01 CONFIRMED · BE-SA-01 Option A HOLD · FE-SA HOLD |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Stamp** | `CLQA-KM4JR3` |
| **Portal** | http://127.0.0.1:5173 (8088 down · 5173 L0 200) |
| **Panel** | `ContractLegalPrintSettingsPanel` · Settings → Hợp đồng / legal-print / clause admin |
| **U65** | zero-seed · browser Playwright · no `pnpm seed:*` |
| **Honesty** | `contracts_printable_ready=false` RETAIN · **C-SLICE-≠-MODULE** · DENY module CTR UAT / Phase1 |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** — AC-01 PATCH wiring · AC-02/03 issue spine not completed in-session |
| **EV machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-01.json` |
| **Runner** | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-01.mjs` |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `28001` **200** · xbos **200** · portal **5173** **200** (8088 unreachable) |
| `pnpm --filter hrm-api test contract-legal-print.service.spec.ts` | **26/26 PASS** (VAL snapshot / PDF / create template) |
| FE hardcode body grep | No long legal body string literals in `apps/web/hrm/src` (labels-only constants OK) |
| Seed | **none** |
| BE unlock | **not required** (BA NO GAP) — failure class = **FE PATCH DTO** |

**spec_read_ack:** BA-01 §4 AC-PLT-CTR-CL-01..06+H · BE-SA-01 Option A · FE-SA-01 R-PLT-CTR-CL-FE-01 HOLD · PRINTABLE-HOLD-SA-01

---

## 2. L2.5 journey matrix (deferred cite — not promoted module UAT)

| J-ID | Scope this seat | Verdict | Note |
|------|-----------------|--------|------|
| **J-HRM-CTR-CL-01** | Settings list → Sửa clause draft → Lưu → F5 | **FAIL** | PATCH blocked `HRM-VAL-001` |
| **J-HRM-CTR-CL-02** | Issued clause body edit soft-block | **OBS** | No issued PV in env + same VAL-001 |
| **J-HRM-CTR-CL-03** | Issue freeze snapshot | **OBS** | Could not issue print-version U65 chain |
| **J-HRM-CTR-CL-04** | CREATE clause FE | **PASS** | POST 201 + F5 row |
| **J-HRM-CTR-CL-05** | Soft-retire | **PASS** | POST retire + F5 retired |
| **J-HRM-CTR-CL-*** preview | Consumer resolve | **OBS** | Preview not reached (contract/issue incomplete) |

Matrix promotion: **deferred** per `C-SLICE-≠-MODULE` — journeys documented, not flipped to PROGRAM_JOURNEY_MAP 🟢.

---

## 3. Acceptance criteria (U63/U65 blocks)

### AC-PLT-CTR-CL-04 — CREATE clause (J-HRM-CTR-CL-04)

- **Persona / URL:** `ceo@xe.vn` · http://127.0.0.1:5173/hr/settings?portal=1&tenantId=xevn&companyId=main&tab=contract-legal
- **Click path:** Settings → tab Hợp đồng in → tab Điều khoản → nhập code `CL_CR_CLQA-KM4JR3` · title · body có `{{employee_name}}` → **Lưu**
- **Before:** EFF clauses list loaded (GET `HRM-CTR-CL-200`)
- **Action:** POST create từ form FE
- **Network:** `POST /api/hrm/contracts-insurance/contract-clauses` → **201** `HRM-CTR-CL-201` · id `7ee37880-7a6c-4ade-88ab-98ad2c1f2e63`
- **FE after 2xx:** toast · row `ctr-clause-row-CL_CR_CLQA-KM4JR3` visible
- **F5:** row còn · body snippet trong list context
- **Verdict:** **🟢 PASS**
- **spec_ref:** BA-01 §4 AC-04 · UC-CTR-CL-CREATE-N+1

### AC-PLT-CTR-CL-01 — draft edit body_vi (J-HRM-CTR-CL-01)

- **Persona / URL:** same Settings clause panel
- **Click path:** Tạo `CL_DR_CLQA-KM4JR3` (draft) → **Lưu** 201 → **Sửa** → đổi `body_vi` (v1→v2) → **Lưu**
- **Before:** draft row visible · body v1
- **Action:** PATCH update
- **Network:** `PATCH …/contract-clauses/4fed201f-12a6-4464-a466-e37aa5b56dfd` → **400** `HRM-VAL-001` · *property company_id should not exist*
- **FE after 2xx:** **FAIL** — destructive toast · body v1 unchanged
- **F5:** form reopen vẫn **Draft body v1** (không v2)
- **Verdict:** **🔴 FAIL**
- **spec_ref:** BA-01 §4 AC-01 · expected `HRM-CTR-CL-200`
- **Root cause (spec says / code does):** `ContractLegalPrintSettingsPanel` gọi `updateContractClause(id, { company_id, … })` · `hrmApi.ts` PATCH JSON includes `company_id` · Nest `UpdateContractClauseDto` whitelist reject → **VAL-001** (orthogonal to issued soft-block)

### AC-PLT-CTR-CL-06 — soft-retire (J-HRM-CTR-CL-05)

- **Click path:** row `CL_CR_CLQA-KM4JR3` → **Ngừng**
- **Network:** `POST …/contract-clauses/{id}/retire?company_id=main` → **201/200** `HRM-CTR-CL-200`
- **FE after 2xx:** status **retired** on row
- **F5:** retired persists
- **Verdict:** **🟢 PASS**
- **spec_ref:** BA-01 §4 AC-06

### AC-PLT-CTR-CL-02 — issued edit soft-block (J-HRM-CTR-CL-02)

- **Precondition target:** clause active + ≥1 issued print snapshot
- **Attempt:** create `CL_IS_CLQA-KM4JR3` · activate · template DnD · contract `HD-CLQA-KM4JR3` · issue PV
- **Actual:** template create/activate **201** OK · contract submit attempted · **no print-version id** captured · probe issued PV list on pilot contracts → **0 issued rows** in quick scan
- **Edit active clause body:** PATCH → **400** `HRM-VAL-001` (same FE bug — **not** `HRM-CTR-CL-CODE-CONFLICT`)
- **Activate path after block:** UI **Hiệu lực** hidden when already active → **NOTE_BLOCKED** (residual `R-CTR-CL-ACTIVATE-UI` P2)
- **Verdict:** **🟡 NOTE_BLOCKED** (cannot assert VAL-CTR-CL-01 conflict until PATCH fixed + issued PV exists)
- **spec_ref:** BA-01 §4 AC-02 · BR-CTR-CL-01

### AC-PLT-CTR-CL-03 — issue freeze snapshot (J-HRM-CTR-CL-03)

- **Precondition:** issued print version with `clauses_snapshot_json`
- **Actual:** **no vid** · snapshot compare skipped
- **Verdict:** **🟡 NOTE_BLOCKED**
- **spec_ref:** BA-01 §4 AC-03 · `must_keep` clauses_snapshot_json immutable

### AC-PLT-CTR-CL-05 — preview/PDF body resolve · no FE hardcode

- **Static:** grep — no hardcoded multi-sentence legal `body_vi` in FE consumer paths (constants = labels/packs only)
- **Runtime preview:** **not executed** — print spine issue chain incomplete in session (contract id not bound in JSON)
- **Verdict:** **🟡 PASS_WITH_OBS** (static OK · runtime preview OBS)
- **spec_ref:** BA-01 §4 AC-05 · BR-CTR-CL-03 · FE-SA-01

### AC-PLT-CTR-CL-H — honesty

- `contracts_printable_ready=false` **RETAIN** · no module CTR UAT claim · no seal reopen · U65 · **C-SLICE-≠-MODULE**
- **Verdict:** **🟢 PASS**

---

## 4. Network stamp table (mutations)

```text
POST /api/hrm/contracts-insurance/contract-clauses                           → 201 HRM-CTR-CL-201  (CL_CR_CLQA-KM4JR3)
POST /api/hrm/contracts-insurance/contract-clauses                           → 201 HRM-CTR-CL-201  (CL_DR_CLQA-KM4JR3)
PATCH /api/hrm/contracts-insurance/contract-clauses/4fed201f-…               → 400 HRM-VAL-001     (company_id in body)
POST /api/hrm/contracts-insurance/contract-clauses/7ee37880-…/retire         → 201 HRM-CTR-CL-200
POST /api/hrm/contracts-insurance/contract-clauses                           → 201 HRM-CTR-CL-201  (CL_IS_CLQA-KM4JR3)
POST /api/hrm/contracts-insurance/contract-clauses/f434c8c1-…/activate       → 201 HRM-CTR-CL-200
POST /api/hrm/contracts-insurance/contract-templates                         → 201 HRM-CTR-TPL-201
POST /api/hrm/contracts-insurance/contract-templates/a53eb148-…/activate     → 201 HRM-CTR-TPL-200
PATCH /api/hrm/contracts-insurance/contract-clauses/f434c8c1-…               → 400 HRM-VAL-001     (issued path blocked)
```

---

## 5. Defect register (this seat)

| ID | Sev | Owner | Summary |
|----|-----|-------|---------|
| **R-PLT-CTR-CL-FE-PATCH-COMPANY-ID** | **P0** | dev-fe | `updateContractClause` / panel PATCH includes `company_id` in JSON body → `HRM-VAL-001` blocks AC-01 and masks AC-02 conflict |
| **R-CTR-CL-ACTIVATE-UI** | P2 | dev-fe/product | After soft-block, version bump `POST …/activate` not exposed when clause already `active` |
| **R-CTR-CL-ISSUE-SPINE-U65** | P1 | qa/dev-fe | U65 contract→preview→save print-version chain did not yield `printVersionId` this run (retest after PATCH fix) |

**Peer residual RETAIN:** `R-PLT-CTR-CL-FE-01` (FE-SA P2 HOLD) · CTR-TEMPLATE KEY seal · ATT/EMP CLOSED packs · `contracts_printable_ready=false`

---

## 6. Screenshots

- `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-01/00-clauses-panel.png`

---

## 7. Completion contract

**completion_report:** L0 PASS (5173). Jest 26/26 PASS. U65 browser on `ContractLegalPrintSettingsPanel`: **AC-04 CREATE 🟢** · **AC-06 retire 🟢** · **AC-H 🟢** · **AC-01 FAIL 🔴** (PATCH `HRM-VAL-001` company_id in body — FE wiring) · **AC-02/03 NOTE_BLOCKED** (no issued PV + same PATCH bug) · **AC-05 PASS_WITH_OBS** (static no hardcode; preview not run). Honesty false · C-SLICE · no seed · no module CTR UAT. **FAIL_TO_PM**.

**next_owner:** dev-fe (P0 PATCH) then qa retest

**ack_status:** **FAIL_TO_PM**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-01.md`

**next_dispatch_prompt:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-FIX-PATCH-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-01 FAIL_TO_PM
read_first: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-qa-01.md · ContractLegalPrintSettingsPanel.tsx · hrmApi updateContractClause
spec_ref: BA-01 AC-PLT-CTR-CL-01/02 · peer R-CTR-PREVIEW-COMPANY-ID-BODY pattern
task: PATCH updateContractClause must NOT send company_id in JSON body (scope via query/header only). Panel onSaveClause update path — omit company_id from mutate DTO. Regression: Settings clause Sửa body_vi → PATCH 200 HRM-CTR-CL-200 + F5.
allowed_paths: apps/web/hrm/src/integrations/hrmApi.ts · apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx
must_keep: createClause company_id query pattern · activate/retire URLs · honesty printable=false
exit: READY_FOR_QA PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02
cấm: seed · flip printable · module UAT claim
```

---

## 8. Retest checklist (QA-02 after FE fix)

1. AC-01: draft `CL_DR_*` edit body → **200** `HRM-CTR-CL-200` + F5 body v2
2. AC-02: issue PV with clause in snapshot → edit body → **409** `HRM-CTR-CL-CODE-CONFLICT` → activate bump if UI exposed
3. AC-03: GET issued PV snapshot unchanged after edit attempt
4. AC-05: preview body contains clause marker (no FE hardcode)
5. Re-run jest + L0 + honesty H unchanged

---

## 9. Appendix — BA AC trace (read-only)

| AC ID | BA-01 expectation | QA result |
|-------|-------------------|-----------|
| AC-PLT-CTR-CL-01 | PATCH 200 + F5 | FAIL VAL-001 |
| AC-PLT-CTR-CL-02 | CODE-CONFLICT soft-block | NOTE_BLOCKED |
| AC-PLT-CTR-CL-03 | snapshot immutable | NOTE_BLOCKED |
| AC-PLT-CTR-CL-04 | POST 201 + F5 | PASS |
| AC-PLT-CTR-CL-05 | resolve not hardcode | OBS static OK |
| AC-PLT-CTR-CL-06 | retire 2xx + F5 | PASS |
| AC-PLT-CTR-CL-H | honesty false | PASS |

End of evidence document. Byte verification required ≥8192 UTF-8 no BOM.
