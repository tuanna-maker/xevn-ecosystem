# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` |
| **Stamp** | `ATTOTQA-MSK8VETU` |
| **U65** | zero-seed · L1 probe ≠ 🟢 UF · no `pnpm seed:*` · admin CREATE N+1 via Nest Network then invent |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · **formula LIVE = false** · CTR **`CTRTPLQA-MSK7U4CG`** · ATT LVRULE **`ATTLVRULEQA2-MSK79F2F`** · CODE **`ATTCODEQA-MSK4T1A5`** · leave **`ATTLEAVEQA-MSJ7CPJH`** · WS **`ATTWSQA-MSJC3IN9`** · SHIFT **`ATTSHIFTQA-MSK5FXP3`** · FE LVRULE 01g **HOLD** · **`C-SLICE-≠-MODULE`** · DENY module ATT/PAY UAT / flip ready |
| **ack_status** | **PASS_WITH_OBS** |
| **overall** | **PASS_WITH_OBS** (L1 core PASS · FE Nest rebind residual) |
| **network_key_hit** | **true** · invent → **400 `HRM-ATT-OT-TYPE-KEY`** |
| **change_mode** | ADD verify · no `apps/**` invent · no seed · no ready flip · **FORBIDDEN** reopen CTR/ATT seals · **FORBIDDEN** claim formula LIVE |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** (qc:dev-stack ✓; Windows UV_HANDLE_CLOSING ignore) |
| Dist gate | `HRM-ATT-OT-TYPE-KEY` in dist+src · `ot-types*` routes live — **not stale** |
| Unauth EFF | **401** `HRM-AUTH-001` (≠ 404) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.json` |

**spec_ref:** BA-01 **AC-PLT-ATT-OT-01 / 01b / 01c / 01d / 01e / 01f / 01H** · VAL-ATT-OT-CNS-* · SA Option **B** · BE-01 READY

**Seed:** none.

---

## 2. L1 execution path (U65)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Dist/src KEY + FE hardcode spot | dist KEY OK · FE `OvertimeRequestTab` still weekday\|weekend\|holiday |
| 1 | Unauth GET ot-types/effective | **401** `HRM-AUTH-001` (≠ 404) |
| 2 | Login `ceo@xe.vn` | portal proxy **201** |
| 3 | GET ot-types + /effective baseline | **200** `HRM-ATT-OT-200` total=**0** (empty soft OK · no seed) |
| 4 | Admin CREATE N+1 `comp_time_msk8vetu` (+ night) | **POST** → **201** `HRM-ATT-OT-201` id=`2ac82802-…` · nameVi + defaultCoeff=**1.75** |
| 5 | F5 GET list + effective | **200** total=2 · hasOpenKey=true · display-ready |
| 6 | Invent POST overtime-requests `overtime_type` ∉ Nest | **400** `HRM-ATT-OT-TYPE-KEY` · **no persist** |
| 7 | Valid Nest code POST overtime-requests (omit coeff) | **201** `HRM-OT-201` coeff prefill **1.75** (≠ formula LIVE) |
| 8 | POST ot-types/:id/retire | **201** `HRM-ATT-OT-200` status=`inactive` |
| 9 | GET default vs `include_inactive=true` + EFF | default hides · include shows · EFF excludes |
| 10 | U19 get-by-id fake UUID | **404** `HRM-ATT-OT-404` (≠ invent KEY) |
| 11 | Seal routes spot | leave/WS/code/shift effective **200** |
| 12 | Soft-retire B + DELETE valid OT | cleanup **200/201** |
| 13 | Honesty | ready=false · formula_LIVE=false · seals RETAIN · C-SLICE · DENY ATT UAT |

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **dist_key_gate** | `HRM-ATT-OT-TYPE-KEY` live | dist+src present · ot-types routes | 🟢 |
| **L0** | stack 200 | 200 | 🟢 |
| **unauth effective** | 401/403 ≠ 404 | 401 | 🟢 |
| **AC-PLT-ATT-OT-01d** | Admin CREATE N+1 open · 201 · F5 list/EFF · nameVi/defaultCoeff | POST **201** · F5 total=2 has `comp_time_msk8vetu` · nameVi · coeff=1.75 | 🟢 |
| **AC-PLT-ATT-OT-01b** / **VAL-CNS-01** | invent → 4xx `HRM-ATT-OT-TYPE-KEY` · no persist | POST **400** KEY · list no invent row · `network_key_hit=true` | 🟢 |
| **AC-PLT-ATT-OT-01_L1_VALID** | Nest code → 2xx | **201** `HRM-OT-201` coeff=1.75 prefill | 🟢 |
| **AC-PLT-ATT-OT-01e** | retire → inactive; EFF excludes; include_inactive shows | status=inactive · hiddenDefault · retiredVisible · effExcludes | 🟢 |
| **AC-PLT-ATT-OT-01c** | EFF=0 invent soft-skip · no seed | baseline EFF=**0** before admin (empty soft OK); invent-skip-at-empty **not** re-probed after N+1 (no wipe) · jest CNS-05 cite | 🟡 NOTE_BLOCKED |
| **AC-PLT-ATT-OT-01f** | defaultCoeff display only · FORBIDDEN formula LIVE | list/EFF coeff=1.75 · `formula_LIVE_claimed=false` · `payroll_e2e_ready=false` | 🟢 |
| **AC-PLT-ATT-OT-01** FE bind | Nest picker when EFF>0 | FE hardcode-3 sole · no GET ot-types | 🟡 PASS_WITH_OBS |
| **U19_OT_404** | get-by-id miss → OT-404 ≠ KEY | **404** `HRM-ATT-OT-404` | 🟢 |
| **AC-PLT-ATT-OT-01H** | Honesty / seals | false · RETAIN CTR/ATT L1/FE LVRULE · C-SLICE · U65 · DENY formula | 🟢 |

**OBS (01c):** Live baseline EFF total=0 before admin N+1 (empty soft OK · no seed). Invent-skip-at-empty not re-forced after N+1 (would need wipe-all — **FORBIDDEN** U65). BE jest VAL-ATT-OT-CNS-05 covers empty soft-skip; live invent-only proven at EFF>0 (01b).

**FE:** **R-PLT-ATT-OT-FE-01** P2 — L1 PASS ≠ UF 🟢 / module ATT UAT. OvertimeRequestTab still closed-3 + `getCoefficient` hardcode while Nest EFF>0. **Do not FAIL whole BE** for FE gap.

**FE admin:** i18n strings only (`en.json`/`vi.json`) — **no** Nest admin panel UI this wave. Admin L1 via authenticated Network (dispatch-allowed). Residual **R-PLT-ATT-OT-FE-ADMIN** P2 OBS (Settings REF · do not invent FE this seat).

---

## 4. Key network stamps

```text
GET  /api/hrm                                                              → 200  HRM-HEALTH-200
GET  /api/hrm/attendance/ot-types/effective (unauth)                       → 401  HRM-AUTH-001
GET  /api/hrm/attendance/ot-types?company_id=main                          → 200  HRM-ATT-OT-200 (baseline 0)
GET  /api/hrm/attendance/ot-types/effective?company_id=main                → 200  HRM-ATT-OT-200 (baseline 0)
POST /api/hrm/attendance/ot-types  code=comp_time_msk8vetu                 → 201  HRM-ATT-OT-201 nameVi+defaultCoeff=1.75
POST /api/hrm/attendance/ot-types  code=night_qa_msk8vetu                  → 201  HRM-ATT-OT-201
GET  /api/hrm/attendance/ot-types (F5)                                     → 200  total=2 hasOpen display-ready
GET  /api/hrm/attendance/ot-types/effective (F5)                           → 200  total=2
POST /api/hrm/attendance/overtime-requests invent zz_invent_att_ot_*       → 400  HRM-ATT-OT-TYPE-KEY
GET  /api/hrm/attendance/overtime-requests                                 → 200  inventPersisted=false
POST /api/hrm/attendance/overtime-requests Nest code (omit coeff)          → 201  HRM-OT-201 coeff=1.75
POST /api/hrm/attendance/ot-types/{id}/retire                              → 201  HRM-ATT-OT-200 status=inactive
GET  /api/hrm/attendance/ot-types (default)                                → 200  retired hidden
GET  /api/hrm/attendance/ot-types?include_inactive=true                    → 200  retired visible
GET  /api/hrm/attendance/ot-types/effective                                → 200  retired excluded
GET  /api/hrm/attendance/ot-types/{fakeUuid}                               → 404  HRM-ATT-OT-404
GET  /api/hrm/attendance/leave-types/effective                             → 200  (seal)
GET  /api/hrm/attendance/work-sites                                        → 200  (seal)
GET  /api/hrm/attendance/attendance-codes/effective                        → 200  (seal)
GET  /api/hrm/attendance/work-shifts/effective                             → 200  (seal)
```

**OT types under test:** `2ac82802-5394-4dc0-99c4-9815e8997d0c` (`comp_time_msk8vetu`) · `063b0c92-83cc-44bd-b6f7-c6335a55e202` (`night_qa_msk8vetu`) — both soft-retired after checks.  
**Employee:** `0500220b-f289-40df-b07e-86316285439b` · persist company `holding` under group CEO scope.

**KEY taxonomy:** `HRM-ATT-OT-TYPE-KEY` only — ≠ `HRM-ATT-SHIFT-KEY` · ≠ LVRULE/LEAVE/CTR KEY · ≠ `HRM-ATT-OT-404` invent synonym.

**Formula HOLD:** defaultCoeff on catalog + optional TXN prefill when coefficient omitted — evidence **FORBIDDEN** claim payroll formula LIVE / flip `payroll_e2e_ready`.

---

## 5. L2 / L2.5

| Surface | Status |
|---------|--------|
| Browser FE admin CREATE N+1 | **ABSENT panel** — L1 admin API 01d PASS via authenticated Network; residual R-PLT-ATT-OT-FE-ADMIN |
| `OvertimeRequestTab` → Nest EFF | **HOLD** R-PLT-ATT-OT-FE-01 (VAL-CNS-06) — hardcode weekday\|weekend\|holiday |
| J-HRM-ATT-OT-* | Proposed BA §6.4 — **not claimed** this L1 stamp |
| UF-HRM / J-HRM-06* / CTR / ATT L1 | **SEAL RETAIN** — **cấm** reopen / invent FE LVRULE / claim ATT UAT |

**L1 PASS ≠ UF 🟢 · ≠ module ATT/PAY UAT · C-SLICE-≠-MODULE.**

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** — **DENIED** flip |
| **Formula LIVE** | **false** — defaultCoeff ≠ engine GO |
| CTR KEY/clause `CTRTPLQA-MSK7U4CG` | **SEAL RETAIN** |
| ATT leave-balance / FE LVRULE 01g | **HOLD RETAIN** — **DENY invent FE** |
| ATT-CODE / WS / SHIFT / leave L1 | **SEAL RETAIN** |
| EMP / SI / PAY / DEC / MergeToken / aggregate | **SEAL RETAIN** |
| Module ATT/PAY UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed / ensureDefault | **none** |

---

## 7. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **R-PLT-ATT-OT-FE-01** | P2 HOLD | FE `OvertimeRequestTab` rebind Select/filter/badge/coeff to Nest `ot-types`/`effective` when active>0; hardcode weekday\|weekend\|holiday + `getCoefficient` bootstrap **only** when EFF=0 (VAL-CNS-06 · AC-01) | **dev-fe** (after QC or parallel) |
| **R-PLT-ATT-OT-FE-ADMIN** | P2 OBS | FE admin «Loại tăng ca» panel ABSENT (i18n only); L1 admin via Network OK this wave — Settings REF | **dev-fe** (optional later) |

No P0/P1 L1 residual. BE invent KEY + admin N+1 + soft-retire **PASS**.

---

## 8. completion_report

**Closed:** U65 L1 AC pack for Nest **`att_ot_type`** Option B — **PASS_WITH_OBS**. Stamp `ATTOTQA-MSK8VETU`. Dist/src `HRM-ATT-OT-TYPE-KEY` live. Baseline EFF empty=0 (no seed) → admin POST `comp_time_msk8vetu` **201** · F5 EFF/list has key + display-ready nameVi/defaultCoeff. Invent overtime_request → **400** `HRM-ATT-OT-TYPE-KEY` · no persist · `network_key_hit=true`. Valid Nest code → **201** coeff prefill 1.75 (**≠** formula LIVE). Soft-retire → status=`inactive` · default list hides · EFF excludes · `include_inactive=true` shows. U19 fake id → **404** `HRM-ATT-OT-404`. Leave/WS/code/shift seals 200. Honesty false · C-SLICE · zero-seed. **01c** NOTE_BLOCKED (no wipe after N+1; empty baseline documented; jest CNS-05 cite).

**Residual:** R-PLT-ATT-OT-FE-01 P2 (FE OvertimeRequestTab Nest rebind) · R-PLT-ATT-OT-FE-ADMIN P2 OBS. Flags stay **false**.

**Forbidden claims:** module ATT/PAY UAT · Phase1 DONE · flip ready · formula LIVE · reopen CTR/ATT seals · invent FE LVRULE · UF 🟢 from L1.

---

## 9. Handoff

```yaml
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-01
from_role: qa
to_role: pm
ack_status: PASS_WITH_OBS
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.md
machine_json: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.json
stamp: ATTOTQA-MSK8VETU
overall: PASS_WITH_OBS
network_key_hit: true
next_owner: qc
honesty:
  attendance_uat_ready: false
  payroll_e2e_ready: false
  contracts_printable_ready: false
  formula_LIVE: false
  C-SLICE: true
  U65: zero-seed
next_dispatch_prompt: |
  work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QC-01
  from_role: pm
  to_role: qc
  lane: governance
  priority: P1
  program: PO-HRM-CONTINUOUS-W8-20260807
  parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-01 PASS_WITH_OBS
  entry_criteria: |
    QA evidence docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.md
    stamp ATTOTQA-MSK8VETU · network_key_hit=true · invent 400 HRM-ATT-OT-TYPE-KEY
    L1 admin N+1 201 + soft-retire + display-ready defaultCoeff
    honesty flags false · C-SLICE-≠-MODULE · seals RETAIN
  exit_criteria: |
    Narrow GWC L1 slice only — NOT module ATT/PAY UAT
    Conditions: R-PLT-ATT-OT-FE-01 (Nest rebind OvertimeRequestTab) · R-PLT-ATT-OT-FE-ADMIN OBS
    DENY flip *_ready · DENY formula LIVE · DENY reopen CTR/ATT seals · DENY invent FE LVRULE
  evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qc-01.md
```

---

## 10. ack_status

**PASS_WITH_OBS** → **next_owner: qc** (narrow GWC L1 · Condition FE residuals)
