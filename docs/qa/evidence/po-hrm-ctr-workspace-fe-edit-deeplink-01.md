# Evidence — PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-FE-01` |
| **defect** | `DEF-CTR-G4-EDIT-DEEPLINK-P1` |
| **ack_status** | **READY_FOR_QA** |
| **owner** | dev-fe |

---

## Root cause

Command Center embed loads HRM iframe with locked `src` (`hrmProxyPathFromSuffix`) that only forwards `portal`, `tenantId`, `companyId` — **not** `workspace` / `contractId` from the parent URL.

QA navigates to:

`http://127.0.0.1:5173/command-center/hrm/contracts?portal=1&…&workspace=edit&contractId={id}`

`Contracts.tsx` parsed `location.search` inside the iframe (missing workspace params) → edit deep-link effect never ran → `ContractWorkspaceDialog` / `ctr-create-step-1` not mounted.

---

## Fix (FE)

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/contractWorkspaceDeepLink.ts` | `mergePortalParentWorkspaceSearch` + `resolveContractWorkspaceSearch` — merge parent portal query when iframe lacks `workspace` |
| `apps/web/hrm/src/pages/Contracts.tsx` | Use `resolveContractWorkspaceSearch`; edit deep-link opens workspace shell immediately (same shell as create/view), then GET-by-id hydrates `handleOpenEdit` |

**must_keep:** G3 workspace shell; view/create deep-links unchanged.

---

## Verification

```text
cd apps/web/hrm
pnpm test contractWorkspace          → exit 0 (18 tests)
pnpm exec tsc --noEmit               → exit 0
```

### Unit coverage

- `contractWorkspaceDeepLink.test.ts` — parent portal merge for `workspace=edit&contractId=…`
- `contractWorkspace.source.test.ts` — Contracts uses `resolveContractWorkspaceSearch`

---

## QA retest (browser — U65)

| Row | URL / action | PASS when |
|-----|----------------|-----------|
| **WS-G4-03-EDIT** | `command-center/hrm/contracts?…&workspace=edit&contractId={existing}` | `ctr-create-step-1` visible · `[data-ctr-workspace-mode="edit"]` · dialog parent-portal |
| **Regression** | `workspace=create` / Eye view | unchanged (G3) |

Persona: `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · zero-seed.

---

## completion_report

**Closed:** DEF-CTR-G4-EDIT-DEEPLINK-P1 — CC embed edit deep-link mounts unified workspace dialog in edit mode; parent URL workspace params merged into HRM parse path; immediate shell open + async GET hydrate.

**Residual:** WS-G4-02 CREATE `start_date` 400 (dev-be) · profile tab P2 · DOM nesting P2 — out of scope this WI.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-QA-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-ctr-workspace-fe-edit-deeplink-01.md
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-retest-01.md § WS-G4-03-EDIT
entry_criteria: dev-fe READY_FOR_QA — edit deep-link fix merged locally
exit_criteria: WS-G4-03-EDIT PASS browser on CC URL ?workspace=edit&contractId=; ctr-create-step-1 + data-ctr-workspace-mode=edit; create/view deep-links regression PASS; evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-edit-deeplink-retest-01.md; ack_status PASS_TO_PM
hdsd_align: UI-HRM-CTR-WORKSPACE.md
persona: ceo@xe.vn / Xevn@2026 · company_id=main · U65 zero-seed
```

**evidence_path:** `docs/qa/evidence/po-hrm-ctr-workspace-fe-edit-deeplink-01.md`  
**ack_status:** **READY_FOR_QA**
