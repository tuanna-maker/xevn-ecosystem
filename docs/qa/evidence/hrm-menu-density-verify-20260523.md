# HRM menu density verify — baseline (pre-fidelity seed)

**Date:** 2026-05-23  
**work_item_id:** `HRM-FIDELITY-DO` / `HRM-FIDELITY-QA`  
**Command:** `node scripts/verify-hrm-menu-data-density.mjs` (equivalent `pnpm run verify:hrm:menu-density`)  
**Expected:** FAIL until `pnpm run seed:hrm:fidelity` populates satellite tables  
**Exit code:** `1`

## Summary

| Result | Count |
|--------|-------|
| PASS | 5/7 |
| FAIL | 2/7 |

## Check output

```
verify-hrm-menu-data-density — xevn_hrm

PASS  employees  employees=1170 (need >=1000)
FAIL  contracts-ratio  contracts=101 active=1104 ratio=0.091 need>=0.85
FAIL  insurance-ratio  insurance=101 ratio need>=0.85
PASS  attendance-scale  attendance=72 need>=22
PASS  payroll-periods  payroll_periods=43 need>=10
PASS  recruitment-pipeline  requisitions=11 candidates=13 need>=5
PASS  leave-requests  leave_requests=12 need>=5

=== Summary: 5/7 PASS ===
```

## Blockers for G-FID-07

- **contracts-ratio:** 101 contracts vs 1104 active (~9% vs required ≥85%)
- **insurance-ratio:** 101 insurance rows vs same active baseline

## Next owner

| Role | Action |
|------|--------|
| Dev-BE | Ship `seed:hrm:fidelity` (`seed-hrm-satellite-from-workforce.mjs`) per `docs/ops/HRM_FIDELITY_SEED_RUNBOOK.md` §3–4 |
| DevOps | Re-run verify after seed; attach PASS evidence |
| QA | Persona matrix after verify PASS |

## References

- Runbook: `docs/ops/HRM_FIDELITY_SEED_RUNBOOK.md`
- Program: `docs/program/HRM_FULL_FIDELITY_PROGRAM.md`
- Bus snapshot: `docs/program/AGENT_MESSAGE_BUS.md` (`db_snapshot` on `HRM-FULL-FIDELITY-01`)
