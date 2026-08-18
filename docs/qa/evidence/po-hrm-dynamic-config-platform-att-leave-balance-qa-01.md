# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` |
| **Stamp** | `ATTLVRULEQA-MSK6G783` |
| **U65** | zero-seed · L1 probe ≠ 🟢 UF · no `pnpm seed:*` |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · F-ATT-LEAVE-04 engine LIVE **HOLD** · leave-type invent `HRM-LEAVE-TYPE-UNKNOWN` **RETAIN** · ATT-CODE **`ATTCODEQA-MSK4T1A5`** · ATT-WS · ATT-SHIFT **`ATTSHIFTQA-MSK5FXP3`** · FE HOLDs **RETAIN do not invent** · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT / flip ready / claim engine LIVE |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 admin/resolve/retire/orphan/type-RETAIN · invent KEY Network = Condition wire) |
| **change_mode** | ADD verify · no `apps/**` invent · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Dist gate | `HRM-ATT-LVRULE-KEY` + `HRM-ATT-LVRULE-TYPE` in dist constants · `leave-accrual-policies*` routes in dist controller · `assertLeaveAccrualPolicyForConsumer` in dist service — **HTTP consumer wire ABSENT** |
| Jest CNS | `att-leave-accrual-policy.service.spec` — **13/13 PASS** (invent KEY · empty skip · orphan TYPE · admin N+1 · soft-retire · U19) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-01.json` |

**spec_ref:** BA-01 AC-PLT-ATT-LEAVE-BAL-01* · VAL-ATT-LVRULE-CNS-* · SA Option **B** · BE-01 READY

**Seed:** none.

---

## 2. L1 execution path (U65)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Dist/src KEY + controller policies + service assert | KEY OK · routes OK · HTTP assert **not** wired |
| 1 | Unauth GET leave-accrual-policies/effective | **401** `HRM-AUTH-001` (≠ 404) |
| 2 | Login `ceo@xe.vn` | portal proxy **201** |
| 3 | GET leave-types/effective | **200** pick `lvt_01` (bind sealed EFF · **no** leave-type invent) |
| 4 | Baseline list+eff for `lvt_01` | **200** active=**0** (soft empty OK) |
| 5 | Admin CREATE N+1 policy | **POST** → **201** `HRM-ATT-LVRULE-201` id=`b06ac803-…` company=`holding` |
| 6 | F5 list + effective | **200** hasOpen · resolve sees row · display-ready labels |
| 7 | Invent KEY LIVE Network (prefer) | grant/adjust/assert **404** · leave-requests invent policy fields → **400** `HRM-VAL-001` (DTO whitelist) — **no** `HRM-ATT-LVRULE-KEY` on wire → **FAIL_GAP_WIRE** Condition |
| 8 | Soft-retire | **201** `HRM-ATT-LVRULE-200` status=`retired` |
| 9 | Default vs `include_inactive` + resolve | default **hides** · include shows · effective **hides** |
| 10 | Orphan admin type | **400** `HRM-ATT-LVRULE-TYPE` · no persist · ≠ `HRM-LEAVE-TYPE-UNKNOWN` |
| 11 | Type invent RETAIN spot | leave-requests invent type → **400** `HRM-LEAVE-TYPE-UNKNOWN` |
| 12 | U19 spot | fake UUID **404** `HRM-ATT-LVRULE-404` · member OOS slug **4xx** |
| 13 | Seal routes | leave-types / codes / shifts / work-sites **200** |
| 14 | Honesty | ready=false · engine HOLD · seals RETAIN · C-SLICE · DENY ATT UAT |

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **dist_key_gate** | `HRM-ATT-LVRULE-KEY` live | dist+src+service assert present · HTTP wire absent | 🟢 |
| **L0** | stack 200 | 200 | 🟢 |
| **unauth effective** | 401/403 ≠ 404 | 401 | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01d** | Admin CREATE N+1 · 2xx · F5 list/EFF | POST **201** · F5 has `b06ac803-…` · resolve hit | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01b** / **VAL-CNS-01** | invent → Network 4xx `HRM-ATT-LVRULE-KEY` | helper+jest LIVE · **no Network KEY** (grant ABSENT · leave DTO rejects policy_*) | 🟡 Condition `R-PLT-ATT-LVRULE-CNS-WIRE` |
| **AC-PLT-ATT-LEAVE-BAL-01e** / **VAL-CNS-04** | soft-retire hide · include_inactive | retired · hiddenDefault · retiredVisible · effHides | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01c** | empty invent skip · no seed | baseline active=0 observed; invent-at-empty not forced wipe · jest CNS-05 cite | 🟡 NOTE_BLOCKED |
| **VAL-ATT-LVRULE-CNS-09** | orphan type → `HRM-ATT-LVRULE-TYPE` | **400** TYPE · no persist | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01f** | type invent → `HRM-LEAVE-TYPE-UNKNOWN` ≠ LVRULE-KEY | **400** UNKNOWN | 🟢 |
| **VAL-ATT-LVRULE-CNS-03 U19** | get-by-id OOS / fake → 404/409 | fake **404** LVRULE-404 · OOS 4xx | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01g** | panel ⊆ EFF when open | MVP-five still documented in `leave-balance.service` · FE admin/grant HOLD | 🟡 HOLD residual |
| **AC-PLT-ATT-LEAVE-BAL-01H** | Honesty / seals | false · engine HOLD · RETAIN leave/CODE/WS/SHIFT/FE HOLDs · C-SLICE · U65 | 🟢 |

**OBS (01b):** Prefer L1 invent KEY LIVE Network — **not available** this seat. Matches BE residual «Wire CNS assert on grant/adjust when product surface ships · helper LIVE + jest». Leave-request invent policy_* → `HRM-VAL-001` (property should not exist) proves consumer body **not** gated for LVRULE yet.

**OBS (01c):** Live baseline active=0 before admin N+1. Invent-skip-at-empty not re-probed after N+1 (wipe **FORBIDDEN** U65). Jest CNS-05 covers empty skip.

**FE:** R-PLT-ATT-LVRULE-FE-01g HOLD — admin «Quy tắc quỹ phép» + grant bind + panel MVP kill — **do not invent FE** this seat. L1 PASS ≠ UF 🟢 / module ATT UAT.

---

## 4. Key network stamps

```text
GET  /api/hrm                                                              → 200  HRM-HEALTH-200
GET  /api/hrm/attendance/leave-accrual-policies/effective (unauth)         → 401  HRM-AUTH-001
GET  /api/hrm/attendance/leave-types/effective?company_id=main             → 200  HRM-ATT-LVT-200 (pick lvt_01)
GET  /api/hrm/attendance/leave-accrual-policies?leave_type_key=lvt_01      → 200  baseline active=0
POST /api/hrm/attendance/leave-accrual-policies                            → 201  HRM-ATT-LVRULE-201 id=b06ac803-…
GET  /api/hrm/attendance/leave-accrual-policies (F5)                       → 200  hasOpen display-ready
GET  /api/hrm/attendance/leave-accrual-policies/effective (F5)             → 200  hit created row
POST /api/hrm/attendance/leave-requests + policy_id invent                 → 400  HRM-VAL-001 (≠ LVRULE-KEY)
POST /api/hrm/attendance/leave-balances/grant|adjust|accrue                → 404  HRM-DATA-404
POST /api/hrm/attendance/leave-accrual-policies/assert-consumer            → 404  HRM-DATA-404
POST /api/hrm/attendance/leave-accrual-policies/{id}/retire                → 201  HRM-ATT-LVRULE-200 status=retired
GET  …/leave-accrual-policies (default)                                    → 200  retired hidden
GET  …/leave-accrual-policies?include_inactive=true                        → 200  retired visible
GET  …/leave-accrual-policies/effective                                    → 200  retired not resolved
POST …/leave-accrual-policies orphan leave_type_key                        → 400  HRM-ATT-LVRULE-TYPE
POST …/leave-requests invent leave_type                                    → 400  HRM-LEAVE-TYPE-UNKNOWN
GET  …/leave-accrual-policies/{fakeUuid}                                   → 404  HRM-ATT-LVRULE-404
```

**Policy under test:** `b06ac803-2426-4f0a-a87c-ca3d2d934d03` (`lvt_01` · `year_start_grant` · annualDays=12) — soft-retired after checks.  
**Persist company:** `holding` under group CEO `main` scope.

**KEY taxonomy:** `HRM-ATT-LVRULE-KEY` (helper/jest) · `HRM-ATT-LVRULE-TYPE` (orphan admin) · `HRM-LEAVE-TYPE-UNKNOWN` RETAIN — **orthogonal**, no synonym.

---

## 5. L2 / L2.5

| Surface | Status |
|---------|--------|
| Browser UF admin CREATE N+1 | **not claimed UF 🟢** — L1 admin API 01d PASS |
| Grant/adjust consumer invent KEY Network | **Condition** R-PLT-ATT-LVRULE-CNS-WIRE |
| Panel 01g MVP-five | **HOLD** residual FE/BE deepen |
| J-HRM-ATT-LVRULE-* | Proposed BA — **not claimed** this L1 stamp |
| UF-HRM / J-HRM-06* / ATT-CODE FE / ATT-SHIFT CNS-02 | **SEAL RETAIN** — **cấm** reopen / invent FE HOLDs / claim ATT UAT |

---

## 6. Residuals / Conditions (for QC GWC)

| ID | Owner | Note |
|----|-------|------|
| **R-PLT-ATT-LVRULE-CNS-WIRE** | **dev-be** (follow-on when grant/adjust or gated leave body ships) | Wire `assertLeaveAccrualPolicyForConsumer` → Network **4xx `HRM-ATT-LVRULE-KEY`**; helper+jest already LIVE |
| **R-PLT-ATT-LVRULE-FE-01g** | **dev-fe** | Admin «Quy tắc quỹ phép» + consumer grant bind + panel types ⊆ EFF (kill MVP-five sole) |
| **01c NOTE_BLOCKED** | qa cite | Empty invent-skip isolate without wipe — jest CNS-05 |
| **F-ATT-LEAVE-04** | OUT | Accrue engine LIVE **HOLD** — DENIED claim |
| leave-type / ATT-CODE / WS / SHIFT L1 · FE HOLDs | RETAIN | **cấm** reopen |

---

## 7. Honesty lock (DENIED)

- Flip `attendance_uat_ready` / `payroll_e2e_ready`
- Claim F-ATT-LEAVE-04 accrue engine LIVE
- Claim module ATT UAT / Phase1 DONE / UF 🟢 from this L1
- Reopen ATT-LEAVE / ATT-CODE / ATT-WS / ATT-SHIFT L1 invent packs
- Invent FE HOLDs (ATT-CODE FE · ATT-SHIFT CNS-02) as mandatory from this seat
- Seed / wipe to isolate 01c

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qa-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-01.json` |
| **stamp** | `ATTLVRULEQA-MSK6G783` |

### completion_report

**Closed:** L1 admin CREATE N+1 (01d) · F5 list/effective · soft-retire + include_inactive (01e) · orphan `HRM-ATT-LVRULE-TYPE` · type invent RETAIN `HRM-LEAVE-TYPE-UNKNOWN` (01f) · U19 spot · dist KEY · jest CNS 13/13 · honesty false · seals RETAIN · C-SLICE.

**Open / Conditions:** invent KEY Network wire (`R-PLT-ATT-LVRULE-CNS-WIRE`) · FE admin/grant/panel 01g HOLD · 01c NOTE_BLOCKED · engine LIVE HOLD.

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01 PASS_TO_PM stamp ATTLVRULEQA-MSK6G783
entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qa-01.md
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-be-01.md
  - Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · engine LIVE HOLD · C-SLICE-≠-MODULE
  - RETAIN: leave-type UNKNOWN · ATTCODEQA-MSK4T1A5 · ATT-WS · ATTSHIFTQA-MSK5FXP3 · FE HOLDs
task:
  - Narrow GWC L1 on ATT leave accrual policy Nest Option B
  - Accept Condition R-PLT-ATT-LVRULE-CNS-WIRE (helper+jest LIVE · HTTP grant wire follow-on) OR require BE wire before GO
  - Accept FE 01g HOLD · 01c NOTE_BLOCKED · DENY flip ready / module ATT UAT / engine LIVE / reopen seals
exit: GO WITH CONDITIONS or NO-GO
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md
```
