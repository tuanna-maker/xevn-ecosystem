# Evidence — C-QA-EVID-PACK-01 (QC GWC process close)

| Field | Value |
|-------|--------|
| **work_item_id** | `C-QA-EVID-PACK-01` |
| **from_role** | pm |
| **to_role** | qa |
| **executor** | qa |
| **date** | 2026-08-03 |
| **qc_in** | `docs/qa/evidence/po-e2e-spine-01-qc-w5-r1.md` (condition C-QA-EVID-PACK-01) |
| **target** | `docs/qa/evidence/po-e2e-spine-01-qa-w5-r1.md` |
| **ack_status** | **PASS_TO_PM** |

## verify:qc:evidence-pack

| Run | Exit | Checks | Failed ids |
|-----|------|--------|------------|
| **Before** | **1** | **5/8** | `command_table`, `crud_or_matrix`, `residual_section` |
| **After** | **0** | **8/8** | — |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-e2e-spine-01-qa-w5-r1.md
```

## Patch summary (format only — product verdict unchanged)

| Gap | Fix |
|-----|-----|
| `command_table` | Added **Command table** with `pnpm run qc:dev-stack`, browser harness `node …`, pack verify row + exit **0** / pass |
| `crud_or_matrix` | Added **L2.5 journey matrix** with J-HRM-01/02/07 rows `\| **pass** \|` |
| `residual_section` | Renamed `## 4. Residuals` → `## Residual` (+ owner column) |

**Not changed:** HP-05/06 browser PASS claims · test-log · screenshots · no re-run Playwright · no seed · must_keep lanes.

## completion_report

- **Closed:** C-QA-EVID-PACK-01 — QA source md passes pack gate **8/8 exit 0**; QC GWC process condition ready for PM to note on `po-e2e-spine-01-qc-w5-r1.md`.
- **Open:** Full E2E-SPINE-01 program · UAT/Phase1 — still **not** claimed (unchanged).

## next_owner

**pm** — close condition on QC note; optional **qc** spot re-check pack only (no product re-audit required).

## next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-01-QC-W5-R1 (condition close)
from_role: pm
to_role: qc
priority: P3 spot
entry: C-QA-EVID-PACK-01 PASS — docs/qa/evidence/po-e2e-spine-01-qa-w5-r1.md verify:qc:evidence-pack 8/8 exit 0; evidence docs/qa/evidence/c-qa-evid-pack-01.md
mission: Re-run pnpm run verify:qc:evidence-pack on QA md; if exit 0, mark C-QA-EVID-PACK-01 CLOSED on po-e2e-spine-01-qc-w5-r1.md § Residual — no full spine re-audit.
exit: ack PASS_TO_PM or note CLOSED inline on QC md
cấm: seed · claim UAT DONE · reopen Leave · re-run HP-05/06 browser unless fraud
```
