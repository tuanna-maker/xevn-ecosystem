# Evidence — HRM-CTR-CREATE-REDESIGN-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `HRM-CTR-CREATE-REDESIGN-QA-02` |
| **stamp** | **`CTRCREATEQA02-MSN049ZL`** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** · C-SLICE · `contracts_printable_ready=false` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **entry** | `docs/qa/evidence/hrm-ctr-create-redesign-fe-02.md` |
| **runner** | `scripts/qa/_tmp-hrm-ctr-create-redesign-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-hrm-ctr-create-redesign-qa-02.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 `qc:dev-stack` | hrm + xbos + portal **200** (node UV exit quirk Windows) |
| L0 `qc:fe-be-health` | **exit 0** |
| Vitest `contractCreateWizard.source.test.ts` | **12 PASS** |

## UF / Journeys

| ID | Verdict | Detail |
|----|---------|--------|
| **UF-HRM-02** | PASS | list + Thêm HĐ on CC embed |
| **UF-HRM-02** | PASS | {"verdict":"PASS","listReady":true,"tableOrEmpty":true,"url":"http://127.0.0.1:5173/command-center/hrm/contracts?_=1786352437711"} |
| **J-HRM-CTR-CREATE-08** | PASS | {"verdict":"PASS","honestyOnList":false} |
| **J-HRM-CTR-CREATE-07** | BLOCKED | {"verdict":"BLOCKED","template_api_count":0,"probe":{"status":0,"count":0,"path":null}} |
| **J-HRM-CTR-CREATE-01** | FAIL | {"verdict":"FAIL","fatal":"TimeoutError: locator.waitFor: Timeout 90000ms exceeded.\nCall log:\n  - waiting for getByTestId('hdsd-contracts-form-read"} |
| **J-HRM-CTR-CREATE-02** | FAIL | {"verdict":"FAIL","fatal":"TimeoutError: locator.waitFor: Timeout 90000ms exceeded.\nCall log:\n  - waiting for getByTestId('hdsd-contracts-form-read"} |
| **J-HRM-CTR-CREATE-05** | FAIL | {"verdict":"FAIL","fatal":"TimeoutError: locator.waitFor: Timeout 90000ms exceeded.\nCall log:\n  - waiting for getByTestId('hdsd-contracts-form-read"} |
| **J-HRM-CTR-CREATE-06** | FAIL | {"verdict":"FAIL","fatal":"TimeoutError: locator.waitFor: Timeout 90000ms exceeded.\nCall log:\n  - waiting for getByTestId('hdsd-contracts-form-read"} |

## DnD / scope

| Check | Result |
|-------|--------|
| pangea / drag-handle storms | **none** |
| `company_id` scope mismatches | **none** |
| dialog mount | `parent-portal` |

## Network samples

```json
{
  "scope_mismatch": [],
  "samples": [
    {
      "method": "GET",
      "company_id": "main",
      "path": "/command-center/hrm/contracts"
    },
    {
      "method": "GET",
      "company_id": null,
      "path": "/api/hrm/"
    },
    {
      "method": "GET",
      "company_id": null,
      "path": "/api/hrm/"
    },
    {
      "method": "GET",
      "company_id": "main",
      "path": "/hr/contracts"
    },
    {
      "method": "GET",
      "company_id": "main",
      "path": "/hr/contracts"
    },
    {
      "method": "GET",
      "company_id": null,
      "path": "/api/hrm/operating-units"
    },
    {
      "method": "GET",
      "company_id": "main",
      "path": "/api/hrm/company-subscription"
    },
    {
      "method": "GET",
      "company_id": null,
      "path": "/hr/src/components/contracts/ContractCreateWizardDialog.tsx"
    },
    {
      "method": "GET",
      "company_id": null,
      "path": "/hr/src/components/contracts/contractFormFieldResolver.ts"
    },
    {
      "method": "GET",
      "company_id": null,
      "path": "/hr/src/components/contracts/ContractCreateStep1GeneralGrid.tsx"
    },
    {
      "method": "GET",
      "company_id": null,
      "path": "/hr/src/components/contracts/ContractCreateStep2ClausePreview.tsx"
    },
    {
      "method": "GET",
      "company_id": null,
      "path": "/hr/src/components/contracts/ContractCbReadOnlyCard.tsx"
    }
  ],
  "candidate_post": null,
  "template_list": {
    "status": 200,
    "count": 0
  },
  "template_probe": {
    "status": 0,
    "count": 0,
    "path": null
  }
}
```

## Defects

- **DEF-QA02-FATAL** (P0): TimeoutError: locator.waitFor: Timeout 90000ms exceeded.
Call log:
  - waiting for getByTestId('hdsd-contracts-form-ready')


## Screens

—

## Console (max 6)

—

> **contracts_printable_ready=false** · **C-SLICE** · DnD evidence on CC URL only

**ack_status:** **FAIL_TO_PM**
