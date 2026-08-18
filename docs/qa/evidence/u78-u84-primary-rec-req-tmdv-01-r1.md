# Evidence — U78-U84-PRIMARY-REC-REQ-TMDV-01-R1

| Field | Value |
|-------|--------|
| **work_item_id** | `U78-U84-PRIMARY-REC-REQ-TMDV-01-R1` |
| **prior** | `U78-U84-PRIMARY-REC-REQ-TMDV-01` (**BLOCKED** JD `HRM-REC-JD-POS`) |
| **be_fix** | `D-U84-REC-REQ-TMDV-JD-CATALOG-ASSERT-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** Primary cell P-REC-REQ @ **CO-TMDV** (HP + AP) |
| **cell** | P-REC-REQ @ **CO-TMDV** · slug `trsport` · OU «Công ty Cổ phần Thương mại và Dịch vụ X.E» |
| **U65** | honored — no seed / no inbox seed / no DB fake |
| **U76** | `hdsd_align: true` |
| **U78** | [`u78-u84-primary-rec-req-tmdv-01-r1-test-log.md`](u78-u84-primary-rec-req-tmdv-01-r1-test-log.md) · [`.json`](u78-u84-primary-rec-req-tmdv-01-r1-test-log.json) |
| **raw** | [`_tmp-u78-u84-primary-rec-req-tmdv-01-r1-browser.json`](_tmp-u78-u84-primary-rec-req-tmdv-01-r1-browser.json) · [`_tmp-…-r1-cont-browser.json`](_tmp-u78-u84-primary-rec-req-tmdv-01-r1-cont-browser.json) |
| **screens** | `docs/qa/evidence/screens/u78-u84-primary-rec-req-tmdv-01-r1/` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` |
| **commit** | `dc930c5` (+ BE fix live on `:28001`) |
| **L0** | `qc:dev-stack` HRM+XBOS+portal **200** · `qc:fe-be-health` **ALL PASS** |

---

## Executive verdict

**PASS_TO_PM** — U78 browser retest of Primary cell **P-REC-REQ @ CO-TMDV** after BE catalog-assert fix completed FE-only:

| Layer | Result |
|-------|--------|
| **Precond TC-WFM-REC-REQ-HP-001** | 🟢 active def `hrm_requisition_approval` (`6f17062a-…`) |
| **JD create @ trsport** | 🟢 POST **201** `HRM-REC-JD-201` (`DRIVER_LEAD` / Lái xe) · F5 row |
| **TC-HIM-REC-REQ-TMDV-HP-001** | 🟢 **EVIDENCED** — create **201** `HRM-REC-201` → **Gửi duyệt QT** **201** `HRM-REC-WF-200` → F5 + `workflow_instance_id` |
| **TC-HIM-REC-REQ-TMDV-AP-001** | 🟢 **EVIDENCED** — Inbox stamp → **Xử lý nhanh** → **201** `XBOS-WF-200` (`requisition_approval` · matching `instance_id`) → F5 card gone · HRM status `open` (Đang tuyển) |
| **UAT / Phase1 / whole U84** | **not claimed** |

**promoted TC-IDs:** `TC-HIM-REC-REQ-TMDV-HP-001` · `TC-HIM-REC-REQ-TMDV-AP-001`  
**XREF observe:** `TC-XIC-WF-HP-003` path exercised via Inbox complete (not separate XIC pack retest claim).

---

## Persona / scope

| Field | Value |
|-------|--------|
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope used | Group CEO embed · URL `companyId=trsport` · OU filter **Công ty Cổ phần Thương mại và Dịch vụ X.E** |
| Target role | **Lái xe / Vận hành logistics** · BR-PO-REC-LGX-01 · catalog `DRIVER_LEAD` |
| BE live probe (diagnostic, cleaned) | POST `trsport`+`DRIVER_LEAD` **201** then DELETE — confirms fix before FE |

---

## HDSD inventory (U76)

| # | Surface | Found | Used |
|---|---------|-------|------|
| 1 | `/hr/recruitment?tab=jd-library` · **Thư viện JD** | Yes | Thêm JD precond |
| 2 | **+ Thêm JD** · Chức danh Lái xe / `DRIVER_LEAD` | Yes | POST 201 |
| 3 | `/hr/recruitment?tab=requisitions` · **Thêm yêu cầu** | Yes | HP create |
| 4 | Banner / row **Gửi duyệt QT** | Yes | submit-workflow |
| 5 | CC **Hộp thư** · card stamp · **Xử lý nhanh** | Yes | AP |

---

## IDs (this run)

| Field | Value |
|-------|--------|
| STAMP | `TMDV-REQ-R1-DINI2P` |
| jdId | `9aceb7c4-01fd-4d5d-bd46-23f36b686f05` |
| requisitionId | `46c0fff1-ad3e-412e-81df-a7680f3f2801` |
| workflow_instance_id | `36292db7-4630-4f85-a7e0-4f306fbc50b9` |
| AP task | `e2a36ab7-6ad5-4567-b148-24f4ef7ac8d4` · `step_key=requisition_approval` · **201** `XBOS-WF-200` |
| Title | `JD Lái xe Vận hành logistics TMDV-REQ-R1-DINI2P` |

---

## Phase A — HP (JD + YCTD + Gửi duyệt QT + F5)

1. L0 PASS · WF def active · employees trsport=4  
2. Login inject → `/hr/recruitment?tab=jd-library&companyId=trsport` · OU TM-DV  
3. Fail-deep: empty JD submit → dialog kept  
4. Fill JD Lái xe / DRIVER_LEAD → **Lưu** → POST **201** `HRM-REC-JD-201` (prior blocker closed)  
5. F5 → stamp on JD library  
6. Tab Yêu cầu → Thêm yêu cầu → pick JD → Lưu → POST **201** `HRM-REC-201`  
7. **Gửi duyệt QT** → POST **201** `HRM-REC-WF-200` · `workflowInstanceId` set · status `pending_approval`  
8. F5 list: stamp + wi persisted  

**Harness note:** first pass falsely flagged `create_req` BLOCKED after dialog closed (Lưu disabled check). Network already showed POST **201**; continuation script completed submit+AP without re-creating. Corrected in raw JSON.

Screens: `01-jd-library` … `11-f5-list`.

---

## Phase B — AP (Inbox Xử lý nhanh)

| Check | Result |
|-------|--------|
| Card visible before | Yes (`12-inbox-before.png`) — stamp `TMDV-REQ-R1-DINI2P` |
| POST complete | **201** `XBOS-WF-200` · `instance_id=36292db7-…` · `requisition_approval` |
| F5 card gone | Yes (`14-ap-inbox-f5.png`) |
| HRM terminal | status **`open`** (Đang tuyển) · same `workflow_instance_id` — post-approve hiring state (not plan's `approved`) |

---

## Case matrix (this WI)

| Case | id | status | notes |
|------|-----|--------|-------|
| A fail deep | empty JD | 🟢 PASS | dialog kept |
| B success HDSD | HP+AP | 🟢 PASS | CO-TMDV `trsport` after BE fix |
| C logic BR | DRIVER_LEAD / LGX | 🟢 PASS | picker + assert holding partition · persist `trsport` |

---

## Promoted / not_promoted

| TC-ID | Status | Notes |
|-------|--------|-------|
| TC-HIM-REC-REQ-TMDV-HP-001 | **EVIDENCED** | JD 201 + YCTD create+submit+F5 @ CO-TMDV |
| TC-HIM-REC-REQ-TMDV-AP-001 | **EVIDENCED** | Inbox Xử lý nhanh · matching WI · card gone · status `open` |
| TC-HIM-REC-REQ-TMDV-FD-001 | supporting PASS | empty JD dialog kept |
| TC-HIM-REC-REQ-VISUN-* | unchanged | not this WI |
| TC-HIM-ATT-TMDV-* | unchanged FAIL/BLOCKED | prior WI — residual |
| Whole U84 / Phase1 | **not** DONE | |

---

## Residuals

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| R-U84-REC-PLAN-AP-CLICK-SCOPE-01 | P2 | qa harness | prior — stamp-scoped this run; keep discipline |
| **R-U84-ATT-ADJ-TMDV-TIMEWIRE** | **P0** (prior) | **dev-be** | P-ATT-ADJ FE HH:mm → TIMESTAMPTZ 500 — still open |
| P-REC-PIPE @ CO-TMDV | P1 program | qa | next Primary after REQ; needs candidates from FE |
| CO-DL leave Primary | P0 prior | devops/ba-data | still BLOCKED-EXTERNAL |

---

## completion_report

**Closed:** U78 R1 Primary P-REC-REQ @ CO-TMDV FE chain (U65) after D-U84 JD catalog assert; IEEE/ISO test-log pair; HP+AP **EVIDENCED** with Network 2xx + FE after + F5; prior BLOCKED residual closed.  
**Open:** P-ATT-ADJ FAIL residual; P-REC-PIPE not yet run; UAT/Phase1 not claimed.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01-r1.md`

### next_dispatch_prompt

```text
work_item_id: U78-U84-PRIMARY-REC-PIPE-TMDV-01
from_role: pm
to_role: qa
ack_status_target: PASS_TO_PM
priority: P1
u65_zero_seed: true
hdsd_align: true
test_log_required: true

MISSION: Browser execute Primary P-REC-PIPE @ CO-TMDV (TC-HIM-REC-PIPE-TMDV-HP-001 / AP-001) FE-only after P-REC-REQ EVIDENCED.
entry: REQ cell PASS docs/qa/evidence/u78-u84-primary-rec-req-tmdv-01-r1.md · JD+YCTD stamp TMDV-REQ-R1-DINI2P available @ trsport (may create fresh candidate via FE — no seed).
Persona: ceo@xe.vn / Xevn@2026 · companyId=trsport · OU TM-DV
Steps: login → recruitment candidates/pipeline HDSD → create/move candidate on REQ → Gửi duyệt pipeline if WF · Inbox AP stamp-scoped · U78 test-log · promote only if FE chain 2xx+F5.
PARALLEL residual (if PIPE blocked on candidate precond):
work_item_id: D-U84-ATT-ADJ-TMDV-TIMEWIRE-01
to_role: dev-be
MISSION: Fix TC-HIM-ATT-TMDV-HP FAIL — FE attendance adjust POST 500 timestamptz from HH:mm "08:00" @ CO-TMDV (evidence u78-u84-primary-att-adj-tmdv-01.md).
cấm: seed inbox / invent EVIDENCED
evidence_path: docs/qa/evidence/u78-u84-primary-rec-pipe-tmdv-01.md
```
