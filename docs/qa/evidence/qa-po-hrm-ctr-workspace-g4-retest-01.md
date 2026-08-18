# Evidence — PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B-RETEST-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B-RETEST-01` |
| **matrix_stamp** | **`CTRWSG4M1-MSNWKSPC`** |
| **runner_stamp** | **`CTRWSG4R-MSO23CUA`** (matrix) · **`CTRWSG4L-MSO293PE`** (layout 09..11) |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** · C-SLICE · `contracts_printable_ready=false` |
| **URL (mandatory)** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `UI-HRM-CTR-WORKSPACE.md` |
| **runners** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-01.mjs` · `scripts/qa/_tmp-po-hrm-ctr-workspace-qa-ws-g4-layout-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-01.json` · `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-qa-ws-g4-layout-01.json` |
| **commit** | `dc930c5` |
| **upstream** | `po-hrm-ctr-workspace-g4-compile-fix-fe-01.md` (DEF-CTR-G4-COMPILE-P0 **CLOSED**) |

---

## Gates

| Gate | Command | Result |
|------|---------|--------|
| **L0 stack** | `pnpm run qc:dev-stack` | **PASS** — hrm-api `:28001` **200** · xbos **200** · portal **200** (UV exit quirk Windows) |
| **L0 FE↔BE** | `pnpm run qc:fe-be-health` | **exit 0** |
| **P0 compile** | `GET …/ContractCreateWizardDialog.tsx` | **200** (was **500** pre-fix) |
| **Embed mount** | Playwright `hdsd-contracts-create-btn` | **visible** · dialog on `parent-portal` · **0** Vite overlay |

---

## P0 compile — verified CLOSED

| Check | Before (g4-01 prior) | Retest |
|-------|----------------------|--------|
| Vite wizard module | **500** Syntax Error | **200** |
| HRM embed | timeout 90s | **mounts** · create dialog opens |
| `Contracts.tsx` lazy import | Failed to fetch | **OK** |

**DEF-CTR-G4-COMPILE-P0** → **CLOSED** (dev-fe comment-only fix confirmed).

---

## U65 prereq (no seed — API)

| Resource | Status | Count |
|----------|--------|-------|
| `GET …/employees?company_id=main` | 200 | 3 |
| `GET …/recruitment/candidates` | 200 | 5 |
| `GET …/contract-templates?status=active` | 200 | 1 (`XEVN_FT_12M_DRIVER`) |
| `GET …/contracts` | 200 | 2 |

---

## Matrix WS-G4-01..18 (CTRWSG4M1)

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-01** | **PASS** | NV-first: `ctr-create-subject-tab-employee` default · employee picker visible · UV tab present |
| **WS-G4-02** | **FAIL** | NV pick `Le Van C — NV101` OK · **POST 400** `HRM-VAL-001` `start_date must be a valid ISO 8601 date string` · Step2 **not** open |
| **WS-G4-03** | **PASS** | Tên HĐ read-only derived · C&B card read-only · no «+ Thêm phụ cấp» |
| **WS-G4-04** | **BLOCKED** | F5 row `QG4NVO23CUA` absent — depends WS-G4-02 mutate |
| **WS-G4-05** | **PASS** | URL `command-center/hrm/contracts` |
| **WS-G4-06** | **BLOCKED** | Step2 not open (POST 400) |
| **WS-G4-07** | **BLOCKED** | Mandatory gỡ — depends Step2 |
| **WS-G4-08** | **PASS** | Dialog **0.9×0.9** viewport (1296×810 vs 1440×900) |
| **WS-G4-09** | **PASS** | Eye → view workspace · party visible · GET **200** (layout run: **one** GET `contracts/{id}?company_id=main` on open) |
| **WS-G4-10** | **PASS** | Layout run: `ctr-workspace-view-clause-layout` · **1** clause from GET · read-only · **no** `contract-clauses` list on Step2 |
| **WS-G4-11** | **PASS** | `can_issue=false` → In/PDF **disabled** · `ctr-workspace-view-issue-blocked-hint` VI: *«Chưa đủ điều kiện phát hành — kiểm tra mẫu in và thông tin hợp đồng.»* · `contracts_printable_ready=false` |
| **WS-G4-12** | **BLOCKED** | U65 — no hire mutate this session |
| **WS-G4-13** | **BLOCKED** | REC CTA — no hire path |
| **WS-G4-13-PROFILE** | **BLOCKED** | Employee profile — tab Hợp đồng not found (route/tab selector) |
| **WS-G4-14** | **BLOCKED** | Depends WS-G4-04 + hire readiness |
| **WS-G4-15** | **PLANNED** | Settings clause SoT — out of CC slice |
| **WS-G4-16** | **PLANNED** | CLQA3 residual — dev-be |
| **WS-G4-17** | **PLANNED** | CLQA3 immutability — dev-be |
| **WS-G4-18** | **BLOCKED** | View clause SoT — partial (GET bind PASS; full preview spine not in matrix runner) |
| **WS-G4-03-EDIT** | **FAIL** | `?workspace=edit&contractId=aaaaaaaa-…aaa2` — Step1 shell **not** visible after navigation |
| **WS-G4-09-F5** | **PASS** | Layout run: clause layout persists after F5 (1 item) |

---

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-CREATE-01** | **FAIL** | Step2 blocked by POST 400 `start_date` |
| **J-HRM-CTR-CREATE-02** | **BLOCKED** | DnD Step2 — depends CREATE mutate |
| **J-HRM-03** | **PASS** | List → Eye → view workspace · GET detail **2xx** |
| **J-HRM-REC-07-03** | **BLOCKED** | U65 + no hire |

**L2 PASS + L2.5 partial FAIL = overall QA FAIL** (U19).

---

## UF blocks (browser)

| UF | Status | Evidence |
|----|--------|----------|
| Embed + create btn | **PASS** | `hdsd-contracts-create-btn` · no Vite overlay |
| NV-first CREATE Step1 | **PASS** | WS-G4-01/03/08 |
| CREATE Step1→2 mutate | **FAIL** | POST **400** · Step2 closed |
| Eye → view workspace | **PASS** | WS-G4-09 · screenshots layout run |
| View Step2 clause_layout | **PASS** | WS-G4-10 · one GET only |
| can_issue gate In/PDF | **PASS** | WS-G4-11 |
| Edit deep-link | **FAIL** | WS-G4-03-EDIT |
| Profile HĐ prefill | **BLOCKED** | tab not found |
| REC hire CTA | **BLOCKED** | U65 |
| F5 after mutate | **BLOCKED** | no successful create |

---

## Network (mutate + view)

```json
{
  "employee_post": {
    "status": 400,
    "employee_id": "33333333-3333-4333-8333-333333333333",
    "code": "HRM-VAL-001",
    "message": "start_date must be a valid ISO 8601 date string"
  },
  "view_gets": [
    {
      "status": 200,
      "url": "…/contracts-insurance/contracts/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2?company_id=main"
    }
  ],
  "clause_list_calls": []
}
```

---

## Console (non-blocking)

- `validateDOMNesting`: `<div>` inside `<p>` — `Badge` in `ContractWorkspaceViewBody` (P2 cosmetic)
- **2×** `400 Bad Request` on CREATE POST (matches WS-G4-02 FAIL)

**DnD storms:** **0**

---

## Screenshots

| Path | Row |
|------|-----|
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-01/01-create-dialog.png` | WS-G4-01/08 |
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-01/04-view-workspace.png` | WS-G4-09 |
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-01/05-edit-deeplink.png` | WS-G4-03-EDIT FAIL |
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-qa-ws-g4-layout-01/02-view-step2-clause-layout.png` | WS-G4-10 |
| `docs/qa/evidence/screens/po-hrm-ctr-workspace-qa-ws-g4-layout-01/03-issue-gate.png` | WS-G4-11 |

---

## Promoted / not promoted

**Promoted (narrow — post compile-fix):**

- P0 compile + HRM embed mount
- WS-G4-01 · 03 · 05 · 08 (NV-first · fields · CC URL · dialog size)
- WS-G4-09..11 + F5 (view GET `clause_layout` bind · `can_issue` gate)
- J-HRM-03 list→view
- L0 stack + FE↔BE health

**Not promoted:**

- CREATE mutate Step1→2 (WS-G4-02/04/06/07)
- Edit deep-link workspace (WS-G4-03-EDIT)
- Profile HĐ prefill · REC hire CTA
- UF-HRM-10 · `contracts_printable_ready` remains **false**

---

## Defects

| ID | Sev | Mô tả | Owner | Status |
|----|-----|--------|-------|--------|
| **DEF-CTR-G4-COMPILE-P0** | P0 | `@CODE-MEMORY` syntax → Vite 500 | dev-fe | **CLOSED** |
| **DEF-CTR-G4-CREATE-START-DATE-400** | **P0** | Tiếp Step1 → POST **400** `HRM-VAL-001` missing/invalid `start_date` — blocks Step2 · DnD · F5 | **dev-be** / **dev-fe** | **OPEN** |
| **DEF-CTR-G4-EDIT-DEEPLINK-P1** | P1 | `?workspace=edit&contractId=` — edit shell Step1 not mounted | dev-fe | **OPEN** |
| **DEF-CTR-G4-PROFILE-TAB-P2** | P2 | Employee profile — tab Hợp đồng not found for prefill probe | dev-fe | **OPEN** |
| **DEF-CTR-G4-DOM-NESTING-P2** | P2 | `Badge` inside `<p>` in view workspace | dev-fe | **OPEN** |

---

## completion_report

**Closed:** P0 compile retest **PASS** — HRM embed mounts on CC contracts; `hdsd-contracts-create-btn` visible; Vite wizard **200**; L0 **PASS**; WS-G4 matrix re-executed U65 browser — **8 PASS** · **2 FAIL** · **8 BLOCKED** · **3 PLANNED**; WS-G4-09..11 layout bind **PASS** (one GET · read-only canvas · `can_issue=false` In/PDF + VI hint · F5); J-HRM-03 **PASS**; honesty `contracts_printable_ready=false` · **cấm** UF-HRM-10.

**Open / residual:** CREATE NV-first Step1→2 **FAIL** POST 400 `start_date` — blocks DnD/F5/mutate chain (WS-G4-02/04/06/07 · J-HRM-CTR-CREATE-01/02); edit deep-link **FAIL**; profile/REC rows BLOCKED; Settings rows PLANNED.

## next_owner

`dev-be` + `dev-fe` (CREATE `start_date` 400 + edit deep-link) → `qa` retest mutate/DnD after fix

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-FIX-01
role: dev-be
read_first:
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-retest-01.md § DEF-CTR-G4-CREATE-START-DATE-400
  - docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md (POST draft / Step1→2)
  - apps/api/hrm-api/src/contracts-insurance/ (create DTO validation)
entry_criteria: QA G4 retest FAIL — POST contracts 400 HRM-VAL-001 start_date on NV-first Tiếp
exit_criteria: POST draft with employee_id + template returns 2xx OR FE sends valid start_date per SRS; browser Step2 opens; READY_FOR_QA WS-G4-02/06/07 retest
must_keep: NV-first · G3 workspace · contracts_printable_ready=false
evidence_path: docs/qa/evidence/po-hrm-ctr-workspace-be-create-start-date-01.md
ack_status: READY_FOR_QA
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-retest-01.md`  
**ack_status:** **FAIL_TO_PM**
