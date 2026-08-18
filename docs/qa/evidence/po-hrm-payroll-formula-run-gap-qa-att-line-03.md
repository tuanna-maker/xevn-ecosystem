# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-03`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-03` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01` READY_FOR_QA |
| **closes** | **R-PAY-F-ATT-LINE-AC4-BIND** (QC-ATT-LINE-02 CONDITION OPEN) |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 product-path AC4 STRICT** (Path A punch→Aug sheet→close→bind) · not browser UF · not module UAT |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — AC4 STRICT bind · AC2/AC3 retained · density `line_count>0` |
| **artifact_json** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-03.FINAL.json`](./_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-03.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-03.mjs` |
| **stamp** | `PAYFEATT-MSIKCMFF` |
| **portal_url** | `http://127.0.0.1:5173` |
| **spec_ref** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01.md` · FE-ATT-ENROLL-01 Path A |
| **fe_ref** | [`po-hrm-payroll-formula-run-gap-fe-att-enroll-01.md`](po-hrm-payroll-formula-run-gap-fe-att-enroll-01.md) |
| **qc_prior** | [`po-hrm-payroll-formula-run-gap-qc-att-line-02.md`](po-hrm-payroll-formula-run-gap-qc-att-line-02.md) GWC · AC4 CONDITION |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | LOCKED — preview warns `PAYROLL_E2E_READY_FALSE` · not flipped |
| **Formula LIVE / J-HRM-07 module UAT** | **DENIED** | L1 product-path slice only · no browser UF claim |
| **Seed** | **DENIED** | U65 — `POST /attendance/records` product API only · no `pnpm seed:*` |
| **Jul CB-BAG sheet** | **NOT touched** | New Aug sheet created · Jul inventory left alone |
| **PASS only jest** | **DENIED** | Live L1 on `:28001` |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM + XBOS + portal **200** |
| `qc:fe-be-health` | **ALL PASS** (login + employees + catalog + proxy) |
| Dist markers | `toLeaveDayKey` present · stale `String(header.start_date).slice` **absent** · bag `loadAttHoursFromClosedLine` |
| Auth | Portal login · Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| Author | `ceo@xe.vn` / `Xevn@2026` |
| Publisher (dual) | `admin@xe.vn` / `Xevn@2026` |
| Today (VN) | **2026-08-07** → Path A Aug window preferred |
| Employee | `0500220b-…` · UAT-0100 · UAT NV 0100 |
| Work sheet | `74aba4d4-9c75-4707-9d01-7690516e95c7` · **created** Aug 01–31 · company `holding` |
| Hygiene | reopen after bind → `lines_archived=2` · Jul **not** reopened |

---

## Click / product path executed (U65)

**Path A (preferred — today ∈ Aug):** L1 product API mirroring FE Clock-In + sheet density (FE-ATT-ENROLL-01). Browser Playwright not required this seat; L1 corroborates AGG after product-path punch.

1. Login `ceo@xe.vn` → token scope `main`.
2. **Punch today:** `POST /attendance/records` → **201** `HRM-ATT-201` (`attendance_date=2026-08-07`, present 08:00–17:00).
3. **Create Aug sheet:** `POST /attendance/attendance-sheets` · `2026-08-01`–`2026-08-31` → draft `74aba4d4-…`.
4. **Tổng hợp:** `POST …/aggregate` → **201** `line_count=2` · warnings `[]` · **no** `AGG_EMPTY_ENROLLMENT` · **no** `AGG_SHEET_DATE_INVALID`.
5. **Gửi chờ ký:** `POST …/submit` → **201** `status=submitted` `line_count=2`.
6. Sign EMP/DM/HR → **Chốt:** `POST …/close` → **201** `status=closed` **`line_locked_count=2`**.
7. AGG on closed → **409** `HRM-ATT-SHEET-LOCKED`.
8. Hours formula (dual publish) → **PREVIEW** employee + `base_salary` override.

**Path B:** not needed (Path A density succeeded).

---

## AC matrix (AC4 STRICT)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **DIST** | `toLeaveDayKey` live | present · stale slice absent | **PASS** |
| **AC4-DENSITY** | product punch/OT → AGG `line_count>0` | Path A punch **201** · AGG **201** `line_count=2` | **PASS** |
| **AC1 submit** | submit invokes AGG / submitted | **201** `line_count=2` `submitted` | **PASS** |
| **AC1 close lock** | close → `line_locked_count>0` | **201** `line_locked_count=2` | **PASS** |
| **AC1 AGG closed** | AGG closed → **409** LOCKED | **409** `HRM-ATT-SHEET-LOCKED` | **PASS** |
| **AC4 STRICT bind** | closed+locked binds hours **without** `ATT_TIMESHEET_LINE_ABSENT` | PREVIEW **201** `HRM-PAY-FORMULA-200` · warnings include **`ATT_HOURS_FROM_CLOSED_LINE`** · **absent=false** · **incomplete=false** · `gross=900000` (= `100000 × 9h`) · `payroll_e2e_ready=false` | **PASS** |
| **AC2** | incomplete after reopen → **412-PREVIEW-STUB** · no silent 0 | **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` · `NO_CLOSED_SHEET` + `ATT_HOURS_VAR_BAG_INCOMPLETE` · silent0=false | **PASS** (retain) |
| **AC3** | PROCESS open → **HRM-PAY-ATT-412** | draft period 2036-02 → **412** `HRM-PAY-ATT-412` | **PASS** (retain) |
| **Honesty** | `payroll_e2e_ready=false` | ready_leak=false · `PAYROLL_E2E_READY_FALSE` in preview warnings | **PASS** |

### Delta vs QA-ATT-LINE-02 / QC CONDITION

| Before (QA-02 / QC-02) | After (QA-03) |
|------------------------|---------------|
| AGG honest `AGG_EMPTY_ENROLLMENT` · `line_count=0` | Product punch → `line_count=2` |
| AC4 **SKIP** empty enrollment | AC4 **STRICT PASS** · `ATT_HOURS_FROM_CLOSED_LINE` |
| `bindWireOk=false` / `line_locked_count=0` | `line_locked_count=2` · PREVIEW **201** bind |
| R-PAY-F-ATT-LINE-AC4-BIND **OPEN** | **CLOSED** (this seat — QC confirm next) |

---

## Key runtime excerpts

### Density Path A
```text
POST /attendance/records → 201 HRM-ATT-201 (2026-08-07 present)
POST /attendance/attendance-sheets → Aug 01–31 sheet 74aba4d4-…
POST …/aggregate → 201 line_count=2 warnings=[]
POST …/submit → 201 submitted line_count=2
POST …/close → 201 closed line_locked_count=2
POST …/aggregate (closed) → 409 HRM-ATT-SHEET-LOCKED
```

### AC4 STRICT bind
```text
POST /payroll/formulas/{id}/preview
  body: { employeeId: 0500220b-…, variableOverrides: { base_salary: 100000 } }
→ 201 HRM-PAY-FORMULA-200
  gross=900000 net=900000
  warnings include: ATT_HOURS_FROM_CLOSED_LINE, PAYROLL_E2E_READY_FALSE, PREVIEW_DRY_RUN, NOT_CUSTOMER_UAT
  NOT ATT_TIMESHEET_LINE_ABSENT
  NOT ATT_HOURS_VAR_BAG_INCOMPLETE
  payroll_e2e_ready=false
```

### AC2 / AC3 retained
```text
(after reopen lines_archived=2)
PREVIEW → 412 HRM-PAY-FORMULA-412-PREVIEW-STUB · NO_CLOSED_SHEET · ATT_HOURS_VAR_BAG_INCOMPLETE
PROCESS 2036-02 → 412 HRM-PAY-ATT-412
```

---

## CRUD / mutate matrix (L1 product-path)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| Punch `attendance/records` today | Create | **PASS** 201 |
| Create Aug attendance sheet | Create | **PASS** |
| AGG materialize lines | Update | **PASS** line_count=2 |
| Submit / sign / close lock | Update | **PASS** locked=2 |
| AGG closed deny | Update deny | **PASS** 409 LOCKED |
| Preview hours bind | Read dry-run | **PASS** 201 + FROM_CLOSED_LINE |
| Reopen archive | Update | **PASS** archived=2 |
| Preview incomplete stub | Read deny | **PASS** 412 PREVIEW-STUB |
| PROCESS open ATT | Update deny | **PASS** 412 ATT-412 |
| Jul CB-BAG | — | **N/A** — not touched |
| Browser UF / J-HRM-07 | — | **N/A** — DENIED this seat |

---

## Command table

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run qc:dev-stack` | HRM + XBOS + portal **200** · exit **0** (UV handle noise OBS) | L0 PASS |
| `pnpm run qc:fe-be-health` | **ALL PASS** · exit **0** | L0/L1 health |
| `node scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-03.mjs` | exit **0** · verdict **PASS** · stamp `PAYFEATT-MSIKCMFF` · `failed_acs=[]` | PRODUCT OK AC4 STRICT |
| Jul CB-BAG touch | **none** (`jul_touched=false`) | PRESERVE |

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| **R-PAY-F-ATT-LINE-AC4-BIND** | STRICT closed+locked `payable_hours` bind without `ATT_TIMESHEET_LINE_ABSENT` | **CLOSED** this QA seat — **qc** confirm GWC |
| `payroll_e2e_ready` | LOCKED false | **pm** — **cấm** flip |
| Browser UF / J-HRM-07 / formula LIVE / Phase1 | — | **DENIED** |
| Full PROCESS payslip lines with ATT+C&B | C&B still `CB_PACKAGE_ABSENT` on preview | deferred — not AC4 scope |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 / module UAT / **J-HRM-07**.
- Did **not** seed DB / run `pnpm seed:*`.
- Did **not** reopen Jul CB-BAG sheets.
- Did **not** claim browser Clock-In UF PASS (L1 product-path API corroboration of FE Path A).

---

## completion_report

### Closed

1. L0 + fe-be-health PASS.  
2. **Path A density:** punch today → Aug sheet → AGG `line_count=2` → submit → close `line_locked_count=2` → **409** LOCKED.  
3. **AC4 STRICT PASS** — PREVIEW **201** with `ATT_HOURS_FROM_CLOSED_LINE`, **no** `ATT_TIMESHEET_LINE_ABSENT`, gross `900000` (= hours×override), `payroll_e2e_ready=false`.  
4. **AC2 PREVIEW-STUB** + **AC3 ATT-412** retained after hygiene reopen.  
5. Evidence MD + FINAL stamp `PAYFEATT-MSIKCMFF`. Honesty locks held.

### Residual

QC GWC to ACCEPT AC4-BIND CLOSED as condition close on prior QC-ATT-LINE-02 GWC — still **cấm** promote ready / LIVE / J-HRM-07.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** → **qc** GWC AC4 close |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-03.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | QC GWC close R-PAY-F-ATT-LINE-AC4-BIND · stamp PAYFEATT-MSIKCMFF · **cấm** flip ready / claim LIVE / J-HRM-07 |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-03
from_role: pm
to_role: qc
lane: governance
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-03 PASS_TO_PM (stamp PAYFEATT-MSIKCMFF)
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P0

## Mission
QC GWC close R-PAY-F-ATT-LINE-AC4-BIND after QA-ATT-LINE-03 STRICT:
1) Audit evidence — Path A punch→Aug AGG line_count=2→close line_locked=2→PREVIEW 201 ATT_HOURS_FROM_CLOSED_LINE · no ATT_TIMESHEET_LINE_ABSENT
2) Confirm AC2 PREVIEW-STUB + AC3 ATT-412 retained; Jul CB-BAG untouched; payroll_e2e_ready=false
3) Close CONDITION AC4-BIND from QC-ATT-LINE-02 — do NOT GO as module UAT / ready flip / J-HRM-07 / formula LIVE
4) honesty: C-SLICE-≠-MODULE retained

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-03.md
- docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-qa-att-line-03.FINAL.json
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-02.md
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-03.md
```
