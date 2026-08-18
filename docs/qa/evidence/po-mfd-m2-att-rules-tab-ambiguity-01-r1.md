# PO-MFD-M2-ATT-RULES-TAB-AMBIGUITY-01-R1

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-RULES-TAB-AMBIGUITY-01-R1` |
| **role** | qa |
| **date** | 2026-08-04 |
| **Prior FE** | `docs/qa/evidence/po-mfd-m2-att-rules-tab-ambiguity-01.md` · READY_FOR_QA |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **hdsd_align** | Attendance → Thiết lập → Quy định chấm công |
| **U65** | zero-seed · browser-only |
| **L0 entry** | `pnpm run qc:fe-be-health` **PASS** |
| **L0 exit** | `pnpm run qc:fe-be-health` **PASS** |
| **Probe** | `scripts/qa/_tmp-po-mfd-m2-att-rules-tab-ambiguity-01-r1.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-mfd-m2-att-rules-tab-ambiguity-01-r1-browser.json` |
| **Screens** | `docs/qa/evidence/screens/po-mfd-m2-att-rules-tab-ambiguity-01-r1/` |
| **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | `false` (Attendance menu not CLOSED — only tab-label ambiguity seat) |

## Click path (U65)

1. Login API → inject portal auth → goto `/hr/attendance?portal=1&…&companyId=main`
2. Top tab **Thiết lập**
3. Sidebar **Quy định chấm công**
4. Subtabs via `getByTestId('hdsd-att-rules-tab-{id}')` — **device**, **app**, **tablet**, **proxy**, **auto**

## Exit criteria results

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Navigate Thiết lập → Quy định chấm công | **PASS** |
| 2 | `hdsd-att-rules-tab-device` / `-app` click distinctly, no strict-mode collision | **PASS** (count=1 each; `strictCollision=false`) |
| 3 | `getByRole('button', { name: 'Máy chấm công', exact: true })` count === **1** | **PASS** (before=1, after=1; button text count=1) |
| 4 | tablet / proxy / auto show `featureInDev` stub (honest STUB_UI) | **PASS** |
| 5 | No page crash on device/app tabs | **PASS** (0 `pageErrors`; 0 console errors) |
| 6 | Evidence R1 file | **PASS** (this file) |
| 7 | Matrix / runtime log #35 | Updated → **LIVE** (ambiguity CLOSED) |

### Labels observed (VI)

| testid | label |
|--------|-------|
| `hdsd-att-rules-tab-device` | Máy chấm công |
| `hdsd-att-rules-tab-app` | Ứng dụng di động |
| `hdsd-att-rules-tab-tablet` | Máy tính bảng |
| `hdsd-att-rules-tab-proxy` | Chấm công hộ |
| `hdsd-att-rules-tab-auto` | Tự động chấm công |

Only **device** uses «Máy chấm công».

## Residuals (not this seat)

| id | Status | Note |
|----|--------|------|
| **R-MFD-ATT-RULES-TAB-AMBIGUITY** | **CLOSED** | Exact role count 1; testids distinct |
| **R-MFD-ATT-SCANFACE-UNDEFINED** | Open (prior #36) | **Not reproduced** this R1 click (app tab loaded without `ScanFace` pageerror). Keep matrix #36 under prior BROKEN until dedicated ScanFace retest; **do not** block this work_item |
| Attendance full CLOSED | Forbidden | `uat_done=false` |

## Screenshots

- `screens/po-mfd-m2-att-rules-tab-ambiguity-01-r1/01-rules-shell.png`
- `screens/po-mfd-m2-att-rules-tab-ambiguity-01-r1/tab-device.png`
- `screens/po-mfd-m2-att-rules-tab-ambiguity-01-r1/tab-app.png`
- `screens/po-mfd-m2-att-rules-tab-ambiguity-01-r1/tab-tablet.png`
- `screens/po-mfd-m2-att-rules-tab-ambiguity-01-r1/tab-proxy.png`
- `screens/po-mfd-m2-att-rules-tab-ambiguity-01-r1/tab-auto.png`

## Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` (then `qc` if wave gate; else `dev-fe` for ScanFace #36)
- **next_dispatch_prompt:** see completion packet below
