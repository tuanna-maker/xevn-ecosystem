# Evidence — PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-QA-01` |
| **upstream** | `po-hrm-ctr-workspace-fe-dom-nesting-01.md` (DEF-CTR-G4-DOM-NESTING-P2 fix) |
| **runner_stamp** | **`CTRWSG4DOM-MSO6AR3A`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (narrow — DOM nesting slice only) |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-dom-nesting-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-dom-nesting-qa-01.json` |
| **commit** | `dc930c5` |

---

## Gates

| Gate | Command | Result |
|------|---------|--------|
| **L0 stack** | `pnpm run qc:dev-stack` | **PASS** — hrm-api **200** · xbos-api **200** · portal **200** |
| **L0 FE↔BE** | `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |

---

## U65 prereq (no seed — API read only)

| Resource | Status | Count |
|----------|--------|-------|
| `GET …/contracts-insurance/contracts?company_id=main` | 200 | 5 |

**must_keep:** `contracts_printable_ready=false` — not flipped during test.

---

## DEF-CTR-G4-DOM-NESTING-P2 — retest matrix

| Scenario | Click path | Console `validateDOMNesting` (Badge-in-`<p>`) | UI anchor | Verdict |
|----------|------------|-----------------------------------------------|-----------|---------|
| **View workspace** | Contracts → Eye (`hdsd-contracts-view-btn`) → Step1 «Mẫu in» | **0** | `hdsd-contracts-view-print-template` visible · `ctr-workspace-view-root` | **PASS** |
| **Create workspace** | Deep-link `?workspace=create` | **0** | `ctr-create-step-1` visible | **PASS** |
| **Edit workspace** | Deep-link `?workspace=edit&contractId=22aa6432-d1fa-4ec9-9591-9b9098458a4d` | **0** | `ctr-create-step-1` · `[data-ctr-workspace-mode="edit"]` | **PASS** |

**Aggregate:** `domNestingWarnings.length === 0` · `consoleErrors.length === 0` · `pageErrors.length === 0`

---

## Regression (G3/G4 — no regression)

| Area | Result |
|------|--------|
| View workspace shell | `ctr-workspace-view-root` + `hdsd-contracts-view-body` mount |
| Create deep-link | Step1 create mode opens |
| Edit deep-link | Step1 edit mode + `data-ctr-workspace-mode="edit"` |

Prior QC seals (edit deeplink · NV-first create) not re-run in full — spot regression only on workspace open paths above.

---

## Defect closure

| ID | Sev | Status | Note |
|----|-----|--------|------|
| `DEF-CTR-G4-DOM-NESTING-P2` | P2 | **CLOSED** | Badge no longer nested in `<p>` on view «Mẫu in» row; 0 console nesting warnings on view/create/edit open |

---

## Screenshots

- `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-dom-nesting-qa-01/01-view-workspace.png`
- `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-dom-nesting-qa-01/02-create-workspace.png`
- `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-dom-nesting-qa-01/03-edit-workspace.png`

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed `DEF-CTR-G4-DOM-NESTING-P2` QA retest — browser view/create/edit workspace on CC contracts embed; **0** `validateDOMNesting` Badge-in-`<p>` warnings; G3/G4 edit/create deeplink spot regression PASS; U65 zero-seed; `contracts_printable_ready` unchanged. |
| **next_owner** | `pm` |
| **evidence_path** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-dom-nesting-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01 (carry update)
role: pm
read_first:
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-dom-nesting-01.md
  - docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QA PASS_TO_PM DEF-CTR-G4-DOM-NESTING-P2 CLOSED
exit_criteria: Update seal carry table — DOM-NESTING row CLOSED; dispatch residual carry (WS-G4-07 confirm · BR-CTR-CREATE-08 banner · WS-G4-12..14 profile) per PM seal; no contracts_printable_ready flip
```
