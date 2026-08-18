# Evidence — U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R1

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R1` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **FAIL** Primary cell P-ATT-ADJ @ **CO-TMDV** for full HP+AP promote — **time-wire create fixed**; CEO F5 list + mgr FE Duyệt still product-blocked |
| **prior** | [`u78-u84-primary-att-adj-tmdv-01.md`](u78-u84-primary-att-adj-tmdv-01.md) · FE fix [`u78-u84-att-adj-tmdv-time-wire-01.md`](u78-u84-att-adj-tmdv-time-wire-01.md) |
| **cell** | P-ATT-ADJ @ **CO-TMDV** · slug `trsport` · OU «Công ty Cổ phần Thương mại và Dịch vụ X.E» |
| **U65** | honored — no seed / no invent XBOS inbox |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-att-adj-tmdv-01-r1-test-log.md`](u78-u84-primary-att-adj-tmdv-01-r1-test-log.md) · [`.json`](u78-u84-primary-att-adj-tmdv-01-r1-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-att-adj-tmdv-01-r1-browser.json`](_tmp-u78-u84-primary-att-adj-tmdv-01-r1-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-att-adj-tmdv-01-r1/` |
| **harness** | `scripts/qa/_tmp-u78-u84-primary-att-adj-tmdv-01-r1.mjs` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` |
| **commit** | `dc930c5` |
| **L0** | HRM+XBOS+portal **200** · `qc:fe-be-health` ALL PASS |

---

## Executive verdict

**PASS_TO_PM** — R1 after FE ISO time-wire (recovery retest completed):

| Layer | Result |
|-------|--------|
| **Precond employees @ trsport** | 🟢 total=**4** · staff `VTH-0007` · mgr `VTH-0002` / `uat.nv0002@xe.vn` |
| **Mount HDSD** | 🟢 `/hr/attendance` → **Quản lý đơn** → **Đề nghị cập nhật công** · **Thêm đề nghị** |
| **FD empty required** | 🟢 no POST without required |
| **Time-wire create** | 🟢 FE **Thêm mới** → POST **201** `HRM-ATT-REQ-201` · body `requested_check_in/out` ISO with `T` · **not** bare `08:00` — residual **R-U84-ATT-ADJ-TMDV-TIME-WIRE-01** **closed** |
| **TC-HIM-ATT-TMDV-HP-001** | 🔴 **FAIL** (promote) — CEO F5 @ `companyId=trsport` → stamp absent / GET list **0**; row pending with UUID `10000000-…0002` (visible `ceo+main` + mgr list) |
| **TC-HIM-ATT-TMDV-AP-001** | 🔴 **FAIL** — mgr FE Eye → **Duyệt** → POST approve **409** `SCOPE_CONTEXT_MISMATCH` |
| **XBOS inbox AP** | ⬜ **N/A** — GOVERNANCE_LOCK (not failed) |
| **UAT / Phase1 / whole U84** | **not claimed** |

**promoted TC-IDs:** *(none)*  
**not_promoted:** `TC-HIM-ATT-TMDV-HP-001` · `TC-HIM-ATT-TMDV-AP-001`

---

## Persona / scope

| Field | Value |
|-------|--------|
| Account (HP) | `ceo@xe.vn` / `Xevn@2026` |
| Scope HP | Group CEO embed · `companyId=trsport` · OU TM-DV |
| Staff pick | `VTH-0007` Phan Văn An · `manager_id` → VTH-0002 |
| Account (AP) | `uat.nv0002@xe.vn` / `xevn-uat-2026` · HRM mobile JWT → fresh portal context (XBOS login **401** for mgr) |
| AP channel | HRM web Eye → **Duyệt** (XBOS inbox N/A) |

---

## HDSD inventory (U76) · HIM §5.5

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1&companyId=trsport` | Yes | HP mount |
| 2 | Tab **Quản lý đơn** | Yes | nav |
| 3 | Menu **Đề nghị cập nhật công** | Yes | SCR-REQ-UPDATE · HIM §5.5 |
| 4 | **+ Thêm đề nghị** → **Thêm mới** | Yes | HP create |
| 5 | F5 list pending | Yes attempt | CEO empty · mgr sees rows |
| 6 | Eye → **Duyệt** | Yes | mgr FE 409 |
| 7 | XBOS Inbox | N/A | GOVERNANCE_LOCK |

---

## IDs (this browser run)

| Field | Value |
|-------|--------|
| STAMP | `TMDV-ATT-DJ8ZUX` |
| request_id | `41387eda-fe95-4897-a21e-f5c2b1a09701` |
| employee | `b06422c0-…` · VTH-0007 |
| attendance_date | `2026-07-26` |
| update_type | `forgot_check` |
| POST request `company_id` | slug `trsport` |
| POST times | `requested_check_in=2026-07-26T01:00:00.000Z` · `requested_check_out=2026-07-26T10:30:00.000Z` |
| create response `company_id` | UUID `10000000-0000-4000-8000-000000000002` |

Prior harness attempt same session (same defects): STAMP `TMDV-ATT-DJ41G3` · id `579f8426-…` — superseded by DJ8ZUX for narrative IDs.

---

## Phase A — HP

1. L0 · employees=4 · ISO compose loaded  
2. Login `ceo@` → attendance · OU TM-DV  
3. **Quản lý đơn** → **Đề nghị cập nhật công**  
4. Fail-deep empty → no POST  
5. Fill VTH-0007 · date · Quên chấm · reason STAMP → **Thêm mới**  
6. Network: POST **201** · body times ISO `T` · `bareHhmm=false`  
7. F5 CEO @ `company_id=trsport` → UI **no STAMP** · GET list **0** while row pending on `main`/mgr  

Screens: `01`…`06-f5-list`.

---

## Phase B — AP (`uat.nv0002`)

1. Fresh Playwright context + HRM mobile JWT inject  
2. List shows pending STAMP (mgr GET `company_id=trsport` **rowCount≥1** `hasStamp=true`)  
3. Eye → detail → **Duyệt**  
4. Network: POST `…/approve` **409** `SCOPE_CONTEXT_MISMATCH`  
5. F5 still pending for STAMP  

Screens: `07-mgr-list` · `08-detail-before-approve` · `09-after-approve` · `10-f5-after-approve`.

### L1 diagnostic (not UF / not promote)

| Probe | Result |
|-------|--------|
| CEO GET `?company_id=trsport` | **0** / not found for create id |
| CEO GET `?company_id=main` | row **pending** · `company_id`=UUID |
| Mgr GET `?company_id=trsport` | row found |
| Mgr POST approve **no** company header | **409** `HRM-ATT-REQ-409` «Resource company_id is outside token scope» |
| Mgr POST approve + `x-company-id: trsport` | **201** `HRM-ATT-REQ-203` (diagnostic only — proves mutate OK when scope header present) |
| Mgr membership | `company_id=trsport` + `company_uuid=10000000-…0002` |

→ FE Duyệt 409 class = **missing/wrong company scope on approve call** (portal) **and/or** BE mutate guard when header absent. List slug parity for Group CEO remains separate P0.

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty required | 🟢 PASS | |
| B success HDSD | create ISO → F5 pending | 🔴 FAIL | create+ISO PASS; CEO F5 empty |
| C logic BR | mgr Duyệt → approved | 🔴 FAIL | FE 409 scope on approve |

---

## Residuals

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **R-U84-ATT-ADJ-TMDV-LIST-SCOPE-SLUG** | **P0** | **dev-be** (+ FE if OU query) | Group CEO `GET …/update-requests?company_id=trsport` returns **0** while row `company_id`=trsport UUID; F5 member OU empty after 201 |
| **R-U84-ATT-ADJ-TMDV-AP-SCOPE-HEADER** | **P0** | **dev-fe** (primary) / **dev-be** (guard when header absent) | Mgr FE Duyệt **409** `SCOPE_CONTEXT_MISMATCH`; L1 without header **409** `HRM-ATT-REQ-409`; L1 with `x-company-id: trsport` **201** |
| R-U84-ATT-ADJ-TMDV-TIME-WIRE-01 | ✅ closed | — | FE compose ISO — POST 201 |
| P-ATT-ADJ XBOS inbox | P2 inventory | later bridge | GOVERNANCE_LOCK — out of this WI |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-ATT-TMDV-HP-001 | **not_promoted** | create+ISO OK; F5 CEO FAIL scope |
| TC-HIM-ATT-TMDV-AP-001 | **not_promoted** | mgr FE Duyệt 409 |
| TC-HIM-ATT-TMDV-SG-WF-001 | inventory | XBOS inbox N/A unchanged |
| Whole U84 / Phase1 | **not** DONE | |

---

## completion_report

**Closed:** U65 R1 browser retest after FE time-wire (recovery); POST create **201** with ISO timestamptz body proven; prior HH:mm→500 residual closed; mgr FE Duyệt path exercised; L1 proves approve works with `x-company-id`; U78 IEEE test-log pair; XBOS inbox not falsely failed; report §12.4 aligned.  
**Open:** P0 CEO list slug/UUID + P0 mgr FE approve scope header → **not** EVIDENCED; UAT/Phase1 not claimed.

**ack_status:** PASS_TO_PM  
**next_owner:** pm → **dev-be** (list slug) + **dev-fe** (approve company header)  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r1.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01
from_role: pm
to_role: dev-be
ack_status_target: READY_FOR_QA
priority: P0
u65_zero_seed: true
preserve_default: true
change_mode: FIX
parallel_hint: also Task dev-fe for approve x-company-id / portal scope header on Duyệt

MISSION: Fix attendance update-requests scope parity @ CO-TMDV after FE time-wire create 201.
ROOT A (BE): Group CEO GET /attendance/update-requests?company_id=trsport returns 0 while row company_id is trsport UUID (10000000-0000-4000-8000-000000000002); CEO F5 member OU empty after FE create 201.
ROOT B (FE primary): Mgr uat.nv0002 FE Eye→Duyệt → 409 SCOPE_CONTEXT_MISMATCH. L1: POST approve without company header → 409 HRM-ATT-REQ-409; WITH header x-company-id=trsport → 201 HRM-ATT-REQ-203. Token active_membership has company_id=trsport + company_uuid=same UUID.
must_keep: FE ISO compose create path; leave approve; no invent XBOS attendance_adjustment constants; U65 no seed.
exit_criteria: CEO FE create→F5 pending @ companyId=trsport; mgr FE Eye→Duyệt 2xx→F5 approved; jest/scope parity specs; READY_FOR_QA U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2.
evidence_path: docs/qa/evidence/u78-u84-att-adj-tmdv-scope-parity-01.md
read_first: docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r1.md · attendance.service.ts guardAttendanceMutate · resolveHrmListScope / companyScopeMatches · AttendanceUpdateRequestTab approve fetch headers
```
