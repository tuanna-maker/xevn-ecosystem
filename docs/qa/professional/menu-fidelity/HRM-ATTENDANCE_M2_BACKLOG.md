# HRM Attendance — Wave M2 fix backlog (ordered)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-SYNTH` |
| **Program** | U87 · `PO-MENU-FIDELITY-01` |
| **Synth inputs** | Fidelity matrix (46) · DATA_CLASS · ENTERPRISE_API_MAP · M1 manifest · M1 evidence seats |
| **Generated** | 2026-08-04 |
| **uat_done** | `false` |
| **Runtime column** | **Browser filled** — `PO-MFD-M2-ATT-QA-RUNTIME-01` **PASS_TO_PM** · UNKNOWN=0 · evidence `docs/qa/evidence/po-mfd-m2-att-qa-runtime-01.md` · **uat_done false** · not Attendance CLOSED |

## Executive order (M2 pipeline)

```text
P0 execution (parallel where noted):
  [DISPATCHED] SCOPE-01 (dev-be)
  [GWC]        WIRE-BALANCE-01 (dev-fe) — leave balance + holds; QC GWC
  [GWC]        P0-CFG-BE-01 + P0-CFG-FE-01 + P0-CFG-QC-01 — rules PATCH + work-sites; GWC (NOT UAT DONE)
  [GWC]        SHIFTS-02 — Ca honesty CLOSED; GD2-ROSTER OOS
  [GWC]        SHEETS-01 — #11–12 + payroll SoT CLOSED; OBS i18n/columns
  [PASS_TO_PM] LEAVE-WF-01 (qa) — P0-8 create→QL approve→F5; awaiting QC

Governance (closed / in-flight):
  [CLOSED]     AT14-BYUC-01 · HRM-AT-14 by-uc
  [CLOSED]     P0-CFG-SA-01 · ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804
  [CLOSED]     CFG-DOC-01 · retire cfgNotPersisted wording (PO-MFD-M2-ATT-CFG-DOC-01)

QA gate:
  [PASS_TO_PM] QA-RUNTIME — PO-MFD-M2-ATT-QA-RUNTIME-01 (UNKNOWN=0 · U65 RO)
  [CLOSED] WAVE-ROLLUP-QC-01 GWC · next M3 EMP inventory DISPATCHED · not ATT CLOSED
```

---

## P0 — Must fix before Attendance M2 sign-off

> **2026-08-04:** OT FE create→approve PO-MFD-M2-OT-FE-APPROVE-QC-R2 **GWC CLOSED** (201/201+F5; loading CLOSED). uat_done=false. Not Attendance CLOSED.

| Seq | work_item_id | Owner | Status | depends_on | Surface # | Matrix / gap | Rationale |
|-----|--------------|-------|--------|------------|-----------|----------------|-----------|
| P0-1 | `PO-MFD-M2-ATT-SCOPE-01` | dev-be | **GWC** (leave; OT approve CLOSED R2) | — | 19, 21, 23, 28 | G-SCOPE-LEAVE · G-SCOPE-OT-POST · C4/C5 | Approve/create scope parity vs update-requests (U78); member 409 risk |
| P0-2 | `PO-MFD-M1-ATT-P0-CFG-BE-01` | dev-be | **GWC** (`P0-CFG-QC-01`) | `PO-MFD-M1-ATT-P0-CFG-SA-01` ✓ | 10, 32–33, 36, 40–41 | G-CFG-RULES · P0-1/P0-6 DATA_CLASS | CLOSED slice — `GET/PATCH /attendance/rules` + work-sites slug · ADR D1–D4 · **not** UAT DONE |
| P0-3 | `PO-MFD-M2-ATT-WIRE-BALANCE-01` | dev-fe | **GWC** | — (API exists) | 5, 19, 28 | G-BALANCE · C5 | CLOSED wire — leave-balance panel; FE `cfgNotPersisted` claim **retired** by CFG-DOC-01 |
| P0-4 | `PO-MFD-M1-ATT-P0-CFG-FE-01` | dev-fe | **GWC** | P0-2 | 32–33, 36–37, 40–42 | G-CFG-RULES · P0-2 DATA_CLASS | CLOSED slice — Nest wire Chung/Công chuẩn/GPS; residual columns + D4 stubs |
| P0-5 | `PO-MFD-M2-ATT-SHIFTS-02` | dev-fe | **GWC** | — | 16–18 | G-MENU-STUB · row 17 PARTIAL | Schedule/OT submenu: GĐ2 badge + honest panel; `useWorkShifts` loop re-verified · evidence `po-mfd-m2-att-shifts-02.md` |
| P0-6 | `PO-MFD-M2-ATT-SHEETS-01` | qa → qc | **PASS_TO_PM** (QA) | HRM-AT-14 pack ✓ | 11–12, 13 | HRM-AT-14 · rows 11–12 **LIVE** | Sheet create/list AC-ATT-SHEET; empty honesty; payroll period SoT · evidence `po-mfd-m2-att-sheets-01-qa.md` · **not** UAT DONE |
| P0-7 | `PO-MFD-M2-ATT-CLOCK-01` | qa → **dev-fe** | **FAIL** (manual LIVE · GPS GEO wire) | P0-2 (geofence CFG) | 6–8, 10 | HRM-AT-01 · SRS_VN geofence | QA `po-mfd-m2-att-clock-01-qa.md` — hub+manual 201+F5; Face HOLD; **R-MFD-M2-CLOCK-GPS-LATLON** → FE pass lat/lon |
| P0-8 | `PO-MFD-M2-ATT-LEAVE-WF-01` | qa → **qc** | **PASS_TO_PM** (QA) | P0-1, P0-3 | 19, 28 | HRM-AT-10..13 | QA `po-mfd-m2-att-leave-wf-01-qa.md` — NV create 201→QL Duyệt 201+F5; ceo@ not approve persona; **not** UAT DONE |

---

## P1 — Enterprise fidelity (after P0 wave 1)

| Seq | work_item_id | Owner | Status | depends_on | Surface # | Notes |
|-----|--------------|-------|--------|------------|-----------|-------|
| P1-1 | `PO-MFD-M2-ATT-OVERVIEW-01` | qc | **GWC CLOSED** year-wire · PERIOD ACCEPTED_YEAR_ONLY_P1 · not ATT CLOSED |
| P1-2 | `PO-MFD-M2-ATT-RECORDS-01` | qa → **qc** | **PASS_TO_PM** (QA) · list GWC | P0-6 | 13 | List LIVE GET 200 HRM-ATT-200 · evidence `po-mfd-m2-att-records-01-qa.md` · uat_done false |
| P1-2b | `PO-MFD-M2-ATT-RECORDS-EDIT-01` | qc | **GWC CLOSED** R3 · #13 LIVE · PATCH-SCOPE+DATE-CRASH CLOSED · not ATT CLOSED |
| P1-3 | `PO-MFD-M2-ATT-REQUESTS-01` | qa → qc | **GWC CLOSED** R2 | P0-1 | 20–24 | Loading storm CLOSED · late-early 201+F5 · #20/#22/#24 LIVE · OBS i18n/ISO P2 · QC `po-mfd-m2-att-requests-01-r2-qc.md` · **not** Attendance CLOSED |
| P1-4 | `PO-MFD-M2-ATT-REPORTS-01` | qa → qc | **GWC CLOSED** #29 LIVE · #30 PARTIAL · OBS P2 · not ATT CLOSED | P0-6 | 29 | QC `po-mfd-m2-att-reports-01-qc.md` |
| P1-5 | `PO-MFD-M2-ATT-SETTINGS-EMP-01` | qc | **GWC CLOSED** R2 · #31 LIVE · Refresh+Import · not ATT CLOSED |
| P1-6 | `PO-MFD-M2-ATT-CFG-COLUMNS-01` | ba-process | **CLOSED ACCEPTED_AS_IS_P1** · no column Dev · not ATT CLOSED |
| P1-7 | `PO-MFD-M2-ATT-DEVICE-RULES-01` | sa | **CLOSED ACCEPTED_AS_IS_P1** · #35 honesty REF · #36 rules+sites LIVE · no Dev · not ATT CLOSED |
| P1-8 | `PO-MFD-M2-ATT-AUTO-CHECKOUT-01` | ba-process | **CLOSED ACCEPTED_AS_IS_P1** · #39 STUB · job GĐ2 · not ATT CLOSED |
| P1-9 | `PO-MFD-M2-ATT-WEEKLY-01` | qc | **GWC CLOSED** #14/#15 · OBS P2 · not ATT CLOSED |
| P1-10 | `PO-MFD-M2-ATT-QR-CLOCK-01` | ba-process | **CLOSED ACCEPTED_AS_IS_P1** · #8 PARTIAL under HRM-AT-01 · not ATT CLOSED |

---

**P1 table:** COMPLETE 2026-08-04 (GWC / ACCEPTED_AS_IS) — **not** Attendance CLOSED.

**P2 table:** COMPLETE 2026-08-04 (ACCEPTED_AS_IS_P1) — **not** Attendance CLOSED · Face #9 HOLD.

## P2 — Polish / deferred GĐ1 depth

| Seq | work_item_id | Owner | Surface # | Notes |
|-----|--------------|-------|-----------|-------|
| P2-1 | `PO-MFD-M2-ATT-OVERVIEW-CHARTS-01` | ba-process | **CLOSED ACCEPTED_AS_IS_P1** · not ATT CLOSED |
| P2-2 | `PO-MFD-M2-ATT-EXPORT-01` | ba-process | **CLOSED ACCEPTED_AS_IS_P1** · #30 PARTIAL · not ATT CLOSED |
| P2-3 | `PO-MFD-M2-ATT-LEAVE-SUMMARY-01` | ba-process | **CLOSED ACCEPTED_AS_IS_P1** · not ATT CLOSED |
| P2-4 | `PO-MFD-M2-ATT-RBAC-SETTINGS-01` | sa | **CLOSED ACCEPTED_AS_IS_P1** · IAM pointer · not ATT CLOSED |
| P2-5 | `PO-MFD-M2-ATT-SYSTEM-01` | devops | **CLOSED ACCEPTED_AS_IS_P1** · #46 STUB · not ATT CLOSED |
| P2-6 | `PO-MFD-M2-ATT-OPENAPI-01` | sa | **CLOSED ACCEPTED_AS_IS_P1** · Nest SoT · pack OBS · not ATT CLOSED |

---

## GĐ2-HOLD — Do not implement in M2 (honest menu)

| Surface # | UI | work_item_id | Owner | Action |
|-----------|-----|--------------|-------|--------|
| 9 | Face clock-in | `PO-MFD-M2-ATT-GD2-FACE-01` | pm | HOLD · badge «GĐ2» (row 9 PARTIAL) |
| 27 | Kế hoạch nghỉ | `PO-MFD-M2-ATT-GD2-LEAVE-PLAN-01` | ba-process | HOLD mindmap GĐ2 |
| 37 | Rules tablet | `PO-MFD-M2-ATT-GD2-TABLET-01` | dev-fe | STUB_UI → featureInDev honest |
| 38 | Ủy quyền chấm | `PO-MFD-M2-ATT-GD2-PROXY-01` | ba-process | HOLD WF audit GĐ2 |
| 17* | Phân ca lịch | `PO-MFD-M2-ATT-GD2-ROSTER-01` | ba-process + dev-fe | **P0 menu honesty** via SHIFTS-02; full roster API GĐ2 |

\* Row 17: P0 = không claim LIVE; SHIFTS-02 disables misleading submenu until roster FR+API.

---

## UNMAPPED dedupe (34 rows → action)

| Action | Count | Rule | Examples (surface #) |
|--------|------:|------|----------------------|
| **Mapped via HRM-AT-01..13** | 12 | Keep by-uc QA | 6–7, 13, 19, 23, 28 |
| **Mapped via HRM-AT-14 (new)** | 4 | CFG/sheets UC | 11–12, 32–33 (execution P0-6 / P0-4) |
| **UC create / SPEC_GAP delta** | 8 | ba-process seat | 1, 8, 20, 29, 8 QR, overview charts 2–3 |
| **BA HOLD (GĐ2 / no FR)** | 6 | No dev until sponsor | 9, 27, 38, 26 compensatory |
| **QA runtime only (UNKNOWN)** | 32→0 | `PO-MFD-M1-ATT-QA-RUNTIME` | All UNKNOWN until browser |
| **STUB → BUILD in P0/P1** | 9 | CFG sidebar | 40–43, 37–39 |

**Reject:** Treating UNMAPPED as «optional» — payroll/CFG stubs are **P0** per U87 §2 and DATA_CLASS §7.

---

## Cross-reference: already dispatched (do not duplicate)

| work_item_id | Role | Surfaces | Backlog seq |
|--------------|------|----------|-------------|
| `PO-MFD-M2-ATT-SCOPE-01` | dev-be | 19, 21, 28 | P0-1 |
| `PO-MFD-M2-ATT-WIRE-BALANCE-01` | dev-fe | 5, 19, 28 | P0-3 · GWC |
| `PO-MFD-M1-ATT-P0-CFG-SA-01` | sa | — | Closed → P0-2 |
| `PO-MFD-M1-ATT-P0-CFG-BE-01` / `P0-CFG-FE-01` / `P0-CFG-QC-01` | be/fe/qc | 32+ | GWC · not UAT DONE |
| `PO-MFD-M1-ATT-AT14-BYUC-01` | ba-process | 11–12, 32+ | Closed → P0-6 |
| `PO-MFD-M2-ATT-CFG-DOC-01` | ba-process | docs | **CLOSED** — retire `cfgNotPersisted` / NO_API rules wording |

**Alias merge:** SA map suggested `PO-MFD-M2-ATT-RULES-01` = same scope as **`PO-MFD-M1-ATT-P0-CFG-BE-01`** (ADR-bound · **GWC**). SA map `PO-MFD-M2-ATT-WIRE-01` balance slice = **`PO-MFD-M2-ATT-WIRE-BALANCE-01`** (**GWC**); rules wire = **P0-CFG-FE-01** (**GWC**).

---

## QA seats (M2)

| work_item_id | Owner | Entry | Exit |
|--------------|-------|-------|------|
| `PO-MFD-M1-ATT-QA-RUNTIME` | qa | Matrix 46 UNKNOWN | **Superseded** by M2 RUNTIME-01 |
| `PO-MFD-M2-ATT-QA-RUNTIME-01` | qa | P1 table COMPLETE | **PASS_TO_PM** · UNKNOWN=0 · evidence `po-mfd-m2-att-qa-runtime-01.md` · uat_done false |
| `PO-MFD-M2-ATT-QA-01` | qa | PM after RUNTIME | Optional UF/J-* rollup or M3 — **not** Attendance CLOSED |

---

## Mindmap / program alignment

| Program §7 | This backlog |
|------------|--------------|
| M1 inventory + Synth | **This file** closes M1 synth |
| M2 Fix P0 BROKEN/PARTIAL | P0 table seq 1–8 |
| M3 next menu | Out of scope — Employees/Payroll after Attendance P0=0 |

---

*PO-MFD-M1-ATT-SYNTH · ba-process · governance · uat_done false*

















