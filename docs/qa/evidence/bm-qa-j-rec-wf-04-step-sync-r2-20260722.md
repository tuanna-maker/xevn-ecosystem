# BM-QA-J-REC-WF-04-STEP-SYNC-R2 — Candidate pipeline step → stage sync (retest)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-J-REC-WF-04-STEP-SYNC-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P0 |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **executed_at** | 2026-07-22 ~13:32–13:36 ICT |
| **URL** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · Group CEO · `companyId=main` |
| **U65** | zero-seed · browser-only · **cấm** seed |
| **spec_ref** | **J-REC-WF-04** · AC-REC-WF-04 mutate · `REC_WF_TASK_TYPE_TO_STAGE` bare aliases |
| **J-*** | **J-REC-WF-04** (narrow step-sync R2 only) |
| **prior FAIL** | `docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-01-20260722.md` |
| **BE fix** | `docs/qa/evidence/bm-be-rec-wf-04-step-sync-callback-01-20260722.md` READY |
| **DO sync** | `docs/qa/evidence/d-do-sync-8088-bm-wf04-callback-01-20260722.md` PASS |
| **Phase1 / PROD** | **not claimed** |

---

## Executive summary

**PASS** — closes prior FAIL (stage stuck `new` / `wf_callback_fingerprint=null`).  
FE **Bắt đầu QT** → Inbox complete **intake** then **screening** → GET + F5: `stage=screening` · fingerprint **non-null**.

---

## Micro-checklist

- [x] 1. Login → HRM Tuyển dụng → Candidates list → UV `applied`/`new` with no wi (`QA Pool 1780114425114`)
- [x] 2. Click «Bắt đầu QT» → start-pipeline **201** · `spawnMissing:false` · wi `3d882db2-1228-4955-926c-4a285d9b3b90`
- [x] 3. XBOS Inbox → open instance → **Hoàn thành** intake **201** · **Hoàn thành** screening **201**
- [x] 4. GET candidates-pool (same id) + F5: `stage=screening` · `wf_callback_fingerprint` **non-null** · FE chip **Sàng lọc**
- [x] 5. Evidence + PASS_TO_PM (1 residual max — soft defer only)

---

## Verdict matrix

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Applied UV · `wi=null` → **Bắt đầu QT** | **PASS** | `1780114425114` · id `220994ed-…` |
| 2 | `start-pipeline` 2xx · `spawnMissing:false` · wi set | **PASS** | **201** `HRM-REC-CP-WF-200` · wi `3d882db2-…` |
| 3 | Inbox FE complete screening/intake | **PASS** | intake **201**; screening **201** `XBOS-WF-200` |
| 4 | Stage advances · fingerprint · F5 | **PASS** | `stage=screening` · fp set · list **Sàng lọc** · funnel 1→**2** |
| U65 | No seed | **PASS** | |

**Overall:** **PASS** (L2.5 J-REC-WF-04 step-sync R2)

---

## Click path (U65)

```
Login ceo@xe.vn (session on :8088)
→ /hr/recruitment?tenantId=xevn&companyId=main
→ Ứng viên → Tất cả ứng viên
→ QA Pool 1780114425114 (Ứng tuyển, wi=null) → Bắt đầu QT
→ Toast/row: Chờ CV / Mới · QT XBOS · không đổi tay
→ /command-center?wfInstanceId=3d882db2-1228-4955-926c-4a285d9b3b90
→ Hoàn thành (step_key=intake) → 201
→ Hoàn thành (step_key=screening, task d9390c68-…) → 201
→ GET candidates-pool/220994ed-… → stage=screening · fp non-null
→ F5 /hr/recruitment → list row Sàng lọc · funnel Sàng lọc=2
```

---

## Network (browser session)

### Start pipeline

```http
POST /api/hrm/recruitment/candidates-pool/220994ed-cf4f-4829-9464-172f0e660709/start-pipeline?company_id=main
→ 201 HRM-REC-CP-WF-200
data.workflow_instance_id = 3d882db2-1228-4955-926c-4a285d9b3b90
data.spawnMissing = false
data.stage = new
```

### Inbox complete (FE-sourced)

```http
POST /api/xbos/workflow-engine/tasks/f0a5b97c-6112-4170-9c0d-c808996b477a/complete
→ 201 XBOS-WF-200 · step_key=intake · instanceCompleted=false

POST /api/xbos/workflow-engine/tasks/d9390c68-1b3a-4b4d-9240-2d78bece6337/complete
→ 201 XBOS-WF-200 · step_key=screening · pendingHats=[] · instanceCompleted=false
```

### Post-step candidate (GET by id)

```http
GET /api/hrm/recruitment/candidates-pool/220994ed-cf4f-4829-9464-172f0e660709?company_id=main
→ 200 HRM-REC-CP-200
data.stage = screening
data.workflow_instance_id = 3d882db2-1228-4955-926c-4a285d9b3b90
data.wf_callback_fingerprint = 3d882db2-1228-4955-926c-4a285d9b3b90:screening:d9390c68-1b3a-4b4d-9240-2d78bece6337
data.updated_at = 2026-07-22T06:35:36.970Z
```

### FE after F5

- Row `QA Pool 1780114425114`: status chip **Sàng lọc** · `QT XBOS · không đổi tay`
- List tab **Sàng lọc 2** (was 1 pre-test)
- Dashboard funnel **Sàng lọc 2** / **Chờ CV / Mới 2** (was 3)

---

## Residual (≤1 · non-blocker)

| Item | Owner | Note |
|------|-------|------|
| Soft: hired row still shows **Bắt đầu QT** when `wi=null` | defer | Prior soft; out of R2 AC |

**cấm reopen:** J-REC-WF-02/03 · seed · Phase1/PROD claim

---

## Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-r2-20260722.md`
- **completion_report:** R2 PASS — bare `screening` step complete syncs `candidates.stage` + fingerprint on `:8088`; prior FAIL closed. Soft hired-CTA defer only.
- **next_dispatch_prompt:** |

```text
work_item_id: BM-QC-J-REC-WF-04-STEP-SYNC-R2
from_role: pm
to_role: qc
lane: governance
priority: P0
program: P1-BMINUTES-CUST-RETEST-01

entry_criteria:
- QA PASS evidence: docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-r2-20260722.md
- BE READY: docs/qa/evidence/bm-be-rec-wf-04-step-sync-callback-01-20260722.md
- DO sync PASS: docs/qa/evidence/d-do-sync-8088-bm-wf04-callback-01-20260722.md
- U65 zero-seed · NOT Phase1/PROD

exit_criteria:
- Audit QA evidence vs J-REC-WF-04 step-sync AC (start-pipeline → Inbox screening complete → stage=screening + fp non-null + F5)
- Verdict GO or GO WITH CONDITIONS (≤1 soft residual: hired CTA when wi=null)
- evidence_path: docs/qa/evidence/bm-qc-j-rec-wf-04-step-sync-r2-20260722.md
- PASS_TO_PM with next_dispatch_prompt for PM promote PROGRAM_JOURNEY_MAP J-REC-WF-04 🟡→✅

cấm: re-run full HRM sweep · reopen J-REC-WF-02/03 · seed · Phase1/PROD claim
```
