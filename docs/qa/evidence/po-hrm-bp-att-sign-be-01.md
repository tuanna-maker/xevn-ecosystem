# Evidence — PO-HRM-BP-ATT-SIGN-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-BE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **date** | 2026-08-05 |
| **lane** | execution · UC-BP-ATT-11 |
| **change_manifest_path** | `docs/program/examples/change-manifest.sample.json` |
| **prior_evidence** | `po-hrm-bp-att-sign-sa-01.md` PASS_TO_PM |
| **ack_status** | **READY_FOR_QA** |
| **Attendance CLOSED / product GO / Face LIVE / remaster DONE** | **not claimed** |

---

## spec_read_ack

| Artifact | Path / § |
|----------|----------|
| **SRS** | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-11 · BR-BP-TS-02 |
| **TechSpec** | `TECHSPEC_HRM_ENTERPRISE.md` §6.4 · F-ATT-WF-SIGN |
| **DB_DESIGN** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.6.1 `att_timesheet_sign_step` |
| **API_DESIGN** | F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03/04 |
| **ADR** | `ADR-HRM-ATT-SHEET-HTTP-PATH-20260805` · `ADR-HRM-RBAC-SCOPE-LADDER` §13 |

```markdown
## spec_read_ack (handoff)
- srs: FR-UC-BP-ATT-11 · Diễn biến #1–#3 · BR-BP-TS-02
- tech_spec: §6.4.3–6.4.4 · F-ATT-WF-SIGN · TR-CM-16
- db_design: §4.6.1 att_timesheet_sign_step (runtime DDL until migration unlock)
- api_design: POST/GET …/attendance/attendance-sheets/{id}/signatures · GET {id} · POST close/reopen
- change_mode: ADD
- must_keep: shared header scope gate; no auto-close on POST sign; NV employee in close evaluator
```

---

## Implementation summary

| Deliverable | Path |
|-------------|------|
| Shared scope gate | `apps/api/hrm-api/src/attendance/attendance-sheet-scope.ts` → `assertAttendanceSheetHeaderInScope` |
| Catalog parity | `attendance-catalog.service.ts` → `assertAttendanceSheetHeaderInScope` (patch/delete/update) |
| Sign / close / reopen | `attendance-sheet-sign.service.ts` |
| HTTP (canonical) | `attendance.controller.ts` — `GET|POST …/attendance-sheets/{id}` (+ `/signatures`, `/close`, `/reopen`) |
| DTOs | `create-attendance-sheet-signature.dto.ts` · `reopen-attendance-sheet.dto.ts` |
| DI | `app.module.ts` → `AttendanceSheetSignService` |
| TR-CM-16 neo | `attendance-sheet-scope-parity.spec.ts` |

Sign-step table: runtime `CREATE TABLE IF NOT EXISTS public.att_timesheet_sign_step` (+ UQ partial index) — **not** Prisma migration (slice lock).

---

## Verify (jest)

```bash
cd apps/api/hrm-api
pnpm exec jest src/attendance/attendance-sheet-scope-parity.spec.ts src/attendance/attendance.controller.spec.ts
```

| Result | Exit |
|--------|------|
| 2026-08-05 | **0** — scope parity 5/5 + controller suite PASS |

---

## TR-CM-16 / scope parity

| Test | Verdict | Notes |
|------|---------|--------|
| SP-ATT-SIGN-01 | **PASS** | GET sheet + GET signatures same `header_id` in group CEO rollup |
| SP-ATT-SIGN-02 | **PASS** | Member CEO + holding row → `HRM-AS-409` (no 200 leak) |
| SP-ATT-SIGN-03 | **PASS** | Member mgr `trsport` resolved scope; raw `main` vs trsport row → `HRM-AS-409` |
| SP-ATT-SIGN-04 | **PASS** | `company_id=xevn` + JWT `main` → `SCOPE_CONTEXT_MISMATCH` before sign service |

**Runtime `traceability.scope_parity_ack`:** design ready — **not flipped** in Manifest (PM/QC same commit as QA browser + jest sign-off per SA §6).

---

## Migration residual

| Item | Status |
|------|--------|
| Prisma migration §4.6.1 | **BLOCKED-MIGRATION** — runtime DDL in `AttendanceSheetSignService`; unlock on sponsor product wave |

---

## Manifest proposal (PM/QC — after QA PASS)

```json
"traceability": { "scope_parity_ack": true },
"pipeline_stage": "ready_for_dev"
```

---

## completion_report

**Closed:** Shared `assertAttendanceSheetHeaderInScope`; F-ATT-WF-SIGN-01/02, F-ATT-SHEET-02/03/04 on Nest canonical paths; SP-ATT-SIGN-01..04 green; CODE-MEMORY UC-BP-ATT-11 on scope + sign service; catalog patch/delete aligned.

**Open:** QA browser UF-HRM-ATT-SIGN (U65, no seed); Prisma migration when unlocked; Manifest flip by PM/QC.

---

## next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | `qa` |
| **ack_status** | **READY_FOR_QA** |

```text
work_item_id: PO-HRM-BP-ATT-SIGN-QA-01
role: qa
read_first: docs/qa/evidence/po-hrm-bp-att-sign-be-01.md · po-hrm-bp-att-sign-sa-01.md · API F-ATT-WF-SIGN · UF-HRM-ATT-SIGN slot
entry_criteria: jest SP-ATT-SIGN-01..04 exit 0; hrm-api up :28001; U65 zero-seed
exit_criteria: L1 smoke on new routes if stack up; document UF blocked until FE wire; matrix note TR-CM-16 runtime PASS
persona: ceo@xe.vn / Xevn@2026 · company_id=main (group) · member mgr trsport for SP-ATT-SIGN-03 parity spot
cấm: seed · claim Attendance CLOSED
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qa-01.md
```

---

*End evidence PO-HRM-BP-ATT-SIGN-BE-01.*
