# Evidence — U78-U84-PRIMARY-REC-REQ-TMDV-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-REC-REQ-TMDV-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **BLOCKED** Primary cell P-REC-REQ @ **CO-TMDV** (HP/AP not executable FE-only) |
| **cell** | P-REC-REQ @ **CO-TMDV** · slug `trsport` · OU «Công ty Cổ phần Thương mại và Dịch vụ X.E» |
| **U65** | honored — no seed / no inbox seed / no DB fake · diagnostic API probe JD on holding soft-deleted |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-rec-req-tmdv-01-test-log.md`](u78-u84-primary-rec-req-tmdv-01-test-log.md) · [`.json`](u78-u84-primary-rec-req-tmdv-01-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-rec-req-tmdv-01-browser.json`](_tmp-u78-u84-primary-rec-req-tmdv-01-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-rec-req-tmdv-01/` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` |
| **commit** | `dc930c5` |
| **L0** | `qc:dev-stack` HRM+XBOS+portal **200** |

---

## Executive verdict

**PASS_TO_PM** — U78 browser execution of Primary cell **P-REC-REQ @ CO-TMDV** stopped at **JD library precond** (honest U65):

| Layer | Result |
|-------|--------|
| **Precond TC-WFM-REC-REQ-HP-001** | 🟢 active def `hrm_requisition_approval` (`6f17062a-…`) |
| **JD library @ trsport** | 🔴 empty (`GET job-templates` total=0) |
| **FE Thêm JD (Lái xe / DRIVER_LEAD)** | 🟡 **BLOCKED** — POST **400** `HRM-REC-JD-POS` (`position_code 'DRIVER_LEAD' is not in job_titles catalog`) while FE picker offered **Đội trưởng Lái xe** |
| **TC-HIM-REC-REQ-TMDV-HP-001** | ⬜ **not run** — YCTD create requires JD (`libraryEmpty` / Lưu disabled) |
| **TC-HIM-REC-REQ-TMDV-AP-001** | ⬜ **not run** — no submit → no Inbox card (U65: do not fake) |
| **UAT / Phase1 / whole U84** | **not claimed** |

**promoted TC-IDs:** *(none)*  
**not_promoted:** `TC-HIM-REC-REQ-TMDV-HP-001` · `TC-HIM-REC-REQ-TMDV-AP-001` — **BLOCKED** env/product catalog assert (not PLANNED invent)

---

## Persona / scope

| Field | Value |
|-------|--------|
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope used | Group CEO embed · URL `companyId=trsport` · OU filter **Công ty Cổ phần Thương mại và Dịch vụ X.E** |
| Employees @ trsport | total=**4** (ops data present — not the blocker) |
| Target role | **Lái xe / Vận hành logistics** · BR-PO-REC-LGX-01 · catalog code attempted `DRIVER_LEAD` |

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/recruitment?tab=jd-library` · **Thư viện JD** | Yes | FE precond for YCTD |
| 2 | **+ Thêm JD** dialog | Yes | create attempt |
| 3 | Chức danh catalog picker · Lái xe | Yes | selected `DRIVER_LEAD` |
| 4 | `/hr/recruitment?tab=requisitions` · **Thêm yêu cầu** | Reachable | **not** operable without JD |
| 5 | **Gửi duyệt QT** / Inbox Duyệt | N/A | blocked upstream |

---

## Root cause (spec says / code does)

| | |
|--|--|
| **spec / HDSD** | YCTD requires JD from library · position from `job_titles` catalog · FE-only create |
| **code does** | Settings picker `GET …/job_titles/items?company_id=trsport` returns rows with response `company_id=holding` (group catalog partition). JD create `POST …/job-templates` persists/asserts with **`company_id=trsport`** via `resolveHrmPersistCompanyIdText` → `assertCodeInEffectiveCatalog(trsport)` → **400 HRM-REC-JD-POS** even for codes visible in the picker. |
| **class** | catalog **picker partition ≠ JD assert partition** on member slug (scope/catalog parity) |
| **U65** | cannot seed JD / cannot API-create on holding then claim CO-TMDV Primary |

Diagnostic note: API probe `POST job-templates` with `company_id=holding` + `DRIVER_LEAD` **201** then soft-deleted — **not** used as U65 evidence for this cell.

---

## IDs (this run)

| Field | Value |
|-------|--------|
| STAMP | `TMDV-REQ-DI5LQY` |
| JD code attempted | `JD-LX-DI5LQY` |
| jdId | *(none — create 400)* |
| requisitionId / workflow_instance_id | *(none)* |

---

## Phase A — HP (attempted)

1. L0 PASS · WF def active · employees trsport=4 · JD total=0 · requisitions total=0  
2. Login inject → `/hr/recruitment?tab=jd-library&companyId=trsport` · OU TM-DV  
3. Fail-deep: Thêm JD empty → dialog kept  
4. Fill JD Lái xe / DRIVER_LEAD → **Lưu** → POST **400** `HRM-REC-JD-POS`  
5. Stop — no YCTD / no Inbox (U65)

Screens: `01-jd-library` … `05-jd-blocked`.

---

## Phase B — AP

**Not executed** — no FE-spawned Inbox task for this STAMP.

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty JD submit | 🟢 PASS | dialog kept |
| B success HDSD | HP+AP YCTD | 🟡 **BLOCKED** | JD create 400 → cannot Lưu YCTD |
| C logic BR | DRIVER_LEAD / LGX | 🟡 BLOCKED | picker shows code; assert rejects on trsport |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-REC-REQ-TMDV-HP-001 | **BLOCKED** | not EVIDENCED — JD library / catalog assert |
| TC-HIM-REC-REQ-TMDV-AP-001 | **BLOCKED** | not run — depends on HP |
| TC-HIM-REC-REQ-TMDV-FD-001 | supporting | empty JD dialog kept |
| TC-HIM-REC-PLAN-TMDV-* | unchanged EVIDENCED | prior WI |
| Whole U84 / Phase1 | **not** DONE | |

---

## Residuals

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **R-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT** | **P0** | **dev-be** | Align JD `assertJdPositionCodeInCatalog` company with settings picker partition (same as leave/settings `resolveHrmSettingsCatalogCompanyId`) **or** sync `job_titles` into member `trsport` partition so FE Thêm JD @ CO-TMDV succeeds; then QA retest this WI |
| R-U84-REC-PLAN-AP-CLICK-SCOPE-01 | P2 | qa harness | prior — still open, out of this cell |
| CO-DL leave Primary | P0 prior | devops/ba-data | still BLOCKED-EXTERNAL — not invent |

---

## completion_report

**Closed:** U78 Primary P-REC-REQ @ CO-TMDV FE attempt (U65); WF precond PASS; HDSD JD path exercised; blocker evidenced with Network 400 + screens + IEEE test-log; HP/AP **not** falsely promoted.  
**Open:** P0 catalog assert/picker parity for member slug; YCTD HP+AP pending retest after BE fix.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01.md`

### next_dispatch_prompt

```text
work_item_id: D-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT-01
from_role: pm
to_role: dev-be
ack_status_target: READY_FOR_QA
priority: P0
u65_zero_seed: true

MISSION: Fix R-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT — FE Thêm JD @ companyId=trsport selects DRIVER_LEAD from job_titles picker but POST /api/hrm/recruitment/job-templates returns 400 HRM-REC-JD-POS. Align assertJdPositionCodeInCatalog company resolution with settings picker partition (resolveHrmSettingsCatalogCompanyId / synced holding catalog) OR ensure member trsport partition has effective job_titles so picker codes assert-pass. Jest regression required. Do not seed for UAT.
entry: evidence docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01.md · raw _tmp-…-browser.json lastJdPost
exit: POST job-templates company_id=trsport + DRIVER_LEAD → 201; GET job-templates?company_id=trsport includes row; READY_FOR_QA → retest U78-U84-PRIMARY-REC-REQ-TMDV-01 HP+AP
evidence_path: docs/qa/evidence/d-u84-rec-req-tmdv-jd-catalog-assert-01.md

PARALLEL (optional momentum, if BE in flight):
work_item_id: U78-U84-PRIMARY-ATT-ADJ-TMDV-01
to_role: qa
MISSION: FE-only P-ATT-ADJ @ CO-TMDV (TC-HIM-ATT-TMDV-HP/AP) — HRM-only approve path; no XBOS inbox required; U65; U78 test-log. Prefer over P-REC-PIPE until REC-REQ JD unblocked (pipeline needs YCTD/candidates).
evidence_path: docs/qa/evidence/u78-u84-primary-att-adj-tmdv-01.md
```
