# Evidence — PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-BE-HRM-CTR-WORK-ARRANGEMENT-EMP-EFF-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-11 |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01` · AC-SET-CONSUMER-ET-CTR-01 |
| **must_keep** | QACONPAYSTQC1 · `settings_catalog_e2e_ready=false` |

## Root cause

`assertWorkArrangementCode` / `resolveWorkFormLabelVi` chỉ đọc settings `work_arrangements`, trong khi FE (AC-SET-CONSUMER-ET-CTR-01) POST/PATCH `work_arrangement` = `employmentTypeKey` từ GET `/employees/employment-types/effective` (EMP ∪ group REF).

## Fix (BE)

| Change | Path |
|--------|------|
| EMP effective assert trước (F-EMP-CAT-EFF-02), fallback `work_arrangements` legacy | `contracts-insurance.service.ts` |
| PATCH `updateContract` validate + persist normalized EMP key | same |
| Label list/detail qua `listEffective` (nameVi) | `resolveWorkFormLabelVi` |
| Jest regression | `po-hrm-employment-types-consumer-ctr-be-01.spec.ts` |

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter hrm-api test -- po-hrm-employment-types-consumer-ctr-be-01` | **4/4 PASS** |
| `pnpm --filter hrm-api test -- contracts-insurance.service.spec` | **PASS** (regression) |

## QA entry (U65)

- Persona: `ceo@xe.vn` / `companyId=main`
- Retest: `QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-03`
- Mutate: NV001-HD → Sửa → `ctr-create-work-arrangement` (*emp code) → Lưu → **PATCH 2xx** → F5 → label hiển thị
- Probe: `scripts/qa/_tmp-qa-po-hrm-employment-types-consumer-ctr-mutate-probe.mjs`
- **cấm:** seed

## completion_report

**Closed:** BE accepts EMP effective `employmentTypeKey` for contract `work_arrangement` create/update; legacy `work_arrangements` fallback; display label from EMP effective; unit tests added.

**Open:** Browser mutate + F5 label — QA narrow leg.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-03
role: qa
read_first: docs/qa/evidence/po-hrm-employment-types-consumer-ctr-be-01.md · po-hrm-employment-types-consumer-ctr-fe-02.md
entry_criteria: L0 exit 0; hrm-api rebuilt/restarted with BE-01; FE-02 local
exit_criteria: U65 — vitest FE 15/15; mutate probe exit 0 (PATCH 2xx, work_arrangement=*emp, f5LabelOk); NV001-HD Sửa shows catalog label after F5; cấm seed; UF-HRM-10 full claim
evidence_path: docs/qa/evidence/qa-po-hrm-employment-types-consumer-ctr-01.md
```
