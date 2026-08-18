# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-BE-03

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-03` |
| **from_role** | dev-be |
| **to_role** | qa / pm → fe |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | ADD · library publish only |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02` PASS_TO_PM |
| **honesty** | `contracts_printable_ready=false` — **DENIED** invent printable UAT |
| **must_keep** | print-spine GWC · UF-HRM-02 · F-CORE-CTR-01..PDF (BE-02 PDFKit) · DATA-01 · BR-CTR-CL-01 |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| ADR | `ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md` **Option A** |
| DATA-02 | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md` CONFIRMED §3–§7 |
| SA-02 | `PO-HRM-CONTRACT-LEGAL-PRINT-SA-02.md` §4 F.1 PUB/PULL/APPLY |
| DATA-01 | must_keep print spine / VAL-CTR-* |
| DATA-02 evidence | `po-hrm-contract-legal-print-data-02.md` |

---

## 2. Implementation summary

| Cap | Path | Behavior |
|-----|------|----------|
| F-CORE-CTR-PUB-01 | `POST …/contract-library/publishes` | Freeze holding active TPL/CL/(rules) → immutable version + sha256 checksum |
| F-CORE-CTR-PUB-02 | `GET …/publishes` · `GET …/publishes/:publishVersion` | List metadata (no payload); get may include payload |
| F-CORE-CTR-PULL-01 | `POST …/contract-library/pull` | Upsert member drafts + lineage; write `hrm_contract_library_pull_audits`; **≠** activate |
| F-CORE-CTR-APPLY-01 | `POST …/contract-library/apply` | Activate `origin=group` for version N; **never** touch `hrm_contract_print_versions` |
| Overlay | CL/TPL/pack-rules list/get | `origin` · `origin_publish_version` · `origin_company_id` · `lineage_code` |

**Schema (ensureSchema + migration):**
- ADD `hrm_contract_library_publishes` (UQ tenant_id+publish_version)
- ADD `hrm_contract_library_pull_audits`
- EXPAND lineage on templates · clauses · pack_rules

**Forbidden preserved:** no `synced_catalogs` dual-write · no live holding join at PREV · no wipe GWC / PDF regression · no UAT seed.

---

## 3. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="contract-library-publish|contracts-insurance.controller.spec|contract-legal-print.service.spec" --no-coverage
→ Test Suites: 3 passed · Tests: 34 passed
```

| Case | Result |
|------|--------|
| VAL-PUB-01 EMPTY | PASS |
| VAL-PUB-02 CODE-CONFLICT | PASS |
| VAL-PUB-03 NOTHING-TO-APPLY | PASS |
| VAL-PUB-04 override skip | PASS |
| VAL-PUB-05 FORBIDDEN member publish | PASS |
| VAL-PUB-07 foreign member pull | PASS (`HRM-SCOPE-409`) |
| VAL-PUB-09 apply ≠ print_versions mutate | PASS |
| scope_parity publishes list↔get | PASS |
| BE-02 PDF renderer still `%PDF` | PASS (existing suite) |

---

## 4. Paths touched

| Path | Change |
|------|--------|
| `contract-library-publish.service.ts` | **ADD** PUB/PULL/APPLY |
| `contract-library-publish.service.spec.ts` | **ADD** VAL-PUB + scope |
| `contract-legal-print.service.ts` | ensureSchema + lineage overlay + override stamp |
| `contract-legal-print.constants.ts` | HRM-CTR-PUB-* |
| `dto/contract-legal-print.dto.ts` | Publish/Pull/Apply DTOs |
| `contracts-insurance.controller.ts` | routes `/contract-library/*` |
| `contracts-insurance.controller.spec.ts` | provider mock |
| `app.module.ts` | provider |
| `migrations/20260807_contract_library_publish.sql` | ADD physical |

---

## 5. Residual

| ID | Status | Owner |
|----|--------|-------|
| FE Settings Publish/Pull/Apply + origin badge | OPEN | **dev-fe** |
| QA API + browser U65 after FE | OPEN | **qa** |
| Q-CTR-02 PDF | CLOSED by BE-02 (must_keep) | — |
| Printable module UAT | **DENIED** · honesty false | — |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: ADD publishes + pull_audits + lineage EXPAND; F-CORE-CTR-PUB/PULL/APPLY under `/contract-library/*`; overlay origin fields; VAL-PUB-01..04 + scope_parity jest 34 PASS with print-spine/PDF suite; CODE-MEMORY APPEND; honesty false. Residual: FE Settings UI then QA. |
| **next_owner** | **dev-fe** (Settings) **or** **qa** (API smoke if FE deferred) |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-be-03.md` · alias re-verify `…-be-02-pub.md` |
| **next_dispatch_prompt** | see below |
| **re-verify 2026-08-07** | PM re-dispatched as BE-02 (DATA-02 alias) → jest **38 PASS**; PDF `be-02.md` untouched |

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
from_role: pm
to_role: dev-fe
lane: execution
change_mode: ADD
parent: PO-HRM-CONTRACT-LEGAL-PRINT-BE-03 READY_FOR_QA
honesty: contracts_printable_ready=false
must_keep: print-spine GWC · UF-HRM-02 · BE-02 PDF · BE-03 API contracts
forbidden: invent printable UAT · seed · wipe GWC · call synced_catalogs for legal bodies

task:
1) Settings (holding): Publish button → POST /contract-library/publishes; list versions
2) Settings (member): Pull → Apply CTA; show skipped_override / conflicts
3) Origin badge on TPL/CL list (origin · origin_publish_version)
4) company_id query only on mutate; U65 browser path after wire

exit: READY_FOR_QA
evidence: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
```
