# HDSD UAT — W1 XBOS (Command Center + Dashboard)

**work_item_id:** `QA-HDSD-FULL-W0-W4-01`  
**Program:** `HDSD-P2-FULL-01`  
**Date:** 2026-07-30  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**Portal:** `http://127.0.0.1:5173` · **Bộ HDSD:** `docs/client-delivery/hdsd/xbos/`

## Results

| TC ID | UF | HDSD | Verdict | Evidence |
|-------|-----|------|---------|----------|
| TC-XBOS-HDSD-01-01 | UF-XBOS-01 | Ch.1 CC widgets | 🟢 | CC load, no ERROR banner |
| TC-XBOS-HDSD-01-02 | UF-XBOS-10 | Ch.1 KPI rollup | 🟢 | GET `/api/xbos/kpi-engine/rollup` **200** |
| TC-XBOS-HDSD-02-01 | UF-XBOS-02 | Ch.2 ĐVTV list | 🟢 | Settings → đơn vị thành viên table visible |
| TC-XBOS-HDSD-02-05 | UF-XBOS-12 | Ch.2 Phòng ban | 🟡 | UI tab load; GET departments **not captured** in 2.5s window |
| TC-XBOS-HDSD-02-06 | UF-XBOS-13 | Ch.2 RBAC | 🟢 | GET rbac/matrix **200** |
| TC-XBOS-HDSD-03-01 | UF-XBOS-07 | Ch.3 RACI | 🟢 | GET raci **200** |
| TC-XBOS-HDSD-03-02 | UF-XBOS-08 | Ch.3 Workflow inbox | 🟢 | Inbox load, no banner |
| TC-XBOS-HDSD-03-03 | UF-XBOS-09/14/15 | Ch.3 Catalog | 🟢 | Catalog governance GET **200** |
| TC-XBOS-HDSD-04-01 | — | Ch.4 Cockpit | 🟢 | `/cockpit` load |
| TC-XBOS-HDSD-04-02 | — | Ch.4 Organization dash | 🟢 | `/dashboard/organization` load |

## Not in scope (wave W1 partial)

UF-XBOS-03..06 mutate (cổ đông, pháp nhân sửa), UF-XBOS-11 member CEO negative → **W5**.

## Screenshots

`docs/qa/evidence/screens/hdsd-uat-20260730/w1-*.png`

## Residual

- **TC-XBOS-HDSD-02-05 🟡:** Tab Phòng ban render; cần retest Network explicit hoặc manual F5 — không 409/500.

## ack_status

**PASS_TO_PM** (W1 load-path **9/10 🟢**, 1 soft)
