---
name: team-orchestration
description: Operates a 10-role delivery team with deterministic dispatch, handoff packets, and evidence-first status control. Use when planning, assigning, or tracking cross-role work.
---

**Global mirror:** `~/.cursor/skills/team-orchestration/SKILL.md` · Playbook: `docs/program/TEAM_ORCHESTRATION_PLAYBOOK.md`

# Team Orchestration

## When to use
- Multi-role delivery requests spanning PM/SA/BA/Dev/QA/QC.
- Any request asking for team coordination, dispatch, or progress control.

## Required workflow
1. Read the project's active dispatch queue artifact and identify top priorities.
2. Read `docs/program/PROGRAM_JOURNEY_MAP.md` — include **J-*** ids in QA dispatch (L2.5).
3. **U16:** Default dispatch **execution** (`dev-be`, `dev-fe`, `dev-mobile`, `qa`). Governance (`sa`, `ba-*`, `technical-manager`, `qc`) only on trigger or post-QA wave — see `GOVERNANCE_IMPROVEMENT_LOOP.md`.
3. Dispatch with owner, due window, entry criteria, exit criteria, evidence target; tag bus `lane: execution` | `lane: governance`.
4. Enforce handoff packet fields:
   - `work_item_id`, `from_role`, `to_role`, `entry_criteria`, `exit_criteria`, `evidence_path`, `needed_by`, `ack_status`
5. Align assignments with `.cursor/team/ROLE_SKILL_PHASE_MAP.md`.
6. **BRD/SRS HTML gửi khách:** dispatch BA/SA với skill `client-delivery-docs`; exit = `pnpm docs:client-delivery:html` `ok=true`, không meta agent trong HTML.
7. Update project coordination artifacts (board, control tower, message bus).
8. After governance review: update Cursor per `GOVERNANCE_IMPROVEMENT_LOOP.md` + registry.
9. Escalate blockers to PM when ACK/evidence SLAs are missed.

## Done criteria
- No item marked DONE without concrete evidence path.
- Cross-role dependency has explicit next owner and ACK.
