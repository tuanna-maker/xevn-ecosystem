# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — AC pack Option B (Nest `att_attendance_code` SoT · admin open N+1 ≠ consumer invent · counting sealed GĐ1) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01` CONFIRMED Option **B** |
| **parallel** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01` — BE **HOLD** until BA **+** DATA both CONFIRMED |
| **ref_sa** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md) |
| **ref_sa_evidence** | [`po-hrm-dynamic-config-platform-att-code-catalog-sa-01.md`](po-hrm-dynamic-config-platform-att-code-catalog-sa-01.md) |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md) |
| **Verdict** | **CONFIRMED** |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · browser AC measurable |
| **OS honesty** | `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` · `payroll_e2e_ready=false` · DENY leave/worksite/sign/J-06c reopen · DENY EMP/SI/CTR reopen · DENY aggregate rewrite · DENY module ATT UAT |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **ATT leave / work-sites / sign / J-HRM-06c** | **SEAL RETAIN** | **cấm reopen** without warrant |
| **EMP** `EMPDEPTQA-MSK3VVXX` · `EMPPOSQA2-MSK3CDH1` · `EMPSTQA-MSK20G7H` · `EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** | **cấm reopen** |
| **SI / CTR / PAY / LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** · **cấm** aggregate rewrite |
| **Module ATT UAT / Phase1** | **DENIED** | Slice AC ≠ module GO |
| **ba-data EXPAND** | **UNLOCK** · Nest ADD | Parallel DATA-01 · closed IsIn DROP residual |
| **BE** | **HOLD** until BA+DATA | |
| **Seed** | **DENIED** (U65) | |
| **Settings-MD-only picker SoT** | **DENIED** | Option A REJECT retained |
| **Fold leave / worksite / `work_shifts` / mega-EAV** | **DENIED** | L-ATT-CODE-08/14 |
| **Aggregate rewrite GĐ1** | **DENIED** | L-ATT-CODE-07 · typed flags physical only |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| SA Option B | `ATT-CODE-CATALOG-SA-01` L-ATT-CODE-01..14 · F-ATT-CAT-CODE-* · §7 AC/VAL draft |
| SA evidence | Closed DTO IsIn · FE divergence · aggregate sealed · Nest absent → DEFINE |
| Platform BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01` **BR-PLT-02/04/05/06** · ATT §2.3 «Attendance codes» GĐ1 · §2.6 clarify |
| Peer EMP-STATUS BA | Option **B** DEFINE Nest + semantics-stay-code — **cite ≠ copy** |
| Peer ATT-LEAVE BA | Option **B** admin≠consumer Nest EFF — **cite ≠ copy** · leave ≠ day-code · **SEAL RETAIN** |
| Peer ATT-WORKSITE | Nest geofence — **cite** · **OUT fold** · **SEAL RETAIN** |
| SRS | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-01/02/10/11** |
| DB | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4 `attendance_records.status` · no attendance-code table |
| Journey / UF | `PROGRAM_JOURNEY_MAP` J-HRM-06/06b/06c · `USER_FLOW` UF-HRM-05 — **RETAIN** load; mutate = proposed J-HRM-ATT-CODE-CAT-* |
| Prior seals | EMP stamps · ATT leave/worksite · SI/CTR |

**Không đụng:** `apps/**` · seed · flip ready · reopen seals · fold leave/worksite · aggregate rewrite · module ATT UAT · Phase1.

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md) | Objective · AS-IS/TO-BE · BR-PLT-ATT-CODE-01..14 · surface matrix S-ATT-CODE-ADM/CNS/REF/OUT · UC catalog · AC-PLT-ATT-CODE-01/01b/01c/01d/01e/01f/01H · VAL-ATT-CODE-CNS-01..10 · error taxonomy · honesty · handoff |

---

## 3. AC pack summary (machine-readable)

| ID | Intent | Pass signal |
|----|--------|-------------|
| **AC-PLT-ATT-CODE-01** | Consumer record picker from EFF when active ≥1 | GET F-ATT-CAT-CODE-EFF-01 · 2xx · F5 status ∈ catalog |
| **AC-PLT-ATT-CODE-01b** | Invent unknown day-code on record | **4xx** `HRM-ATT-CODE-KEY` · no F5 persist |
| **AC-PLT-ATT-CODE-01c** | EFF active =0 | Soft empty + CTA admin · invent skip · no fake/seed · admin CREATE still OK |
| **AC-PLT-ATT-CODE-01d** | Admin CREATE open N+1 | **2xx/201** F-ATT-CAT-CODE-02 · F5 · no «must pick only» · no closed IsIn ceiling |
| **AC-PLT-ATT-CODE-01e** | Soft-retire | Picker ẩn · history OK |
| **AC-PLT-ATT-CODE-01f** | Display / FE reconcile | Catalog symbol/label when EFF>0 · no divergent hardcode sole SoT |
| **AC-PLT-ATT-CODE-01H** | Honesty / seals | ready=false · seals retain · C-SLICE · no fold · no aggregate rewrite |
| **VAL-ATT-CODE-CNS-01** | Record OOS when EFF>0 | 4xx KEY · **MIGRATE** after DATA+BE |
| **VAL-ATT-CODE-CNS-02** | Admin N+1 open | 2xx |
| **VAL-ATT-CODE-CNS-03** | Scope drift | jest FAIL / 409 |
| **VAL-ATT-CODE-CNS-04** | Soft-retire hide + history | hide · history OK |
| **VAL-ATT-CODE-CNS-05** | Empty EFF skip | skip · CTA · no seed |
| **VAL-ATT-CODE-CNS-06** | MD/hardcode sole when EFF>0 | FAIL AC-01/01f |
| **VAL-ATT-CODE-CNS-07** | Closed IsIn DROP residual | open slug persist after DATA |
| **VAL-ATT-CODE-CNS-08** | Display-ready | symbol/`status_label` from catalog |
| **VAL-ATT-CODE-CNS-09** | KEY taxonomy | ≠ LEAVE-TYPE-UNKNOWN / EMP KEY |
| **VAL-ATT-CODE-CNS-10** | Aggregate non-claim | FAIL if rewrite this seat |

### Surface split (L-ATT-CODE-01)

| Class | Surf IDs |
|-------|----------|
| **ADMIN** | S-ATT-CODE-ADM-01 |
| **CONSUMER** | S-ATT-CODE-CNS-01 (primary) · S-ATT-CODE-CNS-02 (display) |
| **REF only** | S-ATT-CODE-REF-01 |
| **OUT** | leave · worksite · shifts · sign/J-06c · aggregate rewrite · EMP/SI/CTR |

### Locks confirmed

| Lock | BA stamp |
|------|----------|
| Nest `att_attendance_code` = SoT · Settings REF if any | **L-ATT-CODE-02/03** · BR-PLT-06 |
| Admin CREATE open N+1 ≠ consumer invent | **01d** vs **01/01b** |
| Empty EFF soft+CTA · no seed | **01c** |
| DROP/REPLACE closed DTO `@IsIn` pending\|present\|absent\|leave | **VAL-ATT-CODE-CNS-07** · residual DATA+BE |
| L-ATT-CODE-07 counting/LIST-TOTALS sealed GĐ1 | **VAL-ATT-CODE-CNS-10** · typed flags physical only |
| L-ATT-CODE-08 ≠ leave · ≠ shifts · ≠ work-sites · no mega-EAV | **MK-ATT-*** · BR-PLT-ATT-CODE-11/12/13 |
| Honesty 01H · DENY flip · reopen seals | **01H** |

---

## 4. Peer cite ≠ copy

| Peer | Cited pattern | Not copied |
|------|---------------|------------|
| EMP-STATUS BA Option B | DEFINE Nest absent · admin≠consumer · empty CTA · DROP closed ceiling · semantics stay code (L-EMP-ST-07 ↔ L-ATT-CODE-07) | No reason companion · no personnel flags · different KEY/surfaces |
| ATT-LEAVE BA Option B | Admin open N+1 · invent KEY · empty CTA · Nest EFF picker · U65 | Leave already physical HOLD ≠ this UNLOCK ADD · leave KEY ≠ ATT-CODE-KEY · leave consumers ≠ record status |

---

## 5. Gate decisions

| Gate | Decision |
|------|----------|
| This seat | **CONFIRMED** AC pack |
| ba-data | **UNLOCK** parallel DATA-01 (ADD + IsIn DROP note) |
| BE | **HOLD** until BA **and** DATA CONFIRMED |
| FE | After BE — EFF picker + reconcile divergence |
| QA | After BE/FE LIVE — U65 AC-PLT-ATT-CODE-01* |
| Seals / honesty | **RETAIN** / **false** |

---

## 6. Self-check (both files on disk)

| File | Status |
|------|--------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md` | ✅ written |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-ba-01.md` | ✅ this file |

Empty = INVALID — **PASS**.

---

## 7. Explicit OUT / DENY

- No `apps/**` · no seed · no flip `attendance_uat_ready` / `payroll_e2e_ready` · no module ATT UAT · no Phase1.
- No reopen ATT leave/worksite/sign/J-06c · EMP stamps · SI/CTR · PAY/LIST-TOTALS.
- No rewrite `att-timesheet-line-aggregate` / LIST-TOTALS — typed flags physical only, GĐ2 separate.
- No fold into `att_leave_type` / `work_shifts` / `attendance_work_sites` · no mega-EAV.
- No Settings MD sole SoT · no invent KEY schema `/api/hrm/platform/att/*` mega catalog.

---

## 8. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | **CONFIRMED** AC pack **AC-PLT-ATT-CODE-01/01b/01c/01d/01e/01f/01H** + **VAL-ATT-CODE-CNS-01..10** + **BR-PLT-ATT-CODE-01..14** — Nest `att_attendance_code` = SoT; Settings REF only; admin CREATE open N+1 ≠ consumer invent **`HRM-ATT-CODE-KEY`**; empty EFF soft+CTA no seed; closed DTO `@IsIn(4)` DROP residual after DATA; **L-ATT-CODE-07** counting/LIST-TOTALS sealed code GĐ1 (typed flags physical only); **L-ATT-CODE-08** ≠ leave/worksite/shifts · no mega-EAV; honesty **01H** DENY flip attendance/payroll · reopen seals · module ATT UAT; peer EMP-STATUS/ATT-LEAVE **cite ≠ copy**; ba-data **UNLOCK**; BE **HOLD** until BA+DATA; **`C-SLICE-≠-MODULE`** · U65 · docs-only. |
| **next_owner** | **pm** → seal BA · await/seal **ba-data** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01` CONFIRMED → then **dev-be** |
| **next_dispatch_prompt** | `Task dev-be — work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01. ENTRY: BA-01 CONFIRMED + DATA-01 CONFIRMED (both required). Read docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md + SA-01 §5–§6 + DATA physical plan. Implement Nest public.att_attendance_code ensureSchema + F-ATT-CAT-CODE-01..04 + F-ATT-CAT-CODE-EFF-01 + F-ATT-CODE-CNS-01 invent → HRM-ATT-CODE-KEY when EFF>0; DROP closed CreateAttendanceRecordDto @IsIn(['pending','present','absent','leave']) ceiling (slug format OK); display-ready symbol/status_label; scope_parity list↔assert; jest VAL-ATT-CODE-CNS-01..10 smoke. FORBIDDEN: apps rewrite att-timesheet-line-aggregate / LIST-TOTALS counting (L-ATT-CODE-07 — typed flags physical only); fold into att_leave_type / work_shifts / attendance_work_sites; seed; flip attendance_uat_ready / payroll_e2e_ready; reopen EMP/ATT leave/worksite/SI/CTR seals. EXIT: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-be-01.md · next FE rebind AttendanceRecordsTable EFF picker + reconcile early_leave/on_leave. If DATA-01 not yet CONFIRMED: do NOT start BE — HOLD.` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-ba-01.md` |
