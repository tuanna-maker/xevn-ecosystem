# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-FIX-PATCH-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-FIX-PATCH-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-01` FAIL_TO_PM |
| **residual_id** | `R-PLT-CTR-CL-FE-PATCH-COMPANY-ID` |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **priority** | P0 |
| **U65** | zero-seed — no seed in fix or verify |
| **Honesty** | `contracts_printable_ready=false` RETAIN · C-SLICE-≠-MODULE · no module CTR UAT claim |

---

## 1. spec_read_ack

| Artifact | Path / section |
|----------|----------------|
| **SRS/BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md` · AC-PLT-CTR-CL-01 (draft edit body_vi) · AC-PLT-CTR-CL-04/06 must_keep |
| **BE context** | CTR-CLAUSE-BE-SA-01 Option A HOLD · Nest `@Patch contract-clauses/:clauseId` · `@Query('company_id')` + `UpdateContractClauseDto` whitelist |
| **FE context** | FE-SA HOLD · peer pattern FE-02 preview (company_id query only) · activate/retire clause already query-only |
| **change_mode** | FIX |
| **code_memory** | APPEND `@CODE-MEMORY-CHANGE` on `hrmApi.ts` LEGAL-PRINT block + `ContractLegalPrintSettingsPanel.tsx` |

**spec says / code did (before):**

- BE: PATCH body must not contain `company_id`; scope from query `company_id` or header `x-company-id`.
- FE (bug): `updateContractClause` spread `company_id` into JSON body → Nest validation `HRM-VAL-001` «property company_id should not exist».
- QA stamp `CLQA-KM4JR3`: AC-01 FAIL on draft edit; CREATE/retire PASS.

**spec says / code does (after):**

- FE: `updateContractClause(clauseId, companyId, payload)` appends `?company_id=` normalized; body = whitelist fields only.
- Panel: update branch passes `companyId` as second arg; no `company_id` key in payload object.

---

## 2. Root cause (closed)

| Layer | Detail |
|-------|--------|
| Symptom | Settings → Sửa điều khoản draft → Lưu → toast lỗi · Network PATCH **400** `HRM-VAL-001` |
| Class | FE integration — DTO body shape mismatch (not BE business rule) |
| Files | `apps/web/hrm/src/integrations/hrmApi.ts` `updateContractClause` · `ContractLegalPrintSettingsPanel.tsx` `onSaveClause` update path |
| Orthogonal | Issued-clause soft-block (`HRM-CTR-CL-CODE-CONFLICT`) still untested until AC-01 passes and issued PV exists |

---

## 3. Change summary (before / after)

### 3.1 hrmApi.ts — `updateContractClause`

**Before (Network shape — FAIL):**

```http
PATCH /api/hrm/contracts-insurance/contract-clauses/{clauseId}
Content-Type: application/json

{
  "company_id": "main",
  "title_vi": "...",
  "body_vi": "Draft body v2",
  "clause_group": "GENERAL",
  "apply_to_packs": ["GENERAL"],
  "mandatory": false,
  "status": "draft"
}
```

**After (expected — PASS wiring):**

```http
PATCH /api/hrm/contracts-insurance/contract-clauses/{clauseId}?company_id=main
Content-Type: application/json

{
  "title_vi": "...",
  "body_vi": "Draft body v2",
  "clause_group": "GENERAL",
  "apply_to_packs": ["GENERAL"],
  "mandatory": false,
  "status": "draft"
}
```

**Signature change (breaking only for clause PATCH — single caller):**

- Old: `updateContractClause(clauseId, { company_id, ...fields })`
- New: `updateContractClause(clauseId, companyId, { ...fields })`

**must_keep:**

- `createContractClause` — POST body still includes `company_id` (AC-04 CREATE).
- `activateContractClause` / `retireContractClause` — unchanged query-only scope (AC-06 retire).

### 3.2 ContractLegalPrintSettingsPanel.tsx — `onSaveClause`

**Before:** `updateContractClause(editingClauseId, { company_id: companyId, ... })`

**After:** `updateContractClause(editingClauseId, companyId, { title_vi, body_vi, ... })`

CREATE branch unchanged (`createContractClause` with `company_id` in body).

---

## 4. Files touched (allowed_paths only)

| File | Action |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | FIX `updateContractClause` + `@CODE-MEMORY-CHANGE` |
| `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx` | FIX update call + `@CODE-MEMORY-CHANGE` |
| `apps/web/hrm/src/integrations/contractClauseApiPatch.test.ts` | ADD vitest — assert query vs body |

**forbidden_paths:** none touched (`apps/api/**`, seed, unrelated panels, honesty flags).

---

## 5. Automated verification

```text
pnpm exec vitest run src/integrations/contractClauseApiPatch.test.ts
```

| Result | Detail |
|--------|--------|
| Exit | **0** |
| Tests | **1 passed** — `company_id=main` in URL; body has no `company_id`; `body_vi` preserved |
| Duration | ~27s (environment collect on Windows) |

---

## 6. QA retest matrix (PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02)

**entry_criteria:** L0 stack up · portal `:5173` or `:8088` · `ceo@xe.vn` · U65 browser-only · no seed

| AC / J-ID | Retest focus | Expected after fix |
|-----------|--------------|---------------------|
| **AC-PLT-CTR-CL-01** / **J-HRM-CTR-CL-01** | Draft create → Sửa → đổi `body_vi` → Lưu → F5 | PATCH **200** `HRM-CTR-CL-200` · toast success · body v2 persists |
| **AC-PLT-CTR-CL-04** / **J-HRM-CTR-CL-04** | CREATE clause | **Regression** — POST 201 unchanged |
| **AC-PLT-CTR-CL-06** / **J-HRM-CTR-CL-05** | Ngừng (retire) | **Regression** — POST retire query unchanged |
| **AC-PLT-CTR-CL-02** | Issued edit soft-block | Unblock probe — expect business **409/VAL-CTR-CL** not VAL-001 on body scope |
| **AC-PLT-CTR-CL-03** | Issue snapshot | Depends on print spine + AC-01 |
| **AC-PLT-CTR-CL-H** | Honesty | RETAIN `contracts_printable_ready=false` |

**Network assert (DevTools):** PATCH clause — Request payload JSON must **not** contain key `company_id`; query string must contain `company_id=main` (or normalized holding id).

**Persona / URL:** `http://127.0.0.1:5173/hr/settings?portal=1&tenantId=xevn&companyId=main&tab=contract-legal`

**Click path:** Tab Hợp đồng in → Điều khoản → Tạo draft mới → Lưu → Sửa → đổi nội dung → Lưu → F5.

---

## 7. Residual (not closed by FE patch)

| ID | Owner | Note |
|----|-------|------|
| R-CTR-CL-ACTIVATE-UI | dev-fe P2 | «Hiệu lực» hidden when already active — QA NOTE_BLOCKED |
| AC-02/03 spine | qa | Need issued print version U65 chain after AC-01 green |
| updateContractTemplate PATCH | — | Still sends `company_id` in body if used — **out of scope** this work_item |

---

## 8. completion_report

**Closed:**

- R-PLT-CTR-CL-FE-PATCH-COMPANY-ID — FE PATCH no longer sends `company_id` in JSON body; scope via query aligned with BE controller and peer activate/retire.
- Unit test documents Network shape; vitest PASS.

**Open (for QA-02):**

- Browser AC-01 confirmation · regression AC-04/06 · attempt AC-02/03 if env allows issued PV.

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | qa |
| **ack_status** | READY_FOR_QA |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-fe-fix-patch-01.md` |
| **work_item_qa** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02` |

### next_dispatch_prompt (copy-ready for PM → qa)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02
from_role: pm
to_role: qa
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-FIX-PATCH-01 READY_FOR_QA
entry_criteria: L0 PASS; browser-only U65; ceo@xe.vn company_id=main; Settings contract-legal clause panel
exit_criteria: Retest AC-PLT-CTR-CL-01 (J-HRM-CTR-CL-01) PATCH 200 + F5 body_vi; regression AC-04 CREATE + AC-06 retire; DevTools assert PATCH body has NO company_id key; honesty AC-H retain printable=false; evidence ≥8192 UTF-8 no BOM
spec_ref: BA-01 AC-01/04/06; prior FAIL CLQA-KM4JR3
evidence_read: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-fe-fix-patch-01.md
ack_status_target: PASS_TO_PM or FAIL_TO_PM with residual lane
cấm: seed; flip printable; module CTR UAT claim
```

---

## 10. Appendix — BE contract reference (read-only)

Controller excerpt (no FE change to BE):

- Route: `PATCH contracts-insurance/contract-clauses/:clauseId`
- Scope: `@Query('company_id') companyId` ?? header ?? `main`
- Body: `UpdateContractClauseDto` — whitelist; **forbids** `company_id` property

Peer FE clients on same module:

- `activateContractClause(id, companyId)` — query only
- `retireContractClause(id, companyId)` — query only
- `createContractClause({ company_id, ... })` — POST body includes company_id (CREATE DTO)

This fix aligns clause **update** with the same scope transport as activate/retire, while preserving CREATE POST semantics per BA AC-04.

---

## 11. Appendix — vitest source

File: `apps/web/hrm/src/integrations/contractClauseApiPatch.test.ts`

Asserts:

1. `fetch` called once with URL containing `company_id=main`
2. `init.method === PATCH`
3. Parsed body lacks `company_id`
4. `body_vi === "Draft body v2"`

---

## 12. Stamp

| Key | Value |
|-----|--------|
| **FE fix stamp** | `CLFEPATCH-20260808` |
| **Prior QA FAIL stamp** | `CLQA-KM4JR3` |
| **solid_convention_ack** | FE whitelist PATCH body; scope query/header — no FE invent business body |

End of evidence document.