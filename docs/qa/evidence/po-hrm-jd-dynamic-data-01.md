# Evidence — PO-HRM-JD-DYNAMIC-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-DATA-01` |
| **role** | ba-data |
| **date** | 2026-08-06 |
| **slice** | `docs/program/slices/PO-HRM-JD-DYNAMIC-TOPCV.md` |
| **deliverable** | `docs/program/specs/PO-HRM-JD-DYNAMIC-DATA-01.md` (**ALIGNED-SPEC** §12) |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** / **pm** synth (`PO-HRM-JD-DYNAMIC-ARCH-01`) |

## Closed (wave 1 + SPEC align)

- Entity map + AS-IS trace (no Prisma)
- **§12 DOC-DELTA:** UC-00a/b/c · BR-BP-JD-DYN-01..08 · AC↔VAL · **J-HRM-JD-01..03** list/detail scope_parity
- **A2 LOCK:** global default layout + JD `layout_snapshot_json`/`layout_version` override
- **Q2 LOCK:** `select` allowlist `job_titles|job_grades|employment_types|departments|recruitment_channels` (+ static options)
- VAL-JD-17..22 ADD; R-JD-DATA-03 CLOSED

## Residual

- R-JD-DATA-01 Option A/B · R-JD-DATA-02 DDL · R-JD-DATA-04 journey map file · R-JD-DATA-05 D7
- SA ADR-ack A2/Q2

## Verify

- No `apps/**` touched
- SPEC-01 READY cited in §0 / §12

## next_dispatch_prompt

See deliverable §11 — ARCH-01 sa (+ pm journey map optional).
