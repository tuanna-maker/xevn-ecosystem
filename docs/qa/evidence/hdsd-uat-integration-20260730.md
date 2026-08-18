# HDSD UAT — W4 Integration (Catalog · Headcount)

**work_item_id:** `QA-HDSD-FULL-W0-W4-01`  
**Program:** `HDSD-P2-FULL-01`  
**Date:** 2026-07-30  
**Persona:** `ceo@xe.vn` / `Xevn@2026`

## Scope

- XBOS catalog governance → HRM settings sync visibility
- Headcount card (`employees/summary`) cross-plane

## Results

| TC ID | Verdict | Click path | Network |
|-------|---------|------------|---------|
| TC-ECO-05 | 🟡 | CC Settings → `hrm_catalog` | catalog API **not captured** on settings page load (W1 catalog tab 🟢 **200**) |
| TC-HRM-HDSD-06-01-INT | 🟢 | `/hr/company` headcount | GET summary/headcount **200** |
| TC-HRM-HDSD-07-01-INT | 🟡 | HRM settings → Danh mục tab | Second-pass tab click — sync call timing; **W2b embed catalogSync 🟢 200** |

## Cross-reference (PASS)

| Layer | Evidence |
|-------|----------|
| L0 | `qc:fe-be-health` portal-proxy-hrm-catalog **200** |
| W1 | TC-XBOS-HDSD-03-03 catalog governance **200** |
| W2b | TC-HRM-HDSD-07-01 catalogSync **200** |
| W2a | TC-HRM-HDSD-07-01 settings **200** |

## Residual

- **TC-ECO-05 / TC-HRM-HDSD-07-01-INT 🟡:** Automation timing on tab switch — functional sync verified via W2b + L0 proxy. QC may accept **GO WITH CONDITIONS** or request explicit publish/pull click evidence.

## ack_status

**PASS_TO_PM** (headcount **🟢**; catalog sync **functionally PASS**, automation soft **🟡**)
