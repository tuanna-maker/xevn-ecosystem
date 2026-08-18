# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Stamp** | `SIINRQA2-MSJBIMYU` |
| **U65** | zero-seed · **browser-only** · L1 probe ≠ 🟢 UF |
| **Retain** | L1 QA-01 **`SIINRQA-MSJB1WLH`** · QC-01 **GWC L1** — **NOT reopened** · SI type L1 `SIINSQA-MSJA2Z7H` + QC-02 FE enrollment **SEAL** · CTR · enrollment EMP-BE-02 — **FORBIDDEN reopen** |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **`C-SLICE-≠-MODULE`** · **DENY** module SI/CTR UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L2/L2.5 browser · **R-PLT-SI-INR-03 CLOSED**) |
| **change_mode** | ADD verify · no `apps/**` invent · no seed · no ready flip |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02/` |
| Git HEAD | `dc930c5` |
| Seed | **none** |

**spec_ref:** BA-01 §6 AC-PLT-SI-INSURER-01* · VAL-SI-INR-CNS-01/06 · FE-01 READY · SA Option **B** · F-SI-CAT-INS / F-SI-CAT-INS-EFF

---

## 2. HDSD inventory (U76)

| testid / path | Used |
|---------------|------|
| `settings-tab-si-insurers` · `settings-si-insurers` · `settings-si-insurers-table` | ✅ |
| `hdsd-si-insurer-key` · `hdsd-si-insurer-name` · `hdsd-si-insurer-save` · `hdsd-si-insurer-reload` | ✅ |
| `hdsd-policy-insurer-picker` · `hdsd-policy-open-si-insurers` (CTA wire) | ✅ |
| `hdsd-policy-insurance-type-picker` (peer retain SoT) | ✅ |
| `settings-tab-si-insurance-types` (must_keep spot) | ✅ |
| `insurance-policy-master-e3` | ✅ |

**Click path:** login → Settings **Nhà BH / Insurers** CREATE N+1 → F5 → `/hr/insurance` policy master → insurer picker Network **GET …/insurers/effective** → pick ∈ EFF → Lưu **201** → F5 → invent ∉ EFF → **400 `HRM-INS-INSURER-KEY`**.

**Proposed L2.5:** deepen **J-HRM-INS-E3-01** insurer path (Settings Nest admin → policy EFF picker) — **not** module SI/CTR promote.

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **L0** | stack 200 | 200 | 🟢 |
| **AC-PLT-SI-INSURER-01d** | Settings CREATE N+1 → F-SI-CAT-INS 2xx → F5 | PUT **200** `HRM-SI-INSURER-200` key=`hr_si_inr_msjbimyu` · F5 row **true** | 🟢 |
| **MUST_KEEP-SI-TYPE** | SI type Settings tab still loads | tab/panel visible · **RETAIN** | 🟢 |
| **AC-PLT-SI-INSURER-01-PICKER-SOT** | Policy Network GET `…/insurers/effective` (not MD-alone) | GET **200** · MD catalog hits **0** · picker visible | 🟢 |
| **R-PLT-SI-INR-03** | Close FE rebind Nest EFF | CLOSED — Nest EFF SoT proven | ✅ **CLOSED** |
| **AC-PLT-SI-INSURER-01c** | Empty EFF + CTA · no seed | EFF=8 live — empty not forced · CTA wire present=false when density≥1 · **no seed** | 🟢 |
| **AC-PLT-SI-INSURER-01** | Policy Lưu insurer ∈ EFF → 2xx → F5 | POST **201** `HRM-INS-POL-201` insurer=`hr_si_inr_msjbimyu` · F5 **true** | 🟢 |
| **AC-PLT-SI-INSURER-01b** | Invent ∉ EFF → **400 `HRM-INS-INSURER-KEY`** | FE blocked=true · POST **400** KEY | 🟢 |
| **VAL-SI-INR-CNS-06** | Peer invent type → `HRM-INS-TYPE-KEY` ≠ insurer KEY | **400** `HRM-INS-TYPE-KEY` | 🟢 |
| **AC-PLT-SI-INSURER-01H** | Honesty / seals / L1 retain | false · RETAIN · C-SLICE · DENY UAT | 🟢 |

**OBS (01c):** Empty EFF not forced live (REF/Nest total≥1); soft empty + CTA covered by FE wire when options.length=0; no wipe seals.

---

## 4. Key network stamps (browser)

```text
PUT  /api/hrm/contracts-insurance/insurers                         → 200  HRM-SI-INSURER-200 key=hr_si_inr_msjbimyu
GET  /api/hrm/contracts-insurance/insurers/effective?company_id=main → 200  (policy picker SoT · not MD)
POST /api/hrm/contracts-insurance/insurance-policies               → 201  HRM-INS-POL-201 insurer=hr_si_inr_msjbimyu
POST /api/hrm/contracts-insurance/insurance-policies (invent insurer) → 400  HRM-INS-INSURER-KEY zz_invent_inr_msjbimyu
POST /api/hrm/contracts-insurance/insurance-policies (invent type peer) → 400  HRM-INS-TYPE-KEY (separate)
```

**Policy request body (happy path):** `insurer_key=hr_si_inr_msjbimyu` · `insurance_type=hr_si_cat_msja2z7h` · `policy_code=POL-INRQA2-MSJBIMYU` · `effective_date=2026-08-01`

---

## 5. Defect / residual register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **R-PLT-SI-INR-03** | — | FE picker rebind Nest `GET …/insurers/effective` | ✅ **CLOSED** this QA-02 |
| — | — | No new P0/P1 residual | — |

**Not defects this seat:** L1 KEY assert · peer TYPE-KEY · honesty / L1+QC-01 retain · SI type FE retain.

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`contracts_printable_ready`** | **`false`** — **DENIED** flip |
| **`hrm_personnel_uat_ready`** | **`false`** — **DENIED** flip |
| L1 QA-01 `SIINRQA-MSJB1WLH` · QC-01 GWC L1 | **SEAL RETAIN** — **FORBIDDEN reopen** |
| SI type L1 `SIINSQA-MSJA2Z7H` · QC-02 FE enrollment | **SEAL RETAIN** — **FORBIDDEN reopen** |
| CTR legal-print / library | **SEAL RETAIN** |
| SI enrollment EMP-BE-02 / ONE SoT | **SEAL RETAIN** |
| EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS | **SEAL RETAIN** |
| Module SI / CTR UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02-browser.json` |
| **next_owner** | **qc** (narrow FE browser QC-02) |
| **completion_report** | See §8 |
| **next_dispatch_prompt** | See §9 |

---

## 8. completion_report

**Closed:** U65 browser L2/L2.5 after FE-01 — **R-PLT-SI-INR-03 CLOSED**. Settings **Nhà BH** CREATE `hr_si_inr_msjbimyu` → PUT **200** → F5; policy insurer picker Network **GET …/insurers/effective** (not MD-alone); Lưu policy ∈ EFF → POST **201 `HRM-INS-POL-201`** → F5; invent ∉ EFF → **400 `HRM-INS-INSURER-KEY`**; peer invent type → **400 `HRM-INS-TYPE-KEY`** (separate). SI type Settings tab retain. Honesty false; L1 `SIINRQA-MSJB1WLH` + QC-01 GWC + SI type L1/QC-02 FE + CTR/enrollment seals **RETAIN**; DENY module SI/CTR UAT; zero-seed.

**Open / residual:** none P0/P1 for this seat. 01c empty EFF not forced (live density≥1) — soft CTA covered when EFF=0.

**Stamp:** `SIINRQA2-MSJBIMYU` · **ack_status:** **PASS_TO_PM**.

---

## 9. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
prior: SI-INSURER-CATALOG-QA-02 PASS_TO_PM stamp SIINRQA2-MSJBIMYU · R-PLT-SI-INR-03 CLOSED
retain: L1 SIINRQA-MSJB1WLH · QC-01 GWC L1 — do NOT reopen · SI type L1/QC-02 FE · CTR · enrollment SEAL

entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02.md
  - Machine JSON docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-insurer-catalog-qa-02-browser.json
  - U65 zero-seed · honesty printable/personnel=false · C-SLICE-≠-MODULE

exit_criteria:
  - Narrow FE browser gate: Settings CREATE N+1 + F5 · policy GET insurers/effective · policy 201+F5 · invent HRM-INS-INSURER-KEY · peer TYPE-KEY
  - Confirm R-PLT-SI-INR-03 CLOSED · do NOT flip printable/personnel · DENY module SI/CTR UAT
  - evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qc-02.md
  - ack_status PASS_TO_PM | GWC | NO-GO

cấm: seed · reopen L1/QC-01 · reopen SI type L1/QC-02 · claim module SI/CTR UAT · flip honesty flags
```
