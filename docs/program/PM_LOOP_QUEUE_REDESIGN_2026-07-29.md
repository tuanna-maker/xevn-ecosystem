# PM Loop + Round-Robin Queue Redesign — 2026-07-29

Source: current proxy/state files and active governance. All proposed changes remain recommendations unless further executed by PM.

## 1. Current failure modes

- `dispatchRequired` grows while `inFlight` does not drain.
- 28 suppressed followups mean completed QA/qc work disappears before PM can dispatch downstream.
- `subagent-stop` hook suppresses followup when restart loops hit the configured `loop_limit` (6 on subagent stop, 10 on PM stop).
- Task tool is not being invoked in the same chat turn as bus handoff, so work stays in prose instead of becoming a tracked Task.

## 2. Proposed PM loop state machine

States:
- SCAN -> parse PM_OPEN_BACKLOG + PM_PENDING_PIPELINE + bus tail.
- TRIAGE -> classify each item by role and next evidence dependency.
- DISPATCH -> invoke Task for the role and argument record in the same turn; write DISPATCHED to bus.
- WAIT -> await subagent stop with a watchdog timeout, not indefinite.
- RECOVER -> if stop reports suppressed/failed followup, regenerate the evidence or retry with a smaller scope; do not silently drop.
- CLOSE -> only when the work item is reflected as INTAKE + DISPATCHED + final evidence in docs/qa/evidence.

Transition rules:
- If SCAN finds any PASS_TO_PM with no DISPATCHED within 7 minutes, force DISPATCH.
- If followupSuppressed increments, re-enqueue the same work_item_id with reduced scope to one deliverable per turn.
- `PM_ORCHESTRATION_MODE` should remain RUN; STOP should only apply when the backlog is genuinely empty after RECOVER.

## 3. Suppressed followup recovery

- Each suppressed item should be retried with narrower scope: one work item = one observable deliverable.
- If two attempts remain suppressed, escalate to user/physical review instead of infinite silent retries.
- Keep a deduplicated suppressed log per work item so the loop stops retrying the same failure shape.

## 4. Bus + Task composition

- Bus handoff remains append-only provenance.
- Task tool becomes the actual execution signal; the bus is not a substitute for Task.
- After Task completes, the PM must append the resulting evidence reference in the same turn; do not leave it for the stop hook alone.

## 5. UX Wave B handoff (07-28 sponsor chốt)

- Lane A tokens/D1 and Lane C screen refactor are now in active execution.
- Wave B items (EmptyState, PermissionFallback, i18n) should be dispatched as a single package to dev-fe/qc with explicit acceptance criteria in UX-UI-ERP-REMAINING-SYNTHESIS.md §15:50.
- Do not start Wave B items while Wave C D5/P0-c regressions are still failing.
- Use PEER-PM COLAB rule: Claude owns docs and component draft; Cursor owns FE binding.

## 6. Action items

1. Re-scan PM_OPEN_BACKLOG and dispatch only clear PASS_TO_PM work items this turn.
2. Reopen the 2 P0 `HOOK-qa-*` items as narrow QA probes, not full waves.
3. Remove dependency on vscode.dev/docs path for active work; operate strictly inside repo paths.
4. Fix Windows/OneDrive `.vite` EPERM via explicit cache relocation or process exclusion before any further dev-server reruns.
5. Adopt one Task per work item per turn rule to prevent loop stalls.
6. Keep HOLD_DEPLOY active; redeploy only on explicit user request.
7. Do not close Phase 1 until W6 sponsor UAT and G8 are resolved.
