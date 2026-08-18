# BM-QA-REC-WF-SPAWN-R2 — J-REC-WF-02 / BM-06 spawn after VISUN apply

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-REC-WF-SPAWN-R2` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P0 |
| **executed_at** | 2026-07-21 ~23:33–23:43 ICT (evidence stamp 20260722) |
| **URL** | `http://14.225.217.232:8088` |
| **persona** | Session JWT Group CEO / BOD (`ceo@xe.vn` lane; Command Center unlocked) |
| **U65** | zero-seed · browser-only · no Phase1/PROD claim |
| **prior FAIL** | `docs/qa/evidence/bm-qa-rec-e2e-8088-01-20260722.md` (SPAWN-MISSING after VISUN) |
| **BE fix** | `docs/qa/evidence/bm-be-rec-wf-spawn-member-01-20260722.md` |
| **sync** | `docs/qa/evidence/d-do-sync-8088-bm-wave1-01-20260722.md` |
| **spec_ref** | BM-06 · BM-AC-06-02 · **J-REC-WF-02** · AC-REC-WF-02 · G-BM-REC-02 |
| **J-*** | **J-REC-WF-02** |

---

## Executive summary

**PASS** — After XBOS `hrm_requisition_approval` **Đơn vị áp dụng = VISUN** (PUT 200 + F5), Group CEO HRM YCTD → **Gửi duyệt QT** returns **201** `HRM-REC-WF-200` with `spawnMissing:false` and `workflow_instance_id=ad7089df-f303-4a43-b4f0-12868ad78c2e`. FE shows «QT XBOS đang chạy» / toast «Đã gửi duyệt quy trình» — **no SPAWN-MISSING banner**. F5 persists. WF apply scope **restored to Toàn tập đoàn** before exit.

Closes prior BM-06 / J-REC-WF-02 FAIL gap from `BM-QA-REC-E2E-8088-01`.

---

## Environment

| Item | Detail |
|------|--------|
| Portal | `http://14.225.217.232:8088` |
| HR mutate | `/hr/recruitment?tenantId=xevn&companyId=main` |
| Seed | **none** |
| Auth | Existing portal session → Command Center (BOD) |

---

## Verdict matrix

| ID | Criterion | Verdict | Notes |
|----|-----------|---------|-------|
| **BM-06 / XBOS** | `hrm_requisition_approval` applyingEntityId=VISUN → Lưu 2xx + F5 | **PASS** | PUT 200 `XBOS-WF-201` |
| **J-REC-WF-02** | Gửi duyệt → `workflow_instance_id` non-null · `spawnMissing` false | **PASS** | instance `ad7089df-…` |
| **BM-06 / HRM** | No SPAWN-MISSING banner; FE «QT XBOS đang chạy» | **PASS** | toast Inbox |
| **G-RC-01** | headcount smoke on same YCTD | **PASS** | `headcount:2` |
| **Cleanup** | Restore Đơn vị áp dụng → Toàn tập đoàn | **PASS** | PUT 200; list shows Toàn tập đoàn |

---

## 1) XBOS — apply VISUN

### Click path

```
Command Center → CÀI ĐẶT HỆ THỐNG → Hệ thống quy trình
→ row hrm_requisition_approval «Phê duyệt yêu cầu tuyển dụng HRM»
→ Chỉnh sửa → Đơn vị áp dụng = VISUN — Công ty TNHH Du lịch Visun
→ Lưu quy trình
```

### Network

```http
PUT /api/xbos/workflow-engine/definitions/944c9abf-a566-4e45-965c-ce441632e746
→ 200 XBOS-WF-201 «Definition saved»
graph.applyingEntityId = dfb107a7-99e3-433a-94e5-f78ce8b2d665  (VISUN)
```

### FE after 2xx + reopen (F5 path)

| Check | Result |
|-------|--------|
| List column Đơn vị áp dụng | `VISUN — Công ty TNHH Du lịch Visun` |
| Reopen Hệ thống quy trình | **PASS** — row still VISUN |

---

## 2) HRM — YCTD create (G-RC-01 smoke)

### Click path

1. `/hr/recruitment?tenantId=xevn&companyId=main`
2. Tab **Yêu cầu tuyển dụng** → **Thêm yêu cầu**
3. JD từ thư viện: `JD-BM-QA-1784649801 — BM-QA-REC JD Thư viện 1784649801`
4. Phòng/Ban `Nhân sự tập đoàn` · Số lượng `2` · Tiêu đề `BM-QA-R2 YCTD spawn 1784652099003` → **Lưu yêu cầu**

### Network

```http
POST /api/hrm/recruitment/requisitions
{"company_id":"main","title":"BM-QA-R2 YCTD spawn 1784652099003","department":"Nhân sự tập đoàn",
 "employment_type":"full_time","headcount":2,"job_template_id":"eb057743-009c-461a-8b62-ef64bdea09ca",…}
→ 201 HRM-REC-201
id=d4f3edb1-b5b5-40d0-b27f-b3ee35a29e43
```

### FE after 2xx

| Check | Result |
|-------|--------|
| List row | `BM-QA-R2 YCTD spawn 1784652099003` · **Số lượng 2** · Đang tuyển |
| Toast | «Đã tạo yêu cầu tuyển dụng» |

---

## 3) J-REC-WF-02 — Gửi duyệt QT (core AC)

### Click path

On row `BM-QA-R2 YCTD spawn 1784652099003` → **Gửi duyệt QT** (no seed inbox).

### Network

```http
POST /api/hrm/recruitment/requisitions/d4f3edb1-b5b5-40d0-b27f-b3ee35a29e43/submit-workflow?company_id=holding
→ 201 HRM-REC-WF-200
data.status=pending_approval
data.workflow_instance_id=ad7089df-f303-4a43-b4f0-12868ad78c2e
data.spawn.workflowInstanceId=ad7089df-f303-4a43-b4f0-12868ad78c2e
data.spawnMissing=false
```

### FE after 2xx

| Check | Result |
|-------|--------|
| Status | **Chờ duyệt QT** |
| Action column | **QT XBOS đang chạy** (not Gửi duyệt / SPAWN-MISSING) |
| Toast | «Đã gửi duyệt quy trình» · «Yêu cầu đã gửi vào Inbox phê duyệt.» |
| SPAWN-MISSING banner | **Absent** |

### F5

Reload `/hr/recruitment` → tab YCTD → same row still **Chờ duyệt QT** + **QT XBOS đang chạy** · no SPAWN-MISSING.

---

## 4) Restore WF apply scope

```
XBOS Hệ thống quy trình → hrm_requisition_approval → Chỉnh sửa
→ Đơn vị áp dụng = Toàn tập đoàn → Lưu
```

```http
PUT …/definitions/944c9abf-a566-4e45-965c-ce441632e746
→ 200 XBOS-WF-201
graph.applyingEntityId = ""
```

List after save: `hrm_requisition_approval … Toàn tập đoàn`. Shared `:8088` not left member-only.

---

## Residual / not promoted

| Item | Note |
|------|------|
| J-REC-WF-03 inbox approve → terminal | Out of this R2 scope (spawn-only). Inbox may already have tasks from prior waves. |
| BM-FE-REC-WF-SPAWN-MEMBER-01 | Optional P1 FE banner/`company_id` polish — not blocking R2 PASS |
| Phase1 / PROD | Not claimed |

---

## completion_report

**Closed:** U65 browser retest J-REC-WF-02 / BM-06 after `BM-BE-REC-WF-SPAWN-MEMBER-01` sync — VISUN apply + Gửi duyệt QT → `spawnMissing:false` + non-null `workflow_instance_id`; no SPAWN-MISSING; F5 OK; WF restored Toàn tập đoàn; G-RC-01 headcount:2 on same create. No seed.

**Open residual:** none P0 for this work_item. Optional J-03 approve chain / FE P1 polish.

## next_owner

`pm` → intake PASS; optional `qc` BM-06 gate or next B-Minutes residual.

## next_dispatch_prompt

```text
work_item_id: BM-QC-REC-WF-SPAWN-R2-GATE (or next BM residual)
from_role: pm
to_role: qc
priority: P1
program: P1-BMINUTES-CUST-RETEST-01
U65 · cite docs/qa/evidence/bm-qa-rec-wf-spawn-r2-20260722.md

Audit QA R2 PASS for J-REC-WF-02 / BM-06: VISUN apply → submit-workflow 201 · spawnMissing false · workflow_instance_id non-null · no SPAWN-MISSING · WF restored Toàn tập đoàn.
entry: evidence pack + prior FAIL closed
exit: GO/GWC with residual list; do not claim Phase1/PROD
cấm: seed · re-open fixed spawn without regression note
```

## ack_status

**PASS_TO_PM**
