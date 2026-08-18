# QA-PCOMP-W6-LOCAL-UAT-01 — Team dry-run W6 local UAT (2026-07-25)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-PCOMP-W6-LOCAL-UAT-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **Host** | `http://127.0.0.1:5173` only (1B) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · negative `du-lich.ceo@xe.vn` |
| **Pack** | `docs/qa/evidence/pcomp-w6-qa-uat-prep-01-20260725.md` |
| **L0 entry** | `docs/qa/evidence/pcomp-w6-do-local-stack-01-20260725.md` |
| **Locks** | U65 zero-seed · HOLD_DEPLOY · NOT :8088 · NOT portal.xe.vn · NOT Phase1/PROD (5A) |
| **Sponsor sign-off** | **NOT replaced** — `PCOMP-W6-SP-01` still required |

---

## 0. Overall verdict

| Gate | Result |
|------|--------|
| L0 200×3 (final reconfirm) | **PASS** — hrm `:28001` / xbos `:28002` / portal `:5173` |
| `qc:fe-be-health` | **PASS** exit 0 ALL PASS (during window + final) |
| P-CC-01..09 | **9/9 PASS** (portal-proxy + SPA shell) |
| J-HRM-01..07 | **7/7 PASS** (portal-proxy L2.5 scope parity; deep GET where route exists) |
| Member negative | **PASS** — KPI rollup holding → **409** `SCOPE_CONTEXT_MISMATCH` |
| Mutate FE+F5 | **N/A** — no mutate attempted (U65 dry-run load/nav only) |
| Browser click DOM | **PARTIAL** — no Playwright in monorepo; SPA HTML shell 200 + API L2.5. Sponsor click still owns visual UF. |
| Phase1 / PROD / :8088 | **NOT claimed** |

**Team dry-run:** **PASS** (API+shell). **Sponsor `PCOMP-W6-SP-01`:** still open for FE click sign-off.

---

## 1. L0 reconfirm

### During execution window

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:28001/api/hrm` | 200 |
| `GET http://127.0.0.1:28002/api/xbos` | 200 |
| `GET http://127.0.0.1:5173` | 200 |
| `pnpm run qc:fe-be-health` | ALL PASS (direct + portal proxy employees/catalog-sync + login) |

### Final reconfirm (after hrm restart from `dist-uat-w6`)

| Probe | Result |
|-------|--------|
| hrm / xbos / portal | **200 × 3** |
| `qc:fe-be-health` | **ALL PASS** |

**Note:** Mid-session hrm flapped when concurrent `nest build` (`deleteOutDir`) wiped `dist/` under other agent builds. Stabilized by running `node dist-uat-w6/main.js` (copy outside deleteOutDir race). See Residual R1.

`qc:dev-stack` may still print ✓ then Windows UV abort (exit noise) — functional L0 = probe lines / fe-be-health.

---

## 2. Method (evidence integrity)

| Layer | How executed | U65 |
|-------|--------------|-----|
| L0 / L1 | Health + portal login + proxy GETs | No seed |
| L2 P-CC | `scripts/tmp-p1-ex-qa-https-01-probe.mjs` with `PORTAL_DEV_URL=http://127.0.0.1:5173` + SPA HTML GET for each pack route (`id="root"`) | No seed |
| L2.5 J-HRM | Same probe list→GET employee / contract / req / cand / attendance + deep GET-by-id where route exists | No seed |
| Browser click | **Not available** (no playwright package) — does **not** substitute sponsor SP-01 | — |
| Mutate | None | Honored |

---

## 3a. P-CC checklist

| ID | Result | Evidence note |
|----|--------|---------------|
| **P-CC-01** | **PASS** | Login 201 `XBOS-AUTH-200`; `expiresInSec=86400`; JWT company=`main` |
| **P-CC-02** | **PASS** | `group-member-units` 200 `XBOS-TENANT-200` members ≥1 |
| **P-CC-03** | **PASS** | `employees?company_id=main` 200 `HRM-EMP-200`; shell `/command-center/hrm/employees` 200 |
| **P-CC-04** | **PASS** | settings-catalogs + contracts 200; KPI holding rollup 200 (no 409) |
| **P-CC-05** | **PASS** | insurance list 200 `HRM-CON-200` |
| **P-CC-06** | **PASS** | requisitions 200 `HRM-REC-200` |
| **P-CC-07** | **PASS** | attendance records 200 `HRM-ATT-200`; no epoch-date fail observed on sample |
| **P-CC-08** | **PASS** | payslips list 200 `HRM-PAY-200` (1834 rows in window) |
| **P-CC-09** | **PASS** | catalog-governance inbox 200 `XBOS-CAT-212` (empty OK) |

SPA shell (all pack routes): HTTP **200** + `#root` present.

---

## 3b. J-HRM-01..07

| J-ID | Result | Click-path analogue (API) |
|------|--------|---------------------------|
| **J-HRM-01** | **PASS** | Contracts row → `GET /employees/:id?company_id=main` **200** |
| **J-HRM-02** | **PASS** | Employees list → `GET /employees/:id?company_id=main` **200** |
| **J-HRM-03** | **PASS** | Contract list → `GET /contracts-insurance/contracts/:id?company_id=main` **200** `HRM-CON-200` |
| **J-HRM-04** | **PASS** | Insurance row employee_id → employee GET **200** |
| **J-HRM-05** | **PASS** | Requisition GET-by-id **200** + candidate GET-by-id **200** |
| **J-HRM-06** | **PASS** | Attendance record GET-by-id **200** `HRM-ATT-200` |
| **J-HRM-07** | **PASS** | Payslip list → linked `employee_id` GET **200** (historical AC). See Residual R2 for missing `GET /payslips/:id`. |

Probe summary line: `L2 checks: 23/23 PASS` · `L2.5 journeys: 7/7 PASS`.

---

## 3c. Negative scope

| Step | Result |
|------|--------|
| Login `du-lich.ceo@xe.vn` | OK |
| KPI rollup `companyId=holding` | **409** `SCOPE_CONTEXT_MISMATCH` — **PASS** (no holding leak) |

---

## 3d. GWC closed — spot only

| Condition | Spot |
|-----------|------|
| Company-col (`QC-HRM-EMP-COMPANY-COL-01`) | Employee list row has `company_display_name: 'Tập đoàn XeVN'` + `company_uuid` — **no regress** |
| JWT (`P-CC-01-jwt`) | `expiresInSec=86400` — **no re-open** |

---

## 4. Residuals (for PM / Dev — not sponsor blockers for invite if stack green)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R1** | P1 ops | devops | Concurrent `nest build` + `deleteOutDir` races wipe `hrm-api/dist` → :28001 flap during multi-agent waves. For sponsor window: single build → copy `dist-uat-w6` → `node dist-uat-w6/main.js`; avoid parallel nest build on hrm-api. |
| **R2** | P2 note | ba/dev-be | No `GET /api/hrm/payroll/payslips/:id` (Nest `Cannot GET` 404). FE uses list payload / print dialog. Historical J-HRM-07 = employee link PASS. Only escalate if product needs deep-link by payslip id. |
| **R3** | Process | pm/sponsor | Browser DOM click path **not** executed this dry-run (no Playwright). Invite `PCOMP-W6-SP-01` for FE click checklist §3 of prep pack. |

**No P0 product FAIL** in P-CC / J-HRM scope during green window.

---

## 5. Explicit non-claims

- Not Phase 1 DONE / not PROD-READY  
- Not tested on `:8088` / `portal.xe.vn`  
- No seed  
- Does **not** close `PCOMP-W6-SP-01`

---

## 6. Handoff

```text
completion_report: |
  Team dry-run W6 local UAT PASS on localhost :5173.
  L0 final 200×3 + qc:fe-be-health ALL PASS.
  P-CC-01..09 PASS; J-HRM-01..07 PASS (portal-proxy L2.5);
  member negative 409 PASS; company-col + JWT spot OK.
  Residuals: R1 hrm dist race (devops); R2 no payslip GET-by-id (P2 note);
  R3 browser click deferred to sponsor SP-01.
  No mutate. No seed. HOLD_DEPLOY. NOT Phase1/PROD.
next_owner: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-pcomp-w6-local-uat-01-20260725.md
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PCOMP-W6-SP-01
from_role: pm
to_role: sponsor (invite)
entry_criteria:
  - L0 green: qc:fe-be-health exit 0 on http://127.0.0.1:5173
  - Prefer hrm-api from stable dist (avoid concurrent nest build wipe) — see R1 in qa-pcomp-w6-local-uat-01-20260725.md
  - Pack: docs/qa/evidence/pcomp-w6-qa-uat-prep-01-20260725.md
  - Team dry-run PASS: docs/qa/evidence/qa-pcomp-w6-local-uat-01-20260725.md
exit_criteria:
  - Sponsor runs FE click checklist P-CC-01..09 + J-HRM-01..07
  - Marks verdict on bus PCOMP-W6-SP-01 (UAT-PASS / UAT-FAIL / BLOCKED)
optional_parallel:
  - devops: stabilize hrm-api sponsor window (single build + dist-uat copy; no parallel nest build)
cấm: seed · deploy :8088 · portal.xe.vn · Phase1/PROD claim
locks: U65 · HOLD_DEPLOY · 1B local only
```
