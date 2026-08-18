# Evidence — QA-PO-HRM-CTR-PICKER-INLINE-PORTAL-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-CTR-PICKER-INLINE-PORTAL-01` |
| **stamp** | **`CTRPICKQA1-MSMSYWMR`** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** · C-SLICE · `contracts_printable_ready=false` |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-picker-inline-portal-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-picker-inline-portal-qa-01.json` |
| **FE handoff** | `docs/qa/evidence/po-hrm-ctr-picker-inline-portal-fe-01.md` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** (UV exit quirk) |

## Scope exit

| AC / J | Verdict | Detail |
|--------|---------|--------|
| **AC-CTR-SUBJECT-02** | MISSING | {} |
| **AC-CTR-DND-01** | MISSING | {} |
| **AC-CTR-DND-02** | MISSING | {} |
| **J-HRM-CTR-CREATE-02** | MISSING | {} |

## Network (candidate draft)

```json
{
  "candidate_post": null
}
```

## Embed / DnD

| Check | Value |
|-------|--------|
| dialog mount | `parent-portal` |
| DnD storms | **none** |

## Defects

- **DEF-CTR-PICKER-QA-FATAL** (P0): TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for getByTestId('ctr-create-template-combobox')

- **DEF-CTR-PICKER-INLINE-PORTAL-P1** (P1): UV inline picker SUBJECT-02 blocked/fail

## Screens

—

## Console (max 5)

—

**ack_status:** **FAIL_TO_PM**
