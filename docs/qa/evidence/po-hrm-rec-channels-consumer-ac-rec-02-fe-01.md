# PO-HRM-REC-CHANNELS-CONSUMER-AC-REC-02-FILTER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-CHANNELS-CONSUMER-AC-REC-02-FILTER-01` |
| **role** | dev-fe |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-11 |
| **change_mode** | ADD |
| **parent** | `PO-HRM-REC-CHANNELS-CONSUMER-FE-01` (channel consumer wiring unchanged) |

## spec_ref

- `docs/program/specs/BA-HRM-REC-CHANNELS-CONSUMER-01.md` · **AC-REC-02**
- QA retest #4: `docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md` — harness could not target source filter `SelectTrigger`

## spec_read_ack

- **srs:** `docs/program/specs/BA-HRM-REC-CHANNELS-CONSUMER-01.md` · AC-REC-02 filter by catalog source
- **tech_spec:** FE consumer slice `po-hrm-rec-channels-consumer-fe-01.md`
- **change:** Stable HDSD hooks only — no business logic change

## What changed

| Surface | `data-testid` |
|---------|----------------|
| Source filter trigger | `hdsd-candidate-filter-source` (`HDSD_MUTATE_TEST_IDS.candidateFilterSource`) |
| Option «Tất cả nguồn» | `hdsd-candidate-filter-source-option-all` |
| Option per source code | `hdsd-candidate-filter-source-option-{code}` (e.g. `CSO_01`) |

**Files:** `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` · `apps/web/hrm/src/lib/hdsdMutateTestIds.ts`

## must_keep

- `resolveCandidateSourceDisplayLabel` / `candidateSourceFilterValues` / catalog consumer from FE-01
- Existing `hdsd-candidate-form-source` (create dialog) and list YCTD/position testids

## Verification

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/hdsdMutateTestIds.test.ts src/lib/po-hrm-rec-channels-consumer-fe-01.test.ts --reporter=dot
```

| Check | Result |
|-------|--------|
| Vitest `hdsdMutateTestIds.test.ts` | **6/6 PASS** |
| Vitest `po-hrm-rec-channels-consumer-fe-01.test.ts` | **3/3 PASS** |

## QA handoff (AC-REC-02 only)

1. Login `ceo@xe.vn` · HRM → Tuyển dụng → **Ứng viên**
2. After AC-REC-01 row exists (or use existing stamp row)
3. `getByTestId('hdsd-candidate-filter-source')` → open
4. `getByTestId('hdsd-candidate-filter-source-option-CSO_01')` (or label match) → click
5. Assert filtered list shows target candidate · F5 optional

**Harness hint:** Replace combobox `hasText: /Nguồn/` locator with testids above (`scripts/qa/_tmp-qa-po-hrm-rec-channels-consumer-01.mjs` ~L774).

## completion_report

**Closed:** AC-REC-02 Playwright hooks on list source filter trigger + options; constants in `hdsdMutateTestIds`; vitest locks.  
**Open:** Browser AC-REC-02 PASS (QA rerun only).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-REC-CHANNELS-CONSUMER-01
role: qa
entry_criteria: PO-HRM-REC-CHANNELS-CONSUMER-AC-REC-02-FILTER-01 READY_FOR_QA — AC-REC-01/03 already PASS retest #4; AC-REC-02 was harness P2 only
read_first: docs/qa/evidence/po-hrm-rec-channels-consumer-ac-rec-02-fe-01.md · docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md retest #4
exit_criteria: U65 browser-only — rerun AC-REC-02 using getByTestId('hdsd-candidate-filter-source') and getByTestId('hdsd-candidate-filter-source-option-{catalogCode}'); assert filtered row visible; append evidence with stamp; do not re-run full matrix unless regression needed
evidence_path: docs/qa/evidence/qa-po-hrm-rec-channels-consumer-01.md (append AC-REC-02 retest section)
ack_status: PASS_TO_PM or FAIL_TO_PM
```
