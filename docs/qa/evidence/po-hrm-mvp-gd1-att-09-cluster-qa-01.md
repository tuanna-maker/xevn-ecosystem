# Evidence — PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-27 · UC-BP-ATT-09) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT09QA1-MSLTKERF` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** |
| **uc_ids** | `UC-BP-ATT-09` · `FR-UC-BP-ATT-09` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `attendance_uat_ready=false` · soft ≠ ATT-09 DONE · ≠ ATT-08=ATT-09 DONE · client-days≠ATT-08 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · Nest `/core` DENY · PLT/CORE RETAIN · soft≠CORE-06 · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-01 READY · API-01 RETAIN · BA J-* · DATA held=`pending_days` · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-09-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-09-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-09-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **FAIL** · `FAIL_TO_PM` · **C-SLICE** · **DENY** soft=ATT-09 DONE · **DENY** ATT UAT · **DENY** invent `att_leave_hold` · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/.../leave-requests` **404** |
| **L2.5 J-*** | **J-01 FAIL** · **J-02 FAIL** · **J-03 FAIL** · **J-04 PASS** · **J-05 FAIL** · **J-06 PASS** |
| **Nest `/core` leave SoT non-404** | **0** |
| **Seed** | **none** (U65) |
| **holdMode** | **`soft-only-no-balance-row`** — env scan zero `source=employee_leave_balances` |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-09-CLUSTER-BA-01.md` J-HRM-ATT-09-01..06 · AC-ATT-09-* · O1–O12 |
| API-01 | F-ATT-LEAVE-02/03 physical `/attendance/leave-requests*` · held=`pending_days` · Nest `/core` DENY · DENY `att_leave_hold` |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-fe-01.md` READY_FOR_QA |
| DATA | held=`pending_days` · DENY invent `att_leave_hold` |
| ATT-08 QC | **`ATT08QC1-MSLSL36C`** RETAIN · ≠ ATT-08=ATT-09 DONE |
| ATT-02 QC | **`ATT02QC1-MSLQZUK7`** RETAIN · CFG≠ATT-02 DONE |
| PLT-01 QC | **`PLT01QC1-MSLPUQIU`** RETAIN |
| CORE-10/09/07 | **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · **`CORE07QC1-KZJTSHNT`** |

---

## Browser U65 — journeys

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` → **Nghỉ phép** · **zero-seed**.

**hdsd_align:** `att-leave-precision` · `att-leave-create-dialog-precision` · `leave-balance-panel` · `leave-balance-held-*` · `att-09-honesty` · `att-09-type-block` · `hdsd-leave-reason` · `hdsd-leave-list-approve-*`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-ATT-09-01** | Login → Nghỉ phép → Tạo → Gửi RANGE_A (07–08/09/2026) | **POST** `/api/hrm/attendance/leave-requests` **201** `HRM-LEAVE-201` · path physical OK · Nest `/core` **0** · **pending 0→0** (no hold) · held=pending · **hold AC FAIL** | **FAIL** |
| **J-HRM-ATT-09-02** | After create → Duyệt (API fallback) | **POST** `…/approve` **409** `HRM-ATT-SHEET-LOCKED` · no pending→used · Nest 0 | **FAIL** |
| **J-HRM-ATT-09-03** | Create RANGE_B → Từ chối | create **201** · reject **201** `HRM-LEAVE-204` · **no** release numeric (no tracked row) · Nest 0 | **FAIL** |
| **J-HRM-ATT-09-04** | Honesty footer + soft create | `att-09-honesty` soft≠ATT-09 DONE · soft create **201** · Nest 0 · **explicit ≠ soft=DONE** | **PASS** |
| **J-HRM-ATT-09-05** | Create RANGE_C · detail type-block · overlap | create **201** · overlap **409** `HRM-LEAVE-VAL-OVERLAP` · **type-block UI not observed** (detail dialog miss) · Nest 0 | **FAIL** |
| **J-HRM-ATT-09-06** | F5 + honesty seals | printable false · ≠ATT UAT · CFG≠02 · DENY `att_leave_hold` · PAY OUT · Nest 0 · seals RETAIN | **PASS** |

Screens: `01-leave-tab` … `07-j06-f5-honesty` · type-block shot `06-j05-type-block-miss`.

---

## AC map

| AC / exit row | Result |
|---------------|--------|
| POST leave-requests physical · Nest `/core` 0 | **PASS** (path) · hold numeric **FAIL** |
| held = pending_days · DENY `att_leave_hold` | **PASS** (alias/UI title + honesty) · dual **0** |
| Tracked pending↑ available↓ (BR-BP-LV-06) | **FAIL** — env soft-only |
| Approve settle pending→used | **FAIL** — 409 SHEET-LOCKED + no tracked |
| Reject release 100% | **FAIL** — no tracked ledger |
| Soft ≠ ATT-09 DONE | **PASS** (J-04) |
| TYPE-BLOCK pending | **FAIL** — detail not opened in runner (FE code present; evidence miss) |
| Overlap block | **PASS** (409 OVERLAP) |
| Honesty / C-SLICE / printable false / PAY OUT | **PASS** (J-06) |
| Nest `/core` DENY | **PASS** |
| ≠ claim ATT UAT / CFG=ATT-02 / ATT-08=ATT-09 / invent PAY | **PASS** (no flip) |

---

## Network summary

| Metric | Value |
|--------|-------|
| `POST …/leave-requests` (create) | **201** `HRM-LEAVE-201` (browser) |
| `POST …/approve` | **409** `HRM-ATT-SHEET-LOCKED` |
| `POST …/reject` | **201** `HRM-LEAVE-204` |
| Overlap create | **409** `HRM-LEAVE-VAL-OVERLAP` |
| Nest `/core` leave SoT non-404 | **0** (probe 404) |
| Seed | **none** |
| Tracked balance rows scanned | **0** (`source=default` only) |

---

## Residuals / defects

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-ATT-09-NO-TRACKED-BALANCE** | **P0** | **dev-be** (+ PM) | Env has **zero** `employee_leave_balances` rows (`source=employee_leave_balances`). Hold/settle/release numeric AC cannot PASS under **U65** (seed DENY; no product grant/upsert API found — only `scripts/seed-hrm-uat-mob-pilot-qual.mjs` INSERT). Soft create alone **≠** ATT-09 DONE. |
| **R-ATT-09-APPROVE-SHEET-LOCKED** | **P1** | **dev-be** | Approve on soft pending → **409** `HRM-ATT-SHEET-LOCKED` — blocks settle path even after balance rows exist. |
| **R-ATT-09-TYPE-BLOCK-UI** | **P1** | **dev-fe** / qa-retest | FE implements `att-09-type-block` in detail dialog; runner did not open detail (`06-j05-type-block-miss`). Overlap 409 PASS. Retest after list→detail click path. |
| **R-ATT-09-HONESTY** | INFO | **qc** (after fix) | C-SLICE · ≠ ATT-09 DONE · ≠ ATT UAT · printable false · PAY OUT · DENY `att_leave_hold` · must_keep ATT-08/02/PLT/CORE · Nest `/core` DENY |

**Ops:** L0 healthy · U65 no seed · holiday 2026 present · Nest `/core` leave **404** · **≠** invent PAY/printable · **≠** wipe ATT-08.

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
U65 zero-seed
must_keep ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT
DENY claim soft/ATT-08 = ATT-09 DONE · invent PAY/printable · honesty flip · reopen sealed J-ATT-08/02/PLT/CORE-*
```

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser J-HRM-ATT-09-01..06 · stamp **`ATT09QA1-MSLTKERF`** · **FAIL_TO_PM** · J-01/02/03/05 **FAIL** · J-04/06 **PASS** · POST leave-requests physical **201** · Nest `/core` **0** · env **soft-only** (0 tracked balances) → hold/settle/release numeric **blocked** without seed · approve **409** SHEET-LOCKED · overlap **409** PASS · honesty seals RETAIN · **≠** soft/ATT-08=ATT-09 DONE · **≠** ATT UAT · printable false · PAY OUT · DENY `att_leave_hold` · must_keep ATT-08/02/PLT/CORE |
| **next_owner** | **dev-be** (P0 tracked balance product path) · then **qa** retest · **qc** only after PASS |
| **ack_status** | **FAIL_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-09-CLUSTER-BE-02
role: dev-be
entry_criteria: QA-01 FAIL_TO_PM ATT09QA1-MSLTKERF · U65 zero-seed · API-01 RETAIN held=pending_days · DENY invent att_leave_hold · DENY Nest /core
exit_criteria:
  1) Product path (NOT pnpm seed:*) to create/upsert employee_leave_balances row (entitled≥N) for tracked hold — OR document BLOCKED-EXTERNAL if only seed exists + PM/sponsor bootstrap decision
  2) Investigate/fix approve 409 HRM-ATT-SHEET-LOCKED on pending leave settle path (or document date/sheet precondition for QA)
  3) READY_FOR_QA evidence · Nest /core 0 · must_keep ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT/CORE · printable false · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · PAY OUT
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-be-02.md
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-09-cluster-qa-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md
  - apps/api/hrm-api/src/attendance/leave-requests.service.ts (lockPending/settle/release)
cấm: pnpm seed:* for UAT evidence · invent att_leave_hold · Nest /core dual · claim soft=ATT-09 DONE · honesty flip
parallel_optional: PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02 — harden list→detail open so att-09-type-block visible (J-05)
after BE: QA-02 retest J-01..06 · then QC-01 GWC C-SLICE only if PASS · ≠ ATT-09 module UAT
```

---

*End QA-01 · FAIL_TO_PM · 2026-08-09 · stamp ATT09QA1-MSLTKERF*
