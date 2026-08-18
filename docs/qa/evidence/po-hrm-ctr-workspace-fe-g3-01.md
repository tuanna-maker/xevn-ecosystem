# PO-HRM-CTR-WORKSPACE-WAVE-G3 — FE evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-WAVE-G3` |
| **role** | dev-fe |
| **ack_status** | `READY_FOR_QA` |
| **next_wave** | `PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B` |
| **date** | 2026-08-11 |

## spec_read_ack

- `docs/program/specs/PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md` §2 §6 §7
- `docs/hrm/ui-screens/UI-CTR-WORKSPACE.md`
- `docs/architecture/ADR-HRM-CONTRACT-WORKSPACE-UNIFIED-01.md`
- `docs/program/slices/PO-HRM-CTR-WORKSPACE-G3.md`

## Closed scope

| Item | Implementation |
|------|----------------|
| Unified workspace | `ContractWorkspaceDialog` modes `create` \| `edit` \| `view` on `Contracts.tsx` |
| NV-first default | `subject_type: 'employee'`; Step1 tab **Nhân viên** before UV; `hideCandidateSubject` when profile/hire lock |
| View mode | `ContractWorkspaceViewBody` — 2-step read-only + `useContractPrintSpine` (In/PDF) |
| Profile launcher | `EmployeeContracts` → `openContractWorkspace` with `employee_id` + `lock_subject_employee` |
| REC hire CTA | `ContractHireCreateCta` on UV detail; post-hire navigate via `buildContractHireCtaPath` |
| Print spine | `useContractPrintSpine` hook; `ContractPrintSpinePanel` deprecated re-export only |
| Deep-link | `contractWorkspaceDeepLink.ts` + `location.search` effect on Contracts |
| Source lock | `contractWorkspace.source.test.ts` + updated `contractCreateWizard.source.test.ts` |

## Cấm verified

- No `contracts_printable_ready=true` in FE touched paths
- No registry-only eye dialog (`viewDialogOpen` removed from Contracts)
- No inline `body_vi` editor in workspace create/view
- No seed scripts invoked

## Verify commands

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/contractWorkspace.source.test.ts
pnpm exec vitest run src/lib/contractCreateWizard.source.test.ts
pnpm exec tsc --noEmit
```

**Results (2026-08-11):** vitest 24/24 PASS · tsc exit 0

## QA entry (G4 Phase B prep)

| UF / J | Persona | Click path |
|--------|---------|------------|
| CC Contracts create | `ceo@xe.vn` | HRM → Hợp đồng → Thêm → tab NV default → Lưu |
| CC Contracts view | `ceo@xe.vn` | List → eye → step 1 registry read-only → step 2 clause read-only → In/PDF |
| Profile NV | `ceo@xe.vn` | NV profile → tab HĐ → Thêm HĐ → workspace create NV locked |
| REC hire CTA | HR REC | UV đã gắn NV → «Tạo HĐ» → workspace create prefill |
| Deep-link | `ceo@xe.vn` | `/contracts?workspace=create&employee_id=…&lock_subject_employee=1` |

**hdsd_align:** `UI-CTR-WORKSPACE.md` · HDSD mutate testids `contractsFormDialog` / `contractsViewDialog`

## Residual (not G3)

- `ContractRegistryFields` / `ContractClauseCanvas` extract — deferred; Step1/Step2 adapters retained
- Profile renew-only legacy dialog (`max-w-2xl`) — must_keep per slice §D
- `ContractPrintSpinePanel` body not deleted (orphan, deprecated re-export)

## completion_report

G3 FE workspace unification delivered: single dialog shell, NV-first subject, view+print spine, profile/REC deep-links, vitest source lock PASS.

## next_owner

`qa`

## next_dispatch_prompt

```
work_item_id: PO-HRM-CTR-WORKSPACE-WAVE-G4-PHASE-B
role: qa
read_first:
- docs/qa/evidence/po-hrm-ctr-workspace-fe-g3-01.md
- docs/program/specs/PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md §6 §7
- docs/hrm/ui-screens/UI-CTR-WORKSPACE.md
entry_criteria: dev-fe READY_FOR_QA G3; L0 stack up; browser-only U65
exit_criteria: UF matrix rows for create/edit/view + J-HRM profile/REC CTA; Network 2xx + F5; PASS_TO_PM
persona: ceo@xe.vn / Xevn@2026
hdsd_align: UI-CTR-WORKSPACE.md inventory
cấm: seed; contracts_printable_ready flip; probe-only PASS
evidence_path: docs/qa/evidence/po-hrm-ctr-workspace-qa-g4-phase-b-01.md
```
