# Delivery Starter Kit

This folder is a reusable bootstrap package for new projects.

## Contents

- `.cursor/agents/*`: role directives for PM, Dev, QA, BA, SA, QC.
- `.cursor/hooks.json`: baseline hook wiring.
- `docs/templates/*`: release and operations templates.

## How to Use

1. Copy `starter-kit/.cursor` to `<new-project>/.cursor`.
2. Copy `starter-kit/docs/templates` to `<new-project>/docs/templates`.
3. Follow `docs/PROJECT_BOOTSTRAP_CHECKLIST.md`.

## Notes

- Keep role order strict: `PM -> Dev -> QA -> BA -> SA -> QC`.
- Do not mark task done without evidence.
- Always write handoff packet fields into the message bus.
