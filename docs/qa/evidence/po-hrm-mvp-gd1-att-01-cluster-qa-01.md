# Evidence — PO-HRM-MVP-GD1-ATT-01-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-30 · UC-BP-ATT-01) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT01QA1-MSLYZKGN` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (CAT/CNS) · ASSIGN residual **HOLD** · RESOLVE **BLOCKED** |
| **uc_ids** | `UC-BP-ATT-01` · `FR-UC-BP-ATT-01` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `attendance_uat_ready=false` · `contracts_printable_ready=false` · **catalog alone ≠ ATT-01 DONE** · R-ATT-01-ASSIGN **open** · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 · ≠ ATT module UAT · CFG≠ATT-02 · PAY OUT · Nest `/core` DENY · DENY `att_leave_hold` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-01 READY · API-01 CONFIRMED RETAIN · BA J-* · must_keep ATT11/10/09/08/02/PLT/CORE |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-01-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-01-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-01-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim catalog=ATT-01 DONE · **DENY** invent ASSIGN DONE · **DENY** ATT module UAT · **DENY** invent PAY/printable · **DENY** honesty flip · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/attendance/work-shifts` **404** · Nest `shift-assignments` **404** |
| **L2.5 J-*** | **J-01 PASS** · **J-04 PASS** · **J-05 PASS** · **J-06 PASS** · **J-02 HOLD** · **J-03 BLOCKED** |
| **Nest `/core` ATT** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** (U65) |

**Explicit ≠:** ATT-01 module UAT · catalog alone = FR-01 DONE · LIVE=ATT-11 DONE · AGG=ATT-10 DONE · soft/ATT-08=ATT-09 DONE · CFG=ATT-02 DONE · printable false RETAIN · PAY OUT · C-SLICE

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md` J-HRM-ATT-01-01..06 · AC-ATT-01-* · O1–O12 |
| API-01 | F-ATT-CAT-SHIFT-01/02/EFF · F-ATT-SHIFT-CNS-01 · F-ATT-SHIFT-02 ASSIGN HOLD · Nest `/core` DENY |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md` READY_FOR_QA |
| ATT-11 QC | **`ATT11QC1-MSLXTH9P`** RETAIN · ≠ LIVE=ATT-11 DONE |
| ATT-10 QC | **`ATT10QC1-MSLWGUYH`** RETAIN · ≠ AGG=ATT-10 DONE |
| ATT-09 QC | **`ATT09QC1-MSLUTL9D`** RETAIN · DENY `att_leave_hold` |
| ATT-08 QC | **`ATT08QC1-MSLSL36C`** RETAIN |
| ATT-02 QC | **`ATT02QC1-MSLQZUK7`** RETAIN · CFG≠DONE |
| PLT-01 QC | **`PLT01QC1-MSLPUQIU`** RETAIN |
| CORE-10 QC | **`CORE10QC1-MSLP0EJB`** RETAIN |
| CORE-09 QC | **`CORE09QC1-MSLNBA89`** printable false RETAIN |
| CORE-07 QC | **`CORE07QC1-KZJTSHNT`** RETAIN |
| PAY | **OUT invent DONE** |

---

## Browser U65 — journeys

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main`  
**Click path:** Chấm công → **Ca làm việc** → **Danh sách ca**; **Quản lý đơn** → **Đề nghị đổi ca** (HDSD: Đơn từ → Đổi ca)  
**zero-seed** · soft-retire restored after J-05.

**hdsd_align:** `att-shifts-precision` · `shifts-table` · `att-shifts-add` · `att-shift-form-dialog` · `att-01-honesty` · `att-shift-change-precision` · `att-01-cns-empty-cta` · `shifts-schedule-hold` · `shifts-gd2-hold-badge` · `requests-menu-change-shift` · `shifts-menu-list`

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-ATT-01-01** | Danh sách ca → Thêm ca Nest → Lưu → F5 còn · honesty catalog≠DONE | **POST** `/api/hrm/attendance/work-shifts` **201** · **GET** work-shifts **200** · Nest `/core` **0** · code `QA01LYZKGN` | **PASS** |
| **J-HRM-ATT-01-04** | Đề nghị đổi ca · active>0 invent mã | **POST** `shift-change-requests` **400** **`HRM-ATT-SHIFT-KEY`** · invent not in picker · F5 không giữ · Nest `/core` **0** | **PASS** |
| **J-HRM-ATT-01-05** | Soft-retire actives → EFF=0 → CTA · restore | empty CTA `att-01-cns-empty-cta` visible · EFF count **0** · Nest `/core` **0** · no bootstrap seed | **PASS** |
| **J-HRM-ATT-01-06** | Honesty list+CNS · seals · ASSIGN ABSENT | printable false · ≠ ATT-01/LIVE-11/AGG-10/soft-09/UAT · CFG≠02 · PAY OUT · seals RETAIN · Nest `/core` **0** | **PASS** |
| **J-HRM-ATT-01-02** | Lịch phân ca GĐ2-HOLD | hold UI + badge · Nest `shift-assignments` **404** · **0** 2xx assign · **≠ invent ASSIGN DONE** | **HOLD** |
| **J-HRM-ATT-01-03** | Resolve ca đang gán | depends ASSIGN · **≠ invent DONE** | **BLOCKED** |

Screens: `01-shifts-list` … `06-honesty-cns` · `02-schedule-hold` · `05-empty-cta`.

---

## AC map

| AC / exit row | Result |
|---------------|--------|
| CAT CRUD + F5 + PATH Nest `/attendance/work-shifts*` · Nest `/core` 0 · ≠ CAT=DONE | **PASS** (J-01) |
| CNS invent-ban **HRM-ATT-SHIFT-KEY** when active>0 · F5 no invent | **PASS** (J-04) |
| Soft-retire · empty EFF CTA · no seed | **PASS** (J-05) |
| Honesty / seals / printable false / ≠ ATT UAT / ≠ LIVE-11 / ≠ AGG-10 | **PASS** (J-06) |
| ASSIGN residual HOLD (ABSENT) — not FAIL invent | **HOLD** (J-02) |
| RESOLVE residual BLOCKED after ASSIGN | **BLOCKED** (J-03) |

---

## Network summary

| Metric | Value |
|--------|-------|
| `/attendance/work-shifts*` hits | 12 |
| `/work-shifts/effective` hits | 8 |
| `/shift-change-requests*` hits | 10 |
| `shift-assignments` 2xx | **0** |
| Nest `/core` ATT SoT non-404 | **0** |
| Invent POST | **400** `HRM-ATT-SHIFT-KEY` |
| Console / pageErrors | none blocking |

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-ATT-01-ASSIGN** | HOLD | **dev-be** | Nest `shift-assignments*` ABSENT · FE Lịch GĐ2-HOLD · DENY invent DONE |
| **R-ATT-01-SCHED** | HOLD | pm/ba | Full grid OUT GĐ2 |
| **R-ATT-01-RESOLVE** | BLOCKED | **dev-be** | After ASSIGN wire |
| **R-ATT-01-HONESTY** | INFO | **qc** | C-SLICE · catalog≠ATT-01 DONE · ≠ ATT UAT · printable false · PAY OUT · seals RETAIN |

**Ops:** L0 healthy · soft-retire restored · zero-seed · no honesty flip.

---

## Honesty footer

```text
attendance_uat_ready=false
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
catalog alone ≠ ATT-01 DONE · ≠ FR-UC-BP-ATT-01 DONE
R-ATT-01-ASSIGN open · Nest shift-assignments ABSENT
Lịch phân ca GĐ2-HOLD · ≠ invent full roster GĐ1 DONE
≠ LIVE=ATT-11 DONE · ATT11QC1-MSLXTH9P
≠ AGG=ATT-10 DONE · ATT10QC1-MSLWGUYH
≠ soft/ATT-08=ATT-09 DONE · ATT09QC1-MSLUTL9D · DENY att_leave_hold
ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE
≠ ATT module UAT
PLT/CORE RETAIN (≠ DONE) · printable false · CORE09QC1-MSLNBA89
PAY OUT invent DONE
C-SLICE ≠ ATT module UAT
U65 zero-seed · Nest /core ATT dual DENY
must_keep ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT
DENY claim catalog=ATT-01 DONE · invent ASSIGN DONE · invent PAY/printable · honesty flip · reopen sealed peers
```

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser J-HRM-ATT-01-01/04/05/06 **PASS** · J-02 **HOLD** · J-03 **BLOCKED** · stamp **`ATT01QA1-MSLYZKGN`** · Nest `work-shifts*` + `shift-change-requests*` only · invent **HRM-ATT-SHIFT-KEY** · empty EFF CTA · Nest `/core` **0** · ASSIGN ABSENT residual documented · **≠** catalog=ATT-01 DONE · **≠** ATT UAT · printable false · C-SLICE · PAY OUT · seals RETAIN |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-qa-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-01-CLUSTER-QC-01
role: qc
entry_criteria: QA-01 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-qa-01.md stamp ATT01QA1-MSLYZKGN · FE-01 READY · U65 zero-seed · API-01 RETAIN
exit_criteria: GWC C-SLICE — audit J-01/04/05/06 PASS · J-02 HOLD · J-03 BLOCKED · Nest /core 0 · no seed · catalog≠ATT-01 DONE · ≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · R-ATT-01-ASSIGN open · seals ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT RETAIN · ack_status PASS_TO_PM
persona: ceo@xe.vn / Xevn@2026
cấm: claim ATT-01 module UAT · invent ASSIGN DONE · wipe seals · honesty flip · seed
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-01-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-BA-01.md
```

---

## completion_report

**Closed:** U65 browser CAT/CNS for UC-BP-ATT-01 — J-01 CRUD+F5 Nest `work-shifts*` 201; J-04 invent **HRM-ATT-SHIFT-KEY**; J-05 soft-retire + empty EFF CTA (restored); J-06 honesty seals; Nest `/core` 0; zero-seed; stamp `ATT01QA1-MSLYZKGN`.

**Open residual:** R-ATT-01-ASSIGN **HOLD** (J-02) · R-ATT-01-SCHED HOLD · R-ATT-01-RESOLVE **BLOCKED** (J-03) — Dev-BE HOLD invent ASSIGN; **≠** claim ATT-01 module UAT / catalog=DONE.

**ack_status:** PASS_TO_PM  
**next_owner:** qc
