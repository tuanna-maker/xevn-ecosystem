# PM board — HRM-SC-01 ATT leave dual SoT (BE+FE)

| Meta | Value |
|------|--------|
| **work_item_id** | `PM-HRM-SC-01-ATT-LVT-SEAL-01` |
| **date** | 2026-08-10 |
| **be_qa** | `ATTLVTSOTQA-MSNG88NH` · `qa-hrm-settings-att-lvt-sot-01.md` |
| **fe_qa** | `ATTLVTSOTFEQA-MSNGJ8T2` · [QA ATT-LVT SoT FE U65](54128075-487d-4042-8be9-4d60352d6f7d) |
| **dev** | [ATT-LVT dual SoT BE](876f1f45-2812-443a-ba4d-e158a4cda72c) · [ATT-LVT dual SoT FE UX](63e71b74-d955-4f5a-8af4-40894fed49fa) |

## Slice scope (dual SoT only)

- Settings REF read-only + tenantWriter stamp + CTA → **Loại phép ATT**
- Nest ATT CRUD + **409** on settings extension mutate
- Consumer **effective** + invent guard

**Not:** full Settings module UAT · `settings_catalog_e2e_ready` flip · portal tabs mock (defer `PO-HRM-SETTINGS-PORTAL-TABS-FE-02`)

## QC gate

**Verdict:** **GO WITH CONDITIONS** · stamp **`ATTLVTSOTQC1-MSNGQC01`** · [GWC HRM-SC-01 ATT-LVT slice](8c1096a5-9efb-420b-85ed-dd346026fbf2)

Evidence: `docs/qa/evidence/qc-hrm-settings-att-lvt-sot-gwc-01.md`

**C-SLICE 🟢 only** — do **not** set `settings_catalog_e2e_ready` / full HRM-SC-01 module UAT.
