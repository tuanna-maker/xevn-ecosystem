# QC Gate — QC-HRM-G-DEC-01-DENSITY-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-G-DEC-01-DENSITY-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` (ICT ~19:25) |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO session on `:8088` (rollup «Tổng giám đốc tập đoàn») |
| **decision** | **GO WITH CONDITIONS** — **G-DEC-01 density sample CLOSED** (AC-DEC-02 / AC-DEC-04 / AC-DEC-DENSITY) |
| **scope_claim** | Decisions density only: empty honesty + FE create→list→F5 on `/hr/decisions` |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **uc_hrm_27_done_claim** | **NO** — AC-DEC-DONE / UC-HRM-27 product DONE **not** claimed |
| **jwt_p_cc_01** | **CLOSED elsewhere — not reopened** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser-only; **no** `pnpm seed:*` in FE/QA/QC chain |

---

## Scope (bounded — density sample)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Audit QA UF-DEC-EMPTY / CREATE-LIST / F5 vs AC-DEC-* | Full UC-HRM-27 product DONE · Phase1 · PROD |
| Sample-verify Dev8088 row persist | JWT / P-CC-01 reopen |
| Close TechSpec **G-DEC-01** density status | Seed · claim fidelity beyond density |
| Residual register (matrix / process pack) | Attendance AC-ATT-SHEET mutate |

**spec_ref:** UC-HRM-27 / FR-HRM-27 · AC-DEC-02 · AC-DEC-04 · AC-DEC-DENSITY · TechSpec §16.5 #50 · §16.9 **G-DEC-01**

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/fe-hrm-g-dec-01-density-01-20260722.md` | Dev-FE | READY_FOR_QA — live-empty + create visibility reset; vitest **10 PASS** |
| `docs/qa/evidence/qa-hrm-g-dec-01-density-01-20260722.md` | QA primary | PASS_TO_PM — UF-DEC-EMPTY / CREATE-LIST / F5 🟢; POST **201** `HRM-DEC-201`; U65 |
| `docs/hrm/SRS.md` UC-HRM-27 | Spec | AC-DEC-02/04/DENSITY; BR-DEC-03/06; AC-DEC-DONE separate |
| `docs/hrm/TECHSPEC.md` §16.9 | Gap SoT | **G-DEC-01** → **CLOSED density** (this gate) |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-MENU-05 | Matrix | still load/empty note — promote residual |

---

## Micro-checklist (≤5)

| # | Item | Result |
|---|------|--------|
| 1 | Audit QA UF blocks vs AC-DEC-02 / 04 / DENSITY | **PASS** — empty honesty; POST 201→list; F5; no «chưa triển khai»; no UC-27 DONE claim |
| 2 | Sample-verify `:8088` **or** accept QA log | **PASS** — **method: QC browser sample** (see below) + QA Network log accepted as primary mutate evidence |
| 3 | Verdict GO/GWC — density only; no UC-27/Phase1/PROD | **GWC** — density CLOSED; product DONE **not** claimed |
| 4 | Residuals + TechSpec G-DEC-01 density CLOSED | **PASS** — TechSpec §11.2 / §16.5 #50 / §16.9 updated |
| 5 | This evidence + handoff | **PASS** — `PASS_TO_PM` |

---

## AC / UF audit (vs QA)

| AC / UF | QA | QC adjudication |
|---------|----|-----------------|
| **AC-DEC-02** / UF-DEC-EMPTY | 🟢 «Không có quyết định nào»; forbidden absent | **PASS** — matches SRS |
| **AC-DEC-04** / UF-DEC-CREATE-LIST | 🟢 POST 201 `HRM-DEC-201` id `e1052924-…`; list **Tất cả 1** | **PASS** — FE sau 2xx |
| **AC-DEC-DENSITY** / UF-DEC-F5 | 🟢 ≥1 QSĐ via FE; F5 persist | **PASS** — sample confirms row still present |
| **AC-DEC-DONE** / UC-HRM-27 DONE | not claimed | **PASS process** — correctly withheld |
| **AC-ATT-SHEET** must_keep | not touched | **PASS** |

---

## Sample verify (QC) — method

**Method:** Direct browser sample on `http://14.225.217.232:8088/hr/decisions` (Cursor browser MCP + `Runtime.evaluate`) — **not** re-run create (row already from QA U65). Mutate Network path accepted from QA evidence.

| Check | Result |
|-------|--------|
| URL reachable | HTTP **200** (HTML) |
| Session | Active rollup Group CEO — no login wall |
| Row `QĐ-QA-DEC-220726-01` | **Present** |
| Title `QA density U65 — bổ nhiệm kiểm thử G-DEC-01` | **Present** |
| Tabs | **Tất cả 1** / **Bổ nhiệm 1** |
| Footer | `Hiển thị 1 - 1 trong số 1 bản ghi` |
| Forbidden «chưa triển khai» | **Absent** |
| Error / Sync ERROR banner | **Absent** (`hasError: false`) |

Local `pnpm run qc:dev-stack` → **FAIL** (28001/28002/5173) — **ENV**; product gate used VPS `:8088` (same as QA).

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run qc:dev-stack` | **FAIL** exit **1** — local APIs down | **ENV** |
| `Invoke-WebRequest http://14.225.217.232:8088/hr/decisions` | **PASS** status **200** | ENV — portal live |
| FE vitest (cited FE evidence) | **10 PASS** exit **0** | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-g-dec-01-density-01-20260722.md` | **FAIL** exit **1** (2/8) — missing `command_table` + explicit `J-*` | **PROCESS** P3 |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-g-dec-01-density-01-20260722.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |
| `pnpm run pm:scan:backlog` | exit **2** — dispatchRequired includes DEC density + BOOT + JWT | GOVERNANCE — PM triage |

**Portal URL:** `PORTAL_DEV_URL=http://14.225.217.232:8088`

### L2.5 / journey coverage

| J-ID / UF | Status | Note |
|-----------|--------|------|
| **UF-DEC-EMPTY / CREATE-LIST / F5** (density slice) | **PASS** | QA + QC sample — create→list→persist |
| **UF-HRM-MENU-05** Decisions | **PASS load+density sample** | Matrix row still «empty allowed» wording — promote residual |
| **J-HRM-MENU-SWEEP** leaf decisions | **PASS (sample)** | Density path closed; full 17-leaf sweep not re-run |
| **J-HRM-01..08** mutate cross-nav | **N/A / deferred** | Not in G-DEC-01 density entry criteria |
| JWT / **P-CC-01** | **not reopened** | Wave CLOSED — out of this gate |

### CRUD / density matrix

| Module | Create | Read | Update | Delete | Note |
|--------|--------|------|--------|--------|------|
| HRM Decisions (`/hr/decisions`) | **PASS** FE POST 201 | **PASS** list+F5 | N/A this wave | N/A | G-DEC-01 density |
| Empty honesty | N/A | **PASS** AC-DEC-02 | — | — | live-empty OK |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Empty «Không có quyết định nào»; no stub copy | PRODUCT | **PASS** |
| FE create → POST **201** → row on list | PRODUCT | **PASS** (QA Network + FE after 2xx) |
| F5 / reload row persist | PRODUCT | **PASS** (QA + QC sample) |
| Seed used to invent density | PROCESS U65 | **PASS** — none |
| Local L0 stack down | ENV | OPEN — non-blocking (VPS used) |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — format-only; substance OK (precedent ATT-SHEET / OA-CC-CAT) |
| Matrix UF-HRM-MENU-05 density note | GOVERNANCE | **OPEN P3** — PM/BA promote |
| UC-HRM-27 / Phase1 / PROD DONE | OUT OF SLICE | **NOT claimed** |
| JWT P-CC-01 | OUT OF SLICE | **not reopened** |

---

## Residual register

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-DEC-UC27-DONE** | — | pm | UC-HRM-27 product DONE requires **AC-DEC-DONE** (01..04 + DENSITY + QC) — density alone ≠ DONE |
| **R-DEC-MATRIX-05** | P3 | ba / pm | Update `USER_FLOW_OPERABILITY_MATRIX` UF-HRM-MENU-05 note: density sample CLOSED Dev8088 |
| **R-DEC-QA-PACK** | P3 | qa | Optional: add command_table + J-* cite to QA MD for Layer B 8/8 |
| **R-ENV-L0-LOCAL** | ENV | devops | Local `qc:dev-stack` FAIL — workstation only |
| JWT / P-CC-01 | — | — | **Do not reopen** in follow-up from this gate |

**No residual** blocking G-DEC-01 **density** close.

---

## Verdict

**GO WITH CONDITIONS** — TechSpec **G-DEC-01 density CLOSED** on Dev8088 U65 (empty + create→list→F5).

**Conditions / non-claims:**
1. **NOT** UC-HRM-27 product DONE (AC-DEC-DONE still owns full DONE).
2. **NOT** Phase 1 DONE · **NOT** PROD-READY.
3. PROCESS P3 QA pack format + matrix promote — non-blocking.
4. JWT / P-CC-01 **not** in scope — do not reopen.

---

## completion_report

**Closed:** QC-HRM-G-DEC-01-DENSITY-01 — audited FE+QA chain; sample-verified row `QĐ-QA-DEC-220726-01` on `:8088`; AC-DEC-02/04/DENSITY **PASS**; TechSpec G-DEC-01 density **CLOSED**; U65 zero-seed; JWT not reopened.

**Residual:** UC-27 product DONE withheld; matrix UF-HRM-MENU-05 promote P3; QA Layer B format P3; local L0 ENV.

**ack_status:** PASS_TO_PM

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PM-INTAKE-G-DEC-01-DENSITY-CLOSED
from_role: qc
to_role: pm
lane: governance
priority: P1
entry_criteria: QC GWC docs/qa/evidence/qc-hrm-g-dec-01-density-01-20260722.md · TechSpec G-DEC-01 density CLOSED
cấm: claim UC-HRM-27 / Phase1 / PROD DONE · reopen P-CC-01 JWT · seed

PM actions (same turn):
1) Bus INTAKE QC-HRM-G-DEC-01-DENSITY-01 → CLOSED density; clear evidence-handoff HRM-G-DEC-01-DENSITY-01-20260722
2) Do NOT Task JWT P-CC-01 from this residual
3) Next P1 (pick one, Task same turn):
   A) Close/ack HRM-G-BOOT-01-VERIFY-01 as already CLOSED (be-hrm-g-boot-01-verify-01 + TechSpec G-BOOT-01) — avoid duplicate QA
   B) Else dispatch QA P0 VERIFY G-RC-01 (TechSpec §16.9) — U65 create→list→F5 headcount — evidence docs/qa/evidence/qa-hrm-g-rc-01-verify-…
4) Optional P3: BA promote UF-HRM-MENU-05 density note in USER_FLOW_OPERABILITY_MATRIX.md
```
