# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01` |
| **change_mode** | **ADD / EXPAND** |
| **ref_data** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md` |
| **ref_sa** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01.md` |
| **ack_status** | **READY_FOR_QA** |

### Honesty locks (LOCKED false — DENIED invent)

| Flag | Value |
|------|-------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| Module EMP UAT / Phase1 | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |
| `contracts_printable_ready` | **false** |
| EMP-QC-01 / EMP-QC-02 | **SEAL RETAIN** — not reopened |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs / SA** | MERGE-TOKEN-EMP-SA-01 §5 matrix · §7 F-EMP-TOK-01..05 · Option B |
| **data** | MERGE-TOKEN-EMP-DATA-01 §1.2 origin EXPAND · §2 register · §4 resolve §5.2 · VAL-EMP-TOK-01..12 |
| **peer** | Allowance register-on-save `allowance_catalog` |
| **platform** | `apps/api/hrm-api/src/merge-tokens/*` F-PLT-TOK-01..03 |
| **sponsor_confirm** | DATA-01 CONFIRMED unlock BE |

---

## Delivered

| # | Item | Stamp |
|---|------|-------|
| 1 | `MERGE_TOKEN_ORIGINS` + `chk_hrm_merge_tok_origin` **ADD `emp_catalog`** (retain `allowance_catalog`) | `merge-token.constants.ts` · `merge-tokens.service.ts` · allowance peer CHK sync |
| 2 | Helper register TX | `emp-merge-token-register.ts` — upsert/retire `origin=emp_catalog` |
| 3 | **F-EMP-TOK-01** DOC create/upsert/retire → `emp.doc.<key>` **same TX** | `emp-document-type.service.ts` |
| 4 | **F-EMP-TOK-02** ET create/upsert/retire → `emp.et.<key>` (hyphen→underscore) **same TX** | `emp-employment-type.service.ts` |
| 5 | **F-EMP-TOK-03** `custom.emp.*` | **HOLD** residual **R-EMP-TOK-EXT** — DOC/ET GĐ1 mandatory closed |
| 6 | **F-EMP-TOK-05** resolve bag labels from effective DOC/ET + `employee.employment_type_label` alias | `enrichEmpCatalogLabelsIntoBag` · `MergeTokensService.resolvePreview` |
| 7 | Jest VAL-EMP-TOK + scope_parity U19 | `emp-merge-token-register.spec.ts` + DOC/ET specs updated for `withTransaction` |
| 8 | No hard-delete · no UF seed · no second EMP token table · no new `emp_*` catalog tables | verified in tests |

---

## Verification

```text
pnpm exec jest --testPathPatterns="emp-merge-token-register|emp-document-type.service.spec|emp-employment-type.service.spec|merge-tokens.scope-parity|merge-token.resolver.spec" --no-coverage
→ Test Suites: 5 passed · Tests: 42 passed
```

| VAL | Result |
|-----|--------|
| VAL-EMP-TOK-01 origin CHK | PASS |
| VAL-EMP-TOK-02 DOC → emp.doc | PASS |
| VAL-EMP-TOK-03 ET hyphen → emp.et.full_time | PASS |
| VAL-EMP-TOK-04 retire soft token | PASS |
| VAL-EMP-TOK-05/F-EMP-TOK-05 bag labels | PASS |
| VAL-EMP-TOK-06 registry wins §5.2 | PASS |
| VAL-EMP-TOK-07 empty → keyword_map | PASS |
| VAL-EMP-TOK-08 token fail → TX rollback path | PASS |
| VAL-EMP-TOK-09 scope_parity U19 | PASS |
| VAL-EMP-TOK-11 no hard-delete | PASS |
| VAL-EMP-TOK-12 no UF seed | PASS (no seed) |

---

## Residuals

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| **R-EMP-TOK-EXT** | P2 | dev-be / fe | Extension-field Settings producer → `custom.emp.<code>` not wired GĐ1 |
| **R-EMP-TOK-DOCS** | P3 | ba-docs | Client DOC-DELTA footer |
| **C-SLICE-≠-MODULE** | — | pm | Keep ready flags false |

---

## must_keep check

| Item | Status |
|------|--------|
| EMP-QC-01/02 seals | not reopened |
| EMP DOC/ET schema | unchanged (triggers only) |
| Position XBOS REF | untouched |
| contracts/SI · ATT/REC/DEC · LIST-TOTALS/CTR | untouched |
| keyword_map fallback | VAL-EMP-TOK-07 PASS |
| single `hrm_merge_tokens` | PASS |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Closed GĐ1 EMP MergeToken hook: origin `emp_catalog` EXPAND; DOC/ET same-TX register `emp.doc.*` / `emp.et.*`; F-EMP-TOK-05 bag labels from effective catalogs; jest 42 PASS; residual R-EMP-TOK-EXT (extension); honesty false; seals retained. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-be-01.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01
entry_criteria: L0 stack; BE evidence READY_FOR_QA; U65 zero-seed browser-only
ref_evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-be-01.md
ref_data: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-DATA-01.md
AC: AC-PLT-EMP-TOK-01 DOC Lưu → F5 GET merge-tokens?domain=EMP has emp.doc.<key> origin=emp_catalog
AC: AC-PLT-EMP-TOK-02 ET create/normalize → emp.et.<key>; retire → token retired
AC: AC-PLT-EMP-TOK-03 resolve-preview name_vi from effective catalog (no invent CCCD/FULL_TIME)
AC: AC-PLT-EMP-TOK-05 must_keep seals/XBOS/contracts/keyword_map fallback
Honesty: hrm_personnel_uat_ready=false · employees_e2e=false · DENY module EMP UAT / Phase1 · C-SLICE-≠-MODULE
cấm: seed · reopen EMP-QC · invent ready=true · printable=true
exit: PASS_TO_PM or FAIL_TO_PM + evidence docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-qa-01.md
```
