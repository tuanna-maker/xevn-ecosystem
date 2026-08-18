# Evidence — QA-HRM-CO-01-INDUSTRY-01

**work_item_id:** `QA-HRM-CO-01-INDUSTRY-01`  
**upstream:** `D-HRM-CO-01-INDUSTRY-FE-01` · `docs/qa/evidence/d-hrm-co-01-industry-fe-01.md`  
**role:** qa  
**date:** 2026-08-10  
**stamp:** `COINDQA1-MSN9YL5A`  
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

## L0

```text
pnpm run qc:fe-be-health → exit 0 (ALL PASS)
```

## Unit (regression guard)

```text
cd apps/web/hrm
pnpm exec vitest run src/integrations/tenantScopeApi.test.ts src/lib/hrmCompanyEmployeeCount.test.ts
→ 2 files · 13 tests passed
```

## Browser automation

```text
node scripts/qa/qa-hrm-co-01-industry-01.mjs
→ exit 0 · runtime docs/qa/evidence/_tmp-qa-hrm-co-01-industry-01-runtime.json
```

Screenshots: `_tmp-qa-hrm-co-01-industry-01-list.png` · `_tmp-qa-hrm-co-01-industry-01-detail.png` · `_tmp-qa-hrm-co-01-industry-01-f5.png`

## AC verdicts

| AC | Verdict | Evidence |
|----|---------|----------|
| **AC-CO-IND-01** | 🟢 | 5 rows; cột «Ngành nghề» present; cells = «—» (no raw keys); **no** `subsidiary`/`holding` |
| **AC-CO-IND-02** | 🟢 | 0 forbidden raw entity_type / catalog key leaks in industry column |
| **AC-CO-IND-03** | 🟢 | Holding row «Tập đoàn XeVN» → industry «—» |
| **AC-CO-IND-04** | 🟢 | View detail opened (row 1); list «—» consistent with detail surface (no industry badge when empty) |
| **AC-CO-IND-06** | 🟢 | F5: industry + emp columns unchanged vs pre-reload; `group-member-units` **200**; `legal-entities` **200** |
| **AC-CO-EMP regression** | 🟢 | Card **Tổng nhân viên = 3**; API `GET …/employees/summary?company_id=main` total=3; row counts 2+1+0+0+0 |

### Network (browser session)

- `GET /api/xbos/tenant-scope/group-member-units` → **200** (×6 load/F5)
- `GET /api/xbos/org-foundation/legal-entities` → **200** (×4)
- `GET /api/hrm/employees/summary?company_id=main` → **200** (×2)

**Observation (non-blocking):** probe `hasBusinessLines=false` on all `group-member-units` responses in this env — aligns with FE residual **R2**; VI catalog mapping not exercised live here; covered by `tenantScopeApi.test.ts` (8 cases).

## spec_ref

- `docs/hrm/SRS.md` **UC-HRM-CO-01** · **FR-HRM-CO-IND-01** · **AC-CO-IND-01..04** · **AC-CO-IND-06**
- `docs/hrm/TECHSPEC.md` §20 industry Plane A · §19 headcount Plane B

## Matrix promote (PM — on PASS)

```bash
pnpm docs:phase1:matrix
```

Promote **UC-HRM-CO-01** industry slice per `d-hrm-co-01-industry-fe-01.md` when PM accepts honest «—» without live `business_lines` sample.

## Residual

| Id | Severity | Note |
|----|----------|------|
| R-IND-ENV | P2 | No member row with non-empty `business_lines` in API during U65 run — cannot browser-prove VI label from SoT until XBOS legal data populated |
| R1 (FE) | P2 | `D-HRM-CO-01-SUMMARY-BE-01` batch `by_company` — unchanged; interim N× summary OK |
| IND-04 probe | P3 | Detail scrape uses page text (dialog role not isolated); manual spot: list/detail both «—» for holding |

## not promoted (out of slice)

- Full UC-HRM-CO-01 closure if PM requires live VI industry row + QC gate
- `pnpm docs:phase1:matrix` not executed by QA (PM/governance)

## completion_report

Closed browser U65 retest for industry FE slice: AC-CO-IND-01..04, AC-CO-IND-06 F5, headcount card/column regression PASS; L0 + vitest PASS. Residual: no `business_lines` in API sample (honest «—» only).

## next_owner

**pm** — run matrix promote; optional **qc** narrow GWC on UC-HRM-CO-01; **dev-be** only if sponsor wants populated `business_lines` for IND-01 VI spot.

## next_dispatch_prompt

```text
work_item_id: PM-HRM-CO-01-MATRIX-01
entry: QA PASS_TO_PM QA-HRM-CO-01-INDUSTRY-01 stamp COINDQA1-MSN9YL5A · evidence docs/qa/evidence/d-hrm-co-01-industry-qa-01.md
exit: pnpm docs:phase1:matrix exit 0; update PHASE1_UC_CLOSURE_BACKLOG UC-HRM-CO-01 industry row; dispatch qc narrow GWC if release-facing
residual: R-IND-ENV P2 — no business_lines in pilot API (honest dash OK per AC-CO-IND-03)
```
