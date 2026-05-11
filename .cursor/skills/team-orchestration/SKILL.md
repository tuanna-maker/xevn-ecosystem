---
name: team-orchestration
description: Operates a 10-role delivery team with deterministic dispatch, handoff packets, and evidence-first status control. Use when planning, assigning, or tracking cross-role work.
---

# Team Orchestration

## When to use
- Multi-role delivery requests spanning PM/SA/BA/Dev/QA/QC.
- Any request asking for team coordination, dispatch, or progress control.

## Required workflow
1. Read the project's active dispatch queue artifact and identify top priorities.
2. Dispatch with owner, due window, entry criteria, exit criteria, evidence target.
3. Enforce handoff packet fields:
   - `work_item_id`, `from_role`, `to_role`, `entry_criteria`, `exit_criteria`, `evidence_path`, `needed_by`, `ack_status`
4. Align assignments with `.cursor/team/ROLE_SKILL_PHASE_MAP.md`.
5. Update project coordination artifacts (board, control tower, message bus).
6. Escalate blockers to PM when ACK/evidence SLAs are missed.

## Done criteria
- No item marked DONE without concrete evidence path.
- Cross-role dependency has explicit next owner and ACK.
