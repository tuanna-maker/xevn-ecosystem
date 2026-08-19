# Feature slice — HRM-ATT-SIGN-01

| Field | Value |
|-------|--------|
| **slice_id** | `HRM-ATT-SIGN-01` |
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-TS-01` · **`PO-HRM-BP-ATT-SIGN-DB-API-01`** (db/api delta) |
| **change_manifest_path** | `docs/program/examples/change-manifest.sample.json` |
| **uc_ids** | `UC-BP-ATT-11` |
| **pipeline_stage** | **`ready_for_dev`** (Manifest — TR-CM-16 runtime ACK `PO-HRM-BP-ATT-SIGN-BE-01`) |
| **Status** | **Dev-BE routes + scope parity jest** — QA UF-HRM-ATT-SIGN (U65) after `READY_FOR_QA` |

## Story

Ký chốt bảng công kỳ sau tổng hợp (NV + QL trực tiếp + HCNS) theo workflow cấu hình XBOS per tenant; chỉ bảng `closed` vào PAY.

## allowed_paths (Manifest)

- `docs/client-delivery/hrm-enterprise-blueprint/**`
- `docs/program/slices/HRM-ATT-SIGN-01.md`
- `docs/qa/evidence/po-hrm-bp-att-sign-ts-01.md`
- `docs/qa/evidence/po-hrm-bp-att-sign-db-api-01.md`
- `docs/qa/evidence/po-hrm-bp-att-sign-sa-01.md`
- `docs/qa/evidence/po-hrm-bp-att-sign-uf-ba-01.md`
- `docs/architecture/**` (ADR pointer only)

## forbidden_paths

- `apps/**` · `packages/**` · `deploy/**` (until `ready_for_dev` + sponsor product wave)

## must_keep

- NV xác nhận trước khi coi đủ bước workflow
- WF master XBOS — không hard-code cấp duyệt một pháp nhân
- Chỉ sheet `closed` → PAY
- Spec-first order; no_prompt_echo on client docs

## Trace (SoT)

| Layer | Path |
|-------|------|
| SRS | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-11 |
| TechSpec | `TECHSPEC_HRM_ENTERPRISE.md` §6.4 |
| DB (delta) | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.6.1** `att_timesheet_sign_step` |
| API (delta) | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-WF-SIGN-01/02** · F-ATT-SHEET-02 preconditions |
| Journey | `UF-HRM-ATT-SIGN` · `J-HRM-06b` (prerequisite) · `J-HRM-06c` (ký chốt) — [BA UF AC](../../qa/evidence/po-hrm-bp-att-sign-uf-ba-01.md) |

## DoD (wave)

- [x] TechSpec §6.4 ref_srs ACK
- [x] DB_DESIGN §4.6.1 sign-step + API F.1 F-ATT-WF-SIGN-01/02 + F-ATT-SHEET-02 preconditions (`PO-HRM-BP-ATT-SIGN-DB-API-01`)
- [x] SA: scope parity plan + path ADR (`PO-HRM-BP-ATT-SIGN-SA-01` · TR-CM-16 design ack)
- [x] BA: UF-HRM-ATT-SIGN + J-HRM-06c click path + AC-ATT-SIGN-UF-01..07 post-mutation FE (`PO-HRM-BP-ATT-SIGN-UF-BA-01`)
- [x] Dev-BE: `scope_parity_ack` runtime + Nest routes (`PO-HRM-BP-ATT-SIGN-BE-01` · SP-ATT-SIGN-01..04)
- [ ] Browser UF-HRM-ATT-SIGN (qa, U65 — after Dev `READY_FOR_QA`)
