# QC Gate — P1-HRM-FULL-MENU-QC-CLOSE-01 (program close)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-FULL-MENU-QC-CLOSE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **deploy HEAD** | **397ac81** |
| **persona** | Group CEO · `ceo@xe.vn` · `companyId=main` |
| **decision** | **GO WITH CONDITIONS** — program `P1-HRM-FULL-MENU-QA-PROGRAM` close (Dev8088 group CEO full-menu slice) |
| **program_close_claim** | **YES** — menu coverage exit met (17/17 evidenced: 16 PASS + 1 ⚪ deferred) |
| **full_menu_program_done_claim** | **NO product P0/P1 open**; closed with bounded P2 conditions |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed verified across audited chain — browser-only mutate; no `pnpm seed:*` in evidence |

---

## Scope (this program-close gate)

| In scope | Explicitly out |
|----------|----------------|
| Formal close of `P1-HRM-FULL-MENU-QA-PROGRAM` after recruitment GWC **CLOSED** | Phase 1 DONE · `phase1:gate --strict` |
| Confirm roster 17/17 evidenced (PASS or formal defer) on Dev8088 group CEO | PROD-READY |
| Consolidate residual register (P2 + Tools deferred + P3 process) | Tools live CRUD / UF DONE promotion |
| Set program doc status to closed-wave GWC | Member-CEO / HRBP full persona matrix · seed |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/qc-gwc-hrm-rec-uf12-01-20260717.md` | QC prior | Recruitment **GWC-HRM-REC-UF12-01 CLOSED**; program rollup GWC; Tools deferred-with-evidence |
| `docs/qa/evidence/gwc-hrm-rec-uf12-01-qa-20260717.md` | QA primary | UF-HRM-12 + **J-HRM-05 PASS**; PATCH 200 + POST 201 + F5; no eval storm / RATE-429 |
| `docs/qa/evidence/d-hrm-tools-stub-toast-qa-20260717.md` | QA companion | Tools honesty **PASS**; menu stays **⚪ deferred** — no fake toast / no POST |
| `docs/qa/evidence/qc-p1-hrm-full-menu-regate-20260717.md` | QC prior | Settings/pay/headcount P0/P2 **CLOSED**; recruitment was the last product blocker |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | Matrix | **UF-HRM-12 → 🟢** (@397ac81) · **UF-HRM-10 → 🟢** |
| `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` | Program SoT | Roster 17 menu; exit = 17/17 PASS\|GWC + console P0 = 0 |

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-gwc-hrm-rec-uf12-01-20260717.md` | **PASS** exit **0** (8/8) | PROCESS OK — entry evidence for this close |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-full-menu-regate-20260717.md` | **PASS** exit **0** (8/8) | PROCESS OK — prior ledger |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/gwc-hrm-rec-uf12-01-qa-20260717.md` | **FAIL** exit **1** (schema) | **PROCESS** only — browser U65 path complete (click path, Network 200/201, F5, screenshot, matrix promote) |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` · HEAD **397ac81**.

**QC adjudication:** Entry QC ledger passes verifier 8/8. QA recruitment MD schema fail is **PROCESS-only** (P3) and does not block product GO per established full-menu QC precedent — authoritative product signals are the browser U65 chain already audited and matrix-promoted.

---

## Roster tally (`P1-HRM-FULL-MENU-QA-PROGRAM`)

Program exit requires **17/17** `PASS` or formal `⚪ deferred` + console P0 = 0 on Dev8088 group CEO slice.

| # | Menu | Verdict | Anchor |
|---|------|---------|--------|
| 1 | DASHBOARD | **PASS** (storm AC) · P2 charts | qa-02 `D-DASH-FE-STORM` |
| 2 | EMPLOYEES | **PASS** · J-HRM-02 | resume §6 |
| 3 | CONTRACTS | **PASS** · J-HRM-03 | qa-02 `P1-HRM-CON-PERF-01` |
| 4 | INSURANCE | **PASS** (empty-mask CLOSED) · J-HRM-04 | `gwc-hrm-ins-empty-mask-retest-20260717.md` |
| 5 | RECRUITMENT | **PASS** · UF-HRM-12 🟢 · J-HRM-05 | `gwc-hrm-rec-uf12-01-qa-20260717.md` |
| 6 | ATTENDANCE | **PASS** · J-HRM-06 (leave) | retest leave tab 🟢 |
| 7 | PAYROLL | **PASS** · J-HRM-07 · StatusBadge VI | menu + status closed |
| 8 | DECISIONS | **PASS** | qa-02 `PERF-HRM-DEC-01` |
| 9 | TASKS | **PASS** | `p1-hrm-menu-tasks-20260717.md` |
| 10 | PROCESSES | **PASS** (AC-PROC honest) | `p1-hrm-processes-fe-01-qa-20260717.md` |
| 11 | INTERNAL_SERVICES | **PASS** | resume §4c |
| 12 | TOOLS (`tools_equipment`) | **⚪ DEFERRED** (evidenced honesty) | `d-hrm-tools-stub-toast-qa-20260717.md` |
| 13 | COMPANY | **PASS** (+ dept stub) | qa-02 `COMPANY-DEPT-STUB` |
| 14 | REPORTS | **PASS** | resume §7 |
| 15 | SETTINGS | **PASS** · UF-HRM-10 🟢 | `d-hrm-set-item-persist-01-qa-retest-20260717.md` |
| 16 | HRM_AI / UniAI | **PASS** | `p1-hrm-menu-hrm_ai-retest-20260717.md` |
| 17 | GUIDE | **PASS** | `p1-hrm-menu-guide-20260717.md` |
| + | PERFORMANCE (app) | **PASS** | qa-02 `COND-PF-PORTAL-01` |

**Tally:** **16 PASS** + **1 ⚪ deferred (tools, evidenced)** = **17/17 rows evidenced**. **0 product P0/P1 open** on audited roster. **Program menu-coverage exit MET** on Dev8088 group CEO slice.

---

## Classification

| Signal | Type | QC finding |
|--------|------|------------|
| Recruitment UF-HRM-12 mutate + F5 (last blocker) | PRODUCT / mutate U65 | **CLOSED** — matrix 🟢 |
| Settings UF-HRM-10 create/edit/F5 | PRODUCT / mutate U65 | **CLOSED** — matrix 🟢 |
| Payroll StatusBadge VI | PRODUCT / L2 i18n | **CLOSED** |
| Headcount 1041 vs 1107 | PRODUCT / data semantics | **CLOSED BY-DESIGN** |
| Insurance empty-mask | PRODUCT / P1 | **CLOSED** |
| Tools deferred banner + no fake toast / no POST | PRODUCT / honesty | **PASS** — **not** live CRUD |
| Tools menu → live CRUD | COVERAGE | **⚪ deferred** — Phase 2; QC does **not** promote |
| Dashboard payroll charts 0 VNĐ | PRODUCT / P2 | **OPEN** — non-blocking; FE dispatched parallel |
| Departments GET ×2 | PRODUCT / P2 | **OPEN** — non-blocking; FE dispatched parallel |
| Console error (red) on audited slice | PRODUCT / P0 | **0** — none observed |
| Seed used | PROCESS | **PASS** — none (U65) |
| QA recruitment/tools MD verifier schema | PROCESS | **OPEN P3** — non-blocking |

---

## L2.5 — J-* coverage (full-menu program slice)

| J-ID | Journey | Verdict | Promotable Dev8088 group CEO |
|------|---------|---------|------------------------------|
| **J-HRM-02** | Nhân sự list → Hồ sơ | **PASS** | YES |
| **J-HRM-03** | Hợp đồng → chi tiết | **PASS** | YES |
| **J-HRM-04** | Bảo hiểm → NV | **PASS** | YES |
| **J-HRM-05** | Tuyển dụng → detail + mutate | **PASS** (GET by id 200 + PATCH 200 + POST 201 + F5) | YES |
| **J-HRM-06** | Chấm công / leave | **PASS** (leave path) | YES |
| **J-HRM-07** | Lương → phiếu | **PASS** | YES |

No mandatory in-scope J-* row remains ⏳ untested for this slice. L2.5 coverage satisfied.

---

## Condition register

### Closed (cumulative — recruitment close completes menu coverage)

| Condition ID | Now | Rationale |
|--------------|-----|-----------|
| **GWC-HRM-REC-UF12-01** | **CLOSED** | U65 mutate PASS; matrix UF-HRM-12 🟢; J-HRM-05 PASS |
| **GWC-HRM-TOOLS-01** | **CLOSED (deferred ⚪)** | Honesty evidence; banner + honest empty; no CRUD claim |
| **D-HRM-SET-ITEM-PERSIST-01** | **CLOSED** | UF-HRM-10 🟢 |
| **GWC-HRM-PAY-STATUS-CELL-01** | **CLOSED** | StatusBadge VI |
| **GWC-HRM-RPT-HEADCOUNT-01** | **CLOSED BY-DESIGN** | active vs total |
| **GWC-HRM-INS-EMPTY-MASK-01** | **CLOSED** | banner+retry retest PASS |
| **GWC-HRM-WAVE2-QA-01** | **CLOSED** | prior |

### Open (program-close GO WITH CONDITIONS — non-blocking)

> **Superseded 2026-07-17:** P2 rows **CLOSED** by `docs/qa/evidence/qc-p1-hrm-p2-residual-close-20260717.md` (@7563c4d). Program upgraded to **GO**.

| Condition ID | Severity | Owner | Expiry | Summary |
|--------------|----------|-------|--------|---------|
| ~~**R-DASH-PAYROLL-CHART-0**~~ | ~~P2~~ | dev-fe / dev-be | ~~2026-08-07~~ | **CLOSED** — honest empty-state @7563c4d |
| ~~**R-DEPT-FETCH-X2**~~ | ~~P2~~ | dev-fe | ~~2026-08-07~~ | **CLOSED** — GET ×1 coalesce |
| **GWC-HRM-RPT-HEADCOUNT-FE-01** | P2 optional | dev-fe | defer | Label polish — sponsor request only |
| **QA pack schema** (recruitment/tools MD) | P3 PROCESS | qa | 2026-08-07 | Add command_table + portal_url to pass verifier 8/8 |
| **Tools live CRUD** | Phase 2 | pm / sponsor | scope change | Deferred by design — reopen only on sponsor scope decision |

---

## Verdict rationale

1. Recruitment UF-HRM-12 (the last product blocker) is **CLOSED** with a complete U65 browser chain @397ac81; matrix promoted 🟢; J-HRM-05 PASS.
2. Roster now **16 PASS + 1 ⚪ deferred (tools, evidenced)** = **17/17 rows evidenced** with **0 product P0/P1 open** → program menu-coverage exit **MET** on Dev8088 group CEO slice.
3. L2.5 J-HRM-02/03/04/05/06/07 all **PASS** — cross-navigation coverage satisfied.
4. Entry QC ledger passes evidence-pack verifier **8/8**; QA MD schema fails are **PROCESS P3** only, not product blockers.
5. Remaining opens are **P2** (chart zeros, dept GET×2 — FE dispatched in parallel), **P3 process** (QA pack schema), and **Tools live CRUD** (Phase 2, deferred by design). None block program close.
6. Console error (red) = **0** on audited slice; U65 zero-seed honored.
7. **NOT** Phase 1 DONE · **NOT** PROD-READY · Tools **not** promoted to live CRUD.

**Decision: GO WITH CONDITIONS** — close `P1-HRM-FULL-MENU-QA-PROGRAM` as a completed wave (Dev8088 group CEO full-menu) with bounded P2 + P3 + Phase-2 residuals; explicitly **not** Phase 1 DONE and **not** PROD-READY.

---

## Residual / not promoted

| Item | Owner | Blocks program close? | Blocks Phase 1 / PROD DONE claim? |
|------|-------|-----------------------|-----------------------------------|
| R-DASH-PAYROLL-CHART-0 | fe/be | No | No |
| R-DEPT-FETCH-X2 | fe | No | No |
| QA evidence pack schema (P3) | qa | No | No |
| Tools live CRUD | Phase 2 / sponsor | No | Yes (until scope change) |
| Phase 1 / PROD gate | pm/qc | No | Yes |
| Member-CEO / HRBP persona matrix | qa | No | Yes (out of this slice) |

---

## Handoff packet

- `work_item_id:` `P1-HRM-FULL-MENU-QC-CLOSE-01`
- `from_role:` qc
- `to_role:` pm
- `ack_status:` **PASS_TO_PM**
- `evidence_path:` `docs/qa/evidence/qc-p1-hrm-full-menu-close-20260717.md`
- `completion_report:` |
  QC **GO WITH CONDITIONS** — `P1-HRM-FULL-MENU-QA-PROGRAM` **CLOSED as a completed wave** on Dev8088 group CEO. Roster **16 PASS + 1 ⚪ deferred (tools, evidenced) = 17/17 evidenced**; **0 product P0/P1 open**; L2.5 J-HRM-02/03/04/05/06/07 PASS. Entry QC ledger evidence-pack **8/8**. Open residuals are bounded and non-blocking: **P2** R-DASH-PAYROLL-CHART-0 + R-DEPT-FETCH-X2 (FE dispatched parallel), **P3** QA pack schema, **Phase 2** Tools live CRUD (deferred by design). U65 no seed. **NOT** Phase 1 DONE · **NOT** PROD-READY · Tools **not** CRUD-promoted.
- `next_owner:` **pm**
- `next_dispatch_prompt:` |
  ```text
  work_item_id: P1-HRM-P2-RESIDUAL-QA-01
  from_role: pm
  to_role: qa
  entry_criteria: Program P1-HRM-FULL-MENU-QA-PROGRAM CLOSED (GWC) docs/qa/evidence/qc-p1-hrm-full-menu-close-20260717.md; FE fixes READY_FOR_QA for R-DASH-PAYROLL-CHART-0 (dashboard payroll charts 0 VNĐ) and R-DEPT-FETCH-X2 (company departments GET ×2)
  task: When dev-fe/dev-be mark the two P2 residuals READY_FOR_QA, retest on Dev8088 :8088 as Group CEO (ceo@xe.vn/main) — (1) dashboard «Tổng hợp lương» charts render non-zero or hidden per AC; (2) company Phòng ban departments GET called once (no ×2). U65 browser-only, no seed. Also (P3 process) qa fix evidence-pack schema on gwc-hrm-rec-uf12-01-qa + d-hrm-tools-stub-toast MD (add command_table + portal_url) to pass verify:qc:evidence-pack 8/8.
  cấm: seed · Tools CRUD promotion · Phase 1 DONE / PROD claim
  exit_criteria: READY_FOR_QA verdicts; evidence docs/qa/evidence/p1-hrm-p2-residual-qa-20260717.md; matrix/register update; ack_status PASS_TO_PM
  note: If FE fixes not yet READY_FOR_QA, PM idle on this program — no open P0/P1; dispatch only when residual owners hand off.
  ```

---

## QC sign-off

| Role | Name | Decision | Date |
|------|------|----------|------|
| QC | QC Manager (subagent) | **GO WITH CONDITIONS** — program close (Dev8088 group CEO full-menu) | 2026-07-17 |
