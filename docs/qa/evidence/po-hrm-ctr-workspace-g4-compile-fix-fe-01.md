# Evidence — PO-HRM-CTR-WORKSPACE-G4-COMPILE-P0-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-COMPILE-P0-FE-01` |
| **defect** | `DEF-CTR-G4-COMPILE-P0` |
| **ack_status** | **READY_FOR_QA** |
| **upstream** | `qa-po-hrm-ctr-workspace-g4-01.md` (FAIL_TO_PM) |

---

## Root cause

`ContractCreateWizardDialog.tsx` closed the `@CODE-MEMORY` block at line 15 (`*/`) while a G3 `@CODE-MEMORY-CHANGE` block (lines 16–19) remained **outside** the `/** … */` wrapper → Vite/SWC **Syntax Error: Expression expected** → lazy import `Contracts.tsx` failed → HRM embed never mounted.

## Fix (comment-only)

Moved `@CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-WAVE-G3` **inside** the opening `/**` block before the closing `*/`. No business logic change.

**File:** `apps/web/hrm/src/components/contracts/ContractCreateWizardDialog.tsx` (lines 1–19)

---

## Verification

| Check | Command / probe | Result |
|-------|-----------------|--------|
| Vitest | `pnpm exec vitest run src/lib/contractWorkspace.source.test.ts` | **10 PASS** |
| TypeScript | `pnpm exec tsc --noEmit` (apps/web/hrm) | **exit 0** |
| Vite compile | `GET http://127.0.0.1:5173/hr/src/components/contracts/ContractCreateWizardDialog.tsx` | **200** (was 500) |
| HMR | dev server log `9:41:15 AM [vite] hmr update … ContractWorkspaceDialog.tsx` | picked up fix |

**must_keep:** G3 workspace behavior · NV-first default · HDSD testids — unchanged.

---

## completion_report

**Closed:** P0 compile defect `DEF-CTR-G4-COMPILE-P0` — malformed `@CODE-MEMORY` comment syntax fixed; Vite serves wizard module 200; vitest + tsc PASS.

**Residual (QA):** Full WS-G4 matrix browser retest (WS-G4-01..18, J-HRM-CTR-CREATE-01/02, J-HRM-03) — previously BLOCKED by embed crash; `contracts_printable_ready` still false until QA confirms mutate/view/DnD paths.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B-RETEST-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-ctr-workspace-g4-compile-fix-fe-01.md
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-01.md
entry_criteria: dev-fe READY_FOR_QA — DEF-CTR-G4-COMPILE-P0 fixed; Vite 200 on ContractCreateWizardDialog.tsx
exit_criteria: U65 browser — CC http://127.0.0.1:5173/command-center/hrm/contracts · ceo@xe.vn · hdsd-contracts-create-btn visible · HRM embed mounts · re-run WS-G4-01..18 matrix · J-HRM-CTR-CREATE-01/02 + J-HRM-03 L2.5 · evidence docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-retest-01.md
hdsd_align: contracts create/view/edit workspace
ack_status: PASS_TO_PM or FAIL_TO_PM
```

**evidence_path:** `docs/qa/evidence/po-hrm-ctr-workspace-g4-compile-fix-fe-01.md`
