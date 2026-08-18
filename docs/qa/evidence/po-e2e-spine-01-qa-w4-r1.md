# Evidence — PO-E2E-SPINE-01-QA-W4-R1 (HP-04 retest after BE-CAND-DTO-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-QA-W4-R1` |
| **program** | `PO-E2E-BIZ-SPINE-01` · spine **E2E-SPINE-01** |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD · portal `:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · **no** `pnpm seed:*` · **no** invent hire rows via DB/API for UF PASS |
| **prior FAIL** | `po-e2e-spine-01-qa-w4.md` — POST **400** `HRM-VAL-001` |
| **BE READY** | `po-e2e-spine-01-be-cand-dto-01.md` · `READY_FOR_QA` |
| **HP-03** | CLOSED · stamp `SP2SDD8FM8` · requisition `34a421e7-…` — **not** reopened |
| **harness** | `scripts/qa/po-e2e-spine-01-qa-w4-r1-browser.mjs` |
| **raw** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w4-r1-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w4-r1-20260803/` |
| **test_log** | `docs/qa/evidence/po-e2e-spine-01-qa-w4-r1-test-log.md` + `.json` |
| **cand stamp** | `SP4SDEKW49` |
| **ack_status** | **PASS_TO_PM** |

## spec_read_ack

- program: `PO_E2E_BUSINESS_SPINE_PROGRAM.md` § E2E-SPINE-01 · HP-04 / HP-05
- BA: `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` HP-04
- journeys: **J-REC-WF-04** · **J-HRM-05** · UF-HRM-12
- hdsd_align (U76): `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` CH07 §6 Thêm ứng viên · §6 Chuyển giai đoạn · §13 Liên kết nhân viên
- U65 · U78 · anti-idle
- **must_keep:** Leave / LV-03/04 · AUTH / EMP / CAT · HP-03 — **not** reopened

## hdsd_inventory (this wave)

| HDSD | Control | Executed |
|------|---------|----------|
| CH07 §3 | YCTD context `SP2SDD8FM8` / `34a421e7` | 🟢 visible on requisitions |
| CH07 §6 | Tab **Ứng viên** | 🟢 mount |
| CH07 §6 | **Thêm ứng viên** → form → Lưu | 🟢 POST **201** `HRM-REC-CP-201` · F5 stamp on list |
| CH07 §6 / §13 | Chuyển **Đã tuyển** → HireEmployeeLinkDialog | 🟢 dialog · pick emp · confirm · PATCH **200** `HRM-REC-CP-200` · F5 hired |
| HP-05 NV/HĐ | after hire soft-link | 🟡 emp detail OK · candidate stamp not on emp list (expected soft link) · contracts surface weak |

## 0. Runtime note (attempt 1 → restart → attempt 2)

| Probe | Fact |
|-------|------|
| Attempt 1 (15:45Z) | POST candidates still **400** `HRM-VAL-001` same whitelist props — **stale hrm-api** |
| Dist DTO | `create-candidate.dto.js` had `position` / `nationality` / … · LastWrite **10:41:22** local |
| Process on `:28001` | started **10:37:26** — before dist rebuild |
| Action | QA restarted `dev:hrm-api` (PID 23180→8956) · health **200** after ~28s |
| Attempt 2 (15:47–15:48Z) | create **201** + hire **200** — evidence below is attempt 2 only |

## 1. L0

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| Portal `:5173` | **200** |

## 2. Browser HP-04 (27 clicks · idle_guard PASS · seed=false)

| Step | Case | Verdict | Evidence |
|------|------|---------|----------|
| **L0** | stack | 🟢 | hrm+xbos+portal 200 |
| **HP04_CTX** | YCTD after Inbox approve | 🟢 | requisition id=`34a421e7-33df-4c8b-b96c-559082b78086` · stamp `SP2SDD8FM8` |
| **HP04_CREATE** | Thêm UV → Lưu → F5 | 🟢 | POST `/api/hrm/recruitment/candidates` **201** `HRM-REC-CP-201` · candId=`6f6d2250-2bc1-4d36-9228-a63299d011f8` · stamp `SP4SDEKW49` on list after F5 |
| **HP04_HIRE** | stage Đã tuyển + HireEmployeeLinkDialog | 🟢 | dialog visible · pick `UAT-0020` · PATCH stage **200** `HRM-REC-CP-200` · employee_id=`5c3ea407-02cb-4cfa-a36c-9ada56908010` · F5 hired shown |
| **HP05** | emp/contract after hire | 🟡 | no Sync ERROR · detailOk · stamp not on emp list (soft link existing NV) · contracts chrome weak — **not** G-DB-01 block |

### Click path (executed)

1. Inject portal auth `ceo@xe.vn` → `:5173`
2. `/hr/recruitment?tab=requisitions` — confirm YCTD `SP2SDD8FM8` / `34a421e7`
3. `/hr/recruitment?tab=candidates` → **Ứng viên**
4. **Thêm ứng viên** → fill Họ tên `Nguyen Hire Pay SP4SDEKW49` · email · vị trí · Lưu
5. Observe POST **201** · F5 · stamp on list
6. Row stage → **Đã tuyển** → HireEmployeeLinkDialog → pick emp → **Xác nhận chốt tuyển**
7. F5 · filter Đã tuyển · stamp retained
8. `/hr/employees` · `/hr/contracts` smoke (HP-05 soft)

### Network (key)

| Call | Status | Code / note |
|------|--------|-------------|
| `GET …/requisitions?company_id=main` | **200** | hasLegacy stamp · id `34a421e7-…` |
| `POST …/recruitment/candidates` | **201** | `HRM-REC-CP-201` · id `6f6d2250-…` · stage `applied` — **not** HRM-VAL-001 |
| `PATCH …/candidates-pool/{id}/stage?company_id=main` | **200** | `HRM-REC-CP-200` · employeeId `5c3ea407-…` |

### G-DB-01 note

Hire path **not** blocked — FE dialog supplied `employee_id` before stage=hired. Residual from TechSpec G-DB-01 (hired without employee_id → 400) remains an honest API guard; **not** opened as UF blocker this wave.

## 3. Verdict matrix

| Gate | Result |
|------|--------|
| L0 stack | 🟢 PASS |
| HP-03 prior closed | 🟢 not reopened |
| HP-04 create FE HDSD | 🟢 PASS (after hrm-api restart to load DTO) |
| HP-04 hire / J-REC-WF-04 | 🟢 PASS |
| HP-05 emp/contract | 🟡 soft residual (soft-link) |
| Seed | 🟢 none |
| idle_guard | 🟢 27 clicks (≥6) |
| LV-03/04 / Leave / AUTH / EMP / CAT | 🟢 **not** reopened |
| Phase1 / UAT DONE claim | 🟢 **not** claimed |

**Overall:** `PASS_TO_PM` — residual **R-PO-SPINE01-CAND-HIRE** **CLOSED**.

## 4. Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| ~~R-PO-SPINE01-CAND-HIRE~~ | — | — | **CLOSED** — create 201 + hire 200 + F5 |
| R-PO-SPINE01-HP05-SOFT | P2 | defer / next HP-05 wave | soft-link: candidate stamp absent on emp list; contracts chrome weak — not hire blocker |
| R-PO-SPINE01-PAYROLL-BLANK | P1 | defer | HP-06 — not this wave |
| R-PO-SPINE01-RUNTIME-STALE | P2 | devops / BE handoff | BE READY claimed while live Nest still pre-dist — require restart note in READY_FOR_QA |
| must_keep | — | — | Leave / AUTH / EMP / CAT · HP-03 · LV-03/04 CLOSED |

## 5. Handoff

```
ack_status: PASS_TO_PM
next_owner: pm
evidence_path: docs/qa/evidence/po-e2e-spine-01-qa-w4-r1.md
test_log: docs/qa/evidence/po-e2e-spine-01-qa-w4-r1-test-log.md + .json
```

### completion_report

- Closed this wave: L0; YCTD context; HDSD Thêm ứng viên → POST **201** (closes W4 VAL-001); F5 list; stage Đã tuyển → HireEmployeeLinkDialog → PATCH **200** with employee_id; F5 hired; R-PO-SPINE01-CAND-HIRE CLOSED; no seed; must_keep untouched.
- Open / residual: HP-05 soft (emp stamp/contracts weak) · HP-06 payroll deferred · note stale-runtime on first attempt before QA restart.
- Not claimed: Phase1 / UAT DONE.

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-01-QA-W5
from_role: pm
to_role: qa
lane: execution
priority: P1
entry: docs/qa/evidence/po-e2e-spine-01-qa-w4-r1.md PASS · cand SP4SDEKW49 hired · empId 5c3ea407 · HP-03/04 CLOSED
mission: U65 browser ceo@xe.vn companyId=main — HP-05 harden (NV/HĐ after hire soft-link) + HP-06 payroll blank residual R-PO-SPINE01-PAYROLL-BLANK; U76 HDSD · U78 test_log_required
must_keep: Leave/LV-03/04 · AUTH/EMP/CAT · HP-03/04 — do not reopen
exit: docs/qa/evidence/po-e2e-spine-01-qa-w5.md + test-log.md/json · PASS_TO_PM or FAIL_TO_PM
cấm: seed · claim Phase1/UAT DONE
```
