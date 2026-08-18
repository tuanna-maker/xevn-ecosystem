# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-FE-03

> **ID note:** Same evidence path serves two ADD waves (no wipe):
> - **Wave B (active — 2026-08-07):** Settings Publish / Pull / Apply + origin overlay (PM W7.5 · parent BE-02-pub / BE-03).
> - **Wave A (preserved — 2026-08-06):** `work_location` registry + spine `field_overrides` (must_keep).
>
> Code baseline for Wave B also recorded as `po-hrm-contract-legal-print-fe-05.md` — this file is the **PM SoT** for W7.5 FE-03 exit.

---

## Wave B — Library publish Settings (2026-08-07) — ACTIVE

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-03` |
| **lane** | execution · dev-fe |
| **date** | 2026-08-07 |
| **change_mode** | ADD |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-02` (pub alias) / `…-BE-03` READY_FOR_QA |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` (W7.5) |
| **u65** | zero-seed · no seed used |
| **honesty** | `contracts_printable_ready=false` · **DENIED** invent printable UAT · **no flip** |
| **ack_status** | **READY_FOR_QA** |
| **must_keep** | print-spine GWC · UF-HRM-02 · PDF BE-02 · PUB/PULL/APPLY API · Wave A work_location · FE-01 DnD |
| **forbidden** | invent printable UAT · seed · wipe GWC · synced_catalogs · flip `contracts_printable_ready` · claim module printable DONE |

### spec_read_ack (Wave B)

| Artifact | Cite |
|----------|------|
| BE-02-pub | `docs/qa/evidence/po-hrm-contract-legal-print-be-02-pub.md` |
| BE-03 SoT | `docs/qa/evidence/po-hrm-contract-legal-print-be-03.md` |
| DATA-02 | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md` §7 F.1 · §7.2 overlay |
| SA-02 §4 F.1 | PUB-01/02 · PULL-01 · APPLY-01 |
| FE-05 baseline | `docs/qa/evidence/po-hrm-contract-legal-print-fe-05.md` (clients + CTA) |

### Exit criteria map

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Settings holding: Publish → `POST …/contract-library/publishes`; list versions | **DONE** |
| 2 | Settings member: Pull → Apply; show `skipped_override` / `conflicts` | **DONE** |
| 3 | Origin badge TPL/CL: `origin` · `origin_publish_version` · `origin_company_id` · `lineage_code` | **DONE** |
| 4 | `company_id` query only; display-ready from API — no FE invent | **DONE** |
| 5 | `solid_convention_ack` + CODE-MEMORY APPEND | **DONE** |
| 6 | U65 browser path ready (testids) | **DONE** |
| 7 | `contracts_printable_ready` remains **false** | **DONE** (`CONTRACTS_PRINTABLE_READY=false`) |

### Implementation (Wave B delta on FE-05)

| Cap | FE surface | Behavior |
|-----|------------|----------|
| F-CORE-CTR-PUB-01 | Holding/main — **Phát hành** | `POST …/publishes?company_id=` · body `{ label_vi? }` |
| F-CORE-CTR-PUB-02 | Versions table | `GET …/publishes` metadata |
| F-CORE-CTR-PULL-01 | Member — **Kéo gói** | `POST …/pull` · toast + `ctr-library-pull-skipped` / `ctr-library-pull-conflicts` |
| F-CORE-CTR-APPLY-01 | Member — **Áp dụng gói tập đoàn** | `POST …/apply` · NOTHING-TO-APPLY friendly |
| Overlay | TPL/CL **Nguồn** | `contractLibraryOriginDetailText` — 4 fields + `data-origin*` attrs |

**Partition:** `main`/`holding` → Publish; member OU → Pull/Apply.

### Paths touched (Wave B)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/contractLibraryPublishRequest.ts` | Origin detail helper · CODE-MEMORY FE-03 |
| `apps/web/hrm/src/lib/contractLibraryPublishRequest.test.ts` | +1 origin-detail case · suite rename FE-03 |
| `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx` | 4-field badges · pull result lists · CODE-MEMORY APPEND |
| `apps/web/hrm/src/integrations/hrmApi.ts` | CODE-MEMORY APPEND FE-03 (clients already FE-05) |

**Not touched (must_keep):** `Contracts.tsx` work_location · `ContractPrintSpinePanel` · print PDF · FE-01 DnD canvas · `CONTRACTS_PRINTABLE_READY`.

### HDSD testids (U65)

| testid | Role |
|--------|------|
| `ctr-library-publish-panel` | Distribution card |
| `ctr-library-publish-holding` / `ctr-library-publish-btn` | Holding Publish |
| `ctr-library-pull-member` / `ctr-library-pull-btn` / `ctr-library-apply-btn` | Member Pull/Apply |
| `ctr-library-pull-summary` | Summary line |
| `ctr-library-pull-result-detail` | Detail box |
| `ctr-library-pull-skipped` | `skipped_override` list |
| `ctr-library-pull-conflicts` | `conflicts` list |
| `ctr-clause-origin-{code}` / `ctr-tpl-origin-{code}` | Origin badges (+ `data-origin` · `data-origin-company` · `data-origin-version` · `data-lineage-code`) |

### Vitest (Wave B)

```text
pnpm exec vitest run src/lib/contractLibraryPublishRequest.test.ts src/lib/contractPrintRequest.test.ts src/lib/contractClauseOrder.test.ts src/lib/contractPrintFieldOverrides.test.ts
→ Test Files: 4 passed · Tests: 21 passed
```

| Suite | Result |
|-------|--------|
| contractLibraryPublishRequest (FE-03) | 8 PASS |
| contractPrintRequest (FE-02 regression) | 5 PASS |
| contractClauseOrder (FE-01 regression) | 5 PASS |
| contractPrintFieldOverrides (Wave A regression) | 3 PASS |

### Residual (Wave B)

| ID | Owner |
|----|--------|
| U65 browser: holding Publish → member Pull → Apply · origin badges | **qa** |
| Print-spine GWC · UF-HRM-02 smoke | **qa** must_keep |
| Printable module UAT | **DENIED** · honesty false |

### Completion contract (Wave B — active)

| Field | Value |
|-------|--------|
| **completion_report** | Closed: Settings Publish (holding) + Pull/Apply (member) with `skipped_override`/`conflicts` UI; origin overlay 4 fields on TPL/CL; query-only `company_id`; CODE-MEMORY APPEND; vitest **21 PASS**; Wave A work_location preserved; honesty **false**. Residual: QA U65 browser. |
| **next_owner** | **qa** |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md` (Wave B) · baseline `…-fe-05.md` |
| **next_dispatch_prompt** | see below |

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QA-03
from_role: pm
to_role: qa
lane: execution
change_mode: ADD
parent: PO-HRM-CONTRACT-LEGAL-PRINT-FE-03 READY_FOR_QA
program: PO-HRM-CONTINUOUS-W7-20260807 (W7.5)
honesty: contracts_printable_ready=false — DENIED invent printable UAT · no flip
must_keep: print-spine GWC · UF-HRM-02 · PDF BE-02 · Wave A work_location · FE-01 DnD
forbidden: seed · wipe GWC · claim module printable DONE
u65: browser-only · zero-seed

entry_criteria:
- FE-03 Wave B evidence READY_FOR_QA
- BE-03 / be-02-pub API READY
- L0 stack; persona holding ceo@xe.vn (main) + member OU (e.g. du-lich / trsport)

exit_criteria:
1) Holding Settings → Phát hành → POST publishes 2xx → versions table row (F5 còn)
2) Member Settings → chọn ver → Kéo gói → POST pull 2xx · see summary; if skip/conflict → ctr-library-pull-skipped / conflicts visible
3) Member → Áp dụng → POST apply 2xx · TPL/CL origin badges show origin · version · origin_company_id · lineage_code when present
4) Network: company_id query only on pub/pull/apply (no body company_id)
5) Smoke must_keep: UF-HRM-02 + print-spine chrome; honesty stamp false on panel
6) Evidence APPEND qa-03; ack PASS_TO_PM | FAIL_TO_PM
```

---

## Wave A — work_location / field_overrides (2026-08-06) — PRESERVED must_keep

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-03` (Wave A) |
| **lane** | execution · dev-fe |
| **date** | 2026-08-06 |
| **change_mode** | ADD |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R2` FAIL · residual **R-CTR-PRINT-CAN-ISSUE** P1 |
| **u65** | zero-seed · no seed used |
| **honesty** | `contracts_printable_ready=false` · **DENIED** printable UAT claim |
| **ack_status** | **READY_FOR_QA** (Wave A scope) |

### spec_read_ack (Wave A)

| Artifact | Cite |
|----------|------|
| **qa residual** | `docs/qa/evidence/po-hrm-contract-legal-print-qa-01-r2.md` · `can_issue=false` · `missing_fields: work_location` |
| **srs** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` §A C2 · §D AC-CTR-PRINT-02/06 |
| **tech_spec** | validatePreview requires `work_location`; `ContractPreviewDto.field_overrides` |
| **api** | POST create/PATCH contracts `work_location`; POST preview/print-versions `field_overrides` · `?company_id=` only |
| **sponsor_confirm** | parent wave 2026-08-06 |

### Root cause (spec says / code did)

| | |
|--|--|
| **spec / BE** | `validatePreview` → `requireField('work_location')`; merge accepts `field_overrides` |
| **code did (pre FE-03)** | Registry `Contracts.tsx` had **no** `work_location` input; spine preview/save sent pack/template only |
| **symptom** | Preview **201** but `can_issue=false` → **Lưu phiên bản in** disabled → PDF not reached |

### Closed scope (BOTH paths)

#### A — Registry persist

| Item | Change |
|------|--------|
| UI | `Contracts.tsx` — always-visible **Nơi làm việc** (`data-testid=ctr-work-location`) |
| Form / hook | `FormData` + `Contract` / `ContractFormData` + `mapApiContract` |
| API | `createContract` / `updateContract` send `work_location` on POST/PATCH |
| must_keep | UF-HRM-02 CRUD preserved |

#### B — Spine field_overrides

| Item | Change |
|------|--------|
| Panel | `ContractPrintSpinePanel` — override inputs (`ctr-print-field-overrides` · `ctr-print-override-work_location`) |
| Preview / save | Pass `field_overrides` via FE-02 builder (still **no** `company_id` in body) |
| Extra blockers | DRIVER `license_class` / `vehicle_plate` surfaces when listed in `missing_fields` |
| Helper | `contractPrintFieldOverrides.ts` + vitest |
| Prefill | `initialWorkLocation` from registry form |

#### Types

- `HrmContractPreviewResult.missing_fields` accepts `{ field, message }[]` (BE shape from R2)

### Tests (Wave A original)

```text
pnpm exec vitest run src/lib/contractPrintFieldOverrides.test.ts src/lib/contractPrintRequest.test.ts src/lib/contractClauseOrder.test.ts
→ 3 files · 11 tests PASS
```

### CODE-MEMORY (Wave A)

- APPEND `Contracts.tsx` FE-03
- APPEND `useContracts.ts` FE-03
- APPEND `ContractPrintSpinePanel.tsx` FE-03
- APPEND `hrmApi.ts` LEGAL-PRINT FE-03
- NEW `contractPrintFieldOverrides.ts`

### Residual / honesty (Wave A)

| ID | Note |
|----|------|
| R-CTR-PRINT-CAN-ISSUE | **CLOSED on FE** — needs QA R3 browser prove can_issue→save→PDF |
| `contracts_printable_ready` | remains **false** — do not promote printable UAT |
| must_keep smoke | UF-HRM-02 + Settings CL/TPL on R3 |

### next_dispatch_prompt (Wave A — historical)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R3
from_role: pm
to_role: qa
lane: execution
u65: zero-seed
parent: PO-HRM-CONTRACT-LEGAL-PRINT-FE-03 READY_FOR_QA (Wave A)
evidence_in: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
honesty: contracts_printable_ready=false — DENIED printable module GO

entry_criteria:
- FE-03 Wave A: registry Nơi làm việc + spine field_overrides.work_location
- FE-02 still: preview body no company_id
- Live stack L0; persona ceo@xe.vn company_id=main

exit_criteria:
1) Edit HĐ → fill Nơi làm việc (registry and/or ctr-print-override-work_location) → Xem trước → POST preview 2xx · can_issue=true
2) Lưu phiên bản in → POST print-versions 2xx · F5 versions list >0
3) PDF stub GET print-versions/:id/pdf → 2xx
4) Smoke must_keep: UF-HRM-02 create/edit still OK; Settings CL/TPL chrome; no company_id in preview body
5) Honesty stamp still false; no seed; evidence APPEND R3

ack_status: PASS_TO_PM | FAIL_TO_PM
```

### completion_report (Wave A — historical)

- **Closed:** R-CTR-PRINT-CAN-ISSUE FE gap — (A) registry `work_location` POST/PATCH + (B) spine `field_overrides` UI; vitest 11 PASS; CODE-MEMORY APPEND; honesty false.
- **Open:** Browser QA-01 R3 for can_issue true → save print-version → F5 versions>0 → PDF stub 2xx.
