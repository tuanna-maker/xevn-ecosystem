# Evidence — W1-B-01-QC-DIST-RESTORE

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-QC-DIST-RESTORE` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **lane** | narrow L3 — `hrm-api` dist→src restore (build inventory) |
| **priority** | P1 |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `w1b-01-be-dist-restore.md` READY_FOR_QA → `w1b-01-qa-dist-restore.md` PASS_TO_PM |
| **U65** | no seed · QC observe-only · no `apps/**` rewrite |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · full nest build / portal L2.5 |

---

## Verdict summary

**GO WITH CONDITIONS** — restore wave closes **R-HRM-DIST-MISSING** for `tsc -p tsconfig.build.json`. Independent QC: tsc **exit 0**; **10/10** restored src paths present; `hrm-settings-master-keys.ts` intact (**R-MASTER-KEYS stays CLOSED** — not reopened).

Condition (allowed): **R-LEAVE-DI P2** deferred to leave lane (out of restore scope).

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/w1b-01-be-dist-restore.md` | READY_FOR_QA; 10 modules restored; tsc 0; master-keys untouched | **ACCEPT** |
| `docs/qa/evidence/w1b-01-qa-dist-restore.md` | PASS_TO_PM; tsc 0; 10/10 + export parity; jest 27/27; R-HRM-DIST-MISSING CLOSED | **ACCEPT** |
| `docs/qa/evidence/w1b-01-qa-master-keys.md` | R-MASTER-KEYS CLOSED; leave_types / hr_decision_types | **CONTEXT — do not reopen** |

---

## Independent spot-check (QC)

### EC1 — tsc claim credible

```text
pnpm --filter hrm-api exec tsc --noEmit -p tsconfig.build.json
→ EXIT 0 (QC re-run 2026-08-03)
```

**PASS** — QA/BE claim reproduced.

### EC2 — 10 restored paths under `apps/api/hrm-api/src`

| # | Path | Disk |
|---|------|------|
| 1 | `attendance/dto/create-attendance-sheet.dto.ts` | OK |
| 2 | `attendance/dto/update-attendance-sheet.dto.ts` | OK |
| 3 | `performance/dto/update-performance-cycle.dto.ts` | OK |
| 4 | `performance/dto/update-performance-evaluation.dto.ts` | OK |
| 5 | `settings-catalogs/dto/list-catalog-picker.query.dto.ts` | OK |
| 6 | `recruitment/dto/create-job-template.dto.ts` | OK |
| 7 | `recruitment/dto/update-job-template.dto.ts` | OK |
| 8 | `recruitment/hire-employee-link.ts` | OK |
| 9 | `recruitment/resolve-submitter-user-id.ts` | OK |
| 10 | `recruitment/recruitment-workflow.bridge.ts` | OK |

Export spot (sample): `CreateAttendanceSheetDto`; `HRM_REC_HIRE_400/409`; `resolveSubmitterUserIdFromAuth`; `RecruitmentWorkflowBridge` + WF codes / `mapRecTaskTypeToStage` / `isRecruitmentWorkflowLocked`. `@CODE-MEMORY` + WorkItem `W1-B-01-BE-DIST-RESTORE` present on sampled restored files.

**PASS** — 10/10.

### EC3 — master-keys must_keep (R-MASTER-KEYS CLOSED)

| Check | Result |
|-------|--------|
| Path exists | `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts` |
| Size | **5976 bytes** (matches QA) |
| `HRM_SC_LEAVE_KEY = 'leave_types'` | **PASS** (L139) |
| `HRM_SC_DEC_STORAGE_KEY = 'hr_decision_types'` | **PASS** (L141) |
| Dist-restore rewrite of master-keys | **none** (no `W1-B-01-BE-DIST-RESTORE` / DIST-RESTORE stamp in file) |

**PASS** — leave_types / hr_decision_types **not wiped**. Do **not** reopen R-MASTER-KEYS.

---

## Residual disposition

| Id | Status | Notes |
|----|--------|-------|
| **R-HRM-DIST-MISSING** | **CLOSED** (closable → closed this gate) | tsc build project green + inventory restored |
| **R-MASTER-KEYS** | **CLOSED** (untouched) | Prior QA master-keys wave; confirmed present |
| **R-LEAVE-DI** | **OPEN P2 — CONDITION** | leave-requests.service.spec TS1128 ~L1296; leave lane; **not** restore blocker |
| nest `build` runtime | **OUT OF SCOPE** | Exit gate = tsc; not promoted |
| Product UAT / L2.5 J-* | **N/A this WI** | Build-restore only |

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | none blocking this restore slice |
| **PROCESS** | Product CRUD evidence-pack verify **2/8** on QA MD (`portal_url`, `journey_l25`) — **expected / waived** for narrow BE tsc-restore (not portal UF wave). Same pattern as OS-STD / docs L3 gates. |
| **ENV** | none |

ENV does not drive verdict. Process pack waiver does **not** equal product UAT GO.

---

## Evidence-pack gate note

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-01-qa-dist-restore.md
→ FAIL 2/8 (portal_url, journey_l25)
```

**Waiver (bounded):** wave scope = src restore + tsc; L2.5 J-* and portal URL **not in exit_criteria**. QC independent EC1–EC3 substitute for CRUD pack fields. Residual: if PM later promotes a portal/CRUD wave on same modules, require full pack.

---

## L2.5 J-* audit (U19)

**N/A** — no HRM/CC/mobile journey in-scope for this restore WI. Mandatory J-* rows not claimed PASS by this gate.

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not reopen / rewrite master-keys
- Did not claim product UAT DONE / Phase 1 DONE

---

## Conditions (explicit)

1. **R-LEAVE-DI P2** remains OPEN — owner leave lane / future `dev-be` leave WI; does not reopen R-HRM-DIST-MISSING.
2. Full `nest build` / live L0–L2.5 portal **not** signed by this gate.
3. **NOT Phase 1 DONE · NOT product UAT DONE.**

---

## completion_report

**Closed:** L3 narrow QC on W1-B-01 dist-restore chain. Independent tsc exit 0; 10/10 restored src paths; master-keys intact with `leave_types` / `hr_decision_types`. **R-HRM-DIST-MISSING CLOSED.** R-MASTER-KEYS remains CLOSED (not reopened).

**Residual / conditions:** R-LEAVE-DI P2 defer; nest build runtime OOS; product UAT not promoted.

**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/w1b-01-qc-dist-restore.md`

---

## next_dispatch_prompt

```text
work_item_id: W1-B-01-PM-DIST-RESTORE-CLOSE
role: pm
priority: P1
entry_criteria:
  - docs/qa/evidence/w1b-01-qc-dist-restore.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-HRM-DIST-MISSING CLOSED (tsc green + 10/10 inventory)
  - R-MASTER-KEYS CLOSED — do not reopen
action:
  1) Bus INTAKE W1-B-01-QC-DIST-RESTORE PASS_TO_PM + promote R-HRM-DIST-MISSING CLOSED on backlog / TEAM_WORKING_NOW
  2) Continue next open W1-B / PM_OPEN_BACKLOG item (do not idle)
  3) Defer R-LEAVE-DI to leave lane P2 only — not a restore reopen
  4) Do NOT claim product UAT DONE from this restore GWC
cấm: seed · rewrite leave/EMP/auth/master-keys · reopen R-MASTER-KEYS
```

---

## pm_dispatch_hint

`W1-B-01-PM-DIST-RESTORE-CLOSE` — promote R-HRM-DIST-MISSING CLOSED; keep R-MASTER-KEYS CLOSED; R-LEAVE-DI P2 defer; next backlog dispatch.
