# Evidence — PO-HRM-MVP-GD1-CORE-07-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-07-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-07) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE07QA1-MSLJSPGO` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-CORE-07` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · emp `3ad58ec2-d480-47e8-b781-91904c561294` (holding · pending_docs→active) |
| **Honesty** | `hrm_personnel_uat_ready=false` · `contracts_printable_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · checklist≠CORE-07 DONE · free PATCH≠DONE · soft≠CORE-06 DONE · U65 zero-seed |
| **depends_on** | BE-01 READY · FE-01 READY · API-01 CONFIRMED · `CORE06QC1-MSLID363` soft≠DONE · `CORE03QC1-MSLFJH0K` · Nest `/core` DENY |
| **env** | portal `:8080` (5173 down) · hrm-api `:28001` rebuild+restart LIVE · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-07-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-07-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-07-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim CORE-07 / checklist / free PATCH / CORE-06 / PAY / CORE-09 / ATT enroll DONE · **DENY** honesty flip · **DENY** seed |
| **L0** | hrm **200** · xbos **200** · portal `:8080` **302** (ok) |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** · **J-05 PASS** |
| **Nest `/core` ACT** | probe **404** · Network SoT non-404 **= 0** |
| **Seed** | **none** · product-path POST employee `pending_docs` when catalog empty of pending (≠ seed densify) |

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | AC-CORE-07-* · J-HRM-CORE-07-01..05 · O1–O12 |
| API-01 | F-CORE-ACT-01 POST `/employees/:id/activate` · R-CORE-07-GATE-01 · R-CORE-07-EFF-01 · R-CORE-07-ATT-12 |
| BE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-be-01.md` READY |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-fe-01.md` READY |
| CORE-06 QC | **`CORE06QC1-MSLID363`** soft≠DONE RETAIN · QA **`CORE06QA2-MSLI95K8`** |
| CORE-05 QC | **`CORE05QC1-MSLGVT40`** RETAIN |
| CORE-03 QC | **`CORE03QC1-MSLFJH0K`** CHK RETAIN · **≠** claim CHK = CORE-07 DONE |
| CORE-02b / 09d..01 | peer stamps RETAIN · **not reopened** |
| PAY / CORE-09 / ATT enroll | **OUT invent DONE** |

**Dist LIVE:** `emp-activate.constants.js` · controller `POST :employeeId/activate` · `evaluateActivationGate`.

---

## Browser U65 — journeys

Persona: portal auth inject · Profile `/hr/employees/{id}` · panel **Kích hoạt Hoạt động** · **zero-seed**.

**hdsd_align:** Hồ sơ NV → panel `hdsd-emp-activate-*` · tab Giấy tờ `hdsd-emp-document-checklist` / `hdsd-emp-chk-approve`.

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-CORE-07-01** | Profile CTA incomplete | panel `data-can-activate=0` · badge «Chưa đủ checklist» · `blocking_items` visible · footer checklist≠DONE · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-07-02** | Checklist đủ → **Kích hoạt** → F5 | **POST** `/api/hrm/employees/:id/activate?company_id=main` → **201** `HRM-EMP-ACT-200` · via **CTA** · F5 panel-active «Hồ sơ đang Hoạt động» · status `active` · `events[]` `employee.activated` · Nest `/core` 0 | **PASS** |
| **J-HRM-CORE-07-03** | Incomplete → activate | **POST** activate → **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` · status unchanged `pending_docs` · F5 panel still pending | **PASS** |
| **J-HRM-CORE-07-04** | Free PATCH ≠ DONE · ATT OUT | Free PATCH `{status:active}` (no date) → **400** `HRM-EMP-ACT-400` · **no** bypass · footer free PATCH≠DONE · ATT emit cite · **≠** invent ATT/PAY/CORE-09 DONE | **PASS** |
| **J-HRM-CORE-07-05** | Seals · honesty · Nest | Nest ACT **404** · nest SoT non-404 **0** · CORE-06/05/03 seals cite · soft≠CORE-06 DONE · honesty false · no reopen J-* | **PASS** |

Screens: `01-profile-activate` … `09-done`.

---

## AC map

| AC | Result |
|----|--------|
| **AC-CORE-07-01/02** activate POST 2xx + F5 Hoạt động | **PASS** — 201 `HRM-EMP-ACT-200` · status `active` |
| **AC-CORE-07-03** can_activate / blocking_items | **PASS** (J-01 can=0 + blocking) |
| **AC-CORE-07-04** incomplete 409 | **PASS** (J-03) |
| **AC-CORE-07-≠-CHK-DONE** | **PASS** — footer |
| **AC-CORE-07-≠-PATCH-DONE** | **PASS** — free PATCH 400 ACT-400 · footer |
| **AC-CORE-07-05** effective_date | **PASS** — body `dd/MM/yyyy` · free PATCH missing date 400 |
| **AC-CORE-07-06 / ATT-OUT** | **PASS** — `employee.activated` in response events · **≠** invent ATT DONE |
| **AC-CORE-07-MK-06/05/03** | **PASS** — seals RETAIN · soft≠CORE-06 DONE |
| **Nest `/core` DENY** | **PASS** |
| **Honesty / C-SLICE** | **PASS** (false · no flip · **≠** claim CORE-07 DONE) |

---

## Residuals / OBS

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CORE-07-FE-EMPLOYEE-RECORD** | **P2 OBS** | **dev-fe** (idle-ok seat) | `EmployeeProfile` mounts `EmployeeActivatePanel` **without** `employeeRecord` (`can_activate` / `blocking_items` from GET). FE-derive from checklist instances only — synthetic DOC-required without instance can show CTA can=1 until instances materialize. BE GATE still authoritative on POST (409). **≠** block QC seat; recommend FE-02 bind `employeeRecord={employee}` |
| **R-CORE-07-HONESTY** | INFO | **qc** | C-SLICE · checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · CORE-05/03 seals · PAY/CORE-09/ATT OUT · **DENY** claim CORE-07 DONE |

**Fixture note:** When holding had 0 `pending_docs`, QA created ST catalog keys `pending_docs`/`active` + POST employee via product API (same persona) — **not** `pnpm seed:*`.

**Ops:** hrm-api rebuilt + restarted on `:28001` before browser (dist activate LIVE).

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed · Nest /core ACT dual DENY
DENY invent CORE-07 / PAY / CORE-09 / ATT enroll DONE
DENY checklist đủ / badge alone = CORE-07 DONE
DENY free PATCH status = CORE-07 DONE
DENY soft Profile = CORE-06 DONE
CORE-06 soft≠DONE RETAIN (CORE06QC1-MSLID363)
CORE-05 / CORE-03 seals RETAIN
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | QA-01 **PASS_TO_PM**: J-HRM-CORE-07-01..05 **PASS** · L0 PASS · POST activate **201** `HRM-EMP-ACT-200` + F5 Hoạt động · GATE incomplete **409** `HRM-EMP-ACT-CHECKLIST-INCOMPLETE` · free PATCH **400** `HRM-EMP-ACT-400` · Nest `/core` ACT **0** · footer checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE · seals RETAIN · honesty false · C-SLICE · **≠** claim CORE-07 DONE · OBS P2 Profile omit `employeeRecord` |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-qa-01.md` |
| **stamp** | `CORE07QA1-MSLJSPGO` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-07-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-07
depends_on: QA-01 PASS_TO_PM · stamp CORE07QA1-MSLJSPGO · docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-qa-01.md · BE-01 · FE-01 · API-01 CONFIRMED · U65 · CORE06QC1 soft≠DONE · CORE03QC1 · Nest /core 0
entry_criteria: audit QA evidence J-01..05 · Network POST …/activate 201 · GATE 409 · free PATCH 400 ACT-400 · Nest /core 0 · honesty false · C-SLICE
exit_criteria: GO or GWC · stamp · DENY claim CORE-07 DONE · DENY checklist/free PATCH/soft=CORE-06 DONE · DENY invent PAY/CORE-09/ATT DONE · residual OBS R-CORE-07-FE-EMPLOYEE-RECORD P2 idle-ok · next_dispatch_prompt governance/peer
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-07-cluster-qc-01.md
cấm: seed · Nest /core SoT · claim CORE-07 DONE · honesty flip · reopen sealed J-*
```
