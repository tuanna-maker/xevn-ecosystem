# Evidence — PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B` |
| **matrix_stamp** | **`CTRWSG4M1-MSNWKSPC`** |
| **runner_stamp** | **`CTRWSG4B-MSO3HTS8`** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** · C-SLICE · `contracts_printable_ready=false` |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-01.json` |
| **commit** | `dc930c5` |
| **upstream** | G3 `READY_FOR_QA` · matrix Phase A `qa-po-hrm-ctr-workspace-g4-matrix-01.md` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** (UV exit quirk Windows) |
| L0 FE↔BE | `pnpm run qc:fe-be-health` — **exit 0** |
| Vitest G3 | `contractWorkspace.source.test.ts` — 29 tests PASS (dev-fe handoff) |

## U65 prereq probe (no seed)

```json
{
  "employees": {
    "status": 200,
    "count": 3,
    "first": {
      "id": "33333333-3333-4333-8333-333333333333",
      "company_id": "trsport",
      "company_uuid": "10000000-0000-4000-8000-000000000002",
      "company_display_name": "Công ty Cổ phần Thương mại và Dịch vụ X.E",
      "employee_code": "NV101",
      "email": "ops.manager@xe.vn",
      "full_name": "Le Van C",
      "display_name": "Le Van C",
      "job_title_key": "OPS_MANAGER",
      "job_title_label": null,
      "department": null,
      "phone_number": null,
      "manager_id": null,
      "status": "active",
      "status_label": "Đang làm việc",
      "statusLabelVi": "Đang làm việc",
      "hired_at": "2026-02-10T17:00:00.000Z",
      "archived_at": null,
      "avatar_url": null,
      "candidate_id": null,
      "custom_fields": {},
      "created_at": "2026-08-10T05:37:17.564Z",
      "updated_at": "2026-08-10T05:37:17.564Z",
      "checklist_complete": null,
      "blocking_items": null,
      "can_activate": null,
      "activated_at": null
    }
  },
  "candidates": {
    "status": 200,
    "count": 5,
    "first": {
      "id": "9120c6c1-1bf3-42d9-8c1f-7150f7cfc624",
      "company_id": "hol
```

## Matrix WS-G4-01..18

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-05** | PASS | {"verdict":"PASS","page_url":"http://127.0.0.1:5173/command-center/hrm/contracts?_=1786418577171"} |
| **WS-G4-01** | PASS | {"verdict":"PASS","empDefault":true,"empPickerVisible":true,"candTabVisible":true} |
| **WS-G4-08** | PASS | {"verdict":"PASS","pass":true,"wRatio":0.9,"hRatio":0.9,"note":"1296×810 vs 1440×900"} |
| **WS-G4-03** | PASS | {"verdict":"PASS","nameReadonly":true,"derived":"TMP-G4 — Hợp đồng học việc","cbCard":true,"allowanceAdd":false} |

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| — | — | — |

## Network

```json
{
  "employee_post": {
    "status": 201,
    "employee_id": "33333333-3333-4333-8333-333333333333"
  },
  "save_post": null,
  "view_get": null,
  "preview_post": null
}
```

## DnD / embed

| Check | Value |
|-------|--------|
| dialog mount | `parent-portal` |
| DnD storms | **0** |
| console errors (sample) | Failed to load resource: the server responded with a status of 404 () · Failed to load resource: the server responded with a status of 404 () · Failed to load resource: the server responded with a status of 404 () |

## Honesty

- `contracts_printable_ready=false` — **cấm** UF-HRM-10 full claim
- **C-SLICE ≠ module** CTR UAT

## Defects

| **DEF-CTR-G4-FATAL** | P0 | TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for getByTestId('ctr-create-next-btn')
    - locator resolved to <button disabled type="button" data-testid="ctr-create-nex |

## completion_report

**Closed:** Phase B U65 browser on `command-center/hrm/contracts` — NV-first create · view workspace · edit deep-link · profile prefill probe; L0 PASS; matrix rows executed with per-row verdicts; honesty `contracts_printable_ready=false`.

**Open:** REC hire CTA (WS-G4-12..14) BLOCKED without hire mutate; Settings clause SoT rows PLANNED/deferred; residual per defects if FAIL.

## next_owner

`pm` → `qc` narrow GWC if core rows PASS_WITH_HOLD; else `dev-fe` picker/DnD residual.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-WAVE-G4-QC-01
role: qc
read_first: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-01.md
entry_criteria: QA G4 Phase B ack_status PASS_TO_PM or FAIL_TO_PM with evidence
exit_criteria: GWC on G4 slice — honesty contracts_printable_ready=false; cấm UF-HRM-10; list promoted vs not promoted rows
evidence_path: docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-01.md
```

**ack_status:** **FAIL_TO_PM**
