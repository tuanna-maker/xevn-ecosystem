# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DEVOPS-01` READY_FOR_QA (closes `D-DEC-PLT-STALE-DIST`) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · query `company_id=holding` · header `x-company-id=main` · member OOS `du-lich.ceo@xe.vn` |
| **Stamp (retest PASS)** | `DECPLATQA-MSJ1FB3D` |
| **Prior FAIL stamp** | `DECPLATQA-MSJ14FCK` |
| **DevOps stamp** | `DECPLATDEVOPS-MSJ1K9XZ` |
| **U65** | zero-seed · L1 API smoke only · **browser Settings UF HOLD** |
| **Honesty** | decisions / personnel / e2e / pay / att / rec / contracts_printable = **false LOCKED** (no flip) |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 AC 12/12) — browser FE HOLD · **DENIED** DEC module UAT |

---

## Retest rollup (after DEVOPS-01)

| Check | Result |
|-------|--------|
| L0 `GET /api/hrm` | **200** `HRM-HEALTH-200` |
| Unauth list + effective | **401** `HRM-AUTH-001` (not 404) — `D-DEC-PLT-STALE-DIST` **CLOSED** |
| Dist `hr-decision-type.service.js` | **present** · controller has `decision-types/effective` · mtime **14:21:27Z** ≥ src **14:08:19Z** |
| Login `ceo@xe.vn` | **201** |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-dec-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-qa-01.FINAL.json` |
| Pass count | **12/12** · fail **0** |
| Open key created | `hr_custom_dec_09_msj1fb3d` → id `21506dac-a9b2-487d-a6ff-e3bd20a954d1` |
| Seed | none (U65) |

**spec_ref:** F-DEC-CAT-TYP/EFF · AC-PLT-DEC-01..06 · VAL-DEC-CAT/CNS/ALS/SCP · BE `po-hrm-dynamic-config-platform-dec-be-01.md` · DevOps `po-hrm-dynamic-config-platform-dec-devops-01.md`

---

## L1 results (VAL-DEC-CAT / CNS / ALS / SCP)

| # | Check | Expected | Actual | Verdict |
|---|-------|----------|--------|---------|
| 0 | Stale-dist gate list+effective unauth | 401/403 not 404 | **401** / **401** | 🟢 |
| 1 | `GET …/decision-types?company_id=holding` | 200 rows/`[]` | **200** `HRM-DEC-TYP-200` total=0 (empty OK U65) | 🟢 |
| 2 | `POST` open key `hr_custom_dec_09_*` | 2xx | **201** `HRM-DEC-TYP-201` | 🟢 |
| 3 | Invalid format (space / leading digit) | 400 `HRM-PLT-CAT-CODE-INVALID` | **400** / **400** | 🟢 |
| 3b | Uppercase-alone `HRD_QA_*` | VALID (DEC allows case) | **201** | 🟢 |
| 4 | `GET …/decision-types/effective` | 200 + open key ∈ union | **200** total=5 · `openInEff=true` · sources `dec_native,group_ref` | 🟢 |
| 5 | VAL-DEC-CNS-01 unknown type when catalog >0 | 400 `HRM-DEC-TYPE-UNKNOWN` | **400** `HRM-DEC-TYPE-UNKNOWN` | 🟢 |
| 6 | `POST …/:id/retire` + list hide | retired; active hide | **201** `status=retired` · hidden=true | 🟢 |
| 7 | scope_parity group CEO holding↔main | list↔get | get holding **200** · get main **200** | 🟢 |
| 7b | member OOS `du-lich.ceo` | deny 403/404/**409** | **409** `SCOPE_CONTEXT_MISMATCH` | 🟢 |
| 8 | FORBIDDEN hard-delete | no DELETE success | **404** `HRM-DATA-404` | 🟢 |
| 9 | honesty + FE HOLD stamps | false / HOLD | **LOCKED false** · FE HOLD | 🟢 |

**AC-PLT-DEC browser Settings pickers:** **⬜ HOLD** — FE not in scope; PM gates `DEC-FE-01` only after L1 QC SEAL (QA does **not** dispatch FE).

**Note (normalize):** DEC key format is `^[a-zA-Z][a-zA-Z0-9_]*$` — hyphen **not** accepted (unlike EMP `full-time`→`full_time`). Format reject covers spaces/leading digit; uppercase alone **VALID** per BR-PLT-05 / HRD_* style.

---

## Key network stamps (truncated)

```text
GET  /api/hrm                                                      → 200 HRM-HEALTH-200
GET  /api/hrm/decisions/decision-types?company_id=holding (unauth) → 401 HRM-AUTH-001
GET  /api/hrm/decisions/decision-types/effective?… (unauth)        → 401 HRM-AUTH-001
POST /api/xbos/auth/login                                          → 201 ceo@xe.vn
GET  /api/hrm/decisions/decision-types?company_id=holding          → 200 HRM-DEC-TYP-200 total=0
POST /api/hrm/decisions/decision-types (open key)                  → 201 HRM-DEC-TYP-201 id=21506dac-…
POST … decisionTypeKey="BAD KEY" / "9bad_key"                      → 400 HRM-PLT-CAT-CODE-INVALID
POST … HRD_QA_*                                                    → 201 (case allowed)
GET  …/decision-types/effective                                    → 200 total=5 openInEff=true dual SoT
POST /api/hrm/decisions (unknown type)                             → 400 HRM-DEC-TYPE-UNKNOWN
POST …/decision-types/:id/retire                                   → 201 status=retired + list hide
GET  …/:id holding + main                                          → 200 / 200
GET  member OOS holding row                                        → 409 SCOPE_CONTEXT_MISMATCH
DELETE …/decision-types/:id                                        → 404 (no hard-delete)
```

---

## Residual / defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **D-DEC-PLT-STALE-DIST** | — | **CLOSED** by DEVOPS-01 (`DECPLATDEVOPS-MSJ1K9XZ`) — verified this retest | — |
| **R-PLT-DEC-FE-01** | HOLD | Browser Settings / DEC CFG pickers | **dev-fe** after QC L1 SEAL (PM gate) |
| VAL-DEC-CNS-02..04 / CAT-06..10 | deferred | person-bound/WH flag deep + WH-REQUIRED | post FE / separate wave if needed |

**not promoted:** decisions UAT · honesty flip · Settings browser UF · WH spine wipe · module UAT · Phase1 DONE

**Seed:** none (U65)

---

## Prior FAIL (archived — stale dist)

| Stamp | Verdict | Root cause |
|-------|---------|------------|
| `DECPLATQA-MSJ14FCK` | FAIL_TO_PM | Runtime missing `hr-decision-type.service.js`; unauth `/effective` → **404** Cannot GET; list 401 false-positive (param-swallow risk) |

See appendix below / DevOps evidence for rebuild proof.

---

## Honesty

| Flag | Value |
|------|-------|
| Decisions / QSĐ module UAT | **false** LOCKED |
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| `attendance_uat_ready` | **false** |
| `recruitment_uat_ready` | **false** |
| `contracts_printable_ready` | **false** |
| Settings browser UF | **HOLD** — not PASS |
| Seed in UF | **forbidden** / none used |

---

## completion_report

**Closed:** L1 DEC platform catalog retest **PASS** after DevOps rebuild; stamp `DECPLATQA-MSJ1FB3D`; `D-DEC-PLT-STALE-DIST` verified closed (unauth list+effective **401** not 404; dist has `hr-decision-type.service.js` + `decision-types/effective`); open key create; format reject + uppercase VALID; effective dual SoT (`dec_native`+`group_ref`); CNS unknown **400**; retire hide; CEO scope_parity holding↔main; member OOS **409**; hard-delete absent; honesty **LOCKED false**; FE HOLD honored.

**Residual:** Browser FE HOLD (`R-PLT-DEC-FE-01`) — PM may dispatch QC L1 SEAL then `DEC-FE-01`; do **not** flip decisions/personnel honesty; do **not** claim DEC module UAT.

**Forbidden claims:** decisions UAT · Settings browser PASS · flip `*_ready` · Phase1 DONE · FE dispatch before QC SEAL (PM-owned).

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** (L1 SEAL) → then PM gates **dev-fe** `DEC-FE-01` |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-qa-01.FINAL.json` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01 PASS_TO_PM (L1 AC 12/12)
program: PO-HRM-CONTINUOUS-W8-20260807
stamp_ref: DECPLATQA-MSJ1FB3D · devops DECPLATDEVOPS-MSJ1K9XZ · prior FAIL DECPLATQA-MSJ14FCK

## entry_criteria
- Evidence PASS: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-01.md
- Machine: docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-dec-qa-01.FINAL.json (12/12)
- DevOps closed D-DEC-PLT-STALE-DIST: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-devops-01.md
- U65 zero-seed · honesty decisions/personnel/e2e/pay/att/rec/printable =false LOCKED
- must_keep: F-CORE-DEC create/approve/WH spine · EMP DOC/ET · ATT leave · REC stages
- browser UF HOLD — do not claim Settings pickers PASS

## task
1) Audit L1 AC vs exit (list/create open key, format INVALID, uppercase VALID, effective dual SoT, CNS UNKNOWN 400, retire hide, CEO scope_parity, member 409 OOS, FORBIDDEN hard-delete)
2) Confirm D-DEC-PLT-STALE-DIST CLOSED (unauth list+effective 401 not 404; dist hr-decision-type.*)
3) Gate: GO WITH CONDITIONS (FE browser) or GO L1-SEAL — residual R-PLT-DEC-FE-01 → DEC-FE-01
4) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-01.md
5) DENIED: decisions UAT · honesty flip · browser UF PASS · Phase1 DONE · FE dispatch until QC SEAL

## exit
ack_status PASS_TO_PM · next_dispatch_prompt = PM → DEC-FE-01 (Settings/DEC CFG pickers) after QC SEAL
```

---

## Appendix — prior FAIL body (2026-08-07 first run)

First QA run against pre-rebuild runtime:

| Probe | Actual |
|-------|--------|
| Unauth list | **401** (false-positive param-swallow risk) |
| Unauth `/effective` | **404** Cannot GET |
| Dist `hr-decision-type.service.js` | **missing** |
| Controller `decision-types/effective` | **absent** |
| L1 VAL-DEC-CAT/CNS | ⬜ blocked — fail-closed |

Handoff then: **DEVOPS-01** → rebuild+restart → QA retest (completed this wave, stamp `DECPLATQA-MSJ1FB3D`).
