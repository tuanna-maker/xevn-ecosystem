# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-02` **READY_FOR_QA** · closes **`R-PLT-ATT-LVRULE-CNS-WIRE`** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` |
| **Stamp** | `ATTLVRULEQA2-MSK79F2F` |
| **stamp_l1_admin** | `ATTLVRULEQA-MSK6G783` **RETAIN** |
| **U65** | zero-seed · L1 Network ≠ 🟢 UF · no `pnpm seed:*` |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · F-ATT-LEAVE-04 engine LIVE **HOLD** · leave-type invent `HRM-LEAVE-TYPE-UNKNOWN` **RETAIN** · ATT-CODE **`ATTCODEQA-MSK4T1A5`** · ATT-WS · ATT-SHIFT **`ATTSHIFTQA-MSK5FXP3`** · FE 01g **HOLD** · **`C-SLICE-≠-MODULE`** · DENY module ATT UAT / flip ready / claim engine LIVE / invent FE |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** — AC-01b invent KEY Network LIVE via gated `assert-consumer` |
| **change_mode** | VERIFY only · no `apps/**` invent · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 | hrm `:28001` **200** `HRM-HEALTH-200` (process already listening; restart attempt EADDRINUSE — live instance served rebuilt dist) |
| Dist wire | `HRM-ATT-LVRULE-KEY` present · `POST leave-accrual-policies/assert-consumer` + `assertLeaveAccrualPolicyForConsumer` in dist controller → **`controller_assert_consumer_wired=true`** |
| Unauth route | POST assert-consumer → **401** `HRM-AUTH-001` (**≠ 404**) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-02.json` |

**spec_ref:** BA-01 **AC-PLT-ATT-LEAVE-BAL-01b** · VAL-ATT-LVRULE-CNS-01/05 · SA Option **B** · F-ATT-LVRULE-CNS-01 · BE-02 READY · QC-01 Condition `R-PLT-ATT-LVRULE-CNS-WIRE`

**Seed:** none.

---

## 2. L1 Network invent KEY (task checklist)

| # | Action | Evidence | Verdict |
|---|--------|----------|---------|
| 1 | Route registered (unauth) | POST assert-consumer → **401** `HRM-AUTH-001` ≠ 404 | 🟢 |
| 2 | Admin CREATE active policy `lvt_01` ∈ EFF | POST → **201** `HRM-ATT-LVRULE-201` id=`10457aa3-…` company=`holding` | 🟢 |
| 3a | Invent unknown `policyId` + ad-hoc days | **400** `HRM-ATT-LVRULE-KEY` · invent UUID **not** in list | 🟢 |
| 3b | Invent ad-hoc `accrualMode`\|`annualDays` | **400** `HRM-ATT-LVRULE-KEY` | 🟢 |
| 3c | Malformed non-UUID `policyId` | **400** `HRM-ATT-LVRULE-KEY` (≠ 500) | 🟢 |
| 4 | Empty / no rule params | **201** `HRM-ATT-LVRULE-200` `{policy:null, skipped:true}` | 🟢 |
| 5 | Valid published binding | **201** `HRM-ATT-LVRULE-200` `skipped=false` policyId=`10457aa3-…` | 🟢 |
| 6 | Soft-retire → invent skip · include_inactive | retire **201** · default hide · include shows · eff hides · invent after → **201** `skipped=true` | 🟢 |
| 7 | Orthogonal TYPE / UNKNOWN | orphan admin → **400** `HRM-ATT-LVRULE-TYPE` · leave invent type → **400** `HRM-LEAVE-TYPE-UNKNOWN` · ≠ KEY | 🟢 |
| 8 | Honesty DENY | ready=false · engine HOLD · seals RETAIN · C-SLICE · no invent FE · no ATT UAT claim | 🟢 |

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **route_registered** | unauth 401 ≠ 404 | 401 `HRM-AUTH-001` | 🟢 |
| **dist_wire** | assert-consumer in dist | wired=true | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01d** (reuse) | Admin CREATE N+1 | 201 + id | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01b** / **VAL-CNS-01** | invent → Network **4xx `HRM-ATT-LVRULE-KEY`** | invent UUID / ad-hoc / malformed all **400 KEY** · `network_key_hit=true` | 🟢 **CLOSED wire gap** |
| soft-skip no params / CNS-05 | 2xx skipped | 201 skipped=true | 🟢 |
| valid published bind | 2xx match policy | 201 skipped=false · policy id match | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01e** | soft-retire hide + invent skip | hide + include_inactive + invent skipped | 🟢 |
| orphan TYPE | `HRM-ATT-LVRULE-TYPE` | 400 TYPE | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01f** | `HRM-LEAVE-TYPE-UNKNOWN` ≠ KEY | 400 UNKNOWN | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01H** | honesty false · seals RETAIN | LOCKED DENY list | 🟢 |
| **AC-PLT-ATT-LEAVE-BAL-01g** | FE panel | **HOLD** — do not invent FE | 🟡 HOLD |

**Condition close candidate:** `R-PLT-ATT-LVRULE-CNS-WIRE` — QA machine `network_key_hit=true` · `controller_assert_consumer_wired=true` (was false on QA-01 / QC-01).

---

## 4. Key network stamps

```text
GET  /api/hrm                                                              → 200  HRM-HEALTH-200
POST /api/hrm/attendance/leave-accrual-policies/assert-consumer (unauth)   → 401  HRM-AUTH-001
GET  /api/hrm/attendance/leave-types/effective?company_id=main             → 200  HRM-ATT-LVT-200 (pick lvt_01)
POST /api/hrm/attendance/leave-accrual-policies                            → 201  HRM-ATT-LVRULE-201 id=10457aa3-…
POST …/assert-consumer {companyId, leaveTypeKey}                           → 201  HRM-ATT-LVRULE-200 skipped=true
POST …/assert-consumer invent policyId + annualDays=999                    → 400  HRM-ATT-LVRULE-KEY
POST …/assert-consumer invent accrualMode=zz_invent_mode_adhoc             → 400  HRM-ATT-LVRULE-KEY
POST …/assert-consumer policyId=not-a-uuid-invent                          → 400  HRM-ATT-LVRULE-KEY
POST …/assert-consumer valid policyId + published mode|days                → 201  HRM-ATT-LVRULE-200 skipped=false
POST …/leave-accrual-policies/{id}/retire                                  → 201  HRM-ATT-LVRULE-200 status=retired
GET  …/leave-accrual-policies (default)                                    → 200  retired hidden
GET  …/leave-accrual-policies?include_inactive=true                        → 200  retired visible
POST …/assert-consumer invent after retire                                 → 201  HRM-ATT-LVRULE-200 skipped=true
POST …/leave-accrual-policies orphan leave_type_key                        → 400  HRM-ATT-LVRULE-TYPE
POST …/leave-requests invent leave_type                                    → 400  HRM-LEAVE-TYPE-UNKNOWN
```

**Policy under test:** `10457aa3-bf93-4eee-aa21-08bf970e23a7` (`lvt_01` · `year_start_grant` · annualDays=12) — soft-retired after invent KEY proof.  
**Persist company:** `holding` under group CEO `main` scope.

**KEY taxonomy (orthogonal RETAIN):**
- `HRM-ATT-LVRULE-KEY` — consumer invent (Network LIVE this seat)
- `HRM-ATT-LVRULE-TYPE` — admin orphan type
- `HRM-LEAVE-TYPE-UNKNOWN` — leave TXN invent type

---

## 5. L2 / L2.5 / honesty

| Surface | Status |
|---------|--------|
| Browser UF invent KEY / admin CFG | **not claimed UF 🟢** — L1 Network only |
| J-HRM-ATT-LVRULE-* | Proposed BA — **not claimed** this L1 stamp |
| FE 01g / ATT-CODE FE / ATT-SHIFT CNS-02 | **HOLD / SEAL RETAIN** — **cấm** invent FE |
| Module ATT UAT / ready flip / engine LIVE | **DENIED** |

---

## 6. Residuals

| ID | Owner | Note |
|----|-------|------|
| **R-PLT-ATT-LVRULE-CNS-WIRE** | **qc** | QA proves Network KEY — **READY_CLOSE** on QC-02 |
| **R-PLT-ATT-LVRULE-FE-01g** | **dev-fe** | Admin «Quy tắc quỹ phép» + grant bind + panel MVP kill — HOLD |
| **F-ATT-LEAVE-04** | OUT | Accrue engine LIVE **HOLD** |
| L1 admin `ATTLVRULEQA-MSK6G783` · leave-type / ATT-CODE / WS / SHIFT | RETAIN | **cấm** reopen |

---

## 7. Honesty lock (DENIED)

- Flip `attendance_uat_ready` / `payroll_e2e_ready`
- Claim F-ATT-LEAVE-04 accrue engine LIVE
- Claim module ATT UAT / Phase1 DONE / UF 🟢 from this L1
- Reopen ATT-LEAVE / ATT-CODE / ATT-WS / ATT-SHIFT L1 invent packs
- Invent FE HOLDs (01g / ATT-CODE FE)
- Seed / wipe

---

## 8. Handoff

### completion_report
Closed **R-PLT-ATT-LVRULE-CNS-WIRE** from QA perspective: gated `POST /attendance/leave-accrual-policies/assert-consumer` is registered (unauth **401** ≠ 404); with active policy, invent UUID / ad-hoc mode|days / malformed policyId all emit Network **400 `HRM-ATT-LVRULE-KEY`** (`network_key_hit=true`, `controller_assert_consumer_wired=true`); no invent persist; soft-skip no-params + soft-skip after retire; valid published bind 2xx; TYPE / UNKNOWN orthogonal RETAIN; admin L1 stamp `ATTLVRULEQA-MSK6G783` RETAIN; honesty flags false; engine HOLD; FE 01g HOLD; C-SLICE; U65 zero-seed. Stamp **`ATTLVRULEQA2-MSK79F2F`**.

### next_owner
`qc`

### next_dispatch_prompt
```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-02 PASS_TO_PM · close Condition R-PLT-ATT-LVRULE-CNS-WIRE
stamp_qa: ATTLVRULEQA2-MSK79F2F
stamp_l1_admin: ATTLVRULEQA-MSK6G783 RETAIN

entry_criteria:
- Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qa-02.md
- Read machine JSON docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-02.json
- Read QC-01 Condition R-PLT-ATT-LVRULE-CNS-WIRE + BE-02 READY
- U65 · honesty attendance_uat_ready=false · payroll_e2e_ready=false · engine HOLD · C-SLICE
- RETAIN: L1 admin · leave-type UNKNOWN · ATT-CODE/WS/SHIFT · FE 01g HOLD

task:
1) Audit QA-02 Network stamps: unauth assert-consumer 401; invent → 400 HRM-ATT-LVRULE-KEY (uuid/adhoc/malformed); soft-skip; valid bind; retire invent skip
2) CLOSE Condition R-PLT-ATT-LVRULE-CNS-WIRE if evidence proves network_key_hit=true + controller_assert_consumer_wired=true
3) KEEP GWC narrow: do NOT flip ready · do NOT claim engine LIVE · do NOT invent FE 01g · do NOT claim module ATT UAT
4) Retain FE residual R-PLT-ATT-LVRULE-FE-01g HOLD P2
5) evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-02.md

exit: PASS_TO_PM with GO WITH CONDITIONS (CNS-WIRE closed · FE 01g HOLD · honesty false) or NO-GO if KEY claim overstated
```

### evidence_path
`docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qa-02.md`

### ack_status
**PASS_TO_PM**
