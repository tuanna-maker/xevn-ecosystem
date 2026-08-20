import pathlib

target = pathlib.Path(r'C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\docs\program\REMAINING_WORK_2026-07-29.md')

content = r'''# Remaining Work Audit — XeVN OS Phase 1

**Date:** 2026-07-29

**Source docs:** `PROJECT_STATUS_REPORT.md` · `PM_PIPELINE_RECOVERY_2026-07-29.md` · `PM_LOOP_QUEUE_REDESIGN_2026-07-29.md` · `SPRINT_S6_REPORT_2026-07-29.md` · `UX-UI-ERP-REMAINING-SYNTHESIS.md` · `docs/qa/evidence/qc-ux-wave-b-01-20260728.md` · `docs/program/PM_OPEN_BACKLOG.json` · `docs/program/PM_PENDING_PIPELINE.json`

---

## 1. Already DONE / CLOSED / GWC (excluded from backlog)

| Category | Verdict | Evidence |
|----------|---------|----------|
| W1 HRM embed zero-mock | CLOSED GWC | M-HRM-01..11 — `pcomp-w1-qc-01/02-20260607.md` |
| W2 Portal legacy mock M-CC-01..15 | CLOSED GWC | `pcomp-w2-qc-06-20260607.md` |
| W3 BE integrity & scope | CLOSED GWC | P0-1..4 live + R3 — `qc-p1-prod-int-gate-r3-20260607.md` |
| W4 Mobile scope parity | API PASS | vitest 50/50 — `pcomp-w4-qa-01-20260607.md` |
| W5 Verification & QC | GO WITH CONDITIONS | exit 0; L0+L1+L2 13/13 — `pcomp-w5-qc-01-20260607.md` |
| Wave A UX (UX-03, D5, UX-09, WCAG R3m, A-TOKEN) | CLOSED GWC | `UX-UI-ERP-REMAINING-SYNTHESIS.md` §15:03 |
| P0-c Payroll useReducer v1 | CLOSED, reopened, PASS R2 | `qa-ux-p0c-01-20260728.md` → reopened `DEF-P0C-ADV-01` → `qa-ux-p0c-01-r2-20260728.md` |
| Profile C2 tabs | CLOSED PASS | `qa-ux-profile-c2-01-20260728.md` |
| Wave B EmptyState UX-10 | GWC | runtime PASS, hardFails=[] — `qc-ux-wave-b-01-20260728.md` |
| Wave B PermissionFallback UX-07 | GWC | runtime PASS, hardFails=[] — `qc-ux-wave-b-01-20260728.md` |
| PM sync PCOMP-W6-PM-01 | CLOSED | `verify:product:completion` exit 0 |

These are out of scope for the backlog. Program is **NOT Phase 1 DONE**, **NOT PROD-ready**, HOLD_DEPLOY active.

---

## 2. Real remaining items (not yet closed), grouped by severity

### P0 (blocks execution / program recovery)

| ID | Owner | AC / Required outcome | Evidence citation |
|----|-------|----------------------|-------------------|
| HOOK-qa-276034_5 | qc | Re-run narrow probe on ERP fidelity multi-domain spot; emit bus INTAKE + PM→qc DISPATCHED | `PM_PIPELINE_RECOVERY_2026-07-29.md` §1; `SPRINT_S6_REPORT_2026-07-29.md` |
| HOOK-qa-309fd5_5 | qc | Re-run narrow probe on HRM settings picker spot; emit bus INTAKE + PM→qc DISPATCHED | `PM_PIPELINE_RECOVERY_2026-07-29.md` §1; `SPRINT_S6_REPORT_2026-07-29.md` |
| HRM-MD-PICKER-SPOT-01 | qc | Accept current qa→pm PASS_TO_PM; issue explicit PM→qc DISPATCHED | `PM_PENDING_PIPELINE.json` `dispatchRequired[2]`; `PM_PIPELINE_RECOVERY_2026-07-29.md` §1 |

**Root cause for all three:** Vite/OneDrive `.vite/deps` EPERM during dev-server startup caused subagent-stop hook to suppress followup generation — QA evidence exists but bus INTAKE/DISPATCHED handoff was never written (28 suppressed followups total). Fix: rerun Vite builds outside OneDrive or with `.vite` cache excluded.

### P1 (blocks program closure but localhost UAT can proceed)

| ID | Owner | AC / Required outcome | Evidence citation |
|----|-------|----------------------|-------------------|
| MOB-XEVN-BRAND-TOKENS-L1-01 | qc | Brand token L1 verification; emit qc→pm verdict with evidence path | `PM_OPEN_BACKLOG.json` `dispatchRequired[0]` |
| MOB-XEVN-BRAND-PRIMITIVES-L2-01 | qc | Brand primitives L2 verification; emit qc→pm verdict with evidence path | `PM_OPEN_BACKLOG.json` `dispatchRequired[1]` |
| HRM-EMP-COMPANY-COL-01 | qc | Company-col sync visual regression; emit qc→pm verdict | `PM_OPEN_BACKLOG.json` `dispatchRequired[2]`; `PM_PENDING_PIPELINE.json` `dispatchRequired[2]` |
| MOB-SPEC-ORPHAN-CODE-SAMPLE-01 | qa | Orphan code sample audit; emit qa→pm READY_FOR_QC or FIXED | `PM_OPEN_BACKLOG.json` `dispatchRequired[3]` |
| P1-EX-QA-HTTPS-RESIDUAL-03-R3 | qc | HTTPS residual R3 verification; appears in both dispatchRequired and inFlight — reconcile | `PM_PENDING_PIPELINE.json` (`dispatchRequired[0]` + `inFlight[0]`); `SPRINT_S6_REPORT_2026-07-29.md` |
| HRM-SETTINGS-MASTER-DATA-01 | qa | Master data settlement QA probe; emit qa→pm PASS_TO_PM or FIXED | `PM_OPEN_BACKLOG.json` `dispatchRequired[5]` |

### P2 (does not block localhost UAT; deferred to S8+)

| ID | Owner | AC / Note | Evidence citation |
|----|-------|-----------|-------------------|
| R-ES-BLAND-LIST | pm → fe | At least 2 DataTable surfaces still bland empty; outside Wave B DoD | `qc-ux-wave-b-01-20260728.md` §198 |
| R-C2-01 | pm / ba | Deny-persona live DOM + mailto under non-portal JWT — P3 KEEP (cấm remove portal bypass) | `qc-ux-wave-b-01-20260728.md` §198; `PROJECT_STATUS_REPORT.md` §2 |
| C-HRMQC-01 | devops | VPS :8088 retest — deferred until user explicitly requests deploy | `PM_PENDING_PIPELINE.json` `defer[0]`; `SPRINT_S6_REPORT_2026-07-29.md` |
| C-MOB-H9-DEVICE-01 | qa-device | adb device UI smoke — optional GWC; deferred until adb available | `PM_PENDING_PIPELINE.json` `defer[1]` |

**Active governance locks (must not be removed):**
- HOLD_DEPLOY — no deploy; NOT Phase1/PROD DONE
- U65 zero-seed — no seed data; portal bypass must remain (`portal.xe.vn` / localhost JWT only)
- Wave B residuals: R-QA-WAVEB-PACK (P3 process — amend QA MDs for 8/8 evidence-pack headings); orphan Advance Dialog (P2 info — not live CTA)
- Legacy: corp domain `portal.xe.vn` DNS/TLS BLOCKED (W14 lane) — not a current sprint blocker but must not be claimed closed

---

## 3. Sprint suggestions — S8 W6 UAT prep & S9 PROD readiness

Framing references: `docs/program/PM_LOOP_QUEUE_REDESIGN_2026-07-29.md` (state machine §2), `PM_PIPELINE_RECOVERY_2026-07-29.md` §4, `PROJECT_STATUS_REPORT.md` §6 (PM dispatch focus), `UX-UI-ERP-REMAINING-SYNTHESIS.md` §2 (owner-chốt execution order).

### S8 — Week 6: UAT prep + pipeline recovery

**Goal:** Clean the dispatch pipeline, complete UAT primer, lock remaining P0/P1 items.

| Day | Work item | Owner | Success criterion |
|-----|-----------|-------|-------------------|
| S8-D1 | Fix OneDrive `.vite` EPERM — rerun Vite FE build outside OneDrive or with `VITE_CACHE_DIR` excluded | dev-fe + devops | Build completes without EPERM; suppressed followups recoverable |
| S8-D1 | Re-run HOOK-qa-276034_5 + HOOK-qa-309fd5_5 as narrow probes | qc | Evidence emitted + bus INTAKE/DISPATCHED written; `followupSuppressedCount` reduces |
| S8-D2 | Dispatch HRM-MD-PICKER-SPOT-01 to qc (PM→qc explicit DISPATCHED) | pm | Item appears in `inFlight`, not `dispatchRequired` |
| S8-D2 | Dispatch 4 brand/company-col/settings P1 items to qc/qa per PM_OPEN_BACKLOG `dispatchRequired[0-5]` | pm | All 4 appear in `inFlight` |
| S8-D3 | Reconcile P1-EX-QA-HTTPS-RESIDUAL-03-R3 (currently in both dispatchRequired and inFlight) | pm | Single authoritative state in `PM_PENDING_PIPELINE.json` |
| S8-D4 | UAT primer — assemble sponsor UAT pack: W1–W5 QC evidence + Wave B GWC slice + ILA layout scorecard (G8 target >=16/20 on 5 mandatory screens) | pm | `docs/program/UAT_PRIMER_2026-08-04.md` (evidence index + What to verify checklist) |

**PM loop rule for S8:** Adopt redesigned state machine from `PM_LOOP_QUEUE_REDESIGN_2026-07-29.md` §2 (SCAN → TRIAGE → DISPATCH → WAIT → RECOVER → CLOSE). One Task per work item per turn. 7-minute watchdog timeout on WAIT.

### S9 — Week 7+: PROD readiness

**Goal:** Address PROD blockers, close P2 residuals, prepare for W6 sponsor UAT sign-off.

| Work track | Owner | Acceptance criteria |
|------------|-------|---------------------|
| G8 Mobile layout composition — close remaining ILA FAIL screens (Home 12/20, Approval 13/20; Nghỉ phép 14/20 is GWC) | dev-mobile + qa-device | ILA score >=16/20 on all 5 required screens; `pnpm run verify:mobile:layout` exit 0 |
| P6 PROD gates (DNS/TLS for `portal.xe.vn`, nip.io HTTPS, W14 prod gate) | devops | W14 QC prod gate entry criteria met — `p1-p100-w14-qc-prod-20260601.md` conditions cleared |
| W6 Sponsor UAT session (PCOMP-W6-SP-01) | sponsor + pm | Sponsor sign-off on UAT primer artifacts; `docs/program/evidence/pcomp-w6-pm-01-YYYYMMDD.md` updated |
| R-ES-BLAND-LIST — at least 2 empty DataTable surfaces upgraded from bland to EmptyState | dev-fe + qa | Non-bland empty states on >=2 lists; new `qa-ux-*` MD with runtime PASS |
| R-C2-01 — deny-persona coverage under non-portal JWT | dev-fe + qa-ux | Deny live DOM + mailto confirmed; can remove KEEP flag |
| P1-EX-QA-HTTPS-RESIDUAL-03-R3 finalization | qc + devops | HTTPS residual closed with PASS or DEFERRED verdict |
| Optional: D-UX-EMPTY-BLAND-LIST-01, D-UX-I18N-HARDCODE-01 — do not block PROD | dev-fe | Optional; defer if G8/PROD blockers remain open |

**Exit criteria for S9 (PROD readiness declaration — NOT deploy):**
- G8 ILA >=16/20 on all required screens (not deploy, not Phase 1 DONE declaration)
- W6 sponsor UAT sign-off recorded
- All P0/P1 pipeline items CLOSED or FIXED
- HOLD_DEPLOY remains active until explicit user deploy request
- Corp domain PROD path (W14) documented but still requires user deploy trigger for C-HRMQC-01

---

## 4. Critical constraints for any sprint execution

1. **HOLD_DEPLOY** — no deploy unless user explicitly requests it. C-HRMQC-01 stays deferred.
2. **U65 zero-seed** — must remain `seed: false`; no seed injection in any QA or UAT run.
3. **Portal bypass must remain** — do not remove localhost JWT / portal bypass; R-C2-01 deny-persona coverage is deferred to PROD, not a product NO-GO.
4. **OneDrive `.vite` EPERM** — fix before any further dev-server runs; otherwise suppressed followups will continue (28 current).
5. **PM loop: one Task per work item per turn** — stop-gate suppressed followups (28 current) by never dispatching >1 Task per turn.
6. **G8 mobile ILA >=16/20** — current slice averages ~14.5/20; this is the last hard sponsor blocker before UAT sign-off.

*This document is read-only audit output. No code was modified. No bus state was changed.*
'''

target.write_text(content, encoding='utf-8')
print('wrote full report:', len(content), 'bytes,', len(content.split('\n')), 'lines')
print('size on disk:', target.stat().st_size)
