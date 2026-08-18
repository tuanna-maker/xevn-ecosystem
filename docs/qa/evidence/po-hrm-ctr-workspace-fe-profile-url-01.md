# Evidence — PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-01` |
| **defect** | `DEF-CTR-G4-PROFILE-URL-P2` |
| **ack_status** | **READY_FOR_QA** |
| **owner** | dev-fe |

---

## Root cause

Profile «Thêm HĐ» (`ec-open-contract-workspace-create`) navigates iframe to `/contracts?workspace=create&employee_id=…&lock_subject_employee=1` via `openContractWorkspace`, but `PortalEmbedRouterSync` only synced **pathname** to parent CC URL. Parent kept prior query (`tab=contract`) without workspace deep-link params — QA could not assert F5/deep-link evidence on parent URL.

G4 edit fix (`mergePortalParentWorkspaceSearch`) addressed **read** path (parent → iframe). Profile flow needed symmetric **write** path (iframe → parent).

---

## Fix (FE)

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/contractWorkspaceDeepLink.ts` | `applyIframeWorkspaceParamsToParent` — copy workspace keys to parent query on `/contracts`; strip when leaving route |
| `apps/web/hrm/src/lib/hrmPortalUrlSync.ts` | `syncHrmLocationToPortalParent(pathname, basename, iframeSearch?)` merges workspace params when on contracts |
| `apps/web/hrm/src/components/layout/PortalEmbedRouterSync.tsx` | Pass `location.search` to parent sync (pathname + search deps) |

**must_keep:** Profile launcher `openContractWorkspace` + NV-first create (`lock_subject_employee`, UV tab hidden); edit/view deep-links unchanged.

---

## Verification

```text
cd apps/web/hrm
pnpm test contractWorkspace          → exit 0 (22 tests)
pnpm exec tsc --noEmit               → exit 0
```

### Unit coverage

- `contractWorkspaceDeepLink.test.ts` — `applyIframeWorkspaceParamsToParent` create+lock on contracts; strip off contracts
- `contractWorkspace.source.test.ts` — PortalEmbedRouterSync passes `location.search`; hrmPortalUrlSync imports apply helper

---

## QA retest (browser — U65)

| Row | URL / action | PASS when |
|-----|----------------|-----------|
| **WS-G4-12** | Profile tab HĐ → `ec-open-contract-workspace-create` | `ctr-create-step-1` visible · UV tab hidden · **parent** URL includes `workspace=create` + `employee_id` + `lock_subject_employee=1` |
| **Regression** | Contracts list create / edit / view deep-links | unchanged (G3/G4 edit) |

Persona: `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · zero-seed.

---

## completion_report

**Closed:** DEF-CTR-G4-PROFILE-URL-P2 — profile «Thêm HĐ» now writes workspace deep-link query to parent portal URL (or preserves on F5); symmetric with `mergePortalParentWorkspaceSearch` read path.

**Residual:** WS-G4-13 REC hire CTA BLOCKED U65 (no hired UV) · WS-G4-14 hire-readiness · `contracts_printable_ready=false` — out of scope this WI.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-ctr-workspace-fe-profile-url-01.md
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-rec-01.md § WS-G4-12
entry_criteria: dev-fe READY_FOR_QA — parent URL workspace sync merged locally
exit_criteria: WS-G4-12 PASS (not PASS_WITH_HOLD) — parent URL shows workspace=create&employee_id&lock_subject_employee=1 after profile «Thêm HĐ»; Step1 + UV hidden regression; evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-01.md; ack_status PASS_TO_PM
hdsd_align: UI-HRM-CTR-PROFILE-DEEP-LINK.md
persona: ceo@xe.vn / Xevn@2026 · company_id=main · U65 zero-seed
```

**evidence_path:** `docs/qa/evidence/po-hrm-ctr-workspace-fe-profile-url-01.md`  
**ack_status:** **READY_FOR_QA**
