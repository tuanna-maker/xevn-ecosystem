# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01` **READY_FOR_QA** |
| **parallel** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01` **READY** (kanban spot executed) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` (stage writer `holding`) |
| **Stamp** | `RECCNSQA-MSJ8KFL7` · kanban `RECCNSKAN-MSJ8OZBH` |
| **U65** | zero-seed · L1 invent KEY + browser kanban spot · **no** seed · **no** ready flip |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · REC-QC/UX/JD/IV one-active **SEAL RETAIN** · EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · DENY module REC UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 7/7 + VAL-REC-CNS-04 kanban) |
| **change_mode** | ADD verify · no wipe seals |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Dist freshness | `assertInterviewScheduleAllowed` + `HRM-REC-IV-400-STAGE-DISALLOW` present in dist (mtime 2026-08-08 ~00:36–00:37) · unauth effective **401** (not 404) |
| Git HEAD | `dc930c5` |
| Runner L1 | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01.mjs` |
| Runner kanban | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01-kanban.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01.json` · `…-kanban.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01/kanban-board.png` |

**spec_ref:** BA-01 §6.3 VAL-REC-CNS-01/02/04/05 · BE-01 evidence · FE-01 READY

**Seed:** none. Admin CREATE N+1 stages (`hr_iv_deny_*` / `hr_iv_allow_*`) via Settings Nest path only (open catalog — not fake density).

---

## 2. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **Dist** | CNS symbols live | assert + DISALLOW constants in dist · route not 404 | 🟢 |
| **EFF>0** | catalog active >0 | GET effective **200** total=4 (after admin N+1) | 🟢 |
| **VAL-REC-CNS-02** | invent `createCandidatePool` → **400** `HRM-REC-STAGE-UNKNOWN` | POST `/candidates-pool` stage=`zz_invent_stage_*` → **400** `HRM-REC-STAGE-UNKNOWN` | 🟢 |
| **VAL-REC-CNS-01** APP-02 | invent transition RETAIN UNKNOWN | PATCH `/candidates-pool/:id/stage` invent → **400** `HRM-REC-STAGE-UNKNOWN` | 🟢 |
| **VAL-REC-CNS-05** | `allows_interview_schedule=false` → **400** `HRM-REC-IV-400-STAGE-DISALLOW` ≠ UNKNOWN ≠ 409-ACTIVE | POST `/interviews-catalog` on deny-stage pool → **400** `HRM-REC-IV-400-STAGE-DISALLOW` | 🟢 |
| **IV one-active** | **409** `HRM-REC-IV-409-ACTIVE` RETAIN | Lane A POST `/interviews` 201 then dup → **409** `HRM-REC-IV-409-ACTIVE` | 🟢 |
| **VAL-REC-CNS-04** kanban | EFF>0 columns = EFF keys (N+1) · not starter-six SoT | Browser Board: GET effective 200 keys=4 · `rec-kanban-board` **cols=4** (N+1 incl. IV Deny/Allow) · ≠ six hardcode | 🟢 |
| **Honesty / seals** | ready=false · C-SLICE · seals RETAIN | LOCKED · DENIED module REC UAT | 🟢 |

---

## 3. Key network stamps

```text
GET  /api/hrm/recruitment/pipeline-stages/effective?company_id=main
     → 200 HRM-REC-STG-200 total=4
POST /api/hrm/recruitment/pipeline-stages
     → 201 HRM-REC-STG-201 key=hr_iv_deny_msj8kfl7 allowsInterviewSchedule=false
POST /api/hrm/recruitment/candidates-pool {stage:zz_invent_*}
     → 400 HRM-REC-STAGE-UNKNOWN
PATCH /api/hrm/recruitment/candidates-pool/:id/stage {stage:zz_invent_*}
     → 400 HRM-REC-STAGE-UNKNOWN
POST /api/hrm/recruitment/interviews-catalog (candidate on deny stage)
     → 400 HRM-REC-IV-400-STAGE-DISALLOW
POST /api/hrm/recruitment/interviews (Lane A)
     → 201 HRM-REC-203 · dup → 409 HRM-REC-IV-409-ACTIVE
```

**Browser (UF-REC-STAGE-CNS-03):** Login → `/hr/recruitment?tab=dashboard` → click **Board tuyển dụng** → Network GET `…/pipeline-stages/effective` **200** · board columns = 4 EFF keys (screenshot).

---

## 4. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`recruitment_uat_ready`** | **`false`** — **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** |
| REC UX QC process / JD DnD / IV one-active core | **SEAL RETAIN** — one-active 409 spot PASS (no reopen) |
| REC-QC-01/02 · EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS | **SEAL RETAIN** |
| Module REC UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |

---

## 5. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| — | — | No residual P0/P1 this stamp | — |

**OBS:** Dashboard funnel title still says «Pipeline ứng viên (6 giai đoạn)» — display funnel helper, **not** kanban SoT; VAL-REC-CNS-04 SoT = Board columns (PASS). Optional FE copy cleanup later — not blocking CNS KEY.

---

## 6. completion_report

**Closed:** CNS KEY invent + IV soft-gate + one-active retain + kanban EFF bind. Stamp `RECCNSQA-MSJ8KFL7` / `RECCNSKAN-MSJ8OZBH`. Dist fresh. Invent createCandidatePool + APP-02 → **400** `HRM-REC-STAGE-UNKNOWN`. IV schedule on `allows_interview_schedule=false` → **400** `HRM-REC-IV-400-STAGE-DISALLOW` (≠ UNKNOWN ≠ 409-ACTIVE). Lane A one-active **409** RETAIN. Browser Board columns = EFF N+1 (4) not starter-six. Honesty false · seals retain · C-SLICE · zero-seed.

**Residual:** none P0/P1. `recruitment_uat_ready=false` until program promotes module REC separately.

**Forbidden claims:** module REC UAT · Phase1 DONE · flip ready · reopen REC UX/JD/IV one-active · wipe REC-QC.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-QA-01 PASS_TO_PM
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qa: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01.md
ref_be: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-be-01.md
ref_fe: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-fe-01.md
ref_ba: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md

## entry
QA PASS stamp RECCNSQA-MSJ8KFL7 · L1 7/7 + kanban VAL-REC-CNS-04 · U65 zero-seed · recruitment_uat_ready=false

## task
Narrow QC gate CNS slice only:
- Audit invent KEY 400 HRM-REC-STAGE-UNKNOWN (create pool + APP-02)
- Audit IV soft-gate 400 HRM-REC-IV-400-STAGE-DISALLOW ≠ UNKNOWN ≠ 409-ACTIVE
- Audit one-active 409 RETAIN
- Audit kanban EFF columns (not starter-six SoT)
- SEAL RETAIN REC-QC/UX/JD/IV · C-SLICE-≠-MODULE · DENY module REC UAT / ready flip
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qc-01.md

## cấm
seed · flip recruitment_uat_ready · reopen IV one-active core · claim module REC UAT · wipe peer seals

## exit
GO WITH CONDITIONS or NO-GO · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```
