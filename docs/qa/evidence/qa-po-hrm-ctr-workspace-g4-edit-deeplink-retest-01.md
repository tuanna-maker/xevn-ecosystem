# Evidence — PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QA-01` |
| **upstream** | `po-hrm-ctr-workspace-fe-edit-deeplink-01.md` (DEF-CTR-G4-EDIT-DEEPLINK-P1 fix) |
| **runner_stamp** | **`CTRWSG4ED-MSO2JT9Z`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (narrow — edit deep-link slice only) |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-edit-deeplink-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-edit-deeplink-qa-01.json` |
| **commit** | `dc930c5` |

---

## Gates

| Gate | Command | Result |
|------|---------|--------|
| **L0 stack** | `pnpm run qc:dev-stack` | **exit 0** — hrm-api **200** · xbos-api **200** · portal **200** |
| **L0 FE↔BE** | `pnpm run qc:fe-be-health` | **exit 0** |

---

## U65 prereq (no seed — API read only)

| Resource | Status | Count |
|----------|--------|-------|
| `GET …/contracts-insurance/contracts?company_id=main` | 200 | 2 |

Edit contract used: `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2` (Tran Thi B · NV002).

---

## WS-G4-03-EDIT (primary)

| Check | Result |
|-------|--------|
| Parent URL | `…/command-center/hrm/contracts?portal=1&tenantId=xevn&companyId=main&workspace=edit&contractId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2` |
| `ctr-create-step-1` visible | **yes** |
| `[data-ctr-workspace-mode="edit"]` | **yes** (count=1) |
| Shell mode | `mutate` |
| GET contract by id | **200** via portal proxy |
| **Verdict** | **PASS** |

**Click path:** Login (injected portal auth) → navigate parent CC URL with `workspace=edit&contractId=` → HRM iframe merges parent query → workspace dialog Step1 mounts in edit mode → GET hydrates form.

**Before (g4-retest-01):** Step1 shell **not** visible — parent `workspace`/`contractId` not forwarded to iframe parse path.

**After (this retest):** `resolveContractWorkspaceSearch` merge — Step1 + edit mode attr confirmed.

---

## Regression smoke (create / view — no regression)

| Deep-link | Verdict | Detail |
|-----------|---------|--------|
| `?workspace=create` | **PASS** | `ctr-create-step-1` visible · `[data-ctr-workspace-mode="create"]` |
| Eye → view workspace | **PASS** | `ctr-workspace-view-root` + `hdsd-contracts-view-body` · GET **200** |

---

## Network

```json
{
  "edit_get": {
    "status": 200,
    "url": "…/contracts-insurance/contracts/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2?company_id=main"
  },
  "view_get": {
    "status": 200,
    "url": "…/contracts-insurance/contracts/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2?company_id=main"
  }
}
```

---

## Console (non-blocking)

- `validateDOMNesting`: `<div>` inside `<p>` — `Badge` in view workspace (**P2 carry** · DEF-CTR-G4-DOM-NESTING-P2)
- **DnD storms:** **0**
- **pageErrors:** **0**

---

## Screenshots

| Path | Scenario |
|------|----------|
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-edit-deeplink-qa-01/01-create-deeplink.png` | Regression `workspace=create` |
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-edit-deeplink-qa-01/02-view-workspace.png` | Regression Eye view |
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-edit-deeplink-qa-01/03-edit-deeplink.png` | **WS-G4-03-EDIT PASS** |

---

## Defects

| ID | Sev | Mô tả | Owner | Status |
|----|-----|--------|-------|--------|
| **DEF-CTR-G4-EDIT-DEEPLINK-P1** | P1 | `?workspace=edit&contractId=` — edit shell Step1 not mounted on CC embed | dev-fe | **CLOSED** |
| **DEF-CTR-G4-CREATE-START-DATE-400** | P0 | CREATE Step1→2 POST 400 `start_date` — **out of scope** this WI | dev-be/dev-fe | **OPEN** (carry) |
| **DEF-CTR-G4-DOM-NESTING-P2** | P2 | Badge inside `<p>` view workspace | dev-fe | **OPEN** (carry) |

---

## Promoted / not promoted

**Promoted (this WI):**

- WS-G4-03-EDIT edit deep-link on CC parent URL
- Create/view deep-link regression (G3 unchanged)
- DEF-CTR-G4-EDIT-DEEPLINK-P1 **CLOSED**

**Not promoted (program carry — prior g4-retest):**

- CREATE mutate Step1→2 (WS-G4-02) · F5 mutate chain
- `contracts_printable_ready=false` · UF-HRM-10
- Profile HĐ prefill · REC hire CTA

---

## completion_report

**Closed:** WS-G4-03-EDIT **PASS** — CC embed `?workspace=edit&contractId=` mounts unified workspace Step1 with `data-ctr-workspace-mode=edit`; GET contract **200**; create/view deep-link regression **PASS**; L0 stack + FE↔BE **exit 0**; U65 zero-seed browser evidence; DEF-CTR-G4-EDIT-DEEPLINK-P1 **CLOSED**.

**Residual (out of scope):** CREATE `start_date` POST 400 (P0 carry) · DOM nesting P2 · honesty `contracts_printable_ready=false`.

## next_owner

`pm` → narrow `qc` seal for edit-deeplink slice; parallel `dev-be` if CREATE start_date fix already READY_FOR_QA

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QC-01
role: qc
read_first:
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-edit-deeplink-retest-01.md
  - docs/qa/evidence/po-hrm-ctr-workspace-fe-edit-deeplink-01.md
entry_criteria: QA PASS_TO_PM WS-G4-03-EDIT + create/view regression; DEF-CTR-G4-EDIT-DEEPLINK-P1 CLOSED
exit_criteria: GWC or GO narrow slice edit deep-link; must_keep contracts_printable_ready=false; honesty C-SLICE; evidence docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-edit-deeplink-01.md
cấm: promote UF-HRM-10 or full G4 matrix while CREATE start_date P0 open
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-edit-deeplink-retest-01.md`  
**ack_status:** **PASS_TO_PM**
