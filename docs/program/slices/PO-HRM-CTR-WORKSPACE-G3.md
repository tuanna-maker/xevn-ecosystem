# Slice — PO-HRM-CTR-WORKSPACE-G3

| Field | Value |
|-------|--------|
| **Story** | PO-HRM-CTR-WORKSPACE-G3 |
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-WAVE-G3` |
| **Epic / lane** | HRM Contracts · workspace unification wave |
| **Owner** | dev-fe |
| **Parent ADR** | [`docs/architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md`](../../architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md) |
| **BA SoT** | [`docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md`](../specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md) |
| **change_mode** | **UPGRADE** — extract + unify; preserve registry/print must_keep |
| **status** | **DRAFT** (skeleton — SA G2) |
| **sponsor_confirm** | 2026-08-11 — parallel G1/G3/G4 |
| **honesty** | `contracts_printable_ready=false` · cấm flip trong slice |

---

## spec_read_ack

```markdown
## spec_read_ack
- srs: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE_team.md · FR-UC-BP-CORE-09a/b/c · FR-HRM-CI-01 Diễn biến #7/#8
- tech_spec: docs/hrm/TECHSPEC.md §14.2 · docs/ecosystem/TECHSPEC.md §4.1 (parent portal)
- db_design: docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md · employee_contracts
- api_design: docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md · POST/PATCH/GET contracts + print overlay
- architecture: docs/architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md
- slice: docs/program/slices/PO-HRM-CTR-WORKSPACE-G3.md
- change_mode: UPGRADE
- sponsor_confirm: 2026-08-11 G2/G3/G4 parallel
```

---

## A. Objective (G3)

Implement **ContractWorkspaceDialog** per ADR §3–§6:

1. Modes: `create` | `edit` | `view`.
2. Shared: `ContractRegistryFields`, `ContractClauseCanvas`, `useContractPrintSpine`.
3. Wire **Contracts.tsx** (create/edit/view) + **EmployeeContracts.tsx** (deprecate legacy dialog).
4. Parent CC portal ~90vw×90vh; DnD same-document (Option A).
5. View mode: clause canvas read-only + print spine display (preview / issued PDF when API ready).

**Out of scope G3:** BE schema G-CTR-SUBJ-01 · flip `contracts_printable_ready` · Word export invent · compensation tab rewrite.

---

## B. Allowed paths

| Layer | Path | Neo | Owner |
|-------|------|-----|-------|
| **New** | `apps/web/hrm/src/components/contracts/ContractWorkspaceDialog.tsx` | @CODE-MEMORY | dev-fe |
| **New** | `apps/web/hrm/src/components/contracts/ContractRegistryFields.tsx` | @CODE-MEMORY | dev-fe |
| **New** | `apps/web/hrm/src/components/contracts/ContractClauseCanvas.tsx` | @CODE-MEMORY | dev-fe |
| **New** | `apps/web/hrm/src/hooks/useContractPrintSpine.ts` | @CODE-MEMORY | dev-fe |
| **Refactor** | `apps/web/hrm/src/components/contracts/ContractCreateWizardDialog.tsx` | @CODE-MEMORY | dev-fe — shim → workspace or thin delegate |
| **Refactor** | `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx` | @CODE-MEMORY | dev-fe — migrate to RegistryFields |
| **Refactor** | `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx` | @CODE-MEMORY | dev-fe — migrate to ClauseCanvas |
| **Refactor** | `apps/web/hrm/src/components/contracts/ContractPrintSpinePanel.tsx` | @CODE-MEMORY | dev-fe — optional thin wrapper over hook |
| **Wire** | `apps/web/hrm/src/pages/Contracts.tsx` | @CODE-MEMORY | dev-fe — launch workspace all modes |
| **Wire** | `apps/web/hrm/src/components/employee/EmployeeContracts.tsx` | @CODE-MEMORY | dev-fe — deprecate L912+ dialog |
| **Tests** | `apps/web/hrm/src/lib/contractWorkspace.source.test.ts` | — | dev-fe |
| **Tests** | `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts` | — | dev-fe — update/retain |
| **Evidence** | `docs/qa/evidence/po-hrm-ctr-workspace-fe-g3.md` | — | dev-fe |

---

## C. Forbidden paths

- `apps/api/**` (BE slice separate unless PM hotfix P0)
- Set `CONTRACTS_PRINTABLE_READY` / `contracts_printable_ready=true`
- `portalScope="iframe"` on workspace shell
- `syncContractTemplateClauseBind` inside create wizard step 2 (must_keep FE-02)
- Seed / probe-only PASS artifacts
- Rewrite `EmployeeCompensationPanel` / compensation history tabs
- Invent honesty paragraph UI (`ctr-*-honesty`)

---

## D. must_keep

| ID | Rule |
|----|------|
| UF-HRM-02 | Registry list CRUD + F5 |
| BR-CD-F5-01 | No salary on contract body |
| AC-CTR-UX-01 | No honesty paragraph production |
| AC-CTR-UX-06/07 | Parent portal ~90% · DnD on CC URL |
| AC-CTR-DND-01/02 | Gỡ + mandatory confirm |
| AC-CTR-FIELD-* | BA-02 field manifest |
| AC-CTR-SUBJECT-* | UV/NV picker behavior |
| CORE-09 | Print spine honesty · Nest /core DENY |
| U65 | Zero-seed browser mutate |
| Renew chain | `renewed_from_id` pre-fill on profile renew |

---

## E. Component contracts (dev-fe)

### E.1 `ContractWorkspaceDialog`

```typescript
type ContractWorkspaceMode = 'create' | 'edit' | 'view';

type ContractWorkspaceSubjectLock =
  | { type: 'employee'; employeeId: string }
  | { type: 'candidate'; candidateId: string }
  | null;

type ContractWorkspaceDialogProps = {
  mode: ContractWorkspaceMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  contractId?: string | null;
  subjectDefault?: 'candidate' | 'employee';
  subjectLock?: ContractWorkspaceSubjectLock;
  renewedFromId?: string | null;
  onSaved?: () => void;
  onModeChange?: (mode: ContractWorkspaceMode) => void;
};
```

### E.2 `ContractRegistryFields`

- Props: `mode`, `readOnly`, `form`, `extra`, `subject`, catalog options, `hasContractField`, `subjectLock`.
- Extract from `ContractCreateStep1GeneralGrid` without behavior regression.

### E.3 `ContractClauseCanvas`

- Props: `mode`, `readOnly`, `companyId`, `contractId`, `templateCode`, `packCode`, `canvasIds`, `onCanvasChange`, driver overrides.
- Uses `HrmDragDropContext` + `sameNodeDragBind`.
- View: render canvas + preview read-only; hide Gỡ when `readOnly`.

### E.4 `useContractPrintSpine`

- Inputs: `companyId`, `contractId`, `templateCode`, `packCode`, `fieldOverrides`, `enabled`.
- Outputs: library state, preview, versions, issueBlocked, `preview()`, `saveOverlay()`, `saveVersion()`, `fetchPdf()` — align existing `contractCreateApi` + `hrmApi` calls.

---

## F. Entry surfaces (wire checklist)

| Surface | Mode | subjectDefault / lock |
|---------|------|-------------------------|
| `Contracts.tsx` «Thêm HĐ» | `create` | `subjectDefault: 'candidate'` |
| `Contracts.tsx` «Sửa» | `edit` | from row |
| `Contracts.tsx` Eye | `view` | from row; optional «Sửa» |
| `EmployeeContracts.tsx` «Thêm HĐ» | `create` | `subjectLock: { type: 'employee', employeeId }` |
| `EmployeeContracts.tsx` «Sửa» | `edit` | same lock |
| Profile renew | `create` | `renewedFromId` pre-fill |

---

## G. AC mapping (QA G4 pointer)

| AC / Journey | G3 implementation hook |
|--------------|--------------------------|
| AC-CTR-UX-06 | Workspace `DialogContent` geometry |
| AC-CTR-UX-07 | ClauseCanvas inside parent portal |
| AC-CTR-FIELD-01..05 | ContractRegistryFields |
| AC-CTR-SUBJECT-01..03 | RegistryFields subject toggle/lock |
| AC-CTR-DND-01/02 | ContractClauseCanvas |
| J-HRM-CTR-CREATE-01..09 | Contracts.tsx via workspace |
| G1 view parity | View mode ClauseCanvas + print spine |
| J-HRM-03 | View testids retained on workspace shell |

---

## H. Verify (dev-fe before READY_FOR_QA)

```bash
pnpm --filter hrm exec vitest run src/lib/contractWorkspace.source.test.ts
pnpm --filter hrm exec vitest run src/lib/contractCreateWizard.source.test.ts
pnpm --filter hrm exec vitest run src/lib/jdDndSameNodeProps.test.ts
```

Manual smoke (agent, not sponsor):

1. CC `…/command-center/hrm/contracts` — create 2-step → Lưu → F5.
2. Same URL — Eye view shows clause section (read-only).
3. Employee profile tab HĐ — «Thêm» opens **same** workspace shell (parent portal), NV locked.

---

## I. Residual (not G3)

| ID | Owner | Note |
|----|-------|------|
| G-CTR-SUBJ-01 | dev-be | UV-only POST if schema blocks |
| G1 BA AC text | ba-process | Parallel wave — align when published |
| PrintSpinePanel delete | dev-fe | Post-G4 chore |
| `contracts_printable_ready` | — | **Cấm** until program gate |

---

## J. Completion contract (G3 target)

| Field | Value |
|-------|--------|
| **entry_criteria** | ADR G2 PASS · BA-02 CONFIRM · SA Option A portal locked |
| **exit_criteria** | Workspace wired CC + profile; legacy EmployeeContracts dialog deprecated; vitest PASS; `READY_FOR_QA` for G4 |
| **evidence_path** | `docs/qa/evidence/po-hrm-ctr-workspace-fe-g3.md` |
| **ack_status** | `READY_FOR_QA` (dev-fe handoff) |
| **next_owner** | **qa** (`PO-HRM-CTR-WORKSPACE-WAVE-G4`) |
