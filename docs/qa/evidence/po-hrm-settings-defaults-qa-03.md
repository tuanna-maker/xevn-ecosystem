# Evidence — `PO-HRM-SETTINGS-DEFAULTS-QA-03`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-QA-03` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution — **U65 browser Settings defaults UF** |
| **priority** | P2 |
| **resume_chunk** | K6.3 |
| **parent** | `PO-HRM-SETTINGS-DEFAULTS-FE-01` |
| **closes** | QC-02 CONDITION **FE Settings UF deferred** |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · portal `companyId=main` |
| **Stamp** | `SETDEFQA3-MSIWEG3M` |
| **U65** | zero-seed · **browser-only** FE click path · no `pnpm seed:*` |
| **Honesty** | **`payroll_e2e_ready=false`** · **DENIED** module Settings UAT / AMIS DONE / J-* / Phase1 / flip ready |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **journey_l25** | **N/A deferred** — Settings UF seat · no J-* promote · `C-SLICE-≠-MODULE` |
| **Runner** | `scripts/qa/_tmp-po-hrm-settings-defaults-qa-03.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-defaults-qa-03-browser.FINAL.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-defaults-qa-03/01..09-*.png` |
| **Git HEAD** | `dc930c5` |
| **ack_status** | **`PASS_TO_PM`** |
| **overall** | **PASS** · **12/12** AC |

### Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** (badge `settings-defaults-honesty-badge`) |
| Module Settings / payroll UAT | **DENIED** |
| AMIS DONE / J-* / Phase1 DONE | **DENIED** |
| FE formula / GTGC invent | **DENIED** — display-ready only |
| SRC-02 resolve | draft preview · **no** `employeePackageId` write |
| Seed | **none** |
| L1 GWC (QC-02) | **SEAL retained** — not reopened |

---

## 1. Environment / L0

| Check | Result |
|-------|--------|
| L0 portal `:5173` | **200** |
| L0 HRM `:28001/api/hrm` | **200** |
| L0 XBOS `:28002` | **200** |
| First attempt (stamp `SETDEFQA3-MSIW4ODG`) | SI F5 / POS FAIL — HRM transient **500** storm mid-reload (ENV OBS); HRM recovered |
| Retest (stamp `SETDEFQA3-MSIWEG3M`) | **PASS** 12/12 |

**ENV OBS (not product FAIL):** first run hit concurrent GET 500 on `insurance-rate-cfg` / `salary-components` / POS list during F5; process later returned HRM-HEALTH-200. Retest with wait-for-200 + reload CTA closed F5 path.

---

## 2. Click path (U65 · HDSD inventory)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Login `ceo@xe.vn` · inject portal auth · `companyId=main` | loginApi ok |
| 1 | **Cài đặt** → tab **Mặc định thuế/BH/PC** (`settings-tab-settings-defaults`) | Panel `settings-defaults-panel` · badge `payroll_e2e_ready=false` |
| 2 | **Thuế:** personal `11.500.000` · dependent `4.400.000` → **Lưu thuế** | PUT ×4 **200** `HRM-SET-TAX-200` |
| 3 | F5 → tab lại | inputs persist `11500000` / `4400000` |
| 4 | **BH:** `BHXH_QA3_msiweg3m` · 8% / 17.5% · ceiling · **Tạo cấu hình BH** | POST **201** `HRM-SET-SI-201` · row in `settings-si-list-table` |
| 5 | F5 → tab (+ reload if needed) | row `BHXH_QA3_msiweg3m` còn |
| 6 | **PC vị trí:** `positionKey=CEO` (job_titles catalog) · Select PC `PC_RET_AC81` · amount `750000` → **Tạo chính sách PC** | POST **201** `HRM-SET-POS-201` · catalogOpts=14 |
| 7 | F5 → tab | list row **CEO** còn |
| 8 | **Resolve draft** SRC-02 | GET resolve **200** · `policyId=4309d1f0-…` · lines=1 · **no** `employeePackageId` |
| 9 | Honesty copy | «không công thức FE» · badge false |

**HDSD ids:** `settings-tab-settings-defaults` · `settings-defaults-panel` · `settings-defaults-honesty-badge` · `hdsd-settings-tax-*` · `hdsd-settings-si-*` · `settings-si-list-table` · `hdsd-settings-pos-*` · `settings-pos-list-table` · `settings-pos-resolve-result`

**Seed:** none.

---

## 3. AC map

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| L0-STACK | portal+HRM+XBOS 200 | all 200 | 🟢 |
| AC-SETDEF-TAB | tab visible + click | ok | 🟢 |
| AC-SETDEF-PANEL | panel visible | ok | 🟢 |
| AC-SETDEF-HONESTY | badge `payroll_e2e_ready=false` | exact | 🟢 |
| AC-SETDEF-TAX-SAVE | PUT 200 HRM-SET-TAX-200 | 4× 200 | 🟢 |
| AC-SETDEF-TAX-F5 | values persist | 11500000 / 4400000 | 🟢 |
| AC-SETDEF-SI-CREATE | POST 201 + list row | `BHXH_QA3_msiweg3m` | 🟢 |
| AC-SETDEF-SI-F5 | row after F5 | true | 🟢 |
| AC-SETDEF-POS-CREATE | catalog PC + POST 201 | 14 opts · `PC_RET_AC81` · 201 | 🟢 |
| AC-SETDEF-POS-F5 | CEO row after F5 | true | 🟢 |
| AC-SETDEF-POS-RESOLVE | 200 · no emp write | policy hit · inventEmpPkg=false | 🟢 |
| AC-SETDEF-NO-INVENT | no FE formula invent | honesty copy present | 🟢 |

**Out of scope / DENIED:** module Settings UAT · AMIS DONE · J-* · `payroll_e2e_ready=true` · PAY process tax/SI consumer · reopen L1 D-SETDEF-* .

---

## 4. Key network stamps (retest)

```text
PUT  /api/hrm/settings/company-settings                         → 200 HRM-SET-TAX-200 (×4)
POST /api/hrm/settings/insurance-rate-cfg                       → 201 HRM-SET-SI-201  key=BHXH_QA3_msiweg3m
POST /api/hrm/settings/position-compensation-policies           → 201 HRM-SET-POS-201 positionKey=CEO lines=PC_RET_AC81
GET  …/position-compensation-policies/resolve?positionKey=CEO   → 200 HRM-SET-POS-200 policyId=4309d1f0-… no employeePackageId
```

---

## 5. Notes / OBS

| Item | Class | Note |
|------|-------|------|
| First-run HRM GET 500 during F5 | **ENV OBS** | Superseded by retest PASS; not filed product residual |
| Free-text `positionKey` (e.g. `QA_POS_*`) | **PRODUCT SPEC** | BE `HRM-SET-POS-400-KEY` — must be **job_titles** catalog (FE-01 example `CEO` correct) |
| Probe CEO create/retire before browser | L1 hygiene | Cleared active CEO so browser create not 409; not seed |

---

## 6. Defect register

| ID | Severity | Summary | Status |
|----|----------|---------|--------|
| — | — | No open product defect on Settings defaults browser UF | — |
| QC-02 FE UF CONDITION | CONDITION | **CLOSED** by this seat PASS | **CLOSED** |

---

## completion_report

### Closed

1. U65 browser UF Settings defaults after FE-01 READY — TAX Lưu→2xx→F5, SI create/list→2xx→F5, POS create+PC catalog+SRC-02 resolve→2xx→F5.
2. Honesty badge `payroll_e2e_ready=false` · no FE formula invent · resolve no emp C&B write.
3. QC-02 CONDITION **FE Settings UF deferred** closed for this slice.
4. Stamp `SETDEFQA3-MSIWEG3M` · 12/12 PASS.

### Residual

- `C-SLICE-≠-MODULE` — seat PASS ≠ module Settings / payroll UAT / AMIS DONE.
- ENV OBS first-run Nest 500 storm — monitor only; not blocking this PASS.
- PAY process consumers of tax/SI defaults **out of scope**.

### Explicit non-claims

- Not module UAT · not AMIS DONE · not J-* promote · **`payroll_e2e_ready=false`** · not Phase 1 DONE.

---

## next_owner

**qc**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-QC-03
from_role: pm
to_role: qc
lane: governance
priority: P2
parent: PO-HRM-SETTINGS-DEFAULTS-QA-03
ref_qa: docs/qa/evidence/po-hrm-settings-defaults-qa-03.md
ref_fe: docs/qa/evidence/po-hrm-settings-defaults-fe-01.md
ref_qc02: docs/qa/evidence/po-hrm-settings-defaults-qc-02.md

## Goal
Narrow QC on U65 browser Settings defaults UF PASS (closes QC-02 FE CONDITION):
- Audit QA-03 12/12 + machine FINAL stamp SETDEFQA3-MSIWEG3M
- Confirm TAX PUT 200 → F5 · SI POST 201 → F5 · POS POST 201 + catalog PC + resolve SRC-02 no emp write
- Confirm honesty payroll_e2e_ready=false · DENY module UAT / AMIS / J-* / C-SLICE as module GO
- Verdict GO / GWC / NO-GO for FE UF seat only (L1 GWC SEAL retained)

## exit_criteria
docs/qa/evidence/po-hrm-settings-defaults-qc-03.md · GO/GWC/NO-GO · PASS_TO_PM
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-qa-03.md`

## ack_status

**PASS_TO_PM**

## payroll_e2e_ready

**false**
