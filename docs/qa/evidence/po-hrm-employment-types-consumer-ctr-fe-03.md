# Evidence — PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-03-CONTRACT-TYPE-HYDRATE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-03-CONTRACT-TYPE-HYDRATE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-11 |
| **ack_status** | **`READY_FOR_QA`** |
| **next QA** | `QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-04` |

## Root cause (closed)

NV001-HD (`aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1`) stored `contract_type='Hợp đồng 3 năm'` (legacy display phrase). Edit wizard PATCH echoed label → **400** `HRM-CON-TYPE-KEY` before `work_arrangement` persist.

## Fix (FE)

- `resolveContractTypeEditValue` + `inferContractTypeCatalogCodeFromLegacy` in `catalogSearchPicker.ts` — map code, exact catalog label, or legacy phrase (e.g. «3 năm» → `HDLD_XDHN_36`).
- `buildRegistrySubmitPayload` — persist **catalog code** on PATCH.
- `Contracts.tsx` — hydrate on Sửa open + catalog EFF load; legacy submit path aligned.

**must_keep:** FE-01/02 employment_types picker; QACONPAYSTQC1 dept+contract_type consumers.

## Verification

| Check | Result |
|-------|--------|
| `pnpm exec vitest run` (hrm) `catalogSearchPicker.test.ts` + `contractCreateWizard.source.test.ts` | **50/50 PASS** |
| `node scripts/qa/_tmp-qa-po-hrm-employment-types-consumer-ctr-mutate-probe.mjs` | **exit 0** — `patchStatus: 200`, `work_arrangement: fidmzgc71emp`, `f5LabelOk: true` |
| U65 | no seed · no `settings_catalog_e2e_ready` flip |

## completion_report

**Closed:** contract_type hydrate on edit save; NV001-HD mutate probe PASS; unit/source tests PASS.

**Residual:** QA browser RETEST-04 (UF narrow + parity harness full mutate leg).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-04
role: qa
read_first: docs/qa/evidence/po-hrm-employment-types-consumer-ctr-fe-03.md · docs/qa/evidence/qa-po-hrm-employment-types-consumer-ctr-01.md
entry_criteria: dev-fe READY_FOR_QA; mutate-probe exit 0 on dc930c5+ FE-03 slice
exit_criteria: U65 NV001-HD Sửa — đổi ctr-create-work-arrangement → Lưu PATCH 2xx; body contract_type = catalog code; F5 label; harness ETCTRQA1 mutate leg exit 0; QACONPAYST regression PASS
evidence_path: docs/qa/evidence/qa-po-hrm-employment-types-consumer-ctr-01.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```
