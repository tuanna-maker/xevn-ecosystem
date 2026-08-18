# Evidence — `PO-UAT-ATT-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-ATT-01` |
| **from_role** | qa |
| **to_role** | pm → **qc** (`PO-UAT-ATT-QC-01`) |
| **date** | 2026-08-07 |
| **lane** | execution · U65 browser-only · zero-seed |
| **program** | `PO-UAT-MODULES-PARALLEL-01` |
| **module** | Chấm công / leave→sheet |
| **portal** | `http://127.0.0.1:5173` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` (JWT OU `holding`) |
| **stamp** | `UATAT-ICUN40` |
| **leave_id** | `d79763cd-1dce-4c16-8232-3edf44a7dc63` |
| **lock_leave_id** | `ea28337a-6703-4450-9899-f2ba5f198010` |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | **`attendance_uat_ready=false`** · no Option C · WAIVE_L2 / LV-02 **WAIVED_P1** retained · no Phase 1 invent |

---

## Entry / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` + XBOS `:28002` + portal `:5173` **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Prior GWC | leave funnel qc-01/qc-02 · ATT close/sign in map · **WAIVE_L2 / LV-02 WAIVED_P1** keep |
| Seed / API invent as UF PASS | **None** (U65) |
| Forbidden | No Option C SoT · no `attendance_uat_ready=true` · no WAIVE_L2 reopen · no commit |

---

## HDSD inventory (U76)

| # | Control | Observed |
|---|---------|----------|
| 1 | Chấm công → **Nghỉ phép** | 🟢 |
| 2 | **Tạo yêu cầu nghỉ** → Gửi | 🟢 POST **201** `HRM-LEAVE-201` (08–09/02/2027 VN) |
| 3 | **Chờ duyệt** → **Duyệt** | 🟢 POST **201** `HRM-LEAVE-203` · `materialized_days=["2027-02-08","2027-02-09"]` |
| 4 | **Danh sách yêu cầu** → Hủy đơn + confirm | 🟢 POST **201** `HRM-LEAVE-205` |
| 5 | Menu **Bảng chấm công** (`attendance-tab-menu`) | 🟢 `att-sheets-precision` + `att-sheets-add` |
| 6 | Open sheet → sign/Chốt chrome (J-HRM-06c smoke) | 🟢 visible (no mutate) |
| 7 | LV-02 ladder | ⚪ **WAIVED_P1** — not exercised / not 🟢 |

---

## AC / journey matrix

| AC / J-* | Verdict | Evidence |
|----------|---------|----------|
| **AC-ATT-LV-SHEET-01** | 🟢 **PASS** | Create→Duyệt → mat length=2 · GET records **2** leave `yyyy-MM-dd` · F5 still **2** |
| **AC-ATT-LV-SHEET-02** | 🟢 **PASS** | HDSD Hủy đơn → POST cancel **201** `HRM-LEAVE-205` · markers **2→0** · F5 **0** · cancel CTA gone |
| **AC-ATT-LV-SHEET-03** | 🟢 **PASS** | Leave on closed Sept day `2026-09-23` → Duyệt → **409** `HRM-ATT-SHEET-LOCKED` |
| **J-HRM-06b** | 🟢 **PASS** | After reload: GET `attendance/records` + `attendance-sheets` in 10s = **0** (≤2) |
| **J-HRM-06c** | 🟢 **PASS** (smoke) | Open existing sheet → sign/Chốt controls visible · **no** submit/sign/close mutate |
| **SHEETS-CHROME** | 🟢 **PASS** | List visible · add CTA visible · rows=4 · open OK · open-storm=2 ≤4 · no empty+auto-reload FAIL class |
| **LV-02** | ⚪ **WAIVED_P1** | Not claimed 🟢 |
| **R-ATT-SHEET-NAV-CTA** | 🟢 soft clear this run | `att-sheets-add` **visible** via menu — does **not** block |

---

## Click path (U65)

1. Login inject `ceo@xe.vn` · hard refresh `/hr/attendance?portal=1&companyId=main`
2. Nghỉ phép → Tạo yêu cầu → UAT-0100 · **08–09/02/2027** · Gửi → **201**
3. Chờ duyệt → Duyệt → **201** + materialize 2 days · F5 records còn
4. Danh sách yêu cầu → **Hủy đơn** → confirm → POST cancel **201** · markers clear + F5
5. Storm measure ≤2
6. Menu **Bảng chấm công** → list/open month chrome · open sheet sign panel smoke
7. New context: leave overlap closed Sept **23** → Duyệt → **409 LOCKED**

---

## Must-keep / honesty

| Item | Status |
|------|--------|
| Prior funnel GWC (qc-01/qc-02) | Retained |
| WAIVE_L2 / LV-02 | **WAIVED_P1** — not reopened |
| Option C as SoT | **cấm** |
| `attendance_uat_ready` | **false** (cấm claim / set true) |
| J-HRM-06b storm ≤2 | 🟢 |
| ATT close/sign mutate full chain | Prior map PASS · this seat = **smoke only** |

---

## Residuals / OBS

| ID | Severity | Note |
|----|----------|------|
| `R-ATT-SHEET-NAV-CTA` | soft (parent) | **Not blocking** this stamp — add CTA found via `attendance-tab-menu` |
| Module UAT | — | stays **`attendance_uat_ready=false`** until QC GO on module seal (denied here) |
| Prior OVERLAP noise | OBS process | Prior UAT attempts left Sept/Dec leave leftovers; final stamp used Feb 2027 + Sept 23 |

---

## Artifacts

| Artifact | Path |
|----------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-uat-att-01.json` |
| Script | `scripts/qa/_tmp-po-uat-att-01.mjs` |
| Screens | `docs/qa/evidence/screens/po-uat-att-01/` (21 PNG) |
| Prior cancel QA / funnel QC | `po-hrm-att-leave-cancel-qa-01.md` · `po-hrm-att-leave-funnel-qc-01.md` · `po-hrm-att-leave-funnel-qc-02.md` |
| Spec §7 | `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` |

---

## Machine spot (stamp `UATAT-ICUN40`)

| Signal | Value |
|--------|-------|
| L0 hrm/xbos/portal | 200/200/200 |
| LEAVE-CREATE | 201 `HRM-LEAVE-201` |
| LEAVE-APPROVE | 201 `HRM-LEAVE-203` mat=`["2027-02-08","2027-02-09"]` |
| RECORDS before / F5 | leave=**2** / **2** |
| LEAVE-CANCEL | 201 `HRM-LEAVE-205` · markers 2→0 / F5 0 |
| lockApprove | 409 `HRM-ATT-SHEET-LOCKED` day=2026-09-23 |
| stormWindow.count | **0** ≤2 |
| sheets openStormCount | **2** ≤4 |
| pageErrors | `[]` |
| attendance_uat_ready | **false** |

---

## completion_report

U65 browser **PO-UAT-ATT-01 PASS_TO_PM**. L0 + fe-be-health PASS. AC-01 materialize+F5 · AC-02 cancel markers clear · AC-03 closed overlap **409 LOCKED** · J-HRM-06b storm≤2 · J-HRM-06c smoke · sheets chrome no empty-FAIL. Soft `R-ATT-SHEET-NAV-CTA` **not blocking** (add CTA visible). **`attendance_uat_ready=false`**. WAIVE_L2 / LV-02 retained. No seed. No Option C.

## next_owner

**qc** — `PO-UAT-ATT-QC-01`

## next_dispatch_prompt

```text
work_item_id: PO-UAT-ATT-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-UAT-ATT-01 PASS_TO_PM
program: PO-UAT-MODULES-PARALLEL-01
u65: browser evidence only · zero-seed
honesty: attendance_uat_ready=false — DENIED promote module UAT / production GO

read_first:
1. docs/qa/evidence/po-uat-att-01.md
2. docs/qa/evidence/_tmp-po-uat-att-01.json (stamp UATAT-ICUN40)
3. docs/qa/evidence/po-hrm-att-leave-funnel-qc-02.md (prior GWC must_keep)
4. docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §7

task:
1) Audit AC-01/02/03 + J-HRM-06b ≤2 + SHEETS-CHROME + J-HRM-06c smoke — stamp UATAT-ICUN40
2) Confirm WAIVE_L2 / LV-02 WAIVED_P1 retained; soft R-ATT-SHEET-NAV-CTA not blocking
3) GWC narrow attendance UAT pack slice ONLY — NOT attendance_uat_ready=true
4) Evidence docs/qa/evidence/po-uat-att-qc-01.md

exit: PASS_TO_PM with GO|GWC|NO-GO
forbidden: seed · Option C · reopen WAIVE_L2 · claim attendance_uat_ready=true
```

## ack_status

**PASS_TO_PM**
