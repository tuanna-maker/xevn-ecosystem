# Evidence — PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-01` (`ALLOW-CAT-QA-01`) |
| **parent** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P0 |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` · catalog partition `holding` |
| **Base URL** | `http://127.0.0.1:28001/api/hrm` |
| **Auth** | XBOS `POST /api/xbos/auth/login` → Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| **U65** | zero-seed · **no** `pnpm seed:*` · pay_types prep via Settings `POST /settings-catalogs/items` only |
| **Honesty** | `payroll_e2e_ready=false` · no browser UF · no module UAT flip |
| **Git** | `dc930c5` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-allowance-catalog-sync-qa-01.json` · `…-retire.json` |
| **Stamp** | `ALLOWCAT-6A75AC29` · code `PC_DIEU_XE_6A75AC29` · id `197d2fa2-0b85-4146-90e8-5836729f4edf` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** (AC5 retire P0) |

---

## 1. Environment / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** |
| Route probe `GET …/settings/allowance-deduction-types?company_id=main` | **200** `HRM-ALLOW-CAT-200` · `items=[]` · `payroll_e2e_ready=false` |
| Live BE surface | F-ALLOW-CAT-01..05 present (not 404) |

---

## 2. spec_read_ack

| Artifact | Used |
|----------|------|
| `docs/qa/evidence/po-hrm-allowance-catalog-sync-be-01.md` | READY_FOR_QA · F-ALLOW-CAT · PAY guard |
| `docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md` | F-ALLOW-CAT-01..05 · VAL-ALLOW-01..15 · `HRM-ALLOW-CAT-409-DUAL-WRITE` |

---

## 3. AC matrix (L1 API smoke)

| AC / VAL | Expected | Actual | Verdict |
|----------|----------|--------|---------|
| **AC6 empty honest** | `200` `items=[]` | `200` `HRM-ALLOW-CAT-200` · `total=0` | 🟢 PASS |
| **PREP pay_types** (product path) | `phu_cap`/`khau_tru` in effective catalog | Before: absent → Settings `POST /settings-catalogs/items` **201** `HRM-SET-201` → present | 🟢 PASS (prereq) |
| **AC1 create** VAL-ALLOW-14/15 | `201` + `salaryComponentId` + merge token | `201` `HRM-ALLOW-CAT-201` · `salaryComponentId=97ea14e5-…` · `sync.mergeTokenKey=cb.allowance_pc_dieu_xe_6a75ac29` · `companyId=holding` | 🟢 PASS |
| **AC1 merge-tokens** F-ALLOW-CAT-05 | `200` ≥1 · `origin=allowance_catalog` | `200` · 1 row · `tokenKey=cb.allowance_pc_dieu_xe_6a75ac29` · `origin=allowance_catalog` · `status=active` | 🟢 PASS |
| **AC2 list** | `200` contains created | `200` · row in `q=` list | 🟢 PASS |
| **AC2 get scope_parity** VAL-ALLOW-06 | list id → get `200` same scope | `200` same `id` · `companyId=holding` (main JWT → holding partition) | 🟢 PASS |
| **AC3 PAY dual-write** VAL-ALLOW-13 | POST `component_type=phu_cap` → **409** `HRM-ALLOW-CAT-409-DUAL-WRITE` | **409** + VI message Settings path | 🟢 PASS |
| **AC3 PAY dual-write KT** | POST `khau_tru` → same 409 | **409** `HRM-ALLOW-CAT-409-DUAL-WRITE` | 🟢 PASS |
| **CTRL PAY-native** | `luong` not blocked | **201** `HRM-SC-201` `QA_LUONG_75AC29` | 🟢 PASS |
| **AC4 PAY mirror** VAL-ALLOW-14 | PAY list shows Settings code | List contains `PC_DIEU_XE_6A75AC29` · `component_type=phu_cap` · same SC id | 🟢 PASS |
| **AC5 retire** F-ALLOW-CAT-04 | `200` `status=retired` soft | **500** `HRM-ALLOW-CAT-500-SYNC` · msg `current transaction is aborted, commands ignored until end of transaction block` | 🔴 **FAIL** |
| **AC5 picker hide** | default list excludes retired | Not reached (row remains `active`) | 🔴 FAIL (blocked) |
| **AC5 historical** | `include_retired=true` shows retired | Row still `active` after failed retire | 🔴 FAIL (blocked) |
| **AC5 PAY inactive** | active picker hides mirror | Mirror still `is_active=true` on `active_only` list | 🔴 FAIL (blocked) |
| **AC6 overview** | Settings overview synthesizes PC family | `GET /settings-catalogs?company_id=main` **200** · body contains `allowance_deduction` | 🟢 PASS |

### Fresh reproduce (second code)

| Step | Result |
|------|--------|
| POST create `PC_RET_AC81` | **201** |
| POST `…/{id}/retire?company_id=main` | **500** `HRM-ALLOW-CAT-500-SYNC` (same aborted-TX message) |

---

## 4. Defect register

| ID | Layer | Sev | Summary | Owner |
|----|-------|-----|---------|-------|
| **D-ALLOW-CAT-QA-01** | BE | **P0** | `POST …/allowance-deduction-types/{id}/retire?company_id=*` → **500** `HRM-ALLOW-CAT-500-SYNC` with PG «current transaction is aborted». Repro 2/2. Suspected: `countActivePolicyLines` queries missing `hrm_position_compensation_policy_lines` inside TX, JS `catch` returns 0 but **does not** `SAVEPOINT`/`ROLLBACK TO` → TX aborted → subsequent UPDATE fail (**VAL-ALLOW-09** class). Soft-retire AC5 blocked. | **dev-be** |
| **OBS-ALLOW-CAT-QA-01** | Data/prereq | P2 | Default create maps `allowance→phu_cap`; empty/missing `pay_types` codes → **400** `HRM-PAY-TYPE-KEY` before sync. Mitigated on UAT via Settings product path create `phu_cap`/`khau_tru` (**not seed**). Consider BE soft-allow built-in `PAY_PC_KT_COMPONENT_TYPES` when catalog empty, or document HCNS must seed pay_types via Settings first. | ba / dev-be (optional) |

**spec_ref:** API-01 F-ALLOW-CAT-04 · VAL-ALLOW-07/09 · BR-PLT-04

---

## 5. Sample payloads (redacted)

### Create (PASS)

```http
POST /api/hrm/settings/allowance-deduction-types
Authorization: Bearer <ceo@xe.vn>
x-tenant-id: xevn
x-company-id: main

{ "companyId":"main", "code":"PC_DIEU_XE_6A75AC29", "nameVi":"…", "entryKind":"allowance", "nature":"income", "status":"active" }
→ 201 HRM-ALLOW-CAT-201
   salaryComponentId=97ea14e5-… sync.mergeTokenKey=cb.allowance_pc_dieu_xe_6a75ac29
```

### PAY dual-write (PASS)

```http
POST /api/hrm/payroll/salary-components
{ "company_id":"main", "code":"PAY_PC_BLOCK_75AC29", "name":"…", "component_type":"phu_cap" }
→ 409 HRM-ALLOW-CAT-409-DUAL-WRITE
```

### Retire (FAIL)

```http
POST /api/hrm/settings/allowance-deduction-types/197d2fa2-…/retire?company_id=main
{ "reason":"QA retire ALLOWCAT-6A75AC29" }
→ 500 HRM-ALLOW-CAT-500-SYNC
   "current transaction is aborted, commands ignored until end of transaction block"
```

---

## 6. Residual / not promoted

- Soft-retire → picker hide → historical intact → PAY inactive — **not promoted** (D-ALLOW-CAT-QA-01)
- Browser UF Settings PC/KT UI — deferred (FE not this seat; L1 only)
- VAL-ALLOW-08 orphan consumer — downstream
- `payroll_e2e_ready` remains **false**
- J-* / module UAT — **DENIED**

---

## 7. completion_report

### Closed

1. L0 stack PASS; F-ALLOW-CAT routes live on `:28001`.
2. L1 create + SC mirror + MergeToken `allowance_catalog` PASS (after Settings pay_types prep).
3. List/get scope_parity main→holding PASS.
4. PAY POST `phu_cap`/`khau_tru` → **409** `HRM-ALLOW-CAT-409-DUAL-WRITE`; PAY-native `luong` still **201**.
5. PAY list shows mirrored Settings code.
6. Empty catalog honest `200 []` + overview PC family synthesis PASS.
7. U65 zero-seed honored (`payroll_e2e_ready=false`).

### Residual

- **P0** retire soft → **500** aborted TX — blocks AC5 exit.
- OBS: create depends on `pay_types` containing `phu_cap`/`khau_tru`.

---

## next_owner

**dev-be**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-02
alias: ALLOW-CAT-BE-02 / D-ALLOW-CAT-QA-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-ALLOWANCE-CATALOG-SYNC-01
priority: P0
change_mode: FIX
ref_qa: docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-01.md

## read_first
1. docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-01.md §4 D-ALLOW-CAT-QA-01
2. apps/api/hrm-api/src/settings/allowance-catalog-sync.service.ts retireType + countActivePolicyLines
3. docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md F-ALLOW-CAT-04 · VAL-ALLOW-09

## task
Fix POST /settings/allowance-deduction-types/:id/retire so live returns 200 status=retired (soft) + mirrors SC is_active=false + token retired — no 500 HRM-ALLOW-CAT-500-SYNC.
Root cause hypothesis: countActivePolicyLines SQL failure inside withTransaction is caught in JS but aborts PG TX (missing table) — use SAVEPOINT or pre-check table / move count outside TX.
Add regression jest + READY_FOR_QA.
must_keep: soft-delete only · open N+1 · PAY dual-write guard · U65 no seed
evidence: docs/qa/evidence/po-hrm-allowance-catalog-sync-be-02.md
```

---

## evidence_path

`docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-01.md`

## ack_status

**FAIL_TO_PM**

## payroll_e2e_ready

**false**
