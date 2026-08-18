# Evidence — PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01` |
| **role** | `qa` |
| **runner_stamp** | **`CTRG4HIRE-MSO71G8B`** |
| **ack_status** | **BLOCKED** |
| **overall** | **BLOCKED** · `contracts_printable_ready=false` |
| **URL** | `http://127.0.0.1:8080/command-center/hrm/recruitment` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `UI-HRM-CTR-HIRE-CTA.md` · `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-rec-01.md` § WS-G4-13 |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-qa-01.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** |
| L0 FE↔BE | `pnpm run qc:fe-be-health` — **exit 0** |

## U65 prereq (no seed)

```json
{
  "candidates": {
    "status": 200,
    "count": 5,
    "with_employee_id": 0,
    "hired_outcome_key": null,
    "sample": [
      {
        "id": "9120c6c1-1bf3-42d9-8c1f-7150f7cfc624",
        "full_name": "UV Kênh QA RECCHQA-MSNK95YR",
        "status": "offer",
        "employee_id": null,
        "requisition_id": "cc266a29-9d08-4caa-8086-6f8ce940cc7e"
      },
      {
        "id": "9ed4a5f2-a4dd-4589-95dc-663a61da7c07",
        "full_name": "UV RECCHQA-DEBUG7BZY",
        "status": "new",
        "employee_id": null,
        "requisition_id": "cc266a29-9d08-4caa-8086-6f8ce940cc7e"
      },
      {
        "id": "36d51e97-4702-46b6-afeb-d44732f47860",
        "full_name": "UV Kênh QA RECCHQA-MSNK53HP",
        "status": "new",
        "employee_id": null,
        "requisition_id": "cc266a29-9d08-4caa-8086-6f8ce940cc7e"
      }
    ]
  },
  "requisitions_receivable": {
    "status": 200,
    "count": 2,
    "with_employee_id": 0,
    "hired_outcome_key": null,
    "sample": [
      {
        "id": "cc266a29-9d08-4caa-8086-6f8ce940cc7e",
        "status": "open_for_hire",
        "employee_id": null,
        "requisition_id": "cc266a29-9d08-4caa-8086-6f8ce940cc7e"
      },
      {
        "id": "87a237e7-8779-41a4-93fc-a539128cfce8",
        "status": "approved",
        "employee_id": null,
        "requisition_id": "87a237e7-8779-41a4-93fc-a539128cfce8"
      }
    ]
  },
  "pipeline_eff": {
    "status": 200,
    "count": 15,
    "with_employee_id": 0,
    "hired_outcome_key": null,
    "sample": [
      {
        "id": "9627b951-bb6a-4869-ad24-ec638d61d304",
        "status": "active",
        "employee_id": null,
        "requisition_id": null
      },
      {
        "id": "5fcd5ea3-5d91-4177-9f05-49e32c340e22",
        "status": "active",
        "employee_id": null,
        "requisition_id": null
      },
      {
        "id": "65121bc4-cfff-4c32-aa8d-564ed65fc6fb",
        "status": "active",
        "employee_id": null,
        "requisition_id": null
      }
    ]
  },
  "accept_target": {
    "id": "9120c6c1-1bf3-42d9-8c1f-7150f7cfc624",
    "name": "UV Kênh QA RECCHQA-MSNK95YR",
    "status": "offer",
    "employee_id": null
  }
}
```

## Steps attempted

- Open REC candidate detail 9120c6c1-1bf3-42d9-8c1f-7150f7cfc624

## Matrix WS-G4-13..14

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-13** | BLOCKED | {"verdict":"BLOCKED","reason":"Chấp nhận offer CTA missing — offer-ready gate or FE projection","candidate":"9120c6c1-1bf3-42d9-8c1f-7150f7cfc624","status":"offer"} |
| **WS-G4-14** | BLOCKED | {"verdict":"BLOCKED","reason":"depends accept-offer"} |

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-HIRE-01** | BLOCKED | {"verdict":"BLOCKED","step":"accept-offer CTA missing"} |
| **J-HRM-REC-07-03** | BLOCKED | {"verdict":"BLOCKED"} |

## UF blocks (browser)

### UF-WS-G4-13 — REC hire chain → «Tạo HĐ» workspace prefill

- **Persona:** `ceo@xe.vn` → Tuyển dụng → UV YCTD
- **Chain:** Chấp nhận offer (UI mutate) → «Tạo HĐ» CTA → workspace Step1
- **Verdict:** `BLOCKED`

### UF-WS-G4-14 — Hire-readiness after accept

- **Verdict:** `BLOCKED`

## Network (accept-offer + contracts)

—

## Screenshots

- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-rec-hire-fe-chain-01/01-rec-detail-entry.png`

## Defects

- **DEF-REC-ACCEPT-OFFER-CTA-MISS** (P0) · dev-fe: rec-accept-offer-open-detail not visible after offer transition

## Promoted / not promoted

**Promoted:** —

**Not promoted:** J-HRM-CTR-HIRE-01, J-HRM-REC-07-03

## completion_report

**Closed:** U65 FE chain attempted: Tuyển dụng → accept-offer mutate → «Tạo HĐ» → workspace prefill; WS-G4-13/14 + J-HRM-CTR-HIRE-01 + J-HRM-REC-07-03 verdicts recorded.

**Residual:** `contracts_printable_ready=false`; full HĐ POST+F5 not in slice; WS-G4-14 PASS_WITH_HOLD = API hire-readiness only.

## next_owner

`pm`

## next_dispatch_prompt

See ack_status `BLOCKED` — QC narrow if PASS; dev-fe/dev-be if BLOCKED/FAIL on accept-offer or CTA.

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-01.md`
