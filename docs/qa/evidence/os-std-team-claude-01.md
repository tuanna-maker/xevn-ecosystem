# Evidence — OS-STD-TEAM-CLAUDE-01

| Field | Value |
|-------|-------|
| **work_item_id** | `OS-STD-TEAM-CLAUDE-01` |
| **from_role** | sa |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **lane** | governance / OS doctrine |
| **apps/** | none touched |

---

## Mission closed

Create Vibe Team OS operating doctrine for **Team Claude** as a second programming team (cost/speed), with **Cursor Lead** as absolute reviewer.

---

## Artifacts written / updated

| Path | Change |
|------|--------|
| `_vibe-team-os/29-TEAM-CLAUDE-EXTERNAL-CODING-LANE.md` | **ADD** full doctrine (§0–§10) |
| `_vibe-team-os/README.md` | Index row **2z** → `29` |
| `_vibe-team-os/PM-START-HERE.md` | Situation **A1c** + **M** pointer (29 LANDED) |
| `_vibe-team-os/MEMORY.md` | Lock `TEAM-CLAUDE-REVIEW-REQUIRED` + §41; enrich lock notes 29 LANDED |
| `_vibe-team-os/CHANGELOG.md` | Append **2026-08-03c — v1.12.2** |

---

## Coverage checklist (mission must-cover)

| # | Topic | Where in `29` |
|---|-------|---------------|
| 1 | Roles: Cursor Lead orchestrate+review; Team Claude draft in allowed_paths; no silent merge main | §1 |
| 2 | When Claude vs Cursor Task `dev-fe`/`dev-be` | §2 |
| 3 | Control plane: bus · slice · allowed/forbidden · read_first (25/26/28/SRS/TS/API/DB) | §3 |
| 4 | Review gates G1–G9 before ACCEPT | §4 |
| 5 | Path canonical NFD — no NFC shadow (XeVN lesson) | §5 |
| 6 | Billing: batch · no dual writer · STOP loops | §6 |
| 7 | Handoff: `DRAFT_READY_FOR_REVIEW` → Cursor review → QA | §7 |
| 8 | Relation to `27` (init ≠ Team Claude lane) | §0 · §8 |

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| `28` FE/BE SoC file | Referenced; may still be pending SA land | sa / parallel wave |
| `OS-STD-QC-01` | QC OS gate after **28 + 29 + TM enrich** land | pm → qc |
| MANIFEST.json version bump | Not in allowed_paths this wave | optional devops/pm |

---

## completion_report

- **Closed:** Doctrine `29` + README/PM-START-HERE/MEMORY/CHANGELOG wiring + this evidence.
- **Open:** QC `OS-STD-QC-01` waits for `28` + TM enrich; no product code.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: OS-STD-QC-01
role: qc
entry_criteria:
  - 29 LANDED (OS-STD-TEAM-CLAUDE-01 evidence PASS)
  - 28-FE-BE-SEPARATION-OF-CONCERNS.md LANDED (or explicit waiver)
  - TM enrich OS-STD-AUDIT-ENRICH-01 closed or listed residual
exit_criteria:
  - Independent spot: README 2z · PM-START-HERE A1c/M · MEMORY TEAM-CLAUDE-REVIEW-REQUIRED · 29 §1/§4/§7/§8
  - Verdict GO | GWC | NO-GO for OS std pack 28+29
  - evidence_path: docs/qa/evidence/os-std-qc-01.md
cấm: apps/** ; claim product DONE
```

## ack_status

**PASS_TO_PM**
)
