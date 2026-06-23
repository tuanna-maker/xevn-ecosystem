# HRM full quality audit — PM synthesis

**work_item_id:** HRM-QUALITY-AUDIT-20260524  
**Date:** 2026-05-24  
**Verdict:** **NOT UAT-PASS** · **NOT production-ready** · **GWC candidate** sau W1

---

## Gates đã chạy (PM terminal)

| Gate | Result | Evidence |
|------|--------|----------|
| `pnpm test` (hrm-api) | **127/127 PASS** | exit 0, 16.3s |
| `pnpm exec vitest run` (hrm web) | **78/78 PASS** | 21 files |
| `verify:hrm:menu-density` | **7/7 PASS** | 1170 employees, ratios OK |
| `qc:dev-stack` | **PASS** | 28001/28002/5175 |
| `test:hrm-embed:audit` | **8/8 PASS** | L2 tab load only |

---

## Đánh giá theo tiêu chuẩn

### ✅ Đạt

1. **BE test discipline** — 28 suites, coverage modules core (employees, attendance, payroll, leave, mobile auth).
2. **Embed pilot guard** — 32 static checks Supabase gated on P-CC paths (`hrmEmbedPilotGuardAudit.test.ts`).
3. **Data fidelity seed** — density gates pass; contracts/insurance/attendance/payroll/recruitment có volume UAT.
4. **API list endpoints** — P-CC-03..08 proxy 200 với `company_id=main`.

### 🟡 Chưa đủ tiêu chuẩn

1. **L2.5 journeys** — click-through list→detail chưa có evidence PASS đủ J-HRM-01..07.
2. **Scope parity** — `getEmployeeById` fixed; recruitment mutations, contract delete, performance vẫn exact scope.
3. **Date safety** — `formatDisplayDate` mới có ở EmployeeSalary; Contracts.tsx, Decisions.tsx, recruitment vẫn `format(new Date(x))` không guard.
4. **Dual architecture** — ~90 files import Supabase; pilot 8 routes guarded nhưng **full HRM app** và employee sub-tabs (Skills, Resume, Family…) vẫn Supabase-first.

### 🔴 Chưa đủ nghiệp vụ (119 UC)

| Nhóm | Trạng thái thực tế |
|------|-------------------|
| Embed CC 8 route | List/load OK; write/detail journeys partial |
| Employee 360° profile | API employee GET; tabs con nhiều mock/Supabase |
| Recruitment full | API requisitions/candidates list; UI campaigns/headcount Supabase |
| Payroll advanced | Payslips list OK; templates/batches/sales Supabase |
| Metadata queue / import | Partial API |
| Mobile 15 UC | Smoke login/check-in; leave/payslip/approval partial |
| Catalog 72 DM | Publish/pull path cần hardening |

**Ước lượng:** ~**35–45%** 119 UC có evidence e2e đủ AC trên persona Group CEO; **không** đủ cho «HRM DONE».

---

## P0 action (W1 — dispatched)

| Lane | Task |
|------|------|
| Dev-BE | Scope parity recruitment + contracts + tests |
| Dev-FE | formatDisplayDate rollout Contracts/Decisions/recruitment |
| QA | J-HRM-01..07 retest + document FAIL/PASS |

---

## Khuyến nghị PM / user

1. **Không** claim UAT-PASS cho toàn HRM — chỉ **slice** CC embed 8 tab + mobile smoke.
2. Sau W1 (~1 wave): target **UAT-READY GWC** với J-* PASS + date crash = 0.
3. Phase 2: migration Supabase→API cho recruitment advanced + employee tabs (W2–W3).

**Program doc:** `docs/program/HRM_QUALITY_AUDIT_PROGRAM.md`
