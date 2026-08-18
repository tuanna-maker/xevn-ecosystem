# QA-HRM-EMP-COMPANY-COL-01 — Cột «Thông tin công ty» = LE/ĐVTV (local)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-EMP-COMPANY-COL-01` |
| **date** | 2026-07-23 (ICT) |
| **from_role** | qa |
| **to_role** | qc / pm |
| **ack_status** | **READY_FOR_QC** |
| **environment** | Local only — portal `http://localhost:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **HOLD_DEPLOY** | **honored** — no `:8088` / pilot assert |
| **U65** | zero-seed — no `pnpm seed:*` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **spec_ref** | `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md` AC-EMP-COL-01..07 · BE/FE READY evidence 2026-07-22 |

---

## 1. Entry criteria

| Source | Status |
|--------|--------|
| BE `be-hrm-emp-company-col-01-20260722.md` READY_FOR_QA | ✅ |
| FE `fe-hrm-emp-company-col-01-20260722.md` READY_FOR_QA | ✅ |
| BA AC-EMP-COL-01..07 | ✅ |
| L0 stack | ✅ hrm + xbos + portal HTTP 200 (`qc:dev-stack`) |

**Runtime note:** `pnpm run dev:hrm-api` (nest `--watch`) **fails TS2322** at `operating-units.service.ts:58` (`db.query` vs `QueryFn`). QA ran **`node dist/main.js`** (dist already contained `hrm-company-display-name.js`). Residual P2 for Dev-BE DX — does **not** block AC browser PASS on local dist.

---

## 2. Click path (U65 browser)

1. Login `http://localhost:5173/login` → `ceo@xe.vn`
2. Navigate `http://localhost:5173/command-center/hrm/employees` (HRM iframe `/hr/employees?portal=1&companyId=main`)
3. Assert cột **Thông tin công ty** (header index 2)
4. Network re-fetch `GET /api/hrm/employees?company_id=main&page=1&page_size=50`
5. F5 reload → re-assert cells
6. **J-HRM-02:** click row → `/hr/employees/{id}` · GET by id **200** · no 404/409

Screenshots (local temp): `page-2026-07-23T07-27-05-665Z.png`, `page-2026-07-23T07-28-40-741Z.png` (viewport narrow — cells verified via CDP in iframe).

---

## 3. AC matrix

| AC | Result | Evidence |
|----|--------|----------|
| **AC-EMP-COL-01** | **PASS** | 50 cells sampled; unique ∈ LE/ĐVTV set; **0** `Khối … X.E` |
| **AC-EMP-COL-02** | **PASS** | holding → **Tập đoàn XeVN** (PORTAL-GCEO, HLD-*) |
| **AC-EMP-COL-03** | **PASS** | API `company_display_name` on every sampled row; OU `display_name_vi` = same LE set; FE column matches |
| **AC-EMP-COL-04** | **PASS** (runtime) | No Khối on live map/API; BE jest `be-hrm-emp-company-col-01` **8/8** (re-run QA session) |
| **AC-EMP-COL-05** | **PASS** | J-HRM-02 → `…/employees/678b9cb2-c59a-4b1e-b257-ce93033ba2f3` · GET **HRM-EMP-200** · profile CEO loaded · no 404/409 |
| **AC-EMP-COL-06** | **PASS** | After F5: same unique LE labels; `khoiCount=0` |
| **AC-EMP-COL-07** | **PASS** | Filter copy **«Đơn vị thành viên»**; OU API labels = column SoT (0 Khối) |

### Observed LE set (column + API)

| company_id | company_display_name |
|------------|----------------------|
| holding | Tập đoàn XeVN |
| trsport | Công ty Cổ phần Thương mại và Dịch vụ X.E |
| logistics | Công ty TNHH Du lịch Visun |
| finance | Công ty TNHH Du lịch X.E Việt Nam |
| services | Công ty TNHH X.E Việt Nam |

### Network (browser fetch, same session token)

```text
GET /api/hrm/employees?company_id=main&page=1&page_size=50 → 200 HRM-EMP-200
  total=1108 · hasCompanyDisplayName=true · khoi=0
GET /api/hrm/operating-units → 200 · 5 LE names · khoi=0
GET /api/hrm/employees/{id}?company_id=main → 200 HRM-EMP-200 · company_display_name=Tập đoàn XeVN
```

### Unit (supporting — not UF substitute)

| Suite | Result |
|-------|--------|
| `be-hrm-emp-company-col-01` | 8/8 PASS |
| FE `employeeCompanyDisplayName` + `hrmOperatingUnits` | 16/16 PASS |

---

## 4. Journeys / matrix

| ID | Verdict |
|----|---------|
| **P-CC-03** employees list | PASS (local) — company column LE |
| **J-HRM-02** list→detail | PASS — no scope_parity regression |
| `:8088` | ⬜ HOLD_DEPLOY — not asserted |

---

## 5. Residual / not promoted

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **R-EMP-COL-NEST-WATCH-01** | P2 DX | dev-be | `nest start --watch` TS2322 `ensureCompanySlugMapLegalDisplayNames((sql,params)=>this.db.query…)` — wrap/cast QueryFn so `dev:hrm-api` boots without relying on stale dist |
| BR-INT-05 4 LE ≠ 5 slug map | P3 SA | sa | Interim map acceptable per BA; names ∈ ĐVTV set |
| Pilot `:8088` | — | devops | HOLD_DEPLOY until sponsor opens deploy |

**not promoted:** Phase1 DONE · PROD · pilot UF 🟢 on `:8088`

---

## 6. Handoff contract

```yaml
work_item_id: QA-HRM-EMP-COMPANY-COL-01
from_role: qa
to_role: qc
ack_status: READY_FOR_QC
evidence_path: docs/qa/evidence/qa-hrm-emp-company-col-01-20260723.md
HOLD_DEPLOY: true
completion_report: |
  Closed: U65 browser local ceo@xe.vn — cột Thông tin công ty = LE/ĐVTV (0 Khối);
  Network company_display_name 2xx; F5 stable; J-HRM-02 detail 200 no 404/409;
  AC-EMP-COL-01..07 PASS; filter Đơn vị thành viên aligned.
  Residual: nest --watch TS2322 P2 DX; HOLD_DEPLOY; no Phase1/PROD.
next_owner: qc
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HRM-EMP-COMPANY-COL-01
entry_criteria: QA-HRM-EMP-COMPANY-COL-01 READY_FOR_QC · docs/qa/evidence/qa-hrm-emp-company-col-01-20260723.md · HOLD_DEPLOY=true
exit_criteria:
  - Audit AC-EMP-COL-01..07 + J-HRM-02 evidence (local only — cấm :8088)
  - Confirm 0 «Khối … X.E» in company column / company_display_name
  - GO or GWC with residual R-EMP-COL-NEST-WATCH-01 (optional BE cast) listed
  - evidence docs/qa/evidence/qc-hrm-emp-company-col-01-20260723.md
cấm: seed · deploy pilot · Phase1/PROD claim
optional parallel: D-HRM-EMP-COMPANY-COL-BE-02 fix nest watch QueryFn TS2322 so pnpm run dev:hrm-api boots
```
