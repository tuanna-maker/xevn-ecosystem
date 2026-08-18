# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **prior** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01` **READY_FOR_QA** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `x-company-id=main` |
| **Stamp** | `SIINRQA-MSJB1WLH` |
| **U65** | zero-seed · L1 probe ≠ 🟢 UF · browser picker **HOLD** (FE not READY — parallel FE-01) |
| **Honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · SI type L1 `SIINSQA-MSJA2Z7H` + QC-01 GWC **SEAL RETAIN** · CTR legal-print / SI enrollment EMP-BE-02 **SEAL RETAIN** · EMP·DEC·PAY·ATT·REC·EXT·LIST-TOTALS **SEAL RETAIN** · **`C-SLICE-≠-MODULE`** · DENY module SI/CTR UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 10/10 · FE picker HOLD R-PLT-SI-INR-03) |
| **change_mode** | ADD verify · no `apps/**` invent · no seed · no ready flip · **FORBIDDEN** reopen SI type L1 / CTR / enrollment |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Dist gate | `si-insurer.service.js` + constants + `insurers/effective` in controller — **not stale** · peer `insurance-types/effective` still present |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-si-insurer-catalog-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-si-insurer-catalog-qa-01.json` |

**spec_ref:** BA-01 §6 AC-PLT-SI-INSURER-01* · VAL-SI-INR-CNS-01/06 · BE-01 READY · SA Option **B**

**Seed:** none.

---

## 2. L1 execution path (U65)

| Step | Action | Evidence |
|------|--------|----------|
| 0 | Dist KEY + L0 health | dist OK · GET `/api/hrm` **200** |
| 1 | Unauth GET insurers/effective | **401** `HRM-AUTH-001` (not 404) |
| 2 | Login `ceo@xe.vn` | portal proxy **201** |
| 3 | GET `/contracts-insurance/insurers/effective?company_id=main` | **200** `HRM-SI-INSURER-200` baseline REF keys present — empty [] OK path not forced |
| 4 | Admin CREATE N+1 `hr_si_inr_msjb1wlh` | **PUT** → **200** `HRM-SI-INSURER-200` |
| 5 | GET effective again | **200** · `hasOpenKey=true` · key `hr_si_inr_msjb1wlh` first |
| 6 | Invent policy `insurer_key=zz_invent_inr_msjb1wlh` (EFF>0) | **POST** policies → **400** `HRM-INS-INSURER-KEY` |
| 7 | Peer invent `insurance_type` (valid EFF insurer) | **400** `HRM-INS-TYPE-KEY` — **separate** from insurer KEY |
| 8 | Valid policy insurer ∈ EFF + type ∈ EFF | **POST** → **201** `HRM-INS-POL-201` |
| 9 | FE bind spot | Settings MD `insurers` · **no** Nest `/insurers/effective` · **HOLD** R-PLT-SI-INR-03 |
| 10 | Honesty | ready=false · SI type L1 retain · CTR/enrollment seals untouched · C-SLICE · DENY SI/CTR UAT |

---

## 3. AC stamp table

| ID | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **dist_gate** | si-insurer + insurers/effective in dist | present · stale=false · types route retain | 🟢 |
| **L0** | stack 200 | 200 | 🟢 |
| **unauth effective** | 401/403 ≠ 404 | 401 | 🟢 |
| **AC-PLT-SI-INSURER-01c** | GET effective 200 · empty [] OK · no seed | 200 baseline (live REF) · no seed wipe | 🟢 |
| **AC-PLT-SI-INSURER-01d** | Admin CREATE N+1 · 2xx | PUT **200** `hr_si_inr_msjb1wlh` | 🟢 |
| **AC-PLT-SI-INSURER-01** (L1) | EFF≥1 · valid consumer insurer ∈ EFF | EFF has open key · policy **201** | 🟢 |
| **AC-PLT-SI-INSURER-01b** | invent insurer → 400 `HRM-INS-INSURER-KEY` | **400** KEY | 🟢 |
| **VAL-SI-INR-CNS-06** | invent type → `HRM-INS-TYPE-KEY` ≠ insurer KEY | **400** TYPE-KEY | 🟢 |
| **AC-PLT-SI-INSURER-01** FE picker | Nest EFF picker when FE READY | FE MD-alone · **HOLD** | 🟡 HOLD |
| **AC-PLT-SI-INSURER-01H** | Honesty / seals | false · RETAIN type L1+CTR+enroll · C-SLICE · U65 | 🟢 |

**OBS (01c):** Empty EFF not forced live (REF total≥1); empty soft-allow covered by BE/jest; no wipe seals.

**FE:** parallel FE-01 — L1 PASS with browser picker HOLD per dispatch note.

---

## 4. Key network stamps

```text
GET  /api/hrm                                                              → 200  HRM-HEALTH-200
GET  /api/hrm/contracts-insurance/insurers/effective (unauth)              → 401  HRM-AUTH-001
GET  /api/hrm/contracts-insurance/insurers/effective?company_id=main       → 200  HRM-SI-INSURER-200
PUT  /api/hrm/contracts-insurance/insurers                                 → 200  HRM-SI-INSURER-200 key=hr_si_inr_msjb1wlh
POST /api/hrm/contracts-insurance/insurance-policies (invent insurer)      → 400  HRM-INS-INSURER-KEY zz_invent_inr_msjb1wlh
POST /api/hrm/contracts-insurance/insurance-policies (invent type peer)    → 400  HRM-INS-TYPE-KEY (separate)
POST /api/hrm/contracts-insurance/insurance-policies (valid EFF insurer)   → 201  HRM-INS-POL-201
```

---

## 5. L2 / L2.5

| Surface | Status |
|---------|--------|
| Browser Settings Nest SI insurers admin tab | **HOLD** — L1 admin via API F-SI-CAT-INS-02 OK; Nest Settings tab = FE-01 |
| Policy insurer picker SoT | **HOLD** R-PLT-SI-INR-03 — Settings MD `insurers` · no `insurers/effective` Network bind |
| J-HRM-INS-E3-01 / proposed J-HRM-SI-INR-CAT-* browser | **not executed** (FE not READY — per dispatch parallel_note) |

---

## 6. Honesty locks (mandatory)

| Flag / seal | Value |
|-------------|-------|
| **`contracts_printable_ready`** | **`false`** — **DENIED** flip |
| **`hrm_personnel_uat_ready`** | **`false`** — **DENIED** flip |
| SI type L1 `SIINSQA-MSJA2Z7H` · QC-01 GWC | **SEAL RETAIN** — **FORBIDDEN** reopen |
| CTR legal-print / library | **SEAL RETAIN** |
| SI enrollment EMP-BE-02 / ONE SoT | **SEAL RETAIN** |
| EMP · DEC · PAY · ATT · REC · EXT · LIST-TOTALS | **SEAL RETAIN** |
| Module SI / CTR UAT / Phase1 | **DENIED** — **`C-SLICE-≠-MODULE`** |
| Seed | **none** |

---

## 7. Defect / residual register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **R-PLT-SI-INR-03** | P1 HOLD | FE picker rebind Nest `GET …/insurers/effective` — reject MD-alone SoT when EFF>0 | **dev-fe** (parallel FE-01) |

No stale-dist. No P0. Peer type KEY path verified separate.

---

## 8. completion_report

**Closed:** L1 U65 for SI **insurer** catalog Option B after BE-01. Stamp `SIINRQA-MSJB1WLH`. Dist KEY OK (`si-insurer.*` + `insurers/effective`). GET effective 200 (empty OK / live REF). Admin PUT open `hr_si_inr_msjb1wlh` 200 + EFF has key. Invent policy insurer → 400 `HRM-INS-INSURER-KEY`. Peer invent type → 400 `HRM-INS-TYPE-KEY` (separate). Valid policy 201 ∈ EFF insurer. FE picker **HOLD** R-PLT-SI-INR-03 (MD SoT). Honesty false · SI type L1 + CTR/enrollment seals untouched · zero-seed · **C-SLICE-≠-MODULE** · DENY module SI/CTR UAT.

**Residual:** R-PLT-SI-INR-03 → dev-fe (parallel FE-01) then QA browser retest.

**Forbidden claims:** module SI/CTR UAT · printable/personnel flip · Phase1 DONE · seed · reopen SI type L1 / CTR / enrollment seals.

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qa-01.md` |
| **next_owner** | **qc** (narrow L1 seal) · FE-01 already parallel for R-PLT-SI-INR-03 |
| **next_dispatch_prompt** | See §10 |

---

## 10. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
prior: SI-INSURER-CATALOG-QA-01 PASS_TO_PM stamp SIINRQA-MSJB1WLH
entry_criteria:
  - read docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qa-01.md
  - honesty printable/personnel false · C-SLICE-≠-MODULE
  - retain: SI type L1 SIINSQA-MSJA2Z7H · QC-01 GWC · CTR legal-print · enrollment seals — FORBIDDEN reopen
exit_criteria:
  - Narrow GWC/GO on L1 AC-PLT-SI-INSURER-01* only — DENY module SI/CTR UAT
  - Confirm residual R-PLT-SI-INR-03 HOLD → FE-01 (picker Nest insurers/effective)
  - Confirm peer KEY taxonomy: INSURER-KEY ≠ TYPE-KEY
  - Confirm seals SI type L1 + CTR legal-print + enrollment EMP-BE-02 RETAIN
  - evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qc-01.md
  - ack_status PASS_TO_PM | FAIL_TO_PM
cấm: flip printable/personnel · claim module SI/CTR UAT · seed · reopen SI type L1 / CTR / enrollment
```
