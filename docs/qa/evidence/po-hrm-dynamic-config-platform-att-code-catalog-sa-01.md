# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01` |
| **role** | sa (governance) |
| **Program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **spec_path** | [`../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md) |
| **Verdict** | **CONFIRMED — Option B** (Nest `att_attendance_code` open catalog · DEFINE new table) |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · **`C-SLICE-≠-MODULE`** · U65 zero-seed · docs-only |

---

## 1. Re-dispatch note (R2)

Prior seat `23b54d7d` = **INVALID-HANDOFF** (turn_ended success, ZERO files). This seat writes **both** spec + evidence on disk before exit (Glob confirmation §6).

## 2. MUST-READ ack (spec_read)

| Source | § read | Extract |
|--------|--------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md) | §2.3 ATT row · §2.1 · BR-PLT-01..06 · §2.6 closed-enum clarify | «Attendance codes / work sites → Open catalog codes + sites CRUD Settings · Catalog · **GĐ1**»; work-sites already OWN by peer → this seat owns **attendance codes** (day-code / ký hiệu công) |
| [`ATT-LEAVE-CATALOG-SA-01`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md) | Option B · L-ATT-LEAVE-01..10 · F-ATT-CAT-LVT/EFF | **cite ≠ copy** — leave **sub-type** SoT `att_leave_type`; orthogonal to day-code; SEAL RETAIN |
| [`ATT-WORKSITE-CATALOG-SA-01`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md) | Option B · L-ATT-WS-* | **cite** — work-sites Nest SoT; OUT this pack; SEAL RETAIN |
| [`EMP-STATUS-CATALOG-SA-01`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-SA-01.md) | Option B DEFINE (no table) · L-EMP-ST-07 transition graph stays code | **closest structural peer** — DEFINE new Nest catalog + typed flags + semantics stay code |
| [`EMP-POSITION-CATALOG-SA-01`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md) / DEPT | Option A precedent | Settings producer LIVE → Option A; **not** applicable here (no producer) |

## 3. AS-IS grep (evidence trail)

| Probe | Path | Finding | Class |
|-------|------|---------|-------|
| Attendance-record status enum | `apps/api/hrm-api/src/attendance/dto/create-attendance-record.dto.ts` | `@IsIn(['pending','present','absent','leave'])` closed enum on `status` | **H** hardcode ceiling |
| Consumer assert | `apps/api/hrm-api/src/attendance/attendance.service.ts:507` | `createRecord`: `status = payload.status ?? 'pending'` — **no** catalog assert (unlike leave `assert ∈ EFF`) | gap |
| FE label/badge map | `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx:142,171-193,299-304` | Hardcoded `API_STATUS_OPTIONS` + label map + badge variant + `<Select>` with richer keys `present·early_leave·absent·on_leave·leave·pending` — **divergent** from BE 4-enum (`early_leave`/`on_leave` not accepted) | **H** + divergence |
| Aggregate counting | `apps/api/hrm-api/src/attendance/att-timesheet-line-aggregate.ts:100-111` | Counts by hardcoded `status==='present'` (→standard) / `status==='leave'` (→paid/unpaid via `isUnpaidLeaveTypeKey`) | **sealed code** — GĐ2 flag wiring |
| Nest attendance-code table | grep `att_attendance_code` / `attendance_code` / `day_type` / `symbol` across `apps/api/hrm-api/src` | **absent** (only `att_leave_type` leave sub-type + funnel + aggregate) | **DEFINE** needed |
| Settings producer | Settings MD partition `attendance_codes` | **absent** (no LIVE producer, unlike EMP-CUSTOM extension-items) | Option A rejected |
| Work-sites peer LIVE | `apps/api/hrm-api/src/attendance/attendance-config.service.ts:135-556` | `attendance_work_sites` CRUD + soft-retire LIVE — separate SoT, OUT this pack | RETAIN |

**Decision rule applied (per dispatch):** producer absent + hardcode residual → **Option B Nest** (peer leave/work-sites/EMP-STATUS). Option A Settings only if producer LIVE → **N/A**.

## 4. Verdict — CONFIRMED Option B

| | |
|--|--|
| **Selected** | **Option B** — Nest `public.att_attendance_code` = authoritative open attendance-code catalog SoT (symbol/label + typed flags); future Settings partition = group REF merge-read; consumer picker/assert when EFF>0; invent → `HRM-ATT-CODE-KEY`. |
| **Rejected A** | Settings MD sole SoT — no producer LIVE + weak typed-flag home; peers rejected MD-alone. |
| **Rejected C** | Hybrid / mega-EAV / fold into `att_leave_type`/`work_shifts` / rewrite aggregate / flip UAT — DENY (honesty · seal churn · payroll regression). |
| **Weighted** | A 66 · **B 110** · C 18. |
| **Counting lock** | L-ATT-CODE-07 — `att-timesheet-line-aggregate` + payroll/LIST-TOTALS remain sealed code GĐ1; typed flags physical for **GĐ2** wiring only. |
| **Orthogonality lock** | L-ATT-CODE-08 — attendance-code ≠ leave sub-type ≠ work_shifts ≠ work-sites ≠ emp status. |

## 5. Gate decisions

| Gate | Decision |
|------|----------|
| ba-process | **UNLOCK** — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01` AC pack |
| ba-data | **UNLOCK** — physical ADD `att_attendance_code` (DEFINE class, peer EMP-STATUS) |
| BE | **HOLD** until BA + DATA CONFIRMED |
| FE | After BA — Nest EFF picker + symbol/label; reconcile `early_leave`/`on_leave` divergence |
| scope_parity (U19) | list ↔ get-by-id ↔ consumer assert same `resolveHrmListScope` — required in BE wave |
| Seals | RETAIN — `EMPDEPTQA-MSK3VVXX` · `EMPPOSQA2-MSK3CDH1` · `EMPSTQA-MSK20G7H` · `EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1` · ATT leave/work-sites · SI/CTR · payroll/LIST-TOTALS |

## 6. Self-check (Glob both files before exit)

| File | Status |
|------|--------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md` | ✅ written (see §7 Glob) |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-sa-01.md` | ✅ this file |

## 7. Explicit OUT / DENY

- No `apps/**` · no seed · no flip `attendance_uat_ready`/`payroll_e2e_ready` · no module ATT UAT · no Phase1.
- No reopen ATT leave / work-sites / sign / J-HRM-06c · EMP dept·pos·status·custom·token-ext · SI · CTR · PAY/DEC/REC/LIST-TOTALS.
- No rewrite payroll aggregate; no fold into leave-type/work_shifts.
- No invent KEY schema `/api/hrm/platform/att/*` mega catalog; no empty CTA fake density.

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Option **B CONFIRMED LOCKED** — attendance-code (ký hiệu công) open catalog SoT = Nest `att_attendance_code` (DEFINE); typed flags for GĐ2 payroll wiring; closed DTO enum + FE hardcode divergence = residual after DATA; counting/payroll aggregate RETAIN sealed code; Option A REJECT (no producer); leave/work-sites/sign/EMP/SI/CTR/payroll RETAIN; ba-data + ba-process UNLOCK; BE HOLD; honesty attendance/payroll false; `C-SLICE-≠-MODULE`. |
| **next_owner** | `ba-process` (+ `ba-data` parallel) |
| **next_dispatch_prompt** | `Task ba-process — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01: read SA §5–§7; enumerate consumer UF/J-* (Chấm công bảng ghi công create/update status; Settings attendance-code CRUD tab); BR condition→action→outcome; VAL-ATT-CODE-CNS-01..04; lock leave sub-type ≠ day-code; counting stays code GĐ1. Parallel Task ba-data — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01: physicalize public.att_attendance_code per SA §6.3 (typed flags counts_as/day_weight/is_paid, UQ (company_id, lower(code)) active, soft-delete) + EXPAND drop closed IsIn ceiling; no second ATT table; no fold att_leave_type; no seed. Docs-only; BE HOLD; U65; attendance_uat_ready=false.` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-sa-01.md` |
