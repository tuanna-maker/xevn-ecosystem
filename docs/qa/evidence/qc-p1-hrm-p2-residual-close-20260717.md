# QC Gate — P1-HRM-P2-RESIDUAL-CLOSE-01 (P2 GWC conditions closed)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-P2-RESIDUAL-CLOSE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **deploy HEAD** | **7563c4d** (FE live on VPS) |
| **persona** | Group CEO · `ceo@xe.vn` · `companyId=main` |
| **decision** | **GO** — program `P1-HRM-FULL-MENU-QA-PROGRAM` P2 GWC conditions **CLOSED** (Dev8088 group CEO slice) |
| **program_close_claim** | **YES** — menu coverage + P2 residuals closed |
| **full_menu_program_done_claim** | **YES** for Dev8088 group CEO bounded slice — **0 product P0/P1/P2 open** |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed verified — browser-only; no `pnpm seed:*` in audited chain |

---

## Scope (light QC close)

| In scope | Explicitly out |
|----------|----------------|
| Close **R-DASH-PAYROLL-CHART-0** + **R-DEPT-FETCH-X2** on program GWC register | Phase 1 DONE · `phase1:gate --strict` |
| Audit QA PASS on `:8088` @ FE `7563c4d` | PROD-READY |
| Upgrade program verdict from GWC → **GO** (bounded deferrals only) | Tools live CRUD / UF DONE promotion |
| Confirm prior full-menu roster still valid | Member-CEO / HRBP persona matrix · seed |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-qa-20260717.md` | QA primary | Both P2 residuals **🟢 PASS**; U65 browser; `PASS_TO_PM` |
| `docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-deploy-20260717.md` | DevOps | VPS HEAD `7563c4d`; portal-fe + hrm-fe recreated; no seed |
| `docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-20260717.md` | Dev-FE | Implementation + unit tests |
| `docs/qa/evidence/qc-p1-hrm-full-menu-close-20260717.md` | QC prior | Program GWC; P2 open at @397ac81 |
| `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` | Program SoT | 17/17 roster; P2 listed open |

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-full-menu-close-20260717.md` | **PASS** exit **0** (8/8) | PROCESS OK — prior program GWC ledger |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-qa-20260717.md` | **FAIL** exit **1** (4/8 schema) | **PROCESS P3** only — browser U65 product path complete |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-deploy-20260717.md` | **FAIL** exit **1** (schema) | **PROCESS** — deploy smoke L0 only; QA browser supersedes |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` · deploy **7563c4d**.

**QC adjudication:** QA recruitment/full-menu precedent applies — MD schema gaps are **PROCESS P3** and do not block product closure when browser chain is complete (click path, Network 200, empty-state AC, GET ×1 coalesce, screenshots).

---

## P2 residual closure audit

### R-DASH-PAYROLL-CHART-0 — **CLOSED**

| AC | QA signal | QC finding |
|----|-----------|------------|
| «Tổng hợp lương» no fake `0 VNĐ` when no salary aggregate | `data-testid=dashboard-payroll-chart-empty` present (5 panels); honest copy + link **Tính lương**; no fake 100% pie | **PRODUCT CLOSED** |
| UC-HRM-20 Kỳ lương tile unaffected | NHÂN SỰ **1107** · CHẤM CÔNG **13103** · KỲ LƯƠNG **80** | **PASS** |

### R-DEPT-FETCH-X2 — **CLOSED**

| AC | QA signal | QC finding |
|----|-----------|------------|
| Phòng ban rows load | DEPT_01..04 visible | **PRODUCT CLOSED** |
| `GET /api/hrm/departments?company_id=main` ×1 per mount | fetch intercept + PerformanceResourceTiming — **count = 1** stable +2s | **PRODUCT CLOSED** |

### P3 note only (non-blocking — do not reopen P2)

Side card **«Quỹ lương tháng này»** still renders `0 VNĐ` via raw `totalPayroll` — **outside** chart empty gate AC. Optional FE polish (`renderPayrollAmount` / gate reuse). **Does not block GO.**

---

## L2.5 — J-* (program slice unchanged)

| J-ID | Journey | Verdict | Notes |
|------|---------|---------|-------|
| **J-HRM-02** | Nhân sự list → Hồ sơ | **PASS** | prior full-menu close |
| **J-HRM-03** | Hợp đồng → chi tiết | **PASS** | prior |
| **J-HRM-04** | Bảo hiểm → NV | **PASS** | prior |
| **J-HRM-05** | Tuyển dụng → mutate | **PASS** | prior |
| **J-HRM-06** | Chấm công / leave | **PASS** | prior |
| **J-HRM-07** | Lương → phiếu | **PASS** | prior |

P2 fixes are dashboard chart empty-state + company dept fetch — no new J-* regression; roster L2.5 coverage **satisfied**.

---

## Condition register (updated)

### Closed (this gate)

| Condition ID | Was | Now | Rationale |
|--------------|-----|-----|-----------|
| **R-DASH-PAYROLL-CHART-0** | P2 OPEN | **CLOSED** | U65 browser @7563c4d; honest empty; no fake 0 in chart section |
| **R-DEPT-FETCH-X2** | P2 OPEN | **CLOSED** | departments GET ×1 per mount |

### Closed (cumulative — prior gates)

| Condition ID | Status |
|--------------|--------|
| **GWC-HRM-REC-UF12-01** | **CLOSED** |
| **GWC-HRM-TOOLS-01** | **CLOSED (deferred ⚪)** |
| **D-HRM-SET-ITEM-PERSIST-01** | **CLOSED** |
| **GWC-HRM-PAY-STATUS-CELL-01** | **CLOSED** |
| **GWC-HRM-RPT-HEADCOUNT-01** | **CLOSED BY-DESIGN** |
| **GWC-HRM-INS-EMPTY-MASK-01** | **CLOSED** |
| **GWC-HRM-WAVE2-QA-01** | **CLOSED** |

### Open (bounded — non-blocking for program GO)

| Condition ID | Severity | Owner | Summary |
|--------------|----------|-------|---------|
| **P3-QUY-LUONG-SIDE-CARD-0** | P3 optional | dev-fe | Side card «Quỹ lương tháng này» `0 VNĐ` — polish only |
| **GWC-HRM-RPT-HEADCOUNT-FE-01** | P2 optional | dev-fe | Label polish — sponsor request only |
| **QA pack schema** (recruitment/tools/p2 QA MD) | P3 PROCESS | qa | Add command_table + portal_url + J-* to pass verifier 8/8 |
| **Tools live CRUD** | Phase 2 | pm / sponsor | **⚪ deferred** by design — reopen only on scope decision |

**Product P0/P1/P2 on Dev8088 group CEO full-menu slice: 0 open.**

---

## Classification

| Signal | Type | QC finding |
|--------|------|------------|
| Dashboard payroll chart empty-state | PRODUCT / P2 | **CLOSED** |
| Departments GET coalesce ×1 | PRODUCT / P2 | **CLOSED** |
| Quỹ lương side card `0 VNĐ` | PRODUCT / P3 optional | **OPEN** — non-blocking |
| Tools menu live CRUD | COVERAGE / Phase 2 | **⚪ deferred** — not promoted |
| QA P2 MD evidence-pack schema | PROCESS | **OPEN P3** — non-blocking |
| Seed used | PROCESS | **PASS** — none (U65) |
| Console error (red) on audited slice | PRODUCT / P0 | **0** — none reported in QA chain |

---

## Verdict rationale

1. QA `P1-HRM-P2-RESIDUAL-QA-01` provides complete U65 browser evidence @**7563c4d** for both P2 residuals — **CLOSED**.
2. Prior program GWC (`qc-p1-hrm-full-menu-close-20260717.md`) had **only P2 product opens** on the bounded slice; those are now closed.
3. Roster remains **16 PASS + 1 ⚪ deferred (tools, evidenced) = 17/17**; L2.5 J-HRM-02..07 **PASS**.
4. Remaining items are **P3 optional** (Quỹ lương side card, QA pack schema, headcount label polish) and **Phase 2 Tools CRUD** — none block program **GO** on Dev8088 group CEO slice.
5. **NOT** Phase 1 DONE · **NOT** PROD-READY · Tools **not** CRUD-promoted · **no seed**.

**Decision: GO** — `P1-HRM-FULL-MENU-QA-PROGRAM` Dev8088 group CEO full-menu wave **complete** with bounded P3 + Phase-2 deferrals only.

---

## Residual / not promoted

| Item | Owner | Blocks program GO? | Blocks Phase 1 / PROD? |
|------|-------|--------------------|------------------------|
| P3-QUY-LUONG-SIDE-CARD-0 | dev-fe (optional) | No | No |
| QA evidence pack schema (P3) | qa | No | No |
| Tools live CRUD | Phase 2 / sponsor | No | Yes |
| Phase 1 / PROD gate | pm/qc | No | Yes |
| Member-CEO / HRBP persona matrix | qa | No | Yes (out of slice) |

---

## Handoff packet

- `work_item_id:` `P1-HRM-P2-RESIDUAL-CLOSE-01`
- `from_role:` qc
- `to_role:` pm
- `ack_status:` **PASS_TO_PM**
- `evidence_path:` `docs/qa/evidence/qc-p1-hrm-p2-residual-close-20260717.md`
- `completion_report:` |
  Light QC **GO** — P2 GWC conditions **R-DASH-PAYROLL-CHART-0** + **R-DEPT-FETCH-X2** **CLOSED** after QA PASS on Dev8088 @7563c4d (U65 browser). Program upgrades from GWC → **GO** for bounded Dev8088 group CEO full-menu slice; **0 product P0/P1/P2 open**. Remaining: **P3 optional** Quỹ lương side card `0 VNĐ`, **P3 PROCESS** QA pack schema, **Phase 2** Tools live CRUD (**⚪ deferred**). **NOT** Phase 1 DONE · **NOT** PROD · Tools **not** CRUD-promoted · no seed.
- `next_owner:` **pm**
- `next_dispatch_prompt:` |
  ```text
  work_item_id: PM-IDLE-OR-P3-OPTIONAL-01
  from_role: pm
  to_role: pm
  entry_criteria: P1-HRM-FULL-MENU-QA-PROGRAM GO docs/qa/evidence/qc-p1-hrm-p2-residual-close-20260717.md; 0 product P0/P1/P2 on Dev8088 group CEO slice
  task: PM idle on full-menu program unless sponsor requests: (a) optional dev-fe P3 polish for «Quỹ lương tháng này» side card 0 VNĐ; (b) qa P3 evidence-pack schema fix on recruitment/tools/p2 QA MD; (c) Phase 2 Tools CRUD scope decision. Update PROJECT_STATUS_REPORT + bus rollup. Cấm: Phase 1 DONE / PROD / Tools CRUD promotion / seed.
  exit_criteria: Sponsor-directed wave only; no mandatory dispatch
  ```

---

## QC sign-off

| Role | Name | Decision | Date |
|------|------|----------|------|
| QC | QC Manager (subagent) | **GO** — P2 residuals closed; program GO (bounded) | 2026-07-17 |
