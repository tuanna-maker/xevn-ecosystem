# Evidence — PO-MFD-M2-OT-FE-APPROVE-QA-R2

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-OT-FE-APPROVE-QA-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P1 |
| **u65_zero_seed** | true |
| **hdsd_align** | Attendance → Quản lý đơn → Đăng ký làm thêm → Thêm đơn tăng ca → Eye → Duyệt → F5 |
| **spec_ref** | FR-HRM-AT-10 / ATT-C4 OT · residual `R-MFD-M2-OT-FE-APPROVE` |
| **prior** | R1 BLOCKED `po-mfd-m2-ot-fe-approve-qa-01.md` · FE READY `po-mfd-m2-ot-fe-loading-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | **false** |
| **date** | 2026-08-04 |
| **commit** | `dc930c5` (local) |
| **stamp** | `OTR2-E97UF2` |

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` (entry) | **PASS** |
| `pnpm run qc:fe-be-health` (exit) | **PASS** |
| Hard reload FE | yes (reload after goto) |
| Seed / API invent OT | **None** (U65) |

## Persona / URL

| Role | Account | Password used | JWT OU | URL |
|------|---------|---------------|--------|-----|
| NV (create) | `uat.nv0007@xe.vn` | `xevn-uat-2026` | `trsport` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |
| QL (approve) | `uat.nv0002@xe.vn` | `xevn-uat-2026` | `trsport` | same |

## HDSD inventory (U76)

| # | Surface | Observed |
|---|---------|----------|
| 1 | Attendance embed mount | 🟢 |
| 2 | Quản lý đơn → Đăng ký làm thêm | 🟢 |
| 3 | CTA **Thêm đơn tăng ca** | 🟢 visible after settle |
| 4 | Idle GET after settle (5s) | 🟢 **0** (AC ≤2) — R1 was 124/20s |
| 5 | FE create → Network 2xx | 🟢 POST **201** `HRM-OT-201` |
| 6 | Eye → detail → **Duyệt** | 🟢 POST **201** `HRM-OT-203` |
| 7 | F5 status | 🟢 row stamp + `status.approved` |

## UF — OT create → approve (U65 browser)

### UF-OT-FE-CREATE-APPROVE-R2

- **Click path (NV):** Login → Attendance `companyId=trsport` → Quản lý đơn → Đăng ký làm thêm → Thêm đơn tăng ca → fill → Thêm
- **Settle:** loading ends; idle GETs **0**/5s; CTA visible
- **Network create:** POST `/api/hrm/attendance/overtime-requests` → **201** `HRM-OT-201` id `b3f995e2-6218-44fc-8909-e6ba103169b9`
- **FE after create:** stamp `OTR2-E97UF2` on list (Phan Văn An / VTH-0007)
- **Click path (QL):** same OT tab → Eye on stamp row → **Duyệt**
- **Network approve:** POST `…/overtime-requests/{id}/approve` → **201** `HRM-OT-203` `requestStatus=approved`
- **F5:** stamp row shows approved; screenshot `09-ot-f5.png`
- **Verdict:** 🟢 **PASS**

### R1 residual CLOSED

| ID | R1 | R2 |
|----|----|----|
| **R-MFD-M2-OT-FE-LOADING** | stuck Đang tải; GET storm | **CLOSED** — idleGets=0; CTA mounts |
| **R-MFD-M2-OT-FE-APPROVE** | not reached | **CLOSED** — create→Eye→Duyệt→F5 |

## OBS (non-blocking — not invent FAIL on approve AC)

| OBS | Note | Owner hint |
|-----|------|------------|
| Badge raw key `status.pending` / `status.approved` | i18n miss for `status.*` on OT tab | optional dev-fe |
| OT date shown as ISO `2026-09-04T17:00:00.000Z` | should be `dd/MM/yyyy` (vi-VN lock) | optional dev-fe |
| List/mutate `x-company-id=main` + query `company_id=trsport` | works (201); document if scope harden later | optional |

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-ot-fe-approve-qa-r2-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-ot-fe-approve-qa-r2.mjs` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-ot-fe-approve-qa-r2/` |
| Prior R1 | `docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-01.md` |
| FE fix | `docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md` |

## Forbidden claims (honesty)

- **Not** Attendance module CLOSED
- **uat_done** remains **false**
- **Not** seed / API invent OT rows
- Leftover pending rows from earlier R2 attempts are FE-origin (same U65 seat retries) — not seed

## completion_report

**Closed:** U65 browser R2 after FE loading fix — OT tab settles (idle GET 0/5s, CTA visible); NV create **201 HRM-OT-201**; QL Eye→Duyệt **201 HRM-OT-203**; F5 stamp + approved. Residuals `R-MFD-M2-OT-FE-LOADING` + `R-MFD-M2-OT-FE-APPROVE` **CLOSED**.

**Open:** OBS i18n status badge + ISO date display (optional). Attendance program not CLOSED; `uat_done=false`.

## next_owner

**qc** — gate residual R-MFD-M2-OT-FE-APPROVE closure (leave GWC OT condition)

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-OT-FE-APPROVE-QC-R2
from_role: pm
to_role: qc
lane: governance
priority: P1
u65_zero_seed: true
entry_criteria: QA PASS_TO_PM docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-r2.md — create 201 HRM-OT-201 + approve 201 HRM-OT-203 + F5; loading storm CLOSED; no seed
exit_criteria: Audit browser evidence + Network codes; close residual R-MFD-M2-OT-FE-APPROVE on leave-scope GWC if listed; GO/GWC with OBS i18n/date optional; uat_done false; do not claim Attendance CLOSED
evidence_path: docs/qa/evidence/po-mfd-m2-ot-fe-approve-qc-r2.md
ack_status: PASS_TO_PM
read_first: docs/qa/evidence/po-mfd-m2-ot-fe-approve-qa-r2.md · docs/qa/evidence/po-mfd-m2-ot-fe-loading-01.md · docs/qa/evidence/po-mfd-m2-att-scope-01-qc.md
```
