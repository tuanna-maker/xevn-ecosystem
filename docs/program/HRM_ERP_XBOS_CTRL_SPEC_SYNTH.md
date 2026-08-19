# SYNTH — E-XBOS-CTRL-SPEC (Cursor)

**Stamp:** 2026-07-28 · CURSOR-PM  
**Status:** `SPEC READY` · **Dev HOLD** đến sponsor chốt G1

## Agree BA ↔ SA
| Item | Lock |
|------|------|
| Option | Expand Nest allow-list · **no DDL** |
| P0 G1 | `job_titles`, `recruitment_channels`, `job_grades`, **`departments`**, **`leave_types`** |
| P1 optional | `contract_types`, `employment_types`, `pay_types`, `shifts`, `decision_types` |
| DEC | Path FR `decision_types`; write prefer live `hr_decision_types` |
| Consume | Existing HRM pull — no new URL |

## Evidence
- `docs/qa/evidence/ba-erp-xbos-ctrl-spec-01-20260728.md`
- `docs/qa/evidence/sa-erp-xbos-ctrl-spec-01-20260728.md`
- Designs: `docs/xbos/*_XBOS_APPLY_TO_MEMBERS_EXPAND.md`

## Ask sponsor
Nhắn **«chốt E-XBOS-CTRL-G1 P0»** (hoặc **P0+P1**) → Cursor kick Dev-BE allow-list.  
Wave-B (EmptyState/i18n docs) vẫn Claude peer lane theo FIDELITY_PROGRAM_DISPATCH.
