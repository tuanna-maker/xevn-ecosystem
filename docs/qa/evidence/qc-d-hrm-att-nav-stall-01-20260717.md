# QC Gate — D-HRM-ATT-NAV-STALL-01-QC (COND-SCALE-W2-ATT-NAV CLOSED)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-ATT-NAV-STALL-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 `http://14.225.217.232:8088` · HRM Vite `:8080` |
| **portal_url** | `http://14.225.217.232:8088` |
| **PORTAL_DEV_URL** | `http://14.225.217.232:8088` |
| **persona** | Group CEO `ceo@xe.vn` · BOD · `companyId=main` · `tenantId=xevn` |
| **deploy HEAD** | `96651c7` (`fix(hrm): soft-nav leaving Attendance no longer stalls on old Outlet`) |
| **decision** | **GO WITH CONDITIONS** — P1 soft-nav **CLOSED**; Scale W2 residual register without ATT-NAV |
| **scope_claim** | Close `COND-SCALE-W2-ATT-NAV` / `D-HRM-ATT-NAV-STALL-01` only |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no seed in FE/ENV/QA/QC chain |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA matrix rows 1–5 soft-nav Att→Emp/Contracts ×2 + J-HRM-02 | Phase 1 DONE · PROD-READY |
| Confirm prior `BLOCKED-ENV` superseded by ENV READY + retest PASS | Reopen soft-nav FAIL without counter-evidence |
| Mark **`COND-SCALE-W2-ATT-NAV` CLOSED** | W1 profile dedupe CLOSED (stays CLOSED) |
| Amend Scale W2 GWC residual register | Insurance list fan-out / a11y / admin-companies / W3 T-CONC (remain open) |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/d-hrm-att-nav-stall-01-qa-20260717.md` | QA retest | **PASS_TO_PM** — matrix 1–5 PASS after ENV |
| `docs/qa/evidence/d-hrm-att-nav-stall-01-env-20260717.md` | DevOps ENV | **READY_FOR_QA** — `react-dom.js` 200; `#root` mounts |
| `docs/qa/evidence/d-hrm-att-nav-stall-01-deploy-20260717.md` | DevOps deploy | HEAD `96651c7` on wire |
| `docs/qa/evidence/d-hrm-att-nav-stall-01-20260717.md` | Dev-FE | `v7_startTransition` off + `applyPortalEmbedSoftNavigate`; vitest 7/7 |
| `docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md` | QC prior | GWC; **`COND-SCALE-W2-ATT-NAV` OPEN** (superseded below) |
| Screenshots | QA | softnav-emp / softnav-contracts / jhrm02-profile / jhrm02-list-back |

**Prior FAIL superseded:** Same QA file earlier revision `BLOCKED-ENV` (Vite `react-dom.js` 504 / blank `#root`) — **not** product soft-nav FAIL. ENV repair + retest clears that class.

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/d-hrm-att-nav-stall-01-qa-20260717.md` | **FAIL** exit **1** (2/8) | **PROCESS** — missing `command_table` + `portal_url` schema only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-d-hrm-att-nav-stall-01-20260717.md` | **PASS** exit **0** (8/8) | This gate file |
| ENV curl `react-dom.js` `:8080` + `:8088/hr/` | **200** | ENV — `d-hrm-att-nav-stall-01-env-20260717.md` |
| Deploy L0 `GET http://127.0.0.1:8088/` | **200** | ENV — deploy evidence |
| FE vitest soft-nav helpers | **7/7 PASS** | PRODUCT — FE evidence |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` · HEAD **96651c7**.

**QC adjudication:** PROCESS GWC on QA pack format (precedent Scale W1/W2). Browser U65 click path + Network + screenshots + ENV READY are complete — **not** product NO-GO.

---

## Audit checklist (PM exit 1–4)

| # | Criteria | QA / ENV signal | QC verdict |
|---|----------|-----------------|------------|
| 1 | Soft-nav Att → Nhân sự without F5; employees GET; not stuck Overview | Round 1+2 spa `/hr/employees`; «Quản lý nhân viên»; `stuckOnOverview=false`; Round 2 `GET …/employees?…page=1` **200** | **PASS** |
| 2 | Soft-nav Att → Hợp đồng without F5 | spa `/hr/contracts`; contracts GET **200**; UI remount | **PASS** |
| 3 | Repeat leave directions ×2 | Att→Emp ×2; Att→Contracts ×2 | **PASS** |
| 4 | J-HRM-02 list→profile→back; `_v` stable; emp↔contracts | Profile HLD-0996; `history.back` → list; `_v=1784274383615` unchanged; console P0=**[]** | **PASS** |
| 5 | Console P0=0 | Portal + iframe hooks empty | **PASS** |
| ENV | Prior BLOCKED-ENV superseded | ENV READY + preflight `react-dom.js` 200 + `#root` non-empty before soft-nav AC | **PASS** — superseded |
| Gate | **`COND-SCALE-W2-ATT-NAV` CLOSED** | This QC | **CLOSED** |

**QC visual spot-check:** `d-hrm-att-nav-stall-01-qa-softnav-emp-1-20260717.png` shows Employees body («Quản lý nhân viên» + rows) — **not** Attendance Overview while sidebar Nhân sự (original W2 stall pattern cleared). Contrasts prior W2 stall shot `p1-hrm-scale-qa-w2-att-emp-stall-20260717.png`.

---

## Classification

| Signal | Type | QC verdict |
|--------|------|------------|
| Soft-nav leave Attendance remounts target UI | **PRODUCT** / P1 | **PASS** — defect **CLOSED** |
| Prior Vite `react-dom.js` 504 / blank `#root` | **ENV** | **CLEARED** — ENV READY + retest |
| Nested orphan `@supabase/*` under hrm-fe | **ENV** / P3 hygiene | Residual — may re-break Vite optimize; **non-blocking** this GO |
| QA pack verify 2/8 FAIL | **PROCESS** | **GWC** — format only |
| Seed used | **PROCESS** | **PASS** — none (U65) |
| Insurance list page=1..11 | **PRODUCT** / P2 | Still open (Scale W2) |
| Radix DialogTitle a11y | **PRODUCT** / P3 | Still open |
| `admin/companies` total 0 | **DATA** / P3 | Still open |
| T-CONC 1000 VU | **NFR** / W3 | Still open |
| Phase 1 / PROD | **PROGRAM** | **NOT CLAIMED** |

---

## L2.5 — J-* cited

| J-ID | Journey | QA evidence | L2.5 verdict | Promotable this slice |
|------|---------|-------------|--------------|------------------------|
| **J-HRM-02** | list → profile → back; emp↔contracts soft-nav | `d-hrm-att-nav-stall-01-qa-20260717.md` §J-HRM-02 | **PASS** | **YES** Dev8088 group CEO soft-nav retest |
| Attendance soft-nav **out** (W2 condition class) | Att → Emp / Contracts ×2 | §Exit criteria 1–3 | **PASS** | **YES** — closes prior W2 FAIL condition |
| Other J-HRM-* | — | Not re-gated this work item | **NOT RE-GATED** | — |

---

## Condition register (Scale W2 — amended)

| ID | Severity | Status after this gate | Owner |
|----|----------|------------------------|-------|
| **`COND-SCALE-W2-ATT-NAV`** / `D-HRM-ATT-NAV-STALL-01` | P1 | **CLOSED** 2026-07-17 | — |
| **`COND-SCALE-W2-PICKER`** | — | **CLOSED** (prior W2 QC) | — |
| **`COND-SCALE-W2-INS-LIST-FANOUT`** | P2 | **OPEN** | `dev-fe` |
| **`COND-SCALE-W2-A11Y-DIALOG`** | P3 | **OPEN** | `dev-fe` |
| **`COND-SCALE-W2-ADMIN-COMPANIES`** | P3 | **OPEN** | `dev-be` |
| **`COND-SCALE-W2-DEPT-FILTER`** | P3 | **OPEN** | `dev-fe` |
| **`COND-SCALE-W3-CONC`** | NFR | **OPEN** | `devops` |
| **`COND-SCALE-PACK-FORMAT`** | Process | **OPEN** | `qa` |
| ENV nested `@supabase` hygiene | P3 | **OPEN** (hygiene) | `devops`/`dev-fe` |

**Scale FE W2 overall:** remains **GO WITH CONDITIONS** — picker CLOSED + ATT-NAV **CLOSED**; residuals above only (no nav-stall).

---

## Residual risk statement

P1 soft-nav leave Attendance is closed on Dev8088 @ `96651c7` after ENV Vite repair. Remaining Scale W2 risk is insurance **list** fan-out (P2), a11y/admin-companies/dept-filter (P3), and W3 concurrency — **not** Attendance soft-nav. Nested orphan supabase under hrm-fe may recreate Vite 504 if optimize re-runs — hygiene, not product reopen. This gate does **not** claim Phase 1 DONE or PROD-READY.

---

## ADR / ledger update

| Wave | Status after this gate |
|------|------------------------|
| ADR W2 FE picker | **CLOSED** (unchanged) |
| ADR W2 FE **`D-HRM-ATT-NAV-STALL-01`** | **CLOSED** — QC `qc-d-hrm-att-nav-stall-01-20260717.md` |
| ADR W2 FE residual | insurance list fan-out P2 (+ P3s) |
| ADR W3 T-CONC | **OPEN** |

Amended: `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §1.2 / §6; Scale W2 QC ledger note below.

### Scale W2 QC ledger amendment

Prior: `docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md` listed **`COND-SCALE-W2-ATT-NAV` OPEN**.  
**Superseding close:** this file — condition **CLOSED**; do not reopen without new browser counter-evidence of Attendance Overview stall.

---

## Handoff packet

- `work_item_id`: `D-HRM-ATT-NAV-STALL-01-QC`
- `from_role`: `qc`
- `to_role`: `pm`
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/qc-d-hrm-att-nav-stall-01-20260717.md`
- `completion_report`: **GO WITH CONDITIONS** for closing **`COND-SCALE-W2-ATT-NAV`**. QA matrix 1–5 PASS; prior BLOCKED-ENV superseded by ENV READY + retest; J-HRM-02 PASS; `_v` stable; console P0=0; U65; PROCESS GWC on QA pack format. Scale W2 remains GWC with residuals = insurance list P2 + a11y/admin-companies/dept-filter P3 + W3 T-CONC only — **nav-stall CLOSED**. **NOT** Phase 1 DONE / **NOT** PROD.
- `next_owner`: `pm` → optional P2 insurance list **or** idle / W3 when capacity

### next_dispatch_prompt (optional P2 — recommended)

```text
work_item_id: P1-HRM-SCALE-FE-W2-INS-LIST
from_role: pm
to_role: dev-fe
subagent_type: dev-fe
entry_criteria: D-HRM-ATT-NAV-STALL-01-QC GWC; COND-SCALE-W2-ATT-NAV CLOSED; COND-SCALE-W2-INS-LIST-FANOUT still OPEN; evidence docs/qa/evidence/qc-d-hrm-att-nav-stall-01-20260717.md
read_first: docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md; ADR-HRM-SCALE-1000-USERS §6; insurance list mount Network page=1..11
spec_ref: ADR T-FANOUT insurance list (not picker)
exit_criteria: /hr/insurance mount ≤1–2 list GETs (no 11-page dump); vitest; READY_FOR_QA
evidence_path: docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-20260717.md
cấm: seed; regress W2 picker or ATT-NAV soft-nav; Phase 1/PROD claim
```

### next_dispatch_prompt (idle / W3 alternate)

```text
work_item_id: P1-HRM-SCALE-DO-W3
from_role: pm
to_role: devops
subagent_type: devops
entry_criteria: COND-SCALE-W2-ATT-NAV CLOSED; COND-SCALE-W3-CONC open; ADR §6 W3
read_first: ADR §5.5 T-CONC; docs/ops/PRODUCTION_ENABLE_RUNBOOK.md
exit_criteria: 1000 concurrent staged ramp evidence; error rate <1%; list p95 budget documented; PASS_TO_PM
evidence_path: docs/qa/evidence/p1-hrm-scale-do-w3-20260717.md
cấm: seed; claim PROD from load test alone without QC gate
```
