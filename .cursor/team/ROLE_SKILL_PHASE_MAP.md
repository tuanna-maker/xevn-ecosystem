# Role-Skill Phase Map (Global Team Standard)

## Phase 1 - Discovery and Framing
- PM: `product-discovery`, `team-governance-review`
- SA: `solution-optioning`
- BA-Process / BA-Data: `business-analysis-pack`
- Technical Manager: `team-governance-review`
- Expected outputs:
  - PRD draft (`.cursor/templates/PRD_TEMPLATE.md`)
  - Initial options (`.cursor/templates/ADR_OPTION_TEMPLATE.md`)

## Phase 2 - Analysis and Architecture
- SA: `solution-optioning`
- BA roles: `business-analysis-pack`
- Dev-BE Lead: `solution-optioning`
- PM: `team-orchestration`
- Expected outputs:
  - SRS package (`.cursor/templates/SRS_TEMPLATE.md`)
  - Decision record (`.cursor/templates/ADR_OPTION_TEMPLATE.md`)

## Phase 3 - Build and Integration
- Dev-BE Lead / Dev-FE / Dev-Mobile: `team-orchestration`
- QA: `quality-gate`
- PM: `team-orchestration`
- Expected outputs:
  - Handoff packets (per `handoff-packet.mdc`)
  - Test/defect evidence

## Phase 4 - Validation and Release Decision
- QA: `quality-gate`
- QC: `quality-gate`, `team-governance-review`
- PM / Technical Manager: `team-governance-review`
- Expected outputs:
  - Gate decision (`.cursor/templates/GO_NO_GO_TEMPLATE.md`)
  - Residual risk and follow-up action list

## Phase 5 - Learn and Improve
- All roles: `team-governance-review`
- PM + Technical Manager: ensure KB updates per `knowledge-quality.mdc`
- Expected outputs:
  - Lessons and preventive patterns in role KB files
  - Process/rule update proposals for next cycle
