# Evidence — PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-02` |
| **parent** | `PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-FE-01` |
| **defect** | `DEF-CTR-G4-PROFILE-EMBED-P0` |
| **ack_status** | **READY_FOR_QA** |
| **owner** | dev-fe |

---

## Root cause

`PortalEmbedRouterSync.tsx` lines 18–24: JSDoc closed at line 18 (`*/`) then stray `*` and a second `@CODE-MEMORY-CHANGE` block **outside** the comment. Vite transform failed → **HTTP 500** on module load → blank HRM embed (QA `DEF-CTR-G4-PROFILE-EMBED-P0`). Introduced in FE-01 patch.

---

## Fix (FE)

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/layout/PortalEmbedRouterSync.tsx` | Merge both `@CODE-MEMORY-CHANGE` entries into single valid `/** … */` block; remove stray `*` after premature close |

**must_keep:** FE-01 URL sync (`syncHrmLocationToPortalParent` + `location.search`); `applyIframeWorkspaceParamsToParent` write path; NV-first UV tab hidden — **no logic change**.

---

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run contractWorkspace   → exit 0 (22 tests, 3 files)
pnpm exec tsc --noEmit                   → exit 0
GET http://127.0.0.1:5173/hr/src/components/layout/PortalEmbedRouterSync.tsx → HTTP 200
```

---

## QA retest (browser — U65)

| Row | URL / action | PASS when |
|-----|----------------|-----------|
| **WS-G4-12** | Profile tab HĐ → `ec-open-contract-workspace-create` | Embed mounts · `ctr-create-step-1` visible · UV tab hidden · **parent** URL includes `workspace=create` + `employee_id` + `lock_subject_employee=1` |
| **J-HRM-CTR-PROFILE-01** | Profile → Thêm HĐ click path | No blank embed; no module 500 |
| **Regression** | Contracts list create / edit / view deep-links | unchanged (G3/G4 edit) |

Persona: `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · zero-seed · NV101 `33333333-3333-4333-8333-333333333333`.

---

## completion_report

**Closed:** `DEF-CTR-G4-PROFILE-EMBED-P0` — malformed JSDoc fixed; Vite serves module HTTP 200; unit + tsc PASS. FE-01 profile URL sync logic preserved.

**Residual:** WS-G4-12 strict parent URL assert + browser WS-G4-12/J-HRM-CTR-PROFILE-01 need QA retest (blocked by P0 embed failure in prior run). WS-G4-13/14 out of scope.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-PROFILE-URL-QA-02
role: qa
read_first:
  - docs/qa/evidence/po-hrm-ctr-workspace-g4-profile-url-fe-02.md
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-01.md
entry_criteria: dev-fe READY_FOR_QA — DEF-CTR-G4-PROFILE-EMBED-P0 JSDoc fix; PortalEmbedRouterSync HTTP 200
exit_criteria:
  - L2 embed PASS — HRM profile loads (no blank iframe / no module 500)
  - WS-G4-12 strict PASS — profile «Thêm HĐ» → parent CC URL has workspace=create&employee_id&lock_subject_employee=1; Step1 visible; UV tab hidden
  - J-HRM-CTR-PROFILE-01 PASS
  - evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-profile-url-retest-02.md
hdsd_align: UI-HRM-CTR-PROFILE-DEEP-LINK.md
persona: ceo@xe.vn / Xevn@2026 · company_id=main · U65 zero-seed
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/po-hrm-ctr-workspace-g4-profile-url-fe-02.md`
