# QC Gate — GWC-HRM-REC-UF12-01-QC

| Field | Value |
|-------|-------|
| **work_item_id** | `GWC-HRM-REC-UF12-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **deploy HEAD** | **397ac81** |
| **persona** | Group CEO · `ceo@xe.vn` · `companyId=main` |
| **decision** | **GO** — recruitment GWC blocker **CLOSED** |
| **program_rollup** | **GO WITH CONDITIONS** — full-menu (tools ⚪ deferred + P2 carry) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed verified — browser-only mutate; no seed in evidence chain |

---

## Scope (this re-gate)

| In scope | Explicitly out |
|----------|----------------|
| Close prior P0 **GWC-HRM-REC-UF12-01** (UF-HRM-12 / J-HRM-05) | Phase 1 DONE · `phase1:gate --strict` |
| Confirm matrix **UF-HRM-12 → 🟢** | PROD-READY |
| Acknowledge Tools honesty lane (D-HRM-TOOLS-STUB-TOAST-01) | Promote Tools to live CRUD / UF DONE |
| Update full-menu roster after recruitment PASS | Member-CEO / HRBP full persona matrix |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/gwc-hrm-rec-uf12-01-qa-20260717.md` | QA primary | UF-HRM-12 + J-HRM-05 **PASS**; PATCH 200 + POST 201 + F5; no eval storm / RATE-429 |
| `docs/qa/evidence/d-hrm-tools-stub-toast-qa-20260717.md` | QA companion | Tools honesty **PASS**; menu stays **⚪ deferred** |
| `docs/qa/evidence/qc-p1-hrm-full-menu-regate-20260717.md` | QC prior | **GWC-HRM-REC-UF12-01** was **P0 OPEN**; roster recruitment **FAIL** |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` | Matrix | **UF-HRM-12 → 🟢** (@397ac81) |
| `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` | Program SoT | Roster context; tools **⚪ deferred** by design |
| `docs/qa/evidence/p1-hrm-menu-recruitment-20260717.md` | QA prior FAIL | PermissionGate / Đề xuất 0 / eval storm — superseded |

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/gwc-hrm-rec-uf12-01-qa-20260717.md` | **FAIL** exit **1** (2/8) | **PROCESS** — missing `command_table` + `portal_url` regex only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/d-hrm-tools-stub-toast-qa-20260717.md` | **FAIL** exit **1** (5/8) | **PROCESS** — format only; honesty AC table present |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-full-menu-regate-20260717.md` | **PASS** exit **0** (8/8) | PROCESS OK (prior ledger) |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` · HEAD **397ac81**.

**QC adjudication:** Same PROCESS GWC precedent as `P1-HRM-FULL-MENU-QC-REGATE-01` — verifier schema gaps do **not** block product GO when browser U65 path is complete (click path, Network 200/201, F5 persist, screenshot, matrix promote).

---

## Classification

| Signal | Type | QC finding |
|--------|------|------------|
| Recruitment PATCH status → FE toast → F5 persist | PRODUCT / mutate U65 | **PASS** — **GWC-HRM-REC-UF12-01 CLOSED** |
| J-HRM-05 Chi tiết GET by id **200** | PRODUCT / L2.5 | **PASS** |
| Đề xuất POST **201** → FE row → F5 | PRODUCT / mutate U65 | **PASS** — prior UI 0 vs API 8 **CLOSED** |
| PermissionGate hides Sửa | PRODUCT / P0 | **CLOSED** — Sửa + status dialog present |
| Eval storm / RATE-429 | PRODUCT / perf P0 | **CLOSED** — 0 eval fan-out; 0 HTTP 429 |
| Matrix UF-HRM-12 | COVERAGE | **🟢** promoted |
| Tools deferred banner + no fake toast / no POST | PRODUCT / honesty | **PASS** — **not** live CRUD |
| Tools menu promote | COVERAGE | **⚪ deferred** — intentional; **do not** require CRUD GO |
| Seed used | PROCESS | **PASS** — none |
| QA pack schema (recruitment MD) | PROCESS | **OPEN P3** — non-blocking; qa template fix optional |

---

## L2.5 — J-HRM-05 (recruitment slice)

| J-ID | Journey | Evidence | Verdict | Promotable |
|------|---------|----------|---------|------------|
| **J-HRM-05** | Tuyển dụng → requisition detail + mutate | `gwc-hrm-rec-uf12-01-qa-20260717.md` · PATCH 200 · GET by id 200 · POST đề xuất 201 · F5 | **PASS** | **YES** Dev8088 group CEO |

**Prior FAIL vs retest:**

| Prior defect (`p1-hrm-menu-recruitment-20260717.md`) | Retest |
|------------------------------------------------------|--------|
| Eval storm / AbortError / RATE-429 | **CLOSED** |
| PermissionGate hides **Sửa** | **CLOSED** |
| Đề xuất UI 0 vs API 8 | **CLOSED** |
| Mutate save not closed | **CLOSED** |

---

## Tools honesty (acknowledged — not promoted)

| AC | Verdict | Note |
|----|---------|------|
| `tools-deferred-banner` visible | **PASS** | Phase 2 defer copy |
| No Thêm CCDC / Tạo phiếu / Edit / Delete | **PASS** | Honest read-only |
| No fake success toast | **PASS** | |
| No POST `/api/hrm/tools*` | **PASS** | |
| No employees fan-out on mount | **PASS** | |
| Menu → live CRUD / UF DONE | **⚪ NOT DONE** | **QC does not require** |

**GWC-HRM-TOOLS-01** (prior: no menu evidence) → **CLOSED as deferred-with-evidence** — satisfies program roster `⚪ deferred` without product CRUD promotion.

---

## Condition register

### Closed this re-gate

| Condition ID | Was | Now | Rationale |
|--------------|-----|-----|-----------|
| **GWC-HRM-REC-UF12-01** | P0 OPEN (regate QC) | **CLOSED** | U65 browser mutate PASS; matrix UF-HRM-12 🟢; J-HRM-05 PASS |
| **GWC-HRM-TOOLS-01** | P1 coverage OPEN | **CLOSED (deferred ⚪)** | Honesty evidence present; banner + empty honest; no CRUD claim |

### Open conditions (program rollup — non-blocking for this GO)

| Condition ID | Severity | Owner | Expiry | Summary |
|--------------|----------|-------|--------|---------|
| **R-DASH-PAYROLL-CHART-0** | P2 | dev-fe / dev-be | 2026-08-07 | Dashboard payroll charts 0 VNĐ |
| **R-DEPT-FETCH-X2** | P2 | dev-fe | 2026-08-07 | Company departments GET ×2 |
| **GWC-HRM-RPT-HEADCOUNT-FE-01** | P2 optional | dev-fe | defer | Label polish — sponsor request only |
| **QA pack schema** (recruitment/tools MD) | P3 PROCESS | qa | 2026-08-07 | Add command_table + portal_url to pass verifier 8/8 |

**Previously closed (unchanged):** D-HRM-SET-ITEM-PERSIST-01 · GWC-HRM-PAY-STATUS-CELL-01 · GWC-HRM-RPT-HEADCOUNT-01 (BY-DESIGN) · GWC-HRM-INS-EMPTY-MASK-01 · GWC-HRM-WAVE2-QA-01.

---

## Menu roster update (`P1-HRM-FULL-MENU-QA-PROGRAM`)

| # | Menu | Prior (regate QC) | After this gate |
|---|------|-------------------|-----------------|
| 5 | RECRUITMENT | **FAIL** · UF-HRM-12 🔴 | **PASS** · UF-HRM-12 🟢 |
| 12 | TOOLS | deferred / no evidence | **⚪ deferred** · honesty evidence OK |

**Tally:** **16 PASS** + **1 deferred (tools, evidenced)** = **17/17 menu rows have evidence** (PASS or formal defer). Program exit **met for menu coverage** on Dev8088 group CEO slice.

**Still NOT claimed:** Phase 1 DONE · PROD-READY · Tools live CRUD.

---

## Verdict rationale

1. QA evidence is complete U65 browser chain on `:8088` @ **397ac81**: mutate PATCH/POST → FE after 2xx → F5 persist; J-HRM-05 detail GET **200**; no eval storm or 429.
2. Matrix confirms **UF-HRM-12 🟢** with evidence link — prior recruitment P0 GWC **CLOSED**.
3. Tools honesty lane **PASS** acknowledged; menu remains **⚪ deferred** — QC explicitly does **not** promote Tools CRUD.
4. Evidence pack verifier fails are **PROCESS-only** (schema); product signals authoritative per established full-menu QC precedent.
5. Full-menu program rollup: **GO WITH CONDITIONS** — P2 chart/dept residuals only; **no P0/P1 product blockers** remain on audited roster.
6. **NOT** Phase 1 DONE · **NOT** PROD-READY.

**Decision: GO** for `GWC-HRM-REC-UF12-01` (recruitment blocker closed).

**Program rollup: GO WITH CONDITIONS** for `P1-HRM-FULL-MENU-QA-PROGRAM` — P2 carry only; tools ⚪ deferred by design.

---

## Residual / not promoted

| Item | Owner | Blocks recruitment GO? | Blocks program DONE claim? |
|------|-------|--------------------------|----------------------------|
| Tools live CRUD | Phase 2 / sponsor | No | Yes (until scope change) |
| R-DASH-PAYROLL-CHART-0 | fe/be | No | No |
| R-DEPT-FETCH-X2 | fe | No | No |
| Phase 1 / PROD gate | pm/qc | No | Yes |
| QA evidence pack schema | qa | No | No |

---

## Handoff packet

- `work_item_id:` `GWC-HRM-REC-UF12-01-QC`
- `from_role:` qc
- `to_role:` pm
- `ack_status:` **PASS_TO_PM**
- `evidence_path:` `docs/qa/evidence/qc-gwc-hrm-rec-uf12-01-20260717.md`
- `completion_report:` |
  QC **GO** on recruitment GWC re-gate. **CLOSED:** GWC-HRM-REC-UF12-01 (UF-HRM-12 🟢, J-HRM-05 PASS @397ac81); GWC-HRM-TOOLS-01 as deferred-with-evidence (honesty PASS, **not** CRUD). Full-menu program rollup **GO WITH CONDITIONS** — 16 PASS + 1 ⚪ deferred; P2 only (chart zeros, dept GET×2). U65 no seed. **NOT** Phase 1 DONE · **NOT** PROD.
- `next_owner:` **pm**
- `next_dispatch_prompt:` |
  ```text
  work_item_id: P1-HRM-FULL-MENU-QC-CLOSE-01
  from_role: pm
  to_role: qc
  entry_criteria: GWC-HRM-REC-UF12-01 CLOSED docs/qa/evidence/qc-gwc-hrm-rec-uf12-01-20260717.md; roster 16 PASS + tools ⚪ deferred; no P0 open on full-menu program
  task: Optional program-close QC — confirm P1-HRM-FULL-MENU-QA-PROGRAM exit (17/17 evidenced) on Dev8088 group CEO; audit P2 residuals R-DASH-PAYROLL-CHART-0 + R-DEPT-FETCH-X2 as non-blocking; update PROJECT_STATUS_REPORT + USER_FLOW_OPERABILITY_MATRIX summary if sponsor requests program sign-off. Cấm: Phase 1 DONE / PROD / Tools CRUD promotion / seed.
  exit_criteria: GO or GWC program evidence docs/qa/evidence/qc-p1-hrm-full-menu-close-20260717.md; ack_status PASS_TO_PM
  Parallel backlog (non-blocking): dev-fe R-DASH-PAYROLL-CHART-0 + R-DEPT-FETCH-X2; qa fix evidence-pack schema on gwc-hrm-rec + tools MD (P3)
  ```

---

## QC sign-off

| Role | Name | Decision | Date |
|------|------|----------|------|
| QC | QC Manager (subagent) | **GO** (recruitment GWC) · **GWC** (program P2 carry) | 2026-07-17 |
