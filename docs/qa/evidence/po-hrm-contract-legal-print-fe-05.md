# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-FE-05

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-05` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | ADD · Settings Publish/Pull/Apply + origin badge |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-03` READY_FOR_QA |
| **honesty** | `contracts_printable_ready=false` — **DENIED** invent printable UAT |
| **must_keep** | print-spine GWC · UF-HRM-02 · FE-01 clause DnD · FE-02 PDF preview query · BE-02 PDF · BE-03 API · FE-03 work_location paths |
| **forbidden** | invent printable UAT · seed · wipe GWC · synced_catalogs · collide FE-03 |

> **Note:** Evidence id is **fe-05** (not fe-03). FE-03 = work_location / field_overrides spine — **untouched** this wave.

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| BE-03 | `docs/qa/evidence/po-hrm-contract-legal-print-be-03.md` — F-CORE-CTR-PUB/PULL/APPLY |
| ADR | `ADR-HRM-CONTRACT-LIBRARY-GROUP-PUBLISH-20260807.md` **Option A** |
| DATA-02 | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md` §7 F.1 · overlay origin* |
| FE-01 | `ContractLegalPrintSettingsPanel` clause/template DnD — preserved |

---

## 2. Implementation summary

| Cap | FE surface | Behavior |
|-----|------------|----------|
| F-CORE-CTR-PUB-01 | Settings holding/main — **Phát hành** | `POST …/contract-library/publishes?company_id=` · body `{ label_vi? }` only |
| F-CORE-CTR-PUB-02 | Publish versions table | `GET …/publishes` metadata list |
| F-CORE-CTR-PULL-01 | Settings member — **Kéo gói** | `POST …/pull` · surfaces `skipped_override` toast · CODE-CONFLICT via apiError |
| F-CORE-CTR-APPLY-01 | Settings member — **Áp dụng gói tập đoàn** | `POST …/apply` · NOTHING-TO-APPLY friendly |
| Overlay | TPL/CL list **Nguồn** badge | `origin` · `origin_publish_version` display-ready |

**Partition CTA:** `main`/`holding` → Publish; member OU slug → Pull/Apply.

**company_id:** query only on publish/pull/apply (builders) — **no** body `company_id`.

---

## 3. Paths touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/contractLibraryPublishRequest.ts` | **ADD** builders + origin badge helpers |
| `apps/web/hrm/src/lib/contractLibraryPublishRequest.test.ts` | **ADD** vitest 7 |
| `apps/web/hrm/src/integrations/hrmApi.ts` | clients + origin* types · CODE-MEMORY APPEND |
| `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx` | Publish/Pull/Apply UI + badges · CODE-MEMORY APPEND |
| `apps/web/hrm/src/lib/apiError.ts` | HRM-CTR-PUB-* friendly VI |

**Not touched (must_keep):** `Contracts.tsx` · `ContractPrintSpinePanel` · `contractPrintFieldOverrides*` · FE-01 DnD canvas.

---

## 4. HDSD testids

| testid | Role |
|--------|------|
| `ctr-library-publish-panel` | Distribution card |
| `ctr-library-publish-holding` | Holding author zone |
| `ctr-library-publish-label` | Release note input |
| `ctr-library-publish-btn` | Publish CTA |
| `ctr-library-pull-member` | Member consume zone |
| `ctr-library-pull-version` | Version select |
| `ctr-library-pull-force` | Force override checkbox |
| `ctr-library-pull-btn` | Pull CTA |
| `ctr-library-apply-btn` | Apply CTA |
| `ctr-library-pull-summary` | Last pull summary |
| `ctr-library-publishes-empty` | Empty publish list |
| `ctr-library-publish-row-{N}` | Publish version row |
| `ctr-clause-origin-{code}` | Clause origin badge |
| `ctr-tpl-origin-{code}` | Template origin badge |

---

## 5. Vitest evidence

```text
pnpm exec vitest run src/lib/contractLibraryPublishRequest.test.ts src/lib/contractPrintRequest.test.ts src/lib/contractClauseOrder.test.ts src/lib/contractPrintFieldOverrides.test.ts
→ Test Files: 4 passed · Tests: 18 passed
```

| Suite | Result |
|-------|--------|
| contractLibraryPublishRequest (FE-05) | 7 PASS |
| contractPrintRequest (FE-02 regression) | 3 PASS |
| contractClauseOrder (FE-01 regression) | 5 PASS |
| contractPrintFieldOverrides (FE-03 regression) | 3 PASS |

---

## 6. Residual / QA next

| ID | Owner | Note |
|----|-------|------|
| U65 browser: holding publish → member pull → apply | **qa** | Login FE Settings; zero-seed |
| CODE-CONFLICT / skipped_override / NOTHING-TO-APPLY UX | **qa** | Assert toast + testids |
| Print-spine GWC · UF-HRM-02 | **qa** | must_keep smoke — not printable UAT |
| Printable module UAT | **DENIED** | honesty false |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: Settings Publish (holding/main) + Pull/Apply (member) + origin badges on TPL/CL; query-only company_id builders; HDSD testids; CODE-MEMORY APPEND; vitest 18 PASS incl. FE-01/02/03 regression; honesty false. Residual: QA U65 browser. |
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-fe-05.md` |
| **next_dispatch_prompt** | see below |

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QA-05
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-CONTRACT-LEGAL-PRINT-FE-05 READY_FOR_QA
honesty: contracts_printable_ready=false
u65: browser-only · zero-seed
must_keep: print-spine GWC · UF-HRM-02 · FE-01 DnD · FE-03 work_location
forbidden: seed · invent printable UAT · synced_catalogs

entry_criteria: L0 stack up; FE-05 wired; BE-03 APIs live
exit_criteria:
1) Holding (ceo@xe.vn / main|holding): Settings → Phát hành → POST publishes 2xx → row vN in list (ctr-library-publish-btn)
2) Member OU: Kéo gói → pull 2xx; surface skipped_override if any; Áp dụng → apply 2xx; origin badge Tập đoàn · vN on TPL/CL
3) Assert company_id only on query (Network); body no company_id
4) Negative: NOTHING-TO-APPLY / CODE-CONFLICT toast if reproducible without seed invent
5) must_keep smoke: UF-HRM-02 + print-spine GWC not wiped

evidence: docs/qa/evidence/po-hrm-contract-legal-print-qa-05.md
ack_status: PASS_TO_PM | FAIL_TO_PM
```
