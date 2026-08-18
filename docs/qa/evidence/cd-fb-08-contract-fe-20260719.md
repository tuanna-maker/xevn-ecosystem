# CD-FB-08-CONTRACT — FE evidence (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-08-CONTRACT` |
| **from_role** | dev-fe |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | qa |
| **sponsor_lock** | U65 zero-seed · U68 UPGRADE + CODE-MEMORY · no Phase1/PROD claim |
| **date** | 2026-07-19 |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/qa/evidence/cd-fb-08-contract-be-20260719.md` | API contract table |
| `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` | §5 AC-CD-F5-01..04,07 · BR-CD-F5-01..05 |
| `docs/hrm/SRS.md` | §13 UC-HRM-25 |
| OpenAPI | `docs/api/openapi/hrm-api.yaml` compensation-* |

**change_mode:** UPGRADE

**spec says / code does:**
- Spec: HĐ = term only; Đãi ngộ = package lines; Lịch sử = versions; no required salary on HĐ.
- Code: `EmployeeContracts` tabs Hợp đồng / Đãi ngộ / Lịch sử; form does not send `salary`; create/revise/history wired to Nest compensation APIs.

---

## Closed (FE)

1. `hrmApi.ts` — compensation create/list/active/get/revise/history + `compensation_package_id` on contract types
2. `lib/compensationLines.ts` + tests — base required, ≥2 distinct allowance codes, probation optional
3. `lib/compensationAllowanceCodes.ts` — XBOS DM §33 codes (`PHU_CAP_AN`, `PHU_CAP_XANG`, …)
4. `hooks/useEmployeeCompensation.ts` — create + revise (versioned) + history load
5. `EmployeeCompensationPanel.tsx` / `EmployeeCompensationHistoryPanel.tsx`
6. `EmployeeContracts.tsx` — tabs; salary removed from HĐ form/table/view; submit wires Nest create/update/delete
7. `useEmployeeContracts.ts` — mount refetch; `salary` always null; map `compensation_package_id`
8. `@CODE-MEMORY` / `@CODE-MEMORY-CHANGE` on touched modules citing SRS + TechSpec

**must_keep:** Contracts list (`Contracts.tsx` / `useContracts`) progressive load + term-only create (already no salary); renew/history-renewal dialogs on profile.

---

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/compensationLines.test.ts src/hooks/useEmployeeContracts.test.ts src/hooks/useContracts.test.ts
→ Test Files: 3 passed | Tests: 15 passed
```

U65: no seed used for this evidence. Browser F5 persist (AC-CD-F5-07) = QA lane.

---

## Residual

| Item | Owner |
|------|-------|
| Browser L2 P-CC-04 + L2.5 J-HRM-01/03 + AC-CD-F5-01..04,07 (create HĐ → Đãi ngộ → F5) | **qa** |
| Payroll consumer switch from legacy `contracts.salary` if still present | follow-up BE/FE if needed |
| Settings-catalog live pull for DM §33 (currently static mirror codes) | optional polish |

**Not claimed:** Phase 1 / PROD DONE.

---

## completion_report

FE F5 delivered: contract profile tabs (HĐ without salary + Đãi ngộ create/revise + Lịch sử), Nest compensation client wired, vitest 15 PASS. READY_FOR_QA for browser U65 AC.

**next_owner:** qa

**next_dispatch_prompt:**

```text
work_item_id: CD-FB-08-CONTRACT
from_role: pm
to_role: qa
lane: execution
entry_criteria: FE READY_FOR_QA — docs/qa/evidence/cd-fb-08-contract-fe-20260719.md; BE docs/qa/evidence/cd-fb-08-contract-be-20260719.md
spec_ref: CUSTOMER_DEMO_HRM_DELTA_20260620.md §5 AC-CD-F5-01..04,07
persona: ceo@xe.vn / Xevn@2026
entry_criteria_u65: browser-only; zero-seed
exit_criteria:
  - P-CC-04 contracts list loads (no salary required on create)
  - Employee profile → Hợp đồng: tabs HĐ / Đãi ngộ / Lịch sử
  - AC-CD-F5-01: HĐ form has no required salary field
  - AC-CD-F5-02/03: Đãi ngộ create with base + probation (if thử việc) + ≥2 allowance codes → Network POST compensation-packages 2xx
  - AC-CD-F5-04: revise twice → Lịch sử shows ≥2 versions
  - AC-CD-F5-07: F5 after mutate → data persists (no seed)
  - J-HRM-01 / J-HRM-03 list→detail still PASS
  - evidence: docs/qa/evidence/cd-fb-08-contract-qa-YYYYMMDD.md
  - PASS_TO_PM or FAIL with residual
cấm: seed; waive F5; PASS chỉ probe
```

**evidence_path:** `docs/qa/evidence/cd-fb-08-contract-fe-20260719.md`

**ack_status:** **READY_FOR_QA**
