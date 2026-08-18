# Evidence — PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-02` (`ALLOW-CAT-QA-02`) |
| **parent** | `PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-02` |
| **ref_fix** | `docs/qa/evidence/po-hrm-allowance-catalog-sync-be-02.md` |
| **ref_fail** | `docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-01.md` §4 `D-ALLOW-CAT-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P0 |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` · catalog partition `holding` |
| **Base URL** | `http://127.0.0.1:28001/api/hrm` |
| **Auth** | XBOS `POST /api/xbos/auth/login` → Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| **U65** | zero-seed · **no** `pnpm seed:*` |
| **Honesty** | `payroll_e2e_ready=false` · L1 API only · no browser UF · no module UAT flip |
| **Git** | `dc930c5` |
| **Runtime** | Restarted `hrm-api` `start:prod` **after** dist BE-02 · PID **30036** Start **17:07:29** · dist `allowance-catalog-sync.service.js` mtime **17:04:13** (contains `SAVEPOINT allow_cat_policy_line_count`) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-allowance-catalog-sync-qa-02.json` |
| **Stamp** | `ALLOWCAT2-1C1D7DE0` · code `PC_RET_1C1D7DE0` · id `26f578cb-2e9e-4772-ad4b-f665f764df59` · SC `ef0b12f1-fda5-4d4e-b220-fe4d45ec36dd` |
| **Recheck** | `ALLOWCAT2-815CDFFA` · `PC_RET2_815CDFFA` · id `f8d69e9a-…` · SC `f18fa963-…` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (AC5 retire P0 closed; D-ALLOW-CAT-QA-01 verified fixed) |

---

## 1. Environment / L0

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` **200** · XBOS `:28002` **200** · portal `:5173` **200** |
| Stale process | Pre-retest PID started **16:53** (before dist **17:04**) → **killed** → `pnpm --filter hrm-api run start:prod` → Nest started · health **200** |
| Dist SAVEPOINT | `dist/settings/allowance-catalog-sync.service.js` contains `SAVEPOINT` / `ROLLBACK TO SAVEPOINT` `allow_cat_policy_line_count` |

---

## 2. spec_read_ack

| Artifact | Used |
|----------|------|
| `po-hrm-allowance-catalog-sync-qa-01.md` | FAIL AC5 · **500** `HRM-ALLOW-CAT-500-SYNC` aborted TX |
| `po-hrm-allowance-catalog-sync-be-02.md` | SAVEPOINT fix · jest 17/17 · READY_FOR_QA |
| API-01 F-ALLOW-CAT-04 · VAL-ALLOW-07/09 | Soft retire + warn-only policy count · TX integrity |

---

## 3. AC5 matrix (L1 retest)

| AC | Expected | Actual | Verdict |
|----|----------|--------|---------|
| **AC5 retire** (P0) | Not **500** · `status=retired` · envelope `HRM-ALLOW-CAT-200` | Create **201** → retire envelope **`HRM-ALLOW-CAT-200`** · `data.status=retired` · **no** `HRM-ALLOW-CAT-500-SYNC` · **no** aborted-TX message. Nest `@Post` raw HTTP = **201** (see OBS). Repro **2/2** fresh codes + **old QA-01 id** `197d2fa2-…` also retires successfully | 🟢 **PASS** (P0 closed) |
| **AC5 picker hide** | Default PC list excludes retired | `GET …/allowance-deduction-types?company_id=main&q=PC_RET_1C1D7DE0` → `total=0` · id not in items · `payroll_e2e_ready=false` | 🟢 PASS |
| **AC5 historical** | `include_retired=true` shows retired | Same q + `include_retired=true` → row present · `status=retired` | 🟢 PASS |
| **AC5 get-by-id** | Soft status retained | `GET …/{id}?company_id=main` → `status=retired` | 🟢 PASS |
| **AC5 PAY inactive** | SC mirror inactive | `GET …/payroll/salary-components/{scId}?company_id=main` → **`is_active=false`** (codes `PC_RET_1C1D7DE0` / `PC_RET2_815CDFFA`) | 🟢 PASS |
| **AC5 PAY active picker** | `active_only` list hides inactive mirror | `GET …/salary-components?company_id=main&active_only=true` → **200** · `hit=0` for retired SC id | 🟢 PASS |
| **AC5 token retired** | Merge token `status=retired` | `GET …/{id}/merge-tokens?company_id=main&include_retired=true` → `tokenKey=cb.allowance_pc_ret_1c1d7de0` · `origin=allowance_catalog` · **`status=retired`** | 🟢 PASS |
| **AC5 token default hide** | Default merge-tokens hides retired | `GET …/merge-tokens?company_id=main` (no include) → `count=0` | 🟢 PASS |

### Defect closure

| ID | Prior | Retest | Status |
|----|-------|--------|--------|
| **D-ALLOW-CAT-QA-01** | Retire → **500** aborted TX (2/2) | Retire → soft `retired` + SC inactive + token retired (2/2 + old id) | **CLOSED** |

---

## 4. Observations (non-blocking)

| ID | Sev | Note |
|----|-----|------|
| **OBS-ALLOW-CAT-QA-02-HTTP** | P3 | Retire `@Post` returns raw HTTP **201** (Nest default) while business envelope uses `HRM-ALLOW-CAT-200`. AC text said “200”; P0 gate is **not 500** + `status=retired`. Optional BE `@HttpCode(HttpStatus.OK)` if sponsors require literal HTTP 200. |
| **OBS-ALLOW-CAT-QA-01** (carry) | P2 | Create still depends on `pay_types` `phu_cap`/`khau_tru` present (already on UAT from prior Settings product path). Fresh PREP POST items returned 400 (body/shape) — create still **201** without re-seed. |

---

## 5. Sample payloads (redacted)

### Create → Retire (PASS)

```http
POST /api/hrm/settings/allowance-deduction-types
{ "companyId":"main", "code":"PC_RET_1C1D7DE0", "nameVi":"…", "entryKind":"allowance", … }
→ 201 HRM-ALLOW-CAT-201  id=26f578cb-…  salaryComponentId=ef0b12f1-…  sync.mergeTokenKey=cb.allowance_pc_ret_1c1d7de0

POST /api/hrm/settings/allowance-deduction-types/26f578cb-…/retire?company_id=main
{ "reason":"QA retire ALLOWCAT2-1C1D7DE0" }
→ envelope HRM-ALLOW-CAT-200  data.status=retired  (raw HTTP 201 Nest POST)
   NOT 500 / NOT HRM-ALLOW-CAT-500-SYNC
```

### Assertions after retire

```http
GET …/allowance-deduction-types?company_id=main&q=PC_RET_1C1D7DE0
→ 200 total=0  (hidden)

GET …/allowance-deduction-types?company_id=main&q=PC_RET_1C1D7DE0&include_retired=true
→ 200 status=retired

GET …/payroll/salary-components/ef0b12f1-…?company_id=main
→ 200 is_active=false

GET …/26f578cb-…/merge-tokens?company_id=main&include_retired=true
→ 200 token status=retired
```

### Regression on prior FAIL id

```http
POST …/allowance-deduction-types/197d2fa2-0b85-4146-90e8-5836729f4edf/retire?company_id=main
→ HRM-ALLOW-CAT-200 status=retired  (was 500 in QA-01)
```

---

## 6. Residual / not promoted

- Browser UF Settings PC/KT — deferred (L1 only)
- Literal Nest HTTP 200 on retire — OBS P3 only
- `payroll_e2e_ready` remains **false**
- J-* / module UAT — **DENIED** this seat

---

## 7. completion_report

### Closed

1. Restarted hrm-api so BE-02 SAVEPOINT dist is live on `:28001`.
2. L1 AC5 retire soft path **PASS** — no aborted TX / no `HRM-ALLOW-CAT-500-SYNC`.
3. Default list hides retired; `include_retired=true` shows; get-by-id `retired`.
4. SC mirror `is_active=false`; `active_only` list does not surface id.
5. Merge token `status=retired` with `include_retired`; default token list empty.
6. Prior FAIL id from QA-01 also retires successfully.
7. U65 zero-seed · `payroll_e2e_ready=false` honesty preserved.
8. **D-ALLOW-CAT-QA-01 CLOSED**.

### Residual

- OBS Nest HTTP **201** vs envelope `HRM-ALLOW-CAT-200` (P3 optional).
- No browser UF this wave.

---

## next_owner

**pm**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ALLOWANCE-CATALOG-SYNC-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
parent: PO-HRM-ALLOWANCE-CATALOG-SYNC-QA-02
ref_qa: docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-02.md
ref_be: docs/qa/evidence/po-hrm-allowance-catalog-sync-be-02.md

## task
Narrow QC gate on allowance catalog sync wave:
- Confirm D-ALLOW-CAT-QA-01 CLOSED (QA-02 AC5 PASS; not 500).
- Acknowledge honesty: payroll_e2e_ready=false; L1 only; no UF/J-* promote.
- Optional residual OBS: Nest POST retire raw HTTP 201 vs envelope HRM-ALLOW-CAT-200 — waive or ticket P3 @HttpCode(200).
- Verdict GO WITH CONDITIONS (L1 AC5) or GO for BE-02 scope only.
evidence: docs/qa/evidence/po-hrm-allowance-catalog-sync-qc-01.md
```

---

## evidence_path

`docs/qa/evidence/po-hrm-allowance-catalog-sync-qa-02.md`

## ack_status

**PASS_TO_PM**

## payroll_e2e_ready

**false**
