# W1 HRM QC clean gate — 2026-05-24

| Field | Value |
|-------|--------|
| **work_item_id** | W1-HRM-QC-CLEAN-GATE |
| **date** | 2026-05-24 |
| **owner** | QA |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **headers** | `x-tenant-id: xevn` · `x-company-id: main` (from login session) |
| **stack** | hrm-api `:28001` · xbos-api `:28002` · portal `:5175` |
| **method** | Scripted gates + Bearer L2.5 API smoke (list→GET employee); portal proxy for decisions |

## Executive verdict

| Layer | Verdict |
|-------|---------|
| **L0** dev stack | **PASS** |
| **G-FID** menu density | **PASS** (7/7) |
| **L2** embed audit | **PASS** (9/9 P-CC-03..08 + health) |
| **L2.5** J-HRM-01..07 | **PASS** (7/7) |
| **Decisions** `GET …/decisions?company_id=main` | **PASS** (200 direct + portal) |
| **Overall** | **PASS** → **READY_FOR_QC** |

---

## Gate table

| # | Gate | Command | Exit | Result |
|---|------|---------|-----:|--------|
| 1 | L0 dev stack | `pnpm run qc:dev-stack` | 0 | **PASS** — HRM + XBOS + portal HTTP 200 |
| 2 | Menu data density | `pnpm run verify:hrm:menu-density` | 0 | **PASS** — **7/7** |
| 3 | HRM embed audit | `pnpm run test:hrm-embed:audit` | 0 | **PASS** — **9/9** → `hrm-embed-fe-audit-20260524.md` |
| 4 | L2.5 J-HRM-01..07 | Live API smoke (§Journeys) | 0 | **PASS** — 7/7 |
| 5 | Decisions | `GET /api/hrm/decisions?company_id=main` | — | **PASS** — 200 `HRM-DEC-200` (total=0) |

### `verify:hrm:menu-density` summary

```
employees=1170  contracts-ratio=0.948  insurance  attendance=5534
payroll_periods=57  requisitions=34 candidates=55  leave=27
Summary: 7/7 PASS
```

### `test:hrm-embed:audit` summary

```
PASS P-CC-03..08 + P-CC-04a/04b/04c + FE-hrm-health (9/9)
```

---

## L2.5 — J-HRM journey results (authenticated API smoke)

Bearer via `portalLogin(ceo@xe.vn)` · query `company_id=main` where applicable.

**Note:** `page_size` on `/contracts-insurance/contracts`, `/insurance`, and `/decisions` returns **400 HRM-VAL-001** (DTO has no `page_size`). Probes below omit invalid query params; list pagination uses API defaults.

| J-ID | Journey | Probe | HTTP | Result |
|------|---------|-------|------|--------|
| **J-HRM-01** | Hợp đồng → Hồ sơ NV | contracts list → `GET /employees/{id}?company_id=main` | 200 → 200 `HRM-EMP-200` | **PASS** |
| **J-HRM-02** | Nhân sự list → Hồ sơ | employees list → GET by id | 200 → 200 | **PASS** |
| **J-HRM-03** | Hợp đồng → chi tiết HĐ | List row `id` + `employee_id` | row present | **PASS** |
| **J-HRM-04** | Bảo hiểm → NV linked | insurance list → GET employee | 200 → 200 | **PASS** |
| **J-HRM-05** | Tuyển dụng → ứng viên | requisitions + **candidates** `company_id=main` | 200 + 200 `HRM-REC-200` | **PASS** |
| **J-HRM-06** | Chấm công → bản ghi | attendance records → GET employee | 200 → 200 | **PASS** |
| **J-HRM-07** | Lương → phiếu lương | payslips → GET employee from payslip | 200 → **200** `HRM-EMP-200` | **PASS** |

### J-HRM-01 evidence

- Contract `employee_id`: `62dff592-104c-4c8c-8e3a-a335109e3131` (member `trsport`, holding rollup under `main`)
- `GET /employees/62dff592-…?company_id=main` → **200** `HRM-EMP-200`

### J-HRM-05 evidence (retest — prior FAIL)

- `GET /recruitment/candidates?company_id=main&page_size=5` → **200** `HRM-REC-200` (slug `main` accepted; was `HRM-VAL-001` UUID-only)

### J-HRM-07 evidence (retest — prior scope_parity FAIL)

- Payslip `37be40e7-3f4a-4c7d-8337-7f4a115f0706` · `employee_id` `70275eaa-830c-462c-81fb-03d5823945bc`
- `GET /employees/70275eaa-…?company_id=main` → **200** `HRM-EMP-200` (was 404)

---

## Decisions probe

| Path | HTTP | code | total |
|------|------|------|------:|
| Direct `GET {hrm}/decisions?company_id=main` | 200 | HRM-DEC-200 | 0 |
| Portal `GET {portal}/api/hrm/decisions?company_id=main` | 200 | HRM-DEC-200 | 0 |

Empty table is acceptable for gate; route and scope validation succeed.

---

## Environment notes

- First `test:hrm-embed:audit` run: portal **down** (ECONNREFUSED `:5175`) → started `pnpm run dev:web-only`; retest **PASS**.
- `scripts/tmp-w1-hrm-clean-gate-probes.mjs` (no auth / invalid `page_size` on some routes) exits **1** — not used as gate verdict; authoritative probes documented above.

---

## References

- Journey map: `docs/program/PROGRAM_JOURNEY_MAP.md`
- Prior partial fail: `docs/qa/evidence/hrm-qa-full-audit-20260524.md`
- Embed audit: `docs/qa/evidence/hrm-embed-fe-audit-20260524.md`

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QC** |
| **from_role** | QA |
| **to_role** | QC |
| **exit_criteria** | L0 + G-FID + L2 + L2.5 (J-HRM-01..07) + decisions 200 — met |
| **evidence_path** | `docs/qa/evidence/hrm-qa-w1-clean-gate-20260524.md` |
