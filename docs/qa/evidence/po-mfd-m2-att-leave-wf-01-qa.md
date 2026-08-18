# Evidence — PO-MFD-M2-ATT-LEAVE-WF-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-LEAVE-WF-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P0 |
| **u65_zero_seed** | true |
| **u76_hdsd_align** | true |
| **u87_menu_fidelity** | true |
| **surfaces** | **19**, **28** |
| **uc** | HRM-AT-10..13 (create→approve L1) |
| **hdsd_align** | Attendance → tab Nghỉ phép → Tạo yêu cầu → Gửi → QL Chờ duyệt → Duyệt → F5 |
| **spec_ref** | FR-HRM-AT-10 · FR-HRM-AT-12 · TECHSPEC leave · ATT-C4/C5 |
| **prior** | leave scope GWC `po-mfd-m2-att-scope-01-qc.md` · OT FE approve GWC CLOSED · SHEETS-01 GWC CLOSED (not reopened) |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | **false** |
| **Attendance CLOSED** | **NOT claimed** |
| **date** | 2026-08-04 |
| **commit** | `dc930c5` (local) |
| **stamp** | `LWF01-E9U9ST` |

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` (entry) | **PASS** |
| `pnpm run qc:fe-be-health` (exit) | **PASS** |
| Seed / API invent leave / inbox seed | **None** (U65) |
| CLOCK GPS seat | **not duplicated** (in-flight elsewhere) |
| SHEETS / OT CLOSED slices | **not reopened** |

## Persona / URL

| Role | Account | JWT OU | URL | Used for approve claim? |
|------|---------|--------|-----|-------------------------|
| NV (create) | `uat.nv0007@xe.vn` / `xevn-uat-2026` | `trsport` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` | N/A |
| QL (approve) | `uat.nv0002@xe.vn` / `xevn-uat-2026` | `trsport` | same | **Yes** |
| ceo@ spot | `ceo@xe.vn` | `main` | `companyId=main` | **No** (AT-12 honesty) |

## HDSD inventory (U76)

| # | Surface / control | Observed |
|---|-------------------|----------|
| 1 | Surface **28** — tab **Nghỉ phép** | 🟢 mounts; `leave-balance-panel` present |
| 2 | Surface **19** — Đơn từ→Nghỉ phép (= LeaveTab) | 🟢 same shell |
| 3 | CTA **Tạo yêu cầu** / Tạo đơn | 🟢 |
| 4 | Dialog · lý do `hdsd-leave-reason` · Gửi | 🟢 |
| 5 | Network create 2xx + FE after | 🟢 POST **201** `HRM-LEAVE-201` |
| 6 | NV F5 / list still shows request | 🟢 createF5 (Network id SoT; stamp text may be truncated in list) |
| 7 | QL **Chờ duyệt** · pending stamp | 🟢 `pendingVisible=true` |
| 8 | **Duyệt** (`hdsd-leave-list-approve*`) | 🟢 POST **201** `HRM-LEAVE-203` |
| 9 | FE **Đã duyệt** + F5 | 🟢 `feStatusAfter=true` · `f5=true` |
| 10 | ceo@ used as approve persona | ⚪ **forbidden** — spot only |

## UF — Leave create → approve (U65 browser)

### UF-ATT-LEAVE-WF-M2-P0-8

- **Click path (NV):** Login → Attendance `companyId=trsport` → tab Nghỉ phép → Tạo yêu cầu → fill type/reason `QA leave WF LWF01-E9U9ST` → Gửi
- **Network create:** POST `/api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` · id `2792cbe3-d6aa-483a-9513-b2f240eb3271` · `x-company-id=main`
- **FE after create:** `createFeAfter=true` · screenshot `03-nv-after-submit.png`
- **F5 (NV):** `createF5=true` · `04-nv-create-f5.png`
- **Click path (QL):** same leave tab → **Chờ duyệt** → Duyệt on stamp/pending
- **Network approve:** POST `…/leave-requests/{id}/approve` → **201** `HRM-LEAVE-203` · `requestStatus=approved` · `x-company-id=trsport`
- **FE after approve:** **Đã duyệt** (`feStatusAfter=true`) · `06-ql-after-approve.png`
- **F5 (QL):** `f5=true` · `07-ql-approve-f5.png`
- **Verdict:** 🟢 **PASS**

## ceo@ honesty (AT-12)

| Check | Result |
|-------|--------|
| Used ceo@ to claim approve PASS? | **No** |
| Spot on `companyId=main` Chờ duyệt | `Duyệt` count=**32** · `hdsd-leave-list-approve*`=**32** |
| vs BA `EXPECTED_NO_CTA` | 🟡 **OBS** — runtime shows CTA for group CEO; do **not** invent APPROVE PASS via ceo@; BA may refresh EXPECTED_NO_CTA wording |

**Not a leave-WF NO-GO** — HP approve persona = QL `uat.nv0002` as dispatched.

## OBS (non-blocking)

| OBS | Note |
|-----|------|
| Create `x-company-id=main` + query `company_id=trsport` | Same pattern as prior leave/OT seats; 201 OK |
| Approve header `trsport` | FE mutate-scope OU; 201 without 409 |
| GET leave-balance **403** (some employee_id during NV session) | Console 403 ×3; create still 201 — optional P3 |
| Reason stamp not always visible in list text after F5 | Network id + approve path SoT; PNG chain present |

## Residuals

| ID | Status |
|----|--------|
| — | **none** blocking for this seat |
| `R-MFD-M2-CLOCK-GPS-LATLON` | **untouched** (CLOCK in-flight) |
| SHEETS-01 / OT FE approve GWC | **CLOSED prior — not reopened** |

## Matrix / runtime stamp

| Surface # | Runtime | Note |
|-----------|---------|------|
| **19** | **LIVE** (WF mutate confirm) | leave create→approve→F5 U65 · `PO-MFD-M2-ATT-LEAVE-WF-01` |
| **28** | **LIVE** (WF mutate confirm) | same LeaveTab path |

Updated: `HRM-ATTENDANCE_M2_BACKLOG.md` P0-8 · `HRM-ATTENDANCE_RUNTIME_LOG.md` · fidelity matrix note.

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-leave-wf-01-qa-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-att-leave-wf-01-qa.mjs` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/` (01–08 PNG) |

## J-* / L2.5

Leave list → Duyệt → F5 (HRM-AT-10/12 L1) **PASS**. Full Attendance journey map closure **not** claimed. CLOCK / SHEETS / OT seats not re-gated here.

## completion_report

**Closed:** M2 P0-8 leave WF — U65 browser NV create **201** `HRM-LEAVE-201` → QL Duyệt **201** `HRM-LEAVE-203` → FE Đã duyệt + F5; HDSD inventory surfaces 19/28; no seed; ceo@ not used for approve claim.

**Open / honesty:** ceo@ shows Duyệt CTAs (OBS vs EXPECTED_NO_CTA) — BA optional; leave-balance 403 OBS; **uat_done=false**; **Attendance NOT CLOSED**.

## next_owner

**qc** — narrow leave-WF GWC for P0-8

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-LEAVE-WF-01-QC
from_role: pm
to_role: qc
lane: execution
priority: P0
u65_zero_seed: true
entry_criteria: docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qa.md PASS_TO_PM; browser JSON _tmp-po-mfd-m2-att-leave-wf-01-qa-browser.json; PNG docs/qa/evidence/screens/po-mfd-m2-att-leave-wf-01/
exit_criteria: GO or GWC for leave create→QL approve→F5 only; confirm Network 201 HRM-LEAVE-201 + 201 HRM-LEAVE-203; ceo@ not used as approve persona; OBS EXPECTED_NO_CTA mismatch documented not NO-GO; do not reopen SHEETS/OT/CLOCK; uat_done false; NOT Attendance CLOSED
forbidden: seed · invent UAT DONE · reopen CLOSED slices
ack_status: PASS_TO_PM with GO/GWC or NO-GO + residual ids
evidence_path: docs/qa/evidence/po-mfd-m2-att-leave-wf-01-qc.md
```

## ack_status

**PASS_TO_PM**
