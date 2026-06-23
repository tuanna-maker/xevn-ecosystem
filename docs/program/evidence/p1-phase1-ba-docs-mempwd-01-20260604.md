# P1-PHASE1-BA-DOCS-MEMPWD-01 — Pilot password matrix alignment (C-MEMPWD-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-BA-DOCS-MEMPWD-01` |
| **defect_id** | `C-MEMPWD-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **date** | 2026-06-04 |
| **trigger** | QA `p1-phase1-qa-member-ceo-crud-20260604.md` — portal login `du-lich.ceo@xe.vn` + `xevn-uat-2026` → **401**; authoritative portal password **`Xevn@2026`** |
| **ack_status** | **PASS_TO_PM** |

## Completion report

Closed **C-MEMPWD-01** (doc-only, low severity): aligned pilot SoT so dispatch/QA/PM do not cite `xevn-uat-2026` for member CEO portal login.

| Rule | Before (gap) | After (SoT) |
|------|--------------|-------------|
| `du-lich.ceo@xe.vn` portal | Ambiguous / dispatch used mobile UAT password | **`Xevn@2026`** (XBOS portal login) |
| `xevn-uat-2026` | Sometimes implied for all UAT personas | **`uat.nv####@xe.vn` HRM Mobile only** |
| `ceo@xe.vn` portal | Already correct | **`Xevn@2026`** (unchanged) |

## Files updated

| Path | Change |
|------|--------|
| `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` | New § «Tài khoản pilot — mật khẩu theo kênh» |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | Member CEO password on portal |
| `docs/program/PHASE1_CRUD_ACCEPTANCE_MATRIX.md` | U28-R2 includes `Xevn@2026` + 401 negative note |
| `docs/program/USER_SERVICE_STATUS.md` | Member CEO footnote |
| `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` | v1.2 password table (portal vs mobile families) |
| `.cursor/rules/business-flow-zero-defect-gate.mdc` | Standard accounts table |

## Verification (spot-check)

- Grep SoT: `du-lich.ceo` + portal paths cite `Xevn@2026`; `xevn-uat-2026` scoped to `uat.nv####` / mobile in matrix + HDSD §4.5–4.6.
- QA probe reference: `docs/qa/evidence/p1-phase1-qa-member-ceo-crud-20260604.md` § «Login with dispatch password» vs «Xevn@2026 (portal SoT)».

## Residual

None for **C-MEMPWD-01**. Open items from parent QA handoff (P0-CRUD-05/06, MEM-CRUD-01/02) unchanged — out of scope for ba-docs.

## Handoff packet

| Field | Value |
|-------|-------|
| **next_owner** | pm |
| **next_dispatch_prompt** | Mark **C-MEMPWD-01** closed on bus; ensure future QA dispatch templates for member CEO portal use `du-lich.ceo@xe.vn` / `Xevn@2026`. Continue **qc** `P1-PHASE1-QC-CRUD-GATE-01` and execution lanes per `p1-phase1-qa-member-ceo-crud-20260604.md` — no ba-docs rework unless new password drift reported. |
| **pm_dispatch_hint** | Update dispatch prompts / `ROLE_DISPATCH_PROMPT` examples if they still say `xevn-uat-2026` for `du-lich.ceo` portal |
| **evidence_path** | `docs/program/evidence/p1-phase1-ba-docs-mempwd-01-20260604.md` |
