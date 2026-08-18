# Evidence — QA-PO-HRM-CTR-CREATE-REDESIGN-02

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-CTR-CREATE-REDESIGN-02` |
| **stamp** | **`CTRCREATEQA2-MSMO2M1N`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · `contracts_printable_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-create-redesign-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-create-redesign-qa-02.json` |
| **commit** | `dc930c5` |
| **prior** | fe-dnd-01 · fe-02 · qa-01 FAIL (DND storm) |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **exit 0** |
| L1 vitest (hrm) | **18 PASS** — jdDnd · contractCreateWizard · payload · core09 |
| L1 jest (hrm-api) | **3 PASS** — `po-hrm-ctr-create-redesign-be-01.spec.ts` |

## In-scope journeys (exit)

| Journey | Verdict | Detail (truncated) |
|---------|---------|-------------------|
| **J-HRM-CTR-CREATE-01** | PASS | {"verdict":"PASS","contract_create_context_get":200} |
| **J-HRM-CTR-CREATE-02** | PASS | {"verdict":"PASS","dnd_storm":false,"dnd_storm_samples":[],"canvas_clause_count":3,"put_overlay":{"status":200,"clause_ids":["e1ff5b84-eef4-4c41-816c-e2657384c693","4aa6d808-efbf-4d3c-80cd-a143e222cbda","55674fcc-34f8-4b |
| **J-HRM-CTR-CREATE-05** | PASS | {"verdict":"PASS","post":{"status":201},"f5_row":true,"code":"QCT2RMO2M1N"} |
| **J-HRM-CTR-CREATE-06** | PASS | {"verdict":"PASS","edit_opened":true,"step1_code_match":true,"step2_canvas_clauses":true,"code":"QCTR2SMO2M1N"} |

## DnD / overlay

| Check | Result |
|-------|--------|
| sameNodeDragBind / drag-handle storm (P0) | **none** |
| pangea nested-scroll advisory (P2) | 4 console line(s) |
| PUT print-overlay | `{"status":200,"clause_ids":["e1ff5b84-eef4-4c41-816c-e2657384c693","4aa6d808-efbf-4d3c-80cd-a143e222cbda","55674fcc-34f8-4bcb-89ae-4f113f927181"]}` |
| POST preview `clause_ids` | `{"status":201,"has_clause_ids":true,"clause_count":3}` |

## Browser summary

```json
{
  "contract_create_context_get": 200,
  "dnd_storm_count": 0,
  "network": {
    "put_overlay": {
      "status": 200,
      "clause_ids": [
        "e1ff5b84-eef4-4c41-816c-e2657384c693",
        "4aa6d808-efbf-4d3c-80cd-a143e222cbda",
        "55674fcc-34f8-4bcb-89ae-4f113f927181"
      ]
    },
    "preview_post": {
      "status": 201,
      "has_clause_ids": true,
      "clause_count": 3
    }
  },
  "codes": {
    "main": "QCTR2SMO2M1N",
    "registry": "QCT2RMO2M1N"
  }
}
```

**Screens:** `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-02/step1.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-02/step2-after-dnd.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-02/step2-preview.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-02/registry-f5-row.png` · `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-02/edit-step2.png`

## Console errors (max 6)

- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and
- Warning: Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and

## Honesty

> **contracts_printable_ready=false** · **C-SLICE** · **cấm** claim printable / module CTR UAT

## Residual (P2 — not blocking this slice)

| ID | Owner | Note |
|----|-------|------|
| FE-CTR-DND-NESTED-SCROLL-01 | dev-fe | `@hello-pangea/dnd` nested scroll advisory on palette `max-h-64 overflow-y-auto` inside dialog (4 console lines); DnD still works |
| FE-CTR-STEP2-DUP-KEY-01 | dev-fe | React duplicate key warnings in `ContractCreateStep2ClausePreview` list render |

**ack_status:** **PASS_TO_PM**
