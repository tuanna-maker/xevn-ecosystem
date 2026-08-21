---
name: scope-controlled-delivery
description: >-
  Enforce allow-list waves, isolated commit/deploy slices, and must_keep for
  working business logic. Use when dispatching dev-fe/be, preparing deploy,
  sponsor says "đúng phạm vi", or workspace has unrelated diffs (SID, specimen).
---

# Scope-controlled delivery

Sponsor (SmartClinic, 2026-07-09): **kiểm soát phạm vi sửa của member rất quan trọng** — duy trì mọi dự án.

## When to apply

- Every `work_item_id` with `allowed_paths` / `forbidden_paths`
- Before `git commit` or `gh workflow run "Deploy to Server"`
- When sponsor rejects UX and asks rollback / minimal fix
- When QC flags "SID bleed" or cross-lane files in `git status`

## Dispatch packet (required)

```text
change_mode: ADD | REPLACE | REMOVE
must_keep: [controls + RPC paths + panels that must not change]
forbidden_paths: [copy from sponsor-lock / §18 deny-list]
allowed_paths: [≤ lane budget; R1 ≤ 5 files if hotfix]
exit_criteria: tests mapped to UC/BR + evidence path
```

## Commit / deploy slice

1. `git status --short` — list **all** modified files.
2. Stage **only** allow-list paths: `git add path1 path2 ...`
3. **Never** `git add .` when SID, specimen, docs archive, or other lanes are dirty.
4. Run tests for touched module only.
5. Push → `gh workflow run "Deploy to Server" --ref main` → poll until `conclusion: success` and note `headSha`.

## must_keep examples (SmartClinic collect)

| Touch | must_keep |
|-------|-----------|
| Left strip display | Payment sidebar amounts, Confirm Payment RPC, commission panel, SID print |
| Service table STT | `order_items` persist shape, discount engine, AC-COLLECT-UI-08 |

## Red flags → stop and narrow

- Dev adds package grouping when sponsor asked "chỉ STT"
- Removing rows sponsor did not point at (see `INC-COLLECT-DEDUPE-OVER-REMOVE`)
- PM edits `src/**` without sponsor "code trực tiếp / mày làm / push lên / giữ code"

## Evidence

Each wave: `docs/evidence/W-DEVFE-*.md` with `spec_read_ack`, test command output, `ack_status`.

## Cross-ref

- `_vibe-team-os/09-TEAM-OPERATING-MODEL.md` §3
- `_vibe-team-os/rules/team-scope-commit-deploy-slice.mdc`
- `incidents/INC-COLLECT-UX-OVER-ENGINEER.md`
