# Evidence — QA-HRM-CO-01-HEADCOUNT-01

**work_item_id:** `QA-HRM-CO-01-HEADCOUNT-01`  
**upstream:** `D-HRM-CO-01-SUMMARY-BE-01` · `D-HRM-CO-01-FE-HEADCOUNT-BIND-01` (bind present in `hrmCompanyEmployeeCount.ts` @CODE-MEMORY-CHANGE 2026-08-10)  
**role:** qa  
**date:** 2026-08-10  
**stamp:** `COHCQA1-MSNFXBJS`  
**ack_status:** **PASS_TO_PM**

## Environment (U65)

| Item | Value |
|------|--------|
| Persona | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| Portal | `http://127.0.0.1:5173` |
| Click path | Login (token inject) → Command Center → **HRM embed Công ty** → `http://127.0.0.1:5173/command-center/hrm/company` |
| iframe | `http://127.0.0.1:5173/hr/company?portal=1&tenantId=xevn&companyId=main` |
| Seed | **none** |
| Journey | **J-HRM-CO-01** (Company list embed, group CEO) |
| UF | **UF-HRM-MENU-15** load + **UC-HRM-CO-01** headcount AC (extends MENU-15 beyond load-only) |

## L0

```text
pnpm run qc:fe-be-health → exit 0 (ALL PASS) — before final browser run
```

**Note:** Mid-session `nest start --watch` failed compile on `att-leave-type.service.ts`; QA resumed HRM via `node apps/api/hrm-api/dist/main.js` + `HRM_BE_PORT=28001` for retest. **P2 residual** — dev-be stabilize watch build (ATT LVT wave).

## Unit (regression guard)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/hrmCompanyEmployeeCount.test.ts src/integrations/tenantScopeApi.test.ts
→ 2 files · 13 tests passed
```

## Browser automation

```text
node scripts/qa/qa-hrm-co-01-headcount-01.mjs
→ exit 0 · runtime docs/qa/evidence/_tmp-qa-hrm-co-01-headcount-01-runtime.json
```

Screenshots: `_tmp-qa-hrm-co-01-headcount-01-list.png` · `_tmp-qa-hrm-co-01-headcount-01-f5.png`

---

### UF-HRM-CO-01-HEADCOUNT — Quản lý công ty · số NV theo slug (Plane B)

- **Persona / URL / click path:** `ceo@xe.vn` → CC → menu **Công ty** → bảng ĐVTV + card **Tổng nhân viên**
- **Trước mutate:** 5 dòng ĐVTV; card **3**; cột Số NV: `2, 1, 0, 0, 0`
- **Action:** Quan sát load (không mutate form) → Network summary → **F5**
- **Network:** `GET /api/hrm/employees/summary?company_id=main` → **200** (portal proxy ×2 load+F5)
- **FE sau 2xx (SRS):** Card **Tổng nhân viên = 3** khớp `data.total`; cột khớp `by_company[slug].total` (holding=2, trsport=1, logistics/finance/services=0); không banner HRM Sync ERROR
- **F5:** Card + cột giữ nguyên; summary **200** lần 2
- **Verdict:** 🟢
- **spec_ref:** `docs/hrm/SRS.md` **UC-HRM-CO-01** · **FR-HRM-CO-HC-01** · **AC-CO-EMP-01/02/06** · `docs/hrm/ui-screens/UI-CO-COMPANY-HEADCOUNT.md`
- **spec_gap:** none

---

## AC verdicts

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-CO-EMP-01** | 🟢 | Card **3** = API `total=3`; 5 table rows; browser summary **2xx** |
| **AC-CO-EMP-02** | 🟢 | Per-row bind vs `by_company`: holding **2**, trsport **1**, logistics/finance/services **0** (slug bridge = `hrmCompanyEmployeeCount` FALLBACK map) |
| **AC-CO-EMP-06** | 🟢 | F5 stable counts + card; ≥2 summary **2xx** in session |
| **network-summary-2xx** | 🟢 | Portal + direct HRM summary **200** |

### API snapshot (SoT Plane B)

| `company_id` (slug) | `total` |
|---------------------|--------|
| holding | 2 |
| trsport | 1 |
| logistics | 0 |
| finance | 0 |
| services | 0 |
| **rollup** | **3** |

### Network (browser session)

- `GET /api/hrm/employees/summary?company_id=main` → **200** (×2)
- `GET /api/xbos/tenant-scope/group-member-units` → **200** (implicit via company load)

## spec_ref

- `docs/hrm/SRS.md` UC-HRM-CO-01 / FR-HRM-CO-HC-01 / AC-CO-EMP-01..06
- `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md`
- `docs/qa/evidence/d-hrm-co-01-summary-be-01.md` (BE READY)

## Residual

| Id | Severity | Note |
|----|----------|------|
| R-STACK-WATCH | P2 | `pnpm run dev:hrm-api` watch compile error on `att-leave-type.service.ts` — use dist bootstrap or dev-be fix before next wave |
| R-TESTID | P3 | `data-testid="co-total-headcount"` / `co-row-{slug}-count` not in DOM — scrape by table text (UI spec suggestion only) |
| R-MATRIX | — | `pnpm docs:phase1:matrix` not run by QA (PM governance) |

## not promoted

- Full UC-HRM-CO-01 QC GWC / matrix flip (PM + qc)
- Industry column VI label (covered by `QA-HRM-CO-01-INDUSTRY-01` separate slice)

## completion_report

Closed U65 browser headcount slice for UC-HRM-CO-01: L0 PASS, vitest 13 PASS, Playwright PASS — card + per-slug column match `GET /employees/summary` with F5 persistence. No seed. FE bind work appears landed (`D-HRM-CO-01-FE-HEADCOUNT-BIND-01`); no BLOCKED on UI.

## next_owner

**pm** — promote UC-HRM-CO-01 headcount row in closure backlog / matrix; optional **qc** narrow GWC; **dev-be** if ATT watch compile must be fixed for stable `dev:hrm-api`.

## next_dispatch_prompt

```text
work_item_id: PM-HRM-CO-01-HEADCOUNT-PROMOTE-01
entry: QA PASS_TO_PM QA-HRM-CO-01-HEADCOUNT-01 stamp COHCQA1-MSNFXBJS · evidence docs/qa/evidence/qa-hrm-co-01-headcount-01.md
exit: Update PHASE1_UC_CLOSURE_BACKLOG UC-HRM-CO-01 headcount; pnpm docs:phase1:matrix; dispatch qc narrow GWC on J-HRM-CO-01 if release-facing; dev-be PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01 if watch compile still blocks dev:hrm-api
```
