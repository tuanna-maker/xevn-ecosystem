# PM Orchestration KB

**Reuse-tag:** `pm-no-stop-after-qa`

## Context

User (2026-05-24): PM ends turn with "PM sẽ cho QA…" without dispatching — looks idle after every QA `PASS_TO_PM`.

## Action (mandatory every turn)

After any subagent verdict, PM **in the same turn** must execute ≥1 of:

1. `Task` dispatch with `work_item_id` + evidence paths, **or**
2. Terminal gate (`verify:*`, `test:*`, `phase1:gate`) + bus `DISPATCHED`/`PASS_TO_PM`, **or**
3. Code/fix hotfix for open defect (QA01-D-*) + re-run failing command.

**Forbidden closing lines:** "PM sẽ…", "tiếp theo sẽ…", "QA có thể…" **without** a tool call in that message.

## Sprint transition (2026-05-24)

**Problem:** S1 done + “S2 active” on runner but no visible plan → user sees idle PM.

**Action:** Same session as `P1-SN-PM-02`: publish `S2_SPRINT_BACKLOG` + glance + roadmap + **Task W0** + `verify:sprint:transition`.

**Team rule:** `.cursor/rules/team-sprint-transition.mdc` (alwaysApply).

**Automation:**

| Layer | Artifact |
|-------|----------|
| Gate script | `pnpm run verify:sprint:transition` |
| Hook hint | `scripts/lib/sprint-dispatch-hint.mjs` in stop/subagentStop followup |
| Playbook | `PM_ORCHESTRATION_PLAYBOOK.md` §3b |

`PM_ORCHESTRATION_MODE=RUN` + `PM_STOP_LOOP_MAX=5` = bounded auto-nudge (user tắt nếu treo máy).

## Outcome

Hook default `STOP`; continuity = PM executes in-chat + gates + Task dispatch. **Plan without dispatch = FAIL gate.**

## Evidence

- Rule: `.cursor/rules/pm-auto-mode-orchestration.mdc`, `.cursor/rules/pm-phase1-director-orchestration.mdc`
- Example fix: `scripts/lib/uat-db.mjs` — P6 uses `buildUatEmployee().employee_code` not hardcoded `UAT0001`

## Addendum 2026-05-28 � P1-EX-PM-CLOSE-LOOP-RESIDUAL-R2

### Context
QC evidence docs/qa/evidence/p1-ex-qc-https-residual-03-r2-20260528.md returned NO-GO with blocking residuals due to missing QA runtime execution proof.

### Action
PM executed close-loop admin cycle in same turn: bus INTAKE logged, QA execution retest dispatched (P1-EX-QA-HTTPS-RESIDUAL-03-R2), and pulse status aligned to Program DONE = NO.

### Outcome
Residual remains open until QA publishes execution evidence and QC re-gates. Program cannot be marked DONE in this cycle.

### Evidence
- docs/qa/evidence/p1-ex-qc-https-residual-03-r2-20260528.md
- docs/program/AGENT_MESSAGE_BUS.md
- docs/program/PM_LIVE_PULSE.md

### Reuse-tag
pm-close-loop-residual-r2

## Addendum 2026-06-08 ? U58 idle taxonomy (sponsor ?l?i d?ng?)

### Context
PM �? c� U43/U45 nh?ng v?n idle: ?k? ti?p pipeline ? s? Task ti?p?, b?ng APK SHA, `pm:scan:backlog` exit 0 trong khi bus `MOB-UX-*` INTAKE ch?a DISPATCHED (scanner ch? match `P1-*`).

### Action
1. Rule `.cursor/rules/pm-idle-detection-and-recovery.mdc` ? class A?J + recovery protocol.
2. `scripts/lib/pm-work-item-id.mjs` ? canonical ID regex (MOB, D-MOB, C, J-MOB, ?).
3. `pnpm run pm:idle:check` ? backlog + subagent + bus INTAKE gap; exit 2 ? Task b?t bu?c.
4. `pm-backlog-scan` ? subagentStop pending + evidence `next_dispatch_prompt` + qa-device ? qc.

### Outcome
**Idle = no Task/Shell in message**, kh�ng ph?i ?PM �? hi?u vi?c k??. Scan exit 0 alone ? idle h?p l?.

### Evidence
- Sponsor feedback 2026-06-08 session (D-MOB-UX-10d-QA-01 pipeline stall)
- `docs/program/PM_ORCHESTRATION_STATE.json` `last_pm_tool_proof`

### Reuse-tag
pm-idle-taxonomy-u58

### Copy-ready next dispatch prompt (target owner: qa)
Dispatch qa immediately for work_item_id P1-EX-QA-HTTPS-RESIDUAL-03-R2 (execution, not prep) on https://14-225-217-232.nip.io with ceo@xe.vn. Run both residual gates from docs/qa/evidence/p1-ex-qa-https-residual-03-r2-prep-20260528.md and publish a new execution evidence file containing: (1) auth 5-endpoint status table, (2) attendance fallback counts before/after "Kiem tra lai", (3) attendance probe status/code/message, (4) console + HTTP excerpts, and explicit PASS/FAIL verdict.

## Addendum 2026-06-20 — U60 subagent warming/CDN recovery

### Context
Sponsor: subagent «warming up» lâu; CDN/browser lệnh treo/error; PM phải phát hiện và spawn mới.

### Action
1. `scripts/lib/pm-subagent-status.mjs` — `warming_up_stuck`, `browser_tool_hang`, `transcript_error_pattern`, `subagent_error_stop`
2. `pnpm run pm:subagent:recover` → `docs/program/PM_SUBAGENT_RECOVERY.json` + exit 2
3. `pm:idle:check` gộp recovery dispatch
4. Rule `.cursor/rules/pm-subagent-health-recovery.mdc`

### Outcome
PM không chờ zombie >90s warming / >3m browser — Task MỚI shell-first.

### Reuse-tag
pm-subagent-recovery-u60
