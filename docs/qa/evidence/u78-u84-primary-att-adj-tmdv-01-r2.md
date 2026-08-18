# Evidence — U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-ATT-ADJ-TMDV-01-R2` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** Primary cell P-ATT-ADJ @ **CO-TMDV** — HP+AP FE click path EVIDENCED |
| **prior** | R1 FAIL [`u78-u84-primary-att-adj-tmdv-01-r1.md`](u78-u84-primary-att-adj-tmdv-01-r1.md) |
| **fixes** | FE [`u78-u84-att-adj-tmdv-ap-company-header-01.md`](u78-u84-att-adj-tmdv-ap-company-header-01.md) · BE [`u78-u84-att-adj-tmdv-scope-parity-01.md`](u78-u84-att-adj-tmdv-scope-parity-01.md) |
| **cell** | P-ATT-ADJ @ **CO-TMDV** · slug `trsport` · OU «Công ty Cổ phần Thương mại và Dịch vụ X.E» |
| **U65** | honored — no seed / no invent XBOS inbox |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-att-adj-tmdv-01-r2-test-log.md`](u78-u84-primary-att-adj-tmdv-01-r2-test-log.md) · [`.json`](u78-u84-primary-att-adj-tmdv-01-r2-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-att-adj-tmdv-01-r2-browser.json`](_tmp-u78-u84-primary-att-adj-tmdv-01-r2-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-att-adj-tmdv-01-r2/` |
| **harness** | `scripts/qa/_tmp-u78-u84-primary-att-adj-tmdv-01-r2.mjs` |
| **env** | portal `:5173` · hrm-api `:28001` (restarted w/ scope-parity dist) · xbos `:28002` |
| **commit** | `dc930c5` |
| **L0** | HRM+XBOS+portal **200** · `qc:fe-be-health` ALL PASS |

---

## Executive verdict

**PASS_TO_PM** — R2 after FE approve `x-company-id` + BE list slug↔UUID:

| Layer | Result |
|-------|--------|
| **Precond employees @ trsport** | 🟢 total=**4** · staff `VTH-0007` · mgr `VTH-0002` / `uat.nv0002@xe.vn` |
| **Mount HDSD** | 🟢 `/hr/attendance` → **Quản lý đơn** → **Đề nghị cập nhật công** · **Thêm đề nghị** |
| **FD empty required** | 🟢 no POST without required |
| **Create ISO** | 🟢 FE **Thêm mới** → POST **201** `HRM-ATT-REQ-201` · times ISO with `T` |
| **TC-HIM-ATT-TMDV-HP-001** | 🟢 **EVIDENCED** — CEO F5 @ `companyId=trsport` · STAMP visible · GET list finds pending (UUID row via slug expand) |
| **TC-HIM-ATT-TMDV-AP-001** | 🟢 **EVIDENCED** — mgr Eye → **Duyệt** → POST approve **201** `HRM-ATT-REQ-203` · Network `x-company-id=trsport` · F5 **approved** |
| **XBOS inbox AP** | ⬜ **N/A** — GOVERNANCE_LOCK (not failed) |
| **UAT / Phase1 / whole U84** | **not claimed** |

**promoted TC-IDs:** `TC-HIM-ATT-TMDV-HP-001` · `TC-HIM-ATT-TMDV-AP-001`  
**not_promoted:** *(none for this cell HP/AP)* · XBOS inbox SG inventory unchanged

---

## Persona / scope

| Field | Value |
|-------|--------|
| Account (HP) | `ceo@xe.vn` / `Xevn@2026` |
| Scope HP | Group CEO embed · `companyId=trsport` · OU TM-DV |
| Staff pick | `VTH-0007` Phan Văn An · `manager_id` → VTH-0002 |
| Account (AP) | `uat.nv0002@xe.vn` / `xevn-uat-2026` · HRM mobile JWT → portal inject |
| AP channel | HRM web Eye → **Duyệt** (XBOS inbox N/A) |

---

## HDSD inventory (U76) · HIM §5.5

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/attendance?portal=1&companyId=trsport` | Yes | HP mount |
| 2 | Tab **Quản lý đơn** | Yes | nav |
| 3 | Menu **Đề nghị cập nhật công** | Yes | SCR-REQ-UPDATE · HIM §5.5 |
| 4 | **+ Thêm đề nghị** → **Thêm mới** | Yes | HP create |
| 5 | F5 list pending | Yes | CEO STAMP visible |
| 6 | Eye → **Duyệt** | Yes | mgr FE 201 + header |
| 7 | XBOS Inbox | N/A | GOVERNANCE_LOCK |

---

## IDs (this browser run)

| Field | Value |
|-------|--------|
| STAMP | `TMDV-ATT-DJOH56` |
| request_id | `6511d5d2-cc03-48e8-9ac8-73e23955f332` |
| employee | `b06422c0-…` · VTH-0007 |
| attendance_date | `2026-07-26` |
| update_type | `forgot_check` |
| POST request `company_id` | slug `trsport` |
| POST times | `requested_check_in=2026-07-26T01:00:00.000Z` · `requested_check_out=2026-07-26T10:30:00.000Z` |
| create response `company_id` | UUID `10000000-0000-4000-8000-000000000002` |
| approve Network | `x-company-id=trsport` · `x-tenant-id=xevn` · **201** `HRM-ATT-REQ-203` · status **approved** |

---

## Phase A — HP

1. L0 · employees=4 · update-requests before total=8  
2. Login `ceo@` → attendance · OU TM-DV  
3. **Quản lý đơn** → **Đề nghị cập nhật công**  
4. Fail-deep empty → no POST  
5. Fill VTH-0007 · date · Quên chấm · reason STAMP → **Thêm mới**  
6. Network: POST **201** · body times ISO `T` · `bareHhmm=false`  
7. F5 CEO @ `company_id=trsport` → UI **STAMP visible** · GET list finds pending · `ceoSlugSees=true`

Screens: `01`…`06-f5-list`.

---

## Phase B — AP (`uat.nv0002`)

1. Fresh Playwright context + HRM mobile JWT inject  
2. List shows pending STAMP (mgr GET `company_id=trsport` hasStamp=true)  
3. Eye → detail → **Duyệt**  
4. Network: POST `…/6511d5d2-…/approve` **201** `HRM-ATT-REQ-203` · **`x-company-id=trsport`**  
5. F5 → STAMP row **approved**

Screens: `07-mgr-list` · `08-detail-before-approve` · `09-after-approve` · `10-f5-after-approve`.

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty required | 🟢 PASS | |
| B success HDSD | create ISO → F5 pending | 🟢 PASS | R1 list-scope residual closed |
| C logic BR | mgr Duyệt → approved | 🟢 PASS | R1 approve-header residual closed · Network proves OU header |

---

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| R-U84-ATT-ADJ-TMDV-LIST-SCOPE-SLUG | ✅ closed | — | CEO F5 @ trsport sees pending |
| R-U84-ATT-ADJ-TMDV-AP-SCOPE-HEADER | ✅ closed | — | FE Duyệt sends `x-company-id=trsport` → 201 |
| R-U84-ATT-ADJ-TMDV-TIME-WIRE-01 | ✅ closed | — | prior |
| P-ATT-ADJ XBOS inbox | P2 inventory | later bridge | GOVERNANCE_LOCK — out of this WI |
| P-LEAVE @ CO-DL bootstrap | EXTERNAL | pm / env | still BLOCKED-EXTERNAL (not this cell) |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-ATT-TMDV-HP-001 | **EVIDENCED** | create+ISO+CEO F5 pending @ trsport |
| TC-HIM-ATT-TMDV-AP-001 | **EVIDENCED** | mgr FE Duyệt 201 + `x-company-id=trsport` + F5 approved |
| TC-HIM-ATT-TMDV-SG-WF-001 | inventory | XBOS inbox N/A unchanged |
| Whole U84 / Phase1 | **not** DONE | |

---

## completion_report

**Closed:** U65 R2 browser promote after FE+BE fixes; CEO create→F5 pending @ `companyId=trsport`; mgr Eye→Duyệt POST **201** with Network `x-company-id=trsport`; F5 approved; U78 IEEE test-log pair; residuals list-scope + approve-header closed; XBOS inbox not falsely failed.  
**Open:** U84 rollup / leave@CO-DL bootstrap still EXTERNAL; UAT/Phase1 not claimed.

**ack_status:** PASS_TO_PM  
**next_owner:** pm → U84 rollup / next Primary or leave EXTERNAL triage  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r2.md`

### next_dispatch_prompt

```text
work_item_id: U84-PRIMARY-ROLLUP-ATT-ADJ-TMDV-01
from_role: pm
to_role: pm|qa
ack_status_target: PASS_TO_PM
priority: P1
u65_zero_seed: true

MISSION: Stamp U84 Primary matrix cell P-ATT-ADJ @ CO-TMDV as EVIDENCED from R2 evidence; continue U84 Primary queue (leave@CO-DL still BLOCKED-EXTERNAL — do not fake employees).
entry: docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r2.md · test-log pair · report §12.4 already APPEND by QA
exit: matrix/report cell HP+AP EVIDENCED; next Primary WI dispatched or idle only if backlog empty; UAT/Phase1 not claimed
cấm: seed leave employees · invent XBOS attendance_adjustment inbox · claim Phase1 DONE
evidence_path: docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01-r2.md
```
