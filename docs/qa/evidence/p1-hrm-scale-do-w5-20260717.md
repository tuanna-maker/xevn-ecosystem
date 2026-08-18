# P1-HRM-SCALE-DO-W5-PG-HEADROOM — SUPERSEDED (no PG change)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-DO-W5-PG-HEADROOM` |
| **date** | 2026-07-17 |
| **from_role** | `devops` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** (superseded — no remediation applied) |

## Stop / supersede

DO-W5 **stopped before** Postgres `max_connections` / pool Σ raise. Soft-superseded by PM after DO-W4 **VPS-local** LB re-run (`127.0.0.1:3101`) reported **T-CONC 400→1000 PASS** (`t_conc_met=true`). Prior Windows→WAN `:3101` noise discarded as official SoT.

| Check | Result |
|-------|--------|
| DO-W5 `.env` / compose bak | **none** (no mid-change) |
| PG raise / 4× replicas | **not applied** |
| Post-stop health `:3101` `:3001` `:3011` `:8088` `:28002` | **200** (spot-check) |

**Next:** QC `P1-HRM-SCALE-QC-W3-RERUN4` on updated DO-W4 1000 proof. Re-open DO-W5 **only if** QC finds PG saturation after adjudication.

## Handoff

- **completion_report:** DO-W5 interrupted safely; no PG/compose mutation; stack healthy; work item superseded pending QC of DO-W4 VPS-local 1000 VU evidence.
- **next_owner:** `qc` (already dispatched RERUN4) / `pm`
- **evidence_path:** this file; SoT probe = `docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md`
- **ack_status:** **PASS_TO_PM**
