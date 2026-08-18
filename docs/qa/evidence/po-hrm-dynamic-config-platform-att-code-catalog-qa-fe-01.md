# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QA-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01` **READY_FOR_QA** · closes Condition **R-PLT-ATT-CODE-FE-01** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` · `:5173` |
| **Stamp** | `ATTCODEQAFE-MSKCJA95` |
| **stamp_l1 RETAIN** | **`ATTCODEQA-MSK4T1A5`** · invent → **400 `HRM-ATT-CODE-KEY`** LIVE |
| **U65** | zero-seed · **browser** FE click path · admin Network POST attendance-codes only if EFF=0 (this run) · invent API spot ≠ UF 🟢 |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `formula_LIVE=false` · OT-TYPE L1/`ATTOTQA-MSK8VETU` · OT-TYPE FE/`ATTOTQAFE-MSK9TJDM` · COMP L1/`ATTCOMPQA-MSKARXQU` · COMP FE/`ATTCOMPQAFE-MSKBBEJW` · leave/`ATTLEAVEQA-MSJ7CPJH` · WS/`ATTWSQA-MSJC3IN9` · SHIFT/`ATTSHIFTQA-MSK5FXP3` · CTR/`CTRTPLQA-MSK7U4CG` · **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_OBS** — **R-PLT-ATT-CODE-FE-01 CLOSABLE** |
| **condition_verify** | **R-PLT-ATT-CODE-FE-01** → **CLOSABLE** (Nest Edit status picker + Nest PATCH + F5 badge proven) |
| **change_mode** | ADD verify · no `apps/**` · no seed · no ready flip · **FORBIDDEN** invent FE-ADMIN · **FORBIDDEN** invent LVRULE 01g · **FORBIDDEN** reopen COMP/OT/CODE L1 |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Vitest re-run | `useAttAttendanceCodesEffective` **17** + `useAttendanceRecords` **12** = **29/29** exit **0** |
| Git HEAD | (runner stamp env.commit) |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-code-catalog-qa-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-code-catalog-qa-fe-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-code-catalog-qa-fe-01/` (01..06 png) |
| FE parent | [`po-hrm-dynamic-config-platform-att-code-catalog-fe-01.md`](po-hrm-dynamic-config-platform-att-code-catalog-fe-01.md) READY_FOR_QA |
| SA Option A | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md) LOCKED |
| L1 QA | [`po-hrm-dynamic-config-platform-att-code-catalog-qa-01.md`](po-hrm-dynamic-config-platform-att-code-catalog-qa-01.md) stamp **`ATTCODEQA-MSK4T1A5`** |
| QC Condition | [`po-hrm-dynamic-config-platform-att-code-catalog-qc-01.md`](po-hrm-dynamic-config-platform-att-code-catalog-qc-01.md) **R-PLT-ATT-CODE-FE-01** |

**spec_ref:** AC-PLT-ATT-CODE-01 / 01c / 01f · VAL-ATT-CODE-CNS-06 · BA-01 · FE-01 Nest rebind AttendanceRecordsTable

**Seed:** none · **ensureDefault:** none · **FE-ADMIN invent:** **DENIED / HOLD**.

---

## 2. Click path (U65 · HDSD · R-PLT-ATT-CODE-FE-01)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Nest ATT-CODE EFF baseline | **total=0** → admin Network **POST** attendance-codes `wfh_qa_fe_mskcja95` **201** `HRM-ATT-CODE-201` (U65 ≠ seed) → EFF **total=1** |
| 2 | Invent API spot `zz_invent_att_code_mskcja95` (PATCH status) | **400 `HRM-ATT-CODE-KEY`** · L1 stamp **RETAIN** |
| 3 | **Chấm công** → **Dữ liệu chấm công** | `attendance-tab-menu` · menuitem · `attendance-records-table` visible |
| 4 | GET `/attendance/attendance-codes/effective` (FE hook) | **200** `HRM-ATT-CODE-200` (Network count≥1) |
| 5 | Filter Select `att-attendance-code-filter` | Nest **nameVi/symbol** `WF — QA FE ATT Code Nest mskcja95` — not sole closed-4 |
| 6 | Row kebab → **Sửa** → Edit dialog | `attendance-record-edit-status` · `attendance-record-edit-save` |
| 7 | Edit status Select options | Nest only: `WF — QA FE ATT Code Nest mskcja95` · **not** `early_leave`/`on_leave` sole · bootstrap hint **hidden** |
| 8 | Select Nest code → **Lưu** | Network **PATCH** `…/records/:id/status` body `status=wfh_qa_fe_mskcja95` → **200** `HRM-ATT-202` |
| 9 | FE sau 2xx | Badge **QA FE ATT Code Nest mskcja95** |
| 10 | F5 · re-nav Dữ liệu chấm công | Badge retained Nest nameVi · GET effective 200 again |
| 11 | Invent UI | Hard **Select-only** — no free-text invent (PASS_WITH_OBS OK) |
| 12 | EFF=0 branch | **NOTE_BLOCKED** — no wipe; cite FE-01 vitest **29** (bootstrap pending\|present\|absent\|leave) |
| 13 | OT/COMP Nest RETAIN | GET ot-types/effective **200** total=1 · ot-comp-types/effective **200** total=1 · no reopen |
| 14 | FE-ADMIN | invent FE-ADMIN **HOLD_ABSENT_OK** |

**HDSD / testids:** `attendance-tab-menu` · `attendance-records-table` · `att-attendance-code-filter` · `attendance-record-edit-status` · `attendance-record-edit-save` · `att-attendance-code-catalog-bootstrap-hint` (hidden when EFF>0) · `att-code-edit-bootstrap-hint` (hidden)

**Screens:** `01-attendance` · `02-records-list` · `03-edit-dialog` · `04-status-nest-selected` · `05-after-patch` · `06-f5-records`

---

## 3. UF-ATT-CODE-FE matrix (dispatch)

| UF | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **1 L0** | stack 200 | 200/200/200 | 🟢 |
| **2 Vitest** | hook/table 29 | **29/29** | 🟢 |
| **3 EFF>0 Select Nest** | GET attendance-codes/effective 200 · options Nest code+nameVi/symbol | 200 `HRM-ATT-CODE-200` · option `WF — QA FE ATT Code Nest mskcja95` · onlyBoot=false · bootstrap hint hidden | 🟢 |
| **4 Lưu/PATCH Nest** | PATCH 2xx Nest code · FE after 2xx | **200** `HRM-ATT-202` · `status=wfh_qa_fe_mskcja95` · badge Nest nameVi | 🟢 |
| **5 F5 badge Nest** | retain Nest | afterF5=`QA FE ATT Code Nest mskcja95` · nestBadge=true | 🟢 |
| **6 EFF=0 bootstrap** | pending\|present\|absent\|leave + hint | **NOTE_BLOCKED** — EFF>0 after admin ensure · unit cite 29/29 | 🟡 documented |
| **7 invent → KEY** | 400 `HRM-ATT-CODE-KEY` + toast if testable | Select-only UI · API invent **400 KEY** · toast soft OBS | 🟢 / 🟡 Select-only OBS |
| **8 early_leave\|on_leave** | not sole Edit unless Nest has them | early_leave=false · on_leave=false · Nest sole option | 🟢 |
| **9 OT/COMP RETAIN** | no regression | ot effective 200/1 · comp effective 200/1 | 🟢 |

---

## 4. Spot AC table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200/200/200 | 🟢 |
| **Vitest** | 29 claimed | 29/29 exit 0 | 🟢 |
| **EFF>0 ensure** | active catalog via Network POST if needed OR existing | created N=1 `wfh_qa_fe_mskcja95` (baseline EFF=0) | 🟢 |
| **FE GET effective** | Network GET attendance-codes/effective 200 | 200 `HRM-ATT-CODE-200` (×2 incl F5) | 🟢 |
| **VAL-ATT-CODE-CNS-06 / AC-01** | EFF>0 Select Nest ≠ sole hardcode-4 | Nest nameVi+symbol visible · onlyBoot=false | 🟢 |
| **AC submit Nest** | Nest code in PATCH · 2xx · FE update | **200** · status Nest · badge Nest | 🟢 |
| **FE + F5** | badge retain Nest | nestBadge=true | 🟢 |
| **Invent UI** | free entry OR Select-only + L1 KEY | Select-only · API invent **400 KEY** | 🟡 PASS_WITH_OBS |
| **AC-PLT-ATT-CODE-01c** | EFF=0 bootstrap without wipe | **NOTE_BLOCKED** · unit cite FE-01 | 🟡 documented |
| **early_leave not sole** | not sole Edit SoT | confirmed | 🟢 |
| **L1 KEY LIVE** | invent → 400 `HRM-ATT-CODE-KEY` | confirmed this seat (PATCH invent reprobe) · stamp L1 RETAIN | 🟢 |
| **OT/COMP RETAIN** | no regression / no reopen | Network GET both effective 200 | 🟢 |
| **FE-ADMIN** | HOLD / no invent panel | HOLD_ABSENT_OK | 🟢 |
| **01H honesty** | ready=false · formula false · C-SLICE | locked | 🟢 |
| **Console** | no Uncaught / mojibake / 5xx | pageErrors=0 · bad5xx=0 | 🟢 |

---

## 5. Key network stamps

```text
GET  /api/hrm/attendance/attendance-codes/effective?company_id=main
  → 200 HRM-ATT-CODE-200  total=1  code=wfh_qa_fe_mskcja95  nameVi=QA FE ATT Code Nest mskcja95  symbol=WF

POST /api/hrm/attendance/attendance-codes
  body: code=wfh_qa_fe_mskcja95 · nameVi=QA FE ATT Code Nest mskcja95 · symbol=WF
  → 201 HRM-ATT-CODE-201  (admin Network ensure · U65 ≠ seed)

PATCH /api/hrm/attendance/records/{id}/status  invent zz_invent_att_code_mskcja95
  → 400 HRM-ATT-CODE-KEY  (LIVE this seat · L1 ATTCODEQA-MSK4T1A5 RETAIN)
  msg: status '…' is not in effective attendance-code catalog (free-text invent forbidden when EFF ≠ empty)

PATCH /api/hrm/attendance/records/72df32de-…/status
  body: status=wfh_qa_fe_mskcja95
  → 200 HRM-ATT-202

GET  /api/hrm/attendance/ot-types/effective
  → 200 HRM-ATT-OT-200  total=1  (OT-TYPE RETAIN)

GET  /api/hrm/attendance/ot-comp-types/effective
  → 200 HRM-ATT-OTC-200  total=1  (COMP RETAIN)
```

**DevTools confirm:** Edit Select shows Nest `WF — {nameVi}`; PATCH body uses Nest **code** (not closed-4 sole SoT when EFF>0).

**Picker snapshot:** Edit option text = `WF — QA FE ATT Code Nest mskcja95`; Filter Nest name hit=1; bootstrap hints hidden.

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| **`formula_LIVE`** | **`false`** |
| L1 stamp `ATTCODEQA-MSK4T1A5` | **RETAIN** · KEY LIVE |
| OT-TYPE L1/FE · COMP L1/FE | **RETAIN** · **DENIED** reopen |
| leave / WS / SHIFT / CTR | **SEAL RETAIN** |
| Invent FE-ADMIN panel | **DENIED / HOLD_ABSENT_OK** |
| Invent LVRULE 01g | **DENIED / HOLD** |
| Module ATT UAT / UF 🟢 whole ATT / Phase1 DONE | **DENIED** (`C-SLICE-≠-MODULE`) |
| Seed / `pnpm seed:*` | **none** |

---

## 7. Residual / OBS

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| **Select-only invent UI** | P3 OBS | Expected — KEY proven via API invent when EFF>0; toast path not separately asserted (no free-text entry) | QC ACCEPT |
| **EFF=0 bootstrap live** | P3 NOTE_BLOCKED | No wipe active Nest rows (U65); vitest 29 covers bootstrap pending\|present\|absent\|leave + hint | QC ACCEPT |
| **R-PLT-ATT-CODE-FE-01** | — | **CLOSABLE** this seat | **qc** narrow Condition close |
| **R-PLT-ATT-CODE-FE-ADMIN** | P2 HOLD | Settings invent ABSENT — **RETAIN HOLD** · DENY invent | pm / future sponsor |

---

## 8. Handoff

- **completion_report:** Closed browser U65 UF-ATT-CODE-FE matrix for Nest attendance-code picker on AttendanceRecordsTable (Dữ liệu chấm công Edit status). L0 200 · vitest **29/29** · EFF ensure admin Network (baseline 0→1) · Select Nest `WF — nameVi` · PATCH **200** Nest code · FE+F5 badge Nest · invent **400 `HRM-ATT-CODE-KEY`** · early_leave/on_leave not sole · OT/COMP RETAIN · EFF=0 NOTE_BLOCKED · FE-ADMIN HOLD. Condition **R-PLT-ATT-CODE-FE-01 CLOSABLE**. DENY seed / invent FE-ADMIN / invent LVRULE / reopen COMP·OT·CODE L1 / flip ready / formula LIVE / module ATT UAT. Stamp **`ATTCODEQAFE-MSKCJA95`**. overall **PASS_WITH_OBS**.
- **next_owner:** **qc**
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qa-fe-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-FE-01
from_role: pm
to_role: qc
lane: governance

QA-FE-01 PASS_WITH_OBS stamp ATTCODEQAFE-MSKCJA95 closed browser Nest attendance-code picker.
Closes QC Condition R-PLT-ATT-CODE-FE-01 (narrow).
entry: L1 GWC RETAIN docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qc-01.md · KEY ATTCODEQA-MSK4T1A5 HRM-ATT-CODE-KEY LIVE
       QA-FE evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qa-fe-01.md
       FE parent READY_FOR_QA closed · vitest 29/29 · U65 zero-seed
exit: GWC or GO_WITH_CONDITIONS · Condition R-PLT-ATT-CODE-FE-01 CLOSED|CLOSABLE wording
      ACCEPT Select-only invent OBS + EFF=0 NOTE_BLOCKED
      RETAIN OT/COMP Nest · L1 KEY · CLOCK/SHEETS/LEAVE · Face HOLD · FE-ADMIN HOLD
      DENY flip attendance_uat_ready / payroll_e2e_ready / formula LIVE / module ATT UAT / reopen COMP·OT·CODE L1 / invent FE-ADMIN / invent LVRULE / UF 🟢 whole ATT
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-qc-fe-01.md
must_keep: OT/COMP Nest · L1 KEY · CLOCK/SHEETS/LEAVE · Face HOLD
```

---

## 9. Footer

| Item | Value |
|------|-------|
| Stamp | `ATTCODEQAFE-MSKCJA95` |
| overall | **PASS_WITH_OBS** |
| ack_status | **PASS_TO_PM** |
| condition | **R-PLT-ATT-CODE-FE-01 = CLOSABLE** |
| Length gate | WriteAllText NFD `.git` tree · expect ≥3KB |
| must_keep honored | OT/COMP Nest · L1 KEY · CLOCK/SHEETS/LEAVE · Face HOLD |
