# Evidence — PO-HRM-MVP-GD1-ATT-08-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-26 · UC-BP-ATT-08) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT08QA1-MSLSGUJF` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-ATT-08` · `FR-UC-BP-ATT-08` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `attendance_uat_ready=false` · client-days ≠ ATT-08 DONE · ≠ ATT-09/03b DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 · Nest `/core` DENY · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-02 READY · BE-01 READY · FE-01 · BA J-* · API-01 · `ATT02QC1-MSLQZUK7` · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-08-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-08-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-08-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim client-days=ATT-08 DONE · **DENY** ATT-09/03b DONE · **DENY** ATT module UAT · **DENY** CFG=ATT-02 DONE · **DENY** invent PAY/printable · **DENY** honesty flip · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/.../preview-deduction` **404** |
| **L2.5 J-*** (PM exit map) | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** · **J-05 PASS** · **J-06 PASS** |
| **Nest `/core` leave** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** (U65) · holiday year 2026 via product **PUT** F-ATT-HOL-01 thin empty days (**≠** ATT-03b DONE · **≠** `pnpm seed:*`) |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md` J-HRM-ATT-08-01..06 · AC-ATT-08-* · O1–O12 |
| API-01 | F-ATT-LEAVE-01 physical `POST /attendance/leave-requests/preview-deduction` · Nest `/core` DENY |
| FE-02 | `docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-02.md` READY · R-ATT-08-PREVIEW-FE **CLOSED** |
| BE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-be-01.md` READY |
| ATT-02 QC | **`ATT02QC1-MSLQZUK7`** RETAIN · CFG≠ATT-02 DONE |
| PLT-01 QC | **`PLT01QC1-MSLPUQIU`** RETAIN · ≠ PLT DONE |
| CORE-10 QC | **`CORE10QC1-MSLP0EJB`** RETAIN · ≠ CORE-10 DONE |
| CORE-09 QC | **`CORE09QC1-MSLNBA89`** printable false RETAIN · ≠ CORE-09 DONE |
| CORE-07 QC | **`CORE07QC1-KZJTSHNT`** RETAIN · ≠ CORE-07 DONE |
| soft≠CORE-06 | must_keep · ≠ soft=CORE-06 DONE |
| PAY | **OUT invent DONE** |

**PM exit SoT (this seat):** preview-deduction / HOL-MISS / unit / ALIGN / honesty — map J-01..06 per dispatch (BA J-04 zero-warn DRAFT noted OBS).

---

## Browser U65 — journeys (PM exit map)

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` → **Nghỉ phép** → **Tạo yêu cầu nghỉ** · panel `att-08-preview-deduction-panel` · **zero-seed**.

**hdsd_align:** `att-leave-precision` · `att-leave-create-dialog-precision` · `att-08-preview-deduction-panel` · `att-08-preview-live` · `att-08-preview-display-ready` · `att-08-hol-miss` · `att-08-honesty` · `hdsd-leave-reason`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-ATT-08-01** | T6→T2 (`14/08/2026`→`17/08/2026`) · LIVE badge | **POST** `/api/hrm/attendance/leave-requests/preview-deduction` **201** `HRM-LEAVE-PREVIEW-200` · `working_days=2` · `calendar_days=4` · Nest `/core` **0** | **PASS** |
| **J-HRM-ATT-08-02** | Panel Ngày calendar **4** ≠ trừ quỹ · Ngày trừ quỹ **2** | DENY calendar as SoT · honesty client-days ≠ ATT-08 DONE · Nest 0 | **PASS** |
| **J-HRM-ATT-08-03** | Range year **2030** (holiday ABSENT) | **400** `HRM-LEAVE-HOL-MISSING` · UI `att-08-hol-miss` · submit **DISABLED** · no silent create · Nest 0 · ≠ ATT-03b DONE | **PASS** |
| **J-HRM-ATT-08-04** | unit **day** on envelope · F5 reopen gold | Q-LEAVE-UNIT day VI · F5 `working_days=2` · hour leave_type **ABSENT** EFF (OBS · BE jest hour cited) · Nest 0 | **PASS** |
| **J-HRM-ATT-08-05** | Submit body `total_days=2` (= deductible) · inflate `total_days=4` | FE POST create body engine units · L1 inflate **400** `HRM-VAL-400` · create may **409** overlap (prior QA leave) · ≠ ATT-09 DONE · Nest 0 | **PASS** |
| **J-HRM-ATT-08-06** | Honesty footer seals | printable false · client≠DONE · ≠09/03b · ≠ATT UAT · CFG≠02 · PAY OUT · R-ATT-08-PREVIEW-FE CLOSED · PLT/CORE RETAIN · seals RETAIN | **PASS** |

Screens: `01-leave-tab` … `07-j06-honesty`.

---

## AC map (PM exit)

| AC / exit row | Result |
|---------------|--------|
| POST preview-deduction · T6→T2 working_days=2 not 4 · Nest `/core` 0 | **PASS** (J-01) |
| Show trừ quỹ vs calendar · client-days ≠ SoT | **PASS** (J-02) |
| HOL-MISS chặn nộp · no silent submit | **PASS** (J-03) |
| unit day\|hour path · F5 | **PASS** (J-04 · hour OBS catalog) |
| ALIGN reject inflate / deductible_units submit | **PASS** (J-05) |
| Honesty ≠DONE · CFG≠02 · printable false · PAY OUT · seals | **PASS** (J-06) |
| Nest `/core` DENY | **PASS** |
| Honesty / C-SLICE | **PASS** (false · no flip · **≠** claim ATT-08 / ATT UAT DONE) |

---

## Network summary

| Metric | Value |
|--------|-------|
| `POST …/preview-deduction` hits | 13 (browser) |
| Preview gold | **201** `HRM-LEAVE-PREVIEW-200` · wd=2 · cd=4 |
| HOL-MISS | **400** `HRM-LEAVE-HOL-MISSING` |
| Create leave body `total_days` | **2** (engine) |
| Inflate create `total_days=4` | **400** `HRM-VAL-400` |
| Nest `/core` leave SoT non-404 | **0** |
| Seed | **none** |

---

## Residuals / OBS

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-ATT-08-HONESTY** | INFO | **qc** | C-SLICE · ≠ ATT-08 DONE from client-days · ≠ ATT-09/03b · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 · Nest `/core` DENY · R-ATT-08-PREVIEW-FE CLOSED |
| **R-ATT-08-HOUR-CAT** | **P2 OBS** | optional BA/FE later | EFF leave_types all `unit=day` — hour path not browser-live; BE jest hour + day envelope PASS |
| **R-ATT-08-CREATE-409** | **P2 OBS** | — | Second-run create **409** overlap on same T6→T2 employee (prior PASS leave) — ALIGN body still `total_days=2`; inflate reject independent |
| **R-ATT-08-BA-J04-MAP** | **P2 OBS** | optional BA | BA DRAFT maps J-04=zero-warn; **this PM seat** = unit+F5 exit |

**Ops:** L0 healthy · holiday 2026 empty via product PUT (prerequisite gold) · 2030 ABSENT for HOL-MISS · no rebuild · no seed.

---

## Honesty footer

```text
attendance_uat_ready=false
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
client-days / calendar expand ≠ ATT-08 DONE
≠ ATT-09 DONE · ≠ ATT-03b DONE
≠ ATT module UAT
CFG ≠ ATT-02 DONE
PLT/CORE RETAIN (≠ DONE)
soft ≠ CORE-06 DONE
PAY OUT invent DONE
R-ATT-08-PREVIEW-FE CLOSED
C-SLICE ≠ ATT module UAT
U65 zero-seed · Nest /core leave dual DENY
must_keep ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT
DENY claim client-days = ATT-08 DONE · invent PAY/printable · honesty flip · reopen sealed J-ATT-02/PLT/CORE-*
```

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser J-HRM-ATT-08-01..06 (PM exit) **all PASS** · stamp **`ATT08QA1-MSLSGUJF`** · POST preview-deduction T6→T2 **working_days=2** (not 4) · Nest `/core` leave **0** · calendar≠trừ quỹ · HOL-MISS block submit · unit day + F5 · ALIGN submit `total_days=2` + inflate **HRM-VAL-400** · honesty seals RETAIN · **≠** claim client-days=ATT-08 DONE · **≠** ATT UAT · printable false · PAY OUT · must_keep ATT02/PLT/CORE · P2 OBS hour catalog + create 409 overlap |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-qa-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-QC-01
role: qc
entry_criteria: QA-01 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-qa-01.md stamp ATT08QA1-MSLSGUJF · FE-02 READY · BE-01 READY · U65 zero-seed evidence
persona: ceo@xe.vn / Xevn@2026
mission: GWC C-SLICE audit J-HRM-ATT-08-01..06 · verify Nest /core 0 · HOL-MISS · ALIGN · honesty seals · DENY claim ATT-08/ATT UAT DONE · DENY CFG=ATT-02 DONE · printable false · PAY OUT · must_keep ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06
exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-qc-01.md · stamp ATT08QC1-… · PASS_TO_PM GO/GWC
cấm: seed · Nest /core SoT · claim client-days=ATT-08 DONE · claim ATT UAT · invent PAY/printable · honesty flip · reopen sealed peers
```

---

*End QA-01 · PASS_TO_PM · stamp ATT08QA1-MSLSGUJF · 2026-08-09*
