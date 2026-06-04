---
name: quality-gate
description: Applies QA and QC release governance with defect closure checks, traceability evidence, and Go/No-Go recommendations. Use when validating test results or release readiness.
---

# Quality Gate

## When to use
- Test cycle execution, bug triage, regression validation.
- Release gate review or final acceptance decisions.

## Gate checklist
- Requirement-to-test traceability exists.
- Blocker/critical defects are resolved or explicitly waived by authority.
- Automation and UAT evidence are attached with reproducible steps.
- Build, migration, and runtime checks are logged.
- **Evidence pack verify PASS** before QC dispatch: `pnpm run verify:qc:evidence-pack -- --evidence <qa-md>`
- Reform plan: `docs/program/QC_ZERO_DEFECT_REFORM_PLAN.md`
- Pre-merge checklist is completed:
  - `.cursor/templates/PRE_MERGE_CHECKLIST_TEMPLATE.md`

## QA responsibilities
- Execute test strategy and report deterministic failures.
- Maintain defect lifecycle: open -> fix verify -> retest -> close.

## QC responsibilities
- Audit completeness of handoff and test evidence.
- Issue Go/No-Go recommendation to PM and Technical Manager.

## Output template
- Gate: `A|B|C|D|E`
- Status: `GO|NO-GO`
- Risks:
- Blocking defects:
- Evidence paths:
- Next actions + owners:
