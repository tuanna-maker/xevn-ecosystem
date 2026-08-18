# Evidence — PO-HRM-JD-GROUP-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-GROUP-DATA-01` |
| **role** | ba-data |
| **date** | 2026-08-06 |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `sa` |
| **status** | **ALIGNED-BENCHMARK** |

## Delivered

- SoT: `docs/program/specs/PO-HRM-JD-GROUP-DATA-01.md`
- Entities: `rec_jd_group_def` / field · `rec_jd_default_pack` / pack_group · `rec_jd_pack_rule`
- VAL-GRP-01..24 · Option A HRM tenant · scope_parity U19 · A2/Q6

## UPDATE — WORLD-BENCHMARK-01 align

| Import | Locus |
|--------|-------|
| §4 seedable SEC_* codes | §4.1 (+ legacy alias map) |
| §3.5 PACK_IT_OFFICE / DRIVER_OPS / CORP_DEFAULT membership | §4.3–§4.4 |
| Rules primary `job_family` | §4.5 |
| §3.6 view order via snapshot `groups[].sort_order` | §4.6 · §5.1 |
| DOC-DELTA | §16 · R-JD-GRP-07 CLOSED |

## Forbidden verified

- No `apps/**` · no migrate · no UAT seed density

## Residual → SA

R-JD-GRP-01..06 (DDL, F.1, work_mode, journey map, layout coexistence, job_family vocab)

## next_dispatch_prompt

See GROUP-DATA-01 §15 — `PO-HRM-JD-GROUP-ARCH-01` / sa (+ WORLD-BENCHMARK in read_first).
