# BM-QA-J-REC-WF-04-STEP-SYNC-01 — Candidate pipeline step → stage sync (J-REC-WF-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-J-REC-WF-04-STEP-SYNC-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **FAIL_TO_PM** |
| **priority** | P1 |
| **executed_at** | 2026-07-22 ~11:02–11:10 ICT |
| **URL** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · Group CEO · `companyId=main` |
| **U65** | zero-seed · browser-only · **cấm** seed |
| **spec_ref** | **J-REC-WF-04** · AC-REC-WF-04 mutate · `REC_WF_TASK_TYPE_TO_STAGE` |
| **J-*** | **J-REC-WF-04** (narrow step-sync only) |
| **Phase1 / PROD** | **not claimed** |

---

## Executive summary

**FAIL** — FE **Bắt đầu QT** + Inbox complete **PASS**; **stage/roadmap sync FAIL**.  
`POST …/start-pipeline` → **201** `HRM-REC-CP-WF-200` · `spawnMissing:false` · `workflow_instance_id=39e4853b-…`. Inbox FE complete `intake` then `screening` → **201** `XBOS-WF-200`. Candidate **stage remains `new`**; `wf_callback_fingerprint=null`; `updated_at` stuck at spawn time. Residual → **BE** callback / stepKey map (`rec_*` vs bare `screening`).

---

## Verdict matrix

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Applied UV · `wi=null` → **Bắt đầu QT** | **PASS** | QA Pool `1780114488912` · id `8942bb51-…` |
| 2 | `start-pipeline` 2xx · `spawnMissing:false` · wi set | **PASS** | **201** · wi `39e4853b-97fc-4b99-b662-4213a7e41981` |
| 3 | Inbox FE complete one pipeline step | **PASS** | `intake` **201**; also `screening` **201** (extra probe) |
| 4 | Roadmap chip / stage advances · F5 | **FAIL** | stage still **`new`** · Sàng lọc funnel **0** · fp **null** |
| U65 | No seed | **PASS** | |

**Overall:** **FAIL** (L2.5 step-sync AC)

---

## Click path (U65)

```
Login ceo@xe.vn → /hr/recruitment?tenantId=xevn&companyId=main
→ Ứng viên → list (5)
→ QA Pool 1780114488912 (Ứng tuyển / applied, wi=null) → Bắt đầu QT
→ Toast: Đã bắt đầu quy trình ứng viên · row: Chờ CV / Mới · QT XBOS · không đổi tay
→ /command-center → Mở chi tiết Roadmap ứng viên HRM (?wfInstanceId=39e4853b-…)
→ Hoàn thành (step_key=intake) → 201
→ Hoàn thành (step_key=screening) → 201  [extra — still no stage advance]
→ GET candidates-pool · F5 list: stage=new · Sàng lọc 0
```

---

## Network (browser session)

### Start pipeline

```http
POST /api/hrm/recruitment/candidates-pool/8942bb51-b207-41e1-a1ce-6036f9b89fcd/start-pipeline?company_id=main
→ 201 HRM-REC-CP-WF-200
data.workflow_instance_id = 39e4853b-97fc-4b99-b662-4213a7e41981
data.spawnMissing = false
data.stage = new
```

### Inbox complete (FE-sourced)

```http
POST /api/xbos/workflow-engine/tasks/7a824d36-…/complete
→ 201 XBOS-WF-200 · step_key=intake · instanceCompleted=false

POST /api/xbos/workflow-engine/tasks/57e30477-…/complete
→ 201 XBOS-WF-200 · step_key=screening · currentStepOrder→3 · instanceCompleted=false
```

### Post-step candidate (list)

```http
GET /api/hrm/recruitment/candidates-pool?company_id=main → 200
8942bb51-…: stage=new · wi=39e4853b-… · wf_callback_fingerprint=null
updated_at=2026-07-22T04:05:35.368Z  (unchanged since spawn)
```

---

## Root-cause note (for BE residual)

- Live XBOS `step_key` = **`intake` / `screening`** (no `rec_` prefix).
- Bridge map SoT (`recruitment-workflow.bridge.ts`): only `rec_intake` / `rec_screening` / … → stage.
- `mapRecTaskTypeToStage('screening')` → **null** → fail-closed; fingerprint never set.
- Likely also missing/failed HRM step-callback invocation from XBOS complete path (fp stays null).

---

## Residual / next

| work_item_id | Owner | Action |
|--------------|-------|--------|
| **BM-BE-REC-WF-04-STEP-SYNC-CALLBACK-01** | **dev-be** | Accept bare F6 step keys **or** emit `rec_*` taskType; ensure complete → HRM step callback updates `candidates.stage` + `wf_callback_fingerprint`; jest bridge + live retest this UF |

Soft (non-blocker this wave): hired row still shows **Bắt đầu QT** when wi=null.

---

## Handoff

- **ack_status:** `FAIL_TO_PM`
- **next_owner:** `dev-be`
- **evidence_path:** `docs/qa/evidence/bm-qa-j-rec-wf-04-step-sync-01-20260722.md`
- **cấm:** seed · Phase1/PROD claim
