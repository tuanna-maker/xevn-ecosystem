# Governance artifact registry — Cursor ecosystem

PM/SA/BA/TA **được phép cập nhật** sau vòng thảo luận governance (`GOVERNANCE_IMPROVEMENT_LOOP.md`). Dev/QA **đề xuất** qua evidence; PM merge.

## Artifact types

| Type | Path pattern | Owner merge |
|------|--------------|-------------|
| Rules | `.cursor/rules/*.mdc` | PM |
| Agent prompts | `.cursor/agents/*.md` | PM + role |
| Skills | `.cursor/skills/*/SKILL.md` | PM + role |
| Knowledge | `.cursor/knowledge-base/*.md`, `docs/program/knowledge/*.md` | PM + role |
| Hooks | `.cursor/hooks/*.mjs`, `.cursor/hooks.json` | PM + TM |
| Team bus (mirror) | `.cursor/team/AGENT_MESSAGE_BUS.md` | PM |
| Program bus (SoT) | `docs/program/AGENT_MESSAGE_BUS.md` | PM |
| User policy lock | `docs/program/TEAM_USER_REQUIREMENTS.md` | PM (sau lệnh user) |
| Prompt queue | `docs/program/TEAM_PROMPT_QUEUE.json` | PM |
| Templates | `.cursor/templates/*` | BA / PM |

## Change log (governance)

| Date | Role | Artifact | Change summary |
|------|------|----------|----------------|
| 2026-05-24 | PM | `team-execution-vs-governance.mdc` | U16 — execution vs governance lanes |
| 2026-05-24 | PM | `uat-production-readiness-orchestration.mdc` | U19 — journey map, L2.5, PM accountability |
| 2026-05-24 | PM | `PROGRAM_JOURNEY_MAP.md` | End-to-end J-* SoT for orchestration |
| 2026-05-24 | PM | `UAT_PRODUCTION_OPERATING_PLAN.md` | Cadence UAT→Prod RACI |
| 2026-05-24 | PM | `.cursor/agents/*.md` (pm, qa, qc, dev-be, dev-fe, sa, tm, ba-*, dev-mobile) | U19 proactive + L2.5 mandates |
| 2026-05-24 | PM | `PILOT_BUSINESS_FLOW_MATRIX.md` | J-HRM-* L2.5 section |
| 2026-05-24 | PM | `TEAM_USER_REQUIREMENTS.md` | U19 row |
| 2026-05-24 | PM | `GOVERNANCE_IMPROVEMENT_LOOP.md` | Vòng thảo luận → cập nhật Cursor |
| 2026-05-24 | PM | `TEAM_OPERATING_MODEL.md` | U16 operating model |
| 2026-05-24 | PM | `TEAM_USER_REQUIREMENTS.md` | U16 row |

*Append row when governance cycle updates any artifact — do not delete history.*
