# Evidence — PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-27 · UC-BP-ATT-09) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT09QA2-MSLUKI9U` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (C-SLICE · **≠** ATT-09 module UAT · **≠** ATT UAT · PAY OUT) |
| **uc_ids** | `UC-BP-ATT-09` · `FR-UC-BP-ATT-09` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **parent FAIL** | QA-01 `ATT09QA1-MSLTKERF` |
| **BE-02** | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-be-02.md` READY_FOR_QA |
| **Honesty** | `attendance_uat_ready=false` · soft ≠ ATT-09 DONE · ≠ ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **must_keep** | `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-09-cluster-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-09-cluster-qa-02.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-09-cluster-qa-02/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** soft=ATT-09 DONE · **DENY** ATT UAT · **DENY** invent `att_leave_hold` · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/.../leave-requests` **404** |
| **Product grant** | **PUT** `/api/hrm/attendance/leave-balance/tracked-entitlement` **200** `HRM-LEAVE-BAL-201` · `source=employee_leave_balances` · entitled≥12 · **≠ seed** |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** · **J-05 PASS_WITH_RESIDUAL** · **J-06 PASS** |
| **Nest `/core` leave SoT non-404** | **0** |
| **Seed** | **none** (U65) |

**Explicit:** ≠ ATT-09 module UAT · ≠ FR-09 DONE · C-SLICE · PAY OUT · printable false RETAIN.

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` J-HRM-ATT-09-01..06 · AC-ATT-09-* · O1–O12 |
| API-01 | F-ATT-LEAVE-02/03 · held=`pending_days` · Nest `/core` DENY · DENY `att_leave_hold` |
| BE-02 | PUT tracked-entitlement · approve settle + `leave_funnel_deferred` when sheet locked |
| ATT-08 QC | **`ATT08QC1-MSLSL36C`** RETAIN · ≠ ATT-08=ATT-09 DONE |
| ATT-02 QC | **`ATT02QC1-MSLQZUK7`** RETAIN · CFG≠ATT-02 DONE |
| PLT / CORE | **`PLT01QC1-MSLPUQIU`** · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** |

---

## U65 product grant (pre J-01)

| Step | Result |
|------|--------|
| Persona | `ceo@xe.vn` · main · authenticated product API |
| **PUT** `/api/hrm/attendance/leave-balance/tracked-entitlement` | **200** `HRM-LEAVE-BAL-201` |
| Keys granted | `annual` · `hr_custom_09` · `hr_custom_09_msiv8ixk` (UI picker may not land on annual) |
| Employee | `QA-M3-987275` / `0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` · company `holding` in scope |
| Verify GET leave-balance | `source=employee_leave_balances` · entitled **12** |
| Seed | **none** |

---

## Browser U65 — journeys

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` → **Nghỉ phép** · **zero-seed**.

**hdsd_align:** `att-leave-precision` · `att-leave-create-dialog-precision` · `leave-balance-panel` · `att-09-honesty` · `att-09-type-block` · `hdsd-leave-reason` · `hdsd-leave-list-approve-*`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-ATT-09-01** | Login → Nghỉ phép → Tạo → Gửi RANGE_A (07–08/12/2026) | **POST** leave-requests **201** `HRM-LEAVE-201` · UI type `hr_custom_09` · **pending 0→2** · **avail 8→6** · held=2 · path physical · Nest **0** | **PASS** |
| **J-HRM-ATT-09-02** | After create → Duyệt (API fallback same SoT) | **POST** approve **201** `HRM-LEAVE-203` · **pending 2→0** · **used 4→6** · funnelDeferred=false (sheet OK this range) · Nest **0** · **≠ 409 SHEET-LOCKED block** | **PASS** |
| **J-HRM-ATT-09-03** | Create RANGE_B → Từ chối | create **201** · reject **201** `HRM-LEAVE-204` · pending **0→2→0** · avail **6→4→6** release 100% · Nest **0** | **PASS** |
| **J-HRM-ATT-09-04** | Honesty footer | soft≠ATT-09 DONE · ≠ ATT UAT · Nest **0** · soft create SKIP (grant target was soft emp) | **PASS** |
| **J-HRM-ATT-09-05** | Create RANGE_C · overlap · type-block | create **201** · overlap **409** `HRM-LEAVE-VAL-OVERLAP` · type-block UI **not observed** · Nest **0** | **PASS_WITH_RESIDUAL** |
| **J-HRM-ATT-09-06** | F5 + honesty seals | printable false · ≠ATT UAT · CFG≠02 · DENY `att_leave_hold` · PAY OUT · Nest **0** · seals RETAIN | **PASS** |

Screens: `01-leave-tab` … `07-j06-f5-honesty` · type-block miss `06-j05-type-block-miss`.

---

## AC map

| AC / exit row | Result |
|---------------|--------|
| PUT tracked-entitlement product · ≠ seed | **PASS** |
| POST leave-requests physical · Nest `/core` 0 | **PASS** |
| held = pending_days · DENY `att_leave_hold` | **PASS** |
| Tracked pending↑ available↓ (BR-BP-LV-06) | **PASS** |
| Approve settle pending→used (203 OK / funnel defer OK) | **PASS** |
| Reject release 100% | **PASS** |
| Soft ≠ ATT-09 DONE | **PASS** (J-04) |
| TYPE-BLOCK pending UI | **RESIDUAL** FE (overlap PASS) |
| Overlap block | **PASS** (409 OVERLAP) |
| Honesty / C-SLICE / printable false / PAY OUT | **PASS** (J-06) |
| Nest `/core` DENY | **PASS** |
| ≠ claim ATT UAT / CFG=ATT-02 / ATT-08=ATT-09 / invent PAY | **PASS** (no flip) |

---

## Network summary

| Metric | Value |
|--------|-------|
| PUT tracked-entitlement | **200** `HRM-LEAVE-BAL-201` |
| `POST …/leave-requests` (create) | **201** `HRM-LEAVE-201` |
| `POST …/approve` | **201** `HRM-LEAVE-203` (settle OK) |
| `POST …/reject` | **201** `HRM-LEAVE-204` |
| Overlap create | **409** `HRM-LEAVE-VAL-OVERLAP` |
| Nest `/core` leave SoT non-404 | **0** |
| Seed | **none** |

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-ATT-09-TYPE-BLOCK-UI** | **P1** | **dev-fe** | Overlap 409 PASS · `att-09-type-block` / `leave-detail-type-readonly` not observed list→detail — FE-02 residual OK for this seat |
| **R-ATT-09-PANEL-HELD-DASH** | P2 OBS | **dev-fe** | API hold PASS · panel held/available may show "—" until employee/type bind refresh |
| **J02/J03-*-API-FALLBACK** | P2 OBS | **dev-fe** | ceo@ list approve/reject CTA not always visible — used physical POST same SoT |
| **R-ATT-09-HONESTY** | INFO | **qc** | C-SLICE · ≠ ATT-09 DONE · ≠ ATT UAT · printable false · PAY OUT · must_keep ATT-08/02/PLT/CORE · Nest `/core` DENY |

**Closed vs QA-01:** `R-ATT-09-NO-TRACKED-BALANCE` · `R-ATT-09-APPROVE-SHEET-LOCKED` — **CLOSED** by BE-02 + product PUT grant.

**Ops:** L0 healthy · U65 no seed · Nest `/core` leave **404** · **≠** invent PAY/printable · **≠** wipe ATT-08 · **≠** ATT module UAT.

---

## Honesty footer

```text
attendance_uat_ready=false
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
soft create alone ≠ ATT-09 DONE · ≠ FR-09 DONE
≠ ATT-08 preview = ATT-09 DONE · ATT08QC1-MSLSL36C RETAIN
client total_days / calendar ≠ ATT-08 DONE
≠ ATT module UAT
CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7
PLT/CORE RETAIN (≠ DONE)
soft ≠ CORE-06 DONE
PAY OUT invent DONE
DENY invent att_leave_hold dual · held=pending_days
Nest /core leave-hold = 0
C-SLICE ≠ ATT module UAT
U65 zero-seed · product PUT tracked-entitlement
must_keep ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT
DENY claim soft/ATT-08 = ATT-09 DONE · invent PAY/printable · honesty flip · reopen sealed J-ATT-08/02/PLT/CORE-*
```

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser retest J-HRM-ATT-09-01..06 after BE-02 · stamp **`ATT09QA2-MSLUKI9U`** · **PASS_TO_PM** · product **PUT tracked-entitlement** **200** · hold pending↑ available↓ **PASS** · approve **HRM-LEAVE-203** settle pending→used **PASS** · reject release 100% **PASS** · J-05 overlap PASS + type-block UI residual FE · J-04/06 honesty RETAIN · Nest `/core` **0** · seed **none** · **≠** ATT-09 module UAT · **≠** soft/ATT-08=ATT-09 DONE · printable false · PAY OUT · C-SLICE · must_keep ATT-08/02/PLT/CORE |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-02.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-QC-01
role: qc
entry_criteria: QA-02 PASS_TO_PM ATT09QA2-MSLUKI9U · BE-02 READY · U65 zero-seed · C-SLICE
exit_criteria:
  1) GWC C-SLICE only — cite hold/settle/release PASS · PUT tracked-entitlement product · Nest /core 0
  2) Explicit ≠ ATT-09 module UAT · ≠ soft/ATT-08=ATT-09 DONE · printable false · PAY OUT
  3) Residual note R-ATT-09-TYPE-BLOCK-UI (FE) — non-blocking for GWC this seat
  4) must_keep ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qc-01.md
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-02.md
  - docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-be-02.md
cấm: claim ATT module UAT · honesty flip · invent att_leave_hold · seed · wipe ATT-08/02/PLT/CORE
verdict_target: GO WITH CONDITIONS (C-SLICE) · ≠ ATT-09 DONE
```

---

*End QA-02 · PASS_TO_PM · 2026-08-09 · stamp ATT09QA2-MSLUKI9U*
