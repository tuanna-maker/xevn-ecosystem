# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01` **READY_FOR_QA** (R3 / agent c2d895e4) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` · member `du-lich.ceo@xe.vn` (U19) |
| **Stamp** | `ATTCOMPQA-MSKARXQU` |
| **KEY LOCKED** | `HRM-ATT-OT-COMP-KEY` · table `att_ot_comp_type` · **orthogonal** to `att_ot_type` / `HRM-ATT-OT-TYPE-KEY` |
| **U65** | zero-seed · L1 probe ≠ 🟢 UF · no `pnpm seed:*` · admin CREATE N+1 via Nest Network then invent |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `contracts_printable_ready=false` · **formula LIVE = false** · OT-TYPE L1 **`ATTOTQA-MSK8VETU`** · OT-TYPE FE-01 **`ATTOTQAFE-MSK9TJDM`** · CTR **`CTRTPLQA-MSK7U4CG`** · ATT LVRULE **`ATTLVRULEQA2-MSK79F2F`** · CODE **`ATTCODEQA-MSK4T1A5`** · leave **`ATTLEAVEQA-MSJ7CPJH`** · WS **`ATTWSQA-MSJC3IN9`** · SHIFT **`ATTSHIFTQA-MSK5FXP3`** · FE LVRULE 01g **HOLD** · FE-ADMIN OT **HOLD** · **`C-SLICE-≠-MODULE`** · DENY module ATT/PAY UAT / flip ready / reopen OT-TYPE seats |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_OBS** (L1 core PASS · FE Nest compensation picker residual) |
| **network_key_hit** | **true** · invent → **400 `HRM-ATT-OT-COMP-KEY`** (≠ `HRM-ATT-OT-TYPE-KEY`) |
| **change_mode** | ADD verify · no `apps/**` invent · no seed · no ready flip · **FORBIDDEN** fold into `att_ot_type` · **FORBIDDEN** reopen OT-TYPE L1/FE-01 CLOSED / FE-ADMIN invent · **FORBIDDEN** claim formula LIVE |

---

## 1. spec_read_ack

| Spec | Cite |
|------|------|
| **SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md` Option **B** · L-ATT-OTC-* · F-ATT-CAT-OTC-01/02 + EFF · `HRM-ATT-OT-COMP-KEY` |
| **BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md` **AC-PLT-ATT-COMP-01 / 01b / 01c / 01d / 01e / 01f / 01H** · VAL-ATT-COMP-CNS-* |
| **DATA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md` §2 `att_ot_comp_type` · orthogonality `compensation_type` ⟶ Nest · **FORBIDDEN** fold into `att_ot_type` |
| **BE** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-be-01.md` READY_FOR_QA R3 |

**Seed:** none.

---

## 2. Environment / disk / jest

| Check | Result |
|-------|--------|
| **Disk gate (NFD `.git` tree)** | `constants` **2948** · `service` **19751** · `spec` **10390** · `dto` **2172** — all Length>0 · paths under `apps/api/hrm-api/src/attendance` |
| **KEY in src** | `HRM-ATT-OT-COMP-KEY` + routes `ot-comp-types*` present |
| **Jest** | `npx jest` att-ot-comp-type + att-ot-type + attendance-requests + attendance.controller → **4 suites / 56 passed** (cwd `apps/api/hrm-api`) |
| **L0** | hrm `:28001` **`GET /api/hrm` → 200 `HRM-HEALTH-200`** · xbos `:28002` **200 `XBOS-HEALTH-200`** · portal `:5173` up |
| **Unauth EFF** | **401** `HRM-AUTH-001` (≠ 404) |
| **Git HEAD** | `dc930c5` |
| **Runner** | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.json` |

---

## 3. L1 execution path (U65 — Nest admin API only)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Disk gate Length>0 | PASS |
| 1 | Unauth GET ot-comp-types/effective | **401** `HRM-AUTH-001` |
| 2 | Login `ceo@xe.vn` | portal proxy **201** |
| 3 | GET ot-comp-types + /effective baseline | **200** `HRM-ATT-OTC-200` total=**0** (empty soft OK · no seed) |
| 4 | Admin CREATE N+1 `banked_hours_mskarxqu` (+ mixed_pay) | **POST** → **201** `HRM-ATT-OTC-201` id=`966750ca-…` · nameVi display-ready |
| 5 | F5 GET list + effective | **200** total=2 · hasOpenKey=true · nameVi on EFF |
| 6 | Invent POST overtime-requests `compensation_type` ∉ Nest | **400** `HRM-ATT-OT-COMP-KEY` · **wrongKey=false** · **no persist** |
| 7 | Valid Nest compensation_type POST (peer ot-type reuse `qc_spot_ot_msk8`) | **201** `HRM-OT-201` compensation_type=`banked_hours_mskarxqu` |
| 8 | POST ot-comp-types/:id/retire | **201** `HRM-ATT-OTC-200` status=`inactive` |
| 9 | GET default vs `include_inactive=true` + EFF | default hides · include shows · EFF excludes |
| 10 | U19 get-by-id fake UUID | **404** `HRM-ATT-OTC-404` (≠ invent KEY) |
| 11 | U19 member `du-lich.ceo@xe.vn` get holding row | **409** `SCOPE_CONTEXT_MISMATCH` (AC allows 404/409) |
| 12 | Seal routes spot | ot-types / leave / WS / code / shift effective **200** — OT-TYPE seal **RETAIN** |
| 13 | Cleanup retire B + DELETE valid OT | **201** / **200** |
| 14 | Honesty | ready=false · formula_LIVE=false · seals RETAIN · C-SLICE · DENY ATT UAT · DENY reopen OT-TYPE |

---

## 4. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **disk_gate** | constants/service/spec/dto Length>0 on NFD tree | 2948 / 19751 / 10390 / 2172 | 🟢 |
| **jest_56** | ~56 pass | **56/56** | 🟢 |
| **L0** | stack 200 | HRM+XBOS 200 | 🟢 |
| **unauth effective** | 401/403 ≠ 404 | 401 | 🟢 |
| **AC-PLT-ATT-COMP-01d** | Admin CREATE N+1 open · 201 · F5 list/EFF · name_vi | POST **201** · F5 total=2 has `banked_hours_mskarxqu` · nameVi | 🟢 |
| **AC-PLT-ATT-COMP-01b** / **VAL-CNS-01** | invent → 4xx `HRM-ATT-OT-COMP-KEY` · no persist | POST **400** KEY · inventPersisted=false · `network_key_hit=true` | 🟢 |
| **VAL-ATT-COMP-CNS-08** | COMP KEY ≠ OT-TYPE-KEY | code=`HRM-ATT-OT-COMP-KEY` · wrongKey=false | 🟢 |
| **AC-PLT-ATT-COMP-01_L1_VALID** | Nest compensation_type → 2xx | **201** `HRM-OT-201` | 🟢 |
| **AC-PLT-ATT-COMP-01e** | retire → inactive; EFF excludes; include_inactive shows | hiddenDefault · retiredVisible · effExcludes | 🟢 |
| **AC-PLT-ATT-COMP-01c** | EFF=0 invent soft-skip · no seed | baseline EFF=**0** before admin; invent-skip-at-empty **not** re-probed after N+1 (no wipe) · jest cite | 🟡 NOTE_BLOCKED |
| **AC-PLT-ATT-COMP-01f** | name_vi display · FORBIDDEN formula LIVE | nameVi on list/EFF · `formula_LIVE_claimed=false` · `payroll_e2e_ready=false` | 🟢 |
| **AC-PLT-ATT-COMP-01** FE bind | Nest picker when EFF>0 | FE hardcode salary\|compensatory_leave · no GET ot-comp-types | 🟡 PASS_WITH_OBS |
| **U19_OTC_404** | get-by-id miss → OTC-404 ≠ KEY | **404** `HRM-ATT-OTC-404` | 🟢 |
| **U19_member** | member 404/409 | **409** `SCOPE_CONTEXT_MISMATCH` | 🟢 |
| **AC-PLT-ATT-COMP-01H** | Honesty / seals / no fold / no reopen OT-TYPE | false · RETAIN · C-SLICE · U65 · DENY formula · DENY reopen | 🟢 |

**OBS (01c):** Live baseline EFF total=0 before admin N+1 (empty soft OK · no seed). Invent-skip-at-empty not re-forced after N+1 (would need wipe-all — **FORBIDDEN** U65). BE jest covers empty soft-skip; live invent KEY proven at EFF>0 (01b).

**FE:** **R-PLT-ATT-OTC-03** P2 — L1 PASS ≠ UF 🟢 / module ATT UAT. `OvertimeRequestTab` still hardcode `salary`\|`compensatory_leave` while Nest EFF>0 possible. **Do not FAIL whole BE L1** for FE gap. **DENY invent FE admin panel** this seat.

**Peer OT-TYPE:** reused existing `qc_spot_ot_msk8` for valid OT create — **no reopen** L1 `ATTOTQA-MSK8VETU` / FE-01 `ATTOTQAFE-MSK9TJDM` / FE-ADMIN invent.

---

## 5. Key network stamps

```text
GET  /api/hrm                                                              → 200  HRM-HEALTH-200
GET  /api/hrm/attendance/ot-comp-types/effective (unauth)                  → 401  HRM-AUTH-001
GET  /api/hrm/attendance/ot-comp-types?company_id=main                     → 200  HRM-ATT-OTC-200 (baseline 0)
GET  /api/hrm/attendance/ot-comp-types/effective?company_id=main           → 200  HRM-ATT-OTC-200 (baseline 0)
POST /api/hrm/attendance/ot-comp-types  code=banked_hours_mskarxqu         → 201  HRM-ATT-OTC-201 nameVi
POST /api/hrm/attendance/ot-comp-types  code=mixed_pay_mskarxqu            → 201  HRM-ATT-OTC-201
GET  /api/hrm/attendance/ot-comp-types (F5)                                → 200  total=2 hasOpen display-ready
GET  /api/hrm/attendance/ot-comp-types/effective (F5)                      → 200  total=2
POST /api/hrm/attendance/overtime-requests invent zz_invent_att_otc_*      → 400  HRM-ATT-OT-COMP-KEY
GET  /api/hrm/attendance/overtime-requests                                 → 200  inventPersisted=false
POST /api/hrm/attendance/overtime-requests Nest compensation_type          → 201  HRM-OT-201
POST /api/hrm/attendance/ot-comp-types/{id}/retire                         → 201  HRM-ATT-OTC-200 status=inactive
GET  /api/hrm/attendance/ot-comp-types (default)                           → 200  retired hidden
GET  /api/hrm/attendance/ot-comp-types?include_inactive=true               → 200  retired visible
GET  /api/hrm/attendance/ot-comp-types/effective                           → 200  retired excluded
GET  /api/hrm/attendance/ot-comp-types/{fakeUuid}                          → 404  HRM-ATT-OTC-404
GET  /api/hrm/attendance/ot-comp-types/{holdingId} (member CEO)            → 409  SCOPE_CONTEXT_MISMATCH
GET  /api/hrm/attendance/ot-types/effective                                → 200  (OT-TYPE seal RETAIN)
GET  /api/hrm/attendance/leave-types/effective                             → 200  (seal)
GET  /api/hrm/attendance/work-sites                                        → 200  (seal)
GET  /api/hrm/attendance/attendance-codes/effective                        → 200  (seal)
GET  /api/hrm/attendance/work-shifts/effective                             → 200  (seal)
```

**OTC under test:** `966750ca-4359-4adc-8fab-81a9ef863c96` (`banked_hours_mskarxqu`) · `d8019e56-55b1-414b-b652-ccafc5807623` (`mixed_pay_mskarxqu`) — soft-retired after checks.  
**Employee:** `0500220b-f289-40df-b07e-86316285439b` · persist company `holding` under group CEO scope.  
**Peer OT-TYPE reused:** `qc_spot_ot_msk8` (no reopen closed seats).

**KEY taxonomy:** `HRM-ATT-OT-COMP-KEY` only on invent compensation — ≠ `HRM-ATT-OT-TYPE-KEY` · ≠ SHIFT/LEAVE/LVRULE/CTR KEY · ≠ `HRM-ATT-OTC-404` invent synonym.

**Formula HOLD:** catalog `name_vi` display-ready only — evidence **FORBIDDEN** claim payroll formula LIVE / flip `payroll_e2e_ready`.

---

## 6. L2 / L2.5

| Surface | Status |
|---------|--------|
| Browser FE admin CREATE N+1 | **ABSENT panel** — L1 admin API 01d PASS via authenticated Network; residual FE-ADMIN HOLD · **DENY invent** |
| `OvertimeRequestTab` compensation → Nest EFF | **HOLD** **R-PLT-ATT-OTC-03** (VAL-ATT-COMP-CNS-06) — hardcode salary\|compensatory_leave |
| J-HRM-ATT-COMP-* | Proposed BA — **not claimed** this L1 stamp |
| UF-HRM / J-HRM / OT-TYPE L1/FE-01 | **SEAL RETAIN** — **cấm** reopen / invent FE admin / claim ATT UAT |

**L1 PASS ≠ UF 🟢 · ≠ module ATT/PAY UAT · C-SLICE-≠-MODULE.**

---

## 7. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| **`contracts_printable_ready`** | **`false`** — **DENIED** flip |
| **Formula LIVE** | **false** — catalog ≠ engine GO |
| OT-TYPE L1 `ATTOTQA-MSK8VETU` | **SEAL RETAIN** — **DENY reopen** |
| OT-TYPE FE-01 `ATTOTQAFE-MSK9TJDM` | **SEAL RETAIN** — **DENY reopen** |
| OT-TYPE FE-ADMIN | **HOLD RETAIN** — **DENY invent** |
| CTR KEY/clause `CTRTPLQA-MSK7U4CG` | **SEAL RETAIN** |
| ATT leave-balance / FE LVRULE 01g | **HOLD RETAIN** — **DENY invent FE** |
| ATT-CODE / WS / SHIFT / leave L1 | **SEAL RETAIN** |
| EMP / SI / PAY / DEC / MergeToken / aggregate | **SEAL RETAIN** |
| Fold into `att_ot_type` | **DENIED** |
| Module ATT/PAY UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed / ensureDefault | **none** |

---

## 8. Defect register

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PLT-ATT-OTC-03** | P2 | **dev-fe** | OvertimeRequestTab compensation hardcode salary\|compensatory_leave — rebind Nest GET `/ot-comp-types(/effective)` when EFF>0; L1 PASS ≠ UF 🟢 |
| **01c empty invent-skip** | P3 NOTE | — | ACCEPT NOTE_BLOCKED U65 (no wipe); jest covers soft-skip |

---

## 9. DENY self-check

- ✅ No `pnpm seed:*` / DB fake / invent FE admin panel
- ✅ No fold into `att_ot_type`
- ✅ No flip `attendance_uat_ready` / `payroll_e2e_ready` / formula LIVE
- ✅ No claim module ATT UAT / Phase1 DONE / UF 🟢
- ✅ No reopen OT-TYPE L1 / FE-01 CLOSED / FE-ADMIN invent seats

---

## 10. Handoff

- **completion_report:** Disk gate PASS (4 files Length>0 on NFD tree). Jest **56/56**. L0 HRM+XBOS 200. U65 L1: admin CREATE N+1 `banked_hours_*` **201**+F5; invent compensation_type → **400 `HRM-ATT-OT-COMP-KEY`** (`network_key_hit=true`, ≠ OT-TYPE-KEY, no persist); valid Nest **201**; soft-retire hides from EFF; U19 OTC-404 + member 409; peer OT-TYPE seals RETAIN. AC-01c NOTE_BLOCKED. Residual **R-PLT-ATT-OTC-03** FE picker. Honesty locks held. **overall PASS_WITH_OBS**.
- **residual:** R-PLT-ATT-OTC-03 P2 → `dev-fe` after QC GWC L1 (do not invent FE-ADMIN).
- **next_owner:** **qc**
- **ack_status:** **PASS_TO_PM** (overall **PASS_WITH_OBS** — L1 core PASS · FE OBS)
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.md`
- **machine_json:** `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.json`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-QC-01
from_role: pm
to_role: qc
lane: governance

QA PASS_WITH_OBS stamp ATTCOMPQA-MSKARXQU — L1 Nest att_ot_comp_type.
evidence_qa: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.md
machine: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-01.json
KEY LOCKED LIVE (L1): HRM-ATT-OT-COMP-KEY · network_key_hit=true · orthogonal ≠ HRM-ATT-OT-TYPE-KEY

Gate narrow GWC L1 only:
- Accept disk+jest 56 + L1 admin N+1 + invent KEY 400 + soft-retire + U19
- Condition/OBS: R-PLT-ATT-OTC-03 P2 FE compensation Nest picker (do NOT invent FE-ADMIN)
- 01c NOTE_BLOCKED ACCEPT (U65 no wipe)
- RETAIN OT-TYPE L1 ATTOTQA-MSK8VETU · FE-01 ATTOTQAFE-MSK9TJDM · FE-ADMIN HOLD
- DENY flip attendance_uat_ready / payroll_e2e_ready / formula LIVE
- DENY fold att_ot_type · DENY module ATT UAT / Phase1 / UF 🟢 / reopen OT-TYPE seats
- C-SLICE-≠-MODULE

exit: GO WITH CONDITIONS or GO · PASS_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-01.md
```