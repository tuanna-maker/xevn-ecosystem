# CD-FB-07-WF-DYNAMIC-BE-FIX-01 — Leave direct_manager company_id TEXT + assignee

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-WF-DYNAMIC-BE-FIX-01` |
| **Date** | 2026-07-19 |
| **Role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620 §5.1 / §6 / R-WF-01 · F4 AC-CD-F4-01..02 · BR-CD-F4-02/04 |
| **U65** | Zero-seed · no inbox seed · product `instances/start` only |

---

## Root cause (QA FAIL)

1. **P0 (dispatch):** `LeaveWorkflowBridge.resolveManagerForWorkflow` used `e.company_id = $n::uuid` while `employees.company_id` is **TEXT** (`holding`) → `text = uuid` / `HRM-SYS-001` when XBOS always passes `company_id` → manager null → escalate `group_ceo`.
2. **Residual (live after cast fix):** manager resolved `uat.nv0001@xe.vn` but `ResolverRegistry.resolveDirectManager` required `isUserActive` via `xbos_user_tenant_membership` — UAT manager has **0** membership / portal rows → still escalated.

---

## Fix

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts` | `expandWorkflowResolverCompanyIds` (`main`→`holding`, UUID↔slug); filter `e.company_id = ANY($n::text[])` — never `::uuid` |
| `apps/api/hrm-api/src/attendance/leave-workflow.bridge.spec.ts` | slug + UUID → manager; assert no `company_id = $n::uuid` |
| `apps/api/xbos-api/src/workflow-engine/resolver-registry.ts` | Assign when HRM returns manager email; membership not required for `direct_manager` (ADR empty-set = null manager only) |
| `apps/api/xbos-api/src/workflow-engine/resolver-registry.spec.ts` | CD-FB-07: manager without membership still `direct_manager` / `escalated:false` |

**Path note:** registry touch justified — exit #3 blocked after cast fix by membership gate; allowed_paths already permitted `resolver-data-source` “if needed”; registry is the ADR-correct seam.

**must_keep:** CatalogWorkflowBridge; F4 resolver enum; terminal leave callback; fixed_user still uses `isUserActive` → 422.

---

## Verification

### Jest

```text
hrm-api leave-workflow.bridge.spec.ts     6/6 PASS
xbos-api resolver-registry.spec.ts        6/6 PASS
```

### Live resolver matrix (HLD-0006 = `8ac84520-0d6b-4737-8341-2f9a929b5f81`)

| `company_id` | HTTP | `manager_user_id` |
|--------------|------|-------------------|
| _(omit)_ | 200 | `uat.nv0001@xe.vn` |
| `holding` | 200 | `uat.nv0001@xe.vn` |
| `10000000-0000-4000-8000-000000000001` | 200 | `uat.nv0001@xe.vn` |

### Live `POST /api/xbos/workflow-engine/instances/start`

```text
workflowCode=hrm_leave_approval
submitter.employeeId=8ac84520-0d6b-4737-8341-2f9a929b5f81
submitter.companyId=10000000-0000-4000-8000-000000000001
→ 201 XBOS-WF-201
instance=ecf1df0f-b43c-443d-9a61-f092a150309b
```

| assignee | hat_key | resolvedVia | escalated |
|----------|---------|-------------|-----------|
| `uat.nv0001@xe.vn` | `direct_manager` | `direct_manager` | **false** |

**VERDICT live start: PASS** (was ceo/admin + `group_ceo` escalation).

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| D-CD-FB-07-FE-LEAVE-SOFTNAV | P2 | dev-fe | Portal iframe attendance soft-nav (from QA) — out of BE scope |
| AC-CD-F4-03..07 | — | qa | Parallel / canvas / reject / FE create→inbox — retest after this fix |

---

## completion_report

Closed: TEXT company_id cast P0 + direct_manager membership gate residual; jest 12/12; live start assignee `uat.nv0001@xe.vn` / `resolvedVia=direct_manager` / `escalated=false`. Residual FE soft-nav + AC-03..07 → QA.

**next_owner:** qa  
**ack_status:** READY_FOR_QA  
**evidence_path:** `docs/qa/evidence/cd-fb-07-wf-dynamic-be-fix-01-20260719.md`

### next_dispatch_prompt

```text
work_item_id: CD-FB-07-WF-DYNAMIC-QA-R2
from_role: pm
to_role: qa
lane: execution
entry_criteria: BE READY_FOR_QA docs/qa/evidence/cd-fb-07-wf-dynamic-be-fix-01-20260719.md; L0 hrm+xbos up; U65 zero-seed
exit_criteria: AC-CD-F4-01/02 — leave spawn inbox assignee uat.nv0001@xe.vn resolvedVia=direct_manager escalated=false (browser FE create if soft-nav allows, else product instances/start + resolver matrix slug+UUID 200); evidence docs/qa/evidence/cd-fb-07-wf-dynamic-qa-r2-YYYYMMDD.md; PASS_TO_PM or FAIL with residual
cấm: seed; inbox seed; Phase1/PROD claim
```
