# Evidence — PO-MFD-M2-ATT-REQUESTS-01-R2 (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-REQUESTS-01-R2` |
| **from_role** | qa |
| **to_role** | pm / qc |
| **lane** | execution |
| **priority** | P0 |
| **u65_zero_seed** | true |
| **u76_hdsd_align** | true |
| **u87_menu_fidelity** | true |
| **hdsd_align** | Attendance → Quản lý đơn → late-early (primary mutate) + trip/shift-change spot + OT/update spot |
| **spec_ref** | ATT-C4 · matrix #20–24 · `HRM-ATTENDANCE_FIDELITY_MATRIX.md` |
| **prior_fail** | `docs/qa/evidence/po-mfd-m2-att-requests-01-qa.md` (GET storm) |
| **fe_fix** | `docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **uat_done** | **false** |
| **date** | 2026-08-04 |
| **commit** | `dc930c5` (local) |
| **stamp** | `REQ2-EATJL6` |

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` (entry) | **PASS** |
| `pnpm run qc:fe-be-health` (exit) | **PASS** |
| Hard reload FE | yes |
| Seed / API invent rows | **None** (U65) — create via FE modal only |

## Persona / URL

| Role | Account | Password used | JWT OU | URL |
|------|---------|---------------|--------|-----|
| NV | `uat.nv0007@xe.vn` | `xevn-uat-2026` | `trsport` | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=trsport` |

## HDSD inventory (U76) — Quản lý đơn

| # | Surface | HDSD label | Present |
|---|---------|------------|---------|
| — | Shell | **Quản lý đơn** | 🟢 |
| 19 | Leave | Đơn xin nghỉ | 🟢 (inventory; LEAVE-WF GWC not reopened) |
| **20** | Late/early | Đăng ký đi muộn, về sớm | 🟢 |
| **21** | OT | Đăng ký làm thêm | 🟢 |
| **22** | Trip | Đề nghị đi công tác | 🟢 |
| **23** | Update | Đề nghị cập nhật công | 🟢 |
| **24** | Shift-change | Đề nghị đổi ca | 🟢 |

## LIVE tab probes (post FE loading fix)

| Surface | Tab | GET 2xx | Idle GET/5s | CTA | Storm | Runtime |
|--------:|-----|--------:|------------:|-----|-------|---------|
| 20 | late-early | 1×200 | **0** | 🟢 Thêm đơn | no | **LIVE** |
| 21 | OT | 1×200 | **0** | 🟢 Thêm đơn tăng ca | no | **LIVE** (spot) |
| 22 | business-trip | 1×200 | **0** | 🟢 Thêm đề nghị | no | **LIVE** |
| 23 | update-attendance | 1×200 | **0** | 🟢 Thêm đề nghị | no | **LIVE** (spot) |
| 24 | shift-change | 1×200 | **0** | 🟢 Thêm đề nghị | no | **LIVE** |

R1 contrast: #20 idle **85** / #22 **94** / #24 **55** → R2 all **0**.

### Residuals CLOSED by this retest

| ID | Was | Now |
|----|-----|-----|
| R-MFD-M2-REQ-LATE-EARLY-LOADING | OPEN (storm) | **CLOSED** |
| R-MFD-M2-REQ-BUSINESS-TRIP-LOADING | OPEN | **CLOSED** |
| R-MFD-M2-REQ-CHANGE-SHIFT-LOADING | OPEN | **CLOSED** |
| R-MFD-M2-REQ-MUTATE-CTA | OPEN (CTA blocked) | **CLOSED** |

## Mutate U65 — late-early primary

| Step | Result |
|------|--------|
| Open Thêm đơn | 🟢 |
| Employee | Phan Văn An - VTH-0007 (catalog 4 opts) |
| Date pick | 🟢 (script matched raw `common.selectDate` placeholder — see OBS) |
| Reason | `QA M2 requests late-early REQ2-EATJL6` |
| Network POST | **201** `HRM-LE-REQ-201` · id `7e7271ec-0fcd-4895-a54f-ee1244978738` · `x-company-id=main` + query `company_id=trsport` |
| FE after 2xx | Modal close; list refresh |
| F5 | **stampVisible=true** · row=1 · KPI Tổng đơn=1 · Chờ duyệt=1 |

## Spot honesty (do not invent FAIL)

| Surface | Note |
|---------|------|
| #21 OT | List+CTA LIVE; prior create→approve **GWC CLOSED** — not reopened |
| #23 Update | List+CTA LIVE — spot only |
| LEAVE / CLOCK / SHEETS | Not reopened |

## OBS (non-blocking this seat)

| ID | Note | Owner |
|----|------|-------|
| OBS-MFD-M2-REQ-SELECTDATE-I18N | Empty date trigger shows raw key `common.selectDate` (not Vietnamese) | dev-fe (P2 polish) |
| OBS-MFD-M2-REQ-DATE-ISO-DISPLAY | List column shows ISO `2026-09-03T17:00:00.000Z` vs vi-VN `dd/MM/yyyy` | dev-fe (locale lock) |

## Forbidden honesty

- No seed · no API invent
- **uat_done=false** · Attendance **not** CLOSED
- Did not invent FAIL on LEAVE/OT/CLOCK GWC

## Matrix stamp (runtime)

| # | Was (REQUESTS-01) | Now (R2 browser) |
|---|-------------------|------------------|
| 20 | PARTIAL storm | **LIVE** — idle0 + CTA + create 201 + F5 |
| 21 | LIVE | **LIVE** — spot confirm |
| 22 | PARTIAL storm | **LIVE** — idle0 + CTA |
| 23 | LIVE | **LIVE** — spot confirm |
| 24 | PARTIAL storm | **LIVE** — idle0 + CTA |

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-mfd-m2-att-requests-01-r2-browser.json` |
| Script | `scripts/qa/_tmp-po-mfd-m2-att-requests-01-r2.mjs` |
| Screens | `docs/qa/evidence/screens/po-mfd-m2-att-requests-01-r2/` |
| FE fix prior | `docs/qa/evidence/po-mfd-m2-att-requests-fe-loading-01.md` |
| R1 FAIL | `docs/qa/evidence/po-mfd-m2-att-requests-01-qa.md` |

### Key screens

| File | Shows |
|------|--------|
| `20-late-early-list.png` | LIVE list + CTA (no spinner) |
| `20-late-early-filled.png` | Form filled pre-submit |
| `20-late-early-after-submit.png` | Post create |
| `f5-late-early.png` | F5 stamp REQ2-EATJL6 + row |
| `21/22/23/24-*-list.png` | Spot LIVE idle |

## completion_report

**Closed:** R2 U65 browser after FE `h()` deps FIX — #20/#22/#24 GET storm CLOSED (idle GET 0/5s, CTA mounts). Late-early create **201 HRM-LE-REQ-201** + FE + F5 stamp. #21 OT + #23 update still LIVE. Matrix #20/#22/#24 → **LIVE**. L0 entry+exit PASS. No seed. `uat_done=false`. Attendance **not** CLOSED.

**Open / OBS only:** raw `common.selectDate` i18n + ISO date display (P2 polish — not mutate blocker).

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-REQUESTS-01-R2-QC
from_role: pm
to_role: qc
lane: governance
priority: P0
u65_zero_seed: true
entry_criteria: QA PASS_TO_PM docs/qa/evidence/po-mfd-m2-att-requests-01-r2-qa.md — loading residuals CLOSED; late-early create 201+F5; #20/#22/#24 LIVE
exit_criteria: Audit browser evidence vs AC; stamp matrix consistency; GO or GWC with OBS only (selectDate i18n / ISO date); do NOT invent Attendance CLOSED; uat_done stays false; do NOT reopen LEAVE/OT/CLOCK GWC as invent FAIL
cấm: seed · invent ATT CLOSED · reopen LEAVE/OT/CLOCK
evidence_path: docs/qa/evidence/po-mfd-m2-att-requests-01-r2-qc.md
ack_status: PASS_TO_PM
```

## ack_status

**PASS_TO_PM**
