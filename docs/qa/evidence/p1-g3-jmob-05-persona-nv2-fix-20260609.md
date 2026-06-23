# P1-G3-JMOB-05-PERSONA-NV2-FIX — mobile manager JWT + leave balance probe

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-G3-JMOB-05-PERSONA-NV2-FIX` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** (`P1-G3-JMOB-05-STRICT-R4`) |

---

## Executive verdict

**READY_FOR_QA** — Repo closes nip.io persona gate for `uat.nv0002@xe.vn`: `resolveRolesForEmployee` issues `manager` via COO title + `mobile_persona:mgr` + `is_manager:true` + direct-report fallback; `refresh` re-derives roles from DB (no stale `employee`-only JWT); seed `UAT_MOB_SEQ=2` forces TRS-0002 / trsport persona row. Jest **23/23** PASS; `nest build` exit **0**. **nip.io pre-deploy probe still FAIL** (`roles=["employee"]` despite `job_title_key=COO`) — needs **devops deploy + `UAT_MOB_SEQ=2` reseed** before device strict R4.

---

## Root cause (nip.io @ R3)

| Signal | nip.io (pre-deploy) | Expected after fix |
|--------|---------------------|-------------------|
| `POST /auth/mobile/login` nv0002 `job_title_key` | `COO` | `COO` |
| JWT `roles` | `["employee"]` only | `["employee","manager"]` |
| Login `is_manager` | `undefined` (field absent on old build) | `true` |
| `GET /home/summary` `viewer.is_manager` | `false` | `true` |
| Approve tile route | Thông báo (EMP «Việc») | ManagerApprovals (MGR «Duyệt») |

Pilot API lacks `resolveRolesForEmployee` / `applyMobilePersonaRoleOverride` / login `is_manager` envelope — COO title alone does not promote manager on deployed build.

---

## BE changes (this wave)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/auth/mobile-auth.service.ts` | `resolveRolesForEmployee` — COO/CFO/CTO/SUPERVISOR/DIRECTOR + `mobile_persona` mgr/emp + `is_manager:true` + `countDirectReports` fallback; login returns `is_manager`; **refresh re-loads employee row and re-derives roles** |
| `scripts/seed-hrm-uat-mob-pilot-qual.mjs` | `UAT_COMPANIES` lookup for `loadUatCeo`; persona map seq1 `STAFF/emp`, seq2 `COO/mgr`; writes `is_manager` custom field |
| `apps/api/hrm-api/src/auth/mobile-auth.service.spec.ts` | P1-G3-JMOB-05 regressions incl. refresh role promotion |
| `apps/api/hrm-api/src/common/p1-g3-jmob-05-persona-nv2-fix.spec.ts` | COO + home/summary `is_manager:true` integration |

---

## Leave balance nv0001 investigation (8/3 vs device 0/0)

| Check | nip.io API | Verdict |
|-------|------------|---------|
| `uat.nv0001@xe.vn` + `company_id=holding` `GET /attendance/leave-balance` | **200** `available_days=8` `used_days=3` `source=employee_leave_balances` | **PASS — no BE scope/query bug** |
| `uat.nv0002@xe.vn` balance with `company_id=holding` (wrong slug) | empty / undefined | **Expected** — trsport JWT must use `trsport` slug |
| R3 device «0/0» on nv0001 regression | QA ran under **nv0002 deep-link session** | Device showed balance for **wrong employee / default zeros**, not API failure |

**Conclusion:** leave-balance service + `normalizePayrollListCompanyId` parity already correct (see `leave-balance.service.spec.ts` PCOMP-W7-MOB-LEAVE-BAL). R4 QA must re-login `uat.nv0001@xe.vn` before J-MOB-25 balance assertion.

---

## Verification commands

```powershell
# Unit + integration
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="mobile-auth.service.spec|p1-g3-jmob-05-persona-nv2-fix|leave-balance.service.spec" --no-coverage
pnpm run build

# Local seed (manager queue + persona flags)
cd <repo-root>
$env:UAT_MOB_SEQ=2; node scripts/seed-hrm-uat-mob-pilot-qual.mjs

# Post-deploy nip.io gate (expect manager after devops)
node -e "const API='https://14-225-217-232.nip.io'; ..."
```

| Gate | Result |
|------|--------|
| jest targeted | **23/23 PASS** |
| `nest build` | exit **0** |
| Local `UAT_MOB_SEQ=2` seed | exit **0** — `sub_reports_to_ceo=1`, pending leave/update **1** |
| nip.io nv0002 `roles` + `is_manager` | **FAIL pre-deploy** (documented above) |
| nip.io nv0001 leave-balance 8/3 | **PASS** |

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-JMOB05-DEPLOY-01 | **P0** | Deploy hrm-api with this commit to nip.io | `devops` |
| R-JMOB05-RESEED-02 | **P0** | `UAT_MOB_SEQ=2 node scripts/seed-hrm-uat-mob-pilot-qual.mjs` on pilot DB after deploy | `devops` |
| R-NV1-LEAVE-BAL-DEVICE-01 | P2 | R4 retest nv0001 balance on device after fresh nv0001 login | `qa-device` |

---

## completion_report

Closed BE scope for `P1-G3-JMOB-05-PERSONA-NV2-FIX`: manager JWT derivation (COO + seed persona + direct reports + refresh re-derive), seed trsport lookup fix, leave-balance investigation confirms API 8/3 for nv0001 — device 0/0 was session/persona mismatch not query bug. Tests/build PASS; nip.io still on old binary until devops deploy.

## next_owner

`qa` (after `devops` deploy+reseed) → `qa-device` strict R4

## next_dispatch_prompt

```
work_item_id: P1-G3-JMOB-05-STRICT-R4
from_role: pm
to_role: qa-device
entry_criteria: devops deployed hrm-api with P1-G3-JMOB-05-PERSONA-NV2-FIX + UAT_MOB_SEQ=2 reseed; nip.io login uat.nv0002@xe.vn → roles includes manager, is_manager=true, home/summary viewer.is_manager=true
exit_criteria: emulator-5554 @ nip.io — nv0002 home-action-tile-approve → ManagerApprovals ≥30k XML → Duyệt → Thành công no 409; nv0001 fresh login → leave list balance header 8/3; evidence docs/qa/evidence/p1-g3-jmob-05-strict-r4-20260609.md PASS_TO_PM
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-g3-jmob-05-strict-r4-20260609.md
```

## pm_dispatch_hint

`devops` deploy hrm-api + `UAT_MOB_SEQ=2` reseed **before** qa-device R4 — nip.io probe 2026-06-09 still `roles=["employee"]` for nv0002 COO row.
