# Role-Skill Phase Map (Global Team Standard)

## Phase 0 - Platform NFR Bootstrap (every API monorepo)

- **SA:** architecture boundaries, NFR in TechSpec, RLS sign-off gate
- **Technical Manager:** enforce `platform-nfr-bootstrap` rule; Go/No-Go needs ops evidence
- **Dev-BE:** `@xevn/platform-core` wiring, migrations, audit emit
- **DevOps:** `devops-deploy` + `PRODUCTION_ENABLE_RUNBOOK.md` (autonomous)
- **PM:** dispatch Command 4/5 from `REUSABLE_SUBAGENT_COMMANDS.md`; gate on `verify:production-env`
- Skills: `platform-nfr-bootstrap`, `devops-deploy`, `senior-design-review`
- Expected outputs:
  - `packages/platform-core/`, NFR baseline doc, ops runbooks, verify scripts
  - Production enable evidence before pilot→prod cutover

## Phase 1 - Discovery and Framing
- PM: `product-discovery`, `team-governance-review`
- SA: `solution-optioning`
- BA-Process / BA-Data: `business-analysis-pack`
- Technical Manager: `team-governance-review`
- Expected outputs:
  - PRD draft (`.cursor/templates/PRD_TEMPLATE.md`)
  - Initial options (`.cursor/templates/ADR_OPTION_TEMPLATE.md`)

## Phase 2 - Analysis and Architecture
- SA: `solution-optioning`, global `client-delivery-brd-srs` (khi BRD/SRS HTML khách)
- BA roles: `business-analysis-pack`; **HTML khách:** subagent **`ba-docs`** (global), không chỉ `ba-process`
- Dev-BE Lead: `solution-optioning`
- PM: `team-orchestration`
- Expected outputs:
  - SRS nội bộ module: `.cursor/templates/SRS_TEMPLATE.md`
  - **SRS/BRD HTML khách:** `@ba-docs` + `~/.cursor/skills/client-delivery-brd-srs` + XeVN `PROJECT_PROFILE.md` — **không** mô hình 8 chương / 12 mục UC
  - Deliverable: `docs/client-delivery/01_BRD_XeVN_OS.html`, `02_SRS_XeVN_OS.html` — `pnpm docs:srs:audit` rồi `pnpm docs:client-delivery:html`
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
