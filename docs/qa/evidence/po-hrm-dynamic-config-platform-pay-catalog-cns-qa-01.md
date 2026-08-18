# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01` |
| **parallel** | `CNS-FE-01` READY (picker UX OBS on employee C&B; invent 4xx proven via Network) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser UF + same-session Network · **no** seed scripts |
| **Honesty** | `payroll_e2e_ready=false` · formula LIVE **DENIED** · seals **RETAIN** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **stamp** | `PAYCNSQA-MSJ6E3QM` |
| **commit** | `dc930c5` |

---

## 1. Environment / entry

| Check | Result |
|-------|--------|
| L0 `hrm-api` `:28001` | **200** |
| L0 portal `:5173` | **200** |
| Dist CNS assert | **PASS** — `salary-component-consumer-assert.js` + peers present; `HRM-SC-COMP-KEY` in constants |
| Nest SC active ≥1 | **PASS** — GET `/payroll/salary-components` **200** · **active=14** (no seed) |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-pay-catalog-cns-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-pay-catalog-cns-qa-01.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-pay-catalog-cns-qa-01/` |

---

## 2. AC matrix

| AC / check | Expected | Actual | Verdict |
|------------|----------|--------|---------|
| **DIST-CNS-ASSERT** | Assert + KEY in dist | present · KEY=true · missing=0 | 🟢 |
| **L0-STACK** | HRM+portal 200 | 200/200 | 🟢 |
| **ENTRY-NEST-ACTIVE-GTE1** | Nest ≥1 no seed | active=14 | 🟢 |
| **L2-PAYROLL-LOAD** | No ERROR banner | Clean | 🟢 |
| **AC-PLT-PAY-01c** | Admin CREATE N+1 → **201** | Browser `CNSQA_J6E3O4` → **201** `HRM-SC-201` · free-text code (admin open) | 🟢 |
| **AC-PLT-PAY-01c-F5** | F5 row còn | List total **15** · row `CNSQA_J6E3O4` visible | 🟢 |
| **AC-PAY-COMP-01-TPL** | Invent template → 4xx `HRM-SC-COMP-KEY` | PUT lines fake UUID → **422** `HRM-SC-COMP-KEY` | 🟢 |
| **AC-PAY-COMP-01-TPL-NO-PERSIST** | No F5 persist invent | lines GET không chứa fake id | 🟢 |
| **AC-PAY-COMP-01-COMP** | Invent compensation → 4xx KEY | POST package `ZZ_INVENT_CNS_NEVER` → **422** `HRM-SC-COMP-KEY` | 🟢 |
| **AC-PLT-PAY-01-PICKER-OBS** | FE C&B picker/hint | Employee deep-link: panel not opened → **OBS** (CNS-FE-01 residual UX; BE KEY closed) | 🟡 OBS |
| **AC-PLT-PAY-01H** | Honesty locks | false · LIVE DENIED · seals RETAIN · C-SLICE-≠-MODULE · U65 | 🟢 |

**Score:** 10 PASS · 0 FAIL · 1 OBS

---

## 3. HDSD / click path (U65)

### UF — Admin CREATE N+1 (AC-PLT-PAY-01c)

1. Login `ceo@xe.vn` → `/hr/payroll` (`data-testid=payroll-tab-components`)
2. Tab **Thành phần lương** → **+ Thêm mới**
3. Dialog free-text **Mã thành phần** `CNSQA_J6E3O4` (admin open — Nest note on dialog; Settings ≠ SoT)
4. Network **POST** `/api/hrm/payroll/salary-components` → **201** `HRM-SC-201`
5. F5 / reload → row `CNSQA_J6E3O4` in company catalog (15)

**Screens:** `03-admin-add-dialog.png` · `04-admin-f5.png`

### UF / Network — Invent reject (AC-PAY-COMP-01)

| Surface | Action | Network |
|---------|--------|---------|
| **S-PAY-CNS-01** template | Same-session PUT `/pay-sheet-templates/{id}/lines` với `componentId` UUID không ∈ Nest | **422** `HRM-SC-COMP-KEY` · message invent/OOS forbidden |
| **S-PAY-CNS-03** compensation | Same-session POST `/contracts-insurance/compensation-packages` dòng allowance `component_code=ZZ_INVENT_CNS_NEVER` | **422** `HRM-SC-COMP-KEY` |
| Persist | GET template lines / no package create | **không** persist invent |

---

## 4. Honesty / cấm (locked)

| Item | Status |
|------|--------|
| `payroll_e2e_ready` | **false** — DENIED flip |
| Formula LIVE / invent LIVE | **DENIED** |
| Seed in evidence | **DENIED** (Nest 14 pre-existing admin/Allowance) |
| Reopen PAY-CATALOG / EXT / EMP / DEC / CTR / LIST-TOTALS / J-HRM-07 | **SEAL RETAIN** |
| Module PAY UAT / Phase1 DONE | **not promoted** |
| **`C-SLICE-≠-MODULE`** | CNS consumer assert ≠ payroll E2E UAT |

---

## 5. Residual / not promoted

| ID | Severity | Note |
|----|----------|------|
| **OBS-FE-CB-PICKER** | P3 OBS | Employee `/hr/employees/:id` C&B tab/picker not asserted this run — invent KEY proven on Network; CNS-FE-01 READY for follow-up browser UF if PM wants picker click path |
| Formula soft warn VAL-PAY-CNS-07 | OOS | LIVE DENIED |
| Pack invent S-PAY-CNS-02 spot | OOS | Template + compensation covered primary AC-PAY-COMP-01 |

**No P0 stale-dist.** No devops residual.

---

## 6. Defect register

None opened. No FAIL.

---

## 7. completion_report

**Closed:** CNS-QA-01 U65 — Nest active≥1; dist KEY present; browser admin CREATE `CNSQA_J6E3O4` **201** + F5 (AC-PLT-PAY-01c); invent template UUID + compensation unknown code → **422 `HRM-SC-COMP-KEY`** · no persist (AC-PAY-COMP-01); honesty false · seals RETAIN · C-SLICE-≠-MODULE.

**Residual:** OBS only — employee C&B picker UX click path not closed (BE invent KEY PASS).

---

## 8. Handoff

- **next_owner:** `qc` (narrow GWC CNS slice) — or `pm` seal then QC
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-qa-01.md`
- **machine:** `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-pay-catalog-cns-qa-01.json`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-QA-01
program: PO-HRM-CONTINUOUS-W8-20260807

read_first:
1. docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-qa-01.md
2. docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-be-01.md
3. docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-fe-01.md

entry_criteria: QA PASS stamp PAYCNSQA-MSJ6E3QM · U65 · Nest≥1 · invent KEY 422 · admin 201
exit_criteria:
- Narrow GWC CNS consumer assert only (AC-PAY-COMP-01 · AC-PLT-PAY-01c)
- Honesty: payroll_e2e_ready=false · formula LIVE DENIED · seals RETAIN · C-SLICE-≠-MODULE
- DENY flip ready · reopen PAY-CATALOG/EXT/EMP/DEC/CTR/LIST-TOTALS · claim module PAY UAT
- evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-qc-01.md
- ack_status: PASS_TO_PM GO|GWC|NO-GO

OBS residual (non-blocking): employee C&B picker browser UF — optional FE QA if sponsor wants AC-PLT-PAY-01 picker click
```
