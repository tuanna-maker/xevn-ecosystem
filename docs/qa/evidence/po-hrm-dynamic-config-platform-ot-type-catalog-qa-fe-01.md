# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01` **READY_FOR_QA** · closes Condition **R-PLT-ATT-OT-FE-01** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | `ATTOTQAFE-MSK9TJDM` |
| **stamp_l1 RETAIN** | **`ATTOTQA-MSK8VETU`** · invent → **400 `HRM-ATT-OT-TYPE-KEY`** LIVE |
| **U65** | zero-seed · **browser** FE click path · admin Network POST ot-types only if EFF=0 (this run reused existing) · invent API spot ≠ UF 🟢 |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `formula_LIVE=false` · ATT-CODE/`ATTCODEQA-MSK4T1A5` · leave/`ATTLEAVEQA-MSJ7CPJH` · WS/`ATTWSQA-MSJC3IN9` · SHIFT/`ATTSHIFTQA-MSK5FXP3` · CTR/`CTRTPLQA-MSK7U4CG` · **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | **PASS_WITH_OBS** |
| **overall** | **PASS_WITH_OBS** — **R-PLT-ATT-OT-FE-01 CLOSABLE** |
| **condition_verify** | **R-PLT-ATT-OT-FE-01** → **CLOSABLE** (Nest picker + Nest submit + FE/F5 proven) |
| **change_mode** | ADD verify · no `apps/**` · no seed · no ready flip · **FORBIDDEN** invent FE admin |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-ot-type-catalog-qa-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ot-type-catalog-qa-fe-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ot-type-catalog-qa-fe-01/` |
| FE parent | [`po-hrm-dynamic-config-platform-ot-type-catalog-fe-01.md`](po-hrm-dynamic-config-platform-ot-type-catalog-fe-01.md) READY_FOR_QA |
| L1 QA | [`po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.md`](po-hrm-dynamic-config-platform-ot-type-catalog-qa-01.md) stamp **`ATTOTQA-MSK8VETU`** |
| QC Condition | [`po-hrm-dynamic-config-platform-ot-type-catalog-qc-01.md`](po-hrm-dynamic-config-platform-ot-type-catalog-qc-01.md) **R-PLT-ATT-OT-FE-01** |

**spec_ref:** AC-PLT-ATT-OT-01 / 01c · VAL-ATT-OT-CNS-01 · BA-01 · FE-01 Nest rebind OvertimeRequestTab

**Seed:** none · **ensureDefault:** none · **FE-ADMIN invent:** **DENIED / HOLD**.

---

## 2. Click path (U65 · HDSD · R-PLT-ATT-OT-FE-01)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Nest EFF baseline | **total=1** code=`qc_spot_ot_msk8` · reused (no wipe / no seed) |
| 2 | Invent API spot `zz_invent_att_ot_*` (full DTO) | **400 `HRM-ATT-OT-TYPE-KEY`** LIVE reprobe `zz_invent_att_ot_k9vpoo` · L1 stamp **RETAIN** |
| 3 | **Chấm công** → **Quản lý đơn** → **Đăng ký làm thêm** | `requests-menu-overtime` · `att-ot-precision` visible |
| 4 | GET `/attendance/ot-types/effective` (FE hook) | **200** `HRM-ATT-OT-200` (Network count≥1) |
| 5 | Open **Thêm đơn tăng ca** | `att-ot-add-dialog-precision` |
| 6 | Select «Loại tăng ca» `att-ot-type-select` | Nest **nameVi** `QC spot OT (x1.5)` — **not** sole weekday\|weekend\|holiday SoT · coeffPattern=true |
| 7 | Coeff hint | `Hệ số: x1.5` (`att-ot-type-coeff-hint`) |
| 8 | Emp + date + reason → Thêm | Network **POST** body Nest **code** `qc_spot_ot_msk8` · coeff **1.5** |
| 9 | FE sau 2xx | **201** `HRM-OT-201` · list/badge shows Nest nameVi |
| 10 | F5 · re-nav OT tab | Nest label còn · list GET 200 |
| 11 | Invent UI | Hard **Select-only** — no free-text invent (PASS_WITH_OBS OK) |
| 12 | EFF=0 branch | **NOTE_BLOCKED** — no wipe; cite FE-01 vitest 17 (bootstrap) |
| 13 | FE-ADMIN | **R-PLT-ATT-OT-FE-ADMIN** HOLD_ABSENT_OK |

**HDSD / testids:** `requests-menu-overtime` · `att-ot-precision` · `att-ot-add-dialog-precision` · `att-ot-type-select` · `att-ot-type-filter` · `att-ot-type-coeff-hint`

---

## 3. Spot AC table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200/200/200 | 🟢 |
| **EFF>0 ensure** | active catalog via Network POST if needed OR existing | reused N=1 `qc_spot_ot_msk8` | 🟢 |
| **FE GET effective** | Network GET ot-types/effective 200 | 200 `HRM-ATT-OT-200` | 🟢 |
| **VAL-ATT-OT-CNS-01 / AC-01** | EFF>0 Select Nest nameVi ≠ sole hardcode-3 | Nest `QC spot OT (x1.5)` · onlyBoot=false | 🟢 |
| **AC submit Nest** | Nest code in POST · 2xx · FE update | **201** `HRM-OT-201` · `overtime_type=qc_spot_ot_msk8` · coeff=1.5 | 🟢 |
| **FE + F5** | row/badge retain Nest | feShowsNest · f5Shows · list GET 200 | 🟢 |
| **Invent UI** | free entry OR Select-only + L1 KEY | Select-only · API invent **400 KEY** | 🟡 PASS_WITH_OBS |
| **AC-PLT-ATT-OT-01c** | EFF=0 bootstrap without wipe | **NOTE_BLOCKED** · unit cite FE-01 | 🟡 documented |
| **L1 KEY LIVE** | invent → 400 `HRM-ATT-OT-TYPE-KEY` | confirmed this run | 🟢 |
| **FE-ADMIN** | HOLD / no invent panel | HOLD_ABSENT_OK | 🟢 |
| **01H honesty** | ready=false · formula false · C-SLICE | locked | 🟢 |
| **Console** | no Uncaught / mojibake / 5xx | pageErrors=0 · bad5xx=0 | 🟢 |

---

## 4. Key network stamps

```text
GET  /api/hrm/attendance/ot-types/effective?company_id=main
  → 200 HRM-ATT-OT-200  total=1  code=qc_spot_ot_msk8  nameVi≈QC spot OT

POST /api/hrm/attendance/overtime-requests  invent zz_invent_att_ot_k9vpoo
  → 400 HRM-ATT-OT-TYPE-KEY  (LIVE reprobe this seat · L1 ATTOTQA-MSK8VETU RETAIN)
  msg: overtime_type not in effective OT-type catalog (invent forbidden when EFF ≠ empty)

GET  /api/hrm/attendance/ot-types/effective  (FE browser hook)
  → 200 HRM-ATT-OT-200

POST /api/hrm/attendance/overtime-requests
  body: overtime_type=qc_spot_ot_msk8 · coefficient=1.5
  → 201 HRM-OT-201

GET  /api/hrm/attendance/overtime-requests?company_id=main (after F5)
  → 200  (row retained · Nest badge)
```

**DevTools confirm:** submit body uses Nest **code** (not i18n-only weekday/weekend/holiday as sole SoT when EFF>0).

**Picker snapshot:** option text includes Nest nameVi + `(x1.5)` coeff display-ready (≠ payroll formula LIVE).

---

## 5. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| **`formula_LIVE`** | **`false`** — defaultCoeff display-only |
| L1 stamp `ATTOTQA-MSK8VETU` | **RETAIN** · KEY LIVE |
| ATT-CODE / leave / WS / SHIFT / CTR | **SEAL RETAIN** |
| **R-PLT-ATT-OT-FE-ADMIN** | **NOTE/HOLD** — no invent admin panel |
| Module ATT UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed / ensureDefault | **none** |
| UF 🟢 module claim | **DENIED** — slice Condition FE-01 only |

---

## 6. Defect / residual register

| ID | Severity | Summary | Status |
|----|----------|---------|--------|
| **R-PLT-ATT-OT-FE-01** | P2 | FE OvertimeRequestTab Nest EFF picker + Nest code submit proven browser U65 | **CLOSABLE** → QC close |
| Invent UI free-entry | OBS | Hard Select-only — invent via UI N/A; L1 KEY proven API | **PASS_WITH_OBS ACCEPT** |
| AC-PLT-ATT-OT-01c empty | — | Not isolatable without wipe | **NOTE_BLOCKED** ACCEPT |
| **R-PLT-ATT-OT-FE-ADMIN** | P2 NOTE | Admin FE panel still ABSENT | **HOLD RETAIN** |

No new P0/P1. No seed. No module ATT UAT claim. No formula LIVE claim.

---

## 7. command_table

| Command | Result |
|---------|--------|
| `pnpm run qc:dev-stack` | hrm/xbos/portal **200** (Windows UV_HANDLE_CLOSING noise ignore) |
| `node scripts/qa/_tmp-po-hrm-dynamic-config-platform-ot-type-catalog-qa-fe-01.mjs` | exit **0** · overall **PASS_WITH_OBS** · stamp `ATTOTQAFE-MSK9TJDM` · condition **CLOSABLE** |

---

## 8. completion_report

**Closed:** Browser U65 verify after FE-01 rebind. Stamp `ATTOTQAFE-MSK9TJDM`. EFF>0 reused Nest `qc_spot_ot_msk8` (no seed). Click path: Chấm công → Quản lý đơn → Đăng ký làm thêm → Thêm đơn → Select shows Nest **nameVi** + coeff hint (not sole hardcode-3). POST overtime-requests **201** `HRM-OT-201` with Nest **code**; FE after 2xx + F5 retain Nest badge. Invent: Select-only OBS + API invent **400 `HRM-ATT-OT-TYPE-KEY`** (L1 `ATTOTQA-MSK8VETU` RETAIN). EFF=0 NOTE_BLOCKED + unit cite. **R-PLT-ATT-OT-FE-01 CLOSABLE**. **R-PLT-ATT-OT-FE-ADMIN** HOLD. Honesty false · C-SLICE · DENY module ATT UAT / Phase1 / seed / formula LIVE.

**Residual:** none blocking Condition close — QC should seal GWC Condition **R-PLT-ATT-OT-FE-01**; FE-ADMIN remains NOTE/HOLD.

| Field | Value |
|-------|--------|
| **next_owner** | **qc** |
| **ack_status** | **PASS_WITH_OBS** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qa-fe-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QC-FE-01
from_role: pm
to_role: qc
lane: governance
priority: P2
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-FE-01 PASS_WITH_OBS
condition_close: R-PLT-ATT-OT-FE-01

entry_criteria:
- QA-FE evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qa-fe-01.md
  stamp ATTOTQAFE-MSK9TJDM · machine JSON _tmp-…-qa-fe-01-browser.json
- L1 seal RETAIN ATTOTQA-MSK8VETU · invent KEY LIVE
- FE-01 READY parent · QC GWC L1 already sealed
- U65 zero-seed · honesty attendance/payroll/formula=false · C-SLICE-≠-MODULE
- FE-ADMIN R-PLT-ATT-OT-FE-ADMIN remains NOTE/HOLD (do not invent)

task:
1. Audit browser evidence: click path Quản lý đơn → Đăng ký làm thêm;
   Select Nest nameVi (not sole weekday|weekend|holiday); GET ot-types/effective 200;
   POST overtime-requests 201 Nest code; FE after 2xx + F5.
2. Confirm invent OBS: Select-only + L1 400 HRM-ATT-OT-TYPE-KEY — ACCEPT PASS_WITH_OBS.
3. Confirm EFF=0 NOTE_BLOCKED + unit cite ACCEPT (no wipe).
4. CLOSE Condition R-PLT-ATT-OT-FE-01; RETAIN FE-ADMIN HOLD; DENY flip *_ready / formula LIVE / module ATT UAT.
5. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qc-fe-01.md
   ack GO | GWC | NO-GO; next_dispatch if residual.

FORBIDDEN: reopen L1 BE seal · invent FE admin · seed · claim Phase1/module ATT UAT · flip ready
```

---

```yaml
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-QA-FE-01
from_role: qa
to_role: pm
stamp: ATTOTQAFE-MSK9TJDM
stamp_l1_retain: ATTOTQA-MSK8VETU
condition_r_plt_att_ot_fe_01: CLOSABLE
ack_status: PASS_WITH_OBS
overall: PASS_WITH_OBS
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-qa-fe-01.md
machine_json: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ot-type-catalog-qa-fe-01-browser.json
next_owner: qc
honesty:
  attendance_uat_ready: false
  payroll_e2e_ready: false
  formula_LIVE: false
  C-SLICE: true
  U65: zero-seed
  FE_ADMIN: HOLD
```
