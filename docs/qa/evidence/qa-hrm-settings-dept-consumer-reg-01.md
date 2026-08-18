# Evidence — QA-HRM-SETTINGS-DEPT-CONSUMER-REG-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-SETTINGS-DEPT-CONSUMER-REG-01` |
| **from_role** | `pm` |
| **date** | 2026-08-11 |
| **stamp** | **`DEPTCONREG1-MSNI8GJZ`** |
| **ack_status** | **`PASS_TO_PM`** |
| **overall** | **PASS** (U65 browser · không seed) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **portal** | `http://127.0.0.1:5173` · hrm-api `:28001` |
| **commit** | `dc930c5` |
| **runner** | `scripts/qa/_tmp-qa-hrm-settings-dept-consumer-reg-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-qa-hrm-settings-dept-consumer-reg-01.json` |
| **spec_ref** | `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.2 · `po-hrm-settings-catalog-consumer-audit-fe-01.md` |

## Gates

| Gate | Command / artifact | Result |
|------|-------------------|--------|
| **L0** | `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |
| **Vitest** | `contractFormFieldResolver` + `po-hrm-settings-catalog-consumer-audit-fe-01` | **9/9** pass |
| **Browser** | Employee + JobRequisitions dept pickers vs settings-catalogs EFF | **PASS** (2/2 beyond Contracts) |

## SoT parity — `departments` EFF

| Source | Result |
|--------|--------|
| `GET /api/hrm/settings-catalogs?company_id=main` | **200** |
| **EFF count** | **6** codes: `DEPT_01`…`DEPT_04`, `swpnhpjgrmast`, `swpnhwvtomast` |

## AC-SET-CONSUMER-DEPT-EMP-01 — Employee form (RETAIN)

| Check | Result |
|-------|--------|
| **Verdict** | **PASS** |
| **URL** | `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| **Click path** | Nhân viên → **Thêm** → mở `hdsd-employee-form-dialog` → **Phòng ban** `CatalogSearchPicker` |
| **Options** | **6** × `catalog-picker-option-*` (sample `catalog-picker-option-DEPT_01`) |
| **EFF match** | picker **6** = API EFF **6** (full code set match) |
| **Console** | 0 `Uncaught` · no HRM 500 storm |

## JobRequisitions — dept consumer (matrix leg, beyond Contracts)

| Check | Result |
|-------|--------|
| **Verdict** | **PASS** |
| **URL** | `…/hr/recruitment?…&tab=requisitions` |
| **Click path** | Tuyển dụng → Yêu cầu TD → **Thêm** → `hdsd-requisition-form-ready` → `hdsd-requisition-department` |
| **Options** | **6** catalog options — same codes as EFF |
| **EFF match** | picker **6** = API EFF **6** |

## BR-SET-CONSUMER-DEPT-REG-01

| Check | Result |
|-------|--------|
| **Vitest** | `REQUIRED_CONTRACT_FORM_FIELDS` includes `department` · resolver union — **pass** |
| **Browser regression** | Dept consumer on **≥2** non-Contracts screens (Employee + JobRequisitions) with catalog parity — **pass** |
| **Contracts slice** | **AC-SET-CONSUMER-DEPT-CTR-01** — **CLOSED** · not re-stamped (`QACONPAYSTQC1` / `SETW3SWPQC1` seals retained) |

## Screenshots

- `docs/qa/evidence/screens/qa-hrm-settings-dept-consumer-reg-01/employee-form-dept-picker.png`
- `docs/qa/evidence/screens/qa-hrm-settings-dept-consumer-reg-01/job-requisition-dept-picker.png`

## Honesty / must_keep

| Flag | Value |
|------|--------|
| `settings_catalog_e2e_ready` | **`false`** — **DENY flip** |
| **BR-SET-CONSUMER-MATRIX-01** | **OPEN** — full UF-HRM-10 matrix not claimed |
| **AC-SET-CONSUMER-CH-REC-01** | **OPEN** — `recruitment_channels` consumer (out of scope this WI) |
| **W3 / ATT / PAY seals** | **RETAIN** — no re-stamp SEALED tabs |

## completion_report

**Closed:** L0 PASS · vitest BR dept resolver regression · browser U65 on **Employee form** and **JobRequisitions** department pickers — options match `settings-catalogs` departments EFF (6/6). **BR-SET-CONSUMER-DEPT-REG-01** regression satisfied for this release slice.

**Open:** Full consumer matrix (`BR-SET-CONSUMER-MATRIX-01`) · `recruitment_channels` on REC forms · module-level `settings_catalog_e2e_ready`.

## next_owner

`pm` — update §6.2 BR row if promoting; optional narrow `qc` on dept regression only.

## next_dispatch_prompt

```text
work_item_id: PM-HRM-SETTINGS-DEPT-CONSUMER-SEAL-01
read_first: docs/qa/evidence/qa-hrm-settings-dept-consumer-reg-01.md
entry: QA PASS_TO_PM stamp DEPTCONREG1-MSNI8GJZ; must_keep SETW3SWPQC1 QACONPAYSTQC1
exit: Bus note BR-SET-CONSUMER-DEPT-REG-01 regression PASS (vitest+browser); keep settings_catalog_e2e_ready=false; dispatch ba-data BR-SET-CONSUMER-MATRIX-01 if matrix P0 still OPEN
```

**ack_status:** **PASS_TO_PM**
