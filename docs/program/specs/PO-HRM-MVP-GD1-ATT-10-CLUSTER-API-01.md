# PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01 — API F.1 · F-ATT-SHEET-01/AGG RETAIN cite + submit→AGG + display-ready sheet (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-28 seat **#30**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-SHEET-01** / **F-ATT-SHEET-AGG-01** physical `POST …/attendance-sheets/{sheetId}/aggregate` · **submit MUST AGG** · peer **F-ATT-SHEET-04** GET · paper `/att/*` + `/core` **alias only** · Nest `@Controller('core')` **DENY** · **DENY invent** second hour ledger · **DENY invent `att_leave_hold`** · **ADD residual wire ONLY if** closable (FUNNEL/STD/LEAVE/PAYABLE/OT/WARN/DISP) — **NOT** invent HOL/MEAL/−penalty DONE · **NOT** invent PAY · **NOT** invent ATT-11 DONE · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** · **no schema invent** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED RETAIN** — F.1 physical Option A · LIVE AGG + submit→AGG + `att_timesheet_line` writers **HOLD RETAIN** · payable gold GĐ1 **PRESENT** · `late_penalty_hours` display · unpaid excluded · HOL/MEAL **OUT GĐ1** · closable BE wire for AGG/submit/payable/OT/WARN **NOT proven required** (spine LIVE) → unlock **prefer FE + QA** U65 **J-HRM-ATT-10-01..06 DRAFT** · **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves GET `lines[]` / `statusLabelVi` envelope gap (DISP) · **DENY** Nest `/core` · invent PAY/printable · claim AGG=ATT-10 DONE · ATT-11/PAY DONE · soft/ATT-08=ATT-09 DONE · ATT module UAT · CFG=ATT-02 DONE |
| **uc_ids** | `UC-BP-ATT-10` · `FR-UC-BP-ATT-10` |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · **R-ATT-10-FUNNEL/STD/LEAVE/HOL/MEAL/PAYABLE/OT/WARN/DISP** · **R-ATT-10-≠-*** · **R-ATT-10-PAY-OUT** · printable **false** · QC ATT-09 **`ATT09QC1-MSLUTL9D`** (hold/settle · `pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT) · must_keep ATT-08 **`ATT08QC1-MSLSL36C`** · ATT-02 **`ATT02QC1-MSLQZUK7`** CFG≠DONE · PLT-01 **`PLT01QC1-MSLPUQIU`** · CORE-10 **`CORE10QC1-MSLP0EJB`** · CORE-09 **`CORE09QC1-MSLNBA89`** printable false · CORE-07 **`CORE07QC1-KZJTSHNT`** · soft≠CORE-06 DONE · Nest `/core` DENY · ≠ ATT UAT · PAY invent DONE **OUT** · DENY second hour ledger |
| **ref_data** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md) — HOLD RETAIN `attendance_sheets` + `att_timesheet_line` · payable gold · HOL/MEAL OUT · display-ready cite |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-10-* · J-HRM-ATT-10-01..06 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-10-CLUSTER-SA-01.md) Option A · BR-BP-TS-01 · paper alias |
| **ref_att09_api** | [`PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md) — stamp `ATT09QC1-MSLUTL9D` · held=`pending_days` · DENY `att_leave_hold` · ≠ soft/ATT-08=ATT-09 DONE |
| **ref_att08_api** | [`PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md) — stamp `ATT08QC1-MSLSL36C` · preview must_keep |
| **ref_att02_api** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md) — stamp `ATT02QC1-MSLQZUK7` · CFG≠DONE · late_penalty peer |
| **ref_plt_api** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md) — `PLT01QC1-MSLPUQIU` |
| **ref_core10_api** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md) — `CORE10QC1-MSLP0EJB` |
| **ref_core09_api** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_api** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md) — GATE/ACT · Nest DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-10** · Diễn biến **#1–#3 + Thành công** · **BR-BP-TS-01** · phễu SoT · partner **REQ_L_001** · UC kế = **ATT-11** (**OUT** invent DONE) |
| **ref_paper_api** | **F-ATT-SHEET-01** / **F-ATT-SHEET-AGG-01** · submit must AGG · peer **F-ATT-SHEET-02/03/04** + WF-SIGN (**ATT-11 OUT** invent DONE) · Nest `@Controller('core')` **ABSENT** · paper `/att/*` + `/core` **alias only** · SoT cite `API_DESIGN_HRM_ENTERPRISE.md` § F-ATT-SHEET-01 · prior `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01` |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/attendance-sheets*` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** second hour ledger |
| **ref_code_cite** | `attendance.controller` `@Controller('attendance')` · `POST attendance-sheets/:sheetId/aggregate` · `POST …/submit` (calls AGG) · `GET …/attendance-sheets/:sheetId` (header peer) · `att-timesheet-line-aggregate.ts` (`computeLineHoursFromRecords` · payable = std+paidLeave+ot · late_penalty write) · `AttendanceSheetSignService.submitAttendanceSheetForSign` · Nest `@Controller('core')` **ABSENT** · `att_leave_hold` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim LIVE AGG alone = ATT-10 DONE · **DENY** claim ATT-11/PAY DONE · **DENY** claim soft/ATT-08=ATT-09 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** CFG=ATT-02 DONE · **DENY** invent `att_leave_hold` · honesty flip |
| **ba-data** | **ALREADY CONFIRMED HOLD** — this seat **does not** re-open schema invent · HOL/MEAL/−penalty **OUT GĐ1** · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** second hour ledger |
| **ack_status** | **PASS_TO_PM CONFIRMED RETAIN** |
| **unlock_lane** | **Prefer FE + QA** (RETAIN LIVE AGG/submit/payable spine · no closable BE wire **required**) · **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves GET `lines[]` / `statusLabelVi` envelope gap (R-ATT-10-DISP) |

---

## 1. Verdict — **CONFIRMED RETAIN**

| Decision | Stamp |
|----------|--------|
| Funnel SoT | **ONE RETAIN** LIVE **`public.attendance_sheets` + `public.att_timesheet_line`** = phễu giờ công tính lương — **DENY** second hour ledger · **DENY** invent `att_leave_hold` |
| **F-ATT-SHEET-01 / AGG** | **RETAIN cite** physical **`POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate`** → UPSERT lines · **≠** FR-10 / ATT-10 DONE from AGG alone |
| **Submit → AGG** | **RETAIN cite** physical **`POST …/attendance-sheets/{sheetId}/submit`** **MUST** invoke AGG · after 2xx lines PRESENT · F5 · OPEN-Q2 FROZEN |
| **GET peer (F-ATT-SHEET-04)** | **RETAIN cite** **`GET …/attendance-sheets/{id}`** · peer · **≠** ATT-10/PAY DONE · **≠** invent ATT-11 DONE |
| Payable gold GĐ1 | **RETAIN** `payable_hours = standard_hours + paid_leave_hours + ot_hours_weighted` (±0.01) · `late_penalty_hours` **display-only** · unpaid **excluded** · −penalty **OUT GĐ1** |
| HOL / MEAL | **OUT GĐ1** · null/ABSENT OK · **HOLD** invent writer/DONE |
| Display-ready DTO | Cite: `sheet_id` · `status` · `statusLabelVi` (FE-derive OK) · `line_count` · `warnings[]` · `lines[…]` (gold fields) |
| Nest path | Physical `/api/hrm/attendance/attendance-sheets*` · Nest `@Controller('core')` **ABSENT** — **DENY invent** |
| Closable gap on LIVE SoT? | **NO** required BE for AGG/submit/payable/OT/WARN — spine **PRESENT** · residual = U65 journey + FE DISP bind · optional thin GET enrich **only if** proven |
| Unlock | **Prefer Dev-FE + QA** · **Dev-BE HOLD** invent · optional thin BE **ONLY if** FE proves envelope DISP gap |
| ATT-09/08/02/PLT/CORE-10/09/07 | **must_keep** stamps · soft/ATT-08≠ATT-09 DONE · CFG≠ATT-02 DONE · printable **false** · soft≠CORE-06 · Nest DENY |
| PAY / printable / Word / ATT-11 | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim AGG=ATT-10 DONE · ATT-11/PAY DONE · ATT UAT · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 · PLT/CORE DONE |

```text
  FE «Tổng hợp bảng công — phễu giờ công tính lương» (U65 residual · J-HRM-ATT-10-*)
        │  Network MUST contain /api/hrm/attendance/attendance-sheets*
        │                  (…/aggregate · …/submit · GET peer)
        │  DENY Nest /core/* AGG SoT
        │  DENY invent second hour ledger · invent att_leave_hold
        │  DENY invent PAY/printable/Word · claim AGG=ATT-10 DONE · ATT-11/PAY DONE
        │  DENY claim soft/ATT-08=ATT-09 DONE · ATT module UAT · CFG=ATT-02 DONE
        ▼
  F-ATT-SHEET-01 / AGG
        POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate
        → UPSERT att_timesheet_line (std · OT×coef · paid/unpaid · payable · late_penalty · work_days)
        → { sheet_id, status, line_count, warnings[] }
        → Diễn biến #1–#2 · BR-BP-TS-01 · ≠ ATT-10 DONE alone
        │
  Submit (RETAIN peer gate)
        POST …/attendance-sheets/{sheetId}/submit
        → MUST call AGG · status → submitted peer · lines PRESENT · F5
        → Diễn biến #3 · ≠ invent ATT-11 close DONE
        │
  GET peer F-ATT-SHEET-04
        GET …/attendance-sheets/{id}
        → display-ready cite (statusLabelVi FE-derive OK · lines[] enrich optional thin BE if proven)
        → ≠ ATT-10/PAY DONE
        │
  Payable gold GĐ1 (RETAIN)
        payable = standard + paidLeave + otWeighted
        late_penalty display · unpaid excluded · −penalty OUT · HOL/MEAL OUT
        │
  Residual (prefer FE+QA — no BE unlock required this seat)
        FUNNEL/STD/LEAVE/PAYABLE/OT/WARN/DISP AC · F5 · Nest /core 0
        │
        └─► must_keep ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE ·
              PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB ·
              CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
              soft≠CORE-06 · Nest /core DENY · C-SLICE · honesty false · PAY OUT
```

**Invariant ATT-10-PATH (O9):** Aggregate/submit/GET Network **MUST** hit physical `/api/hrm/attendance/attendance-sheets*` — Nest dual `/core` SoT = **FAIL**.

**Invariant ATT-10-≠-AGG-DONE (O1/O12):** Claim LIVE AGG alone = FR-UC-BP-ATT-10 / ATT-10 DONE = **FAIL**.

**Invariant ATT-10-SUBMIT (O2):** Submit 2xx **without** AGG materialize / lines = **FAIL**.

**Invariant ATT-10-PAYABLE (O6):** GĐ1 `payable_hours` ≠ gold `standard+paidLeave+otWeighted` (±0.01) without documented residual = **FAIL**.

**Invariant ATT-10-GOLD (O6):** Subtract `late_penalty_hours` from payable GĐ1 / invent −penalty DONE = **FAIL** (OUT GĐ1).

**Invariant ATT-10-OT (O7):** Raw OT (unweighted) in `payable_hours` = **FAIL**.

**Invariant ATT-10-FOOTER (O3):** Silent invent HOL/MEAL writer / claim missing HOL/MEAL = ATT-10 FAIL when footer OUT = **FAIL**.

**Invariant ATT-10-≠-11 (O8/O11):** Claim close/sign/WF = ATT-10 DONE = **FAIL**.

**Invariant ATT-10-≠-09-DONE (O10):** Claim soft/ATT-08 = ATT-09 DONE from this seat = **FAIL**.

**Invariant ATT-10-≠-UAT (O12):** Claim ATT module UAT / flip `attendance_uat_ready` = **FAIL**.

**Invariant ATT-10-≠-PRINTABLE / PAY-OUT (O11):** Invent PAY/printable/Word DONE = **FAIL**.

**Invariant ATT-10-CFG≠02 (O10):** Claim CFG = ATT-02 DONE / reopen ATT-02 = **FAIL**.

**Invariant ATT-10-≠-DUAL-HOLD / LEDGER:** Invent `att_leave_hold` / second hour ledger = **FAIL**.

**Invariant ATT-10-U19:** attendance-sheets list = get-by-id = mutate AGG/submit — OOS → 409/404 · not empty-mask.

**Invariant ATT-10-DATA-HOLD:** LIVE spines **HOLD RETAIN** · **DENY** Nest `/core` dual · **DENY** invent `att_leave_hold` · **DENY** second ledger.

**Invariant ATT-10-NO-SEED (O12):** Seed fake sheet/lines for UF = **FAIL** U65.

---

## Footer — honesty (every section)

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-10 DONE** · AGG alone ≠ FR-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · ≠ CFG=ATT-02 DONE · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · DENY invent `att_leave_hold` · DENY second hour ledger · must_keep ATT-09 `ATT09QC1-MSLUTL9D` · ATT-08 `ATT08QC1-MSLSL36C` · ATT-02 `ATT02QC1-MSLQZUK7` · PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite 2026-08-09) | Gap vs F.1 this seat |
|---------|----------------------------------|----------------------|
| `POST …/attendance-sheets/:sheetId/aggregate` | LIVE · UPSERT `att_timesheet_line` · `{sheet_id,status,line_count,warnings[]}` · closed → `409 HRM-ATT-SHEET-LOCKED` | **RETAIN** · AC harden FUNNEL · **≠** AGG = FR-10 DONE |
| `POST …/submit` | LIVE · **must** call `aggregateAttendanceSheetLines` before/as `submitted` | **RETAIN** · F5 AC · ≠ ATT-11 DONE |
| Payable formula | LIVE `standard + paidLeave + ot` · penalty **not** subtracted | **RETAIN gold GĐ1** · −penalty **OUT** |
| OT weighted | LIVE Σ `total_hours × COALESCE(coefficient, 1.5)` approved | **RETAIN** · FAIL raw AC |
| Leave buckets | Via `attendance_records` leave · unpaid heuristic | **RETAIN** · cite ATT-09 · DENY `att_leave_hold` |
| `late_penalty_hours` | Written on AGG (ATT-02 evaluate) | **RETAIN display** · CFG≠ATT-02 DONE |
| Warnings | LIVE codes `AGG_*` | **RETAIN** · WARN AC · ≠ invent ATT-11 block DONE |
| HOL / MEAL writer | **ABSENT** / NULL | **OUT GĐ1** · HOLD invent |
| `GET …/attendance-sheets/:id` | LIVE returns **header** (scope parity) | **RETAIN peer** · `lines[]` / `statusLabelVi` thin DISP — **FE-derive prefer** · optional BE enrich **ONLY if** FE proves closable gap |
| Close / sign peers | PRESENT | **peer RETAIN** · **OUT invent = ATT-10 DONE** |
| Nest `@Controller('core')` | **ABSENT** · CoreModule = DB export only | **DENY invent** |
| `att_leave_hold` / second ledger | **ABSENT** | **DENY invent** |
| Source cite | `attendance.controller` · `AttendanceSheetSignService` · `att-timesheet-line-aggregate.ts` | Docs-only this seat |

**FORBIDDEN invent this seat (docs):** Nest `@Controller('core')` · invent second hour ledger · invent `att_leave_hold` · invent HOL/MEAL/−penalty DONE · wipe LIVE spines / ATT-09/08/02/PLT/CORE · invent PAY/printable/Word DONE · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT UAT · claim CFG=ATT-02 DONE · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-*.

---

## 3. Path & alias lock (O1/O9)

| Plane | Path |
|-------|------|
| **PHYSICAL aggregate (F-ATT-SHEET-01 / AGG)** | **`POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate`** |
| **PHYSICAL submit** | **`POST /api/hrm/attendance/attendance-sheets/{sheetId}/submit`** |
| **PHYSICAL GET peer (F-ATT-SHEET-04)** | **`GET /api/hrm/attendance/attendance-sheets/{id}`** |
| **PHYSICAL close/sign (ATT-11 peer OUT invent DONE)** | `POST …/close` · `…/reopen` · `…/signatures` — **cite only** · **≠** ATT-10 DONE |
| **LOGICAL (paper)** | `POST /api/hrm/att/attendance-sheets/aggregate` · `/api/hrm/core/…` — **alias only** |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. |
| QA Network assert | Path **contains** `/attendance/attendance-sheets` — **FAIL O9** if FE hits Nest `/core/*` as AGG SoT |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| F-ATT-SHEET-01 / AGG-01 `/att/…/aggregate` | **`POST /attendance/attendance-sheets/{sheetId}/aggregate`** | UPSERT `att_timesheet_line` under `attendance_sheets` |
| Submit must AGG | **`POST …/submit`** | AGG then status→submitted |
| F-ATT-SHEET-04 GET | **`GET …/attendance-sheets/{id}`** | header (+ optional lines enrich) |
| F-ATT-SHEET-02/03 + WF-SIGN | close / reopen / signatures | **ATT-11 OUT** invent = ATT-10 DONE |
| Nest `/core` | — | **DENY invent** |
| Paper held / `att_leave_hold` | LIVE **`pending_days`** (ATT-09) | **must_keep** · **DENY dual** |

**Prefer rule (normative):** Dev **MUST NOT** invent Nest `@Controller('core')`, second hour ledger, or `att_leave_hold`. Physical remain under **`@Controller('attendance')`**.

---

## 4. F-ATT-SHEET-01 / AGG — F.1 RETAIN cite (normative)

### 4.1 Header

| | |
|--|--|
| **Function ID** | **F-ATT-SHEET-01** (= **F-ATT-SHEET-AGG-01** write) |
| **METHOD / path (physical)** | **`POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate`** |
| **Paper alias** | `POST /api/hrm/att/attendance-sheets/aggregate` · `/api/hrm/core/…` — **alias only** |
| **change_mode** | **RETAIN cite** LIVE · residual = AC harden FUNNEL/PAYABLE/OT/WARN (no new path) |
| **Table** | `public.att_timesheet_line` UPSERT UQ `(header_id, employee_id)` · read `public.attendance_sheets` |

### 4.2 Mục đích

Cấp API vật lý để **gộp phễu giờ công tính lương** của một kỳ bảng công (chuẩn / OT đã × hệ số / phép paid·unpaid / phạt display / `payable_hours`) theo **BR-BP-TS-01** / SRS **FR-UC-BP-ATT-10 Diễn biến #1–#2** — materialize `att_timesheet_line` trước khi HCNS rà soát và gửi chờ ký; **không** thay Nest `/core` AGG SoT; **không** invent second hour ledger; **không** claim AGG alone = FR-10 / ATT-10 DONE; **không** invent ATT-11 close/sign DONE; **không** invent PAY/printable DONE; **không** invent HOL/MEAL/−penalty DONE; **không** claim ATT module UAT.

### 4.3 Nghiệp vụ xử lý

1. **AuthZ + U19 scope** — resolve company/slug như LIVE attendance-sheets family (list = get = mutate AGG); OOS → `HRM-SCOPE-409` / 404 (không empty-mask).
2. **Load header** — `{sheetId}` ∈ scope; missing → `HRM-AS-404`.
3. **Closed lock** — header `status=closed` → **`409 HRM-ATT-SHEET-LOCKED`** (no UPSERT).
4. **Date window** — resolve `start_date`/`end_date` via day-key (cấm `String(Date).slice`); invalid → warning `AGG_SHEET_DATE_INVALID` · `line_count=0`.
5. **Sources (RETAIN)** — `attendance_records` (present/leave) · approved `overtime_requests` × `COALESCE(coefficient,1.5)` · approved `late_early_requests` → `late_penalty_hours` via ATT-02 evaluate peer (**CFG≠ATT-02 DONE**).
6. **UPSERT lines** — per enrolled employee: `standard_hours` · `ot_hours_weighted` · `paid_leave_hours` · `unpaid_leave_hours` · `payable_hours` · `late_penalty_hours` · `work_days` · `line_locked=false` until close.
7. **Payable gold GĐ1** — `payable_hours = standard_hours + paid_leave_hours + ot_hours_weighted` (±0.01) · **do not** subtract `late_penalty_hours` · unpaid **excluded**.
8. **OT** — only weighted hours enter payable · raw OT into payable = **FAIL AC**.
9. **HOL / MEAL** — dedicated writers **OUT GĐ1** · null/ABSENT OK · **DENY** silent invent.
10. **Warnings** — emit LIVE codes when applicable (`AGG_RECORDS_UNAVAILABLE` · `AGG_OT_ENROLL_UNAVAILABLE` · `AGG_EMPTY_ENROLLMENT` · `AGG_LINE_COUNT_ZERO` · …) · block-chốt = ATT-11 peer · **≠** invent ATT-11 DONE.
11. **Response** — `{ sheet_id, status, line_count, warnings[] }` · Nest `/core` **0** · footer **≠ ATT-10 DONE**.
12. **DENY** Nest `@Controller('core')` dual · invent second ledger · invent `att_leave_hold` · wipe ATT-09/08/02/PLT/CORE · invent PAY.

### 4.4 Tham chiếu bước SRS

| Bước | SRS | API action |
|------|-----|------------|
| Diễn biến **#1** | Chọn kỳ / phạm vi sheet | Resolve `{sheetId}` + scope |
| Diễn biến **#2** | Gộp phễu → dòng giờ công tính lương | UPSERT `att_timesheet_line` · gold payable · warnings |
| BR-BP-TS-01 | Một kỳ một bảng · OT đã hệ số · PAY không nhân lại | Weighted OT only · DENY PAY re-multiply |
| Thành công (partial) | Lines materialize · HCNS rà soát | `line_count` · warnings · **≠** FR-10 DONE alone · UC kế ATT-11 OUT invent |

### 4.5 Request / Response → DB

| Direction | Contract |
|-----------|----------|
| **Request** | Path `{sheetId}` · query/header `company_id` (scope) · body `{}` |
| **DB write** | `att_timesheet_line`: `standard_hours`, `ot_hours_weighted`, `paid_leave_hours`, `unpaid_leave_hours`, `payable_hours`, `late_penalty_hours`, `work_days`, `line_locked` |
| **DB read** | `attendance_sheets` · `attendance_records` · `overtime_requests` · `late_early_requests` (+ ATT-02 CFG evaluate) |
| **Response** | `{ sheet_id, status, line_count, warnings: string[] }` |
| **Lỗi** | `409 HRM-ATT-SHEET-LOCKED` · `HRM-AS-404` · `HRM-SCOPE-409` |

---

## 5. Submit — F.1 RETAIN cite MUST AGG (normative)

### 5.1 Header

| | |
|--|--|
| **Function ID** | Submit peer gate (F-ATT-SHEET-01 family · OPEN-Q2 FROZEN) |
| **METHOD / path (physical)** | **`POST /api/hrm/attendance/attendance-sheets/{sheetId}/submit`** |
| **Paper alias** | `/att/…` · `/core/…` — **alias only** |
| **change_mode** | **RETAIN cite** LIVE · **must** invoke AGG |

### 5.2 Mục đích

Cấp API vật lý để **gửi bảng công chờ ký** (Diễn biến **#3**) — trước khi đổi trạng thái sang `submitted`, hệ thống **bắt buộc** chạy AGG để lines PRESENT; **không** claim ATT-11 close/sign DONE; **không** bypass AGG.

### 5.3 Nghiệp vụ xử lý

1. Scope + load header (same family as AGG).
2. `closed` → `409 HRM-ATT-SHEET-LOCKED`.
3. `submitted` → idempotent re-AGG allowed (rebuild before close) · return lines meta.
4. `draft|open` → **call AGG** → UPDATE `status='submitted'` → return `{ sheet_id, status:'submitted', line_count, warnings? }`.
5. After **2xx**: lines PRESENT (or honest `warnings` + `line_count`) · FE F5 còn · Nest `/core` **0**.
6. **FAIL AC** if submit 2xx without AGG invoke.
7. **≠** invent ATT-11 DONE · **≠** ATT-10 DONE from submit alone.

### 5.4 Tham chiếu bước SRS

| Bước | SRS | API action |
|------|-----|------------|
| Diễn biến **#3** | HCNS rà soát → gửi chờ ký | submit → AGG → `submitted` |
| Thành công | Trạng thái chờ ký · lines còn · F5 | F5 AC · UC kế = ATT-11 **OUT** invent DONE |

---

## 6. GET sheet peer + display-ready DTO (normative cite)

### 6.1 F-ATT-SHEET-04 peer RETAIN

| | |
|--|--|
| **Function ID** | **F-ATT-SHEET-04** (peer · ≠ ATT-10/PAY DONE) |
| **METHOD / path** | **`GET /api/hrm/attendance/attendance-sheets/{id}`** |
| **Mục đích** | Facade đọc sheet cho ATT UI rà soát; PAY whitelist chỉ khi `closed` (boundary — **PAY OUT invent DONE** this seat). |
| **Nghiệp vụ xử lý** | Resolve scope = list; return header; ATT UI may read draft/submitted; **≠** invent ATT-11/PAY DONE. |
| **Tham chiếu bước SRS** | FR-UC-BP-ATT-10 Diễn biến **#3** (rà soát) · peer PAY-01 cite only |
| **AS-IS** | Header row PRESENT · full `lines[]` envelope **thin residual** |
| **DISP rule** | Prefer **FE-derive** `statusLabelVi` from `status` (`open`/`draft`→*Nháp* · `submitted`→*Chờ ký* · `closed`→*Đã chốt*) · bind gold fields from AGG aftermath / line source when available · **optional thin BE** GET enrich `lines[]`+`statusLabelVi` **ONLY if** FE proves closable gap for J-* gold assert |

### 6.2 Display-ready contract (cite · HOLD schema invent)

| DTO field | Rule |
|-----------|------|
| `sheet_id` | header id |
| `status` | open\|submitted\|closed (draft peer OK) |
| `statusLabelVi` | wire **or** FE-derive |
| `line_count` | ≥0 after AGG |
| `warnings[]` | AGG codes LIVE |
| `lines[].employee_id` | required when lines present |
| `lines[].employee_name?` | optional enrich |
| `lines[].standard_hours` | PRESENT · interim default-8 OK · ≠ STD DONE if interim |
| `lines[].ot_hours_weighted` | PRESENT · FAIL if raw in payable |
| `lines[].paid_leave_hours` | PRESENT |
| `lines[].unpaid_leave_hours` | PRESENT · ∉ payable |
| `lines[].late_penalty_hours` | display · not −payable GĐ1 |
| `lines[].meal_shift_hours?` | null/ABSENT GĐ1 · footer OUT |
| `lines[].holiday_hours?` | ABSENT GĐ1 · footer OUT |
| `lines[].payable_hours` | gold assert ±0.01 |
| `lines[].work_days` | PRESENT |
| `lines[].line_locked` | true when closed |

**Residual wire disposition:** FUNNEL/STD/LEAVE/PAYABLE/OT/WARN = **AC journey** (no new Nest path). DISP = FE bind prefer · thin BE **optional if proven**. HOL/MEAL/−penalty = **HOLD OUT** · **DENY** invent DONE.

---

## Footer — honesty (every section)

> **honesty false** · **printable false RETAIN** · **≠ ATT-10 DONE** · Nest `/core` DENY · DENY invent `att_leave_hold` · DENY second hour ledger · C-SLICE

---

## 7. Residual unlock map

| Residual | Closable BE wire this seat? | Unlock |
|----------|----------------------------|--------|
| **R-ATT-10-FUNNEL** | NO (cols LIVE) | FE+QA AC/footer |
| **R-ATT-10-STD** | NO (interim default-8 HOLD) | FE+QA · ≠ STD DONE |
| **R-ATT-10-LEAVE** | NO (day-record path LIVE · ATT-09 cite) | FE+QA · DENY `att_leave_hold` |
| **R-ATT-10-HOL** | NO — **OUT GĐ1** | HOLD invent |
| **R-ATT-10-MEAL** | NO — **OUT GĐ1** | HOLD invent |
| **R-ATT-10-PAYABLE** | NO (gold LIVE) | FE+QA gold assert · −penalty OUT |
| **R-ATT-10-OT** | NO (coef LIVE) | FE+QA FAIL raw |
| **R-ATT-10-WARN** | NO (warnings LIVE) | FE+QA · ≠ ATT-11 DONE |
| **R-ATT-10-DISP** | Thin GET `lines[]`/`statusLabelVi` **optional** | Prefer FE-derive · BE **ONLY if** FE proves |
| **R-ATT-10-≠-DONE / PAY-OUT** | N/A | Footer · DENY invent |

**Verdict unlock_lane:** **FE + QA** (prefer) · **Dev-BE HOLD** invent Nest dual / HOL/MEAL/−penalty / second ledger / `att_leave_hold` / PAY / ATT-11 DONE.

---

## 8. U19 scope parity

| Surface | Resolver | Rule |
|---------|----------|------|
| attendance-sheets list/get/mutate/aggregate/submit | hrm list-scope TEXT slug family | list **=** get-by-id **=** mutate AGG |
| Lines under sheet | same company scope as header | no cross-CT line write |
| ATT-09 leave peers (cite) | same attendance family | **must_keep** · held=`pending_days` |
| ATT-02 late_penalty peer | same family | **CFG≠ATT-02 DONE** |

---

## 9. Traceability (requirement → API → FE → test)

| BR/AC | API | FE / J-* | Expect |
|-------|-----|----------|--------|
| BR-BP-TS-01 · AC-ATT-10-AGG/FUNNEL/PAYABLE/GOLD/OT | F-ATT-SHEET-01 / AGG | **J-HRM-ATT-10-01..04** DRAFT | gold payable · Nest `/core` 0 · ≠ AGG=DONE |
| AC-ATT-10-SUBMIT/F5 | `POST …/submit` | **J-02/06** | lines after 2xx · F5 |
| AC-ATT-10-FOOTER HOL/MEAL | OUT GĐ1 | footer | ABSENT/null OK · no invent |
| AC-ATT-10-LEAVE · MK-ATT09 | day-records + ATT-09 cite | **J-03/04** | unpaid ∉ payable · DENY `att_leave_hold` |
| AC-ATT-10-WARN · ≠-11 | warnings[] | **J-05** | warn codes · ≠ invent ATT-11 DONE |
| AC-ATT-10-DISP | GET/AGG bind | **J-05/06** | FE bind · statusLabelVi |
| AC-ATT-10-PATH | Nest `/attendance` | all J-* | Nest `/core` **0** |
| AC-ATT-10-MK-* / H / PAY-OUT | seals | footer | ATT-09/08/02/PLT/CORE ≠ DONE · printable false · CFG≠DONE · C-SLICE |

---

## 10. must_keep / DENY checklist

| Lock | Rule |
|------|------|
| ATT09QC1-MSLUTL9D | RETAIN hold/settle · `pending_days` · DENY `att_leave_hold` · Nest `/core` leave 0 · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT |
| ATT08QC1-MSLSL36C | RETAIN preview · T6→T2=2 · HOL-MISS · ALIGN · R-ATT-08-PREVIEW-FE CLOSED · client-days≠DONE · ≠ ATT UAT · **≠** claim = ATT-09 DONE |
| ATT02QC1-MSLQZUK7 | RETAIN · **CFG≠ATT-02 DONE** · late_penalty peer · ≠ ATT UAT |
| PLT01QC1-MSLPUQIU | RETAIN · peer≠PLT DONE · merge≠platform UAT |
| CORE10QC1-MSLP0EJB | RETAIN · ≠ CORE-10 DONE |
| CORE09QC1-MSLNBA89 | printable **false** · ≠ CORE-09 DONE |
| CORE07QC1-KZJTSHNT | GATE/ACT · Nest DENY · soft≠CORE-06 DONE |
| LIVE AGG + `att_timesheet_line` | **RETAIN** · **≠** ATT-10 DONE from AGG alone |
| Nest `/core` | **DENY** dual · paper alias only |
| Second hour ledger / `att_leave_hold` | **DENY** invent |
| HOL/MEAL/−penalty DONE | **OUT GĐ1** · HOLD invent |
| PAY / printable / Word / ATT-11 | **OUT invent DONE** |
| Honesty | **DENY** flip · C-SLICE · `attendance_uat_ready=false` |
| apps/** / seed | **CẤM** this seat / U65 |

---

## 11. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See §12 |
| **next_owner** | `pm` → **dev-fe** + **qa** (prefer) · Dev-BE HOLD unless closable thin DISP wire proven |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md` |
| **unlock_lane** | **FE+QA** (RETAIN LIVE) |
| **next_dispatch_prompt** | See §13 |

---

## 12. completion_report

**Closed:** SA API F.1 **CONFIRMED RETAIN** for UC-BP-ATT-10 / FR-UC-BP-ATT-10 — cite **F-ATT-SHEET-01 / AGG** physical `POST /api/hrm/attendance/attendance-sheets/{sheetId}/aggregate` UPSERT `att_timesheet_line`; **RETAIN** `POST …/submit` **MUST** AGG (OPEN-Q2) · lines PRESENT · F5; **RETAIN** GET peer F-ATT-SHEET-04 cite; display-ready `sheet_id`·`status`·`statusLabelVi`(FE-derive OK)·`line_count`·`warnings[]`·`lines[…]`; payable gold GĐ1 = `standard+paidLeave+otWeighted` · `late_penalty` display · unpaid excluded · HOL/MEAL/−penalty **OUT GĐ1**; paper `/att`+`/core` **alias only** · Nest `@Controller('core')` **DENY** · **DENY** second hour ledger · **DENY** invent `att_leave_hold`; must_keep ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · ≠ ATT UAT · PAY OUT; closable BE wire for AGG/submit/payable **NOT required** (LIVE PRESENT) → unlock **prefer FE+QA**; optional thin BE GET `lines[]`/`statusLabelVi` **ONLY if** FE proves DISP gap; DENY invent PAY/printable · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT UAT · honesty flip · seed · apps/**.

**Residual open (execution):** R-ATT-10-FUNNEL/STD/LEAVE/PAYABLE/OT/WARN/DISP AC via U65 **J-HRM-ATT-10-01..06 DRAFT** — FE bind + QA browser · BE optional thin **ONLY if** FE proves GET envelope gap. HOL/MEAL/−penalty remain **OUT GĐ1**. Explicit **≠ ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ ATT module UAT · printable false · C-SLICE · honesty false**.

---

## 13. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01 (+ QA-01 parallel)
role: dev-fe (+ qa)
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-28 seat #30)
entry_criteria: API-01 CONFIRMED RETAIN @ docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md · DATA-01 HOLD · BA O1–O12 · SA Option A · unlock_lane FE+QA · Dev-BE HOLD invent · must_keep ATT09QC1-MSLUTL9D hold/settle pending_days DENY att_leave_hold · ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · Nest /core DENY · soft/ATT-08≠ATT-09 DONE · ≠ ATT UAT · PAY OUT · DENY second hour ledger
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md (F.1 F-ATT-SHEET-01/AGG · submit MUST AGG · display-ready · unlock FE+QA)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md (AC-ATT-10-* · J-HRM-ATT-10-01..06 DRAFT)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md (attendance_sheets + att_timesheet_line HOLD · payable gold · HOL/MEAL OUT)
  - docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qc-01.md (must_keep ATT09QC1-MSLUTL9D)
exit_criteria:
  - FE: bind chọn kỳ → Network POST /api/hrm/attendance/attendance-sheets/{id}/aggregate 2xx · lines/line_count SoT PRESENT · submit MUST AGG · F5; display-ready sheet_id·status·statusLabelVi(FE-derive OK)·line_count·warnings[]·lines gold (payable=std+paidLeave+otW · late_penalty display · unpaid∉ · HOL/MEAL footer OUT); Nest /core 0
  - QA U65: J-HRM-ATT-10-01..06 DRAFT browser — login→menu→AGG/submit→lines SoT→OT weighted FAIL raw→payable gold→warnings/409 LOCKED→F5; zero-seed; FAIL if Nest /core SoT · invent att_leave_hold · second ledger · AGG alone claimed DONE · ATT-11/PAY invent DONE · soft/ATT-08=ATT-09 DONE · claim ATT UAT · CFG=ATT-02 DONE
  - Explicit ≠ ATT-10 DONE from AGG alone · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT
  - Dev-BE: HOLD unless FE proves closable thin GET lines[]/statusLabelVi envelope gap (then separate BE-01) — DENY invent Nest /core · HOL/MEAL/−penalty DONE · second ledger · att_leave_hold · PAY · ATT-11 DONE
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-fe-01.md (+ qa-01)
  - ack_status READY_FOR_QA / PASS_TO_PM
cấm: apps/** invent Nest /core · invent att_leave_hold dual · invent second hour ledger · invent HOL/MEAL/−penalty DONE · wipe ATT-09/08/02/PLT/CORE · seed · honesty flip · invent PAY/printable/Word DONE · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE
```

---

*End API-01 · CONFIRMED RETAIN · unlock FE+QA · 2026-08-09*
