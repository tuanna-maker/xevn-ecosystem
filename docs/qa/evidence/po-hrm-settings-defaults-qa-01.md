# Evidence — PO-HRM-SETTINGS-DEFAULTS-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-QA-01` |
| **parent** | `PO-HRM-SETTINGS-DEFAULTS-BE-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P1 |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` · catalog partition **`holding`** |
| **Base URL** | `http://127.0.0.1:28001/api/hrm` |
| **Auth** | XBOS `POST /api/xbos/auth/login` → Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| **U65** | zero-seed · **L1 probe secondary only** · **not** UF 🟢 · **no** `pnpm seed:*` |
| **Honesty** | `payroll_e2e_ready=false` · no browser UF · no module UAT / AMIS Step1 DONE |
| **Stamp** | `SETDEFISCBIH` · SI id `190b0737-aead-4504-9b0c-23921f00ae11` · type `BHXH_QA_SETDEFISCBIH` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-defaults-qa-01.json` · probe `…-qa-01-probe.mjs` |
| **Cite** | `docs/qa/evidence/po-hrm-settings-defaults-be-01.md` · `docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md` F.1 |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** (TAX PUT + SI overlap/patch date + POS create TX) |

---

## 1. Environment / L0

| Check | Result |
|-------|--------|
| HRM `:28001/api/hrm` | **200** |
| XBOS `:28002` login | **201** → token |
| Live surface F-SET-* | Routes present (not Nest 404) after process up |
| `payroll_e2e_ready` | **false** (unchanged; DENIED flip) |

---

## 2. spec_read_ack

| Artifact | Used |
|----------|------|
| `docs/qa/evidence/po-hrm-settings-defaults-be-01.md` | READY_FOR_QA · paths · VAL matrix |
| `docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md` | F-SET-TAX/SI/POS · SRC-02 · SI-412 · soft DELETE 409 |
| Live DTO `settings-defaults.dto.ts` | Whitelist vs wire fields |

---

## 3. AC matrix (L1 API smoke)

| AC / VAL | Expected | Actual | Verdict |
|----------|----------|--------|---------|
| **F-SET-TAX-01 GET prefix** | `200` `HRM-SET-TAX-200` items | `200` · `items=[]` then still empty (PUT blocked) | 🟢 PASS (read) |
| **VAL-SET-TAX-03 GET missing key** | `200` value null + `meta.cta` | `200` · `companyId=holding` · `value=null` · CTA present | 🟢 PASS |
| **F-SET-TAX-01 PUT** | `200` UPSERT `pay_tax_*` | **400** `HRM-VAL-001` **`property value should not exist`** | 🔴 **FAIL** |
| **VAL-SET-TAX-01/02 bad shape** | `400` `HRM-SET-TAX-400-SHAPE` | Same whitelist **400** before shape check (cannot assert SHAPE) | 🔴 FAIL (blocked) |
| **F-SET-SI-01 list/get** | `200` scope holding | `200` · create→get same id · `companyId=holding` | 🟢 PASS |
| **F-SET-SI-02 create** | `201` `HRM-SET-SI-201` | `201` · open type key OK | 🟢 PASS |
| **F-SET-SI-03 PATCH** | `200` update | **400** `HRM-VAL-001` **`effectiveFrom must be YYYY-MM-DD`** (display/store coerce `Thu Jan 01`) | 🔴 **FAIL** |
| **VAL-SET-SI-01 overlap** | `409` `HRM-SET-SI-409-OVERLAP` | **201** second active overlapping window created | 🔴 **FAIL** |
| **VAL-SET-SI-05 hard DELETE** | `409` hard-delete | **409** `HRM-SET-SI-409-HARD-DELETE` | 🟢 PASS |
| **F-SET-SI-03 retire** | soft retire | **201** `HRM-SET-SI-200` · `status=retired` | 🟢 PASS |
| **F-SET-POS-05 resolve unknown key** | `400` `HRM-SET-POS-400-KEY` | **400** not in `job_titles` | 🟢 PASS |
| **F-SET-POS-05 NO_POLICY** | `200` warnings `NO_POLICY` · no emp write | **200** · `policyId=null` · `warnings:["NO_POLICY"]` · **no** `employeePackageId` | 🟢 PASS (SRC-02 draft) |
| **F-SET-POS-02 create** | `201` policy+lines | **500** `HRM-SYS-001` «current transaction is aborted…» (valid `CEO` + `PC_DIEU_XE_6A75AC29`) | 🔴 **FAIL** |
| **VAL-SET-POS-02 orphan** | `400` `HRM-ALLOW-CAT-ORPHAN-CODE` | **500** same aborted-TX (cannot reach ORPHAN code) | 🔴 FAIL (blocked) |
| **POS get / dup / retire** | CRUD rest | Not reached (create blocked) | ⬜ BLOCKED |

### Scope parity (main→holding)

| Surface | Observed |
|---------|----------|
| Tax GET | `companyId=holding` |
| SI create/get | `companyId=holding` |
| POS resolve | `companyId=holding` |

---

## 4. Defect register

| ID | Layer | Sev | Summary | Owner |
|----|-------|-----|---------|-------|
| **D-SETDEF-QA-TAX-01** | BE · DTO | **P0** | `PUT /settings/company-settings` rejects body field `value` — ValidationPipe whitelist: `PutSettingsCompanySettingDto.value` has **no** `@Allow()` / `@IsObject()` decorator → `HRM-VAL-001 property value should not exist`. Blocks all tax UPSERT + shape VAL. | **dev-be** |
| **D-SETDEF-QA-SI-DATE-01** | BE | **P0** | pg `date` → `String(row.effective_from).slice(0,10)` yields **`Thu Jan 01`** (not `YYYY-MM-DD`). Breaks: (1) PATCH re-validate `toDateOnly` → 400; (2) `assertNoOverlap` range compare → silent miss → **overlap 201** instead of **409**. Same class as prior ATT date coerce. | **dev-be** |
| **D-SETDEF-QA-POS-TX-01** | BE | **P0** | `POST …/position-compensation-policies` → **500** aborted TX. Suspected: `assertComponentCodes` soft-`.catch` on `salary_components` COUNT/SELECT inside `withTransaction` without **SAVEPOINT** / `ROLLBACK TO` (peer ALLOW-CAT `D-ALLOW-CAT-QA-01`). Valid PC code still cannot INSERT. | **dev-be** |

**spec_ref:** API-01 F-SET-TAX-01 · VAL-SET-SI-01/05 · F-SET-POS-02/05 · SRC-02 · BR-AMIS-SET-DEF-07

---

## 5. Sample payloads (redacted)

### TAX PUT (FAIL)

```http
PUT /api/hrm/settings/company-settings
{ "companyId":"main", "settingKey":"pay_tax_personal_deduction_vnd",
  "value": { "amount":11000000, "currency":"VND" } }
→ 400 HRM-VAL-001 "property value should not exist"
```

### SI overlap (FAIL)

```http
POST /api/hrm/settings/insurance-rate-cfg
{ "companyId":"main", "insuranceTypeKey":"BHXH_QA_SETDEFISCBIH",
  "employeeRatePct":8, "employerRatePct":17.5, "effectiveFrom":"2026-01-01", "status":"active" }
→ 201
POST … (effectiveFrom 2026-06-01, same type, active)
→ 201  (expected 409 HRM-SET-SI-409-OVERLAP)
```

### SI DELETE (PASS)

```http
DELETE /api/hrm/settings/insurance-rate-cfg/{id}?company_id=main
→ 409 HRM-SET-SI-409-HARD-DELETE
```

### POS resolve NO_POLICY (PASS)

```http
GET …/position-compensation-policies/resolve?company_id=main&positionKey=CEO&asOf=2026-08-07
→ 200 HRM-SET-POS-200
   data.warnings=["NO_POLICY"] · lines=[] · no employeePackageId
```

### POS create (FAIL)

```http
POST …/position-compensation-policies
{ "companyId":"main", "positionKey":"CEO", "effectiveFrom":"2026-01-01", "status":"active",
  "lines":[{ "componentCode":"PC_DIEU_XE_6A75AC29", "amount":500000, "calcMode":"fixed" }] }
→ 500 HRM-SYS-001 "current transaction is aborted…"
```

---

## 6. Residual / not promoted

| Item | Status |
|------|--------|
| Tax KV write path | **not promoted** |
| SI overlap + PATCH | **not promoted** |
| POS CRUD / resolve-hit / dup / retire | **not promoted** |
| SI-412 process helper live | unit-only (BE); not L1 process call this seat |
| FE Settings tax/SI/POS UF | deferred (R2 BE residual) |
| `payroll_e2e_ready=true` | **DENIED** |
| Browser UF 🟢 | **DENIED** (U65 L1 secondary only) |

---

## completion_report

### Closed

1. L0 + persona login L1 smoke against live `:28001`.
2. Verified F-SET routes mounted; GET tax/SI/POS resolve empty paths.
3. Soft DELETE SI → **409**; retire SI → soft `retired`; resolve CEO → **NO_POLICY** 200 + SRC-02 (no emp package id).
4. Filed **3× P0** defects with repro + likely root cause.

### Residual

- D-SETDEF-QA-TAX-01 · D-SETDEF-QA-SI-DATE-01 · D-SETDEF-QA-POS-TX-01 → **dev-be** then QA retest.

### Explicit non-claims

- Not UF 🟢 · not Settings FE · not PAY process tax/SI wire · `payroll_e2e_ready=false`.

---

## next_owner

**dev-be** (`PO-HRM-SETTINGS-DEFAULTS-BE-02` hotfix)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-BE-02
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-SETTINGS-DEFAULTS-QA-01
priority: P0

## Goal
Hotfix L1 FAIL from docs/qa/evidence/po-hrm-settings-defaults-qa-01.md:
1) D-SETDEF-QA-TAX-01 — PutSettingsCompanySettingDto: allow/validate `value` (forbidNonWhitelisted) so PUT pay_tax_* UPSERT works; shape → HRM-SET-TAX-400-SHAPE
2) D-SETDEF-QA-SI-DATE-01 — coerce pg date to YYYY-MM-DD in display + assertNoOverlap (not String(date).slice(0,10)); PATCH works; overlapping active → 409 HRM-SET-SI-409-OVERLAP
3) D-SETDEF-QA-POS-TX-01 — assertComponentCodes inside TX: SAVEPOINT before optional salary_components queries (or fix column); create with CEO+PC code → 201; orphan → 400 HRM-ALLOW-CAT-ORPHAN-CODE not 500

## Locks
payroll_e2e_ready=false · U65 no seed · SRC-02 resolve read-only · soft-delete only

## exit_criteria
evidence docs/qa/evidence/po-hrm-settings-defaults-be-02.md · READY_FOR_QA
→ retest PO-HRM-SETTINGS-DEFAULTS-QA-02
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-qa-01.md`

## ack_status

**FAIL_TO_PM**
