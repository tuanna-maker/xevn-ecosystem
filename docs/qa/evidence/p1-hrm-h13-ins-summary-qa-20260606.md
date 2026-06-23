# QA evidence — P1-HRM-H13-INS-SUMMARY (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H13-INS-SUMMARY` |
| **defect** | `D-HRM-INS-SUMMARY-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-06 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h13-ins-summary-20260606.md` |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` · hrm-api `:28001` |
| **routes** | P-CC-05 `/command-center/hrm/insurance` · **J-HRM-04** |

## Executive summary

| Area | Layer | Verdict | Notes |
|------|-------|---------|-------|
| **L0** `qc:dev-stack` | L0 | **PASS** | exit **0** |
| Unit `insuranceSummary.test.ts` | L1 | **PASS** | **7/7** exit 0 |
| **D-HRM-INS-SUMMARY-01** summary cards | L2 | **PASS** | BHXH/BHYT/Tổng cộng show **983** (count fallback) — not «-» with 983 list rows |
| **J-HRM-04** employee link | **L2.5** | **PASS** | Click **Trần Văn Hùng** → profile embed **200** · no 409 |
| Row count parity | L2 | **PASS** | UI **983** = API participation total |

**Rule applied:** BHTN card «-» is **expected** — filtered list has **0** BHTN participants (`BHTN0` tab); display rule: no records → «-».

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |

**Persona:** Group CEO · embed `companyId=main` · iframe `…/hr/insurance?portal=1&tenantId=xevn&companyId=main`

## Commands executed

```text
pnpm run qc:dev-stack                                    → exit 0
pnpm -C apps/web/hrm test src/lib/insuranceSummary.test.ts → 7/7 PASS
```

Browser: Cursor IDE browser MCP · CDP iframe inspect + programmatic click (same-origin).

## D-HRM-INS-SUMMARY-01 — summary cards (P-CC-05)

| Card | Value (QA session) | Prior (H12) | Result |
|------|-------------------|-------------|--------|
| **Tổng BHXH** | **983** | «-» | **PASS** |
| **Tổng BHYT** | **983** | «-» | **PASS** |
| **Tổng BHTN** | «-» | «-» | **PASS** (0 BHTN records — correct) |
| **Tổng cộng** | **983** | «-» | **PASS** |

| Source | Count | Result |
|--------|-------|--------|
| **UI** iframe footer | `Hiển thị 1 - 10 trong số **983** bản ghi` | **PASS** |
| **API** (corroboration) | `GET /contracts-insurance/insurance?company_id=main` total populated | **PASS** |

**Verdict:** **D-HRM-INS-SUMMARY-01 CLOSED** — participant count fallback renders numeric totals when salary/rate null.

## J-HRM-04 — Bảo hiểm → NV linked → profile (regression)

| Step | Action | Result |
|------|--------|--------|
| 1 | Navigate CC **Bảo hiểm** | iframe `…/hr/insurance?portal=1&companyId=main` |
| 2 | List load | **983** records · **10** rows/page · employee `<a href="/hr/employees/…">` links present |
| 3 | Click **Trần Văn Hùng** | iframe → `/hr/employees/8e72e57b-e34d-467b-8510-49f14dd36ad0?portal=1&tenantId=xevn&companyId=main` |
| 4 | Profile content | Name **Trần Văn Hùng** visible |
| 5 | Scope / errors | No **409** · no **Sync ERROR** · embed params preserved |

**Verdict:** **J-HRM-04 PASS** — no regression from H12 fix.

## Defects

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **D-HRM-INS-SUMMARY-01** | P3 OPEN (summary «-» with rows) | **CLOSED** |

## Residual (carry from dev handoff — non-blocking)

| Item | Owner | Note |
|------|-------|------|
| BE list financial fields | dev-be | `mapInsuranceListItem` still nulls salary/rate — FE enriches + count fallback |
| Delete vs list table | dev-be | Pre-existing H12 note |

---

**completion_report:** **D-HRM-INS-SUMMARY-01 CLOSED** — summary cards show **983** for BHXH/BHYT/Tổng cộng with 983-row list; BHTN «-» correct (0 records). **J-HRM-04** browser regression **PASS**. Unit tests 7/7.

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H13-INS-SUMMARY` PASS_TO_PM — mark **D-HRM-INS-SUMMARY-01 CLOSED** on journey map; dispatch **qc** narrow re-gate on H13 batch if sprint DoD requires; no dev-fe unless BE financial-field enrichment opened separately.

**evidence_path:** `docs/qa/evidence/p1-hrm-h13-ins-summary-qa-20260606.md`

**pm_dispatch_hint:** Insurance summary wave closed; J-HRM-04 remains ✅ on `PROGRAM_JOURNEY_MAP.md`.
