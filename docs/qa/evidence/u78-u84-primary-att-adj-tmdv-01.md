# Evidence — U78-U84-PRIMARY-ATT-ADJ-TMDV-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-ATT-ADJ-TMDV-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **FAIL** Primary cell P-ATT-ADJ @ **CO-TMDV** — FE create blocked by time wire 500 |
| **cell** | P-ATT-ADJ @ **CO-TMDV** · slug `trsport` · OU «Công ty Cổ phần Thương mại và Dịch vụ X.E» |
| **U65** | honored — no seed / no inbox seed / no invent XBOS inbox approve |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-att-adj-tmdv-01-test-log.md`](u78-u84-primary-att-adj-tmdv-01-test-log.md) · [`.json`](u78-u84-primary-att-adj-tmdv-01-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-att-adj-tmdv-01-browser.json`](_tmp-u78-u84-primary-att-adj-tmdv-01-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-att-adj-tmdv-01/` |
| **harness** | `scripts/qa/_tmp-u78-u84-primary-att-adj-tmdv-01.mjs` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` |
| **commit** | `dc930c5` |
| **L0** | HRM+XBOS **200**; portal restarted mid-wave (`dev:web-only`) then **200** |

---

## Executive verdict

**PASS_TO_PM** — U78 browser execution of Primary cell **P-ATT-ADJ @ CO-TMDV** reached FE create and **failed product** on POST:

| Layer | Result |
|-------|--------|
| **Precond employees @ trsport** | 🟢 total=**4** · staff `VTH-0007` · mgr `VTH-0002` / `uat.nv0002@xe.vn` |
| **Mount HDSD** | 🟢 `/hr/attendance` → **Quản lý đơn** → **Đề nghị cập nhật công** · **Thêm đề nghị** |
| **FD empty required** | 🟢 no POST without employee/date/reason |
| **TC-HIM-ATT-TMDV-HP-001** | 🔴 **FAIL** — FE **Thêm mới** → POST `/attendance/update-requests` **500** `HRM-SYS-001` · `invalid input syntax for type timestamp with time zone: "08:00"` |
| **TC-HIM-ATT-TMDV-AP-001** | ⬜ **not run** — no pending row from FE chain (U65: no invent) · mgr persona **available** on trsport |
| **XBOS inbox AP** | ⬜ **N/A** — GOVERNANCE_LOCK / bridge (do **not** fail for missing XBOS inbox) |
| **UAT / Phase1 / whole U84** | **not claimed** |

**promoted TC-IDs:** *(none)*  
**not_promoted:** `TC-HIM-ATT-TMDV-HP-001` · `TC-HIM-ATT-TMDV-AP-001`

---

## Persona / scope

| Field | Value |
|-------|--------|
| Account (HP) | `ceo@xe.vn` / `Xevn@2026` |
| Scope | Group CEO embed · `companyId=trsport` · OU **Công ty Cổ phần Thương mại và Dịch vụ X.E** |
| Staff pick | `VTH-0007` Phan Văn An · `manager_id` → VTH-0002 |
| Mgr on company | `VTH-0002` Trần Văn An · `uat.nv0002@xe.vn` · `mobile_persona=mgr` · `is_manager=true` |
| AP channel planned | HRM web Eye → **Duyệt** (XBOS inbox N/A) |

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1&companyId=trsport` | Yes | mount |
| 2 | Tab **Quản lý đơn** (i18n `attendance.tabs.requests`) | Yes | nav |
| 3 | Menu **Đề nghị cập nhật công** | Yes | SCR-REQ-UPDATE |
| 4 | **+ Thêm đề nghị** dialog | Yes | HP create |
| 5 | Fields: NV · Ngày chấm công · Loại · Giờ vào/ra · Lý do | Yes | fill + STAMP |
| 6 | CTA **Thêm mới** (`common.add`) | Yes | submit (= HDSD Gửi create→pending) |
| 7 | Detail Eye → **Duyệt** | Reachable UI | **not** exercised — HP fail |
| 8 | XBOS Inbox `hrm_attendance_adjustment_approval` | N/A | GOVERNANCE_LOCK |

---

## Root cause (spec says / code does)

| | |
|--|--|
| **spec / HDSD** | Tạo YC chỉnh CC (mốc ca + lý do) → Gửi → F5 pending · UC-HRM-09 / FN-REQ-UPD-CRUD |
| **FE does** | `<Input type="time">` defaults `08:00` / `17:30` · POST body `requested_check_in: "08:00"`, `requested_check_out: "17:30"` |
| **BE does** | `attendance_update_requests.requested_check_in/out` typed **TIMESTAMPTZ** · INSERT raw string → Postgres **500** `HRM-SYS-001` |
| **class** | FE–BE wire mismatch (HH:mm vs timestamptz/ISO) — **not** XBOS inbox / not missing staff |
| **L1 diagnostic (not UF)** | API POST without times → **201** `HRM-ATT-REQ-201`; with ISO timestamptz → **201**; with `"08:00"` → **500** (same as FE). **Not** promoted as HP. |

---

## IDs (this run)

| Field | Value |
|-------|--------|
| STAMP | `TMDV-ATT-DILM8D` |
| request_id | *(none — create 500)* |
| employee | `b06422c0-…` · VTH-0007 |
| attendance_date (FE body) | `2026-07-26` |
| update_type | `forgot_check` |

---

## Phase A — HP (attempted)

1. L0 · employees trsport=4 · update-requests list 200  
2. Login inject → attendance · OU TM-DV  
3. **Quản lý đơn** → **Đề nghị cập nhật công**  
4. Fail-deep empty → dialog kept / no POST  
5. Fill Phan Văn An · date · Quên chấm công · reason STAMP → **Thêm mới**  
6. Network: POST **500** `HRM-SYS-001` · message timestamptz `"08:00"`  
7. Stop — no F5 pending · no AP  

Screens: `01-attendance-mount` … `05-after-create` (dialog may remain / toast error).

---

## Phase B — AP

**Not executed.** Mgr persona exists on trsport (`uat.nv0002`) and HRM web Duyệt CTA exists for pending rows — blocked only by missing FE pending. XBOS inbox **not** asserted (N/A until bridge).

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty required | 🟢 PASS | dialog kept |
| B success HDSD | create→F5 pending | 🔴 FAIL | 500 HH:mm wire |
| C logic BR | pending + approve | ⬜ blocked | depends on B |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-ATT-TMDV-HP-001 | **not_promoted** | FE POST 500 — product defect |
| TC-HIM-ATT-TMDV-AP-001 | **not_promoted** | blocked upstream HP |
| TC-HIM-ATT-TMDV-SG-WF-001 | inventory | XBOS inbox GOVERNANCE_LOCK — unchanged |
| Whole U84 / Phase1 | **not** DONE | |

---

## Residuals

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **R-U84-ATT-ADJ-TMDV-TIME-WIRE-01** | **P0** | **dev-fe** (+ **dev-be** if contract prefers TEXT/HH:mm) | FE must compose `attendance_date`+HH:mm → ISO timestamptz **or** BE accept HH:mm / TEXT columns; retest U65 FE create→F5→AP |
| R-U84-ATT-ADJ-TMDV-HP-CREATE | P0 | (alias) | same as TIME-WIRE |
| P-ATT-ADJ XBOS inbox | P2 inventory | later bridge | GOVERNANCE_LOCK — out of this WI |
| REC-REQ JD catalog | prior | dev-be | unchanged parallel residual |

---

## completion_report

**Closed:** U78 Primary P-ATT-ADJ @ CO-TMDV attempted FE-only (U65); HDSD mount+FD proven; create failure root-caused (HH:mm→timestamptz 500); IEEE/ISO test-log pair; mgr persona on trsport documented; XBOS inbox not falsely failed.  
**Open:** P0 time-wire fix → QA retest HP+AP; no TC promoted; UAT/Phase1 not claimed.

**ack_status:** PASS_TO_PM  
**next_owner:** pm → **dev-fe** (primary) / **dev-be** (contract)  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-ATT-ADJ-TMDV-TIME-WIRE-01
from_role: pm
to_role: dev-fe
ack_status_target: READY_FOR_QA
priority: P0
u65_zero_seed: true
preserve_default: true
change_mode: FIX

MISSION: Fix FE→BE wire for attendance update-requests so HDSD «Thêm đề nghị» on /hr/attendance → Quản lý đơn → Đề nghị cập nhật công succeeds.
ROOT: FE posts requested_check_in/out as "08:00"/"17:30"; BE INSERT into TIMESTAMPTZ → 500 HRM-SYS-001.
OPTIONS: (A) FE compose attendance_date + HH:mm → ISO timestamptz before POST; (B) BE accept HH:mm or store TEXT — prefer A if columns stay TIMESTAMPTZ.
must_keep: leave approve paths; list scope parity; no invent XBOS attendance_adjustment constants.
exit_criteria: FE create 201 + F5 pending @ companyId=trsport; unit/regression on create body; READY_FOR_QA for U78-U84-PRIMARY-ATT-ADJ-TMDV-01 retest HP+AP (HRM web Duyệt; mgr uat.nv0002 available).
evidence_path: docs/qa/evidence/u78-u84-att-adj-tmdv-time-wire-01.md
read_first: docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01.md · AttendanceUpdateRequestTab.tsx · attendance.service.ts createUpdateRequest
```
