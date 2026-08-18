# Evidence — HRM-CTR-CREATE-REDESIGN-QA-03

| Field | Value |
|-------|--------|
| **work_item_id** | `HRM-CTR-CREATE-REDESIGN-QA-03` |
| **stamp** | **`CTRCREATEQA03-MSN0ZBR5`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · `contracts_printable_ready=false` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **entry** | `docs/qa/evidence/hrm-ctr-create-redesign-fe-03.md · prior QA CTRCREATEQA02-MSN049ZL` |
| **runner** | `scripts/qa/_tmp-hrm-ctr-create-redesign-qa-02.mjs` (QA_WAVE=03) |
| **raw JSON** | `docs/qa/evidence/_tmp-hrm-ctr-create-redesign-qa-03.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 `qc:dev-stack` | hrm + xbos + portal **200** (node UV exit quirk Windows) |
| L0 `qc:fe-be-health` | **exit 0** |
| Vitest contract wizard | **19 PASS** (resolver + source) |

## FE-03 form-ready (template count 0)

| Check | Result |
|-------|--------|
| `hdsd-contracts-form-ready` | **50ms** (≤90s: yes) |
| `ctr-create-no-active-template-banner` | visible |
| `ctr-create-template-settings-cta` | visible |
| **J-HRM-CTR-CREATE-FE03** | **PASS** |



## UF / Journeys

| ID | Verdict | Detail |
|----|---------|--------|
| **UF-HRM-02** | PASS | list + Thêm HĐ on CC embed |
| **UF-HRM-02** | PASS | {"verdict":"PASS","listReady":true,"tableOrEmpty":true,"url":"http://127.0.0.1:5173/command-center/hrm/contracts?_=1786353886302"} |
| **J-HRM-CTR-CREATE-08** | PASS | {"verdict":"PASS","honestyOnList":false} |
| **J-HRM-CTR-CREATE-07** | BLOCKED | {"verdict":"BLOCKED","template_api_count":0,"probe":{"status":0,"count":0,"path":null}} |
| **J-HRM-CTR-CREATE-FE03** | PASS | {"verdict":"PASS","formReadyMs":50,"formReadyWithin90s":true,"template_count":0,"bannerVisible":true,"ctaVisible":true,"emptyTemplateUiOk":true} |
| **J-HRM-CTR-CREATE-03** | BLOCKED | {"verdict":"BLOCKED","reason":"template_list count=0 U65"} |
| **J-HRM-CTR-CREATE-01** | BLOCKED | {"verdict":"BLOCKED","reason":"no active template — step2/DnD U65"} |
| **J-HRM-CTR-CREATE-02** | BLOCKED | {"verdict":"BLOCKED","reason":"no active template — step2/DnD U65"} |
| **J-HRM-CTR-CREATE-06** | BLOCKED | {"verdict":"BLOCKED","reason":"no active template — step2/DnD U65"} |
| **J-HRM-CTR-CREATE-04** | PASS_WITH_HOLD | {"verdict":"PASS_WITH_HOLD","note":"DRIVER/GPLX slice not exercised U65 — no mutate without full driver persona"} |
| **J-HRM-CTR-CREATE-05** | FAIL | {"verdict":"FAIL","f5_row":false,"code":"QCT03RN0ZBR5"} |

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
      "path": "/hr/src/components/contracts/HrmDragDropContext.tsx"
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

- **DEF-CTR-REGISTRY-U65** (P1): J-05 registry-only F5 missing — POST/validation U65 without employee pick (out of FE-03 form-ready scope)

## Screens

- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/hrm-ctr-create-redesign-qa-03/step1-form-ready.png`

## Console (max 6)

- Failed to load resource: the server responded with a status of 400 (Bad Request)

> **contracts_printable_ready=false** · **C-SLICE** · DnD evidence on CC URL only


## Residual (QA-03)

- **J-HRM-CTR-CREATE-05** registry-only F5: P1 if FAIL — cần chọn NV/loại HĐ trên FE (U65) hoặc BA AC; **không** block FE-03 form-ready.
- **J-HRM-CTR-CREATE-07** BLOCKED `template_api_count=0` — honest U65.
- **J-01..03,06** BLOCKED until sponsor tạo mẫu active từ FE Settings.


**ack_status:** **PASS_TO_PM**
