# Evidence — U78-U84-PRIMARY-REC-REQ-VISUN-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-REC-REQ-VISUN-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** Primary cell P-REC-REQ @ **CO-VISUN** (HP + AP) |
| **cell** | P-REC-REQ @ **CO-VISUN** · slug `logistics` · OU «Du lịch Visun» · UUID `…0003` |
| **U65** | honored — no seed / no inbox seed / no DB fake |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-rec-req-visun-01-test-log.md`](u78-u84-primary-rec-req-visun-01-test-log.md) · [`.json`](u78-u84-primary-rec-req-visun-01-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-rec-req-visun-01-browser.json`](_tmp-u78-u84-primary-rec-req-visun-01-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-rec-req-visun-01/` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` |
| **commit** | `dc930c5` |
| **L0** | `qc:dev-stack` HRM+XBOS+portal **200** |
| **pattern** | TMDV R1 + D-U84 JD holding assert (applies to `logistics`) |

---

## Executive verdict

**PASS_TO_PM** — U78 browser execution of Primary cell **P-REC-REQ @ CO-VISUN** (HDV / điều hành tour) completed FE-only:

| Layer | Result |
|-------|--------|
| **Precond TC-WFM-REC-REQ-HP-001** | 🟢 active def `hrm_requisition_approval` (`6f17062a-…`) |
| **JD create @ logistics** | 🟢 POST **201** `HRM-REC-JD-201` · position **OPS_MANAGER** (Quản lý Vận hành) · F5 stamp |
| **TC-HIM-REC-REQ-VISUN-HP-001** | 🟢 **EVIDENCED** — create **201** `HRM-REC-201` → **Gửi duyệt QT** **201** `HRM-REC-WF-200` → F5 `pending_approval` + wi |
| **TC-HIM-REC-REQ-VISUN-AP-001** | 🟢 **EVIDENCED** — Inbox stamp → **Xử lý nhanh** → **201** `XBOS-WF-200` (`requisition_approval`) → F5 card gone · HRM `open` · title **≠ tài xế** |
| **JD catalog assert** | 🟢 D-U84 holding picker parity **held** for `logistics` (no `HRM-REC-JD-POS`) |
| **UAT / Phase1 / whole U84** | **not claimed** |

**promoted TC-IDs:** `TC-HIM-REC-REQ-VISUN-HP-001` · `TC-HIM-REC-REQ-VISUN-AP-001`  
**XREF observe:** `TC-XIC-WF-HP-003` path exercised via Inbox complete (not separate XIC pack retest claim).

---

## Persona / scope

| Field | Value |
|-------|--------|
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope used | Group CEO embed · URL `companyId=logistics` · OU filter **Du lịch Visun** |
| Target role | **HDV / điều hành tour** · HIM §5.2 VISUN |
| Catalog position | **OPS_MANAGER** / «Quản lý Vận hành» — AS-IS proxy (no `HDV_*` code in `job_titles`) |
| Employees @ logistics | **0** — observation only; REC-REQ create does not require employee rows (not BLOCKED) |

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/recruitment?tab=jd-library&companyId=logistics` · **Thư viện JD** | Yes | Thêm JD precond |
| 2 | **+ Thêm JD** · Chức danh Quản lý Vận hành / `OPS_MANAGER` | Yes | POST 201 |
| 3 | `/hr/recruitment?tab=requisitions` · **Thêm yêu cầu** | Yes | HP create |
| 4 | Banner / row **Gửi duyệt QT** | Yes | submit-workflow |
| 5 | CC **Hộp thư** · card stamp · **Xử lý nhanh** | Yes | AP |

---

## IDs (this run)

| Field | Value |
|-------|--------|
| STAMP | `VISUN-REQ-DJWQYC` |
| jdId | `acecf190-4066-4ed3-98d4-8a81df486d8c` |
| requisitionId | `6d2d71ad-5560-41e5-a593-c8791d9bdddf` |
| workflow_instance_id | `2b4f0d9c-f56f-431d-a785-5fb6bca52f93` |
| AP task | `5e2f94c8-4c84-404e-8719-c3c207889c3e` · `step_key=requisition_approval` · **201** `XBOS-WF-200` |
| Title (HRM after AP) | `JD HDV điều hành tour Visun VISUN-REQ-DJWQYC` · status **`open`** |

---

## Phase A — HP (JD + YCTD + Gửi duyệt QT + F5)

1. L0 PASS · WF def active · job_titles holding n=8 (`OPS_MANAGER` present; no `HDV_*`) · employees logistics=0  
2. Login inject → `/hr/recruitment?tab=jd-library&companyId=logistics` · OU Visun  
3. Fail-deep: empty JD submit → dialog kept  
4. Fill JD HDV stamp + pick **Quản lý Vận hành** → **Lưu** → POST **201** `HRM-REC-JD-201`  
5. F5 → stamp on JD library  
6. Tab Yêu cầu → Thêm yêu cầu → pick JD stamp → Lưu → POST **201** `HRM-REC-201`  
7. **Gửi duyệt QT** → POST **201** `HRM-REC-WF-200` · wi set · status `pending_approval`  
8. F5 list: stamp + wi persisted  

Screens: `01-jd-library` … `11-f5-list`.

---

## Phase B — AP (Inbox Xử lý nhanh)

| Check | Result |
|-------|--------|
| Card visible before | Yes (`12-inbox-before.png`) — stamp `VISUN-REQ-DJWQYC` |
| POST complete | **201** `XBOS-WF-200` · `instance_id=2b4f0d9c-…` · `requisition_approval` |
| F5 card gone | Yes (`14-ap-inbox-f5.png`) |
| ≠ tài xế context | Yes — title contains HDV/điều hành tour/VISUN; not Lái xe/DRIVER_LEAD |
| HRM terminal | status **`open`** (Đang tuyển) · same `workflow_instance_id` |

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty JD | 🟢 PASS | dialog kept |
| B success HDSD | HP+AP | 🟢 PASS | CO-VISUN `logistics` full FE chain |
| C logic BR | HDV / điều hành ≠ tài xế | 🟢 PASS | OPS_MANAGER + HDV stamp; AP notTaiXe=true |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-REC-REQ-VISUN-HP-001 | **EVIDENCED** | JD 201 + YCTD create+submit+F5 @ CO-VISUN |
| TC-HIM-REC-REQ-VISUN-AP-001 | **EVIDENCED** | Inbox Xử lý nhanh · matching WI · card gone · status `open` · ≠ tài xế |
| TC-HIM-REC-REQ-TMDV-* | unchanged | prior EVIDENCED |
| Whole U84 / Phase1 | **not** DONE | leave@DL still EXTERNAL |

---

## Residuals

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **R-U84-REC-REQ-VISUN-HDV-TITLE-PROXY** | **P2** | ba-data / catalog | No `HDV_*` in AS-IS `job_titles` — OPS_MANAGER used as điều hành proxy; optional catalog ADD if sponsor wants literal HDV code |
| CO-DL leave Primary | P0 prior | devops/ba-data | still BLOCKED-EXTERNAL |
| U84 Primary rollup | P1 program | pm/qc | all AS-IS Primaries except leave EXTERNAL now EVIDENCED |

---

## completion_report

**Closed:** U78 Primary P-REC-REQ @ CO-VISUN FE chain (U65); JD holding-assert parity for logistics; IEEE/ISO test-log pair; HP+AP **EVIDENCED** with Network 2xx + FE after + F5; inbox ≠ tài xế asserted.  
**Open:** P2 HDV catalog code proxy; leave@DL EXTERNAL; UAT/Phase1 not claimed.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-rec-req-visun-01.md`

### next_dispatch_prompt

```text
work_item_id: U84-PRIMARY-EXEC-ROLLUP-01
from_role: pm
to_role: qc
ack_status_target: PASS_TO_PM
priority: P1
u65_zero_seed: true
test_log_required: true

MISSION: Docs/honesty audit of U84 Primary AS-IS rollup after VISUN REC-REQ EVIDENCED.
entry: docs/qa/evidence/u78-u84-primary-rec-req-visun-01.md · HIM §5.2 VISUN HP/AP EVIDENCED · prior rollup OPEN cell closed.
Assert: do not invent leave@DL EVIDENCED; list EVIDENCED Primary TC-IDs; residual P2 HDV title proxy optional defer; uat_done false.
PARALLEL optional (P2 catalog):
work_item_id: R-U84-REC-REQ-VISUN-HDV-TITLE-PROXY
to_role: ba-data
MISSION: Decide whether job_titles needs HDV_* code for Visun tour ops or OPS_MANAGER proxy is acceptable AS-IS.
cấm: seed · Phase1 DONE claim
evidence_path: docs/qa/evidence/u84-primary-exec-rollup-01.md
```
