# QC gate — Sprint S0 HRM embed (8 routes)

**Date:** 2026-05-23  
**work_item_id:** `P1-S0-QC-01`  
**sprint:** S0 · **program:** `PHASE1-SCRUM-S0`  
**from_role:** QC  
**to_role:** PM, technical-manager  
**ack_status:** `PASS_TO_PM`  
**gate_verdict:** **GO WITH CONDITIONS** (S0 pilot P-CC-01..08)

**Matrix:** `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`  
**BA trace:** `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md`  
**Sprint summary:** `docs/program/sprints/S0_SPRINT_SUMMARY.md`  
**User pilot status:** `docs/program/USER_PILOT_STATUS.md`  
**Account:** `ceo@xe.vn` / `Xevn@2026` · **Base:** `http://localhost:5175`

---

## 1. Handoff validity

| Dependency | Expected | QC audit |
|------------|----------|----------|
| L0 stack | `pnpm run qc:dev-stack` exit 0 | **MET** — QC 2026-05-23: XBOS **200**, portal **5175** **200** |
| L1 system UAT | 37/37 PASS | **MET** (inherited) — `docs/qa/evidence/system-integration-uat-report.json` |
| L2 P-CC-01..08 | Each route **PASS** on primary load | **MET** — `pnpm run test:pilot:flows` **11/11 PASS** (QC reproduced) |
| QA artifact | Per-route evidence | **PARTIAL** — `scrum-s0-pilot-20260523.md` predates BE fix (06/07 **FAIL**); superseded by post-fix L2 (see §3) |
| S0 story | User must not see defects on 8 embed routes | **MET** for Command Center shell API paths |

---

## 2. Mandatory checklist (P-CC-01..08)

| ID | Route | UC | QA / L2 evidence | QC audit 2026-05-23 | Result |
|----|-------|-----|------------------|---------------------|--------|
| P-CC-01 | `/login` → `/command-center` | UC-ECO-SCOPE-02 | L1 + `test:pilot:flows` | `expiresInSec=86400` | **PASS** |
| P-CC-02 | `/command-center` settings | UC-CC-03 | L1 + smoke | `group-member-units` **200**, members ≥1 | **PASS** |
| P-CC-03 | `/command-center/hrm/employees` | UC-HRM-21 | `hrm-embed-employees-fix-20260522.md` + smoke | employees **200** `HRM-EMP-200` | **PASS** |
| P-CC-04 | `/command-center/hrm/contracts` | UC-HRM-25 | `hrm-embed-contracts-fix-20260522.md` | 04a–04c **200**; rollup JWT-aligned **200** (no 409) | **PASS** |
| P-CC-05 | `/command-center/hrm/insurance` | UC-HRM-25 BHXH | L2 smoke + portal panel API | contracts-insurance **200** `HRM-CON-200` | **PASS** |
| P-CC-06 | `/command-center/hrm/recruitment` | UC-HRM-22 | L2 smoke (post BE) | `recruitment/requisitions?company_id=main` **200** `HRM-REC-200` | **PASS** |
| P-CC-07 | `/command-center/hrm/attendance` | UC-HRM-23 | L2 smoke (post BE) | `attendance/records?company_id=main` **200** `HRM-ATT-200` | **PASS** |
| P-CC-08 | `/command-center/hrm/payroll` | UC-HRM-24 | L2 smoke | `payroll/payslips?company_id=main` **200** `HRM-PAY-200` | **PASS** |

**Zero-defect instant-FAIL rules:** No mandatory route with **409 on primary load** or **required 54321** on P-CC-01..08 shell probes in L2 script.

---

## 3. QC independent verification (2026-05-23)

| Layer | Command | Result | Notes |
|-------|---------|--------|-------|
| L0 | `pnpm run qc:dev-stack` | **PASS** exit 0 | |
| L2 | `pnpm run test:pilot:flows` | **PASS** **11/11** | P-CC-01..08 via `scripts/pilot-business-flow-smoke.mjs` |
| L1 | `system-integration-uat-report.json` | **PASS** (inherited) | Does not replace L2; both green |

**Representative L2 excerpt (QC run):**

```
PASS  P-CC-06  recruitment requisitions company_id=main → 200  HTTP 200  HRM-REC-200
PASS  P-CC-07  attendance records company_id=main → 200  HTTP 200  HRM-ATT-200
=== Summary: 11/11 PASS ===
```

**Remediation acknowledged:** Dev-BE `company_id` TEXT + `@IsString()` on recruitment/attendance list DTOs; payslips `page_size`; PM restart `hrm-api` on **28001** (per `S0_SPRINT_SUMMARY.md`).

---

## 4. Compliance / traceability

| Check | Status |
|-------|--------|
| Requirement → matrix row (8 IDs) | **PASS** |
| L2 PASS per mandatory P-CC route | **PASS** (8/8) |
| HRM-EMBED-D3/D4/D6 (employees/contracts) | **PASS** (closed prior cycles) |
| HRM-EMBED-D5 (insurance) | **PASS** on portal shell API path (L2); deep iframe `/hr/insurance` not in S0 gate scope |
| Pre-merge / production NFR | **Out of scope** — local S0 pilot; VPS cutover separate program |

---

## 5. Gate decision

### Sprint S0 scope (P-CC-01..08) — **GO WITH CONDITIONS**

**Rationale:** All eight Command Center HRM embed routes pass L0 + L2 primary-load criteria with reproducible automation. User-facing pilot status (`USER_PILOT_STATUS.md`) aligns with **Sẵn sàng** for listed tabs.

**Conditions (mandatory — only deferrals allowed for S0 signoff):**

| ID | Condition | Owner | Sprint | Trigger if violated |
|----|-----------|-------|--------|---------------------|
| **C-S0-P3** | `employee_work_history` widget (`EmployeeWorkTimeline.tsx`) may call Supabase `:54321` on employee detail deep link — **not** a P-CC matrix row; deferred | dev-fe | **S3** | User reports 54321 on work-history tab inside iframe |
| **C-S0-OPS** | Demo stack must run **restarted** `hrm-api` after 2026-05-23 BE DTO migration | devops / PM | S0 | P-CC-06/07 regress to **400** `HRM-VAL-001` |
| **C-S0-QA** | Append QA retest note to `scrum-s0-pilot-20260523.md` (06/07 **PASS**) for audit trail | qa | S0/S1 | QC re-gate if artifact stays FAIL-only |
| **C-S0-NFR** | Production metrics / `verify:production-env` / VPS | devops | post-S0 | No external prod claim from this gate |

**Not blocking S0:** `web-portal` vitest config (board item S0/S1); mobile regression already **PASS** (`scrum-s0-mobile-smoke-20260523.md`).

### Prior cycle superseded

| Cycle | Verdict |
|-------|---------|
| 2026-05-22 | GO WITH CONDITIONS — employees + contracts only |
| 2026-05-23 AM | **NO-GO** — QA 06/07 FAIL, script 7/7 only (this file §8) |
| 2026-05-23 PM | **GO WITH CONDITIONS** — 11/11 L2; P3 work_history only deferral |

---

## 6. PILOT_BUSINESS_FLOW_MATRIX audit

| Matrix column | QC alignment |
|---------------|--------------|
| P-CC-01..08 L2 status | **PASS** — matches QC smoke |
| Gate history row 2026-05-23 (11/11) | **Accepted** |
| Deferred P3 | **Only** `employee_work_history` → S3 (matches sprint summary) |

**QC matrix verdict:** **GO WITH CONDITIONS** — all mandatory portal rows green; single non-route P3 deferral documented.

---

## 7. Corrective / follow-up (non-blocking)

| # | Action | Owner | When |
|---|--------|-------|------|
| 1 | Update `scrum-s0-pilot-20260523.md` ack to **PASS** with 06/07 retest | qa | Before S1 demo audit |
| 2 | API-mode `employee_work_history` or skip when `shouldSkipSupabase` | dev-fe | S3 |
| 3 | Optional browser L2 on iframe `/hr/insurance` if PM adds matrix row | qa | S1+ |

---

## 8. Handoff packet

- **work_item_id:** `P1-S0-QC-01`
- **from_role:** qc
- **to_role:** pm
- **entry_criteria:** PM dispatch; L2 11/11 PASS evidence; matrix P-CC-01..08 PASS
- **exit_criteria:** Gate verdict + conditions + residual risk documented
- **evidence_path:** `docs/qa/evidence/qc-scrum-s0-hrm-embed-20260523.md`
- **needed_by:** PM `P1-S0-PM-02` sprint close; S1 XBOS opening
- **ack_status:** `PASS_TO_PM`
- **gate_verdict:** **GO WITH CONDITIONS** (8-route S0 embed)

### Residual risk (accepted for S0)

- Empty tables with **200** remain valid (BR-MOCK-01); not a defect.
- Deep-link iframe features outside portal shell probes may still touch Supabase until S3 — **must not** be demoed as S0 acceptance without matrix row.

---

## 9. Upgrade trace

| Cycle | Verdict |
|-------|---------|
| 2026-05-22 | GO WITH CONDITIONS — 2 routes |
| 2026-05-23 early | **NO-GO** — prerequisites open (superseded) |
| 2026-05-23 S0 close | **GO WITH CONDITIONS** — 8 routes L2 green; C-S0-P3 only |
