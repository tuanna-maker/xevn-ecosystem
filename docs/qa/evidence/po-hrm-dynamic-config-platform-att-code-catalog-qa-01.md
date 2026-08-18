# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` |
| **Stamp** | `ATTCODEQA-MSK4T1A5` |
| **U65** | zero-seed · L1 probe ≠ 🟢 UF · no `pnpm seed:*` · admin CREATE N+1 via Nest catalog API then invent |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · leave `ATTLEAVEQA-MSJ7CPJH` · worksite `ATTWSQA-MSJC3IN9` · EMP **`EMPDEPTQA-MSK3VVXX`** · **`EMPPOSQA2-MSK3CDH1`** · **`EMPSTQA-MSK20G7H`** · **`EMPCFQA-MSK14LUH`** · **`EMPTOKEXTQA-MSJ57PE1`** · SI/CTR · aggregate GĐ1 **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT / flip ready / aggregate rewrite |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 core · FE picker HOLD R-PLT-ATT-CODE-FE-01) |
| **change_mode** | ADD verify · no `apps/**` invent · no seed · no ready flip · **FORBIDDEN** reopen leave/worksite/EMP/SI/CTR · **FORBIDDEN** aggregate rewrite PASS |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Dist gate | `att-attendance-code.service/constants` · controller `attendance-codes/effective` · `HRM-ATT-CODE-KEY` · Create/Update DTO **no** closed `@IsIn(['pending','present','absent','leave'])` · aggregate **no** import att-attendance-code — **not stale** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-code-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-code-catalog-qa-01.json` |

**spec_ref:** BA-01 AC-PLT-ATT-CODE-01* · VAL-ATT-CODE-CNS-* · SA Option **B** · BE-01 READY

**Seed:** none.

---

## 2. L1 execution path (U65)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Dist KEY + DTO open + aggregate sealed spot | dist OK · src Create/Update DTO open · agg untouched |
| 1 | Unauth GET attendance-codes/effective | **401** `HRM-AUTH-001` (≠ 404) |
| 2 | Login `ceo@xe.vn` | portal proxy **201** |
| 3 | GET `/attendance/attendance-codes/effective?company_id=main` | **200** `HRM-ATT-CODE-200` baseline total=0 (empty soft OK · no seed) |
| 4 | Admin CREATE N+1 `wfh_qa_msk4t1a5` (symbol WF · countsAs work) | **POST** → **201** `HRM-ATT-CODE-201` id=`59bc5ca4-…` |
| 5 | F5 GET effective | **200** total=1 · hasOpenKey=true |
| 6 | Invent POST records `status=zz_invent_att_code_msk4t1a5` (EFF>0) | **400** `HRM-ATT-CODE-KEY` (≠ LEAVE/EMP KEY) |
| 7 | Open slug persist `status=wfh_qa_msk4t1a5` date=2026-08-10 | **201** `HRM-ATT-201` · status persisted · **no** IsIn4 reject |
| 8 | Display create response | `status_label=QA WFH ATTCODEQA-MSK4T1A5` · `symbol=WF` |
| 9 | Invent PATCH `/records/{id}/status` invent | **400** `HRM-ATT-CODE-KEY` |
| 10 | GET record by id | **200** label+symbol from catalog |
| 11 | Soft-retire code → re-GET EFF | **201** retire · EFF total=0 · open key **hidden** |
| 12 | Seal routes spot | leave-types/effective **200** · work-sites **200** · agg sealed |
| 13 | Honesty | ready=false · seals RETAIN · C-SLICE · DENY ATT UAT |

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **dist_dto_gate** | F-ATT-CAT-CODE + KEY · no IsIn4 · agg sealed | present · open DTO · agg untouched | 🟢 |
| **L0** | stack 200 | 200 | 🟢 |
| **unauth effective** | 401/403 ≠ 404 | 401 | 🟢 |
| **AC-PLT-ATT-CODE-01c** | GET effective 200 · empty [] OK · no seed | 200 total=0 baseline | 🟢 |
| **AC-PLT-ATT-CODE-01d** | Admin CREATE N+1 · 2xx · F5 EFF sees | POST **201** · EFF has `wfh_qa_msk4t1a5` | 🟢 |
| **AC-PLT-ATT-CODE-01b** | invent → 4xx `HRM-ATT-CODE-KEY` | POST+PATCH **400** KEY | 🟢 |
| **VAL-ATT-CODE-CNS-07** | open slug persists (no IsIn4) | **201** status=`wfh_qa_msk4t1a5` | 🟢 |
| **VAL-ATT-CODE-CNS-08** | status_label + symbol from catalog | label+`WF` on create+get | 🟢 |
| **VAL-ATT-CODE-CNS-09** | KEY taxonomy ≠ leave/EMP | `HRM-ATT-CODE-KEY` only | 🟢 |
| **AC-PLT-ATT-CODE-01e** | soft-retire hidden from default EFF | retire 201 · EFF hidden | 🟢 |
| **VAL-ATT-CODE-CNS-10** | no aggregate rewrite | agg no import att-code | 🟢 |
| **AC-PLT-ATT-CODE-01** FE picker | Nest EFF picker when FE READY | FE hardcode Select residual · **HOLD** | 🟡 HOLD |
| **AC-PLT-ATT-CODE-01f** FE reconcile | early_leave/on_leave rebind | FE HOLD with R-PLT-ATT-CODE-FE-01 | 🟡 HOLD |
| **AC-PLT-ATT-CODE-01H** | Honesty / seals | false · RETAIN leave/WS/EMP/SI/CTR/agg · C-SLICE · U65 | 🟢 |

**OBS (01c):** Empty EFF exercised live at baseline total=0 before admin N+1; invent skip path covered by jest CNS-05 (not forced wipe after N+1).

**FE:** R-PLT-ATT-CODE-FE-01 HOLD — L1 PASS ≠ UF 🟢 / module ATT UAT.

---

## 4. Key network stamps

```text
GET  /api/hrm                                                              → 200  HRM-HEALTH-200
GET  /api/hrm/attendance/attendance-codes/effective (unauth)               → 401  HRM-AUTH-001
GET  /api/hrm/attendance/attendance-codes/effective?company_id=main        → 200  HRM-ATT-CODE-200 (baseline 0)
POST /api/hrm/attendance/attendance-codes                                  → 201  HRM-ATT-CODE-201 key=wfh_qa_msk4t1a5
GET  /api/hrm/attendance/attendance-codes/effective (F5)                   → 200  total=1 hasOpen
POST /api/hrm/attendance/records invent zz_invent_att_code_*               → 400  HRM-ATT-CODE-KEY
POST /api/hrm/attendance/records status=wfh_qa_msk4t1a5                    → 201  HRM-ATT-201 + status_label + symbol=WF
PATCH /api/hrm/attendance/records/{id}/status invent                       → 400  HRM-ATT-CODE-KEY
GET  /api/hrm/attendance/records/{id}                                      → 200  label+symbol
POST /api/hrm/attendance/attendance-codes/{id}/retire                      → 201  HRM-ATT-CODE-200 · EFF hidden
GET  /api/hrm/attendance/leave-types/effective                             → 200  HRM-ATT-LVT-200 (seal)
GET  /api/hrm/attendance/work-sites                                        → 200  HRM-ATT-SITE-200 (seal)
```

**Record under test:** `4ab24bd0-9eb6-4e67-a8cc-0e9243800483` · employee `0500220b-…` · date `2026-08-10` · company scope `main`.

---

## 5. L2 / L2.5

| Surface | Status |
|---------|--------|
| Browser Settings Nest attendance-code admin | **HOLD** — L1 admin via API F-ATT-CAT-CODE-02 OK; Nest Settings tab = FE-01 |
| `AttendanceRecordsTable` Select → Nest EFF | **HOLD** R-PLT-ATT-CODE-FE-01 (VAL-06 / 01f) |
| J-HRM-ATT-CODE-CAT-* | Proposed BA §6.4 — **not claimed** this L1 stamp |
| UF-HRM-05 / J-HRM-06* | **SEAL RETAIN** — **cấm** reopen / claim ATT UAT |

**L1 PASS ≠ UF 🟢 · ≠ module ATT UAT · C-SLICE-≠-MODULE.**

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| ATT leave / worksite / sign / J-HRM-06c | **SEAL RETAIN** |
| EMP stamps listed | **SEAL RETAIN** |
| SI / CTR / PAY / LIST-TOTALS / aggregate | **SEAL RETAIN** · GĐ1 no rewrite |
| Module ATT UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |
| Settings-MD-only / closed IsIn4 ceiling | **DENIED** (DTO open + Nest EFF SoT L1) |

---

## 7. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **R-PLT-ATT-CODE-FE-01** | P2 HOLD | FE `AttendanceRecordsTable` rebind Select to Nest EFF + reconcile `early_leave`/`on_leave` (VAL-06 / 01f) — not blocker for L1 slice | **dev-fe** (after QC or parallel) |

No P0/P1 L1 residual.

---

## 8. completion_report

**Closed:** U65 L1 AC pack for ATT attendance-code catalog Option B — **PASS**. Stamp `ATTCODEQA-MSK4T1A5`. Dist/DTO gate: closed `@IsIn(4)` **absent** on Create/Update status; `HRM-ATT-CODE-KEY` live. GET `/attendance/attendance-codes/effective` 200 (empty→admin N+1). Admin POST `wfh_qa_msk4t1a5` **201** · F5 EFF has key. Invent POST+PATCH → **400** `HRM-ATT-CODE-KEY` (≠ leave/EMP). Open slug persist **201** + `status_label`/`symbol=WF`. Soft-retire → EFF hidden. Leave/worksite routes 200 · aggregate sealed spot · honesty false · seals RETAIN · C-SLICE · zero-seed.

**Residual:** R-PLT-ATT-CODE-FE-01 P2 HOLD (FE picker). `attendance_uat_ready=false` until program promotes module ATT separately.

**Forbidden claims:** module ATT UAT · Phase1 DONE · flip ready · reopen leave/worksite/EMP/SI/CTR · aggregate rewrite PASS · UF 🟢 from L1.

---

## 9. Handoff

```yaml
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qa-01.md
machine_json: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-code-catalog-qa-01.json
stamp: ATTCODEQA-MSK4T1A5
overall: PASS
next_owner: qc
honesty:
  attendance_uat_ready: false
  payroll_e2e_ready: false
  C-SLICE: true
  U65: zero-seed
next_dispatch_prompt: |
  work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-01
  from_role: pm
  to_role: qc
  lane: governance
  priority: P1
  parent: ATT-CODE-CATALOG-QA-01 PASS_TO_PM stamp ATTCODEQA-MSK4T1A5
  entry_criteria: |
    - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qa-01.md
    - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-be-01.md
    - U65 zero-seed · attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE
    - RETAIN: leave/worksite/EMP/SI/CTR · aggregate counting sealed
  task: |
    Narrow QC GWC on ATT-CODE-CATALOG L1 slice only:
    1) Confirm invent → HRM-ATT-CODE-KEY (POST+PATCH) when EFF>0
    2) Confirm DTO open (no IsIn4) + open slug persist + status_label/symbol
    3) Confirm admin N+1 + soft-retire EFF hide
    4) DENY flip attendance_uat / payroll_e2e · DENY reopen seals · DENY aggregate rewrite · DENY module ATT UAT
    5) Note FE HOLD R-PLT-ATT-CODE-FE-01 — GWC ≠ module GO
  exit_criteria: GWC or NO-GO with residual owners · PASS_TO_PM · evidence qc-01.md
  cấm: seed · flip ready · reopen seals · claim ATT UAT · Phase1 DONE
```

---

## 10. Self-check

- [x] Evidence file exists on disk
- [x] Network stamps + PASS/FAIL table
- [x] completion_report · next_owner **qc** · next_dispatch_prompt · ack_status **PASS_TO_PM**
- [x] No seed · no attendance_uat flip · no aggregate rewrite claim · C-SLICE honored
