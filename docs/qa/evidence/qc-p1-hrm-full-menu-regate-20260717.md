# QC Gate — P1-HRM-FULL-MENU-QC-REGATE-01

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-FULL-MENU-QC-REGATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **persona** | Group CEO · `ceo@xe.vn` · `companyId=main` |
| **decision** | **GO WITH CONDITIONS** — full-menu program (bounded Dev8088) |
| **full_menu_program_done_claim** | **NO** — roster not 17/17 PASS\|GWC closed (recruitment 🔴 + tools deferred) |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed verified across audited chain — no seed in evidence |

---

## Scope (this re-gate)

| In scope | Explicitly out |
|----------|----------------|
| Clear prior P0 **D-HRM-SET-ITEM-PERSIST-01** if QA evidence sufficient | Phase 1 product DONE / `phase1:gate --strict` |
| Clear **GWC-HRM-PAY-STATUS-CELL-01** if StatusBadge evidence sufficient | PROD-READY |
| Re-adjudicate **GWC-HRM-RPT-HEADCOUNT-01** (BA BY-DESIGN) | Member-CEO / HRBP full persona matrix |
| Issue program-level GO / GWC / NO-GO for `P1-HRM-FULL-MENU-QA-PROGRAM` | Claiming 17/17 menu DONE while UF-HRM-12 🔴 |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md` | QC prior | GWC residual **4b–7**; open P2 headcount + pay cell; wave-2 coverage open then |
| `docs/qa/evidence/qc-p1-hrm-full-menu-wave2-20260717.md` | QC prior | **GWC-HRM-WAVE2-QA-01 CLOSED**; Settings P0 still blocked full-menu |
| `docs/qa/evidence/d-hrm-set-item-persist-01-qa-retest-20260717.md` | QA | UF-HRM-10 create+edit+F5+overview **PASS**; pay StatusBadge **Đã xử lý** **PASS**; processes optional **PASS** |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | Matrix | **UF-HRM-10 → 🟢**; **UF-HRM-12 → 🔴** (recruitment mutate) |
| `docs/qa/evidence/gwc-hrm-rpt-headcount-01-20260717.md` | BA-Data | Headcount **1041 vs 1107** = **CLOSE BY-DESIGN** (`active_count` vs `total`) |
| `docs/qa/evidence/d-p1-hrm-pay-status-badge-20260717.md` | Dev-FE | StatusBadge i18n leaves + vitest **4/4** |
| `docs/qa/evidence/p1-hrm-processes-fe-01-qa-20260717.md` | QA | AC-PROC-01..04 **PASS** |
| `docs/qa/evidence/p1-hrm-menu-hrm_ai-retest-20260717.md` | QA | UniAI **PASS** |
| `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-qa-02-20260717.md` | QA | Wave-2 **5/5 PASS** + **J-HRM-03** |
| `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` | Program SoT | Roster 17 + performance; exit = 17/17 PASS\|GWC |

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/d-hrm-set-item-persist-01-qa-retest-20260717.md` | **FAIL** exit **1** (3/8) | **PROCESS** — format only (command_table / portal_url regex / J-*); browser UF path complete |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-full-menu-fix-bundle-qa-02-20260717.md` | **FAIL** exit **1** (2/8) | **PROCESS** — format only; prior QC wave2 pack **8/8** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-full-menu-wave2-20260717.md` | **PASS** exit **0** (8/8) | PROCESS OK |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md` | **PASS** exit **0** (8/8) | PROCESS OK |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-full-menu-regate-20260717.md` | **PASS** exit **0** (8/8) | This gate file |

Portal URL: `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` · compose `portal-fe` **8088→5173**.

**QC adjudication:** QA settings/pay retest pack fails verifier schema only — same PROCESS GWC precedent as H13 / prior full-menu QC. Authoritative product signals: browser U65 click path, Network **201/200**, F5 persist, matrix UF-HRM-10 🟢.

---

## Classification

| Signal | Type | QC finding |
|--------|------|------------|
| Settings item POST 201 → FE row → F5 → overview `hrmExtensionItems`/`effectiveItems` | PRODUCT / mutate U65 | **PASS** — **D-HRM-SET-ITEM-PERSIST-01 CLOSED** |
| Payroll StatusBadge cells «Đã xử lý» (not raw `processed`); header «Trạng thái»; employees «Đang làm việc» | PRODUCT / L2 i18n | **PASS** — **GWC-HRM-PAY-STATUS-CELL-01 CLOSED** |
| Reports 1041 vs list 1107 | PRODUCT / data semantics | **CLOSED BY-DESIGN** — `active_count` + `inactive_count` = `total` |
| Wave-2 five ACs + J-HRM-03 | PRODUCT / L2.5 | **CLOSED** (prior QC) |
| Processes AC-PROC honest read-only | PRODUCT / L2 | **PASS** |
| UniAI L0 after rate-limit | PRODUCT / L0 | **PASS** |
| Recruitment UF-HRM-12 mutate + PermissionGate / Đề xuất / F5 | PRODUCT / P0–P1 | **OPEN** — matrix **🔴**; blocks program DONE |
| tools_equipment menu | COVERAGE | **OPEN deferred** — no exclusive menu evidence |
| Dashboard payroll charts 0 VNĐ | PRODUCT / P2 | **OPEN** non-blocking |
| Departments GET ×2 | PRODUCT / P2 | **OPEN** non-blocking |
| Seed used | PROCESS | **PASS** — none |

---

## Menu roster PASS count (`P1-HRM-FULL-MENU-QA-PROGRAM`)

Program exit requires **17/17** `PASS` or `GWC` (owner + expiry). Performance app-only counted separately.

| # | work_item_id / Menu | Roster verdict | Evidence anchor |
|---|---------------------|----------------|-----------------|
| 1 | DASHBOARD | **PASS** (storm AC) · P2 charts | qa-02 `D-DASH-FE-STORM` |
| 2 | EMPLOYEES | **PASS** | resume §6 · **J-HRM-02** |
| 3 | CONTRACTS | **PASS** | qa-02 `P1-HRM-CON-PERF-01` · **J-HRM-03** |
| 4 | INSURANCE | **GWC** | happy + **J-HRM-04**; empty-mask P1 residual |
| 5 | RECRUITMENT | **FAIL / OPEN** | menu FAIL · matrix **UF-HRM-12 🔴**; partial retest 🟡 only |
| 6 | ATTENDANCE | **PASS** | retest leave tab 🟢 · **J-HRM-06** leave path |
| 7 | PAYROLL | **PASS** | menu + **J-HRM-07** + StatusBadge VI closed |
| 8 | DECISIONS | **PASS** | qa-02 `PERF-HRM-DEC-01` |
| 9 | TASKS | **PASS** | `p1-hrm-menu-tasks-20260717.md` |
| 10 | PROCESSES | **PASS** | AC-PROC · `p1-hrm-processes-fe-01-qa-20260717.md` |
| 11 | INTERNAL_SERVICES | **PASS** | resume §4c |
| 12 | TOOLS (`tools_equipment`) | **DEFERRED / no evidence** | program deferred — not closed GWC |
| 13 | COMPANY | **PASS** | qa-02 `COMPANY-DEPT-STUB` |
| 14 | REPORTS | **PASS** | resume §7 |
| 15 | SETTINGS | **PASS** | UF-HRM-10 · set-item persist QA |
| 16 | HRM_AI / UniAI | **PASS** | `p1-hrm-menu-hrm_ai-retest-20260717.md` |
| 17 | GUIDE | **PASS** | `p1-hrm-menu-guide-20260717.md` |
| + | PERFORMANCE (app) | **PASS** | qa-02 `COND-PF-PORTAL-01` |

**Tally:** **15 PASS** + **1 GWC** (insurance) + **1 FAIL** (recruitment) + **1 deferred** (tools) = **16/17 closable** · **program exit NOT met**.

---

## L2.5 — J-* cited (full-menu program slice)

| J-ID | Journey | Evidence | Verdict | Promotable this gate |
|------|---------|----------|---------|----------------------|
| **J-HRM-02** | Nhân sự list → Hồ sơ | Resume §6 · ≤1 detail GET | **PASS** | YES Dev8088 group CEO |
| **J-HRM-03** | Hợp đồng → chi tiết | qa-02 · F5 1104 · dialog | **PASS** | YES |
| **J-HRM-04** | Bảo hiểm → NV | Resume §4b | **PASS** | YES |
| **J-HRM-05** | Tuyển dụng → detail/mutate | Menu FAIL · matrix UF-HRM-12 🔴; partial retest 🟡 | **FAIL / OPEN** | **NO** until mutate+F5 PASS |
| **J-HRM-06** | Chấm công / leave | Retest leave tab 🟢 (no sheets storm) | **PASS** (leave path) | YES leave; full attendance mutate N/A this gate |
| **J-HRM-07** | Lương → phiếu | Menu PASS + StatusBadge VI | **PASS** | YES (header + cell) |

Read-only / mutate module matrix (conditions cleared this re-gate):

| Module AC | Create | Read | Update | Delete | Verdict |
|-----------|--------|------|--------|--------|---------|
| Settings UF-HRM-10 / HRM-SC-03 | **PASS** | **PASS** | **PASS** | N/A | 🟢 |
| Payroll StatusBadge cell | N/A | **PASS** | N/A | N/A | 🟢 |
| Headcount semantics AC-HC-01..03 | N/A | **PASS** BY-DESIGN | N/A | N/A | 🟢 |
| Recruitment UF-HRM-12 | **FAIL** | PARTIAL | **FAIL** | N/A | 🔴 |
| Processes AC-PROC | N/A (honest empty) | **PASS** | N/A | N/A | 🟢 |

---

## Condition register

### Closed this re-gate

| Condition ID | Was | Now | Rationale |
|--------------|-----|-----|-----------|
| **D-HRM-SET-ITEM-PERSIST-01** | P0 open (wave2 QC) | **CLOSED** | U65 create+edit+F5+overview PASS; matrix UF-HRM-10 🟢 |
| **GWC-HRM-PAY-STATUS-CELL-01** | P2 open | **CLOSED** | Cells «Đã xử lý»; no raw `processed` |
| **GWC-HRM-RPT-HEADCOUNT-01** | P2 open | **CLOSED BY-DESIGN** | BA-Data BR-DQ-HEADCOUNT-01; 1041+66=1107 |
| **GWC-HRM-WAVE2-QA-01** | — | **CLOSED** (prior) | Unchanged |
| Residuals **4b–7** | — | **CLOSED** (prior) | Unchanged |

### Open conditions (GO WITH CONDITIONS)

| Condition ID | Severity | Owner | Expiry | Summary | Close trigger |
|--------------|----------|-------|--------|---------|---------------|
| **GWC-HRM-REC-UF12-01** | **P0** | **dev-fe** (+ **qa** retest) | **2026-07-24** | UF-HRM-12 / recruitment: PermissionGate hides Sửa; Đề xuất/mutate+F5 not closed; matrix 🔴 | Browser U65 mutate PASS → matrix 🟢 → QA evidence |
| **GWC-HRM-TOOLS-01** | P1 coverage | **pm** → **qa** (or BA defer formal) | **2026-07-31** | `tools_equipment` deferred — no menu evidence | Exclusive menu QA PASS/GWC or sponsor defer waiver |
| **R-DASH-PAYROLL-CHART-0** | P2 | **dev-fe** / **dev-be** | **2026-08-07** | Dashboard «Tổng hợp lương» charts 0 VNĐ | Wire payroll summary or hide with AC |
| **R-DEPT-FETCH-X2** | P2 | **dev-fe** | **2026-08-07** | Company Phòng ban departments GET ×2 | Coalesce / RQ dedupe |
| **GWC-HRM-INS-EMPTY-MASK-01** | P1 | **dev-fe** | **2026-07-31** | Insurance 429 silent empty (happy path GWC) | Banner+retry retest PASS |
| **GWC-HRM-RPT-HEADCOUNT-FE-01** | P2 optional | **dev-fe** | defer | Label polish Employees/Reports subtitle | Sponsor request only |

---

## Verdict rationale

1. **Settings P0 cleared** — sufficient U65 browser evidence (POST 201 → FE → F5 → overview). Condition **D-HRM-SET-ITEM-PERSIST-01** no longer blocks.
2. **Pay StatusBadge condition cleared** — cells show Vietnamese «Đã xử lý»; **GWC-HRM-PAY-STATUS-CELL-01 CLOSED**.
3. **Headcount P2 cleared as BY-DESIGN** — not a product defect; BR-DQ-HEADCOUNT-01 documents active vs total.
4. Wave-2, UniAI, processes AC-PROC, and J-HRM-02/03/04/07 remain PASS on Dev8088.
5. **Program exit criteria NOT met:** recruitment **UF-HRM-12 🔴** and **tools** deferred → cannot claim full-menu program DONE.
6. Remaining P2 chart zeros / dept GET×2 are non-blocking for this bounded GWC.
7. **NOT** Phase 1 DONE · **NOT** PROD-READY.

**Decision: GO WITH CONDITIONS** for `P1-HRM-FULL-MENU-QA-PROGRAM` on Dev8088 group CEO — prior P0 settings + pay-cell + headcount conditions cleared; program remains open until recruitment + tools (or formal waiver) close.

---

## Residual / not promoted

| Item | Owner | Blocks this GWC? | Blocks program DONE? |
|------|-------|------------------|----------------------|
| GWC-HRM-REC-UF12-01 (UF-HRM-12 🔴) | dev-fe → qa | **No** (listed condition) | **Yes** |
| GWC-HRM-TOOLS-01 | pm/qa | No | **Yes** (until GWC/waiver) |
| R-DASH-PAYROLL-CHART-0 | fe/be | No | No |
| R-DEPT-FETCH-X2 | fe | No | No |
| GWC-HRM-INS-EMPTY-MASK-01 | fe | No | No (insurance already GWC) |
| QA pack schema on settings retest MD | qa | No (PROCESS) | No |

---

## Handoff packet

- `work_item_id:` `P1-HRM-FULL-MENU-QC-REGATE-01`
- `from_role:` qc
- `to_role:` pm
- `ack_status:` **PASS_TO_PM**
- `evidence_path:` `docs/qa/evidence/qc-p1-hrm-full-menu-regate-20260717.md`
- `completion_report:` |
  QC **GO WITH CONDITIONS** on full-menu program re-gate. **CLOSED:** D-HRM-SET-ITEM-PERSIST-01 (UF-HRM-10 🟢), GWC-HRM-PAY-STATUS-CELL-01 (StatusBadge VI), GWC-HRM-RPT-HEADCOUNT-01 (BY-DESIGN). Roster **15 PASS + 1 GWC + 1 FAIL + 1 deferred** — **NOT** full-menu DONE. J-* PASS: 02/03/04/06(leave)/07; **J-HRM-05 OPEN**. Open P0 condition: **GWC-HRM-REC-UF12-01** (UF-HRM-12). P2: chart zeros, dept GET×2. U65 no seed. **NOT** Phase 1 DONE · **NOT** PROD.
- `next_owner:` **pm**
- `next_dispatch_prompt:` |
  ```text
  work_item_id: GWC-HRM-REC-UF12-01
  from_role: pm
  to_role: dev-fe
  entry_criteria: QC GWC docs/qa/evidence/qc-p1-hrm-full-menu-regate-20260717.md; matrix UF-HRM-12 🔴 docs/qa/USER_FLOW_OPERABILITY_MATRIX.md; prior FAIL docs/qa/evidence/p1-hrm-menu-recruitment-20260717.md; partial fix docs/qa/evidence/p1-hrm-menu-recruitment-fix-20260717.md READY_FOR_QA if still applicable
  task: Fix recruitment mutate UX on Dev8088 — (1) PermissionGate / usePermissions so Group CEO can Sửa requisition; (2) Đề xuất list binds API rows; (3) stop candidate-evaluations storm; (4) U65 Tạo đề xuất → POST 2xx → FE + F5. Cite J-HRM-05.
  cấm: seed
  exit_criteria: READY_FOR_QA; evidence docs/qa/evidence/d-hrm-rec-uf12-01-20260717.md; then PM Task qa retest → matrix UF-HRM-12 🟢
  Parallel P2 (non-blocking): optional backlog R-DASH-PAYROLL-CHART-0 + R-DEPT-FETCH-X2; formalize GWC-HRM-TOOLS-01 defer/waiver or dispatch P1-HRM-MENU-QA-TOOLS
  ```

---

## QC sign-off

| Role | Name | Decision | Date |
|------|------|----------|------|
| QC | QC Manager (subagent) | **GO WITH CONDITIONS** | 2026-07-17 |
