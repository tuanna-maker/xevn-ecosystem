# BM-QA-J-REC-WF-03-INBOX-01 — Inbox duyệt → HRM sync (J-REC-WF-03)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-J-REC-WF-03-INBOX-01` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P1 |
| **executed_at** | 2026-07-22 ~00:24–00:28 ICT (evidence stamp 20260722) |
| **URL** | `http://14.225.217.232:8088` |
| **persona** | Group CEO / BOD session (`ceo@xe.vn` lane) |
| **U65** | zero-seed · browser-only · **cấm** seed inbox · no Phase1/PROD claim |
| **entry** | `docs/qa/evidence/bm-qa-rec-wf-spawn-r2-20260722.md` (instance still open) |
| **spec_ref** | **J-REC-WF-03** · AC-REC-WF-03 · G-BM-REC-06 · maps J-XBOS-01 pattern |
| **J-*** | **J-REC-WF-03** |

---

## Executive summary

**PASS** — Used FE-spawned open instance from R2 (`ad7089df-…` / YCTD `BM-QA-R2 YCTD spawn 1784652099003`, still `pending_approval` + «QT XBOS đang chạy»). No new YCTD create needed; **no seed**.

CC Inbox → **Mở chi tiết** (`?wfInstanceId=ad7089df-…`) → **Hoàn thành** (aria `Xử lý nhanh`) → `POST …/tasks/b8a38e92-…/complete` **201** `XBOS-WF-200` · `instanceCompleted:true` · sibling `admin@xe.vn` **skipped**. HRM requisition **`status=open`** immediately; FE list **Đang tuyển**; **F5** persists. No `instance_mismatch`.

---

## Environment

| Item | Detail |
|------|--------|
| Portal | `http://14.225.217.232:8088` |
| Inbox | `/command-center` |
| HRM verify | `/hr/recruitment?tenantId=xevn&companyId=main` → tab **Yêu cầu tuyển dụng** |
| Seed | **none** |
| Source chain | FE spawn from `BM-QA-REC-WF-SPAWN-R2` (not re-seeded) |

---

## Verdict matrix

| ID | Criterion | Verdict | Notes |
|----|-----------|---------|-------|
| **Precondition** | Open recruitment inbox task from FE spawn (or create YCTD+Gửi duyệt) | **PASS** | R2 instance still pending — reused |
| **J-REC-WF-03** | Inbox Duyệt/Hoàn thành → HRM plan/req status sync → F5 | **PASS** | `pending_approval` → `open` / «Đang tuyển» |
| **U65** | No seed inbox | **PASS** | Task from R2 FE Gửi duyệt QT |
| **Terminal bridge** | No `HRM-REC-WF-CALLBACK-SKIP instance_mismatch` | **PASS** | status flipped to `open` |
| **Phase1 / PROD** | Not claimed | **N/A** | |

---

## 1) Precondition — open FE-sourced task

### HRM list (before approve)

```
/hr/recruitment → Yêu cầu tuyển dụng
BM-QA-R2 YCTD spawn 1784652099003 | Nhân sự tập đoàn | 2 | Chờ duyệt QT | QT XBOS đang chạy
```

### API (before)

```http
GET /api/hrm/recruitment/requisitions/d4f3edb1-b5b5-40d0-b27f-b3ee35a29e43?company_id=main
→ 200 HRM-REC-200
data.status=pending_approval
data.workflow_instance_id=ad7089df-f303-4a43-b4f0-12868ad78c2e
```

### Inbox task (FE spawn chain)

```http
GET /api/xbos/workflow-engine/tasks?status=pending&limit=200
→ task id=b8a38e92-9938-490f-8cf4-3826c3562081
   instance_id=ad7089df-f303-4a43-b4f0-12868ad78c2e
   assignee=ceo@xe.vn · business_id=d4f3edb1-… · workflow_code=hrm_requisition_approval
   sibling admin@xe.vn task 7140ef0d-… (parallelPolicy=any)
```

**Decision:** Skip re-create YCTD — open FE-sourced task present (dispatch step 1 alternate).

---

## 2) J-REC-WF-03 — Inbox duyệt

### Click path

```
Command Center (/command-center)
→ first «Phê duyệt yêu cầu tuyển dụng HRM» card → Mở chi tiết
→ URL: /command-center?wfInstanceId=ad7089df-f303-4a43-b4f0-12868ad78c2e
→ panel CHI TIẾT NHIỆM VỤ · Trạng thái: Đang chờ
→ Hoàn thành (aria-label Xử lý nhanh)
```

### Network

```http
POST /api/xbos/workflow-engine/tasks/b8a38e92-9938-490f-8cf4-3826c3562081/complete
→ 201 XBOS-WF-200 «Task completed»
data.task.status=completed
data.task.payload.approvedBy=ceo@xe.vn
data.instanceCompleted=true
data.pendingHats=[]
```

```http
GET …/instances/ad7089df-…/detail
→ 200 XBOS-WF-204
instance.status=completed
tasks: ceo completed · admin@xe.vn skipped
```

### FE after 2xx (detail panel)

| Check | Result |
|-------|--------|
| Panel trạng thái | **Hoàn thành** |
| ceo@xe.vn step | Hoàn thành |
| admin@xe.vn step | skipped |

---

## 3) HRM status sync + F5

### API (after approve)

```http
GET /api/hrm/recruitment/requisitions/d4f3edb1-…?company_id=main
→ 200
data.status=open
data.workflow_instance_id=ad7089df-… (unchanged)
```

### FE list (navigate + tab YCTD)

| Check | Result |
|-------|--------|
| Row title | `BM-QA-R2 YCTD spawn 1784652099003` |
| Trạng thái | **Đang tuyển** (was Chờ duyệt QT) |
| Thao tác | Chi tiết / Sửa — **no** «QT XBOS đang chạy» |

### F5

Reload `/hr/recruitment` → YCTD → same row still **Đang tuyển**; API still `status=open`.

---

## Residual / not promoted

| Item | Note |
|------|------|
| J-REC-WF-04 / J-06 reject path | Out of this work_item |
| Other stale pending rec inbox tasks | Pre-existing backlog — not closed here |
| Phase1 / PROD | **Not claimed** |
| Journey map row J-REC-WF-03 | Was ⬜ DRAFT — PM may promote to ✅ with this evidence |

---

## completion_report

**Closed:** U65 browser J-REC-WF-03 on `:8088` — reused R2 FE-spawned instance (no seed, no re-create). Inbox Mở chi tiết → Hoàn thành → XBOS complete 201 `instanceCompleted:true` → HRM requisition `open` / FE «Đang tuyển» → F5 PASS. Closes prior canvas residual where approve left `pending_approval` (`instance_mismatch`).

**Open residual:** none P0 for this work_item. Optional: promote `PROGRAM_JOURNEY_MAP.md` J-REC-WF-03 ⬜→✅; QC gate; J-06 reject path still separate.

## next_owner

`pm` → intake PASS; dispatch **qc** gate for J-REC-WF-03 / AC-REC-WF-03 (or update journey map + next BM residual).

## next_dispatch_prompt

```text
work_item_id: BM-QC-J-REC-WF-03-GATE-01
from_role: pm
to_role: qc
priority: P1
program: P1-BMINUTES-CUST-RETEST-01
U65 · cite docs/qa/evidence/bm-qa-j-rec-wf-03-inbox-01-20260722.md
+ prior spawn docs/qa/evidence/bm-qa-rec-wf-spawn-r2-20260722.md

Audit QA PASS for J-REC-WF-03: FE-sourced inbox (no seed) → Hoàn thành 201 XBOS-WF-200 instanceCompleted true → HRM status open / FE Đang tuyển → F5.
entry: evidence pack; confirm no instance_mismatch residual
exit: GO/GWC; optionally mark PROGRAM_JOURNEY_MAP J-REC-WF-03 ✅; do not claim Phase1/PROD
cấm: seed · require reject path J-06 in this gate unless listed
```

## ack_status

**PASS_TO_PM**
