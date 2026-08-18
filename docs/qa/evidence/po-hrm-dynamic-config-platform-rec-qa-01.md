# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01` |
| **resume_chunk** | K6.2d |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · query `company_id=holding` · header `x-company-id=main` |
| **Stamp** | `RECPLATQA-MSIWKJWP` |
| **U65** | zero-seed · L1 API smoke only · **browser UF HOLD** until FE |
| **Honesty** | `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · no module UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 API · 10/10) |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `hrm-api` `:28001` `/api/hrm` | **200** `HRM-HEALTH-200` |
| Portal `:5173` login proxy | **201** `POST /api/xbos/auth/login` |
| Stale-dist probe (unauth pipeline-stages) | **401** — route live (not 404) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-rec-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-qa-01.FINAL.json` |

**spec_ref:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` §5 AC-PLT-REC-02..05 · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-DATA-01.md` §5 VAL-REC-STG-* · BE evidence `po-hrm-dynamic-config-platform-rec-be-01.md`

---

## 2. L1 results (VAL / AC map)

| ID | Check | Expected | Actual | Verdict |
|----|-------|----------|--------|---------|
| ensureSchema | `GET /recruitment/pipeline-stages?company_id=holding` | 200 `[]` or rows | **200** `HRM-REC-STG-200` · total≥0 | 🟢 |
| VAL-REC-STG-04 / AC-PLT-REC-02 | `POST` open key `hr_custom_stage_07_*` | 201 + list + get-by-id | **201** `HRM-REC-STG-201` id=`9d4bd0cd-…` key=`hr_custom_stage_07_msiwkjwp` · list+get **200** same id | 🟢 |
| VAL-REC-STG-04 literal | `POST` `hr_custom_stage_07` | 201 or CONFLICT (not enum) | **201** open catalog | 🟢 |
| VAL-REC-STG-11 | scope_parity list↔get-by-id | same id under holding | **PASS** | 🟢 |
| VAL-REC-STG-02 | `POST` `stageKey=Interview` | 400 `HRM-PLT-CAT-CODE-INVALID` | **400** `HRM-PLT-CAT-CODE-INVALID` | 🟢 |
| F-REC-CAT-EFF-01 | `GET …/pipeline-stages/effective` | `hiredOutcomeKey` when hired present | **200** `hiredOutcomeKey=hired_qa_msiwiylu` | 🟢 |
| VAL-REC-STG-05 | Second `is_hired_outcome` | 409 `HRM-REC-STG-HIRED-DUP` | **409** `HRM-REC-STG-HIRED-DUP` | 🟢 |
| VAL-REC-STG-12 / AC-PLT-REC-04 | stage ∉ effective when catalog>0 | 400 `HRM-REC-STAGE-UNKNOWN` | **400** via pool PATCH (apps list empty; unlocked cand) | 🟢 |
| VAL-REC-STG-08 / AC-PLT-REC-03 | Retire → picker hide; history key intact | retired + active hide; cand stage kept | **201** retire · active hide · cand `1d291765-…` stage=`hr_custom_stage_07_msiwkjwp` intact | 🟢 |
| must_keep | JD / IV / hire surface / YCTD | still reachable | jd-field-defs · jd-form-layouts · interviews-catalog · candidates-pool · requisitions all **200** | 🟢 |

| AC (browser) | Status |
|--------------|--------|
| **AC-PLT-REC-02** Settings → Tạo giai đoạn → F5 → form picker | **⬜ HOLD** — FE seat not delivered; L1 API proves create/list/get/open-key |
| **AC-PLT-REC-03** Retire picker hide (UI) | **⬜ HOLD** — L1 API retire+history PASS |
| **AC-PLT-REC-04** Transition UI 4xx | **⬜ HOLD** — L1 API UNKNOWN PASS |
| **AC-PLT-REC-05** Hire path hired-outcome → EMP | **⬜ HOLD** — must_keep pool 200 only; full soft-link not exercised this seat |

---

## 3. Key network stamps (truncated)

```text
GET  /api/hrm/recruitment/pipeline-stages?company_id=holding
     → 200 HRM-REC-STG-200
POST /api/hrm/recruitment/pipeline-stages {stageKey:hr_custom_stage_07_msiwkjwp}
     → 201 HRM-REC-STG-201
GET  /api/hrm/recruitment/pipeline-stages/:id?company_id=holding
     → 200 (scope_parity)
POST /api/hrm/recruitment/pipeline-stages {stageKey:Interview}
     → 400 HRM-PLT-CAT-CODE-INVALID
GET  /api/hrm/recruitment/pipeline-stages/effective?company_id=holding
     → 200 · hiredOutcomeKey=hired_qa_msiwiylu
POST /api/hrm/recruitment/pipeline-stages {isHiredOutcome:true} (second)
     → 409 HRM-REC-STG-HIRED-DUP
PATCH /api/hrm/recruitment/candidates-pool/:id/stage {stage:not_in_catalog_*}
     → 400 HRM-REC-STAGE-UNKNOWN  (candidate-applications list empty this env)
POST /api/hrm/recruitment/pipeline-stages/:id/retire?company_id=holding
     → 201 status=retired · pool history key intact
GET  jd-field-defs · jd-form-layouts · interviews-catalog · candidates-pool · requisitions
     → 200 must_keep
```

---

## 4. Residual / not promoted

| Item | Status |
|------|--------|
| AC-PLT-REC-02..05 **browser** Settings/picker + hire EMP | **HOLD** → `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-*` then QA browser |
| `candidate-applications` empty — UNKNOWN proven on **pool** path (same F-REC-APP-02 assert) | **OBS** — not blocker for L1 |
| WF-locked pool row first pick → `HRM-REC-WF-LOCKED` | **OBS** — probe skips locked rows |
| `recruitment_uat_ready` | **false** (honesty) |
| J-* L2.5 recruitment journeys | **out of scope** this L1 seat |
| Module REC UAT / Phase1 DONE / payroll_e2e | **DENIED** |
| Seed | **none** (U65) |

---

## 5. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| — | — | No L1 blocker this stamp | — |

---

## 6. completion_report

**Closed:** L1 API smoke PASS for REC pipeline-stage open catalog (ensureSchema live, open `hr_custom_stage_07(+unique)`, format reject `Interview`, effective `hiredOutcomeKey`, second hired `HRM-REC-STG-HIRED-DUP`, consumer `HRM-REC-STAGE-UNKNOWN`, soft retire + picker hide + historical pool stage intact). must_keep JD/IV/hire-surface/YCTD **200**. U65 zero-seed. Stamp `RECPLATQA-MSIWKJWP`. 10/10 required checks.

**Residual:** Browser AC-PLT-REC-02..05 FE path HOLD; full hire→EMP AC-PLT-REC-05 HOLD; `recruitment_uat_ready=false` until FE + browser QA.

**Forbidden claims:** recruitment UAT-ready · payroll_e2e_ready · Phase1 DONE · browser UF PASS · seed as evidence.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** (narrow L1-only GWC SEAL) · then **dev-fe** for browser AC |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-qa-01.FINAL.json` |
| **pm_dispatch_hint** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-01` L1 GWC · then `REC-FE-01` Settings picker |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-01
priority: P2
resume_chunk: K6.2d

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-01.md
2. docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-qa-01.FINAL.json
3. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-be-01.md

## task
Narrow L1-only QC GWC SEAL for F-REC-CAT-STG/EFF + APP-02 UNKNOWN:
- Audit QA stamp RECPLATQA-MSIWKJWP · 10/10 L1 · U65 zero-seed
- Confirm honesty: recruitment_uat_ready=false · payroll_e2e_ready=false · browser AC HOLD
- Do NOT promote module REC UAT / J-* / Phase1 DONE
- Conditions: browser AC-PLT-REC-02..05 + AC-PLT-REC-05 hire→EMP require REC-FE then QA browser
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md

## exit
GO WITH CONDITIONS (L1 seal) or NO-GO with residual owners
completion_report + next_owner (pm → REC-FE-01) + next_dispatch_prompt
```
