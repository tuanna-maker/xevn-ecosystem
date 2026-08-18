# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-FE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01` **READY_FOR_QA** · closes **R-PLT-ATT-SHIFT-CNS-02** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` |
| **Stamp** | `ATTSHIFTQAFE-MSK6AJ8Z` |
| **stamp_l1 RETAIN** | **`ATTSHIFTQA-MSK5FXP3`** |
| **U65** | zero-seed · **browser** FE click path · invent API spot ≠ UF 🟢 |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · ATT-CODE/`ATTCODEQA-MSK4T1A5` · leave/`ATTLEAVEQA-MSJ7CPJH` · WS/`ATTWSQA-MSJC3IN9` · EMP/SI/CTR · aggregate **SEAL RETAIN** · R-PLT-ATT-CODE-FE-01 **HOLD** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** — **R-PLT-ATT-SHIFT-CNS-02 CLOSED** |
| **change_mode** | ADD · no `apps/**` · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01/` |
| FE parent | [`po-hrm-dynamic-config-platform-att-shift-catalog-fe-01.md`](po-hrm-dynamic-config-platform-att-shift-catalog-fe-01.md) READY_FOR_QA |
| QC Condition | [`po-hrm-dynamic-config-platform-att-shift-catalog-qc-01.md`](po-hrm-dynamic-config-platform-att-shift-catalog-qc-01.md) **R-PLT-ATT-SHIFT-CNS-02** |

**spec_ref:** VAL-ATT-SHIFT-CNS-02 · AC-PLT-ATT-SHIFT-01 · BA-01 · FE-01 Nest rebind

**Seed:** none · **ensureDefault:** none · **ATT-CODE invent FE:** **DENIED**.

---

## 2. Click path (U65 · HDSD · CNS-02)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | Nest EFF before | session prior FE admin CREATE: **N=0→1** (`qa_fe_shift_msk64coh`) then **N=1→2** (`qa_fe_shift_b_msk66y`) via **Ca** tab `att-shifts-add` (U65 no seed). Final run baseline **N=2** |
| 2 | **Chấm công** → **Quản lý đơn** → **Đề nghị đổi ca** | `requests-menu-change-shift` · `att-shift-change-precision` |
| 3 | GET `/work-shifts/effective` | **200** `HRM-WS-200` total=2 (FE hook) |
| 4 | Open **Thêm** create dialog | `att-shift-change-add-dialog-precision` |
| 5 | Picker «Ca hiện tại / Ca đề nghị» | Nest display-ready: `QA FE Ca Nest B msk66y0i (14:00 - 22:00)` · `QA FE Ca Nest msk64coh (08:00 - 17:00)` — **not** closed 5-id sole |
| 6 | Select Nest · date · emp · reason → Thêm | Network **POST** body Nest **codes** |
| 7 | FE sau 2xx | list shows Nest names · row present |
| 8 | F5 · re-nav Đổi ca | GET list total=1 · Nest labels còn |
| 9 | Invent spot (API only) | 400 `HRM-VAL-001` (invalid emp) — **not** UF; L1 KEY seal `ATTSHIFTQA-MSK5FXP3` **RETAIN** |
| 10 | Empty active=0 | **NOTE_BLOCKED** — no wipe/seed |

**HDSD ids:** `att-shifts-add` · `att-shift-form-dialog` · `requests-menu-change-shift` · `att-shift-change-precision` · `att-shift-change-add-dialog-precision`

---

## 3. Spot AC table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200/200/200 | 🟢 |
| **AC-PLT-ATT-SHIFT-01d** | Nest active>0 via admin FE CREATE if needed | Session: FE CREATE N 0→1→2; final N=2 | 🟢 |
| **VAL-ATT-SHIFT-CNS-02** | active>0 picker Nest labels ≠ closed 5-id | 2 Nest names+times; `onlyBootText=false` · EFF GET 200 | 🟢 |
| **AC-PLT-ATT-SHIFT-01 submit** | Nest code in POST · 2xx · FE update | **201** `HRM-SC-201` · `current_shift=qa_fe_shift_b_msk66y` · `requested_shift=qa_fe_shift_msk64coh` | 🟢 |
| **FE + F5** | list persist after reload | feShowsNest · f5ok · list GET total=1 | 🟢 |
| **AC-PLT-ATT-SHIFT-01c** | empty bootstrap without wipe | **NOTE_BLOCKED** | 🟡 documented |
| **01b invent spot** | prefer L1 KEY seal | API 400 VAL-001 (bad emp) · KEY cite L1 · **not UF 🟢** | ⬜ HOLD |
| **01H honesty** | ready=false · seals · C-SLICE | locked | 🟢 |

---

## 4. Key network stamps

```text
GET /api/hrm/attendance/work-shifts/effective?company_id=main
  → 200 HRM-WS-200  total=2  (Nest codes qa_fe_shift_b_msk66y · qa_fe_shift_msk64coh)

POST /api/hrm/attendance/shift-change-requests
  body: current_shift=qa_fe_shift_b_msk66y · requested_shift=qa_fe_shift_msk64coh
  → 201 HRM-SC-201

GET /api/hrm/attendance/shift-change-requests?company_id=main (after F5)
  → 200 HRM-SC-200  total=1
```

**DevTools confirm:** submit body uses Nest **code** (not i18n name / not invent).

---

## 5. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`attendance_uat_ready`** | **`false`** — **DENIED** flip |
| **`payroll_e2e_ready`** | **`false`** — **DENIED** flip |
| ATT-CODE `ATTCODEQA-MSK4T1A5` · R-PLT-ATT-CODE-FE-01 HOLD | **SEAL RETAIN** — no invent FE ATT-CODE |
| leave `ATTLEAVEQA-MSJ7CPJH` · WS `ATTWSQA-MSJC3IN9` | **SEAL RETAIN** |
| EMP / SI / CTR / aggregate | **SEAL RETAIN** |
| L1 stamp `ATTSHIFTQA-MSK5FXP3` | **RETAIN** |
| Module ATT UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed / ensureDefault | **none** |
| UF 🟢 module claim | **DENIED** — slice CNS-02 only |

---

## 6. Defect / residual register

| ID | Severity | Summary | Status |
|----|----------|---------|--------|
| **R-PLT-ATT-SHIFT-CNS-02** | P2 | FE ShiftChange Nest EFF picker + Nest code submit proven browser U65 | **CLOSED** |
| AC-PLT-ATT-SHIFT-01c empty | — | Not isolatable without wipe | **NOTE_BLOCKED** ACCEPT |

No new P0/P1. No ATT-CODE invent. No module ATT UAT claim.

---

## 7. command_table

| Command | Result |
|---------|--------|
| `pnpm run qc:dev-stack` | hrm/xbos/portal **200** |
| `node scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01.mjs` | exit **0** · overall **PASS** · stamp `ATTSHIFTQAFE-MSK6AJ8Z` |

---

## 8. completion_report

**Closed:** Browser U65 CNS-02 after FE-01. Stamp `ATTSHIFTQAFE-MSK6AJ8Z`. Nest active established via FE Ca admin CREATE (session N 0→2, no seed). Đổi ca create pickers show Nest display-ready labels (name + time) — not closed 5-id sole. Submit POST **201** `HRM-SC-201` with Nest **codes** in body; FE list + F5 retain. **R-PLT-ATT-SHIFT-CNS-02 CLOSED**. L1 `ATTSHIFTQA-MSK5FXP3` RETAIN. Empty path NOTE_BLOCKED. Honesty false · seals RETAIN · C-SLICE · DENY module ATT UAT / Phase1 / invent FE ATT-CODE / seed.

**Residual:** none for Condition CNS-02 — QC should close GWC Condition **R-PLT-ATT-SHIFT-CNS-02**.

| Field | Value |
|-------|--------|
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-FE-01 PASS_TO_PM stamp ATTSHIFTQAFE-MSK6AJ8Z
ref_qa: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01.md
ref_qc_prior: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qc-01.md
stamp_l1: ATTSHIFTQA-MSK5FXP3 RETAIN

## entry_criteria
- Read QA-FE-01 browser evidence + machine JSON · FE-01 READY closed
- Prior QC-01 GWC Condition R-PLT-ATT-SHIFT-CNS-02
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE
- RETAIN: ATTCODEQA-MSK4T1A5 · leave/WS · EMP/SI/CTR · aggregate · ATT-CODE FE HOLD · L1 invent KEY seal

## task (narrow GWC Condition close)
1) Audit QA-FE-01: picker Nest labels when active>0 · POST body Nest codes · 201 HRM-SC-201 · FE+F5
2) Close Condition R-PLT-ATT-SHIFT-CNS-02 → CLOSED (or re-open with fail reason)
3) Keep L1 SEAL ATTSHIFTQA-MSK5FXP3 · do not flip ready · do not claim module ATT UAT
4) Honesty false retained · seals RETAIN · U65 zero-seed observe-only

## cấm
seed · flip attendance_uat/payroll_e2e · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · module ATT UAT · Phase1 DONE · UF 🟢 module promote

## exit
PASS_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qc-02.md
```

---

## 9. Self-check

- [x] Browser U65 click path · Network Nest code · FE after 2xx · F5
- [x] Nest active>0 (admin FE CREATE earlier in session) · picker Nest labels
- [x] R-PLT-ATT-SHIFT-CNS-02 CLOSED · L1 stamp RETAIN
- [x] Honesty false · seals RETAIN · C-SLICE · DENIED module ATT UAT
- [x] Empty NOTE_BLOCKED · invent not UF 🟢
- [x] completion_report · next_owner **qc** · next_dispatch_prompt · ack_status **PASS_TO_PM**
