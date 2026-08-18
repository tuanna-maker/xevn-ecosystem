# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-BE-02 (library publish alias)

| Meta | Value |
|------|-------|
| **work_item_id (PM dispatch)** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-02` |
| **SoT work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-03` |
| **from_role** | dev-be |
| **to_role** | qa / pm → fe |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | ADD · re-verify (no wipe) |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` PASS_TO_PM |
| **honesty** | `contracts_printable_ready=false` — **DENIED** invent printable UAT · **no flip** |
| **must_keep** | print-spine GWC · UF-HRM-02 · F-CORE-CTR-01..PDF · DATA-01 · BR-CTR-CL-01 |
| **ID note** | DATA-02 `next_dispatch` labeled **BE-02** for PUB/PULL/APPLY, but **BE-02** already sealed **PDF binary** (`po-hrm-contract-legal-print-be-02.md`). This file = publish slice evidence for the PM alias; implementation SoT = **BE-03**. |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| ADR | `ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md` **Option A** LOCKED |
| DATA-02 | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md` CONFIRMED |
| SA-02 §4 F.1 | PUB-01/02 · PULL-01 · APPLY-01 |
| DATA-01 | must_keep print spine / VAL-CTR-* |
| DATA-02 evidence | `po-hrm-contract-legal-print-data-02.md` |
| Prior BE-03 | `po-hrm-contract-legal-print-be-03.md` |

---

## 2. Exit criteria map

| # | Criterion | Status |
|---|-----------|--------|
| 1 | ensureSchema ADD `hrm_contract_library_publishes` (UQ tenant+version, checksum, payload_json, soft-delete) | **DONE** |
| 2 | EXPAND lineage on templates · clauses · pack_rules | **DONE** |
| 3 | ADD `hrm_contract_library_pull_audits`; write on PULL-01 | **DONE** |
| 4 | F-CORE-CTR-PUB-01/02 · PULL-01 · APPLY-01 under `/contract-library/*` | **DONE** |
| 5 | Errors EMPTY · CODE-CONFLICT · NOTHING-TO-APPLY · override skip · scope 403/409 | **DONE** |
| 6 | Overlay CL/TPL: origin · origin_publish_version · origin_company_id · lineage_code | **DONE** |
| 7 | Jest scope_parity · foreign pull FAIL · apply ≠ print_versions · VAL-PUB-01..04 | **DONE** |
| 8 | CODE-MEMORY APPEND · this evidence | **DONE** |
| 9 | honesty false · no seed | **DONE** |

**Forbidden preserved:** no `synced_catalogs` dual-write · no live holding join at PREV · no wipe GWC / PDF BE-02 evidence · no UAT seed · `contracts_printable_ready` remains **false**.

---

## 3. API surface

| Cap | METHOD / path |
|-----|---------------|
| PUB-01 | `POST /api/hrm/contracts-insurance/contract-library/publishes` |
| PUB-02 | `GET …/contract-library/publishes` · `GET …/publishes/:publishVersion` |
| PULL-01 | `POST …/contract-library/pull` |
| APPLY-01 | `POST …/contract-library/apply` |

---

## 4. Jest re-verify (this seat)

```text
pnpm --filter hrm-api exec jest --testPathPatterns="contract-library-publish|contracts-insurance.controller.spec|contract-legal-print.service.spec" --no-coverage
→ Test Suites: 3 passed · Tests: 38 passed · U65 no seed
```

| Case | Result |
|------|--------|
| VAL-PUB-01 EMPTY | PASS |
| VAL-PUB-02 CODE-CONFLICT | PASS |
| VAL-PUB-03 NOTHING-TO-APPLY | PASS |
| VAL-PUB-04 override skip | PASS |
| VAL-PUB-05 FORBIDDEN | PASS |
| VAL-PUB-07 foreign member pull | PASS (`HRM-SCOPE-409`) |
| VAL-PUB-09 apply never mutates print_versions | PASS |
| scope_parity list↔get publishes | PASS |
| Print-spine / PDF renderer `%PDF` (must_keep) | PASS (same suite) |

---

## 5. Residual

| ID | Owner |
|----|--------|
| FE Settings Publish / Pull / Apply + origin badge | **dev-fe** |
| QA API + U65 browser after FE | **qa** |
| Q-CTR-02 PDF | CLOSED prior BE-02 PDF (must_keep) |
| Printable module UAT | **DENIED** · honesty false |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed (re-verify): PUB/PULL/APPLY + schema + lineage + pull_audits already in BE-03 SoT; PM alias BE-02 mapped without overwriting PDF be-02.md; jest **38 PASS**; print-spine GWC green; honesty **false**. Residual: FE Settings then QA. |
| **next_owner** | **dev-fe** (Settings) — or **qa** L1 API-only if FE deferred |
| **ack_status** | **READY_FOR_QA** (API ready; FE Settings still required for full U65 browser UF) |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-be-02-pub.md` (+ SoT `…-be-03.md`) |
| **next_dispatch_prompt** | see below |

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
from_role: pm
to_role: dev-fe
lane: execution
change_mode: ADD
parent: PO-HRM-CONTRACT-LEGAL-PRINT-BE-02 (pub alias) / BE-03 READY_FOR_QA
honesty: contracts_printable_ready=false
must_keep: print-spine GWC · UF-HRM-02 · PDF BE-02 · PUB/PULL/APPLY API · origin overlay fields
forbidden: invent printable UAT · seed · wipe GWC · synced_catalogs for legal bodies · flip contracts_printable_ready

entry_criteria: BE library publish API READY_FOR_QA (evidence be-02-pub.md / be-03.md)
exit_criteria: Settings holding Publish + member Pull/Apply + origin badge; company_id query only; READY_FOR_QA
read_first:
  - docs/qa/evidence/po-hrm-contract-legal-print-be-02-pub.md
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md §7
  - ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md §5
evidence: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
```
