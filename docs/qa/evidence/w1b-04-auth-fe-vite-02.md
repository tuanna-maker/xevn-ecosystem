# Evidence — W1-B-04-AUTH-FE-VITE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-04-AUTH-FE-VITE-02` |
| **role** | dev-fe |
| **date** | 2026-08-03 |
| **parent_fail** | `docs/qa/evidence/w1b-04-auth-fe-qa-ret2.md` · residual **R-AUTH-FE-VITE-CC-PAGE** |
| **spec_ref** | UC-HRM-REC-WF-01 · ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE §3 · FR-UC-M01 (membership labels) |
| **U65** | zero-seed · no `pnpm seed:*` · no invent UF from vitest alone |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | qa |
| **next_work_item** | `W1-B-04-AUTH-FE-QA-RET3` |

## Root cause

Post-login SPA lazy-loads `CommandCenterPage.tsx`. Vite import-analysis failed on missing `../../data/hrm-recruitment-workflow-presets` (file absent on disk; still referenced by CC + `workflowMapper`). Unblocking that import exposed a **chain** of other missing CC / `@xevn/ui` modules (same class as prior Vite restore waves).

## Fix (restore, not redesign)

Restored binary-safe from git stash commit `43c479a` (untracked snapshot). **Did not** restore `scopeRoleLabels*` (must_keep BE `*_label` path from W1-B-04-AUTH-FE).

### Primary

| Path | Role |
|------|------|
| `apps/web/web-portal/src/data/hrm-recruitment-workflow-presets.ts` | presets + `businessTypeForWorkflowCode` / `categoryForWorkflowCode` |
| `apps/web/web-portal/src/data/hrm-recruitment-workflow-presets.test.ts` | unit gate |
| CODE-MEMORY-CHANGE | `W1-B-04-AUTH-FE-VITE-02` APPEND on presets |

### Chained (required for CommandCenterPage transform 200)

| Path |
|------|
| `src/data/workflow-resolver.ts` (+ `.test.ts`) |
| `src/pages/command-center/WorkflowStepResolverFields.tsx` |
| `src/pages/command-center/ApplyCatalogToMembersPanel.tsx` (+ `.test.ts`) |
| `src/pages/command-center/shareholderListSync.ts` (+ `.test.ts`) |
| `src/pages/command-center/MetadataTypedFieldControls.tsx` |
| `src/integrations/configSyncApplyMembers.ts` (+ `.test.ts`) |
| `src/modules/hrm/inboxDeepLink.ts` (+ `.test.ts`) |
| `src/modules/hrm/portalEmbedSoftNavGuard.ts` (+ `.test.ts`) |
| `src/lib/hdsdMutateTestIds.ts` (+ `.test.ts`) |
| `src/lib/dashboardPageToolbar.ts` (+ `.test.ts`) + `DashboardPageToolbar.tsx` |
| `src/utils/infraBlockDisplayLabels.ts` (+ `.test.ts`) |
| `src/utils/metadataDataTypeDisplayLabels.ts` (+ `.test.ts`) |
| `src/pages/settings/kpiMoneyUnit.ts` |
| `packages/ui/src/components/ViGroupedIntegerInput.tsx` |
| `packages/ui/src/components/ViDateInput.tsx` |
| `packages/ui/src/lib/{viNumberFormat,viDateFormat,formatDisplayDate}.ts` |

## must_keep verification

| Artifact | Status |
|----------|--------|
| `authSession` `*_label` normalize + helpers | **untouched** · Vite **200** |
| `TopHeader` `portal-membership-*` + `membership*Display` | **untouched** · Vite **200** |
| `CommandCenterInboxPage` | Vite **200** |
| `scopeRoleLabels` invent map | **not restored** (`Test-Path` = false) |
| Seed | none |

## Verify commands / results

```text
curl http://127.0.0.1:5173/src/pages/command-center/CommandCenterPage.tsx  → 200
curl http://127.0.0.1:5173/command-center                                 → 200
curl …/CommandCenterInboxPage.tsx                                         → 200
curl …/TopHeader.tsx / authSession.ts                                     → 200
pnpm --filter web-portal exec vitest run \
  src/data/hrm-recruitment-workflow-presets.test.ts \
  src/integrations/authSession.test.ts \
  src/data/workflow-resolver.test.ts
→ 3 files / 21 tests PASS
```

## Residual for QA RET3

- Browser U65 Cases B/C: `ceo@xe.vn` login → `/command-center` **no Vite overlay** → TopHeader membership chip shows BE `tenant_label` / `company_label` / `role_label` (not slug invent).
- F5 retains labels; select-membership when multi-membership.
- `hdsd_align` + case_matrix + anti-idle (clicks + Network) required — this evidence is **transform/unit only**, not UF 🟢.

## Handoff

```yaml
work_item_id: W1-B-04-AUTH-FE-VITE-02
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/w1b-04-auth-fe-vite-02.md
next_owner: qa
next_dispatch_prompt: |
  work_item_id: W1-B-04-AUTH-FE-QA-RET3
  role: qa
  priority: P0
  entry: docs/qa/evidence/w1b-04-auth-fe-vite-02.md READY_FOR_QA (CommandCenterPage Vite 200; authSession 11/11)
  mission: Browser U65 Cases A/B/C at http://127.0.0.1:5173 — login form; wrong password; ceo@xe.vn post-login /command-center NO Vite overlay; TopHeader portal-membership-* shows BE *_label; select-membership + F5 when multi.
  exit: evidence docs/qa/evidence/w1b-04-auth-fe-qa-ret3.md with hdsd_align + case_matrix + anti-idle (clicks≥4 + Network); PASS_TO_PM or FAIL with residual.
  cấm: seed · invent UF from vitest · idle viewport-only
```
