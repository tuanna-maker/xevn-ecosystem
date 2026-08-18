# Evidence — PO-HRM-CTR-WORKSPACE-QA-WS-G4-LAYOUT-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-QA-WS-G4-LAYOUT-01` |
| **runner_stamp** | **`CTRWSG4L-MSO293PE`** |
| **ack_status** | **PASS_TO_PM** |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `UI-CTR-WORKSPACE.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-qa-ws-g4-layout-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-qa-ws-g4-layout-01.json` |
| **commit** | `dc930c5` |
| **honesty** | `contracts_printable_ready=false` · C-SLICE ≠ module CTR UAT |

## Gates (this session)

| Gate | Result |
|------|--------|
| L0 stack | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** (UV exit quirk Windows) |
| L0 FE↔BE | `pnpm run qc:fe-be-health` — **exit 0** |

## API probe (no seed)

```json
{
  "list": [
    {
      "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
      "company_id": "holding",
      "employee_id": "22222222-2222-4222-8222-222222222222",
      "contract_code": null,
      "contract_type": "Hợp đồng 1 năm",
      "start_date": "2026-07-10T17:00:00.000Z",
      "end_date": "2026-08-29T17:00:00.000Z",
      "status": "active",
      "notes": null,
      "position": null,
      "position_key": null,
      "department": "CHRO",
      "department_key": null,
      "signer_name": null,
      "signer_position": null,
      "signer_position_key": null,
      "compensation_package_id": null,
      "pack_code": null,
      "template_id": null,
      "template_code": null,
      "signed_at": null,
      "contract_name": null,
      "work_arrangement": null,
      "salary_ratio_percent": null,
      "subject_type": null,
      "candidate_id": null,
      "requisition_id": null,
      "contract_abstract": null,
      "term_type": null,
      "work_location": null,
      "work_location_scope": null,
      "job_description_text": null,
      "probation_days": null,
      "probation_end": null,
      "license_class": null,
      "driver_license_number": null,
      "driver_license_issued_on": null,
      "driver_license_issued_place": null,
      "vehicle_plate": null,
      "route_or_region": null,
      "created_at": "2026-08-10T05:39:42.599Z",
      "updated_at": "2026-08-10T05:39:42.599Z",
      "employee_name": "Tran Thi B",
      "employee_code": "NV002",
      "candidate_name": null,
      "signing_date": null,
      "candidate_label": null,
      "work_form_label_vi": null
    },
    {
      "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
      "company_id": "holding",
      "employee_id": "11111111-1111-4111-8111-111111111111",
      "contract_code": null,
      "contract_type": "HDLD_XDHN_36",
      "start_date": "2026-04-11T17:00:00.000Z",
      "end_date": "2026-09-23T17:00:00.000Z",
      "status": "active",
      "notes": null,
      "position
```

## Matrix WS-G4-09..11

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-09** | PASS | {"verdict":"PASS","viewOk":true,"getOk":true,"getCountOnOpen":1,"gets":[{"status":200,"url":"http://127.0.0.1:5173/api/hrm/contracts-insurance/contracts/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2?company_id=main"}],"partyVisible":true,"contractId":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1" |
| **WS-G4-10** | PASS | {"verdict":"PASS","layoutVisible":true,"canvasVisible":true,"clauseItems":1,"api_clause_layout_len":1,"readOnlyLabel":true,"paletteVisible":false,"oneGetOnly":true,"clause_list_on_step2":[],"note":"clause_layout from GET; no palette in view readOnly"} |
| **WS-G4-11** | PASS | {"verdict":"PASS","can_issue_api":false,"issueDisabled":true,"pdfDisabled":true,"previewEnabled":true,"hintVisible":true,"hintText":"Chưa đủ điều kiện phát hành — kiểm tra mẫu in và thông tin hợp đồng.","preview_summary":{"pack_code":"DRIVER","template_code":"XEVN_FT_12M_DRIVER", |
| **WS-G4-09-F5** | PASS | {"verdict":"PASS","layoutAfterF5":true,"itemsAfterF5":1,"getCountTotal":2} |

## Network

```json
{
  "view_gets": [
    {
      "status": 200,
      "url": "http://127.0.0.1:5173/api/hrm/contracts-insurance/contracts/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2?company_id=main"
    },
    {
      "status": 200,
      "url": "http://127.0.0.1:5173/api/hrm/contracts-insurance/contracts/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2?company_id=main"
    }
  ],
  "clause_list_calls": [],
  "step2_clause_list_after": []
}
```

## Console / page errors (sample)

- Warning: validateDOMNesting(...): %s cannot appear as a descendant of <%s>.%s <div> p 
    at div
    at Badge (http://127.0.0.1:5173/hr/src/components/ui/badge.tsx:37:18)
    at p
    at div
    at div
    at div
    at ContractWorkspaceVi
- Warning: validateDOMNesting(...): %s cannot appear as a descendant of <%s>.%s <div> p 
    at div
    at Badge (http://127.0.0.1:5173/hr/src/components/ui/badge.tsx:37:18)
    at p
    at div
    at div
    at div
    at ContractWorkspaceVi



## Screenshots

- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-qa-ws-g4-layout-01/01-view-step1.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-qa-ws-g4-layout-01/02-view-step2-clause-layout.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-qa-ws-g4-layout-01/03-issue-gate.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-qa-ws-g4-layout-01/04-f5-step2.png`

## Defects

| — | — | none |

## completion_report

**Closed:** U65 browser WS-G4-09..11 on `command-center/hrm/contracts` — view workspace Step1 GET detail · Step2 `clause_layout` read-only canvas · `can_issue=false` In/PDF gate · F5.

**Residual:** `contracts_printable_ready=false` — no UF-HRM-10 / module PDF UAT claim.

## next_owner

`pm` → `qc` narrow GWC if PASS; else `dev-fe` for layout/issue-gate defects.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-QC-WS-G4-LAYOUT-01
role: qc
read_first: docs/qa/evidence/po-hrm-ctr-workspace-qa-ws-g4-layout-01.md
entry_criteria: QA WS-G4-LAYOUT ack_status PASS_TO_PM or FAIL_TO_PM
exit_criteria: GWC on layout bind slice — honesty contracts_printable_ready=false; cấm UF-HRM-10 full
evidence_path: docs/qa/evidence/qc-po-hrm-ctr-workspace-ws-g4-layout-01.md
```

**ack_status:** **PASS_TO_PM**
