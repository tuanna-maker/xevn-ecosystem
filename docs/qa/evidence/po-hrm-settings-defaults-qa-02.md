# Evidence — PO-HRM-SETTINGS-DEFAULTS-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-QA-02` |
| **parent** | `PO-HRM-SETTINGS-DEFAULTS-BE-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P0 |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` · catalog partition **`holding`** |
| **Base URL** | `http://127.0.0.1:28001/api/hrm` |
| **Auth** | XBOS `POST /api/xbos/auth/login` → Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| **U65** | zero-seed · **L1 probe secondary only** · **not** UF 🟢 · **no** `pnpm seed:*` |
| **Honesty** | `payroll_e2e_ready=false` · no browser UF · no module UAT / AMIS DONE |
| **Stamp** | `SETDEF2ISS23I` (TAX/SI) · `SETDEF2CSU3JM` (POS) · SI id `d79f049b-8e98-4914-8217-35ccad5b021b` · POS id `60bd4067-80ef-4c6e-a41f-a9954862a22b` · PC `PC_RET_AC81` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-defaults-qa-02.json` · `_tmp-…-qa-02-pos.json` · probe `_tmp-…-qa-02-probe.mjs` |
| **Cite** | `docs/qa/evidence/po-hrm-settings-defaults-be-02.md` · `docs/qa/evidence/po-hrm-settings-defaults-qa-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (hotfix retest L1) |

---

## 1. Environment / L0

| Check | Result |
|-------|--------|
| HRM `:28001/api/hrm` | **200** `HRM-HEALTH-200` |
| XBOS `:28002` login | **201** → token |
| Dist BE-02 markers | `@Allow()` on `value` · `toLeaveDayKey` in SI · `SAVEPOINT pos_sc_count` in POS · process start after dist write |
| `payroll_e2e_ready` | **false** (unchanged; DENIED flip) |

---

## 2. spec_read_ack

| Artifact | Used |
|----------|------|
| `docs/qa/evidence/po-hrm-settings-defaults-be-02.md` | READY_FOR_QA · D-SETDEF-QA-TAX/SI/POS fixes |
| `docs/qa/evidence/po-hrm-settings-defaults-qa-01.md` | FAIL matrix retest targets |
| Live dist settings DTO/services | Whitelist `value` · date coerce · SC SAVEPOINT |

---

## 3. AC matrix (L1 retest vs QA-01 FAIL)

| AC / VAL | Expected after BE-02 | Actual | Verdict |
|----------|----------------------|--------|---------|
| **F-SET-TAX-01 PUT** | `2xx` UPSERT (not `property value should not exist`) | **200** `HRM-SET-TAX-200` · GET-after value `{amount:11000000,currency:VND}` · `companyId=holding` | 🟢 **PASS** (D-SETDEF-QA-TAX-01 **CLOSED**) |
| **VAL-SET-TAX-01/02 bad shape** | `400` `HRM-SET-TAX-400-SHAPE` | **400** `HRM-SET-TAX-400-SHAPE` «amount must be finite number ≥ 0» | 🟢 **PASS** |
| **F-SET-SI-03 PATCH** | `200` · `effectiveFrom` `YYYY-MM-DD` | **200** `HRM-SET-SI-200` · `effectiveFrom=2026-01-01` | 🟢 **PASS** (D-SETDEF-QA-SI-DATE-01 **CLOSED**) |
| **VAL-SET-SI-01 overlap** | `409` `HRM-SET-SI-409-OVERLAP` (not 201) | **409** `HRM-SET-SI-409-OVERLAP` | 🟢 **PASS** |
| **VAL-SET-SI-05 hard DELETE** | `409` | **409** `HRM-SET-SI-409-HARD-DELETE` | 🟢 **PASS** (retain) |
| **F-SET-SI-03 retire** | soft retire | **201** `HRM-SET-SI-200` · GET `status=retired` | 🟢 **PASS** (retain) |
| **F-SET-POS-05 NO_POLICY / SRC-02** | `200` `NO_POLICY` · no emp write | Resolve before create + after retire: `warnings=["NO_POLICY"]` · **no** `employeePackageId` key/value | 🟢 **PASS** (retain SRC-02) |
| **VAL-SET-POS-02 orphan** | `400` `HRM-ALLOW-CAT-ORPHAN-CODE` (not 500 aborted TX) | **400** `HRM-ALLOW-CAT-ORPHAN-CODE` | 🟢 **PASS** (D-SETDEF-QA-POS-TX-01 **CLOSED**) |
| **F-SET-POS-02 create CEO+PC** | `201` (not 500) | **201** `HRM-SET-POS-201` · lines=1 · `companyId=holding` · PC **`PC_RET_AC81`** (active) | 🟢 **PASS** |
| **POS resolve hit** | policy lines · no emp write | **200** · `policyId` set · `warnings=[]` · no `employeePackageId` | 🟢 **PASS** |
| **POS dup active** | `409` | **409** `HRM-SET-POS-409-ACTIVE` | 🟢 **PASS** |
| **POS retire** | soft | **201** · resolve after → `NO_POLICY` | 🟢 **PASS** |

### Note — PC code for create

QA-01 used `PC_DIEU_XE_6A75AC29`; on retest that code is **`retired`/`archived`**. Live active PC = **`PC_RET_AC81`**. Probe used active catalog code (product list, not seed). Orphan path still proven with invented `ORPHAN_*`.

### Probe false start (not product defect)

First POS create attempt with body field `positionLabelSnapshot` → **400** `HRM-VAL-001 property positionLabelSnapshot should not exist` (DTO whitelist). Retest without that field → product path OK. Not filed as residual (probe hygiene).

---

## 4. Defect register (retest)

| ID | Prior | Retest | Status |
|----|-------|--------|--------|
| **D-SETDEF-QA-TAX-01** | PUT whitelist FAIL | PUT 200 UPSERT | **CLOSED** |
| **D-SETDEF-QA-SI-DATE-01** | PATCH 400 + overlap 201 | PATCH 200 YYYY-MM-DD · overlap 409 | **CLOSED** |
| **D-SETDEF-QA-POS-TX-01** | create/orphan 500 aborted TX | orphan 400 · create 201 | **CLOSED** |

---

## 5. Sample payloads (redacted)

### TAX PUT (PASS)

```http
PUT /api/hrm/settings/company-settings
{ "companyId":"main", "settingKey":"pay_tax_personal_deduction_vnd",
  "value": { "amount":11000000, "currency":"VND" } }
→ 200 HRM-SET-TAX-200
GET …?key=pay_tax_personal_deduction_vnd → value persisted · companyId=holding
```

### TAX bad shape (PASS)

```http
PUT … value={ "amount":-1, "currency":"VND" }
→ 400 HRM-SET-TAX-400-SHAPE
```

### SI overlap (PASS)

```http
POST … insuranceTypeKey=BHXH_QA_SETDEF2ISS23I effectiveFrom=2026-01-01 → 201
POST … same type effectiveFrom=2026-06-01 active
→ 409 HRM-SET-SI-409-OVERLAP
```

### POS create + orphan (PASS)

```http
POST … lines=[{ componentCode:"ORPHAN_…" }] → 400 HRM-ALLOW-CAT-ORPHAN-CODE
POST … lines=[{ componentCode:"PC_RET_AC81", amount:500000, calcMode:"fixed" }]
→ 201 HRM-SET-POS-201 id=60bd4067-…
```

### SRC-02 resolve (PASS)

```http
GET …/resolve?positionKey=CEO&asOf=2026-08-07 (after retire)
→ 200 · warnings=["NO_POLICY"] · policyId=null · no employeePackageId
```

---

## 6. Residual / not promoted

| Item | Status |
|------|--------|
| FE Settings tax/SI/POS UF (browser U65) | deferred — L1 only this seat |
| `payroll_e2e_ready=true` | **DENIED** |
| Browser UF 🟢 / J-* Settings | **DENIED** |
| SI-412 process helper live | not in this seat |
| PAY process tax/SI wire | out of scope |

---

## completion_report

### Closed

1. L1 retest after BE-02 on live `:28001` — TAX PUT UPSERT + SHAPE, SI PATCH date + overlap 409, POS orphan 400 + create 201.
2. Retained: SI hard DELETE 409 · retire · resolve NO_POLICY · SRC-02 no emp package write · POS dup 409 · POS retire.
3. Closed defects D-SETDEF-QA-TAX-01 / SI-DATE-01 / POS-TX-01.
4. Honesty lock: `payroll_e2e_ready=false`.

### Residual

- FE Settings UF wave (browser) when PM schedules — not blocking L1 hotfix PASS.
- No open P0 on F-SET-TAX/SI/POS L1 surface from QA-01.

### Explicit non-claims

- Not UF 🟢 · not Settings FE · not PAY process · `payroll_e2e_ready=false`.

---

## next_owner

**pm** → optional **qc** narrow gate on L1 hotfix evidence · or **dev-fe** Settings UF when scheduled

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-QC-02
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-SETTINGS-DEFAULTS-QA-02
priority: P1

## Goal
Narrow QC on L1 hotfix PASS evidence docs/qa/evidence/po-hrm-settings-defaults-qa-02.md:
- Confirm D-SETDEF-QA-TAX-01 / SI-DATE-01 / POS-TX-01 CLOSED vs QA-01 FAIL matrix
- Confirm honesty payroll_e2e_ready=false · no UF 🟢 claim · U65 L1 secondary only
- Verdict GO WITH CONDITIONS (FE UF deferred) or GO for L1 API slice only

## exit_criteria
docs/qa/evidence/po-hrm-settings-defaults-qc-02.md · GO / GWC / NO-GO
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-qa-02.md`

## ack_status

**PASS_TO_PM**
