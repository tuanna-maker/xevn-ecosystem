# Evidence — PO-MFD-M1-ATT-P0-CFG-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-P0-CFG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P0 |
| **uc_id** | `HRM-AT-14` |
| **spec_ref** | ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804 D2–D4 · `docs/qa/professional/by-uc/HRM-AT-14.md` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | false |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |

## Environment

| Item | Value |
|------|--------|
| Portal | `http://127.0.0.1:5173` · embed `/hr/attendance?portal=1&companyId=main` |
| HRM API | `http://127.0.0.1:28001` |
| Persona | `ceo@xe.vn` / holding scope `main` |
| Commit | `dc930c5` |
| L0 | `hrm_api` 200 · `portal` 200 · `qc:fe-be-health` HRM routes PASS (pilot P-CC-09b unrelated FAIL) |

## hdsd_align

Chấm công → **Thiết lập** → **Quy định chấm công** → subtabs Chung / Ứng dụng; D4 sidebar stubs.

## L2 / L2.5

| Layer | Result |
|-------|--------|
| **L2** | P-CC-07 attendance route load (prior pilot) · settings tab shell load OK |
| **L2.5** | **J-HRM-06** embed: Thiết lập → Quy định → Chung ↔ App subtab click; no 404/409 on rules/work-sites APIs |

## Browser AC (Playwright U65)

**Script:** `scripts/qa/_tmp-po-mfd-m1-att-p0-cfg-qa-01.mjs`  
**Raw JSON:** `docs/qa/evidence/_tmp-po-mfd-m1-att-p0-cfg-qa-01-browser.json`  
**Screens:** `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/`

### UF AT-14-01 — Rules → Chung Lưu → F5

| Step | Result |
|------|--------|
| Toggle `#notify-late` (true → false) | OK |
| Click `[data-testid="att-rules-general-save"]` | **PATCH** `/api/hrm/attendance/rules?company_id=main` → **200** |
| F5 + reopen Chung | UI `notify_late=false` |
| GET rules (direct + after reload) | **200** · `notify_late=false` |
| **Verdict** | **PASS** |

**Cleanup:** Post-test PATCH restored `notify_late=true` (U65 mutate cleanup, no seed).

### UF AT-14-02 — App → GPS work-site

| Step | Result |
|------|--------|
| App tab → Thêm vị trí → dialog submit | **POST** `/api/hrm/attendance/work-sites` → **201** |
| Row visible | `QA-GPS-e86a38` |
| F5 | Row still visible; GET work-sites **200** · site in list |
| **Verdict** | **PASS** |

**Optional (not run):** HRM-ATT-GEO-001 mobile/geo check-in inside/outside radius — defer `qa-device` / clock-in wave.

### UF AT-14-03 — D4 stub sidebars

| Sidebar | Stub testid | Fake general save? | Link `/settings` | Verdict |
|---------|-------------|-------------------|------------------|---------|
| Quy định làm thêm | `att-cfg-stub-overtime` | no | yes | PASS |
| Quy định nghỉ | `att-cfg-stub-leave-rules` | no | yes | PASS |
| Quy định đi muộn - về sớm | `att-cfg-stub-late-early` | no | yes | PASS |
| Quy định làm đơn | `att-cfg-stub-request-rules` | no | yes | PASS |

### UF AT-14-04 — Face ID GĐ1

| Check | Result |
|-------|--------|
| `[data-testid="att-faceid-cfg-banner"]` | visible **PASS** |
| `[data-testid="att-app-toggle-faceid"]` disabled | **n/a** (control not rendered; banner satisfies D4 read-only policy) |

## completion_report

**Closed (P0 CFG persist wave):**

- Rules→Chung persist via Nest PATCH + F5 parity (UI + GET).
- GPS admin CRUD via work-sites POST + F5 list parity.
- D4 overtime/leave/late/request stubs honest (banner + catalog link, no fake save).
- Face ID GĐ1 banner on App tab.

**Residual (non-blocking P0 gate):**

- Customize columns tab still non-persist (ADR scope) — not in this wave exit.
- GPS edit-in-place deferred (delete + add only).
- GEO-001 check-in enforcement not browser-verified this seat.
- Pilot artifact `QA-GPS-e86a38` remains from FE mutate (real API row, not seed script).
- Update `HRM-AT-14.md` `code_readiness` / `execution` — PM/BA trace promote.

## pm_dispatch_hint

QC narrow gate on CFG P0; optional geo + by-uc matrix stamp.

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M1-ATT-P0-CFG-QC-01
from_role: pm
to_role: qc
lane: execution
priority: P0

read_first:
- docs/qa/evidence/po-mfd-m1-att-p0-cfg-qa-01.md
- docs/qa/evidence/po-mfd-m1-att-p0-cfg-be-01.md
- docs/qa/evidence/po-mfd-m1-att-p0-cfg-fe-01.md
- docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md

entry_criteria:
- QA PASS_TO_PM PO-MFD-M1-ATT-P0-CFG-QA-01; u65_zero_seed evidence present

exit_criteria:
- Audit browser JSON + screenshots; confirm no fake-green on D4 stubs
- GO or GWC for P0 CFG slice only (GEO-001 optional condition)
- evidence_path: docs/qa/evidence/po-mfd-m1-att-p0-cfg-qc-01.md
- ack_status: PASS_TO_PM
```
