# Evidence — PO-HRM-MVP-GD1-ATT-02-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-25 · UC-BP-ATT-02) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT02QA1-MSLQWDN3` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-ATT-02` · `FR-UC-BP-ATT-02` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `attendance_uat_ready=false` · `contracts_printable_ready=false` · CFG alone ≠ ATT-02 DONE · LER ≠ mode SoT · ≠ ATT module UAT · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 DONE · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-02 READY · BE-01 READY · FE-01 peers · BA J-* · API-01 · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-02-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-02-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-02-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim CFG=ATT-02 DONE · **DENY** ATT module UAT · **DENY** invent PAY/printable · **DENY** honesty flip · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/attendance/rules` **404** |
| **L2.5 J-*** (PM exit map) | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** · **J-05 PASS** · **J-06 PASS** |
| **Nest `/core` ATT** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** (U65) |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md` J-HRM-ATT-02-01..06 · AC-ATT-02-* · O1–O12 |
| API-01 | F-ATT-RULE-01 physical `GET/PATCH /attendance/rules*` · Nest `/core` DENY |
| FE-02 | `docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-02.md` READY · R-ATT-02-MODE-FE **CLOSED** |
| BE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-be-01.md` READY |
| PLT-01 QC | **`PLT01QC1-MSLPUQIU`** RETAIN · ≠ PLT DONE |
| CORE-10 QC | **`CORE10QC1-MSLP0EJB`** RETAIN · ≠ CORE-10 DONE |
| CORE-09 QC | **`CORE09QC1-MSLNBA89`** printable false RETAIN · ≠ CORE-09 DONE |
| CORE-07 QC | **`CORE07QC1-KZJTSHNT`** RETAIN · ≠ CORE-07 DONE |
| soft≠CORE-06 | must_keep · ≠ soft=CORE-06 DONE |
| PAY | **OUT invent DONE** |

**PM exit SoT (this seat):** CFG surface per FE-02 — not BA punch J-03/04 DRAFT (OBS below).

---

## Browser U65 — journeys (PM exit map)

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` → **Thiết lập** → sidebar **Quy định chấm công** → tab **Chung** · panel `att-02-late-penalty-panel` · **zero-seed**.

**hdsd_align:** `att-settings-shell-precision` · `att-settings-rules-precision` · `hdsd-att-rules-tab-general` · `att-02-late-penalty-panel` · `att-02-mode-*` · `att-02-late-penalty-enabled` · `att-02-source-flags` · `att-02-scope-*` · `att-02-bands-*` · `att-02-mode-save` · `att-02-honesty`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-ATT-02-01** | Load panel · LIVE badge | **GET** `/api/hrm/attendance/rules` **200** `HRM-ATT-RULES-200` · badge **R-ATT-02-MODE-FE CLOSED** · XOR radios VI · Nest `/core` **0** | **PASS** |
| **J-HRM-ATT-02-02** | Chọn **Theo phút** → Lưu → F5 | **PATCH** `/attendance/rules` **200** · F5 `modeMinute=true` · `modeLabelVi=Theo phút` · Nest 0 | **PASS** |
| **J-HRM-ATT-02-03** | Bands overlap → Lưu | Client **HRM-VAL-400** toast/alert · **no** silent PATCH 2xx · Nest 0 | **PASS** |
| **J-HRM-ATT-02-04** | Tắt `latePenaltyEnabled` → Lưu → F5 | **PATCH** **200** · F5 off=true · peer **notify_late=bật** (≠ off conflation) · Nest 0 | **PASS** |
| **J-HRM-ATT-02-05** | sourceFlags + scope fields + tier bands → Lưu → F5 | sourceFlags GPS/Wi‑Fi/QR · scope dept/shift inputs · **PATCH** **200** · F5 tier + 1 band · Nest 0 | **PASS** |
| **J-HRM-ATT-02-06** | Honesty footer seals | CFG≠ATT-02 DONE · ≠ ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN · LER≠mode SoT · R-ATT-02-MODE-FE CLOSED · seals RETAIN | **PASS** |

Screens: `01-rules-chung-panel` … `06-honesty`.

---

## AC map (PM exit)

| AC / exit row | Result |
|---------------|--------|
| GET/PATCH `/attendance/rules*` · Nest `/core` 0 · mode/modeLabelVi | **PASS** (J-01/02) |
| XOR one mode · Lưu 2xx · F5 | **PASS** (J-02) |
| Mixed/overlap → HRM-VAL-400 · no silent 2xx | **PASS** (J-03 client bands) |
| `latePenaltyEnabled` off · notifyLate independent · F5 | **PASS** (J-04) |
| Scope/sourceFlags · bands path · Nest `/core` 0 | **PASS** (J-05) |
| Honesty CFG≠DONE · ≠ ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN · LER≠mode | **PASS** (J-06) |
| Nest `/core` DENY | **PASS** |
| Honesty / C-SLICE | **PASS** (false · no flip · **≠** claim ATT-02 / ATT UAT DONE) |

---

## Network summary

| Metric | Value |
|--------|-------|
| `/attendance/rules*` hits | 21 (incl. L0 nest probe 404 counted once) |
| `PATCH …/rules` 2xx | 4 |
| Nest `/core` ATT SoT non-404 | **0** |
| Client VAL-400 (overlap) | surfaced · no silent 2xx |
| Console / pageErrors | none blocking |

---

## Residuals / OBS

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-ATT-02-HONESTY** | INFO | **qc** | C-SLICE · CFG≠ATT-02 DONE · ≠ ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 · Nest `/core` DENY · **DENY** claim ATT-02 / ATT module DONE |
| **R-ATT-02-EVAL-PUNCH** | **P2 OBS** | optional BA/QA later | BA mint maps J-03/04 to punch+eval DRAFT; **this PM seat** = CFG exit map J-01..06 — punch journeys **not** executed · ≠ ATT-10/PAY DONE |
| **R-ATT-02-BE-MIXED-PROBE** | **P2 OBS** | optional BE | Ad-hoc force PATCH with `company_id` body → **400** `HRM-VAL-001` (DTO forbid) — not product XOR proof; client **HRM-VAL-400** overlap already PASS |

**Ops:** L0 healthy at entry — no rebuild / no seed.

---

## Honesty footer

```text
attendance_uat_ready=false
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
CFG alone ≠ ATT-02 DONE · round/notify_late ≠ FR-02 DONE
late_early_requests ≠ mode SoT
≠ ATT module UAT
PLT/CORE RETAIN (≠ DONE)
soft ≠ CORE-06 DONE
PAY OUT invent DONE
R-ATT-02-MODE-FE CLOSED
C-SLICE ≠ ATT module UAT
U65 zero-seed · Nest /core ATT dual DENY
must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT
DENY claim CFG = ATT-02 DONE · invent PAY/printable · honesty flip · reopen sealed J-PLT/CORE-*
```

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser J-HRM-ATT-02-01..06 (PM CFG exit) **all PASS** · stamp **`ATT02QA1-MSLQWDN3`** · GET/PATCH `/attendance/rules*` only · Nest `/core` ATT **0** · XOR minute save+F5 · bands overlap **HRM-VAL-400** no silent 2xx · off ≠ notifyLate · sourceFlags+scope+tier bands · honesty seals RETAIN · **≠** claim CFG=ATT-02 DONE · **≠** ATT UAT · printable false · PAY OUT · must_keep PLT/CORE · P2 OBS punch BA-map + BE mixed DTO probe |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-qa-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-QC-01
role: qc
entry_criteria: QA-01 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-qa-01.md stamp ATT02QA1-MSLQWDN3 · FE-02 READY · BE-01 READY · U65 zero-seed evidence
exit_criteria: GWC C-SLICE only (≠ ATT module UAT · ≠ CFG=ATT-02 DONE) · audit J-HRM-ATT-02-01..06 PASS · Network /attendance/rules* only · Nest /core ATT = 0 · XOR+F5 · HRM-VAL-400 overlap · off≠notifyLate · sourceFlags/scope/bands · honesty printable false · PAY OUT · must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · R-ATT-02-MODE-FE CLOSED · no reopen sealed J-* · DENY invent PAY/printable · honesty flip · stamp ATT02QC1-…
must_keep: PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · PAY OUT
cấm: seed · Nest /core ATT SoT · claim CFG=ATT-02 DONE · claim ATT UAT · invent PAY/printable · honesty flip · reopen sealed J-PLT/CORE-*
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-qc-01.md
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-02.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-be-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md
```

---

*End QA-01 · PASS_TO_PM · stamp ATT02QA1-MSLQWDN3 · 2026-08-09*
