# Evidence — U78-U84-PRIMARY-REC-PLAN-TMDV-01

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-REC-PLAN-TMDV-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** Primary cell P-REC-PLAN @ **CO-TMDV** (HP + AP) |
| **cell** | P-REC-PLAN @ **CO-TMDV** · slug `trsport` · OU «Công ty Cổ phần Thương mại và Dịch vụ X.E» |
| **U65** | honored — no seed / no inbox seed / no DB fake |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-rec-plan-tmdv-01-test-log.md`](u78-u84-primary-rec-plan-tmdv-01-test-log.md) · [`.json`](u78-u84-primary-rec-plan-tmdv-01-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-rec-plan-tmdv-01-browser.json`](_tmp-u78-u84-primary-rec-plan-tmdv-01-browser.json) · [`_tmp-…-ap-browser.json`](_tmp-u78-u84-primary-rec-plan-tmdv-01-ap-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-rec-plan-tmdv-01/` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` |
| **commit** | `dc930c5` |
| **L0** | `qc:dev-stack` HRM+XBOS+portal **200** |

---

## Executive verdict

**PASS_TO_PM** — U78 browser execution of Primary cell **P-REC-PLAN @ CO-TMDV** completed FE-only:

| Layer | Result |
|-------|--------|
| **Precond TC-WFM-REC-PLAN-HP-001** | 🟢 active def `hrm_recruitment_plan_approval` (`befaec7a-…`) |
| **TC-HIM-REC-PLAN-TMDV-HP-001** | 🟢 **EVIDENCED** — create **201** → **Gửi duyệt QT** **201** `HRM-REC-PLAN-WF-200` → F5 row + `workflow_instance_id` |
| **TC-HIM-REC-PLAN-TMDV-AP-001** | 🟢 **EVIDENCED** — Inbox card stamp → **Xử lý nhanh** → **201** `XBOS-WF-200` (`plan_approval`) → F5 card gone · plan `status=approved` |
| **TC-HIM-REC-PLAN-TMDV-FD-001** | 🟢 supporting — empty title kept dialog / required |
| **UAT / Phase1 / whole U84** | **not claimed** |

**promoted TC-IDs:** `TC-HIM-REC-PLAN-TMDV-HP-001` · `TC-HIM-REC-PLAN-TMDV-AP-001`  
**XREF observe:** `TC-XIC-WF-HP-002/003` path exercised via Inbox complete (not separate XIC pack retest claim).

---

## Persona / scope

| Field | Value |
|-------|--------|
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope used | Group CEO embed · URL `companyId=trsport` · OU filter **Công ty Cổ phần Thương mại và Dịch vụ X.E** (not rollup-all) |
| Member ops persona | not available separately — documented CEO+company switch per dispatch |
| Plan `company_id` | **`trsport`** (API assert) |

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/recruitment?tab=plans` · tab **Kế hoạch** | Yes | HP |
| 2 | **+ Tạo kế hoạch** dialog | Yes | HP create |
| 3 | Headcount dept/pos · NS month | Yes | logistics Lái xe / Vận hành · NS=2 |
| 4 | Row → Eye → **Chi tiết** | Yes | open detail |
| 5 | **Gửi duyệt QT** | Yes | submit-workflow |
| 6 | Toast «Đã gửi duyệt kế hoạch… Inbox» | Yes | FE after 2xx |
| 7 | CC **Hộp thư** card «Phê duyệt kế hoạch tuyển dụng HRM · …STAMP» | Yes | AP |
| 8 | Card **Xử lý nhanh** → complete | Yes | AP (retarget) |

---

## IDs (this run)

| Field | Value |
|-------|--------|
| STAMP | `TMDV-PLAN-DH7VCT` |
| plan_id | `69d5888d-7227-4ea0-bfef-794f4c6ce6f5` |
| workflow_instance_id | `1c7b5a7d-2055-41a6-b5b0-fbf6c8cf12d0` |
| AP task (canonical) | `e5c3b2d9-189d-4565-8d1e-6b96d63d25b2` · `step_key=plan_approval` · **201** `XBOS-WF-200` |
| Title | `KH Tuyển Lái xe Vận hành TMDV TMDV-PLAN-DH7VCT` |

---

## Phase A — HP (create + Gửi duyệt QT + F5)

1. L0 + API: employees `trsport` total=4 · plans empty/prior · WF def active  
2. Login inject → `/hr/recruitment?portal=1&tenantId=xevn&companyId=trsport&tab=plans`  
3. OU filter → Thương mại và Dịch vụ X.E  
4. Fail-deep: **Tạo kế hoạch** without title → dialog stays / validation  
5. Fill logistics plan → **Tạo kế hoạch** → POST **201** `HRM-REC-PLAN-201`  
6. Eye → detail → **Gửi duyệt QT** → POST **201** `HRM-REC-PLAN-WF-200` · `workflowInstanceId` set · toast Inbox  
7. F5 list: stamp present · Chờ duyệt · wi persisted  

Screens: `01-plans-tab` … `08-f5-detail` · `06-after-submit` (toast).

---

## Phase B — AP (Inbox Duyệt / Xử lý nhanh)

**Honesty note:** first harness pass clicked non-stamp **Duyệt**/complete (leave / other) while plan card remained — **not** promoted.  
**AP-retarget** (script `_tmp-…-ap.mjs`): scoped **Xử lý nhanh** on card containing `TMDV-PLAN-DH7VCT`:

| Check | Result |
|-------|--------|
| Card visible before | Yes (`12-ap-inbox-before.png`) |
| POST complete plan task | **201** `XBOS-WF-200` · `instance_id=1c7b5a7d-…` · `plan_approval` |
| F5 card gone | Yes — stamp absent (`14-ap-inbox-f5.png`) |
| Plan terminal | API `status=approved` · same `workflow_instance_id` |

**Collateral:** a second complete **201** on unrelated `manager_approval` instance occurred in the same click burst — residual harness precision (below); plan AP outcome still proven by matching `instance_id` + terminal status.

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty title | 🟢 PASS | dialog kept |
| B success HDSD | HP+AP | 🟢 PASS | CO-TMDV `trsport` |
| C logic BR | spawn / inbox stamp | 🟢 PASS | wi set · card stamp · approved |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-REC-PLAN-TMDV-HP-001 | **EVIDENCED** | FE create+submit+F5 @ CO-TMDV |
| TC-HIM-REC-PLAN-TMDV-AP-001 | **EVIDENCED** | Inbox Xử lý nhanh · plan approved · card gone |
| TC-HIM-REC-PLAN-TMDV-FD-001 | supporting PASS | not separate promotion row required |
| TC-HIM-LEAVE-DL-* | unchanged BLOCKED | prior WI — not invent |
| Whole U84 / Phase1 | **not** DONE | catalog ≠ UAT honesty |

---

## Residuals

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **R-U84-REC-PLAN-AP-CLICK-SCOPE-01** | P2 | qa (harness) / optional FE | Inbox harness must scope complete to stamp card only — avoid collateral `complete` on adjacent leave/def tasks |
| CO-DL leave Primary | P0 (prior) | devops/ba-data | still BLOCKED env — out of this WI |

---

## completion_report

**Closed:** U78 Primary P-REC-PLAN @ CO-TMDV FE chain (U65); IEEE/ISO test-log pair; HP+AP EVIDENCED with Network 2xx + FE after + F5; OU scope TMDV documented; zero seed.  
**Open:** harness AP click-scope P2; CO-DL leave cell still BLOCKED from prior WI; UAT/Phase1 not claimed.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-rec-plan-tmdv-01.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-PRIMARY-NEXT-CELL-01
from_role: pm
to_role: qa
ack_status_target: PASS_TO_PM
priority: P1
u65_zero_seed: true
test_log_required: true
hdsd_align: true

MISSION: After U78-U84-PRIMARY-REC-PLAN-TMDV-01 PASS (HP+AP EVIDENCED), execute next open U84 Primary cell FE-only — prefer P-REC-REQ @ CO-TMDV (TC-HIM-REC-REQ-TMDV-HP-001 + AP) OR unblock CO-DL leave if staff mapping ready. Read HIM matrix + company matrix; U78 test-log; no seed; promote only TC-IDs actually run.
evidence_path: docs/qa/evidence/u78-u84-primary-<cell>-01.md
```
