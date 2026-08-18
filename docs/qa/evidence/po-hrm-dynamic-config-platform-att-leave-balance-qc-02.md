# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — **CLOSE Condition `R-PLT-ATT-LVRULE-CNS-WIRE`** after QA-02 Network KEY · **not** module ATT UAT |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-02` PASS_TO_PM stamp **`ATTLVRULEQA2-MSK79F2F`** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 Network invent KEY via gated assert-consumer · **J-HRM-ATT-LVRULE-*** not claimed · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | AC-PLT-ATT-LEAVE-BAL-01b · VAL-ATT-LVRULE-CNS-01/05 · Condition close CNS-WIRE · FE 01g HOLD |
| **Verdict** | **GO WITH CONDITIONS** — **`R-PLT-ATT-LVRULE-CNS-WIRE` CLOSED** · invent KEY Network **LIVE** via assert-consumer · admin L1 `ATTLVRULEQA-MSK6G783` **RETAIN** · CONDITION P2 `R-PLT-ATT-LVRULE-FE-01g` HOLD · honesty `attendance_uat_ready=false` · `payroll_e2e_ready=false` · engine LIVE **HOLD** · seals RETAIN · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-att-leave-balance-qa-02.md`](po-hrm-dynamic-config-platform-att-leave-balance-qa-02.md) stamp **`ATTLVRULEQA2-MSK79F2F`** |
| **qc_prior** | [`po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md`](po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md) GWC · Condition CNS-WIRE MANDATORY P1 |
| **be_ref** | [`po-hrm-dynamic-config-platform-att-leave-balance-be-02.md`](po-hrm-dynamic-config-platform-att-leave-balance-be-02.md) READY_FOR_QA |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-02.json`](_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-02.json) |
| **stamp_qa** | `ATTLVRULEQA2-MSK79F2F` |
| **stamp_l1_admin** | `ATTLVRULEQA-MSK6G783` **RETAIN** |
| **spec_ref** | BA-01 AC-PLT-ATT-LEAVE-BAL-01b · VAL-ATT-LVRULE-CNS-01/05 · SA Option B · F-ATT-LVRULE-CNS-01 · `HRM-ATT-LVRULE-KEY` · F-ATT-LEAVE-04 HOLD |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — CNS-WIRE Condition close ≠ attendance module UAT / Phase1 / flip ready / engine LIVE / invent FE |

### Honesty locks (mandatory — RETAIN)

| Flag | Value | QC note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **F-ATT-LEAVE-04 engine LIVE** | **HOLD** | **DENIED** claim LIVE this seat |
| leave-type invent `HRM-LEAVE-TYPE-UNKNOWN` | **SEAL RETAIN** | orthogonal ≠ LVRULE-KEY · **cấm reopen** |
| ATT-CODE `ATTCODEQA-MSK4T1A5` | **SEAL RETAIN** | **cấm reopen** · **cấm invent FE ATT-CODE HOLD** |
| ATT-WS | **SEAL RETAIN** | **cấm reopen** |
| ATT-SHIFT `ATTSHIFTQA-MSK5FXP3` · CNS-02 CLOSED | **SEAL RETAIN** | **cấm reopen** |
| Admin L1 `ATTLVRULEQA-MSK6G783` | **SEAL RETAIN** | **cấm reopen** invent admin pack |
| EMP / SI / CTR / PAY | **SEAL RETAIN** | **cấm reopen** |
| **Module ATT UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module seal |
| **UF 🟢 from L1 Network** | **DENIED** | U65 · L1 ≠ browser UF |
| **Invent FE 01g / ATT-CODE FE** | **DENIED** | HOLD — sponsor must open FE wave |
| **Seed** | **DENIED** (U65) | QA + machine honesty |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | KEY Network LIVE ≠ module ATT UAT |

---

## Verdict summary

**GO WITH CONDITIONS** — CLOSE Condition **`R-PLT-ATT-LVRULE-CNS-WIRE`** after QA-02 stamp **`ATTLVRULEQA2-MSK79F2F`** proves gated `POST /attendance/leave-accrual-policies/assert-consumer` Network invent KEY.

Audited: QA-02 MD + machine JSON + BE-02 READY + QC-01 prior Condition + QC L0 spot. Proven: `network_key_hit=true` · `controller_assert_consumer_wired=true` · invent UUID / ad-hoc mode|days / malformed → **400 `HRM-ATT-LVRULE-KEY`** · unauth route **401 `HRM-AUTH-001` ≠ 404** · soft-skip · valid bind · soft-retire invent skip · TYPE/UNKNOWN orthogonal RETAIN · honesty false · FE 01g HOLD · C-SLICE · U65 zero-seed.

**Admin L1** seal `ATTLVRULEQA-MSK6G783` from QC-01 **RETAIN** (not reopened).

**Open Conditions after this seat:** only **`R-PLT-ATT-LVRULE-FE-01g` HOLD P2** (+ honesty / engine / seal locks). **No** remaining P1 product Condition on invent KEY Network wire.

**DENIED:** flip ready · module ATT UAT · claim engine LIVE · reopen seals · invent FE 01g / ATT-CODE · seed · UF 🟢 · Phase1 DONE · treat CNS-WIRE close as module GO. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `ATTLVRULEQA2-MSK79F2F` · overall PASS | machine `overall=PASS` · `PASS_TO_PM` | 🟢 **ACCEPT** |
| Dist wire assert-consumer | `controller_assert_consumer_wired=true` | 🟢 **ACCEPT** |
| Unauth route ≠ 404 | QA **401** + QC spot **401** `HRM-AUTH-001` | 🟢 **ACCEPT** |
| AC-PLT-ATT-LEAVE-BAL-01b invent KEY Network | invent UUID/adhoc/malformed all **400 KEY** · `network_key_hit=true` | 🟢 **CLOSED** was Condition P1 |
| Soft-skip / valid bind / retire invent skip | QA steps 4–6 PASS | 🟢 **ACCEPT** |
| Orthogonal TYPE / UNKNOWN | **400** TYPE · **400** UNKNOWN | 🟢 **RETAIN** |
| Admin L1 `ATTLVRULEQA-MSK6G783` | QC-01 GWC | 🟢 **SEAL RETAIN** |
| AC-PLT-ATT-LEAVE-BAL-01g FE panel | HOLD | 🟡 **CONDITION P2 HOLD** — **no invent FE** |
| Honesty 01H | ready=false · engine HOLD · C-SLICE | 🟢 **ACCEPT** |
| invent ready / module ATT UAT / engine LIVE / Phase1 / UF 🟢 / reopen seals / invent FE | Explicit DENIED | 🟢 **DENIED promote** |
| Live L0 | hrm **200** · portal **200** · xbos **200** · unauth assert **401** | 🟢 ENV OK |

**Cấm:** invent `attendance_uat_ready=true` · invent `payroll_e2e_ready=true` · claim F-ATT-LEAVE-04 LIVE · claim module ATT UAT DONE · reopen leave-type/CODE/WS/SHIFT/admin L1 · invent FE 01g / ATT-CODE HOLD · seed · UF 🟢 · treat CNS-WIRE CLOSED as module GO · Phase1 DONE.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| May PM claim F-ATT-LEAVE-04 engine LIVE? | **NO** |
| May PM claim invent `HRM-ATT-LVRULE-KEY` Network LIVE / AC-01b sealed? | **YES** — via gated assert-consumer (this seat) · **not** grant/adjust product path claim |
| May PM close Condition `R-PLT-ATT-LVRULE-CNS-WIRE`? | **YES** — CLOSED this seat |
| May PM reopen leave-type / ATT-CODE / WS / SHIFT / admin L1? | **NO** |
| May PM invent FE 01g Task as mandatory? | **NO** — HOLD P2 · **DENY invent FE** unless sponsor opens FE wave |
| May PM claim module ATT UAT / Phase1 / UF 🟢? | **NO** |
| Why | `C-SLICE-≠-MODULE` · KEY Network LIVE ≠ module ATT UAT · FE HOLD remains |
| Recommended flag state | keep **`attendance_uat_ready=false` LOCKED** · **`payroll_e2e_ready=false` LOCKED** · engine HOLD |
| Forced residual dispatch this turn? | **DENY invent FE 01g** · prefer **CTR QA** if DOCS needs promote **or** **sa** next vertical (CTR DOCS already ACCEPT) · U88 ≥1 governance |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 GWC | `…-att-leave-balance-qc-01.md` | GWC · CNS-WIRE P1 MANDATORY | **ACCEPT** prior |
| BE-02 wire | `…-att-leave-balance-be-02.md` | READY_FOR_QA · assert-consumer | **ACCEPT** |
| QA-02 Network KEY | `…-att-leave-balance-qa-02.md` | PASS_TO_PM · `ATTLVRULEQA2-MSK79F2F` | **ACCEPT** |
| Machine JSON | `_tmp-…-qa-02.json` | `network_key_hit=true` · wired=true · overall PASS | **ACCEPT** |
| Admin L1 stamp | `ATTLVRULEQA-MSK6G783` | RETAIN | **SEAL RETAIN** |
| Live L0 + unauth spot | hrm/portal/xbos · POST assert-consumer unauth | **200** / **200** / **200** · **401 ≠ 404** | 🟢 ENV OK |

### Machine JSON spot (`ATTLVRULEQA2-MSK79F2F`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `ATTLVRULEQA2-MSK79F2F` | 🟢 |
| `overall` / `ack_status` | **PASS** · **PASS_TO_PM** | 🟢 |
| `honesty.attendance_uat_ready` | **false** | 🟢 |
| `honesty.payroll_e2e_ready` | **false** | 🟢 |
| `honesty.F_ATT_LEAVE_04_engine_LIVE` | **HOLD** | 🟢 |
| `honesty.C_SLICE_NE_MODULE` | **true** | 🟢 |
| `dist.controller_assert_consumer_wired` | **true** (was false QC-01) | 🟢 |
| `val.AC-PLT-ATT-LEAVE-BAL-01b.network_key_hit` | **true** (was false QC-01) | 🟢 **CLOSE Condition** |
| invent UUID / adhoc / malformed | all **400 KEY** | 🟢 |
| `residuals` CNS-WIRE | READY_CLOSE | 🟢 → **CLOSED** |
| FE-01g | HOLD | 🟡 CONDITION P2 |

---

## Condition disposition

| ID | Prior (QC-01) | After QA-02 | QC-02 |
|----|---------------|-------------|-------|
| **R-PLT-ATT-LVRULE-CNS-WIRE** | MANDATORY P1 · owner dev-be | Network KEY proven · READY_CLOSE | ✅ **CLOSED** |
| **R-PLT-ATT-LVRULE-FE-01g** | CONDITION HOLD P2 | HOLD | 🟡 **KEEP HOLD P2** — **DENY invent FE** |
| **F-ATT-LEAVE-04** | OUT HOLD | HOLD | **RETAIN HOLD** |
| Admin L1 / leave-type / CODE / WS / SHIFT | SEAL RETAIN | RETAIN | **SEAL RETAIN** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC-02 |
|-----------------|-------|-------|-------|
| Nest Option B admin L1 | QC-01 GWC SEAL | RETAIN | 🟢 **SEAL RETAIN** |
| Invent KEY Network (AC-01b / VAL-CNS-01) via assert-consumer | Condition wire | 🟢 PASS KEY | 🟢 **CLOSED / ACCEPT KEY LIVE (gated)** |
| FE admin «Quy tắc quỹ phép» + grant bind + panel 01g | HOLD | HOLD | 🟡 **CONDITION P2 HOLD** — **no invent** |
| J-HRM-ATT-LVRULE-* / UF / module ATT UAT | deferred | not claimed | ⬜ **DEFERRED** — **DENY promote** |
| Peer CODE/WS/SHIFT/leave-type seals | RETAIN | RETAIN | 🟢 **SEAL RETAIN** |

**U19 note:** Certifies **CNS-WIRE Condition close** + invent KEY Network LIVE on gated assert-consumer only — **not** browser UF, J-*, grant/adjust product path, engine LIVE, or module ATT UAT.

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| QA-02 PASS stamp · network_key_hit=true | PRODUCT PASS | Yes → CLOSE CNS-WIRE |
| Unauth 401 ≠ 404 · dist wired | PRODUCT PASS | Yes → route LIVE |
| FE 01g HOLD | PRODUCT CONDITION | Yes → GWC P2 KEEP |
| Honesty / ready / engine / seal reopen / UF 🟢 | PRODUCT DENIED | Yes → CONDITIONS |
| Live L0 200 · spot 401 | ENV OK | Spot-check only |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-PLT-ATT-LVRULE-FE-01g** | P2 HOLD | **dev-fe** (later) | Admin «Quy tắc quỹ phép» + grant bind + panel ⊆ EFF — **HOLD** · **DENY invent FE** unless sponsor opens FE wave |
| **F-ATT-LEAVE-04** | OUT HOLD | — | Accrue engine LIVE **DENIED** |
| **Honesty / C-SLICE** | — | **pm** | Keep ready=false · no module ATT UAT / Phase1 · no seal reopen |
| Peer seals leave-type/CODE/WS/SHIFT/admin L1 | must_keep | — | **do not reopen** · **do not invent FE ATT-CODE** |
| **U88 continuous** | — | **pm** | CTR DOCS SEALED · **CTR-TEMPLATE-SA-01 already DISPATCHED** (await SA; no duplicate) · **DENY invent FE 01g** |

**No residual P0/P1 product Condition on invent KEY Network wire.** Residual open = FE 01g HOLD P2 + honesty locks.

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-02` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — CNS-WIRE close · no J-* promote |
| 4 | crud_or_matrix | ✅ AC-01b KEY close · FE 01g HOLD · honesty |
| 5 | Classification | ✅ PRODUCT / ENV |
| 6 | Honesty locks | ✅ attendance/payroll=false · engine HOLD · seals RETAIN · C-SLICE · DENY FE invent |
| 7 | Residual section | ✅ FE-01g P2 HOLD · engine OUT · U88 · seals retain · CNS-WIRE CLOSED |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| Read QA-02 + machine `ATTLVRULEQA2-MSK79F2F` | `network_key_hit=true` · wired=true · overall PASS | PRODUCT audit |
| Read BE-02 + QC-01 Condition | wire READY → QA PASS → close candidate | PRODUCT audit |
| Live L0 `GET :28001/api/hrm` · `:5173` · `:28002/api/xbos` | **200** / **200** / **200** | ENV OK |
| Spot unauth `POST …/assert-consumer` `{companyId,leaveTypeKey}` no token | **401** `HRM-AUTH-001` ≠ 404 | ENV/PRODUCT route OK |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-02.md` | exit **0** · **PASS 8/8** | QC pack SoT |

---

## completion_report

**Closed:** Condition **`R-PLT-ATT-LVRULE-CNS-WIRE`** — ACCEPT QA stamp `ATTLVRULEQA2-MSK79F2F` · Network invent **400 `HRM-ATT-LVRULE-KEY`** (uuid/adhoc/malformed) · `network_key_hit=true` · `controller_assert_consumer_wired=true` · unauth **401 ≠ 404** · soft-skip / valid bind / retire invent skip · TYPE/UNKNOWN orthogonal · admin L1 `ATTLVRULEQA-MSK6G783` RETAIN · honesty false · C-SLICE · U65 · DENIED ready/engine/module/UF/FE invent · QC pack 8/8.

**Open / Conditions:**
1. **R-PLT-ATT-LVRULE-FE-01g** — P2 HOLD · **dev-fe** (**DENY invent** unless sponsor opens FE wave)
2. **F-ATT-LEAVE-04** engine LIVE — HOLD OUT
3. Peer seals / honesty locks — RETAIN

**next_owner:** **pm** (U88 — CTR DOCS SEALED · **CTR-TEMPLATE-SA-01 already DISPATCHED** — do not duplicate; **DENY invent FE 01g**)

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-02.md`

### next_dispatch_prompt (copy-ready — only if CTR-TEMPLATE-SA not already in flight)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01
from_role: pm
to_role: sa
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QC-02 GWC · CNS-WIRE CLOSED · U88 continuous
NOTE: Bus already has pm -> sa DISPATCHED for this work_item — if still open, await SA CONFIRMED; do NOT re-dispatch duplicate.
entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qc-02.md (GWC · R-PLT-ATT-LVRULE-CNS-WIRE CLOSED · FE 01g HOLD)
  - CTR-CLAUSE DOCS-01 SEALED ACCEPT — do not re-open CTR DOCS
  - Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE
  - RETAIN: ATT leave-type/CODE/WS/SHIFT L1 · leave-balance admin L1 + KEY Network seal · FE 01g HOLD · DENY invent FE
task:
  - Option/F.1 CTR template open catalog · invent KEY class · admin≠consumer · DENY mega-EAV · DENY flip ready
  - Unlock ba-process AC pack; BE HOLD until BA+DATA if Nest DEFINE
exit: CONFIRMED Option + next_dispatch ba-process|ba-data
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-sa-01.md
```

**DENY alternate:** invent `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-FE-01` / 01g — **forbidden** unless sponsor explicitly opens FE wave.
