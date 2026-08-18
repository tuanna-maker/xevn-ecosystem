# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` |
| **Stamp** | `ATTSHIFTQA-MSK5FXP3` |
| **U65** | zero-seed · L1 probe ≠ 🟢 UF · no `pnpm seed:*` · admin CREATE N+1 via Nest then invent |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT-CODE **`ATTCODEQA-MSK4T1A5`** · leave **`ATTLEAVEQA-MSJ7CPJH`** · worksite **`ATTWSQA-MSJC3IN9`** · EMP/SI/CTR · aggregate GĐ1 **SEAL RETAIN** · R-PLT-ATT-CODE-FE-01 **HOLD** · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT / flip ready |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 core · FE CNS-02 HOLD) |
| **change_mode** | ADD verify · no `apps/**` invent · no seed · no ready flip · **FORBIDDEN** reopen ATT-CODE/leave/worksite · **FORBIDDEN** invent FE ATT-CODE HOLD |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Dist gate | `HRM-ATT-SHIFT-KEY` in dist+src catalog · `work-shifts/effective` · `include_inactive` — **not stale** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-01.json` |

**spec_ref:** BA-01 AC-PLT-ATT-SHIFT-01* · VAL-ATT-SHIFT-CNS-* · SA Option **B** · ADR D1 · BE-01 READY

**Seed:** none.

---

## 2. L1 execution path (U65)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Dist/src KEY + FE hardcode spot | dist KEY OK · FE `ShiftChangeRequestTab` still 5-id |
| 1 | Unauth GET work-shifts/effective | **401** `HRM-AUTH-001` (≠ 404) |
| 2 | Login `ceo@xe.vn` | portal proxy **201** |
| 3 | GET work-shifts + /effective baseline | **200** `HRM-WS-200` total=**0** (empty soft OK · no seed) |
| 4 | Admin CREATE N+1 `qa_shift_msk5fxp3` (+ B) | **POST** → **201** `HRM-WS-201` id=`6d275971-…` |
| 5 | F5 GET list + effective | **200** total=2 · hasOpenKey=true |
| 6 | Invent POST shift-change `current_shift`/`requested_shift` ∉ Nest | **400** `HRM-ATT-SHIFT-KEY` · **no persist** |
| 7 | Valid Nest codes POST shift-change | **201** `HRM-SC-201` (L1 wire accept) |
| 8 | DELETE work-shift A (soft-retire) | **200** `HRM-WS-200` status=`inactive` · hard_deleted=false |
| 9 | GET default vs `include_inactive=true` | default hides retired · include shows inactive |
| 10 | U19 get-by-id fake UUID | **404** `HRM-WS-404` (≠ invent KEY) |
| 11 | Seal routes spot | leave/WS/code effective **200** |
| 12 | Soft-retire B + cleanup valid SC | **200** (no litter) |
| 13 | Honesty | ready=false · seals RETAIN · C-SLICE · DENY ATT UAT |

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **dist_key_gate** | `HRM-ATT-SHIFT-KEY` live | dist+src present · effective route | 🟢 |
| **L0** | stack 200 | 200 | 🟢 |
| **unauth effective** | 401/403 ≠ 404 | 401 | 🟢 |
| **AC-PLT-ATT-SHIFT-01d** | Admin CREATE N+1 · 201 · F5 list/EFF | POST **201** · F5 total=2 has `qa_shift_msk5fxp3` | 🟢 |
| **AC-PLT-ATT-SHIFT-01b** / **VAL-CNS-01** | invent → 4xx `HRM-ATT-SHIFT-KEY` · no persist | POST **400** KEY · list no invent row | 🟢 |
| **AC-PLT-ATT-SHIFT-01_L1_VALID** | Nest codes → 2xx | **201** `HRM-SC-201` | 🟢 |
| **VAL-ATT-SHIFT-CNS-03b** | default active-only; include_inactive shows retired | hiddenDefault · retiredVisible | 🟢 |
| **AC-PLT-ATT-SHIFT-01e** / **VAL-CNS-04** | DELETE soft-retire · default hides | status=inactive · hard=false · hidden | 🟢 |
| **AC-PLT-ATT-SHIFT-01c** | active=0 invent skip · no seed | baseline EFF=0 observed; invent-at-empty **not** forced wipe · jest CNS-05 cite | 🟡 NOTE_BLOCKED |
| **VAL-ATT-SHIFT-CNS-03 U19 spot** | get-by-id OOS → WS-404 | **404** `HRM-WS-404` | 🟢 |
| **AC-PLT-ATT-SHIFT-01** FE picker | Nest EFF picker when FE READY | FE hardcode 5-id residual | 🟡 HOLD |
| **VAL-ATT-SHIFT-CNS-02** | picker = Nest when active>0 | source: morning\|afternoon\|night\|office\|flexible | 🟡 HOLD |
| **AC-PLT-ATT-SHIFT-01H** | Honesty / seals | false · RETAIN ATT-CODE/leave/WS/EMP/SI/CTR/agg · C-SLICE · U65 | 🟢 |

**OBS (01c):** Live baseline EFF total=0 before admin N+1 (empty soft OK). Invent-skip-at-empty not re-probed after N+1 (would need wipe-all — **FORBIDDEN** U65). BE jest CNS-05 covers empty skip.

**FE:** R-PLT-ATT-SHIFT-CNS-02 HOLD — L1 PASS ≠ UF 🟢 / module ATT UAT. Browser UF Ca admin not claimed as UF 🟢 this seat (L1 admin API proves 01d).

---

## 4. Key network stamps

```text
GET  /api/hrm                                                              → 200  HRM-HEALTH-200
GET  /api/hrm/attendance/work-shifts/effective (unauth)                    → 401  HRM-AUTH-001
GET  /api/hrm/attendance/work-shifts?company_id=main                       → 200  HRM-WS-200 (baseline 0)
GET  /api/hrm/attendance/work-shifts/effective?company_id=main             → 200  HRM-WS-200 (baseline 0)
POST /api/hrm/attendance/work-shifts  code=qa_shift_msk5fxp3               → 201  HRM-WS-201
POST /api/hrm/attendance/work-shifts  code=qa_shift_b_msk5fxp3             → 201  HRM-WS-201
GET  /api/hrm/attendance/work-shifts (F5)                                  → 200  total=2 hasOpen
GET  /api/hrm/attendance/work-shifts/effective (F5)                        → 200  total=2
POST /api/hrm/attendance/shift-change-requests invent zz_invent_att_shift_*→ 400  HRM-ATT-SHIFT-KEY
GET  /api/hrm/attendance/shift-change-requests                             → 200  inventPersisted=false
POST /api/hrm/attendance/shift-change-requests Nest keys                   → 201  HRM-SC-201
DELETE /api/hrm/attendance/work-shifts/{idA}                               → 200  HRM-WS-200 status=inactive
GET  /api/hrm/attendance/work-shifts (default)                             → 200  retired hidden
GET  /api/hrm/attendance/work-shifts?include_inactive=true                 → 200  retired visible
GET  /api/hrm/attendance/work-shifts/{fakeUuid}                            → 404  HRM-WS-404
GET  /api/hrm/attendance/leave-types/effective                             → 200  (seal)
GET  /api/hrm/attendance/work-sites                                        → 200  (seal)
GET  /api/hrm/attendance/attendance-codes/effective                        → 200  (seal)
```

**Shifts under test:** `6d275971-243f-4fc0-9cd9-658829fd0902` (`qa_shift_msk5fxp3`) · `1d932292-952c-483c-82f6-7fd3ba5a5427` (`qa_shift_b_msk5fxp3`) — both soft-retired after checks.  
**Employee:** `0500220b-f289-40df-b07e-86316285439b` · persist company `holding` under group CEO scope.

**KEY taxonomy:** `HRM-ATT-SHIFT-KEY` only — ≠ leave KEY · ≠ ATT-CODE KEY · ≠ GEO · ≠ WS-404 invent synonym.

---

## 5. L2 / L2.5

| Surface | Status |
|---------|--------|
| Browser Ca tab admin CREATE N+1 | **not claimed UF 🟢** — L1 admin API 01d PASS; optional FE admin already Nest-bound (`useWorkShifts`) |
| `ShiftChangeRequestTab` → Nest EFF | **HOLD** R-PLT-ATT-SHIFT-CNS-02 (VAL-CNS-02) |
| J-HRM-ATT-SHIFT-CAT-* | Proposed BA §6.4 — **not claimed** this L1 stamp |
| UF-HRM / J-HRM-06* / ATT-CODE FE | **SEAL RETAIN** — **cấm** reopen / invent FE ATT-CODE HOLD / claim ATT UAT |

**L1 PASS ≠ UF 🟢 · ≠ module ATT UAT · C-SLICE-≠-MODULE.**

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| ATT-CODE `ATTCODEQA-MSK4T1A5` · R-PLT-ATT-CODE-FE-01 HOLD | **SEAL RETAIN** |
| ATT leave `ATTLEAVEQA-MSJ7CPJH` · worksite `ATTWSQA-MSJC3IN9` | **SEAL RETAIN** |
| EMP / SI / CTR / PAY / LIST-TOTALS / aggregate | **SEAL RETAIN** · GĐ1 no rewrite |
| Module ATT UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed / ensureDefault | **none** |

---

## 7. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **R-PLT-ATT-SHIFT-CNS-02** | P2 HOLD | FE `ShiftChangeRequestTab` rebind options to Nest `work-shifts`/`effective` when active>0; hardcode 5-id bootstrap **only** when empty (VAL-CNS-02 · AC-01) | **dev-fe** (after QC or parallel) |

No P0/P1 L1 residual.

---

## 8. completion_report

**Closed:** U65 L1 AC pack for ATT **work_shifts** catalog Option B deepen — **PASS**. Stamp `ATTSHIFTQA-MSK5FXP3`. Dist/src `HRM-ATT-SHIFT-KEY` live. Baseline EFF empty=0 (no seed) → admin POST `qa_shift_msk5fxp3` **201** · F5 EFF/list has key. Invent shift-change → **400** `HRM-ATT-SHIFT-KEY` · no persist. Valid Nest keys → **201**. DELETE soft-retire → status=`inactive` · default list hides · `include_inactive=true` shows. U19 fake id → **404** `HRM-WS-404`. Leave/WS/code seals 200. Honesty false · C-SLICE · zero-seed. **01c** NOTE_BLOCKED (no wipe after N+1; empty baseline documented; jest CNS-05 cite).

**Residual:** R-PLT-ATT-SHIFT-CNS-02 P2 HOLD (FE ShiftChange Nest rebind). `attendance_uat_ready=false` until program promotes module ATT separately.

**Forbidden claims:** module ATT UAT · Phase1 DONE · flip ready · reopen ATT-CODE/leave/worksite · invent FE ATT-CODE HOLD · UF 🟢 from L1.

---

## 9. Handoff

```yaml
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qa-01.md
machine_json: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-01.json
stamp: ATTSHIFTQA-MSK5FXP3
overall: PASS
next_owner: qc
honesty:
  attendance_uat_ready: false
  payroll_e2e_ready: false
  C-SLICE: true
  U65: zero-seed
next_dispatch_prompt: |
  work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QC-01
  from_role: pm
  to_role: qc
  lane: governance
  priority: P1
  parent: ATT-SHIFT-CATALOG-QA-01 PASS_TO_PM stamp ATTSHIFTQA-MSK5FXP3
  entry_criteria: |
    - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qa-01.md
    - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-be-01.md
    - U65 zero-seed · attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE
    - RETAIN: ATTCODEQA-MSK4T1A5 · ATTLEAVEQA-MSJ7CPJH · ATTWSQA-MSJC3IN9 · EMP/SI/CTR · aggregate · R-PLT-ATT-CODE-FE-01 HOLD
  task: |
    Narrow QC GWC on ATT-SHIFT-CATALOG L1 slice only:
    1) Confirm invent → HRM-ATT-SHIFT-KEY when Nest active>0 · no persist
    2) Confirm admin CREATE N+1 + DELETE soft-retire status=inactive + default list hide + include_inactive
    3) Confirm KEY taxonomy ≠ leave/code/GEO · U19 WS-404 spot
    4) DENY flip attendance_uat / payroll_e2e · DENY reopen seals · DENY module ATT UAT
    5) Note FE HOLD R-PLT-ATT-SHIFT-CNS-02 — Condition for next_owner=dev-fe ShiftChangeRequestTab Nest rebind — GWC ≠ module GO
  exit_criteria: GWC or NO-GO with residual owners · PASS_TO_PM · evidence qc-01.md
  residual_after_gwc: |
    work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01
    to_role: dev-fe
    task: VAL-ATT-SHIFT-CNS-02 — rebind ShiftChangeRequestTab to Nest work-shifts/effective when active>0; hardcode 5-id only when empty; display-ready name/times; cấm invent ATT-CODE FE HOLD
  cấm: seed · flip ready · reopen seals · claim ATT UAT · Phase1 DONE
```

---

## 10. Self-check

- [x] Evidence file exists on disk
- [x] Network stamps + PASS/FAIL table · stamp `ATTSHIFTQA-MSK5FXP3`
- [x] completion_report · next_owner **qc** · next_dispatch_prompt · ack_status **PASS_TO_PM**
- [x] No seed · no attendance_uat flip · FE CNS-02 HOLD documented · C-SLICE honored
- [x] L1 ≠ UF 🟢 · DENIED module ATT UAT / Phase1
